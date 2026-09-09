# Rebrand Phase 2 — Generator và Canonical Host Config

**Date**: 08-09-26 (viết thực tế 09-09-26, đồng bộ số ngày với umbrella plan)
**Complexity**: SIMPLE — một luồng execute, không phải phase program con
**Feature**: `rebrand`
**Plan file**: `process/features/rebrand/active/phase-2-generators-and-config_PLAN_08-09-26.md`
**Umbrella plan (đọc trước, ledger D1-D15 nằm ở đây)**: `process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md`
**Tài liệu nghiên cứu nền**: `process/general-plans/references/rebrand-opentechwire_REFERENCE_08-09-26.md` (752 dòng — §3.2 và §3.4 là nguồn của bảng blast radius dùng trong phase này)
**Status**: ⏳ PLANNED — chưa sửa dòng code nào

---

## Quick Links

- [Overview](#overview)
- [Phạm vi](#phạm-vi)
- [Tiền đề / Dependency](#tiền-đề--dependency)
- [Phase Completion Rules](#phase-completion-rules)
- [Phát hiện xác minh được trong lúc viết PLAN](#phát-hiện-xác-minh-được-trong-lúc-viết-plan-không-có-sẵn-trong-tài-liệu-tham-chiếu)
- [Implementation Checklist](#implementation-checklist)
- [Danh sách KHÔNG được động trong các file đang sửa](#danh-sách-không-được-động-trong-các-file-đang-sửa)
- [Touchpoints](#touchpoints)
- [Public Contracts](#public-contracts)
- [Blast Radius](#blast-radius)
- [Verification Evidence](#verification-evidence)
- [Rollback](#rollback)
- [Risks and Mitigations](#risks-and-mitigations)
- [Acceptance Criteria](#acceptance-criteria)
- [Resume and Execution Handoff](#resume-and-execution-handoff)

---

## Overview

Phase này cố định **canonical host** (`https://www.opentechwire.com`, theo D3/D5 trong ledger umbrella) ở 4 vị trí trong code/config/doc, và xác nhận bằng thực nghiệm hành vi cache-hash của Turborepo với biến `NEXT_PUBLIC_SITE_URL`. Đây là phase "ship an toàn trước domain flip" — mọi thay đổi trong phase này **không có hiệu lực chức năng thật** cho tới khi domain `opentechwire.com` được gắn vào Vercel project ở Phase 6 (CUTOVER). Toàn bộ thay đổi reversible bằng git.

Theo hệ quả D4 (đã ghi trong umbrella §4), phase này **không** ghim Atom tag authority vào host cũ và **không** thêm/sửa bất kỳ rule redirect nào đưa traffic từ `dailytechwire.com` sang `opentechwire.com`.

## Phạm vi

**Trong phạm vi (4 file + 1 xác minh thực nghiệm):**

1. `apps/web/src/lib/metadata.ts` — dòng 26, 30 (comment)
2. `apps/web/next.config.ts` — dòng 37-46 (thêm rule mới, xem lý do ở mục 3 của checklist — **không sửa/xoá rule cũ**)
3. `apps/web/.env.example` — BOM UTF-8, mojibake em-dash, dòng 12 (comment apex)
4. `turbo.json` — mảng `env` của task `build` (dòng 8-23)
5. `process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md` — 4 vị trí (dòng ~160, ~511, ~901, ~1037-1038)
6. **(bổ sung 09-09-26, umbrella §6b.1)** Text placeholder không phase nào nhận, sửa lúc đang mở đúng các file này: `.env.example` (root) dòng 1 (`# DTW dev environment template.`), 7 (`dtw-dev`), 13-14 (`/dtw?sslmode=require` ×2); `apps/web/.env.example` dòng 1 và 17 (cùng dạng placeholder); `.gitignore` dòng 33 (comment `# …not part of DTW (~14MB)`). Đây thuần là chữ trong comment/placeholder, không có consumer runtime nào — nhưng nếu không gán chủ ở đây thì chúng rơi ra ngoài cả 8 phase.

**Ngoài phạm vi (trỏ rõ sang phase khác):**

- `apps/web/src/lib/feed.ts:61,69,116` (Atom tag authority + author fallback) — **không đụng**, theo hệ quả D4 đã ghi trong umbrella §4 mục 1. Dùng thẳng host mới khi origin đổi ở Phase 6, không pin bất cứ thứ gì bây giờ.
- Rule redirect host **cũ** `dailytechwire.com` → `www.dailytechwire.com` trong `apps/web/next.config.ts:40-45` — **giữ nguyên, không sửa, không xoá** trong phase này. Việc gỡ bỏ nó thuộc Phase 6 (xem lý do chi tiết ở mục 3 của checklist — đây là một phát hiện quan trọng phát sinh trong lúc viết PLAN).
- Mọi occurrence brand khác trong `apps/web/src/lib/metadata.ts` (dòng 69 `alt`, 90-91 `sameAs`, 101 comment, 153/163 `siteName`, 178 feed title) — thuộc Phase 4 (display copy) và Phase 6 (`sameAs` phải đợi social profile đổi tên trước). Đã xác minh bằng `grep` rằng đây là TOÀN BỘ danh sách occurrence trong file (8 dòng, không phải 2) — xem mục "Danh sách KHÔNG được động" bên dưới.
- `apps/web/.env.example:51` (`RESEND_FROM_DOMAIN="dailytechwire.com"`) và `.env.example:52` (root, cùng biến) — thuộc Phase 6, phụ thuộc Resend domain verification (Phase 1). **Không sửa trong phase này dù cùng file đang được mở.**
- `apps/web/.env.example:62-63` (`DTW_INTAKE_TOKEN`) — tên biến đóng băng theo cảnh báo bổ sung ở umbrella §5.2. Không đổi tên, không đổi comment.
- `apps/web/scripts/generate-og-default.mjs` — thuộc Phase 3 (brand mark). Umbrella có nhắc "chuẩn bị" file này ở Phase 2 nhưng nhiệm vụ cụ thể của phase này (do orchestrator giao) không yêu cầu chạm vào nó — để nguyên, Phase 3 tự lo.
- `turbo.json`: `NEXT_PUBLIC_GA_ID`, `CMS_SOURCE` cũng vắng mặt khỏi mảng `env` (xác nhận bằng thực nghiệm — xem mục phát hiện bổ sung). Đây là gap có thật nhưng **không liên quan tới rebrand** (GA property và CMS source flag không mang brand). Không sửa trong phase này — ghi lại làm backlog item riêng cho một pass hygiene khác.
- `process/context/all-context.md` và các invariant #7/#11/#14 — thuộc Phase 0 (đã có dependency ở mục dưới).

## Tiền đề / Dependency

- **Phụ thuộc Phase 0** (theo umbrella §"Bảng dependency giữa các phase": `2 — Canonical host | Chặn bởi: 0`). Trước khi bắt đầu EXECUTE cho phase này, xác nhận Phase 0 đã đạt trạng thái tối thiểu `🔨 CODE DONE` (lý tưởng là `✅ VERIFIED`) bằng cách đọc report tại `process/features/rebrand/reports/phase-0-lock-decisions_REPORT_*.md`. Nếu report chưa tồn tại hoặc Phase 0 chưa chạy, **dừng lại và hỏi user** — đừng tự chạy Phase 2 trước Phase 0 chỉ vì phase này về mặt kỹ thuật không đụng file nào Phase 0 đụng.
- Độc lập với Phase 1 (việc ngoài repo) — có thể chạy song song.
- Không phụ thuộc Phase 3/4/5.
- **Chặn Phase 6** (canonical phải đúng trong code trước khi domain thật được gắn).

## Phase Completion Rules

Áp dụng nguyên văn theo umbrella (mượn từ `process/development-protocols/phase-programs.md`). Phase này KHÔNG được coi là xong cho tới khi:

1. **Integration Test** — `pnpm turbo run typecheck` xanh; `pnpm turbo build --dry=json --filter=web` cho thấy `NEXT_PUBLIC_SITE_URL` đã nằm trong `env` đã cấu hình của task `web#build`.
2. **Manual Test** — không áp dụng theo nghĩa "user thao tác trên UI" (phase này không có UI); thay vào đó là mở tay 5 file đã sửa để xác nhận nội dung đúng như checklist mô tả (không phải asset nhị phân, nhưng vẫn cần một lượt đọc bằng mắt cho các dòng comment/doc).
3. **Regression check** — chạy lại lệnh grep chuẩn ở `apps/web/next.config.ts` và xác nhận rule redirect host **cũ** (`dailytechwire.com` → `www.dailytechwire.com`) vẫn còn nguyên vẹn, chưa bị xoá/sửa.
4. **Error path** — nếu Phase 0 chưa xong (kiểm tra ở mục Tiền đề), hành vi đúng là DỪNG và hỏi user, không tự động tiếp tục.
5. **User Confirmation** — user đã xem report (bao gồm output các lệnh verification thật) và xác nhận trước khi phase được đánh dấu `✅ VERIFIED`. Không có xác nhận này, trạng thái cao nhất được phép là `🧪 TESTING`.

Marker: `⏳ PLANNED` · `🔨 CODE DONE` · `🧪 TESTING` · `✅ VERIFIED` · `🚧 BLOCKED`.

**Test Procedure / test context**: phase này không chạm package nào có test suite tự động (theo `process/context/tests/all-tests.md`, repo `dtw-web` hiện gần như chưa có test tự động cho `apps/web`). Test Procedure của phase này là hoàn toàn manual + lệnh grep/build xác định (liệt kê đầy đủ ở mục Verification Evidence) — không có bước `pnpm test`/`vitest` nào áp dụng cho 5 file bị chạm. Nếu một phase sau này của chương trình rebrand bổ sung test tự động, tham chiếu lại `process/context/tests/all-tests.md` để chọn runner nhất quán.

---

## Phát hiện xác minh được trong lúc viết PLAN (không có sẵn trong tài liệu tham chiếu)

Các mục dưới đây được xác minh bằng cách đọc file thật + chạy lệnh thật trong phiên PLAN này (không phải suy luận), và làm thay đổi cách thực thi so với một cách đọc literal của tài liệu tham chiếu §3.2/§3.4:

1. **Unknown #15 của tài liệu tham chiếu (§8) nay đã giải quyết bằng thực nghiệm.** Chạy `pnpm turbo build --dry=json --filter=web` (branch `main`, HEAD `c123964`) cho kết quả: task `web#build` có `"framework": "nextjs"` (nhận diện đúng) nhưng `"environmentVariables": { "inferred": [] }` — **mảng rỗng**. Framework inference của Turborepo **không** tự động bao `NEXT_PUBLIC_SITE_URL` vào hash key. Kết luận: bước "thêm `NEXT_PUBLIC_SITE_URL` vào `env` array" là **bắt buộc**, không còn là "verify rồi mới quyết định."
2. **Vercel gần như chắc chắn KHÔNG build qua `turbo build`.** `apps/web/vercel.json` tồn tại (không phải một `vercel.json` ở root repo), và `apps/web/package.json:9` có `"vercel-build": "node scripts/migrate-prod.mjs && next build"` — gọi `next build` **trực tiếp**, không qua `turbo`. Điều này ngụ ý Vercel Project's Root Directory setting là `apps/web` (quy ước Vercel: `vercel.json` sống ở root directory được cấu hình). **Chưa xác nhận được qua Vercel dashboard thật** (PLAN mode không truy cập được) — đây là suy luận có cơ sở từ cấu trúc repo, ghi lại như một ẩn số mới, không phải sự thật đã kiểm chứng 100%.
   - **Hệ quả về mức rủi ro**: nếu suy luận trên đúng, việc thiếu `NEXT_PUBLIC_SITE_URL` trong `turbo.json` **không** phải là rủi ro production (Vercel không đi qua turbo's `envMode: "strict"` khi build app thật) — nó chỉ ảnh hưởng tới **local dev/CI cache correctness** (một `pnpm build` ở root có thể tái dùng `.next` cache cũ nếu giá trị `NEXT_PUBLIC_SITE_URL` đổi mà không có file nào đổi). Điều này khớp với việc tài liệu tham chiếu tự xếp hạng mục này là **"med"**, không phải "high" — không cần nâng cấp mức độ khẩn cấp, nhưng vẫn nên sửa vì đây đúng là gap có thật.
   - `.github/workflows/ci.yml:41-42` chỉ chạy `pnpm turbo run typecheck`, **không** chạy `turbo build` — nên CI cũng không bị ảnh hưởng bởi gap này.
3. **`apps/web/next.config.ts:40-45`'s rule redirect host hiện tại (`dailytechwire.com` → `www.dailytechwire.com`) vẫn đang phục vụ production thật, sống tới tận Phase 6.** Đọc literal chỉ thị "sửa next.config.ts:38-45" theo kiểu ghi đè giá trị `dailytechwire.com` → `opentechwire.com` **sẽ phá vỡ hành vi canonicalize apex→www của domain hiện đang chạy** trong suốt thời gian Phase 2-5 (domain cũ vẫn live, D4 chỉ cắt đứt nó ở Phase 6). Quyết định thực thi: **thêm một rule MỚI** cho domain `opentechwire.com` (apex→www của domain mới), **giữ nguyên rule cũ** cho tới khi Phase 6 gỡ bỏ nó như một phần của việc decommission domain cũ. Rule mới là additive/dormant — không có traffic nào khớp `host: opentechwire.com` cho tới khi domain được gắn vào Vercel ở Phase 6, nên không có rủi ro production nào từ việc thêm nó sớm. Đây **không phải** một redirect từ host cũ sang host mới (bị cấm bởi D4) — nó là canonicalize apex→www **trong cùng một domain mới**, y hệt cấu trúc rule cũ đang có cho domain cũ. **Đã được umbrella xác nhận chính thức 09-09-26**: umbrella §4 mục 2 nay ghi rõ điều cấm chỉ áp dụng cho redirect **xuyên domain**, và trạng thái đích sau Phase 6 là `next.config.ts` còn **đúng một** host rule, trỏ `opentechwire.com` → `www.opentechwire.com`.
4. **Root `.env.example` (tại gốc repo, khác `apps/web/.env.example`) không có nhánh cần sửa trong phase này.** Đọc toàn bộ 104 dòng: occurrence brand duy nhất là `RESEND_FROM_DOMAIN="dailytechwire.com"` ở dòng 52 — thuộc Phase 6 (như đã liệt ở "Ngoài phạm vi"). File này **không** chứa `NEXT_PUBLIC_SITE_URL`, không có BOM, không có mojibake (`diff .env.example apps/web/.env.example` xác nhận `apps/web/.env.example` có BOM `EF BB BF` ở byte đầu còn root thì không, và root dùng em-dash Unicode thật `—` còn `apps/web/.env.example` dùng mojibake `â€”`). Hai file có nội dung lệch nhau đáng kể (root mới hơn, có `SEED_ADMIN_EMAIL`, `NEXT_PUBLIC_GOOGLE_ENABLED`, v.v. mà bản `apps/web/` không có) — đây là hai template độc lập, không phải bản sao lệch pha cần đồng bộ trong phạm vi phase này.
5. **Mojibake thực tế chỉ ở 6 dòng, không phải 7.** Tài liệu tham chiếu (dòng 265) ghi "9, 10, 11, 22, 38, 49, 69" nhưng `command grep -n "â€”" apps/web/.env.example` chỉ trả về **9, 10, 11, 22, 38, 69** — dòng 49 hiện tại (`# Sign up at resend.com; in dev you can leave blank and magic-link emails log to console.`) không chứa ký tự mojibake nào. Đây là một sai lệch nhỏ so với tài liệu tham chiếu — không sửa dòng 49 vì không có gì để sửa ở đó.
6. **`grep` mặc định trong Bash tool của môi trường này đã được xác nhận trực tiếp là ugrep shim** (một hàm shell wrap quanh binary Claude Code, tự thêm `-G --ignore-files --hidden -I --exclude-dir=.git ...`). Cảnh báo #1 ở umbrella §6 không phải lý thuyết — nó đúng 100% trong môi trường thực thi này. Mọi lệnh verification trong phase này dùng `command grep` để bypass shim, đảm bảo tái lập được.
7. **`apps/web/src/middleware.ts:22`** xác nhận đúng dòng comment tài liệu tham chiếu trích: *"those redirects (including the apex->www host rule) run before middleware, so the 410 below always lands on the canonical www hop."* Comment này không chứa literal domain nào — không cần sửa, nhưng đây là một điểm regression-check bắt buộc (mục 3 dưới verification): thứ tự `redirects()` chạy trước `middleware()` là hành vi framework Next.js, không phụ thuộc thứ tự phần tử trong mảng `redirects()`; việc thêm rule mới vào cuối mảng không ảnh hưởng gì tới giả định này.

---

## Implementation Checklist

Mỗi bước là một đơn vị atomic, độc lập verify được. Thực hiện theo đúng thứ tự (bước 1 là gate bắt buộc).

### 1. Xác nhận tiền đề Phase 0

- Đọc `process/features/rebrand/reports/` tìm report Phase 0 (`phase-0-lock-decisions_REPORT_*.md`).
- Nếu không tồn tại hoặc trạng thái không phải `🔨 CODE DONE`/`✅ VERIFIED`: **dừng**, báo user, không tiếp tục các bước dưới.
- Nếu tồn tại và đạt: tiếp tục bước 2.

### 2. `apps/web/src/lib/metadata.ts` — dòng 26, 30

Nội dung hiện tại (đã xác nhận bằng Read, không drift so với tài liệu tham chiếu):

```
Dòng 26: * default). Production sets `NEXT_PUBLIC_SITE_URL=https://www.dailytechwire.com`
Dòng 30: * (dailytechwire.com) to www. Pointing this at the apex would make every
```

Sửa thành:

```
Dòng 26: * default). Production sets `NEXT_PUBLIC_SITE_URL=https://www.opentechwire.com`
Dòng 30: * (opentechwire.com) to www. Pointing this at the apex would make every
```

Chỉ thay chuỗi domain (`dailytechwire.com` → `opentechwire.com`), giữ nguyên `www.` prefix ở dòng 26 (đã đúng theo D5 từ trước, không phải lỗi apex — đây thuần là brand rename). Không đụng dòng 69, 90-91, 101, 153, 163, 178 trong cùng file (thuộc Phase 4/6, xem "Danh sách KHÔNG được động").

Đây là comment/docblock — **không có hiệu lực runtime**. An toàn tuyệt đối để sửa trước khi domain thật đổi, vì giá trị mô tả trong comment là giá trị SẼ được set ở Phase 6, không phải giá trị đang chạy hôm nay.

### 3. `apps/web/next.config.ts` — thêm rule mới cho domain mới (KHÔNG sửa/xoá rule cũ)

Nội dung hiện tại quanh dòng 37-46 (đã xác nhận bằng Read):

```
      // Canonical host is www (matches NEXT_PUBLIC_SITE_URL, which the sitemap,
      // robots, canonical tags and OG urls are all built from). Send the bare
      // apex to www so the two hosts don't compete in the index.
      {
        source: "/:path*",
        has: [{ type: "host", value: "dailytechwire.com" }],
        destination: "https://www.dailytechwire.com/:path*",
        permanent: true,
      },
    ];
  },
```

**Giữ nguyên toàn bộ khối trên.** Thêm một object rule mới ngay sau nó, trước dấu đóng `];`:

```
      // Same apex->www canonicalization, for the new domain ahead of the
      // rebrand cutover (process/features/rebrand/). Dormant until
      // opentechwire.com is attached to this Vercel project in Phase 6 — no
      // request can arrive with this Host header before then. The
      // dailytechwire.com rule above is intentionally left in place until
      // Phase 6 decommissions that domain (see D4 in the rebrand umbrella
      // plan — this is NOT a redirect from the old domain to the new one).
      {
        source: "/:path*",
        has: [{ type: "host", value: "opentechwire.com" }],
        destination: "https://www.opentechwire.com/:path*",
        permanent: true,
      },
    ];
  },
```

Lý do KHÔNG sửa/xoá rule cũ ở bước này: xem mục "Phát hiện xác minh được trong lúc viết PLAN" #3 — domain `dailytechwire.com` vẫn đang live tới hết Phase 5, xoá/sửa rule này bây giờ sẽ làm hỏng việc canonicalize apex→www của domain đang chạy thật (regression production thật, không phải lý thuyết).

Việc gỡ bỏ rule cũ này là công việc của **Phase 6** (khi domain cũ được decommission theo D4) — ghi rõ vào report Phase 2 để Phase 6 không bỏ sót bước này (umbrella's Definition of Done mục 6 yêu cầu "Không còn bất kỳ redirect rule nào theo host cũ" ở cuối chương trình — Phase 6 là nơi thực hiện điều đó).

Không đụng comment ở dòng 29-36 (không chứa literal domain) và toàn bộ phần path-based rules ở dòng 19-28 (không liên quan brand).

### 4. `apps/web/.env.example` (app-level, KHÔNG phải root `.env.example`)

File này có 74 dòng, có BOM UTF-8 ở đầu file và 6 dòng mojibake — cả hai đều do commit `947971d` gây ra (đã xác nhận qua `git log`).

**4a. Xoá BOM UTF-8.** Byte đầu tiên hiện tại là `EF BB BF` (xác nhận bằng `xxd`). Nếu EXECUTE dùng Write tool để ghi lại toàn bộ nội dung file (khuyến nghị, vì đang sửa nhiều dòng trong cùng file), BOM biến mất tự động vì Write tool ghi UTF-8 sạch không BOM. Nếu dùng Edit theo từng dòng riêng lẻ, phải xử lý BOM bằng một bước riêng (ví dụ `sed -i '1s/^\xEF\xBB\xBF//' apps/web/.env.example`) vì Edit tool không tự động strip BOM nếu dòng 1 không nằm trong đoạn diff.

**4b. Xoá mojibake em-dash ở đúng 6 dòng: 9, 10, 11, 22, 38, 69.** Thay ký tự `â€”` (mojibake của em-dash bị double-encode) bằng `—` (em-dash Unicode thật, U+2014) ở các dòng:
- Dòng 9: `#   1. NEXT_PUBLIC_SITE_URL   â€” explicit; set this in dev and in Vercel prod` → `#   1. NEXT_PUBLIC_SITE_URL   — explicit; set this in dev and in Vercel prod`
- Dòng 10: `#   2. https://${VERCEL_URL} â€” automatic on Vercel preview deploys` → `#   2. https://${VERCEL_URL} — automatic on Vercel preview deploys`
- Dòng 11: `#   3. http://localhost:3000 â€” dev default when unset` → `#   3. http://localhost:3000 — dev default when unset`
- Dòng 22: `# Production uses a separate Neon project / Supabase / etc â€” decided at deploy time.` → `# Production uses a separate Neon project / Supabase / etc — decided at deploy time.`
- Dòng 38: `# OAuth â€” leave empty in dev; Better-Auth will only enable providers with creds.` → `# OAuth — leave empty in dev; Better-Auth will only enable providers with creds.`
- Dòng 69: `# admin or copy from the seed output â€” do NOT commit a real value here.` → `# admin or copy from the seed output — do NOT commit a real value here.`

**Không sửa dòng 49** — đã xác minh không chứa mojibake (xem phát hiện bổ sung #5).

**4c. Sửa dòng 12 (comment apex).** `# Production value: https://dailytechwire.com` → `# Production value: https://www.opentechwire.com`. Đây cũng đồng thời sửa lỗi apex→www đã lệch chuẩn từ trước (D5) và brand rename (D3) trong cùng một sửa. Dòng 13 (`NEXT_PUBLIC_SITE_URL=http://localhost:3000`, giá trị dev thật) **không đổi** — vẫn là localhost.

**Không đụng dòng 51** (`RESEND_FROM_DOMAIN="dailytechwire.com"`) và **không đụng dòng 62-63** (`DTW_INTAKE_TOKEN`) — xem "Ngoài phạm vi".

### 5. `turbo.json` — thêm `NEXT_PUBLIC_SITE_URL` vào mảng `env` của task `build`

Nội dung hiện tại (dòng 8-23, đã xác nhận bằng Read, đúng dòng theo tài liệu tham chiếu):

```json
      "env": [
        "DATABASE_URL",
        "PAYLOAD_SECRET",
        "R2_BUCKET",
        "R2_ENDPOINT",
        "R2_ACCESS_KEY_ID",
        "R2_SECRET_ACCESS_KEY",
        "BETTER_AUTH_SECRET",
        "BETTER_AUTH_URL",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "GITHUB_CLIENT_ID",
        "GITHUB_CLIENT_SECRET",
        "RESEND_API_KEY",
        "RESEND_FROM_DOMAIN"
      ]
```

Thêm `"NEXT_PUBLIC_SITE_URL"` vào mảng (vị trí bất kỳ, JSON không có comment nên không cần group riêng — thêm ở cuối là đơn giản nhất):

```json
      "env": [
        "DATABASE_URL",
        "PAYLOAD_SECRET",
        "R2_BUCKET",
        "R2_ENDPOINT",
        "R2_ACCESS_KEY_ID",
        "R2_SECRET_ACCESS_KEY",
        "BETTER_AUTH_SECRET",
        "BETTER_AUTH_URL",
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "GITHUB_CLIENT_ID",
        "GITHUB_CLIENT_SECRET",
        "RESEND_API_KEY",
        "RESEND_FROM_DOMAIN",
        "NEXT_PUBLIC_SITE_URL"
      ]
```

**Không** thêm `NEXT_PUBLIC_GA_ID` hay `CMS_SOURCE` trong bước này dù cả hai cũng đang vắng mặt (xác nhận bằng thực nghiệm) — hai biến đó không mang brand, không thuộc phạm vi rebrand, ghi lại làm backlog riêng (xem "Ngoài phạm vi").

Lý do bắt buộc (không còn là "hoặc chứng minh inference đã phủ" — đã chứng minh KHÔNG phủ, xem phát hiện #1): `environmentVariables.inferred` rỗng dù `framework: "nextjs"` được nhận diện đúng.

### 6. `process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md` — 4 vị trí

**Bước đầu tiên (bắt buộc trước khi sửa)**: chạy `command grep -n -i "supersed" process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md`. Việc gắn banner "superseded-by" + đổi `Status` cho TOÀN BỘ file này thuộc **Phase 0**, không phải Phase 2 — nếu banner đã tồn tại, bước dưới đây vẫn thực hiện bình thường (sửa nội dung kỹ thuật là việc độc lập với banner). Nếu banner CHƯA tồn tại (Phase 0 chưa xong việc này), Phase 2 **vẫn được phép** thực hiện 4 sửa đổi hẹp dưới đây (đây là sửa lỗi kỹ thuật D5 độc lập với việc đánh dấu superseded), nhưng **không tự ý thêm banner/đổi Status thay cho Phase 0** — đó không thuộc phạm vi phase này.

4 vị trí (đã xác nhận bằng Read, khớp chính xác với tài liệu tham chiếu, không drift):

- **Dòng 160**: `3. **Production origin** for \`NEXT_PUBLIC_SITE_URL\` = \`https://dailytechwire.com\`` → `3. **Production origin** for \`NEXT_PUBLIC_SITE_URL\` = \`https://www.opentechwire.com\` (cập nhật theo ledger rebrand D3/D5 — xem process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md; giá trị này có hiệu lực trên Vercel sau Phase 6 của chương trình rebrand, không phải ngay bây giờ)`
- **Dòng 161**: `(matches the existing DKIM/email domain precedent in \`lib/email.ts:12\`).` — **giữ nguyên, không đổi** (RESEND_FROM_DOMAIN cũng đổi theo cùng ledger ở Phase 6, nên câu này vẫn đúng ở trạng thái cuối cùng, chỉ không đúng trong giai đoạn giữa Phase 2-5 — không cần chú thích thêm vì đây không phải giá trị runtime).
- **Dòng 511**: `the production value is \`https://dailytechwire.com\`.` → `the production value is \`https://www.opentechwire.com\` (theo ledger rebrand D3/D5).`
- **Dòng 901**: `` `NEXT_PUBLIC_SITE_URL=https://dailytechwire.com` in the Vercel production `` → `` `NEXT_PUBLIC_SITE_URL=https://www.opentechwire.com` in the Vercel production `` (không đổi phần còn lại của câu)
- **Dòng 1037-1038**: `set \`NEXT_PUBLIC_SITE_URL=https://\ndailytechwire.com\` in Vercel's production environment variables before` → `set \`NEXT_PUBLIC_SITE_URL=https://\nwww.opentechwire.com\` in Vercel's production environment variables before`

File này là một plan doc đang `active/` (chưa archive) — sửa nội dung kỹ thuật cho đúng không vi phạm nguyên tắc "không rewrite lịch sử" của `plan-lifecycle.md` (nguyên tắc đó áp dụng cho artifact đã `completed/`/archive, không áp dụng cho việc sửa một plan còn active để nó không dẫn EXECUTE tương lai đi sai).

### 7. Chạy cổng verification tổng hợp

Xem mục [Verification Evidence](#verification-evidence) bên dưới — chạy toàn bộ các lệnh liệt kê ở đó, dán output thật vào report.

### 8. Viết report Phase 2

Tạo `process/features/rebrand/reports/phase-2-generators-and-config_REPORT_<dd-mm-yy>.md` (ngày thật lúc EXECUTE chạy), dán đầy đủ output các lệnh verification, đánh dấu trạng thái theo đúng Phase Completion Rules ở trên (`🔨 CODE DONE` sau khi code xong, `🧪 TESTING` sau khi chạy verification, `✅ VERIFIED` chỉ sau khi user xem report và xác nhận).

---

## Danh sách KHÔNG được động trong các file đang sửa

Để tránh một agent EXECUTE "tiện tay" sửa luôn khi đã mở file:

| File | Dòng | Nội dung | Lý do đóng băng/hoãn |
|---|---|---|---|
| `apps/web/src/lib/metadata.ts` | 69 | `alt: "DailyTechWire – Tech Intelligence, Wired Daily"` | Phase 4 (display copy + D8 tagline) |
| `apps/web/src/lib/metadata.ts` | 90-91 | `sameAs: [linkedin.com/company/dailytechwire/, facebook.com/apcgdailytechwire/]` | Phase 6 — chỉ đổi sau khi social profile đã đổi tên thật |
| `apps/web/src/lib/metadata.ts` | 101 | comment trích `%s – DailyTechWire` | Phase 4 |
| `apps/web/src/lib/metadata.ts` | 153, 163 | `siteName: "DailyTechWire"` ×2 | Phase 4 |
| `apps/web/src/lib/metadata.ts` | 178 | `{ url: "/rss.xml", title: "DailyTechWire" }` | Phase 4 |
| `apps/web/next.config.ts` | 40-45 | rule redirect host cũ `dailytechwire.com` → `www.dailytechwire.com` | Phase 6 (decommission domain cũ) — xem phát hiện #3 |
| `apps/web/src/lib/feed.ts` | 61, 69, 116 | Atom tag authority ghim theo host, author fallback | Hệ quả D4 — dùng thẳng host mới ở Phase 6, không pin bây giờ |
| `apps/web/.env.example` | 51 | `RESEND_FROM_DOMAIN="dailytechwire.com"` | Phase 6, phụ thuộc Resend verification (Phase 1) |
| `apps/web/.env.example` | 62-63 | `DTW_INTAKE_TOKEN=""` + comment | Tên biến đóng băng (umbrella §5.2, cảnh báo bổ sung) |
| `.env.example` (root) | 52 | `RESEND_FROM_DOMAIN="dailytechwire.com"` | Phase 6 — file khác, cùng lý do |
| `turbo.json` | — | `NEXT_PUBLIC_GA_ID`, `CMS_SOURCE` (vắng mặt, không thêm) | Không mang brand, ngoài phạm vi rebrand |
| `packages/db/src/schema/auth.ts:24` và mọi migration `dtw_auth` | — | — | D12 — đóng băng vĩnh viễn, không liên quan gì tới phase này nhưng ghi lại để nhắc |

---

## Touchpoints

- `apps/web/src/lib/metadata.ts` (comment only, 2 dòng)
- `apps/web/next.config.ts` (thêm 1 object rule mới, ~9 dòng bao gồm comment)
- `apps/web/.env.example` (BOM strip + 6 dòng mojibake + 1 dòng domain)
- `turbo.json` (1 phần tử mảng mới)
- `process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md` (4 cụm text, ~4-6 dòng)

Không chạm: application logic runtime nào khác, không schema, không migration, không route handler, không Payload collection, không CI workflow file, không package.json/lockfile.

## Public Contracts

- Không có contract bên ngoài nào bị đổi ở phase này. `siteOrigin()`'s fallback logic (`apps/web/src/lib/metadata.ts:33-37`) **không đổi hành vi** — chỉ đổi text trong comment mô tả nó.
- Rule mới trong `next.config.ts` là một **bổ sung** vào contract redirect hiện có (`redirects()` trả về mảng dài hơn 1 phần tử) — không có consumer nào phụ thuộc vào độ dài mảng này, an toàn.
- `turbo.json`'s `env` array: thêm 1 phần tử làm thay đổi **build cache hash** của mọi task `build` trong monorepo (không chỉ `web`) — lần chạy `pnpm build`/`pnpm turbo build` đầu tiên sau thay đổi này sẽ là cache MISS toàn bộ (build lại từ đầu), không phải lỗi, chỉ là chi phí một lần.

## Blast Radius

Nhỏ, có chủ đích thu hẹp so với cách đọc literal "sửa canonical host ở next.config.ts":

- **High risk (nếu làm sai)**: sửa/xoá rule redirect host cũ trong `next.config.ts` trước Phase 6 — đây là lý do phase này chọn cách **additive-only** cho file đó (xem phát hiện #3). Nếu EXECUTE vô tình xoá/sửa rule cũ, domain `dailytechwire.com` hiện đang live sẽ ngừng canonicalize apex→www ngay lập tức — production regression thật, không phải lý thuyết.
- **Medium risk**: comment sai trong `metadata.ts`/`.env.example` nếu gõ nhầm domain — không có hiệu lực runtime nhưng gây hiểu nhầm cho người đọc sau.
- **Low risk**: `turbo.json` — tệ nhất là build cache MISS một lần, không mất dữ liệu, không ảnh hưởng Vercel production (theo phát hiện #2).
- **Low risk**: sửa doc `per-page-seo-metadata_PLAN_16-07-26.md` — thuần văn bản, git-reversible.

## Verification Evidence

Chạy đúng các lệnh sau (dùng `command grep` để bypass ugrep shim đã xác nhận tồn tại trong môi trường này — xem phát hiện #6). Dán FULL output vào report Phase 2, không chỉ dán câu lệnh.

**1. Xác nhận rule redirect cũ còn nguyên (regression check, chạy TRƯỚC khi bắt đầu sửa để có baseline, và SAU khi sửa xong):**

```bash
command grep -n "dailytechwire.com" apps/web/next.config.ts
```
Kỳ vọng: vẫn thấy đúng 2 dòng bên trong object rule cũ (`has: [{ type: "host", value: "dailytechwire.com" }]` và `destination: "https://www.dailytechwire.com/:path*"`), không thay đổi so với trước khi sửa.

**2. Xác nhận rule mới đã có mặt:**

```bash
command grep -n "opentechwire.com" apps/web/next.config.ts
```
Kỳ vọng: 2 dòng mới (`has: [{ type: "host", value: "opentechwire.com" }]` và `destination: "https://www.opentechwire.com/:path*"`).

**3. Xác nhận metadata.ts đã sửa đúng, không lem sang các dòng bị đóng băng:**

```bash
command grep -n -i "dailytechwire" apps/web/src/lib/metadata.ts | cut -d: -f1 | tr '\n' ' '
```
Kỳ vọng SAU khi sửa: tập số dòng trả về **chính xác bằng** `69 90 91 101 153 163 178` (7 dòng, thuộc Phase 4/6 — xem bảng "Danh sách KHÔNG được động"). Không được có `26` hay `30` trong tập đó; không được có số dòng nào **ngoài** 7 số trên (nếu có, nghĩa là một commit khác đã thêm brand mới vào file — dừng lại, báo drift). Đây là một so sánh tập hợp chính xác, không phải một phép đếm mơ hồ.

**4. Xác nhận BOM đã bị xoá:**

```bash
head -c 3 apps/web/.env.example | xxd
```
Kỳ vọng: `2320 44` (ASCII `# D`), KHÔNG còn `efbb bf`.

**5. Xác nhận mojibake đã hết:**

```bash
command grep -c "â€”" apps/web/.env.example; echo "exit=$?"
```
Kỳ vọng: lệnh không match gì, `exit=1`.

**6. Xác nhận dòng 12 đã đổi domain:**

```bash
sed -n '12p' apps/web/.env.example
```
Kỳ vọng: `# Production value: https://www.opentechwire.com`

**7. Xác nhận dòng 51 KHÔNG bị đụng (regression check phần "không được sửa"):**

```bash
sed -n '51p' apps/web/.env.example
```
Kỳ vọng: vẫn là `RESEND_FROM_DOMAIN="dailytechwire.com"` — không đổi.

**8. Xác nhận turbo.json đã có biến mới, và kiểm tra bằng dry-run thật:**

```bash
command grep -n "NEXT_PUBLIC_SITE_URL" turbo.json
pnpm turbo build --dry=json --filter=web | command grep -c "NEXT_PUBLIC_SITE_URL"
```
Kỳ vọng: dòng đầu trả về 1 match trong `turbo.json`; lệnh thứ hai trả về `2` (một lần trong `resolvedTaskDefinition.env`, một lần trong `environmentVariables.specified.env` của task `web#build`).

**9. Typecheck sạch (mirror CI):**

```bash
pnpm turbo run typecheck
```
Kỳ vọng: exit code 0, không lỗi TypeScript mới phát sinh từ 2 file `.ts` đã sửa.

**10. Xác nhận SEO plan doc đã sửa đúng 4 vị trí, không lem sang chỗ khác:**

```bash
command grep -n "https://dailytechwire" process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md
```
Kỳ vọng: **0 kết quả** — 4 giá trị origin apex đã đổi hết sang `https://www.opentechwire.com`.

**Đừng dùng lệnh grep rộng hơn cho file này.** Sau Phase 0, file này CHỦ ĐÍCH vẫn còn nhiều chuỗi `DailyTechWire`/`Dailytechwire`: (a) văn bản gốc của Decisions Log được bảo tồn nguyên vẹn (Phase 0 bước 16-17 chỉ CHÈN ghi chú, không xoá), (b) chính banner SUPERSEDED nhắc lại tên cũ. Một lệnh `grep -i dailytechwire` trên file này sẽ trả về hàng chục dòng và **đó là đúng thiết kế** — dùng đúng lệnh hẹp ở trên, và nếu muốn đối chiếu thêm thì kiểm bằng số dòng cụ thể:
```bash
sed -n '160p;511p;901p;1037,1038p' process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md
```
(số dòng có thể trôi vì Phase 0 đã chèn ~5 dòng banner/ghi chú phía trên — EXECUTE phải định vị lại theo nội dung, không theo số dòng cứng.)

**11. Grep chuẩn toàn repo (baseline cho chương trình, KHÔNG kỳ vọng 0 hit ở phase này — chỉ ghi lại con số để so sánh qua các phase sau):**

```bash
command grep -rniE 'dailytechwire|daily ?tech ?wire|\bdtw\b|@dtw/|Tech Intelligence, Wired Daily' . \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=.turbo \
  --exclude-dir=dist --exclude='*.tsbuildinfo' --exclude=pnpm-lock.yaml --exclude-dir=data-exports \
  | wc -l
```
Ghi số này vào report — Phase 2 chỉ fix 5 file trong số ~168 file có brand, số này sẽ giảm rất ít, đó là bình thường.

**12. Không có asset nhị phân nào trong phạm vi phase này** — không cần bước mở tay.

---

## Rollback

Toàn bộ phase này **reversible**, không có bước one-way door nào:

- Trước khi commit: `git diff` để xem lại, `git checkout -- <file>` nếu cần huỷ một file cụ thể.
- Sau khi commit: `git revert <commit-sha>` cho từng commit liên quan. Khuyến nghị chia commit theo layer để revert có chọn lọc nếu cần:
  - commit 1: `apps/web/src/lib/metadata.ts` + `apps/web/next.config.ts` (application code)
  - commit 2: `apps/web/.env.example` (template/doc, không phải code chạy)
  - commit 3: `turbo.json` (build config — revert sẽ đưa cache hash về lại trạng thái cũ, gây một lần cache MISS nữa, không mất dữ liệu)
  - commit 4: `process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md` (doc thuần)
- Không có dữ liệu DB/CMS nào bị đổi — không cần backup trước khi chạy.
- Nếu rule mới trong `next.config.ts` cần rollback riêng lẻ (không revert cả commit): xoá đúng object rule mới thêm (9 dòng, có comment đánh dấu rõ ràng "Same apex->www canonicalization, for the new domain"), giữ nguyên rule cũ.

## Risks and Mitigations

| Rủi ro | Mức độ | Giảm thiểu |
|---|---|---|
| EXECUTE hiểu nhầm "sửa next.config.ts:38-45" là ghi đè rule cũ, xoá mất canonicalize apex→www của domain đang live | Cao nếu xảy ra | Checklist mục 3 nêu rõ tường minh + để nguyên block code hiện tại làm bằng chứng "trước", chỉ thêm object mới |
| Turbo cache hash đổi gây build chậm hơn 1 lần (cold cache) sau khi merge | Thấp | Ghi chú trong report, không phải lỗi, không cần hành động gì thêm |
| Phase 0 chưa chạy nhưng EXECUTE bỏ qua bước tiền đề | Trung bình | Checklist mục 1 là gate bắt buộc đầu tiên, có tiêu chí dừng rõ ràng |
| Nhầm sửa cả dòng 49 (mojibake) dù không cần | Thấp | Đã liệt kê rõ đúng 6 dòng cần sửa (9,10,11,22,38,69), loại trừ tường minh dòng 49 |
| Nhầm sửa `RESEND_FROM_DOMAIN` hoặc `DTW_INTAKE_TOKEN` vì đang mở cùng file | Trung bình | Bảng "Danh sách KHÔNG được động" + bước verification #7 kiểm tra dòng 51 không đổi |
| Giả định "Vercel Root Directory = apps/web" sai (chưa xác nhận qua dashboard) | Thấp (không chặn phase này, chỉ ảnh hưởng cách diễn giải mức độ khẩn cấp của bước 5) | Ghi rõ là suy luận chưa xác nhận; nếu sai, hệ quả xấu nhất là bước 5 (turbo.json) có giá trị cao hơn ước tính — không phải lý do để không làm bước đó |

## Acceptance Criteria

1. `command grep -n -i "dailytechwire" apps/web/src/lib/metadata.ts` không còn dòng 26/30 trong kết quả.
2. `command grep -n "dailytechwire.com" apps/web/next.config.ts` vẫn trả về đúng 2 dòng của rule cũ (không xoá, không sửa).
3. `command grep -n "opentechwire.com" apps/web/next.config.ts` trả về đúng 2 dòng của rule mới.
4. `head -c 3 apps/web/.env.example | xxd` không còn `efbb bf`.
5. `command grep -c "â€”" apps/web/.env.example` không match (exit 1).
6. `sed -n '12p' apps/web/.env.example` = `# Production value: https://www.opentechwire.com`.
7. `sed -n '51p' apps/web/.env.example` vẫn = `RESEND_FROM_DOMAIN="dailytechwire.com"` (không đổi).
8. `command grep -n "NEXT_PUBLIC_SITE_URL" turbo.json` có match.
9. `pnpm turbo build --dry=json --filter=web | command grep -c "NEXT_PUBLIC_SITE_URL"` = 2.
10. `pnpm turbo run typecheck` exit code 0.
11. `command grep -n "https://dailytechwire" process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md` trả về 0 kết quả; dòng "DKIM precedent" (ngay sau item 3 của Decisions Log) không đổi. **Không** dùng tiêu chí "file này sạch brand" — nó chủ đích không sạch (xem Verification #10).
12. Các placeholder ở bước 6 đã sửa: `command grep -n -i "dtw" .env.example apps/web/.env.example .gitignore` chỉ còn các dòng thuộc danh sách đóng băng (`DTW_INTAKE_TOKEN`, `DTW_DASHBOARD_REFRESH_TOKEN`, `R2_BUCKET="dtw-media"`) và dòng `RESEND_FROM_DOMAIN` (thuộc Phase 6).
13. User đã xem report Phase 2 (bao gồm toàn bộ output các lệnh verification) và xác nhận bằng lời trước khi đánh dấu `✅ VERIFIED`.

---

## Resume and Execution Handoff

**Trạng thái hiện tại**: `⏳ PLANNED`. Chưa có dòng code nào bị sửa. Plan này đã được validate bằng:

**Execute anchor**: file này (`phase-2-generators-and-config_PLAN_08-09-26.md`) là **primary execute anchor** duy nhất cho Phase 2 — tên file bắt đầu bằng `phase-` (trùng hình thức với quy ước legacy `phase-*.md` của `plan-lifecycle.md`) nhưng đây KHÔNG phải cấu trúc legacy nhiều-file: không có supporting phase files nào khác đi kèm phase này. Toàn bộ nội dung Phase 2 nằm trọn trong một file `_PLAN_` duy nhất, đúng theo naming convention `[feature or system's name]_PLAN_[dd-mm-yy].md`.

```bash
node .claude/skills/vc-generate-plan/scripts/validate-plan-artifact.mjs process/features/rebrand/active/phase-2-generators-and-config_PLAN_08-09-26.md
```

**Trước khi EXECUTE, xác nhận đúng 1 việc**: Phase 0 đã ở trạng thái `🔨 CODE DONE` trở lên (xem mục Tiền đề). Nếu chưa, quay lại Phase 0 trước.

**HEAD tại thời điểm viết plan này**: branch `main`, commit `c123964` (xác nhận qua `pnpm turbo build --dry=json`'s `scm.sha`). Nếu HEAD đã trôi xa khi EXECUTE chạy, EXECUTE phải tự re-verify lại 5 file trong checklist bằng đúng các lệnh `Read`/`grep` đã dùng trong phần "Phát hiện xác minh được trong lúc viết PLAN" trước khi áp dụng các sửa đổi theo số dòng cố định ở trên — số dòng có thể đã trôi nếu có commit khác chạm vào các file này trong lúc chờ.

**Quy tắc cho agent nhận EXECUTE**:
1. Đọc plan này + umbrella plan (`rebrand-opentechwire-umbrella_PLAN_08-09-26.md`) để lấy ledger D1-D15 — không tự bàn lại.
2. Thực hiện đúng 8 bước ở Implementation Checklist, theo thứ tự.
3. Chạy đủ 12 lệnh verification, dán FULL output (không tóm tắt) vào report.
4. Không tự ý mở rộng sang các file/dòng trong bảng "Danh sách KHÔNG được động".
5. Nếu phát hiện next.config.ts hoặc metadata.ts đã bị một commit khác sửa trước đó (drift), dừng lại, báo cáo drift, không tự áp fix cũ đè lên trạng thái mới.
6. Sau khi xong, tạo report tại `process/features/rebrand/reports/phase-2-generators-and-config_REPORT_<dd-mm-yy>.md`, cập nhật trạng thái phase trong umbrella plan nếu umbrella có bảng theo dõi trạng thái theo phase (hiện umbrella chưa có bảng này — cân nhắc thêm khi EXECUTE Phase 2 xong, đây là gợi ý cho UPDATE PROCESS sau này, không phải việc của Phase 2).
7. **Phase tiếp theo có thể chạy song song với Phase 2** (không phụ thuộc): Phase 1 (external clock, việc ngoài repo, do user tự làm) và Phase 3 (brand mark) — cả hai chỉ cần Phase 0 xong, không cần Phase 2 xong. Phase 6 (CUTOVER) là phase duy nhất bị Phase 2 chặn trực tiếp.

---

## Next Step

Đây là output của **PLAN mode** trong RIPER-5, cho một phase cụ thể (Phase 2) trong chương trình rebrand 8-phase.

User review kỹ Implementation Checklist, đặc biệt mục 3 (quyết định additive-only cho `next.config.ts`, là một judgment call phát sinh trong lúc PLAN, khác với cách đọc literal ban đầu).

Nói **"ENTER EXECUTE MODE"** khi sẵn sàng thực thi — chỉ áp dụng cho plan file này (`phase-2-generators-and-config_PLAN_08-09-26.md`), không phải toàn bộ chương trình rebrand. Trước đó, xác nhận Phase 0 đã hoàn tất theo mục Tiền đề.
