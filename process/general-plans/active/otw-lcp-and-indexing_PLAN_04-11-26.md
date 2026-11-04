# Opentechwire: LCP trang chủ kém và tỷ lệ index thấp (PLAN 04-11-26)

**Date**: 04-11-26
**Complexity**: COMPLEX (2 vấn đề độc lập, 6 pha, một phần việc thuộc owner và một phần thuộc repo khác)
**Status**: A1 + A1.6 🔨 CODE DONE, A-V trên Preview ĐẠT (04-11-26); chưa ✅ VERIFIED: chờ merge, PSI production 2 lượt thứ Hai liên tiếp (A1.8) và xác nhận user. A2, A3, B*, C chưa làm. Chi tiết: mục 'Ghi chú tiến độ A1' và 'Ghi chú A-V trên Preview' cuối Verification Evidence.
**Feature**: general (xuyên suốt, không thuộc feature folder nào; `rebrand/` chỉ là ràng buộc D4)
**Primary execute anchor**: chính file này. Không có file phase phụ.
**Context đã đọc**: `process/context/all-context.md` (invariant #8, #11, #15), `uxui/all-uxui.md`, `infra/all-infra.md`, `tests/all-tests.md`; umbrella `process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md` (D3, D4, D5, D11).

---

## Overview

### 1.1 Câu hỏi của user
"Vì sao LCP của Opentechwire kém và vì sao tỷ lệ index thấp?"

### 1.2 Kết luận ngắn: hai nguyên nhân ĐỘC LẬP
- **LCP KHÔNG phải là nguyên nhân của tỷ lệ index thấp.** Không có dữ liệu field (CrUX) cho `www.opentechwire.com` vì lưu lượng quá thấp; Core Web Vitals chỉ là tín hiệu xếp hạng phụ (tiebreaker), không phải cổng index. Sửa LCP sẽ không làm tăng số URL được index, và ngược lại.
- **Nguyên nhân LCP (code, tin cậy cao):** `CoverArt` ở nhánh `<img>` thường không lazy và không `decoding="async"`, làm trang chủ kéo ~35 ảnh JPEG (~1,5 MB) cạnh tranh băng thông với ảnh hero.
- **Nguyên nhân index (không phải lỗi kỹ thuật của URL, tin cậy trung bình):** ~76% sitemap là kho bài trước rebrand (Jul-Aug 2026) trên một host mới (`www.opentechwire.com`, tách đứt khỏi `dailytechwire.com` theo D4). Google xem đó là nội dung mới của một domain non trẻ và khám phá/crawl chậm. Mẫu 25 URL của hub rải đều theo `lastmod` nên ~19/25 là kho cũ; vì vậy "tỷ lệ index" của hub bị kho cũ chi phối, còn bài mới (Sept+) gần như đều đã index.

### 1.3 Dữ liệu đo (orchestrator, 03/04-11-26; code đã đối chiếu lại bởi plan này)

**LCP (lab, PSI mobile, bảng `site_vitals` của content-engine, trung vị 3 lượt):**

| Trang | 28-10 | 02-11 | Ghi chú |
|---|---|---|---|
| Trang chủ `/` | 3.976 ms | 3.676 ms | POOR (> 2,5 s) |
| Trang bài | 3.546 ms | 942 ms | Nhiều khả năng đã sửa bởi dtw-web#62 (hero hẹp) |

CLS ≈ 0, TBT nhỏ. Dao động lab (`lcp_spread`) tới 750 ms nên một lượt đo đơn lẻ không đủ kết luận.

**Index (URL Inspection, bảng `site_index_status`, mẫu 25 URL/tuần):** dtw 02-11 = 6 PASS, 18 "URL is unknown to Google", 1 "Crawled - currently not indexed" (28-10: 5 PASS, 20 unknown). So sánh: wtb 25/25, briefasia 25/25, wad 24/25, gcv 13/25. 18 URL unknown đều trả 200, nằm trong `/sitemap.xml`, canonical tự trỏ đúng, không noindex.

**Sitemap hiện tại:** 2.799 `<loc>`, trong đó 2.570 URL bài; một file ~577 KB; `lastmod` = `article.updatedAt`: 1.946 URL tháng 08, 295 tháng 09, 293 tháng 10, 36 tháng 11.

### 1.4 Đối chiếu code (line number đã kiểm lại 04-11-26)
- `apps/web/src/components/cover-art.tsx:92-113`: nhánh tối ưu (`sizes` + `canOptimizeImage`) dùng `next/image` `fill` (mặc định lazy). `cover-art.tsx:114-124`: nhánh còn lại là `<img>` trần chỉ có `src`, `alt`, `fetchPriority`, `style`: không `loading`, không `decoding`. Comment `cover-art.tsx:87-91` cấm đổi mặc định opt-in theo `sizes` ("Do not helpfully flip this default"): **kế hoạch này tôn trọng điều đó** và không đụng nhánh `next/image`.
- Chỉ 2 chỗ truyền `sizes`: `home-hero.tsx:50` (hero, có `priority`) và hero của `article-content.tsx:257` (dùng `next/image` trực tiếp, không qua CoverArt). Mọi thẻ khác đều rơi vào nhánh `<img>` trần.
- 16 call site `<CoverArt` (không tính định nghĩa): `search/page.tsx:240`, `account-tabs.tsx:268`, `pillar-content.tsx:194,245`, `exclusive-content.tsx:128`, `exclusive-band.tsx:52`, `pillar-showcase.tsx:95,136`, `article-content.tsx:279` (nhánh SVG không có `src`), `related-row.tsx:52`, `best-of-reviews.tsx:112`, `sponsored-strip.tsx:83`, `deep-dive.tsx:38`, `home-hero.tsx:42,140`, `most-read.tsx:105`.
- `apps/web/src/app/sitemap.ts`: một file duy nhất, `revalidate = 900`, `lastModified: article.updatedAt` (dòng 104-109), nguồn bài là `getSitemapArticles` (`cms-client.central.ts:516-531`, quét tối đa 200 trang x 50). `robots.ts:25` trỏ `sitemap.xml`. `changeFrequency`/`priority` Google bỏ qua.
- Phân trang pillar `ARTICLES_PAGE_SIZE = 25` (`lib/data.ts:23`): kho ~2.570 bài tương đương hàng trăm trang phân trang theo chuỗi; trang cũ nằm sâu 50-100 click từ trang chủ.

---

## 2. Goals và Non-goals

### Goals
1. Trang chủ mobile lab LCP < 2,5 s ở các lượt PSI hằng tuần kế tiếp (mục tiêu mềm, xem mục 10), không làm xấu LCP/CLS các trang pillar, bài, exclusive.
2. Xác định bằng bằng chứng (GSC) vì sao ~1.950 URL kho cũ chưa được Google biết, rồi áp đòn bẩy chi phí thấp, tin cậy cao trước.
3. Đo "tỷ lệ index" theo cách không bị kho cũ làm nhiễu (việc thuộc content-engine, chỉ lập hồ sơ).

### Non-goals (cố ý KHÔNG làm)
- Không 301, không Change of Address, không gắn lại `dailytechwire.com` (D4, invariant #15). Xem mục 8.
- Không đụng GCV (`gcv-web`, repo khác; home LCP 5,8 s, 8 URL "Discovered - not indexed"): ghi nhận làm follow-up ở mục 12.
- Không dùng Google Indexing API.
- Không đổi nội dung bài đã đăng (D13), không đổi slug `dtw` (D11).
- Không đổi màu/token (D10), không đổi mặc định opt-in `sizes` của CoverArt.
- Không tối ưu GA (đã defer ở #59).

---

## 3. Toàn cảnh (đòn bẩy, tác động, tin cậy, thứ tự)

| Mã | Đòn bẩy | Vấn đề | Tác động kỳ vọng | Tin cậy | Chi phí | Cần ai |
|---|---|---|---|---|---|---|
| A1 | `loading="lazy"` + `decoding="async"` cho `<img>` trần không phải priority | LCP | Lab LCP home ~1,6-2,9 s xuống ~1,0 s trong A/B chặn ảnh thẻ; load event ~10 s xuống ~2,5 s | Cao (A/B local trực tiếp) | Thấp (1 file) | Code |
| A2 | `sizes` + `next/image` theo từng call site | LCP, bytes | Giảm thêm bytes (WebP/AVIF, đúng kích thước) | Trung bình | Trung bình + phí Vercel Image Optimization | Code + owner (chi phí) |
| A3 | Theo dõi PSI thứ Hai + điều tra TTFB/ISR STALE/HTML 150 KB | LCP | Chỉ chẩn đoán | Thấp-trung bình | Thấp | Code/ops |
| B0 | Kiểm tra GSC: sitemap đã nộp cho property `www`? số URL "Discovered"? báo cáo Pages | Index | Có thể là nguyên nhân gốc (URL "unknown" dù có trong sitemap gợi ý sitemap chưa được xử lý) | Cao về giá trị chẩn đoán | Rất thấp | **Owner** (chúng ta không có quyền GSC) |
| B1 | Tách sitemap (index + file "mới" + file theo tháng) | Index | Chủ yếu quan sát (độ phủ theo file trong GSC); ít khả năng làm Google crawl nhanh hơn | Trung bình-thấp về tốc độ index | Trung bình | Code + owner |
| B2 | Liên kết nội bộ tới kho (trang lưu trữ theo tháng) | Index | Cho Google đường crawl ngắn tới bài cũ | Trung bình | Trung bình-cao (route mới) | Code + owner |
| B3 | IndexNow | Index | Chỉ Bing/Yandex; Google không dùng | Thấp cho mục tiêu Google | Thấp | Code + owner |
| B4 | Quyết định chất lượng kho (giữ / noindex / dọn) | Index | Có thể quyết định chất lượng toàn site | Chưa biết | Rủi ro cao | **Owner** |
| C | Đo tách trước/sau rebrand ở content-engine | Đo lường | Số liệu đúng để ra quyết định | Cao | Thấp | Repo content-engine |

**Thứ tự đề xuất (rẻ + tin cậy cao trước):** B0 (song song, không cần code) -> A1 -> đo A (Pha A-V) -> quyết định B4/B1 dựa trên số liệu B0 -> B2/B3 chỉ khi còn cần -> A2 chỉ khi A1 chưa đủ -> C (repo khác, độc lập) -> A3 liên tục.

**Cần owner (không phải code):** quyền GSC (B0), chấp nhận chi phí optimizer (A2), quyết định chất lượng kho (B4), tách sitemap hay không (B1), IndexNow có/không (B3). Chi tiết ở mục 9.

---

## 4. Workstream A: LCP

### 4.1 Data flow (bao gồm cơ chế gây lỗi)
Trang chủ SSR -> RSC render ~35 `CoverArt` có `src` trên `img.apcgmedia.com` -> nhánh `<img>` trần (không `loading`) -> React 19 Fizz tự phát `<link rel="preload" as="image">` cho `<img>` eager (quan sát: 26 preload trong HTML thật) -> trình duyệt tải ~1,5 MB JPEG tranh băng thông/kết nối với ảnh hero (`home-hero.tsx`, đã đúng: `next/image`, `priority`, `fetchPriority="high"`, `sizes` đo thật, nguồn 800x534) -> LCP trễ do cạnh tranh băng thông, không phải do hero.

### 4.2 Pha A1: sửa tối thiểu, an toàn (CODE)

**Thay đổi:** chỉ trong `apps/web/src/components/cover-art.tsx`, nhánh `<img>` trần (dòng 114-124):
- Khi `priority` KHÔNG bật: thêm `loading="lazy"` và `decoding="async"`.
- Khi `priority` bật: giữ nguyên hành vi hiện tại (eager, `fetchPriority="high"`), cộng `decoding="async"` không áp dụng; không đổi.
- Thêm prop tùy chọn `eager?: boolean` (mặc định `false`) vào `CoverArtProps`: khi `true` và không `priority`, nhánh `<img>` KHÔNG đặt `loading="lazy"` và đặt `fetchPriority="low"` (ảnh above-the-fold nhưng không phải LCP: tải sớm nhưng không tranh ưu tiên với hero). Mặc định không call site nào dùng `eager` trong A1; xem quyết định D1 và bước kiểm A1.6.
- KHÔNG đổi nhánh `next/image`, KHÔNG đổi mặc định opt-in `sizes`, KHÔNG đổi nhánh SVG.

**Vì sao không "chỉ lazy hết" mà thêm `eager`:** ảnh thẻ trong viewport đầu có thể xuất hiện chậm hơn một chút khi lazy (Chrome dùng ngưỡng khoảng cách, nên ảnh gần viewport vẫn được tải sớm, nhưng không đảm bảo). `eager` là van thoát có kiểm soát, không bật mặc định.

**Dự đoán hành vi cần kiểm chứng (không giả định):** React 19 Fizz thường không phát preload cho `<img loading="lazy">`. Bước A1.4 xác minh bằng cách đếm `<link rel="preload" as="image">` trong HTML sau thay đổi (mục tiêu: chỉ còn hero, tối đa 1-3). Nếu preload vẫn phát cho ảnh lazy, A1 chưa đạt và phải ghi lại phát hiện trước khi chọn hướng khác (không tự thêm hack).

**Trade-off A1:**
- Được: giảm mạnh số byte cạnh tranh trong giai đoạn tải đầu, giảm số preload, load event sớm hơn nhiều; không đổi bytes mỗi ảnh nên không có rủi ro chất lượng ảnh; không tốn phí hạ tầng; rollback một dòng.
- Mất: ảnh thẻ dưới nếp gấp xuất hiện muộn hơn khi cuộn nhanh (placeholder là nền container có chiều cao cố định); với mạng chậm có thể thấy ô trống thoáng qua; `decoding="async"` có thể làm ảnh hiện không đồng bộ với text (không gây CLS vì container có `height` cố định).
- Chọn KHÔNG làm ở A1: không chuyển mọi thẻ sang `next/image` (xem A2: tốn chi phí và có rủi ro latency); không thêm `<link rel=preload>` thủ công; không dùng `content-visibility`.

**Bảng rủi ro A1:**

| Rủi ro | Xác suất | Tác động | Giảm thiểu |
|---|---|---|---|
| Ảnh thẻ above-the-fold hiện muộn trên desktop (`home-hero.tsx:140` rail, `pillar-content.tsx:194` featured 440px) | Trung bình | Thấp-trung bình (trải nghiệm, không phải LCP) | Quan sát bằng screenshot tại thời điểm LCP; dùng `eager` cho tối đa vài thẻ nếu cần (D1) |
| Một thẻ khác trở thành phần tử LCP trên trang pillar/exclusive (ảnh featured 440px là ứng viên LCP, giờ bị lazy) | Trung bình | Trung bình: LCP trang đó xấu đi | Kiểm riêng pillar/exclusive; ảnh featured/ứng viên LCP của trang đó phải `priority` hoặc `eager`. Đây là điều kiện chặn merge: không merge nếu LCP pillar xấu đi |
| CLS do ảnh lazy | Thấp | Trung bình | Mọi container đặt `height` cố định (đã kiểm ở CoverArt: `height` + `overflow:hidden`); riêng `height="auto"` + `aspectRatio` ở article hero vốn là nhánh SVG. Xác minh CLS = 0 trong đo local |
| Preload vẫn phát cho ảnh lazy (giả định sai) | Thấp-trung bình | Trung bình (A1 không đạt) | Bước A1.4 là cổng; nếu sai, dừng và quay lại PLAN |
| Hồi quy thị giác ở card ít dùng (account, search) | Thấp | Thấp | Lazy ở trang account/search là lợi, không phải hại; kiểm bằng probe mock Central |
| Đo A/B local không đại diện production (ảnh đo trên mock Central, nguồn ảnh thật qua mạng) | Trung bình | Trung bình | Dùng URL ảnh thật `img.apcgmedia.com` trong mock; bằng chứng cuối cùng là PSI production tuần kế (mục 10) |

**Blast radius A1:** mọi nơi dùng `CoverArt` có `src` mà không `sizes`: trang chủ (hero rail, pillar showcase, most-read, exclusive band, best-of-reviews, sponsored strip, deep-dive nếu bật), trang pillar (featured + lưới), `/exclusive`, related row ở bài, search, account tabs. Không ảnh hưởng nhánh `next/image`, hero bài, JSON-LD, sitemap, dữ liệu.

**Rollback A1:** revert commit (thay đổi nằm trong 1 file). Không có migration, không có thay đổi dữ liệu. Có hiệu lực ngay sau deploy Vercel, ISR trang chủ tự làm mới.

### 4.3 Pha A-V: xác minh A1 trước khi merge và sau khi triển khai (EVIDENCE)
Chạy cả trước (baseline `main`) và sau thay đổi, cùng cấu hình: Playwright, giả lập Moto G4, CPU 4x, ~1,6 Mbps, RTT 150 ms (đúng cấu hình đã dùng trong A/B của orchestrator), mock Central theo `tests/all-tests.md` "Runtime Probe Pattern" nhưng ảnh dùng URL thật `img.apcgmedia.com`.
- Trang đo: trang chủ, một trang pillar, một trang bài, `/exclusive`.
- Chỉ số: LCP (và phần tử LCP), CLS, load event, số byte ảnh, số `<link rel="preload" as="image">`, số request ảnh trước LCP; mỗi cấu hình >= 5 lượt, báo trung vị và khoảng dao động (không báo một lượt đơn).
- Cổng đạt: LCP home không xấu hơn baseline và trung vị mục tiêu <= ~1,5 s trong môi trường local; CLS giữ ~0; LCP pillar và `/exclusive` không xấu hơn baseline > 10%; số preload ảnh <= 3.

### 4.4 Pha A2 (TÙY CHỌN, có điều kiện): `sizes` + optimizer cho thẻ

**Điều kiện vào:** chỉ khi sau A1 (đã thấy PSI production >= 1 tuần) trang chủ vẫn > 2,5 s, hoặc Lighthouse còn báo "Properly size images / Serve images in next-gen formats" đáng kể, VÀ owner chấp nhận chi phí (D2).

**Hướng:** với từng call site đo chiều rộng hiển thị thật (như `home-hero.tsx:50`) rồi truyền `sizes` để vào nhánh `next/image` (WebP/AVIF, đúng kích thước). Làm theo lô nhỏ, bắt đầu từ thẻ lớn nhất (pillar showcase 120px-cao, most-read 150px, pillar lưới 210px), không làm đồng loạt.

**Phương án thay thế cần kiểm trước (cross-repo, chưa xác minh):** CMS có vẻ sinh biến thể (`-800x450`...) trên `img.apcgmedia.com`; nếu URL biến thể có thể suy ra ổn định thì dùng biến thể nhỏ thay vì optimizer, tránh phí Vercel. Cần xác nhận với `apcg-cms` trước khi thiết kế; không giả định.

**Trade-off A2:**
- Được: bytes ảnh giảm đáng kể (AVIF/WebP + đúng kích thước), cải thiện cả mạng yếu.
- Mất: phí/quota Vercel Image Optimization (số biến thể = ảnh x width x định dạng; kho ~2.570 bài nhưng chỉ ảnh được truy cập mới bị biến đổi), độ trễ lần đầu (cold transform) cho ảnh chưa cache có thể làm LCP trang pillar/bài mới xấu đi trước khi cache ấm; thêm bề mặt lỗi (400 nếu host không nằm trong `remotePatterns`, xem `image-hosts.ts`); phức tạp hơn khi cùng một CoverArt render ở nhiều kích thước.
- Chọn không làm mặc định: lật mặc định `sizes=100vw` làm thumbnail 110px tải ảnh lớn hơn hiện tại (comment cover-art.tsx); vì thế opt-in từng chỗ.

**Rủi ro A2:** chi phí Vercel vượt dự kiến (trung bình/trung bình; giảm thiểu: làm lô nhỏ, theo dõi usage trước và sau, đặt `images.minimumCacheTTL` hợp lý nếu cần); LCP thẻ cold-transform chậm (thấp/thấp-trung bình; giảm: chỉ áp cho thẻ không phải LCP, hoặc dùng biến thể CMS); lệch host client/server khiến cảnh báo hydration (đã mô tả ở `image-hosts.ts`, thấp). **Rollback A2:** xóa `sizes` ở call site tương ứng; trở về `<img>` (đã lazy từ A1).

### 4.5 Pha A3: theo dõi và điều tra thứ cấp (không có thay đổi hành vi)
- Mỗi thứ Hai theo dõi `site_vitals` (lượt PSI hằng tuần của hub) cho `/` và trang bài; ghi vào mục "Bằng chứng" của plan.
- Điều tra, chưa sửa: TTFB dao động 150-990 ms và header Vercel `STALE` trên trang chủ (ISR/`revalidate`, dữ liệu CMS chậm?); HTML ~150 KB (xem phần RSC payload và dữ liệu thừa); phông ~170 KB với 2 preload; script ~180 KB. Mỗi phát hiện mở plan con riêng nếu đáng làm; plan này không sửa.
- Lưu ý đo lường: lab dao động tới 750 ms; kết luận đạt/không đạt cần >= 2 lượt liên tiếp, không dựa một số. Vì không có CrUX, "tốt" chỉ nghĩa là lab tốt; tín hiệu field sẽ chỉ có khi lưu lượng đủ.

---

## 5. Workstream B: Index

### 5.1 Chẩn đoán đang có và giả thuyết (cần bằng chứng GSC)
- H1 (kiểm trước, rẻ nhất): sitemap `https://www.opentechwire.com/sitemap.xml` chưa được nộp hoặc chưa xử lý trong property đúng (URL "unknown to Google" dù nằm trong sitemap là dấu hiệu Google chưa đọc sitemap hoặc mới đọc một phần). Cũng kiểm hub gọi URL Inspection với đúng property (domain property hay URL-prefix `www`); các tựa khác 25/25 nên khả năng thấp, nhưng phải loại trừ.
- H2: cầu cung của Google: host mới, ít backlink, 1.946 URL "mới tinh" cùng lúc; Google phân bổ crawl chậm. Không có thao tác nào đảm bảo tốc độ.
- H3: chất lượng/độ trùng lặp của kho (bài AI-assisted mỏng): thường hiện dưới dạng "Crawled - currently not indexed" (hiện mới 1/25) hoặc "Discovered - currently not indexed". Hiện chưa có bằng chứng; B0 sẽ cho biết tỷ lệ các trạng thái trong báo cáo Pages.
- Đã loại trừ: canonical, noindex, lỗi 4xx/5xx, sitemap thiếu URL, redirect (kiểm trực tiếp trên 18 URL).

### 5.2 Pha B0: kiểm tra GSC (OWNER, không có code)
Owner thực hiện và dán kết quả (ảnh chụp/số) vào mục "Bằng chứng" của plan:
1. Property `www.opentechwire.com` (hoặc domain property) tồn tại và đã xác minh; sitemap `sitemap.xml` có trong Sitemaps; trạng thái "Success"; "Discovered URLs" khớp ~2.799?
2. Nếu chưa nộp: nộp `https://www.opentechwire.com/sitemap.xml`.
3. Báo cáo Indexing -> Pages: số URL theo từng lý do (Discovered - not indexed / Crawled - not indexed / Duplicate / v.v.), và "Why pages aren't indexed" cho vài URL mẫu kho cũ.
4. Crawl stats (Settings -> Crawl stats): số request/ngày tới host; trạng thái host.
5. Manual actions / Security issues của property MỚI: xác nhận trống (hành động thủ công cũ nằm ở `dailytechwire.com`, không có liên hệ với property mới theo D4; nếu thấy ở property mới thì đây là phát hiện nghiêm trọng, dừng và báo).
6. (Tùy chọn, hạn mức thấp, tác động thấp) "Request indexing" thủ công cho 5-10 trang giá trị cao của kho; không tự động hóa.

**Rủi ro B0:** gần như không; chỉ là phụ thuộc thời gian của owner. **Rollback:** không áp dụng (chỉ đọc, cộng nộp sitemap, có thể gỡ trong GSC).

### 5.3 Pha B1 (TÙY CHỌN, owner quyết D3): tách sitemap

**Ý định:** một sitemap index với (a) file "mới" (bài ~30 ngày gần nhất + các URL tĩnh/pillar), (b) các file theo tháng cho kho (`archive-2026-07`, `archive-2026-08`, ...). Lợi ích thật là QUAN SÁT: GSC báo độ phủ theo từng file sitemap, nên thấy ngay "kho tháng 8: 12/400 đã index" so với "tháng 10: 290/293".

**Không hứa:** tách file KHÔNG làm Google crawl nhanh hơn; 2.799 URL còn xa giới hạn 50.000 URL/50 MB. Giá trị chính là đo lường và có thể ưu tiên nộp lại file "mới".

**Ràng buộc kỹ thuật (cần spike A trước khi code, bước B1.0):** `/sitemap.xml` đang là URL đã (hoặc sẽ) nộp và `robots.ts:25` trỏ vào đó; sau thay đổi `/sitemap.xml` PHẢI vẫn hợp lệ và là sitemap index. Với Next 15.4.11, `generateSitemaps()` tạo `/sitemap/[id].xml` và không tự sinh index; cần một route handler riêng cho index, và không được để `app/sitemap.ts` và route trùng đường dẫn. Spike phải chốt cơ chế chính xác và chứng minh bằng `next build` + curl.

**`lastmod` đúng:** hiện lấy `article.updatedAt`. Cần kiểm không bị tăng bởi thao tác hàng loạt (backfill, tái lập chỉ mục, sửa D13). Mẫu phân phối trông hợp lý (tháng 08 = 1.946), nhưng B1.1 sẽ so `updatedAt` với `publishedAt` cho toàn bộ kho và ghi số bài `updatedAt - publishedAt > 7 ngày`. Nếu có đợt bulk bump, đặt `lastmod = publishedAt` hoặc ngày sửa nội dung thật. `lastmod` sai độ tin cậy thì Google bỏ qua tín hiệu này.

**Trade-off B1:** Được: quan sát tốt hơn, đường nộp độc lập cho bài mới, dễ cô lập. Mất: thêm phức tạp (mỗi file một lượt quét CMS hoặc cache chung), nguy cơ phá URL sitemap đã nộp, nhiều thứ cần giám sát hơn. Chọn không làm: không xóa kho khỏi sitemap (Google sẽ không biết chúng qua kênh nào khác ngoài liên kết nội bộ sâu).

**Rủi ro B1:**

| Rủi ro | Xác suất | Tác động | Giảm thiểu |
|---|---|---|---|
| `/sitemap.xml` bị 404 hoặc sai định dạng sau đổi, Google bỏ sitemap | Thấp-trung bình | Cao | Spike B1.0, `curl` + validator XML trên preview, giữ nguyên URL; rollback nhanh |
| Mỗi file tải lại toàn bộ bài từ CMS (200 trang x 50 gọi) | Trung bình | Trung bình (tải CMS, build chậm) | Dùng chung một lần lấy bài đã cache (`getSitemapArticles`) rồi chia theo tháng trong bộ nhớ |
| Bài thiếu `publishedAt` rơi mất khỏi mọi file | Thấp | Trung bình | Kiểm tổng số `<loc>` mới == tổng cũ (AC) |
| Tăng khối lượng GSC mà không có người xem | Trung bình | Thấp | Chỉ làm nếu owner thực sự xem báo cáo (D3) |

**Blast radius:** `apps/web/src/app/sitemap.ts` (hoặc thay thế), `robots.ts` (nếu URL index đổi, không nên), không đụng trang. **Rollback:** khôi phục `sitemap.ts` đơn; nộp lại `sitemap.xml` nếu GSC đã đổi.

### 5.4 Pha B2 (TÙY CHỌN, owner quyết D4): liên kết nội bộ tới kho
Hiện đường tới bài cũ chỉ là chuỗi phân trang pillar (25 bài/trang, hàng trăm trang sâu). Đề xuất: trang lưu trữ theo tháng (ví dụ `/archive/2026/08`) liệt kê bài, liên kết từ footer hoặc trang "About"/"Newsroom", cộng vào sitemap.
- Được: đường crawl ngắn (2-3 click) tới mọi bài cũ; hữu ích cho độc giả.
- Mất: thêm route mới (bề mặt SEO mới, nguy cơ thành trang mỏng trùng lặp nếu chỉ là danh sách), ISR cho danh sách lớn, quyết định thiết kế (cần `vc-frontend-design`), phải tuân thủ invariant #8 (Pillar/Tag là thực thể CMS, không hardcode); không có bằng chứng sẽ tăng index nếu nguyên nhân là chất lượng (H3). Vì vậy KHÔNG làm trước khi B0 cho thấy trạng thái chủ yếu là "Discovered - not indexed" (vấn đề khám phá) thay vì "Crawled - not indexed" (vấn đề chất lượng).
- Phương án rẻ hơn: "bài liên quan" ở mỗi bài mới trỏ ngược tới bài kho cũ cùng pillar/chủ đề (liên kết ngữ cảnh, giá trị cao hơn trang danh sách). Cân nhắc khi lập plan riêng.
- B2 cần plan con riêng khi được duyệt; plan này chỉ định hướng và chặn.

### 5.5 Pha B3 (TÙY CHỌN, owner quyết D5): IndexNow
Giao thức báo URL mới/đổi cho Bing/Yandex/Seznam, KHÔNG phải Google. Chi phí thấp (một key file, một lệnh ping khi publish qua webhook revalidate), nhưng không giúp mục tiêu Google; chỉ làm nếu owner quan tâm Bing/Copilot/DuckDuckGo. Rủi ro: thêm một đường ghi ngoài khi publish (lỗi nên fail-open, không chặn `afterChange`); lộ key file công khai là bình thường theo giao thức. Tin cậy giúp Google: bằng không.

### 5.6 Pha B4 (QUYẾT ĐỊNH, owner): chất lượng kho
Sau B0, nếu "Crawled/Discovered - currently not indexed" chiếm đa số kho:
- (i) Giữ nguyên, chấp nhận index chậm (rủi ro thấp, không cần làm gì; kho vẫn có thể bị trừ điểm chất lượng toàn site).
- (ii) Gộp/dọn: `noindex` hoặc gỡ khỏi sitemap các bài kho mỏng/trùng. Được: tập trung ngân sách crawl và tín hiệu chất lượng vào bài tốt; mất: mất khả năng được index của các bài đó, mất lưu lượng tiềm năng, phải có tiêu chí khách quan, và đụng nội dung xuất bản (D13: chỉ brief do máy được sửa; bài nhà báo thì không đụng, nhưng `noindex` là metadata chứ không phải nội dung, vẫn cần owner duyệt); khó hoàn tác trong hiệu ứng với Google (sau khi `noindex` được xử lý, gỡ lại mất vài tuần mới phục hồi).
- (iii) Cắt dần theo loại (chỉ brief Daily Brief cũ ưu tiên thấp, `sitemap.ts` đã hạ priority nhưng Google bỏ qua).
Plan này KHÔNG thực hiện (ii)/(iii); chỉ nêu lựa chọn. Cần dữ liệu từ B0 và phân loại kho (tỷ lệ brief, độ dài, trùng lặp) trước khi bàn.

### 5.7 Những gì cố ý không làm (xem mục 8)

---

## 6. Workstream C: đo lường tỷ lệ index (cross-repo, owner = content-engine, KHÔNG thực hiện trong plan này)

Vấn đề: `src/hub-analytics/index-sample.ts` (content-engine) lấy mẫu 25 URL rải đều theo `lastmod` nên "tỷ lệ index" của dtw ~ tỷ lệ index của kho cũ (76% sitemap), che khuất việc bài mới gần như đều đã index; con số 6/25 dễ bị hiểu là "bài mới không được index".

Đề xuất cho content-engine (mở plan/issue riêng ở repo đó):
1. Báo tách hai nhóm: URL xuất bản trước và sau mốc rebrand 2026-09-08 (hằng số cấu hình theo tựa), hiển thị ở trang Kết nối dữ liệu.
2. Hoặc mẫu phân tầng (ví dụ 15 URL mới nhất 30 ngày + 10 URL ngẫu nhiên kho) và ghi tầng vào `site_index_status`.
3. Giữ tương thích ngược cột hiện có; thêm cột nullable (migration additive-only theo quy ước repo đó, số migration kiểm lại ở thời điểm đặt).
Trade-off: Được: số liệu phản ánh đúng sức khỏe index của nội dung đang sản xuất; mất: thay đổi lịch sử so sánh tuần-qua-tuần (cần cắt chuỗi hoặc ghi chú), tăng nhẹ độ phức tạp. Rủi ro: so sánh chéo tựa mất nhất quán nếu tựa khác không có "trước/sau mốc". Quy tắc: chỉ ghi vào plan này như hạng mục theo dõi; không sửa repo kia từ phiên này.

---

## Touchpoints

| Pha | File (dtw-web) | Ghi chú |
|---|---|---|
| A1 | `apps/web/src/components/cover-art.tsx` (nhánh `<img>` dòng ~114-124, `CoverArtProps`) | Thay đổi duy nhất của A1 (+ tùy chọn D1 thêm `eager` ở tối đa vài call site: `home-hero.tsx:140`, `pillar-content.tsx:194`) |
| A1 (nếu D1 chọn eager/priority) | `apps/web/src/components/home/home-hero.tsx`, `apps/web/src/components/pillar/pillar-content.tsx` | Chỉ thêm prop |
| A2 | các call site CoverArt ở mục 1.4; `apps/web/src/lib/image-hosts.ts`, `apps/web/next.config.ts` (chỉ nếu đổi `images.*`) | Có điều kiện |
| B1 | `apps/web/src/app/sitemap.ts` (hoặc route index mới), `apps/web/src/app/robots.ts` | Có điều kiện, spike trước |
| B2 | route/component mới (kế hoạch con) | Có điều kiện |
| B3 | route key file + hook publish/webhook | Có điều kiện |
| Docs | `process/context/uxui/all-uxui.md`, `process/context/tests/all-tests.md`, `process/context/infra/all-infra.md` | Cập nhật ở UPDATE PROCESS, không phải EXECUTE |

## 8. Phương án bị loại (rejected alternatives) và lý do

| Phương án | Lý do loại |
|---|---|
| Redirect 301 hoặc Change of Address từ `dailytechwire.com` sang `www.opentechwire.com` | **Cấm vĩnh viễn bởi D4 và invariant #15.** Domain cũ mang một hành động thủ công (manual action) của Google do chủ trước để lại; 301/CoA là cơ chế chuyển tín hiệu đó sang domain mới. Dù có thể tăng tốc index kho cũ, rủi ro lây hành động thủ công là không chấp nhận được. Không đưa vào kế hoạch dưới bất kỳ dạng nào, kể cả "thử tạm". |
| Google Indexing API | Chỉ dành cho JobPosting/BroadcastEvent; dùng sai có nguy cơ bị thu hồi quyền và không được chấp nhận cho bài báo. |
| Tự động hóa "Request indexing" hàng loạt | Hạn mức thấp, không có API chính thức, vi phạm điều khoản nếu scrape. |
| Lật mặc định `sizes` của CoverArt sang `100vw` | Làm thumbnail 110px tải ảnh lớn hơn; chống lại comment tại `cover-art.tsx:87-91`. |
| Chuyển toàn bộ thẻ sang `next/image` ngay | Tốn phí/quota Vercel, rủi ro cold-transform; chỉ cân nhắc ở A2 có điều kiện. |
| Coi LCP là nguyên nhân index thấp | Sai nhân quả (không có field data; CWV không phải cổng index). |
| Xóa hàng loạt kho cũ để "làm sạch" | Không đảo ngược được, đụng nội dung xuất bản (D13); chỉ là lựa chọn B4(ii) cho owner sau khi có dữ liệu. |
| Sitemap news (Google News) | Chỉ có ý nghĩa nếu tựa nằm trong Google News/Publisher Center, và chỉ liệt kê bài 48 giờ gần nhất, nên không giúp kho cũ. Ghi nhận, không đưa vào pha nào trừ khi owner có Publisher Center (có thể mở sau). |

## 9. Danh sách quyết định của owner

| # | Quyết định | Mặc định đề xuất | Hệ quả nếu chọn khác |
|---|---|---|---|
| D0 | Cấp quyền/thực hiện B0 (GSC) và dán kết quả | Có, làm trước mọi thứ về index | Không có B0 thì mọi quyết định index chỉ là suy đoán |
| D1 | Cho phép `eager` (tải sớm, `fetchPriority="low"`) cho vài thẻ above-the-fold sau khi đo? | Mặc định lazy hết; chỉ bật eager cho tối đa 3-4 thẻ nếu screenshot lúc LCP cho thấy ô trống | Eager nhiều sẽ quay lại vấn đề cạnh tranh băng thông |
| D2 | Chấp nhận chi phí/độ trễ Vercel Image Optimization cho thẻ (A2)? | Chưa; chỉ xét nếu A1 không đủ; trước đó kiểm biến thể CMS | Chấp nhận sớm làm tăng phí và rủi ro cold-transform |
| D3 | Tách sitemap (B1)? | Chỉ khi owner thực sự xem báo cáo GSC theo file; nếu không thì giữ một file | Làm mà không ai xem là chi phí trả không |
| D4 | Làm trang lưu trữ theo tháng / liên kết kho (B2)? | Chờ B0: chỉ làm nếu trạng thái chủ yếu là "Discovered - not indexed" | Làm khi nguyên nhân là chất lượng chỉ tạo thêm trang mỏng |
| D5 | IndexNow (B3)? | Không, trừ khi quan tâm Bing/Copilot | Không ảnh hưởng Google |
| D6 | Chính sách kho cũ (B4): giữ / noindex một phần / dọn | Giữ, đánh giá lại sau 4-8 tuần với dữ liệu B0 và C | Noindex sớm là khó đảo ngược |
| D7 | Giao content-engine thực hiện mục 6 (đo tách trước/sau rebrand)? | Có, mở issue/plan ở repo đó | Không làm thì chỉ số hub tiếp tục gây hiểu lầm |
| D8 | Chấp nhận mục tiêu mềm cho LCP (lab, xem mục 10) vì không có field data? | Có | |

## 10. Acceptance Criteria và Success Metrics

**Acceptance Criteria (kiểm được):**
- AC1: sau A1, trong HTML trang chủ SSR số `<link rel="preload" as="image">` <= 3 và `<img>` thẻ không phải priority có `loading="lazy"` và `decoding="async"`.
- AC2: đo local (mục 4.3) cho thấy LCP home trung vị không xấu hơn baseline và load event giảm rõ rệt; CLS ~0; LCP pillar và `/exclusive` không xấu hơn baseline > 10%.
- AC3: `pnpm typecheck` sạch; `pnpm --filter web lint` không thêm cảnh báo so với baseline; `pnpm --filter web build` thành công.
- AC4: nhánh `next/image` và mặc định opt-in `sizes` không đổi (diff chỉ ở nhánh `<img>` và prop `eager`).
- AC5 (chỉ khi làm B1): `/sitemap.xml` vẫn trả 200 hợp lệ là sitemap index; tổng `<loc>` các file con == 2.799 (hoặc số hiện tại tại thời điểm đo) cộng/trừ chênh lệch thời gian đã giải thích.
- AC6 (B0): owner đã dán ảnh/số của 6 mục kiểm vào mục Bằng chứng.

**Success metrics theo thời gian (thực tế, có kèm bất định):**

| Mốc | Chỉ số | Mục tiêu |
|---|---|---|
| Ngay sau deploy A1 | Đếm preload, đo local | AC1, AC2 đạt |
| 1-2 tuần sau (2 lượt PSI thứ Hai) | `site_vitals` home mobile LCP trung vị | < 2,5 s (mục tiêu mềm; lab nhiễu +/-750 ms, kết luận cần 2 lượt liên tiếp); trang bài giữ < 1,5 s |
| 1-2 tuần sau B0 | GSC: sitemap Success, số URL Discovered | Gần 2.799 |
| 4-8 tuần | GSC: số URL kho "đã khám phá"/đã index tăng đơn điệu | Xu hướng tăng; không cam kết con số tuyệt đối (Google có thể giữ nhiều kho ở trạng thái not-indexed) |
| 4-8 tuần | Tỷ lệ index nhóm sau rebrand (sau khi có mục 6) | >= 90% (kỳ vọng dựa trên dữ liệu hiện tại: bài Sept+ gần như đều đã index) |
| 8 tuần | Quyết định B4 dựa trên dữ liệu | Có quyết định có bằng chứng |

## 11. Phase Completion Rules

- Trạng thái dùng: ⏳ PLANNED, 🚧 IN PROGRESS, 🔨 CODE DONE, 🧪 TESTING, ✅ VERIFIED.
- Một pha code chỉ được ghi 🔨 CODE DONE khi typecheck + build + đo local (mục 4.3) đạt và đã commit/PR do orchestrator thực hiện.
- ✅ VERIFIED cần (a) bằng chứng production (PSI thứ Hai >= 2 lượt cho A1; ảnh GSC cho B0) VÀ (b) xác nhận bằng lời của user (User Confirmation). Lab local không đủ để ghi ✅ VERIFIED.
- Pha A2/B1/B2/B3 chỉ được vào EXECUTE khi điều kiện vào và quyết định owner tương ứng ở mục 9 đã được ghi nhận bằng văn bản vào plan này.
- Mỗi pha sau phải chạy lại research ngắn (đọc lại call site/GSC hiện tại) trước khi EXECUTE.

## 12. Implementation Checklist

**Pha B0 (owner, chạy song song, bắt đầu ngay)**
- B0.1 Owner làm 6 mục kiểm ở 5.2 và dán kết quả vào mục "Bằng chứng" của plan.
- B0.2 Orchestrator ghi tóm tắt giả thuyết H1/H2/H3 được xác nhận hay bác bỏ.

**Pha A1 (code)**
- A1.1 Chụp baseline: chạy quy trình 4.3 trên `main` (trang chủ, 1 pillar, 1 bài, `/exclusive`), lưu số vào mục Bằng chứng.
- A1.2 Sửa `apps/web/src/components/cover-art.tsx`: thêm prop `eager?: boolean` vào `CoverArtProps` (kèm JSDoc giải thích đúng mục đích và cảnh báo tương tự comment hero); trong nhánh `<img>` trần, đặt `loading="lazy"` + `decoding="async"` khi `!priority && !eager`, đặt `fetchPriority="low"` khi `eager && !priority`, giữ nguyên hành vi khi `priority`. Không đổi nhánh `next/image`, không đổi nhánh SVG, không đổi comment "Do not flip this default".
- A1.3 `pnpm typecheck`, `pnpm --filter web lint` (so sánh baseline), `pnpm --filter web build`.
- A1.4 Chạy lại quy trình 4.3; kiểm AC1 (đếm preload trong HTML SSR) và AC2. Nếu preload vẫn phát cho ảnh lazy, DỪNG và quay lại PLAN, không tự thêm hack.
- A1.5 Chụp screenshot tại thời điểm LCP trên desktop và mobile cho trang chủ và pillar để phát hiện ô trống above-the-fold.
- A1.6 Nếu A1.5 cho thấy ô trống ở thẻ above-the-fold hoặc LCP pillar xấu đi: áp `eager` (hoặc `priority` cho ảnh featured ứng viên LCP) cho đúng các call site đó theo D1, tối đa 4 chỗ, rồi lặp A1.3-A1.5.
- A1.7 Ghi kết quả vào mục Bằng chứng; chuyển trạng thái 🔨 CODE DONE; orchestrator commit/PR (không thuộc phạm vi plan).
- A1.8 Sau deploy: theo dõi 2 lượt PSI thứ Hai (A3), ghi số vào Bằng chứng; đề nghị user xác nhận để ✅ VERIFIED.

**Pha A2 (có điều kiện; chỉ sau cổng ở 4.4 và D2)**
- A2.1 Spike: xác nhận với `apcg-cms` có URL biến thể ổn định trên `img.apcgmedia.com` hay không.
- A2.2 Nếu có: dùng biến thể; nếu không: đo `sizes` từng call site và truyền `sizes` theo lô <= 3 call site/lô, đo usage Vercel trước/sau mỗi lô.

**Pha A3 (liên tục)**
- A3.1 Mỗi thứ Hai ghi LCP home/bài từ `site_vitals`.
- A3.2 Điều tra TTFB/STALE/HTML 150 KB, ghi phát hiện, mở plan con nếu đáng làm.

**Pha B1 (có điều kiện; D3)**
- B1.0 Spike cơ chế sitemap index với Next 15.4.11 (xem 5.3), chứng minh `/sitemap.xml` giữ nguyên là index.
- B1.1 Phân tích `updatedAt` vs `publishedAt` toàn kho (script đọc-chỉ, kết quả vào Bằng chứng); quyết định nguồn `lastmod`.
- B1.2 Cài đặt chia file; AC5; `next build`; curl trên preview.
- B1.3 Owner nộp lại sitemap index trên GSC (nếu cần) và quan sát độ phủ theo file.

**Pha B2/B3/B4 (chỉ khi owner duyệt D4/D5/D6, mỗi cái cần plan con)**

**Pha C (repo content-engine, không thuộc EXECUTE ở đây)**
- C.1 Orchestrator mở issue/plan ở content-engine theo mục 6 (D7).

## 13. Dependencies và Failure Modes

- Dependencies: B0 độc lập mọi code; A1 độc lập B; A2 phụ thuộc kết quả A1 và D2; B2 phụ thuộc B0; B4 phụ thuộc B0 + C; C độc lập nhưng cần cho kết luận cuối cùng của B.
- Failure modes chính: (1) A1 đo local tốt nhưng PSI production không cải thiện (do TTFB/ISR hoặc nguồn khác): A3 điều tra; (2) lab dao động che hiệu quả: dùng >= 2 lượt và trung vị; (3) GSC cho thấy chất lượng là nguyên nhân: các đòn bẩy kỹ thuật (B1-B3) gần như vô hiệu, quay về B4; (4) hub tiếp tục báo tỷ lệ thấp do mẫu: giải bằng C.
- Tương thích ngược: không có thay đổi dữ liệu/migration; URL không đổi (canonical, slug giữ nguyên); sitemap URL `sitemap.xml` được giữ.
- Bảo mật/riêng tư: không thay đổi bề mặt auth; B3 chỉ thêm một file khóa công khai theo giao thức.

## Public Contracts

- URL công khai: không đổi (trang, canonical, `/sitemap.xml`, `/robots.txt`). B1 nếu làm: `/sitemap.xml` đổi nội dung từ urlset sang sitemapindex nhưng URL giữ nguyên; thêm các URL file con.
- API nội bộ: `CoverArtProps` thêm prop tùy chọn `eager` (additive, mặc định không đổi so với A1; so với trước A1 thì mặc định `<img>` giờ lazy là thay đổi hành vi có chủ đích).
- Dữ liệu/CMS/engine: không đổi; không đụng slug `dtw`, `dtw_auth`, `dtw-media` (D11, D12).
- content-engine: mục 6 sẽ thêm cột nullable ở repo đó (ngoài phạm vi).

## Blast Radius

- A1: mọi bề mặt có thẻ ảnh qua nhánh `<img>` (home, pillar, exclusive, related, search, account); không ảnh hưởng SEO/URL/dữ liệu.
- A2: các call site được chọn + chi phí Vercel.
- B1: sitemap và độ phủ GSC; sai sót có thể làm Google bỏ sitemap tạm thời.
- B2/B3/B4: route mới / API ngoài / chỉ thị index trên nội dung xuất bản (B4 rủi ro cao nhất).
- Không có thay đổi nào đụng DB, engine, auth, paywall, hay disclosure box (invariant #4, #5, #6 giữ nguyên; không thêm popup hay quảng cáo).

## 16. Rollback (tổng hợp)

| Thay đổi | Cách hoàn tác | Thời gian hiệu lực |
|---|---|---|
| A1 | Revert commit `cover-art.tsx` | Sau deploy + ISR |
| A2 | Gỡ `sizes` ở call site | Sau deploy |
| B1 | Khôi phục `sitemap.ts` đơn | Sau deploy; Google đọc lại sitemap sau vài ngày |
| B2 | Gỡ route + link | Sau deploy; URL đã lập chỉ mục sẽ trả 404 (nên gỡ khỏi sitemap trước) |
| B3 | Xóa key file + hook | Ngay |
| B4 | Gỡ `noindex`: Google mất vài tuần xử lý lại | Chậm; vì thế B4 là rủi ro cao nhất |

## 17. Test Matrix

| Loại | Nội dung | Công cụ |
|---|---|---|
| Typecheck | toàn workspace | `pnpm typecheck` |
| Lint | không thêm cảnh báo so với baseline | `pnpm --filter web lint` |
| Build | route, ranh giới server/client | `pnpm --filter web build` |
| Unit | không có test DOM/React trong repo (Known Gap); A1 không thêm runner mới. Nếu tách logic thuần (ví dụ chọn thuộc tính loading) thì thêm test `tsx --test` theo mẫu `exclusive.test.ts`; không bắt buộc | `tsx --test` |
| Runtime probe | mock Central + ảnh thật, đo trước/sau (4.3) | Playwright (throwaway, trong scratchpad, KHÔNG commit) |
| Manual | screenshot LCP, CLS, cuộn nhanh trên mobile | thủ công |
| Production | PSI thứ Hai (`site_vitals`) + GSC (B0, các tuần sau) | hub + owner |

Lưu ý: Playwright và Lighthouse chưa là phần của repo (Known Gaps trong `tests/all-tests.md`); dùng như công cụ ngoài, không thêm vào `package.json` trong plan này.

## Verification Evidence

| Mục | Bằng chứng cần có | Trạng thái |
|---|---|---|
| Baseline A | Bảng số trước thay đổi (LCP, load, bytes, preload) 4 trang, >= 5 lượt | ⏳ |
| Sau A1 | Cùng bảng sau thay đổi + HTML đếm preload + screenshot | 🔨 một phần: đếm preload local xong (xem ghi chú), chưa đo LCP/screenshot |
| Typecheck/lint/build | Đầu ra lệnh | ✅ typecheck + build đạt; lint 1 warning có sẵn (xem ghi chú) |
| PSI production | 2 lượt thứ Hai liên tiếp sau deploy | ⏳ |
| B0 | Ảnh/số GSC (sitemap status, Pages report, Crawl stats, Manual actions) | ⏳ |
| B1 (nếu làm) | curl `/sitemap.xml`, tổng `<loc>`, kết quả phân tích `lastmod` | ⏳ |
| User Confirmation | Xác nhận của user trước khi ghi ✅ VERIFIED | ⏳ |

### Ghi chú tiến độ A1 (04-11-26)

Quyết định đã nhận: D1 = lazy cho mọi thẻ không priority (prop `eager` có nhưng không call site nào dùng); D2 = không đổi optimizer.

**Đã làm:** chỉ `apps/web/src/components/cover-art.tsx` nhánh `<img>` trần: không-priority thêm `loading="lazy"` + `decoding="async"`; `priority` giữ nguyên (eager, `fetchPriority="high"`); prop mới `eager?: boolean` (mặc định false; khi true và không priority: không lazy, `fetchPriority="low"`). Nhánh `next/image`, mặc định `sizes` opt-in, nhánh SVG không đổi.

**Cổng A1.4 (giả định React 19 không preload ảnh lazy) ĐÃ KIỂM, ĐÚNG:** react/react-dom 19.2.6, `renderToString` một `<img>`: lazy 0 preload; eager 1 preload; `fetchPriority="low"` không lazy 0 preload; `fetchPriority="high"` 1 preload. (Lưu ý: nhánh `eager` có `fetchPriority="low"` nên cũng KHÔNG phát preload.)

**Lệnh và kết quả:** `pnpm install --frozen-lockfile` OK. `pnpm typecheck` 3/3 task đạt. `pnpm --filter web lint`: 1 warning ở `src/components/article/article-body.tsx:78` (unused eslint-disable), file không thuộc thay đổi, có sẵn. `pnpm --filter web build` KHÔNG chạy được nếu thiếu env (`AUTH_DATABASE_URL`/`DATABASE_URL`, lỗi thu thập page data `/api/auth/[...all]`, không liên quan thay đổi); với env giữ chỗ (`CMS_URL`, `CMS_READ_TOKEN`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_SITE_URL`) build đạt.

**Đếm preload local (mock Central, 12 thẻ trang chủ, ảnh phục vụ từ mock cục bộ, `next build` + `next start`):** trang chủ trước 11 `<link rel=preload as=image>` / 12 `<img>` (0 lazy), sau 1 (hero) / 12 `<img>` (11 lazy + decoding async, hero không lazy); `/exclusive` trước 9 / sau 0, 9/9 lazy. Mock chỉ có 12 thẻ nên số tuyệt đối thấp hơn production (~26-35); xu hướng khớp AC1 (<= 3 preload).

**CHƯA kiểm:** đo LCP/CLS/load event (A-V, Moto G4 throttle) và baseline 4 trang; screenshot A1.5 desktop/mobile (ô trống above-the-fold, LCP pillar/exclusive); trang pillar (mock chưa có route chạy được); preview Vercel với dữ liệu thật; PSI production 2 lượt thứ Hai (A1.8); xác nhận của user. Cho tới khi có A1.5 và đo pillar/exclusive, điều kiện chặn merge ở bảng rủi ro A1 (LCP pillar xấu đi) vẫn chưa được loại trừ.

### Ghi chú A-V trên Preview Vercel (04-11-26, dữ liệu thật)

**Cách đo:** hai Preview của cùng nhánh, cùng hạ tầng `sin1`: A = `9b094f3` (code giống `main`), B = `26c2114` (A1), C = `a126dc6` (A1 + A1.6). Playwright, Moto G4, CPU 4x, ~1,6 Mbps, latency 150 ms, xoá cache mỗi lượt, A/B xen kẽ, 5 lượt mỗi bên; LCP là entry cuối của PerformanceObserver. Script ngoài repo (`scratchpad/lcp/ab.cjs`, `shots.cjs`). Lần build đầu của B lỗi do `next/font/google` tải IBM Plex Sans thất bại (lỗi mạng tạm thời, không liên quan); redeploy cùng commit qua Vercel thì đạt.

**Vòng 1 (A vs B = A1), trung vị LCP:** `/` 1.980 → 1.496 ms (load 10.388 → 3.707 ms); `/ai` 1.720 → **2.120 ms (+23%, TRƯỢT cổng 10%)**; `/exclusive` 3.204 → 3.464 ms (+8%); bài 1.180 → 972 ms. Nguyên nhân: phần tử LCP của pillar (ảnh featured 440 px) và `/exclusive` (thẻ đầu) bị lazy.

**A1.6 (đã áp, 2 call site, trong giới hạn tối đa 4):** `pillar-content.tsx` ảnh featured `priority`; `exclusive-content.tsx` thẻ đầu `priority={i === 0}`. Mỗi trang đúng một CoverArt priority. `tsc --noEmit` và eslint 2 file: sạch.

**Vòng 2 (A vs C = A1 + A1.6), trung vị LCP (5 lượt):**

| Trang | A (gốc) | C (A1 + A1.6) | Load event A → C | Preload ảnh A → C |
|---|---|---|---|---|
| `/` | 1.880 | 1.592 (−15%) | 10.357 → 3.719 | 26 → 1 |
| `/ai` | 1.616 | 1.160 (−28%) | 8.426 → 3.150 | 25 → 1 |
| `/exclusive` | 3.124 | 1.948 (−38%) | 15.736 → 3.665 | 8 → 1 |
| bài | 1.044 | 984 (−6%) | 3.775 → 2.975 | 4 → 1 |

CLS không đổi (tối đa 0,022 trang danh sách, 0,042 trang bài, ở cả A và C). Lượt đầu mỗi bên thường cao hơn (cold cache CDN), trung vị đã loại bỏ.

**A1.5 (ảnh trong khung nhìn đầu, sau `load`):** C ở mobile (Moto G4) và desktop 1280×800 cho `/`, `/ai`, `/exclusive`: mọi `<img>` trong khung nhìn đã tải xong (0 ô trống); ảnh chụp kiểm bằng mắt trang chủ desktop/mobile không có ô trống.

**Cổng A-V: ĐẠT** (preload ảnh ≤ 3, không trang nào xấu hơn baseline > 10%, CLS ~0). Lưu ý: đây là đo lab mô phỏng trên Preview, chưa phải PSI production; số tuyệt đối thấp hơn PSI (PSI dùng profile chậm hơn).

**Còn lại trước ✅ VERIFIED:** merge PR #64; PSI production của hub (`site_vitals`) 2 lượt thứ Hai liên tiếp sau merge cho thấy LCP trang chủ < 2,5 s; xác nhận của user.

## 19. Resume and Execution Handoff

- Plan này CHƯA được duyệt để thực thi. Orchestrator trình bày cho user các quyết định ở mục 9 (tối thiểu D0, D1 mặc định, D7) trước khi EXECUTE.
- Điều gì có thể vào EXECUTE ngay khi user nói "ENTER EXECUTE MODE": **chỉ Pha A1** (checklist A1.1-A1.8) và hạng mục C.1 (mở issue). B0 là việc của owner, không cần EXECUTE. A2/B1/B2/B3/B4 KHÔNG được thực thi từ plan này nếu chưa có quyết định và pha research lại.
- Orchestrator truyền cho vc-execute-agent đúng một đường dẫn: `process/general-plans/active/otw-lcp-and-indexing_PLAN_04-11-26.md`, kèm chỉ định "chỉ Pha A1".
- Không commit/push từ trong plan; orchestrator quyết định (nhánh làm việc `claude/cool-cannon-062w1r`).
- Điểm dừng: nếu A1.4 cho thấy preload vẫn phát cho ảnh lazy, hoặc LCP pillar/exclusive xấu đi và A1.6 không khắc phục, quay lại PLAN.
- Validator: `node .claude/skills/vc-generate-plan/scripts/validate-plan-artifact.mjs process/general-plans/active/otw-lcp-and-indexing_PLAN_04-11-26.md`. Ghi chú: bản validator của dtw-web lỗi với YAML frontmatter, nên file này cố ý KHÔNG dùng frontmatter.
- Cập nhật context sau khi xong (UPDATE PROCESS): `process/context/uxui/all-uxui.md` (hành vi tải ảnh của CoverArt, prop `eager`), `process/context/tests/all-tests.md` (quy trình đo LCP local), ghi chú thứ hai trong `infra/all-infra.md` nếu sitemap đổi.

## 20. Follow-ups ngoài phạm vi

- GCV (`gcv-web`): home LCP 5,8 s và 8 URL "Discovered - not indexed": kiểm tra cùng lỗi nhánh `<img>` trần hay cơ chế khác; mở plan ở repo đó.
- content-engine: mục 6 (đo tách trước/sau rebrand).
- Core Web Vitals field data: xem lại sau khi lưu lượng đủ cho CrUX.

---

**Next Step:** user duyệt các quyết định ở mục 9 rồi nói "ENTER EXECUTE MODE" (chỉ Pha A1). Plan này tuân RIPER-5; EXECUTE phải nhận đúng một đường dẫn plan.
