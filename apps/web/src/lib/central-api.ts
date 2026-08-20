import "server-only";

/**
 * Typed fetch layer for the Central CMS public read API.
 *
 * The reader site no longer talks to a local Payload/Postgres — it reads
 * published content over HTTP from the shared Central CMS. Every request carries
 * the tenant's read token as a Bearer header; the token implies the tenant, so
 * responses are already published-only, this-tenant-only, and locale-clamped.
 *
 * These helpers NEVER throw into a page render: on any non-OK response (including
 * 404 for a disabled feature) they resolve to a safe empty shape so a surface
 * degrades to an empty state instead of crashing. `cms-client.ts` wraps these in
 * `unstable_cache` (with the same cache tags the old payload-server used) so the
 * revalidate webhook keeps busting the right surfaces.
 *
 * IMPORTANT: import this only from server components / route handlers — the
 * `"server-only"` line above throws if it leaks into a client bundle.
 */

export const CMS_URL = process.env.CMS_URL || "http://localhost:3508";
export const CMS_READ_TOKEN = process.env.CMS_READ_TOKEN;

/** Payload list envelope returned by the article endpoints. */
export interface CmsListEnvelope<T = unknown> {
  docs: T[];
  totalDocs: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
}

export const EMPTY_LIST: CmsListEnvelope<never> = {
  docs: [],
  totalDocs: 0,
  page: 1,
  totalPages: 0,
  hasNextPage: false,
};

type SearchParams = Record<string, string | number | boolean | null | undefined>;

/**
 * GET `${CMS_URL}/api/public${path}` with the Bearer read token. Returns the
 * parsed JSON on 2xx; on ANY failure (network error, non-OK status, 404 disabled
 * feature, JSON parse error) resolves to `empty` — this must never throw into a
 * render. Reads are `no-store`; caching is the caller's job (`unstable_cache`).
 */
export async function cmsFetch<T>(
  path: string,
  { searchParams, empty }: { searchParams?: SearchParams; empty: T },
): Promise<T> {
  const url = new URL(`/api/public${path}`, CMS_URL);
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }
  try {
    const res = await fetch(url, {
      headers: CMS_READ_TOKEN ? { Authorization: `Bearer ${CMS_READ_TOKEN}` } : {},
      cache: "no-store",
    });
    if (!res.ok) {
      // 404 = disabled feature (or missing doc) → empty. 401/5xx → empty + warn.
      if (res.status !== 404) {
        console.warn(`[central-api] ${url.pathname} → HTTP ${res.status}`);
      }
      return empty;
    }
    return absolutizeMediaUrls(await res.json()) as T;
  } catch (err) {
    console.warn(`[central-api] ${url.pathname} fetch failed:`, (err as Error)?.message);
    return empty;
  }
}

/**
 * Rewrite Central's RELATIVE media URLs to absolute URLs pointing at Central.
 *
 * Central returns `url: "/api/media/file/<name>?prefix=<tenant>"`. Left as-is,
 * the browser resolves that against the site being viewed — dailytechwire.com —
 * so every image request lands on DTW's own Payload instead of Central.
 *
 * The failure is deceptive rather than loud: the local Payload still holds those
 * files, so images keep rendering and the migration looks complete while the site
 * is in fact still served entirely by the old storage. It only breaks on the day
 * the local Payload goes away — or immediately, for any image that only exists in
 * Central.
 *
 * Fixed at the fetch boundary so every media doc is covered (hero, author photo,
 * podcast cover) rather than relying on each call site remembering.
 */
function absolutizeMediaUrls<T>(node: T): T {
  if (Array.isArray(node)) return node.map(absolutizeMediaUrls) as unknown as T;
  if (!node || typeof node !== "object") return node;

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    // Only Payload media paths; other URLs (outbound links, canonicals) pass through.
    out[k] =
      (k === "url" || k === "thumbnailURL") && typeof v === "string" && v.startsWith("/api/media/")
        ? `${CMS_URL}${v}`
        : absolutizeMediaUrls(v);
  }
  return out as T;
}

// ── Typed helpers ───────────────────────────────────────────────────────────

/** Query params accepted by `GET /api/public/articles`. */
export interface FetchArticlesParams {
  locale?: string;
  pillar?: string;
  subsection?: string;
  country?: string;
  tag?: string;
  q?: string;
  ids?: string;
  flag?: "deepDive" | "sponsored" | "pinnedToLatest" | "breaking";
  /**
   * Narrow by what the document IS. Omitted = everything, which is why every
   * news surface has to opt in with "article" — see ARTICLE_ONLY in
   * cms-client.central.ts. Never sent alongside `ids`: the saved/history rails
   * resolve by id and must still return a brief the reader saved.
   */
  content_type?: "article" | "daily-brief";
  page?: number;
  limit?: number;
  sort?: string;
  /**
   * Keyset cursor — return only rows strictly older than (after_published_at,
   * after_id) under the default `-publishedAt` sort. Both must be sent together;
   * the id breaks ties when several articles share a timestamp.
   *
   * Used instead of `page` for infinite scroll: with articles publishing
   * continuously, offset paging shifts under the reader and repeats or skips a
   * story. Requires the matching params on the Central route.
   */
  after_published_at?: string;
  after_id?: number | string;
}

export async function fetchArticles<T = unknown>(
  params: FetchArticlesParams,
): Promise<CmsListEnvelope<T>> {
  return cmsFetch<CmsListEnvelope<T>>("/articles", {
    searchParams: params as SearchParams,
    empty: EMPTY_LIST,
  });
}

export async function fetchArticleBySlug<T = unknown>(
  slug: string,
  locale = "en",
): Promise<T | null> {
  const { doc } = await cmsFetch<{ doc: T | null }>(`/articles/${encodeURIComponent(slug)}`, {
    searchParams: { locale },
    empty: { doc: null },
  });
  return doc ?? null;
}

/** Draft of an article via a signed preview token. Slug is carried in the token. */
export async function fetchPreview<T = unknown>(
  token: string,
  locale = "en",
): Promise<T | null> {
  const { doc } = await cmsFetch<{ doc: T | null }>("/preview", {
    searchParams: { token, locale },
    empty: { doc: null },
  });
  return doc ?? null;
}

export interface CmsSite {
  site: Record<string, unknown> | null;
  pillars: unknown[];
  subsections: unknown[];
}

export async function fetchSite(locale = "en"): Promise<CmsSite> {
  return cmsFetch<CmsSite>("/site", {
    searchParams: { locale },
    empty: { site: null, pillars: [], subsections: [] },
  });
}

export async function fetchMenus<T = unknown>(
  type: "header" | "footer",
  locale = "en",
): Promise<T[]> {
  const { menus } = await cmsFetch<{ menus: T[] }>("/menus", {
    searchParams: { type, locale },
    empty: { menus: [] },
  });
  return menus ?? [];
}

/** Feature-gated content module. Disabled feature → `{}` (404 mapped to empty). */
export async function fetchModule(
  module: "podcasts" | "newsletters" | "corrections" | "wire" | "market" | "dashboards",
  locale = "en",
): Promise<Record<string, unknown[]>> {
  const { data } = await cmsFetch<{ data: Record<string, unknown[]> }>(`/${module}`, {
    searchParams: { locale },
    empty: { data: {} },
  });
  return data ?? {};
}
