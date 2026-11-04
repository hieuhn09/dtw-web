---
name: note:vercel-google-fonts-build-flake
description: "Transient next/font/google fetch failures fail Vercel builds; proposal to self-host fonts"
date: 04-11-26
feature: none
---

# Vercel build flake: `next/font/google` fetch (04-11-26)

Found while shipping `otw-lcp-and-indexing` A1 (PR #64). Deferred: not part of that plan.

## Evidence

- 2 of 4 Vercel builds on 04-11-26 failed at the font step: `TypeError: Cannot read properties of null (reading '1')` in `nextFontGoogleFontLoader` (fetch of IBM Plex Sans from Google Fonts returned nothing usable).
- Hit one Preview build (commit `26c2114`) and the first production build of `b4b1e0d`.
- Redeploying the SAME commit succeeded both times (production: `dpl_DRPVWA1FXuhUF2oe9ZZouYoqR2hf`). No code change involved, so the cause is a transient network/Google Fonts fetch error at build time.

## Impact

- A failed build is never promoted, so production stays on the previous good deployment (safe).
- Releases (and merges to `main`) can silently not go live until someone notices and redeploys manually. Cost: delay plus manual toil; risk grows with the number of deploys.

## Proposed fix

Replace the `next/font/google` families in `apps/web/src/app/layout.tsx` (`Schibsted_Grotesk`, `IBM_Plex_Sans`; IBM Plex Mono if present) with `next/font/local`, using committed OFL-licensed WOFF2 files (for example under `apps/web/src/fonts/`), keeping the same `variable` CSS custom properties (`--font-serif-loaded`, `--font-sans-loaded`), `display: "swap"`, and weights (Schibsted variable 400..900; Plex 400/500/600/700), latin subset only. Include the OFL license text next to the files.

## Verification ideas

- `pnpm --filter web build` offline (network blocked to fonts.googleapis.com) succeeds.
- Compare rendered text before/after (same CSS variables, same fallback stack); check CLS stays ~0 and the font preload count does not grow (plan A3 noted ~170 KB fonts, 2 preloads).
- Lighthouse/PSI font-related audits do not regress.

## Alternatives (not chosen yet)

- Leave as is and rely on manual redeploy (cheap, but recurring).
- Retry wrapper around the build (not supported by `next/font/google`).
