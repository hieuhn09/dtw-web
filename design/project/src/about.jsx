// ============ ABOUT PAGE ============
// /about, Asia Press Centre Group (APCG) parent org page

function AboutPage({ navigate, variant = "trust" }) {
  const t = useT();
  const nr = variant === "newsroom";

  const heroKicker = nr ?
  t("Inside the newsroom", "Bên trong toà soạn", "Di dalam ruang redaksi") :
  t("About · Asia Press Centre Group", "Về chúng tôi · Asia Press Centre Group", "Tentang · Asia Press Centre Group");

  const heroTitle = nr ?
  t(
    "Inside the newsroom, how we report Asia, beat by beat, in-region and in-language",
    "Bên trong toà soạn, cách chúng tôi đưa tin về châu Á, theo từng mảng, ngay tại khu vực và bằng ngôn ngữ bản địa",
    "Di dalam ruang redaksi, bagaimana kami meliput Asia, per bidang, di kawasan dan dalam bahasa setempat"
  ) :
  t(
    "The trusted voice of Asia, read in your language",
    "Tiếng nói đáng tin cậy của châu Á, đọc bằng ngôn ngữ của bạn",
    "Suara tepercaya Asia, dibaca dalam bahasa Anda"
  );

  const heroSub = nr ?
  t(
    <>Dailytechwire is the technology title of <strong style={{ color: "#FFFFFF" }}>Asia Press Centre Group (APCG)</strong>. <strong style={{ color: "#FFFFFF" }}>Here is how the reporting actually gets made</strong>, in-region, in-language, on the record.</>,
    <>Dailytechwire là ấn phẩm công nghệ của <strong style={{ color: "#FFFFFF" }}>Asia Press Centre Group (APCG)</strong>. <strong style={{ color: "#FFFFFF" }}>Đây là cách bài báo thực sự được tạo ra</strong>, ngay tại khu vực, bằng ngôn ngữ bản địa, công khai minh bạch.</>,
    <>Dailytechwire adalah publikasi teknologi dari <strong style={{ color: "#FFFFFF" }}>Asia Press Centre Group (APCG)</strong>. <strong style={{ color: "#FFFFFF" }}>Beginilah liputan benar-benar dibuat</strong>, di kawasan, dalam bahasa setempat, secara terbuka.</>
  ) :
  t(
    <>Dailytechwire is the technology title of <strong style={{ color: "#FFFFFF" }}>Asia Press Centre Group (APCG)</strong>, a Singapore-based media network of trusted journalism.</>,
    <>Dailytechwire là ấn phẩm công nghệ của <strong style={{ color: "#FFFFFF" }}>Asia Press Centre Group (APCG)</strong>, mạng lưới truyền thông có trụ sở tại Singapore, làm báo chí uy tín.</>,
    <>Dailytechwire adalah publikasi teknologi dari <strong style={{ color: "#FFFFFF" }}>Asia Press Centre Group (APCG)</strong>, jaringan media yang berbasis di Singapura dengan jurnalisme tepercaya.</>
  );

  const heroPillars = nr ?
  [
  [t("In-region reporting", "Đưa tin tại chỗ", "Liputan di kawasan"), t("Reporters who live the markets they cover.", "Phóng viên sống ngay trong thị trường họ đưa tin.", "Reporter yang menghidupi pasar yang mereka liput.")],
  [t("In the languages of the region", "Bằng ngôn ngữ bản địa", "Dalam bahasa kawasan"), t("Reporting published in the languages our readers speak.", "Đưa tin xuất bản bằng chính ngôn ngữ độc giả nói.", "Liputan terbit dalam bahasa yang dibaca pembaca kami.")],
  [t("Part of one network", "Một phần của mạng lưới", "Bagian dari satu jaringan"), t("Backed by the wider APCG title family.", "Được hậu thuẫn bởi hệ thống tựa báo APCG.", "Didukung keluarga publikasi APCG yang lebih luas.")]] :
  [
  [t("A trusted environment", "Môi trường uy tín", "Lingkungan tepercaya"), t("Independent journalism our readers rely on.", "Báo chí độc lập mà độc giả tin cậy.", "Jurnalisme independen yang diandalkan pembaca.")],
  [t("Asia and the world", "Châu Á và thế giới", "Asia dan dunia"), t("Regional authority, read across languages.", "Tầm vóc khu vực, đọc bằng nhiều ngôn ngữ.", "Otoritas regional, dibaca lintas bahasa.")],
  [t("One network", "Một mạng lưới", "Satu jaringan"), t("Business, finance, travel, luxury and technology.", "Kinh doanh, tài chính, du lịch, xa xỉ và công nghệ.", "Bisnis, keuangan, perjalanan, kemewahan dan teknologi.")]];

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: "var(--banner)", color: "#E8EDF7",
        position: "relative", overflow: "hidden"
      }}>
        <GridBackdrop color="rgba(255, 255, 255, .05)" size={48} fadeRadius="80%" />
        <div style={{ position: "absolute", right: -80, top: -80, width: 320, height: 320, borderRadius: "50%", background: "var(--accent)", opacity: .18, filter: "blur(80px)", pointerEvents: "none" }} />
        <div className="container" style={{ padding: "80px 24px 64px", position: "relative" }}>
          <div className="kicker" style={{ color: "var(--accent)", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <span className="live-dot" style={{ background: "var(--accent)" }} />
            {heroKicker}
          </div>
          <h1 className="serif" style={{
            margin: "0 0 18px", fontSize: 64, fontWeight: 650,
            letterSpacing: "-0.03em", lineHeight: 1.02,
            maxWidth: 900, textWrap: "balance"
          }}>
            {heroTitle}
          </h1>
          <p className="serif" style={{
            margin: "0 0 28px", fontSize: 21, lineHeight: 1.45,
            color: "rgba(232, 237, 247, 0.75)", maxWidth: 780, textWrap: "pretty"
          }}>
            {heroSub}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, marginTop: 36, paddingTop: 28, borderTop: "1px solid rgba(232, 237, 247, 0.12)", maxWidth: 820 }}>
            {heroPillars.
            map(([h, d]) =>
            <div key={h}>
                <div className="serif" style={{ fontSize: 19, fontWeight: 650, letterSpacing: "-0.01em", color: "#FFFFFF", lineHeight: 1.2 }}>
                  {h}
                </div>
                <div style={{ fontSize: 12.5, color: "rgba(232, 237, 247, 0.62)", marginTop: 7, lineHeight: 1.5 }}>
                  {d}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container" style={{ paddingTop: 64, paddingBottom: 80 }}>
        {/* Who we are, trust variant */}
        {!nr && <Reveal>
        <section style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 64, marginBottom: 80 }}>
          <div>
            <div className="kicker" style={{ marginBottom: 8, padding: "0px" }}>{t("Who we are", "Chúng tôi là ai", "Siapa kami")}</div>
            <h2 className="serif" style={{ margin: 0, fontSize: 34, fontWeight: 650, letterSpacing: "-0.02em", lineHeight: 1.1, textWrap: "balance" }}>
              {t(
                  "An independent network publishing trusted journalism across Asia and the world",
                  "Một mạng lưới độc lập làm báo chí uy tín khắp châu Á và thế giới",
                  "Jaringan independen yang menerbitkan jurnalisme tepercaya di Asia dan dunia"
                )}
            </h2>
          </div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, lineHeight: 1.65, color: "var(--ink-2)" }}>
            <p style={{ margin: "0 0 18px" }}>
              <strong style={{ color: "var(--ink)" }}>Asia Press Centre Group (APCG)</strong> is a Singapore-headquartered media network, a family of trusted multilingual titles spanning business, finance, geopolitics, technology, travel, lifestyle and design. Dailytechwire is its technology title.
            </p>
            <p style={{ margin: "0 0 18px" }}>
              The conviction behind the network is a simple one: the most consequential business, technology, and policy stories of this decade are made in Asia, and they deserve to be reported from inside the region, by people who live in it, in the languages their readers actually speak.
            </p>
            <p style={{ margin: "0 0 18px" }}>
              Each title runs under its own editor; the group provides the infrastructure, legal protection, and a single set of editorial standards that every title signs. We are <strong style={{ color: "var(--ink)" }}>editorially independent</strong>, no advertiser, platform, or state directs what we cover.
            </p>
            <p style={{ margin: 0 }}>
              We hold ourselves to the principles set out in our <a className="linkish" style={{ color: "var(--accent)", cursor: "pointer" }} onClick={() => navigate("/trust/editorial")}>Editorial Standards</a> and our <a className="linkish" style={{ color: "var(--accent)", cursor: "pointer" }} onClick={() => navigate("/trust/ai")}>AI Disclosure</a> policy. These are public documents, nothing internal-only, nothing aspirational. If we fall short of them, we say so on the record.
            </p>
          </div>
        </section>
        </Reveal>}

        {/* What we cover, newsroom variant */}
        {nr && <Reveal>
        <section style={{ marginBottom: 80 }}>
          <div style={{ borderTop: "3px solid var(--brand-navy)", paddingTop: 24, marginBottom: 32 }}>
            <div className="kicker" style={{ marginBottom: 6 }}>{t("What we cover", "Chúng tôi đưa tin gì", "Yang kami liput")}</div>
            <h2 className="serif" style={{ margin: 0, fontSize: 32, fontWeight: 650, letterSpacing: "-0.02em", textWrap: "balance" }}>
              {t(
                  "The sectors we cover, each with reporters who live the subject",
                  "Các lĩnh vực chúng tôi đưa tin, mỗi mảng có phóng viên sống cùng chủ đề",
                  "Bidang-bidang yang kami liput, masing-masing dengan reporter yang menghidupi topiknya"
                )}
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {BEATS.map((b) =>
              <div key={b.id} style={{ position: "relative", display: "flex", gap: 16, padding: 22, background: "var(--surface)", border: "1px solid var(--hair)", borderRadius: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `color-mix(in oklab, ${b.color} 14%, transparent)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon name={b.icon} size={20} color={b.color} stroke={2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <div className="serif" style={{ fontSize: 17, fontWeight: 650, letterSpacing: "-0.01em" }}>{b.name}</div>
                    {b.current &&
                    <span className="mono" style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: "var(--accent)", color: "#fff", fontWeight: 600, letterSpacing: ".08em" }}>YOU ARE HERE</span>}
                  </div>
                  <div className="text-mute" style={{ fontSize: 13, lineHeight: 1.55, marginTop: 6 }}>{b.desc}</div>
                </div>
              </div>
              )}
          </div>
        </section>
        </Reveal>}
        {/* Mission & values, trust variant */}
        {!nr && <Reveal>
        <section style={{
            marginBottom: 80, padding: "40px 44px",
            background: "var(--surface)", border: "1px solid var(--hair)",
            borderRadius: 12, position: "relative", overflow: "hidden"
          }}>
          <div style={{ position: "absolute", left: -80, top: -80, width: 240, height: 240, borderRadius: "50%", background: "var(--accent)", opacity: .05, filter: "blur(60px)" }} />
          <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 2fr", gap: 48, alignItems: "start" }}>
            <div>
              <div className="kicker" style={{ marginBottom: 8 }}>{t("Mission", "Sứ mệnh", "Misi")}</div>
              <h2 className="serif" style={{ margin: 0, fontSize: 32, fontWeight: 650, letterSpacing: "-0.02em", lineHeight: 1.1, textWrap: "balance" }}>
                {t(
                    "To explain Asia to itself, and to the world that depends on it",
                    "Giải thích châu Á cho chính châu Á, và cho thế giới phụ thuộc vào nó",
                    "Menjelaskan Asia kepada Asia sendiri, dan kepada dunia yang bergantung padanya"
                  )}
              </h2>
            </div>
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                {[
                  { k: "Accuracy first", v: "Every story is multi-sourced where possible, and we publish every correction we make. No silent edits, no scrubbed URLs." },
                  { k: "Independence", v: "We refuse paid travel, accept no review units we don't return, and disclose every conflict of interest on the reporter's bio." },
                  { k: "Transparency", v: "Our editorial leadership and standards are public, and we link source documents wherever lawful. No silent edits." },
                  { k: "Service to readers", v: "We exist to make our readers smarter and better informed, not to sell them attention to anyone else." }].
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
        </Reveal>}

        {/* Editor-in-Chief profile, newsroom variant */}
        {nr && <Reveal>
        <section style={{ marginBottom: 80 }}>
          <div style={{ borderTop: "3px solid var(--brand-navy)", paddingTop: 24, marginBottom: 36 }}>
            <div className="kicker" style={{ marginBottom: 6 }}>{t("Editor-in-Chief", "Tổng biên tập", "Pemimpin Redaksi")}</div>
            <h2 className="serif" style={{ margin: 0, fontSize: 32, fontWeight: 650, letterSpacing: "-0.02em" }}>
              {t(
                  "The newsroom is led by a veteran editor of the Asia beat",
                  "Toà soạn được dẫn dắt bởi một biên tập viên kỳ cựu của mảng châu Á",
                  "Redaksi dipimpin oleh editor veteran di bidang Asia"
                )}
            </h2>
          </div>
          <div style={{
              background: "var(--surface)", border: "1px solid var(--hair)", borderRadius: 12,
              padding: 36, alignItems: "flex-start"
            }}>
            <div>
              <h3 className="serif" style={{ margin: "0 0 8px", fontSize: 42, fontWeight: 650, letterSpacing: "-0.025em", lineHeight: 1.05 }}>
                Cheryl Tan
              </h3>
              <div className="text-mute" style={{ fontSize: 15, marginBottom: 24, fontFamily: "var(--font-serif)" }}>
                Editor-in-Chief, dailytechwire · Asia Press Centre Group
              </div>

              <p style={{ margin: "0 0 14px", fontSize: 16, lineHeight: 1.65, fontFamily: "var(--font-serif)", color: "var(--ink)" }}>
                Cheryl Tan is a founding editor of Asia Press Centre Group and the Editor-in-Chief of dailytechwire, where she sets the title's editorial direction and the standards framework that governs it.
              </p>
              <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.65, fontFamily: "var(--font-serif)", color: "var(--ink-2)" }}>
                She has spent a long career reporting on Asia, with previous senior editing and bureau-chief roles at international wire services and regional dailies, in postings across Singapore, Tokyo, and Hong Kong. Her work has covered cross-border financial investigations, technology policy, and the people building consequential institutions across the region.
              </p>
              <p style={{ margin: "0 0 24px", fontSize: 15, lineHeight: 1.65, fontFamily: "var(--font-serif)", color: "var(--ink-2)" }}>
                Cheryl is active in regional press-freedom and editorial-standards work, and has guest-lectured on journalism and ethics at several universities in Singapore and the wider region. She lives in Singapore.
              </p>

              {/* Credentials grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, paddingTop: 20, borderTop: "1px solid var(--hair)" }}>
                {[
                  { k: "Career", v: "Senior editing & bureau leadership across the region" },
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
        </Reveal>}

        {/* Editorial leadership / masthead, newsroom variant */}
        {nr && <Reveal>
        <section style={{ marginBottom: 80 }}>
          <div style={{ borderTop: "3px solid var(--brand-navy)", paddingTop: 24, marginBottom: 32 }}>
            <div className="kicker" style={{ marginBottom: 6 }}>{t("Editorial leadership", "Đội ngũ biên tập", "Kepemimpinan editorial")}</div>
            <h2 className="serif" style={{ margin: 0, fontSize: 32, fontWeight: 650, letterSpacing: "-0.02em" }}>
              {t("The masthead, in full", "Toàn bộ ban biên tập", "Tim redaksi, lengkap")}
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {MASTHEAD.map((m) =>
              <div key={m.name} style={{ padding: 18, background: "var(--surface)", border: "1px solid var(--hair)", borderRadius: 8 }}>
                <Avatar name={m.name} size={48} />
                <div className="serif" style={{ fontSize: 17, fontWeight: 650, marginTop: 12, letterSpacing: "-0.01em" }}>
                  {m.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2, lineHeight: 1.4 }}>{m.role}</div>
                <div className="mono text-mute-2" style={{ fontSize: 11, marginTop: 6, letterSpacing: ".06em" }}>
                  {m.city}
                </div>
              </div>
              )}
          </div>
        </section>
        </Reveal>}

        {/* Bureaus & desks, newsroom variant */}
        {nr && <Reveal>
        <section style={{ marginBottom: 80 }}>
          <div style={{ borderTop: "3px solid var(--brand-navy)", paddingTop: 24, marginBottom: 32 }}>
            <div className="kicker" style={{ marginBottom: 6 }}>{t("Bureaus & desks", "Văn phòng & ban", "Biro & meja")}</div>
            <h2 className="serif" style={{ margin: 0, fontSize: 32, fontWeight: 650, letterSpacing: "-0.02em", textWrap: "balance" }}>
              {t(
                  "Reporting in-region, and in the languages our readers speak",
                  "Đưa tin ngay tại khu vực, bằng chính ngôn ngữ độc giả nói",
                  "Meliput di kawasan, dalam bahasa yang dibaca pembaca"
                )}
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {BUREAUS.map((b) =>
              <div key={b.city} style={{ padding: 22, background: "var(--surface)", border: "1px solid var(--hair)", borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div className="serif" style={{ fontSize: 21, fontWeight: 650, letterSpacing: "-0.01em" }}>{b.city}</div>
                  <span className="mono text-mute-2" style={{ fontSize: 11 }}>{b.tz}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 4, lineHeight: 1.4 }}>{b.role}</div>
                <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--hair)" }}>
                  <div style={{ fontSize: 13, lineHeight: 1.3 }}>
                    <span className="upper text-mute-2" style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".12em", marginRight: 8 }}>Chief</span>
                    <span style={{ fontWeight: 600 }}>{b.chief}</span>
                  </div>
                </div>
              </div>
              )}
          </div>
        </section>
        </Reveal>}

        {/* Editorial standards quick links, trust variant */}
        {!nr && <Reveal>
        <section style={{ marginBottom: 80, padding: "40px 48px", background: "var(--surface-2)", borderRadius: 12, border: "1px solid var(--hair-2)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 32, alignItems: "center" }}>
            <div>
              <div className="kicker" style={{ marginBottom: 8 }}>Read the rules</div>
              <h2 className="serif" style={{ margin: 0, fontSize: 28, fontWeight: 650, letterSpacing: "-0.02em", lineHeight: 1.15, textWrap: "balance" }}>
                Our editorial framework, in your own words
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
        </Reveal>}

        {/* Tip line / contact, both variants */}
        <Reveal>
        <section style={{ marginBottom: 40 }}>
          <div style={{
              background: "var(--banner)", color: "#E8EDF7",
              borderRadius: 12, padding: "48px 48px",
              display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 48, alignItems: "center",
              position: "relative", overflow: "hidden"
            }}>
            <GridBackdrop color="rgba(255, 255, 255, .05)" size={32} fadeRadius="80%" />
            <div style={{ position: "absolute", right: -60, top: -60, width: 240, height: 240, borderRadius: "50%", background: "var(--accent)", opacity: .18, filter: "blur(60px)" }} />
            <div style={{ position: "relative" }}>
              <div className="kicker" style={{ color: "var(--accent)", marginBottom: 10 }}>
                <Icon name="lock" size={12} stroke={2.2} style={{ verticalAlign: "middle", marginRight: 6 }} />
                Securely contact the newsroom
              </div>
              <h3 className="serif" style={{ margin: "0 0 14px", fontSize: 30, fontWeight: 650, letterSpacing: "-0.02em", color: "#FFFFFF", lineHeight: 1.15 }}>Tips, documents, and on-background conversations

                </h3>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "rgba(232, 237, 247, 0.75)", maxWidth: 600 }}>
                We protect our sources. We use end-to-end encrypted channels by default, hold tips on a separate system with restricted access, and have never disclosed a source to a third party, including law enforcement, without a sealed legal challenge first. If you have something to share, we'd like to hear from you.
              </p>
            </div>
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["mail", "media@dailytechwire.com", "PGP key on request"],
                ["lock", "Signal · +65 8XXX XXXX", "End-to-end encrypted"],
                ["globe", "SecureDrop · onion link", "Tor-only, anonymous"],
                ["mail", "editor@dailytechwire.com", "Spotted an error?"]].
                map(([icon, line, sub]) =>
                <div key={line} style={{
                  padding: "12px 14px", background: "rgba(232, 237, 247, 0.06)",
                  border: "1px solid rgba(232, 237, 247, 0.12)", borderRadius: 6,
                  display: "flex", gap: 12, alignItems: "center"
                }}>
                  <Icon name={icon} size={16} color="var(--accent)" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="mono" style={{ fontSize: 12, fontWeight: 500, color: "#E8EDF7" }}>{line}</div>
                    <div style={{ fontSize: 10, color: "rgba(232, 237, 247, 0.55)", marginTop: 2 }}>{sub}</div>
                  </div>
                </div>
                )}
            </div>
          </div>
        </section>
        </Reveal>

        {/* Footer-style bizinfo */}
        <section style={{ paddingTop: 32, borderTop: "1px solid var(--hair)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {[
          ["Registered office", "Asia Press Centre Group (APCG)\nBugis Cube\nSingapore 188735"],
          ["Press inquiries", "media@dailytechwire.com"],
          ["Partnerships", "partnership@dailytechwire.com\nasiapresscentre.com"]].
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
{ id: "tech", n: 1, name: "Technology & Markets", icon: "spark", color: "#B0512E",
  desc: "Frontier models, infrastructure, developer practice, and the policy that shapes them. The flagship beat, you're reading it now.", current: true },
{ id: "fin", n: 2, name: "Finance & Capital", icon: "trend-up", color: "#3E6E80",
  desc: "Capital flows, public-market filings, private deals, and the regulators who watch them across ASEAN, India, Greater China, Japan, and Korea." },
{ id: "geo", n: 3, name: "Geopolitics & Regional Affairs", icon: "globe", color: "#3A4E8C",
  desc: "Foreign policy, trade, and security across Southeast Asia and the Indo-Pacific, reported as a beat, not a news cycle." },
{ id: "clim", n: 4, name: "Climate & Energy", icon: "feather", color: "#46735C",
  desc: "Climate policy, the energy transition, and the industrial build-out underneath both, from minerals to megawatts." },
{ id: "hlth", n: 5, name: "Healthcare & Biotech", icon: "data", color: "#8F7238",
  desc: "Healthcare systems, biotech investment, and the public-health stories with the patience to follow them properly." },
{ id: "ind", n: 6, name: "Industry & Supply Chain", icon: "product", color: "#475569",
  desc: "Manufacturing, logistics, semiconductors, and the physical layer of the regional economy that everything else sits on top of." },
{ id: "con", n: 7, name: "Consumer & Society", icon: "user", color: "#0C4A6E",
  desc: "How a billion-plus consumers spend, work, and live, retail, media, mobility, and the cultural shifts moving across the region." },
{ id: "res", n: 8, name: "Research & Data Briefings", icon: "data", color: "#7C2D12",
  desc: "Subscriber-only data products, custom briefings, and the research arm that supports every other newsroom in the group." }];


const MASTHEAD = [
{ name: "Cheryl Tan", role: "Editor-in-Chief, dailytechwire / Group Editor", city: "Singapore", years: "20+" },
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


// (Legacy AWARDS / MEMBERSHIPS arrays removed, replaced by the inline
//  "What we promise / What we don't do" block in the Editorial commitments section.)

const OWNERSHIP = [
{ k: "Founding partners", v: 42 },
{ k: "Employee share scheme", v: 18 },
{ k: "Independent endowment trust", v: 22 },
{ k: "Patient-capital partners", v: 16 },
{ k: "Treasury", v: 2 }];


const REVENUE = [
{ k: "Reader subscriptions (Pro & individual)", v: 68, color: "#B0512E" },
{ k: "Newsletter & event sponsorship", v: 14, color: "#3E6E80" },
{ k: "DTW Studio (labelled sponsored work)", v: 10, color: "#8F7238" },
{ k: "Research subscriptions (institutional)", v: 6, color: "#3A4E8C" },
{ k: "Affiliate (disclosed product reviews)", v: 2, color: "#46735C" }];


Object.assign(window, { AboutPage });