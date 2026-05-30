// Production migration runner — invoked by `pnpm vercel-build` BEFORE the build.
//
// Strategy (chosen 2026-05-29): auto-migrate on the production deploy only.
// Migrations are idempotent (each tool records applied migrations and skips
// them), so running on every prod deploy is a no-op when nothing is pending.
// Running BEFORE the build means a bad migration fails the deploy and the old
// version stays live, and the build's homepage prerender sees the new schema.
//
// Guarded to VERCEL_ENV=production: preview/dev builds skip, so they never
// touch the production schema. (Upgrade path: Neon ephemeral branches per
// preview via the Neon–Vercel integration.)
import { execSync } from "node:child_process";

const env = process.env.VERCEL_ENV ?? "local";

if (env !== "production") {
  console.log(`[migrate] VERCEL_ENV=${env} — skipping migrations (production only).`);
  process.exit(0);
}

// DDL must go over the DIRECT (non-pooled) endpoint — pgbouncer transaction
// pooling breaks some DDL/session features. Both Payload and Drizzle read
// DATABASE_URL, so override it for these subprocesses only.
const direct = process.env.DATABASE_DIRECT_URL ?? process.env.DATABASE_URL;
if (!process.env.DATABASE_DIRECT_URL) {
  console.warn(
    "[migrate] DATABASE_DIRECT_URL not set — falling back to DATABASE_URL (pooled). " +
      "DDL over pgbouncer can fail; set DATABASE_DIRECT_URL in the Vercel dashboard."
  );
}
if (!direct) {
  console.error("[migrate] No database URL available. Set DATABASE_DIRECT_URL on Vercel.");
  process.exit(1);
}

const runEnv = { ...process.env, DATABASE_URL: direct };
const run = (cmd) => {
  console.log(`[migrate] $ ${cmd}`);
  // stdio inherit so migration output streams into the Vercel build log; a
  // non-zero exit throws here, which aborts `&& turbo run build`.
  execSync(cmd, { stdio: "inherit", env: runEnv });
};

// Drizzle (auth_* tables) first, then Payload (its collections). Call the
// binaries directly — the package `db:migrate` script wraps dotenv-cli reading
// .env.local, which doesn't exist on Vercel.
run("pnpm --filter @dtw/db exec drizzle-kit migrate");
run("pnpm --filter web payload:migrate");

console.log("[migrate] done.");
