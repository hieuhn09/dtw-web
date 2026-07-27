import "server-only";
import { unstable_cache } from "next/cache";
import { desc, gte, sql } from "drizzle-orm";
import { db } from "@dtw/db/client";
import { articleViews } from "@dtw/db";
import { currentDayKeySGT } from "@/lib/article-views";
import { getArticlesByIds, type Article } from "@/lib/payload-server";

/**
 * The read half of the anonymous view counter — ranks articles for the
 * homepage "Most Read" band. Write half: `lib/view-actions.ts`.
 *
 * Ranking is a trailing window, not all-time: an all-time list on a young
 * archive freezes on whatever was published first and never changes, which
 * is the failure mode that makes most "most read" modules useless. Two weeks
 * keeps the band moving with the news cycle while still giving a mid-week
 * feature time to accumulate enough reads to place.
 */

const DEFAULT_WINDOW_DAYS = 14;

/** First day of the trailing window, "YYYY-MM-DD" Asia/Singapore, inclusive.
 *  `days = 14` yields today plus the thirteen days before it. */
function windowStartDay(days: number, now: Date = new Date()): string {
  return currentDayKeySGT(new Date(now.getTime() - (days - 1) * 86_400_000));
}

/**
 * Published, non-sponsored articles ordered by view count over the trailing
 * window, most read first.
 *
 * Returns FEWER than `limit` — including zero — whenever the counter doesn't
 * have that many ranked stories yet. That is deliberate: this function only
 * ever reports what was genuinely read, and the caller decides how to fill
 * the rest of the band (see `(reader)/page.tsx`). A brand-new deploy has an
 * empty `article_views` table and gets an empty list here.
 *
 * Sponsored stories are counted (a view is a view) but excluded from the
 * ranking — laundering paid placement into an editorial "most read" list is
 * exactly the church/state line the product refuses to cross.
 *
 * `revalidate: 300` rather than the homepage's 60: a ranking that reshuffles
 * every minute reads as noise, and it keeps the aggregate off the hot path.
 * Shares the `articles:all` tag so unpublishing a story drops it promptly.
 */
export const getMostReadArticles = unstable_cache(
  async (limit = 4, windowDays = DEFAULT_WINDOW_DAYS): Promise<Article[]> => {
    let ranked: Array<{ articleId: string }>;
    try {
      ranked = await db
        .select({
          articleId: articleViews.articleId,
          total: sql<number>`sum(${articleViews.views})`.as("total"),
        })
        .from(articleViews)
        .where(gte(articleViews.day, windowStartDay(windowDays)))
        .groupBy(articleViews.articleId)
        .orderBy(desc(sql`total`))
        // Over-fetch: drafts, deleted stories and sponsored placements are
        // filtered out only after hydration, so the top `limit` rows here
        // are not necessarily `limit` usable articles.
        .limit(limit * 4);
    } catch (err) {
      // `article_views` ships in a migration that only runs on production
      // deploys (scripts/migrate-prod.mjs is gated to VERCEL_ENV=production),
      // so preview/branch builds prerender the homepage before the table
      // exists. Fail open to "no ranking yet" rather than failing the build —
      // same pattern as getPinnedLatest in payload-server.ts.
      console.warn(
        "[getMostReadArticles] query failed — table not migrated yet?",
        (err as Error)?.message
      );
      return [];
    }

    const ids = ranked.map((r) => r.articleId);
    if (!ids.length) return [];

    // getArticlesByIds returns published-only, in Payload's own order — so
    // re-impose the ranking before slicing.
    const rank = new Map(ids.map((id, i) => [id, i]));
    const docs = await getArticlesByIds(ids);
    return docs
      .filter((d) => !d.sponsored)
      .sort((a, b) => (rank.get(String(a.id)) ?? 0) - (rank.get(String(b.id)) ?? 0))
      .slice(0, limit);
  },
  ["articles:most-read"],
  { tags: ["articles:all"], revalidate: 300 }
);
