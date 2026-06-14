// ============ CONTACT PAGE ============
function ContactPage({ navigate, mode }) {
  const t = useT();
  const press = mode === "press";

  const channels = [
  {
    icon: "mail",
    label: t("General & editorial", "Chung & biên tập", "Umum & editorial"),
    email: "info@dailytechwire.com",
    desc: t(
      "Questions about a story, a correction, your account, or anything that doesn't fit elsewhere. A person replies, usually within a business day.",
      "Câu hỏi về một bài viết, đính chính, tài khoản, hay bất cứ điều gì không thuộc mục khác. Một con người sẽ trả lời, thường trong một ngày làm việc.",
      "Pertanyaan tentang artikel, koreksi, akun, atau apa pun yang tak masuk kategori lain. Seseorang akan membalas, biasanya dalam satu hari kerja."
    )
  },
  {
    icon: "feather",
    label: t("Press & media", "Báo chí & truyền thông", "Pers & media"),
    email: "media@dailytechwire.com",
    desc: t(
      "Interview requests, press credentials, story tips, and confidential sources. We protect our sources and read every tip carefully.",
      "Yêu cầu phỏng vấn, thẻ báo chí, mật báo và nguồn tin bảo mật. Chúng tôi bảo vệ nguồn tin và đọc kỹ từng mật báo.",
      "Permintaan wawancara, kredensial pers, tip berita, dan sumber rahasia. Kami melindungi sumber dan membaca tiap tip dengan saksama."
    )
  },
  {
    icon: "trend-up",
    label: t("Partnerships & business", "Hợp tác & kinh doanh", "Kemitraan & bisnis"),
    email: "partnership@dailytechwire.com",
    desc: t(
      "Advertising, content licensing, events, syndication, and investor relations. Tell us what you have in mind and we'll route it to the right team.",
      "Quảng cáo, cấp phép nội dung, sự kiện, đăng lại, và quan hệ nhà đầu tư. Hãy cho chúng tôi biết ý định của bạn và chúng tôi sẽ chuyển tới đúng bộ phận.",
      "Iklan, lisensi konten, acara, sindikasi, dan hubungan investor. Beri tahu kami rencana Anda dan kami arahkan ke tim yang tepat."
    )
  }];


  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 72, maxWidth: 920 }}>
      {press ?
      <PressInquiries navigate={navigate} t={t} /> :

      <>
      <header style={{ textAlign: "center", padding: "24px 0px 0px" }}>
        <div className="kicker" style={{ marginBottom: 10 }}>
          {t("Contact", "Liên hệ", "Kontak")}
        </div>
        <h1 className="serif" style={{ fontSize: 54, fontWeight: 650, letterSpacing: "-0.03em", lineHeight: 1.05, maxWidth: 720, textWrap: "balance", margin: "0px 76px 40px" }}>
          {t("We'd like to hear from you", "Chúng tôi muốn nghe từ bạn", "Kami ingin mendengar dari Anda")}
        </h1>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {channels.map((c) =>
          <a key={c.email} href={`mailto:${c.email}`} style={{
            display: "flex", flexDirection: "column", gap: 12,
            padding: 26, background: "var(--surface)",
            border: "1px solid var(--hair)", borderRadius: 10,
            textDecoration: "none", color: "var(--ink)"
          }} className="card-hover">
            <div style={{
              width: 42, height: 42, borderRadius: 8,
              background: "color-mix(in oklab, var(--brand-navy) 12%, transparent)",
              color: "var(--brand-navy)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Icon name={c.icon} size={20} color="var(--brand-navy)" stroke={2} />
            </div>
            <div className="upper" style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".12em", color: "var(--muted)" }}>{c.label}</div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--ink-2)", flex: 1 }}>{c.desc}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 14, borderTop: "1px solid var(--hair)" }}>
              <Icon name="mail" size={14} color="var(--accent)" />
              <span className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--accent)" }}>{c.email}</span>
            </div>
          </a>
          )}
      </div>

      {/* Office */}
      <div style={{ marginTop: 36, padding: "28px 32px", background: "var(--surface-2)", borderRadius: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div>
          <div className="upper" style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".14em", color: "var(--muted)", marginBottom: 8 }}>
            {t("Publisher", "Nhà xuất bản", "Penerbit")}
          </div>
          <div className="serif" style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.5, color: "var(--ink)" }}>
            Asia Press Centre Group (APCG)
          </div>
          <div className="text-mute" style={{ fontSize: 13, marginTop: 4 }}>
            {t("Bugis Cube · Singapore 188735", "Bugis Cube · Singapore 188735", "Bugis Cube · Singapura 188735")}
          </div>
        </div>
        <div>
          <div className="upper" style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".14em", color: "var(--muted)", marginBottom: 8 }}>
            {t("Response time", "Thời gian phản hồi", "Waktu respons")}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink-2)" }}>
            {t("We aim to reply to every message within one business day. Sensitive tips are read first.",
              "Chúng tôi cố gắng trả lời mọi tin nhắn trong một ngày làm việc. Tin nhạy cảm được đọc trước.",
              "Kami berupaya membalas tiap pesan dalam satu hari kerja. Tip sensitif dibaca lebih dulu.")}
          </div>
        </div>
      </div>
      </>
      }
    </div>);

}

// Press-focused page, everything points at media@dailytechwire.com
function PressInquiries({ navigate, t }) {
  const EMAIL = "media@dailytechwire.com";
  const topics = [
  ["feather", t("Interviews & expert comment", "Phỏng vấn & bình luận chuyên gia", "Wawancara & komentar pakar"),
  t("Speak to a reporter or editor who covers Asian tech, markets, or policy, on the record or on background.", "Trao đổi với phóng viên hoặc biên tập viên phụ trách công nghệ, thị trường hay chính sách châu Á, chính thức hoặc ẩn danh nền.", "Bicara dengan reporter atau editor yang meliput teknologi, pasar, atau kebijakan Asia, on the record atau latar belakang.")],
  ["lock", t("Story tips & documents", "Mật báo & tài liệu", "Tip berita & dokumen"),
  t("Send us a lead in confidence. We guard our sources and never name them without a fight in court.", "Gửi đầu mối một cách bảo mật. Chúng tôi bảo vệ nguồn tin và không nêu danh nếu chưa qua đấu tranh pháp lý.", "Kirim petunjuk secara rahasia. Kami menjaga sumber dan tak menyebut namanya tanpa perjuangan di pengadilan.")],
  ["external", t("Media credentials & reuse", "Thẻ tác nghiệp & sử dụng lại", "Kredensial media & penggunaan ulang"),
  t("Apply for accreditation to our events, or ask permission to quote and republish our work.", "Đăng ký tác nghiệp tại sự kiện của chúng tôi, hoặc xin phép trích dẫn và đăng lại nội dung của chúng tôi.", "Ajukan akreditasi untuk acara kami, atau minta izin mengutip dan menerbitkan ulang karya kami.")]];

  return (
    <div>
      {/* Hero */}
      <section style={{
        position: "relative", overflow: "hidden",
        background: "var(--banner)", color: "#E8EDF7",
        borderRadius: 14, padding: "64px 48px", textAlign: "center", marginBottom: 36
      }}>
        <GridBackdrop color="rgba(232, 237, 247, .06)" size={40} fadeRadius="80%" />
        <div style={{ position: "relative" }}>
          <div className="kicker" style={{ color: "var(--accent)", marginBottom: 14 }}>
            {t("Press inquiries", "Hỏi báo chí", "Pertanyaan pers")}
          </div>
          <h1 className="serif" style={{ margin: "0 auto 16px", fontSize: 52, fontWeight: 650, letterSpacing: "-0.03em", lineHeight: 1.05, maxWidth: 680, color: "#FFFFFF", textWrap: "balance" }}>
            {t("Reach the newsroom directly", "Liên hệ thẳng toà soạn", "Hubungi redaksi langsung")}
          </h1>
          <p className="serif" style={{ margin: "0 auto 28px", fontSize: 19, lineHeight: 1.5, maxWidth: 600, color: "rgba(232, 237, 247, .8)", textWrap: "pretty" }}>
            {t("For interviews, story tips, or permission to cite our reporting, write to one address, it reaches an editor, not a queue. We read every message and reply quickly.",
            "Để phỏng vấn, gửi mật báo hay xin phép trích dẫn nội dung của chúng tôi, hãy viết tới một địa chỉ duy nhất, thư đến tay biên tập viên, không phải hàng chờ. Chúng tôi đọc mọi thư và phản hồi nhanh.",
            "Untuk wawancara, tip berita, atau izin mengutip liputan kami, tulis ke satu alamat, langsung ke editor, bukan antrean. Kami membaca setiap pesan dan membalas cepat.")}
          </p>
          <a href={`mailto:${EMAIL}`} style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "14px 24px", background: "var(--accent)", color: "#fff",
            borderRadius: 8, fontSize: 15, fontWeight: 600, textDecoration: "none"
          }}>
            <Icon name="mail" size={16} color="#fff" /> {EMAIL}
          </a>
        </div>
      </section>

      {/* What to write about */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 36 }}>
        {topics.map(([icon, label, desc]) =>
        <a key={label} href={`mailto:${EMAIL}`} style={{
          display: "flex", flexDirection: "column", gap: 12, padding: 24,
          background: "var(--surface)", border: "1px solid var(--hair)", borderRadius: 10,
          textDecoration: "none", color: "var(--ink)"
        }} className="card-hover">
            <div style={{
            width: 40, height: 40, borderRadius: 8,
            background: "color-mix(in oklab, var(--brand-navy) 12%, transparent)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
              <Icon name={icon} size={19} color="var(--brand-navy)" stroke={2} />
            </div>
            <div className="serif" style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.25 }}>{label}</div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--ink-2)" }}>{desc}</p>
          </a>
        )}
      </div>

      {/* What helps us */}
      <div style={{ padding: "28px 32px", background: "var(--surface-2)", borderRadius: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
        <div>
          <div className="upper" style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".14em", color: "var(--muted)", marginBottom: 10 }}>
            {t("To help us respond faster", "Để chúng tôi phản hồi nhanh hơn", "Agar kami merespons lebih cepat")}
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7, color: "var(--ink-2)" }}>
            <li>{t("Put your deadline in the subject line.", "Ghi hạn chót của bạn ở dòng tiêu đề.", "Cantumkan tenggat Anda di baris subjek.")}</li>
            <li>{t("Say which reporter or story you're writing about.", "Nêu rõ phóng viên hoặc bài viết bạn đang đề cập.", "Sebutkan reporter atau artikel yang Anda maksud.")}</li>
            <li>{t("For tips, tell us how we can reach you securely.", "Với mật báo, cho biết cách liên hệ bạn an toàn.", "Untuk tip, beri tahu cara menghubungi Anda dengan aman.")}</li>
          </ul>
        </div>
        <div>
          <div className="upper" style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".14em", color: "var(--muted)", marginBottom: 10 }}>
            {t("Response time", "Thời gian phản hồi", "Waktu respons")}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink-2)" }}>
            {t("We aim to reply to press within one business day. Confidential tips are read first, by an editor.",
            "Chúng tôi cố gắng trả lời báo chí trong một ngày làm việc. Mật báo bảo mật được một biên tập viên đọc trước.",
            "Kami berupaya membalas pers dalam satu hari kerja. Tip rahasia dibaca lebih dulu oleh editor.")}
          </div>
          <div style={{ marginTop: 16 }}>
            <a href={`mailto:${EMAIL}`} className="linkish mono" style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>{EMAIL}</a>
          </div>
        </div>
      </div>
    </div>);

}

Object.assign(window, { ContactPage });