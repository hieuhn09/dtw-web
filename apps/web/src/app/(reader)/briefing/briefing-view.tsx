import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BriefingContent } from "./briefing-content";
import { toArticleView } from "@/lib/article-view";
import { getBriefsPage } from "@/lib/cms-client";
import { BRIEFS_PAGE_SIZE } from "@/lib/data";
import { buildMetadata, DEFAULT_OG_IMAGE } from "@/lib/metadata";

/**
 * Shared body for the two routes that render the brief archive: `/briefing`
 * (page 1) and `/briefing/page/[n]` (page 2+). One implementation so the
 * paginated pages can't drift from page 1 — same shape the pillar feed uses.
 */

/** Page 1 is canonical at `/briefing`; deeper pages get their own path. */
export function briefingPath(page: number): string {
  return page === 1 ? "/briefing" : `/briefing/page/${page}`;
}

export function briefingMetadata(page: number): Metadata {
  const description =
    "The Dailytechwire Brief — twice-daily editions rounding up the tech day, morning and evening SGT, each item linking through to the full report.";
  return buildMetadata({
    // Paginated pages carry the number so they don't compete with page 1 as
    // duplicate titles; each stays indexable and self-canonical, per Google's
    // own guidance for paginated series.
    title: page === 1 ? "The Brief" : `The Brief — Page ${page}`,
    description: page === 1 ? description : `${description} Page ${page} of the archive.`,
    canonicalPath: briefingPath(page),
    image: DEFAULT_OG_IMAGE,
    type: "website",
  });
}

export async function BriefingView({ page }: { page: number }) {
  const { docs, totalDocs, hasNextPage } = await getBriefsPage(page, BRIEFS_PAGE_SIZE);

  // A page past the end of the archive is a dead URL, not an empty state — the
  // empty state belongs to page 1 before the first edition ever runs.
  if (page > 1 && docs.length === 0) notFound();

  return (
    <BriefingContent
      editions={docs.map(toArticleView)}
      page={page}
      hasNextPage={hasNextPage}
      totalDocs={totalDocs}
    />
  );
}
