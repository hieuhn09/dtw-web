# Rebrand Phase 7 — Estate cleanup + hoãn có chủ đích — Implementation Plan

**Date**: 08-09-26 (verification bổ sung chạy 09-09-26 — xem §"Pre-flight verification")
**Loại**: DIRECT PHASE PLAN (một phase trong phase program, không phải plan độc lập)
**Complexity**: SIMPLE-COMPLEX lai — kích thước tổng thể SMALL, nhưng trải trên 5 repo khác nhau nên cần checklist tường minh theo từng repo
**Feature**: `rebrand`
**Phase**: 7/8 — "Estate cleanup + hoãn có chủ đích" (theo bản đồ 8-phase của umbrella)
**Plan file**: `process/features/rebrand/active/phase-7-estate-cleanup_PLAN_08-09-26.md`
**Umbrella plan**: `process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md` — đọc trước, đây là nguồn duy nhất của ledger D1–D15. Phase plan này KHÔNG chép lại toàn bộ ledger, chỉ trích dẫn đúng các mục áp dụng.
**Tài liệu nghiên cứu nền**: `process/general-plans/references/rebrand-opentechwire_REFERENCE_08-09-26.md` — §3.8 (blast radius cụm repo anh em APCG), §4.4 (việc ngoài repo), §8 mục #7/#8/#12/#14 (ẩn số chưa kiểm chứng liên quan phase này)
**Status**: ⏳ PLANNED — chưa có bước nào trong phase này được thực thi

> **Ghi chú naming (cập nhật 09-09-26)**: umbrella §3 có **bảng tên file có thẩm quyền** cho cả 8 phase. Cả 8 đã thống nhất dạng `phase-N-<slug>_PLAN_<dd-mm-yy>.md`. **Không đổi tên các file plan nữa** — nhiều tài liệu chéo đang trỏ vào đường dẫn hiện tại. Report của phase này: `process/features/rebrand/reports/phase-7-estate-cleanup_REPORT_<dd-mm-yy>.md`.
>
> **Ghi chú execute-anchor**: file này là **execute anchor chính** (primary execute anchor) cho toàn bộ Phase 7 — checklist tự chứa đầy đủ cho cả 7 nhóm (A-G), **không có supporting phase files** nào khác đi kèm cho phase này. Một EXECUTE agent nhận việc chỉ cần đúng một đường dẫn này, không cần suy luận thêm từ tên thư mục hay các file phase khác.

---

## Overview — Mục tiêu một câu

Dọn sạch các dấu vết brand `DTW`/`Dailytechwire` còn sót lại trong **cụm 4 repo anh em của APCG** (`wad-web`, `brief-asia-web`, `media-engine`, `APCG-web`) và trong **project Vercel mồ côi** `/home/hieunc/Code/DTW`, đổi tên repo GitHub của `dtw-web` theo D7, và ghi lại — chứ không kích hoạt — việc hoãn đổi scope package `@dtw/*` theo D6, để chương trình rebrand khép lại phần "estate" mà không để sót một mảnh brand cũ nào có thể âm thầm tái xuất hiện.

## Phase Completion Rules

Áp dụng cho từng nhóm (A-G) trong phase này, mượn nguyên tắc "Phase Status Rules" từ `process/development-protocols/phase-programs.md` và "Phase Completion Rules" của umbrella plan — không được nới lỏng thấp hơn mức này.

Một nhóm KHÔNG được coi là xong cho tới khi:

1. **Gate của chính nhóm đó đạt** — đúng lệnh ở Verification Evidence của nhóm đó (grep + `typecheck`/`test` tương ứng, hoặc xác nhận thủ công cho việc ngoài repo) đã chạy thật và output được dán vào report — không suy luận "chắc đúng".
2. **Checkpoint trước khi sửa** — với các nhóm có quyết định mở (C0, D0, E0, G0): câu trả lời của user đã được ghi lại nguyên văn trong report **trước khi** nhóm đó bắt đầu được thực thi, không phải sau.
3. **Regression hẹp** — nếu một nhóm chạm lại một file mà một nhóm khác trong cùng phase đã sửa trước đó (ví dụ Nhóm G nếu kích hoạt chạm `apps/web/next.config.ts` — cùng file có thể bị Phase 2 chạm), chạy lại đúng lệnh grep/typecheck của nhóm trước để chắc chưa bị revert nhầm.
4. **Đường lỗi được kiểm, không chỉ đường vui** — với Nhóm E (`rm -rf`), bằng chứng phải là `ls` báo "No such file or directory", không phải suy luận từ "lệnh `rm` không in ra lỗi".
5. **User Confirmation** — với Nhóm C, D, E, G: user đã xem bằng chứng + checkpoint tương ứng trong report và xác nhận bằng văn bản, trước khi nhóm đó được đánh dấu `✅ VERIFIED`. Không có xác nhận này, trạng thái cao nhất được phép ghi là `🧪 TESTING`.

Marker trạng thái dùng thống nhất cho từng nhóm trong report Phase 7: `⏳ PLANNED` · `🔨 CODE DONE` · `🧪 TESTING` · `✅ VERIFIED` · `🚧 BLOCKED`.

Riêng Nhóm E (xoá `/home/hieunc/Code/DTW`): vì là one-way door, **không được** vào trạng thái `✅ VERIFIED` chỉ vì lệnh `rm -rf` chạy xong không báo lỗi. Cần đủ ba bằng chứng: (a) câu trả lời xác nhận E0 dán nguyên văn trong report, (b) `ls /home/hieunc/Code/DTW` xác nhận thư mục không còn tồn tại, (c) xác nhận bằng lời của user rằng project Vercel `dtw-frontend` đã được decommission qua dashboard thật (agent không tự verify được mục này).

## Phạm vi (Scope)

### Trong phạm vi của phase này

1. **`wad-web`** — 4 chỗ literal `DailyTechWire`/`Daily Tech Wire` trong danh sách "network" duy trì tay, cộng 1 comment code tham chiếu DTW (bonus, không bắt buộc).
2. **`brief-asia-web`** — các comment code (không phải nội dung UI) nhắc `DTW` là code đã clone hoặc là ví dụ so sánh, TRỪ anti-pattern guard màu ở `DESIGN.md` (giữ nguyên tuyệt đối theo D10).
3. **`media-engine`** — union type `SiteCode` và mọi nơi dùng giá trị `'DTW'`, với một quyết định kiến trúc cần user xác nhận trước khi sửa (đổi tại chỗ, hay giữ code đóng băng + thêm display-map).
4. **`APCG-web`** — xác minh tình trạng deploy thật (đã làm trong PLAN mode, xem bằng chứng bên dưới) trước khi quyết định có đáng sửa 1 dòng label hay không.
5. **`/home/hieunc/Code/DTW`** — decommission theo D15: project Vercel `dtw-frontend` + thư mục local, với cổng xác nhận người bắt buộc trước khi xoá bất cứ thứ gì.
6. **Repo GitHub `hieuhn09/dtw-web`** — đổi tên thành `otw-web` theo D7 (KHÔNG đổi thư mục local `/home/hieunc/Code/dtw-web`).
7. **D6 (scope `@dtw/*`)** — ghi lại là hoãn có chủ đích, kèm điều kiện kích hoạt và checklist đầy đủ nếu sau này được yêu cầu. **Không thực thi trong lượt này trừ khi user yêu cầu tường minh tại thời điểm Phase 7.**

### KHÔNG thuộc phạm vi phase này (trỏ sang phase khác)

- Bất kỳ thay đổi nào trong `dtw-web` (`apps/`, `packages/`) không thuộc nhóm G (D6) — đó là Phase 2/3/4 (đã/sẽ code xong trước Phase 7 theo dependency).
- `content-engine` (ba writer generate-time, DB Supabase, worktree merge) — Phase 5.
- CUTOVER domain/env/OAuth/social/GA4 — Phase 6. Phase 7 **giả định Phase 6 đã xong** cho phần lớn bước (xem Dependency).
- Bất kỳ redirect 301 hoặc Change of Address nào — **KHÔNG BAO GIỜ**, theo D4, không riêng phase này.
- Đổi tên slug `dtw` ở Central/content-engine registry, đổi schema `dtw_auth`, đổi bucket `dtw-media` — đóng băng vĩnh viễn theo D11/D12, **áp dụng cả trong cụm repo anh em**: `media-engine`'s `SiteCode` value `'DTW'` không nằm trong D11/D12 (đã xác nhận ở umbrella + tài liệu tham chiếu §3.8), nhưng slug `'dtw'` mà `SITE_BY_SLUG` dùng làm **key** (không phải value) thì CHÍNH LÀ join-key D11 — key đó không được đổi (xem Nhóm C bên dưới, bước C3).
- Đổi tên thư mục local `dtw-web` — D7 nói rõ **không đổi**.
- Viết lại `DTW-Brand-Guideline-v1.0.pdf`, `design/` bundle, hay bất kỳ file lịch sử/archive nào — không thuộc phase nào trong 8 phase.
- **`process/context/*` và `process/features/*/_GUIDE.md` của chính `dtw-web`** — soát chéo 09-09-26 phát hiện chúng từng không thuộc phase nào; nay **thuộc Phase 0, Nhóm 9** (umbrella §6b.1), KHÔNG phải Phase 7. Đừng làm lại ở đây.
- **`content-engine/process/context/*`** — thuộc **Phase 5, Nhóm D2.6**.
- Reconciliation nội dung `media-engine/process/**` (3 plan ACTIVE của chính media-engine nhắc DTW/WAD OFF) — đây là process artifact của **một repo khác**, thuộc quyền của workflow riêng của `media-engine`, không phải việc `dtw-web` tự sửa. Phase này chỉ **ghi nhận** sự tồn tại của chúng (xem Nhóm C, mục tham khảo) chứ không sửa.

---

> **Quy tắc chữ (09-09-26)**: mọi chỗ đổi `DTW` trong phase này áp umbrella **§5.1.1**. Các comment code ở Nhóm A5/B1-B5 là **câu hoàn chỉnh** → dùng `Opentechwire` (đúng như checklist đang ghi). Các giá trị `SiteCode` ở Nhóm C là **định danh kỹ thuật** → dùng `OTW`. Hai quy tắc này khác nhau **có chủ đích**; đừng "thống nhất" chúng thành một.

## Ledger áp dụng cho phase này (trích từ umbrella, không bàn lại)

| # | Quyết định | Áp dụng ở nhóm nào trong phase này |
|---|---|---|
| D6 | Hoãn đổi scope `@dtw/*`, nếu làm thì Phase 7 + commit riêng | Nhóm G |
| D7 | Đổi tên repo GitHub, giữ thư mục local | Nhóm F |
| D10 | Giữ nguyên navy `#1B2A52` / terracotta `#D4623C` | Ràng buộc Nhóm B — không đụng `brief-asia-web/DESIGN.md` anti-pattern guard |
| D11 | Slug `dtw` đóng băng vĩnh viễn (join-key xuyên 4 service) | Ràng buộc Nhóm C — không đổi **key** `dtw` trong `SITE_BY_SLUG`, chỉ có thể đổi **value** `'DTW'` |
| D12 | Schema `dtw_auth` / bucket `dtw-media` đóng băng | Không áp dụng trực tiếp cho phase này (không có repo nào trong Nhóm A-F chạm hai identifier này) |
| D15 | `/home/hieunc/Code/DTW` — đánh dấu xoá, PHẢI hỏi xác nhận trước | Nhóm E |

D1–D5, D8, D9, D13, D14 không có bước hành động nào trong phase này (đã xử lý ở các phase trước hoặc không áp dụng cho cụm estate).

---

## Dependency

- **Nhóm A (`wad-web`)** — phụ thuộc **Phase 6 đã xong** (domain `www.opentechwire.com` phải resolve được thật trước khi đổi URL trong danh sách network của một site đang live khác — nếu đổi URL trước khi domain sống, `wad-web`'s footer sẽ link ra một domain 404).
- **Nhóm B (`brief-asia-web`)** — không phụ thuộc phase nào, có thể chạy độc lập bất kỳ lúc nào (chỉ là comment code, không ảnh hưởng runtime).
- **Nhóm C (`media-engine`)** — không phụ thuộc kỹ thuật vào Phase 6, nhưng nên làm sau khi tên mới đã "chính thức" (tránh phải làm hai lần nếu D2 monogram thay đổi giữa chừng — thực tế đã chốt nên rủi ro này thấp). Phụ thuộc **quyết định kiến trúc của user** (xem checkpoint C0) trước khi sửa code.
- **Nhóm D (`APCG-web`)** — không phụ thuộc phase nào. Verification đã chạy xong trong PLAN mode này (xem bằng chứng bên dưới); chỉ còn quyết định của user.
- **Nhóm E (`/home/hieunc/Code/DTW`)** — không phụ thuộc kỹ thuật vào phase nào khác, nhưng **PHẢI có xác nhận người** trước bước xoá (D15) — đây là gate cứng, không phải một câu hỏi tuỳ chọn.
- **Nhóm F (đổi tên repo GitHub)** — không phụ thuộc phase nào, có thể làm bất kỳ lúc nào kể cả trước Phase 6 (không ảnh hưởng domain/CI — đã xác minh không có workflow nào hardcode `hieuhn09/dtw-web`, xem Pre-flight verification).
- **Nhóm G (D6, tuỳ chọn)** — không phụ thuộc phase nào, nhưng **chỉ chạy nếu user yêu cầu tường minh tại thời điểm Phase 7**. Mặc định là không chạy.

Nói tóm lại: **F và D có thể làm ngay hôm nay. B có thể làm ngay. E cần một câu hỏi. C cần một quyết định kiến trúc. A cần chờ Phase 6. G mặc định không chạy.**

---

## Pre-flight verification đã chạy trong PLAN mode (09-09-26)

Tài liệu tham chiếu được viết 08-09-26; các lệnh dưới đây được chạy lại 09-09-26 (một ngày sau) để xác nhận số dòng/nội dung chưa trôi và để giải quyết một phần ẩn số §8 của tài liệu tham chiếu. Đây là bằng chứng thật, không phải suy luận — dán nguyên để EXECUTE không phải chạy lại.

**wad-web — xác nhận đúng 4 chỗ + 1 bonus:**
```
command grep -n "DailyTechWire" /home/hieunc/Code/wad-web/src/lib/site-config.ts
# 75:  { label: "DailyTechWire", url: "https://dailytechwire.com/" },
command grep -n "DailyTechWire" "/home/hieunc/Code/wad-web/src/app/(reader)/[locale]/advertise/page.tsx"
# 44:  ["DailyTechWire", "Technology"],
command grep -n "DailyTechWire" /home/hieunc/Code/wad-web/BUSINESS.md
# 78:Network: AsiaMaterialsBrief, BriefAsia, DailyTechWire, WorldTravelBrief,
command grep -n "DailyTechWire" /home/hieunc/Code/wad-web/REBUILD_PLAN.md
# 69:- Footer APCG network: AsiaMaterialsBrief, BriefAsia, DailyTechWire, WorldTravelBrief,
command grep -n "DTW" /home/hieunc/Code/wad-web/src/lib/cms-client.ts
# 96: * Same pattern as DTW's `getAiModels` / `getDashboardMethodology`. No cost: the
```
Khớp chính xác với §3.8 tài liệu tham chiếu (không trôi dòng). `wad-web` dùng `npm` (`package-lock.json`, không có `pnpm-lock.yaml`).

**brief-asia-web — xác nhận toàn bộ comment + vị trí DO-NOT-TOUCH:**
```
command grep -n "DTW" /home/hieunc/Code/brief-asia-web/src/app/globals.css
# 23:  /* Compatibility aliases for cloned DTW components. Keep these mapped to the
# 41:  /* BriefAsia verticals use brand hierarchy, not a separate DTW palette. */
command grep -n "DTW" /home/hieunc/Code/brief-asia-web/src/lib/cms-client.ts
# 97: * Same pattern as DTW's `getAiModels` / `getDashboardMethodology`. No cost: the
command grep -n "DTW" /home/hieunc/Code/brief-asia-web/src/lib/cms-client.central.ts
# 432: * Central's signed-token endpoint. DTW carries the same gap.
command grep -n "DTW" /home/hieunc/Code/brief-asia-web/BUSINESS.md
# 10:DTW site: an upstream content engine prepares publication-ready stories, the
# 44:BriefAsia follows the same broad operating mechanism as DTW:
# 788:- The engine should not reuse DTW editorial voice.
command grep -n "DTW" /home/hieunc/Code/brief-asia-web/DESIGN.md
# 14, 115, 116, 151, 798, 815 — anti-pattern guard, DO-NOT-TOUCH (xem Nhóm B)
```
Khớp chính xác với §3.8. `brief-asia-web` cũng dùng `npm`.

**media-engine — xác nhận toàn bộ 9 vị trí `SiteCode`/`'DTW'` + đặc điểm cột DB:**
```
command grep -n "SiteCode" /home/hieunc/Code/media-engine/src/lib/types.ts
# 13:export type SiteCode = 'WTB' | 'GCV' | 'WAD' | 'DTW' | 'BRIEFASIA';
command grep -n "SITES\b\|_sitesCheck" /home/hieunc/Code/media-engine/src/lib/config.ts
# 51:export const SITES = ['WTB', 'GCV', 'WAD', 'DTW', 'BRIEFASIA'] as const;
cat /home/hieunc/Code/media-engine/src/lib/hero-resolve/site-map.ts
# 17: export const SITE_BY_SLUG: Readonly<Record<string, SiteCode>> = {
# 21:   dtw: 'DTW',    <- key 'dtw' = D11 join-key (KHÔNG ĐỔI); value 'DTW' = có thể đổi
command grep -n "'dtw'" /home/hieunc/Code/media-engine/src/lib/hero-resolve/mapping.test.ts
# 50:    expect(siteCodeOf('dtw')).toBe('DTW');
command grep -n "'DTW'" /home/hieunc/Code/media-engine/src/lib/engine/upload.ts
# 81, 163
command grep -n "DTW" /home/hieunc/Code/media-engine/src/state/renderVals.ts
# 741:  DTW: pal.slate,
# 1624:      site: ['all', 'WTB', 'GCV', 'WAD', 'DTW', 'BRIEFASIA'].map((v) => ({
command grep -n "DTW" /home/hieunc/Code/media-engine/src/lib/seed.ts
# 76, 83, 84, 94 — 4 dòng seed IndexedDB demo
command grep -n "DTW" /home/hieunc/Code/media-engine/supabase/migrations/0001_hero_resolve_schema.sql
# 151:  site         text not null,             -- SiteCode: WTB|GCV|WAD|DTW|BRIEFASIA
# (chỉ 1 occurrence, không phải 2 như tài liệu tham chiếu ghi — cột `text` thuần, không CHECK/enum)
command grep -n "DTW\|disabled\|dtw" /home/hieunc/Code/media-engine/process/features/hero-resolve/active/hero-resolve_11-08-26/phase-e-rollout_PLAN_11-08-26.md
# 67:- [ ] C1. Confirm both `gcv` and `wtb` are live and stable; confirm WAD/DTW remain explicitly OFF
# 70:      deferred (Pexels, WAD/DTW, press-kit sources — all explicitly out of scope per the SPEC).
```
**Phát hiện quan trọng cho rủi ro**: hero-resolve cho DTW đang **tường minh ở trạng thái OFF** (`WAD/DTW remain explicitly OFF`) — điều này làm giảm khả năng có row `asset_usages.site = 'DTW'` nào đang sống trong Postgres. Vẫn nên chạy một `SELECT count(*) FROM asset_usages WHERE site = 'DTW'` trước khi coi cột này là "chắc chắn rỗng" — chưa ai chạy câu đó thật (xem Verification Evidence, bước C-verify).
`media-engine` dùng `npm`, script `typecheck` = `tsc --noEmit`, script `test` = `vitest run`.

**APCG-web — xác nhận tình trạng deploy thật (giải quyết ẩn số #8 của tài liệu tham chiếu, mạnh hơn bản gốc):**
```
curl -sI --max-time 8 "https://asiapresscentre.com/"
# HTTP/2 308, location: https://asiapresscentre.org/
curl -s --max-time 8 "https://asiapresscentre.org/" | grep -o "<title>[^<]*</title>"
# <title>Asia Press Centre Group | English-Language Media in Asia</title>
command grep -n "<title>" /home/hieunc/Code/APCG-web/index.html
# 8:  <title>Asia Press Centre Group · The trusted voice of Asia | Independent Media Network</title>
curl -s -o /dev/null -w "%{http_code}\n" --max-time 8 "https://asiapresscentre.org/assets/app.js"
# 404
```
**Kết luận mạnh hơn tài liệu tham chiếu**: không chỉ `<title>` khác nhau và `/assets/app.js` 404 — **nội dung `<title>` đang sống trên `asiapresscentre.org` hoàn toàn khác chuỗi trong repo local**, và `.com` giờ 308 thẳng sang `.org` (một redirect có thật, không phải cấu hình trong repo `APCG-web` — repo local có canonical `.com`, không hề biết về `.org`). Bằng chứng này gần như loại trừ khả năng `/home/hieunc/Code/APCG-web` là nguồn deploy hiện tại của site corporate. Xem Nhóm D để biết hành động cụ thể.

**`/home/hieunc/Code/DTW` — xác nhận project Vercel mồ côi + domain phụ:**
```
curl -s -o /dev/null -w "%{http_code}\n" --max-time 8 "https://dtw-frontend.vercel.app/"
# 200
curl -s --max-time 8 "https://dtw-frontend.vercel.app/" | grep -o "<title>[^<]*</title>"
# <title>MLB Deserve-to-Win</title>
dig +short NS dailytechwire.asia; dig +short A dailytechwire.asia
dig +short NS dtw.news; dig +short A dtw.news
# cả hai domain: KHÔNG có bản ghi NS/A/MX nào — không delegate, không nhận mail
```
**Kết luận**: hostname mặc định của project Vercel `dtw-frontend` (`prj_pqPQJ2X24xmwotkEAiHsPksngw3J`, org `team_EFUMF5rjY05UDBzSnlsZmPgk`) đang phục vụ một ứng dụng MLB/ESPN không liên quan — xác nhận đúng ẩn số #7 của tài liệu tham chiếu: subdomain `.vercel.app` mặc định đã được tài khoản khác chiếm, KHÔNG phải bằng chứng project của user đã bị xoá hay còn sống — chỉ dashboard Vercel thật mới trả lời được câu đó. Hai domain `dailytechwire.asia`/`dtw.news` nêu trong `about.jsx`/`article.jsx` **không có DNS nào cả** — giảm mức khẩn của việc "cần forward mail" trước khi decommission, nhưng không loại trừ khả năng đã đăng ký ở registrar mà chưa delegate nameserver.

**GitHub — xác nhận tên đích còn trống + không có workflow hardcode:**
```
gh repo view hieuhn09/otw-web
# GraphQL: Could not resolve to a Repository with the name 'hieuhn09/otw-web'. (repository)
# => tên "otw-web" CHƯA bị chiếm dưới tài khoản hieuhn09, an toàn để đổi tên vào
command grep -rln "hieuhn09/dtw-web\|dtw-web\.git\|github.com/hieuhn09" --include="*.md" --include="*.yml" --include="*.yaml" --include="*.json" \
  /home/hieunc/Code/dtw-web --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=.turbo
# chỉ 2 kết quả, cả hai là chính tài liệu rebrand (reference + umbrella) — KHÔNG có workflow/CI/badge nào hardcode tên repo
```

**D6 — đếm hiện trạng thật (khác nhẹ so với ước lượng 61 file/128 dòng của tài liệu tham chiếu, do trôi 1 ngày + cách đếm khác nhau):**
```
command grep -rlE "@dtw/" --include="*.json" --include="*.ts" --include="*.tsx" --include="*.mjs" /home/hieunc/Code/dtw-web \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.turbo --exclude-dir=.git --exclude-dir=dist --exclude=pnpm-lock.yaml
# 41 file (danh sách đầy đủ ở Nhóm G)
command grep -c "@dtw/" /home/hieunc/Code/dtw-web/pnpm-lock.yaml
# 5 dòng (20, 23, 69, 120, 141)
```
Một trong 41 file là `process/general-plans/references/design-refresh-diff_14-06-26.json` — đây là một **báo cáo diff lịch sử có ghi ngày**, không phải code sống. Loại khỏi checklist thực thi của D6 (không rewrite lịch sử).

---

## Quyết định cần user xác nhận trước khi thực thi từng nhóm (checkpoints)

Đây KHÔNG phải là việc bàn lại D1–D15 — đây là những quyết định kỹ thuật nhỏ hơn mà chính tài liệu tham chiếu/umbrella cũng để ngỏ, không đoán thay.

### Checkpoint C0 — media-engine `SiteCode`: đổi tại chỗ hay display-map?

Cả hai phương án đều hợp lệ và đã được xác nhận **không đụng D11/D12** (giá trị `'DTW'` là output nội bộ của media-engine, không phải join-key — join-key là chuỗi `'dtw'` viết thường ở phía key của `SITE_BY_SLUG`, giữ nguyên trong cả hai phương án).

- **Phương án 1 — Đổi tại chỗ (khuyến nghị mặc định)**: đổi literal `'DTW'` → `'OTW'` ở cả 9 vị trí đã liệt kê (Nhóm C bên dưới). Ưu điểm: toàn bộ codebase `media-engine` nhất quán, `tsc --noEmit` + `mapping.test.ts` tự động bắt lỗi nếu sót một chỗ. Nhược điểm: đổi 9 vị trí thay vì 1.
- **Phương án 2 — Giữ đóng băng + display-map**: giữ nguyên `'DTW'` ở mọi nơi (kể cả `SiteCode` union), chỉ thêm **một** bảng tra cứu mới `SITE_LABEL: Record<SiteCode, string>` và dùng nó đúng tại điểm duy nhất mà giá trị này hiển thị cho editor (`renderVals.ts:1624`, label của filter-chip). Ưu điểm: 1 file, không đụng type union hay 8 vị trí khác. Nhược điểm: mọi người đọc code `media-engine` sau này sẽ thấy `'DTW'` trong khi UI hiện `OTW` — một tầng gián tiếp vĩnh viễn cho một identifier không có lý do kỹ thuật để đóng băng (khác D11, đây không phải join-key liên repo).

**Plan này khuyến nghị Phương án 1** vì `'DTW'` ở đây không phải join-key (đã xác nhận), thay đổi nhỏ và có lưới an toàn compiler+test, và tránh để lại một tầng gián tiếp không cần thiết mãi mãi. Nhưng đây là quyết định của user trước khi EXECUTE chạm vào `media-engine` — **dừng và hỏi trước khi sửa Nhóm C**, không tự chọn.

### Checkpoint D0 — APCG-web: có sửa gì không?

Bằng chứng đã thu thập (xem Pre-flight verification) cho thấy `/home/hieunc/Code/APCG-web` **gần như chắc chắn không phải nguồn deploy hiện tại** của `asiapresscentre.org`. Đề xuất: **KHÔNG sửa `assets/app.js:10`** trong lượt này — việc sửa một dòng trong một repo không phải nguồn production thật không tạo ra giá trị gì, và có rủi ro tạo cảm giác "đã dọn xong" trong khi site thật (chưa xác định nằm ở đâu) vẫn còn brand cũ. Đề xuất thay thế: ghi một note trong report Phase 7 rằng repo này **có khả năng đã bị thay thế**, và việc tìm nguồn deploy thật của `asiapresscentre.org` là một việc nằm ngoài phạm vi rebrand (thuộc về vệ sinh hạ tầng của APCG nói chung) — cờ lại cho user, không tự ý mở rộng phạm vi. **Cần user xác nhận đồng ý với đề xuất "không sửa" này**, hoặc chỉ ra nguồn deploy thật nếu user biết.

### Checkpoint E0 — `/home/hieunc/Code/DTW`: xoá thật hay giữ?

**Đây là gate cứng theo D15, không phải một câu hỏi tuỳ chọn.** EXECUTE agent của Nhóm E **không được** tự động xoá thư mục hay project Vercel dựa trên suy luận "việc này rõ ràng nên làm" — kể cả khi đang chạy dưới Auto Mode. Phải dừng lại và hỏi user một câu tường minh kiểu: *"Xác nhận xoá vĩnh viễn `/home/hieunc/Code/DTW` (không phải git repo, không có lịch sử để khôi phục) và decommission project Vercel `dtw-frontend`? Gõ xác nhận rõ ràng để tiếp tục."* Chỉ tiếp tục sau khi có câu trả lời xác nhận bằng văn bản từ user, và câu trả lời đó phải được dán nguyên vào report Phase 7 làm bằng chứng.

### Checkpoint G0 — D6 có kích hoạt không?

Mặc định: **không**. Chỉ chạy Nhóm G nếu user gõ yêu cầu tường minh dạng "làm luôn D6" hoặc tương đương tại thời điểm Phase 7 được EXECUTE. Không suy luận từ im lặng.

---

## Implementation Checklist

### Nhóm A — `wad-web` (4 danh sách network + 1 bonus) — PHỤ THUỘC Phase 6 đã xong

**A1.** `wad-web/src/lib/site-config.ts:75` — trong mảng `NETWORK_TITLES` (khai báo dòng 72): đổi
`{ label: "DailyTechWire", url: "https://dailytechwire.com/" }`
thành
`{ label: "Opentechwire", url: "https://www.opentechwire.com/" }`
(host **www**, theo D5 — không phải apex, khớp canonical đã chốt).

**A2.** `wad-web/src/app/(reader)/[locale]/advertise/page.tsx:44` — trong mảng `NETWORK_TITLES_TABLE` (khai báo dòng 42, kiểu `ReadonlyArray<readonly [title, field]>`): đổi tuple
`["DailyTechWire", "Technology"]`
thành
`["Opentechwire", "Technology"]`.
**Lưu ý đã xác nhận qua đọc file**: mảng này là một danh sách **thứ hai, độc lập, đã trôi khỏi `NETWORK_TITLES`** — nó còn chứa các tên không khớp danh sách thật (`Asianomist`, `GlobalTravelPost`, `TheAsiaSpotlight`, `AsiaGolfReview`, `AsiaEconomicReview`, `AsiaBeautyBrief` — không publication nào trong số này xuất hiện ở `site-config.ts`). **Chỉ sửa đúng dòng `DailyTechWire`** — reconciliation toàn bộ danh sách này là một bug có sẵn từ trước của `wad-web`, không thuộc phạm vi rebrand.

**A3.** `wad-web/BUSINESS.md:78` — đổi `DailyTechWire` thành `Opentechwire` trong câu liệt kê network (giữ nguyên các tên khác trong câu).

**A4.** `wad-web/REBUILD_PLAN.md:69` — đổi `DailyTechWire` thành `Opentechwire` trong câu liệt kê network (giữ nguyên các tên khác).

**A5 (bonus, không bắt buộc).** `wad-web/src/lib/cms-client.ts:96` — comment `Same pattern as DTW's \`getAiModels\` / \`getDashboardMethodology\`.` → có thể đổi `DTW` thành `Opentechwire` cho rõ nghĩa, nhưng đây thuần là comment giải thích code, không ảnh hưởng runtime hay hiển thị. Làm hay không tuỳ ý, không chặn phase.

Cả 4 bước A1–A4 là **reversible** (revert bằng git trong `wad-web`). Không phải one-way door.

### Nhóm B — `brief-asia-web` (comment code, KHÔNG động DESIGN.md) — không phụ thuộc phase nào

**B1.** `brief-asia-web/src/app/globals.css:23` — comment `/* Compatibility aliases for cloned DTW components. Keep these mapped to the` → đổi `DTW` thành `Opentechwire`. Comment thuần, không có giá trị CSS nào bị đụng.

**B2.** `brief-asia-web/src/app/globals.css:41` — comment `/* BriefAsia verticals use brand hierarchy, not a separate DTW palette. */` → đổi tương tự.

**B3.** `brief-asia-web/src/lib/cms-client.ts:97` — comment `Same pattern as DTW's \`getAiModels\` / \`getDashboardMethodology\`.` → đổi tương tự.

**B4.** `brief-asia-web/src/lib/cms-client.central.ts:432` — comment `Central's signed-token endpoint. DTW carries the same gap.` → đổi tương tự.

**B5 (tuỳ chọn, mức độ ưu tiên thấp hơn B1-B4 vì đây là prose trong tài liệu chiến lược nội bộ, không phải code comment).** `brief-asia-web/BUSINESS.md:10,44,788` — ba câu mô tả kiến trúc engine dùng chung với "DTW" làm ví dụ so sánh (`"DTW site: an upstream content engine..."`, `"BriefAsia follows the same broad operating mechanism as DTW"`, `"The engine should not reuse DTW editorial voice."`). Đổi `DTW` thành `Opentechwire` ở cả 3 câu nếu muốn tài liệu chiến lược phản ánh đúng tên hiện tại — không bắt buộc vì các câu này không ảnh hưởng brand hiển thị của BriefAsia.

**DO-NOT-TOUCH — `brief-asia-web/DESIGN.md:14,115,116,151,798,815`.** Đây là **anti-pattern guard màu**, cảnh báo không dùng các mã hex `#D4623C`/`#1B2A52`/`#FDFCF8` và "the old DTW-derived design" cho UI của BriefAsia. Theo D10, các mã hex này **không đổi** (Opentechwire giữ nguyên palette). Guard này vẫn đúng và vẫn cần bảo vệ BriefAsia khỏi vô tình dùng lại đúng những mã hex đó — **giữ nguyên chữ `DTW` trong các dòng này**, đừng sed vào. Đây là điểm lệch rõ ràng nhất trong Nhóm B — nếu một lượt sed máy móc chạy qua cả file, nó sẽ phá guard này.

Tất cả các bước B1-B5 (nếu làm) là **reversible**.

### Nhóm C — `media-engine` `SiteCode` — CẦN Checkpoint C0 xác nhận trước, không phụ thuộc phase nào khác

Giả định Checkpoint C0 chọn **Phương án 1 (đổi tại chỗ)** — nếu user chọn Phương án 2, thay bước C1–C7 bằng "thêm một entry `SITE_LABEL['DTW'] = 'OTW'` và áp dụng đúng tại `renderVals.ts:1624`", các bước còn lại giữ nguyên.

**C1.** `media-engine/src/lib/types.ts:13` — đổi
`export type SiteCode = 'WTB' | 'GCV' | 'WAD' | 'DTW' | 'BRIEFASIA';`
thành
`export type SiteCode = 'WTB' | 'GCV' | 'WAD' | 'OTW' | 'BRIEFASIA';`

**C2.** `media-engine/src/lib/config.ts:51` — đổi
`export const SITES = ['WTB', 'GCV', 'WAD', 'DTW', 'BRIEFASIA'] as const;`
thành
`export const SITES = ['WTB', 'GCV', 'WAD', 'OTW', 'BRIEFASIA'] as const;`
(dòng 54-55 `_sitesCheck` tự động verify tại compile-time — không cần sửa tay, `tsc` sẽ báo lỗi nếu C1/C2 lệch nhau).

**C3.** `media-engine/src/lib/hero-resolve/site-map.ts:21` — trong `SITE_BY_SLUG` (khai báo dòng 17): đổi **chỉ phần value**
`  dtw: 'DTW',`
thành
`  dtw: 'OTW',`
**TUYỆT ĐỐI KHÔNG đổi key `dtw`** — đây là join-key D11, content-engine luôn gửi slug `'dtw'` viết thường (đóng băng vĩnh viễn), chỉ giá trị trả về (uppercase display code) được đổi.

**C4.** `media-engine/src/lib/hero-resolve/mapping.test.ts:50` — đổi
`expect(siteCodeOf('dtw')).toBe('DTW');`
thành
`expect(siteCodeOf('dtw')).toBe('OTW');`
(input `'dtw'` giữ nguyên — đúng theo C3; chỉ output kỳ vọng đổi).

**C5.** `media-engine/src/lib/engine/upload.ts:81` và `:163` — đổi cả hai mảng
`sites: ['WTB', 'GCV', 'WAD', 'DTW', 'BRIEFASIA'],`
thành
`sites: ['WTB', 'GCV', 'WAD', 'OTW', 'BRIEFASIA'],`

**C6.** `media-engine/src/state/renderVals.ts:741` — đổi
`  DTW: pal.slate,`
thành
`  OTW: pal.slate,`
(giữ nguyên palette `pal.slate` — không đụng màu, chỉ đổi key).

**C7.** `media-engine/src/state/renderVals.ts:1624` — đổi
`site: ['all', 'WTB', 'GCV', 'WAD', 'DTW', 'BRIEFASIA'].map((v) => ({`
thành
`site: ['all', 'WTB', 'GCV', 'WAD', 'OTW', 'BRIEFASIA'].map((v) => ({`

**C8 (thấp ưu tiên, dữ liệu demo/prototype).** `media-engine/src/lib/seed.ts:76,83,84,94` — 4 dòng seed IndexedDB cho demo có `sites:['WTB','DTW']` hoặc `sites:['DTW']`. Đổi `DTW` → `OTW` trong cả 4 dòng cho nhất quán với C1-C7, nhưng đây chỉ là dữ liệu seed cho prototype/demo cục bộ, không ảnh hưởng gì tới production.

**C9 (comment-only, không bắt buộc).** `media-engine/supabase/migrations/0001_hero_resolve_schema.sql:151` — comment `-- SiteCode: WTB|GCV|WAD|DTW|BRIEFASIA` trên cột `site text not null`. Đổi comment thành `-- SiteCode: WTB|GCV|WAD|OTW|BRIEFASIA` nếu muốn, **KHÔNG thêm CHECK constraint** (cột vốn là text tự do, giữ nguyên hành vi). Đây KHÔNG phải sửa migration đã apply theo kiểu DDL — chỉ là một comment SQL trong file migration; nếu muốn tuyệt đối an toàn, có thể để nguyên và bỏ qua bước này (comment không ảnh hưởng hành vi).

**C-verify (khuyến nghị, trước khi coi Nhóm C là verified).** Chạy một câu SELECT audit thật trên Postgres của `media-engine` (Supabase) để xác nhận giả định "hero-resolve DTW đang OFF nên khả năng cao không có row nào":
```sql
SELECT count(*) FROM asset_usages WHERE site = 'DTW';
```
Nếu kết quả > 0: cần thêm một `UPDATE asset_usages SET site = 'OTW' WHERE site = 'DTW';` sau khi C1-C7 đã deploy (không update trước, vì code cũ vẫn kỳ vọng giá trị `'DTW'` cho tới khi deploy xong). Nếu kết quả = 0 (kỳ vọng, dựa trên `phase-e-rollout_PLAN:67,70` xác nhận DTW OFF): không cần UPDATE, chỉ cần comment C9 (nếu làm) là an toàn.

**Ngoài phạm vi Nhóm C**: `media-engine/process/features/hero-resolve/active/**` và `media-engine/process/general-plans/active/prototype-to-product_31-07-26/**` — đây là plan ACTIVE của chính `media-engine`, có nhắc DTW/WAD OFF. Phase này không sửa các file plan đó; nếu `media-engine`'s team muốn cập nhật thuật ngữ trong plan riêng của họ, đó là việc của workflow `media-engine`, không phải của `dtw-web`.

Toàn bộ Nhóm C là **reversible** (code có version trong git của `media-engine`; nếu C-verify tìm thấy row cần UPDATE, thao tác đó là bán-one-way giống các UPDATE dữ liệu khác trong chương trình — cần backup trước khi chạy, tương tự Phase 5).

### Nhóm D — `APCG-web` — quyết định theo Checkpoint D0

**D1 (mặc định theo khuyến nghị D0).** KHÔNG sửa `APCG-web/assets/app.js:10`. Ghi lại trong report Phase 7: repo này có bằng chứng mạnh là không phải nguồn deploy hiện tại của `asiapresscentre.org` (xem Pre-flight verification). Đánh dấu là "không hành động, có lý do" — không phải bỏ sót.

**D2 (chỉ nếu user phản đối D0 và xác nhận repo này VẪN là nguồn thật ở đâu đó).** `APCG-web/assets/app.js:10` — đổi
`{ sector: "Technology", title: "Daily Tech Wire", url: "https://dailytechwire.com", status: "live" }`
thành
`{ sector: "Technology", title: "Opentechwire", url: "https://www.opentechwire.com", status: "live" }`
**Lưu ý casing đặc biệt**: đây là dạng viết tách chữ `Daily Tech Wire` — DUY NHẤT trong toàn bộ chương trình rebrand có dạng này. Không dùng `sed 's/DailyTechWire/.../'` ở file này, nó sẽ không khớp.

Cả hai nhánh D1/D2 là **reversible** nếu D2 được chọn (code có version trong git `APCG-web`).

### Nhóm E — `/home/hieunc/Code/DTW` decommission — CẦN Checkpoint E0, ONE-WAY DOOR

**E1 (bắt buộc, trước mọi hành động xoá).** Dừng lại, hỏi user câu xác nhận ở Checkpoint E0. Dán câu trả lời của user vào report Phase 7 nguyên văn.

**E2 (khuyến nghị, chi phí gần bằng không, giảm rủi ro one-way door).** Trước khi xoá, tạo một bản backup cục bộ ngoài mọi repo, không track ở đâu cả — chỉ để phòng hờ cá nhân, không phải một bước bắt buộc theo D15 (D15 nói rõ "không phải git repo, không có lịch sử để giữ" — nhưng một bản tar rẻ tiền không hại gì):
```
tar czf ~/dtw-legacy-prototype-backup-$(date +%Y%m%d).tar.gz -C /home/hieunc/Code DTW
```

**E3 (external/manual, do user thực hiện qua Vercel dashboard — agent không tự làm được).** Đăng nhập Vercel dashboard, tìm project `projectId: prj_pqPQJ2X24xmwotkEAiHsPksngw3J` thuộc `orgId: team_EFUMF5rjY05UDBzSnlsZmPgk`, xác nhận đây đúng là project của user (không phải project đã bị chuyển nhượng/xoá), rồi decommission (xoá project hoặc gỡ domain). **Vì `dtw-frontend.vercel.app` hiện phục vụ một app không liên quan (đã xác nhận, xem Pre-flight verification), có khả năng project này đã KHÔNG còn hoạt động hoặc subdomain đã bị người khác chiếm — user cần tự xác nhận qua dashboard, agent không verify được từ xa.**

**E4 (sau khi E1 xác nhận VÀ E3 hoàn tất, nếu E1 là "đồng ý xoá").** Xoá thư mục local:
```
rm -rf /home/hieunc/Code/DTW
```
**ONE-WAY DOOR thật sự** — không phải git repo, không có lịch sử, không có cách khôi phục ngoài bản backup ở E2 (nếu đã tạo).

Nếu Checkpoint E0 trả lời "giữ lại" thay vì xoá: bỏ qua E3/E4, chỉ ghi một `README.md` ngắn trong `/home/hieunc/Code/DTW` nêu rõ đây là prototype đã ngừng dùng, chứa dữ liệu pháp lý bịa (UEN, ISSN), không phải nguồn tham chiếu — để không ai vô tình copy nội dung từ đó trong tương lai. Đây KHÔNG phải "rebrand nó" (D15 nói rõ không rebrand thư mục này) — chỉ là một cảnh báo, không sửa nội dung `DailyTechWire` bên trong các file `.jsx`.

### Nhóm F — Đổi tên repo GitHub (D7) — không phụ thuộc phase nào

**F1 (manual/external — do user chạy hoặc uỷ quyền tường minh cho EXECUTE agent chạy `gh`, vì đây là thay đổi một bề mặt cộng tác dùng chung).**
```
gh repo rename otw-web --repo hieuhn09/dtw-web
```
Đã xác nhận tên đích `otw-web` chưa bị chiếm dưới `hieuhn09` (xem Pre-flight verification).

**F2 (in-repo, an toàn, EXECUTE agent có thể tự chạy).** Cập nhật remote local để khớp tên mới (thư mục local KHÔNG đổi tên theo D7, chỉ URL remote đổi):
```
git -C /home/hieunc/Code/dtw-web remote set-url origin https://github.com/hieuhn09/otw-web.git
```

**F3 (verify).**
```
gh repo view hieuhn09/otw-web --json name,url
git -C /home/hieunc/Code/dtw-web remote -v
curl -sI https://github.com/hieuhn09/dtw-web
```
Lệnh cuối phải trả về một redirect (302/301) sang `hieuhn09/otw-web`, xác nhận GitHub tự động giữ đường dẫn cũ sống.

**Ngoài phạm vi Nhóm F**: không sửa hai file duy nhất trong `dtw-web` còn nhắc `hieuhn09/dtw-web` — chính `rebrand-opentechwire_REFERENCE_08-09-26.md` và `rebrand-opentechwire-umbrella_PLAN_08-09-26.md`. Đây là tài liệu lập kế hoạch đang ACTIVE của chính chương trình rebrand, không phải code; sửa lại tên repo bên trong chúng là một việc dọn dẹp tài liệu tuỳ chọn ở UPDATE PROCESS, không phải một đòi hỏi kỹ thuật (GitHub redirect làm cho việc này non-blocking).

Nhóm F là **reversible** (GitHub cho phép đổi tên lại; remote URL local sửa lại bằng một lệnh `git remote set-url` khác).

### Nhóm G — D6 (scope `@dtw/*`) — HOÃN CÓ CHỦ ĐÍCH, chỉ chạy nếu Checkpoint G0 = có

Đây là checklist đầy đủ, viết sẵn để khi nào được kích hoạt thì chạy thẳng, không cần re-research lại từ đầu — nhưng **mặc định của lượt Phase 7 này là KHÔNG chạy nhóm này**.

**Điều kiện kích hoạt**: user gõ yêu cầu tường minh (ví dụ "làm luôn D6" / "đổi scope package luôn") tại thời điểm Phase 7 đang EXECUTE. Không tự suy luận từ im lặng hay từ việc các nhóm khác đã xong.

**G1.** Đổi `"name"` trong 3 `package.json` của package:
- `packages/db/package.json:2` → `"@otw/db"` (dòng 28 cũng đổi: `"@otw/config": "workspace:*"`)
- `packages/ui/package.json:2` → `"@otw/ui"` (dòng 19 cũng đổi: `"@otw/config"`)
- `packages/config/package.json:2` → `"@otw/config"`

**G2.** Đổi 3 chỗ `"extends"` trong tsconfig:
- `apps/web/tsconfig.json:2` → `"@otw/config/tsconfig/next.json"`
- `packages/db/tsconfig.json:2` → `"@otw/config/tsconfig/base.json"`
- `packages/ui/tsconfig.json:2` → `"@otw/config/tsconfig/react-library.json"`

**G3.** `apps/web/next.config.ts:10` — đổi `transpilePackages: ["@dtw/ui", "@dtw/db"]` thành `transpilePackages: ["@otw/ui", "@otw/db"]`.

**G4.** `apps/web/package.json` — đổi 3 dependency entry `"@dtw/*": "workspace:*"` thành `"@otw/*": "workspace:*"` (dòng 21, 22, 39 theo tài liệu tham chiếu — verify lại số dòng thật tại thời điểm kích hoạt vì file có thể đã trôi).

**G5.** `package.json` (root, dòng 2) — đổi `"name": "dtw-web"` thành `"name": "otw-web"` (khớp D7's tên repo mới, dù D7 không bắt buộc đổi tên package field này — nhưng để nhất quán trong cùng commit D6 thì nên đổi luôn); dòng 17-21 — 5 lệnh `pnpm --filter @dtw/db ...` đổi thành `pnpm --filter @otw/db ...`.

**G6 (import sites — 41 file đã xác nhận qua grep tại Pre-flight verification, danh sách đầy đủ, chạy trong CÙNG một commit với G1-G5):**
```
apps/web/next.config.ts
apps/web/package.json
apps/web/scripts/migrate-prod.mjs
apps/web/src/app/(reader)/account/[[...tab]]/account-tabs.tsx
apps/web/src/app/(reader)/account/[[...tab]]/settings-tab.tsx
apps/web/src/app/(reader)/awards/page.tsx
apps/web/src/app/(reader)/briefing/briefing-content.tsx
apps/web/src/app/(reader)/dashboards/[[...sub]]/loading.tsx
apps/web/src/app/(reader)/newsletters/newsletters-content.tsx
apps/web/src/app/(reader)/reset-password/page.tsx
apps/web/src/app/(reader)/search/page.tsx
apps/web/src/components/article/article-body.tsx
apps/web/src/components/article/article-content.tsx
apps/web/src/components/article/paywall.tsx
apps/web/src/components/article/related-row.tsx
apps/web/src/components/auth-modal.tsx
apps/web/src/components/byline-wired.tsx
apps/web/src/components/cookie-banner.tsx
apps/web/src/components/dashboards/funding-tracker.tsx
apps/web/src/components/footer.tsx
apps/web/src/components/home/awards-banner.tsx
apps/web/src/components/home/brief-band.tsx
apps/web/src/components/home/dashboards-teaser.tsx
apps/web/src/components/home/deep-dive.tsx
apps/web/src/components/home/home-hero.tsx
apps/web/src/components/home/most-read.tsx
apps/web/src/components/home/newsletter-cta.tsx
apps/web/src/components/pillar/pillar-content.tsx
apps/web/src/lib/account-actions.ts
apps/web/src/lib/auth.ts
apps/web/src/lib/most-read.ts
apps/web/src/lib/session.ts
apps/web/src/lib/view-actions.ts
apps/web/tsconfig.json
packages/config/package.json
packages/db/package.json
packages/db/scripts/copy-auth-to-central.ts
packages/db/src/client.ts
packages/db/src/index.ts
packages/db/tsconfig.json
packages/ui/package.json
packages/ui/tsconfig.json
```
(41 file này đã bao gồm G1-G3 và các file khác đã liệt kê ở G1-G4; chạy một câu `sed -i "s/@dtw\//@otw\//g" <mỗi file>` hoặc tương đương, rồi kiểm tra diff bằng tay ở `packages/db/scripts/copy-auth-to-central.ts` — theo tài liệu tham chiếu §3.4, file này nội suy tên schema `dtw_auth` **cùng một chỗ** với `@dtw/db` — PHẢI đảm bảo chỉ đổi phần `@dtw/db` (package import), TUYỆT ĐỐI KHÔNG đổi bất kỳ chuỗi `dtw_auth` nào trong cùng file — đó là schema Postgres đóng băng theo D12).

**DO-NOT-TOUCH trong Nhóm G**: `process/general-plans/references/design-refresh-diff_14-06-26.json` — đây là báo cáo diff lịch sử có ghi ngày (một trong 42 file mà grep tìm thấy `@dtw/`), không phải code sống, không thuộc phạm vi rewrite.

**G7 (bắt buộc, cùng commit).** Regenerate lockfile:
```
pnpm install
```
CI chạy `--frozen-lockfile` (`ci.yml:39` theo tài liệu tham chiếu) — nếu không regenerate, mọi PR sau đó sẽ fail ngay ở bước install.

**G8 (verify).**
```bash
# Lệnh ở bản trước (`pnpm --filter @otw/db... turbo run typecheck`) là SAI CÚ PHÁP —
# trộn cú pháp filter của pnpm với runner của turbo; nó sẽ không chạy. Dùng đúng lệnh của repo:
pnpm turbo run typecheck 2>&1 | tee /tmp/otw-typecheck.log
command grep -rn "@dtw/" /home/hieunc/Code/dtw-web \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.turbo --exclude-dir=.git --exclude=pnpm-lock.yaml
# kỳ vọng: 0 hit, TRỪ process/general-plans/references/design-refresh-diff_14-06-26.json (lịch sử, không đổi)
```

Nhóm G là **reversible** về code (git revert), nhưng thay đổi tên package là một breaking change cho bất kỳ ai đang có branch/worktree khác đang import `@dtw/*` — nên ship thành một commit atomic riêng, không gộp chung với bất kỳ thay đổi nào khác của Phase 7, đúng như umbrella đã ghi.

---

## Touchpoints (tổng hợp)

| Repo | Số file chạm | Loại thay đổi | Phụ thuộc |
|---|---|---|---|
| `wad-web` | 4 (+1 bonus) | Literal `DailyTechWire`/`Daily Tech Wire` trong copy hiển thị (footer + trang advertise) và 2 file markdown nội bộ | Phase 6 (domain phải sống) |
| `brief-asia-web` | 4 (+1 tuỳ chọn) | Comment code + 1 đoạn prose tuỳ chọn | Không |
| `media-engine` | 8-9 (tuỳ Checkpoint C0) | Union type + 6 điểm dùng giá trị + 1 test assertion, cộng 1 comment SQL tuỳ chọn | Quyết định C0 |
| `APCG-web` | 0-1 (tuỳ Checkpoint D0) | Literal `Daily Tech Wire` dạng tách chữ, khả năng cao là dead code (repo không live) | Quyết định D0 |
| `/home/hieunc/Code/DTW` | toàn bộ thư mục (14 file `.jsx` + config) | Decommission, không sửa nội dung | Xác nhận E0 |
| GitHub (`dtw-web` repo) | 0 file code, 1 remote URL | Đổi tên hosting + cập nhật remote local | Không |
| `dtw-web` (nếu G kích hoạt) | 41 file + `pnpm-lock.yaml` | Đổi scope package `@dtw/*` → `@otw/*` | Checkpoint G0 |

## Public Contracts

- **`media-engine`'s `SITE_BY_SLUG` key `dtw`** — hợp đồng nội bộ giữa `content-engine` (gửi slug) và `media-engine` (tra cứu code). **Key không đổi** (D11). Chỉ **value** (`'DTW'`/`'OTW'`) — một chi tiết hiển thị nội bộ của `media-engine`, không phải một phần của hợp đồng liên repo — có thể đổi theo Checkpoint C0.
- **Repo GitHub `hieuhn09/dtw-web` → `otw-web`**: GitHub duy trì một redirect vĩnh viễn cho cả web UI lẫn `git clone`/`git pull` qua URL cũ — không có consumer nào (CI, badge, script) trong `dtw-web` hardcode path cũ (đã xác nhận qua grep), nên đây không phải một breaking change cho bất kỳ automation nào trong chính repo này. Nếu có automation **bên ngoài** repo (ví dụ một webhook, một Vercel Git Integration trỏ theo full path) tham chiếu `hieuhn09/dtw-web`, đó là ngoài tầm quan sát của plan này — user nên tự kiểm tra Vercel/Deploy Hooks settings sau khi đổi tên.
- **Package scope `@dtw/*` (nếu Nhóm G kích hoạt)**: không phải một public contract ra bên ngoài (`"private": true"` trên cả 3 package, xác nhận ở tài liệu tham chiếu D6) — chỉ là internal workspace alias, an toàn đổi trong nội bộ monorepo.

## Blast Radius

| Mức rủi ro | Hạng mục |
|---|---|
| **High** | Nhóm E (xoá `/home/hieunc/Code/DTW` — one-way door thật, không có git history); F1 (đổi tên repo GitHub — ảnh hưởng mọi người có remote cũ, dù có redirect) |
| **Medium** | Nhóm A (site đang live khác, `wad-web`, có thể link ra domain 404 nếu làm trước Phase 6); Nhóm C nếu Checkpoint C0 chọn sai thời điểm (sửa `media-engine` trước khi build/deploy verify); Nhóm G nếu kích hoạt (breaking cho worktree khác) |
| **Low** | Nhóm B (comment code, zero runtime impact); Nhóm D (khả năng cao là dead code không live); F2/F3 (chỉ đổi remote URL local, dễ revert) |

---

## Verification Evidence

Repo `dtw-web` hiện gần như chưa có test tự động — theo `process/context/tests/all-tests.md`. Mọi lệnh `test`/`typecheck` dùng trong Verification Evidence bên dưới thuộc về các repo anh em (`wad-web`, `brief-asia-web`, `media-engine`), mỗi repo dùng `npm` với script `test`/`typecheck` riêng (đã xác nhận trong Pre-flight verification) — không phải một bộ test chung của `dtw-web`.

Chạy sau khi mỗi nhóm hoàn tất, dán output thật vào report — không suy luận "chắc là đúng".

**Nhóm A:**
```
command grep -n "DailyTechWire" /home/hieunc/Code/wad-web/src/lib/site-config.ts \
  /home/hieunc/Code/wad-web/BUSINESS.md /home/hieunc/Code/wad-web/REBUILD_PLAN.md \
  "/home/hieunc/Code/wad-web/src/app/(reader)/[locale]/advertise/page.tsx"
# kỳ vọng: 0 hit
cd /home/hieunc/Code/wad-web && npm run typecheck
```
Manual/external (sau khi `wad-web` tự deploy theo pipeline riêng của nó): mở footer thật trên `worldarchidesign.com` và xác nhận link "Opentechwire" trỏ đúng `https://www.opentechwire.com/` và không 404.

**Nhóm B:**
```
command grep -n "DTW" /home/hieunc/Code/brief-asia-web/src/app/globals.css \
  /home/hieunc/Code/brief-asia-web/src/lib/cms-client.ts \
  /home/hieunc/Code/brief-asia-web/src/lib/cms-client.central.ts \
  /home/hieunc/Code/brief-asia-web/BUSINESS.md
# kỳ vọng: 0 hit (nếu B5 cũng làm) hoặc chỉ còn 3 dòng BUSINESS.md (nếu B5 bị bỏ qua)
command grep -c "DTW" /home/hieunc/Code/brief-asia-web/DESIGN.md
# kỳ vọng: PHẢI VẪN LÀ 6 — nếu về 0 nghĩa là anti-pattern guard đã bị xoá nhầm, ROLLBACK NGAY
cd /home/hieunc/Code/brief-asia-web && npm run typecheck
```

**Nhóm C:**
```
command grep -n "'DTW'\|\bDTW:\|DTW\b" /home/hieunc/Code/media-engine/src/lib/types.ts \
  /home/hieunc/Code/media-engine/src/lib/config.ts \
  /home/hieunc/Code/media-engine/src/lib/hero-resolve/site-map.ts \
  /home/hieunc/Code/media-engine/src/lib/hero-resolve/mapping.test.ts \
  /home/hieunc/Code/media-engine/src/lib/engine/upload.ts \
  /home/hieunc/Code/media-engine/src/state/renderVals.ts \
  /home/hieunc/Code/media-engine/src/lib/seed.ts
# kỳ vọng: 0 hit về giá trị SiteCode 'DTW' (dòng "dtw:" ở site-map.ts vẫn còn — đó là KEY, đúng theo thiết kế, không phải sót)
cd /home/hieunc/Code/media-engine && npm run typecheck && npm test
# mapping.test.ts phải PASS với assertion mới (siteCodeOf('dtw')).toBe('OTW')
```
Nếu C-verify chạy: dán kết quả `SELECT count(*) FROM asset_usages WHERE site = 'DTW';` thật vào report.

**Nhóm D:** nếu D2 được chọn: `command grep -n "Daily Tech Wire" /home/hieunc/Code/APCG-web/assets/app.js` → kỳ vọng 0 hit. Nếu D1 (mặc định): không có lệnh nào — chỉ cần ghi note quyết định vào report.

**Nhóm E:** `ls /home/hieunc/Code/DTW` → kỳ vọng `No such file or directory` sau khi xoá. Xác nhận thủ công qua Vercel dashboard rằng project `dtw-frontend` đã decommission (agent không tự verify được).

**Nhóm F:**
```
gh repo view hieuhn09/otw-web --json name,url
git -C /home/hieunc/Code/dtw-web remote -v
curl -sI https://github.com/hieuhn09/dtw-web
# kỳ vọng: HTTP redirect (301/302) sang otw-web
```

**Nhóm G (nếu kích hoạt):**
```
command grep -rn "@dtw/" /home/hieunc/Code/dtw-web --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.turbo --exclude-dir=.git --exclude=pnpm-lock.yaml
# kỳ vọng: 0 hit TRỪ design-refresh-diff_14-06-26.json
pnpm install   # phải thành công, lockfile mới
turbo run typecheck   # phải sạch trên toàn monorepo
command grep -n "dtw_auth" /home/hieunc/Code/dtw-web/packages/db/scripts/copy-auth-to-central.ts
# kỳ vọng: chuỗi "dtw_auth" VẪN CÒN NGUYÊN — nếu mất, đã sed nhầm vào D12-frozen identifier, ROLLBACK NGAY
```

**Cổng chung cuối phase (chạy trên `dtw-web`, không tính `content-engine`/repo khác — phase này không chạm `dtw-web` trừ khi G kích hoạt):**
```
command grep -rniE 'dailytechwire|daily ?tech ?wire|\bdtw\b|@dtw/|Tech Intelligence, Wired Daily' /home/hieunc/Code/dtw-web \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=.turbo \
  --exclude-dir=dist --exclude='*.tsbuildinfo' --exclude=pnpm-lock.yaml --exclude-dir=data-exports
```
Nhắc lại 2 cảnh báo bắt buộc từ umbrella §6: (1) `grep` mặc định trong môi trường này là ugrep shim có `--ignore-files`/`-I` ngầm — các `--exclude*` ở trên là bắt buộc; (2) grep sạch không chứng minh xong việc — không có asset nhị phân nào trong Phase 7, nhưng nếu Nhóm G kích hoạt thì `tsc`/`pnpm install` là bằng chứng bắt buộc, không suy luận từ "build chắc là qua".

---

## Rollback

- **Nhóm A/B/C/D (nếu D2)/G**: `git revert` hoặc `git checkout -- <file>` trong đúng repo tương ứng — tất cả đều có version control, hoàn toàn reversible.
- **Nhóm E**: KHÔNG có rollback tự động sau E4 (`rm -rf`). Rollback duy nhất là khôi phục từ bản backup tar ở E2, nếu đã tạo. Nếu chưa tạo backup và đã xoá: không thể khôi phục — đây chính là lý do E1 (gate xác nhận) là bắt buộc trước E4, không phải một hình thức.
- **Nhóm F**: `gh repo rename dtw-web --repo hieuhn09/otw-web` (đổi tên ngược lại) + `git -C /home/hieunc/Code/dtw-web remote set-url origin https://github.com/hieuhn09/dtw-web.git`. Reversible, GitHub không giới hạn số lần đổi tên (dù có rate-limit hợp lý).

---

## Kích thước ước lượng

**SMALL** cho Nhóm A, B, D, E, F (tổng cộng ~10-12 dòng thay đổi thật trên toàn bộ cụm, cộng 2 hành động external qua GitHub/Vercel dashboard).
**SMALL-MEDIUM** cho Nhóm C (8-9 vị trí trong 1 repo, có test coverage sẵn).
**+MEDIUM riêng biệt** nếu Nhóm G được kích hoạt (41 file + lockfile regenerate, phải ship thành 1 commit atomic tách biệt, theo đúng D6/umbrella).

---

## Acceptance Criteria

1. Cả 4 vị trí trong `wad-web` (A1-A4) không còn `DailyTechWire`/`Daily Tech Wire`, thay bằng `Opentechwire` và URL `https://www.opentechwire.com/` — xác nhận qua grep VÀ (sau khi `wad-web` tự deploy) một lượt xem thật trên site live.
2. `brief-asia-web/src/app/globals.css`, `cms-client.ts`, `cms-client.central.ts` không còn `DTW` trong comment (nếu B1-B4 làm); `DESIGN.md` **vẫn còn nguyên 6 chỗ `DTW`** trong anti-pattern guard — grep xác nhận đúng số 6, không phải 0.
3. `media-engine` — nếu Checkpoint C0 chọn Phương án 1: `tsc --noEmit` sạch, `mapping.test.ts` pass với assertion `'OTW'`, không còn giá trị `SiteCode` nào là `'DTW'` (key `dtw` ở `SITE_BY_SLUG` vẫn còn, đúng thiết kế).
4. `APCG-web` — quyết định D0/D1/D2 được ghi rõ trong report kèm bằng chứng (title mismatch + 404 + redirect chain), không phải một dòng "đã xử lý" mơ hồ.
5. `/home/hieunc/Code/DTW` — có trạng thái rõ ràng và có xác nhận bằng văn bản của user dán trong report: hoặc đã xoá (kèm xác nhận Vercel project cũng đã decommission), hoặc còn tồn tại kèm README cảnh báo mới thêm.
6. Repo GitHub đã đổi tên (`gh repo view hieuhn09/otw-web` trả về hợp lệ) và remote local đã cập nhật (`git remote -v` trỏ `otw-web`); thư mục local `/home/hieunc/Code/dtw-web` không đổi tên (xác nhận bằng `pwd` không đổi).
7. Nếu Nhóm G không kích hoạt: ghi rõ trong report là "D6 vẫn hoãn có chủ đích, không phải bỏ sót" — không được để trống mục này.
8. Nếu Nhóm G kích hoạt: `command grep -rn "@dtw/"` trên `dtw-web` trả 0 hit (trừ `design-refresh-diff_14-06-26.json`), `pnpm install` + `turbo run typecheck` sạch, và `packages/db/scripts/copy-auth-to-central.ts` vẫn còn nguyên chuỗi `dtw_auth`.

---

## Resume and Execution Handoff

**Trạng thái hiện tại**: plan đã viết xong, chưa có bước nào được thực thi. Phase 7 phụ thuộc phần lớn vào Phase 6 (CUTOVER) đã `✅ VERIFIED` — Nhóm A cụ thể **không nên EXECUTE trước khi Phase 6 xong**, dù các nhóm khác (B, D, F, và E sau khi xin xác nhận) có thể chạy sớm hơn nếu user muốn dọn estate song song trong lúc chờ Phase 1-5.

**Hành động tiếp theo đúng đắn theo RIPER-5/phase-programs.md**: trước khi EXECUTE bất kỳ nhóm nào trong phase này, chạy lại bước "Research subagent" của per-phase loop (§ phase-programs.md) để xác nhận:
1. Phase 6 đã `✅ VERIFIED` chưa (nếu chưa, hoãn riêng Nhóm A).
2. Ba checkpoint C0/D0/E0 đã có câu trả lời của user chưa — **không EXECUTE các nhóm tương ứng nếu chưa có**.
3. G0 — có yêu cầu tường minh kích hoạt D6 không.

**Quy tắc cho agent nhận EXECUTE**:
1. Đọc umbrella plan trước để lấy ledger D1-D15 — không bàn lại.
2. Đọc đúng plan này để lấy checklist theo nhóm.
3. Xử lý từng nhóm độc lập theo dependency đã nêu — không nhất thiết phải làm A→G theo thứ tự, vì các nhóm không phụ thuộc lẫn nhau (trừ nội bộ mỗi nhóm).
4. Với mỗi nhóm đã EXECUTE, chạy đúng Verification Evidence tương ứng và dán output thật vào report tại `process/features/rebrand/reports/phase-7-estate-cleanup_REPORT_<dd-mm-yy>.md`.
5. Sau khi TẤT CẢ các nhóm trong phạm vi (trừ G nếu không kích hoạt) đã `✅ VERIFIED`, cập nhật umbrella plan's dependency table (đã có sẵn ở umbrella, dòng "7 — Estate cleanup") để phản ánh trạng thái mới.
6. Route qua UPDATE PROCESS sau khi phase này đóng, để cập nhật `process/context/all-context.md`'s Feature Folder Index nếu có thay đổi cấu trúc, và để archive phase report.

**Validator cho chính phase plan này**:
```
node .claude/skills/vc-generate-plan/scripts/validate-plan-artifact.mjs process/features/rebrand/active/phase-7-estate-cleanup_PLAN_08-09-26.md
```

*Phase plan hoàn thành 08-09-26 (verification bổ sung 09-09-26). Không có dòng code nào đã bị sửa trong bất kỳ repo nào. Trạng thái: PLANNED.*
