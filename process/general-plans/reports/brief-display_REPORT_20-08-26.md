# Daily Brief — Report thi công (20-08-26)

**Plans:** `apcg-cms/.../brief-content-type_PLAN_20-08-26.md` + `dtw-web/.../brief-display_PLAN_20-08-26.md`
**Trạng thái:** đã merge + deploy cả hai repo, migration đã chạy, phép đếm chặn đã đạt trên production. Còn lại: seed Author desk, đối chiếu snapshot migration, và verify với bản tin thật.

---

## Đã làm

### apcg-cms (Central)

| File | Việc |
|---|---|
| `src/lib/constants.ts` | `CONTENT_TYPES` + `toContentTypeValue()` (narrow chuỗi không tin cậy) |
| `src/collections/Articles.ts` | field `contentType` ở tab "Engine contract", non-localized, `required` + default `article` |
| `src/migrations/20260820_084629_add_content_type.{ts,json}` | 2 enum + 2 cột + backfill `_articles_v`; **`articles.content_type` là NOT NULL** |
| `src/migrations/index.ts` | đăng ký |
| `src/app/api/engine/intake/route.ts` | đọc + whitelist `contentType`, ghi khi create |
| `src/app/api/public/articles/route.ts` | tham số `content_type`, một `and.push` |
| `docs/08…`, `docs/09…` | hợp đồng intake + public API |

### dtw-web

| File | Việc |
|---|---|
| `payload/collections/Articles.ts`, `migrations/20260820_000000_content_type.ts`, `migrations/index.ts`, `payload-types.ts` | field + migration + type (parity với Central) |
| `app/api/engine/intake/route.ts` | đọc + whitelist `contentType` (local mode) |
| `lib/brief.ts` | **MỚI** — `BRIEF_CONTENT_TYPE`, `isBriefSlug`, `briefEdition`, `briefDate` |
| `lib/payload-server.ts` | `NOT_BRIEF` áp vào 9 chỗ + `getLatestBriefs` + `getBriefsPage` |
| `lib/cms-client.central.ts` | `ARTICLE_ONLY` áp vào 9 chỗ + 2 helper brief |
| `lib/central-api.ts` | khai `content_type` trong `FetchArticlesParams` |
| `lib/cms-client.ts` | export 2 helper qua switch |
| `lib/most-read.ts` | loại brief sau hydrate |
| `lib/article-view.ts` | `contentType` vào `ArticleView` |
| `components/article/article-content.tsx` | brief: miễn paywall + không tính meter + ẩn hero giả + ẩn related row |
| `app/sitemap.ts` | brief priority 0.4 |
| `app/(reader)/briefing/{page.tsx,briefing-view.tsx,briefing-content.tsx,page/[n]/page.tsx}` | hub + phân trang |
| `components/home/brief-band.tsx` | props-driven, copy giờ, WIB→SGT |
| `app/(reader)/page.tsx` | fetch + props; `SHOW_BRIEF` **vẫn `false`** |
| `lib/data.ts` | `BRIEFS_PAGE_SIZE` + mục nav "Briefing" |
| `app/globals.css` | `.r-brief-latest` / `.r-brief-archive` |
| `scripts/seed-payload.ts` | cadence AM/PM bỏ giờ cứng |

## Đã verify

- `pnpm typecheck` — **3/3 sạch**. Đây cũng là bằng chứng `payload-server.ts` và `cms-client.central.ts` không lệch chữ ký (switch ở `cms-client.ts` bắt drift thành compile error).
- `pnpm lint` — **3/3 sạch**; chỉ còn warning có sẵn ở các migration cũ và một `eslint-disable` thừa ở `payload-server.ts:32` (cả hai không phải của lần này).
- `next build` — **compile + check types thành công**.
- Central: 6 file đổi đều qua `node --check` (type-stripping).
- Snapshot migration Central: JSON hợp lệ, 75 bảng / 38 enum, 2 cột mới đúng vị trí.

## Verify trên production (sau khi merge, 20-08-26)

Cả hai PR đã merge và deploy: apcg-cms#1 (`582bb85`) và dtw-web#40 (`fb37813`).

- **Migration Central đã chạy.** `vercel-build` là chuỗi `migrate-prod.mjs && payload generate:importmap && next build`, Vercel báo success cho commit merge ⇒ migration apply xong, nếu lỗi thì build đã chết trước `next build`.
- **Vercel preview build của dtw-web SUCCESS** — tức `next build` đầy đủ với env thật, qua cả bước "collecting page data" mà máy local chết ở đó.
- **Phép đếm chặn — ĐẠT.** Đo trên `www.dailytechwire.com` sau khi bản mới lên:

  | Kiểm | Trước | Sau | |
  |---|---|---|---|
  | RSS entries | 50 | 50 | ✅ |
  | Sitemap article URLs | 1.661 | 1.677 | ✅ tăng đúng nhịp ~24 bài/ngày, không tụt |
  | `/latest` link bài | — | 25 | ✅ đúng `ARTICLES_PAGE_SIZE` |
  | `/briefing` | placeholder | 200, empty state mới | ✅ |

  Lọc **không** ngược chiều. Đây là rủi ro đắt nhất của đợt này (loại nhầm là mất 1.661 bài) và đã loại trừ bằng dữ liệu thật.

- apcg-cms: đã `npm ci`, `npm run typecheck` **sạch với types thật** — `contentType: 'article' | 'daily-brief'` sinh ra đúng.

## Còn lại — cần môi trường

- **Seed Author desk** cho tenant `dtw` trong `/admin` Central. Không seed thì bản tin đầu tiên đẻ ra một Author `role: "Staff Writer"`. Giá trị chốt 20-08-26 (xem §P11 doc nghiên cứu):
  `name: "DTW Briefing Desk"` (khớp đúng từng ký tự) · `role: "Dailytechwire Newsroom"` · `city: "Singapore"`.
- **Snapshot migration Central chưa đối chiếu.** Migration viết tay vì máy không có DB/docker. Chạy `payload migrate:create` một lần trên DB đã migrate — kỳ vọng sinh ra migration rỗng.
- **Verify runtime với bản tin thật chưa chạy** — cần một số AM + PM đã đăng: hero, `/latest`, related (mở bài cũ nhất một pillar để kiểm nhánh wrap-around), paywall, `/briefing`, rail Saved.

## Lệch so với plan, có chủ đích

1. **`contentType` chỉ ghi ở nhánh create của intake, không ghi ở update.** Plan nói cả hai. `refreshExisting` là làm mới nội dung, không phải phân loại lại; cho nó ghi `contentType` mở đường cho một payload gửi nhầm đổi bản chất một bài đã tồn tại. Brief cũng không bao giờ được refresh (engine idempotent-skip).
2. **NOT NULL phải thêm tay trong migration.** Plan giả định `required: true` là đủ. Không đúng: adapter Postgres của Payload để select-required ở dạng nullable (`origin` là bằng chứng, đang nullable trong schema). Snapshot giữ `notNull: false` đúng như Payload sinh ra, còn SQL đặt NOT NULL — để lần `migrate:create` sau không diff ngược constraint đi.
3. **Migration Central viết tay thay vì `migrate:create`.** Không có DB/deps. Cả `.ts` lẫn `.json` snapshot đều dựng theo đúng convention của repo (enum + cột mirror `origin`, `prevId` all-zeros như 4 migration hiện có). **Nên đối chiếu lại bằng một lần `payload migrate:create` trên môi trường có DB trước khi deploy** — nếu nó sinh ra migration rỗng thì snapshot khớp.
4. **`/briefing` chia lead theo NGÀY, không theo số.** Plan viết "số mới nhất". Lấy số thì số đó xuất hiện hai lần (lead + archive) hoặc archive có lỗ giả. Lấy ngày mới nhất (cả AM lẫn PM khi có) rồi archive từ ngày kế là cách duy nhất không sinh trùng mà vẫn hiện đúng lỗ thật.
5. **Cài `pnpm install --frozen-lockfile`** để dứt điểm lỗi typecheck có sẵn (`@next/third-parties` khai trong package.json từ commit 184efba nhưng chưa cài). Lockfile không đổi.

## Thứ tự bật (chưa làm)

1. Central: `payload:migrate` → verify bước 5/6 → deploy.
2. Central `/admin`: seed Author `DTW Briefing Desk`.
3. dtw-web: migrate + deploy → verify bước 3-4 **trước** khi có brief.
4. Đăng thử 1 số AM + PM → chạy nốt verify 6-18.
5. Bật một lần: `dtw` vào `BRIEF_PUBLISH_PUBS` **và** `SHOW_BRIEF = true`.
