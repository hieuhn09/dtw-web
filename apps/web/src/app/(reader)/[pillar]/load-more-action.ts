"use server";

import { getArticlesPage } from "@/lib/payload-server";
import { toArticleView, type ArticleView } from "@/lib/article-view";
import { ARTICLES_PAGE_SIZE } from "@/lib/data";

export interface ArticlesPageResult {
  articles: ArticleView[];
  page: number;
}

/**
 * Fetches one page of a pillar feed for the "Load more" control.
 *
 * The control itself is an `<a href="/{pillar}/page/{n}">` — the same URL this
 * action reads from — so a crawler follows the link and a reader gets the
 * append. This action is the enhancement path only; nothing here is on the
 * crawl path, and the feed still works with JavaScript off.
 *
 * `pillarSlug === "latest"` aggregates every published article (all beats);
 * any other slug filters to that pillar.
 */
export async function loadArticlesPage(
  pillarSlug: string,
  page: number
): Promise<ArticlesPageResult> {
  const r = await getArticlesPage(pillarSlug, page, ARTICLES_PAGE_SIZE);
  return { articles: r.docs.map(toArticleView), page: r.page };
}
