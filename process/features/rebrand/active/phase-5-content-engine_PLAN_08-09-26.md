# Rebrand Phase 5 — content-engine: ba writer cùng lúc + dữ liệu liên quan

**Date**: 08-09-26 (khớp ngày của umbrella/tài liệu tham chiếu)
**Research re-verified against live code**: 09-09-26 — mọi số dòng trong plan này đã được đối chiếu LẠI trực tiếp với `origin/main` của từng repo liên quan vào ngày này (không chép nguyên số dòng từ tài liệu tham chiếu 08-09-26 — xem §"Đối chiếu số dòng" bên dưới, một số đã LỆCH và được sửa).
**Complexity**: COMPLEX — phase con trong phase program `rebrand` (8 phase)
**Feature**: `rebrand`
**Phase**: 5 / 8
**Plan file**: `process/features/rebrand/active/phase-5-content-engine_PLAN_08-09-26.md`
**Umbrella plan**: `process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md` — đọc TRƯỚC plan này để lấy ledger D1–D15, danh sách đóng băng, và quy ước dùng chung. Plan này **trỏ về** umbrella thay vì chép lại; không bàn lại D1–D15 ở đây.
**Tài liệu tham chiếu gốc**: `process/general-plans/references/rebrand-opentechwire_REFERENCE_08-09-26.md` §3.6 (data-cms-db), §3.7 (content-engine), §4.2 (DB đang chạy), §7 Phase 5 gốc (đã lỗi thời một phần — xem "Khác biệt so với §7 gốc" bên dưới)
**Report đích**: `process/features/rebrand/reports/phase-5-content-engine_REPORT_<dd-mm-yy>.md` (tạo khi EXECUTE chạy xong)
**Status**: ⏳ PLANNED — chưa sửa dòng code nào
**Execute anchor**: Đây là plan file EXECUTE ANCHOR duy nhất cho Phase 5. Nó không phải một `phase-*.md` kiểu legacy độc lập — nó là một direct plan (`_PLAN_`) trong bộ phase-plan của phase program `rebrand`. **Supporting phase files** của toàn chương trình: umbrella plan cộng 7 phase file khác — **cả 7 đã tồn tại** tại `process/features/rebrand/active/` (danh sách có thẩm quyền ở umbrella §3; câu "chưa tồn tại" ở bản trước đã lỗi thời từ 09-09-26). Các file đó KHÔNG phải một phần thực thi của Phase 5, chỉ là ngữ cảnh chương trình.
**Ngữ cảnh đã đọc**: `process/context/all-context.md` (invariants #11 slug/schema, #14 định vị toàn cầu, feature index — chưa mang D1–D15 vì Phase 0 chưa chạy; ledger thật nằm ở umbrella §2). `process/context/tests/all-tests.md` được xem qua nhưng **không áp dụng trực tiếp** cho phase này — tài liệu đó phạm vi `dtw-web` (Next.js/Payload), còn `content-engine` là repo riêng dùng `vitest` với quy ước test độc lập (`npm test` = `vitest run`, `npm run typecheck` = `tsc --noEmit`) — quy ước cụ thể ở Nhóm G bên dưới.

---

## Quick Links

- [Phạm vi phase này](#phạm-vi-phase-này)
- [KHÔNG thuộc phase này](#không-thuộc-phase-này)
- [Dependency](#dependency)
- [Tiền đề bắt buộc — trạng thái worktree](#tiền-đề-bắt-buộc--trạng-thái-worktree-đã-xác-minh-09-09-26)
- [Đối chiếu số dòng — nơi đã LỆCH so với tài liệu tham chiếu/nhiệm vụ gốc](#đối-chiếu-số-dòng--nơi-đã-lệch-so-với-tài-liệu-tham-chiếungiao-việc-gốc)
- [Quy tắc đổi chữ (D1/D2/D8 áp dụng cho content-engine)](#quy-tắc-đổi-chữ-d1d2d8-áp-dụng-cho-content-engine)
- [Quyết định kỹ thuật cần chốt trước EXECUTE](#quyết-định-kỹ-thuật-cần-chốt-trước-execute-không-phải-ledger-d1d15)
- [Phase Completion Rules](#phase-completion-rules)
- [Thứ tự bắt buộc (rất quan trọng)](#thứ-tự-bắt-buộc-rất-quan-trọng)
- [Implementation Checklist](#implementation-checklist)
- [Touchpoints](#touchpoints)
- [Public Contracts](#public-contracts)
- [Blast Radius](#blast-radius)
- [Verification Evidence](#verification-evidence)
- [Risks and Mitigations](#risks-and-mitigations)
- [Rollback](#rollback)
- [Resume and Execution Handoff](#resume-and-execution-handoff)
- [Acceptance Criteria](#acceptance-criteria)
- [Cursor + RIPER-5 Guidance](#cursor--riper-5-guidance)

---

## Overview

`content-engine` (path `/home/hieunc/Code/content-engine`) có **ba nơi generate-time** tự đúc brand cũ vào văn bản mới mỗi khi có bài/brief/social post được sinh ra: system prompt rewriter (`DTW_VOICE_SPEC`), config Daily Brief (`brief-configs.ts`), và prompt rule mạng xã hội (`social-rules.prompt.ts`). Nếu chỉ sửa hai trong ba, corpus mới vẫn tiếp tục nhiễm brand cũ và phải viết lại lần hai. Phase này sửa cả ba, cộng các bản sao brand-name khác trong cùng "họ" (SOCIAL_SITE_NAMES, placeholder UI, hai file doc mirror của voiceSpec), cập nhật hai row DB đang sống bên Engine Supabase, rename tại chỗ row `authors` bên Central **trước khi** flip byline generate-time (để không tách đôi kho brief), và dọn nội dung đã publish nhiễm brand cũ theo đúng ranh giới D13 (chỉ brief máy soạn + một lỗi rò rỉ câu ví dụ trong dek, không đụng bài có byline nhà báo).

Phase này **không** đổi giá trị `DTW_INTAKE_URL` (đó là Phase 6), **không** đổi slug `dtw` ở bất kỳ đâu (D11, vĩnh viễn), và **không** viết lại nội dung bài báo thật có byline nhà báo (D13).

---

## Phạm vi phase này

Đúng theo Phase 5 trong umbrella (§3), cụ thể hoá thành:

1. **Ba writer generate-time**: `src/lib/publications/dtw/index.ts` (`DTW_VOICE_SPEC` + các field cấu hình), `admin/src/lib/brief-configs.ts` (`SITE_NAMES`, `siteBaseUrl`), `src/social/prompts/social-rules.prompt.ts` (rule 10).
2. **Các bản sao brand-name "họ hàng"** không nằm trong 3 file trên nhưng nêu ở §3.7 tài liệu tham chiếu và không bị đóng băng: `admin/src/lib/social-configs.ts:24` (`SOCIAL_SITE_NAMES`), placeholder UI ở `admin/src/app/(authed)/briefs/settings/settings-card.tsx`, hai file doc mirror `docs/WRITING_PIPELINE.md` + `docs/prompts-rewrite-current.md`.
3. **Hai row DB sống bên Engine Supabase**: `publications.name`, `brief_configs.byline`.
4. **Rename tại chỗ** row `authors` bên Central (Payload) khớp byline hiện tại — **trước khi** giá trị byline generate-time đổi.
5. **Audit + remediation D13**: brief đã publish (sign-off "_Compiled by … from … reporting._") và các dek/excerpt đã publish nhiễm câu ví dụ "At DailyTechWire, we've tracked…" bị rò rỉ từ voiceSpec.
6. **Tiền đề**: xác minh (không giả định) trạng thái merge của worktree `content-engine-kpi-gd1-publish-caps`.
7. **Bề mặt bổ sung 09-09-26 (Nhóm D2)**: `admin/.env.example:23,135-137`; `settings-card.tsx:51` (bản Phase 5 cũ chỉ nhận 347); 5 file doc còn lại (`deploy/DEPLOY.md`, `docs/CODEBASE.md`, `docs/HANDOVER.md`, `README.md`, `ContentEngine-Wire.md`); xoá 3 script `scripts/_diag-dtw-*.ts`; `scripts/social-manual-post.ts`; JSDoc header 4 file `src/editorial/prompts/*.prompt.ts`; 5 file `content-engine/process/context/*.md`.
8. **Kiểm chứng**: `npm test` (content-engine), `tsc --noEmit`/`typecheck`, grep chuẩn (dùng `command grep`), audit SQL/Local-API chạy thật.

## KHÔNG thuộc phase này

| Việc | Vì sao không phải phase này | Thuộc phase nào |
|---|---|---|
| Đổi giá trị `DTW_INTAKE_URL` (`admin/.env.example:22`, và biến Vercel thật) | Đây là endpoint reader-facing thật sự đi vào production; theo umbrella, `dtw-web` phải serve domain mới TRƯỚC rồi engine mới lật giá trị này | Phase 6 (CUTOVER) |
| Sửa lỗi apex-vs-www có sẵn từ trước ở `DTW_INTAKE_URL=https://dailytechwire.com` (thiếu `www`) | Bug tồn tại từ trước, không phải do rebrand; nằm cùng biến với mục trên | Phase 6 hoặc một bugfix riêng, không phải rebrand |
| Đổi tên module/file `dtw-intake-client.ts`, guard `if (slug !== 'dtw')` trong `publish-dtw.ts`, key registry `dtw`, `PublishCapSlug`, biến env `FB_PAGE_ID_DTW`/`LI_ORG_URN_DTW`/`FB_PAGE_TOKEN_DTW`, `.github/workflows/*.yml` CSV values, `config/sources.yaml publication_targets`, storage prefix `hero-images/dtw/` | D11 — đóng băng vĩnh viễn | Không phase nào |
| `SiteCode` union của `media-engine` | Không thuộc D11/D12, độc lập, nhưng không phải "ba writer" | Phase 7 (tuỳ chọn) |
| Re-render social card PNG đã render/đang `status='queued'` | Cho chạy hết theo umbrella, trừ khi user quyết định khác | Không phase nào (để queue tự chạy hết) |
| Rewrite thân bài (`body`) của bài báo thường có byline nhà báo | D13 cấm tuyệt đối | Không phase nào |
| `logoAssetUrl` (dòng 184-185) — **cả việc upload asset LẪN việc trỏ giá trị** | Phân giải chồng lấn 09-09-26 (umbrella §6b.3): Phase 3 làm cả hai trong một bước để không có cửa sổ nào URL trỏ vào key chưa tồn tại. Phase 5 chỉ **xác minh** (bước D.13) | **Phase 3** |
| Đổi tên schema Postgres `dtw_auth` / bucket R2 `dtw-media` | D12 — đóng băng | Không phase nào |

---

## Dependency

- **Chặn bởi Phase 3** (Brand mark) cho đúng một field: `logoAssetUrl` (bước 3.13 dưới đây) cần key Storage monogram mới đã tồn tại. Nếu Phase 3 chưa xong, EXECUTE làm mọi bước khác của phase này bình thường và để `logoAssetUrl` là bước cuối cùng, đánh dấu 🚧 BLOCKED riêng cho đúng bước đó cho tới khi có key mới.
- **Độc lập với Phase 4** (copy hiển thị dtw-web) — không giao nhau về file.
- **Chặn Phase 6** (CUTOVER) — Phase 6 cần: (a) code brand-name của Engine đã sạch, (b) row `authors` bên Central đã rename xong, (c) quyết định về thời điểm merge/deploy phần "giá trị domain" (xem "Quyết định kỹ thuật" §D-domain bên dưới) đã được chốt.
- **Không phụ thuộc Phase 0/1/2** về mặt kỹ thuật để bắt đầu viết code, nhưng NÊN chạy sau Phase 0 (ledger D1/D2/D8 đã vào `process/context/`) để tránh EXECUTE phải tự tra lại ledger.

---

## Tiền đề bắt buộc — trạng thái worktree (đã xác minh 09-09-26)

Nhiệm vụ gốc yêu cầu: *"PHẢI merge worktree `content-engine-kpi-gd1-publish-caps` trước."* Đây là điều kiện đúng về nguyên tắc (worktree đó sửa `admin/src/lib/publish-dtw.ts` và `admin/src/lib/byline-policy.ts`, hai file này giao nhau về file — tuy không giao nhau về đúng dòng — với vùng Phase 5 có thể chạm tới).

**Đã xác minh bằng lệnh git thật (09-09-26), KHÔNG giả định:**

```
cd /home/hieunc/Code/content-engine-kpi-gd1-publish-caps
git status                     # → "nothing to commit, working tree clean", "up to date with origin/feat/byline-wad-gcv"
git log --oneline -3           # → tip 1b97ec1

cd /home/hieunc/Code/content-engine
git fetch origin --quiet
git branch -a --contains 1b97ec1     # → hiển thị dưới remotes/origin/main (qua f6fee5a)
git log origin/main --oneline | grep -i byline-wad-gcv
  # → f6fee5a Merge pull request #58 from hieuhn09/feat/byline-wad-gcv
  # → 1b97ec1 feat(byline): pool WAD + GCV theo trang /about...
git show -s --format='%ci' f6fee5a   # → 2026-09-04 10:44:51 +0700
git show origin/main:admin/src/lib/publish-dtw.ts | grep -n reviewed_by
  # → có mặt (dòng 38, 103) — bằng chứng PR #58 đã nằm trong origin/main
```

**Kết luận tại thời điểm viết plan này**: PR #58 (nhánh `feat/byline-wad-gcv`, chính là worktree `content-engine-kpi-gd1-publish-caps`) **đã merge vào `origin/main` từ 2026-09-04**, tức là **4 ngày trước cả khi tài liệu tham chiếu được viết** (08-09-26 ghi "chưa merge" — dòng đó đã lỗi thời ngay từ khi ra đời, có thể do người nghiên cứu đọc trạng thái worktree cục bộ mà không `git fetch` lại `origin/main`). Diff của PR #58 vào `publish-dtw.ts` chỉ thêm field `reviewed_by`/`reviewedBy` (không đụng guard `if (slug !== 'dtw')` ở các dòng 83/99/153); diff vào `byline-policy.ts` chèn hai block `wad`/`gcv` MỚI phía trước block `dtw` hiện có, làm dịch chuyển số dòng của block `dtw` (không đổi nội dung block `dtw`).

**Bước 0 bắt buộc của EXECUTE (KHÔNG được bỏ qua, KHÔNG được tin vào kết luận ở trên mà không tự chạy lại)**:

1. Chạy lại đúng chuỗi lệnh git ở trên tại thời điểm EXECUTE thật sự bắt đầu (có thể cách thời điểm PLAN này vài ngày).
2. Nếu vẫn merged (kỳ vọng): tiếp tục bình thường, KHÔNG cần tự tay merge gì thêm.
3. Nếu vì lý do nào đó CHƯA merged (ví dụ có force-push/revert): dừng lại, merge hoặc rebase nhánh `feat/byline-wad-gcv` vào `main` trước (qua PR bình thường, không dùng `--no-verify`), rồi mới tiếp tục Phase 5.
4. Dù merged hay chưa, **KHÔNG build trên nhánh hiện đang checkout** của `content-engine` — tại thời điểm viết plan này, nhánh đang checkout là `feat/ba-social-figma-templates`, có untracked file không liên quan (`APCG-BriefAsia-DesignNotes-Tech-v2.1.md`, `APCG-KPI-tan-suat-dang-bai.pdf`, v.v. — ĐỪNG động vào các file này). Tạo nhánh Phase 5 MỚI từ `origin/main` mới nhất: `git fetch origin && git checkout -b rebrand/phase-5-content-engine origin/main`.

---

## Đối chiếu số dòng — nơi đã LỆCH so với tài liệu tham chiếu/giao việc gốc

Nhiệm vụ gốc (và tài liệu tham chiếu 08-09-26) nêu số dòng cho `src/lib/publications/dtw/index.ts` là: `kicker 177`, `logoAssetUrl 183`, `siteBaseUrl … 190`. Khi đối chiếu trực tiếp với `origin/main` hôm nay (09-09-26) bằng `git show origin/main:src/lib/publications/dtw/index.ts`, ba số này đã lệch vì một commit không liên quan rebrand (`spelling: 'en-US' → 'en-GB'`, 08-09-26, kèm 2 dòng comment mới) đã chèn thêm dòng phía trên chúng:

| Field | Số dòng nêu trong giao việc/tài liệu tham chiếu | Số dòng THẬT trên `origin/main` hôm nay | Dùng số nào |
|---|---|---|---|
| `voiceSpec` (khối) | 50-56 | 50-56 khớp, nhưng khối thật trải dài tới dòng 61 (mục STRUCTURE cũng có "giọng DTW") — xem bước 3.1 | Sửa cả 50, 52, 55, **và 61** |
| `name` | 90 | 90 | khớp |
| `byline` | 148 | 148 | khớp |
| `siteBaseUrl` (briefConfig) | 150 | 150 | khớp |
| `displayName` | 165 | 165 | khớp |
| `domain` | 166 | 166 | khớp |
| `kicker` | 177 | **179** | dùng 179 |
| `logoAssetUrl` (khai báo / chuỗi URL) | 183 | **184 / 185** | dùng 184-185 |
| `utmCampaign` (đóng băng, chỉ để đối chiếu) | 186 | **188** | dùng 188 |
| `siteBaseUrl` (socialConfig) | 190 | **192** | dùng 192 |

`admin/src/lib/brief-configs.ts` (SITE_NAMES:51, siteBaseUrl:36), `src/social/prompts/social-rules.prompt.ts:33`, `admin/src/lib/social-configs.ts:24`, `admin/src/lib/publish-dtw.ts`, `admin/src/lib/dtw-intake-client.ts`, `admin/src/app/(authed)/briefs/settings/settings-card.tsx`, `docs/WRITING_PIPELINE.md` — **đã đối chiếu, khớp 100% với `origin/main`**, không lệch.

`docs/prompts-rewrite-current.md` — **lệch nhiều** vì một PR không liên quan rebrand đã merge gần đây (`claude/singlish-neutral-writing-59ca04` → `c8dbf81`, commit mới nhất trên `origin/main`) xoá hẳn một khối lớn về Singlish/neutral-writing rules phía trên phần voiceSpec DTW, làm dịch số dòng xuống dưới lệch khoảng +30. Số dòng ĐÚNG trên `origin/main` hôm nay: dòng 1, 16, 116 (mục mới phát hiện — xem bước 3.15), 486, 488 (không đổi, chỉ là tên người), 491, 493, 496, 502.

**Vì khoảng cách giữa lúc viết plan này và lúc EXECUTE thật sự chạy có thể là vài ngày, EXECUTE PHẢI tự `git show origin/main:<path> | grep -n` lại TỪNG file trước khi sửa, không tin số dòng trong bảng trên là tuyệt đối — bảng trên là bằng chứng tại 09-09-26, không phải hợp đồng bất biến.**

---

## Quy tắc đổi chữ (D1/D2/D8 áp dụng cho content-engine)

Từ ledger umbrella §5.1, áp dụng cụ thể cho các loại chuỗi xuất hiện trong `content-engine`:

| Dạng chuỗi nguồn | Quy tắc | Ví dụ |
|---|---|---|
| `DailyTechWire` (tên đầy đủ) trong văn xuôi/comment/system prompt | → `Opentechwire` (sentence case, D1) | `"Bạn là biên tập viên kỳ cựu của DailyTechWire"` → `"...của Opentechwire"` |
| `DTW` trần dùng như CHỮ VIẾT TẮT THAY THẾ CHO TÊN ĐẦY ĐỦ trong văn xuôi (không phải một token ghép có tên riêng) | → `Opentechwire` (viết đầy đủ, sentence case — theo D1, "DTW" ở đây chỉ là cách viết tắt tuỳ tiện của tên đầy đủ trong câu, không phải monogram được gắn nhãn) | `"signature của DTW"` → `"signature của Opentechwire"`; `"giọng DTW"` → `"giọng Opentechwire"` |
| `DTW <Token>` — TOKEN GHÉP đặt tên cho một team/sản phẩm/gói cụ thể (đã có tiền lệ `OTW Studio` ở §5.1 umbrella) | → `OTW <Token>` (đổi cơ học đúng phần `DTW`→`OTW`, giữ nguyên phần còn lại) | `DTW Briefing Desk` → `OTW Briefing Desk` |
| `dailytechwire` viết thường TRẦN dùng như domain/URL literal | → `opentechwire` (theo D3/D5 — đây là domain value, không phải "wordmark lockup" nhưng cùng cách viết thường vì là chuỗi domain) | `domain: 'dailytechwire.com'` → `domain: 'opentechwire.com'` |
| `DAILYTECHWIRE.COM` toàn hoa (kicker — domain hiển thị trên social card) | → `OPENTECHWIRE.COM` (đổi cơ học, đây là domain-in-caps, không phải quy tắc casing D1 cho brand name) | `kicker: 'DAILYTECHWIRE.COM'` → `'OPENTECHWIRE.COM'` |
| `id: 'dtw'` và mọi nơi slug `dtw` được dùng làm khoá/định danh | **KHÔNG ĐỔI** — D11 đóng băng vĩnh viễn | — |

Không có trường hợp nào trong `content-engine` cần dùng `opentechwire` viết thường kiểu "wordmark lockup" (đó là asset thị giác thuộc Phase 3/`dtw-web`) — mọi chuỗi domain viết thường trong `content-engine` là domain LITERAL (D3/D5), không phải lockup.

---

## Quyết định kỹ thuật cần chốt trước EXECUTE (KHÔNG phải ledger D1-D15 — đây là một lựa chọn kỹ thuật trong phạm vi Phase 5, cần user xác nhận trước khi EXECUTE, không phải một điều đã "chốt")

**Vấn đề**: Ba field (`siteBaseUrl` ×2, `domain`, và gián tiếp `kicker` vì nó hiển thị domain) không chỉ là "brand name" — chúng là GIÁ TRỊ DOMAIN dùng để dựng URL đưa cho độc giả thật (link trong sign-off cuối brief: `"_Compiled by … from … reporting._"` không chứa URL, nhưng `buildArticleUrl(siteBaseUrl, articlePathTemplate, slug)` ở nơi khác trong social caption/canonical_url THÌ có). Tại thời điểm Phase 5 chạy, `opentechwire.com` **chưa có A record, đang parked** (D3/D4) — `dtw-web` chưa serve domain đó cho tới Phase 6. Nếu Phase 5 deploy production giá trị `siteBaseUrl`/`domain` mới NGAY, mọi social post/canonical URL sinh ra trong khoảng giữa (Phase 5 xong → Phase 6 cutover) sẽ trỏ vào một domain không phân giải được — link chết 100%, không phải một rủi ro giả định.

Umbrella (§3, dependency Phase 5→6) viết: *"chặn Phase 6 (Engine phải trỏ domain mới... trước khi cutover thật)"* — câu này CÓ THỂ đọc theo hai cách: (a) code phải đã VIẾT XONG và SẴN SÀNG trước Phase 6, hoặc (b) giá trị đã LÊN PRODUCTION trước Phase 6. Umbrella không nói rõ cơ chế deploy của content-engine trên Vercel (tự động deploy khi merge `main` hay thủ công) — đây là ẩn số vận hành thật (cùng nhóm ẩn số #6 của umbrella: "Không truy cập được Vercel... mọi mô tả suy ra từ config trong repo").

**Hai phương án — chọn MỘT trước khi EXECUTE chạy bước 3.4/3.9/3.13/3.17 dưới đây, KHÔNG để EXECUTE tự quyết:**

- **Phương án A (khớp chữ nghĩa umbrella, chấp nhận rủi ro)**: Đổi giá trị `siteBaseUrl`/`domain`/`kicker` sang domain mới NGAY trong Phase 5, deploy production cùng lúc với phần brand-name. Chấp nhận cửa sổ link-chết từ lúc Phase 5 lên production tới lúc Phase 6 cutover xong. Giảm thiểu bằng cách: rút ngắn khoảng cách Phase 5→Phase 6 tối đa, và/hoặc tạm dừng cron `brief:once`/`social:once` phía content-engine trong đúng cửa sổ đó (thao tác thủ công ngoài phạm vi code).
- **Phương án B (an toàn hơn, đề xuất mặc định của plan này)**: Viết đủ 3 field này trong CÙNG nhánh/PR của Phase 5 (để review/test cùng lúc, thoả "code đã sẵn sàng"), nhưng **giữ PR đó ở trạng thái chưa merge vào `main`** (hoặc merge vào một nhánh trung gian không auto-deploy) cho tới đúng cửa sổ Phase 6. Ba field brand-name còn lại (voiceSpec, name, byline, displayName, SITE_NAMES, SOCIAL_SITE_NAMES, social-rules, placeholder UI, 2 doc mirror) merge và lên production NGAY — đây là phần giá trị cao nhất (dừng đúc brand cũ vào nội dung mới) và KHÔNG phụ thuộc domain đã live hay chưa.

**Plan này viết theo Phương án B làm mặc định** (an toàn hơn, không mâu thuẫn với bất kỳ mục D1-D15 nào, chỉ là trình tự merge/deploy) nhưng đánh dấu rõ từng bước nào thuộc nhóm "giá trị domain" để nếu user chọn Phương án A thì chỉ cần gộp lại thành một lượt merge duy nhất — không cần viết lại nội dung thay đổi.

---

## Phase Completion Rules

Kế thừa nguyên vẹn từ `process/development-protocols/phase-programs.md` (Phase Status Rules) và umbrella §"Phase Completion Rules". Nhắc lại áp dụng cho phase này:

1. Cổng verification riêng của phase này (xem "Verification Evidence") đạt.
2. Regression check: chạy lại grep chuẩn trên `dtw-web` để chắc Phase 3/4 (nếu đã xong) chưa bị đụng nhầm — Phase 5 không sửa file nào trong `dtw-web`.
3. Bằng chứng chạy thật — không suy luận. `npm test` xanh, output SQL/Local-API audit dán vào report, không phải "chắc là đúng".
4. Đường lỗi được kiểm tra — atomic guard `if (slug !== 'dtw')` không được đụng; nếu EXECUTE lỡ tay sửa, `verify-db.ts`/`npm test` phải bắt được.
5. User confirmation trước khi đánh dấu `✅ VERIFIED`. Trước đó, cao nhất là `🧪 TESTING`.

Marker: `⏳ PLANNED` · `🔨 CODE DONE` · `🧪 TESTING` · `✅ VERIFIED` · `🚧 BLOCKED`.

---

## Thứ tự bắt buộc (rất quan trọng)

Đây KHÔNG phải một danh sách có thể làm song song tuỳ ý — ba ràng buộc thứ tự sau là **correctness**, không phải phong cách:

1. **Audit Central `authors` TRƯỚC khi rename** (Nhóm B trước Nhóm C) — vì báo cáo `brief-display_REPORT_20-08-26.md` (dòng 71-74) ghi rõ việc "seed Author desk" với `role: "Dailytechwire Newsroom"` từng nằm ở mục **"Còn lại — cần môi trường" (CHƯA LÀM tính đến 20-08-26)** — nếu không seed, bản tin đầu tiên tự tạo ra một Author với `role: "Staff Writer"` (giá trị mặc định `DEFAULT_AUTHOR_ROLE`, không phải "Dailytechwire Newsroom"). Nghĩa là **giá trị `role` hiện tại trên production CHƯA BIẾT CHẮC** — có thể là "Dailytechwire Newsroom" (nếu ai đó đã seed tay sau 20-08-26) hoặc "Staff Writer" (nếu chưa). Đừng giả định — đọc thật rồi mới quyết định có cần sửa `role` hay không.
2. **Rename Central `authors.name` TRƯỚC khi đổi giá trị `byline` generate-time bên engine** (Nhóm C trước Nhóm D bước liên quan tới byline) — vì `resolveOrCreateAuthor()` (`apcg-cms/src/app/api/engine/intake/route.ts:481-494`, đã xác minh khớp `origin/main` hôm nay) tra cứu Author **theo đúng `name` chuỗi khớp tuyệt đối** (`where: { name: { equals: byline } }`). Nếu byline generate-time đổi thành `"OTW Briefing Desk"` trước khi row Central đổi tên, request intake tiếp theo sẽ KHÔNG khớp author cũ, **tạo ra một author thứ hai**, cắt đôi lịch sử/kho brief giữa hai identity.
3. **Cả hai (1) và (2) xảy ra TRƯỚC khi UPDATE `brief_configs.byline`/`publications.name` trên Engine Supabase** — vì giá trị code (`byline: '...'` trong `index.ts`, `SITE_NAMES.dtw` trong `brief-configs.ts`) chỉ là **fallback**; giá trị đang chạy thật là các row DB đó. Đổi DB trước khi Central rename xong tạo đúng cùng một lỗi ở mục (2).

Trình tự tổng thể: **Nhóm A (git/branch) → Nhóm B (audit, đọc trước) → Nhóm C (rename Central authors) → Nhóm D (code 3 writer + họ hàng) → Nhóm D2 (bề mặt bổ sung 09-09-26: template env, 5 file doc, xoá 3 script tạm, JSDoc prompt, 5 file `process/context/` của content-engine) → Nhóm E (2 UPDATE DB Engine) → Nhóm F (D13 remediation nội dung đã publish) → Nhóm G (test + audit lại)**. Nhóm D2 không có ràng buộc thứ tự với D/E/F — đặt sau D chỉ để review cùng lô.

---

## Implementation Checklist

Đánh số theo Nhóm.Chữ (vd. B.1). Mỗi bước độc lập kiểm chứng được.

### Nhóm A — Chuẩn bị môi trường git (không phải brand code)

**A.1.** Chạy lại toàn bộ chuỗi lệnh git ở mục "Tiền đề bắt buộc" phía trên. Dán output vào report.

**A.2.** Nếu worktree chưa merge (ngoài kỳ vọng): merge/rebase `feat/byline-wad-gcv` vào `main` qua PR bình thường trước khi tiếp tục.

**A.3.** `cd /home/hieunc/Code/content-engine && git fetch origin && git checkout -b rebrand/phase-5-content-engine origin/main`. KHÔNG build trên `feat/ba-social-figma-templates` (nhánh đang checkout tại thời điểm viết plan, không liên quan, có untracked file lạ cần bỏ qua).

**A.4.** Ghi lại baseline: `command grep -rniE 'dailytechwire|daily ?tech ?wire|\bdtw\b' . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist > /tmp/ce-brand-before.txt` (lưu để so sánh sau; số dòng "before" này KHÔNG được dùng làm tiêu chí "phải về 0" vì phần lớn là slug `dtw` đóng băng — chỉ dùng để diff thủ công, xem Verification Evidence).

### Nhóm B — Audit TRƯỚC khi ghi bất kỳ dòng nào (Central + Engine Supabase)

**B.1.** Xác định cơ chế chạy audit Central: `apcg-cms` có `DATABASE_URL` trong `.env.local`/`.env` (đọc qua `scripts/lib/env.ts`), dùng cho các script kiểu `scripts/migrate/*.ts` (Payload Local API, không phải raw SQL trên các field `richText`). Với bảng `authors` (field `text` thuần, không phải Lexical), audit có thể chạy qua MỘT trong hai cách — EXECUTE chọn cách sẵn có/an toàn hơn tại thời điểm đó:
   - (a) Một script ngắn theo đúng khuôn `apcg-cms/scripts/migrate/backfill-author-slugs.ts` (dùng `getPayload(config)` + `pFind`/`payload.find`), lọc `collection: 'authors'`, `where: { and: [{ tenant: { equals: <id tenant dtw> } }, { or: [{ name: { like: 'DTW' } }, { name: { like: 'dailytechwire' } }, { role: { like: 'DTW' } }, { role: { like: 'dailytechwire' } }] }] }` — chạy ở chế độ chỉ-đọc (không gọi `payload.update`).
   - (b) Qua `/admin` Central (trình duyệt), tìm kiếm Authors theo tên "DTW Briefing Desk" trong ô search của collection `Authors`, lọc theo tenant `dtw`.
   Dán kết quả thật (id, name, role, city hiện tại) vào report. **KHÔNG được suy đoán giá trị `role` là "Dailytechwire Newsroom" chỉ vì đó là giá trị "chốt" trong báo cáo 20-08-26** — báo cáo đó ghi rõ việc seed CHƯA XÁC NHẬN đã làm.

**B.2.** Audit Engine Supabase — chạy 3 câu SELECT (qua Supabase SQL Editor thủ công, HOẶC qua một script ngắn dùng `@supabase/supabase-js` với `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` đã có sẵn trong `.env` của content-engine, theo đúng pattern các file trong `content-engine/scripts/`):
   ```sql
   SELECT slug, name FROM publications WHERE slug='dtw';
   SELECT id, publication_id, byline FROM brief_configs WHERE publication_id=(SELECT id FROM publications WHERE slug='dtw');
   SELECT count(*) FROM social_posts WHERE publication_id=(SELECT id FROM publications WHERE slug='dtw') AND status='queued';
   ```
   Dán cả ba kết quả vào report. Số `queued` quyết định có cần chờ hàng đợi social post chạy hết trước khi đổi `logoAssetUrl`/`kicker` hay không (post đang queued dùng card đã render sẵn với kicker/logo CŨ — không sao, chỉ ảnh hưởng bài publish MỚI sau khi đổi).

**B.3.** Đếm số Daily Brief `dtw` đã publish, để biết quy mô remediation D13 (KHÔNG giả định là "5 dòng" — con số 5 là của một lỗi KHÁC, xem Nhóm F): qua Central, đếm `articles` (hoặc `_articles_v` nếu có bản draft) có `tenant_id = (dtw)` và `contentType = 'daily-brief'` và `status = 'published'`. Dùng cùng cơ chế script/`/admin` như B.1. Dán con số thật vào report — con số này định lượng khối lượng công việc thật của bước F.2, không phải một ước lượng.

### Nhóm C — Rename Central `authors` row (Payload Local API hoặc `/admin`, TRƯỚC Nhóm D-byline)

**C.1.** Dựa trên kết quả B.1: nếu tìm thấy đúng MỘT row Author khớp (kỳ vọng `name = "DTW Briefing Desk"`), đổi `name` → `"OTW Briefing Desk"`. Nếu `role` hiện tại chứa brand cũ (`"Dailytechwire Newsroom"` hoặc tương tự) → đổi thành `"Opentechwire Newsroom"` (prose, sentence case — đây là một chức danh, không phải monogram). Nếu `role` hiện tại là `"Staff Writer"` (giá trị mặc định `DEFAULT_AUTHOR_ROLE` — nghĩa là chưa từng được seed tay) → **để nguyên `role`**, đây không phải brand token, không thuộc phạm vi Phase 5 (là một quyết định biên tập riêng, không phải rebrand).

**C.2.** Nếu B.1 tìm thấy **nhiều hơn một** row khớp (dấu hiệu cho thấy việc tách-author đã từng xảy ra trước Phase 5 vì một lý do khác) → DỪNG, ghi vào report là `🚧 BLOCKED` cho đúng bước này, báo cho user quyết định row nào là "chính" trước khi rename — KHÔNG tự ý chọn.

**C.3.** Nếu B.1 tìm thấy **0 row** khớp (bất ngờ, ví dụ brief chưa từng publish thật) → không có gì để rename; ghi rõ vào report, bỏ qua Nhóm C, vẫn tiếp tục Nhóm D bình thường (byline mới sẽ tự tạo author mới đúng tên mới ở lần publish đầu tiên — không có tách-đôi vì không có row cũ để tách khỏi).

**C.4.** Sau khi rename (nếu có), audit lại y hệt B.1 để xác nhận: đúng 1 row, `name` mới, `id` KHÔNG đổi (Payload `update` giữ nguyên id — xác nhận, không giả định).

### Nhóm D — Code: ba writer + họ hàng brand-name (Phương án B — phần này merge/deploy NGAY, không phụ thuộc domain live)

**D.1.** `src/lib/publications/dtw/index.ts` — docblock đầu file, dòng 2: `"Hồ sơ ấn phẩm DailyTechWire (DTW) — Asia-forward tech journalism."` → `"Hồ sơ ấn phẩm Opentechwire (OTW) — Asia-forward tech journalism."`.

**D.2.** Cùng file, `DTW_VOICE_SPEC` (khai báo dòng 50) — sửa đúng 4 dòng vật lý chứa brand (đã xác nhận trên `origin/main` hôm nay, xem bảng đối chiếu số dòng):
   - Dòng 50: `"Bạn là biên tập viên kỳ cựu của DailyTechWire — ..."` → `"...của Opentechwire — ..."`; và `"...viết bài có editorial voice riêng của DTW..."` → `"...của Opentechwire..."` (2 token trên cùng 1 dòng).
   - Dòng 52: `"VOICE & TONE (signature của DTW):"` → `"(signature của Opentechwire):"`.
   - Dòng 55: `"Dùng first-person plural khi nói thay DTW một cách tiết chế: \"At DailyTechWire, we've tracked...\", ..."` → `"...nói thay Opentechwire...: \"At Opentechwire, we've tracked...\", ..."` (2 token).
   - Dòng 61: `"...đoạn kết trong giọng DTW → theo VOICE & TONE..."` → `"...giọng Opentechwire → theo VOICE & TONE..."`.

**D.3.** Cùng file, dòng 90: `name: 'DailyTechWire',` → `name: 'Opentechwire',`.

**D.4.** Cùng file, dòng 148: `byline: 'DTW Briefing Desk',` → `byline: 'OTW Briefing Desk',` — **PHẢI khớp byte-for-byte** với giá trị `name` mới của Central author (Nhóm C.1). Nếu Nhóm C đổi thành một chuỗi khác (ví dụ user muốn tên khác "OTW Briefing Desk"), quay lại sửa bước này cho khớp — đây là hợp đồng chính xác chuỗi, không phải gợi ý.

**D.5. (nhóm "giá trị domain" — xem Quyết định kỹ thuật phía trên).** Cùng file, dòng 150 và dòng 192 (2 chỗ `siteBaseUrl: 'https://www.dailytechwire.com'`) → `'https://www.opentechwire.com'`. **Theo Phương án B: viết thay đổi này, nhưng KHÔNG merge vào `main`/KHÔNG deploy production cho tới cửa sổ Phase 6** — giữ trong nhánh `rebrand/phase-5-content-engine` hoặc tách thành một commit riêng dễ cherry-pick sau. Nếu user chọn Phương án A, bỏ ràng buộc "không merge" này và gộp chung một lượt.

**D.6.** Cùng file, dòng 165: `displayName: 'DailyTechWire',` → `displayName: 'Opentechwire',` (đây là brand-name hiển thị trên social card, không phải domain literal — theo prose rule, không phải rule domain).

**D.7. (nhóm "giá trị domain").** Cùng file, dòng 166: `domain: 'dailytechwire.com',` → `domain: 'opentechwire.com',`. Cùng nhóm merge-timing với D.5.

**D.8. (nhóm "giá trị domain").** Cùng file, dòng 179: `kicker: 'DAILYTECHWIRE.COM',` → `kicker: 'OPENTECHWIRE.COM',`. Cùng nhóm merge-timing với D.5 (kicker hiển thị domain lên card, gắn liền ngữ nghĩa với D.7).

**D.9. (KHÔNG đổi, chỉ xác nhận).** Cùng file, dòng 89 (`id: 'dtw'`) và dòng 188 (`utmCampaign: 'dtw-social'`) — **giữ nguyên**, D11 đóng băng. Chỉ đọc để xác nhận EXECUTE không lỡ tay sửa nhầm khi đang sửa các dòng liền kề.

**D.10.** `admin/src/lib/brief-configs.ts`, dòng 51: `dtw: 'DailyTechWire',` (trong `SITE_NAMES`) → `dtw: 'Opentechwire',`.

**D.11. (nhóm "giá trị domain").** Cùng file, dòng 36: `siteBaseUrl: 'https://www.dailytechwire.com',` (trong `ENGINEER_CONFIG.dtw`) → `'https://www.opentechwire.com'`. Cùng nhóm merge-timing với D.5 — **đây là bản sao thứ hai của cùng field, phải đổi ĐỒNG THỜI với D.5, không đổi lệch pha** (comment ngay trong file, dòng 26-29, đã cảnh báo đúng điều này: "2 field NÀY... PHẢI khớp").

**D.12.** `src/social/prompts/social-rules.prompt.ts`, dòng 33-35 (rule 10 trong `SOCIAL_RULES_V1`): `"On BriefAsia / DailyTechWire / GlobalTravelPost captions: ..."` → `"On BriefAsia / Opentechwire / GlobalTravelPost captions: ..."`. Sau khi sửa, cân nhắc bump `SOCIAL_RULES_VERSION` (dòng 14, hiện `'v1.2026-08-19'`) — đây là quy ước có sẵn của file khi nội dung rule đổi (xem docblock dòng 12: *"Khi spec §2 đổi, sửa chuỗi này VÀ bump version comment"*); ĐÂY LÀ SỬA CHỮ BRAND, không phải sửa rule §2 thật, nên bump version là TUỲ CHỌN — quyết định theo đúng tinh thần convention của file (an toàn hơn nếu bump, vì bất kỳ log/audit nào theo dõi version sẽ thấy đúng nội dung đã đổi).

**D.13. (XÁC MINH, KHÔNG SỬA — phân giải chồng lấn 09-09-26).** `src/lib/publications/dtw/index.ts` dòng 184-185 (`logoAssetUrl`) từng bị **cả Phase 3 (Bước 33) lẫn Phase 5 (bước này)** cùng nhận. Umbrella §6b.3 chốt **Phase 3 là chủ sở hữu duy nhất** — Phase 3 vừa upload object key mới vừa trỏ giá trị vào, trong một bước, để không tồn tại cửa sổ nào mà `logoAssetUrl` trỏ vào một key chưa có thật.

Việc của Phase 5 tại bước này rút gọn còn **xác minh**:
```bash
command grep -n "logoAssetUrl" src/lib/publications/dtw/index.ts
curl -sI "<URL đọc được ở lệnh trên>"     # kỳ vọng HTTP 200 + content-type: image/png
```
- Nếu URL đã trỏ `logos/otw-monogram.png` và trả 200: dán output vào report, xong.
- Nếu vẫn trỏ `logos/dtw-monogram.png`: **Phase 3 chưa chạy xong.** KHÔNG tự sửa ở đây — ghi `🚧 BLOCKED` cho riêng mục này, báo user, và tiếp tục các bước còn lại của Phase 5 bình thường (không bước nào khác phụ thuộc nó).

**D.14.** `admin/src/lib/social-configs.ts`, dòng 24: `dtw: 'DailyTechWire',` (trong `SOCIAL_SITE_NAMES`) → `dtw: 'Opentechwire',`. (Union key `dtw` ở dòng 9/13 giữ nguyên — D11.)

**D.15.** `admin/src/app/(authed)/briefs/settings/settings-card.tsx` — **hai** vị trí, không phải một (tài liệu tham chiếu §3.7 ghi `51, 347`; bản Phase 5 trước 09-09-26 chỉ nhận 347): dòng **51** và dòng **347**, cả hai đều là `placeholder="DTW Briefing Desk"` → `placeholder="OTW Briefing Desk"`. Phải khớp byte-for-byte với D.4/C.1. Verify: `command grep -n "Briefing Desk" "admin/src/app/(authed)/briefs/settings/settings-card.tsx"` — kỳ vọng 0 hit `DTW`, đúng 2 hit `OTW`.

**D.16.** `docs/WRITING_PIPELINE.md` — cập nhật đúng các dòng đã xác nhận khớp `origin/main`: dòng 10 (`[dtw](../src/lib/publications/dtw/index.ts)` — **giữ nguyên phần đường dẫn file** vì tên file/thư mục `dtw` bị đóng băng D11, chỉ sửa phần chữ hiển thị nếu có brand-name kèm theo — dòng này chỉ có link text `dtw` là tên định danh, KHÔNG sửa), dòng 23 (`(GCV/WAD/DTW)` → `(GCV/WAD/OTW)`), dòng 163 (`#### DTW — DailyTechWire (tech) —` → `#### OTW — Opentechwire (tech) —`, giữ nguyên phần link `dtw/index.ts`), dòng 166/168/171 (đồng bộ y hệt nội dung mới của D.2 ở trên — **copy chính xác từ file `.ts` sau khi sửa, không viết lại độc lập**), dòng 298 (`"văn GCV/WAD/DTW đạt chuẩn"` → `"văn GCV/WAD/OTW đạt chuẩn"`).

**D.17.** `docs/prompts-rewrite-current.md` — cập nhật đúng các dòng đã xác nhận trên `origin/main` hôm nay: dòng 1 (`3 web (GCV / WAD / DTW)` → `(GCV / WAD / OTW)`), dòng 16 (`§6 System prompt DTW` → `§6 System prompt OTW`, giữ nguyên phần link/biến `dtw/index.ts`/`DTW_VOICE_SPEC` — **tên biến TypeScript `DTW_VOICE_SPEC` KHÔNG đổi**, chỉ chữ hiển thị "System prompt DTW" đổi), dòng 116 (`(GCV, WAD, DTW, BriefAsia, WTB)` → `(GCV, WAD, OTW, BriefAsia, WTB)`), dòng 486 (`## 6. SYSTEM PROMPT — DTW (DailyTechWire) — ĐÃ GHÉP ĐẦY ĐỦ` → `## 6. SYSTEM PROMPT — OTW (Opentechwire) — ĐÃ GHÉP ĐẦY ĐỦ`), dòng 491/493/496/502 — **copy chính xác nội dung mới từ D.2**, không viết lại độc lập (mirror phải byte-khớp phần văn xuôi, chỉ khác việc đây là bản Markdown còn kia là template literal TypeScript). Dòng 488 (danh sách 10 byline) — không đổi, không phải brand token.

**D.18 (tuỳ chọn, LOW, vệ sinh).** `admin/src/lib/brief-payload.ts`, dòng 62 (`/** vd 'DTW Briefing Desk'. */`), dòng 64 (`/** ... Vd 'DailyTechWire'. */`), dòng 66 (`/** ... vd 'https://www.dailytechwire.com'. */`) — đây là comment JSDoc minh hoạ, không ảnh hưởng hành vi. Cập nhật cho khớp giá trị mới nếu tiện, không bắt buộc để coi phase là xong.

### Nhóm D2 — Bề mặt `content-engine` không phase nào nhận (BỔ SUNG 09-09-26 sau soát nhất quán)

Soát chéo 9 plan với §3.7 tài liệu tham chiếu phát hiện các mục dưới đây **rơi ra ngoài cả 8 phase**. Nay Phase 5 là chủ sở hữu (umbrella §6b.1). Tất cả đều LOW/MED, thuần chữ, không chạm định danh đóng băng.

**D2.1 — Template env của `content-engine/admin/.env.example`:**
- dòng **23**: `DTW_INTAKE_URL=https://dailytechwire.com` → `DTW_INTAKE_URL=https://www.opentechwire.com`. **Tên biến giữ nguyên** (đóng băng, umbrella §5.2) — chỉ giá trị ví dụ đổi, và **sửa luôn bug apex có sẵn từ trước** bằng cách thêm `www.` theo D5. Lưu ý: đây là **template**; **giá trị production trên Vercel vẫn flip ở Phase 6 bước 5** — hai việc khác nhau, đừng nhầm là đã xong cutover.
- dòng **135-137**: comment `# Facebook Page — DailyTechWire` → `# Facebook Page — Opentechwire`. **Tên biến `FB_PAGE_ID_DTW`/`FB_PAGE_TOKEN_DTW`/`LI_ORG_URN_DTW` KHÔNG đổi** (suy ra từ slug bằng `toUpperCase()`, D11).

**D2.2 — Tài liệu vận hành của `content-engine` mà Phase 5 gốc chỉ nhận 2/7 file.** Ngoài `docs/WRITING_PIPELINE.md` (D.16) và `docs/prompts-rewrite-current.md` (D.17), tài liệu tham chiếu §3.7 còn liệt 5 file nữa mang brand:
`deploy/DEPLOY.md`, `docs/CODEBASE.md`, `docs/HANDOVER.md`, `README.md`, `ContentEngine-Wire.md`.
Đổi tên brand trong văn xuôi theo umbrella §5.1.1 (`DTW` trong câu → `Opentechwire`; `DTW <Token>` → `OTW <Token>`). **KHÔNG đổi**: mọi đường dẫn file/thư mục `dtw/`, tên biến, tên env, slug `dtw` trong ví dụ lệnh. Trước khi sửa, chạy `command grep -n "DailyTechWire\|Dailytechwire\|\bDTW\b" <file>` để lấy danh sách thật (số dòng trong tài liệu tham chiếu là của 08-09-26, đã có thể trôi).

**D2.3 — Xoá 3 script chẩn đoán tạm (chi phí bằng 0, bỏ được ~60 hit):**
```bash
git rm scripts/_diag-dtw-dow.ts scripts/_diag-dtw-drop.ts scripts/_diag-dtw-history.ts
```
Cả ba tự khai trong docblock là `TEMP … Xoá sau`. Trước khi xoá, xác nhận không ai import chúng:
```bash
command grep -rn "_diag-dtw" --include='*.ts' --include='*.json' --include='*.yml' . --exclude-dir=node_modules
```
Kỳ vọng: chỉ khớp chính 3 tên file (không có import, không có script entry trong `package.json`, không có workflow nào gọi). Nếu có bất kỳ consumer nào → **không xoá**, chỉ đổi chữ trong đó và ghi vào report.

**D2.4 — `scripts/social-manual-post.ts`** (dòng 17, 20-21, 63, 66-67, 137, 188): các chuỗi **hiển thị** đổi theo §5.1.1. **KHÔNG đổi**: Facebook Page ID dạng số `1187507051122718` (ID số sống sót qua đợt đổi tên) và đường dẫn `$HOME/fb-page-tokens-dtw.json` (tên file token cục bộ, coi như định danh đóng băng — đổi là hỏng máy dev đang chạy).

**D2.5 — JSDoc header của `src/editorial/prompts/{style-rules,rewrite,classify,daily-brief}.prompt.ts`** (dòng 2/7; 23/29; 16/44; 23): brand chỉ nằm trong **header JSDoc**, đã được tài liệu tham chiếu xác minh là **không chạy lúc generate** (thân prompt phát ra không mang brand — brand chỉ tới model qua `pub.voiceSpec`). Đổi cho khớp, LOW, không có rủi ro hành vi. Ghi rõ trong report rằng đây là comment, để người review không tưởng là đã đụng vào prompt đang chạy.

**D2.6 — `content-engine/process/context/{all-context,infra/all-infra,uxui/all-uxui,database/all-database,tests/all-tests}.md`** (18 / 14 / 5 / 2 / 1 chỗ). Đây là **router context mà agent của repo đó đọc TRƯỚC KHI sửa** — cùng lớp rủi ro với Nhóm 9 của Phase 0 trong `dtw-web`: cũ = rebrand bị revert bởi chính agent tuân thủ quy trình. Hai điểm bắt buộc:
- `infra/all-infra.md:118` ghi intake URL đang chạy là **apex** — sửa thành `https://www.opentechwire.com` cho khớp D5 **và** khớp giá trị D2.1 ở trên.
- `all-context.md:216` nhắc tới một **org GitHub tên `dailytechwire`** — xác minh org đó có thật không trước khi sửa; nếu là ghi nhầm, sửa thành `hieuhn09` và ghi chú lại.
Giữ nguyên mọi tên repo/thư mục (`content-engine`, `dtw/`), mọi slug `dtw`, mọi tên env.

**Verify Nhóm D2:**
```bash
cd /home/hieunc/Code/content-engine
command grep -n "DailyTechWire\|Dailytechwire" admin/.env.example deploy/DEPLOY.md docs/CODEBASE.md docs/HANDOVER.md README.md ContentEngine-Wire.md scripts/social-manual-post.ts src/editorial/prompts/*.prompt.ts process/context/all-context.md process/context/infra/all-infra.md process/context/uxui/all-uxui.md process/context/database/all-database.md process/context/tests/all-tests.md
# kỳ vọng: 0 hit
ls scripts/_diag-dtw-* 2>&1   # kỳ vọng: "No such file or directory"
command grep -rn "dailytechwire.com" admin/.env.example process/context/
# kỳ vọng: 0 hit (đặc biệt infra/all-infra.md:118 phải là www.opentechwire.com)
```

### Nhóm E — Hai UPDATE trên Engine Supabase (SAU khi Nhóm C xong, SAU khi Nhóm D code đã sẵn sàng)

**E.1.** `UPDATE publications SET name='Opentechwire' WHERE slug='dtw';` — chạy qua Supabase SQL Editor (thủ công) hoặc script dùng service-role key. **Đừng sửa migration `001_initial.sql` đã apply** (D11/file cấm động, dù dòng đó không phải brand-slug mà là seed value `name`, best-practice migration vẫn là không sửa file đã apply — ghi UPDATE riêng).

**E.2.** Đổi `brief_configs.byline` — ưu tiên đường AN TOÀN HƠN: qua UI `/briefs/settings` (`admin/src/app/(authed)/briefs/settings/settings-card.tsx`, input đã có ở D.15) nếu route đó khả dụng và đăng nhập được — sửa qua form UI đi đúng code path ứng dụng, không bypass validation. Nếu không đăng nhập được vào `/briefs/settings` từ môi trường EXECUTE, dùng UPDATE trực tiếp: `UPDATE brief_configs SET byline='OTW Briefing Desk' WHERE publication_id=(SELECT id FROM publications WHERE slug='dtw');` — **giá trị PHẢI khớp byte-for-byte với D.4/C.1**.

**E.3.** Audit lại y hệt B.2 để xác nhận cả hai UPDATE đã ghi đúng giá trị. Dán kết quả vào report.

### Nhóm F — D13: dọn nội dung đã publish (hai lỗi KHÁC NHAU, đừng gộp làm một)

**F.1 — Lỗi #1: sign-off cuối mỗi Daily Brief (`_Compiled by {byline} from {siteName} reporting._`, `admin/src/lib/brief-payload.ts:243`, unconditional — MỌI brief đã publish đều có dòng này).**
   - Trước tiên xác nhận số lượng thật từ B.3.
   - Nếu số lượng > 0: viết một script one-off theo đúng khuôn `apcg-cms/scripts/migrate/fix-gcv-nbsp-bodies.ts` (walk Lexical `body` tìm node `type: "text"` cuối cùng dưới `root.children` mà nội dung khớp regex `/_Compiled by .* from .* reporting\._/`, thay bằng `` `_Compiled by OTW Briefing Desk from Opentechwire reporting._` ``, giữ nguyên mọi node khác), scope theo `tenant.slug === 'dtw'` và `contentType === 'daily-brief'`, có cờ `--dry-run` in ra danh sách id sẽ đổi TRƯỚC KHI ghi thật, idempotent (bỏ qua bài đã khớp sign-off mới). Chạy trên **cả `articles` (published) lẫn `_articles_v`/draft nếu Payload version-history collection đó tồn tại** — thứ tự: published trước, draft sau (theo đúng nguyên tắc §4.2 tài liệu tham chiếu).
   - Đây là sửa MỘT dòng cố định cuối `body`, không phải rewrite nội dung brief — không vi phạm D13 (D13 cấm rewrite bài có byline nhà báo; dòng sign-off là credit-line máy sinh, không phải câu chuyện do nhà báo viết).

**F.2 — Lỗi #2: câu ví dụ "At DailyTechWire, we've tracked..." rò rỉ từ `DTW_VOICE_SPEC` vào `dek`/`excerpt` của các bài THƯỜNG (không phải brief).**

> **Ranh giới D13 — đọc trước khi chạm bất kỳ row nào.** D13 nói: *"CHỈ sửa brief do máy soạn. KHÔNG đụng bài có byline nhà báo."* F.1 nằm gọn trong ranh giới đó. **F.2 thì nằm ngay trên vạch**: nó sửa `dek` của các bài THƯỜNG. Lý do vẫn hợp lệ: 100% bài `dtw` mang byline lấy từ `DTW_BYLINES` — **10 bút danh tổng hợp do máy gán**, không phải nhà báo có thật, và câu bị sửa là một mẫu câu do system prompt đúc ra chứ không phải câu do người viết. Nhưng vì đây là chỗ hẹp nhất giữa "được phép" và "vi phạm ledger", **gate ở cuối bước này là bắt buộc, không phải khuyến nghị**: nếu audit thật lộ ra một byline KHÔNG nằm trong `DTW_BYLINES`, DỪNG và hỏi user cho riêng ID đó. Không có ngoại lệ, không có "chắc là cũng máy soạn thôi".
   - Chạy audit MỚI ngay bây giờ (đừng tin danh sách 5 ID từ CSV export 2026-08-03 là đầy đủ — đó là ảnh chụp một tháng trước): `SELECT id, title FROM articles_locales WHERE _parent_id IN (SELECT id FROM articles WHERE tenant_id=(SELECT id FROM tenants WHERE slug='dtw')) AND (dek ILIKE '%dailytechwire%' OR dek ILIKE '%at dtw%')` trên Central (qua script Payload Local API kiểu B.1, field `dek` là `textarea` thuần — KHÔNG cần walk Lexical cho field này).
   - **Lưu ý quan trọng đã xác minh (09-09-26) qua `data-exports/articles_images.csv`**: trong 5 ID xác nhận ở bản snapshot 08-03, chỉ **2 ID** (`26aa947f-a8bb-4aa5-a02f-e98b17fdaea2`, `7c11bda8-3830-4ba1-b46c-ff03a644704d`) có câu rò rỉ nằm trong field **`dek`** — field DUY NHẤT được intake gửi lên Central (`apcg-cms/src/app/api/engine/intake/route.ts:135`, chỉ đọc `body.dek`, không đọc `body.excerpt`). **3 ID còn lại** (`0adab0f5-...`, `305811eb-...`, `480e0ebc-...`) có câu rò rỉ nằm trong field **`excerpt`** của bảng `articles` **bên content-engine's Supabase riêng** (không phải Central) — field này KHÔNG được forward lên Central, nghĩa là **không hiển thị cho độc giả trên site thật**, chỉ tồn tại trong kho dữ liệu nội bộ của engine. Vì vậy:
     - Ưu tiên CAO: sửa `dek` của 2 ID trên Central (reader-facing) — lấy giá trị `dek` HIỆN TẠI qua Payload (đừng dùng giá trị cũ từ CSV làm nguồn ghi, chỉ dùng CSV để xác định ID cần tra lại — editor có thể đã sửa tay từ đó tới giờ), thay thế cơ học `"DailyTechWire"` → `"Opentechwire"` trong chuỗi `dek` hiện tại (mức tối thiểu an toàn để không còn brand cũ hiển thị công khai; việc viết lại toàn bộ câu cho bớt gượng — vd bỏ hẳn lối tự xưng "At Opentechwire, we..." — là một quyết định biên tập tuỳ chọn, KHÔNG bắt buộc để coi bước này là xong).
     - Ưu tiên THẤP (dọn dữ liệu nội bộ, không reader-facing): sửa `excerpt` của cả 5 ID (nếu vẫn còn brand cũ khi audit lại) trực tiếp trên bảng `articles` của content-engine's Supabase — dùng UPDATE hoặc script tương tự B.2, KHÔNG cần qua Payload Local API vì đây không phải dữ liệu CMS của Central.
   - Chạy lại audit (cả `dek` trên Central và `excerpt` trên Engine Supabase) sau khi sửa để xác nhận 0 hit còn lại, ngoại trừ các ID có byline nhà báo thật đã bị loại (không có trường hợp nào trong 5 ID này — cả 5 đều thuộc site `dtw`, không có cột byline trong export để xác nhận trực tiếp; **nếu audit thật lộ ra một trong các ID này có byline không nằm trong `DTW_BYLINES` (10 tên tại `src/lib/publications/dtw/index.ts:30-41`), DỪNG lại và hỏi user trước khi sửa `dek` của ID đó** — đó có thể là bài có byline nhà báo thật, ngoài phạm vi D13).

### Nhóm G — Test + audit lại toàn bộ

**G.1.** `cd /home/hieunc/Code/content-engine && npm test` (= `vitest run`) — kỳ vọng **FAIL** ở đúng 3 file test đã biết hardcode domain cũ (`src/lib/publications/__tests__/brief-config.test.ts`, `src/social/__tests__/select.test.ts`, `src/editorial/__tests__/brief-web-articles-client.test.ts`) **CHỈ KHI** Nhóm D đã đổi `siteBaseUrl`/`domain` (tức là chỉ khi Phương án A được chọn, hoặc khi tới đúng cửa sổ merge của nhóm "giá trị domain" ở Phương án B). Nếu đang ở Phương án B và CHƯA merge nhóm "giá trị domain", các test này vẫn PASS với domain cũ — đó là kỳ vọng đúng, không phải lỗi.

**G.2.** Khi/nếu nhóm "giá trị domain" được merge (dù ở Phương án A ngay bây giờ, hay ở Phương án B vào đúng cửa sổ Phase 6): cập nhật cả 3 file test trên, thay `https://www.dailytechwire.com` → `https://www.opentechwire.com` ở đúng các dòng đã xác nhận (`brief-config.test.ts:29,67`; `select.test.ts:53,117`; `brief-web-articles-client.test.ts:22`), chạy lại `npm test` — kỳ vọng xanh 100%.

**G.3.** `npm run typecheck` (= `tsc --noEmit`) tại root `content-engine` — sạch. Không có thay đổi type nào trong phase này (chỉ đổi string literal), nên kỳ vọng không có lỗi type mới.

**G.4.** Grep xác nhận không còn "DailyTechWire" ở các vị trí ĐÃ SỬA (không phải toàn repo, vì slug `dtw` đóng băng sẽ luôn còn rất nhiều hit hợp lệ):
   ```
   command grep -n "DailyTechWire" src/lib/publications/dtw/index.ts admin/src/lib/brief-configs.ts \
     src/social/prompts/social-rules.prompt.ts admin/src/lib/social-configs.ts \
     "admin/src/app/(authed)/briefs/settings/settings-card.tsx" docs/WRITING_PIPELINE.md docs/prompts-rewrite-current.md
   ```
   Kỳ vọng: 0 hit (trừ khi nhóm "giá trị domain" chưa merge và một trong các file trên còn dòng comment cũ liên quan — đối chiếu thủ công với danh sách D.1-D.17 để chắc mọi hit còn lại là CHỦ Ý, ví dụ D.9 giữ nguyên `id: 'dtw'`/`utmCampaign`).

---

## Touchpoints

**File sửa trong `content-engine`** (đường dẫn tuyệt đối gốc `/home/hieunc/Code/content-engine/`):
- `src/lib/publications/dtw/index.ts`
- `admin/src/lib/brief-configs.ts`
- `src/social/prompts/social-rules.prompt.ts`
- `admin/src/lib/social-configs.ts`
- `admin/src/app/(authed)/briefs/settings/settings-card.tsx`
- `docs/WRITING_PIPELINE.md`
- `docs/prompts-rewrite-current.md`
- `admin/src/lib/brief-payload.ts` (tuỳ chọn, comment JSDoc — D.18)
- **Nhóm D2 (bổ sung 09-09-26)**: `admin/.env.example` · `deploy/DEPLOY.md` · `docs/CODEBASE.md` · `docs/HANDOVER.md` · `README.md` · `ContentEngine-Wire.md` · `scripts/social-manual-post.ts` · `src/editorial/prompts/{style-rules,rewrite,classify,daily-brief}.prompt.ts` · `process/context/{all-context,infra/all-infra,uxui/all-uxui,database/all-database,tests/all-tests}.md`
- **Nhóm D2 — XOÁ**: `scripts/_diag-dtw-dow.ts`, `scripts/_diag-dtw-drop.ts`, `scripts/_diag-dtw-history.ts`
- `src/lib/publications/__tests__/brief-config.test.ts`, `src/social/__tests__/select.test.ts`, `src/editorial/__tests__/brief-web-articles-client.test.ts` (chỉ khi nhóm "giá trị domain" merge)

**File/script tạo MỚI, tạm thời, dùng một lần** (không phải deliverable lâu dài, xoá sau khi chạy xong hoặc để lại trong `scripts/` nếu EXECUTE thấy đáng giữ làm tiện ích tái sử dụng):
- Một script audit read-only cho Central `authors` (kiểu B.1)
- Một script/SQL audit cho Engine Supabase (kiểu B.2)
- Một script remediation sign-off Lexical (kiểu F.1, mirror `fix-gcv-nbsp-bodies.ts`)
- Một script/SQL audit + fix cho `dek`/`excerpt` (kiểu F.2)

**Dữ liệu sống bị thay đổi** (KHÔNG phải file trong repo):
- Central Postgres: `authors.name` (+`authors.role` có điều kiện) cho đúng 1 row; `articles_locales.dek` cho đúng 2 ID (hoặc nhiều hơn nếu audit F.2 tìm thêm); `articles`/`_articles_v` `body` Lexical cho N Daily Brief (N từ B.3).
- Engine Supabase Postgres: `publications.name` 1 row; `brief_configs.byline` 1 row; `articles.excerpt` cho tối đa 5 ID (hoặc nhiều hơn nếu audit F.2 tìm thêm).

**KHÔNG sửa** (đã liệt kê ở "KHÔNG thuộc phase này" và danh sách đóng băng umbrella §5.2/§5.3): `admin/.env.example` (`DTW_INTAKE_URL`), `admin/src/lib/dtw-intake-client.ts`, `admin/src/lib/publish-dtw.ts` (guard), `admin/src/lib/publish-social.ts` (`envSuffix`), `admin/src/lib/publish-caps.ts`, `admin/src/lib/byline-policy.ts` (key `dtw:`), `src/lib/publications/registry.ts`, `config/sources.yaml`, `.github/workflows/*.yml`, `src/editorial/image-uploader.ts` (storage prefix), toàn bộ `supabase/migrations/**`.

---

## Public Contracts

- **Intake wire contract Engine → Central** (`publicationId: 'dtw'` trong body POST): **không đổi** — D11. Phase này không chạm `dtw-intake-client.ts`.
- **`resolveOrCreateAuthor` theo `name` khớp tuyệt đối** (`apcg-cms/src/app/api/engine/intake/route.ts:481-494`): Phase này PHỤ THUỘC vào hợp đồng này để quyết định thứ tự Nhóm C→D (xem "Thứ tự bắt buộc"). Không sửa hàm này, chỉ tuân theo hành vi đã có.
- **`brief_configs.byline` là nguồn sự thật runtime, code là fallback** (comment tại `admin/src/lib/brief-configs.ts` không nói rõ, nhưng hành vi xác nhận qua `dtw/index.ts:148` docblock "chỉ là fallback"): Phase này giữ nguyên hợp đồng, chỉ đồng bộ cả hai giá trị.
- **`envSuffix()` suy biến tên env FB/LI từ slug bằng `toUpperCase()`** (`publish-social.ts:59-61`): Phase này KHÔNG đổi slug nên hợp đồng này không bị chạm — nêu lại ở đây để nhắc EXECUTE đừng vô tình đổi `id: 'dtw'` khi đang sửa các dòng liền kề trong cùng file.
- **`SOCIAL_RULES_VERSION` là version comment tay, không có kiểm tra tự động khớp nội dung** (`social-rules.prompt.ts:14`): Phase này có thể bump version (D.12) nhưng không bắt buộc — không có test nào phụ thuộc giá trị này.

---

## Blast Radius

- **Cô lập cao, an toàn**: `social-rules.prompt.ts`, `social-configs.ts` display name, `settings-card.tsx` placeholder, 2 file doc mirror — không có logic nào đọc các chuỗi này để rẽ nhánh hành vi, chỉ là văn bản hiển thị/tài liệu.
- **Cần cẩn trọng — giá trị đọc bởi logic khác**: `siteBaseUrl`/`domain`/`kicker` (dùng để dựng URL/card thật — xem "Quyết định kỹ thuật"); `byline` (dùng làm khoá tra cứu author — xem "Thứ tự bắt buộc").
- **Chạm dữ liệu sống dùng chung**: mọi UPDATE ở Nhóm C/E/F chạm Postgres **sản xuất** (Central Neon DB dùng chung với các tenant APCG khác qua `dtw_auth`/schema chung — nhưng các bảng `authors`/`articles_locales` bị chạm ở đây được SCOPE theo `tenant_id`/`_parent_id` cụ thể của `dtw`, không lan sang tenant khác nếu WHERE clause đúng — **kiểm tra kỹ WHERE clause trước khi chạy UPDATE thật, không chạy UPDATE không có điều kiện tenant**).
- **Không chạm**: mọi migration đã apply (`supabase/migrations/**`, `packages/db/migrations/**`), mọi identifier đóng băng D11/D12, `dtw-web` (repo khác, không file nào trong phase này nằm trong `dtw-web`).

---

## Verification Evidence

Chạy và dán output thật vào report cho từng mục:

1. Output đầy đủ của chuỗi lệnh git ở "Tiền đề bắt buộc" (bước A.1) — xác nhận trạng thái worktree tại đúng thời điểm EXECUTE.
2. Output audit B.1 (Central authors, trước và sau rename), B.2 (3 câu SELECT Engine Supabase, trước và sau UPDATE), B.3 (đếm brief đã publish).
2b. Output đầy đủ của khối "Verify Nhóm D2" (3 lệnh), gồm cả `ls scripts/_diag-dtw-*`.
3. `npm test` output đầy đủ trong `content-engine` — cả trước (G.1, kỳ vọng pass hoặc fail đúng như mô tả tuỳ phương án) và sau khi cập nhật fixture (G.2, kỳ vọng xanh 100%).
4. `npm run typecheck` output — sạch.
5. `command grep -n "DailyTechWire"` theo đúng danh sách file ở G.4 — 0 hit ngoài các chỗ chủ ý giữ nguyên.
6. Output audit F.1 (số brief đã sửa sign-off, danh sách id) và F.2 (số dek/excerpt đã sửa, danh sách id, đối chiếu byline của từng id để xác nhận không phải bài có byline nhà báo thật).
7. Diff cụ thể (không chỉ "đã sửa") của cả 3 file test ở G.2 nếu nhóm "giá trị domain" đã merge trong phase này.
8. Xác nhận bằng văn bản trong report: phương án A hay B đã được chọn cho nhóm "giá trị domain", và nếu B, trạng thái merge của nhánh/PR đó (đã tạo PR nhưng chưa merge — kèm link/tên nhánh).

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| **Cửa sổ link-chết nếu nhóm "giá trị domain" lên production trước khi `dtw-web` serve domain mới** (Phase 6 chưa cutover) | Phương án B (mặc định của plan này): giữ nhóm "giá trị domain" ở nhánh/PR riêng, không merge tới cửa sổ Phase 6. Nếu chọn Phương án A: chấp nhận rủi ro có ý thức, cân nhắc tạm dừng cron `brief:once`/`social:once` trong đúng cửa sổ (thao tác thủ công, ngoài phạm vi code của phase này) |
| **Tách đôi lịch sử Author** nếu byline generate-time đổi trước khi Central author được rename | "Thứ tự bắt buộc" ở trên bắt buộc Nhóm C chạy trước Nhóm D.4/Nhóm E.2; C.2 có bước dừng-và-hỏi nếu audit phát hiện dấu hiệu đã tách trước đó |
| **`role` của Author bị giả định sai** (đoán "Dailytechwire Newsroom" trong khi thực tế có thể là "Staff Writer" mặc định) | C.1 yêu cầu đọc thật giá trị `role` qua B.1 trước khi quyết định có sửa `role` hay không — không giả định |
| **D13 bị hiểu nhầm là "chỉ 5 dòng"** dẫn tới bỏ sót toàn bộ khối lượng sign-off Daily Brief (có thể là hàng chục row, chưa đếm) | B.3 bắt buộc đếm thật trước F.1; F.1/F.2 tách rõ thành hai lỗi khác nhau với hai cơ chế remediation khác nhau |
| **Sửa nhầm `excerpt` tưởng là field reader-facing** (thực tế field đó chỉ tồn tại nội bộ engine, không lên Central) | F.2 đã xác minh và ghi rõ field nào forward lên Central (`dek`) và field nào không (`excerpt`) qua đọc trực tiếp `apcg-cms/src/app/api/engine/intake/route.ts:135` |
| **Đổi `dek`/`body` của một bài hoá ra có byline nhà báo thật** (vi phạm D13) | F.2 yêu cầu đối chiếu byline của từng ID với `DTW_BYLINES` trước khi sửa `dek`; nếu byline lạ, dừng và hỏi user |
| **Regex thay sign-off khớp nhầm một đoạn văn khác trong `body`** (không phải dòng sign-off thật) | Script mirror `fix-gcv-nbsp-bodies.ts` phải có `--dry-run` in danh sách trước khi ghi thật; regex phải neo vào format cố định `_Compiled by ... from ... reporting._` (dấu gạch dưới Markdown emphasis + cấu trúc câu cố định), không match tự do |
| **Chạy UPDATE thiếu điều kiện tenant, ảnh hưởng tenant khác trên Central DB dùng chung** | Mọi câu UPDATE/audit trong plan này đều có `tenant_id=(SELECT id FROM tenants WHERE slug='dtw')` hoặc tương đương — kiểm tra WHERE clause trước khi chạy thật, không chạy UPDATE không điều kiện |
| **Worktree báo "đã merge" hôm nay nhưng bị revert/force-push trước khi EXECUTE thật sự chạy** | A.1 bắt buộc chạy LẠI đúng chuỗi lệnh git tại thời điểm EXECUTE, không tin kết luận đã ghi sẵn trong plan |

---

## Rollback

- **Nhóm D (code)**: thuần git — `git revert`/`git checkout` nhánh `rebrand/phase-5-content-engine` nếu cần bỏ toàn bộ; mỗi commit nên tách theo Nhóm (D.1-D.4 brand-name, D.5/D.7/D.8/D.11 domain-value riêng, D.10/D.12/D.14/D.15/D.16/D.17 riêng) để có thể revert từng phần mà không mất phần còn lại.
- **Nhóm C (rename Central author)**: **bán-one-way** — kỹ thuật có thể `payload.update` ngược lại `name`/`role` về giá trị cũ (đã ghi lại ở B.1 trước khi đổi), nhưng bất kỳ intake POST nào xảy ra TRONG khoảng thời gian đã đổi mà chưa rollback sẽ tạo ra author mới theo tên MỚI — rollback không tự động dọn author đó, cần xử lý tay nếu xảy ra.
- **Nhóm E (2 UPDATE Engine Supabase)**: reversible bằng UPDATE ngược lại giá trị cũ đã ghi ở B.2 — **PHẢI backup giá trị cũ trước khi UPDATE** (đã có sẵn từ output audit B.2, không cần backup riêng).
- **Nhóm F (remediation nội dung đã publish)**: **bán-one-way** — script có `--dry-run` giảm rủi ro, nhưng sau khi ghi thật, rollback nghĩa là ghi lại giá trị `dek`/`body`/`excerpt` CŨ đã lưu (bắt buộc log giá trị cũ của từng ID vào report/file log TRƯỚC khi ghi mới, để có thể khôi phục nguyên văn nếu cần).
- **Nhóm G (test fixture)**: thuần git, reversible.

---

## Resume and Execution Handoff

Một EXECUTE session (kể cả session bị gián đoạn giữa chừng) nên đọc theo đúng thứ tự:

1. Plan này (toàn bộ).
2. Umbrella plan (`rebrand-opentechwire-umbrella_PLAN_08-09-26.md`) — ledger D1-D15, đặc biệt D11/D12/D13.
3. Chạy lại "Tiền đề bắt buộc" (A.1) — KHÔNG tin kết luận merge đã ghi sẵn trong plan này nếu đã qua nhiều ngày.
4. `git status`/`git log` trên CẢ HAI repo (`content-engine` và `apcg-cms`) để biết đã làm tới đâu — nếu nhánh `rebrand/phase-5-content-engine` đã tồn tại với một số commit, đối chiếu commit message với các Nhóm A-G ở trên để biết resume từ đâu, KHÔNG chạy lại UPDATE DB đã chạy (không phải mọi bước đều idempotent — Nhóm C/E/F cần kiểm tra trạng thái hiện tại trước khi chạy lại, không blind re-run).
5. Nếu chưa rõ trạng thái Nhóm C/E/F đã chạy hay chưa: chạy lại audit (B.1/B.2/F.2 SELECT) trước, KHÔNG chạy UPDATE mù.
6. Làm theo đúng "Thứ tự bắt buộc" — không đảo Nhóm C và Nhóm D.4/E.2.
7. Nếu Phase 3 (brand mark) đã có report với URL Storage mới, điền vào D.13 và bỏ đánh dấu `🚧 BLOCKED` cho đúng bước đó.

---

## Acceptance Criteria

- [ ] `git status`/`git log` xác nhận worktree `content-engine-kpi-gd1-publish-caps` đã merge (hoặc được merge trong phase này nếu chưa) TRƯỚC khi bất kỳ dòng nào ở Nhóm D được sửa.
- [ ] Central `authors` row cho tenant `dtw` có `name = 'OTW Briefing Desk'`, `id` không đổi so với trước rename (nếu có row để rename).
- [ ] `src/lib/publications/dtw/index.ts` sạch "DailyTechWire" ở mọi vị trí KHÔNG thuộc nhóm "giá trị domain" (nếu Phương án B chưa merge nhóm domain) hoặc sạch hoàn toàn (nếu Phương án A hoặc đã tới cửa sổ Phase 6).
- [ ] `admin/src/lib/brief-configs.ts` (`SITE_NAMES.dtw`), `social-rules.prompt.ts` (rule 10), `social-configs.ts` (`SOCIAL_SITE_NAMES.dtw`) đều là `'Opentechwire'`.
- [ ] `byline` code (`dtw/index.ts:148`) và `brief_configs.byline` (Engine Supabase) khớp byte-for-byte với `authors.name` mới trên Central.
- [ ] `publications.name` (Engine Supabase) = `'Opentechwire'`.
- [ ] Mọi Daily Brief đã publish (đếm ở B.3) có sign-off cuối bài dùng byline/siteName MỚI — xác nhận bằng audit lại, không phải suy luận.
- [ ] 2 ID Central có `dek` chứa "DailyTechWire" đã được sửa; audit lại xác nhận 0 hit mới trên `dek` (trừ khi phát hiện thêm ID mới qua audit rộng hơn, khi đó xử lý tương tự).
- [ ] `npm test` xanh 100% trong `content-engine` (sau khi fixture đã cập nhật đúng thời điểm nhóm domain merge).
- [ ] `npm run typecheck` sạch.
- [ ] Không có commit nào trong phase này chạm vào slug `dtw`, schema `dtw_auth`, hoặc bất kỳ file nào trong danh sách "CẤM ĐỘNG" ở umbrella §5.3 — xác nhận bằng `git diff --stat` của toàn bộ nhánh Phase 5 đối chiếu thủ công với danh sách đó.
- [ ] Quyết định Phương án A/B cho nhóm "giá trị domain" đã được ghi rõ bằng văn bản trong report, kèm trạng thái merge hiện tại của nhóm đó.
- [ ] **Nhóm D2**: lệnh verify ở cuối Nhóm D2 trả 0 hit trên cả 14 file; `ls scripts/_diag-dtw-*` báo "No such file or directory"; `admin/.env.example:23` và `process/context/infra/all-infra.md:118` cùng ghi `https://www.opentechwire.com` (có `www`, khớp D5) — hai chỗ này lệch nhau là một lỗi thật, không phải khác biệt vô hại.
- [ ] **D.13 (logoAssetUrl)**: report chứa output `curl -sI` thật cho URL đọc được từ `dtw/index.ts` — không tự sửa giá trị đó ở Phase 5 (Phase 3 là chủ sở hữu, umbrella §6b.3).
- [ ] **D.15**: `command grep -n "Briefing Desk" "admin/src/app/(authed)/briefs/settings/settings-card.tsx"` trả đúng 2 dòng, cả hai là `OTW Briefing Desk` (bản Phase 5 cũ chỉ sửa 1/2 chỗ).

---

## Cursor + RIPER-5 Guidance

- **Cursor Plan mode**: import Implementation Checklist theo đúng thứ tự Nhóm A→G; sau mỗi Nhóm, cập nhật trạng thái và chạy lại phần Verification Evidence liên quan trước khi sang Nhóm kế.
- **RIPER-5**: Plan này được tạo trong PLAN mode, là MỘT phase trong phase program `rebrand`. Theo `process/development-protocols/phase-programs.md`, trước khi EXECUTE, cần một lượt RESEARCH ngắn tại đúng thời điểm EXECUTE để tái xác nhận "Tiền đề bắt buộc" và "Đối chiếu số dòng" (codebase có thể đã trôi tiếp so với 09-09-26). Nói **"ENTER EXECUTE MODE"** cùng đường dẫn plan này (`process/features/rebrand/active/phase-5-content-engine_PLAN_08-09-26.md`) khi sẵn sàng — EXECUTE phải dừng lại và hỏi nếu bất kỳ giả định nào ở "Đối chiếu số dòng"/"Tiền đề bắt buộc" hoá ra sai tại thời điểm chạy thật, thay vì tự ý ứng biến tiếp.
- Sau khi Phase 5 đạt `✅ VERIFIED` (đúng theo Phase Completion Rules — cần user xác nhận bằng chứng), quay lại umbrella để chọn phase kế tiếp — theo bảng dependency của umbrella, Phase 5 chặn Phase 6 (CUTOVER); Phase 6 còn cần Phase 1/2/3/4 cũng đã xong.
