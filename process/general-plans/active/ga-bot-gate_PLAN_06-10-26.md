---
name: plan:ga-bot-gate
description: "Gate the GA4 tag against headless and UA-spoofed bots (port of brief-asia-web PR #37)"
date: 06-10-26
feature: analytics
---

# GA bot gate (port) — PLAN 06-10-26

**Type:** SIMPLE port. Inherited validated design: brief-asia-web PR #37 (squash 1846242),
`process/general-plans/active/ga-bot-gate_06-10-26/ga-bot-gate_PLAN_06-10-26.md` and
`ga-bot-audit_FINDINGS_06-10-26.md` in that repo. Detection rules ported verbatim; no new PVL.

## Validate Contract (inherited)
Gate: CONDITIONAL — accepted by the user. Known gaps:
- KG1: no automated DOM test of `AnalyticsGate` (pure `assessClient` is unit-tested).
- KG2: GA init order vs `@next/third-parties` not verified against library source.

Test gates: `pnpm --filter web test:bot-detect` (31 cases), `pnpm --filter web typecheck`,
`pnpm --filter web lint` (no new findings vs baseline: 0 errors, 1 pre-existing warning).

## Touchpoints / Blast Radius
- `apps/web/src/lib/bot-detect.ts` (new, pure, fail-open)
- `apps/web/src/lib/bot-detect.test.ts` (new, node:test via tsx)
- `apps/web/src/components/analytics-gate.tsx` (new client component wrapping GoogleAnalytics)
- `apps/web/src/app/(reader)/layout.tsx` (mount swap; GA_ID logic unchanged)
- `apps/web/package.json` (`test:bot-detect` script; no new deps)

## Implementation Checklist
- [x] Port lib + test + component verbatim
- [x] Swap GA mount to `<AnalyticsGate gaId={GA_ID} />`
- [x] Add test script; gates green, no new lint findings

## Resume and Execution Handoff
Executed on branch `claude/ga-bot-gate`; orchestrator runs independent verification, pushes, opens draft PR.
