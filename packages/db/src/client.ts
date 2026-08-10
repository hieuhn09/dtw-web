import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";

/**
 * Shared Postgres client. Long-lived in production, single connection in dev.
 *
 * Apps that need the DB should import from `@dtw/db/client`:
 *
 *   import { db } from "@dtw/db/client";
 *   const articles = await db.query.articles.findMany({ limit: 10 });
 *
 * The connection URL comes from `AUTH_DATABASE_URL` (central Neon DB, pooled
 * -pooler endpoint — auth + reader-data live there in the `dtw_auth` schema
 * since the 08-2026 auth-central migration), falling back to `DATABASE_URL`
 * so local dev keeps working with a single URL. In Next.js + Vercel the
 * environment is set per deploy; in local dev it lives in `.env.local`.
 */

const databaseUrl = process.env.AUTH_DATABASE_URL ?? process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "Neither AUTH_DATABASE_URL nor DATABASE_URL is set. Copy .env.example → .env.local and run `pnpm db:up`."
  );
}

// Reuse the connection across HMR reloads in dev.
declare global {
  // eslint-disable-next-line no-var
  var __dtwPgClient: ReturnType<typeof postgres> | undefined;
}

const client =
  globalThis.__dtwPgClient ??
  postgres(databaseUrl, {
    // Edge runtimes / Vercel functions: keep the pool small.
    max: process.env.NODE_ENV === "production" ? 5 : 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__dtwPgClient = client;
}

export const db = drizzle(client, { schema });
export type DB = typeof db;
