"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { PillarId } from "./data";
import { PILLARS, NAV_EXTRA } from "./data";

export type Lang = "en" | "vi" | "id";

interface LangContextValue {
  lang: Lang;
  setLang: (next: Lang) => void;
}

const LangContext = createContext<LangContextValue>({
  lang: "en",
  setLang: () => undefined,
});

const STORAGE_KEY = "dtw-lang";

function isLang(v: unknown): v is Lang {
  return v === "en" || v === "vi" || v === "id";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Hydrate from localStorage after mount to avoid SSR mismatch.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isLang(stored)) setLangState(stored);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);
  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  return useContext(LangContext);
}

/**
 * Inline translator: `t("English", "Tiếng Việt", "Bahasa Indonesia")`.
 * Falls back to English when a localised string is omitted.
 */
export function useT() {
  const { lang } = useLang();
  return useCallback(
    (en: string, vi?: string, id?: string) =>
      lang === "vi" ? vi ?? en : lang === "id" ? id ?? en : en,
    [lang]
  );
}

// ------------------------------------------------------------
// Pillar + nav label tables
// Mirrors design/project/src/i18n.jsx — Year 1 = en/vi/id.
// ------------------------------------------------------------

export const PILLAR_I18N: Record<PillarId, { vi: string; id: string }> = {
  ai: { vi: "AI", id: "AI" },
  startups: { vi: "Khởi nghiệp", id: "Startup" },
  asia: { vi: "Châu Á", id: "Asia" },
  dev: { vi: "Lập trình", id: "Pengembang" },
  products: { vi: "Sản phẩm", id: "Produk" },
  policy: { vi: "Chính sách", id: "Kebijakan" },
};

export function localizedPillarLabel(id: PillarId, lang: Lang): string {
  const p = PILLARS.find((x) => x.id === id);
  if (!p) return "";
  if (lang === "en") return p.label;
  return PILLAR_I18N[id]?.[lang] ?? p.label;
}

export const NAV_I18N: Record<string, { vi: string; id: string }> = {
  awards: { vi: "Giải thưởng", id: "Penghargaan" },
  studio: { vi: "Studio", id: "Studio" },
  dashboards: { vi: "Bảng dữ liệu", id: "Dasbor" },
  newsletters: { vi: "Bản tin", id: "Newsletter" },
  pro: { vi: "Pro", id: "Pro" },
};

export function localizedNavLabel(id: string, lang: Lang): string {
  const item = NAV_EXTRA.find((n) => n.id === id);
  if (!item) return "";
  if (lang === "en") return item.label;
  return NAV_I18N[id]?.[lang] ?? item.label;
}

// ------------------------------------------------------------
// Locale-aware date formatting
// ------------------------------------------------------------

function localeFor(lang: Lang): string {
  return lang === "vi" ? "vi-VN" : lang === "id" ? "id-ID" : "en-US";
}

/**
 * All published dates are pinned to Singapore time — the publication's home
 * timezone. Without an explicit `timeZone`, `toLocaleDateString` uses the
 * runtime's local zone, which differs between Node SSR (often UTC) and the
 * user's browser → SSR/CSR mismatch on dates near midnight.
 */
const PUBLICATION_TZ = "Asia/Singapore";

export function fmtDateL(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleDateString(localeFor(lang), {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: PUBLICATION_TZ,
  });
}

export function fmtFullDate(d: Date, lang: Lang): string {
  return d.toLocaleDateString(localeFor(lang), {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: PUBLICATION_TZ,
  });
}
