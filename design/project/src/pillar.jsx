// ============ PILLAR PAGE ============
function PillarPage({ pillarId, navigate, subsection }){
  const pillar = pillarOf(pillarId);

  // Real articles for this pillar — padded with deterministic variants so the
  // page has enough material to demonstrate pagination (20 per Load-more step).
  const all = useMemo(()=>{
    const real = ARTICLES.filter(a=>a.pillar===pillarId);
    if(real.length === 0) return [];
    const padded = [...real];
    let i = 0;
    while(padded.length < 80){
      const src = real[i % real.length];
      const offsetHours = (Math.floor(padded.length/real.length)) * 36 + (i%real.length)*3;
      const newDate = new Date(new Date(src.published).getTime() - offsetHours*3600*1000);
      padded.push({
        ...src,
        id: `${src.id}-v${padded.length}`,
        published: newDate.toISOString(),
      });
      i++;
    }
    return padded;
  }, [pillarId]);

  const featured = all[0] || ARTICLES[0];
  const rest = all.slice(1);

  const subsections = useMemo(()=>{
    const s = new Set();
    all.forEach(a=>a.section && s.add(a.section));
    return ["All", ...s];
  },[pillarId]);
  const [activeSub, setActiveSub] = useState(subsection || "All");
  const [shown, setShown] = useState(21);

  // Reset paginator when filter changes
  useEffect(()=>{ setShown(21); }, [activeSub, pillarId]);

  const visible = activeSub==="All" ? rest : rest.filter(a=>a.section===activeSub);
  const paged = visible.slice(0, shown);
  const hasMore = visible.length > shown;

  return (
    <div className="container" style={{paddingTop:24, paddingBottom:32}}>
      {/* Pillar header */}
      <header style={{borderBottom:`4px solid ${pillar.color}`, paddingBottom:24, marginBottom:32, position:"relative"}}>
        <div style={{display:"flex", alignItems:"center", gap:14, marginBottom:8}}>
          <Icon name={PILLAR_ICONS[pillarId]} size={22} color={pillar.color} stroke={2}/>
          <span className="upper" style={{fontSize:12, fontWeight:700, letterSpacing:".18em", color:pillar.color}}>
            DTW · {pillar.label}
          </span>
        </div>
        <h1 className="serif" style={{margin:"0 0 12px", fontSize:64, fontWeight:700, letterSpacing:"-0.03em", lineHeight:1, color:"var(--ink)"}}>
          {pillarHeading(pillarId)}
        </h1>
        <p className="serif text-mute" style={{margin:0, fontSize:19, lineHeight:1.45, maxWidth:760}}>
          {pillarDescription(pillarId)}
        </p>
        <div style={{display:"flex", gap:8, alignItems:"center", marginTop:20}}>
          <Button variant="outline" size="sm">Follow {pillar.label}</Button>
          <Button variant="ghost" size="sm">RSS feed</Button>
          <span className="text-mute-2 mono" style={{fontSize:11, marginLeft:8}}>
            {all.length} stories · 6 reporters · updated 12 min ago
          </span>
        </div>
      </header>

      {/* Subsection tabs */}
      <div style={{display:"flex", gap:0, marginBottom:32, borderBottom:"1px solid var(--hair)", overflowX:"auto"}}>
        {subsections.map(s=>(
          <button key={s} onClick={()=>setActiveSub(s)} style={{
            padding:"12px 18px", background:"transparent", border:"none",
            borderBottom: activeSub===s ? `2px solid ${pillar.color}` : "2px solid transparent",
            marginBottom:-1, fontSize:13, fontWeight: activeSub===s?600:400,
            color: activeSub===s ? "var(--ink)" : "var(--muted)",
            cursor:"pointer", whiteSpace:"nowrap"
          }}>{s}</button>
        ))}
        <div style={{flex:1}}/>
        <div style={{display:"flex", alignItems:"center", gap:8, paddingRight:8}}>
          <span className="text-mute-2 mono" style={{fontSize:11}}>Sort:</span>
          <select style={{background:"transparent", border:"1px solid var(--hair-2)", padding:"4px 8px", borderRadius:4, fontSize:12, color:"var(--ink)", fontFamily:"var(--font-sans)"}}>
            <option>Latest</option>
            <option>Most read</option>
            <option>Editor's picks</option>
          </select>
        </div>
      </div>

      {/* Featured */}
      <article onClick={()=>navigate(`/article/${featured.slug}`)} style={{
        display:"grid", gridTemplateColumns:"1.3fr 1fr", gap:36,
        cursor:"pointer", marginBottom:48, paddingBottom:32, borderBottom:"1px solid var(--hair)"
      }}>
        <CoverArt pillar={featured.pillar} seed={featured.id} variant={5} height={440} label="FEATURED"/>
        <div style={{display:"flex", flexDirection:"column", justifyContent:"center"}}>
          <div className="kicker" style={{color:pillar.color, marginBottom:10}}>
            Featured · {featured.section}
          </div>
          <h2 className="serif" style={{margin:"0 0 14px", fontSize:42, fontWeight:700, letterSpacing:"-0.025em", lineHeight:1.05, textWrap:"balance"}}>
            {featured.title}
          </h2>
          <p className="serif text-mute" style={{margin:"0 0 18px", fontSize:17, lineHeight:1.5}}>{featured.dek}</p>
          <ByLine article={featured} size="lg"/>
        </div>
      </article>

      {/* Grid */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:32}}>
        {paged.map((a,i)=>(
          <article key={a.id} onClick={()=>navigate(`/article/${a.slug}`)} style={{cursor:"pointer"}}>
            <CoverArt pillar={a.pillar} seed={a.id} variant={(i+2)%6} height={210} style={{marginBottom:14}}/>
            <PillarTag id={a.pillar}/>
            <h3 className="serif" style={{margin:"8px 0 8px", fontSize:21, fontWeight:600, lineHeight:1.25, letterSpacing:"-0.01em", textWrap:"balance"}}>
              {a.title}
            </h3>
            <p className="text-mute serif" style={{margin:"0 0 10px", fontSize:14, lineHeight:1.45}}>{a.dek?.slice(0,140)}…</p>
            <div className="text-mute" style={{fontSize:12}}>{authorOf(a.author).name} · {fmtTimeAgo(a.published)} · {a.readMin}m</div>
          </article>
        ))}
      </div>

      {hasMore && (
        <div style={{textAlign:"center", marginTop:48}}>
          <Button variant="outline" size="lg" onClick={()=>setShown(s => s + 21)}>
            Load more
          </Button>
        </div>
      )}

      {!hasMore && visible.length > 21 && (
        <div style={{textAlign:"center", marginTop:48, color:"var(--muted)", fontSize:13}}>
          End of feed — {visible.length} stories shown.
        </div>
      )}

      {visible.length === 0 && (
        <div style={{textAlign:"center", padding:"60px 0", color:"var(--muted)", fontSize:14}}>
          Nothing in this subsection yet. Try "All".
        </div>
      )}
    </div>
  );
}

function pillarHeading(id){
  return {
    ai:        "Artificial Intelligence",
    startups:  "Startups & Capital",
    asia:      "Asia",
    dev:       "Developers",
    products:  "Products & Reviews",
    policy:    "Policy & Regulation",
  }[id] || "Pillar";
}
function pillarDescription(id){
  return {
    ai:        "Frontier models, infrastructure, and the policy that shapes them. Reported across Seoul, Singapore, Bengaluru, and Hangzhou.",
    startups:  "Term sheets, IPOs, layoffs, and the operators building the next wave across ASEAN, India, and Greater China.",
    asia:      "Our flagship beat. Geopolitics, capital flows, and product launches across the most consequential tech region of the decade.",
    dev:       "Engineering practice. Tools, frameworks, and the trade-offs teams are actually making in production.",
    products:  "Independent reviews of phones, laptops, audio, and wearables. Affiliate-disclosed. Manufacturers do not approve our copy.",
    policy:    "Trade rules, export controls, central-bank decisions, and the regulators who write them – covered as the technology beat they have become.",
  }[id] || "";
}

Object.assign(window, { PillarPage });
