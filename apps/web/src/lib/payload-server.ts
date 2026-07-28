import "server-only";
import { unstable_cache } from "next/cache";
import { getPayload, type Where } from "payload";
import config from "../../payload.config";
import type {
  Article,
  Pillar,
  Author,
  WireDrop,
  Tag,
  Correction,
  Newsletter,
} from "../payload/payload-types";
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
//   settings:paywall      → CMS-configurable paywall/nudge threshold
//   newsletters:all       → reader newsletter products (Account tab, /newsletters, homepage CTA)
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

/**
 * The articles immediately after `(publishedAt, id)` in the feed's own
 * `-publishedAt, -id` order — the batch behind "Load more".
 *
 * Cursor rather than page/limit because an append batch (24) is a different
 * size from a route page (25, one of which becomes the lead card). The offsets
 * an append needs — 25, 49, 73 — are not `limit × (page - 1)` for any usable
 * limit, and Payload's `find` has no `offset`. A keyset cursor sidesteps the
 * arithmetic entirely, and it's the same shape `getRelatedArticles` already
 * uses to walk a beat.
 *
 * Pairing `id` with `publishedAt` matters for the same reason it does there:
 * the seed import gave whole batches an identical timestamp, and a date-only
 * comparison would skip every article sharing the cursor's second.
 *
 * `hasMore` comes from over-fetching by one rather than a second count query.
 */
export const getArticlesAfter = unstable_cache(
  async (
    pillarSlug: string,
    afterPublishedAt: string,
    afterId: number,
    limit: number
  ): Promise<{ docs: Article[]; hasMore: boolean }> => {
    const p = await payload();
    const and: Where[] = [{ _status: { equals: "published" } }];
    if (pillarSlug !== "latest") {
      const pillarId = await getPillarIdBySlug(pillarSlug);
      if (pillarId == null) return { docs: [], hasMore: false };
      and.push({ pillar: { equals: pillarId } });
    }
    and.push({
      or: [
        { publishedAt: { less_than: afterPublishedAt } },
        {
          and: [
            { publishedAt: { equals: afterPublishedAt } },
            { id: { less_than: afterId } },
          ],
        },
      ],
    });
    const r = await p.find({
      collection: "articles",
      where: { and },
      sort: ["-publishedAt", "-id"],
      limit: limit + 1,
      depth: 1,
    });
    return { docs: r.docs.slice(0, limit), hasMore: r.docs.length > limit };
  },
  ["articles:after"],
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

/**
 * The "Read next" row under an article.
 *
 * Deliberately NOT `getArticlesByPillar`: that helper sorts `-publishedAt` from
 * the top with no cursor, so every article in a beat received the same handful
 * of newest stories. The result was a link graph where every arrow pointed at
 * recent articles and none pointed back into the archive — a crawl from the
 * listing pages and feeds reached 228 of 776 articles, and the remaining 548
 * were linked from nowhere but the sitemap.
 *
 * This walks the pillar's own ordering instead: the articles sitting
 * immediately *before* `(publishedAt, id)` in the `-publishedAt, -id` sequence.
 * That turns each beat into a chain (newest → older → … → oldest), so a crawler
 * entering at any article can walk to the end of it. It is also the better
 * editorial default — "Read next" pointing at stories the reader just scrolled
 * past on the homepage is wasted space.
 *
 * The `(publishedAt, id)` pair is a keyset cursor, not a plain
 * `publishedAt <` filter: the seed import gave whole batches an identical
 * timestamp, and a date-only comparison would jump the entire batch, stranding
 * every article in it. Pairing with `id` gives the total order the chain needs
 * to actually visit all of them.
 *
 * The oldest article in a pillar has no older neighbour, so it wraps to the
 * newest — the row never renders empty, and the chain closes into a loop.
 */
export const getRelatedArticles = unstable_cache(
  async (
    pillarSlug: string,
    publishedAt: string,
    currentId: number,
    limit = 3
  ): Promise<Article[]> => {
    const p = await payload();
    // Resolve the slug directly rather than via getPillarIdBySlug: that helper
    // maps "latest" to null for getArticlesPage's all-beats firehose, but here
    // "latest" is an ordinary beat whose articles chain among themselves.
    const pillars = await p.find({
      collection: "pillars",
      where: { slug: { equals: pillarSlug } },
      limit: 1,
      depth: 0,
    });
    const pillarId = pillars.docs[0]?.id;
    if (pillarId == null) return [];

    const base: Where[] = [
      { pillar: { equals: pillarId } },
      { _status: { equals: "published" } },
    ];
    const sort = ["-publishedAt", "-id"];

    const older = await p.find({
      collection: "articles",
      where: {
        and: [
          ...base,
          {
            or: [
              { publishedAt: { less_than: publishedAt } },
              {
                and: [
                  { publishedAt: { equals: publishedAt } },
                  { id: { less_than: currentId } },
                ],
              },
            ],
          },
        ],
      },
      sort,
      limit,
      depth: 1,
    });
    if (older.docs.length >= limit) return older.docs;

    // Wrap-around. Over-fetch by the number already held plus one, so the
    // current article and the older neighbours can be dropped without the
    // window coming up short.
    const newest = await p.find({
      collection: "articles",
      where: { and: [...base, { id: { not_equals: currentId } }] },
      sort,
      limit: limit + older.docs.length + 1,
      depth: 1,
    });
    const picked = [...older.docs];
    const seen = new Set(picked.map((d) => d.id));
    for (const doc of newest.docs) {
      if (picked.length >= limit) break;
      if (seen.has(doc.id)) continue;
      seen.add(doc.id);
      picked.push(doc);
    }
    return picked;
  },
  ["articles:related"],
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
 * Batch article hydration for a caller-supplied id list (e.g. a signed-in
 * reader's `bookmarks`/`reading_history` article ids, both `string`-typed —
 * see `ArticleView.id`). Published-only: if a saved/read article is
 * unpublished later, it silently drops from the caller's list — the
 * underlying Drizzle row is untouched, only the hydration join drops it.
 * Shares the `articles:all` tag with every other article read in this file.
 *
 * Caches the *article content* (public, published-only) — never the
 * *which-user-saved-what* id list, which is always fetched fresh, per
 * request, from `lib/session.ts`'s `listBookmarks`/`listHistory`/
 * `listFollows` inside the `force-dynamic` `/account` route. Different
 * users' distinct id sets naturally produce distinct `unstable_cache` entries
 * under this same key namespace — safe, since it's public article content
 * being cached, not per-user state.
 */
export const getArticlesByIds = unstable_cache(
  async (ids: ReadonlyArray<string>): Promise<Article[]> => {
    const unique = Array.from(new Set(ids)).filter(Boolean);
    if (!unique.length) return [];
    const p = await payload();
    const r = await p.find({
      collection: "articles",
      where: { and: [{ id: { in: unique } }, { _status: { equals: "published" } }] },
      depth: 1,
      limit: unique.length,
    });
    return r.docs;
  },
  ["articles:by-ids"],
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

/**
 * CMS-configurable guest/soft-paywall read threshold (invariant #4 — never
 * hardcode "3"). Falls back to 3 (today's hardcoded value) if the Global's
 * migration hasn't run yet on this deploy (preview builds — see
 * getPinnedLatest above for the same pattern).
 */
export const getPaywallThreshold = unstable_cache(
  async (): Promise<number> => {
    const p = await payload();
    try {
      const g = await p.findGlobal({ slug: "paywallSettings" });
      return typeof g?.paywallThreshold === "number" ? g.paywallThreshold : 3;
    } catch (err) {
      console.warn(
        "[getPaywallThreshold] query failed — global not migrated yet?",
        (err as Error)?.message
      );
      return 3;
    }
  },
  ["settings:paywall"],
  { tags: ["settings:paywall"], revalidate: 300 }
);

/**
 * Active newsletter products (Account → Newsletters tab, `/newsletters`,
 * homepage `NewsletterCta`) — all three read this one cached helper. `depth:
 * 1` so `doc.vertical` resolves to the full `Pillar` object (used for the
 * pillar accent color in the newsletter picker cards).
 */
export const getNewsletters = unstable_cache(
  async (): Promise<Newsletter[]> => {
    const p = await payload();
    const r = await p.find({
      collection: "newsletters",
      where: { active: { equals: true } },
      sort: "order",
      limit: 12,
      depth: 1,
    });
    return r.docs;
  },
  ["newsletters:all"],
  { tags: ["newsletters:all"], revalidate: 300 }
);

/**
 * Lean projection for `sitemap.ts` (SEO plan RFC-007) — slug + timestamps
 * only, no relationship expansion (`depth: 0`), `limit: 0` (Payload's
 * documented "no pagination cap, return every matching doc" value). Shares
 * the `articles:all` cache tag with every other article read in this file,
 * so publish/unpublish/edit events (already firing via `revalidateArticle`)
 * keep the sitemap in sync without any new invalidation path.
 */
/**
 * Fields the Atom feeds (`/rss.xml`, `/[pillar]/rss.xml`) render per entry.
 * `author`/`pillar` stay in Payload's `number | Doc` relation shape — the
 * builder narrows on `typeof === "object"` like article-view does.
 */
export type FeedArticle = Pick<
  Article,
  "id" | "title" | "slug" | "dek" | "publishedAt" | "updatedAt" | "author" | "pillar" | "sponsored"
>;

/**
 * Newest published articles for the Atom feeds. depth 1 populates the
 * `author` + `pillar` relations for `<author>`/`<category>`; the select keeps
 * the row lean (no Lexical body). 50 entries is the news-feed norm —
 * aggregators poll, they don't paginate. `pillarId === null` → sitewide
 * firehose (also serves the "latest" pillar, which is all beats by
 * definition). Shares the `articles:all` tag so the E3c afterChange hook
 * busts feeds on publish/edit/unpublish; unstable_cache keys on the
 * `pillarId` argument, so each pillar's feed caches independently.
 */
export const getFeedArticles = unstable_cache(
  async (pillarId: number | null = null): Promise<FeedArticle[]> => {
    const p = await payload();
    const and: Where[] = [{ _status: { equals: "published" } }];
    if (pillarId != null) and.push({ pillar: { equals: pillarId } });
    const r = await p.find({
      collection: "articles",
      where: { and },
      sort: ["-publishedAt", "-id"],
      limit: 50,
      depth: 1,
      select: {
        id: true,
        title: true,
        slug: true,
        dek: true,
        publishedAt: true,
        updatedAt: true,
        author: true,
        pillar: true,
        sponsored: true,
      },
    });
    return r.docs;
  },
  ["articles:feed"],
  { tags: ["articles:all"], revalidate: 300 }
);

export const getSitemapArticles = unstable_cache(
  async (): Promise<Array<Pick<Article, "slug" | "updatedAt" | "publishedAt">>> => {
    const p = await payload();
    const r = await p.find({
      collection: "articles",
      where: { _status: { equals: "published" } },
      select: { slug: true, updatedAt: true, publishedAt: true },
      limit: 0,
      depth: 0,
    });
    return r.docs;
  },
  ["articles:sitemap"],
  { tags: ["articles:all"], revalidate: 900 }
);

export type { Article, Pillar, Author, WireDrop, Tag, Correction, Newsletter };
