"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { assessClient, type ClientSignals } from "@/lib/bot-detect";

// Local, minimal shape of the gtag global (no global d.ts edit for one caller).
type Gtag = (command: "event", name: string, params?: Record<string, unknown>) => void;
type GtagWindow = Window & { gtag?: Gtag };
type UaData = {
  brands?: ReadonlyArray<{ brand: string; version: string }>;
  getHighEntropyValues?: (hints: string[]) => Promise<{ fullVersionList?: unknown[] }>;
};

/** High-entropy hints can hang in odd WebViews; never let them delay the decision long. */
const FVL_TIMEOUT_MS = 1500;
/** Poll for `window.gtag` instead of trusting init order (see waitForGtag). */
const GTAG_POLL_MS = 250;
const GTAG_MAX_WAIT_MS = 15_000;
const INPUT_EVENTS = ["pointerdown", "keydown", "touchstart", "wheel"] as const;
/** Wait-for-human gate (see AnalyticsGate). */
const HUMAN_KEY = "ba-human";
const SCROLL_MIN_PX = 100;
const SCROLL_IGNORE_MS = 500;
const DWELL_MS = 15_000;
type Trigger = "input" | "scroll" | "dwell" | "session";

async function fullVersionListLength(uaData: UaData | undefined): Promise<number | null> {
  if (!uaData || typeof uaData.getHighEntropyValues !== "function") return null;
  try {
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), FVL_TIMEOUT_MS));
    const hev = uaData
      .getHighEntropyValues(["fullVersionList"])
      .then((v) => (Array.isArray(v?.fullVersionList) ? v.fullVersionList.length : null))
      .catch(() => null);
    return await Promise.race([hev, timeout]);
  } catch {
    return null;
  }
}

async function collectSignals(): Promise<ClientSignals> {
  const nav = navigator as Navigator & { userAgentData?: UaData };
  const uaData = nav.userAgentData;
  return {
    ua: nav.userAgent,
    webdriver: typeof nav.webdriver === "boolean" ? nav.webdriver : null,
    hasUserAgentData: !!uaData,
    brands: uaData && Array.isArray(uaData.brands) ? uaData.brands : null,
    fullVersionListLength: await fullVersionListLength(uaData),
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    languagesLength: Array.isArray(nav.languages) ? nav.languages.length : null,
  };
}

/**
 * GA4, mounted only for clients that do not look automated (see bot-detect.ts)
 * AND that then show evidence of a real human.
 *
 * Wait-for-human gate: after a non-blocked verdict, GA mounts on the FIRST of
 * a trusted input (pointerdown/keydown/touchstart/wheel), a trusted scroll of
 * >= 100px at least 500ms after the wait began (skips scroll restoration and
 * anchor jumps), or 15s of VISIBLE dwell time. Admission is remembered per tab
 * in sessionStorage ("ba-human"), so later pages mount GA immediately. Bots that
 * scroll programmatically with trusted events, or drive CDP-trusted input,
 * still pass — this raises the bar, it is not a wall.
 *
 * Renders nothing until its effect decides, so SSR HTML is unchanged. Every
 * failure path — a throw, a hung hint, an unknown browser — ends in "on"
 * immediately: a lost real reader is worse than a counted bot.
 *
 * Events are sent by polling for `window.gtag` rather than via `sendGAEvent`:
 * the `@next/third-parties` inline script defines `gtag` and queues
 * `js` + `config` in the same tick, so once `gtag` exists our event lands
 * after `config`. `sendGAEvent` instead drops calls made before init. The poll
 * is bounded (15s) and is safe under either init ordering.
 *
 * Debug flags on `document.documentElement.dataset`:
 * `baAnalytics` = `wait` | `on` | `on:suspect:<weak>` | `off:<reasons>` | `on:error`;
 * `baTrigger` = `input` | `scroll` | `dwell` | `session`.
 */
export function AnalyticsGate({ gaId }: { gaId: string }) {
  const [state, setState] = useState<"pending" | "on" | "off">("pending");

  useEffect(() => {
    let cancelled = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    let removeListeners = () => {};

    const waitForGtag = (send: (gtag: Gtag) => void) => {
      const started = Date.now();
      const tick = () => {
        if (cancelled) return;
        const gtag = (window as GtagWindow).gtag;
        if (typeof gtag === "function") {
          try {
            send(gtag);
          } catch {
            // Analytics must never break the page.
          }
          return;
        }
        if (Date.now() - started >= GTAG_MAX_WAIT_MS) return;
        const t = setTimeout(() => {
          timers.delete(t);
          tick();
        }, GTAG_POLL_MS);
        timers.add(t);
      };
      tick();
    };

    (async () => {
      try {
        const verdict = assessClient(await collectSignals());
        if (cancelled) return;
        if (verdict.block) {
          document.documentElement.dataset.baAnalytics =
            `off:${[...verdict.hard, ...verdict.weak].join(",")}`;
          setState("off");
          return;
        }
        const signals = verdict.weak.join(",");
        let admitted = false;
        const admit = (trigger: Trigger) => {
          if (admitted || cancelled) return;
          admitted = true;
          removeListeners();
          try {
            sessionStorage.setItem(HUMAN_KEY, "1");
          } catch {
            // Storage can be disabled; admission still stands for this page.
          }
          const root = document.documentElement.dataset;
          root.baAnalytics = verdict.suspect ? `on:suspect:${signals}` : "on";
          root.baTrigger = trigger;
          setState("on");
          waitForGtag((gtag) => {
            gtag("event", "human_interaction", { trigger });
            if (verdict.suspect) gtag("event", "suspect_client", { signals });
          });
        };

        let remembered = false;
        try {
          remembered = sessionStorage.getItem(HUMAN_KEY) !== null;
        } catch {
          remembered = false;
        }
        if (remembered) {
          admit("session");
          return;
        }

        document.documentElement.dataset.baAnalytics = "wait";
        const waitStarted = Date.now();
        // Synthetic dispatchEvent() calls are untrusted; only real input counts.
        const onInput = (e: Event) => {
          if (e.isTrusted) admit("input");
        };
        const onScroll = (e: Event) => {
          if (!e.isTrusted || Date.now() - waitStarted < SCROLL_IGNORE_MS) return;
          if (Math.abs(window.scrollY) >= SCROLL_MIN_PX) admit("scroll");
        };
        let visibleMs = 0;
        const dwell = setInterval(() => {
          if (document.visibilityState !== "visible") return;
          visibleMs += 1000;
          if (visibleMs >= DWELL_MS) admit("dwell");
        }, 1000);
        for (const type of INPUT_EVENTS) {
          window.addEventListener(type, onInput, { passive: true, capture: true });
        }
        window.addEventListener("scroll", onScroll, { passive: true });
        removeListeners = () => {
          clearInterval(dwell);
          for (const type of INPUT_EVENTS) {
            window.removeEventListener(type, onInput, { capture: true });
          }
          window.removeEventListener("scroll", onScroll);
          removeListeners = () => {};
        };
      } catch {
        if (cancelled) return;
        // Fail open, immediately: no waiting on the error path.
        try {
          document.documentElement.dataset.baAnalytics = "on:error";
        } catch {
          // ignore
        }
        setState("on");
      }
    })();

    return () => {
      cancelled = true;
      removeListeners();
      for (const t of timers) clearTimeout(t);
      timers.clear();
    };
  }, []);

  return state === "on" ? <GoogleAnalytics gaId={gaId} /> : null;
}
