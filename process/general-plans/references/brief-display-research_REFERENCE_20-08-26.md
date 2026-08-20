# Daily Brief trên dtw-web — Nghiên cứu hai hướng tích hợp + trang hiển thị

**Ngày:** 20-08-26
**Loại:** REFERENCE (RESEARCH output — không phải plan, không phải quyết định)
**Câu hỏi:** (1) chọn hướng nào giữa "theo engine" và "BriefEditions riêng"; (2) trang hiển thị các bài brief nên trông thế nào và tốn gì.
**Phạm vi verify:** dtw-web @ `66ba2ff`, content-engine (local), brief-asia-web (local), wtb-web (local), production `www.dailytechwire.com` (đo 20-08-26).

---

## 0. TL;DR

- Engine **đã hoàn thiện** pipeline Daily Brief cho dtw và đang **fail-closed** — brief chưa và sẽ không tự lên web cho tới khi ai đó thêm `dtw` vào env `BRIEF_PUBLISH_PUBS`. Có thời gian để làm đúng.
- Hợp đồng đã chốt ngày 04-08-26: **brief đi qua `/api/engine/intake` như một bài thường**, đánh dấu bằng `contentType: 'daily-brief'`. Kế hoạch cũ của dtw-web (`engine-composed-brief_PLAN_24-07-26.md`) mô tả một kiến trúc khác hẳn và **đã lỗi thời**.
- **Khuyến nghị: Hướng A** (nhận theo hợp đồng engine, thêm field `contentType` vào Articles, lọc khớp dương, rồi dựng `/briefing` bằng chính dữ liệu đó). Hướng B (BriefEditions riêng) đắt gấp nhiều lần và phải sửa cả engine để được đúng thứ nó đã có.
- **Ba điều hợp đồng engine không biết, và là phần đắt nhất của việc này:**
  1. dtw-web có **hai** tầng đọc dữ liệu song song (`payload-server.ts` local và `cms-client.central.ts` qua HTTP). Lọc một tầng mà quên tầng kia = lật `CMS_SOURCE` là brief tràn lại toàn bộ feed.
  2. API public của Central **không có tham số loại trừ** — chỉ có `tag`, `pillar`, `flag`. Ở chế độ central, Hướng A cần **sửa Central**, không sửa được một mình trong repo này.
  3. Intake **tự tạo một Author tên "DTW Briefing Desk"** với `role: "Staff Writer"`, `city: "Singapore"`. Bot ký tên như phóng viên — vướng trực tiếp phần "editorial integrity là sản phẩm".
- Cái bẫy `NULL` mà hợp đồng cảnh báo (`WHERE contentType != 'daily-brief'` xoá sạch bài cũ) **giải được sạch trong 1 dòng migration** ở phía dtw-web: backfill `content_type = 'article'` cho toàn bộ hàng cũ rồi `SET NOT NULL DEFAULT 'article'`. Engine không backfill ngược được, nhưng web thì được — nó là DB của chính mình.
- Chưa repo nào trong 3 tờ (wtb / briefasia / dtw) ship xử lý brief. Không có bản mẫu để port.

---

## 1. Hiện trạng dtw-web (verified 20-08-26)

| Bề mặt | Trạng thái |
|---|---|
| `apps/web/src/app/(reader)/briefing/page.tsx` | Placeholder tĩnh 100%, không fetch gì. Live 200. Không có link nào từ header/footer — chỉ có trong `sitemap.ts:38` và nút trong BriefBand (đang ẩn) ⇒ trang mồ côi. |
| `apps/web/src/components/home/brief-band.tsx` | Mảng `briefs` hardcode 2 mục giả. Tắt bởi `SHOW_BRIEF = false` (`(reader)/page.tsx:29`). |
| Payload collections | 12 collection, **không có** `BriefEditions` (`payload.config.ts:53-66`). |
| `/api/engine/intake/brief` | Không tồn tại. Chỉ có `/api/engine/intake`. |
| `getLatestBriefs`, tag `briefs:all` | Không tồn tại. |
| Newsletters `am` / `pm` | Có trong Payload (`Newsletters.ts`) + seed (`seed-payload.ts:96-97`). `/newsletters` đã gỡ khỏi nav (`lib/data.ts:84-85`), band newsletter ở footer tắt (`footer.tsx:14`). **Không có pipeline gửi email** — `apps/web/vercel.json` chỉ có 1 cron (refresh dashboards ai-weekly). |
| Production | sitemap 1.803 URL, trong đó **1.661 URL bài**; **0** URL `morning-brief-*`/`evening-brief-*`. `/article/morning-brief-2026-08-19` → 404. Chưa từng có brief nào lên. |
| Nhịp xuất bản thật | RSS 50 entry trải từ `2026-08-18T02:15Z` → `2026-08-20T05:15Z` ≈ **23–24 bài/ngày**. |

Đo lại nhịp xuất bản làm **con số 28% của hợp đồng bị lệch**: với ~24 bài/ngày, 2 brief/ngày chỉ chiếm **~8% của RSS 50 entry** (4/50), không phải 28%. Con số 28% tính khi dtw còn xuất bản ~5 bài/ngày. Sitemap thì ngược lại — vẫn đúng và vẫn nặng: 730 URL brief/năm, sau 1 năm là ~30% tổng URL bài, cùng `priority: 0.6` với bài thật (`sitemap.ts:79-84`).

---

## 2. Engine đang làm gì (nguồn: content-engine, verified 20-08-26)

Pipeline hoàn chỉnh, không phải bản nháp:

- Bảng `daily_briefs` + `brief_configs` (`supabase/migrations/016_daily_briefs.sql`), RLS bật, seed sẵn 3 tờ.
- Admin UI `/briefs` + `/briefs/[id]` + `/briefs/settings` — list, preview đúng thứ tự render, sửa inline headline/summary từng mục, Approve / Skip. **Human gate bắt buộc** ở phase 1.
- Cron `trigger-brief` (`0 21 * * *` và `0 11 * * *` UTC = 05:00 / 19:00 SGT) soạn; cron `publish-briefs` (mỗi 15') đăng.
- Kill-switch **kép**: env `BRIEF_PUBLISH_PUBS` (CSV, **thiếu/rỗng = tắt hết, fail-closed** — `admin/src/lib/publish-briefs.ts:80-87`) **và** cột `brief_configs.enabled` (mặc định `true`).

Config seed cho dtw (`016_daily_briefs.sql`):

```
brief_pillar      = 'latest'
byline            = 'DTW Briefing Desk'
item_count        = 8      min_items = 3     max_per_pillar = 3
am_cutoff         = '05:00'   pm_cutoff = '19:00'   (SGT)
title_template_am = 'Morning Brief — {date}'
title_template_pm = 'Evening Brief — {date}'
```

Payload engine gửi (`admin/src/lib/brief-payload.ts`, `dtw-intake-client.ts:185`):

```jsonc
{
  "title": "Morning Brief — August 5, 2026",
  "slug": "morning-brief-2026-08-05",         // hoặc evening-brief-YYYY-MM-DD
  "dek": "<intro>",
  "pillarSlug": "latest",
  "byline": "DTW Briefing Desk",
  "aiAssisted": true,
  "contentType": "daily-brief",               // ← dấu hiệu chính
  "tags": ["daily-brief"],
  "heroImageUrl": null, "imageCredit": null,
  "body_markdown": "<intro>\n\n## <tít 1>\n<2-3 câu>\n[Read more →](https://www.dailytechwire.com/article/<slug>)\n… 6-10 mục …\n\n_Compiled by DTW Briefing Desk from DailyTechWire reporting._",
  "sourceProvenance": { "url": "https://dailytechwire.com/morning-brief-2026-08-05", "name": "DTW Briefing Desk" }
}
```

Ba dấu hiệu nhận dạng độc lập, cố ý (hợp đồng §3): `contentType === 'daily-brief'` (khuyến nghị) · slug prefix `morning-brief-`/`evening-brief-` · byline kết thúc `Briefing Desk`.

**Giới hạn engine đã thừa nhận:** brief đã published trên dtw **không re-deliver được bản sửa** — intake idempotent theo `engineSourceUrl` nên retry = skip. Sửa sau khi đăng phải làm thẳng trong CMS dtw. (Đây là điểm Hướng B từng định giải, xem §5.)

---

## 3. Nếu bật ngay hôm nay: brief lọt vào đâu

dtw-web **không có điểm nghẽn chung** — 20 helper query riêng lẻ trong `payload-server.ts`, tất cả chỉ lọc `_status: published`. Verified từng cái:

| Bề mặt | Helper / file:line | Hậu quả |
|---|---|---|
| **Hero trang chủ 410px** | `(reader)/page.tsx:86-89` → `getRecentArticles` (`payload-server.ts:105`); `home-hero.tsx:33` | Brief thành lead trang nhất 2 lần/ngày, giữ tới bài kế (~1h). Không có ảnh → `CoverArt` sinh ảnh trừu tượng giả làm hero cho một bản mục lục. |
| **`/latest` (firehose)** | `getArticlesPage` bỏ hẳn filter pillar khi `slug === 'latest'` (`payload-server.ts:163-190`) | Chọn `brief_pillar` nào cũng không thoát trang này. |
| **`/latest` band trang chủ** | `(reader)/page.tsx` `byPillar.latest` | Như trên. |
| **Load more** | `getArticlesAfter` (`:213`) | Như trên. |
| **Trang pillar** | `getArticlesByPillar` (`:251`) | `brief_pillar='latest'` nên chỉ dính `/latest`; đổi pillar khác thì dính pillar đó. |
| **Bài liên quan** | `getRelatedArticles` (`:303-371`) — có **wrap-around**: thiếu bài cũ hơn thì lấy bù từ mới nhất | Bài cũ **chắc chắn** trỏ vào brief. |
| **Most Read** | `most-read.ts` — loại `sponsored`, **không** loại brief | Brief lọt bảng xếp hạng đọc nhiều. |
| **RSS toàn site + RSS pillar** | `getFeedArticles` (`:657`), `app/rss.xml/route.ts`, `[pillar]/rss.xml` | ~8% feed (4/50 entry). |
| **Sitemap** | `getSitemapArticles` (`:686`) → `sitemap.ts:79-84` | +730 URL/năm, `priority 0.6` ngang bài thật. |
| **Search** | `searchArticles` (`:453`) — `title like` / `dek like` | Brief chen vào kết quả. |
| **Paywall meter** | `article-content.tsx:30` — `hitPaywall = articlesRead >= threshold && !user && !sponsored` | **Brief tính vào meter và tự nó bị chặn.** Một bản digest miễn phí hằng ngày mà bung sign-in nudge là sai bản chất sản phẩm. |
| **Author** | `intake/route.ts:216-235` — resolve byline → tạo Author nếu chưa có, `role: "Staff Writer"`, `city: "Singapore"` | Sinh một "phóng viên" tên **DTW Briefing Desk**. `Authors.ts` ghi rõ trang tác giả sẽ làm ⇒ tương lai có một trang tác giả 100% là brief. |
| **Tag** | intake tạo/nối tag `daily-brief` | Vô hại, và là đường query dự phòng. |
| **`getDeepDive` / `getSponsoredArticle` / `getPinnedLatest`** | `:473 / :491 / :515` | An toàn — lọc theo cờ mà brief không mang. |
| **`getArticleBySlug`** | `:377` | **Phải giữ nguyên** — trang bài của brief cần mở được. |

### 3.1. Cái hợp đồng không biết: tầng đọc thứ hai

`apps/web/src/lib/cms-client.ts` là một **switch**:

```
CMS_SOURCE=central  → cms-client.central.ts   (HTTP tới Central CMS, CMS_URL)
mặc định            → payload-server.ts        (Payload local)
```

Hai module expose **cùng 20 hàm cùng chữ ký**, drift giữa chúng là compile error ở `cms-client.ts`. Hệ quả:

- Mọi filter brief phải viết **hai lần** — bỏ sót một bên thì lật `CMS_SOURCE` là brief tràn lại toàn bộ feed, im lặng, không lỗi.
- **API public của Central không loại trừ được.** `FetchArticlesParams` (`central-api.ts:113-136`) chỉ nhận `locale, pillar, subsection, country, tag, q, ids, flag, page, limit, sort, after_published_at, after_id`. Không có `not_tag`, không có `contentType`, không có `where` tự do. Ở chế độ central chỉ còn hai đường:
  - lọc trong bộ nhớ sau khi fetch → **vỡ `totalDocs`/`hasNextPage`/phân trang** và thủng hạn ngạch (xin 21 bài, trả về 19);
  - **sửa Central** thêm field + tham số query → việc ngoài repo này.
- `fetchArticles` có `tag` ⇒ **`/briefing` query được ngay ở cả hai chế độ** bằng khớp dương `tag=daily-brief`. Chiều lấy brief rẻ; chiều loại brief mới là chỗ đắt.
- Câu hỏi mở kèm theo: ở chế độ central, `/api/engine/intake` vẫn ghi bằng `getPayload({config})` = **Payload local**, trong khi reader đọc từ Central. Đây là vướng mắc có sẵn, không do brief gây ra, nhưng bật brief ở chế độ central sẽ đụng phải.

---

## 4. Bẫy NULL — và cách dtw-web thoát sạch

Hợp đồng §3 cảnh báo đúng: bài thường **không mang** `contentType` (vắng = `NULL`), nên `WHERE contentType != 'daily-brief'` trong SQL trả `NULL` chứ không phải `TRUE` ⇒ **xoá sạch 1.661 bài cũ, trang chủ trắng**. Ở Payload, `not_equals` cũng có phiên bản bỏ luôn hàng null.

Hợp đồng kết luận "không gắn nhãn ngược được" — **đúng với engine, không đúng với web**. Engine không re-deliver được 2.500 bài cũ; nhưng dtw-web sở hữu DB của chính nó và backfill được trong đúng migration thêm cột:

```sql
ALTER TABLE articles ADD COLUMN content_type varchar DEFAULT 'article';
UPDATE articles SET content_type = 'article' WHERE content_type IS NULL;   -- 1.661 hàng
ALTER TABLE articles ALTER COLUMN content_type SET NOT NULL;
-- lặp lại y hệt cho bảng version `_articles_v` (Articles bật versions.drafts — Articles.ts:38)
```

Sau bước này cột không bao giờ `NULL`, và filter trở thành `contentType: { not_equals: 'daily-brief' }` — phẳng, an toàn, không cần `or: [{exists:false}, …]` ở 20 chỗ.

**Đừng bỏ quên `_articles_v`.** Articles bật `versions: { drafts: true }`, migration Payload sinh ra thường chạm cả hai bảng; backfill thiếu bảng version sẽ làm draft/preview lệch với published.

Ghi chú phòng hờ: nếu muốn ship lọc **trước** khi có migration, `slug: { not_like: 'morning-brief-' }` là an toàn với NULL (cột `slug` là `required` nên không bao giờ null) — nhưng `like` của Payload là *contains*, không neo đầu chuỗi, và phải nhân đôi điều kiện ở 20 helper × 2 tầng. Chỉ nên coi là băng dán tạm.

---

## 5. Hai hướng — so sánh

### Hướng A — nhận theo hợp đồng engine (brief là article có nhãn)

Brief vào Articles như hiện tại; web thêm 1 field, lọc khớp dương, rồi dùng chính field đó để dựng `/briefing` và BriefBand.

**Việc phải làm**
1. `Articles.ts`: thêm `contentType` select `article | daily-brief`, `defaultValue: 'article'`, tab Provenance, `admin.readOnly` với role thấp.
2. Migration + backfill hai bảng (§4) + `payload:generate-types`.
3. `intake/route.ts`: đọc `body.contentType`, whitelist đúng `'daily-brief'`, còn lại → `'article'`.
4. `payload-server.ts`: export một `Where` dùng chung (vd `NOT_BRIEF`) và spread vào ~11 helper feed. Chừa `getArticleBySlug`, `getArticlesByIds`, `getArticleBySlugDraft`.
5. `cms-client.central.ts`: tương đương — **cần thêm tham số ở Central** (xem §3.1). Nếu Central chưa sẵn sàng, ghi rõ là gap và giữ `CMS_SOURCE` ở local cho tới khi xong.
6. `most-read.ts`: loại brief sau khi hydrate (dễ — đã có bước lọc `sponsored`).
7. `article-content.tsx`: brief **không tính** vào paywall meter và không bị chặn.
8. Author: **không** để intake sinh "Staff Writer". Hoặc seed sẵn một Author `DTW Briefing Desk` với role phù hợp, hoặc cho intake nhận diện brief và gán vào một author desk cố định.
9. Template bài brief: bỏ `CoverArt` giả, thêm dòng disclosure không tắt được, related row riêng (hoặc bỏ).
10. `/briefing` + BriefBand (§6).

**Được**
- Khớp đúng thứ engine đã ship; không phải đụng vào engine.
- `/briefing`, BriefBand, archive, RSS riêng đều query được ngay từ `contentType`/`tag`.
- Brief giữ URL `/article/<slug>`, có sẵn OG/metadata/i18n/share/save — không phải dựng lại tầng nào.
- Editor sửa brief sau khi đăng bằng chính `/admin` quen thuộc.
- Rollback = gỡ filter; không có bảng lạ nào bị bỏ lại.

**Mất / rủi ro**
- Diện tích sửa rộng (~11 helper × 2 tầng) và **không có test bảo vệ** — sót một helper là brief lọt lại đúng chỗ đó.
- Ở chế độ central, chưa tự đóng được (phụ thuộc Central).
- Brief nằm chung bảng `articles` ⇒ mọi truy vấn tương lai phải nhớ luật này. Cần ghi vào `all-context.md` như một invariant, không phải comment lẻ.

### Hướng B — BriefEditions riêng (theo `engine-composed-brief_PLAN_24-07-26.md`)

Collection riêng + route `/api/engine/intake/brief` + `getLatestBriefs` + BriefBand props-driven.

**Được**
- Sạch về mô hình: brief không bao giờ lọt feed vì nó không nằm trong `articles`. Không cần sửa 11 helper, không có bẫy NULL, không đụng `most-read`/paywall/author.
- Chống sửa-đè tốt hơn: plan thiết kế create-once, người sửa luôn thắng.
- Ở chế độ central không phải chờ Central (brief đọc thẳng Payload local).

**Mất / rủi ro**
- **Mâu thuẫn với thứ engine đã ship.** Plan giả định "admin engine chưa có code LLM" — sai từ 31-07-26. Engine đã có compose + admin review + cron publish. Chạy plan nguyên văn = dựng đường brief **thứ hai** song song với đường đang chạy cho briefasia/wtb.
- Phải sửa engine: thêm nhánh POST riêng cho dtw, khác hai tờ kia ⇒ `publish-briefs.ts` mọc case đặc biệt, `brief-payload.ts` hết "1 shape dùng chung 3 tờ".
- Mất miễn phí: URL `/article/<slug>`, metadata/OG, share, save, TimeAgo, i18n chrome — phải dựng lại cho một collection mới.
- Brief không tìm được bằng search, không vào RSS/sitemap trừ khi viết riêng.
- Trùng chức năng review: engine đã có human gate ở `/briefs`; plan thêm một gate thứ hai ở Payload (`status: review → published`). Hai nơi biên tập cho cùng một nội dung — đúng cái mà thiết kế của engine gọi là red flag.
- Đắt hơn hẳn: 1 collection + 1 route + migration + hooks + helper + 2 UI, so với 1 field + 1 filter dùng chung.

### Chốt

**Hướng A.** Lý do quyết định: engine đã ship và đang phục vụ 3 tờ bằng một shape payload chung; Hướng B bắt engine mọc nhánh riêng cho dtw để đổi lấy một mô hình dữ liệu đẹp hơn nhưng phải dựng lại toàn bộ tầng trình bày vốn đã có sẵn. Điểm mạnh thật của B — brief không lọt feed — đạt được ở A bằng một cột `NOT NULL` cộng một `Where` dùng chung.

⇒ `engine-composed-brief_PLAN_24-07-26.md` nên **archive kèm ghi chú lý do** (superseded bởi hợp đồng 04-08-26), không xoá — phần phân tích timezone/idempotency trong đó vẫn dùng lại được.

---

## 6. Trang hiển thị brief

### 6.1. Ràng buộc từ dữ liệu

Một brief = 1 article: `title` ("Morning Brief — August 5, 2026"), `dek` = intro, `body` Lexical gồm 6–10 khối `## tít` + 2–3 câu + link `[Read more →]` nội bộ, `publishedAt`, `tags: [daily-brief]`, không ảnh. Suy ra:

- **AM hay PM đọc từ slug prefix**, không có field riêng. `morning-brief-` → AM, `evening-brief-` → PM. Ngày cũng nằm trong slug (`YYYY-MM-DD`, giờ SGT) — đáng tin hơn `publishedAt` vì `publishedAt` là lúc cron đẩy, có thể trễ vài tick.
- **Không có ảnh** ⇒ layout brief phải là layout chữ. Đừng tái dùng card có `CoverArt`: nó sẽ sinh ảnh trừu tượng giả cho cả 730 số/năm và làm trang trông như feed bài thường.
- Muốn hiện **các mục bên trong** brief ở trang hub thì phải parse Lexical lấy heading — làm được nhưng là suy diễn ngược từ prose. Rẻ và trung thực hơn: hub hiện `title` + `dek` (intro) + số mục, click vào đọc bản đầy đủ.

### 6.2. Đề xuất cấu trúc

**`/briefing` — hub (thay hẳn placeholder).** Server component.

1. Header: kicker "The Brief" + h1 + một câu mô tả nhịp (07:00 / 18:00 SGT — copy hiện tại nói "Two daily emails", **sai**, phải sửa thành ấn bản web, email "coming soon").
2. **Số mới nhất**, đầy đủ: chip AM/PM + ngày, `title`, intro, và danh sách mục nếu chọn parse heading. Đây là phần làm trang có nội dung thật thay vì chỉ là mục lục.
3. **Lưu trữ**: nhóm theo ngày, mỗi ngày một hàng, hai ô AM · PM. Ngày thiếu một bản (thin-supply → engine skip) hiện đúng là thiếu, không lấp.
4. Dòng disclosure **không tắt được**: "Compiled by Dailytechwire newsroom systems; reviewed by editors before publication" (đúng ý G2 của plan cũ; cần EIC duyệt câu chữ).
5. Phân trang: 730 số/năm ⇒ **bắt buộc**. Mirror y hệt pillar: `/briefing` là canonical trang 1, `/briefing/page/[n]` cho trang sau — `[pillar]/pillar-view.tsx` đã có sẵn khuôn (metadata theo trang, self-canonical, `generateStaticParams` rỗng + `revalidate`).

**Trang một số brief:** giữ `/article/<slug>` làm canonical. **Đừng** tạo `/briefing/[date]` — sẽ thành nội dung trùng và hai URL cạnh nhau cho cùng một thứ. Nếu muốn URL đẹp thì redirect `/briefing/2026-08-05/am` → `/article/morning-brief-2026-08-05`.

**BriefBand trang chủ:** bỏ mảng hardcode, nhận props từ một helper mới (`getLatestBriefs` — 1 AM + 1 PM mới nhất, `tag=daily-brief` hoặc `contentType`, fail-open về `{am:null, pm:null}` để lỗi query không bao giờ làm vỡ trang chủ). Sửa luôn hai lỗi copy đang có trong file: nhãn tiếng Indonesia ghi **WIB** trong khi giờ là **SGT**, và giờ hiển thị 07:00/18:00 trong khi cron thật là 05:00/19:00 SGT — phải chốt một con số. `SHOW_BRIEF` giữ `false` làm cổng ra mắt.

**Điều hướng:** hiện `/briefing` không có lối vào nào. Cần thêm `{ id: "briefing", label: "Briefing", slug: "/briefing" }` vào `NAV_EXTRA` (`lib/data.ts:78`) hoặc gắn vào cột footer — không thì trang vẫn mồ côi dù có dữ liệu.

**Tuỳ chọn, không bắt buộc:** `/briefing/rss.xml` riêng (khuôn có sẵn ở `[pillar]/rss.xml`) — có giá trị vì brief vừa bị loại khỏi RSS chính.

### 6.3. Trang bài brief cần khác bài thường

- Bỏ hero `CoverArt` (không có ảnh thật thì đừng vẽ ảnh giả).
- Byline hiển thị dạng desk, không phải "Staff Writer, Singapore".
- Không tính vào paywall meter, không bao giờ bị chặn.
- Related row: thay bằng "số trước / số sau" hoặc bỏ — brief liên quan tới brief, không phải tới bài cùng pillar.
- Body: kiểm tra converter Lexical render `## heading` + link đúng — `article-body.tsx` dùng `RichText` với `defaultConverters` (chỉ override `upload`), nên heading/link đi đường mặc định. Cần xem mắt thật một số brief trước khi bật.

### 6.4. i18n / SEO

- Chrome dịch qua `t()` (invariant #9); **thân brief giữ nguyên tiếng nguồn** (invariant #10) — engine soạn tiếng Anh.
- Indexable, canonical `/briefing` cho trang 1; các trang sau self-canonical (đúng cách pillar đang làm).
- `/briefing` đã có trong `STATIC_ROUTES` của sitemap; các trang `/briefing/page/[n]` cần thêm.
- Cân nhắc: brief tóm tắt bài của chính DTW ⇒ có rủi ro cạnh tranh từ khoá với bài gốc. Hợp đồng khuyên để indexable mặc định rồi quan sát. Đồng ý — nhưng nên đo, không nên quên.

---

## 7. Câu hỏi cần chốt trước khi lập plan

1. **`CMS_SOURCE` production đang là gì?** Quyết định Hướng A đóng được trong repo này hay phải kéo theo Central. Đây là câu hỏi chặn.
2. **Giờ hiển thị**: cron thật 05:00 / 19:00 SGT, còn copy khắp nơi (BriefBand, `/briefing`, Newsletters seed) ghi 07:00 / 18:00. Chốt một bộ số rồi sửa đồng loạt.
3. **Author của brief**: seed một Author desk, hay thêm khái niệm author phi-người? Ảnh hưởng trang tác giả tương lai.
4. **Brief có vào Most Read / Search không?** Loại khỏi cả hai là mặc định an toàn, nhưng search thì tranh cãi được — người đọc có thể muốn tìm brief.
5. **Câu disclosure** — cần EIC duyệt.
6. **Thứ tự bật**: ship lọc trước, để `SHOW_BRIEF=false`, thêm `dtw` vào `BRIEF_PUBLISH_PUBS`, xem vài số ở `/admin` + `/briefing`, rồi mới bật band. Engine không cần deploy để bật/tắt.

---

## 8. Nguồn đã đọc

**dtw-web** — `lib/payload-server.ts` (900d), `lib/cms-client.ts`, `lib/cms-client.central.ts`, `lib/central-api.ts`, `lib/most-read.ts`, `lib/data.ts`, `app/api/engine/intake/route.ts`, `app/(reader)/page.tsx`, `app/(reader)/briefing/page.tsx`, `app/(reader)/[pillar]/{page.tsx,pillar-view.tsx}`, `app/sitemap.ts`, `app/llms.txt/route.ts`, `components/home/brief-band.tsx`, `components/home/home-hero.tsx`, `components/article/{article-content,article-body}.tsx`, `components/footer.tsx`, `payload/collections/{Articles,Newsletters}.ts`, `payload/hooks/revalidate.ts`, `payload.config.ts`, `scripts/seed-payload.ts`, `DTW_WEBSITE_REQUEST.xlsx` (3 hàng có "brief"), `process/general-plans/active/engine-composed-brief_PLAN_24-07-26.md`.

**content-engine** — `process/features/daily-brief/references/hop-dong-danh-dau-brief-cho-web_04-08-26.md` (toàn văn), `daily-brief-design_31-07-26.md` §7–§8, `supabase/migrations/016_daily_briefs.sql`, `admin/src/lib/{brief-configs,brief-payload,publish-briefs,dtw-intake-client}.ts`, `admin/src/app/api/cron/{publish-briefs,trigger-brief}/route.ts`, `admin/vercel.json`.

**brief-asia-web, wtb-web** — grep toàn repo: **chưa repo nào ship xử lý brief**.

**Production** — `www.dailytechwire.com` sitemap.xml, rss.xml, `/briefing`, hai URL brief thử nghiệm (đo 20-08-26).

---

# PHỤ LỤC — sau khi chốt 6 câu hỏi (20-08-26, cùng ngày)

Chủ dự án trả lời: (1) **central**, (2) theo cron thật, (3) seed author, (4) không vào Most Read/Search, (5) chờ giải thích, (6) bật luôn. Câu (1) làm đổi bản đồ công việc, nên phần này ghi lại phần verify bổ sung.

## P1. Xác nhận production đang chạy Central

`GET https://www.dailytechwire.com/api/health/cms` (đo 20-08-26):

```json
{"cmsSource":"central","envSaysCentral":true,"centralHost":"apcg-cms.vercel.app",
 "hasReadToken":true,"hasRevalidateSecret":true,"dashboardsStayLocal":true,
 "probe":{"ok":true,"articleId":5975,"slug":"openai-automated-privacy-shield-monitor-abuse-without-storing-data",
          "publishedAt":"2026-08-20T05:15:22.552Z","mediaHost":"apcg-cms.vercel.app"},"ms":310}
```

Không chỉ env — **code đang chạy** cũng đọc từ Central, và media đã absolutize đúng về host Central. Cutover đã xong thật.

## P2. Bài (và brief) đi vào Central, không vào Payload của repo này

- `admin/src/lib/dtw-intake-client.ts:173` gửi `publicationId: 'dtw'`; commit `0b94c97 fix(intake): send publicationId so the Central cutover is env-only` + `7351271 … align the three intake clients with the Central CMS response contract`.
- ⇒ Chuyển đích chỉ là đổi `DTW_INTAKE_URL`. Reader đọc Central và bài mới vẫn ra đều mỗi ~1h ⇒ `DTW_INTAKE_URL` đã trỏ Central.
- `https://apcg-cms.vercel.app/api/engine/intake` trả **400** (tồn tại, chỉ thiếu body), `/api/public/articles` trả **401** (tồn tại, cần token).
- Lưu ý: `content-engine/process/context/infra/all-infra.md:61` vẫn ghi "dtw → dtw-web `/api/engine/intake`" — **doc đó đã cũ so với code**. Đáng báo lại cho phía engine.

**Hệ quả lớn nhất:** `apps/web/src/app/api/engine/intake/route.ts` và các collection Payload trong repo này **không còn nằm trên đường dữ liệu của người đọc** (trừ 3 surface dashboards cố ý ở lại local: `aiModels`, `dashboardMethodology`, `sponsorSlots`). Mọi phân tích ở §3 về intake của repo này — kể cả chuyện tự tạo Author "Staff Writer" — **giờ áp cho Central, không phải cho đây**. Cần verify lại trên repo Central; hành vi có thể giống, có thể khác.

## P3. Bản đồ công việc sau khi biết là Central

| Việc | Repo | Ghi chú |
|---|---|---|
| Field `contentType` trên Articles + backfill `'article'` cho hàng cũ (+ bảng version) | **Central** | Làm 1 lần, dùng chung mọi tenant |
| `/api/engine/intake` đọc `contentType`, whitelist `'daily-brief'` | **Central** | |
| Tham số loại trừ trên `/api/public/articles` (vd `content_type=article` hoặc `exclude_content_type`) | **Central** | **Không có sẵn** — `FetchArticlesParams` chỉ có `locale, pillar, subsection, country, tag, q, ids, flag, page, limit, sort, after_*` |
| Author desk (câu 3) — không để intake sinh "Staff Writer" | **Central** | Verify hành vi intake của Central trước |
| Truyền tham số mới ở ~11 helper | dtw-web `cms-client.central.ts` | |
| Giữ parity ở `payload-server.ts` | dtw-web | Không còn là đường production, nhưng switch yêu cầu 2 module cùng chữ ký — và rollback bằng `CMS_SOURCE` chỉ có giá trị nếu bản local cũng đã lọc |
| Most Read loại brief (câu 4) | dtw-web `most-read.ts` | Lọc sau khi hydrate |
| Search loại brief (câu 4) | dtw-web + Central | `searchArticles` central dùng `q` — cần tham số loại trừ như trên |
| Paywall không tính/không chặn brief | dtw-web `article-content.tsx` | |
| `/briefing` hub + phân trang, BriefBand dữ liệu thật, template bài brief, mục nav | dtw-web | Chiều **lấy** brief đã có sẵn đường: `fetchArticles({ tag: 'daily-brief' })` |

⇒ Đúng như runbook của engine dự đoán ("nếu sắp cắt sang Central thì chỉ cần lọc một chỗ thay vì ba"): lọc ở Central một lần là phủ cả gcv/dtw, và phủ luôn briefasia/wtb khi hai tờ đó cắt sang.

⚠️ **Repo Central không có trên máy này.** `/home/hieunc/Code/APCG-web` chỉ là site tĩnh, không phải CMS. Không lập plan thi công phần Central được cho tới khi có repo.

## P4. Trạng thái engine hôm nay (runbook 07-08-26)

- `BRIEF_COMPOSE_PUBS = 'dtw,briefasia,wtb'` — **đang soạn hằng ngày từ 07-08**. Nghĩa là trong `/briefs` của admin engine đã có sẵn bản nháp dtw để xem chất lượng thật.
- `BRIEF_PUBLISH_PUBS` để trống — chưa đăng tờ nào.
- Bản không duyệt bị dọn sau **7 ngày** (`BRIEF_STALE_DAYS`).

## P5. Đính chính cho câu 2 (giờ hiển thị)

"Cron thật" là **giờ SOẠN**: 05:00 / 19:00 SGT. Nhưng runbook ghi rõ: *"Giờ lên web = giờ bạn bấm duyệt. Máy soạn xong 5h05 nhưng nếu 8h mới duyệt thì bản tin lên lúc 8h."*

⇒ Dán nhãn cứng "05:00 / 19:00 SGT" lên `/briefing` hoặc BriefBand là **hứa sai** chừng nào chưa bật tự động duyệt. Cách trung thực:

- mỗi số hiện **timestamp thật** của chính nó (`publishedAt`), không phải giờ lịch;
- copy nhịp phát hành nói định tính — "Twice daily · morning & evening SGT" — thay vì khoá hai con số;
- nếu muốn khoá đúng 05:00/19:00 thì phải bật auto-approve ở engine (runbook xếp việc đó sau 2 tuần chạy ổn).

Bỏ hẳn cặp 07:00/18:00 đang nằm ở `brief-band.tsx`, `briefing/page.tsx` và seed `Newsletters` (`seed-payload.ts:96-97`) — kể cả khi copy mới không nêu giờ, ba chỗ đó vẫn phải sửa cho khỏi mâu thuẫn.

## P6. Đính chính cho câu 6 (bật luôn)

`BRIEF_PUBLISH_PUBS` đang trống. Thêm `dtw` vào **trước khi Central ship filter** = brief lên hero 410px trang nhất 2 lần/ngày, vào `/latest`, vào RSS, vào Most Read, và tự nó bị paywall chặn (§3). "Bật luôn" chỉ an toàn theo nghĩa **không dark-launch nhiều nấc**: ship filter + trang hiển thị, rồi bật một phát cả `BRIEF_PUBLISH_PUBS` lẫn `SHOW_BRIEF` trong cùng một lần. Thứ tự tối thiểu không bỏ được:

1. Central: field + intake + tham số lọc (+ backfill).
2. dtw-web: truyền tham số ở cả 2 tầng, most-read, paywall, `/briefing`, BriefBand, template bài brief, nav.
3. Bật `dtw` trong `BRIEF_PUBLISH_PUBS` **và** `SHOW_BRIEF=true` cùng lúc.

## P7. Câu 5 — dòng disclosure là gì và vì sao phải hỏi EIC

**Nó là gì:** một câu đứng cố định nói cho người đọc biết bản tin này được tạo ra thế nào — máy soạn từ chính tin bài của DTW, và có biên tập viên duyệt trước khi đăng. Không tắt được, giống hộp disclosure của bài tài trợ.

**Vì sao brief cần mà bài thường không cần:** invariant #5 — DTW đã **bỏ** badge "AI-ASSISTED" và các hộp disclosure AI trong bài thường (quyết định sản phẩm 05-06-26). Nhưng brief khác về bản chất: bài thường là bài do máy viết rồi người biên tập, còn brief là **100% máy lắp từ template**, không có ai viết câu nào. Byline "DTW Briefing Desk" tự nó gợi ra một ban biên tập người thật. Không có câu nói rõ "desk" ở đây là gì thì trang đang trình bày sai về tác giả — đúng thứ mà "editorial integrity is the product" nói là không làm.

**Đã có sẵn một nửa:** engine chèn cuối body `_Compiled by DTW Briefing Desk from DailyTechWire reporting._`. Nhưng câu đó (a) nằm cuối trang, (b) **không nói có người duyệt**, (c) là nội dung trong body nên editor sửa/xoá được. Câu hỏi thật là: có nâng nó lên thành chrome cố định ở đầu trang không.

**Vì sao cần EIC:** đây là phát ngôn chính sách biên tập công khai, không phải microcopy. Và nó **đụng `/trust/ai`** — trang đó vẫn đang mô tả một chính sách công bố AI mà bài thường không còn tuân theo (KNOWN GAP của invariant #5). Thêm một câu mới ở `/briefing` mà không xử lý `/trust/ai` là để site nói hai điều khác nhau về cùng một chuyện.

**Ba lựa chọn để EIC chọn:**
- **A** (theo plan 24-07): "Compiled by Dailytechwire newsroom systems; reviewed by editors before publication." — nói cả cách tạo lẫn khâu duyệt.
- **B** (ngắn): "Machine-compiled from DailyTechWire reporting. Reviewed by an editor." — cùng nội dung, ít trang trọng hơn.
- **C**: không thêm chrome, giữ nguyên câu cuối body. **Không khuyến nghị** — sửa được, ở cuối trang, và im lặng về khâu duyệt.

Đặt ở: đầu `/briefing`, đầu mỗi trang bài brief, tooltip trên band trang chủ.

---

## P8. Verify repo Central (`/home/hieunc/Code/apcg-cms`, HEAD `7e54b41`)

### P8.1. Tin tốt: Central LÀ một điểm nghẽn chung

`src/app/api/public/articles/route.ts` (193 dòng) dựng **đúng một** mảng `and: Where[]` bắt đầu bằng `{ workflowStatus: { equals: "published" } }`, mọi tham số chỉ `and.push(...)` vào đó, rồi kết thúc bằng **đúng một** `scopedFind`. Nghĩa là một dòng `and.push` phủ hết mọi chế độ: `ids`, `q`, `flag`, `pillar`, `subsection`, `tag`, `author`, `country`, `after_*`, và cả **`view=refs`** (đường mà sitemap/feed dùng để liệt kê).

⇒ **Đảo ngược đánh giá ở §8 của hợp đồng engine** ("dtw-web nặng nhất — 13 helper query riêng lẻ, không có điểm nghẽn"). Nhận định đó đúng với dtw-web *trước* cutover. Sau cutover, mọi đường đọc của reader đi qua một endpoint Central duy nhất, và endpoint đó có chỗ nghẽn. Lọc brief ở đây rẻ hơn hẳn — và phủ luôn mọi tenant.

### P8.2. Trạng thái Central hôm nay

| Kiểm | Kết quả |
|---|---|
| `contentType` trong Central | **không tồn tại** — grep toàn `src/` không có `contentType` / `content_type` / `daily-brief` |
| Tham số lọc theo loại nội dung | không có (`locale, page, view, limit, sort, ids, q, flag, pillar, subsection, after_published_at, after_id, author, tag, country`) |
| Intake tự tạo Author | **có, y hệt dtw-web** — `resolveOrCreateAuthor` (`api/engine/intake/route.ts:476-486`) tạo với `role: "Staff Writer"` (hằng số dòng 50) và `city` suy từ timezone của tenant |
| `Authors.role` | `type: "text"` tự do — seed một desk author là chuyện nhỏ |
| Migrations | Payload migrations chuẩn (`src/migrations/`, mới nhất `20260805_023748_add_pinned_until`), chạy tự động ở `vercel-build` qua `scripts/migrate-prod.mjs`. Thêm cột = `payload migrate:create` rồi chèn tay câu backfill |
| Bài đơn `/api/public/articles/[slug]` | route riêng, **không đụng vào** — trang brief phải mở được |

### P8.3. Hai cái bẫy riêng của Central

1. **Articles có localized fields** (`title`, `dek`, `body`, `bio`…). `contentType` phải để **non-localized** — một bài chỉ có một bản chất, không phụ thuộc ngôn ngữ. Localized nhầm sẽ sinh cột theo locale và filter hụt ở locale chưa dịch.
2. **Đã có một field tên `briefs`** trên Articles (`Articles.ts:110-118`, array `label/value/source` — khối số liệu của bài, không liên quan gì). Đừng đặt tên gì mới có chữ "brief" nữa; dùng `contentType` như hợp đồng.

### P8.4. Thiết kế tham số đề xuất

Thêm `content_type` vào `/api/public/articles`, **tùy chọn**, mặc định không lọc:

| Giá trị | Ý nghĩa |
|---|---|
| vắng mặt | không lọc — **giữ nguyên hành vi hiện tại**, gcv/briefasia/wtb không bị ảnh hưởng gì |
| `article` | loại brief (dùng cho hero, `/latest`, pillar, related, RSS, sitemap, search) |
| `daily-brief` | chỉ brief (dùng cho `/briefing` và BriefBand) |

Chọn tham số tường minh thay vì mặc-định-loại-trừ vì: (a) không đổi ngầm hành vi của tenant khác đang chạy production; (b) đúng tinh thần hợp đồng — Central lưu *bản chất*, mỗi web tự quyết *bề mặt nào lọc*.

⚠️ **Chế độ `ids` không được lọc.** `ids` là đường phân giải theo id cho rail Saved / History của tài khoản (và cho `getArticlesByIds` mà Most Read dùng để hydrate). Người đọc đã lưu một bản brief thì phải thấy lại nó. dtw-web chỉ cần **không** truyền `content_type` ở các call-site đó, và lọc Most Read trong bộ nhớ sau khi hydrate.

### P8.5. Câu 3 (seed author) — cách thực hiện

Vì `resolveOrCreateAuthor` tìm theo `name` trước rồi mới tạo: chỉ cần **seed sẵn** một Author trong tenant `dtw` tên đúng `DTW Briefing Desk` với `role` phù hợp (xem §P11), thì intake sẽ nối vào hàng đó và **không bao giờ** tạo "Staff Writer". Không phải sửa code intake. Làm cùng lúc cho `briefasia`/`wtb` nếu hai tờ đó sắp bật.

### P8.6. Doc của Central phải cập nhật cùng patch

- `docs/08-content-engine-integration.md` — hợp đồng intake (thêm `contentType`)
- `docs/09-website-integration.md` — hợp đồng public API (thêm `content_type`)

### P8.7. Bản đồ công việc rút gọn sau P8

**Central** (1 patch): field `contentType` non-localized + backfill `'article'` cho hàng cũ (+ bảng version) · intake đọc và whitelist · 1 `and.push` + parse tham số ở `public/articles` · seed author desk cho tenant dtw · 2 file docs.

**dtw-web** (1 patch): truyền `content_type=article` ở các helper feed trong `cms-client.central.ts` (và parity ở `payload-server.ts`) · **không** truyền ở `ids` · lọc Most Read sau hydrate · paywall miễn brief · `getLatestBriefs` + `/briefing` hub + phân trang · BriefBand dữ liệu thật · template bài brief · mục nav · sửa 3 chỗ copy giờ.

**Vận hành**: seed author → deploy Central → deploy dtw-web → thêm `dtw` vào `BRIEF_PUBLISH_PUBS` **và** `SHOW_BRIEF=true` cùng lúc.

---

## P9. "Cần EIC duyệt" nghĩa là gì — và mâu thuẫn với `/trust/ai`

### P9.1. Không có EIC thật

`process/features/about-trust/_GUIDE.md:44-48`: **"Cheryl Tan — name chosen as a placeholder"**, không có tiểu sử (các bản nháp bịa Reuters/Pulitzer đã bị bác và cấm tái sinh). Masthead lãnh đạo cũng ẩn danh, 5 vai trò không tên. `/newsroom` còn nợ nội dung bịa (bureau, masthead 8 người, career history) — backlog riêng.

⇒ "EIC duyệt" trong các ghi chú trên **thực tế là chủ dự án quyết**. Dùng chữ EIC vì đây thuộc loại quyết định của tổng biên tập (chính sách biên tập công khai), không phải quyết định kỹ thuật hay microcopy.

### P9.2. `/trust/ai` đang hứa 4 điều; brief phá 3

Trích nguyên văn `apps/web/src/app/(reader)/trust/[slug]/trust-content.tsx:188-238`:

| Trang đang nói | Brief thực tế | Kết |
|---|---|---|
| *"Use cases we don't: **Generative writing of body copy**, generative image creation, fabricated quotes…"* | brief là 100% body copy do LLM sinh | ❌ phá thẳng |
| *"**Every byline is a human.** Every fact is human-verified. If something is wrong, a human is responsible."* | byline `DTW Briefing Desk` không phải người | ❌ phá thẳng |
| *"Articles that use AI … carry an 'AI-assisted' label at the top, middle, and bottom… The label cannot be turned off."* | nhãn này **đã gỡ khỏi mọi bài từ 05-06-26** (invariant #5) | ❌ trang đang nói sai **ngay hôm nay**, chưa cần brief |
| *"Translation, transcription, **summarisation of public documents**, search-style retrieval… **Always reviewed by a human reporter before publication**."* | brief có human gate bắt buộc ở `/briefs` | ✅ đạt — chỗ bấu víu duy nhất |

Mấu chốt: "summarisation" có thể hiểu là bao gồm brief, nhưng "generative writing of body copy" thì loại thẳng. **Hai câu trong cùng một trang mâu thuẫn nhau khi áp vào brief.** Phải có người quyết brief nằm bên nào của lằn ranh, rồi sửa trang cho khớp.

Đăng brief mà không đụng `/trust/ai` = site xuất bản đúng thứ mà trang chính sách của chính nó nói là không xuất bản.

### P9.3. Ba quyết định cần chốt (không phải một)

1. **Brief nằm ở đâu trong chính sách AI?**
   - (i) nới mục "allowed" để gồm "machine-composed digests of our own reporting, editor-reviewed" — phải sửa luôn mục "don't" cho hết mâu thuẫn;
   - (ii) tách brief thành **loại nội dung riêng**, không phải "article", trang AI dành riêng một đoạn — sạch nhất về logic và **khớp đúng với việc đang thêm `contentType`**;
   - (iii) hoãn đăng brief tới khi viết lại toàn bộ chính sách AI — an toàn nhất, chậm nhất.
2. **Câu disclosure** — A / B / C (§P7).
3. **`role` của author desk** — chữ này hiện dưới mỗi byline brief nên là phát ngôn công khai. Không seed thì intake ghi `"Staff Writer"`.

### P9.4. Phạm vi tối thiểu cho `/trust/ai`

Không cần viết lại cả trang (đó là món nợ riêng của invariant #5). Tối thiểu: (a) sửa mục **Labels** vì nó đang mô tả một nhãn không còn tồn tại; (b) thêm một đoạn nói brief là gì và được duyệt thế nào; (c) chỉnh câu **Human accountability** để nó vẫn đúng khi có byline dạng desk (vd "mỗi bản tin đều có một biên tập viên là người chịu trách nhiệm duyệt"). Ba việc này brief bắt buộc phải kéo theo — phần còn lại tách riêng.

---

## P10. QUYẾT ĐỊNH 20-08-26 — bỏ qua nhánh disclosure/EIC

Chủ dự án chốt: **bỏ qua toàn bộ vấn đề ở §P7 và §P9.** Ghi lại để agent sau không dựng lại chuyện đã quyết.

Hệ quả, áp dụng cho mọi plan phát sinh từ doc này:

- **Không** thêm dòng disclosure dạng chrome trên `/briefing`, trang bài brief, hay tooltip band. Giữ nguyên câu engine đã chèn cuối body (`_Compiled by DTW Briefing Desk from DailyTechWire reporting._`) — không thêm, không nâng cấp.
- **Không** sửa `/trust/ai` trong phạm vi việc brief. KNOWN GAP của invariant #5 vẫn là KNOWN GAP, không mở rộng, không đóng.
- **Không** đưa câu hỏi "brief nằm ở đâu trong chính sách AI" vào plan.
- Việc duy nhất còn lại từ nhánh này là kỹ thuật, không phải chính sách: **seed Author desk** cho tenant `dtw` để `resolveOrCreateAuthor` không tự ghi `role: "Staff Writer"`. Đây không phải lựa chọn — không seed thì giá trị đó xuất hiện mặc định. Giá trị chốt ở §P11. Đổi được bất cứ lúc nào bằng một lần sửa trong `/admin` của Central, không cần deploy.

⚠️ Đừng diễn giải mục này thành "brief không cần đánh dấu gì". Field `contentType` vẫn làm — nó là hạ tầng lọc, không phải công bố biên tập.


---

## P11. QUYẾT ĐỊNH 20-08-26 — chữ cho Author desk

Chủ dự án chốt: **role viết chung chung theo kiểu toà soạn, không dùng chữ gợi máy móc.** "Newsroom systems" bị bác vì nghe như AI.

Giá trị seed cho tenant `dtw` trên Central:

```
name: "DTW Briefing Desk"        ← KHÔNG đổi được
role: "Dailytechwire Newsroom"
city: "Singapore"
```

`name` phải đúng từng ký tự vì `resolveOrCreateAuthor` khớp theo `name`; lệch một chữ là intake đẻ ra một Author mới với `role: "Staff Writer"` — đúng thứ việc seed này sinh ra để tránh.

**`role` là chữ công khai, không phải ghi chú nội bộ** (điểm này không hiển nhiên, kiểm 20-08-26):

- `apps/web/src/components/article/article-content.tsx:175` render `{authorRole} · {authorCity}` ngay dưới byline ⇒ trang bài brief hiện **"Dailytechwire Newsroom · Singapore"**.
- `apps/web/src/lib/metadata.ts:241` đẩy nó vào JSON-LD làm `jobTitle` của Person ⇒ Google đọc được.
- `authorCity` còn hiện trên card Most Read (`most-read.tsx:143`), tuy brief đã bị loại khỏi băng đó.

"Singapore" đúng sự thật — toà soạn APCG đặt ở Singapore.

Không mở lại nhánh disclosure/`/trust/ai` (§P10 vẫn nguyên hiệu lực). Đây thuần tuý là chọn chữ cho một trường dữ liệu.
