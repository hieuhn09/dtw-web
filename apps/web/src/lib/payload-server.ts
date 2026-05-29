import "server-only";
import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import config from "../../payload.config";
import type { Article, Pillar, Author, WireDrop, Tag } from "../payload/payload-types";

/**
 * Server-side Payload client + cached query helpers.
 *
 * `payload()` returns the singleton; `unstable_cache` wraps domain queries with
 * Next.js cache tags so the afterChange hook (E3c) can invalidate the right
 * surfaces by tag. Every cached query MUST declare its tag set; see the
 * comments on each function for which surface each tag controls.
 *
 * IMPORTANT: import this only from server components / route handlers — the
 * `"server-only"` line above will throw if it leaks into a client bundle.
 */

declare global {
  // eslint-disable-next-line no-var
  var __payload: Awaited<ReturnType<typeof getPayload>> | undefined;
}

async function payload() {
  if (globalThis.__payload) return globalThis.__payload;
  const instance = await getPayload({ config });
  if (process.env.NODE_ENV !== "production") {
    globalThis.__payload = instance;
  }
  return instance;
}

// ──────────────────────────────────────────────────────────────────────────────
// Cache-tag conventions:
//   articles:all          → list of all published articles
//   article:<slug>        → single article
//   pillar:<slug>         → pillar listing surface
//   pillars:all           → pillars taxonomy (for nav)
//   wire-drops            → homepage Wire Drops band (refreshed often by hook)
// ──────────────────────────────────────────────────────────────────────────────

export const getPillars = unstable_cache(
  async (): Promise<Pillar[]> => {
    const p = await payload();
    const r = await p.find({
      collection: "pillars",
      sort: "order",
      limit: 24,
      depth: 0,
    });
    return r.docs;
  },
  ["pillars:all"],
  { tags: ["pillars:all"], revalidate: 300 }
);

export const getRecentArticles = unstable_cache(
  async (limit = 12): Promise<Article[]> => {
    const p = await payload();
    const r = await p.find({
      collection: "articles",
      sort: "-publishedAt",
      limit,
      depth: 1,
    });
    return r.docs;
  },
  ["articles:recent"],
  { tags: ["articles:all"], revalidate: 60 }
);

export const getArticlesByPillar = unstable_cache(
  async (pillarSlug: string, limit = 21): Promise<Article[]> => {
    const p = await payload();
    const pillars = await p.find({
      collection: "pillars",
      where: { slug: { equals: pillarSlug } },
      limit: 1,
      depth: 0,
    });
    const pillarId = pillars.docs[0]?.id;
    if (pillarId == null) return [];
    const r = await p.find({
      collection: "articles",
      where: { pillar: { equals: pillarId } },
      sort: "-publishedAt",
      limit,
      depth: 1,
    });
    return r.docs;
  },
  ["articles:by-pillar"],
  { tags: ["articles:all"], revalidate: 60 }
);

export const getArticleBySlug = unstable_cache(
  async (slug: string): Promise<Article | null> => {
    const p = await payload();
    const r = await p.find({
      collection: "articles",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
    });
    return r.docs[0] ?? null;
  },
  ["article:by-slug"],
  { tags: ["articles:all"], revalidate: 60 }
);

export const getDeepDive = unstable_cache(
  async (): Promise<Article | null> => {
    const p = await payload();
    const r = await p.find({
      collection: "articles",
      where: { deepDive: { equals: true } },
      sort: "-publishedAt",
      limit: 1,
      depth: 1,
    });
    return r.docs[0] ?? null;
  },
  ["articles:deep-dive"],
  { tags: ["articles:all"], revalidate: 60 }
);

export const getSponsoredArticle = unstable_cache(
  async (): Promise<Article | null> => {
    const p = await payload();
    const r = await p.find({
      collection: "articles",
      where: { sponsored: { equals: true } },
      sort: "-publishedAt",
      limit: 1,
      depth: 1,
    });
    return r.docs[0] ?? null;
  },
  ["articles:sponsored"],
  { tags: ["articles:all"], revalidate: 60 }
);

export const getWireDrops = unstable_cache(
  async (limit = 12): Promise<WireDrop[]> => {
    const p = await payload();
    const r = await p.find({
      collection: "wireDrops",
      sort: "-publishedAt",
      limit,
      depth: 0,
    });
    return r.docs;
  },
  ["wire-drops"],
  { tags: ["wire-drops"], revalidate: 30 }
);

export type { Article, Pillar, Author, WireDrop, Tag };
