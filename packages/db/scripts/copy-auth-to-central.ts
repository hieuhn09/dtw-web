// Copy auth + reader-data rows from the per-site DTW DB (public schema) into
// the central Neon DB (dtw_auth schema) — the data step of the 08-2026
// auth-central migration (apc/AUTH_CENTRAL_MIGRATION_PLAN.md).
//
// Idempotent: every insert is ON CONFLICT DO NOTHING, so re-running only fills
// gaps. Run AFTER `db:migrate` has created the dtw_auth schema on the central DB.
//
// Usage (URLs on purpose NOT read from .env to avoid copying to/from the wrong
// database by accident — pass both explicitly):
//
//   COPY_SOURCE_URL="postgres://...dtw-prod..." \
//   COPY_TARGET_URL="postgres://...central-DIRECT..." \
//   pnpm --filter @dtw/db exec tsx scripts/copy-auth-to-central.ts
//
// COPY_SOURCE_URL — DTW site DB (tables in `public`). Pooled is fine.
// COPY_TARGET_URL — central Neon DB, DIRECT (non-pooler) endpoint preferred.

import postgres from "postgres";

const sourceUrl = process.env.COPY_SOURCE_URL;
const targetUrl = process.env.COPY_TARGET_URL;
if (!sourceUrl || !targetUrl) {
  console.error("Set COPY_SOURCE_URL and COPY_TARGET_URL explicitly (not read from .env).");
  process.exit(1);
}
if (sourceUrl === targetUrl) {
  console.error("COPY_SOURCE_URL and COPY_TARGET_URL are identical — refusing to run.");
  process.exit(1);
}

// FK order: auth_users first (everything references it), sessions/accounts/
// verifications next, reader tables after.
const TABLES = [
  "auth_users",
  "auth_accounts",
  "auth_sessions",
  "auth_verifications",
  "bookmarks",
  "reading_queue",
  "reading_history",
  "follows",
  "newsletter_subscriptions",
  "pending_newsletter_confirmations",
  "article_views",
] as const;

const BATCH = 1000;

const src = postgres(sourceUrl, { max: 2, idle_timeout: 20, connect_timeout: 15 });
const dst = postgres(targetUrl, { max: 2, idle_timeout: 20, connect_timeout: 15 });

const count = async (sql: postgres.Sql, qualified: string): Promise<number> => {
  const r = await sql.unsafe(`SELECT count(*)::int AS n FROM ${qualified}`);
  return (r[0] as unknown as { n: number }).n;
};

let failed = false;

for (const table of TABLES) {
  const from = `public."${table}"`;
  const to = `dtw_auth."${table}"`;

  const sourceCount = await count(src, from);
  const targetBefore = await count(dst, to);

  let copied = 0;
  const cursor = src.unsafe(`SELECT * FROM ${from}`).cursor(BATCH);
  for await (const rows of cursor) {
    if (rows.length === 0) continue;
    const columns = Object.keys(rows[0]!);
    await dst`INSERT INTO ${dst.unsafe(to)} ${dst(
      rows as Record<string, unknown>[],
      ...(columns as [string, ...string[]])
    )} ON CONFLICT DO NOTHING`;
    copied += rows.length;
  }

  const targetAfter = await count(dst, to);
  const ok = targetAfter >= sourceCount;
  if (!ok) failed = true;
  console.log(
    `[copy] ${table.padEnd(34)} source=${String(sourceCount).padStart(7)}  ` +
      `target ${String(targetBefore).padStart(7)} -> ${String(targetAfter).padStart(7)}  ` +
      `scanned=${String(copied).padStart(7)}  ${ok ? "OK" : "MISMATCH"}`
  );
}

await src.end();
await dst.end();

if (failed) {
  console.error("[copy] MISMATCH: at least one table has fewer rows on the central side than the source.");
  process.exit(1);
}
console.log("[copy] done — every table's central count >= source count.");
