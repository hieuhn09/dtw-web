---
name: note:otw-exclusive-residuals
description: "Residual gaps after the Opentechwire Exclusive section shipped (dtw-web#60, apcg-cms#46)"
date: 20-10-26
feature: none
---

# otw-exclusive residuals (20-10-26)

Source: `process/general-plans/completed/otw-exclusive_20-10-26/`. Shipped and merged; none of these block the feature.

| # | Gap | What proves or fixes it |
|---|---|---|
| R-a | Exclusive chips on account saved / history / queue lists are unproven (needs Postgres plus a Better-Auth session) | Sign in on a preview with a real account, save an exclusive article, check the chip in each list |
| R-b | Sponsored strip chip is unproven because `SponsoredStrip` is mounted nowhere | Prove when the component is mounted, or delete the chip code if it is removed |
| R-c | Deep Dive chip and the band-after-Deep-Dive position were only seen via a local, reverted `SHOW_DEEP_DIVE` flip | Re-check when `SHOW_DEEP_DIVE` is switched on for real |
| R-d | No DOM/component test runner in dtw-web; only pure rules (`exclusive.ts`) are unit tested | Add a component test runner (for example Vitest + Testing Library) and cover chip placement and band selection |
| G-1 | Probes used a throwaway mock Central; real CMS data, the revalidation webhook and production ISR are unproven | After the owner ticks the first real OTW exclusive, check `/exclusive`, the homepage band, chip, RSS and sitemap on production |
| G-2 | Pre-existing: 4 px overflow of `.divider` in the mobile drawer at 390 px (`header.tsx` ~771, `width:100%` plus `margin: 8px 12px`) | Use `width: auto` or `calc(100% - 24px)`; re-check at 390 px |
| H-1 | Harness drift: dtw-web `.claude/skills/vc-generate-plan/scripts/validate-plan-artifact.mjs` title regex lacks the `m` flag, so every plan with YAML frontmatter fails "missing top-level title" (the apcg-cms copy is correct) | Copy the apcg-cms version of the script, or add the `m` flag; run `vc-audit-vc` |
| O-1 | Owner review pending: agent-drafted vi/id strings (band kicker, tagline, empty state, pager, RSS button, Editorial text). The language switcher is hidden today, so readers see EN only | Owner or a native reviewer approves or edits the vi/id strings |
| O-2 | Owner action pending: human check of the new CMS checkbox description in /admin; tick the first real OTW exclusive (the content engine and APCGHub cannot set the flag) | Owner action in /admin |
