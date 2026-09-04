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
  SponsorSlot,
} from "../payload/payload-types";
import type { AiLeaderboardRow, NavPillar } from "./data";
import { AI_LEADERBOARD, BRIEFS_PAGE_SIZE } from "./data";
import { BRIEF_CONTENT_TYPE, briefEdition } from "./brief";
import {
  CENTRAL_PREVIEW_TOKEN_COOKIE,
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

/**
 * Central returns every content type unless asked otherwise, so each news
 * surface opts out of the daily brief explicitly. See NOT_BRIEF in
 * payload-server.ts for why the brief is excluded and which helpers are
 * deliberately left unfiltered — the two modules must stay in step, and
 * cms-client.ts turns a drift into a compile error.
 *
 * Spread into params rather than written inline nine times: a helper that
 * quietly loses it is the failure mode here, and one named constant makes the
 * omission visible in review.
 */
const ARTICLE_ONLY = { content_type: "article" } as const;

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
    const { docs } = await fetchArticles<Article>({ limit, sort: "-publishedAt", ...ARTICLE_ONLY });
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
        ? { page, limit: pageSize, sort: "-publishedAt", ...ARTICLE_ONLY }
        : { pillar: pillarSlug, page, limit: pageSize, sort: "-publishedAt", ...ARTICLE_ONLY };
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
      ...ARTICLE_ONLY,
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
 * when Next draft mode is on, which only `/preview` can turn on, and `/preview`
 * always parks the signed Central token in a cookie first.
 *
 * No cookie means no draft. It used to fall back to the published copy; that
 * fallback went on 04-09-2026 with local Payload, because showing an editor the
 * live version under a "preview" URL is worse than showing them nothing — they
 * read it as "my edit saved and looks like this".
 */
export async function getArticleBySlugDraft(slug: string): Promise<Article | null> {
  const token = (await cookies()).get(CENTRAL_PREVIEW_TOKEN_COOKIE)?.value;
  if (!token) return null;
  const draft = await fetchPreview<Article>(token, "en");
  return draft?.slug === slug ? draft : null;
}

/**
 * Full-text-ish article search (title + dek), published only. Uncached
 * (per-query, low-traffic) — mirrors payload-server.
 */
export async function searchArticles(q: string, limit = 40): Promise<Article[]> {
  const { docs } = await fetchArticles<Article>({ q: q.trim(), limit, sort: "-publishedAt", ...ARTICLE_ONLY });
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
      ...ARTICLE_ONLY,
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

// ──────────────────────────────────────────────────────────────────────────────
// Keyset feed / related / syndication
//
// These four close the gap between this module and payload-server.ts. Without
// them the CMS_SOURCE router below could not be a true drop-in: pillar
// "load more", the article page's related row, RSS, and the sitemap would all
// still reach for the local Payload that no longer holds the content.
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Keyset page for pillar "load more". Uses the central cursor params rather
 * than offset paging: with articles publishing continuously, an offset page 2
 * shifts under the reader and silently repeats or skips a story.
 * `pillarSlug === "latest"` is the cross-beat firehose (no pillar filter).
 */
export const getArticlesAfter = unstable_cache(
  async (
    pillarSlug: string,
    afterPublishedAt: string,
    afterId: number,
    limit: number
  ): Promise<{ docs: Article[]; hasMore: boolean }> => {
    const params: Record<string, string | number> = {
      limit: limit + 1, // fetch one extra to learn hasMore without a second call
      sort: "-publishedAt",
      after_published_at: afterPublishedAt,
      after_id: afterId,
      ...ARTICLE_ONLY,
    };
    if (pillarSlug !== "latest") params.pillar = pillarSlug;
    const { docs } = await fetchArticles<Article>(params);
    return { docs: docs.slice(0, limit), hasMore: docs.length > limit };
  },
  ["articles:after"],
  { tags: ["articles:all"], revalidate: 60 }
);

/**
 * Related row on the article page: the nearest articles in the SAME pillar,
 * older first and then newer, excluding the current one. Mirrors
 * payload-server's behaviour — walk backwards from the current position, and
 * top up with newer articles when the story is near the end of the beat.
 */
export const getRelatedArticles = unstable_cache(
  async (
    pillarSlug: string,
    publishedAt: string,
    currentId: number,
    limit = 3
  ): Promise<Article[]> => {
    const older = await fetchArticles<Article>({
      pillar: pillarSlug,
      limit,
      sort: "-publishedAt",
      after_published_at: publishedAt,
      after_id: currentId,
      ...ARTICLE_ONLY,
    });
    const out = older.docs.slice(0, limit);
    if (out.length >= limit) return out;

    // Not enough older stories — fill from the top of the beat, skipping the
    // current article and anything already collected.
    const newest = await fetchArticles<Article>({
      pillar: pillarSlug,
      limit: limit + out.length + 1,
      sort: "-publishedAt",
      ...ARTICLE_ONLY,
    });
    const taken = new Set<unknown>([currentId, ...out.map((d) => d.id)]);
    for (const d of newest.docs) {
      if (out.length >= limit) break;
      if (taken.has(d.id)) continue;
      taken.add(d.id);
      out.push(d);
    }
    return out;
  },
  ["articles:related"],
  { tags: ["articles:all"], revalidate: 60 }
);

/**
 * RSS payload. payload-server took a numeric pillar ID; the central API filters
 * by slug, so resolve the id through the pillar list rather than changing the
 * signature (the RSS routes pass whatever they already had).
 */
export const getFeedArticles = unstable_cache(
  async (pillarId: number | null = null): Promise<Article[]> => {
    const params: Record<string, string | number> = {
      limit: 50,
      sort: "-publishedAt",
      ...ARTICLE_ONLY,
    };
    if (pillarId != null) {
      const pillars = await getPillars();
      const slug = pillars.find((p) => String(p.id) === String(pillarId))?.slug;
      if (!slug) return [];
      params.pillar = slug;
    }
    const { docs } = await fetchArticles<Article>(params);
    return docs;
  },
  ["articles:feed"],
  { tags: ["articles:all"], revalidate: 300 }
);

/**
 * Every published article for the sitemap. The central API caps `limit` at 50,
 * so page through to the end instead of asking for everything at once — a
 * silently truncated sitemap would drop real URLs out of the index.
 */
export const getSitemapArticles = unstable_cache(
  async (): Promise<Array<Pick<Article, "slug" | "updatedAt" | "publishedAt">>> => {
    const out: Array<Pick<Article, "slug" | "updatedAt" | "publishedAt">> = [];
    for (let page = 1; page <= 200; page += 1) {
      const r = await fetchArticles<Article>({ page, limit: 50, sort: "-publishedAt" });
      out.push(...r.docs.map((d) => ({ slug: d.slug, updatedAt: d.updatedAt, publishedAt: d.publishedAt })));
      if (!r.hasNextPage) return out;
    }
    // 200 pages x 50 = 10k articles. Hitting this means the feed grew past what
    // this loop was sized for — say so rather than silently emitting a short sitemap.
    console.warn("[cms-client] getSitemapArticles stopped at the 200-page guard; sitemap may be incomplete");
    return out;
  },
  ["articles:sitemap"],
  { tags: ["articles:all"], revalidate: 900 }
);

// ──────────────────────────────────────────────────────────────────────────────
// Daily Brief — the surfaces that WANT the brief. Mirrors payload-server.ts.
// ──────────────────────────────────────────────────────────────────────────────

export interface LatestBriefs {
  am: Article | null;
  pm: Article | null;
}

/**
 * Newest published AM and PM edition, for the homepage band and `/briefing`.
 * One query: editions alternate, so the newest handful holds one of each unless
 * a run was skipped (the engine drops thin editions rather than padding them).
 *
 * Fail-open — a brief query that throws must not take the homepage with it.
 * `fetchArticles` already resolves failures to an empty envelope; the try/catch
 * covers anything above it.
 */
export const getLatestBriefs = unstable_cache(
  async (): Promise<LatestBriefs> => {
    try {
      const { docs } = await fetchArticles<Article>({
        content_type: BRIEF_CONTENT_TYPE,
        limit: 10,
        sort: "-publishedAt",
      });
      return {
        am: docs.find((d) => briefEdition(d.slug) === "am") ?? null,
        pm: docs.find((d) => briefEdition(d.slug) === "pm") ?? null,
      };
    } catch (err) {
      console.warn("[getLatestBriefs] query failed:", (err as Error)?.message);
      return { am: null, pm: null };
    }
  },
  ["articles:briefs-latest"],
  { tags: ["articles:all"], revalidate: 60 }
);

/** Paginated brief archive behind `/briefing` and `/briefing/page/[n]`. */
export const getBriefsPage = unstable_cache(
  async (page = 1, pageSize = BRIEFS_PAGE_SIZE): Promise<ArticlesPage> => {
    const r = await fetchArticles<Article>({
      content_type: BRIEF_CONTENT_TYPE,
      page,
      limit: pageSize,
      sort: "-publishedAt",
    });
    return { docs: r.docs, totalDocs: r.totalDocs, hasNextPage: r.hasNextPage, page: r.page ?? page };
  },
  ["articles:briefs-page"],
  { tags: ["articles:all"], revalidate: 60 }
);

// ──────────────────────────────────────────────────────────────────────────────
// Dashboards — the AI Leaderboard
//
// These three read Central's `dashboards` and `sponsors` modules. Until
// 04-09-2026 they were the ONE surface that stayed bound to this repo's local
// Payload in both CMS modes, because Central's schema had no equivalent of the
// `aiModels` collection or the `dashboardMethodology` global. Central grew both
// (its `aiLeaderboardRows` absorbed every `aiModels` column; the copy moved onto
// the tenant), which is what let local Payload be removed from this repo.
// ──────────────────────────────────────────────────────────────────────────────

/** A row as Central sends it, before the null-normalising map below. */
interface CentralLeaderboardRow {
  rank?: number | null;
  model?: string | null;
  maker?: string | null;
  general?: number | null;
  reasoning?: number | null;
  coding?: number | null;
  math?: number | null;
  search?: number | null;
  vision?: number | null;
  inputPrice?: number | null;
  outputPrice?: number | null;
  released?: string | null;
  asOfScores?: string | null;
}

/**
 * AI Leaderboard rows + the newest `asOfScores` across them (the "as of" stamp
 * under the table).
 *
 * Falls back to the static `AI_LEADERBOARD` fixture when Central returns
 * nothing. `central-api` never throws — a disabled feature, a bad token and an
 * outage all resolve to an empty object — so "no rows" is exactly the case the
 * old local implementation caught in its `catch`. An empty leaderboard is a
 * worse answer than eight slightly stale rows.
 */
export const getAiModels = unstable_cache(
  async (): Promise<{ rows: AiLeaderboardRow[]; asOfScores: string | null }> => {
    const data = await fetchModule("dashboards", "en");
    const docs = (data.aiLeaderboardRows as CentralLeaderboardRow[] | undefined) ?? [];
    if (!docs.length) {
      console.warn("[getAiModels] Central returned no rows — falling back to static data");
      return { rows: [...AI_LEADERBOARD], asOfScores: null };
    }

    const rows: AiLeaderboardRow[] = docs.map((d, i) => ({
      rank: d.rank ?? i + 1,
      model: d.model ?? "",
      maker: d.maker ?? "",
      general: d.general ?? null,
      reasoning: d.reasoning ?? null,
      coding: d.coding ?? null,
      math: d.math ?? null,
      search: d.search ?? null,
      vision: d.vision ?? null,
      inputPrice: d.inputPrice ?? null,
      outputPrice: d.outputPrice ?? null,
      released: d.released ?? null,
    }));
    const asOfScores = docs.reduce<string | null>((max, d) => {
      if (!d.asOfScores) return max;
      return !max || d.asOfScores > max ? d.asOfScores : max;
    }, null);
    return { rows, asOfScores };
  },
  ["dashboards:ai"],
  { tags: ["dashboards:ai"], revalidate: 3600 }
);

/**
 * Sponsor slot for a dashboard placement. Narrowed to the single literal
 * `"dashboard_ai"` — that is the only placement this site renders, and a narrow
 * signature makes adding a second one a compile error at the call site rather
 * than a silently empty card.
 *
 * Central applies the startsAt/endsAt window itself, so everything returned is
 * already in flight. We still drop a slot whose populated `article` is not
 * published: an editor unpublishing the sponsored story should not leave a
 * broken sponsor card up.
 */
export const getDashboardSponsorSlot = unstable_cache(
  async (slot: "dashboard_ai"): Promise<SponsorSlot | null> => {
    const data = await fetchModule("sponsors", "en", { slot });
    const docs = (data.sponsorSlots as SponsorSlot[] | undefined) ?? [];
    const doc = docs[0];
    if (!doc) return null;
    const article = doc.article;
    if (article == null) return null;
    if (typeof article === "object" && article._status !== "published") return null;
    return doc;
  },
  ["dashboard-sponsor-slot"],
  { tags: ["sponsor-slots:all"], revalidate: 3600 }
);

/** Localized methodology + disclaimer copy for the AI Leaderboard. */
export interface DashboardMethodologyContent {
  aiMethodology: { en: string; vi: string; id: string };
  disclaimer: { en: string; vi: string; id: string };
}

/** Shape Central sends under `data.methodology` (the tenant's `dashboards` group). */
interface CentralMethodology {
  aiMethodology?: { en?: string | null; vi?: string | null; ind?: string | null } | null;
  disclaimer?: { en?: string | null; vi?: string | null; ind?: string | null } | null;
}

/**
 * Hardcoded fallback, carried over verbatim from the local implementation. It is
 * what renders if the copy has not been written on the tenant yet.
 */
const DASHBOARD_METHODOLOGY_FALLBACK: DashboardMethodologyContent = {
  // Plain-language rewrite (owner, "UX round 2" 2026-07-31).
  aiMethodology: {
    en: "Each model's score is a TrueSkill rating - the same system Xbox uses to rank players. Every published benchmark result counts as a head-to-head match between models, and beating a strong model raises a rating more than beating a weak one. We show the conservative estimate: a floor the model is about 99% likely to clear, so models with only a few benchmark results score lower until more evidence arrives. Ratings are grouped by category (General, Reasoning, Coding, Math, Search, Vision), compiled by LLM Stats, and refreshed here every Monday.",
    vi: "Điểm số của mỗi mô hình là một xếp hạng TrueSkill – hệ thống mà Xbox dùng để xếp hạng người chơi. Mỗi kết quả benchmark được công bố được tính như một trận đấu đối đầu giữa các mô hình, và việc đánh bại một mô hình mạnh sẽ nâng xếp hạng nhiều hơn so với việc đánh bại một mô hình yếu. Chúng tôi hiển thị ước tính thận trọng: một ngưỡng mà mô hình có khoảng 99% khả năng vượt qua, vì vậy các mô hình chỉ có ít kết quả benchmark sẽ có điểm thấp hơn cho đến khi có thêm bằng chứng. Các xếp hạng được nhóm theo hạng mục (Tổng quát, Suy luận, Lập trình, Toán, Tìm kiếm, Thị giác), do LLM Stats tổng hợp, và được cập nhật tại đây mỗi thứ Hai.",
    id: "Skor setiap model adalah peringkat TrueSkill – sistem yang sama yang digunakan Xbox untuk memberi peringkat pemain. Setiap hasil benchmark yang dipublikasikan dihitung sebagai pertandingan head-to-head antar model, dan mengalahkan model yang kuat menaikkan peringkat lebih banyak daripada mengalahkan model yang lemah. Kami menampilkan estimasi konservatif: sebuah batas bawah yang kemungkinan sekitar 99% dapat dilampaui model tersebut, sehingga model yang hanya memiliki sedikit hasil benchmark mendapat skor lebih rendah sampai ada lebih banyak bukti. Peringkat dikelompokkan berdasarkan kategori (Umum, Penalaran, Pemrograman, Matematika, Pencarian, Visi), disusun oleh LLM Stats, dan diperbarui di sini setiap hari Senin.",
  },
  disclaimer: {
    en: "For informational purposes only · not investment or procurement advice",
    vi: "Chỉ mang tính chất tham khảo · không phải lời khuyên đầu tư hay mua sắm",
    id: "Hanya untuk tujuan informasi · bukan saran investasi atau pengadaan",
  },
};

/**
 * CMS-configurable AI Leaderboard methodology + disclaimer copy.
 *
 * Central's Indonesian key is `ind`, not `id`: Payload's Postgres adapter
 * silently DROPS any field named "id" at any nesting depth, so the column would
 * never have existed. It is mapped back to the app-facing `id` here, at the read
 * boundary, so every consumer sees the ordinary `{ en, vi, id }` shape.
 *
 * Per-language `||` fallback to English, then to the constant above — an empty
 * translation must never render as a blank paragraph under the table.
 */
export const getDashboardMethodology = unstable_cache(
  async (): Promise<DashboardMethodologyContent> => {
    const data = await fetchModule("dashboards", "en");
    const m = (data.methodology as CentralMethodology | undefined) ?? null;
    if (!m) return DASHBOARD_METHODOLOGY_FALLBACK;

    const fb = DASHBOARD_METHODOLOGY_FALLBACK;
    return {
      aiMethodology: {
        en: m.aiMethodology?.en || fb.aiMethodology.en,
        vi: m.aiMethodology?.vi || m.aiMethodology?.en || fb.aiMethodology.vi,
        id: m.aiMethodology?.ind || m.aiMethodology?.en || fb.aiMethodology.id,
      },
      disclaimer: {
        en: m.disclaimer?.en || fb.disclaimer.en,
        vi: m.disclaimer?.vi || m.disclaimer?.en || fb.disclaimer.vi,
        id: m.disclaimer?.ind || m.disclaimer?.en || fb.disclaimer.id,
      },
    };
  },
  ["dashboards:methodology"],
  { tags: ["dashboards:methodology"], revalidate: 300 }
);

/**
 * Fields the Atom feeds (`/rss.xml`, `/[pillar]/rss.xml`) render per entry.
 * `author`/`pillar` stay in Payload's `number | Doc` relation shape — the
 * builder narrows on `typeof === "object"` like article-view does.
 */
export type FeedArticle = Pick<
  Article,
  "id" | "title" | "slug" | "dek" | "publishedAt" | "updatedAt" | "author" | "pillar" | "sponsored"
>;

export type { Article, Pillar, Author, WireDrop, Tag, Correction, Newsletter, SponsorSlot };
