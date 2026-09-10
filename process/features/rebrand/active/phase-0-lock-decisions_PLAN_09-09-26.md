# Rebrand Phase 0 — Chốt và ghi lại quyết định (context trước, code sau)

**Date**: 09-09-26
**Complexity**: SIMPLE → **MEDIUM** (cập nhật 09-09-26: Nhóm 9 bổ sung phần còn lại của §3.9 process-docs mà trước đây không phase nào nhận — vẫn một phiên execute, vẫn thuần text, nhưng số file tăng từ 8 lên ~25)
**Feature**: `rebrand`
**Phase**: 0 / 8 của chương trình `process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md`
**Plan file**: `process/features/rebrand/active/phase-0-lock-decisions_PLAN_09-09-26.md`

> **Ghi chú hình dạng file (cho validator + agent resume sau này)**: tên file bắt đầu bằng `phase-` theo bảng tên file có thẩm quyền ở umbrella §3, nhưng đây là một **direct `_PLAN_` plan file bình thường** theo `process/development-protocols/plan-lifecycle.md`, KHÔNG phải cấu trúc legacy multi-file (`PLAN.md` + `phase-*.md` rời rạc). **Primary execute anchor**: chính file này là execute anchor **duy nhất** cho Phase 0 — nó tự chứa toàn bộ nội dung cần thiết. Không có **supporting phase files** hay `phase-*.md` phụ trợ nào đi kèm; tiền tố `phase-` chỉ tình cờ trùng với heuristic `isLegacyPlanShape` của validator.
**Tài liệu nền (đã đọc toàn bộ trước khi viết plan này)**:
- `process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md` (429 dòng — ledger D1-D15, bản đồ 8 phase, hệ quả D4, danh sách đóng băng §5.2/§5.3)
- `process/general-plans/references/rebrand-opentechwire_REFERENCE_08-09-26.md` (753 dòng — §3 blast radius, §7 phase 0 gốc dòng 663, §8 ẩn số)
- `process/development-protocols/plan-lifecycle.md`, `process/development-protocols/implementation-standards.md`
- `process/context/all-context.md`, `process/context/uxui/all-uxui.md`, `process/context/infra/all-infra.md`, `process/context/integrations/all-integrations.md`, `process/context/tests/all-tests.md`
- `design/project/uploads/DTW-Brand-Guideline-v1.0.pdf` (đọc trực tiếp toàn bộ trong phiên PLAN này — xem "Research Corrections" bên dưới)

**Status**: 🧪 TESTING — EXECUTE hoàn tất 09-09-26 với bằng chứng đầy đủ tại `process/features/rebrand/reports/phase-0-lock-decisions_REPORT_09-09-26.md`; Nhóm 3 (`apcg-cms`) BLOCKED có chủ đích do phạm vi phiên EXECUTE (nội dung cần đổi đã ghi sẵn trong report để user tự áp); chờ user xem bằng chứng và xác nhận trước khi chuyển ✅ VERIFIED.
**Sửa đổi 09-09-26 (soát nhất quán 9 plan)**: thêm **Nhóm 9** — phần còn lại của §3.9 process-docs (`auth/all-auth.md`, 5 dòng còn lại của `uxui/`, `infra/`, `integrations/`, `database/`, `tests/`, `planning/`, cả 9 `_GUIDE.md`, banner cho 8 plan/reference, `design/README.md`). Lý do: soát chéo phát hiện các file này **không được phase nào nhận** — bản gốc đẩy sang Phase 4/6 nhưng cả hai phase đó đều không liệt kê chúng. Xem umbrella §6b.1.

---

## Overview

Phase 0 của chương trình rebrand Dailytechwire → Opentechwire. Việc duy nhất của phase này là **ghi 15 quyết định đã chốt (D1-D15) vào các file context/plan mà agent tương lai đọc TRƯỚC KHI code**, cộng hai khoản dọn dẹp độc lập-với-rebrand (credential bịa ở footer, vệ sinh git). Không có dòng code brand nào (UI/SEO/asset) bị đổi tên trong phase này — đó là việc của Phase 3/4. Lý do phase này đứng đầu và không có dependency: nếu context vẫn còn nói "DailyTechWire"/"Dailytechwire" là brand chuẩn, một agent tuân thủ đúng quy trình orchestration (đọc context trước khi làm) có thể tự ý "sửa lại cho đúng context" và vô tình revert rebrand giữa chừng — đây chính là rủi ro mà umbrella plan §3 Phase 0 nêu ra.

Phase này ghi lại quyết định (bao gồm cả những chỗ NGÀY HÔM NAY vẫn còn hiển thị brand cũ trên UI thật — điều đó được ghi rõ là "chưa làm, đợi Phase 3/4", không phải mâu thuẫn).

### Phạm vi này KHÔNG bao gồm (trỏ sang phase khác)

| Việc | Thuộc phase nào |
|---|---|
| Đổi tên literal `DTW`/`Dailytechwire`/`dailytechwire` trong bất kỳ file UI/SEO/asset code nào (`wordmark.tsx`, `icon.svg`, `metadata.ts`, `layout.tsx`, `header.tsx`, v.v.) | Phase 3 (brand mark), Phase 4 (display copy) |
| Sửa `apps/web/.env.example`, `.env.example`, `turbo.json` (apex → www) | Phase 2 |
| Gỡ việc ghim tag-authority host cũ ở `apps/web/src/lib/feed.ts:61,69,116` | Phase 2 |
| 6 asset nhị phân (`apple-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `og-default.png`, monogram Supabase) | Phase 3 |
| Domain/DNS, OAuth redirect URI, Resend DKIM/SPF/DMARC thật, trademark clearance | Phase 1 (việc thủ công của user, ngoài repo) |
| `content-engine`: `DTW_VOICE_SPEC`, `brief-configs.ts`, `social-rules.prompt.ts`, UPDATE 2 dòng Engine Supabase, rename author row | Phase 5 |
| Cutover env (`NEXT_PUBLIC_SITE_URL`, `BETTER_AUTH_URL`, `RESEND_FROM_DOMAIN` thật), Central tenant row, social handle, 6 storage-key (D14) | Phase 6 |
| GitHub repo rename (D7), `/home/hieunc/Code/DTW` (D15), `@dtw/*` scope (D6) | Phase 7 |
| ~~`process/context/uxui/all-uxui.md` dòng 18, 74~~ → **ĐÃ CHUYỂN VÀO PHASE NÀY** (Nhóm 9 bước 27) | Phase 0 — soát 09-09-26 phát hiện Phase 4 không hề nhận các dòng này |
| ~~`process/context/uxui/all-uxui.md` dòng 144, 264~~ → **ĐÃ CHUYỂN VÀO PHASE NÀY** (Nhóm 9 bước 27, chỉ thêm ghi chú, giá trị key vẫn đổi ở Phase 6) | Phase 0 — soát 09-09-26 phát hiện Phase 6 không hề nhận các dòng này |
| `process/context/all-context.md` dòng 149, 196, 222, 226, 256, 258 (nhắc `dtw-web`/`dtw-engine`/`dtw-workers`/`@dtw/*`) | KHÔNG BAO GIỜ đổi trong chương trình này — đây là tên repo/package, không phải tên brand (D6 hoãn, D7 chỉ đổi tên GitHub repo chứ không đổi các mention này) |
| `data-exports/README.md:8` ("Thư mục này nằm trong `.gitignore`") | KHÔNG cần sửa — câu này SAI hôm nay nhưng sẽ ĐÚNG ngay sau bước 21 của phase này (thêm `data-exports/` vào `.gitignore`) |
| Sửa lại con số "69 trang" ở tài liệu tham chiếu cho file PDF brand guideline (thực tế đã xác nhận là 30 trang) | Không thuộc phase nào trong 8 phase — đây là một correction cho chính tài liệu tham chiếu, nằm ngoài quyền ghi của PLAN mode (chỉ được ghi vào `process/features/rebrand/active/`); ghi lại làm ghi chú cho UPDATE PROCESS sau này |

### Dependency

**Không có.** Đây là phase đầu tiên, không phụ thuộc phase nào. Theo bảng dependency của umbrella plan: "0 — Lock decisions | Chặn bởi: — | Chạy song song được với: 1 | Chặn phase nào: 2, 3, 4 (về mặt quy trình)". Phase 1 (việc ngoài repo, do user tự làm) có thể chạy song song ngay từ bây giờ, độc lập với phase này.

### Research Corrections (phát hiện trong phiên PLAN này, không phải hành động EXECUTE)

Trong lúc chuẩn bị plan này, agent đã **mở trực tiếp** `design/project/uploads/DTW-Brand-Guideline-v1.0.pdf` (không suy đoán từ tài liệu tham chiếu) và xác nhận:

1. **Tài liệu tham chiếu ghi sai số trang.** `process/general-plans/references/rebrand-opentechwire_REFERENCE_08-09-26.md` dòng 297 ghi "69 pp" — file PDF thật chỉ có **30 trang** (kết thúc ở "— Hết tài liệu —" ngay trang 30, mục 12.4 "Version control"). Đây là một correction cho tài liệu tham chiếu, không phải một hành động của phase này (PLAN mode không được ghi vào `process/general-plans/references/`).
2. **Nội dung xác nhận đúng những gì tài liệu tham chiếu trích:** §1.3 core concept "Daily Pulse"; §1.4 tagline chính thức "Tech Intelligence, Wired Daily" + tagline phụ "From Asia, for the world"; §2.6/§12.3 bảng 8 file asset chuẩn (hôm nay chỉ có 1 file `dtw-logo-primary.svg` tồn tại thật); §12.1 quy tắc đặt tên file `[brand] = "dtw" cho mọi asset của DailyTechWire`; bìa + mọi footer ghi parent là "Asia Press Corporation" (tên đã bị thay bằng APCG từ 2026-06-14 — brand guideline này predate cả lần đổi tên đó, chứ không chỉ predate rebrand này).
3. **Phát hiện thêm, không có trong tài liệu tham chiếu:** §12.4 "Version control" của chính brand guideline ghi "Mọi thay đổi brand identity phải qua approval từ Brand Owner (Editor-in-Chief + Creative Lead)". Đây là một quy trình quản trị nội tại của publication hư cấu trong guideline, không phải một gate có thật trong dự án này — ghi lại làm thông tin, **không** dùng để chặn ledger D1-D15 (D1-D15 đã là quyết định thật của user, có thẩm quyền cao hơn một guideline nội bộ v1.0 đã lỗi thời).
4. **Màu sắc trong PDF này lệch với production** (đã biết từ tài liệu tham chiếu, xác nhận lại): `primary-900 #1E3A8A` / `accent-500 #F59E0B` trong PDF, khác `#1B2A52` / `#D4623C` đang chạy thật. Không hành động gì ở đây — D10 giữ nguyên màu production, và PDF này vốn đã là một lockup lệch chuẩn từ trước rebrand.

File PDF **không bị chỉnh sửa** trong phase này (binary, không phải target của Phase 0; quyết định có tái phát hành v2.0 hay không thuộc về brand owner, ngoài phạm vi 8 phase).

---

## Phase Completion Rules

Một bước KHÔNG được coi là xong cho tới khi:

1. **Integration Test** — sau khi sửa `footer.tsx`, chạy `pnpm typecheck` (root, tương đương `turbo typecheck` → `tsc --noEmit` cho `apps/web`) và xác nhận không có lỗi type mới phát sinh từ đúng thay đổi này.
2. **Manual Test** — mở lại từng file đã sửa, đọc nguyên văn đoạn đã đổi, xác nhận đúng nội dung dự kiến trong checklist bên dưới (không suy luận từ diff summary).
3. **Data Verification** — chạy các lệnh `grep`/`git diff`/`git status` liệt kê ở mục "Verification Evidence" và dán kết quả thật vào report của phase (không chỉ mô tả "đã sửa").
4. **Error Handling** — nếu một file mục tiêu đã trôi số dòng so với plan này (ví dụ `per-page-seo-metadata_PLAN_16-07-26.md` bị agent khác sửa giữa chừng), EXECUTE phải dừng lại, tìm lại đoạn text gốc bằng nội dung (không phải số dòng) trước khi sửa, và ghi chú độ lệch trong report — không tự đoán số dòng mới.
5. **User Confirmation** — user đã xem bằng chứng (diff + output lệnh) trong report của phase và xác nhận trước khi phase được đánh dấu ✅ VERIFIED. Không có xác nhận này, trạng thái cao nhất được phép là 🧪 TESTING.

Marker: ⏳ PLANNED · 🔨 CODE DONE · 🧪 TESTING · ✅ VERIFIED · 🚧 BLOCKED.

**Toàn bộ phase này là REVERSIBLE.** Không có bước nào là ONE-WAY DOOR theo nghĩa kiến trúc (không có domain/OAuth/social-handle nào bị đổi). Ngoại lệ duy nhất đáng nói: bước 23 (xoá file JPEG rác, untracked) là không thể hoàn tác qua git vì file chưa từng được track — nhưng file đó xác nhận không có nơi nào tham chiếu (xem bước 23), nên rủi ro mất mát thực tế bằng không.

---

## Goals and Success Metrics

1. Mọi file context durable mà agent đọc trước khi code (`all-context.md`, `uxui/all-uxui.md`, `infra/all-infra.md`, `integrations/all-integrations.md`) phản ánh đúng ledger D1-D15 — kể cả những chỗ code THẬT vẫn còn brand cũ (ghi rõ "chưa làm, đợi Phase N").
2. File plan duy nhất có "Decisions Log" ép brand casing về `DailyTechWire` (`per-page-seo-metadata_PLAN_16-07-26.md`) không còn có thể bị một EXECUTE agent tuân theo đúng nghĩa đen mà vô tình revert rebrand.
3. Hai khoản dọn dẹp độc lập-với-rebrand (credential bịa "Member, Trust Project"; vệ sinh git cho `ds`/JPEG rác/`data-exports/`/file zip GSC) được xử lý dứt điểm.
4. **Zero** rename brand trong code sản phẩm (UI/SEO/asset) xảy ra trong phase này — đo được bằng `git diff --stat` chỉ liệt kê đúng danh sách Touchpoints bên dưới, không hơn.

**Success metric đo được**: `git diff --stat` (cả hai repo `dtw-web` và `apcg-cms`) sau EXECUTE khớp CHÍNH XÁC với bảng "Touchpoints" (đã mở rộng 09-09-26 để gồm Nhóm 9 — §3.9 process-docs) — không có file thừa, không có file thiếu. Đúng **một** file `.tsx` được chạm: `apps/web/src/components/footer.tsx`.

---

## Execution Brief

### Nhóm 1 — Khoá context ở `dtw-web` (4 file: `all-context.md`, `uxui/all-uxui.md`, `infra/all-infra.md`, `integrations/all-integrations.md`)

- **What happens**: Viết lại phần chữ của 3 invariant hiện có (#7, #11, #14), thêm invariant #15 mới, thêm 2 section "Canonical Host" mới (`all-context.md` và `infra/all-infra.md`), sửa 3 dòng brand đơn lẻ (`uxui:152-154`), thêm 1 section mới về đóng băng slug (`integrations`).
- **Test**: Đọc lại từng đoạn đã sửa, đối chiếu với ledger D1-D15 trong umbrella plan — không được có `OpenTechWire` (PascalCase) ở bất kỳ đâu.
- **Verify**: `git diff process/context/all-context.md process/context/uxui/all-uxui.md process/context/infra/all-infra.md process/context/integrations/all-integrations.md` — mọi hunk phải khớp đúng vị trí đã liệt kê trong Implementation Checklist, không có hunk lạ.
- **Done when**: `command grep -c "OpenTechWire"` trên cả 4 file trả về `0`, và mỗi invariant/section mới trỏ đúng về `process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md`.

### Nhóm 2 — Vô hiệu hoá bẫy revert trong `per-page-seo-metadata_PLAN_16-07-26.md`

- **What happens**: Đổi `Status` từ `⏳ PLANNED` sang `🚧 BLOCKED`, chèn banner SUPERSEDED ngay dưới Status, chèn 2 ghi chú nội tuyến tại 2 vị trí trong "Decisions Log" — KHÔNG xoá/sửa văn bản gốc.
- **Test**: `wc -l` trước/sau phải TĂNG (không giảm) — chứng minh không có nội dung lịch sử nào bị xoá.
- **Verify**: `command grep -n 'Brand casing = \`DailyTechWire\`'` vẫn phải còn khớp y nguyên (văn bản gốc được bảo tồn).
- **Done when**: File có banner SUPERSEDED rõ ràng ở đầu và `Status` không còn là `⏳ PLANNED`.

### Nhóm 3 — Sửa text trong repo `apcg-cms` (sibling repo, độc lập git)

- **What happens**: Đổi đúng 1 giá trị `role:` trong dòng 115 của `brief-content-type_PLAN_20-08-26.md`, giữ nguyên `tenant: dtw` và `name: "DTW Briefing Desk"`.
- **Test**: Đọc lại dòng 115, xác nhận CHỈ 1 trong 3 giá trị trong dấu ngoặc kép bị đổi.
- **Verify**: `command grep -n 'tenant: dtw' /home/hieunc/Code/apcg-cms/process/general-plans/active/brief-content-type_PLAN_20-08-26.md` vẫn khớp y nguyên.
- **Done when**: `command grep -n 'role: "Opentechwire Newsroom"'` khớp; `command grep -n 'role: "Dailytechwire Newsroom"'` không còn khớp.

### Nhóm 4 — Dọn credential bịa ở footer (code thật, cần typecheck)

- **What happens**: Xoá cụm ` · Member, Trust Project` khỏi `apps/web/src/components/footer.tsx:234`. Brand name "Dailytechwire" ở dòng này GIỮ NGUYÊN (đổi brand ở đây là việc của Phase 4).
- **Test**: `pnpm typecheck` (root) chạy sạch.
- **Verify**: `command grep -n "Trust Project" apps/web/src/components/footer.tsx` trả về không có kết quả nào.
- **Done when**: typecheck pass và grep xác nhận cụm bịa đã biến mất, dòng còn lại là `© 2026 Dailytechwire · Singapore`.

### Nhóm 5 — Vệ sinh git ở root `dtw-web`

- **What happens**: Thêm 3 pattern vào `.gitignore`; `git rm ds`; `rm` file JPEG rác; KHÔNG đụng `data-exports/` (nội dung) hay file zip GSC (chỉ gitignore, không xoá).
- **Test**: `git status --porcelain` không còn liệt kê `ds`, file JPEG, `data-exports/`, hay file zip Coverage như noise.
- **Verify**: `git check-ignore -v data-exports/ "dailytechwire.com-Coverage-2026-08-06.zip"` trả về match cho cả hai.
- **Done when**: `git status --porcelain` sạch đúng như mô tả, và `data-exports/articles_images.csv` vẫn còn tồn tại nguyên vẹn trên đĩa (chỉ ignore, không xoá).

**Expected Outcome (cuối phase 0):**
- 4 file context ở `dtw-web` phản ánh đúng ledger D1-D15, có trỏ rõ ràng về umbrella plan.
- File SEO-metadata cũ không còn là bẫy khiến agent sau vô tình revert brand casing/canonical host.
- 1 dòng text ở `apcg-cms` không còn nhắc "Dailytechwire Newsroom".
- Footer không còn credential "Trust Project" bịa.
- `.gitignore` sạch, không còn `ds` rác, không còn JPEG rác ở root; `data-exports/` và file zip GSC vẫn còn nguyên trên đĩa nhưng không còn là noise trong `git status`.
- **Không một literal brand nào trong code sản phẩm (UI/SEO/asset) bị đổi tên.** Đó vẫn là "Dailytechwire"/"DTW" y nguyên, đúng như kế hoạch — việc đó đợi Phase 3/4.

---

## Scope (In / Out)

**In scope** — đúng 8 file/vị trí, liệt kê đầy đủ ở "Touchpoints" bên dưới.

**Out of scope** — xem bảng "Phạm vi này KHÔNG bao gồm" ở đầu file.

---

## Assumptions and Constraints

- Ledger D1-D15 (umbrella plan §2) là quyết định cuối cùng của user — phase này **không được bàn lại**, chỉ ghi lại.
- Repo `apcg-cms` là git repo độc lập tại `/home/hieunc/Code/apcg-cms` — sửa file ở đó không tạo commit trong `dtw-web` và ngược lại; hai `git status`/`git diff` phải chạy riêng.
- `dtw-web` hiện **chưa có test tự động nào** (`process/context/tests/all-tests.md`: "Nothing exists yet (greenfield)") — verification của phase này dựa vào `grep`, `git diff`, `pnpm typecheck`, và soát bằng mắt; không có unit/e2e test nào áp dụng được cho các thay đổi thuần Markdown.
- File `brief-content-type_PLAN_20-08-26.md` bên `apcg-cms` là markdown, không phải code — không cần chạy test/typecheck cho sửa đổi ở đó.
- Vì mọi file mục tiêu (trừ `footer.tsx`) là Markdown, EXECUTE PHẢI dùng khớp theo **nội dung text gốc** (old_string chính xác) khi gọi Edit, không chỉ dựa vào số dòng — số dòng ghi trong plan này là số dòng tại thời điểm phiên PLAN 09-09-26, dùng để định vị nhanh, không phải toạ độ tuyệt đối đáng tin nếu file đã trôi.
- Không file nào trong phase này nằm trong danh sách "File CẤM ĐỘNG" (§5.3 umbrella) hay "Identifier ĐÓNG BĂNG" (§5.2 umbrella) — đã đối chiếu thủ công, không trùng.

---

## Functional Requirements

- FR1: Mọi mention brand publication trong 4 file context `dtw-web` phải dùng đúng 3-tầng casing D1/D2 (`Opentechwire` prose, `opentechwire` chỉ trong wordmark lockup, `OTW` monogram), trừ những chỗ mô tả LỊCH SỬ (trạng thái cũ trước rebrand) — những chỗ đó giữ nguyên "DailyTechWire"/"Dailytechwire"/"DTW" có ghi rõ là lịch sử.
- FR2: Không invariant/section mới nào được thêm ngôn ngữ chỉ dẫn thêm redirect hoặc Change of Address cho domain cũ (hệ quả D4).
- FR3: File SEO-metadata cũ phải có tín hiệu SUPERSEDED không thể bỏ sót ở đầu file, và tín hiệu tại đúng 2 vị trí Decisions Log liên quan.
- FR4: Slug `dtw`, schema `dtw_auth`, bucket `dtw-media`, tên repo/package `dtw-web`/`dtw-engine`/`dtw-workers`/`@dtw/*` KHÔNG được đổi ở bất kỳ đâu trong phase này (D6/D7/D11/D12).

## Non-Functional Requirements

- Không có thay đổi hành vi runtime nào cho reader, ngoại trừ MỘT thay đổi hiển thị: cụm "· Member, Trust Project" biến mất khỏi footer trên mọi trang (site-wide, vì `Footer` render ở layout chung).
- Không có migration DB nào trong phase này.
- Diff phải tối thiểu — chỉ sửa đúng đoạn mô tả trong checklist, không "tiện tay" sửa thêm các mention brand khác trong cùng file (xem bảng out-of-scope).

---

## Acceptance Criteria

1. `command grep -n "OpenTechWire" process/context/all-context.md process/context/uxui/all-uxui.md process/context/infra/all-infra.md process/context/integrations/all-integrations.md` trả về **0 dòng** (không có PascalCase bị lỡ tay gõ).
2. `process/context/all-context.md` có đúng 15 invariant đánh số, invariant #15 tồn tại và trỏ về umbrella plan.
3. `process/context/all-context.md` có section `## Canonical Host` mới, nêu `https://www.opentechwire.com` (www) và KHÔNG có bất kỳ câu chỉ dẫn thêm redirect/Change of Address nào.
4. `process/context/infra/all-infra.md` có section `## Canonical Host` mới với cùng ràng buộc không-redirect.
5. `process/context/uxui/all-uxui.md` dòng 152-154 (khu vực bảng Brand Identity) nêu `Opentechwire`/`opentechwire`/`OTW`/tagline mới, đồng thời vẫn giữ nguyên các câu lịch sử "Earlier iterations... rejected".
6. `process/context/integrations/all-integrations.md` có section mới nêu rõ slug `dtw` đóng băng vĩnh viễn (D11), trỏ về umbrella plan §5.2.
7. `process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md`: `Status` không còn là `⏳ PLANNED`; có banner SUPERSEDED; `wc -l` sau ≥ `wc -l` trước + số dòng đã chèn (không mất nội dung).
8. `/home/hieunc/Code/apcg-cms/process/general-plans/active/brief-content-type_PLAN_20-08-26.md`: dòng chứa `tenant: dtw` giờ có `role: "Opentechwire Newsroom"`, không còn `role: "Dailytechwire Newsroom"`.
9. `apps/web/src/components/footer.tsx`: không còn chuỗi `"Trust Project"`; `pnpm typecheck` (root) exit code `0`.
10. `.gitignore` chứa 3 pattern mới; `git status --porcelain` không còn liệt kê `ds`, JPEG rác, `data-exports/`, hay file zip Coverage.
11. `data-exports/articles_images.csv` và `dailytechwire.com-Coverage-2026-08-06.zip` vẫn tồn tại nguyên vẹn trên đĩa sau phase này (chỉ ignore, không xoá nội dung).
12. `git diff --stat` (cả hai repo cộng lại) chỉ liệt kê các file có trong bảng "Touchpoints" — **không hơn**. Sau khi Nhóm 9 được thêm vào (09-09-26), danh sách gồm 7 file gốc trong `dtw-web` + 1 file trong `apcg-cms` + 2 file bị xoá (`ds`, JPEG root) + nhóm §3.9 (4 file `process/context/` bổ sung, 9 file `_GUIDE.md`, 8 plan/reference nhận banner, `design/README.md`). Không có file `.ts`/`.tsx` nào bị chạm ngoài `apps/web/src/components/footer.tsx`.
13. Nhóm 9: `command grep -rn "OpenTechWire" process/ design/README.md` trả về 0 dòng ngoài các câu CẤM trong chính tài liệu rebrand; và mọi dòng `DailyTechWire`/`Dailytechwire` còn lại trong `process/context/` + `process/features/*/_GUIDE.md` đều nằm trong một câu có nhãn lịch sử — đối chiếu từng dòng, không đếm tổng.

---

## Implementation Checklist

> Ghi chú áp dụng cho MỌI bước bên dưới: số dòng là số dòng tại thời điểm phiên PLAN 09-09-26. EXECUTE phải mở lại file, xác nhận đoạn text gốc còn khớp y nguyên trước khi sửa; nếu lệch, dừng lại và ghi chú độ lệch (xem "Phase Completion Rules" mục 4).

### Nhóm 1 — `process/context/all-context.md`

1. **Bump ngày cập nhật** — dòng 3: đổi `Last updated: 2026-07-17` → `Last updated: 2026-09-09`.

2. **Dòng 18** — đổi:
   ```text
   Cũ: **Dailytechwire (DTW)** — a global, digital-native technology publication with an Asian vantage point: funding and tech-stock coverage, AI benchmarks and rankings, and deep-dive editorial. (Repositioned from "Asia-tech focus" to global by product decision 2026-07-17 — see invariant #14.) The web app (`dtw-web`) is the **reading and presentation layer** of a three-service system:

   Mới: **Opentechwire (OTW)** — a global, digital-native technology publication with an Asian vantage point: funding and tech-stock coverage, AI benchmarks and rankings, and deep-dive editorial. (Repositioned from "Asia-tech focus" to global by product decision 2026-07-17 — see invariant #14. Renamed from Dailytechwire/DTW by rebrand decision 2026-09-08 — see invariant #15 and `process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md`.) The web app (`dtw-web`) is the **reading and presentation layer** of a three-service system:
   ```
   Lưu ý: `dtw-web` (tên repo) GIỮ NGUYÊN — không đổi theo D7.

3. **Dòng 38** — đổi từ đầu câu "Dailytechwire is published by..." → "Opentechwire is published by..." (chỉ đổi đúng 1 từ đầu câu, phần còn lại của câu về APCG/Cheryl Tan giữ nguyên y hệt).

4. **Invariant #7 (hiện ở dòng 131)** — đổi cụm `**2026-06-14 design refresh:** DTW coral accent softened` → `**2026-06-14 design refresh:** the brand's coral accent softened`, và thêm câu sau vào cuối invariant (trước `See \`uxui/\`.`):
   ```text
   **These hex values are unchanged by the 2026-09 Opentechwire rebrand (ledger D10) — only the old "DTW" name in this note's own wording was removed; no token, no asset, and no color changed.**
   ```

5. **Invariant #11 (hiện ở dòng 135)** — viết lại toàn bộ câu về header logo + tagline thành:
   ```text
   11. **Tech stack veto list:** no Lucia (deprecated), no Bun runtime (Payload 3 ↔ Bun is unstable). **Header logo (changed 2026-06-14, mark updated 2026-09 rebrand — see invariant #15):** the design refresh reintroduced a brand mark — originally a navy `DTW` monogram + lowercase `dailytechwire` wordmark + terracotta pulse-dot (source asset `design/project/uploads/dtw-logo-primary.svg`), superseding the earlier wordmark-only rule. **Target state post-rebrand (ledger D1/D2/D8):** navy `OTW` monogram + lowercase `opentechwire` wordmark, same terracotta pulse-dot (color unchanged, D10). Tagline changes from "Tech Intelligence, Wired Daily" to **"Tech Intelligence, Openly Wired"** (D8). As of this Phase 0 context lock, the actual `wordmark.tsx`, `icon.svg`, and raster asset files still render the old `DTW`/`dailytechwire`/old-tagline mark — that code/asset work is Phase 3 (brand mark) and Phase 4 (display copy) of `process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md`, not yet done.
   ```

6. **Invariant #14 (hiện ở dòng 138)** — đổi 2 chỗ trong câu: `DTW is a global publication` → `Opentechwire is a global publication`; và cuối câu `not DTW — they stay.` → `not Opentechwire — they stay.` Phần còn lại (mọi câu về "Asia") giữ nguyên y hệt.

7. **Thêm invariant #15 mới** — chèn ngay sau invariant #14 (sau câu vừa sửa ở bước 6), trước dòng "If a change appears to violate one of these...":
   ```text
   15. **Brand rename: Dailytechwire/DTW → Opentechwire/OTW (locked 2026-09-08).** Three-tier casing (ledger D1/D2): `Opentechwire` (sentence case) for ALL prose, metadata, titles, and JSON-LD `name`; `opentechwire` (lowercase) ONLY inside the wordmark/OG-image lockup (the visual logotype itself); `OTW` (all-caps) for the monogram/short form. **Never** `OpenTechWire` (PascalCase) anywhere, in any context. Canonical production host is `https://www.opentechwire.com` (www, not apex — D3/D5). The old domain `dailytechwire.com` remains APCG-owned (to prevent third-party registration) but is deliberately **parked with no DNS A record, no redirect, and no Google Search Console Change of Address** (D4 — a deliberate deviation from typical domain-migration practice; do not add either mechanism without a fresh decision). **Frozen identifiers — NOT part of this rename, by design:** the internal Payload/content-engine join-key slug `dtw` (D11) and the Postgres schema `dtw_auth` / Cloudflare R2 bucket `dtw-media` (D12) all keep their `dtw`-prefixed names permanently. Full decision ledger (D1–D15), phased rollout status, and the frozen/forbidden identifier lists live at `process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md` — do not relitigate D1–D15 without an explicit new user decision.
   ```

8. **Thêm section "Canonical Host" mới** — chèn sau dòng 48 (mục "3. **This repository**...") và trước dòng 50 (`---`), theo dạng:
   ```text
   ## Canonical Host (rebrand D3/D5)

   Production origin is **`https://www.opentechwire.com`** — `www`, not apex. This follows the same www-over-apex pattern the codebase already established for the old domain in commit `24bf005` (2026-07-17); `apps/web/.env.example:12` and `process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md` still record the pre-rebrand **apex** value (`https://dailytechwire.com`) as production — that is now doubly stale (wrong domain AND wrong subdomain) and is corrected in `process/features/rebrand/active/` Phase 2 (canonical host), not in this Phase 0 context update.

   The old domain `dailytechwire.com` stays APCG-owned but **parked** — no A record, no redirect, no Change of Address filed with Google Search Console (ledger D4). See invariant #15.
   ```
   (Đặt "---" gốc ở dòng 50 làm dấu chia sau đoạn mới này, y như dấu chia hiện có giữa các section khác trong file.)

### Nhóm 2 — `process/context/uxui/all-uxui.md`

9. **Dòng 152-154** (bảng "Brand Identity") — viết lại 3 dòng thành:
   ```text
   | Site name | **Opentechwire** | "OTW" is the short form (breadcrumbs, Studio, Pro). Renamed from **DailyTechWire/DTW** by rebrand decision 2026-09-08 (ledger D1, `process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md`). Earlier iterations used "Daily Tech Wire" with spaces or "Down To the Wire" — both rejected before the DTW-era name shipped; `OpenTechWire` (PascalCase) is rejected for the new name (D1). |
   | Wordmark + logo | Navy `OTW` monogram + lowercase "opentechwire" + terracotta pulse-dot (target, per rebrand D1/D2 — **asset files not yet redrawn as of this Phase 0 note; see Phase 3 of the rebrand plan**) | Logo badge **reintroduced** in the 2026-06-14 refresh (asset `design/project/uploads/dtw-logo-primary.svg`, still the pre-rebrand `DTW` mark on disk), superseding the earlier wordmark-only rule. Monogram `--brand-navy` (dark `#E2E8F0`), dot `--brand-amber #D4623C` — colors unchanged by the rebrand (D10). |
   | Tagline | "Tech Intelligence, Openly Wired" | Sentence case (NOT all-caps). Earlier all-caps version rejected. Changed from "Tech Intelligence, Wired Daily" by rebrand decision D8 (2026-09-08) — the old tagline's "Daily" pun no longer fits the new name; code/asset still say the old tagline until rebrand Phase 4. |
   ```
   Dòng 155 (Coral accent) và 156 (Pillar nav) giữ nguyên, không đụng.

### Nhóm 3 — `process/context/infra/all-infra.md`

10. **Thêm section "Canonical Host" mới** — chèn sau dòng 50 ("Payload `/admin` is embedded..." đoạn kết Hosting Topology) và trước dòng 52 (`## ISR + Revalidation`):
    ```text
    ## Canonical Host (rebrand D3/D4/D5)

    Production origin target: **`https://www.opentechwire.com`** (www, not apex). `dailytechwire.com` remains APCG-owned but parked — no A record, no redirect, no Search Console Change of Address (D4, deliberate). DKIM/SPF/DMARC must be provisioned on the **new** domain before any Resend send goes out under it (rebrand Phase 1, external prerequisite — see `process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md`). Do not add a redirect rule or file a Change of Address for the old domain at any point in this rebrand.
    ```

11. **Dòng 106** — đổi:
    ```text
    Cũ: DKIM + SPF + DMARC on `dailytechwire.com` before any send.
    Mới: DKIM + SPF + DMARC on `opentechwire.com` before any send (rebrand target domain — D3/D5; see the Canonical Host note above). The old domain `dailytechwire.com`'s existing DKIM/SPF/DMARC records are left as-is — not migrated, not redirected (D4).
    ```

12. **Dòng 214** — đổi:
    ```text
    Cũ: - `RESEND_FROM_DOMAIN` (`dailytechwire.com`)
    Mới: - `RESEND_FROM_DOMAIN` (`opentechwire.com` — rebrand target domain, D3/D5; was `dailytechwire.com`)
    ```
    Không đụng dòng 37-39 (bảng Hosting Topology, tên repo `dtw-web`/`dtw-engine`/`dtw-workers`) và dòng 255 (`dtw-cookies`, thuộc D14/Phase 6).

### Nhóm 4 — `process/context/integrations/all-integrations.md`

13. **Thêm section mới "## 7. Rebrand Note — Frozen `dtw` Identifier (D11)"** — chèn sau nội dung "## 6. PostHog Ingestion" (kết thúc ở câu "...falls back to 3 if PostHog is unreachable.") và trước divider `---` / `## Quick Routing`:
    ```text
    ---

    ## 7. Rebrand Note — Frozen `dtw` Identifier (D11)

    The Opentechwire rebrand (2026-09, ledger at `process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md`) renamed the **public-facing** brand from Dailytechwire/DTW to Opentechwire/OTW, but it explicitly does **NOT** rename the internal join-key slug `dtw` used across this integration contract:

    - Payload `Tenants.slug` = `'dtw'` (Central/apcg-cms)
    - content-engine's `PublicationId` registry key = `'dtw'`
    - the Engine→Payload intake contract's `publicationId: 'dtw'` field value
    - env-var-name suffixes derived from the slug via `.toUpperCase()` (e.g. `FB_PAGE_ID_DTW`, `LI_ORG_URN_DTW`)
    - the `hero-images/dtw/...` Supabase Storage path prefix for every published article's hero image

    This is a **permanent** decision (D11), not a temporary compatibility shim — `dtw` stays `dtw` forever, even though every reader-facing mention of the brand becomes "Opentechwire"/"OTW". See the ledger's §5.2 (frozen identifiers) for the complete list. Do not attempt to rename this slug to `otw` in any future integration work.
    ```
    Không đụng dòng 76 (`dtw-engine` repo mention) hay dòng 136 (copy affiliate disclosure "DTW may earn a commission..." — thuộc Phase 4).

### Nhóm 5 — `process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md`

14. **Dòng 26** — đổi:
    ```text
    Cũ: **Status**: ⏳ PLANNED
    Mới: **Status**: 🚧 BLOCKED — superseded by the Opentechwire rebrand ledger (see banner below); do not execute until brand-casing and canonical-host values are reconciled
    ```

15. **Chèn banner SUPERSEDED** ngay sau dòng 26 (dòng Status vừa sửa ở bước 14), trước dòng trống + `---` hiện có:
    ```text
    > **SUPERSEDED (Phase 0 of the Opentechwire rebrand, 2026-09-09).** This plan's Decisions Log locks brand casing to `DailyTechWire` (items 1 and 7 below) and its production-origin decision (item 3) records the pre-rebrand apex domain. Both are superseded by `process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md` (ledger D1/D2/D5/D8): the publication is now **Opentechwire** (sentence case prose) / **opentechwire** (wordmark lockup only) / **OTW** (monogram), and the canonical production host is **`https://www.opentechwire.com`** (www). **Do not execute this plan as written.** Any future execution of its SEO/metadata work (RFCs 001-009) must first reconcile every brand-casing and canonical-host literal against the rebrand ledger, not the values recorded in this file's Decisions Log or RFC bodies.
    ```

16. **Chèn ghi chú nội tuyến sau item 1 của Decisions Log** (item 1 kết thúc ở dòng "founded 2023 — no invented history, no other publication names.", tức dòng 152 tại thời điểm PLAN — chèn ngay sau đó, trước item 2 "**OG image = real hero...**"):
    ```text
    *[SUPERSEDED 2026-09-09 — see the banner at the top of this file. Brand casing is now `Opentechwire`/`opentechwire`/`OTW`, not `DailyTechWire`. This item's original text above is preserved unmodified for history; do not implement it as written.]*
    ```

17. **Chèn ghi chú nội tuyến sau item 7 của Decisions Log** (item 7 kết thúc ở dòng `` `manifest.ts:13-15` `"Dailytechwire"`. `` tức dòng 361 tại thời điểm PLAN — chèn ngay sau đó, trước item 8 "**hreflang intentionally not implemented...**"):
    ```text
    *[SUPERSEDED 2026-09-09 — see the banner at the top of this file. This item's original text above is preserved unmodified for history; do not implement it as written.]*
    ```
    Không xoá, không sửa bất kỳ chữ nào khác trong toàn bộ 1158 dòng của file này — chỉ 1 dòng Status đổi giá trị + 3 khối text được CHÈN THÊM.

### Nhóm 6 — `apcg-cms` (sibling repo)

18. **File**: `/home/hieunc/Code/apcg-cms/process/general-plans/active/brief-content-type_PLAN_20-08-26.md`, dòng 115 (bên trong fenced code block, giữa 2 dòng ```` ``` ````):
    ```text
    Cũ: tenant: dtw · name: "DTW Briefing Desk" · role: "Dailytechwire Newsroom" · city: "Singapore"
    Mới: tenant: dtw · name: "DTW Briefing Desk" · role: "Opentechwire Newsroom" · city: "Singapore"
    ```
    CHỈ đổi giá trị `role`. `tenant: dtw` (D11, đóng băng) và `name: "DTW Briefing Desk"` (byline — thuộc Phase 5, phải đồng bộ với `content-engine`/DB, không đổi lẻ ở đây) giữ nguyên y hệt.

### Nhóm 7 — `apps/web/src/components/footer.tsx`

19. **Dòng 234** — đổi:
    ```text
    Cũ:              © 2026 Dailytechwire · Singapore · Member, Trust Project
    Mới:             © 2026 Dailytechwire · Singapore
    ```
    (Giữ nguyên indentation JSX gốc — dòng này nằm trong `<div className="mono text-mute" style={{ fontSize: 11 }}>` ở dòng 233, đóng ở dòng 235.) Brand name "Dailytechwire" GIỮ NGUYÊN — đổi brand ở đây là việc của Phase 4.

20. **Chạy typecheck** — từ root: `pnpm typecheck` (chạy `turbo typecheck`, gọi `tsc --noEmit` cho `apps/web`). Xác nhận exit code `0` và không có lỗi type mới liên quan tới `footer.tsx`.

### Nhóm 8 — Vệ sinh git ở root `dtw-web`

21. **`.gitignore`** — thêm vào cuối file (sau dòng 36 hiện có, `.codex/skills/*/screenshots/`):
    ```text
    # rebrand hygiene — research/export artifacts, not part of the tracked repo
    data-exports/
    dailytechwire.com-Coverage-*.zip
    news-p.v1.*.jpeg
    ```

22. **Xoá file `ds` (0 byte, đang bị track từ commit khởi tạo `f6b3076`, không nơi nào tham chiếu — đã grep xác nhận trong RESEARCH)**:
    ```bash
    git rm ds
    ```

23. **Xoá file JPEG rác ở root (chưa track, không nơi nào tham chiếu trong code — đã grep xác nhận)**:
    ```bash
    rm news-p.v1.20260709.b6ffd05bc4c3436d9080287e7c252869_P1.jpeg
    ```
    Lưu ý: đây là file **untracked**, `rm` không thể hoàn tác qua git. Đã xác nhận không có consumer nào (grep toàn repo không ra kết quả) nên rủi ro thực tế bằng không.

24. **KHÔNG xoá** `data-exports/` (nội dung) hay `dailytechwire.com-Coverage-2026-08-06.zip` — cả hai chỉ được gitignore ở bước 21, giữ nguyên trên đĩa làm bằng chứng cho D13 audit (Phase 5) và GSC coverage (Phase 1/7).

### Nhóm 9 — Phần còn lại của §3.9 process-docs (BỔ SUNG 09-09-26 sau soát nhất quán 9 plan)

> **Vì sao thêm vào Phase 0 chứ không phải phase khác**: một lượt soát chéo 8 phase plan phát hiện các file dưới đây **không được phase nào nhận** — bản Phase 0 gốc đẩy chúng sang "Phase 4/Phase 6", nhưng cả hai phase đó đều không liệt kê chúng trong checklist. Chúng cùng một lớp rủi ro với 4 file context đã có ở Nhóm 1: **đây là những gì agent đọc TRƯỚC KHI code**, nên để cũ = rebrand bị revert. Chủ sở hữu chính thức nay là Phase 0 (xem umbrella §6b.1).
>
> Quy tắc chung cho cả Nhóm 9: **chỉ sửa phần chữ mô tả brand hiện tại**; mọi câu mô tả LỊCH SỬ giữ nguyên tên cũ kèm nhãn lịch sử; **không** đụng bất kỳ định danh nào ở umbrella §5.2 (`dtw-web`/`dtw-engine`/`dtw-workers`/`@dtw/*` là tên repo/package — **không đổi**). Khớp theo nội dung text, không theo số dòng.

26. **`process/context/auth/all-auth.md`** — dòng 52 (**HIGH**, subject email reader thật nhìn thấy): `Subject: \`Sign in to DailyTechWire\`` → `Subject: \`Sign in to Opentechwire\``, kèm ghi chú `(chuỗi này ship ở Phase 6 cùng lần flip RESEND_FROM_DOMAIN — code hiện tại vẫn là "DailyTechWire")`. Dòng 1 (tiêu đề file) đổi tên brand nếu có. Dòng 67 `dtw-nudge-dismissed` → giữ nguyên giá trị **nhưng thêm ghi chú** `(đổi thành otw-nudge-dismissed ở Phase 6/D14)`.

27. **`process/context/uxui/all-uxui.md`** — 5 dòng còn lại ngoài 152-154 đã sửa ở bước 9:
    - dòng 1 (tiêu đề) → tên brand mới;
    - dòng 18 (câu "brand evolution") → viết lại thành lịch sử có mốc: giữ nguyên mô tả wordmark/monogram/tagline **cũ** nhưng gắn nhãn "(pre-rebrand, tới 2026-09)" và thêm một mệnh đề mô tả trạng thái mới theo D1/D2/D8;
    - dòng 74 comment `/* DTW coral, softened 2026-06-14 (was #E04E1F) */` → đổi `DTW` thành `Opentechwire` (**giá trị hex không đổi**, D10) và ghi chú rằng `apps/web/src/app/globals.css:20` mang cùng comment và được sửa ở Phase 4;
    - dòng 144 `localStorage["dtw-theme"]` và dòng 264 `localStorage["dtw-lang"]` → giữ giá trị, thêm ghi chú `(→ otw-* ở Phase 6/D14)`.

28. **`process/context/infra/all-infra.md`** — dòng 1 (tiêu đề) và dòng 255 (`localStorage["dtw-cookies"]`, thêm ghi chú D14/Phase 6 y như bước 27). **Không** đụng dòng 37-39 (bảng Hosting Topology, tên repo).

29. **`process/context/integrations/all-integrations.md`** — dòng 1 (tiêu đề); dòng 76 (`dtw-engine`) **giữ nguyên** (tên repo, D7) nhưng thêm ghi chú một lần rằng repo Engine thật là `content-engine`; dòng 136 disclosure affiliate `"DTW may earn a commission on purchases made via this link."` → `"Opentechwire may earn a commission…"` (theo umbrella §5.1.1: đây là một câu hoàn chỉnh → dùng tên đầy đủ, **không** dùng `OTW`), kèm ghi chú rằng bản render thật ở `article-content.tsx:285-287` và `best-of-reviews.tsx:70` được sửa ở Phase 4 và phải khớp chính xác chuỗi này.

30. **`process/context/database/all-database.md`** (dòng 1, 17, 32) · **`process/context/tests/all-tests.md`** (dòng 1, 35, 88 — lưu ý `@dtw/auth` ở đây là **package không tồn tại**, lỗi doc có sẵn; sửa thành `@dtw/db` và giữ nguyên scope `@dtw/` theo D6) · **`process/context/planning/all-planning.md`** (dòng 3) — chỉ đổi tên brand trong tiêu đề/văn xuôi, giữ mọi tên repo/package.

31. **Cả 9 file `process/features/*/_GUIDE.md`** — đổi tên brand trong văn xuôi, ưu tiên theo mức rủi ro:
    - `articles/_GUIDE.md:43,54` (**HIGH** — copy banner sign-in + disclosure sponsored; phải khớp **chính xác** chuỗi mà Phase 4 sẽ ship ở `header.tsx:633-635` và `article-body.tsx:139-141`) và `:3,38,44` (`dtw-read-count`, `dtw-nudge-dismissed` → giữ giá trị + ghi chú D14/Phase 6);
    - `homepage/_GUIDE.md:14,24,26` (**HIGH** — wordmark, `DTW Studio Presents`, `DTW Daily Brief` → `OTW Studio Presents`, `OTW Daily Brief` theo §5.1.1; dòng 14 còn liệt kê pillar "Asia" đã bị bỏ — sửa luôn cho khớp invariant #14);
    - `newsletters/_GUIDE.md:42` (`"Read Dailytechwire the way you read."` → `Opentechwire`, khớp chuỗi Phase 4 sẽ ship) và `:53` (`dtw-bounced` — **token trạng thái nội bộ, ĐÓNG BĂNG**, chỉ thêm ghi chú);
    - `about-trust/_GUIDE.md:3,101`; `account/_GUIDE.md`; `cms/_GUIDE.md`; `dashboards/_GUIDE.md`; `engine-integration/_GUIDE.md`; `search/_GUIDE.md` — các marker `<!-- Part of dtw-web -->` **giữ nguyên** (tên repo, D7), chỉ đổi các chỗ nhắc brand trong văn xuôi.

32. **Banner brand cho các plan/reference còn mang brand hoặc domain đã chết** — cùng cơ chế với banner SUPERSEDED ở bước 15, nhưng ngắn hơn (một dòng `> **[REBRAND 2026-09] …**` chèn ngay dưới dòng `Status`, **chỉ chèn, không xoá nội dung gốc**):
    - `process/features/account/active/reader-auth-account-simple_PLAN_03-07-26.md` (**HIGH** — template `FROM` email + `dtw-read-count` + copy `DTW Awards`, chưa execute): banner phải nói rõ "mọi chuỗi brand/domain trong plan này đã lỗi thời; đối chiếu ledger D1-D15 trước khi execute".
    - `process/general-plans/active/brief-display_PLAN_20-08-26.md` (**HIGH**): banner nói rõ **`dtw` trong `BRIEF_PUBLISH_PUBS` là slug legacy đóng băng vĩnh viễn (D11) — KHÔNG đổi**, chỉ tên hiển thị đổi.
    - `process/features/about-trust/active/tip-line-removal-newsroom-route_PLAN_16-07-26.md`: banner + cảnh báo rằng lệnh grep verification ở dòng 304 chứa `tips@dailytechwire` sẽ trả **false green** sau rebrand.
    - `process/features/dashboards/active/ai-leaderboard-llmstats_PLAN_30-07-26.md` và `dashboards-automation_PLAN_14-07-26.md`: banner + chốt một lần rằng tên biến `DTW_DASHBOARD_REFRESH_TOKEN` **giữ nguyên** (umbrella §6b.2), để hai plan không lệch nhau.
    - `process/general-plans/active/human-ops-launch_PLAN_30-05-26.md`: banner ngắn; dòng 6/67 là **tên có ghi ngày — để nguyên**.
    - `process/features/account/backlog/phase-01-auth-foundation_PLAN_03-07-26.md` (33 hit, template email dán-là-chạy) và `phase-05-newsletters-double-optin_PLAN_03-07-26.md`: cắm flag ở **đầu file** — đây là mìn hẹn giờ lúc plan được hồi sinh.
    - `process/features/account/references/brief-asia-port-map_REFERENCE_03-07-26.md:187,189,208`: banner ngắn (là doc nền của plan reader-auth đang ACTIVE).

33. **`design/README.md`** — (a) sửa 5 đường dẫn hỏng ở dòng 9, 11, 23, 24, 25 (`dtw/chats/`, `dtw/project/` → `design/chats/`, `design/project/`); (b) chèn ở đầu file một banner có ghi ngày:
    ```text
    > **PRE-REBRAND BUNDLE (đóng băng 2026-09-09).** Toàn bộ bundle này — gồm `chats/*.md` — mô tả mark cũ `DTW`/`dailytechwire` và tagline "Tech Intelligence, Wired Daily". Ấn phẩm đã đổi tên thành **Opentechwire / OTW** (ledger tại `process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md`). Dùng bundle này làm tham chiếu **bố cục và ý đồ thị giác**, KHÔNG dùng nó làm nguồn cho tên brand, wordmark, monogram, hay tagline. Không sửa nội dung bundle — nó là hồ sơ lịch sử.
    ```
    Không sửa bất kỳ file nào **bên trong** `design/project/` hay `design/chats/` (đóng băng, umbrella §6b.2).

34. **Verify Nhóm 9**:
    ```bash
    command grep -rn "DailyTechWire\|Dailytechwire" process/context/ process/features/*/_GUIDE.md design/README.md
    # kỳ vọng: mọi dòng còn lại đều nằm trong một câu có nhãn lịch sử ("was", "pre-rebrand", "Renamed from", "Formerly")
    command grep -rn "OpenTechWire" process/context/ process/features/ design/README.md
    # kỳ vọng: 0 dòng ngoài các câu CẤM trong chính ledger/plan rebrand
    command grep -rln "REBRAND 2026-09" process/features/account/active process/features/account/backlog process/features/about-trust/active process/features/dashboards/active process/general-plans/active
    # kỳ vọng: đủ 7 plan + 1 reference đã liệt ở bước 32 (cộng per-page-seo-metadata đã có banner riêng ở bước 15)
    ```

### Nhóm 10 — Xác minh tổng

35. Chạy lệnh grep chuẩn của chương trình (umbrella §6, dùng `command grep` để bypass ugrep shim) trên `dtw-web`, TRƯỚC và SAU khi hoàn tất 34 bước trên, dán cả hai kết quả vào report:
    ```bash
    command grep -rniE 'dailytechwire|daily ?tech ?wire|\bdtw\b|@dtw/|Tech Intelligence, Wired Daily' . \
      --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=.turbo \
      --exclude-dir=dist --exclude='*.tsbuildinfo' --exclude=pnpm-lock.yaml --exclude-dir=data-exports
    ```
    Số hit KHÔNG cần giảm về 0 (đó là việc của Phase 4/5/6) — chỉ cần xác nhận `git diff --stat` (chạy riêng ở `dtw-web` và `apcg-cms`) khớp đúng danh sách 8 file ở "Touchpoints", không có file nào ngoài danh sách bị chạm.

---

## Risks and Mitigations

| Rủi ro | Mitigation |
|---|---|
| Một invariant/section mới vô tình mô tả sai là code ĐÃ đổi brand (trong khi thực tế UI vẫn còn `DTW`) | Mọi đoạn text mới đều có câu tường minh "as of this Phase 0 note, code/asset still says the old name" — xem bước 5, 9 |
| `per-page-seo-metadata_PLAN` đã bị agent khác sửa/archive giữa lúc PLAN này được viết và lúc EXECUTE chạy | Bước 14-17 yêu cầu khớp theo nội dung text, không chỉ số dòng; nếu file đã archive hoặc không còn ở `active/`, dừng lại và báo cho user thay vì tạo lại |
| Sửa nhầm `name: "DTW Briefing Desk"` hoặc `tenant: dtw` ở `apcg-cms` khi định sửa `role` | Bước 18 nêu rõ CHỈ 1 trong 3 giá trị được đổi; Verification Evidence có lệnh grep xác nhận 2 giá trị kia còn nguyên |
| Xoá nhầm nội dung lịch sử trong `per-page-seo-metadata_PLAN` khi chèn banner/ghi chú | Chỉ CHÈN, không xoá; verify bằng `wc -l` tăng, không giảm (Acceptance Criteria #7) |
| `git rm ds` hoặc `rm` file JPEG ảnh hưởng tới một consumer chưa được grep bắt được (ví dụ tham chiếu động qua biến) | Đã grep nhiều pattern (`"ds"`, `'ds'`, `/ds\b`, `^ds$`) và `news-p.v1` trên toàn bộ `*.json/*.ts/*.tsx/*.mjs/*.yml/*.yaml/*.md` — 0 kết quả; rủi ro còn lại là rất thấp |

---

## Integration Notes

- Không có thay đổi dependency, package, hay schema nào trong phase này.
- `apcg-cms` là repo ngoài `dtw-web` — EXECUTE cần `cd`/thao tác tuyệt đối vào `/home/hieunc/Code/apcg-cms` cho bước 18, và git diff/status của repo đó phải kiểm tra riêng, không lẫn với `dtw-web`.
- `pnpm typecheck` ở bước 20 chạy qua Turborepo cache — nếu kết quả nghi ngờ bị cache cũ, chạy lại với `pnpm typecheck --force` hoặc xoá `.turbo/` trước khi tin kết quả.

---

## Touchpoints

| Repo | File | Loại thay đổi |
|---|---|---|
| `dtw-web` | `process/context/all-context.md` | Text — 4 invariant + 1 section mới + 1 dòng ngày + 2 dòng brand |
| `dtw-web` | `process/context/uxui/all-uxui.md` | Text — 3 dòng bảng (152-154) |
| `dtw-web` | `process/context/infra/all-infra.md` | Text — 1 section mới + 2 dòng |
| `dtw-web` | `process/context/integrations/all-integrations.md` | Text — 1 section mới |
| `dtw-web` | `process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md` | Text — 1 dòng Status + 3 khối chèn |
| `dtw-web` | `apps/web/src/components/footer.tsx` | Code — xoá 1 cụm text trong JSX (dòng 234) |
| `dtw-web` | `.gitignore` | Text — thêm 3 dòng pattern |
| `dtw-web` | `ds` (root) | Xoá file tracked |
| `dtw-web` | `news-p.v1.20260709.b6ffd05bc4c3436d9080287e7c252869_P1.jpeg` (root) | Xoá file untracked |
| `apcg-cms` | `process/general-plans/active/brief-content-type_PLAN_20-08-26.md` | Text — 1 giá trị trong dòng 115 |
| `dtw-web` | `process/context/auth/all-auth.md` | Text — Nhóm 9 bước 26 (dòng 1, 52 **HIGH**, 67) |
| `dtw-web` | `process/context/uxui/all-uxui.md` | Text — Nhóm 9 bước 27 (dòng 1, 18, 74, 144, 264 — ngoài 152-154 ở Nhóm 2) |
| `dtw-web` | `process/context/infra/all-infra.md` | Text — Nhóm 9 bước 28 (dòng 1, 255 — ngoài 106/214 ở Nhóm 3) |
| `dtw-web` | `process/context/integrations/all-integrations.md` | Text — Nhóm 9 bước 29 (dòng 1, 76, 136 — ngoài section mới ở Nhóm 4) |
| `dtw-web` | `process/context/{database/all-database,tests/all-tests,planning/all-planning}.md` | Text — Nhóm 9 bước 30 (3 file) |
| `dtw-web` | `process/features/*/_GUIDE.md` (9 file) | Text — Nhóm 9 bước 31 |
| `dtw-web` | 6 plan `active/` + 2 plan `backlog/` + 1 `reference` (danh sách ở bước 32) | Text — CHỈ chèn banner, không xoá nội dung gốc |
| `dtw-web` | `design/README.md` | Text — Nhóm 9 bước 33 (5 đường dẫn hỏng + banner pre-rebrand) |

**Không chạm**: bất kỳ file `.ts`/`.tsx` nào khác ngoài `footer.tsx`; bất kỳ asset nhị phân nào; `data-exports/` (nội dung); `dailytechwire.com-Coverage-2026-08-06.zip` (nội dung); bất kỳ file nào trong danh sách "File CẤM ĐỘNG" §5.3 hay identifier "ĐÓNG BĂNG" §5.2 của umbrella plan.

---

## Public Contracts

Phase này KHÔNG đụng bất kỳ public contract runtime nào — không route, không API, không schema, không env var giá trị thật nào đổi. Thay đổi duy nhất người đọc THẬT nhìn thấy: cụm "· Member, Trust Project" biến mất khỏi footer trên MỌI trang reader (site-wide, vì `Footer` render trong layout chung) — đây là một thay đổi hiển thị nhỏ, không phải hợp đồng API/prop.

Các "hợp đồng" duy nhất bị chạm là **giữa các tài liệu quy trình với chính chúng**: `per-page-seo-metadata_PLAN_16-07-26.md` không còn được phép coi là nguồn sự thật cho brand casing/canonical host — vai trò đó chuyển hẳn sang `process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md`.

---

## Blast Radius

| File | Rủi ro nếu sai | Vì sao thấp |
|---|---|---|
| `process/context/all-context.md` | Agent tương lai đọc sai ledger, revert rebrand | Text-only, review bằng mắt dễ, revert bằng `git checkout` |
| `process/context/uxui/all-uxui.md` | Như trên | Như trên |
| `process/context/infra/all-infra.md` | Agent tương lai vô tình thêm redirect/CoA nếu section viết mơ hồ | Đã viết tường minh "do not add a redirect rule" |
| `process/context/integrations/all-integrations.md` | Agent tương lai đổi nhầm slug `dtw` | Section mới nêu rõ danh sách frozen + lý do |
| `per-page-seo-metadata_PLAN_16-07-26.md` | Nếu banner bị bỏ sót, một EXECUTE tương lai implement đúng y RFC 001-009 với brand cũ | Banner đặt ngay đầu file, khó bỏ sót; Status đổi khỏi PLANNED |
| `apcg-cms/.../brief-content-type_PLAN_20-08-26.md` | Sai giá trị `role` không ảnh hưởng runtime (file chưa migrate vào DB) | Xác nhận "CODE COMPLETE, chưa migrate" theo tài liệu tham chiếu — rủi ro production bằng không |
| `apps/web/src/components/footer.tsx` | Lỗi type/JSX làm site build fail | 1 dòng string literal, `pnpm typecheck` bắt được ngay nếu sai |
| `.gitignore` | Pattern sai làm ẩn nhầm file cần track | Đã test bằng `git check-ignore -v` trước khi coi là xong |
| `ds`, JPEG root | Mất file nếu có consumer ẩn | Đã grep nhiều pattern, 0 kết quả |

Không có mục nào ở mức **high** theo thang của tài liệu tham chiếu — toàn bộ phase này là low/medium vì không chạm runtime thật, không chạm DB thật, không chạm domain/OAuth thật.

---

## Verification Evidence

Chạy và dán kết quả THẬT (không suy luận) vào report `process/features/rebrand/reports/phase-0-lock-decisions_REPORT_<dd-mm-yy>.md`:

1. **Trước khi sửa** — baseline:
   ```bash
   cd /home/hieunc/Code/dtw-web
   git status --porcelain
   command grep -c "OpenTechWire" process/context/all-context.md process/context/uxui/all-uxui.md process/context/infra/all-infra.md process/context/integrations/all-integrations.md
   wc -l process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md
   ```

2. **Sau khi sửa 4 file context**:
   ```bash
   git diff process/context/all-context.md process/context/uxui/all-uxui.md process/context/infra/all-infra.md process/context/integrations/all-integrations.md
   command grep -c "OpenTechWire" process/context/all-context.md process/context/uxui/all-uxui.md process/context/infra/all-infra.md process/context/integrations/all-integrations.md   # phải là 0 cho mọi file
   # Kiểm tra D4 — đây là một bước ĐỌC BẰNG MẮT có chủ đích, KHÔNG phải một assertion tự động.
   # Lệnh chỉ trích ra các dòng cần đọc; người thực thi phải tự xác nhận từng dòng là câu CẤM
   # ("no redirect", "no Change of Address", "do not add …"), không phải câu hướng dẫn cấu hình.
   command grep -n -i "redirect\|change of address" process/context/all-context.md process/context/infra/all-infra.md
   # Assertion tự động đi kèm (cái này thì máy kiểm được): không có dòng nào vừa nhắc redirect/CoA
   # vừa mang giọng chỉ dẫn thực hiện.
   command grep -n -iE "(add|set up|configure|submit|file|thêm|cấu hình|nộp)[^.]{0,60}(redirect|change of address)" \
     process/context/all-context.md process/context/infra/all-infra.md
   # kỳ vọng: 0 dòng
   ```

3. **Sau khi sửa file SEO-metadata**:
   ```bash
   wc -l process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md   # phải >= số dòng baseline
   command grep -n 'Status' process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md | head -1
   command grep -n 'SUPERSEDED' process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md
   command grep -n 'Brand casing = `DailyTechWire`' process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md   # phải vẫn khớp — văn bản gốc không bị xoá
   ```

4. **Sau khi sửa `apcg-cms`**:
   ```bash
   cd /home/hieunc/Code/apcg-cms
   git diff process/general-plans/active/brief-content-type_PLAN_20-08-26.md
   command grep -n 'tenant: dtw' process/general-plans/active/brief-content-type_PLAN_20-08-26.md
   ```

5. **Sau khi sửa footer + typecheck**:
   ```bash
   cd /home/hieunc/Code/dtw-web
   git diff apps/web/src/components/footer.tsx
   command grep -n "Trust Project" apps/web/src/components/footer.tsx   # phải không có kết quả
   pnpm typecheck
   ```

6. **Sau khi dọn git**:
   ```bash
   git status --porcelain
   git check-ignore -v data-exports/ "dailytechwire.com-Coverage-2026-08-06.zip"
   ls -la data-exports/articles_images.csv "dailytechwire.com-Coverage-2026-08-06.zip"   # xác nhận vẫn tồn tại
   ```

7. **Xác minh tổng cuối cùng**:
   ```bash
   git diff --stat
   cd /home/hieunc/Code/apcg-cms && git diff --stat
   ```
   Danh sách file trong cả hai output phải khớp CHÍNH XÁC với bảng "Touchpoints" ở trên.

**Không có asset nhị phân nào cần soát bằng mắt trong phase này** — cảnh báo "grep sạch không chứng minh rename xong" của umbrella §6 áp dụng từ Phase 3 trở đi, không áp dụng ở đây.

---

## Resume and Execution Handoff

- **Trạng thái hiện tại**: plan này chưa được EXECUTE. Không file nào đã bị sửa.
- Trước khi EXECUTE, đọc lại `process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md` để có đầy đủ ngữ cảnh ledger D1-D15 — không suy diễn lại D1-D15 từ plan này một mình.
- Nếu thời gian đã trôi kể từ 09-09-26, EXECUTE PHẢI mở lại từng file mục tiêu và xác nhận số dòng/nội dung còn khớp (xem "Assumptions and Constraints") trước khi áp dụng bất kỳ Edit nào theo số dòng ghi trong checklist.
- Sau khi Phase 0 được verify và user xác nhận: theo umbrella §Bảng dependency, **Phase 1** (việc ngoài repo — xác nhận quyền sở hữu domain, trademark clearance, Resend DKIM/SPF/DMARC, thêm OAuth redirect URI mới) có thể đã chạy song song từ trước và tiếp tục độc lập; **Phase 2** (canonical host trong code) là phase kế tiếp hợp lý — plan đã có sẵn tại `process/features/rebrand/active/phase-2-generators-and-config_PLAN_08-09-26.md`, không cần tạo mới.
- **Không dùng plan này để EXECUTE Phase 1-7** — file này chỉ định phạm vi cho đúng Phase 0.
- Validator cho chính plan này:
  ```bash
  node .claude/skills/vc-generate-plan/scripts/validate-plan-artifact.mjs process/features/rebrand/active/phase-0-lock-decisions_PLAN_09-09-26.md
  ```

---

## Cursor + RIPER-5 Guidance

- **Cursor Plan mode**: import "Implementation Checklist" (25 bước) làm TODO list; chạy tuần tự theo 9 nhóm; sau mỗi nhóm, chạy đúng lệnh "Verify" tương ứng ở "Verification Evidence" trước khi sang nhóm kế.
- **RIPER-5**: plan này là kết quả của PLAN mode. Review kỹ toàn bộ checklist + ledger tham chiếu trước khi tiếp tục.

Nói **"ENTER EXECUTE MODE"** khi sẵn sàng triển khai đúng plan này (Phase 0 — 25 bước ở trên). Đây là điểm dừng an toàn bắt buộc: EXECUTE MODE sẽ tuân theo plan này với độ trung thực 100%, không tự ý mở rộng sang rename brand code (Phase 3/4) hay bất kỳ việc nào nằm trong bảng "Phạm vi này KHÔNG bao gồm".
