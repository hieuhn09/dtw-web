# DTW Dashboards — Full-Automation (Zero Manual Entry) Research — 15-07-26

User goal: eliminate ALL manual data entry from the dashboards. Method: 3 scouts (VN stock APIs, funding-round auto-ingest, AI/mcap/private gap-fill) → synthesis. Supersedes the "Vietnam = manual Phase 1" and "funding = manual" assumptions in the earlier automation reference where noted below.

> **DECISION (15-07-26) — owner override:** User chose **Yahoo Finance as the stock-price source for ALL non-VN tickers**, explicitly accepting the ToS/redistribution risk ("pháp lý tính sau" — legal to be handled later). This **replaces Marketstack** ($9.99, license-clean but the market-cap-derivation + license-confirmation-email path). Consequences: (1) stock cron no longer gated on a Marketstack display-license email — it can ship active; (2) Yahoo `quoteSummary` returns `marketCap` precomputed, so the shares×price×FX derivation (Lanes B/C/D) is no longer needed for non-VN rows; (3) Vietnam's 7 tickers still can't come from Yahoo (UPCoM 404s; VNZ.VN is a different company) → use the Vietnamese source (VNDirect/TCBS/SSI) for all 7 VN tickers. Accepted risks now owned by the user: Yahoo ToS (automated access + public redistribution barred), and datacenter-IP rate-limiting (mitigate with last-good cache + retry/jitter + optional residential proxy; low risk at dtw's once-daily ~28-symbol volume). This decision is deliberate — do not "fix" it back to a paid feed without the owner.

---

## Verdict

True zero-manual is achievable for **most** of the dashboard, not all — and the split is structural, not a tooling gap.

- **Cleanly full-auto, zero-human-per-run:** VN stock EOD price/%change (7 tickers incl. UPCoM), Asia market cap (~28 tickers, derived), VNG/VNZ (it's **listed** on UPCoM, not private), AI leaderboard coding/reasoning columns.
- **Auto but risky if fully unattended:** LLM-extracted funding rounds — currency normalization, rumor-vs-confirmed, extension double-counting, cross-outlet dedup are exactly where LLMs fail on numbers. A single IDR/VND unit misread = a 100–1000× error landing in DTW's public corrections log.
- **Fundamentally not automatable:** private-company valuations (e.g. Ola Krutrim) — the number only exists after a disclosed funding event; nothing to poll between events.

**Key upgrade vs prior research:** Vietnam stocks CAN be fully automated (VNDirect dchart / SSI FastConnect / TCBS, all Node-callable) — the earlier "VN stays manual" constraint is removed. Market cap can be auto-derived. Only Ola Krutrim is truly manual.

---

## Architecture — cron lanes (all Node route handlers on Vercel; writes via Payload only; no Python microservice)

| Lane | Schedule | Job | Sources (primary → fallback) |
|---|---|---|---|
| **A — VN stocks EOD** | ~08:30 UTC (after HOSE close) | %change for FPT, CMG, MWG, VTP, CTR, VGI, VNZ | VNDirect dchart UDF (free, no auth, covers UPCoM) → **SSI FastConnect** (official, license-clean anchor) → TCBS (free cross-check) |
| **B — Asia market cap** | Daily, staggered by region | mcap = close × shares × FX (USD) | Marketstack `/eod` (licensed) × cached shares → Yahoo `quoteSummary.marketCap` fallback |
| **C — Shares outstanding** | Weekly | refresh shares for mcap math | TCBS/VNDirect (VN); Yahoo `defaultKeyStatistics` / Twelve Data (Asia) |
| **D — FX rates** | Daily, before B | USD normalization incl. VND + TWD | exchangerate-api.com (no key) → fawazahmed0 currency-api (CDN). NOT Frankfurter (lacks TWD/VND) |
| **E — AI leaderboard (coding/reasoning)** | Weekly | coding + reasoning columns | LiveBench (Apache-2.0) + LMArena HF (CC-BY-4.0) + Epoch AI (CC-BY) |
| **F — AI leaderboard (speed)** | Weekly | throughput/latency (optional) | OpenRouter throughput (only free + display-legal), labeled "throughput via OpenRouter", pinned provider |
| **G — Funding ingest** | Every 2–6h | RSS → LLM extract → stage → trust gate | DealStreetAsia/e27/KrASIA/Tech in Asia + Entrackr/Inc42/YourStory RSS; extraction via **dtw-engine** to strict JSON |

**Market cap:** `mcap_usd = close (Marketstack, licensed) × shares (cached quarterly) × fx_to_usd (dated)` — keeps the price side fully licensed; only quarterly shares touch an unofficial source. VNG = ticker **VNZ.VN** (thinly traded — timestamp it).

**Funding trust gate (Lane G):** extract → `funding_staging` → auto-publish ONLY if ALL hold: ≥2 independent non-rumor outlets agree on company+amount+currency+round; amount USD-native OR high-confidence normalized w/ dated FX; not from a rumor feed; passes entity/round dedup (no extension double-count); LLM self-confidence above threshold; sanity bounds (flag >$500M or >3 orders-of-magnitude currency ambiguity). Everything else → **one-click approval queue** (a ~5-second review glance, NOT data entry). Aggregates recompute only from the published tier.

**Private valuations:** automate event-detection only (dtw-engine flags "X raises $Y"); human confirms the figure from the disclosure; render event-stamped ("as of Apr-2024 round"), never as a live metric.

**Shared guardrails (make "zero-human" hold):** staleness guard (reject non-current bars), sanity bounds (|%change|>~20%, null/zero closes), cross-source check (VNDirect vs TCBS mismatch → skip+alert), corporate-action reconciliation (adjusted series → avoid false −30% on ex-div/split), last-good cache + alert per unofficial source, model-name normalization map (LMArena↔models.dev↔LiveBench↔OpenRouter) with unmatched-model alert. Human is **on-exception only**.

---

## By data class

| Data class | Source | Fully auto? | Residual risk |
|---|---|---|---|
| VN stock EOD price/%change (7, incl. UPCoM) | VNDirect dchart → SSI → TCBS | **Yes** | Undocumented endpoints; corporate-action false %change; exchange licensing (SSI = clean anchor) |
| Asia market cap (~28) | Marketstack close × shares × FX → Yahoo fallback | **Yes** | Yahoo ToS if fallback used; shares drift; FX correctness |
| VNG/VNZ mcap | Yahoo VNZ.VN / dchart × FX | **Yes** (listed, not private) | Thinly traded — timestamp |
| FX | exchangerate-api → fawazahmed0 | **Yes** | Must cover VND+TWD |
| AI coding/reasoning | LiveBench + LMArena + Epoch | **Yes**, free, display-safe | Model-name normalization |
| AI speed | OpenRouter throughput | **Yes** if labeled | Provider-caveated (~10× spread); AA free tier is internal-use-only — don't display |
| Funding rounds | dtw-engine LLM extract + trust gate | **Majority auto**, minority queued | Currency/unit catastrophe; rumor; dedup; LLM numeric error 10–27% |
| Private valuations (Krutrim) | event-detect + human confirm | **No** — un-pollable by design | Stale valuation shown as current = self-inflicted correction |

---

## Costs

**Baseline: ~$10/month incremental** (Marketstack $9.99 already counted). VN sources (VNDirect/TCBS/SSI), FX, AI leaderboard feeds, RSS = all free. LLM extraction via already-deployed dtw-engine = low tens of $/mo. No Python microservice, no extra deploy = $0.

**Optional:** Event Registry/NewsAPI.ai for funding dedup ~$90/mo (free tier 2,000 searches); Twelve Data Grow ~$29/mo for licensed Asian mcap instead of Yahoo; Artificial Analysis Commercial (quote) only if you must display authoritative AI speed.

**Rejected (cost/license):** Crunchbase, Harmonic (~$25k/yr), Tracxn enterprise, DealStreetAsia DATA VANTAGE, PitchBook, Dealroom — all bar public redistribution and/or blow the budget by 3–4 orders of magnitude.

---

## Key risks

- **Currency/unit catastrophe (funding):** local-currency misread by an order of magnitude = 100–1000× error in the corrections log. Gate all non-USD-native amounts to the queue.
- **Exchange-data licensing:** HK/KR/TW/JP/VN prices are exchange-owned; a public dashboard off unofficial broker JSON may need a license — SSI FastConnect is the license-clean feed to anchor on.
- **Unofficial-endpoint fragility:** VNDirect/TCBS/Yahoo have no SLA, can change schema / block Vercel IPs / return garbage under HTTP 200 → staleness guard + cross-source + last-good cache.
- **Corporate actions:** adjusted series make ex-div/split days look like −30% crashes (VGI has had large actions) → reconcile before publish.
- **LLM numeric baseline:** field accuracy 65–80%, numeric-transform error 10–27% → unattended funding publish will emit wrong rows over time. Hard gate = source-grounded extraction (quote exact sentence) + confidence + multi-outlet corroboration.
- **Aggregate compounding:** totals amplify every wrong/double-counted row → recompute only from published tier.
- **Speed-column trap:** AA free tier is internal-use-only; OpenRouter is the only free display-legal source (label it or drop the column).
- **Brand asymmetry:** for DTW a wrong number is a correction on its core promise — set the funding auto-publish bar conservative; track human-queue rate as a KPI.

---

## Recommendation — tiered build (do NOT chase literal zero-human everywhere)

- **Tier 1 — Full auto, zero-human/run (build now):** VN stocks, Asia market cap incl. VNZ/VNG, AI coding/reasoning columns. Genuinely no manual entry. Cheap/free, license-defensible.
- **Tier 2 — Auto-draft + thin safety gate (build now):** funding pipeline runs unattended; trust gate auto-publishes the high-confidence majority, routes the ambiguous minority to a one-click queue (5-sec glance, not entry). Eliminates manual entry without letting a 1000× error hit the corrections log. Track queue rate as a KPI.
- **Tier 3 — Event-detect + human-confirm (rare, unavoidable):** private valuations aren't a live metric; automate event detection, human confirms the figure on a new confirmed round, render event-stamped.

**The smallest unavoidable human touch, named honestly:** a review glance on the ambiguous funding minority + a figure confirmation when a private company raises. Both exist because those numbers are either catastrophic-if-wrong or un-fetchable-by-design, and DTW's product IS editorial integrity with a public corrections log. Every alternative that removes them either breaks budget/redistribution license ($25k+/yr DB) or auto-publishes raw LLM output (betrays the brand).
