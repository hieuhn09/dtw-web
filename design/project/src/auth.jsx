function AuthModal({ open, onClose, mode="login", onLogin }){
  const [m, setM] = useState(mode);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(()=>{ if(open){ setM(mode); setSent(false); }}, [open, mode]);
  useEffect(()=>{
    const onKey = (e)=>{ if(e.key==="Escape") onClose(); };
    if(open) window.addEventListener("keydown", onKey);
    return ()=> window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if(!open) return null;

  const handleSubmit = (e)=>{
    e.preventDefault();
    setSent(true);
    setTimeout(()=>{
      onLogin({ name: email.split("@")[0].split(/[._]/).map(s=>s[0]?.toUpperCase()+s.slice(1)).join(" ") || "Reader",
                email, role:"Reader", pro:false });
      onClose();
    }, 1100);
  };

  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:"rgba(17, 17, 17, .55)",
      backdropFilter:"blur(2px)", zIndex:100,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20
    }}>
      <div onClick={e=>e.stopPropagation()} className="fade-up" style={{
        background:"var(--surface)", border:"1px solid var(--hair)",
        borderRadius:8, width:"100%", maxWidth:440, padding:32,
        boxShadow:"0 24px 64px -16px rgba(17, 17, 17, .4)"
      }}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
          <Wordmark size={22}/>
          <button onClick={onClose} style={{
            background:"transparent", border:"none", fontSize:18,
            cursor:"pointer", color:"var(--muted)", padding:4
          }}>✕</button>
        </div>
        <h2 className="serif" style={{margin:"18px 0 6px", fontSize:26, fontWeight:600, letterSpacing:"-0.01em"}}>
          {m==="login" ? "Welcome back" : "Read what matters in tech, across Asia and the world"}
        </h2>
        <p className="text-mute" style={{margin:"0 0 24px", fontSize:13}}>
          {m==="login"
            ? "Magic-link sign in. We don't use passwords."
            : "Create a free account to save articles, follow pillars, and sync across devices."}
        </p>

        {sent ? (
          <div style={{
            border:"1px solid var(--up)", background:"color-mix(in oklab, var(--up) 8%, transparent)",
            padding:16, borderRadius:6, fontSize:13
          }}>
            <div style={{fontWeight:600, marginBottom:4}}>Check your inbox</div>
            <span className="text-mute">We sent a sign-in link to <strong style={{color:"var(--ink)"}}>{email}</strong>. It expires in 15 minutes.</span>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <label className="upper" style={{fontSize:10, fontWeight:600, letterSpacing:".14em", display:"block", marginBottom:6}}>Email address</label>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="you@company.com" style={{
                  width:"100%", padding:"12px 14px",
                  border:"1px solid var(--hair-2)", borderRadius:5,
                  fontSize:14, background:"var(--paper)", color:"var(--ink)",
                  fontFamily:"var(--font-sans)"
                }}/>
              <Button variant="primary" size="lg" type="submit" style={{width:"100%", marginTop:12}}>
                {m==="login" ? "Send magic link" : "Create account"}
              </Button>
            </form>

            <div style={{display:"flex", alignItems:"center", gap:12, margin:"20px 0"}}>
              <div style={{flex:1, height:1, background:"var(--hair)"}}/>
              <span className="text-mute" style={{fontSize:11}}>or continue with</span>
              <div style={{flex:1, height:1, background:"var(--hair)"}}/>
            </div>

            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8}}>
              {["Google", "Apple", "GitHub"].map(p=>(
                <button key={p} onClick={()=>{setEmail(`reader@${p.toLowerCase()}.com`); setTimeout(()=>handleSubmit({preventDefault(){}}), 0);}} style={{
                  padding:"10px 8px", border:"1px solid var(--hair-2)",
                  background:"var(--paper)", borderRadius:5, fontSize:12,
                  cursor:"pointer", color:"var(--ink)", fontWeight:500
                }}>{p}</button>
              ))}
            </div>

            <div style={{marginTop:24, fontSize:12, textAlign:"center"}} className="text-mute">
              {m==="login" ? "New to dailytechwire? " : "Already have an account? "}
              <a onClick={()=>setM(m==="login"?"signup":"login")} style={{cursor:"pointer", color:"var(--accent)", fontWeight:500}}>
                {m==="login" ? "Create an account" : "Log in"}
              </a>
            </div>
            <div style={{marginTop:8, fontSize:11, textAlign:"center"}} className="text-mute-2">
              By continuing you agree to our Terms and Privacy. <br/>
              Admins and editors require 2FA.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SearchOverlay({ open, onClose, navigate }){
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  useEffect(()=>{ if(open) setTimeout(()=>inputRef.current?.focus(), 50); }, [open]);
  useEffect(()=>{
    const onKey = (e)=>{ if(e.key==="Escape") onClose(); };
    if(open) window.addEventListener("keydown", onKey);
    return ()=> window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(()=>{
    if(!q.trim()) return [];
    const Q = q.toLowerCase();
    return ARTICLES.filter(a =>
      a.title.toLowerCase().includes(Q) ||
      a.dek?.toLowerCase().includes(Q) ||
      a.pillar.toLowerCase().includes(Q)
    ).slice(0, 6);
  }, [q]);

  if(!open) return null;

  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:"rgba(17, 17, 17, .55)",
      zIndex:100, padding:"80px 20px 20px",
      display:"flex", justifyContent:"center", alignItems:"flex-start"
    }}>
      <div onClick={e=>e.stopPropagation()} className="fade-up" style={{
        background:"var(--surface)", border:"1px solid var(--hair)",
        borderRadius:10, width:"100%", maxWidth:680,
        boxShadow:"0 24px 64px -16px rgba(17, 17, 17, .4)", overflow:"hidden"
      }}>
        <div style={{display:"flex", alignItems:"center", gap:14, padding:"18px 22px", borderBottom:"1px solid var(--hair)"}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:"var(--muted)"}}>
            <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)}
            placeholder="Search 12,400 stories, dashboards, awards, people…"
            style={{
              flex:1, border:"none", outline:"none",
              fontSize:18, background:"transparent", color:"var(--ink)",
              fontFamily:"var(--font-serif)", fontWeight:500
            }}/>
          <span className="mono text-mute" style={{fontSize:11}}>ESC</span>
        </div>
        {q.trim() ? (
          results.length ? (
            <div style={{padding:8, maxHeight:480, overflow:"auto"}}>
              {results.map(a=>(
                <button key={a.id} onClick={()=>{onClose(); navigate(`/article/${a.slug}`);}} style={{
                  display:"block", width:"100%", textAlign:"left",
                  padding:"12px 14px", background:"transparent", border:"none",
                  borderRadius:6, cursor:"pointer", color:"var(--ink)"
                }} onMouseEnter={e=>e.currentTarget.style.background="color-mix(in oklab, var(--ink) 8%, transparent)"}
                   onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:4}}>
                    <PillarTag id={a.pillar} size="sm"/>
                    <span className="mono text-mute-2" style={{fontSize:10}}>{fmtTimeAgo(a.published)}</span>
                  </div>
                  <div className="serif" style={{fontSize:15, lineHeight:1.35, fontWeight:600, color:"var(--ink)"}}>{a.title}</div>
                </button>
              ))}
              <div style={{padding:"10px 14px", borderTop:"1px solid var(--hair)", marginTop:4}}>
                <button onClick={()=>{onClose(); navigate("/search?q="+encodeURIComponent(q));}} className="linkish" style={{
                  background:"transparent", border:"none", fontSize:12, color:"var(--accent)", cursor:"pointer", fontWeight:600
                }}>View all results for "{q}" →</button>
              </div>
            </div>
          ) : (
            <div style={{padding:"30px 22px", color:"var(--muted)", fontSize:13}}>
              No matches. Try a pillar (AI, Latest, Dev), an author, or a company name.
            </div>
          )
        ) : (
          <div style={{padding:18}}>
            <div className="upper text-mute" style={{fontSize:10, fontWeight:600, letterSpacing:".14em", padding:"6px 8px"}}>Trending</div>
            {["sovereign AI", "TSMC packaging", "VNG IPO", "UPI Vietnam", "AI Leaderboard"].map(t=>(
              <button key={t} onClick={()=>setQ(t)} style={{
                display:"block", width:"100%", textAlign:"left",
                padding:"10px 12px", background:"transparent", border:"none",
                borderRadius:6, cursor:"pointer", fontSize:13, color:"var(--ink)"
              }} onMouseEnter={e=>e.currentTarget.style.background="color-mix(in oklab, var(--ink) 8%, transparent)"}
                 onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <span className="text-mute mono" style={{fontSize:11, marginRight:10}}>↗</span>{t}
              </button>
            ))}
            <div className="mono text-mute-2" style={{fontSize:10, padding:"12px 8px 0", borderTop:"1px solid var(--hair)", marginTop:6}}>
              Results in &lt;300ms · powered by Typesense · typo-tolerant · en / id / vi
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { AuthModal, SearchOverlay });
