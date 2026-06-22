import "server-only";
import { unstable_cache } from "next/cache";
import { getPayload, type Where } from "payload";
import config from "../../payload.config";
import type { Article, Pillar, Author, WireDrop, Tag, Correction } from "../payload/payload-types";
import type { NavPillar } from "./data";

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

/**
 * Lean, client-serializable pillar list for the header nav + homepage Pillar
 * Showcase, ordered by the CMS `order` field. This is the surface that makes an
 * editor's /admin reorder actually move the nav (invariant #8). Shares the
 * `pillars:all` cache tag, so the same afterChange hook busts it.
 */
export const getNavPillars = unstable_cache(
  async (): Promise<NavPillar[]> => {
    const p = await payload();
    const r = await p.find({
      collection: "pillars",
      sort: "order",
      limit: 24,
      depth: 0,
    });
    return r.docs.map((d) => ({
      slug: d.slug,
      title: {
        en: d.title?.en ?? d.slug,
        vi: d.title?.vi || d.title?.en || d.slug,
        id: d.title?.id || d.title?.en || d.slug,
      },
      color: d.color,
      icon: d.icon,
      order: d.order ?? 0,
    }));
  },
  ["nav-pillars"],
  { tags: ["pillars:all"], revalidate: 300 }
);

export const getRecentArticles = unstable_cache(
  async (limit = 12): Promise<Article[]> => {
    const p = await payload();
    const r = await p.find({
      collection: "articles",
      where: { _status: { equals: "published" } },
      sort: "-publishedAt",
      limit,
      depth: 1,
    });
    return r.docs;
  },
  ["articles:recent"],
  { tags: ["articles:all"], revalidate: 60 }
);

/**
 * Resolve a pillar slug to its CMS id (cached). Returns null for "latest" (the
 * all-beats feed has no single pillar) and for unknown slugs. Shared by the
 * paginated feed + section scan so neither re-queries the pillars table on every
 * "Load more" page.
 */
const getPillarIdBySlug = unstable_cache(
  async (pillarSlug: string): Promise<string | number | null> => {
    if (pillarSlug === "latest") return null;
    const p = await payload();
    const pillars = await p.find({
      collection: "pillars",
      where: { slug: { equals: pillarSlug } },
      limit: 1,
      depth: 0,
    });
    return pillars.docs[0]?.id ?? null;
  },
  ["pillar:id-by-slug"],
  { tags: ["pillars:all"], revalidate: 300 }
);

export interface ArticlesPage {
  docs: Article[];
  /** True total matching the filter (Payload counts server-side), not just the
   *  count returned on this page — drives the "N stories" badge and end-of-feed. */
  totalDocs: number;
  hasNextPage: boolean;
  page: number;
}

/**
 * Paginated article feed for the pillar listing pages. Payload paginates
 * natively, so this scales past any in-memory cap — "Load more" just asks for
 * the next `page`.
 *
 * `pillarSlug === "latest"` is the cross-beat firehose: it skips the pillar
 * filter and returns every published article, newest first (the "Latest" pillar
 * is an all-beats feed — see its CMS description in scripts/seed-payload.ts).
 * Any other slug filters to that pillar. Returns an empty page for an unknown
 * pillar slug.
 */
export const getArticlesPage = unstable_cache(
  async (
    pillarSlug: string,
    page = 1,
    pageSize = 21
  ): Promise<ArticlesPage> => {
    const p = await payload();
    const and: Where[] = [{ _status: { equals: "published" } }];
    if (pillarSlug !== "latest") {
      const pillarId = await getPillarIdBySlug(pillarSlug);
      if (pillarId == null) return { docs: [], totalDocs: 0, hasNextPage: false, page: 1 };
      and.push({ pillar: { equals: pillarId } });
    }
    // `-id` is a stable, unique tiebreaker: without it, articles that share the
    // exact same publishedAt could be ordered differently between page requests,
    // letting one slip across a page boundary (skip/dup). Offset pagination still
    // can't fully isolate a feed that mutates mid-paging, but the client dedupes
    // by id on append, so the common "new article published while paging" case
    // produces a harmless duplicate (filtered), not a gap.
    const r = await p.find({
      collection: "articles",
      where: { and },
      sort: ["-publishedAt", "-id"],
      page,
      limit: pageSize,
      depth: 1,
    });
    return { docs: r.docs, totalDocs: r.totalDocs, hasNextPage: r.hasNextPage, page: r.page ?? page };
  },
  ["articles:page"],
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
      where: {
        and: [{ pillar: { equals: pillarId } }, { _status: { equals: "published" } }],
      },
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
      where: {
        and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }],
      },
      limit: 1,
      depth: 2,
    });
    return r.docs[0] ?? null;
  },
  ["article:by-slug"],
  { tags: ["articles:all"], revalidate: 60 }
);

/**
 * Draft-aware single-article fetch — NOT cached and NOT status-filtered.
 * Only called from the article page when Next.js draft mode is enabled, which
 * can only be turned on by the authenticated `/preview` route. Lets editors see
 * an unpublished draft exactly as it will render, without leaking drafts to the
 * public (the cached `getArticleBySlug` above stays published-only).
 */
export async function getArticleBySlugDraft(slug: string): Promise<Article | null> {
  const p = await payload();
  const r = await p.find({
    collection: "articles",
    where: { slug: { equals: slug } },
    draft: true,
    overrideAccess: true,
    limit: 1,
    depth: 2,
  });
  return r.docs[0] ?? null;
}

/**
 * Full-text-ish article search — Postgres `like` on title + dek, published only.
 * Uncached (results are per-query and low-traffic). No Meilisearch: substring
 * match, not typo-tolerant — sufficient for a launch-size archive; Meilisearch
 * is a later (P2) upgrade once the archive and query volume grow.
 */
export async function searchArticles(q: string, limit = 40): Promise<Article[]> {
  const query = q.trim();
  const p = await payload();
  const r = await p.find({
    collection: "articles",
    where: query
      ? {
          and: [
            { _status: { equals: "published" } },
            { or: [{ title: { like: query } }, { dek: { like: query } }] },
          ],
        }
      : { _status: { equals: "published" } },
    sort: "-publishedAt",
    limit,
    depth: 1,
  });
  return r.docs;
}

export const getDeepDive = unstable_cache(
  async (): Promise<Article | null> => {
    const p = await payload();
    const r = await p.find({
      collection: "articles",
      where: {
        and: [{ deepDive: { equals: true } }, { _status: { equals: "published" } }],
      },
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
      where: {
        and: [{ sponsored: { equals: true } }, { _status: { equals: "published" } }],
      },
      sort: "-publishedAt",
      limit: 1,
      depth: 1,
    });
    return r.docs[0] ?? null;
  },
  ["articles:sponsored"],
  { tags: ["articles:all"], revalidate: 60 }
);

/**
 * The single article an editor has pinned to the top of the Latest feed. Same
 * one-flag pattern as getDeepDive/getSponsoredArticle. Newest wins if several
 * are flagged; null when nothing is pinned. Shares the `articles:all` cache
 * tag, so ticking/unticking the checkbox in the CMS reflects within ~1 minute.
 */
export const getPinnedLatest = unstable_cache(
  async (): Promise<Article | null> => {
    const p = await payload();
    try {
      const r = await p.find({
        collection: "articles",
        where: {
          and: [{ pinnedToLatest: { equals: true } }, { _status: { equals: "published" } }],
        },
        sort: "-publishedAt",
        limit: 1,
        depth: 1,
      });
      return r.docs[0] ?? null;
    } catch (err) {
      // The `pinned_to_latest` column ships in a migration that only runs on
      // production deploys (migrate-prod.mjs is gated to VERCEL_ENV=production).
      // Preview/branch builds prerender this query before the column exists, so
      // fail open to "nothing pinned" rather than crashing the whole build. Once
      // the migration has run the query succeeds normally.
      console.warn(
        "[getPinnedLatest] query failed — column not migrated yet?",
        (err as Error)?.message
      );
      return null;
    }
  },
  ["articles:pinned-latest"],
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

export const getCorrections = unstable_cache(
  async (): Promise<Correction[]> => {
    const p = await payload();
    const r = await p.find({
      collection: "corrections",
      sort: "-correctionDate",
      limit: 200,
      depth: 1, // expand the article (title/slug) + editor (name)
    });
    return r.docs;
  },
  ["corrections:all"],
  { tags: ["corrections:all"], revalidate: 300 }
);

export type { Article, Pillar, Author, WireDrop, Tag, Correction };
