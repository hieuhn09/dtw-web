import { notFound } from "next/navigation";
import { PillarContent } from "@/components/pillar/pillar-content";
import { toArticleView } from "@/lib/article-view";
import { getArticlesByPillar, getPillars } from "@/lib/payload-server";

export const revalidate = 60;

export default async function PillarPage({
  params,
}: {
  params: Promise<{ pillar: string }>;
}) {
  const { pillar: slug } = await params;

  const [pillarsRaw, articlesRaw] = await Promise.all([
    getPillars(),
    getArticlesByPillar(slug, 80),
  ]);

  // Validate + theme from the CMS, not a hardcoded list: a pillar created in
  // /admin must render (invariant #8), and editors can change a pillar's
  // heading/description/color without a deploy. Unknown slug → 404.
  const pillarDoc = pillarsRaw.find((p) => p.slug === slug);
  if (!pillarDoc) notFound();

  const articles = articlesRaw.map(toArticleView);

  return (
    <PillarContent
      pillarId={pillarDoc.slug}
      pillarColor={pillarDoc.color}
      pillarIcon={pillarDoc.icon}
      pillarHeading={pillarDoc.heading || pillarDoc.title?.en || pillarDoc.slug}
      pillarDescription={pillarDoc.description ?? ""}
      articles={articles}
      totalCount={articles.length}
    />
  );
}
