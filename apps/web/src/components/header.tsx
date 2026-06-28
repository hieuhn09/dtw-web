"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/icons";
import { Wordmark } from "@/components/wordmark";
import { useTheme } from "@/components/theme-provider";
import {
  fmtFullDate,
  localizedNavLabel,
  useLang,
  useT,
} from "@/lib/i18n";
import { NAV_EXTRA, type NavPillar } from "@/lib/data";
import { useShell } from "@/lib/shell";

export function Header({ pillars }: { pillars: NavPillar[] }) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const { theme, setTheme } = useTheme();
  const { user, openAuth, openSearch, setUser } = useShell();
  const { lang, setLang } = useLang();
  const t = useT();

  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dateLabel, setDateLabel] = useState<string>("");
  const headerRef = useRef<HTMLElement | null>(null);

  // Compute the displayed date on the client so server/client agree at hydration.
  useEffect(() => {
    setDateLabel(fmtFullDate(new Date(), lang));
  }, [lang]);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // While the drawer is open: lock body scroll and close on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

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
  }, []);

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
            className="mono text-mute util-left"
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
          <div className="util-right" style={{ display: "flex", gap: 14, alignItems: "center" }}>
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
            <Wordmark size={32} />
            <div
              className="mono text-mute"
              style={{ letterSpacing: ".08em", margin: "2px 0 0", fontSize: 11 }}
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
        <div className="desktop-only" style={{ flex: 1, maxWidth: 520 }}>
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
            className="desktop-only"
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
              alignItems: "center",
            }}
          >
            {t("Subscribe", "Đăng ký", "Berlangganan")}
          </Link>

          {/* Mobile: open the ⌘K search overlay */}
          <button
            className="mobile-only"
            onClick={openSearch}
            aria-label={t("Search", "Tìm kiếm", "Cari")}
            style={{
              width: 38,
              height: 38,
              border: "1px solid var(--hair)",
              background: "transparent",
              borderRadius: 5,
              cursor: "pointer",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink)",
            }}
          >
            <Icon name="search" size={16} />
          </button>

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
            <div className="desktop-only" style={{ position: "relative" }}>
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
              className="desktop-only"
              style={{
                padding: "9px 14px",
                border: "1px solid var(--hair-2)",
                background: "transparent",
                color: "var(--ink)",
                borderRadius: 5,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                alignItems: "center",
              }}
            >
              {t("Log in", "Đăng nhập", "Masuk")}
            </button>
          )}

          {/* Mobile: hamburger opens the full-nav drawer */}
          <button
            className="mobile-only"
            onClick={() => setMenuOpen(true)}
            aria-label={t("Menu", "Menu", "Menu")}
            aria-expanded={menuOpen}
            style={{
              width: 38,
              height: 38,
              border: "1px solid var(--hair)",
              background: "transparent",
              borderRadius: 5,
              cursor: "pointer",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink)",
            }}
          >
            <Icon name="menu" size={18} />
          </button>
        </div>
      </div>

      {/* Pillar + extras nav */}
      <div
        className="pillar-nav-row"
        style={{ borderTop: "1px solid var(--hair)", borderBottom: "3px solid var(--brand-navy)" }}
      >
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
            {pillars.map((p) => {
              const href = `/${p.slug}`;
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={p.slug}
                  href={href}
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
                    fontWeight: 500,
                    fontSize: 14,
                    textDecoration: "none",
                  }}
                >
                  <Icon name={p.icon as IconName} size={15} color={p.color} />
                  {p.title[lang] ?? p.title.en}
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
                    padding: "0 19px",
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

      {/* Mobile nav drawer */}
      {menuOpen && (
        <div
          className="mobile-only"
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            background: "color-mix(in oklab, var(--ink) 55%, transparent)",
            display: "block",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="fade-up"
            style={{
              position: "absolute",
              top: 0,
              insetInlineEnd: 0,
              height: "100%",
              width: "min(86vw, 340px)",
              background: "var(--paper)",
              borderInlineStart: "1px solid var(--hair)",
              boxShadow: "var(--shadow)",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 18px",
                borderBottom: "1px solid var(--hair)",
              }}
            >
              <Wordmark size={22} />
              <button
                onClick={() => setMenuOpen(false)}
                aria-label={t("Close", "Đóng", "Tutup")}
                style={{
                  width: 34,
                  height: 34,
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
                <Icon name="close" size={15} />
              </button>
            </div>

            <nav style={{ padding: "10px 8px", display: "flex", flexDirection: "column" }}>
              {pillars.map((p) => {
                const href = `/${p.slug}`;
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={p.slug}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 12px",
                      borderRadius: 6,
                      color: active ? p.color : "var(--ink)",
                      fontWeight: 600,
                      fontSize: 16,
                      textDecoration: "none",
                    }}
                  >
                    <Icon name={p.icon as IconName} size={17} color={p.color} />
                    {p.title[lang] ?? p.title.en}
                  </Link>
                );
              })}

              <div className="divider" style={{ margin: "8px 12px" }} />

              {NAV_EXTRA.map((n) => (
                <Link
                  key={n.id}
                  href={n.slug}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "11px 12px",
                    borderRadius: 6,
                    color: "var(--muted)",
                    fontWeight: 500,
                    fontSize: 13,
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
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
              ))}
            </nav>

            <div
              style={{
                marginTop: "auto",
                padding: 18,
                borderTop: "1px solid var(--hair)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <Link
                href="/newsletters"
                onClick={() => setMenuOpen(false)}
                style={{
                  padding: "12px 14px",
                  background: "var(--accent)",
                  color: "#fff",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  textAlign: "center",
                  textDecoration: "none",
                }}
              >
                {t("Subscribe", "Đăng ký", "Berlangganan")}
              </Link>
              {user ? (
                <>
                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      padding: "12px 14px",
                      border: "1px solid var(--hair-2)",
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 500,
                      textAlign: "center",
                      color: "var(--ink)",
                      textDecoration: "none",
                    }}
                  >
                    {user.name.split(" ")[0]} · {t("Account", "Tài khoản", "Akun")}
                  </Link>
                  <button
                    onClick={() => {
                      setUser(null);
                      setMenuOpen(false);
                    }}
                    style={{
                      padding: "10px 14px",
                      border: "none",
                      background: "transparent",
                      color: "var(--muted)",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {t("Log out", "Đăng xuất", "Keluar")}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    openAuth();
                  }}
                  style={{
                    padding: "12px 14px",
                    border: "1px solid var(--hair-2)",
                    background: "transparent",
                    color: "var(--ink)",
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  {t("Log in", "Đăng nhập", "Masuk")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
