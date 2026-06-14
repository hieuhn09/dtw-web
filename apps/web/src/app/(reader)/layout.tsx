import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/lib/i18n";
import { ShellProvider } from "@/lib/shell";
import { getNavPillars } from "@/lib/payload-server";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthModal } from "@/components/auth-modal";
import { SearchOverlay } from "@/components/search-overlay";
import { CookieBanner } from "@/components/cookie-banner";

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
  const pillars = await getNavPillars();
  return (
    <I18nProvider>
      <ThemeProvider>
        <ShellProvider>
          <Header pillars={pillars} />
          <main>{children}</main>
          <Footer />
          <AuthModal />
          <SearchOverlay />
          <CookieBanner />
        </ShellProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
