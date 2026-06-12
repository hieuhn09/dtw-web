import type { Metadata } from "next";
import {
  Source_Serif_4,
  IBM_Plex_Sans,
  IBM_Plex_Mono,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

// Reader chrome (header, footer, providers, modals) lives in (reader)/layout.tsx
// so /admin (Payload) renders without it. The root layout owns html, body, and
// font preloads only.

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif-loaded",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans-loaded",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono-loaded",
  display: "swap",
  weight: ["400", "500", "600"],
});

// Logo-lockup faces only (Brand Guideline §2.1: wordmark = Inter Bold,
// monogram = JetBrains Mono; §11: never substitute the wordmark typeface).
// Single weight each, latin subset, preloaded so the header lockup never
// flashes a substitute face — used exclusively via --font-logo-* in
// components/dtw-logo.tsx, never for body copy.
const interLogo = Inter({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-logo-sans",
  display: "swap",
});

const jetbrainsLogo = JetBrains_Mono({
  subsets: ["latin"],
  weight: "600",
  variable: "--font-logo-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DailyTechWire — Asia Tech",
  description: "Tech Intelligence, Wired Daily.",
  icons: {
    icon: [{ url: "/dtw-monogram.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${plexSans.variable} ${plexMono.variable} ${interLogo.variable} ${jetbrainsLogo.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
