"use server";

import { getArticlesPage } from "@/lib/payload-server";
import { toArticleView, type ArticleView } from "@/lib/article-view";
import { ARTICLES_PAGE_SIZE } from "@/lib/data";

export interface ArticlesPageResult {
  articles: ArticleView[];
  hasMore: boolean;
  /** True total for the current pillar/section filter (for the "N stories" badge). */
  totalCount: number;
  page: number;
}

/**
 * Server action backing the pillar feed's "Load more" button. Each call fetches
 * one page server-side (Payload paginates), so the feed scales past any in-memory
 * cap instead of slicing a pre-loaded array.
 *
 * `pillarSlug === "latest"` aggregates every published article (all beats); any
 * other slug filters to that pillar.
 */
export async function loadArticlesPage(
  pillarSlug: string,
  page: number
): Promise<ArticlesPageResult> {
  const r = await getArticlesPage(pillarSlug, page, ARTICLES_PAGE_SIZE);
  return {
    articles: r.docs.map(toArticleView),
    hasMore: r.hasNextPage,
    totalCount: r.totalDocs,
    page: r.page,
  };
}
