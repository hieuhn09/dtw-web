/**
 * Client-safe paywall meter helpers — guest cookie mechanics + the shared
 * calendar-month period key used by both the guest cookie (here) and the
 * signed-in DB count (lib/session.ts::getReadCountThisPeriod). This module
 * runs in the browser (imported by lib/shell.tsx, a client component) and
 * must stay side-effect-free at import time — no "server-only", no
 * "use server".
 *
 * "Calendar month" resets on the 1st of the month, Asia/Singapore time
 * (mirrors PUBLICATION_TZ in lib/i18n.tsx) — not the visitor's local
 * timezone, so every guest resets at the same real-world instant. Singapore
 * has a fixed UTC+8 offset (no DST), so a literal "+08:00" suffix is
 * sufficient — no timezone library needed.
 */

const PAYWALL_TZ = "Asia/Singapore"; // mirrors PUBLICATION_TZ in lib/i18n.tsx

// [temp-hidden 2026-08-20] Paywall/sign-in nudge hidden site-wide by product
// decision — no reader-facing surface trips the meter while this is `false`
// (article-end Paywall card + header nudge banner both gate on it). The meter
// machinery below keeps running (cookie + DB counts stay accurate), and the
// CMS `paywallThreshold` setting is untouched, so flipping this back to `true`
// restores the configured behaviour with no other change.
export const PAYWALL_ENABLED = false;

export const GUEST_METER_COOKIE = "dtw-read-count";

/** Hard cap on tracked ids per period — bounds cookie size. Well above any
 *  realistic threshold value; once articlesRead >= threshold the nudge/
 *  paywall has already tripped, so further reads don't need exact tracking. */
const MAX_TRACKED_IDS = 20;

/** Cookie lives 90 days; the *effective* reset is period-key comparison
 *  inside the value, not cookie expiry — this just needs to outlive one
 *  full period comfortably. */
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

interface GuestMeterState {
  period: string; // "YYYY-MM", Asia/Singapore
  ids: string[]; // distinct article ids read this period
}

export function currentPeriodKeySGT(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PAYWALL_TZ,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = parts.find((p) => p.type === "year")?.value ?? "0000";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  return `${year}-${month}`;
}

/** UTC instant for the start of the current Asia/Singapore calendar month. */
export function startOfCurrentPeriodSGT(now: Date = new Date()): Date {
  return new Date(`${currentPeriodKeySGT(now)}-01T00:00:00+08:00`);
}

function emptyState(): GuestMeterState {
  return { period: currentPeriodKeySGT(), ids: [] };
}

function parseCookie(): GuestMeterState {
  if (typeof document === "undefined") return emptyState();
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${GUEST_METER_COOKIE}=`));
  if (!match) return emptyState();
  try {
    const raw = decodeURIComponent(match.slice(GUEST_METER_COOKIE.length + 1));
    const parsed = JSON.parse(raw) as Partial<GuestMeterState>;
    if (parsed.period !== currentPeriodKeySGT() || !Array.isArray(parsed.ids)) {
      return emptyState(); // stale period (new month) or malformed -> fresh start
    }
    return { period: parsed.period, ids: parsed.ids.filter((id) => typeof id === "string") };
  } catch {
    return emptyState();
  }
}

function writeCookie(state: GuestMeterState): void {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify(state));
  document.cookie = `${GUEST_METER_COOKIE}=${value}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

/** Current guest meter state (read-only). */
export function readGuestMeter(): GuestMeterState {
  return parseCookie();
}

/**
 * Record a guest read of `articleId` (idempotent for repeat reads of the
 * same article within the same period). Returns the new distinct-article
 * count.
 */
export function recordGuestRead(articleId: string): number {
  const state = parseCookie();
  if (!state.ids.includes(articleId)) {
    state.ids = [...state.ids, articleId].slice(-MAX_TRACKED_IDS);
    writeCookie(state);
  }
  return state.ids.length;
}

/** Clear the guest meter — called once a session is established. Sign-in is
 *  the nudge's success state; the DB-backed meter starts naturally at 0 for
 *  a brand-new account since reading_history has no rows yet (see D5). */
export function clearGuestMeter(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${GUEST_METER_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
