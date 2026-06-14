"use client";

import Link from "next/link";
import { useT, useLang, fmtDateL } from "@/lib/i18n";

export type TrustSlug =
  | "editorial"
  | "ai"
  | "corrections"
  | "transparency"
  | "sponsored";

/**
 * Locale-neutral correction shape from the server. The date is the raw ISO
 * string so this client component can format it per-locale via `fmtDateL`.
 */
export interface CorrectionView {
  iso: string;
  art: string;
  summary: string;
  was: string;
  now: string;
  editor?: string;
}

interface TrustContentProps {
  slug: TrustSlug;
  corrections: ReadonlyArray<CorrectionView>;
}

const ORDER: ReadonlyArray<TrustSlug> = [
  "editorial",
  "ai",
  "corrections",
  "transparency",
  "sponsored",
];

function CorrectionsLog({
  items,
}: {
  items: ReadonlyArray<CorrectionView>;
}) {
  const t = useT();
  const { lang } = useLang();

  if (items.length === 0) {
    return (
      <div
        style={{
          padding: "32px 24px",
          border: "1px dashed var(--hair-2)",
          borderRadius: 6,
          color: "var(--muted)",
          fontSize: 15,
          lineHeight: 1.6,
        }}
      >
        {t(
          "No corrections have been issued yet. When we correct a published article, the change is logged here in full — date, original text, and corrected text — with the editor who signed it off.",
          "Chưa có đính chính nào được phát hành. Khi chúng tôi đính chính một bài đã đăng, thay đổi được ghi lại đầy đủ ở đây — ngày, văn bản gốc và văn bản đã sửa — kèm biên tập viên đã duyệt.",
          "Belum ada koreksi yang dikeluarkan. Saat kami mengoreksi artikel yang terbit, perubahan dicatat lengkap di sini — tanggal, teks asli, dan teks yang dikoreksi — beserta editor yang menyetujuinya."
        )}
      </div>
    );
  }

  return (
    <div>
      {items.map((c, i) => (
        <div
          key={i}
          style={{ padding: "18px 0", borderBottom: "1px solid var(--hair)" }}
        >
          <div className="mono text-mute" style={{ fontSize: 11, marginBottom: 6 }}>
            {fmtDateL(c.iso, lang)}
          </div>
          <div
            className="serif"
            style={{ fontSize: 17, fontWeight: 600, marginBottom: 8, color: "var(--ink)" }}
          >
            {c.art}
          </div>
          {c.summary && (
            <div className="text-mute" style={{ fontSize: 14, marginBottom: 10 }}>
              {c.summary}
            </div>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr",
              gap: 10,
              marginBottom: 6,
              fontSize: 14,
            }}
          >
            <span className="mono" style={{ color: "var(--down)", fontWeight: 600 }}>
              {t("was:", "trước:", "dulu:")}
            </span>
            <span style={{ textDecoration: "line-through", color: "var(--muted)" }}>
              {c.was}
            </span>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 10, fontSize: 14 }}
          >
            <span className="mono" style={{ color: "var(--up)", fontWeight: 600 }}>
              {t("now:", "nay:", "kini:")}
            </span>
            <span style={{ color: "var(--ink)" }}>{c.now}</span>
          </div>
          {c.editor && (
            <div className="text-mute-2 mono" style={{ fontSize: 11, marginTop: 8 }}>
              {t("Signed off by", "Duyệt bởi", "Disetujui oleh")} {c.editor}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function TrustContent({ slug, corrections }: TrustContentProps) {
  const t = useT();

  interface TrustPageContent {
    title: string;
    kicker: string;
    body: ReadonlyArray<readonly [heading: string, text: string]> | null;
  }

  const PAGES: Record<TrustSlug, TrustPageContent> = {
    editorial: {
      title: t("Editorial Standards", "Tiêu chuẩn biên tập", "Standar Editorial"),
      kicker: t(
        "Last updated · 12 May 2026",
        "Cập nhật lần cuối · 12/05/2026",
        "Diperbarui · 12 Mei 2026"
      ),
      body: [
        [
          t("How we report", "Cách chúng tôi đưa tin", "Cara kami meliput"),
          t(
            "We follow people, money, and policy across tech, in Asia and worldwide. Every story names sources where possible, links to primary documents, and discloses how the reporter knows what they know.",
            "Chúng tôi theo dõi con người, dòng tiền và chính sách trong công nghệ, ở châu Á và toàn cầu. Mỗi bài nêu nguồn khi có thể, dẫn tài liệu gốc, và công bố cách phóng viên biết điều họ viết.",
            "Kami mengikuti orang, uang, dan kebijakan di teknologi, di Asia dan dunia. Setiap artikel menyebut sumber bila memungkinkan, menautkan dokumen utama, dan mengungkap dari mana reporter tahu."
          ),
        ],
        [
          t("Independence", "Tính độc lập", "Independensi"),
          t(
            "DTW does not accept review units, free travel, or paid trips. Our editorial budget is separate from DTW Studio (sponsored work) and from membership revenue.",
            "DTW không nhận sản phẩm dùng thử, chuyến đi miễn phí hay tài trợ đi lại. Ngân sách biên tập tách biệt với DTW Studio (bài tài trợ) và doanh thu thành viên.",
            "DTW tidak menerima unit ulasan, perjalanan gratis, atau trip berbayar. Anggaran editorial terpisah dari DTW Studio (konten bersponsor) dan pendapatan keanggotaan."
          ),
        ],
        [
          t("Anonymous sources", "Nguồn ẩn danh", "Sumber anonim"),
          t(
            "We use them when necessary, never when convenient. Anonymity requires at least one editor's sign-off and a clear public-interest rationale.",
            "Chúng tôi dùng khi cần thiết, không bao giờ vì tiện lợi. Ẩn danh cần ít nhất một biên tập viên duyệt và lý do vì lợi ích công chúng rõ ràng.",
            "Kami memakainya bila perlu, bukan demi kemudahan. Anonimitas butuh persetujuan minimal satu editor dan alasan kepentingan publik yang jelas."
          ),
        ],
        [
          t("Corrections", "Đính chính", "Koreksi"),
          t(
            "We log every correction publicly with date, original text, and corrected text. See /trust/corrections.",
            "Chúng tôi ghi lại mọi đính chính công khai kèm ngày, văn bản gốc và văn bản đã sửa. Xem /trust/corrections.",
            "Kami mencatat setiap koreksi secara publik dengan tanggal, teks asli, dan teks yang dikoreksi. Lihat /trust/corrections."
          ),
        ],
        [
          t("Conflicts", "Xung đột lợi ích", "Konflik kepentingan"),
          t(
            "Reporters disclose holdings and prior employers on their bio page. We do not cover companies where a reporter has a direct financial interest without a second byline.",
            "Phóng viên công bố cổ phần và nơi làm cũ trên trang tiểu sử. Chúng tôi không đưa tin về công ty mà phóng viên có lợi ích tài chính trực tiếp nếu không có đồng tác giả.",
            "Reporter mengungkap kepemilikan dan mantan pemberi kerja di halaman bio. Kami tidak meliput perusahaan di mana reporter punya kepentingan finansial langsung tanpa penulis kedua."
          ),
        ],
      ],
    },
    // KNOWN GAP (invariant #5): AI-assisted inline disclosure was removed by
    // product decision 2026-06-05, but this policy copy still describes the
    // 'AI-assisted' label. Left intentionally unsynced per task instruction —
    // do NOT reinforce or re-add AI badge UI. Reconcile when the policy lands.
    ai: {
      title: t("AI Disclosure", "Công bố AI", "Pengungkapan AI"),
      kicker: t(
        "What 'AI-assisted' means in our newsroom",
        "'Có hỗ trợ AI' nghĩa là gì trong toà soạn",
        "Arti 'dibantu AI' di ruang redaksi kami"
      ),
      body: [
        [
          t("Use cases we allow", "Trường hợp được phép", "Penggunaan yang kami izinkan"),
          t(
            "Translation, transcription, summarisation of public documents, search-style retrieval, and proof-reading. Always reviewed by a human reporter before publication.",
            "Dịch, gỡ băng, tóm tắt tài liệu công khai, tìm kiếm và soát lỗi. Luôn được phóng viên là người thật kiểm tra trước khi đăng.",
            "Terjemahan, transkripsi, ringkasan dokumen publik, pencarian, dan proofreading. Selalu ditinjau reporter manusia sebelum terbit."
          ),
        ],
        [
          t("Use cases we don't", "Trường hợp không dùng", "Yang tidak kami lakukan"),
          t(
            "Generative writing of body copy, generative image creation, fabricated quotes, or unsourced claims pulled from a model.",
            "Tạo sinh nội dung bài, tạo sinh hình ảnh, trích dẫn bịa đặt hay tuyên bố không nguồn lấy từ mô hình.",
            "Penulisan generatif badan artikel, pembuatan gambar generatif, kutipan fiktif, atau klaim tanpa sumber dari model."
          ),
        ],
        [
          t("Labels", "Nhãn", "Label"),
          t(
            "Articles that use AI for any allowed task carry an 'AI-assisted' label at the top, middle, and bottom of the article. The label cannot be turned off.",
            "Bài dùng AI cho bất kỳ tác vụ được phép nào đều mang nhãn 'Có hỗ trợ AI' ở đầu, giữa và cuối. Không thể tắt nhãn này.",
            "Artikel yang memakai AI untuk tugas yang diizinkan membawa label 'dibantu AI' di atas, tengah, dan bawah. Label tidak bisa dimatikan."
          ),
        ],
        [
          t("Models", "Mô hình", "Model"),
          t(
            "We use commercial APIs from major providers, plus an internal translation pipeline. No reader data trains any third-party model.",
            "Chúng tôi dùng API thương mại từ các nhà cung cấp lớn cùng quy trình dịch nội bộ. Không dữ liệu độc giả nào huấn luyện mô hình bên thứ ba.",
            "Kami memakai API komersial dari penyedia besar, plus pipeline terjemahan internal. Tidak ada data pembaca yang melatih model pihak ketiga."
          ),
        ],
        [
          t("Human accountability", "Trách nhiệm của con người", "Akuntabilitas manusia"),
          t(
            "Every byline is a human. Every fact is human-verified. If something is wrong, a human is responsible.",
            "Mỗi tên tác giả là một con người. Mọi dữ kiện đều do người kiểm chứng. Nếu có sai sót, một con người chịu trách nhiệm.",
            "Setiap byline adalah manusia. Setiap fakta diverifikasi manusia. Jika ada yang salah, manusia bertanggung jawab."
          ),
        ],
      ],
    },
    corrections: {
      title: t("Corrections", "Đính chính", "Koreksi"),
      kicker: t(
        "Public log · most recent first",
        "Nhật ký công khai · mới nhất trước",
        "Log publik · terbaru dulu"
      ),
      body: null,
    },
    transparency: {
      title: t("Transparency Report", "Báo cáo minh bạch", "Laporan Transparansi"),
      kicker: t("Year one · inaugural", "Năm đầu tiên · khởi đầu", "Tahun pertama · perdana"),
      body: [
        [
          t("Coming soon", "Sắp ra mắt", "Segera hadir"),
          t(
            "Our first transparency report — headcount, revenue mix, government requests, removed posts, and newsletter deliverability — will be published once we have a full reporting period to draw on. First report drops Q1 2027.",
            "Báo cáo minh bạch đầu tiên của chúng tôi — nhân sự, cơ cấu doanh thu, yêu cầu từ chính phủ, bài đã gỡ và khả năng gửi bản tin — sẽ được công bố khi chúng tôi có trọn một kỳ báo cáo. Báo cáo đầu tiên ra mắt quý 1 năm 2027.",
            "Laporan transparansi pertama kami — jumlah staf, komposisi pendapatan, permintaan pemerintah, posting yang dihapus, dan keterkiriman newsletter — akan diterbitkan setelah kami memiliki satu periode pelaporan penuh. Laporan pertama terbit Q1 2027."
          ),
        ],
      ],
    },
    sponsored: {
      title: t(
        "Sponsored & Affiliate Policy",
        "Chính sách tài trợ & affiliate",
        "Kebijakan Sponsor & Afiliasi"
      ),
      kicker: t(
        "DTW Studio and review rules",
        "Quy tắc DTW Studio và đánh giá",
        "Aturan DTW Studio dan ulasan"
      ),
      body: [
        [
          t("DTW Studio", "DTW Studio", "DTW Studio"),
          t(
            "Sponsored content is produced by a separate studio team. Articles carry a yellow background, a 'Paid Partner' label, and a top/middle/end disclosure that cannot be turned off.",
            "Nội dung tài trợ do nhóm studio riêng sản xuất. Bài có nền vàng, nhãn 'Đối tác trả phí', và công bố ở đầu/giữa/cuối không thể tắt.",
            "Konten bersponsor diproduksi tim studio terpisah. Artikel berlatar kuning, berlabel 'Mitra Berbayar', dan pengungkapan atas/tengah/akhir yang tak bisa dimatikan."
          ),
        ],
        [
          t("What sponsors can do", "Nhà tài trợ được làm gì", "Yang boleh dilakukan sponsor"),
          t(
            "Choose a topic and review for factual accuracy of their own product. Approve images of their facilities.",
            "Chọn chủ đề và rà soát độ chính xác về sản phẩm của họ. Duyệt hình ảnh cơ sở của họ.",
            "Memilih topik dan memeriksa akurasi fakta produk mereka sendiri. Menyetujui gambar fasilitas mereka."
          ),
        ],
        [
          t(
            "What sponsors cannot do",
            "Nhà tài trợ không được làm gì",
            "Yang tidak boleh dilakukan sponsor"
          ),
          t(
            "Approve or edit copy that names competitors. Choose pull-quotes. Mandate calls-to-action. Run beside any newsroom story.",
            "Duyệt hay sửa nội dung nhắc đối thủ. Chọn trích dẫn nổi bật. Bắt buộc kêu gọi hành động. Đặt cạnh bài của toà soạn.",
            "Menyetujui atau menyunting teks yang menyebut pesaing. Memilih kutipan. Mewajibkan ajakan bertindak. Tampil di samping artikel redaksi."
          ),
        ],
        [
          t("Affiliate links", "Liên kết affiliate", "Tautan afiliasi"),
          t(
            "Some product reviews carry affiliate links. They are marked with a $ icon and a tooltip on hover. Commission rates and partners are listed in our transparency report.",
            "Một số bài đánh giá có liên kết affiliate, được đánh dấu bằng biểu tượng $ và chú thích khi rê chuột. Tỷ lệ hoa hồng và đối tác có trong báo cáo minh bạch.",
            "Beberapa ulasan produk memuat tautan afiliasi, ditandai ikon $ dan tooltip saat hover. Tarif komisi dan mitra ada di laporan transparansi."
          ),
        ],
        [
          t("Refusals", "Từ chối", "Penolakan"),
          t(
            "We have declined paid placements from 4 partners in the last 12 months over disclosure disagreements.",
            "Chúng tôi đã từ chối vị trí trả phí từ 4 đối tác trong 12 tháng qua do bất đồng về công bố.",
            "Kami menolak penempatan berbayar dari 4 mitra dalam 12 bulan terakhir karena ketidaksepakatan pengungkapan."
          ),
        ],
      ],
    },
  };

  const page = PAGES[slug];

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="r-sidebar" style={{ display: "grid", gap: 48 }}>
        <nav style={{ position: "sticky", top: 160, alignSelf: "flex-start" }}>
          <div
            className="upper text-mute"
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: ".14em",
              marginBottom: 12,
              textTransform: "uppercase",
            }}
          >
            {t("Trust & Transparency", "Tin cậy & Minh bạch", "Kepercayaan & Transparansi")}
          </div>
          {ORDER.map((k) => (
            <Link
              key={k}
              href={`/trust/${k}`}
              aria-current={slug === k ? "page" : undefined}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 10px",
                background: slug === k ? "var(--surface-2)" : "transparent",
                borderRadius: 4,
                fontSize: 13,
                color: slug === k ? "var(--ink)" : "var(--muted)",
                fontWeight: slug === k ? 600 : 400,
                borderLeft:
                  slug === k ? "2px solid var(--accent)" : "2px solid transparent",
                textDecoration: "none",
              }}
            >
              {PAGES[k].title}
            </Link>
          ))}
        </nav>

        <article style={{ maxWidth: 720 }}>
          <div className="kicker" style={{ marginBottom: 8 }}>
            {page.kicker}
          </div>
          <h1
            className="serif"
            style={{
              margin: "0 0 28px",
              fontSize: "clamp(30px, 8vw, 48px)",
              fontWeight: 650,
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
            }}
          >
            {page.title}
          </h1>

          {slug === "corrections" ? (
            <CorrectionsLog items={corrections} />
          ) : (
            <div style={{ fontFamily: "var(--font-serif)" }}>
              {page.body?.map(([h, text]) => (
                <section key={h} style={{ marginBottom: 32 }}>
                  <h2
                    style={{
                      margin: "0 0 8px",
                      fontSize: 22,
                      fontWeight: 650,
                      letterSpacing: "-0.01em",
                      color: "var(--ink)",
                    }}
                  >
                    {h}
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 17,
                      lineHeight: 1.6,
                      color: "var(--ink-2)",
                    }}
                  >
                    {text}
                  </p>
                </section>
              ))}
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
