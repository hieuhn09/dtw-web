# about-trust

<!-- Part of dtw-web -->

## Scope

The trust-and-transparency surface — six static pages that exist because editorial integrity is the product, not a footnote.

- `/about` — Asia Press Centre Group (APCG) (parent organisation), Editor-in-Chief, mission & values, ownership & funding
- `/trust/editorial-standards`
- `/trust/ai-disclosure`
- `/trust/corrections` — public log of every correction
- `/trust/transparency` — quarterly transparency report (auto-generated, Phase 2)
- `/trust/sponsored-affiliate-policy`

These pages are linked from the header utility strip + footer. They convert reader trust into subscribe intent — they need to look ceremonial without looking corporate-bloated.

Does NOT cover: editorial workflow inside CMS (`cms/`), individual article disclosure boxes (`articles/`).

## /about page composition (current state — do not regress)

The About page went through extensive iteration in `design/chats/chat1.md`. The current settled state:

### Hero (dark)

- Kicker: "About · Asia Press Centre Group (APCG)"
- Big serif title + dek
- Stats grid (count-up): **2023** (founded), **8** (publications), **210+** (journalists across the group), **68%** (revenue from readers), **100%** (independent)
- Note: "2023" must render without a comma (`toLocaleString` off for that one stat — design fix)

### Who we are

- Asia Press Centre Group (APCG), **independent newsroom from Singapore**, founded **2023**
- Operates **8 publications** across Asian beats (intentionally **not named** — the design iteration removed the specific publication titles per user instruction; do not reintroduce names)
- Sole / private ownership + employees; **no state or platform ownership**
- No fake / unverifiable claims (no "210 staff" specifics in text, no fake awards, no fake memberships)

### Mission & values

- Tagline: "Explain Asia to itself, and to the world that depends on it."
- 4 values: Accuracy first / Independence / Transparency / Service to readers

### Editor-in-Chief

- **Cheryl Tan** — name chosen as a placeholder
- Brief role description ONLY — **do NOT reintroduce fabricated career history**. Earlier drafts had Reuters / Pulitzer / Nieman / LSE / NUS claims that the user explicitly rejected as "fake / verifiable" — keep them removed
- No contact line, no Signal availability, no author-page link (those were removed per user instruction)

### Editorial leadership

- Anonymized masthead (no specific past employers)
- 5 roles (Managing Editor, Executive Editor, Standards / Ombuds, two desk editors)

### Ownership & funding

- Cap table chart (founders / ESOP / family-office LPs / treasury — no >18% single shareholder)
- Revenue bar (Pro / Newsletter / Studio / Research / Affiliate) — current targets, not actuals
- Tagline below the chart: "**Editorially independent · Reader-funded revenue**" — these two phrases sit on the same line (user request)

### Editorial framework

- 5 link cards: Editorial Standards / AI Disclosure / Corrections / Transparency / Sponsored Policy
- Each card leads to the matching `/trust/*` page

### Tip line (dark)

- `tips@dailytechwire.com`
- Signal: available on request
- SecureDrop
- Corrections: `corrections@dailytechwire.com`

### What's NOT on the page (removed during iteration — keep removed)

- Publication name list
- Bureaus list (no offices yet — "we operate from Singapore" is the only geographic claim)
- "5 award-winning publications" line
- "What we promise our readers" + "What we don't do" commitment cards
- "What we cover" beat grid
- Any award badge bar (SOPA / ONA / WAN-IFRA / Pulitzer / IPI / GIJN / RSF / CPJ — all fabricated, all removed)

If a future agent tries to add any of these, surface the rejection from `design/chats/chat1.md` first.

## /trust/corrections (public log)

This page is dynamic — pulled from Payload `Corrections` collection. Format per entry:

- Article title + link
- Date of correction
- What was incorrect, what is now correct
- Editor who signed off

## /trust/transparency

Phase 2. Auto-generated quarterly from `Corrections`, `RevenueBreakdown` (planned), `ReadershipStats` (planned). Y1 placeholder is a single page: "First report drops Q1 2027."

## /trust/sponsored-affiliate-policy

Editorial firewall doc. Lives in Payload CMS as a single rich-text page. Must include:

- What "Paid Partner" means (`var(--sponsored)` band, disclosure box, newsroom not involved)
- What "affiliate" means (icon + tooltip, commission disclosed, redirect tracker logs click)
- Why DTW doesn't run mid-article ads or popups

## i18n

Trust pages are translated in chrome (title, section headers, kickers). Body content is editor-translated where the editorial team has translated it; otherwise body stays in source language with a "Translation pending" notice. **Body translation is not via automatic LLM** — editor-approved only.

## Key Source Files (to come)

- `apps/web/src/app/(reader)/about/page.tsx`
- `apps/web/src/app/(reader)/trust/[slug]/page.tsx`
- `apps/web/src/components/about/{hero,stats,who,mission,eic,masthead,ownership,framework,tip-line}.tsx`
- `apps/web/src/lib/transparency/{compute,render}.ts` — Phase 2
- Payload `Corrections` collection + `TrustPages` collection

## Related Context

- `design/chats/chat1.md` — the full iteration history, especially what was rejected
- `process/context/uxui/all-uxui.md` — dark-mode discipline (this page hit the rgba/dark-mode bug repeatedly)
- `process/features/cms/_GUIDE.md` — `Corrections` collection

## Current Status

Status: design complete (in `design/`); not implemented

## Folder Contents

```
process/features/about-trust/
  active/       -- in-progress plans
  completed/    -- archived (initial design iterations live in design/chats/)
  backlog/      -- transparency report auto-gen (Phase 2), masthead photo Q (Y2)
  reports/      -- correction frequency reports
  references/   -- editorial standards source materials, Trust Project / IPI alignment notes
```
