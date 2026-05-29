// ============ FULL SEARCH PAGE ============
function SearchPage({ navigate, initialQuery }){
  const [q, setQ] = useState(initialQuery || "");
  const [pillar, setPillar] = useState("All");
  const [dateRange, setDateRange] = useState("any");
  const [type, setType] = useState("any");

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
        <div className="kicker" style={{marginBottom:6}}>Search</div>
        <div style={{display:"flex", gap:12, alignItems:"center"}}>
          <input value={q} onChange={e=>setQ(e.target.value)} autoFocus placeholder="Search stories, dashboards, authors, awards…" style={{
            flex:1, padding:"16px 18px", border:"1px solid var(--hair-2)",
            borderRadius:6, fontSize:20, background:"var(--surface)",
            color:"var(--ink)", fontFamily:"var(--font-serif)", fontWeight:500
          }}/>
          <span className="text-mute mono" style={{fontSize:11}}>
            {results.length} matches · 134ms
          </span>
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"220px 1fr", gap:36}}>
        {/* Facets */}
        <aside style={{position:"sticky", top:160, alignSelf:"flex-start"}}>
          <FacetBlock title="Pillar">
            {["All", ...PILLARS.map(p=>p.id)].map(p=>(
              <button key={p} onClick={()=>setPillar(p)} style={{
                display:"flex", alignItems:"center", gap:8, width:"100%", textAlign:"left",
                padding:"6px 8px", background: pillar===p?"var(--surface-2)":"transparent",
                border:"none", borderRadius:4, fontSize:13, cursor:"pointer",
                color:"var(--ink)"
              }}>
                {p!=="All" && <span style={{width:6, height:6, background:pillarOf(p).color, display:"inline-block"}}/>}
                {p==="All" ? "All pillars" : pillarOf(p).label}
                <span className="text-mute-2 mono" style={{fontSize:10, marginLeft:"auto"}}>
                  {p==="All" ? ARTICLES.length : ARTICLES.filter(a=>a.pillar===p).length}
                </span>
              </button>
            ))}
          </FacetBlock>
          <FacetBlock title="Date">
            {[["any","Any time"], ["24h","Last 24h"], ["7d","Last 7 days"], ["30d","Last 30 days"], ["12m","Last 12 months"]].map(([k,l])=>(
              <button key={k} onClick={()=>setDateRange(k)} style={{
                display:"block", width:"100%", textAlign:"left",
                padding:"6px 8px", background: dateRange===k?"var(--surface-2)":"transparent",
                border:"none", borderRadius:4, fontSize:13, cursor:"pointer", color:"var(--ink)"
              }}>{l}</button>
            ))}
          </FacetBlock>
          <FacetBlock title="Type">
            {[["any","Anything"], ["article","Articles"], ["dashboard","Dashboards"], ["author","Authors"], ["award","Awards"]].map(([k,l])=>(
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
              Typo-tolerant. EN · ID · VI. Indexed across articles, dashboards, awards, and people.
            </div>
          </div>
        </aside>

        {/* Results */}
        <div>
          {!q.trim() && (
            <div style={{padding:"32px 0"}}>
              <div className="kicker text-mute" style={{marginBottom:14}}>Trending searches</div>
              <div style={{display:"flex", flexWrap:"wrap", gap:8}}>
                {["sovereign AI Singapore", "VNG IPO Singapore", "TSMC advanced packaging", "UPI Vietnam bilateral", "Tokopedia Grab layoffs", "ERNIE-X open weights"].map(t=>(
                  <button key={t} onClick={()=>setQ(t)} className="pill" style={{cursor:"pointer"}}>{t}</button>
                ))}
              </div>
            </div>
          )}
          {q.trim() && results.length === 0 && (
            <div style={{padding:"40px 24px", border:"1px dashed var(--hair-2)", borderRadius:6, textAlign:"center"}}>
              <div className="serif" style={{fontSize:20, fontWeight:600, marginBottom:6}}>No results for "{q}"</div>
              <div className="text-mute" style={{fontSize:13}}>We log empty queries so editors know what we're missing. Try fewer words.</div>
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
                  <div className="text-mute" style={{fontSize:12}}>By {authorOf(a.author).name} · {a.readMin} min</div>
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
