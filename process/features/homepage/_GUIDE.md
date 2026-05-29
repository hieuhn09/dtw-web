# homepage

<!-- Part of dtw-web -->

## Scope

The reader's entry surface — `/` (and `/en /id /vi`). A high-density editorial homepage that lives or dies by perceived speed and editorial integrity. Composes 11+ distinct bands: Hero, Brief, Wire Drops (realtime), Pillar showcase (6 × 4 articles), Asia Tech Spotlight, Live Dashboards teaser, Deep Dive of the Week, Awards banner, Sponsored Strip, Best of Reviews (affiliate), Podcast, Newsletter CTA.

Does NOT include: the article reader page (`articles/`), pillar listing pages (`articles/` covers those), search overlay surface (`search/`).

## Composition (top → bottom)

1. **Ticker tape** (top strip) — TSMC, GoTo, FX, BTC, scrolling with `▲▼` deltas. Pauses on hover.
2. **Header** — wordmark "DailyTechWire" (30px serif), tagline "Tech Intelligence, Wired Daily", search ⌘K, dark-mode toggle, sign-in button, pillar nav (AI / Startups / Asia / Dev / Products / Policy, 14px font / 15px icon).
3. **Sign-in nudge banner** — conditional: shows after ≥ 3 article reads when not authenticated. Dismissible (×). In-flow (pushes content down, NOT floating). Localised.
4. **Hero band** — 1 main story with LQIP cover (~440px height after iteration) + 4 aside stories. Section uses `clamp()` for fluid scaling.
5. **The Brief** — 4-column band: 200px label / 1fr / 1fr / 150px button. Vertical dividers run only 22%–78% (not full-height — design decision). AM Brief + PM Brief preview.
6. **Wire Drops** — realtime band. Subscribes to Soketi/Pusher `wire-drops` channel. Drops slide in. Each ≤ 150 chars + city chip (Singapore coral, Seoul violet, Jakarta sky, Hanoi green) + timestamp.
7. **Pillar showcase** — 6 columns, **4 articles each** (1 cover-art card + 3 text rows). Uses `localizedPillarLabel(id, lang)`.
8. **Asia Tech Spotlight** — dark band with cursor-following coral spotlight + dot-grid backdrop. Hand-curated articles.
9. **Live Dashboards teaser** — sparkline draw-in animation + count-up stats. Links to `/dashboards/funding` and `/dashboards/ai`.
10. **Deep Dive of the Week** — one long-form featured.
11. **Awards banner** — coral kicker "Awards · Coming soon", title "The inaugural awards arrive in 2026", description, single CTA "Learn more →". **No "see previous winners"** (Y1 = inaugural). EST 2026 medallion.
12. **Sponsored Strip ("DTW Studio Presents")** — `var(--sponsored)` bg `#FEF3C7`, "Paid Partner" label. Editorial firewall — labelled, not blended.
13. **Best of Reviews** — affiliate strip, each link has icon + disclosure tooltip. Goes through `/r/[token]` redirect tracker.
14. **Podcast / Voice** — DTW Daily Brief audio + Asia podcasts.
15. **Newsletter CTA** — full-width invite, drives to `/newsletters`.
16. **Footer** — 4-column layout + mini newsletter form + language picker + trust links + copyright.

## Key Source Files (to come)

- `apps/web/src/app/(reader)/page.tsx` — homepage RSC entry
- `apps/web/src/app/(reader)/_components/{hero,brief,wire-drops,pillar-showcase,...}.tsx`
- `apps/web/src/lib/wire-drops.ts` — Soketi/Pusher client + slide-in animation
- `apps/web/src/lib/effects.ts` — port of `design/project/src/effects.jsx` (ticker, spotlight, count-up, scroll-reveal)
- `apps/web/src/components/cover-art.tsx` — port of `design/project/src/art.jsx`

## Design references

The full visual design (every band, color, animation choice) is in `design/project/src/homepage.jsx`. Read it before redesigning any band. The chat transcript at `design/chats/chat1.md` records every iteration — most "what should this be?" questions have already been answered there.

## Performance contract

- Hero LCP < 1.5s (Cover-art SVG is inline, image is `next/image` with LQIP)
- Wire Drops append < 50ms
- Scroll-reveal must use triple-fallback (already-visible check + scroll listener + 1.5s safety timer) — IntersectionObserver alone is unreliable
- ISR `revalidate: 60` baseline + tag-driven revalidation on article publish

## Related Context

- `process/context/uxui/all-uxui.md` — design tokens, cover-art system, ticker / spotlight / count-up effects
- `process/context/integrations/all-integrations.md` — Wire Drops Soketi/Pusher channel, ISR revalidate tags
- `process/context/infra/all-infra.md` — perf targets, ISR, image pipeline
- `process/features/articles/_GUIDE.md` — paywall meter (triggers the sign-in nudge banner here)

## Current Status

Status: not-started

## Folder Contents

```
process/features/homepage/
  active/       -- in-progress plans for the homepage
  completed/    -- archived completed plans
  backlog/      -- deferred ideas (e.g. personalised hero by follow set)
  reports/      -- perf reports, Lighthouse regressions
  references/   -- design-decision archives, A/B test notes
```
