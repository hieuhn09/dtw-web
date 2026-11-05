# articles

<!-- Part of dtw-web -->

## Scope

The article reader page (`/article/[slug]` — final route shape TBD: likely `/[pillar]/[subsection]/[slug]` per the dynamic taxonomy invariant) AND the pillar listing pages (`/[pillar]` and `/[pillar]/[subsection]`). Owns the disclosure-note discipline, the paywall meter, the TTS bar (Phase 2), related-articles row, save / share controls.

Does NOT cover: the homepage hero (`homepage/`), CMS authoring UI (`cms/`), Better-Auth flows (`account/`).

## Article page composition

1. **Pillar tag chip** + breadcrumb + plain-text `Deep Dive` / `Paid Partner` kickers (`var(--muted)`, no chip)
2. **Title** (serif, 38–46px, `clamp` for fluid scaling)
3. **Byline** — `By {Author} [and {CoAuthor}] · {date} · {readMin} min read`, all separators `·` in `var(--hair-2)`
4. **Hero** — LQIP image (`next/image`) or HLS video. CLS < 0.05.
5. *(no box here — removed 05-11-26, owner decision)*
6. **Body** — 17px serif, line-height 1.6, 60–75 chars per line, Source Serif 4 with `ss01,ss02` features. RSC + streaming.
7. **End-of-article disclosure notes** — sponsored (`--sponsored` bg), then affiliate; exactly once, non-dismissible, outside the paywall branch
8. **TTS bar** (Phase 2) — Listen / download `.mp3`
9. *(no bottom box — the single end note at 7 replaces it)*
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

- Anonymous visitor: count cookie-keyed (`dtw-read-count`; → `otw-read-count` at rebrand Phase 6/D14)
- Authenticated visitor: count on user row (`reading_history` table)
- Threshold: read from PostHog feature flag `paywall_meter_threshold` (default 3) — **never hardcode `3`**
- When threshold hit AND user not authenticated AND nudge not dismissed:
  - Sign-in nudge banner shown in header (in-flow, pushes content down)
  - Banner copy: "Enjoying Opentechwire? Sign in to save articles, follow topics, and pick up where you left off — across every device." CTA: "Sign in — it's free →" (renamed from "Enjoying DailyTechWire?" by rebrand decision D1 — the live render at `header.tsx:633-635` still says "DailyTechWire" as of this Phase 0 note; fixed in rebrand Phase 4, must match this exact string)
  - Dismiss (×) on right edge, subtle (opacity 0.55, no border, 18×18). Persists in `localStorage["dtw-nudge-dismissed"]` (→ `otw-nudge-dismissed` at rebrand Phase 6/D14).
- **Never blocks mid-article.** Reader can still finish whatever they started.
- Article body is always served — only the nudge surface changes.

Phase 2 adds real Pro gating with a different banner, but the soft-block rule still holds.

## Disclosure note (invariant #5 — non-dismissible; owner decision 05-11-26)

`DisclosureNote` in `packages/ui/src/disclosure-box.tsx`, mounted by `apps/web/src/components/article/article-content.tsx` directly after `<ArticleBody>`:

- **Sponsored:** `var(--sponsored)` bg, `2px solid var(--accent)` left border, label "Paid Partner · {sponsor}" in `color-mix(in oklab, var(--accent) 65%, var(--ink))`, body "Produced by OTW Studio for {sponsor}. The Opentechwire newsroom was not involved." (translated vi/id).
- **Affiliate:** neutral `var(--hair-2)` left border, label "Affiliate links" (`var(--muted)`), body "Some links in this story earn Opentechwire a commission. Our recommendations are made independently."
- Exactly ONE sponsored note, at the end (was three boxes: top+middle+bottom; `splitBody` removed). No `$`/AI badge, no position subtitle, no close button. Period.
- Header carries plain-text `Deep Dive` / `Paid Partner` kickers; cards carry `SponsoredKicker` (`apps/web/src/components/sponsored-kicker.tsx`).

## i18n

Article **body stays in source language**. Chrome (byline, pillar chip, paywall, save / share labels, related-row header) is localised via `t(en, vi, id)`.

Dates use `fmtDateL(iso, lang)`.

## Key Source Files (to come)

- `apps/web/src/app/(reader)/[pillar]/[[...slug]]/page.tsx` — dynamic article + listing
- `apps/web/src/app/(reader)/_components/article-body.tsx` — RSC body renderer
- `packages/ui/src/disclosure-box.tsx` — exports `DisclosureNote` (end-of-article note; replaced `DisclosureBox` 05-11-26)
- `apps/web/src/lib/paywall.ts` — meter increment, threshold check, nudge state
- `apps/web/src/lib/og.ts` — OG image generation (Vercel OG)

## Related Context

- `process/context/database/all-database.md` — article schema, `lockedFields`, `origin`
- `process/context/integrations/all-integrations.md` — Engine ↔ Payload contract
- `process/context/uxui/all-uxui.md` — disclosure note primitive, type scale
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
