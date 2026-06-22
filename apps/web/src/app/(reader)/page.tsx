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
  getDeepDive,
  getNavPillars,
  getPinnedLatest,
  getRecentArticles,
  getWireDrops,
} from "@/lib/payload-server";
import type { PillarId } from "@/lib/data";

export const revalidate = 60;

export default async function HomePage() {
  const [recent, pinnedDoc, deepDive, wireDrops, pillars] = await Promise.all([
    getRecentArticles(40),
    getPinnedLatest(),
    getDeepDive(),
    getWireDrops(12),
    getNavPillars(),
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
  for (const a of articles) {
    const list = byPillar[a.pillar] ?? [];
    if (list.length < 4) {
      byPillar[a.pillar] = [...list, a];
    }
  }
  // "Latest" is an auto-aggregated feed — the newest stories across every pillar,
  // not only those literally tagged with the "latest" pillar (mirrors the /latest
  // page). Without this the band would depend on "latest"-tagged articles landing
  // in the recent set and could drop out of "Across the pillars" entirely.
  // A pinned story leads the Latest band; the rest fill in newest-first.
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
