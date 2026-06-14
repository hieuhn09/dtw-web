"use client";

// TODO: metadata — add generateMetadata once these client policy pages move
// to a server shell. For now the trilingual copy lives client-side via useT.

import Link from "next/link";
import { useParams } from "next/navigation";
import { useT } from "@/lib/i18n";

type LegalSlug = "privacy" | "terms" | "cookies" | "gdpr";

interface LegalPageContent {
  title: string;
  kicker: string;
  intro: string;
  body: ReadonlyArray<readonly [heading: string, text: string]>;
}

function isLegalSlug(v: string): v is LegalSlug {
  return v === "privacy" || v === "terms" || v === "cookies" || v === "gdpr";
}

export default function LegalPage() {
  const t = useT();
  const params = useParams<{ slug: string }>();
  const raw = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const slug: LegalSlug = raw && isLegalSlug(raw) ? raw : "privacy";

  const updated = t(
    "Last updated · 1 June 2026",
    "Cập nhật lần cuối · 01/06/2026",
    "Diperbarui · 1 Juni 2026"
  );

  const PAGES: Record<LegalSlug, LegalPageContent> = {
    privacy: {
      title: t("Privacy Policy", "Chính sách quyền riêng tư", "Kebijakan Privasi"),
      kicker: updated,
      intro: t(
        "We built Dailytechwire to be read, not to be mined. This policy explains, in plain language, what we collect, why, and the control you keep over it. If anything here is unclear, write to info@dailytechwire.com and a person, not a bot, will answer.",
        "Chúng tôi xây Dailytechwire để được đọc, không phải để khai thác dữ liệu. Chính sách này giải thích bằng ngôn ngữ rõ ràng: chúng tôi thu thập gì, vì sao, và quyền kiểm soát bạn giữ. Nếu có gì chưa rõ, hãy viết tới info@dailytechwire.com, một con người, không phải bot, sẽ trả lời.",
        "Kami membangun Dailytechwire untuk dibaca, bukan untuk ditambang. Kebijakan ini menjelaskan dengan bahasa sederhana: apa yang kami kumpulkan, mengapa, dan kendali yang Anda pegang. Jika ada yang kurang jelas, tulis ke info@dailytechwire.com, manusia, bukan bot, yang akan menjawab."
      ),
      body: [
        [
          t("What we collect", "Những gì chúng tôi thu thập", "Apa yang kami kumpulkan"),
          t(
            "An email address when you create an account or subscribe to a newsletter. Basic reading activity, which stories you open, so we can sync your saves across devices and recommend better. Standard server logs (IP, browser) kept for 30 days for security. That is the whole list.",
            "Một địa chỉ email khi bạn tạo tài khoản hoặc đăng ký bản tin. Hoạt động đọc cơ bản, bạn mở bài nào, để đồng bộ mục đã lưu giữa các thiết bị và gợi ý tốt hơn. Nhật ký máy chủ tiêu chuẩn (IP, trình duyệt) giữ 30 ngày cho mục đích bảo mật. Đó là toàn bộ danh sách.",
            "Alamat email saat Anda membuat akun atau berlangganan newsletter. Aktivitas baca dasar, artikel mana yang Anda buka, agar simpanan tersinkron antarperangkat dan rekomendasi lebih baik. Log server standar (IP, peramban) disimpan 30 hari untuk keamanan. Itu seluruh daftarnya."
          ),
        ],
        [
          t("What we never do", "Những gì chúng tôi không bao giờ làm", "Yang tak pernah kami lakukan"),
          t(
            "We do not sell your data. We do not share your reading history with advertisers, data brokers, or platforms. We do not run third-party ad networks or tracking pixels. We do not build shadow profiles of people who are not logged in.",
            "Chúng tôi không bán dữ liệu của bạn. Không chia sẻ lịch sử đọc với nhà quảng cáo, môi giới dữ liệu hay nền tảng. Không chạy mạng quảng cáo bên thứ ba hay pixel theo dõi. Không dựng hồ sơ ngầm về những người chưa đăng nhập.",
            "Kami tidak menjual data Anda. Kami tidak membagikan riwayat baca ke pengiklan, broker data, atau platform. Kami tidak menjalankan jaringan iklan pihak ketiga atau piksel pelacak. Kami tidak membangun profil bayangan atas orang yang belum masuk."
          ),
        ],
        [
          t("How we use it", "Cách chúng tôi sử dụng", "Cara kami memakainya"),
          t(
            "To keep you signed in, deliver the newsletters you asked for, recommend stories on your followed beats, and understand, in aggregate, which journalism resonates. Analytics are first-party and self-hosted; no usage data leaves our infrastructure.",
            "Để giữ bạn đăng nhập, gửi các bản tin bạn yêu cầu, gợi ý bài theo chủ đề bạn theo dõi, và hiểu, ở mức tổng hợp, mảng nội dung nào được đón nhận. Phân tích là first-party và tự lưu trữ; không dữ liệu sử dụng nào rời khỏi hạ tầng của chúng tôi.",
            "Untuk menjaga sesi Anda, mengirim newsletter yang Anda minta, merekomendasikan artikel pada rubrik yang Anda ikuti, dan memahami, secara agregat, jurnalisme mana yang beresonansi. Analitik bersifat first-party dan self-hosted; tak ada data penggunaan keluar dari infrastruktur kami."
          ),
        ],
        [
          t("Your rights", "Quyền của bạn", "Hak Anda"),
          t(
            "You can export everything we hold on you, correct it, or delete your account outright, from your account settings, with no email required and no retention tricks. Deletion is permanent and processed within 30 days.",
            "Bạn có thể xuất toàn bộ dữ liệu chúng tôi giữ về bạn, sửa, hoặc xoá hẳn tài khoản, ngay trong phần cài đặt, không cần email, không chiêu giữ chân. Việc xoá là vĩnh viễn và xử lý trong vòng 30 ngày.",
            "Anda dapat mengekspor semua data Anda, memperbaikinya, atau menghapus akun sepenuhnya, dari pengaturan akun, tanpa perlu email dan tanpa trik retensi. Penghapusan bersifat permanen dan diproses dalam 30 hari."
          ),
        ],
        [
          t("Where your data lives", "Dữ liệu của bạn được lưu ở đâu", "Di mana data Anda berada"),
          t(
            "On servers in Singapore, operated under our control. When the law of your country gives you stronger protections than ours, we apply the stronger standard. Questions about a specific jurisdiction go to info@dailytechwire.com.",
            "Trên máy chủ tại Singapore, do chúng tôi vận hành. Khi luật nước bạn cho bạn mức bảo vệ mạnh hơn của chúng tôi, chúng tôi áp dụng chuẩn cao hơn. Câu hỏi về một khu vực pháp lý cụ thể, gửi tới info@dailytechwire.com.",
            "Di server di Singapura, dioperasikan di bawah kendali kami. Bila hukum negara Anda memberi perlindungan lebih kuat dari kami, kami menerapkan standar yang lebih kuat. Pertanyaan tentang yurisdiksi tertentu kirim ke info@dailytechwire.com."
          ),
        ],
      ],
    },
    terms: {
      title: t("Terms of Service", "Điều khoản dịch vụ", "Ketentuan Layanan"),
      kicker: updated,
      intro: t(
        "These terms set out the agreement between you and Asia Press Centre Group (APCG) when you use dailytechwire. We have kept them short and readable on purpose. Using the site means you accept them.",
        "Các điều khoản này quy định thoả thuận giữa bạn và Asia Press Centre Group (APCG) khi bạn dùng dailytechwire. Chúng tôi cố ý giữ chúng ngắn gọn và dễ đọc. Việc sử dụng trang đồng nghĩa bạn chấp nhận chúng.",
        "Ketentuan ini mengatur perjanjian antara Anda dan Asia Press Centre Group (APCG) saat memakai dailytechwire. Kami sengaja membuatnya ringkas dan mudah dibaca. Menggunakan situs berarti Anda menerimanya."
      ),
      body: [
        [
          t("Using the site", "Sử dụng trang", "Menggunakan situs"),
          t(
            "You may read, share links to, and quote our journalism with attribution. You may not republish full articles, scrape the site at scale, or train commercial models on our content without a written licence. Reasonable personal use is always fine.",
            "Bạn được đọc, chia sẻ liên kết và trích dẫn nội dung của chúng tôi kèm ghi nguồn. Bạn không được đăng lại toàn bộ bài, thu thập dữ liệu quy mô lớn, hay huấn luyện mô hình thương mại trên nội dung của chúng tôi nếu không có giấy phép bằng văn bản. Việc dùng cá nhân hợp lý luôn được chấp nhận.",
            "Anda boleh membaca, membagikan tautan, dan mengutip jurnalisme kami dengan atribusi. Anda tidak boleh menerbitkan ulang artikel penuh, menyalin situs dalam skala besar, atau melatih model komersial pada konten kami tanpa lisensi tertulis. Penggunaan pribadi yang wajar selalu boleh."
          ),
        ],
        [
          t("Your account", "Tài khoản của bạn", "Akun Anda"),
          t(
            "You are responsible for activity under your account and for keeping your sign-in secure. Tell us promptly if you suspect unauthorised access. Accounts are for individuals; team and institutional access is available separately.",
            "Bạn chịu trách nhiệm cho hoạt động dưới tài khoản của mình và giữ an toàn thông tin đăng nhập. Hãy báo ngay nếu nghi ngờ bị truy cập trái phép. Tài khoản dành cho cá nhân; truy cập theo nhóm và tổ chức có gói riêng.",
            "Anda bertanggung jawab atas aktivitas di akun Anda dan menjaga keamanan login. Beri tahu kami segera jika curiga ada akses tak sah. Akun untuk individu; akses tim dan institusi tersedia terpisah."
          ),
        ],
        [
          t("Our content", "Nội dung của chúng tôi", "Konten kami"),
          t(
            "The journalism, data visualisations, and design on Dailytechwire are owned by Asia Press Centre Group (APCG) or used under licence. Trademarks and the masthead remain ours. We license selected content for syndication, write to partnership@dailytechwire.com.",
            "Nội dung báo chí, đồ hoạ dữ liệu và thiết kế trên Dailytechwire thuộc sở hữu của Asia Press Centre Group (APCG) hoặc dùng theo giấy phép. Thương hiệu và măng-sét vẫn thuộc về chúng tôi. Chúng tôi cấp phép một số nội dung để đăng lại, viết tới partnership@dailytechwire.com.",
            "Jurnalisme, visualisasi data, dan desain di Dailytechwire dimiliki Asia Press Centre Group (APCG) atau dipakai berdasarkan lisensi. Merek dagang dan masthead tetap milik kami. Kami melisensikan konten tertentu untuk sindikasi, tulis ke partnership@dailytechwire.com."
          ),
        ],
        [
          t("Accuracy & corrections", "Độ chính xác & đính chính", "Akurasi & koreksi"),
          t(
            "We work hard to be accurate and we correct mistakes openly. The site is provided in good faith but without warranty that it is error-free or always available. Nothing we publish is investment, legal, or professional advice.",
            "Chúng tôi nỗ lực để chính xác và đính chính sai sót một cách công khai. Trang được cung cấp với thiện chí nhưng không bảo đảm hoàn toàn không lỗi hay luôn sẵn sàng. Không nội dung nào chúng tôi đăng là tư vấn đầu tư, pháp lý hay chuyên môn.",
            "Kami berupaya akurat dan mengoreksi kesalahan secara terbuka. Situs disediakan dengan itikad baik namun tanpa jaminan bebas galat atau selalu tersedia. Tak ada yang kami terbitkan merupakan nasihat investasi, hukum, atau profesional."
          ),
        ],
        [
          t("Changes & contact", "Thay đổi & liên hệ", "Perubahan & kontak"),
          t(
            "If we change these terms materially, we will say so on this page and, for account holders, by email. Continued use after a change means acceptance. Governing law is Singapore. Questions: info@dailytechwire.com.",
            "Nếu chúng tôi thay đổi các điều khoản này một cách đáng kể, chúng tôi sẽ thông báo trên trang này và, với chủ tài khoản, qua email. Tiếp tục sử dụng sau thay đổi nghĩa là chấp nhận. Luật điều chỉnh là Singapore. Câu hỏi: info@dailytechwire.com.",
            "Jika kami mengubah ketentuan ini secara material, kami akan menyampaikannya di halaman ini dan, bagi pemilik akun, lewat email. Penggunaan berlanjut setelah perubahan berarti penerimaan. Hukum yang berlaku adalah Singapura. Pertanyaan: info@dailytechwire.com."
          ),
        ],
      ],
    },
    cookies: {
      title: t("Cookie Policy", "Chính sách cookie", "Kebijakan Cookie"),
      kicker: updated,
      intro: t(
        "Cookies are small files a site stores in your browser. We use as few as the site can function with, and none of them follow you anywhere else.",
        "Cookie là các tệp nhỏ một trang lưu trong trình duyệt của bạn. Chúng tôi dùng ít nhất có thể để trang vận hành, và không cái nào theo dõi bạn ở nơi khác.",
        "Cookie adalah berkas kecil yang disimpan situs di peramban Anda. Kami memakai sesedikit mungkin agar situs berfungsi, dan tak satu pun mengikuti Anda ke tempat lain."
      ),
      body: [
        [
          t("Essential cookies", "Cookie thiết yếu", "Cookie esensial"),
          t(
            "These keep you signed in, remember your language and light/dark preference, and protect against fraud. The site cannot work without them, so they are always on. They contain no advertising identifiers.",
            "Những cookie này giữ bạn đăng nhập, ghi nhớ ngôn ngữ và lựa chọn sáng/tối, và chống gian lận. Trang không thể hoạt động nếu thiếu chúng, nên luôn bật. Chúng không chứa định danh quảng cáo.",
            "Cookie ini menjaga sesi Anda, mengingat bahasa dan preferensi terang/gelap, serta melindungi dari penipuan. Situs tak bisa berjalan tanpanya, jadi selalu aktif. Tak ada pengenal iklan di dalamnya."
          ),
        ],
        [
          t("Analytics cookies", "Cookie phân tích", "Cookie analitik"),
          t(
            "A single first-party cookie helps us count reads and see which stories land, in aggregate. It is self-hosted, never shared, and you can decline it from the cookie bar without losing any features.",
            "Một cookie first-party duy nhất giúp chúng tôi đếm lượt đọc và xem bài nào được đón nhận, ở mức tổng hợp. Nó tự lưu trữ, không bao giờ chia sẻ, và bạn có thể từ chối từ thanh cookie mà không mất tính năng nào.",
            "Satu cookie first-party membantu kami menghitung pembacaan dan melihat artikel mana yang diterima, secara agregat. Self-hosted, tak pernah dibagikan, dan Anda bisa menolaknya dari bilah cookie tanpa kehilangan fitur."
          ),
        ],
        [
          t("What we don't set", "Những gì chúng tôi không đặt", "Yang tak kami pasang"),
          t(
            "No advertising cookies. No third-party trackers. No cross-site pixels from social networks. If you ever find a cookie on Dailytechwire that does not fit the two categories above, tell us, it is a bug, not a policy.",
            "Không cookie quảng cáo. Không trình theo dõi bên thứ ba. Không pixel xuyên trang từ mạng xã hội. Nếu bạn từng thấy một cookie trên Dailytechwire không thuộc hai nhóm trên, hãy báo chúng tôi, đó là lỗi, không phải chính sách.",
            "Tanpa cookie iklan. Tanpa pelacak pihak ketiga. Tanpa piksel lintas situs dari media sosial. Jika Anda menemukan cookie di Dailytechwire yang tak masuk dua kategori di atas, beri tahu kami, itu bug, bukan kebijakan."
          ),
        ],
        [
          t("Managing cookies", "Quản lý cookie", "Mengelola cookie"),
          t(
            "You can accept or decline analytics from the bar at the bottom of the screen, change your mind any time in account settings, or clear everything from your browser. Declining never paywalls a feature.",
            "Bạn có thể chấp nhận hoặc từ chối phân tích từ thanh ở cuối màn hình, đổi ý bất cứ lúc nào trong cài đặt tài khoản, hoặc xoá tất cả từ trình duyệt. Từ chối không bao giờ khoá một tính năng sau tường phí.",
            "Anda bisa menerima atau menolak analitik dari bilah di bawah layar, berubah pikiran kapan saja di pengaturan akun, atau menghapus semuanya dari peramban. Menolak tak pernah mengunci fitur di balik paywall."
          ),
        ],
      ],
    },
    gdpr: {
      title: t("GDPR & PDPA", "GDPR & PDPA", "GDPR & PDPA"),
      kicker: t(
        "Data protection · your rights",
        "Bảo vệ dữ liệu · quyền của bạn",
        "Perlindungan data · hak Anda"
      ),
      intro: t(
        "Whether you read us from Europe under the GDPR, from Singapore under the PDPA, or from Vietnam under Nghị định 13/2023/NĐ-CP, the same principle holds: your data is yours. This page sets out the specific rights those laws give you and how to use them.",
        "Dù bạn đọc chúng tôi từ châu Âu theo GDPR, từ Singapore theo PDPA, hay từ Việt Nam theo Nghị định 13/2023/NĐ-CP, nguyên tắc vẫn là một: dữ liệu của bạn là của bạn. Trang này nêu các quyền cụ thể những luật đó trao cho bạn và cách sử dụng chúng.",
        "Baik Anda membaca dari Eropa di bawah GDPR, dari Singapura di bawah PDPA, atau dari Vietnam di bawah Nghị định 13/2023/NĐ-CP, prinsipnya sama: data Anda milik Anda. Halaman ini menjabarkan hak spesifik yang diberikan undang-undang itu dan cara memakainya."
      ),
      body: [
        [
          t("The rights you hold", "Các quyền bạn có", "Hak yang Anda miliki"),
          t(
            "Access a copy of your data, correct it, delete it, restrict or object to how it is used, and take it elsewhere in a portable format. You can exercise every one of these from your account settings, or by writing to us.",
            "Truy cập bản sao dữ liệu của bạn, sửa, xoá, hạn chế hoặc phản đối cách dùng, và mang nó đi nơi khác ở định dạng di động. Bạn có thể thực hiện từng quyền này trong cài đặt tài khoản, hoặc bằng cách viết cho chúng tôi.",
            "Mengakses salinan data Anda, memperbaikinya, menghapusnya, membatasi atau menolak penggunaannya, dan memindahkannya dalam format portabel. Anda bisa menjalankan tiap hak ini dari pengaturan akun, atau dengan menulis ke kami."
          ),
        ],
        [
          t("Our legal basis", "Cơ sở pháp lý của chúng tôi", "Dasar hukum kami"),
          t(
            "We process your data on two grounds only: the contract that lets us run your account and send what you subscribed to, and a narrow legitimate interest in keeping the service secure and improving it in aggregate. We do not rely on bundled consent or 'legitimate interest' for advertising, because we do not advertise to you.",
            "Chúng tôi xử lý dữ liệu của bạn chỉ trên hai cơ sở: hợp đồng cho phép chúng tôi vận hành tài khoản và gửi những gì bạn đăng ký, và một lợi ích hợp pháp hẹp trong việc giữ dịch vụ an toàn và cải thiện ở mức tổng hợp. Chúng tôi không dựa vào đồng ý gộp hay 'lợi ích hợp pháp' cho quảng cáo, vì chúng tôi không quảng cáo tới bạn.",
            "Kami memproses data Anda atas dua dasar saja: kontrak yang memungkinkan kami menjalankan akun dan mengirim yang Anda langgani, serta kepentingan sah yang sempit untuk menjaga keamanan layanan dan meningkatkannya secara agregat. Kami tidak mengandalkan persetujuan terbundel atau 'kepentingan sah' untuk iklan, karena kami tidak beriklan kepada Anda."
          ),
        ],
        [
          t("Cross-border data", "Dữ liệu xuyên biên giới", "Data lintas batas"),
          t(
            "Your data is stored in Singapore. For readers in Vietnam, any transfer of personal data abroad follows the impact-assessment and notification requirements of Nghị định 13/2023/NĐ-CP; for readers in the EU, transfers rely on adequacy decisions or standard contractual clauses. Either way, the standard never drops below what your home law requires.",
            "Dữ liệu của bạn được lưu tại Singapore. Với độc giả ở Việt Nam, mọi việc chuyển dữ liệu cá nhân ra nước ngoài tuân theo yêu cầu đánh giá tác động và thông báo của Nghị định 13/2023/NĐ-CP; với độc giả ở EU, việc chuyển dựa trên quyết định đầy đủ hoặc điều khoản hợp đồng chuẩn. Dù thế nào, tiêu chuẩn không bao giờ thấp hơn luật quê hương bạn yêu cầu.",
            "Data Anda disimpan di Singapura. Untuk pembaca di Vietnam, setiap transfer data pribadi ke luar negeri mengikuti persyaratan penilaian dampak dan pemberitahuan Nghị định 13/2023/NĐ-CP; untuk pembaca di UE, transfer mengandalkan keputusan kecukupan atau klausul kontrak standar. Dengan cara apa pun, standarnya tak pernah turun di bawah yang dipersyaratkan hukum negara Anda."
          ),
        ],
        [
          t("Making a request", "Gửi yêu cầu", "Mengajukan permintaan"),
          t(
            "Email info@dailytechwire.com or use the export and deletion tools in your account. We respond within 30 days, usually far sooner, and we never charge for a reasonable request. We will verify your identity first, to protect you.",
            "Gửi email tới info@dailytechwire.com hoặc dùng công cụ xuất và xoá trong tài khoản. Chúng tôi phản hồi trong 30 ngày, thường nhanh hơn nhiều, và không bao giờ tính phí cho yêu cầu hợp lý. Chúng tôi sẽ xác minh danh tính trước, để bảo vệ bạn.",
            "Email info@dailytechwire.com atau gunakan alat ekspor dan penghapusan di akun Anda. Kami merespons dalam 30 hari, biasanya jauh lebih cepat, dan tak pernah memungut biaya untuk permintaan yang wajar. Kami akan memverifikasi identitas Anda dulu, demi melindungi Anda."
          ),
        ],
        [
          t("Complaints", "Khiếu nại", "Keluhan"),
          t(
            "If you believe we have mishandled your data, tell us first and we will try to put it right. You also have the right to complain to your local supervisory authority, the relevant DPA in the EU, the PDPC in Singapore, or the data-protection authority under Nghị định 13 in Vietnam.",
            "Nếu bạn tin chúng tôi đã xử lý sai dữ liệu của bạn, hãy báo chúng tôi trước và chúng tôi sẽ cố khắc phục. Bạn cũng có quyền khiếu nại với cơ quan giám sát địa phương, DPA liên quan ở EU, PDPC ở Singapore, hoặc cơ quan bảo vệ dữ liệu theo Nghị định 13 tại Việt Nam.",
            "Jika Anda yakin kami salah menangani data Anda, beri tahu kami dulu dan kami akan berupaya memperbaikinya. Anda juga berhak mengadu ke otoritas pengawas setempat, DPA terkait di UE, PDPC di Singapura, atau otoritas perlindungan data berdasarkan Nghị định 13 di Vietnam."
          ),
        ],
        [
          t("Our Data Protection Officer", "Cán bộ bảo vệ dữ liệu", "Petugas Perlindungan Data"),
          t(
            "A named DPO oversees how we handle personal data and is your direct line for anything on this page. Reach them at info@dailytechwire.com.",
            "Một DPO được chỉ định giám sát cách chúng tôi xử lý dữ liệu cá nhân và là đầu mối trực tiếp của bạn cho mọi điều trên trang này. Liên hệ tại info@dailytechwire.com.",
            "Seorang DPO mengawasi cara kami menangani data pribadi dan menjadi saluran langsung Anda untuk apa pun di halaman ini. Hubungi di info@dailytechwire.com."
          ),
        ],
      ],
    },
  };

  const page = PAGES[slug];

  const navItems: ReadonlyArray<readonly [LegalSlug, string]> = [
    ["privacy", t("Privacy", "Quyền riêng tư", "Privasi")],
    ["terms", t("Terms", "Điều khoản", "Ketentuan")],
    ["cookies", t("Cookies", "Cookie", "Cookie")],
    ["gdpr", t("GDPR / PDPA", "GDPR / PDPA", "GDPR / PDPA")],
  ];

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
            {t("Legal", "Pháp lý", "Legal")}
          </div>
          {navItems.map(([k, label]) => (
            <Link
              key={k}
              href={`/legal/${k}`}
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
              {label}
            </Link>
          ))}
          <div
            style={{
              marginTop: 24,
              padding: 14,
              background: "var(--surface)",
              border: "1px solid var(--hair)",
              borderRadius: 6,
            }}
          >
            <div className="text-mute" style={{ fontSize: 12, lineHeight: 1.5 }}>
              {t(
                "Questions about your data?",
                "Câu hỏi về dữ liệu của bạn?",
                "Pertanyaan soal data Anda?"
              )}
            </div>
            <a
              href="mailto:info@dailytechwire.com"
              className="linkish mono"
              style={{
                fontSize: 12,
                color: "var(--accent)",
                display: "inline-block",
                marginTop: 6,
              }}
            >
              info@dailytechwire.com
            </a>
          </div>
        </nav>

        <article style={{ maxWidth: 720 }}>
          <div className="kicker" style={{ marginBottom: 8 }}>
            {page.kicker}
          </div>
          <h1
            className="serif"
            style={{
              margin: "0 0 20px",
              fontSize: "clamp(30px, 8vw, 48px)",
              fontWeight: 650,
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
            }}
          >
            {page.title}
          </h1>
          <p
            className="serif"
            style={{
              margin: "0 0 36px",
              fontSize: 19,
              lineHeight: 1.6,
              color: "var(--ink-2)",
            }}
          >
            {page.intro}
          </p>
          <div style={{ fontFamily: "var(--font-serif)" }}>
            {page.body.map(([h, text]) => (
              <section key={h} style={{ marginBottom: 32 }}>
                <h2
                  style={{
                    margin: "0 0 8px",
                    fontSize: 22,
                    fontWeight: 600,
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
                    lineHeight: 1.65,
                    color: "var(--ink-2)",
                  }}
                >
                  {text}
                </p>
              </section>
            ))}
          </div>
          <div
            className="text-mute mono"
            style={{
              marginTop: 24,
              paddingTop: 20,
              borderTop: "1px solid var(--hair)",
            }}
          >
            <span style={{ fontSize: 11 }}>
              {t(
                "Asia Press Centre Group (APCG) · Singapore",
                "Asia Press Centre Group (APCG) · Singapore",
                "Asia Press Centre Group (APCG) · Singapura"
              )}
            </span>
          </div>
        </article>
      </div>
    </div>
  );
}
