import { notFound, permanentRedirect } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Sub-path routing guard for `/dashboards/[[...sub]]` (Lean Deviation #1,
 * `ai-leaderboard-llmstats_PLAN_30-07-26.md`):
 *   - `sub` empty/undefined → render the AI Leaderboard (`page.tsx`).
 *   - `sub` === exactly `["ai"]` → 308 redirect to `/dashboards` (old
 *     bookmarks/links to the pre-rewrite `/dashboards/ai` tab).
 *   - anything else (`["funding"]`, `["bogus"]`, …) → 404. Hiding
 *     `/dashboards/funding` outright is the explicit, owner-approved point of
 *     this plan (see its Blast Radius section) — not a regression.
 *
 * EXECUTE-time adaptation (Group D pass): this logic was originally written
 * directly in `page.tsx` per the plan's literal item 18, but that produced a
 * verified, reproducible Next.js 15 App Router bug — see the Deviations
 * section of the EXECUTE report. The segment's `loading.tsx` (item 21)
 * creates an implicit Suspense boundary around the *page* component
 * specifically; Next.js commits the HTTP response to `200` the instant that
 * boundary starts streaming, which happens *before* a `page.tsx`-level
 * `notFound()`/`permanentRedirect()` can run — so the real HTTP status was
 * silently lost (verified with an isolated minimal repro route: identical
 * `notFound()` logic in `page.tsx` returned `200` with `loading.tsx` present,
 * and `404` without it). A segment `layout.tsx`, by contrast, renders
 * *outside* that Suspense boundary (Next always renders the layout shell
 * before deciding whether to stream the page slot), so `notFound()` /
 * `permanentRedirect()` called here still short-circuit the response with a
 * real HTTP status, and the page slot's `loading.tsx` skeleton keeps working
 * for the one valid (`sub` empty) case. Verified with `next build && next
 * start`: `/dashboards` → 200, `/dashboards/ai` → 308 → `/dashboards`,
 * `/dashboards/funding` and any other sub-path → 404 — all three correct
 * with `loading.tsx`/`error.tsx` still present. This is an additive file in
 * the *same* `[[...sub]]` folder — the URL routing pattern itself is
 * unchanged, so it does not reopen Lean Deviation #1's "no folder
 * restructure" constraint.
 */
export default async function DashboardsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ sub?: string[] }>;
}) {
  const { sub } = await params;

  if (sub && sub.length > 0) {
    if (sub.length === 1 && sub[0] === "ai") {
      permanentRedirect("/dashboards");
    }
    notFound();
  }

  return children;
}
