"use client";

import Link from "next/link";
import { Avatar, CoverArt } from "@/components/cover-art";
import { CountUp, GridBackdrop, Reveal } from "@/components/effects";
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

const OWNERSHIP: ReadonlyArray<{ k: string; v: number }> = [
  { k: "Founding partners", v: 42 },
  { k: "Employee share scheme", v: 18 },
  { k: "Independent endowment trust", v: 22 },
  { k: "Patient-capital partners", v: 16 },
  { k: "Treasury", v: 2 },
];

const REVENUE: ReadonlyArray<{ k: string; v: number; color: string }> = [
  { k: "Reader subscriptions (Pro & individual)", v: 68, color: "#E04E1F" },
  { k: "Newsletter & event sponsorship", v: 14, color: "#0EA5E9" },
  { k: "DTW Studio (labelled sponsored work)", v: 10, color: "#D97706" },
  { k: "Research subscriptions (institutional)", v: 6, color: "#7C3AED" },
  { k: "Affiliate (disclosed product reviews)", v: 2, color: "#16A34A" },
];

interface StatTile {
  n: string;
  l: string;
  kind?: "year";
}

const STATS: ReadonlyArray<StatTile> = [
  { n: "2023", l: "Founded in Singapore", kind: "year" },
  { n: "8", l: "Independent publications" },
  { n: "210+", l: "Journalists & contributors" },
  { n: "68%", l: "Reader-funded revenue" },
  { n: "100%", l: "Editorially independent" },
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
    v: "Our ownership, revenue mix, and editorial leadership are public – and updated quarterly. Source documents are linked wherever lawful.",
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
  ["transparency", "Transparency Report", "Headcount, revenue, requests, removals."],
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
    "Asia Press Corporation Pte. Ltd.\n61 Robinson Road, #12-01\nSingapore 068893",
  ],
  ["Company particulars", "UEN: 201112345A\nGST: 201112345A-G\nMICA Permit: MCI(P)042/06/2025"],
  ["Press inquiries", "press@asiapress.com\nMedia kit (PDF, 4MB) →"],
  ["Investor relations", "ir@asiapress.com\nAnnual report 2025 →"],
];

export default function AboutPage() {
  const t = useT();
  const { lang } = useLang();

  const heroIntro =
    lang === "vi" ? (
      <>
        DailyTechWire được xuất bản bởi{" "}
        <strong style={{ color: "var(--paper)" }}>Asia Press Corporation Pte. Ltd.</strong>, một
        tập đoàn truyền thông độc lập đặt trụ sở tại Singapore và có bạn đọc ở 138 quốc gia.
      </>
    ) : lang === "id" ? (
      <>
        DailyTechWire diterbitkan oleh{" "}
        <strong style={{ color: "var(--paper)" }}>Asia Press Corporation Pte. Ltd.</strong>, grup
        media independen yang berkantor pusat di Singapura dan dibaca di 138 negara.
      </>
    ) : (
      <>
        DailyTechWire is published by{" "}
        <strong style={{ color: "var(--paper)" }}>Asia Press Corporation Pte. Ltd.</strong>, an
        independent media group headquartered in Singapore and read in 138 countries.
      </>
    );

  return (
    <div>
      {/* Hero */}
      <section
        style={{
          background: "var(--ink)",
          color: "var(--paper)",
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
              "About · Asia Press Corporation",
              "Về chúng tôi · Asia Press Corporation",
              "Tentang · Asia Press Corporation"
            )}
          </div>
          <h1
            className="serif"
            style={{
              margin: "0 0 18px",
              fontSize: "clamp(34px, 9vw, 64px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.02,
              maxWidth: 900,
            }}
          >
            {t(
              "Independent journalism from Singapore – covering the most consequential tech, financial, and policy stories in Asia.",
              "Báo chí độc lập từ Singapore – đưa tin về những câu chuyện công nghệ, tài chính và chính sách quan trọng nhất ở châu Á.",
              "Jurnalisme independen dari Singapura – meliput kisah teknologi, keuangan, dan kebijakan terpenting di Asia."
            )}
          </h1>
          <p
            className="serif"
            style={{
              margin: "0 0 28px",
              fontSize: 21,
              lineHeight: 1.45,
              color: "color-mix(in oklab, var(--paper) 75%, transparent)",
              maxWidth: 780,
            }}
          >
            {heroIntro}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
              gap: 32,
              marginTop: 36,
              paddingTop: 28,
              borderTop:
                "1px solid color-mix(in oklab, var(--paper) 12%, transparent)",
              maxWidth: 780,
            }}
          >
            {STATS.map((s) => (
              <div key={s.l}>
                <div
                  className="serif"
                  style={{
                    fontSize: 30,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: "var(--paper)",
                  }}
                >
                  {s.kind === "year" ? (
                    <span className="tnum">{s.n}</span>
                  ) : (
                    <CountUp
                      to={parseFloat(s.n.replace(/[^0-9.]/g, ""))}
                      suffix={s.n.replace(/[0-9.]/g, "")}
                    />
                  )}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "color-mix(in oklab, var(--paper) 60%, transparent)",
                    marginTop: 4,
                    textTransform: "uppercase",
                    letterSpacing: ".1em",
                  }}
                >
                  {s.l}
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
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                }}
              >
                {t(
                  "An independent publishing house covering Asia in eight specialist titles.",
                  "Một nhà xuất bản độc lập đưa tin về châu Á qua tám ấn phẩm chuyên sâu.",
                  "Penerbit independen yang meliput Asia melalui delapan publikasi spesialis."
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
                <strong style={{ color: "var(--ink)" }}>Asia Press Corporation</strong> was
                founded in 2023 in Singapore by a group of veteran correspondents and editors who
                shared a single conviction: the most important business, technology, and policy
                stories of this decade would be reported from Asia, by reporters who live in it,
                and they deserved a publisher built for that work from the first day.
              </p>
              <p style={{ margin: "0 0 18px" }}>
                Today the group operates{" "}
                <strong style={{ color: "var(--ink)" }}>eight independent publications</strong>{" "}
                across technology, finance, geopolitics, climate, healthcare, industry, consumer
                affairs, and research. Each title runs under its own editor; the corporation
                provides infrastructure, legal protection, and a single set of editorial
                standards that every title signs.
              </p>
              <p style={{ margin: "0 0 18px" }}>
                We are{" "}
                <strong style={{ color: "var(--ink)" }}>privately and employee-held</strong> – no
                advertising network owns us, no platform pays for placement, and no state has a
                stake. Our complete revenue breakdown, governance structure, and ownership chart
                are published every quarter in our{" "}
                <Link
                  href="/trust/transparency"
                  className="linkish"
                  style={{ color: "var(--accent)" }}
                >
                  Transparency Report
                </Link>
                .
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
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
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
                <p
                  className="serif"
                  style={{
                    margin: "0 0 24px",
                    fontSize: 18,
                    lineHeight: 1.6,
                    color: "var(--ink-2)",
                  }}
                >
                  The decisions made in Singapore, Seoul, Jakarta, Tokyo, Bengaluru, and Hanoi
                  already shape the rest of the global economy. The reporting that informs those
                  decisions should be made in the same rooms – not summarised at distance. We are
                  here to do that work, in public, every day, on the record.
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 24,
                    marginTop: 32,
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
                borderTop: "3px solid var(--ink)",
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
                  fontWeight: 700,
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
                  pillar="asia"
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
                    fontWeight: 700,
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
                  Editor-in-Chief, DailyTechWire · Group Editor, Asia Press Corporation
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
                  Cheryl Tan is a founding editor of Asia Press Corporation. She joined at the
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
                borderTop: "3px solid var(--ink)",
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
                  fontWeight: 700,
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
                      fontWeight: 700,
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

        {/* Ownership */}
        <Reveal>
          <section style={{ marginBottom: 80 }}>
            <div
              style={{
                borderTop: "3px solid var(--ink)",
                paddingTop: 24,
                marginBottom: 32,
              }}
            >
              <div className="kicker" style={{ marginBottom: 6 }}>
                {t("Ownership & funding", "Sở hữu & tài chính", "Kepemilikan & pendanaan")}
              </div>
              <h2
                className="serif"
                style={{
                  margin: 0,
                  fontSize: 32,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                {t(
                  "Who owns this newsroom, and where its money comes from.",
                  "Ai sở hữu toà soạn này, và tiền của nó từ đâu.",
                  "Siapa pemilik redaksi ini, dan dari mana uangnya berasal."
                )}
              </h2>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 32,
              }}
            >
              <div
                style={{
                  padding: 28,
                  background: "var(--surface)",
                  border: "1px solid var(--hair)",
                  borderRadius: 8,
                }}
              >
                <div
                  className="upper"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: ".14em",
                    color: "var(--muted)",
                    marginBottom: 14,
                    textTransform: "uppercase",
                  }}
                >
                  Ownership structure
                </div>
                {OWNERSHIP.map((o) => (
                  <div
                    key={o.k}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: "1px solid var(--hair)",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 13 }}>{o.k}</span>
                    <span className="mono" style={{ fontSize: 14, fontWeight: 600 }}>
                      {o.v}%
                    </span>
                  </div>
                ))}
                <p
                  className="text-mute"
                  style={{
                    margin: "16px 0 0",
                    fontSize: 11,
                    lineHeight: 1.5,
                    fontStyle: "italic",
                  }}
                >
                  No single shareholder controls more than 18% of voting equity. No state, foreign
                  or domestic, holds a stake. Full cap table available on request to regulators
                  and accredited researchers.
                </p>
              </div>
              <div
                style={{
                  padding: 28,
                  background: "var(--surface)",
                  border: "1px solid var(--hair)",
                  borderRadius: 8,
                }}
              >
                <div
                  className="upper"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: ".14em",
                    color: "var(--muted)",
                    marginBottom: 14,
                    textTransform: "uppercase",
                  }}
                >
                  Revenue mix · FY2025
                </div>
                <div
                  style={{
                    display: "flex",
                    height: 18,
                    borderRadius: 4,
                    overflow: "hidden",
                    marginBottom: 18,
                    border: "1px solid var(--hair)",
                  }}
                >
                  {REVENUE.map((r) => (
                    <div
                      key={r.k}
                      style={{
                        width: `${r.v}%`,
                        background: r.color,
                      }}
                      title={`${r.k}: ${r.v}%`}
                    />
                  ))}
                </div>
                {REVENUE.map((r) => (
                  <div
                    key={r.k}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid var(--hair)",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          background: r.color,
                          display: "inline-block",
                          borderRadius: 2,
                        }}
                      />
                      {r.k}
                    </span>
                    <span className="mono" style={{ fontSize: 14, fontWeight: 600 }}>
                      {r.v}%
                    </span>
                  </div>
                ))}
                <p
                  className="text-mute"
                  style={{
                    margin: "16px 0 0",
                    fontSize: 11,
                    lineHeight: 1.5,
                    fontStyle: "italic",
                  }}
                >
                  We do not accept programmatic advertising, sell reader data, or run sponsored
                  content without a top/middle/bottom disclosure that cannot be turned off.{" "}
                  <Link
                    href="/trust/sponsored"
                    className="linkish"
                    style={{ color: "var(--accent)" }}
                  >
                    Read the full policy →
                  </Link>
                </p>
              </div>
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
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.15,
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
                background: "var(--ink)",
                color: "var(--paper)",
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
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: "var(--paper)",
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
                    color: "color-mix(in oklab, var(--paper) 75%, transparent)",
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
                      background: "color-mix(in oklab, var(--paper) 6%, transparent)",
                      border:
                        "1px solid color-mix(in oklab, var(--paper) 12%, transparent)",
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
                          color: "var(--paper)",
                        }}
                      >
                        {line}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "color-mix(in oklab, var(--paper) 55%, transparent)",
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
