// One-off script: rasterizes the four brand-mark PNG assets (apple-icon,
// icon-192, icon-512, icon-maskable-512) via sharp (already an `apps/web`
// dependency — imported in payload.config.ts and generate-og-default.mjs).
// Not part of the Next.js build; the output PNGs are committed to the repo
// as static assets (favicon/PWA install-prompt/iOS home-screen icon).
//
// Run with: `node scripts/generate-brand-icons.mjs` from `apps/web/`.
//
// Visual brief: full-bleed navy (`--banner` #1B2A52) square, no corner
// radius, with the white `OTW` monogram centered — same glyph/weight/spacing
// as `app/icon.svg`, just rasterized at four sizes. `icon-maskable-512.png`
// additionally must keep the glyph well inside Android's 80% safe-zone
// circle (see MASKABLE_SAFE_ZONE_NOTE below) and must be vertically centered
// for real — the previous hand-drawn version had a known vertical-centering
// bug this script fixes via `dominant-baseline="central"`.
//
// Font note: same caveat as generate-og-default.mjs — sharp rasterizes SVG
// via libvips' librsvg backend, which resolves font families through the
// *build machine's* fontconfig, not the site's actual web fonts. The stack
// below matches app/icon.svg's font-family list (IBM Plex Mono / SF Mono /
// Menlo / monospace); whatever the build machine substitutes is a
// substituted system monospace font, not a build failure. Note any
// substitution (or its absence) in the PR description.
//
// dominant-baseline fallback note: librsvg's historical support for
// `dominant-baseline="central"` has been inconsistent across versions. If
// the rendered glyph looks vertically off-center on this build machine, the
// fallback is to drop `dominant-baseline` and compute `y` manually as
// `size/2 + fontSize*0.35` (a typical baseline offset for a monospace face)
// — see ICONS array below, `dominantBaselineFallback`.

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));

const NAVY = "#1B2A52";
const WHITE = "#FFFFFF";
const FONT_STACK = "'IBM Plex Mono','SF Mono',Menlo,monospace";

// Set to true only if `dominant-baseline="central"` renders visibly
// off-center on this build machine (see librsvg caveat above).
const USE_MANUAL_BASELINE_FALLBACK = false;

const ICONS = [
  {
    label: "apple-icon.png",
    outPath: resolve(here, "../src/app/apple-icon.png"),
    size: 180,
    fontSize: 59,
  },
  {
    label: "icon-192.png",
    outPath: resolve(here, "../public/icon-192.png"),
    size: 192,
    fontSize: 63,
  },
  {
    label: "icon-512.png",
    outPath: resolve(here, "../public/icon-512.png"),
    size: 512,
    fontSize: 168,
  },
  {
    label: "icon-maskable-512.png",
    outPath: resolve(here, "../public/icon-maskable-512.png"),
    size: 512,
    fontSize: 130, // intentionally smaller (~25%) to sit inside the 80% Android safe-zone
  },
];

function buildSvg({ size, fontSize }) {
  const center = size / 2;
  const textAttrs = USE_MANUAL_BASELINE_FALLBACK
    ? `x="${center}" y="${center + fontSize * 0.35}" text-anchor="middle"`
    : `x="${center}" y="${center}" text-anchor="middle" dominant-baseline="central"`;

  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${NAVY}" />
  <text ${textAttrs} font-family="${FONT_STACK}" font-weight="600" font-size="${fontSize}" letter-spacing="0.02em" fill="${WHITE}">OTW</text>
</svg>
`;
}

for (const icon of ICONS) {
  const svg = buildSvg(icon);
  await sharp(Buffer.from(svg)).png().toFile(icon.outPath);
  console.log(`[generate-brand-icons] wrote ${icon.outPath} (${icon.size}x${icon.size})`);
}
