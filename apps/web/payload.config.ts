import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";

import { Users } from "./src/payload/collections/Users";
import { Pillars } from "./src/payload/collections/Pillars";
import { Authors } from "./src/payload/collections/Authors";
import { Tags } from "./src/payload/collections/Tags";
import { Articles } from "./src/payload/collections/Articles";
import { WireDrops } from "./src/payload/collections/WireDrops";
import { Corrections } from "./src/payload/collections/Corrections";
import { SponsorSlots } from "./src/payload/collections/SponsorSlots";
import { EngineConflictLog } from "./src/payload/collections/EngineConflictLog";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const databaseUrl = process.env.DATABASE_URL;
const payloadSecret = process.env.PAYLOAD_SECRET;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for Payload (set in .env.local)");
}
if (!payloadSecret) {
  throw new Error(
    "PAYLOAD_SECRET is required. Generate with `openssl rand -hex 32` and put in .env.local."
  );
}

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: { titleSuffix: "— DailyTechWire" },
  },
  collections: [
    Users,
    Pillars,
    Authors,
    Tags,
    Articles,
    WireDrops,
    Corrections,
    SponsorSlots,
    EngineConflictLog,
  ],
  editor: lexicalEditor(),
  secret: payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, "src/payload/payload-types.ts"),
  },
  db: postgresAdapter({
    pool: { connectionString: databaseUrl },
    push: false,
    migrationDir: path.resolve(dirname, "src/payload/migrations"),
  }),
  sharp,
  cors: process.env.NODE_ENV === "production" ? [] : ["http://localhost:3000"],
});
