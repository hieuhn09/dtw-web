"use client";

import Link from "next/link";
import { Avatar, CoverArt } from "@/components/cover-art";
import { GridBackdrop, Reveal } from "@/components/effects";
import { Icon, type IconName } from "@/components/icons";
import { useLang, useT } from "@/lib/i18n";

const MASTHEAD: ReadonlyArray<{
  name: string;
  role: string;
  city: string;
  years: string;
}> = [
  { name: "Cheryl Tan", role: "Editor-in-Chief, DailyTechWire / Group Editor", city: "Singapore", years: "20+" },
  { name: "Aravind Subramanian", role: "Managing Editor", city: "Bengaluru", years: "18" },
  { name: "Hiroko Yamamoto", role: "Executive Editor, Newsroom", city: "Tokyo", years: "19" },
  { name: "Daniel Park", role: "Standards Editor & Ombudsperson", city: "Seoul", years: "16" },
  { name: "Thao Nguyen", role: "Editor, Asia Desk", city: "Hanoi", years: "14" },
  { name: "Indira Sharma", role: "Editor, Markets & Capital", city: "Mumbai", years: "17" },
  { name: "Wei-Ling Wang", role: "Editor, AI & Frontier Tech", city: "Singapore", years: "12" },
  { name: "Joshua Lim", role: "Head of Data Desk", city: "Singapore", years: "11" },
];

const VALUES: ReadonlyArray<{ k: string; v: string }> = [
  {
    k: "Accuracy first",
    v: "Every story is multi-sourced where possible, and we publish every correction we make. No silent edits, no scrubbed URLs.",
  },
  {
    k: "Independence",
    v: "We refuse paid travel, accept no review units we don't return, and disclose every conflict of interest on the reporter's bio.",
  },
  {
    k: "Transparency",
    v: "Our editorial leadership and standards are public, and we link source documents wherever lawful. No silent edits.",
  },
  {
    k: "Service to readers",
    v: "We exist to make our readers smarter and better informed – not to sell them attention to anyone else.",
  },
];

const CREDENTIALS: ReadonlyArray<{ k: string; v: string }> = [
  { k: "Career", v: "Two-plus decades · senior editing & bureau leadership across the region" },
  { k: "Languages", v: "English · Mandarin · Bahasa Melayu · functional Japanese" },
  { k: "Focus areas", v: "Cross-border investigations · technology policy · capital flows" },
  { k: "Affiliations", v: "Advisor & speaker on editorial standards and press-freedom work" },
];

const TRUST_LINKS: ReadonlyArray<readonly [slug: string, title: string, desc: string]> = [
  ["editorial", "Editorial Standards", "How we report. What we will and won't publish."],
  ["ai", "AI Disclosure", "What 'AI-assisted' means in our newsroom."],
  ["corrections", "Corrections Log", "Public record. Most recent first."],
  ["sponsored", "Sponsored & Affiliate", "DTW Studio rules + commission disclosure."],
];

const TIP_LINES: ReadonlyArray<readonly [icon: IconName, line: string, sub: string]> = [
  ["mail", "tips@dailytechwire.asia", "PGP key on request"],
  ["lock", "Signal · +65 8XXX XXXX", "End-to-end encrypted"],
  ["globe", "SecureDrop · onion link", "Tor-only, anonymous"],
  ["mail", "corrections@dailytechwire.asia", "Spotted an error?"],
];

const BIZ_INFO: ReadonlyArray<readonly [k: string, v: string]> = [
  [
    "Registered office",
    "Asia Press Centre Group (APCG)\nBugis Cube\nSingapore 188735",
  ],
  ["Press inquiries", "media@dailytechwire.asia"],
  ["Partnerships", "partnership@dailytechwire.asia\nasiapresscentre.com"],
];

export default function AboutPage() {
  const t = useT();
  const { lang } = useLang();

  const heroIntro =
    lang === "vi" ? (
      <>
        DailyTechWire là ấn phẩm công nghệ của{" "}
        <strong style={{ color: "#FFFFFF" }}>Asia Press Centre Group (APCG)</strong>, mạng lưới
        truyền thông có trụ sở tại Singapore, làm báo chí uy tín.
      </>
    ) : lang === "id" ? (
      <>
        DailyTechWire adalah publikasi teknologi dari{" "}
        <strong style={{ color: "#FFFFFF" }}>Asia Press Centre Group (APCG)</strong>, jaringan media
        yang berbasis di Singapura dengan jurnalisme tepercaya.
      </>
    ) : (
      <>
        DailyTechWire is the technology title of{" "}
        <strong style={{ color: "#FFFFFF" }}>Asia Press Centre Group (APCG)</strong>, a Singapore-based
        media network of trusted journalism.
      </>
    );

  const heroPillars: ReadonlyArray<readonly [h: string, d: string]> = [
    [
      t("A trusted environment", "Môi trường uy tín", "Lingkungan tepercaya"),
      t(
        "Independent journalism our readers rely on.",
        "Báo chí độc lập mà độc giả tin cậy.",
        "Jurnalisme independen yang diandalkan pembaca."
      ),
    ],
    [
      t("Asia and the world", "Châu Á và thế giới", "Asia dan dunia"),
      t(
        "Regional authority, read across languages.",
        "Tầm vóc khu vực, đọc bằng nhiều ngôn ngữ.",
        "Otoritas regional, dibaca lintas bahasa."
      ),
    ],
    [
      t("One network", "Một mạng lưới", "Satu jaringan"),
      t(
        "Business, finance, travel, luxury and technology.",
        "Kinh doanh, tài chính, du lịch, xa xỉ và công nghệ.",
        "Bisnis, keuangan, perjalanan, kemewahan dan teknologi."
      ),
    ],
  ];

  return (
    <div>
      {/* Hero */}
      <section
        style={{
          background: "var(--banner)",
          color: "#E8EDF7",
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
        <div
          className="container"
          style={{ padding: "80px 24px 64px", position: "relative" }}
        >
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
            {t(
              "About · Asia Press Centre Group (APCG)",
              "Về chúng tôi · Asia Press Centre Group (APCG)",
              "Tentang · Asia Press Centre Group (APCG)"
            )}
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
              color: "#FFFFFF",
              textWrap: "balance",
            }}
          >
            {t(
              "The trusted voice of Asia, read in your language",
              "Tiếng nói đáng tin cậy của châu Á, đọc bằng ngôn ngữ của bạn",
              "Suara tepercaya Asia, dibaca dalam bahasa Anda"
            )}
          </h1>
          <p
            className="serif"
            style={{
              margin: "0 0 28px",
              fontSize: 21,
              lineHeight: 1.45,
              color: "rgba(232,237,247,.75)",
              maxWidth: 780,
              textWrap: "pretty",
            }}
          >
            {heroIntro}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
              gap: 32,
              marginTop: 36,
              paddingTop: 28,
              borderTop: "1px solid rgba(232,237,247,.12)",
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
                    color: "#FFFFFF",
                    lineHeight: 1.2,
                  }}
                >
                  {h}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "rgba(232,237,247,.62)",
                    marginTop: 7,
                    lineHeight: 1.5,
                  }}
                >
                  {d}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container" style={{ paddingTop: 64, paddingBottom: 80 }}>
        {/* Who we are */}
        <Reveal>
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
              gap: 64,
              marginBottom: 80,
            }}
          >
            <div>
              <div className="kicker" style={{ marginBottom: 8 }}>
                {t("Who we are", "Chúng tôi là ai", "Siapa kami")}
              </div>
              <h2
                className="serif"
                style={{
                  margin: 0,
                  fontSize: 34,
                  fontWeight: 650,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  textWrap: "balance",
                }}
              >
                {t(
                  "An independent network publishing trusted journalism across Asia and the world",
                  "Một mạng lưới độc lập làm báo chí uy tín khắp châu Á và thế giới",
                  "Jaringan independen yang menerbitkan jurnalisme tepercaya di Asia dan dunia"
                )}
              </h2>
            </div>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 18,
                lineHeight: 1.65,
                color: "var(--ink-2)",
              }}
            >
              <p style={{ margin: "0 0 18px" }}>
                <strong style={{ color: "var(--ink)" }}>Asia Press Centre Group (APCG)</strong> is a
                Singapore-headquartered media network, a family of trusted multilingual titles
                spanning business, finance, geopolitics, technology, travel, lifestyle and design.
                DailyTechWire is its technology title.
              </p>
              <p style={{ margin: "0 0 18px" }}>
                The conviction behind the network is a simple one: the most consequential business,
                technology, and policy stories of this decade are made in Asia, and they deserve to
                be reported from inside the region, by people who live in it, in the languages their
                readers actually speak.
              </p>
              <p style={{ margin: "0 0 18px" }}>
                Each title runs under its own editor; the group provides the infrastructure, legal
                protection, and a single set of editorial standards that every title signs. We are{" "}
                <strong style={{ color: "var(--ink)" }}>editorially independent</strong> – no
                advertiser, platform, or state directs what we cover.
              </p>
              <p style={{ margin: 0 }}>
                We hold ourselves to the principles set out in our{" "}
                <Link
                  href="/trust/editorial"
                  className="linkish"
                  style={{ color: "var(--accent)" }}
                >
                  Editorial Standards
                </Link>{" "}
                and our{" "}
                <Link
                  href="/trust/ai"
                  className="linkish"
                  style={{ color: "var(--accent)" }}
                >
                  AI Disclosure
                </Link>{" "}
                policy. These are public documents – nothing internal-only, nothing aspirational.
                If we fall short of them, we say so on the record.
              </p>
            </div>
          </section>
        </Reveal>

        {/* Mission & values */}
        <Reveal>
          <section
            style={{
              marginBottom: 80,
              padding: "56px",
              background: "var(--surface)",
              border: "1px solid var(--hair)",
              borderRadius: 12,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: -80,
                top: -80,
                width: 240,
                height: 240,
                borderRadius: "50%",
                background: "var(--accent)",
                opacity: 0.05,
                filter: "blur(60px)",
              }}
            />
            <div
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
                gap: 48,
              }}
            >
              <div>
                <div className="kicker" style={{ marginBottom: 8 }}>
                  {t("Mission", "Sứ mệnh", "Misi")}
                </div>
                <h2
                  className="serif"
                  style={{
                    margin: 0,
                    fontSize: 32,
                    fontWeight: 650,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                    textWrap: "balance",
                  }}
                >
                  {t(
                    "To explain Asia to itself, and to the world that depends on it.",
                    "Giải thích châu Á cho chính châu Á, và cho thế giới phụ thuộc vào nó.",
                    "Menjelaskan Asia kepada Asia sendiri, dan kepada dunia yang bergantung padanya."
                  )}
                </h2>
              </div>
              <div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 24,
                  }}
                >
                  {VALUES.map((v) => (
                    <div key={v.k}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <Icon name="check" size={14} color="var(--accent)" stroke={2.4} />
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{v.k}</div>
                      </div>
                      <div className="text-mute" style={{ fontSize: 13, lineHeight: 1.55 }}>
                        {v.v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Editor-in-Chief */}
        <Reveal>
          <section style={{ marginBottom: 80 }}>
            <div
              style={{
                borderTop: "3px solid var(--brand-navy)",
                paddingTop: 24,
                marginBottom: 36,
              }}
            >
              <div className="kicker" style={{ marginBottom: 6 }}>
                {t("Editor-in-Chief", "Tổng biên tập", "Pemimpin Redaksi")}
              </div>
              <h2
                className="serif"
                style={{
                  margin: 0,
                  fontSize: 32,
                  fontWeight: 650,
                  letterSpacing: "-0.02em",
                }}
              >
                {t(
                  "The newsroom is led by an editor with over two decades on the Asia beat.",
                  "Toà soạn được dẫn dắt bởi một biên tập viên với hơn hai thập kỷ đưa tin về châu Á.",
                  "Redaksi dipimpin oleh editor dengan pengalaman lebih dari dua dekade meliput Asia."
                )}
              </h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                gap: 48,
                background: "var(--surface)",
                border: "1px solid var(--hair)",
                borderRadius: 12,
                padding: 36,
                alignItems: "flex-start",
              }}
            >
              <div>
                <CoverArt
                  pillar="latest"
                  seed="eic-cheryl-tan"
                  variant={5}
                  height={420}
                  label="EIC PORTRAIT"
                />
                <div
                  className="text-mute mono"
                  style={{ fontSize: 11, marginTop: 10, fontStyle: "italic" }}
                >
                  Portrait placeholder · staff photograph to follow
                </div>
              </div>
              <div>
                <div className="kicker" style={{ color: "var(--accent)", marginBottom: 8 }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      background: "var(--accent)",
                      marginRight: 8,
                      verticalAlign: "middle",
                    }}
                  />
                  Cheryl Tan
                </div>
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
                  style={{
                    fontSize: 15,
                    marginBottom: 24,
                    fontFamily: "var(--font-serif)",
                  }}
                >
                  Editor-in-Chief, DailyTechWire · Group Editor, Asia Press Centre Group (APCG)
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
                  Cheryl Tan is a founding editor of Asia Press Centre Group (APCG). She joined at the
                  company&apos;s launch in 2023 as Editor-in-Chief of DailyTechWire and was
                  appointed Group Editor in 2024, where she is responsible for the editorial
                  direction of all eight publications and the standards framework that governs
                  them.
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
                  She has spent more than two decades reporting on Asia, with previous senior
                  editing and bureau-chief roles at international wire services and regional
                  dailies, in postings across Singapore, Tokyo, and Hong Kong. Her work over the
                  years has covered cross-border financial investigations, technology policy, and
                  the people building consequential institutions across the region.
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
                  Cheryl is active in regional press-freedom and editorial-standards work, and
                  has guest-lectured on journalism and ethics at several universities in
                  Singapore and the wider region. She lives in Singapore.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
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
                      <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ink-2)" }}>
                        {c.v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Masthead */}
        <Reveal>
          <section style={{ marginBottom: 80 }}>
            <div
              style={{
                borderTop: "3px solid var(--brand-navy)",
                paddingTop: 24,
                marginBottom: 32,
              }}
            >
              <div className="kicker" style={{ marginBottom: 6 }}>
                {t("Editorial leadership", "Đội ngũ biên tập", "Kepemimpinan editorial")}
              </div>
              <h2
                className="serif"
                style={{
                  margin: 0,
                  fontSize: 32,
                  fontWeight: 650,
                  letterSpacing: "-0.02em",
                }}
              >
                {t("The masthead, in full.", "Toàn bộ ban biên tập.", "Tim redaksi, lengkap.")}
              </h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
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
                    style={{
                      fontSize: 12,
                      color: "var(--ink-2)",
                      marginTop: 2,
                      lineHeight: 1.4,
                    }}
                  >
                    {m.role}
                  </div>
                  <div
                    className="mono text-mute-2"
                    style={{ fontSize: 11, marginTop: 6, letterSpacing: ".06em" }}
                  >
                    {m.city} · {m.years}y on the beat
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Trust quick links */}
        <Reveal>
          <section
            style={{
              marginBottom: 80,
              padding: "40px 48px",
              background: "var(--surface-2)",
              borderRadius: 12,
              border: "1px solid var(--hair-2)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
                gap: 32,
                alignItems: "center",
              }}
            >
              <div>
                <div className="kicker" style={{ marginBottom: 8 }}>
                  Read the rules
                </div>
                <h2
                  className="serif"
                  style={{
                    margin: 0,
                    fontSize: 28,
                    fontWeight: 650,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.15,
                    textWrap: "balance",
                  }}
                >
                  Our editorial framework, in your own words.
                </h2>
                <p
                  className="text-mute"
                  style={{ margin: "10px 0 0", fontSize: 13, lineHeight: 1.55 }}
                >
                  Every policy that governs our newsroom is published. Nothing is internal-only.
                </p>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                {TRUST_LINKS.map(([k, title, d]) => (
                  <Link
                    key={k}
                    href={`/trust/${k}`}
                    className="card-hover"
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: 14,
                      background: "var(--paper)",
                      border: "1px solid var(--hair)",
                      borderRadius: 6,
                      textDecoration: "none",
                      color: "var(--ink)",
                    }}
                  >
                    <Icon name="check" size={16} color="var(--accent)" stroke={2.4} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
                      <div
                        className="text-mute"
                        style={{ fontSize: 11, marginTop: 2, lineHeight: 1.4 }}
                      >
                        {d}
                      </div>
                    </div>
                    <Icon name="arrow-r" size={14} color="var(--muted-2)" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* Tip line */}
        <Reveal>
          <section style={{ marginBottom: 40 }}>
            <div
              style={{
                background: "var(--banner)",
                color: "#E8EDF7",
                borderRadius: 12,
                padding: "48px",
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr",
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
                }}
              />
              <div style={{ position: "relative" }}>
                <div
                  className="kicker"
                  style={{ color: "var(--accent)", marginBottom: 10 }}
                >
                  <Icon
                    name="lock"
                    size={12}
                    stroke={2.2}
                    style={{ verticalAlign: "middle", marginRight: 6 }}
                  />
                  Securely contact the newsroom
                </div>
                <h3
                  className="serif"
                  style={{
                    margin: "0 0 14px",
                    fontSize: 30,
                    fontWeight: 650,
                    letterSpacing: "-0.02em",
                    color: "#FFFFFF",
                    lineHeight: 1.15,
                  }}
                >
                  Tips, documents, and on-background conversations.
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "rgba(232,237,247,.75)",
                    maxWidth: 600,
                  }}
                >
                  We protect our sources. We use end-to-end encrypted channels by default, hold
                  tips on a separate system with restricted access, and have never disclosed a
                  source to a third party – including law enforcement – without a sealed legal
                  challenge first. If you have something to share, we&apos;d like to hear from
                  you.
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
                      background: "rgba(232,237,247,.06)",
                      border: "1px solid rgba(232,237,247,.12)",
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
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: "#E8EDF7",
                        }}
                      >
                        {line}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "rgba(232,237,247,.55)",
                          marginTop: 2,
                        }}
                      >
                        {sub}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* Business info */}
        <section
          style={{
            paddingTop: 32,
            borderTop: "1px solid var(--hair)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
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
      </div>
    </div>
  );
}
