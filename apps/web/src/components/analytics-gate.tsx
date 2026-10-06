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
 * GA4, mounted only for clients that do not look automated (see bot-detect.ts).
 *
 * Renders nothing until its effect decides, so SSR HTML is unchanged. Every
 * failure path — a throw, a hung hint, an unknown browser — ends in "on":
 * a lost real reader is worse than a counted bot.
 *
 * Events are sent by polling for `window.gtag` rather than via `sendGAEvent`:
 * the `@next/third-parties` inline script defines `gtag` and queues
 * `js` + `config` in the same tick, so once `gtag` exists our event lands
 * after `config`. `sendGAEvent` instead drops calls made before init. The poll
 * is bounded (15s) and is safe under either init ordering.
 *
 * Debug flag: `document.documentElement.dataset.baAnalytics` =
 * `on` | `on:suspect:<weak>` | `off:<reasons>` | `on:error`.
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

    const listenForHuman = () => {
      const onInput = (e: Event) => {
        // Synthetic dispatchEvent() calls are untrusted; only real input counts.
        if (!e.isTrusted) return;
        removeListeners();
        waitForGtag((gtag) => gtag("event", "human_interaction"));
      };
      for (const type of INPUT_EVENTS) {
        window.addEventListener(type, onInput, { passive: true, capture: true });
      }
      removeListeners = () => {
        for (const type of INPUT_EVENTS) {
          window.removeEventListener(type, onInput, { capture: true });
        }
        removeListeners = () => {};
      };
    };

    const turnOn = (flag: string) => {
      document.documentElement.dataset.baAnalytics = flag;
      setState("on");
      listenForHuman();
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
        if (verdict.suspect) {
          const signals = verdict.weak.join(",");
          turnOn(`on:suspect:${signals}`);
          waitForGtag((gtag) => gtag("event", "suspect_client", { signals }));
        } else {
          turnOn("on");
        }
      } catch {
        if (cancelled) return;
        try {
          turnOn("on:error");
        } catch {
          setState("on");
        }
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
