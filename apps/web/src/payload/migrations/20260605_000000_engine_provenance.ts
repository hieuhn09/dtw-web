import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Engine provenance fields on Articles. The collection has `versions.drafts`,
// so every field is mirrored into the `_articles_v` version table with a
// `version_` prefix — both tables must get the columns or version writes fail.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles" ADD COLUMN "engine_source_url" varchar;
  ALTER TABLE "articles" ADD COLUMN "engine_source_name" varchar;
  ALTER TABLE "_articles_v" ADD COLUMN "version_engine_source_url" varchar;
  ALTER TABLE "_articles_v" ADD COLUMN "version_engine_source_name" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles" DROP COLUMN "engine_source_url";
  ALTER TABLE "articles" DROP COLUMN "engine_source_name";
  ALTER TABLE "_articles_v" DROP COLUMN "version_engine_source_url";
  ALTER TABLE "_articles_v" DROP COLUMN "version_engine_source_name";`)
}
