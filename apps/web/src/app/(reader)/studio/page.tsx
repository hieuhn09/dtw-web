"use client";

// TODO: metadata — convert to generateMetadata once this marketing page is finalised.

import Link from "next/link";
import { GridBackdrop } from "@/components/effects";
import { Icon, type IconName } from "@/components/icons";
import { useT } from "@/lib/i18n";

const EMAIL = "partnership@dailytechwire.com";
const MAILTO = `mailto:${EMAIL}?subject=DTW%20Studio%20inquiry`;

export default function StudioPage() {
  const t = useT();

  const services: ReadonlyArray<{ icon: IconName; label: string; desc: string }> = [
    {
      icon: "feather",
      label: t("Branded features", "Bài đặc tả thương hiệu", "Fitur bermerek"),
      desc: t(
        "Long-form articles written and edited by our Studio team, the same craft as our newsroom, produced for your brand and labelled as sponsored.",
        "Bài viết dài do đội Studio chấp bút và biên tập, cùng chất lượng với toà soạn, sản xuất cho thương hiệu của bạn và gắn nhãn tài trợ rõ ràng.",
        "Artikel panjang yang ditulis dan disunting tim Studio kami, kualitas yang sama dengan ruang redaksi, diproduksi untuk merek Anda dan diberi label bersponsor."
      ),
    },
    {
      icon: "data",
      label: t("Research & data", "Nghiên cứu & dữ liệu", "Riset & data"),
      desc: t(
        "Original surveys, market reports, and data visualisations on tech across Asia and the world, built with our analysts and designed to be cited.",
        "Khảo sát độc lập, báo cáo thị trường và đồ hoạ dữ liệu về công nghệ khắp châu Á và thế giới, thực hiện cùng đội phân tích và thiết kế để được trích dẫn.",
        "Survei orisinal, laporan pasar, dan visualisasi data teknologi di Asia dan dunia, dibuat bersama analis kami dan dirancang untuk dikutip."
      ),
    },
    {
      icon: "headphone",
      label: t("Audio, video & events", "Âm thanh, video & sự kiện", "Audio, video & acara"),
      desc: t(
        "Branded podcast segments, short documentaries, and panels at our events, produced end to end, distributed across our channels.",
        "Chuyên mục podcast thương hiệu, phim tài liệu ngắn và toạ đàm tại sự kiện của chúng tôi, sản xuất trọn gói, phân phối trên các kênh của DTW.",
        "Segmen podcast bermerek, dokumenter pendek, dan panel di acara kami, diproduksi menyeluruh, didistribusikan di seluruh kanal kami."
      ),
    },
  ];

  const principles: ReadonlyArray<{ icon: IconName; head: string; body: string }> = [
    {
      icon: "check",
      head: t("Always labelled", "Luôn gắn nhãn", "Selalu diberi label"),
      body: t(
        "Every Studio piece carries a yellow background, a 'Paid Partner' tag, and a disclosure at the top, middle, and end. Readers never have to guess.",
        "Mỗi bài Studio đều có nền vàng, nhãn 'Paid Partner' và phần minh bạch ở đầu, giữa và cuối. Độc giả không bao giờ phải đoán.",
        "Setiap karya Studio memiliki latar kuning, label 'Paid Partner', dan pengungkapan di awal, tengah, dan akhir. Pembaca tak perlu menebak."
      ),
    },
    {
      icon: "lock",
      head: t("Separate from the newsroom", "Tách biệt với toà soạn", "Terpisah dari ruang redaksi"),
      body: t(
        "Studio is a distinct team with its own budget. Our reporters and editors are never assigned to sponsored work, and partners never see unpublished newsroom coverage.",
        "Studio là một đội độc lập với ngân sách riêng. Phóng viên và biên tập viên của toà soạn không bao giờ làm nội dung tài trợ, và đối tác không được xem tin bài chưa đăng.",
        "Studio adalah tim tersendiri dengan anggarannya sendiri. Reporter dan editor kami tak pernah ditugaskan untuk konten bersponsor, dan mitra tak pernah melihat liputan redaksi yang belum terbit."
      ),
    },
    {
      icon: "info",
      head: t("Clear on the line", "Rạch ròi giới hạn", "Jelas batasannya"),
      body: t(
        "Partners choose the topic and check their own product facts. They can't approve copy that names competitors, pick pull-quotes, or require a sales pitch.",
        "Đối tác chọn chủ đề và kiểm tra dữ kiện về sản phẩm của họ. Họ không được duyệt nội dung nhắc tên đối thủ, chọn trích dẫn, hay yêu cầu giọng quảng cáo.",
        "Mitra memilih topik dan memeriksa fakta produk mereka sendiri. Mereka tak boleh menyetujui naskah yang menyebut pesaing, memilih kutipan, atau menuntut nada penjualan."
      ),
    },
  ];

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 72, maxWidth: 980 }}>
      {/* Hero — navy banner: text uses FIXED light values (banner is navy in both themes) */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background: "var(--banner)",
          borderRadius: 14,
          padding: "60px 48px",
          marginBottom: 44,
        }}
      >
        <GridBackdrop color="rgba(255,255,255,.05)" size={40} fadeRadius="85%" />
        <div style={{ position: "relative", maxWidth: 680 }}>
          <div className="kicker" style={{ color: "var(--accent)", marginBottom: 14 }}>
            {t("DTW Studio", "DTW Studio", "DTW Studio")}
          </div>
          <h1
            className="serif"
            style={{
              margin: "0 0 18px",
              fontSize: "clamp(34px, 7vw, 52px)",
              fontWeight: 650,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              color: "#FFFFFF",
              textWrap: "balance",
            }}
          >
            {t(
              "Storytelling for brands, held to a newsroom standard",
              "Kể chuyện cho thương hiệu, theo chuẩn của một toà soạn",
              "Bercerita untuk merek, dengan standar ruang redaksi"
            )}
          </h1>
          <p
            className="serif"
            style={{
              margin: "0 0 30px",
              fontSize: 19,
              lineHeight: 1.55,
              color: "rgba(232,237,247,0.70)",
              textWrap: "pretty",
            }}
          >
            {t(
              "DTW Studio is our branded-content team. We work with partners to tell their story to an audience that reads us for tech across Asia and the world, researched, written, and produced with the same care as our journalism, and labelled clearly so trust stays intact on both sides.",
              "DTW Studio là đội nội dung thương hiệu của chúng tôi. Chúng tôi đồng hành cùng đối tác để kể câu chuyện của họ tới những độc giả đọc DTW vì công nghệ khắp châu Á và thế giới, nghiên cứu, chấp bút và sản xuất kỹ lưỡng như báo chí của chúng tôi, và gắn nhãn minh bạch để giữ niềm tin cho cả hai phía.",
              "DTW Studio adalah tim konten bermerek kami. Kami bekerja dengan mitra untuk menyampaikan kisah mereka kepada pembaca yang mengikuti DTW demi teknologi di Asia dan dunia, diriset, ditulis, dan diproduksi dengan kehati-hatian yang sama seperti jurnalisme kami, serta diberi label jelas agar kepercayaan tetap terjaga di kedua sisi."
            )}
          </p>
          <a
            href={MAILTO}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 24px",
              background: "var(--accent)",
              color: "#fff",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <Icon name="mail" size={16} color="#fff" />{" "}
            {t("Start a project", "Bắt đầu dự án", "Mulai proyek")}
          </a>
        </div>
      </section>

      {/* What we make */}
      <div className="kicker muted" style={{ marginBottom: 16 }}>
        {t("What we make", "Chúng tôi làm gì", "Yang kami buat")}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: 20,
          marginBottom: 48,
        }}
      >
        {services.map((s) => (
          <div
            key={s.label}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: 26,
              background: "var(--surface)",
              border: "1px solid var(--hair)",
              borderRadius: 10,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 8,
                background: "color-mix(in oklab, var(--brand-navy) 12%, transparent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name={s.icon} size={20} color="var(--brand-navy)" stroke={2} />
            </div>
            <div
              className="serif"
              style={{
                fontSize: 19,
                fontWeight: 650,
                lineHeight: 1.25,
                letterSpacing: "-0.01em",
              }}
            >
              {s.label}
            </div>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-2)" }}>
              {s.desc}
            </p>
          </div>
        ))}
      </div>

      {/* How we work — disclosure principles */}
      <div
        style={{
          padding: "36px 40px",
          background: "var(--surface-2)",
          border: "1px solid var(--hair)",
          borderRadius: 12,
          marginBottom: 44,
        }}
      >
        <div className="kicker muted" style={{ marginBottom: 8 }}>
          {t("How we work", "Cách chúng tôi làm việc", "Cara kami bekerja")}
        </div>
        <h2
          className="serif"
          style={{
            margin: "0 0 8px",
            fontSize: 30,
            fontWeight: 650,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            textWrap: "balance",
          }}
        >
          {t(
            "Sponsored, and never hidden",
            "Tài trợ, và không bao giờ giấu giếm",
            "Bersponsor, dan tak pernah disembunyikan"
          )}
        </h2>
        <p
          className="serif text-mute"
          style={{ margin: "0 0 28px", fontSize: 16, lineHeight: 1.55, maxWidth: 680 }}
        >
          {t(
            "The reason partners reach our readers is that those readers trust us. We protect that with a few firm rules, the same ones whether the partner is a startup or a global cloud provider.",
            "Lý do các đối tác chạm tới độc giả của chúng tôi là vì độc giả tin chúng tôi. Chúng tôi giữ niềm tin đó bằng vài nguyên tắc cứng rắn, áp dụng như nhau dù đối tác là một startup hay một nhà cung cấp đám mây toàn cầu.",
            "Alasan mitra dapat menjangkau pembaca kami adalah karena pembaca memercayai kami. Kami menjaganya dengan beberapa aturan tegas, sama saja entah mitranya startup atau penyedia cloud global."
          )}
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
            gap: 28,
          }}
        >
          {principles.map((p) => (
            <div key={p.head} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 7,
                    flexShrink: 0,
                    background: "color-mix(in oklab, var(--accent) 14%, transparent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name={p.icon} size={16} color="var(--accent-ink)" stroke={2.2} />
                </div>
                <div className="serif" style={{ fontSize: 16, fontWeight: 650, lineHeight: 1.2 }}>
                  {p.head}
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "var(--ink-2)" }}>
                {p.body}
              </p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid var(--hair)" }}>
          <Link
            href="/trust/sponsored"
            className="linkish"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--accent)",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {t(
              "Read the full Sponsored & Affiliate policy",
              "Đọc đầy đủ Chính sách Tài trợ & Affiliate",
              "Baca lengkap Kebijakan Sponsor & Afiliasi"
            )}
            <Icon name="arrow-r" size={14} color="var(--accent)" />
          </Link>
        </div>
      </div>

      {/* CTA band */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: 36,
          alignItems: "center",
          padding: "34px 40px",
          background: "var(--surface)",
          border: "1px solid var(--hair-2)",
          borderRadius: 12,
        }}
      >
        <div>
          <h2
            className="serif"
            style={{
              margin: "0 0 8px",
              fontSize: 26,
              fontWeight: 650,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              textWrap: "balance",
            }}
          >
            {t(
              "Have a story worth telling well?",
              "Có một câu chuyện đáng kể tử tế?",
              "Punya kisah yang layak diceritakan dengan baik?"
            )}
          </h2>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--ink-2)", maxWidth: 460 }}>
            {t(
              "Tell us who you're trying to reach and what you want them to understand. We'll come back with a shape, a timeline, and a quote, usually within two business days.",
              "Cho chúng tôi biết bạn muốn tiếp cận ai và muốn họ hiểu điều gì. Chúng tôi sẽ phản hồi với một hướng triển khai, lịch trình và báo giá, thường trong hai ngày làm việc.",
              "Beri tahu kami siapa yang ingin Anda jangkau dan apa yang ingin mereka pahami. Kami akan kembali dengan konsep, jadwal, dan penawaran, biasanya dalam dua hari kerja."
            )}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
          <a
            href={MAILTO}
            className="accent-glow"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              justifyContent: "center",
              padding: "14px 22px",
              background: "var(--accent)",
              color: "#fff",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <Icon name="mail" size={16} color="#fff" /> {EMAIL}
          </a>
          <div className="text-mute" style={{ fontSize: 12, lineHeight: 1.5 }}>
            {t(
              "Media kit and rate card sent on request. Asia Press Centre Group · Singapore.",
              "Gửi media kit và bảng giá theo yêu cầu. Asia Press Centre Group · Singapore.",
              "Media kit dan rate card dikirim atas permintaan. Asia Press Centre Group · Singapura."
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
