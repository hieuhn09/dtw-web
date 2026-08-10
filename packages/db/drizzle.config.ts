import { defineConfig } from "drizzle-kit";

// Drizzle DDL targets the central auth DB (dtw_auth schema). Prefer the DIRECT
// (non-pooled) central URL — PgBouncer breaks some DDL; then the pooled central
// URL; then plain DATABASE_URL so local dev (single docker DB) keeps working.
const databaseUrl =
  process.env.AUTH_DATABASE_DIRECT_URL ??
  process.env.AUTH_DATABASE_URL ??
  process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "AUTH_DATABASE_URL (or DATABASE_URL) is required. Copy .env.example to .env.local and start Postgres with `pnpm db:up`."
  );
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: { url: databaseUrl },
  strict: true,
  verbose: true,
});
