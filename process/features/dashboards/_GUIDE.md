# dashboards

<!-- Part of dtw-web -->

## Scope

Two data-driven product surfaces that differentiate DTW from generic tech news:

- `/dashboards/funding` — **Asia Funding Tracker** (venture funding + tech-stock movement across Asia)
- `/dashboards/ai` — **AI Leaderboard** (model rankings with per-dimension sort: reasoning, coding, speed, price)

Plus the homepage **Live Dashboards teaser** band that previews both with sparkline + count-up.

Does NOT cover: editorial dashboards used by the analytics team (PostHog), CMS data-source config UI (`cms/`).

## Common patterns

- **Sortable table** with sticky header. Sort indicator shows direction.
- **Column filter chips** — country / region for funding, capability for AI.
- **Trend arrows** — `▲` `var(--up)` `#10B981` for up, `▼` `var(--down)` `#EF4444` for down. Format: signed percent with 2 decimals, mono tabular numbers.
- **Chart layer** — line/area for time series, sparklines inline in cells. Drawn with SVG (no chart lib lock-in initially; revisit if requirements grow).
- **Methodology note** at the bottom: "How we score / source / weight." Editor-editable via Payload `DashboardSources`.
- **Sponsor slot** — labelled banner in the sidebar. Filled from Payload `SponsorSlots` (or empty / fallback).
- **CSV export** — button in header, downloads filtered current view.
- **"For informational purposes only"** disclaimer footer.

## Asia Funding Tracker (`/dashboards/funding`)

Columns: Company / Sector / Country / Round / Amount (USD) / Date / Δ vs last round.
Filters: Country (Singapore / Indonesia / Vietnam / Japan / Korea / India / China / Other), Stage, Date range, Sector.
Chart: total weekly funding line + per-country stacked area.
Stat tiles (count-up): deals this period, total raised, average round size, top sector.

Tech-stock view: tickers (TSMC, GoTo, Grab, Sea, Coupang, etc.) with current price + delta. Source via paid feed; cache 5 min.

## AI Leaderboard (`/dashboards/ai`)

Columns: Model / Provider / Reasoning score / Coding score / Speed (tok/s) / Price ($/M tokens) / Context window / Updated.
Filter pills: "Optimize for ___" — reasoning / coding / speed / price. Each pill re-sorts by that column.
Methodology must cite sources (which benchmarks, when scored).

This page intentionally avoids a single composite "AI score" — the spec is explicit: let readers filter by their actual need, not a marketing number.

## Homepage teaser

Lives in the homepage band. Shows:

- Animated sparkline draw-in (deals over last 8 weeks)
- Count-up stats with `Reveal` triple-fallback (already-visible + scroll listener + 1.5s safety timer)
- Two CTAs: "See Funding Tracker →" + "See AI Leaderboard →"
- Dot-grid backdrop for dark visual mode

See `design/project/src/dashboards.jsx` and the teaser portion of `design/project/src/homepage.jsx` for the visual reference.

## Data sources

- Funding: TBD. Candidates: Crunchbase Enterprise, PitchBook, manual editorial entry via Payload. Start with manual entry + CSV import; layer paid feed later.
- Stocks: TBD. Candidates: Polygon.io, Alpaca, Tiingo. Refresh every 5 min during market hours; cache aggressively at edge.
- AI scores: scrape published benchmarks (LiveBench, LMArena, HumanEval, MMLU, MMLU-Pro) + editorial scoring. Refresh weekly.

All data sources are configured in Payload `DashboardSources` collection (Admin only) — API keys encrypted, refresh cadence settable per source.

## Sponsor slot rules

- Always labelled "Sponsored" with mustard background `var(--sponsored)`
- Configurable per dashboard via Payload `SponsorSlots`
- Empty state = no banner shown (not "Your ad here")

## Key Source Files (to come)

- `apps/web/src/app/(reader)/dashboards/funding/page.tsx`
- `apps/web/src/app/(reader)/dashboards/ai/page.tsx`
- `apps/web/src/components/dashboard/{table,sparkline,count-up,csv-export,methodology-note}.tsx`
- `apps/web/src/lib/dashboards/{funding-source,ai-source}.ts` — adapter layer per data source
- `packages/db/src/schema/dashboard-data.ts` — local cache of source data

## Related Context

- `process/context/uxui/all-uxui.md` — sparkline component, count-up effect, ArrowUpDown primitive
- `process/context/integrations/all-integrations.md` — data-source API adapter pattern
- `process/features/cms/_GUIDE.md` — `DashboardSources` + `SponsorSlots` collections

## Current Status

Status: not-started

## Folder Contents

```
process/features/dashboards/
  active/       -- in-progress plans (data-source picker, first table)
  completed/    -- archived completed plans
  backlog/      -- stock-feed integration, multi-region funding map, methodology refresh
  reports/      -- accuracy audits, source-feed downtime reports
  references/   -- benchmark methodology notes, sponsor pricing studies
```
