# Rebrand Phase 4 — Copy hiển thị (Dailytechwire → Opentechwire)

**Date**: 08-09-26
**Complexity**: COMPLEX phase-program member (một phase con của chương trình 8-phase; bản thân phase này là một lượt EXECUTE duy nhất, không tự chia phase con)
**Feature**: `rebrand`
**Plan file**: `process/features/rebrand/active/phase-4-rendered-copy_PLAN_08-09-26.md`
**Umbrella plan**: `process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md`
**Tài liệu nghiên cứu nền**: `process/general-plans/references/rebrand-opentechwire_REFERENCE_08-09-26.md` (752 dòng, §3.1 ui-components, §3.2 seo-metadata, §3.3 editorial-pages — mọi dòng trích dẫn dưới đây đều đối chiếu lại với repo thật vào 09-09-26, một ngày sau ngày ký tài liệu tham chiếu; **không có drift nào được phát hiện** ở các file đã đối chiếu, cộng thêm 6 dòng mới phát hiện qua live-grep mà bảng §3.2 gốc không liệt kê riêng — đánh dấu "**[MỚI, không có trong bảng tham chiếu]**" bên dưới)
**Status**: 🧪 TESTING — đã deploy; CÒN TREO Nhóm F2 (~20 mailbox, chờ Phase 1) và Nhóm H (/trust/ai, chờ quyết định sản phẩm) (cập nhật 10-09-26)

---

## Overview

Đây là lượt quét-và-sửa **copy hiển thị** (mọi chuỗi văn bản mà một reader, một screen reader, hoặc một feed/email client thực sự nhìn thấy/nghe thấy) trên `dtw-web`, gộp **cả hai nhóm casing đang tồn tại song song** — `DailyTechWire` (PascalCase, bề mặt máy đọc/SEO/transactional — 35 dòng theo đếm gốc của tài liệu tham chiếu D1) và `Dailytechwire` (sentence case, copy biên tập — 31 dòng) — thành một chuỗi chuẩn duy nhất theo D1: **`Opentechwire`** cho mọi văn xuôi/metadata, không bao giờ `OpenTechWire`. Đồng thời gộp luôn các biến thể viết tắt `DTW`/`DTW Studio` → `OTW`/`OTW Studio` (D2) ở đúng những vị trí là **copy hiển thị** (không phải asset thị giác — xem "Ngoài phạm vi" bên dưới), và swap 5 địa chỉ hộp thư `@dailytechwire.com` xuất hiện trong copy/`mailto:` — nhưng phần **domain** của các địa chỉ đó bị **GATE** lại (xem §"Quy tắc gate mailbox" bên dưới), tách bạch rõ với phần **tên brand** trong cùng câu (không gate).

Lý do gộp cả hai nhóm casing trong một phase, đúng như khung nhiệm vụ đã giao: nếu chỉ sửa một nhóm casing, repo sẽ hiển thị đồng thời "Opentechwire" (đã sửa) và "DailyTechWire"/"Dailytechwire" (chưa sửa) trên các trang khác nhau — một trạng thái nửa vời tệ hơn cả trạng thái cũ, vì độc giả/Google sẽ thấy publication tự mâu thuẫn tên với chính mình.

Phase này **KHÔNG** viết code trong file plan — plan chỉ mô tả đúng việc phải làm, kèm file + dòng + chuỗi hiện tại + chuỗi đề xuất, để EXECUTE thực thi không cần phán đoán sáng tạo.

---

## Phạm vi và NGOÀI phạm vi (đọc trước khi làm)

### Trong phạm vi

- `apps/web/src/components/**` — copy hiển thị của header/footer/auth-modal/article/pillar/home/dashboards (§3.1 tài liệu tham chiếu), **trừ** những phần bị loại ở dưới.
- `apps/web/src/lib/data.ts` — mock/sample data đang được render.
- ~~`apps/web/src/lib/email.ts:13` và `apps/web/src/lib/auth.ts:78,84,97,103`~~ — **đã chuyển sang Phase 6 (09-09-26, umbrella §6b.3)**; Phase 4 chỉ chạy lệnh xác nhận ở Bước 6, không sửa.
- `apps/web/src/app/(reader)/dashboards/[[...sub]]/page.tsx` — chuyển `generateMetadata()` sang `buildMetadata()`.
- `apps/web/src/app/layout.tsx`, `apps/web/src/app/(reader)/layout.tsx`, `apps/web/src/lib/metadata.ts` (chỉ các dòng copy hiển thị, không phải dòng 26/30 origin-resolver comment), `apps/web/src/app/rss.xml/route.ts`, `apps/web/src/app/(reader)/[pillar]/rss.xml/route.ts`, `apps/web/src/app/(reader)/[pillar]/pillar-view.tsx`, `apps/web/src/app/(reader)/page.tsx` (description + comment), `apps/web/src/app/(reader)/briefing/briefing-view.tsx`, ~~`apps/web/src/app/manifest.ts`~~ (**đã chuyển sang Phase 3**, umbrella §6b.3), `apps/web/src/app/llms.txt/route.ts`, `apps/web/src/app/not-found.tsx`, `apps/web/payload.config.ts`, `apps/web/src/lib/feed.ts` (chỉ dòng 21, 122 — KHÔNG đụng 61/69/116/123).
- `apps/web/src/app/(reader)/{about,newsroom,press,contact,advertise,studio,legal/[slug],newsletters,briefing,trust/[slug],reset-password}/**` — toàn bộ §3.3 tài liệu tham chiếu, 3 locale.
- D9: xác nhận (không sửa code) rằng không có gói "DTW Pro" nào tồn tại trong `apps/web/src` hôm nay.

### Ngoài phạm vi (và phase nào xử lý)

| Mục bị loại | Lý do | Phase xử lý |
|---|---|---|
| `apps/web/src/components/wordmark.tsx` — **toàn bộ file**, kể cả `aria-label` (dòng 13) và docblock (dòng 2-6) | Umbrella giao nguyên file này cho Phase 3 như MỘT commit atomic thị giác (monogram + wordmark text + aria-label + hình học + docblock cùng lúc) | Phase 3 |
| `apps/web/src/app/icon.svg`, `apple-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `og-default.png`, `dtw-logo-primary.svg`, `apps/web/scripts/generate-og-default.mjs` | Asset thị giác / generator hình ảnh | Phase 3 |
| `apps/web/src/lib/email.ts` — **toàn bộ file** (`:12` fallback domain, `:13` `FROM` display name, `:79` lockup HTML) và `apps/web/src/lib/auth.ts:78,84,97,103` | **Phân giải chồng lấn 09-09-26 (umbrella §6b.3)**: `:13` và 4 chuỗi `auth.ts` từng bị cả Phase 4 lẫn Phase 6 nhận. Tài liệu tham chiếu §5 bắt buộc chúng flip **cùng một deploy** với `RESEND_FROM_DOMAIN` — tách ra là tạo mail "tên mới @ domain cũ", đúng chữ ký phishing mà §5 cảnh báo | **Phase 6** (`:12`, `:13`, `auth.ts`) / **Phase 3** (`:79` lockup thị giác) |
| `apps/web/src/app/manifest.ts` — **toàn bộ file** (dòng 13-15) | **Phân giải chồng lấn 09-09-26 (umbrella §6b.3)**: manifest là danh tính PWA đi cùng bộ icon, phải ship trong commit atomic của "cái mark". Giá trị chốt ở đó: `name: "Opentechwire"`, `short_name: "OTW"`, `description: "Tech Intelligence, Openly Wired."` | **Phase 3** |
| `apps/web/src/lib/auth.ts:59` (`baseURL: process.env.BETTER_AUTH_URL`) | Không có literal cần sửa — chỉ là đọc env; giá trị env lật ở Phase 6 | Phase 6 |
| `apps/web/src/components/footer.tsx:63,64` (`sameAs` LinkedIn/Facebook URL) và `apps/web/src/lib/metadata.ts:90-91` (`ORGANIZATION.sameAs`) | Umbrella giao rõ cho Phase 6: "sửa `footer.tsx:63-64` + `metadata.ts:90-91` cùng lúc" **sau khi** profile mạng xã hội đã đổi tên | Phase 6 |
| `apps/web/src/lib/metadata.ts:84` (`ORGANIZATION.name`) | Giá trị là `"Asia Press Centre Group (APCG)"` — **không phải** brand publication, không đổi theo bất kỳ D nào | Không đổi, vĩnh viễn |
| `apps/web/src/lib/metadata.ts:26,30` (comment origin-resolver + luật www) | Umbrella giao cho Phase 2 ("comment + origin resolver theo D5") | Phase 2 |
| `apps/web/src/lib/metadata.ts:182-184` (comment hreflang để-dành) | Xác nhận KHÔNG ĐỔI — không có `alternates.languages` nào tồn tại | Không đổi |
| `apps/web/src/lib/metadata.ts:187-190` (`twitter.site` handle) | Cơ hội, không phải nghĩa vụ — cần một handle X thật đang sống, chưa có | Phase 6 (nếu/khi có handle) |
| `apps/web/src/lib/feed.ts:61,69,116` (Atom tag-authority `tagHost`) | **Hệ quả D4**: KHÔNG ghim vào hằng số — code hiện tại đã tự động resolve theo `channel.origin`/`feedUrl`, không cần sửa gì cả khi domain đổi ở Phase 6 | Không cần sửa (tự động đúng khi Phase 6 chạy) |
| `apps/web/src/lib/feed.ts:123` (`<rights>© Asia Press Centre Group (APCG)</rights>`) | APCG, không phải publication | Không đổi, vĩnh viễn |
| `apps/web/src/components/article/article-body.tsx:118-120` (docblock nhắc `@dtw/ui`) | D6 hoãn | Phase 7 (tuỳ chọn, nếu D6 kích hoạt) |
| `packages/ui/package.json`, `packages/ui/tsconfig.json`, `apps/web/next.config.ts:10` (`transpilePackages`), 17 file `import … from "@dtw/ui"` | D6 hoãn có chủ đích | Phase 7 (tuỳ chọn) |
| `apps/web/src/components/cookie-banner.tsx:8`, `theme-provider.tsx:16`, `apps/web/src/lib/i18n.tsx:27`, `article-views.ts:31`, `paywall.ts:26`, `header.tsx:20` (6 storage key `dtw-*`) | D14 — đổi tên storage key, nhưng lý do đổi ("miễn phí vì domain đã đổi") chỉ đúng **sau khi** domain thật sự đổi ở Phase 6; đổi sớm ở Phase 4 không sai kỹ thuật nhưng phá vỡ nhóm-theo-lý-do của umbrella | Phase 6 |
| `apps/web/next.config.ts:40-45` (redirect rule theo host) | **Hệ quả D4** — không được tồn tại ở bất kỳ đâu trong 8 phase | Không bao giờ làm |
| `apps/web/.env.example`, root `.env.example`, `turbo.json` | Env/build config | Phase 2 (apex→www) / Phase 6 (RESEND_FROM_DOMAIN, DTW_DASHBOARD_REFRESH_TOKEN) |
| `apps/web/src/app/sitemap.ts`, `apps/web/src/app/robots.ts` | Tài liệu tham chiếu xác nhận rõ "KHÔNG SỬA CODE" — tự rebase qua `siteOrigin()` | Không đổi |
| `apps/web/src/app/api/health/cms/route.ts:19,26`, `apps/web/src/lib/central-api.ts:83` | Chỉ là comment vận hành, không phải copy hiển thị cho reader | Có thể gộp vào Phase 4 như dọn-dẹp phụ (mục 8 dưới) hoặc để Phase 7; plan này **chọn gộp vào Phase 4** vì chi phí bằng 0 và giữ tài liệu nội bộ nhất quán — xem bước 8.4 |
| `apps/web/src/app/manifest.ts` — thiếu `id`/`scope` (PWA install migration) | Vấn đề PWA cấu trúc có sẵn từ trước, không phải do rebrand gây ra; sửa nó là một cải tiến sản phẩm riêng, không nằm trong yêu cầu "đổi copy hiển thị" | Không thuộc phase này — ghi nhận, không hành động |
| `design/project/src/article.jsx:95` (chuỗi `"DTW Pro is $12/month…"`) | File tham khảo thiết kế, không phải code triển khai (`all-context.md`: *"design/ — visual reference, NOT code to port"*) | Không đổi — xem mục D9 bên dưới |
| Bất kỳ redirect/Change-of-Address nào | D4 — vĩnh viễn | Không bao giờ |
| Đổi màu brand | D10 | Không bao giờ (trong toàn chương trình) |
| Slug `dtw` (Tenants/registry/publicationId) | D11 — đóng băng vĩnh viễn | Không bao giờ |
| Schema `dtw_auth` / bucket `dtw-media` | D12 — đóng băng vĩnh viễn | Không bao giờ |

---

## Dependency

- **Cần xong trước**: Phase 0 (D1/D2/D8 đã ghi vào `process/context/`, banner superseded-by đã gắn lên `per-page-seo-metadata_PLAN_16-07-26.md`).
- **Khuyến nghị chạy sau Phase 3** (mark thị giác) để tránh hai brand hiện diện song song lâu trên UI — nhưng **không bị chặn kỹ thuật** bởi Phase 3 nếu cần chạy song song.
- **Không phụ thuộc** Phase 1, 2, 5 để bắt đầu code — nhưng **một nhóm con** (mailbox domain, xem Quy tắc Gate bên dưới) không được **deploy** cho tới khi Phase 1 xác nhận MX/SPF/DKIM cho 5 hộp thư mới đã sống.
- **Chặn Phase 6**: umbrella ghi rõ "UI phải sạch trước cutover" — Phase 6 không nên bắt đầu khi Phase 4 còn dở dang.

---

## Bảng chuỗi chuẩn (D1/D2/D8 — trích umbrella §5.1, không bàn lại)

> **BẮT BUỘC đọc kèm: umbrella §5.1.1 — luật phân giải `DTW` → `OTW` hay `Opentechwire`.** Bản Phase 4 trước 09-09-26 quy `DTW`→`OTW` ở mọi nơi, trong khi Phase 5/7 quy `DTW`→`Opentechwire` cho văn xuôi — đúng loại lệch mà chương trình này sinh ra để sửa. Luật đã thống nhất: **nhãn ngắn/token ghép → `OTW`; `DTW` nằm trong một câu hoàn chỉnh → `Opentechwire`**. Các ô "Đề xuất" bên dưới đã được cập nhật theo luật này; nếu gặp một chuỗi không có trong bảng, áp §5.1.1 chứ đừng suy diễn.

| Ngữ cảnh | Chuỗi chuẩn |
|---|---|
| Văn xuôi / metadata / title / alt / JSON-LD `name` | `Opentechwire` |
| Monogram / viết tắt trong copy (không phải asset SVG) | `OTW` |
| Sub-brand studio | `OTW Studio` |
| Cấm tuyệt đối | `OpenTechWire` (PascalCase) |
| Tagline | `Tech Intelligence, Openly Wired` |

**Bản dịch tagline vi/id — DRAFT, cần biên tập viên bản ngữ duyệt trước khi merge** (chỉ 1 call site cần bản dịch thật: `header.tsx:234-238`; mọi vị trí khác là chuỗi tiếng Anh độc lập, không cần dịch):
- vi (draft): `"Tin tức công nghệ, kết nối cởi mở"`
- id (draft): `"Intelijen Teknologi, Terhubung Terbuka"`
- **Không tự ý coi hai bản dịch trên là final.** Đây là bản nháp truyền đạt đúng khái niệm ("openly" = cởi mở/terbuka, không phải chơi chữ "daily"), KHÔNG phải bản dịch đã được xác nhận. EXECUTE phải dán bản nháp này vào một bước review riêng (Slack/PR comment) mời một người nói tiếng Việt/Indonesia bản ngữ duyệt trước khi coi bước header.tsx là xong. Nếu không có ai duyệt được trong thời gian hợp lý, giữ nguyên bản nháp và ghi rõ trong report "chưa qua duyệt bản ngữ" — không chặn cả phase vì một dòng.

---

## Quy tắc GATE cho domain hộp thư (`@dailytechwire.com`)

5 địa chỉ hộp thư duy nhất xuất hiện trong copy: `info@`, `media@`, `partnership@`, `advertising@`, `corrections@` — tất cả `@dailytechwire.com`. Theo tài liệu tham chiếu, các dòng này là **rủi ro cao**: "Mailbox mới; phải đi sau việc provisioning MX/SPF/DKIM" (Phase 1, ngoài repo, do user thực hiện).

Quy tắc chia nhóm dùng xuyên suốt phase này:

- **Nhóm F1 (không gate, sửa ngay)**: mọi chuỗi chỉ chứa TÊN BRAND (`DailyTechWire`/`Dailytechwire`/`DTW`) mà KHÔNG chứa domain email trong cùng chuỗi.
- **Nhóm F2 (GATE — chờ xác nhận Phase 1)**: mọi chuỗi chứa domain `dailytechwire.com` dưới dạng địa chỉ email (`mailto:`, hằng số `EMAIL`, hoặc text thuần). Nếu MỘT chuỗi chứa CẢ brand name LẪN domain email trong cùng một literal (ví dụ `legal/[slug]/page.tsx:40-42`), **toàn bộ chuỗi đó** thuộc nhóm F2 — không tách nửa câu.
- **Trường hợp 2 dòng liền kề tách được**: nếu `const EMAIL = "...@dailytechwire.com"` (F2) và một dòng RIÊNG dùng `` `mailto:${EMAIL}?subject=DTW%20...` `` (subject text độc lập, không chứa domain trực tiếp) → phần subject text (`DTW%20...` → `OTW%20...`) là F1, sửa ngay; chỉ hằng số `EMAIL` bị gate.

**Trước khi deploy/merge nhóm F2**: EXECUTE phải hỏi user xác nhận bằng câu hỏi rõ ràng: *"Phase 1 (Resend + SPF/DKIM/DMARC cho `info@/media@/partnership@/advertising@/corrections@opentechwire.com`) đã xong chưa? Nếu chưa, giữ nhóm F2 ở trạng thái đã-viết-nhưng-chưa-merge."* Nếu user xác nhận chưa xong, Nhóm F2 code có thể **viết sẵn trên một branch riêng hoặc để uncommitted**, nhưng KHÔNG merge vào nhánh chính cho tới khi xác nhận.

---

## Quyết định D9 — đã xác minh: KHÔNG có gì để sửa trong `apps/web/src`

Đã grep xác nhận (`command grep -rn 'DTW Pro' apps/web/src` → 0 kết quả). Chuỗi `"DTW Pro is $12/month, unlimited reading, full Dashboards, member-only Q&As, and zero ads."` **chỉ tồn tại** ở `design/project/src/article.jsx:95` — một file tham khảo thiết kế (`all-context.md`: *"design/ — visual reference, NOT code to port"*), không phải implementation. `apps/web/src/components/article/paywall.tsx:15-16` tự ghi rõ: *"No billing surface exists in Phase 1; Pro/Stripe is out of scope for this program."* `apps/web/src/lib/paywall.ts` không có tên gói nào. `apps/web/src/lib/shell.tsx:20` chỉ có role RBAC `"Pro"` chung chung (không tiền tố brand). `apps/web/src/lib/data.ts:93-94` có một dòng comment + nav item bị comment-out cho `"Pro"` (cũng không tiền tố brand).

**Hành động cho Phase 4**: không sửa file nào cho D9. Ghi lại phát hiện này vào report của phase làm bằng chứng đã-kiểm-tra (không phải bỏ sót). Khi nào billing UI thật được xây (một PLAN/EXECUTE riêng, sau khi `PAYWALL_ENABLED` bật), lần đó phải dùng `"OTW Pro"` ngay từ đầu — không có gì để "trả nợ" ngược ở đây.

---

## Phase Completion Rules

Mượn nguyên từ umbrella (áp dụng cho phase này):

1. **Gate của chính phase** — chạy đúng cổng verification ở §"Verification Evidence" bên dưới.
2. **Regression check** — chạy lại grep tổng để chắc Phase 3 (asset thị giác, nếu đã chạy trước) chưa bị đụng.
3. **Bằng chứng chạy thật** — output lệnh grep/`tsc`/`curl` thật, dán vào report, không suy luận "chắc là đúng".
4. **Đường lỗi được kiểm tra** — nếu một `t()` bị sửa thiếu tham số (ví dụ chỉ sửa 2/3 locale), TypeScript phải bắt được lỗi này qua `tsc --noEmit` (các hàm `t(en, vi, id)` có kiểu tham số bắt buộc theo signature hiện có) — xác nhận điều này đúng bằng cách thử nghiệm một lỗi cố ý trong bản nháp rồi xác nhận `tsc` báo đỏ, trước khi tin tưởng suite này để bắt lỗi thật.
5. **User confirmation** — user xem bằng chứng report và xác nhận trước khi đánh dấu `✅ VERIFIED`. Không có xác nhận, mức cao nhất là `🧪 TESTING`.

Marker: `⏳ PLANNED` · `🔨 CODE DONE` · `🧪 TESTING` · `✅ VERIFIED` · `🚧 BLOCKED`.

Riêng Nhóm F2 (mailbox) và Nhóm G (quyết định AI-disclosure, xem dưới): các nhóm này có thể ở trạng thái `🚧 BLOCKED` ngay cả khi phần còn lại của phase đã `✅ VERIFIED` — đây không phải lỗi, là đúng thiết kế gate.

Ngữ cảnh bắt buộc đọc trước khi EXECUTE: `process/context/all-context.md` (invariant #5 — AI disclosure đã gỡ; invariant #9/#10 — i18n chrome-only, body giữ nguyên ngôn ngữ gốc; invariant #14 — global positioning, không thu hẹp về Asia) và `process/context/tests/all-tests.md` (repo hiện gần như chưa có test tự động — không giả định có sẵn runner nào; xác minh bằng lệnh thật ở mục Verification Evidence thay vì test suite).

---

## Implementation Checklist

### Bước 1 — Baseline trước khi sửa

1.1. Từ root repo, chạy lệnh grep chuẩn của umbrella (giữ nguyên, đầy đủ `--exclude`):
```
command grep -rniE 'dailytechwire|daily ?tech ?wire|\bdtw\b|@dtw/|Tech Intelligence, Wired Daily' . \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=.turbo \
  --exclude-dir=dist --exclude='*.tsbuildinfo' --exclude=pnpm-lock.yaml --exclude-dir=data-exports \
  > /tmp/rebrand-phase4-before.txt
```
Lưu file này vào report của phase làm bằng chứng "trước". **Cảnh báo bắt buộc**: `grep` trần trong môi trường này là ugrep shim tự áp `--ignore-files` + `-I` (bỏ qua binary) — **luôn dùng tiền tố `command `** (umbrella §6) và giữ đủ các `--exclude*` trên; chúng là bắt buộc, không phải phòng hờ.

1.2. Chạy `git status --short` và `git stash list` để xác nhận working tree sạch trước khi bắt đầu (nếu có thay đổi dở dang từ phiên trước, dừng lại hỏi user).

---

### Bước 2 — Nhóm A: `apps/web/src/components/**` (ui-components, §3.1)

| File | Dòng | Hiện tại | Đề xuất | Nhóm |
|---|---|---|---|---|
| `footer.tsx` | 21 | `title: t("DTW", "DTW", "DTW")` | `t("OTW", "OTW", "OTW")` | F1 |
| `footer.tsx` | 42 | `[t("DTW Studio", "DTW Studio", "DTW Studio"), "/studio"]` | `t("OTW Studio", "OTW Studio", "OTW Studio")` | F1 |
| `footer.tsx` | 140 | `Tech Intelligence, Wired Daily` (literal EN trần, không qua `t()`) | `Tech Intelligence, Openly Wired` | F1 |
| `footer.tsx` | 234 | Sau Phase 0: `© 2026 Dailytechwire · Singapore` (Phase 0 bước 19 **đã xoá** mệnh đề `· Member, Trust Project`) | `© 2026 Opentechwire · Singapore` — **chỉ đổi tên brand**. **Chồng lấn có chủ đích với Phase 0 (umbrella §6b.3)**: nếu Phase 0 đã chạy thì mệnh đề Trust Project không còn — khớp theo nội dung **đã rút gọn**; nếu Phase 0 CHƯA chạy, dừng lại và hỏi user thay vì tự xoá mệnh đề đó ở đây (nó là sửa lỗi credential bịa riêng, có chủ sở hữu riêng) | F1 |
| `header.tsx` | 234-238 | `t("Tech Intelligence, Wired Daily", "Tin tức công nghệ, cập nhật hàng ngày", "Intelijen Teknologi, Setiap Hari")` | `t("Tech Intelligence, Openly Wired", <vi draft — xem bảng trên>, <id draft — xem bảng trên>)` | F1 (bản dịch cần duyệt riêng, không chặn merge) |
| `header.tsx` | 633-635 | `t("Enjoying DailyTechWire? Sign in to save…", "Bạn đang thích DailyTechWire?…", "Suka DailyTechWire?…")` | Thay `DailyTechWire`→`Opentechwire` tại chỗ trong cả 3 câu (không phải dịch lại, chỉ thay token brand). Code chết hôm nay (`PAYWALL_ENABLED = false`) — vẫn sửa để tránh lộ brand cũ khi flag bật | F1 |
| `auth-modal.tsx` | 190 | `t("Welcome to DTW", "Chào mừng đến DTW", "Selamat datang di DTW")` | `t("Welcome to OTW", "Chào mừng đến OTW", "Selamat datang di OTW")` | F1 |
| `auth-modal.tsx` | 360 | `t("New to DailyTechWire?", "Mới biết DailyTechWire?", "Baru di DailyTechWire?")` | `t("New to Opentechwire?", "Mới biết Opentechwire?", "Baru di Opentechwire?")` | F1 |
| `article/article-content.tsx` | 98 | `<Link href="/" …>DTW</Link>` (breadcrumb gốc, mọi trang bài viết) | `OTW` | F1 |
| `article/article-content.tsx` | 285-287 | `"Some links in this review earn DTW a commission…"` ×3 locale | Thay `DTW`→**`Opentechwire`** (văn xuôi hoàn chỉnh → tên đầy đủ, umbrella §5.1.1). **Phải khớp byte-for-byte** với chuỗi ở `process/context/integrations/all-integrations.md:136` mà Phase 0 bước 29 sửa | F1 |
| `article/article-content.tsx` | 311 | `<span className="mono">corrections@dailytechwire.com</span>` | `corrections@opentechwire.com` | **F2 — GATE** |
| `article/article-body.tsx` | 139-141 | `"This is a sponsored feature produced by DTW Studio… The DTW newsroom was not involved…"` ×3 | `DTW Studio` → **`OTW Studio`** (token ghép); `The DTW newsroom` → **`The Opentechwire newsroom`** (văn xuôi). Hai token trong CÙNG một câu đi theo **hai** quy tắc khác nhau — xem umbrella §5.1.1, đừng sed đồng loạt | F1 |
| `pillar/pillar-content.tsx` | 138 | `DTW · {pillarLabel}` | `OTW · {pillarLabel}` | F1 |
| `home/home-hero.tsx` | 33 | `label="DTW HERO"` | `label="OTW HERO"` | F1 |
| `dashboards/funding-tracker.tsx` | 102 | `a.download = "dtw-funding-tracker.csv"` | `"otw-funding-tracker.csv"` | F1 |

**Xác nhận đã grep, KHÔNG đụng**: `wordmark.tsx` (toàn file → Phase 3), `header.tsx:20` (`NUDGE_KEY` → Phase 6/D14), `article-body.tsx:118-120` (docblock `@dtw/ui` → Phase 7/D6), `footer.tsx:63,64,66` (→ Phase 6 cho 63/64; F2-GATE cho 66, xem Bước 4).

---

### Bước 3 — Nhóm B: dead-code / feature-flagged-off (dễ quên vì không render)

| File | Dòng | Hiện tại | Đề xuất | Ghi chú |
|---|---|---|---|---|
| `packages/ui/src/disclosure-box.tsx` | 20 | `"This is a sponsored feature produced by DTW Studio for the partner above. The DTW newsroom was not involved in writing or editing."` (`DEFAULT_SPONSORED_BODY`) | `DTW Studio`→`OTW Studio`; `The DTW newsroom`→`The Opentechwire newsroom` (§5.1.1). Chuỗi phải khớp **chính xác** bản ở `article-body.tsx:139-141` | **Code chết đã xác nhận**: consumer duy nhất (`article-body.tsx:133`) luôn truyền `body` tường minh, `resolvedBody` fallback này không bao giờ chạy trong luồng hiện tại. Vẫn sửa vì có thể trở thành live nếu một consumer tương lai không truyền `body` |
| `components/home/sponsored-strip.tsx` | 44 | `⬢ Paid Partner Content · DTW Studio Presents` | `OTW Studio Presents` | **Code chết đã xác nhận qua grep**: `command grep -rln 'SponsoredStrip' apps/web/src --include='*.tsx'` chỉ trả về chính file này — không có importer nào |
| `components/home/sponsored-strip.tsx` | 53 | `Produced by DTW Studio for the partner below. The DTW newsroom was not involved.` | `OTW Studio` + `The Opentechwire newsroom` (§5.1.1) | như trên |
| `components/home/best-of-reviews.tsx` | 70 | `title="Some links earn DTW a commission. Reviews are independent and never paid for by manufacturers."` | Thay `DTW`→**`Opentechwire`** (văn xuôi, §5.1.1) | **Đã xác nhận KHÔNG phải code chết theo nghĩa "không import"** — `apps/web/src/app/(reader)/page.tsx:11` có import thật (`import { BestOfReviews } from "@/components/home/best-of-reviews"`) và render tại dòng 182, nhưng bị khoá bởi `const SHOW_BEST_OF_REVIEWS = false;` (dòng 41 cùng file). Sửa để tránh lộ brand cũ nếu flag bật trong tương lai |

---

### Bước 4 — Nhóm F2 (GATE): domain hộp thư `@dailytechwire.com`

**STOP — hỏi user trước khi merge nhóm này**, theo Quy tắc Gate ở trên. Có thể viết code trên nhánh/uncommitted trước, nhưng không merge tới khi có xác nhận Phase 1.

| File | Dòng | Hiện tại | Đề xuất | Ghi chú |
|---|---|---|---|---|
| `footer.tsx` | 66 | `["Email", "mail", "mailto:info@dailytechwire.com"]` | `mailto:info@opentechwire.com` | |
| `article-content.tsx` | 311 | (đã liệt kê ở Bước 2, nhắc lại vì thuộc F2) | `corrections@opentechwire.com` | |
| `about/page.tsx` | 39 | `["Press inquiries", "media@dailytechwire.com"]` | `media@opentechwire.com` | |
| `about/page.tsx` | 40 | `["Partnerships", "partnership@dailytechwire.com"]` | `partnership@opentechwire.com` | |
| `newsroom/page.tsx` | 115 | `["Press inquiries", "media@dailytechwire.com"]` | `media@opentechwire.com` | |
| `newsroom/page.tsx` | 116 | `["Partnerships", "partnership@dailytechwire.com\ndailytechwire.com"]` | `"partnership@opentechwire.com\nopentechwire.com"` | render dạng text thuần (`whiteSpace:"pre-line"`), không phải `mailto:` |
| `press/page.tsx` | 10 | `const PRESS_EMAIL = "media@dailytechwire.com"` | `"media@opentechwire.com"` | dùng ở L109,123,140,141,260,264 — sửa 1 hằng số, không cần sửa 6 chỗ dùng |
| `contact/page.tsx` | 22 | `email: "info@dailytechwire.com"` | `"info@opentechwire.com"` | |
| `contact/page.tsx` | 32 | `email: "media@dailytechwire.com"` | `"media@opentechwire.com"` | |
| `contact/page.tsx` | 42 | `email: "partnership@dailytechwire.com"` | `"partnership@opentechwire.com"` | |
| `advertise/page.tsx` | 10 | `const EMAIL = "advertising@dailytechwire.com"` | `"advertising@opentechwire.com"` | dùng ở L732, và trong `MAILTO` ở L11 |
| `studio/page.tsx` | 10 | `const EMAIL = "partnership@dailytechwire.com"` | `"partnership@opentechwire.com"` | dùng ở L360, và trong `MAILTO` ở L11 |
| `legal/[slug]/page.tsx` | 80-82 | `"…Questions about a specific jurisdiction go to info@dailytechwire.com."` ×3 | `info@opentechwire.com` ×3, giữ nguyên câu | Không chứa brand name — pure F2 |
| `legal/[slug]/page.tsx` | 221-223 | `"Email info@dailytechwire.com or use the export…"` ×3 | `info@opentechwire.com` ×3 | GDPR export/delete — pure F2 |
| `legal/[slug]/page.tsx` | 237-239 | `"…Reach them at info@dailytechwire.com."` ×3 | `info@opentechwire.com` ×3 | Liên hệ DPO — pure F2 |
| `legal/[slug]/page.tsx` | 131-133 | `"…Continued use after a change means acceptance… Questions: info@dailytechwire.com."` ×3 | `info@opentechwire.com` ×3 | pure F2 |
| `legal/[slug]/page.tsx` | 311, 320 | `href="mailto:info@dailytechwire.com"` / text `info@dailytechwire.com` | `info@opentechwire.com` | pure F2 |
| `legal/[slug]/page.tsx` | 40-42 | `"We built Dailytechwire to be read, not to be mined… write to info@dailytechwire.com…"` ×3 | `"We built Opentechwire to be read… write to info@opentechwire.com…"` ×3 | **CHUỖI GỘP** — brand + email trong cùng câu, giữ nguyên khối, KHÔNG tách. Toàn bộ block này là F2 |
| `legal/[slug]/page.tsx` | 115-117 | `"The journalism… on Dailytechwire are owned by APCG… write to partnership@dailytechwire.com."` ×3 | `"…on Opentechwire… write to partnership@opentechwire.com."` ×3 | **CHUỖI GỘP** — F2 |
| `advertise/page.tsx` | 11 | `` `mailto:${EMAIL}?subject=DTW%20media%20inquiry` `` | subject text `DTW%20media%20inquiry` → `OTW%20media%20inquiry` **có thể sửa ngay (F1)**; `${EMAIL}` tự động theo dòng 10 khi dòng 10 được gate-release | Tách: phần subject = F1, phần `EMAIL` = F2 |
| `studio/page.tsx` | 11 | `` `mailto:${EMAIL}?subject=DTW%20Studio%20inquiry` `` | subject `OTW%20Studio%20inquiry` = F1 ngay; `${EMAIL}` = F2 | như trên |

---

### Bước 5 — Nhóm C: `apps/web/src/lib/data.ts` (mock/sample data)

| Dòng | Hiện tại | Đề xuất |
|---|---|---|
| 1 | `// DTW sample data — ported from design/project/src/data.jsx` | `// Opentechwire sample data — ported from design/project/src/data.jsx` (comment = văn xuôi, §5.1.1) |
| 127 | `role: "DTW"` (fallback author) | `role: "OTW"` |
| 249 | `slug: "dtw-studio-aws-asean"` | `slug: "otw-studio-aws-asean"` — mock data, không phải slug CMS thật, không đụng D11. **CẢNH BÁO**: `apps/web/scripts/seed-payload.ts:219` có **cùng chuỗi slug** nhưng ở đó upsert chạy theo slug (`seed-payload.ts:547`) — đổi ở đó là tạo một row published **thứ hai**, không phải rename. Bước 13 dưới đây ghi rõ: **KHÔNG đổi `seed-payload.ts:219`**. Hai chỗ được phép lệch nhau, đây là chủ đích |
| 254 | `"A DTW Studio Presents feature, produced for AWS ASEAN. The DTW newsroom was not involved…"` | `OTW Studio Presents` (token ghép) + `The Opentechwire newsroom` (văn xuôi) — §5.1.1 |
| 597 | `name: "DTW Awards"` | `"OTW Awards"` |
| 609 | `title: "DTW Daily Brief"` | `"OTW Daily Brief"` (render qua `podcast-strip.tsx` — component đó không có literal brand riêng, chỉ hiển thị `p.title` từ data.ts, không cần sửa `podcast-strip.tsx`) |

---

### Bước 6 — Nhóm D: copy giao dịch (email hệ thống) — **ĐÃ CHUYỂN SANG PHASE 6 (09-09-26)**

**KHÔNG sửa gì ở bước này.** `apps/web/src/lib/email.ts:13` (`FROM` display name) và `apps/web/src/lib/auth.ts:78,84,97,103` (subject/body magic-link + reset-password) từng bị **cả Phase 4 lẫn Phase 6** cùng nhận. Umbrella §6b.3 chốt **Phase 6 là chủ sở hữu duy nhất**.

Lý do (tài liệu tham chiếu §5, dòng "Email deliverability"): display name và 4 chuỗi subject/body phải flip **trong cùng một deploy** với `RESEND_FROM_DOMAIN`. Tách chúng ra Phase 4 tạo ra chính kịch bản mà §5 gọi là "chữ ký của phishing": mail đi từ `Opentechwire <no-reply@dailytechwire.com>` (tên mới, domain cũ) trong suốt khoảng Phase 4 → Phase 6, đầu độc uy tín ngay trước lúc warm-up domain mới xong.

**Việc của Phase 4 tại bước này**: chỉ ghi vào report một dòng xác nhận đã kiểm tra và cố ý bỏ qua, kèm output:
```bash
command grep -n "DailyTechWire" apps/web/src/lib/email.ts apps/web/src/lib/auth.ts
```
Kỳ vọng: vẫn còn đúng 5 dòng (`email.ts:13`, `auth.ts:78,84,97,103`) — **đó là đúng thiết kế, không phải sót**. Nếu đã sạch, nghĩa là Phase 6 đã chạy trước; ghi chú lại chứ đừng "sửa lại".

---

### Bước 7 — Nhóm E: `dashboards/[[...sub]]/page.tsx` → `buildMetadata`

7.1. File: `apps/web/src/app/(reader)/dashboards/[[...sub]]/page.tsx`, dòng 25-31. Hiện tại:
```
export function generateMetadata(): Metadata {
  return {
    title: "AI Leaderboard | Dashboards | Dailytechwire",
    description: "Weekly-refreshed AI model leaderboard — general, reasoning, coding, math, search, and vision scores plus pricing, sourced from LLM Stats.",
  };
}
```
Chuyển sang gọi `buildMetadata` (mẫu chính xác lấy từ `apps/web/src/app/(reader)/briefing/briefing-view.tsx:20-31`, cùng pattern với `pillarMetadata`):
- Thêm import `buildMetadata, DEFAULT_OG_IMAGE` từ `@/lib/metadata` vào đầu file (hiện file này chưa import gì từ `@/lib/metadata`).
- `title`: `"AI Leaderboard | Dashboards"` (bỏ hẳn `" | Dailytechwire"` — root layout's `template: "%s – Opentechwire"` tự bọc thêm brand, tránh nhân đôi như bug hiện tại).
- `description`: giữ nguyên nguyên văn (không chứa brand token nào cần sửa).
- `canonicalPath: "/dashboards"` (route thật của trang, hiện đang **thiếu hẳn** — đây là phần "canonical thiếu" theo tài liệu tham chiếu).
- `image: DEFAULT_OG_IMAGE`, `type: "website"` (đây là phần "OG block thiếu").
- Đổi tên hàm từ `generateMetadata` sang `export const metadata: Metadata = buildMetadata({...})` (static object) NẾU không có phần nào của trang phụ thuộc runtime — kiểm tra: hàm hiện tại không dùng `params`/`searchParams`/async nào, nên có thể là static `export const metadata` giống mẫu `briefing/page.tsx:6`. Nếu EXECUTE thấy lý do kỹ thuật phải giữ dạng hàm `generateMetadata()`, giữ nguyên dạng hàm nhưng vẫn gọi `buildMetadata()` bên trong — không bắt buộc đổi sang static nếu có rủi ro không lường trước, ghi rõ lựa chọn nào được dùng trong report.

---

### Bước 8: Nhóm F: seo-metadata — copy hiển thị (§3.2, phần không phải Phase 2/3/6)

| File | Dòng | Hiện tại | Đề xuất |
|---|---|---|---|
| `apps/web/src/app/layout.tsx` | 36 | `default: "DailyTechWire"` | `"Opentechwire"` |
| `apps/web/src/app/layout.tsx` | 37 | `template: "%s – DailyTechWire"` | `"%s – Opentechwire"` |
| `apps/web/src/app/layout.tsx` | 39 | `description: "Tech Intelligence, Wired Daily."` | `"Tech Intelligence, Openly Wired."` |
| `apps/web/src/app/layout.tsx` | 44 | `{ url: "/rss.xml", title: "DailyTechWire" }` | `title: "Opentechwire"` |
| `apps/web/src/app/layout.tsx` | 48 | `siteName: "DailyTechWire"` (openGraph) | `"Opentechwire"` |
| `apps/web/src/app/(reader)/layout.tsx` | 37 | `name: "DailyTechWire"` (JSON-LD `WebSite`) | `"Opentechwire"` — **cộng thêm** `alternateName: "DailyTechWire"` ngay dòng dưới (khuyến nghị của tài liệu tham chiếu để Google khớp lại entity qua đổi tên miền; giữ khoảng ~12 tháng kể từ Phase 6 cutover, ghi một `// TODO(rebrand): remove alternateName after ~12mo post-cutover, see reference doc §3.2` để Phase 7/dọn dẹp sau tìm lại được) |
| `apps/web/src/lib/metadata.ts` | 69 | `alt: "DailyTechWire – Tech Intelligence, Wired Daily"` | `"Opentechwire – Tech Intelligence, Openly Wired"` |
| `apps/web/src/lib/metadata.ts` | 101 | comment: `` `%s – DailyTechWire` `` template | Cập nhật comment sang `Opentechwire` |
| `apps/web/src/lib/metadata.ts` | 153 | `siteName: "DailyTechWire"` (nhánh `article`) | `"Opentechwire"` |
| `apps/web/src/lib/metadata.ts` | 163 | `siteName: "DailyTechWire"` (nhánh `website`) | `"Opentechwire"` |
| `apps/web/src/lib/metadata.ts` | 178 | `{ url: "/rss.xml", title: "DailyTechWire" }` | `title: "Opentechwire"` |
| `apps/web/src/app/rss.xml/route.ts` | 17 | `title: "DailyTechWire"` | `"Opentechwire"` |
| `apps/web/src/app/rss.xml/route.ts` | 18 | `subtitle: "Tech Intelligence, Wired Daily."` | `"Tech Intelligence, Openly Wired."` |
| `apps/web/src/app/(reader)/[pillar]/rss.xml/route.ts` | 36 | `` title: `DailyTechWire — ${heading}` `` | `` `Opentechwire — ${heading}` `` |
| `apps/web/src/app/(reader)/[pillar]/rss.xml/route.ts` | 37 | `subtitle: pillarDoc.description ?? "Tech Intelligence, Wired Daily."` | fallback → `"Tech Intelligence, Openly Wired."` |
| `apps/web/src/app/(reader)/[pillar]/pillar-view.tsx` | 29 | `pillarDoc.description ?? "Tech Intelligence, Wired Daily."` | `"Tech Intelligence, Openly Wired."` |
| `apps/web/src/app/(reader)/[pillar]/pillar-view.tsx` | 45 | `` title: `DailyTechWire — ${heading}` `` | `` `Opentechwire — ${heading}` `` |
| `apps/web/src/app/(reader)/page.tsx` | 51-53 | comment: `` `title.default` ("DailyTechWire") verbatim… "%s – DailyTechWire"… "DailyTechWire – DailyTechWire" `` | cập nhật comment sang `Opentechwire` |
| `apps/web/src/app/(reader)/page.tsx` | 59-60 | comment: `"Describes what DTW actually publishes…DTW is global"` | cập nhật `DTW`→`OTW`/`Opentechwire` cho khớp thực tế |
| `apps/web/src/app/(reader)/page.tsx` | 63 | `"DailyTechWire tracks global tech and AI: funding rounds, tech-stock moves, AI model benchmarks and rankings, and deep-dive reporting from Asia and the world."` | `"Opentechwire tracks global tech and AI: …"` (giữ nguyên phần còn lại nguyên văn) — **đã đo**: chuỗi cũ 157 ký tự, chuỗi mới 156 ký tự, vẫn nằm trong dải 150-160 mà comment gốc (dòng 56-58, phần chưa trích) yêu cầu |
| `apps/web/src/app/(reader)/briefing/briefing-view.tsx` | 22 | `"The Dailytechwire Brief — twice-daily editions rounding up the tech day…"` | `"The Opentechwire Brief — twice-daily editions…"` |
| `apps/web/src/app/llms.txt/route.ts` | 33 | `` `# DailyTechWire `` (heading Markdown) | `` `# Opentechwire `` |
| `apps/web/src/app/llms.txt/route.ts` | 35 | `DailyTechWire is a global, digital-native technology publication with an Asian vantage point…` | `Opentechwire is a global, digital-native technology publication with an Asian vantage point — funding and tech-stock coverage, AI benchmarks and rankings, and deep-dive editorial. Published by Asia Press Centre Group (APCG), an independent newsroom based in Singapore, founded 2023. Formerly published as DailyTechWire.` — thêm câu cuối theo khuyến nghị tài liệu tham chiếu để crawler AI không đánh mất liên kết lịch sử |
| `apps/web/src/app/not-found.tsx` | 65 | `aria-label={t("Search DailyTechWire", "Tìm kiếm DailyTechWire", "Cari DailyTechWire")}` | `t("Search Opentechwire", "Tìm kiếm Opentechwire", "Cari Opentechwire")` |
| `apps/web/payload.config.ts` | 51 | `meta: { titleSuffix: "— DailyTechWire" }` | `"— Opentechwire"` |
| `apps/web/src/lib/feed.ts` | 21 | `/** Feed display title, e.g. "DailyTechWire" or "DailyTechWire — AI". */` | cập nhật ví dụ trong docblock sang `"Opentechwire"` |
| `apps/web/src/lib/feed.ts` | 122 | `` `  <author><name>DailyTechWire</name></author>` `` | `` `  <author><name>Opentechwire</name></author>` `` |
| `apps/web/src/app/(reader)/reset-password/page.tsx` | 85 | `t("Back to DailyTechWire →", "Về DailyTechWire →", "Kembali ke DailyTechWire →")` | Thay `DailyTechWire`→`Opentechwire` ×3 |

**Xác nhận KHÔNG đụng**: `feed.ts:61,69,116,123`, `metadata.ts:26,30,84,90-91,182-190` (chi tiết lý do ở bảng "Ngoài phạm vi" phía trên), `sitemap.ts`, `robots.ts`, `vercel.json`.

---

### Bước 9 — Nhóm G: editorial-pages (§3.3), phần KHÔNG gate (F1), 3 locale

**Bẫy phải tránh khi sửa** (trích nguyên văn tài liệu tham chiếu §3.3): (a) file trộn lẫn `Dailytechwire` và `dailytechwire` viết thường **trong cùng file** — không dùng lệnh thay thế phân biệt hoa-thường một cách mù quáng, phải xử lý từng dòng; (b) câu dính chùm nhắc cả publication lẫn APCG trong một mệnh đề — **APCG, địa chỉ Bugis Cube, vai trò Cheryl Tan tại APCG giữ nguyên**, chỉ đổi tên publication.

| File | Dòng | Hiện tại | Đề xuất |
|---|---|---|---|
| `about/page.tsx` | 31 | `["sponsored", "Sponsored & Affiliate", "DTW Studio rules + commission disclosure."]` | `"OTW Studio rules + commission disclosure."` |
| `about/page.tsx` | 75 (vi) | `Dailytechwire là ấn phẩm công nghệ của{" "}` | `Opentechwire là ấn phẩm công nghệ của{" "}` |
| `about/page.tsx` | 81 (id) | `Dailytechwire adalah publikasi teknologi dari{" "}` | `Opentechwire adalah publikasi teknologi dari{" "}` |
| `about/page.tsx` | 87 (en) | `Dailytechwire is the technology title of{" "}` | `Opentechwire is the technology title of{" "}` |
| `about/page.tsx` | 285 | `Dailytechwire is its technology title.` (chỉ có bản EN) | `Opentechwire is its technology title.` |
| `newsroom/page.tsx` | 94 | `role: "Editor-in-Chief, Dailytechwire / Group Editor"` | `"Editor-in-Chief, Opentechwire / Group Editor"` |
| `newsroom/page.tsx` | 133 (vi) | `Dailytechwire là ấn phẩm công nghệ của{" "}` | `Opentechwire là ấn phẩm công nghệ của{" "}` |
| `newsroom/page.tsx` | 140 (id) | `Dailytechwire adalah publikasi teknologi dari{" "}` | `Opentechwire adalah publikasi teknologi dari{" "}` |
| `newsroom/page.tsx` | 147 (en) | `Dailytechwire is the technology title of{" "}` | `Opentechwire is the technology title of{" "}` |
| `newsroom/page.tsx` | 436 | `Editor-in-Chief, Dailytechwire · Asia Press Centre Group` | `Editor-in-Chief, Opentechwire · Asia Press Centre Group` |
| `newsroom/page.tsx` | 448-450 | `…Editor-in-Chief of dailytechwire, where she sets…` (**viết thường — bẫy casing #1**) | `…Editor-in-Chief of Opentechwire, where she sets…` (sentence case theo D1, không giữ lowercase) |
| `newsroom/page.tsx` | 706-708 | `t("← The trust & standards view of dailytechwire", "← Trang minh bạch & chuẩn mực của dailytechwire", "← Tampilan kepercayaan & standar dailytechwire")` (**bẫy casing #2**) | `t("← The trust & standards view of Opentechwire", "← Trang minh bạch & chuẩn mực của Opentechwire", "← Tampilan kepercayaan & standar Opentechwire")` |
| `advertise/page.tsx` | 202 | `t("Advertise with DTW", "Quảng cáo cùng DTW", "Beriklan dengan DTW")` | `t("Advertise with OTW", "Quảng cáo cùng OTW", "Beriklan dengan OTW")` |
| `advertise/page.tsx` | 320 | `t("Why DTW", "Vì sao chọn DTW", "Kenapa DTW")` | `t("Why OTW", "Vì sao chọn OTW", "Kenapa OTW")` |
| `advertise/page.tsx` | 496 | `t("Who reads DTW", "Ai đọc DTW", "Siapa pembaca DTW")` | `t("Who reads OTW", "Ai đọc OTW", "Siapa pembaca OTW")` |
| `advertise/page.tsx` | 153-155 | `"…produced and clearly labelled by DTW Studio."` ×3 | Thay `DTW Studio`→`OTW Studio` ×3 |
| `advertise/page.tsx` | 157 | `t("via DTW Studio →", "qua DTW Studio →", "lewat DTW Studio →")` | `t("via OTW Studio →", "qua OTW Studio →", "lewat OTW Studio →")` |
| `advertise/page.tsx` | 234-236 | `"…read Dailytechwire to understand what is actually happening in technology."` ×3 | Thay `Dailytechwire`→`Opentechwire` ×3, giữ nguyên câu |
| `advertise/page.tsx` | 622-624 | `"…produced by DTW Studio, not our reporters."` ×3 | Thay `DTW Studio`→`OTW Studio` ×3 |
| `advertise/page.tsx` | 11 (phần subject) | `subject=DTW%20media%20inquiry` (chỉ phần subject, `${EMAIL}` là F2 — xem Bước 4) | `subject=OTW%20media%20inquiry` |
| `studio/page.tsx` | 40 (chỉ vi) | `…phân phối trên các kênh của DTW.` (**locale drift** — chỉ bản vi nhắc brand) | `…phân phối trên các kênh của Opentechwire.` (văn xuôi, §5.1.1) |
| `studio/page.tsx` | 92 | `t("DTW Studio", "DTW Studio", "DTW Studio")` | `t("OTW Studio", "OTW Studio", "OTW Studio")` |
| `studio/page.tsx` | 123-125 | `"DTW Studio is our branded-content team…"` (en=1 token, vi=2, id=2 — **số token khác nhau theo locale, không giả định 1:1**) | Thay từng token `DTW`→`OTW` tại đúng vị trí trong mỗi locale, giữ nguyên số lượng token gốc của từng câu |
| `studio/page.tsx` | 11 (phần subject) | `subject=DTW%20Studio%20inquiry` | `subject=OTW%20Studio%20inquiry` |
| `legal/[slug]/page.tsx` | 91-93 | `"…when you use dailytechwire."` (vi/id/en, **viết thường**, không có email trong cùng câu) | `"…when you use Opentechwire."` — sửa cả brand lẫn casing (sentence case theo D1); **KHÔNG đụng** phần `"agreement between you and Asia Press Centre Group (APCG)"` trong cùng câu |
| `legal/[slug]/page.tsx` | 166-168 | `"…if you ever find a cookie on Dailytechwire that does not fit…"` ×3 (không có email) | Thay `Dailytechwire`→`Opentechwire` ×3 |
| `newsletters/newsletters-content.tsx` | 73-75 | `t("Read Dailytechwire the way you read.", "Đọc Dailytechwire theo cách của bạn.", "Baca Dailytechwire sesuai keinginan.")` | Thay `Dailytechwire`→`Opentechwire` ×3 |
| `trust/[slug]/trust-content.tsx` | 153-155 | `"DTW does not accept review units… separate from DTW Studio…"` ×3 | `DTW does not accept` → **`Opentechwire does not accept`** (văn xuôi); `DTW Studio` → **`OTW Studio`** (token ghép). Đây là ca kiểm thử tốt nhất cho §5.1.1 — hai dạng nằm cạnh nhau trong một câu |
| `trust/[slug]/trust-content.tsx` | 268-270 | `t("DTW Studio and review rules", "Quy tắc DTW Studio và đánh giá", "Aturan DTW Studio dan ulasan")` | Thay `DTW`→`OTW` ×3 |
| `trust/[slug]/trust-content.tsx` | 274 | `t("DTW Studio", "DTW Studio", "DTW Studio")` | `t("OTW Studio", "OTW Studio", "OTW Studio")` |
| `reset-password/page.tsx` | 85 | (đã liệt kê ở Bước 8, thuộc §3.3 theo tài liệu tham chiếu nhưng gộp chung nhóm brand-name F1) | — |

**Ghi chú, không phải hành động bắt buộc**: `briefing/briefing-content.tsx:134` (`"AM Brief · PM Brief"`) và `:142-144` (`"Twice daily, morning and evening SGT…"`), `newsletters-content.tsx:83-85` (`"Daily briefs, weekly digests, one bi-weekly."`) — không chứa token brand `Dailytechwire`/`DTW`, chỉ mô tả nhịp xuất bản thực tế (vẫn đúng bất kể tên brand). Không sửa trong phase này. `advertise/page.tsx:103-105` có locale drift có sẵn từ trước (`"six titles"` EN vs `"enam newsletter"` ID) — không do rebrand gây ra, không sửa trong phase này (tránh scope creep sang QA i18n không liên quan).

---

### Bước 10 — Nhóm H: QUYẾT ĐỊNH SẢN PHẨM cần hỏi user trước khi sửa (không phải D1-D15)

`apps/web/src/app/(reader)/trust/[slug]/trust-content.tsx`, dòng 184-187 (comment KNOWN GAP đã có sẵn trong code) và 191-217 (nội dung khối `ai:` mô tả nhãn "AI-assisted"): trang `/trust/ai` vẫn mô tả *"Articles that use AI for any allowed task carry an 'AI-assisted' label at the top, middle, and bottom of the article. The label cannot be turned off."* — nhưng nhãn này đã bị gỡ khỏi UI thật theo invariant #5 (quyết định sản phẩm 2026-06-05). Đây là một tuyên bố minh bạch **sai sự thật đã được ghi thành văn công khai**, càng nghiêm trọng hơn khi publication vừa đổi tên thành "Open"-something.

**Trước khi sửa 2 dòng này, hỏi user chính xác câu**: *"`/trust/ai` hiện mô tả nhãn AI-assisted mà UI thật đã gỡ (invariant #5, 2026-06-05). Đóng known-gap này trong Phase 4 (viết lại đoạn `ai:` để khớp thực tế — không nhắc lại UI AI-badge), hay để nguyên và theo dõi riêng ở một backlog item?"*

- Nếu user chọn **đóng ngay**: viết lại nội dung khối `ai:` (kicker + 4 hàng `body`) để phản ánh đúng chính sách AI thật hiện tại (dùng AI cho dịch/gỡ băng/tóm tắt/tìm kiếm/soát lỗi, luôn có người kiểm tra, KHÔNG có nhãn hiển thị công khai) — đây là việc VIẾT CHÍNH SÁCH MỚI, không phải chỉ đổi brand token, nên cần một bước review nội dung riêng trước khi merge (không phải review kỹ thuật, review chính sách biên tập).
- Nếu user chọn **để nguyên**: không sửa 2 dòng này trong Phase 4; ghi vào report của phase là "known-gap giữ nguyên theo quyết định user ngày [X], theo dõi tại [nơi user chỉ định — ví dụ `process/features/about-trust/backlog/`]".
- **Không tự ý chọn phương án nào** nếu chưa hỏi.

---

### Bước 11 — Dọn dẹp phụ, chi phí bằng 0 (comment vận hành)

11.1. `apps/web/src/app/api/health/cms/route.ts:19,26` — comment nhắc `dailytechwire.com` và `DTW` → cập nhật `opentechwire.com`/`OTW` để tài liệu nội bộ không gây hiểu nhầm cho engineer đọc route health-check này sau này.

11.2. `apps/web/src/lib/central-api.ts:83` — comment `"…resolves that against the site being viewed — dailytechwire.com —"` → cập nhật `opentechwire.com`. Lưu ý: tenant slug thật KHÔNG nằm trong repo này (Central trả về), đây chỉ là ví dụ minh hoạ trong comment.

---

### Bước 13 — Nhóm I: `.dtw-tip` (đổi NGUYÊN TỬ cả 6 chỗ) — BỔ SUNG 09-09-26

Soát chéo 9 plan phát hiện `.dtw-tip` **không được phase nào nhận** dù umbrella §3 có nhắc nó trong phạm vi Phase 4 (xem umbrella §6b.1). Nay Phase 4 là chủ sở hữu.

| File | Dòng | Hiện tại | Đề xuất |
|---|---|---|---|
| `apps/web/src/app/globals.css` | 424 | `.dtw-tip {` | `.otw-tip {` |
| `apps/web/src/app/globals.css` | 428 | `.dtw-tip::after {` | `.otw-tip::after {` |
| `apps/web/src/app/globals.css` | 449 | `.dtw-tip:hover::after,` | `.otw-tip:hover::after,` |
| `apps/web/src/app/globals.css` | 450 | `.dtw-tip:focus::after {` | `.otw-tip:focus::after {` |
| `apps/web/src/components/dashboards/ai-leaderboard.tsx` | 133 | `className="dtw-tip"` | `className="otw-tip"` |
| `apps/web/src/components/home/dashboards-teaser.tsx` | 198 | `className="dtw-tip"` | `className="otw-tip"` |

**Đổi cả 6 trong CÙNG một commit.** Sót một chỗ là tooltip hỏng **mà không có build error nào** (`className` là chuỗi tự do, TypeScript không kiểm) — kiểu hỏng âm thầm, không phải rủi ro lý thuyết.

Cũng trong `globals.css`: dòng 20 comment `/* DTW coral, softened (design refresh 2026-06-14) */` → đổi `DTW` thành `Opentechwire` (§5.1.1). **Giá trị hex `#D4623C` không đổi** (D10). Comment song sinh ở `process/context/uxui/all-uxui.md:74` do Phase 0 bước 27 sửa — hai chỗ phải nói cùng một điều.

Verify:
```bash
command grep -rn "dtw-tip" apps/web/src   # kỳ vọng 0
command grep -rn "otw-tip" apps/web/src   # kỳ vọng đúng 6 dòng
```

### Bước 14 — Nhóm J: bề mặt Payload/CMS trong `dtw-web` — BỔ SUNG 09-09-26

| File | Dòng | Hiện tại | Đề xuất |
|---|---|---|---|
| `apps/web/src/payload/collections/Articles.ts` | 31 | `"Every story DTW publishes. Engine drafts flow in via API; editors review here."` | `"Every story Opentechwire publishes. …"` (văn xuôi, §5.1.1). Chuỗi brand DUY NHẤT trên cả 14 collection + 2 global; biên tập viên nhìn thấy nó trong `/admin` |
| `apps/web/src/payload/payload-types.ts` | 318 | JSDoc sinh tự động, mirror dòng trên | **REGENERATE, không sửa tay**: `pnpm --filter web payload generate:types`. Commit file sinh ra trong cùng commit với `Articles.ts` |

### Bước 15 — Nhóm K: `apps/web/scripts/seed-payload.ts` — BỔ SUNG 09-09-26

Tài liệu tham chiếu §3.6 liệt kê file này nhưng **không phase nào nhận nó**. Nay thuộc Phase 4.

| Dòng | Hiện tại | Đề xuất |
|---|---|---|
| 219 | `slug: "dtw-studio-aws-asean"` | **KHÔNG ĐỔI.** Upsert chạy theo slug (dòng 547) — đổi là tạo một row published **thứ hai**, không phải rename. Nếu sau này muốn đổi thật, đó là một plan riêng có kèm redirect cho URL đang live |
| 224 | `"A DTW Studio Presents feature… The DTW newsroom was not involved…"` | `OTW Studio Presents` + `The Opentechwire newsroom` — khớp **chính xác** `data.ts:254` |
| 233 | body Lexical: `"…produced by DTW Studio for AWS ASEAN; the DTW newsroom was not involved…"` | Như trên |
| 267 | `"Every article on Dailytechwire that used an AI tool carries a disclosure box…"` | **Đây là lần thứ tư của lời hứa `/trust/ai` chưa được giữ** (invariant #5 đã gỡ nhãn AI-assisted từ 2026-06-05). **Xử lý CÙNG quyết định Nhóm H (Bước 10)**: nếu user chọn đóng known-gap thì viết lại cả dòng cho khớp chính sách thật; nếu user chọn giữ nguyên thì **chỉ** đổi `Dailytechwire`→`Opentechwire` và ghi vào report rằng câu này vẫn mô tả sai thực tế |
| 455 | `name: "DTW Admin"` | `"OTW Admin"` (nhãn ngắn, §5.1.1). Có guard ở dòng 445-452 — bỏ qua nếu email admin đã tồn tại, nên không update admin prod đã seed |
| 64-65, 87 | comment: `DTW byline pool`, `"awards" / DTW Awards` | `DTW byline pool` → `Opentechwire byline pool` (comment = văn xuôi); `DTW Awards` → `OTW Awards` (token ghép, khớp `data.ts:597`). **Nội dung pool 10 bút danh KHÔNG đổi** — phải khớp byte-for-byte `content-engine/src/lib/publications/dtw/index.ts:30-41`, mà Phase 5 cũng không đổi |

### Bước 16 — Nhóm L: `demos/*.html` (được git track) — BỔ SUNG 09-09-26

Hai file này được git track, chứa **bản copy thứ 4 của lockup** cộng **2 storage key thứ 7/8** mà D14 (chỉ liệt 6 key) không bao phủ. Không phase nào nhận chúng.

| File | Dòng | Hiện tại | Đề xuất |
|---|---|---|---|
| `demos/ai-leaderboard-demo.html` | 6 | `<title>… DTW Dashboards (demo)</title>` | `OTW Dashboards (demo)` |
| `demos/ai-leaderboard-demo.html` | 307, 308 | `<span class="logo-badge">DTW</span>`, `<span class="wordmark">dailytechwire…` | `OTW` + `opentechwire` (lockup thị giác → chữ thường, D1) |
| `demos/ai-leaderboard-demo.html` | 322, 424, 436, 437 | chuỗi hiển thị + `LS_KEY = "dtw-llmstats-key"` + `LS_THEME = "dtw-theme"` | Chuỗi hiển thị theo §5.1.1; 2 key → `otw-llmstats-key`, `otw-theme` |
| `demos/ai-leaderboard-table-preview.html` | 543 | `const LS = "dtw-theme"` | `"otw-theme"` |

**Vì sao ở Phase 4 chứ không phải Phase 6/D14**: đây là file demo tĩnh chạy cục bộ qua `demos/serve-ai-leaderboard.mjs`, **không phải bề mặt production** — lập luận "đổi host đã xoá sạch state nên đổi key là miễn phí" của D14 không áp dụng, và cũng không cần đợi cutover. Tiền tố key mới phải **khớp `otw-`** mà Phase 6 dùng cho 6 key production, để cả repo chỉ có một quy ước.
Phương án thay thế hợp lệ: **xoá hẳn hai file demo** nếu không còn dùng — hỏi user, đừng tự quyết.

### Bước 12 (chạy CUỐI CÙNG) — Sau khi sửa xong Nhóm A-C, E-L (không tính F2-gate, không tính quyết định Nhóm H nếu user chọn hoãn)

12.1. Chạy lại lệnh grep baseline (Bước 1.1) → lưu `/tmp/rebrand-phase4-after.txt`.

12.2. `diff /tmp/rebrand-phase4-before.txt /tmp/rebrand-phase4-after.txt` — mọi dòng biến mất phải khớp với một trong các bảng ở Bước 2-9, 11. Mọi dòng **còn sống sót** trong `after.txt` phải khớp với danh sách "Ngoài phạm vi" (Phase 2/3/6/7, đóng băng D11/D12, hoặc F2-gate/Nhóm-H-hoãn nếu có).

12.3. `pnpm turbo run typecheck` (hoặc `pnpm --filter web tsc --noEmit` nếu turbo chưa cấu hình target này — xác nhận đúng lệnh bằng cách đọc `turbo.json`/`package.json` scripts trước khi chạy) — phải sạch. Đặc biệt chú ý các đối tượng JSON-LD (`(reader)/layout.tsx`) và `Metadata` type ở `dashboards/[[...sub]]/page.tsx` sau khi đổi sang `buildMetadata`.

---

## Touchpoints

- **Component chrome đọc (reader-facing UI)**: header, footer, auth-modal, article breadcrumb/disclosure, pillar label, home hero alt, dashboards CSV filename, dead/gated components (disclosure-box, sponsored-strip, best-of-reviews).
- ~~**Copy giao dịch**~~: email FROM name + magic-link/reset-password subject/body — **thuộc Phase 6** (umbrella §6b.3), không phải Phase 4.
- **SEO/structured-data surface**: `<title>`, meta description, OG `site_name`, Atom feed titles (3 route: sitewide + pillar + pillar-view), JSON-LD `WebSite.name` (+ `alternateName` mới), PWA manifest, `llms.txt`, admin panel title suffix, 404 aria-label.
- **Editorial pages, 3 locale**: about, newsroom, advertise, studio, legal (privacy/terms/cookies), newsletters, trust (sponsored-rules phần OTW Studio; AI-disclosure phần chờ quyết định riêng), reset-password.
- **Mock/sample data**: `lib/data.ts` (author role, sponsored dek, awards name, podcast title, slug).
- **Mailbox domain** (GATE, không merge tới khi Phase 1 xác nhận): footer, article-content, about, newsroom, press, contact, advertise, studio, legal.
- **Không chạm**: mọi asset nhị phân (Phase 3), mọi giá trị env/redirect/host (Phase 2/6), mọi identifier đóng băng (D11/D12), mọi import `@dtw/*` (D6/Phase 7).

## Public Contracts

- **JSON-LD `WebSite.name`** (`(reader)/layout.tsx:37`) là hợp đồng với Google Knowledge Graph/rich results — thêm `alternateName` là một mở rộng hợp đồng có chủ đích (không phá hợp đồng cũ, chỉ bổ sung tín hiệu để Google khớp lại entity qua đổi tên).
- **Atom `<author><name>`** (`feed.ts:122`) và Atom `title`/`subtitle` (3 route rss.xml) là hợp đồng với feed reader/aggregator của subscriber — thay đổi tên hiển thị trong feed KHÔNG đổi `tag:` URI (giữ nguyên theo hệ quả D4, xem Bước 8 "Không đụng"), nên identity của feed item không vỡ, chỉ tên hiển thị đổi.
- **PWA manifest `name`/`short_name`** (**hợp đồng do Phase 3 sở hữu**, ghi lại ở đây chỉ để đủ ngữ cảnh) là hợp đồng với hệ điều hành di động cho "Add to Home Screen" — đổi tên KHÔNG đổi `icons`/`start_url`/`display` nên các bản cài cũ không bị vỡ về mặt icon, chỉ nhãn hiển thị đổi ở lần cài mới (bản đã cài giữ nhãn cũ tới khi user gỡ-cài-lại — hành vi PWA tiêu chuẩn, không phải bug của phase này).
- **`llms.txt`** là hợp đồng phi chính thức với AI crawler — thêm câu "Formerly published as DailyTechWire." là tín hiệu tương thích ngược, không phải nghĩa vụ pháp lý.
- **`mailto:` href** (nhóm F2) là hợp đồng với client email của reader — đây là lý do duy nhất cần GATE: một `mailto:` trỏ tới hộp thư chưa tồn tại sẽ bounce, hỏng trải nghiệm liên hệ thật.

## Blast Radius

| Nhóm | Số dòng/vị trí (đếm theo bảng trong Implementation Checklist) | Gate? |
|---|---|---|
| A — ui-components copy | 14 dòng | Không |
| B — dead/gated code | 4 dòng | Không |
| C — lib/data.ts mock data | 6 dòng | Không |
| ~~D — email giao dịch~~ | **0 — đã chuyển sang Phase 6** (umbrella §6b.3) | — |
| I — `.dtw-tip` (6 vị trí) + `globals.css:20` comment | 7 dòng | Không |
| J — Payload collection description + regenerate types | 2 file | Không |
| K — `scripts/seed-payload.ts` | 6 vị trí (dòng 219 **không đổi**) | Nhóm H nếu chọn đóng gap (dòng 267) |
| L — 2 file `demos/*.html` | ~8 vị trí, gồm 2 storage key thứ 7/8 | Không |
| E — dashboards buildMetadata | 1 khối (7 dòng gốc → cấu trúc mới) | Không |
| F — seo-metadata copy | 24 dòng/vị trí (đã trừ 3 dòng `manifest.ts` chuyển sang Phase 3) | Không |
| G — editorial-pages F1 | ~34 dòng/vị trí, 3 locale phần lớn | Không |
| F2 — mailbox domain | 20 dòng/vị trí (5 địa chỉ duy nhất) | **Có — Phase 1** |
| H — AI-disclosure known-gap | 2 khối | **Có — quyết định user** |
| Dọn dẹp comment | 2 dòng | Không |
| **Tổng ước tính** | **~115 vị trí sửa** (không tính 3-locale nhân bản riêng từng dòng) | |

## Verification Evidence

Lệnh chạy được, không phải "kiểm tra bằng mắt" (trừ mục cuối, được đánh dấu rõ):

1. **Grep baseline trước/sau** (Bước 1.1 và 12.1-12.2) — output thật dán vào report.
2. **Typecheck**: `pnpm turbo run typecheck` (xác nhận lệnh chính xác qua `package.json`/`turbo.json` trước khi chạy) — 0 lỗi.
3. **Xác nhận dashboards buildMetadata chạy đúng** (cần dev server đang chạy, `pnpm --filter web dev` hoặc tương đương):
   ```
   curl -s http://localhost:3000/dashboards | command grep -i 'rel="canonical"\|og:site_name\|<title>'
   ```
   Kỳ vọng: thấy đúng MỘT `<title>` (không nhân đôi brand), một thẻ `rel="canonical"` trỏ `/dashboards`, và `og:site_name` = `Opentechwire`.
4. **Đếm ký tự meta description homepage** (tái lập kết quả 156 ký tự đã đo ở Bước 8):
   ```
   python3 -c "print(len('Opentechwire tracks global tech and AI: funding rounds, tech-stock moves, AI model benchmarks and rankings, and deep-dive reporting from Asia and the world.'))"
   ```
   Kỳ vọng: `156`, nằm trong dải 150-160.
5. **Xác nhận D9 không cần sửa gì** (tái lập bằng chứng đã dùng để viết bước D9):
   ```
   command grep -rn 'DTW Pro' apps/web/src
   ```
   Kỳ vọng: 0 kết quả (nếu có kết quả, nghĩa là có PR khác đã thêm tính năng Pro giữa lúc viết plan và lúc EXECUTE — dừng lại, báo user).
6. **Kiểm tra thủ công bằng mắt (không có lệnh thay thế được)**: đọc lại 3 locale của mỗi khối `t()` đã sửa để xác nhận không có locale nào bị bỏ sót số lượng tham số so với bản gốc (ví dụ `studio/page.tsx:123-125` có số token khác nhau theo locale — dễ sửa nhầm nếu chỉ nhìn bản tiếng Anh). Đây là bước duy nhất trong Verification Evidence không có lệnh grep thay thế được, vì đúng-sai ngữ nghĩa cần người đọc hiểu ngôn ngữ.
7. **Bản dịch tagline vi/id** (`header.tsx:234-238`) — xác nhận có người bản ngữ đã xem qua bản DRAFT trước khi coi bước này `✅ VERIFIED` (không có lệnh thay thế, ghi nhận bằng chứng "đã gửi cho ai, ngày nào" trong report).
8. **Nhóm F2**: xác nhận bằng văn bản (câu trả lời của user trong phiên EXECUTE, dán nguyên văn vào report) rằng Phase 1 đã xong provisioning trước khi chạy `git add`/merge cho nhóm này. Nếu chưa xác nhận được, report ghi rõ nhóm F2 ở trạng thái `🚧 BLOCKED`.
9. **Nhóm H**: xác nhận bằng văn bản lựa chọn của user (đóng gap ngay / để nguyên) dán vào report.

## Risks

- **Locale drift khi sửa nhầm số token** (đã nêu ở Verification Evidence #6) — rủi ro cụ thể nhất của phase này vì phần lớn thay đổi là chuỗi văn xuôi 3 locale.
- **Chuỗi gộp brand+email bị tách nhầm** (`legal/[slug]/page.tsx:40-42,115-117`) — nếu EXECUTE vô tình chỉ đổi brand mà quên rằng cả câu đang bị GATE, sẽ merge sớm một domain email chưa tồn tại. Giảm thiểu: Bước 4 đã đánh dấu rõ "CHUỖI GỘP", không tách.
- **`t()` mất đồng bộ tham số** → TypeScript nên bắt được (tham số bắt buộc theo signature `t(en, vi, id)`), nhưng chỉ bắt được lỗi THIẾU tham số, không bắt được lỗi NỘI DUNG sai ngôn ngữ (ví dụ gõ nhầm cả 3 tham số thành tiếng Anh) — đây là lý do Verification Evidence #6 vẫn cần mắt người.
- **Nhóm F2 merge sớm** → hộp thư bounce, ảnh hưởng trải nghiệm liên hệ thật của reader/đối tác/nhà báo. Giảm thiểu: STOP-hỏi-trước ở Bước 4, không có ngoại lệ.
- **Nhóm H bị âm thầm resolve theo hướng mặc định của agent** → vi phạm nguyên tắc "không tự bịa quyết định sản phẩm". Giảm thiểu: Bước 10 yêu cầu hỏi nguyên văn trước khi chạm 2 dòng đó.
- ~~Rủi ro `manifest.ts:14`~~ — **không còn là rủi ro của Phase 4**: `manifest.ts` đã chuyển sang Phase 3 (umbrella §6b.3), và giá trị `short_name: "OTW"` nay được chốt tường minh bởi luật umbrella §5.1.1 (nhãn ngắn → `OTW`), không còn là một suy luận cần user xác nhận giữa chừng.

## Rollback

Toàn bộ Phase 4 là thay đổi text/literal thuần tuý (không schema, không migration, không gọi API bên ngoài, không thay đổi DB). Rollback bằng git tiêu chuẩn:

- Nếu chưa commit: `git diff` để xem lại, `git restore <file>` cho từng file muốn hoàn tác, hoặc `git restore .` cho toàn bộ nếu cần huỷ sạch (xác nhận `git status` trước).
- Nếu đã commit: `git revert <commit-sha>` cho commit tương ứng — an toàn vì không có side-effect ngoài repo (không giống Phase 5/6).
- Khuyến nghị **2-3 commit tách biệt** thay vì 1 commit khổng lồ:
  1. Commit chính: Nhóm A, B, C, D, E, F, G (mọi thứ F1, không gate) — có thể ship ngay, an toàn revert độc lập.
  2. Commit riêng cho Nhóm F2 (mailbox) — chỉ tạo/merge sau khi Phase 1 xác nhận; giữ tách biệt để revert nhóm này không kéo theo revert nhầm nhóm F1.
  3. Commit riêng cho Nhóm H (nếu user chọn đóng gap AI-disclosure) — tách biệt vì đây là thay đổi NỘI DUNG CHÍNH SÁCH, không phải rebrand thuần, nên lịch sử git nên phản ánh đúng bản chất thay đổi.

## Acceptance Criteria

1. Lệnh grep chuẩn (Bước 1.1) chạy sau Phase 4 chỉ còn sống sót các mục đã liệt kê trong bảng "Ngoài phạm vi" — đối chiếu bằng `diff` như Bước 12.2.
2. `pnpm turbo run typecheck` sạch.
3. `curl` vào `/dashboards` xác nhận có canonical + OG site_name + không nhân đôi brand trong `<title>`.
4. Meta description homepage đo đúng 156 ký tự bằng script Python ở Verification Evidence #4.
5. Không có commit nào trong Phase 4 chạm vào file thuộc danh sách "Ngoài phạm vi" phía trên (kiểm bằng `git show --stat <sha>` cho từng commit của phase).
6. Nhóm F2 chỉ merge sau khi có xác nhận bằng văn bản của user về tình trạng Phase 1 — bằng chứng nằm trong report.
7. Nhóm H có quyết định rõ ràng của user (đóng hoặc giữ nguyên known-gap), không bị bỏ qua trong im lặng.
8. D9 được xác nhận là no-op thật (0 kết quả grep `DTW Pro` trong `apps/web/src`), ghi vào report thay vì chỉ giả định.
8b. `command grep -rn "dtw-tip" apps/web/src` trả 0 và `command grep -rn "otw-tip" apps/web/src` trả đúng 6 dòng (Bước 13).
8c. `apps/web/src/payload/payload-types.ts` được **sinh lại bằng lệnh**, không sửa tay — bằng chứng: output của `pnpm --filter web payload generate:types` dán vào report (Bước 14).
8d. `command grep -n "dtw-studio-aws-asean" apps/web/scripts/seed-payload.ts` **VẪN CÒN** khớp dòng 219 — nếu về 0, EXECUTE đã đổi slug và tạo nguy cơ row published thứ hai: ROLLBACK NGAY (Bước 15).
8e. `command grep -rn "dtw-" demos/` trả 0 (Bước 16), hoặc report ghi rõ user đã chọn xoá hai file demo.
8f. `command grep -n "DailyTechWire" apps/web/src/lib/email.ts apps/web/src/lib/auth.ts` **vẫn còn đúng 5 dòng** — Phase 4 cố ý không chạm (Bước 6); nếu đã sạch thì Phase 6 đã chạy trước, ghi chú chứ đừng "sửa lại".
9. Bản dịch tagline vi/id (nếu chưa qua duyệt bản ngữ tại thời điểm đóng phase) được ghi rõ "chưa duyệt bản ngữ" trong report, không bị coi là hoàn tất im lặng.
10. User đã xem report và xác nhận trước khi Phase 4 được đánh dấu `✅ VERIFIED` (Phase Completion Rule #5) — thiếu xác nhận thì giữ ở `🧪 TESTING`.

## Resume and Execution Handoff

**Trạng thái hiện tại**: `⏳ PLANNED`. Chưa có dòng code nào bị sửa.

**Đường dẫn plan chính xác cho EXECUTE**: `process/features/rebrand/active/phase-4-rendered-copy_PLAN_08-09-26.md` (chính là file này — không có file phase-4 nào khác đang active).

**Ghi chú execute anchor**: dù tên file bắt đầu bằng `phase-` (trùng hình thái đặt tên legacy `phase-*.md`), đây là một **direct plan artifact** đầy đủ (có `_PLAN_` + date stamp) và là **primary execute anchor** duy nhất của Phase 4 — không phải một file phụ trong một cụm `PLAN.md` + `phase-*.md` kiểu legacy. **Không có supporting phase files** nào khác đi kèm file này; mỗi phase trong chương trình 8-phase có đúng một plan file riêng (xem umbrella §3 quy ước đặt tên), nên EXECUTE chỉ cần đúng một đường dẫn này, không cần gộp thêm file nào khác.

**Trước khi ENTER EXECUTE MODE**, user nên xác nhận 2 điểm mở còn lại trong plan này (không phải ẩn số kỹ thuật, mà là input cần user):
1. Bản dịch DRAFT tagline vi/id ở đầu plan — chấp nhận dùng draft rồi duyệt sau, hay muốn duyệt trước khi EXECUTE chạy?
2. Có muốn EXECUTE hỏi lại quyết định Nhóm H (AI-disclosure known-gap) ngay từ đầu phiên EXECUTE, hay để tới đúng lúc chạm file đó mới hỏi?

**Thứ tự thực thi khuyến nghị bên trong phiên EXECUTE** (cập nhật 09-09-26): Bước 1 (baseline) → Bước 2, 3, 5, 7 (F1, độc lập, thứ tự bất kỳ) → Bước 8, 9 (F1, seo + editorial) → Bước 13, 14, 15, 16 (các nhóm bổ sung I/J/K/L) → Bước 11 (dọn dẹp phụ) → Bước 6 (chỉ chạy lệnh xác nhận, KHÔNG sửa) → Bước 12 (verify tổng) → dừng lại hỏi Nhóm F2 (Bước 4) và Nhóm H (Bước 10) như 2 quyết định riêng, không gộp vào lượt merge chính. Lưu ý Bước 15 dòng 267 phụ thuộc kết quả Nhóm H — làm Bước 10 trước nếu user đã sẵn sàng trả lời.

**Sau khi Phase 4 verified**: cập nhật umbrella plan's dependency note nếu cần, và umbrella đã ghi rõ Phase 4 chặn Phase 6 ("UI phải sạch trước cutover") — không tự ý bắt đầu Phase 6 chỉ vì Phase 4 xong, vẫn cần Phase 1/2/3/5 theo đúng bảng dependency của umbrella.

**Validator cho chính plan này**:
```
node .claude/skills/vc-generate-plan/scripts/validate-plan-artifact.mjs process/features/rebrand/active/phase-4-rendered-copy_PLAN_08-09-26.md
```

Next Step: user review bảng "Ngoài phạm vi", 2 điểm mở ở "Resume and Execution Handoff", và Nhóm F2/H trước khi nói **"ENTER EXECUTE MODE"** cho riêng file plan này.
