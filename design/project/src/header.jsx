// Dailytechwire logomark, monogram "DTW" with an accent wire-cut through the W,
// set in a tight slab style. Single-color (works on light + dark).
// Compact DTW monogram block, matches uploads/dtw-logo-primary.svg.
function Logo({ size = 44, navy = "var(--brand-navy)" }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 60 60" aria-label="dailytechwire">
      <rect x="0" y="0" width="60" height="60" rx="8" fill={navy} />
      <text x="30" y="39" textAnchor="middle"
      fontFamily="'IBM Plex Mono', 'SF Mono', Menlo, monospace" fontWeight="600"
      fontSize="22" letterSpacing="0.02em" fill="var(--paper)">DTW</text>
    </svg>);
}

// Full horizontal lockup: monogram block + wordmark + pulse signature.
function Wordmark({ size = 30 }) {
  const h = size;
  return (
    <svg height={h * 1.7} viewBox="0 18 234 64" aria-label="dailytechwire" role="img"
    style={{ display: "block", overflow: "visible" }}>
      <rect x="0" y="20" width="60" height="60" rx="8" fill="var(--brand-navy)" />
      <text x="30" y="59" textAnchor="middle"
      fontFamily="'IBM Plex Mono', 'SF Mono', Menlo, monospace" fontWeight="600"
      fontSize="22" letterSpacing="0.02em" fill="var(--paper)">DTW</text>
      <text x="76" y="51" fontFamily="'IBM Plex Sans', 'Helvetica Neue', sans-serif"
      fontWeight="700" fontSize="26" letterSpacing="-0.02em" fill="var(--brand-navy)">dailytechwire</text>
      <g transform="translate(76, 67)">
        <circle cx="2" cy="0" r="2.5" fill="var(--brand-navy)" />
        <line x1="7" y1="0" x2="26" y2="0" stroke="var(--brand-navy)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="31" cy="0" r="2.5" fill="var(--brand-amber)" />
        <line x1="36" y1="0" x2="55" y2="0" stroke="var(--brand-navy)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="60" cy="0" r="2.5" fill="var(--brand-navy)" />
        <line x1="65" y1="0" x2="84" y2="0" stroke="var(--brand-navy)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="89" cy="0" r="2.5" fill="var(--brand-navy)" />
        <line x1="94" y1="0" x2="113" y2="0" stroke="var(--brand-navy)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="118" cy="0" r="2.5" fill="var(--brand-navy)" />
        <line x1="123" y1="0" x2="142" y2="0" stroke="var(--brand-navy)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="147" cy="0" r="2.5" fill="var(--brand-navy)" />
      </g>
    </svg>);
}

function Header({ route, navigate, theme, setTheme, user, openAuth, openSearch, articlesRead }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(() => {
    try {return localStorage.getItem("dtw-nudge-dismissed") === "1";} catch (e) {return false;}
  });
  const { lang, setLang } = useLang();
  const t = useT();
  const headerRef = useRef(null);

  const showNudge = articlesRead >= 3 && !user && !nudgeDismissed;
  const dismissNudge = () => {
    setNudgeDismissed(true);
    try {localStorage.setItem("dtw-nudge-dismissed", "1");} catch (e) {}
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Publish actual header height to --header-h on root so other sections (HomeHero) can fit one screen.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--header-h", h + "px");
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    window.addEventListener("resize", update);
    return () => {obs.disconnect();window.removeEventListener("resize", update);};
  }, [articlesRead, showNudge]);

  return (
    <header ref={headerRef} style={{
      position: "sticky", top: 0, zIndex: 40,
      background: scrolled ? "var(--paper)" : "var(--paper)",
      borderBottom: `1px solid ${scrolled ? "var(--hair)" : "transparent"}`,
      transition: "border-color .2s"
    }}>
      {/* Top utility strip */}
      <div style={{ borderBottom: "1px solid var(--hair)", background: "var(--surface)" }}>
        <div className="container" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 32, fontSize: 11
        }}>
          <div style={{ display: "flex", gap: 18, alignItems: "center" }} className="mono text-mute">
            <span>{fmtFullDate(new Date(), lang)}</span>
            <span style={{ color: "var(--hair-2)" }}>·</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="live-dot" /> {t(
                "18 wire drops in the last hour",
                "18 tin nhanh trong giờ qua",
                "18 kawat baru dalam jam terakhir"
              )}
            </span>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <a className="linkish text-mute" onClick={() => navigate("/trust/editorial")} style={{ cursor: "pointer", fontSize: 11 }}>
              {t("Editorial Standards", "Tiêu chuẩn biên tập", "Standar Editorial")}
            </a>
            <span style={{ color: "var(--hair-2)" }}>·</span>
            <a className="linkish text-mute" onClick={() => navigate("/trust/ai")} style={{ cursor: "pointer", fontSize: 11 }}>
              {t("AI Disclosure", "Công bố AI", "Pengungkapan AI")}
            </a>
            <span style={{ color: "var(--hair-2)" }}>·</span>
            <select aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value)} style={{
              background: "transparent", border: "none", fontFamily: "var(--font-mono)",
              fontSize: 11, color: "var(--muted)", cursor: "pointer"
            }}>
              <option value="en">EN</option>
              <option value="vi">VI</option>
              <option value="id">ID</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="container" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 24, padding: "14px 24px"
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => navigate("/")}>
          <div style={{ padding: "0px" }}>
            <Wordmark size={32} />
            <div className="mono text-mute" style={{ letterSpacing: ".08em", marginTop: 2, fontSize: "11px" }}>
              {t(
                "Tech Intelligence, Wired Daily",
                "Tin tức công nghệ, cập nhật hàng ngày",
                "Intelijen Teknologi, Setiap Hari"
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 520, display: "flex" }} className="header-search">
          <button onClick={openSearch} style={{
            flex: 1, display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px", background: "var(--surface)",
            border: "1px solid var(--hair)", borderRadius: 6,
            color: "var(--muted)", fontSize: 13, textAlign: "left", cursor: "text"
          }}>
            <Icon name="search" size={15} />
            <span style={{ flex: 1 }}>
              {t(
                "Search 12,400 stories, dashboards, awards…",
                "Tìm 12.400 bài báo, bảng điều khiển, giải thưởng…",
                "Cari 12.400 artikel, dasbor, penghargaan…"
              )}
            </span>
            <kbd className="mono" style={{
              fontSize: 10, color: "var(--muted-2)",
              border: "1px solid var(--hair)", borderRadius: 3, padding: "2px 6px",
              background: "var(--paper)"
            }}>⌘K</kbd>
          </button>
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={() => navigate("/newsletters")} style={{
            padding: "9px 14px", border: "1px solid var(--accent)",
            background: "var(--accent)", color: "#fff",
            borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: "pointer"
          }}>{t("Subscribe", "Đăng ký", "Berlangganan")}</button>

          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle dark mode" style={{
            width: 38, height: 38, border: "1px solid var(--hair)",
            background: "transparent", borderRadius: 5, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--ink)"
          }}>
            <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
          </button>

          {user ?
          <div style={{ position: "relative" }}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 10px 6px 6px", border: "1px solid var(--hair)",
              background: "transparent", borderRadius: 5, cursor: "pointer", fontSize: 12
            }}>
                <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: "var(--accent)", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 600
              }}>{user.name[0]}</div>
                <span>{user.name.split(" ")[0]}</span>
                <span style={{ fontSize: 9, color: "var(--muted)" }}>▼</span>
              </button>
              {userMenuOpen &&
            <div style={{
              position: "absolute", top: "calc(100% + 6px)", right: 0,
              background: "var(--surface)", border: "1px solid var(--hair)",
              borderRadius: 6, minWidth: 200, boxShadow: "var(--shadow)", padding: 6
            }} className="fade-up">
                  <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--hair)" }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{user.name}</div>
                    <div className="text-mute" style={{ fontSize: 11 }}>{user.email}</div>
                    <div className="mono" style={{
                  fontSize: 10, marginTop: 6, display: "inline-block",
                  padding: "2px 6px", background: "var(--surface-2)", borderRadius: 3
                }}>{user.role}</div>
                  </div>
                  {[
              ["Saved", "/account/saved"],
              ["Reading history", "/account/history"],
              ["Following", "/account/following"],
              ["Account", "/account"]].
              map(([l, p]) =>
              <button key={p} onClick={() => {navigate(p);setUserMenuOpen(false);}} style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "8px 10px", background: "transparent", border: "none",
                fontSize: 12, color: "var(--ink)", cursor: "pointer", borderRadius: 4
              }}>{l}</button>
              )}
                  <div className="divider" style={{ margin: "4px 0" }} />
                  <button onClick={() => {window.__setUser(null);setUserMenuOpen(false);}} style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "8px 10px", background: "transparent", border: "none",
                fontSize: 12, color: "var(--muted)", cursor: "pointer", borderRadius: 4
              }}>Log out</button>
                </div>
            }
            </div> :

          <button onClick={openAuth} style={{
            padding: "9px 14px", border: "1px solid var(--hair-2)",
            background: "transparent", color: "var(--ink)",
            borderRadius: 5, fontSize: 12, fontWeight: 500, cursor: "pointer"
          }}>{t("Log in", "Đăng nhập", "Masuk")}</button>
          }
        </div>
      </div>

      {/* Nav row */}
      <div style={{ borderTop: "1px solid var(--hair)", borderBottom: "3px solid var(--brand-navy)" }}>
        <div className="container" style={{
          display: "flex", alignItems: "stretch", justifyContent: "space-between",
          height: 46, overflow: "hidden", padding: "0px 24px 0px 26px"
        }}>
          <nav style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
            {PILLARS.map((p) => {
              const active = route.startsWith(p.slug);
              return (
                <a key={p.id} className={"pillar-link" + (active ? " active" : "")} onClick={() => navigate(p.slug)} style={{
                  "--pc": p.color,
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "0 18px", cursor: "pointer",
                  borderBottom: active ? `3px solid ${p.color}` : "3px solid transparent",
                  marginBottom: -3, fontWeight: "500", fontSize: "14px"
                }}>
                  <Icon name={PILLAR_ICONS[p.id]} size={15} color={p.color} />
                  {localizedPillarLabel(p.id, lang)}
                </a>);

            })}
          </nav>
          <style>{`
            .pillar-link{ color: var(--ink); }
            .pillar-link:hover.pillar-link.active{ color: var(--pc); }
          `}</style>
          <nav style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
            {NAV_EXTRA.map((n) => {
              const active = route.startsWith(n.slug);
              return (
                <a key={n.id} onClick={() => navigate(n.slug)} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  cursor: "pointer",
                  fontSize: 12, fontWeight: 500,
                  borderLeft: "1px solid var(--hair)",
                  borderBottom: active ? "3px solid var(--accent)" : "3px solid transparent",
                  marginBottom: -3,
                  color: active ? "var(--accent)" : "var(--muted)",
                  textTransform: "uppercase", letterSpacing: ".08em", padding: "0px 19px"
                }}>
                  {localizedNavLabel(n.id, lang)}
                  {n.badge && <span className="mono" style={{
                    fontSize: 9, padding: "1px 5px", borderRadius: 2,
                    background: "var(--accent)", color: "#fff", fontWeight: 600
                  }}>PRO</span>}
                </a>);

            })}
          </nav>
        </div>
      </div>

      {/* Sign-in nudge, appears after 3 articles, pushes content down, dismissable */}
      {showNudge &&
      <div style={{
        background: "var(--surface-2)",
        color: "var(--ink)",
        fontSize: 12,
        borderBottom: "1px solid var(--hair)", padding: "9px 0px",
        animation: "paywallSlide .35s ease-out both"
      }}>
          <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, position: "relative" }}>
            <span>
              {t(
              "Enjoying dailytechwire? Sign in to save articles, follow topics, and pick up where you left off, across every device.",
              "Bạn đang thích dailytechwire? Đăng nhập để lưu bài, theo dõi chủ đề, và đọc tiếp ở bất kỳ thiết bị nào.",
              "Suka dailytechwire? Masuk untuk menyimpan artikel, mengikuti topik, dan lanjut membaca di perangkat mana pun."
            )}
            </span>
            <a onClick={openAuth} style={{
            cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap",
            textDecoration: "underline", textUnderlineOffset: 3,
            color: "var(--accent)", paddingRight: 28
          }}>
              {t("Sign in, it's free →", "Đăng nhập, miễn phí →", "Masuk, gratis →")}
            </a>
            <button onClick={dismissNudge} aria-label="Dismiss" style={{
            position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
            width: 18, height: 18, borderRadius: 3,
            background: "transparent", border: "none",
            color: "var(--muted-2)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 0, opacity: .55, transition: "opacity .15s"
          }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = .55}>
              <Icon name="close" size={11} />
            </button>
          </div>
          <style>{`@keyframes paywallSlide{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}`}</style>
        </div>
      }
    </header>);

}

Object.assign(window, { Header, Logo, Wordmark });