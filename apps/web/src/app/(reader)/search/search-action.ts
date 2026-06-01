"use server";

import { searchArticles } from "@/lib/payload-server";
import { toArticleView, type ArticleView } from "@/lib/article-view";

/**
 * Server action invoked from the client search surfaces (search page + ⌘K
 * overlay) on each debounced keystroke. Runs the DB search and returns the lean
 * ArticleView shape the cards already render.
 */
export async function runSearch(q: string): Promise<ArticleView[]> {
  if (!q.trim()) return [];
  const docs = await searchArticles(q);
  return docs.map(toArticleView);
}
