import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// `contentType` on Articles — what a document IS, next to `origin`'s who wrote it.
// Only the engine's daily brief is marked; every row that exists today is an article.
//
// NOT NULL is deliberate. Payload's adapter leaves a required select nullable (see
// `origin`), and a nullable column would force every feed query to guard for null —
// the one shape that silently drops rows. `ADD COLUMN … DEFAULT … NOT NULL` fills
// existing rows in place, so this rewrites nothing.
//
// The collection has `versions.drafts`, so the column must also land on `_articles_v`
// with the `version_` prefix or version writes fail. That one stays nullable to match
// every other versioned column; the UPDATE backfills the rows already there.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_articles_content_type" AS ENUM('article', 'daily-brief');
  CREATE TYPE "public"."enum__articles_v_version_content_type" AS ENUM('article', 'daily-brief');
  ALTER TABLE "articles" ADD COLUMN "content_type" "enum_articles_content_type" DEFAULT 'article' NOT NULL;
  ALTER TABLE "_articles_v" ADD COLUMN "version_content_type" "enum__articles_v_version_content_type" DEFAULT 'article';
  UPDATE "_articles_v" SET "version_content_type" = 'article' WHERE "version_content_type" IS NULL;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "articles" DROP COLUMN "content_type";
  ALTER TABLE "_articles_v" DROP COLUMN "version_content_type";
  DROP TYPE "public"."enum_articles_content_type";
  DROP TYPE "public"."enum__articles_v_version_content_type";`)
}
