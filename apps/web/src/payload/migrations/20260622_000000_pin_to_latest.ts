import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// `pinnedToLatest` checkbox on Articles — drives the pinned slot at the top of
// the Latest feed + homepage Latest band. The collection has `versions.drafts`,
// so the column must also be added to `_articles_v` (with the `version_` prefix)
// or version writes fail. DEFAULT false backfills existing rows.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "articles" ADD COLUMN "pinned_to_latest" boolean DEFAULT false;
  ALTER TABLE "_articles_v" ADD COLUMN "version_pinned_to_latest" boolean DEFAULT false;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "articles" DROP COLUMN "pinned_to_latest";
  ALTER TABLE "_articles_v" DROP COLUMN "version_pinned_to_latest";`)
}
