"use client";

// TODO: metadata — add generateMetadata once we move marketing pages to server components.

import Link from "next/link";
import { GridBackdrop, Reveal } from "@/components/effects";
import { Icon, type IconName } from "@/components/icons";
import { useT } from "@/lib/i18n";

const EMAIL = "advertising@dailytechwire.asia";
const MAILTO = `mailto:${EMAIL}?subject=DTW%20advertising%20inquiry`;

// Markets are proper nouns — not localized.
const MARKETS: ReadonlyArray<string> = [
  "Singapore",
  "Jakarta",
  "Tokyo",
  "Seoul",
  "Bengaluru",
  "Hanoi",
  "San Francisco",
  "London",
];

export default function AdvertisePage() {
  const t = useT();

  // Headline audience numbers, kept few and meaningful. Figures ported as-is.
  const stats: ReadonlyArray<{ v: string; k: string; s: string }> = [
    {
      v: "2.4M",
      k: t("Monthly readers", "Độc giả mỗi tháng", "Pembaca bulanan"),
      s: t("across web & apps", "trên web & ứng dụng", "lewat web & aplikasi"),
    },
    {
      v: "210K",
      k: t("Newsletter subscribers", "Người đăng ký bản tin", "Pelanggan newsletter"),
      s: t(
        "six titles · double opt-in",
        "sáu bản tin · xác nhận kép",
        "enam newsletter · opt-in ganda"
      ),
    },
    {
      v: "4:50",
      k: t("Avg. read time", "Thời gian đọc TB", "Rata-rata waktu baca"),
      s: t("minutes per session", "phút mỗi phiên", "menit per sesi"),
    },
    {
      v: "63%",
      k: t("Senior decision-makers", "Cấp ra quyết định", "Pengambil keputusan senior"),
      s: t(
        "director level and above",
        "từ cấp giám đốc trở lên",
        "level direktur ke atas"
      ),
    },
  ];

  // Reasons to advertise, three firm principles.
  const why: ReadonlyArray<readonly [icon: IconName, head: string, body: string]> = [
    [
      "lock",
      t("Brand-safe by design", "An toàn thương hiệu", "Aman untuk merek"),
      t(
        "No programmatic exchanges, no autoplay video, no tracking-pixel free-for-all. Every placement sits beside reporting we are proud of, and nothing else.",
        "Không có sàn lập trình, không video tự phát, không thả nổi pixel theo dõi. Mỗi vị trí quảng cáo nằm cạnh những bài báo chúng tôi tự hào, và không gì khác.",
        "Tanpa bursa programmatic, tanpa video autoplay, tanpa pixel pelacak sembarangan. Setiap penempatan berada di samping liputan yang kami banggakan, dan tidak ada yang lain."
      ),
    ],
    [
      "user",
      t("An audience that pays attention", "Độc giả thật sự chú tâm", "Audiens yang menyimak"),
      t(
        "Our readers are founders, engineers, investors, and policymakers who arrive on purpose and stay to read. They are the people your category actually needs to reach.",
        "Độc giả của chúng tôi là nhà sáng lập, kỹ sư, nhà đầu tư và nhà hoạch định chính sách, họ chủ động tìm đến và ở lại để đọc. Đúng những người ngành của bạn cần tiếp cận.",
        "Pembaca kami adalah founder, engineer, investor, dan pembuat kebijakan yang datang dengan tujuan dan bertahan untuk membaca. Mereka orang yang benar-benar perlu dijangkau kategori Anda."
      ),
    ],
    [
      "globe",
      t("Asia and the world", "Châu Á và thế giới", "Asia dan dunia"),
      t(
        "Run a campaign in one city or across every market we cover. Reporting from in-region desks means your message lands in the right language and the right context.",
        "Chạy chiến dịch ở một thành phố hay trên mọi thị trường chúng tôi phủ sóng. Đưa tin từ các văn phòng tại chỗ giúp thông điệp của bạn đến đúng ngôn ngữ, đúng bối cảnh.",
        "Jalankan kampanye di satu kota atau di seluruh pasar yang kami liput. Liputan dari biro di kawasan membuat pesan Anda tiba dalam bahasa dan konteks yang tepat."
      ),
    ],
  ];

  // Inventory / formats. The branded-content card links to /studio.
  const formats: ReadonlyArray<{
    icon: IconName;
    name: string;
    desc: string;
    note: string;
    to?: string;
  }> = [
    {
      icon: "mail",
      name: t("Newsletter sponsorship", "Tài trợ bản tin", "Sponsor newsletter"),
      desc: t(
        "A single host-read placement in the AM Brief, AI Weekly, or any of our six titles. One sponsor per send.",
        "Một vị trí do biên tập viên đọc trong AM Brief, AI Weekly hoặc bất kỳ bản tin nào. Mỗi số chỉ một nhà tài trợ.",
        "Satu penempatan host-read di AM Brief, AI Weekly, atau salah satu dari enam newsletter. Satu sponsor per kiriman."
      ),
      note: t("from $3,500 / send", "từ $3,500 / số", "dari $3.500 / kiriman"),
    },
    {
      icon: "globe",
      name: t("Homepage & display", "Trang chủ & hiển thị", "Beranda & display"),
      desc: t(
        "Premium positions on the homepage and across article pages. Flat-rate takeovers or standard CPM, viewability-guaranteed.",
        "Vị trí cao cấp trên trang chủ và các trang bài viết. Trọn gói takeover hoặc CPM tiêu chuẩn, cam kết hiển thị.",
        "Posisi premium di beranda dan halaman artikel. Takeover tarif tetap atau CPM standar, dengan jaminan viewability."
      ),
      note: t("CPM or flat takeover", "CPM hoặc takeover trọn gói", "CPM atau takeover flat"),
    },
    {
      icon: "headphone",
      name: t("Podcast & audio", "Podcast & âm thanh", "Podcast & audio"),
      desc: t(
        "Host-read spots in our shows, plus audio versions of every article. Pre-roll, mid-roll, or full episode presenting sponsor.",
        "Quảng cáo do người dẫn đọc trong các show, cùng bản audio của mọi bài viết. Pre-roll, mid-roll hoặc nhà tài trợ trọn tập.",
        "Spot host-read di acara kami, plus versi audio tiap artikel. Pre-roll, mid-roll, atau presenting sponsor satu episode."
      ),
      note: t("host-read spots", "đọc bởi người dẫn", "spot host-read"),
    },
    {
      icon: "user",
      name: t("Events & roundtables", "Sự kiện & toạ đàm", "Acara & roundtable"),
      desc: t(
        "Closed-door dinners, panels, and briefings in the cities we report from. Curated guest lists, on or off the record.",
        "Bữa tối kín, toạ đàm và briefing tại các thành phố chúng tôi đưa tin. Danh sách khách mời tuyển chọn, công khai hoặc kín.",
        "Makan malam tertutup, panel, dan briefing di kota tempat kami meliput. Daftar tamu terkurasi, on atau off the record."
      ),
      note: t("in-region · 6 cities", "tại chỗ · 6 thành phố", "di kawasan · 6 kota"),
    },
    {
      icon: "data",
      name: t("Dashboards sponsorship", "Tài trợ bảng dữ liệu", "Sponsor dasbor"),
      desc: t(
        "Category-exclusive presence on our live Funding Tracker and AI Leaderboard, the tools our readers check daily.",
        "Hiện diện độc quyền theo ngành trên Funding Tracker và AI Leaderboard trực tiếp, công cụ độc giả xem mỗi ngày.",
        "Kehadiran eksklusif per kategori di Funding Tracker dan AI Leaderboard langsung, alat yang dicek pembaca tiap hari."
      ),
      note: t("category exclusive", "độc quyền theo ngành", "eksklusif kategori"),
    },
    {
      icon: "feather",
      name: t("Branded content", "Nội dung thương hiệu", "Konten bermerek"),
      desc: t(
        "Long-form features, research, and video told to a newsroom standard, produced and clearly labelled by DTW Studio.",
        "Bài đặc tả dài, nghiên cứu và video theo chuẩn toà soạn, sản xuất và gắn nhãn rõ ràng bởi DTW Studio.",
        "Fitur panjang, riset, dan video dengan standar redaksi, diproduksi dan diberi label jelas oleh DTW Studio."
      ),
      note: t("via DTW Studio →", "qua DTW Studio →", "lewat DTW Studio →"),
      to: "/studio",
    },
  ];

  // Reader composition, one restrained chart.
  const audience: ReadonlyArray<{ k: string; v: number; c: string }> = [
    { k: t("Engineering & product", "Kỹ thuật & sản phẩm", "Engineering & produk"), v: 31, c: "#3A4E8C" },
    { k: t("Founders & C-suite", "Sáng lập & lãnh đạo", "Founder & C-suite"), v: 28, c: "#B0512E" },
    { k: t("Investors & finance", "Nhà đầu tư & tài chính", "Investor & keuangan"), v: 22, c: "#3E6E80" },
    { k: t("Policy & academia", "Chính sách & học thuật", "Kebijakan & akademik"), v: 11, c: "#5A6577" },
    { k: t("Other", "Khác", "Lainnya"), v: 8, c: "#8F7238" },
  ];

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 72, maxWidth: 980 }}>
      {/* Hero — navy banner: fixed light text values per banner rule */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background: "var(--banner)",
          color: "#E8EDF7",
          borderRadius: 14,
          padding: "60px 48px",
          marginBottom: 44,
        }}
      >
        <GridBackdrop color="rgba(255,255,255,.05)" size={40} fadeRadius="85%" />
        <div
          style={{
            position: "absolute",
            right: -100,
            bottom: -100,
            width: 340,
            height: 340,
            borderRadius: "50%",
            background: "var(--accent)",
            opacity: 0.15,
            filter: "blur(110px)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", maxWidth: 700 }}>
          <div className="kicker" style={{ color: "var(--accent)", marginBottom: 14 }}>
            {t("Advertise with DTW", "Quảng cáo cùng DTW", "Beriklan dengan DTW")}
          </div>
          <h1
            className="serif"
            style={{
              margin: "0 0 18px",
              fontSize: "clamp(34px, 7vw, 54px)",
              fontWeight: 650,
              letterSpacing: "-0.03em",
              lineHeight: 1.04,
              color: "#FFFFFF",
              textWrap: "balance",
            }}
          >
            {t(
              "Reach the people building tech across Asia and the world",
              "Tiếp cận những người đang kiến tạo công nghệ khắp châu Á và thế giới",
              "Jangkau orang-orang yang membangun teknologi di Asia dan dunia"
            )}
          </h1>
          <p
            className="serif"
            style={{
              margin: "0 0 30px",
              fontSize: 19,
              lineHeight: 1.55,
              color: "rgba(232, 237, 247, .70)",
              textWrap: "pretty",
              maxWidth: 600,
            }}
          >
            {t(
              "Founders, engineers, investors, and policymakers read dailytechwire to understand what is actually happening in technology. Put your brand in front of them, in a place built for attention, not impressions.",
              "Nhà sáng lập, kỹ sư, nhà đầu tư và nhà hoạch định chính sách đọc dailytechwire để hiểu điều thực sự đang diễn ra trong công nghệ. Đưa thương hiệu của bạn đến trước họ, ở một nơi được tạo ra cho sự chú tâm, không phải lượt hiển thị.",
              "Founder, engineer, investor, dan pembuat kebijakan membaca dailytechwire untuk memahami apa yang benar-benar terjadi di teknologi. Tempatkan merek Anda di depan mereka, di tempat yang dibangun untuk perhatian, bukan impresi."
            )}
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
              <Icon name="download" size={16} color="#fff" />{" "}
              {t("Request the media kit", "Nhận media kit", "Minta media kit")}
            </a>
            <a
              href={MAILTO}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 22px",
                background: "transparent",
                color: "#E8EDF7",
                border: "1px solid rgba(232, 237, 247, .20)",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <Icon name="mail" size={16} color="#E8EDF7" />{" "}
              {t("Talk to the team", "Trao đổi với đội ngũ", "Bicara dengan tim")}
            </a>
          </div>
        </div>

        {/* Stats strip */}
        <div
          style={{
            position: "relative",
            marginTop: 44,
            paddingTop: 30,
            borderTop: "1px solid rgba(232, 237, 247, .20)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))",
            gap: 28,
          }}
        >
          {stats.map((st) => (
            <div key={st.k}>
              <div
                className="serif"
                style={{
                  fontSize: 38,
                  fontWeight: 650,
                  letterSpacing: "-0.02em",
                  color: "#FFFFFF",
                  lineHeight: 1,
                }}
              >
                {st.v}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#E8EDF7", marginTop: 8 }}>
                {st.k}
              </div>
              <div style={{ fontSize: 11.5, color: "rgba(232, 237, 247, .60)", marginTop: 2 }}>
                {st.s}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why advertise */}
      <Reveal>
        <div className="kicker muted" style={{ marginBottom: 16 }}>
          {t("Why DTW", "Vì sao chọn DTW", "Kenapa DTW")}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
            gap: 20,
            marginBottom: 48,
          }}
        >
          {why.map(([icon, head, body]) => (
            <div
              key={head}
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
                <Icon name={icon} size={20} color="var(--brand-navy)" stroke={2} />
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
                {head}
              </div>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-2)" }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Formats / inventory */}
      <Reveal>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 18,
            paddingBottom: 10,
            borderBottom: "2px solid var(--brand-navy)",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div className="kicker" style={{ marginBottom: 4 }}>
              {t("Formats & placements", "Định dạng & vị trí", "Format & penempatan")}
            </div>
            <h2
              className="serif"
              style={{ margin: 0, fontSize: 28, fontWeight: 650, letterSpacing: "-0.02em" }}
            >
              {t(
                "Six ways to reach our readers",
                "Sáu cách tiếp cận độc giả",
                "Enam cara menjangkau pembaca"
              )}
            </h2>
          </div>
          <span className="mono text-mute-2" style={{ fontSize: 11 }}>
            {t(
              "Rates indicative · full card on request",
              "Giá tham khảo · bảng đầy đủ theo yêu cầu",
              "Tarif indikatif · kartu lengkap atas permintaan"
            )}
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
            gap: 20,
            marginBottom: 48,
          }}
        >
          {formats.map((f) => {
            const inner = (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      background: "color-mix(in oklab, var(--accent) 14%, transparent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name={f.icon} size={18} color="var(--accent-ink)" stroke={2} />
                  </div>
                  <span
                    className="mono"
                    style={{
                      fontSize: 10.5,
                      fontWeight: 600,
                      letterSpacing: ".04em",
                      color: f.to ? "var(--accent)" : "var(--muted)",
                      padding: "4px 9px",
                      borderRadius: 99,
                      border: "1px solid var(--hair-2)",
                      background: "var(--paper)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {f.note}
                  </span>
                </div>
                <div
                  className="serif"
                  style={{
                    fontSize: 18,
                    fontWeight: 650,
                    lineHeight: 1.25,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {f.name}
                </div>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "var(--ink-2)" }}>
                  {f.desc}
                </p>
              </>
            );

            const cardStyle = {
              display: "flex",
              flexDirection: "column" as const,
              gap: 12,
              padding: 24,
              background: "var(--surface)",
              border: "1px solid var(--hair)",
              borderRadius: 10,
              textDecoration: "none",
              color: "var(--ink)",
            };

            return f.to ? (
              <Link key={f.name} href={f.to} className="card-hover" style={cardStyle}>
                {inner}
              </Link>
            ) : (
              <div key={f.name} style={cardStyle}>
                {inner}
              </div>
            );
          })}
        </div>
      </Reveal>

      {/* Audience composition */}
      <Reveal>
        <div
          style={{
            padding: "36px 40px",
            background: "var(--surface-2)",
            border: "1px solid var(--hair)",
            borderRadius: 12,
            marginBottom: 44,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: 48,
            alignItems: "center",
          }}
        >
          <div>
            <div className="kicker muted" style={{ marginBottom: 8 }}>
              {t("Who reads DTW", "Ai đọc DTW", "Siapa pembaca DTW")}
            </div>
            <h2
              className="serif"
              style={{
                margin: "0 0 12px",
                fontSize: 28,
                fontWeight: 650,
                letterSpacing: "-0.02em",
                lineHeight: 1.12,
                textWrap: "balance",
              }}
            >
              {t(
                "A senior, technical audience, by role",
                "Độc giả cấp cao, kỹ thuật, theo vai trò",
                "Audiens senior dan teknis, menurut peran"
              )}
            </h2>
            <p className="serif text-mute" style={{ margin: "0 0 16px", fontSize: 15, lineHeight: 1.55 }}>
              {t(
                "Self-reported on sign-up across our subscriber base. Reading and event audiences skew more senior still.",
                "Tự khai báo khi đăng ký trong cơ sở người đăng ký. Nhóm đọc và dự sự kiện còn cao cấp hơn nữa.",
                "Dilaporkan sendiri saat mendaftar di basis pelanggan kami. Audiens baca dan acara cenderung lebih senior lagi."
              )}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {MARKETS.map((m) => (
                <span
                  key={m}
                  className="mono"
                  style={{
                    fontSize: 11,
                    padding: "4px 9px",
                    borderRadius: 99,
                    border: "1px solid var(--hair-2)",
                    background: "var(--paper)",
                    color: "var(--ink-2)",
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {audience.map((a) => (
              <div key={a.k}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{a.k}</span>
                  <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600, color: a.c }}>
                    {a.v}%
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    background: "var(--hair)",
                    borderRadius: 99,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${a.v * 3}%`,
                      maxWidth: "100%",
                      height: "100%",
                      background: a.c,
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Standards / brand-safety note */}
      <Reveal>
        <div
          style={{
            padding: "28px 32px",
            background: "var(--surface)",
            border: "1px solid var(--hair)",
            borderRadius: 12,
            marginBottom: 44,
            display: "flex",
            gap: 20,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 9,
              flexShrink: 0,
              background: "color-mix(in oklab, var(--accent) 14%, transparent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="check" size={20} color="var(--accent-ink)" stroke={2.4} />
          </div>
          <div>
            <div
              className="serif"
              style={{ fontSize: 18, fontWeight: 650, marginBottom: 6, letterSpacing: "-0.01em" }}
            >
              {t(
                "Advertising is always separate from the newsroom",
                "Quảng cáo luôn tách biệt với toà soạn",
                "Iklan selalu terpisah dari ruang redaksi"
              )}
            </div>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-2)", maxWidth: 720 }}>
              {t(
                "Buying a placement never buys coverage, and it never influences what we report. Paid content is clearly labelled and produced by DTW Studio, not our reporters. The rules are public.",
                "Mua một vị trí quảng cáo không bao giờ mua được tin bài, và không bao giờ ảnh hưởng đến nội dung chúng tôi đưa tin. Nội dung trả phí được gắn nhãn rõ ràng và do DTW Studio sản xuất, không phải phóng viên của chúng tôi. Các quy tắc được công khai.",
                "Membeli penempatan tak pernah membeli liputan, dan tak pernah memengaruhi apa yang kami beritakan. Konten berbayar diberi label jelas dan diproduksi DTW Studio, bukan reporter kami. Aturannya publik."
              )}
            </p>
            <div style={{ marginTop: 12 }}>
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
                  "Read the Sponsored & Affiliate policy",
                  "Đọc Chính sách Tài trợ & Affiliate",
                  "Baca Kebijakan Sponsor & Afiliasi"
                )}
                <Icon name="arrow-r" size={14} color="var(--accent)" />
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      {/* CTA band — navy banner: fixed light text values per banner rule */}
      <Reveal>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
            gap: 36,
            alignItems: "center",
            padding: "34px 40px",
            background: "var(--banner)",
            color: "#E8EDF7",
            borderRadius: 12,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <GridBackdrop color="rgba(255,255,255,.05)" size={32} fadeRadius="80%" />
          <div
            style={{
              position: "absolute",
              left: -60,
              top: -60,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: "var(--accent)",
              opacity: 0.16,
              filter: "blur(70px)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative" }}>
            <h2
              className="serif"
              style={{
                margin: "0 0 8px",
                fontSize: 28,
                fontWeight: 650,
                letterSpacing: "-0.02em",
                lineHeight: 1.12,
                color: "#FFFFFF",
                textWrap: "balance",
              }}
            >
              {t("Let's plan a campaign", "Cùng lên kế hoạch chiến dịch", "Mari rancang kampanye")}
            </h2>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "rgba(232, 237, 247, .70)", maxWidth: 480 }}>
              {t(
                "Tell us who you want to reach and your budget. We'll send the media kit, the full rate card, and a recommended plan, usually within two business days.",
                "Cho chúng tôi biết bạn muốn tiếp cận ai và ngân sách. Chúng tôi sẽ gửi media kit, bảng giá đầy đủ và đề xuất kế hoạch, thường trong hai ngày làm việc.",
                "Beri tahu kami siapa yang ingin Anda jangkau dan anggaran Anda. Kami akan mengirim media kit, kartu tarif lengkap, dan rencana rekomendasi, biasanya dalam dua hari kerja."
              )}
            </p>
          </div>
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <a
              href={MAILTO}
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
            <div style={{ fontSize: 12, lineHeight: 1.5, color: "rgba(232, 237, 247, .60)" }}>
              {t(
                "Media kit and rate card sent on request. Asia Press Centre Group · Singapore.",
                "Gửi media kit và bảng giá theo yêu cầu. Asia Press Centre Group · Singapore.",
                "Media kit dan rate card dikirim atas permintaan. Asia Press Centre Group · Singapura."
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
