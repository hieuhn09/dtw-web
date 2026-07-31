import type { Metadata } from "next";
import { Reveal } from "@/components/effects";
import { HomeHero } from "@/components/home/home-hero";
import { BriefBand } from "@/components/home/brief-band";
import { WireDrops } from "@/components/home/wire-drops";
import { PillarShowcase } from "@/components/home/pillar-showcase";
import { MostRead } from "@/components/home/most-read";
import { DashboardsTeaser } from "@/components/home/dashboards-teaser";
import { DeepDive } from "@/components/home/deep-dive";
import { AwardsBanner } from "@/components/home/awards-banner";
import { BestOfReviews } from "@/components/home/best-of-reviews";
import { PodcastStrip } from "@/components/home/podcast-strip";
import { NewsletterCta } from "@/components/home/newsletter-cta";
import { toArticleView, type ArticleView } from "@/lib/article-view";
import { getMostReadArticles } from "@/lib/most-read";
import {
  getAiModels,
  getArticlesByPillar,
  getDeepDive,
  getNavPillars,
  getPinnedLatest,
  getRecentArticles,
  getWireDrops,
} from "@/lib/payload-server";
import type { PillarId } from "@/lib/data";
import { buildMetadata, DEFAULT_OG_IMAGE } from "@/lib/metadata";

// [temp-hidden 2026-07-17] Homepage sections hidden at product request.
// Flip any flag back to `true` to restore that band (imports and data-fetch
// for each section are intentionally left intact so restoring is one edit).
const SHOW_BRIEF = false;
const SHOW_WIRE_DROPS = false;
// Restored 2026-07-31: the teaser now runs on real CMS/LLM Stats data.
const SHOW_DASHBOARDS = true;
const SHOW_DEEP_DIVE = false;
const SHOW_BEST_OF_REVIEWS = false;
const SHOW_LISTEN = false;
const SHOW_NEWSLETTER_CTA = false;

/** Cards in the "Most Read" band — the grid is designed around four. */
const MOST_READ_SLOTS = 4;

export const revalidate = 60;

// Deliberately omits `title` so the route inherits the root layout's
// `title.default` ("DailyTechWire") verbatim rather than re-stating brand
// copy through the "%s – DailyTechWire" template (which would otherwise
// render "DailyTechWire – DailyTechWire"). Static object, not
// `generateMetadata` — the homepage has no dynamic route params.
export const metadata: Metadata = buildMetadata({
  canonicalPath: "/",
  description: "Tech Intelligence, Wired Daily.",
  image: DEFAULT_OG_IMAGE,
  type: "website",
});

export default async function HomePage() {
  // Hoisted ahead of the batch below: the per-pillar fan-out needs the CMS
  // pillar list to know what to fan out over, and this call is
  // unstable_cache-backed, so it's a cache hit rather than a real round trip.
  const pillars = await getNavPillars();

  const [recent, pinnedDoc, deepDive, wireDrops, mostReadDocs, aiModels, perPillar] =
    await Promise.all([
      getRecentArticles(40),
      getPinnedLatest(),
      getDeepDive(),
      getWireDrops(12),
      getMostReadArticles(MOST_READ_SLOTS),
      getAiModels(),
      // Each non-"latest" pillar band fills from its own newest 4 directly,
      // since low-volume pillars (e.g. Dev) can rank entirely outside the
      // shared newest-40 `articles` pool below, starving to 1 item or getting
      // dropped by pillar-showcase.tsx's `items.length === 0` guard. "latest"
      // is excluded here since it's an auto-aggregated feed, not a real beat.
      // Pillar list is CMS-driven (invariant #8), not hardcoded.
      Promise.all(
        pillars
          .filter((p) => p.slug !== "latest")
          .map(async (p) => [p.slug, await getArticlesByPillar(p.slug, 4)] as const),
      ),
    ]);

  const articles = recent.map(toArticleView);
  const pinned = pinnedDoc ? toArticleView(pinnedDoc) : null;
  const heroPool = articles.filter((a) => !a.sponsored);
  // A pinned story headlines the big hero slot (top-left of the homepage);
  // otherwise the newest non-sponsored story leads.
  const lead = pinned ?? heroPool[0] ?? articles[0]!;
  // "Also leading today" rail = the next newest non-sponsored stories, minus
  // whatever currently leads.
  const aside = heroPool.filter((a) => a.id !== lead.id).slice(0, 4);

  const byPillar: Partial<Record<PillarId, ArticleView[]>> = {};
  for (const [slug, docs] of perPillar) {
    byPillar[slug as PillarId] = docs.map(toArticleView);
  }
  // "Latest" is an auto-aggregated feed — the newest stories across every pillar,
  // not only those literally tagged with the "latest" pillar (mirrors the /latest
  // page). A pinned story leads the Latest band; the rest fill in newest-first
  // from the shared `articles` pool above.
  byPillar.latest = (
    pinned ? [pinned, ...articles.filter((a) => a.id !== pinned.id)] : articles
  ).slice(0, 4);

  // "Most Read" band. `getMostReadArticles` reports only what the anonymous
  // view counter actually ranked, so it can come back short — or empty on a
  // fresh deploy, before anyone has read anything. The band is a fixed slot in
  // the page rhythm, so top it up with the newest non-sponsored stories rather
  // than collapsing it. Anything already on screen in the hero is excluded from
  // the *top-up* only: a story that genuinely is the most read stays, even if
  // it also leads.
  const mostReadRanked = mostReadDocs.map(toArticleView);
  const usedIds = new Set([
    lead.id,
    ...aside.map((a) => a.id),
    ...mostReadRanked.map((a) => a.id),
  ]);
  const mostReadItems = [
    ...mostReadRanked,
    ...heroPool.filter((a) => !usedIds.has(a.id)),
  ].slice(0, MOST_READ_SLOTS);

  const deepDiveView = deepDive ? toArticleView(deepDive) : null;

  const wireDropsInitial = wireDrops.map((w) => ({
    id: String(w.id),
    time: w.time,
    city: w.city,
    text: w.text,
  }));

  return (
    <div className="container">
      <HomeHero lead={lead} aside={aside} />
      {SHOW_BRIEF && <BriefBand />}
      {SHOW_WIRE_DROPS && (
        <Reveal>
          <WireDrops initial={wireDropsInitial} />
        </Reveal>
      )}
      <Reveal>
        <PillarShowcase pillars={pillars} byPillar={byPillar} />
      </Reveal>
      <Reveal>
        <MostRead articles={mostReadItems} />
      </Reveal>
      {SHOW_DASHBOARDS && (
        <Reveal>
          <DashboardsTeaser aiRows={aiModels.rows} />
        </Reveal>
      )}
      {SHOW_DEEP_DIVE && (
        <Reveal>
          <DeepDive article={deepDiveView} />
        </Reveal>
      )}
      <Reveal>
        <AwardsBanner />
      </Reveal>
      {SHOW_BEST_OF_REVIEWS && (
        <Reveal>
          <BestOfReviews />
        </Reveal>
      )}
      {SHOW_LISTEN && (
        <Reveal>
          <PodcastStrip />
        </Reveal>
      )}
      {SHOW_NEWSLETTER_CTA && (
        <Reveal>
          <NewsletterCta />
        </Reveal>
      )}
    </div>
  );
}
