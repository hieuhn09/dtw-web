// ============ TRUST PAGES ============
function TrustPage({ navigate, slug }){
  const t = useT();
  const pages = {
    editorial: {
      title: t("Editorial Standards", "Tiêu chuẩn biên tập", "Standar Editorial"),
      kicker: t("Last updated · 12 May 2026", "Cập nhật lần cuối · 12/05/2026", "Diperbarui · 12 Mei 2026"),
      body: [
        [t("How we report", "Cách chúng tôi đưa tin", "Cara kami meliput"), t("We follow people, money, and policy across tech, in Asia and worldwide. Every story names sources where possible, links to primary documents, and discloses how the reporter knows what they know.", "Chúng tôi theo dõi con người, dòng tiền và chính sách trong công nghệ, ở châu Á và toàn cầu. Mỗi bài nêu nguồn khi có thể, dẫn tài liệu gốc, và công bố cách phóng viên biết điều họ viết.", "Kami mengikuti orang, uang, dan kebijakan di teknologi, di Asia dan dunia. Setiap artikel menyebut sumber bila memungkinkan, menautkan dokumen utama, dan mengungkap dari mana reporter tahu.")],
        [t("Independence", "Tính độc lập", "Independensi"), t("DTW does not accept review units, free travel, or paid trips. Our editorial budget is separate from DTW Studio (sponsored work) and from membership revenue.", "DTW không nhận sản phẩm dùng thử, chuyến đi miễn phí hay tài trợ đi lại. Ngân sách biên tập tách biệt với DTW Studio (bài tài trợ) và doanh thu thành viên.", "DTW tidak menerima unit ulasan, perjalanan gratis, atau trip berbayar. Anggaran editorial terpisah dari DTW Studio (konten bersponsor) dan pendapatan keanggotaan.")],
        [t("Anonymous sources", "Nguồn ẩn danh", "Sumber anonim"), t("We use them when necessary, never when convenient. Anonymity requires at least one editor's sign-off and a clear public-interest rationale.", "Chúng tôi dùng khi cần thiết, không bao giờ vì tiện lợi. Ẩn danh cần ít nhất một biên tập viên duyệt và lý do vì lợi ích công chúng rõ ràng.", "Kami memakainya bila perlu, bukan demi kemudahan. Anonimitas butuh persetujuan minimal satu editor dan alasan kepentingan publik yang jelas.")],
        [t("Corrections", "Đính chính", "Koreksi"), t("We log every correction publicly with date, original text, and corrected text.", "Chúng tôi ghi lại mọi đính chính công khai kèm ngày, văn bản gốc và văn bản đã sửa.", "Kami mencatat setiap koreksi secara publik dengan tanggal, teks asli, dan teks yang dikoreksi.")],
        [t("Conflicts", "Xung đột lợi ích", "Konflik kepentingan"), t("Reporters disclose holdings and prior employers on their bio page. We do not cover companies where a reporter has a direct financial interest without a second byline.", "Phóng viên công bố cổ phần và nơi làm cũ trên trang tiểu sử. Chúng tôi không đưa tin về công ty mà phóng viên có lợi ích tài chính trực tiếp nếu không có đồng tác giả.", "Reporter mengungkap kepemilikan dan mantan pemberi kerja di halaman bio. Kami tidak meliput perusahaan di mana reporter punya kepentingan finansial langsung tanpa penulis kedua.")],
      ]
    },
    ai: {
      title: t("AI Disclosure", "Công bố AI", "Pengungkapan AI"),
      kicker: t("What 'AI-assisted' means in our newsroom", "'Có hỗ trợ AI' nghĩa là gì trong toà soạn", "Arti 'dibantu AI' di ruang redaksi kami"),
      body: [
        [t("Use cases we allow", "Trường hợp được phép", "Penggunaan yang kami izinkan"), t("Translation, transcription, summarisation of public documents, search-style retrieval, and proof-reading. Always reviewed by a human reporter before publication.", "Dịch, gỡ băng, tóm tắt tài liệu công khai, tìm kiếm và soát lỗi. Luôn được phóng viên là người thật kiểm tra trước khi đăng.", "Terjemahan, transkripsi, ringkasan dokumen publik, pencarian, dan proofreading. Selalu ditinjau reporter manusia sebelum terbit.")],
        [t("Use cases we don't", "Trường hợp không dùng", "Yang tidak kami lakukan"), t("Generative writing of body copy, generative image creation, fabricated quotes, or unsourced claims pulled from a model.", "Tạo sinh nội dung bài, tạo sinh hình ảnh, trích dẫn bịa đặt hay tuyên bố không nguồn lấy từ mô hình.", "Penulisan generatif badan artikel, pembuatan gambar generatif, kutipan fiktif, atau klaim tanpa sumber dari model.")],
        [t("Labels", "Nhãn", "Label"), t("Articles that use AI for any allowed task carry an 'AI-assisted' label at the top, middle, and bottom. The label cannot be turned off.", "Bài dùng AI cho bất kỳ tác vụ được phép nào đều mang nhãn 'Có hỗ trợ AI' ở đầu, giữa và cuối. Không thể tắt nhãn này.", "Artikel yang memakai AI untuk tugas yang diizinkan membawa label 'dibantu AI' di atas, tengah, dan bawah. Label tidak bisa dimatikan.")],
        [t("Models", "Mô hình", "Model"), t("We use commercial APIs from major providers, plus an internal translation pipeline. No reader data trains any third-party model.", "Chúng tôi dùng API thương mại từ các nhà cung cấp lớn cùng quy trình dịch nội bộ. Không dữ liệu độc giả nào huấn luyện mô hình bên thứ ba.", "Kami memakai API komersial dari penyedia besar, plus pipeline terjemahan internal. Tidak ada data pembaca yang melatih model pihak ketiga.")],
        [t("Human accountability", "Trách nhiệm của con người", "Akuntabilitas manusia"), t("Every byline is a human. Every fact is human-verified. If something is wrong, a human is responsible.", "Mỗi tên tác giả là một con người. Mọi dữ kiện đều do người kiểm chứng. Nếu có sai sót, một con người chịu trách nhiệm.", "Setiap byline adalah manusia. Setiap fakta diverifikasi manusia. Jika ada yang salah, manusia bertanggung jawab.")],
      ]
    },
    corrections: {
      title: t("Corrections", "Đính chính", "Koreksi"),
      kicker: t("Public log · most recent first", "Nhật ký công khai · mới nhất trước", "Log publik · terbaru dulu"),
      body: null
    },
    sponsored: {
      title: t("Sponsored & Affiliate Policy", "Chính sách tài trợ & affiliate", "Kebijakan Sponsor & Afiliasi"),
      kicker: t("DTW Studio and review rules", "Quy tắc DTW Studio và đánh giá", "Aturan DTW Studio dan ulasan"),
      body: [
        [t("DTW Studio", "DTW Studio", "DTW Studio"), t("Sponsored content is produced by a separate studio team. Articles carry a yellow background, a 'Paid Partner' label, and a top/middle/end disclosure that cannot be turned off.", "Nội dung tài trợ do nhóm studio riêng sản xuất. Bài có nền vàng, nhãn 'Đối tác trả phí', và công bố ở đầu/giữa/cuối không thể tắt.", "Konten bersponsor diproduksi tim studio terpisah. Artikel berlatar kuning, berlabel 'Mitra Berbayar', dan pengungkapan atas/tengah/akhir yang tak bisa dimatikan.")],
        [t("What sponsors can do", "Nhà tài trợ được làm gì", "Yang boleh dilakukan sponsor"), t("Choose a topic and review for factual accuracy of their own product. Approve images of their facilities.", "Chọn chủ đề và rà soát độ chính xác về sản phẩm của họ. Duyệt hình ảnh cơ sở của họ.", "Memilih topik dan memeriksa akurasi fakta produk mereka sendiri. Menyetujui gambar fasilitas mereka.")],
        [t("What sponsors cannot do", "Nhà tài trợ không được làm gì", "Yang tidak boleh dilakukan sponsor"), t("Approve or edit copy that names competitors. Choose pull-quotes. Mandate calls-to-action. Run beside any newsroom story.", "Duyệt hay sửa nội dung nhắc đối thủ. Chọn trích dẫn nổi bật. Bắt buộc kêu gọi hành động. Đặt cạnh bài của toà soạn.", "Menyetujui atau menyunting teks yang menyebut pesaing. Memilih kutipan. Mewajibkan ajakan bertindak. Tampil di samping artikel redaksi.")],
        [t("Affiliate links", "Liên kết affiliate", "Tautan afiliasi"), t("Some product reviews carry affiliate links. They are marked with a $ icon and a tooltip on hover. Commission rates and partners are listed in our transparency report.", "Một số bài đánh giá có liên kết affiliate, được đánh dấu bằng biểu tượng $ và chú thích khi rê chuột. Tỷ lệ hoa hồng và đối tác có trong báo cáo minh bạch.", "Beberapa ulasan produk memuat tautan afiliasi, ditandai ikon $ dan tooltip saat hover. Tarif komisi dan mitra ada di laporan transparansi.")],
        [t("Refusals", "Từ chối", "Penolakan"), t("We have declined paid placements from 4 partners in the last 12 months over disclosure disagreements.", "Chúng tôi đã từ chối vị trí trả phí từ 4 đối tác trong 12 tháng qua do bất đồng về công bố.", "Kami menolak penempatan berbayar dari 4 mitra dalam 12 bulan terakhir karena ketidaksepakatan pengungkapan.")],
      ]
    },
  };

  const page = pages[slug] || pages.editorial;

  return (
    <div className="container" style={{paddingTop:24, paddingBottom:48}}>
      <div style={{display:"grid", gridTemplateColumns:"220px 1fr", gap:48}}>
        <nav style={{position:"sticky", top:160, alignSelf:"flex-start"}}>
          <div className="upper text-mute" style={{fontSize:10, fontWeight:600, letterSpacing:".14em", marginBottom:12}}>
            {t("Trust & Transparency", "Tin cậy & Minh bạch", "Kepercayaan & Transparansi")}
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
          <h1 className="serif" style={{margin:"0 0 28px", fontSize:48, fontWeight:650, letterSpacing:"-0.025em", lineHeight:1.05}}>
            {page.title}
          </h1>

          {slug === "corrections" ? <CorrectionsLog/> : (
            <div style={{fontFamily:"var(--font-serif)"}}>
              {page.body.map(([h, t])=>(
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
  const t = useT();
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
      {items.map((c, i)=>(
        <div key={i} style={{padding:"18px 0", borderBottom:"1px solid var(--hair)"}}>
          <div className="mono text-mute" style={{fontSize:11, marginBottom:6}}>{c.d}</div>
          <div className="serif" style={{fontSize:17, fontWeight:600, marginBottom:8, color:"var(--ink)"}}>{c.art}</div>
          <div style={{display:"grid", gridTemplateColumns:"60px 1fr", gap:10, marginBottom:6, fontSize:14}}>
            <span className="mono" style={{color:"var(--down)", fontWeight:600}}>{t("was:", "trước:", "dulu:")}</span>
            <span style={{textDecoration:"line-through", color:"var(--muted)"}}>{c.was}</span>
          </div>
          <div style={{display:"grid", gridTemplateColumns:"60px 1fr", gap:10, fontSize:14}}>
            <span className="mono" style={{color:"var(--up)", fontWeight:600}}>{t("now:", "nay:", "kini:")}</span>
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
      <h1 className="serif" style={{margin:"0 0 18px", fontSize:48, fontWeight:650, letterSpacing:"-0.025em", lineHeight:1.05}}>{title}</h1>
      <p className="serif text-mute" style={{margin:"0 0 24px", fontSize:19, lineHeight:1.45}}>{body}</p>
      <div style={{padding:24, background:"var(--surface-2)", borderRadius:8, fontSize:13, color:"var(--muted)"}}>
        This page is wired through the CMS, editors update content without a deploy.
      </div>
    </div>
  );
}

Object.assign(window, { TrustPage, StaticPage });
