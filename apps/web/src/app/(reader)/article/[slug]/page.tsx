import { notFound } from "next/navigation";
import { ArticleContent } from "@/components/article/article-content";
import { toArticleView } from "@/lib/article-view";
import {
  getArticleBySlug,
  getArticlesByPillar,
} from "@/lib/payload-server";

export const revalidate = 60;

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const view = toArticleView(article);
  const relatedRaw = await getArticlesByPillar(view.pillar, 6);
  const related = relatedRaw
    .map(toArticleView)
    .filter((a) => a.slug !== view.slug)
    .slice(0, 3);

  return <ArticleContent article={view} body={article.body ?? null} related={related} />;
}
