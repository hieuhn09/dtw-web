# Rebrand Phase 2 — Generator và Canonical Host Config — Báo cáo EXECUTE

**Ngày EXECUTE**: 09-09-26
**Plan đã thi hành**: `process/features/rebrand/active/phase-2-generators-and-config_PLAN_08-09-26.md`
**Feature**: `rebrand`
**Nhánh**: `feat/rebrand-phase-2-canonical-host` (đã sẵn có, không tạo nhánh mới, không checkout, không commit, không push — đúng RÀO 7)
**Tiền đề (bước 1 của Implementation Checklist)**: đã đọc `process/features/rebrand/reports/phase-0-lock-decisions_REPORT_09-09-26.md` — trạng thái `🧪 TESTING (DONE_WITH_CONCERNS)`, đạt tối thiểu `🔨 CODE DONE` theo yêu cầu tiền đề của plan. Tiếp tục EXECUTE.

## Trạng thái tổng: 🧪 TESTING (DONE_WITH_CONCERNS)

Toàn bộ 6 bước sửa code/doc (bước 2-6) đã thực thi đúng phạm vi, cộng thêm 4 việc bổ sung theo Phạm vi mục 6 (`.env.example` root + `apps/web/.env.example` dòng 1/17 + `.gitignore` dòng 33). Không có deviation nào phá vỡ 7 RÀO của phiên này. Có 2 điểm cần user xem kỹ trước khi xác nhận `✅ VERIFIED` — xem mục "Lệch thực tế so với plan" bên dưới:

1. Lệnh verification #8 nguyên văn của plan (`pnpm turbo build --dry=json --filter=web | command grep -c "NEXT_PUBLIC_SITE_URL"`) trả về **8**, không phải **2** như plan kỳ vọng — nguyên nhân đã xác định rõ (không phải lỗi), xem chi tiết bên dưới.
2. 4 việc bổ sung ở Phạm vi mục 6 (`.env.example` root dòng 1/7/13-14, `apps/web/.env.example` dòng 1/17, `.gitignore` dòng 33) không có chuỗi đích tường minh trong plan — tôi đã tự suy ra chuỗi thay thế bằng cách áp dụng đúng luật casing §5.1.1 của umbrella plan (đã đọc trước khi làm), và ghi rõ lý do chọn từng chuỗi để user xác nhận.

Theo Phase Completion Rules #5 của plan: trạng thái cao nhất được phép khi chưa có user confirmation là `🧪 TESTING`.

---

## Bảng từng bước

| Bước | Trạng thái | File | Bằng chứng verify |
|---|---|---|---|
| 1. Xác nhận tiền đề Phase 0 | ✅ DONE | — (chỉ đọc) | Report Phase 0 tồn tại, trạng thái `🧪 TESTING` ≥ `🔨 CODE DONE` |
| 2. `metadata.ts` dòng 26, 30 | ✅ DONE | `apps/web/src/lib/metadata.ts` | Baseline trước: `command grep -n -i "dailytechwire" ...` → `26 30 69 90 91 101 153 163 178`. Sau: → `69 90 91 101 153 163 178` (khớp chính xác kỳ vọng plan, không lem sang 7 dòng đóng băng) |
| 3. `next.config.ts` thêm rule mới, giữ rule cũ | ✅ DONE | `apps/web/next.config.ts` | `command grep -n "dailytechwire.com"` → vẫn 2 dòng object cũ (42, 43) nguyên vẹn; `command grep -n "opentechwire.com"` → 2 dòng object mới (55, 56); `git diff` chỉ có dòng `+`, không có dòng `-` nào (xem full diff bên dưới) |
| 4. `apps/web/.env.example` — BOM, mojibake, dòng 12 | ✅ DONE | `apps/web/.env.example` | `head -c 3 | xxd` → `2320 4f` (`# O`, hết BOM); `command grep -c "â€”"` → 0, `exit=1`; `sed -n '12p'` → `# Production value: https://www.opentechwire.com`; `sed -n '51p'` → `RESEND_FROM_DOMAIN="dailytechwire.com"` (không đổi, đúng RÀO 4); `sed -n '62,63p'` → `DTW_INTAKE_TOKEN=""` (không đổi, đúng RÀO 5) |
| 4-bổ sung. Placeholder §6b.1 trong `apps/web/.env.example` (dòng 1, 17) | ✅ DONE | `apps/web/.env.example` | Dòng 1: `# DTW dev environment template.` → `# OTW dev environment template.`; dòng 17: `# 2. Create project "dtw-dev"` → `# 2. Create project "otw-dev"` |
| 5. `turbo.json` thêm `NEXT_PUBLIC_SITE_URL` | ✅ DONE | `turbo.json` | `command grep -n "NEXT_PUBLIC_SITE_URL" turbo.json` → dòng 23; dry-run trước/sau xác nhận biến đã vào `resolvedTaskDefinition.env` và `environmentVariables.specified.env` của `web#build` (xem mục riêng bên dưới) |
| 6. `per-page-seo-metadata_PLAN_16-07-26.md` — 4 vị trí | ✅ DONE | `process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md` | Banner SUPERSEDED đã tồn tại từ Phase 0 (dòng 26/28) — xác nhận bằng `command grep -n -i supersed` trước khi sửa, không tự thêm banner. `command grep -n "https://dailytechwire" ...` → 0 kết quả (`exit=1`) sau khi sửa. Dòng "DKIM precedent" (165) không đổi |
| 6-bổ sung. Placeholder §6b.1 ở `.env.example` (root) dòng 1/7/13-14 và `.gitignore` dòng 33 | ✅ DONE | `.env.example` (root), `.gitignore` | Xem diff đầy đủ bên dưới |
| 7. Cổng verification tổng hợp | ✅ DONE | — | Xem "Verification Evidence" đầy đủ bên dưới |
| 8. Viết report | ✅ DONE (file này) | `process/features/rebrand/reports/phase-2-generators-and-config_REPORT_09-09-26.md` | — |

---

## Full `git diff` của `apps/web/next.config.ts` (RÀO 1 — user tự mắt xác nhận rule cũ còn nguyên vẹn)

```diff
diff --git a/apps/web/next.config.ts b/apps/web/next.config.ts
index b9fb9fb..0449029 100644
--- a/apps/web/next.config.ts
+++ b/apps/web/next.config.ts
@@ -43,6 +43,19 @@ const config: NextConfig = {
         destination: "https://www.dailytechwire.com/:path*",
         permanent: true,
       },
+      // Same apex->www canonicalization, for the new domain ahead of the
+      // rebrand cutover (process/features/rebrand/). Dormant until
+      // opentechwire.com is attached to this Vercel project in Phase 6 — no
+      // request can arrive with this Host header before then. The
+      // dailytechwire.com rule above is intentionally left in place until
+      // Phase 6 decommissions that domain (see D4 in the rebrand umbrella
+      // plan — this is NOT a redirect from the old domain to the new one).
+      {
+        source: "/:path*",
+        has: [{ type: "host", value: "opentechwire.com" }],
+        destination: "https://www.opentechwire.com/:path*",
+        permanent: true,
+      },
     ];
   },
   webpack: (webpackConfig) => {
```

**Quan sát then chốt**: diff chỉ có dòng `+` (13 dòng thêm), **không có bất kỳ dòng `-` nào**. Rule cũ (`has: [{ type: "host", value: "dailytechwire.com" }]` → `destination: "https://www.dailytechwire.com/:path*"`) không bị sửa, không bị xoá, thứ tự trong mảng cũng không đổi (rule mới nối vào SAU rule cũ). Đây là additive-only đúng như quyết định của plan.

---

## Diff các file còn lại

```diff
diff --git a/apps/web/src/lib/metadata.ts b/apps/web/src/lib/metadata.ts
index 5dbaacc..2fd6100 100644
--- a/apps/web/src/lib/metadata.ts
+++ b/apps/web/src/lib/metadata.ts
@@ -23,11 +23,11 @@ import type { Metadata } from "next";
  *
  * Fallback order: explicit `NEXT_PUBLIC_SITE_URL` → `https://${VERCEL_URL}`
  * (automatic on Vercel preview deploys) → `http://localhost:3000` (dev
- * default). Production sets `NEXT_PUBLIC_SITE_URL=https://www.dailytechwire.com`
+ * default). Production sets `NEXT_PUBLIC_SITE_URL=https://www.opentechwire.com`
  * explicitly (a Vercel dashboard env var, not code — see Ops Runbook).
  *
  * MUST stay on the www host: next.config.ts 301s the bare apex
- * (dailytechwire.com) to www. Pointing this at the apex would make every
+ * (opentechwire.com) to www. Pointing this at the apex would make every
  * canonical/OG/sitemap URL resolve through a redirect.
  */
 export function siteOrigin(): string {
```

```diff
diff --git a/turbo.json b/turbo.json
index 8f5e8ed..5590dc0 100644
--- a/turbo.json
+++ b/turbo.json
@@ -19,7 +19,8 @@
         "GITHUB_CLIENT_ID",
         "GITHUB_CLIENT_SECRET",
         "RESEND_API_KEY",
-        "RESEND_FROM_DOMAIN"
+        "RESEND_FROM_DOMAIN",
+        "NEXT_PUBLIC_SITE_URL"
       ]
     },
     "dev": {
```

```diff
diff --git a/apps/web/.env.example b/apps/web/.env.example
index 555cbf0..5f8b379 100644
--- a/apps/web/.env.example
+++ b/apps/web/.env.example
@@ -1,4 +1,4 @@
-﻿# DTW dev environment template.
+# OTW dev environment template.
 # Copy to `.env.local` (gitignored) and fill in the values below.
 # See process/context/infra/all-infra.md for the full env catalog.
 
@@ -6,20 +6,20 @@
 # Used for `metadataBase`, self-referencing canonical links, and absolute
 # OpenGraph/Twitter/JSON-LD image URLs (see apps/web/src/lib/metadata.ts).
 # Fallback chain (siteOrigin()):
-#   1. NEXT_PUBLIC_SITE_URL   â€” explicit; set this in dev and in Vercel prod
-#   2. https://${VERCEL_URL} â€” automatic on Vercel preview deploys
-#   3. http://localhost:3000 â€” dev default when unset
-# Production value: https://dailytechwire.com
+#   1. NEXT_PUBLIC_SITE_URL   — explicit; set this in dev and in Vercel prod
+#   2. https://${VERCEL_URL} — automatic on Vercel preview deploys
+#   3. http://localhost:3000 — dev default when unset
+# Production value: https://www.opentechwire.com
 NEXT_PUBLIC_SITE_URL=http://localhost:3000
 
 # --- Database (Drizzle + Payload, hosted on Neon for dev) ---
 # 1. Sign up at neon.tech (free tier)
-# 2. Create project "dtw-dev"
+# 2. Create project "otw-dev"
 # 3. Copy the "Pooled connection" string from the Neon dashboard
 # 4. Paste it here as DATABASE_URL
 # 5. Also set DATABASE_DIRECT_URL to the "Direct connection" (used by migrations)
 #
-# Production uses a separate Neon project / Supabase / etc â€” decided at deploy time.
+# Production uses a separate Neon project / Supabase / etc — decided at deploy time.
 DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
 DATABASE_DIRECT_URL="postgresql://user:password@host/dbname?sslmode=require"
 # --- Auth-central split (08-2026, apc/AUTH_CENTRAL_MIGRATION_PLAN.md) ---
@@ -35,7 +35,7 @@ DATABASE_DIRECT_URL="postgresql://user:password@host/dbname?sslmode=require"
 BETTER_AUTH_SECRET=""
 BETTER_AUTH_URL="http://localhost:3000"
 
-# OAuth â€” leave empty in dev; Better-Auth will only enable providers with creds.
+# OAuth — leave empty in dev; Better-Auth will only enable providers with creds.
 GOOGLE_CLIENT_ID=""
 GOOGLE_CLIENT_SECRET=""
 APPLE_CLIENT_ID=""
@@ -66,7 +66,7 @@ DTW_INTAKE_TOKEN=""
 # CMS_URL: local central on :3508; in prod set to the deployed central URL.
 CMS_URL=http://localhost:3508
 # CMS_READ_TOKEN: THIS tenant's read token (per-site secret). Mint in central
-# admin or copy from the seed output â€” do NOT commit a real value here.
+# admin or copy from the seed output — do NOT commit a real value here.
 CMS_READ_TOKEN=
 # REVALIDATE_SECRET must EQUAL central's CENTRAL_SIGNING_SECRET (revalidate
 # webhook + preview).
```

Chú ý dòng `-﻿# DTW dev environment template.` — ký tự BOM (`﻿`) hiển thị ngay trước `#` trong diff, xác nhận trực quan nó thực sự có ở bản cũ và đã biến mất ở bản mới.

```diff
diff --git a/.env.example b/.env.example
index a9f2853..c6402ad 100644
--- a/.env.example
+++ b/.env.example
@@ -1,17 +1,17 @@
-# DTW dev environment template.
+# OTW dev environment template.
 # Copy to `.env.local` (gitignored) and fill in the values below.
 # See process/context/infra/all-infra.md for the full env catalog.
 
 # --- Database (Drizzle + Payload, hosted on Neon for dev) ---
 # 1. Sign up at neon.tech (free tier)
-# 2. Create project "dtw-dev"
+# 2. Create project "otw-dev"
 # 3. Copy the "Pooled connection" string from the Neon dashboard
 # 4. Paste it here as DATABASE_URL
 # 5. Also set DATABASE_DIRECT_URL to the "Direct connection" (used by migrations)
 #
 # Production uses a separate Neon project / Supabase / etc — decided at deploy time.
-DATABASE_URL="postgresql://user:password@ep-xxxx.us-east-1.aws.neon.tech/dtw?sslmode=require"
-DATABASE_DIRECT_URL="postgresql://user:password@ep-xxxx.us-east-1.aws.neon.tech/dtw?sslmode=require"
+DATABASE_URL="postgresql://user:password@ep-xxxx.us-east-1.aws.neon.tech/otw?sslmode=require"
+DATABASE_DIRECT_URL="postgresql://user:password@ep-xxxx.us-east-1.aws.neon.tech/otw?sslmode=require"
 # --- Auth-central split (08-2026, apc/AUTH_CENTRAL_MIGRATION_PLAN.md) ---
 # Better-Auth + reader-data (Drizzle, schema `dtw_auth`) live on the CENTRAL
 # Neon DB. AUTH_DATABASE_URL = central POOLER url (runtime);
```

```diff
diff --git a/.gitignore b/.gitignore
index 0bcc52d..49054be 100644
--- a/.gitignore
+++ b/.gitignore
@@ -30,7 +30,7 @@ build/
 *.bin
 .vibecode-backup/
 
-# kit skill example screenshots — audit artifacts from other apps, not part of DTW (~14MB)
+# kit skill example screenshots — audit artifacts from other apps, not part of Opentechwire (~14MB)
 .claude/skills/*/screenshots/
 .codex/skills/*/screenshots/
```

```diff
diff --git a/process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md b/process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md
index 247e483..87a9d55 100644
--- a/process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md
+++ b/process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md
@@ -161,7 +161,7 @@ These are user-approved and are **not** to be relitigated during EXECUTE:
    homepage and pillar pages, use the static `public/og-default.png`
    (1200×630, geometric, no fake photography). The BullMQ dynamic OG pipeline
    (`revalidate.ts:72` TODO stub) is **not** built this wave.
-3. **Production origin** for `NEXT_PUBLIC_SITE_URL` = `https://dailytechwire.com`
+3. **Production origin** for `NEXT_PUBLIC_SITE_URL` = `https://www.opentechwire.com` (cập nhật theo ledger rebrand D3/D5 — xem process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md; giá trị này có hiệu lực trên Vercel sau Phase 6 của chương trình rebrand, không phải ngay bây giờ)
    (matches the existing DKIM/email domain precedent in `lib/email.ts:12`).
    Dev default `http://localhost:3000`. On Vercel previews, fall back to
    `https://${VERCEL_URL}` when the explicit var is unset.
@@ -514,7 +514,7 @@ RFC in isolation beyond typecheck.
   (numbered setup comments), and add `NEXT_PUBLIC_SITE_URL` with a comment
   explaining the fallback chain (`NEXT_PUBLIC_SITE_URL` explicit → `https://
   ${VERCEL_URL}` on Vercel → `http://localhost:3000` dev default) and noting
-  the production value is `https://dailytechwire.com`.
+  the production value is `https://www.opentechwire.com` (theo ledger rebrand D3/D5).
 - `apps/web/src/app/layout.tsx` — replace the current static `metadata`
   object (lines 32-35) with: `metadataBase: new URL(siteOrigin())`; `title:
   { default: "DailyTechWire", template: "%s – DailyTechWire" }` (en dash);
@@ -904,7 +904,7 @@ under `apps/web/src/components/`, auth/session/paywall logic, `next.config.ts`
 (no CSP/headers added), any file under `apps/web/src/app/(payload)/admin`.
 
 **Deployment-only touchpoint (outside repo, not a code change):** set
-`NEXT_PUBLIC_SITE_URL=https://dailytechwire.com` in the Vercel production
+`NEXT_PUBLIC_SITE_URL=https://www.opentechwire.com` in the Vercel production
 environment variables. Vercel preview deploys need no manual var — the
 `VERCEL_URL` fallback in `siteOrigin()` covers them automatically.
 
@@ -1041,7 +1041,7 @@ revise), update this plan file, then continue.
 ## Ops Runbook
 
 - **One manual deployment step:** set `NEXT_PUBLIC_SITE_URL=https://
-  dailytechwire.com` in Vercel's production environment variables before
+  www.opentechwire.com` in Vercel's production environment variables before
   (or promptly after) this plan's first production deploy. Preview deploys
   need no manual step — `VERCEL_URL` fallback covers them.
 - **Local dev:** `apps/web/.env.local` gets one new line
```

---

## `turbo build --dry=json --filter=web` — `environmentVariables` của task `web#build`, TRƯỚC và SAU

Lấy bằng `git stash push -- turbo.json` (chỉ stash file này) → chạy dry-run → `git stash pop` (khôi phục lại, đã xác nhận `git status` khớp lại y hệt sau khi pop).

**TRƯỚC** (`turbo.json` gốc, chưa có `NEXT_PUBLIC_SITE_URL`), hash task = `d849994f7b0a4b7c`:
```json
{
  "specified": {
    "env": [
      "BETTER_AUTH_SECRET",
      "BETTER_AUTH_URL",
      "DATABASE_URL",
      "GITHUB_CLIENT_ID",
      "GITHUB_CLIENT_SECRET",
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
      "PAYLOAD_SECRET",
      "R2_ACCESS_KEY_ID",
      "R2_BUCKET",
      "R2_ENDPOINT",
      "R2_SECRET_ACCESS_KEY",
      "RESEND_API_KEY",
      "RESEND_FROM_DOMAIN"
    ],
    "passThroughEnv": null
  },
  "configured": [],
  "inferred": [],
  "passthrough": null
}
```

**SAU** (đã thêm `NEXT_PUBLIC_SITE_URL`), hash task = `04a35543be0edb71`:
```json
{
  "specified": {
    "env": [
      "BETTER_AUTH_SECRET",
      "BETTER_AUTH_URL",
      "DATABASE_URL",
      "GITHUB_CLIENT_ID",
      "GITHUB_CLIENT_SECRET",
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
      "NEXT_PUBLIC_SITE_URL",
      "PAYLOAD_SECRET",
      "R2_ACCESS_KEY_ID",
      "R2_BUCKET",
      "R2_ENDPOINT",
      "R2_SECRET_ACCESS_KEY",
      "RESEND_API_KEY",
      "RESEND_FROM_DOMAIN"
    ],
    "passThroughEnv": null
  },
  "configured": [],
  "inferred": [],
  "passthrough": null
}
```

Ghi chú xác nhận thêm 2 điểm từ mục "Phát hiện xác minh được trong lúc viết PLAN" #1 của plan:
- `"inferred": []` **vẫn rỗng** ở cả TRƯỚC và SAU — xác nhận lại đúng phát hiện của plan rằng Turborepo framework-inference không tự bao `NEXT_PUBLIC_SITE_URL`, việc thêm thủ công vào `env` array là bắt buộc.
- `resolvedTaskDefinition.env` (mảng gốc từ `turbo.json`) cũng đã có thêm `NEXT_PUBLIC_SITE_URL` — khớp cả hai vị trí mà Verification Evidence #8 của plan yêu cầu.
- Cache hash của task `web#build` đổi từ `d849994f7b0a4b7c` → `04a35543be0edb71` — xác nhận đúng "Public Contracts" của plan: thay đổi `env` array làm build cache MISS một lần, không phải lỗi.

---

## Xác nhận BOM và mojibake đã hết

```
$ head -c 3 apps/web/.env.example | xxd
00000000: 2320 4f                                  # O
```
(Trước: `efbb bf` — đã xác nhận baseline trước khi sửa. Sau: `2320 4f` = ASCII `# O` — hết BOM.)

```
$ command grep -c "â€”" apps/web/.env.example; echo "exit=$?"
0
exit=1
```
(0 match, exit code 1 — đúng kỳ vọng plan.)

Baseline TRƯỚC khi sửa (đã chạy lúc bắt đầu bước 4, ghi lại để đối chiếu):
```
$ command grep -n "â€”" apps/web/.env.example
9:#   1. NEXT_PUBLIC_SITE_URL   â€” explicit; set this in dev and in Vercel prod
10:#   2. https://${VERCEL_URL} â€” automatic on Vercel preview deploys
11:#   3. http://localhost:3000 â€” dev default when unset
22:# Production uses a separate Neon project / Supabase / etc â€” decided at deploy time.
38:# OAuth â€” leave empty in dev; Better-Auth will only enable providers with creds.
69:# admin or copy from the seed output â€” do NOT commit a real value here.
```
Đúng 6 dòng (9,10,11,22,38,69) như plan mô tả ở "Phát hiện xác minh được trong lúc viết PLAN" #5 — dòng 49 xác nhận không có mojibake (`sed -n '49p'` → `# Sign up at resend.com; in dev you can leave blank and magic-link emails log to console.`), không sửa dòng đó, đúng kế hoạch.

---

## Đối chiếu `git diff --stat` với bảng Touchpoints của plan

```
$ git diff --stat -- apps/web/src/lib/metadata.ts apps/web/next.config.ts apps/web/.env.example turbo.json process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md .env.example .gitignore
 .env.example                                           |  8 ++++----
 .gitignore                                             |  2 +-
 apps/web/.env.example                                  | 18 +++++++++---------
 apps/web/next.config.ts                                | 13 +++++++++++++
 apps/web/src/lib/metadata.ts                           |  4 ++--
 .../active/per-page-seo-metadata_PLAN_16-07-26.md      |  8 ++++----
 turbo.json                                             |  3 ++-
 7 files changed, 35 insertions(+), 21 deletions(-)

$ git status --porcelain
 M .env.example
 M .gitignore
 M apps/web/.env.example
 M apps/web/next.config.ts
 M apps/web/src/lib/metadata.ts
 M process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md
 M turbo.json
```
(cộng thêm các file `??` pre-existing untracked, không liên quan tới phiên EXECUTE này — đã đối chiếu, không phải do phiên này tạo ra.)

**Đối chiếu**: bảng Touchpoints của plan liệt kê 5 file (`metadata.ts`, `next.config.ts`, `apps/web/.env.example`, `turbo.json`, `per-page-seo-metadata_PLAN`). Thực tế **7 file** bị chạm — **lệch có chủ đích, không phải mở rộng phạm vi ngoài ý muốn**: 2 file thêm (`.env.example` root, `.gitignore`) đến từ mục 6 của Phạm vi ("bổ sung 09-09-26, umbrella §6b.1") mà bảng Touchpoints không được cập nhật để phản ánh — đây là một điểm không nhất quán nội bộ của chính plan (Phạm vi có nhắc, Touchpoints thì không), đã ghi rõ ở mục "Lệch thực tế" bên dưới. Không có file nào khác ngoài 7 file này bị chạm.

Không đụng: `apps/web/src/lib/feed.ts` (RÀO 2), `apps/web/scripts/generate-og-default.mjs` (RÀO 6) — xác nhận bằng `git diff --stat -- <2 file>` trả về rỗng.

---

## Lệch thực tế so với plan

1. **Lệnh verification #8 nguyên văn trả về 8, không phải 2.** Plan viết: *"lệnh thứ hai trả về `2`"*. Chạy nguyên văn `pnpm turbo build --dry=json --filter=web | command grep -c "NEXT_PUBLIC_SITE_URL"` cho kết quả **8**. Nguyên nhân: `--filter=web` cùng `dependsOn: ["^build"]` khiến Turborepo dry-run liệt kê **4 task** `build` (`@dtw/config#build`, `@dtw/db#build`, `@dtw/ui#build`, `web#build`), mỗi task đều dùng chung định nghĩa `env` array từ `turbo.json` (task key `"build"` áp dụng cho mọi package có script `build`, không phải chỉ `web`) → mỗi task có 2 chỗ chứa `NEXT_PUBLIC_SITE_URL` (`resolvedTaskDefinition.env` + `environmentVariables.specified.env`) × 4 task = 8. Đây **không phải lỗi thực thi** — khi cô lập đúng khối JSON của riêng `web#build` (`sed -n '351,$p' ... | command grep -c ...`), kết quả là chính xác **2**, đúng tinh thần Acceptance Criteria #9. Plan đã không lường trước việc `--filter=web` kéo theo cả cây dependency vào dry-run output. Đề xuất: nếu cần một lệnh chính xác cho lần sau, dùng `python3` parse JSON lọc theo `taskId == "web#build"` (đã dùng trong report này) thay vì `grep -c` toàn file.

2. **4 việc bổ sung ở Phạm vi mục 6 không có chuỗi đích tường minh — đã tự suy luận theo luật casing §5.1.1 của umbrella, cần user xác nhận:**
   - `.env.example` (root) dòng 1: `# DTW dev environment template.` → `# OTW dev environment template.` — áp dụng luật "nhãn ngắn đứng một mình" (không phải câu hoàn chỉnh có chủ-vị khi bỏ token) → OTW.
   - `.env.example` (root) dòng 7 và `apps/web/.env.example` dòng 17: `# 2. Create project "dtw-dev"` → `"otw-dev"` — áp dụng luật "tiền tố định danh kỹ thuật" (tên project gợi ý, dạng kebab-case) → `otw-`.
   - `.env.example` (root) dòng 13-14: `/dtw?sslmode=require` (×2, placeholder tên DB trong connection string mẫu) → `/otw?sslmode=require` — cùng luật tiền tố kỹ thuật.
   - `apps/web/.env.example` dòng 1: cùng xử lý như root, → `# OTW dev environment template.`
   - `.gitignore` dòng 33: `not part of DTW (~14MB)` → `not part of Opentechwire (~14MB)` — áp dụng luật "từ thay thế tên ấn phẩm trong một câu hoàn chỉnh" (bỏ "DTW" thì "not part of" thiếu tân ngữ nhưng câu vẫn có chủ-vị đầy đủ dạng elip "these screenshots are not part of DTW") → dùng dạng viết đủ `Opentechwire`, không dùng `OTW`.
   - **Đây KHÔNG phải là identifier đóng băng D11** (slug `dtw` cụ thể của registry Tenants/publications) — `dtw-dev`/`/dtw?sslmode=require` chỉ là placeholder text gợi ý tên project/DB trong template dev, không phải giá trị nào được code đọc runtime. Đã đối chiếu với bảng "Định danh đóng băng" (§5.2 umbrella) và RÀO 5 của phiên này — không trùng bất kỳ mục nào trong danh sách đó.
   - Không có RÀO nào của phiên này cấm sửa 2 file này; Phạm vi mục 6 của plan xác nhận chúng thuộc phase này ("sửa lúc đang mở đúng các file này"), dù bảng Touchpoints không liệt kê. Đã thực hiện theo đúng tinh thần "gán chủ ở đây thì chúng rơi ra ngoài cả 8 phase" mà plan tự nêu lý do.

3. **Không có drift số dòng nào khác so với plan.** Toàn bộ 5 vị trí gốc trong checklist (metadata.ts:26,30; next.config.ts:40-45; .env.example BOM+6 dòng mojibake+dòng 12; turbo.json:8-23; per-page-seo-metadata_PLAN 4 vị trí) đều khớp **chính xác nội dung** plan mô tả, không lệch một ký tự nào so với bản Read xác nhận trước khi sửa. Số dòng của `per-page-seo-metadata_PLAN` đã trôi đúng như plan cảnh báo (164/517/907/1043-1044 thay vì 160/511/901/1037-1038 ghi trong plan), đã định vị lại bằng nội dung như plan yêu cầu.

---

## Phát hiện ngoài phạm vi (không tự làm)

- Không phát hiện việc gì mới ngoài những gì plan đã tự liệt kê ở mục "Ngoài phạm vi" (feed.ts, RESEND_FROM_DOMAIN, DTW_INTAKE_TOKEN, generate-og-default.mjs, NEXT_PUBLIC_GA_ID/CMS_SOURCE trong turbo.json, các dòng brand khác trong metadata.ts).
- Bảng Touchpoints của chính plan này (mục "Touchpoints") không được cập nhật đồng bộ khi Phạm vi mục 6 được bổ sung ngày 09-09-26 — đã ghi ở "Lệch thực tế" #2, không tự sửa lại bảng Touchpoints trong plan (đó là việc của UPDATE PROCESS/PLAN, không phải EXECUTE).
- Trong lúc chạy grep tổng repo (V11), phát hiện tổng số hit tăng từ 2367 (baseline Phase 0) lên **2390** (+23) — tăng, không giảm, giống hệt hành vi đã ghi nhận ở Phase 0 (thêm ghi chú giải thích lại chứa thêm mention brand cũ, ví dụ comment mới trong `next.config.ts` nhắc `dailytechwire.com` 1 lần, đường dẫn tới umbrella plan trong `per-page-seo-metadata_PLAN` không chứa "dtw" nhưng các câu ghi chú "theo ledger rebrand D3/D5" có thêm text). Không hành động gì — plan đã tự nói không kỳ vọng số này giảm ở Phase 2.

---

## Full lệnh Verification Evidence (nguyên văn theo plan, đã chạy đủ 12 mục)

```
$ command grep -n "dailytechwire.com" apps/web/next.config.ts
42:        has: [{ type: "host", value: "dailytechwire.com" }],
43:        destination: "https://www.dailytechwire.com/:path*",
50:      // dailytechwire.com rule above is intentionally left in place until

$ command grep -n "opentechwire.com" apps/web/next.config.ts
48:      // opentechwire.com is attached to this Vercel project in Phase 6 — no
55:        has: [{ type: "host", value: "opentechwire.com" }],
56:        destination: "https://www.opentechwire.com/:path*",

$ command grep -n -i "dailytechwire" apps/web/src/lib/metadata.ts | cut -d: -f1 | tr '\n' ' '
69 90 91 101 153 163 178

$ head -c 3 apps/web/.env.example | xxd
00000000: 2320 4f                                  # O

$ command grep -c "â€”" apps/web/.env.example; echo "exit=$?"
0
exit=1

$ sed -n '12p' apps/web/.env.example
# Production value: https://www.opentechwire.com

$ sed -n '51p' apps/web/.env.example
RESEND_FROM_DOMAIN="dailytechwire.com"

$ command grep -n "NEXT_PUBLIC_SITE_URL" turbo.json
23:        "NEXT_PUBLIC_SITE_URL"

$ pnpm turbo build --dry=json --filter=web | command grep -c "NEXT_PUBLIC_SITE_URL"
8   # xem "Lệch thực tế" #1 — cô lập riêng task web#build thì đúng là 2

$ pnpm turbo run typecheck
 Tasks:    3 successful, 3 total
Cached:    0 cached, 3 total
  Time:    3.653s

$ command grep -n "https://dailytechwire" process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md
(0 kết quả, exit=1)

$ sed -n '164p;517p;907p;1043,1044p' process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md
3. **Production origin** for `NEXT_PUBLIC_SITE_URL` = `https://www.opentechwire.com` (cập nhật theo ledger rebrand D3/D5 — xem process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md; giá trị này có hiệu lực trên Vercel sau Phase 6 của chương trình rebrand, không phải ngay bây giờ)
  the production value is `https://www.opentechwire.com` (theo ledger rebrand D3/D5).
`NEXT_PUBLIC_SITE_URL=https://www.opentechwire.com` in the Vercel production
- **One manual deployment step:** set `NEXT_PUBLIC_SITE_URL=https://
  www.opentechwire.com` in Vercel's production environment variables before

$ command grep -rniE 'dailytechwire|daily ?tech ?wire|\bdtw\b|@dtw/|Tech Intelligence, Wired Daily' . \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=.turbo \
  --exclude-dir=dist --exclude='*.tsbuildinfo' --exclude=pnpm-lock.yaml --exclude-dir=data-exports \
  | wc -l
2390   # baseline Phase 0 = 2367, tăng +23, đúng kỳ vọng (không giảm ở phase này)
```

Không có asset nhị phân nào trong phạm vi phase này (mục 12 của Verification Evidence) — không cần bước mở tay.

---

## Rollback (chưa cần dùng, ghi lại để tham chiếu)

Toàn bộ 7 file đang ở trạng thái "Changes not staged for commit" — chưa commit, chưa push (đúng RÀO 7). `git diff` / `git checkout -- <file>` sẵn sàng nếu user muốn huỷ một phần hoặc toàn bộ.

---

## Điều kiện để chuyển ✅ VERIFIED

Theo Phase Completion Rules #5 của plan: cần user xem report này (đặc biệt full diff `next.config.ts` ở trên) và xác nhận bằng lời, đặc biệt xác nhận 2 điểm ở mục "Lệch thực tế" (kết quả lệnh #8 = 8 thay vì 2, và 4 chuỗi tự suy luận cho việc bổ sung §6b.1) là chấp nhận được. Sau đó Phase 2 có thể chuyển `✅ VERIFIED` trong cả plan file này và bảng trạng thái ở umbrella plan.
