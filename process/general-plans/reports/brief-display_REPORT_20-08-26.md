# Daily Brief — Report thi công (20-08-26)

**Plans:** `apcg-cms/.../brief-content-type_PLAN_20-08-26.md` + `dtw-web/.../brief-display_PLAN_20-08-26.md`
**Trạng thái:** code xong cả hai repo. **Chưa deploy, chưa migrate, chưa verify runtime.**

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

## Chưa verify — cần môi trường

- `next build` dừng ở "collecting page data" vì máy này **không có `DATABASE_URL`**. Không phải lỗi code; mọi thứ trước bước đó đã pass.
- **Toàn bộ verification runtime của cả hai plan chưa chạy** — cần DB thật + token Central. Quan trọng nhất và không được bỏ:
  - Central §Verification bước **5 và 6** — `totalDocs` khi không truyền `content_type` và khi truyền `article` phải **bằng nhau và bằng T**. Tụt là filter ngược chiều → dừng, đừng deploy.
  - dtw-web §Verification bước **3-4** — số bài trên `/latest` và RSS **không đổi** so với trước patch, chạy **trước** khi có brief nào.
- apcg-cms không có `node_modules` và máy không có docker ⇒ **chưa chạy được** `pnpm typecheck`, `payload:generate-types`, `payload:migrate` ở repo đó.
- Chưa seed Author desk (`DTW Briefing Desk` / role `Newsroom systems`) cho tenant `dtw` — cần `/admin` của Central.

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
