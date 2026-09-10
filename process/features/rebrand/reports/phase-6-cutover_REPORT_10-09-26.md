# Phase 6 — CUTOVER · Báo cáo thực thi

**Ngày**: 10-09-26
**Trạng thái**: ✅ Cửa một chiều đã đi qua — canonical đã chuyển sang `https://www.opentechwire.com`
**Plan**: `process/features/rebrand/active/phase-6-cutover_PLAN_08-09-26.md`

---

## Đã thực hiện

### Hạ tầng (ngoài repo)

| Việc | Kết quả |
|---|---|
| Thêm `opentechwire.com` + `www.opentechwire.com` vào Vercel project `dtw-web` | apex 308 → www, www phục vụ Production |
| Trỏ DNS tại tenten.vn | `A @ 216.150.1.1` · `CNAME www 5e3db69ee7e61c3c.vercel-dns-017.com.` |
| Bản ghi email của zone | `MX`, `SPF`, `DKIM`, `DMARC` xác nhận **còn nguyên vẹn** sau khi thêm bản ghi web |
| Upload monogram | `hero-images/logos/otw-monogram.png`, byte-identical với `apps/web/public/icon-512.png`; key cũ `dtw-monogram.png` giữ lại cho 12 social post đang queued |

### Biến môi trường Vercel (Production)

```
NEXT_PUBLIC_SITE_URL  → https://www.opentechwire.com
BETTER_AUTH_URL       → https://www.opentechwire.com
RESEND_FROM_DOMAIN    → opentechwire.com
```

Thứ tự áp dụng: **set env trước, merge sau**. Trên Vercel, đổi env không tự trigger build — merge mới trigger. Nhờ vậy một deploy duy nhất nuốt trọn cả ba biến và code đi kèm, không tồn tại cửa sổ live nào chạy env mới với code cũ hoặc ngược lại.

Lưu ý: `--force` qua CLI tách entry chung thành hai. Production nhận giá trị mới; **Preview giữ giá trị cũ ở entry riêng** (`NEXT_PUBLIC_SITE_URL` 57d, `BETTER_AUTH_URL` 66d, chưa bị đụng). Không mất dữ liệu, nhưng preview deployment vẫn trỏ domain cũ — đăng nhập trên preview sẽ không khớp redirect URI cho tới khi cập nhật.

### Code (merge `51c202b`)

`email.ts` FROM display name · 4 chuỗi tiêu đề/thân mail trong `auth.ts` · 6 storage key `dtw-*` → `otw-*` · hai `.env.example`.

---

## Xác minh sau deploy (đo trên production thật)

| Mục | Kết quả |
|---|---|
| `canonical` trên `www.opentechwire.com` | `https://www.opentechwire.com` |
| `canonical` trên `www.dailytechwire.com` | cũng trỏ `https://www.opentechwire.com` |
| `og:url` / `og:site_name` / `og:image` | domain mới · `Opentechwire` · `opentechwire.com/og-default.png` |
| Trang chủ render | 137.767 byte, 26 link bài — **không rơi vào trạng thái empty-degrade** |
| `og-default.png` | HTTP 200, 34.633 byte |
| `/api/auth/ok`, `/account` | 200 |
| `/rss.xml`, `/sitemap.xml`, `/llms.txt` | 200; RSS trỏ domain mới |
| Storage key trong bundle production | `otw-lang` hiện diện, **0 key `dtw-*`** |

Rủi ro "render trống, không báo lỗi" (`central-api.ts` degrade sang empty shape khi Central trả non-OK) **không xảy ra** — đây là kiểu hỏng âm thầm đáng lo nhất của phase này.

---

## Lệch khỏi plan, có chủ đích

**Bước 2 (`PUBLIC_API_ALLOWED_ORIGINS` + R2 CORS) — BỎ, không cần.**
Plan yêu cầu thêm origin mới vào cả hai. Kiểm code thì cả hai đều không áp dụng:
- `apps/web/src/lib/central-api.ts:1` là `import "server-only"` — mọi request tới Central đi từ server Next.js. **CORS là cơ chế trình duyệt, không áp cho server-to-server.** Không có code client nào gọi Central.
- `apcg-cms/src/lib/public.ts:22` chỉ *set* header phản hồi, không từ chối request.
- Không có tham chiếu R2 nào trong `apps/web`; ảnh phục vụ từ `apcg-cms.vercel.app/api/media/file`. R2 thuộc Payload nhúng, mà Payload **đã bị gỡ** khỏi repo này (`8f8de17`).

Plan viết khi `dtw-web` còn nhúng Payload và còn dùng R2. Cả hai giả định đã lỗi thời.

**Bước 2b (gỡ domain cũ khỏi Vercel + DNS) — CHƯA làm.** Domain cũ vẫn phục vụ 200 với canonical trỏ domain mới. Đây là trạng thái tốt hơn cắt đứt ngay: link cũ không 404 trong khi search engine vẫn hiểu bản chính là domain mới. Gỡ hẳn khi nào thấy hợp lý.

**`RESEND_FROM_DOMAIN` lật dù Resend chưa verify — quyết định có ý thức của user.**
`dig` xác nhận không domain nào của tổ chức có `resend._domainkey`, kể cả domain cũ. Mail giao dịch **vốn đã hỏng từ trước** vì cùng lý do, nên lật không phá vỡ đường đang chạy — nó làm hai nửa khớp nhau để việc verify domain sau này là bước duy nhất còn lại, không cần đụng code hay config thêm.

Hệ quả vẫn còn: đăng ký bằng email không dùng được. `auth.ts:17-30` nuốt lỗi gửi mail nên tài khoản vẫn được tạo, rồi `requireEmailVerification` chặn đăng nhập vĩnh viễn. Chỉ Google OAuth hoạt động. Theo dõi ở `process/features/account/backlog/reader-email-auth-deliverability_PLAN_09-09-26.md`.

---

## Còn treo

| Việc | Chặn bởi |
|---|---|
| Resend verify `opentechwire.com` | user — đây là thứ mở khoá lại đăng ký bằng email |
| `tenant.domain` + `frontendUrl` bên Central `/admin` | user |
| Đổi tên profile LinkedIn/Facebook → rồi `footer.tsx:63-64` + `metadata.ts:90-91` (`sameAs`) | phải đổi handle trước, nếu không là trỏ vào profile không tồn tại |
| GA4 data-stream URL + referral exclusion | user |
| Cập nhật env Preview cho khớp Production | user, nếu có dùng preview để test auth |
| Xoá `hero-images/logos/dtw-monogram.png` | sau khi 12 social post queued chạy hết |

---

## Xác nhận bổ sung (10-09-26)

**Đăng nhập Google trên `https://www.opentechwire.com` — user đã thử thật và xác nhận hoạt động.**

Đây là hạng mục duy nhất của cutover không kiểm chứng được từ xa: `/api/auth/ok` trả 200 chỉ chứng minh route sống, không chứng minh `redirect_uri` mới đã được Google chấp nhận. OAuth chỉ lộ `redirect_uri_mismatch` ở lần sign-in thật đầu tiên. Với xác nhận này, chuỗi `BETTER_AUTH_URL` → callback URL → Google OAuth Client đã khép kín trên domain mới.

Ghi chú giữ lại cho sau: `NEXT_PUBLIC_GITHUB_ENABLED` không set trên production nên nút GitHub không render — cái bẫy "OAuth App classic chỉ có một ô callback" của plan gốc không bao giờ áp dụng. Nếu sau này bật GitHub, phải xử lý riêng vì không thể thêm callback song song như Google.

