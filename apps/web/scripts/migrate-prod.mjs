// Production migration runner — invoked by `pnpm vercel-build` BEFORE the build.
//
// Since 04-09-2026 this runs ONE tool. The site's embedded Payload is gone (the
// CMS is Central), so the only schema this repo still owns is the Drizzle one:
// auth + reader-data tables in the `dtw_auth` schema on the central Neon DB.
//
// Strategy (chosen 2026-05-29, unchanged): auto-migrate on the production deploy
// only. Migrations are idempotent — the tool records what it applied and skips
// it — so running on every prod deploy is a no-op when nothing is pending.
// Running BEFORE the build means a bad migration fails the deploy and the old
// version stays live, and the build's prerender sees the new schema.
//
// Guarded to VERCEL_ENV=production: preview/dev builds skip, so they never touch
// the production schema.
import { execSync } from "node:child_process";

const vercelEnv = process.env.VERCEL_ENV ?? "local";

if (vercelEnv !== "production") {
  console.log(`[migrate] VERCEL_ENV=${vercelEnv} — skipping migrations (production only).`);
  process.exit(0);
}

// DDL must go over the DIRECT (non-pooled) endpoint — pgbouncer transaction
// pooling breaks some DDL/session features. drizzle.config.ts prefers
// AUTH_DATABASE_DIRECT_URL → AUTH_DATABASE_URL → DATABASE_URL.
if (process.env.AUTH_DATABASE_URL && !process.env.AUTH_DATABASE_DIRECT_URL) {
  console.warn(
    "[migrate] AUTH_DATABASE_URL is set but AUTH_DATABASE_DIRECT_URL is not — " +
      "Drizzle DDL will run over the pooled central URL. PgBouncer can break DDL; " +
      "set AUTH_DATABASE_DIRECT_URL in the Vercel dashboard."
  );
}
if (!process.env.AUTH_DATABASE_URL) {
  console.error(
    "[migrate] AUTH_DATABASE_URL is not set. Auth/reader tables live in the " +
      "dtw_auth schema on the central Neon DB; set it in the Vercel dashboard."
  );
  process.exit(1);
}

const cmd = "pnpm --filter @dtw/db exec drizzle-kit migrate";
console.log(`[migrate] $ ${cmd}`);
// stdio inherit so migration output streams into the Vercel build log; a
// non-zero exit throws here, which aborts `&& turbo run build`.
execSync(cmd, { stdio: "inherit", env: process.env });

console.log("[migrate] done.");
