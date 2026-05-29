// ============ TECH EFFECTS ============

// Scrolling ticker tape – Bloomberg-style
function TickerTape(){
  const items = [
    { sym:"TSMC",   v:932.0,  d:+1.55 },
    { sym:"9988.HK", v:81.20, d:+2.41 },
    { sym:"005930.KS", v:78900, d:-0.82 },
    { sym:"GOTO.JK", v:73,    d:+3.10 },
    { sym:"SE",     v:88.40,  d:-2.05 },
    { sym:"GRAB",   v:4.18,   d:+0.61 },
    { sym:"3690.HK", v:114.6, d:-1.20 },
    { sym:"PYTM.NS", v:412,   d:+1.81 },
    { sym:"BTC/USD", v:104250, d:+0.74 },
    { sym:"USD/SGD", v:1.314, d:-0.12 },
    { sym:"USD/VND", v:25380, d:+0.05 },
    { sym:"USD/IDR", v:16240, d:+0.22 },
  ];
  // duplicate for seamless loop
  const loop = [...items, ...items];
  return (
    <div style={{
      borderBottom:"1px solid var(--hair)",
      background:"var(--ink)", color:"var(--paper)",
      overflow:"hidden", height:28, position:"relative"
    }}>
      <div className="ticker-track" style={{
        display:"flex", gap:0, alignItems:"center",
        height:"100%", whiteSpace:"nowrap",
        animation:"ticker 60s linear infinite",
        willChange:"transform"
      }}>
        {loop.map((it,i)=>(
          <span key={i} style={{
            display:"inline-flex", alignItems:"center", gap:8,
            padding:"0 18px", borderRight:"1px solid color-mix(in oklab, var(--paper) 12%, transparent)",
            fontFamily:"var(--font-mono)", fontSize:11
          }}>
            <span style={{fontWeight:600, color:"var(--paper)"}}>{it.sym}</span>
            <span style={{color:"color-mix(in oklab, var(--paper) 70%, transparent)"}}>{it.v.toLocaleString(undefined,{maximumFractionDigits:2})}</span>
            <span style={{
              color: it.d>=0 ? "var(--up)" : "var(--down)",
              fontWeight:600
            }}>
              {it.d>=0 ? "▲" : "▼"} {Math.abs(it.d).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .ticker-track:hover{ animation-play-state:paused; }
      `}</style>
    </div>
  );
}

// Cursor-following ambient spotlight
function SpotlightCard({ children, style={}, color="rgba(224,78,31,.18)" }){
  const ref = useRef(null);
  useEffect(()=>{
    const el = ref.current;
    if(!el) return;
    const onMove = (e)=>{
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      el.style.setProperty("--mx", x+"px");
      el.style.setProperty("--my", y+"px");
    };
    el.addEventListener("mousemove", onMove);
    return ()=> el.removeEventListener("mousemove", onMove);
  },[]);
  return (
    <div ref={ref} style={{
      position:"relative", overflow:"hidden",
      "--mx":"50%", "--my":"50%",
      ...style
    }} className="spotlight">
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        background:`radial-gradient(360px circle at var(--mx) var(--my), ${color}, transparent 60%)`,
        opacity:0, transition:"opacity .25s ease"
      }} className="spotlight-glow"/>
      <div style={{position:"relative", zIndex:1}}>{children}</div>
      <style>{`
        .spotlight:hover .spotlight-glow{ opacity:1; }
      `}</style>
    </div>
  );
}

// Count-up animation
function CountUp({ to, suffix="", prefix="", duration=900, decimals=0 }){
  const [v, setV] = useState(0);
  const started = useRef(false);
  const ref = useRef(null);
  useEffect(()=>{
    const start = ()=>{
      if(started.current) return;
      started.current = true;
      const t0 = performance.now();
      const tick = (now)=>{
        const t = Math.min(1, (now-t0)/duration);
        const eased = 1 - Math.pow(1-t, 3);
        setV(to * eased);
        if(t<1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    // Try IntersectionObserver
    let obs;
    try {
      obs = new IntersectionObserver(entries=>{
        if(entries[0].isIntersecting) start();
      },{threshold:.3});
      if(ref.current) obs.observe(ref.current);
    } catch(e){}
    // Fallback 1: if already on screen at mount, start immediately
    requestAnimationFrame(()=>{
      if(!ref.current || started.current) return;
      const r = ref.current.getBoundingClientRect();
      if(r.top < window.innerHeight && r.bottom > 0) start();
    });
    // Fallback 2: hard timeout safety net so values never stay at 0
    const t = setTimeout(start, 800);
    return ()=>{ obs && obs.disconnect(); clearTimeout(t); };
  },[to, duration]);
  const fmt = v.toLocaleString(undefined, {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
  return <span ref={ref} className="tnum">{prefix}{fmt}{suffix}</span>;
}

// Reveal-on-scroll wrapper
function Reveal({ children, delay=0, y=12 }){
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(()=>{
    // Mount-only effect – never re-runs, so cleanup can't accidentally cancel our safety timer.
    let cancelled = false;
    const show = ()=>{
      if(cancelled) return;
      cancelled = true;
      setVisible(true);
    };
    const checkInView = ()=>{
      if(!ref.current) return false;
      const r = ref.current.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    };
    // 1) already on screen at mount? reveal immediately
    if(checkInView()){ show(); return; }
    // 2) IntersectionObserver
    let obs;
    try {
      obs = new IntersectionObserver(entries=>{
        if(entries.some(e=>e.isIntersecting)) show();
      },{threshold:.05});
      obs.observe(ref.current);
    } catch(e){}
    // 3) scroll listener fallback
    const onScroll = ()=>{ if(checkInView()) show(); };
    window.addEventListener("scroll", onScroll, { passive:true });
    // 4) hard safety net – never leave content hidden past 1.5s
    const t = setTimeout(show, 1500);
    return ()=>{
      obs && obs.disconnect();
      window.removeEventListener("scroll", onScroll);
      clearTimeout(t);
      cancelled = true;
    };
  }, []);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : `translateY(${y}px)`,
      transition:`opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms`
    }}>{children}</div>
  );
}

// Animated draw-in sparkline (used in dashboards teaser)
function AnimatedSpark({ values, color="var(--up)", width=420, height=56 }){
  const ref = useRef(null);
  const [len, setLen] = useState(0);
  useEffect(()=>{
    if(!ref.current) return;
    const total = ref.current.getTotalLength?.() || 0;
    setLen(total);
  },[values]);

  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v,i)=>{
    const x = (i/(values.length-1))*width;
    const y = height - ((v-min)/span)*height;
    return [x,y];
  });
  const path = "M " + pts.map(([x,y])=>`${x},${y}`).join(" L ");
  const area = path + ` L ${pts[pts.length-1][0]},${height} L ${pts[0][0]},${height} Z`;
  const last = pts[pts.length-1];

  return (
    <svg width={width} height={height+8} viewBox={`0 0 ${width} ${height+8}`} style={{display:"block"}}>
      <defs>
        <linearGradient id="spk" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".22"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spk)" style={{opacity:.6}}/>
      <path ref={ref} d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"
        style={{
          strokeDasharray: len, strokeDashoffset: len,
          animation: `dashDraw 1.4s ease forwards`
        }}/>
      <circle cx={last[0]} cy={last[1]} r="4" fill={color} style={{animation:"pulse-r 1.6s ease infinite"}}/>
      <style>{`
        @keyframes dashDraw { to { stroke-dashoffset: 0; } }
        @keyframes pulse-r { 0%,100%{opacity:1; r:4} 50%{opacity:.5; r:6} }
      `}</style>
    </svg>
  );
}

// Tech grid backdrop (used behind dashboards + dark sections)
function GridBackdrop({ color="rgba(255,255,255,.05)", size=40, fadeRadius=null }){
  return (
    <div aria-hidden="true" style={{
      position:"absolute", inset:0, pointerEvents:"none",
      backgroundImage: `
        linear-gradient(${color} 1px, transparent 1px),
        linear-gradient(90deg, ${color} 1px, transparent 1px)
      `,
      backgroundSize: `${size}px ${size}px`,
      maskImage: fadeRadius ? `radial-gradient(circle at center, black, transparent ${fadeRadius})` : undefined,
      WebkitMaskImage: fadeRadius ? `radial-gradient(circle at center, black, transparent ${fadeRadius})` : undefined,
    }}/>
  );
}

// Marquee of pillar tags or cities (decorative)
function Marquee({ items, speed=40, style={} }){
  const dup = [...items, ...items];
  return (
    <div style={{overflow:"hidden", ...style}}>
      <div style={{
        display:"flex", gap:32, alignItems:"center",
        animation:`mq ${speed}s linear infinite`,
        willChange:"transform", whiteSpace:"nowrap"
      }}>
        {dup.map((it,i)=>(
          <span key={i} style={{display:"inline-flex", alignItems:"center", gap:8, opacity:.7}}>
            {it}
          </span>
        ))}
      </div>
      <style>{`@keyframes mq{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

Object.assign(window, { TickerTape, SpotlightCard, CountUp, Reveal, AnimatedSpark, GridBackdrop, Marquee });
