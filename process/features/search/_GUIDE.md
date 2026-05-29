# search

<!-- Part of dtw-web -->

## Scope

Two surfaces backed by Meilisearch:

1. **⌘K / header search overlay** — instant suggestions as you type. Used from anywhere.
2. **`/search` full page** — faceted results with filters (pillar, date, type, language) and trending queries.

Plus the search-analytics loop: every query (especially zero-result) is sent to PostHog so editors see what readers want that the archive doesn't yet cover.

Does NOT cover: indexer setup itself (that's in the Payload `afterChange` hook — see `cms/_GUIDE.md` and `integrations/all-integrations.md`).

## Performance contract

- p95 < **300ms** from keystroke to first rendered result (spec target)
- Typo tolerance on (Meilisearch default)
- Multi-language indexes (`articles_en`, `articles_id`, `articles_vi`) — query the locale-matched index by default, with cross-locale fallback when results < 3

## ⌘K Overlay

From `design/project/src/search.jsx`:

- Triggered by `⌘K` (mac) / `Ctrl+K` (Windows/Linux) or clicking the header search button
- Modal overlay, dimmed backdrop, autofocused input
- Two states:
  - **Trending** (empty input) — show 8 trending queries (from PostHog) + 4 recently-read articles
  - **Results** (input has text) — debounced 80ms, queries Meilisearch, shows article rows with cover-art + pillar tag + title + first 120 chars
- ESC closes; Enter on first result navigates; arrow keys navigate the list
- Background hover uses `color-mix(in oklab, var(--ink) 8%, transparent)` for theme adaptation

## `/search` Full page

- Header input persists query in URL (`?q=...&pillar=...&dateRange=...`)
- Filters: Pillar (multi-select), Date range, Type (article / author / award), Language
- Result list: same card shape as ⌘K but with byline + dek
- "No results" state suggests related pillars or recently-published articles, AND fires a PostHog `search_zero_result` event with the query

## Meilisearch index (planning summary)

Full contract in `process/context/integrations/all-integrations.md`. Highlights:

- Indexed fields: `title`, `subtitle`, `body_text` (stripped HTML), `author_name`, `pillar`, `tags`, `published_at`, `_lang`
- Multi-tenant by language: `articles_en`, `articles_id`, `articles_vi`
- Y2+: also `authors`, `companies`, `awards`
- Index update path: Payload `afterChange` hook only — single source of truth
- Public API key (browser-side) is read-only on `articles_*` indexes only

## PostHog feedback loop

- Every search query fires a `search_query` event (props: `q`, `lang`, `result_count`, `filters`)
- Zero-result queries fire `search_zero_result`
- These power an editorial dashboard (later — `/admin/analytics/queries`?) that shows what readers want which we don't yet cover

## Key Source Files (to come)

- `apps/web/src/components/search/{overlay,filters,result-row}.tsx`
- `apps/web/src/app/(reader)/search/page.tsx`
- `apps/web/src/lib/meilisearch.ts` — client wrapper
- `apps/web/src/lib/search-analytics.ts` — PostHog events

## Related Context

- `process/context/integrations/all-integrations.md` — Meilisearch index lifecycle, locale strategy
- `process/context/uxui/all-uxui.md` — overlay styling, search-bar `var(--surface-2)` discipline (dark-mode fix)
- `process/features/cms/_GUIDE.md` — `afterChange` hook that drives the index

## Current Status

Status: not-started

## Folder Contents

```
process/features/search/
  active/       -- in-progress plans (Meilisearch setup, ⌘K overlay)
  completed/    -- archived completed plans
  backlog/      -- semantic / vector search (Y2+), author entity pages, company pages
  reports/      -- query analytics summaries, zero-result trends
  references/   -- index schema notes, Meilisearch upgrade notes
```
