// Client bot gate for GA4 — the pure decision half (no DOM, no "server-only",
// so it unit-tests under node:test and runs unchanged in the browser).
//
// Why this exists: the GA4 export for 6/9–5/10/2026 shows 35,664 sessions at
// only 10.5% engaged, with hostname 99.9% our real site — i.e. bots run the GA
// tag inside real (headless) Chromium, so GA's own bot filter never sees them.
// Their fingerprints: `N.0.0.0` Chrome majors with an empty fullVersionList
// (the UA was overridden but the high-entropy hints were not), square or
// impossible screens, and the 800x600 headless default.
//
// Design rule: FAIL-OPEN. A wrongly blocked reader is invisible forever; a bot
// that slips through is only the status quo. Hence:
//   - HARD signals (any one blocks) are things no shipping browser produces;
//   - WEAK signals block only in pairs — exactly one marks the visit "suspect"
//     (still tracked, tagged so it can be segmented in GA);
//   - anything malformed or throwing returns "do not block".
// Deliberately NOT used: geo/IP, plugins, outerWidth, a generic /bot/ match,
// 1280x1024 or 1920x1080 (all common on real hardware).

export interface ClientSignals {
  ua: string;
  /** navigator.webdriver; null when the property is absent. */
  webdriver: boolean | null;
  /** Whether navigator.userAgentData exists at all. */
  hasUserAgentData: boolean;
  /** navigator.userAgentData.brands; null when uaData is absent. */
  brands: ReadonlyArray<{ brand: string; version: string }> | null;
  /** getHighEntropyValues fullVersionList length; null = absent/timeout/error. */
  fullVersionListLength: number | null;
  screenWidth: number;
  screenHeight: number;
  /** navigator.languages length; null when absent. */
  languagesLength: number | null;
}

export interface Assessment {
  block: boolean;
  suspect: boolean;
  hard: string[];
  weak: string[];
}

// Fresh object each time so a caller mutating the arrays cannot poison later calls.
const open = (): Assessment => ({ block: false, suspect: false, hard: [], weak: [] });

/** Engine major from `Chrome/<n>`; NaN when absent (Safari, Firefox, CriOS). */
export function chromeMajor(ua: string): number {
  const m = /\bChrome\/(\d+)/.exec(ua);
  return m?.[1] ? Number(m[1]) : Number.NaN;
}

/**
 * Major of the `Chromium` brand only. Edge, Opera, Samsung and Brave all ship
 * a `Chromium` brand equal to the engine major, while their own brand carries
 * a product version (Opera 124 on engine 140) — comparing against that would
 * flag real Opera users.
 */
export function chromiumBrandMajor(
  brands: ClientSignals["brands"],
): number {
  if (!Array.isArray(brands)) return Number.NaN;
  const b = brands.find((x) => x && x.brand === "Chromium");
  return b ? Number.parseInt(String(b.version), 10) : Number.NaN;
}

const finite = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

export function assessClient(s: ClientSignals): Assessment {
  try {
    if (!s || typeof s !== "object") return open();
    const ua = typeof s.ua === "string" ? s.ua : "";
    const hard: string[] = [];
    const weak: string[] = [];

    if (s.webdriver === true) hard.push("webdriver");
    // Chrome-Lighthouse is the audit runner's own suffix — never a reader.
    if (/HeadlessChrome|Chrome-Lighthouse/.test(ua)) hard.push("headless-ua");
    if (Array.isArray(s.brands) && s.brands.some((b) => b && /Headless/i.test(String(b.brand)))) {
      hard.push("headless-brand");
    }

    const uaMajor = chromeMajor(ua);
    const brandMajor = chromiumBrandMajor(s.brands);
    // UA overridden to look like another Chrome; the brand list was not.
    if (finite(uaMajor) && finite(brandMajor) && uaMajor !== brandMajor) {
      hard.push("ua-brand-mismatch");
    }

    const w = s.screenWidth;
    const h = s.screenHeight;
    if (finite(w) && finite(h)) {
      // Square >= 800 and the exact 1280x1200 are bot-farm viewports; no
      // shipping laptop/monitor/phone reports them.
      if ((w === h && w >= 800) || (w === 1280 && h === 1200)) hard.push("impossible-screen");
      // Headless default, but also a real (old/odd) screen — weak only.
      if (w === 800 && h === 600) weak.push("default-headless-screen");
    }

    // Chrome >= 100 always exposes uaData and a non-empty fullVersionList.
    // In-app WebViews can miss one of them, which is why each is weak only.
    // Mutually exclusive: fvl is only collected when uaData exists.
    if (finite(uaMajor) && uaMajor >= 100) {
      if (s.hasUserAgentData === false) weak.push("no-ua-data");
      else if (s.fullVersionListLength === 0) weak.push("empty-full-version");
    }

    if (s.languagesLength === 0) weak.push("no-languages");

    const block = hard.length > 0 || weak.length >= 2;
    return { block, suspect: !block && weak.length === 1, hard, weak };
  } catch {
    return open();
  }
}
