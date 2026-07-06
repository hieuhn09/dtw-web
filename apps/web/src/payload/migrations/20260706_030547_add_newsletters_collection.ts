import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "newsletters" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"cadence" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"vertical_id" integer,
  	"active" boolean DEFAULT true,
  	"order" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "newsletters_id" integer;
  ALTER TABLE "newsletters" ADD CONSTRAINT "newsletters_vertical_id_pillars_id_fk" FOREIGN KEY ("vertical_id") REFERENCES "public"."pillars"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "newsletters_name_idx" ON "newsletters" USING btree ("name");
  CREATE UNIQUE INDEX "newsletters_slug_idx" ON "newsletters" USING btree ("slug");
  CREATE INDEX "newsletters_vertical_idx" ON "newsletters" USING btree ("vertical_id");
  CREATE INDEX "newsletters_updated_at_idx" ON "newsletters" USING btree ("updated_at");
  CREATE INDEX "newsletters_created_at_idx" ON "newsletters" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletters_fk" FOREIGN KEY ("newsletters_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_newsletters_id_idx" ON "payload_locked_documents_rels" USING btree ("newsletters_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "newsletters" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "newsletters" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_newsletters_fk";
  
  DROP INDEX "payload_locked_documents_rels_newsletters_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "newsletters_id";`)
}
