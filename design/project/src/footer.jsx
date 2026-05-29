function Footer({ navigate }) {
  const t = useT();
  const cols = [
  { title: t("DTW", "DTW", "DTW"), links: [
    [t("About", "Giới thiệu", "Tentang"), "/about"],
    [t("Newsroom", "Toà soạn", "Redaksi"), "/about/newsroom"],
    [t("Careers", "Tuyển dụng", "Karier"), "/careers"],
    [t("Contact", "Liên hệ", "Kontak"), "/contact"],
    [t("Press inquiries", "Hỏi báo chí", "Pertanyaan pers"), "/press"]]
  },
  { title: t("Editorial", "Biên tập", "Editorial"), links: [
    [t("Editorial Standards", "Tiêu chuẩn biên tập", "Standar Editorial"), "/trust/editorial"],
    [t("AI Disclosure", "Công bố AI", "Pengungkapan AI"), "/trust/ai"],
    [t("Corrections", "Đính chính", "Koreksi"), "/trust/corrections"],
    [t("Transparency Report", "Báo cáo minh bạch", "Laporan Transparansi"), "/trust/transparency"],
    [t("Sponsored & Affiliate Policy", "Chính sách tài trợ & affiliate", "Kebijakan Sponsor & Afiliasi"), "/trust/sponsored"]]
  },
  { title: t("Business", "Doanh nghiệp", "Bisnis"), links: [
    [t("Advertise", "Quảng cáo", "Iklan"), "/advertise"],
    [t("DTW Studio", "DTW Studio", "DTW Studio"), "/studio"],
    [t("Awards", "Giải thưởng", "Penghargaan"), "/awards"],
    [t("Newsletters", "Bản tin", "Newsletter"), "/newsletters"]]
  },
  { title: t("Legal", "Pháp lý", "Legal"), links: [
    [t("Privacy", "Quyền riêng tư", "Privasi"), "/legal/privacy"],
    [t("Terms", "Điều khoản", "Ketentuan"), "/legal/terms"],
    [t("Cookies", "Cookies", "Cookies"), "/legal/cookies"],
    [t("GDPR / PDPA", "GDPR / PDPA", "GDPR / PDPA"), "/legal/gdpr"]]
  }];


  return (
    <footer style={{ background: "var(--surface)", borderTop: "3px solid var(--ink)", marginTop: 80, margin: "60px 0px 0px" }}>
      {/* Newsletter strip */}
      <div style={{ borderBottom: "1px solid var(--hair)" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", padding: "40px 24px" }}>
          <div>
            <div className="kicker" style={{ marginBottom: 8 }}>
              {t("Get the AM Brief", "Nhận bản tin buổi sáng", "Dapatkan AM Brief")}
            </div>
            <h3 className="serif" style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 600, letterSpacing: "-0.01em" }}>
              {t(
                "The 5-minute briefing on Asia's tech morning.",
                "Bản tin 5 phút về công nghệ châu Á mỗi sáng.",
                "Ringkasan 5 menit teknologi Asia setiap pagi."
              )}
            </h3>
            <p className="text-mute" style={{ margin: 0, fontSize: 13 }}>
              {t(
                "48,200 founders, operators, and policy people read it before 09:00. Double opt-in. No tracking pixels. Unsubscribe with one click.",
                "48.200 nhà sáng lập, quản lý và người làm chính sách đọc trước 09:00. Xác nhận kép. Không pixel theo dõi. Hủy đăng ký chỉ một cú nhấp.",
                "48.200 founder, operator, dan pembuat kebijakan membacanya sebelum pukul 09.00. Konfirmasi ganda. Tanpa piksel pelacak. Berhenti berlangganan dengan satu klik."
              )}
            </p>
          </div>
          <form onSubmit={(e) => {e.preventDefault();alert("Confirmation email sent (demo)");}}
          style={{ display: "flex", gap: 8 }}>
            <input type="email" required placeholder={t("you@company.com", "ban@congty.com", "anda@perusahaan.com")} style={{
              flex: 1, padding: "12px 14px", border: "1px solid var(--hair-2)",
              borderRadius: 5, fontSize: 13, background: "var(--paper)", color: "var(--ink)",
              fontFamily: "var(--font-sans)"
            }} />
            <Button variant="accent" size="lg" type="submit">{t("Subscribe", "Đăng ký", "Berlangganan")}</Button>
          </form>
        </div>
      </div>

      {/* Cols */}
      <div className="container" style={{ padding: "48px 24px", display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr", gap: 32 }}>
        <div>
          <div className="serif" style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
            <Wordmark size={26} />
          </div>
          <div className="mono text-mute" style={{ fontSize: 11, letterSpacing: ".08em", marginTop: 6, lineHeight: "1.5" }}>
            Tech Intelligence, Wired Daily
          </div>
          <p className="text-mute" style={{ fontSize: 12, lineHeight: 1.55, marginTop: 14, maxWidth: 280 }}>
            {t(
              "An independent newsroom covering Asia's technology economy, published from Singapore.",
              "Một toà soạn độc lập đưa tin về nền kinh tế công nghệ châu Á, xuất bản từ Singapore.",
              "Ruang redaksi independen yang meliput ekonomi teknologi Asia, terbit dari Singapura."
            )}
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            {[
            ["X", "external"], ["LinkedIn", "external"], ["Instagram", "external"], ["Threads", "mail"], ["RSS", "rss"]].
            map(([k, ic]) =>
            <a key={k} title={k} style={{
              width: 32, height: 32, border: "1px solid var(--hair-2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 4, cursor: "pointer", color: "var(--ink)"
            }}><Icon name={ic} size={13} /></a>
            )}
          </div>
        </div>
        {cols.map((c) =>
        <div key={c.title}>
            <div className="upper" style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".12em", marginBottom: 14, color: "var(--ink)" }}>{c.title}</div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 9 }}>
              {c.links.map(([l, p]) =>
            <li key={l}><a onClick={() => navigate(p)} className="linkish" style={{ fontSize: 12, color: "var(--ink-2)", cursor: "pointer" }}>{l}</a></li>
            )}
            </ul>
          </div>
        )}
      </div>

      {/* Trust band */}
      <div style={{ borderTop: "1px solid var(--hair)", background: "var(--paper)" }}>
        <div className="container" style={{ padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div className="mono text-mute" style={{ fontSize: 11 }}>
            © 2026 DailyTechWire Pte. Ltd. · Singapore (UEN 202612345A) · Member, Trust Project · ISSN 2811-7XXX
          </div>
          <div style={{ display: "flex", gap: 14, fontSize: 11 }}>
            <span className="text-mute">Compliant with GDPR · PDPA (SG) · Nghị định 13 (VN)</span>
          </div>
        </div>
      </div>
    </footer>);

}

Object.assign(window, { Footer });