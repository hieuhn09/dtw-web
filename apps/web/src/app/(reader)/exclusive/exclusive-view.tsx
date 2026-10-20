import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExclusiveContent } from "@/components/exclusive/exclusive-content";
import { toArticleView } from "@/lib/article-view";
import { getExclusiveArticlesPage } from "@/lib/cms-client";
import {
  EXCLUSIVE_FEED_PATH,
  EXCLUSIVE_PAGE_SIZE,
  classifyExclusivePage,
  exclusivePagePath,
} from "@/lib/exclusive";
import { buildMetadata, DEFAULT_OG_IMAGE } from "@/lib/metadata";

/**
 * Shared body for `/exclusive` (page 1) and `/exclusive/page/[n]` (page 2+),
 * mirroring pillar-view.tsx so the two routes cannot drift. Past-the-end
 * pages call notFound() (a real 404, not a soft one); page 1 with no
 * stories renders the empty state.
 */

async function loadPage(page: number) {
  const feedPage = await getExclusiveArticlesPage(page, EXCLUSIVE_PAGE_SIZE);
  const verdict = classifyExclusivePage({
    page,
    totalDocs: feedPage.totalDocs,
    docCount: feedPage.docs.length,
  });
  if (verdict === "not-found") notFound();
  return feedPage;
}

export async function exclusiveMetadata(page: number): Promise<Metadata> {
  await loadPage(page);
  return buildMetadata({
    title: page === 1 ? "Exclusive" : `Exclusive – Page ${page}`,
    description:
      "Original reporting by Opentechwire: stories we broke, documents we obtained, interviews we conducted.",
    canonicalPath: exclusivePagePath(page),
    image: DEFAULT_OG_IMAGE,
    type: "website",
    feed: { url: EXCLUSIVE_FEED_PATH, title: "Opentechwire – Exclusive" },
  });
}

export async function ExclusiveView({ page }: { page: number }) {
  const feedPage = await loadPage(page);
  return (
    <ExclusiveContent
      key={page}
      articles={feedPage.docs.map(toArticleView)}
      page={page}
      hasNextPage={feedPage.hasNextPage}
    />
  );
}
