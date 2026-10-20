/**
 * Pure rules for the cross-pillar "Exclusive" section (editor-set `exclusive`
 * flag in Central, tenant dtw). No `server-only`, no `@/` alias imports, so
 * `tsx --test` can load it directly and client components can share it.
 *
 * Every surface that shows the "Exclusive" chip goes through
 * `shouldShowExclusiveChip`: one rule, so a surface cannot drift.
 */

import type { AtomChannel } from "./feed";

export const EXCLUSIVE_PAGE_SIZE = 12;
export const EXCLUSIVE_BAND_SIZE = 3;
export const EXCLUSIVE_PATH = "/exclusive";
export const EXCLUSIVE_FEED_PATH = "/exclusive/rss.xml";
export const EXCLUSIVE_DEFINITION_HREF = "/trust/editorial#exclusive";

/** Request params for `GET /api/public/articles` (one flag per request). */
export function exclusiveQuery(page: number, limit: number) {
  return {
    flag: "exclusive" as const,
    content_type: "article" as const,
    sort: "-publishedAt",
    page,
    limit,
  };
}

/** Same rule as the pillar `parsePage`: canonical positive integer only. */
export function parseExclusivePage(raw: string): number | null {
  if (!/^[1-9][0-9]*$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isSafeInteger(n) ? n : null;
}

export function exclusivePagePath(page: number): string {
  return page <= 1 ? EXCLUSIVE_PATH : `${EXCLUSIVE_PATH}/page/${page}`;
}

/** Page 1 always exists (it carries the empty state). */
export function exclusivePageCount(totalDocs: number, size: number): number {
  return Math.max(1, Math.ceil(totalDocs / size));
}

export function classifyExclusivePage(o: {
  page: number;
  totalDocs: number;
  docCount: number;
}): "ok" | "not-found" {
  if (o.page > 1 && (o.docCount === 0 || o.page > exclusivePageCount(o.totalDocs, EXCLUSIVE_PAGE_SIZE))) {
    return "not-found";
  }
  return "ok";
}

export function shouldShowExclusiveChip(
  a: { exclusive?: boolean | null },
  o?: { onExclusivePage?: boolean }
): boolean {
  return Boolean(a.exclusive) && !o?.onExclusivePage;
}

/**
 * Homepage band: never repeat the hero LEAD story. Callers fetch `size + 1`
 * so dropping the lead still leaves `size` cards.
 */
export function pickBandArticles<T extends { id: number | string }>(
  exclusives: ReadonlyArray<T>,
  heroLeadId: number | string | null | undefined,
  size: number
): T[] {
  const rest =
    heroLeadId == null ? exclusives : exclusives.filter((a) => String(a.id) !== String(heroLeadId));
  return rest.slice(0, size);
}

export function exclusiveFeedChannel(origin: string): AtomChannel {
  return {
    title: "Opentechwire – Exclusive",
    subtitle: "Original reporting by Opentechwire.",
    origin,
    sitePath: EXCLUSIVE_PATH,
    feedPath: EXCLUSIVE_FEED_PATH,
  };
}
