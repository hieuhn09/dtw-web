// =============== HOMEPAGE ===============
function HomeHero({ navigate }) {
  const lead = ARTICLES[0];
  const aside = ARTICLES.slice(1, 5);
  const t = useT();
  const { lang } = useLang();
  return (
    <section style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 32, padding: "25px 2px 32px 0px" }}>
      <div onClick={() => navigate(`/article/${lead.slug}`)} style={{ cursor: "pointer" }}>
        <CoverArt pillar={lead.pillar} seed={lead.id} variant={0} height={410} label="DTW HERO" />
        <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 10, margin: "10px 0px 0px" }}>
          <PillarTag id={lead.pillar} />
          <span className="mono text-mute-2" style={{ fontSize: 11 }}>{lead.section}</span>
          <span className="text-mute-2" style={{ fontSize: 11 }}>·</span>
          <span className="mono text-mute-2" style={{ fontSize: 11 }}>{fmtTimeAgo(lead.published)}</span>
        </div>
        <h2 className="serif" style={{

          lineHeight: 1.05, letterSpacing: "-0.025em",
          textWrap: "balance", margin: "5px 0px 10px", fontWeight: "650", fontSize: "44px"
        }}>{lead.title}</h2>
        <p className="serif text-mute" style={{ margin: 0, fontSize: 18, lineHeight: 1.45, maxWidth: 680, textWrap: "pretty" }}>
          {lead.dek}
        </p>
        <div style={{ marginTop: 14 }}>
          <ByLine article={lead} size="lg" />
        </div>
      </div>
      <div style={{ borderLeft: "1px solid var(--hair)", paddingLeft: 24, display: "flex", flexDirection: "column", gap: 18 }}>
        <div className="upper" style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".14em", color: "var(--muted)" }}>
          {t("Also leading today", "Cũng đầu trang hôm nay", "Berita utama lainnya hari ini")}
        </div>
        {aside.map((a, i) =>
        <article key={a.id} onClick={() => navigate(`/article/${a.slug}`)} style={{ cursor: "pointer", paddingBottom: 18, borderBottom: i < aside.length - 1 ? "1px solid var(--hair)" : "none", display: "grid", gridTemplateColumns: "1fr 110px", gap: 14 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <PillarTag id={a.pillar} />
                <span className="mono text-mute-2" style={{ fontSize: 11 }}>{fmtTimeAgo(a.published)}</span>
              </div>
              <h3 className="serif" style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 600, lineHeight: 1.25, letterSpacing: "-0.01em", textWrap: "balance" }}>
                {a.title}
              </h3>
              <div className="text-mute" style={{ fontSize: 12 }}>
                By {authorOf(a.author).name} · {a.readMin} min
              </div>
            </div>
            <CoverArt pillar={a.pillar} seed={a.id} variant={2 + i % 3} height={86} />
          </article>
        )}
      </div>
    </section>);

}

function BriefBand({ navigate }) {
  const t = useT();
  const briefs = [
  {
    tag: "AM · 07:00",
    title: "MAS clears DBS for digital-asset custody. ERNIE-X is live in three VN banks.",
    txt: "Plus: VNG's listing math, TSMC's allocation reshuffle, and a UPI-Vietnam timeline."
  },
  {
    tag: "PM · 18:00 (yesterday)",
    title: "What we got wrong about Tokopedia–Grab, one year in.",
    txt: "The synergy thesis is finally producing real numbers. Some of them are layoffs."
  }];


  return (
    <section style={{ margin: "0 0 40px" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "200px 1fr 1fr 150px",
        background: "var(--surface)",
        border: "1px solid var(--hair)",
        borderRadius: 10,
        overflow: "hidden"
      }}>
        {/* Left: label column */}
        <div style={{
          padding: "22px 22px",
          position: "relative",
          display: "flex", flexDirection: "column", justifyContent: "center"
        }}>
          <div className="kicker" style={{ color: "var(--ink)" }}>
            {t("The Brief", "Bản tin", "Brief")}
          </div>
          <div className="mono text-mute" style={{ fontSize: 11, marginTop: 6, lineHeight: 1.4 }}>
            {t("Twice daily · 07:00 / 18:00 SGT", "Hai lần mỗi ngày · 07:00 / 18:00 SGT", "Dua kali sehari · 07:00 / 18:00 WIB")}
          </div>
          {/* floating divider */}
          <div style={{ position: "absolute", right: 0, top: "22%", bottom: "22%", width: 1, background: "var(--hair)" }} />
        </div>

        {/* Middle: 2 brief cells, separated by floating internal rule */}
        {briefs.map((b, i) =>
        <div key={i} style={{
          padding: "22px 22px",
          position: "relative",
          display: "flex", flexDirection: "column", justifyContent: "center",
          minWidth: 0
        }}>
            <div className="mono" style={{ fontSize: 10, color: "var(--accent)", fontWeight: 600, letterSpacing: ".1em", marginBottom: 6 }}>
              {b.tag}
            </div>
            <div className="serif" style={{
            fontSize: 14.5, fontWeight: 600, lineHeight: 1.35, marginBottom: 6,
            textWrap: "balance",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}>
              {b.title}
            </div>
            <div className="text-mute" style={{
            fontSize: 12, lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}>
              {b.txt}
            </div>
            {/* floating divider */}
            <div style={{ position: "absolute", right: 0, top: "22%", bottom: "22%", width: 1, background: "var(--hair)" }} />
          </div>
        )}

        {/* Right: action */}
        <div style={{
          padding: "22px 22px",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Button variant="outline" size="md" onClick={() => navigate("/briefing")}>
            {t("Read →", "Đọc →", "Baca →")}
          </Button>
        </div>
      </div>
    </section>);

}

function WireDrops({ navigate }) {
  const t = useT();
  // Simulate realtime: prepend a new drop every ~15s
  const [drops, setDrops] = useState(WIRE_DROPS);
  const [flash, setFlash] = useState(null);
  useEffect(() => {
    const samples = [
    { city: "Hanoi", text: "SBV confirms UPI-VND corridor go-live at 09:00 local; first $50K test transfer cleared." },
    { city: "Shenzhen", text: "BYD says LFP cell prices fall to $48/kWh, undercuts CATL's bulk quote." },
    { city: "Bengaluru", text: "Zoho launches small-language-model API tier; pricing 80% under OpenAI equivalents." },
    { city: "Tokyo", text: "Rakuten Mobile breaks even on operating basis for first time since 2020 launch." },
    { city: "Manila", text: "BSP suspends two e-money licenses pending KYC audit." }];

    let i = 0;
    const t = setInterval(() => {
      const s = samples[i % samples.length];
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const newDrop = { id: "sim" + Date.now(), time, ...s };
      setDrops((prev) => [newDrop, ...prev].slice(0, 12));
      setFlash(newDrop.id);
      setTimeout(() => setFlash(null), 2400);
      i++;
    }, 9000);
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{ marginBottom: 48 }}>
      <SectionHeader title={t("Wire Drops", "Tin nhanh", "Kawat")} kicker={t("Realtime ·  WebSocket", "Realtime · WebSocket", "Realtime · WebSocket")}
      right={<a className="linkish text-mute" style={{ fontSize: 12, cursor: "pointer" }}>RSS · API</a>}
      liveDot />
      <div style={{
        background: "var(--surface)", border: "1px solid var(--hair)",
        borderRadius: 8, padding: "4px 0", maxHeight: 380, overflow: "hidden", position: "relative"
      }}>
        {drops.map((d, i) =>
        <div key={d.id} style={{
          display: "grid", gridTemplateColumns: "68px 120px 1fr auto", gap: 18, alignItems: "baseline",
          padding: "12px 20px", borderBottom: i < drops.length - 1 ? "1px solid var(--hair)" : "none",
          background: flash === d.id ? "color-mix(in oklab, var(--accent) 8%, transparent)" : "transparent",
          transition: "background 1.5s ease"
        }}>
            <span className="mono" style={{ fontSize: 12, color: "var(--ink)", fontWeight: 500 }}>{d.time}</span>
            <CityChip city={d.city} />
            <span className="serif" style={{ fontSize: 14.5, lineHeight: 1.45, color: "var(--ink)" }}>{d.text}</span>
            <a className="text-mute-2 linkish" style={{ fontSize: 12, cursor: "pointer" }}>more →</a>
          </div>
        )}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 60,
          background: "linear-gradient(to bottom, transparent, var(--surface))",
          pointerEvents: "none"
        }} />
      </div>
    </section>);

}

function SectionHeader({ title, kicker, right, liveDot }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18, paddingBottom: 10, borderBottom: "2px solid var(--brand-navy)" }}>
      <div>
        {kicker &&
        <div className="kicker" style={{ marginBottom: 4, display: "flex", alignItems: "center", gap: 8, margin: "10px 0px 4px" }}>
            {liveDot && <span className="live-dot" />}{kicker}
          </div>
        }
        <h2 className="serif" style={{ margin: 0, fontSize: 28, fontWeight: 650, letterSpacing: "-0.02em" }}>{title}</h2>
      </div>
      {right}
    </div>);

}

function PillarShowcase({ navigate }) {
  const t = useT();
  return (
    <section style={{ marginBottom: 56 }}>
      <SectionHeader title={t("Across the pillars", "Theo các chuyên mục", "Lintas pilar")} kicker={t("Fresh in each section", "Mới nhất ở mỗi mục", "Terbaru di tiap rubrik")} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
        {PILLARS.map((p) => {
          const items = ARTICLES.filter((a) => a.pillar === p.id).slice(0, 4);
          if (items.length === 0) return null;
          return (
            <div key={p.id}>
              <div onClick={() => navigate(p.slug)} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                paddingBottom: 8, marginBottom: 14, borderBottom: `2px solid ${p.color}`, cursor: "pointer"
              }}>
                <div className="upper" style={{ fontSize: 12, fontWeight: 650, letterSpacing: ".14em", color: p.color, display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon name={PILLAR_ICONS[p.id]} size={14} color={p.color} />
                  {p.label}
                </div>
                <span className="text-mute-2" style={{ fontSize: "11px" }}>See all →</span>
              </div>
              {items.map((a, i) =>
              <article key={a.id} onClick={() => navigate(`/article/${a.slug}`)}
              style={{ cursor: "pointer", padding: "12px 0", borderBottom: i < items.length - 1 ? "1px solid var(--hair)" : "none" }}>
                  {i === 0 && <CoverArt pillar={a.pillar} seed={a.id} variant={(i + 2) % 6} height={120} style={{ marginBottom: 10 }} />}
                  <div style={{ display: "grid", gridTemplateColumns: i === 0 ? "1fr" : "1fr 60px", gap: 12, alignItems: "start" }}>
                    <div>
                      <h4 className="serif" style={{ margin: "0 0 4px", fontSize: i === 0 ? 17 : 15, fontWeight: 600, lineHeight: 1.3, letterSpacing: "-0.005em", textWrap: "balance" }}>
                        {a.title}
                      </h4>
                      <div className="text-mute" style={{ fontSize: 11 }}>
                        {authorOf(a.author).name} · {fmtTimeAgo(a.published)} · {a.readMin}m
                      </div>
                    </div>
                    {i !== 0 && <CoverArt pillar={a.pillar} seed={a.id} variant={(i + 3) % 6} height={48} />}
                  </div>
                </article>
              )}
              {/* placeholder removed */}
              {false && <div />}
            </div>);

        })}
      </div>
    </section>);

}

function AsiaSpotlight({ navigate }) {
  const items = ARTICLES.filter((a) => ["asia", "policy", "startups"].includes(a.pillar)).slice(0, 4);
  const t = useT();
  return (
    <SpotlightCard color="rgba(224, 78, 31, .22)" style={{
      background: "var(--banner)", color: "#E8EDF7",
      padding: "40px 32px", borderRadius: 8, marginBottom: 48
    }}>
      <GridBackdrop color="rgba(255, 255, 255, .05)" size={48} fadeRadius="70%" />
      <div style={{ position: "absolute", right: -40, top: -40, width: 240, height: 240, borderRadius: "50%", background: "var(--accent)", opacity: .18, filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22, position: "relative" }}>
        <div>
          <div className="kicker" style={{ color: "var(--accent)", marginBottom: 6 }}>
            <span style={{ display: "inline-block", width: 8, height: 8, background: "var(--accent)", marginRight: 8, verticalAlign: "middle" }} />
            {t("Asia Tech Spotlight", "Điểm sáng công nghệ châu Á", "Sorotan Teknologi Asia")}
          </div>
          <h2 className="serif" style={{ margin: 0, fontSize: 30, fontWeight: 650, letterSpacing: "-0.02em", color: "#FFFFFF" }}>
            {t(
              "What's moving from Singapore to Seoul this week",
              "Điều gì đang chuyển động từ Singapore đến Seoul tuần này",
              "Apa yang bergerak dari Singapura ke Seoul minggu ini"
            )}
          </h2>
        </div>
        <Button variant="accent" onClick={() => navigate("/latest")}>{t("See all latest →", "Xem tất cả mới nhất →", "Lihat semua terbaru →")}</Button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, position: "relative" }}>
        {items.map((a, i) =>
        <article key={a.id} onClick={() => navigate(`/article/${a.slug}`)} style={{ cursor: "pointer" }}>
            <CoverArt pillar={a.pillar} seed={a.id} variant={(i + 1) % 6} height={150} style={{ marginBottom: 12 }} />
            <div className="upper" style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".14em", color: "var(--accent)", marginBottom: 6 }}>
              {pillarOf(a.pillar).label}
            </div>
            <h4 className="serif" style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600, lineHeight: 1.3, color: "#FFFFFF", textWrap: "balance" }}>
              {a.title}
            </h4>
            <div style={{ fontSize: 11, color: "rgba(232, 237, 247, 0.60)" }}>
              {authorOf(a.author).city} · {a.readMin} min
            </div>
          </article>
        )}
      </div>
    </SpotlightCard>);

}

function DashboardsTeaser({ navigate }) {
  // mini sparkline data
  const fundSeries = [12, 18, 14, 22, 19, 26, 24, 31, 28, 34];
  const fundChange = +14.2;
  const aiTop = AI_LEADERBOARD.slice(0, 4);
  const t = useT();

  return (
    <section style={{ marginBottom: 48 }}>
      <SectionHeader title={t("Live Dashboards", "Bảng điều khiển trực tiếp", "Dasbor Langsung")} kicker={t("Data desk · updated every 15 min", "Bàn dữ liệu · cập nhật mỗi 15 phút", "Meja data · diperbarui tiap 15 menit")}
      right={<Button size="sm" variant="outline" onClick={() => navigate("/dashboards")}>{t("Open full dashboards →", "Mở bảng đầy đủ →", "Buka dasbor penuh →")}</Button>} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Asia Funding teaser */}
        <div onClick={() => navigate("/dashboards/funding")} style={{
          background: "var(--surface)", border: "1px solid var(--hair)",
          borderRadius: 8, padding: 24, cursor: "pointer"
        }} className="card-hover">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div className="upper text-mute" style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".14em", marginBottom: 6 }}>Asia Funding Tracker</div>
              <div className="serif" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>$8.4B raised, 14 days</div>
            </div>
            <ArrowUpDown chg={fundChange} />
          </div>
          <AnimatedSpark values={fundSeries} color="var(--up)" width={420} height={56} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--hair)" }}>
            <div>
              <div className="text-mute-2" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em" }}>Deals</div>
              <div className="mono" style={{ fontSize: 20, fontWeight: 600, marginTop: 2 }}><CountUp to={127} /></div>
            </div>
            <div>
              <div className="text-mute-2" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em" }}>Avg. round</div>
              <div className="mono" style={{ fontSize: 20, fontWeight: 600, marginTop: 2 }}><CountUp to={66} prefix="$" suffix="M" /></div>
            </div>
            <div>
              <div className="text-mute-2" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em" }}>Top sector</div>
              <div className="mono" style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>AI infra</div>
            </div>
          </div>
          <div className="text-mute-2" style={{ fontSize: 11, marginTop: 14, fontStyle: "italic" }}>
            For informational purposes only · not investment advice
          </div>
        </div>

        {/* AI Leaderboard teaser */}
        <div onClick={() => navigate("/dashboards/ai")} style={{
          background: "var(--surface)", border: "1px solid var(--hair)",
          borderRadius: 8, padding: 24, cursor: "pointer"
        }} className="card-hover">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div className="upper text-mute" style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".14em", marginBottom: 6 }}>AI Leaderboard</div>
              <div className="serif" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>This week's top models</div>
            </div>
            <span className="mono text-mute-2" style={{ fontSize: 11 }}>filter by use case →</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--hair)" }}>
                <th style={{ textAlign: "left", padding: "6px 0", fontSize: 10, fontWeight: 600, letterSpacing: ".1em", color: "var(--muted)" }} className="upper">#</th>
                <th style={{ textAlign: "left", padding: "6px 0", fontSize: 10, fontWeight: 600, letterSpacing: ".1em", color: "var(--muted)" }} className="upper">Model</th>
                <th style={{ textAlign: "right", padding: "6px 0", fontSize: 10, fontWeight: 600, letterSpacing: ".1em", color: "var(--muted)" }} className="upper">Reason</th>
                <th style={{ textAlign: "right", padding: "6px 0", fontSize: 10, fontWeight: 600, letterSpacing: ".1em", color: "var(--muted)" }} className="upper">Code</th>
                <th style={{ textAlign: "right", padding: "6px 0", fontSize: 10, fontWeight: 600, letterSpacing: ".1em", color: "var(--muted)" }} className="upper">$/M</th>
              </tr>
            </thead>
            <tbody>
              {aiTop.map((m) =>
              <tr key={m.rank} style={{ borderBottom: "1px solid var(--hair)" }}>
                  <td className="mono" style={{ padding: "10px 0", fontSize: 12, color: "var(--muted)" }}>{m.rank}</td>
                  <td style={{ padding: "10px 0" }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{m.model}</div>
                    <div className="text-mute-2" style={{ fontSize: 11 }}>{m.maker}</div>
                  </td>
                  <td className="mono tnum" style={{ padding: "10px 0", textAlign: "right", fontSize: 13 }}>{m.reasoning}</td>
                  <td className="mono tnum" style={{ padding: "10px 0", textAlign: "right", fontSize: 13 }}>{m.coding}</td>
                  <td className="mono tnum" style={{ padding: "10px 0", textAlign: "right", fontSize: 13 }}>{m.price.toFixed(1)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>);

}

function DeepDive({ navigate }) {
  const dd = ARTICLES.find((a) => a.deepDive) || ARTICLES[0];
  const t = useT();
  return (
    <section style={{ marginBottom: 48 }}>
      <SectionHeader title={t("Deep Dive of the Week", "Bài phân tích tuần", "Deep Dive Minggu Ini")} kicker={t("Long-form · data-driven", "Dài hai · dựa trên dữ liệu", "Panjang · berbasis data")} />
      <article onClick={() => navigate(`/article/${dd.slug}`)} style={{
        display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 40, alignItems: "center", cursor: "pointer", padding: "32px 0px 20px"

      }}>
        <CoverArt pillar={dd.pillar} seed={dd.id} variant={4} height={380} label="DATA · ASEAN CAPEX MAP" />
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <PillarTag id={dd.pillar} />
            <span className="mono text-mute" style={{ fontSize: 11 }}>{dd.section}</span>
            <span className="text-mute" style={{ fontSize: 11 }}>·</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--accent)" }}>{dd.readMin} min read</span>
          </div>
          <h3 className="serif" style={{ margin: "0 0 14px", fontSize: 36, fontWeight: 650, letterSpacing: "-0.025em", lineHeight: 1.1, textWrap: "balance" }}>
            {dd.title}
          </h3>
          <p className="serif text-mute" style={{ margin: "0 0 18px", fontSize: 17, lineHeight: 1.5 }}>{dd.dek}</p>
          <ByLine article={dd} size="lg" />
        </div>
      </article>
    </section>);

}

function AwardsBanner({ navigate }) {
  const t = useT();
  return (
    <section style={{ marginBottom: 48 }}>
      <div style={{
        background: "var(--paper)",
        border: "1px solid var(--ink)",
        borderRadius: 10,
        display: "grid", gridTemplateColumns: "1fr auto", gap: 28, alignItems: "center",
        position: "relative", overflow: "hidden", padding: "28px 32px"
      }}>
        {/* Coral accent stripe on the left */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
          background: "linear-gradient(to bottom, var(--accent), #FCD34D)"
        }} />

        {/* Copy */}
        <div>
          <div className="kicker" style={{ marginBottom: 6, color: "var(--accent)" }}>
            {t("Awards · Coming soon", "Giải thưởng · Sắp ra mắt", "Penghargaan · Segera hadir")}
          </div>
          <h3 className="serif" style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 650, letterSpacing: "-0.015em", textWrap: "balance" }}>
            {t(
              "The inaugural awards launch next year",
              "Giải thưởng đầu tiên ra mắt năm sau",
              "Penghargaan perdana diluncurkan tahun depan"
            )}
          </h3>
          <p className="text-mute" style={{ margin: 0, fontSize: 13, lineHeight: 1.55, maxWidth: 620 }}>
            {t(
              "Recognising the founders, operators, and engineers quietly shaping Asia's technology decade. Categories, panel, and nominations revealed closer to launch.",
              "Tôn vinh những nhà sáng lập, lãnh đạo và kỹ sư đang lặng lẽ định hình thập kỷ công nghệ của châu Á. Hạng mục, ban giám khảo và đề cử sẽ được công bố gần ngày ra mắt.",
              "Mengenali para founder, operator, dan engineer yang diam-diam membentuk dekade teknologi Asia. Kategori, juri, dan nominasi diumumkan menjelang peluncuran."
            )}
          </p>
        </div>

        {/* CTA */}
        <Button variant="accent" onClick={() => navigate("/awards")}>
          {t("Learn more →", "Tìm hiểu thêm →", "Pelajari →")}
        </Button>
      </div>
    </section>);
}

function SponsoredStrip({ navigate }) {
  const s = ARTICLES.find((a) => a.sponsored);
  return (
    <section style={{ marginBottom: 48 }}>
      <div style={{
        background: "var(--sponsored)", border: "1px solid #E0B900",
        borderRadius: 8, padding: "24px 28px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div className="mono upper" style={{ fontSize: 10, fontWeight: 650, letterSpacing: ".14em", color: "var(--ink)", marginBottom: 4 }}>
              ⬢ Paid Partner Content · DTW Studio Presents
            </div>
            <div className="serif" style={{ fontSize: 14, color: "color-mix(in oklab, var(--ink) 80%, transparent)" }}>
              Produced by DTW Studio for the partner below. The DTW newsroom was not involved.
            </div>
          </div>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink)", border: "1px solid color-mix(in oklab, var(--ink) 35%, transparent)", padding: "4px 8px", borderRadius: 3 }}>
            What is this?
          </span>
        </div>
        <article onClick={() => navigate(`/article/${s.slug}`)} style={{
          display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: 24, alignItems: "center", cursor: "pointer"
        }}>
          <CoverArt pillar={"products"} seed={s.id} variant={5} height={140} label={s.sponsor?.toUpperCase()} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <BrandMark name={s.sponsor || "AWS ASEAN"} bg="var(--ink)" fg="var(--paper)" />
              <span className="mono upper" style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".12em", color: "color-mix(in oklab, var(--ink) 75%, transparent)" }}>
                Sponsor
              </span>
            </div>
            <h4 className="serif" style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 600, color: "var(--ink)", lineHeight: 1.25, letterSpacing: "-0.01em" }}>
              {s.title}
            </h4>
            <div style={{ fontSize: 12, color: "color-mix(in oklab, var(--ink) 70%, transparent)" }}>{s.readMin} min · sponsored feature</div>
          </div>
          <Button variant="primary" size="md">Read →</Button>
        </article>
      </div>
    </section>);
}

function BestOfReviews({ navigate }) {
  const items = [
  { id: "r1", cat: "Phone", product: "Oppo Find X9 Pro", verdict: "Camera-first flagship", price: "$1,099", score: "4.5/5", slug: "oppo-find-x9-review" },
  { id: "r2", cat: "Laptop", product: "Lenovo ThinkPad X1 G14", verdict: "Best business laptop, 2026", price: "$2,189", score: "4.5/5" },
  { id: "r3", cat: "Wear", product: "Garmin Forerunner 975", verdict: "For runners who don't tap", price: "$649", score: "4.0/5" },
  { id: "r4", cat: "Audio", product: "Sony WF-1000XM6", verdict: "ANC champ, finally fits all", price: "$329", score: "4.5/5" }];

  return (
    <section style={{ marginBottom: 48 }}>
      <SectionHeader title="Best of Reviews"
      kicker="Independent · affiliate-disclosed"
      right={
      <span className="text-mute" style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 6, cursor: "help" }} title="Some links earn DTW a commission. Reviews are independent and never paid for by manufacturers.">
            <span className="mono" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: "50%", background: "var(--ink)", color: "var(--paper)", fontSize: 9, fontWeight: 600 }}>i</span>
            About affiliate links
          </span>
      } />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
        {items.map((r) =>
        <article key={r.id} onClick={() => r.slug && navigate(`/article/${r.slug}`)} style={{
          border: "1px solid var(--hair)", borderRadius: 6, overflow: "hidden",
          background: "var(--surface)", cursor: "pointer"
        }} className="card-hover">
            <CoverArt pillar="products" seed={r.id} variant={r.id.charCodeAt(1) % 4 + 2} height={150} />
            <div style={{ padding: 14 }}>
              <div className="upper text-mute" style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".12em", marginBottom: 4 }}>{r.cat}</div>
              <div className="serif" style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, lineHeight: 1.25 }}>{r.product}</div>
              <div className="text-mute" style={{ fontSize: 12, marginBottom: 10 }}>{r.verdict}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid var(--hair)" }}>
                <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{r.price}</span>
                <span style={{ fontSize: 11, color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Icon name="star" size={11} color="var(--accent)" /> {r.score}
                </span>
              </div>
              <div className="mono" style={{ fontSize: 10, color: "var(--muted-2)", marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
                <Icon name="dollar" size={10} /> Affiliate link
              </div>
            </div>
          </article>
        )}
      </div>
    </section>);

}

function PodcastStrip({ navigate }) {
  const [playing, setPlaying] = useState(null);
  const t = useT();
  return (
    <section style={{ marginBottom: 48 }}>
      <SectionHeader title={t("Listen", "Nghe", "Dengar")} kicker={t("Podcasts & voice", "Podcast & giọng đọc", "Podcast & suara")} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {PODCASTS.map((p) =>
        <div key={p.id} style={{
          background: "var(--surface)", border: "1px solid var(--hair)",
          borderRadius: 8, padding: 18, display: "flex", gap: 14, alignItems: "center"
        }}>
            <button onClick={() => setPlaying(playing === p.id ? null : p.id)} style={{
            width: 48, height: 48, borderRadius: "50%", border: "none",
            background: "var(--ink)", color: "var(--paper)",
            cursor: "pointer", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
              <Icon name={playing === p.id ? "pause" : "play"} size={16} color="var(--paper)" />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="serif" style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.25 }}>{p.title}</div>
              <div className="text-mute" style={{ fontSize: 12, marginTop: 2 }}>
                {p.host} · <span className="mono">{p.len}</span> · {p.date}
              </div>
              {playing === p.id &&
            <div style={{ marginTop: 8, height: 3, background: "var(--hair)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: "34%", height: "100%", background: "var(--accent)" }} />
                </div>
            }
            </div>
          </div>
        )}
      </div>
    </section>);

}

function NewsletterCTA({ navigate }) {
  const t = useT();
  return (
    <section style={{ marginBottom: 32 }}>
      <div style={{
        background: "var(--banner)", color: "#E8EDF7",
        borderRadius: 8, padding: "48px 48px",
        display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 48, alignItems: "center",
        position: "relative", overflow: "hidden"
      }}>
        <GridBackdrop color="rgba(255, 255, 255, .05)" size={40} fadeRadius="80%" />
        <div style={{ position: "absolute", left: -60, bottom: -60, width: 260, height: 260, borderRadius: "50%", background: "var(--accent)", opacity: .16, filter: "blur(70px)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div className="kicker" style={{ color: "var(--accent)", marginBottom: 8 }}>{t("Eight newsletters · pick what you read", "Tám bản tin · chọn theo sở thích", "Delapan newsletter · pilih yang Anda baca")}</div>
          <h2 className="serif" style={{ margin: "0 0 10px", fontSize: 34, fontWeight: 650, letterSpacing: "-0.02em", color: "#FFFFFF" }}>
            {t("Don't doom-scroll. Get the day in 5 minutes.", "Đừng trôi vô tận. Đọc xâu tóm cả ngày trong 5 phút.", "Jangan doom-scroll. Dapatkan hari ini dalam 5 menit.")}
          </h2>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "rgba(232, 237, 247, 0.70)", maxWidth: 540 }}>
            {t(
              "AM Brief, PM Brief, AI Weekly, Asia Funding, Dev Digest, Products & Deals, Deep Dive, DTW Awards. Double opt-in. Unsubscribe with one click. We will never sell or share your email.",
              "AM Brief, PM Brief, AI Weekly, Asia Funding, Dev Digest, Products & Deals, Deep Dive, DTW Awards. Xác nhận kép. Hủy chỉ bằng một cú nhấp. Không bán hay chia sẻ email của bạn.",
              "AM Brief, PM Brief, AI Weekly, Asia Funding, Dev Digest, Products & Deals, Deep Dive, DTW Awards. Konfirmasi ganda. Berhenti dengan satu klik. Kami tak akan menjual atau membagikan email Anda."
            )}
          </p>
        </div>
        <form onSubmit={(e) => {e.preventDefault();alert("Confirmation email sent (demo)");}} style={{ display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
          <input type="email" required placeholder="you@company.com" style={{
            padding: "14px 16px",
            border: "1px solid rgba(232, 237, 247, 0.20)",
            borderRadius: 5, fontSize: 14,
            background: "rgba(232, 237, 247, 0.06)",
            color: "#E8EDF7", fontFamily: "var(--font-sans)"
          }} />
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="accent" size="lg" type="submit" style={{ flex: 1 }}>{t("Subscribe to AM Brief", "Đăng ký AM Brief", "Berlangganan AM Brief")}</Button>
            <Button variant="ghost" size="lg" style={{ color: "#E8EDF7", border: "1px solid rgba(232, 237, 247, 0.20)" }} onClick={() => navigate("/newsletters")}>
              {t("Choose more", "Chọn thêm", "Pilih lainnya")}
            </Button>
          </div>
        </form>
      </div>
    </section>);

}

function Homepage({ navigate }) {
  return (
    <div className="container" style={{ padding: "0px 24px 10px" }}>
      <HomeHero navigate={navigate} />
      <BriefBand navigate={navigate} />
      <Reveal><WireDrops navigate={navigate} /></Reveal>
      <Reveal><PillarShowcase navigate={navigate} /></Reveal>
      <Reveal><AsiaSpotlight navigate={navigate} /></Reveal>
      <Reveal><DashboardsTeaser navigate={navigate} /></Reveal>
      <Reveal><DeepDive navigate={navigate} /></Reveal>
      <Reveal><AwardsBanner navigate={navigate} /></Reveal>
      {/* Paid Partner / Sponsored strip temporarily hidden */}
      {/* <Reveal><SponsoredStrip navigate={navigate} /></Reveal> */}
      <Reveal><BestOfReviews navigate={navigate} /></Reveal>
      <Reveal><PodcastStrip navigate={navigate} /></Reveal>
      <Reveal><NewsletterCTA navigate={navigate} /></Reveal>
    </div>);

}

Object.assign(window, { Homepage, SectionHeader });