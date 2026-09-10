# Đường xác thực email của độc giả — nghi vấn chết im lặng

**Date**: 09-09-26
**Status**: ⏳ PLANNED (backlog — user chủ động hoãn 09-09-26 để ưu tiên chương trình rebrand)
**Complexity**: MEDIUM
**Feature**: `account`
**Không thuộc chương trình rebrand.** Độc lập — phát hiện trong lúc audit rebrand 09-09-26.

> **Nghi vấn: độc giả đăng ký mới không bao giờ đăng nhập được, và không ai — kể cả họ, kể cả server — nhận được tín hiệu gì.**
> Chưa xác nhận end-to-end. Cần một lần thử thật (xem bước 1).

---

## Bằng chứng DNS (đã kiểm chứng 09-09-26)

Không domain nào của tổ chức có DKIM của Resend:

```bash
$ dig +short TXT resend._domainkey.dailytechwire.com    → (rỗng)
$ dig +short TXT resend._domainkey.opentechwire.com     → (rỗng)
$ dig +short TXT resend._domainkey.briefasia.com        → (rỗng)
$ dig +short TXT resend._domainkey.asiapresscentre.org  → (rỗng)
# đã thử thêm 8 selector khác (send.*, s1, s2, k1, mail, selector1, default@send…) — rỗng hết

$ dig +short TXT dailytechwire.com
"v=spf1 include:emg01.emailserver.net.vn ~all"          ← KHÔNG có Resend

$ dig +short TXT default._domainkey.dailytechwire.com
"v=DKIM1; k=rsa; p=MIIBIjAN..."                         ← của tenten.vn, không phải Resend
```

DKIM duy nhất tồn tại là của dịch vụ mailbox tenten (dùng cho hộp thư người thật như `editor@`). **Resend chưa từng verify domain nào của tổ chức này**, kể cả domain đang chạy production.

## Bằng chứng code

| File | Dòng | Nội dung | Hệ quả |
|---|---|---|---|
| `apps/web/src/lib/email.ts` | 12 | `RESEND_FROM_DOMAIN \|\| "dailytechwire.com"` | gửi từ domain không có DKIM/SPF cho Resend |
| `apps/web/src/lib/email.ts` | 13 | `FROM = "DailyTechWire <no-reply@…>"` | |
| `apps/web/src/lib/email.ts` | 25-26 | không có `RESEND_API_KEY` → `console.log` rồi `return` | **thất bại im lặng** |
| `apps/web/src/lib/auth.ts` | 21-29 | `try { sendEmail } catch { console.error }` | **nuốt lỗi**, luồng account vẫn tiếp tục |
| `apps/web/src/lib/auth.ts` | 70 | `requireEmailVerification: true` | không verify được = không đăng nhập được |
| `apps/web/src/lib/auth.ts` | 88 | `sendOnSignUp: true` | |

Chuỗi hỏng:

```
độc giả đăng ký
  → row auth_users được tạo
  → mail verify không tới (hoặc tới nhưng không xác thực SPF/DKIM → dễ vào spam)
  → requireEmailVerification: true chặn đăng nhập VĨNH VIỄN
  → không log phía user, không alert phía server
```

Cùng chuỗi đó áp cho **quên mật khẩu**.

Lưu ý phạm vi: repo **không có magic link** (`auth.ts:45-47` ghi rõ *"No magic link, no Apple"*). Auth hiện tại là email + password (kèm forgot/reset) + Google OAuth. Nên OAuth **không bị ảnh hưởng** — chỉ luồng email+password hỏng.

## Dấu hiệu chưa ai từng chạy thật

`process/features/account/reports/reader-auth-account-simple_REPORT_03-07-26.md:75` tự ghi nhận mọi test DB-backed là *"implemented but unexecuted and unverified"*. Nghĩa là luồng này có thể chưa từng được chạy end-to-end trên production. Lỗi có thể đã tồn tại từ ngày auth lên production.

## Việc cần làm

1. **Thử thật trên production, trước mọi thứ khác** *(10 phút, chỉ user làm được)*
   Chạy luồng quên mật khẩu với một địa chỉ mail thật. Kiểm cả Inbox lẫn Spam.
   - Mail **tới Inbox** → nghi vấn sai, đóng backlog này, chỉ giữ mục 4.
   - Mail **vào Spam** → vấn đề là xác thực (SPF/DKIM) → mục 2.
   - Mail **không tới** → kiểm `RESEND_API_KEY` có được set trên Vercel không → mục 2 + 3.
2. **Verify domain trong Resend**: thêm domain, publish `resend._domainkey`, và **MERGE** Resend vào SPF hiện có — không được THAY. SPF hiện tại đang phục vụ mailbox tenten; ghi đè là phá luồng mail người thật.
   *(Trùng một phần với Phase 1 của rebrand — nếu làm rebrand trước thì làm luôn cho `opentechwire.com`, nhưng domain cũ vẫn cần fix nếu còn phục vụ độc giả.)*
3. **Kiểm số thiệt hại**: đếm row trong `dtw_auth.auth_users` có `emailVerified = false` và `createdAt` cũ hơn 24h. Đó là những người đã đăng ký mà không vào được. Cân nhắc gửi lại verify sau khi sửa xong.
4. **Bỏ thất bại im lặng** *(việc kỹ thuật, làm được không cần quyền ngoài)*
   `auth.ts:21-29` nuốt lỗi gửi mail rồi để luồng đi tiếp. `email.ts:25` return im lặng khi thiếu API key. Ít nhất phải: log ở mức error kèm cảnh báo rõ ràng khi thiếu `RESEND_API_KEY` ở môi trường production, và cân nhắc trả lỗi cho user thay vì giả vờ thành công.

## Liên quan

- `apps/web/src/lib/email.ts`, `apps/web/src/lib/auth.ts`
- `process/features/account/reports/reader-auth-account-simple_REPORT_03-07-26.md`
- `process/context/auth/all-auth.md`
- Phase 1 của rebrand (`process/features/rebrand/active/phase-1-long-clocks_PLAN_08-09-26.md`) — nhóm D làm Resend cho domain MỚI; plan đó **chưa** tính tới việc domain CŨ cũng chưa từng verify
- Cảnh báo SPF phải merge chứ không thay: cũng áp cho `opentechwire.com`, domain đó đã có sẵn SPF/DMARC/DKIM của tenten
