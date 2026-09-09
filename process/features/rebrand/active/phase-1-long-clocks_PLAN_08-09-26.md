# Rebrand: Dailytechwire → Opentechwire — Phase 1: Bấm đồng hồ cho việc chạy lâu (external long clocks)

**Date**: 08-09-26 (viết 09-09-26, cùng chuỗi ngày với umbrella + tài liệu tham chiếu để giữ chương trình nhất quán)
**Loại**: DIRECT PHASE PLAN — phase 1/8 của một phase program (theo `process/development-protocols/phase-programs.md`)
**Complexity**: SIMPLE về công sức code (0 dòng code, 0 file repo bị sửa) — nhưng KHÔNG được coi nhẹ: wall-clock dài nhất toàn chương trình (vài ngày–vài tuần) và có 1 sub-step bán-one-way
**Feature**: `rebrand`
**Plan file**: `process/features/rebrand/active/phase-1-long-clocks_PLAN_08-09-26.md`
**Umbrella plan**: `process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md` (đọc trước — chứa ledger D1–D15, không được bàn lại ở đây)
**Tài liệu tham chiếu nền**: `process/general-plans/references/rebrand-opentechwire_REFERENCE_08-09-26.md` — các đoạn dùng cho phase này: §1 "Tóm tắt điều hành" (dòng 15-17), §4.4 "Việc nằm hoàn toàn ngoài mọi repo" (dòng 573-596), §5 "Rủi ro SEO và tính liên tục" (dòng 602-621, riêng dòng OAuth/Resend), §7 "Phase 1 — Bấm đồng hồ" gốc (dòng 668-678), §8 "Câu hỏi mở" mục #2, #3, #4, #5, #13 (dòng 308-312, 319)
**Naming note**: tên file theo quy ước thống nhất của cả 8 phase (`phase-N-<slug>_PLAN_<dd-mm-yy>.md`, xem bảng có thẩm quyền ở umbrella §3). Report dùng cùng slug: `phase-1-long-clocks_REPORT_<dd-mm-yy>.md`. **Primary execute anchor**: file này (`phase-1-long-clocks_PLAN_08-09-26.md`) là **execute anchor duy nhất** cho Phase 1 — nó là một direct `*_PLAN_*.md` hoàn chỉnh, tự chứa toàn bộ nội dung cần thiết. Không có **supporting phase files** hay `phase-*.md` phụ trợ nào khác đi kèm; tên file chỉ tình cờ trùng tiền tố `phase-` với heuristic nhận diện "legacy plan shape" của validator (`isLegacyPlanShape`) — đây không phải một cấu trúc multi-file kiểu cũ (`PLAN.md` + `phase-*.md` rời rạc).
**Status**: ⏳ PLANNED — chưa có bất kỳ hành động thủ công nào được thực hiện ở bất kỳ dashboard ngoài repo nào. Các lệnh `dig` (DNS, read-only) trong tài liệu này đã được chạy thật ngày 09-09-26 chỉ để làm mới bằng chứng nghiên cứu — không đổi trạng thái bất kỳ hệ thống nào.

---

## Overview

Bắt đầu **ngay bây giờ**, song song với mọi phase khác của chương trình rebrand, toàn bộ việc thủ công nằm **ngoài mọi repo** có lead time đo bằng ngày–tuần: xác nhận quyền sở hữu + hạn `opentechwire.com`, tra cứu sơ bộ khả năng đăng ký nhãn hiệu "Opentechwire"/"OTW", thêm domain mới vào Resend rồi publish SPF/DKIM/DMARC và bắt đầu warm-up, và **thêm** (không thay) các OAuth redirect URI mới ở Google + GitHub. Đây là long-pole của toàn chương trình — Phase 6 (CUTOVER) không được phép bắt đầu cho tới khi các mục này sẵn sàng.

**Hệ quả D4 chi phối toàn bộ phase này** (đọc kỹ trước khi làm bất kỳ bước nào): theo ledger đã chốt, chương trình rebrand **không** dùng redirect 301 và **không** nộp Change of Address từ `dailytechwire.com` sang domain mới, vì lý do Google manual action trên domain cũ là di sản của chủ trước và cơ chế 301/CoA chính là con đường khiến một hình phạt "đi theo" sang tên miền mới. Hệ quả trực tiếp cho Phase 1: việc kiểm tra Google Search Console ở phase này đổi từ "điều kiện chặn cứng phải gỡ xong mới được migrate" (khuyến nghị gốc của tài liệu tham chiếu) thành **due-diligence mang tính thông tin thuần tuý** — xem chi tiết ở Nhóm C bên dưới.

---

## Explicitly Out Of Scope (và trỏ sang phase nào)

| Việc | Vì sao không thuộc Phase 1 | Thuộc phase nào |
|---|---|---|
| Redirect 301 từ `dailytechwire.com`, bất kỳ hình thức nào | D4 loại bỏ vĩnh viễn trong toàn chương trình | Không thuộc phase nào — cấm vĩnh viễn |
| Nộp Change of Address (Google Search Console) | D4 loại bỏ vĩnh viễn | Không thuộc phase nào — cấm vĩnh viễn |
| Nộp reconsideration request cho manual action của domain cũ | Xem lý do ở Nhóm C — đây là hệ quả của D4, không phải bỏ sót | Ngoài phạm vi toàn chương trình (là quyết định độc lập của user nếu muốn, không phải việc của rebrand) |
| Sửa bất kỳ file code nào trong `dtw-web` / `content-engine` / `apcg-cms` | Phase 1 là 100% việc ngoài repo | Phase 2 (canonical host), Phase 3 (mark), Phase 4 (copy), Phase 5 (content-engine) |
| Lật `NEXT_PUBLIC_SITE_URL`, `BETTER_AUTH_URL`, `RESEND_FROM_DOMAIN`, gắn domain vào Vercel, thêm origin vào `PUBLIC_API_ALLOWED_ORIGINS`/CORS R2 | Đây là các bước "lật" thật — Phase 1 chỉ chuẩn bị additive | Phase 6 (CUTOVER) |
| Đổi vanity slug LinkedIn / username Facebook | Có rate-limit, cần domain mới đã sống trước | Phase 6 |
| Nộp đơn nhãn hiệu thật (filing/opposition) | Phase 1 chỉ làm bước "clearance check" sơ bộ | Ngoài phạm vi toàn chương trình — việc pháp lý riêng nếu user quyết định theo đuổi |
| Merge worktree `content-engine-kpi-gd1-publish-caps` | Không liên quan tới việc ngoài repo | Phase 5 |
| Đổi tên schema `dtw_auth` / bucket `dtw-media` / slug `dtw` | D11/D12 — đóng băng vĩnh viễn | Không thuộc phase nào |
| Đổi tên package scope `@dtw/*` | D6 — hoãn có chủ đích | Phase 7 (tuỳ chọn) |

---

## Dependencies

- **Không phụ thuộc phase nào để bắt đầu** — không cần chờ Phase 0 hoàn thành (Phase 0 chỉ ghi context, không tạo ra tiền đề kỹ thuật nào mà Phase 1 cần).
- Chạy **song song** với Phase 0, 2, 3, 4, 5.
- **Chặn Phase 6** — Phase 6's "additive trước" liệt kê thẳng "OAuth redirect URI mới đã thêm, Resend đã verified + warmed" là tiền đề bắt buộc trước khi cửa sổ cutover mở.
- **Phụ thuộc nội bộ trong chính phase này**: Nhóm D (Resend + DNS) phụ thuộc Nhóm A (xác nhận quyền chỉnh DNS zone) hoàn tất trước — không thể thêm bản ghi TXT/CNAME/MX nếu chưa xác nhận có quyền sửa DNS zone của `opentechwire.com`.
- Nhóm B (trademark), Nhóm C (GSC due-diligence), và Nhóm E (OAuth) độc lập với nhau và với Nhóm A/D — có thể làm theo bất kỳ thứ tự nào, kể cả đồng thời.

---

## Implementation Checklist

Toàn bộ 23 bước dưới đây là **việc thủ công của user** trên các dashboard bên ngoài repo. Agent (kể cả vc-execute-agent) **không tự thực hiện được** các bước này — vai trò của agent trong phase này là: nhắc đúng thứ tự, xác nhận tiền đề, và ghi lại bằng chứng THẬT vào report sau khi user đã làm xong từng bước, cộng với các lệnh `dig` (DNS, read-only) mà agent CÓ THể tự chạy để xác minh chéo.

### Nhóm A — Xác nhận sở hữu + hạn domain `opentechwire.com` tại tenten.vn

1. **[A.1]** Đăng nhập tài khoản registrar tenten.vn hiện đang quản lý `dailytechwire.com`. Xác nhận `opentechwire.com` cũng nằm trong **cùng tài khoản** đó (không chỉ cùng nameserver). Bằng chứng DNS sẵn có (chạy lại 09-09-26, xem Verification Evidence #1): cả hai domain trả về đúng 3 nameserver `ns-a1.tenten.vn` / `ns-a2.tenten.vn` / `ns-a3.tenten.vn` — khớp với phát hiện gốc trong tài liệu tham chiếu §1 dòng 16 (SOA serial `1778496045`, 2026-05-11). **Lưu ý (§8 ẩn số #5)**: `dig` chỉ chứng minh cùng nameserver, KHÔNG chứng minh cùng chủ tài khoản đăng nhập — bước này bắt buộc phải xác nhận qua panel đăng nhập thật, không suy luận từ DNS.
2. **[A.2]** Trong panel domain của tenten.vn, đọc ngày hết hạn (expiry) của `opentechwire.com`. Nếu hết hạn trong vòng 60 ngày kể từ hôm nay, gia hạn ngay — đừng để domain hết hạn giữa chương trình rebrand.
3. **[A.3]** Xác nhận có quyền chỉnh sửa DNS zone của `opentechwire.com` (thêm/sửa/xoá bản ghi TXT, CNAME, MX). Cần cho Nhóm D ngay bây giờ, và cho Phase 6 sau này (A record/CNAME trỏ Vercel). **KHÔNG thêm A record nào ở bước này** — domain giữ nguyên hiện trạng "parked, chỉ có MX" (xác nhận 09-09-26: không có A record, MX trỏ `mail.opentechwire.com`, xem Verification Evidence #1).
4. **[A.4]** Ghi kết quả Nhóm A vào report: tên tài khoản registrar, ngày hết hạn thật, xác nhận quyền chỉnh DNS (có/không). Đây là điều kiện chặn cứng cho Nhóm D và cho toàn bộ Phase 6.

### Nhóm B — Trademark clearance sơ bộ ("Opentechwire" / "OTW"), Singapore trước, class 16/38/41/42

5. **[B.1]** Tra cứu nhãn hiệu tại cổng tra cứu của IPOS (Intellectual Property Office of Singapore) cho cụm từ "Opentechwire" và "OTW", theo Nice Class **16** (ấn phẩm in), **38** (viễn thông/truyền phát điện tử), **41** (giáo dục/giải trí/xuất bản), **42** (dịch vụ công nghệ, nếu cổng tra cứu áp dụng cho một publication công nghệ). Lưu kết quả tra cứu (export/PDF/screenshot) vào `process/features/rebrand/reports/`.
6. **[B.2]** Đối chiếu với phát hiện đã có sẵn trong tài liệu tham chiếu (§8 ẩn số #4, dòng 310): nhãn hiệu **"Opentech"** còn hiệu lực tại USPTO, số đơn **98228544**, class **009**. Đánh giá mức xung đột: khác chính tả ("Opentechwire" so với "Opentech"), khác class (009 so với 16/38/41/42 đang tra), khác quốc gia (USPTO so với IPOS Singapore) — ghi nhận đây là **rủi ro thấp đã biết trước**, không phải điều bị bỏ sót nếu vẫn còn đó sau khi tra cứu.
7. **[B.3]** Ghi nhận (không cần hành động pháp lý) namespace `*techwire` khá đông đã ghi trong tài liệu tham chiếu §1 dòng 17: `techwireasia.com`, `techwire.net`, `techwire.in`. Đây là tên miền đã đăng ký, không phải nhãn hiệu — không cấu thành xung đột pháp lý trực tiếp nhưng có thể gây nhầm lẫn thương hiệu về sau, ghi vào report như một lưu ý.
8. **[B.4]** Kết luận rõ ràng một trong ba trạng thái: **CLEAR** / **CÓ ĐIỀU KIỆN** / **CHẶN**. Nếu CÓ ĐIỀU KIỆN hoặc CHẶN: dừng lại, báo cáo user, và **không tự ý** tiếp tục sang các bước công bố công khai rộng rãi ở Phase 6 (đổi social handle, PR ra ngoài) cho tới khi user quyết định hướng xử lý. Kết luận này **không** chặn các phase code (0, 2, 3, 4, 5) vì chúng không công bố tên ra công chúng.

### Nhóm C — Due-diligence Google Search Console (chỉ để biết, KHÔNG có hành động bắt buộc)

9. **[C.1]** Đăng nhập Google Search Console, mở property `dailytechwire.com` (hoặc `sc-domain:dailytechwire.com` nếu đã verify ở dạng domain property). Mở panel **Security & Manual Actions**. Ghi lại: còn liệt kê manual action hay không, loại gì, ngày áp dụng — đối chiếu với dữ kiện đã biết ở `content-engine/admin/src/lib/byline-policy.ts:256` (comment: `"site đang bị Google manual action"`, dùng để giải thích `hardDailyCap: 4` chặt hơn 4 publication khác).
10. **[C.2]** Mở report Coverage/Performance, kéo một bản export mới **bổ sung** — **KHÔNG thay thế** `dailytechwire.com-Coverage-2026-08-06.zip` đang nằm ở gốc repo `dtw-web` (file này thuộc danh sách "cấm động" ở umbrella §5.3, phải giữ nguyên làm bằng chứng lịch sử). Lưu file export mới vào `process/features/rebrand/reports/`, **không** lưu vào gốc repo để tránh lẫn với file cấm động nói trên.
11. **[C.3]** Ghi rõ trong report: theo hệ quả D4 (umbrella §4 mục 5), đây **chỉ** là due-diligence mang tính thông tin. **KHÔNG** nộp reconsideration request. **KHÔNG** nộp Change of Address. **Không có hành động bắt buộc nào tiếp theo** dù kết quả kiểm tra là gì — khác hẳn khuyến nghị gốc của tài liệu tham chiếu §7 Phase 1 (dòng 670-671, 677) vốn coi việc gỡ manual action + nộp reconsideration là điều kiện chặn cứng trước khi migrate. Nếu user muốn dọn sạch danh tiếng domain cũ vì một lý do độc lập khác (ví dụ định dùng lại domain cho việc khác sau này), đó là quyết định **nằm ngoài phạm vi chương trình rebrand này**, không tự động được đề xuất ở đây.

### Nhóm D — Resend: thêm domain mới, publish SPF/DKIM/DMARC, bắt đầu warm-up (phụ thuộc Nhóm A xong)

12. **[D.1] — PHÁT HIỆN MỚI, đọc kỹ trước khi làm gì tiếp**: trước khi thêm domain mới vào Resend, xác nhận trạng thái THẬT của `dailytechwire.com` trong Resend dashboard (Verified / Unverified / không tồn tại trong tài khoản). Bằng chứng DNS live vừa xác minh hôm nay (09-09-26, xem Verification Evidence #2) cho thấy `dailytechwire.com` **KHÔNG có** bản ghi `resend._domainkey.dailytechwire.com` (TXT) và **KHÔNG có** `send.dailytechwire.com` (CNAME/MX) — hai bản ghi mà Resend bắt buộc phải tồn tại nếu domain này từng được verify thành công. SPF hiện tại của domain (`v=spf1 include:emg01.emailserver.net.vn ~all`) trỏ tới một nhà cung cấp email khác, **không phải** `include:amazonses.com` (dấu hiệu đặc trưng khi một domain đã verify qua Resend/AWS SES). Đây là ẩn số **mới**, không có trong tài liệu tham chiếu 08-09-26 — kết luận tạm: Resend **có thể chưa từng được xác minh thành công** cho `dailytechwire.com` trong production, trái với giả định ngầm của `RESEND_FROM_DOMAIN="dailytechwire.com"` (`apps/web/.env.example:51`, `.env.example:52`) và fallback cứng ở `apps/web/src/lib/email.ts:12-13`. **Không sửa gì bây giờ** — chỉ xác nhận qua Resend dashboard thật và báo ngay cho user, vì nó có thể ảnh hưởng tới việc email xác minh/khôi phục mật khẩu trên production **ngay hôm nay**, độc lập với rebrand (xem Risks #4).
13. **[D.2]** Trong Resend dashboard, thêm `opentechwire.com` như một **sending domain mới**, song song — **không xoá/sửa** domain `dailytechwire.com` hiện có (nếu tồn tại) cho tới Phase 6.
14. **[D.3]** Lấy đúng các bản ghi DNS mà Resend hiển thị cho domain mới (thường gồm: một bản ghi MX cho subdomain gửi thư, một TXT SPF cho cùng subdomain, một TXT DKIM dạng `resend._domainkey.<domain>`, tuỳ chọn một TXT DMARC ở `_dmarc.<domain>`) — **copy chính xác giá trị Resend hiển thị**, đừng gõ tay hay đoán tên bản ghi/selector.
15. **[D.4]** Thêm các bản ghi đó vào DNS zone `opentechwire.com` tại tenten.vn, dùng quyền đã xác nhận ở bước A.3.
16. **[D.5]** Chờ Resend xác nhận domain đã verify (có thể vài giờ đến vài ngày do TTL DNS). Xác minh chéo bằng lệnh `dig` (Verification Evidence #3) **và** bằng trạng thái "Verified" hiển thị thật trên chính Resend dashboard — `dig` trả về đúng giá trị không tự động nghĩa là Resend đã re-check và đánh dấu verified.
17. **[D.6]** Sau khi verified: bắt đầu warm-up gửi (dùng tính năng warm-up có sẵn của Resend, hoặc tự gửi tăng dần thủ công theo khối lượng nhỏ). **Tuyệt đối không** set `RESEND_FROM_DOMAIN=opentechwire.com` ở bất kỳ môi trường nào (dev/staging/prod) trong bước này — việc lật giá trị đó thuộc Phase 6.
18. **[D.7]** Ghi vào report: ngày verify, ngày bắt đầu warm-up, khối lượng gửi mỗi ngày trong giai đoạn warm-up. Đây là điều kiện chặn cứng cho Phase 6 — umbrella liệt kê thẳng "Resend đã verified + warmed" là tiền đề additive bắt buộc trước cửa sổ cutover.

### Nhóm E — OAuth: THÊM (không thay) redirect URI mới ở Google và GitHub

19. **[E.1]** Xác nhận hình dạng callback URL thật của Better-Auth trong repo: route xử lý OAuth nằm ở `apps/web/src/app/api/auth/[...all]/route.ts`, dùng `basePath` mặc định `/api/auth` (không có override nào tìm thấy trong `apps/web/src/lib/auth.ts`) → hai URI callback mới cần thêm là:
   - `https://www.opentechwire.com/api/auth/callback/google`
   - `https://www.opentechwire.com/api/auth/callback/github`
20. **[E.2]** Google Cloud Console → APIs & Services → Credentials → mở đúng OAuth 2.0 Client ID đang khớp `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` (`apps/web/.env.example:39-40`, `.env.example:30-31`, dùng có điều kiện qua `googleConfigured` ở `apps/web/src/lib/auth.ts`) → mục "Authorized redirect URIs" → **THÊM** `https://www.opentechwire.com/api/auth/callback/google` vào danh sách. Trước khi thêm, xác nhận đúng giá trị URI đang tồn tại hôm nay (khả năng là `https://www.dailytechwire.com/api/auth/callback/google`, nhưng phải đọc thật từ console, không giả định) — giữ nguyên URI đó, không xoá.
21. **[E.3]** GitHub → Settings → Developer settings → xác nhận app đang dùng khớp `GITHUB_CLIENT_ID`/`GITHUB_CLIENT_SECRET` (`apps/web/.env.example:45-46`, `.env.example:36-37`) là loại **"OAuth Apps"** (classic) hay **"GitHub Apps"**. **Ẩn số kỹ thuật chưa xác minh** (không có trong tài liệu tham chiếu 08-09-26, không có bằng chứng nào trong repo về loại app — đã grep, 0 hit): theo hiểu biết phổ biến về sản phẩm GitHub, OAuth Apps (classic) chỉ có **một** ô "Authorization callback URL" duy nhất (không phải danh sách), khác GitHub Apps vốn có thể cấu hình nhiều callback URL. Nếu xác nhận đây là OAuth App classic và chỉ nhận một URL: việc "thêm không thay" theo đúng nghĩa đen là **bất khả thi về mặt kỹ thuật** cho riêng GitHub — ghi rõ phát hiện này vào report, và dời việc đổi giá trị GitHub sang làm **cùng lúc** với cửa sổ Phase 6 (ngay trước/sau khi lật `BETTER_AUTH_URL`), khác với Google (làm trước, ngay bây giờ). Nếu app cho phép nhiều URL (hoặc là GitHub App), thêm `https://www.opentechwire.com/api/auth/callback/github` song song với URL cũ, giống Google.
22. **[E.4] — TUỲ CHỌN, bán-one-way, PHẢI hỏi user xác nhận trước khi làm**: đổi tên app hiển thị trên OAuth consent screen (Google) và/hoặc tên app GitHub — chỉ làm **sau khi** bước E.2 (và E.3 nếu khả thi) đã xong. Cảnh báo: đổi tên một app Google đã verified **có thể kích hoạt lại quy trình brand verification** với wall-clock không đoán trước được (tài liệu tham chiếu §4.4 dòng 578: "vài ngày–vài tuần"). Vì mục đích của Phase 1 là "bấm đồng hồ cho việc dài", làm bước này ngay bây giờ giúp một đợt review (nếu bị kích hoạt) chạy song song với các phase khác — nhưng phạm vi gốc mà orchestrator giao cho phase này chỉ yêu cầu "thêm", **không yêu cầu đổi tên app**. Vì vậy bước này là **lựa chọn**, không phải yêu cầu bắt buộc để coi Phase 1 là hoàn thành — hỏi user trước khi thực hiện, đừng tự ý làm.
23. **[E.5]** Ghi report: URI nào đã thêm ở đâu, ngày thêm, trạng thái xử lý (đã áp dụng ngay / đang chờ Google-GitHub xử lý), và quyết định cụ thể cho GitHub ở bước E.3 (thêm được ngay, hay dời sang Phase 6).

---

## Touchpoints

**File trong `dtw-web` bị sửa bởi phase này: 0.** Đây là đặc điểm cố ý của Phase 1 — toàn bộ 23 bước là thao tác trên dashboard bên ngoài, không có `git diff` nào trong `dtw-web`/`content-engine`/`apcg-cms` sau khi phase này hoàn tất, ngoại trừ file plan/report trong `process/features/rebrand/`.

**Hệ thống ngoài repo bị chạm (additive, không phá vỡ cấu hình hiện có):**
- Registrar tenten.vn — panel quản lý domain `opentechwire.com` (đọc + có thể gia hạn nếu cần; không sửa DNS zone của `dailytechwire.com`).
- Cổng tra cứu nhãn hiệu IPOS (Singapore) — chỉ đọc/tra cứu.
- Google Search Console — property `dailytechwire.com` (chỉ đọc panel Manual Actions + Coverage/Performance).
- Resend dashboard — thêm domain mới `opentechwire.com`, publish DNS records do Resend cấp.
- Google Cloud Console — OAuth 2.0 Client ID hiện tại (thêm 1 redirect URI mới vào danh sách đã có).
- GitHub Developer Settings — OAuth App/GitHub App hiện tại (thêm redirect URI mới nếu kỹ thuật cho phép; nếu không, chỉ ghi nhận phát hiện).

**File trong repo được ĐỌC làm bằng chứng/ngữ cảnh (không bị sửa):**
- `apps/web/src/app/api/auth/[...all]/route.ts` — xác nhận basePath `/api/auth` cho URI callback.
- `apps/web/src/lib/auth.ts` — xác nhận `googleConfigured`/`githubConfigured` đọc từ `GOOGLE_CLIENT_ID`/`GITHUB_CLIENT_ID`.
- `apps/web/.env.example:39-52`, `.env.example:30-52` — tên biến env OAuth + Resend.
- `apps/web/src/lib/email.ts:1-40` — cách `RESEND_FROM_DOMAIN` được dùng, fallback cứng dòng 12-13.
- `content-engine/admin/src/lib/byline-policy.ts:243-260` — nguồn dữ kiện "site đang bị Google manual action" (dòng 256).
- `dailytechwire.com-Coverage-2026-08-06.zip` (gốc repo `dtw-web`) — bằng chứng GSC cũ, đối chiếu không sửa.

---

## Public Contracts

- **OAuth `redirect_uri` (Google + GitHub)**: hợp đồng với bên thứ ba. Phase này chỉ **thêm** giá trị mới vào danh sách được phép (đối với Google — có danh sách; đối với GitHub — có thể không có danh sách, xem E.3), **không xoá** giá trị cũ. Không có hợp đồng nào bị phá vỡ ở phase này; hợp đồng chỉ thực sự "dùng" giá trị mới khi Phase 6 lật `BETTER_AUTH_URL`/`NEXT_PUBLIC_SITE_URL`.
- **Resend domain-verification**: không phải một "contract" theo nghĩa API, nhưng là điều kiện tiên quyết kỹ thuật cho `RESEND_FROM_DOMAIN` ở Phase 6 — Resend sẽ từ chối gửi (hoặc gửi với deliverability kém) từ một domain chưa verify.
- **Không có** production contract nào bị flip ở phase này: `DTW_INTAKE_URL`, `PUBLIC_API_ALLOWED_ORIGINS`, `NEXT_PUBLIC_SITE_URL`, `BETTER_AUTH_URL`, `RESEND_FROM_DOMAIN` — tất cả giữ nguyên giá trị hiện tại trong suốt Phase 1.

---

## Blast Radius

Bảng blast-radius theo file/dòng ở tài liệu tham chiếu §3 (3.1–3.9) **không có dòng nào thuộc phase này** — §3 chỉ liệt kê file bên trong các repo (`dtw-web`, `content-engine`, `apcg-cms`, `media-engine`, các repo anh em). Phase 1 nằm hoàn toàn ở lớp "ngoài mọi repo", được mô tả ở tài liệu tham chiếu tại các vị trí khác: §1 dòng 15-17 (tóm tắt casing/domain/manual-action), §4.4 dòng 573-596 (bảng đầy đủ việc ngoài repo, lead time, cách hỏng), §7 Phase 1 gốc dòng 668-678, và §8 ẩn số #2/#3/#4/#5/#13 dòng 308-312 và 319. Đừng đi tìm nhầm bảng §3 cho phase này.

Vì không có file code nào bị sửa, blast radius thực chất là **thay đổi trạng thái ở các hệ thống ngoài repo**, tất cả đều **additive** theo đúng ledger (D4's nguyên tắc "add-not-swap"):

| Mức rủi ro | Hạng mục |
|---|---|
| High | Đăng nhập nhầm tài khoản registrar → xác nhận sai quyền sở hữu domain (xem Risks #1); GitHub OAuth chỉ cho một callback URL và ai đó ghi đè nhầm giá trị cũ (xem Risks #2); domain hết hạn không ai để ý (xem Risks #3) |
| Med | Phát hiện D.1 cho thấy Resend có thể chưa từng verify cho domain cũ trong production (xem Risks #4) — không phải lỗi do phase này gây ra, nhưng cần escalate ngay |
| Low | Trademark clearance có kết quả CÓ ĐIỀU KIỆN/CHẶN (xử lý bằng cách dừng công bố công khai, không chặn code phase) |

---

## Verification Evidence

### #1 — DNS baseline của `opentechwire.com` và `dailytechwire.com` (chạy thật 09-09-26, read-only)

```
$ dig +short NS opentechwire.com
ns-a1.tenten.vn.
ns-a3.tenten.vn.
ns-a2.tenten.vn.

$ dig +short SOA opentechwire.com
ns-a2.tenten.vn. noreply.tenten.vn. 1778496045 3552 600 86400 3600

$ dig +short A opentechwire.com
(rỗng — không có A record, khớp tài liệu tham chiếu §1 dòng 16 "đang parked")

$ dig +short MX opentechwire.com
0 mail.opentechwire.com.

$ dig +short NS dailytechwire.com
ns-a1.tenten.vn.
ns-a3.tenten.vn.
ns-a2.tenten.vn.
```

Kết luận: DNS state hôm nay (09-09-26) khớp hoàn toàn với phát hiện gốc trong tài liệu tham chiếu (08-09-26) — SOA serial giống hệt, cả hai domain cùng bộ 3 nameserver. Không có gì trôi trong 1 ngày qua. Vẫn cần xác nhận qua panel đăng nhập thật cho quyền sở hữu (bước A.1) — `dig` không thay thế được việc đó.

### #2 — PHÁT HIỆN MỚI: `dailytechwire.com` không có dấu hiệu từng verify trên Resend (chạy thật 09-09-26, read-only)

```
$ dig +short TXT dailytechwire.com
"google-site-verification=4OIlKFuDXCzKcwsoxB9a8r3MEOsK1EQEyDfjrNrHJrY"
"v=spf1 include:emg01.emailserver.net.vn ~all"

$ dig +short TXT _dmarc.dailytechwire.com
"v=DMARC1; p=quarantine; pct=100;"

$ dig +short TXT resend._domainkey.dailytechwire.com
(rỗng)

$ dig +short CNAME send.dailytechwire.com
(rỗng)

$ dig +short MX send.dailytechwire.com
(rỗng)

$ dig +short TXT send.dailytechwire.com
(rỗng)

$ dig +short MX dailytechwire.com
0 mail.dailytechwire.com.
```

Đọc kết quả: SPF hiện tại include `emg01.emailserver.net.vn` (không phải `include:amazonses.com` — dấu hiệu đặc trưng của một domain đã verify qua Resend/AWS SES), và không tồn tại `resend._domainkey.dailytechwire.com` hay `send.dailytechwire.com` — hai bản ghi Resend luôn yêu cầu khi verify một domain. Xem bước D.1 để biết hành động cần làm với phát hiện này (xác nhận qua Resend dashboard thật, không sửa gì, báo ngay cho user).

### #3 — Verify sau khi hoàn tất Nhóm D (chạy khi thực thi, chưa chạy ở thời điểm viết plan)

```
dig +short TXT resend._domainkey.opentechwire.com
dig +short CNAME send.opentechwire.com   # tên bản ghi thật tuỳ Resend cấp — copy đúng, đừng đoán
dig +short MX send.opentechwire.com
dig +short TXT _dmarc.opentechwire.com
dig +short TXT opentechwire.com          # SPF
```
Kỳ vọng: mỗi lệnh trả về đúng giá trị mà Resend dashboard hiển thị cho domain này — dán cả giá trị Resend hiển thị VÀ output `dig` thật vào report để đối chiếu song song, không chỉ dán một trong hai.

### Bằng chứng thủ công (không có lệnh CLI tương đương — phải chụp/lưu thật)

- Screenshot panel Manual Actions của GSC (bước C.1).
- File export Coverage/Performance mới (bước C.2), lưu tại `process/features/rebrand/reports/`.
- Screenshot Resend Domains page hiển thị "Verified" cho `opentechwire.com` (bước D.5).
- Screenshot Google Cloud Console "Authorized redirect URIs" cho thấy **cả hai** URI (cũ và mới) cùng tồn tại (bước E.2).
- Screenshot GitHub OAuth/App settings — trường callback URL, kèm ghi chú loại app (OAuth App classic hay GitHub App) (bước E.3).
- Export/PDF kết quả tra cứu IPOS (bước B.1).
- Screenshot panel tenten.vn hiển thị ngày hết hạn `opentechwire.com` + xác nhận quyền chỉnh DNS (bước A.2, A.3).

### Test context

Tham chiếu `process/context/tests/all-tests.md` theo đúng routing rule của `process/context/all-context.md`. Phase 1 **không có bề mặt test tự động** — 0 dòng code TypeScript/JS thay đổi trong `dtw-web` hay `content-engine`, nên không cần chạy `tsc --noEmit` hay `npm test` riêng cho phase này. Bề mặt test tự động chỉ liên quan trở lại từ Phase 2 (code) trở đi.

---

## Rollback

| Nhóm | Khả năng rollback | Cách làm |
|---|---|---|
| A — xác nhận domain | Không cần rollback | Thuần đọc, không sửa gì (trừ khi gia hạn domain ở A.2, và gia hạn thì không cần "rollback") |
| B — trademark clearance | Không cần rollback | Thuần tra cứu, không sửa gì |
| C — GSC due-diligence | Không cần rollback cho việc đọc | **Rủi ro duy nhất**: nếu ai đó vô tình bấm nộp reconsideration hoặc Change of Address trong lúc thao tác trên GSC — đây **là one-way** (Google không cho rút lại một reconsideration request đã nộp). Đây là điều PHẢI TRÁNH TUYỆT ĐỐI, không phải một bước được lên kế hoạch trong phase này. |
| D — Resend + DNS | Reversible hoàn toàn | Xoá domain `opentechwire.com` khỏi Resend dashboard bất cứ lúc nào; xoá các bản ghi TXT/CNAME/MX vừa thêm khỏi DNS zone tenten.vn. Không ảnh hưởng gì tới production vì `RESEND_FROM_DOMAIN` chưa từng được set trỏ vào domain mới trong phase này. |
| E — OAuth thêm URI | Reversible cho việc thêm URI | Xoá URI mới khỏi "Authorized redirect URIs" (Google) / khôi phục giá trị callback cũ (GitHub, nếu lỡ bị ghi đè — xem Risks #2). Không ảnh hưởng sign-in hiện tại vì URI/app cũ không bị đụng, miễn là E.3 được làm đúng thứ tự (xác nhận loại app TRƯỚC khi sửa form). |
| E.4 — đổi tên app OAuth (tuỳ chọn) | **Bán-one-way** | Có thể đổi tên app lại như cũ bất cứ lúc nào, nhưng nếu việc đổi tên đã kích hoạt một đợt brand-verification review với Google, yêu cầu đó **không thể rút lại** — chỉ có thể chờ kết quả hoặc theo dõi tiến trình. |

---

## One-Way Door Flags

- **Không có bước nào trong 23 bước của Implementation Checklist là one-way door thật sự**, ngoại trừ:
  - **E.4 (đổi tên app OAuth)** — bán-one-way, **tuỳ chọn**, bắt buộc hỏi user xác nhận trước khi thực hiện.
- **Rủi ro ngoài kế hoạch cần tránh tuyệt đối** (không phải bước của plan, nhưng one-way nếu xảy ra do bấm nhầm): nộp reconsideration request hoặc Change of Address trong lúc thao tác GSC ở Nhóm C.
- Mọi bước còn lại là **additive và reversible**, đúng tinh thần "add-not-swap" của ledger D4.

---

## Risks

Bổ sung cho 5 rủi ro tầng chương trình đã liệt kê ở umbrella §7 (cron im lặng, GH Actions fail-closed, CORS rỗng, OAuth vỡ ở lần dùng đầu, DROP SCHEMA) — các rủi ro sau đặc thù cho Phase 1:

1. **Đăng nhập nhầm tài khoản registrar.** Nếu tài khoản tenten.vn đang dùng không phải tài khoản thật của APCG, toàn bộ phần còn lại của chương trình sẽ được xây trên một domain không thuộc quyền kiểm soát thực sự. Giảm thiểu: đối chiếu chéo DNS zone đang thấy (đã khớp 09-09-26, xem Verification Evidence #1) **và** xác nhận qua chính panel đăng nhập — không suy luận chỉ từ `dig`.
2. **GitHub OAuth App có thể chỉ cho một callback URL.** Nếu EXECUTE giả định "thêm được" mà không xác nhận trước (bước E.3), có thể vô tình bấm "Update" và ghi đè luôn giá trị cũ ngay hôm nay — làm sign-in GitHub hỏng ngay lập tức cho mọi user đang dùng domain cũ, **trước cả khi cutover diễn ra**. Giảm thiểu: E.3 bắt buộc xác nhận loại app + giới hạn kỹ thuật TRƯỚC KHI đụng vào form chỉnh sửa, không suy đoán.
3. **Domain `opentechwire.com` hết hạn giữa chương trình.** Chưa xác nhận việc gia hạn tự động có bật hay không. Giảm thiểu: A.2 kiểm tra ngày hết hạn ngay từ đầu, gia hạn sớm nếu cần.
4. **Auth email production có thể đang không thực sự gửi qua Resend hôm nay** (phát hiện mới ở D.1) — đây là một vấn đề production **có thể đã tồn tại từ trước rebrand**, không do phase này gây ra, nhưng ảnh hưởng trực tiếp tới khả năng xác minh email/khôi phục mật khẩu của reader ngay bây giờ. Phải escalate cho user ngay khi phát hiện, không chờ tới cuối chương trình rebrand — đây là một bug độc lập, việc sửa nó (nếu cần) nằm ngoài phạm vi của chương trình rebrand.
5. **Set nhầm biến môi trường trong lúc warm-up.** Nếu ai đó thử nghiệm gửi mail bằng cách tạm set `RESEND_FROM_DOMAIN=opentechwire.com` trên một môi trường không phải test biệt lập, có thể gửi nhầm mail thật từ domain mới trước khi sẵn sàng. Giảm thiểu: D.6 ghi rõ tuyệt đối không set biến môi trường ở bước này — warm-up dùng tính năng/luồng gửi riêng của Resend, không đụng tới env của `dtw-web`.

---

## Acceptance Criteria

Không được nới lỏng so với tiêu chí chung của umbrella (`rebrand-opentechwire-umbrella_PLAN_08-09-26.md`, mục "Acceptance Criteria"). Cụ thể cho Phase 1:

1. Report tại `process/features/rebrand/reports/phase-1-long-clocks_REPORT_<dd-mm-yy>.md` tồn tại, có đủ bằng chứng thật cho cả 5 nhóm (A-E) — ngày hết hạn domain thật, kết luận nhãn hiệu thật, trạng thái GSC thật, trạng thái Resend thật kèm output `dig` thật, trạng thái OAuth thật.
2. `dig` verification (#3 ở trên) cho thấy đúng bản ghi Resend đã cấp tồn tại trên DNS `opentechwire.com`, **và** Resend dashboard hiển thị "Verified" — cả hai điều kiện, không chỉ một.
3. Ít nhất một chu kỳ warm-up send đã ghi nhận (ngày bắt đầu, khối lượng theo ngày).
4. Google Cloud Console hiển thị **cả hai** redirect URI (cũ và mới) đồng thời tồn tại — xác nhận bằng screenshot lưu trong report.
5. GitHub: hoặc (a) URI mới đã thêm song song nếu app cho phép, hoặc (b) quyết định swap-in-window ở **Phase 6 Bước 4f** đã được ghi rõ ràng nếu app chỉ cho một callback URL — không được để ở trạng thái "chưa rõ, để sau tính". Bảng Dependencies của Phase 6 đọc trực tiếp kết luận này; để trống là chặn cứng Phase 6.
6. Report xác nhận bằng lời: **không** có Change of Address hay reconsideration request nào được nộp trong suốt phase này (đối chiếu D4).
7. `dailytechwire.com-Coverage-2026-08-06.zip` vẫn còn nguyên vẹn tại gốc repo `dtw-web`, không bị xoá/ghi đè — file export GSC mới (nếu có) là một file RIÊNG BIỆT, lưu trong `process/features/rebrand/reports/`.
8. `git status` (chạy trong `dtw-web`) xác nhận không có file code nào bị đổi bởi phase này — chỉ file report/plan trong `process/features/rebrand/` được thêm mới. Lệnh xác minh: `git -C /home/hieunc/Code/dtw-web status --porcelain -- apps packages content-engine 2>/dev/null` (kỳ vọng rỗng; `content-engine` không nằm trong cùng repo git nên chạy `git -C /home/hieunc/Code/content-engine status --porcelain` riêng nếu cần đối chiếu).
9. **User Confirmation**: user đã xem report và xác nhận bằng lời trước khi phase được đánh dấu `✅ VERIFIED`. Không có xác nhận này, trạng thái cao nhất được phép là `🧪 TESTING`.

---

## Phase Completion Rules

Kế thừa nguyên tắc chung ở umbrella + `process/development-protocols/phase-programs.md`, cụ thể hoá cho một phase không có code:

1. **Gate của chính phase** — mọi mục ở "Verification Evidence" phải được thu thập THẬT (dig thật đã chạy + screenshot thật + đăng nhập registrar/Resend/Google/GitHub thật). "Đã lên kế hoạch làm" không phải là bằng chứng.
2. **Regression check** — không áp dụng theo nghĩa kỹ thuật cho Phase 1 (chưa có phase code nào hoàn tất để hồi quy). Nếu Phase 0 đã `✅ VERIFIED` trước khi Phase 1 đóng, kiểm tra nhanh rằng các context doc Phase 0 vừa viết (invariant casing/canonical-host mới) không bị Phase 1 mâu thuẫn — thuần đọc lại, không có bề mặt kỹ thuật chung để test tự động.
3. **Đường lỗi được kiểm tra, không chỉ đường vui** — nêu rõ: nếu Resend KHÔNG bao giờ verify (DNS cấu hình sai), Phase 6 **không được phép** tiến hành cho tới khi verify xong (block cứng, không có đường vòng). Nếu GSC vẫn còn manual action sau khi kiểm tra — **không có hành động bắt buộc nào** (khác hẳn tài liệu tham chiếu gốc, đây là hệ quả tường minh của D4, không phải bỏ sót).
4. **User Confirmation** — bắt buộc trước khi đánh dấu `✅ VERIFIED`, theo đúng Acceptance Criteria #9. Không tự phong trạng thái VERIFIED chỉ vì "đã làm xong các bước".

Marker trạng thái dùng thống nhất với toàn chương trình: `⏳ PLANNED` · `🔨 CODE DONE` (với phase này, đọc là "đã thực hiện xong hành động thủ công, chưa xác minh chéo") · `🧪 TESTING` · `✅ VERIFIED` · `🚧 BLOCKED`.

---

## Resume and Execution Handoff

- **Trạng thái hiện tại**: plan vừa viết xong. Chưa có hành động thủ công nào được thực hiện trên bất kỳ dashboard ngoài repo nào. Các lệnh `dig` trong tài liệu này đã chạy thật (09-09-26) chỉ để làm mới bằng chứng nghiên cứu — hoàn toàn read-only, không đổi trạng thái hệ thống nào.
- Vì toàn bộ 23 bước là việc **ngoài repo do user tự thực hiện**, "ENTER EXECUTE MODE" cho phase này có nghĩa khác với các phase code: không có file nào bị `Edit`/`Write` trong `dtw-web`/`content-engine` ngoài chính file report của phase này. Vai trò của agent thực thi là dẫn đúng thứ tự, xác nhận tiền đề trước mỗi nhóm, và ghi lại bằng chứng thật do user cung cấp.
- Khi bắt đầu thực thi, agent điều phối PHẢI re-research tối thiểu theo `process/development-protocols/phase-programs.md`: đọc lại chính plan này, đọc report Phase 0 nếu đã tồn tại (kiểm tra D1-D15 không bị revert trong context), và tự chạy lại các lệnh `dig` ở "Verification Evidence #1/#2" để xác nhận DNS/production-email-state không trôi so với 09-09-26.
- **Report đích**: `process/features/rebrand/reports/phase-1-long-clocks_REPORT_<dd-mm-yy>.md` — chưa tồn tại, tạo mới khi bước A.1 bắt đầu.
- Sau khi phase này đạt `✅ VERIFIED` (có xác nhận user), cập nhật lại bảng dependency của umbrella plan nếu phát hiện mới làm thay đổi phần chuẩn bị của Phase 6.
- **Về E.3 (GitHub chỉ cho một callback URL): bước ở Phase 6 ĐÃ ĐƯỢC VIẾT SẴN (09-09-26)** — xem `phase-6-cutover_PLAN_08-09-26.md` **Bước 4f**, và bảng "Dependencies" của Phase 6 đã được sửa để chấp nhận nhánh "swap-in-window" thay vì đòi "cả hai đều đã thêm" (một điều kiện có thể không bao giờ thoả được nếu app là classic). Việc của E.5 chỉ còn là **ghi rõ nhánh nào** vào report — Phase 6 đọc chính dòng đó để quyết định.
- **Phát hiện D.1 (Resend có thể chưa từng verify cho domain cũ) phải được báo cho user độc lập với việc đóng phase** — đây là một rủi ro production hiện hữu, không nên chờ tới khi cả Phase 1 xong mới nhắc tới.

---

## Next Step

Đây là output của PLAN mode trong RIPER-5, cho một phase con của phase program `rebrand`. Sau khi user duyệt kỹ nội dung này, có hai hướng hợp lệ:

1. **Khuyến nghị**: nói **"ENTER EXECUTE MODE"** cho riêng file plan này (`process/features/rebrand/active/phase-1-long-clocks_PLAN_08-09-26.md`) ngay bây giờ — không cần chờ Phase 0 hoàn tất, vì Phase 1 là long-pole của toàn chương trình (wall-clock dài nhất) và càng để muộn càng kéo dài toàn bộ timeline rebrand.
2. Hoặc thực thi Phase 0 song song — plan Phase 0 **đã tồn tại** tại `process/features/rebrand/active/phase-0-lock-decisions_PLAN_09-09-26.md` (cập nhật 09-09-26; câu "chưa tồn tại" ở bản trước đã lỗi thời). Phase 0 và Phase 1 không phụ thuộc nhau, chạy đồng thời được.

Không phase nào khác trong 8 phase nên nhận `ENTER EXECUTE MODE` cùng lúc với phase này trong cùng một lượt — theo đúng nguyên tắc "không bao giờ execute quá một phase trong một lượt" của `process/development-protocols/phase-programs.md`.

*Phase 1 plan hoàn thành 09-09-26 (đóng dấu ngày file theo umbrella: 08-09-26). Chưa có hành động thủ công nào được thực hiện. Trạng thái: PLANNED.*
