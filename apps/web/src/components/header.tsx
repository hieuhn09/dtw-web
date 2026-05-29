"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { TickerTape } from "@/components/effects";
import { useTheme } from "@/components/theme-provider";
import {
  fmtFullDate,
  localizedNavLabel,
  localizedPillarLabel,
  useLang,
  useT,
} from "@/lib/i18n";
import { NAV_EXTRA, PILLARS, PILLAR_ICONS } from "@/lib/data";
import { useShell } from "@/lib/shell";

const NUDGE_KEY = "dtw-nudge-dismissed";

export function Header() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const { theme, setTheme } = useTheme();
  const { user, openAuth, openSearch, articlesRead, setUser } = useShell();
  const { lang, setLang } = useLang();
  const t = useT();

  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [dateLabel, setDateLabel] = useState<string>("");
  const headerRef = useRef<HTMLElement | null>(null);

  // Hydrate nudge state after mount
  useEffect(() => {
    try {
      setNudgeDismissed(window.localStorage.getItem(NUDGE_KEY) === "1");
    } catch {
      // ignore
    }
  }, []);

  // Compute the displayed date on the client so server/client agree at hydration.
  useEffect(() => {
    setDateLabel(fmtFullDate(new Date(), lang));
  }, [lang]);

  const showNudge = articlesRead >= 3 && !user && !nudgeDismissed;

  const dismissNudge = () => {
    setNudgeDismissed(true);
    try {
      window.localStorage.setItem(NUDGE_KEY, "1");
    } catch {
      // ignore
    }
  };

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Publish --header-h so other sections can fit one screen.
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
    return () => {
      obs.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [articlesRead, showNudge]);

  const isDark = theme === "dark";

  return (
    <header
      ref={headerRef}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "var(--paper)",
        borderBottom: `1px solid ${scrolled ? "var(--hair)" : "transparent"}`,
        transition: "border-color .2s",
      }}
    >
      <TickerTape />

      {/* Top utility strip */}
      <div style={{ borderBottom: "1px solid var(--hair)", background: "var(--surface)" }}>
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 32,
            fontSize: 11,
          }}
        >
          <div
            className="mono text-mute"
            style={{ display: "flex", gap: 18, alignItems: "center" }}
          >
            <span suppressHydrationWarning>{dateLabel || " "}</span>
            <span style={{ color: "var(--hair-2)" }}>·</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="live-dot" />{" "}
              {t(
                "18 wire drops in the last hour",
                "18 tin nhanh trong giờ qua",
                "18 kawat baru dalam jam terakhir"
              )}
            </span>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <Link
              href="/trust/editorial"
              className="linkish text-mute"
              style={{ fontSize: 11 }}
            >
              {t("Editorial Standards", "Tiêu chuẩn biên tập", "Standar Editorial")}
            </Link>
            <span style={{ color: "var(--hair-2)" }}>·</span>
            <Link
              href="/trust/ai"
              className="linkish text-mute"
              style={{ fontSize: 11 }}
            >
              {t("AI Disclosure", "Công bố AI", "Pengungkapan AI")}
            </Link>
            <span style={{ color: "var(--hair-2)" }}>·</span>
            <select
              aria-label="Language"
              value={lang}
              onChange={(e) => setLang(e.target.value as typeof lang)}
              style={{
                background: "transparent",
                border: "none",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--muted)",
                cursor: "pointer",
              }}
            >
              <option value="en">EN</option>
              <option value="vi">VI</option>
              <option value="id">ID</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          padding: "14px 24px",
        }}
      >
        {/* Wordmark + tagline */}
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
        >
          <div>
            <span
              aria-label="DailyTechWire"
              className="serif"
              style={{
                display: "inline-flex",
                alignItems: "baseline",
                gap: 0,
                fontWeight: 700,
                letterSpacing: "-0.025em",
                lineHeight: 1,
                color: "var(--ink)",
              }}
            >
              <span style={{ fontSize: 32 }}>Daily</span>
              <span style={{ fontSize: 32, color: "var(--accent)" }}>Tech</span>
              <span style={{ fontSize: 32 }}>Wire</span>
            </span>
            <div
              className="mono text-mute"
              style={{ letterSpacing: ".08em", margin: "4px 0 0", fontSize: 11 }}
            >
              {t(
                "Tech Intelligence, Wired Daily",
                "Tin tức công nghệ, cập nhật hàng ngày",
                "Intelijen Teknologi, Setiap Hari"
              )}
            </div>
          </div>
        </Link>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 520, display: "flex" }}>
          <button
            onClick={openSearch}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              background: "var(--surface)",
              border: "1px solid var(--hair)",
              borderRadius: 6,
              color: "var(--muted)",
              fontSize: 13,
              textAlign: "left",
              cursor: "text",
            }}
          >
            <Icon name="search" size={15} />
            <span style={{ flex: 1 }}>
              {t(
                "Search 12,400 stories, dashboards, awards…",
                "Tìm 12.400 bài báo, bảng điều khiển, giải thưởng…",
                "Cari 12.400 artikel, dasbor, penghargaan…"
              )}
            </span>
            <kbd
              className="mono"
              style={{
                fontSize: 10,
                color: "var(--muted-2)",
                border: "1px solid var(--hair)",
                borderRadius: 3,
                padding: "2px 6px",
                background: "var(--paper)",
              }}
            >
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Link
            href="/newsletters"
            style={{
              padding: "9px 14px",
              border: "1px solid var(--accent)",
              background: "var(--accent)",
              color: "#fff",
              borderRadius: 5,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            {t("Subscribe", "Đăng ký", "Berlangganan")}
          </Link>

          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Light mode" : "Dark mode"}
            style={{
              width: 38,
              height: 38,
              border: "1px solid var(--hair)",
              background: "transparent",
              borderRadius: 5,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink)",
            }}
          >
            <Icon name={isDark ? "sun" : "moon"} size={16} />
          </button>

          {user ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px 6px 6px",
                  border: "1px solid var(--hair)",
                  background: "transparent",
                  borderRadius: 5,
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {user.name[0]}
                </div>
                <span>{user.name.split(" ")[0]}</span>
                <span style={{ fontSize: 9, color: "var(--muted)" }}>▼</span>
              </button>
              {userMenuOpen && (
                <div
                  className="fade-up"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    right: 0,
                    background: "var(--surface)",
                    border: "1px solid var(--hair)",
                    borderRadius: 6,
                    minWidth: 200,
                    boxShadow: "var(--shadow)",
                    padding: 6,
                  }}
                >
                  <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--hair)" }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{user.name}</div>
                    <div className="text-mute" style={{ fontSize: 11 }}>
                      {user.email}
                    </div>
                    <div
                      className="mono"
                      style={{
                        fontSize: 10,
                        marginTop: 6,
                        display: "inline-block",
                        padding: "2px 6px",
                        background: "var(--surface-2)",
                        borderRadius: 3,
                      }}
                    >
                      {user.role}
                    </div>
                  </div>
                  {(
                    [
                      ["Saved", "/account/saved"],
                      ["Reading history", "/account/history"],
                      ["Following", "/account/following"],
                      ["Account", "/account"],
                    ] as const
                  ).map(([label, path]) => (
                    <button
                      key={path}
                      onClick={() => {
                        router.push(path);
                        setUserMenuOpen(false);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "8px 10px",
                        background: "transparent",
                        border: "none",
                        fontSize: 12,
                        color: "var(--ink)",
                        cursor: "pointer",
                        borderRadius: 4,
                      }}
                    >
                      {label}
                    </button>
                  ))}
                  <div className="divider" style={{ margin: "4px 0", height: 1, background: "var(--hair)" }} />
                  <button
                    onClick={() => {
                      setUser(null);
                      setUserMenuOpen(false);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 10px",
                      background: "transparent",
                      border: "none",
                      fontSize: 12,
                      color: "var(--muted)",
                      cursor: "pointer",
                      borderRadius: 4,
                    }}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openAuth}
              style={{
                padding: "9px 14px",
                border: "1px solid var(--hair-2)",
                background: "transparent",
                color: "var(--ink)",
                borderRadius: 5,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {t("Log in", "Đăng nhập", "Masuk")}
            </button>
          )}
        </div>
      </div>

      {/* Pillar + extras nav */}
      <div style={{ borderTop: "1px solid var(--hair)", borderBottom: "3px solid var(--ink)" }}>
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "stretch",
            justifyContent: "space-between",
            height: 46,
            overflow: "hidden",
            padding: "0 24px 0 26px",
          }}
        >
          <nav style={{ display: "flex", alignItems: "stretch" }}>
            {PILLARS.map((p) => {
              const active = pathname.startsWith(p.slug);
              return (
                <Link
                  key={p.id}
                  href={p.slug}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "0 18px",
                    cursor: "pointer",
                    borderBottom: active
                      ? `3px solid ${p.color}`
                      : "3px solid transparent",
                    marginBottom: -3,
                    color: active ? p.color : "var(--ink)",
                    transition: "color .15s",
                    fontWeight: 500,
                    fontSize: 14,
                    textDecoration: "none",
                  }}
                >
                  <Icon name={PILLAR_ICONS[p.id]} size={15} color={p.color} />
                  {localizedPillarLabel(p.id, lang)}
                </Link>
              );
            })}
          </nav>
          <nav style={{ display: "flex", alignItems: "stretch" }}>
            {NAV_EXTRA.map((n) => {
              const active = pathname.startsWith(n.slug);
              return (
                <Link
                  key={n.id}
                  href={n.slug}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 500,
                    borderLeft: "1px solid var(--hair)",
                    borderBottom: active
                      ? "3px solid var(--accent)"
                      : "3px solid transparent",
                    marginBottom: -3,
                    color: active ? "var(--accent)" : "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    padding: "0 21px 0 19px",
                    textDecoration: "none",
                  }}
                >
                  {localizedNavLabel(n.id, lang)}
                  {n.badge && (
                    <span
                      className="mono"
                      style={{
                        fontSize: 9,
                        padding: "1px 5px",
                        borderRadius: 2,
                        background: "var(--accent)",
                        color: "#fff",
                        fontWeight: 600,
                      }}
                    >
                      PRO
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sign-in nudge */}
      {showNudge && (
        <div
          style={{
            background: "var(--surface-2)",
            color: "var(--ink)",
            fontSize: 12,
            borderBottom: "1px solid var(--hair)",
            padding: "9px 0",
            animation: "paywallSlide .35s ease-out both",
          }}
        >
          <div
            className="container"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              position: "relative",
            }}
          >
            <span>
              {t(
                "Enjoying DailyTechWire? Sign in to save articles, follow topics, and pick up where you left off — across every device.",
                "Bạn đang thích DailyTechWire? Đăng nhập để lưu bài, theo dõi chủ đề, và đọc tiếp ở bất kỳ thiết bị nào.",
                "Suka DailyTechWire? Masuk untuk menyimpan artikel, mengikuti topik, dan lanjut membaca di perangkat mana pun."
              )}
            </span>
            <button
              onClick={openAuth}
              style={{
                cursor: "pointer",
                fontWeight: 600,
                whiteSpace: "nowrap",
                textDecoration: "underline",
                textUnderlineOffset: 3,
                color: "var(--accent)",
                paddingRight: 28,
                background: "transparent",
                border: "none",
              }}
            >
              {t("Sign in — it's free →", "Đăng nhập — miễn phí →", "Masuk — gratis →")}
            </button>
            <button
              onClick={dismissNudge}
              aria-label="Dismiss"
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                width: 18,
                height: 18,
                borderRadius: 3,
                background: "transparent",
                border: "none",
                color: "var(--muted-2)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                opacity: 0.55,
                transition: "opacity .15s",
              }}
            >
              <Icon name="close" size={11} />
            </button>
          </div>
          <style>{`@keyframes paywallSlide{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}`}</style>
        </div>
      )}
    </header>
  );
}
