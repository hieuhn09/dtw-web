// ============ APP ROOT ============

function CookieBanner({ onDismiss }) {
  const t = useT();
  return (
    <div style={{
      position: "fixed", bottom: 20, left: 20, right: 20, zIndex: 50,
      maxWidth: 920, margin: "0 auto",
      background: "var(--ink)", color: "var(--paper)",
      padding: "14px 18px 14px 22px", borderRadius: 10,
      boxShadow: "0 18px 48px -16px rgba(17,17,17,.5)",
      border: "1px solid color-mix(in oklab, var(--paper) 8%, transparent)",
      display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap"
    }}>
      {/* Left: icon + accent label */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        paddingRight: 16,
        borderRight: "1px solid color-mix(in oklab, var(--paper) 14%, transparent)",
        flexShrink: 0
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 6,
          background: "rgba(224,78,31,.15)", color: "var(--accent)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Icon name="info" size={16} color="var(--accent)" stroke={2.2} />
        </div>
        <div className="upper" style={{
          fontSize: 11, fontWeight: 600, letterSpacing: ".14em",
          color: "var(--accent)", whiteSpace: "nowrap"
        }}>
          {t("Cookies", "Cookies", "Cookies")}
        </div>
      </div>

      {/* Middle: short message */}
      <p style={{
        margin: 0, fontSize: 13, lineHeight: 1.5,
        color: "color-mix(in oklab, var(--paper) 85%, transparent)",
        flex: 1, minWidth: 240
      }}>
        {t(
          "We use cookies to remember your login and improve the site. No ads, no tracking, no data sale.",
          "Chúng tôi dùng cookies để giữ bạn đăng nhập và cải thiện trang. Không quảng cáo, không theo dõi, không bán dữ liệu.",
          "Kami menggunakan cookies untuk mengingat login Anda dan meningkatkan situs. Tanpa iklan, tanpa pelacak, tanpa jual data."
        )}
      </p>

      {/* Right: actions */}
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button onClick={() => onDismiss("reject")} style={{
          background: "transparent",
          border: "1px solid color-mix(in oklab, var(--paper) 28%, transparent)",
          color: "var(--paper)", padding: "8px 14px", borderRadius: 5,
          fontSize: 12, fontWeight: 500, cursor: "pointer",
          whiteSpace: "nowrap"
        }}>
          {t("Decline", "Từ chối", "Tolak")}
        </button>
        <Button variant="accent" size="md" onClick={() => onDismiss("accept")} style={{ padding: "8px 18px", whiteSpace: "nowrap" }}>
          {t("Accept", "Đồng ý", "Setuju")}
        </Button>
      </div>
    </div>);
}

function App() {
  const [route, setRoute] = useState("/");
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [articlesRead, setArticlesRead] = useState(0);
  const [cookiesDismissed, setCookiesDismissed] = useState(true);
  const readIds = useRef(new Set());

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    // Expose so header user dropdown can log out
    window.__setUser = setUser;
  }, []);

  // Cmd+K to open search
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navigate = useCallback((path, replace) => {
    setRoute(path);
    if (replace) window.history.replaceState({}, "", "#" + path);else
    window.history.pushState({}, "", "#" + path);
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const onPop = () => {
      const h = location.hash.replace(/^#/, "") || "/";
      setRoute(h);
    };
    window.addEventListener("popstate", onPop);
    const initial = location.hash.replace(/^#/, "");
    if (initial) setRoute(initial);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const incrementRead = useCallback((id) => {
    if (readIds.current.has(id)) return;
    readIds.current.add(id);
    setArticlesRead((n) => n + 1);
  }, []);

  // Demo: surface cookie banner after small delay
  useEffect(() => {
    const t = setTimeout(() => setCookiesDismissed(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // === Router ===
  let view;
  if (route === "/" || route === "") view = <Homepage navigate={navigate} />;else
  if (route.startsWith("/article/")) {
    const slug = route.replace("/article/", "");
    view = <ArticlePage slug={slug} navigate={navigate} articlesRead={articlesRead}
    incrementRead={incrementRead} user={user} openAuth={() => setAuthOpen(true)} />;
  } else
  if (route === "/search" || route.startsWith("/search?")) {
    const q = route.includes("?q=") ? decodeURIComponent(route.split("?q=")[1]) : "";
    view = <SearchPage navigate={navigate} initialQuery={q} />;
  } else
  if (route.startsWith("/dashboards")) {
    const sub = route.split("/")[2];
    view = <DashboardsLanding navigate={navigate} sub={sub} />;
  } else
  if (route === "/newsletters") view = <NewslettersPage navigate={navigate} />;else
  if (route.startsWith("/account")) {
    const tab = route.split("/")[2];
    view = <AccountPage navigate={navigate} user={user} tab={tab} />;
  } else
  if (route.startsWith("/trust/")) {
    const sub = route.split("/")[2];
    view = <TrustPage navigate={navigate} slug={sub} />;
  } else
  if (route === "/about" || route.startsWith("/about/")) {
    view = <AboutPage navigate={navigate} />;
  } else
  if (route === "/pro") {
    // Pro tier hidden for now — redirect to homepage.
    setTimeout(() => navigate("/", true), 0);
    view = null;
  } else
  if (route === "/awards" || route === "/awards/submit") {
    view = <AwardsPage navigate={navigate} submit={route.endsWith("submit")} />;
  } else
  if (route === "/studio") {
    view = <StaticPage kicker="DTW Studio" title="Sponsored storytelling, done with disclosure."
    body="Studio is DTW's branded content arm. We work with partners to tell their story – and we label it, top to bottom, so readers always know what they're reading." />;
  } else
  if (route === "/briefing") {
    view = <StaticPage kicker="The Brief" title="AM Brief · PM Brief"
    body="Two daily emails. The morning is what broke overnight in Asia tech, in 5 minutes. The evening is the day in three stories, plus what to read tonight." />;
  } else
  {
    // Pillar route check
    const p = PILLARS.find((pp) => route === pp.slug || route.startsWith(pp.slug + "/"));
    if (p) {
      view = <PillarPage pillarId={p.id} navigate={navigate} />;
    } else {
      view = <NotFound navigate={navigate} route={route} />;
    }
  }

  return (
    <>
      <Header
        route={route} navigate={navigate}
        theme={theme} setTheme={setTheme}
        user={user}
        openAuth={() => setAuthOpen(true)}
        openSearch={() => setSearchOpen(true)}
        articlesRead={articlesRead} />
      
      <main>{view}</main>
      <Footer navigate={navigate} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} mode="login" onLogin={setUser} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} navigate={navigate} />
      {!cookiesDismissed && <CookieBanner onDismiss={() => setCookiesDismissed(true)} />}
    </>);

}

function ProPage({ navigate }) {
  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      <header style={{ textAlign: "center", padding: "40px 0", borderBottom: "1px solid var(--hair)", marginBottom: 48 }}>
        <div className="kicker" style={{ marginBottom: 8 }}>Pro Membership</div>
        <h1 className="serif" style={{ margin: "0 0 14px", fontSize: 60, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1, textWrap: "balance" }}>
          The reporting that doesn't run anywhere else.
        </h1>
        <p className="serif text-mute" style={{ margin: "0 auto", fontSize: 20, lineHeight: 1.45, maxWidth: 680 }}>
          Unlimited reading, full Dashboards, member-only Q&As with reporters, and a quarterly long-form. $12/month – or $108/year (save $36).
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginBottom: 48 }}>
        {[
        { name: "Free", price: "$0", note: "per month", cta: "You're here", features: ["3 articles per month", "Wire Drops & Brief", "Newsletter signup", "Dashboards preview"], variant: "outline" },
        { name: "Pro", price: "$12", note: "per month · billed monthly", cta: "Start free 7-day trial", features: ["Unlimited reading", "Full Dashboards + CSV", "Member Q&As", "Audio versions of every article", "No ads"], featured: true, variant: "accent" },
        { name: "Team", price: "$8", note: "per seat / month · 5+ seats", cta: "Talk to sales", features: ["Everything in Pro", "SSO + invoice billing", "Slack archive", "Source-document library", "Account manager"], variant: "primary" }].
        map((t) =>
        <div key={t.name} style={{
          padding: 32, border: t.featured ? "2px solid var(--accent)" : "1px solid var(--hair)",
          borderRadius: 8, background: "var(--surface)",
          position: "relative"
        }}>
            {t.featured &&
          <div className="mono" style={{
            position: "absolute", top: -12, left: 24, padding: "4px 10px",
            background: "var(--accent)", color: "#fff", fontSize: 10,
            fontWeight: 700, letterSpacing: ".1em", borderRadius: 3
          }}>RECOMMENDED</div>
          }
            <div className="upper" style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".14em", color: "var(--muted)", marginBottom: 8 }}>
              {t.name}
            </div>
            <div className="serif" style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>{t.price}</div>
            <div className="text-mute" style={{ fontSize: 12, marginTop: 6, marginBottom: 24 }}>{t.note}</div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
              {t.features.map((f) =>
            <li key={f} style={{ display: "flex", gap: 10, fontSize: 13, color: "var(--ink-2)" }}>
                  <span style={{ color: "var(--up)", fontWeight: 600 }}>✓</span>{f}
                </li>
            )}
            </ul>
            <Button variant={t.variant} size="lg" style={{ width: "100%" }}>{t.cta}</Button>
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", padding: "32px 0", borderTop: "1px solid var(--hair)" }}>
        <div className="text-mute" style={{ fontSize: 12, maxWidth: 680, margin: "0 auto", lineHeight: 1.55 }}>
          DTW is reader-funded first. 62% of revenue comes from members. We will never run a popup, an autoplaying ad, or a tracking pixel. Cancel any time from your account page – no email required.
        </div>
      </div>
    </div>);

}

function AwardsPage({ navigate, submit }) {
  const t = useT();
  // Both /awards and /awards/submit show the same coming-soon screen for now.
  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 80, padding: "35px 24px 0px" }}>
      <section style={{
        position: "relative", overflow: "hidden",
        background: "var(--ink)", color: "var(--paper)",
        borderRadius: 16,

        textAlign: "center",
        border: "1px solid color-mix(in oklab, var(--paper) 8%, transparent)", padding: "85px 56px"
      }}>
        {/* Backdrops */}
        <GridBackdrop color="rgba(255,255,255,.05)" size={48} fadeRadius="85%" />
        <div style={{ position: "absolute", left: "20%", top: -120, width: 380, height: 380, borderRadius: "50%", background: "var(--accent)", opacity: .22, filter: "blur(100px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "10%", top: 80, width: 280, height: 280, borderRadius: "50%", background: "#FCD34D", opacity: .10, filter: "blur(90px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "50%", bottom: -140, width: 520, height: 320, borderRadius: "50%", background: "var(--accent)", opacity: .15, filter: "blur(110px)", transform: "translateX(-50%)", pointerEvents: "none" }} />

        {/* Massive watermark year, behind */}
        <div aria-hidden="true" style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%,-50%)",
          fontFamily: "var(--font-serif)", fontWeight: 700,
          fontSize: 440, lineHeight: 1, letterSpacing: "-0.05em",
          color: "color-mix(in oklab, var(--paper) 4%, transparent)",
          pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap"
        }}>2026</div>

        <div style={{ position: "relative" }}>
          {/* Ornamental top row */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 16, marginBottom: 36
          }}>
            <div style={{ height: 1, background: "linear-gradient(to right, transparent, color-mix(in oklab, var(--paper) 35%, transparent))", flex: 1, maxWidth: 200 }} />
            <span style={{ color: "var(--accent)", fontSize: 10 }}>◆</span>
            <span className="mono upper" style={{ fontSize: 11, letterSpacing: ".28em", fontWeight: 600, color: "var(--accent)" }}>
              Est · MMXXVI
            </span>
            <span style={{ color: "var(--accent)", fontSize: 10 }}>◆</span>
            <div style={{ height: 1, background: "linear-gradient(to left, transparent, color-mix(in oklab, var(--paper) 35%, transparent))", flex: 1, maxWidth: 200 }} />
          </div>

          {/* Headline */}
          <h1 className="serif" style={{
            margin: "0 auto 14px",
            fontSize: 96, fontWeight: 500,
            letterSpacing: "-0.03em", lineHeight: 0.95,
            textWrap: "balance",
            maxWidth: 900
          }}>
            <span style={{
              background: "linear-gradient(120deg, #FCD34D 0%, #E04E1F 40%, #FCD34D 60%, #E04E1F 100%)",
              backgroundSize: "300% 100%",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "awardsShimmer 4.5s ease-in-out infinite"
            }}>
              {t("Coming this year", "Sắp ra mắt trong năm nay", "Hadir tahun ini")}
            </span>
          </h1>

          {/* Italic flourish */}
          <div className="serif" style={{
            fontSize: 18, fontStyle: "italic",
            color: "color-mix(in oklab, var(--paper) 65%, transparent)",
            marginBottom: 32, letterSpacing: ".01em"
          }}>
            {t(
              "An awards moment for Asia's technology decade",
              "Một dấu mốc cho thập kỷ công nghệ châu Á",
              "Sebuah momen penghargaan untuk dekade teknologi Asia"
            )}
          </div>

          {/* Body */}
          <p className="serif" style={{
            margin: "0 auto 36px", fontSize: 18, lineHeight: 1.55,
            color: "color-mix(in oklab, var(--paper) 75%, transparent)", maxWidth: 580, textWrap: "pretty"
          }}>
            {t(
              "We're building an awards programme that recognises the companies and people quietly shaping Asia's technology decade. Categories, panel, and nominations – all unveiled later this year.",
              "Chúng tôi đang xây dựng một giải thưởng tôn vinh những công ty và con người đang lặng lẽ định hình thập kỷ công nghệ của châu Á. Hạng mục, ban giám khảo và đề cử sẽ được công bố vào cuối năm nay.",
              "Kami sedang menyiapkan program penghargaan untuk mengenali perusahaan dan tokoh yang diam-diam membentuk dekade teknologi Asia. Kategori, juri, dan nominasi akan diumumkan akhir tahun ini."
            )}
          </p>

          {/* Coral underline accent */}
          <div style={{
            width: 64, height: 2,
            margin: "0 auto 32px",
            background: "linear-gradient(to right, transparent, var(--accent), transparent)"
          }} />

          {/* Notify chip */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 12,
            padding: "10px 18px",
            background: "color-mix(in oklab, var(--paper) 6%, transparent)",
            border: "1px solid color-mix(in oklab, var(--paper) 15%, transparent)",
            borderRadius: 99,
            fontSize: 13, color: "color-mix(in oklab, var(--paper) 85%, transparent)",
            marginBottom: 28
          }}>
            <Icon name="mail" size={14} color="var(--accent)" stroke={2.2} />
            <span>
              {t(
                "Be the first to know when nominations open — straight to your inbox",
                "Là người đầu tiên biết khi đề cử mở — gửi thẳng đến hộp thư",
                "Jadi yang pertama tahu saat nominasi dibuka — langsung ke kotak masuk"
              )}
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Button variant="accent" size="lg" onClick={() => navigate("/newsletters")}>
              {t("Subscribe for updates", "Đăng ký nhận thông báo", "Berlangganan untuk update")}
            </Button>
            <Button variant="ghost" size="lg" style={{ color: "var(--paper)", border: "1px solid color-mix(in oklab, var(--paper) 20%, transparent)" }} onClick={() => navigate("/")}>
              {t("Back to homepage", "Về trang chủ", "Kembali ke beranda")}
            </Button>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes awardsShimmer {
          0%, 100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
      `}</style>
    </div>);

}

const fldStyle = {
  width: "100%", padding: "12px 14px",
  border: "1px solid var(--hair-2)", borderRadius: 5,
  fontSize: 14, background: "var(--paper)", color: "var(--ink)",
  fontFamily: "var(--font-sans)"
};

function NotFound({ navigate, route }) {
  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 80, textAlign: "center" }}>
      <div className="kicker" style={{ marginBottom: 8 }}>404 · Not in this newsroom</div>
      <h1 className="serif" style={{ margin: "0 0 14px", fontSize: 60, fontWeight: 700, letterSpacing: "-0.03em" }}>
        We don't have a page at <span className="mono" style={{ fontSize: 24, color: "var(--accent)", letterSpacing: 0 }}>{route}</span> yet.
      </h1>
      <p className="serif text-mute" style={{ margin: "0 0 24px", fontSize: 18, lineHeight: 1.45, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
        Try the homepage, search, or one of the six pillars below.
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
        {PILLARS.map((p) =>
        <button key={p.id} onClick={() => navigate(p.slug)} className="pill" style={{ cursor: "pointer", color: p.color, borderColor: "currentColor" }}>{p.label}</button>
        )}
      </div>
    </div>);

}

Object.assign(window, { App, ProPage, AwardsPage, NotFound });

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<I18nProvider><App /></I18nProvider>);