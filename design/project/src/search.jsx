// ============ FULL SEARCH PAGE ============
function SearchPage({ navigate, initialQuery }){
  const [q, setQ] = useState(initialQuery || "");
  const [pillar, setPillar] = useState("All");
  const [dateRange, setDateRange] = useState("any");
  const [type, setType] = useState("any");
  const t = useT();
  const { lang } = useLang();

  const results = useMemo(()=>{
    let r = ARTICLES;
    if(q.trim()){
      const Q = q.toLowerCase();
      r = r.filter(a => a.title.toLowerCase().includes(Q) || a.dek?.toLowerCase().includes(Q));
    }
    if(pillar !== "All") r = r.filter(a=>a.pillar===pillar);
    return r;
  },[q, pillar]);

  return (
    <div className="container" style={{paddingTop:24, paddingBottom:48}}>
      <div style={{marginBottom:32}}>
        <div className="kicker" style={{marginBottom:6}}>{t("Search","Tìm kiếm","Cari")}</div>
        <div style={{display:"flex", gap:12, alignItems:"center"}}>
          <input value={q} onChange={e=>setQ(e.target.value)} autoFocus placeholder={t("Search stories, dashboards, authors, awards…","Tìm bài báo, bảng dữ liệu, tác giả, giải thưởng…","Cari artikel, dasbor, penulis, penghargaan…")} style={{
            flex:1, padding:"16px 18px", border:"1px solid var(--hair-2)",
            borderRadius:6, fontSize:20, background:"var(--surface)",
            color:"var(--ink)", fontFamily:"var(--font-serif)", fontWeight:500
          }}/>
          <span className="text-mute mono" style={{fontSize:11}}>
            {results.length} {t("matches","kết quả","hasil")} · 134ms
          </span>
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"220px 1fr", gap:36}}>
        {/* Facets */}
        <aside style={{position:"sticky", top:160, alignSelf:"flex-start"}}>
          <FacetBlock title={t("Pillar","Chuyên mục","Pilar")}>
            {["All", ...PILLARS.map(p=>p.id)].map(p=>(
              <button key={p} onClick={()=>setPillar(p)} style={{
                display:"flex", alignItems:"center", gap:8, width:"100%", textAlign:"left",
                padding:"6px 8px", background: pillar===p?"var(--surface-2)":"transparent",
                border:"none", borderRadius:4, fontSize:13, cursor:"pointer",
                color:"var(--ink)"
              }}>
                {p!=="All" && <span style={{width:6, height:6, background:pillarOf(p).color, display:"inline-block"}}/>}
                {p==="All" ? t("All pillars","Tất cả chuyên mục","Semua pilar") : localizedPillarLabel(p, lang)}
                <span className="text-mute-2 mono" style={{fontSize:10, marginLeft:"auto"}}>
                  {p==="All" ? ARTICLES.length : ARTICLES.filter(a=>a.pillar===p).length}
                </span>
              </button>
            ))}
          </FacetBlock>
          <FacetBlock title={t("Date","Ngày","Tanggal")}>
            {[["any",t("Any time","Bất kỳ lúc nào","Kapan saja")], ["24h",t("Last 24h","24 giờ qua","24 jam terakhir")], ["7d",t("Last 7 days","7 ngày qua","7 hari terakhir")], ["30d",t("Last 30 days","30 ngày qua","30 hari terakhir")], ["12m",t("Last 12 months","12 tháng qua","12 bulan terakhir")]].map(([k,l])=>(
              <button key={k} onClick={()=>setDateRange(k)} style={{
                display:"block", width:"100%", textAlign:"left",
                padding:"6px 8px", background: dateRange===k?"var(--surface-2)":"transparent",
                border:"none", borderRadius:4, fontSize:13, cursor:"pointer", color:"var(--ink)"
              }}>{l}</button>
            ))}
          </FacetBlock>
          <FacetBlock title={t("Type","Loại","Jenis")}>
            {[["any",t("Anything","Tất cả","Semua")], ["article",t("Articles","Bài báo","Artikel")], ["dashboard",t("Dashboards","Bảng dữ liệu","Dasbor")], ["author",t("Authors","Tác giả","Penulis")], ["award",t("Awards","Giải thưởng","Penghargaan")]].map(([k,l])=>(
              <button key={k} onClick={()=>setType(k)} style={{
                display:"block", width:"100%", textAlign:"left",
                padding:"6px 8px", background: type===k?"var(--surface-2)":"transparent",
                border:"none", borderRadius:4, fontSize:13, cursor:"pointer", color:"var(--ink)"
              }}>{l}</button>
            ))}
          </FacetBlock>
          <div style={{padding:14, background:"var(--surface)", border:"1px solid var(--hair)", borderRadius:6, marginTop:18}}>
            <div className="mono upper text-mute" style={{fontSize:9, fontWeight:600, letterSpacing:".14em"}}>
              Powered by Typesense
            </div>
            <div style={{fontSize:12, color:"var(--ink)", marginTop:6, lineHeight:1.45}}>
              {t("Typo-tolerant. EN · ID · VI. Indexed across articles, dashboards, awards, and people.","Chịu lỗi chính tả. EN · ID · VI. Đánh chỉ mục bài báo, bảng dữ liệu, giải thưởng và con người.","Toleran salah ketik. EN · ID · VI. Terindeks di artikel, dasbor, penghargaan, dan orang.")}
            </div>
          </div>
        </aside>

        {/* Results */}
        <div>
          {!q.trim() && (
            <div style={{padding:"32px 0"}}>
              <div className="kicker text-mute" style={{marginBottom:14}}>{t("Trending searches","Tìm kiếm thịnh hành","Pencarian populer")}</div>
              <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
                {["sovereign AI Singapore", "VNG IPO Singapore", "TSMC advanced packaging", "UPI Vietnam bilateral", "Tokopedia Grab layoffs", "ERNIE-X open weights"].map(t=>(
                  <button key={t} onClick={()=>setQ(t)} className="pill" style={{cursor:"pointer"}}>{t}</button>
                ))}
              </div>
            </div>
          )}
          {q.trim() && results.length === 0 && (
            <div style={{padding:"40px 24px", border:"1px dashed var(--hair-2)", borderRadius:6, textAlign:"center"}}>
              <div className="serif" style={{fontSize:20, fontWeight:600, marginBottom:6}}>{t(`No results for "${q}"`,`Không có kết quả cho "${q}"`,`Tidak ada hasil untuk "${q}"`)}</div>
              <div className="text-mute" style={{fontSize:13}}>{t("We log empty queries so editors know what we're missing. Try fewer words.","Chúng tôi ghi lại tìm kiếm rỗng để biên tập biết điều còn thiếu. Thử ít từ hơn.","Kami mencatat kueri kosong agar editor tahu yang kurang. Coba kata lebih sedikit.")}</div>
            </div>
          )}
          <div style={{display:"flex", flexDirection:"column", gap:0}}>
            {results.map(a=>(
              <article key={a.id} onClick={()=>navigate(`/article/${a.slug}`)} style={{
                display:"grid", gridTemplateColumns:"160px 1fr", gap:20,
                padding:"22px 0", borderBottom:"1px solid var(--hair)", cursor:"pointer"
              }}>
                <CoverArt pillar={a.pillar} seed={a.id} variant={(a.id.charCodeAt(0))%6} height={110}/>
                <div>
                  <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:6}}>
                    <PillarTag id={a.pillar}/>
                    <span className="mono text-mute-2" style={{fontSize:11}}>{a.section}</span>
                    <span className="text-mute-2" style={{fontSize:11}}>·</span>
                    <span className="mono text-mute-2" style={{fontSize:11}}>{fmtDate(a.published)}</span>
                  </div>
                  <h3 className="serif" style={{margin:"0 0 6px", fontSize:21, fontWeight:600, lineHeight:1.3, letterSpacing:"-0.01em", textWrap:"balance"}}>
                    {a.title}
                  </h3>
                  <p className="serif text-mute" style={{margin:"0 0 8px", fontSize:14, lineHeight:1.5}}>{a.dek}</p>
                  <div className="text-mute" style={{fontSize:12}}>{t("By","Bởi","Oleh")} {authorOf(a.author).name} · {a.readMin} {t("min","phút","menit")}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FacetBlock({ title, children }){
  return (
    <div style={{marginBottom:24}}>
      <div className="upper" style={{fontSize:10, fontWeight:600, letterSpacing:".14em", color:"var(--muted)", marginBottom:10, padding:"0 8px"}}>
        {title}
      </div>
      <div style={{display:"flex", flexDirection:"column", gap:2}}>{children}</div>
    </div>
  );
}

Object.assign(window, { SearchPage });
