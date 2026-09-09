# Rebrand Phase 5 — content-engine: ba writer + dữ liệu liên quan — REPORT

**Ngày**: 09-09-26
**Plan file**: `process/features/rebrand/active/phase-5-content-engine_PLAN_08-09-26.md`
**Repo làm việc**: `/home/hieunc/Code/content-engine`
**Nhánh**: `feat/rebrand-phase-5-engine` (đã tạo sẵn từ `main` @ `21f2737` trước khi phiên này bắt đầu; không tạo nhánh khác, không checkout, **không commit** — đúng RÀO 6/RÀO 7)

**Trạng thái**: **DONE_WITH_CONCERNS**

Lý do không phải `DONE` thuần (đúng theo phạm vi được giao cho phiên này — Nhóm B/D/D2/G):

1. **B.1 (audit Central `authors`) và B.3 (đếm Daily Brief đã publish) KHÔNG chạy được trong phiên này** — cả hai cần đọc Postgres của `apcg-cms` (Central), nhưng RÀO 1 của nhiệm vụ chỉ cấp quyền đọc qua `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` **của content-engine** ("Dùng SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY có sẵn trong `.env` của content-engine"), và RÀO 3 giới hạn `apcg-cms` ở mức "đọc file thì được" chứ không cấp phép kết nối trực tiếp vào Postgres sản xuất riêng của repo đó. Không đoán số — để trống, đưa vào checklist bàn giao.
2. **Nhóm C, E, F hoàn toàn không chạy** — đúng theo yêu cầu rõ ràng "BỎ QUA Nhóm A, Nhóm C, E, F" của nhiệm vụ (cả ba đều là ghi-DB). Nghĩa là: row `authors` bên Central **chưa được rename**, 2 giá trị DB Engine Supabase **chưa được UPDATE**, nội dung Daily Brief/dek/excerpt đã publish **chưa được dọn**.
3. **D.4 (byline code) dùng giá trị mặc định `'OTW Briefing Desk'`** theo đúng plan, nhưng **chưa được đối chiếu byte-for-byte với Central `authors.name` thật** (vì Nhóm C không chạy). Đây là rủi ro cụ thể plan đã cảnh báo (tách đôi kho brief) — phải chạy Nhóm C **trước** khi merge/deploy Nhóm D's byline.
4. **D.13 (`logoAssetUrl`) xác nhận `🚧 BLOCKED`** — Phase 3 chưa upload monogram mới, URL vẫn trỏ `logos/dtw-monogram.png` (HTTP 200 xác nhận vẫn sống). Đúng theo plan: không tự sửa, để nguyên.
5. **Nhóm "giá trị domain" (D.5/D.7/D.8/D.11) đã được VIẾT vào working tree** (siteBaseUrl ×2, domain, kicker → domain mới) theo mặc định Phương án B của plan, nhưng **KHÔNG được commit** (RÀO 7) — nên ràng buộc "giữ PR ở trạng thái chưa merge tới cửa sổ Phase 6" của Phương án B tự động thoả mãn (không có gì để merge). Cần quyết định A/B chính thức từ user trước khi các thay đổi này được commit/merge thật.
6. **Nhiều chỗ trong plan đã LỆCH so với repo thật** (drift nhiều hơn plan tự dự đoán) — liệt kê đầy đủ ở mục "Chỗ nào plan lệch thực tế" bên dưới, quan trọng nhất: D.15 (chỉ 1/2 vị trí còn tồn tại), D2.4 (0/6 dòng còn brand string), D2.5 (3/4 file đã tự làm sạch), D2.6 (con số thực tế thấp hơn nhiều so với dự đoán, cộng 1 phát hiện lỗi tổ chức GitHub thật — org `dailytechwire` không tồn tại).

Không có commit nào được tạo, không push (RÀO 7).

---

## 0. Bối cảnh đã đọc trước khi làm

- `process/features/rebrand/active/phase-5-content-engine_PLAN_08-09-26.md` — toàn bộ 506 dòng.
- `process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md` — ledger D1-D15 §2, luật casing §5.1.1, danh sách đóng băng §5.2/§5.3.
- `process/features/rebrand/reports/phase-4-rendered-copy_REPORT_09-09-26.md` — tham khảo cách Phase 4 giải quyết các ca casing khó (token ghép vs. văn xuôi, bẫy casing hỗn hợp).
- Working tree `content-engine` trước khi bắt đầu: đúng nhánh `feat/rebrand-phase-5-engine`, HEAD `21f2737`, 9 file/thư mục untracked khớp CHÍNH XÁC danh sách RÀO 6 (đã đối chiếu bằng `git status --short`).

---

## 1. Bảng từng nhóm

| Nhóm | Trạng thái | File | Bằng chứng |
|---|---|---|---|
| Nhóm A (git/branch) | Bỏ qua theo yêu cầu — đã xác nhận sẵn có | — | `git branch --show-current` → `feat/rebrand-phase-5-engine`; `git log --oneline -3` → HEAD `21f2737` |
| Nhóm B.1 (audit Central authors) | **KHÔNG CHẠY** — ngoài quyền đọc DB được cấp phiên này | — | Xem mục "Vì sao B.1/B.3 không chạy" bên dưới |
| Nhóm B.2 (audit Engine Supabase) | ✅ Chạy thật | (script tạm `scripts/_tmp-audit-b2.ts`, đã xoá sau khi chạy) | 3 SELECT thật qua `@supabase/supabase-js` — xem §3 |
| Nhóm B.3 (đếm Daily Brief published) | **KHÔNG CHẠY** — cùng lý do B.1 | — | — |
| Nhóm C (rename Central authors) | Bỏ qua theo yêu cầu (ghi-DB) | — | Không đụng gì |
| Nhóm D (3 writer + D.10-D.18) | ✅ Code xong | `src/lib/publications/dtw/index.ts`, `admin/src/lib/brief-configs.ts`, `src/social/prompts/social-rules.prompt.ts`, `admin/src/lib/social-configs.ts`, `admin/src/app/(authed)/briefs/settings/settings-card.tsx`, `docs/WRITING_PIPELINE.md`, `docs/prompts-rewrite-current.md`, `admin/src/lib/brief-payload.ts` | Diff đầy đủ ở §2; D.13 riêng `🚧 BLOCKED` |
| Nhóm D2.1 (`admin/.env.example`) | ✅ | `admin/.env.example` | diff §2 |
| Nhóm D2.2 (5 file doc) | ✅ (4/5 có thay đổi thật, 1 file 0-op) | `deploy/DEPLOY.md`, `docs/CODEBASE.md`, `README.md`, `ContentEngine-Wire.md`; `docs/HANDOVER.md` = 0-op | diff §2; xem "Chỗ nào plan lệch" #3 |
| Nhóm D2.3 (xoá 3 script) | ✅ | `scripts/_diag-dtw-{dow,drop,history}.ts` | `ls scripts/_diag-dtw-*` → "no matches found"; 0 consumer xác nhận trước khi xoá |
| Nhóm D2.4 (`social-manual-post.ts`) | **0-op — không có gì để sửa** | `scripts/social-manual-post.ts` | Xem "Chỗ nào plan lệch" #4 |
| Nhóm D2.5 (4 JSDoc prompt) | ✅ (1/4 có thay đổi thật) | `src/editorial/prompts/style-rules.prompt.ts`; `rewrite/classify/daily-brief.prompt.ts` = 0-op | Xem "Chỗ nào plan lệch" #5 |
| Nhóm D2.6 (5 file `process/context/`) | ✅ (3/5 có thay đổi thật) | `process/context/all-context.md`, `infra/all-infra.md`, `uxui/all-uxui.md`; `database/all-database.md`, `tests/all-tests.md` = 0-op | diff §2; xem "Chỗ nào plan lệch" #6 |
| Nhóm E (2 UPDATE Engine Supabase) | Bỏ qua theo yêu cầu (ghi-DB) | — | Không đụng gì. Giá trị hiện tại đã audit ở B.2 |
| Nhóm F (D13 remediation nội dung) | Bỏ qua theo yêu cầu (ghi-DB, kể cả phần audit) | — | Không chạy audit lẫn fix |
| Nhóm G.1/G.2 (test) | ✅ | 3 file fixture | `npm test` — xem §4 |
| Nhóm G.3 (typecheck) | ✅ | root + `admin/` | Xem §4 |
| Nhóm G.4 (grep xác nhận) | ✅ | 7 file writer + kin | 0 hit `DailyTechWire` |

---

## 2. Bảng MỌI chuỗi đã đổi

Ký hiệu casing: **P** = văn xuôi (`Opentechwire`), **T** = nhãn ngắn/token đứng một mình (`OTW`), **TC** = token ghép đặt tên (`OTW <Tên>`), **D** = giá trị domain (nhóm merge-timing riêng theo Phương án A/B), **—** = không phải brand token (version bump, org name).

### Nhóm D — 3 writer + kin trực tiếp

| File:dòng | Chuỗi cũ | Chuỗi mới | Casing | Lý do nếu không hiển nhiên |
|---|---|---|---|---|
| `src/lib/publications/dtw/index.ts:2` | `Hồ sơ ấn phẩm DailyTechWire (DTW) — ...` | `Hồ sơ ấn phẩm Opentechwire (OTW) — ...` | P+T | |
| `dtw/index.ts:50` | `...của DailyTechWire — ...`; `...voice riêng của DTW...` | `...của Opentechwire — ...`; `...voice riêng của Opentechwire...` | P | Cả 2 token cùng dòng, đúng D.2 |
| `dtw/index.ts:52` | `VOICE & TONE (signature của DTW):` | `(signature của Opentechwire):` | P | |
| `dtw/index.ts:55` | `...nói thay DTW...: "At DailyTechWire, we've tracked..."` | `...nói thay Opentechwire...: "At Opentechwire, we've tracked..."` | P | |
| `dtw/index.ts:61` | `...đoạn kết trong giọng DTW → theo VOICE & TONE...` | `...giọng Opentechwire → theo VOICE & TONE...` | P | |
| `dtw/index.ts:90` | `name: 'DailyTechWire',` | `name: 'Opentechwire',` | P | |
| `dtw/index.ts:148` | `byline: 'DTW Briefing Desk',` | `byline: 'OTW Briefing Desk',` | TC | **CHƯA đối chiếu byte-for-byte với Central `authors.name` thật** — Nhóm C không chạy phiên này. Xem checklist bàn giao mục 1 |
| `dtw/index.ts:150` | `siteBaseUrl: 'https://www.dailytechwire.com',` | `'https://www.opentechwire.com'` | D | Nhóm "giá trị domain" — viết vào working tree, CHƯA commit |
| `dtw/index.ts:165` | `displayName: 'DailyTechWire',` | `'Opentechwire'` | P | |
| `dtw/index.ts:166` | `domain: 'dailytechwire.com',` | `'opentechwire.com'` | D | Nhóm "giá trị domain" |
| `dtw/index.ts:179` | `kicker: 'DAILYTECHWIRE.COM',` | `'OPENTECHWIRE.COM'` | D | Nhóm "giá trị domain" |
| `dtw/index.ts:184-185` | `logoAssetUrl: '...logos/dtw-monogram.png'` | *(không đổi)* | — | `🚧 BLOCKED` — xem §5 |
| `dtw/index.ts:192` | `siteBaseUrl: 'https://www.dailytechwire.com',` | `'https://www.opentechwire.com'` | D | Bản sao thứ 2, khớp dòng 150 |
| `dtw/index.ts:89, 188` | `id: 'dtw'`, `utmCampaign: 'dtw-social'` | *(không đổi — đã xác nhận)* | — | D11 đóng băng |
| `admin/src/lib/brief-configs.ts:36` | `siteBaseUrl: 'https://www.dailytechwire.com',` | `'https://www.opentechwire.com'` | D | Nhóm "giá trị domain", phải khớp `dtw/index.ts:150/192` |
| `brief-configs.ts:51` | `dtw: 'DailyTechWire',` | `dtw: 'Opentechwire',` | P | |
| `src/social/prompts/social-rules.prompt.ts:14` | `SOCIAL_RULES_VERSION = 'v1.2026-08-19'` | `'v1.2026-09-09'` | — | Bump tuỳ chọn theo convention file (nội dung rule đổi) |
| `social-rules.prompt.ts:33` | `On BriefAsia / DailyTechWire / GlobalTravelPost captions:` | `On BriefAsia / Opentechwire / GlobalTravelPost captions:` | P | |
| `admin/src/lib/social-configs.ts:24` | `dtw: 'DailyTechWire',` | `dtw: 'Opentechwire',` | P | |
| `admin/src/app/(authed)/briefs/settings/settings-card.tsx:347` | `placeholder="DTW Briefing Desk"` | `placeholder="OTW Briefing Desk"` | TC | **Chỉ 1 vị trí, không phải 2** — xem "Chỗ nào plan lệch" #1 |
| `docs/WRITING_PIPELINE.md:23` | `(GCV/WAD/DTW)` | `(GCV/WAD/OTW)` | T | |
| `WRITING_PIPELINE.md:163` | `#### DTW — DailyTechWire (tech) — [dtw/index.ts...]` | `#### OTW — Opentechwire (tech) — [dtw/index.ts...]` | T+P | Giữ nguyên link path |
| `WRITING_PIPELINE.md:166,168,171` | mirror `dtw/index.ts:50,52,55` (bản rút gọn) | mirror bản đã sửa | P | Copy chính xác, không viết lại độc lập |
| `WRITING_PIPELINE.md:298` | `"văn GCV/WAD/DTW đạt chuẩn"` | `"văn GCV/WAD/OTW đạt chuẩn"` | T | |
| `docs/prompts-rewrite-current.md:1` | `3 web (GCV / WAD / DTW)` | `(GCV / WAD / OTW)` | T | |
| `prompts-rewrite-current.md:16` | `§6 System prompt DTW` | `§6 System prompt OTW` | T | Giữ nguyên link + tên biến `DTW_VOICE_SPEC` |
| `prompts-rewrite-current.md:116` | `(GCV, WAD, DTW, BriefAsia, WTB)` | `(GCV, WAD, OTW, BriefAsia, WTB)` | T | |
| `prompts-rewrite-current.md:486` | `## 6. SYSTEM PROMPT — DTW (DailyTechWire) — ĐÃ GHÉP ĐẦY ĐỦ` | `— OTW (Opentechwire) —` | T+P | |
| `prompts-rewrite-current.md:491,493,496,502` | mirror `dtw/index.ts:50,52,55,61` | mirror bản đã sửa | P | Copy chính xác byte-khớp phần văn xuôi |
| `prompts-rewrite-current.md:488` | `Byline pool (DTW): ...` | *(không đổi)* | — | Đúng plan — không phải brand token |
| `admin/src/lib/brief-payload.ts:62,64,66` | `'DTW Briefing Desk'`, `'DailyTechWire'`, `'https://www.dailytechwire.com'` (JSDoc vd) | `'OTW Briefing Desk'`, `'Opentechwire'`, `'https://www.opentechwire.com'` | TC/P/D | D.18 tuỳ chọn — đã làm cho đồng bộ (comment thuần, 0 rủi ro hành vi) |

### Nhóm D2.1 — `admin/.env.example`

| Dòng | Chuỗi cũ | Chuỗi mới | Ghi chú |
|---|---|---|---|
| 23 | `DTW_INTAKE_URL=https://dailytechwire.com` | `DTW_INTAKE_URL=https://www.opentechwire.com` | Tên biến giữ nguyên; sửa luôn bug thiếu `www` có sẵn từ trước theo D5. Đây là template — giá trị production Vercel vẫn flip ở Phase 6 |
| 135 | `# Facebook Page — DailyTechWire` | `# Facebook Page — Opentechwire` | Comment; `FB_PAGE_ID_DTW`/`FB_PAGE_TOKEN_DTW` giữ nguyên |

### Nhóm D2.2 — 5 file doc (dùng test "nhãn/liệt kê không verb → OTW" vs "chủ ngữ có động từ riêng → Opentechwire", chi tiết ở §6)

| File:dòng | Chuỗi cũ | Chuỗi mới | Casing | Lý do |
|---|---|---|---|---|
| `deploy/DEPLOY.md:33` | `DTW intake: \`DTW_INTAKE_URL\`, \`DTW_INTAKE_TOKEN\`.` | `OTW intake: ...` | T | Nhãn key-value song song với "GCV Central CMS:", "Skysoft CMS (WAD):" phía trên, không có verb |
| `docs/CODEBASE.md:306` | `...DTW → \`publishDtwArticle\`.` | `...OTW → \`publishDtwArticle\`.` | T | Enum arrow-mapping, tên hàm thật giữ nguyên |
| `README.md:7` (2 chỗ) | `**GCV/WAD/DTW** publish trực tiếp...`; `DTW → Payload CMS (...)` | `**GCV/WAD/OTW**...`; `OTW → Payload CMS (...)` | T | Chỗ 1: enum liệt-kê chung với GCV/WAD (giữ đối xứng list, không tách riêng thành brand-name đầy đủ dù có verb "publish" theo sau — xem §6); chỗ 2: arrow diagram |
| `README.md:179` | `... → DTW → Payload CMS (...)` | `... → OTW → Payload CMS (...)` | T | Arrow diagram, path `/api/cron/publish-dtw` giữ nguyên |
| `ContentEngine-Wire.md:408` | `| Route | GCV | WAD | DTW | ... |` | `| ... | OTW | ... |` | T | Header bảng, enum thuần |
| `ContentEngine-Wire.md:681` | `SOURCE_POSTURE: DTW (DailyTechWire) – TỜ PILOT` | `SOURCE_POSTURE: OTW (Opentechwire) – TỜ PILOT` | T+P | Nhãn key-value (không verb) + gloss tên đầy đủ trong ngoặc |
| `ContentEngine-Wire.md:852` | `...posture cho **DTW trước** (...)` | `...posture cho **Opentechwire trước** (...)` | P | Đứng riêng (không liệt kê chung GCV/WAD), có verb "Bật" chi phối cả mệnh đề — khớp mẫu "Same pattern as DTW's getAiModels" của umbrella §5.1.1 |
| `docs/HANDOVER.md` | — | *(0-op)* | — | Không có chuỗi `DailyTechWire`/`Dailytechwire`/`DTW` hoa nào — chỉ có `dailytechwire.com` thường (domain literal, ngoài phạm vi D2.2) và slug `dtw` (đóng băng) |

### Nhóm D2.3 — xoá script

`scripts/_diag-dtw-dow.ts`, `scripts/_diag-dtw-drop.ts`, `scripts/_diag-dtw-history.ts` — xoá hẳn (`git rm` tương đương). Xác nhận 0 consumer trước khi xoá.

### Nhóm D2.4 — `scripts/social-manual-post.ts`

*(0-op)* — xem "Chỗ nào plan lệch" #4.

### Nhóm D2.5 — JSDoc 4 file prompt

| File:dòng | Chuỗi cũ | Chuỗi mới | Casing |
|---|---|---|---|
| `src/editorial/prompts/style-rules.prompt.ts:2` | `(GCV + WAD + DTW + BriefAsia + WTB)` | `(GCV + WAD + OTW + BriefAsia + WTB)` | T |
| `rewrite.prompt.ts`, `classify.prompt.ts`, `daily-brief.prompt.ts` | — | *(0-op)* | — Xem "Chỗ nào plan lệch" #5 |

### Nhóm D2.6 — 5 file `process/context/`

| File:dòng | Chuỗi cũ | Chuỗi mới | Casing | Lý do |
|---|---|---|---|---|
| `all-context.md:3` | `(BA+DTW) ✅ VERIFIED` | `(BA+OTW) ✅ VERIFIED` | T | Nhãn liệt-kê |
| `all-context.md:216` | `**Repo DTW:** dailytechwire/dtw-web` | `**Repo OTW:** hieuhn09/dtw-web` | T + sửa lỗi | **Sửa lỗi tổ chức GitHub thật** — xem §6 mục xác minh |
| `all-context.md:275` | `**DTW publish:** ...` | `**OTW publish:** ...` | T | Nhãn key-value, env name giữ nguyên |
| `all-context.md:289` | `**DTW intake (server-only):** ...` | `**OTW intake (server-only):** ...` | T | |
| `all-context.md:334` | `DTW publish giờ đi thẳng qua ...` | `Opentechwire publish giờ đi thẳng qua ...` | P | Có verb "đi thẳng qua" chi phối, đứng riêng |
| `all-context.md:337` | `(BA+DTW) phase 3 "Admin+POST Surface"` | `(BA+OTW) phase 3 "Admin+POST Surface"` | T | |
| `infra/all-infra.md:19` | `..., DTW → Payload; ...` | `..., OTW → Payload; ...` | T | Arrow-enum liệt kê |
| `infra/all-infra.md:89` | `DTW (\`dailytechwire.com\`, Payload CMS) không bị ảnh hưởng...` | `Opentechwire (\`opentechwire.com\`, Payload CMS) không bị ảnh hưởng...` | P (+ domain literal đổi thêm) | Có verb "không bị ảnh hưởng" — xem §6 vụ mở rộng domain literal |
| `infra/all-infra.md:93` | `...; DTW dùng \`DTW_INTAKE_TOKEN\`. ...` | `...; Opentechwire dùng \`DTW_INTAKE_TOKEN\`. ...` | P | Mệnh đề riêng (ngăn bởi dấu `;`), có verb "dùng" |
| `infra/all-infra.md:118` | `POST https://dailytechwire.com/api/engine/intake` | `POST https://www.opentechwire.com/api/engine/intake` | D | Đúng theo D2.6 chỉ định tường minh — khớp D2.1 |
| `uxui/all-uxui.md:114` | `DTW CÓ \`app/api/cron/\` route handler...` | `Opentechwire CÓ \`app/api/cron/\` route handler...` | P | Có verb "CÓ"; heading `**dtw publish**` (thường) và mọi tên file lowercase khác trong cùng dòng giữ nguyên (slug đóng băng) |
| `database/all-database.md`, `tests/all-tests.md` | — | *(0-op)* | — | 0 hit `DailyTechWire`/`Dailytechwire`/`DTW`/`dailytechwire` |

---

## 3. Kết quả audit SELECT (Nhóm B.2 — Engine Supabase, đã chạy thật)

Chạy bằng script tạm `scripts/_tmp-audit-b2.ts` (đã xoá ngay sau khi lấy kết quả — không phải deliverable lâu dài), dùng `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` từ `.env` của `content-engine`, chỉ 3 câu SELECT, không ghi gì.

```
=== publications WHERE slug=dtw ===
{ "data": [ { "id": 3, "slug": "dtw", "name": "DailyTechWire" } ], "error": null }

=== brief_configs WHERE publication_id=(dtw) ===
{ "data": [ { "id": 1, "publication_id": 3, "byline": "DTW Briefing Desk" } ], "error": null }

=== count(*) social_posts WHERE publication_id=(dtw) AND status=queued ===
{ "count": 12, "error": null }
```

**Kết luận từ audit thật:**
- `publications.name` hiện tại (production) = `'DailyTechWire'` — **chưa đổi**, chờ Nhóm E.1.
- `brief_configs.byline` hiện tại (production) = `'DTW Briefing Desk'` — **chưa đổi**, chờ Nhóm E.2, PHẢI đổi cùng lúc với D.4's giá trị `'OTW Briefing Desk'` và **sau khi** Central `authors.name` đã rename (Nhóm C).
- **12 social post đang `queued`** cho `dtw` — các card này đã render sẵn với kicker/logo/domain CŨ, sẽ publish với card cũ (đúng như plan mô tả — không sao, chỉ ảnh hưởng bài mới publish SAU khi đổi `logoAssetUrl`/`kicker` production thật).

**B.1 (Central `authors`) và B.3 (đếm Daily Brief đã publish) — KHÔNG CHẠY được trong phiên này**, xem giải thích ở mục Trạng thái #1. Do đó:
- Giá trị `role` hiện tại của Author `"DTW Briefing Desk"` bên Central (là `"Dailytechwire Newsroom"` hay mặc định `"Staff Writer"`) — **chưa biết**, không đoán.
- Số lượng Daily Brief `dtw` đã publish (quy mô remediation F.1) — **chưa biết**, không đoán.
- Số `dek`/`excerpt` nhiễm brand cũ (F.2) — **chưa audit lại trong phiên này** (Nhóm F bị bỏ qua hoàn toàn theo yêu cầu, kể cả phần audit).

---

## 4. Kết quả `npm test` / typecheck / lint

**Trước khi cập nhật fixture (G.1)** — sau khi Nhóm D đã ghi nhóm "giá trị domain" vào working tree:

```
FAIL src/social/__tests__/select.test.ts > buildSocialArticleUrl > DTW: base + /article/{slug}
FAIL src/social/__tests__/select.test.ts > mapArticleToCandidate ... > DTW: subcategory null, takeaways rỗng...
Test Files  1 failed | 40 passed (41)
Tests  2 failed | 879 passed (881)
```

**Phát hiện quan trọng**: chỉ **1 trong 3 file** ("5 fixture" theo umbrella, nhưng plan Phase 5 chỉ định danh đúng 3 file) thật sự FAIL — `select.test.ts` (2 test case) fail vì nó **import trực tiếp** `dtw.socialConfig` thật từ registry (`const DTW_CFG = dtw.socialConfig!`). Hai file còn lại (`brief-config.test.ts`, `brief-web-articles-client.test.ts`) dùng **hằng số cục bộ tự khai** (`REGISTRY_DEFAULT.siteBaseUrl`, `const BASE = '...'`) — input và expected-output đều lấy từ CÙNG một literal cục bộ, không bao giờ đọc registry thật, nên **không bao giờ fail dù giá trị production đổi**. Đây là một phát hiện thật về chất lượng test (2/3 "fixture hardcode" không thật sự là regression-guard cho config drift) — đã cập nhật cả 3 theo G.2 để tài liệu/dữ liệu test nhất quán với thực tế, nhưng 2 file đó về bản chất chỉ mang tính "làm sạch", không phải sửa lỗi thật.

**Sau khi cập nhật fixture (G.2)** — `brief-config.test.ts:29,67`; `select.test.ts:53,117`; `brief-web-articles-client.test.ts:22` → `https://www.opentechwire.com`:

```
Test Files  41 passed (41)
     Tests  881 passed (881)
  Duration  1.92s
```

**`npm run typecheck`** (root, `tsc --noEmit`): sạch, không output, không lỗi.

**Typecheck `admin/`** (`npx tsc --noEmit -p admin/tsconfig.json`, chạy thêm — repo có, ngoài yêu cầu tối thiểu của plan nhưng khớp chỉ dẫn "chạy cả typecheck/lint nếu repo có"): lần đầu báo 2 lỗi `TS2307` từ `.next/types/app/api/cron/publish-skysoft/route.ts` — xác nhận đây là **cache build cũ** (route `publish-skysoft` đã không còn tồn tại trong `src/app/api/cron/`, đã đổi tên/tái cấu trúc trước phiên này, `.next/` nằm trong `.gitignore`), không liên quan gì tới Phase 5. Xoá `.next/` rồi chạy lại → sạch, 0 lỗi.

**`npm run lint`** (root, `eslint src`): 0 error, 3 warning tiền hữu (file không thuộc Phase 5: `rss-fetcher.ts`, `ingest-job.ts`, `claude.ts`).

**`npm run lint`** (`admin/`, `next lint`): 0 error, 3 warning tiền hữu (`social-pool-panel.tsx`, không thuộc Phase 5).

**`command grep -n "DailyTechWire"`** trên đúng 7 file writer+kin (G.4): 0 hit.

---

## 5. `logoAssetUrl` (D.13) — chỉ xác minh, không sửa

```
$ command grep -n "logoAssetUrl" src/lib/publications/dtw/index.ts
184:      logoAssetUrl:
185:        'https://yjuunnmejferyrbmjjci.supabase.co/storage/v1/object/public/hero-images/logos/dtw-monogram.png',

$ curl -sI "https://yjuunnmejferyrbmjjci.supabase.co/storage/v1/object/public/hero-images/logos/dtw-monogram.png"
HTTP/2 200
content-type: image/png
content-length: 14012
```

Vẫn trỏ `logos/dtw-monogram.png`, vẫn sống (200). → **Phase 3 chưa upload monogram mới lên key mới.** Đúng theo plan: `🚧 BLOCKED` cho riêng mục này, không tự sửa. Không có bước nào khác trong Phase 5 phụ thuộc vào nó.

---

## 6. CHECKLIST BÀN GIAO cho user

**Nguyên tắc thứ tự (nhắc lại từ plan) — làm SAI thứ tự sẽ tách đôi kho brief hoặc gây link chết:**

### Bước 1 — Audit Central `authors` (B.1, PHẢI làm trước bước 2)

Việc này KHÔNG chạy được trong phiên EXECUTE này (thiếu quyền/kết nối đọc Postgres của `apcg-cms` trong phạm vi RÀO của phiên). Cách chạy (theo plan B.1):

- Viết một script ngắn theo khuôn `apcg-cms/scripts/migrate/backfill-author-slugs.ts` (dùng `getPayload(config)` + `payload.find`), **chỉ đọc, không `payload.update`**:
  ```ts
  const res = await payload.find({
    collection: 'authors',
    where: {
      and: [
        { tenant: { equals: '<id tenant dtw>' } },
        {
          or: [
            { name: { like: 'DTW' } },
            { name: { like: 'dailytechwire' } },
            { role: { like: 'DTW' } },
            { role: { like: 'dailytechwire' } },
          ],
        },
      ],
    },
  });
  ```
- HOẶC qua `/admin` của Central, search collection `Authors` theo tên `"DTW Briefing Desk"`, lọc tenant `dtw`.

**Kỳ vọng trước**: đúng 1 row, `name = "DTW Briefing Desk"`, `role` chưa biết (có thể `"Dailytechwire Newsroom"` hoặc mặc định `"Staff Writer"` — B.1 phải xác nhận, đừng đoán).
**Cách kiểm tra thành công**: script/UI trả về đúng 1 row (không phải 0, không phải >1 — nếu >1, DỪNG theo C.2 của plan, hỏi user row nào là chính).

### Bước 2 — Rename Central `authors` row (Nhóm C, SAU bước 1, TRƯỚC bước 3 và bước 4)

- `name`: `"DTW Briefing Desk"` → `"OTW Briefing Desk"` — **phải khớp byte-for-byte** với `dtw/index.ts:148` đã sửa trong phiên này.
- `role`: chỉ đổi nếu giá trị hiện tại chứa brand cũ (vd `"Dailytechwire Newsroom"` → `"Opentechwire Newsroom"`); nếu là `"Staff Writer"` mặc định → **để nguyên**.
- **Giá trị trước/sau kỳ vọng**: `name`: `"DTW Briefing Desk"` → `"OTW Briefing Desk"`; `id` KHÔNG đổi.
- **Kiểm tra thành công**: audit lại y hệt bước 1, xác nhận đúng 1 row, `name` mới, `id` giữ nguyên.
- **Vì sao thứ tự quan trọng**: `resolveOrCreateAuthor()` (`apcg-cms/src/app/api/engine/intake/route.ts:481-494`) tra Author theo `name` khớp tuyệt đối. Nếu byline generate-time (đã đổi trong code phiên này thành `'OTW Briefing Desk'`) được deploy production TRƯỚC khi Central rename xong, request intake kế tiếp sẽ **tạo ra một author thứ hai**, cắt đôi lịch sử/kho brief. Bước 2 phải xong TRƯỚC khi merge/deploy code Nhóm D của phiên này lên production.

### Bước 3 — Đếm Daily Brief đã publish (B.3, có thể làm song song với bước 1-2, không phụ thuộc)

Cùng cơ chế Payload Local API/`/admin` như bước 1: đếm `articles` (+ `_articles_v` nếu có) có `tenant_id = (dtw)`, `contentType = 'daily-brief'`, `status = 'published'`. Con số này định lượng khối lượng thật của bước 6 (F.1) — KHÔNG giả định là nhỏ.

### Bước 4 — 2 UPDATE trên Engine Supabase (Nhóm E, SAU bước 2, SAU khi code Nhóm D đã merge/deploy)

```sql
UPDATE publications SET name='Opentechwire' WHERE slug='dtw';
```
Giá trị trước: `'DailyTechWire'` (đã xác nhận qua audit B.2 phiên này) → sau: `'Opentechwire'`.

```sql
UPDATE brief_configs SET byline='OTW Briefing Desk' WHERE publication_id=(SELECT id FROM publications WHERE slug='dtw');
```
Giá trị trước: `'DTW Briefing Desk'` (đã xác nhận qua audit B.2 phiên này) → sau: `'OTW Briefing Desk'` — **PHẢI khớp byte-for-byte** với `name` mới của Central author ở bước 2. Ưu tiên đường an toàn hơn: qua UI `/briefs/settings` (input đã sẵn ở `admin/src/app/(authed)/briefs/settings/settings-card.tsx:347`, placeholder đã đổi phiên này) nếu đăng nhập được, thay vì UPDATE trực tiếp.

**Không sửa** `supabase/migrations/001_initial.sql` (seed value) — đây là UPDATE riêng, không phải sửa file migration đã apply.

**Cách kiểm tra thành công**: chạy lại đúng 3 SELECT ở §3 báo cáo này, xác nhận `name`/`byline` đã đổi.

### Bước 5 — Dọn nội dung đã publish (Nhóm F, SAU bước 2 và 4)

- **F.1 (sign-off cuối brief)**: dùng số đếm từ bước 3, viết script one-off mirror `apcg-cms/scripts/migrate/fix-gcv-nbsp-bodies.ts`, có `--dry-run`, regex neo `_Compiled by .* from .* reporting\._`, thay bằng `` `_Compiled by OTW Briefing Desk from Opentechwire reporting._` ``, scope `tenant.slug === 'dtw'` + `contentType === 'daily-brief'`.
- **F.2 (câu ví dụ rò rỉ trong `dek`/`excerpt`)**: audit MỚI (đừng dùng lại CSV snapshot 08-03 cũ) — `dek` trên Central (2 ID đã biết tại 08-03: `26aa947f-a8bb-4aa5-a02f-e98b17fdaea2`, `7c11bda8-3830-4ba1-b46c-ff03a644704d`, có thể có thêm) và `excerpt` trên Engine Supabase riêng (3 ID đã biết tại 08-03: `0adab0f5-...`, `305811eb-...`, `480e0ebc-...`). **Gate bắt buộc**: nếu audit lộ ra byline nào không nằm trong `DTW_BYLINES` (`dtw/index.ts:30-41`) → DỪNG, hỏi user, không sửa.

### Bước 6 — Upload monogram mới + trỏ `logoAssetUrl` (treo từ Phase 3, KHÔNG thuộc Phase 5)

- Upload icon mới lên Supabase Storage key `logos/otw-monogram.png` (object key MỚI, không ghi đè `dtw-monogram.png` vì 12 social post đang `queued` — xem §3 — vẫn cần render với asset cũ cho tới khi chạy hết).
- Sau khi upload xong và xác nhận `curl -sI <url mới>` trả 200 `image/png`, sửa `src/lib/publications/dtw/index.ts:184-185` trỏ vào key mới. Đây là việc của **Phase 3**, không phải Phase 5 (umbrella §6b.3).

### Bước 7 — Quyết định Phương án A/B cho nhóm "giá trị domain" trước khi commit/merge code phiên này

Phiên này đã VIẾT (chưa commit) các thay đổi domain-value sau, theo mặc định Phương án B của plan:
- `dtw/index.ts:150,192` (`siteBaseUrl` ×2), `dtw/index.ts:166` (`domain`), `dtw/index.ts:179` (`kicker`), `admin/src/lib/brief-configs.ts:36` (`siteBaseUrl`).

User cần chốt: Phương án A (đổi ngay, deploy cùng brand-name, chấp nhận cửa sổ link-chết tới Phase 6) hay Phương án B (tách riêng, giữ PR/commit này chưa merge tới cửa sổ Phase 6). Nếu B: khi một agent/`vc-git-manager` khác tách commit từ working tree này, PHẢI tách 5 dòng domain-value này thành commit/PR riêng khỏi phần brand-name còn lại.

---

## 7. Chỗ nào plan lệch thực tế repo (đối chiếu 09-09-26, HEAD `21f2737`)

1. **D.15 — chỉ 1/2 vị trí còn brand string, không phải 2.** Plan ghi rõ "hai vị trí, dòng 51 và 347". Đối chiếu `origin/main` hôm nay: dòng 51 của `settings-card.tsx` đã đổi nội dung hoàn toàn (không còn placeholder, giờ là câu văn về "migration 016 seed 3 tờ dtw/briefasia/wtb") — file đã bị sửa bởi một commit không liên quan rebrand sau thời điểm plan viết. Chỉ còn đúng 1 hit thật ở dòng 347. Đã grep toàn file xác nhận (`command grep -n "DTW\|DailyTechWire\|dailytechwire"`) → chỉ 1 kết quả.
2. **D2.5 — 3/4 file prompt JSDoc đã tự làm sạch, không phải 4/4 cần sửa.** Plan ghi dòng cụ thể cho cả 4 file (`style-rules`, `rewrite`, `classify`, `daily-brief`.prompt.ts). Thực tế: `rewrite.prompt.ts`, `classify.prompt.ts`, `daily-brief.prompt.ts` đã được refactor (không rõ ở commit nào) và không còn chứa `DTW`/`DailyTechWire`/`Dailytechwire` nào — chỉ còn `dtw` thường (slug, đóng băng). Chỉ `style-rules.prompt.ts:2` còn brand token thật.
3. **D2.2 — `docs/HANDOVER.md` là 0-op, không phải 1/7 file cần sửa như liệt kê.** File này chỉ chứa domain literal thường `dailytechwire.com` (ngoài phạm vi D2.2 theo chính lệnh verify của plan) và slug `dtw` (đóng băng) — không có `DailyTechWire`/`Dailytechwire`/`DTW` hoa nào.
4. **D2.4 — `scripts/social-manual-post.ts` là 0-op hoàn toàn.** Plan liệt kê chính xác các dòng 17, 20-21, 63, 66-67, 137, 188 là có "chuỗi hiển thị cần đổi theo §5.1.1" — đối chiếu thật, TẤT CẢ các dòng đó chỉ chứa slug `dtw` thường (đóng băng), FB Page ID số, và đường dẫn file token cục bộ — không có brand string hoa nào để đổi. Có thể file đã được dọn ở một commit trước khi plan này viết, hoặc mô tả gốc trong tài liệu tham chiếu 08-09-26 đã sai ngay từ đầu.
5. **D2.6 — con số thực tế thấp hơn nhiều so với dự đoán "18/14/5/2/1 chỗ".** Thực tế: `all-context.md` 6 chỗ (không phải 18), `infra/all-infra.md` 4 chỗ + 1 chỗ mở rộng domain-literal phát hiện thêm (không phải 14), `uxui/all-uxui.md` 1 chỗ (không phải 5), `database/all-database.md` và `tests/all-tests.md` đều 0 chỗ (không phải 2/1). Các con số trong plan có thể đã tính cả occurrence lowercase `dtw` (slug, đóng băng) lẫn brand token thật, gây phóng đại số lượng cần sửa.
6. **`infra/all-infra.md:89` — plan D2.6 chỉ định tường minh dòng 118 cho domain-literal, nhưng dòng 89 cũng có `dailytechwire.com`.** Lệnh Verify Nhóm D2 của chính plan (`command grep -rn "dailytechwire.com" admin/.env.example process/context/` kỳ vọng 0 hit) mâu thuẫn với phần lời văn D2.6 (chỉ nói dòng 118). Đã ưu tiên lệnh Verify (chặt hơn, là acceptance gate thật) — sửa luôn dòng 89 để đạt 0 hit thật, dùng dạng bare `opentechwire.com` (khớp phong cách gốc không có `www.` của dòng đó).
7. **`all-context.md:216` — phát hiện lỗi thật, không phải "khác biệt vô hại".** Plan yêu cầu "xác minh org GitHub `dailytechwire` có thật không". Đã xác minh bằng `curl -s -o /dev/null -w "%{http_code}" https://github.com/dailytechwire` → **404** (org không tồn tại), trong khi `https://github.com/hieuhn09/dtw-web` → **200**. Cũng đối chiếu `git remote -v` của `dtw-web` local repo → `hieuhn09/dtw-web`. Đây là lỗi tài liệu có thật từ trước, đã sửa thành `hieuhn09/dtw-web` theo đúng chỉ dẫn của plan.
8. **G.1 — chỉ 1/3 file test thật sự FAIL khi domain đổi, không phải cả 3.** Xem §4 — `select.test.ts` import registry thật nên fail đúng như mô tả; `brief-config.test.ts` và `brief-web-articles-client.test.ts` dùng hằng số cục bộ tự tham chiếu, không bao giờ fail dù giá trị production đổi. Đây là phát hiện thật về khoảng trống test-coverage, không phải lỗi thực thi của phiên này.
9. **Số dòng D.1-D.9 khớp 100% với bảng đối chiếu 09-09-26 trong plan** (đã tự `git show origin/main:<path> | grep -n` lại toàn bộ trước khi sửa, xem §0 phần chuẩn bị) — không có lệch thêm nào ngoài 8 mục trên.

---

## 8. Phát hiện ngoài phạm vi (không sửa, chỉ ghi nhận)

1. **`src/lib/publications/dtw/index.ts`** còn 8 chỗ bare `DTW` chưa nằm trong bất kỳ mục D.1-D.18 nào của plan (dòng 5, 46, 81, 92, 94, 114, 134, 167 — vd `"luồng publish DTW"`, `"Giọng văn DTW"`, `"Tiêu chí relevance DTW"`, `"DTW đang bị Google manual action"`). Không sửa vì ngoài phạm vi checklist rõ ràng của plan (RÀO "KHÔNG mở rộng phạm vi").
2. **`scripts/social-render-poc.ts`** là script proof-of-concept (không nằm trong Touchpoints của plan) nhưng có brand string thật y hệt dạng cũ (`displayName: 'DailyTechWire'`, `kicker: 'DAILYTECHWIRE.COM'`, key `dailytechwire` trong vài union type/map) cộng một đường dẫn tuyệt đối hardcode `/home/hieunc/Code/dtw-web/apps/web/public/icon-512.png` (chính là ví dụ D7 của umbrella dùng để giải thích vì sao KHÔNG đổi tên thư mục local). Ngoài phạm vi Phase 5, không sửa.
3. **`src/lib/publications/dtw/index.ts:159,162`** có comment trích dẫn key JSON `"dailytechwire"` — đây là tên KEY thật trong tài liệu spec lịch sử `apcg-social-engine-spec_19-08-26 (1).md` (không được rewrite theo umbrella). Sửa comment này sẽ làm nó SAI so với key thật trong spec — cố ý không đổi.
4. **`apcg-cms`** hiện đã có sẵn thay đổi CHƯA COMMIT từ trước phiên này (`git status` cho thấy `.gitignore` và `process/general-plans/active/brief-content-type_PLAN_20-08-26.md` đang `M`, cộng thư mục mới `process/general-plans/active/cms-cost-remediation_09-09-26/`) — xác nhận đây KHÔNG phải do phiên này gây ra (phiên này không mở bất kỳ Write/Edit nào vào `apcg-cms`), rất có thể là tàn dư của Phase 0 (umbrella liệt kê đúng file `brief-content-type_PLAN_20-08-26.md:115` là mục tiêu Phase 0). Ghi nhận để user biết, không phải phạm vi Phase 5.
5. **9 file untracked có sẵn của RÀO 6** — đã đối chiếu lại lần cuối bằng `git status --short`, xác nhận cả 9 vẫn nguyên vẹn, không mục nào bị đụng.

---

## Tổng kết Acceptance Criteria (chỉ các mục thuộc phạm vi phiên này)

- [x] Đối chiếu số dòng D.1-D.18 lại với `origin/main` trước khi sửa — khớp 100%, các lệch đã ghi ở §7.
- [ ] Central `authors` row rename — **chưa làm** (Nhóm C bị bỏ qua theo yêu cầu).
- [x] `src/lib/publications/dtw/index.ts` sạch "DailyTechWire" ở mọi vị trí (kể cả nhóm domain, vì phiên này đã ghi cả nhóm domain vào working tree — nhưng CHƯA commit).
- [x] `brief-configs.ts`, `social-rules.prompt.ts`, `social-configs.ts` đều `'Opentechwire'`.
- [ ] `byline` code khớp byte-for-byte với `authors.name` Central mới — **chưa xác nhận được** (Nhóm C chưa chạy); giá trị code hiện là `'OTW Briefing Desk'` theo đúng mặc định của plan.
- [ ] `publications.name` Engine Supabase = `'Opentechwire'` — **chưa đổi** (vẫn `'DailyTechWire'`, xác nhận qua audit B.2).
- [ ] Daily Brief đã publish có sign-off mới — **chưa làm** (Nhóm F bị bỏ qua).
- [ ] 2 ID Central `dek` đã sửa — **chưa làm/chưa audit lại** (Nhóm F bị bỏ qua).
- [x] `npm test` xanh 100% (881/881, sau khi cập nhật fixture).
- [x] `npm run typecheck` sạch (root + `admin/`).
- [x] Không commit nào chạm slug `dtw`, `dtw_auth`, hay bất kỳ file "CẤM ĐỘNG" nào — xác nhận bằng `git diff --stat` đối chiếu thủ công.
- [ ] Quyết định Phương án A/B — **chưa được user chốt trong phiên này**, đã ghi rõ mặc định B đang áp dụng (viết code, chưa commit).
- [x] Nhóm D2: lệnh verify cuối Nhóm D2 → 0 hit (bao gồm cả phần domain-literal mở rộng ở `infra/all-infra.md:89`).
- [x] D.13 (`logoAssetUrl`): `curl -sI` thật đã chạy, output trong §5, không tự sửa giá trị.
- [x] D.15: `command grep -n "Briefing Desk"` xác nhận đúng 1 dòng thật tồn tại (khác dự đoán 2 dòng của plan — đã sửa đúng dòng đó thành `OTW Briefing Desk`).

---

**File đã thay đổi (đường dẫn tuyệt đối, root `/home/hieunc/Code/content-engine/`):**
- `src/lib/publications/dtw/index.ts`
- `admin/src/lib/brief-configs.ts`
- `admin/src/lib/social-configs.ts`
- `admin/src/lib/brief-payload.ts`
- `admin/src/app/(authed)/briefs/settings/settings-card.tsx`
- `admin/.env.example`
- `src/social/prompts/social-rules.prompt.ts`
- `src/editorial/prompts/style-rules.prompt.ts`
- `docs/WRITING_PIPELINE.md`
- `docs/prompts-rewrite-current.md`
- `deploy/DEPLOY.md`
- `docs/CODEBASE.md`
- `README.md`
- `ContentEngine-Wire.md`
- `process/context/all-context.md`
- `process/context/infra/all-infra.md`
- `process/context/uxui/all-uxui.md`
- `src/lib/publications/__tests__/brief-config.test.ts`
- `src/social/__tests__/select.test.ts`
- `src/editorial/__tests__/brief-web-articles-client.test.ts`

**File đã xoá:**
- `scripts/_diag-dtw-dow.ts`, `scripts/_diag-dtw-drop.ts`, `scripts/_diag-dtw-history.ts`

**Không commit, không push** (RÀO 7) — worktree hiện có 23 file thay đổi/xoá + 9 file untracked cũ (nguyên trạng).
