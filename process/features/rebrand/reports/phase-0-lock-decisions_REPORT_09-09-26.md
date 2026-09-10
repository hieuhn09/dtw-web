# Phase 0 — Chốt và ghi lại quyết định — Báo cáo EXECUTE

**Ngày EXECUTE**: 09-09-26
**Plan đã thi hành**: `process/features/rebrand/active/phase-0-lock-decisions_PLAN_09-09-26.md`
**Feature**: `rebrand`

## Trạng thái tổng: 🧪 TESTING (DONE_WITH_CONCERNS)

Toàn bộ 9 nhóm trong checklist đã được thực thi đúng phạm vi, ngoại trừ **Nhóm 3 (apcg-cms) = BLOCKED có chủ đích** theo đúng rào cản phạm vi phiên này (repo `apcg-cms` nằm ngoài working directory được phép). Không có deviation nào ngoài những gì được liệt kê ở mục "Plan sai/lệch so với thực tế repo" bên dưới — mọi lệch đều được xử lý theo đúng "Phase Completion Rules #4" của plan (khớp theo nội dung, dừng lại và ghi chú khi lệch, không tự đoán).

Theo "Phase Completion Rules #5" của chính plan này: trạng thái cao nhất được phép khi chưa có user confirmation là `🧪 TESTING`, không phải `✅ VERIFIED`. Báo cáo này cung cấp đầy đủ bằng chứng để user xem và xác nhận.

---

## Bảng từng nhóm

| Nhóm | Trạng thái | File đã sửa | Bằng chứng verify |
|---|---|---|---|
| 1 — Khoá context `all-context.md`/`uxui`/`infra`/`integrations` (bước 1-13) | ✅ DONE | `process/context/all-context.md`, `process/context/uxui/all-uxui.md`, `process/context/infra/all-infra.md`, `process/context/integrations/all-integrations.md` | Xem mục "Verification Evidence" bên dưới — grep count, nội dung từng invariant/section đã đọc lại nguyên văn |
| 2 — Vô hiệu bẫy revert `per-page-seo-metadata_PLAN` (bước 14-17) | ✅ DONE | `process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md` | `wc -l` 1158→1164 (tăng, không giảm); `Status` = 🚧 BLOCKED; 3 banner/ghi chú SUPERSEDED xuất hiện đúng vị trí; `Brand casing = \`DailyTechWire\`` (văn bản gốc) vẫn khớp y nguyên ở dòng 149 |
| 3 — `apcg-cms` (bước 18) | 🚧 BLOCKED (chủ đích, đúng rào phạm vi) | Không file nào — chỉ ĐỌC | Xem mục riêng "Nhóm 3 (apcg-cms)" bên dưới, có đủ nội dung để user tự áp trong 30 giây |
| 4 — Footer credential bịa (bước 19-20) | ✅ DONE | `apps/web/src/components/footer.tsx` | `grep "Trust Project"` → 0 kết quả; `pnpm typecheck` exit 0 (3/3 task successful) |
| 5 — Vệ sinh git root (bước 21-24) | ✅ DONE | `.gitignore`; `ds` (git rm); JPEG root (MOVE, không xoá) | `git status --porcelain` không còn liệt `ds`/JPEG/`data-exports/`/zip; `git check-ignore -v` khớp cả 2 pattern; `data-exports/articles_images.csv` và zip Coverage vẫn tồn tại nguyên vẹn trên đĩa |
| 9 — Phần còn lại §3.9 process-docs (bước 26-34) | ✅ DONE (với các điểm không cần sửa, ghi rõ bên dưới) | `auth/all-auth.md`, `uxui/all-uxui.md` (5 dòng còn lại), `infra/all-infra.md` (dòng 255), `integrations/all-integrations.md` (dòng 76, 136), `tests/all-tests.md` (dòng 35); 5/9 file `_GUIDE.md` (`articles`, `homepage`, `newsletters`, `about-trust`, `dashboards`); 9 file plan/reference nhận banner `REBRAND 2026-09`; `design/README.md` | Grep tổng bước 34 chạy sạch — xem bên dưới |
| 10 — Xác minh tổng (bước 35) | ✅ DONE | — | Grep tổng TRƯỚC = 2351 dòng, SAU = 2367 dòng (tăng 16, đúng như dự kiến vì Phase 0 chỉ thêm ghi chú giải thích, không giảm hit); `git diff --stat` khớp Touchpoints (xem bên dưới) |

`database/all-database.md` và `planning/all-planning.md` (2 trong 3 file của bước 30) **không có thay đổi nào** — xem "Plan sai/lệch" bên dưới, đây không phải bỏ sót.

---

## Kết quả `git status --porcelain` và `git diff --stat` thật (repo `dtw-web`)

```
$ git status --porcelain
 M .gitignore
 M apps/web/src/components/footer.tsx
 M design/README.md
D  ds
 M process/context/all-context.md
 M process/context/auth/all-auth.md
 M process/context/infra/all-infra.md
 M process/context/integrations/all-integrations.md
 M process/context/tests/all-tests.md
 M process/context/uxui/all-uxui.md
 M process/features/about-trust/_GUIDE.md
 M process/features/about-trust/active/tip-line-removal-newsroom-route_PLAN_16-07-26.md
 M process/features/account/active/reader-auth-account-simple_PLAN_03-07-26.md
 M process/features/account/backlog/phase-01-auth-foundation_PLAN_03-07-26.md
 M process/features/account/backlog/phase-05-newsletters-double-optin_PLAN_03-07-26.md
 M process/features/account/references/brief-asia-port-map_REFERENCE_03-07-26.md
 M process/features/articles/_GUIDE.md
 M process/features/dashboards/_GUIDE.md
 M process/features/dashboards/active/ai-leaderboard-llmstats_PLAN_30-07-26.md
 M process/features/dashboards/active/dashboards-automation_PLAN_14-07-26.md
 M process/features/homepage/_GUIDE.md
 M process/features/newsletters/_GUIDE.md
 M process/general-plans/active/brief-display_PLAN_20-08-26.md
 M process/general-plans/active/human-ops-launch_PLAN_30-05-26.md
 M process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md
?? process/features/homepage/references/wiredrop-completion_REFERENCE_07-07-26.md
?? process/features/homepage/references/wiredrop-nonfinance-examples_REFERENCE_07-07-26.md
?? process/features/homepage/references/wiredrop-pr-wires_REFERENCE_30-07-26.md
?? process/features/homepage/references/wiredrop-realtime-sources_REFERENCE_07-07-26.md
?? process/features/homepage/references/wiredrop-source-examples_REFERENCE_07-07-26.md
?? process/features/rebrand/
?? process/general-plans/references/brief-ranking-signal-research_REFERENCE_27-07-26.md
?? process/general-plans/references/engine-composed-brief-research_REFERENCE_24-07-26.md
?? process/general-plans/references/media-engine-image-data_REFERENCE_30-07-26.md
?? process/general-plans/references/rebrand-opentechwire_REFERENCE_08-09-26.md
```

```
$ git diff --stat
 .gitignore                                                                  |  5 +++++
 apps/web/src/components/footer.tsx                                         |  2 +-
 design/README.md                                                           | 12 ++++++-----
 ds                                                                          |  0
 process/context/all-context.md                                             | 23 ++++++++++++++++------
 process/context/auth/all-auth.md                                           |  4 ++--
 process/context/infra/all-infra.md                                         | 12 ++++++++---
 process/context/integrations/all-integrations.md                          | 18 ++++++++++++++++-
 process/context/tests/all-tests.md                                         |  2 +-
 process/context/uxui/all-uxui.md                                           | 14 ++++++-------
 process/features/about-trust/_GUIDE.md                                     |  2 +-
 .../about-trust/active/tip-line-removal-newsroom-route_PLAN_16-07-26.md    |  3 +++
 .../account/active/reader-auth-account-simple_PLAN_03-07-26.md            |  2 ++
 .../account/backlog/phase-01-auth-foundation_PLAN_03-07-26.md             |  2 ++
 .../backlog/phase-05-newsletters-double-optin_PLAN_03-07-26.md            |  2 ++
 .../references/brief-asia-port-map_REFERENCE_03-07-26.md                  |  2 ++
 process/features/articles/_GUIDE.md                                        |  8 ++++----
 process/features/dashboards/_GUIDE.md                                      |  2 +-
 .../dashboards/active/ai-leaderboard-llmstats_PLAN_30-07-26.md            |  2 ++
 .../dashboards/active/dashboards-automation_PLAN_14-07-26.md              |  2 ++
 process/features/homepage/_GUIDE.md                                        |  6 +++---
 process/features/newsletters/_GUIDE.md                                     |  4 ++--
 .../general-plans/active/brief-display_PLAN_20-08-26.md                   |  3 +++
 .../general-plans/active/human-ops-launch_PLAN_30-05-26.md                |  2 ++
 .../general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md           |  8 +++++++-
 25 files changed, 104 insertions(+), 38 deletions(-)
```

**Đối chiếu với bảng Touchpoints của plan**: **KHỚP**, không có file thừa, không có file thiếu, trong phạm vi repo `dtw-web` mà phiên này được phép ghi. Chi tiết đối chiếu:

- 4 file context Nhóm 1 ✓, `per-page-seo-metadata_PLAN` ✓, `footer.tsx` ✓ (đúng **một** file `.ts`/`.tsx` duy nhất bị chạm — không có file `.ts`/`.tsx` nào khác), `.gitignore` ✓, `ds` xoá (tracked) ✓.
- File JPEG root: **không xuất hiện trong `git diff --stat`** vì nó **chưa từng được git track** — đây là hành vi đúng, không phải thiếu sót (xem mục "File JPEG" bên dưới).
- `auth/all-auth.md`, phần còn lại của `uxui`/`infra`/`integrations`, `tests/all-tests.md` (Nhóm 9) ✓.
- 5/9 `_GUIDE.md` có thay đổi thật (`articles`, `homepage`, `newsletters`, `about-trust`, `dashboards`); 4/9 (`account`, `cms`, `engine-integration`, `search`) không có thay đổi — xem lý do ở mục "Plan sai/lệch".
- 9 file plan/reference nhận banner `REBRAND 2026-09` ✓ (đủ 6 active + 2 backlog + 1 reference).
- `design/README.md` ✓.
- `database/all-database.md`, `planning/all-planning.md`: **0 thay đổi** — xem "Plan sai/lệch".

Repo `apcg-cms`: `git status --porcelain` và `git diff --stat` đều **rỗng** — xác nhận đúng RÀO 1, không có ghi nào xảy ra ngoài phạm vi.

---

## Bằng chứng verify chi tiết theo "Verification Evidence" của plan

### 1. Baseline (trước khi sửa)
```
git status --porcelain  → chỉ có " M process/context/all-context.md" (pre-existing, xem ghi chú dưới) + các untracked pre-existing khác
command grep -c "OpenTechWire" (4 file)  → all-context.md:1, uxui:0, infra:0, integrations:0
wc -l per-page-seo-metadata_PLAN_16-07-26.md  → 1158
```

### 2. Sau khi sửa 4 file context
```
command grep -c "OpenTechWire" process/context/all-context.md process/context/uxui/all-uxui.md process/context/infra/all-infra.md process/context/integrations/all-integrations.md
→ all-context.md:2   uxui/all-uxui.md:1   infra/all-infra.md:0   integrations/all-integrations.md:0
```
(Giải thích 2 hit còn lại trong all-context.md và 1 hit trong uxui — xem "Plan sai/lệch #1" bên dưới; đây KHÔNG phải PascalCase gõ nhầm.)

```
command grep -n -i "redirect\|change of address" process/context/all-context.md process/context/infra/all-infra.md
→ 3 dòng trong all-context.md (dòng 56, 110, 148) + 1 dòng "rebrand/" feature-index row (dòng 295), 2 dòng trong infra/all-infra.md (dòng 56, 112)
→ đọc bằng mắt: tất cả đều là câu CẤM ("no redirect", "no Change of Address", "do not add", "no 301 and no Change of Address") — không có câu nào hướng dẫn cấu hình.

command grep -n -iE "(add|set up|configure|submit|file|thêm|cấu hình|nộp)[^.]{0,60}(redirect|change of address)" process/context/all-context.md process/context/infra/all-infra.md
→ 1 dòng: infra/all-infra.md:56 "...Do not add a redirect rule or file a Change of Address..."
→ kỳ vọng của plan là 0 dòng nhưng có 1 false positive — xem "Plan sai/lệch #2" bên dưới. Đọc bằng mắt xác nhận đây là câu CẤM ("Do not add..."), không phải hướng dẫn.
```

### 3. Sau khi sửa file SEO-metadata
```
wc -l → 1164 (≥ 1158, tăng đúng 6 dòng chèn)
Status dòng 26 → 🚧 BLOCKED — superseded by...
SUPERSEDED xuất hiện ở dòng 28, 156, 367
Brand casing = `DailyTechWire` (dòng 149) vẫn khớp y nguyên — văn bản gốc không bị xoá
```

### 4. `apcg-cms`
Không chạy — Nhóm 3 BLOCKED theo phạm vi. `git status`/`git diff` xác nhận sạch (xem trên).

### 5. Footer + typecheck
```
git diff apps/web/src/components/footer.tsx → xoá đúng " · Member, Trust Project", dòng còn lại "© 2026 Dailytechwire · Singapore"
grep "Trust Project" footer.tsx → không có kết quả
pnpm typecheck → 3 successful, 3 total (packages: @dtw/db cache hit, @dtw/ui cache hit, web cache miss chạy thật) — exit 0
```

### 6. Git hygiene
```
git status --porcelain → không còn ds/JPEG/data-exports/zip Coverage
git check-ignore -v data-exports/ "dailytechwire.com-Coverage-2026-08-06.zip"
→ .gitignore:38:data-exports/    data-exports/
→ .gitignore:39:dailytechwire.com-Coverage-*.zip    dailytechwire.com-Coverage-2026-08-06.zip
ls -la data-exports/articles_images.csv "dailytechwire.com-Coverage-2026-08-06.zip" → cả hai vẫn tồn tại (3.76MB csv, 1246 byte zip)
```

### 7. Xác minh tổng cuối cùng
`git diff --stat` (cả hai repo) — xem bảng ở trên, khớp Touchpoints.

### Verify Nhóm 9 (bước 34)
```
command grep -rn "DailyTechWire\|Dailytechwire" process/context/ process/features/*/_GUIDE.md design/README.md
→ 10 dòng, TẤT CẢ đều có nhãn lịch sử rõ ràng ("renamed from", "pre-rebrand, tới 2026-09", "before the DTW-era name shipped", "code still says") — đối chiếu từng dòng, không có dòng nào là mention brand hiện tại chưa gắn nhãn.

command grep -rn "OpenTechWire" process/context/ process/features/ design/README.md
→ các hit trong process/context/ (2) và process/features/*/_GUIDE.md (1) đều là mẫu "Never `OpenTechWire`"/"rejected... `OpenTechWire`" — cùng khuôn mẫu §5.1 của umbrella plan tự dùng (VD dòng 226: "Cấm tuyệt đối | `OpenTechWire`"); các hit còn lại nằm trong chính các file plan rebrand (phase-0, phase-4, umbrella) — đúng như kỳ vọng của Acceptance Criteria #13 ("0 dòng ngoài các câu CẤM trong chính tài liệu rebrand").

command grep -rln "REBRAND 2026-09" (7 path + references dir) → đủ 9 file (bảng liệt kê ở bước 32 + per-page-seo-metadata đã có banner riêng khác format ở bước 15)
```

### Grep tổng chương trình (umbrella §6) — TRƯỚC và SAU
Chạy qua `git stash`/`git stash pop` để tái tạo baseline sạch (không có tracked change nào bị mất — đã xác nhận `git status --porcelain` khớp lại y hệt sau `pop`):

```
TRƯỚC (baseline, trước Phase 0): 2351 dòng
SAU (sau 34 bước):                2367 dòng   (+16)
```
Tăng, không giảm — **đúng như dự kiến**: câu của plan "Số hit KHÔNG cần giảm về 0 (đó là việc của Phase 4/5/6)" — Phase 0 chỉ **thêm ghi chú giải thích** (vd. "→ otw-theme ở Phase 6/D14", "dtw stays dtw forever") mà bản thân các ghi chú đó lại chứa thêm mention `dtw`/`DTW` mới, nên tổng số hit tăng lên là hành vi đúng, không phải lỗi.

---

## Nhóm 3 (apcg-cms) — BLOCKED, nội dung để user tự áp trong 30 giây

**File**: `/home/hieunc/Code/apcg-cms/process/general-plans/active/brief-content-type_PLAN_20-08-26.md`
**Dòng**: 115 (đã đọc và xác nhận đúng — không lệch số dòng so với plan)

```
Chuỗi cũ (dòng 115):
tenant: dtw · name: "DTW Briefing Desk" · role: "Dailytechwire Newsroom" · city: "Singapore"

Chuỗi mới:
tenant: dtw · name: "DTW Briefing Desk" · role: "Opentechwire Newsroom" · city: "Singapore"
```

Chỉ đổi giá trị `role`. `tenant: dtw` (D11, đóng băng) và `name: "DTW Briefing Desk"` (byline, thuộc Phase 5, phải đồng bộ với `content-engine`/DB) **giữ nguyên y hệt** — đã xác nhận không lệch trong lần đọc.

**Lý do BLOCKED**: theo chỉ đạo của phiên này, thư mục `apcg-cms` không nằm trong working directory được phép ghi của phiên EXECUTE này (RÀO 1). Đã đọc file để xác nhận nội dung nhưng không ghi.

---

## File JPEG — xác nhận đã MOVE, không DELETE

**File gốc**: `/home/hieunc/Code/dtw-web/news-p.v1.20260709.b6ffd05bc4c3436d9080287e7c252869_P1.jpeg` (190,180 byte, untracked)
**Đường dẫn đích**: `/tmp/claude-1000/-home-hieunc-Code-dtw-web/0efe1a19-7f9f-4827-9eee-db1c4994cdf7/scratchpad/news-p.v1.20260709.b6ffd05bc4c3436d9080287e7c252869_P1.jpeg`

Đã xác nhận bằng `ls -la` ở cả 2 đầu: file biến mất khỏi repo root, xuất hiện nguyên vẹn (190,180 byte, cùng timestamp gốc) ở đường dẫn scratchpad. Đây là **MOVE**, không phải **DELETE** — khác với bước 23 của plan gốc (`rm`), theo đúng chỉ đạo RÀO 2 của phiên này. File không xuất hiện trong `git diff --stat`/`git status --porcelain` vì nó chưa bao giờ được git track — hành vi đúng.

`git rm ds` được thực hiện đúng như plan (bước 22) vì `ds` là file **tracked** (0 byte, từ commit `f6b3076`), có thể `git checkout` khôi phục lại bất cứ lúc nào nếu cần.

---

## Plan sai/lệch so với thực tế repo — ghi rõ, không tự ý im lặng sửa

1. **Acceptance Criteria #1 ("`grep -c OpenTechWire` trả về 0 dòng cho 4 file context") không đạt theo nghĩa đen — nhưng đây là hành vi ĐÚNG, không phải lỗi.**
   - `all-context.md` có 2 hit: (a) dòng 148 — chính invariant #15 mới mà bước 7 của plan **yêu cầu viết nguyên văn**, chứa cụm `**Never** \`OpenTechWire\` (PascalCase) anywhere` để CẤM tường minh casing đó; (b) dòng 295 — một dòng **đã tồn tại từ TRƯỚC phiên EXECUTE này** (uncommitted, thêm bởi phiên PLAN trước khi tạo feature folder `rebrand/`, xác nhận qua `git diff` cho thấy đây là thay đổi duy nhất pending trước khi tôi bắt đầu) ở "Feature Folder Index", cũng dùng mẫu "(never `OpenTechWire`)".
   - `uxui/all-uxui.md` có 1 hit ở dòng 152 (bảng Brand Identity, bước 9 của plan) — cụm `\`OpenTechWire\` (PascalCase) is rejected for the new name (D1)`.
   - Cả 3 hit đều là ví dụ **cấm tường minh**, cùng khuôn mẫu chính umbrella plan tự dùng ở §5.1 dòng 226 ("Cấm tuyệt đối | `OpenTechWire`"). Acceptance Criteria #13 (áp cho Nhóm 9) đã lường trước và cho phép ngoại lệ này ("0 dòng ngoài các câu CẤM trong chính tài liệu rebrand"), nhưng Acceptance Criteria #1 (áp cho Nhóm 1, viết TRƯỚC #13) không có cùng ngoại lệ bằng chữ. Tôi **không xoá/viết lại** các câu cấm này vì làm vậy sẽ vi phạm đúng nội dung bước 7/9 mà plan yêu cầu viết nguyên văn. Đây là một khoảng hở logic giữa Acceptance Criteria #1 và #13 của chính plan, không phải lỗi thực thi.

2. **Assertion tự động trong "Verification Evidence" mục 2 có 1 false positive không thể tránh, do chính câu chữ bắt buộc của plan.**
   - Lệnh `command grep -n -iE "(add|set up|...)[^.]{0,60}(redirect|change of address)"` kỳ vọng 0 dòng, nhưng khớp `infra/all-infra.md:56`: `"...Do not add a redirect rule or file a Change of Address..."`.
   - Câu này là **nguyên văn bắt buộc** của bước 10 trong plan (`"Do not add a redirect rule or file a Change of Address for the old domain at any point in this rebrand."`) — plan tự yêu cầu viết một câu CẤM mà regex tự động không phân biệt được phủ định "Do not" với một câu hướng dẫn thật. Đọc bằng mắt xác nhận đây là câu cấm, không phải hướng dẫn cấu hình — đúng tinh thần D4. Không sửa lại câu chữ vì đó là nội dung plan yêu cầu chính xác.

3. **Bước 27/28/29/30 (Nhóm 9) giả định dòng 1 (tiêu đề) của 6 file `process/context/*.md` chứa tên brand cần đổi — thực tế không đúng.**
   - Dòng 1 của `uxui/all-uxui.md`, `infra/all-infra.md`, `integrations/all-integrations.md`, `auth/all-auth.md`, `database/all-database.md`, `tests/all-tests.md` đều là dạng `# dtw-web - All <X>` — đây là **tên repo** (`dtw-web`), không phải tên brand publication. Theo D7 (umbrella plan), tên repo/thư mục local không đổi trong toàn chương trình rebrand. Tôi **không sửa** các dòng tiêu đề này ở bất kỳ file nào — không có brand casing nào cần sửa ở đó.

4. **Bước 30 — `database/all-database.md` (dòng 1, 17, 32) và `planning/all-planning.md` (dòng 3): không có nội dung brand nào để sửa.**
   - Đã grep toàn bộ 2 file này với pattern `dailytechwire|daily ?tech ?wire|\bdtw\b`: `database/all-database.md` chỉ khớp dòng 1 (tiêu đề, xem mục 3 trên), dòng 17 (`dtw-engine` — tên repo, D7, giữ nguyên), dòng 32 (`dtw-web`, `dtw-engine`, `dtw-workers` — toàn bộ tên repo/package, D6/D7, giữ nguyên). `planning/all-planning.md` dòng 3 chỉ có `dtw-web` (tên repo). **Không có edit nào được thực hiện trên 2 file này** — 0 thay đổi là kết quả đúng, không phải bỏ sót.
   - `tests/all-tests.md` dòng 88 (`@dtw/db` package name) đã đúng sẵn — không cần sửa; chỉ dòng 35 (`@dtw/auth` — package không tồn tại) được sửa thành `@dtw/db` theo đúng ghi chú của plan.

5. **Bước 31 — 4/9 file `_GUIDE.md` (`account`, `cms`, `engine-integration`, `search`) không có brand mention nào ngoài marker `<!-- Part of dtw-web -->`.**
   - Đã grep cả 4 file với pattern brand đầy đủ — chỉ khớp marker (tên repo, D7, giữ nguyên). Không sửa gì ở 4 file này — plan tự nói "chỉ đổi các chỗ nhắc brand trong văn xuôi", và văn xuôi ở đây không có mention brand nào.
   - `engine-integration/_GUIDE.md:17` có `dtw-engine` (tên repo trong ngoặc đơn) — cũng là D7, giữ nguyên, không thêm ghi chú bổ sung (khác với `integrations/all-integrations.md:76` nơi plan bước 29 yêu cầu tường minh thêm ghi chú "repo thật là content-engine" — bước 31 không yêu cầu điều tương tự cho GUIDE files nên tôi không tự thêm).

6. **Số dòng trong `infra/all-infra.md` bị trôi ngay trong phiên (không phải lỗi plan, chỉ là hệ quả tất yếu của việc chèn section mới trước).** Bước 10 chèn 6 dòng section "Canonical Host" trước dòng 106/214/255 gốc → các dòng đó dịch xuống +6 (106→112, 214→220, 255→261). Đã khớp theo **nội dung**, không theo số dòng cũ, đúng theo "Assumptions and Constraints" của plan.

7. **Repo `apcg-cms` — Nhóm 3 BLOCKED** (đã trình bày ở mục riêng trên) — đây là chỉ đạo rõ ràng của phiên, không phải lệch plan.

---

## Phát hiện ngoài phạm vi (không tự làm)

- Trong lúc đọc `process/context/all-context.md` baseline, phát hiện file đã có 1 dòng uncommitted thay đổi từ TRƯỚC phiên EXECUTE này (dòng "Feature Folder Index" thêm hàng `rebrand/` — chuẩn theo Feature Folder Lifecycle của CLAUDE.md, chắc chắn do phiên PLAN trước tạo feature folder `rebrand`). Không phải việc của Phase 0 checklist, tôi không đụng vào nội dung dòng đó ngoài việc nó tình cờ nằm trong cùng file mà tôi sửa các phần khác — đã xác nhận qua `git diff` trước/sau rằng dòng đó không bị tôi thay đổi.
- Correction về con số "69 trang" của tài liệu tham chiếu brand guideline PDF (đã ghi trong chính plan này ở mục "Phạm vi này KHÔNG bao gồm" là việc của UPDATE PROCESS sau này, không phải Phase 0) — không hành động, đúng như plan đã tự loại trừ.
- Không phát hiện thêm việc nào khác ngoài phạm vi checklist.

---

## Điều kiện để chuyển ✅ VERIFIED

Theo "Phase Completion Rules #5" của chính plan: cần user xem bằng chứng ở report này và xác nhận. Sau khi user xác nhận, Phase 0 có thể chuyển `✅ VERIFIED` trong cả plan file này và bảng trạng thái ở umbrella plan.
