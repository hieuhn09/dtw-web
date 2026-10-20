---
iteration: 1
domain: plan
plan: otw-exclusive_PLAN_20-10-26.md
gaps_found: 9
fail_count: 0
concern_count: 9
applied: 9
loop_status: CONTINUE
date: 2026-10-20
---

# PVL iteration 001: otw-exclusive

## Input verdict

First VALIDATE pass: Gate CONDITIONAL, 0 FAIL, 9 CONCERN. Breaking changes and security were PASS. All 9 gaps were in the plan text, not in the approach.

## Gaps and what the plan supplement changed

| # | Gap | Fix applied |
|---|---|---|
| 1 | Neither repo has dependencies installed, but the gates assume they are | New step 0: `pnpm install --frozen-lockfile` in dtw-web and `npm ci` in apcg-cms. If the install is blocked, stop with NEEDS_CONTEXT |
| 2 | The new-hex grep could not see new files, and the on-dark chip adds `#FFFFFF` | Run `git add -N apps packages` before the grep. Allowlist exactly one `#FFFFFF` in `.exclusive-chip--on-dark`; the same literal is already used in `most-read.tsx` |
| 3 | The apcg-cms migration guard could not see new files | Guard is now `git status --porcelain -- src/migrations \| wc -l` = 0 |
| 4 | Probe P2 expected 308, but `redirect()` returns 307 | P2 now accepts 307 or 308 with `Location: /exclusive` |
| 5 | Chip position was not defined on the featured, related-row and pillar-grid cards | Featured card: chip goes in the kicker row. Related-row and pillar-grid cards: PillarTag and chip sit in a flex row. On cards the chip is a span, never a nested link |
| 6 | Some surfaces cannot be observed live: the Sponsored strip, Deep Dive and account lists | Named as CONDITIONAL residuals with a backlog stub. The probe may flip `SHOW_DEEP_DIVE` locally if the change is never committed |
| 7 | Probe setup had no placeholder `DATABASE_URL` and no list of what the mock serves | Added the env list with placeholders only, and the mock routes, checked against `central-api.ts` |
| 8 | The N/A list missed three files that the `<article` grep finds | Added `best-of-reviews.tsx`, `legal/[slug]/page.tsx` and `trust-content.tsx`, each with its reason |
| 9 | The apcg-cms comment to reword spans lines 380-381 | Touchpoint now says 380-381 and 389-390, with no other line changes |

## Next

Run vc-validate-agent again from V1 on the supplemented plan.
