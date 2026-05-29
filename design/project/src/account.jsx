// ============ ACCOUNT ============
function AccountPage({ navigate, user, tab }){
  const [active, setActive] = useState(tab || "saved");
  useEffect(()=>{ if(tab) setActive(tab); }, [tab]);

  if(!user){
    return (
      <div className="container" style={{paddingTop:48, paddingBottom:48, textAlign:"center"}}>
        <h2 className="serif" style={{fontSize:30, fontWeight:600}}>Log in to view your account.</h2>
      </div>
    );
  }

  const tabs = [
    ["saved", "Saved"],
    ["history", "Reading history"],
    ["following", "Following"],
    ["newsletters", "Newsletters"],
    ["settings", "Settings"],
  ];

  return (
    <div className="container" style={{paddingTop:24, paddingBottom:48}}>
      <header style={{borderBottom:"1px solid var(--hair)", paddingBottom:24, marginBottom:24, display:"flex", gap:24, alignItems:"center"}}>
        <div style={{
          width:72, height:72, borderRadius:"50%",
          background:"var(--accent)", color:"#fff",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:28, fontWeight:700, fontFamily:"var(--font-serif)"
        }}>{user.name[0]}</div>
        <div style={{flex:1}}>
          <h1 className="serif" style={{margin:"0 0 4px", fontSize:32, fontWeight:700, letterSpacing:"-0.02em"}}>{user.name}</h1>
          <div className="text-mute" style={{fontSize:13}}>
            <span className="mono">{user.email}</span> · joined May 2026 · <span style={{padding:"2px 8px", background:"var(--surface-2)", borderRadius:3, fontSize:11, fontWeight:600}}>{user.role}</span>
          </div>
        </div>
        <Button variant={user.pro?"primary":"accent"}>
          {user.pro ? "DTW Pro · active" : "Upgrade to Pro · $12/mo"}
        </Button>
      </header>

      <div style={{display:"grid", gridTemplateColumns:"220px 1fr", gap:36}}>
        <nav style={{display:"flex", flexDirection:"column", gap:2}}>
          {tabs.map(([k,l])=>(
            <button key={k} onClick={()=>setActive(k)} style={{
              display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"10px 12px", background: active===k?"var(--ink)":"transparent",
              color: active===k?"var(--paper)":"var(--ink)",
              border:"none", borderRadius:5, fontSize:13, cursor:"pointer", textAlign:"left"
            }}>{l}{active===k && <span>→</span>}</button>
          ))}
        </nav>

        <div>
          {active === "saved" && <AccountSaved navigate={navigate}/>}
          {active === "history" && <AccountHistory navigate={navigate}/>}
          {active === "following" && <AccountFollowing/>}
          {active === "newsletters" && <AccountNewsletters/>}
          {active === "settings" && <AccountSettings/>}
        </div>
      </div>
    </div>
  );
}

function AccountSaved({ navigate }){
  const saved = ARTICLES.slice(2, 7);
  return (
    <section>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:18}}>
        <h2 className="serif" style={{margin:0, fontSize:24, fontWeight:700, letterSpacing:"-0.015em"}}>Saved articles</h2>
        <span className="text-mute mono" style={{fontSize:11}}>{saved.length} saved · synced across 3 devices</span>
      </div>
      <div style={{display:"grid", gap:0}}>
        {saved.map((a,i)=>(
          <article key={a.id} onClick={()=>navigate(`/article/${a.slug}`)} style={{
            display:"grid", gridTemplateColumns:"100px 1fr auto", gap:18, padding:"16px 0",
            borderBottom: i<saved.length-1?"1px solid var(--hair)":"none", cursor:"pointer", alignItems:"center"
          }}>
            <CoverArt pillar={a.pillar} seed={a.id} variant={(i+1)%6} height={66}/>
            <div>
              <PillarTag id={a.pillar}/>
              <div className="serif" style={{fontSize:16, fontWeight:600, marginTop:4, lineHeight:1.3}}>{a.title}</div>
              <div className="text-mute" style={{fontSize:11, marginTop:4}}>Saved {fmtTimeAgo(a.published)} · {a.readMin} min</div>
            </div>
            <Button variant="ghost" size="sm"><Icon name="bookmark" size={12}/> Remove</Button>
          </article>
        ))}
      </div>
    </section>
  );
}

function AccountHistory({ navigate }){
  const hist = ARTICLES.slice(0,6);
  return (
    <section>
      <h2 className="serif" style={{margin:"0 0 18px", fontSize:24, fontWeight:700, letterSpacing:"-0.015em"}}>Reading history</h2>
      <div className="mono text-mute-2" style={{fontSize:11, marginBottom:14}}>
        We use this to recommend, and to reset your free-article meter. Clear any time.
      </div>
      {hist.map((a,i)=>(
        <div key={a.id} onClick={()=>navigate(`/article/${a.slug}`)} style={{
          display:"flex", justifyContent:"space-between", padding:"10px 0",
          borderBottom: i<hist.length-1?"1px solid var(--hair)":"none", cursor:"pointer", alignItems:"center"
        }}>
          <div style={{display:"flex", gap:12, alignItems:"center"}}>
            <PillarTag id={a.pillar}/>
            <span style={{fontSize:13}}>{a.title}</span>
          </div>
          <span className="mono text-mute" style={{fontSize:11}}>{fmtTimeAgo(a.published)}</span>
        </div>
      ))}
    </section>
  );
}

function AccountFollowing(){
  const [following, setFollowing] = useState(new Set(["ai","asia"]));
  const toggle = (id)=>{
    const s = new Set(following); s.has(id)?s.delete(id):s.add(id); setFollowing(s);
  };
  return (
    <section>
      <h2 className="serif" style={{margin:"0 0 8px", fontSize:24, fontWeight:700, letterSpacing:"-0.015em"}}>Following</h2>
      <div className="text-mute" style={{fontSize:13, marginBottom:18}}>
        Followed pillars sync to your home tab and your offline cache (20 recent stories each).
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:12}}>
        {PILLARS.map(p=>{
          const on = following.has(p.id);
          return (
            <div key={p.id} style={{
              display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"14px 16px", background:"var(--surface)",
              border:"1px solid var(--hair)", borderRadius:6
            }}>
              <div style={{display:"flex", alignItems:"center", gap:10}}>
                <span style={{width:10, height:10, background:p.color, display:"inline-block"}}/>
                <span style={{fontSize:14, fontWeight:600}}>{p.label}</span>
              </div>
              <Button variant={on?"primary":"outline"} size="sm" onClick={()=>toggle(p.id)}>
                {on?"Following":"Follow"}
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function AccountNewsletters(){
  return (
    <section>
      <h2 className="serif" style={{margin:"0 0 18px", fontSize:24, fontWeight:700, letterSpacing:"-0.015em"}}>Your newsletters</h2>
      {NEWSLETTERS.slice(0,3).map((n,i)=>(
        <div key={n.id} style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"14px 0", borderBottom: i<2?"1px solid var(--hair)":"none"
        }}>
          <div>
            <div style={{fontSize:14, fontWeight:600}}>{n.name}</div>
            <div className="text-mute mono" style={{fontSize:11}}>{n.cadence}</div>
          </div>
          <div style={{display:"flex", gap:8}}>
            <Button variant="outline" size="sm">Pause</Button>
            <Button variant="ghost" size="sm" style={{color:"var(--down)"}}>Unsubscribe</Button>
          </div>
        </div>
      ))}
    </section>
  );
}

function AccountSettings(){
  return (
    <section>
      <h2 className="serif" style={{margin:"0 0 18px", fontSize:24, fontWeight:700, letterSpacing:"-0.015em"}}>Preferences</h2>
      {[
        ["Appearance",  "Light / Dark / System",         "Light"],
        ["Language",    "Site, newsletters, dashboards", "English"],
        ["Region",      "Date / currency / number",      "Singapore"],
        ["Email",       "Where we send your magic links","reader@gmail.com"],
        ["Two-factor",  "Required for editor/admin",     "Off"],
        ["Data export", "Download your data (GDPR/PDPA)","Request export"],
      ].map(([k,desc,v],i)=>(
        <div key={k} style={{
          display:"grid", gridTemplateColumns:"180px 1fr auto", gap:14,
          padding:"16px 0", borderBottom:"1px solid var(--hair)", alignItems:"center"
        }}>
          <div style={{fontSize:13, fontWeight:600}}>{k}</div>
          <div className="text-mute" style={{fontSize:12}}>{desc}</div>
          <Button variant="outline" size="sm">{v}</Button>
        </div>
      ))}
    </section>
  );
}

Object.assign(window, { AccountPage });
