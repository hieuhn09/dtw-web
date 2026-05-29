// ============ i18n ============
const LangContext = React.createContext({ lang: "en", setLang: ()=>{} });

function I18nProvider({ children }){
  const [lang, setLang] = React.useState(()=>{
    try { return localStorage.getItem("dtw-lang") || "en"; } catch(e){ return "en"; }
  });
  React.useEffect(()=>{
    try { localStorage.setItem("dtw-lang", lang); } catch(e){}
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);
  const value = React.useMemo(()=>({ lang, setLang }), [lang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

function useLang(){ return React.useContext(LangContext); }

// inline translator: t("English", "Tiếng Việt", "Bahasa Indonesia")
function useT(){
  const { lang } = useLang();
  return React.useCallback(
    (en, vi, id) => lang==="vi" ? (vi||en) : lang==="id" ? (id||en) : en,
    [lang]
  );
}

// Pillar label translations
const PILLAR_I18N = {
  ai:       { vi: "AI",            id: "AI"          },
  startups: { vi: "Khởi nghiệp",   id: "Startup"     },
  asia:     { vi: "Châu Á",        id: "Asia"        },
  dev:      { vi: "Lập trình",     id: "Pengembang"  },
  products: { vi: "Sản phẩm",      id: "Produk"      },
  policy:   { vi: "Chính sách",    id: "Kebijakan"   },
};
function localizedPillarLabel(id, lang){
  const p = PILLARS.find(p=>p.id===id);
  if(!p) return "";
  if(lang === "en") return p.label;
  return PILLAR_I18N[id]?.[lang] || p.label;
}

// Nav-extra translations
const NAV_I18N = {
  awards:      { vi: "Giải thưởng",  id: "Penghargaan" },
  studio:      { vi: "Studio",       id: "Studio"      },
  dashboards:  { vi: "Bảng dữ liệu", id: "Dasbor"      },
  newsletters: { vi: "Bản tin",       id: "Newsletter"  },
  pro:         { vi: "Pro",          id: "Pro"         },
};
function localizedNavLabel(id, lang){
  const item = NAV_EXTRA.find(n=>n.id===id);
  if(!item) return "";
  if(lang === "en") return item.label;
  return NAV_I18N[id]?.[lang] || item.label;
}

// Date formatting per locale
function fmtDateL(iso, lang){
  const d = new Date(iso);
  const locale = lang==="vi" ? "vi-VN" : lang==="id" ? "id-ID" : "en-US";
  return d.toLocaleDateString(locale, { month:"short", day:"numeric", year:"numeric" });
}
function fmtFullDate(d, lang){
  const locale = lang==="vi" ? "vi-VN" : lang==="id" ? "id-ID" : "en-US";
  return d.toLocaleDateString(locale, { weekday:"long", month:"long", day:"numeric", year:"numeric" });
}

Object.assign(window, {
  I18nProvider, LangContext, useLang, useT,
  PILLAR_I18N, NAV_I18N,
  localizedPillarLabel, localizedNavLabel,
  fmtDateL, fmtFullDate,
});
