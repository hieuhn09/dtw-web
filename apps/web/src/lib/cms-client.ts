import "server-only";
import * as central from "@/lib/cms-client.central";
import * as local from "@/lib/payload-server";

/**
 * Chooses where the reader gets its content.
 *
 *   CMS_SOURCE=central  → Central CMS over HTTP (cms-client.central.ts)
 *   anything else / unset → the local Payload instance (payload-server.ts)  ← DEFAULT
 *
 * Why the switch exists rather than importing the central client directly:
 * `central-api.ts` deliberately never throws into render — every network error,
 * 404 or bad token resolves to an empty result. That is the right call for
 * runtime resilience, but it means a deploy whose CMS_URL does not yet point at
 * a seeded Central renders a COMPLETELY EMPTY site with no error anywhere. WTB
 * hit exactly that on 28/07/2026.
 *
 * With the switch, `main` keeps behaving as it does today, and both the cutover
 * and the rollback are one environment variable plus a redeploy — never a code
 * revert under pressure.
 *
 * Both modules expose the same 22 functions with the same signatures, so a drift
 * between them is a compile error here rather than a runtime surprise.
 */
export const USING_CENTRAL_CMS = process.env.CMS_SOURCE === "central";

const impl = USING_CENTRAL_CMS ? central : local;

export const getPillars = impl.getPillars;
export const getNavPillars = impl.getNavPillars;
export const getRecentArticles = impl.getRecentArticles;
export const getArticlesPage = impl.getArticlesPage;
export const getArticlesAfter = impl.getArticlesAfter;
export const getArticlesByPillar = impl.getArticlesByPillar;
export const getRelatedArticles = impl.getRelatedArticles;
export const getArticleBySlug = impl.getArticleBySlug;
export const getArticlesByIds = impl.getArticlesByIds;
export const getArticleBySlugDraft = impl.getArticleBySlugDraft;
export const searchArticles = impl.searchArticles;
export const getDeepDive = impl.getDeepDive;
export const getSponsoredArticle = impl.getSponsoredArticle;
export const getPinnedLatest = impl.getPinnedLatest;
export const getWireDrops = impl.getWireDrops;
export const getCorrections = impl.getCorrections;
export const getPaywallThreshold = impl.getPaywallThreshold;
export const getNewsletters = impl.getNewsletters;
export const getFeedArticles = impl.getFeedArticles;
export const getSitemapArticles = impl.getSitemapArticles;
export const getLatestBriefs = impl.getLatestBriefs;
export const getBriefsPage = impl.getBriefsPage;

// ── Dashboards: LOCAL in BOTH modes ───────────────────────────────────────────
// These three deliberately bypass the switch. Central's `dashboards` module
// exposes `fundingRows` + `aiLeaderboardRows`, but the AI Leaderboard reads a
// different shape entirely: the `aiModels` collection, the `dashboardMethodology`
// global, and `sponsorSlots` — none of which exist in Central's schema.
//
// So after cutover DTW still needs its local Payload for this one surface. That
// is a real dependency, not an oversight: routing them through `impl` would
// silently empty the leaderboard the moment CMS_SOURCE flips, because
// central-api resolves every miss to an empty result rather than throwing.
//
// Closing this means adding the three surfaces to Central and migrating the rows;
// until then, leave them here so the coupling stays visible.
export const getAiModels = local.getAiModels;
export const getDashboardMethodology = local.getDashboardMethodology;
export const getDashboardSponsorSlot = local.getDashboardSponsorSlot;

// Types are re-exported from payload-server, which owns the canonical shapes —
// the central client returns the same ones.
export type {
  Article,
  Pillar,
  Author,
  WireDrop,
  Tag,
  Correction,
  Newsletter,
  FeedArticle,
  LatestBriefs,
} from "@/lib/payload-server";
