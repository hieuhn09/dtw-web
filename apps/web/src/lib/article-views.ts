/**
 * Client-side dedupe for the anonymous article view counter that feeds the
 * homepage "Most Read" band.
 *
 * The server side (`lib/view-actions.ts` -> `article_views`) stores nothing
 * that identifies a visitor, so it cannot tell a fresh reader from the same
 * reader refreshing. That judgement is made here, in the browser, before the
 * server action is ever called: a given article counts at most once per
 * browser per publication day. It is the same "never count per pageload"
 * rule `recordView`/`reading_history` enforces server-side for signed-in
 * readers, applied to the anonymous aggregate.
 *
 * Two layers, deliberately:
 *   - a module-level in-memory Set, which also absorbs React StrictMode's
 *     double effect invoke in dev and repeat client-side navigations to the
 *     same article within one tab;
 *   - localStorage, which survives reloads and new tabs.
 *
 * If storage is unavailable (Safari private mode, storage denied), the
 * in-memory layer still holds and we fail *open* — a slightly inflated count
 * for that visitor beats silently dropping them out of the signal entirely.
 *
 * This module runs in the browser (imported by a client component) and must
 * stay side-effect-free at import time — no "server-only", no "use server".
 * The server action imports `currentDayKeySGT` from here too, so the day
 * bucket is defined in exactly one place.
 */

const VIEW_TZ = "Asia/Singapore"; // mirrors PUBLICATION_TZ in lib/i18n.tsx

const STORAGE_KEY = "dtw-viewed";

/** Hard cap on ids tracked per day — bounds the localStorage entry. A reader
 *  who opens more than this in one day starts re-counting their earliest
 *  articles; harmless for a ranking signal, and far past real behaviour. */
const MAX_TRACKED_IDS = 120;

interface ViewedState {
  day: string; // "YYYY-MM-DD", Asia/Singapore
  ids: string[]; // article ids already counted today
}

/**
 * The current Asia/Singapore calendar day, "YYYY-MM-DD". Singapore has a
 * fixed UTC+8 offset (no DST), and `en-CA` formats as ISO, so no timezone
 * library is needed. Same reasoning as `currentPeriodKeySGT` in lib/paywall.ts,
 * one bucket finer.
 */
export function currentDayKeySGT(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: VIEW_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Ids counted in this tab, this page-lifetime. Survives storage failures. */
const countedThisSession = new Set<string>();

function readState(): ViewedState {
  const empty: ViewedState = { day: currentDayKeySGT(), ids: [] };
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<ViewedState>;
    // A new publication day starts a fresh bucket — that rollover is what
    // makes the server's per-day row mean "distinct readers that day".
    if (parsed.day !== empty.day || !Array.isArray(parsed.ids)) return empty;
    return { day: empty.day, ids: parsed.ids.filter((id) => typeof id === "string") };
  } catch {
    return empty;
  }
}

function writeState(state: ViewedState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota or storage denied — the in-memory layer still dedupes this tab.
  }
}

/**
 * True the first time `articleId` is seen today in this browser, false on
 * every repeat. Marks the article as counted as a side effect, so callers
 * fire the server action iff this returns true.
 */
export function claimViewCount(articleId: string): boolean {
  if (!articleId) return false;
  if (countedThisSession.has(articleId)) return false;
  countedThisSession.add(articleId);

  const state = readState();
  if (state.ids.includes(articleId)) return false;
  state.ids = [...state.ids, articleId].slice(-MAX_TRACKED_IDS);
  writeState(state);
  return true;
}
