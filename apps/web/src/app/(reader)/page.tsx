import type { Metadata } from "next";
import { Reveal } from "@/components/effects";
import { HomeHero } from "@/components/home/home-hero";
import { BriefBand } from "@/components/home/brief-band";
import { WireDrops } from "@/components/home/wire-drops";
import { PillarShowcase } from "@/components/home/pillar-showcase";
import { AsiaSpotlight } from "@/components/home/asia-spotlight";
import { DashboardsTeaser } from "@/components/home/dashboards-teaser";
import { DeepDive } from "@/components/home/deep-dive";
import { AwardsBanner } from "@/components/home/awards-banner";
import { BestOfReviews } from "@/components/home/best-of-reviews";
import { PodcastStrip } from "@/components/home/podcast-strip";
import { NewsletterCta } from "@/components/home/newsletter-cta";
import { toArticleView, type ArticleView } from "@/lib/article-view";
import {
  getArticlesByPillar,
  getDeepDive,
  getNavPillars,
  getPinnedLatest,
  getRecentArticles,
  getWireDrops,
} from "@/lib/payload-server";
import type { PillarId } from "@/lib/data";
import { buildMetadata, DEFAULT_OG_IMAGE } from "@/lib/metadata";

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

  const [recent, pinnedDoc, deepDive, wireDrops, perPillar] = await Promise.all([
    getRecentArticles(40),
    getPinnedLatest(),
    getDeepDive(),
    getWireDrops(12),
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

  const spotlightItems = articles
    .filter((a) => (["latest", "policy", "startups"] as PillarId[]).includes(a.pillar))
    .slice(0, 4);

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
      <BriefBand />
      <Reveal>
        <WireDrops initial={wireDropsInitial} />
      </Reveal>
      <Reveal>
        <PillarShowcase pillars={pillars} byPillar={byPillar} />
      </Reveal>
      <Reveal>
        <AsiaSpotlight articles={spotlightItems} />
      </Reveal>
      <Reveal>
        <DashboardsTeaser />
      </Reveal>
      <Reveal>
        <DeepDive article={deepDiveView} />
      </Reveal>
      <Reveal>
        <AwardsBanner />
      </Reveal>
      <Reveal>
        <BestOfReviews />
      </Reveal>
      <Reveal>
        <PodcastStrip />
      </Reveal>
      <Reveal>
        <NewsletterCta />
      </Reveal>
    </div>
  );
}
