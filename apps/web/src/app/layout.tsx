import type { Metadata } from "next";
import { preload } from "react-dom";
import { DEFAULT_OG_IMAGE, siteOrigin } from "@/lib/metadata";
import "./fonts.css";
import "./globals.css";

// Reader chrome (header, footer, providers, modals) lives in (reader)/layout.tsx
// so /admin (Payload) renders without it. The root layout owns html, body, and
// font preloads only.

// Fonts are self-hosted (./fonts.css + public/fonts/), byte-identical to what
// next/font/google used to serve, so a Google Fonts outage cannot fail the
// build. Editorial display face is Schibsted Grotesk (design refresh
// 2026-06-14: Source Serif 4 -> Schibsted Grotesk; the --font-serif token name
// is kept even though the face is now a sans), UI face is IBM Plex Sans. Both
// are variable fonts. Only the latin subsets are preloaded, exactly as
// next/font did with `subsets: ["latin"]`; the other subsets load on demand
// through their unicode-range.
const PRELOADED_FONTS = [
  "/fonts/schibsted-grotesk-latin.e3b56e90.woff2",
  "/fonts/ibm-plex-sans-latin.056e4e24.woff2",
] as const;

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: {
    default: "Opentechwire",
    template: "%s – Opentechwire",
  },
  description: "Tech Intelligence, Openly Wired.",
  // Fallback feed autodiscovery for pages that don't call buildMetadata
  // (which re-declares this — page-level `alternates` replaces the layout's).
  alternates: {
    types: {
      "application/atom+xml": [{ url: "/rss.xml", title: "Opentechwire" }],
    },
  },
  openGraph: {
    siteName: "Opentechwire",
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE.url,
        width: DEFAULT_OG_IMAGE.width,
        height: DEFAULT_OG_IMAGE.height,
        alt: DEFAULT_OG_IMAGE.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  for (const href of PRELOADED_FONTS) {
    preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
