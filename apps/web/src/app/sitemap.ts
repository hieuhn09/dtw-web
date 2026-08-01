import type { MetadataRoute } from "next";
import { getArticlesPage, getPillars, getSitemapArticles } from "@/lib/cms-client";
import { ARTICLES_PAGE_SIZE } from "@/lib/data";
import { siteOrigin } from "@/lib/metadata";

// News-sitemap-class cadence (15 min), matching infra/all-infra.md, riding on
// Next's built-in ISR window — no new cron/queue infra.
export const revalidate = 900;

// Genuinely code-defined App Router routes, not CMS taxonomy — hardcoding
// them here does not violate invariant #8 (Architecture Decision 6).
// Deliberately omits /dashboards/funding (duplicate of the bare /dashboards
// default tab) and every route covered by robots.ts's disallow list
// (RFC-008): /search, /account*, /reset-password, /admin*, /preview,
// /exit-preview, /api/*.
const STATIC_ROUTES = [
  "/about",
  "/newsroom",
  "/awards",
  "/advertise",
  "/contact",
  "/press",
  "/studio",
  "/legal/privacy",
  "/legal/terms",
  "/legal/cookies",
  "/legal/gdpr",
  "/trust/editorial",
  "/trust/ai",
  "/trust/corrections",
  "/trust/transparency",
  "/trust/sponsored",
  "/briefing",
  "/newsletters",
  "/dashboards",
  "/dashboards/ai",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteOrigin();
  const [pillars, articles] = await Promise.all([getPillars(), getSitemapArticles()]);

  const home: MetadataRoute.Sitemap = [
    { url: origin, priority: 1.0, changeFrequency: "hourly" },
  ];

  const pillarEntries: MetadataRoute.Sitemap = pillars.map((pillar) => ({
    url: `${origin}/${pillar.slug}`,
    priority: 0.8,
    changeFrequency: "hourly",
  }));

  // Page 2+ of each pillar feed. The numbered pagination already links these,
  // but listing them here means a crawler doesn't have to walk the chain to
  // discover the far end of the archive. Priority sits below page 1: these are
  // navigational surfaces, not destinations.
  const pillarPageCounts = await Promise.all(
    pillars.map(async (pillar) => {
      const first = await getArticlesPage(pillar.slug, 1, ARTICLES_PAGE_SIZE);
      return {
        slug: pillar.slug,
        totalPages: Math.ceil(first.totalDocs / ARTICLES_PAGE_SIZE),
      };
    })
  );
  const pillarPageEntries: MetadataRoute.Sitemap = pillarPageCounts.flatMap(
    ({ slug, totalPages }) =>
      Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
        url: `${origin}/${slug}/page/${i + 2}`,
        priority: 0.4,
        changeFrequency: "daily" as const,
      }))
  );

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${origin}/article/${article.slug}`,
    lastModified: article.updatedAt,
    priority: 0.6,
    changeFrequency: "daily",
  }));

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${origin}${route}`,
    priority: 0.3,
    changeFrequency: "monthly",
  }));

  return [
    ...home,
    ...pillarEntries,
    ...pillarPageEntries,
    ...articleEntries,
    ...staticEntries,
  ];
}
