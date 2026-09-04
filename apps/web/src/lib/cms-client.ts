import "server-only";
import * as central from "@/lib/cms-client.central";

/**
 * The reader's single data entry point.
 *
 * Until 04-09-2026 this module was a SWITCH: `CMS_SOURCE=central` picked the
 * shared Central CMS over HTTP, anything else fell back to an embedded Payload
 * instance in this repo. The fallback is gone — Central has been the live source
 * since the cutover, local Payload has been deleted, and a dormant second
 * implementation reliably produces drift rather than safety.
 *
 * The three dashboard reads below used to bypass the switch entirely and stay on
 * local Payload in BOTH modes, because Central's schema had no `aiModels`
 * collection and no `dashboardMethodology` global. That was the last thing
 * keeping a Payload instance in this repo. Central now carries both, so they go
 * through the same client as everything else.
 *
 * This file stays as a re-export barrel rather than having every page import
 * `cms-client.central` directly: the call sites already point here, and it is
 * the one place the reader's whole data surface is listed.
 */

export const getPillars = central.getPillars;
export const getNavPillars = central.getNavPillars;
export const getRecentArticles = central.getRecentArticles;
export const getArticlesPage = central.getArticlesPage;
export const getArticlesAfter = central.getArticlesAfter;
export const getArticlesByPillar = central.getArticlesByPillar;
export const getRelatedArticles = central.getRelatedArticles;
export const getArticleBySlug = central.getArticleBySlug;
export const getArticlesByIds = central.getArticlesByIds;
export const getArticleBySlugDraft = central.getArticleBySlugDraft;
export const searchArticles = central.searchArticles;
export const getDeepDive = central.getDeepDive;
export const getSponsoredArticle = central.getSponsoredArticle;
export const getPinnedLatest = central.getPinnedLatest;
export const getWireDrops = central.getWireDrops;
export const getCorrections = central.getCorrections;
export const getPaywallThreshold = central.getPaywallThreshold;
export const getNewsletters = central.getNewsletters;
export const getFeedArticles = central.getFeedArticles;
export const getSitemapArticles = central.getSitemapArticles;
export const getLatestBriefs = central.getLatestBriefs;
export const getBriefsPage = central.getBriefsPage;

// ─── Dashboards (AI Leaderboard) ─────────────────────────────────────────────
export const getAiModels = central.getAiModels;
export const getDashboardMethodology = central.getDashboardMethodology;
export const getDashboardSponsorSlot = central.getDashboardSponsorSlot;

// Types come from the central client, which owns the canonical shapes.
export type {
  Article,
  Pillar,
  Author,
  WireDrop,
  Tag,
  Correction,
  Newsletter,
  SponsorSlot,
  FeedArticle,
  LatestBriefs,
} from "@/lib/cms-client.central";
