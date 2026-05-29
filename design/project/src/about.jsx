// ============ ABOUT PAGE ============
// /about – Asia Press Corporation parent org page

function AboutPage({ navigate }) {
  const t = useT();
  return (
    <div>
      {/* Hero */}
      <section style={{
        background: "var(--ink)", color: "var(--paper)",
        position: "relative", overflow: "hidden"
      }}>
        <GridBackdrop color="rgba(255,255,255,.05)" size={48} fadeRadius="80%" />
        <div style={{ position: "absolute", right: -80, top: -80, width: 320, height: 320, borderRadius: "50%", background: "var(--accent)", opacity: .18, filter: "blur(80px)", pointerEvents: "none" }} />
        <div className="container" style={{ padding: "80px 24px 64px", position: "relative" }}>
          <div className="kicker" style={{ color: "var(--accent)", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <span className="live-dot" style={{ background: "var(--accent)" }} />
            {t("About · Asia Press Corporation", "Về chúng tôi · Asia Press Corporation", "Tentang · Asia Press Corporation")}
          </div>
          <h1 className="serif" style={{
            margin: "0 0 18px", fontSize: 64, fontWeight: 700,
            letterSpacing: "-0.03em", lineHeight: 1.02,
            maxWidth: 900, textWrap: "balance"
          }}>
            {t(
              "Independent journalism from Singapore – covering the most consequential tech, financial, and policy stories in Asia.",
              "Báo chí độc lập từ Singapore – đưa tin về những câu chuyện công nghệ, tài chính và chính sách quan trọng nhất ở châu Á.",
              "Jurnalisme independen dari Singapura – meliput kisah teknologi, keuangan, dan kebijakan terpenting di Asia."
            )}
          </h1>
          <p className="serif" style={{
            margin: "0 0 28px", fontSize: 21, lineHeight: 1.45,
            color: "color-mix(in oklab, var(--paper) 75%, transparent)", maxWidth: 780, textWrap: "pretty"
          }}>
            {t(
              <>DailyTechWire is published by <strong style={{ color: "var(--paper)" }}>Asia Press Corporation Pte. Ltd.</strong>, an independent media group headquartered in Singapore and read in 138 countries.</>,
              <>DailyTechWire được xuất bản bởi <strong style={{ color: "var(--paper)" }}>Asia Press Corporation Pte. Ltd.</strong>, một tập đoàn truyền thông độc lập đặt trụ sở tại Singapore và có bạn đọc ở 138 quốc gia.</>,
              <>DailyTechWire diterbitkan oleh <strong style={{ color: "var(--paper)" }}>Asia Press Corporation Pte. Ltd.</strong>, grup media independen yang berkantor pusat di Singapura dan dibaca di 138 negara.</>
            )}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, marginTop: 36, paddingTop: 28, borderTop: "1px solid color-mix(in oklab, var(--paper) 12%, transparent)", maxWidth: 780 }}>
            {[
            ["2023", "Founded in Singapore", "year"],
            ["8", "Independent publications"],
            ["210+", "Journalists & contributors"],
            ["68%", "Reader-funded revenue"],
            ["100%", "Editorially independent"]].
            map(([n, l, kind]) =>
            <div key={l}>
                <div className="serif" style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--paper)" }}>
                  {kind === "year" ?
                <span className="tnum">{n}</span> :
                <CountUp to={parseFloat(n.replace(/[^0-9.]/g, ""))} suffix={n.replace(/[0-9.]/g, "")} />
                }
                </div>
                <div style={{ fontSize: 11, color: "color-mix(in oklab, var(--paper) 60%, transparent)", marginTop: 4, textTransform: "uppercase", letterSpacing: ".1em" }}>
                  {l}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container" style={{ paddingTop: 64, paddingBottom: 80 }}>
        {/* Who we are */}
        <Reveal>
        <section style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 64, marginBottom: 80 }}>
          <div>
            <div className="kicker" style={{ marginBottom: 8, padding: "0px" }}>{t("Who we are", "Chúng tôi là ai", "Siapa kami")}</div>
            <h2 className="serif" style={{ margin: 0, fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, textWrap: "balance" }}>
              {t(
                  "An independent publishing house covering Asia in eight specialist titles.",
                  "Một nhà xuất bản độc lập đưa tin về châu Á qua tám ấn phẩm chuyên sâu.",
                  "Penerbit independen yang meliput Asia melalui delapan publikasi spesialis."
                )}
            </h2>
          </div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, lineHeight: 1.65, color: "var(--ink-2)" }}>
            <p style={{ margin: "0 0 18px" }}>
              <strong style={{ color: "var(--ink)" }}>Asia Press Corporation</strong> was founded in 2023 in Singapore by a group of veteran correspondents and editors who shared a single conviction: the most important business, technology, and policy stories of this decade would be reported from Asia, by reporters who live in it, and they deserved a publisher built for that work from the first day.
            </p>
            <p style={{ margin: "0 0 18px" }}>
              Today the group operates <strong style={{ color: "var(--ink)" }}>eight independent publications</strong> across technology, finance, geopolitics, climate, healthcare, industry, consumer affairs, and research. Each title runs under its own editor; the corporation provides infrastructure, legal protection, and a single set of editorial standards that every title signs.
            </p>
            <p style={{ margin: "0 0 18px" }}>
              We are <strong style={{ color: "var(--ink)" }}>privately and employee-held</strong> – no advertising network owns us, no platform pays for placement, and no state has a stake. The majority of our revenue comes from paying readers; the remainder is split between newsletter sponsorship, conferences, institutional research, and a clearly labelled studio business. Our complete revenue breakdown, governance structure, and ownership chart are published every quarter in our <a className="linkish" style={{ color: "var(--accent)", cursor: "pointer" }} onClick={() => navigate("/trust/transparency")}>Transparency Report</a>.
            </p>
            <p style={{ margin: 0 }}>
              We hold ourselves to the principles set out in our <a className="linkish" style={{ color: "var(--accent)", cursor: "pointer" }} onClick={() => navigate("/trust/editorial")}>Editorial Standards</a> and our <a className="linkish" style={{ color: "var(--accent)", cursor: "pointer" }} onClick={() => navigate("/trust/ai")}>AI Disclosure</a> policy. These are public documents – nothing internal-only, nothing aspirational. If we fall short of them, we say so on the record.
            </p>
          </div>
        </section>
        </Reveal>

        {/* (What we cover section removed) */}

        {/* Mission & values */}
        <Reveal>
        <section style={{
            marginBottom: 80, padding: "56px 56px",
            background: "var(--surface)", border: "1px solid var(--hair)",
            borderRadius: 12, position: "relative", overflow: "hidden"
          }}>
          <div style={{ position: "absolute", left: -80, top: -80, width: 240, height: 240, borderRadius: "50%", background: "var(--accent)", opacity: .05, filter: "blur(60px)" }} />
          <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 2fr", gap: 48 }}>
            <div>
              <div className="kicker" style={{ marginBottom: 8 }}>{t("Mission", "Sứ mệnh", "Misi")}</div>
              <h2 className="serif" style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, textWrap: "balance" }}>
                {t(
                    "To explain Asia to itself, and to the world that depends on it.",
                    "Giải thích châu Á cho chính châu Á, và cho thế giới phụ thuộc vào nó.",
                    "Menjelaskan Asia kepada Asia sendiri, dan kepada dunia yang bergantung padanya."
                  )}
              </h2>
            </div>
            <div>
              <p className="serif" style={{ margin: "0 0 24px", fontSize: 18, lineHeight: 1.6, color: "var(--ink-2)" }}>
                The decisions made in Singapore, Seoul, Jakarta, Tokyo, Bengaluru, and Hanoi already shape the rest of the global economy. The reporting that informs those decisions should be made in the same rooms – not summarised at distance. We are here to do that work, in public, every day, on the record.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 32 }}>
                {[
                  { k: "Accuracy first", v: "Every story is multi-sourced where possible, and we publish every correction we make. No silent edits, no scrubbed URLs." },
                  { k: "Independence", v: "We refuse paid travel, accept no review units we don't return, and disclose every conflict of interest on the reporter's bio." },
                  { k: "Transparency", v: "Our ownership, revenue mix, and editorial leadership are public – and updated quarterly. Source documents are linked wherever lawful." },
                  { k: "Service to readers", v: "We exist to make our readers smarter and better informed – not to sell them attention to anyone else." }].
                  map((v) =>
                  <div key={v.k}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <Icon name="check" size={14} color="var(--accent)" stroke={2.4} />
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{v.k}</div>
                    </div>
                    <div className="text-mute" style={{ fontSize: 13, lineHeight: 1.55 }}>{v.v}</div>
                  </div>
                  )}
              </div>
            </div>
          </div>
        </section>
        </Reveal>

        {/* Editor-in-Chief profile */}
        <Reveal>
        <section style={{ marginBottom: 80 }}>
          <div style={{ borderTop: "3px solid var(--ink)", paddingTop: 24, marginBottom: 36 }}>
            <div className="kicker" style={{ marginBottom: 6 }}>{t("Editor-in-Chief", "Tổng biên tập", "Pemimpin Redaksi")}</div>
            <h2 className="serif" style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
              {t(
                  "The newsroom is led by an editor with over two decades on the Asia beat.",
                  "Toà soạn được dẫn dắt bởi một biên tập viên với hơn hai thập kỷ đưa tin về châu Á.",
                  "Redaksi dipimpin oleh editor dengan pengalaman lebih dari dua dekade meliput Asia."
                )}
            </h2>
          </div>
          <div style={{
              display: "grid", gridTemplateColumns: "360px 1fr", gap: 48,
              background: "var(--surface)", border: "1px solid var(--hair)", borderRadius: 12,
              padding: 36, alignItems: "flex-start"
            }}>
            <div>
              <CoverArt pillar="asia" seed="eic-cheryl-tan" variant={5} height={420} label="EIC PORTRAIT" />
              <div className="text-mute mono" style={{ fontSize: 11, marginTop: 10, fontStyle: "italic" }}>
                Portrait placeholder · staff photograph to follow
              </div>
            </div>
            <div>
              <div className="kicker" style={{ color: "var(--accent)", marginBottom: 8 }}>
                <span style={{ display: "inline-block", width: 8, height: 8, background: "var(--accent)", marginRight: 8, verticalAlign: "middle" }} />
                Cheryl Tan
              </div>
              <h3 className="serif" style={{ margin: "0 0 8px", fontSize: 42, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.05 }}>
                Cheryl Tan
              </h3>
              <div className="text-mute" style={{ fontSize: 15, marginBottom: 24, fontFamily: "var(--font-serif)" }}>
                Editor-in-Chief, DailyTechWire · Group Editor, Asia Press Corporation
              </div>

              <p style={{ margin: "0 0 14px", fontSize: 16, lineHeight: 1.65, fontFamily: "var(--font-serif)", color: "var(--ink)" }}>
                Cheryl Tan is a founding editor of Asia Press Corporation. She joined at the company's launch in 2023 as Editor-in-Chief of DailyTechWire and was appointed Group Editor in 2024, where she is responsible for the editorial direction of all eight publications and the standards framework that governs them.
              </p>
              <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.65, fontFamily: "var(--font-serif)", color: "var(--ink-2)" }}>
                She has spent more than two decades reporting on Asia, with previous senior editing and bureau-chief roles at international wire services and regional dailies, in postings across Singapore, Tokyo, and Hong Kong. Her work over the years has covered cross-border financial investigations, technology policy, and the people building consequential institutions across the region.
              </p>
              <p style={{ margin: "0 0 24px", fontSize: 15, lineHeight: 1.65, fontFamily: "var(--font-serif)", color: "var(--ink-2)" }}>
                Cheryl is active in regional press-freedom and editorial-standards work, and has guest-lectured on journalism and ethics at several universities in Singapore and the wider region. She lives in Singapore.
              </p>

              {/* Credentials grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, paddingTop: 20, borderTop: "1px solid var(--hair)" }}>
                {[
                  { k: "Career", v: "Two-plus decades · senior editing & bureau leadership across the region" },
                  { k: "Languages", v: "English · Mandarin · Bahasa Melayu · functional Japanese" },
                  { k: "Focus areas", v: "Cross-border investigations · technology policy · capital flows" },
                  { k: "Affiliations", v: "Advisor & speaker on editorial standards and press-freedom work" }].
                  map((c) =>
                  <div key={c.k}>
                    <div className="upper" style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".14em", color: "var(--muted)", marginBottom: 4 }}>{c.k}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ink-2)" }}>{c.v}</div>
                  </div>
                  )}
              </div>
            </div>
          </div>
        </section>
        </Reveal>

        {/* Editorial leadership / masthead */}
        <Reveal>
        <section style={{ marginBottom: 80 }}>
          <div style={{ borderTop: "3px solid var(--ink)", paddingTop: 24, marginBottom: 32 }}>
            <div className="kicker" style={{ marginBottom: 6 }}>{t("Editorial leadership", "Đội ngũ biên tập", "Kepemimpinan editorial")}</div>
            <h2 className="serif" style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
              {t("The masthead, in full.", "Toàn bộ ban biên tập.", "Tim redaksi, lengkap.")}
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {MASTHEAD.map((m) =>
              <div key={m.name} style={{ padding: 18, background: "var(--surface)", border: "1px solid var(--hair)", borderRadius: 8 }}>
                <Avatar name={m.name} size={48} />
                <div className="serif" style={{ fontSize: 17, fontWeight: 700, marginTop: 12, letterSpacing: "-0.01em" }}>
                  {m.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2, lineHeight: 1.4 }}>{m.role}</div>
                <div className="mono text-mute-2" style={{ fontSize: 11, marginTop: 6, letterSpacing: ".06em" }}>
                  {m.city} · {m.years}y on the beat
                </div>
              </div>
              )}
          </div>
        </section>
        </Reveal>

        {/* (Bureaus section removed – too few offices to publish a list yet) */}

        {/* (Editorial-commitments section removed) */}

        {/* Ownership & funding */}
        <Reveal>
        <section style={{ marginBottom: 80 }}>
          <div style={{ borderTop: "3px solid var(--ink)", paddingTop: 24, marginBottom: 32 }}>
            <div className="kicker" style={{ marginBottom: 6 }}>{t("Ownership & funding", "Sở hữu & tài chính", "Kepemilikan & pendanaan")}</div>
            <h2 className="serif" style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
              {t(
                  "Who owns this newsroom, and where its money comes from.",
                  "Ai sở hữu toà soạn này, và tiền của nó từ đâu.",
                  "Siapa pemilik redaksi ini, dan dari mana uangnya berasal."
                )}
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            <div style={{ padding: 28, background: "var(--surface)", border: "1px solid var(--hair)", borderRadius: 8 }}>
              <div className="upper" style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".14em", color: "var(--muted)", marginBottom: 14 }}>Ownership structure</div>
              {OWNERSHIP.map((o) =>
                <div key={o.k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--hair)", alignItems: "center" }}>
                  <span style={{ fontSize: 13 }}>{o.k}</span>
                  <span className="mono" style={{ fontSize: 14, fontWeight: 600 }}>{o.v}%</span>
                </div>
                )}
              <p className="text-mute" style={{ margin: "16px 0 0", fontSize: 11, lineHeight: 1.5, fontStyle: "italic" }}>
                No single shareholder controls more than 18% of voting equity. No state, foreign or domestic, holds a stake. Full cap table available on request to regulators and accredited researchers.
              </p>
            </div>
            <div style={{ padding: 28, background: "var(--surface)", border: "1px solid var(--hair)", borderRadius: 8 }}>
              <div className="upper" style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".14em", color: "var(--muted)", marginBottom: 14 }}>Revenue mix · FY2025</div>
              {/* Visual bar */}
              <div style={{ display: "flex", height: 18, borderRadius: 4, overflow: "hidden", marginBottom: 18, border: "1px solid var(--hair)" }}>
                {REVENUE.map((r) =>
                  <div key={r.k} style={{
                    width: `${r.v}%`, background: r.color,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }} title={`${r.k}: ${r.v}%`} />
                  )}
              </div>
              {REVENUE.map((r) =>
                <div key={r.k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--hair)", alignItems: "center" }}>
                  <span style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 10, height: 10, background: r.color, display: "inline-block", borderRadius: 2 }} />
                    {r.k}
                  </span>
                  <span className="mono" style={{ fontSize: 14, fontWeight: 600 }}>{r.v}%</span>
                </div>
                )}
              <p className="text-mute" style={{ margin: "16px 0 0", fontSize: 11, lineHeight: 1.5, fontStyle: "italic" }}>
                We do not accept programmatic advertising, sell reader data, or run sponsored content without a top/middle/bottom disclosure that cannot be turned off. <a className="linkish" style={{ color: "var(--accent)", cursor: "pointer" }} onClick={() => navigate("/trust/sponsored")}>Read the full policy →</a>
              </p>
            </div>
          </div>
        </section>
        </Reveal>

        {/* Editorial standards quick links */}
        <Reveal>
        <section style={{ marginBottom: 80, padding: "40px 48px", background: "var(--surface-2)", borderRadius: 12, border: "1px solid var(--hair-2)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 32, alignItems: "center" }}>
            <div>
              <div className="kicker" style={{ marginBottom: 8 }}>Read the rules</div>
              <h2 className="serif" style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15, textWrap: "balance" }}>
                Our editorial framework, in your own words.
              </h2>
              <p className="text-mute" style={{ margin: "10px 0 0", fontSize: 13, lineHeight: 1.55 }}>
                Every policy that governs our newsroom is published. Nothing is internal-only.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                ["editorial", "Editorial Standards", "How we report. What we will and won't publish."],
                ["ai", "AI Disclosure", "What 'AI-assisted' means in our newsroom."],
                ["corrections", "Corrections Log", "Public record. Most recent first."],
                ["transparency", "Transparency Report", "Headcount, revenue, requests, removals."],
                ["sponsored", "Sponsored & Affiliate", "DTW Studio rules + commission disclosure."]].
                map(([k, t, d]) =>
                <a key={k} onClick={() => navigate(`/trust/${k}`)} style={{
                  display: "flex", gap: 12, padding: 14, cursor: "pointer",
                  background: "var(--paper)", border: "1px solid var(--hair)", borderRadius: 6,
                  textDecoration: "none", color: "var(--ink)"
                }} className="card-hover">
                  <Icon name="check" size={16} color="var(--accent)" stroke={2.4} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t}</div>
                    <div className="text-mute" style={{ fontSize: 11, marginTop: 2, lineHeight: 1.4 }}>{d}</div>
                  </div>
                  <Icon name="arrow-r" size={14} color="var(--muted-2)" />
                </a>
                )}
            </div>
          </div>
        </section>
        </Reveal>

        {/* Tip line / contact */}
        <Reveal>
        <section style={{ marginBottom: 40 }}>
          <div style={{
              background: "var(--ink)", color: "var(--paper)",
              borderRadius: 12, padding: "48px 48px",
              display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 48, alignItems: "center",
              position: "relative", overflow: "hidden"
            }}>
            <GridBackdrop color="rgba(255,255,255,.05)" size={32} fadeRadius="80%" />
            <div style={{ position: "absolute", right: -60, top: -60, width: 240, height: 240, borderRadius: "50%", background: "var(--accent)", opacity: .18, filter: "blur(60px)" }} />
            <div style={{ position: "relative" }}>
              <div className="kicker" style={{ color: "var(--accent)", marginBottom: 10 }}>
                <Icon name="lock" size={12} stroke={2.2} style={{ verticalAlign: "middle", marginRight: 6 }} />
                Securely contact the newsroom
              </div>
              <h3 className="serif" style={{ margin: "0 0 14px", fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--paper)", lineHeight: 1.15 }}>
                Tips, documents, and on-background conversations.
              </h3>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "color-mix(in oklab, var(--paper) 75%, transparent)", maxWidth: 600 }}>
                We protect our sources. We use end-to-end encrypted channels by default, hold tips on a separate system with restricted access, and have never disclosed a source to a third party – including law enforcement – without a sealed legal challenge first. If you have something to share, we'd like to hear from you.
              </p>
            </div>
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["mail", "tips@dailytechwire.asia", "PGP key on request"],
                ["lock", "Signal · +65 8XXX XXXX", "End-to-end encrypted"],
                ["globe", "SecureDrop · onion link", "Tor-only, anonymous"],
                ["mail", "corrections@dailytechwire.asia", "Spotted an error?"]].
                map(([icon, line, sub]) =>
                <div key={line} style={{
                  padding: "12px 14px", background: "color-mix(in oklab, var(--paper) 6%, transparent)",
                  border: "1px solid color-mix(in oklab, var(--paper) 12%, transparent)", borderRadius: 6,
                  display: "flex", gap: 12, alignItems: "center"
                }}>
                  <Icon name={icon} size={16} color="var(--accent)" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="mono" style={{ fontSize: 12, fontWeight: 500, color: "var(--paper)" }}>{line}</div>
                    <div style={{ fontSize: 10, color: "color-mix(in oklab, var(--paper) 55%, transparent)", marginTop: 2 }}>{sub}</div>
                  </div>
                </div>
                )}
            </div>
          </div>
        </section>
        </Reveal>

        {/* Footer-style bizinfo */}
        <section style={{ paddingTop: 32, borderTop: "1px solid var(--hair)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {[
          ["Registered office", "Asia Press Corporation Pte. Ltd.\n61 Robinson Road, #12-01\nSingapore 068893"],
          ["Company particulars", "UEN: 201112345A\nGST: 201112345A-G\nMICA Permit: MCI(P)042/06/2025"],
          ["Press inquiries", "press@asiapress.com\nMedia kit (PDF, 4MB) →"],
          ["Investor relations", "ir@asiapress.com\nAnnual report 2025 →"]].
          map(([k, v]) =>
          <div key={k}>
              <div className="upper" style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".14em", color: "var(--muted)", marginBottom: 8 }}>{k}</div>
              <div style={{ fontSize: 12, lineHeight: 1.6, color: "var(--ink-2)", whiteSpace: "pre-line" }}>{v}</div>
            </div>
          )}
        </section>
      </div>
    </div>);

}

// ============ ABOUT DATA ============
const BEATS = [
{ id: "tech", n: 1, name: "Technology & Markets", icon: "spark", color: "#E04E1F",
  desc: "Frontier models, infrastructure, developer practice, and the policy that shapes them. The flagship beat – you're reading it now.", current: true },
{ id: "fin", n: 2, name: "Finance & Capital", icon: "trend-up", color: "#0EA5E9",
  desc: "Capital flows, public-market filings, private deals, and the regulators who watch them across ASEAN, India, Greater China, Japan, and Korea." },
{ id: "geo", n: 3, name: "Geopolitics & Regional Affairs", icon: "globe", color: "#7C3AED",
  desc: "Foreign policy, trade, and security across Southeast Asia and the Indo-Pacific – reported as a beat, not a news cycle." },
{ id: "clim", n: 4, name: "Climate & Energy", icon: "feather", color: "#16A34A",
  desc: "Climate policy, the energy transition, and the industrial build-out underneath both – from minerals to megawatts." },
{ id: "hlth", n: 5, name: "Healthcare & Biotech", icon: "data", color: "#D97706",
  desc: "Healthcare systems, biotech investment, and the public-health stories with the patience to follow them properly." },
{ id: "ind", n: 6, name: "Industry & Supply Chain", icon: "product", color: "#475569",
  desc: "Manufacturing, logistics, semiconductors, and the physical layer of the regional economy that everything else sits on top of." },
{ id: "con", n: 7, name: "Consumer & Society", icon: "user", color: "#0C4A6E",
  desc: "How a billion-plus consumers spend, work, and live – retail, media, mobility, and the cultural shifts moving across the region." },
{ id: "res", n: 8, name: "Research & Data Briefings", icon: "data", color: "#7C2D12",
  desc: "Subscriber-only data products, custom briefings, and the research arm that supports every other newsroom in the group." }];


const MASTHEAD = [
{ name: "Cheryl Tan", role: "Editor-in-Chief, DailyTechWire / Group Editor", city: "Singapore", years: "20+" },
{ name: "Aravind Subramanian", role: "Managing Editor", city: "Bengaluru", years: "18" },
{ name: "Hiroko Yamamoto", role: "Executive Editor, Newsroom", city: "Tokyo", years: "19" },
{ name: "Daniel Park", role: "Standards Editor & Ombudsperson", city: "Seoul", years: "16" },
{ name: "Thao Nguyen", role: "Editor, Asia Desk", city: "Hanoi", years: "14" },
{ name: "Indira Sharma", role: "Editor, Markets & Capital", city: "Mumbai", years: "17" },
{ name: "Wei-Ling Wang", role: "Editor, AI & Frontier Tech", city: "Singapore", years: "12" },
{ name: "Joshua Lim", role: "Head of Data Desk", city: "Singapore", years: "11" }];


const BUREAUS = [
{ city: "Singapore", role: "Headquarters · group masthead", tz: "GMT+8", opened: "Est. 2023", reporters: 48, chief: "Cheryl Tan" },
{ city: "Tokyo", role: "North Asia bureau", tz: "GMT+9", opened: "Est. 2023", reporters: 22, chief: "Hiroko Yamamoto" },
{ city: "Seoul", role: "Korea & tech-frontier desk", tz: "GMT+9", opened: "Est. 2024", reporters: 16, chief: "Daniel Park" },
{ city: "Jakarta", role: "Indonesia & ASEAN desk", tz: "GMT+7", opened: "Est. 2024", reporters: 14, chief: "Arif Rahman" },
{ city: "Bengaluru", role: "India & Subcontinent", tz: "GMT+5:30", opened: "Est. 2024", reporters: 19, chief: "Aravind Subramanian" },
{ city: "Hanoi", role: "Vietnam & Mekong desk", tz: "GMT+7", opened: "Est. 2025", reporters: 9, chief: "Thao Nguyen" }];


// (Legacy AWARDS / MEMBERSHIPS arrays removed – replaced by the inline
//  "What we promise / What we don't do" block in the Editorial commitments section.)

const OWNERSHIP = [
{ k: "Founding partners", v: 42 },
{ k: "Employee share scheme", v: 18 },
{ k: "Independent endowment trust", v: 22 },
{ k: "Patient-capital partners", v: 16 },
{ k: "Treasury", v: 2 }];


const REVENUE = [
{ k: "Reader subscriptions (Pro & individual)", v: 68, color: "#E04E1F" },
{ k: "Newsletter & event sponsorship", v: 14, color: "#0EA5E9" },
{ k: "DTW Studio (labelled sponsored work)", v: 10, color: "#D97706" },
{ k: "Research subscriptions (institutional)", v: 6, color: "#7C3AED" },
{ k: "Affiliate (disclosed product reviews)", v: 2, color: "#16A34A" }];


Object.assign(window, { AboutPage });