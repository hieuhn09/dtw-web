# Rebrand Dailytechwire → Opentechwire — Umbrella Plan (Phase Program)

**Date**: 08-09-26
**Loại**: UMBRELLA / ORCHESTRATION PLAN (phase program theo `process/development-protocols/phase-programs.md`)
**Complexity**: COMPLEX — phase program, 8 phase, không phải một lượt EXECUTE
**Feature**: `rebrand`
**Plan file**: `process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md`
**Tài liệu nghiên cứu nền**: `process/general-plans/references/rebrand-opentechwire_REFERENCE_08-09-26.md` (752 dòng, RESEARCH, đã kiểm chứng từng file trích dẫn; §3 = bảng blast radius theo surface, §7 = shape 8-phase gốc, §8 = ẩn số chưa kiểm chứng)
**Status**: ⏳ PLANNED — đủ 8 phase plan, đã soát chéo, chưa implement gì

> Ghi chú vị trí tài liệu: tài liệu tham chiếu hiện nằm ở `process/general-plans/references/`, không nằm trong `process/features/rebrand/references/`. Feature folder `rebrand` đã tồn tại (đủ điều kiện promote theo `plan-lifecycle.md`), nên một agent sau này nên di chuyển file tham chiếu đó vào `process/features/rebrand/references/` khi có dịp — việc đó nằm ngoài quyền ghi của PLAN mode ở phiên này nên chỉ ghi chú lại, không tự làm.

---

## Overview — Mục tiêu chương trình

Đổi tên publication đang chạy từ **Dailytechwire / DTW** sang **Opentechwire / OTW**, trên toàn bộ 7 bề mặt có brand token: `dtw-web` (repo này), `content-engine`, `apcg-cms` (Central), `media-engine`, `brief-asia-web`, `wad-web`, `APCG-web`, cộng một project Vercel mồ côi tại `/home/hieunc/Code/DTW` — **mà không đánh mất**: quyền truy cập magic-link/OAuth của reader đang đăng nhập, deliverability của email transactional, tính toàn vẹn của intake contract Engine↔Payload, tính live của các cron xuất bản/refresh dashboard, và các identifier đã đóng băng có chủ đích (D11, D12).

Đây **không phải** một lượt find-and-replace. Nghiên cứu nền đã định lượng: **168 file được track trong `dtw-web`**, **989 dòng khớp**, **~400 touchpoint riêng biệt sau khử trùng lặp** trên toàn cụm 7 bề mặt, **~95 mục high-risk**, và **năm mode hỏng đặc trưng là hỏng âm thầm** (xem §7 bên dưới). Chương trình này được chia thành 8 phase, mỗi phase có plan file riêng, mỗi phase phải nghiên cứu lại (re-research) trước khi execute vì codebase có thể đã trôi so với 08-09-26.

### Định nghĩa "xong" của toàn chương trình

Chương trình được coi là hoàn thành khi **tất cả** đúng như sau:

1. Cổng verification chung ở §6 chạy sạch trên `dtw-web` VÀ `content-engine` (grep + `tsc --noEmit` + `npm test` của content-engine).
2. 6 asset nhị phân ở §5.3 đã được mở tay và xác nhận không còn mark cũ (grep không chứng minh được việc này — xem cảnh báo ở §6).
3. Các câu SQL audit ở tài liệu tham chiếu §3.6 đã được **chạy thật** (không chỉ viết ra) trên Central + Engine Supabase + `dtw_auth`, và mọi hit được xử lý theo đúng D13/D11/D12.
4. `apps/web/src/lib/feed.ts` sinh `tag:` URI theo host mới. **Làm rõ: hôm nay code KHÔNG có pin nào cả** — dòng 61 tính `tagHost` động từ `channel.origin`, nên "không ghim" nghĩa là **không thêm** pin (hệ quả D4, xem §4), không phải "gỡ" một pin đang có. Không phase nào sửa `feed.ts:61,69,116`; Phase 6 chỉ `curl` vào `/rss.xml` để xác minh hành vi.
5. Domain `www.opentechwire.com` phục vụ production; `dailytechwire.com` vẫn **thuộc sở hữu APCG** nhưng **parked, không A record, không redirect, không Change of Address đã nộp** (D3/D4).
6. Không còn bất kỳ redirect rule nào theo host cũ trong `apps/web/next.config.ts`, và Central không còn `additionalDomains` trỏ về host cũ (hệ quả D4).
7. Repo GitHub `hieuhn09/dtw-web` đã đổi tên thành `otw-web`; thư mục local `/home/hieunc/Code/dtw-web` **không đổi tên** (D7).
8. `/home/hieunc/Code/DTW` đã được xử lý theo quyết định của user tại thời điểm Phase 7 (xoá hoặc giữ có ghi chú rõ) — **không được xoá mà không hỏi lại** (D15).
9. Mọi identifier trong danh sách đóng băng ở §5.2 vẫn nguyên vẹn, có bằng chứng grep xác nhận không bị chạm.
10. Mỗi phase trong 8 phase có report tại `process/features/rebrand/reports/` và trạng thái trung thực. `✅ VERIFIED` chỉ được đánh dấu khi (a) có bằng chứng chạy thật (không chỉ "code xong") **và** (b) **user đã xem bằng chứng và xác nhận (user confirmation)** — đúng theo `Phase Status Rules` của `process/development-protocols/phase-programs.md`. Trạng thái trung gian dùng đúng marker: `⏳ PLANNED` · `🔨 CODE DONE` · `🧪 TESTING` · `🚧 BLOCKED`.

### Phạm vi và ngoài phạm vi (toàn chương trình)

**Trong phạm vi**: mọi mục ở tài liệu tham chiếu §3 (ui-components, seo-metadata, editorial-pages, config-build-deploy, assets-brand-visual, data-cms-db, content-engine, apcg-estate, process-docs), trừ các mục bị đóng băng theo D6/D11/D12/D15 hoặc bị loại bởi hệ quả D4.

**Ngoài phạm vi của toàn chương trình** (không phải chỉ một phase):
- Đổi tên slug `dtw` ở bất kỳ đâu (D11 — vĩnh viễn).
- Đổi tên schema Postgres `dtw_auth` hoặc bucket R2 `dtw-media` (D12 — vĩnh viễn).
- Bất kỳ redirect 301 hoặc Change of Address nào từ `dailytechwire.com` (D4 — vĩnh viễn, không phải "chưa tới lượt").
- Viết lại nội dung bài báo có byline nhà báo thật (D13).
- Đổi màu brand (D10).
- Đổi tên thư mục local `/home/hieunc/Code/dtw-web` (D7).
- Rewrite lịch sử: `design/chats/*.md`, `process/general-plans/completed/**`, các plan/report đã archive, transcript có ghi ngày — đây là hồ sơ lịch sử, không sửa (tài liệu tham chiếu §3.9 dòng cuối).
- Trademark filing/opposition thật sự (Phase 1 chỉ làm bước sơ bộ "clearance check", không phải nộp đơn).

---

## 2. LEDGER — 15 quyết định đã chốt (D1–D15)

Đây là **bản ghi duy nhất** của ledger này. Cả 8 phase plan bên dưới **trỏ về đây** thay vì chép lại — khi một phase cần biết "đã quyết gì", nó đọc mục tương ứng ở đây.

Quy tắc cho mọi agent đọc plan này: **không được bàn lại D1–D15**. Nếu một phase phát hiện D nào đó không khả thi về mặt kỹ thuật, dừng lại và hỏi user — không tự ý đổi quyết định rồi tiếp tục.

| # | Quyết định | Nội dung đã chốt | Lý do (từ user / tài liệu tham chiếu) |
|---|---|---|---|
| **D1** | Casing | `Opentechwire` (sentence case) cho mọi văn xuôi + metadata. `opentechwire` viết thường **chỉ** trong wordmark/OG lockup. `OTW` viết hoa hết cho monogram. **Tuyệt đối không** dùng `OpenTechWire` (PascalCase/CamelCase) ở bất kỳ đâu. | Nhất quán với logo lockup viết thường; khớp copy biên tập hiện có; sửa luôn tình trạng 3-kiểu-casing đã tồn tại từ trước (`DailyTechWire` / `Dailytechwire` / `dailytechwire`). |
| **D2** | Monogram | `OTW` | Ba glyph mono thay ba glyph mono, không đổi hình học logo. Namespace `otw`/`opentechwire` đã kiểm tra sạch. |
| **D3** | Domain mới | Chuyển sang `opentechwire.com`. Canonical là **www**: `https://www.opentechwire.com`. | Domain đã nắm sẵn trên tài khoản DNS của APCG (tenten.vn, cùng nameserver với `dailytechwire.com`). |
| **D4** | Domain cũ | **CẮT ĐỨT HOÀN TOÀN.** KHÔNG redirect 301 từ `dailytechwire.com`. KHÔNG nộp Change of Address ở Google Search Console. **NHƯNG** vẫn giữ **quyền sở hữu** `dailytechwire.com` (parked, không trỏ đi đâu, không cấu hình A record) để tránh bị bên khác đăng ký lại. | Google manual action trên domain cũ là di sản của **chủ trước**, không phải do nội dung của user hiện tại. Cơ chế 301/Change-of-Address chính là con đường kỹ thuật khiến một hình phạt "đi theo" sang tên miền mới — user chủ động không dùng con đường đó. |
| **D5** | Canonical host | `https://www.opentechwire.com` — **www**, không phải apex. Các chỗ ghi apex hiện tại (`apps/web/.env.example:12`, `process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md:160,511,901,1038`) là **stale**, sửa luôn theo D5, không phải một quyết định mới. | Git đã quyết: commit `24bf005` (2026-07-17, "canonical host") đặt www ở cả `next.config.ts` và `metadata.ts`, một ngày sau khi `ca9f1fd` ghi apex vào `.env.example` — apex là đồ cũ sót lại. |
| **D6** | Package scope `@dtw/*` | **HOÃN có chủ đích**, không phải bỏ sót. Nếu làm, làm ở **Phase 7**, một **commit atomic riêng**, kèm lockfile sinh lại. | 3 package đều `"private": true, "version": "0.0.0"` — không publish ra ngoài, không rủi ro hợp đồng bên thứ ba, chỉ gây xáo trộn 61 file import mà không đổi lấy gì độc giả nhìn thấy. |
| **D7** | Repo / thư mục | Đổi tên **repo GitHub** `hieuhn09/dtw-web` → `otw-web`. **Giữ nguyên** thư mục local `/home/hieunc/Code/dtw-web`. | GitHub tự redirect path cũ cho cả web lẫn git remote. Đổi tên thư mục local sẽ hỏng các đường dẫn tuyệt đối hardcode xuyên repo (`data-exports/export-image-research.cjs:1,5`, `data-exports/README.md:82`, `content-engine/scripts/social-render-poc.ts:78`). |
| **D8** | Tagline | Thay `"Tech Intelligence, Wired Daily"` → **`"Tech Intelligence, Openly Wired"`**. Đây là sửa **invariant #11** của `process/context/all-context.md`. | "Wired Daily" là chơi chữ dựa tên cũ, không còn ăn khớp. Đây là sửa đổi tầng nhận diện (brand book coi "Daily Pulse" là core concept), không phải một lần đổi câu chữ. |
| **D9** | Paywall / Pro copy | **HOÃN** việc viết lại copy paywall (vd. `"Free limit reached"`, các câu mô tả gói) cho tới khi `PAYWALL_ENABLED` được bật thật. **Chỉ đổi tên gói** `"DTW Pro"` cho khớp brand mới ngay trong đợt này. Cơ chế paywall (soft meter, invariant #4) **không đổi**. | `apps/web/src/lib/paywall.ts:24` hiện là `PAYWALL_ENABLED = false` — không có gì đang render các câu đó. Hoãn phần copy để tránh viết hai lần nếu chiến lược paywall đổi trước khi launch thật. |
| **D10** | Màu brand | **Giữ nguyên** navy `#1B2A52`, terracotta `#D4623C`. Không đụng token màu, không đụng `cover-art.tsx`, không đụng `globals.css` giá trị hex (chỉ sửa **text comment** nhắc tên brand cũ, vd. `/* DTW coral */`). | Miễn phí giữ nguyên; đổi màu sẽ lan xuống ~46 hex hardcode ở `cover-art.tsx`, 20 chỗ dùng `--brand-navy` trên 12 file, 6 asset nhị phân, và làm hỏng anti-pattern guard ở `brief-asia-web/DESIGN.md:115-116`. |
| **D11** | Slug nội bộ `dtw` | **Đóng băng vĩnh viễn.** Ghi tài liệu là legacy identifier có chủ đích, không phải nợ kỹ thuật. | `apcg-cms/src/collections/Tenants.ts:57`: *"Must match the content-engine registry id. Never change after launch."* Là join key xuyên 4 service, nằm trong 1,063 URL hero-image live, và bị suy ra bằng `toUpperCase()` thành các tên biến FB/LI env — đổi sẽ đẻ lỗi âm thầm compiler không bắt được. |
| **D12** | Schema `dtw_auth` / bucket `dtw-media` | **Đóng băng cả hai.** | `dtw_auth` xuất hiện trong một migration **đã apply và hash-checked** trên Neon DB trung tâm dùng chung; sửa file snapshot sẽ phát ra `DROP SCHEMA`/`CREATE SCHEMA`. Bucket R2 không đổi tên tại chỗ được — đổi nghĩa là copy toàn bộ object + viết lại mọi URL media đã lưu. |
| **D13** | Bài đã publish | **KHÔNG** đụng bài có byline nhà báo. **CHỈ** sửa brief do máy soạn — tập nhận diện qua sign-off `_Compiled by {byline} from {siteName} reporting._` tại `content-engine/admin/src/lib/brief-payload.ts:243`, và các dòng đã xác nhận chứa `"At DailyTechWire, we've tracked…"` trong `data-exports/articles_images.csv` (dòng 9, 116, 156, 2665, 3270 — con số thật trên production **chưa biết**, xem §7 ẩn số #1). | Editorial integrity: rewrite nội dung bài báo là quyết định biên tập, không phải rebrand. Brief máy soạn là nội dung generate-time có thể sửa lại một cách an toàn qua Payload Local API. |
| **D14** | 6 key browser-storage | **Đổi tên** — miễn phí vì đổi domain (D3) đã xoá sạch chúng theo origin rồi (5× `localStorage` + 1 cookie `dtw-read-count` không có `domain=`). | Lập luận "đổi tên làm mất trạng thái độc giả" không còn hiệu lực khi domain đã đổi bất kể tên key là gì. |
| **D15** | `/home/hieunc/Code/DTW` | Đánh dấu để **xoá ở Phase 7**, nhưng **PHẢI hỏi user xác nhận trước khi xoá thật**. | Bản `cp` không version-control của design bundle, cũ 2 thế hệ sản phẩm, khẳng định định danh pháp lý bịa (`UEN 202612345A`, ISSN chưa điền). Không phải git repo — không có lịch sử để giữ, nhưng xoá vĩnh viễn cần xác nhận người. |

### Hai chỗ LỆCH khỏi khuyến nghị mặc định của tài liệu tham chiếu

**D4 lệch khỏi §2-D4 của tài liệu tham chiếu.** Tài liệu tham chiếu khuyến nghị *"Có, giữ vô thời hạn"* — gắn cả `dailytechwire.com` và `www.dailytechwire.com` vào project Vercel, redirect 301 giữ nguyên path sang `https://www.opentechwire.com/:path*`, trong 12+ tháng, với lý do "không tốn gì; bỏ một host đi là biến mọi inbound link thành 404". **Ledger thắng.** Lý do user đưa ra: Google manual action đang treo trên domain cũ là **di sản của chủ trước**, không phải hệ quả nội dung do user hiện tại tạo ra; con đường 301 + Change of Address chính là cơ chế kỹ thuật khiến một hình phạt "đi theo" sang tên miền mới, nên user chủ động không dùng cơ chế đó. Domain cũ vẫn được **giữ quyền sở hữu** (parked) để không bị người khác đăng ký lại, nhưng không phục vụ traffic và không tham gia bất kỳ chuỗi tín hiệu SEO nào sang domain mới.

**D9 lệch khỏi §2-D9 của tài liệu tham chiếu ở mức độ hoãn.** Tài liệu tham chiếu khuyến nghị *"Không đổi cơ chế; đánh dấu lại phần copy"* — tức là nên **chốt hướng xử lý** toàn bộ copy paywall/Pro ngay trong đợt rebrand này (dù ghi nhận mức khẩn thấp vì `PAYWALL_ENABLED = false`). Ledger của user thu hẹp phạm vi hơn nữa: **hoãn toàn bộ việc viết lại copy** (kể cả câu `"Free limit reached"`) sang thời điểm bật flag thật, **chỉ** làm ngay việc đổi tên gói `"DTW Pro"`. Lý do: tránh tốn công viết copy cho một luồng chưa render gì (code chết), và tránh phải viết lại hai lần nếu chiến lược paywall thay đổi trước khi `PAYWALL_ENABLED` thực sự bật.

---

## 3. Phased Delivery Plan — Bản đồ 8 phase

Shape này bám theo §7 của tài liệu tham chiếu, nhưng đã **loại bỏ mọi bước lỗi thời do D4** (xem §4 "Hệ quả D4" bên dưới để biết chính xác bước nào bị cắt). Mỗi phase dưới đây là một đoạn tóm tắt cho mục đích orchestration — plan file riêng của từng phase (được tạo khi phase đó tới lượt) phải **nghiên cứu lại** danh sách file/dòng cụ thể tại thời điểm execute, không copy nguyên số dòng từ tài liệu tham chiếu 08-09-26 vì codebase có thể đã trôi.

Tên file phase plan **thực tế đang tồn tại** (cập nhật 09-09-26 — cả 8 phase đã thống nhất dạng `phase-N-<slug>_PLAN_<dd-mm-yy>.md`; quy ước gợi ý ban đầu `rebrand-phase-0N-…` đã bị bỏ. Đây là danh sách **có thẩm quyền**):

| Phase | Plan file (trong `process/features/rebrand/active/`) | Report file (trong `process/features/rebrand/reports/`) |
|---|---|---|
| 0 | `phase-0-lock-decisions_PLAN_09-09-26.md` | `phase-0-lock-decisions_REPORT_<dd-mm-yy>.md` |
| 1 | `phase-1-long-clocks_PLAN_08-09-26.md` | `phase-1-long-clocks_REPORT_<dd-mm-yy>.md` |
| 2 | `phase-2-generators-and-config_PLAN_08-09-26.md` | `phase-2-generators-and-config_REPORT_<dd-mm-yy>.md` |
| 3 | `phase-3-the-mark_PLAN_08-09-26.md` | `phase-3-the-mark_REPORT_<dd-mm-yy>.md` |
| 4 | `phase-4-rendered-copy_PLAN_08-09-26.md` | `phase-4-rendered-copy_REPORT_<dd-mm-yy>.md` |
| 5 | `phase-5-content-engine_PLAN_08-09-26.md` | `phase-5-content-engine_REPORT_<dd-mm-yy>.md` |
| 6 | `phase-6-cutover_PLAN_08-09-26.md` | `phase-6-cutover_REPORT_<dd-mm-yy>.md` |
| 7 | `phase-7-estate-cleanup_PLAN_08-09-26.md` | `phase-7-estate-cleanup_REPORT_<dd-mm-yy>.md` |

**Quy ước report thống nhất: `<đúng slug của plan file>_REPORT_<dd-mm-yy>.md`.** Phase 2 từng ghi `rebrand-phase-02-…_REPORT_…` — dùng bảng trên, không dùng chuỗi đó.
Không đổi tên các file plan đã tồn tại nữa (nhiều tài liệu chéo đang trỏ vào đường dẫn hiện tại).

### Phase 0 — Chốt và ghi lại quyết định (context trước, code sau)
**Mục tiêu một câu**: Ghi D1–D15 vào `process/context/` và dọn các quả bom hẹn giờ rẻ nhất, trước khi bất kỳ file sản phẩm nào bị sửa.
**Trong phạm vi**: `process/context/all-context.md` (invariant #7/#11/#14 viết lại phần chữ; thêm invariant mới về brand casing 3-tầng theo D1/D2; thêm mục canonical-host mới theo D5; sửa dòng 18/38); `process/context/uxui/all-uxui.md:152-154` (site name/wordmark/tagline, giữ lại lịch sử phương án bị loại); `process/context/infra/all-infra.md` (canonical host + tiền đề DKIM/SPF/DMARC — **không** thêm bất kỳ câu nào về redirect/Change-of-Address, theo D4); `process/context/integrations/all-integrations.md` (ghi lại việc freeze slug `dtw` kèm bằng chứng, theo D11); thêm banner "superseded-by" + đổi `Status` trên `process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md` (43 hit brand casing/apex cũ — nếu không làm bước này, một execute agent tuân theo luật orchestration có thể tự revert rebrand để thoả tiêu chí cũ của plan đó); sửa `apcg-cms/process/general-plans/active/brief-content-type_PLAN_20-08-26.md:115` (`role: "Dailytechwire Newsroom"` — đang CODE COMPLETE nhưng **chưa migrate**, nên hôm nay là sửa text, để sau là một data migration); xoá mệnh đề bịa `, Member, Trust Project` tại `apps/web/src/components/footer.tsx:234`; thêm `data-exports/`, `*-Coverage-*.zip`, `news-p.v1.*.jpeg` vào `.gitignore`; xoá file rác track nhầm (JPEG root, file `ds` 0-byte nếu còn).
**Bổ sung phạm vi 09-09-26 (xem §6b.1)**: phần còn lại của §3.9 process-docs mà trước đây không phase nào nhận — `process/context/auth/all-auth.md` (dòng 52 là **high**), `uxui/all-uxui.md:1,18,74,144,264`, `infra/all-infra.md:1,255`, `integrations/all-integrations.md:1,76,136`, `database/all-database.md`, `tests/all-tests.md`, `planning/all-planning.md`, cả **9 file `process/features/*/_GUIDE.md`**, banner/ghi chú brand cho 6 plan `active/` + 2 plan `backlog/` + 1 reference của feature `account`, và `design/README.md` (sửa đường dẫn hỏng + banner "pre-rebrand" có ghi ngày).
**Ngoài phạm vi**: bất kỳ rename literal `DTW`/`dailytechwire` nào trong UI/SEO/asset code.
**Dependency**: không có — phase đầu tiên, chặn mọi phase khác về mặt quy trình (không phase nào nên chốt code cho tới khi context phản ánh đúng D1–D15).
**Reversible/One-way door**: **Reversible.** Toàn bộ là doc + housekeeping, revert bằng git dễ dàng.
**Ước lượng kích thước**: SMALL → **MEDIUM** sau khi nhận thêm phần §3.9 ở trên (~25 file thay vì 8, nhưng vẫn thuần text).

### Phase 1 — Bấm đồng hồ cho việc dài hạn ngoài repo (song song, không code)
**Mục tiêu một câu**: Khởi động ngay mọi việc thủ công có lead time dài ngày–tuần (DNS/mail, OAuth, trademark, xác nhận quyền sở hữu domain) để chúng không trở thành nút thắt cổ chai khi tới Phase 6.
**Trong phạm vi (việc của user, ngoài mọi repo)**: xác nhận quyền sở hữu `opentechwire.com` + ngày hết hạn tại tenten.vn; kiểm tra GSC Manual Actions panel cho `dailytechwire.com` — **mang tính thông tin/due-diligence, không còn là điều kiện chặn cứng cho việc chuyển domain** vì D4 loại bỏ đúng cơ chế (301/CoA) từng khiến hình phạt "đi theo"; trademark clearance sơ bộ cho "Opentechwire"/"OTW" (class 16/38/41/42, Singapore trước — xem ẩn số §8-4, namespace `*techwire` khá đông); thêm domain mới vào Resend, publish SPF/DKIM/DMARC, bắt đầu warm-up; **THÊM** (không swap) OAuth redirect URI mới ở Google Cloud Console + GitHub App settings, giữ callback cũ sống song song, chưa đổi tên app trên consent screen.
**Ngoài phạm vi**: **không có bước Change of Address ở đây hay bất kỳ đâu trong toàn chương trình** (D4 loại bỏ vĩnh viễn); không đổi tên app OAuth cho tới khi URI mới đã xác nhận hoạt động.
**Dependency**: không phụ thuộc phase nào để bắt đầu; chạy song song với Phase 0/2/3/4/5; **chặn Phase 6** (Resend/OAuth/domain ownership/trademark phải sẵn sàng trước khi cutover).
**Reversible/One-way door**: Phần lớn **reversible** (additive: thêm callback mới, không xoá callback cũ). Đổi tên app OAuth trên consent screen là bước nhạy hơn (có thể kích hoạt lại brand verification) — làm sau cùng trong phase này, coi như bán-one-way.
**Ước lượng kích thước**: SMALL về công sức, **DÀI về wall-clock** (vài ngày đến vài tuần) — đây là long-pole của toàn chương trình.

### Phase 2 — Generator và canonical host (nhỏ, reversible, ship an toàn trước domain flip)
**Mục tiêu một câu**: Cố định canonical host = `www.opentechwire.com` trong code và chuẩn bị generator OG image, xong trước khi domain thật được lật ở Phase 6.
**Trong phạm vi**: `apps/web/src/lib/metadata.ts:26,30` (comment + origin resolver theo D5); `apps/web/.env.example:12-13` (sửa từ apex sang www theo D5, tiện tay sửa BOM UTF-8 + mojibake `â€”` ở các dòng lân cận); `turbo.json` (xác minh `NEXT_PUBLIC_SITE_URL` có nằm trong build-hash `env` array không — chạy `turbo build --dry=json` để verify, thêm nếu thiếu); chuẩn bị (không nhất thiết chạy) `apps/web/scripts/generate-og-default.mjs` cho Phase 3.
**Ngoài phạm vi — hệ quả D4, KHÔNG làm ở phase này (khác với §7 Phase 2 gốc của tài liệu tham chiếu)**: **không** ghim/pin Atom tag authority vào host cũ ở `apps/web/src/lib/feed.ts:61,69,116` — dùng thẳng host mới ngay khi origin đổi, vì không còn "subscriber qua redirect" nào cần một identity ổn định xuyên domain-move để bảo vệ; **không** thêm bất kỳ redirect rule nào theo host trong `apps/web/next.config.ts` (xem §4).
**Dependency**: sau Phase 0 (context đã ghi D5); độc lập với Phase 1.
**Reversible/One-way door**: **Reversible** — thuần code, chưa deploy domain thật.
**Ước lượng kích thước**: SMALL.

### Phase 3 — Cái mark, một commit atomic (thị giác)
**Mục tiêu một câu**: Vẽ lại toàn bộ logo/icon/OG-card theo `OTW`/`opentechwire` (D1/D2), giữ nguyên màu (D10), ship như một khối để không lộ trạng thái nửa vời trên tab trình duyệt/install-prompt/social-share cùng lúc.
**Trong phạm vi**: `apps/web/src/components/wordmark.tsx` (monogram, wordmark text, `aria-label`, `viewBox`/pulse geometry, docblock); `apps/web/src/app/icon.svg` (`aria-label`, `<text>`); vẽ lại `apple-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (không có generator — vẽ tay; nhân tiện sửa lỗi lệch tâm dọc của bản maskable hiện tại); sửa `apps/web/scripts/generate-og-default.mjs` (wordmark, tagline theo D8, chỉnh lại `cx` pulse-dot cho khớp độ dài chữ mới) rồi chạy lại và commit PNG; vẽ lại hoặc xoá `apps/web/public/dtw-logo-primary.svg` (không có code nào tham chiếu — quyết định xoá hay vẽ lại cần hỏi user khi vào phase); lockup email tại `apps/web/src/lib/email.ts:79`; `apps/web/src/app/manifest.ts:13-15,18-19` (giữ nguyên `background_color`/`theme_color` theo D10). Sau đó: upload monogram mới lên Supabase Storage dưới một **object key mới** (đừng ghi đè key cũ khi social post đang queued còn trỏ vào nó), rồi trỏ `content-engine/src/lib/publications/dtw/index.ts:182-183` (`logoAssetUrl`) vào key mới.
**Ngoài phạm vi**: đổi màu (D10 giữ nguyên); copy văn xuôi hiển thị (Phase 4).
**Dependency**: sau Phase 0 (D1/D2/D8/D10 đã ghi vào context); độc lập với Phase 1/2; **chặn Phase 5** (logoAssetUrl cần key mới đã tồn tại trước khi content-engine trỏ vào).
**Reversible/One-way door**: **Reversible** (asset có version trong git/storage), nhưng phải ship nguyên khối trong một deploy — không tách text ra khỏi binary.
**Ước lượng kích thước**: MEDIUM.

### Phase 4 — Copy hiển thị toàn bộ, 3 locale
**Mục tiêu một câu**: Quét và sửa toàn bộ prose hiển thị cho reader trên `dtw-web` — cả hai kiểu casing cũ đang tồn tại, cả 3 locale, kể cả phần code hiện không render (dead code) — để không còn brand cũ nào trốn được, và đóng một known-gap tồn đọng ở `/trust/ai`.
**Trong phạm vi**: mọi mục ở tài liệu tham chiếu §3.1 (ui-components — footer, header nudge copy, auth-modal, article-content, article-body disclosure, `disclosure-box.tsx` code chết, `sponsored-strip.tsx`/`best-of-reviews.tsx` code chết, `pillar-content.tsx`, `home-hero.tsx` label, CSV filename, `.dtw-tip` class + `globals.css`; **KHÔNG** `wordmark.tsx` — cả file thuộc Phase 3), **§3.2 (seo-metadata — title template, `og:site_name`, 3 route RSS, JSON-LD `WebSite.name` + `alternateName`, `llms.txt`, `not-found`, `payload.config.ts` titleSuffix, `feed.ts:21,122`; trừ các dòng đã gán Phase 2/3/6)**, phần §3.4/§3.5/§3.6 được gán ở §6b.1 (`.dtw-tip`, `globals.css:20`, `payload/collections/Articles.ts:31` + regenerate types, `scripts/seed-payload.ts`, 2 file `demos/*.html`), và §3.3 (editorial-pages — about, newsroom, press, contact, advertise, studio, `legal/[slug]`, newsletters-content, briefing-content, trust-content, reset-password — **cẩn thận bẫy casing hỗn hợp trong cùng file** và **bẫy dính-chùm với APCG**, giữ nguyên mọi câu về APCG/Bugis Cube/Cheryl Tan, chỉ đổi tên publication); áp dụng tagline D8 ở mọi vị trí còn lại (`header.tsx:234-238`, `footer.tsx:140`); cho `dashboards/[[...sub]]/page.tsx:25-31` đi qua `buildMetadata` thay vì string title trần (sửa luôn canonical/OG thiếu trong cùng lượt); **quyết định cùng user** có đóng luôn known-gap AI-disclosure ở `trust-content.tsx:184-187,215-217` (lời hứa nhãn AI-assisted đã bị gỡ theo invariant #5 nhưng trang vẫn mô tả như đang có) trong đợt này hay tách riêng — đây là một quyết định sản phẩm nằm ngoài D1–D15, phải hỏi trước khi sửa.
**Ngoài phạm vi**: nội dung sống trong DB/CMS (đó là Phase 5/6); mark thị giác (Phase 3); mailbox thật (giá trị domain trong `mailto:`/text literal có thể đổi ngay, nhưng **hộp thư thật** phải chờ Phase 1 provisioning DKIM/SPF/DMARC xong mới có nghĩa).
**Dependency**: nên chạy sau Phase 3 (để tránh hai brand hiện diện song song lâu trên UI) nhưng không bị chặn kỹ thuật bởi nó; sau Phase 0.
**Reversible/One-way door**: **Reversible** — thuần code, revert dễ.
**Ước lượng kích thước**: MEDIUM–LARGE (61 file editorial-pages + 39 file ui-components theo đếm của tài liệu tham chiếu, có thể đã trôi).

### Phase 5 — content-engine: ba writer + dữ liệu liên quan
**Mục tiêu một câu**: Sửa cả ba nơi generate-time đang tự viết brand cũ vào văn bản mới, cập nhật 2 dòng DB sống bên Engine Supabase, rename tại chỗ author row trước khi flip byline, và dọn các brief đã publish khớp sign-off pattern theo D13.
**Tiền đề bắt buộc trước khi bắt đầu**: merge hoặc rebase worktree `content-engine-kpi-gd1-publish-caps` (branch `feat/byline-wad-gcv`, đi trước 1 commit) — nó sửa đúng `admin/src/lib/publish-dtw.ts` và `admin/src/lib/byline-policy.ts` mà phase này cũng chạm vào.
**Trong phạm vi**: `src/lib/publications/dtw/index.ts` (`DTW_VOICE_SPEC` — system prompt rewriter, đây là mục giá trị cao nhất cả chương trình vì để nguyên thì mọi bài mới vẫn tự đúc brand cũ; `name`, `byline` fallback, `siteBaseUrl` ×2, `displayName`, `domain`, `kicker`, `logoAssetUrl` trỏ key mới từ Phase 3); `admin/src/lib/brief-configs.ts` (`SITE_NAMES`, `siteBaseUrl` — bản sao thứ ba, phải sync tay); `src/social/prompts/social-rules.prompt.ts` (prompt LLM thứ hai có brand); `UPDATE publications SET name=… WHERE slug='dtw'` và `UPDATE brief_configs SET byline=…` trên Engine Supabase (**không sửa migration đã apply**); **rename tại chỗ** row `authors` bên Central (`name`/`role`) **trước khi** flip byline generate-time bên engine — vì intake resolve author theo `name` (`apcg-cms/src/app/api/engine/intake/route.ts:481-494`), đổi byline mà không đổi row trước sẽ đẻ ra author thứ hai và cắt đôi kho brief; theo D13, chạy audit thật (không chỉ viết câu SQL) tìm các brief đã publish khớp `_Compiled by {byline} from {siteName} reporting._` hoặc chuỗi `"At DailyTechWire, we've tracked…"`, sửa qua Payload Local API — CHỈ với brief nhận diện được qua sign-off marker, **tuyệt đối không đụng bài có byline nhà báo**.
**Sau khi sửa**: chạy `npm test` trong `content-engine` — 5 fixture (`brief-config.test.ts`, `select.test.ts`, `brief-web-articles-client.test.ts`) hardcode `https://www.dailytechwire.com` và sẽ fail ầm ĩ nếu bỏ sót bản sao nào.
**Ngoài phạm vi**: re-render social card PNG đã render/đang queued (để queue chạy hết, trừ khi user quyết định khác ở thời điểm đó); `SiteCode` của `media-engine` (Phase 7, tuỳ chọn).
**Dependency**: sau Phase 3 (cần `logoAssetUrl` mới); độc lập với Phase 4; **chặn Phase 6** (Engine phải trỏ domain mới và author phải rename xong trước khi cutover thật).
**Reversible/One-way door**: Code **reversible**. UPDATE trên 2 DB row + rename author row là thao tác dữ liệu sống — **bán-one-way** (kỹ thuật có thể UPDATE ngược, nhưng không tự động, cần backup trước khi chạy).
**Ước lượng kích thước**: MEDIUM.

### Phase 6 — CUTOVER (ONE-WAY DOOR)
**Mục tiêu một câu**: Lật toàn bộ domain/host/env sản xuất sang `opentechwire.com` trong một cửa sổ ngắn, không mang theo bất kỳ cơ chế redirect/CoA nào từ domain cũ (D4).
**Trong phạm vi — additive trước (đã có sẵn từ Phase 1)**: OAuth redirect URI mới đã thêm, Resend đã verified + warmed.
**Bổ sung 09-09-26 — hai bước additive BẮT BUỘC nằm TRƯỚC lần flip ở Phase 6:**
- **GitHub OAuth có thể không "thêm được".** Phase 1 bước E.3 phát hiện OAuth App classic chỉ có **một** ô Authorization callback URL. Nếu đúng vậy, Phase 1 không thể thêm song song và Phase 6 PHẢI có một bước **swap giá trị GitHub callback ngay trong cửa sổ**, đặt sát cạnh lần flip `BETTER_AUTH_URL` (sign-in GitHub sẽ hỏng trong đúng vài phút giữa hai thao tác — chấp nhận được, nhưng phải là chủ đích chứ không phải bất ngờ). Không có bước này thì bảng Dependencies của Phase 6 vĩnh viễn không thoả được.
- **Thông báo cho người đăng ký newsletter trước khi đổi From-name** (`apcg-cms/src/collections/Subscribers.ts`) — nghĩa vụ deliverability + minh bạch, phải gửi **trước** lần flip `RESEND_FROM_DOMAIN`/`email.ts:13`, không phải sau.
**Thêm vào, không swap, ngay trước cửa sổ cutover**: origin mới → `PUBLIC_API_ALLOWED_ORIGINS` của Central; origin mới → CORS allowlist của R2 bucket `dtw-media` (tên bucket giữ nguyên theo D12, chỉ thêm origin được phép); attach domain mới vào project Vercel.
**Lật cùng nhau trong MỘT deploy**: `NEXT_PUBLIC_SITE_URL` + `BETTER_AUTH_URL` + `RESEND_FROM_DOMAIN` trên Vercel; `apps/web/src/lib/email.ts:12-13` (fallback domain — nên đổi thành throw ở production nếu env chưa set, thay vì âm thầm gửi từ domain có thể mất DKIM); các chuỗi subject/body magic-link ở `apps/web/src/lib/auth.ts`.
**`/admin` của Central**: cập nhật toàn bộ tenant row — `name`, `domain` (đặt thẳng sang domain mới, **không giữ domain cũ**), `frontendUrl`, `logo`, `brandColor`, `brand.*`, `seo.*`, `contact.*Email`, `socials[]` — đây là đòn bẩy lớn nhất của cả cuộc rebrand (đổi chrome mà không cần deploy code).
**Vercel của content-engine**: `DTW_INTAKE_URL` trỏ domain mới — **thứ tự bắt buộc**: `dtw-web` phải serve domain mới trước, rồi mới lật giá trị này bên engine.
**Social platform + code cùng cửa sổ**: đổi vanity slug LinkedIn (có rate limit, **không có redirect** — 404 ngay khoảnh khắc đổi), username Facebook (username cũ có thể bị người khác chiếm sau khi đổi); ngay sau đó sửa `footer.tsx:63-64` + `metadata.ts:90-91` (`sameAs`) cùng lúc để không lệch nhau.
**GA4**: cập nhật URL data-stream, thêm domain cũ vào referral exclusions (phòng traffic gõ nhầm/link cũ còn tồn tại đâu đó), đánh annotation mốc cutover. Giữ nguyên property `G-5H175FPLGR` và `utmCampaign: 'dtw-social'` (đã đóng băng, nằm trong URL đã đăng + lịch sử GA4).
**Storage key (D14)**: đổi tên 6 key browser-storage — làm ở bước này vì đổi host coi như đã xoá sạch chúng theo origin.
**Chốt lại data-cms-db**: xác nhận các audit content ở §3.6 tài liệu tham chiếu (menu labels, wire drops, corrections, sponsor slots, media alt) đã hoàn tất qua `/admin` (có thể đã bắt đầu từ Phase 4/5, nhưng phải **chốt xong** trước khi coi cutover hoàn tất).
**Khác biệt rõ so với §7 Phase 6 gốc của tài liệu tham chiếu, do hệ quả D4 (xem §4)**: **bỏ hẳn** bước thêm redirect rule theo host trong `next.config.ts`; **bỏ** việc giữ `additionalDomains` trỏ về host cũ ở Central; **bỏ** bước cuối "verify rồi mới nộp Change of Address" — thay bằng "verify rồi dừng lại, domain cũ giữ nguyên trạng thái parked, không có hành động nào khác."
**Ngoài phạm vi**: bất kỳ redirect/CoA nào (loại vĩnh viễn theo D4).
**Dependency**: **CHẶN bởi Phase 1, 2, 3, 4, 5** — về bản chất phase này chỉ mở khi cả 5 phase trước đã xong, vì cutover là lúc mọi thứ additive trở thành thật.
**Reversible/One-way door**: **ONE-WAY DOOR.** Domain cũ không có redirect nên "revert" không phải một lệnh — nó là dựng lại toàn bộ signal traffic/SEO từ đầu; slug LinkedIn/username Facebook đổi có rate-limit và có thể mất vĩnh viễn cho bên thứ ba.
**Ước lượng kích thước**: MEDIUM (nhiều bước nhỏ, cửa sổ thực hiện ngắn, nhưng chạm nhiều hệ thống ngoài repo).

### Phase 7 — Estate cleanup + hoãn có chủ đích
**Mục tiêu một câu**: Dọn các repo anh em APCG, xử lý `/home/hieunc/Code/DTW` theo D15 (có hỏi lại), đổi tên repo GitHub theo D7, và — chỉ nếu user yêu cầu ở thời điểm đó — đổi scope package theo D6 như một commit tách riêng.
**Trong phạm vi**: `wad-web` (4 danh sách "network" duy trì tay: `site-config.ts:72-80`, `advertise/page.tsx:42-54`, `BUSINESS.md`, `REBUILD_PLAN.md` — sửa cả bốn cùng lúc, chỉ sau khi domain mới đã resolve được); comment nhắc DTW trong `brief-asia-web` (không phải anti-pattern guard ở `DESIGN.md:115-116` — cái đó chỉ đổi nếu D10 từng lật, mà D10 không lật nên **để nguyên**); `media-engine` `SiteCode` union (`'DTW'`) — quyết định đổi tên trực tiếp hay dùng một display-map ở `hero-resolve/site-map.ts` (seam đã có sẵn để cutover zero-downtime, ví dụ entry hai key `{ otw: 'OTW', dtw: 'OTW' }`) — **lưu ý identifier này không nằm trong D11/D12, có thể đổi độc lập**; `APCG-web` — **xác nhận tình trạng deploy thật trước** (ẩn số §8-8: repo local có vẻ đã bị thay thế bởi site production khác) rồi mới quyết định có đáng sửa không; xử lý `/home/hieunc/Code/DTW` theo D15 — **hỏi user xác nhận xoá thật hay giữ lại có ghi chú**, không tự động xoá; đổi tên repo GitHub `hieuhn09/dtw-web` → `otw-web` (D7 — không đổi thư mục local).
**Tuỳ chọn, tách riêng, chỉ nếu user yêu cầu ở thời điểm Phase 7**: đổi scope `@dtw/*` → `@otw/*` (D6) trong **một commit atomic riêng biệt**, kèm `pnpm-lock.yaml` sinh lại, cập nhật đồng thời `package.json` (3 package + root + `apps/web`), `tsconfig.json` (3 chỗ `extends`), `next.config.ts` `transpilePackages`. Đây là hoãn **có chủ đích**, ghi lại rõ ràng, không phải bỏ sót.
**Ngoài phạm vi**: bất kỳ redirect/CoA (D4 — vĩnh viễn); đổi tên thư mục local (D7 — vĩnh viễn "chưa đổi").
**Dependency**: sau Phase 6 (một số việc — vd. label network ở `wad-web` — cần domain mới đã sống thật); D15 (xoá `/home/hieunc/Code/DTW`) và D7 (đổi tên repo GitHub) về mặt kỹ thuật độc lập với domain, có thể làm sớm hơn nếu muốn, nhưng gom vào Phase 7 cho gọn theo cấu trúc chương trình.
**Reversible/One-way door**: Phần lớn **reversible** (GitHub tự động redirect path repo cũ). Xoá `/home/hieunc/Code/DTW` là **one-way** cho riêng hành động đó — không phải git repo, không có lịch sử để khôi phục, đây là lý do D15 yêu cầu hỏi lại trước khi xoá.
**Ước lượng kích thước**: SMALL (trừ khi D6 được kích hoạt, khi đó cộng thêm MEDIUM cho riêng commit đó).

---

## Phase Completion Rules

Áp dụng cho cả 8 phase (mỗi phase plan riêng có thể bổ sung tiêu chí cụ thể hơn, nhưng không được thấp hơn mức này). Mượn nguyên "Phase Status Rules" của `process/development-protocols/phase-programs.md`:

Một phase KHÔNG được coi là xong cho tới khi:

1. **Gate của chính phase đó đạt** — chạy đúng cổng verification ở §6 áp dụng cho phase đó (grep, `tsc --noEmit`, `npm test`, mở tay asset nhị phân, chạy thật SQL audit — tuỳ phase).
2. **Regression check** — chạy lại một kiểm tra hẹp đại diện cho các phase trước đã `✅ VERIFIED` mà bề mặt chạm vào trùng với phase hiện tại (ví dụ: Phase 4 sửa xong thì chạy lại grep tổng để chắc Phase 3 chưa bị đụng lại).
3. **Bằng chứng chạy thật, không suy luận** — "build pass" hoặc "code compiles" không phải bằng chứng cho một thay đổi chạm DB/CMS/domain/OAuth. Phải có output lệnh thật hoặc xác nhận qua dashboard thật.
4. **Đường lỗi được kiểm tra, không chỉ đường vui** — với các phase chạm external contract (Phase 1, 5, 6), phải nêu rõ điều gì xảy ra khi bước đó thất bại (vd. cron fail-closed, CORS trả rỗng, OAuth 401) và xác nhận hành vi đó đúng như mô tả ở §7.
5. **User confirmation** — user đã xem bằng chứng ở report và xác nhận trước khi phase được đánh dấu `✅ VERIFIED`. Không có xác nhận này, trạng thái cao nhất được phép là `🧪 TESTING`.

Marker trạng thái dùng thống nhất cho mọi phase report: `⏳ PLANNED` · `🔨 CODE DONE` · `🧪 TESTING` · `✅ VERIFIED` · `🚧 BLOCKED`.

Riêng Phase 6 (CUTOVER): vì là one-way door, phase này **không được** vào trạng thái `✅ VERIFIED` chỉ dựa trên "deploy xanh" — phải có xác nhận thủ công qua từng dashboard external liệt kê ở mục Verification Evidence bên dưới, cộng với ít nhất một lượt đăng nhập/magic-link/OAuth thật thành công trên domain mới.

---

## 4. Hệ quả của D4 — danh sách cắt bỏ tường minh

Vì D4 lệch khỏi khuyến nghị mặc định của tài liệu tham chiếu, các bước sau đây **đã lỗi thời trong tài liệu tham chiếu §7 Phase 2 và Phase 6** và **KHÔNG được chép lại** vào bất kỳ phase plan nào của chương trình này:

1. **Không** ghim (pin) Atom tag authority vào host cũ trong `apps/web/src/lib/feed.ts:61,69` và `<id>` cấp feed ở dòng 116 — Phase 2 dùng thẳng host mới ngay khi origin đổi.
2. **Không** thêm bất kỳ rule redirect **xuyên domain** nào (`dailytechwire.com` / `www.dailytechwire.com` → `www.opentechwire.com`) vào `apps/web/next.config.ts` `redirects()` — bỏ hẳn phần "đặt host rule lên đầu mảng trước 5 rule theo path hiện có" khỏi Phase 6.
   **Làm rõ (09-09-26):** điều cấm này áp dụng cho redirect **từ host cũ sang host mới**. Nó **không** cấm rule chuẩn hoá `apex → www` **trong cùng một domain mới** (`opentechwire.com` → `https://www.opentechwire.com/:path*`) — đó là cơ chế D5 (canonical www) mà commit `24bf005` đã dựng cho domain cũ, không phải cơ chế mang hình phạt đi theo. Phase 2 **thêm** rule apex→www cho domain mới (dormant cho tới khi domain được attach ở Phase 6); Phase 6 **xoá** rule apex→www của domain cũ khi decommission nó. Sau Phase 6, `next.config.ts` phải còn **đúng một** host rule và nó phải trỏ `opentechwire.com` → `www.opentechwire.com`.
3. **Không** giữ `additionalDomains` trỏ về host cũ trong Central tenant row (`apcg-cms/src/collections/Tenants.ts`) ở Phase 6.
4. **Không** có bước "nộp Change of Address" ở cuối Phase 6 hay bất kỳ đâu trong 8 phase.
5. Phase 1's bước kiểm tra Google Manual Action panel đổi từ **điều kiện chặn cứng** (theo tài liệu tham chiếu — *"đừng migrate cho tới khi manual action được gỡ"*) thành **due-diligence mang tính thông tin** — vì cơ chế khiến hình phạt "đi theo" (301 + CoA) đã bị loại bỏ hoàn toàn theo D4.

---

## 5. Quy ước dùng chung cho mọi phase

### 5.1 Chuỗi brand chuẩn (D1/D2/D8)

| Ngữ cảnh | Chuỗi chuẩn | Ghi chú |
|---|---|---|
| Văn xuôi / metadata / title / alt / JSON-LD `name` | `Opentechwire` | Sentence case, không PascalCase |
| Wordmark / OG lockup (thị giác, chữ trong SVG/PNG) | `opentechwire` | Viết thường, chỉ trong lockup |
| Monogram / favicon glyph | `OTW` | Viết hoa hết |
| **Cấm tuyệt đối** | `OpenTechWire` | Không dùng ở bất kỳ đâu — PascalCase bị cấm rõ ràng theo D1 |

#### 5.1.1 Luật phân giải `DTW` → `OTW` hay `Opentechwire`? (bổ sung 09-09-26 sau soát nhất quán)

D1/D2 chốt casing nhưng **không** nói `DTW` đứng một mình trong câu thì thay bằng gì. Phase 4 (UI) và Phase 5/7 (comment/doc/prompt) đã diễn giải khác nhau — đây đúng là loại lỗi mà cả chương trình này sinh ra để sửa. Luật thống nhất, áp dụng cho **mọi phase**:

| `DTW` xuất hiện dưới dạng | Thay bằng | Ví dụ |
|---|---|---|
| **Nhãn ngắn / token UI đứng một mình** (tiêu đề cột footer, breadcrumb, chip, `label=`, tên file tải về, tiêu đề modal ngắn) | `OTW` | `t("DTW","DTW","DTW")` → `t("OTW",…)`; `<Link href="/">DTW</Link>` → `OTW`; `DTW · {pillarLabel}` → `OTW · {pillarLabel}`; `label="DTW HERO"` → `label="OTW HERO"` |
| **Token ghép đặt tên một team/sản phẩm** | `OTW <Token>` | `DTW Studio` → `OTW Studio`; `DTW Briefing Desk` → `OTW Briefing Desk`; `DTW Awards` → `OTW Awards`; `DTW Daily Brief` → `OTW Daily Brief` |
| **Từ thay thế cho tên ấn phẩm bên trong một CÂU hoàn chỉnh** (disclosure, copy pháp lý, prose reader-facing, comment code, tài liệu, system prompt) | `Opentechwire` (viết đủ) | `"Some links … earn DTW a commission"` → `"… earn Opentechwire a commission"`; `"The DTW newsroom was not involved"` → `"The Opentechwire newsroom was not involved"`; `"DTW does not accept review units"` → `"Opentechwire does not accept…"`; comment `Same pattern as DTW's getAiModels` → `… as Opentechwire's getAiModels` |
| **Tiền tố định danh kỹ thuật** (storage key, tên file CSV, site code, class CSS) | `otw-` / `OTW` viết thường-hoa theo đúng dạng cũ | `dtw-theme` → `otw-theme`; `dtw-funding-tracker.csv` → `otw-funding-tracker.csv`; `.dtw-tip` → `.otw-tip`; `SiteCode 'DTW'` → `'OTW'` |
| **Định danh đóng băng** (§5.2) | **không đổi** | `id: 'dtw'`, `dtw_auth`, `dtw-media`, `FB_PAGE_ID_DTW`, `hero-images/dtw/` |

Quy tắc mẹo phân biệt hai dòng đầu với dòng thứ ba: **nếu bỏ token ra thì câu vẫn là một câu tiếng Anh/Việt hoàn chỉnh có chủ-vị → đó là văn xuôi → dùng `Opentechwire`.** Nếu token đứng một mình như một nhãn (không có động từ quanh nó) → dùng `OTW`.
| Tagline | `Tech Intelligence, Openly Wired` | D8, sửa invariant #11; bản dịch vi/id phải dịch **khái niệm**, không dịch chơi chữ "daily" |
| Canonical host | `https://www.opentechwire.com` | D3/D5, www không phải apex |
| Sub-brand studio (chờ xác nhận theo D2 khi vào Phase 3/4) | `OTW Studio` | Cùng pattern D2, áp dụng khi phase đó tới lượt |

### 5.2 Identifier ĐÓNG BĂNG — TUYỆT ĐỐI KHÔNG sed vào các chuỗi này (D11/D12)

**Theo D11 — slug `dtw` xuyên hệ thống:**
- `apcg-cms/src/collections/Tenants.ts:57` field `slug` — giá trị `'dtw'` (chỉ đổi `name`, không đổi `slug`)
- `content-engine/src/lib/publications/dtw/index.ts:89` — `id: 'dtw'` (`PublicationId`)
- `content-engine/src/lib/publications/registry.ts` — key registry `dtw`
- `content-engine/admin/src/lib/dtw-intake-client.ts:99,174` — `publicationId: 'dtw'` trong body request (Central từ chối publicationId lạ)
- `content-engine/admin/src/lib/publish-dtw.ts:83,99,153` — guard `if (slug !== 'dtw')`
- `content-engine/admin/src/lib/publish-caps.ts` — key `PublishCapSlug` = `dtw`
- `content-engine/admin/src/lib/byline-policy.ts` — key block `dtw:`
- `content-engine/admin/src/lib/social-configs.ts` — key `SocialPublicationSlug`/`SOCIAL_SITE_NAMES.dtw` (chỉ display-name value đổi, key giữ nguyên)
- Tên biến env suy ra bằng `toUpperCase()` từ slug: `FB_PAGE_ID_DTW`, `FB_PAGE_TOKEN_DTW`, `LI_ORG_URN_DTW` (`admin/src/lib/publish-social.ts:59-61`)
- `content-engine/config/sources.yaml` — mọi `publication_targets: ["dtw", …]` (16 mục)
- `content-engine/src/editorial/image-uploader.ts` — biến `brand` dùng làm storage-prefix `hero-images/dtw/…`
- `content-engine/.github/workflows/{brief,social-produce,pipeline}.yml` — giá trị `dtw` trong các repo variable CSV (`BRIEF_COMPOSE_PUBS`, `SOCIAL_PRODUCE_PUBS`, `PUBLISH_DAILY_CAPS`, `AUTOPUBLISH_CAPS`, `BRIEF_PUBLISH_PUBS`, `SOCIAL_POST_PUBS`)
- `utmCampaign: 'dtw-social'` (`content-engine/src/lib/publications/dtw/index.ts:186`, lặp ở `admin/src/lib/social-configs.ts:118`)
- `data-exports/*.csv` — mọi giá trị `site=dtw` / `publication_targets: ["dtw", …]`; JSONB `filter_scores` đánh key theo slug

**Theo D12 — schema/bucket:**
- `packages/db/src/schema/auth.ts:24` — `pgSchema("dtw_auth")`
- `packages/db/migrations/0000_dtw_auth_baseline.sql` — **toàn file** (đã apply + hash-checked)
- `packages/db/migrations/meta/0000_snapshot.json` — toàn file, bao gồm `"dtw_auth": "dtw_auth"`
- `packages/db/migrations/meta/_journal.json:9` — `"tag": "0000_dtw_auth_baseline"` (phải khớp byte-for-byte tên file `.sql`)
- Giá trị `R2_BUCKET="dtw-media"` ở mọi `.env.example`/config production

**Cảnh báo bổ sung (không thuộc D11/D12 nhưng cùng nhóm rủi ro-đổi-âm-thầm, cần cẩn trọng khi phase chạm vào file chứa chúng):** tên biến `DTW_INTAKE_TOKEN` (nếu có phase nào cân nhắc đổi tên, phải dual-read `OTW_INTAKE_TOKEN ?? DTW_INTAKE_TOKEN` một deploy trước khi engine chuyển hẳn — nhưng mặc định của chương trình này là **giữ nguyên tên biến**, chỉ đổi giá trị); `DTW_DASHBOARD_REFRESH_TOKEN` (đổi tên được nhưng giá trị trên Vercel phải tồn tại dưới tên mới **trước** deploy, không thì cron 03:00 thứ Hai fail closed).

### 5.3 File CẤM ĐỘNG — không sed, không rewrite, không xoá trước khi migration xong

- `packages/db/migrations/0000_dtw_auth_baseline.sql` — đã apply, hash-checked
- `packages/db/migrations/meta/0000_snapshot.json`, `packages/db/migrations/meta/_journal.json`
- `content-engine/supabase/migrations/**/*.sql` — đã apply (đặc biệt `001_initial.sql`, `016_daily_briefs.sql`, `017_social.sql`)
- `apcg-cms/scripts/seed.ts:207` — field `slug` cụ thể (đổi `name` ở dòng 208 thì được)
- `apcg-cms/src/collections/Media.ts:130` — hook `prefix` (chỉ ghi một lần lúc create, cố tình không rewrite)
- `apcg-cms/scripts/migrate/export-source.ts:102` — comment chứa một số đo lịch sử (`"Measured on the dtw cutover: 1 article of 1245"`) — đừng viết lại
- `brief-asia-web/public/design-prototype.html:290` và `brief-asia-web/BriefAsia (full site).html:290` — chứa 68 chuỗi con `DTW` nhưng là **nhiễu base64 bên trong PNG data URI nhúng** — replace vào là hỏng ảnh
- `data-exports/articles_images.csv` — artifact bằng chứng cho audit D13, đừng sửa/xoá trước khi migration nội dung xong
- `dailytechwire.com-Coverage-2026-08-06.zip` — bằng chứng GSC export, giữ lại; kéo bản export mới trước khi archive bản cũ
- `.claude/settings.json:49` — chuỗi `/tmp/dtw-v2/pillar-390-2x.png` nằm trong một Bash permission allowlist matcher — đây là literal đóng băng của công cụ, đổi là hỏng match, không liên quan gì tới brand
- `design/chats/*.md`, `process/general-plans/completed/**`, mọi report/plan đã archive có ghi ngày — hồ sơ lịch sử, giữ nguyên làm bằng chứng

---

## 6. Cổng verification chung + cảnh báo grep

Lệnh grep chuẩn (chạy sau **mỗi** phase, không chỉ ở cuối chương trình). **Bắt buộc dùng tiền tố `command ` để bypass ugrep shim** — mọi phase plan phải dùng đúng dạng này, không dùng `grep` trần:

```
command grep -rniE 'dailytechwire|daily ?tech ?wire|\bdtw\b|@dtw/|Tech Intelligence, Wired Daily' . \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=.turbo \
  --exclude-dir=dist --exclude='*.tsbuildinfo' --exclude=pnpm-lock.yaml --exclude-dir=data-exports
```

**Chống "0 hit giả":** tiêu chí "0 hit trừ danh sách đóng băng" không kiểm được bằng máy nếu danh sách đóng băng chỉ nằm trong đầu người đọc. Mỗi phase report PHẢI dán output đầy đủ và đối chiếu **từng dòng còn lại** với §5.2/§5.3 hoặc với bảng "Ngoài phạm vi" của phase đó — dòng nào không khớp mục nào là một dòng bị sót, không phải "chắc là đúng thiết kế".

**Hai cảnh báo bắt buộc phải truyền cho mọi execute agent của mọi phase:**

1. **`grep` mặc định trong môi trường này là một ugrep shim** có sẵn `--ignore-files` (âm thầm tuân theo `.gitignore`) và `-I` (âm thầm bỏ qua file nhị phân). Các flag `--exclude*` ở trên là **bắt buộc**, không phải phòng hờ — thiếu chúng, kết quả sẽ không tái lập được dưới `command grep`, `ripgrep`, hay CI.
2. **Grep sạch KHÔNG chứng minh rename đã xong.** 6 asset nhị phân (`apple-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `og-default.png`, và bản social-card monogram trên Supabase) vô hình với grep và **phải mở tay từng cái** để xác nhận.

**Bổ sung cho từng phase áp dụng nếu liên quan:**
- `tsc --noEmit` (root `dtw-web` qua `turbo run typecheck`, và `content-engine` riêng) — bằng chứng cho tham chiếu treo (dangling import) sau khi đổi `@dtw/*` (nếu D6 kích hoạt ở Phase 7) hoặc sau khi xoá file mồ côi.
- `npm test` trong `content-engine` sau Phase 5 — 5 fixture hardcode domain cũ sẽ fail nếu bỏ sót bản sao.
- Nếu một phase sau này bổ sung test tự động cho `dtw-web` (repo hiện gần như chưa có test — xem `process/context/tests/all-tests.md`), chọn runner theo đúng hướng dẫn ở tài liệu đó thay vì tự chọn framework mới.
- Chạy **thật** (không chỉ viết ra) các câu SQL audit ở tài liệu tham chiếu §3.6 trên Central, Engine Supabase, và `dtw_auth`, trước khi coi Phase 5/6 là verified.
- Cân nhắc đưa lệnh grep ở trên vào `.github/workflows/ci.yml` như một guard vĩnh viễn sau khi chương trình hoàn tất (tài liệu tham chiếu ghi nhận `process/features/about-trust/_GUIDE.md:70` đã khuyến nghị đúng cơ chế này cho một vấn đề tương tự — nội dung bịa mọc lại).

---

## 6b. Bản đồ phủ §3 → phase (bổ sung 09-09-26 sau soát nhất quán giữa 9 plan)

Một lượt soát chéo 8 phase plan với bảng §3 của tài liệu tham chiếu tìm ra **các touchpoint không được phase nào nhận**. Chúng được gán chủ sở hữu ngay dưới đây; mỗi phase plan tương ứng đã được cập nhật để chứa bước thực thi. **Không mục nào dưới đây được coi là "đã xử lý ở đâu đó" nếu không thấy nó trong checklist của phase được gán.**

### 6b.1 Khoảng trống đã gán chủ

| §3 | Touchpoint bị bỏ sót | Phase được gán | Ghi chú |
|---|---|---|---|
| 3.1 | `.dtw-tip`: `globals.css:424,428,449,450` + `ai-leaderboard.tsx:133` + `dashboards-teaser.tsx:198` | **Phase 4** | Đổi nguyên tử cả 6 chỗ, nếu không tooltip hỏng **không có build error** |
| 3.5 | `globals.css:20` comment `/* DTW coral */` | **Phase 4** | Chỉ text comment; giá trị hex không đổi (D10) |
| 3.6 | `apps/web/src/payload/collections/Articles.ts:31` (mô tả collection editor nhìn thấy) + regenerate `payload-types.ts:318` | **Phase 4** | Regenerate bằng `pnpm --filter web payload generate:types`, **không sửa tay** |
| 3.6 | `apps/web/scripts/seed-payload.ts:224,233,267,455` + comment 64-65, 87 | **Phase 4** | **KHÔNG đổi `slug` dòng 219** — upsert chạy theo slug, đổi là tạo row published thứ hai |
| 3.4 | `demos/ai-leaderboard-demo.html:6,307,308,322,424,436,437` + `demos/ai-leaderboard-table-preview.html:543` | **Phase 4** | Bản copy thứ 4 của lockup + 2 storage key thứ 7/8 (`dtw-llmstats-key`, `dtw-theme`) |
| 3.4 | `.env.example:1,7,13,14` · `apps/web/.env.example:1,17` · `.gitignore:33` comment | **Phase 2** | Text placeholder, sửa lúc đang mở file |
| 3.2/3.4 | `.env.example:52` và `apps/web/.env.example:51` (`RESEND_FROM_DOMAIN`) | **Phase 6** | Template file — sửa **cùng commit** với lần flip env thật trên Vercel |
| 3.7 | `content-engine/admin/.env.example:23` (`DTW_INTAKE_URL`, đang là apex) + comment dòng 135-137 | **Phase 5** | Sửa template; **giá trị production** vẫn flip ở Phase 6 |
| 3.7 | `content-engine/admin/.../settings-card.tsx:51` (placeholder thứ hai) | **Phase 5** | Phase 5 trước đây chỉ nhận dòng 347 |
| 3.7 | `content-engine`: `deploy/DEPLOY.md`, `docs/CODEBASE.md`, `docs/HANDOVER.md`, `README.md`, `ContentEngine-Wire.md` | **Phase 5** | Runbook + 2 bản chép voiceSpec ngoài 2 file đã nhận |
| 3.7 | `content-engine/scripts/_diag-dtw-{dow,drop,history}.ts` | **Phase 5** | File tự khai "TEMP … Xoá sau" — **xoá cả ba**, bỏ ~60 hit, chi phí bằng 0 |
| 3.7 | `content-engine/scripts/social-manual-post.ts` (chuỗi hiển thị) + JSDoc header của `src/editorial/prompts/*.prompt.ts` | **Phase 5** | LOW; không chạy lúc generate, chỉ là chữ |
| 3.7 | `content-engine/process/context/{all-context,infra/all-infra,uxui/all-uxui,database/all-database,tests/all-tests}.md` (đặc biệt `infra:118` ghi intake URL là apex) | **Phase 5** | File agent của repo đó đọc **trước khi** sửa — cũ = rebrand bị revert |
| 3.6 | Central tenant row: `name`, `logo`, `brandColor`, `brand.*`, `seo.*`, `contact.*Email`, `socials[]` | **Phase 6** | Phase 6 plan từng thu hẹp còn `domain`+`frontendUrl` và tự đánh dấu là khoảng trống — nay khôi phục đúng phạm vi umbrella |
| 3.6 | Audit nội dung Central: `menus_items_locales`, `wire_drops_locales`, `corrections_locales`, `sponsor_slots(_locales)` + `ctaUrl`, `media_locales.alt/caption` | **Phase 6** | Chạy các câu SQL §3.6 **thật**, sửa qua `/admin` |
| 3.6 | `apcg-cms/scripts/seed.ts:208,267,277,281,447-448,462,481` (chỉ `name`/chuỗi hiển thị — **KHÔNG** `slug` dòng 207) | **Phase 6** | Ngăn một lần re-seed đưa brand cũ quay lại |
| 3.6 | Audit `dtw_auth.auth_users` — tài khoản staff còn dùng `@dailytechwire.com` | **Phase 6** | Email là login identity của Better-Auth, nằm trên unique index → cần giai đoạn alias, đừng cắt phát một |
| 3.6 | `apcg-cms/src/collections/Subscribers.ts` — **nghĩa vụ thông báo người đăng ký trước khi đổi From-name** | **Phase 6, TRƯỚC Bước 3** | Đây là bước additive bắt buộc đi **trước** lần flip `RESEND_FROM_DOMAIN`/`email.ts:13` |
| 3.9 | `process/context/auth/all-auth.md:52` (**high** — subject email reader nhìn thấy), `:1`, `:67` | **Phase 0** | |
| 3.9 | `process/context/uxui/all-uxui.md:1,18,74,144,264` | **Phase 0** | Phase 0 cũ chỉ nhận 152-154 và đẩy phần còn lại sang Phase 4/6, nhưng cả hai phase đó đều không nhận |
| 3.9 | `process/context/infra/all-infra.md:1,255` · `integrations/all-integrations.md:1,76,136` · `database/all-database.md:1,17,32` · `tests/all-tests.md:1,35,88` · `planning/all-planning.md:3` | **Phase 0** | |
| 3.9 | Cả 9 file `process/features/*/_GUIDE.md` (đặc biệt `articles/_GUIDE.md:43,54` và `homepage/_GUIDE.md:14,24,26` — **high**) | **Phase 0** | |
| 3.9 | Banner SUPERSEDED/ghi chú brand cho: `account/active/reader-auth-account-simple_PLAN_03-07-26.md` (**high**), `about-trust/active/tip-line-removal-newsroom-route_PLAN_16-07-26.md`, `dashboards/active/{ai-leaderboard-llmstats,dashboards-automation}_PLAN_*.md`, `general-plans/active/brief-display_PLAN_20-08-26.md` (**high**), `general-plans/active/human-ops-launch_PLAN_30-05-26.md`, `account/backlog/phase-{01,05}-*_PLAN_03-07-26.md`, `account/references/brief-asia-port-map_REFERENCE_03-07-26.md` | **Phase 0** | Cùng lý do với banner trên `per-page-seo-metadata_PLAN` — plan cũ mang brand/domain chết là mìn hẹn giờ cho agent sau |
| 3.5 | `design/README.md:9,11,23,24,25` (đường dẫn `dtw/…` đang hỏng) + banner "pre-rebrand" có ghi ngày | **Phase 0** | Ngăn agent sau đọc `design/chats/` rồi dựng lại mark cũ |

### 6b.2 Khoảng trống được đóng bằng "đóng băng có ghi chú" (không có bước thực thi)

Các mục sau **cố tình không được gán phase nào**; ghi ở đây để không ai coi là bỏ sót:

- `apps/web/scripts/export-for-central.ts:2,4,7,8,37,42` — `EXPORT_DIR='…/central-cms/migration-data/dtw'` là **hợp đồng thư mục xuyên repo** với `central-cms`; đổi cần owner của repo đó. Đóng băng (cùng nhóm D11).
- `packages/db/src/client.ts:30,34,43` — global HMR `__dtwPgClient`, chỉ dùng ở dev, không ai thấy. Đóng băng; nếu D6 được kích hoạt ở Phase 7 thì gộp vào commit đó.
- `.env.example:69-76` + `apps/web/src/app/api/dashboards/refresh/[source]/route.ts:50,52` — `DTW_DASHBOARD_REFRESH_TOKEN`: **giữ nguyên tên biến** (mặc định chương trình). Đổi tên chỉ hợp lệ nếu giá trị tồn tại dưới tên mới trên Vercel **trước** deploy, nếu không cron 03:00 thứ Hai fail closed.
- `design/project/uploads/pasted-1779960345031-0.png` (raster tagline), `design/project/index.html:6,21`, `design/project/src/*.jsx`, `DTW-Brand-Guideline-v1.0.pdf`, `DTW_WEBSITE_REQUEST.xlsx` — bundle `design/` và spec sheet đóng băng làm tài liệu lịch sử; chỉ `design/README.md` được gắn banner (xem 6b.1).
- `apps/web/src/components/cover-art.tsx` (~46 hex, gồm `#E04E1F` cũ) — D10 giữ nguyên màu, **không** đụng file này trong toàn chương trình.
- `data-exports/README.md:4,26,39,41,48,82` — bộ vocabulary `site` là bằng chứng để freeze slug `dtw`; giữ nguyên.

### 6b.3 Chồng lấn giữa hai phase — phân giải dứt điểm

Mỗi dòng dưới đây trước 09-09-26 bị **hai** phase cùng nhận. Chủ sở hữu sau khi phân giải là **duy nhất**:

| File / dòng | Từng bị nhận bởi | Chủ sở hữu DUY NHẤT | Lý do |
|---|---|---|---|
| `apps/web/src/app/manifest.ts:13,14,15` | Phase 3 (Nhóm H) **và** Phase 4 (Bước 8) — còn **mâu thuẫn giá trị**: P3 đặt `short_name: "Opentechwire"`, P4 đặt `"OTW"` | **Phase 3** | Manifest là một phần của "cái mark" (danh tính PWA đi cùng bộ icon), phải ship trong commit atomic của Phase 3. **Giá trị chốt: `name: "Opentechwire"`, `short_name: "OTW"`** (theo §5.1.1 — `short_name` là nhãn ngắn), `description: "Tech Intelligence, Openly Wired."` |
| `apps/web/src/lib/email.ts:13` (`FROM` display name) | Phase 4 (Bước 6) **và** Phase 6 (Bước 3) | **Phase 6** | Tài liệu tham chiếu §5 yêu cầu display name và 4 chuỗi subject/body đi **cùng một deploy** với `RESEND_FROM_DOMAIN` — tách ra là tạo đúng chữ ký phishing mà §5 cảnh báo |
| `apps/web/src/lib/auth.ts:78,84,97,103` | Phase 4 (Bước 6) **và** Phase 6 (Bước 3) | **Phase 6** | Như trên |
| `apps/web/src/components/footer.tsx:234` | Phase 0 (bước 19, xoá `· Member, Trust Project`) **và** Phase 4 (Nhóm A, đổi brand + xoá cùng mệnh đề) | **Cả hai, tuần tự có chủ đích** | Phase 0 xoá credential bịa (độc lập rebrand, làm sớm); Phase 4 chỉ còn đổi `Dailytechwire` → `Opentechwire` trên chuỗi **đã rút gọn**. Phase 4 phải khớp theo nội dung, không theo chuỗi cũ |
| `content-engine/src/lib/publications/dtw/index.ts:182-185` (`logoAssetUrl`) | Phase 3 (Bước 33) **và** Phase 5 (D.13) | **Phase 3** | Phase 3 vừa upload key mới vừa trỏ giá trị vào — tách ra là để một cửa sổ có URL trỏ vào key chưa tồn tại. **Phase 5 D.13 hạ xuống thành bước XÁC MINH** |
| `apps/web/next.config.ts` host rule | Phase 2 (thêm rule mới cho domain mới) **và** Phase 6 (xử lý rule cũ) | **Cả hai, có chủ đích** | Xem §4 mục 2 đã làm rõ: P2 thêm apex→www cho domain mới (dormant), P6 xoá apex→www của domain cũ |
| `per-page-seo-metadata_PLAN_16-07-26.md` | Phase 0 (banner + Status) **và** Phase 2 (4 giá trị apex) | **Cả hai, có chủ đích** | Đã ghi rõ trong Phase 2 mục 6 |

---

## 7. Rủi ro toàn chương trình + 5 kiểu hỏng âm thầm

Đây là rủi ro ở tầng chương trình — mỗi phase plan riêng phải bổ sung rủi ro cụ thể của phase đó khi được tạo.

**Năm mode hỏng có hậu quả nặng nhất, đều diễn ra âm thầm (không có log, không có build error):**

1. **Vercel cron trỏ vào route đã đổi tên.** `content-engine/admin/vercel.json` có `{"path": "/api/cron/publish-dtw", "schedule": "*/15 * * * *"}` — Vercel không báo lỗi khi cron trỏ vào path không tồn tại, nó chỉ ngừng chạy. Nếu path này bị đổi tên (không nằm trong scope D11 nhưng có thể bị đổi nhầm bởi một lượt sed quá tay), publish-dtw ngừng hoạt động trong im lặng.
2. **Repo variable của GitHub Actions fail closed.** `BRIEF_COMPOSE_PUBS`, `SOCIAL_PRODUCE_PUBS` thiếu hoặc sai giá trị → 0 publication được compose, nhưng workflow run vẫn **báo xanh**.
3. **Allowlist CORS làm trống rỗng cả site.** `PUBLIC_API_ALLOWED_ORIGINS` bên Central: `central-api.ts` biến lỗi thành **kết quả rỗng** thay vì throw — nếu domain mới chưa được thêm vào allowlist trước khi Central bắt đầu phục vụ nó, site render ra rỗng mà không có bất kỳ log lỗi nào (tiền lệ đã từng xảy ra với WTB).
4. **OAuth redirect URI chỉ hỏng ở lần dùng thật đầu tiên.** Deploy xanh, không ai phát hiện gì cho tới khi một reader thật bấm "Sign in with Google" và gặp lỗi redirect_uri_mismatch hoặc cảnh báo app chưa xác minh.
5. **Chỉnh sửa snapshot `drizzle-kit` phát ra `DROP SCHEMA` lên DB dùng chung.** Nếu bất kỳ agent nào (kể cả vô ý) sửa `packages/db/src/schema/auth.ts:24` cùng với các file snapshot trong `packages/db/migrations/meta/`, `drizzle-kit` có thể sinh ra một migration mới drop rồi tạo lại schema `dtw_auth` — xoá sạch mọi user, session, bookmark, reading-queue, follow, newsletter subscription, article view của DTW **lẫn các property APCG anh em** dùng chung Neon DB.

**Rủi ro chương trình khác cần theo dõi xuyên phase:**
- Bẫy casing hỗn hợp trong cùng file (Phase 4) khiến lệnh replace phân biệt hoa-thường bỏ sót khoảng một phần ba số trang editorial.
- Token đã URL-encode (`%20DTW%20`) và template có interpolation (`` `DailyTechWire — ${heading}` ``) không bị grep chuỗi trong ngoặc kép bắt được.
- Turbo cache hit phát lại bản build có origin cũ inline vào canonical/OG URL — HTML trông đúng nhưng canonical sai (Phase 2 giảm thiểu bằng cách verify `turbo build --dry=json`, nhưng chưa kiểm chứng thực nghiệm — xem ẩn số #15 bên dưới).
- Locale drift có sẵn từ trước (số token khác nhau theo locale, có câu chỉ xuất hiện ở bản tiếng Việt) khiến một audit chỉ đọc bản tiếng Anh bỏ sót nội dung cần sửa ở Phase 4.
- `data-exports/` chưa nằm trong `.gitignore` — 4.9MB dek bài viết đang live + 1,063 URL Supabase Storage chỉ cách history đúng một lệnh `git add .` (Phase 0 phải sửa trước khi bất kỳ ai chạy add rộng).

---

## 8. Ẩn số còn lại (chưa kiểm chứng) và phase nào bị chặn

Từ tài liệu tham chiếu §8 — **không mục nào dưới đây được kiểm chứng**, đừng coi là sự thật khi viết phase plan. Cột cuối ghi phase nào cần xử lý/né tránh ẩn số đó.

| # | Ẩn số | Chặn phase nào |
|---|---|---|
| 1 | Số lượng thật các bài đã publish chứa `"At DailyTechWire, we've tracked…"` — mới xác nhận 5 dòng trong một export chỉ trải 2026-06-05→2026-08-03, trên tổng 1,063 dòng DTW. Câu SQL audit đã viết nhưng **chưa chạy**. | Phase 5 (D13) — phải chạy audit thật trước khi coi việc dọn brief đã publish là xong. |
| 2 | Google manual action trên `dailytechwire.com` còn sống hay đã được gỡ — bằng chứng duy nhất là 1 comment code + 1 dòng plan cũ. | Phase 1 — không còn **chặn cứng** việc chuyển domain (theo D4), nhưng vẫn nên biết để quyết định có đáng nộp reconsideration riêng cho domain cũ (độc lập với rebrand) hay không. |
| 3 | Nguyên nhân cú sụt deindex 2026-07-11 — chỉ có tương quan, chưa xác nhận bằng GSC Manual Actions panel. | Phase 1, cùng ẩn số #2 — thông tin, không chặn kỹ thuật. |
| 4 | Trademark clearance cho "Opentechwire"/"OTW" chưa kiểm chứng — "Opentech" là nhãn hiệu còn hiệu lực ở USPTO (98228544, class 009); namespace `*techwire` khá đông (`techwireasia.com`, `techwire.net`, `techwire.in`). | Phase 1 (bước trademark clearance) — **chặn** việc công bố tên mới ra công chúng rộng rãi (mạng xã hội, PR) nếu clearance không đạt; không chặn code. |
| 5 | Quyền sở hữu `opentechwire.com` là suy đoán từ nameserver + SOA serial, **chưa xác nhận** tài khoản registrar thật. | Phase 1 — chặn D3/mọi phase sau nếu domain hoá ra không thuộc sở hữu APCG. |
| 6 | Không truy cập được Vercel, Cloudflare, Resend, Google Cloud Console, GA4, GSC, LinkedIn, Meta Business Settings, giá trị GitHub Actions repo-variable thật — mọi mô tả ở §4.4 tài liệu tham chiếu suy ra từ config trong repo. | Phase 1 và Phase 6 — mọi bước "external" phải do user tự xác nhận qua dashboard thật, agent không verify được. |
| 7 | URL live thật của project Vercel `dtw-frontend` không rõ (`dtw-frontend.vercel.app` trả 200 nhưng phục vụ app MLB/ESPN không liên quan — hostname có thể thuộc tài khoản khác). | Phase 7 (D15) — phải xác nhận qua Vercel dashboard trước khi quyết định decommission. |
| 8 | `APCG-web` có còn là nguồn site corporate đang chạy hay không — `<title>` local khác production, `/assets/app.js` 404 trên live. | Phase 7 — xác nhận tình trạng deploy thật trước khi sửa bất kỳ file nào trong `APCG-web`. |
| 9 | Giá trị tenant slug bên Central suy ra từ seed script, chưa đọc từ bảng `tenants` thật (`dtw-web` không gửi slug đi). | Phase 5/6 — chạy audit SQL thật thay vì tin seed script. |
| 10 | Số dòng đang `status='queued'` trong `social_posts` chưa rõ — ảnh hưởng quyết định có re-render card cũ hay để chạy hết. | Phase 5 — cần đếm trước khi quyết định. |
| 11 | Chưa xác nhận `CENTRAL_SIGNING_SECRET` từng lộ trong `.env.example` đã commit (tới `947971d`) có thực sự được rotate hay chưa. | Không chặn phase nào của rebrand trực tiếp, nhưng nên xác nhận độc lập trước Phase 6 nếu quyền sở hữu repo thay đổi trong quá trình rebrand. |
| 12 | `dailytechwire.asia` và `dtw.news` (chỉ thấy trong `/home/hieunc/Code/DTW`) — domain đăng ký thật hay bịa từ prototype. | Phase 7 (D15) — nếu có domain nào trong số này thật sự nhận mail, cần quyết định forwarding trước khi decommission. |
| 13 | 10 mailbox `@dailytechwire.com` liệt kê trong code — chưa đối chiếu cái nào thực sự đang nhận mail hôm nay. | Phase 1 (provisioning mailbox mới) và Phase 4 (literal trong copy) — cần biết mailbox nào còn "sống" trước khi quyết định thứ tự chuyển. |
| 14 | Con số "~95 mục high-risk" là ước lượng đã dedup thủ công, không phải phép đếm tự động. | Không chặn phase nào — chỉ là lưu ý về độ chính xác của con số khi báo cáo tiến độ. |
| 15 | Hành vi cache của `turbo` với `NEXT_PUBLIC_*` — kỳ vọng framework inference sẽ bao luôn nó, nhưng `turbo build --dry=json` **chưa chạy thực nghiệm**. | Phase 2 — phải verify bằng lệnh thật trước khi coi biện pháp giảm thiểu là đủ. |

---

## Touchpoints (tổng hợp toàn chương trình)

Danh sách đầy đủ nằm ở tài liệu tham chiếu §3 (theo surface) — umbrella này chỉ liệt kê nhóm surface và số lượng ước tính tại thời điểm nghiên cứu (08-09-26), để mỗi phase tự re-scan tại thời điểm execute:

- `dtw-web`: 168 file tracked, 989 dòng khớp (không tính `data-exports/`).
- `content-engine`: ~228 file, 4 nhóm đáng quan tâm (voiceSpec generate-time, cron/env suy-theo-slug, GH Actions variables, test fixture hardcode domain).
- `apcg-cms` (Central): ~28 file + dòng tenant đang chạy live + nhiều collection content (articles/authors/media/menus/wire-drops/corrections/sponsor-slots).
- `media-engine`: ~45 hit, sở hữu union `SiteCode` (không thuộc D11/D12, có thể xử lý độc lập ở Phase 7).
- `brief-asia-web`, `wad-web`: comment/label network duy trì tay + 1 anti-pattern guard màu (không đổi vì D10 giữ nguyên).
- `APCG-web`: 1 label network, tình trạng deploy thật chưa rõ (ẩn số #8).
- `/home/hieunc/Code/DTW`: project Vercel mồ côi, không version-control, đánh dấu decommission theo D15.

## Public Contracts

- **Intake API Engine → Payload** (`DTW_INTAKE_URL`/`DTW_INTAKE_TOKEN`): tên biến giữ nguyên (không nằm trong D1-D15), chỉ **giá trị** URL flip ở Phase 6, theo đúng thứ tự dtw-web serve trước → engine flip sau.
- **`PUBLIC_API_ALLOWED_ORIGINS`** (Central): hợp đồng CORS/origin-allowlist — Phase 6 phải **thêm** domain mới trước khi dtw-web bắt đầu gọi Central từ domain đó.
- **OAuth redirect_uri** (Google + GitHub): hợp đồng bên thứ ba — Phase 1 thêm redirect URI mới song song, Phase 6 mới thực sự dùng nó.
- **Atom/RSS feed identity** (`<id>`, `tag:` URI): theo D4, contract này **không được giữ ổn định xuyên domain-move** bằng cách pin — hệ quả chấp nhận được là subscriber cũ trỏ vào domain cũ sẽ nhận 404 (không có redirect) thay vì một luồng liên tục; subscriber mới trên domain mới bắt đầu một feed-identity hoàn toàn mới. Đây là hệ quả trực tiếp, tường minh của D4, không phải một lỗi bỏ sót.
- **`publicationId`/slug `dtw`** (Central Tenants ↔ content-engine registry): hợp đồng join-key liên repo, đóng băng vĩnh viễn theo D11 — không phase nào trong 8 phase được thay đổi giá trị này.
- **Central `Media.prefix` hook**: hợp đồng ghi-một-lần, không rewrite — không phase nào được đụng vào cơ chế này dù có đổi brand.

## Blast Radius

Xem tài liệu tham chiếu §3 cho bảng đầy đủ theo file/dòng/rủi ro (bảng này KHÔNG được chép lại nguyên văn ở đây để tránh hai bản có thể trôi khỏi nhau — mọi phase plan phải trỏ về tài liệu tham chiếu hoặc tự re-scan). Tóm tắt theo cấp độ rủi ro tại thời điểm nghiên cứu:

| Mức rủi ro | Số dòng finding (ước tính, chưa dedup hoàn toàn) |
|---|---|
| High | ~196 |
| Medium | ~229 |
| Low | ~204 |
| **Tổng** | **~630 dòng, ~400 touchpoint riêng biệt sau dedup, ~95 high-risk riêng biệt** |

## Acceptance Criteria

Tiêu chí xác minh được cho toàn chương trình (mỗi phase plan sẽ có bộ tiêu chí chi tiết hơn cho riêng phase đó, không được nới lỏng các mục dưới đây):

1. `command grep -rniE 'dailytechwire|daily ?tech ?wire|\bdtw\b|@dtw/|Tech Intelligence, Wired Daily' .` (với đầy đủ `--exclude` ở §6) trả về **0 hit** trên `dtw-web` VÀ `content-engine`, **trừ** các identifier trong danh sách đóng băng ở §5.2 và các file cấm động ở §5.3 (những chỗ đó dự kiến vẫn còn `dtw`/`DTW` — đó là đúng theo thiết kế, không phải sót).
2. 6 asset nhị phân ở §6 đã được mở bằng mắt và xác nhận hiển thị `OTW`/`opentechwire`, không còn `DTW`/`dailytechwire`.
3. `tsc --noEmit` (qua `turbo run typecheck`) sạch trên `dtw-web`; test suite của `content-engine` (`npm test`) xanh, bao gồm 5 fixture hardcode domain.
4. Các câu SQL audit ở tài liệu tham chiếu §3.6 đã chạy thật với kết quả được dán vào report tương ứng — không còn câu nào ở trạng thái "đã viết nhưng chưa chạy".
5. `https://www.opentechwire.com` phục vụ production; `dig`/truy cập `https://dailytechwire.com` xác nhận **không có A record**, không có redirect response.
6. Một lượt đăng nhập thật (magic-link **và** ít nhất một OAuth provider) trên domain mới thành công sau Phase 6.
7. `apps/web/src/lib/feed.ts` sinh `tag:` URI theo host mới — xác minh bằng `curl https://www.opentechwire.com/rss.xml` thật, **không sửa code** (xem "Định nghĩa xong" mục 4).
8. Không có commit nào trong toàn chương trình chạm vào các file ở danh sách cấm động (§5.3) — kiểm bằng `git log --oneline -- <path>` cho từng file sau khi chương trình đóng.
9. Repo GitHub đã đổi tên thành `otw-web` (kiểm bằng `gh repo view hieuhn09/otw-web`); thư mục local `/home/hieunc/Code/dtw-web` không đổi tên (kiểm bằng `pwd`/đường dẫn không đổi).
10. `/home/hieunc/Code/DTW` có trạng thái rõ ràng: hoặc đã xoá (có xác nhận user bằng văn bản trong report Phase 7), hoặc còn tồn tại kèm ghi chú lý do giữ lại.

## Verification Evidence

Chương trình này **chưa có bằng chứng thực thi nào** — đây là umbrella plan, `Status: ⏳ PLANNED`. Bằng chứng sẽ được tích luỹ theo từng phase tại `process/features/rebrand/reports/phase-N-<slug>_REPORT_<dd-mm-yy>.md`, và phải bao gồm tối thiểu, theo đúng gate ở §6 và tiêu chí ở "Acceptance Criteria":

- Output của lệnh grep chuẩn (với đầy đủ `--exclude`), trước và sau phase.
- Xác nhận bằng mắt cho 6 asset nhị phân liên quan tới phase đó (nếu có).
- Output `tsc --noEmit` khi phase chạm code TypeScript.
- Output `npm test` của `content-engine` sau Phase 5.
- Kết quả thật của các câu SQL audit khi phase chạm dữ liệu CMS/DB (không chỉ dán câu SQL, phải dán kết quả).
- Với Phase 6: xác nhận thủ công qua dashboard thật (Vercel/Cloudflare/Resend/GA4/GSC/LinkedIn/Meta) cho từng mục external — agent không tự verify được các mục này.
- Nếu một phase sau này thêm test tự động cho `dtw-web`, ghi rõ trong report runner nào được dùng và tham chiếu `process/context/tests/all-tests.md` để giữ nhất quán với quy ước test chung của repo (repo hiện gần như chưa có test tự động — đây không phải giả định có sẵn).

## Resume and Execution Handoff

**Trạng thái hiện tại (09-09-26)**: umbrella plan **và cả 8 phase plan đã ghi xong**, đã qua vòng soát nhất quán chéo (khoảng trống, chồng lấn, vi phạm ledger, thứ tự dependency, xác minh giả, bịa đặt, nhất quán ngôn ngữ) và cả 9 file đều pass `validate-plan-artifact.mjs --strict`. Umbrella plan vẫn **không** phải một execution unit và không nhận `ENTER EXECUTE MODE` trực tiếp — lệnh đó chỉ dành cho một phase plan cụ thể.

**Hành động tiếp theo đúng đắn theo RIPER-5**: user duyệt rồi ra lệnh EXECUTE cho **Phase 0** (`process/features/rebrand/active/phase-0-lock-decisions_PLAN_09-09-26.md`) — Phase 0 không có dependency và mở khoá mọi phase khác về mặt quy trình (context phải phản ánh D1-D15 trước khi bất kỳ phase code nào bắt đầu). Lưu ý Phase 0 đã phình từ SMALL lên MEDIUM (~25 file) sau vòng soát, vì nó nhận toàn bộ §3.9 process-docs.

**Song song có thể bắt đầu ngay**: Phase 1 (việc ngoài repo, do user tự thực hiện) — không phụ thuộc Phase 0 hoàn thành, và có wall-clock dài nhất trong toàn chương trình nên càng để muộn càng kéo dài toàn bộ timeline.

**Quy tắc cho agent nào nhận việc tiếp theo**:
1. Đọc plan này để lấy ledger D1-D15 — **không tự đi tìm lại** hoặc bàn lại chúng.
2. Với phase được giao, **nghiên cứu lại** (re-research) danh sách file/dòng cụ thể — số dòng trong tài liệu tham chiếu (08-09-26) có thể đã trôi.
3. Tạo phase plan file riêng theo naming convention ở §3, trong `process/features/rebrand/active/`.
4. Sau khi phase plan có, chạy `node .claude/skills/vc-generate-plan/scripts/validate-plan-artifact.mjs <đường-dẫn-phase-plan>` trước khi trình user duyệt.
5. Không bao giờ execute quá một phase trong một lượt — theo đúng "the required 10-step loop" ở `process/development-protocols/phase-programs.md`.
6. Sau mỗi phase, cập nhật report + (nếu cần) cập nhật lại chính umbrella plan này nếu có phát hiện làm thay đổi phase sau (ví dụ: một ẩn số ở §8 được giải, hoặc một dependency mới lộ ra).

**Validator cho chính umbrella plan này**:
```
node .claude/skills/vc-generate-plan/scripts/validate-plan-artifact.mjs process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md
```

---

## Bảng dependency giữa các phase (tổng hợp lại cho dễ nhìn)

| Phase | Chặn bởi | Chạy song song được với | Chặn phase nào | One-way door? |
|---|---|---|---|---|
| 0 — Lock decisions | — | 1 | 2, 3, 4 (về mặt quy trình — context phải đúng trước khi code) | Không |
| 1 — External clock | — | 0, 2, 3, 4, 5 | 6 | Bán-one-way (đổi tên app OAuth) |
| 2 — Canonical host | 0 | 1, 3, 4 | 6 (canonical phải đúng trước cutover) | Không |
| 3 — Brand mark | 0 | 1, 2, 4 | 5 (logoAssetUrl), 6 | Không (nhưng ship atomic) |
| 4 — Display copy | 0 (khuyến nghị sau 3) | 1, 2, 5 | 6 (UI phải sạch trước cutover) | Không |
| 5 — content-engine | 3 | 1, 2, 4 | 6 (engine phải trỏ domain mới, author đã rename) | Bán-one-way (DB UPDATE) |
| 6 — CUTOVER | 1, 2, 3, 4, 5 | — | 7 | **CÓ — one-way door thật sự** |
| 7 — Estate cleanup | 6 (phần lớn) | — | — | D15 (xoá thư mục) là one-way riêng lẻ |

---

## Next Step

Đây là output của **PLAN mode** trong RIPER-5. Umbrella plan này **không** nên trực tiếp nhận lệnh `ENTER EXECUTE MODE` — nó không phải một execution unit.

Next Step đúng: user review ledger D1-D15 ở §2, bản đồ 8 phase ở §3, và plan của phase muốn chạy trước (khuyến nghị **Phase 0**, vì không có dependency và mở khoá các phase khác). Sau đó ra lệnh `ENTER EXECUTE MODE` **cho đúng một phase plan**, ví dụ `process/features/rebrand/active/phase-0-lock-decisions_PLAN_09-09-26.md`. Phase 1 (việc ngoài repo, user tự làm) chạy song song được ngay, không cần chờ Phase 0.

*Umbrella plan hoàn thành 08-09-26; 8 phase plan hoàn thành và soát chéo 09-09-26. Không có dòng code nào bị sửa. Trạng thái: PLANNED.*
