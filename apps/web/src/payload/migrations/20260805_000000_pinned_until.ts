import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// `pinnedUntil` timestamp on Articles — optional expiry for `pinnedToLatest`.
// Read queries treat a past value as "not pinned"; NULL keeps today's behaviour
// (pinned until manually unticked). The collection has `versions.drafts`, so the
// column must also be added to `_articles_v` (with the `version_` prefix) or
// version writes fail.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "articles" ADD COLUMN "pinned_until" timestamp(3) with time zone;
  ALTER TABLE "_articles_v" ADD COLUMN "version_pinned_until" timestamp(3) with time zone;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "articles" DROP COLUMN "pinned_until";
  ALTER TABLE "_articles_v" DROP COLUMN "version_pinned_until";`)
}
