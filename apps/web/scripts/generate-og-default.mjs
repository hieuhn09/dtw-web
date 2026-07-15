// One-off script: rasterizes the branded default OG image (RFC-003 of
// process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md) via
// sharp (already an `apps/web` dependency — imported in payload.config.ts).
// Not part of the Next.js build; the output PNG is committed to the repo as
// a static asset and reused as the fallback `openGraph`/`twitter` image for
// every route that has no per-page image (homepage, pillar pages, and
// hero-less articles).
//
// Run with: `node scripts/generate-og-default.mjs` from `apps/web/`.
//
// Visual brief: navy background (`--banner` #1B2A52), lowercase
// "dailytechwire" wordmark in white plus a terracotta pulse-dot, a
// muted-cream tagline, and a purely geometric (non-photographic) accent of
// overlapping rounded rectangles in terracotta (`--accent` #D4623C) / amber
// (`--amber` #F59E0B) in the right third of the canvas.
//
// Font note: the SVG requests the site's brand faces (Schibsted Grotesk /
// IBM Plex Sans) first. sharp rasterizes SVG via libvips' librsvg backend,
// which resolves font families through the *build machine's* fontconfig —
// neither brand face is guaranteed to be registered there, and embedding a
// font file into a one-off raster script is nontrivial. Per RFC-003's
// explicit allowance, this is acceptable for this one static asset: the
// font-family list below falls back to common system sans-serifs, so
// whatever renders is a substituted system font, not a build failure. This
// substitution (or its absence) should be noted in the PR description.

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(here, "../public/og-default.png");

const WIDTH = 1200;
const HEIGHT = 630;
const BANNER = "#1B2A52";
const ACCENT = "#D4623C";
const AMBER = "#F59E0B";
const FONT_STACK =
  "Schibsted Grotesk, IBM Plex Sans, Segoe UI, Helvetica Neue, Arial, sans-serif";

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="${BANNER}" />

  <!-- Geometric accent: 4 overlapping rounded rectangles, right third of the
       canvas (x approx 760 to 1180), no photography, stock imagery, or faces. -->
  <g>
    <rect x="1010" y="50" width="170" height="170" rx="24" fill="${AMBER}" opacity="0.9" />
    <rect x="820" y="90" width="300" height="300" rx="24" fill="${ACCENT}" opacity="0.85" />
    <rect x="980" y="250" width="200" height="200" rx="24" fill="${AMBER}" opacity="0.7" />
    <rect x="760" y="380" width="360" height="190" rx="24" fill="${ACCENT}" opacity="0.6" />
  </g>

  <!-- Wordmark + pulse-dot: fixed white, since text on banner surfaces never
       uses a paper/ink-derived color-mix (per the Banner text rule). -->
  <circle cx="492" cy="282" r="7" fill="${ACCENT}" />
  <text x="72" y="300" font-family="${FONT_STACK}" font-size="56" font-weight="700" fill="#FFFFFF">dailytechwire</text>

  <!-- Tagline: fixed muted cream, sentence case per invariant #11. -->
  <text x="72" y="345" font-family="${FONT_STACK}" font-size="24" font-weight="400" fill="rgba(232,237,247,0.72)">Tech Intelligence, Wired Daily</text>
</svg>
`;

await sharp(Buffer.from(svg)).png().toFile(outPath);

console.log(`[generate-og-default] wrote ${outPath} (${WIDTH}x${HEIGHT})`);
