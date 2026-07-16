# about-trust

<!-- Part of dtw-web -->

## Scope

The trust-and-transparency surface — seven static pages that exist because editorial integrity is the product, not a footnote.

- `/about` — Asia Press Centre Group (APCG) (parent organisation), Editor-in-Chief, mission & values, ownership & funding
- `/newsroom` — inside-the-newsroom detail page. Moved from `/about/newsroom` to top-level `/newsroom` 2026-07-16 (301 redirect in place, see `next.config.ts`). **Still contains known fabricated content** (named bureaus, fabricated EIC career history, 8-person named masthead, beats grid) not yet cleaned up — see `process/features/about-trust/backlog/newsroom-fabricated-content-cleanup_PLAN_16-07-26.md`. Do not treat this page as launch-ready.
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

### What's NOT on the page (removed during iteration — keep removed)

**Note:** removal of the tip line (below) applies to **every** contact/trust surface, present and future — not just `/about`. Root cause of the original regrowth: the user's blanket removal instruction (`chat1.md:457`, "toàn bài") predates `/about/newsroom` (now `/newsroom`), which was born later and re-accumulated the same content pattern independently.

**This is the second confirmed occurrence of the same regrowth mechanism** (tip line here; the Cheryl Tan Reuters/Pulitzer-style career-history draft earlier — see "Editor-in-Chief" above — and its near-identical structural recurrence on `/newsroom`, tracked in `process/features/about-trust/backlog/newsroom-fabricated-content-cleanup_PLAN_16-07-26.md`). A written "keep removed" note did not prevent regrowth once already; do not assume prose alone is sufficient going forward. If the `/newsroom` cleanup slips past launch, add a mechanical grep-based content guard (pattern candidates: `securedrop|onion|8XXX|bureau-chief|guest-lectured|declined paid placements`) as a new step in `.github/workflows/ci.yml` — CI already exists (typecheck-only today), so this does not need to wait for a test runner.

- Publication name list
- Bureaus list (no offices yet — "we operate from Singapore" is the only geographic claim)
- "5 award-winning publications" line
- "What we promise our readers" + "What we don't do" commitment cards
- "What we cover" beat grid
- Any award badge bar (SOPA / ONA / WAN-IFRA / Pulitzer / IPI / GIJN / RSF / CPJ — all fabricated, all removed)
- Tip line / secure-contact banner (`tips@`/`media@`, masked Signal number, unresolvable SecureDrop reference, unbackable source-protection guarantee) — no infrastructure exists to back any of these claims, and Singapore has no shield law (no newspaper rule; CPC s39/s40 permit compelled decryption without judicial approval), so the guarantee is both fabricated track record and an unkeepable promise. Same category as the removed awards/cap table content. Removed [16-07-26].

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

## Key Source Files

- `apps/web/src/app/(reader)/about/page.tsx` — single-file `/about` implementation (not the modular `components/about/*` split originally planned)
- `apps/web/src/app/(reader)/newsroom/page.tsx` — single-file `/newsroom` implementation (moved from `about/newsroom/page.tsx` 2026-07-16)
- `apps/web/src/app/(reader)/trust/[slug]/page.tsx` + `trust-content.tsx`
- `apps/web/src/lib/transparency/{compute,render}.ts` — Phase 2, not yet built
- Payload `Corrections` collection + `TrustPages` collection

## Related Context

- `design/chats/chat1.md` — the full iteration history, especially what was rejected
- `process/context/uxui/all-uxui.md` — dark-mode discipline (this page hit the rgba/dark-mode bug repeatedly)
- `process/features/cms/_GUIDE.md` — `Corrections` collection

## Current Status

Status: `/about`, `/newsroom`, and `/trust/*` are implemented and shipped. Tip-line banner removed and `/about/newsroom` moved to `/newsroom` 2026-07-16 (PR #24, merged to `main`). `/newsroom`'s bureaus / masthead / EIC career-history / beats-grid content is implemented but still fabricated — tracked in `process/features/about-trust/backlog/newsroom-fabricated-content-cleanup_PLAN_16-07-26.md`, priority: before launch.

## Folder Contents

```
process/features/about-trust/
  active/       -- in-progress plans
  completed/    -- archived (initial design iterations live in design/chats/)
  backlog/      -- transparency report auto-gen (Phase 2), masthead photo Q (Y2)
  reports/      -- correction frequency reports
  references/   -- editorial standards source materials, Trust Project / IPI alignment notes
```
