import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PillarContent } from "@/components/pillar/pillar-content";
import { toArticleView } from "@/lib/article-view";
import { getArticlesPage, getPillars, getPinnedLatest } from "@/lib/payload-server";
import { ARTICLES_PAGE_SIZE } from "@/lib/data";
import { buildMetadata, DEFAULT_OG_IMAGE } from "@/lib/metadata";

/**
 * Shared body for the two routes that render a pillar feed: `/[pillar]`
 * (page 1) and `/[pillar]/page/[n]` (page 2+). Keeping one implementation
 * means the paginated pages can't drift from page 1 in layout, metadata, or
 * pillar validation.
 */

/** Page 1 is canonical at `/{slug}`; deeper pages get their own path. */
export function pillarPath(slug: string, page: number): string {
  return page === 1 ? `/${slug}` : `/${slug}/page/${page}`;
}

export async function pillarMetadata(slug: string, page: number): Promise<Metadata> {
  const pillars = await getPillars();
  const pillarDoc = pillars.find((p) => p.slug === slug);
  if (!pillarDoc) notFound();

  const heading = pillarDoc.heading || pillarDoc.title.en;
  // Site default description as the fallback for pillars with no
  // `description` set — matches layout.tsx's root description verbatim.
  const description = pillarDoc.description ?? "Tech Intelligence, Wired Daily.";

  return buildMetadata({
    // Paginated pages carry the page number in the title so they don't compete
    // with page 1 as duplicate titles in search results. They stay indexable
    // and self-canonical — Google's own guidance for paginated series is to
    // treat each page as distinct content, not to canonicalize them onto the
    // first page.
    title: page === 1 ? heading : `${heading} — Page ${page}`,
    description:
      page === 1 ? description : `${description} Page ${page} of the archive.`,
    canonicalPath: pillarPath(slug, page),
    image: DEFAULT_OG_IMAGE, // no per-pillar image field exists
    type: "website",
    feed: {
      url: `/${pillarDoc.slug}/rss.xml`,
      title: `DailyTechWire — ${heading}`,
    },
  });
}

export async function PillarView({ slug, page }: { slug: string; page: number }) {
  // getArticlesPage special-cases "latest" as the all-beats firehose (no pillar
  // filter); every other slug is filtered to its pillar.
  const [pillarsRaw, feedPage, pinnedDoc] = await Promise.all([
    getPillars(),
    getArticlesPage(slug, page, ARTICLES_PAGE_SIZE),
    // Only the cross-beat "latest" feed honors the pin, and only on page 1 —
    // a pinned story leading page 7 would be a duplicate, not a feature.
    slug === "latest" && page === 1 ? getPinnedLatest() : Promise.resolve(null),
  ]);

  // Validate + theme from the CMS, not a hardcoded list: a pillar created in
  // /admin must render (invariant #8), and editors can change a pillar's
  // heading/description/color without a deploy. Unknown slug → 404.
  const pillarDoc = pillarsRaw.find((p) => p.slug === slug);
  if (!pillarDoc) notFound();

  // A page number past the end of the feed is a dead URL, not an empty one:
  // 404 rather than serve a blank page that a crawler would keep revisiting.
  // Page 1 is exempt so a pillar with no stories yet still renders its header
  // and empty state.
  const totalPages = Math.max(1, Math.ceil(feedPage.totalDocs / ARTICLES_PAGE_SIZE));
  if (page > 1 && feedPage.docs.length === 0) notFound();

  // A pinned story leads the feed as the featured card. PillarContent dedupes
  // the grid + later "Load more" pages off initialArticles[0].id, so prepending
  // here is enough — no double render and no extra paging logic.
  const feed = feedPage.docs.map(toArticleView);
  const pinned = pinnedDoc ? toArticleView(pinnedDoc) : null;
  const articles = pinned
    ? [pinned, ...feed.filter((a) => a.id !== pinned.id)]
    : feed;

  return (
    // key by slug + page so navigating between pillar pages remounts the feed —
    // the client pagination state (loaded pages, active subsection) resets
    // cleanly from fresh props instead of needing a reset effect.
    <PillarContent
      key={`${pillarDoc.slug}:${page}`}
      pillarId={pillarDoc.slug}
      pillarColor={pillarDoc.color}
      pillarIcon={pillarDoc.icon}
      pillarHeading={pillarDoc.heading || pillarDoc.title?.en || pillarDoc.slug}
      pillarDescription={pillarDoc.description ?? ""}
      initialArticles={articles}
      totalCount={feedPage.totalDocs}
      hasMoreInitial={feedPage.hasNextPage}
      currentPage={page}
      totalPages={totalPages}
      showFeatured={page === 1}
    />
  );
}
