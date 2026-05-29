// ============ TRUST PAGES ============
function TrustPage({ navigate, slug }){
  const pages = {
    editorial: {
      title: "Editorial Standards",
      kicker: "Last updated · 12 May 2026",
      body: [
        ["How we report", "We follow people, money, and policy across Asia tech. Every story names sources where possible, links to primary documents, and discloses how the reporter knows what they know."],
        ["Independence", "DTW does not accept review units, free travel, or paid trips. Our editorial budget is separate from DTW Studio (sponsored work) and from Pro membership revenue."],
        ["Anonymous sources", "We use them when necessary, never when convenient. Anonymity requires at least one editor's sign-off and a clear public-interest rationale."],
        ["Corrections", "We log every correction publicly with date, original text, and corrected text. See /trust/corrections."],
        ["Conflicts", "Reporters disclose holdings and prior employers on their bio page. We do not cover companies where a reporter has a direct financial interest without a second byline."],
      ]
    },
    ai: {
      title: "AI Disclosure",
      kicker: "What 'AI-assisted' means in our newsroom",
      body: [
        ["Use cases we allow", "Translation, transcription, summarisation of public documents, search-style retrieval, and proof-reading. Always reviewed by a human reporter before publication."],
        ["Use cases we don't", "Generative writing of body copy, generative image creation, fabricated quotes, or unsourced claims pulled from a model."],
        ["Labels", "Articles that use AI for any allowed task carry an 'AI-assisted' label at the top, middle, and bottom of the article. The label cannot be turned off."],
        ["Models", "We use commercial APIs from major providers, plus an internal translation pipeline. No reader data trains any third-party model."],
        ["Human accountability", "Every byline is a human. Every fact is human-verified. If something is wrong, a human is responsible."],
      ]
    },
    corrections: {
      title: "Corrections",
      kicker: "Public log · most recent first",
      body: null
    },
    transparency: {
      title: "Transparency Report",
      kicker: "Q1 2026",
      body: [
        ["Headcount", "27 reporters, 6 editors, 4 data desk, 2 product, 1 ombudsperson."],
        ["Revenue mix", "62% Pro membership, 22% Newsletters & events, 12% DTW Studio (sponsored), 4% Affiliate."],
        ["Removed posts", "0 stories pulled. 14 corrections issued. 1 unpublished sponsored story (failed disclosure check)."],
        ["Government requests", "Singapore: 0. India: 1 (data request, fulfilled in part). Vietnam: 0."],
        ["Newsletter deliverability", "98.7% inbox placement (Gmail), 96.1% (Outlook), measured by third party."],
      ]
    },
    sponsored: {
      title: "Sponsored & Affiliate Policy",
      kicker: "DTW Studio and review rules",
      body: [
        ["DTW Studio", "Sponsored content is produced by a separate studio team. Writers, editors, and the EIC of DTW Studio do not work on the newsroom. Articles carry a yellow background, a 'Paid Partner' label, and a top/middle/end disclosure that cannot be turned off."],
        ["What sponsors can do", "Choose a topic and review for factual accuracy of their own product. Approve images of their facilities."],
        ["What sponsors cannot do", "Approve or edit copy that names competitors. Choose pull-quotes. Mandate calls-to-action. Run beside any newsroom story."],
        ["Affiliate links", "Some product reviews carry affiliate links. They are marked with a $ icon and a tooltip on hover. Commission rates and partners are listed in our Q4 transparency report."],
        ["Refusals", "We have declined paid placements from 4 partners in the last 12 months over disclosure disagreements."],
      ]
    },
  };

  const page = pages[slug] || pages.editorial;

  return (
    <div className="container" style={{paddingTop:24, paddingBottom:48}}>
      <div style={{display:"grid", gridTemplateColumns:"220px 1fr", gap:48}}>
        <nav style={{position:"sticky", top:160, alignSelf:"flex-start"}}>
          <div className="upper text-mute" style={{fontSize:10, fontWeight:600, letterSpacing:".14em", marginBottom:12}}>
            Trust & Transparency
          </div>
          {Object.keys(pages).map(k=>(
            <button key={k} onClick={()=>navigate(`/trust/${k}`)} style={{
              display:"block", width:"100%", textAlign:"left",
              padding:"8px 10px", background: slug===k?"var(--surface-2)":"transparent",
              border:"none", borderRadius:4, fontSize:13, cursor:"pointer",
              color: slug===k?"var(--ink)":"var(--muted)", fontWeight: slug===k?600:400,
              borderLeft: slug===k?"2px solid var(--accent)":"2px solid transparent"
            }}>{pages[k].title}</button>
          ))}
        </nav>

        <article style={{maxWidth:720}}>
          <div className="kicker" style={{marginBottom:8}}>{page.kicker}</div>
          <h1 className="serif" style={{margin:"0 0 28px", fontSize:48, fontWeight:700, letterSpacing:"-0.025em", lineHeight:1.05}}>
            {page.title}
          </h1>

          {slug === "corrections" ? <CorrectionsLog/> : (
            <div style={{fontFamily:"var(--font-serif)"}}>
              {page.body.map(([h,t])=>(
                <section key={h} style={{marginBottom:32}}>
                  <h2 style={{margin:"0 0 8px", fontSize:22, fontWeight:600, letterSpacing:"-0.01em", color:"var(--ink)"}}>{h}</h2>
                  <p style={{margin:0, fontSize:17, lineHeight:1.6, color:"var(--ink-2)"}}>{t}</p>
                </section>
              ))}
            </div>
          )}
        </article>
      </div>
    </div>
  );
}

function CorrectionsLog(){
  const items = [
    { d:"22 May 2026", art:"VNG cloud arm files for a Singapore listing…",
      was:"…revenue grew 41% YoY",
      now:"…revenue grew 31% YoY (per draft prospectus, page 14)" },
    { d:"18 May 2026", art:"Taipei's new chip export schedule…",
      was:"…effective July 1",
      now:"…effective August 15" },
    { d:"05 May 2026", art:"How an ASEAN insurer rebuilt…",
      was:"…in 18 months",
      now:"…in 18 weeks (sponsor confirmed)" },
    { d:"29 Apr 2026", art:"Server Actions in production…",
      was:"three regrets, two quiet successes",
      now:"three regrets, one quiet success" },
  ];
  return (
    <div>
      {items.map((c,i)=>(
        <div key={i} style={{padding:"18px 0", borderBottom:"1px solid var(--hair)"}}>
          <div className="mono text-mute" style={{fontSize:11, marginBottom:6}}>{c.d}</div>
          <div className="serif" style={{fontSize:17, fontWeight:600, marginBottom:8, color:"var(--ink)"}}>{c.art}</div>
          <div style={{display:"grid", gridTemplateColumns:"60px 1fr", gap:10, marginBottom:6, fontSize:14}}>
            <span className="mono" style={{color:"var(--down)", fontWeight:600}}>was:</span>
            <span style={{textDecoration:"line-through", color:"var(--muted)"}}>{c.was}</span>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"60px 1fr", gap:10, fontSize:14}}>
            <span className="mono" style={{color:"var(--up)", fontWeight:600}}>now:</span>
            <span style={{color:"var(--ink)"}}>{c.now}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Simple stub for other static-ish pages: /pro, /awards, /studio, etc
function StaticPage({ title, kicker, body }){
  return (
    <div className="container" style={{paddingTop:32, paddingBottom:64, maxWidth:800}}>
      <div className="kicker" style={{marginBottom:8}}>{kicker}</div>
      <h1 className="serif" style={{margin:"0 0 18px", fontSize:48, fontWeight:700, letterSpacing:"-0.025em", lineHeight:1.05}}>{title}</h1>
      <p className="serif text-mute" style={{margin:"0 0 24px", fontSize:19, lineHeight:1.45}}>{body}</p>
      <div style={{padding:24, background:"var(--surface-2)", borderRadius:8, fontSize:13, color:"var(--muted)"}}>
        This page is wired through the CMS – editors update content without a deploy.
      </div>
    </div>
  );
}

Object.assign(window, { TrustPage, StaticPage });
