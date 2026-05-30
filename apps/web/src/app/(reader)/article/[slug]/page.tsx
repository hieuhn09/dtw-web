import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { ArticleContent } from "@/components/article/article-content";
import { toArticleView } from "@/lib/article-view";
import {
  getArticleBySlug,
  getArticleBySlugDraft,
  getArticlesByPillar,
} from "@/lib/payload-server";

export const revalidate = 60;

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Draft mode (enabled only via the authenticated /preview route) shows the
  // unpublished draft; everyone else gets the cached, published-only fetch.
  const { isEnabled: isDraft } = await draftMode();
  const article = isDraft
    ? await getArticleBySlugDraft(slug)
    : await getArticleBySlug(slug);
  if (!article) notFound();

  const view = toArticleView(article);
  const relatedRaw = await getArticlesByPillar(view.pillar, 6);
  const related = relatedRaw
    .map(toArticleView)
    .filter((a) => a.slug !== view.slug)
    .slice(0, 3);

  return <ArticleContent article={view} body={article.body ?? null} related={related} />;
}
