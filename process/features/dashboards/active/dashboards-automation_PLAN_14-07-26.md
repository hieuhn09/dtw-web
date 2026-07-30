# Dashboards Completion + Max-Legal-Automation (PA3) — Implementation Plan

**Date**: 14-07-26
**Updated**: 15-07-26 — ticker universe expanded 12 → 36 (see AD-13, Schema Reference "Seeded ticker universe", Non-Goals)
**Updated**: 15-07-26 — stock price source changed from Marketstack to Yahoo Finance (non-VN tickers) + a dedicated Vietnamese-source adapter (VN tickers), per an explicit owner override — see AD-14, Risks, Ops Checklist
**Complexity**: COMPLEX (standard complex — one execution stream, one execute pass)
**Feature**: dashboards
**Approved approach**: PA3 — "max legal automation": Yahoo Finance daily stock cron for all ~28 non-VN tickers (owner-accepted ToS/redistribution risk, ships **active** from day one, no license gate — see AD-14) + a dedicated Vietnamese-source daily stock cron for all 6 public VN tickers (VNDirect `dchart` primary → TCBS fallback → SSI FastConnect as a license-clean cross-check anchor) + free weekly AI leaderboard cron (LLM Stats API, single-source — amended 2026-07-30, replaces LMArena CC-BY-4.0 + models.dev MIT, see AD-5) + manual funding-rounds entry via the free Tracxn journalist program.
**Plan file**: `process/features/dashboards/active/dashboards-automation_PLAN_14-07-26.md`

## Overview

`/dashboards` (Asia Funding Tracker + AI Leaderboard) and its homepage teaser currently render entirely from hardcoded arrays in `lib/data.ts`, labeled honestly as "Sample data — coming soon." This plan replaces that with a CMS-backed, partially-automated data layer: four new Payload collections (`dashboardTickers`, `dashboardQuoteSnapshots`, `aiModels`, `fundingRounds`) plus one Payload global (`dashboardMethodology`), wired through the house `afterChange` → `revalidateTag` → `unstable_cache` pattern, seeded so nothing regresses visually on day one. Two Vercel cron routes keep AI-leaderboard scores and stock prices fresh automatically — both **active from day one**, with no license-confirmation gate (see AD-14); funding rounds stay 100% manual/editorial. The page moves from a fully client-rendered component to a server-fetching page (closing SEO/404/loading/error/empty-state gaps in the same pass), the sponsor slot and methodology section become real CMS surfaces, and a full accessibility + i18n + CSV-correctness pass closes out the feature. The plan also bootstraps the repo's first Playwright test tooling with one spec, and fixes the shared `#E0B900` hardcoded color across 4 files.

This is **one execute pass** — no phase program. The stocks cron ships fully built **and active**: unlike the superseded Marketstack design, neither the Yahoo adapter nor the Vietnamese-source adapter requires a paid tier, an API key, or a written license-confirmation email, so there is no ops gate blocking it from going live (see AD-14; the Ops Checklist below has been trimmed accordingly).

**Status**: ⏳ PLANNED

**Amended 2026-07-30**: AI data sources swapped to LLM Stats API per `references/ai-leaderboard-llmstats-design_REFERENCE_30-07-26.md` (owner decision).

**ON HOLD (2026-07-30, owner decision)**: the AI Leaderboard portion is superseded by `active/ai-leaderboard-llmstats_PLAN_30-07-26.md` and ships alone; the Funding Tracker is hidden from the UI and this plan's stocks/funding scope is deferred until the owner revives it. Do not execute this file as-is — reconcile with what the AI-only plan already built (`aiModels`, methodology global, bearer-auth, cron route, page restructure) before resuming.

---

## Quick Links

- [Phase Completion Rules](#phase-completion-rules)
- [Non-Goals / Explicitly Deferred](#non-goals--explicitly-deferred)
- [Known Unknowns EXECUTE Must Verify First](#known-unknowns-execute-must-verify-first)
- [Architecture Decisions](#architecture-decisions-final)
- [Data Flow](#data-flow)
- [Invariants This Plan Must Preserve](#invariants-this-plan-must-preserve)
- [Schema Reference](#schema-reference)
- [Execution Brief](#execution-brief)
- [Implementation Checklist](#implementation-checklist)
- [Touchpoints](#touchpoints)
- [Public Contracts](#public-contracts)
- [Blast Radius](#blast-radius)
- [Verification Evidence](#verification-evidence)
- [Ops Checklist (non-code, external)](#ops-checklist-non-code-external)
- [Risks and Mitigations](#risks-and-mitigations)
- [Resume and Execution Handoff](#resume-and-execution-handoff)
- [Acceptance Criteria](#acceptance-criteria)

---

## Phase Completion Rules

A phase/group in this plan is NOT complete until:

1. **Integration Test** — works with the rest of the system end-to-end (e.g. a cron write actually busts the cache the page reads).
2. **Manual Test** — an engineer can load the actual page/route and see the effect.
3. **Data Verification** — Postgres/Payload rows checked directly (via `/admin` or a `payload.find` in a scratch script), not inferred from "the build passed."
4. **Error Handling** — failure paths (Payload down, adapter fetch fails, unknown route segment) behave as specified, not just the happy path.
5. **User Confirmation** — the user has reviewed the manual-test evidence before the group is marked done.

Status markers used below: ⏳ PLANNED · 🔨 CODE DONE · 🧪 TESTING · ✅ VERIFIED · 🚧 BLOCKED.

---

## Non-Goals / Explicitly Deferred

Recorded so a future agent doesn't silently re-litigate or re-attempt these:

| Item | Why deferred |
|---|---|
| LLM funding-round extraction via `dtw-engine` | PA4, largest remaining build, touches a separate repo; requires draft-only intake + mandatory editor approval design not yet specced |
| `DashboardSources` encrypted-API-keys collection | Ceremony for 2 env vars; plain Vercel env vars suffice at this scale |
| BullMQ / `dtw-workers` | Doesn't exist; Vercel cron → route handler is the only scheduler this repo supports today |
| Sub-daily / real-time data of any kind | Licensing-realistic data is EOD/delayed only; the guide's 5-minute refresh ambition is formally abandoned |
| Funding-rounds API integrations (Crunchbase/Dealroom/PitchBook/CB Insights) | No affordable tier permits public display; manual entry + Tracxn journalist program is the approved path |
| Scraping (yfinance, benchmark sites) | ToS-prohibited; disqualifying for an editorial-integrity brand |
| AI Leaderboard CSV export | Spec row 42 lists no export button for this tab — not a gap |
| Sticky table headers | Never implemented anywhere (guide-only ambition); dropped, recorded in `_GUIDE.md` at closeout |
| A dedicated "funding rounds" list/table UI on `/dashboards/funding` | `fundingRounds` in this pass is a backend + homepage-teaser data source only; no new on-page table. Recorded as deferred/abandoned at closeout per the task's explicit instruction |
| Sitemap/robots, PostHog wiring | Real gaps, but site-wide — not dashboards-specific; separate plans. PostHog also re-triggers the cookie-consent banner that was just hidden (commit `9724bb9`) |
| Interactive `BigChart` beyond snapshot-derived data (tooltips, zoom, axes) | Out of scope; only the data source changes (static → snapshot-derived), not the interaction model |
| `CountUp` reduced-motion gate (gap #17) | Minor, pre-existing, not named in the approved scope — left untouched, noted here so it isn't mistaken for new debt |
| AI leaderboard "#" showing post-sort position instead of a stored rank (gap #21) | Matches the original design intentionally; not named in approved scope — unchanged |
| Footer `/dashboards` link, search-placeholder copy fix (gaps #19/#22) | Small, real, but not named in approved scope — left for a future polish pass |
| `article-content.tsx`'s "PAID PARTNER" badge hardcoding `#FEF3C7`/`#7A5800` (background/text, not just the border) | Adjacent bug discovered during research; the approved scope only covers the shared `#E0B900` **border** hex, not this badge's other hardcoded colors. Flagged for a future pass, not fixed here |
| ~~Yahoo Finance / vnstock-FireAnt-SSI adapter for Vietnam `.VN` HOSE + UPCoM tickers, deferred to Phase 2~~ — **SUPERSEDED 15-07-26** | This item is no longer deferred. Per the owner's Yahoo-Finance decision (AD-14), a dedicated Vietnamese-source adapter (VNDirect → TCBS → SSI FastConnect) is now built for all 6 public VN tickers (`stocks-vietnam.ts`, Group G) — see AD-13/AD-14 and the Schema Reference. Left in this table, struck through, so the plan's history stays auditable rather than silently rewritten |
| Reclassifying `VNG` from `manual-private` to a live-tracked public ticker (possibly under a `VNZ`-style symbol) | Out of scope for this update. The 15-07-26 full-automation research's owner-decision text refers to "Vietnam's 7 tickers" (implying a 7th, UPCoM/Nasdaq-listed VNG ticker referred to there as "VNZ") — see AD-14's note on this. This plan does NOT resolve that question or add/rename a row here: it would touch AD-2's private-company boundary, not just the stock-price-vendor swap this update is scoped to, and this plan cannot verify VNG's real exchange/sector metadata without fabricating it. Flagged so a future pass resolves it with an editor/the owner — do not silently add a `VNZ` row or flip `VNG.isPrivate` without that verification |
| Yahoo `quoteSummary` shares-outstanding × price × FX market-cap derivation pipeline (the fuller automation research's Lanes B/C/D) | Explicitly NOT adopted (15-07-26, see updated AD-2). Yahoo already returns `marketCap` precomputed on its v7 `quote` endpoint, making a separate shares-outstanding cache + FX-conversion pipeline unnecessary even if `mcap` automation is added in a later pass — building the derivation pipeline anyway would be pure over-engineering |

---

## Known Unknowns EXECUTE Must Verify First

PLAN mode has no live network access. Five external data shapes could not be confirmed against a real payload and MUST be inspected by EXECUTE before the adapter code is considered final (this does not change the DB schema or the skip/lock behavior below — only the field-mapping constants and endpoint-selection logic inside the three adapters):

1. **LLM Stats `top_scores` key names** (amended 2026-07-30, replaces the LMArena parquet unknown — see `references/ai-leaderboard-llmstats-design_REFERENCE_30-07-26.md` §3) — the `top_scores` map is untyped (`additionalProperties: number`); confirm the actual keys at first run. `"reasoning"`/`"coding"` are assumed; the real key could differ (e.g. `"code"`). Log-and-skip the affected field mapping on a mismatch rather than guessing.
2. **LLM Stats score scale, 0-1 vs 0-100** (amended 2026-07-30, replaces the models.dev price-unit unknown) — confirm whether `top_scores.reasoning`/`top_scores.coding` are returned as 0-100 integers or 0-1 fractions; if fractions, `ai-llmstats.ts` must ×100 before writing the `aiModels` `reasoning`/`coding` fields (both 0-100 range).
3. **Yahoo Finance endpoint mix (`stocks-yahoo.ts`, added 15-07-26)** — confirm at build time whether the v7 `quote` endpoint's crumb+cookie session flow is stable enough for a daily cron: does the crumb rotate per-session or per-request, does it survive a 24h gap between cron invocations, and does it fail (401) predictably enough to detect vs. silently returning garbage? **Default assumption:** use the unauthenticated v8 chart endpoint (`query1.finance.yahoo.com/v8/finance/chart/<symbol>`), one HTTP call per symbol, for `regularMarketPrice`/`previousClose`/30-day history — this is the reliable baseline and is what ships if the crumb flow proves unstable. If the crumb+cookie flow is verified stable, EXECUTE MAY additionally use the v7 batch `quote` endpoint to source `marketCap` and a precomputed `%change` for `dataSource: "yahoo"` rows (see updated AD-2) — this is allowed, not required, and must never block shipping if the crumb flow is flaky. Either way, `px`/`chg`/`asOf` remain the minimum guaranteed cron-written fields.
4. **Vietnamese stock-source endpoint shapes (`stocks-vietnam.ts`, added 15-07-26)** — confirm the exact request/response shape for VNDirect's `dchart` UDF-style endpoint (primary, no-auth, must cover both HOSE and UPCoM symbols) and TCBS's public quote endpoint (fallback/cross-check); confirm whether SSI FastConnect (the "license-clean anchor" per AD-14) requires developer registration/an API key or is genuinely no-auth for EOD reads — if it requires signup, treat it as an optional cross-check only, the adapter must still function correctly on VNDirect + TCBS alone. Confirm both HOSE (`FPT`, `CMG`, `CTR`, `MWG`, `VTP`) and UPCoM (`VGI`) symbols resolve correctly on the chosen primary source before wiring the cron.
5. **LLM Stats model id stability** (new, 2026-07-30) — confirm that `sourceSlugLlmstats` (an exact `/v1/models` `id` join key, not fuzzy) remains stable across LLM Stats' periodic model-list refreshes; if an id changes upstream, the affected `aiModels` row simply stops matching (logged and skipped, per the cron's unmatched-id handling) rather than silently writing to the wrong row.

Per AD-5 (amended 2026-07-30), `coding` is now automated by default via LLM Stats — not conditional on a "clean, unambiguous signal" carve-out. `speed` stays manual: the LLM Stats API confirms no throughput/speed field exists in any schema it exposes (see the design reference §1), so there is no fallback mapping to attempt here.

---

## Architecture Decisions (Final)

**AD-1 — Two ticker-domain collections, not one.** `dashboardTickers` (static-ish metadata + latest snapshot) and `dashboardQuoteSnapshots` (one row per ticker per trading day) are separate collections. Rationale: the 30-day chart needs real history; cramming history into the ticker row (e.g. a JSON array field) would fight Payload's query model and make pruning harder. Implication: every cron write touches two collections, not one.

**AD-2 — `funding` (per-ticker "Recent Round") stays 100% editor-maintained; `mcap` stays editor-maintained by default but MAY become cron-writable for `dataSource: "yahoo"` rows if the v7 crumb flow proves stable (updated 15-07-26, see AD-14).** Original rationale (superseded): Marketstack Basic's `/eod` endpoint returned close price only, and Marketstack itself gated market-cap-shaped fields behind a pricier tier, so `mcap = sharesOutstanding × close` would have required a separate shares-outstanding/FX derivation pipeline this plan deliberately avoided building (see the fuller automation research's Lanes B/C/D for what that would have looked like — explicitly NOT adopted here, see Non-Goals). That blocker no longer exists: Yahoo's v7 `quote`/`quoteSummary` endpoint returns `marketCap` precomputed, with no shares-outstanding cache or FX-conversion lane needed. This is a genuine simplification vs. the prior Marketstack design, but it is gated on Known Unknown #3 (the crumb+cookie flow's stability) — if that flow is unreliable, `mcap` simply stays manual, exactly as before, and this is not a blocking condition. VN tickers: `mcap` is NOT automated by the Vietnamese-source adapter in this pass — stays editor-maintained, unless the VN adapter's response incidentally includes a usable market-cap figure, in which case EXECUTE MAY use it non-blockingly under the same allowed-not-required rule. `funding` is unrelated to any price feed and stays manual regardless of source, unchanged from the original AD-2.

**AD-3 — Equal-weighted index, no FX conversion.** The 30-day "ASEAN tech index" is computed by normalizing each ticker's own close series to its own first-available value = 100, then averaging normalized values per day across tickers with data that day. This avoids needing per-currency FX conversion (each series is unitless once normalized), and avoids any real "index" licensing question (this is DTW's own derived statistic, not a republished third-party index).

**AD-4 — `editorLocked` mirrors the Articles `lockedFields` *spirit*, not the full provenance model.** `dashboardTickers` and `aiModels` get an `editorLocked` array (same shape as `Articles.lockedFields`: `{ field: text }[]`). Cron writes skip any field named there. Unlike Articles, these collections do **not** get `origin` / `editedByHuman` / a `version` optimistic-lock counter — there is no concurrent human-vs-machine race here (batch cron runs sequentially, at most daily/weekly), so the lighter mechanism is sufficient and avoids over-engineering.

**AD-5 — LLM Stats writes `maker`, `reasoning`, `coding`, `price`, `ctx`; `speed` stays manual in this pass.** (Amended 2026-07-30 — replaces the LMArena+models.dev split; see `references/ai-leaderboard-llmstats-design_REFERENCE_30-07-26.md`.) See "Known Unknowns" above. `model` (the display name) is never cron-written — editors own it, avoiding cosmetic-name churn on every refresh.

**AD-6 — `fundingRounds` feeds the homepage teaser aggregate only; no new page-level table in this pass.** Per the task's explicit closeout instruction, "funding-rounds table view" is recorded as deferred/abandoned. The collection exists so editors can enter verified deals (draft → published), and a small pure-math helper computes 14-day total / deal count / **median** round (not average — a single megadeal swings SEA totals ±80%+) / top sector for the teaser.

**AD-7 — Seeded `fundingRounds` rows will NOT reproduce the old literals ($8.4B / 127 deals / $66M / "AI infra") exactly.** Those numbers were always placeholders. Fabricating ~127 rows to hit them precisely would mean inventing fake deal data on an editorial-integrity product — the opposite of the point of this plan. Seed ~10 plausible, clearly-varied Asia-tech rounds dated relative to seed-runtime (`now − N days`, not fixed calendar dates, so the "last 14 days" window is never immediately empty) instead.

**AD-8 — Cron routes implement both `GET` and `POST`, not POST-only.** The automation research says "POST" throughout, but Vercel's native Cron Jobs feature invokes the configured path with `GET`, optionally attaching `Authorization: Bearer $CRON_SECRET` if the project's `CRON_SECRET` env var is set. A POST-only route would silently 405 on every real Vercel-triggered cron run. Both methods share one internal handler function; `GET` serves Vercel's automatic trigger, `POST` remains available for manual/ops `curl` testing.

**AD-9 — Two cron entries in `vercel.json`, not three or four.** Which Vercel plan/tier this project deploys on is an open, unresolved question (research risk list) — Hobby historically caps the number of cron jobs. Rather than block on that answer, the two stocks adapters (`stocks-yahoo`, `stocks-vietnam`) are combined into a single `stocks-daily` cron path that calls both in one request (they write disjoint `dashboardTickers` rows — `dataSource: "yahoo"` vs. `dataSource: "vietnam-native"` — so this is safe; added 15-07-26, see AD-14). The AI side needs no such combining after the 2026-07-30 amendment: the former two AI adapters (`ai-lmarena`, `ai-modelsdev`) are replaced by one `ai-llmstats.ts` module (see AD-5), invoked directly via the `ai-weekly` cron path. Final `vercel.json` crons: `stocks-daily` (daily) + `ai-weekly` (weekly) — still exactly two entries. The dynamic route still accepts `stocks-yahoo` / `stocks-vietnam` individually for manual ops testing of each stocks lane; they're just not wired into `vercel.json`.

**AD-10 — Stocks cron ships fully built and ACTIVE from day one (superseded 15-07-26 — see AD-14).** Under the original Marketstack design this cron shipped "inert" pending a paid-tier license-confirmation email. Neither the Yahoo adapter nor the Vietnamese-source adapter requires an API key, a paid tier, or a license confirmation, so that gate is removed entirely — there is no `MARKETSTACK_API_KEY`-style env-var check at the top of the handler anymore. The route instead implements graceful **partial-failure** degradation: if one lane (Yahoo or Vietnam) fails outright (network error, unexpected schema, crumb 401, etc.) while the other succeeds, the route still returns HTTP 200 with a per-lane result summary (e.g. `{ ok: true, lanes: { yahoo: { written: 27, failed: 1 }, vietnam: { written: 6, failed: 0 } } }`) rather than failing the whole invocation — a single flaky symbol or a down upstream source must never block the rest of the day's refresh. A lane that fails writes NOTHING for its affected tickers (no partial/zeroed rows) and the prior day's `dashboardTickers.px`/`asOf` values keep rendering (last-good cache, see AD-14's reliability guardrails) until the next successful run.

**AD-11 — Sortable `<th>` becomes "a real `<button>` inside the `<th>`," not manual `tabIndex`/`onKeyDown`.** A native button gets keyboard (Enter/Space) activation for free and is the simpler, more standard accessible-sortable-header pattern. `aria-sort` stays on the `<th>` itself (the columnheader role element), not the button.

**AD-12 — `--sponsored-border` CSS var fix is scoped to the border color only.** Sweeps all 4 occurrences of the hardcoded `#E0B900` border, but does not also fix `article-content.tsx`'s separately-hardcoded `#FEF3C7`/`#7A5800` background/text (see Non-Goals table) — that is a related but distinct bug outside the approved scope.

**AD-13 — Ticker universe expands to 36 (12 existing + 24 curated core additions, 15-07-26); `dataSource` is the authoritative per-row cron-eligibility gate (vendor mapping updated 15-07-26, see AD-14).** Research (`process/features/dashboards/references/dtw-ticker-universe_REFERENCE_15-07-26.md`) verified 24 additional Asia-tech symbols and confirmed a critical coverage gap that persists regardless of stock-price vendor: no single non-Vietnamese feed reliably covers Vietnam's HOSE exchange (`.VN` symbols) or UPCoM — this was true of Marketstack Basic and remains true of Yahoo Finance (UPCoM symbols 404; a naive `.VN`-style symbol guess for VN names can silently collide with an unrelated company). Pre-expansion, only `isPrivate` existed on `dashboardTickers` — correct for excluding VNG/Ola Krutrim entirely, but silent on *why* a public, non-private ticker might still be un-refreshable by a given stocks adapter. The `dataSource` field makes that explicit per row and is now (15-07-26) a 3-value enum — `yahoo` | `vietnam-native` | `manual-private` — after AD-14 merged the former 4-value `marketstack` / `yahoo-vn` / `vietnam-native` / `manual-private` set down by (a) renaming `marketstack` → `yahoo` and (b) folding `yahoo-vn` into `vietnam-native`, since those 5 rows were never actually going to be sourced from Yahoo. The combined `stocks-daily` cron (Group G) queries+writes `dataSource: "yahoo"` rows via the Yahoo adapter and `dataSource: "vietnam-native"` rows via the dedicated Vietnamese-source adapter — both lanes are active. The 5 Vietnam HOSE rows (FPT.VN, CMG.VN, CTR.VN, MWG.VN, VTP.VN) and Viettel Global (VGI, UPCoM) are all tagged `vietnam-native` and are all now automatically refreshed (no longer editor-maintained-only — this supersedes the prior Non-Goals entry deferring this adapter). VinFast (VFS, NASDAQ) is the one Vietnam-origin addition Yahoo *does* cover cleanly, so it's tagged `yahoo` like the rest of the HK/TW/T/KS/NASDAQ/NYSE additions. `manual-private` (VNG, Ola Krutrim) is unchanged by this update — see the Non-Goals note on VNG's possibly-stale classification, and AD-14's note on the "7th ticker" question.

**AD-14 — Owner override (15-07-26): Yahoo Finance replaces Marketstack as the stock-price source for ALL non-VN tickers; a dedicated Vietnamese-source adapter is added for all 6 public VN tickers; the ToS/legal risk is explicitly accepted by the owner and deferred ("pháp lý tính sau" — legal to be handled later).** This is a deliberate product/business decision made by the DTW owner outside PLAN mode's normal license-clean-by-default posture (contrast AD-2's original Marketstack rationale and the 14-07-26 research's "pay the $9.99 — Marketstack remains the only sub-$50/mo option delivering the full custom table legally" verdict, which this decision explicitly overrides). Record, do not silently revert:
- **Scope**: Yahoo Finance (unofficial, no-auth v8 chart endpoint primary; v7 quote endpoint optionally, if stable — see Known Unknown #3) becomes the source for all `dataSource: "yahoo"` rows (the ~28 non-VN tickers, formerly `dataSource: "marketstack"`). `MARKETSTACK_API_KEY` is removed entirely — no replacement API key is needed for Yahoo.
- **VN tickers stay off Yahoo, for a different reason than ToS**: Yahoo does not reliably cover Vietnam (UPCoM symbols 404; guessed `.VN`-style symbols for names like VNG collide with unrelated companies). All 6 public VN-origin tickers (5 HOSE + VGI on UPCoM) route through a new, separate Vietnamese-source adapter (VNDirect `dchart` primary, no-auth → TCBS fallback, free → SSI FastConnect as a license-clean cross-check anchor, per the 15-07-26 full-automation research's Lane A). This adapter was NOT previously planned in this document (the pre-this-update Non-Goals table explicitly deferred it) — it is a genuinely new build enabled by this decision, not merely a relabeling.
- **Note on ticker count**: the owner-decision source text (`dtw-full-automation_REFERENCE_15-07-26.md`, DECISION block) refers to "Vietnam's 7 tickers," implying a 7th, UPCoM/Nasdaq-listed VNG ticker (referred to there as "VNZ") should also be live-tracked alongside the 6 this plan already covers. This plan does NOT add a 7th row or reclassify `VNG` in this pass — see the Non-Goals flag. Treat this as a known, named scope gap versus the owner's decision text, not a silent omission; resolve it with the owner/an editor (real exchange/sector/ticker verification needed) before acting on it.
- **Consequence — stocks cron ships active, not gated**: since neither adapter requires a paid tier or a license-confirmation email, AD-10 is superseded — the stocks cron ships live from day one (see updated AD-10). The Ops Checklist's Marketstack-license-email row is removed.
- **Consequence — market cap simplification**: Yahoo's v7 `quote`/`quoteSummary` response includes `marketCap` precomputed, so if mcap automation is ever added for `yahoo` rows, no shares-outstanding-cache lane or FX-conversion lane is needed (unlike the fuller automation research's Lane B/C/D design, which is explicitly NOT adopted here, see Non-Goals) — see updated AD-2.
- **Accepted risks, owned by the user, not resolved by this plan**: (1) Yahoo's terms of service bar automated/programmatic access and public redistribution of its data for a commercial site — the owner has explicitly accepted this risk and deferred the legal resolution to a later date, before or at public launch; this plan does not seek Yahoo's permission, does not add a compliance gate, and must not be "fixed" back to a paid/licensed feed without the owner's involvement. (2) Both Yahoo and the Vietnamese sources are unofficial/undocumented endpoints with no SLA — see the reliability guardrails below and the Risks table.
- **Reliability guardrails (both adapters, mandatory, not optional)**: (a) last-good cache — a failed fetch for a ticker leaves its existing `dashboardTickers.px`/`chg`/`asOf` untouched (never writes null/zero/partial data; the UI's existing staleness badge, `isStaleTradingDay`, already surfaces when this happens); (b) retry with jitter — one retry per symbol/batch on transient failure (network error, 5xx, timeout) with a randomized short backoff, not a tight loop; (c) a staleness/sanity guard on the response itself — reject a "successful" fetch whose returned trading day is not the most recent expected trading day, or whose price is null/zero/non-numeric (HTTP 200 with garbage is a known failure mode of unofficial endpoints, not hypothetical); (d) datacenter-IP rate limiting — Yahoo and, to a lesser extent, the Vietnamese sources may rate-limit or block requests originating from Vercel's shared IP ranges; at this plan's volume (once daily, ~28 Yahoo symbols + 6 VN symbols) this is assessed as **low risk**, but EXECUTE must leave a code-comment seam noting where a residential/allowlisted proxy would be inserted if rate-limiting is observed in practice — do not pre-build proxy infrastructure speculatively, just leave the seam.
- **What this does NOT change**: the `editorLocked` human-wins skip logic (AD-4), the two-cron-entry minimization (AD-9, extended not broken), the equal-weighted index math (AD-3), the `funding` field staying manual (AD-2), or any AI-leaderboard/funding-rounds decision (explicitly out of scope for this override).

---

## Data Flow

### Read path (every page render)

```
Reader requests /dashboards/{funding|ai}
  -> page.tsx (server component)
       -> lib/payload-server.ts cached helpers (unstable_cache, tags: dashboards:funding | dashboards:ai | dashboards:funding-rounds | dashboards:methodology | sponsor-slots:all)
            -> Payload Local API (getPayload().find / findGlobal)
                 -> Postgres
            -> on error: fail-open to lib/data.ts static fallbacks (FUNDING_ROWS / AI_LEADERBOARD / FALLBACK_CHART_SERIES) or a safe empty summary
       -> lib/dashboards/derive.ts (pure math: equal-weight index, top movers, funding summary, staleness)
  -> DashboardsShell (client) renders header/tabs/methodology/sponsor
  -> FundingTracker | AILeaderboard (client) renders the table from props (no more static imports)
```

### Write path (cron)

```
Vercel Cron (GET, Authorization: Bearer $CRON_SECRET) -- or ops curl (POST, manual bearer)
  -> /api/dashboards/refresh/[source]/route.ts
       -> bearerMatches() constant-time check against DTW_DASHBOARD_REFRESH_TOKEN
       -> lib/dashboards/{stocks-yahoo.ts | stocks-vietnam.ts | ai-llmstats.ts} (thin fetch+normalize adapters)
       -> route handler resolves each result to an existing dashboardTickers/aiModels doc (never creates new rows), skips fields named in that doc's editorLocked[]
       -> payload.create / payload.update via Local API (NEVER direct Postgres -- invariant #1 in spirit)
       -> the collection's own afterChange hook fires revalidateTag() automatically (no manual revalidateTag call in the route)
       -> (stocks only) prune dashboardQuoteSnapshots older than ~120 days
  -> next page read picks up fresh data via the busted cache tag
```

### Editorial write path (unchanged shape, new collections)

```
Editor in /admin edits a dashboardTickers / aiModels / fundingRounds row or the dashboardMethodology global
  -> Payload afterChange hook -> revalidateTag(...) -> next read reflects the change within the cache window, or instantly via the tag bust
```

---

## Invariants This Plan Must Preserve

1. **Engine never writes dashboard data.** No `dtw-engine` code path touches any of the 4 new collections; the integrations contract explicitly denies the Engine role access to dashboard data. Cron writes go through Payload Local API only, exactly like every other write path in this repo — never direct Postgres.
2. **Human always wins.** `editorLocked` on `dashboardTickers`/`aiModels` is checked before every cron field write; a locked field is skipped, never overwritten.
3. **No hardcoded rgba/hex colors.** The `--sponsored-border` fix and every new UI element use `var(--...)` tokens, never inline hex (matches the dark-mode-adaptation rule already documented in `uxui/all-uxui.md`).
4. **Chrome-only i18n; article/editorial body stays in source language.** All new/changed UI strings (captions, badges, teaser copy, CSV header labels, methodology text) go through the existing `t(en, vi, id)` pattern or a CMS localized `{en, vi, id}` group — never a new hardcoded English-only string.
5. **CMS-configurable, not hardcoded.** Methodology copy, sponsor slot, ticker/AI-model data, and funding rounds are all editor-editable in `/admin` without a deploy, per invariant #8's "adding data is a CMS write" spirit.
6. **No popups, no mid-article ads.** Nothing in this plan introduces either (dashboards has no articles inline).
7. **Disclosure/sponsorship framing preserved.** The dashboard sponsor card keeps "Sponsorship does not influence the data or methodology," sourced from a real `SponsorSlots` relationship, never a placeholder.
8. **`revalidateTag` is the only invalidation path.** Every new collection/global gets its own `afterChange`/`afterDelete` hook following the exact existing `bust()` / `revalidationDisabled()` pattern in `apps/web/src/payload/hooks/revalidate.ts` — no ad hoc cache-busting elsewhere.

---

## Schema Reference

### Collection: `dashboardTickers`

| Field | Type | Required | Cron-writable? | Notes |
|---|---|---|---|---|
| `ticker` | text | yes, unique | no | Exchange symbol, e.g. `9988.HK` |
| `name` | text | yes | no | Editor-owned |
| `country` | text | yes | no | 2-letter code, free text (matches existing chip-derivation logic) |
| `sector` | text | yes | no | Free text |
| `exchange` | text | no | no | Informational, e.g. `HKEX` |
| `isPrivate` | checkbox | no (default false) | no | True for VNG/Ola Krutrim-style rows; cron excludes these tickers entirely. Always paired with `dataSource: "manual-private"` (see below) |
| `dataSource` | select | yes, default `manual-private` | no — editor-set config; the cron reads it, never writes it | Enum `yahoo` \| `vietnam-native` \| `manual-private` (added 15-07-26, vendor names updated 15-07-26 per AD-14 — was `marketstack` \| `yahoo-vn` \| `vietnam-native` \| `manual-private`). Gates which adapter, if any, may write `px`/`chg`/`asOf` on this row — see AD-13/AD-14. The combined `stocks-daily` cron queries+writes `yahoo` rows via the Yahoo adapter and `vietnam-native` rows via the Vietnamese-source adapter; `manual-private` rows are never touched |
| `px` | number | no | **yes** (when `dataSource` is `"yahoo"` or `"vietnam-native"`) | Latest close |
| `chg` | number | no | **yes** (when `dataSource` is `"yahoo"` or `"vietnam-native"`) | Day change %, vs. most recent prior `dashboardQuoteSnapshots` close |
| `mcap` | text | no | conditional — see updated AD-2 | Editor-entered display string, e.g. `$201B`; MAY become cron-writable for `yahoo` rows only if the Yahoo v7 crumb flow proves stable (Known Unknown #3) — allowed, not required |
| `funding` | text | no | no | Editor-entered "Recent Round" display string, e.g. `$150M (D)` |
| `asOf` | date | no | **yes** (when `dataSource` is `"yahoo"` or `"vietnam-native"`) | Timestamp of latest px/chg refresh |
| `editorLocked` | array `{ field: text }` | no | n/a | Skip-list; mirrors `Articles.lockedFields` shape exactly |

Admin: `useAsTitle: "ticker"`, `defaultColumns: ["ticker","name","country","px","chg","asOf"]`.
Access: `read: () => true`; `create`/`update`: `editor`|`admin`; `delete`: `admin`.
Hooks: `afterChange`/`afterDelete` → tag `dashboards:funding`.

### Collection: `dashboardQuoteSnapshots`

| Field | Type | Required | Notes |
|---|---|---|---|
| `ticker` | relationship → `dashboardTickers` | yes | Join key |
| `date` | date | yes | Day precision (trading day) |
| `close` | number | yes | |
| `currency` | text | yes | Recorded for completeness; the index calc (AD-3) does NOT need FX conversion |

Admin: `defaultColumns: ["ticker","date","close"]`.
Access: same pattern as `dashboardTickers`.
Hooks: tag `dashboards:funding` (shared with tickers).
Write pattern: idempotent upsert — find where `ticker` = X and `date` = Y, update if found else create (mirrors the existing `upsert()` helper style in `seed-payload.ts`; no DB-level composite unique constraint needed).
Retention: prune rows with `date` older than ~120 days once per successful stocks-cron run.

### Collection: `aiModels`

| Field | Type | Required | Cron-writable? | Source |
|---|---|---|---|---|
| `rank` | number | no | no | Editorial override sort key (AD-4/AD-5 note: NOT the displayed `#`, which stays post-sort position per existing behavior) |
| `model` | text | yes | no | Editor-owned display name |
| `maker` | text | yes | **yes** | LLM Stats `/v1/models` list, `organization.name` (amended 2026-07-30) |
| `reasoning` | number (0-100) | yes | **yes** | LLM Stats `top_scores.reasoning`, normalized (×100 if the API returns a 0-1 fraction — verify at first run, see Known Unknowns) |
| `coding` | number (0-100) | yes | **yes** | LLM Stats `top_scores.coding`, normalized — newly automated (2026-07-30 amendment; was manual) |
| `speed` | number (0-100) | yes | no | Manual in this pass — no throughput/speed field exists in any LLM Stats schema (verified, per the design reference) |
| `price` | number | yes | **yes** | LLM Stats — minimum non-null `providers[].input_price_per_m` across that model's providers, normalized to USD/M tokens; `0` = free |
| `ctx` | text | yes | **yes** | LLM Stats `context_window`, formatted `"512k"`/`"1M"` style |
| `sourceSlugLlmstats` | text | no | no | CMS-editable exact join key — LLM Stats `/v1/models` `id` (amended 2026-07-30, replaces `sourceSlugLmarena`+`sourceSlugModelsdev`; exact match, not fuzzy) |
| `asOfScores` | date | no | **yes** | Fetch timestamp (amended 2026-07-30, replaces `asOfArena`+`asOfPricing`) |
| `editorLocked` | array `{ field: text }` | no | n/a | |

Admin: `useAsTitle: "model"`, `defaultColumns: ["model","maker","reasoning","price","asOfScores"]`.
Access/Hooks: same pattern, tag `dashboards:ai`.
Cron never creates new `aiModels` rows — only refreshes existing ones matched by `sourceSlug*`; unmatched upstream entries are logged and skipped.

### Collection: `fundingRounds`

| Field | Type | Required | Notes |
|---|---|---|---|
| `announcedDate` | date | yes | |
| `company` | text | yes | |
| `amountUsd` | number (min 0) | yes | Editor normalizes to USD at entry time |
| `round` | select | yes | Options: Pre-seed, Seed, Series A, Series B, Series C, Series D+, Growth, Debt, Other |
| `sector` | text | yes | Free text, matches ticker sector convention |
| `country` | text | yes | |
| `investors` | text | no | Comma-separated free text |
| `sourceUrl` | text | yes | Verification link (Tracxn / press release) |
| `status` | select (`draft`\|`published`) | yes, default `draft` | Aggregates only count `published` |

Admin: `useAsTitle: "company"`, `defaultColumns: ["company","amountUsd","round","announcedDate","status"]`.
Access: `read: () => true` (the read helper itself filters `status: published`, mirroring how `Article._status` is filtered elsewhere); `create`/`update`: `editor`|`admin`; `delete`: `admin`.
Hooks: tag `dashboards:funding-rounds`.
No `editorLocked` — nothing automated ever writes here.

### Global: `dashboardMethodology`

| Field | Type | Notes |
|---|---|---|
| `fundingMethodology` | group `{ en: textarea required, vi: textarea, id: textarea }` | Lifted verbatim from current `page.tsx` funding-tab copy at seed time |
| `aiMethodology` | group `{ en: textarea required, vi: textarea, id: textarea }` | Amended 2026-07-30: rewritten to reflect the LLM Stats swap, NOT lifted verbatim from the pre-swap (LMArena/models.dev) AI-tab copy — seed content: scores are normalized per-category benchmark scores compiled by LLM Stats (source-verified where marked); rankings method TrueSkill; keep "For informational purposes only"; drop "Arena score" vocabulary |
| `disclaimer` | group `{ en: text required, vi: text, id: text }` | Shared across both tabs (matches current single-disclaimer behavior) |

Access: `read: () => true`; `update`: `editor`|`admin` (mirrors `PaywallSettings` exactly — no `create`/`delete`, it's a Global).
Hooks: `afterChange` → tag `dashboards:methodology`.

### Seeded ticker universe (36 total) — `dashboardTickers`

Full symbol list, sourced verbatim from `process/features/dashboards/references/dtw-ticker-universe_REFERENCE_15-07-26.md` (use its exact symbols; do not re-derive). Group B's seed step (checklist item 19) implements this table.

**Vendor retag (15-07-26, AD-14):** every row below tagged `marketstack` in the original plan is now tagged `yahoo`; every row tagged `yahoo-vn` is now tagged `vietnam-native` (merged — these rows were never going to be sourced from Yahoo). The tables below already reflect the final `dataSource` values.

**Existing 12** (unchanged from the original plan except the symbol-trap fixes noted):

| Ticker | Name | Country | Sector | `dataSource` | Note |
|---|---|---|---|---|---|
| `9988.HK` | Alibaba | CN | Cloud/AI | `yahoo` | |
| `005930.KS` | Samsung Elec. | KR | Semis | `yahoo` | |
| `2330.TW` | TSMC | TW | Foundry | `yahoo` | |
| `3690.HK` | Meituan | CN | Consumer | `yahoo` | |
| `GOTO.JK` | GoTo Group | ID | Super-app | `yahoo` | |
| `GRAB` | Grab Holdings | SG | Super-app | `yahoo` | |
| `SE` | Sea Limited | SG | E-commerce | `yahoo` | |
| `VNG` | VNG (private) | VN | Internet | `manual-private` | `isPrivate: true`; unchanged 15-07-26 — see Non-Goals flag on possibly-stale classification and AD-14's note on the "7th ticker" question |
| `377300.KS` | Kakao Pay | KR | Fintech | `yahoo` | remapped from fictional `KKDY` (pre-existing plan fix) |
| `BUKA.JK` | Bukalapak | ID | E-commerce | `yahoo` | remapped from fictional `BKKM` (pre-existing plan fix) |
| `PAYTM.NS` | Paytm | IN | Fintech | `yahoo` | **fixed 15-07-26**: was `PYTM.NS` (dead/incorrect symbol) |
| Ola Krutrim | Ola Krutrim | IN | AI | `manual-private` | `isPrivate: true`; `ticker` stays a display label, not a real exchange symbol (pre-existing convention) |

**24 curated core additions (15-07-26)** — all `isPrivate: false`, `funding: "–"` (publicly listed, not a private round):

| Ticker | Name | Country | Sector | Exchange | `dataSource` |
|---|---|---|---|---|---|
| `FPT.VN` | FPT Corporation | VN | IT / software / AI | HOSE | `vietnam-native` |
| `CMG.VN` | CMC Corporation | VN | IT services / cloud | HOSE | `vietnam-native` |
| `CTR.VN` | Viettel Construction | VN | 5G / towerco | HOSE | `vietnam-native` |
| `MWG.VN` | Mobile World (TGDĐ) | VN | Electronics retail / e-com | HOSE | `vietnam-native` |
| `VTP.VN` | Viettel Post | VN | Logistics tech | HOSE | `vietnam-native` |
| `VGI` | Viettel Global | VN | Telecom / internet infra | UPCoM | `vietnam-native` |
| `VFS` | VinFast Auto | VN | EV / smart mobility | NASDAQ | `yahoo` |
| `DELTA.BK` | Delta Electronics (Thailand) | TH | Power electronics | SET | `yahoo` |
| `000660.KS` | SK hynix | KR | Semis (HBM memory) | KRX | `yahoo` |
| `2454.TW` | MediaTek | TW | Semis (fabless) | TWSE | `yahoo` |
| `2317.TW` | Hon Hai / Foxconn | TW | AI infra (EMS) | TWSE | `yahoo` |
| `3711.TW` | ASE Technology | TW | Semis (OSAT/packaging) | TWSE | `yahoo` |
| `0981.HK` | SMIC | CN | Semis (foundry) | HKEX | `yahoo` |
| `8035.T` | Tokyo Electron | JP | Semis (WFE equipment) | TSE | `yahoo` |
| `6857.T` | Advantest | JP | Semis (test) | TSE | `yahoo` |
| `0700.HK` | Tencent | CN | Internet / super-app | HKEX | `yahoo` |
| `9888.HK` | Baidu | CN | Cloud / AI | HKEX | `yahoo` |
| `1810.HK` | Xiaomi | CN | Consumer electronics / IoT / EV | HKEX | `yahoo` |
| `0020.HK` | SenseTime | CN | AI (vision / foundation) | HKEX | `yahoo` |
| `1024.HK` | Kuaishou | CN | Internet (short video) | HKEX | `yahoo` |
| `PDD` | PDD Holdings | CN | E-commerce | NASDAQ | `yahoo` |
| `9984.T` | SoftBank Group | JP | AI infra / tech holding | TSE | `yahoo` |
| `035420.KS` | NAVER | KR | Internet | KRX | `yahoo` |
| `CPNG` | Coupang | KR | E-commerce | NYSE | `yahoo` |

**Symbol-trap guards** (EXECUTE must apply exactly, per the reference doc):
- SoftBank is the **Group**, `9984.T` (the AI/Arm/Vision-Fund thesis) — NOT `9434.T` (SoftBank Corp, the telecom subsidiary).
- SMIC is `0981.HK` (leading zero preserved) — do not conflate with the STAR-line instrument `688981.SS` (a different security, not seeded).
- All HKEX symbols above keep their leading zero exactly as written (`0700.HK`, `0981.HK`, `0020.HK`, `1024.HK`).
- Viettel Global is `VGI` on UPCoM (`dataSource: "vietnam-native"`) — the Yahoo-style `VGI.VN` symbol 404s; do not use it.
- Paytm is `PAYTM.NS` — NOT `PYTM.NS` (fixes an existing-12 error, see table above).
- Vietnam tickers never route through the Yahoo adapter, regardless of symbol guess (added 15-07-26): Yahoo does not reliably cover UPCoM (404s) and its `.VN`-style symbol guesses can silently collide with an unrelated company (see AD-14) — all 6 public VN-origin rows (`FPT.VN`, `CMG.VN`, `CTR.VN`, `MWG.VN`, `VTP.VN`, `VGI`) are `dataSource: "vietnam-native"` and are refreshed only by `stocks-vietnam.ts`.
- A `VNZ`-style symbol guess for VNG is a known trap (per the full-automation research: "VNZ.VN is a different company") — do not use it, and do not add a `VNZ` row without resolving the flagged Non-Goals question on VNG's classification first.

**Placeholder `px`/`chg`/`mcap` values for the 24 new rows** (page stays "Preview · sample data" until a real feed is enabled — plausible placeholders are expected, do NOT fabricate precise real-world quotes): `chg` as a single-decimal value roughly in the ±0.3%–3.5% range; `px` in a currency-appropriate nominal scale matching how the existing 12 already format each exchange (e.g. large near-whole numbers for `.KS`/`.T`/`.TW`-style listings, 1–2 decimal USD-style numbers for NASDAQ/NYSE/`.HK`-style listings); `mcap` as a rounded `"$X[.X]B"` string sized to each company's real-world scale tier (roughly mega-cap for Tencent/SoftBank-scale names, down through mid-cap for names like SMIC/NAVER/VinFast, down to sub-$1B for the 5 VN HOSE names + VGI) — order-of-magnitude plausibility is what matters, not precision.

**Future expansion — NOT seeded in this pass** (recorded so it's discoverable later without re-research; see the reference doc's "Fuller pick-list by market" and "Notable Asia-tech PRIVATE unicorns" sections for full detail):
- *Listed bench/opt tickers*: Vietnam — FRT.VN, DGW.VN, SGT.VN, ELC.VN, ITD.VN, PET.VN; India — ETERNAL.NS (Zomato); China/HK — Horizon Robotics 9660.HK, Kingsoft Cloud 3896.HK (not 3888.HK parent), JD 9618.HK, NetEase 9999.HK, BYD Electronic 0285.HK; Korea — Kakao 035720.KS (≠ Kakao Pay 377300.KS), Krafton 259960.KS, Samsung SDI 006400.KS (≠ Samsung Elec 005930.KS), LG Energy 373220.KS; Taiwan — UMC 2303.TW, Realtek 2379.TW; Japan — Renesas 6723.T, Sony 6758.T, Rakuten 4755.T, Keyence 6861.T, Mercari 4385.T, SBI 8473.T, freee 4478.T, Sansan 4443.T.
- *Private-unicorn manual-entry candidates* (valuation/funding only, no live price, `dataSource: "manual-private"` if ever added): Vietnam — VNLife/VNPAY, MoMo, Sky Mavis, Tiki; Indonesia — Xendit, Kredivo/FinAccel, Akulaku; Singapore — Carousell, Carro, Ninja Van, Advance Intelligence/Atome, Bolttech; India — Razorpay, PhonePe, Zepto, Meesho/CRED/Dream11.
- *Named gap*: no new *listed* Indonesia/Singapore/Malaysia/Philippines tech candidates surfaced in the 15-07-26 research pass beyond the existing GoTo/Bukalapak — close via the private-unicorn cards above or a dedicated follow-up SEA-listings scout.

---

## Execution Brief

### Group A — Shared plumbing
**What happens:** Extract the bearer-check helper, add the CSV-escaping helper, add the `--sponsored-border` token and sweep its 4 hardcoded occurrences.
**Test:** `pnpm typecheck` clean; visually diff the sponsor card / disclosure box border in light + dark mode — unchanged in light, visibly gold (not invisible) in dark.
**Verify:** grep for `#E0B900` in `apps/web/src` returns zero hits.
**Done when:** no behavior change in light mode, dark-mode border visible, `bearerMatches` has exactly one definition.

### Group B — Payload schema (collections, global, hooks, migration, seed)
**What happens:** Add 5 new revalidate hooks, 4 collections, 1 global, register them, generate types, create+apply the migration, extend the seed script.
**Test:** `pnpm --filter web payload:generate-types` succeeds; `pnpm --filter web payload:migrate` applies cleanly against local dev Postgres; `pnpm --filter web db:seed` logs non-zero counts for all 4 new collections + the global.
**Verify:** open `/admin`, confirm all 4 collections + the global appear with seeded rows/values matching the design in this plan.
**Done when:** a fresh `pnpm db:seed` run is idempotent (running it twice produces the same row counts, not duplicates) — except `fundingRounds`, which intentionally clears+reseeds every run (AD-7).

### Group C — Read helpers + pure math
**What happens:** Add `lib/dashboards/derive.ts` (equal-weight index, top movers, funding summary, staleness) and the new cached helpers in `lib/payload-server.ts`.
**Test:** a scratch script or `/admin`-adjacent manual call confirms each helper returns the expected shape and falls back correctly when a collection is queried with a bad/empty filter.
**Verify:** temporarily rename `DATABASE_URL` to something unreachable, confirm each new helper logs a warning and returns its static fallback instead of throwing (mirrors `getPinnedLatest`'s existing pattern) — then restore.
**Done when:** every new helper has an explicit try/catch fallback, none can crash a page render.

### Group D — Route restructure
**What happens:** Convert `page.tsx` to an async server component with `generateMetadata`, `notFound()` for invalid sub-paths, add `loading.tsx` + `error.tsx`.
**Test:** visit `/dashboards`, `/dashboards/funding`, `/dashboards/ai` (all 200), `/dashboards/bogus` and `/dashboards/funding/extra` (both 404, using the existing global not-found page).
**Verify:** view page source / devtools `<title>` differs per tab.
**Done when:** all 4 URL cases behave as specified above, loading skeleton visibly appears on a throttled network, and a forced error (e.g. temporarily throw inside a helper) renders `error.tsx` with working "Try again."

### Group E — Component refactors (shell, tables, chart, a11y, i18n, honesty labels, CSV)
**What happens:** New `DashboardsShell` + shared `Th`; `FundingTracker`/`AILeaderboard`/`BigChart` become prop-driven; full a11y pass; CSV quoting fix + i18n; honesty captions + stale badge + attribution line.
**Test:** keyboard-only pass — Tab to a sort button, press Enter, row order changes and `aria-sort` updates; screen-reader spot check (or axe DevTools browser extension, manual) on the Bar gauges and BigChart `aria-label`.
**Verify:** download CSV, open in a text editor, confirm header row is present and any comma-containing value is quoted.
**Done when:** zero `aria-*` gaps remain from the completion research's gap #8, both tabs show real "Data as of / Scores via LLM Stats, as of" captions instead of "sample data."

### Group F — Homepage teaser refactor
**What happens:** Homepage `page.tsx` fetches AI + funding-rounds summary data server-side; `DashboardsTeaser` becomes prop-driven, drops its `AI_LEADERBOARD` import and inline literals, relabels "Avg. round" → "Median round."
**Test:** load `/`, confirm the two teaser cards show numbers derived from seeded data (not the old $8.4B/127/$66M/"AI infra" literals).
**Verify:** change a seeded `fundingRounds` row's `amountUsd` in `/admin`, confirm the teaser reflects it within the cache window / after a `revalidateTag`.
**Done when:** no component in the homepage or dashboards feature imports `AI_LEADERBOARD`/`FUNDING_ROWS` directly anymore except the fallback path inside `lib/payload-server.ts`.

### Group G — Cron automation
**What happens:** 3 thin adapters (`stocks-yahoo.ts`, `stocks-vietnam.ts`, `ai-llmstats.ts` — the latter replaces `ai-lmarena.ts`+`ai-modelsdev.ts` per the 2026-07-30 amendment), 1 dynamic route handler (`GET`+`POST`), 2 `vercel.json` cron entries (`stocks-daily`, `ai-weekly`), 2 env vars (`DTW_DASHBOARD_REFRESH_TOKEN` + `LLMSTATS_API_KEY` — still no stock-vendor API key needed, per AD-14).
**Test:** `curl -X POST` each route path locally with a correct and an incorrect bearer token (expect 200-ish success and 401 respectively); confirm `stocks-daily` runs both the Yahoo and Vietnamese lanes and returns a per-lane result summary even if one lane fails (partial-failure degradation, see updated AD-10) — this replaces the old license-gate skip test, since there is no more license gate.
**Verify:** after a manual `stocks-daily` invocation, check `dashboardQuoteSnapshots` gained new rows for both `yahoo` and `vietnam-native` tickers and `dashboardTickers.asOf` advanced on both; check a locked field on a test row (either lane) was NOT overwritten; check that a deliberately-broken fetch for one lane (e.g. temporarily point it at a bad URL) does not zero out or blank existing `px`/`chg` values on that lane's rows (last-good cache guardrail).
**Done when:** both `stocks-daily` and `ai-weekly` are wired into `vercel.json`, both stocks lanes are demonstrably active (not gated on any key), the last-good-cache/retry/staleness guardrails are implemented per AD-14, and a locked-field test proves human-wins holds on both lanes.

### Group H — Testing bootstrap
**What happens:** First Playwright dependency/config/spec/turbo-task/CI-job in the repo.
**Test:** `pnpm --filter web test:e2e` green locally; the new CI job green on a PR.
**Verify:** CI logs show Postgres service container up, migrations applied, seed run, Playwright browsers installed, spec passed.
**Done when:** the CI job is green end-to-end at least once, not just "config exists."

### Group I — Closeout docs
**What happens:** Update `process/features/dashboards/_GUIDE.md` (status, real paths, note deferred items) and fix `process/context/tests/all-tests.md:112`'s stale "No CI pipeline" claim.
**Test:** re-read both files, confirm they no longer contradict the current repo state.
**Done when:** grep for "not-started" in the dashboards `_GUIDE.md` returns nothing.

### Expected Outcome
- `/dashboards/funding` and `/dashboards/ai` are server-rendered, CMS-backed, honestly-labeled, keyboard-accessible, i18n-complete, and CSV-safe.
- The homepage teaser reflects the same data, no hardcoded literals.
- AI leaderboard scores refresh weekly automatically; stock prices (Yahoo Finance for ~28 non-VN tickers, a dedicated Vietnamese-source adapter for the 6 VN tickers) refresh daily automatically from day one — no license gate (AD-14).
- Funding rounds are a clean manual-entry surface feeding the teaser's aggregate stats.
- The repo has its first working Playwright suite and CI e2e job.
- `SponsorSlots` has its first real consumer; the shared hardcoded gold border is gone.

---

## Implementation Checklist

Ordered for dependency correctness. Each item is independently verifiable.

**A — Shared plumbing**
1. Create `apps/web/src/lib/bearer-auth.ts` exporting a `bearerMatches(header, expected)` constant-time check — move the existing logic verbatim out of `apps/web/src/app/api/engine/intake/route.ts`.
2. Update `apps/web/src/app/api/engine/intake/route.ts` to import `bearerMatches` from the new shared module instead of defining it locally; remove the now-unused local `timingSafeEqual` import if no longer needed there.
3. Create `apps/web/src/lib/csv.ts` exporting a `toCsvField(value)` helper implementing RFC4180-style quoting/escaping exactly per the algorithm in this plan (empty for null/undefined; wrap+double-quote when the value contains a comma, quote, or newline).
4. In `apps/web/src/app/globals.css`: add `--sponsored-border: #E0B900;` to `:root` (right after `--sponsored`), add `--sponsored-border: #D9A62E;` to the `html[data-theme="dark"]` block, and add `--color-sponsored-border: var(--sponsored-border);` to the `@theme inline` mapping.
5. Replace the hardcoded `border: "1px solid #E0B900"` with `border: "1px solid var(--sponsored-border)"` in: `apps/web/src/components/home/sponsored-strip.tsx`, `apps/web/src/components/article/article-content.tsx`, `packages/ui/src/disclosure-box.tsx` (do NOT touch the badge's other hardcoded background/text colors in `article-content.tsx` — out of scope, see Non-Goals).
6. `grep -rn "#E0B900" apps/web/src packages/ui/src` — must return zero hits (the 4th occurrence, in `page.tsx`, is removed as part of Group E's shell rewrite, not here).

**B — Payload schema**
7. In `apps/web/src/payload/hooks/revalidate.ts`, add: `revalidateDashboardTicker`/`revalidateDashboardTickerDelete` (tag `dashboards:funding`), `revalidateDashboardQuoteSnapshot`/delete variant (tag `dashboards:funding`), `revalidateAiModel`/delete variant (tag `dashboards:ai`), `revalidateFundingRound`/delete variant (tag `dashboards:funding-rounds`), `revalidateSponsorSlot`/delete variant (tag `sponsor-slots:all`), `revalidateDashboardMethodology` (Global hook, tag `dashboards:methodology`) — all using the existing `bust()`/`revalidationDisabled()` helpers, no changes to those.
8. Create `apps/web/src/payload/collections/DashboardTickers.ts` per the Schema Reference table above, importing the two new hooks.
9. Create `apps/web/src/payload/collections/DashboardQuoteSnapshots.ts` per the Schema Reference table.
10. Create `apps/web/src/payload/collections/AiModels.ts` per the Schema Reference table.
11. Create `apps/web/src/payload/collections/FundingRounds.ts` per the Schema Reference table.
12. Create `apps/web/src/payload/globals/DashboardMethodology.ts` per the Schema Reference table, wiring `revalidateDashboardMethodology`.
13. Also add a new `apps/web/src/payload/collections/SponsorSlots.ts` hook wiring: `hooks: { afterChange: [revalidateSponsorSlot], afterDelete: [revalidateSponsorSlotDelete] }` (this collection currently has none).
14. Register the 4 new collections + 1 global in `apps/web/payload.config.ts` (`collections` array after `Newsletters`; `globals` array alongside `PaywallSettings`).
15. Run `pnpm --filter web payload:generate-types` — confirms the new fields compile into `payload-types.ts`.
16. Run `pnpm --filter web payload:migrate:create` (name it something like `dashboards_data`) against a reachable local dev Postgres — produces the new migration `.ts`/`.json` pair.
17. Add the new migration's entry to `apps/web/src/payload/migrations/index.ts` (Payload's CLI usually does this automatically — verify it did).
18. Run `pnpm --filter web payload:migrate` to apply the new migration locally.
19. Extend `apps/web/scripts/seed-payload.ts`:
    - Widen the `CollSlug` union to include `"dashboardTickers" | "dashboardQuoteSnapshots" | "aiModels" | "fundingRounds"`.
    - Add a `DASHBOARD_TICKERS` fixture — **36 rows** (12 existing + 24 curated core additions), exactly per the "Seeded ticker universe" table in the Schema Reference section above (sourced from `process/features/dashboards/references/dtw-ticker-universe_REFERENCE_15-07-26.md` — use its exact symbols, do not re-derive or approximate). Set `dataSource` on every row per that table — the enum is now `yahoo` \| `vietnam-native` \| `manual-private` (3 values, per AD-14). `isPrivate: true` only for `VNG` and `Ola Krutrim` (unchanged); `false` for all 34 others, including the 6 `vietnam-native` Vietnam rows (they're public, editor-maintained rows, not private companies). Apply the three symbol-trap fixes on the existing 12: `KKDY` → `377300.KS`, `BKKM` → `BUKA.JK` (both pre-existing plan fixes, unchanged by this update), and `PYTM.NS` → `PAYTM.NS` (new fix — the old value was a dead/incorrect symbol). For the 24 new rows' `px`/`chg`/`mcap`, follow the placeholder-value guidance in the Schema Reference subsection above (plausible, order-of-magnitude-correct, never fabricated-precise); `funding: "–"` for all 24. Upsert by `ticker`.
    - Add a step generating `dashboardQuoteSnapshots`: for every seeded ticker with a non-null `px` (i.e. `isPrivate === false` — now 34 tickers across the expanded 36-ticker universe; snapshot generation is independent of `dataSource`, since chart history applies uniformly regardless of which cron, if any, can refresh a row's live price), synthesize 30 trading-day closes ending at that ticker's current `px`, using a deterministic small-step pseudo-random walk (seed the walk off a simple hash of the ticker string) with ~1-2% daily volatility and a mild upward drift, so the resulting equal-weighted index trend resembles the old static BigChart's 100→140 shape. Upsert each `(ticker, date)` pair.
    - Add an `AI_MODELS` fixture: the 8 rows currently in `AI_LEADERBOARD`, plus a best-guess `sourceSlugLlmstats` placeholder value per row (amended 2026-07-30 — replaces the old `sourceSlugLmarena`/`sourceSlugModelsdev` pair; use the best-guess LLM Stats `/v1/models` `id` format for each of the 8 models, e.g. lowercase maker/model-slug style) — explicitly comment in the script that these are placeholders pending verification against the real upstream schema on first cron run (see "Known Unknowns" #1/#2/#5). Upsert by `model`.
    - Add a `FUNDING_ROUNDS_SEED` fixture: ~10 plausible, varied Asia-tech funding rounds (different companies/sectors/countries/rounds/amounts), each `announcedDate` computed at seed runtime as `now − N days` for a spread of `N` across the last 14 days (per AD-7) — NOT fixed calendar-date strings. Clear all existing `fundingRounds` rows first, then insert fresh (same pattern already used for `wireDrops`), all `status: "published"`.
    - Add a step upserting the `dashboardMethodology` global via `payload.updateGlobal(...)`: `fundingMethodology` and `disclaimer` use the exact current EN/VI/ID copy lifted verbatim from `page.tsx`; `aiMethodology` is rewritten per the 2026-07-30 LLM Stats amendment (NOT lifted verbatim from the pre-swap AI-tab copy) — seed EN copy along the lines of: scores are normalized per-category benchmark scores compiled by LLM Stats (source-verified where marked); rankings method TrueSkill; keep "For informational purposes only"; drop "Arena score" vocabulary — with matching VI/ID translations.
20. Run `pnpm --filter web db:seed` — confirm console output shows non-zero counts for all 4 new collections and the global updated.
21. Also update `lib/data.ts`'s existing `FUNDING_ROWS` static fallback array with the same symbol-trap fixes (`KKDY`→`377300.KS`, `BKKM`→`BUKA.JK`, and the new `PYTM.NS`→`PAYTM.NS` fix) so the fail-open fallback path is equally correct. This fallback intentionally stays at its original 12 rows — it's the degraded-mode safety net used only when Payload is unreachable (see Data Flow), not the primary seed data; the 24 new tickers live only in the `dashboardTickers` CMS seed, per this update's scope.
22. Move `big-chart.tsx`'s current hardcoded `DATA` array into `lib/data.ts` as `FALLBACK_CHART_SERIES` (same 30 numbers) — this becomes the chart helper's fail-open fallback.

**C — Read helpers + pure math**
23. Create `apps/web/src/lib/dashboards/derive.ts` exporting pure functions: `computeEqualWeightedIndex(snapshotsByTicker)` (AD-3 algorithm, returns `{ series: number[]; asOf: string | null }`, falling back internally if fewer than 2 distinct trading days result), `computeTopMovers(rows)` (top 4 tickers by `|chg|` descending, excluding null `chg`), `computeFundingSummary(publishedRows, now)` (14-day total in USD-millions, deal count, **median** amount, top sector by mode, a 10-day daily-sum sparkline, and `changePct` vs. the prior 14-day window), and `isStaleTradingDay(asOfIso, now)` (true only when `now` is a UTC weekday AND more than 48h have elapsed since `asOfIso`, or `asOfIso` is null).
24. In `apps/web/src/lib/payload-server.ts`: add `getDashboardTickers()` (tag `dashboards:funding`, revalidate 3600; maps `dashboardTickers` docs → the existing `FundingRow` shape; try/catch → falls back to `FUNDING_ROWS`).
25. Add `getDashboardChartSeries()` (tag `dashboards:funding`, revalidate 3600; queries up to ~500 recent `dashboardQuoteSnapshots` with `ticker` populated at depth 1, excludes `isPrivate` tickers, calls `computeEqualWeightedIndex`; try/catch or empty-result → falls back to `{ series: FALLBACK_CHART_SERIES, asOf: null }`).
26. Add `getAiModels()` (tag `dashboards:ai`, revalidate 3600; maps `aiModels` docs sorted by `rank` → the existing `AiLeaderboardRow` shape; computes `asOfScores` = max across returned docs; try/catch → falls back to `{ rows: AI_LEADERBOARD, asOfScores: null }`).
27. Add `getDashboardSponsorSlot(slot: "dashboard_funding" | "dashboard_ai")` (tag `sponsor-slots:all`, revalidate 3600; filters `sponsorSlots` by `slot` plus the startsAt/endsAt window described in Data Flow, depth 1; returns the raw `Article | null`, published-only; try/catch → `null`).
28. Add `getDashboardMethodology()` (tag `dashboards:methodology`, revalidate 300; reads the `dashboardMethodology` global; applies the same `?? / || en-fallback` pattern already used for `NavPillar.title` when a `vi`/`id` subfield is blank; try/catch → returns a hardcoded object matching the exact current page copy, mirroring `getPaywallThreshold`'s defensive pattern).
29. Add `getFundingRoundsSummary()` (tag `dashboards:funding-rounds`, revalidate 3600; queries `fundingRounds` where `status: "published"` for the last 14 + prior 14 days, calls `computeFundingSummary`; try/catch → an explicit all-zero/empty shape — NOT the old fake literals, per AD-7).
30. Update the "Cache-tag conventions" comment block at the top of `payload-server.ts` to document the 5 new tags (`dashboards:funding`, `dashboards:ai`, `dashboards:funding-rounds`, `dashboards:methodology`, `sponsor-slots:all`).

**D — Route restructure**
31. Convert `apps/web/src/app/(reader)/dashboards/[[...sub]]/page.tsx` from a `"use client"` component using `use(params)` to an async server component using `await params`, matching the exact pattern in `(reader)/[pillar]/page.tsx`.
32. Add tab validation: `sub` undefined/empty → `"funding"`; `sub.length === 1 && isTab(sub[0])` → that tab; anything else (length > 1, or an unrecognized single segment) → call `notFound()`.
33. Add `export const revalidate = 60;` (matches the `[pillar]`/`article` page convention).
34. Add `generateMetadata({ params })` returning per-tab title/description: base "Dashboards" when the tab can't be resolved yet, `"Asia Funding Tracker | Dashboards | Dailytechwire"` / `"AI Leaderboard | Dashboards | Dailytechwire"` for the two valid tabs, with concise one-line descriptions (English only, matching the root layout's English-only `metadata` convention).
35. Inside the page component, `Promise.all` the needed fetches for the ACTIVE tab only: funding tab → `getDashboardTickers()`, `getDashboardChartSeries()`, `getDashboardSponsorSlot("dashboard_funding")`; ai tab → `getAiModels()`, `getDashboardSponsorSlot("dashboard_ai")`; both tabs → `getDashboardMethodology()`.
36. Compute `topMovers` via `computeTopMovers(rows)` (funding tab only) and resolve the sponsor doc to an `ArticleView` via `toArticleView()` if non-null.
37. Render `<DashboardsShell tab={tab} methodology={...} sponsor={sponsorView}>{tab === "funding" ? <FundingTracker .../> : <AILeaderboard .../>}</DashboardsShell>` (server component passing a client component's children through, matching the standard Next.js Server-passes-children-to-Client pattern).
38. Create `apps/web/src/app/(reader)/dashboards/[[...sub]]/loading.tsx`: a skeleton using `@dtw/ui`'s `Skeleton` — header block, tab-bar block, and ~6 table-row blocks.
39. Create `apps/web/src/app/(reader)/dashboards/[[...sub]]/error.tsx`: `"use client"`, standard `{ error, reset }` props, `useEffect(() => console.error(error), [error])`, translated message + "Try again" button calling `reset()`.

**E — Component refactors**
40. Create `apps/web/src/components/dashboards/th.tsx`: a shared `Th` component per AD-11 — `<th aria-sort={...}>` wrapping a real `<button type="button" onClick={() => onSort(k)}>` (reset default button chrome via inline style: no background/border, inherit font, `cursor: pointer`), used by both tables in place of their near-duplicate local `Th` definitions.
41. Update `apps/web/src/components/dashboards/funding-tracker.tsx`: replace the local `Th` with the shared one; replace the `FUNDING_ROWS` import with new props (`rows`, `chartSeries`, `chartAsOf`, `topMovers`, `asOf`); add `aria-pressed={country === c}` to the country filter buttons; rebuild `downloadCsv` to (a) use `toCsvField` from `lib/csv.ts` on every cell, (b) build the header row from the same translated label strings already used in the table's `<Th>` headers instead of the raw field-key strings; replace the "Sample data — live market feed coming soon" caption with the dynamic "Data as of {date} · EOD, delayed" caption (max `asOf` across rows) plus a small amber-toned "Stale"/"Cũ"/"Usang" pill when `isStaleTradingDay(asOf, now)` is true; pass `chartSeries`/`chartAsOf` into `BigChart` instead of it generating its own data; replace the hardcoded `TOP_MOVERS` const with the `topMovers` prop.
42. Update `apps/web/src/components/dashboards/ai-leaderboard.tsx`: replace the local `Th` with the shared one; replace the `AI_LEADERBOARD` import with new props (`rows`, `asOfScores`); add `aria-pressed={sortKey === k}` to the "Optimize for" pills; add a `label` prop to `Bar` (passed as the translated dimension name at each of the 3 call sites) and set `role="img"` + `aria-label={`${label}: ${v} out of 100`}` on it; wrap the `"free"` literal in `t("free","miễn phí","gratis")`; replace the "sample data, preview" caption with "Sort by what you actually use the model for · Scores via LLM Stats, as of {date}" (max `asOfScores`); add the required attribution line below the table, linking to https://llm-stats.com: `t("Model scores, pricing & context: LLM Stats", "Điểm mô hình, giá & ngữ cảnh: LLM Stats", "Skor model, harga & konteks: LLM Stats")` (amended 2026-07-30 — replaces the LMArena/models.dev double attribution). No stale badge on this tab (AD says 48h/trading-day framing doesn't apply to weekly data).
43. Update `apps/web/src/components/dashboards/big-chart.tsx`: remove the hardcoded `DATA` const; accept `data: ReadonlyArray<number>` and `asOf: string | null` props; add `role="img"` + a computed `aria-label` describing the trend (latest value, direction, period, `asOf` date); if `data.length < 2`, render a simple "not enough data yet" placeholder instead of a degenerate path.
44. Create `apps/web/src/components/dashboards/dashboards-shell.tsx` (`"use client"`): owns the header (kicker stays "Data Desk · Preview" per AD; body paragraph drops "sample data...coming soon" wording), the tab links (add `aria-current={tab === k ? "page" : undefined}`), the Methodology block (reads `methodology.funding`/`methodology.ai`/`methodology.disclaimer` `{en,vi,id}` groups through `t()`), and the Sponsor card (renders nothing if `sponsor` is null; otherwise "Sponsor slot · this dashboard" header, "Brought to you by {sponsor.sponsor ?? sponsor.title}" linking to `/article/{sponsor.slug}`, and the unchanged "Sponsorship does not influence..." line) — replaces the equivalent inline JSX currently in `page.tsx`.
45. Update `apps/web/src/app/(reader)/dashboards/[[...sub]]/page.tsx` to render `<DashboardsShell>` (step 37) instead of the old inline header/methodology/sponsor markup; delete the now-dead `"[Partner Logo]"` literal and the old hardcoded `#E0B900` border.

**F — Homepage teaser refactor**
46. Update `apps/web/src/app/(reader)/page.tsx`: add `getAiModels()` and `getFundingRoundsSummary()` to the existing `Promise.all` fetch list.
47. Update `apps/web/src/components/home/dashboards-teaser.tsx`: remove the `AI_LEADERBOARD` import and the hardcoded `fundSeries`/`fundChange` consts and inline literals; accept new props (`aiRows`, `funding: { totalUsdM, dealCount, medianUsdM, topSector, sparkline, changePct }`); format the headline as `"{amount} raised, 14 days"` where amount uses the `$X.XB` (≥1000) / `$XM` (<1000) formatting rule; relabel "Avg. round" → "Median round" (`t("Median round","Vòng gọi vốn trung vị","Median putaran")`) driven by `medianUsdM`; translate the remaining teaser strings per this plan's i18n table (Deals, Top sector, "This week's top models", "filter by use case →", and the compact table headers `#`/Model/Reason/Code/`$/M`).

**G — Cron automation**
48. Create `apps/web/src/lib/dashboards/stocks-yahoo.ts`: thin adapter for all `dataSource: "yahoo"` tickers (~28 of them, per AD-14). Given a list of ticker symbols, fetches from Yahoo Finance's unauthenticated v8 chart endpoint (`query1.finance.yahoo.com/v8/finance/chart/<symbol>`) — one HTTP call per symbol — returning `regularMarketPrice`, `previousClose` (compute `chg` as `(price - previousClose) / previousClose * 100`), and up to 30 days of daily close history for `dashboardQuoteSnapshots`. Per Known Unknown #3, EXECUTE must verify at build time whether the v7 `quote` endpoint's crumb+cookie flow is stable enough to also batch-fetch `marketCap` and a precomputed `%change`; if so, EXECUTE MAY layer that in for `mcap` (see updated AD-2) — otherwise ship on v8 chart alone, which is sufficient for `px`/`chg`/`asOf`/history. Implements the reliability guardrails from AD-14: on a per-symbol fetch failure, returns nothing for that symbol (caller leaves its existing row untouched — no partial/zeroed writes); retries once with jittered backoff on transient failures; rejects a response whose trading day isn't the most recent expected one or whose price is null/zero/non-numeric. Returns `{ ticker, close, previousClose, date, history: { date, close }[] }[]`. The adapter is symbol-list-agnostic — it fetches whatever tickers it's given; the caller (step 52) is responsible for only ever passing `dataSource: "yahoo"` rows.
49. Create `apps/web/src/lib/dashboards/stocks-vietnam.ts`: thin adapter for all `dataSource: "vietnam-native"` tickers (6: `FPT.VN`, `CMG.VN`, `CTR.VN`, `MWG.VN`, `VTP.VN` on HOSE + `VGI` on UPCoM, per AD-13/AD-14). Fetches from VNDirect's `dchart` UDF-style endpoint as primary (no-auth, must cover both HOSE and UPCoM per Known Unknown #4), falling back to TCBS's public quote endpoint on failure; optionally cross-checks against SSI FastConnect if it proves genuinely no-auth for EOD reads (Known Unknown #4) — if SSI requires registration, skip it and rely on VNDirect+TCBS alone, do not block the adapter on obtaining SSI credentials. Returns the same shape as `stocks-yahoo.ts`'s adapter output (`{ ticker, close, previousClose, date, history: { date, close }[] }[]`) so the route handler (step 52) can treat both lanes uniformly. Implements the same AD-14 reliability guardrails (last-good on failure, retry with jitter, staleness/sanity guard) plus a cross-source mismatch check when both VNDirect and TCBS respond (per the full-automation research's guardrail: if the two sources disagree beyond a small tolerance, skip the write and log rather than guessing which is right — a corporate-action false −30% is a known failure mode for VGI specifically). The adapter is symbol-list-agnostic — it fetches whatever tickers it's given; the caller (step 52) is responsible for only ever passing `dataSource: "vietnam-native"` rows.
50. Create `apps/web/src/lib/dashboards/ai-llmstats.ts` (amended 2026-07-30 — replaces `ai-lmarena.ts` + `ai-modelsdev.ts`; see `process/features/dashboards/references/ai-leaderboard-llmstats-design_REFERENCE_30-07-26.md` §3): thin adapter that walks `GET https://api.llm-stats.com/stats/v1/models?limit=200` (cursor walk — follow the response's pagination cursor until exhausted; LLM Stats tracks 380+ models, more than one page's worth), sending `Authorization: Bearer $LLMSTATS_API_KEY` on every request; indexes the combined result set by `id`. For each CMS `aiModels` row matched by `sourceSlugLlmstats` (exact id match, not fuzzy), maps: `maker` = `organization.name`; `reasoning` = `top_scores.reasoning`; `coding` = `top_scores.coding` (×100 if the API returns a 0-1 fraction — verify at first run, see Known Unknowns #2); `price` = the minimum non-null `providers[].input_price_per_m` across that model's providers (`0` = free); `ctx` = `context_window` formatted `"512k"`/`"1M"` style (≥1,000,000 → `"xM"`, else `round(k)` + `"k"`). Returns `{ sourceSlugLlmstats, maker, reasoning, coding, price, ctx }[]`. Cron path stays `ai-weekly` (unchanged schedule); never creates new `aiModels` rows; unmatched upstream ids are logged and skipped (curated 8-row board unchanged).
51. In `ai-llmstats.ts`, implement the mandatory failure handling from the design doc (§3): treat an HTTP 2xx response with a non-JSON body as a failure, not a success (a Cloudflare bot-challenge can serve HTML with a 200 status); on a genuine error response, parse the `{ error: { code, message } }` envelope; on HTTP 429, honor the `Retry-After` header; retry once with jittered backoff on transient failures (matches the `stocks-yahoo.ts`/`stocks-vietnam.ts` retry pattern); on any unrecovered failure, write nothing — the route handler leaves existing `aiModels` fields untouched and last-good data keeps rendering (same last-good-cache guardrail as AD-14's stocks adapters). On the first real run, EXECUTE must verify Known Unknowns #1/#2/#5 (actual `top_scores` key names, score scale, id stability) and log-and-skip the field mapping on any mismatch rather than guessing.
52. Create `apps/web/src/app/api/dashboards/refresh/[source]/route.ts`: exports `GET` and `POST` delegating to one internal handler; validates `source` against `"stocks-yahoo" | "stocks-vietnam" | "stocks-daily" | "ai-weekly"` (404 otherwise; amended 2026-07-30 — `ai-lmarena`/`ai-modelsdev` removed from this union, replaced by the single `ai-weekly` path); checks `bearerMatches` against `DTW_DASHBOARD_REFRESH_TOKEN` (401 otherwise); for `stocks-yahoo`, fetches all `dashboardTickers` where `dataSource === "yahoo"`, calls `stocks-yahoo.ts`, computes `chg` vs. the latest prior `dashboardQuoteSnapshots` close per ticker (or uses the adapter's own `previousClose`-derived value), upserts a new snapshot row, updates `px`/`chg`/`asOf` on the matched ticker (skipping any field in that ticker's `editorLocked`); for `stocks-vietnam`, same pattern against `dataSource === "vietnam-native"` rows via `stocks-vietnam.ts`; `stocks-daily` runs both `stocks-yahoo` and `stocks-vietnam` logic sequentially in one request (per AD-9's extension) and returns a combined per-lane result summary (`{ ok: true, lanes: { yahoo: {...}, vietnam: {...} } }`, per updated AD-10) — a failure in one lane does not abort the other, and after both lanes complete, prunes `dashboardQuoteSnapshots` older than ~120 days once; for `ai-weekly`, calls `ai-llmstats.ts`, matches `aiModels` docs by `sourceSlugLlmstats`, writes the owned fields (`maker`, `reasoning`, `coding`, `price`, `ctx`, `asOfScores`; respecting `editorLocked`), logs+skips unmatched adapter results, never creates new `aiModels` rows; there is no API-key-gated skip response anywhere in this route (superseded AD-10 — neither stocks lane needs one); sets `export const maxDuration = 60`.
53. Add `DTW_DASHBOARD_REFRESH_TOKEN=""` and `LLMSTATS_API_KEY=""` to `.env.example` (two new env vars this plan needs — still no stock-vendor API key, per AD-14; `LLMSTATS_API_KEY` is the 2026-07-30 amendment's one new addition, a free server-only key from llm-stats.com/developer, sent as `Authorization: Bearer $LLMSTATS_API_KEY` by `ai-llmstats.ts`), with a comment explaining the required Vercel-side `CRON_SECRET` duplication for `DTW_DASHBOARD_REFRESH_TOKEN` (documented as an ops step, not a code step). If EXECUTE observes real rate-limiting from Yahoo or the Vietnamese sources during testing (per AD-14's guardrail (d)), add a commented-out, unset-by-default `DASHBOARDS_STOCKS_PROXY_URL=""` placeholder noting where a residential/allowlisted proxy would be inserted — do not wire actual proxy infrastructure speculatively.
54. Add two `crons` entries to `apps/web/vercel.json`: `{ path: "/api/dashboards/refresh/stocks-daily", schedule: "30 22 * * *" }` (daily, ~22:30 UTC, after US close — this still comfortably post-dates HOSE/UPCoM's ~07:45 UTC close, so the Vietnamese lane's same-day EOD is always available by then) and `{ path: "/api/dashboards/refresh/ai-weekly", schedule: "0 3 * * 1" }` (weekly, Monday 03:00 UTC) — per AD-9, exactly two entries.

**H — Testing bootstrap**
55. `pnpm --filter web add -D @playwright/test` (installs current latest; note the resolved version).
56. Create `apps/web/playwright.config.ts`: `testDir: "e2e"`, `baseURL: "http://localhost:3000"`, `projects: [{ name: "chromium" }]` only, `webServer: { command: "pnpm --filter web dev", url: "http://localhost:3000", reuseExistingServer: !process.env.CI }`, retries 2 on CI.
57. Add `"test:e2e": "playwright test"` to `apps/web/package.json` scripts.
58. Add a `test:e2e` task to `turbo.json` (`cache: false`, similar to `dev`).
59. Add `"test:e2e": "turbo test:e2e"` to the root `package.json` scripts (consistency with `lint`/`typecheck`).
60. Create `apps/web/e2e/dashboards.spec.ts` — ONE spec: (a) navigate to `/dashboards/funding`, click the "Day Δ" sort button, assert the first row's ticker changes and the column's `aria-sort` attribute updates; (b) click the "↓ CSV" button, capture the download via `page.waitForEvent("download")`, read its content, assert the header row exactly matches the expected translated-label header and the file is non-empty. (CSV quoting-edge-case correctness for a comma-containing value is covered by code review of the `toCsvField` implementation, not fabricated test data — see the plan's rationale.)
61. Add `test-results/` and `playwright-report/` to the root `.gitignore` under a new "# testing" section.
62. Add a new `e2e` job to `.github/workflows/ci.yml`: spins up a `postgres:16` service container; installs deps; sets `DATABASE_URL`/`DATABASE_DIRECT_URL` to the service container, throwaway `PAYLOAD_SECRET`/`BETTER_AUTH_SECRET` values; runs `pnpm --filter @dtw/db exec drizzle-kit migrate` then `pnpm --filter web payload:migrate`; runs `pnpm --filter web db:seed`; runs `pnpm --filter web exec playwright install --with-deps chromium`; runs `pnpm --filter web test:e2e`.

**I — Closeout docs**
63. Update `process/features/dashboards/_GUIDE.md`: change `Status: not-started` to reflect this plan's completion state, correct the "Key Source Files" list to the real paths used in this plan, and explicitly note in the guide that sticky table headers, the funding-rounds table view, and the 5-minute refresh ambition are deferred/abandoned (per this plan's Non-Goals table) rather than silently missing.
64. Fix `process/context/tests/all-tests.md:112`: remove/correct the stale "No CI pipeline (no `.github/workflows/`)" line — `.github/workflows/ci.yml` exists and, after this plan, includes the new `e2e` job.

---

## Touchpoints

**New files**
- `apps/web/src/lib/bearer-auth.ts`
- `apps/web/src/lib/csv.ts`
- `apps/web/src/lib/dashboards/derive.ts`
- `apps/web/src/lib/dashboards/stocks-yahoo.ts`
- `apps/web/src/lib/dashboards/stocks-vietnam.ts`
- `apps/web/src/lib/dashboards/ai-llmstats.ts`
- `apps/web/src/payload/collections/DashboardTickers.ts`
- `apps/web/src/payload/collections/DashboardQuoteSnapshots.ts`
- `apps/web/src/payload/collections/AiModels.ts`
- `apps/web/src/payload/collections/FundingRounds.ts`
- `apps/web/src/payload/globals/DashboardMethodology.ts`
- `apps/web/src/payload/migrations/<new migration pair>`
- `apps/web/src/app/api/dashboards/refresh/[source]/route.ts`
- `apps/web/src/app/(reader)/dashboards/[[...sub]]/loading.tsx`
- `apps/web/src/app/(reader)/dashboards/[[...sub]]/error.tsx`
- `apps/web/src/components/dashboards/th.tsx`
- `apps/web/src/components/dashboards/dashboards-shell.tsx`
- `apps/web/playwright.config.ts`
- `apps/web/e2e/dashboards.spec.ts`

**Modified files**
- `apps/web/src/app/api/engine/intake/route.ts` (bearer-check extraction only, no behavior change)
- `apps/web/src/app/globals.css` (new token)
- `apps/web/src/components/home/sponsored-strip.tsx`, `apps/web/src/components/article/article-content.tsx`, `packages/ui/src/disclosure-box.tsx` (border token only)
- `apps/web/src/payload/collections/SponsorSlots.ts` (add hooks)
- `apps/web/src/payload/hooks/revalidate.ts` (6 new hook exports)
- `apps/web/payload.config.ts` (register 4 collections + 1 global)
- `apps/web/scripts/seed-payload.ts` (4 new fixtures + upsert steps)
- `apps/web/src/lib/data.ts` (ticker remap in `FUNDING_ROWS`, add `FALLBACK_CHART_SERIES`)
- `apps/web/src/lib/payload-server.ts` (6 new cached helpers + tag docs)
- `apps/web/src/app/(reader)/dashboards/[[...sub]]/page.tsx` (server conversion)
- `apps/web/src/components/dashboards/funding-tracker.tsx`
- `apps/web/src/components/dashboards/ai-leaderboard.tsx`
- `apps/web/src/components/dashboards/big-chart.tsx`
- `apps/web/src/app/(reader)/page.tsx` (homepage fetch additions)
- `apps/web/src/components/home/dashboards-teaser.tsx`
- `apps/web/vercel.json` (crons)
- `.env.example` (1 new var)
- `apps/web/package.json`, root `package.json`, `turbo.json` (test:e2e wiring)
- `.gitignore` (Playwright artifacts)
- `.github/workflows/ci.yml` (new `e2e` job)
- `process/features/dashboards/_GUIDE.md`
- `process/context/tests/all-tests.md`

---

## Public Contracts

- **New env vars**: `DTW_DASHBOARD_REFRESH_TOKEN` (plus an ops-side Vercel `CRON_SECRET` duplication — not a repo env var) and `LLMSTATS_API_KEY` (server-only, added 2026-07-30 for the LLM Stats API swap — see `references/ai-leaderboard-llmstats-design_REFERENCE_30-07-26.md`). No stock-vendor API key is needed — Yahoo Finance and the Vietnamese sources are both unauthenticated for EOD reads (per AD-14); this supersedes the original `MARKETSTACK_API_KEY` requirement, which is removed.
- **New HTTP routes**: `GET|POST /api/dashboards/refresh/[source]` where `source ∈ {stocks-yahoo, stocks-vietnam, stocks-daily, ai-weekly}` (collapsed from 6 to 4 possible values, 2026-07-30 — the two AI adapters merged into one `ai-llmstats.ts` module invoked only via the `ai-weekly` path); bearer-token protected; 401/404/200 contract per AD-8/AD-10 (no more license-gated skip response — see updated AD-10).
- **New Payload collections/global** (schema above) — first consumers of none of them are external yet, so no back-compat constraint beyond the seed data shape.
- **`SponsorSlots`** gains its first real consumer — its existing `slot`/`article`/`startsAt`/`endsAt` field contract is unchanged, only newly *read*.
- **Component prop contracts changed** (breaking within the repo, not externally): `FundingTracker`, `AILeaderboard`, `BigChart`, `DashboardsTeaser` all move from zero/static-import props to explicit data props — any other caller of these components (none currently exist besides the ones touched in this plan) would need updating.
- **`vercel.json`** gains a `crons` key (didn't exist before — additive, no existing behavior removed).

---

## Blast Radius

- **High-confidence isolated**: the 4 new Payload collections/global, the 2 new cron routes, the new adapters/derive helpers, the Playwright bootstrap — none of these are read by any existing code path outside dashboards/homepage-teaser.
- **Shared-file edits requiring care**: `payload-server.ts` (additive only — new exports, existing exports untouched), `revalidate.ts` (additive only), `payload.config.ts` (additive array entries), `.env.example`/`.gitignore`/`turbo.json`/root `package.json` (additive lines), `globals.css` (additive token + 3 one-line border swaps).
- **Genuinely shared-behavior-risk files**: `apps/web/src/app/api/engine/intake/route.ts` (bearer-check extraction — must not change its 401/500 behavior at all, this is a live integration contract with `dtw-engine`); `.github/workflows/ci.yml` (adding a job must not break the existing `typecheck` job — keep them independent jobs).
- **Homepage**: `(reader)/page.tsx` and `dashboards-teaser.tsx` changes touch the highest-traffic page in the app — verify the rest of the homepage (hero, brief band, wire drops, etc.) is unaffected since this only adds 2 new `Promise.all` entries and changes one component's props.
- **No changes** to `packages/db` (Drizzle schema), Better-Auth, RBAC, search, newsletters, or any article/pillar code path.

---

## Verification Evidence

Run/check all of the following before considering this plan done:

1. `pnpm typecheck` (root) — clean.
2. `pnpm --filter web build` — succeeds (also exercises `generateMetadata`/server-component correctness at build time for SSG-eligible parts).
3. `pnpm --filter web payload:migrate` — applies cleanly on a fresh local DB from scratch (drop and recreate the dev DB, or use a scratch DB, to confirm the migration isn't order-dependent on already-existing manual state).
4. `pnpm --filter web db:seed` — non-zero counts logged for `dashboardTickers` (36), `dashboardQuoteSnapshots` (~30 × 34 non-private tickers), `aiModels` (8), `fundingRounds` (~10), plus a confirmation the `dashboardMethodology` global was updated.
5. Manual browser check: `/dashboards`, `/dashboards/funding`, `/dashboards/ai` all 200 with correct per-tab `<title>`; `/dashboards/bogus` and `/dashboards/funding/x` both 404.
6. Manual: throttle network in devtools, confirm `loading.tsx` skeleton appears; temporarily force a thrown error in a helper, confirm `error.tsx` renders with a working "Try again."
7. Manual: keyboard-only — Tab to a sort button, Enter, confirm row order + `aria-sort` change; Tab to a filter chip/pill, Enter/Space, confirm `aria-pressed` flips.
8. Manual: download CSV from the funding tab, open the file, confirm the header row uses translated labels and any comma-containing value is quoted.
9. Manual: `curl` all stocks-related routes (`stocks-yahoo`, `stocks-vietnam`, `stocks-daily`) and `ai-weekly` with a correct bearer token (expect 200 with a real write or a per-lane partial-failure summary — never a `skipped:true` gate response, since there is no more license gate) and an incorrect bearer token on any route (expect 401).
10. Manual: in `/admin`, set an `editorLocked` entry on a test `dashboardTickers` row for `px` (test both a `yahoo`-tagged row and a `vietnam-native`-tagged row), re-run `stocks-daily` manually — no key needed, the fetch is live — confirm `px` did NOT change on either locked row while `asOf` behavior around it is sane (document exactly what you observed).
11. `pnpm --filter web exec playwright test` — green locally.
12. New `e2e` CI job green on the PR that lands this plan.
13. `grep -rn "#E0B900" apps/web/src packages/ui/src` — zero hits.
14. `grep -n "not-started" process/features/dashboards/_GUIDE.md` — zero hits.

---

## Ops Checklist (non-code, external)

These are letters/emails/ops confirmations, not code — none of them block EXECUTE from shipping the code; the stocks cron ships active regardless (per updated AD-10). The Yahoo ToS/redistribution risk is already accepted by the owner (AD-14) and is not an open ops item here — it's a carried risk, tracked in the Risks table below, not a checklist action.

| # | Action | Owner | Blocks |
|---|---|---|---|
| 1 | Apply to the free Tracxn Journalists & Publications program (pr@tracxn.com) for funding-round verification leads | user | Editorial confidence in `fundingRounds` entries, not code |
| 2 | Confirm which Vercel plan/tier this project deploys on, and confirm it supports at least 2 cron job entries (AD-9 already designs around the common Hobby-tier constraint, but confirm) | user | `vercel.json` crons actually firing in production |
| 3 | Set Vercel project's `CRON_SECRET` env var to the exact same value as `DTW_DASHBOARD_REFRESH_TOKEN` | user | Vercel's automatic cron GET invocation passing the bearer check (AD-8) |
| 4 | Obtain a free `LLMSTATS_API_KEY` from llm-stats.com/developer and set it as a Vercel project env var (amended 2026-07-30) | user | `ai-weekly` cron actually refreshing `aiModels` rows — without a valid key, `ai-llmstats.ts` fails closed (no write; last-good/seeded data keeps rendering) |

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| LLM Stats real schema differs from this plan's assumptions (`top_scores` key names, score scale, id stability) — amended 2026-07-30, replaces the LMArena/models.dev risk | "Known Unknowns" #1/#2/#5 require EXECUTE to verify before finalizing `ai-llmstats.ts`; log-and-skip the affected mapping on a mismatch; DB schema and lock/skip behavior are unaffected either way |
| Single-source dependency on LLM Stats for the AI leaderboard (previously 2 independent sources); an unofficial/undocumented API with no SLA; a Cloudflare bot-challenge or outage can return HTTP 2xx with non-JSON HTML instead of a real error (2026-07-30) | `ai-llmstats.ts` treats 2xx-with-non-JSON as a failure, not a success; parses the `{ error: { code, message } }` envelope on real errors; honors `Retry-After` on 429; retries once with jitter; on any unrecovered failure, writes nothing — last-good `aiModels` data keeps rendering (mirrors the stocks adapters' AD-14 last-good-cache guardrail) |
| **Yahoo Finance's terms of service bar automated/programmatic access and public redistribution of its data on a commercial site** (15-07-26, AD-14) | **Accepted by the owner; legal resolution explicitly deferred to before/at public launch ("pháp lý tính sau").** This is a deliberate business decision, not an oversight — EXECUTE must not add a compliance gate or silently revert to a paid/licensed feed. Track as an open legal item outside this plan's scope, not a code blocker |
| **Unofficial-endpoint fragility** — Yahoo Finance and the Vietnamese sources (VNDirect/TCBS/SSI) have no SLA, can change schema without notice, or return HTTP 200 with garbage/stale data (15-07-26, AD-14) | Mitigated by the AD-14 reliability guardrails implemented in both adapters: last-good cache (never write partial/zeroed data, prior `px`/`chg`/`asOf` keep rendering), retry with jitter on transient failures, a staleness/sanity guard that rejects non-current or non-numeric responses, and (for VN) a cross-source mismatch check between VNDirect and TCBS |
| **Datacenter-IP rate limiting** — Vercel's shared IP ranges may be rate-limited or blocked by Yahoo or the Vietnamese sources (15-07-26, AD-14) | Assessed as low risk at this plan's volume (once daily, ~28 Yahoo symbols + 6 VN symbols); EXECUTE must leave a code-comment seam for a residential/allowlisted proxy if this is observed in practice, but must not pre-build proxy infrastructure speculatively |
| **Corporate actions (splits, large dividends) can make an adjusted-series day look like a false ±20–30% move**, particularly for VGI which has had large historical corporate actions | The staleness/sanity guard (above) should reject or flag day-over-day `%change` beyond a wide sanity bound (e.g. ~20%) rather than silently publishing it; the VN cross-source mismatch check (above) provides a second line of defense |
| Exchange-data licensing for HK/KR/TW/JP/VN prices is itself potentially a licensable activity, separate from the Yahoo-ToS question above | VNDirect/TCBS are used as free, no-auth reads (same accepted-risk posture as Yahoo, per AD-14); SSI FastConnect is documented as the license-clean anchor to cross-check against if/when it's practical to integrate (Known Unknown #4) — not required to ship, but the seam should exist |
| Vercel plan doesn't support 2 cron jobs | AD-9 already minimizes to 2 entries (`stocks-daily`, `ai-weekly`); if even that's too many, the fallback is to further merge them into a single daily cron that no-ops on non-Monday days for the AI half — documented here as the fallback, not built preemptively |
| Seed-time synthetic 30-day price walk looks obviously fake to a sharp-eyed reader | Acceptable for a v1 chart backing real future cron data; the honesty labeling (asOf/stale badge) already signals data freshness accurately; do not present the synthetic history as anything other than what it is if asked |
| CI e2e job is genuinely the largest new piece of infra in this plan | Explicitly scoped in Group H/Verification Evidence; if it proves too fragile in review, the fallback is to keep the Playwright spec + local `test:e2e` script working and mark the CI job as a fast-follow rather than blocking the rest of this plan — flag this explicitly to the user if it happens, do not silently skip it |
| `fundingRounds` aggregates are statistically fragile with few real editorial rows | Median (not average) already mitigates megadeal skew; sector "top" is a mode over a small sample and will be volatile early — expected and acceptable per AD-7 |

---

## Resume and Execution Handoff

**Amendment note (2026-07-30):** the AI leaderboard's data source changed from LMArena+models.dev to the LLM Stats API (owner decision) — see item 2 below. This is a data-source-only swap: it does not affect Groups A/C/D/E(other than the AI caption/attribution)/F/H/I, and it does not touch the stocks/funding-tracker content of Groups B/G (AD-13/AD-14, the ticker universe, or anything Yahoo/VNDirect/TCBS/SSI-related).

A resumed EXECUTE session should read, in order:
1. This plan file in full.
2. `process/features/dashboards/references/ai-leaderboard-llmstats-design_REFERENCE_30-07-26.md` — the amendment's authoritative design (source-swap rationale, data mapping, adapter design, Known Unknowns); AD-5, the `aiModels` schema, and Group G's `ai-llmstats.ts` all depend on it. `demos/ai-leaderboard-demo.html` + `demos/serve-ai-leaderboard.mjs` (repo root) are the living API proof-of-concept referenced by this design doc — read them for real request/response shapes before writing the adapter.
3. `process/features/dashboards/references/dtw-ticker-universe_REFERENCE_15-07-26.md` — the verified 36-ticker universe (symbols, `dataSource` tags) that the Schema Reference's "Seeded ticker universe" subsection and Group B's step 19 depend on; use its exact symbols, do not re-derive.
4. `process/features/dashboards/references/dtw-full-automation_REFERENCE_15-07-26.md` — the owner-decision block (Yahoo replaces Marketstack) plus the VN-source architecture (VNDirect/TCBS/SSI, Lane A) and reliability guardrails that AD-14 and Group G's `stocks-yahoo.ts`/`stocks-vietnam.ts` depend on. Read the DECISION block at the top plus the "Architecture — cron lanes" and "Key risks" sections; do NOT adopt the rest of that document's full-automation scope (market-cap shares×FX lanes, funding-round LLM extraction, that document's own AI speed/coding automation proposal) — those are separate, not-yet-approved decisions, explicitly out of scope for this plan (the `coding` automation this plan DOES ship comes from the LLM Stats amendment in item 2 above, not from this document).
5. `process/context/all-context.md` (invariants) and `process/context/database/all-database.md` (lockedFields spirit).
6. `apps/web/src/payload/hooks/revalidate.ts` and `apps/web/src/lib/payload-server.ts` (current state — check whether Group B/C steps already landed).
7. `apps/web/src/payload/migrations/index.ts` — check whether the dashboards migration already exists before running `payload:migrate:create` again (running it twice would create a redundant migration).
8. Check `git status`/`git log` for partially-applied groups from a prior session before re-running any step — every step above is intended to be idempotent-safe to re-check but not necessarily safe to blindly re-run twice (e.g. step 16's migration creation).

If resuming mid-plan, work through the lettered Groups (A→I) in order; do not start Group G (cron) before Group B/C (schema/helpers) exist, since the routes depend on the collections and `editorLocked` skip logic.

---

## Acceptance Criteria

- [ ] All 4 new collections + 1 global exist in `/admin`, seeded (36 `dashboardTickers` rows across the full curated universe, each tagged with a `dataSource`), with the ticker symbol-trap fixes applied.
- [ ] `/dashboards/funding` and `/dashboards/ai` render from CMS data via cached helpers, not static imports (except as fallback).
- [ ] Invalid dashboard sub-paths 404; valid ones don't.
- [ ] `generateMetadata`, `loading.tsx`, `error.tsx` all present and functioning.
- [ ] Sponsor slot renders nothing when empty, and a real sponsor when a `SponsorSlots` row matches; `#E0B900` no longer hardcoded anywhere.
- [ ] Methodology copy is CMS-editable and matches pre-migration copy exactly at launch (except `aiMethodology`, which is intentionally rewritten per the 2026-07-30 LLM Stats amendment — see the Global schema table).
- [ ] Homepage teaser reflects the same CMS-backed data, no hardcoded literals.
- [ ] Full keyboard operability + `aria-sort`/`aria-pressed`/`aria-label` coverage per Group E.
- [ ] CSV export is comma-safe and i18n'd.
- [ ] Cron routes exist (`stocks-yahoo`, `stocks-vietnam`, `stocks-daily`, `ai-weekly`), are bearer-protected, both `GET`/`POST` work, and both stocks lanes are active from day one — no API-key gate (per AD-14/updated AD-10); a failed lane/adapter (including `ai-weekly`'s `ai-llmstats.ts`) degrades gracefully to last-good cached data instead of blanking rows.
- [ ] First Playwright spec + CI job green.
- [ ] `_GUIDE.md` and `tests/all-tests.md` no longer stale.

---

## Cursor + RIPER-5 Guidance

- **Cursor Plan mode**: import the Implementation Checklist above directly; work Group by Group (A→I); after each Group, update this file's Execution Brief status markers and re-run the relevant Verification Evidence items before continuing.
- **RIPER-5**: this plan was produced in PLAN mode. Say **"ENTER EXECUTE MODE"** to begin implementation — EXECUTE must follow this plan with full fidelity, groups in order A→I, and must stop to flag anything in "Known Unknowns" that turns out to contradict this plan's assumptions rather than silently improvising past it.
