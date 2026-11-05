# Disclosure redesign (Opentechwire) — PLAN

**Date**: 05-11-26
**Complexity**: SIMPLE (one session, ~12 files, no schema/API)
**Status**: 🧪 TESTING (05-11-26) — merged-pending-live-verification: PR #68 merged to main by owner decision before the visual check; Fully-Automated gates green; Agent-Probe rows (AC1-AC6) + owner confirmation against `mockup-otw.png` on the live site still pending. Plan stays in `active/` until then.
**Feature**: general (articles surface; `process/features/articles/_GUIDE.md` updated)
**Branch**: `claude/eager-hamilton-4wz5cf` (PR from/into it)
**Primary execute anchor**: this file.
**Spec (authoritative, owner-approved 05-11-26):** `process/general-plans/active/disclosure-redesign_05-11-26/disclosure-redesign_SPEC_05-11-26.md` (local copy) · mockup `mockup-otw.png`, exact mockup CSS `mockup-page.html` (same task folder; copied from the ephemeral session scratchpad 05-11-26 by VALIDATE). Link these in the PR description.

## Overview / Goal
Replace the loud sponsored/affiliate disclosure UI with the shared quiet pattern:
- A. Header kickers: plain-text `Deep Dive` and `Paid Partner` (NO `· {sponsor}` suffix in the header; sponsor name lives in the end-note label and on cards), both `var(--muted)` (not `--muted-2`, which is ≈3.3:1 and fails AA), no chips, no hardcoded hex.
- B. One end-of-article note component (sponsored, then affiliate), placed after the body. OTW keeps `var(--sponsored)` as the sponsored note background.
- C. Small `Paid Partner · {sponsor}` kicker on primary cards/list rows, color `var(--muted)` (cross-site decision: every "Paid Partner" label, header and cards, uses `--muted`).
- Sponsored disclosure appears EXACTLY ONCE (end), non-dismissable. **Owner decision changes invariant #5.**

## Scope
In: files listed in Touchpoints. Out (follow-up only): homepage `SponsoredStrip` / `DeepDive` / `BestOfReviews` bands, `getDeepDive` wasted fetch, `/trust/ai` copy, AI display, CMS, `payload-types.ts:363` stale generated comment (note only, regenerate later).

## Touchpoints (verified 05-11-26)
| File | Lines | Change |
|---|---|---|
| `packages/ui/src/disclosure-box.tsx` | 1-113 | Rewrite into `DisclosureNote` (kind `"sponsored" \| "affiliate"`, `label`, `body` props, `<aside>`). Remove `$` icon, `#E0B900`, `position`/reminder suffix, dead `kind="ai"` branch. Styles per spec B (tokens only: `--accent`, `--ink`, `--muted`, `--hair-2`, `--sponsored`). Label color = `color-mix(in oklab, var(--accent) 65%, var(--ink))` (≥4.5:1 on `--sponsored` in light and dark); NOT raw `var(--accent-ink)` (≈2.4:1 on dark `--sponsored`, no dark override). Never edit `--accent-ink` globally (13 other uses). Doc comment states new invariant #5. Keep file name to limit churn. |
| `packages/ui/src/index.ts` | 6-10 | Export `DisclosureNote`, `DisclosureNoteProps`, `DisclosureNoteKind`; drop `DisclosureBox`, `DisclosurePosition`, `DisclosureKind` (only consumer is article-body; verified by grep). |
| `apps/web/src/components/article/article-body.tsx` | 4, 92-107, 119-185 | Delete `splitBody` and `SponsoredBox`; remove the now-unused `article` prop from `ArticleBody`'s props type/signature (empty-body branch keeps only the italic placeholder); render single `RichText` with full body; no disclosure inside the body component (note moves to article-content so it sits after the body, ahead of affiliate). Remove `DisclosureBox` import. |
| `apps/web/src/components/article/article-content.tsx` | 145-177 | Replace DEEP DIVE chip + PAID PARTNER chip with text kicker spans in the existing header row (`mono`, 10px, uppercase, same letter-spacing as section label, `·` separators between kickers, color `var(--muted)`). Keep `t(en,vi,id)` strings: "Deep Dive"/"Phân tích sâu"/"Analisis mendalam" (uppercase via CSS), "Paid Partner"/"Đối tác trả phí"/"Mitra Berbayar". NO sponsor suffix in the header. |
| `apps/web/src/components/article/article-content.tsx` | 327 | Change `<ArticleBody body={body} article={article} />` to `<ArticleBody body={body} />` (prop removed). |
| `apps/web/src/components/article/article-content.tsx` | 326-328 (after `<ArticleBody>`) | Render `<DisclosureNote kind="sponsored">` when `article.sponsored`, with translated label + existing translated body copy updated to spec ("Produced by OTW Studio for {sponsor}. The Opentechwire newsroom was not involved." / no-sponsor variant; vi/id translations rewritten to match). Wrap in a container matching body column (`maxWidth: 680, margin: "22px auto"`). Render regardless of `hitPaywall` (sponsored articles do not hit the paywall, line ~70, but keep unconditional so the disclosure can never vanish). |
| `apps/web/src/components/article/article-content.tsx` | 338-375 | Replace affiliate band with `<DisclosureNote kind="affiliate">` placed directly after the sponsored note (move up, before ShareBar). Label "Affiliate links" (+vi/id), body "Some links in this story earn Opentechwire a commission. Our recommendations are made independently." (+vi/id). |
| `apps/web/src/components/pillar/pillar-content.tsx` | ~212, ~260 | Card label C: above title, `{a.sponsored && <span ...>Paid Partner · {sponsor}</span>}` in `var(--muted)` kicker style (sponsor suffix only when non-empty). Implement as a tiny shared `SponsoredKicker` in `apps/web/src/components/sponsored-kicker.tsx` (translated via `useT`/existing t helper) to avoid duplication. |
| `apps/web/src/components/home/pillar-showcase.tsx` | ~114-119 (card body, before `<h4>` title) | Mount `SponsoredKicker` above the title (own line, `marginBottom: 6`, next to the existing `ExclusiveChip` block). Sponsored stories reach the homepage here (Latest band uses unfiltered `articles`). |
| `apps/web/src/components/home/home-hero.tsx` | — | NOT touched: `heroPool` filters sponsored out (`(reader)/page.tsx:109`), so hero mounts are dropped. |
| `apps/web/src/components/article/related-row.tsx` | ~63 | Same `SponsoredKicker`. |
| `apps/web/src/app/(reader)/trust/[slug]/trust-content.tsx` | ~300-302, ~328-330 (+vi line) | Sponsored: "a yellow background disclosure note at the end of the article and a 'Paid Partner' label at the top; it cannot be switched off" (en/vi/id). Affiliate: "a note at the end of the article" — remove `$` icon + tooltip claim (en/vi/id). Line 239 (`/trust/ai`) out of scope. |
| `apps/web/src/app/(reader)/studio/page.tsx` | ~51-53 | Replace "disclosure at the top, middle, and end" with "a 'Paid Partner' label at the top and a disclosure note at the end" (all 3 langs; yellow note stays true for OTW). |
| `apps/web/src/app/(reader)/advertise/page.tsx` | grep | Checked: no top/middle/bottom promise. EXECUTE re-greps `-i "middle\|top, middle\|yellow"`; edit only if found. |
| `process/context/all-context.md` | 26 | "affiliate links (icon + disclosure tooltip)… Disclosure boxes on sponsored articles…" → affiliate = end-of-article note; sponsored = one end-of-article note, non-dismissable (owner decision 05-11-26). Keep `Paid Partner` + `#FEF3C7` mention only if still accurate (it is: `--sponsored` value). |
| `process/context/all-context.md` | 137 (invariant #5) | Rewrite: "Sponsored disclosure appears EXACTLY ONCE, as a note at the END of the article body (background `var(--sponsored)`), plus a plain-text 'Paid Partner' kicker in the header; it cannot be dismissed. Changed 05-11-26 — owner decision (was top+middle+bottom)." Keep AI sentence + known gap. Affiliate: end-of-article note. |
| `process/context/uxui/all-uxui.md` | 192-195 | Update DisclosureBox spec → DisclosureNote (kinds, tokens, single end placement, date 05-11-26, owner decision). Tokens table lines 80/99 unchanged. |
| `process/context/integrations/all-integrations.md` | 136 | "affiliate link icon + tooltip" → "end-of-article affiliate note (owner decision 05-11-26)". |
| `process/features/articles/_GUIDE.md` | 17-19 (+bottom box line) | Article anatomy: remove top/middle boxes; add header kicker + end note. |
| `process/features/articles/_GUIDE.md` | 48-58 | Rewrite the "Disclosure boxes" block → "Disclosure note": `DisclosureNote` kinds sponsored/affiliate, single end placement, `--sponsored` bg + accent left border, label color-mix, no `$`/AI badge, no position/reminder, no close button; owner decision 05-11-26. |
| `process/features/articles/_GUIDE.md` | 70 | Path → `packages/ui/src/disclosure-box.tsx` (exports `DisclosureNote`). |
| `process/features/about-trust/_GUIDE.md` | 99-100 | "disclosure box" → "end-of-article disclosure note"; affiliate "icon + tooltip" → "end-of-article note". |

## Public Contracts
- `@dtw/ui` export change: `DisclosureBox` → `DisclosureNote` (breaking for internal consumers only; sole consumer `article-body.tsx`). No API/CMS/schema change. `ArticleView` fields (`sponsored`, `sponsor`, `deepDive`, `affiliate`) unchanged.

## Blast Radius
- Shared package `packages/ui` — consumers grep: only `apps/web/src/components/article/article-body.tsx`. EXECUTE re-runs `grep -rn "DisclosureBox\|DisclosurePosition" apps packages --include=*.ts*` must return 0 after change.
- Article page rendering (every article; non-sponsored path changes only by removing split → single RichText, output identical).
- Card components (render-only, guarded by `sponsored`).
- Trust/studio copy; process docs.
- NOT touched: homepage sponsored/deep-dive/best-of bands, `--sponsored-border` token (still used by AI leaderboard).

## Implementation Checklist
- [x] 1. Rewrite `packages/ui/src/disclosure-box.tsx` → `DisclosureNote` per spec B; update `packages/ui/src/index.ts` exports.
- [x] 2. Simplify `article-body.tsx`: drop `splitBody`, `SponsoredBox`, import, and the unused `article` prop; single `RichText`. Update the call at `article-content.tsx:327` to `<ArticleBody body={body} />`.
- [x] 3. `article-content.tsx` header: replace two chips with text kickers `Deep Dive` / `Paid Partner` (no sponsor suffix), `var(--muted)` (translations kept).
- [x] 4. `article-content.tsx`: insert sponsored note after `<ArticleBody>`; replace affiliate band with affiliate note directly after it; remove old band.
- [x] 0. BEFORE step 1: capture lint baseline `pnpm --filter web lint > "$SCRATCH/lint-baseline.txt" 2>&1 || true` (scratchpad, not committed).
- [x] 5. Add `apps/web/src/components/sponsored-kicker.tsx` (color `var(--muted)`); mount in pillar-content (2), pillar-showcase (1), related-row (1). Do NOT mount in home-hero.
- [x] 6. Update trust-content sponsored + affiliate copy (en/vi/id); studio page copy; re-grep advertise.
- [x] 7. Update invariant #5 docs (date 05-11-26, "owner decision"): `all-context.md:26` and `:137`, `uxui/all-uxui.md:192-195`, `integrations/all-integrations.md:136`, `articles/_GUIDE.md:17-19`, `:48-58`, `:70`, `about-trust/_GUIDE.md:99-100`.
- [x] 8. Run the 4 grep guards from the Verification Evidence fenced block (expected 0 / 0 / 3 / 0).
- [~] 9. Run verification gates; manual check; commit; push branch; open PR into `claude/eager-hamilton-4wz5cf` (or PR from it to main, per owner — EXECUTE confirms target from git remote state).

## Verification Evidence
| Gate / Scenario | Strategy | Proves SPEC criterion |
|---|---|---|
| `pnpm --filter web typecheck` (+ `pnpm --filter @dtw/ui typecheck` if script exists) exits 0 | Fully-Automated | Export rename has no dangling consumers |
| `pnpm --filter web lint`: no new findings vs pre-edit baseline (step 0) | Fully-Automated | Code hygiene |
| `pnpm --filter web build` exits 0 | Fully-Automated | Server/client boundary intact |
| `pnpm --filter web test:exclusive && pnpm --filter web test:single-home` pass (regression, card/chip area touched) | Fully-Automated | No regression in chip/listing helpers |
| 4 grep guards (block below) return 0 / 0 / 3 / 0 | Fully-Automated | Remove list (top/middle box, $ icon, hardcoded hex, reminder suffix); copy + docs (AC7) |
| Manual: sponsored article (light + dark) shows header `PAID PARTNER` text only (no sponsor), `--muted`, no chip; note label readable (≥4.5:1) in dark; exactly ONE note at end, yellow `--sponsored` bg, accent left border, no close control | Agent-Probe (browser) | Owner decisions 1, 2, 4; components A, B |
| Manual: sponsored + affiliate article — sponsored note then affiliate note, neutral border; Deep Dive kicker muted | Agent-Probe | Component B order, A |
| Manual: non-sponsored article body renders fully, no notes | Agent-Probe | No regression from split removal |
| Manual: `/vi` and `/id` chrome strings translated | Agent-Probe | i18n rule (invariant #10) |
| Manual: pillar page / homepage pillar showcase (Latest band) / related row show `PAID PARTNER · X` on sponsored card only | Agent-Probe | Component C |
| Manual: `/trust/sponsored`, `/studio` copy matches new behaviour | Agent-Probe | Copy reconcile |

Gate commands (exact; copy from here, not from the table). Run from `/home/user/dtw-web`:

```bash
pnpm install --frozen-lockfile
pnpm --filter web lint > "$SCRATCH/lint-baseline.txt" 2>&1 || true   # BEFORE step 1
pnpm typecheck
pnpm --filter web lint                                               # diff vs baseline: no new findings
pnpm --filter web build
pnpm --filter web test:exclusive && pnpm --filter web test:single-home
# code guard 1 -> expect 0
grep -rnE 'DisclosureBox|DisclosurePosition|splitBody|reminder \(' apps/web/src packages/ui/src | wc -l
# code guard 2 -> expect 0
grep -nE '#E0B900|#FEF3C7|#7A5800' apps/web/src/components/article/article-content.tsx packages/ui/src/disclosure-box.tsx | wc -l
# copy guard -> expect EXACTLY 3, all trust-content.tsx lines of the /trust/ai block
grep -niE 'top, middle|top/middle|đầu/giữa|đầu, giữa|giữa và cuối|atas/tengah|awal, tengah|atas, tengah|ikon \$|biểu tượng \$|\$ icon' 'apps/web/src/app/(reader)/trust/[slug]/trust-content.tsx' 'apps/web/src/app/(reader)/studio/page.tsx'
# doc guard -> expect 0
grep -niE 'top \+ middle|top, middle|top disclosure box|middle disclosure box|icon \+ (disclosure )?tooltip|reminder \(' process/context/all-context.md process/context/uxui/all-uxui.md process/context/integrations/all-integrations.md process/features/articles/_GUIDE.md process/features/about-trust/_GUIDE.md | wc -l
```

Known gaps: no automated render test for article page (no RTL harness in repo) — accepted; recorded in Test Infra notes, behaviour proven by Agent-Probe, not Known-Gap.

## Acceptance Criteria
- AC1 Sponsored article shows sponsored disclosure exactly once, after the body, background `var(--sponsored)`, non-dismissable — proven by: manual sponsored-article probe + grep guard; strategy: Agent-Probe.
- AC2 Header shows plain-text `Deep Dive` / `Paid Partner` kickers (no sponsor suffix, `var(--muted)`), no chip, no hardcoded hex — proven by: grep guard + manual probe; strategy: Fully-Automated (grep) + Agent-Probe.
- AC3 Affiliate article shows one neutral-border note after the sponsored note; no `$` icon — proven by: manual probe; strategy: Agent-Probe.
- AC4 Sponsored cards (pillar page, homepage pillar showcase, related) show `Paid Partner · {sponsor}` kicker — proven by: manual probe; strategy: Agent-Probe.
- AC5 Dark mode readable via CSS vars: note label uses `color-mix(in oklab, var(--accent) 65%, var(--ink))` (≥4.5:1 on `--sponsored` light + dark), never raw `--accent-ink`; `--accent-ink` not edited globally — proven by: manual dark-mode contrast probe + `grep -n 'accent-ink' packages/ui/src/disclosure-box.tsx` = 0; strategy: Agent-Probe + Fully-Automated.
- AC6 vi/id chrome translated — proven by: manual `/vi`, `/id` probe; strategy: Agent-Probe.
- AC7 Trust/studio copy and invariant #5 docs match new behaviour (dated 05-11-26, owner decision) — proven by: copy guard = 3 (only `/trust/ai` lines) and doc guard = 0 (Verification Evidence block); strategy: Fully-Automated.
- AC8 typecheck/build/node tests green, lint no new findings vs baseline; strategy: Fully-Automated.

## Phase Completion Rules
- `🔨 CODE DONE` when checklist 1-8 done and Fully-Automated gates green.
- `✅ VERIFIED` only after Agent-Probe rows pass on a Preview deploy (light + dark, en/vi/id) and owner confirms the look matches `otw.png`.

## Risks
- Removing `splitBody` could change rendering if body nodes depended on being split — low; RichText renders full state.
- Sponsored articles behind paywall: note rendered outside paywall branch, so always visible.
- Tokens verified in `apps/web/src/app/globals.css`: `--hair-2` (17/63), `--accent-ink` (21), `--sponsored` (26/64) exist; `--faint` and `--line-strong` do NOT → use `--muted` and `--hair-2`. No new tokens.
Rollback: single PR revert.

## Dependencies
None (no CMS/schema). Parallel sibling work in other site repos is independent.

## Follow-ups (not this PR)
- Homepage SponsoredStrip / DeepDive / BestOf dead bands + `getDeepDive` wasted fetch.
- Regenerate `payload-types.ts` (stale comment line 363).
- `/trust/ai` copy (line 239) still claims top/middle/bottom AI label.

## Test Infra Improvement Notes
- No component render test harness in `apps/web` (only `tsx --test` node tests); article-page disclosure count can't be asserted automatically. Candidate: a pure helper or RTL setup later.

## Resume and Execution Handoff
- Selected plan: `/home/user/dtw-web/process/general-plans/active/disclosure-redesign_05-11-26/disclosure-redesign_PLAN_05-11-26.md`
- Work on branch `claude/eager-hamilton-4wz5cf`; checklist order 1→9; steps 1-2 must land together (export rename).
- Resume: check grep guards (step 8) to see which steps remain.
- Next: VALIDATE, then EXECUTE.

## Validate Contract

Status: PASS
Date: 05-11-26
date: 2026-11-05
generated-by: outer-pvl
supersedes: 2026-11-05 (outer-pvl) — first-pass CONDITIONAL replaced after PVL supplement cycle 1; outer PVL has current evidence

Parallel strategy: sequential
Rationale: score 2/7 (S6 `@dtw/ui` export rename, S7 ~13 files). One render path with ordered steps (1-2 land together), so one vc-execute-agent (opus) is enough.

Evidence base (re-checked 05-11-26 on `claude/eager-hamilton-4wz5cf` @ `f23fdae`, worktree clean except this task folder):
- Anchors confirmed: `index.ts` 5-10 (DisclosureBox exports); `article-body.tsx` 4 (import), 100 (`splitBody`), 123-146 (`SponsoredBox`), 148-185 (`ArticleBody` with `article` prop); `article-content.tsx` 66-71 (`hitPaywall` excludes sponsored), 145-177 (two chips, hex `#FEF3C7/#7A5800/#E0B900`), 327 (sole `ArticleBody` call), 330-336 (ShareBar/Paywall after body), 338-375 (affiliate band with `$`); `pillar-content.tsx` 212/260, `related-row.tsx` 63, `pillar-showcase.tsx` 115-120 (ExclusiveChip block before `<h4>`); all three card files already import `useT` from `@/lib/i18n`; `trust-content.tsx` 300-302 / 328-330 (in scope), 239-241 (`/trust/ai`, out of scope); `studio/page.tsx` 51-53; `advertise/page.tsx` has no `middle`/`yellow` match.
- Hero drop is correct: `(reader)/page.tsx:109` `heroPool = articles.filter(a => !a.sponsored)`; Latest band (`:133-135`) and `byPillar` use unfiltered `articles`, rendered by `PillarShowcase` (`:197`). Lead falls back to `articles[0]` only when `heroPool` is empty (edge case, accepted).
- Doc anchors confirmed: `all-context.md` 26 and 137; `uxui/all-uxui.md` 190-196 (heading `### DisclosureBox` at 190); `integrations/all-integrations.md` 136; `articles/_GUIDE.md` 17, 19, 21, 50-58, 70; `about-trust/_GUIDE.md` 99-100.
- Grep guard baselines reproduced today: code guard 1 = 16, code guard 2 = 4, copy guard = 12 (3 of them are `/trust/ai` 239-241), doc guard = 8. Targets 0 / 0 / 3 / 0 are reachable by the listed edits alone. `grep -n accent-ink packages/ui/src/disclosure-box.tsx` = 0 today.
- Contrast recomputed (OKLab mix, WCAG 2.x, tokens from `globals.css`): label `color-mix(in oklab, var(--accent) 65%, var(--ink))` = #89452E light → 6.37:1 on `--sponsored` #FEF3C7; #DE937D dark → 5.44:1 on #3B2E0A. Note body `--muted` on `--sponsored`: 6.12 light / 5.18 dark. Header kicker `--muted` on `--paper`: 6.64 / 6.96. Raw `--accent-ink` in dark = 2.45 (rejected, as planned). All required text ≥4.5:1.
- `validate-plan-artifact.mjs`: 0 FAIL, 2 advisory warnings.

Test gates (C3 5-column table):

| criterion id | behavior | strategy | proving test | gap-resolution |
|---|---|---|---|---|
| AC8 | Export rename leaves no dangling consumer; web + ui compile | Fully-Automated | `pnpm install --frozen-lockfile && pnpm typecheck` exits 0 | A |

Failing stub:
test("should compile web and @dtw/ui after DisclosureBox -> DisclosureNote rename", () => { throw new Error("NOT IMPLEMENTED — TDD stub: pnpm typecheck green after rename") })

| AC8 | No new lint findings | Fully-Automated | `pnpm --filter web lint` diffed against the baseline captured BEFORE step 1 | A |

Failing stub:
test("should add no new lint findings vs pre-edit baseline", () => { throw new Error("NOT IMPLEMENTED — TDD stub: lint diff vs baseline empty") })

| AC8 | Server/client boundary and routes build | Fully-Automated | `pnpm --filter web build` exits 0 (placeholder env per `tests/all-tests.md` if needed) | A |

Failing stub:
test("should build apps/web", () => { throw new Error("NOT IMPLEMENTED — TDD stub: next build green") })

| AC8 | Listing/chip helpers unchanged | Fully-Automated | `pnpm --filter web test:exclusive && pnpm --filter web test:single-home` pass | A |

Failing stub:
test("should keep exclusive + single-home helper suites green", () => { throw new Error("NOT IMPLEMENTED — TDD stub: regression suites pass") })

| AC1, AC2, AC5 | Old box, split logic, reminder, hardcoded hex and raw `--accent-ink` are gone | Fully-Automated | code guard 1 = 0, code guard 2 = 0, accent-ink guard = 0 (fenced block below) | B |

Failing stub:
test("should have no DisclosureBox/splitBody/reminder/hardcoded hex/raw accent-ink left", () => { throw new Error("NOT IMPLEMENTED — TDD stub: code guards return 0") })

| AC7 | Public copy no longer promises top/middle/end or the $ icon (en/vi/id) | Fully-Automated | copy guard returns EXACTLY 3 lines, all `trust-content.tsx` 239-241 (`/trust/ai`) | B |

Failing stub:
test("should leave only the 3 out-of-scope /trust/ai lines matching old disclosure promises", () => { throw new Error("NOT IMPLEMENTED — TDD stub: copy guard = 3 lines, all /trust/ai") })

| AC7 | Invariant #5 docs restate the single-end-note rule | Fully-Automated | doc guard = 0 | B |

Failing stub:
test("should have no stale top/middle or icon+tooltip disclosure wording in context docs", () => { throw new Error("NOT IMPLEMENTED — TDD stub: doc guard returns 0") })

| AC1, AC2, AC3, AC5 | Sponsored (+affiliate) article: plain-text header kickers (`Paid Partner` with no sponsor), exactly ONE sponsored note after the body (`--sponsored` bg, accent left border, no close control), affiliate note after it (neutral border), text ≥4.5:1 light AND dark | Agent-Probe | Mock-Central runtime probe (`tests/all-tests.md` §Runtime Probe Pattern): sponsored+deepDive+affiliate article and a plain article; screenshots light + dark; DOM count of note `aside` = 2 (sponsored first) / 0 on the plain article | A |
| AC6 | vi/id chrome translated (kickers, note labels/bodies, card kicker) | Agent-Probe | Same probe on `/vi` and `/id` (or lang toggle) | A |
| AC4 | `Paid Partner · {sponsor}` kicker on sponsored cards only | Agent-Probe | Same probe: pillar page (featured + list), homepage PillarShowcase incl. Latest band, related row; non-sponsored cards show nothing; hero untouched | A |
| AC1 | Automated (non-probe) assertion that the note renders exactly once | Agent-Probe (residual named) | Proven by the probe DOM count; an automated DOM assertion needs a render harness the repo lacks | D |

Gate commands (copy EXACTLY from here; table cells escape `|`). Run from `/home/user/dtw-web`. Baselines 05-11-26: 16 / 4 / 12 / 8 / 0.

```bash
pnpm install --frozen-lockfile
pnpm --filter web lint > "$SCRATCH/lint-baseline.txt" 2>&1 || true   # BEFORE step 1
pnpm typecheck
pnpm --filter web lint                                               # diff vs baseline: no new findings
pnpm --filter web build
pnpm --filter web test:exclusive && pnpm --filter web test:single-home
# code guard 1 -> expect 0
grep -rnE 'DisclosureBox|DisclosurePosition|splitBody|reminder \(' apps/web/src packages/ui/src | wc -l
# code guard 2 -> expect 0
grep -nE '#E0B900|#FEF3C7|#7A5800' apps/web/src/components/article/article-content.tsx packages/ui/src/disclosure-box.tsx apps/web/src/components/sponsored-kicker.tsx | wc -l
# accent-ink guard -> expect 0
grep -n 'accent-ink' packages/ui/src/disclosure-box.tsx | wc -l
# copy guard -> expect EXACTLY 3, all trust-content.tsx 239-241 (/trust/ai)
grep -niE 'top, middle|top/middle|đầu/giữa|đầu, giữa|giữa và cuối|atas/tengah|awal, tengah|atas, tengah|ikon \$|biểu tượng \$|\$ icon' 'apps/web/src/app/(reader)/trust/[slug]/trust-content.tsx' 'apps/web/src/app/(reader)/studio/page.tsx'
# doc guard -> expect 0
grep -niE 'top \+ middle|top, middle|top disclosure box|middle disclosure box|icon \+ (disclosure )?tooltip|reminder \(' process/context/all-context.md process/context/uxui/all-uxui.md process/context/integrations/all-integrations.md process/features/articles/_GUIDE.md process/features/about-trust/_GUIDE.md | wc -l
```

Legacy line form:
- @dtw/ui + web compile: Fully-automated: `pnpm install --frozen-lockfile && pnpm typecheck`
- lint: Fully-automated: `pnpm --filter web lint` (no new findings vs baseline)
- build: Fully-automated: `pnpm --filter web build`
- regression: Fully-automated: `pnpm --filter web test:exclusive && pnpm --filter web test:single-home`
- code/accent-ink/copy/doc guards: Fully-automated: the five grep commands above
- article page + cards + i18n + dark: agent-probe: mock-Central browser probe, light/dark, en/vi/id
- single-note automated assertion: known-gap: documented (no DOM runner; backlog candidate per Test Infra notes)

Dimension findings:
- Infra fit: PASS — render-only; no schema/CMS/env/runtime surface; `node_modules` absent, install first.
- Test coverage: PASS — gate block is exact, lint uses the baseline rule, copy guard covers en/vi/id, doc guard covers all 5 docs; every developed behaviour has a Fully-Automated or Agent-Probe gate (no Known-Gap-only behaviour).
- Breaking changes: PASS — `@dtw/ui` rename has one consumer (`article-body.tsx`); `ArticleBody` has one caller (`article-content.tsx:327`), updated in the same step; no API/CMS/`ArticleView` change.
- Security surface: PASS — no auth/secret/billing/trust-boundary code. Invariant #5 change is an owner editorial decision, recorded in docs. No evidence pack.
- Section A — shared component: PASS — label color-mix reaches 6.37 / 5.44:1; no global `--accent-ink` edit.
- Section B — article page: PASS — header `Paid Partner` only in `--muted`; `article` prop removed at both ends; note sits after `<ArticleBody>` and before ShareBar/Paywall, so the meter can never hide it.
- Section C — cards: PASS — mounts in pillar-content (2), pillar-showcase (1), related-row (1); home-hero dropped (sponsored filtered from `heroPool`).
- Section D — policy copy: PASS — trust 300-302 / 328-330 and studio 51-53 confirmed; advertise clean; keep "OTW Studio".
- Section E — docs: PASS — all 8 doc-guard hits map to listed touchpoints.

Execute-agent instructions (binding; these supersede the first-pass E1-E6):
- E1 Header kickers: `Deep Dive` and `Paid Partner` only, no sponsor suffix, `var(--muted)`, no chip, no hex.
- E2 Note label: `color-mix(in oklab, var(--accent) 65%, var(--ink))`. Never raw `--accent-ink`; never edit `--accent-ink` globally (13 other uses).
- E3 Remove the `article` prop from `ArticleBody` and from the call at `article-content.tsx:327`; empty-body branch renders only the italic placeholder.
- E4 Mount `SponsoredKicker` in pillar-content (featured ~212 + list ~260), pillar-showcase (~115, own line above `<h4>`, `marginBottom: 6`) and related-row (~63). Do NOT touch `home-hero.tsx`: `heroPool` filters sponsored stories out (`(reader)/page.tsx:109`).
- E5 Doc pass (step 7): also rename the `### DisclosureBox` heading at `uxui/all-uxui.md:190` and the bottom-box line `articles/_GUIDE.md:21`. New wording must not reintroduce doc-guard phrases (write "was top+middle+bottom" without spaces, or "was three boxes").
- E6 Capture the lint baseline in the scratchpad BEFORE step 1; never commit it.
- E7 New vi/id copy must not use "đầu, giữa" / "atas, tengah" style phrasing, or the copy guard will exceed 3.

Open gaps:
- Automated single-note DOM assertion: known-gap (no DOM test runner); gap-resolution D, Test Infra Improvement Notes.
- `/trust/ai` copy (239-241) still promises top/middle/bottom AI labels: out of scope by owner decision; Follow-ups.

### What This Coverage Does NOT Prove
What this coverage does NOT prove:
- `pnpm typecheck`: not visual output, placement or contrast; not RichText runtime with the unsplit body.
- lint / build: not that the note renders, or renders once; not the dark theme.
- `test:exclusive` / `test:single-home`: only pure `src/lib` helpers; nothing in the touched components.
- grep guards: absence of old strings only; not correctness or translation of new copy; vi/id phrasings outside the listed patterns are not caught.
- contrast numbers: computed from token values, not measured in a browser (font smoothing, overlays not included).
- Agent-Probe (mock Central): mock data only; not real Central data, ISR/revalidation, or the Preview deploy the owner signs off on (VERIFIED still needs owner confirmation against `mockup-otw.png`).

Gate: PASS (no FAILs; all 6 first-pass concerns resolved in plan via PVL cycle 1; E4 reconciled to the plan)
Accepted by: n/a (PASS). Prior CONDITIONAL concerns closed: dark-label-contrast, header-kicker-sponsor-suffix, unused-ArticleBody-prop, pillar-showcase-mount, missing-doc-touchpoints, gate precision.

## Execution Log (05-11-26)
- Gates: `pnpm typecheck` 0; lint = baseline (same single pre-existing warning in article-body.tsx, line shifted 78→75); build 0 (placeholder DATABASE_URL/AUTH_DATABASE_URL/BETTER_AUTH_SECRET, as tests/all-tests.md allows; one earlier run hit a transient Google Fonts fetch failure); test:exclusive 9/9, test:single-home 6/6; guards 0 / 0 / 0 / 3 (/trust/ai 239-241) / 0.
- Deviation (within blast radius): `apps/web/src/app/globals.css` comment (line ~617) named `DisclosureBox` and tripped code guard 1; reworded comment only, no CSS change.
- Deviation (minor): header kickers rendered with a `·` separator span before each, 10px mono uppercase `--muted`; card kicker is a `<div>` (own line) rather than inline `<span>`.
- Pending: Agent-Probe rows (mock-Central browser probe light/dark, en/vi/id), owner Preview sign-off. PR #68 already exists; no new PR opened.

## Autonomous Goal Block

SESSION GOAL: Opentechwire disclosure redesign — sponsored disclosure exactly once as an end-of-article note (`--sponsored` bg), plain-text Deep Dive / Paid Partner header kickers, Paid Partner · {sponsor} card kicker, end-of-article affiliate note; docs/copy amended for invariant #5 (owner decision 05-11-26).
Charter + umbrella plan: N/A — single plan (/home/user/dtw-web/process/general-plans/active/disclosure-redesign_05-11-26/disclosure-redesign_PLAN_05-11-26.md)
Autonomy: self-decide reversible steps; hard-stop on irreversible/outward actions not listed here.
Hard stop conditions / safety constraints:
- Do not add AI-assisted UI; do not touch /trust/ai copy, home-hero, homepage SponsoredStrip/DeepDive/BestOf bands, CMS or schema.
- No new tokens and no hardcoded hex in disclosure UI; keep pinned --sponsored; all text ≥4.5:1 in light and dark (color-mix label).
- Sponsored note renders exactly once, after the body, outside the paywall branch, never dismissable.
- Brand casing "Opentechwire"; keep "OTW Studio".
- Do not edit the global --accent-ink token.
- No merge to main without owner confirmation; open the PR only.
Next phase: EXECUTE: /home/user/dtw-web/process/general-plans/active/disclosure-redesign_05-11-26/disclosure-redesign_PLAN_05-11-26.md
Validate contract: inline in plan (## Validate Contract, Gate: PASS, E1-E7)
Execute start: pnpm install --frozen-lockfile; lint baseline; checklist 0→9; gates: pnpm typecheck | lint no new findings | pnpm --filter web build | test:exclusive && test:single-home | grep guards 0/0/0/3/0 | mock-Central probe light/dark en/vi/id | high-risk pack: no

## UPDATE PROCESS summary (05-11-26)
- Closeout classification: WITH_GAPS -> keep in `active/` (TESTING). Archival is blocked by the vacuous-green rule: AC1-AC6 rest on Agent-Probe only (no automated DOM test), so the plan is not archivable until the owner confirms live.
- Merge: owner chose to merge PR #68 before the browser probe; CI typecheck + Vercel Preview build green.
- Invariant #5 text in `process/context/all-context.md` verified consistent with the shipped behaviour (one end note, plain-text kicker, affiliate end note).
- Follow-ups captured: `process/general-plans/backlog/disclosure-redesign-followups_NOTE_05-11-26.md`.
