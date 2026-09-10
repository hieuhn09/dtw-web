# Phase 6 — Cutover code prep (chỉ code, KHÔNG cutover)

**Ngày**: 10-09-26
**Nhánh**: `feat/rebrand-phase-6-cutover-code` (chưa commit, chưa push, chưa merge)
**Loại**: Chuẩn bị code cho Phase 6 (`phase-6-cutover_PLAN_08-09-26.md`) — đúng 3 nhóm A/B/C được giao, không hơn.
**Trạng thái nhánh**: 10 file đã sửa trong working tree, chưa có commit nào. `git status --short` xác nhận đúng 10 file, không có file lạ.

---

## 1. Bảng mọi chuỗi đã đổi

### Nhóm A — chuỗi brand trong mail

| file:dòng | cũ | mới | casing áp dụng | lý do |
|---|---|---|---|---|
| `apps/web/src/lib/email.ts:12` | `process.env.RESEND_FROM_DOMAIN \|\| "dailytechwire.com"` | `process.env.RESEND_FROM_DOMAIN \|\| "opentechwire.com"` | domain literal, không phải wordmark | Fallback khi env chưa set — xem quyết định riêng ở mục 2 |
| `apps/web/src/lib/email.ts:13` | `` `DailyTechWire <no-reply@${fromDomain}>` `` | `` `Opentechwire <no-reply@${fromDomain}>` `` | Sentence case (§5.1.1: đây là văn xuôi — display name trong một dòng có thể đọc như một câu hoàn chỉnh "From: Opentechwire") | D1 + umbrella §6b.3: chủ sở hữu duy nhất của dòng này là Phase 6, phải đi cùng deploy với `RESEND_FROM_DOMAIN` |
| `apps/web/src/lib/auth.ts:78` | `"We received a request to reset your DailyTechWire password. This link expires in 1 hour."` | `"We received a request to reset your Opentechwire password. This link expires in 1 hour."` | `Opentechwire` — đây là một câu hoàn chỉnh, bỏ token ra câu vẫn có chủ-vị → văn xuôi (§5.1.1 dòng thứ 2 của bảng phân giải) | Umbrella §6b.3 — cùng deploy với `RESEND_FROM_DOMAIN` |
| `apps/web/src/lib/auth.ts:84` | `subject: "Reset your DailyTechWire password"` | `subject: "Reset your Opentechwire password"` | `Opentechwire` (văn xuôi, câu mệnh lệnh hoàn chỉnh) | Như trên |
| `apps/web/src/lib/auth.ts:97` | `"Welcome to DailyTechWire. Confirm your email to activate your account."` | `"Welcome to Opentechwire. Confirm your email to activate your account."` | `Opentechwire` | Như trên |
| `apps/web/src/lib/auth.ts:103` | `subject: "Confirm your DailyTechWire account"` | `subject: "Confirm your Opentechwire account"` | `Opentechwire` | Như trên |

Đã xác nhận **không sửa** dòng 59 (`baseURL: process.env.BETTER_AUTH_URL`) — đúng theo plan, chỉ giá trị env đổi (env value không thuộc phạm vi code của lượt này, đổi trên Vercel ở cửa sổ cutover thật).

### Nhóm B — template env trong repo (Bước 4e)

| file:dòng | cũ | mới |
|---|---|---|
| `.env.example:52` | `RESEND_FROM_DOMAIN="dailytechwire.com"` | `RESEND_FROM_DOMAIN="opentechwire.com"` |
| `apps/web/.env.example:51` | `RESEND_FROM_DOMAIN="dailytechwire.com"` | `RESEND_FROM_DOMAIN="opentechwire.com"` |

Đã kiểm tra: không có ghi chú cảnh báo "domain chưa resolve" nào của phiên trước gần hai dòng này (hoặc gần `NEXT_PUBLIC_SITE_URL`/`BETTER_AUTH_URL` trong cùng file) cần cập nhật lại — hai dòng comment liên quan (`apps/web/.env.example:12`, `"Production value: https://www.opentechwire.com"`) đã ở đúng trạng thái từ Phase 2, không có placeholder "chưa resolve" nào tồn tại. Không có gì phải sửa thêm ngoài 2 dòng `RESEND_FROM_DOMAIN` trên.

### Nhóm C — 6 storage key (Bước 8, D14)

| file:dòng | cũ | mới | loại |
|---|---|---|---|
| `apps/web/src/lib/article-views.ts:31` | `const STORAGE_KEY = "dtw-viewed";` | `"otw-viewed"` | `localStorage` |
| `apps/web/src/lib/paywall.ts:26` | `export const GUEST_METER_COOKIE = "dtw-read-count";` | `"otw-read-count"` | cookie (`path=/`, không có `domain=`) |
| `apps/web/src/components/theme-provider.tsx:16` | `const STORAGE_KEY = "dtw-theme";` | `"otw-theme"` | `localStorage` |
| `apps/web/src/lib/i18n.tsx:27` | `const STORAGE_KEY = "dtw-lang";` | `"otw-lang"` | `localStorage` |
| `apps/web/src/components/cookie-banner.tsx:8` | `const STORAGE_KEY = "dtw-cookies";` | `"otw-cookies"` | `localStorage` |
| `apps/web/src/components/header.tsx:20` | `const NUDGE_KEY = "dtw-nudge-dismissed";` | `"otw-nudge-dismissed"` | `localStorage` |

Casing: tiền tố `otw-` viết thường, theo §5.1.1 "Tiền tố định danh kỹ thuật" — không áp dụng luật D1 sentence-case vì đây là identifier kỹ thuật, không phải chuỗi hiển thị.

---

## 2. Quyết định về `email.ts:12` fallback domain, và vì sao

**Quyết định: giữ nguyên pattern fallback hiện tại (silent fallback), chỉ đổi giá trị fallback từ `"dailytechwire.com"` sang `"opentechwire.com"`. KHÔNG thêm hành vi throw-khi-thiếu-env ở production.**

Lý do:
- Plan (`phase-6-cutover_PLAN_08-09-26.md` Bước 3) mô tả việc đổi sang throw-ở-production là "một cải tiến hành vi, cần user xác nhận có muốn áp dụng ngay bây giờ hay giữ nguyên pattern fallback hiện tại" — tức là chính plan cũng coi đây là một quyết định **chưa chốt**, không phải một phần bắt buộc của Bước 3.
- Nhiệm vụ của lượt này được giao hẹp lại rõ ràng thành "CHỈ chuẩn bị code, KHÔNG cutover" và giới hạn đúng 3 nhóm A/B/C — không có xác nhận rõ ràng nào từ user trong phiên này về việc bật hành vi throw mới. Thêm một nhánh hành vi mới (ném lỗi khi `RESEND_FROM_DOMAIN` không set ở production) là một thay đổi logic ngoài phạm vi "đổi chuỗi/giá trị fallback" thuần tuý, và không nằm trong danh sách 3 nhóm được giao.
- Rủi ro nếu tự ý thêm: nếu Vercel env `RESEND_FROM_DOMAIN` (production) chưa được set đúng lúc mảnh code này redeploy (thứ tự thao tác con người ở cửa sổ cutover thật, ngoài tầm kiểm soát của lượt code này), một throw mới có thể làm sập toàn bộ luồng gửi mail auth (verify/reset) thay vì chỉ gửi nhầm domain — đổi mức độ nghiêm trọng của lỗi từ "degraded, không ai để ý" sang "auth email hỏng hoàn toàn" mà không có sự đồng thuận rõ ràng của user về đánh đổi này.
- Vẫn giữ được tính đúng đắn cho mục tiêu chính của Bước 3: khi cửa sổ cutover thật diễn ra và `RESEND_FROM_DOMAIN=opentechwire.com` được set trên Vercel cùng lúc với deploy chứa 2 file này, giá trị fallback mới không bao giờ thực sự được dùng — nó chỉ là an toàn lưới cho trường hợp env bị xoá nhầm sau này, và lúc đó fallback đúng domain mới vẫn tốt hơn fallback domain cũ (đứng yên tại domain đã ngừng phục vụ mail).

**Khuyến nghị cho lần EXECUTE cutover thật (không phải việc của lượt này)**: nếu user muốn áp dụng throw-ở-production, nên quyết định tường minh trong phiên PLAN/EXECUTE của chính cửa sổ cutover, không phải trong lượt chuẩn bị code này.

---

## 3. Danh sách ĐẦY ĐỦ storage key tìm được (grep độc lập, không chỉ tin theo 6 cái được liệt kê)

Đã chạy các lệnh sau trên toàn bộ `apps/web/src` (`.ts`/`.tsx`):

```bash
command grep -rn '"dtw-\|'"'"'dtw-\|`dtw-' apps/web/src --include="*.ts" --include="*.tsx"
command grep -rn "localStorage\.\(get\|set\|remove\)Item" apps/web/src --include="*.ts" --include="*.tsx"
command grep -rn "sessionStorage\." apps/web/src --include="*.ts" --include="*.tsx"
command grep -rn "document\.cookie" apps/web/src --include="*.ts" --include="*.tsx"
command grep -rn "GUEST_METER_COOKIE\|STORAGE_KEY\|NUDGE_KEY" apps/web/src --include="*.ts" --include="*.tsx"
```

Kết quả: **đúng 6 key** trong `apps/web/src`, khớp chính xác danh sách được giao — không có key thứ 7 nào trong code sản xuất của `apps/web`. Không có `sessionStorage` nào được dùng trong repo.

Toàn bộ nơi đọc/ghi từng key (đều thông qua **một hằng số duy nhất được export/khai báo trong đúng file đó**, không có literal string trùng lặp ở nơi khác — nên đổi 1 chỗ khai báo là đủ, không có rủi ro key đọc/ghi lệch nhau trong code hiện tại):

| Key | Hằng số | Khai báo | Đọc | Ghi | Xoá |
|---|---|---|---|---|---|
| `otw-viewed` | `STORAGE_KEY` | `article-views.ts:31` | `article-views.ts:65` (`window.localStorage.getItem`) | `article-views.ts:80` (`window.localStorage.setItem`) | — |
| `otw-read-count` | `GUEST_METER_COOKIE` | `paywall.ts:26` | `paywall.ts:65-67` (`parseCookie()`, đọc `document.cookie`) | `paywall.ts:84` (`writeCookie()`) | `paywall.ts:111` (set `max-age=0`) |
| `otw-theme` | `STORAGE_KEY` | `theme-provider.tsx:16` | `theme-provider.tsx:20` | `theme-provider.tsx:38` | — |
| `otw-lang` | `STORAGE_KEY` | `i18n.tsx:27` | `i18n.tsx:39` | `i18n.tsx:48` | — |
| `otw-cookies` | `STORAGE_KEY` | `cookie-banner.tsx:8` | `cookie-banner.tsx:16` | `cookie-banner.tsx:27` | — |
| `otw-nudge-dismissed` | `NUDGE_KEY` | `header.tsx:20` | `header.tsx:57` | `header.tsx:74` | — |

Đã grep chéo `GUEST_METER_COOKIE\|STORAGE_KEY\|NUDGE_KEY` toàn `apps/web/src` để loại trừ import ở nơi khác — **0 hit** ngoài đúng 6 file khai báo ở trên. Không có middleware, route handler, hay component nào khác import các hằng số này hoặc đọc trực tiếp chuỗi literal `"dtw-..."`.

**Ngoài phạm vi code sản xuất `apps/web/src` — đã thấy nhưng KHÔNG sửa (theo đúng ràng buộc "chỉ 3 nhóm A/B/C")**:
- `demos/ai-leaderboard-demo.html`, `demos/ai-leaderboard-table-preview.html` — có 2 key khác (`dtw-llmstats-key`, `dtw-theme` cục bộ trong demo). Đã kiểm tra: theo `process/features/rebrand/reports/phase-4-rendered-copy_REPORT_09-09-26.md` (dòng 150-151), hai key này **đã được Phase 4 đổi thành** `otw-llmstats-key`/`otw-theme` từ trước — không phải việc của lượt này, không đụng tới.
- `process/context/infra/all-infra.md:261`, `process/context/auth/all-auth.md:67`, `process/context/uxui/all-uxui.md:144,264`, `process/features/articles/_GUIDE.md:38,44` — các file context này hiện có ghi chú kiểu `` `dtw-cookies` (→ `otw-cookies` at rebrand Phase 6/D14) `` (do Phase 0 thêm sẵn để chờ Phase 6). Đây là **tài liệu**, không phải code storage key runtime, và nhiệm vụ được giao không bao gồm cập nhật docs — **cố ý để nguyên**, ghi vào mục "còn treo" bên dưới.
- `design/chats/chat1.md:1537` — lịch sử thiết kế, archive, không sửa (đúng §5.3 umbrella — hồ sơ lịch sử giữ nguyên).

---

## 4. Xác nhận typecheck

```
pnpm turbo run typecheck
```

Kết quả: **3/3 package thành công** (`@dtw/db`, `@dtw/ui` cache hit; `web` cache miss, chạy `tsc --noEmit` thật) — 0 lỗi. Log đầy đủ:

```
• Packages in scope: @dtw/config, @dtw/db, @dtw/ui, web
• Running typecheck in 4 packages
web:typecheck: > tsc --noEmit
@dtw/ui:typecheck: > tsc --noEmit
@dtw/db:typecheck: > tsc --noEmit
 Tasks:    3 successful, 3 total
Cached:    2 cached, 3 total
```

---

## 5. Verify grep sau khi sửa (Nhóm A/B/C)

```bash
command grep -n "DailyTechWire\|dailytechwire" apps/web/src/lib/email.ts apps/web/src/lib/auth.ts
# → không có output, sạch

command grep -n "RESEND_FROM_DOMAIN" .env.example apps/web/.env.example
# → .env.example:52:RESEND_FROM_DOMAIN="opentechwire.com"
# → apps/web/.env.example:51:RESEND_FROM_DOMAIN="opentechwire.com"

command grep -rn '"dtw-' apps/web/src --include="*.ts" --include="*.tsx"
# → không có output — 0 residual key cũ trong apps/web/src
```

`git status --short` xác nhận đúng 10 file bị sửa, không có file nào ngoài dự kiến:
```
 M .env.example
 M apps/web/.env.example
 M apps/web/src/components/cookie-banner.tsx
 M apps/web/src/components/header.tsx
 M apps/web/src/components/theme-provider.tsx
 M apps/web/src/lib/article-views.ts
 M apps/web/src/lib/auth.ts
 M apps/web/src/lib/email.ts
 M apps/web/src/lib/i18n.tsx
 M apps/web/src/lib/paywall.ts
```

---

## 6. Những gì còn treo và vì sao

1. **`footer.tsx:63-64` và `metadata.ts:90-91` (LinkedIn/Facebook `sameAs`) — CỐ Ý chưa sửa.** Plan giao Bước 6 nhưng bắt buộc social profile (LinkedIn vanity slug, Facebook username) phải đổi tên **trước**, và social **chưa đổi tên** tại thời điểm lượt code này chạy. Đã xác nhận bằng cách đọc trực tiếp hai file: `footer.tsx:63` vẫn là `https://www.linkedin.com/company/dailytechwire/`, `footer.tsx:64` vẫn là `https://www.facebook.com/apcgdailytechwire/`, `metadata.ts:90-91` khớp y hệt. Khi social đã đổi tên, sửa 2 file này **cùng một commit** (per plan, để không lệch nhau).
2. **Quyết định throw-ở-production cho `email.ts:12`** — xem mục 2, cố ý hoãn, cần user xác nhận rõ ràng trước khi thêm.
3. **Ghi chú docs `→ otw-* at rebrand Phase 6/D14`** trong `process/context/infra/all-infra.md`, `process/context/auth/all-auth.md`, `process/context/uxui/all-uxui.md`, `process/features/articles/_GUIDE.md` — các ghi chú này giờ đã "thành sự thật" (code đã đổi sang `otw-*`) nhưng bản thân ghi chú vẫn còn dạng "sẽ đổi ở Phase 6" thay vì phản ánh đã đổi xong. Đây là context-doc, không nằm trong 3 nhóm A/B/C được giao cho lượt này — để nguyên, đề xuất một lượt `vc-audit-context`/cập nhật context riêng sau khi code này merge thật (không phải bây giờ, vì merge chưa xảy ra).
4. **Mọi phần khác của Phase 6** (Bước 1, 2, 2b, 4, 4b, 4c, 4d, 4f, 5, 7, 9 — attach/detach domain Vercel, sửa Central `/admin`, DNS, GA4, OAuth swap, thông báo subscriber, v.v.) — **hoàn toàn chưa đụng tới**, đúng như phạm vi "chỉ chuẩn bị code" của nhiệm vụ này. Đây không phải thiếu sót, mà là ranh giới nhiệm vụ.

---

## 7. Cảnh báo cho user

**Nếu nhánh này merge mà KHÔNG lật `NEXT_PUBLIC_SITE_URL`/`BETTER_AUTH_URL`/`RESEND_FROM_DOMAIN` trên Vercel cùng lúc:**
- Site vẫn phục vụ `dailytechwire.com` (canonical không đổi vì code này không đụng `metadata.ts`/env value) nhưng mọi email auth (reset password, verify account) sẽ hiển thị `From: Opentechwire <no-reply@dailytechwire.com>` (nếu `RESEND_FROM_DOMAIN` prod hiện đang **có set** giá trị cũ `dailytechwire.com` một cách tường minh trên Vercel — fallback trong code chỉ áp dụng khi biến env **hoàn toàn không set**). Đây **chính xác là chữ ký phishing** mà tài liệu tham chiếu §5 cảnh báo: tên hiển thị mới ghép với domain gửi cũ.
- Nếu biến `RESEND_FROM_DOMAIN` trên Vercel prod hiện **không được set** (dựa vào fallback code), sau khi merge nó sẽ tự động fallback sang `"opentechwire.com"` — domain **chưa verify DKIM/SPF/DMARC thật trên Resend** (còn tuỳ Phase 1 đã xong tới đâu) — mail auth có thể bị đánh spam hoặc bị Resend từ chối gửi hoàn toàn, làm hỏng luồng đăng ký/reset password cho **mọi** người dùng, không chỉ domain hiển thị sai.
- 6 storage key đổi tên đồng nghĩa mọi state phía client hiện có (theme, ngôn ngữ, đã đọc bao nhiêu bài, đã dismiss nudge, đã đồng ý cookie) bị "quên" ngay khi code này chạy trên domain hiện tại (`dailytechwire.com`) — cookie banner sẽ hiện lại cho toàn bộ độc giả đang hoạt động, kể cả những người đã tắt nó từ lâu, **trước khi** domain cutover thật diễn ra. Đây là một trải nghiệm xấu không cần thiết nếu merge sớm — D14 chỉ "miễn phí" khi đi cùng lúc với việc đổi domain (D3), không phải khi đứng một mình trên domain cũ.
- `.env.example`/`apps/web/.env.example` đổi sẽ bust turbo cache một lần cho bất kỳ ai pull nhánh này — bình thường, không phải lỗi, nhưng cần biết trước.

**Nếu lật env var trên Vercel mà KHÔNG merge nhánh này cùng lúc:**
- `RESEND_FROM_DOMAIN=opentechwire.com` sẽ có hiệu lực (giá trị domain gửi mail đổi), nhưng code hiện tại (chưa merge) vẫn hiển thị `FROM = "DailyTechWire <no-reply@opentechwire.com>"` và 4 chuỗi subject/body vẫn là `DailyTechWire` — tên hiển thị cũ ghép với domain gửi mới. Đây **không phải** chữ ký phishing cổ điển (domain mới thực sự nắm bởi user) nhưng vẫn là một trạng thái nửa vời gây bối rối cho người nhận mail đang chờ thấy tên brand mới.
- `NEXT_PUBLIC_SITE_URL`/`BETTER_AUTH_URL` lật sang `www.opentechwire.com` trong khi 6 storage key trong code vẫn là `dtw-*` — không sao về mặt kỹ thuật (D14 nói rõ đổi domain đã tự xoá sạch state theo origin bất kể tên key), nhưng khi merge code sau đó, key sẽ đổi tên **lần thứ hai** trên domain mới, tạo thêm một lượt "quên state" phụ không cần thiết cho những độc giả đầu tiên đã dùng domain mới trước khi code storage-key merge.
- Kết luận thực dụng: đúng như umbrella §6b.3 đã lường trước — **hai việc này nên đi cùng một cửa sổ/cùng một deploy**. Nhánh `feat/rebrand-phase-6-cutover-code` được chuẩn bị sẵn đúng để merge **tại thời điểm** user lật 3 env var trên Vercel, không phải trước, không phải sau.

---

## Kết luận trạng thái

- **Đã hoàn thành đúng 3 nhóm A/B/C** được giao, không có gì ngoài phạm vi.
- **Chưa commit, chưa push, chưa merge** — đúng yêu cầu.
- **Typecheck sạch** (`pnpm turbo run typecheck` → 3/3 thành công).
- Nhánh này ở trạng thái **sẵn sàng merge tại đúng thời điểm cửa sổ cutover thật mở** (khi user lật `NEXT_PUBLIC_SITE_URL`/`BETTER_AUTH_URL`/`RESEND_FROM_DOMAIN` trên Vercel) — không sớm hơn, không muộn hơn.
