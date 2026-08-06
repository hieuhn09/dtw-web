import { GoogleAnalytics } from "@next/third-parties/google";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/lib/i18n";
import { ShellProvider } from "@/lib/shell";
import { getNavPillars, getPaywallThreshold } from "@/lib/cms-client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthModal } from "@/components/auth-modal";
import { SearchOverlay } from "@/components/search-overlay";
import { ORGANIZATION, siteOrigin, toJsonLdScript } from "@/lib/metadata";
// Temporarily hidden — cookie banner disabled. Restore this import and the
// <CookieBanner /> render below to bring it back.
// import { CookieBanner } from "@/components/cookie-banner";

// GA4 — NEXT_PUBLIC_GA_ID overrides; otherwise the id is inlined only on Vercel
// production builds (team env vars need owner permissions to set). Local dev and
// previews send nothing. Reader layout only, so /admin (Payload) stays untracked.
const GA_ID =
  process.env.NEXT_PUBLIC_GA_ID ||
  (process.env.VERCEL_ENV === "production" ? "G-5H175FPLGR" : undefined);

/**
 * Sitewide Organization + WebSite JSON-LD (SEO audit finding: the homepage
 * emitted zero JSON-LD before this — only the article route had any). Lives
 * in the layout rather than per-page since both nodes describe the
 * publication itself, not any one page's content, and every reader route
 * should carry them. `WebSite.publisher` links the two nodes together, the
 * same relationship `buildArticleJsonLd`'s `publisher` field already
 * expresses for articles. Computed once per request, not memoized — this is
 * a handful of string fields, not worth a cache entry.
 */
const SITE_JSON_LD = toJsonLdScript([
  { "@context": "https://schema.org", "@type": "Organization", ...ORGANIZATION },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DailyTechWire",
    url: siteOrigin(),
    publisher: { "@type": "Organization", ...ORGANIZATION },
  },
]);

/**
 * Reader-site chrome — wraps everything outside `/admin`. Providers go here so
 * Payload's admin tree never instantiates them, and so the I18n + theme state
 * survives client-side navigation between reader pages.
 */
export default async function ReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pillars, paywallThreshold] = await Promise.all([
    getNavPillars(),
    getPaywallThreshold(),
  ]);
  return (
    <I18nProvider>
      <ThemeProvider>
        <ShellProvider paywallThreshold={paywallThreshold}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: SITE_JSON_LD }}
          />
          <Header pillars={pillars} />
          <main>{children}</main>
          <Footer />
          <AuthModal />
          <SearchOverlay />
          {/* Temporarily hidden: <CookieBanner /> */}
          {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
        </ShellProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
