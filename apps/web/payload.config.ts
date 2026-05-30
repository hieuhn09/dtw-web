import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import sharp from "sharp";

import { Users } from "./src/payload/collections/Users";
import { Media } from "./src/payload/collections/Media";
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

// Cloudflare R2 (S3-compatible) storage for the Media collection. Gated on the
// R2_* env vars: present in deployed envs (required — Vercel disk is ephemeral),
// optional locally (Payload falls back to local disk for dev uploads).
const r2Configured = Boolean(
  process.env.R2_BUCKET &&
    process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY
);

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: { titleSuffix: "— DailyTechWire" },
  },
  collections: [
    Users,
    Media,
    Pillars,
    Authors,
    Tags,
    Articles,
    WireDrops,
    Corrections,
    SponsorSlots,
    EngineConflictLog,
  ],
  plugins: r2Configured
    ? [
        s3Storage({
          collections: { media: true },
          bucket: process.env.R2_BUCKET as string,
          config: {
            endpoint: process.env.R2_ENDPOINT,
            region: "auto", // R2 ignores region but the SDK requires one
            credentials: {
              accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
              secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
            },
            forcePathStyle: true, // R2 requires path-style addressing
          },
        }),
      ]
    : [],
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
