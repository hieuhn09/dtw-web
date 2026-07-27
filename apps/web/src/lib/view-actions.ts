"use server";

/**
 * The write half of the anonymous article view counter behind the homepage
 * "Most Read" band. Read half: `lib/most-read.ts`. Dedupe: `lib/article-views.ts`.
 *
 * Called from the article page client-side, after hydration, on purpose —
 * the article route is `revalidate = 60` ISR, so a per-visit write must never
 * happen inside its RSC (it would run once per regeneration, not once per
 * reader). Same placement, and same reason, as `recordView` in
 * account-actions.ts.
 *
 * Unlike `recordView`, this fires for signed-out readers too — it is the
 * whole point of the aggregate — and stores no identity of any kind, only
 * `+1` against `(article, day)`.
 */

import { sql } from "drizzle-orm";
import { db } from "@dtw/db/client";
import { articleViews } from "@dtw/db";
import { currentDayKeySGT } from "@/lib/article-views";

/** Payload issues numeric ids; `ArticleView.id` is `String(a.id)`. Rejecting
 *  anything else keeps a caller who POSTs junk straight at this public action
 *  from minting unbounded rows. Ids that pass but don't exist are harmless:
 *  the ranking hydrates through Payload, published-only, so they never
 *  surface. */
const ARTICLE_ID = /^\d{1,19}$/;

/**
 * Increment today's view counter for `articleId`. Caller must have already
 * passed `claimViewCount()` — this function does no deduping of its own.
 *
 * Fails open and silently: a lost count is a slightly stale ranking, never a
 * broken article page.
 */
export async function recordArticleView(articleId: string): Promise<void> {
  if (!ARTICLE_ID.test(articleId)) return;
  try {
    await db
      .insert(articleViews)
      .values({ articleId, day: currentDayKeySGT(), views: 1 })
      .onConflictDoUpdate({
        target: [articleViews.articleId, articleViews.day],
        set: { views: sql`${articleViews.views} + 1` },
      });
  } catch (err) {
    console.warn("[recordArticleView] failed", (err as Error)?.message);
  }
}
