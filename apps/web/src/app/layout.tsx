import type { Metadata } from "next";
import { Schibsted_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Reader chrome (header, footer, providers, modals) lives in (reader)/layout.tsx
// so /admin (Payload) renders without it. The root layout owns html, body, and
// font preloads only.

// Editorial display face (design refresh 2026-06-14: Source Serif 4 -> Schibsted
// Grotesk). Variable font — weight axis 400..900 loads without an explicit list.
// The --font-serif token name is kept even though the face is now a sans.
const sourceSerif = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-serif-loaded",
  display: "swap",
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

export const metadata: Metadata = {
  title: "DailyTechWire — Asia Tech",
  description: "Tech Intelligence, Wired Daily.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${plexSans.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
