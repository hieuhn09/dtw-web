# AI Leaderboard × LLM Stats API - Feature Design

Date: 2026-07-30
Status: APPROVED 2026-07-30 (decision 1 = swap approved; defaults taken for 2-4: coding automated, speed manual, 8 curated rows). Plan amended same day - see `active/dashboards-automation_PLAN_14-07-26.md` header note.
Inputs: DTW_WEBSITE_REQUEST.xlsx row "AI Leaderboard", `design/project/src/dashboards.jsx` (canonical UI), active plan Groups A-I, LLM Stats Stats API v1 docs (docs.llm-stats.com), working demo `demos/ai-leaderboard-demo.html`

---

## 1. Summary & recommendation

The approved (not yet executed) dashboards-automation plan feeds the AI Leaderboard from **two** sources: LMArena HF dataset (reasoning only, parquet, fuzzy slug join) + models.dev api.json (maker/price/ctx), leaving **coding and speed manual**.

**Recommendation: swap both adapters for a single LLM Stats adapter.** Everything else in the approved plan (schema shape, editorLocked, cron-never-creates-rows, weekly cadence, revalidateTag, CMS methodology/sponsor surfaces, a11y work) stays as approved.

| | Plan as approved (LMArena + models.dev) | Proposed (LLM Stats API) |
|---|---|---|
| Sources / adapters | 2 (parquet + JSON) | 1 (REST JSON, Bearer key) |
| Reasoning | LMArena arena score | ✅ `top_scores.reasoning` (+ `/v1/rankings` TrueSkill for methodology) |
| Coding | ❌ manual | ✅ automated (`top_scores.coding`) |
| Speed | ❌ manual | ❌ manual (no field in any schema - verified) |
| Maker / price / ctx | models.dev | ✅ `organization.name`, `providers[].input/output_price_per_m`, `context_window` |
| Join keys | 2 fuzzy slugs per row | 1 exact id (`sourceSlugLlmstats` = LLM Stats model id) |
| Known Unknowns | #1 parquet path/format, #2 price units | none of those; new smaller ones (§6) |
| License | CC-BY-4.0 + MIT, 2 attribution strings | Free reuse incl. commercial; single visible attribution + link (ToS verified 2026-07-30) |
| Cost / quota | $0 | $0, "unlimited", per-minute rate limits (generous vs weekly cron) |
| New risk | - | single-source dependency; API key env var; Cloudflare challenge can return 2xx HTML |

Spec fit (xlsx row): "SORT theo nhiều tiêu chí (suy luận / lập trình / giá / tốc độ); ghi rõ nguồn & cách chấm" → 3 of 4 criteria automated from one reputable source, source + methodology surfaced; "không chỉ 1 con số" → per-category scores, no composite (unchanged).

## 2. Data mapping (design column ↔ API field)

Designed table (canonical, `dashboards.jsx`): `# · Model · Maker · Reasoning(bar) · Coding(bar) · Speed(bar) · $/M tok · Context`. Row shape `AiLeaderboardRow { rank, model, maker, reasoning, coding, speed, price, ctx }` - **unchanged**.

| CMS field (`aiModels`) | Written by | LLM Stats source | Notes |
|---|---|---|---|
| `rank` | editor only | - | editorial override sort key (unchanged) |
| `model` | editor only | - | display name never cron-written (unchanged) |
| `maker` | cron | `organization.name` from `/v1/models/{id}` | |
| `reasoning` (0-100) | cron | `top_scores.reasoning` | ×100 if API returns 0-1 fractions - verify at first run |
| `coding` (0-100) | cron | `top_scores.coding` | **newly automated** (was manual) |
| `speed` (0-100) | editor only | - | stays manual; no throughput field exists in the API |
| `price` (USD/M) | cron | `min(providers[].input_price_per_m)` skip nulls; 0 = free | rankings' `min_input_price` unused (input-only, join needed anyway) |
| `ctx` ("512k"/"1M") | cron | `context_window` int → formatted | formatter: ≥1M → "xM", else round(k) + "k" |
| `sourceSlugLlmstats` | editor | `/v1/models` `id` | replaces both old slug fields; exact match, not fuzzy |
| `asOfScores` | cron | fetch timestamp (+ optionally max `updated_at`) | replaces `asOfArena`/`asOfPricing` pair |
| `editorLocked[]` | editor | - | unchanged; cron skips locked fields |

Optional per-run log-only extras (no schema change): `open_weight`, `release_date`, `benchmarks_evaluated` - available if the editor wants columns later.

## 3. Adapter design (`ai-llmstats.ts`, replaces `ai-lmarena.ts` + `ai-modelsdev.ts`)

- One cron path stays `ai-weekly` (`0 3 * * 1`), same bearer-guarded route contract (AD-8), same "GET+POST one handler", `maxDuration 60`.
- Fetch strategy (well under rate limits): one `GET /v1/models?limit=200` page walk (60/min) → index by `id`; for each CMS row matched by `sourceSlugLlmstats` map fields per §2. **No per-row `/v1/models/{id}` calls needed** - `ModelSummary` already carries `top_scores`, `providers`, `context_window`, `organization`. 8-row board = 1-2 requests/week.
- Env: `LLMSTATS_API_KEY` (server-only, never shipped to client). Key is free from llm-stats.com/developer.
- Hard-won failure handling (from the demo build): treat **2xx with non-JSON body as failure** (Cloudflare bot-challenge serves HTML with 200); parse error envelope `{error:{code,message}}`; on 429 respect `Retry-After`; single retry with jitter (plan pattern); adapter failure = no write, last-good data keeps rendering (unchanged).
- Runtime verifications on first real run (replaces old Known Unknowns #1/#2): (a) actual `top_scores` key names (map is untyped `additionalProperties: number` - "reasoning"/"coding" assumed, could be e.g. "code"); (b) score scale 0-1 vs 0-100; (c) id stability across model refreshes. Log-and-skip on mismatch, never guess.
- Cron still never creates rows; unmatched upstream ids logged and skipped (curated 8-row board unchanged - expanding coverage stays an open product question, §6).

## 4. Read path & UI (delta only - everything else per approved plan)

- `getAiModels()` / tag `dashboards:ai` / ISR / hooks / fallback to static seed: unchanged.
- Caption: `"Sort by what you actually use the model for · Scores via LLM Stats, as of {asOfScores}"` (t() en/vi/id).
- **Attribution line (blocking, license requirement):** `"Model scores, pricing & context: LLM Stats"` with visible link to https://llm-stats.com - replaces the LMArena/models.dev double attribution.
- Methodology CMS copy (seeded, editor-editable): scores are normalized per-category benchmark scores compiled by LLM Stats (source-verified where marked); rankings method TrueSkill; "For informational purposes only". Framing "Arena score" is dropped (that was LMArena vocabulary).
- No composite score, no CSV on AI tab, no stale badge, sponsor slot + methodology remain CMS-driven per plan (page-bottom section stays removed per design-chat decision; methodology lives behind the subline/CMS).
- Homepage teaser unchanged (prop-driven top-4 rows).

## 5. What this does NOT change

Groups A/D/E/F/H (plumbing, routes/metadata/404/loading, component a11y, teaser, Playwright funding spec), editorLocked semantics, weekly cadence, Vercel-cron-only scheduler, 2-cron-entry cap, no-scraping rule, i18n discipline, funding tracker entirely, AD-14 Yahoo override scope.

## 6. Open decisions (owner)

1. **Approve the source swap?** (this doc). If no - the approved LMArena+models.dev plan stands and this doc is shelved.
2. **Coding column**: accept automation now (recommended - it's free with the same fetch), or keep manual for editorial control.
3. **Speed column**: keep manual (recommended), hide until data exists, or later buy AA commercial / adopt OpenRouter throughput (previously researched, not adopted).
4. **8 curated rows vs expand**: unchanged default = curated 8 with editorial rank. LLM Stats tracks 380+ models; expanding = new product decision (auto-rank, pagination, teaser changes).
5. Image/video-gen models: explicitly deferred (user, 2026-07-30) - Stats API pricing schema can't represent per-image pricing anyway.

## 7. Gaps & phase-2 candidates

- No historical series in the API → if score/price trend charts are ever wanted, start snapshotting `aiModels` on each cron run (cheap now, impossible retroactively).
- `/v1/updates` (new-model feed) could power a "New this month" editorial widget or Wire Drop.
- Per-model verified/self-reported breakdown (`/v1/models/{id}.scores[]`) could back a model-detail drawer like the demo's - not in scope.
- Demo `demos/ai-leaderboard-demo.html` + `demos/serve-ai-leaderboard.mjs` remain the living API proof-of-concept (CORS quirk: browser-direct only from localhost:3000 - production is server-side anyway).

## 8. Live verification addendum (2026-07-30, real key, 335 models / 663 benchmarks)

Supersedes §2's `top_scores` mapping and §3's runtime-verification items:

- **Score source is `/v1/rankings` → `conservative_rating`**, NOT `top_scores`. `top_scores` values are benchmark-native mixed units (0-1 fractions alongside raw scores up to 1861) - not comparable. `conservative_rating` (TrueSkill μ−3σ, ~0-60 scale) matches the numbers llm-stats.com displays (leader reasoning 58.12 / code 50.13 vs site's 58.1 / 50.1). Rankings' `score` field is inconsistent - ignore it.
- Category ids verified: `reasoning`, `code` (canonical; `coding` aliases to the same data), plus `general` (= the site's "LLM Stats" composite column), `math`, `agents`, `vision`, `multimodal`, `long_context`, `finance`, `legal`, `healthcare`, `search`, `writing`, `tool_calling` - all return 200 with populated rows.
- **`context_window` is null for all 335 models** (list and detail) - `ctx` is editor-maintained in practice; adapter writes only if it ever turns non-null.
- Pricing (`providers[].input/output_price_per_m`) present for 85/335 models - all flagships covered. `model_type` is `llm` for the whole catalog (no image/video-gen entries). Speed/latency/knowledge-cutoff/country fields confirmed absent.
- Benchmark catalog: 663 entries with per-model scores via `/v1/models/{id}.scores[]` (clean `normalized_score` 0-1, verified/self-reported flags, per-benchmark `rank`). Notable ids: `gpqa`, `aime-2025` (114 models), `swe-bench-verified` (104), `arc-agi-v2`, `mmmlu` (49), `mmmu-pro` (64), `humanity's-last-exam` (91), `simpleqa` (46), `screenspot-pro`, `mcp-atlas`, `terminal-bench-2`, `tau2-retail`, `frontiermath`, `scicode`, `apex-agents`, `swe-bench-pro` (43), `browsecomp`, `charxiv-r`, `osworld-verified`, `toolathlon`, `mrcr` variants.
