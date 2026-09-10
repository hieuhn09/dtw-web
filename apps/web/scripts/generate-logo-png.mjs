// One-off script: rasterizes the horizontal Opentechwire logo lockup to PNG
// via sharp (already an `apps/web` dependency — imported in payload.config.ts,
// generate-og-default.mjs and generate-brand-icons.mjs). Not part of the
// Next.js build; the output PNGs are committed as static assets and are what
// you hand to partners, press, conference organisers and slide decks.
//
// Run with: `node scripts/generate-logo-png.mjs` from `apps/web/`.
//
// Source of truth: `public/brand/otw-logo-primary-outlined.svg` (light) and
// `public/brand/otw-logo-primary-dark-outlined.svg` (dark). Those are the
// vector masters — geometry identical to `public/otw-logo-primary.svg`, but
// with the `OTW` monogram and the `opentechwire` wordmark converted from
// <text> to <path> outlines.
//
// Why outlines, and not the <text> SVG directly: sharp rasterizes SVG through
// libvips' librsvg backend, which resolves font families through the *build
// machine's* fontconfig — and IBM Plex reaches the site through
// next/font/google, so it is never installed as a system font. Pointing sharp
// at the <text> version silently substitutes DejaVu Sans and ships a wrong
// wordmark. `generate-brand-icons.mjs` documents the same caveat and tolerates
// it, because a substituted monospace `OTW` monogram still reads as the
// monogram; a substituted *wordmark* does not. Outlines remove the question.
//
// The masters were produced by shaping each run with HarfBuzz (the engine
// Chromium uses) against IBM Plex Mono 600 / IBM Plex Sans 700 at the fonts'
// true metrics, then applying CSS letter-spacing per glyph (+0.02em monogram,
// -0.02em wordmark). Verified two ways: rendering the masters through sharp
// and through headless Chromium agree to within 0.07% of pixels (anti-aliasing
// on curve edges only), and Chromium rendering the <text> original at a large
// layout size lands within 0.1% of the outlined wordmark's width. At the SVG's
// native 380x100 size Chromium is ~1.8% wider, because it quantises each glyph
// advance to a whole CSS pixel at that scale; the outlines keep the fonts'
// true metrics, which is what the mark should be at any size.
//
// If `public/otw-logo-primary.svg` ever changes, the masters must be
// regenerated rather than hand-edited — the path data is not editable by hand.

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const brandDir = resolve(here, "../public/brand");

// The masters' viewBox is "-8 12 254 76": the artwork bounds (x 0..237.5,
// y 20..80) plus 8 units of clear space per side. Every export keeps that
// 254:76 ratio, so widths below are all integer multiples of 254.
const MASTER_WIDTH = 254;
const MASTER_HEIGHT = 76;

const VARIANTS = [
  { label: "light", master: "otw-logo-primary-outlined.svg", stem: "otw-logo-primary" },
  { label: "dark", master: "otw-logo-primary-dark-outlined.svg", stem: "otw-logo-primary-dark" },
];

// 2x for web/email, 4x for slide decks and social, 8x for print and large
// format. All transparent — the light mark is navy artwork meant to sit on a
// pale ground, the dark mark is cream artwork for a dark one.
const WIDTHS = [508, 1016, 2032];

for (const variant of VARIANTS) {
  for (const width of WIDTHS) {
    const height = (width / MASTER_WIDTH) * MASTER_HEIGHT;
    const outPath = resolve(brandDir, `${variant.stem}-${width}.png`);
    // librsvg rasterizes at `density`; 72 DPI is the 1:1 baseline for a
    // viewBox unit, so scale it by the requested multiple.
    const info = await sharp(resolve(brandDir, variant.master), {
      density: 72 * (width / MASTER_WIDTH),
    })
      .png({ compressionLevel: 9 })
      .toFile(outPath);

    if (info.width !== width || info.height !== height) {
      throw new Error(
        `${outPath}: expected ${width}x${height}, sharp produced ${info.width}x${info.height}`,
      );
    }
    console.log(`[generate-logo-png] wrote ${outPath} (${info.width}x${info.height})`);
  }
}
