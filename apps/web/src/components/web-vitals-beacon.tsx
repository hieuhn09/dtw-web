"use client";

import { useEffect } from "react";
// Type-only import. `import type` is erased by the compiler, so this emits NO
// runtime import and keeps `web-vitals` out of the initial bundle. The only
// real import is the dynamic one inside the effect below — do not hoist it.
import type { Metric } from "web-vitals";

/** Report on 1 in 5 page loads. */
const SAMPLE_RATE = 0.2;

/** Value written to the `site` column — this deployment is the "dtw" site. */
const SITE = "dtw";

/**
 * Names the `web_vitals` CHECK constraint accepts (migration 030_web_vitals).
 * web-vitals already emits exactly these strings; the guard exists so a future
 * library rename degrades into a dropped metric instead of a 400 per pageview.
 */
const ALLOWED_METRICS: readonly string[] = ["LCP", "CLS", "INP", "TTFB", "FCP"];

/**
 * Real-User-Monitoring beacon — reports Core Web Vitals straight to Supabase
 * PostgREST (insert-only table `web_vitals`).
 *
 * This measures LCP, so it must not move LCP. Hence, in this order:
 *  - renders `null` — adds nothing to the DOM, no layout work
 *  - every statement lives inside `useEffect` — nothing runs during SSR or
 *    before first paint
 *  - `web-vitals` is imported dynamically and only AFTER the sampling and
 *    config gates, so 80% of loads never fetch the library at all and it
 *    never enters the initial bundle or the critical path. A static top-level
 *    import would regress the exact metric this exists to observe.
 *
 * Privacy: no cookies, no localStorage, no user id, no IP, and deliberately NO
 * session or visitor identifier. Every row is an anonymous, unlinkable
 * measurement. Do not add an identifier to "group" rows — correlating them per
 * visitor would turn this into personal data and pull the table into GDPR
 * scope.
 */
export function WebVitalsBeacon() {
  useEffect(() => {
    // Sampling gate first: an unsampled load must not even pay for the import.
    if (Math.random() >= SAMPLE_RATE) return;

    // Unconfigured = silent no-op. Both are inlined at build time; if either is
    // missing the beacon does nothing at all — it must never throw or log, so
    // a forgotten env var can never break a page for a reader.
    const endpoint = process.env.NEXT_PUBLIC_VITALS_ENDPOINT;
    const key = process.env.NEXT_PUBLIC_VITALS_KEY;
    if (!endpoint || !key) return;

    const report = (metric: Metric) => {
      if (!ALLOWED_METRICS.includes(metric.name)) return;

      // `navigator.sendBeacon` will NOT work here: it cannot set custom
      // headers, and PostgREST requires `apikey` + `Authorization`. The reason
      // sendBeacon is normally reached for — outliving the page — is exactly
      // what `keepalive: true` gives fetch. Do not "simplify" this back to
      // sendBeacon; every request would 401.
      fetch(endpoint, {
        method: "POST",
        keepalive: true,
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        // Raw value on purpose: CLS is a small unitless decimal while
        // LCP/INP/TTFB are milliseconds. The column is double precision and
        // holds both without conversion.
        body: JSON.stringify({
          site: SITE,
          metric: metric.name,
          value: metric.value,
          path: location.pathname.slice(0, 512),
          rating: metric.rating,
        }),
      }).catch(() => {
        // Telemetry failure must never surface to a reader: swallow it.
      });
    };

    import("web-vitals")
      .then(({ onLCP, onCLS, onINP, onTTFB }) => {
        onLCP(report);
        onCLS(report);
        onINP(report);
        onTTFB(report);
      })
      .catch(() => {
        // Chunk failed to load — nothing to measure, and nothing worth saying.
      });
  }, []);

  return null;
}
