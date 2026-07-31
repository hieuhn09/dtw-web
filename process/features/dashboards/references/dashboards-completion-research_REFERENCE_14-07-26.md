# Dashboards Completion Research — 14-07-26

Feature: dashboards (Asia Funding Tracker + AI Leaderboard, `/dashboards`)
Method: 5 parallel scoped readers (code / design / spec / data-layer / cross-cutting) → synthesis → completeness-critic verification pass → revision. All claims below were spot-checked against repo files by the critic pass.

---

## Current State

**Route & shell** — `apps/web/src/app/(reader)/dashboards/[[...sub]]/page.tsx` is a single `"use client"` optional-catch-all page with working funding/ai tabs. It honestly self-labels as "Preview · sample data · coming soon" (a deliberate credibility-cleanup outcome, PR #20 + human-ops-launch P0-D; preview copy at page.tsx:51,70-73 and inside both table components). Unknown sub-paths silently fall back to the funding tab (no `notFound()`). No `layout.tsx`, no metadata, and no `loading.tsx`/`error.tsx` anywhere in the `(reader)` route group.

**Funding Tracker** (`components/dashboards/funding-tracker.tsx`) — works as a client-side preview: sortable columns (nulls last), country filter chips derived from data, CSV export of the filtered view (naive comma-join, no escaping — funding-tracker.tsx:89-107), hardcoded TOP_MOVERS panel, static 30-point SVG BigChart. Data = 12 hardcoded rows (`lib/data.ts:495-508`). The tbody maps rows directly — an empty result renders a bare empty table with no message (unreachable with today's derived chips, reachable the moment rows come from CMS).

**AI Leaderboard** (`components/dashboards/ai-leaderboard.tsx`) — sortable columns, "Optimize for" pills, inline score bars colored by pillar vars. Data = 8 hardcoded rows (`lib/data.ts:521-530`). No CSV export — which matches spec row 42 (no export button required for AI). Same bare-empty-tbody behavior.

**Accessibility & interaction state** — the feature contains **zero** `aria-*`/`role` attributes. Sort headers are plain `<th onClick>` (no tabIndex/onKeyDown/aria-sort — not keyboard operable); filter chips and optimize pills are real buttons but convey active state only by color inversion (no `aria-pressed`); Bar gauges and the BigChart SVG are unlabeled (gauges mitigated by adjacent numeric text). The guide's "sticky header" requirement (`_GUIDE.md:18`) was never implemented — no `position: sticky` in the feature or in the design source; tables scroll inside `.r-table-scroll` (overflow-x, min-width 680px).

**Methodology + sponsor card** (`page.tsx:113-206`) — static translated methodology copy per tab + "informational purposes only" disclaimer (spec-required note: present), plus a hardcoded always-visible "Brought to you by [Partner Logo]" sponsored card. The design refresh (2026-06-14) deleted this whole section; spec rows 41–43 require it; production kept it in stub form. One theming defect: the card's border is a hardcoded `#E0B900` (page.tsx:165) that does not adapt on the dark `--sponsored` bg `#3B2E0A` — the design-chat dark-mode fix covered the card's text (page.tsx:187,196 use var/color-mix) but not the border. The same hex is also hardcoded in `sponsored-strip.tsx:19`, `article-content.tsx:122`, and `packages/ui/src/disclosure-box.tsx` (inherited from the design source). All other dashboard colors are CSS-var/color-mix driven.

**Homepage teaser** (`components/home/dashboards-teaser.tsx`) — shipped with AnimatedSpark draw-in + CountUp per spec row 19. AI side shares `AI_LEADERBOARD` with the page; funding side is entirely inline literals ($8.4B, 127 deals, $66M, "AI infra") disconnected from any source. Several teaser strings are English-only.

**CMS / data layer** — `SponsorSlots` Payload collection exists, is migrated, and already defines `dashboard_funding`/`dashboard_ai` slots with the right contract ("empty = render nothing") — but has zero consumers, no revalidate hook, no seed rows. No `DashboardSources` collection, no Drizzle/Payload table for funding rows or AI scores, no API routes, no cron/refresh, no history storage. The house pattern to follow is well established (collection → `afterChange` `revalidateTag` hook → `unstable_cache` helper in `payload-server.ts`).

**i18n** — page chrome, methodology, and **both tables' column headers** are translated via the `t(en,vi,id)` pattern (funding-tracker.tsx:192-215, ai-leaderboard.tsx:190-213). This *diverges from* the recorded design decision (chat1.md:2083 — "table headers and data stay technical") and from the design source, which keep headers English; production translated them anyway. What stays English: data values (company/sector/model/maker/ctx strings, TOP_MOVERS names), the `#` rank header symbol, the CSV header row, and the teaser strings noted above.

**Testing / CI** — the repo has **no app-level test tooling at all**: no Playwright/Vitest/jest deps or configs (lockfile hits are optional peerDeps of better-auth/next), no test scripts in `apps/web/package.json` or root, no turbo `test` task. `.github/workflows/ci.yml` **exists** (contradicting `tests/all-tests.md:112` "No CI pipeline") but runs typecheck only and self-documents "no test runner is wired yet". `tests/all-tests.md:44-51` names "dashboard sort + CSV export" as a planned Playwright e2e target.

**Process state** — no dashboards plan artifact has ever been created; `process/features/dashboards/_GUIDE.md` is stale ("Status: not-started", wrong file paths). Data backend is recorded as deferred (P1, manual editorial entry first) in three separate process docs.

---

## Gap Analysis (ranked)

| # | Gap | Severity | Effort | Evidence |
|---|-----|----------|--------|----------|
| 1 | No real data source: both dashboards, the chart, top movers, and the homepage teaser funding stats are hardcoded arrays; no Payload/Drizzle table, no API, no refresh, no history storage (spec row 41 BACKEND requires pipeline + API + periodic update + history). Agreed Phase-1 path is manual editorial entry via a Payload collection. | **blocker** | L | `lib/data.ts:495-508, 521-530`; xlsx row 41; `_GUIDE.md:57` |
| 2 | Sponsor slot not CMS-wired: SponsorSlots collection (with dashboard_funding/dashboard_ai options) has no fetch helper, no consumer, no revalidate hook, no seed rows; the page renders a hardcoded always-visible '[Partner Logo]' card, contradicting the collection's own "empty = render nothing" contract and spec row 43. | major | M | `SponsorSlots.ts:4-43` vs `page.tsx:161-206` |
| 3 | Unresolved product decision: 2026-06-14 design refresh deleted the methodology + sponsor section on user request, but spec rows 41-43 require both and production still renders them. Spec wins by default, but confirm before building CMS wiring for either. | major | S | `design-refresh-diff_14-06-26.json compare[6].gaps[1]`; xlsx rows 41-43 |
| 4 | No server data path / ISR participation: fully client-rendered page with bundled data — no unstable_cache tags, no revalidate, no server component. Real data requires restructuring to the repo's single-revalidation-path convention. | major | M | `page.tsx:1`; `infra/all-infra.md:54-68` |
| 5 | Test harness must be bootstrapped from zero: the named e2e target "dashboard sort + CSV export" cannot be "one smoke test" — no Playwright/Vitest dep, config, script, or turbo task exists; CI is typecheck-only. Deps + playwright.config + test:e2e + turbo task + CI job is its own work item. | major | M | `apps/web/package.json`; `turbo.json:4-40`; `ci.yml:4-7,41-42`; `tests/all-tests.md:44-51` |
| 6 | Homepage teaser funding stats are inline literals disconnected from any source; spec row 19 requires a dashboard summary feeding the teaser. Teaser and page must read the same data once the backend lands. | major | M | `dashboards-teaser.tsx:10-11,84,120,138`; xlsx row 19 |
| 7 | No SEO metadata for /dashboards: client page with no generateMetadata and no route layout — title falls back to root "Dailytechwire". (Sitemap/robots are missing site-wide, not dashboards-specific.) | major | S | `page.tsx:1`; `app/layout.tsx:32-35` |
| 8 | Accessibility: zero aria-*/role attributes in the feature. Sort headers not keyboard-operable (no tabIndex/onKeyDown/aria-sort); chips/pills lack aria-pressed; gauges and BigChart SVG unlabeled. One WCAG 2.1 AA pass. | major | S | `funding-tracker.tsx:21-46,154-172`; `ai-leaderboard.tsx:19-44,46-75,154-174`; `big-chart.tsx:33-61` |
| 9 | No empty-table, error, or loading states: bare empty tbody (reachable once CMS-driven), no loading.tsx/error.tsx in the (reader) group. Skeleton primitive already exists in packages/ui. | major | S | `funding-tracker.tsx:218-270`; `ai-leaderboard.tsx:216-273`; `packages/ui/src/skeleton.tsx` |
| 10 | Methodology copy hardcoded in page.tsx rather than editor-editable via CMS (spec row 42 CMS: "Cấu hình nguồn; methodology"). A small Payload global mirroring PaywallSettings would satisfy this. | major | S | `page.tsx:141-151`; xlsx row 42 |
| 11 | Schema ambiguity blocking the data backend: code ships a ticker/stock table (ticker/px/chg/mcap) while _GUIDE.md plans funding-rounds columns (Company/Round/Amount/Date/Δ). Spec row 41 covers BOTH ("Bảng vốn & cổ phiếu"). Decide the collection shape before building or face migration churn. | major | S | `_GUIDE.md:29` vs `lib/data.ts:484-493`; xlsx row 41 |
| 12 | Dark-mode defect: sponsor card border hardcodes `#E0B900` on var(--sponsored) bg — doesn't adapt on dark `#3B2E0A`; the one non-theming color in the feature. Same hex in sponsored-strip.tsx:19, article-content.tsx:122, packages/ui disclosure-box. | minor | S | `page.tsx:165` vs `globals.css:26,59` |
| 13 | Invalid sub-routes (`/dashboards/anything`) silently render the funding tab instead of 404ing. | minor | S | `page.tsx:10-22` |
| 14 | CSV export does not quote/escape values — breaks the moment a CMS-entered value contains a comma. | minor | S | `funding-tracker.tsx:89-107` |
| 15 | i18n remainder: teaser strings, the "free" label (ai-leaderboard.tsx:263), and the CSV header row are English-only. NOTE (corrected baseline): table headers ARE already translated, diverging from the design-chat decision (chat1.md:2083) — accepted drift, record it, do not revert. | minor | S | `dashboards-teaser.tsx:74,84,114-156,220-236` |
| 16 | Sticky table header specified by the guide never implemented (design source also lacks it — guide-only scope). Interacts with `.r-table-scroll` overflow container. | minor | S | `_GUIDE.md:18`; `globals.css:365-371` |
| 17 | CountUp rAF animation not gated on prefers-reduced-motion (global CSS kill-switch covers CSS animations only). | minor | S | `effects/count-up.tsx:33-39`; `globals.css:505-513` |
| 18 | Stale process docs: `_GUIDE.md` says "not-started" with wrong paths; `tests/all-tests.md:112` says "No CI pipeline" but ci.yml exists (typecheck-only). No dashboards plan artifact exists. | minor | S | `_GUIDE.md:69-75,85`; `tests/all-tests.md:112` |
| 19 | Header search placeholder advertises searching "dashboards" but search is a Postgres LIKE over articles only; spec's index (articles+awards+people) never included dashboards. | polish | S | `header.tsx:237-241` vs `payload-server.ts:288-309` |
| 20 | Count-up stat tiles + sparklines on the full /dashboards page exist only in the guide (design prototype agrees with code = teaser-only); BigChart is static, no axes/tooltip. | polish | M | `_GUIDE.md:29-34` vs `big-chart.tsx:5-8` |
| 21 | AI leaderboard "#" column shows post-sort position, not stored rank — matches design exactly, likely intended; at most drop the sortable "rank" header. | polish | S | `ai-leaderboard.tsx:190,235` |
| 22 | Footer does not link /dashboards (header nav does). | polish | S | `footer.tsx:14-51` |

---

## Risks

- The methodology/sponsor product decision is genuinely unresolved (design deleted it, spec requires it, production stubs it). Building SponsorSlots wiring or a methodology global before confirmation risks throwaway work; deleting the section risks violating spec rows 41-43. Get a one-line product call first.
- Flipping from "Preview · sample data" to live copy with a manual-entry backend creates an editorial maintenance liability: stale numbers presented as live are worse than an honest preview. Keep "Data Desk · Preview" framing until an update cadence is actually staffed (design-refresh recommendedUpdates[2] says exactly this).
- The funding-table schema decision (ticker/stock view vs funding-rounds view vs both) must precede the Payload collection build; guide and shipped code disagree and the spec wants both. Wrong shape = migration churn on a collection editors will already be populating.
- The "one Playwright smoke test" framing hides a harness bootstrap. Bundling it inflates the dashboards plan; splitting it means the named e2e target ships untested. Make this an explicit scoping decision.
- Converting the `"use client"` page to a server-data path changes behavior of `/dashboards/<junk>` (silently working today → 404) — low risk, worth a redirect check.
- The `#E0B900` fix has scope-creep potential: the hex is shared by 3 sibling files + packages/ui. Introduce a `--sponsored-border` token and either sweep all or scope deliberately to dashboards.
- Production translated table headers against the recorded design decision — accepted drift; record it in uxui context or the guide so a future agent doesn't "fix" it back.
- Engine is contractually barred from writing dashboard data sources (`integrations/all-integrations.md:59`) — any automation must go through Payload API/admin UI, never direct Postgres (invariant #1).
- Two spec requirements are site-wide gaps dashboards can't fix alone: no sitemap/robots anywhere, and PostHog entirely unwired (and re-adding it re-triggers cookie consent, `all-infra.md:259`, while the banner was just hidden — commit 9724bb9).
- DashboardSources with encrypted API keys, external feeds, cron refresh are explicitly Phase-2/P2 in three process docs — don't let manual-entry quietly grow into that.

---

## Recommendation (lean scope)

**Gate first (zero code):** (a) keep methodology + sponsor slot per spec, or accept the design's removal? Spec wins by default; the plan below assumes "keep". (b) bundle the Playwright harness bootstrap into this plan or split it into a separate infra plan?

### Must-have (single plan, one execute pass)

1. **Manual-entry data backend (core).** One Payload collection for funding rows + one for AI leaderboard rows (Editor/Admin write, public read), seeded from the current sample arrays so nothing visually changes day one. Follow the house pattern exactly: `afterChange`/`afterDelete` revalidate hooks with tags (`dashboards:funding`, `dashboards:ai`) → `unstable_cache` helpers in `payload-server.ts` (fail-open fallback to the static arrays) → migration + seed. Decide the funding schema up front: keep the shipped ticker-table shape (matches spec row 41 "vốn & cổ phiếu" and the live UI); defer the funding-rounds view.
2. **Route restructure to server-data, with states.** Server component page fetching rows and passing to the existing client tables; add `generateMetadata`, `notFound()` for bad subs, `loading.tsx` skeleton, `error.tsx`, and explicit empty-table messages in both tables. Closes SEO, 404, ISR, loading, error, and empty-state gaps in one move.
3. **Wire SponsorSlots + fix the border.** `getSponsorSlot(slot)` helper + revalidate hook + conditional render honoring "empty = render nothing"; delete the hardcoded '[Partner Logo]' card. Replace the `#E0B900` border with a themed `--sponsored-border` token (dark variant); sweep the 3 sibling occurrences in the same small commit or explicitly defer.
4. **Feed the teaser from the same helpers** (derive the 3 stat tiles + headline from funding rows server-side). Kills the disconnected literals; satisfies spec row 19's intent without a dedicated API route.
5. **One full-width a11y pass:** keyboard-operable sort with `aria-sort`, `aria-pressed` on chips/pills, labels on gauges, `role="img"` + label on BigChart.
6. **Small fixes bundled:** CSV quoting/escaping; translate teaser strings + "free" label + CSV header row; keep "Data Desk · Preview" copy until editors actually maintain data.
7. **Methodology as a tiny Payload global** mirroring PaywallSettings (localized copy per tab + disclaimer) — only if the gate confirms keeping the section.
8. **Testing (honestly sized):** minimal Playwright bootstrap + the one named spec (sort + CSV) as the final step, or a separate infra plan if leaner is preferred. Not "one smoke test".
9. **Closeout hygiene:** update `_GUIDE.md` status/paths (note sticky-header as guide-only/deferred); fix stale `tests/all-tests.md:112`.

All of the above is CMS-configurable, uses `revalidateTag`, adds no popups, keeps the sponsored card on `var(--sponsored)` with disclosure, translates chrome only, and never touches the Engine path.

### Defer (explicitly out of scope)

- External data feeds (Polygon/Alpaca, Crunchbase/PitchBook, benchmark scraping), full DashboardSources collection with encrypted keys, cron refresh, history storage — P1/P2 per three process docs; manual entry is the agreed start.
- AI Leaderboard CSV export — spec row 42 lists no export button; the "gap" was guide overreach. Drop.
- Sticky table headers — guide-only, never implemented anywhere; decide-or-drop at closeout.
- BigChart real data/interactivity, count-up tiles on the full page, in-table sparklines — guide-only; revisit when real time-series data exists.
- Sitemap/robots and PostHog — real spec gaps but site-wide; PostHog re-triggers cookie consent. Separate plans.
- Polish batch: footer link, search-placeholder copy, positional-rank header cleanup, reduced-motion gate on CountUp.
