import { text, date, integer, index, uniqueIndex } from "drizzle-orm/pg-core";
import { dtwAuth } from "./auth";

/**
 * Anonymous, aggregate article view counts — the data behind the homepage
 * "Most Read" band.
 *
 * One row per (article, publication day) rather than one row per view. That
 * choice does three things at once:
 *
 *   1. Bounds growth to `articles x days` instead of pageloads, so the table
 *      never needs a retention job to stay small.
 *   2. Makes the ranking a single indexed range scan + GROUP BY over a
 *      trailing window (see `lib/most-read.ts`), not a scan of an event log.
 *   3. Stores no visitor identifier of any kind — no user id, no cookie id,
 *      no IP. Nothing here is personal data, so it needs no consent gate
 *      under GDPR / PDPA / Nghi dinh 13 (invariant #12). Per-reader reading
 *      is already modelled separately, and privately, by `reading_history`.
 *
 * Because there is no server-side identity, dedupe lives in the browser (see
 * `apps/web/src/lib/article-views.ts`): a view is counted at most once per
 * article per browser per day — the same "no per-pageload counting" rule
 * `recordView`/`reading_history` follows. That is what makes a day bucket
 * mean "distinct readers today" rather than "scroll-ups today".
 *
 * `day` is the Asia/Singapore publication day (mirrors `PUBLICATION_TZ` in
 * lib/i18n.tsx and the paywall meter's period key), so every reader's bucket
 * rolls over at the same real-world instant regardless of local timezone.
 *
 * `article_id` references a Payload-owned table by value, not through a
 * Drizzle `.references()` — same convention, and same reason, as account.ts.
 */
export const articleViews = dtwAuth.table(
  "article_views",
  {
    articleId: text("article_id").notNull(),
    /** "YYYY-MM-DD", Asia/Singapore. */
    day: date("day").notNull(),
    views: integer("views").notNull().default(0),
  },
  (t) => ({
    /** Upsert target for the counter increment. */
    pk: uniqueIndex("article_views_pk").on(t.articleId, t.day),
    /** Drives the trailing-window scan in the most-read ranking. */
    dayIdx: index("article_views_day_idx").on(t.day),
  })
);
