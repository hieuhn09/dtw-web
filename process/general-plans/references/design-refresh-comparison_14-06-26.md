# Design Refresh — New Bundle vs Current Production (Comparison Report)

Generated: 2026-06-14 · Source: Claude Design handoff `m5iR9-ug9P9T79dZEbP9HA` (overwrote `design/`)
Method: 26-agent read-only workflow (`dtw-design-diff`) — 2 intent agents (4 transcripts) + 23 surface comparisons + 1 synthesis. Raw data: `design-refresh-diff_14-06-26.json`.

## What the new design changes (big picture)

A coherent **brand refresh** + several **new pages**, mixing safe parity work with **decision-gated invariant conflicts**.

- **Foundation (tokens/type):** new tokens `--banner #1B2A52/#16223C`, `--brand-navy #1B2A52/#E2E8F0`, `--amber #F59E0B`, `--brand-amber #D4623C`; `--paper` lightened `#FAF8F2 → #FDFCF8`; all six pillar colors re-toned to a muted earthy set; **editorial typeface swapped Source Serif 4 → Schibsted Grotesk** (variable sans).
- **Navy banners:** all large black banners (Asia Spotlight, Newsletter CTA, About hero, Awards hero, cookie banner) → brand-navy with fixed cream text (fixes a dark-mode inversion bug).
- **AI disclosure:** design **correctly removes** the AI-ASSISTED badge + `kind="ai"` boxes (production is currently OUT of compliance with invariant #5 — still renders them).
- **New pages:** `/advertise`, `/contact`, `/press`, `/legal/[slug]`, `/about/newsroom`, plus a full `/studio` rebuild — all already linked from `footer.tsx` and currently 404.
- **asia → latest** pillar rename (CMS data migration, not code-only).
- Cover-art text labels removed + desaturated; Awards medallion removed; account "Upgrade to Pro" removed; newsletters 6 → 8.

## Decision-gated invariant conflicts (BLOCK code)

| # | Conflict | Production now | Design wants | Needs |
|---|---|---|---|---|
| #11 | Header logo badge | Wordmark-only (compliant) | Navy DTW monogram + lowercase `dailytechwire` + pulse-dot (ships `dtw-logo-primary.svg`) | Product sign-off + amend #11 |
| #7 | Coral accent | `#E04E1F` (pinned) | Soften to `#D4623C` site-wide | Product sign-off + amend #7/uxui |
| typeface | Editorial font | Source Serif 4 (serif) | Schibsted Grotesk (sans) | Confirm — changes whole voice |
| org name | Parent org | "Asia Press Corporation" (canonical) | "Asia Press Centre Group (APCG)" | Confirm — context warns against invented org facts |
| #13 | Awards hero | Shimmer hero (compliant) | Calmer "Launching next year" (no shimmer) | Sign-off or reconcile #13 |
| #12 | Footer compliance | GDPR · PDPA · Nghị định 13 | Drops Nghị định 13 (VN) | Legal confirm |
| #8 | asia→latest | `asia` pillar | rename/aggregate `latest` | CMS migration, not code-only |
| #4 | Paywall "3" | hardcoded | still hardcoded in design | track — must be CMS-configurable |

## Recommended phase order

0. **Foundation** — tokens, `--paper`, pillar palette, typeface (gated: accent, typeface)
1. **Invariant #5 fix** — remove AI-assisted inline disclosure (overdue; design agrees)
2. **Global chrome** — header/footer/section rules/ui primitives (gated: header logo)
3. **Homepage** — navy banners, remove awards medallion, newsletter 8, weights
4. **Article & pillar** — localize chrome, navy borders, copy, weights
5. **Dashboards** — i18n chrome, navy header, polish (gated: methodology/sponsor removal)
6. **Secondary pages** — about/trust/awards/account/newsletters/cover-art/icons/effects
7. **New pages** — /advertise, /contact, /press, /legal/[slug], /about/newsroom, /studio rebuild
8. **asia → latest** — CMS data migration + code sync (highest risk, last, gated)

## Open questions (full list)

See the 17 open questions and per-surface findings in `design-refresh-diff_14-06-26.json` (`plan.openQuestions`, `compare[]`). Foundation-blocking ones: header logo (#11), accent (#7), typeface, org name. Phase-local ones: awards shimmer (#13), email domain, newsletter count, asia→latest shape, dashboards methodology/sponsor, affiliate disclosure, dashboards live-copy, sponsored strip, ticker tape, paywall threshold, legal-copy promises, about transparency, trust i18n architecture.

## Notes

- Safe/non-gated parity work (navy banners via new tokens, AI-disclosure removal, weight softening, cover-art label removal, awards medallion removal, account Pro-CTA removal, icon additions) can proceed immediately once foundation tokens land.
- The four new-page routes are HIGH priority because footer already links them (live 404s).
- `aiAssisted` field stays on the Article model — only inline surfacing is removed.
- Do NOT port the design's AI-variant localization or the APCG org-name onto individual surfaces.
