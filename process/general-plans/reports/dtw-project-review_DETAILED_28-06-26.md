# DTW — Báo cáo Review Dự án Chi tiết & Lộ trình Phát triển

**Ngày:** 2026-06-28
**HEAD đã review:** `e045ac7` (nhánh `main`)
**Tác giả:** review dự án đa-agent (workflow `dtw-stability-review` — 7 auditor chạy song song → tổng hợp → phản biện đối kháng → chốt) + orchestrator tự verify lại
**Mục tiêu (theo lời người dùng):** *"web chạy ổn định đầy đủ tính năng"* — một site **ổn định, đầy đủ tính năng**.
**Cập nhật cho:** `human-ops-launch_STATUS-HANDOFF_15-06-26.md` (vẫn đúng về bản chất; báo cáo này verify lại nó với 13 ngày commit mới — PR #13–#18).

> **Lưu ý bằng chứng:** mọi trích dẫn `file:line` dưới đây đều đúng trên `main` @ `e045ac7`, do một auditor đọc code tạo ra hoặc do orchestrator tự kiểm chứng. Code có thể di chuyển — verify lại trích dẫn trước khi hành động.

---

## 0. TL;DR (tóm tắt nhanh)

Dự án **build sạch, lõi editorial thật sự vững**, nhưng **chưa sẵn sàng launch cho một tờ báo** và **còn thiếu ~1/3 so với spec 86 dòng**.

- `pnpm typecheck` pass **3/3 package** (web + `@dtw/db` + `@dtw/ui`; `@dtw/config` không có target typecheck). Không có `typescript.ignoreBuildErrors` che lỗi. *(Orchestrator đã chạy lại — sạch trong ~3s.)*
- Vòng xuất bản Engine→Payload→reader, ISR/cache hooks, search Postgres, và phần **Latest-feed + pin-to-latest mới (PR #13–#18)** đều thật, defensive (fail-open khi thiếu cột), không thấy regression.
- **Nhưng 2 P0 blocker đã nêu ngày 2026-06-15 vẫn y nguyên** — vì team chọn ship Latest-feed thay vì làm cluster SEO được khuyến nghị:
  1. **SEO / discoverability = thiếu 100%** (không có sitemap / robots / RSS / JSON-LD / `metadataBase` / `generateMetadata` theo trang / `llms.txt`).
  2. **Error boundary = không có** (không `error.tsx` / `global-error.tsx` ở đâu cả) → bất kỳ lỗi nào không bắt được sẽ làm reader **màn hình trắng**.
- Cộng thêm một **cổng vận hành cứng** (không có runbook backup/restore Postgres; migration không snapshot trước), một **lỗi đúng-sai** (trang Corrections stale ≤5 phút), và **~9 surface "giả"** trông như thật nhưng backend không làm gì — rủi ro uy tín với một tờ báo "trust-first".

**Không có cái nào là mục ruỗng kiến trúc.** Tất cả là nợ việc-bị-hoãn + vài quyết định copy sản phẩm. Thứ tự fix là rẻ-trước (Phase 1 = mỗi việc vài giờ).

**Ghi chú độ tin cậy:** typecheck mình verify tươi (pass). *Production build* (`next build`) được 1 auditor xác nhận exit-0 lần này nhưng **chưa chạy lại**, và **chưa có test suite** (CI chỉ gate typecheck) — nên "regression-free" là suy luận có cơ sở từ đọc code, không phải một lần chạy test xanh.

---

## 1. Những gì ĐÃ XONG và vững (lõi chạy được)

| Khu vực | Trạng thái | Bằng chứng |
|---|---|---|
| **Vòng xuất bản** write→preview→publish→live | ✅ vững | render body Lexical trong `components/article/article-body.tsx`; filter `_status` published + `heroImage` trong `lib/payload-server.ts`; preview bản nháp qua `/preview` + `/exit-preview` (gated auth) |
| **CMS taxonomy** (Pillars/Authors/Tags) | ✅ phần lớn | nav header + Pillar Showcase trang chủ đọc từ CMS `Pillars` sắp theo `order`; pillar mới trong CMS tự render trang riêng không cần deploy. *(Đuôi còn thiếu: hằng số `PILLARS` tĩnh vẫn chi phối vài surface — xem §5 #8.)* |
| **Revalidation hooks** (ISR) | ✅ đã nối | `payload/hooks/revalidate.ts` bust `articles:all` / `pillars:all` / `wire-drops` khi ghi CMS; có guard `disableRevalidate` + try/catch. *(Thiếu: `corrections:all` không bao giờ bị bust — xem §2.)* |
| **Search** | ✅ thật | Postgres `LIKE` trên title/dek, chỉ published (`payload-server.ts` `searchArticles`); chạy cho `/search` + ⌘K overlay. Trung thực (đã bỏ claim giả "Meilisearch / 134ms"). |
| **Engine intake** (Phase 5) | ✅ đã merge | `app/api/engine/intake/route.ts` — POST, shared-bearer (so sánh constant-time), idempotent theo source URL, `origin:'engine'`. Tầng service-to-service đạt chất lượng launch. |
| **Latest feed + pin-to-latest** (PR #13–#18) | ✅ ổn định & defensive | `getPinnedLatest` try/catch fail-open về `null`; consumer null-check; migration `20260622` thêm `pinned_to_latest` vào **cả** `articles` và `_articles_v` với `DEFAULT false`; `migrate-prod.mjs` auto-apply khi `VERCEL_ENV=production`. **Không có rủi ro crash khi build hay khi render** trong code mới. |
| **Wire Drops** | ✅ hoãn trung thực | `getWireDrops` server-backed với ISR 30s (`payload-server.ts` `revalidate:30`); stream `setInterval` bịa đã bị bỏ đúng; không claim realtime. |
| **Deploy / CI nền** | ✅ chạy | Vercel (root = `apps/web`, function pin `sin1`), auto-migrate khi build prod, branch protection GitHub. *(Thiếu: CI chỉ gate typecheck.)* |
| **Invariant brand #7 / #11** | ✅ tuân thủ | `globals.css` terracotta `--accent #D4623C`, navy `--brand-navy #1B2A52`, 6 pillar đã re-tone; `components/wordmark.tsx` monogram navy + pulse-dot. |

---

## 2. ỔN ĐỊNH — phân tích sâu (mục tiêu số 1 của bạn: "chạy ổn định")

Build xanh, nhưng **runtime không có cơ chế chứa lỗi** và có vài lỗ hổng vận hành/đúng-sai. Xếp theo ROI:

### 2.1 — Không có error boundary *(P0, rẻ nhất, ROI cao nhất)*
- **Đã verify:** không có `error.tsx` / `global-error.tsx` ở bất kỳ đâu trong `apps/web` (chỉ có `app/not-found.tsx`).
- **Hệ quả:** bất kỳ lỗi nào trong RSC hay data fetch — Payload/Neon hiccup, một article lỗi, R2 image fail — sẽ đẩy reader sang **màn hình lỗi trơ không style của Next.js**, không recovery, không brand. Đây là lỗ hổng lớn nhất so với "chạy ổn định".
- **Fix:** `app/global-error.tsx` (crash gốc) + `app/(reader)/error.tsx` (recovery theo segment), component client nhỏ có brand + nút retry. **Effort: S.**

### 2.2 — Không có runbook backup/restore Postgres *(P0 cổng vận hành)*
- **Đã verify:** không có quy trình restore nào được ghi lại; `apps/web/scripts/migrate-prod.mjs` chạy DDL mà **không snapshot trước**.
- **Hệ quả:** toàn bộ kho bài viết cách một migration hỏng hoặc một `DELETE` là mất. Neon có PITR, nhưng bước retention/restore chưa được viết ra — khi sự cố không có quy trình nào để theo.
- **Vì sao là cổng cứng:** audit xếp đây là lỗ hổng *bị đánh giá thấp nhất*. Viết ra tốn ít công nhưng loại bỏ một failure mode thảm họa. Giữ làm **cổng Phase 1**, không phải "để sau khi có dữ liệu".
- **Fix:** viết runbook (cửa sổ PITR Neon + bước restore); thêm bước snapshot/confirm vào `migrate-prod.mjs`. **Effort: S.**

### 2.3 — Trang Corrections stale ≤5 phút *(P0 đúng-sai, trọng yếu về uy tín)*
- **Đã verify:** `payload/collections/Corrections.ts` **không có block `hooks`**; `payload/hooks/revalidate.ts` **không bao giờ bust** tag `corrections:all`; `getCorrections` cache 300s.
- **Hệ quả:** sửa một **nhật ký đính chính** công khai, nhạy cảm pháp lý, không invalidate cache — bản cũ phục vụ tới 5 phút. Với một tờ báo "trust-first" đây là khiếm khuyết về chính trực biên tập, không chỉ là chuyện cache.
- **Fix:** thêm hook `afterChange` / `afterDelete` → `revalidateTag('corrections:all')`, theo đúng pattern `bust()` đang có. **Effort: S.**

### 2.4 — Rủi ro config prod hẹp *(P0 verify)*
- Pillar `latest` là **seed-only** (không phải migration), và migration `20260622` chỉ auto-run khi `VERCEL_ENV=production`.
- `migrate-prod.mjs:~27` **cảnh báo và fallback sang URL pooled pgbouncer** nếu `DATABASE_DIRECT_URL` chưa set — và DDL qua pgbouncer có thể fail. Vậy `DATABASE_DIRECT_URL` được set trên Vercel là *điều kiện tiên quyết* để migration pin apply được.
- **Trên đường deploy prod chuẩn thì migration vẫn apply** — đây là rủi ro tồn dư, không phải bug đang xảy ra. Nhưng cần **verify trên Neon thật**: cột `pinned_to_latest` có mặt, pillar `latest` tồn tại, `DATABASE_DIRECT_URL` đã set trên Vercel. **Effort: S (chỉ verify).**

### 2.5 — CI chỉ gate typecheck *(P0 quy trình)*
- **Đã verify:** `.github/workflows/ci.yml` chạy `turbo run typecheck`; không lint, không test, không build smoke. Build hỏng chỉ bị bắt ở Vercel, **sau** khi merge.
- **Vì sao quan trọng lúc này:** Phase 2 sắp thêm nhiều route mới (sitemap/robots/rss/og-image). Một **build + vài check route-200 trong CI nên land *trước* việc đó**, để regression bị bắt trước-merge.
- **Fix:** thêm job build + smoke vào CI. **Effort: S.**

---

## 3. Lỗ hổng SEO / DISCOVERABILITY (cluster P0-C) — blocker launch cứng

Với một *tờ báo*, đây là blocker quyết định. **Đã verify: hoàn toàn chưa bắt đầu** (không file nào khớp `metadataBase`, `sitemap`, `robots`, `ld+json`, `llms.txt`; chỉ có vài `generateMetadata` trên các trang marketing/legal tĩnh, **không phải** trang article hay pillar).

| Phần thiếu | Hệ quả hiện tại | Tái sử dụng được |
|---|---|---|
| `metadataBase` + `NEXT_PUBLIC_SITE_URL` | URL OG/canonical resolve **tương đối** → social/crawler từ chối | — (root `layout.tsx`) |
| `generateMetadata` cho article | mọi article kế thừa title tĩnh **"Dailytechwire"** — chí mạng cho search/social | `article-view.ts` (title/dek/author/published đã có) |
| `generateMetadata` cho pillar | mọi trang pillar chung 1 title | `getPillars` |
| JSON-LD (NewsArticle/Author/Organization) | article **không đủ điều kiện vào Google News Top Stories** | cùng field view |
| `sitemap.ts` | crawler **không có danh sách URL**; invariant #8 không thỏa được | `getRecentArticles` + `getPillars` (auto-regen qua tag `articles:all`/`pillars:all`) |
| News-sitemap (`<48h`) | không có làn nhanh Google-News | **cần revalidate ngắn riêng** (~15 phút) — *không* dựa tag thuần, vì article qua 48h không bust tag |
| `robots.ts` | không có chỉ thị crawl / con trỏ sitemap | — |
| RSS (global + per-pillar) | thiếu kênh phân phối cơ bản; **footer `/rss.xml` là 404 thật**; nút "RSS feed" ở pillar trơ | `getRecentArticles` / `getArticlesPage` |
| `public/llms.txt` | thiếu file bắt buộc cho AI-search readiness | tĩnh |
| OG image generation | hook OG `afterChange` là TODO stub; nhiều article không có hero → social card trống | `next/og` `ImageResponse` |

**Góc invariant #8:** sitemap/RSS chính tự regenerate "trong ~5 phút" **miễn phí** vì đọc article share `articles:all` và đọc pillar share `pillars:all`, cả hai đã được `revalidate.ts` bust. **Ngoại lệ duy nhất** là cửa sổ 48h của news-sitemap (theo thời gian, không theo ghi) → cho nó `revalidate` ngắn riêng.

---

## 4. ĐẦY ĐỦ TÍNH NĂNG vs spec 86 dòng ("đầy đủ tính năng")

Khoảng **một phần ba** spec đang thiếu hoặc **giả-không-làm-gì** (UI có, backend không trả gì). Tất cả đã verify lại trên code hiện tại:

| Surface | Trạng thái | Bằng chứng | Phân loại |
|---|---|---|---|
| Đăng ký newsletter | **giả-no-op** | `home/newsletter-cta.tsx:83` `alert("Confirmation email sent (demo)")`; không có dep `resend`/`react-email` | hứa suông (copy ghi "Double opt-in") |
| Cookie "Decline" | **giả-no-op** | `cookie-banner.tsx` — "Decline" (`:128`) và "Accept" (`:136`) đều gọi cùng `dismiss()` (`:115`/`:133`); không lưu consent | dark-pattern GDPR/PDPA |
| Auth / login | **stub** | `auth-modal.tsx` `demoLogin()` fake mọi login phía client; không có dep `better-auth` | nút giả thành công |
| Paywall meter | **giả** | `lib/shell.tsx:42` `useState(0)` reset mỗi điều hướng (không bao giờ chặn); ngưỡng `3` hardcode (`header.tsx:49` `articlesRead >= 3`, + `article-content.tsx`) → **vi phạm invariant #4** (phải config được trong CMS) | vi phạm invariant |
| PostHog analytics | **thiếu** | không dep / code `posthog` | spec bắt buộc, vắng |
| Dashboards data (Funding / AI Leaderboard) | **stub trung thực** | mảng mẫu hardcode trong `lib/data.ts`, gắn nhãn "Preview · sample data · coming soon" | hoãn chấp nhận được (UI trung thực) |
| Audio / TTS bar | **giả** | `components/article/audio-player.tsx` render player không phát gì (TTS là Phase 2) | quảng cáo phát-lại không làm gì |
| Nút Share / save | **giả** | `components/article/share-bar.tsx` nút không `onClick` | affordance chết |
| CSV export | **giả** | `dashboards/funding-tracker.tsx` nút export không `onClick` | affordance chết (back bằng client blob rất dễ) |
| Icon social footer | **chết** | `footer.tsx:169` `href={href ?? "#"}` — X/LinkedIn/Instagram đi vào hư vô (spec row 8 muốn URL thật) | affordance chết |
| CTA paywall `/pro` | **404** | `article/paywall.tsx:73` `href="/pro"` → không có route | link chết trên link chuyển đổi giá trị cao nhất |
| Related-article recommender | **stub** | `related-row.tsx` là `articles.slice(0,3)` — row render nhưng không phải recommender (spec row 37) | dễ nhầm là "xong" |

**Bảng phủ (auditor spec):** lõi đọc editorial thật sự đã ship + typecheck sạch; **~1/3 dòng thiếu hoặc giả-no-op**, chủ yếu là SEO (vắng hoàn toàn) + cụm surface giả ở trên.

---

## 5. TUÂN THỦ INVARIANT (13 invariant — 10 đạt, 3 fail liên quan launch)

| # | Invariant | Kết luận |
|---|---|---|
| 1 | Engine chỉ ghi qua Payload API | ✅ intake dùng Payload local API |
| 2 | Giải quyết xung đột (`lockedFields` + optimistic lock) | ⚠️ field schema có; hook enforce **đã hoãn** (an toàn khi Engine chỉ-tạo — xem §10) |
| 3 | Cột `origin: engine\|manual` | ✅ có |
| 4 | Paywall soft block, "3" config trong CMS | ❌ **FAIL** — `3` hardcode (`header.tsx:49` + `article-content.tsx`); meter là `useState(0)` in-memory nên không bao giờ chặn |
| 5 | Disclosure boxes; nhãn AI inline đã bỏ 2026-06-05 | ❌ **FAIL (copy)** — `/trust/ai` (`trust-content.tsx:215`) vẫn công khai hứa *"nhãn 'AI-assisted' ở đầu, giữa, cuối… không tắt được"* — một claim **công khai SAI** |
| 6 | Không popup / không ad giữa bài | ✅ |
| 7 | Màu brand | ✅ `globals.css` khớp token đã pin |
| 8 | Pillar/Sub-section/Tag là entity CMS (thêm mới không-deploy) | ⚠️ **MỘT PHẦN** — trang pillar + nav + trang chủ đã CMS-driven, nhưng hằng số `PILLARS` tĩnh (`lib/data.ts`) vẫn chi phối **search filter, account Following, not-found, newsletters, nhãn i18n** → pillar thứ 7 thêm trong CMS sẽ thiếu ở những chỗ đó |
| 9 | i18n `/en /id /vi` subpath + hreflang | ⚠️ UI ngụ ý 3 ngôn ngữ; URL/SEO không có (chỉ toggle nhãn localStorage phía client) — không được lặng lẽ tính là "xong" |
| 10 | Body bài giữ ngôn ngữ gốc | ✅ |
| 11 | Logo / không-Lucia / không-Bun | ✅ |
| 12 | GDPR + PDPA + Nghị định 13 | ❌ **rủi ro** — cookie consent là no-op; PostHog self-host vắng (consent phải gate analytics trước khi nó ship) |
| 13 | Trang Awards "Coming this year" | ✅ |

**Sai casing (P2):** "DailyTechWire" kiểu camelCase xuất hiện ở chuỗi hiển thị (`header.tsx:603-605` nudge đăng nhập ×3, `briefing/page.tsx:35`) vs chuẩn **"Dailytechwire"**.

---

## 6. Tư thế INTEGRATIONS / SECURITY / COMPLIANCE

- **Engine intake** — tầng service-to-service đạt **chất lượng launch**: so sánh bearer constant-time, idempotent theo source URL, `origin:'engine'`. **Một lỗ hổng resilience được nêu (P2):** `route.ts:~255` `fetch(heroImageUrl)` **không có byte cap / timeout** → ảnh quá khổ/độc hại có thể buffer vô hạn. Rủi ro thấp (caller first-party tin cậy); một dòng `AbortController` timeout + cap content-length là đóng.
- **Tư thế auth** — stub rủi ro nhất: `demoLogin` lộ ra *fake* thành công. `/preview` được gate auth đúng (draft công khai → 404, preview không-auth → 401). Package `@dtw/db` đã có schema auth/account nhưng web app chưa import.
- **Compliance (invariant #12)** — cookie "Decline" không lưu gì; PostHog vắng. Với thị trường SG/VN/ID đây là rủi ro launch thật. **Thứ tự quan trọng:** ship consent-gating **trước** mọi analytics.
- **Rate limiting** — không có trên POST/search công khai; chấp nhận được sau Cloudflare WAF khi launch (xác nhận có WAF rule che `/api/*` + GraphQL). Đường `searchArticles` uncached dễ bị abuse nhất — thêm debounce/throttle khi tiện.
- **Caching/ISR** — đúng, trừ lỗ hổng Corrections (§2.3).

---

## 7. LỘ TRÌNH (ưu tiên ổn-định-trước, xếp theo mục tiêu của bạn)

### Phase 1 — Hardening ổn định, resilience & đúng-đắn *(P0 — làm trước; mỗi việc cỡ vài giờ)*
| Việc | Vì sao | Effort | Chặn launch |
|---|---|---|---|
| `global-error.tsx` + `(reader)/error.tsx` | loại bỏ failure mode màn-hình-trắng (§2.1) | S | ✅ |
| Hook revalidate Corrections | đóng lỗ stale 5 phút trên trang pháp lý (§2.3) | S | — (trọng yếu uy tín) |
| Runbook backup/restore + snapshot trước migration | kho bài cách 1 DELETE là mất (§2.2) | S | ✅ |
| Verify config prod trên Neon thật (`pinned_to_latest`, pillar `latest`, `DATABASE_DIRECT_URL`) | rủi ro config prod tồn dư (§2.4) | S | ✅ |
| CI build + smoke route-200 (trước Phase 2) | bắt regression route SEO trước-merge (§2.5) | S | — |

### Phase 2 — SEO / discoverability (P0-C) + sửa link chết mà nó bao trùm *(P0 — blocker launch cứng)*
| Việc | Effort | Chặn launch |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` + `metadataBase` + OG/Twitter mặc định ở root layout | S | ✅ |
| `generateMetadata` + JSON-LD (NewsArticle/Author/Organization) cho article + pillar | M | ✅ |
| `sitemap.ts` + news-sitemap (revalidate ngắn riêng) + `robots.ts` | M | ✅ |
| RSS routes (global + per-pillar) + nối footer RSS/social chết + nút RSS pillar | M | ✅ |
| OG image generation (`opengraph-image.tsx` qua `next/og`) + `public/llms.txt` | M | ✅ |
| Thay `PILLARS` tĩnh → `getPillars()` ở search filter + not-found (đi kèm) | S | — |

> Build thành **một cluster**: đọc article/pillar đã share tag mà `revalidate.ts` bust → sitemap/RSS chính tự regenerate **không cần hook mới** (invariant #8). Chỉ cửa sổ 48h của news-sitemap cần revalidate riêng.

### Phase 3 — Dọn uy tín: giết CTA chết, ngừng hứa suông *(P1)*
| Việc | Effort |
|---|---|
| Giải quyết mâu thuẫn AI-disclosure `/trust/ai` (invariant #5) — *cần quyết định sản phẩm* | S |
| Sửa paywall `/pro` 404 (trỏ về nudge đăng nhập hoặc stub "Pro coming soon") | S |
| Back-hoặc-ẩn các surface giả: newsletter, cookie-Decline, share/save, audio bar, CSV export, pillar Follow, social footer | M |
| Làm paywall meter trung thực (cookie persistence + limit từ CMS) hoặc ẩn nó (invariant #4) | M |
| Pass WCAG 2.1 AA / axe-core (spec row 66 — chưa từng audit) hoặc backlog có thời hạn | M |

### Phase 4 — Đầy đủ tính năng *(P1 — phụ thuộc quyết định sản phẩm + dep mới)*
| Việc | Effort |
|---|---|
| Better-Auth (magic link + OAuth + RBAC 5 role) **hoặc** ẩn hẳn surface auth | L |
| Cookie consent thật → **rồi mới** PostHog self-host (đúng thứ tự đó) | L |
| Newsletter qua Resend + double opt-in + collection subscribers | M |
| Hoàn tất đuôi invariant-#8: account Following + nhãn i18n đọc từ CMS pillars | M |

### Phase 5 — Backend Phase-2 bị hoãn + hardening nhỏ *(P2 — track, chưa build giờ)*
E4 lock/version enforcement (trước khi Engine có đường update) · cap+timeout fetch hero của intake · related-article recommender thật · i18n subpath routing + hreflang (nếu launch đa-ngôn-ngữ) · dashboards data backend · PWA service worker · TTS audio · payments (Stripe/VNPay/Momo) · affiliate redirect tracker · Wire Drops realtime.

---

## 8. QUYẾT ĐỊNH SẢN PHẨM CẦN CHỐT (chặn Phase 3–4 — quyết trước khi build)

1. **Copy `/trust/ai`** — viết lại theo policy thật (`aiAssisted` track nội bộ, không hiển thị inline) **hay** re-add nhãn inline? *(Hiện đang là một tuyên bố công khai sai.)*
2. **Auth lúc launch** — làm Better-Auth thật **hay** ẩn surface login/account? *(Gate cả paywall meter thật, Saved/Queue/History/Following, account persistence.)*
3. **Newsletter** — Resend + double opt-in **hay** tắt form + bỏ copy "Double opt-in"?
4. **Phạm vi i18n** — làm `/en /id /vi` + middleware + hreflang (invariant #9) **hay** descope en-only + ẩn switcher 3 ngôn ngữ?
5. **Paywall** — ship soft meter thật (cookie + số free từ CMS) **hay** ẩn UI meter khi launch?
6. **OG images** — generate fallback card qua `next/og` để mọi article có social card dù không upload hero? *(Khuyến nghị; gộp vào Phase 2.)*
7. **Accessibility** — pass WCAG đầy đủ trước launch **hay** backlog remediation có thời hạn?

---

## 9. QUICK WINS (giá trị cao, vài phút–vài giờ; phần lớn không cần quyết định)
- `global-error.tsx` + `(reader)/error.tsx` (loại bỏ màn-hình-trắng).
- Hook revalidate Corrections.
- Trỏ lại paywall `/pro` → nudge đăng nhập / stub.
- Nối hoặc ẩn icon social footer (`footer.tsx:169`).
- Sửa casing "DailyTechWire" → "Dailytechwire" (`header.tsx:603-605`, `briefing/page.tsx:35`).
- Thêm `public/llms.txt`.
- Verify trên Neon thật: cột `pinned_to_latest`, seed pillar `latest`, `DATABASE_DIRECT_URL` đã set.

---

## 10. HOÃN ĐÚNG (KHÔNG build bây giờ)
- **E4 lock/version enforcement** (invariant #2) — an toàn khi Engine **chỉ-tạo**; phải land **trước** khi Engine có đường update/edit.
- **Meilisearch** — Postgres `LIKE` trung thực + đủ dùng ở quy mô launch.
- **Wire Drops realtime** — đã verify server-backed (ISR 30s); không claim realtime. Hoãn chính xác.
- **Related recommender, PWA offline, payments, TTS, Transparency Report auto-gen, sync account↔IndexedDB, affiliate tracker** — đều spec Phase-2.
- **hreflang như một mục độc lập** — gộp vào milestone i18n routing; không chặn launch vì nó.

---

## 11. DỌN DẸP — drift cần đối chiếu
1. **Project memory** `project_dtw_status.md` ghi engine-intake "chưa push / không PR" — **CŨ/SAI**: đã merge (PR #7 + #8). Cập nhật lại.
2. **Plan progress-log** `human-ops-launch_PLAN_30-05-26.md` dừng ở 2026-06-01; ghi nhận P0-B tail (homepage/nav từ CMS, PR #11), Latest-feed/pin (PR #13–#18), và các trang phụ đều đã ship — và rằng **P0-C SEO + P0-E error boundary vẫn là blocker tiếp theo**.
3. **Dọn nhánh** — 5 nhánh local đã merge có thể prune; remote treo `feat/brand-guideline-palette` (palette xanh bị từ chối — resume sẽ REVERT terracotta invariant-#7) + `feat/header-logo-favicon` (đã bị thay) — nhiều khả năng xóa.

---

## 12. THỨ TỰ THỰC THI KHUYẾN NGHỊ

`Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5`

- **Phase 1 không phụ thuộc quyết định nào** — bắt đầu ngay (rẻ, ROI ổn định lớn nhất).
- **Phase 2 (SEO) là blocker launch cứng** — gộp Phase 1 + Phase 2 thành cluster launch-readiness.
- Trả lời **Open Decisions (§8)** song song để Phase 3–4 không bị kẹt.
- Site trở thành **launch-ready cho đội biên tập người** khi Phase 1 + Phase 2 land và các surface giả/link chết dễ thấy nhất (Phase 3) được làm-thật hoặc ẩn đi.

---

*Sinh ra từ một audit đa-agent chỉ-đọc (7 auditor, 1 tổng hợp, 1 critic đối kháng, 1 finalize — 10 agent, ~724k token, 228 tool call) cộng orchestrator tự verify mọi claim `file:line` load-bearing. Verify lại trích dẫn trước khi hành động.*
