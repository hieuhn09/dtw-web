# articles

<!-- Part of dtw-web -->

## Scope

The article reader page (`/article/[slug]` — final route shape TBD: likely `/[pillar]/[subsection]/[slug]` per the dynamic taxonomy invariant) AND the pillar listing pages (`/[pillar]` and `/[pillar]/[subsection]`). Owns the disclosure-box discipline, the paywall meter, the TTS bar (Phase 2), related-articles row, save / share controls.

Does NOT cover: the homepage hero (`homepage/`), CMS authoring UI (`cms/`), Better-Auth flows (`account/`).

## Article page composition

1. **Pillar tag chip** + breadcrumb
2. **Title** (serif, 38–46px, `clamp` for fluid scaling)
3. **Byline** — `By {Author} [and {CoAuthor}] · {date} · {readMin} min read`, all separators `·` in `var(--hair-2)`
4. **Hero** — LQIP image (`next/image`) or HLS video. CLS < 0.05.
5. **Top disclosure box** (sponsored / AI-assisted, if applicable) — non-dismissible
6. **Body** — 17px serif, line-height 1.6, 60–75 chars per line, Source Serif 4 with `ss01,ss02` features. RSC + streaming.
7. **Middle disclosure box** (sponsored only) — non-dismissible
8. **TTS bar** (Phase 2) — Listen / download `.mp3`
9. **Bottom disclosure box** (sponsored / AI-assisted) — non-dismissible
10. **Save / Share row** — bookmark, OG share. OG image is auto-generated 1200×630 keyed off article slug.
11. **Related row** — lazy-loaded so it doesn't block LCP.
12. **Footer**

## Pillar listing page composition

- Pillar header (color from `PILLARS[id].color`, optional icon, slug, order — all CMS-editable)
- Featured article + grid (infinite scroll or paginate)
- Sub-section tab strip (CMS taxonomy entity)
- RSS link (auto-generated Atom 1.0 per pillar)
- Routes regenerate on CMS write, no redeploy needed

## Paywall meter (invariant #4 — soft block)

Phase 1 behaviour (Phase 2 will add Pro gating on top):

- Anonymous visitor: count cookie-keyed (`dtw-read-count`)
- Authenticated visitor: count on user row (`reading_history` table)
- Threshold: read from PostHog feature flag `paywall_meter_threshold` (default 3) — **never hardcode `3`**
- When threshold hit AND user not authenticated AND nudge not dismissed:
  - Sign-in nudge banner shown in header (in-flow, pushes content down)
  - Banner copy: "Enjoying DailyTechWire? Sign in to save articles, follow topics, and pick up where you left off — across every device." CTA: "Sign in — it's free →"
  - Dismiss (×) on right edge, subtle (opacity 0.55, no border, 18×18). Persists in `localStorage["dtw-nudge-dismissed"]`.
- **Never blocks mid-article.** Reader can still finish whatever they started.
- Article body is always served — only the nudge surface changes.

Phase 2 adds real Pro gating with a different banner, but the soft-block rule still holds.

## Disclosure boxes (invariant #5 — non-dismissible)

From `design/project/src/ui.jsx::DisclosureBox`:

- **Sponsored:** `var(--sponsored)` bg, `#E0B900` border, title "Paid Partner · {sponsor}", body "This is a sponsored feature produced by DTW Studio for the partner above. The DTW newsroom was not involved in writing or editing."
- **AI-assisted:** `var(--surface-2)` bg, `var(--hair-2)` border, title "AI-assisted reporting", body "This article uses AI tools for translation or transcription. All facts were verified, and all writing was done by a human reporter."
- Top + middle + bottom placement — `position` prop adjusts the "reminder" subtitle ("· reminder (middle)" / "· reminder (bottom)")
- 24×24 ink badge with `$` or `AI` mono caps icon
- No close button. Period.

## i18n

Article **body stays in source language**. Chrome (byline, pillar chip, paywall, save / share labels, related-row header) is localised via `t(en, vi, id)`.

Dates use `fmtDateL(iso, lang)`.

## Key Source Files (to come)

- `apps/web/src/app/(reader)/[pillar]/[[...slug]]/page.tsx` — dynamic article + listing
- `apps/web/src/app/(reader)/_components/article-body.tsx` — RSC body renderer
- `apps/web/src/components/disclosure-box.tsx` — port of `design/project/src/ui.jsx::DisclosureBox`
- `apps/web/src/lib/paywall.ts` — meter increment, threshold check, nudge state
- `apps/web/src/lib/og.ts` — OG image generation (Vercel OG)

## Related Context

- `process/context/database/all-database.md` — article schema, `lockedFields`, `origin`
- `process/context/integrations/all-integrations.md` — Engine ↔ Payload contract
- `process/context/uxui/all-uxui.md` — disclosure box primitive, type scale
- `process/context/auth/all-auth.md` — sign-in nudge integration with auth modal
- `process/features/cms/_GUIDE.md` — how editors set sponsored / AI flags

## Current Status

Status: not-started

## Folder Contents

```
process/features/articles/
  active/       -- in-progress plans (e.g. paywall meter Phase 1)
  completed/    -- archived completed plans
  backlog/      -- TTS, Phase 2 Pro gating, infinite scroll polish
  reports/      -- post-launch perf reports
  references/   -- editorial design notes, type scale studies
```
