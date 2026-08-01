"use server";

import { getArticlesAfter } from "@/lib/cms-client";
import { toArticleView, type ArticleView } from "@/lib/article-view";
import { APPEND_BATCH_SIZE } from "@/lib/data";

export interface AppendResult {
  articles: ArticleView[];
  hasMore: boolean;
}

/**
 * Fetches the next batch for the "Load more" control.
 *
 * Cursor-based, not page-based, because the two sizes deliberately differ: a
 * route page carries 25 articles (one becomes the lead card, 24 fill the grid)
 * while an append adds 24 plain cards. 24 divides by every column count the
 * grid uses, so the grid stays even no matter how many times the reader
 * appends — which page-based fetching can't do here, since Payload's `find`
 * exposes only `limit`/`page` and no offset, and the offsets an append needs
 * (25, 49, 73…) aren't a multiple of any usable limit.
 *
 * The control is still an `<a href="/{pillar}/page/{n}">`, so crawlers walk
 * whole pages and never touch this path.
 */
export async function loadArticlesAfter(
  pillarSlug: string,
  afterPublishedAt: string,
  afterId: number
): Promise<AppendResult> {
  const r = await getArticlesAfter(
    pillarSlug,
    afterPublishedAt,
    afterId,
    APPEND_BATCH_SIZE
  );
  return { articles: r.docs.map(toArticleView), hasMore: r.hasMore };
}
