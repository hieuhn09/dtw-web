# Phase 6 — CUTOVER (ONE-WAY DOOR): domain + host + env flip Dailytechwire → Opentechwire

**Date**: 08-09-26 (tên file khớp với umbrella + tài liệu tham chiếu cùng đợt; viết thực tế 09-09-26)
**Loại**: PHASE PLAN trong phase program `rebrand` — Phase 6/8, theo `process/development-protocols/phase-programs.md`
**Complexity**: COMPLEX — một phase của phase program, tự nó không phải một lượt EXECUTE đơn giản; **ONE-WAY DOOR thật sự**
**Feature**: `rebrand`
**Plan file**: `process/features/rebrand/active/phase-6-cutover_PLAN_08-09-26.md`
**Umbrella plan** (đọc trước, chứa ledger D1–D15 đầy đủ — plan này KHÔNG lặp lại toàn bộ, chỉ trích đúng phần áp dụng): `process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md`
**Tài liệu tham chiếu nền** (752 dòng, đã kiểm chứng file trích dẫn 08-09-26; mọi số dòng dưới đây đã được RE-VERIFY trực tiếp trên `dtw-web` và `apcg-cms`/`content-engine` ngày 09-09-26 — xem ghi chú "đã re-verify" ở từng bảng): `process/general-plans/references/rebrand-opentechwire_REFERENCE_08-09-26.md`
**Status**: 🧪 TESTING — cutover đã đi qua 10-09-26 — xem reports/phase-6-cutover_REPORT_10-09-26.md; CÒN TREO sameAs, GA4, Central tenant row, Resend verify (cập nhật 10-09-26)

**Ghi chú tương thích shape file** (không phải một cấu trúc `PLAN.md` + `phase-*.md` kiểu cũ): tên file bắt đầu bằng `phase-` vì đây là quy ước đặt tên phase-plan trong phase program `rebrand`, nhưng file này chính là **primary execute anchor** duy nhất cho Phase 6 — không tách rời implementation khỏi phần đặc tả. **Supporting phase files** liên quan để đọc kèm: umbrella plan (`rebrand-opentechwire-umbrella_PLAN_08-09-26.md`), tài liệu tham chiếu nghiên cứu (`rebrand-opentechwire_REFERENCE_08-09-26.md`), và report của Phase 1-5 tại `process/features/rebrand/reports/` khi đã tồn tại.

---

## Overview

Trong một cửa sổ thao tác ngắn (khuyến nghị < 2 giờ đồng hồ liên tục, ngoài giờ cao điểm), lật toàn bộ domain/host/env sản xuất từ `dailytechwire.com` sang `www.opentechwire.com` cho `dtw-web`, đồng bộ `content-engine` và Central (`apcg-cms`) trỏ theo, đổi 6 storage key theo D14, và đổi 2 slug mạng xã hội — **tất cả mà không mang theo bất kỳ cơ chế redirect/Change-of-Address nào từ domain cũ** (D4). Đây là phase duy nhất trong 8 phase được đánh dấu ONE-WAY DOOR thật sự: domain cũ không có 301 nên không có một lệnh "revert" — hồi phục nghĩa là dựng lại tín hiệu traffic/SEO từ đầu, và hai slug mạng xã hội có rate-limit + rủi ro bị bên thứ ba chiếm tên cũ.

Phase này **chỉ mở** sau khi Phase 1–5 đã xong (xem "Dependencies" bên dưới) — mọi việc *additive* (OAuth callback mới, Resend verified, allowlist mới, domain mới attach) phải sẵn sàng **trước** khi bước vào cửa sổ; cửa sổ cutover chỉ còn việc *destructive/flip*.

---

## Scope — Phạm vi và KHÔNG thuộc phạm vi

**Trong phạm vi của Phase 6** (8 bước theo đúng thứ tự đã chốt + các phát hiện bổ sung bắt buộc để thoả "definition of done" của D4/umbrella — xem mục riêng bên dưới):

1. Xác nhận (không tạo mới) OAuth redirect URI + Resend verified/warmed từ Phase 1.
2. Thêm (không thay) origin mới vào `PUBLIC_API_ALLOWED_ORIGINS` (Central), CORS allowlist R2, và attach domain mới vào Vercel.
3. Lật cùng một deploy: `NEXT_PUBLIC_SITE_URL` + `BETTER_AUTH_URL` + `RESEND_FROM_DOMAIN` (Vercel env của `dtw-web`) + `apps/web/src/lib/email.ts:12-13` + `apps/web/src/lib/auth.ts:78,84,97,103`.
4. Central `/admin`: **toàn bộ tenant row** `slug='dtw'` — `domain`, `frontendUrl` (ràng buộc chức năng, phải đúng thời điểm) **cộng** `name`, `logo`, `brandColor`, `brand.{faviconUrl,ogImageDefault,themeTokens}`, `seo.{titleSuffix,defaultMetaDescription,defaultOgImage,twitterHandle}`, `contact.{general,editorial,advertising,partnerships}Email`, `socials[]` (chrome/copy). **Field `slug` KHÔNG đổi** (D11). Đây là "đòn bẩy lớn nhất của cả cuộc rebrand" theo §3.6 — đổi chrome site mà không cần deploy code.
4b. Central: audit + sửa nội dung do editor viết (`menus_items_locales.label`, `wire_drops_locales.text`, `corrections_locales.*`, `sponsor_slots(_locales)` + `ctaUrl`, `media_locales.alt/caption`) và `apcg-cms/scripts/seed.ts` (ngăn re-seed đưa brand cũ quay lại).
4c. Audit `dtw_auth.auth_users` — tài khoản staff còn dùng `@dailytechwire.com`.
4d. **TRƯỚC Bước 3**: thông báo cho người đăng ký newsletter về việc đổi From-name.
4e. Template env trong repo: `.env.example:52` và `apps/web/.env.example:51` (`RESEND_FROM_DOMAIN`).
5. Vercel của `content-engine`: `DTW_INTAKE_URL`.
6. Social + code cùng cửa sổ: slug LinkedIn, username Facebook, rồi `apps/web/src/components/footer.tsx:63-64` và `apps/web/src/lib/metadata.ts:90-91`.
7. GA4: URL data-stream + referral exclusion + đánh dấu mốc cutover.
8. Đổi 6 storage-key theo D14.

**KHÔNG thuộc phạm vi của Phase 6** (điều hướng rõ sang phase khác, đừng làm ở đây):

| Việc | Vì sao không phải Phase 6 | Thuộc phase nào |
|---|---|---|
| Bất kỳ redirect 301 nào từ `dailytechwire.com`/`www.dailytechwire.com` sang domain mới, hoặc rule host trong `apps/web/next.config.ts` `redirects()` | Loại bỏ vĩnh viễn theo D4 — không có ở bất kỳ đâu trong 8 phase | Không phase nào |
| Nộp Change of Address ở Google Search Console | Loại bỏ vĩnh viễn theo D4 | Không phase nào |
| Pin/ghim Atom tag authority vào host cũ ở `apps/web/src/lib/feed.ts:61,69,116` | Đã bị loại theo D4 ở Phase 2 — `feed.ts` vốn đã tính `tagHost` **động** từ `channel.origin` (đã re-verify dòng 61, 69, 87, 116 — xem bảng Blast Radius), nên sau khi `NEXT_PUBLIC_SITE_URL` đổi, `tag:` URI tự động dùng host mới **mà không cần sửa code**. Phase 6 chỉ cần **xác minh hành vi này bằng lệnh thật** sau khi flip (xem Implementation Checklist bước 9) | Không cần code ở phase nào — chỉ verify ở Phase 6 |
| Copy hiển thị brand còn lại trong `apps/web` (title template ở `layout.tsx:35-39`, `og:site_name`, tiêu đề RSS `[pillar]/rss.xml/route.ts:36`, `feed.ts:122` author fallback, meta description `(reader)/page.tsx:63`, v.v. — toàn bộ §3.2 "seo-metadata" ngoại trừ các dòng được liệt kê tường minh ở "Trong phạm vi" trên) | Đây là literal brand-text, không phụ thuộc domain/host, có thể sửa bất cứ lúc nào độc lập với cửa sổ cutover | **Phase 4** — *(cảnh báo cũ đã được giải quyết 09-09-26: Phase 4 plan thực tế CÓ quét §3.2 trọn vẹn ở Bước 8 "Nhóm F: seo-metadata"; umbrella §3 nay cũng ghi §3.2 tường minh trong phạm vi Phase 4. Không còn khoảng trống ở đây.)* |
| ~~Toàn bộ field còn lại của Tenant row Central~~ → **ĐÃ ĐƯA TRỞ LẠI TRONG PHẠM VI (09-09-26)** | Bản Phase 6 trước thu hẹp còn `domain`+`frontendUrl` và tự đánh dấu phần còn lại là "khoảng trống thứ hai". Soát chéo xác nhận: không phase nào khác nhận chúng, nên thu hẹp = bỏ rơi. Umbrella §3 (Phase 6) và §6b.1 nay giao lại đầy đủ cho Phase 6 — xem **Bước 4** đã mở rộng | **Phase 6, Bước 4** |
| `.dtw-tip` CSS class (`apps/web/src/app/globals.css:424,428,449,450`, `ai-leaderboard.tsx:133`, `dashboards-teaser.tsx:198`) | Định danh CSS nội bộ, không phải storage key, không phụ thuộc domain | Phase 4 |
| Đổi tên biến TS `STORAGE_KEY`/`GUEST_METER_COOKIE`/`NUDGE_KEY` (identifier, không phải giá trị chuỗi) | Không bắt buộc — các định danh này không phải brand token hiển thị | Tuỳ chọn thẩm mỹ, không phase nào bắt buộc |
| ~~`apcg-cms/scripts/seed.ts`~~ → **ĐÃ ĐƯA VÀO PHẠM VI (09-09-26)** | Bản trước định tuyến sang "Phase 4/5", nhưng Phase 4 chỉ phủ `dtw-web` và Phase 5 chỉ phủ `content-engine` + row `authors` — **không phase nào nhận file này**. Nay Phase 6 Bước 4b sở hữu nó: sửa `name` dòng 208 và các chuỗi 267, 277, 281, 447-448, 462, 481. **KHÔNG đổi `slug` dòng 207** (D11, umbrella §5.3) | **Phase 6, Bước 4b** |
| `content-engine` `DTW_VOICE_SPEC`, `brief-configs.ts`, `social-rules.prompt.ts`, rename author row | Đã làm ở Phase 5 — Phase 6 chỉ tiêu thụ kết quả (author đã rename, `logoAssetUrl` đã trỏ key mới) như một tiền đề | Phase 5 (tiền đề, xem Dependencies) |
| `packages/db/src/schema/auth.ts:24`, mọi file `packages/db/migrations/**` | Đóng băng vĩnh viễn theo D12 | Không phase nào |
| Slug `dtw` ở bất kỳ đâu (Tenants.ts:57, registry content-engine, env suy ra `toUpperCase()`, `hero-images/dtw/`, GH Actions repo variables) | Đóng băng vĩnh viễn theo D11 | Không phase nào |
| Package scope `@dtw/*` (D6) và copy paywall/Pro (D9) | Hoãn có chủ đích | Phase 7 (D6, nếu được yêu cầu) / thời điểm bật `PAYWALL_ENABLED` (D9) |
| `/home/hieunc/Code/DTW`, `wad-web`, `media-engine SiteCode`, `APCG-web`, đổi tên repo GitHub | Estate cleanup | Phase 7 |

---

## Dependencies — Tiền đề bắt buộc trước khi mở cửa sổ

Phase 6 **CHẶN bởi Phase 1, 2, 3, 4, 5** (theo bảng dependency của umbrella). Trước khi mở cửa sổ cutover, xác nhận **từng dòng** dưới đây có bằng chứng thật (không suy luận):

| Từ phase | Điều kiện phải đúng | Cách xác minh |
|---|---|---|
| Phase 1 | **Google**: redirect URI mới đã **thêm** (không swap), URI cũ vẫn còn. **GitHub**: hoặc đã thêm song song, hoặc report Phase 1 (bước E.5) đã ghi rõ quyết định **swap-in-window** vì OAuth App classic chỉ có một ô callback. **Đọc đúng nghĩa này** — bản trước đòi "cả hai đều đã thêm", một điều kiện có thể **không bao giờ thoả được** nếu app là classic (xem Bước 4f) | Yêu cầu user xác nhận qua dashboard thật + một lượt sign-in thử nghiệm trước cutover nếu khả thi; đọc report Phase 1 E.5 |
| Phase 1 | Domain mới `opentechwire.com` đã verify trên Resend; SPF/DKIM/DMARC đã publish và **đã warm-up xong** (không phải mới publish record) | `dig +short TXT opentechwire.com` (SPF), `dig +short TXT _dmarc.opentechwire.com` (DMARC), và bản ghi DKIM đúng theo selector Resend cấp (lấy tên record chính xác từ Resend dashboard — selector thường có dạng `resend._domainkey.opentechwire.com`, xác nhận với user) |
| Phase 1 | Quyền sở hữu `opentechwire.com` đã xác nhận thật (không chỉ suy đoán qua nameserver) | User xác nhận qua tài khoản registrar tenten.vn |
| Phase 2 | `apps/web/src/lib/metadata.ts:26,30` và `apps/web/.env.example:12-13` đã phản ánh `www.opentechwire.com` là canonical (D5); `turbo.json` đã xác nhận `NEXT_PUBLIC_SITE_URL` nằm trong build-hash `env` (`turbo build --dry=json`) | `command grep -n "opentechwire" apps/web/src/lib/metadata.ts apps/web/.env.example`; đọc lại output JSON của `turbo build --dry=json` |
| Phase 3 | Toàn bộ mark (`wordmark.tsx`, `icon.svg`, 4 PNG icon, `og-default.png`, `email.ts:79` lockup, `manifest.ts`) đã ship 1 commit atomic; monogram mới đã upload lên Supabase Storage dưới **object key mới**, và `content-engine/src/lib/publications/dtw/index.ts:182-183` (`logoAssetUrl`) đã trỏ vào key đó | Mở tay asset; xác nhận URL `logoAssetUrl` trả về ảnh `OTW`, không phải `DTW` |
| Phase 4 | §3.1 (ui-components) + **§3.2 (seo-metadata)** + §3.3 (editorial-pages) + các nhóm bổ sung I/J/K/L (`.dtw-tip`, Payload collection description, `seed-payload.ts`, 2 file `demos/*.html`) đã sạch `dailytechwire`/`DTW` theo lệnh grep chuẩn (trừ danh sách đóng băng D11/D12) | Chạy lệnh grep chuẩn ở mục Verification Evidence, đối chiếu **từng dòng còn lại** với §5.2/§5.3 |
| Phase 5 | Worktree `content-engine-kpi-gd1-publish-caps` đã merge/rebase; `DTW_VOICE_SPEC`, `brief-configs.ts`, `social-rules.prompt.ts` đã sửa; `UPDATE publications SET name=…`, `UPDATE brief_configs SET byline=…` đã chạy thật; **author row Central đã rename tại chỗ** (`name`/`role`) **trước khi** flip byline generate-time; `npm test` trong `content-engine` xanh | Yêu cầu report Phase 5 dán kết quả UPDATE thật + `npm test` output |

Nếu **bất kỳ** dòng nào ở trên chưa có bằng chứng, Phase 6 ở trạng thái `🚧 BLOCKED` — không mở cửa sổ.

**Bối cảnh cần đọc trước khi execute** (routing chuẩn của repo): `process/context/all-context.md` (invariant #7/#11/#14/#15 mới sau Phase 0, mục canonical-host mới), `process/context/infra/all-infra.md` (DKIM/SPF/DMARC, canonical host), `process/context/integrations/all-integrations.md` (freeze slug `dtw`), `process/context/tests/all-tests.md` (repo `dtw-web` gần như chưa có test tự động — xác nhận lại trước khi giả định có gate CI nào khác ngoài `typecheck`).

---

## Ledger áp dụng cho Phase 6 (trích từ umbrella — không bàn lại)

| # | Áp dụng vào Phase 6 thế nào |
|---|---|
| D3/D5 | Canonical host lật sang `https://www.opentechwire.com` (www, không phải apex) trong bước 3 |
| D4 | Toàn bộ cửa sổ cutover **không** tạo bất kỳ redirect/CoA nào từ domain cũ; domain cũ **giữ quyền sở hữu, parked, không A record** — xem bước 2b bổ sung |
| D11 | Slug `dtw` không đổi ở bất kỳ đâu trong Phase 6 — kể cả khi sửa Central Tenant row, field `slug` không được chạm |
| D12 | Schema `dtw_auth` / bucket R2 `dtw-media` không đổi tên — bước 2 chỉ **thêm origin** vào CORS allowlist của bucket, không đổi tên bucket |
| D14 | 6 storage-key đổi tên ở bước 8 — miễn phí vì đổi domain đã xoá sạch theo origin |
| D6, D9 | **Không thuộc Phase 6.** D6 (package scope `@dtw/*`) hoãn tới Phase 7; D9 (copy paywall/Pro) hoãn tới khi `PAYWALL_ENABLED` bật thật — không đụng `apps/web/src/lib/paywall.ts` copy hay tên gói trong phase này |

---

## Phát hiện bổ sung cần xác nhận TRƯỚC khi mở cửa sổ (không nằm trong 8 bước gốc)

Các mục này được phát hiện khi re-verify code hiện tại (09-09-26) đối chiếu với "definition of done" của D4/umbrella. Chúng **cần quyết định của user** trước EXECUTE — plan này chỉ nêu ra, không tự quyết:

1. **`apps/web/next.config.ts:40-45` có một rule redirect ĐANG TỒN TẠI** (đã re-verify): `has: [{ type: "host", value: "dailytechwire.com" }] → destination: "https://www.dailytechwire.com/:path*"`. Đây là rule chuẩn hoá apex→www cho **domain hiện tại** (do D5/commit `24bf005` dựng), **không phải** redirect-sang-domain-mới nên **không** bị D4 cấm. Nhưng nếu để nguyên sau cutover, nó trở thành cấu hình chết trỏ hoàn toàn vào domain cũ đã ngừng phục vụ. Cần user xác nhận cơ chế: (a) sửa lại thành rule apex→www **cho domain mới** (`opentechwire.com` → `https://www.opentechwire.com/:path*`), giữ nguyên mục đích chuẩn-hoá-www, không phải một trường hợp bị D4 cấm; hoặc (b) xoá rule này nếu Vercel tự xử lý apex→www ở tầng platform (cần xác nhận qua Vercel dashboard, không kiểm chứng được từ repo — xem ẩn số #6 tài liệu tham chiếu). **ĐÃ CHỐT 09-09-26: phương án (a).** Umbrella §4 mục 2 nay ghi rõ điều cấm của D4 chỉ áp dụng cho redirect **xuyên domain**; canonicalize `apex → www` **trong cùng domain mới** là cơ chế D5, không phải cơ chế mang hình phạt đi theo. Thực tế Phase 2 **đã thêm sẵn** rule apex→www cho `opentechwire.com` (dormant cho tới khi domain được attach ở bước 2 dưới đây), nên việc của Phase 6 rút gọn còn **XOÁ rule cũ**, không phải viết rule mới:
- Xoá nguyên object rule `has: [{ type: "host", value: "dailytechwire.com" }] → destination: "https://www.dailytechwire.com/:path*"` (hiện ở dòng 40-45).
- Giữ nguyên rule mới mà Phase 2 đã thêm.
- Trạng thái đích, verify bằng lệnh: `command grep -c "dailytechwire" apps/web/next.config.ts` → **0**; `command grep -c "opentechwire" apps/web/next.config.ts` → **2** (đúng một host rule).
Đây là việc trong Bước 2b (cùng lúc gỡ domain cũ khỏi Vercel), không phải một câu hỏi còn mở.
2. **`content-engine/admin/.env.example:23` `DTW_INTAKE_URL=https://dailytechwire.com` đang trỏ APEX**, trong khi D5 canonical là **www**. Khi flip ở bước 5, đặt giá trị mới là `https://www.opentechwire.com` (có www) — sửa luôn bug lệch chuẩn có sẵn từ trước, không chỉ đổi domain.
3. **Slug LinkedIn và username Facebook mới CHƯA được chốt giá trị cụ thể.** Tài liệu tham chiếu D2 nêu câu hỏi mở: có giữ prefix `apcg` cho Facebook không (hiện là `apcgdailytechwire`)? Plan này **không tự đặt** giá trị — user phải cung cấp 2 chuỗi chính xác (ví dụ `opentechwire` cho LinkedIn, `apcgopentechwire` hoặc `opentechwire` cho Facebook) trước khi bước 6 được thực hiện.
4. **GA4 "annotation" mốc cutover: GA4 (Google Analytics 4) không có tính năng annotation gốc kiểu Universal Analytics cũ** (chưa xác nhận được tính năng thay thế nào tồn tại trong giao diện GA4 hiện tại — đây là điều chưa kiểm chứng, không phải sự thật đã biết). Đề xuất: ghi mốc thời gian cutover thật (ngày giờ UTC + ngày giờ SGT) vào report Phase 6 như một "annotation thủ công", và nếu team có dùng Looker Studio nối với GA4, thêm annotation ở đó. **Cần user xác nhận** cách ghi chú thực tế trước khi coi bước 7 là xong.
5. **Cần dựng lại quyền attach/detach domain trên Vercel + xoá DNS record tại tenten.vn cho domain cũ** để thoả điều kiện "definition of done" #5 của umbrella (`dailytechwire.com` không có A record). 8 bước gốc không nêu tường minh việc gỡ domain cũ khỏi Vercel — bổ sung thành **bước 2b** (xem Implementation Checklist). Không làm bước này thì domain cũ vẫn còn A record trỏ vào hạ tầng Vercel, mâu thuẫn trực tiếp với D4.
6. **Giá trị chính xác hiện tại của Central Tenant field `domain`/`frontendUrl`/`additionalDomains` cho `slug='dtw'` chưa được đọc từ DB thật** — suy đoán từ mô tả field (`domain`: "Primary public hostname, e.g. briefasia.com" — bare hostname, không có `www`/protocol; `frontendUrl`: "Base URL revalidate webhook POSTs to, e.g. https://briefasia.com" — ví dụ generic của field này cũng dùng apex, nhưng D5 xác định canonical thật của publication này là **www**). Chạy câu SQL audit ở bước Pre-Window Readiness Gate để lấy giá trị thật, giữ đúng **shape** (bare hostname cho `domain`; full URL có `https://www.` cho `frontendUrl`) khi thay thế chuỗi.

---

## Phase Completion Rules

Áp dụng nguyên "Phase Status Rules" của `process/development-protocols/phase-programs.md`, cộng điều kiện riêng cho phase one-way-door này:

1. **Integration Test** — mọi hệ thống phụ thuộc (Central, content-engine, R2, Resend, GA4) phải hoạt động cùng nhau trên domain mới, không chỉ từng phần riêng lẻ.
2. **Manual Test** — user (hoặc một tài khoản reader thật) đăng nhập thành công bằng **cả** magic-link **và** ít nhất 1 OAuth provider trên `https://www.opentechwire.com` sau flip.
3. **Data Verification** — giá trị thật trong Vercel env, Central Tenant row, `DTW_INTAKE_URL` được dán làm bằng chứng trong report, không chỉ mô tả "đã đổi".
4. **Error Handling** — với mỗi bước external, biết trước nó fail thế nào (xem "5 Kiểu Hỏng Âm Thầm") và xác nhận hành vi thật khớp mô tả.
5. **User Confirmation** — Phase 6 **không được** đánh dấu `✅ VERIFIED` chỉ vì "deploy xanh". Chỉ chuyển `✅ VERIFIED` sau khi user đã xem bằng chứng (dashboard thật + lượt đăng nhập thật) và xác nhận bằng lời. Trước đó, trạng thái cao nhất được phép là `🧪 TESTING`.

Marker dùng thống nhất: `⏳ PLANNED` · `🔨 CODE DONE` · `🧪 TESTING` · `✅ VERIFIED` · `🚧 BLOCKED`.

---

## Implementation Checklist — Cửa sổ Cutover (8 bước gốc + bổ sung, theo đúng thứ tự)

Ký hiệu: 🔒 = ONE-WAY DOOR (khó/không lùi được) · ↩️ = Reversible.

### Bước 0 — Pre-Window Readiness Gate (↩️, làm trước khi mở cửa sổ, không phải một phần cửa sổ)

- [ ] Chạy lại toàn bộ bảng "Dependencies" ở trên, dán bằng chứng vào report.
- [ ] Chạy câu SQL audit lấy giá trị thật hiện tại của Tenant row (Central), **trước khi** quyết định chuỗi thay thế chính xác cho bước 4:
  ```sql
  SELECT slug, name, domain, additional_domains, frontend_url
    FROM tenants WHERE slug = 'dtw';
  ```
- [ ] Đếm số dòng `social_posts` đang `status='queued'` bên Engine Supabase (ảnh hưởng quyết định có re-render card cũ hay để chạy hết — theo D13/Phase 5, chỉ để tham khảo, không phải hành động của Phase 6):
  ```sql
  SELECT count(*) FROM social_posts
   WHERE publication_id = (SELECT id FROM publications WHERE slug='dtw') AND status='queued';
  ```
- [ ] Xác nhận với user 3 giá trị chưa chốt ở mục "Phát hiện bổ sung": slug LinkedIn mới, username Facebook mới, cách ghi annotation GA4.
- [ ] Chuẩn bị sẵn (copy-paste) toàn bộ giá trị env mới cho bước 3 và 5 **trước khi** vào Vercel dashboard, để giảm thời gian cửa sổ mở.
- [ ] **Thứ tự đọc quan trọng (bổ sung 09-09-26)**: các bước 4b-4f được đánh số theo cụm chủ đề, **không** theo thứ tự thời gian. Hai bước phải chạy SỚM hơn vị trí số của chúng:
      - **Bước 4d (thông báo người đăng ký)** → chạy **TRƯỚC Bước 3**. Đổi From-name không báo trước là cách nhanh nhất đốt sạch khoản warm-up domain của Phase 1.
      - **Bước 4e (template `.env.example` ×2)** → ship **trong cùng commit** với Bước 3.
      Các bước 4b (nội dung Central), 4c (audit `auth_users`), 4f (GitHub OAuth) chạy đúng vị trí số của chúng.
- [ ] Xác nhận Vercel áp dụng thay đổi env var qua một lượt **redeploy** (không phải hot-swap runtime) — theo hiểu biết chuẩn của Vercel, env var mới chỉ có hiệu lực từ deployment tiếp theo; điều này có nghĩa cửa sổ cutover về bản chất là **1 redeploy** chứ không phải nhiều thay đổi rời rạc, giảm rủi ro nửa-vời. Xác nhận lại hành vi này với user qua Vercel dashboard trước khi tin.

### Bước 1 — Xác nhận additive từ Phase 1 (↩️, chỉ xác nhận, không hành động mới)

- [ ] OAuth redirect URI mới đã tồn tại song song với URI cũ ở Google Cloud Console + GitHub App settings (không xoá URI cũ ở bước này).
- [ ] Resend: domain `opentechwire.com` hiển thị **Verified** trong dashboard; SPF/DKIM/DMARC pass; giai đoạn warm-up đã đủ thời gian theo khuyến nghị của Resend (không gửi khối lượng lớn ngay từ domain nguội).

### Bước 2 — Additive, KHÔNG swap (↩️)

- [ ] **Central `PUBLIC_API_ALLOWED_ORIGINS`**: thêm `https://www.opentechwire.com` vào biến env production của `apcg-cms` (giữ nguyên `https://www.dailytechwire.com` cho tới ít nhất hết cửa sổ — không xoá sớm). Tham chiếu: `apcg-cms/.env.example:42-43` (đã re-verify — dòng 42 comment ví dụ, dòng 43 giá trị dev), enforce tại `apcg-cms/src/payload.config.ts:67,143` (đã re-verify: dòng 67 parse CSV thành mảng, dòng 143 gán vào `cors`).
  - **Cảnh báo silent-failure #3** (xem mục riêng): nếu quên bước này trước khi domain mới bắt đầu gọi Central, `central-api.ts` biến lỗi thành **kết quả rỗng**, không throw — site render **rỗng mà không có log lỗi nào**.
- [ ] **R2 CORS allowlist**: thêm origin `https://www.opentechwire.com` vào CORS policy của bucket `dtw-media` (Cloudflare dashboard — bucket **giữ nguyên tên** theo D12, chỉ thêm origin được phép). Tham chiếu trong repo: `apps/web/payload.config.ts:68-76` (đã re-verify — comment giải thích presigned PUT `clientUploads` cần CORS policy khớp site origin).
- [ ] **Vercel — attach domain mới**: thêm `opentechwire.com` và `www.opentechwire.com` vào Vercel project của `dtw-web`, **song song** với `dailytechwire.com`/`www.dailytechwire.com` (chưa gỡ domain cũ ở bước này).

### Bước 2b — Gỡ domain cũ khỏi Vercel + DNS (🔒 ONE-WAY DOOR — bổ sung, không nằm trong 8 bước gốc, thực hiện theo D4)

- [ ] Sau khi domain mới đã xác nhận serve đúng nội dung (curl trả 200, xem Verification Evidence), **gỡ** `dailytechwire.com` và `www.dailytechwire.com` khỏi danh sách domain của Vercel project.
- [ ] Xoá bản ghi A/CNAME của `dailytechwire.com`/`www.dailytechwire.com` tại tenten.vn (thao tác ngoài repo, do user thực hiện qua registrar dashboard).
- [ ] **Xoá rule redirect apex→www của domain CŨ trong `apps/web/next.config.ts`** (hiện dòng 40-45, object có `has: [{ type: "host", value: "dailytechwire.com" }]`). Rule apex→www cho domain **mới** đã được Phase 2 thêm sẵn (dormant tới lúc này) — **không viết rule mới**, chỉ xoá rule cũ. Verify ngay: `command grep -c "dailytechwire" apps/web/next.config.ts` → **0**; `command grep -c "opentechwire" apps/web/next.config.ts` → **2**. Điều này thoả "Định nghĩa xong" mục 6 của umbrella ("không còn redirect rule nào theo host cũ") mà không vi phạm D4 (xem umbrella §4 mục 2: cấm là cấm redirect **xuyên domain**).
- [ ] **KHÔNG** đăng ký domain cũ vào bất kỳ project Vercel nào khác, **KHÔNG** thêm bất kỳ A/CNAME/redirect record nào khác cho nó. Giữ MX record nếu vẫn cần nhận mail ở các mailbox `@dailytechwire.com` cũ (quyết định riêng, không thuộc phạm vi kỹ thuật của bước này — hỏi user).
- [ ] **Nhắc user**: gia hạn đăng ký `dailytechwire.com` tại tenten.vn đúng hạn để giữ quyền sở hữu (parked), tránh bị bên thứ ba đăng ký lại — đây là yêu cầu tường minh của D4.

### Bước 3 — Lật cùng một deploy (🔒 ONE-WAY DOOR)

> **Chủ sở hữu duy nhất của `email.ts:13` và `auth.ts:78,84,97,103` là Phase 6** (phân giải chồng lấn 09-09-26, umbrella §6b.3 — Phase 4 từng cũng nhận chúng và nay đã bỏ). Lý do: tài liệu tham chiếu §5 yêu cầu display name + 4 chuỗi subject/body đi **cùng một deploy** với `RESEND_FROM_DOMAIN`; tách ra là gửi mail "tên mới @ domain cũ" suốt khoảng giữa hai phase — đúng chữ ký phishing mà §5 cảnh báo.
> **Tiền đề bắt buộc: Bước 4d (thông báo người đăng ký) phải xong TRƯỚC bước này.**

- [ ] Trên Vercel (project `dtw-web`), đặt cùng lúc 3 env var production:
  - `NEXT_PUBLIC_SITE_URL=https://www.opentechwire.com`
  - `BETTER_AUTH_URL=https://www.opentechwire.com`
  - `RESEND_FROM_DOMAIN=opentechwire.com`
- [ ] Sửa `apps/web/src/lib/email.ts:12-13` (đã re-verify nội dung hiện tại):
  - Dòng 12: `const fromDomain = process.env.RESEND_FROM_DOMAIN || "dailytechwire.com";` → đổi fallback sang `"opentechwire.com"`, và cân nhắc theo khuyến nghị tài liệu tham chiếu: **throw ở production khi `RESEND_FROM_DOMAIN` chưa set**, thay vì âm thầm dùng fallback (giảm rủi ro gửi mail từ domain sai mà không ai biết) — đây là một cải tiến hành vi, cần user xác nhận có muốn áp dụng ngay bây giờ hay giữ nguyên pattern fallback hiện tại.
  - Dòng 13: `` const FROM = `DailyTechWire <no-reply@${fromDomain}>`; `` → `` `Opentechwire <no-reply@${fromDomain}>` `` (D1: sentence case cho văn xuôi/tên hiển thị).
- [ ] Sửa `apps/web/src/lib/auth.ts` (đã re-verify 5 dòng, khớp đúng tài liệu tham chiếu):
  - Dòng 59: `baseURL: process.env.BETTER_AUTH_URL` — **không sửa code**, chỉ giá trị env đổi (đã ở bước trên).
  - Dòng 78: `"We received a request to reset your DailyTechWire password. This link expires in 1 hour."` → `"...your Opentechwire password..."`.
  - Dòng 84: `subject: "Reset your DailyTechWire password"` → `"Reset your Opentechwire password"`.
  - Dòng 97: `"Welcome to DailyTechWire. Confirm your email to activate your account."` → `"Welcome to Opentechwire. Confirm your email to activate your account."`.
  - Dòng 103: `subject: "Confirm your DailyTechWire account"` → `"Confirm your Opentechwire account"`.
- [ ] Trigger redeploy production (hoặc để Vercel tự trigger theo commit chứa 2 file trên) — xác nhận build xanh.
  - **Cảnh báo silent-failure #4** (xem mục riêng): deploy có thể xanh hoàn toàn, lỗi OAuth chỉ lộ ra ở lượt sign-in thật đầu tiên.

### Bước 4 — Central `/admin`: TOÀN BỘ tenant row (🔒 ONE-WAY DOOR cho phần domain, dữ liệu sống)

- [ ] Đăng nhập `/admin` của Central với tài khoản System Admin (chỉ role này sửa được `domain`/`frontendUrl`/`additionalDomains` — theo `apcg-cms/src/collections/Tenants.ts:73,85` `access: { update: ({req}) => isSystemAdmin(req) }`, đã re-verify).
- [ ] Sửa field `domain` của tenant `slug='dtw'` từ giá trị hiện tại (lấy từ SQL audit ở Bước 0) sang `opentechwire.com` (bare hostname, giữ đúng shape hiện có — theo mô tả field "Primary public hostname").
- [ ] Sửa field `frontendUrl` sang `https://www.opentechwire.com` (full URL có `www`, khớp D5 — **không** dùng apex dù ví dụ mặc định của field này là apex, vì canonical thật của publication này là www).
- [ ] **KHÔNG** thêm `dailytechwire.com` vào `additionalDomains` (đây là hệ quả D4 — khác với khuyến nghị gốc của tài liệu tham chiếu là giữ domain cũ trong `additionalDomains` để redirect). Nếu `additionalDomains` hiện đang trống, giữ trống.
- [ ] **Sửa nốt phần chrome/copy của cùng row đó (khôi phục phạm vi 09-09-26 — xem bảng "KHÔNG thuộc phạm vi")**: `name` → `Opentechwire`; `logo`, `brand.faviconUrl`, `brand.ogImageDefault` → trỏ asset mới của Phase 3; `brand.themeTokens` và `brandColor` → **không đổi giá trị màu** (D10), chỉ sửa chữ nếu có nhắc tên brand; `seo.titleSuffix` → `— Opentechwire`; `seo.defaultMetaDescription`, `seo.defaultOgImage`, `seo.twitterHandle`; `contact.{general,editorial,advertising,partnerships}Email` → domain mới (**chỉ sau khi Phase 1 xác nhận 5 mailbox mới đã nhận được mail** — cùng gate F2 của Phase 4, đừng trỏ vào hộp thư chưa tồn tại); `socials[]` → URL mới, khớp **chính xác** `footer.tsx:63-64` và `metadata.ts:90-91` ở Bước 6.
- [ ] **KHÔNG đổi field `slug`** (`'dtw'`, D11) — kể cả khi form cho phép.
- [ ] Lưu, xác nhận không có lỗi validation.
- [ ] Dán ảnh chụp/giá trị sau khi lưu của **toàn bộ** row vào report — "đã cập nhật tenant" không phải bằng chứng.

### Bước 4b — Central: nội dung do editor viết + seed script (BỔ SUNG 09-09-26, dữ liệu sống)

Không phase nào khác nhận các bề mặt này (Phase 4 chỉ phủ `dtw-web`, Phase 5 chỉ phủ `content-engine` + row `authors`). Chạy **các câu SQL audit ở §3.6 tài liệu tham chiếu — chạy THẬT, không chỉ dán câu lệnh**, rồi sửa qua `/admin` Central:

```sql
SELECT * FROM menus_items_locales    WHERE label ILIKE '%dtw%' OR label ILIKE '%dailytechwire%';
SELECT * FROM wire_drops_locales     WHERE text ILIKE '%dtw%' OR text ILIKE '%dailytechwire%';
SELECT * FROM corrections_locales    WHERE summary ILIKE '%dtw%' OR was_text ILIKE '%dtw%' OR now_text ILIKE '%dtw%';
SELECT * FROM sponsor_slots_locales  WHERE headline ILIKE '%dtw%' OR body ILIKE '%dtw%' OR cta_label ILIKE '%dtw%';
SELECT id, name, cta_url FROM sponsor_slots WHERE name ILIKE '%dtw%' OR cta_url ILIKE '%dailytechwire%';
SELECT id, alt FROM media_locales
 WHERE _parent_id IN (SELECT id FROM media WHERE tenant_id=(SELECT id FROM tenants WHERE slug='dtw'))
   AND (alt ILIKE '%dailytechwire%' OR caption ILIKE '%dailytechwire%');
```

- [ ] Dán **kết quả thật** của cả 6 câu vào report (kể cả khi rỗng — "0 row" cũng là bằng chứng, "chưa chạy" thì không).
- [ ] Sửa từng hit qua `/admin`, áp umbrella §5.1.1. Ưu tiên `sponsor_slots.cta_url` chứa domain cũ (link chết sau cutover) và `menus_items_locales.label` (nav reader nhìn thấy, do DB điều khiển — một đợt rebrand chỉ động vào code sẽ bỏ sót hoàn toàn).
- [ ] **KHÔNG đụng `media.prefix`** (`apcg-cms/src/collections/Media.ts:130` — hook ghi-một-lần, cố tình không rewrite; umbrella §5.3).
- [ ] `apcg-cms/scripts/seed.ts`: sửa `name` dòng **208** (`'DailyTechWire'` → `'Opentechwire'`) và các chuỗi dòng 267, 277, 281 (`DTW Awards` → `OTW Awards`, `DTW Daily Brief` → `OTW Daily Brief`), 447-448, 462, 481 (`show: "DTW"` → `"OTW"`). **KHÔNG đổi `slug` dòng 207** và **KHÔNG đổi `if (t.slug === 'dtw')`** — D11, umbrella §5.3. Sửa seed chỉ ngăn một lần re-seed đưa brand cũ quay lại; các row đang sống vẫn phải sửa qua `/admin` như trên.

Verify: chạy lại đúng 6 câu SQL → 0 row; `command grep -n "DailyTechWire\|DTW" /home/hieunc/Code/apcg-cms/scripts/seed.ts` → chỉ còn các dòng chứa `slug: "dtw"` / `t.slug === 'dtw'`.

### Bước 4c — Audit `dtw_auth.auth_users` (BỔ SUNG 09-09-26)

Email **chính là login identity** của Better-Auth và nằm trên một unique index — không phải một cột hiển thị có thể `UPDATE` tuỳ ý.

```sql
SELECT id, name, email, role FROM dtw_auth.auth_users
 WHERE email ILIKE '%@dailytechwire.com' OR name ILIKE '%dailytechwire%' OR name ~ '\yDTW\y';
```

- [ ] Dán kết quả thật vào report.
- [ ] Nếu **0 row**: ghi "không có tài khoản staff nào trên domain cũ", xong bước này.
- [ ] Nếu **> 0 row**: **KHÔNG đổi email trong cửa sổ cutover.** Lập kế hoạch **giai đoạn alias** riêng (mailbox mới nhận song song, người dùng tự đổi, hoặc thêm identity mới rồi mới gỡ cái cũ). Cắt phát một là khoá chính những người vận hành site ra ngoài đúng lúc cần họ nhất. Ghi thành một mục theo dõi riêng trong report, **không** biến nó thành một bước ứng biến giữa cửa sổ.
- [ ] **Không đụng** schema `dtw_auth` hay bất kỳ file nào trong `packages/db/migrations/**` (D12).

### Bước 4d — Thông báo người đăng ký newsletter (BỔ SUNG 09-09-26) — PHẢI XONG **TRƯỚC** BƯỚC 3

`apcg-cms/src/collections/Subscribers.ts` không có field brand nào, nên một lượt quét theo chuỗi sẽ không bao giờ tìm ra bước này — nhưng tài liệu tham chiếu §3.6 ghi rõ đây là **nghĩa vụ trước bất kỳ thay đổi From-name nào**.

```sql
SELECT count(*) FROM subscribers WHERE tenant_id=(SELECT id FROM tenants WHERE slug='dtw');
```

- [ ] Đếm số người đăng ký thật, dán vào report.
- [ ] Gửi một email thông báo **từ domain/From-name CŨ** (lúc này vẫn đang chạy) báo trước rằng người gửi sắp đổi thành `Opentechwire <no-reply@opentechwire.com>`, kèm hướng dẫn thêm địa chỉ mới vào danh bạ.
- [ ] Vì sao phải trước Bước 3: đổi From-name mà không báo trước là kịch bản kinh điển khiến người nhận bấm "spam" — một domain vừa warm-up xong bị đánh spam ở lô đầu tiên là mất luôn khoản đầu tư warm-up của Phase 1.
- [ ] Nếu số subscriber = 0: ghi vào report và bỏ qua, nhưng **phải ghi**, không được im lặng bỏ.

### Bước 4e — Template env trong repo (BỔ SUNG 09-09-26)

Hai dòng này bị **Phase 2 đẩy sang Phase 6** và Phase 6 (bản trước) tự tuyên bố "không sửa `.env.example`" — kết quả là **không phase nào sửa**. Nay thuộc Bước 4e, ship trong **cùng commit** với Bước 3:

| File | Dòng | Hiện tại | Mới |
|---|---|---|---|
| `.env.example` (root) | 52 | `RESEND_FROM_DOMAIN="dailytechwire.com"` | `RESEND_FROM_DOMAIN="opentechwire.com"` |
| `apps/web/.env.example` | 51 | `RESEND_FROM_DOMAIN="dailytechwire.com"` | `RESEND_FROM_DOMAIN="opentechwire.com"` |

Hai file phải đổi **lockstep** — lệch nhau là để lại một template dạy sai cho dev tiếp theo. Verify: `command grep -rn "RESEND_FROM_DOMAIN" .env.example apps/web/.env.example` → cả hai đều `opentechwire.com`.
Lưu ý: `.env.example` nằm trong `env` array của `turbo.json`, nên đổi nó **bust turbo cache** một lần — bình thường, không phải lỗi.

### Bước 4f — GitHub OAuth: swap trong cửa sổ nếu app chỉ nhận MỘT callback URL (BỔ SUNG 09-09-26)

Phase 1 bước E.3 phát hiện: nếu OAuth App là loại **classic**, nó chỉ có **một** ô "Authorization callback URL" — nghĩa là việc "thêm không thay" của Phase 1 **bất khả thi về kỹ thuật** cho riêng GitHub, và bảng Dependencies của Phase 6 (đòi "URI mới đã thêm ở cả Google lẫn GitHub") sẽ **không bao giờ thoả được**. Đây là một mâu thuẫn dependency thật, không phải một khả năng lý thuyết.

Xử lý:
- [ ] Đọc report Phase 1 bước E.5 để biết kết luận: GitHub **thêm được song song** hay **chỉ có một ô**.
- [ ] Nếu **thêm được song song**: không cần bước này, dependency đã thoả bình thường.
- [ ] Nếu **chỉ có một ô**: thực hiện swap `https://www.opentechwire.com/api/auth/callback/github` **ngay sau khi** Bước 3 redeploy xong và **trước** Bước 9 (test đăng nhập). Chấp nhận một cửa sổ vài phút mà sign-in GitHub hỏng — **có chủ đích, ghi vào report**, không phải bất ngờ giữa cửa sổ.
- [ ] Dù đi nhánh nào, bảng "Dependencies" ở đầu plan này phải được đọc theo nghĩa: *"Google đã thêm song song; GitHub hoặc đã thêm song song, hoặc đã có quyết định swap-in-window ghi trong report Phase 1"* — không phải "cả hai đều đã thêm".

### Bước 5 — Vercel của `content-engine`: `DTW_INTAKE_URL` (🔒 ONE-WAY DOOR, có ràng buộc thứ tự bắt buộc)

- [ ] **Xác nhận trước:** `dtw-web` đã phục vụ `https://www.opentechwire.com` thành công (curl 200) — **chỉ sau đó** mới thực hiện bước này. Nếu đổi ngược thứ tự, Engine sẽ POST vào một host chưa sẵn sàng, cron publish sẽ ngừng thầm lặng.
- [ ] Trên Vercel project của `content-engine` (`admin`), đặt `DTW_INTAKE_URL=https://www.opentechwire.com` — **dùng www**, sửa luôn bug lệch apex có sẵn từ trước (`content-engine/admin/.env.example:23` hiện ghi apex, đã re-verify).
- [ ] **Không đổi** tên biến `DTW_INTAKE_URL`/`DTW_INTAKE_TOKEN` (đóng băng theo §5.2 umbrella) — chỉ giá trị URL đổi, token giữ nguyên.
- [ ] Trigger một chu kỳ publish thật (chờ tối đa 15 phút cho cron `/api/cron/publish-dtw` chạy, theo `admin/vercel.json` đã re-verify: schedule `*/15 * * * *`) và xác nhận bài mới publish thành công qua host mới.

### Bước 6 — Social + code cùng cửa sổ (🔒 ONE-WAY DOOR cho social; ↩️ cho code)

- [ ] **Trước tiên (external):** đổi vanity slug LinkedIn company page sang giá trị đã chốt ở Bước 0 (LinkedIn admin — có rate limit, **không có redirect**, 404 ngay khoảnh khắc đổi).
- [ ] Đổi username Facebook Page sang giá trị đã chốt ở Bước 0 (Meta Business Settings — có rate limit; **username cũ có thể bị bên thứ ba chiếm** sau khi đổi).
- [ ] **Ngay sau đó (code, cùng cửa sổ để tránh lệch):** sửa `apps/web/src/components/footer.tsx:63-64` (đã re-verify):
  - Dòng 63: `["LinkedIn", "linkedin", "https://www.linkedin.com/company/dailytechwire/"]` → URL LinkedIn mới.
  - Dòng 64: `["Facebook", "facebook", "https://www.facebook.com/apcgdailytechwire/"]` → URL Facebook mới.
  - (Dòng 66 `mailto:info@dailytechwire.com` **không thuộc bước này** — đây là mailbox literal, thuộc Phase 4 copy pass, không phụ thuộc social rename; chỉ đổi nếu mailbox mới đã provisioned).
- [ ] Sửa `apps/web/src/lib/metadata.ts:90-91` (đã re-verify, mảng `ORGANIZATION.sameAs`):
  - Dòng 90: `"https://www.linkedin.com/company/dailytechwire/"` → URL LinkedIn mới (khớp chính xác footer.tsx).
  - Dòng 91: `"https://www.facebook.com/apcgdailytechwire/"` → URL Facebook mới (khớp chính xác footer.tsx).
- [ ] Deploy 2 file trên cùng một commit/PR để `footer.tsx` và `metadata.ts` không bao giờ lệch nhau (đã từng là rủi ro nêu trong tài liệu tham chiếu — hai chỗ lặp cùng một cặp URL).

### Bước 7 — GA4 (↩️, thao tác ngoài repo)

- [ ] Giữ nguyên property `G-5H175FPLGR` (đóng băng — đã re-verify tại `apps/web/src/app/(reader)/layout.tsx:19-20`, không đổi code).
- [ ] GA4 Admin → Data Streams → sửa URL đã đăng ký của web stream sang `https://www.opentechwire.com`.
- [ ] GA4 Admin → Data Settings → Data Streams → cấu hình tag → thêm `dailytechwire.com` và `www.dailytechwire.com` vào danh sách referral exclusion.
- [ ] Ghi mốc cutover theo phương án đã chốt ở Bước 0 (annotation thủ công / Looker Studio / report) — dán bằng chứng (ảnh chụp hoặc link) vào report Phase 6.
- [ ] Giữ nguyên `utmCampaign: 'dtw-social'` (đóng băng — đã nằm trong URL đã đăng và lịch sử GA4, không đổi ở bất kỳ đâu).

### Bước 8 — Storage key theo D14 (↩️, thuần code)

Đổi giá trị chuỗi (không bắt buộc đổi tên hằng số TS) tại 6 vị trí sau (đã re-verify toàn bộ số dòng ngày 09-09-26):

| File | Dòng | Giá trị cũ | Giá trị mới đề xuất | Loại |
|---|---|---|---|---|
| `apps/web/src/lib/article-views.ts` | 31 | `"dtw-viewed"` | `"otw-viewed"` | `localStorage` |
| `apps/web/src/lib/paywall.ts` | 26 | `"dtw-read-count"` | `"otw-read-count"` | cookie, không có `domain=` (dòng 84 xác nhận: `path=/` only) |
| `apps/web/src/components/theme-provider.tsx` | 16 | `"dtw-theme"` | `"otw-theme"` | `localStorage` |
| `apps/web/src/lib/i18n.tsx` | 27 | `"dtw-lang"` | `"otw-lang"` | `localStorage` |
| `apps/web/src/components/cookie-banner.tsx` | 8 | `"dtw-cookies"` | `"otw-cookies"` | `localStorage` |
| `apps/web/src/components/header.tsx` | 20 | `"dtw-nudge-dismissed"` | `"otw-nudge-dismissed"` | `localStorage` |

Ghi chú: tiền tố `otw-` là định danh nội bộ (không phải chuỗi wordmark/OG lockup), nên quy tắc D1 "opentechwire viết thường chỉ trong wordmark" không áp dụng cho các key này — đây là identifier kỹ thuật tương tự cách `dtw-` đã được dùng trước đây, không phải một instance hiển thị của tên brand.

- [ ] Đổi cả 6 giá trị trong cùng một commit (có thể gộp chung với commit của Bước 3, vì không có ràng buộc kỹ thuật bắt buộc phải tách riêng — nhưng KHÔNG bắt buộc gộp, các key này an toàn để đổi độc lập với domain flip nếu tiện hơn cho quy trình review).
- [ ] Không cần viết migration đọc-key-cũ — theo D14, việc đổi domain đã xoá sạch giá trị cũ theo origin, không có state nào để "chuyển".

### Bước 9 — Đóng cửa sổ / xác nhận cuối (bổ sung, không nằm trong 8 bước gốc — bắt buộc trước khi coi phase `🧪 TESTING`)

- [ ] Chạy lệnh grep chuẩn (xem Verification Evidence) trên `apps/web/src/lib/feed.ts` — xác nhận **không sửa code** nhưng `tag:` URI đã tự đổi sang host mới bằng cách gọi thử endpoint feed thật và đọc `<id>`/`tag:` trong response.
- [ ] Thực hiện lượt đăng nhập thật: 1 lần magic-link, 1 lần OAuth (Google hoặc GitHub) trên `https://www.opentechwire.com`.
- [ ] Xác nhận Central không trả kết quả rỗng cho bất kỳ trang nào (kiểm tra ít nhất trang chủ + 1 trang pillar + 1 trang article) — loại trừ silent-failure #3.
- [ ] Xác nhận `dailytechwire.com` không còn A record và không trả response từ hạ tầng Vercel/Opentechwire.
- [ ] Dán toàn bộ bằng chứng vào report `process/features/rebrand/reports/phase-6-cutover_REPORT_<dd-mm-yy>.md`.

---

## 5 Kiểu Hỏng Âm Thầm — ánh xạ vào từng bước của Phase 6

| # | Kiểu hỏng (từ umbrella §7) | Có xảy ra trong Phase 6 không | Bước liên quan | Cách phát hiện | Giảm thiểu |
|---|---|---|---|---|---|
| 1 | Vercel cron trỏ route đã đổi tên (`/api/cron/publish-dtw`) | **Không trực tiếp** — Phase 6 không đổi tên route này (đóng băng theo D11) | — | Nếu vô tình đổi: cron ngừng chạy không log | Không chạm `admin/vercel.json` hay thư mục route `publish-dtw` ở bất kỳ bước nào trong Phase 6 |
| 2 | Repo variable GitHub Actions fail-closed (`BRIEF_COMPOSE_PUBS`, v.v.) | **Không trực tiếp** — Phase 6 không đổi các repo variable này | — | Workflow run vẫn xanh dù 0 publication compose | Không chạy `gh variable set` cho các key này trong Phase 6 |
| 3 | Allowlist CORS làm trống rỗng cả site (`PUBLIC_API_ALLOWED_ORIGINS`) | **CÓ — rủi ro trực tiếp nhất của Phase 6** | Bước 2 (phải làm TRƯỚC bước 3) | Trang chủ/pillar/article render trống, không có log lỗi server | Thứ tự bắt buộc: Bước 2 xong và xác nhận trước khi Bước 3 flip `NEXT_PUBLIC_SITE_URL` |
| 4 | OAuth redirect URI chỉ hỏng ở lần dùng thật đầu tiên | **CÓ** | Bước 1 (tiền đề) + Bước 3 (flip `BETTER_AUTH_URL`) + Bước 9 (test thật) | Sign-in thất bại với `redirect_uri_mismatch` hoặc cảnh báo app chưa verify | Bước 9 bắt buộc có 1 lượt đăng nhập OAuth thật trước khi đóng phase |
| 5 | Sửa snapshot `drizzle-kit` phát ra `DROP SCHEMA` lên DB dùng chung | **Không trong phạm vi** — Phase 6 không chạm `packages/db/src/schema/auth.ts` hay bất kỳ file `packages/db/migrations/**` nào | — | `drizzle-kit generate` sinh ra migration DROP/CREATE SCHEMA | Không chạy `drizzle-kit generate`/`migrate` cho bất kỳ lý do gì trong Phase 6; nếu một tool tự động (vd. một agent thực thi ẩu) đề xuất chạy lệnh này, dừng lại ngay |

---

## Rollback Plan

**Tổng quan:** Phase 6 là ONE-WAY DOOR ở tầng chương trình — không có một lệnh "revert" duy nhất. Rollback nghĩa là dựng lại từng phần theo mức độ khó tăng dần:

| Phần | Có rollback được không | Cách làm |
|---|---|---|
| Code (`email.ts`, `auth.ts`, `footer.tsx`, `metadata.ts`, 6 storage key) | **Có, dễ** | `git revert` commit tương ứng, redeploy |
| Env var Vercel (`NEXT_PUBLIC_SITE_URL`, `BETTER_AUTH_URL`, `RESEND_FROM_DOMAIN`, `DTW_INTAKE_URL`) | **Có, dễ** | Đặt lại giá trị cũ trên dashboard, trigger redeploy |
| Central Tenant `domain`/`frontendUrl` | **Có, dễ** | Sửa lại qua `/admin` về giá trị cũ đã lấy từ SQL audit ở Bước 0 |
| `PUBLIC_API_ALLOWED_ORIGINS`, R2 CORS allowlist | **Có, dễ** (đây là additive — không cần rollback nếu chỉ **thêm**, có thể để nguyên vô hại) | Xoá origin mới nếu muốn dọn sạch, không bắt buộc |
| Vercel domain attach (mới) | **Có, dễ** | Gỡ domain mới khỏi project nếu cần |
| **Vercel domain detach + xoá DNS record (domain cũ, Bước 2b)** | **KHÓ — gần như một chiều** | Phải đăng ký lại A/CNAME tại tenten.vn và attach lại vào Vercel; nếu đã có độ trễ, một số crawler/DNS resolver có thể đã cache NXDOMAIN trong nhiều giờ |
| **Social slug LinkedIn/Facebook (Bước 6)** | **KHÔNG đảm bảo** | Có rate-limit đổi tên; tên cũ có thể đã bị bên thứ ba chiếm; đây là rủi ro **vĩnh viễn** nếu phát hiện lỗi sau khi đổi |
| **RSS/Atom subscriber continuity** | **KHÔNG áp dụng được, đã chấp nhận theo D4** | Subscriber cũ trỏ vào domain cũ sẽ nhận lỗi kết nối (không phải 301) vĩnh viễn — đây là hệ quả trực tiếp, có chủ đích của D4, không phải một lỗi cần "rollback" |
| Đăng nhập của reader đang hoạt động | **KHÔNG tránh được** | Đổi host luôn đăng xuất mọi session đang mở (Better-Auth cookie theo prefix chung, không có cơ chế di trú session xuyên origin) — đã biết trước, không phải lỗi |

**Quy tắc an toàn khi mở cửa sổ:** thực hiện Bước 1–2 trước và để chúng "ngồi yên" một khoảng thời gian (khuyến nghị vài giờ đến 1 ngày) trước khi làm Bước 2b/3 trở đi — nếu phát hiện vấn đề ở giai đoạn additive (Bước 1-2), việc dừng lại **không tốn gì** (chưa có gì bị flip). Bước 2b trở đi mới là điểm không thể lùi dễ dàng.

---

## Touchpoints

**Code — `dtw-web`** (đã re-verify toàn bộ số dòng ngày 09-09-26):
- `apps/web/src/lib/email.ts:12-13`
- `apps/web/src/lib/auth.ts:59,78,84,97,103` (chỉ 78/84/97/103 đổi text; 59 không sửa, chỉ env value đổi)
- `apps/web/src/components/footer.tsx:63,64`
- `apps/web/src/lib/metadata.ts:90,91`
- `apps/web/src/lib/article-views.ts:31`
- `apps/web/src/lib/paywall.ts:26`
- `apps/web/src/components/theme-provider.tsx:16`
- `apps/web/src/lib/i18n.tsx:27`
- `apps/web/src/components/cookie-banner.tsx:8`
- `apps/web/src/components/header.tsx:20`
- `apps/web/next.config.ts:40-45` (phát hiện bổ sung — cần xác nhận user trước khi sửa, xem mục riêng)
- `apps/web/payload.config.ts:68-76` (chỉ đọc, không sửa — dùng làm tham chiếu cho R2 CORS)
- `apps/web/src/lib/feed.ts:61,69,87,116` (chỉ verify hành vi, không sửa code)

**Config/env ngoài code, trong repo dưới dạng template** (chỉ production value đổi trên Vercel, không sửa `.env.example`):
- `NEXT_PUBLIC_SITE_URL`, `BETTER_AUTH_URL`, `RESEND_FROM_DOMAIN` (Vercel — `dtw-web`)
- `DTW_INTAKE_URL` (Vercel — `content-engine` admin)

**Code — `dtw-web` (bổ sung 09-09-26)**:
- `apps/web/next.config.ts:40-45` — **xoá** rule host cũ (Bước 2b)
- `.env.example:52` và `apps/web/.env.example:51` — `RESEND_FROM_DOMAIN` (Bước 4e)

**Code — `apcg-cms` (bổ sung 09-09-26)**:
- `scripts/seed.ts` dòng 208, 267, 277, 281, 447-448, 462, 481 (**không** dòng 207 `slug`)

**Live data — `apcg-cms` (Central)**:
- **Toàn bộ** tenant row `slug='dtw'`: `domain`, `frontend_url`, `name`, `logo`, `brand_color`, `brand.*`, `seo.*`, `contact.*_email`, `socials[]` — qua `/admin`, schema tại `apcg-cms/src/collections/Tenants.ts:48,73,79-83,85-90,92-100,132-138,144-150,154-158,204`
- `menus_items_locales.label`, `wire_drops_locales.text`, `corrections_locales.*`, `sponsor_slots(_locales).*` + `cta_url`, `media_locales.alt/caption` (Bước 4b)

**Live data — `dtw-web` auth DB**:
- `dtw_auth.auth_users` — **chỉ AUDIT, không UPDATE trong cửa sổ** (Bước 4c)

**Bên ngoài mọi repo**:
- Vercel domain attach/detach (`dtw-web` project)
- Cloudflare R2 CORS policy (bucket `dtw-media`)
- Cloudflare DNS / tenten.vn (xoá A/CNAME domain cũ)
- GA4 Admin (data stream URL, referral exclusion)
- LinkedIn company page vanity slug
- Meta Business Settings — Facebook Page username

---

## Public Contracts

- **`PUBLIC_API_ALLOWED_ORIGINS`** (Central ↔ `dtw-web`): hợp đồng CORS/origin-allowlist. Phase 6 **thêm** origin mới trước khi `dtw-web` bắt đầu gọi Central từ domain đó — vi phạm thứ tự này làm site rỗng trong im lặng (silent-failure #3).
- **`DTW_INTAKE_URL`/`DTW_INTAKE_TOKEN`** (Engine → Payload intake API): tên biến giữ nguyên; chỉ giá trị URL đổi, và chỉ đổi **sau khi** `dtw-web` đã phục vụ domain mới.
- **OAuth `redirect_uri`** (Google + GitHub): hợp đồng bên thứ ba — Phase 6 chỉ **sử dụng** URI đã thêm ở Phase 1, không tạo URI mới ở đây.
- **Atom/RSS feed identity** (`tag:` URI, `<id>`): theo D4, hợp đồng này **không được giữ ổn định xuyên domain-move**. Phase 6 chấp nhận và xác minh (không sửa code) rằng `tag:` URI đổi theo host mới ngay khi `NEXT_PUBLIC_SITE_URL` flip.
- **`publicationId`/slug `dtw`** (Central ↔ content-engine registry): đóng băng vĩnh viễn theo D11 — Phase 6 không chạm giá trị này ở bất kỳ đâu, kể cả khi sửa Tenant row.
- **Better-Auth session cookie prefix** (`better-auth.*`, không có `appName`/`trustedOrigins` cấu hình riêng): không có hợp đồng nào bị phá vỡ bởi việc đổi tên brand — nhưng đổi **host** chắc chắn đăng xuất mọi session đang mở, đây là hành vi đã biết trước, không phải regression.

---

## Blast Radius

Bảng dưới đây **chỉ liệt kê phần Phase 6 chạm tới**, trích đúng từ tài liệu tham chiếu §3.2/§3.4/§3.6/§4.4 và đã re-verify lại số dòng thật ngày 09-09-26. Không chép lại toàn bộ bảng §3 của tài liệu tham chiếu — phase khác đã/sẽ trích phần của mình riêng.

| File / Hệ thống | Dòng | Hiện tại | Sau Phase 6 | Rủi ro (theo tài liệu tham chiếu) |
|---|---|---|---|---|
| `apps/web/src/lib/email.ts` | 12-13 | fallback `"dailytechwire.com"`, `FROM = "DailyTechWire <no-reply@…>"` | fallback `"opentechwire.com"`, `FROM = "Opentechwire <no-reply@…>"` | **high** |
| `apps/web/src/lib/auth.ts` | 78,84,97,103 | 4 chuỗi `DailyTechWire` trong subject/body magic-link & reset | `Opentechwire` | **high** |
| `apps/web/src/lib/auth.ts` | 59 | `baseURL: process.env.BETTER_AUTH_URL` | không đổi code; env value đổi cùng deploy | **high** (nếu lệch deploy với `NEXT_PUBLIC_SITE_URL`) |
| (Vercel env, ngoài repo) | — | `NEXT_PUBLIC_SITE_URL=https://www.dailytechwire.com` | `https://www.opentechwire.com` | **high** |
| `apps/web/src/components/footer.tsx` | 63,64 | URL LinkedIn/Facebook cũ | URL mới, khớp `metadata.ts` | **high** |
| `apps/web/src/lib/metadata.ts` | 90,91 | `sameAs` cũ | `sameAs` mới, khớp `footer.tsx` | **high** |
| `apcg-cms` Tenant row `slug='dtw'` | field `domain`,`frontendUrl` | domain/URL cũ | domain/URL mới; `additionalDomains` KHÔNG thêm domain cũ (khác khuyến nghị gốc của tài liệu tham chiếu, do D4) | **high** — "đòn bẩy lớn nhất" theo tài liệu tham chiếu §3.6 |
| `apcg-cms` `PUBLIC_API_ALLOWED_ORIGINS` (env production) | — | chỉ có origin cũ | thêm origin mới (additive) | **high** — silent-failure nếu sai thứ tự |
| R2 bucket `dtw-media` CORS policy | — | chỉ origin cũ | thêm origin mới; tên bucket **không đổi** (D12) | **high** |
| `content-engine` admin Vercel env `DTW_INTAKE_URL` | — | apex domain cũ | www domain mới (sửa luôn bug apex) | **high** |
| `apps/web/src/lib/article-views.ts` | 31 | `"dtw-viewed"` | `"otw-viewed"` | low |
| `apps/web/src/lib/paywall.ts` | 26 | `"dtw-read-count"` | `"otw-read-count"` | low |
| `apps/web/src/components/theme-provider.tsx` | 16 | `"dtw-theme"` | `"otw-theme"` | low |
| `apps/web/src/lib/i18n.tsx` | 27 | `"dtw-lang"` | `"otw-lang"` | low |
| `apps/web/src/components/cookie-banner.tsx` | 8 | `"dtw-cookies"` | `"otw-cookies"` | med (đổi host cũng làm banner consent hiện lại — theo invariant #12) |
| `apps/web/src/components/header.tsx` | 20 | `"dtw-nudge-dismissed"` | `"otw-nudge-dismissed"` | low |
| GA4 (ngoài repo) | — | data stream URL cũ, không có referral exclusion cho domain nào | URL mới, exclusion thêm domain cũ | med |
| LinkedIn/Facebook (ngoài repo) | — | slug/username cũ | slug/username mới | **high** — rate-limit, không redirect |
| `dailytechwire.com`/`www.dailytechwire.com` DNS (ngoài repo) | — | A record trỏ Vercel | **Không A record**, parked (Bước 2b) | **high** — one-way door |
| `apps/web/next.config.ts` | 40-45 | apex→www rule cho domain **cũ** | **cần quyết định user** (xem "Phát hiện bổ sung" #1) — KHÔNG phải rule redirect-sang-domain-mới, không bị D4 cấm | med — cấu hình chết nếu không xử lý |

---

## Verification Evidence

**Lệnh grep chuẩn** (chạy trước và sau cửa sổ cutover, dùng đúng `--exclude` vì grep trong môi trường này là ugrep shim — âm thầm tuân `.gitignore` và bỏ qua binary nếu thiếu flag):

```bash
command grep -rniE 'dailytechwire|daily ?tech ?wire|\bdtw\b|@dtw/|Tech Intelligence, Wired Daily' . \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=.turbo \
  --exclude-dir=dist --exclude='*.tsbuildinfo' --exclude=pnpm-lock.yaml --exclude-dir=data-exports
```

Kỳ vọng sau Phase 6: các file đã sửa ở bước 3/4e/6/8 không còn xuất hiện trong kết quả. Vì Phase 6 chạy **sau** Phase 4 (bảng Dependencies), `layout.tsx` title/`og:site_name`/3 route RSS **đã sạch từ Phase 4** — nếu chúng vẫn còn `DailyTechWire` tại thời điểm Phase 6 thì **Phase 4 chưa xong**, dependency chưa thoả, dừng lại. Chỉ các định danh đóng băng D11/D12 (§5.2) và các mục Phase 7 (`@dtw/*` nếu D6 kích hoạt, `media-engine` `SiteCode`) được phép còn sót.

**Typecheck** (sau khi sửa `email.ts`, `auth.ts`, `footer.tsx`, `metadata.ts`, 6 storage key):
```bash
pnpm typecheck
```
(chạy `turbo typecheck` → `tsc --noEmit` trong `apps/web`, theo `package.json:15`, `apps/web/package.json:13`, đã re-verify).

**Content-engine test suite** (chỉ regression-check, đã chạy thật ở Phase 5 — Phase 6 không sửa code content-engine nên không bắt buộc chạy lại, nhưng khuyến nghị chạy lại 1 lần sau khi `DTW_INTAKE_URL` flip để chắc không có fixture nào phụ thuộc giá trị cũ):
```bash
cd /home/hieunc/Code/content-engine && npm test
```

**DNS / mail (Phase 1 tiền đề, xác nhận lại trước cửa sổ)**:
```bash
dig +short TXT opentechwire.com          # SPF record
dig +short TXT _dmarc.opentechwire.com   # DMARC record
# tên record DKIM lấy chính xác từ Resend dashboard trước khi dig
```

**Domain cũ đã parked, không A record (sau Bước 2b)**:
```bash
dig +short A dailytechwire.com
dig +short A www.dailytechwire.com
```
Kỳ vọng: rỗng (hoặc chỉ còn NS/SOA của tenten.vn, không có A record trỏ Vercel).

**Domain mới phục vụ đúng nội dung (sau Bước 3)**:
```bash
curl -sI https://www.opentechwire.com | head -5
```
Kỳ vọng: `HTTP/2 200`.

**Feed identity đã tự đổi theo host mới (Bước 9, không sửa code)**:
```bash
curl -s https://www.opentechwire.com/rss.xml | command grep -m3 -E '<id>|tag:'
```
Kỳ vọng: `tag:www.opentechwire.com,...` — không còn `dailytechwire.com`.

**Manual Test bắt buộc (không thể tự động hoá, cần user hoặc tester thật thực hiện)**:
- Đăng nhập bằng magic-link trên `https://www.opentechwire.com` → thành công, không lỗi redirect.
- Đăng nhập bằng ít nhất 1 OAuth provider (Google hoặc GitHub) → thành công, không `redirect_uri_mismatch`.
- Mở trang chủ, 1 trang pillar, 1 trang article trên domain mới → không trang nào render rỗng (loại trừ silent-failure CORS).
- Mở LinkedIn/Facebook link ở footer → trỏ đúng trang mới, không 404.
- Đợi 1 chu kỳ cron (`*/15 * * * *`) và xác nhận `content-engine` publish được ít nhất 1 bài qua host mới.

**Repo `dtw-web` hiện gần như chưa có test tự động** (xác nhận qua `process/context/tests/all-tests.md` — greenfield, "No tests exist yet"). Vì vậy bằng chứng cho Phase 6 chủ yếu là **manual + dashboard thật + grep + typecheck**, không phải một test suite tự động — đây là giới hạn có thật của repo, không phải một khoảng trống riêng của phase này.

---

## Acceptance Criteria

1. `https://www.opentechwire.com` phục vụ production, trả `200` cho trang chủ, ít nhất 1 pillar, ít nhất 1 article.
2. `dig +short A dailytechwire.com` và `dig +short A www.dailytechwire.com` đều rỗng — không A record, không redirect response.
3. Một lượt đăng nhập thật (magic-link **và** ít nhất một OAuth provider) trên domain mới thành công — có bằng chứng dán vào report.
4. `apps/web/src/lib/feed.ts` sinh `tag:` URI theo host mới khi gọi `curl` thật vào `/rss.xml` — không sửa code, chỉ xác minh hành vi.
5. Central không trả kết quả rỗng cho bất kỳ trang nào đã test thủ công (loại trừ silent-failure CORS).
6. `content-engine` publish thành công ít nhất 1 bài qua `DTW_INTAKE_URL` mới sau khi flip.
7. `pnpm typecheck` sạch sau khi sửa `email.ts`, `auth.ts`, `footer.tsx`, `metadata.ts`.
8. 6 storage-key đã đổi giá trị đúng theo bảng D14 — xác nhận bằng grep + đọc code, không cần test runtime vì browser đã tự mất state theo origin.
9. `footer.tsx:63-64` và `metadata.ts:90-91` chứa **cùng một cặp URL** LinkedIn/Facebook mới — không lệch nhau.
10. Không có commit nào trong Phase 6 chạm vào danh sách file cấm động (`packages/db/migrations/**`, `packages/db/src/schema/auth.ts:24`, `apcg-cms/scripts/seed.ts:207` field `slug`, `apcg-cms/src/collections/Media.ts:130` field `prefix`) — kiểm bằng `git log --oneline -- <path>` cho từng file sau khi phase đóng.
11. `dailytechwire.com` vẫn hiển thị **đã đăng ký, chưa hết hạn** tại tenten.vn (quyền sở hữu được giữ, theo D4) — user xác nhận qua registrar dashboard.
12. **Bước 4 (tenant row)**: report chứa giá trị sau-khi-lưu của TOÀN BỘ row (không chỉ `domain`/`frontendUrl`); `slug` vẫn là `'dtw'`.
13. **Bước 4b**: 6 câu SQL audit đã chạy thật, kết quả (kể cả "0 row") dán vào report; `apcg-cms/scripts/seed.ts` sạch brand trừ `slug: "dtw"` và guard `t.slug === 'dtw'`.
14. **Bước 4c**: câu audit `dtw_auth.auth_users` đã chạy thật; nếu có hit, report chứa kế hoạch giai đoạn alias — **không** có email nào bị đổi trong cửa sổ.
15. **Bước 4d**: số subscriber đã đếm và email thông báo đã gửi **trước** Bước 3 (có mốc thời gian trong report).
16. **Bước 4e**: `command grep -rn "RESEND_FROM_DOMAIN" .env.example apps/web/.env.example` → cả hai đều `opentechwire.com`.
17. **Bước 2b**: `command grep -c "dailytechwire" apps/web/next.config.ts` → 0 và `command grep -c "opentechwire" apps/web/next.config.ts` → 2 (đúng một host rule apex→www cho domain mới).
18. **Bước 4f**: report ghi rõ GitHub OAuth đi nhánh nào (thêm song song / swap-in-window), không để "chưa rõ".
19. User đã xem toàn bộ bằng chứng ở report và xác nhận bằng lời trước khi phase được đánh dấu `✅ VERIFIED` — nếu chưa, trạng thái cao nhất là `🧪 TESTING`.

---

## Resume and Execution Handoff

**Trạng thái hiện tại của Phase 6**: `⏳ PLANNED`. Chưa research lại lần cuối ngay trước cửa sổ, chưa xác nhận Phase 1-5 đã `✅ VERIFIED` thật (chỉ có bằng chứng gián tiếp từ umbrella tại thời điểm viết plan này). **Không được EXECUTE ngay** — phải qua lại bước re-research theo `phase-programs.md` trước.

**Trước khi EXECUTE, agent kế tiếp phải**:
1. Đọc lại umbrella plan (`rebrand-opentechwire-umbrella_PLAN_08-09-26.md`) lấy ledger D1-D15 đầy đủ — không tự tìm lại hoặc bàn lại.
2. Đọc report của Phase 1-5 (khi đã tồn tại tại `process/features/rebrand/reports/`), xác nhận từng dòng ở bảng "Dependencies" có bằng chứng thật, không chỉ "code done".
3. Re-verify lại toàn bộ số dòng ở bảng "Implementation Checklist"/"Blast Radius" trên codebase THẬT tại thời điểm execute (plan này đã re-verify ngày 09-09-26 — nếu khoảng cách thời gian lớn, giả định có drift).
4. Xác nhận 5 mục ở "Phát hiện bổ sung" đã có quyết định của user (đặc biệt: slug LinkedIn/Facebook mới, cách xử lý `next.config.ts:40-45`).
5. Chạy `node .claude/skills/vc-generate-plan/scripts/validate-plan-artifact.mjs process/features/rebrand/active/phase-6-cutover_PLAN_08-09-26.md` trước khi trình user duyệt lại (nếu có sửa đổi).
6. Thực hiện đúng "Pre-Window Readiness Gate" (Bước 0) trước khi chạm vào bất kỳ dashboard external nào.
7. Không execute quá phase này trong một lượt — sau khi Phase 6 xong, dừng lại, chạy UPDATE PROCESS để archive report, rồi mới cân nhắc Phase 7.

**Sau khi EXECUTE xong**: viết report tại `process/features/rebrand/reports/phase-6-cutover_REPORT_<dd-mm-yy>.md` theo đúng "Durable Knowledge Rule" của `phase-programs.md`, dán toàn bộ bằng chứng ở mục Verification Evidence, và cập nhật umbrella plan nếu có phát hiện làm thay đổi Phase 7 (ví dụ: quyết định về `additionalDomains`, hoặc kết quả thật của các ẩn số §8 tài liệu tham chiếu liên quan tới Vercel/domain).

**Next Step đúng theo RIPER-5**: Plan này là output của PLAN mode. Không tự động chuyển sang EXECUTE. User cần xem lại toàn bộ 5 mục ở "Phát hiện bổ sung" và cung cấp giá trị/quyết định còn thiếu (slug LinkedIn, username Facebook, cách annotation GA4, cơ chế `next.config.ts` apex-mới), sau đó xác nhận Phase 1-5 đã `✅ VERIFIED` thật trước khi nói **"ENTER EXECUTE MODE"** cho riêng file `process/features/rebrand/active/phase-6-cutover_PLAN_08-09-26.md`.

---

## Kích thước ước lượng

**MEDIUM** — nhiều bước nhỏ, cửa sổ thực hiện ngắn (mục tiêu < 2 giờ liên tục), nhưng chạm 6 hệ thống ngoài repo (Vercel ×2 project, Central, Cloudflare R2, GA4, LinkedIn/Facebook) cộng 10 vị trí code trong `dtw-web`. Rủi ro nằm ở **thứ tự thực hiện và bằng chứng xác minh thật**, không nằm ở khối lượng code.

---

*Phase plan hoàn thành cho mục đích PLAN mode. Chưa có dòng code nào bị sửa, chưa có dashboard external nào bị chạm. Trạng thái: `⏳ PLANNED`. Chờ user duyệt và cung cấp các giá trị còn thiếu trước khi ENTER EXECUTE MODE.*
