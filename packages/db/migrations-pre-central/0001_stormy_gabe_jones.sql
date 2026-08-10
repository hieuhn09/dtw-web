CREATE TABLE "article_views" (
	"article_id" text NOT NULL,
	"day" date NOT NULL,
	"views" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "article_views_pk" ON "article_views" USING btree ("article_id","day");--> statement-breakpoint
CREATE INDEX "article_views_day_idx" ON "article_views" USING btree ("day");