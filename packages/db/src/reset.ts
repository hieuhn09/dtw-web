// DESTRUCTIVE — drops the entire `public` schema and recreates it.
// Used during E3 restructure (Payload takes over editorial tables). Do not
// run this against any database with real data.

import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL required");
}

const sql = postgres(url);

const before = await sql<{ count: string }[]>`
  SELECT count(*)::text AS count FROM information_schema.tables WHERE table_schema = 'public'
`;
console.log(`[reset] ${before[0]!.count} tables in public before drop`);

await sql.unsafe(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);

const after = await sql<{ count: string }[]>`
  SELECT count(*)::text AS count FROM information_schema.tables WHERE table_schema = 'public'
`;
console.log(`[reset] ${after[0]!.count} tables after recreate (should be 0)`);

await sql.end();
process.exit(0);
