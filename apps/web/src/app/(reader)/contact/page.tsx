"use client";

import { Icon, type IconName } from "@/components/icons";
import { useT } from "@/lib/i18n";

// TODO: metadata — add generateMetadata() once marketing pages get SEO pass.

interface Channel {
  icon: IconName;
  label: string;
  email: string;
  desc: string;
}

export default function ContactPage() {
  const t = useT();

  const channels: ReadonlyArray<Channel> = [
    {
      icon: "mail",
      label: t("General & editorial", "Chung & biên tập", "Umum & editorial"),
      email: "info@dailytechwire.asia",
      desc: t(
        "Questions about a story, a correction, your account, or anything that doesn't fit elsewhere. A person replies, usually within a business day.",
        "Câu hỏi về một bài viết, đính chính, tài khoản, hay bất cứ điều gì không thuộc mục khác. Một con người sẽ trả lời, thường trong một ngày làm việc.",
        "Pertanyaan tentang artikel, koreksi, akun, atau apa pun yang tak masuk kategori lain. Seseorang akan membalas, biasanya dalam satu hari kerja."
      ),
    },
    {
      icon: "feather",
      label: t("Press & media", "Báo chí & truyền thông", "Pers & media"),
      email: "media@dailytechwire.asia",
      desc: t(
        "Interview requests, press credentials, story tips, and confidential sources. We protect our sources and read every tip carefully.",
        "Yêu cầu phỏng vấn, thẻ báo chí, mật báo và nguồn tin bảo mật. Chúng tôi bảo vệ nguồn tin và đọc kỹ từng mật báo.",
        "Permintaan wawancara, kredensial pers, tip berita, dan sumber rahasia. Kami melindungi sumber dan membaca tiap tip dengan saksama."
      ),
    },
    {
      icon: "trend-up",
      label: t("Partnerships & business", "Hợp tác & kinh doanh", "Kemitraan & bisnis"),
      email: "partnership@dailytechwire.asia",
      desc: t(
        "Advertising, content licensing, events, syndication, and investor relations. Tell us what you have in mind and we'll route it to the right team.",
        "Quảng cáo, cấp phép nội dung, sự kiện, đăng lại, và quan hệ nhà đầu tư. Hãy cho chúng tôi biết ý định của bạn và chúng tôi sẽ chuyển tới đúng bộ phận.",
        "Iklan, lisensi konten, acara, sindikasi, dan hubungan investor. Beri tahu kami rencana Anda dan kami arahkan ke tim yang tepat."
      ),
    },
  ];

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 72, maxWidth: 920 }}>
      <header style={{ textAlign: "center", padding: "24px 0 0" }}>
        <div className="kicker" style={{ marginBottom: 10 }}>
          {t("Contact", "Liên hệ", "Kontak")}
        </div>
        <h1
          className="serif"
          style={{
            fontSize: "clamp(34px, 8vw, 54px)",
            fontWeight: 650,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            maxWidth: 720,
            textWrap: "balance",
            margin: "0 auto 40px",
          }}
        >
          {t(
            "We'd like to hear from you",
            "Chúng tôi muốn nghe từ bạn",
            "Kami ingin mendengar dari Anda"
          )}
        </h1>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
          gap: 20,
        }}
      >
        {channels.map((c) => (
          <a
            key={c.email}
            href={`mailto:${c.email}`}
            className="card-hover"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: 26,
              background: "var(--surface)",
              border: "1px solid var(--hair)",
              borderRadius: 10,
              textDecoration: "none",
              color: "var(--ink)",
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
              <Icon name={c.icon} size={20} color="var(--brand-navy)" stroke={2} />
            </div>
            <div
              className="upper"
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: ".12em",
                color: "var(--muted)",
              }}
            >
              {c.label}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                lineHeight: 1.55,
                color: "var(--ink-2)",
                flex: 1,
              }}
            >
              {c.desc}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                paddingTop: 14,
                borderTop: "1px solid var(--hair)",
              }}
            >
              <Icon name="mail" size={14} color="var(--accent)" />
              <span
                className="mono"
                style={{ fontSize: 12.5, fontWeight: 600, color: "var(--accent)" }}
              >
                {c.email}
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* Publisher · Response time */}
      <div
        style={{
          marginTop: 36,
          padding: "28px 32px",
          background: "var(--surface-2)",
          borderRadius: 10,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
          gap: 32,
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
              marginBottom: 8,
            }}
          >
            {t("Publisher", "Nhà xuất bản", "Penerbit")}
          </div>
          <div
            className="serif"
            style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.5, color: "var(--ink)" }}
          >
            Asia Press Centre Group (APCG)
          </div>
          <div className="text-mute" style={{ fontSize: 13, marginTop: 4 }}>
            {t(
              "Bugis Cube · Singapore 188735",
              "Bugis Cube · Singapore 188735",
              "Bugis Cube · Singapura 188735"
            )}
          </div>
        </div>
        <div>
          <div
            className="upper"
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: ".14em",
              color: "var(--muted)",
              marginBottom: 8,
            }}
          >
            {t("Response time", "Thời gian phản hồi", "Waktu respons")}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink-2)" }}>
            {t(
              "We aim to reply to every message within one business day. Sensitive tips are read first.",
              "Chúng tôi cố gắng trả lời mọi tin nhắn trong một ngày làm việc. Tin nhạy cảm được đọc trước.",
              "Kami berupaya membalas tiap pesan dalam satu hari kerja. Tip sensitif dibaca lebih dulu."
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
