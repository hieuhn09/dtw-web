// ============ PILLAR PAGE ============
function PillarPage({ pillarId, navigate, subsection }){
  const pillar = pillarOf(pillarId);
  const t = useT();
  const { lang } = useLang();

  // Real articles for this pillar, padded with deterministic variants so the
  // page has enough material to demonstrate pagination (20 per Load-more step).
  const all = useMemo(()=>{
    // "Latest" is an auto-aggregated feed: every story across all pillars,
    // newest first, no manual curation.
    if(pillarId === "latest"){
      return [...ARTICLES].sort((a,b)=> new Date(b.published) - new Date(a.published));
    }
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
  }, [pillarId]);
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
          <span className="upper" style={{fontSize:12, fontWeight:650, letterSpacing:".18em", color:pillar.color}}>
            DTW · {pillar.label}
          </span>
        </div>
        <h1 className="serif" style={{margin:"0 0 12px", fontSize:64, fontWeight:650, letterSpacing:"-0.03em", lineHeight:1, color:"var(--ink)"}}>
          {pillarHeading(pillarId, lang)}
        </h1>
        <p className="serif text-mute" style={{margin:0, fontSize:19, lineHeight:1.45, maxWidth:760}}>
          {pillarDescription(pillarId, lang)}
        </p>
        <div style={{display:"flex", gap:8, alignItems:"center", marginTop:20}}>
          <Button variant="outline" size="sm">{t("Follow", "Theo dõi", "Ikuti")} {localizedPillarLabel(pillarId, lang)}</Button>
          <Button variant="ghost" size="sm">{t("RSS feed", "Nguồn RSS", "Umpan RSS")}</Button>
          <span className="text-mute-2 mono" style={{fontSize:11, marginLeft:8}}>
            {all.length} {t("stories · 6 reporters · updated 12 min ago", "bài · 6 phóng viên · cập nhật 12 phút trước", "artikel · 6 reporter · diperbarui 12 menit lalu")}
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
          }}>{s==="All" ? t("All", "Tất cả", "Semua") : s}</button>
        ))}
        <div style={{flex:1}}/>
        <div style={{display:"flex", alignItems:"center", gap:8, paddingRight:8}}>
          <span className="text-mute-2 mono" style={{fontSize:11}}>{t("Sort:", "Sắp xếp:", "Urutkan:")}</span>
          <select style={{background:"transparent", border:"1px solid var(--hair-2)", padding:"4px 8px", borderRadius:4, fontSize:12, color:"var(--ink)", fontFamily:"var(--font-sans)"}}>
            <option>{t("Latest", "Mới nhất", "Terbaru")}</option>
            <option>{t("Most read", "Đọc nhiều nhất", "Terpopuler")}</option>
            <option>{t("Editor's picks", "Biên tập chọn", "Pilihan editor")}</option>
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
            {t("Featured", "Nổi bật", "Unggulan")} · {featured.section}
          </div>
          <h2 className="serif" style={{margin:"0 0 14px", fontSize:42, fontWeight:650, letterSpacing:"-0.025em", lineHeight:1.05, textWrap:"balance"}}>
            {featured.title}
          </h2>
          <p className="serif text-mute" style={{margin:"0 0 18px", fontSize:17, lineHeight:1.5}}>{featured.dek}</p>
          <ByLine article={featured} size="lg"/>
        </div>
      </article>

      {/* Grid */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:32}}>
        {paged.map((a, i)=>(
          <article key={a.id} onClick={()=>navigate(`/article/${a.slug}`)} style={{cursor:"pointer"}}>
            <CoverArt pillar={a.pillar} seed={a.id} variant={(i+2)%6} height={210} style={{marginBottom:14}}/>
            <PillarTag id={a.pillar}/>
            <h3 className="serif" style={{margin:"8px 0 8px", fontSize:21, fontWeight:600, lineHeight:1.25, letterSpacing:"-0.01em", textWrap:"balance"}}>
              {a.title}
            </h3>
            <p className="text-mute serif" style={{margin:"0 0 10px", fontSize:14, lineHeight:1.45}}>{a.dek?.slice(0, 140)}…</p>
            <div className="text-mute" style={{fontSize:12}}>{authorOf(a.author).name} · {fmtTimeAgo(a.published)} · {a.readMin}m</div>
          </article>
        ))}
      </div>

      {hasMore && (
        <div style={{textAlign:"center", marginTop:48}}>
          <Button variant="outline" size="lg" onClick={()=>setShown(s => s + 21)}
            style={{padding:"18px 36px", fontSize:15, letterSpacing:".02em"}}>
            {t("Load more", "Xem thêm", "Muat lebih banyak")}
          </Button>
        </div>
      )}

      {!hasMore && visible.length > 21 && (
        <div style={{textAlign:"center", marginTop:48, color:"var(--muted)", fontSize:13}}>
          {t(`End of feed, ${visible.length} stories shown.`, `Hết tin, đã hiển thị ${visible.length} bài.`, `Akhir umpan, ${visible.length} artikel ditampilkan.`)}
        </div>
      )}

      {visible.length === 0 && (
        <div style={{textAlign:"center", padding:"60px 0", color:"var(--muted)", fontSize:14}}>
          {t('Nothing in this subsection yet. Try "All".', 'Chưa có gì trong mục này. Thử "Tất cả".', 'Belum ada di subbagian ini. Coba "Semua".')}
        </div>
      )}
    </div>
  );
}

function pillarHeading(id, lang){
  const en = {
    ai: "Artificial Intelligence", startups: "Startups & Capital", latest: "Latest",
    dev: "Developers", products: "Products & Reviews", policy: "Policy & Regulation",
  };
  const vi = {
    ai: "Trí tuệ nhân tạo", startups: "Khởi nghiệp & Vốn", latest: "Mới nhất",
    dev: "Lập trình viên", products: "Sản phẩm & Đánh giá", policy: "Chính sách & Quản lý",
  };
  const id_ = {
    ai: "Kecerdasan Buatan", startups: "Startup & Modal", latest: "Terbaru",
    dev: "Pengembang", products: "Produk & Ulasan", policy: "Kebijakan & Regulasi",
  };
  const map = lang==="vi" ? vi : lang==="id" ? id_ : en;
  return map[id] || en[id] || "Pillar";
}
function pillarDescription(id, lang){
  const en = {
    ai: "Frontier models, infrastructure, and the policy that shapes them. Reported across Seoul, Singapore, Bengaluru, and Hangzhou.",
    startups: "Term sheets, IPOs, layoffs, and the operators building the next wave across ASEAN, India, and Greater China.",
    latest: "Every story as it publishes, newest first, across AI, startups, developers, products, and policy.",
    dev: "Engineering practice. Tools, frameworks, and the trade-offs teams are actually making in production.",
    products: "Independent reviews of phones, laptops, audio, and wearables. Affiliate-disclosed. Manufacturers do not approve our copy.",
    policy: "Trade rules, export controls, central-bank decisions, and the regulators who write them, covered as the technology beat they have become.",
  };
  const vi = {
    ai: "Các mô hình tiên phong, hạ tầng và chính sách định hình chúng. Đưa tin từ Seoul, Singapore, Bengaluru và Hàng Châu.",
    startups: "Điều khoản gọi vốn, IPO, sa thải, và những người đang xây làn sóng tiếp theo khắp ASEAN, Ấn Độ và Trung Quốc.",
    latest: "Mọi bài viết ngay khi đăng, mới nhất trước, trải khắp AI, khởi nghiệp, lập trình, sản phẩm và chính sách.",
    dev: "Thực hành kỹ thuật. Công cụ, framework và những đánh đổi mà các nhóm thực sự đang đối mặt trong sản xuất.",
    products: "Đánh giá độc lập điện thoại, laptop, âm thanh và thiết bị đeo. Có công bố affiliate. Nhà sản xuất không duyệt bài của chúng tôi.",
    policy: "Quy tắc thương mại, kiểm soát xuất khẩu, quyết định của ngân hàng trung ương, và các nhà quản lý, đưa tin như một mảng công nghệ thực thụ.",
  };
  const id_ = {
    ai: "Model frontier, infrastruktur, dan kebijakan yang membentuknya. Diliput dari Seoul, Singapura, Bengaluru, dan Hangzhou.",
    startups: "Term sheet, IPO, PHK, dan para operator yang membangun gelombang berikutnya di ASEAN, India, dan Tiongkok.",
    latest: "Setiap artikel begitu terbit, terbaru dulu, lintas AI, startup, pengembang, produk, dan kebijakan.",
    dev: "Praktik rekayasa. Alat, framework, dan trade-off yang benar-benar dihadapi tim di produksi.",
    products: "Ulasan independen ponsel, laptop, audio, dan wearable. Diungkap afiliasi. Produsen tidak menyetujui tulisan kami.",
    policy: "Aturan dagang, kontrol ekspor, keputusan bank sentral, dan regulator yang menulisnya, diliput sebagai beat teknologi.",
  };
  const map = lang==="vi" ? vi : lang==="id" ? id_ : en;
  return map[id] || en[id] || "";
}

Object.assign(window, { PillarPage });
