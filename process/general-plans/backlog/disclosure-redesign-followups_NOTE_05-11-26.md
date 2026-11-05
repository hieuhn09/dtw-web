---
name: note:disclosure-redesign-followups
description: "Follow-ups after the Opentechwire disclosure redesign (dtw-web#68)"
date: 05-11-26
feature: none
---

# disclosure-redesign follow-ups (05-11-26)

Source: `process/general-plans/active/disclosure-redesign_05-11-26/`. Merged; none block the feature.

| # | Gap | What proves or fixes it |
|---|---|---|
| F1 | `/trust/ai` copy (around line 239) still claims a top/middle/bottom AI label, contradicting invariant #5 | Product decision on AI-disclosure policy, then rewrite the copy; code guard 4 currently counts 3 hits there |
| F2 | Homepage SponsoredStrip / DeepDive / BestOf bands are unmounted dead code; `getDeepDive` fetch is wasted | Delete the bands and the fetch, or mount them; also resolves exclusive residual R-b |
| F3 | `payload-types.ts` stale (comment near line 363) | Regenerate payload types |
| F4 | No DOM test that the sponsored note renders exactly once (apps/web has only `tsx --test` node tests) | Add RTL/render harness or a pure helper test; until then AC1-AC6 rest on browser probe |
| F5 | Browser probe AC1-AC6 (light/dark, en/vi/id) and owner confirmation vs `mockup-otw.png` on live site not done | Run probe on live/Preview; then archive the plan |
