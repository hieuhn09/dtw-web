# AI Leaderboard - Data spec cho design (bàn giao UI)

Ngày: 30-07-26 · Nguồn dữ liệu: LLM Stats API (đã kiểm chứng bằng key thật) · Mẫu tương tác: `demos/ai-leaderboard-table-preview.html` (mở file là chạy, có dark/light)

## 1. Bảng chính - 11 cột

| Cột | Kiểu dữ liệu | Giá trị mẫu (thật) | Quy tắc hiển thị |
|---|---|---|---|
| # | số thứ tự 1..n | 1 | Vị trí SAU khi sort - đổi theo cột đang sort; mono, nhỏ, màu muted |
| Model | text (biên tập đặt) | GPT-5.6 Sol · Claude Opus 5 · Kimi K3 | Font serif đậm 14px; bên dưới là dòng phụ Organization |
| ↳ Organization | text | OpenAI · Anthropic · Moonshot AI · Zhipu AI | Dòng phụ 11.5px màu muted, ngay dưới tên model |
| General | số thực, 1 chữ số lẻ, dải thực tế ~46-58 | 58.0 | Thanh bar + số. **Cột sort mặc định** (giảm dần). Đây là điểm tổng hợp |
| Reasoning | như trên, ~46-58 | 58.1 | Thanh bar + số |
| Coding | như trên, ~35-50 | 50.1 | Thanh bar + số |
| Math | như trên, ~33-47, **có thể trống** | 36.8 hoặc – | Thanh bar + số; trống hiện "–" |
| Search | như trên, ~17-35, **hay trống nhất** | 28.9 hoặc – | Như trên (14/20 model có dữ liệu) |
| Vision | như trên, ~23-42, có thể trống | 38.2 hoặc – | Như trên |
| Input $/M | tiền USD, 2 số lẻ, có thể trống | $5.00 · $0.95 · – | Mono, căn phải; giá trị 0 → chữ "free" màu xanh (--up) |
| Output $/M | như trên | $30.00 · $3.00 · – | Như trên |
| Released | ngày, có thể trống | Jul 9, 2026 · – | Mono, căn phải, format "MMM D, YYYY" |

**Bản chất 6 cột điểm (nói rõ với designer):** đây là TrueSkill conservative rating (μ−3σ) - KHÔNG phải phần trăm, không có max 100. Thanh bar chuẩn hoá theo model dẫn đầu của TỪNG cột (leader = bar đầy). Số luôn hiện cạnh bar, 1 chữ số thập phân, font mono tabular để thẳng cột.

## 2. Trạng thái & quy tắc chung

- Số dòng: khởi điểm 8 (biên tập thêm dần, thiết kế thoải mái cho ~8-25 dòng)
- Mọi cột đều sort được: click tiêu đề, mũi tên ▲▼ màu accent trên cột đang sort; giá sort tăng dần mặc định, điểm giảm dần
- Ô trống thống nhất "–" (màu muted-2)
- Zebra rows nhẹ; hàng KHÔNG click được (không có trang chi tiết model trong phase này)
- Bảng cuộn ngang trong khung riêng trên mobile - trang không cuộn ngang
- Dark mode bắt buộc, dùng token DTW (bar: `--ai #3A4E8C` light / `#6B84D6` dark)

## 3. Thành phần quanh bảng (trên → dưới)

1. **Kicker**: "Data Desk · Preview" (mono, uppercase, chấm đỏ nhấp nháy) + **H1 "AI Leaderboard"** - viền dưới navy 3px, nền chấm mờ
2. **Caption** (mono nhỏ): `Sort by what you actually use the model for · Scores via LLM Stats, as of Jul 30, 2026` - ngày là lần cập nhật gần nhất
3. **Hàng pill "Optimize for:"**: General / Reasoning / Coding / Math / Search / Vision / Price (low) - pill active nền ink chữ paper; bấm pill = sort bảng theo tiêu chí đó
4. **Bảng** (mục 1)
5. **Dòng ghi nguồn** (bắt buộc theo license, không được bỏ): `Model scores & pricing: LLM Stats` - "LLM Stats" là link
6. **Khối Methodology**: văn bản ngắn (CMS, 3 ngôn ngữ) + dòng nghiêng "For informational purposes only · not investment or procurement advice"
7. **Sponsor card**: CHỈ hiện khi có sponsor được gán (trống = ẩn hoàn toàn, không placeholder). Nền `--sponsored`, viền `--sponsored-border`, gồm: label "Sponsor slot · this dashboard", "Brought to you by {tên}", dòng "Sponsorship does not influence the data or methodology."

## 4. Teaser trang chủ (card riêng)

- Label mono "AI LEADERBOARD" + title serif "This week's top models" + hint "filter by use case →"
- Bảng compact **4 dòng đầu**, cột: `# / Model (tên + hãng) / General / Reason / Code / $/M` - chỉ số mono, KHÔNG có bar
- Cả card click được → /dashboards

## 5. i18n + a11y (ràng buộc thiết kế)

- Mọi chữ trên giao diện có 3 bản EN/VI/ID (vd "free" / "miễn phí" / "gratis") - chừa không gian cho chuỗi dài hơn ~30%
- Tiêu đề sort là button thật (focus ring accent); pill có trạng thái pressed; bar có nhãn đọc được cho screen reader
- Contrast tối thiểu 4.5:1 cho chữ; số dùng tabular-nums

## 6. JSON mẫu 1 dòng (dữ liệu thật)

```json
{
  "model": "GPT-5.6 Sol", "org": "OpenAI",
  "general": 58.0, "reasoning": 58.1, "code": 50.1,
  "math": 36.8, "search": 28.9, "vision": 38.2,
  "inp": 5.0, "out": 30.0, "released": "2026-07-09"
}
```

Dòng có ô trống (thiết kế phải xử lý): `Claude Mythos Preview` - đủ 6 điểm nhưng inp/out/released đều null; `Grok 4.5` - có general/reasoning/coding nhưng math/search/vision null.
