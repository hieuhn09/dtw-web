# Rebrand Phase 4 — Copy hiển thị (Dailytechwire → Opentechwire) — REPORT

**Ngày**: 09-09-26
**Plan file**: `process/features/rebrand/active/phase-4-rendered-copy_PLAN_08-09-26.md`
**Nhánh**: `feat/rebrand-phase-4-rendered-copy` (không tạo nhánh khác, không checkout, không commit — đúng RÀO 6)
**Trạng thái**: **DONE_WITH_CONCERNS**

Lý do không phải `DONE` thuần:
1. **Nhóm F2 (mailbox domain, ~20 vị trí) bị BLOCKED có chủ đích** — chưa hỏi được user xác nhận Phase 1 (MX/SPF/DKIM cho `*@opentechwire.com`) đã xong hay chưa trong phiên EXECUTE này, nên giữ nguyên toàn bộ domain email `dailytechwire.com` theo đúng Quy tắc GATE của plan.
2. **Nhóm H (AI-disclosure known-gap, `trust-content.tsx:184-217` + `seed-payload.ts:267`) bị BLOCKED có chủ đích** — plan yêu cầu hỏi user chính xác câu hỏi trước khi chạm 2 khối này; không có câu trả lời trong phiên này nên để nguyên hoàn toàn, không tự chọn phương án.
3. **Bản dịch tagline vi/id (`header.tsx:234-238`) dùng nguyên bản DRAFT của plan, chưa qua duyệt bản ngữ** — theo đúng chỉ dẫn "không chặn cả phase vì một dòng" của plan, nhưng cần ghi nhận rõ.
4. **Phát hiện: Phase Completion Rule #4 của chính plan không đúng như giả định** — xem mục "Chỗ plan lệch thực tế" #1 bên dưới: `t()` có `vi`/`id` là tham số **optional**, nên `tsc --noEmit` **không** bắt được lỗi thiếu locale. Đã kiểm chứng thực nghiệm.

Không có commit nào được tạo (RÀO 6).

---

## 0. Bối cảnh đã đọc trước khi làm

- `process/context/all-context.md` — xác nhận invariant #14 và **#15** (brand rename ledger) đã được Phase 0 ghi đầy đủ, bao gồm 3-tầng casing D1/D2 và canonical host D3/D5.
- `process/features/rebrand/reports/phase-3-the-mark_REPORT_09-09-26.md` — xác nhận Phase 3 đã xong Nhóm B-H (wordmark, icon, OG, email lockup, manifest), còn Nhóm I (Supabase + content-engine) `🚧 BLOCKED` chờ user. Xác nhận `manifest.ts` **không** thuộc Phase 4 (đã chuyển hẳn sang Phase 3 theo umbrella §6b.3).
- `rebrand-opentechwire-umbrella_PLAN_08-09-26.md` — ledger D1-D15 §2, luật casing §5.1.1, danh sách đóng băng §5.2, danh sách cấm động §5.3, bản đồ phủ §6b (khoảng trống đã gán, đóng băng có ghi chú, chồng lấn đã phân giải).
- Working tree sạch trước khi bắt đầu (`git status --short` chỉ có 8 file untracked không liên quan, có sẵn từ trước phiên này — không phải rác của Phase 3/4). `git stash list` có 1 stash trên nhánh khác (`ai-leaderboard-llmstats`), không liên quan tới nhánh này.

---

## 1. Bảng từng nhóm

| Nhóm | Trạng thái | File | Bằng chứng |
|---|---|---|---|
| Bước 1 — Baseline | ✅ | — | `command grep` chuẩn chạy trước sửa: 2449 dòng khớp → lưu `/tmp/rebrand-phase4-before.txt` |
| Nhóm A — ui-components | ✅ | footer.tsx, header.tsx, auth-modal.tsx, article-content.tsx, article-body.tsx, pillar-content.tsx, home-hero.tsx, funding-tracker.tsx | Xem bảng chuỗi §2 |
| Nhóm B — dead/gated code | ✅ | disclosure-box.tsx, sponsored-strip.tsx, best-of-reviews.tsx | Xem bảng chuỗi §2 |
| Nhóm F2 — mailbox domain | 🚧 BLOCKED | footer.tsx:66, article-content.tsx:311, about/page.tsx:39-40, newsroom/page.tsx:115-116, press/page.tsx:10, contact/page.tsx:22/32/42, advertise/page.tsx:10, studio/page.tsx:10, legal/[slug]/page.tsx (nhiều khối) | Không sửa gì — xem §5 |
| Nhóm C — `lib/data.ts` | ✅ | data.ts | Xem bảng chuỗi §2 |
| Nhóm E — dashboards buildMetadata | ✅ | `dashboards/[[...sub]]/page.tsx` | `curl` xác nhận title/canonical/og:site_name đúng — xem §4 |
| Nhóm F — seo-metadata | ✅ | layout.tsx, (reader)/layout.tsx, metadata.ts, rss.xml/route.ts, [pillar]/rss.xml/route.ts, [pillar]/pillar-view.tsx, (reader)/page.tsx, briefing/briefing-view.tsx, llms.txt/route.ts, not-found.tsx, payload.config.ts, feed.ts, reset-password/page.tsx | grep xác nhận 0 hit ngoài dự kiến — xem §4 |
| Nhóm G — editorial-pages (F1) | ✅ | about, newsroom, advertise, studio, legal (2 khối không-email), newsletters-content, trust-content | Xem bảng chuỗi §2 |
| Nhóm H — AI-disclosure known-gap | 🚧 BLOCKED | trust-content.tsx:184-217, seed-payload.ts:267 | Không sửa gì — xem §5 |
| Bước 11 — dọn dẹp comment | ✅ | health/cms/route.ts, central-api.ts | Xem bảng chuỗi §2 |
| Bước 13 — Nhóm I `.dtw-tip` | ✅ | globals.css, ai-leaderboard.tsx, dashboards-teaser.tsx | `command grep -rn "dtw-tip" apps/web/src` → 0; `otw-tip` → đúng 6 dòng |
| Bước 14 — Nhóm J Payload | ✅ | Articles.ts, payload-types.ts (regenerate) | `pnpm --filter web payload:generate-types` chạy thật, output "Types written to .../payload-types.ts" |
| Bước 15 — Nhóm K seed-payload.ts | ✅ (trừ dòng 267 = Nhóm H) | seed-payload.ts | `dtw-studio-aws-asean` (dòng 219) vẫn còn nguyên; `Dailytechwire` (dòng 267) vẫn còn nguyên |
| Bước 16 — Nhóm L demos | ✅ | ai-leaderboard-demo.html, ai-leaderboard-table-preview.html | `command grep -rn "dtw-" demos/` → 0 |
| Bước 6 — xác nhận email.ts/auth.ts | ✅ (chỉ xác nhận, không sửa) | email.ts, auth.ts | `command grep -n "DailyTechWire" apps/web/src/lib/email.ts apps/web/src/lib/auth.ts` → đúng 5 dòng |
| Bước 12 — grep tổng + diff | ✅ | toàn repo | Xem §4 |
| D9 — xác nhận no-op | ✅ | — | `command grep -rn "DTW Pro" apps/web/src` → 0 |
| Typecheck | ✅ | root | `pnpm turbo run typecheck` → 3/3 package pass, 0 lỗi |
| Screenshot | ✅ | header 1280/390, footer 1280, `/about` full page | Xem §6 |

---

## 2. Bảng MỌI chuỗi đã đổi

Ký hiệu casing: **P** = văn xuôi (`Opentechwire`), **T** = nhãn ngắn/token (`OTW`), **TC** = token ghép (`OTW <Tên>`), **L** = lockup thị giác (`opentechwire` thường), **—** = không phải brand token (tagline/khác).

| File:dòng | Chuỗi cũ | Chuỗi mới | Casing | Lý do (nếu không hiển nhiên) |
|---|---|---|---|---|
| footer.tsx:21 | `t("DTW","DTW","DTW")` | `t("OTW","OTW","OTW")` | T | Nhãn cột footer, đứng một mình |
| footer.tsx:42 | `t("DTW Studio",...)` | `t("OTW Studio",...)` | TC | |
| footer.tsx:140 | `Tech Intelligence, Wired Daily` | `Tech Intelligence, Openly Wired` | — | Tagline D8 |
| footer.tsx:234 | `© 2026 Dailytechwire · Singapore` | `© 2026 Opentechwire · Singapore` | P | Phase 0 đã xoá mệnh đề "Member, Trust Project" trước đó — khớp theo nội dung đã rút gọn, đúng umbrella §6b.3 |
| header.tsx:235-237 | `t("Tech Intelligence, Wired Daily","Tin tức công nghệ, cập nhật hàng ngày","Intelijen Teknologi, Setiap Hari")` | `t("Tech Intelligence, Openly Wired","Tin tức công nghệ, kết nối cởi mở","Intelijen Teknologi, Terhubung Terbuka")` | — | Dùng DRAFT tagline vi/id của plan — **chưa qua duyệt bản ngữ**, xem §5.3 |
| header.tsx:633-635 | `"Enjoying DailyTechWire?..."` ×3 | `"Enjoying Opentechwire?..."` ×3 | P | |
| auth-modal.tsx:190 | `t("Welcome to DTW",...)` | `t("Welcome to OTW",...)` | T | |
| auth-modal.tsx:360 | `t("New to DailyTechWire?",...)` | `t("New to Opentechwire?",...)` | P | "New to X?" — có chủ ngữ ẩn ("Are you new to X"), câu hoàn chỉnh |
| article-content.tsx:98 | `<Link ...>DTW</Link>` | `OTW` | T | Breadcrumb đứng một mình |
| article-content.tsx:285-287 | `"...earn DTW a commission..."` ×3 | `"...earn Opentechwire a commission..."` ×3 | P | Đối chiếu `process/context/integrations/all-integrations.md` — thấy khái niệm chung "Opentechwire may earn a commission..." nhưng đó là câu tóm tắt khác, không phải literal cần khớp byte-for-byte; áp dụng đúng token substitution theo §5.1.1 (xem §7 mục 1) |
| article-content.tsx:311 | `corrections@dailytechwire.com` | *(không đổi)* | — | **F2 — GATE** |
| article-body.tsx:139-141 | `"...DTW Studio...The DTW newsroom..."` ×3 | `"...OTW Studio...The Opentechwire newsroom..."` ×3 | TC + P | Hai token khác casing trong CÙNG câu, đúng cảnh báo của plan |
| pillar-content.tsx:138 | `DTW · {pillarLabel}` | `OTW · {pillarLabel}` | T | |
| home-hero.tsx:33 | `label="DTW HERO"` | `label="OTW HERO"` | T | |
| funding-tracker.tsx:102 | `"dtw-funding-tracker.csv"` | `"otw-funding-tracker.csv"` | T (tiền tố kỹ thuật) | |
| disclosure-box.tsx:20 | `"...DTW Studio...The DTW newsroom..."` | `"...OTW Studio...The Opentechwire newsroom..."` | TC + P | Code chết đã xác nhận, khớp `article-body.tsx:139-141` |
| sponsored-strip.tsx:44 | `⬢ Paid Partner Content · DTW Studio Presents` | `OTW Studio Presents` | TC | Code chết đã xác nhận (0 importer) |
| sponsored-strip.tsx:53 | `Produced by DTW Studio...The DTW newsroom...` | `OTW Studio` + `The Opentechwire newsroom` | TC + P | |
| best-of-reviews.tsx:70 | `"Some links earn DTW a commission..."` | `"...earn Opentechwire a commission..."` | P | Không phải code chết (render sau `SHOW_BEST_OF_REVIEWS` flag) |
| data.ts:1 | `// DTW sample data...` | `// Opentechwire sample data...` | P | Comment = văn xuôi |
| data.ts:127 | `role: "DTW"` | `role: "OTW"` | T | |
| data.ts:249 | `slug: "dtw-studio-aws-asean"` | `slug: "otw-studio-aws-asean"` | T (mock data, không phải slug CMS thật) | |
| data.ts:254 | `"A DTW Studio Presents feature...The DTW newsroom..."` | `"A OTW Studio Presents feature...The Opentechwire newsroom..."` | TC + P | **Xem ghi chú ngữ pháp ở §7 mục 5** — "A OTW" lẽ ra nên là "An OTW" nhưng giữ nguyên theo transformation tối thiểu plan yêu cầu |
| data.ts:597 | `name: "DTW Awards"`, `"...upcoming DTW Awards..."` | `"OTW Awards"` (cả 2 chỗ) | TC | Tên chương trình giải thưởng — coi là token ghép, không phải văn xuôi thuần |
| data.ts:609 | `title: "DTW Daily Brief"` | `"OTW Daily Brief"` | TC | |
| `(reader)/dashboards/[[...sub]]/page.tsx`:25-31 | `generateMetadata()` trả `title: "AI Leaderboard \| Dashboards \| Dailytechwire"` | `export const metadata = buildMetadata({ title: "AI Leaderboard \| Dashboards", canonicalPath: "/dashboards", image: DEFAULT_OG_IMAGE, type: "website", ... })` | P (bỏ hẳn brand khỏi title, để layout template tự bọc) | Chuyển static (không giữ dạng hàm) — trang không phụ thuộc params/searchParams, khớp mẫu `briefing/page.tsx` |
| layout.tsx:36-48 | `"DailyTechWire"` ×4, `template: "%s – DailyTechWire"` | `"Opentechwire"` ×4, `"%s – Opentechwire"` | P | |
| layout.tsx:39 | `Tech Intelligence, Wired Daily.` | `Tech Intelligence, Openly Wired.` | — | |
| `(reader)/layout.tsx`:37-39 | `name: "DailyTechWire"` (JSON-LD WebSite) | `name: "Opentechwire"` + **thêm** `alternateName: "DailyTechWire"` + comment `TODO(rebrand): remove alternateName after ~12mo post-cutover` | P | Theo khuyến nghị plan để Google khớp lại entity |
| metadata.ts:69 | `alt: "DailyTechWire – Tech Intelligence, Wired Daily"` | `"Opentechwire – Tech Intelligence, Openly Wired"` | P | |
| metadata.ts:101 | comment `%s – DailyTechWire` | `%s – Opentechwire` | P | |
| metadata.ts:153,163 | `siteName: "DailyTechWire"` ×2 | `"Opentechwire"` ×2 | P | |
| metadata.ts:178 | `title: "DailyTechWire"` (feed) | `"Opentechwire"` | P | |
| rss.xml/route.ts:17-18 | `title: "DailyTechWire"`, `subtitle: "...Wired Daily."` | `"Opentechwire"`, `"...Openly Wired."` | P / — | |
| `[pillar]/rss.xml/route.ts`:36-37 | `` `DailyTechWire — ${heading}` ``, fallback subtitle | `` `Opentechwire — ${heading}` ``, `"...Openly Wired."` | P / — | |
| `[pillar]/pillar-view.tsx`:29,45 | như trên | như trên | P / — | |
| `(reader)/page.tsx`:50-53 | comment nhắc `DailyTechWire` ×3 | `Opentechwire` ×3 | P | Comment mô tả cơ chế title template |
| `(reader)/page.tsx`:57 | comment "157 chars" | "156 chars" | — | **Ngoài bảng plan, xem §7 mục 3** — cập nhật cho khớp số đo thật sau khi đổi brand |
| `(reader)/page.tsx`:59-60 | comment `DTW actually publishes`, `DTW is global` | `Opentechwire actually publishes`, `Opentechwire is global` | P | |
| `(reader)/page.tsx`:63 | `"DailyTechWire tracks global tech and AI:..."` | `"Opentechwire tracks global tech and AI:..."` | P | Đo lại: 156 ký tự (xác nhận bằng `python3`) |
| `briefing/briefing-view.tsx`:22 | `"The Dailytechwire Brief..."` | `"The Opentechwire Brief..."` | P | **Ban đầu bị bỏ sót trong lượt đầu, phát hiện qua vòng diff cuối và đã sửa — xem §7 mục 4** |
| `llms.txt/route.ts`:33,35 | `` `# DailyTechWire ``, `"DailyTechWire is a global..."` | `` `# Opentechwire ``, `"Opentechwire is a global...founded 2023. Formerly published as DailyTechWire."` | P | Thêm câu "Formerly published as..." theo khuyến nghị plan cho AI crawler |
| not-found.tsx:65 | `t("Search DailyTechWire",...)` ×3 | `t("Search Opentechwire",...)` ×3 | P | |
| payload.config.ts:51 | `titleSuffix: "— DailyTechWire"` | `"— Opentechwire"` | P | |
| feed.ts:21 | docblock ví dụ `"DailyTechWire"` | `"Opentechwire"` | P | |
| feed.ts:122 | `<author><name>DailyTechWire</name></author>` | `Opentechwire` | P | |
| `reset-password/page.tsx`:85 | `t("Back to DailyTechWire →",...)` ×3 | `t("Back to Opentechwire →",...)` ×3 | P | |
| about/page.tsx:31 | `"DTW Studio rules + commission disclosure."` | `"OTW Studio rules..."` | TC | Mảng English-only, không phải `t()` đa ngôn ngữ |
| about/page.tsx:75,81,87 | `Dailytechwire là/adalah/is...` ×3 (vi/id/en) | `Opentechwire là/adalah/is...` ×3 | P | |
| about/page.tsx:285 | `Dailytechwire is its technology title.` | `Opentechwire is its technology title.` | P | |
| newsroom/page.tsx:94 | `role: "Editor-in-Chief, Dailytechwire / Group Editor"` | `"Editor-in-Chief, Opentechwire / Group Editor"` | P | |
| newsroom/page.tsx:133,140,147 | `Dailytechwire là/adalah/is...` ×3 | `Opentechwire...` ×3 | P | |
| newsroom/page.tsx:436 | `Editor-in-Chief, Dailytechwire · Asia Press Centre Group` | `...Opentechwire...` | P | |
| newsroom/page.tsx:449 | `...Editor-in-Chief of dailytechwire, where she sets...` (viết thường — bẫy casing) | `...Editor-in-Chief of Opentechwire, where she sets...` | P | Sentence case theo D1, không giữ lowercase |
| newsroom/page.tsx:706-708 | `t("...view of dailytechwire",...)` ×3 (viết thường) | `t("...view of Opentechwire",...)` ×3 | P | |
| advertise/page.tsx:11 | `subject=DTW%20media%20inquiry` | `subject=OTW%20media%20inquiry` | T | Chỉ phần subject (F1); `${EMAIL}` giữ nguyên (F2) |
| advertise/page.tsx:153-155 | `"...produced and clearly labelled by DTW Studio."` ×3 | `"...OTW Studio."` ×3 | TC | |
| advertise/page.tsx:157 | `t("via DTW Studio →",...)` ×3 | `t("via OTW Studio →",...)` ×3 | TC | |
| advertise/page.tsx:202 | `t("Advertise with DTW",...)` ×3 | `t("Advertise with OTW",...)` ×3 | T | |
| advertise/page.tsx:234-236 | `"...read Dailytechwire to understand..."` ×3 | `"...read Opentechwire..."` ×3 | P | |
| advertise/page.tsx:320 | `t("Why DTW",...)` ×3 | `t("Why OTW",...)` ×3 | T | |
| advertise/page.tsx:496 | `t("Who reads DTW",...)` ×3 | `t("Who reads OTW",...)` ×3 | T | |
| advertise/page.tsx:622-624 | `"...produced by DTW Studio, not our reporters."` ×3 | `"...OTW Studio..."` ×3 | TC | |
| studio/page.tsx:11 | `subject=DTW%20Studio%20inquiry` | `subject=OTW%20Studio%20inquiry` | TC | Chỉ subject (F1) |
| studio/page.tsx:40 (chỉ vi) | `...phân phối trên các kênh của DTW.` | `...các kênh của Opentechwire.` | P | Cụm sở hữu cách "kênh của X" — coi X là tên riêng đầy đủ trong văn xuôi |
| studio/page.tsx:92 | `t("DTW Studio",...)` ×3 | `t("OTW Studio",...)` ×3 | TC | |
| studio/page.tsx:123-125 | `"DTW Studio is..."`(en, 1 token) / `"DTW Studio...đọc DTW..."`(vi, 2 token) / `"DTW Studio...mengikuti DTW..."`(id, 2 token) | `"OTW Studio is..."` / `"OTW Studio...đọc Opentechwire..."` / `"OTW Studio...mengikuti Opentechwire..."` | TC + P (không đồng nhất) | **Quyết định không hiển nhiên** — xem §7 mục 2: token đứng riêng "DTW Studio" → `OTW Studio`; token thứ hai trong vi/id là tân ngữ động từ ("đọc X"/"mengikuti X", tương đương "reads X") → áp dụng §5.1.1 giống case "earn DTW a commission" → dùng `Opentechwire`, KHÔNG dùng `OTW` như bảng gốc của plan ghi ("Thay từng token DTW→OTW") vì điều đó tái tạo đúng lỗi mà umbrella §5.1.1 sửa |
| legal/[slug]/page.tsx:91-93 | `"...when you use dailytechwire."` ×3 (viết thường) | `"...when you use Opentechwire."` ×3 | P | Sentence case; không đụng "Asia Press Centre Group (APCG)" trong cùng câu |
| legal/[slug]/page.tsx:166-168 | `"...cookie on Dailytechwire..."` ×3 | `"...cookie on Opentechwire..."` ×3 | P | |
| newsletters-content.tsx:73-75 | `t("Read Dailytechwire the way you read.",...)` ×3 | `t("Read Opentechwire...",...)` ×3 | P | |
| trust-content.tsx:153-155 | `"DTW does not accept...DTW Studio..."` ×3 | `"Opentechwire does not accept...OTW Studio..."` ×3 | P + TC | Ca kiểm thử tốt nhất §5.1.1 — 2 dạng cạnh nhau |
| trust-content.tsx:268-270 | `t("DTW Studio and review rules",...)` ×3 | `t("OTW Studio and review rules",...)` ×3 | TC | |
| trust-content.tsx:274 | `t("DTW Studio",...)` ×3 | `t("OTW Studio",...)` ×3 | TC | |
| globals.css:20 | `/* DTW coral, softened... */` | `/* Opentechwire coral, softened... */` | P | Comment; giá trị hex `#D4623C` không đổi (D10) |
| globals.css:424,428,449,450 | `.dtw-tip` ×4 | `.otw-tip` ×4 | T (tiền tố kỹ thuật) | |
| ai-leaderboard.tsx:133 | `className="dtw-tip"` | `"otw-tip"` | T | |
| dashboards-teaser.tsx:198 | `className="dtw-tip"` | `"otw-tip"` | T | |
| `payload/collections/Articles.ts`:31 | `"Every story DTW publishes..."` | `"Every story Opentechwire publishes..."` | P | |
| `payload/payload-types.ts`:318 | (JSDoc sinh tự động, gương dòng trên) | (regenerate tự động qua lệnh, không sửa tay) | P | `pnpm --filter web payload:generate-types` |
| `scripts/seed-payload.ts`:65 | `// (src/lib/publications/dtw/index.ts DTW_BYLINES)` — comment "DTW byline pool" ở dòng 64 | `// Engine bylines — must match content-engine's Opentechwire byline pool EXACTLY` | P | Chỉ đổi phần văn xuôi mô tả; **không đổi** path `dtw/index.ts` hay hằng số `DTW_BYLINES` (định danh thật ở content-engine, đóng băng) |
| `scripts/seed-payload.ts`:87 | `"awards" / DTW Awards` (comment) | `"awards" / OTW Awards` | TC | Khớp `data.ts:597` |
| `scripts/seed-payload.ts`:219 | `slug: "dtw-studio-aws-asean"` | *(không đổi)* | — | Upsert theo slug — đổi sẽ tạo row published thứ hai |
| `scripts/seed-payload.ts`:224 | `"A DTW Studio Presents feature...The DTW newsroom..."` | `"A OTW Studio Presents feature...The Opentechwire newsroom..."` | TC + P | Khớp `data.ts:254` |
| `scripts/seed-payload.ts`:233 | `"...produced by DTW Studio...the DTW newsroom..."` | `"...OTW Studio...the Opentechwire newsroom..."` | TC + P | |
| `scripts/seed-payload.ts`:267 | `"Every article on Dailytechwire that used an AI tool..."` | *(không đổi)* | — | **Nhóm H — BLOCKED**, xem §5 |
| `scripts/seed-payload.ts`:455 | `name: "DTW Admin"` | `"OTW Admin"` | T | |
| `apps/web/src/app/api/health/cms/route.ts`:19,26 | comment `dailytechwire.com`, `DTW therefore...` | `opentechwire.com`, `Opentechwire therefore...` | — / P | |
| `apps/web/src/lib/central-api.ts`:83-84 | comment `dailytechwire.com`, `DTW's own Payload` | `opentechwire.com`, `Opentechwire's own Payload` | — / P | **Dòng 84 không nằm trong bảng gốc của plan (chỉ liệt dòng 83)** nhưng là câu tiếp nối trực tiếp cùng comment — sửa cùng lúc để tránh để lại nửa câu cũ, chi phí bằng 0. Xem §7 mục 3 |
| `demos/ai-leaderboard-demo.html`:6 | `<title>...DTW Dashboards (demo)</title>` | `OTW Dashboards (demo)` | TC | |
| `demos/ai-leaderboard-demo.html`:307-308 | `<span class="logo-badge">DTW</span>`, `<span class="wordmark">dailytechwire...` | `OTW`, `opentechwire` | T / L | Badge = monogram (T); wordmark = lockup thị giác (L, chữ thường) |
| `demos/ai-leaderboard-demo.html`:322,424 | `DTW Dashboards` ×2 | `OTW Dashboards` ×2 | TC | |
| `demos/ai-leaderboard-demo.html`:436-437 | `LS_KEY = "dtw-llmstats-key"`, `LS_THEME = "dtw-theme"` | `"otw-llmstats-key"`, `"otw-theme"` | T | |
| `demos/ai-leaderboard-table-preview.html`:543 | `LS = "dtw-theme"` | `"otw-theme"` | T | |

---

## 3. Đối chiếu 3 locale

Đếm số lần chuỗi brand (`Opentechwire`/`OTW`/`OTW <Token>`) xuất hiện trong các lệnh gọi `t(en, vi, id)` **đã sửa** trong Phase 4 (không tính chuỗi English-only không đi qua `t()`, ví dụ `about/page.tsx` TRUST_LINKS, `data.ts`, `disclosure-box.tsx`, `sponsored-strip.tsx`, `best-of-reviews.tsx`, `feed.ts`, `metadata.ts`, `layout.tsx`, các route `rss.xml`, `llms.txt`, `payload.config.ts` — các chuỗi này không phân nhánh theo `lang`, nên không có khái niệm "locale count" áp dụng, chúng hiển thị giống nhau bất kể locale):

| File:dòng (call site) | EN | VI | ID | Khớp? |
|---|---|---|---|---|
| header.tsx:633-635 | 1 | 1 | 1 | ✅ |
| auth-modal.tsx:190 | 1 | 1 | 1 | ✅ |
| auth-modal.tsx:360 | 1 | 1 | 1 | ✅ |
| article-content.tsx:285-287 | 1 | 1 | 1 | ✅ |
| article-body.tsx:139-141 | 2 (Studio+newsroom) | 2 | 2 | ✅ |
| not-found.tsx:65 | 1 | 1 | 1 | ✅ |
| reset-password/page.tsx:85 | 1 | 1 | 1 | ✅ |
| newsroom/page.tsx:706-708 | 1 | 1 | 1 | ✅ |
| advertise/page.tsx:157 | 1 (Studio) | 1 | 1 | ✅ |
| advertise/page.tsx:202 | 1 | 1 | 1 | ✅ |
| advertise/page.tsx:320 | 1 | 1 | 1 | ✅ |
| advertise/page.tsx:496 | 1 | 1 | 1 | ✅ |
| newsletters-content.tsx:73-75 | 1 | 1 | 1 | ✅ |
| studio/page.tsx:92 | 1 | 1 | 1 | ✅ |
| studio/page.tsx:123-125 | 1 (Studio) | 2 (Studio + Opentechwire) | 2 (Studio + Opentechwire) | ⚠️ **không đồng nhất theo thiết kế** — bản EN gốc chỉ nhắc brand 1 lần ("reads us"), bản vi/id nhắc 2 lần ("đọc Opentechwire"/"mengikuti Opentechwire") — đây là bất đối xứng **có sẵn trong bản gốc trước khi Phase 4 chạm vào** (không phải lỗi do Phase 4 gây ra), chỉ token hoá lại đúng số lượng gốc |
| trust-content.tsx:153-155 | 2 (Opentechwire+Studio) | 2 | 2 | ✅ |
| trust-content.tsx:268-270 | 1 | 1 | 1 | ✅ |
| trust-content.tsx:274 | 1 | 1 | 1 | ✅ |

Tất cả 18/19 call site có số lượng token brand khớp tuyệt đối giữa 3 locale; 1 call site (`studio/page.tsx:123-125`) có bất đối xứng **kế thừa từ bản gốc EN/vi/id trước rebrand** (đã ghi rõ trong plan: "en=1 token, vi=2, id=2 — không giả định 1:1"), Phase 4 giữ nguyên cấu trúc bất đối xứng đó và chỉ thay token, không thêm/bớt.

**Cảnh báo phát hiện quan trọng** (Phase Completion Rule #4 của plan): đã thử nghiệm cố ý xoá tham số thứ 3 của một lệnh `t()` (`auth-modal.tsx:190`, tạm sửa thành chỉ 2 tham số) rồi chạy `pnpm --filter web exec tsc --noEmit` — **kết quả: 0 lỗi**. Nguyên nhân: chữ ký hàm thật ở `apps/web/src/lib/i18n.tsx:70` là `(en: string, vi?: string, id?: string)` — `vi`/`id` là **optional**, không phải bắt buộc như plan giả định. Đã khôi phục lại file ngay sau thử nghiệm (xác nhận bằng `git diff --stat` = đúng 2 dòng thay đổi, không có gì khác). **Kết luận: TypeScript KHÔNG bắt được lỗi thiếu locale — Verification Evidence #6 (đọc bằng mắt) là lớp bảo vệ DUY NHẤT**, không có lớp type-check hỗ trợ như plan kỳ vọng. Xem thêm §7 mục 1.

---

## 4. Bằng chứng chạy thật

### 4.1 Grep baseline trước/sau (Bước 1, 12)

```
command grep -rniE 'dailytechwire|daily ?tech ?wire|\bdtw\b|@dtw/|Tech Intelligence, Wired Daily' . \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=.turbo \
  --exclude-dir=dist --exclude='*.tsbuildinfo' --exclude=pnpm-lock.yaml --exclude-dir=data-exports
```
- Trước: 2449 dòng khớp (lưu `/tmp/rebrand-phase4-before.txt`)
- Sau: 2314 dòng khớp (lưu `/tmp/rebrand-phase4-after.txt`)
- `diff before after`: 137 dòng biến mất khớp đúng với bảng §2 (đã đối chiếu từng dòng một, không có dòng biến mất nào không giải thích được); 2 dòng thêm mới đúng chủ đích (`alternateName: "DailyTechWire"`, câu "Formerly published as DailyTechWire.").
- Toàn bộ dòng **còn sống sót** trong `apps/web/`, `packages/`, `demos/` sau Phase 4 đã được đối chiếu thủ công với: danh sách đóng băng §5.2 umbrella (`@dtw/*`, storage key D14, slug `dtw-studio-aws-asean`, `DTW_BYLINES`), F2-gate (mailbox), Nhóm H (seed-payload.ts:267), Phase 2/6/3 (next.config.ts, .env.example, email.ts/auth.ts, sameAs) — **không có dòng nào không khớp một mục nào** ngoại trừ 6 dòng comment liệt kê ở §7 mục 6 (phát hiện ngoài phạm vi, không thuộc bất kỳ phase nào trong umbrella).

### 4.2 Typecheck (Bước 12.3)

```
pnpm turbo run typecheck --force
```
```
web:typecheck: > tsc --noEmit          (0 output = 0 lỗi)
@dtw/ui:typecheck: > tsc --noEmit      (0 output = 0 lỗi)
@dtw/db:typecheck: > tsc --noEmit      (0 output = 0 lỗi)
 Tasks: 3 successful, 3 total
```

### 4.3 `curl /dashboards` (Verification Evidence #3)

Dev server chạy tạm với `.env.local` giả (`DATABASE_URL` không thật, `CMS_SOURCE=central`, `CMS_URL=http://localhost:9999` không có gì lắng nghe — `central-api.ts` "never throws into render"). `/dashboards` trả `200` (khác `/` — trang chủ vẫn cần Postgres sống cho `getAiModels` trực tiếp từ `payload-server.ts`, nhưng `/dashboards` **cũng** gọi `getAiModels()` trực tiếp và **vẫn** trả 200 trong môi trường giả này — có thể do lỗi bị nuốt ở tầng khác; không điều tra sâu hơn vì ngoài phạm vi Phase 4).

```
$ curl -s http://localhost:3000/dashboards | grep -io 'rel="canonical"[^>]*>|property="og:site_name"[^>]*>|<title>[^<]*</title>'
<title>AI Leaderboard | Dashboards – Opentechwire</title>
rel="canonical" href="http://localhost:3000/dashboards"/>
property="og:site_name" content="Opentechwire"/>
```
Đúng MỘT `<title>` (không nhân đôi brand — trước đây sẽ là "...| Dailytechwire" cứng trong `generateMetadata()` + có thể bị layout template bọc thêm), canonical trỏ đúng `/dashboards` (trước đây thiếu hẳn), `og:site_name` = `Opentechwire`.

### 4.4 Đếm ký tự meta description (Verification Evidence #4)

```
$ python3 -c "print(len('Opentechwire tracks global tech and AI: funding rounds, tech-stock moves, AI model benchmarks and rankings, and deep-dive reporting from Asia and the world.'))"
156
```
Khớp đúng số plan đã tính trước (156, nằm trong dải 150-160).

### 4.5 D9 (Verification Evidence #5)

```
$ command grep -rn "DTW Pro" apps/web/src
(0 kết quả)
```

### 4.6 `.dtw-tip` (Acceptance Criteria 8b)

```
$ command grep -rn "dtw-tip" apps/web/src   → (0 kết quả)
$ command grep -rn "otw-tip" apps/web/src   → đúng 6 dòng (globals.css ×4, ai-leaderboard.tsx ×1, dashboards-teaser.tsx ×1)
```

### 4.7 Payload types regenerate (Acceptance Criteria 8c)

```
$ pnpm --filter web payload:generate-types
[INFO] Compiling TS types for Collections and Globals...
[INFO] Types written to /home/hieunc/Code/dtw-web/apps/web/src/payload/payload-types.ts
```
(Lưu ý: tên script thật trong `package.json` là `payload:generate-types`, không phải `payload generate:types` như plan viết — xem §7 mục 6. Đã cần `.env.local` tạm với `DATABASE_URL`/`PAYLOAD_SECRET` giả để lệnh chạy được — đã xoá ngay sau khi chạy xong.)

### 4.8 seed-payload.ts:219 vẫn còn nguyên (Acceptance Criteria 8d)

```
$ command grep -n "dtw-studio-aws-asean" apps/web/scripts/seed-payload.ts
219:    slug: "dtw-studio-aws-asean",
```
Vẫn khớp dòng 219 — không bị đổi.

### 4.9 demos/ sạch (Acceptance Criteria 8e)

```
$ command grep -rn "dtw-" demos/
(0 kết quả)
```

### 4.10 email.ts/auth.ts vẫn còn 5 dòng (Acceptance Criteria 8f, Bước 6)

```
$ command grep -n "DailyTechWire" apps/web/src/lib/email.ts apps/web/src/lib/auth.ts
apps/web/src/lib/email.ts:13:const FROM = `DailyTechWire <no-reply@${fromDomain}>`;
apps/web/src/lib/auth.ts:78:          "We received a request to reset your DailyTechWire password. This link expires in 1 hour.",
apps/web/src/lib/auth.ts:84:        subject: "Reset your DailyTechWire password",
apps/web/src/lib/auth.ts:97:          "Welcome to DailyTechWire. Confirm your email to activate your account.",
apps/web/src/lib/auth.ts:103:        subject: "Confirm your DailyTechWire account",
```
Đúng 5 dòng — Phase 6 chưa chạy, cố ý không sửa.

---

## 5. Nhóm bị BLOCKED (chưa hỏi được user trong phiên EXECUTE này)

### 5.1 Nhóm F2 — mailbox domain

Không đổi bất kỳ giá trị domain email nào (`@dailytechwire.com` giữ nguyên ở mọi vị trí F2: `footer.tsx:66`, `article-content.tsx:311`, `about/page.tsx:39-40`, `newsroom/page.tsx:115-116`, `press/page.tsx:10`, `contact/page.tsx:22/32/42`, `advertise/page.tsx:10`, `studio/page.tsx:10`, và ~10 khối trong `legal/[slug]/page.tsx`). Câu hỏi cần hỏi user đúng nguyên văn theo plan: *"Phase 1 (Resend + SPF/DKIM/DMARC cho `info@/media@/partnership@/advertising@/corrections@opentechwire.com`) đã xong chưa? Nếu chưa, giữ nhóm F2 ở trạng thái đã-viết-nhưng-chưa-merge."* — chưa hỏi được trong phiên này nên **không viết trước** trên working tree (an toàn hơn "viết sẵn nhưng không merge" vì phiên này không tạo nhánh phụ và không có commit nào để tách).

### 5.2 Nhóm H — AI-disclosure known-gap

Không đổi `trust-content.tsx:184-217` (khối `ai:` mô tả nhãn "AI-assisted" đã bị gỡ khỏi UI thật theo invariant #5) và không đổi `seed-payload.ts:267` (câu phụ thuộc cùng quyết định). Câu hỏi cần hỏi user đúng nguyên văn theo plan: *"`/trust/ai` hiện mô tả nhãn AI-assisted mà UI thật đã gỡ (invariant #5, 2026-06-05). Đóng known-gap này trong Phase 4 (viết lại đoạn `ai:` để khớp thực tế), hay để nguyên và theo dõi riêng ở một backlog item?"* — chưa hỏi được, để nguyên hoàn toàn theo đúng "Không tự ý chọn phương án nào nếu chưa hỏi."

### 5.3 Bản dịch tagline vi/id chưa qua duyệt bản ngữ

`header.tsx:236-237` dùng nguyên bản DRAFT của plan (`"Tin tức công nghệ, kết nối cởi mở"` / `"Intelijen Teknologi, Terhubung Terbuka"`). Theo đúng plan: giữ nguyên bản nháp, không chặn phase, nhưng ghi rõ **chưa có ai (người nói tiếng Việt/Indonesia bản ngữ) duyệt** bản dịch này trong phiên EXECUTE này.

---

## 6. Ảnh chụp + nhận xét

Thư mục: `/tmp/claude-1000/-home-hieunc-Code-dtw-web/0efe1a19-7f9f-4827-9eee-db1c4994cdf7/scratchpad/p4/`

| File | Nhận xét thật |
|---|---|
| `header-1280.png` | Header 1280px: `OTW` monogram + `opentechwire` wordmark (Phase 3) render đúng; tagline dưới đổi thành **"Tech Intelligence, Openly Wired"** (thay cho "Wired Daily" cũ) — xác nhận trực quan Phase 4 đã chạm đúng chỗ |
| `header-390.png` | Header 390px mobile: tagline mới wrap 2 dòng ("Tech Intelligence, Openly / Wired") — hành vi layout có sẵn từ trước (đã ghi nhận ở Phase 3 report với tagline cũ), không phải lỗi do Phase 4 |
| `footer-1280.png` | Footer 1280px: cột đầu tiên tiêu đề **"OTW"** (không còn "DTW"), link "OTW Studio" trong cột Business, dòng cuối **"© 2026 Opentechwire · Singapore"** — tất cả đúng như bảng §2 |
| `about-page-1280.png` | Trang `/about` đầy đủ: header/footer đã cập nhật, hero copy **"Opentechwire is the technology title of Asia Press Centre Group (APCG)"**, đoạn "Who we are" **"Opentechwire is its technology title."** — không còn "Dailytechwire" ở đâu trên trang render thật |

Cách lấy ảnh (route `/dashboards` trả 200 nên không cần dùng `/about` để né lỗi như Phase 3, nhưng vẫn dùng `/about` theo đúng chỉ dẫn của prompt vì đây là "trang nội dung bất kỳ" phù hợp và không cần thay đổi cách tiếp cận): dev server tạm với `.env.local` giả, Puppeteer + Chrome hệ thống (`/opt/google/chrome/chrome`, `PUPPETEER_SKIP_DOWNLOAD=true` để tái dùng `puppeteer-core` đã cài từ Phase 3 tại `.claude/skills/vc-chrome-devtools/scripts/node_modules`). Sau khi chụp xong: dev server đã `pkill -f next-server` (xác nhận `lsof -i:3000` rỗng, `curl` trả connection-refused), `.env.local` tạm đã xoá (`ls` báo "No such file"), script Puppeteer tạm (`shot.mjs`) đã xoá khỏi scratchpad.

---

## 7. Chỗ plan lệch thực tế

1. **Phase Completion Rule #4 sai giả định về `t()`.** Plan viết: "TypeScript phải bắt được lỗi này qua `tsc --noEmit` (các hàm `t(en, vi, id)` có kiểu tham số bắt buộc theo signature hiện có)". Thực tế `apps/web/src/lib/i18n.tsx:70` định nghĩa `useT()` trả về `(en: string, vi?: string, id?: string) => ...` — `vi`/`id` **optional**. Đã thử nghiệm thực tế (xoá 1 tham số, chạy `tsc --noEmit`, 0 lỗi) đúng theo yêu cầu tự-kiểm-chứng của Phase Completion Rule #4 trước khi tin tưởng — và kết quả là **ngược lại** với giả định của plan. Hệ quả: Verification Evidence #6 (đọc bằng mắt) là lớp bảo vệ duy nhất cho lỗi thiếu locale, không có type-check hỗ trợ.
2. **`studio/page.tsx:123-125`** — bảng gốc của plan ghi "Thay từng token DTW→OTW tại đúng vị trí trong mỗi locale". Đã áp dụng luật §5.1.1 chi tiết hơn thay vì làm theo nghĩa đen: token "DTW Studio" (đứng riêng, mở đầu câu) → `OTW Studio` (đúng như bảng gốc); nhưng token thứ hai trong bản vi/id ("đọc DTW"/"mengikuti DTW" — tân ngữ của động từ, tương đương "reads DTW" trong tiếng Anh) → đã dùng `Opentechwire` theo đúng cùng logic đã áp dụng cho `article-content.tsx:285` ("earn DTW a commission" → "earn Opentechwire a commission"), **không** dùng `OTW` như literal của bảng gốc — vì làm theo nghĩa đen sẽ tái tạo đúng loại lệch mà umbrella §5.1.1 được viết ra để sửa (chính đoạn mở đầu bảng §5.1.1 nói rõ: "nếu gặp một chuỗi không có trong bảng, áp §5.1.1 chứ đừng suy diễn" — coi đây là ưu tiên cao hơn một dòng bảng cụ thể của Phase 4 viết trước 09-09-26).
3. **`(reader)/page.tsx:57` và `central-api.ts:84`** — 2 chỉnh sửa nhỏ (comment) không nằm trong bảng cụ thể của plan nhưng liên quan trực tiếp: dòng 57 là số đo ký tự ("157 chars") mô tả đúng chuỗi ở dòng 63 mà plan yêu cầu đổi — sau khi đổi brand, số đo thật là 156, để nguyên "157" sẽ là tài liệu sai; dòng 84 của `central-api.ts` là câu tiếp nối trực tiếp cùng khối comment với dòng 83 mà plan liệt kê. Cả hai đều chi phí bằng 0, không đổi hành vi, chỉ đồng bộ tài liệu nội bộ.
4. **`briefing/briefing-view.tsx:22` — bị bỏ sót trong lượt sửa đầu tiên.** File này nằm rõ trong bảng Bước 8 của plan (dòng 289: `"The Dailytechwire Brief..."` → `"The Opentechwire Brief..."`) nhưng bị bỏ sót khi thực thi tuần tự các nhóm. Phát hiện qua vòng `diff` before/after cuối (Bước 12.2) khi đối chiếu từng dòng còn sống sót — đã sửa ngay và chạy lại `diff` để xác nhận dòng này đã biến mất khỏi danh sách còn sót. Đây chính xác là loại lỗi mà Bước 12.2 được thiết kế để bắt.
5. **Ngữ pháp "A OTW Studio" (nên là "An OTW Studio").** `data.ts:254` và `seed-payload.ts:224` có câu gốc "A DTW Studio Presents feature..." — theo bảng plan, chỉ đổi token `DTW`→`OTW`, không đổi mạo từ. Sau khi đổi, "A OTW" đọc thành "ây OTW" (chữ O đọc như nguyên âm) nên về ngữ pháp chuẩn nên là "An OTW Studio Presents feature...". Đã **giữ nguyên "A"** theo đúng phạm vi hẹp mà bảng plan mô tả (chỉ token substitution, không phải rewrite câu), và ghi lại đây như một tinh chỉnh ngữ pháp nhỏ để phase dọn dẹp sau cân nhắc — không tự ý mở rộng phạm vi để sửa.
6. **Tên lệnh `payload generate:types` sai** — plan (Bước 14) viết `pnpm --filter web payload generate:types`; script thật trong `apps/web/package.json:15` tên là `payload:generate-types`. Đã dùng đúng tên script thật, chạy thành công.
7. **`/dashboards` không cần bypass như `/` (khác với ghi nhận trong Phase 3 report).** Phase 3 report ghi nhận trang chủ `/` luôn cần Postgres sống vì `getAiModels`/`getMostReadArticles` gọi thẳng `payload-server.ts`. `/dashboards` **cũng** gọi `getAiModels()` trực tiếp (cùng cơ chế), nhưng trong phiên này lại trả `200` thành công với `.env.local` giả — có thể do khác biệt logic xử lý lỗi giữa 2 route, không điều tra sâu vì ngoài phạm vi Phase 4; chỉ ghi nhận là một khác biệt hành vi bất ngờ nhưng có lợi (không cần thủ thuật `/about` để lấy bằng chứng `/dashboards`).

---

## 8. Phát hiện ngoài phạm vi (không tự sửa, chỉ ghi lại)

Các vị trí sau vẫn còn `DTW`/`dtw`/`dailytechwire` sau Phase 4, nhưng **không xuất hiện trong bất kỳ bảng "Trong phạm vi" hay "Ngoài phạm vi" nào của Phase 4, và cũng không tìm thấy trong bản đồ phủ §6b của umbrella** (không giống các mục frozen D6/D11/D12/D14 hay Phase 2/3/6 đã xác nhận rõ ràng). Đây là comment/docblock nội bộ, không phải copy hiển thị cho reader, nên rủi ro thấp — nhưng cần một agent tương lai xác nhận chủ sở hữu:

1. `packages/db/scripts/copy-auth-to-central.ts:1,11,15` — comment nhắc "the per-site DTW DB", "dtw-prod", "DTW site DB".
2. `apps/web/src/lib/cms-client.ts:58` — comment "So after cutover DTW still needs its local Payload for this one surface."
3. `apps/web/src/lib/account-actions.ts:98` — comment "Pillar-only — dtw's `follows` schema has no country-follow discriminator".
4. `apps/web/src/lib/cms-client.central.ts:30-31` — comment "...returns Payload documents in the SAME shape DTW expects (central generalizes DTW's schema)."
5. `apps/web/src/lib/auth-client.ts:16` — comment "...dtw has no locale subpaths yet...".

Không đụng các mục sau vì đã xác nhận chúng KHÔNG phải gap (đã đóng băng có chủ đích theo umbrella hoặc tham chiếu tên repo/service thật, không phải brand token):
- `apps/web/scripts/export-for-central.ts` (nhiều dòng) — xác nhận đây là umbrella §6b.2 "đóng băng có ghi chú" (hợp đồng thư mục xuyên repo `central-cms`, cùng nhóm D11) — **không phải gap**.
- `apps/web/src/app/api/engine/intake/route.ts:13` — "engine → dtw-web" là tên repo thật (D7, đóng băng vĩnh viễn), không phải brand.
- `apps/web/src/lib/bearer-auth.ts:11` — "`dtw-engine`" là tên repo/service thật (content-engine), không phải brand.
- `apps/web/src/app/(reader)/page.tsx:33` — comment nhắc slug `dtw` trong `BRIEF_PUBLISH_PUBS` — đây là giá trị thật của identifier đóng băng D11, không phải brand copy.

---

## 9. Trạng thái theo Phase Completion Rules của plan

Theo mục "Phase Completion Rules" của chính plan: **KHÔNG được đánh dấu `✅ VERIFIED`** — thiếu (1) xác nhận Nhóm F2 từ user, (2) quyết định Nhóm H từ user, (3) duyệt bản ngữ cho tagline vi/id, (4) **User confirmation** tổng thể chưa xảy ra. Trạng thái phù hợp nhất theo thang marker của plan: **🔨 CODE DONE** cho toàn bộ Nhóm A/B/C/E/F/G/I/J/K(trừ 267)/L + dọn dẹp comment (đã sửa xong, đã typecheck sạch, đã xác nhận bằng ảnh chụp thật + `curl`) + **🚧 BLOCKED** cho Nhóm F2 và Nhóm H. Plan **KHÔNG** nên archive — vẫn ở `process/features/rebrand/active/`.

---

## 10. Việc còn lại cho user / phiên sau

1. Trả lời câu hỏi Nhóm F2 (Phase 1 mailbox provisioning đã xong chưa) — nếu xong, một phiên EXECUTE tiếp theo áp dụng đúng bảng ~20 vị trí ở Bước 4 của plan.
2. Trả lời câu hỏi Nhóm H (đóng known-gap AI-disclosure ngay hay để backlog riêng) — nếu đóng ngay, cần thêm một bước review nội dung chính sách riêng (không phải review kỹ thuật) trước khi sửa `trust-content.tsx:184-217` + `seed-payload.ts:267`.
3. Mời người nói tiếng Việt/Indonesia bản ngữ duyệt bản dịch tagline DRAFT ở `header.tsx:236-237`.
4. Xem lại ảnh chụp ở §6 và xác nhận (user confirmation) trước khi Phase 4 được đánh dấu `✅ VERIFIED`.
5. Cân nhắc giao 5 vị trí ở §8 mục 1-5 (comment nội bộ không thuộc phase nào) cho Phase 5/7 hoặc một lượt dọn dẹp riêng.
6. Sau khi user xác nhận: `git add` + commit theo đúng khuyến nghị "Rollback" của plan (commit chính cho Nhóm A-L F1, tách riêng khi Nhóm F2/H được giải quyết) — **chưa có commit nào trong phiên này** (RÀO 6).
