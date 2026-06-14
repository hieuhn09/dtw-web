"use client";

// TODO: metadata — add generateMetadata once this page moves off "use client"
// or gains a server wrapper. Press inquiries is a static marketing page.

import { GridBackdrop } from "@/components/effects";
import { Icon, type IconName } from "@/components/icons";
import { useT } from "@/lib/i18n";

const PRESS_EMAIL = "media@dailytechwire.com";

export default function PressPage() {
  const t = useT();

  const topics: ReadonlyArray<readonly [icon: IconName, label: string, desc: string]> = [
    [
      "feather",
      t(
        "Interviews & expert comment",
        "Phỏng vấn & bình luận chuyên gia",
        "Wawancara & komentar pakar"
      ),
      t(
        "Speak to a reporter or editor who covers Asian tech, markets, or policy, on the record or on background.",
        "Trao đổi với phóng viên hoặc biên tập viên phụ trách công nghệ, thị trường hay chính sách châu Á, chính thức hoặc ẩn danh nền.",
        "Bicara dengan reporter atau editor yang meliput teknologi, pasar, atau kebijakan Asia, on the record atau latar belakang."
      ),
    ],
    [
      "lock",
      t("Story tips & documents", "Mật báo & tài liệu", "Tip berita & dokumen"),
      t(
        "Send us a lead in confidence. We guard our sources and never name them without a fight in court.",
        "Gửi đầu mối một cách bảo mật. Chúng tôi bảo vệ nguồn tin và không nêu danh nếu chưa qua đấu tranh pháp lý.",
        "Kirim petunjuk secara rahasia. Kami menjaga sumber dan tak menyebut namanya tanpa perjuangan di pengadilan."
      ),
    ],
    [
      "external",
      t(
        "Media credentials & reuse",
        "Thẻ tác nghiệp & sử dụng lại",
        "Kredensial media & penggunaan ulang"
      ),
      t(
        "Apply for accreditation to our events, or ask permission to quote and republish our work.",
        "Đăng ký tác nghiệp tại sự kiện của chúng tôi, hoặc xin phép trích dẫn và đăng lại nội dung của chúng tôi.",
        "Ajukan akreditasi untuk acara kami, atau minta izin mengutip dan menerbitkan ulang karya kami."
      ),
    ],
  ];

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 72, maxWidth: 920 }}>
      {/* Hero — navy banner. Text MUST use fixed light values (banner is navy in both themes). */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background: "var(--banner)",
          borderRadius: 14,
          padding: "64px 48px",
          textAlign: "center",
          marginBottom: 36,
        }}
      >
        <GridBackdrop color="rgba(255,255,255,.05)" size={40} fadeRadius="80%" />
        <div style={{ position: "relative" }}>
          <div className="kicker" style={{ color: "var(--accent)", marginBottom: 14 }}>
            {t("Press inquiries", "Hỏi báo chí", "Pertanyaan pers")}
          </div>
          <h1
            className="serif"
            style={{
              margin: "0 auto 16px",
              fontSize: "clamp(34px, 7vw, 52px)",
              fontWeight: 650,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              maxWidth: 680,
              color: "#FFFFFF",
              textWrap: "balance",
            }}
          >
            {t(
              "Reach the newsroom directly",
              "Liên hệ thẳng toà soạn",
              "Hubungi redaksi langsung"
            )}
          </h1>
          <p
            className="serif"
            style={{
              margin: "0 auto 28px",
              fontSize: 19,
              lineHeight: 1.5,
              maxWidth: 600,
              color: "rgba(232,237,247,0.70)",
              textWrap: "pretty",
            }}
          >
            {t(
              "For interviews, story tips, or permission to cite our reporting, write to one address — it reaches an editor, not a queue. We read every message and reply quickly.",
              "Để phỏng vấn, gửi mật báo hay xin phép trích dẫn nội dung của chúng tôi, hãy viết tới một địa chỉ duy nhất — thư đến tay biên tập viên, không phải hàng chờ. Chúng tôi đọc mọi thư và phản hồi nhanh.",
              "Untuk wawancara, tip berita, atau izin mengutip liputan kami, tulis ke satu alamat — langsung ke editor, bukan antrean. Kami membaca setiap pesan dan membalas cepat."
            )}
          </p>
          <a
            href={`mailto:${PRESS_EMAIL}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 24px",
              background: "var(--accent)",
              color: "#FFFFFF",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <Icon name="mail" size={16} color="#FFFFFF" /> {PRESS_EMAIL}
          </a>
        </div>
      </section>

      {/* What to write about */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
          gap: 20,
          marginBottom: 36,
        }}
      >
        {topics.map(([icon, label, desc]) => (
          <a
            key={label}
            href={`mailto:${PRESS_EMAIL}`}
            aria-label={`${label} — ${t("email", "gửi email", "email")} ${PRESS_EMAIL}`}
            className="card-hover"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: 24,
              background: "var(--surface)",
              border: "1px solid var(--hair)",
              borderRadius: 10,
              textDecoration: "none",
              color: "var(--ink)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: "color-mix(in oklab, var(--brand-navy) 12%, transparent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name={icon} size={19} color="var(--brand-navy)" stroke={2} />
            </div>
            <div className="serif" style={{ fontSize: 18, fontWeight: 650, lineHeight: 1.25 }}>
              {label}
            </div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--ink-2)" }}>
              {desc}
            </p>
          </a>
        ))}
      </div>

      {/* What helps us + response time */}
      <div
        style={{
          padding: "28px 32px",
          background: "var(--surface-2)",
          borderRadius: 10,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: 36,
        }}
      >
        <div>
          <div
            className="upper"
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: ".14em",
              color: "var(--muted)",
              marginBottom: 10,
            }}
          >
            {t(
              "To help us respond faster",
              "Để chúng tôi phản hồi nhanh hơn",
              "Agar kami merespons lebih cepat"
            )}
          </div>
          <ul
            style={{
              margin: 0,
              paddingInlineStart: 18,
              fontSize: 14,
              lineHeight: 1.7,
              color: "var(--ink-2)",
            }}
          >
            <li>
              {t(
                "Put your deadline in the subject line.",
                "Ghi hạn chót của bạn ở dòng tiêu đề.",
                "Cantumkan tenggat Anda di baris subjek."
              )}
            </li>
            <li>
              {t(
                "Say which reporter or story you're writing about.",
                "Nêu rõ phóng viên hoặc bài viết bạn đang đề cập.",
                "Sebutkan reporter atau artikel yang Anda maksud."
              )}
            </li>
            <li>
              {t(
                "For tips, tell us how we can reach you securely.",
                "Với mật báo, cho biết cách liên hệ bạn an toàn.",
                "Untuk tip, beri tahu cara menghubungi Anda dengan aman."
              )}
            </li>
          </ul>
        </div>
        <div>
          <div
            className="upper"
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: ".14em",
              color: "var(--muted)",
              marginBottom: 10,
            }}
          >
            {t("Response time", "Thời gian phản hồi", "Waktu respons")}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink-2)" }}>
            {t(
              "We aim to reply to press within one business day. Confidential tips are read first, by an editor.",
              "Chúng tôi cố gắng trả lời báo chí trong một ngày làm việc. Mật báo bảo mật được một biên tập viên đọc trước.",
              "Kami berupaya membalas pers dalam satu hari kerja. Tip rahasia dibaca lebih dulu oleh editor."
            )}
          </div>
          <div style={{ marginTop: 16 }}>
            <a
              href={`mailto:${PRESS_EMAIL}`}
              className="linkish mono"
              style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600 }}
            >
              {PRESS_EMAIL}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
