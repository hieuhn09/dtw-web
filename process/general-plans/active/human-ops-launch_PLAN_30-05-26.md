# Human-Operable Launch — Umbrella Plan

**Created:** 2026-05-30
**Owner phase context:** pre-E4 (before AI Content Engine integration)
**Goal:** A complete, usable Dailytechwire site a **human editorial team** can operate end-to-end — author + publish real articles with images, manage taxonomy, run a public corrections log, be discoverable (SEO/RSS) — **without** the AI Content Engine.
**Source:** multi-agent readiness audit (workflow `dtw-human-ops-readiness`, 2026-05-30). Readiness at audit time: **42%**.

---

## Verdict from audit

CMS scaffolding is solid (9 Payload collections, RBAC write-gates, depth-expanded cached reads, revalidate hooks, `toArticleView` adapter, applied migrations). But the **read/render layer is still wired to design-prototype mocks**, so the two most fundamental editor actions silently fail. Fixes are mechanical (wiring), not architectural.

### The 3 true publish-blockers
1. **Article body never renders CMS content.** `article-body.tsx` hardcodes the "Tuas-3" essay for every article; `article-view.ts` never maps `body`. `@payloadcms/richtext-lexical/react` is installed but unused. Seed also never set `body`.
2. **No image pipeline.** No Payload upload collection / storage adapter; `imageUrl` exists in schema but is never read. Editors cannot attach a hero image.
3. **Drafts leak to public.** No query in `payload-server.ts` filters `_status`; seed articles are draft-status and render live. (Coupled: enabling a published-only filter without first marking seed articles published would empty the site; and editors then need a draft-preview path.)

Plus: SEO layer absent; public Corrections log ignores the CMS; fabricated content (fake wire-drop stream, false "live"/"CMS-wired" claims); search + newsletters mock-only; footer links to 5 routes that 404.

---

## Roadmap (tiered, with critic additions merged)

### P0 — blocks human operation
- **P0-A — Publish-the-article core** (L)
  - Map `body` in `article-view.ts`; render via Lexical `RichText` in `article-body.tsx`; re-derive top/middle/bottom disclosure placement against real body (invariant #5).
  - Add published-only `_status` filter to all 5 reader queries in `payload-server.ts`; set seed articles `_status: 'published'` so they don't vanish.
  - **Draft preview** (critic, mandatory companion): Next `draftMode()` + Payload preview URL so editors can preview unpublished drafts.
  - Hero image pipeline (needs storage decision — see Open Decisions): upload collection + render in `article-content.tsx`.
  - Make `sponsor` server-required when `sponsored=true`.
- **P0-B — Editorial bootstrap + CMS-driven taxonomy** (M): seed/doc first admin user; reconcile Users roles; drive pillar route + heading/description from Pillars collection (invariant #8, currently 404s new pillars); homepage Pillar showcase from CMS.
- **P0-D — Editorial-integrity surfaces** (M): wire `/trust/corrections` to Corrections collection; delete fake wire-drop `setInterval` stream; remove false "live"/"CMS-wired" claims on studio/briefing/dashboards/search.
- **P0-C — Discoverability foundation** (L): `metadataBase` + `NEXT_PUBLIC_SITE_URL`; per-article `generateMetadata` + JSON-LD NewsArticle/Author/Organization; `sitemap.ts` (+ news sitemap); `robots.ts`; RSS (global + per-pillar); fix dead footer RSS link; pillar-page metadata.
- **P0-E — Missing baseline pages (critic)** (S): `/contact` + `/legal/*` (privacy/terms/cookies/gdpr — footer links 404 today, GDPR/PDPA compliance); root `error.tsx` / `global-error.tsx` boundary.

### P1 — should (quality / credibility)
- Search against live DB (no Meilisearch yet); newsletter real subscribe + double opt-in; dashboards data backend (manual editorial entry); hide fake auth surfaces (auth-deferred launch posture); Brief band editable + remove broken affordances + sponsor scheduling.
- Critic adds: Postgres backup/restore runbook; minimal privacy-respecting analytics; make cookie-banner "Decline" actually gate (currently no-op).

### P2 — defer (audit + critic agree: do NOT build now)
Realtime websockets (Soketi/Pusher), PWA offline, full i18n subpath routing, TTS/audio, full Meilisearch, per-article OG image generation, **Engine lock/version enforcement (E4)**, external data feeds, IndexedDB↔DB account sync, paywall persistence/config.

---

## Recommended execution sequence
`P0-A → P0-B → P0-D → P0-C → P0-E → P1-A (search) → P1-* → P2`

Rationale: must publish a real article before SEO/search have anything to index.

---

## Open Decisions
- **Hero image storage** (blocks the P0-A image piece): Vercel Blob (fastest on Vercel) vs Cloudflare R2 / S3 adapter (matches stated architecture, needs R2 account) vs render-only `imageUrl` (no upload UI — least human-operable). To be chosen with the user.

---

## Progress log
- 2026-05-30: Plan created from audit. Starting P0-A (body rendering + draft gate cluster).
- 2026-05-30: P0-A body cluster done & verified (Lexical body render, `_status` published filter, seed bodies+published, lean ArticleView). Branch `feat/p0a-article-body`.
- 2026-05-30: P0-A image pipeline done & verified — Cloudflare R2 chosen. Media upload collection + `@payloadcms/storage-s3` (gated on R2_* env), `heroImage` field on Articles, reader renders hero (CoverArt fallback), migration `20260530_090650_p0a_media` applied to Neon, R2 upload round-trip tested OK. Also: `sponsor` now required when `sponsored`. turbo.json + Vercel need R2_* env.
- 2026-05-30: P0-A **complete**. Draft preview shipped: `/preview` route (auth-gated via `payload.auth`, enables Next draftMode), `/exit-preview`, `getArticleBySlugDraft` (uncached, draft:true), article page branches on draftMode, `admin.preview` button on Articles. Security verified: public draft→404, preview no-auth→401, published→200. **Editorial loop now closed: write → preview → publish → live.**
- 2026-05-30: Side quests merged — R2 `clientUploads` (bypass Vercel 4.5MB upload cap) + hero images rendered on all article cards (homepage/pillar/related), not just the detail page.
- 2026-05-31: P0-B **done** (pillar-from-CMS + admin bootstrap). `[pillar]/page.tsx` validates + themes from the Pillars collection (slug not in static list now renders instead of 404; heading/description/color/icon all editable in /admin). Added a `heading` field to Pillars (long H1, vs short `title` label) + migration `20260531_094311_pillar_heading` (applied to Neon). `PillarContent.pillarId` is now `string` with icon/label fallbacks. Env-driven idempotent admin seed (`SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`) so a fresh DB can log into /admin. Verified: known pillar shows CMS heading, brand-new CMS pillar renders 200, unknown slug 404s. NOTE: homepage Pillar showcase + nav still read the static `PILLARS` const (data.ts) — a brand-new pillar appears on its own page but not yet in the homepage band/nav; that's the remaining P0-B tail (deferred, Y1 = 6 fixed pillars).
- 2026-06-01: P0-D **complete**. Chunk 1: **Corrections** `/trust/corrections` reads the Corrections collection (server component + `getCorrections()`), honest empty state; **Wire Drops** fake `setInterval`/SAMPLES stream removed (only real CMS drops; false "Realtime · WebSocket" kicker + dead RSS/more affordances dropped). Chunk 2: studio/briefing dropped "wired through CMS" → honest copy; dashboards (page + funding-tracker + ai-leaderboard + homepage teaser) dropped all false "Live/15 min/138 instruments/18 models tracked" → "Preview · sample data · coming soon". Chunk 3: **Search made real** — `searchArticles()` (Postgres `like` on title/dek, published-only, no Meilisearch) + `runSearch` server action; `/search` page + ⌘K overlay rewritten to debounce-call the action (mock ARTICLES removed); dropped fake "134ms"/"Powered by Meilisearch"/"we log empty queries"; removed non-functional date/type facets. Verified query: Baidu→1, Singapore→2, Oppo→1, nomatch→0. **All P0-D surfaces now honest or real.**
- Next: **P0-C** (SEO: sitemap/robots/RSS/metadata/JSON-LD) then **P0-E** (/contact, /legal/*, error.tsx) → launch-ready.
- 2026-06-28: **Reconciliation entry** (progress log was stale since 2026-06-01 — catching up from the dtw-project-review audit `e045ac7`):
  - **P0-B tail done** — homepage Pillar Showcase and nav now read from the CMS `Pillars` collection sorted by `order` field; shipped in PR #11. The remaining static `PILLARS` const in `data.ts` still governs a few minor surfaces (see audit §1) but the primary showcase and nav are CMS-driven.
  - **Latest-feed aggregation + pin-to-latest shipped** — PRs #13–#18 (6 PRs). `getPinnedLatest` with `pinned_to_latest` column (migration `20260622` applied to both `articles` + `_articles_v`); fail-open try/catch; hero pinned story also leads the "Also leading today" rail. Verified stable and defensive by the 2026-06-28 audit.
  - **Secondary pages shipped** — briefing, search, corrections, and other secondary reader pages functional.
  - **Đợt 1 credibility cleanup done** — PR #20 (`feat/credibility-cleanup`, 6 commits `d4e628f`..`59414a2`). Covers part of P0-D/P0-E clean-up: dead affordances removed (paywall nudge, audio player, podcast play buttons, fake newsletter forms, false-promise copy, `#` social icons), real affordances wired (share/copy-link/email, CSV export), brand casing fixed, cookie-consent constraint documented in `process/context/infra/all-infra.md`. `pnpm typecheck` 3/3 green. Runtime smoke all HTTP 200. NOTE: this covers the "remove broken affordances" slice of P0-E; the `error.tsx`/`global-error.tsx` error boundary piece of P0-E is NOT done — see hard blockers below.
  - **Hard launch blockers remaining (unchanged from 2026-06-15 status):**
    1. **P0-C SEO / discoverability — entirely unstarted.** No `sitemap.ts` / news-sitemap / `robots.ts` / `generateMetadata` per page / JSON-LD NewsArticle+Author+Organization / `metadataBase` / `llms.txt`. This is a hard launch blocker — without it the site is invisible to Google News and AI search crawlers. Audit §3 has the full cluster spec.
    2. **P0-E error boundaries — still absent.** No `error.tsx` or `global-error.tsx` anywhere in `apps/web`. Any uncaught runtime error currently produces a white screen for readers. Fix is small (S effort) — two client components with brand + retry. See audit §2.1.
  - **Next feature work chosen:** Better-Auth (magic link + OAuth + RBAC 5 roles) — "Đợt 2". Separate plan/branch. Auth landing unblocks real account, saved articles, paywall meter persistence, and newsletter subscribe collection.
  - **Still pending from Phase 1 hardening (audit §2, Phase 1 table):**
    - Postgres backup/restore runbook + `migrate-prod.mjs` pre-snapshot step (no runbook exists; a bad migration or `DELETE` risks total article loss — Neon has PITR but the restore procedure is undocumented).
    - Corrections page revalidate hook (`corrections:all` tag is never busted by `revalidate.ts`; page can show stale data up to 5 minutes after a CMS edit).
    - Production config verification (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_POSTHOG_*`, R2 env vars in Vercel production environment — not verified as present).
