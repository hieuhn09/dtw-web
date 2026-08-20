# dtw-web — Lọc Daily Brief khỏi luồng tin + trang `/briefing`

**Ngày:** 20-08-26
**Repo:** `dtw-web` — HEAD tham chiếu `b8941da`
**Complexity:** SIMPLE (một execute pass)
**Status:** ✅ CODE COMPLETE 20-08-26 — chưa deploy, chưa verify runtime (xem `process/general-plans/reports/brief-display_REPORT_20-08-26.md`)
**Nghiên cứu:** `process/general-plans/references/brief-display-research_REFERENCE_20-08-26.md`
**Phụ thuộc:** `apcg-cms/process/general-plans/active/brief-content-type_PLAN_20-08-26.md` phải **deploy xong trước**. Không có tham số `content_type` trên Central thì plan này không chạy được.

---

## Overview

Production đọc từ Central (`/api/health/cms` → `cmsSource: "central"`, host `apcg-cms.vercel.app`). Khi Central ship xong `contentType`, dtw-web làm ba việc:

1. **Loại brief** khỏi mọi luồng dành cho tin thường — hero, `/latest`, pillar, related, RSS, Most Read, search — bằng cách truyền `content_type=article`.
2. **Cho brief một chỗ đứng riêng** — `/briefing` hub có phân trang, band trang chủ chạy dữ liệu thật.
3. **Sửa những chỗ template bài không hợp với một bản mục lục** — hero ảnh giả, paywall meter, related row.

Brief vẫn giữ URL `/article/<slug>` làm canonical và vẫn nằm trong sitemap (hạ priority).

**Không nằm trong phạm vi** (chủ dự án chốt 20-08-26, §P10 doc nghiên cứu): dòng disclosure dạng chrome, patch `/trust/ai`, câu hỏi chính sách AI.

---

## Touchpoints

### Payload local (chỉ để parity + type)

| File | Thay đổi |
|---|---|
| `apps/web/src/payload/collections/Articles.ts` | thêm `contentType` — **khớp từng chữ** với định nghĩa ở plan Central |
| `apps/web/src/payload/migrations/` | **MỚI** migration + entry `index.ts` |
| `apps/web/src/payload/payload-types.ts` | regenerate |

> Local Payload không còn là đường đọc của reader, nhưng `cms-client.ts` re-export type từ `payload-server.ts` ⇒ thiếu field ở đây là **compile error**. Và rollback bằng `CMS_SOURCE` chỉ có giá trị nếu bản local cũng đã lọc.

### Tầng đọc — sửa **cả hai**, cùng một lượt

| File | Thay đổi |
|---|---|
| `apps/web/src/lib/cms-client.central.ts` | truyền `content_type: "article"` (danh sách call-site bên dưới) + 2 helper brief mới |
| `apps/web/src/lib/payload-server.ts` | y hệt, bằng một `Where` dùng chung + 2 helper brief mới |
| `apps/web/src/lib/cms-client.ts` | export 2 helper mới qua switch |

`cms-client.ts` bắt hai module phải cùng chữ ký ⇒ lệch nhau là compile error, không phải lỗi runtime âm thầm.

**Truyền `content_type=article`:** `getRecentArticles` · `getArticlesPage` · `getArticlesAfter` · `getArticlesByPillar` · `getRelatedArticles` · `searchArticles` · `getFeedArticles` · `getPinnedLatest`

**KHÔNG truyền:** `getArticleBySlug` · `getArticlesByIds` · `getArticleBySlugDraft` (trang brief và rail Saved/History phải mở được) · `getSitemapArticles` (xem §Sitemap) · `getDeepDive`/`getSponsoredArticle` (lọc theo cờ brief không mang)

### Bề mặt còn lại

| File | Thay đổi |
|---|---|
| `apps/web/src/lib/most-read.ts` | loại brief **sau khi hydrate** (`getArticlesByIds` cố ý không lọc) |
| `apps/web/src/lib/article-view.ts` | thêm `contentType` vào `ArticleView` + `toArticleView` |
| `apps/web/src/components/article/article-content.tsx` | brief: không tính/không bị paywall · ẩn `CoverArt` hero · ẩn related row |
| `apps/web/src/app/sitemap.ts` | brief priority `0.6 → 0.4` |
| `apps/web/src/app/(reader)/briefing/page.tsx` | **viết lại** — hub thật |
| `apps/web/src/app/(reader)/briefing/briefing-view.tsx` | **MỚI** — thân dùng chung 2 route (mirror `[pillar]/pillar-view.tsx`) |
| `apps/web/src/app/(reader)/briefing/page/[n]/page.tsx` | **MỚI** — trang 2+ (mirror `[pillar]/page/[n]/page.tsx`) |
| `apps/web/src/components/home/brief-band.tsx` | bỏ mảng hardcode → nhận props; sửa copy giờ + nhãn WIB→SGT |
| `apps/web/src/app/(reader)/page.tsx` | fetch `getLatestBriefs`, truyền props. `SHOW_BRIEF` **giữ `false`** cho tới lúc bật |
| `apps/web/src/lib/data.ts` | thêm `{ id: "briefing", label: "Briefing", slug: "/briefing" }` vào `NAV_EXTRA` |
| `apps/web/scripts/seed-payload.ts` | sửa cadence AM/PM cho khớp giờ thật |

## Blast radius

- **Reader thấy gì khi merge:** `/briefing` đổi từ placeholder sang hub rỗng (chưa có brief nào ⇒ empty state), và mục "Briefing" xuất hiện trên nav. Band vẫn ẩn (`SHOW_BRIEF=false`). Không surface nào khác đổi — hôm nay chưa có brief nên `content_type=article` lọc ra đúng tập cũ.
- **DB:** 1 cột trên Payload local (không phải đường production).
- **Rủi ro cao nhất:** truyền tham số sai chiều làm rỗng feed. Chặn bằng bước verify đếm số bài trước/sau (§Verification 3-4).

---

## Contract & Mechanics

### Nhận diện AM / PM

Không có field riêng. Đọc từ slug: `morning-brief-YYYY-MM-DD` → AM, `evening-brief-YYYY-MM-DD` → PM.

```ts
const BRIEF_SLUG = /^(morning|evening)-brief-(\d{4}-\d{2}-\d{2})$/;
```

Ngày lấy từ **slug**, không lấy từ `publishedAt`: `publishedAt` là lúc cron đẩy, còn slug là ngày phát hành theo SGT do engine neo theo lịch.

### Helper mới

```ts
getLatestBriefs(): Promise<{ am: Article | null; pm: Article | null }>
```
Một lượt `content_type=daily-brief`, `sort=-publishedAt`, `limit=10`, rồi nhặt bản AM đầu tiên và PM đầu tiên. Một call, không phải hai.
**Fail-open:** try/catch → `{ am: null, pm: null }`. Lỗi query brief không bao giờ được làm vỡ trang chủ.

```ts
getBriefsPage(page = 1, pageSize = 20): Promise<ArticlesPage>
```
Kho lưu trữ cho `/briefing`. Cùng shape `ArticlesPage` mà `getArticlesPage` trả về.

### Giờ hiển thị

Cron soạn là 05:00 / 19:00 SGT, **nhưng giờ lên web = giờ editor bấm duyệt** (runbook engine 07-08-26). Nên:

- mỗi số hiện **timestamp thật của chính nó**;
- copy nhịp phát hành nói định tính: `t("Twice daily · morning & evening SGT", "Hai lần mỗi ngày · sáng & tối SGT", "Dua kali sehari · pagi & malam SGT")`;
- **bỏ hẳn** cặp 07:00/18:00 ở `brief-band.tsx`, `briefing/page.tsx`, và cadence AM/PM trong `seed-payload.ts:96-97`;
- sửa nhãn Indonesia trong `brief-band.tsx` từ **WIB** sang **SGT** (lỗi có sẵn).

### `/briefing` — cấu trúc

1. Kicker "The Brief" + h1 + một câu nhịp phát hành.
2. **Số mới nhất**: chip AM/PM + ngày (từ slug) + `title` + `dek`, link sang `/article/<slug>`.
3. **Lưu trữ**: nhóm theo ngày, mỗi ngày một hàng hai ô AM · PM. Ngày thiếu một bản (engine skip vì thin-supply) hiện đúng là thiếu — **không lấp**.
4. Empty state khi chưa có số nào.
5. Phân trang: `/briefing` canonical trang 1, `/briefing/page/[n]` trang 2+. Copy nguyên cơ chế của `[pillar]/page/[n]/page.tsx`: regex `^[1-9][0-9]*$`, `page===1` redirect về `/briefing`, còn lại `notFound()`.

**Không** tạo `/briefing/[date]` — trùng nội dung với `/article/<slug>`.

**Không** dùng card có `CoverArt`. Brief không có ảnh; `CoverArt` sẽ vẽ ảnh trừu tượng giả cho cả 730 số/năm. Layout chữ.

### Sitemap

`getSitemapArticles` dùng `view=refs`, chỉ select `slug/updatedAt/publishedAt` ⇒ **không có `contentType`** để phân biệt. Không đổi API; nhận diện bằng `BRIEF_SLUG` ngay trong `sitemap.ts`:

```ts
priority: BRIEF_SLUG.test(article.slug) ? 0.4 : 0.6
```

Giữ brief trong sitemap (đã có `/briefing` thật thì 730 trang/năm đáng index), chỉ hạ trọng số. Thêm `/briefing/page/[n]` vào sitemap theo đúng cách `pillarPageEntries` đang làm.

### Most Read

`getMostReadArticles` hydrate qua `getArticlesByIds` (cố ý không lọc). Loại brief **sau** hydrate, **trước** khi cắt `limit` — cùng chỗ đang loại `sponsored`:

```ts
.filter((a) => a.contentType !== "daily-brief")
```

### Paywall

`article-content.tsx:30`:
```ts
const isBrief = article.contentType === "daily-brief";
const hitPaywall = articlesRead >= paywallThreshold && !user && !article.sponsored && !isBrief;
```
Và không ghi lượt đọc brief vào meter. Brief là bản digest miễn phí hằng ngày — bung sign-in nudge trên nó là sai bản chất sản phẩm.

---

## Steps

1. **Field + migration + types** trên Payload local (khớp từng chữ với plan Central).
2. **`article-view.ts`** — `contentType` vào `ArticleView` + `toArticleView`.
3. **`payload-server.ts`** — `const NOT_BRIEF: Where = { contentType: { equals: "article" } }`, spread vào 8 helper trong danh sách; thêm `getLatestBriefs` + `getBriefsPage`.
4. **`cms-client.central.ts`** — `content_type: "article"` vào 8 helper tương ứng; thêm 2 helper brief.
5. **`cms-client.ts`** — export 2 helper mới.
6. **`most-read.ts`** — lọc sau hydrate.
7. **`article-content.tsx`** — paywall + ẩn hero + ẩn related row cho brief.
8. **`sitemap.ts`** — priority theo `BRIEF_SLUG`; thêm entry `/briefing/page/[n]`.
9. **`/briefing`** — `briefing-view.tsx` + viết lại `page.tsx` + thêm `page/[n]/page.tsx`.
10. **`brief-band.tsx`** — props-driven, sửa copy giờ + WIB→SGT.
11. **`(reader)/page.tsx`** — fetch + truyền props. `SHOW_BRIEF` **giữ `false`**.
12. **`data.ts`** — mục nav "Briefing".
13. **`seed-payload.ts`** — cadence AM/PM.

---

## Verification

`T` = số bài published hiện tại (~1.661 theo sitemap 20-08-26).

| # | Kiểm | Kỳ vọng |
|---|---|---|
| 1 | `pnpm typecheck` | sạch — cũng là bước chứng minh 2 module cms-client không lệch |
| 2 | `pnpm build` | sạch |
| 3 | `/latest` + trang chủ, **trước khi có brief nào** | số bài **không đổi** so với trước patch |
| 4 | `/rss.xml` | vẫn 50 entry |
| 5 | POST một brief giả vào Central (AM + PM cùng ngày) | — |
| 6 | Trang chủ | brief **không** ở hero, **không** trong band Latest, **không** trong Most Read |
| 7 | `/latest`, `/ai`, trang pillar | không có brief |
| 8 | `/rss.xml`, `/latest/rss.xml` | không có brief |
| 9 | `/search?q=brief` | không có brief |
| 10 | `/article/morning-brief-<date>` | **200**, render đúng: không hero giả, không related row, không paywall |
| 11 | Đọc brief 5 lần ở chế độ khách | **không** bung sign-in nudge; meter **không** tăng |
| 12 | `/briefing` | hiện cả AM và PM, đúng chip, đúng ngày lấy từ slug |
| 13 | `/briefing/page/1` | redirect → `/briefing` |
| 14 | `/briefing/page/abc`, `/briefing/page/02` | 404 |
| 15 | `/sitemap.xml` | brief có mặt, `priority` 0.4 |
| 16 | Lưu một bản brief rồi mở `/account` | vẫn thấy trong Saved (`ids` không lọc) |
| 17 | Bài liên quan ở cuối một bài thường bất kỳ | không trỏ vào brief (kiểm cả nhánh wrap-around: mở bài **cũ nhất** của một pillar) |
| 18 | Tạm set `CMS_SOURCE=` (local), lặp lại 6-8 | kết quả y hệt — parity |

Bước **3-4** chạy **trước** khi có brief nào và là chốt an toàn quan trọng nhất: nếu số bài tụt thì đã truyền tham số sai chiều.

## Bật (sau khi 2 plan đều deploy)

Một lần, không chia nấc — theo quyết định 20-08-26:

1. Seed Author desk trên Central (nếu chưa).
2. Thêm `dtw` vào `BRIEF_PUBLISH_PUBS` (Vercel, engine admin).
3. `SHOW_BRIEF = true` trong `(reader)/page.tsx`.

Ngừng gấp: xoá `dtw` khỏi `BRIEF_PUBLISH_PUBS` — hiệu lực ngay, không cần deploy.

## Rollback

- Band: `SHOW_BRIEF = false`.
- Nguồn brief: xoá khỏi `BRIEF_PUBLISH_PUBS`.
- Lọc: gỡ tham số/`Where` — không đụng schema.
- `/briefing` tự về empty state khi không còn brief nào.
