# Rebrand: Dailytechwire → Opentechwire — Tài liệu nghiên cứu tham chiếu

Ngày: 2026-09-08
Trạng thái: **RESEARCH — chưa implement gì.** Không có thứ gì trong tài liệu này đã được thực thi. Đây là bản inventory làm việc cho phase PLAN sau này.
Phương pháp: 9 lượt quét bề mặt song song trên `dtw-web` + 1 phân tích chiến lược đặt tên, mỗi lượt được kiểm chứng lại bằng một pass adversarial mở từng file được trích dẫn; sau đó một critic về độ đầy đủ tìm ra những bề mặt chưa quét; rồi 4 lượt quét bù khoảng trống phủ `content-engine`, nhóm repo anh em của APCG, các mâu thuẫn chéo giữa các bề mặt, và các workstream vận hành nằm ngoài repo. Mọi khẳng định bên dưới đều dẫn kèm một đường dẫn file. Những gì chưa kiểm chứng được liệt kê ở §8.

## Tóm tắt điều hành

Việc đổi tên publication **không phải là một cú find-and-replace trong repo**. Chỉ riêng trong `dtw-web`, brand xuất hiện ở **168 file được track** (`git grep -lniE "dailytechwire|\bdtw\b|dtw-|@dtw/"` → 168; 989 dòng khớp, không tính thư mục `data-exports/` chưa được track), rải trên code, metadata sinh tự động, sáu asset nhị phân mà grep không thấy được, sáu key browser-storage, và một tên schema Postgres. Ngoài repo này, brand còn nằm sâu trong **6 service khác**: `content-engine` (228 file — trong đó có một system prompt LLM ghi thẳng chuỗi "At DailyTechWire, we've tracked…" vào body của bài đã publish), `apcg-cms` (28 file + dòng tenant đang chạy live), `media-engine` (45 hit, sở hữu union `SiteCode`), `brief-asia-web`, `wad-web`, `APCG-web`, cộng thêm một project Vercel độc lập không version-control ở `/home/hieunc/Code/DTW`.

Khoảng **630 dòng finding** được tạo ra qua 12 lượt quét. Sau khi khử trùng lặp theo cặp file+dòng, tập làm việc còn **~400 touchpoint riêng biệt**, trong đó **~95 cái rủi ro cao** (làm hỏng production, mất SEO, hỏng auth hoặc deliverability email, hoặc phá vỡ một hợp đồng với bên ngoài). Rủi ro chính không nằm ở số lượng — mà ở chỗ **năm trong số các kiểu hỏng có hậu quả nặng nhất đều diễn ra âm thầm**: một Vercel cron trỏ vào route đã đổi tên, một repo variable của GitHub Actions fail closed, một allowlist CORS làm trống rỗng cả site, một OAuth redirect URI chỉ hỏng sign-in ở lần dùng đầu tiên, và một chỉnh sửa snapshot `drizzle-kit` phát ra `DROP SCHEMA` lên database auth dùng chung.

Ba thứ phải chốt trước khi sửa bất kỳ file nào:

1. **Casing.** Ba kiểu casing đang sống *ngay hôm nay* và sự chia tách này mang tính kiến trúc chứ không phải tình cờ: `DailyTechWire` (35 dòng trong `apps/`+`packages/`, toàn bộ bề mặt máy đọc/SEO/transactional), `Dailytechwire` (31 dòng, toàn bộ copy biên tập do người viết), `dailytechwire` viết thường (59 dòng, logo lockup và địa chỉ email). Nó đã ship ra ngoài trong trạng thái hỏng — `apps/web/src/app/(reader)/dashboards/[[...sub]]/page.tsx:27` trả về `"AI Leaderboard | Dashboards | Dailytechwire"`, rồi template `"%s – DailyTechWire"` ở `apps/web/src/app/layout.tsx:37` bọc chuỗi đó lại, render cả hai casing trong cùng một `<title>`.
2. **Tên miền.** `opentechwire.com` **đã được đăng ký sẵn trên chính tài khoản DNS của APCG** — `dig NS opentechwire.com` trả về `ns-a1/a2/a3.tenten.vn`, đúng bộ nameserver của `dailytechwire.com`, SOA serial `1778496045` (= 2026-05-11), có MX, không có bản ghi A (đang parked). Namespace đích thì sạch: không có lần xuất hiện nào của `opentechwire`/`otw` ở bất cứ đâu trong repo.
3. **Google manual action.** `content-engine/admin/src/lib/byline-policy.ts:256` ghi lại `site đang bị Google manual action`. Bản export GSC ở gốc repo cho thấy số trang được index sụp từ 108 → 95 → **26** vào ngày 2026-07-11, với 170 URL nằm trong "Crawled – currently not indexed". Migrate khi manual action chưa được gỡ đồng nghĩa mang nó theo sang tên miền mới.

---

## 2. Các quyết định cần bạn chốt

Mỗi mục đều có một mặc định đề xuất kèm lý do. Trả lời "yes hết" là một lập trường nhất quán và bảo vệ được.

| # | Quyết định | Mặc định đề xuất | Lý do |
|---|---|---|---|
| **D1** | **Tên hiển thị chuẩn + casing** | `Opentechwire` cho toàn bộ văn xuôi và metadata; `opentechwire` viết thường **chỉ** dùng bên trong wordmark/OG lockup; `OTW` viết hoa hết cho monogram. **Tuyệt đối không** dùng `OpenTechWire`. | Sentence case là dạng duy nhất nhất quán với một logo lockup viết thường, khớp với các trang biên tập do người viết, và thoả finding về việc không dùng CamelCase. Đồng thời sửa luôn tình trạng ba kiểu casing đã tồn tại từ trước (`process/context/uxui/all-uxui.md:152` ghi `DailyTechWire`; `process/context/all-context.md:18` ghi `Dailytechwire`). |
| **D2** | **Dạng viết tắt / monogram** | `OTW` | Ba glyph mono → ba glyph mono, thay thẳng vào `apps/web/src/app/icon.svg:2,4` và `apps/web/src/components/wordmark.tsx:28` mà không phải đổi hình học. Namespace đã kiểm tra là sạch. Lưu ý: "OTW" trong khẩu ngữ đọc thành "on the way" — nếu không chấp nhận được thì phương án dự phòng là viết đủ tên ra trong copy cho độc giả, nhưng khi đó monogram không còn là chuyện chữ nữa mà thành một cuộc redesign. |
| **D3** | **Tên miền: chuyển sang `opentechwire.com`?** | **Có, chuyển** — nhưng chỉ *sau khi* xác nhận Google manual action đã được gỡ. | Tên miền đã nắm sẵn trong tay. Bản export GSC (`dailytechwire.com-Coverage-2026-08-06.zip`) cho thấy 26 trang được index với 0–17 impression/ngày — gần như không còn organic equity nào để mất, nên đây gần như là thời điểm rẻ nhất có thể. Càng để lâu càng đắt. |
| **D4** | **Giữ tên miền cũ để redirect?** | **Có, giữ vô thời hạn** — để `dailytechwire.com` và `www.dailytechwire.com` vẫn gắn với project Vercel, redirect 301 giữ nguyên path sang `https://www.opentechwire.com/:path*`, trong 12+ tháng. | Không tốn gì; bỏ một host đi là biến mọi inbound link và mọi URL feed của người đăng ký thành 404. Lưu ý các rule theo host phải đặt **đầu tiên** trong `redirects()` của `apps/web/next.config.ts` — năm rule theo path hiện có không phân biệt host, nếu không sẽ tạo ra một chuỗi redirect hai chặng xuyên tên miền. |
| **D5** | **Canonical host: apex hay www?** | **www** — `https://www.opentechwire.com`. | Chuyện này do git quyết chứ không phải ý kiến cá nhân: commit `24bf005` (2026-07-17, subject đúng chữ "canonical host") đặt www ở **cả hai** chỗ `apps/web/next.config.ts:38-45` và `apps/web/src/lib/metadata.ts:26,30`, đúng một ngày *sau* khi `ca9f1fd` (2026-07-16) ghi giá trị apex vào `apps/web/.env.example:12`. Các tham chiếu apex trong `.env.example:12` và trong `process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md:160,511,901,1038` là đồ cũ còn sót. |
| **D6** | **Đổi tên package scope `@dtw/*`?** | **Không — hoãn.** Ghi lại như một quyết định hoãn có chủ đích. | 128 dòng trải trên 61 file được track (đã kiểm chứng). Cả ba package đều là `"private": true, "version": "0.0.0"` — không có gì được publish, nên rủi ro hợp đồng với bên ngoài bằng không, nhưng lợi ích mà độc giả thấy được cũng bằng không. Gộp nó vào đợt rebrand chỉ tạo xáo trộn cho mọi import mà chẳng đổi lấy được gì. |
| **D7** | **Đổi tên repo / thư mục `dtw-web`?** | **Đổi tên repo trên GitHub** (`hieuhn09/dtw-web` → `otw-web`); **chưa đổi tên thư mục local.** | GitHub redirect vĩnh viễn đường dẫn cũ cho cả web lẫn git remote. Đổi tên thư mục local sẽ làm hỏng 4 đường dẫn tuyệt đối hardcode: `data-exports/export-image-research.cjs:1,5`, `data-exports/README.md:82`, và một chỗ xuyên repo là `content-engine/scripts/social-render-poc.ts:78`. |
| **D8** | **Tagline "Tech Intelligence, Wired Daily"** | **Thay.** Đề xuất: `Tech Intelligence, Openly Wired`. | "Wired **Daily**" là lối chơi chữ dựa trên tên cũ và không còn ăn khớp nữa. Sâu hơn: `design/project/uploads/DTW-Brand-Guideline-v1.0.pdf` §1.3 lấy "Daily Pulse" làm *khái niệm brand cốt lõi* — chấm pulse trong logo tồn tại là vì chữ "Daily". Đây là quyết định ở tầng nhận diện, không phải một lần sửa câu chữ. Chi phí: 9 chỗ trong code cộng với việc render lại `apps/web/public/og-default.png`. Nó sửa đổi invariant #11. |
| **D9** | **Chữ "Open" có làm đổi câu chuyện paywall / Pro không?** | **Không đổi cơ chế; đánh dấu lại phần copy.** | Invariant #4 (soft meter, không bao giờ chặn cứng) vốn đã tương thích với một nhận diện "Open". Nhưng `apps/web/src/components/article/paywall.tsx:46` ghi `"Free limit reached"` và phần copy bắt nguồn từ `article.jsx` có nhắc tới gói `DTW Pro` giá $12/tháng. Mức khẩn thấp: `apps/web/src/lib/paywall.ts:24` đang là `export const PAYWALL_ENABLED = false`, nên hôm nay chẳng có gì trong đó được render. Chốt trước khi bật flag. |
| **D10** | **Bộ màu brand có giữ nguyên không?** | **Có, giữ nguyên không đổi** (navy `#1B2A52`, terracotta `#D4623C`). | Miễn phí. Đổi màu sẽ lan xuống `apps/web/src/app/icon.svg`, 4 file icon PNG, `og-default.png`, các mã hex hardcode trong `apps/web/src/lib/email.ts:79`, 20 chỗ dùng `--brand-navy` trải trên 12 file, và ~46 giá trị hex hardcode trong `apps/web/src/components/cover-art.tsx` vốn cố tình đi vòng qua hệ thống token. Nó cũng sẽ âm thầm làm sai `brief-asia-web/DESIGN.md:115-116`, nơi nêu các mã hex của DTW như một anti-pattern cần tránh. |
| **D11** | **Đổi tên slug nội bộ `dtw`?** | **Không — đóng băng vĩnh viễn.** Ghi lại như một thứ legacy. | `apcg-cms/src/collections/Tenants.ts:57` nói thẳng ngay trong repo: *"Must match the content-engine registry id. Never change after launch."* Đây là join key xuyên 4 service, nó nằm sẵn trong 1,063 URL hero-image đang chạy live (`hero-images/dtw/2026/...`), nó làm key cho `filter_scores` JSONB trên mọi bài raw trong lịch sử, và `content-engine/admin/src/lib/publish-social.ts:59-61` **suy ra** `FB_PAGE_ID_DTW`/`LI_ORG_URN_DTW` từ nó bằng `toUpperCase()`. Đổi tên sẽ đẻ ra những lỗi âm thầm mà compiler không nhìn thấy. |
| **D12** | **Đổi tên schema Postgres `dtw_auth` / bucket R2 `dtw-media`?** | **Không — đóng băng cả hai.** | `dtw_auth` xuất hiện 47× trong một migration đã apply và được check hash (`packages/db/migrations/0000_dtw_auth_baseline.sql`) trên một Neon DB trung tâm **dùng chung**. Bucket R2 không thể đổi tên tại chỗ — đổi tên nghĩa là copy toàn bộ object cộng với viết lại mọi URL media đã lưu. Cả hai đều không phải thứ độc giả nhìn thấy. |
| **D13** | **Viết lại phần chữ của các bài đã publish?** | **Không với bài báo có byline; có với các brief do máy soạn.** | 5 dòng đã xác nhận trong `data-exports/articles_images.csv` (dòng 9, 116, 156, 2665, 3270) chứa nguyên văn `"At DailyTechWire, we've tracked…"` trong phần dek đã publish. Ngoài ra mọi body của Daily Brief đều kết thúc bằng `_Compiled by {byline} from {siteName} reporting._` (`content-engine/admin/src/lib/brief-payload.ts:243`) — một tập hit xác định được và liệt kê hết được. |
| **D14** | **Đổi tên sáu key browser-storage?** | **Có, đổi — *nếu* D3 là có.** | Chúng bị giới hạn theo origin (5 × `localStorage`; `dtw-read-count` là cookie đặt với `path=/` và **không** có `domain=`, tại `apps/web/src/lib/paywall.ts:84`), nên đổi host là mất sạch cả sáu bất kể tên là gì. Lập luận phản đối "đổi tên sẽ reset trạng thái của độc giả" mất hiệu lực khi đã chuyển tên miền, khiến việc đổi tên thành miễn phí. Nếu D3 là **không**, hoãn cả sáu. |
| **D15** | **Khai tử `/home/hieunc/Code/DTW`?** | **Có — xoá, đừng rebrand.** | Một bản `cp` không version-control của design bundle (`/home/hieunc/Code/DTW/.claude/settings.local.json:10-11` là bằng chứng), cũ tới hai thế hệ sản phẩm, và nó khẳng định những định danh pháp lý bịa ra: `© 2026 DailyTechWire Pte. Ltd. · Singapore (UEN 202612345A) · ISSN 2811-7XXX` (`src/footer.jsx:112`). Rebrand nó là mang một UEN và ISSN giả sang tên mới. |

**Hai mục không phải quyết định — chúng là những chỗ cần sửa ngay, độc lập với việc rebrand:**

- `apps/web/src/components/footer.tsx:234` render `© 2026 Dailytechwire · Singapore · Member, Trust Project` trên **mọi** trang đọc. `design/chats/chat1.md:375` cho thấy "Trust Project" là mục số một trong tám badge thành viên bịa ra mà `process/features/about-trust/_GUIDE.md:77` ghi lại là *"all fabricated, all removed"*. Thanh badge đã bị gỡ; dòng này bị bỏ sót. **Xoá mệnh đề đó.**
- `apps/web/src/app/(reader)/dashboards/[[...sub]]/page.tsx:27` gắn brand hai lần trong `<title>` của nó. Cho nó đi qua `buildMetadata` (việc này cũng sửa luôn phần canonical bị thiếu và block OG bị thiếu).

---

## 3. Blast radius

### 3.0 Tổng hợp theo surface

Số đếm là **số dòng finding thô của từng lượt quét**. Các surface chồng lấn nhau rất nhiều — `apps/web/public/og-default.png` bị 4 lượt quét tìm ra một cách độc lập, `apps/web/src/lib/email.ts` 3 lượt, `apps/web/src/lib/metadata.ts` 4 lượt. Sau khi khử trùng lặp theo cặp file+dòng duy nhất thì working set còn ~400 touchpoint.

| Surface | Số file | High | Med | Low | Đặc điểm |
|---|---|---|---|---|---|
| ui-components | 39 | 5 | 20 | 14 | Bản thân cái mark + chrome phía reader. Phần lớn là cơ học; bộ icon nhị phân mới là nửa tốn kém. |
| seo-metadata | 57 | 16 | 25 | 16 | Mật độ one-way door cao nhất: GUID của feed, canonical host, OG raster. |
| editorial-pages | 61 | 18 | 30 | 13 | Copy do người viết ở 3 locale; 5 mailbox đã công bố; 9 câu buộc chặt publication vào APCG. |
| config-build-deploy | 45 | 15 | 14 | 16 | Template env, turbo cache key, package scope, và tập migration đã apply thuộc diện DO-NOT-TOUCH. |
| assets-brand-visual | 38 | 9 | 16 | 13 | 6 file nhị phân + 3 lockup lệch nhau. 4 trong 6 file không có generator nào cả. |
| data-cms-db | 82 | 25 | 30 | 27 | Dòng DB đang chạy thật và nội dung CMS. **Không sửa được bằng bất kỳ thay đổi nào trong repo.** |
| integrations-external | 54 | 28 | 18 | 8 | Email, OAuth, social, feed, contract intake liên repo. Đa số hạng mục cần hành động ngoài repo trước. |
| process-docs | 61 | 22 | 20 | 19 | File context mà agent đọc *trước khi* sửa. Cũ = rebrand bị revert. |
| gap: content-engine | ~100 | 26 | ~25 | ~49 | Service duy nhất **vẫn tiếp tục đúc** brand cũ vào văn bản đã publish sau khi launch. |
| gap: apcg-estate | ~55 | 14 | ~18 | ~23 | Dòng tenant, 4 site reader anh em, `SiteCode` của media-engine, 1 project Vercel mồ côi. |
| gap: decisions | 14 | 7 | 5 | 2 | Sáu mâu thuẫn xuyên surface, đã giải quyết. |
| gap: ops-and-hygiene | 23 | 11 | 8 | 4 | Mọi thứ nằm ngoài mọi repo. Lead time dài nhất nằm ở đây. |
| **Tổng** | **~630 dòng** | **~196** | **~229** | **~204** | **~400 touchpoint riêng biệt, ~95 mục high-risk riêng biệt** |

Con số cứng đã kiểm chứng, chỉ tính `dtw-web`: **168 file được track**, **989 dòng khớp** (không tính `data-exports/`, riêng thư mục này đóng góp thêm 1,085 hit thuần là nhiễu CSV `site,dtw`).

---

### 3.1 ui-components — cái mark và chrome phía reader

| File | Dòng | Hiện tại | Đề xuất | Rủi ro |
|---|---|---|---|---|
| `apps/web/src/components/wordmark.tsx` | 28 | `DTW` (text node của monogram) | `OTW` — 3 glyph mono, không đổi hình học | med |
| `apps/web/src/components/wordmark.tsx` | 39 | `dailytechwire` (text của wordmark) | `opentechwire` — 12 glyph so với 13; đoạn pulse cố định 147px ở x=78..223 sẽ thừa ra ngoài | med |
| `apps/web/src/components/wordmark.tsx` | 13 | `aria-label="dailytechwire"` | `aria-label="opentechwire"` — tên logo mà screen reader đọc trên mọi trang | med |
| `apps/web/src/components/wordmark.tsx` | 11-12, 41-53 | `viewBox="0 18 234 64"` + nhóm pulse `translate(76,67)` | Chỉnh lại signature cho khớp wordmark ngắn hơn. `overflow:visible` (dòng 15) nghĩa là lệch thì trông sai chứ không bị cắt | med |
| `apps/web/src/components/wordmark.tsx` | 2-6 | Docblock nêu tên monogram, wordmark, và "auth modal" | Cập nhật; phần "auth modal" vốn đã sai (chỉ header ×2 + footer import `Wordmark`) | low |
| `apps/web/src/components/footer.tsx` | 21 | `title: t("DTW", "DTW", "DTW")` | `t("OTW", ...)` — tiêu đề cột đầu tiên của footer, ở mọi trang | med |
| `apps/web/src/components/footer.tsx` | 42 | `t("DTW Studio", ...)` | `OTW Studio` — chờ D2/sub-brand | med |
| `apps/web/src/components/footer.tsx` | 63 | `https://www.linkedin.com/company/dailytechwire/` | Vanity slug mới — **đổi tên trên LinkedIn trước**; nó 404 ngay khoảnh khắc đổi | **high** |
| `apps/web/src/components/footer.tsx` | 64 | `https://www.facebook.com/apcgdailytechwire/` | Slug page mới. Có giữ prefix `apcg` không? | **high** |
| `apps/web/src/components/footer.tsx` | 66 | `mailto:info@dailytechwire.com` | Mailbox mới; phải đi sau việc provision MX/SPF/DKIM | **high** |
| `apps/web/src/components/footer.tsx` | 140 | `Tech Intelligence, Wired Daily` (literal trần, không dịch) | Theo D8. Lưu ý bản ở header là bộ ba `t()`; bản này là tiếng Anh hardcode | med |
| `apps/web/src/components/footer.tsx` | 234 | `© 2026 Dailytechwire · Singapore · Member, Trust Project` | Rebrand **và xoá mệnh đề Trust Project** (credential bịa) | med |
| `apps/web/src/components/header.tsx` | 234-238 | `t("Tech Intelligence, Wired Daily", "Tin tức công nghệ, cập nhật hàng ngày", "Intelijen Teknologi, Setiap Hari")` | Theo D8. Cả chuỗi vi lẫn id đều gói chữ "daily" vào — chúng dịch cái chơi chữ, không phải khái niệm | med |
| `apps/web/src/components/header.tsx` | 633-635 | `"Enjoying DailyTechWire? Sign in to save…"` ×3 locale | Thay. Hôm nay không render (`PAYWALL_ENABLED = false`) nhưng vẫn ship kèm nội dung cũ, đến khi flag bật là lộ | low |
| `apps/web/src/components/header.tsx` | 20 | `const NUDGE_KEY = "dtw-nudge-dismissed"` | Theo D14 | low |
| `apps/web/src/components/auth-modal.tsx` | 190 | `t("Welcome to DTW", "Chào mừng đến DTW", "Selamat datang di DTW")` | `OTW` ×3 | med |
| `apps/web/src/components/auth-modal.tsx` | 360 | `t("New to DailyTechWire?", "Mới biết DailyTechWire?", "Baru di DailyTechWire?")` | Hai kiểu casing trong cùng một modal — chuẩn hoá lại | med |
| `apps/web/src/components/article/article-content.tsx` | 98 | `<Link href="/">DTW</Link>` | Gốc breadcrumb trên mọi trang bài viết | med |
| `apps/web/src/components/article/article-content.tsx` | 285-287 | `"Some links in this review earn DTW a commission…"` ×3 locale | Disclosure affiliate — sát vấn đề compliance, rà lại cùng legal | med |
| `apps/web/src/components/article/article-content.tsx` | 311 | `corrections@dailytechwire.com` (text thuần, không điều kiện) | Mailbox mới; phải đi sau provisioning | **high** |
| `apps/web/src/components/article/article-body.tsx` | 139-141 | `"…produced by DTW Studio… The DTW newsroom was not involved…"` ×3 locale | Disclosure không tắt được theo invariant #5. Chuỗi disclosure ưu tiên cao nhất | med |
| `apps/web/src/components/article/article-body.tsx` | 118-120 | Docblock có nhắc `@dtw/ui` | Chỉ khi D6 được bật | low |
| `packages/ui/src/disclosure-box.tsx` | 19-20 | `DEFAULT_SPONSORED_BODY = "…DTW Studio… DTW newsroom…"` | Đổi tên cho consumer sau này. **Hôm nay là code chết** — consumer duy nhất `article-body.tsx:133` luôn truyền `body` | low |
| `apps/web/src/components/home/sponsored-strip.tsx` | 44 | `⬢ Paid Partner Content · DTW Studio Presents` | Code chết — component không được import ở đâu cả | low |
| `apps/web/src/components/home/sponsored-strip.tsx` | 53 | `Produced by DTW Studio… The DTW newsroom was not involved.` | Như trên | low |
| `apps/web/src/components/home/best-of-reviews.tsx` | 70 | `title="Some links earn DTW a commission…"` | Bị chặn bởi `SHOW_BEST_OF_REVIEWS = false` (`page.tsx:41`) | low |
| `apps/web/src/components/pillar/pillar-content.tsx` | 138 | `DTW · {pillarLabel}` | Literal `DTW` trần còn sót lại có traffic cao nhất sau breadcrumb | med |
| `apps/web/src/components/home/home-hero.tsx` | 33 | `label="DTW HERO"` | Trở thành `<img alt>` / `aria-label` của SVG cho ảnh LCP ở trang chủ. Tốt hơn: truyền alt text thật theo từng bài | med |
| `apps/web/src/components/dashboards/funding-tracker.tsx` | 102 | `a.download = "dtw-funding-tracker.csv"` | Rơi thẳng vào thư mục Downloads của người đọc | low |
| `apps/web/src/components/cookie-banner.tsx` | 8 | `STORAGE_KEY = "dtw-cookies"` | Theo D14. Đổi tên sẽ làm banner consent hiện lại (invariant #12) | med |
| `apps/web/src/components/theme-provider.tsx` | 16 | `STORAGE_KEY = "dtw-theme"` | Theo D14 | low |
| `apps/web/src/lib/i18n.tsx` | 27 | `STORAGE_KEY = "dtw-lang"` | Theo D14. Token brand duy nhất trong cả file 166 dòng | low |
| `apps/web/src/lib/article-views.ts` | 31 | `STORAGE_KEY = "dtw-viewed"` | Theo D14 | low |
| `apps/web/src/lib/paywall.ts` | 26 | `GUEST_METER_COOKIE = "dtw-read-count"` | Theo D14. Là cookie chứ không phải localStorage — hệ quả về phạm vi consent khác đi | low |
| `apps/web/src/components/dashboards/ai-leaderboard.tsx` | 133 | `className="dtw-tip"` | Đổi tên nguyên tử cùng `globals.css`, nếu không tooltip hỏng mà **không có build error** | low |
| `apps/web/src/components/home/dashboards-teaser.tsx` | 198 | `className="dtw-tip"` | Như trên — đúng 2 call site | low |
| `apps/web/src/app/globals.css` | 424, 428, 449, 450 | `.dtw-tip` / `::after` / `:hover::after` / `:focus::after` | 4 định nghĩa CSS đứng sau các mục trên | low |
| `packages/ui/package.json` | 2, 19 | `"@dtw/ui"`, `"@dtw/config"` | Theo D6 | med |
| `packages/ui/tsconfig.json` | 2 | `"extends": "@dtw/config/tsconfig/react-library.json"` | Theo D6 | low |
| `apps/web/src/components/**` | 17 file | `import { … } from "@dtw/ui"` — `article/article-body.tsx:4`, `article/article-content.tsx:5`, `article/paywall.tsx:3`, `article/related-row.tsx:4`, `auth-modal.tsx:4`, `byline-wired.tsx:3`, `cookie-banner.tsx:4`, `dashboards/funding-tracker.tsx:4`, `footer.tsx:4`, `home/awards-banner.tsx:3`, `home/brief-band.tsx:4`, `home/dashboards-teaser.tsx:4`, `home/deep-dive.tsx:4`, `home/home-hero.tsx:4`, `home/most-read.tsx:4`, `home/newsletter-cta.tsx:5`, `pillar/pillar-content.tsx:5` | Theo D6 — cả 17 file trong một commit | low |
| `apps/web/public/og-default.png` | nhị phân | Tấm nền navy 1200×630 ghi `dailytechwire` + `Tech Intelligence, Wired Daily` | **Tạo lại.** Ảnh OG mặc định (`metadata.ts:66`) VÀ logo Organization JSON-LD (`metadata.ts:87`) | **high** |
| `apps/web/public/dtw-logo-primary.svg` | 1-4, 8, 11 | Tên file + `aria-label` + `<title>` + `<desc>` + `DTW` + `dailytechwire` | Đổi tên file và vẽ lại, hoặc xoá. **Không có code nào tham chiếu nó** — file mồ côi đang được serve tại `/dtw-logo-primary.svg` | med |
| `apps/web/src/app/icon.svg` | 2, 4 | `aria-label="DTW"`, `<text …>DTW</text>` | Favicon trên tab trình duyệt ở mọi trang, kể cả `/admin`. Grep được, khác với đám PNG | med |
| `apps/web/src/app/apple-icon.png` | nhị phân | Ô vuông navy, monogram `DTW` trắng | Render lại ở 180×180. **Không tồn tại script generator nào** | med |
| `apps/web/public/icon-192.png` | nhị phân | Ô vuông navy, `DTW` trắng | Render lại. `manifest.ts:21` | med |
| `apps/web/public/icon-512.png` | nhị phân | Ô vuông navy, `DTW` trắng | Render lại. `manifest.ts:22`. Cũng là nguồn của monogram trên social card được host trên Supabase | med |
| `apps/web/public/icon-maskable-512.png` | nhị phân | Navy, `DTW` trắng đặt lùi vào safe zone; **hiện đang lệch tâm theo chiều dọc** | Render lại và căn giữa — mask hình tròn của Android đang cắt bản hiện tại một cách bất đối xứng | med |
| `apps/web/src/lib/data.ts` | 127, 249, 254, 597, 609 | `role: "DTW"`; `slug: "dtw-studio-aws-asean"`; `"A DTW Studio Presents feature…"`; `"DTW Awards"`; `"DTW Daily Brief"` | Dữ liệu mock được render bởi các component đang hiển thị (`podcast-strip.tsx:23`) | low |

### 3.2 seo-metadata — title, canonical, feed, structured data

| File | Dòng | Hiện tại | Đề xuất | Rủi ro |
|---|---|---|---|---|
| `apps/web/src/lib/feed.ts` | 61, 69 | `const tagHost = new URL(channel.origin).hostname` → `` `tag:${tagHost},2026:article/${article.id}` `` | **Ghim tag authority vào một hằng số đóng băng** (`dailytechwire.com`). Authority theo RFC 4151 là định danh gắn theo ngày, không phải URL phân giải được. Comment ở 65-68 khẳng định nó "survives domain moves" — dòng 61 làm điều đó thành sai | **high** |
| `apps/web/src/lib/feed.ts` | 116 | `<id>${xmlEscape(feedUrl)}</id>` — atom:id ở cấp feed, origin trần | Xử lý y hệt, cùng một authority, không thì feed và các entry sẽ bất đồng về identity | med |
| `apps/web/src/lib/feed.ts` | 122 | `<author><name>DailyTechWire</name></author>` | Byline fallback ở cấp feed | med |
| `apps/web/src/lib/feed.ts` | 21 | Docblock: `e.g. "DailyTechWire" or "DailyTechWire — AI"` | Cập nhật lại ví dụ | low |
| `apps/web/src/lib/feed.ts` | 123 | `<rights>© Asia Press Centre Group (APCG)</rights>` | **KHÔNG ĐỔI** — APCG nằm ngoài phạm vi | low |
| `apps/web/next.config.ts` | 40-45 | `has: [{ type: "host", value: "dailytechwire.com" }]` → `https://www.dailytechwire.com/:path*` | Theo D4/D5. **Đưa các host rule lên đầu mảng** — 5 path rule đang có (`/asia`, `/asia/:path*`, `/about/newsroom`, `/feed`, `/rss`) không phụ thuộc host và bắn trước, tạo ra một chuỗi redirect hai chặng vắt qua hai domain | **high** |
| (env trên Vercel, không nằm trong repo) | — | `NEXT_PUBLIC_SITE_URL=https://www.dailytechwire.com` | `siteOrigin()` (`metadata.ts:33-37`) là bộ phân giải origin duy nhất cho metadataBase, robots, sitemap, llms.txt, và cả 7 feed | **high** |
| `apps/web/src/app/layout.tsx` | 35-38 | `title.default: "DailyTechWire"`, `template: "%s – DailyTechWire"` | Chỉ **5** route group tự định nghĩa metadata riêng (homepage, article, pillar, briefing, dashboards). `title.default` chính là thẻ `<title>` thật của ~18 route | **high** |
| `apps/web/src/app/layout.tsx` | 39 | `description: "Tech Intelligence, Wired Daily."` | Theo D8. Meta description của ~18 route | **high** |
| `apps/web/src/app/layout.tsx` | 44 | `"application/atom+xml": [{ url: "/rss.xml", title: "DailyTechWire" }]` | Title cho feed autodiscovery | med |
| `apps/web/src/app/layout.tsx` | 48 | `siteName: "DailyTechWire"` (openGraph) | Literal `og:site_name` độc lập thứ ba | **high** |
| `apps/web/src/app/(reader)/layout.tsx` | 32-41 (name ở 37) | `"@type": "WebSite", name: "DailyTechWire"` | Thêm `alternateName: "DailyTechWire"` trong ~12 tháng để Google khớp lại entity. `ORGANIZATION.name` là APCG và **không** đổi | **high** |
| `apps/web/src/lib/metadata.ts` | 153, 163 | `siteName: "DailyTechWire"` (nhánh article + nhánh website) | Next **thay thế** chứ không merge `openGraph`, nên mấy chỗ này thắng ở homepage, mọi pillar, `/briefing`, và mọi bài viết — chỉ sửa `layout.tsx:48` là không đủ | **high** |
| `apps/web/src/lib/metadata.ts` | 178 | `{ url: "/rss.xml", title: "DailyTechWire" }` | Vẫn là luật thay-thế-chứ-không-merge đó (comment ở 172-175 đã nói) | med |
| `apps/web/src/lib/metadata.ts` | 69 | `alt: "DailyTechWire – Tech Intelligence, Wired Daily"` | Đồng thời là alt fallback cho ảnh hero có `alt` rỗng (`article/[slug]/page.tsx:63,71`) | med |
| `apps/web/src/lib/metadata.ts` | 84-93 (sameAs 90-91) | `sameAs: [linkedin.com/company/dailytechwire/, facebook.com/apcgdailytechwire/]` | Chỉ cập nhật **sau khi** các profile đã được đổi tên. `name` vẫn là APCG. Bị lặp ở `footer.tsx:63-64` — phải đổi cùng lúc | **high** |
| `apps/web/src/lib/metadata.ts` | 26, 30 | Comment: production origin + luật www | Cập nhật cả hai; giữ nguyên verbatim phần cảnh báo về www | low |
| `apps/web/src/lib/metadata.ts` | 101 | Comment trích `%s – DailyTechWire` | Cập nhật. Được lặp lại ở `(reader)/page.tsx:51-53` | low |
| `apps/web/src/lib/metadata.ts` | 182-184 | Comment hreflang kiểu để-dành-nhưng-đang-rỗng | **KHÔNG ĐỔI.** Đã kiểm chứng: không có `alternates.languages`, không có hreflang, không có route nào prefix theo locale. Blast radius hreflang bằng không | low |
| `apps/web/src/lib/metadata.ts` | 187-190 | `twitter: { card, images }` — không có handle `site` | Cơ hội: `footer.tsx:62` đã sẵn một slot `["X","x"]` chưa có href, đang chờ URL | low |
| `apps/web/src/app/rss.xml/route.ts` | 17-18 | `title: "DailyTechWire"`, `subtitle: "Tech Intelligence, Wired Daily."` | Cái tên nằm trong sidebar trình đọc feed của mọi subscriber | **high** |
| `apps/web/src/app/(reader)/[pillar]/rss.xml/route.ts` | 36-37 | `` title: `DailyTechWire — ${heading}` ``, subtitle fallback | Phải giống hệt `pillar-view.tsx:45` | **high** |
| `apps/web/src/app/(reader)/[pillar]/pillar-view.tsx` | 45 | `` title: `DailyTechWire — ${heading}` `` | Nhãn autodiscovery; là template có nội suy — grep theo chuỗi trong dấu nháy sẽ bỏ sót | med |
| `apps/web/src/app/(reader)/[pillar]/pillar-view.tsx` | 29 | `pillarDoc.description ?? "Tech Intelligence, Wired Daily."` | Theo D8. Fallback `??` nghĩa là pillar nào không có description trong CMS sẽ âm thầm publish tagline cũ | low |
| `apps/web/src/app/(reader)/page.tsx` | 63 | `"DailyTechWire tracks global tech and AI: …"` | Meta description của homepage — chính là snippet SERP cho URL quan trọng nhất của site. **Đo được: hiện 157 ký tự, còn 156 nếu dùng `Opentechwire`** — vẫn nằm trong dải 150-160 mà comment ở 56-62 yêu cầu | **high** |
| `apps/web/src/app/(reader)/page.tsx` | 51-53, 59-60 | Comment trích template title và câu "DTW is global" | Cập nhật để comment còn mô tả đúng thực tế | low |
| `apps/web/src/app/(reader)/dashboards/[[...sub]]/page.tsx` | 25-31 | `title: "AI Leaderboard | Dashboards | Dailytechwire"` — là chuỗi thuần, nên root template bọc thêm ra ngoài | Cho chạy qua `buildMetadata`. Sửa được cả brand bị nhân đôi **lẫn** canonical thiếu + block OG thiếu trong một lần sửa | med |
| `apps/web/src/app/(reader)/briefing/briefing-view.tsx` | 22 | `"The Dailytechwire Brief — twice-daily editions…"` | Meta description cho `/briefing` và mọi `/briefing/page/N` | med |
| `apps/web/src/app/manifest.ts` | 13-15 | `name`, `short_name`, `description` | Danh tính PWA. Không khai báo `id` lẫn `scope` → các bản đã cài từ origin cũ thành mồ côi, không có đường migration | med |
| `apps/web/src/app/llms.txt/route.ts` | 33, 35 | `# DailyTechWire` + đoạn tự mô tả một paragraph | Bề mặt danh tính cho AI-search. Thêm "Formerly published as DailyTechWire." Là template literal — grep theo chuỗi nháy sẽ bỏ sót | med |
| `apps/web/src/app/sitemap.ts` | 45, 49-96 | `const origin = siteOrigin()` — không có literal brand nào | **KHÔNG SỬA CODE.** `revalidate = 900` tự chữa trong vòng 15 phút. Rủi ro nằm ở phía vận hành: property GSC mới + Change of Address | **high** |
| `apps/web/src/app/robots.ts` | 25 | `` `${siteOrigin()}/sitemap.xml` `` | **KHÔNG SỬA CODE** — tự rebase | low |
| `apps/web/src/app/not-found.tsx` | 65 | `aria-label={t("Search DailyTechWire", "Tìm kiếm DailyTechWire", "Cari DailyTechWire")}` | Trang 404 — nơi crawler và các link gõ sai rơi vào | low |
| `apps/web/payload.config.ts` | 51 | `meta: { titleSuffix: "— DailyTechWire" }` | Hậu tố tab mà biên tập viên thấy trên mọi màn hình `/admin`. Là chuỗi brand duy nhất trong file 102 dòng | low |
| `apps/web/scripts/generate-og-default.mjs` | 12, 57, 58, 61 | Wordmark `dailytechwire`, tagline, pulse-dot ở `cx="492"` | **Chỉnh lại `cx`** — 12 so với 13 glyph ở 56px để hở một khoảng nhìn thấy được. Rồi chạy `node scripts/generate-og-default.mjs` và commit file PNG | med |
| `apps/web/vercel.json` | 1-7 | `regions: ["sin1"]` + một cron | **KHÔNG ĐỔI** — đã kiểm chứng không có chuỗi brand nào, không có block redirect | low |
| `apps/web/.env.example` | 12-13 | `# Production value: https://dailytechwire.com` | Theo D5 — đây là **ca apex lệch chuẩn** và hiện đang sai. Nhân tiện gỡ luôn BOM UTF-8 và mojibake `â€”` ở các dòng 9-11, 22, 38, 49, 69 (cả hai đều do `947971d` mang vào) | **high** |
| `.env.example` | 52 | `RESEND_FROM_DOMAIN="dailytechwire.com"` | Chỉ sau khi Resend đã verify + SPF/DKIM/DMARC xong trên domain mới | **high** |
| `apps/web/.env.example` | 51 | `RESEND_FROM_DOMAIN="dailytechwire.com"` | Giữ lockstep với template ở root | **high** |
| `apps/web/src/lib/email.ts` | 12 | `process.env.RESEND_FROM_DOMAIN \|\| "dailytechwire.com"` | Tốt hơn: **throw** ở production khi biến chưa set, thay vì âm thầm gửi từ một domain có thể đã mất DKIM | **high** |
| `apps/web/src/lib/auth.ts` | 59 | `baseURL: process.env.BETTER_AUTH_URL` | **Không sửa code; việc lật env phải ship CÙNG một deploy với `NEXT_PUBLIC_SITE_URL`.** Nó sinh ra mọi URL magic-link/verify/reset và origin callback OAuth. Lật một cái mà quên cái kia → deploy xanh, đăng nhập hỏng | **high** |
| `apps/web/src/app/(reader)/layout.tsx` | 18-20 | `NEXT_PUBLIC_GA_ID \|\| (VERCEL_ENV === "production" ? "G-5H175FPLGR" : undefined)` | Theo D-ops: giữ nguyên property, cập nhật URL data-stream của nó, thêm host cũ vào referral exclusions | med |
| `apps/web/next.config.ts` | 10 | `transpilePackages: ["@dtw/ui", "@dtw/db"]` | Theo D6 — phải đổi trong cùng một commit, không thì build vỡ | low |
| `dailytechwire.com-Coverage-2026-08-06.zip` | — | Bản export từ GSC, 4 file CSV | Artifact làm bằng chứng — **đừng xoá trước khi migration xong**. Kéo một bản export mới trước đã | **high** |

### 3.3 editorial-pages — copy do người viết, 3 locale

**Bẫy casing:** bề mặt này trộn lẫn `Dailytechwire` và `dailytechwire` viết thường trần *ngay trong cùng một file* (ví dụ `newsroom/page.tsx:436` so với `:449`). Một lệnh replace phân biệt hoa thường sẽ bỏ sót khoảng một phần ba.
**Bẫy dính chùm:** 9 câu gọi tên publication và APCG trong cùng một mệnh đề. APCG, địa chỉ Bugis Cube, và vai trò của Cheryl Tan ở APCG đều **giữ nguyên**. Mấy chỗ này cần một lượt đọc copy bằng người, không phải một lệnh `sed`.

| File | Dòng | Hiện tại | Đề xuất | Rủi ro |
|---|---|---|---|---|
| `apps/web/src/app/(reader)/about/page.tsx` | 87-90 (en), 75-78 (vi), 81-84 (id) | `Dailytechwire is the technology title of **Asia Press Centre Group (APCG)**…` | Publication đổi tên; APCG giữ nguyên. Là ba block JSX riêng biệt, không phải một bộ ba `t()` | med |
| `apps/web/src/app/(reader)/about/page.tsx` | 282-285 | `…Dailytechwire is its technology title.` | Paragraph chỉ có tiếng Anh | med |
| `apps/web/src/app/(reader)/about/page.tsx` | 31 | `"DTW Studio rules + commission disclosure."` | Được render thành copy trên card ở L461. Lockstep với `/studio`, `/advertise`, `/trust/sponsored` | med |
| `apps/web/src/app/(reader)/about/page.tsx` | 39-40 | `media@dailytechwire.com`, `partnership@dailytechwire.com` | Tự động link sang `mailto:` qua `renderBizValue()` (L49), render ở L505-527 | **high** |
| `apps/web/src/app/(reader)/newsroom/page.tsx` | 147-150 / 133-136 / 140-143 | `Dailytechwire is the technology title of **APCG**…` | Vẫn kiểu rẽ nhánh theo ngôn ngữ như trên | med |
| `apps/web/src/app/(reader)/newsroom/page.tsx` | 94 | `role: "Editor-in-Chief, Dailytechwire / Group Editor"` | Dính chùm: con người + publication | med |
| `apps/web/src/app/(reader)/newsroom/page.tsx` | 436 | `Editor-in-Chief, Dailytechwire · Asia Press Centre Group` | Dính chùm: con người + publication + công ty mẹ | med |
| `apps/web/src/app/(reader)/newsroom/page.tsx` | 448-450 | `…Editor-in-Chief of dailytechwire…` (**viết thường**) | Ca bị replace-phân-biệt-hoa-thường bỏ sót #1 | med |
| `apps/web/src/app/(reader)/newsroom/page.tsx` | 706-708 | `t("← The trust & standards view of dailytechwire", …)` ×3 | Ca bị replace-phân-biệt-hoa-thường bỏ sót #2 | med |
| `apps/web/src/app/(reader)/newsroom/page.tsx` | 115-116 | `media@…`, `partnership@…\ndailytechwire.com` | Render dưới dạng **text thô** (`whiteSpace: "pre-line"` ở L694), không phải link. Là chỗ duy nhất domain trần được in ra như body copy | **high** |
| `apps/web/src/app/(reader)/press/page.tsx` | 10 | `const PRESS_EMAIL = "media@dailytechwire.com"` | Dùng ở L109, 123, 140, 141, 260, 264. Văn xuôi của trang không gọi tên brand nào | **high** |
| `apps/web/src/app/(reader)/contact/page.tsx` | 22, 32, 42 | `info@`, `media@`, `partnership@dailytechwire.com` | Render ở L87 (`mailto:`) và L150 (hiện ra ngoài). Block Publisher L186-192 (APCG, Bugis Cube) **không được** đổi | **high** |
| `apps/web/src/app/(reader)/advertise/page.tsx` | 10 | `const EMAIL = "advertising@dailytechwire.com"` | Hiện ra ở L732; `mailto:` ở L241, 259, 716 | **high** |
| `apps/web/src/app/(reader)/advertise/page.tsx` | 11 | `` `mailto:${EMAIL}?subject=DTW%20media%20inquiry` `` | **Đã URL-encode** — grep `"DTW "` sẽ bỏ sót. Nó rơi thẳng vào ô subject trong mail client của người đọc | low |
| `apps/web/src/app/(reader)/advertise/page.tsx` | 234-236 | `"…read Dailytechwire to understand what is actually happening in technology."` ×3 | Sub-headline của hero | med |
| `apps/web/src/app/(reader)/advertise/page.tsx` | 202 | `t("Advertise with DTW", "Quảng cáo cùng DTW", "Beriklan dengan DTW")` | 3 token | med |
| `apps/web/src/app/(reader)/advertise/page.tsx` | 320 | `t("Why DTW", "Vì sao chọn DTW", "Kenapa DTW")` | 3 token | med |
| `apps/web/src/app/(reader)/advertise/page.tsx` | 496 | `t("Who reads DTW", "Ai đọc DTW", "Siapa pembaca DTW")` | 3 token | med |
| `apps/web/src/app/(reader)/advertise/page.tsx` | 153-155, 157 | `"…produced and clearly labelled by DTW Studio."` + `t("via DTW Studio →", …)` | Sub-brand, chờ D2 | med |
| `apps/web/src/app/(reader)/advertise/page.tsx` | 622-624 | `"…Paid content is clearly labelled and produced by DTW Studio, not our reporters."` ×3 | Disclosure về liêm chính biên tập | med |
| `apps/web/src/app/(reader)/advertise/page.tsx` | 103-105 | `"…AM Brief, AI Weekly, or any of our six titles."` | Cách nói về nhịp xuất bản. Lưu ý bản id ghi "enam newsletter" trong khi bản en ghi "six titles" — locale drift có sẵn từ trước | low |
| `apps/web/src/app/(reader)/studio/page.tsx` | 10 | `const EMAIL = "partnership@dailytechwire.com"` | Hiện ra ở L360; `mailto:` ở L129, 343 | **high** |
| `apps/web/src/app/(reader)/studio/page.tsx` | 11 | `?subject=DTW%20Studio%20inquiry` | Đã URL-encode | low |
| `apps/web/src/app/(reader)/studio/page.tsx` | 92 | `t("DTW Studio", "DTW Studio", "DTW Studio")` | Sub-brand chính là toàn bộ danh tính của trang này | med |
| `apps/web/src/app/(reader)/studio/page.tsx` | 123-125 | `"DTW Studio is our branded-content team…"` | **Số token khác nhau theo từng locale**: en 1, vi 2, id 2. Đừng giả định 1:1 | med |
| `apps/web/src/app/(reader)/studio/page.tsx` | 40 | chỉ có ở vi: `…phân phối trên các kênh của DTW.` | **Locale drift** — bản vi gọi tên brand ở chỗ en/id không gọi. Một cuộc audit chỉ đọc tiếng Anh sẽ không thấy | med |
| `apps/web/src/app/(reader)/legal/[slug]/page.tsx` | 40-42 | `"We built Dailytechwire to be read, not to be mined… write to info@dailytechwire.com…"` ×3 | Phần mở đầu Privacy Policy; 2 token mỗi locale | **high** |
| `apps/web/src/app/(reader)/legal/[slug]/page.tsx` | 91-93 | `"…agreement between you and Asia Press Centre Group (APCG) when you use dailytechwire."` ×3 | **Viết thường**, và có sức nặng pháp lý. APCG mới là bên ký kết | **high** |
| `apps/web/src/app/(reader)/legal/[slug]/page.tsx` | 115-117 | `"The journalism… on Dailytechwire are owned by APCG… Trademarks and the masthead remain ours… partnership@dailytechwire.com."` ×3 | Khẳng định về IP/nhãn hiệu + email. Đối chiếu với nhãn hiệu thực sự đã đăng ký | **high** |
| `apps/web/src/app/(reader)/legal/[slug]/page.tsx` | 80-82, 131-133, 221-223, 237-239, 311, 320 | `info@dailytechwire.com` ×6 chỗ (14 dòng vật lý) | 221-223 = export/xoá dữ liệu theo GDPR; 237-239 = **liên hệ DPO**. Là các điểm liên hệ theo luật định | **high** |
| `apps/web/src/app/(reader)/legal/[slug]/page.tsx` | 166-168 | `"…a cookie on Dailytechwire that does not fit…"` ×3 | Cookie Policy | med |
| `apps/web/src/app/(reader)/newsletters/newsletters-content.tsx` | 73-75 | `t("Read Dailytechwire the way you read.", …)` | H1 của trang. Tên các newsletter đến từ row trong CMS, không phải file này | med |
| `apps/web/src/app/(reader)/newsletters/newsletters-content.tsx` | 83-85 | `"Daily briefs, weekly digests, one bi-weekly."` | Nằm ngay dưới cái H1 vừa đổi tên — cần một lượt đọc bằng người | low |
| `apps/web/src/app/(reader)/briefing/briefing-content.tsx` | 134 | `t("AM Brief · PM Brief", "Bản tin Sáng · Bản tin Tối", "AM Brief · PM Brief")` | Dấu vết "Daily" đậm nhất còn sót trong UI người đọc | low |
| `apps/web/src/app/(reader)/briefing/briefing-content.tsx` | 142-144 | `"Twice daily, morning and evening SGT…"` ×3 | Copy về nhịp xuất bản, không có token brand nào | low |
| `apps/web/src/app/(reader)/trust/[slug]/trust-content.tsx` | 153-155 | `"DTW does not accept review units… separate from DTW Studio…"` ×3 | Chuỗi duy nhất có cả hai dạng viết tắt nằm cạnh nhau — ca kiểm thử tốt nhất cho D2 | med |
| `apps/web/src/app/(reader)/trust/[slug]/trust-content.tsx` | 268-270, 274 | `t("DTW Studio and review rules", …)` + `t("DTW Studio", …)` | `/trust/sponsored` là định nghĩa công khai canonical của sub-brand | med |
| `apps/web/src/app/(reader)/trust/[slug]/trust-content.tsx` | 184-187, 215-217 | Comment KNOWN GAP + `"Articles that use AI… carry an 'AI-assisted' label at the top, middle, and bottom… The label cannot be turned off."` ×3 | **Nâng lên thành blocker của rebrand.** Invariant #5 đã gỡ cái nhãn đó từ 2026-06-05; trang này vẫn hứa là có. Một publication lấy tên từ sự cởi mở không thể ship một tuyên bố minh bạch sai đã được ghi thành văn. Nó còn được seed vào body một bài viết ở `apps/web/scripts/seed-payload.ts:267` | **high** |
| `apps/web/src/app/(reader)/reset-password/page.tsx` | 85 | `t("Back to DailyTechWire →", …)` | Link thành công sau khi reset | med |
| `apps/web/src/app/(reader)/awards/page.tsx` + 7 file khác | — | `import { … } from "@dtw/ui"` — còn có `search/page.tsx:6`, `account/[[...tab]]/account-tabs.tsx:6`, `account/[[...tab]]/settings-tab.tsx:4`, `dashboards/[[...sub]]/loading.tsx:1`, `newsletters/newsletters-content.tsx:5`, `briefing/briefing-content.tsx:4`, `reset-password/page.tsx:6` | Theo D6. Phần **văn xuôi** của các trang này đã được kiểm chứng là sạch brand | low |
| `apps/web/src/app/api/health/cms/route.ts` | 19, 26 | Comment gọi tên `dailytechwire.com` và `DTW` | Tài liệu vận hành nằm trên một route health-check — sẽ thành thứ gây hiểu nhầm chủ động | low |
| `apps/web/src/lib/central-api.ts` | 83 | Comment: `…resolves that against the site being viewed — dailytechwire.com —` | Chỉ là comment. **Tenant slug không nằm trong repo này** — Central trả nó về trong media URL | low |

**Văn xuôi đã kiểm chứng là sạch brand (đừng quét lại):** `/awards`, `/search`, `/account/*`, body của `/article/*`, và copy của trang `/press`.

### 3.4 config-build-deploy

| File | Dòng | Hiện tại | Đề xuất | Rủi ro |
|---|---|---|---|---|
| `apps/web/next.config.ts` | 40-45 | quy tắc host apex→www | Xem §3.2. `apps/web/src/middleware.ts:22` ghi rõ nó phụ thuộc vào việc quy tắc này chạy **trước** middleware | **high** |
| `.env.example` | 52 | `RESEND_FROM_DOMAIN="dailytechwire.com"` | Phụ thuộc vào việc verify domain ở Resend. Có mặt trong build env của `turbo.json`, nên đổi là bust turbo cache | **high** |
| `apps/web/.env.example` | 51 | `RESEND_FROM_DOMAIN="dailytechwire.com"` | Đổi đồng thời (lockstep) | **high** |
| `apps/web/.env.example` | 12-13 | comment về apex ở production | Theo D5 | **high** |
| `turbo.json` | 8-23 | mảng `env` của build thiếu `NEXT_PUBLIC_SITE_URL` | **Verify trước khi flip.** `NEXT_PUBLIC_*` được inline lúc build; Next inference của Turborepo *được kỳ vọng* là bao luôn nó, nhưng phải xác nhận bằng `turbo build --dry=json`. Nếu không, một cache hit sẽ replay host cũ vào mọi URL canonical/OG. `NEXT_PUBLIC_GA_ID`, `CMS_SOURCE` cũng vắng mặt | med |
| `.env.example` | 62-67 | `DTW_INTAKE_TOKEN` + cảnh báo cross-repo | **Đóng băng cái tên này.** Nếu có đổi tên, hãy dual-read `OTW_INTAKE_TOKEN ?? DTW_INTAKE_TOKEN` một lần deploy trước khi engine chuyển sang | **high** |
| `apps/web/.env.example` | 62-63 | `DTW_INTAKE_TOKEN=""` | Đổi đồng thời (lockstep) | **high** |
| `.env.example` | 69-76 | `DTW_DASHBOARD_REFRESH_TOKEN` | Đổi tên thoải mái (2 dòng code) — nhưng giá trị trên Vercel phải tồn tại dưới tên mới trước khi deploy, không thì cron 03:00 thứ Hai sẽ fail closed | med |
| `apps/web/src/app/api/dashboards/refresh/[source]/route.ts` | 50, 52 | `process.env.DTW_DASHBOARD_REFRESH_TOKEN` | Đi cặp với `CRON_SECRET` trên Vercel | med |
| `apps/web/src/app/api/engine/intake/route.ts` | 12-15, 92, 95 | `Authorization: Bearer {DTW_INTAKE_TOKEN}` | **Đừng refactor.** `apps/web/src/lib/bearer-auth.ts:10-12` ghi rõ hành vi 401/500 "không bao giờ được thay đổi âm thầm" | **high** |
| `.env.example` | 15-20, 87 | comment về schema `dtw_auth`; `R2_BUCKET="dtw-media"` | Theo D12. **Dù sao cũng bắt buộc:** thêm origin mới vào CORS allowlist của R2 bucket (`apps/web/payload.config.ts:72-76` dùng presigned PUT `clientUploads` từ site origin) | **high** |
| `packages/db/src/schema/auth.ts` | 24 | `export const dtwAuth = pgSchema("dtw_auth")` | Theo D12 — đóng băng. 11 bảng treo trên đó | **high** |
| `packages/db/src/schema/auth.ts` | 18-21, 26, 34, 55, 80, 109 | Docblock + `dtwAuth.table("auth_users" \| "auth_sessions" \| "auth_accounts" \| "auth_verifications")` | Tên bảng/enum trong dấu nháy không mang brand | low |
| `packages/db/src/schema/account.ts` | 8, 21, 36, 53, 70, 84, 102 | `import { dtwAuth }` + 6 `dtwAuth.table(...)` | Chỉ const TS đổi nếu D12 lật | low |
| `packages/db/src/schema/analytics.ts` | 2, 33 | `import { dtwAuth }` + `articleViews` | Như trên | low |
| `packages/db/migrations/0000_dtw_auth_baseline.sql` | cả file (47 × `dtw_auth`) | `CREATE SCHEMA "dtw_auth";` + 10 bảng + 7 FK + 8 index | **KHÔNG SỬA.** Đã apply và được hash-check | **high** |
| `packages/db/migrations/meta/0000_snapshot.json` | cả file (34 × `dtw_auth`, gồm cả `"dtw_auth": "dtw_auth"` ở L1031) | baseline cho drizzle diff | **KHÔNG SỬA.** Sửa file này + `schema/auth.ts:24` sẽ khiến drizzle-kit phát ra `DROP SCHEMA`/`CREATE SCHEMA` lên DB **central dùng chung**, xoá sạch mọi user, session, bookmark, dòng reading-queue, follow, newsletter subscription và article view của DTW *lẫn các property APCG anh em* | **high** |
| `packages/db/migrations/meta/_journal.json` | 9 | `"tag": "0000_dtw_auth_baseline"` | **KHÔNG SỬA** — phải khớp từng byte với tên file `.sql` | **high** |
| `packages/db/scripts/copy-auth-to-central.ts` | 1, 2, 6, 11, 13, 15, 61 | `` const to = `dtw_auth."${table}"` `` + `pnpm --filter @dtw/db` | Dòng 61 nội suy tên schema thẳng vào SQL — grep `@dtw/` không thấy | med |
| `packages/db/src/client.ts` | 8, 10, 14, 30, 34, 43 | `var __dtwPgClient` + doc comment | `dtw` trần nằm trong một identifier camelCase — grep `@dtw/` không thấy. Global HMR chỉ dùng ở dev | low |
| `packages/db/package.json` | 2, 28 | `"@dtw/db"`, `"@dtw/config"` | Theo D6 | low |
| `packages/ui/package.json` | 2, 19 | `"@dtw/ui"`, `"@dtw/config"` | Theo D6 | low |
| `packages/config/package.json` | 2 | `"@dtw/config"` | Theo D6. Lưu ý `packages/config` **không** có tsconfig riêng; 3 config nó expose đều extend theo đường dẫn tương đối và không mang brand | low |
| `apps/web/package.json` | 21, 22, 39 | 3 × `"@dtw/*": "workspace:*"` | Theo D6. **Tổng 5 dep entry trên toàn repo** (+ `packages/db:28`, `packages/ui:19`) | low |
| `apps/web/tsconfig.json` | 2 | `"extends": "@dtw/config/tsconfig/next.json"` | **Tổng cộng 3** chỗ `extends`. `.github/workflows/ci.yml:41-42` chạy `turbo run typecheck` như cổng duy nhất → một đường dẫn không resolve được sẽ làm fail mọi PR | med |
| `packages/db/tsconfig.json` | 2 | `"@dtw/config/tsconfig/base.json"` | Theo D6 | med |
| `packages/ui/tsconfig.json` | 2 | `"@dtw/config/tsconfig/react-library.json"` | Theo D6 | med |
| `apps/web/scripts/migrate-prod.mjs` | 36, 63, 66 | `run("pnpm --filter @dtw/db exec drizzle-kit migrate")` | **Runner migration cho production** (`apps/web/package.json:9` `vercel-build`). Sót một chỗ là abort deploy trước `next build` — deploy bị chặn, chứ không phải prod hỏng | med |
| `pnpm-lock.yaml` | 20, 23, 69, 120, 141 | 5 × entry importer `'@dtw/'` | Regenerate trong **cùng commit** với mọi lần đổi scope. CI chạy `--frozen-lockfile` (`ci.yml:39`) | med |
| `package.json` | 2, 17-21 | `"name": "dtw-web"` + 5 × `pnpm --filter @dtw/db` | Theo D6/D7 | low |
| `.env.example` | 1, 7, 13, 14 | `# DTW dev environment template.`; `dtw-dev`; `/dtw?sslmode=require` ×2 | Chỉ là text placeholder | low |
| `apps/web/.env.example` | 1, 17 | Như trên, **cộng thêm một UTF-8 BOM và các em-dash bị mojibake** ở 9, 10, 11, 22, 38, 49, 69 | Sửa luôn khi đang mở file. Cả hai đều do `947971d` gây ra | low |
| `.env.local` | 5 | `DTW_DASHBOARD_REFRESH_TOKEN` (không track, bị gitignore qua `.gitignore:33`) | Local của dev; phải khớp `CRON_SECRET` trên Vercel | low |
| `.gitignore` | 33 | `# …not part of DTW (~14MB)` | Chỉ là comment | low |
| `.gitignore` | — | **không có entry `data-exports/`** | **Thêm vào.** `git check-ignore -v data-exports/` → NOT IGNORED, mâu thuẫn với `data-exports/README.md:8`. 4.9MB dek bài viết đang live + 1,063 URL Supabase Storage, chỉ cách history đúng một lệnh `git add .` | med |
| `apps/web/scripts/export-for-central.ts` | 2, 4, 7, 8, 37, 42 | `EXPORT_DIR='<abs>/central-cms/migration-data/dtw'` + `resolve(..., "dtw")` | Hợp đồng thư mục cross-repo với `central-cms` — quyết định cùng owner của repo đó | med |
| `.claude/settings.json` | 49 | `--screenshot=/tmp/dtw-v2/pillar-390-2x.png` nằm trong một chuỗi allowlist permission của Bash | **Để yên** — đó là literal đóng băng trong một permission matcher; đổi là hỏng match | low |
| `demos/ai-leaderboard-demo.html` | 6, 307, 308, 322, 424, 436, 437 | `<title>… DTW Dashboards (demo)</title>`, `<span class="logo-badge">DTW</span>`, `<span class="wordmark">dailytechwire…`, `LS_KEY = "dtw-llmstats-key"`, `LS_THEME = "dtw-theme"` | Được track trong git; bản copy thứ 4 của lockup. Cập nhật hoặc xoá | low |
| `demos/ai-leaderboard-table-preview.html` | 543 | `const LS = "dtw-theme"` | Storage key thứ 8; sẽ lệch âm thầm nếu D14 là yes | low |
| `.github/workflows/ci.yml`, `apps/web/vercel.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `.npmrc`, `.nvmrc`, `apps/web/eslint.config.mjs`, `apps/web/postcss.config.mjs`, `.codex/config.toml` | — | — | **Đã verify là không dính brand. Không cần làm gì.** | — |

### 3.5 assets-brand-visual

Có **ba lockup khác nhau nằm trong code** cộng **sáu binary**. Bốn trong sáu cái đó **không có script generator** (`apps/web/scripts/` chỉ chứa `export-for-central.ts`, `generate-og-default.mjs`, `migrate-prod.mjs`, `seed-payload.ts`).

| File | Dòng | Hiện tại | Đề xuất | Rủi ro |
|---|---|---|---|---|
| `apps/web/src/components/wordmark.tsx` | 1-56 | Lockup #1: khối `DTW` navy + `dailytechwire` chữ thường + pulse 6 chấm. Màu đã tokenised (`--brand-navy`, `--brand-amber`) nên dark mode có sẵn | Vẽ lại; đo lại `viewBox` và dải pulse | **high** |
| `apps/web/src/lib/email.ts` | 79 | Lockup #2: `<span style="color:#1B2A52">DTW</span> <span style="font-style:italic;…color:#D4623C">dailytechwire</span>` | Dựng lại. Vốn đã lệch brand (wordmark in nghiêng, không có khối monogram, không pulse, hex hardcode — và như vậy là đúng, theo comment ở 60-65: email client không đọc được CSS custom property) | **high** |
| `apps/web/public/dtw-logo-primary.svg` | tên file, 2, 3, 4, 8, 11 | Lockup #3: file độc lập, hardcode `#1B2A52`/`#D4623C`, `aria-label`/`<title>`/`<desc>` đều nêu tên brand | Vẽ lại + đổi tên, hoặc xoá. **Không có code nào tham chiếu** — được serve tại `/dtw-logo-primary.svg`, có thể đang được link từ tài liệu press | low |
| `apps/web/src/app/icon.svg` | 2, 4 | `aria-label="DTW"`, `<text …font-size="21" …>DTW</text>`, `rx="12"` bo góc, IBM Plex Mono | Thay thẳng bằng `OTW`. **Lưu ý:** vector này bo góc và dùng font mono trong khi cả 4 icon raster đều vuông cạnh với một grotesque generic — bộ này vốn đã không nhất quán với chính vector của nó | med |
| `apps/web/src/app/apple-icon.png` | binary 180×180 | Navy `#1B2A52`, `DTW` trắng, góc vuông, glyph nằm trên tâm quang học | Làm lại. iOS Add-to-Home-Screen; `manifest.ts:10` ghi rõ iOS đọc file này chứ không đọc manifest | **high** |
| `apps/web/public/icon-192.png` | binary | Navy, `DTW` trắng, full-bleed | Làm lại. `manifest.ts:21`, purpose `any` | **high** |
| `apps/web/public/icon-512.png` | binary | Navy, `DTW` trắng, full-bleed | Làm lại. `manifest.ts:22`. **Cũng là upstream của monogram social-card host trên Supabase** (`content-engine/src/lib/publications/dtw/index.ts:179-183`) | **high** |
| `apps/web/public/icon-maskable-512.png` | binary | Navy, `DTW` trắng thụt vào; **lệch tâm theo chiều dọc (baseline ~55% chiều cao)** | Làm lại và canh giữa trong safe zone 80% — mask hình tròn của Android đang crop cái hiện tại lệch một bên | **high** |
| `apps/web/public/og-default.png` | binary 1200×630 | Nền navy, `dailytechwire` chữ thường màu trắng + pulse-dot terracotta, tagline bên dưới, 4 khối terracotta/amber chồng nhau. **Render bằng một grotesque hệ thống thay thế, không phải Schibsted Grotesk** | Regenerate bằng script. Theo D-og: giữ nguyên tên file kể cả khi domain đổi | **high** |
| `apps/web/scripts/generate-og-default.mjs` | 11-15, 17-25, 32, 36-38, 57, 58, 61 | Brief thị giác; lưu ý về fontconfig; `outPath`; các hex `BANNER/ACCENT/AMBER`; pulse-dot `cx="492"`; wordmark; tagline | Generator raster brand duy nhất được commit. Chuyện font bị thay thế là có thật và đã nhìn thấy được — ghi lại font đã bị thay vào PR | med |
| `apps/web/src/app/manifest.ts` | 13-15, 18-19 | `name`, `short_name`, `description`, `background_color: "#FDFCF8"`, `theme_color: "#1B2A52"` | Màu giữ nguyên theo D10 | med |
| `apps/web/src/lib/metadata.ts` | 65-70, 81, 87 | `DEFAULT_OG_IMAGE` + comment nói `logo` đang dùng lại tấm OG card thay cho một raster vuông riêng | Tự động đi theo file PNG. **Rebrand là thời điểm tự nhiên để ship một logo Organization vuông thật sự** — schema.org kỳ vọng một logo, không phải social card 1.9:1 | low |
| `apps/web/src/app/globals.css` | 19-38, 63-64, 91, 93 | `--accent #D4623C /* DTW coral */`, `--brand-navy #1B2A52`, `--brand-amber`, `--banner`, 6 màu pillar, dark override, cầu nối Tailwind | Theo D10: chỉ đổi text comment. **Nếu chọn repaint**, `--brand-navy` có 20 chỗ dùng ngoài logo, trải trên 12 file (`studio:179,185`, `contact:106,112`, `press:160,166`, `advertise:348,354,384`, `newsroom:291,396,518,580`, `dashboards/loading.tsx:12`, `ai-leaderboard.tsx:346`, `related-row.tsx:31`, `section-header.tsx:23`, `footer.tsx:74`, `header.tsx:517`, `packages/ui/src/button.tsx:53`) | med |
| `apps/web/src/components/cover-art.tsx` | 20-45, 287, 366-379 | ~46 hex hardcode: 12 palette pillar (gồm `latest: ["#7C2D12","#E04E1F",…]` — **`#E04E1F` là màu coral trước đợt refresh, đã bị invariant #7 khai tử**), palette avatar, 12 màu thành phố | Bề mặt màu brand lớn thứ hai; cố tình đi vòng qua hệ token. Tối thiểu là bỏ `#E04E1F` đã cũ | med |
| `apps/web/src/components/home/home-hero.tsx` | 33 | `label="DTW HERO"` | Cũng là nguồn glyph cho CoverArt variant 5; vô hại chỉ vì `variant={0}` được ghim cứng ở đây | med |
| `design/project/uploads/dtw-logo-primary.svg` | 1-27 | Bản copy handoff — **đã lệch sẵn**: navy `#1E3A8A` (không phải `#1B2A52`), chấm `#F59E0B` (không phải `#D4623C`), font JetBrains Mono/Inter (không phải IBM Plex). md5 khác với bản trong `public/` | Chọn một: rebrand đồng bộ, hoặc đóng băng bundle và ngừng viện dẫn nó như source-of-truth trong invariant #11 và `uxui:153` | low |
| `design/project/uploads/DTW-Brand-Guideline-v1.0.pdf` | 69 pp | **Trích xuất được text** (`pdftotext`). §1.3 core concept = "Daily Pulse"; §1.4 tagline phụ **"From Asia, for the world"** (không được ghi ở bất kỳ chỗ nào khác); §2.6 một manifest asset chuẩn gồm **8 file** (ở đây chỉ tồn tại 1); §11 "wordmark typeface always Inter Bold" (production ship IBM Plex Sans); §12.1 `[brand] = "dtw" cho mọi asset`; parent ghi tên là **"Asia Press Corporation"** (đã bị thay thế) | Cần brand owner tái phát hành bản v2.0. **Đọc nó trong giai đoạn quyết định** — chính nó biến D8 thành câu hỏi ở tầm mark | med |
| `design/project/uploads/pasted-1779960345031-0.png` | binary 468×51 | Một bản raster của tagline `Tech Intelligence, Wired Daily` | Grep không thấy. Render lại hoặc xoá theo D8 | med |
| `design/project/src/header.jsx` | 1, 3, 7, 11, 19, 24, 26, 48, 57, 137, 312-314 | Lockup prototype + tagline + copy nudge ×3 locale + `dtw-nudge-dismissed` | Prototype — chỉ cập nhật nếu vẫn giữ bundle đồng bộ | low |
| `design/project/src/{legal,about,footer,contact,advertise,studio,trust,article,homepage,ui,data,newsletters,auth,pillar,app,art,i18n}.jsx` | ~120 hit | Bản copy prototype đầy đủ của mọi bề mặt reader, gồm 25 hit trong `legal.jsx` và 16 trong `about.jsx` | Như trên. `design/README.md` định vị bundle là tham chiếu thị giác chứ không phải code để port — đây là lý do nên đóng băng | low |
| `design/project/index.html` | 6, 21 | `<title>Dailytechwire, Asia & Global Tech</title>`, `--accent:#D4623C; /* DTW coral */` | Title cũng scope về "Asia Tech", đã bị invariant #14 khai tử | med |
| `design/README.md` | 9, 11, 23, 24, 25 | `dtw/chats/`, `dtw/project/` — **các đường dẫn này hiện đang hỏng** (thư mục thực tế là `design/`) | Dù sao cũng sửa đường dẫn; thêm một banner "pre-rebrand" có ghi ngày để agent nào làm theo "đọc chats trước" không dựng lại mark cũ | low |
| `DTW_WEBSITE_REQUEST.xlsx` | sheet `Tính năng` r2c3, r22c3 | `"Logo DTW + khẩu hiệu nhỏ…"`, `"Khối 'DTW Studio Presents' – NỀN VÀNG NHẠT (#FEF3C7)…"` | Đúng 2 ô có brand. **Bản trùng giống hệt từng byte** ở `design/project/uploads/DTW_WEBSITE_REQUEST.xlsx` (md5 `28473f21…`). Đổi tên nghĩa là phải cập nhật 3 chỗ trích dẫn | low |

### 3.6 data-cms-db — live rows, không phải sửa repo

| File | Dòng | Hiện tại | Đề xuất | Rủi ro |
|---|---|---|---|---|
| `apps/web/src/payload/collections/Articles.ts` | 31 | `"Every story DTW publishes. Engine drafts flow in via API; editors review here."` | Mô tả collection mà editor nhìn thấy. Chuỗi brand duy nhất trên cả 14 collections + 2 globals | low |
| `apps/web/src/payload/payload-types.ts` | 318 | Bản JSDoc sinh tự động, mirror của dòng trên | **Regenerate**, đừng sửa tay: `pnpm --filter web payload generate:types` | low |
| `apps/web/scripts/seed-payload.ts` | 219 | `slug: "dtw-studio-aws-asean"` | Upsert chạy theo slug (L547) — đổi slug là tạo ra một row published **thứ hai**, không phải rename. URL đang live → cần một redirect | med |
| `apps/web/scripts/seed-payload.ts` | 224, 233 | `"A DTW Studio Presents feature… The DTW newsroom was not involved…"` + phần body copy Lexical | Disclosure sponsored ×2 | med |
| `apps/web/scripts/seed-payload.ts` | 267 | `"Every article on Dailytechwire that used an AI tool carries a disclosure box."` | **Lần thứ tư của lời hứa /trust/ai chưa được giữ** — lần này nằm ngay trong body copy của bài | med |
| `apps/web/scripts/seed-payload.ts` | 455 | `name: "DTW Admin"` | Có guard (L445-452) — bỏ qua nếu email admin đã tồn tại, nên nó sẽ không update một admin prod đã seed | low |
| `apps/web/scripts/seed-payload.ts` | 64-65, 87 | Comment: contract của byline pool bên engine; `"awards" / DTW Awards` không được seed | Byline pool phải khớp chính xác với DTW_BYLINES trong `content-engine/src/lib/publications/dtw/index.ts` | low |
| `apps/web/src/lib/data.ts` | 1, 127, 249, 254, 597, 609 | `// DTW sample data`; `role: "DTW"`; `dtw-studio-aws-asean`; dek của disclosure; `"DTW Awards"`; `"DTW Daily Brief"` | Được mirror tại `apcg-cms/scripts/seed.ts:277,281` — sửa một bên là bên kia drift âm thầm | med |
| `data-exports/articles_images.csv` | 9, 116, 156, 2665, 3270 | `"At DailyTechWire, we've tracked…"` nằm trong **các dek đã published** | **Đừng sửa file CSV** — nó chính là tín hiệu phát hiện cho một đợt rewrite live-DB. Theo D13 | **high** |
| `data-exports/articles_images.csv` | toàn bộ file | `site=dtw` trên 1,063 rows; `hero_image_url` nằm dưới `…/hero-images/dtw/2026/…` | Freeze cả hai. Đổi tên storage prefix sẽ làm mọi hero image đã published thành mồ côi | **high** |
| `data-exports/feeds.csv` | 15 rows | `publication_targets: ["dtw"]` / `["dtw","briefasia"]` | Freeze — phải bằng đúng `publications.slug` bên engine | low |
| `data-exports/README.md` | 4, 8, 26, 39, 41, 48, 82 | Dòng 39 ghi lại enum dùng chung giữa các property `dtw \| briefasia \| wad \| gcv \| wtb`; **dòng 8 nói sai rằng thư mục này đã được gitignore** | Sửa dòng 8; bộ vocabulary `site` chính là bằng chứng để freeze `dtw` | med |
| `data-exports/export-image-research.cjs` | 1, 5 | Hai đường dẫn tuyệt đối `/home/hieunc/Code/dtw-web/…` hardcode | Hỏng nếu D7 đổi tên thư mục local | low |
| `apcg-cms/scripts/seed.ts` | 207-208 | `slug: "dtw"`, `name: "DailyTechWire"` | **Chỉ đổi `name`.** Freeze `slug` theo D11 | **high** |
| `apcg-cms/scripts/seed.ts` | 267, 277, 281, 447-448, 462, 481 | `"DTW Awards"` (+ description ×2), `"DTW Daily Brief"`, `show: "DTW"`, `if (t.slug === "dtw")` | Các chuỗi newsletter/podcast **đã là live rows** — sửa seed chỉ ngăn một lần re-seed đưa chúng trở lại. Vẫn cần một `UPDATE` riêng hoặc sửa tay trong /admin | **high** |
| `apcg-cms/src/collections/Tenants.ts` | 57 | `"Stable publicationId (e.g. brief-asia, dtw)… Never change after launch."` | Theo D11 — freeze. `unique` + có `index` + chỉ system admin được ghi | **high** |
| `apcg-cms/src/collections/Tenants.ts` | 48, 73, 79, 85, 92, 93, 95-100, 132-138, 144-150, 154-158, 204 | Tenant `name`, `domain`, `additionalDomains`, `frontendUrl`, `logo`, `brandColor`, `brand.{faviconUrl,ogImageDefault,themeTokens}`, `seo.{titleSuffix,defaultMetaDescription,defaultOgImage,twitterHandle}`, `contact.{general,editorial,advertising,partnerships}Email`, `socials[]`, `readTokens` | **Row có đòn bẩy lớn nhất trong cả đợt rebrand** — đổi chrome của site mà không cần deploy. Website Admin sửa được tất cả trừ `domain`/`additionalDomains`/`frontendUrl` (chỉ System Admin) | **high** |
| `apcg-cms/src/collections/Articles.ts` | 95, 105, 106, 352 | `title`, `dek`, `body` (đều `localized: true`), `contentType` | Audit `articles_locales` **và** `_articles_v_locales`. Rewrite `body` Lexical theo từng node qua Local API, tuyệt đối không `regexp_replace` trên JSON | **high** |
| `apcg-cms/src/collections/Authors.ts` | 20, 47, 50 | `name`, `role`, `bio` | **Có cả `name`.** Byline `DTW Briefing Desk` từ engine tự tạo một author row theo name (`apcg-cms/src/app/api/engine/intake/route.ts:481-494`) | **high** |
| `apcg-cms/src/collections/Media.ts` | 122, 123, 130 | `alt`, `caption` (localized); `prefix` (hook khoá theo tenant) | **Đừng đụng vào `prefix`.** `Media.ts:6-19` nói rõ prefix chỉ ghi một lần lúc create và cố tình không bao giờ rewrite. Audit `alt` theo đúng hit-set của title — caveat 3 trong `data-exports/README.md` nói `alt` bên CMS được điền từ title | **high** |
| `apcg-cms/src/collections/Corrections.ts` | 13, 14, 15 | `summary`, `wasText`, `nowText` (localized) | Quyết định thuộc editorial policy: log corrections là một bản ghi lịch sử | med |
| `apcg-cms/src/collections/SponsorSlots.ts` | 19-39 | 4 giá trị enum của slot, gồm cả `promo_card`; `name` free-text; `headline`/`body`/`ctaLabel` localized; `ctaUrl` | Audit các field free-text và `ctaUrl` xem có link domain cũ không. Giá trị enum giữ nguyên | med |
| `apcg-cms/src/collections/WireDrops.ts` | 17 | `text` (localized) | Audit `wire_drops_locales.text`, **không phải** `wire_drops` | low |
| `apcg-cms/src/collections/Menus.ts` | 28, 34 | `label` (localized) ở cả cấp item lẫn cấp child | Nav label là thứ reader nhìn thấy và do DB điều khiển — một đợt rebrand chỉ động vào code sẽ bỏ sót hoàn toàn | med |
| `apcg-cms/src/collections/Subscribers.ts` | 32, 39, 46, 68 | Không có field brand nào | Nghĩa vụ thông báo cho người đăng ký trước bất kỳ thay đổi From-name nào | med |
| `apcg-cms/src/collections/{Pillars,Cities,AiLeaderboardRows,FundingRows,SponsorSlots,Authors}.ts` | 10, 12, 6, 6, 8/29, 38 | Doc comment giới hạn hành vi vào DTW | Chỉ là comment | low |
| `apcg-cms/src/lib/constants.ts` | 19 | `"dashboards", // … (DTW dashboards)` | Chỉ là comment. Chuỗi FEATURE_KEY không dính brand và được persist trên các tenant row | low |
| `apcg-cms/src/app/api/public/{articles,cities}/route.ts` | 144, 4 | Comment có nhắc tên DTW | Chỉ là comment | low |
| `apcg-cms/src/app/api/engine/intake/route.ts` | 7, 15, 481-494 | `"the live brief-asia/DTW engine contract"`; một con trỏ đường dẫn tới `content-engine/admin/src/lib/dtw-intake-client.ts`; `resolveOrCreateAuthor` theo name | L15 thành trỏ hụt nếu file bên engine bị đổi tên. L481-494 là lý do author row phải được rename **tại chỗ**, không phải tạo lại | **high** |
| `apcg-cms/.env.example` | 41-43 | Ví dụ của `PUBLIC_API_ALLOWED_ORIGINS` liệt kê `https://dailytechwire.com` | **Thêm origin mới vào production TRƯỚC khi site bắt đầu phục vụ nó.** Được enforce tại `payload.config.ts:67` và `src/lib/public.ts:16`. `central-api.ts` xử lý lỗi thành kết quả rỗng thay vì throw → failure mode là một **site rỗng mà không báo gì** | **high** |
| `apcg-cms/scripts/{db-status,migrate/export-source,migrate/backfill-author-slugs,migrate/import-central}.ts` | 8; 3, 102; 14; 44/150/185/193/251 | Lệnh cho operator + comment | `export-source.ts:102` (`"Measured on the dtw cutover: 1 article of 1245"`) là một **phép đo lịch sử — đừng viết lại** | low |
| `apcg-cms/README.md`, `docs/{02,06,08,09,12,14}*.md`, `docs/db-design.html`, `src/payload-types.ts`, `process/general-plans/active/brief-content-type_PLAN_20-08-26.md` | nhiều chỗ | Docs + một author seed **đang pending** `role: "Dailytechwire Newsroom"` (L115) | **`brief-content-type_PLAN:115` là món hời rẻ nhất trong cả estate** — được đánh dấu "CODE COMPLETE, chưa migrate", nên chuỗi này **chưa nằm trong DB**. Một lần sửa text bây giờ, đổi lại một đợt data migration trên production + đính chính byline về sau | **high** |
| `packages/db/src/schema/auth.ts` | 34, 50 | `auth_users` + unique index trên email | Bảng này không có brand. **Audit xem có tài khoản staff nào còn dùng email domain cũ không** trước bất kỳ đợt migration mailbox nào — email chính là login identity của Better-Auth | med |

**Các query audit (chạy read-only trước khi lập kế hoạch; nghiên cứu này chưa chạy câu nào):**

```sql
-- Central: does any article/dek/body still name the old brand?
SELECT id, title FROM articles_locales
 WHERE _parent_id IN (SELECT id FROM articles WHERE tenant_id=(SELECT id FROM tenants WHERE slug='dtw'))
   AND (title ILIKE '%dailytechwire%' OR dek ILIKE '%dailytechwire%' OR body::text ILIKE '%dailytechwire%');
-- repeat for _articles_v_locales (drafts) — drafts last, published first

-- Authors (name IS in scope: 'DTW Briefing Desk')
SELECT id, name, role FROM authors
 WHERE tenant_id=(SELECT id FROM tenants WHERE slug='dtw')
   AND (name ~ '\yDTW\y' OR name ILIKE '%dailytechwire%' OR role ~ '\yDTW\y' OR role ILIKE '%dailytechwire%');

-- Media alt/caption (populated from title, so expect the same hit-set)
SELECT id, alt FROM media_locales
 WHERE _parent_id IN (SELECT id FROM media WHERE tenant_id=(SELECT id FROM tenants WHERE slug='dtw'))
   AND (alt ILIKE '%dailytechwire%' OR caption ILIKE '%dailytechwire%');

-- Nav labels, wire drops, corrections, sponsor slots
SELECT * FROM menus_items_locales WHERE label ILIKE '%dtw%' OR label ILIKE '%dailytechwire%';
SELECT * FROM wire_drops_locales WHERE text ILIKE '%dtw%';
SELECT * FROM corrections_locales WHERE summary ILIKE '%dtw%' OR was_text ILIKE '%dtw%' OR now_text ILIKE '%dtw%';
SELECT * FROM sponsor_slots_locales WHERE headline ILIKE '%dtw%' OR body ILIKE '%dtw%' OR cta_label ILIKE '%dtw%';
SELECT id, name, cta_url FROM sponsor_slots WHERE name ILIKE '%dtw%' OR cta_url ILIKE '%dailytechwire%';

-- Engine Supabase: display name + brief byline (BOTH are live rows, not migrations)
SELECT slug, name FROM publications WHERE slug='dtw';
SELECT byline FROM brief_configs WHERE publication_id=(SELECT id FROM publications WHERE slug='dtw');
SELECT count(*) FROM social_posts WHERE publication_id=(SELECT id FROM publications WHERE slug='dtw') AND status='queued';

-- dtw-web auth DB: staff accounts on the old mail domain
SELECT id, name, email, role FROM dtw_auth.auth_users
 WHERE email ILIKE '%@dailytechwire.com' OR name ILIKE '%dailytechwire%' OR name ~ '\yDTW\y';

-- Newsletter obligation count before any From-name change
SELECT count(*) FROM subscribers WHERE tenant_id=(SELECT id FROM tenants WHERE slug='dtw');
```

### 3.7 content-engine — service duy nhất vẫn liên tục đẻ ra brand cũ

Path prefix: `/home/hieunc/Code/content-engine/`. 228 file có mang brand token. Bốn nhóm đáng quan tâm:

| File | Dòng | Hiện tại | Đề xuất | Rủi ro |
|---|---|---|---|---|
| `src/lib/publications/dtw/index.ts` | 50-56 | `DTW_VOICE_SPEC` — **system prompt của rewriter**, bắt dùng ngôi thứ nhất số nhiều và trích ví dụ mẫu `"At DailyTechWire, we've tracked..."` | **Đây là mục có giá trị cao nhất trong cả đợt rebrand.** Để nguyên thì mọi bài mới sinh ra vẫn tự viết brand đã chết vào chính thân bài. Đã chứng minh bằng thực nghiệm: `process/features/openrouter-migration/references/bench/dtw_1.md` và 8 file benchmark cùng loại đều có chỗ model lặp lại đúng cụm đó | **high** |
| `src/lib/publications/dtw/index.ts` | 90 | `name: 'DailyTechWire'` | Là bản sao của row trong DB; phải đổi cả hai, không thì admin và code nói khác nhau | med |
| `src/lib/publications/dtw/index.ts` | 148 | `byline: 'DTW Briefing Desk'` | **Chỉ là fallback** — giá trị đang chạy thật là `brief_configs.byline` (trong DB, sửa được ở `/briefs/settings`). Đổi cả hai | **high** |
| `src/lib/publications/dtw/index.ts` | 150, 190 | `siteBaseUrl: 'https://www.dailytechwire.com'` ×2 (briefConfig + socialConfig) | Trùng lặp là cố ý (`types.ts:120-127`); cái giá phải trả là "2 chuỗi phải sync tay khi đổi domain". Giờ đúng là lúc đó | **high** |
| `src/lib/publications/dtw/index.ts` | 165, 166 | `displayName: 'DailyTechWire'`, `domain: 'dailytechwire.com'` | Config của social card | **high** |
| `src/lib/publications/dtw/index.ts` | 177 | `kicker: 'DAILYTECHWIRE.COM'` | **Nung thẳng vào file PNG social card 1080×1080 đã render.** Card đã đăng rồi thì không sửa được | **high** |
| `src/lib/publications/dtw/index.ts` | 182-183 | `logoAssetUrl: '…supabase.co/storage/v1/object/public/hero-images/logos/dtw-monogram.png'` | Upload monogram mới vào một object key **mới**; đừng ghi đè khi các bài đang xếp hàng vẫn trỏ vào cái cũ. Nguồn là `dtw-web/apps/web/public/icon-512.png` | **high** |
| `src/lib/publications/dtw/index.ts` | 186 | `utmCampaign: 'dtw-social'` | Đóng băng — đã nằm trong các URL social đã đăng và trong lịch sử GA4. Bản trùng phải sync tay ở `admin/src/lib/social-configs.ts:118` | med |
| `src/lib/publications/dtw/index.ts` | 89 | `id: 'dtw'` | Theo D11 — đóng băng. Đây chính là `PublicationId` | **high** |
| `src/lib/publications/dtw/index.ts` | 30-41, 122 | `DTW_BYLINES` — 10 bút danh tổng hợp | Rebrand không đụng tới; phải khớp với masthead đã công bố. Trùng ở `admin/src/lib/byline-policy.ts:243-255` và `dtw-web/apps/web/scripts/seed-payload.ts:64-78` | low |
| `src/social/prompts/social-rules.prompt.ts` | 33-35 | `"On BriefAsia / DailyTechWire / GlobalTravelPost captions: no services, no prices…"` | Prompt LLM thứ hai có mang tên brand. Gọi sai tên tờ báo làm model tuân rule kém đi | **high** |
| `admin/src/lib/brief-configs.ts` | 51 | `SITE_NAMES.dtw = 'DailyTechWire'` | **Chạy lúc generate.** Render ra thành `_Compiled by {byline} from {siteName} reporting._` ở cuối mỗi Daily Brief | **high** |
| `admin/src/lib/brief-configs.ts` | 35-38 | `siteBaseUrl: 'https://www.dailytechwire.com'` | Bản sao thứ ba. Comment ngay trong file (24-28) dặn phải sửa ở đây **và** trong registry | **high** |
| `admin/src/lib/brief-payload.ts` | 62-67, 243 | `` blocks.push(`_Compiled by ${config.byline} from ${config.siteName} reporting._`) `` | Chính là cái template — sửa hai đầu vào của nó, rồi kiểm lại output đã render | **high** |
| `admin/src/lib/publish-social.ts` | 59-61 | `function envSuffix(pubSlug) { return pubSlug.toUpperCase(); }` | **Lập luận mạnh nhất ủng hộ D11.** Tên env var được suy ra từ slug lúc runtime — đổi slug là ngầm bắt buộc phải có `FB_PAGE_ID_OTW`/`FB_PAGE_TOKEN_OTW`/`LI_ORG_URN_OTW`, mà không hề có lỗi build hay lỗi type nào | **high** |
| `admin/src/lib/dtw-intake-client.ts` | 99, 174 | `publicationId: 'dtw'` trong body của intake | Wire contract xuyên repo; Central **từ chối** publicationId không nhận diện được | **high** |
| `admin/src/lib/dtw-intake-client.ts` | 27, 155-156 | `INTAKE_PATH`, `process.env.DTW_INTAKE_URL/TOKEN` | Cái vỡ là **giá trị**, không phải cái tên. Thứ tự: dtw-web phải phục vụ host mới trước rồi engine mới lật | **high** |
| `admin/src/lib/dtw-intake-client.ts` | cả file | tên module + `DtwPublishArticle`/`publishToDtw` + các chuỗi lỗi | Đổi tên chỉ là thẩm mỹ, tuỳ chọn; làm hỏng ~20 link markdown trong `docs/` | low |
| `admin/src/lib/publish-dtw.ts` | 83, 99, 153 | `if (slug !== 'dtw') { … }` — một **safety guard** | Nếu slug trong DB đổi mà literal này không đổi, **mọi bài DTW âm thầm ngừng publish trong khi vẫn trông khoẻ mạnh** (bị skip, không phải fail). Đây là kiểu hỏng nguy hiểm nhất khi đổi slug | med |
| `admin/src/app/api/cron/publish-dtw/route.ts` | cả thư mục route | `/api/cron/publish-dtw` + 6 slug literal + các prefix log | **Đóng băng path.** Vercel không báo lỗi khi cron trỏ vào một path không tồn tại — nó chỉ ngừng chạy. Route này cũng là nơi lo phần stuck-recovery | **high** |
| `admin/vercel.json` | 8-11 | `{ "path": "/api/cron/publish-dtw", "schedule": "*/15 * * * *" }` | Chỗ duy nhất còn lại có path đó. Nếu đổi tên thì phải đổi trong cùng một commit | **high** |
| `admin/src/lib/publish-caps.ts` | 28-35, 71, 78 | union `PublishCapSlug` + các map cap ngày thường/cuối tuần | Đóng băng. `getCapStatus()` **fail-close** — slug lệch là ngừng publish | med |
| `admin/src/lib/byline-policy.ts` | 243-260 | block policy `dtw:`; **dòng 256: `site đang bị Google manual action`; `hardDailyCap: 4`** | Đóng băng key. **Dòng 256 chính là dữ kiện chi phối toàn bộ quyết định về domain** | **high** |
| `admin/src/lib/social-configs.ts` | 9, 12-15, 24, 118 | union `SocialPublicationSlug`; `SOCIAL_SITE_NAMES.dtw = 'DailyTechWire'`; `UTM_CAMPAIGN.dtw` | **Chỉ** đổi display name ở :24 | med |
| `admin/src/app/(authed)/briefs/settings/settings-card.tsx` | 51, 347 | `placeholder="DTW Briefing Desk"` | Editor nhìn thấy. Placeholder cũ sẽ đưa brand cũ quay lại DB | low |
| `admin/src/app/(authed)/article/[id]/actions.ts` | 8, 30, 53, 88-89, 203 | `if (slug === 'dtw') { publishDtwArticle(id) }` | Nhánh routing theo slug thứ hai | med |
| `admin/.env.example` | 21-24 | `DTW_INTAKE_URL=https://dailytechwire.com` | **Trỏ vào APEX** trong khi registry dùng `www` — bất nhất có sẵn từ trước. Một POST đi qua 301 có thể bị hạ xuống thành GET, âm thầm làm rơi mất body | **high** |
| `admin/.env.example` | 135-137, 142 | `# Facebook Page — DailyTechWire`, `FB_PAGE_ID_DTW`, `FB_PAGE_TOKEN_DTW`, `LI_ORG_URN_DTW` | Comment là chữ nghĩa; tên var thì suy ra từ slug. **Display name** của Page/Org là chuyện đổi tên ở bên ngoài | med |
| `admin/.env.example` | 63, 71, 81, 148 | 4 CSV env trên Vercel đánh key theo slug: `PUBLISH_DAILY_CAPS`, `AUTOPUBLISH_CAPS`, `BRIEF_PUBLISH_PUBS`, `SOCIAL_POST_PUBS` | Tất cả đều được ghi rõ là **thiếu = OFF, mặc định an toàn** → slug lệch là ngừng chạy trong im lặng | **high** |
| `.github/workflows/brief.yml` | 33, 58-60 | `gh variable set BRIEF_COMPOSE_PUBS --body 'dtw,briefasia,wtb'` | **Variable của GitHub repo — nằm ngoài mọi repo.** Thiếu = 0 publication được compose, mà run vẫn xanh. Kiểm bằng `gh variable list` | **high** |
| `.github/workflows/social-produce.yml` | 32, 57-59, 111 | `SOCIAL_PRODUCE_PUBS`; secret `FB_PAGE_TOKEN_DTW` | Cùng nhóm. Token bị trùng ở cả secrets của Vercel **và** của GH Actions | **high** |
| `.github/workflows/pipeline.yml` | 6, 17-19, 104 | Quota rewrite theo từng publication, đánh key theo `dtw` | Chỉ là comment kế toán | low |
| `src/lib/env.ts` | 36-39, 133 | zod: `DTW_INTAKE_URL`, `DTW_INTAKE_TOKEN` (cả hai đều `.optional()`), `FB_PAGE_TOKEN_DTW` | Optional → đổi tên là hỏng **âm thầm** ở đây, không có `exit(1)` | med |
| `src/lib/publications/registry.ts` | 12, 16-22 | `import { dtw }` + key trong registry | `PublicationId = keyof typeof registry`. Đổi tên ở đây thì compiler kiểm được; còn DB, 4 CSV env, 2 GH variable và các tên FB/LI suy ra thì **không** | **high** |
| `config/sources.yaml` | 15, 647-650, + 16 mục `publication_targets` (658, 669, 680, 691, 704, 715, 727, 738, 750, 761, 772, 783, 794, 806, 818) | `publication_targets: ["dtw"]` / `["dtw","briefasia"]` | `src/jobs/editorial-job.ts:290` **âm thầm bỏ qua** slug không nhận diện được → đổi tên là huỷ đăng ký 16 nguồn RSS mà không báo lỗi. Cũng lưu ý dòng 648-649 vẫn còn nhắc pillar `asia` đã bị bỏ (drift có sẵn từ trước) | **high** |
| `supabase/migrations/001_initial.sql` | 12, 24, 34, 65 | `('dtw', 'DailyTechWire', 'engine-side', …)`; các comment về slug; JSONB `filter_scores` **đánh key theo slug** | **Đừng sửa migration đã apply.** `UPDATE publications SET name=… WHERE slug='dtw';` | **high** |
| `supabase/migrations/016_daily_briefs.sql` | 136-138 | Seed `brief_configs.byline = 'DTW Briefing Desk'` | **Đừng sửa.** `UPDATE brief_configs SET byline=… ;` hoặc sửa ở `/briefs/settings` | **high** |
| `supabase/migrations/017_social.sql` | 41-95, 64, 130, 137 | bảng `social_posts`: `canonical_url`, `card_image_url`, `li_caption`, `fb_caption`, `image_headline`, `alt_text` | Cả một bảng nội dung đang sống. Các PNG ở `card_image_url` có kicker **nung sẵn bên trong** — phải render lại, chứ không phải sửa chữ | med |
| `supabase/migrations/{009,010,011,012,014}` | nhiều chỗ | Slug chỉ xuất hiện trong comment | Đã apply; không cần làm gì | low |
| `src/social/{slots,select,render,validator,first-paragraph}.ts` | 15/35/53/58; 91/171; 82; 503; 5-6 | Bảng slot đánh key theo slug; **`select.ts:91` dùng pub id làm một segment trong path của Supabase Storage** | Đổi slug là card mới ghi xuống dưới một prefix khác, bỏ rơi đám object đang có | med |
| `src/editorial/prompts/{style-rules,rewrite,classify,daily-brief}.prompt.ts` | 2/7; 23/29; 16/44; 23 | Brand chỉ nằm trong **header JSDoc** | **Đã xác minh là không chạy lúc generate** — phần thân prompt phát ra không mang brand nào. Brand chỉ tới được model qua `pub.voiceSpec` | low |
| `src/editorial/{rewriter,classifier,brief-validator,brief-web-articles-client,credit-normalizer,image-uploader}.ts` | nhiều chỗ | Chỉ là comment | Không có brand literal | low |
| `src/editorial/image-uploader.ts` | 191, 199, 214 | `` const path = `${brand}/${new Date().getFullYear()}/${slug}-${hash}${ext}` `` | **Chủ sở hữu của `hero-images/dtw/`.** Ràng buộc khó nhất với D11: đổi tên là bỏ rơi hero URL của mọi bài đã xuất bản | **high** |
| `scripts/social-render-poc.ts` | 18, 78, 88, 99, 107, 143-145, 157, 347 | `--upload-logo=dailytechwire`; hardcode `/home/hieunc/Code/dtw-web/apps/web/public/icon-512.png`; `logos/dtw-monogram.png`; các chuỗi hiển thị | **Đây chính là công cụ upload monogram.** Phải cập nhật (hoặc dùng nguyên trạng) trước khi `logoAssetUrl` có thể trỏ tới thứ gì có thật | med |
| `scripts/social-manual-post.ts` | 17, 20-21, 63, 66-67, 137, 188 | Facebook Page ID đang chạy `1187507051122718`; `$HOME/fb-page-tokens-dtw.json` | ID dạng số sống sót qua đợt đổi tên; chỉ **display name** của Page là đổi | med |
| `scripts/social-probe-tokens.ts` | 46 | `{ slug: 'dtw', tokenEnv: 'FB_PAGE_TOKEN_DTW' }` | Chỗ **thứ ba** ghi tên env FB, và nó hardcode chứ không suy ra | med |
| `scripts/_diag-dtw-{dow,drop,history}.ts` | tên file + ~60 chỗ trong thân | Tự khai `TEMP … Xoá sau` | **Xoá cả ba** — bỏ được 3 chỗ ở tên file và ~60 chỗ trong thân, chi phí bằng không | low |
| `scripts/{verify-db,audit-sources,check-backlog,import-sources-xlsx}.ts` | 47/56; 275; 48; 106 | Danh sách assertion về slug; parser token viết hoa→slug | `verify-db.ts` là cổng kiểm tra dùng lại được sau khi đổi | low |
| `src/lib/publications/__tests__/brief-config.test.ts`, `src/social/__tests__/select.test.ts`, `src/editorial/__tests__/brief-web-articles-client.test.ts` | 29/67; 53/117; 22 | Các assertion hardcode `https://www.dailytechwire.com` | **Tin tốt:** đám này sẽ fail ầm ĩ khi đổi domain và liệt kê ra mọi bản sao bị bỏ sót. Chạy `npm test` ngay sau đó | med |
| `deploy/DEPLOY.md`, `docs/{CODEBASE,HANDOVER,WRITING_PIPELINE,prompts-rewrite-current}.md`, `README.md`, `ContentEngine-Wire.md`, `apcg-social-engine-spec_19-08-26 (1).md` | nhiều chỗ | Runbook + **hai bản chép đầy đủ của voiceSpec** kèm cả ví dụ mẫu `"At DailyTechWire"` | Sync lại `WRITING_PIPELINE.md` và `prompts-rewrite-current.md` — file sau được nêu rõ là bề mặt để sửa tay, nên một bản cũ sẽ dễ dẫn tới việc dán brand cũ ngược vào prompt đang chạy | med |
| `process/context/{all-context,infra/all-infra,uxui/all-uxui,database/all-database,tests/all-tests}.md` | 18 / 14 / 5 / 2 / 1 chỗ | Tài liệu router; `infra:118` ghi intake URL đang chạy là **apex** | Cập nhật — đây là những file mọi agent về sau đọc đầu tiên. `all-context.md:216` còn nhắc tới một **org** GitHub tên `dailytechwire` | med |
| `process/features/dtw-integration/references/cutover-runbook.md` | 281 dòng | Tiền lệ cho đúng kiểu cutover xuyên repo này | **Dùng lại làm template cho thứ tự thực hiện.** Vẫn còn đúng: ma trận secret ở §C (246-267), phụ lục chuỗi phụ thuộc (271-280). **Đã cũ:** toàn bộ phần VPS/PM2 (bỏ từ 27-08-26) và các path macOS | low |
| `process/features/{social-engine,daily-brief,openrouter-migration,kpi-compliance}/`, `process/general-plans/` | ~116 file | Plan cũ, report, output benchmark | **Đừng viết lại** — đây là bản ghi tại một thời điểm. Các chỗ nhắc brand trong file bench của `openrouter-migration` chính là *bằng chứng* | low |
| `.claude/settings.json` | 26, 41, 43, 53, 57-64 | Các path macOS cũ `/Users/hieuhn09/...` | Chết trên máy này; chỉ là thẩm mỹ | low |

**Nguy cơ từ worktree:** `/home/hieunc/Code/content-engine-kpi-gd1-publish-caps` là một worktree đang hoạt động, đã được đăng ký, nằm trên branch `feat/byline-wad-gcv` (đi trước 1 commit, chưa merge). Nó **không** thêm chuỗi brand mới nào, nhưng nó có sửa `admin/src/lib/publish-dtw.ts`, `admin/src/lib/byline-policy.ts` và test của file đó. **Merge hoặc rebase trước khi rebrand**, không thì chuẩn bị đón xung đột văn bản.

### 3.8 Cụm repo anh em của APCG

| Repo / đường dẫn | Dòng | Hiện tại | Đề xuất | Rủi ro |
|---|---|---|---|---|
| `/home/hieunc/Code/media-engine/src/lib/types.ts` | 13 | `export type SiteCode = 'WTB' \| 'GCV' \| 'WAD' \| 'DTW' \| 'BRIEFASIA'` | Có thể đổi tên **độc lập** với slug — xem cái seam bên dưới. Chi phí: 9 chỗ trong code + 1 test | med |
| `media-engine/src/lib/config.ts` | 51, 54-56 | `SITES = [...]` + một cross-check `_sitesCheck` ở compile-time | tsc sẽ bắt được nếu rename làm nửa vời | med |
| `media-engine/src/lib/hero-resolve/site-map.ts` | 21, 26-29 | `SITE_BY_SLUG = { dtw: 'DTW' }` + `siteCodeOf` | **File có đòn bẩy lớn nhất trong cả cụm.** Quyết định B-D6 cố ý đặt mapping slug→code ở đây "để content-engine không bao giờ phải biết các code nội bộ của media-engine". Một entry hai key `{ otw: 'OTW', dtw: 'OTW' }` cho phép cutover zero-downtime | med |
| `media-engine/src/lib/hero-resolve/mapping.test.ts` | 50 | `expect(siteCodeOf('dtw')).toBe('DTW')` | Cái gate cơ học chứng minh mapping đã được áp dụng | low |
| `media-engine/src/lib/engine/upload.ts` | 81, 163 | `sites: ['WTB','GCV','WAD','DTW','BRIEFASIA']` ×2 | Mảng mặc định "cho phép ở mọi nơi" được đóng dấu lên mọi upload mới | med |
| `media-engine/src/state/renderVals.ts` | 741, 1624 | `SITE_PAL.DTW`; `libFilters.site` render thẳng code thô ra thành **label của filter-chip** mà editor nhìn thấy | Hoặc đổi tên code, hoặc thêm một display map `SITE_LABEL[code]` để code nội bộ được giữ đóng băng | med |
| `media-engine/src/lib/seed.ts` | 76, 83, 84, 94 | `sites:['WTB','DTW']` v.v. | Chỉ là mấy row seed IndexedDB cho demo/prototype | low |
| `media-engine/supabase/migrations/0001_hero_resolve_schema.sql` | 151, 162 | `site text not null, -- SiteCode: WTB\|GCV\|WAD\|DTW\|BRIEFASIA` | **Tin tốt: chỉ là `text` thuần, không CHECK, không enum Postgres** (đã kiểm chứng). Đổi tên chỉ là một câu `UPDATE` một dòng, không phải màn enum-shrink lằng nhằng. Và hero-resolve được tắt tường minh cho DTW (`phase-e-rollout_PLAN:67`), nên nhiều khả năng **không có row live nào** | low |
| `media-engine/src/lib/supabase/storage.ts` | 4-7, 22-27 | Bucket `hero-resolve-fallback` riêng, prefix `unsplash-fallback/`, chọn như vậy để nó "về mặt cấu trúc không thể đụng với scheme `${brand}/${year}/...` của content-engine" | **KHÔNG ĐỔI GÌ.** Chỗ này chốt luôn câu hỏi ai sở hữu cái gì: media-engine cố ý tránh namespace đánh khoá theo brand | low |
| `media-engine/.env.local` | — | `SUPABASE_URL=https://yjuunnmejferyrbmjjci.supabase.co`, `SUPABASE_STORAGE_BUCKET=hero-images` | **Đây là một fact về coupling, không phải chỗ cần sửa:** media-engine và content-engine dùng *chung* một project và một bucket Supabase | med |
| `media-engine/process/**` | ~15 file | Các plan ACTIVE (`hero-resolve_11-08-26/*`, `prototype-to-product_31-07-26/*`) với các ô acceptance **chưa tick** có nhắc DTW | Việc đang chạy, không phải archive — phải cập nhật | med |
| `/home/hieunc/Code/brief-asia-web/process/general-plans/completed/remove-dtw-leftovers_06-07-26/` | PLAN 254 dòng + REPORT | Một **pass de-branding đã hoàn thành trong đúng cụm repo này** | **Dùng lại làm template.** Những thứ chuyển được: một lệnh `git grep` có tên làm acceptance gate zero-hit chính thức; `tsc --noEmit` làm bằng chứng không còn tham chiếu treo; xác định chỗ cần sửa **theo nội dung, không theo số dòng** (số dòng của chính nó đã lệch 2) | low |
| `brief-asia-web/src/app/globals.css` | 23, 41 | `/* Compatibility aliases for cloned DTW components… */` | Chỉ là comment | low |
| `brief-asia-web/src/lib/cms-client.ts` | 97 | `Same pattern as DTW's getAiModels…` | Giống từng byte với `wad-web/src/lib/cms-client.ts:96` — một dấu hiệu nhận diện clone đáng tin | low |
| `brief-asia-web/src/lib/cms-client.central.ts` | 432 | `DTW carries the same gap.` | Chỉ là comment | low |
| `brief-asia-web/BUSINESS.md` | 10, 44, 788 | `The engine should not reuse DTW editorial voice.` | L788 là một ràng buộc biên tập đang có hiệu lực | low |
| `brief-asia-web/DESIGN.md` | 14, 115, 116, 151, 798, 815 | Nêu đích danh các mã hex của DTW `#D4623C`/`#1B2A52`/`#FDFCF8` như một **anti-pattern cần tránh** | **Nếu D10 đổi palette, cái guard rail này âm thầm ngừng bảo vệ BriefAsia** | med |
| `brief-asia-web/public/design-prototype.html`, `BriefAsia (full site).html` | 290 | 68 chuỗi con `DTW`, nhưng thực chất là **nhiễu base64 bên trong một data URI PNG nhúng** (không có `dailytechwire` nào) | **ĐỪNG ĐỘNG VÀO — LOẠI TRỪ KHỎI MỌI SED PASS.** Replace vào là hỏng ảnh | **high** |
| `/home/hieunc/Code/wad-web/src/lib/site-config.ts` | 72-80 (75) | `{ label: "DailyTechWire", url: "https://dailytechwire.com/" }` trong `NETWORK_TITLES` | Render ở footer của **mọi trang trên một site đang live**. Đổi label+URL cùng lúc, và chỉ sau khi domain mới resolve được | **high** |
| `wad-web/src/app/(reader)/[locale]/advertise/page.tsx` | 42-54 (44) | `["DailyTechWire", "Technology"]` — một danh sách network **thứ hai, độc lập**, với thành phần khác | Không sinh ra từ một nguồn chung; phải sửa cả hai | med |
| `wad-web/BUSINESS.md` / `wad-web/REBUILD_PLAN.md` | 78 / 69 | Bản copy thứ ba và thứ tư của danh sách network, đều duy trì thủ công | Sửa cả bốn, không thì site tự mâu thuẫn với chính nó | low |
| `wad-web/src/lib/cms-client.ts` | 96 | Comment DTW bị clone | low |
| `/home/hieunc/Code/APCG-web/assets/app.js` | 9-23 (10) | `{ sector: "Technology", title: "Daily Tech Wire", url: "https://dailytechwire.com", status: "live" }` | **Dạng viết tách chữ `Daily Tech Wire` DUY NHẤT trong cả cụm** — một lượt quét `s/DailyTechWire/…/` sẽ bỏ sót hoàn toàn | med |
| `APCG-web/index.html` | 10, 25, 26 | Canonical `https://asiapresscentre.com/` (giờ trả 308 sang `.org`); `<title>` ở local khác với cái production đang serve; `/assets/app.js` trên live **trả 404** | **Sự thật về deployment không rõ ràng** — repo local này có thể đã bị thay thế. Xác nhận trước khi bỏ công | med |
| `/home/hieunc/Code/wtb-web` | — | `grep` → **0 hit** | **Đã kiểm chứng là sạch. Ghi lại để không ai phải kiểm lại.** | — |
| `/home/hieunc/Code/DTW/.vercel/project.json` | cả file | `"projectName":"dtw-frontend"`, `prj_pqPQJ2X24xmwotkEAiHsPksngw3J`, org `team_EFUMF5rjY05UDBzSnlsZmPgk` | Theo D15 — **decommission.** Chưa rõ còn sống hay không: `dtw-frontend.vercel.app` trả 200 nhưng phục vụ một app MLB/ESPN chẳng liên quan, nên hostname đó là của người khác | **high** |
| `/home/hieunc/Code/DTW/vercel.json` | cả file | `"outputDirectory": "."` | Serve nguyên cả thư mục y như nó có — mọi file `src/*.jsx` đều tải về được dưới dạng source công khai | **high** |
| `/home/hieunc/Code/DTW/src/footer.jsx` | 112 | `© 2026 DailyTechWire Pte. Ltd. · Singapore (UEN 202612345A) · Member, Trust Project · ISSN 2811-7XXX` | **UEN bịa và ISSN chưa điền.** Rebrand sẽ mang chúng đi tiếp dưới tên mới | **high** |
| `/home/hieunc/Code/DTW/src/about.jsx` | 36-38, 175, 179, 310, 355, 358, 417, 450 | Gọi công ty mẹ là **"Asia Press Corporation"** (đã bị thay thế) và dùng **`dailytechwire.asia`** (một domain không thấy ở đâu khác) | Ba thế hệ brand trong cùng một file | **high** |
| `/home/hieunc/Code/DTW/src/article.jsx` | 295 (+48, 50, 97, 209, 286) | `corrections@dtw.news` — một domain mồ côi **thứ ba** | Mâu thuẫn với cả `.com` lẫn `.asia` | **high** |
| `/home/hieunc/Code/DTW/{index.html,header.jsx,README.md,.claude/settings.local.json}` | 6/21; 1-67, 323-325; 1-3, 40, 42; 10-11 | Accent trước đợt refresh `#E04E1F`; định vị "Asia Tech"; monogram SVG inline; tagline; và cái receipt `cp` chứng minh nguồn gốc | Decommission cùng cả thư mục. Không phải git repo — không có lịch sử nào để giữ | **high** |
| `apcg-cms/**` | — | Xem §3.6 | | |

### 3.9 process-docs — những file mà agent đọc *trước khi* sửa

| File | Dòng | Hiện tại | Đề xuất | Rủi ro |
|---|---|---|---|---|
| `process/context/all-context.md` | 18 | `**Dailytechwire (DTW)** — a global, digital-native technology publication…` | `CLAUDE.md` @-import file này. **Chỗ sửa doc có đòn bẩy lớn nhất trong repo** | **high** |
| `process/context/all-context.md` | 38 | `Dailytechwire is published by **Asia Press Centre Group (APCG)**…` | Publication đổi tên; APCG giữ nguyên | **high** |
| `process/context/all-context.md` | 131, 135, 138 | Invariant #7, #11, #14 | Xem §6 | **high** |
| `process/context/all-context.md` | 20-22, 149, 226 | `dtw-web` / `dtw-engine` / `dtw-workers` | Theo D7 | med |
| `process/context/all-context.md` | 46, 197 | `DTW_WEBSITE_REQUEST.xlsx` được trích làm source-of-truth #1 | Cập nhật nếu file bị đổi tên (3 chỗ trích dẫn) | med |
| `process/context/all-context.md` | 1, 196, 222, 256, 258 | Tiêu đề, tên thư mục, alias `@dtw/*` | Theo D6/D7. L196 vốn đã lỗi thời ("to become the dtw-web monorepo" — nó là rồi) | low |
| `process/context/all-context.md` | — | **Không có mục nào ghi lại canonical host ở bất kỳ đâu trong `process/context/`** | **Thêm một mục.** Khoảng trống này là gốc rễ của mâu thuẫn apex-vs-www | **high** |
| `process/context/uxui/all-uxui.md` | 152-154 | Các dòng Site name / Wordmark+logo / Tagline | Viết lại cả ba; giữ lại phần lịch sử các phương án đã bị loại. **Đồng thời thêm hai dòng còn thiếu** mà brand book có ghi: concept "Daily Pulse" và tagline phụ "From Asia, for the world" | **high** |
| `process/context/uxui/all-uxui.md` | 1, 18, 74, 144, 264 | Tiêu đề; dòng brand-evolution; `/* DTW coral */`; `localStorage["dtw-theme"]`; `localStorage["dtw-lang"]` | | med |
| `process/context/infra/all-infra.md` | 106 | `DKIM + SPF + DMARC on dailytechwire.com before any send.` | **Dòng đơn có hậu quả nặng nhất trên toàn bộ mặt docs** — một task ops chặn đường | **high** |
| `process/context/infra/all-infra.md` | 214 | `RESEND_FROM_DOMAIN (dailytechwire.com)` | Giá trị + verification bên Resend + env trên Vercel | **high** |
| `process/context/infra/all-infra.md` | 1, 37-39, 255 | Bảng service; `localStorage["dtw-cookies"]` | Đừng đụng vào đoạn BINDING CONSTRAINT xung quanh | med |
| `process/context/auth/all-auth.md` | 52 | `Subject: Sign in to DailyTechWire` | Tiêu đề email mà độc giả nhìn thấy | **high** |
| `process/context/auth/all-auth.md` | 1, 67 | Tiêu đề; `dtw-nudge-dismissed` | | low |
| `process/context/integrations/all-integrations.md` | 136 | `"DTW may earn a commission on purchases made via this link."` | Disclosure affiliate mang tính pháp lý; kiểm lại các bản localisation vi/id | med |
| `process/context/integrations/all-integrations.md` | 1, 76 | Tiêu đề; `dtw-engine` | Theo D7 | low |
| `process/context/database/all-database.md` | 1, 17, 32 | Tiêu đề + tên service | Bản thân schema đã kiểm chứng là không dính brand | low |
| `process/context/tests/all-tests.md` | 1, 35, 88 | `@dtw/auth` (một package **không hề tồn tại** — lỗi doc có sẵn từ trước), `@dtw/db` | Theo D6 | low |
| `process/context/planning/all-planning.md` | 3 | `…entrypoint for dtw-web.` | Theo D7 | low |
| `process/features/articles/_GUIDE.md` | 43, 54 | Copy của banner sign-in; disclosure sponsored theo invariant #5 | | **high** |
| `process/features/articles/_GUIDE.md` | 3, 38, 44 | `dtw-read-count`, `dtw-nudge-dismissed` | | low |
| `process/features/homepage/_GUIDE.md` | 14, 24, 26 | Wordmark; `DTW Studio Presents`; `DTW Daily Brief` | Ba sản phẩm được đặt tên riêng biệt. L14 còn liệt kê cả pillar "Asia" đã bị bỏ | **high** |
| `process/features/newsletters/_GUIDE.md` | 42, 53 | `"Read Dailytechwire the way you read."`; token nội bộ `dtw-bounced` | L53 là token trạng thái nội bộ — đóng băng | med |
| `process/features/about-trust/_GUIDE.md` | 3, 101 | `Why DTW doesn't run mid-article ads` | Sở hữu `/about`, `/newsroom`, `/trust` | med |
| `process/features/{dashboards,engine-integration,account,cms,search}/_GUIDE.md` | 3, 7 / 3, 17 / 3 / 3 / 3 | Các marker `<!-- Part of dtw-web -->` + vài chỗ nhắc trong văn xuôi | Theo D7 | low |
| `process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md` | 143-151, 358-361, 1013-1017 (tổng 43 hit) | *"These are user-approved and are **not** to be relitigated"* → *"Brand casing = `DailyTechWire`"*; tiêu chí thành công #7; apex origin ở 160/511/901/1038 | **BLOCKER. Thêm một banner superseded-by có ghi ngày trước khi sửa bất cứ thứ gì.** Nếu không, một execute agent tuân theo luật orchestration sẽ dừng lại, hoặc revert luôn cái rebrand để thoả tiêu chí thành công #7. Cũng phải lật `Status: ⏳ PLANNED` — các artifact mà nó đặc tả đều đã tồn tại | **high** |
| `process/features/account/active/reader-auth-account-simple_PLAN_03-07-26.md` | 24, 33, 53, 59, 103, 108, 122, 126, 155, 187, 218, 228, 261 | Template `FROM` của email + `dtw-read-count` + chỉ dẫn copy `DTW Awards` | Cập nhật trước khi execute | **high** |
| `process/features/about-trust/active/tip-line-removal-newsroom-route_PLAN_16-07-26.md` | 77, 132, 156, 166, 171, 177, 203, 210, 221, 304, 322, 341 | 3 mailbox + một lệnh grep verification chứa `tips@dailytechwire` | Hoặc execute trước khi rebrand, hoặc viết lại các lệnh grep của nó — nếu không L304 sẽ trả về **false green** | med |
| `process/features/dashboards/active/{ai-leaderboard-llmstats,dashboards-automation}_PLAN_*.md` | 9 + 21 hit | Các chuỗi page-title; `DTW_DASHBOARD_REFRESH_TOKEN` | Tên env-var phải chốt một lần và áp y hệt cho cả hai, không thì chúng lệch nhau | med |
| `process/general-plans/active/brief-display_PLAN_20-08-26.md` | 1, 4, 14, 201, 204 | `Thêm dtw vào BRIEF_PUBLISH_PUBS` | **Đừng đổi tên publication key `dtw`.** Thêm một ghi chú rằng đó là slug legacy | **high** |
| `process/general-plans/active/human-ops-launch_PLAN_30-05-26.md` | 5, 6, 67 | Câu phát biểu mục tiêu + tên một audit workflow có ghi ngày | L6/67 là tên có ghi ngày — để nguyên | low |
| `process/general-plans/reports/brief-display_REPORT_20-08-26.md` | 58, 73-74, 89 | `name: "DTW Briefing Desk"` · `role: "Dailytechwire Newsroom"` — **một row Author đang sống trên production Central** | Để nguyên report; **hành động dựa trên cái nó ghi lại.** Được củng cố ở `references/brief-display-research_REFERENCE_20-08-26.md:18,54` và `completed/engine-composed-brief_PLAN_24-07-26.md:271` (chỗ này bổ sung một chuỗi live thứ hai) | **high** |
| `process/features/account/backlog/phase-01-auth-foundation_PLAN_03-07-26.md` | 107, 205-207, 249 (33 hit) | Các template email dán-là-chạy, hardcode brand và domain đã chết | **Cắm flag ở đầu file** — một quả mìn chờ lúc hồi sinh | med |
| `process/features/account/backlog/phase-05-newsletters-double-optin_PLAN_03-07-26.md` | 71, 130, 153, 264, 334, 348 | Copy CTA newsletter hiển thị cho độc giả, có nhắc `DTW Awards` | Xử lý y như trên | med |
| `process/features/account/references/brief-asia-port-map_REFERENCE_03-07-26.md` | 187, 189, 208 | Template FROM của email, subject của magic-link, `RESEND_FROM_DOMAIN` | Được nêu đích danh là doc nền tảng chính cho plan reader-auth đang ACTIVE | med |
| `design/chats/chat{1,2,3,4}.md`, `process/general-plans/completed/**`, `process/general-plans/references/design-refresh-*` | ~200 hit | Transcript có ghi ngày, plan đã hoàn thành, report lịch sử | **Đừng viết lại** — đây là hồ sơ lịch sử. Giữ làm bằng chứng; `completed_credibility-cleanup_PLAN_28-06-26.md:48` ghi rằng camel→sentence đã ship rồi (commit `2587cd8`) | low |
| `CLAUDE.md`, `AGENTS.md`, `process/development-protocols/**`, `process/_seeds/**`, `process/context/planning/example-*-prd.md` | — | **Không có brand token nào — đã kiểm chứng** | Không cần làm gì | — |

---

## 4. Code vs data vs assets vs external

**Một lượt find-and-replace trong repo chỉ lo được khoảng một nửa, và đó là nửa *dễ*.** Bốn nhóm hành xử khác nhau, và ba trong số đó không thể sửa bằng cách chỉnh bất kỳ file nào trong bất kỳ repo nào.

### 4.1 Một lượt `sed` thực sự phủ được những gì
Các literal trong source ở `apps/`, `packages/`, `design/project/src/`, và tài liệu `process/`. Tức khoảng ~400 trong ~630 dòng finding. **Năm cái bẫy khiến ngay cả phần này cũng không an toàn nếu quét máy móc:**

1. **Ba kiểu casing** — replace phân biệt hoa thường bỏ sót một phần ba số trang editorial (`newsroom/page.tsx:449`, `legal/[slug]/page.tsx:91-93`).
2. **Token đã URL-encode** — `advertise/page.tsx:11` `?subject=DTW%20media%20inquiry`, `studio/page.tsx:11` `?subject=DTW%20Studio%20inquiry`. Grep `"DTW "` không ra cái nào.
3. **Template có interpolation** — `` `DailyTechWire — ${heading}` `` ở `[pillar]/rss.xml/route.ts:36` và `pillar-view.tsx:45`; `` `DailyTechWire <no-reply@${fromDomain}>` `` ở `email.ts:13`.
4. **False positive trong base64** — `brief-asia-web/public/design-prototype.html:290` và `BriefAsia (full site).html:290` chứa 68 chuỗi con `DTW` nằm bên trong một PNG data URI nhúng. **Replace là hỏng ảnh.**
5. **Dạng có khoảng trắng** — `Daily Tech Wire` chỉ tồn tại đúng một chỗ, `APCG-web/assets/app.js:10`.

**Danh sách DO-NOT-TOUCH, phải ghi rõ trong plan:**
`packages/db/migrations/**` (đã applied + hash-checked), `packages/db/src/schema/auth.ts:24`, `content-engine/supabase/migrations/**` (đã applied), `apcg-cms/scripts/seed.ts:207` (`slug`), `apcg-cms/src/collections/Media.ts:130` (`prefix`), `apcg-cms/scripts/migrate/export-source.ts:102` (một số đo lịch sử), và hai file HTML chứa base64.

### 4.2 Nội dung database / CMS đang chạy — không edit repo nào chạm tới được
| Store | Chỗ mang brand | Phải đổi thế nào |
|---|---|---|
| **Central (apcg-cms) `tenants`** | `name`, `domain`, `additionalDomains`, `frontendUrl`, `logo`, `brand.*`, `seo.*`, `contact.*Email`, `socials[]` | Sửa row trong `/admin`. Đòn bẩy lớn nhất của cả cuộc rebrand — đổi chrome của site mà **không cần deploy**. `domain`/`frontendUrl` chỉ System Admin sửa được |
| **Central `articles_locales` + `_articles_v_locales`** | `title`, `dek`, `body` (Lexical JSON) | Payload Local API, đi từng node. **Tuyệt đối không** `regexp_replace` trên JSON. Bài published trước, draft sau cùng |
| **Central `authors`** | `name` = `DTW Briefing Desk`, `role` = `Dailytechwire Newsroom` | **Rename tại chỗ.** Intake resolve author **theo name** (`apcg-cms/src/app/api/engine/intake/route.ts:481-494`) — đổi byline bên engine mà không đổi row sẽ **đẻ ra một author thứ hai** và cắt đôi kho brief |
| **Central `newsletters_locales` / `podcasts` + `_locales`** | `DTW Awards`, `DTW Daily Brief`, `show: "DTW"` | Là những row đã live. Sửa `apcg-cms/scripts/seed.ts` chỉ ngăn một lần re-seed đưa chúng quay lại |
| **Central `menus_items_locales`, `wire_drops_locales`, `corrections_locales`, `sponsor_slots(_locales)`, `media_locales`** | Label do editor viết, alt text, copy disclosure, `ctaUrl` | Audit + sửa trong `/admin`. Xem các query ở §3.6 |
| **Engine Supabase `publications`** | `name = 'DailyTechWire'` (row do `001_initial.sql:24` seed) | `UPDATE publications SET name=… WHERE slug='dtw';` — **không** phải sửa migration đã applied |
| **Engine Supabase `brief_configs`** | `byline = 'DTW Briefing Desk'` (do `016_daily_briefs.sql:136` seed) | `UPDATE`, hoặc sửa ở `/briefs/settings`. Đây là thứ in ra ở chân mỗi Daily Brief |
| **Engine Supabase `social_posts`** | `canonical_url`, `card_image_url`, `li_caption`, `fb_caption`, `image_headline`, `alt_text` | Các field text thì ghi đè được; **PNG của `card_image_url` có kicker nung thẳng vào pixel** → phải re-render chứ không rewrite. Đếm số `status='queued'` trước khi quyết |
| **Prose trong bài đã publish** | `"At DailyTechWire, we've tracked…"` — 5 row xác nhận được trong bản export, con số thật chưa rõ | Theo D13. **Sửa generator trước** (`DTW_VOICE_SPEC`), không thì trả tiền cho việc viết lại hai lần |
| **dtw-web `dtw_auth.auth_users`** | Tài khoản staff trên `@dailytechwire.com` | Email chính là định danh đăng nhập của Better-Auth, nằm trên một unique index — hãy tính một **giai đoạn alias**, đừng cắt phát một |

### 4.3 File asset — phải vẽ lại hoặc generate lại, grep không thấy
| Asset | Generator | Việc phải làm |
|---|---|---|
| `apps/web/public/og-default.png` | `apps/web/scripts/generate-og-default.mjs` ✅ | Sửa wordmark + tagline + chỉnh lại `cx` của pulse-dot, chạy lại, **diff bằng mắt** (librsvg tự thay font) |
| `apps/web/src/app/apple-icon.png` | ❌ không có | Tự vẽ lại 180×180 |
| `apps/web/public/icon-192.png` | ❌ không có | Tự vẽ lại |
| `apps/web/public/icon-512.png` | ❌ không có | Tự vẽ lại. **Rồi upload lại lên Supabase Storage** trước khi lật `content-engine .../dtw/index.ts:183` |
| `apps/web/public/icon-maskable-512.png` | ❌ không có | Tự vẽ lại **và sửa luôn lỗi lệch tâm theo chiều dọc đang có** |
| `apps/web/src/app/icon.svg` | — (SVG dạng text) | Thay thẳng thành `OTW` |
| `apps/web/public/dtw-logo-primary.svg` | — | Vẽ lại + đổi tên, hoặc xoá (không có code nào tham chiếu) |
| `design/project/uploads/pasted-1779960345031-0.png` | ❌ không có | Là ảnh raster của tagline. Render lại hoặc xoá |
| `design/project/uploads/DTW-Brand-Guideline-v1.0.pdf` | ❌ bên ngoài | Chủ brand phát hành lại bản v2.0 |
| Supabase Storage `hero-images/logos/dtw-monogram.png` | `content-engine/scripts/social-render-poc.ts` ✅ | Upload dưới một **key mới**; đừng ghi đè khi các post đang queued còn trỏ vào key cũ |
| Các PNG của `social_posts.card_image_url` | `content-engine/src/social/render.ts` | Render lại, hoặc để đám post đang queued chạy hết |

**Khuyến nghị:** viết một `generate-brand-assets.mjs` rasterise `icon.svg` ở 180/192/512 để nhóm asset này thôi phải bảo trì bằng tay. Bộ hiện tại *vốn đã* không đồng bộ — file SVG có `rx="12"` và dùng IBM Plex Mono; bốn file PNG thì góc vuông sắc cạnh và dùng một font grotesque chung chung.

### 4.4 Việc nằm hoàn toàn ngoài mọi repo
| Hạng mục | Ở đâu | Lead time | Hỏng kiểu gì nếu bỏ sót |
|---|---|---|---|
| **DNS + SPF/DKIM/DMARC trên domain mới** | tenten.vn | **Vài ngày–vài tuần** (verify + warm-up) | Mail reset mật khẩu và mail xác minh rơi vào spam → mất đường khôi phục tài khoản mà không ai hay |
| **Verify domain trên Resend** | Resend dashboard | Vài ngày | Lật `RESEND_FROM_DOMAIN` xong là gửi từ một domain chưa được xác thực |
| **Google OAuth consent screen + redirect URI** | Google Cloud Console | **Vài ngày–vài tuần** (đổi tên một app đã verified có thể kích hoạt lại brand verification) | Sign-in bằng Google gãy, hoặc hiện cảnh báo, và **chỉ lộ ra ở lần dùng thật đầu tiên** |
| **GitHub OAuth redirect URI** | GitHub app settings | Vài phút | Như trên |
| **Vercel: `NEXT_PUBLIC_SITE_URL`, `BETTER_AUTH_URL`, `RESEND_FROM_DOMAIN`, gắn domain** | Vercel dashboard | Vài phút | Sai canonical / mail auth hỏng / sign-in hỏng |
| **Cloudflare R2 CORS allowlist** | Cloudflare dashboard | Vài phút | Editor upload media hỏng với một lỗi CORS chỉ thấy ở browser, **không có log server** |
| **Central `PUBLIC_API_ALLOWED_ORIGINS`** | env production của apcg-cms | Vài phút | **Site rỗng trong im lặng** — `central-api.ts` biến lỗi thành kết quả rỗng thay vì throw (tiền lệ: WTB, 28/07/2026) |
| **`frontendUrl` của tenant bên Central** | apcg-cms `/admin` | Vài phút | Publish không còn bust cache; Preview của editor mở vào host đã chết. Cả hai đều im lặng |
| **Base URL của revalidate callback bên Central** | config của apcg-cms | Vài phút | Như trên |
| **Search Console: property mới + Change of Address** | GSC | Vài ngày | Tín hiệu ranking không được chuyển sang |
| **URL data-stream của GA4 + referral exclusion + annotation** | GA4 admin | Vài phút | Nhiễu self-referral phá nát attribution qua bước nhảy 301 |
| **Vanity slug của company page LinkedIn** | LinkedIn admin | Tức thì, **có rate limit, không redirect** | Link footer + `sameAs` trong JSON-LD 404 ngay khoảnh khắc họ đổi |
| **Username của page Facebook** | Meta Business Settings | Có rate limit; **username cũ trở thành có thể bị người khác chiếm** | Như trên |
| **Handle X** | — | — | `footer.tsx:62` đã có sẵn một slot rỗng chờ URL |
| **Đổi tên repo GitHub** `hieuhn09/dtw-web` | GitHub | Vài phút | Redirect vẫn chạy; nhưng gãy mọi thứ ghim cứng tên đầy đủ; remote ở local không tự cập nhật |
| **Repo variable của GitHub Actions** `BRIEF_COMPOSE_PUBS`, `SOCIAL_PRODUCE_PUBS` | `gh variable set` trên `content-engine` | Vài phút | **Fail closed** — 0 publication được xử lý, mà **workflow vẫn báo xanh** |
| **Các env CSV trên Vercel** `PUBLISH_DAILY_CAPS`, `AUTOPUBLISH_CAPS`, `BRIEF_PUBLISH_PUBS`, `SOCIAL_POST_PUBS` | Vercel (content-engine admin) | Vài phút | Như trên — thiếu = OFF, default an toàn = dừng trong im lặng |
| **`DTW_INTAKE_URL`** | Vercel (content-engine admin) | Vài phút | Engine POST vào một host đã chết → ngừng publish |
| **Project `dtw-frontend` trên Vercel** | Vercel | — | Theo D15 — cho ngừng hoạt động |
| **Trademark clearance** | Pháp lý | Vài tuần | Xem §8 |
| **Trust Project** | — | — | **Không phải việc đăng ký lại.** Cái claim đó là bịa; xoá đi |

**Repo anh em (`dtw-engine` / `dtw-workers`):** không cái nào tồn tại trên đĩa. `process/context/all-context.md:20-22` chỉ nêu tên chúng theo kiểu dự định. Engine thật là `/home/hieunc/Code/content-engine`, phục vụ năm publication và **không** bị đổi tên. `dtw-workers` thì chưa bao giờ được xây.

---

## 5. Rủi ro SEO và tính liên tục

| Hạng mục | Phải làm gì | Hỏng kiểu gì |
|---|---|---|
| **Google manual action** | Kéo lại GSC, xác nhận đã được gỡ, nộp reconsideration dẫn chứng các cap đã deploy, **rồi chờ**. Xong mới migrate | Google **mang manual action đi theo qua một site move đã verify.** Migrate lúc này là mua về một domain bị phạt và mất nốt 26 trang còn được index |
| **301 map** | Đặt rule theo host lên **đầu tiên** trong `apps/web/next.config.ts` `redirects()`: `dailytechwire.com` **và** `www.dailytechwire.com` → `https://www.opentechwire.com/:path*`, cộng một rule apex→www mới cho host mới. Giữ cả hai host cũ gắn vào trong 12+ tháng | 5 rule theo path đang có (`/asia`, `/asia/:path*`, `/about/newsroom`, `/feed`, `/rss`) không phân biệt host và chạy **trước**, tạo ra chuỗi hai chặng xuyên domain làm loãng signal |
| **410 middleware** | Giữ `apps/web/src/middleware.ts` sống xuyên suốt quá trình migration | Nó không phân biệt host nên vẫn trả 410 trên host mới — chuỗi là 301→410, thế là ổn. Bỏ nó đi thì kéo theo ~225 URL WordPress chết sang domain mới |
| **Ổn định GUID của RSS/Atom** | **Pin tag authority về host CŨ** trong `feed.ts:61,69` VÀ cả `<id>` cấp feed ở `feed.ts:116` | Hiện cả hai đều lấy từ origin đang chạy. Đổi origin là cấp lại toàn bộ `atom:id` → mọi aggregator sẽ đẩy lại **toàn bộ kho bài cũ** như bài mới tới từng subscriber, một lần |
| **Canonical host** | www ở mọi nơi; đối chiếu lại `metadata.ts:26,30` + `next.config.ts:38-45` + `apps/web/.env.example:12` + bản SEO plan | Apex và www đánh nhau trong index chính là đúng cái vấn đề mà `24bf005` đã sửa |
| **Sitemap** | Không đổi code (`revalidate = 900` tự khớp lại trong 15 phút). Submit lại sau cutover | — |
| **hreflang** | **Không phải làm gì.** Đã kiểm chứng: không có `alternates.languages`, không có route nào tiền tố locale | — |
| **Định danh PWA manifest** | `manifest.ts` không khai `id` cũng không khai `scope` → định danh bị buộc theo origin | Các bản đã cài **bị bỏ rơi, không có đường migrate.** Không tránh được; thêm `id: "/"` tường minh ngay bây giờ để các thay đổi sau này an toàn. Với 26 trang được index thì số lượt cài chắc không đáng kể |
| **Email deliverability** | SPF/DKIM/DMARC trên domain mới, verify trong Resend, **warm up xong**, rồi mới lật `RESEND_FROM_DOMAIN`. Đổi display name ở `email.ts:13` và bốn chuỗi subject/body ở `auth.ts:78,84,97,103` **trong cùng một deploy** | Một domain nguội mà gửi mail reset mật khẩu thì vào thẳng spam. Tệ hơn: một mail từ `Opentechwire <no-reply@opentechwire.com>` mà subject ghi *"Confirm your DailyTechWire account"* là chữ ký của phishing, đầu độc uy tín domain mới ngay ngày đầu. Lưu ý fallback hardcode ở `email.ts:12` nghĩa là env var **không được set** sẽ âm thầm gửi từ domain cũ |
| **OAuth redirect URIs** | **Thêm** callback mới bên cạnh callback cũ trước khi lật DNS. Lật `BETTER_AUTH_URL` trong **cùng deploy** với `NEXT_PUBLIC_SITE_URL` | Lúc deploy thì im re, đến lần sign-in đầu tiên mới vỡ. URL magic-link và reset được sinh ra từ `BETTER_AUTH_URL`; callback token dùng-một-lần và việc khớp `redirect_uri` của OAuth không sống sót ổn định qua một cú 301 xuyên origin |
| **Session cookies** | Không cần làm gì. Đã kiểm chứng: không có `appName`/`trustedOrigins` ở đâu cả → Better-Auth dùng prefix chung `better-auth.*` | Không reader nào bị đăng xuất vì bản thân việc đổi tên. Họ *bị* đăng xuất vì đổi host — không tránh được |
| **Rebuild search index** | **Không phải một hạng mục công việc.** Đã kiểm chứng: không có tích hợp Meilisearch/Typesense/Elasticsearch nào; 8 kết quả `meilisearch` đều là comment TODO trong `payload/hooks/revalidate.ts` | — |
| **Tính liên tục của analytics** | Giữ GA4 `G-5H175FPLGR`; cập nhật URL của data stream; thêm host cũ vào referral exclusions; đánh annotation cho mốc cutover. Giữ `utmCampaign: 'dtw-social'` | Tạo property mới là vứt đi đúng cái baseline mà bạn cần nhất để so sánh. **PostHog cũng không phải một hạng mục công việc** — đã kiểm chứng zero occurrence, nên phần PostHog trong invariant #12 không có code nào chống lưng |
| **Cache của social scraper** | Nếu origin đổi thì URL OG cũng đổi và cache tự bust, không tốn gì. Chỉ khi brand đổi *mà* host không đổi thì `og-default-v2.png` mới có lý do tồn tại | Nếu không, LinkedIn/Facebook sẽ phục vụ card cũ đã cache mãi mãi |
| **Intake xuyên repo** | `DTW_INTAKE_URL` phải lật trong cùng khung thời gian đó; lưu ý hiện nó trỏ vào **apex** trong khi registry dùng `www` | POST đi qua 301 có thể bị hạ xuống thành GET, âm thầm làm mất phần body của bài |
| **Turbo cache** | Kiểm tra `NEXT_PUBLIC_SITE_URL` có nằm trong build hash không (`turbo build --dry=json`); nó không có trong `turbo.json:8-23` | Một cache hit sẽ phát lại bản build có origin cũ được inline vào mọi canonical và OG URL — HTML trông thì đúng, canonical thì sai |

---

## 6. Tác động lên các invariant — `process/context/all-context.md`

| # | Invariant | Kết luận | Chi tiết |
|---|---|---|---|
| 1 | Engine chỉ ghi qua Payload API | **Không ảnh hưởng** | Cơ chế không đổi. Chỉ giá trị của `DTW_INTAKE_URL` là thay đổi |
| 2 | `lockedFields` + `editedByHuman` + optimistic lock | **Không ảnh hưởng** | Không có token brand nào |
| 3 | `origin: 'engine' \| 'manual'` | **Không ảnh hưởng** | Không có token brand nào |
| 4 | Paywall = soft block, có meter, không chặn cứng | **Quyết định sản phẩm (D9)** | Cơ chế tương thích với "Open" và không đổi. Phần **copy** thì cần rà: `paywall.tsx:46` `"Free limit reached"`, và tên tier `DTW Pro`. Không gấp — `paywall.ts:24` `PAYWALL_ENABLED = false` |
| 5 | Disclosure box cho sponsored, không tắt được; disclosure AI-assisted đã gỡ 2026-06-05; **KNOWN GAP: `/trust/ai` vẫn mô tả nó** | **Cần sửa + escalate** | Đổi tên 4 chuỗi disclosure (`article-body.tsx:139-141`, `disclosure-box.tsx:20`, `seed-payload.ts:224,233`, `data.ts:254`). **Quan trọng hơn là nên đóng luôn KNOWN GAP trong đợt này** — `trust-content.tsx:215-217` (×3 locale) và `seed-payload.ts:267` đều vẫn hứa một nhãn đã bị gỡ. Một ấn phẩm lấy tên từ sự cởi mở thì không thể ship một tuyên bố minh bạch sai do chính mình ghi ra |
| 6 | Không popup, không quảng cáo giữa bài | **Không ảnh hưởng** | Không có token brand nào |
| 7 | **Brand colors** | **Cần sửa (chỉ phần chữ) — trừ khi D10 lật** | Chữ trong invariant có gọi tên "DTW coral" nên phải viết lại. **Bản thân các giá trị hex thì không đổi** theo phương án mặc định được khuyến nghị. Nếu palette *có* bị mở ra làm lại: `globals.css:19-38,63-64,91,93`, 20 chỗ dùng `--brand-navy` trải trên 12 file, ~46 hex hardcode trong `cover-art.tsx` (những chỗ này đi vòng qua hệ token), 6 asset nhị phân, các hex hardcode ở `email.ts:79`, và `brief-asia-web/DESIGN.md:115-116` (file này nêu hex của DTW như một anti-pattern và sẽ âm thầm ngừng bảo vệ BriefAsia). Dù sao cũng đáng sửa: `cover-art.tsx:30` vẫn còn màu coral **trước đợt refresh** `#E04E1F` mà chính invariant này đã khai tử |
| 8 | Pillar/Sub-section/Tag là entity trong CMS | **Không ảnh hưởng** | Taxonomy không mang brand |
| 9 | i18n `en`/`id`/`vi`, subpath routing, hreflang | **Về cơ chế thì không ảnh hưởng; nhưng 3× khối lượng copy** | Mọi chuỗi hiển thị cho reader đều là một bộ ba `t()`, và **số token khác nhau theo từng locale** (`studio/page.tsx:123-125`: en 1, vi 2, id 2), kèm những chỗ chỉ xuất hiện ở vi (`studio/page.tsx:40`). Lưu ý nửa phần routing mới chỉ là mong muốn — đã kiểm chứng: không có route nào tiền tố locale, không có hreflang, đổi locale hoàn toàn ở client qua `lib/i18n.tsx` |
| 10 | Body bài giữ nguyên ngôn ngữ gốc; chỉ chrome được dịch | **Về nguyên tắc thì không ảnh hưởng — nhưng xem D13** | Rebrand đụng vào chrome. Còn các *body* đã publish có chứa `"At DailyTechWire…"` là một quyết định migrate nội dung riêng |
| 11 | **Logo header + tagline** | **Cần một quyết định sản phẩm, rồi viết lại** | Invariant bị ảnh hưởng nặng nhất. Mệnh đề về logo gọi tên monogram `DTW`, wordmark chữ thường `dailytechwire`, pulse-dot màu terracotta, và đường dẫn asset gốc — cả bốn đều đổi. Câu cuối của nó, *"Tagline stays 'Tech Intelligence, Wired Daily'"*, là một cái pin cứng: **bất kỳ câu trả lời nào cho D8 cũng là một sửa đổi invariant cần được duyệt, không phải một lần sửa copy.** Vấn đề sâu hơn: `DTW-Brand-Guideline-v1.0.pdf` §1.3 đặt "Daily Pulse" làm khái niệm brand cốt lõi — pulse-dot tồn tại *chính vì* chữ "Daily", nên bỏ chữ đó là bỏ luôn lý do tồn tại của cái mark, chứ không chỉ mất chơi chữ ở tagline |
| 12 | GDPR + PDPA + Nghị định 13; PostHog self-hosted | **Cần sửa lại cho đúng sự thật, không liên quan đến việc đổi tên** | Nửa phần compliance không bị ảnh hưởng — nhưng đổi tên `dtw-cookies` sẽ làm banner consent hiện lại (đổi host thì hiện lại cũng là đúng thôi). **Phần nói về PostHog là sai so với code**: đã kiểm chứng zero occurrence trong `apps/` hay `packages/`; analytics duy nhất là GA4 hardcode `G-5H175FPLGR` ở `(reader)/layout.tsx:20`. Đối chiếu lại |
| 13 | Trạng thái năm-đầu của trang Awards | **Không ảnh hưởng** | `"DTW Awards"` là tên một *newsletter* (`data.ts:597`, `apcg-cms/scripts/seed.ts:277`), không phải trang này. Bản thân trang không mang brand |
| 14 | **Định vị toàn cầu (2026-07-17)** | **Cần sửa (2 token); phần logic giữ nguyên từng chữ — và "Open" còn làm nó mạnh hơn** | Chỉ hai token `DTW` là đổi. **Rủi ro thật nằm ở thiệt hại phụ:** một đợt quét diện rộng có thể "dọn dẹp" luôn những chỗ nhắc Asia mà chính invariant này sinh ra để bảo vệ (`Asia Funding Tracker`, `Asia Funding Weekly`, `"…Asia and the world"`, các vai trò bureau/beat, và hero APCG ở trang About). "Open" trung tính về địa lý và bỏ nốt tuyên bố cuối cùng về nhịp daily, nên định vị còn *sạch hơn*. Lưu ý `design/project/index.html:6` vẫn ghi `Dailytechwire, Asia & Global Tech`, tức là đã vi phạm invariant này sẵn rồi |

**Những invariant cần thêm anh em mới:** chưa có invariant nào ghi lại **cách viết hoa brand** và cũng chưa có cái nào ghi lại **canonical host** — đúng hai khoảng trống đã sinh ra các mâu thuẫn ở §2 D1 và D5. Thêm cả hai.

---

## 7. Recommended sequencing

Đây là **shape** của một plan, không phải file plan. Kích thước chỉ là ước lượng. Nguyên tắc xuyên suốt: **additive trước destructive, generator trước content, những thứ có lead time ngoài repo trước code.**

### Phase 0 — Chốt và ghi lại (SMALL, không code)
Trả lời D1-D15. Rồi viết câu trả lời vào `process/context/` **trước khi sửa bất kỳ file nào**, vì toàn bộ tiền đề ở đây là những thứ này sẽ bị đem ra tranh luận lại:
- `process/context/all-context.md` — thêm invariant mới **#15 (brand casing, ba tầng)**, thêm mục **canonical-host** mới, sửa lại #7/#11/#14, sửa dòng 18.
- `process/context/uxui/all-uxui.md:152-154` — viết lại ba dòng brand; thêm hai dòng còn thiếu (concept Daily Pulse, tagline phụ).
- `process/context/infra/all-infra.md` — canonical host + điều kiện tiên quyết DKIM/SPF/DMARC.
- `process/context/integrations/all-integrations.md` — ghi lại việc freeze slug `dtw` kèm bằng chứng.

**Cũng nằm trong Phase 0, vì để càng lâu càng đắt:**
- Thêm **banner superseded-by** vào `process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md:143-151,358-361` và đổi `Status` của nó. *Bỏ qua bước này là cách dễ xảy ra nhất khiến cuộc rebrand bị revert giữa chừng.*
- Sửa `apcg-cms/process/general-plans/active/brief-content-type_PLAN_20-08-26.md:115` (`role: "Dailytechwire Newsroom"`) — đã CODE COMPLETE nhưng **chưa migrate**, nên hôm nay chỉ là một lần sửa text, còn để sau thì thành một migration dữ liệu production.
- Xoá mệnh đề bịa `, Member, Trust Project` tại `apps/web/src/components/footer.tsx:234`.
- Thêm `data-exports/`, `*-Coverage-*.zip`, `news-p.v1.*.jpeg` vào `.gitignore`. Xoá file `ds` 0-byte đang bị track. Xoá file JPEG ở root không ai tham chiếu.
- Đọc `DTW-Brand-Guideline-v1.0.pdf` (file này *có* extract được text) — chính nó biến D8 thành câu hỏi ở tầng mark.

**Reversible.** Chưa ship gì cả.

### Phase 1 — Bấm đồng hồ cho những việc chạy lâu (SMALL về công sức, DÀI về wall-clock, không code)
Chạy song song với mọi thứ khác. **Bắt đầu ngay; đây là những thứ gate cái cutover.**
1. Kéo lại GSC (Coverage + Performance + **panel Manual Actions**). Xác định xem manual action còn được liệt kê không.
2. Nếu còn: nộp reconsideration, viện dẫn các cap đã deploy (`content-engine` `6fb3a06`, `da2d151`, `eb76248`) và bằng chứng về khối lượng (`data-exports/articles_images.csv`, 5-10/ngày → 25-40/ngày trong khoảng 07-03..07-10, ngay trước cú rơi 07-11).
3. Xác nhận quyền sở hữu `opentechwire.com` + ngày hết hạn tại tenten.vn.
4. Trademark clearance ở các class 16 / 38 / 41 / 42, Singapore trước.
5. Thêm domain mới vào Resend; publish SPF/DKIM/DMARC; bắt đầu warm-up.
6. **Thêm** (đừng bao giờ swap) các OAuth redirect URI mới ở Google và GitHub. Đổi tên app trên consent screen chỉ sau khi đã thêm xong.

**One-way door: Change of Address.** Đừng nộp cho tới khi (a) manual action đã được gỡ, (b) domain mới đã serve một bản mirror đầy đủ kèm 301, (c) cả hai property đều đã verified.

### Phase 2 — Generator và cái pin authority cố định (SMALL, reversible, ship an toàn)
Phải land **trước** khi flip domain, vì đây là những thứ sau đó không sửa được nữa:
- **Pin Atom tag authority** vào host cũ đã đóng băng trong `apps/web/src/lib/feed.ts:61,69` **và** `<id>` ở cấp feed tại `:116`. *Sau khi* origin đổi thì đã muộn — bản re-push đã bắn đi rồi.
- Thêm `NEXT_PUBLIC_SITE_URL` vào `env` của build trong `turbo.json` (hoặc chứng minh được là inference đã cover).
- Sửa canonical host ở cả bốn chỗ: `metadata.ts:26,30`, `next.config.ts:38-45`, `apps/web/.env.example:12`, và cái SEO plan.
- Sửa luôn BOM + mojibake trong `.env.example` nhân lúc mở file.

### Phase 3 — Cái mark, gói trong một commit atomic (MEDIUM)
**Đừng** tách text ra khỏi binary — một cái mark làm dở dang sẽ lộ ra ở tab trình duyệt, ở install prompt, và ở mọi social share cùng một lúc.
`wordmark.tsx` (11-13, 28, 39, 41-53, docblock) → `app/icon.svg` → vẽ lại `apple-icon.png` / `icon-192` / `icon-512` / `icon-maskable-512` → sửa `generate-og-default.mjs` + chạy lại + commit file PNG → rename/vẽ lại `public/dtw-logo-primary.svg` → lockup `email.ts:79` → `manifest.ts:13-15`.
Rồi **upload monogram mới lên Supabase Storage dưới một key mới** và trỏ `content-engine .../dtw/index.ts:183` vào đó.
**Reversible** (asset có version), nhưng ồn ào về mặt thị giác — ship thành một deploy duy nhất.

### Phase 4 — Copy hiển thị (MEDIUM–LARGE)
Làm một lượt qua **cả hai** nhóm casing để repo không bao giờ nằm ở trạng thái đổi tên nửa vời: 35 dòng `DailyTechWire` và 31 dòng `Dailytechwire` trong `apps/`+`packages/` gộp chung, cộng thêm phần copy hiện đang tối (`header.tsx:633-635`, `sponsored-strip.tsx`, `best-of-reviews.tsx:70`, `disclosure-box.tsx:20`) — phần này rất dễ quên chính vì chẳng có gì render nó. Nhét luôn bản sửa `buildMetadata` ở `dashboards/[[...sub]]/page.tsx:27` vào lượt này.
**Có cần flag không?** Không — nhưng hoàn toàn khôi phục được bằng revert, và ship an toàn *trước* khi domain đổi.

### Phase 5 — Content-engine, cả ba writer cùng lúc (MEDIUM)
Điểm mấu chốt: **có ba writer ở generate-time, không phải một.** Sửa cả ba, không thì phải trả tiền viết lại corpus hai lần.
1. `src/lib/publications/dtw/index.ts` — voiceSpec **50-56**, name 90, byline 148, siteBaseUrl **150 và 190**, displayName 165, domain 166, kicker 177, logoAssetUrl 183.
2. `admin/src/lib/brief-configs.ts` — SITE_NAMES **51** và siteBaseUrl **36**.
3. `src/social/prompts/social-rules.prompt.ts:33`.
Cộng thêm hai row trong DB: `UPDATE publications SET name=…` và `UPDATE brief_configs SET byline=…`, và **rename tại chỗ row `authors` đang có** trước khi flip byline của engine.
Rồi chạy `npm test` trong `content-engine` — 5 fixture hardcode domain cũ và sẽ liệt kê ra bất kỳ đoạn copy nào danh sách này bỏ sót.
**Merge worktree `content-engine-kpi-gd1-publish-caps` trước đã.**

### Phase 6 — CUTOVER (cái one-way door)
Mọi thứ mang tính additive phải đã sẵn sàng từ trước. Thứ tự trong window:
1. **Đã thêm từ trước (Phase 1):** OAuth redirect URI mới, Resend đã verified + đã warm.
2. **Thêm vào, đừng swap:** origin mới → `PUBLIC_API_ALLOWED_ORIGINS` của Central; origin mới → allowlist CORS của R2; domain mới attach vào Vercel **song song** với domain cũ.
3. **Flip cùng nhau trong một deploy:** `NEXT_PUBLIC_SITE_URL` **và** `BETTER_AUTH_URL` **và** `RESEND_FROM_DOMAIN` trên Vercel; các rule 301 cho host cũ trong `next.config.ts` (đẩy lên đầu mảng); `email.ts:12-13`; `auth.ts:78,84,97,103`.
4. **`/admin` của Central:** `domain` của tenant, `additionalDomains` (giữ cái cũ lại!), `frontendUrl`.
5. **Vercel của content-engine:** `DTW_INTAKE_URL`.
6. **Social platform + code trong cùng một window:** slug LinkedIn, username Facebook, rồi `footer.tsx:63-64` và `metadata.ts:90-91`.
7. URL của data-stream GA4 + referral exclusion + annotation.
8. Storage key (D14) — giờ làm là miễn phí, vì đằng nào việc đổi host cũng vứt chúng đi.
9. Verify, rồi mới nộp Change of Address.

### Phase 7 — Phần estate và dọn dẹp (SMALL, làm lúc nào cũng được sau đó)
`wad-web` (4 danh sách network duy trì bằng tay), comment trong `brief-asia-web`, `SiteCode` của `media-engine` (hoặc dùng một display map thay thế), `APCG-web` (xác nhận tình trạng deploy thật trước đã), decommission `/home/hieunc/Code/DTW`. Rồi, **tách riêng và làm sau cùng**, đổi tên scope `@dtw/*` (D6) thành một commit atomic riêng kèm lockfile được sinh lại.

### Cổng verification
```
grep -rniE 'dailytechwire|daily ?tech ?wire|\bdtw\b|@dtw/|Tech Intelligence, Wired Daily' . \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=.turbo \
  --exclude-dir=dist --exclude='*.tsbuildinfo' --exclude=pnpm-lock.yaml --exclude-dir=data-exports
```
**Hai cảnh báo phải nói cho người execute biết.** (1) Cái `grep` mặc định trong môi trường này là một shim ugrep có sẵn `--ignore-files` (âm thầm tuân theo `.gitignore`) và `-I` (âm thầm bỏ qua binary) — nên các exclusion ở trên là **bắt buộc**, không phải thừa, để kết quả tái lập được dưới `command grep`, ripgrep, hay CI. (2) **Grep sạch không phải bằng chứng là đã đổi tên xong.** Sáu asset binary ở §4.3 vô hình với nó và phải mở tay từng cái. Thêm `tsc --noEmit` làm bằng chứng cho các tham chiếu treo, và cân nhắc đưa lệnh grep vào `.github/workflows/ci.yml` như một guard vĩnh viễn — `process/features/about-trust/_GUIDE.md:70` đã khuyến nghị đúng cơ chế đó cho việc nội dung bịa mọc lại.

---

## 8. Câu hỏi mở và những điều chưa rõ

Những thứ nghiên cứu này **không** xác định được. Không mục nào bên dưới được kiểm chứng cả; đừng coi bất kỳ điều nào trong đó là sự thật.

1. **Chưa truy vấn database thật.** Mọi khẳng định về DB ở §4.2 đều suy ra từ file schema, seed script, và bản CSV export ngày 2026-08-03. Số lượng thật các bài đã publish có chứa `"At DailyTechWire"` là **không rõ** — mới xác nhận được 5 dòng trong một bản export chỉ trải từ 2026-06-05 → 2026-08-03, trên tổng 1,063 dòng DTW. Con số production thật còn lớn hơn. Các câu query audit ở §3.6 đã viết nhưng chưa chạy.
2. **Manual action của Google còn sống không?** Bằng chứng duy nhất là một comment trong code (`content-engine/admin/src/lib/byline-policy.ts:256`) và một dòng plan ngày 2026-08-25. Bản GSC export ở repo root kết thúc ngày 2026-07-24, tức là có trước mọi commit khắc phục. **Đây là thứ chặn toàn bộ quyết định về domain và vẫn chưa có lời giải.**
3. **Cái gì gây ra cú sụt deindex ngày 2026-07-11?** Tương quan với cú tăng vọt sản lượng rất mạnh (engine output nhảy bậc 4–8× ngay trước đó) và `git log` loại trừ nguyên nhân kỹ thuật (không có commit nào giữa 2026-07-07 và 2026-07-16; sitemap/robots/canonical đến 07-16 mới tồn tại). Nhưng đây là **tương quan, không phải xác nhận** — chỉ panel Manual Actions trong GSC mới xác nhận được phân loại.
4. **Chưa kiểm chứng được trademark cho "Opentechwire" / "OTW".** Không tìm thấy publication nào mang tên đó, nhưng namespace `*techwire` thì đông đúc — `techwireasia.com` (cùng beat, cùng khu vực), `techwire.net`, `techwire.in`, `techitwire.net` — và "Opentech" là một nhãn hiệu còn hiệu lực ở USPTO (98228544, class 009). Cần một cuộc tra cứu clearance đúng nghĩa.
5. **Quyền sở hữu domain là suy đoán, chưa xác nhận.** `opentechwire.com` trỏ về đúng nameserver tenten.vn giống `dailytechwire.com` và `briefasia.com`, với SOA serial tháng 5/2026 và không có A record. Đó là bằng chứng gián tiếp mạnh cho việc APCG sở hữu, **chứ không phải bằng chứng.** Kiểm tra tài khoản registrar và ngày hết hạn.
6. **Không truy cập được tài khoản bên ngoài nào.** Vercel, Cloudflare, Resend, Google Cloud Console, GA4, Search Console, LinkedIn, Meta Business Settings, và giá trị các repo-variable của GitHub Actions đều không tiếp cận được. Mọi mục ở §4.4 đều suy ra từ config trong repo — thứ chỉ *mô tả* chúng.
7. **Không rõ URL live trên Vercel của project `dtw-frontend`.** `dtw-frontend.vercel.app` trả về 200 nhưng phục vụ một app MLB/ESPN chẳng liên quan, nên hostname đó thuộc về tài khoản khác. Chỉ dashboard Vercel mới xác định được URL thật, và từ đó mới biết `/home/hieunc/Code/DTW` có truy cập công khai được hay không.
8. **Không rõ `APCG-web` có còn là nguồn của site corporate đang chạy hay không.** `<title>` trong repo local khác với thứ `asiapresscentre.org` đang trả về, `/assets/app.js` ở đó 404, và HTML live không hề chứa `Daily Tech Wire`. Bằng chứng khá mạnh rằng repo local đã bị thay thế — nhưng thư mục titles thật nằm ở đâu thì không rõ.
9. **Giá trị tenant slug bên Central được suy ra từ `apcg-cms/scripts/seed.ts:207`, không phải đọc từ bảng `tenants` thật.** `dtw-web` không bao giờ gửi nó đi (`central-api.ts:8-9` — read token đã ngầm xác định tenant), nên không thể xác nhận từ repo này.
10. **Không rõ số dòng đang queue trong `social_posts`**, nên chưa thể quyết định là nên render lại các social card đã render hay cứ để chúng chạy hết.
11. **Không rõ `CENTRAL_SIGNING_SECRET` từng lộ trong file `.env.example` đã commit cho đến `947971d` (2026-08-02) có thực sự được rotate ở phía Central hay chưa.** Commit message khẳng định là có. Nếu visibility hoặc quyền sở hữu repo thay đổi trong quá trình rebrand, hãy xác nhận lại thay vì tin.
12. **Hành vi cache của `turbo` với `NEXT_PUBLIC_*` chưa được kiểm chứng thực nghiệm.** Framework inference *được kỳ vọng* sẽ đưa nó vào hash, nhưng `turbo build --dry=json` thì chưa chạy. Cứ coi biện pháp giảm thiểu ở Phase 2 là bảo hiểm giá rẻ, không phải một bug đã chẩn đoán ra.
13. **Không rõ `dailytechwire.asia` và `dtw.news`** (chỉ tìm thấy bên trong `/home/hieunc/Code/DTW/src/about.jsx:355,358` và `src/article.jsx:295`) là domain đăng ký thật hay do prototype bịa ra. Nếu cái nào có nhận mail thì cần quyết định forwarding.
14. **Hai mailbox chưa được đối chiếu xem có tồn tại thật không:** mười local part `@dailytechwire.com` đã liệt kê (`advertising@`, `cheryl.tan@`, `corrections@`, `editor@`, `info@`, `media@`, `partnership@`, `press@`, `studio@`, `tips@`) là những gì code *khẳng định*; còn cả mười cái có thực sự nhận mail hôm nay hay không thì không rõ.
15. **Con số `~95 distinct high-risk` là một ước lượng đã dedup, không phải một phép đếm.** Các dòng finding thô (~630) trùng lặp rất nhiều giữa các surface; không có bước dedup tự động nào được chạy. Những con số cứng đã kiểm chứng là: **168 file được track** và **989 dòng khớp** trong `dtw-web`, và **128 dòng / 61 file** cho `@dtw/`.

---

*Hoàn thành 2026-09-08 qua 9 lượt quét surface + adversarial verification + completeness critic + 4 lượt quét gap. Mọi đường dẫn file được trích dẫn đều đã mở ra xem. Trạng thái: RESEARCH — chưa implementation.*
