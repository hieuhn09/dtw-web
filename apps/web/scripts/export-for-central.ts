/**
 * Read-only export of DTW's editorial data to NDJSON for central-cms's
 * migrate:import. Uses the Payload LOCAL API (no running server, no admin login,
 * no writes). dtw-web's config has push:false so it's safe against prod; we also
 * set NODE_ENV=production for belt-and-braces.
 *
 *   NODE_ENV=production DATABASE_URL='<dtw-prod>' \
 *     EXPORT_DIR='<abs>/central-cms/migration-data/dtw' \
 *     pnpm --filter web exec tsx scripts/export-for-central.ts
 *
 * Localized fields come out as {en,vi,...} (locale=all); articles are fetched as
 * drafts too (merged, draft preferred) to capture latest state.
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Load repo-root .env.local (for PAYLOAD_SECRET etc.) WITHOUT overriding anything
// already set inline (so the inline DATABASE_URL / NODE_ENV win). Mirrors
// scripts/seed-payload.ts.
const here = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(here, "../../../.env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    const key = m[1]!;
    let value = m[2]!.trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = value;
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("Set DATABASE_URL to the DTW source DB (inline).");
}

const OUT_DIR =
  process.env.EXPORT_DIR ||
  resolve(process.cwd(), "..", "..", "..", "central-cms", "migration-data", "dtw");

// DTW's real editorial collections (no sub-sections / cities / sectors / podcasts).
const COLLECTIONS = [
  "pillars",
  "tags",
  "authors",
  "media",
  "articles",
  "newsletters",
  "corrections",
  "sponsorSlots",
  "wireDrops",
  "users",
];
const VERSIONED = new Set(["articles"]);

const { getPayload } = await import("payload");
const config = (await import("../payload.config")).default;

async function fetchAll(payload: Awaited<ReturnType<typeof getPayload>>, collection: string, draft: boolean): Promise<Record<string, unknown>[]> {
  const docs: Record<string, unknown>[] = [];
  let page = 1;
  for (;;) {
    const res = await payload.find({
      collection: collection as never,
      depth: 0,
      limit: 100,
      page,
      locale: "all" as never,
      draft,
      overrideAccess: true,
      pagination: true,
    });
    docs.push(...(res.docs as Record<string, unknown>[]));
    if (page >= (res.totalPages || 1)) break;
    page += 1;
  }
  return docs;
}

async function main() {
  const payload = await getPayload({ config });
  mkdirSync(OUT_DIR, { recursive: true });
  for (const collection of COLLECTIONS) {
    try {
      const published = await fetchAll(payload, collection, false);
      const drafts = VERSIONED.has(collection) ? await fetchAll(payload, collection, true) : [];
      const byId = new Map<unknown, Record<string, unknown>>();
      for (const d of published) byId.set(d.id, d);
      for (const d of drafts) byId.set(d.id, d);
      const merged = [...byId.values()];
      const file = resolve(OUT_DIR, `${collection}.ndjson`);
      writeFileSync(file, merged.map((d) => JSON.stringify(d)).join("\n") + "\n", "utf8");
      console.log(`[export] ${collection}: ${merged.length} → ${file}`);
    } catch (err) {
      console.warn(`[export] ${collection} skipped: ${(err as Error).message}`);
    }
  }
  console.log(`[export] done → ${OUT_DIR}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("[export] failed", err);
  process.exit(1);
});
