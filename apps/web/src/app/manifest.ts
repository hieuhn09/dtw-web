import type { MetadataRoute } from "next";

// Next.js serves this at /manifest.webmanifest and auto-injects
// <link rel="manifest"> into <head> (file-based metadata convention).
// This is what drives "Add to Home Screen" / "Install app": the device
// reads `name`/`short_name` for the label and `icons` for the home-screen icon.
//
// Icons: SVG monogram (app/icon.svg) is the browser favicon; the PNGs below
// cover Android install prompts (192/512 + a maskable 512 with safe-zone
// padding). iOS reads app/apple-icon.png (180×180), NOT this manifest.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dailytechwire",
    short_name: "Dailytechwire",
    description: "Tech Intelligence, Wired Daily.",
    start_url: "/",
    display: "standalone",
    background_color: "#FDFCF8", // --paper (light), shows on the splash screen
    theme_color: "#1B2A52", // --banner navy, matches the site header chrome
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
