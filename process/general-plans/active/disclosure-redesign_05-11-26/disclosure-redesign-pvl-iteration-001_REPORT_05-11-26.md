---
domain: plan
cycle: 1
date: 2026-11-05
gate_before: CONDITIONAL
gaps_addressed: 6
---
# PVL iteration 001 (OTW disclosure redesign)
1. Note label colour: color-mix(in oklab, var(--accent) 65%, var(--ink)); --accent-ink untouched.
2. Header kicker "Paid Partner" only; all Paid Partner labels --muted.
3. ArticleBody `article` prop removed; caller updated.
4. SponsoredKicker mounted in pillar-showcase.tsx; home-hero mounts dropped.
5. Invariant #5 doc rows added (all-context.md:26, articles/_GUIDE.md, about-trust/_GUIDE.md).
6. Exact gate command block adopted (lint baseline, grep guards 0/0/3/0).
Open: contract E4 still says keep home-hero mounts — reconcile on re-validate.
Next: re-run VALIDATE from V1.
