# AI Leaderboard (LLM Stats) — Ship Alone, Funding Hidden — Implementation Plan

**Date**: 30-07-26
**Complexity**: SIMPLE-leaning-COMPLEX (one execute pass, no phase program)
**Feature**: dashboards
**Owner decision (30-07-26)**: ship ONLY the AI Leaderboard now. The Asia Funding Tracker is **hidden entirely from the UI** (no tab, no route, no teaser card) — not sample-data, not visible at all. Its build (stocks crons, `dashboardTickers`, `dashboardQuoteSnapshots`, `fundingRounds`, Playwright/CI) is deferred to a future pass.
**Plan file**: `process/features/dashboards/active/ai-leaderboard-llmstats_PLAN_30-07-26.md`
**Supersedes-in-part**: `process/features/dashboards/active/dashboards-automation_PLAN_14-07-26.md` (that file has been annotated with a hold note — see its header — and must be reconciled, not blindly executed, when the funding pass resumes).

## Overview

`/dashboards` currently renders a client-side tab bar (Funding | AI) from hardcoded arrays in `lib/data.ts`, honestly labeled "sample data." This plan converts `/dashboards` into a single, CMS-backed, cron-refreshed **AI Leaderboard page** — no tabs, no funding UI anywhere — sourced from the LLM Stats API per `references/ai-leaderboard-llmstats-design_REFERENCE_30-07-26.md`. It adds one Payload collection (`aiModels`), one lean Payload global (`dashboardMethodology`, AI-only shape), wires the existing `SponsorSlots` collection's first real hooks, converts the route to a server component with metadata/404/loading/error, rewrites the AI table to be prop-driven + accessible + i18n-complete, shrinks the homepage teaser to a single AI card, and ships one weekly Vercel cron (`ai-weekly`) that refreshes 11 of 14 `aiModels` fields via LLM Stats (final column set amended 2026-07-30, 2nd — see Non-Goals and the Schema Reference). All AI-side architecture decisions, schema, and Known Unknowns from the big plan (AD-4/5/8/11, the `aiModels` schema table, Known Unknowns #1/#2/#5, and the LLM Stats design reference) carry over verbatim except where this reduced scope forces a structural simplification — those simplifications are called out explicitly below as **Lean Deviations**.

**Status**: 🧪 TESTING (Groups A-H code-complete + verified against the live Neon dev DB and a real LLM Stats cron write; awaiting user review of the manual-test evidence before archival)

**Amended 2026-07-30 (2nd)**: final column set confirmed by owner against live data — General/Reasoning/Coding/Math/Search/Vision + dual pricing + Released; Speed/Context/Writing dropped.

**EXECUTE progress (2026-07-31, Groups A-C pass)**: Checklist items 1-17 (Groups A "Shared plumbing", B "Payload schema", C "Read helpers") implemented, migrated, seeded, and verified against the live Neon dev DB — see the EXECUTE session report for full evidence. Two adaptations were required (both documented, not silent):
1. `DashboardMethodology`'s Indonesian locale sub-fields are named `ind`, not `id` — Payload's Postgres/Drizzle adapter silently drops any field literally named `id` at any nesting depth (confirmed via `@payloadcms/drizzle/dist/schema/traverseFields.js`, and confirmed as a **pre-existing, unrelated bug** in `Pillars.title.id` / `Tags.title.id`, both left untouched/out of scope). `getDashboardMethodology()` in `lib/payload-server.ts` maps `ind` back to the app-facing `id` key at the read boundary.
2. The amended-shape `AiLeaderboardRow` interface + its static fallback constant were defined locally in `lib/payload-server.ts` for that pass, migrated into `lib/data.ts` in the Group D-H pass below (restoring the plan's original Touchpoints).

**EXECUTE progress (2026-07-31, Groups D-H pass)**: Checklist items 18-32 implemented and verified (`next build && next start`, a real `ai-weekly` cron write against the live LLM Stats API, an `editorLocked` proof, and light/dark screenshots — see the EXECUTE session report for full evidence). One additional, non-trivial adaptation beyond the plan's literal text was required, verified with an isolated minimal repro before being applied to the real route:
3. **Sub-path `notFound()`/`permanentRedirect()` logic moved from `page.tsx` into a new `layout.tsx`** in the same `[[...sub]]` folder (not a folder/URL restructure — same routing pattern, additive file only). As literally specified (item 18, logic inside `page.tsx`), combined with the segment's `loading.tsx` (item 21), `notFound()`/`permanentRedirect()` silently stopped producing real HTTP status codes: `loading.tsx` makes Next.js wrap the *page* component in a Suspense boundary and commit the response to `200` the instant that boundary starts streaming — before a `page.tsx`-level `notFound()`/`permanentRedirect()` can run. Verified in both `next dev` and a real `next build && next start` production server, and confirmed with an isolated minimal repro route (`page.tsx` alone: 200 with `loading.tsx` present, 404 without it). A `layout.tsx` renders *outside* that Suspense boundary, so moving the logic there restores correct `200`/`308`/`404` HTTP semantics while keeping the `loading.tsx` skeleton for the one valid (`sub` empty) case — confirmed with the same repro, then applied to the real `/dashboards` route and re-verified end to end.

UX polish pass 2026-07-31 (owner-approved): Optimize-for pill row removed (header sort buttons remain), kicker copy → "Updated weekly", attribution merged into a subtle scale-note meta line (link preserved), bars re-scaled padded-min-max per column, sticky #/Model columns + right-fade scroll hint on mobile, caption wraps cleanly, methodology full-width when sponsorless, teaser zebra + compact numeric columns + "Input $/M" header.

---

## Non-Goals / Explicitly Deferred (scope cut from the big plan)

| Item | Disposition |
|---|---|
| `dashboardTickers`, `dashboardQuoteSnapshots` collections | Not built. No stock/ticker data of any kind this pass. |
| `fundingRounds` collection | Not built. |
| `stocks-yahoo.ts`, `stocks-vietnam.ts` adapters + `stocks-daily` cron | Not built. |
| `csv.ts` / any CSV export | Not built (AI tab never had CSV per the original spec — unchanged). |
| Funding component changes (`funding-tracker.tsx`, `big-chart.tsx`) | **Untouched, unimported, NOT deleted.** They go dormant — still importable when the funding pass resumes. |
| Playwright / CI e2e bootstrap (Group H of the big plan) | Deferred to the funding pass. No test infra exists yet in this repo; this plan does not introduce it. |
| The `#E0B900` 4-file hardcoded-hex sweep | Only the one occurrence the page rewrite naturally removes goes away. `sponsored-strip.tsx`, `article-content.tsx`, `packages/ui/src/disclosure-box.tsx` are untouched (see Lean Deviation on `--sponsored-border` below). |
| Tracxn journalist-program ops item | Not applicable — no funding data this pass. |
| `dashboardMethodology.fundingMethodology` field | Dropped from the global entirely this pass (see Lean Deviation below) — re-added when funding resumes. |
| `/dashboards/funding` as a real page | Deliberately gone. Any link to it 404s. |
| **Writing column** (amended 2026-07-30, 2nd) | Rankings category `writing` exists but coverage is too thin to ship (only 9 benchmarks feed it; flagship models scored 0/20 in the live top-20 sample verified 2026-07-30). Owner dropped it. |
| **Context column** (amended 2026-07-30, 2nd) | `context_window` is null for all 335 models upstream (verified 2026-07-30). Owner dropped the column entirely rather than keep an editor-maintained placeholder — re-addable as a real field if/when `context_window` is ever populated upstream. |
| **Speed column** (amended 2026-07-30, 2nd) | No throughput/latency data source exists anywhere in the LLM Stats API (verified). Owner cut it from the final column set entirely — the earlier design's speed gauge / manual-editor field is gone, not merely left un-automated. |

---

## Lean Deviations from the big plan (explicit structural choices)

1. **Sub-path handling.** Keep the existing `[[...sub]]` catch-all segment (no folder restructure). Logic: `sub` empty/undefined → render the AI Leaderboard directly. `sub` = exactly `["ai"]` → `permanentRedirect("/dashboards")` (308, for old bookmarks/links). Anything else (`["funding"]`, `["bogus"]`, `["funding","extra"]`, etc.) → `notFound()`.
2. **No separate `DashboardsShell` component.** Since there is only one page state now (no tabs to compose), the big plan's `dashboards-shell.tsx` + `ai-leaderboard.tsx` split is collapsed into one client component: the existing `ai-leaderboard.tsx` is rewritten to own the page header (kicker/h1/intro), the table, the methodology block, and the sponsor card. `page.tsx` becomes a thin async server component that fetches data and renders this one component. No new shell file.
3. **No shared `th.tsx`.** AD-11's accessible button-in-`<th>` pattern is implemented as a **local** `Th` update inside `ai-leaderboard.tsx` (it already has a local `Th`; upgrade it in place). Not extracted to a shared file — there is only one table consumer right now. Extract to `components/dashboards/th.tsx` when the funding pass resumes and needs it too.
4. **`dashboardMethodology` global — AI-only shape.** Fields: `aiMethodology { en, vi, id }` + `disclaimer { en, vi, id }`. The big plan's `fundingMethodology` group is **not created** in this pass (no funding UI reads it). Adding it back later is an additive field + migration, not a breaking change.
5. **`getDashboardSponsorSlot` narrowed.** Signature is `getDashboardSponsorSlot(slot: "dashboard_ai")` (single literal, not the big plan's 2-value union) — `SponsorSlots`'s own `slot` select field already has both `dashboard_funding` and `dashboard_ai` options from earlier CMS work; this plan doesn't touch that field, only narrows the *helper's* TS signature to what's actually called.
6. **`--sponsored-border` token IS added**, scoped to the new AI sponsor card only. The page rewrite naturally removes the one hardcoded `border: "1px solid #E0B900"` occurrence in the current `page.tsx`; introducing it again in the rewritten component would violate invariant #3 (no hardcoded hex). Add the CSS var (root + dark theme + `@theme inline` mapping) and use it in the new sponsor card. Do **not** touch `sponsored-strip.tsx`, `article-content.tsx`, or `disclosure-box.tsx` — those 3 files' hardcoded hex is out of scope, deferred to the funding pass exactly as the big plan already deferred it.
7. **Cron route keeps its dynamic `[source]` shape** (`/api/dashboards/refresh/[source]/route.ts`) so the funding pass can add `stocks-yahoo`/`stocks-vietnam`/`stocks-daily` later without moving files — but the accepted union is narrowed to the literal `"ai-weekly"` only; everything else 404s.
8. **`derive.ts` is not built.** The big plan's pure-math helpers (`computeEqualWeightedIndex`, `computeTopMovers`, `computeFundingSummary`, `isStaleTradingDay`) are all funding-side concerns. AI-side "as of" is just `Math.max(...)` over doc timestamps — no shared helper module needed.
9. **`--bar` token added (amended 2026-07-30, 2nd).** Single-hue bar-fill color used across all six score columns (`general`/`reasoning`/`coding`/`math`/`search`/`vision`) in the AI table, replacing the original design's separate `--ai`/`--dev`/`--startups` per-column bar colors. Matches the owner-approved visual reference (`demos/ai-leaderboard-table-preview.html`): light `#3A4E8C` (identical to `--ai`), dark `#6B84D6` (brighter for dark-background contrast — `--ai` itself has no dark override). Added root + dark + `@theme inline`, exactly like `--sponsored-border` (Lean Deviation #6).

---

## Carried-Over Architecture Decisions (verbatim, AI-scoped subset of the big plan)

- **AD-4 (editorLocked)**: `aiModels` gets an `editorLocked` array `{ field: text }[]`, same shape as `Articles.lockedFields`. Cron writes skip any field named there. No `origin`/`editedByHuman`/`version` — sequential weekly cron, no concurrent-write race.
- **AD-5 (field ownership)**: cron writes `maker`, `general`, `reasoning`, `coding`, `math`, `search`, `vision`, `inputPrice`, `outputPrice`, `released`, `asOfScores`. `rank` and `model` are editor-only, never cron-written. **Amended 2026-07-30 (2nd):** nothing else is manual anymore — `speed` (and the old single `ctx`/`price` fields) have been removed from the schema entirely by owner decision (see Non-Goals); the only remaining editor-only data fields are `rank`, `model`, and `sourceSlugLlmstats`.
- **AD-8 (GET+POST)**: the refresh route implements both `GET` (Vercel's automatic cron trigger) and `POST` (manual/ops `curl` testing), sharing one internal handler.
- **AD-11 (accessible sort)**: sortable `<th>` wraps a real `<button type="button">`, not manual `tabIndex`/`onKeyDown`. `aria-sort` stays on the `<th>`.
- **Known Unknowns — RESOLVED 2026-07-30 by live API verification with the real key** (Bash probes against 335 models / 663 benchmarks; supersedes the "verify at first run" items #1/#2/#5):
  1. **Do NOT use `top_scores` for the score columns.** Live data shows `top_scores` values are in benchmark-native units (mixed 0–1 fractions with raw scores up to 1861) — not comparable across models. The correct source is **`GET /v1/rankings?category={general|reasoning|code|math|search|vision}` → `conservative_rating`** (TrueSkill μ−3σ; matches the numbers llm-stats.com itself displays, e.g. reasoning 58.12 / code 50.13 for the current leader). Note the category id is **`code`**, not `coding` (`coding` is accepted as an alias and returns identical rows — use `code` canonically). The `score` field on rankings rows is NOT usable (inconsistent scale); `conservative_rating` is. **Final column set (amended 2026-07-30, 2nd):** all six of `general`/`reasoning`/`code`/`math`/`search`/`vision` are automated via this same endpoint pattern — `writing` also exists as a category but was evaluated and rejected (see bullet 5 below).
  2. **Score scale**: `conservative_rating` is a ~0–60 open-ended rating, NOT 0–100. Store raw (1 decimal); render bars relative to the max value in the displayed column (leader = full bar). No ×100 conversion anywhere.
  3. **`context_window` is null for every model in the live catalog** (0/335, list AND detail). **Amended 2026-07-30 (2nd): the `ctx`/Context column has been dropped from the schema entirely** (owner decision) rather than kept as a conditionally-cron-written, effectively-editor-maintained field — there is no upstream signal to re-populate it from, so an editor-maintained placeholder column added no value. Re-addable as a real field if/when `context_window` is ever populated upstream.
  4. Id format confirmed real and stable-looking (e.g. `gpt-5.2-2025-12-11`, `claude-fable-5`); an upstream id change still just un-matches the row (logged, skipped). Provider pricing (input **and** output, tracked as separate `inputPrice`/`outputPrice` fields per the amended schema) present for flagship models (85/335 overall — all majors covered).
  5. **(Amended 2026-07-30, 2nd) Category coverage on the live top-20 sample, informing the final column set:** `general` 20/20, `reasoning` 20/20, `code` 19/20, `math` 17/20, `search` 14/20, `vision` 19/20 — all six shipped. `writing` exists as a rankings category but flagship models are unscored there (0/20 coverage in the same sample; only 9 benchmarks feed it) — owner dropped it (see Non-Goals). `speed`/throughput has no field anywhere in the API (confirmed, unchanged from the original finding) — owner cut the column entirely rather than keep it manual-only.

---

## Schema Reference

### Collection: `aiModels` (amended 2026-07-30, 2nd — final column set per owner decision against live data; supersedes both the big plan's original 8-field version and the first LLM Stats amendment)

| Field | Type | Required | Cron-writable? | Source |
|---|---|---|---|---|
| `rank` | number | no | no | Editorial override sort key |
| `model` | text | yes | no | Editor-owned display name |
| `maker` | text | yes | **yes** | LLM Stats `/v1/models`, `organization.name` |
| `general` | number (nullable) | no | **yes** | `/v1/rankings?category=general&limit=50` → `conservative_rating` (raw ~0–60 TrueSkill scale, 1 decimal); model outside top-50 → field skipped by adapter, may stay null — UI renders "–" |
| `reasoning` | number (nullable) | no | **yes** | `/v1/rankings?category=reasoning&limit=50` → `conservative_rating` (same treatment as `general`) |
| `coding` | number (nullable) | no | **yes** | `/v1/rankings?category=code&limit=50` → `conservative_rating` (category id is `code`; `coding` is an accepted alias returning identical rows — use `code` canonically; same treatment) |
| `math` | number (nullable) | no | **yes** | `/v1/rankings?category=math&limit=50` → `conservative_rating` (same treatment) |
| `search` | number (nullable) | no | **yes** | `/v1/rankings?category=search&limit=50` → `conservative_rating` (same treatment) |
| `vision` | number (nullable) | no | **yes** | `/v1/rankings?category=vision&limit=50` → `conservative_rating` (same treatment) |
| `inputPrice` | number (nullable) | no | **yes** | min non-null `providers[].input_price_per_m` from the `/v1/models` walk; `0` = free |
| `outputPrice` | number (nullable) | no | **yes** | min non-null `providers[].output_price_per_m` from the `/v1/models` walk; `0` = free |
| `released` | date (nullable) | no | **yes** | `/v1/models` `release_date` |
| `sourceSlugLlmstats` | text | no | no | CMS-editable exact join key — `/v1/models` `id` |
| `asOfScores` | date | no | **yes** | Fetch timestamp |
| `editorLocked` | array `{ field: text }` | no | n/a | Skip-list |

**REMOVED (amended 2026-07-30, 2nd — owner decision, see Non-Goals):** `speed`, `ctx`, and the single `price` field. `speed` had no upstream data source at all; `ctx` (`context_window`) is null for the entire live catalog; the single `price` field is replaced by separate `inputPrice`/`outputPrice`.

Admin: `useAsTitle: "model"`, `defaultColumns: ["model","maker","general","inputPrice","asOfScores"]`.
Access: `read: () => true`; `create`/`update`: `editor`|`admin`; `delete`: `admin`.
Hooks: `afterChange`/`afterDelete` → tag `dashboards:ai`.
Cron never creates rows — only refreshes existing ones matched by `sourceSlugLlmstats`, via six `/v1/rankings` category calls (`general`/`reasoning`/`code`/`math`/`search`/`vision`) plus the `/v1/models` walk; unmatched upstream ids are logged and skipped.

### Global: `dashboardMethodology` (AI-only shape, Lean Deviation #4)

| Field | Type | Notes |
|---|---|---|
| `aiMethodology` | group `{ en: textarea required, vi: textarea, id: textarea }` | Seed EN: "Scores are normalized per-category benchmark scores compiled by LLM Stats (source-verified where marked). Rankings method: TrueSkill. For informational purposes only." Matching VI/ID translations. No "Arena score" vocabulary (that was LMArena-specific). |
| `disclaimer` | group `{ en: text required, vi: text, id: text }` | "For informational purposes only · not investment or procurement advice" (lifted from the current page copy, unchanged meaning). |

Access: `read: () => true`; `update`: `editor`|`admin` (mirrors `PaywallSettings`). No `create`/`delete` — it's a Global.
Hooks: `afterChange` → tag `dashboards:methodology`.

### `SponsorSlots` (existing collection, hooks-only change)

No field changes — `dashboard_ai` is already a valid `slot` option. Add: `hooks: { afterChange: [revalidateSponsorSlot], afterDelete: [revalidateSponsorSlotDelete] }`, tag `sponsor-slots:all`.

---

## Data Flow

**Read** (`/dashboards` render): `page.tsx` (server) → `Promise.all([getAiModels(), getDashboardMethodology(), getDashboardSponsorSlot("dashboard_ai")])` → renders `<AILeaderboard rows asOfScores methodology sponsor />` (client). Each helper: `unstable_cache`, try/catch → static fallback (`AI_LEADERBOARD` / hardcoded methodology copy / `null`), matching `getPinnedLatest`/`getPaywallThreshold`'s existing defensive pattern.

**Write** (cron, weekly): Vercel Cron (`GET`, `Authorization: Bearer $CRON_SECRET`) or ops `curl` (`POST`, manual bearer) → `/api/dashboards/refresh/ai-weekly` → `bearerMatches()` against `DTW_DASHBOARD_REFRESH_TOKEN` → `lib/dashboards/ai-llmstats.ts` → matches `aiModels` docs by `sourceSlugLlmstats`, skips `editorLocked` fields, `payload.update()` (Local API only — invariant #1) → the collection's `afterChange` hook fires `revalidateTag("dashboards:ai")` automatically.

**Editorial write** (unchanged shape): editor edits an `aiModels` row or the `dashboardMethodology` global in `/admin` → `afterChange` → `revalidateTag` → next read reflects it.

---

## Phase Completion Rules

A group in this plan is NOT complete until (mirrors the big plan's rules):

1. **Integration Test** — the piece works end-to-end with the rest of the system (e.g. a cron write actually busts the cache the page reads).
2. **Manual Test** — an engineer loads the actual page/route and sees the effect.
3. **Data Verification** — Payload/Postgres rows checked directly (via `/admin` or a scratch `payload.find`), not inferred from a passing build.
4. **Error Handling** — failure paths (Payload down, adapter fetch fails, unknown route segment, bad bearer) behave as specified.
5. **User Confirmation** — the user has reviewed the manual-test evidence before the group is marked done.

Status markers: ⏳ PLANNED · 🔨 CODE DONE · 🧪 TESTING · ✅ VERIFIED · 🚧 BLOCKED.

---

## Invariants This Plan Must Preserve

1. Engine never writes `aiModels`/`dashboardMethodology`/`SponsorSlots`. Cron writes go through Payload Local API only, never direct Postgres.
2. Human always wins — `editorLocked` checked before every cron field write.
3. No hardcoded rgba/hex — the new `--sponsored-border` token and every new UI element use `var(--...)`.
4. Chrome-only i18n — every new/changed UI string goes through `t(en, vi, id)` or a CMS localized group.
5. CMS-configurable, not hardcoded — methodology, sponsor slot, and `aiModels` rows are all editor-editable in `/admin` without a deploy.
6. No popups, no mid-article ads (unaffected either way).
7. Disclosure/sponsorship framing preserved — "Sponsorship does not influence the data or methodology," sourced from a real `SponsorSlots` relationship, never a placeholder.
8. `revalidateTag` is the only invalidation path — new hooks follow the exact `bust()`/`revalidationDisabled()` pattern already in `apps/web/src/payload/hooks/revalidate.ts`.

---

## Implementation Checklist

Ordered for dependency correctness. Each item is independently verifiable.

**A — Shared plumbing**
1. Create `apps/web/src/lib/bearer-auth.ts` exporting `bearerMatches(header, expected)` — move the constant-time check verbatim out of `apps/web/src/app/api/engine/intake/route.ts` (currently a local `function bearerMatches` + local `timingSafeEqual` import there).
2. Update `apps/web/src/app/api/engine/intake/route.ts` to import `bearerMatches` from the new module instead of defining it locally; remove the now-unused local `timingSafeEqual` import. No behavior change — this is a live integration contract with `dtw-engine`, its 401/500 behavior must be identical after the move.
3. In `apps/web/src/app/globals.css`: add `--sponsored-border: #E0B900;` to `:root` (after `--sponsored`), `--sponsored-border: #D9A62E;` to the `html[data-theme="dark"]` block, and `--color-sponsored-border: var(--sponsored-border);` to the `@theme inline` mapping. **Also add** (amended 2026-07-30, 2nd): `--bar: #3A4E8C;` to `:root` (single-hue bar-fill token for the AI table's six score-column gauges, replacing the old per-column `--ai`/`--dev`/`--startups` bar colors), `--bar: #6B84D6;` to the `html[data-theme="dark"]` block (brighter for dark-background contrast — `--ai` itself has no dark override), and `--color-bar: var(--bar);` to the `@theme inline` mapping.

**B — Payload schema**
4. In `apps/web/src/payload/hooks/revalidate.ts`, add: `revalidateAiModel`/`revalidateAiModelDelete` (tag `dashboards:ai`), `revalidateSponsorSlot`/`revalidateSponsorSlotDelete` (tag `sponsor-slots:all`), `revalidateDashboardMethodology` (Global hook, tag `dashboards:methodology`) — using the existing `bust()`/`revalidationDisabled()` helpers.
5. Create `apps/web/src/payload/collections/AiModels.ts` per the Schema Reference table above, wiring the two new hooks.
6. Create `apps/web/src/payload/globals/DashboardMethodology.ts` per the Schema Reference (AI-only, 2 groups), wiring `revalidateDashboardMethodology`.
7. Update `apps/web/src/payload/collections/SponsorSlots.ts`: add `hooks: { afterChange: [revalidateSponsorSlot], afterDelete: [revalidateSponsorSlotDelete] }` (no field changes).
8. Register `AiModels` in `payload.config.ts`'s `collections` array (after `Newsletters`) and `DashboardMethodology` in the `globals` array (alongside `PaywallSettings`).
9. Run `pnpm --filter web payload:generate-types` — confirms `aiModels`/`dashboardMethodology` compile into `payload-types.ts`.
10. Run `pnpm --filter web payload:migrate:create` (name it `ai_leaderboard_llmstats` or similar) against a reachable local dev Postgres; confirm the CLI added the new migration's entry to `apps/web/src/payload/migrations/index.ts` (verify, don't assume).
11. Run `pnpm --filter web payload:migrate` to apply it locally.
12. Extend `apps/web/scripts/seed-payload.ts`: widen the `CollSlug` union to add `"aiModels"`; **replace** the old fictional 8-row `AI_LEADERBOARD` fixture with an `AI_MODELS` fixture built from REAL, verified LLM Stats data (fetched 2026-07-30 with the real API key, top-8 by `general` ranking — **amended 2026-07-30, 2nd**, supersedes the earlier placeholder-`sourceSlugLlmstats` approach entirely, eliminating that guess risk):

    | rank | model | maker | sourceSlugLlmstats | general | reasoning | coding | math | search | vision | inputPrice | outputPrice | released |
    |---|---|---|---|---|---|---|---|---|---|---|---|---|
    | 1 | GPT-5.6 Sol | OpenAI | `gpt-5.6-sol` | 58.0 | 58.1 | 50.1 | 36.8 | 28.9 | 38.2 | 5.0 | 30.0 | 2026-07-09 |
    | 2 | Claude Opus 5 | Anthropic | `claude-opus-5` | 58.0 | 57.7 | 42.7 | 42.4 | 30.1 | 38.0 | 5.0 | 25.0 | 2026-07-24 |
    | 3 | Claude Fable 5 | Anthropic | `claude-fable-5` | 57.5 | 55.3 | 48.4 | 41.5 | null | 38.3 | 10.0 | 50.0 | 2026-06-09 |
    | 4 | Claude Mythos Preview | Anthropic | `claude-mythos-preview` | 56.1 | 56.6 | 46.6 | 47.1 | 26.1 | 41.4 | null | null | null |
    | 5 | Kimi K3 | Moonshot AI | `kimi-k3` | 55.7 | 54.9 | 44.9 | 42.0 | 34.4 | 39.2 | 3.0 | 15.0 | 2026-07-16 |
    | 6 | GPT-5.6 Terra | OpenAI | `gpt-5.6-terra` | 53.3 | 52.1 | 46.0 | 33.4 | 27.0 | 30.0 | 2.5 | 15.0 | 2026-07-09 |
    | 7 | Claude Opus 4.8 | Anthropic | `claude-opus-4-8` | 52.6 | 52.1 | 43.9 | 39.8 | 26.6 | 40.1 | 5.0 | 25.0 | 2026-05-28 |
    | 8 | Muse Spark 1.1 | Meta | `muse-spark-1.1` | 52.1 | 52.3 | 38.2 | 40.7 | null | 38.1 | 1.25 | 4.25 | 2026-07-09 |

    `null` cells must be seeded as actual `null`, never `0` or an empty string (row 3/8 `search`; row 4 `inputPrice`/`outputPrice`/`released`) — these are real upstream gaps, not missing-data bugs. Set `editorLocked: []` on every row. Upsert by `model`. Add a step upserting the `dashboardMethodology` global via `payload.updateGlobal(...)` with the seed copy from the Schema Reference above (EN + VI + ID) — unchanged from the original plan.
13. Run `pnpm --filter web db:seed` — confirm console output shows a non-zero `aiModels` count (8) and a methodology-global-updated confirmation.

**C — Read helpers**
14. In `apps/web/src/lib/payload-server.ts`: add `getAiModels()` (tag `dashboards:ai`, revalidate 3600) — queries `aiModels` sorted by `rank`, maps to the amended `AiLeaderboardRow` shape (**amended 2026-07-30, 2nd**: `rank`, `model`, `maker`, `general`, `reasoning`, `coding`, `math`, `search`, `vision`, `inputPrice`, `outputPrice`, `released` — the six score fields, both price fields, and `released` are `number | null` / `string | null` respectively, passed through as-is; no `speed`/`ctx`/single `price` anymore), computes `asOfScores` = max `asOfScores` across returned docs; try/catch → falls back to `{ rows: AI_LEADERBOARD, asOfScores: null }` (the updated fallback constant in `lib/data.ts` — this file is touched this pass, see Touchpoints).
15. Add `getDashboardSponsorSlot(slot: "dashboard_ai")` (tag `sponsor-slots:all`, revalidate 3600) — filters `sponsorSlots` by `slot` plus the `startsAt`/`endsAt` window (same pattern as any other date-windowed query in this file), depth 1, published-only; try/catch → `null`.
16. Add `getDashboardMethodology()` (tag `dashboards:methodology`, revalidate 300) — reads the `dashboardMethodology` global; applies the same `?? / ||` en-fallback pattern already used for `NavPillar.title`; try/catch → returns a hardcoded object matching the seed copy exactly (mirrors `getPaywallThreshold`'s defensive pattern).
17. Update the "Cache-tag conventions" comment block at the top of `payload-server.ts` to document the 3 new tags (`dashboards:ai`, `dashboards:methodology`, `sponsor-slots:all`).

**D — Route restructure**
18. Convert `apps/web/src/app/(reader)/dashboards/[[...sub]]/page.tsx` from a `"use client"` component using `use(params)` to an async server component using `await params` (matches the `(reader)/[pillar]/page.tsx` pattern). Logic: `sub` empty/undefined → fetch (step 20) and render; `sub.length === 1 && sub[0] === "ai"` → `permanentRedirect("/dashboards")`; anything else → `notFound()`.
19. Add `export const revalidate = 60;` and `generateMetadata()` returning a fixed `{ title: "AI Leaderboard | Dashboards | Dailytechwire", description: "..." }` (English only, matching the root layout's English-only metadata convention) — no per-tab branching needed, there's only one page state.
20. `Promise.all([getAiModels(), getDashboardMethodology(), getDashboardSponsorSlot("dashboard_ai")])`; resolve the sponsor doc to an `ArticleView` via `toArticleView()` if non-null; render `<AILeaderboard rows={...} asOfScores={...} methodology={...} sponsor={sponsorView} />`.
21. Create `apps/web/src/app/(reader)/dashboards/[[...sub]]/loading.tsx`: a skeleton using `@dtw/ui`'s `Skeleton` — header block + ~8 table-row blocks (this is the first `loading.tsx` in the app; keep it simple).
22. Create `apps/web/src/app/(reader)/dashboards/[[...sub]]/error.tsx`: `"use client"`, standard `{ error, reset }` props, `useEffect(() => console.error(error), [error])`, a translated message + "Try again" button calling `reset()` (this is the first `error.tsx` in the app).

**E — Component rewrite**
23. Rewrite `apps/web/src/components/dashboards/ai-leaderboard.tsx` to accept props `{ rows: AiLeaderboardRow[]; asOfScores: string | null; methodology: { en: string; vi?: string; id?: string }; sponsor: ArticleView | null }` and to own the full page body (Lean Deviation #2):
    - **Header**: kicker "Data Desk · Preview" (unchanged copy) + `<h1>AI Leaderboard</h1>` (replaces the generic "Dashboards" h1 — there's only one page state now, name it what it is). Drop the old two-tracker intro paragraph entirely (it referenced funding and "sample data"); the table's own caption (below) carries the honesty framing instead. Reuse the existing header markup's visual style (border-bottom `var(--brand-navy)`, `GridBackdrop`) from the current `page.tsx`.
    - **Column set (amended 2026-07-30, 2nd — final, confirmed against live data; visual reference `demos/ai-leaderboard-table-preview.html`)**: 11 columns in this exact order — `#` / **Model** (model name + `maker` sub-line, no separate Maker `<th>`/`<td>` anymore — remove the current `Th k="maker"` header and standalone maker `<td>`) / **General** / **Reasoning** / **Coding** / **Math** / **Search** / **Vision** / **Input $/M** / **Output $/M** / **Released**. `SortKey = keyof AiLeaderboardRow` stays but `"speed"`/`"ctx"`/`"price"` are gone from the type along with the field removals.
    - **Th alignment**: match the demo — `general`/`reasoning`/`coding`/`math`/`search`/`vision` `Th`s are left-aligned (no `num` prop, consistent with the existing `Th num` pattern already in this component); `inputPrice`/`outputPrice`/`released` `Th`s use `num` (right-aligned), same as `rank`.
    - **Local `Th` upgraded per AD-11** (unchanged from the original plan): `<th aria-sort={...}>` wraps a real `<button type="button" onClick={() => onSort(k)}>` (reset default button chrome via inline style: no background/border, inherit font, `cursor: pointer`) instead of the current `onClick` directly on the `<th>`.
    - Drop the table section's redundant inner `<h2>AI Leaderboard</h2>` (now covered by the page `<h1>`); keep the "Optimize for" controls row, add `aria-pressed={sortKey === k}` to each pill. **Pill set (amended 2026-07-30, 2nd)**: `General`, `Reasoning`, `Coding`, `Math`, `Search`, `Vision`, `Price (low)` — 7 pills (was `Reasoning`/`Coding`/`Speed`/`Price (low)`). Clicking `General`/`Reasoning`/`Coding`/`Math`/`Search`/`Vision` sorts that key descending (`sortDir="desc"`, matching the score-column convention already in `onSort`); clicking `Price (low)` sorts `inputPrice` ascending (`sortDir="asc"`) — this pill maps to the `inputPrice` field specifically, not `outputPrice`. **Default sort on mount is now `general` descending** (was `reasoning` descending).
    - Replace `AI_LEADERBOARD` import/usage with the `rows` prop.
    - **`Bar`/gauge rewrite (amended 2026-07-30, 2nd, replaces the original label-prop design)**: `Bar` becomes `Bar({ v }: { v: number | null })` — drop the `color` prop entirely; the fill is always `var(--bar)` (the new single-hue token from Group A item 3), replacing the old per-column `--ai`/`--dev`/`--startups` treatment. When `v == null`, render a plain `"–"` (styled `var(--muted-2)`, matching the demo's `.na` treatment) instead of a bar — no track, no fill. When `v` is a number: `role="img"` and `aria-label={v.toFixed(1)}` (**raw value only** — no dimension-name prefix; this simplifies and replaces the original plan's translated `label` prop threaded through 3 call sites, which is no longer needed). Fill width = `(v / colMax[key]) * 100` (clamped 0–100), where `colMax` is computed once via `useMemo` over the `rows` prop for each of `general`/`reasoning`/`coding`/`math`/`search`/`vision`: `Math.max(...values.filter((x): x is number => x != null), 1)` (the `1` floor avoids divide-by-zero if a column is ever all-null). Display the raw number next to the bar with 1 decimal (`v.toFixed(1)`) when non-null.
    - **Price cells (`inputPrice`/`outputPrice`, amended 2026-07-30, 2nd)**: each rendered independently — `null` → `"–"`; `0` → `t("free", "miễn phí", "gratis")`; otherwise `"$" + v.toFixed(2)` (**2 decimals**, matching the demo — was 1 decimal in the original plan). No shared component needed; this is plain conditional JSX per cell, same as the demo's inline logic.
    - **Released cell (new, amended 2026-07-30, 2nd)**: `null` → `"–"`; otherwise format via a new locale-aware-but-UTC-anchored helper — add `export function fmtDateUTC(iso: string, lang: Lang): string` to `apps/web/src/lib/i18n.tsx`, mirroring the existing `fmtDateL`/`fmtFullDate` pattern (`localeFor(lang)` for the locale string, `{ month: "short", day: "numeric", year: "numeric" }`) but with `timeZone: "UTC"` instead of `PUBLICATION_TZ` — `release_date` is a date-only calendar string, not a Singapore-anchored publish instant, and forcing UTC guarantees the displayed calendar date always matches the source string regardless of the viewer's or server's local timezone (same SSR/CSR-mismatch class of bug `PUBLICATION_TZ` was already introduced to avoid, per the comment already in that file). Call `fmtDateUTC(m.released, lang)` in the component (verify the exact hook/prop this file already uses to obtain `lang` before assuming a name — don't invent a new i18n access pattern).
    - Wrap the `"free"` literal in `t("free", "miễn phí", "gratis")` — now applies at both the `inputPrice` and `outputPrice` cells (see above), not a single `price` cell.
    - Replace the "sample data, preview" caption with: `t("Sort by what you actually use the model for · Scores via LLM Stats, as of {date}", ...)` (substitute the formatted `asOfScores` date, or an "as of —" placeholder when null) — unchanged from the original plan.
    - Add the required attribution line below the table, linking to `https://llm-stats.com`: `t("Model scores & pricing: LLM Stats", "Điểm mô hình & giá: LLM Stats", "Skor model & harga: LLM Stats")` — reworded 2026-07-30 (2nd amendment) to drop "context" after the Context column was cut; the license only requires visible credit + link, which this preserves.
    - **Methodology block**: single card (no funding/AI branch — always the AI copy), reads `methodology.en`/`.vi`/`.id` through `t()`, keeps the existing "For informational purposes only" disclaimer line pattern — unchanged.
    - **Sponsor card**: renders nothing if `sponsor` is null; otherwise "Sponsor slot · this dashboard" header, "Brought to you by `{sponsor.sponsor ?? sponsor.title}`" linking to `/article/{sponsor.slug}`, and the unchanged "Sponsorship does not influence the data or methodology" line — border uses `var(--sponsored-border)` (not the hardcoded hex) — unchanged.
24. Update `apps/web/src/app/(reader)/dashboards/[[...sub]]/page.tsx` to remove the now-dead inline header/tab-bar/methodology/sponsor JSX and its `FundingTracker`/`AILeaderboard`-as-bare-import usage, replacing it with the single call from step 20. Remove the `import { FundingTracker } from "@/components/dashboards/funding-tracker";` line entirely (the file itself stays untouched, unimported).

**F — Homepage teaser**
25. Update `apps/web/src/app/(reader)/page.tsx`: add `getAiModels()` to the existing `Promise.all` fetch list; pass `aiModels.rows` to `<DashboardsTeaser aiRows={...} />`.
26. Update `apps/web/src/components/home/dashboards-teaser.tsx`: remove the `AI_LEADERBOARD` import; accept a new prop `aiRows: AiLeaderboardRow[]` and slice `.slice(0, 4)` internally (same as today); **delete the entire "Asia Funding teaser" `<Link>` block** (the funding card, its `fundSeries`/`fundChange` consts, `AnimatedSpark`/`CountUp` funding usage); keep `SectionHeader` (title/kicker/"Open full dashboards →" CTA) unchanged — it still points at `/dashboards`, which now shows the AI board directly; drop the outer `r-grid-2` two-column wrapper since only one card remains. Translate the remaining AI-relevant strings: the "AI Leaderboard" label (`t("AI Leaderboard","Bảng xếp hạng AI","Papan Peringkat AI")`), "This week's top models" (`t("This week's top models","Mô hình hàng đầu tuần này","Model teratas minggu ini")`), "filter by use case →" (`t("filter by use case →","lọc theo mục đích sử dụng →","filter berdasarkan kasus penggunaan →")`). **Header set (amended 2026-07-30, 2nd)**: the compact teaser table becomes 6 columns — `#` / `Model` / `General` / `Reason` / `Code` / `$/M-in` (was 5: `#`/`Model`/`Reason`/`Code`/`$/M`) — `t("Model","Mô hình","Model")`, `t("General","Tổng quát","Umum")` (new), `t("Reason","Luận","Nalar")`, `t("Code","Mã","Kode")` unchanged — leave `"#"` and `"$/M-in"` untranslated (symbol-only labels, extending the existing `"#"`/`"$/M"` precedent). **Data cells (amended 2026-07-30, 2nd)**: render `m.general`, `m.reasoning`, `m.coding` as `v.toFixed(1)` when non-null else `"–"`; render `m.inputPrice` as `"$" + v.toFixed(2)` when non-null, `t("free","miễn phí","gratis")` when `0`, `"–"` when `null` — **the top-4 seeded rows are NOT all-non-null**: row 4 (Claude Mythos Preview) has `inputPrice: null` (verified from the real seed data in item 12), so the null-render path is not just defensive boilerplate — it will actually render on day one.

**G — Cron automation**
27. Create `apps/web/src/lib/dashboards/ai-llmstats.ts`: thin adapter making **7 request groups per run** (**amended 2026-07-30, 2nd** — was 3; verified mapping): (a) walk `GET https://api.llm-stats.com/stats/v1/models?limit=200` (follow `next_cursor` until exhausted — catalog is ~335 models / 2 pages), index by `id` → `maker = organization.name`, `inputPrice` = min non-null `providers[].input_price_per_m` (`0` = free), `outputPrice` = min non-null `providers[].output_price_per_m` (`0` = free), `released = release_date` (write only when non-null — omit the field otherwise, same skip pattern as everything else); (b) **SIX** `GET /v1/rankings?category={general|reasoning|code|math|search|vision}&limit=50` calls (one request per category — `code` is canonical, `coding` is an accepted alias returning identical rows, use `code`) → index `conservative_rating` by `model_id` per category (raw, 1 decimal) → write to `general`/`reasoning`/`coding`/`math`/`search`/`vision` respectively. **Total ≈ 8 requests/week** (1–2 page walk + 6 rankings calls) — trivial against LLM Stats' per-minute rate limits. All requests send `Authorization: Bearer $LLMSTATS_API_KEY`. Do NOT read `top_scores` (benchmark-native mixed units — verified unusable) or rankings' `score` field (inconsistent scale) — `conservative_rating` only. A matched model absent from a given category's top-50 gets no write for that field (keep last value/null, log). Returns `{ sourceSlugLlmstats, maker, general, reasoning, coding, math, search, vision, inputPrice, outputPrice, released }[]` with absent fields omitted per row. Never creates new `aiModels` rows; unmatched upstream ids are logged and skipped.
28. In `ai-llmstats.ts`, implement the mandatory failure handling from the design reference §3 (verbatim, unchanged): treat an HTTP 2xx response with a non-JSON body as a failure (Cloudflare bot-challenge can serve HTML with 200); on a genuine error response, parse the `{ error: { code, message } }` envelope; on HTTP 429, honor `Retry-After`; retry once with jittered backoff on transient failures; on any unrecovered failure, write nothing — the route handler leaves existing `aiModels` fields untouched (last-good cache).
29. Create `apps/web/src/app/api/dashboards/refresh/[source]/route.ts`: exports `GET` and `POST` delegating to one internal handler; validates `source` against the literal `"ai-weekly"` (404 otherwise — Lean Deviation #7, the dynamic segment stays future-compatible but nothing else is wired yet); checks `bearerMatches` against `DTW_DASHBOARD_REFRESH_TOKEN` (401 otherwise); calls `ai-llmstats.ts`, matches `aiModels` docs by `sourceSlugLlmstats`, writes the owned fields (respecting `editorLocked`), logs+skips unmatched results, never creates new rows; sets `export const maxDuration = 60`.
30. Add `DTW_DASHBOARD_REFRESH_TOKEN=""` and `LLMSTATS_API_KEY=""` to `.env.example`, with a comment explaining the required Vercel-side `CRON_SECRET` duplication for `DTW_DASHBOARD_REFRESH_TOKEN` (an ops step, not a code step) and that `LLMSTATS_API_KEY` is a free server-only key from llm-stats.com/developer.
31. Add one `crons` entry to `apps/web/vercel.json` (the file currently has no `crons` key — additive): `{ "path": "/api/dashboards/refresh/ai-weekly", "schedule": "0 3 * * 1" }`.

**H — Closeout**
32. Update `process/features/dashboards/_GUIDE.md`: change `Status: not-started` to reflect that the AI Leaderboard is live/CMS-backed/cron-refreshed, and add a short note that the Asia Funding Tracker is intentionally hidden from the UI and deferred (not missing, not broken) — point at `dashboards-automation_PLAN_14-07-26.md` for the deferred scope.

---

## Touchpoints

**New files**
- `apps/web/src/lib/bearer-auth.ts`
- `apps/web/src/lib/dashboards/ai-llmstats.ts`
- `apps/web/src/payload/collections/AiModels.ts`
- `apps/web/src/payload/globals/DashboardMethodology.ts`
- `apps/web/src/payload/migrations/<new migration pair>`
- `apps/web/src/app/api/dashboards/refresh/[source]/route.ts`
- `apps/web/src/app/(reader)/dashboards/[[...sub]]/loading.tsx`
- `apps/web/src/app/(reader)/dashboards/[[...sub]]/error.tsx`
- `apps/web/src/app/(reader)/dashboards/[[...sub]]/layout.tsx` (not in the original Touchpoints — see EXECUTE progress adaptation #3 above)

**Modified files**
- `apps/web/src/app/api/engine/intake/route.ts` (bearer-check extraction only, no behavior change)
- `apps/web/src/app/globals.css` (new `--sponsored-border` token; **amended 2026-07-30, 2nd**: new `--bar` token)
- `apps/web/src/payload/collections/SponsorSlots.ts` (add hooks only)
- `apps/web/src/payload/hooks/revalidate.ts` (3 new hook exports)
- `apps/web/payload.config.ts` (register `AiModels` + `DashboardMethodology`)
- `apps/web/scripts/seed-payload.ts` (`AI_MODELS` fixture + methodology-global upsert)
- `apps/web/src/lib/payload-server.ts` (3 new cached helpers + tag docs)
- `apps/web/src/app/(reader)/dashboards/[[...sub]]/page.tsx` (server conversion, tab bar removed)
- `apps/web/src/components/dashboards/ai-leaderboard.tsx` (becomes the full page body — header + table + methodology + sponsor)
- `apps/web/src/app/(reader)/page.tsx` (homepage fetch addition)
- `apps/web/src/components/home/dashboards-teaser.tsx` (AI-only, single card)
- `apps/web/src/lib/data.ts` (**amended 2026-07-30, 2nd**: `AiLeaderboardRow` interface + `AI_LEADERBOARD` fallback constant updated to the new field shape — this file is no longer read-only for this feature)
- `apps/web/src/lib/i18n.tsx` (**amended 2026-07-30, 2nd**: new `fmtDateUTC` export for the Released column)
- `apps/web/vercel.json` (1 cron entry)
- `.env.example` (2 new vars)
- `process/features/dashboards/_GUIDE.md`

**Untouched (dormant, do NOT delete or edit)**
- `apps/web/src/components/dashboards/funding-tracker.tsx`
- `apps/web/src/components/dashboards/big-chart.tsx`
- `apps/web/src/lib/data.ts`'s `FUNDING_ROWS`/`FundingRow` — these stay untouched (only `AiLeaderboardRow`/`AI_LEADERBOARD` in the same file are modified this pass; see Modified files above)

---

## Public Contracts

- **New env vars**: `DTW_DASHBOARD_REFRESH_TOKEN` (plus an ops-side Vercel `CRON_SECRET` duplication, not a repo env var) and `LLMSTATS_API_KEY` (server-only). No stock-vendor env var — no stock data exists in this pass.
- **New HTTP route**: `GET|POST /api/dashboards/refresh/[source]` where `source` must be exactly `"ai-weekly"` (anything else 404s); bearer-token protected (401 on mismatch).
- **New Payload collection/global**: `aiModels`, `dashboardMethodology` — no external consumers yet.
- **`SponsorSlots`** gains its first real hooks; its field contract (`slot`/`article`/`startsAt`/`endsAt`) is unchanged.
- **Component prop contract changed** (internal only): `AILeaderboard` moves from zero/static-import props to `{ rows, asOfScores, methodology, sponsor }`; `DashboardsTeaser` moves from a static `AI_LEADERBOARD` import to `{ aiRows }`.
- **`vercel.json`** gains a `crons` key (didn't exist before — additive).
- **`/dashboards/funding`** and **`/dashboards/bogus`**-style paths now 404 (previously rendered a funding tab) — this is an intentional, owner-approved behavior change, not a regression.

---

## Blast Radius

- **High-confidence isolated**: `aiModels`, `dashboardMethodology`, the one cron route, `ai-llmstats.ts` — none are read by any code path outside `/dashboards`/homepage-teaser.
- **Shared-file edits, additive only**: `payload-server.ts`, `revalidate.ts`, `payload.config.ts`, `.env.example`, `globals.css` (new token only, no existing var changed), `i18n.tsx` (new export only, no existing export changed).
- **Genuine shared-behavior-risk file**: `apps/web/src/app/api/engine/intake/route.ts` — the bearer-check extraction must not change its 401/500 behavior; this is a live `dtw-engine` integration contract.
- **Homepage**: `(reader)/page.tsx` + `dashboards-teaser.tsx` touch the highest-traffic page — verify the rest of the homepage (hero, brief band, wire drops) is unaffected; this only adds one `Promise.all` entry and changes one component's props.
- **User-facing route change**: `/dashboards/funding` goes from a working tab to a 404. This is the explicit point of the owner's decision — flag it in the closeout summary so nobody mistakes it for a bug later.
- **No changes** to `packages/db` (Drizzle schema beyond the new migration), Better-Auth, RBAC, search, newsletters, or any article/pillar code path.

---

## Verification Evidence

1. `pnpm typecheck` (root) — clean.
2. `pnpm --filter web build` — succeeds.
3. `pnpm --filter web payload:migrate` — applies cleanly on a fresh local DB.
4. `pnpm --filter web db:seed` — non-zero `aiModels` count (8) logged; methodology global updated confirmation logged.
5. Manual browser: `/dashboards` → 200, renders the AI Leaderboard directly (no tab bar); `/dashboards/ai` → 308/redirect to `/dashboards`; `/dashboards/funding` and `/dashboards/bogus` → both 404.
6. Manual: throttle network in devtools, confirm `loading.tsx` skeleton appears; temporarily force a thrown error in a helper, confirm `error.tsx` renders with a working "Try again."
7. Manual: keyboard-only — Tab to a sort button, Enter, confirm row order + `aria-sort` change; Tab to an "Optimize for" pill, Enter/Space, confirm `aria-pressed` flips.
8. Manual: `curl -X POST /api/dashboards/refresh/ai-weekly` with a correct bearer token (expect 200, real write or graceful no-op if LLM Stats key isn't set yet) and an incorrect token (expect 401); `curl` any other `source` value (expect 404).
9. Manual: in `/admin`, set an `editorLocked` entry on a test `aiModels` row for `reasoning`, re-run the cron manually, confirm `reasoning` did NOT change on that row while other fields still refreshed.
10. `grep -rn "AI_LEADERBOARD" apps/web/src/components apps/web/src/app` — only the fallback path inside `payload-server.ts` (and `lib/data.ts`'s own definition) remain; no direct component import.
11. `grep -n "not-started" process/features/dashboards/_GUIDE.md` — zero hits after the closeout update.
12. **(amended 2026-07-30, 2nd)** Visual/manual: compare the rendered `/dashboards` table against `demos/ai-leaderboard-table-preview.html` (the owner-approved visual reference) — column order (`# / Model+maker / General / Reasoning / Coding / Math / Search / Vision / Input $/M / Output $/M / Released`), null cells render "–", single-hue `var(--bar)` fill, price formatting (`$X.XX`, `0` → "free"), and default sort (`general`, descending) all match.

---

## Ops Checklist (non-code, external)

| # | Action | Owner | Blocks |
|---|---|---|---|
| 1 | Confirm the Vercel plan/tier supports at least 1 cron job entry | user | `vercel.json`'s `ai-weekly` cron actually firing in production |
| 2 | Set Vercel project's `CRON_SECRET` env var to the same value as `DTW_DASHBOARD_REFRESH_TOKEN` | user | Vercel's automatic cron `GET` invocation passing the bearer check |
| 3 | Obtain a free `LLMSTATS_API_KEY` from llm-stats.com/developer, set as a Vercel env var | user | `ai-weekly` cron actually refreshing `aiModels` — without it, `ai-llmstats.ts` fails closed (no write; seeded/last-good data keeps rendering) |

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| LLM Stats real schema differs from this plan's assumptions (`top_scores` key names, score scale, id stability) | Known Unknowns #1/#2/#5 require EXECUTE to verify at first real run; log-and-skip the affected mapping on a mismatch — schema and lock/skip behavior are unaffected either way |
| Single-source dependency on LLM Stats; unofficial/undocumented API, no SLA; a Cloudflare bot-challenge or outage can return HTTP 2xx with non-JSON HTML | `ai-llmstats.ts` treats 2xx-with-non-JSON as a failure; parses the `{ error }` envelope on real errors; honors `Retry-After` on 429; retries once with jitter; on any unrecovered failure writes nothing — last-good `aiModels` data keeps rendering |
| Hiding `/dashboards/funding` outright (vs. leaving a "coming soon" state) means any existing inbound link/bookmark 404s | Deliberate, owner-approved (this plan's whole premise). Recorded in Blast Radius so it isn't mistaken for a regression later |
| ~~Seed-time `sourceSlugLlmstats` placeholders are guesses, not verified upstream ids~~ **RESOLVED 2026-07-30 (2nd amendment)** | The 8 seed rows now use REAL, live-verified `sourceSlugLlmstats` ids (`gpt-5.6-sol`, `claude-opus-5`, `claude-fable-5`, `claude-mythos-preview`, `kimi-k3`, `gpt-5.6-terra`, `claude-opus-4-8`, `muse-spark-1.1` — see checklist item 12). The cron still logs-and-skips any row whose `sourceSlugLlmstats` doesn't match a real upstream id, as defense-in-depth against a future upstream id change. |

---

## Resume and Execution Handoff

A resumed EXECUTE session should read, in order:
1. This plan file in full.
2. `process/features/dashboards/references/ai-leaderboard-llmstats-design_REFERENCE_30-07-26.md` — the LLM Stats adapter/mapping design this plan's Group G depends on, including §8's live verification addendum. `demos/ai-leaderboard-demo.html` + `demos/serve-ai-leaderboard.mjs` (repo root) are the living API proof-of-concept — read them for real request/response shapes before writing the adapter. `demos/ai-leaderboard-table-preview.html` (**amended 2026-07-30, 2nd**) is the owner-approved visual reference for the final table — column order, pills, bar treatment, and "–" for nulls all come from this file.
3. `process/context/all-context.md` (invariants) and `process/context/database/all-database.md` (the `lockedFields`/`editorLocked` spirit).
4. `apps/web/src/payload/hooks/revalidate.ts` and `apps/web/src/lib/payload-server.ts` (current state — check whether earlier steps already landed).
5. `apps/web/src/payload/migrations/index.ts` — check whether this plan's migration already exists before running `payload:migrate:create` again.
6. Check `git status`/`git log` for partially-applied steps from a prior session before re-running any step — not every step here is safe to blindly re-run twice (e.g. migration creation).
7. The big plan (`dashboards-automation_PLAN_14-07-26.md`) and its hold note, ONLY when the funding pass resumes — reconcile against what this plan already built (`aiModels`, `dashboardMethodology`, bearer-auth extraction, the cron route shape, the page restructure) rather than re-doing any of it.

Work through Groups A→H in order; do not start Group G (cron) before Group B/C (schema/helpers) exist.

---

## Acceptance Criteria

- [ ] `aiModels` + `dashboardMethodology` exist in `/admin`, seeded (8 rows + methodology copy).
- [ ] `/dashboards` renders the AI Leaderboard directly from CMS data (no tab bar, no funding UI anywhere in the DOM).
- [ ] `/dashboards/ai` redirects (308) to `/dashboards`; `/dashboards/funding` and any other sub-path 404.
- [ ] `generateMetadata`, `loading.tsx`, `error.tsx` all present and functioning.
- [ ] Sponsor card renders nothing when empty, a real sponsor when a `SponsorSlots` row matches; uses `var(--sponsored-border)`, not a hardcoded hex.
- [ ] Methodology copy is CMS-editable.
- [ ] Homepage teaser shows only the AI card, prop-driven, no `AI_LEADERBOARD` import.
- [ ] Full keyboard operability + `aria-sort`/`aria-pressed`/`aria-label` coverage on the table.
- [ ] Cron route (`ai-weekly`) exists, bearer-protected, both `GET`/`POST` work, degrades gracefully to last-good cached data on adapter failure.
- [ ] `funding-tracker.tsx`/`big-chart.tsx` untouched and unimported; not deleted.
- [ ] `_GUIDE.md` no longer says `not-started` and notes the funding tracker is hidden/deferred, not broken.
- [ ] **(amended 2026-07-30, 2nd)** AI table renders the confirmed 11-column set (`# / Model+maker / General / Reasoning / Coding / Math / Search / Vision / Input $/M / Output $/M / Released`), exactly matching `demos/ai-leaderboard-table-preview.html`; no Speed/Context/Writing column anywhere; null values render "–"; bars use the single-hue `var(--bar)` token.

---

## RIPER-5 Guidance

This plan was produced in PLAN mode. Say **"ENTER EXECUTE MODE"** to begin implementation — EXECUTE must follow this plan with full fidelity, Groups in order A→H, and must stop to flag anything in "Known Unknowns" that contradicts this plan's assumptions rather than silently improvising past it.
