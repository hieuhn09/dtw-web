import { notFound } from "next/navigation";
import { PillarContent } from "@/components/pillar/pillar-content";
import { toArticleView } from "@/lib/article-view";
import { getArticlesPage, getPillars } from "@/lib/payload-server";
import { ARTICLES_PAGE_SIZE } from "@/lib/data";

export const revalidate = 60;

export default async function PillarPage({
  params,
}: {
  params: Promise<{ pillar: string }>;
}) {
  const { pillar: slug } = await params;

  // Page 1 of the feed. getArticlesPage special-cases "latest" as the all-beats
  // firehose (no pillar filter); every other slug is filtered to its pillar. It
  // paginates server-side, so the feed is no longer capped — "Load more" fetches
  // the next page via a server action (see load-more-action.ts).
  const [pillarsRaw, firstPage] = await Promise.all([
    getPillars(),
    getArticlesPage(slug, 1, ARTICLES_PAGE_SIZE),
  ]);

  // Validate + theme from the CMS, not a hardcoded list: a pillar created in
  // /admin must render (invariant #8), and editors can change a pillar's
  // heading/description/color without a deploy. Unknown slug → 404.
  const pillarDoc = pillarsRaw.find((p) => p.slug === slug);
  if (!pillarDoc) notFound();

  const articles = firstPage.docs.map(toArticleView);

  return (
    // key by slug so navigating between pillar pages remounts the feed — the
    // client pagination state (loaded pages, active subsection) resets cleanly
    // from fresh props instead of needing a reset effect.
    <PillarContent
      key={pillarDoc.slug}
      pillarId={pillarDoc.slug}
      pillarColor={pillarDoc.color}
      pillarIcon={pillarDoc.icon}
      pillarHeading={pillarDoc.heading || pillarDoc.title?.en || pillarDoc.slug}
      pillarDescription={pillarDoc.description ?? ""}
      initialArticles={articles}
      totalCount={firstPage.totalDocs}
      hasMoreInitial={firstPage.hasNextPage}
    />
  );
}
