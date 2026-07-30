# Dashboards Automation Research — 14-07-26

Feature: dashboards. Follow-up to `dashboards-completion-research_REFERENCE_14-07-26.md` after the user chose **API automation** over manual editorial entry.

> **DECISION (14-07-26):** User selected **Option PA3 — "max legal automation" (~$10/mo)**: Marketstack Basic daily stock cron (gated on written display-license confirmation) + free weekly AI leaderboard cron (LMArena CC-BY-4.0 + models.dev MIT) + manual funding-rounds entry with the free Tracxn journalist program. Rejected: PA1 all-manual (fails the automation goal), PA2 free-only (accepted as a fallback subset), PA4 LLM funding extraction (deferred to a later phase — largest build, touches dtw-engine), PA5 premium licenses $400–2,500/mo (cost disproportionate).
Method: 4 parallel scouts (repo constraints, stock-data APIs, funding-round APIs, AI-leaderboard sources — web research with 2026-current pricing/TOS) → synthesis. Re-verify vendor pricing at implementation time; the sector repriced repeatedly in 2026.

---

## Verdict per table

| Table | Automation? | Source | Monthly cost |
|---|---|---|---|
| Funding Tracker — stocks | **Yes** (daily EOD) | Marketstack Basic — only provider covering HKEX/KRX/TWSE/IDX/NSE/US with batch EOD + advertised commercial use under $10/mo. **Gated on written sales confirmation** that Basic covers public display on a news site. | $9.99/mo ($8.99 annual) |
| Funding rounds | **No** — stays manual | No affordable licensed API permits public display (Crunchbase ~$50k+/yr, Dealroom €20–50k/yr, PitchBook ~$30k/yr, CB Insights $30–100k/yr; cheap tiers are internal-use-only). Manual `fundingRounds` collection + free Tracxn Journalists & Publications program for verification. Phase 3: LLM extraction via dtw-engine as drafts, editor approval mandatory. | $0 |
| AI Leaderboard | **Yes** (weekly) | LMArena official HF leaderboard dataset (CC-BY-4.0) for Arena scores + models.dev api.json (MIT) for maker/price/context. Join via CMS-editable slug mapping (cross-source names are fuzzy). Visible attribution required. Do NOT republish OpenRouter's embedded Artificial Analysis indices (needs AA commercial license). | $0 |

**Total: ~$10/month** (or $0 on the manual-stocks fallback — same collections/UI, editors update ~12 rows weekly).

---

## Recommended architecture

The repo supports exactly one scheduler today: **Vercel cron → bearer-guarded route handler**. No `crons` key in vercel.json yet; BullMQ/Redis not installed; dtw-workers doesn't exist — don't design around them. Licensing-realistic data is EOD/delayed, so cadence collapses to daily/weekly, which fits even Vercel Hobby's once-per-day cron cap. The guide's 5-min refresh ambition is dead on arrival — formally abandon it.

### Write path (mirrors `/api/engine/intake`)

```
vercel.json crons
  → POST /api/dashboards/refresh/[source]   (constant-time bearer check on NEW env var
      DTW_DASHBOARD_REFRESH_TOKEN — never reuse ENGINE_TO_PAYLOAD_API_TOKEN; the
      integrations contract denies the Engine role access to dashboard data)
  → lib/dashboards/{stocks-marketstack.ts, ai-lmarena.ts, ai-modelsdev.ts}
      (thin adapters: fetch → normalize → rows; provider-swappable)
  → payload.create/update via Local API   (NEVER direct Postgres)
  → afterChange hook fires revalidateTag('dashboards')
  → server page reads via unstable_cache helper in payload-server.ts (tags, revalidate: 3600)
```

Route handlers run in request scope so `revalidateTag` works. One source per route, `export const maxDuration = 60`; runs are idempotent (upsert keyed on ticker/date) so a mid-run death heals next day.

### Collections (replace the hardcoded data.ts arrays)

1. **`dashboardTickers`** — one row per company: ticker, name, country, sector, exchange, currency, sharesOutstanding (editor-entered), isPrivate flag, latest px/chg/asOf denormalized. `editorLocked` string-array of field names — cron upsert skips locked fields, **humans always win** (lockedFields spirit). Private rows (VNG, Ola Krutrim) are manual-only. Fix the two fictional sample tickers first (KKDY → 377300.KS Kakao Pay, BKKM → BUKA.JK Bukalapak) — or replace editorially.
2. **`dashboardQuoteSnapshots`** — one row per ticker per trading day (ticker, date, close, currency). This IS the 30-day chart: compute a DTW equal-weighted index in the read helper from stored closes (no index licensing). Prune beyond ~120 days.
3. **`aiModels`** — rank, model, maker, per-dimension scores, price, ctx, per-source `sourceSlug` mapping fields + per-source `asOf`, same `editorLocked` override.
4. **`fundingRounds`** — manual entry: announced date, company, amount (USD-normalized), round, investors, sourceUrl, status draft/published. Aggregates (14-day total, deal count, **median** round — not average, single megadeals swing SEA totals ±80%+, top sector) computed in-house from published rows.

### Keys, limits, failure

- Env vars on Vercel (`MARKETSTACK_API_KEY`, `DTW_DASHBOARD_REFRESH_TOKEN`), documented in `.env.example`. **Skip the guide's DashboardSources encrypted-keys collection** — ceremony for 2 keys.
- Rate budget: Marketstack `/eod` batches 100 symbols/call → ~12 tickers = 1 req/day ≈ 30/month vs 10,000 quota. LMArena parquet + models.dev = 2 fetches/week. No backoff machinery beyond a single retry.
- Adapter failure = **no write**: last-good rows keep rendering; never write partial/zeroed data. Cron route returns 500 so Vercel surfaces it; optional `lastRunStatus` global for admin glance. No alerting infra Phase 1.
- Every row carries `asOf`; UI shows "Data as of {date} · EOD, delayed" (replaces "Sample data — coming soon"); stale badge if asOf > 48h on a trading day.
- Schedule stocks cron after US close (~21:30–22:00 UTC) so all exchanges have same-day EOD.

### Licensing obligations (blocking, not decorative)

- Marketstack: **written** confirmation Basic covers public display on a news site, before the feed goes live. Also confirm derived-data legality (mcap = sharesOutstanding × close; mcap field itself is only in the $149.99 tier).
- AI: visible credit line on dashboard + methodology: "Arena scores: LMArena (CC-BY-4.0) · Pricing & context: models.dev (MIT)". Label as "Arena score, as of {date}" — Bradley-Terry relative ratings, not accuracy percentages.
- Keep the "informational purposes only" disclaimer.
- Never yfinance/scraping — ToS-prohibited, disqualifying for an editorial-integrity brand.

### Required call-site refactor

TOP_MOVERS (`funding-tracker.tsx:48-53`), chart array (`big-chart.tsx:5-8`), teaser stats (`dashboards-teaser.tsx`) must all derive from the same Payload read helpers, or the table goes live while movers/teaser stay frozen.

---

## Phasing (lean)

**Phase 1 — data layer + free automation (build now):**
1. Create the 4 collections, seed from current data.ts arrays (fixing fictional tickers), add `dashboards` revalidate hook + unstable_cache helpers, refactor the 4 hardcoded surfaces to read from them. Every number becomes editor-controllable immediately.
2. Wire the **AI leaderboard cron** (LMArena + models.dev, weekly) — free, cleanly licensed, proves the whole cron→adapter→Local-API→hook pipeline. Add attribution footer.
3. Send the **Marketstack license email** + **Tracxn journalist application** (pr@tracxn.com) in parallel — letters, not code.

**Phase 2 — stocks feed (gated on written license confirmation):**
4. Marketstack adapter + daily cron + vercel.json `crons`; swap label to "As of {date} · EOD, delayed"; derive 30-day chart from snapshots.

**Phase 3 (deferred):** LLM extraction of funding rounds via dtw-engine (draft-only intake, editor approval gate); anything sub-daily/real-time (exchange redistribution fees — probably never worth it).

**Explicitly NOT building:** DashboardSources encrypted-keys collection, BullMQ/dtw-workers, any funding-rounds API integration, scraping, third-party index licensing. Rejected shortcut: fetching vendor APIs directly inside `unstable_cache` with no Payload writes — honors the letter of invariant #1 while gutting editor overrides, chart history, and the methodology surface.

---

## Key risks

- **License-before-build is binding.** Marketstack "Commercial Use" at $9.99 is pricing-grid marketing; the binding Idera/APILayer legal text isn't self-service readable. Every alternative self-serve tier (Twelve Data, EODHD, FMP, Finnhub, Alpha Vantage) explicitly prohibits public display. If Marketstack says no: negotiated EODHD/Twelve Data deal runs $400–2,500/mo → manual entry wins until traffic justifies it.
- Marketstack is mid v1→v2 API migration under the Idera portfolio — keep the adapter thin and swappable.
- Funding aggregates are statistically fragile (median, show counts, publish methodology).
- LLM-extracted amounts fail in known ways (IDR-trillions vs USD-millions, round-extension double counting, multi-outlet dupes) — draft-only intake non-negotiable.
- Cross-source AI name joins are fuzzy — CMS slug mapping, never string-match in code.
- Attribution omissions are license breaches (CC-BY-4.0/MIT) and reputationally worse for DTW.
- EOD timing skew across exchanges — per-row asOf + post-US-close schedule mitigates.
- 2026 vendor pricing is in flux — re-verify at implementation time.

---

## Addendum (14-07-26): "Is there a truly free stock-price source?" — No.

Follow-up web research (exchange-direct open data, free aggregators, embed widgets; all TOS-verified with URLs) answered the user's question: **no path is simultaneously free, legal, and delivers the full custom 12-ticker table.** Publicly displaying exchange equity prices on a commercial site is itself an exchange-licensed activity — every free API tier (Stooq, Alpha Vantage, EODHD, Twelve Data, Finnhub, Tiingo, FMP, GOOGLEFINANCE, Marketstack free) is personal/non-commercial.

- **Genuinely free AND legal exists for only 2 of 6 markets:** TWSE Taiwan Open API (data.gov.tw dataset 11549, OGDL v1 — explicit commercial use + redistribution) and Korea FSC API on data.go.kr ("no restrictions"). US EOD is near-free via any SIP-licensed vendor. **HKEX, NSE, IDX cannot be had free legally at all** (HKEX delayed redistribution alone is HK$15,000/quarter ≈ $7,700/yr; NSE & IDX sell EOD display as licensed products). The free-hybrid path would drop numbers for the 5 most editorially important tickers (Alibaba, Meituan, Paytm, GoTo, Bukalapak) — a different, worse product.
- **TradingView free widgets** cover all 12 tickers at $0 but surrender the custom table/CSV/chart, inject third-party scripts+cookies (conflicts with invariant #12 first-party-analytics posture and LCP/CLS budgets), and their ToS simultaneously advertises free embedding and states "we do not permit commercial usage of any of our services" — gray, needs written confirmation. StockDio/Investing.com widgets: explicitly revocable or unverifiable licenses.
- **Scraping paths** (NSE bhavcopy republication, yfinance, Stooq, GOOGLEFINANCE reuse, exchange-site scraping): disqualified, not gray, under DTW's editorial-integrity standard.

**Verdict: pay the $9.99** — Marketstack remains the only sub-$50/mo option delivering the full custom table legally. Keep TWSE + Korea FSC feeds documented as free fallback/cross-check sources, but don't build 3 adapters to save $9.99/mo. Full comparison in the workflow output (5 paths ranked incl. a $7,700+/yr direct-exchange-license ceiling).

## Open questions (user decisions)

1. Which Vercel plan does dtw-web deploy on? (Hobby caps cron at once/day, loose timing — fine for EOD; sub-daily needs Pro or external trigger.)
2. Budget approval for Marketstack Basic ~$10/mo — and go/no-go if sales says Basic does NOT cover public display (negotiate $400+/mo vs manual stock rows).
3. Is the newsroom willing to own weekly manual curation of funding rounds (~9–25 candidate deals/week for the Asia beat)? Determines whether that table ships in Phase 1.
4. Remap fictional tickers (KKDY→377300.KS, BKKM→BUKA.JK) or replace editorially?
5. Who owns the two external emails (Marketstack display-rights, Tracxn journalist program)?
6. Accept "EOD, delayed" as permanent product positioning (vs the guide's stale 5-min ambition)? Product decision — real-time Asia data = exchange redistribution fees.
7. AI Leaderboard: keep the curated 8-row shape with editorial overrides, or expand to whatever LMArena covers? Affects whether rank is computed or editor-assigned.
8. Phase 3 timing: LLM funding-round extraction this quarter, or hold until volume/traffic justifies it?
