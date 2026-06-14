"use client";

// TODO: metadata — add generateMetadata once this marketing route is finalised.

import type { ReactNode } from "react";
import Link from "next/link";
import { Avatar } from "@/components/cover-art";
import { GridBackdrop, Reveal } from "@/components/effects";
import { Icon, type IconName } from "@/components/icons";
import { useLang, useT } from "@/lib/i18n";

// ------------------------------------------------------------
// Newsroom data — ported from design/project/src/about.jsx
// (BEATS / MASTHEAD / BUREAUS). Org = Asia Press Centre Group.
// ------------------------------------------------------------

interface Beat {
  id: string;
  name: string;
  icon: IconName;
  color: string;
  desc: string;
  current?: boolean;
}

const BEATS: ReadonlyArray<Beat> = [
  {
    id: "tech",
    name: "Technology & Markets",
    icon: "spark",
    color: "#B0512E",
    desc: "Frontier models, infrastructure, developer practice, and the policy that shapes them. The flagship beat, you're reading it now.",
    current: true,
  },
  {
    id: "fin",
    name: "Finance & Capital",
    icon: "trend-up",
    color: "#3E6E80",
    desc: "Capital flows, public-market filings, private deals, and the regulators who watch them across ASEAN, India, Greater China, Japan, and Korea.",
  },
  {
    id: "geo",
    name: "Geopolitics & Regional Affairs",
    icon: "globe",
    color: "#3A4E8C",
    desc: "Foreign policy, trade, and security across Southeast Asia and the Indo-Pacific, reported as a beat, not a news cycle.",
  },
  {
    id: "clim",
    name: "Climate & Energy",
    icon: "feather",
    color: "#46735C",
    desc: "Climate policy, the energy transition, and the industrial build-out underneath both, from minerals to megawatts.",
  },
  {
    id: "hlth",
    name: "Healthcare & Biotech",
    icon: "data",
    color: "#8F7238",
    desc: "Healthcare systems, biotech investment, and the public-health stories with the patience to follow them properly.",
  },
  {
    id: "ind",
    name: "Industry & Supply Chain",
    icon: "product",
    color: "#475569",
    desc: "Manufacturing, logistics, semiconductors, and the physical layer of the regional economy that everything else sits on top of.",
  },
  {
    id: "con",
    name: "Consumer & Society",
    icon: "user",
    color: "#0C4A6E",
    desc: "How a billion-plus consumers spend, work, and live, retail, media, mobility, and the cultural shifts moving across the region.",
  },
  {
    id: "res",
    name: "Research & Data Briefings",
    icon: "data",
    color: "#7C2D12",
    desc: "Subscriber-only data products, custom briefings, and the research arm that supports every other newsroom in the group.",
  },
];

const CREDENTIALS: ReadonlyArray<{ k: string; v: string }> = [
  { k: "Career", v: "Senior editing & bureau leadership across the region" },
  { k: "Languages", v: "English · Mandarin · Bahasa Melayu · functional Japanese" },
  { k: "Focus areas", v: "Cross-border investigations · technology policy · capital flows" },
  { k: "Affiliations", v: "Advisor & speaker on editorial standards and press-freedom work" },
];

const MASTHEAD: ReadonlyArray<{ name: string; role: string; city: string }> = [
  { name: "Cheryl Tan", role: "Editor-in-Chief, Dailytechwire / Group Editor", city: "Singapore" },
  { name: "Aravind Subramanian", role: "Managing Editor", city: "Bengaluru" },
  { name: "Hiroko Yamamoto", role: "Executive Editor, Newsroom", city: "Tokyo" },
  { name: "Daniel Park", role: "Standards Editor & Ombudsperson", city: "Seoul" },
  { name: "Thao Nguyen", role: "Editor, Asia Desk", city: "Hanoi" },
  { name: "Indira Sharma", role: "Editor, Markets & Capital", city: "Mumbai" },
  { name: "Wei-Ling Wang", role: "Editor, AI & Frontier Tech", city: "Singapore" },
  { name: "Joshua Lim", role: "Head of Data Desk", city: "Singapore" },
];

const BUREAUS: ReadonlyArray<{ city: string; role: string; tz: string; chief: string }> = [
  { city: "Singapore", role: "Headquarters · group masthead", tz: "GMT+8", chief: "Cheryl Tan" },
  { city: "Tokyo", role: "North Asia bureau", tz: "GMT+9", chief: "Hiroko Yamamoto" },
  { city: "Seoul", role: "Korea & tech-frontier desk", tz: "GMT+9", chief: "Daniel Park" },
  { city: "Jakarta", role: "Indonesia & ASEAN desk", tz: "GMT+7", chief: "Arif Rahman" },
  { city: "Bengaluru", role: "India & Subcontinent", tz: "GMT+5:30", chief: "Aravind Subramanian" },
  { city: "Hanoi", role: "Vietnam & Mekong desk", tz: "GMT+7", chief: "Thao Nguyen" },
];

const TIP_LINES: ReadonlyArray<readonly [icon: IconName, line: string, sub: string]> = [
  ["mail", "media@dailytechwire.com", "PGP key on request"],
  ["lock", "Signal · +65 8XXX XXXX", "End-to-end encrypted"],
  ["globe", "SecureDrop · onion link", "Tor-only, anonymous"],
  ["mail", "corrections@dailytechwire.com", "Spotted an error?"],
];

const BIZ_INFO: ReadonlyArray<readonly [k: string, v: string]> = [
  ["Registered office", "Asia Press Centre Group (APCG)\nBugis Cube\nSingapore 188735"],
  ["Press inquiries", "media@dailytechwire.com"],
  ["Partnerships", "partnership@dailytechwire.com\ndailytechwire.com"],
];

// Fixed light values for text on the navy --banner surface (banner is navy
// in both themes, so var(--paper)/var(--ink) would invert to invisible).
const BANNER_HEADING = "#FFFFFF";
const BANNER_BODY = "rgba(232,237,247,0.70)";
const BANNER_META = "rgba(232,237,247,0.60)";
const BANNER_BORDER = "rgba(232,237,247,0.20)";
const BANNER_FILL = "rgba(232,237,247,0.06)";

export default function NewsroomAboutPage() {
  const t = useT();
  const { lang } = useLang();

  const heroSub: ReactNode =
    lang === "vi" ? (
      <>
        Dailytechwire là ấn phẩm công nghệ của{" "}
        <strong style={{ color: BANNER_HEADING }}>Asia Press Centre Group (APCG)</strong>.{" "}
        <strong style={{ color: BANNER_HEADING }}>Đây là cách bài báo thực sự được tạo ra</strong>,
        ngay tại khu vực, bằng ngôn ngữ bản địa, công khai minh bạch.
      </>
    ) : lang === "id" ? (
      <>
        Dailytechwire adalah publikasi teknologi dari{" "}
        <strong style={{ color: BANNER_HEADING }}>Asia Press Centre Group (APCG)</strong>.{" "}
        <strong style={{ color: BANNER_HEADING }}>Beginilah liputan benar-benar dibuat</strong>, di
        kawasan, dalam bahasa setempat, secara terbuka.
      </>
    ) : (
      <>
        Dailytechwire is the technology title of{" "}
        <strong style={{ color: BANNER_HEADING }}>Asia Press Centre Group (APCG)</strong>.{" "}
        <strong style={{ color: BANNER_HEADING }}>Here is how the reporting actually gets made</strong>,
        in-region, in-language, on the record.
      </>
    );

  const heroPillars: ReadonlyArray<readonly [string, string]> = [
    [
      t("In-region reporting", "Đưa tin tại chỗ", "Liputan di kawasan"),
      t(
        "Reporters who live the markets they cover.",
        "Phóng viên sống ngay trong thị trường họ đưa tin.",
        "Reporter yang menghidupi pasar yang mereka liput."
      ),
    ],
    [
      t("In the languages of the region", "Bằng ngôn ngữ bản địa", "Dalam bahasa kawasan"),
      t(
        "Reporting published in the languages our readers speak.",
        "Đưa tin xuất bản bằng chính ngôn ngữ độc giả nói.",
        "Liputan terbit dalam bahasa yang dibaca pembaca kami."
      ),
    ],
    [
      t("Part of one network", "Một phần của mạng lưới", "Bagian dari satu jaringan"),
      t(
        "Backed by the wider APCG title family.",
        "Được hậu thuẫn bởi hệ thống tựa báo APCG.",
        "Didukung keluarga publikasi APCG yang lebih luas."
      ),
    ],
  ];

  return (
    <div>
      {/* Hero — navy banner */}
      <section
        style={{
          background: "var(--banner)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <GridBackdrop color="rgba(255,255,255,.05)" size={48} fadeRadius="80%" />
        <div
          style={{
            position: "absolute",
            right: -80,
            top: -80,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "var(--accent)",
            opacity: 0.18,
            filter: "blur(80px)",
            pointerEvents: "none",
          }}
        />
        <div className="container" style={{ padding: "80px 24px 64px", position: "relative" }}>
          <div
            className="kicker"
            style={{
              color: "var(--accent)",
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span className="live-dot" style={{ background: "var(--accent)" }} />
            {t("Inside the newsroom", "Bên trong toà soạn", "Di dalam ruang redaksi")}
          </div>
          <h1
            className="serif"
            style={{
              margin: "0 0 18px",
              fontSize: "clamp(34px, 9vw, 64px)",
              fontWeight: 650,
              letterSpacing: "-0.03em",
              lineHeight: 1.02,
              maxWidth: 900,
              textWrap: "balance",
              color: BANNER_HEADING,
            }}
          >
            {t(
              "Inside the newsroom, how we report Asia, beat by beat, in-region and in-language",
              "Bên trong toà soạn, cách chúng tôi đưa tin về châu Á, theo từng mảng, ngay tại khu vực và bằng ngôn ngữ bản địa",
              "Di dalam ruang redaksi, bagaimana kami meliput Asia, per bidang, di kawasan dan dalam bahasa setempat"
            )}
          </h1>
          <p
            className="serif"
            style={{
              margin: "0 0 28px",
              fontSize: 21,
              lineHeight: 1.45,
              color: BANNER_BODY,
              maxWidth: 780,
              textWrap: "pretty",
            }}
          >
            {heroSub}
          </p>
          <div
            className="r-grid-3"
            style={{
              display: "grid",
              gap: 32,
              marginTop: 36,
              paddingTop: 28,
              borderTop: `1px solid ${BANNER_BORDER}`,
              maxWidth: 820,
            }}
          >
            {heroPillars.map(([h, d]) => (
              <div key={h}>
                <div
                  className="serif"
                  style={{
                    fontSize: 19,
                    fontWeight: 650,
                    letterSpacing: "-0.01em",
                    color: BANNER_HEADING,
                    lineHeight: 1.2,
                  }}
                >
                  {h}
                </div>
                <div style={{ fontSize: 12.5, color: BANNER_META, marginTop: 7, lineHeight: 1.5 }}>
                  {d}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container" style={{ paddingTop: 64, paddingBottom: 80 }}>
        {/* What we cover — BEATS grid */}
        <Reveal>
          <section style={{ marginBottom: 80 }}>
            <div
              style={{ borderTop: "3px solid var(--brand-navy)", paddingTop: 24, marginBottom: 32 }}
            >
              <div className="kicker" style={{ marginBottom: 6 }}>
                {t("What we cover", "Chúng tôi đưa tin gì", "Yang kami liput")}
              </div>
              <h2
                className="serif"
                style={{
                  margin: 0,
                  fontSize: 32,
                  fontWeight: 650,
                  letterSpacing: "-0.02em",
                  textWrap: "balance",
                }}
              >
                {t(
                  "The sectors we cover, each with reporters who live the subject",
                  "Các lĩnh vực chúng tôi đưa tin, mỗi mảng có phóng viên sống cùng chủ đề",
                  "Bidang-bidang yang kami liput, masing-masing dengan reporter yang menghidupi topiknya"
                )}
              </h2>
            </div>
            <div
              className="r-grid-4"
              style={{
                display: "grid",
                gap: 20,
              }}
            >
              {BEATS.map((b) => (
                <div
                  key={b.id}
                  style={{
                    position: "relative",
                    display: "flex",
                    gap: 16,
                    padding: 22,
                    background: "var(--surface)",
                    border: "1px solid var(--hair)",
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: `color-mix(in oklab, ${b.color} 14%, transparent)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={b.icon} size={20} color={b.color} stroke={2} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        className="serif"
                        style={{ fontSize: 17, fontWeight: 650, letterSpacing: "-0.01em" }}
                      >
                        {b.name}
                      </div>
                      {b.current && (
                        <span
                          className="mono"
                          style={{
                            fontSize: 9,
                            padding: "2px 6px",
                            borderRadius: 3,
                            background: "var(--accent)",
                            color: "#fff",
                            fontWeight: 600,
                            letterSpacing: ".08em",
                          }}
                        >
                          {t("YOU ARE HERE", "BẠN ĐANG Ở ĐÂY", "ANDA DI SINI")}
                        </span>
                      )}
                    </div>
                    <div
                      className="text-mute"
                      style={{ fontSize: 13, lineHeight: 1.55, marginTop: 6 }}
                    >
                      {b.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Editor-in-Chief — no portrait, no coral name line */}
        <Reveal>
          <section style={{ marginBottom: 80 }}>
            <div
              style={{ borderTop: "3px solid var(--brand-navy)", paddingTop: 24, marginBottom: 36 }}
            >
              <div className="kicker" style={{ marginBottom: 6 }}>
                {t("Editor-in-Chief", "Tổng biên tập", "Pemimpin Redaksi")}
              </div>
              <h2
                className="serif"
                style={{ margin: 0, fontSize: 32, fontWeight: 650, letterSpacing: "-0.02em" }}
              >
                {t(
                  "The newsroom is led by a veteran editor of the Asia beat",
                  "Toà soạn được dẫn dắt bởi một biên tập viên kỳ cựu của mảng châu Á",
                  "Redaksi dipimpin oleh editor veteran di bidang Asia"
                )}
              </h2>
            </div>
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--hair)",
                borderRadius: 12,
                padding: 36,
              }}
            >
              <h3
                className="serif"
                style={{
                  margin: "0 0 8px",
                  fontSize: "clamp(28px, 6vw, 42px)",
                  fontWeight: 650,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.05,
                }}
              >
                Cheryl Tan
              </h3>
              <div
                className="text-mute"
                style={{ fontSize: 15, marginBottom: 24, fontFamily: "var(--font-serif)" }}
              >
                Editor-in-Chief, Dailytechwire · Asia Press Centre Group
              </div>

              <p
                style={{
                  margin: "0 0 14px",
                  fontSize: 16,
                  lineHeight: 1.65,
                  fontFamily: "var(--font-serif)",
                  color: "var(--ink)",
                }}
              >
                Cheryl Tan is a founding editor of Asia Press Centre Group and the Editor-in-Chief of
                dailytechwire, where she sets the title&apos;s editorial direction and the standards
                framework that governs it.
              </p>
              <p
                style={{
                  margin: "0 0 14px",
                  fontSize: 15,
                  lineHeight: 1.65,
                  fontFamily: "var(--font-serif)",
                  color: "var(--ink-2)",
                }}
              >
                She has spent a long career reporting on Asia, with previous senior editing and
                bureau-chief roles at international wire services and regional dailies, in postings
                across Singapore, Tokyo, and Hong Kong. Her work has covered cross-border financial
                investigations, technology policy, and the people building consequential institutions
                across the region.
              </p>
              <p
                style={{
                  margin: "0 0 24px",
                  fontSize: 15,
                  lineHeight: 1.65,
                  fontFamily: "var(--font-serif)",
                  color: "var(--ink-2)",
                }}
              >
                Cheryl is active in regional press-freedom and editorial-standards work, and has
                guest-lectured on journalism and ethics at several universities in Singapore and the
                wider region. She lives in Singapore.
              </p>

              {/* Credentials grid */}
              <div
                className="r-grid-2"
                style={{
                  display: "grid",
                  gap: 16,
                  paddingTop: 20,
                  borderTop: "1px solid var(--hair)",
                }}
              >
                {CREDENTIALS.map((c) => (
                  <div key={c.k}>
                    <div
                      className="upper"
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: ".14em",
                        color: "var(--muted)",
                        marginBottom: 4,
                        textTransform: "uppercase",
                      }}
                    >
                      {c.k}
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ink-2)" }}>{c.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* Editorial leadership — full masthead */}
        <Reveal>
          <section style={{ marginBottom: 80 }}>
            <div
              style={{ borderTop: "3px solid var(--brand-navy)", paddingTop: 24, marginBottom: 32 }}
            >
              <div className="kicker" style={{ marginBottom: 6 }}>
                {t("Editorial leadership", "Đội ngũ biên tập", "Kepemimpinan editorial")}
              </div>
              <h2
                className="serif"
                style={{ margin: 0, fontSize: 32, fontWeight: 650, letterSpacing: "-0.02em" }}
              >
                {t("The masthead, in full", "Toàn bộ ban biên tập", "Tim redaksi, lengkap")}
              </h2>
            </div>
            <div
              className="r-grid-4"
              style={{
                display: "grid",
                gap: 20,
              }}
            >
              {MASTHEAD.map((m) => (
                <div
                  key={m.name}
                  style={{
                    padding: 18,
                    background: "var(--surface)",
                    border: "1px solid var(--hair)",
                    borderRadius: 8,
                  }}
                >
                  <Avatar name={m.name} size={48} />
                  <div
                    className="serif"
                    style={{
                      fontSize: 17,
                      fontWeight: 650,
                      marginTop: 12,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {m.name}
                  </div>
                  <div
                    style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2, lineHeight: 1.4 }}
                  >
                    {m.role}
                  </div>
                  <div
                    className="mono text-mute-2"
                    style={{ fontSize: 11, marginTop: 6, letterSpacing: ".06em" }}
                  >
                    {m.city}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Bureaus & desks */}
        <Reveal>
          <section style={{ marginBottom: 80 }}>
            <div
              style={{ borderTop: "3px solid var(--brand-navy)", paddingTop: 24, marginBottom: 32 }}
            >
              <div className="kicker" style={{ marginBottom: 6 }}>
                {t("Bureaus & desks", "Văn phòng & ban", "Biro & meja")}
              </div>
              <h2
                className="serif"
                style={{
                  margin: 0,
                  fontSize: 32,
                  fontWeight: 650,
                  letterSpacing: "-0.02em",
                  textWrap: "balance",
                }}
              >
                {t(
                  "Reporting in-region, and in the languages our readers speak",
                  "Đưa tin ngay tại khu vực, bằng chính ngôn ngữ độc giả nói",
                  "Meliput di kawasan, dalam bahasa yang dibaca pembaca"
                )}
              </h2>
            </div>
            <div
              className="r-grid-3"
              style={{
                display: "grid",
                gap: 20,
              }}
            >
              {BUREAUS.map((b) => (
                <div
                  key={b.city}
                  style={{
                    padding: 22,
                    background: "var(--surface)",
                    border: "1px solid var(--hair)",
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <div
                      className="serif"
                      style={{ fontSize: 21, fontWeight: 650, letterSpacing: "-0.01em" }}
                    >
                      {b.city}
                    </div>
                    <span className="mono text-mute-2" style={{ fontSize: 11 }}>
                      {b.tz}
                    </span>
                  </div>
                  <div
                    style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 4, lineHeight: 1.4 }}
                  >
                    {b.role}
                  </div>
                  <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--hair)" }}>
                    <div style={{ fontSize: 13, lineHeight: 1.3 }}>
                      <span
                        className="upper text-mute-2"
                        style={{
                          fontSize: 9,
                          fontWeight: 600,
                          letterSpacing: ".12em",
                          marginRight: 8,
                          textTransform: "uppercase",
                        }}
                      >
                        {t("Chief", "Trưởng VP", "Kepala")}
                      </span>
                      <span style={{ fontWeight: 600 }}>{b.chief}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Securely contact the newsroom — navy banner */}
        <Reveal>
          <section style={{ marginBottom: 40 }}>
            <div
              style={{
                background: "var(--banner)",
                borderRadius: 12,
                padding: "48px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                gap: 48,
                alignItems: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <GridBackdrop color="rgba(255,255,255,.05)" size={32} fadeRadius="80%" />
              <div
                style={{
                  position: "absolute",
                  right: -60,
                  top: -60,
                  width: 240,
                  height: 240,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  opacity: 0.18,
                  filter: "blur(60px)",
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative" }}>
                <div className="kicker" style={{ color: "var(--accent)", marginBottom: 10 }}>
                  <Icon
                    name="lock"
                    size={12}
                    stroke={2.2}
                    style={{ verticalAlign: "middle", marginRight: 6 }}
                  />
                  {t(
                    "Securely contact the newsroom",
                    "Liên hệ an toàn với toà soạn",
                    "Hubungi redaksi secara aman"
                  )}
                </div>
                <h3
                  className="serif"
                  style={{
                    margin: "0 0 14px",
                    fontSize: 30,
                    fontWeight: 650,
                    letterSpacing: "-0.02em",
                    color: BANNER_HEADING,
                    lineHeight: 1.15,
                  }}
                >
                  {t(
                    "Tips, documents, and on-background conversations",
                    "Nguồn tin, tài liệu và những trao đổi không công khai",
                    "Tip, dokumen, dan percakapan latar belakang"
                  )}
                </h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: BANNER_BODY, maxWidth: 600 }}>
                  {t(
                    "We protect our sources. We use end-to-end encrypted channels by default, hold tips on a separate system with restricted access, and have never disclosed a source to a third party, including law enforcement, without a sealed legal challenge first. If you have something to share, we'd like to hear from you.",
                    "Chúng tôi bảo vệ nguồn tin. Mặc định dùng các kênh mã hoá đầu-cuối, lưu nguồn tin trên hệ thống riêng có quyền truy cập hạn chế, và chưa bao giờ tiết lộ nguồn tin cho bên thứ ba, kể cả cơ quan thực thi pháp luật, nếu chưa qua một thách thức pháp lý kín. Nếu bạn có điều muốn chia sẻ, chúng tôi rất muốn lắng nghe.",
                    "Kami melindungi narasumber. Secara bawaan kami memakai kanal terenkripsi ujung-ke-ujung, menyimpan tip pada sistem terpisah dengan akses terbatas, dan tidak pernah mengungkap narasumber ke pihak ketiga, termasuk penegak hukum, tanpa tantangan hukum tersegel terlebih dahulu. Jika Anda punya sesuatu untuk dibagikan, kami ingin mendengarnya."
                  )}
                </p>
              </div>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {TIP_LINES.map(([icon, line, sub]) => (
                  <div
                    key={line}
                    style={{
                      padding: "12px 14px",
                      background: BANNER_FILL,
                      border: `1px solid ${BANNER_BORDER}`,
                      borderRadius: 6,
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <Icon name={icon} size={16} color="var(--accent)" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        className="mono"
                        style={{ fontSize: 12, fontWeight: 500, color: BANNER_HEADING }}
                      >
                        {line}
                      </div>
                      <div style={{ fontSize: 10, color: BANNER_META, marginTop: 2 }}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* Footer-style business info */}
        <section
          className="r-grid-3"
          style={{
            paddingTop: 32,
            borderTop: "1px solid var(--hair)",
            display: "grid",
            gap: 24,
          }}
        >
          {BIZ_INFO.map(([k, v]) => (
            <div key={k}>
              <div
                className="upper"
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: ".14em",
                  color: "var(--muted)",
                  marginBottom: 8,
                  textTransform: "uppercase",
                }}
              >
                {k}
              </div>
              <div
                style={{
                  fontSize: 12,
                  lineHeight: 1.6,
                  color: "var(--ink-2)",
                  whiteSpace: "pre-line",
                }}
              >
                {v}
              </div>
            </div>
          ))}
        </section>

        <div style={{ marginTop: 48 }}>
          <Link href="/about" className="linkish" style={{ color: "var(--accent)", fontSize: 14 }}>
            {t(
              "← The trust & standards view of dailytechwire",
              "← Trang minh bạch & chuẩn mực của dailytechwire",
              "← Tampilan kepercayaan & standar dailytechwire"
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
