import type { MetadataRoute } from "next";
import { getPillars, getSitemapArticles } from "@/lib/payload-server";
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

  return [...home, ...pillarEntries, ...articleEntries, ...staticEntries];
}
