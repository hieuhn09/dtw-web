import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "ai_models_editor_locked" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" varchar
  );
  
  CREATE TABLE "ai_models" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"rank" numeric,
  	"model" varchar NOT NULL,
  	"maker" varchar NOT NULL,
  	"general" numeric,
  	"reasoning" numeric,
  	"coding" numeric,
  	"math" numeric,
  	"search" numeric,
  	"vision" numeric,
  	"input_price" numeric,
  	"output_price" numeric,
  	"released" timestamp(3) with time zone,
  	"source_slug_llmstats" varchar,
  	"as_of_scores" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "dashboard_methodology" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"ai_methodology_en" varchar NOT NULL,
  	"ai_methodology_vi" varchar,
  	"ai_methodology_ind" varchar,
  	"disclaimer_en" varchar NOT NULL,
  	"disclaimer_vi" varchar,
  	"disclaimer_ind" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "ai_models_id" integer;
  ALTER TABLE "ai_models_editor_locked" ADD CONSTRAINT "ai_models_editor_locked_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ai_models"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "ai_models_editor_locked_order_idx" ON "ai_models_editor_locked" USING btree ("_order");
  CREATE INDEX "ai_models_editor_locked_parent_id_idx" ON "ai_models_editor_locked" USING btree ("_parent_id");
  CREATE INDEX "ai_models_updated_at_idx" ON "ai_models" USING btree ("updated_at");
  CREATE INDEX "ai_models_created_at_idx" ON "ai_models" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_ai_models_fk" FOREIGN KEY ("ai_models_id") REFERENCES "public"."ai_models"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_ai_models_id_idx" ON "payload_locked_documents_rels" USING btree ("ai_models_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ai_models_editor_locked" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ai_models" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "dashboard_methodology" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "ai_models_editor_locked" CASCADE;
  DROP TABLE "ai_models" CASCADE;
  DROP TABLE "dashboard_methodology" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_ai_models_fk";
  
  DROP INDEX "payload_locked_documents_rels_ai_models_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "ai_models_id";`)
}
