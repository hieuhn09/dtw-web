> **⚠️ SUPERSEDED 20-08-26 — KHÔNG THI CÔNG PLAN NÀY.**
>
> Plan giả định "engine admin chưa có code LLM nào" — sai từ 31-07-26. content-engine đã ship
> pipeline Daily Brief đầy đủ (compose + admin review `/briefs` + cron publish) cho cả 3 tờ,
> và hợp đồng chốt 04-08-26 (`content-engine/process/features/daily-brief/references/
> hop-dong-danh-dau-brief-cho-web_04-08-26.md`) đi hướng ngược lại: brief gửi qua
> `/api/engine/intake` **như một bài thường**, đánh dấu bằng `contentType: 'daily-brief'` —
> không collection riêng, không route riêng.
>
> Thi công plan này bây giờ = dựng đường brief thứ hai song song với đường đang chạy.
>
> Thay thế bởi:
> - `apcg-cms/process/general-plans/active/brief-content-type_PLAN_20-08-26.md`
> - `process/general-plans/active/brief-display_PLAN_20-08-26.md`
> - Nghiên cứu: `process/general-plans/references/brief-display-research_REFERENCE_20-08-26.md`
>
> Giữ lại vì phần phân tích timezone/cửa sổ slot và idempotency vẫn dùng lại được.

# Engine-Composed AM/PM Brief — Plan

**Date:** 24-07-26
**Complexity:** SIMPLE (one execute pass; cross-repo, but every stage is small, independently verifiable, and ships dark)
**Status:** ⏳ PLANNED
**Decision record:** approved INNOVATE output (Proposal 1 hardened) — this plan implements it verbatim; do not relitigate choices here.
**Research:** `process/general-plans/references/engine-composed-brief-research_REFERENCE_24-07-26.md` (all factual claims below cite it or files spot-checked 24-07-26).

---

## Overview

The engine admin app (content-engine `admin/`, Vercel) gains one cron route that at **06:00 / 17:00 SGT** queries published DTW articles from Supabase over **slot-derived fixed windows**, makes **one Sonnet call** (with a deterministic `relevance_score` fallback so a draft always exists), and POSTs 3–5 `cms_post_id`s + headlines/summaries/intro to a new token-guarded sibling route **`POST /api/engine/intake/brief`** on dtw-web. That route **create-once-idempotently** writes a `status:'review'` row into a new **BriefEditions** Payload collection via the Local API (invariant #1; spec row 15 "Biên tập brief" = CMS-editable), with a read-access rule hiding unpublished editions from every public Payload surface, then fire-and-forgets a notify email. An editor **one-click flips status to 'published'**, busting the new `briefs:all` tag that feeds a props-driven BriefBand and a minimal `/briefing` page.

The engine **never updates an existing edition** — human edits win forever with zero lock machinery. Everything ships dark (`SHOW_BRIEF=false`, `BRIEF_COMPOSE_ENABLED` unset). The email leg and full-auto publishing are explicitly deferred.

```
[engine admin Vercel cron 06:00/17:00 SGT]
  → Supabase query (slot window, publication=dtw, published, cms_post_id set)
  → 1 Sonnet call (or deterministic fallback)          … compose-brief.ts
  → POST dtw-web /api/engine/intake/brief (bearer)     … create-once
      → BriefEditions row status:'review' (Local API, hooks fire)
      → notify email → editor
  → editor flips status:'published' in /admin          … the human gate
      → afterChange hook busts `briefs:all`
      → getLatestBriefs → BriefBand + /briefing
```

---

## Touchpoints

### dtw-web (this repo)

| File | Change |
|---|---|
| `apps/web/src/payload/collections/BriefEditions.ts` | **NEW** — collection (fields/access/hooks below) |
| `apps/web/payload.config.ts` | modify — register `BriefEditions` in `collections` (list at ~line 51; `push:false` already set) |
| `apps/web/src/payload/migrations/` | **NEW** migration pair + `index.ts` entry (generated, checked in) |
| `apps/web/src/payload/payload-types.ts` | regenerated (`pnpm payload:generate-types`) |
| `apps/web/src/payload/hooks/revalidate.ts` | modify — add `revalidateBriefEdition` + `revalidateBriefEditionDelete` (bust `briefs:all`) |
| `apps/web/src/app/api/engine/intake/brief/route.ts` | **NEW** — token-guarded sibling intake route (contract = the live route at `apps/web/src/app/api/engine/intake/route.ts`, NOT the never-built If-Match docs — research "Docs hazard") |
| `apps/web/src/lib/payload-server.ts` | modify — add `getLatestBriefs` unstable_cache helper; add `briefs:all` to the tag-conventions comment |
| `apps/web/src/components/home/brief-band.tsx` | modify — delete hardcoded `briefs` array; accept real props; real dates; WIB→SGT copy fix; disclosure tooltip |
| `apps/web/src/app/(reader)/page.tsx` | modify — fetch `getLatestBriefs`, pass props to `<BriefBand />`. `SHOW_BRIEF` (line 29) **stays `false`** — flip is Gate G1 |
| `apps/web/src/app/(reader)/briefing/page.tsx` | rewrite — server component rendering latest published AM + PM editions + disclosure line + copy fix ("Two daily emails" → daily web editions, email "coming soon") |

Uses (no change): `apps/web/src/lib/email.ts` (`sendEmail`), `apps/web/src/app/(reader)/article/[slug]/` (verified route for item links).

### content-engine (engine repo)

| File | Change |
|---|---|
| `admin/src/lib/compose-brief.ts` | **NEW** — window math, Supabase candidate query, direct-OpenRouter Sonnet call, fallback ranking, intake POST body builder |
| `admin/src/app/api/cron/compose-brief/route.ts` | **NEW** — cron route (auth/shape mirrors `admin/src/app/api/cron/publish-dtw/route.ts`) |
| `admin/vercel.json` | modify — add 2 cron entries |

Uses (no change): `admin/src/lib/supabase/service.ts` (`createServiceClient`), `admin/src/lib/dtw-intake-client.ts` (pattern reference only — the brief POST is its own small fetch, same AbortController/timeout style). **No Supabase migration** — no `pipeline_runs` write, so the `job_type` CHECK migration is avoided (per decision record).

### Environment variables

| Env | Repo/host | Value/state |
|---|---|---|
| `DTW_BRIEF_INTAKE_TOKEN` | **both** (dtw-web Vercel + engine admin Vercel) | new shared secret (generate once; distinct from `DTW_INTAKE_TOKEN`) |
| `BRIEF_REVIEW_NOTIFY_EMAIL` | dtw-web | editor inbox for review notifications (missing → log + skip, non-fatal) |
| `OPENROUTER_API_KEY` | engine admin | new to the admin package (admin has zero LLM code today — verified) |
| `BRIEF_COMPOSE_ENABLED` | engine admin | **stays unset until Gate G1** — unset/empty = cron 200 `{disabled:true}`, zero side effects (`AUTOPUBLISH_CAPS` precedent) |
| `CRON_SECRET`, `DTW_INTAKE_URL` | engine admin | existing — reused as-is |

## Blast radius

- **One reader-visible change at merge: `/briefing` copy.** Band stays hidden (`SHOW_BRIEF=false`) and the compose cron is disabled by kill switch, but Stage C step 11 ships the `/briefing` copy fix (daily web editions at 07:00/18:00 SGT, email "coming soon") and the standing disclosure line live on that public page at merge — copy-only, no LLM prose exposed, low risk; G2/G3 are launch flips, not build blockers, and may later adjust that exact wording. The `/briefing` data section renders nothing until an edition is published.
- **DB:** one new `brief_editions` table (+ items/array table + unique index) via checked-in migration; touches no existing table.
- **Shared surfaces touched:** `payload.config.ts` (additive), `revalidate.ts` (additive), `payload-server.ts` (additive), `payload-types.ts` (regenerated), homepage `page.tsx` (one fetch + props). No Articles/auth/paywall paths touched.
- **Engine:** additive only — new route + helper + 2 cron entries; existing 5 crons and the article publish path untouched.
- **Failure containment:** intake route inert without token + traffic; `getLatestBriefs` is fail-open (try/catch → `{am:null, pm:null}`) so a briefs-query failure can never break the homepage.

---

## Contract & Mechanics (normative)

### Timezone, windows, cron math

Canonical timezone: **Asia/Singapore (UTC+8, no DST)** — explicitly diverging from the engine's Asia/Ho_Chi_Minh auto-approve boundary; canonicalizes 07:00/18:00 SGT display slots over the newsletters guide's ~6am/~6pm.

- Compose times: **AM 06:00 SGT = 22:00 UTC (prev calendar day UTC)**, **PM 17:00 SGT = 09:00 UTC**.
- `vercel.json` entries: `{"path": "/api/cron/compose-brief?edition=am", "schedule": "0 22 * * *"}` and `{"path": "/api/cron/compose-brief?edition=pm", "schedule": "0 9 * * *"}` (UTC). Query-string-in-cron-path is unverified on Vercel → the route derives edition **authoritatively from UTC hour**: 21–23 → `am`, 8–10 → `pm`; the query param is honored only outside those bands (manual re-trigger). Verify param passthrough on first deploy; it is never load-bearing.
- `editionDate` (SGT calendar date, string `YYYY-MM-DD`): `new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 10)` — branchless and correct across the 22:00-UTC AM date-boundary crossing. Manual re-trigger may pass `?date=YYYY-MM-DD` to override.
- **Slot-derived fixed windows** (computed from `(editionDate, editionType)`, NEVER from `now()` — late/manual re-runs compose the identical edition):
  - AM edition dated `D`: `[D-1 17:00 SGT, D 06:00 SGT)` = `[D-1T09:00:00Z, D-1T22:00:00Z)`
  - PM edition dated `D`: `[D 06:00 SGT, D 17:00 SGT)` = `[D-1T22:00:00Z, D T09:00:00Z)`
- Review window: compose 06:00/17:00 vs the published 07:00/18:00 slots ≈ **60 minutes** of human gate.

### Idempotency & uniqueness

- Key = `(editionDate, editionType)`.
- Layer 1: intake route `payload.find` precheck → existing row returns **200 `{id}` without touching it** (create-once; the engine can never clobber a human edit — this replaces all lockedFields/editedByHuman machinery, per decision record).
- Layer 2 (race-proof backstop): **DB unique compound index** on `(editionDate, editionType)` declared on the collection (`indexes: [{ fields: ["editionDate", "editionType"], unique: true }]`) and present in the checked-in migration. A lost race surfaces as a create error → 500 → cron retry path hits the 200 branch.
- Manual re-trigger: authenticated GET on the cron route — safe noop when the edition exists. Bad draft recovery: editor edits it, or deletes the row in /admin and re-triggers.

### Thin-supply fallback rule

Fewer than **3** windowed candidates → **skip the edition entirely** (cron returns 200 `{skipped: "thin_supply", candidateCount}`; nothing POSTed). No evergreen padding. The band keeps showing the last published edition **with its true date** — honest staleness by design.

### LLM call & deterministic fallback

- One call: `anthropic/claude-sonnet-4.5` via direct OpenRouter `chat/completions` fetch (self-contained in `compose-brief.ts` — no dependency on the worker package's `claude.ts`). Input: up to **25** candidates as `{cms_post_id, title, subtitle, excerpt, category, tags, relevance_score, cms_published_at}`. `max_tokens: 1500`, 30s `AbortController` timeout. Output JSON: `{intro, items: [{cms_post_id, headline, summary}]}` with 3–5 items, validated as a **strict subset of candidate ids** (any hallucinated id → treat as malformed).
- Fallback (timeout / malformed JSON / invalid ids): deterministic `ORDER BY relevance_score DESC NULLS LAST, cms_published_at DESC LIMIT 5`, verbatim `title`/`excerpt` as headline/summary, fixed one-line intro. `composeMeta.selectionMode = 'fallback'`. Safe because the human gate reviews every edition regardless.
- **Cost:** ~4k input + ≤1.5k output tokens ≈ **$0.02–0.05/edition → ~$1.20–3/month** at 2/day (research figure; Sonnet $3/$15 per 1M). Negligible; no `assertBudget` wiring in admin — `costUsd` computed from the OpenRouter usage block into `composeMeta` as the audit trail.

### Intake contract — `POST /api/engine/intake/brief`

```
Authorization: Bearer {DTW_BRIEF_INTAKE_TOKEN}   (constant-time compare)
Body: {
  editionDate: "YYYY-MM-DD",          // SGT calendar date, /^\d{4}-\d{2}-\d{2}$/
  editionType: "am" | "pm",
  intro: string,
  items: [{ cms_post_id: number, headline: string, summary: string }],  // 3..5
  composeMeta?: object                 // stored verbatim
}
Responses:
  500 token env unset (fail-closed, mirrors live intake route)
  401 bad/missing bearer
  400 malformed JSON / missing fields / items outside 3..5 / bad date format
  422 any cms_post_id that resolves to no Payload article
  200 { id }  — (editionDate, editionType) already exists; row NOT touched
  201 { id }  — created via payload.create (Local API → afterChange hooks fire, invariant #1)
```

The engine sends **only `cms_post_id`s and never constructs URLs** — items are stored as `relationship → articles`; the web renderer resolves slugs at depth 1 to `/article/[slug]` and skips unresolvable or unpublished referenced articles.

### BriefEditions collection (slug `briefEditions`)

Fields (every one CMS-editable — spec row 15):

- `editionDate` — text, required, `YYYY-MM-DD` SGT
- `editionType` — select `am | pm`, required
- `status` — select `review | published`, default `review` (**plain select, NOT versioned drafts** — drafts would force `_v` table mirroring in the migration, per decision record)
- `origin` — select `engine | manual` (invariant #3 parity), route sets `engine`
- `intro` — textarea
- `items` — array, minRows 3, maxRows 5: `{ article: relationship → articles (required), headline: text (required), summary: textarea }`
- `composeMeta` — json, admin-collapsed: window bounds, candidateCount, selectionMode (`llm | fallback`), model, llmMs, costUsd

Access (mirrors WireDrops for mutation; read rule is the trust boundary for unreviewed LLM prose):

- `read: ({ req }) => (req.user ? true : { status: { equals: "published" } })` — unpublished editions invisible to every public Payload surface (REST/GraphQL included)
- `create: ({ req }) => Boolean(req.user?.role)` (the intake route uses the Local API and bypasses this — bearer check is its trust boundary, same as the live intake route)
- `update`/`delete`: `editor | admin` only

Hooks: `afterChange: [revalidateBriefEdition]`, `afterDelete: [revalidateBriefEditionDelete]` → both bust **`briefs:all`**. Admin: `useAsTitle: "editionDate"`, defaultColumns `[editionDate, editionType, status, origin]`.

### Notify email (web-side — keeps Resend creds in one repo)

On 201, the intake route fire-and-forgets (`void sendEmail(...).catch(console.error)`) one message via `apps/web/src/lib/email.ts` to `BRIEF_REVIEW_NOTIFY_EMAIL`: subject `Brief ready for review: {AM|PM} {editionDate}`, deep link `{request origin}/admin/collections/briefEditions/{id}`. Missing env or Resend failure → log, never fail the intake. Its absence is the de facto v1 compose-failure alarm (real alerting deferred).

---

## Scope

**In (one execute pass, all dark):** everything in Touchpoints above.

**Out (explicitly):**

- Entire email leg — batch Resend send, digest template, RFC 8058 unsubscribe, send-log; no owner exists; double opt-in is backlogged in `process/features/account/backlog/phase-05-newsletters-double-optin_PLAN_03-07-26.md` which excludes sending infra. BriefEditions is deliberately shaped as the future email source of truth.
- Full-auto publish (would be the one-line change: intake creates `status:'published'`) — requires a future named trust-model decision (Gate G4).
- `/briefing` paginated archive — v1 renders only latest published AM/PM.
- Soketi/Pusher realtime for the band — tag revalidation suffices at 2 editions/day.
- i18n of edition content — invariant #10, chrome-only translation; brief prose stays English.
- Alerting for silent compose failure; full `/trust/ai` copy reconciliation (pre-existing KNOWN GAP, invariant #5).

---

## Implementation Checklist

SIMPLE plan: stages are logical groupings for flow and verification, **not stop points** — implement A→E continuously. Only the Gates section requires human sign-off, and none of it blocks the dark build.

### Stage A — dtw-web: collection + migration + hooks

1. Create `apps/web/src/payload/collections/BriefEditions.ts` per the spec above (WireDrops is the style template: `apps/web/src/payload/collections/WireDrops.ts`).
2. Register in `apps/web/payload.config.ts` `collections` array.
3. Add `revalidateBriefEdition` / `revalidateBriefEditionDelete` to `apps/web/src/payload/hooks/revalidate.ts` (copy the WireDrops hook pair; tag `briefs:all`; keep the `revalidationDisabled` guard).
4. From `apps/web/`: `pnpm payload:migrate:create add_brief_editions` → commit the generated `.ts`/`.json` pair and the `migrations/index.ts` update. Confirm the migration SQL contains the **unique index on (edition_date, edition_type)** and NO `_v` tables.
5. `pnpm payload:migrate` locally, then `pnpm payload:generate-types`.

**Verification evidence:**

- `pnpm typecheck` clean.
- Migration file grep: unique index present, no `_brief_editions_v` table.
- Local `/admin` shows the BriefEditions collection; manually create a `status:'review'` row, then `curl http://localhost:3000/api/briefEditions` (unauthenticated Payload REST) → row absent; flip to `published` → row present.
- Duplicate `(editionDate, editionType)` insert in admin → DB unique-violation error surfaces.

### Stage B — dtw-web: intake route + notify email

6. Create `apps/web/src/app/api/engine/intake/brief/route.ts`: copy `bearerMatches`/`json`/validation style from the live sibling `apps/web/src/app/api/engine/intake/route.ts`; token env `DTW_BRIEF_INTAKE_TOKEN`; flow = auth → validate body → `payload.find` precheck (200) → resolve all `cms_post_id`s via one `payload.find({ collection: "articles", where: { id: { in: [...] } }, depth: 0 })` (any missing → 422 naming the bad ids) → `payload.create` with `status:'review'`, `origin:'engine'` (201) → fire-and-forget notify email.
7. Never write to an existing row from this route under any input.

**Verification evidence (local, curl):**

- No env → 500; wrong bearer → 401; malformed body → 400; 2-item / 6-item payload → 400; fake `cms_post_id` → 422 naming it.
- Valid payload (use real seeded article ids) → 201 `{id}`; identical repeat → 200 same `{id}`; row visible in /admin as `review`/`engine`; dev log shows the notify email (email.ts logs when `RESEND_API_KEY` unset).
- Dev server log shows `[revalidate] … → briefs:all` on the create (hook fired via Local API).

### Stage C — dtw-web: read path + band + /briefing (ships dark)

8. `apps/web/src/lib/payload-server.ts`: add `getLatestBriefs(): Promise<{ am: BriefEdition | null; pm: BriefEdition | null }>` — two `find`s (`status: published`, `editionType`, `sort: "-editionDate"`, `limit: 1`, `depth: 1`), wrapped in `unstable_cache([..], ["briefs:all"], { tags: ["briefs:all"], revalidate: 300 })`, whole body in try/catch returning nulls (fail-open, mirrors research prescription). Add `briefs:all` to the tag-conventions comment block.
9. Rewire `apps/web/src/components/home/brief-band.tsx`: delete the hardcoded `briefs` array; accept a serializable props shape (e.g. `editions: Array<{ type: "am" | "pm"; date: string; headline: string; intro: string }>`) built server-side from `getLatestBriefs` (headline = `items[0].headline`, intro = edition `intro`; skip items whose depth-1 article is missing or not `_status:'published'`). Must handle **0/1/2 editions**: render only real editions; 0 → return null. Tag shows the **real** type + date (`AM · 24 Jul`), never fake times. Fix the Indonesian chrome string `07:00 / 18:00 WIB` → SGT (Gate G3 ratifies). Add the disclosure tooltip (title attr / small line): "Compiled by Dailytechwire newsroom systems; reviewed by editors before publication".
10. `apps/web/src/app/(reader)/page.tsx`: call `getLatestBriefs()`, pass props. **Leave `SHOW_BRIEF = false`** (flip is Gate G1).
11. Rewrite `apps/web/src/app/(reader)/briefing/page.tsx` as an async server component: latest published AM + PM editions — edition header (type, real SGT date), intro, 3–5 items as links to `/article/[slug]` (depth-1 resolution, skip unpublished/unresolvable), the standing non-dismissable disclosure line, and the **required copy fix**: "Two daily emails" → daily web editions at 07:00/18:00 SGT; email "coming soon". Renders gracefully with zero published editions (day-one state).

**Verification evidence:**

- With the Stage A/B test edition published locally: temporarily flip `SHOW_BRIEF=true` in dev only → band renders 1 real edition with true date; flip back to `false` before commit (`git diff` confirms).
- `/briefing` shows the edition with working `/article/[slug]` links + disclosure line; with the edition set back to `review` → page shows the empty state; **published edition JSON is absent from view-source when in review** (access rule end-to-end).
- Editor status flip in /admin → log shows `briefs:all` bust; band/page update on next request.
- `pnpm typecheck && pnpm lint` clean; `pnpm build` succeeds (with DB reachable — a no-DB build already fails on other homepage queries like `getRecentArticles`/`getWireDrops`, which are not fail-open, so build-time fail-open is not claimable). Fail-open check for `getLatestBriefs` at request time instead: in dev, stop the DB or point `DATABASE_URL` at a dead port, exercise `getLatestBriefs` (e.g. request `/briefing`) → it returns `{am:null, pm:null}` / renders the empty state and logs a warning instead of throwing.

### Stage D — content-engine: compose job

12. Create `admin/src/lib/compose-brief.ts`: `computeWindow(editionDate, editionType)` (pure, exported — unit-testable against the UTC boundary examples above); candidate query via `createServiceClient()` — `articles` select `id, cms_post_id, title, subtitle, excerpt, category, tags, relevance_score, cms_published_at, publications!inner(slug)` where `publications.slug = 'dtw'`, `status = 'published'`, `cms_post_id not null`, `cms_published_at` in window, order `cms_published_at desc`, limit 25; Sonnet call + strict-subset validation + deterministic fallback per Contract; returns `{intro, items, composeMeta}` or `{skipped: 'thin_supply'}`.
13. Create `admin/src/app/api/cron/compose-brief/route.ts`: `export const dynamic = 'force-dynamic'; export const maxDuration = 60;`; `authorized()` copied from `admin/src/app/api/cron/publish-dtw/route.ts` (CRON_SECRET, constant-time); `BRIEF_COMPOSE_ENABLED` unset/empty → 200 `{disabled:true}` before any side effect; edition from UTC hour (21–23 am / 8–10 pm), `?edition=`+`?date=` honored only outside those bands (manual re-trigger); budget: ~1s Supabase + 30s LLM cap + 12s intake POST (`${DTW_INTAKE_URL}/api/engine/intake/brief`, bearer `DTW_BRIEF_INTAKE_TOKEN`, one retry on network/5xx); one structured JSON console line per run `{edition, editionDate, window, candidateCount, selectionMode, llmMs, costUsd, intakeStatus, briefId}` mirroring `composeMeta`.
14. Add the 2 cron entries to `admin/vercel.json` (exact strings in Contract).

**Verification evidence (local `admin/` dev; split evidence — see id-space note):**

> **Id-space note (why there is NO local end-to-end 201):** Supabase `articles.cms_post_id` holds **production** dtw-web Payload ids (set by the live publish path — `005_layer3_publishing.sql`), and admin dev talks to the remote Supabase project (no local Supabase stack). Locally seeded dtw-web articles (`scripts/seed-payload.ts`) have different ids, so a local compose run against local dtw-web will always end in intake **422** — expected, not a failure. Evidence is therefore split: the compose leg is proven locally with 422 as the accepted terminal status; the intake create/idempotency/hook leg is already proven by the Stage B curls (real local seeded ids); the first true end-to-end 201 lands against prod during the pre-G1 dark seeding runs (G1: "seeded by manual re-trigger runs while dark"), where the id spaces match.

- No `BRIEF_COMPOSE_ENABLED` → 200 `{disabled:true}`, zero Supabase/LLM/network calls (log-verified).
- Wrong bearer → 401.
- With flag + real envs and `DTW_INTAKE_URL` pointed at local dtw-web: `curl -H "Authorization: Bearer $CRON_SECRET" 'localhost:PORT/api/cron/compose-brief?edition=am&date=2026-07-24'` → structured log line shows the full compose leg (real Supabase read: `candidateCount` > 0, `selectionMode:'llm'`, `llmMs`, `costUsd`) and **`intakeStatus: 422`** with the unmatched ids named — proves bearer auth and body shape passed intake validation and only id resolution failed, per the id-space note.
- Invalid `OPENROUTER_API_KEY` run → log shows `selectionMode:'fallback'` with verbatim title/excerpt items (intake again 422 — same expectation). **Must use a fresh `?date=YYYY-MM-DD`** (or first delete any previously created edition row for that `(editionDate, editionType)` in /admin) so the intake create path runs again — reusing an already-created edition key would hit the intake 200-noop precheck branch and the fallback edition would never be created/observed.
- Intake 201 / repeat-200 idempotency / review row / `briefs:all` hook: **owned by Stage B evidence** (curls with real local seeded ids) — not re-claimed here. Compose-route noop against an existing edition rides that same intake 200 branch and gets its real exercise in the pre-G1 prod re-triggers.
- Window spot-check: assert `computeWindow('2026-07-24','am')` = `[2026-07-23T09:00:00Z, 2026-07-23T22:00:00Z)` and `('2026-07-24','pm')` = `[2026-07-23T22:00:00Z, 2026-07-24T09:00:00Z)`.
- `npm run lint` + `npx tsc --noEmit` (admin has no typecheck script) clean.

### Stage E — dark deploy (both repos)

15. dtw-web: set `DTW_BRIEF_INTAKE_TOKEN` + `BRIEF_REVIEW_NOTIFY_EMAIL` in Vercel; deploy (vercel-build runs the migration via `scripts/migrate-prod.mjs`). Engine admin: set `OPENROUTER_API_KEY` + `DTW_BRIEF_INTAKE_TOKEN`; **leave `BRIEF_COMPOSE_ENABLED` unset**; deploy.

**Verification evidence:**

- dtw-web deploy log shows the `add_brief_editions` migration ran; prod `/api/briefEditions` (unauthenticated) → empty published list, no leak; prod band still hidden; `/briefing` shows the empty state with corrected copy.
- Vercel dashboard shows both compose crons registered; first scheduled fire logs `{disabled:true}`; note in the run log whether `?edition=` survived the cron invocation (informational — hour derivation is authoritative).
- Curl prod intake with wrong token → 401 (route live and guarded).

---

## Approval Gates (launch flips — NOT build blockers)

These are **explicit human sign-offs recorded before any launch flag flips**. The dark build above merges without them. None may be silently assumed.

- **G1 — Product un-hides the band and enables compose.** Product reviews real editions in Payload admin (seeded by manual re-trigger runs while dark), then in one go-live: flip `SHOW_BRIEF = true` in `apps/web/src/app/(reader)/page.tsx` AND set `BRIEF_COMPOSE_ENABLED=true` on engine admin. `SHOW_BRIEF` was hidden at product request 17-07 — flipping it without this sign-off is a violation.
- **G2 — EIC approves disclosure + byline.** Desk-level label "DTW Briefing Desk" (no pen-name — a pen-name would misrepresent machine-composed authorship) + the standing non-dismissable line "Compiled by Dailytechwire newsroom systems; reviewed by editors before publication" on `/briefing` and the band tooltip. `/trust/ai` reconciliation scoped to **brief-related copy only** (full rewrite = the pre-existing invariant #5 KNOWN GAP, separate effort).
- **G3 — Product ratifies timing + ownership.** 07:00/18:00 SGT canonical; names who owns the 06:00–07:00 and 17:00–18:00 SGT approval slots; accepts fail-closed missed-edition behavior (dated stale band, never an unreviewed edition); ratifies the WIB→SGT band copy fix (never per-locale editions).
- **G4 — Full-auto is a future named decision.** Relaxing to `status:'published'` at intake (one line) requires a separate explicit trust-model decision after a clean-edition track record. Track approval latency (edition `createdAt` → publish flip) from day one to inform it.

---

## Rollback

- **Instant kill (no deploy):** unset `BRIEF_COMPOSE_ENABLED` on engine admin → next cron fire is a no-op. Band: flip `SHOW_BRIEF=false` (one-line deploy) — data-fetch stays intact by the page's own convention.
- **Bad edition:** editor edits it in /admin, or deletes the row (afterDelete busts `briefs:all`) and re-triggers the cron GET — self-healing recreate, byte-identical window.
- **Full engine rollback:** remove the 2 `vercel.json` entries + the route/helper (additive files, no shared-code entanglement).
- **Full web rollback:** intake route is inert without engine traffic; collection can stay (empty, harmless). Schema down-path: `pnpm payload migrate:down` (via the existing `"payload": "payload"` script — there is no `payload:migrate:down` script). Caveat: `migrate:down` reverts the **most recent migration batch**, so verify `add_brief_editions` is still the newest migration before running it, and only run it after deleting BriefEditions rows you want gone.

## Risks & Mitigations

- **Vercel cron drops the query string** → hour-based edition derivation is authoritative; param is advisory. Verify on first deploy (Stage E evidence).
- **LLM returns junk** → strict-subset validation + deterministic fallback + the human gate; worst case is a bland-but-true draft the editor edits.
- **Race between scheduled fire and manual re-trigger** → find-precheck + DB unique index; loser gets a unique-violation → retried request lands on 200.
- **Compose fails silently** → missing notify email at ~06:05/17:05 SGT is the v1 alarm (deferred: real alerting). Structured log line per run enables post-hoc audit.
- **Thin overnight supply** (research: window typically yields ~13–20 articles, some days fewer) → skip rule; product accepted dated-stale band via G3.
- **`payload migrate:create` emits more than expected** (e.g. unrelated drift) → inspect the generated SQL in Stage A step 4 before committing; migration must contain only `brief_editions` objects.

## Resume Handoff

- **State to check on resume:** does `apps/web/src/payload/collections/BriefEditions.ts` exist (Stage A started)? does `apps/web/src/app/api/engine/intake/brief/route.ts` exist (Stage B)? does `getLatestBriefs` exist in `payload-server.ts` (Stage C)? does `admin/src/app/api/cron/compose-brief/route.ts` exist in content-engine (Stage D)? are the envs set in both Vercel projects (Stage E)?
- **Invariant to preserve at any resume point:** `SHOW_BRIEF` stays `false` and `BRIEF_COMPOSE_ENABLED` stays unset until Gate G1 is explicitly signed off — never flip them as part of "finishing" the implementation.
- **The intake route must never gain an update path.** Create-once is the entire human-wins model; if someone asks for engine re-POST-to-update, that reopens the rejected lockedFields alternative and needs a new decision.
- Deferred items live in the decision record + Scope/Out above; on closeout, archive this plan to `process/general-plans/completed/` and record the `briefs:all` tag + BriefEditions collection in `process/context/` (integrations + uxui routing as appropriate).
