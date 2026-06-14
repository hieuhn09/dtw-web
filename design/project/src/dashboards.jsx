// ============ DASHBOARDS ============
function DashboardsLanding({ navigate, sub }){
  const [activeTab, setActiveTab] = useState(sub || "funding");
  const t = useT();
  useEffect(()=>{ if(sub) setActiveTab(sub); }, [sub]);

  return (
    <div className="container" style={{paddingTop:24, paddingBottom:48}}>
      <header style={{borderBottom:"3px solid var(--brand-navy)", paddingBottom:20, marginBottom:24, position:"relative", overflow:"hidden"}}>
        <GridBackdrop color="color-mix(in oklab, var(--ink) 6%, transparent)" size={32} fadeRadius="60%"/>
        <div style={{position:"relative"}}>
          <div className="kicker" style={{marginBottom:6, display:"flex", alignItems:"center", gap:8}}>
            <span className="live-dot"/> {t("Data Desk · Live", "Bàn dữ liệu · Trực tiếp", "Meja Data · Langsung")}
          </div>
          <h1 className="serif" style={{margin:"0 0 10px", fontSize:48, fontWeight:650, letterSpacing:"-0.025em", lineHeight:1}}>
            {t("Live Dashboards", "Bảng dữ liệu trực tiếp", "Dasbor Langsung")}
          </h1>
          <p className="serif text-mute" style={{margin:0, fontSize:17, lineHeight:1.45, maxWidth:760}}>
            {t("Two trackers that move with the news. Built from filings, scraped tickers, and a handful of human checks. Updated every 15 minutes.", "Hai bộ theo dõi chuyển động cùng tin tức. Xây từ hồ sơ, mã chứng khoán và kiểm tra thủ công. Cập nhật mỗi 15 phút.", "Dua pelacak yang bergerak bersama berita. Dibangun dari laporan, ticker, dan pemeriksaan manual. Diperbarui tiap 15 menit.")}
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div style={{display:"flex", gap:0, borderBottom:"1px solid var(--hair)", marginBottom:28}}>
        {[
          ["funding", t("Asia Funding Tracker", "Theo dõi vốn châu Á", "Pelacak Pendanaan Asia")],
          ["ai", t("AI Leaderboard", "Bảng xếp hạng AI", "Peringkat AI")],
        ].map(([k, l])=>(
          <button key={k} onClick={()=>{setActiveTab(k); navigate(`/dashboards/${k}`, true);}} style={{
            padding:"14px 22px", background:"transparent", border:"none",
            borderBottom: activeTab===k ? "3px solid var(--accent)" : "3px solid transparent",
            marginBottom:-1, fontSize:14, fontWeight: activeTab===k?600:500,
            color: activeTab===k ? "var(--ink)" : "var(--muted)", cursor:"pointer"
          }}>{l}</button>
        ))}
      </div>

      {activeTab === "funding" ? <FundingTracker/> : <AILeaderboard/>}
    </div>
  );
}

function FundingTracker(){
  const [sortKey, setSortKey] = useState("chg");
  const [sortDir, setSortDir] = useState("desc");
  const [country, setCountry] = useState("All");
  const t = useT();

  const filtered = useMemo(()=>{
    let rows = [...FUNDING_ROWS];
    if(country!=="All") rows = rows.filter(r=>r.country===country);
    rows.sort((a, b)=>{
      const av = a[sortKey], bv = b[sortKey];
      if(av==null) return 1; if(bv==null) return -1;
      if(typeof av === "number") return sortDir==="asc" ? av-bv : bv-av;
      return sortDir==="asc" ? String(av).localeCompare(bv) : String(bv).localeCompare(av);
    });
    return rows;
  }, [sortKey, sortDir, country]);

  const Th = ({k, children, num})=>(
    <th onClick={()=>{
      if(sortKey===k) setSortDir(sortDir==="asc"?"desc":"asc");
      else { setSortKey(k); setSortDir("desc"); }
    }} style={{
      textAlign:num?"right":"left", padding:"10px 12px",
      fontSize:10, fontWeight:600, letterSpacing:".1em",
      color:"var(--muted)", cursor:"pointer",
      borderBottom:"1px solid var(--hair-2)", userSelect:"none",
      background:"var(--surface)"
    }} className="upper">
      {children} {sortKey===k && <span style={{color:"var(--accent)"}}>{sortDir==="asc"?"▲":"▼"}</span>}
    </th>
  );

  const countries = ["All", ...new Set(FUNDING_ROWS.map(r=>r.country))];

  return (
    <section>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:18, flexWrap:"wrap", gap:12}}>
        <div>
          <h2 className="serif" style={{margin:"0 0 4px", fontSize:30, fontWeight:650, letterSpacing:"-0.02em"}}>
            {t("Asia Funding Tracker", "Theo dõi vốn châu Á", "Pelacak Pendanaan Asia")}
          </h2>
          <div className="text-mute mono" style={{fontSize:11}}>
            <span className="live-dot" style={{marginRight:6}}/>{t("Last update 12:42 SGT · next in 14 min · 138 instruments tracked", "Cập nhật 12:42 SGT · tiếp theo sau 14 phút · theo dõi 138 mã", "Pembaruan 12:42 SGT · berikutnya 14 mnt · 138 instrumen dilacak")}
          </div>
        </div>
        <div style={{display:"flex", gap:8, alignItems:"center"}}>
          <span className="text-mute" style={{fontSize:12}}>{t("Country:", "Quốc gia:", "Negara:")}</span>
          <div style={{display:"flex", gap:0, border:"1px solid var(--hair-2)", borderRadius:5, overflow:"hidden"}}>
            {countries.map(c=>(
              <button key={c} onClick={()=>setCountry(c)} style={{
                padding:"7px 12px", fontSize:11, fontWeight:500, fontFamily:"var(--font-mono)",
                background: country===c ? "var(--ink)" : "var(--surface)",
                color: country===c ? "var(--paper)" : "var(--ink)",
                border:"none", borderRight:"1px solid var(--hair-2)", cursor:"pointer"
              }}>{c}</button>
            ))}
          </div>
          <Button variant="outline" size="sm">↓ CSV</Button>
        </div>
      </div>

      <div style={{border:"1px solid var(--hair)", borderRadius:8, overflow:"hidden", background:"var(--surface)"}}>
        <table style={{width:"100%", borderCollapse:"collapse"}}>
          <thead>
            <tr>
              <Th k="ticker">Ticker</Th>
              <Th k="name">Company</Th>
              <Th k="country">Country</Th>
              <Th k="sector">Sector</Th>
              <Th k="px" num>Price</Th>
              <Th k="chg" num>Day Δ</Th>
              <Th k="mcap" num>Mkt Cap</Th>
              <Th k="funding" num>Recent Round</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i)=>(
              <tr key={r.ticker} style={{borderBottom:"1px solid var(--hair)", background: i%2===0?"transparent":"var(--paper)"}}>
                <td className="mono" style={{padding:"12px", fontSize:12, fontWeight:600}}>{r.ticker}</td>
                <td style={{padding:"12px", fontSize:13}}>{r.name}</td>
                <td className="mono" style={{padding:"12px", fontSize:11, color:"var(--muted)"}}>{r.country}</td>
                <td style={{padding:"12px", fontSize:12, color:"var(--muted)"}}>{r.sector}</td>
                <td className="mono tnum" style={{padding:"12px", fontSize:13, textAlign:"right"}}>
                  {r.px==null ? <span className="text-mute-2">–</span> : r.px.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}
                </td>
                <td style={{padding:"12px", textAlign:"right"}}><ArrowUpDown chg={r.chg}/></td>
                <td className="mono tnum" style={{padding:"12px", fontSize:12, textAlign:"right"}}>{r.mcap}</td>
                <td className="mono" style={{padding:"12px", fontSize:11, textAlign:"right", color: r.funding==="–" ? "var(--muted-2)" : "var(--accent)"}}>
                  {r.funding}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* charts */}
      <div style={{display:"grid", gridTemplateColumns:"2fr 1fr", gap:24, marginTop:28}}>
        <div style={{padding:24, background:"var(--surface)", border:"1px solid var(--hair)", borderRadius:8}}>
          <div className="upper" style={{fontSize:10, fontWeight:600, letterSpacing:".12em", color:"var(--muted)", marginBottom:8}}>
            {t("ASEAN tech index, 30 days", "Chỉ số công nghệ ASEAN, 30 ngày", "Indeks teknologi ASEAN, 30 hari")}
          </div>
          <BigChart/>
        </div>
        <div style={{padding:24, background:"var(--surface)", border:"1px solid var(--hair)", borderRadius:8}}>
          <div className="upper" style={{fontSize:10, fontWeight:600, letterSpacing:".12em", color:"var(--muted)", marginBottom:12}}>
            {t("Top movers · today", "Biến động mạnh · hôm nay", "Penggerak teratas · hari ini")}
          </div>
          {[
            { name:"GoTo Group",   chg:+3.10 },
            { name:"Alibaba",      chg:+2.41 },
            { name:"Sea Limited",  chg:-2.05 },
            { name:"Meituan",      chg:-1.20 },
          ].map(m=>(
            <div key={m.name} style={{display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid var(--hair)", fontSize:13}}>
              <span>{m.name}</span>
              <ArrowUpDown chg={m.chg}/>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BigChart(){
  // SVG line chart
  const data = [100, 102, 98, 103, 108, 105, 110, 108, 112, 115, 109, 114, 118, 116, 120, 118, 122, 124, 121, 125, 127, 124, 128, 131, 129, 132, 135, 133, 138, 140];
  const w = 720, h = 220, pad = 12;
  const min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i)=>{
    const x = pad + (i/(data.length-1)) * (w - pad*2);
    const y = h - pad - ((v-min)/span) * (h - pad*2);
    return [x, y];
  });
  const path = "M " + pts.map(([x, y])=>`${x}, ${y}`).join(" L ");
  const area = path + ` L ${pts[pts.length-1][0]}, ${h-pad} L ${pts[0][0]}, ${h-pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="gFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--up)" stopOpacity=".25"/>
          <stop offset="100%" stopColor="var(--up)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0.25, .5, .75, 1].map((p, i)=>(
        <line key={i} x1={pad} x2={w-pad} y1={pad + p*(h-pad*2)} y2={pad + p*(h-pad*2)} stroke="var(--hair)" strokeWidth="1"/>
      ))}
      <path d={area} fill="url(#gFill)"/>
      <path d={path} fill="none" stroke="var(--up)" strokeWidth="2"/>
      {pts.filter((_, i)=>i===pts.length-1).map(([x, y], i)=>(
        <circle key={i} cx={x} cy={y} r="4" fill="var(--up)" stroke="var(--surface)" strokeWidth="2"/>
      ))}
    </svg>
  );
}

function AILeaderboard(){
  const [sortKey, setSortKey] = useState("reasoning");
  const [sortDir, setSortDir] = useState("desc");
  const t = useT();

  const rows = useMemo(()=>{
    return [...AI_LEADERBOARD].sort((a, b)=>{
      const av = a[sortKey], bv = b[sortKey];
      if(typeof av==="number") return sortDir==="asc" ? av-bv : bv-av;
      return sortDir==="asc" ? String(av).localeCompare(bv) : String(bv).localeCompare(av);
    });
  }, [sortKey, sortDir]);

  const Th = ({k, children, num})=>(
    <th onClick={()=>{
      if(sortKey===k) setSortDir(sortDir==="asc"?"desc":"asc");
      else { setSortKey(k); setSortDir("desc"); }
    }} style={{
      textAlign:num?"right":"left", padding:"10px 12px",
      fontSize:10, fontWeight:600, letterSpacing:".1em",
      color:"var(--muted)", cursor:"pointer", userSelect:"none",
      borderBottom:"1px solid var(--hair-2)", background:"var(--surface)"
    }} className="upper">
      {children} {sortKey===k && <span style={{color:"var(--accent)"}}>{sortDir==="asc"?"▲":"▼"}</span>}
    </th>
  );

  const Bar = ({v, max=100, color="var(--ink)"})=> (
    <div style={{display:"flex", alignItems:"center", gap:8, justifyContent:"flex-end"}}>
      <div style={{flex:"0 0 90px", height:6, background:"var(--surface-2)", borderRadius:99, overflow:"hidden"}}>
        <div style={{width:`${(v/max)*100}%`, height:"100%", background:color}}/>
      </div>
      <span className="mono tnum" style={{fontSize:12, minWidth:24, textAlign:"right"}}>{v}</span>
    </div>
  );

  return (
    <section>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:18, flexWrap:"wrap", gap:12}}>
        <div>
          <h2 className="serif" style={{margin:"0 0 4px", fontSize:30, fontWeight:650, letterSpacing:"-0.02em"}}>
            {t("AI Leaderboard", "Bảng xếp hạng AI", "Peringkat AI")}
          </h2>
          <div className="text-mute mono" style={{fontSize:11}}>
            {t("Sort by what you actually use the model for · 18 models tracked · methodology disclosed", "Sắp xếp theo mục đích sử dụng thực tế · theo dõi 18 mô hình · công bố phương pháp", "Urutkan sesuai penggunaan nyata · 18 model dilacak · metodologi diungkap")}
          </div>
        </div>
        <div style={{display:"flex", gap:6, alignItems:"center"}}>
          <span className="text-mute" style={{fontSize:12, marginRight:4}}>{t("Optimize for:", "Tối ưu cho:", "Optimalkan untuk:")}</span>
          {[
            ["reasoning", t("Reasoning", "Suy luận", "Penalaran")], ["coding", t("Coding", "Lập trình", "Coding")], ["speed", t("Speed", "Tốc độ", "Kecepatan")], ["price", t("Price (low)", "Giá (thấp)", "Harga (rendah)")]
          ].map(([k, l])=>(
            <button key={k} onClick={()=>{setSortKey(k); setSortDir(k==="price"?"asc":"desc");}} style={{
              padding:"6px 12px", fontSize:12, fontFamily:"var(--font-sans)",
              background: sortKey===k ? "var(--ink)" : "var(--surface)",
              color: sortKey===k ? "var(--paper)" : "var(--ink)",
              border:"1px solid var(--hair-2)", borderRadius:99, cursor:"pointer"
            }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{border:"1px solid var(--hair)", borderRadius:8, overflow:"hidden", background:"var(--surface)"}}>
        <table style={{width:"100%", borderCollapse:"collapse"}}>
          <thead>
            <tr>
              <Th k="rank" num>#</Th>
              <Th k="model">Model</Th>
              <Th k="maker">Maker</Th>
              <Th k="reasoning" num>Reasoning</Th>
              <Th k="coding" num>Coding</Th>
              <Th k="speed" num>Speed</Th>
              <Th k="price" num>$/M tok</Th>
              <Th k="ctx" num>Context</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m, i)=>(
              <tr key={m.model} style={{borderBottom:"1px solid var(--hair)", background: i%2===0?"transparent":"var(--paper)"}}>
                <td className="mono" style={{padding:"14px 12px", fontSize:12, color:"var(--muted)", textAlign:"right", width:48}}>{i+1}</td>
                <td style={{padding:"14px 12px"}}>
                  <div style={{fontWeight:600, fontSize:14}} className="serif">{m.model}</div>
                </td>
                <td style={{padding:"14px 12px", fontSize:12, color:"var(--muted)"}}>{m.maker}</td>
                <td style={{padding:"14px 12px"}}><Bar v={m.reasoning} color="var(--ai)"/></td>
                <td style={{padding:"14px 12px"}}><Bar v={m.coding} color="var(--dev)"/></td>
                <td style={{padding:"14px 12px"}}><Bar v={m.speed} color="var(--startups)"/></td>
                <td className="mono tnum" style={{padding:"14px 12px", textAlign:"right", fontSize:13, color: m.price===0?"var(--up)":"var(--ink)"}}>
                  {m.price===0 ? "free" : "$"+m.price.toFixed(1)}
                </td>
                <td className="mono tnum" style={{padding:"14px 12px", textAlign:"right", fontSize:13}}>{m.ctx}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

Object.assign(window, { DashboardsLanding, FundingTracker, AILeaderboard });
