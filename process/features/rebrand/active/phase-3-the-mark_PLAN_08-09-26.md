# Rebrand Phase 3 — Cái mark, một commit atomic

**Date**: 08-09-26
**Complexity**: COMPLEX (một pass thực thi duy nhất; đây là Phase 3 trong chương trình 8-phase "Rebrand Dailytechwire → Opentechwire")
**Feature**: rebrand
**Plan file**: `process/features/rebrand/active/phase-3-the-mark_PLAN_08-09-26.md`
**Umbrella plan**: `process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md` (ledger D1–D15, bảng dependency 8-phase, hệ quả D4)
**Tài liệu nghiên cứu nền**: `process/general-plans/references/rebrand-opentechwire_REFERENCE_08-09-26.md` — §3.1 (ui-components, dòng 76-128), §3.5 (assets-brand-visual, dòng 275-310), §3.7 (content-engine, dòng 394 + 431), §4.3 (bảng generator/không-generator, dòng ~558-568), §7 Phase 3 gốc (dòng 686-690)
**Status**: ⏳ PLANNED — chưa implement gì. Số dòng file thực tế trong plan này đã được **re-verify trực tiếp** trên code hiện tại ngày viết plan (không chỉ chép từ tài liệu tham chiếu) — xem "Xác nhận số dòng" bên dưới.
**Size**: MEDIUM (9 file trong `dtw-web` + 2 file trong `content-engine`, 1 file mới trong mỗi repo, 1 hành động upload Supabase Storage, ship như MỘT commit atomic trong `dtw-web` + một commit nhỏ riêng trong `content-engine`)

**Ghi chú hình dạng file (cho validator + cho agent resume sau này)**: mặc dù tên file bắt đầu bằng `phase-` (theo bảng tên file có thẩm quyền ở umbrella §3), đây là một **direct `_PLAN_` plan file bình thường** theo `process/development-protocols/plan-lifecycle.md`, KHÔNG phải cấu trúc legacy multi-file (`PLAN.md` + `phase-*.md` rời rạc). File này tự nó là **primary execute anchor** cho Phase 3 — không có supporting phase files nào khác đi kèm. `process/context/tests/all-tests.md` đã được đọc trước khi viết plan này (xem "Đọc bối cảnh" ngầm định qua routing của CLAUDE.md) — repo hiện **chưa có test runner nào cấu hình** (greenfield, xác nhận tại `tests/all-tests.md` "Known Gaps"), nên Verification Evidence của phase này dựa vào grep + `tsc --noEmit` + xác nhận-bằng-mắt thay vì `pnpm test`, đúng theo "Default Verification Order" của tài liệu đó (typecheck trước, test sau — ở đây không có test tự động nào để chạy).

---

## Xác nhận số dòng (re-research, không tin số cũ mù quáng)

Toàn bộ số dòng dưới đây đã được đọc trực tiếp từ file thật trên đĩa tại thời điểm viết plan này (không chỉ chép từ tài liệu tham chiếu 08-09-26) — **khớp 100%** với số dòng mà tài liệu tham chiếu đã trích. Không có drift.

| File | Repo | Dòng đã xác nhận |
|---|---|---|
| `apps/web/src/components/wordmark.tsx` | `dtw-web` | docblock 1-7; `viewBox` dòng 12; `aria-label` dòng 13; monogram text "DTW" dòng 28; wordmark text "dailytechwire" dòng 39; pulse group dòng 41-53 |
| `apps/web/src/app/icon.svg` | `dtw-web` | `aria-label="DTW"` dòng 2; `<text>DTW</text>` dòng 4 |
| `apps/web/src/app/manifest.ts` | `dtw-web` | `name` dòng 13, `short_name` dòng 14, `description` dòng 15; `background_color`/`theme_color` dòng 18-19 (KHÔNG đổi, xem Ngoài phạm vi) |
| `apps/web/src/lib/email.ts` | `dtw-web` | Lockup dòng 79. Dòng 12-13 (`fromDomain`/`FROM`) **KHÔNG thuộc phase này** — xem Ngoài phạm vi |
| `apps/web/scripts/generate-og-default.mjs` | `dtw-web` | Comment "dailytechwire" dòng 12; pulse-dot `cx="492"` dòng 57; wordmark text dòng 58; tagline text dòng 61 |
| `apps/web/public/dtw-logo-primary.svg` | `dtw-web` | `aria-label` dòng 2, `<title>` dòng 3, `<desc>` dòng 4, monogram text dòng 8, wordmark text dòng 11 — **toàn bộ file 27 dòng**, đổi tên + vẽ lại |
| `apps/web/src/app/apple-icon.png`, `public/icon-192.png`, `public/icon-512.png`, `public/icon-maskable-512.png` | `dtw-web` | Nhị phân, không có generator hiện có — xem §"Quyết định của plan này" bên dưới |
| `scripts/social-render-poc.ts` | `content-engine` | `LOGO_FILES.dailytechwire` dòng 78 (path local, KHÔNG đổi); `LOGO_STORAGE_PATHS.dailytechwire` dòng 88 (đổi giá trị key đích) |
| `src/lib/publications/dtw/index.ts` | `content-engine` | `logoAssetUrl` dòng 182-183 (đổi giá trị URL) |

---

## KHÔNG thuộc phase này (trỏ sang phase nào)

Đọc kỹ trước khi bắt đầu — đây là ranh giới cứng, không tự ý mở rộng:

| Việc | Vì sao không phải Phase 3 | Thuộc phase nào |
|---|---|---|
| `apps/web/src/lib/email.ts:12-13` (`fromDomain` fallback + `FROM` sender display name) | Tài liệu tham chiếu dòng 709 gộp `email.ts:12-13` vào nhóm "flip cùng nhau trong một deploy" với `NEXT_PUBLIC_SITE_URL`/`BETTER_AUTH_URL`/`RESEND_FROM_DOMAIN` — đây là cutover, không phải cái mark | Phase 6 (CUTOVER) |
| Toàn bộ copy văn xuôi hiển thị khác (footer, header nudge, auth-modal, article-content, `/trust/*`, `/about`, `/legal/*`, v.v.) | Đây là "Copy hiển thị" theo umbrella §3 Phase 4, không phải "cái mark" | Phase 4 |
| `DTW_VOICE_SPEC`, `name`, `byline`, `siteBaseUrl`, `displayName`, `domain`, `kicker` trong `content-engine/src/lib/publications/dtw/index.ts` (chỉ `logoAssetUrl` thuộc Phase 3) | Đây là 3 writer generate-time + dữ liệu DB liên quan | Phase 5 |
| `admin/src/lib/brief-configs.ts`, `src/social/prompts/social-rules.prompt.ts` | Cùng nhóm 3-writer | Phase 5 |
| Đổi màu brand (`globals.css`, `cover-art.tsx`, `--brand-navy` ở 12 file) | D10 — giữ nguyên vĩnh viễn, không có phase nào đụng | Không phase nào |
| `design/project/uploads/pasted-1779960345031-0.png` (raster tagline "Tech Intelligence, Wired Daily") và `design/project/index.html:6,21` | Cùng nhóm với dòng dưới: bundle `design/` đóng băng làm hồ sơ lịch sử (umbrella §6b.2). Cảnh báo chống hồi sinh mark cũ được xử lý bằng banner trên `design/README.md` ở **Phase 0 bước 33**, không phải bằng cách vẽ lại asset trong bundle | Không phase nào — đóng băng có ghi chú |
| `design/project/uploads/dtw-logo-primary.svg` (bản copy trong bundle handoff, đã lệch màu/font sẵn) | `design/` là tài liệu tham chiếu thị giác, không phải code để port (`design/README.md`); tài liệu tham chiếu §3.5 dòng 296 coi đây là một quyết định RIÊNG ("rebrand đồng bộ, hoặc đóng băng bundle") chưa được ledger D1-D15 chốt | Chưa gán phase nào — đóng băng làm tài liệu lịch sử cho tới khi có quyết định riêng |
| `process/context/all-context.md:135` (invariant #11) và `process/context/uxui/all-uxui.md:153` — cả hai vẫn đang trích dẫn `design/project/uploads/dtw-logo-primary.svg` làm "source asset" bằng văn bản cũ | Việc ghi lại quyết định D1/D2/D8/D10 vào context là trách nhiệm của Phase 0, không phải Phase 3 | Phase 0 (xem "Tiền đề" bên dưới — **CHƯA xác nhận đã chạy**) |
| `apps/web/src/app/manifest.ts` — thêm trường `id`/`scope` để tránh PWA cài từ origin cũ bị mồ côi | Đây là hệ quả của việc đổi **domain**, chưa xảy ra tới Phase 6; thêm bây giờ không giải quyết được gì vì domain chưa đổi | Chưa gán phase nào — cờ lại làm rủi ro chương trình, không tự ý sửa ở đây |
| Xoá `data-exports/*-Coverage-*.zip`, sửa `.gitignore`, banner superseded-by trên `per-page-seo-metadata_PLAN_16-07-26.md` | Việc dọn dẹp context/hygiene | Phase 0 |
| Bất kỳ redirect/Change-of-Address nào | D4 — loại bỏ vĩnh viễn khỏi toàn chương trình | Không phase nào |

---

## Tiền đề (Dependency) — PHẢI xác nhận trước khi EXECUTE bắt đầu sửa file

Theo bảng dependency của umbrella plan (§"Bảng dependency giữa các phase"): **Phase 3 bị chặn bởi Phase 0** ("context phải đúng trước khi code"). Phase 0 ghi D1/D2/D8/D10 vào `process/context/all-context.md` (invariant #7/#11/#14) và `process/context/uxui/all-uxui.md:152-154`.

**Kiểm tra thực tế tại thời điểm viết plan này (09-09-26): Phase 0 CHƯA chạy.** Bằng chứng — `process/context/all-context.md` dòng 135 (invariant #11) hiện vẫn đọc:

> "Header logo (changed 2026-06-14): the design refresh reintroduced a brand mark — a navy `DTW` monogram + lowercase `dailytechwire` wordmark + terracotta pulse-dot (source asset `design/project/uploads/dtw-logo-primary.svg`)..."

Đây là văn bản CŨ, chưa phản ánh D1/D2/D8. Nếu EXECUTE bắt đầu Phase 3 mà Phase 0 chưa xong, hệ quả cụ thể: bất kỳ agent nào đọc `all-context.md` giữa chừng (kể cả `vc-execute-agent` tự resume sau compact) sẽ thấy invariant #11 mô tả mark **cũ** và có thể tự ý "sửa lại cho đúng invariant" — tức là revert rebrand.

**Bước 0 của Implementation Checklist bên dưới bắt buộc phải là một cổng chặn (gate) kiểm tra lại trạng thái Phase 0 ngay trước khi sửa file đầu tiên** — không giả định, không bỏ qua.

Phase 3 **độc lập** (không chặn, không bị chặn) với Phase 1 (việc ngoài repo) và Phase 2 (canonical host). Phase 3 **chặn Phase 5** (vì `logoAssetUrl` mới phải tồn tại trước khi Phase 5 xác nhận nó) và gián tiếp **chặn Phase 6** (CUTOVER không được coi là an toàn khi mark còn dở dang).

---

## Overview — Mục tiêu

Vẽ lại toàn bộ "cái mark" của publication — monogram, wordmark, 4 icon PWA/iOS, OG card mặc định, lockup email, logo tĩnh mồ côi, và bản social-card monogram host trên Supabase — từ `DTW`/`dailytechwire`/`DailyTechWire` sang `OTW`/`opentechwire` theo đúng D1/D2/D8, **giữ nguyên màu** theo D10 (navy `#1B2A52`, terracotta `#D4623C` — không đổi một hex nào). Ship toàn bộ phần `dtw-web` như **một commit atomic duy nhất** vì cái mark làm dở dang sẽ lộ ra đồng thời ở ba nơi cùng lúc: tab trình duyệt (favicon), install prompt (PWA icon), và mọi social share (OG card) — không có cách nào "ẩn" một mark nửa vời khỏi người dùng thật.

Sau khi `dtw-web` có `icon-512.png` mới, upload nó lên Supabase Storage dưới một **object key mới** (không ghi đè key cũ — các social post đang `queued` trong `content-engine` có thể vẫn trỏ vào key cũ), rồi trỏ `content-engine/src/lib/publications/dtw/index.ts:183` (`logoAssetUrl`) vào key mới đó. Đây là bước duy nhất của Phase 3 chạm sang repo `content-engine`.

---

## Quyết định của plan này (không nằm trong D1-D15, cần nêu rõ vì tài liệu tham chiếu không quyết hộ)

Ledger D1-D15 không nói chính xác các con số pixel/tên file dưới đây — đây là quyết định kỹ thuật của **plan này**, không phải trích từ tài liệu tham chiếu. Ghi rõ để không ai nhầm là "đã chốt từ trước".

### QĐ-P3-1 — 4 icon PNG: dùng generator script, không vẽ tay

Tài liệu tham chiếu xác nhận **không có generator nào tồn tại** cho `apple-icon.png`/`icon-192.png`/`icon-512.png`/`icon-maskable-512.png` (§4.3). "Vẽ tay" cho một agent thực thi (không có Photoshop/Figma) nghĩa là không có cách tái lập được. Vì nội dung của cả 4 file chỉ là **hình vuông nền navy full-bleed + chữ "OTW" trắng căn giữa** (không có gì phức tạp hơn `icon.svg` hiện có), plan này chọn: viết một script rasterize mới `apps/web/scripts/generate-brand-icons.mjs` dùng `sharp` (đã là dependency có sẵn — `generate-og-default.mjs` và `payload.config.ts` đều import nó), theo đúng pattern của `generate-og-default.mjs` đã có trong repo. Cách này:
- Tái lập được (chạy lại được, không phải một lần rồi mất script);
- Sửa dứt điểm lỗi lệch tâm dọc của `icon-maskable-512.png` hiện tại bằng `dominant-baseline="central"` thay vì căn theo baseline;
- Khớp khuyến nghị của chính tài liệu tham chiếu (§4.3, "Khuyến nghị: viết một `generate-brand-assets.mjs`...").

**Thông số cụ thể (khởi điểm, EXECUTE xác nhận bằng mắt sau khi render — xem Bước 5):**

| Output | Kích thước | `rx` (bo góc) | `font-size` | Vị trí chữ |
|---|---|---|---|---|
| `apps/web/src/app/apple-icon.png` | 180×180 | 0 (vuông cạnh — khớp phong cách 4 PNG hiện có, khác `icon.svg` có `rx=12`) | 59 (~33% chiều cao, cùng tỷ lệ `icon.svg` hiện tại: 21/64≈32.8%) | `x=90 y=90 text-anchor="middle" dominant-baseline="central"` |
| `apps/web/public/icon-192.png` | 192×192 | 0 | 63 | `x=96 y=96`, cùng anchor/baseline |
| `apps/web/public/icon-512.png` | 512×512 | 0 | 168 | `x=256 y=256`, cùng anchor/baseline |
| `apps/web/public/icon-maskable-512.png` | 512×512, nền navy full-bleed **tới sát mép** (không inset — Android sẽ tự crop tròn) | 0 | **130** (~25% — cố tình nhỏ hơn nhiều để nằm gọn trong safe-zone 80%/đường kính 409.6px; nửa-đường-chéo bounding box ước tính ≈136px, còn dư margin so với bán kính an toàn 204.8px) | `x=256 y=256`, cùng anchor/baseline |

Font: `'IBM Plex Mono','SF Mono',Menlo,monospace`, `font-weight="600"`, `letter-spacing="0.02em"`, `fill="#FFFFFF"` — **giống hệt** font/weight/spacing hiện có trong `icon.svg` dòng 4 (không đổi kiểu chữ, chỉ đổi 3 ký tự `DTW`→`OTW`). Nền: `<rect width={size} height={size} fill="#1B2A52"/>` (D10 — không đổi hex).

**Nếu `dominant-baseline="central"` render lệch trên máy build** (librsvg cũ có lịch sử hỗ trợ `dominant-baseline` không nhất quán — xem cảnh báo font-substitution đã ghi trong chính `generate-og-default.mjs` dòng 17-25 về hành vi librsvg): fallback là tính `y` thủ công bằng `size/2 + fontSize*0.35` (offset baseline điển hình cho font monospace) và bỏ `dominant-baseline`. Ghi rõ trong PR nếu phải dùng fallback này (cùng quy ước với comment đã có sẵn trong `generate-og-default.mjs` về font bị thay thế).

### QĐ-P3-2 — `dtw-logo-primary.svg`: đổi tên thành `otw-logo-primary.svg`, vẽ lại nội dung, KHÔNG xoá

Đã xác minh bằng grep trực tiếp (không chỉ tin theo tài liệu tham chiếu) trên toàn bộ 7 repo cục bộ có thể truy cập (`dtw-web`, `apcg-cms`, `media-engine`, `brief-asia-web`, `wad-web`, `APCG-web`, `content-engine`, `/home/hieunc/Code/DTW`): **không có `<img src>`/`<link>`/import nào trỏ vào `/dtw-logo-primary.svg`** ở bất kỳ đâu ngoài (a) comment docblock của chính `wordmark.tsx`, (b) chính tài liệu tham chiếu/umbrella (tự trích dẫn), (c) `process/context/all-context.md`/`uxui/all-uxui.md` (mô tả bằng lời, không phải `<img>`), (d) `design/project/src/header.jsx` (comment trong bundle prototype, đóng băng). Tài liệu tham chiếu tự nêu một rủi ro **chưa xác minh được** ("có thể đang được link từ tài liệu press" bên ngoài các repo cục bộ này) — không có cách kiểm chứng thêm từ môi trường hiện tại.

Quyết định: **đổi tên + vẽ lại**, không xoá. Lý do: (1) nhiệm vụ được giao tường minh yêu cầu "đổi tên/vẽ lại", không phải xoá; (2) nếu file này thực sự bị link từ một trang press bên ngoài không quét được, xoá hẳn (404) rủi ro hơn đổi tên+vẽ lại nội dung mới (vẫn 404 ở đường dẫn cũ, nhưng đây là rủi ro **đã được ledger D4 chấp nhận ở cấp độ domain** — khi `dailytechwire.com` ngừng phục vụ hoàn toàn ở Phase 6, bất kỳ link press nào trỏ vào file này qua domain cũ cũng hỏng bất kể có đổi tên file cục bộ hay không; đổi tên file không tạo thêm rủi ro mới ngoài rủi ro D4 đã chấp nhận). Tên mới: `apps/web/public/otw-logo-primary.svg` (giữ đúng pattern viết-tắt-3-chữ hiện có, khớp D2).

### QĐ-P3-3 — `wordmark.tsx`: số đo pulse-dot khởi điểm (tỷ lệ 12/13 ký tự)

"opentechwire" (12 ký tự) ngắn hơn "dailytechwire" (13 ký tự) 1 ký tự. Vì không đo được font-metrics thật ở PLAN mode (không có canvas render), plan này tính một bộ số khởi điểm theo tỷ lệ đếm-ký-tự (đúng phương pháp tài liệu tham chiếu đã dùng — "12 so với 13 glyph"), **EXECUTE bắt buộc phải render trong trình duyệt thật (`pnpm --filter web dev`, mở trang có header) và chỉnh mắt nếu lệch** — đây không phải một con số tuyệt đối.

Hiện trạng (13 ký tự): 6 chấm tại `cx` tương đối = 2, 31, 60, 89, 118, 147 (bước 29px, span 145px), mỗi đoạn line dài 19px (gap 5px mỗi đầu quanh chấm bán kính 2.5).

Khởi điểm mới (12 ký tự, tỷ lệ 12/13 ≈ 0.923, span mới ≈134→135, bước 27px):
- 6 chấm tại `cx` = 2, 29, 56, 83, 110, 137
- 5 đoạn line, mỗi đoạn dài 17px: `(7,24) (34,51) (61,78) (88,105) (115,132)`
- `translate(76, 67)` **giữ nguyên** (điểm bắt đầu ngay sau khối monogram không đổi)
- `viewBox` mới: `"0 18 224 64"` (giảm từ `234` xuống `224` — mép phải mới ở x=137+76+11(padding giữ nguyên)=224)

---

## Implementation Checklist

Đánh số tuần tự, mỗi bước xác minh độc lập được. **KHÔNG bỏ qua Bước 0.**

### Nhóm A — Cổng chặn tiền đề

0. **[GATE — bắt buộc trước mọi bước khác]** Đọc `process/context/all-context.md` dòng 130-145 (invariant #7/#11/#14). Nếu invariant #11 vẫn còn đọc "a navy `DTW` monogram + lowercase `dailytechwire` wordmark... (source asset `design/project/uploads/dtw-logo-primary.svg`)" — **DỪNG LẠI**, Phase 0 chưa xong, báo cho user thay vì tự tiếp tục. Nếu invariant #11 đã phản ánh D1/D2/D8 (đã đổi tên/tagline), tiếp tục Bước 1.

### Nhóm B — Wordmark component (React, dùng bởi header/footer/auth-modal)

1. Sửa `apps/web/src/components/wordmark.tsx` dòng 2-6 (docblock): đổi mô tả từ "a navy `DTW` monogram block + lowercase \"dailytechwire\" wordmark..." sang "a navy `OTW` monogram block + lowercase \"opentechwire\" wordmark...". Dòng 5 (`Mirrors design/project/uploads/dtw-logo-primary.svg`) đổi thành trỏ `apps/web/public/otw-logo-primary.svg` (tên file mới từ QĐ-P3-2 — **không** trỏ vào bundle `design/` vì đó là tài liệu đóng băng, xem "KHÔNG thuộc phase này").
2. Sửa dòng 12 `viewBox="0 18 234 64"` → `viewBox="0 18 224 64"` (QĐ-P3-3).
3. Sửa dòng 13 `aria-label="dailytechwire"` → `aria-label="opentechwire"`.
4. Sửa dòng 28: text node `DTW` → `OTW` (không đổi bất kỳ thuộc tính style/font nào khác của `<text>` này).
5. Sửa dòng 39: text node `dailytechwire` → `opentechwire` (không đổi thuộc tính style/font).
6. Sửa dòng 41-53 (nhóm pulse `<g transform="translate(76, 67)">`): áp đúng 6 giá trị `cx` và 5 cặp `(x1,x2)` mới từ QĐ-P3-3. Giữ nguyên toàn bộ màu (`var(--brand-navy)`/`var(--brand-amber)`), `r="2.5"`, `strokeWidth="1.8"`, `strokeLinecap="round"` — chỉ đổi toạ độ.
7. **[Xác nhận bằng mắt — không phải grep]** Chạy `pnpm --filter web dev`, mở bất kỳ trang reader nào (header + footer + `/` đều render `Wordmark`), nhìn logo ở cả header và footer: xác nhận monogram `OTW` + wordmark `opentechwire` + 6 chấm pulse không chồng lấn, không thừa khoảng trắng bất thường ở cuối. Nếu lệch, chỉnh lại `cx`/`x1`/`x2` từ Bước 6 cho tới khi cân đối — ghi lại giá trị cuối cùng thực dùng vào report của phase (khác với giá trị khởi điểm QĐ-P3-3 nếu có chỉnh).
8. Lặp lại Bước 7 với dark mode bật (`html[data-theme="dark"]`) — xác nhận `var(--brand-navy)` đổi màu đúng (theo comment dòng 4 gốc: "cream in dark") và pulse vẫn cân đối.

### Nhóm C — Favicon SVG

9. Sửa `apps/web/src/app/icon.svg` dòng 2: `aria-label="DTW"` → `aria-label="OTW"`.
10. Sửa dòng 4: text node `DTW` → `OTW`. Không đổi `rx="12"`, không đổi font/size/màu.

### Nhóm D — 4 icon PNG (generator mới)

11. Tạo file mới `apps/web/scripts/generate-brand-icons.mjs`, theo đúng cấu trúc/docblock-style của `generate-og-default.mjs` đã có (import `sharp`, `dirname`/`resolve`/`fileURLToPath`), implement đúng 4 output theo bảng thông số ở QĐ-P3-1 (kích thước, `font-size`, vị trí, `dominant-baseline="central"`, nền `#1B2A52`, chữ `#FFFFFF`, font `'IBM Plex Mono','SF Mono',Menlo,monospace` weight 600 letter-spacing 0.02em). Đường dẫn output: `apple-icon.png` → `../src/app/apple-icon.png`; ba file còn lại → `../public/icon-192.png`, `../public/icon-512.png`, `../public/icon-maskable-512.png` (tương đối theo `apps/web/scripts/`, đúng pattern `generate-og-default.mjs` đã dùng).
12. Chạy `node scripts/generate-brand-icons.mjs` từ thư mục `apps/web/` — xác nhận console log in ra cả 4 đường dẫn đã ghi, không lỗi.
13. **[Xác nhận bằng mắt — bắt buộc, grep không thấy được]** Mở lần lượt cả 4 file PNG vừa sinh: xác nhận nền navy đúng `#1B2A52`, chữ trắng `OTW`, không bị cắt/tràn viền. Với riêng `icon-maskable-512.png`: xác nhận chữ nằm gọn trong vùng safe-zone 80% ở giữa (ước lượng bằng mắt: vẽ một vòng tròn tưởng tượng đường kính bằng 80% cạnh ảnh, tâm ảnh — chữ phải nằm hoàn toàn trong vòng đó) và **căn giữa theo chiều dọc thật sự** (đây là bug đang có trên bản cũ — bản mới phải sửa dứt điểm, không chỉ đổi chữ).
14. Nếu `dominant-baseline="central"` render lệch (theo cảnh báo fallback ở QĐ-P3-1): sửa lại bằng offset `y` thủ công, chạy lại Bước 12, xác nhận lại Bước 13.

### Nhóm E — OG default card

15. Sửa `apps/web/scripts/generate-og-default.mjs` dòng 12 (comment trong docblock visual-brief): `"dailytechwire" wordmark in white...` → `"opentechwire" wordmark in white...`.
16. Sửa dòng 57 (`<circle cx="492" cy="282" r="7" .../>`): tính lại `cx` theo cùng tỷ lệ 12/13 áp dụng ở QĐ-P3-3 cho khoảng cách giữa cuối chữ và pulse-dot — **không copy máy móc con số 492 cũ**; vì đây là canvas 1200×630 khác tỷ lệ với wordmark SVG 234×64, EXECUTE phải tính `cx` mới dựa trên độ rộng thực tế của text "opentechwire" ở `font-size="56"` (render thử bằng script rồi đo, hoặc ước lượng tỷ lệ 12/13 trên khoảng-cách-từ-x=72-tới-492 hiện có: (492-72)×12/13+72 ≈ 460) rồi **xác nhận bằng mắt ở Bước 18** — ghi rõ giá trị cuối cùng thực dùng.
17. Sửa dòng 58: text node `dailytechwire` → `opentechwire`.
18. Sửa dòng 61: text node tagline `Tech Intelligence, Wired Daily` → `Tech Intelligence, Openly Wired` (D8).
19. Chạy `node scripts/generate-og-default.mjs` từ `apps/web/` — xác nhận console log in ra đường dẫn output, không lỗi.
20. **[Xác nhận bằng mắt — bắt buộc]** Mở `apps/web/public/og-default.png`: xác nhận wordmark "opentechwire" + pulse-dot có khoảng cách nhìn thấy được (không dính chữ, không cách quá xa), tagline mới đọc đúng, layout hình học 4 khối terracotta/amber ở 1/3 phải không đổi. Ghi chú nếu librsvg thay thế font (theo đúng cảnh báo đã có sẵn trong file, dòng 17-25) — đây là hành vi đã biết, không phải lỗi mới.

### Nhóm F — Logo tĩnh mồ côi

21. Đổi tên `apps/web/public/dtw-logo-primary.svg` → `apps/web/public/otw-logo-primary.svg` (QĐ-P3-2).
22. Trong file vừa đổi tên: dòng 2 `aria-label="Dailytechwire primary logo"` → `aria-label="Opentechwire primary logo"`; dòng 3 `<title>Dailytechwire — Primary logo (horizontal)</title>` → `<title>Opentechwire — Primary logo (horizontal)</title>`; dòng 4 `<desc>...Dailytechwire wordmark...</desc>` → cập nhật "Navy OTW monogram block, the Opentechwire wordmark..."; dòng 8 text `DTW` → `OTW`; dòng 11 text `dailytechwire` → `opentechwire`. Áp dụng **cùng bộ toạ độ pulse mới** từ QĐ-P3-3 (dòng 14-26 của file này lặp lại y hệt hình học của `wordmark.tsx`, chỉ khác là hex hardcode thay vì `var(--...)` — giữ nguyên `#1B2A52`/`#D4623C` hardcode theo D10, chỉ đổi toạ độ).
23. Cập nhật lại reference trong `wordmark.tsx` dòng 5 nếu chưa làm ở Bước 1 (trỏ đúng `otw-logo-primary.svg`).

### Nhóm G — Email lockup

24. Sửa `apps/web/src/lib/email.ts` dòng 79: `<span style="color:#1B2A52">DTW</span>` → `<span style="color:#1B2A52">OTW</span>`; `<span style="font-style:italic;font-weight:700;color:#D4623C">dailytechwire</span>` → `...>opentechwire</span>`. **Không đổi bất kỳ thuộc tính style/hex nào khác trên dòng này** — hex giữ nguyên theo D10, đây là nơi cố ý hardcode vì email client không đọc CSS custom property (đã ghi rõ trong comment dòng 61-65 của chính file). **Không đụng dòng 12-13** (xem "KHÔNG thuộc phase này").
25. **[Xác nhận bằng mắt]** Gửi thử một email hành động (vd. reset password ở dev, log ra console theo comment dòng 26-38 nếu `RESEND_API_KEY` chưa set) — xác nhận lockup hiển thị `OTW opentechwire` đúng font-style/màu.

### Nhóm H — PWA manifest (Phase 3 là chủ sở hữu DUY NHẤT — xem umbrella §6b.3)

26. Sửa `apps/web/src/app/manifest.ts` dòng 13: `name: "DailyTechWire"` → `name: "Opentechwire"` (D1 — sentence case, KHÔNG PascalCase).
27. Sửa dòng 14: `short_name: "DailyTechWire"` → `short_name: "OTW"`.
    **Phân giải chồng lấn (09-09-26)**: `manifest.ts:13-15` từng bị **cả Phase 3 lẫn Phase 4** cùng nhận, với hai giá trị `short_name` mâu thuẫn (P3: `"Opentechwire"`, P4: `"OTW"`). Umbrella §6b.3 đã chốt: **Phase 3 là chủ sở hữu duy nhất**, và giá trị đúng là `short_name: "OTW"` theo luật §5.1.1 (`short_name` là một nhãn ngắn, không phải văn xuôi — đúng mục đích của trường này: nhãn cho màn hình chính khi không đủ chỗ hiển thị tên đầy đủ). Phase 4 đã bỏ `manifest.ts` khỏi phạm vi.
28. Sửa dòng 15: `description: "Tech Intelligence, Wired Daily."` → `description: "Tech Intelligence, Openly Wired."` (D8).
29. **Không đổi** dòng 18-19 (`background_color`/`theme_color`) — D10.

### Nhóm I — Supabase Storage + content-engine (repo khác: `/home/hieunc/Code/content-engine`)

**Tiền đề của nhóm này**: Nhóm D (icon-512.png mới) phải hoàn tất và tồn tại trên đĩa tại `/home/hieunc/Code/dtw-web/apps/web/public/icon-512.png` TRƯỚC khi chạy Bước 31 — script upload đọc trực tiếp từ đường dẫn tuyệt đối này (không đọc từ git commit, không cần đã commit, chỉ cần có mặt trên đĩa).

30. Trong `content-engine/scripts/social-render-poc.ts` dòng 88, sửa **chỉ phần giá trị**: `dailytechwire: 'logos/dtw-monogram.png'` → `dailytechwire: 'logos/otw-monogram.png'`. **Không đổi tên khoá object `dailytechwire`** (khoá này là identifier nội bộ của script dùng làm giá trị flag CLI `--upload-logo=`, không phải slug publication đóng băng theo D11 — nhưng đổi nó là churn không cần thiết ngoài phạm vi đã giao; để nguyên). **Không đổi dòng 78** (`LOGO_FILES.dailytechwire` — local path, không đổi vì D7 giữ nguyên thư mục local `/home/hieunc/Code/dtw-web`).
31. Chạy từ `/home/hieunc/Code/content-engine`: `npx tsx scripts/social-render-poc.ts --upload-logo=dailytechwire` (yêu cầu `.env` đã có `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_STORAGE_BUCKET` — mặc định bucket `hero-images`, xác nhận trước khi chạy bằng `command grep SUPABASE_ .env`). Script tự in ra `Storage upload: <path>\n  public URL: <url>\n  GET → <status> <contentType> <bytes>B` (dòng 727 của script) — đây chính là bằng chứng chạy thật, dán nguyên output này vào report.
32. **[Xác nhận bằng lệnh, không chỉ tin log của script]** Xác nhận độc lập bằng `curl -sI "<url in ra ở Bước 31>"` — kỳ vọng URL dạng `https://yjuunnmejferyrbmjjci.supabase.co/storage/v1/object/public/hero-images/logos/otw-monogram.png`, response `HTTP/2 200` và `content-type: image/png`.
33. Sửa `content-engine/src/lib/publications/dtw/index.ts` dòng 182-183: `logoAssetUrl: 'https://yjuunnmejferyrbmjjci.supabase.co/storage/v1/object/public/hero-images/logos/dtw-monogram.png'` → giá trị URL mới xác nhận ở Bước 32 (`.../logos/otw-monogram.png`). Cập nhật luôn comment dòng 179-181 (hiện ghi "monogram lấy từ repo `hieuhn09/dtw-web`... GET 200 image/png 14.012B") với số byte thật lấy từ Bước 31/32 — **không copy số byte cũ 14.012B**, đó là của monogram cũ.
34. **Không** đụng bất kỳ trường nào khác trong cùng object `socialConfig` của file này (`displayName`, `domain`, `kicker`, `utmCampaign`, `siteBaseUrl`, v.v.) — các trường đó thuộc Phase 5.
    **Phân giải chồng lấn (09-09-26)**: `logoAssetUrl` (dòng 182-185) từng bị cả Phase 3 (Bước 33) lẫn Phase 5 (D.13) cùng nhận. Umbrella §6b.3 chốt **Phase 3 là chủ sở hữu duy nhất** — tách ra là để một cửa sổ mà `logoAssetUrl` trỏ vào một object key chưa tồn tại. Phase 5 D.13 nay chỉ còn là **bước XÁC MINH** (curl URL, xác nhận trả về ảnh `OTW`).

### Nhóm J — Cổng verification chung + commit

35. Từ `/home/hieunc/Code/dtw-web`, chạy grep phạm vi hẹp (chỉ các file Nhóm B/C/E/F/G/H, KHÔNG phải grep toàn repo — repo vẫn còn rất nhiều hit hợp lệ ở các phase khác chưa chạy):
    ```
    command grep -niE 'dailytechwire|daily ?tech ?wire|\bdtw\b|Tech Intelligence, Wired Daily' \
      apps/web/src/components/wordmark.tsx \
      apps/web/src/app/icon.svg \
      apps/web/src/lib/email.ts \
      apps/web/src/app/manifest.ts \
      apps/web/scripts/generate-og-default.mjs \
      apps/web/scripts/generate-brand-icons.mjs \
      apps/web/public/otw-logo-primary.svg
    ```
    Kỳ vọng: **0 dòng khớp**. (Lưu ý theo umbrella §6: **luôn dùng tiền tố `command `** — `grep` trần trong môi trường này là ugrep shim, tự động bỏ qua file theo `.gitignore` và bỏ qua nhị phân. Với danh sách file tường minh ở trên thì không cần `--exclude-dir`, nhưng nếu chạy lại trên toàn thư mục `apps/web/scripts/` hoặc `apps/web/public/` thì PHẢI thêm đủ `--exclude-dir`/`--exclude` như umbrella §6 đã liệt kê.)
36. Xác nhận file cũ đã biến mất khỏi working tree: `test -f apps/web/public/dtw-logo-primary.svg && echo "LỖI: file cũ vẫn còn" || echo "OK: đã đổi tên"`.
37. Chạy `pnpm --filter web typecheck` (= `tsc --noEmit`) — kỳ vọng sạch, không lỗi liên quan tới các file vừa sửa (file `.svg`/`.png`/`.mjs` không được TypeScript kiểm tra trực tiếp, nhưng bước này xác nhận không có import nào bị hỏng, ví dụ nếu có nơi nào đó import path cũ của SVG — hiện tại xác nhận **không có**, xem QĐ-P3-2).
38. Trong `/home/hieunc/Code/content-engine`, chạy `npx tsc --noEmit` — kỳ vọng sạch (xác nhận sửa `logoAssetUrl` không phá kiểu `SocialConfig.card.logoAssetUrl: string` ở `src/lib/publications/types.ts:91` — chỉ đổi giá trị chuỗi nên không có lý do gãy kiểu, nhưng vẫn chạy để có bằng chứng thật).
39. Rà lại 6 xác nhận-bằng-mắt đã liệt ở Bước 7-8, 13, 20, 25 — gộp tất cả vào report của phase kèm mô tả những gì đã thấy (không phải "đã kiểm tra" chung chung).
40. **[ONE-WAY DOOR nhẹ — ship nguyên khối]** Commit toàn bộ thay đổi trong `dtw-web` (Nhóm B/C/D/E/F/G/H) thành **một commit atomic duy nhất** — không tách text (Nhóm B/C/E/F/G/H) khỏi binary (Nhóm D/E). Gợi ý message dạng conventional-commit: `feat(brand): rebrand mark to Opentechwire/OTW (D1/D2/D8/D10)`. Đây là "one-way door nhẹ" vì về mặt kỹ thuật `git revert` hoàn toàn khôi phục được (không có gì không thể đảo ngược ở tầng code), nhưng một khi deploy lên production thì mọi social share/bookmark PWA mới từ thời điểm đó mang mark mới — không "rút lại" được ở phía người dùng đã thấy nó.
41. Commit riêng thay đổi trong `content-engine` (Nhóm I, dòng 88 của `social-render-poc.ts` + dòng 182-183 của `dtw/index.ts`) — **repo khác, commit khác**, không gộp chung với Bước 40. Message gợi ý: `feat(social): point dtw monogram at rebranded OTW asset`.

---

## Touchpoints

**Sửa trong `dtw-web`:**
- `apps/web/src/components/wordmark.tsx`
- `apps/web/src/app/icon.svg`
- `apps/web/src/app/manifest.ts`
- `apps/web/src/lib/email.ts` (chỉ dòng 79)
- `apps/web/scripts/generate-og-default.mjs`

**Tạo mới trong `dtw-web`:**
- `apps/web/scripts/generate-brand-icons.mjs`
- `apps/web/public/otw-logo-primary.svg` (đổi tên từ `dtw-logo-primary.svg`, nội dung vẽ lại)
- `apps/web/src/app/apple-icon.png` (ghi đè, sinh bởi script mới)
- `apps/web/public/icon-192.png` (ghi đè)
- `apps/web/public/icon-512.png` (ghi đè)
- `apps/web/public/icon-maskable-512.png` (ghi đè)
- `apps/web/public/og-default.png` (ghi đè, sinh bởi `generate-og-default.mjs`)

**Xoá (thực chất là rename, git sẽ tự detect):**
- `apps/web/public/dtw-logo-primary.svg`

**Sửa trong `content-engine`:**
- `scripts/social-render-poc.ts` (chỉ giá trị dòng 88)
- `src/lib/publications/dtw/index.ts` (chỉ dòng 182-183 + comment 179-181)

**Ngoài repo:**
- 1 object mới trên Supabase Storage bucket `hero-images`, key `logos/otw-monogram.png` (additive — key cũ `logos/dtw-monogram.png` không bị đụng)

---

## Public Contracts

- **`SocialConfig.card.logoAssetUrl`** (`content-engine/src/lib/publications/types.ts:91`, kiểu `string`): giá trị đổi, kiểu không đổi. Consumer duy nhất là `src/social/render.ts:307` (`fetchLogoDataUri(input.card.logoAssetUrl)`) — fetch một URL bất kỳ về data-URI, không có ràng buộc gì về key cụ thể, nên đổi giá trị an toàn miễn URL mới trả về `200 image/png` (xác nhận ở Bước 32).
- **`MetadataRoute.Manifest`** (`apps/web/src/app/manifest.ts`): shape không đổi, chỉ đổi giá trị `name`/`short_name`/`description`. Hệ quả biết trước: thiết bị nào đã "Add to Home Screen" từ bản cũ có thể **không tự cập nhật nhãn** trên màn hình chính cho tới khi gỡ cài lại — đây là hạn chế đã biết của PWA manifest, không phải lỗi của phase này (không có `id`/`scope` để làm migration path, và thêm chúng bây giờ không giải quyết được gì khi domain chưa đổi — xem "KHÔNG thuộc phase này").
- **Không có API route, không có DB schema, không có env var mới** trong Phase 3.

---

## Blast Radius

- **Cô lập cao, an toàn**: `apps/web/scripts/generate-brand-icons.mjs` (file mới, không ai import), object Storage mới (additive, không route nào phụ thuộc key mới cho tới khi Bước 33 tự trỏ vào).
- **Hiển thị công khai ngay lập tức sau deploy**: `icon.svg` (favicon mọi trang kể cả `/admin`), 4 PNG (tab title bar / install prompt / iOS home screen), `og-default.png` (mọi social share không có ảnh riêng), `wordmark.tsx` (header + footer + auth-modal — theo docblock, "Shared by the header, footer, and auth modal").
- **Không chạm**: bất kỳ route API, migration DB, RBAC, auth logic, hay Payload collection nào. Không đổi hex màu ở bất kỳ đâu (D10). Không đổi domain/env production (Phase 6).
- **Rủi ro chéo cần theo dõi**: nếu Bước 40 (commit `dtw-web`) deploy lên production **trước khi** Bước 31-33 (upload Storage + trỏ `logoAssetUrl`) hoàn tất, không sao — hai việc độc lập (Storage đọc file từ đĩa cục bộ, không phụ thuộc deploy). Nhưng nếu Bước 31 chạy **trước khi** Nhóm D hoàn tất (icon-512.png còn là bản cũ), object mới trên Storage sẽ chứa monogram `DTW` cũ dưới một cái tên `otw-monogram.png` gây hiểu nhầm — do đó thứ tự Nhóm D → Nhóm I là bắt buộc, không được đảo.

---

## Verification Evidence

Bắt buộc thu thập tất cả trước khi coi phase này `✅ VERIFIED` (không chỉ `🔨 CODE DONE`):

1. Output đầy đủ của lệnh grep ở Bước 35 (kỳ vọng rỗng).
2. Output của Bước 36 (`OK: đã đổi tên`).
3. Output đầy đủ của `pnpm --filter web typecheck` (Bước 37).
4. Output đầy đủ của `npx tsc --noEmit` trong `content-engine` (Bước 38).
5. Console log đầy đủ của `node scripts/generate-brand-icons.mjs` (Bước 12) và `node scripts/generate-og-default.mjs` (Bước 19).
6. Console output đầy đủ của `npx tsx scripts/social-render-poc.ts --upload-logo=dailytechwire` (Bước 31), bao gồm dòng `Storage upload: ... GET → ... `.
7. Output của `curl -sI` xác nhận độc lập (Bước 32) — status + content-type.
8. Xác nhận bằng mắt cho **6 hạng mục** (không thể grep): (a) `wordmark.tsx` render ở header/footer, light + dark mode (Bước 7-8); (b) `apple-icon.png`; (c) `icon-192.png`; (d) `icon-512.png`; (e) `icon-maskable-512.png` (kèm xác nhận căn giữa dọc đã sửa); (f) `og-default.png` (Bước 20); (g) email lockup render (Bước 25); (h) `otw-logo-primary.svg` mở trực tiếp trong trình duyệt. Mỗi mục cần một câu mô tả cụ thể những gì đã thấy, không phải "đã kiểm tra."
9. Giá trị **cuối cùng thực dùng** cho `viewBox`/toạ độ pulse của `wordmark.tsx` (Bước 6-7) và `cx` của pulse-dot trong `generate-og-default.mjs` (Bước 16) — ghi lại dù có khác so với con số khởi điểm ở QĐ-P3-3/Bước 16, vì đây là kết quả sau khi mắt thường chỉnh, không phải giá trị lý thuyết.
10. Hai commit hash: một cho `dtw-web` (Bước 40), một cho `content-engine` (Bước 41).

**Việc KHÔNG thể verify được ở phase này** (do PLAN mode không có network/browser thật, và một số việc phụ thuộc thiết bị thật): hành vi PWA install-prompt thật trên Android/iOS (yêu cầu build production thật + thiết bị/emulator), việc social card thật của `content-engine` render ra sao lần publish tiếp theo (đó là hành vi runtime của `src/social/render.ts`, không kiểm được từ Phase 3). Ghi các mục này vào report là "chưa kiểm được trong phase này", không suy diễn là đã pass.

---

## Rollback

- **`dtw-web`**: `git revert <commit-hash-buoc-40>` — khôi phục nguyên trạng toàn bộ Nhóm B/C/D/E/F/G/H trong một lệnh, vì mọi thứ đã ship trong một commit atomic (đúng mục đích thiết kế của Bước 40).
- **`content-engine`**: `git revert <commit-hash-buoc-41>` — khôi phục `logoAssetUrl` về key cũ ngay lập tức, không có downtime (key cũ `logos/dtw-monogram.png` chưa từng bị đụng, vẫn còn nguyên trên Storage).
- **Object Storage mới** (`logos/otw-monogram.png`): không bắt buộc phải xoá khi rollback — để lại vô hại (không route/consumer nào khác trỏ vào nó ngoài `logoAssetUrl` vừa bị revert). Nếu muốn dọn, xoá thủ công qua Supabase dashboard hoặc Storage API — không có script xoá tự động trong phase này (không cần thiết).
- **Không có rollback DB/migration nào cần thiết** — Phase 3 không chạm schema hay dữ liệu sống nào.

---

## Risks (bổ sung riêng cho Phase 3, ngoài 5 rủi ro chương trình đã ghi ở umbrella §7)

| Rủi ro | Mức độ | Giảm thiểu |
|---|---|---|
| `dominant-baseline="central"` không được librsvg trên máy build hỗ trợ đúng → 4 icon PNG lệch tâm y hệt lỗi cũ | Trung bình | Bước 14: fallback tính `y` thủ công, xác nhận lại bằng mắt trước khi commit |
| Con số `cx`/`viewBox` khởi điểm ở QĐ-P3-3/Bước 16 không khớp font-metrics thật, wordmark/OG card trông lệch | Trung bình | Bắt buộc xác nhận bằng mắt ở Bước 7-8/20 trước khi commit — đây là lý do các bước đó được đánh dấu "bắt buộc", không phải tuỳ chọn |
| Chạy Bước 31 (upload Storage) trước khi Nhóm D xong → object mới mang nội dung monogram cũ dưới tên mới, gây hiểu nhầm khi Phase 5 tới xác nhận | Cao nếu làm sai thứ tự | Tiền đề của Nhóm I đã nêu rõ: chạy sau Nhóm D, không trước |
| Quên Bước 36 (xoá file cũ `dtw-logo-primary.svg`) → hai file logo cùng tồn tại (một cũ một mới), một cái mồ côi | Thấp | Bước 36 là lệnh xác minh cụ thể, không phải tuỳ chọn |
| `.env` của `content-engine` thiếu `SUPABASE_SERVICE_ROLE_KEY` thật (chỉ có placeholder từ `.env.example`) → Bước 31 fail ngay, không upload được | Thấp (đã biết trước — repo production script, khả năng cao đã cấu hình) | Bước 31 yêu cầu `command grep SUPABASE_ .env` trước khi chạy, để phát hiện sớm nếu thiếu, thay vì fail giữa chừng |

---

## Acceptance Criteria

- [ ] `apps/web/src/components/wordmark.tsx` render `OTW` + `opentechwire` + pulse cân đối, xác nhận bằng mắt ở cả light/dark mode.
- [ ] `apps/web/src/app/icon.svg` hiển thị `OTW` (favicon tab).
- [ ] 4 file PNG (`apple-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`) đều hiển thị `OTW` trên nền navy, `icon-maskable-512.png` căn giữa dọc đúng (bug cũ đã sửa).
- [ ] `apps/web/public/og-default.png` hiển thị `opentechwire` + tagline `Tech Intelligence, Openly Wired`.
- [ ] `apps/web/public/dtw-logo-primary.svg` không còn tồn tại; `apps/web/public/otw-logo-primary.svg` tồn tại, hiển thị `OTW`/`opentechwire`.
- [ ] `apps/web/src/lib/email.ts:79` hiển thị `OTW opentechwire` khi render action email.
- [ ] `apps/web/src/app/manifest.ts` có `name: "Opentechwire"` **và** `short_name: "OTW"` (hai giá trị KHÁC NHAU — xem Bước 27, umbrella §5.1.1/§6b.3), `description` chứa `"Tech Intelligence, Openly Wired."`; `background_color`/`theme_color` không đổi.
- [ ] Grep phạm vi hẹp ở Bước 35 trả về 0 dòng khớp.
- [ ] `pnpm --filter web typecheck` sạch.
- [ ] Object mới `hero-images/logos/otw-monogram.png` tồn tại trên Supabase Storage, `curl -sI` trả `200`/`image/png`.
- [ ] `content-engine/src/lib/publications/dtw/index.ts:183` trỏ đúng URL mới; `npx tsc --noEmit` trong `content-engine` sạch.
- [ ] Không hex màu nào bị đổi ở bất kỳ file nào trong phase này (D10) — xác nhận bằng cách diff các dòng hex trong mọi file đã sửa vẫn là `#1B2A52`/`#D4623C`/`#FFFFFF` y hệt trước.
- [ ] Hai commit riêng biệt tồn tại: một trong `dtw-web` (atomic, Bước 40), một trong `content-engine` (Bước 41).
- [ ] User đã xem bằng chứng ở report và xác nhận — chỉ khi đó phase mới được đánh dấu `✅ VERIFIED` (theo Phase Completion Rules bên dưới và umbrella §"Phase Completion Rules").

---

## Phase Completion Rules (áp dụng riêng cho Phase 3, không thấp hơn mức chung của umbrella)

Phase này KHÔNG được coi là xong cho tới khi:

1. Toàn bộ 41 bước ở Implementation Checklist đã chạy, không bỏ qua Bước 0 hay bất kỳ bước "xác nhận bằng mắt" nào.
2. Grep phạm vi hẹp (Bước 35) VÀ `tsc --noEmit` ở cả hai repo (Bước 37-38) đều sạch, có output thật dán vào report.
3. Cả 8 mục xác nhận-bằng-mắt (Verification Evidence #8) đã thực hiện thật, có mô tả cụ thể — không phải suy luận từ "code đã sửa nên chắc đúng."
4. Object Storage mới đã tồn tại thật và được xác nhận độc lập bằng `curl` (không chỉ tin log của script upload).
5. Regression check: chạy lại grep của Phase 0 (nếu Phase 0 đã `✅ VERIFIED` trước đó) trên `process/context/all-context.md`/`uxui/all-uxui.md` để xác nhận Phase 3 không vô tình sửa lại các đoạn context đó.
6. **User Confirmation** — user đã xem bằng chứng và xác nhận (user confirmed) trước khi phase được đánh dấu xong. Không có xác nhận này, trạng thái cao nhất được phép là `🧪 TESTING`, không phải `✅ VERIFIED`.

Marker trạng thái: `⏳ PLANNED` · `🔨 CODE DONE` · `🧪 TESTING` · `✅ VERIFIED` · `🚧 BLOCKED`.

---

## Resume and Execution Handoff

Nếu một phiên EXECUTE bị ngắt giữa chừng (compaction, timeout), phiên tiếp theo phải:

1. Đọc lại plan này toàn bộ, đặc biệt Bước 0 (gate Phase 0) và thứ tự bắt buộc Nhóm D → Nhóm I.
2. Chạy `git status`/`git log -1` trong cả `dtw-web` và `content-engine` để biết đã làm tới đâu — Bước 40/41 là hai commit riêng, việc một cái đã commit còn cái kia chưa là trạng thái hợp lệ giữa chừng (không phải lỗi), miễn thứ tự Nhóm D → Nhóm I được tôn trọng.
3. Kiểm tra `apps/web/public/dtw-logo-primary.svg` có còn tồn tại không (Bước 36) để biết Nhóm F đã chạy chưa — không chạy lại `git mv` nếu file đích `otw-logo-primary.svg` đã tồn tại.
4. Kiểm tra Supabase Storage (qua `curl` URL mới) trước khi chạy lại Bước 31 — script dùng `upsert: true` nên chạy lại vô hại nhưng không cần thiết nếu object đã tồn tại đúng.
5. Không được coi Bước 7/8/13/20/25 (xác nhận bằng mắt) là "đã làm" chỉ vì code đã sửa — mỗi lần resume phải tự mắt kiểm tra lại nếu chưa có ghi chú xác nhận trong report.

**Validator cho chính plan này**:
```
node .claude/skills/vc-generate-plan/scripts/validate-plan-artifact.mjs process/features/rebrand/active/phase-3-the-mark_PLAN_08-09-26.md
```

---

## Next Step

Đây là output của PLAN mode trong RIPER-5. Plan này mô tả đầy đủ, không mơ hồ, cho một pass EXECUTE duy nhất của Phase 3.

**Trước khi nói "ENTER EXECUTE MODE"**: xác nhận lại Bước 0 (trạng thái Phase 0). Plan Phase 0 **đã tồn tại** tại `process/features/rebrand/active/phase-0-lock-decisions_PLAN_09-09-26.md` (cập nhật 09-09-26 — câu "hiện chưa có file này" ở bản trước đã lỗi thời). Nếu Phase 0 chưa **chạy**, nên chạy Phase 0 trước, hoặc xác nhận với user rằng việc bỏ qua Phase 0 là chủ đích (không khuyến nghị, vì rủi ro nêu ở "Tiền đề" bên trên là thật, đã kiểm chứng bằng grep).

Khi đã sẵn sàng: nói **"ENTER EXECUTE MODE"** để bắt đầu triển khai đúng plan này. EXECUTE phải tuân thủ plan này với độ trung thực 100%, dừng lại và hỏi nếu bất kỳ giả định nào ở "Quyết định của plan này" (QĐ-P3-1/2/3) hoá ra không đúng với thực tế khi thực thi (ví dụ: font-metrics thực tế lệch quá xa số khởi điểm, hoặc `dominant-baseline` không được hỗ trợ) — không tự ý cải biên rồi im lặng tiếp tục.
