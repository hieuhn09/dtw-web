// ============== ARTICLE PAGE ==============
function ArticleBody({ article }){
  // sample paragraphs
  const paras = [
    "On the edge of Tuas, behind two security fences and a row of palm trees nobody planted, sits a building most Singaporeans will never enter. Inside: 220 megawatts of compute, a private fibre ring to Changi, and the quiet ambition of a city-state to host the largest sovereign AI cluster in Southeast Asia.",
    "The official story is procurement. The unofficial story, told over three months of conversations with engineers, ministry officials, and one very tired procurement lawyer, is more interesting.",
    "Tuas-3, as it is internally called, was conceived in late 2024 as a hedge. Singapore's compute exports to the rest of ASEAN had quietly become an instrument of soft power – first for Indonesia, then for Vietnam – and the Economic Development Board wanted to keep the option open as workloads grew.",
    "Construction began in February 2025. By the time the second of three halls came online this March, the wait-list for capacity included two ministerial-grade tenants from Jakarta, a Hanoi-based foundation model lab, and three Bangkok unicorns.",
    "What makes Tuas-3 different is not the silicon – most of which is, predictably, NVIDIA – but the policy stack underneath it. Every workload runs inside a sovereign perimeter that the operator cannot inspect. Audit logs are escrowed with a third party. Power is contracted, not utility-supplied.",
    "That last point matters more than the others. Singapore's grid is famously constrained; the country has a moratorium on new datacenter capacity that was supposed to last through 2030. Tuas-3 sidesteps it by operating as a regulated industrial customer of a specific power purchase agreement – one that nobody else, including the operator's competitors, can replicate.",
  ];

  // Find a quote-pull spot
  const pull = "Tuas-3 sidesteps the moratorium by operating as a regulated industrial customer of a power purchase agreement that nobody else can replicate.";

  return (
    <div style={{fontFamily:"var(--font-serif)", fontSize:17, lineHeight:1.65, color:"var(--ink)", maxWidth:680, margin:"0 auto"}}>
      {paras.slice(0,2).map((p,i)=>(
        <p key={i} style={{margin:"0 0 22px", textWrap:"pretty"}}>{p}</p>
      ))}

      {article.aiAssisted && <DisclosureBox kind="ai" position="top"/>}
      {article.sponsored && <DisclosureBox kind="sponsored" sponsor={article.sponsor} position="top"/>}

      {paras.slice(2,4).map((p,i)=>(
        <p key={i+10} style={{margin:"0 0 22px", textWrap:"pretty"}}>{p}</p>
      ))}

      {/* Pullquote */}
      <blockquote style={{
        margin:"40px -40px", padding:"24px 32px",
        borderLeft:"3px solid var(--accent)",
        background:"var(--surface)",
        fontSize:22, lineHeight:1.35, fontWeight:500,
        letterSpacing:"-0.005em", color:"var(--ink-2)"
      }}>
        "{pull}"
      </blockquote>

      <h3 className="serif" style={{margin:"32px 0 14px", fontSize:24, fontWeight:700, letterSpacing:"-0.015em"}}>
        The wait-list, in order
      </h3>

      <p style={{margin:"0 0 22px"}}>{paras[4]}</p>

      {/* Inline figure */}
      <figure style={{margin:"32px -40px"}}>
        <CoverArt pillar={article.pillar} seed={article.id+"-fig"} variant={4} height={300} label="DTW DATA DESK"/>
        <figcaption className="text-mute" style={{fontSize:12, marginTop:8, padding:"0 40px"}}>
          DTW Data Desk · Reconstructed from EMA filings and three operator interviews.
        </figcaption>
      </figure>

      <p style={{margin:"0 0 22px"}}>{paras[5]}</p>

      {/* sponsored mid-reminder */}
      {article.sponsored && <DisclosureBox kind="sponsored" sponsor={article.sponsor} position="middle"/>}

      <h3 className="serif" style={{margin:"32px 0 14px", fontSize:24, fontWeight:700, letterSpacing:"-0.015em"}}>
        What Jakarta wants
      </h3>
      <p style={{margin:"0 0 22px"}}>
        The Indonesian delegation that visited Tuas-3 in April left with a memorandum and an unspoken request: replicate the policy stack, not the steel. Jakarta is currently negotiating its own version of the PPA structure, with a target of 80 MW online by Q3 2027.
      </p>
      <p style={{margin:"0 0 22px"}}>
        Whether the model travels is the open question. Singapore's regulatory consistency is part of what makes the financing work; Indonesia's is part of what makes its capex 40% cheaper.
      </p>
      <p style={{margin:"0 0 22px"}}>
        The next reveal – a third hall, a fourth tenant, and a question of whether Bangkok joins the wait-list – is expected in Q3.
      </p>

      {/* AI disclosure tail reminder if applicable */}
      {article.aiAssisted && <DisclosureBox kind="ai" position="bottom"/>}
      {article.sponsored && <DisclosureBox kind="sponsored" sponsor={article.sponsor} position="bottom"/>}
    </div>
  );
}

function Paywall({ navigate, onLogin }){
  return (
    <div style={{
      position:"relative", maxWidth:680, margin:"0 auto",
      padding:"40px 36px 48px",
      background:"var(--surface)", border:"1px solid var(--hair)",
      borderRadius:8, textAlign:"center"
    }}>
      <div style={{
        position:"absolute", top:-80, left:0, right:0, height:80,
        background:"linear-gradient(to bottom, transparent, var(--paper))",
        pointerEvents:"none"
      }}/>
      <div className="kicker" style={{marginBottom:10}}>Free limit reached</div>
      <h3 className="serif" style={{margin:"0 0 10px", fontSize:30, fontWeight:700, letterSpacing:"-0.02em"}}>
        Keep reading the reporting that matters in Asia tech.
      </h3>
      <p className="text-mute" style={{margin:"0 0 24px", fontSize:14, lineHeight:1.55, maxWidth:480, marginLeft:"auto", marginRight:"auto"}}>
        You've read your 3 free articles this month. DTW Pro is $12/month – unlimited reading, full Dashboards, member-only Q&As, and zero ads.
      </p>
      <div style={{display:"flex", gap:10, justifyContent:"center", marginBottom:16}}>
        <Button variant="accent" size="lg" onClick={()=>navigate("/pro")}>Become a member – $12/mo</Button>
        <Button variant="outline" size="lg" onClick={onLogin}>I already have an account</Button>
      </div>
      <div className="mono text-mute-2" style={{fontSize:11}}>
        Free meter resets monthly · cancel anytime · invoice billing for teams
      </div>

      <div style={{marginTop:32, paddingTop:24, borderTop:"1px solid var(--hair)", display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:18, textAlign:"left"}}>
        {[
          ["Unlimited reading", "Across all six pillars and the archive."],
          ["Full Dashboards", "Funding tracker + AI leaderboard with CSV export."],
          ["Pro newsletters", "Member-only deep dives every Friday."],
        ].map(([k,v])=>(
          <div key={k}>
            <div style={{fontWeight:600, fontSize:13, marginBottom:4}}>{k}</div>
            <div className="text-mute" style={{fontSize:12}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RelatedRow({ navigate, currentId, pillar }){
  const related = ARTICLES.filter(a=>a.pillar===pillar && a.id!==currentId).slice(0,3);
  if(related.length===0) return null;
  return (
    <section style={{marginTop:64, paddingTop:32, borderTop:"3px solid var(--ink)"}}>
      <div className="kicker" style={{marginBottom:18}}>Read next</div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:24}}>
        {related.map(a=>(
          <article key={a.id} onClick={()=>navigate(`/article/${a.slug}`)} style={{cursor:"pointer"}}>
            <CoverArt pillar={a.pillar} seed={a.id} variant={(hashStr(a.id))%6} height={160} style={{marginBottom:12}}/>
            <PillarTag id={a.pillar}/>
            <h4 className="serif" style={{margin:"8px 0 6px", fontSize:18, fontWeight:600, lineHeight:1.3, letterSpacing:"-0.01em", textWrap:"balance"}}>
              {a.title}
            </h4>
            <div className="text-mute" style={{fontSize:12}}>{authorOf(a.author).name} · {a.readMin} min</div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AudioPlayerBar(){
  const [playing, setPlaying] = useState(false);
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:14,
      padding:"12px 16px", background:"var(--surface)",
      border:"1px solid var(--hair)", borderRadius:6,
      margin:"24px auto", maxWidth:680
    }}>
      <button onClick={()=>setPlaying(!playing)} style={{
        width:38,height:38, borderRadius:"50%", border:"none",
        background:"var(--ink)", color:"var(--paper)",
        cursor:"pointer",
        display:"flex", alignItems:"center", justifyContent:"center"
      }}><Icon name={playing?"pause":"play"} size={13} color="var(--paper)"/></button>
      <div style={{flex:1}}>
        <div style={{fontSize:13, fontWeight:600, marginBottom:4, display:"flex", alignItems:"center", gap:6}}>
          <Icon name="headphone" size={13}/> Listen to this article
        </div>
        <div style={{height:3, background:"var(--hair)", borderRadius:99, overflow:"hidden"}}>
          <div style={{width: playing?"24%":"0%", height:"100%", background:"var(--accent)", transition:"width .5s"}}/>
        </div>
      </div>
      <div className="mono text-mute" style={{fontSize:11}}>14:22 · AI voice</div>
      <a className="mono text-mute-2" style={{fontSize:11, cursor:"pointer"}}>↓ MP3</a>
    </div>
  );
}

function ShareBar(){
  const [saved, setSaved] = useState(false);
  const Btn = ({label, icon, onClick, active}) => (
    <button onClick={onClick} style={{
      display:"flex", alignItems:"center", gap:6,
      padding:"7px 11px", border:"1px solid var(--hair-2)",
      background: active ? "var(--ink)" : "var(--surface)",
      color: active ? "var(--paper)" : "var(--ink)",
      borderRadius:4, fontSize:12, cursor:"pointer"
    }}><Icon name={icon} size={13}/> {label}</button>
  );
  return (
    <div style={{display:"flex", gap:8, justifyContent:"center", marginTop:24, paddingTop:24, borderTop:"1px solid var(--hair)"}}>
      <Btn label={saved?"Saved":"Save"} icon="bookmark" onClick={()=>setSaved(!saved)} active={saved}/>
      <Btn label="Share" icon="share"/>
      <Btn label="Copy link" icon="external"/>
      <Btn label="Email" icon="mail"/>
    </div>
  );
}

function ArticlePage({ slug, navigate, articlesRead, incrementRead, user, openAuth }){
  const article = ARTICLES.find(a=>a.slug===slug) || ARTICLES[0];
  const author = authorOf(article.author);
  const hitPaywall = articlesRead > 3 && !user?.pro && !article.sponsored;

  useEffect(()=>{
    if(!article.sponsored) incrementRead(article.id);
    window.scrollTo({top:0});
  }, [article.id]);

  return (
    <article className="container" style={{paddingTop:24, paddingBottom:32}}>
      {/* Breadcrumb */}
      <nav style={{display:"flex", alignItems:"center", gap:8, fontSize:12, marginBottom:18, color:"var(--muted)"}}>
        <a onClick={()=>navigate("/")} style={{cursor:"pointer"}} className="linkish">DTW</a>
        <span>›</span>
        <a onClick={()=>navigate(pillarOf(article.pillar).slug)} style={{cursor:"pointer", color: pillarOf(article.pillar).color, fontWeight:500}} className="linkish">
          {pillarOf(article.pillar).label}
        </a>
        <span>›</span>
        <span>{article.section}</span>
      </nav>

      {/* Title block */}
      <header style={{maxWidth:780, margin:"0 auto 28px"}}>
        <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:14}}>
          <PillarTag id={article.pillar}/>
          <span className="mono text-mute" style={{fontSize:11}}>{article.section}</span>
          {article.deepDive && (
            <span className="mono" style={{fontSize:10, padding:"2px 8px", background:"var(--ink)", color:"var(--paper)", borderRadius:3, fontWeight:600, letterSpacing:".08em"}}>
              DEEP DIVE
            </span>
          )}
          {article.aiAssisted && (
            <span className="mono" style={{fontSize:10, padding:"2px 8px", border:"1px solid var(--hair-2)", borderRadius:3, fontWeight:600, letterSpacing:".08em", color:"var(--muted)"}}>
              AI-ASSISTED
            </span>
          )}
          {article.sponsored && (
            <span className="mono" style={{fontSize:10, padding:"2px 8px", background:"#FEF3C7", color:"#7A5800", borderRadius:3, fontWeight:600, letterSpacing:".08em", border:"1px solid #E0B900"}}>
              PAID PARTNER · {article.sponsor}
            </span>
          )}
        </div>
        <h1 className="serif" style={{
          margin:"0 0 18px", fontSize:54, fontWeight:700,
          letterSpacing:"-0.028em", lineHeight:1.05, textWrap:"balance"
        }}>{article.title}</h1>
        <p className="serif text-mute" style={{margin:"0 0 24px", fontSize:21, lineHeight:1.4, textWrap:"pretty"}}>{article.dek}</p>
        <div style={{display:"flex", alignItems:"center", gap:14, paddingTop:18, borderTop:"1px solid var(--hair)", paddingBottom:18, borderBottom:"1px solid var(--hair)"}}>
          <Avatar name={author.name} size={44}/>
          <div style={{flex:1}}>
            <div style={{fontSize:13, fontWeight:600}}>{author.name}</div>
            <div className="text-mute" style={{fontSize:11}}>{author.role} · {author.city}</div>
          </div>
          <div className="text-mute mono" style={{fontSize:11, textAlign:"right"}}>
            <div>{fmtDate(article.published)}</div>
            <div>{article.readMin} min read</div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div style={{maxWidth:1100, margin:"0 auto 8px"}}>
        <CoverArt pillar={article.pillar} seed={article.id} variant={0} height={520} label={article.image?.label || "HERO"}/>
        <div className="text-mute" style={{fontSize:11, marginTop:8, fontStyle:"italic", padding:"0 4px"}}>
          Cover: editorial composition · srcset 320 / 640 / 1024 / 1920 · AVIF + WebP · LQIP blur
        </div>
      </div>

      <AudioPlayerBar/>

      {/* Body */}
      <div style={{marginTop:32}}>
        <ArticleBody article={article}/>
      </div>

      {!hitPaywall && <ShareBar/>}

      {/* Paywall (only over the body fade) */}
      {hitPaywall && (
        <div style={{marginTop:32}}>
          <Paywall navigate={navigate} onLogin={openAuth}/>
        </div>
      )}

      {/* Affiliate disclosure if applicable */}
      {article.affiliate && (
        <div style={{maxWidth:680, margin:"24px auto", padding:"12px 14px", background:"var(--surface-2)", borderRadius:6, fontSize:12, color:"var(--muted)", display:"flex", gap:8, alignItems:"flex-start"}}>
          <span className="mono" style={{fontSize:11, fontWeight:600, padding:"2px 6px", background:"var(--ink)", color:"var(--paper)", borderRadius:3, flexShrink:0}}>$</span>
          <span>
            <strong style={{color:"var(--ink)"}}>Affiliate disclosure:</strong> Some links in this review earn DTW a commission. Manufacturers do not approve our reviews, and we do not accept review units in exchange for coverage.
          </span>
        </div>
      )}

      <RelatedRow navigate={navigate} currentId={article.id} pillar={article.pillar}/>

      {/* Corrections box */}
      <div style={{maxWidth:680, margin:"40px auto 0", padding:14, background:"var(--surface)", border:"1px solid var(--hair)", borderRadius:6, fontSize:12, color:"var(--muted)"}}>
        <strong style={{color:"var(--ink)"}}>Spot something wrong?</strong> Email <span className="mono">corrections@dtw.news</span>. We log every correction publicly.
      </div>
    </article>
  );
}

Object.assign(window, { ArticlePage });
