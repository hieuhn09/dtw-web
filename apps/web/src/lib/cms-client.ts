import "server-only";
import { cookies } from "next/headers";
import { unstable_cache } from "next/cache";
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
import {
  fetchArticles,
  fetchArticleBySlug,
  fetchPreview,
  fetchSite,
  fetchModule,
} from "./central-api";

/**
 * Drop-in replacement for `payload-server.ts`, backed by the Central CMS public
 * read API instead of a local Payload instance. Same export surface (names,
 * args, return shapes) so the reader pages only need their import path flipped
 * (`@/lib/cms-client` → `@/lib/cms-client`) at cutover.
 *
 * The Central CMS returns Payload documents in the SAME shape DTW expects
 * (central generalizes DTW's schema). Where a field name or shape differs — a
 * pillar/tag `title` comes back already localized to a plain string (not the
 * `{ en, vi, id }` group), and the published state lives on `workflowStatus`,
 * not `_status` — we adapt here so the returned value matches what
 * `payload-server.ts` returned.
 *
 * Like the old payload-server, this layer is English-only: the reader passes no
 * locale, so the API returns content in the tenant's default language (en) with
 * per-field fallback. (Central still stores vi/id; wiring locale through the
 * reader is a later step and would change these signatures.)
 *
 * Cache tags + revalidate windows are preserved verbatim from payload-server so
 * the Central revalidate webhook (POST /api/revalidate) busts the same surfaces.
 *
 * IMPORTANT: import only from server components / route handlers — `"server-only"`
 * throws if it leaks into a client bundle.
 */

// Preview-token cookie set by the /preview route (draft mode). Read by
// getArticleBySlugDraft to fetch the draft from the signed preview endpoint.
const PREVIEW_COOKIE = "dtw_preview_token";

// ──────────────────────────────────────────────────────────────────────────────
// Cache-tag conventions (kept identical to payload-server.ts):
//   articles:all          → list of all published articles
//   pillars:all           → pillars taxonomy (for nav)
//   wire-drops            → homepage Wire Drops band
//   corrections:all       → /trust/corrections log
//   settings:paywall      → CMS-configurable paywall/nudge threshold
//   newsletters:all       → reader newsletter products
// ──────────────────────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────────────────────
// Pillars / nav
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Central returns pillar `title` already localized to the tenant's default
 * locale (a plain string). Older/legacy rows can still hold an { en, vi, id }
 * object coerced into a JSON-string blob, so parse defensively so the nav label
 * never leaks raw JSON. Falls back en → slug; vi/id fall back to en (matching
 * the old payload-server, whose title group carried the same fallbacks).
 */
function parsePillarTitle(raw: unknown, slug: string): NavPillar["title"] {
  let obj: { en?: string; vi?: string; id?: string } | null = null;
  if (raw && typeof raw === "object") {
    obj = raw as { en?: string; vi?: string; id?: string };
  } else if (typeof raw === "string") {
    const s = raw.trim();
    if (s.startsWith("{")) {
      try {
        obj = JSON.parse(s);
      } catch {
        /* not JSON — treat as a plain string below */
      }
    }
    if (!obj) {
      const v = raw || slug;
      return { en: v, vi: v, id: v };
    }
  }
  const en = obj?.en || slug;
  return { en, vi: obj?.vi || en, id: obj?.id || en };
}

interface RawPillar {
  id: number | string;
  slug: string;
  title?: unknown;
  heading?: string | null;
  color: string;
  icon: string;
  order?: number | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const getPillars = unstable_cache(
  async (): Promise<Pillar[]> => {
    const { pillars } = await fetchSite("en");
    return (pillars as RawPillar[]).map((d) => ({
      ...(d as unknown as Pillar),
      title: parsePillarTitle(d.title, d.slug),
    }));
  },
  ["pillars:all"],
  { tags: ["pillars:all"], revalidate: 300 }
);

/**
 * Lean, client-serializable pillar list for the header nav + homepage Pillar
 * Showcase, ordered by the CMS `order` field. Shares the `pillars:all` cache
 * tag, so the same revalidate webhook busts it.
 */
export const getNavPillars = unstable_cache(
  async (): Promise<NavPillar[]> => {
    const { pillars } = await fetchSite("en");
    return (pillars as RawPillar[]).map((d) => ({
      slug: d.slug,
      title: parsePillarTitle(d.title, d.slug),
      color: d.color,
      icon: d.icon,
      order: d.order ?? 0,
    }));
  },
  ["nav-pillars"],
  { tags: ["pillars:all"], revalidate: 300 }
);

// ──────────────────────────────────────────────────────────────────────────────
// Article feeds
// ──────────────────────────────────────────────────────────────────────────────

export const getRecentArticles = unstable_cache(
  async (limit = 12): Promise<Article[]> => {
    const { docs } = await fetchArticles<Article>({ limit, sort: "-publishedAt" });
    return docs;
  },
  ["articles:recent"],
  { tags: ["articles:all"], revalidate: 60 }
);

export interface ArticlesPage {
  docs: Article[];
  /** True total matching the filter (server-side count), not just this page —
   *  drives the "N stories" badge and end-of-feed. */
  totalDocs: number;
  hasNextPage: boolean;
  page: number;
}

/**
 * Paginated article feed for the pillar listing pages. `pillarSlug === "latest"`
 * is the cross-beat firehose (no pillar filter). Any other slug filters to that
 * pillar (primary OR cross-posted, since central matches secondarySections too).
 * Unknown slug → empty page (the API returns an empty envelope for an unresolved
 * pillar).
 */
export const getArticlesPage = unstable_cache(
  async (
    pillarSlug: string,
    page = 1,
    pageSize = 21
  ): Promise<ArticlesPage> => {
    const params =
      pillarSlug === "latest"
        ? { page, limit: pageSize, sort: "-publishedAt" }
        : { pillar: pillarSlug, page, limit: pageSize, sort: "-publishedAt" };
    const r = await fetchArticles<Article>(params);
    return { docs: r.docs, totalDocs: r.totalDocs, hasNextPage: r.hasNextPage, page: r.page ?? page };
  },
  ["articles:page"],
  { tags: ["articles:all"], revalidate: 60 }
);

export const getArticlesByPillar = unstable_cache(
  async (pillarSlug: string, limit = 21): Promise<Article[]> => {
    const { docs } = await fetchArticles<Article>({
      pillar: pillarSlug,
      limit,
      sort: "-publishedAt",
    });
    return docs;
  },
  ["articles:by-pillar"],
  { tags: ["articles:all"], revalidate: 60 }
);

/**
 * Read-only single-article fetch (published only). The API returns the tenant's
 * default-locale content with per-field fallback, so — unlike the old
 * payload-server — no English pre-fetch is needed.
 */
export const getArticleBySlug = unstable_cache(
  async (slug: string): Promise<Article | null> => {
    return fetchArticleBySlug<Article>(slug, "en");
  },
  ["article:by-slug"],
  { tags: ["articles:all"], revalidate: 60 }
);

/**
 * Batch article hydration for a caller-supplied id list (e.g. a signed-in
 * reader's `bookmarks`/`reading_history` article ids). Published-only: if a
 * saved/read article is unpublished later, it silently drops from the list.
 * Shares the `articles:all` tag with every other article read in this file.
 * Caches the *article content* (public, published-only) — never the
 * *which-user-saved-what* id list, which is fetched fresh per request; distinct
 * id sets naturally produce distinct `unstable_cache` entries under this key.
 */
export const getArticlesByIds = unstable_cache(
  async (ids: ReadonlyArray<string>): Promise<Article[]> => {
    const unique = Array.from(new Set(ids)).filter(Boolean);
    if (!unique.length) return [];
    const { docs } = await fetchArticles<Article>({
      ids: unique.join(","),
      limit: unique.length,
    });
    return docs;
  },
  ["articles:by-ids"],
  { tags: ["articles:all"], revalidate: 60 }
);

/**
 * Draft-aware single-article fetch — NOT cached, NOT status-filtered. Only used
 * when Next draft mode is on (enabled by the /preview route, which also stores a
 * signed preview token cookie). With a token we fetch the draft from the signed
 * preview endpoint; without one we fall back to the published copy.
 */
export async function getArticleBySlugDraft(slug: string): Promise<Article | null> {
  const token = (await cookies()).get(PREVIEW_COOKIE)?.value;
  if (token) {
    const draft = await fetchPreview<Article>(token, "en");
    if (draft) return draft;
  }
  return fetchArticleBySlug<Article>(slug, "en");
}

/**
 * Full-text-ish article search (title + dek), published only. Uncached
 * (per-query, low-traffic) — mirrors payload-server.
 */
export async function searchArticles(q: string, limit = 40): Promise<Article[]> {
  const { docs } = await fetchArticles<Article>({ q: q.trim(), limit, sort: "-publishedAt" });
  return docs;
}

// ── One-flag feeds ───────────────────────────────────────────────────────────

export const getDeepDive = unstable_cache(
  async (): Promise<Article | null> => {
    const { docs } = await fetchArticles<Article>({
      flag: "deepDive",
      limit: 1,
      sort: "-publishedAt",
    });
    return docs[0] ?? null;
  },
  ["articles:deep-dive"],
  { tags: ["articles:all"], revalidate: 60 }
);

export const getSponsoredArticle = unstable_cache(
  async (): Promise<Article | null> => {
    const { docs } = await fetchArticles<Article>({
      flag: "sponsored",
      limit: 1,
      sort: "-publishedAt",
    });
    return docs[0] ?? null;
  },
  ["articles:sponsored"],
  { tags: ["articles:all"], revalidate: 60 }
);

/**
 * The single article an editor has pinned to the top of the Latest feed. Newest
 * wins if several are flagged; null when nothing is pinned. Shares the
 * `articles:all` cache tag, so ticking/unticking reflects within ~1 minute.
 */
export const getPinnedLatest = unstable_cache(
  async (): Promise<Article | null> => {
    const { docs } = await fetchArticles<Article>({
      flag: "pinnedToLatest",
      limit: 1,
      sort: "-publishedAt",
    });
    return docs[0] ?? null;
  },
  ["articles:pinned-latest"],
  { tags: ["articles:all"], revalidate: 60 }
);

// ──────────────────────────────────────────────────────────────────────────────
// Feature modules (wire / corrections / newsletters)
// ──────────────────────────────────────────────────────────────────────────────

export const getWireDrops = unstable_cache(
  async (limit = 12): Promise<WireDrop[]> => {
    // Central already drops expired items; just take the newest `limit`.
    const data = await fetchModule("wire", "en");
    const rows = (data.wireDrops as WireDrop[] | undefined) ?? [];
    return rows.slice(0, limit);
  },
  ["wire-drops"],
  { tags: ["wire-drops"], revalidate: 30 }
);

export const getCorrections = unstable_cache(
  async (): Promise<Correction[]> => {
    const data = await fetchModule("corrections", "en");
    return (data.corrections as Correction[] | undefined) ?? [];
  },
  ["corrections:all"],
  { tags: ["corrections:all"], revalidate: 300 }
);

/**
 * CMS-configurable guest/soft-paywall read threshold (invariant #4 — never
 * hardcode "3"). GAP: central's public read API does NOT expose paywall
 * settings, so this returns the same default the old payload-server fell back to
 * (3). Signature + cache tag are preserved so call sites and the revalidate
 * webhook keep working.
 *
 * TODO: expose paywall in central /site (add a `paywall` block to the site
 * payload, then read it here) so an editor's threshold change reaches the reader.
 */
export const getPaywallThreshold = unstable_cache(
  async (): Promise<number> => {
    return 3;
  },
  ["settings:paywall"],
  { tags: ["settings:paywall"], revalidate: 300 }
);

/**
 * Active newsletter products (Account → Newsletters tab, `/newsletters`,
 * homepage `NewsletterCta`). Central sorts by `order` and populates `vertical`
 * to the full Pillar; we drop any explicitly-inactive rows to match the old
 * payload-server's `active: true` filter.
 */
export const getNewsletters = unstable_cache(
  async (): Promise<Newsletter[]> => {
    const data = await fetchModule("newsletters", "en");
    const rows = (data.newsletters as Newsletter[] | undefined) ?? [];
    return rows.filter((n) => n.active !== false);
  },
  ["newsletters:all"],
  { tags: ["newsletters:all"], revalidate: 300 }
);

export type { Article, Pillar, Author, WireDrop, Tag, Correction, Newsletter };
