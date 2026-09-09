# Rebrand Phase 3 — Cái mark, một commit atomic — REPORT

**Ngày**: 09-09-26
**Plan file**: `process/features/rebrand/active/phase-3-the-mark_PLAN_08-09-26.md`
**Nhánh**: `feat/rebrand-phase-3-the-mark` (không tạo nhánh khác, không checkout, không commit — đúng RÀO 6)
**Trạng thái**: **DONE_WITH_CONCERNS**

Lý do không phải `DONE` thuần: (a) Nhóm I (Supabase Storage + `content-engine`) bị chặn có chủ đích theo RÀO 1 — chưa upload, chưa sửa `dtw/index.ts`; (b) chưa có commit nào (RÀO 6) nên plan's Bước 40/41 (commit) và Acceptance Criteria cuối cùng ("Hai commit riêng biệt tồn tại") chưa thoả — đây là do chỉ thị của phiên EXECUTE này, không phải sai sót.

---

## 0. Cổng chặn tiền đề (Bước 0)

Đọc `process/context/all-context.md` dòng 130-145 (invariant #11 + #15 mới). Invariant #11 **đã** phản ánh D1/D2/D8 ("Target state post-rebrand (ledger D1/D2/D8): navy `OTW` monogram + lowercase `opentechwire` wordmark... As of this Phase 0 context lock, the actual `wordmark.tsx`, `icon.svg`, and raster asset files still render the old `DTW`/`dailytechwire`/old-tagline mark — that code/asset work is Phase 3..."). Invariant #15 mới cũng đã ghi đầy đủ ledger D1/D2/D3/D4/D5/D11/D12. **Phase 0 đã chạy** → tiếp tục Bước 1 theo đúng gate.

---

## 1. Bảng từng bước

| Bước | Nhóm | Trạng thái | File | Bằng chứng |
|---|---|---|---|---|
| 0 | Gate | ✅ | `process/context/all-context.md` | Invariant #11/#15 đã phản ánh D1/D2/D8 — xem trích dẫn ở trên |
| 1-6 | B (wordmark.tsx) | ✅ | `apps/web/src/components/wordmark.tsx` | Docblock, `viewBox="0 18 224 64"`, `aria-label="opentechwire"`, text `OTW`/`opentechwire`, pulse coords mới — xem diff §3 |
| 7 | B — xác nhận bằng mắt | ✅ | header/footer, light mode | Screenshot `header-1280.png`, `footer-1280.png` — không chồng lấn, không thừa khoảng trắng |
| 8 | B — xác nhận bằng mắt dark mode | ✅ | header/footer, dark mode | Screenshot `header-1280-dark.png`, `footer-1280-dark.png` — `var(--brand-navy)` đổi sang màu kem đúng như comment gốc "cream in dark", pulse vẫn cân đối |
| 9-10 | C (icon.svg) | ✅ | `apps/web/src/app/icon.svg` | `aria-label="OTW"`, text `OTW`, `rx="12"` và font/size/màu không đổi |
| 11 | D — script mới | ✅ | `apps/web/scripts/generate-brand-icons.mjs` | File mới, theo pattern `generate-og-default.mjs` |
| 12 | D — chạy script | ✅ | console log | 4 dòng `[generate-brand-icons] wrote ...` — xem §2 |
| 13 | D — xác nhận bằng mắt | ✅ | 4 PNG | Xem §4 — không cắt/tràn, `icon-maskable-512.png` căn giữa dọc đúng |
| 14 | D — fallback dominant-baseline | ✅ (không cần dùng) | — | `dominant-baseline="central"` render đúng ngay lần đầu trên máy build này — **không cần fallback**. Đã kiểm tra bằng mắt cả 4 PNG, glyph căn giữa hoàn hảo |
| 15-18 | E (OG default) | ✅ | `apps/web/scripts/generate-og-default.mjs` | Comment, `cx="460"` (tính lại, không copy máy móc 492 cũ), text `opentechwire`, tagline `Tech Intelligence, Openly Wired` |
| 19 | E — chạy script | ✅ | console log | `[generate-og-default] wrote .../og-default.png (1200x630)` |
| 20 | E — xác nhận bằng mắt | ✅ | `og-default.png` | Xem §4 — pulse-dot có khoảng cách nhìn thấy rõ (không dính, không quá xa), tagline đọc đúng, layout hình học terracotta/amber không đổi. Không có ghi chú font-substitution bất thường bên cạnh cảnh báo đã biết trong file |
| 21-23 | F (logo tĩnh) | ✅ | `apps/web/public/otw-logo-primary.svg` | `git mv` xác nhận rename (không phải xoá+tạo), nội dung vẽ lại đầy đủ (title/desc/text/pulse), `wordmark.tsx` dòng 5 trỏ đúng file mới |
| 24 | G (email lockup) | ✅ | `apps/web/src/lib/email.ts:79` | `OTW`/`opentechwire`, hex không đổi |
| 25 | G — xác nhận bằng mắt | ✅ | `email-lockup.png` | Xem §4 — render `OTW opentechwire` đúng font-style/màu (navy + terracotta italic) |
| 26-29 | H (manifest) | ✅ | `apps/web/src/app/manifest.ts` | `name: "Opentechwire"`, `short_name: "OTW"` (hai giá trị khác nhau theo §5.1.1/§6b.3), `description` mới, `background_color`/`theme_color` không đổi |
| 30-34 | I (Supabase + content-engine) | 🚧 **BLOCKED — chờ user duyệt** | — | Theo RÀO 1 — xem §5 bên dưới, đầy đủ thông tin để user tự làm |
| 35 | J — grep hẹp | ✅ (có 2 hit đã biết, ngoài phạm vi) | — | Xem §2 — 2 hit từ `email.ts:12-13`, đúng như đã ghi trong "KHÔNG thuộc phase này" của plan (Phase 6) |
| 36 | J — xác nhận rename | ✅ | — | `OK: đã đổi tên` |
| 37 | J — typecheck web | ✅ | — | `pnpm --filter web typecheck` sạch, không output |
| 38 | J — typecheck content-engine | ⏭️ Bỏ qua có chủ đích | — | Không áp dụng: Nhóm I không được sửa (RÀO 1) nên không có gì mới để xác nhận type ở `content-engine`. Đã xác nhận `git diff --stat` trong `content-engine` rỗng (không có thay đổi nào từ phiên này) |
| 39 | J — rà lại 6 xác nhận bằng mắt | ✅ | — | Gộp đầy đủ ở §4 |
| 40 | J — commit `dtw-web` | 🚧 **KHÔNG THỰC HIỆN — RÀO 6** | — | Theo chỉ thị "KHÔNG commit, KHÔNG push" của phiên EXECUTE này. Working tree hiện có toàn bộ thay đổi Nhóm B/C/D/E/F/G/H sẵn sàng, chưa `git add`/`git commit` |
| 41 | J — commit `content-engine` | 🚧 **KHÔNG ÁP DỤNG** | — | Không có thay đổi nào ở `content-engine` (Nhóm I bị chặn) nên không có gì để commit |

Ngoài ra tôi có chạy thêm `pnpm turbo run typecheck` ở root (không phải bước bắt buộc của plan nhưng theo chỉ thị của phiên EXECUTE) — 3/3 package (`@dtw/ui`, `@dtw/db`, `web`) pass sạch.

---

## 2. Output lệnh thật

### Bước 12 — `node scripts/generate-brand-icons.mjs`
```
[generate-brand-icons] wrote /home/hieunc/Code/dtw-web/apps/web/src/app/apple-icon.png (180x180)
[generate-brand-icons] wrote /home/hieunc/Code/dtw-web/apps/web/public/icon-192.png (192x192)
[generate-brand-icons] wrote /home/hieunc/Code/dtw-web/apps/web/public/icon-512.png (512x512)
[generate-brand-icons] wrote /home/hieunc/Code/dtw-web/apps/web/public/icon-maskable-512.png (512x512)
```

### Bước 19 — `node scripts/generate-og-default.mjs`
```
[generate-og-default] wrote /home/hieunc/Code/dtw-web/apps/web/public/og-default.png (1200x630)
```

### Bước 35 — grep phạm vi hẹp
```
$ command grep -niE 'dailytechwire|daily ?tech ?wire|\bdtw\b|Tech Intelligence, Wired Daily' \
  apps/web/src/components/wordmark.tsx apps/web/src/app/icon.svg apps/web/src/lib/email.ts \
  apps/web/src/app/manifest.ts apps/web/scripts/generate-og-default.mjs \
  apps/web/scripts/generate-brand-icons.mjs apps/web/public/otw-logo-primary.svg

apps/web/src/lib/email.ts:12:const fromDomain = process.env.RESEND_FROM_DOMAIN || "dailytechwire.com";
apps/web/src/lib/email.ts:13:const FROM = `DailyTechWire <no-reply@${fromDomain}>`;
```
**Đây KHÔNG phải lỗi** — xem §6 "Chỗ plan lệch thực tế" bên dưới, plan tự ghi 2 dòng này thuộc Phase 6, nhưng câu "Kỳ vọng: 0 dòng khớp" ở Bước 35 không tính đến việc chính `email.ts` (nằm trong danh sách file grep) luôn chứa 2 dòng này.

### Bước 36
```
$ test -f apps/web/public/dtw-logo-primary.svg && echo "LỖI: file cũ vẫn còn" || echo "OK: đã đổi tên"
OK: đã đổi tên
```

### Bước 37 — `pnpm --filter web typecheck`
```
> web@0.0.0 typecheck /home/hieunc/Code/dtw-web/apps/web
> tsc --noEmit
```
(không output nào khác = 0 lỗi)

### Bổ sung — `pnpm turbo run typecheck` (root)
```
• Packages in scope: @dtw/config, @dtw/db, @dtw/ui, web
• Running typecheck in 4 packages
web:typecheck: cache miss, executing 720f8718ed9cd286
@dtw/ui:typecheck: cache hit, replaying logs 3c7cabadf0cce6ac
@dtw/db:typecheck: cache hit, replaying logs 52796c393738a618
 Tasks:    3 successful, 3 total
```

---

## 3. Giá trị cuối cùng thực dùng (khác/giống so với QĐ-P3-3 khởi điểm)

**Wordmark pulse (Bước 6-7)** — dùng ĐÚNG số khởi điểm của QĐ-P3-3, không cần chỉnh sau khi render thật:
- 6 chấm `cx` = 2, 29, 56, 83, 110, 137
- 5 đoạn line: `(7,24) (34,51) (61,78) (88,105) (115,132)`
- `viewBox="0 18 224 64"`, `translate(76, 67)` giữ nguyên
- Xác nhận bằng ảnh chụp thật (`header-1280.png`, `header-390.png`, `footer-1280.png` + 2 bản dark) — không lệch, không chồng lấn, không cần chỉnh mắt thêm.

**OG default pulse-dot `cx` (Bước 16)** — dùng ĐÚNG giá trị tính toán `460` (công thức `(492-72)×12/13+72 ≈ 459.69` làm tròn `460`), xác nhận bằng ảnh `og-default.png`: khoảng cách chữ→dot nhìn rõ, không dính, không quá xa. Không cần điều chỉnh thêm.

**Icon PNG (QĐ-P3-1)** — dùng ĐÚNG bảng thông số của plan (kích thước, `font-size`, `dominant-baseline="central"`). Không cần fallback thủ công.

---

## 4. Xác nhận bằng mắt — 8 hạng mục (Verification Evidence #8 của plan)

Tất cả ảnh lưu tại: `/tmp/claude-1000/-home-hieunc-Code-dtw-web/0efe1a19-7f9f-4827-9eee-db1c4994cdf7/scratchpad/p3/`

| # | Hạng mục | File ảnh | Nhận xét thật |
|---|---|---|---|
| a | `wordmark.tsx` — header/footer, light + dark | `header-1280.png`, `header-390.png`, `footer-1280.png`, `header-1280-dark.png`, `footer-1280-dark.png` | Monogram `OTW` (nền navy, chữ trắng) + wordmark `opentechwire` (navy ở light, kem ở dark) + 6 chấm pulse (1 chấm amber ở vị trí 2, còn lại navy) render sạch ở cả 1280px và 390px, không chồng lấn, không tràn khung, không có khoảng trắng cuối bất thường. Dark mode: `var(--brand-navy)` chuyển sang màu kem đúng như comment gốc "cream in dark"; nền banner giữ nguyên navy ở cả 2 theme (đúng thiết kế banner cố định). Ở 390px, dòng tagline "Tech Intelligence, Wired Daily" (Phase 4, chưa đổi) wrap xuống 2 dòng — đây là hành vi layout có sẵn từ trước, không phải do thay đổi của Phase 3. |
| b | `apple-icon.png` | `apple-icon.png` | 180×180, nền navy `#1B2A52` full-bleed, chữ `OTW` trắng căn giữa hoàn hảo cả ngang lẫn dọc, không cắt viền. |
| c | `icon-192.png` | `icon-192.png` | 192×192, cùng bố cục, căn giữa đúng. |
| d | `icon-512.png` | `icon-512.png` | 512×512, cùng bố cục, căn giữa đúng, không có viền/khoảng trống bất thường. |
| e | `icon-maskable-512.png` | `icon-maskable-512.png` | 512×512, nền navy tới sát mép (không inset, đúng chủ đích). Chữ `OTW` cỡ 130 nằm gọn, ước lượng bằng mắt nằm hoàn toàn trong vòng tròn safe-zone 80% ở giữa (đường kính ước lượng ~410px so với cạnh ảnh 512px — chữ chỉ chiếm phần lõi trung tâm). **Căn giữa dọc đã đúng** — đây là bug đã biết ở bản cũ, bản mới dùng `dominant-baseline="central"` và không lệch. |
| f | `og-default.png` | `og-default.png` | 1200×630, wordmark `opentechwire` trắng + pulse-dot terracotta có khoảng cách nhìn thấy rõ (không dính, không quá xa), tagline mới "Tech Intelligence, Openly Wired" đọc đúng bằng màu kem mờ, layout hình học 4 khối terracotta/amber ở 1/3 phải không đổi so với bản gốc. Không thấy dấu hiệu font-substitution bất thường ngoài cảnh báo đã biết trong docblock của file (librsvg dùng font hệ thống thay Schibsted Grotesk/IBM Plex Sans — hành vi này không mới, đã ghi từ trước). |
| g | Email lockup render | `email-lockup.png` | Gọi trực tiếp `actionEmail()` với input mẫu (heading "Reset your password"), lưu HTML output ra file tĩnh và chụp ảnh (không gửi email thật vì không có `RESEND_API_KEY` trong môi trường — đây chính là dev fallback path mà file đã document). Kết quả: `OTW` màu navy đậm + `opentechwire` chữ nghiêng terracotta, đúng font/màu/style, không đổi bố cục nút/hex khác. |
| h | `otw-logo-primary.svg` mở trực tiếp | `otw-logo-primary.png` (chụp từ file SVG mở trong Chrome) | Monogram `OTW` + wordmark `opentechwire` + pulse 6-chấm render đúng, không lỗi hình học, dùng đúng cùng bộ toạ độ mới từ QĐ-P3-3. |

**Bonus — `icon.svg` (favicon)**: `icon-svg.png` — `OTW` trắng trên nền navy bo góc `rx=12`, đúng như thiết kế.

### Chi tiết kỹ thuật cách lấy ảnh (do dev server yêu cầu DB sống)

`pnpm --filter web dev` khởi động được, nhưng trang chủ (`/`) gọi trực tiếp `payload-server.ts` (bỏ qua switch `CMS_SOURCE`) cho `getAiModels`/`getMostReadArticles`, nên **luôn cần Postgres sống** kể cả khi `CMS_SOURCE=central`. Môi trường thực thi này **không có** `psql`/`pg_ctl`/`docker` — không có cách khởi một Postgres cục bộ mà không cần sudo hay hạ tầng ngoài (không được phép theo RÀO 1's tinh thần "không tự dựng hạ tầng"). Giải pháp đã dùng: tạo **`.env.local` tạm** (đã gitignore sẵn, dòng 17-19 `.gitignore`; đã **xoá lại sau khi xong**, không để lại trong working tree) với `DATABASE_URL` giả (không kết nối được) + `PAYLOAD_SECRET` giả + `CMS_SOURCE=central` trỏ `CMS_URL=http://localhost:9999` (không có gì lắng nghe — `central-api.ts` được document là "never throws into render", trả kết quả rỗng khi fetch fail). Route `/` vẫn 500 (do `getAiModels` gọi Payload cục bộ trực tiếp, không qua switch), nhưng route `/about` (trang tĩnh, cùng layout Header/Footer) trả `200` sạch — đây là route tôi dùng để chụp Header/Footer thật. Dùng Puppeteer (cài mới trong `.claude/skills/vc-chrome-devtools/scripts/node_modules`, `PUPPETEER_SKIP_DOWNLOAD=true` để tái dùng Chrome hệ thống tại `/opt/google/chrome/chrome`, không tải Chromium mới) để mở `http://localhost:3000/about` ở viewport 1280×900 và 390×844, chụp `<header>`/`<footer>`, dùng `page.emulateMediaFeatures([{name:"prefers-color-scheme", value:"dark"}])` để lấy đúng dark mode (ban đầu tôi dùng `document.documentElement.dataset.theme = "dark"` qua `page.evaluate()` nhưng bị `ThemeProvider`'s `useEffect` ghi đè lại — đã sửa bằng cách emulate media feature trước khi navigate, đúng theo cách app đọc theme ban đầu qua `matchMedia`). Dev server đã **tắt hẳn** sau khi chụp xong (`kill -9` trên PID `next-server`, xác nhận `lsof -i:3000` rỗng và `curl` trả về connection-refused).

Các script Puppeteer tạm dùng cho việc này đã **xoá sạch** khỏi `.claude/skills/vc-chrome-devtools/scripts/` sau khi hoàn tất (không nằm trong Touchpoints của plan, không nên để lại trong repo).

---

## 5. Bước Supabase + content-engine — CHUẨN BỊ ĐẦY ĐỦ CHO USER (RÀO 1 — BLOCKED)

Không có gì được upload lên Supabase, không có API ngoài nào được gọi, và `content-engine/src/lib/publications/dtw/index.ts` **chưa bị sửa** — đúng RÀO 1. `content-engine/scripts/social-render-poc.ts` **cũng chưa bị sửa** (quyết định thận trọng: coi toàn bộ Nhóm I là một khối, không tách sửa nửa file script ra khỏi giá trị `logoAssetUrl` phụ thuộc kết quả upload — xem §7 lý do).

Xác nhận: `git diff --stat` trong `/home/hieunc/Code/content-engine` **rỗng** — repo đó hoàn toàn chưa bị đụng bởi phiên EXECUTE này.

### (a) File cần upload
`icon-512.png` mới (đã sinh ở Nhóm D, nằm sẵn trên đĩa):
```
/home/hieunc/Code/dtw-web/apps/web/public/icon-512.png
```
Kích thước hiện tại: 13,561 bytes, `PNG image data, 512 x 512, 8-bit/color RGBA, non-interlaced`, chứa monogram `OTW` mới (đã xác nhận bằng ảnh chụp §4-d).

### (b) Object key mới đề xuất trên Supabase Storage
```
logos/otw-monogram.png
```
(bucket giữ nguyên `hero-images`, additive — **không ghi đè** `logos/dtw-monogram.png` cũ, đúng lý do plan nêu: các social post đang `queued` có thể vẫn trỏ key cũ)

### (c) Lệnh chính xác để user tự chạy (2 bước)

**Bước 1 — xác nhận `.env` của `content-engine` đã có creds thật** (không chạy upload nếu thiếu):
```bash
cd /home/hieunc/Code/content-engine
command grep SUPABASE_ .env
```

**Bước 2 — sửa `LOGO_STORAGE_PATHS.dailytechwire` trong `social-render-poc.ts` rồi chạy upload:**

Trong `/home/hieunc/Code/content-engine/scripts/social-render-poc.ts`, dòng 88 hiện tại (đã xác nhận lại bằng grep trực tiếp, khớp đúng số dòng plan ghi):
```ts
  dailytechwire: 'logos/dtw-monogram.png',
```
Sửa thành:
```ts
  dailytechwire: 'logos/otw-monogram.png',
```
(Không đổi khoá `dailytechwire` — đây là identifier CLI nội bộ của script, không phải slug đóng băng D11. Không đổi dòng 78 — local path, không đổi theo D7.)

Sau đó chạy:
```bash
cd /home/hieunc/Code/content-engine
npx tsx scripts/social-render-poc.ts --upload-logo=dailytechwire
```
Script sẽ tự in ra `Storage upload: <path>` + `public URL: <url>` + `GET → <status> <contentType> <bytes>B`. Kỳ vọng URL dạng:
```
https://yjuunnmejferyrbmjjci.supabase.co/storage/v1/object/public/hero-images/logos/otw-monogram.png
```

**Bước 3 — xác nhận độc lập bằng curl:**
```bash
curl -sI "https://yjuunnmejferyrbmjjci.supabase.co/storage/v1/object/public/hero-images/logos/otw-monogram.png"
```
Kỳ vọng `HTTP/2 200` và `content-type: image/png`.

### (d) Dòng cần sửa ở `dtw/index.ts` và giá trị mới

File: `/home/hieunc/Code/content-engine/src/lib/publications/dtw/index.ts`

**Lưu ý lệch số dòng so với plan** (plan ghi "dòng 182-183"; số dòng thật tại thời điểm viết report này khác — xem §6). Đoạn hiện tại (đã xác nhận lại bằng `sed -n`):
```ts
      kicker: 'DAILYTECHWIRE.COM',                                          // dòng 179
      kickerTextColor: '#DCE1EC',                                           // dòng 180
      // ✅ G0-VERIFIED 22-08-26 (report §7): monogram lấy từ repo `hieuhn09/dtw-web`   // dòng 181
      // (`apps/web/public/icon-512.png`) rồi upload Storage, GET 200 image/png 14.012B. // dòng 182
      // Production KHÔNG đọc file từ repo web khác (bẫy #3 report G0).       // dòng 183
      logoAssetUrl:                                                          // dòng 184
        'https://yjuunnmejferyrbmjjci.supabase.co/storage/v1/object/public/hero-images/logos/dtw-monogram.png', // dòng 185
```
Sửa **dòng 184-185** thành:
```ts
      logoAssetUrl:
        'https://yjuunnmejferyrbmjjci.supabase.co/storage/v1/object/public/hero-images/logos/otw-monogram.png',
```
Và cập nhật comment **dòng 181-183** — thay số byte cũ `14.012B` bằng số byte thật lấy từ output Bước 2/3 ở trên (KHÔNG copy `14.012B` — đó là của monogram `DTW` cũ). Gợi ý format giữ nguyên phong cách:
```ts
      // ✅ G0-VERIFIED <ngày user chạy> (Phase 3 rebrand): monogram OTW mới lấy từ repo
      // `hieuhn09/dtw-web` (`apps/web/public/icon-512.png`) rồi upload Storage,
      // GET 200 image/png <SỐ_BYTE_THẬT>B.
      // Production KHÔNG đọc file từ repo web khác (bẫy #3 report G0).
```

**Không đụng** bất kỳ trường nào khác cùng object (`displayName`, `domain`, `kicker`, `utmCampaign`, `siteBaseUrl`) — thuộc Phase 5, đúng Bước 34 của plan.

Sau khi user tự làm xong (b)+(c)+(d), chạy `npx tsc --noEmit` trong `content-engine` để xác nhận không gãy kiểu `SocialConfig.card.logoAssetUrl: string` — chỉ đổi giá trị chuỗi nên không có lý do gãy, nhưng nên chạy để có bằng chứng thật (đây chính là Bước 38 của plan, bị bỏ qua trong phiên này vì không có gì để xác nhận).

Thời gian ước tính cho user: ~2 phút (đúng dự đoán của chỉ thị).

---

## 6. Chỗ plan lệch thực tế

1. **Bước 35 (grep) — kỳ vọng "0 dòng khớp" không khớp với chính bảng "KHÔNG thuộc phase này" của plan.** Plan liệt kê rõ `email.ts:12-13` (`fromDomain`/`FROM`) là Phase 6, không phải Phase 3 — nhưng grep hẹp ở Bước 35 lại đưa **toàn bộ file** `apps/web/src/lib/email.ts` vào danh sách quét, nên 2 dòng đó luôn xuất hiện như "match" dù đúng là chưa tới lượt sửa. Đây là một mâu thuẫn nội tại nhỏ giữa "kỳ vọng 0 dòng khớp" và "danh sách file cần grep" của chính plan — không phải lỗi thực thi. Tôi giữ nguyên 2 dòng đó (đúng phạm vi) và ghi rõ 2 hit này là kỳ vọng, không phải cờ đỏ.
2. **`content-engine/src/lib/publications/dtw/index.ts` — số dòng đã trôi.** Plan (viết 08-09-26, "re-verify" 09-09-26 sáng) ghi `logoAssetUrl` ở dòng 182-183. Tại thời điểm thực thi (09-09-26 chiều), dòng thật là: `kicker` dòng 179, comment 181-183, `logoAssetUrl:` dòng 184, giá trị chuỗi dòng 185 — lệch khoảng 2-3 dòng so với plan (không rõ nguyên nhân — có thể một dòng comment/field khác trong cùng object đã được thêm/xoá giữa lúc viết plan và lúc thực thi, trong vài giờ cùng ngày). Đã không dựa vào số dòng cũ mà tìm lại bằng nội dung (`command grep -n`) đúng theo chỉ thị. Ghi giá trị dòng thật vào §5(d) ở trên cho user.
3. **Không có lệch nào khác đáng ghi nhận.** Toàn bộ 9 file còn lại (Nhóm B/C/D/E/F/G/H) khớp 100% với số dòng/nội dung mà plan mô tả ở mục "Xác nhận số dòng" — không cần điều chỉnh số đo hình học nào so với QĐ-P3-1/2/3 khởi điểm.

---

## 7. Phát hiện ngoài phạm vi (không tự sửa, chỉ ghi lại)

1. **`apps/web/src/app/(reader)/layout.tsx`** có `name: "DailyTechWire"` hardcode trong JSON-LD `WebSite` (dòng ~35 hiện tại) — đây thuộc Phase 4 (umbrella §3.2 "JSON-LD `WebSite.name` + `alternateName`"), đã biết, không phải phát hiện mới, nhưng ghi lại ở đây vì tôi nhìn thấy trực tiếp trong lúc lấy ảnh chụp header/footer (route `/about` dùng chung layout này).
2. **`footer.tsx`** vẫn còn nhiều literal `DTW`/`Dailytechwire` hiển thị thật trên trang: cột `t("DTW","DTW","DTW")`, dòng "© 2026 Dailytechwire · Singapore" — đúng theo luật §5.1.1 của umbrella thì nhãn cột nên là `OTW` (token đứng một mình) và câu cuối nên là `Opentechwire` (văn xuôi). Đây rõ ràng thuộc Phase 4 (đã liệt kê trong umbrella), không đụng theo RÀO 2 — chỉ xác nhận lại bằng ảnh chụp thật (`footer-1280.png`) rằng các chuỗi này **vẫn còn nguyên dạng cũ** sau Phase 3, đúng như kỳ vọng ranh giới phase.
3. **Header tagline** ("Tech Intelligence, Wired Daily") ở `header.tsx:235` và `footer.tsx:140` vẫn là bản cũ trên trang thật — đúng phạm vi Phase 4, xác nhận bằng ảnh chụp, không đụng.
4. Không phát hiện thêm vấn đề kỹ thuật nào khác (không có lỗi console bất thường ngoài các fetch-fail đã lường trước từ `.env.local` giả).

---

## 8. Danh sách asset đã sinh — đường dẫn, kích thước thật, byte size trước/sau

| Asset | Trước (byte) | Sau (byte) | Kích thước ảnh (file thật) |
|---|---|---|---|
| `apps/web/src/app/apple-icon.png` | 3,242 | 3,244 | 180×180 PNG RGBA |
| `apps/web/public/icon-192.png` | 3,495 | 3,523 | 192×192 PNG RGBA |
| `apps/web/public/icon-512.png` | 14,012 | 13,561 | 512×512 PNG RGBA |
| `apps/web/public/icon-maskable-512.png` | 11,952 | 12,015 | 512×512 PNG RGBA |
| `apps/web/public/og-default.png` | 34,273 | 34,633 | 1200×630 PNG RGBA |
| `apps/web/public/otw-logo-primary.svg` (rename từ `dtw-logo-primary.svg`) | 1,780 | 1,776 | SVG, viewBox 0 0 380 100 |
| `apps/web/src/app/icon.svg` | 371 (ước tính, không đo trước) | 373 | SVG, viewBox 0 0 64 64 |
| `apps/web/scripts/generate-brand-icons.mjs` | — (file mới) | mới tạo | script Node/ESM |

Tất cả byte size khác nhau xác nhận nội dung thực sự thay đổi (không phải copy-paste giữ nguyên byte cũ).

---

## 9. Đường dẫn ảnh chụp — thư mục đầy đủ

```
/tmp/claude-1000/-home-hieunc-Code-dtw-web/0efe1a19-7f9f-4827-9eee-db1c4994cdf7/scratchpad/p3/
├── header-1280.png          (header thật, 1280px, light mode)
├── header-390.png           (header thật, 390px, light mode)
├── header-1280-dark.png     (header thật, 1280px, dark mode)
├── footer-1280.png          (footer thật, 1280px, light mode)
├── footer-1280-dark.png     (footer thật, 1280px, dark mode)
├── email-lockup.png         (render tĩnh của actionEmail() HTML)
├── otw-logo-primary.png     (render otw-logo-primary.svg mở trực tiếp trong Chrome)
├── icon-svg.png             (render icon.svg — favicon)
├── apple-icon.png           (copy trực tiếp asset đã sinh)
├── icon-192.png             (copy trực tiếp asset đã sinh)
├── icon-512.png             (copy trực tiếp asset đã sinh)
├── icon-maskable-512.png    (copy trực tiếp asset đã sinh)
├── og-default.png           (copy trực tiếp asset đã sinh)
├── otw-logo-primary.svg     (copy trực tiếp source SVG)
└── icon.svg                 (copy trực tiếp source SVG)
```

**Nhận xét tổng quan về wordmark**: không phát hiện tràn/lệch/cắt ở bất kỳ kích thước hay theme nào đã kiểm tra (1280px desktop, 390px mobile, light, dark). Số đo pulse-dot khởi điểm ở QĐ-P3-3 (tỷ lệ đếm ký tự 12/13) hoá ra khớp tốt với render thật — không cần điều chỉnh mắt thêm như plan đã cảnh báo có thể cần.

---

## 10. Việc KHÔNG thể verify (theo đúng plan §"Việc KHÔNG thể verify được ở phase này")

- Hành vi PWA install-prompt thật trên thiết bị Android/iOS thật — không có thiết bị/emulator trong môi trường này.
- Hành vi runtime thật của `content-engine`'s `src/social/render.ts` ở lần publish tiếp theo — phụ thuộc Nhóm I hoàn tất trước (đang BLOCKED).
- Trang chủ `/` thật với dữ liệu CMS thật (chỉ xác nhận được qua route tĩnh `/about` dùng chung layout Header/Footer, vì `/` cần Postgres sống cho `getAiModels`/`getMostReadArticles` mà môi trường này không có).

---

## 11. Trạng thái theo Phase Completion Rules của plan

Theo mục "Phase Completion Rules" của chính plan này: **KHÔNG được đánh dấu `✅ VERIFIED`** cho tới khi (1) toàn bộ 41 bước chạy — ở đây Bước 30-34/40-41 bị chặn có chủ đích theo chỉ thị ngoài-plan (RÀO 1/RÀO 6) chứ không phải bỏ sót; (2) Object Storage mới tồn tại thật (chưa — đang chờ user); (3) **User Confirmation** — chưa xảy ra.

Trạng thái phù hợp nhất theo thang marker của plan: **🔨 CODE DONE** cho Nhóm B/C/D/E/F/G/H (đã sửa xong, đã build/typecheck sạch, đã xác nhận bằng mắt bằng ảnh chụp thật) + **🚧 BLOCKED** cho Nhóm I (chờ user tự upload Supabase). Plan **KHÔNG** nên được archive hay coi là hoàn tất — vẫn nên ở `process/features/rebrand/active/`.

---

## 12. Việc còn lại cho user / phiên sau

1. Tự chạy 3 bước ở §5(c) để upload monogram mới lên Supabase Storage.
2. Tự sửa `content-engine/src/lib/publications/dtw/index.ts` dòng 184-185 (giá trị mới) + comment dòng 181-183 (số byte thật) theo §5(d).
3. Chạy `npx tsc --noEmit` trong `content-engine` sau khi sửa (Bước 38 còn lại).
4. Xem lại toàn bộ ảnh chụp ở §9 và xác nhận (user confirmation) trước khi phase này được coi `✅ VERIFIED`.
5. Sau khi user xác nhận + Nhóm I hoàn tất: `git add` + commit atomic Nhóm B/C/D/E/F/G/H trong `dtw-web` (Bước 40) và commit riêng Nhóm I trong `content-engine` (Bước 41) — cả hai đều **chưa xảy ra** trong phiên này theo RÀO 6.
6. Không có gì cần dọn thêm trong `dtw-web` — `.env.local` tạm và các script Puppeteer tạm đã bị xoá sạch, dev server đã tắt, working tree hiện chỉ chứa đúng thay đổi Nhóm B/C/D/E/F/G/H (xem `git status --short` — không có untracked file mới nào phát sinh từ phiên này).
