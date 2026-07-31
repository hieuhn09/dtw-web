import { timingSafeEqual } from "node:crypto";

/**
 * Constant-time bearer-token check, shared across every service-to-service
 * route in this app (currently: `/api/engine/intake`; Group G of
 * `ai-leaderboard-llmstats_PLAN_30-07-26.md` adds
 * `/api/dashboards/refresh/[source]` on top of the same helper).
 *
 * Extracted verbatim from `apps/web/src/app/api/engine/intake/route.ts`
 * (2026-07-30) — behavior is byte-identical to the original inline
 * implementation. That route is a live `dtw-engine` integration contract, so
 * this function's 401/500-triggering behavior must never change silently.
 *
 * Returns false on any shape/length mismatch (missing header, wrong scheme,
 * wrong length) before ever reaching `timingSafeEqual`, since length itself
 * is not secret and `timingSafeEqual` throws on a length mismatch.
 */
export function bearerMatches(header: string | null, expected: string): boolean {
  if (!header) return false;
  const prefix = "Bearer ";
  if (!header.startsWith(prefix)) return false;
  const presented = header.slice(prefix.length).trim();
  const a = Buffer.from(presented, "utf8");
  const b = Buffer.from(expected, "utf8");
  // timingSafeEqual throws on length mismatch — guard first (length is not secret).
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
