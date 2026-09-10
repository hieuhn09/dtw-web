# Brief pipeline chết im lặng — điều tra và khôi phục

**Date**: 09-09-26
**Status**: ⏳ PLANNED (backlog — user chủ động hoãn 09-09-26 để ưu tiên chương trình rebrand)
**Complexity**: SIMPLE (nếu đúng nghi phạm) → MEDIUM (nếu phải lần sâu vào pipeline)
**Repo liên quan**: `dtw-web` (nơi phát hiện) + `content-engine` (nơi có nguyên nhân)
**Không thuộc chương trình rebrand.** Độc lập hoàn toàn — phát hiện tình cờ trong lúc audit rebrand 09-09-26.

> **Đây là sự cố production đang diễn ra, không phải cải tiến.** Trang chủ của một ấn phẩm bán "tech intelligence hằng ngày" đang hiển thị brief đề ngày 21/08 trong khi hôm nay là 09/09.

---

## Bằng chứng (đã kiểm chứng 09-09-26)

```bash
$ curl -sS https://www.dailytechwire.com/ | grep -oiE '(Morning|Evening) Brief[^<>]{0,40}'
Morning Brief — August 21, 2026
Evening Brief — August 20, 2026
```

Đối chiếu:

| Quan sát | Giá trị |
|---|---|
| Brief mới nhất trên production | 21/08/2026 |
| Ngày kiểm tra | 09/09/2026 |
| Khoảng chết | **19 ngày** |
| Brief band bật từ | commit `0c537e7` (20/08/2026) |
| Lịch cron | 2 lần/ngày (`content-engine/admin/vercel.json`: `0 21 * * *` và `0 11 * * *`) |
| Số lần cron đã chạy | ~38 |
| Số brief sinh ra | **0** |
| Pipeline bài thường | **vẫn khoẻ** — ~8 bài/ngày, RSS mới nhất 09/09 |

Kết luận: engine không chết. **Chỉ nhánh brief chết, và chết không báo lỗi.**

## Nghi phạm chính

`content-engine/.github/workflows/brief.yml:60`

```yaml
BRIEF_COMPOSE_PUBS: ${{ vars.BRIEF_COMPOSE_PUBS }}
```

Đây là **GitHub repo variable**, không phải file trong repo. Nếu biến rỗng hoặc bị xoá:
- không publication nào được compose
- workflow **vẫn exit 0, vẫn xanh**
- không alert, không log lỗi

Đúng "kiểu hỏng âm thầm #2" mà `process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md` đã liệt kê trong mục rủi ro chương trình — chỉ khác là nó đã xảy ra rồi, trước cả rebrand.

## Việc cần làm

1. **Kiểm GitHub repo variables** của `content-engine`: `BRIEF_COMPOSE_PUBS` có tồn tại không, giá trị là gì. Kỳ vọng theo `brief.yml:33`: `dtw,briefasia,wtb`.
   → *Chỉ user làm được — cần quyền truy cập GitHub repo settings.*
2. Nếu biến rỗng/thiếu: `gh variable set BRIEF_COMPOSE_PUBS --body 'dtw,briefasia,wtb'` rồi trigger lại workflow thủ công, xác nhận brief mới xuất hiện.
3. Nếu biến vẫn đúng: xem log 5 lần chạy gần nhất của `brief.yml`, tìm bước nào exit sớm.
4. Kiểm chéo phía Vercel cron (`content-engine/admin/vercel.json` → `/api/cron/trigger-brief`) — cron có thực sự được gọi không, hay chỉ workflow bị hỏng.

## Việc cần làm sau khi khôi phục (quan trọng hơn bản thân cái fix)

**Không có gì cảnh báo khi pipeline ngừng chạy.** Đó là lý do 19 ngày trôi qua mà không ai biết, và cùng lớp lỗ hổng đó sẽ che giấu cả 5 kiểu hỏng âm thầm mà chương trình rebrand đã cảnh báo (Vercel cron trỏ route đã đổi tên, GitHub variable fail-closed, CORS allowlist làm trống site, OAuth redirect URI, drizzle-kit snapshot).

Đề xuất tối thiểu: một health check so ngày của brief mới nhất với hôm nay, cảnh báo nếu lệch > 36 giờ. Rẻ, và bắt được đúng lớp lỗi này.

## Liên quan

- `content-engine/.github/workflows/brief.yml`
- `content-engine/admin/vercel.json`
- `content-engine/admin/src/lib/brief-payload.ts`
- Rủi ro "5 kiểu hỏng âm thầm": `process/features/rebrand/active/rebrand-opentechwire-umbrella_PLAN_08-09-26.md`
- Phase 5 của rebrand cũng đụng `content-engine` — nếu làm cùng lúc thì kiểm biến này trước, đừng để lẫn nguyên nhân
