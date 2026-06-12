import type { MetadataRoute } from "next";

// Next.js serves this at /manifest.webmanifest. Referenced from the root
// layout metadata (`manifest: "/manifest.webmanifest"`).
//
// Note: only SVG brand assets exist today, which modern browsers accept for
// app icons. PNG fallbacks (192×192, 512×512, and a maskable 512×512 with
// safe-zone padding) should be added here later for older Android / install
// prompts that don't yet honor SVG icons.

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DailyTechWire",
    short_name: "DTW",
    description: "Tech Intelligence, Wired Daily.",
    start_url: "/",
    display: "standalone",
    background_color: "#0F172A", // neutral-900 dark bg (Brand Guideline §4.1)
    theme_color: "#1E3A8A", // primary-900 brand navy (Brand Guideline §4.1)
    icons: [
      {
        src: "/dtw-monogram.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
    ],
  };
}
