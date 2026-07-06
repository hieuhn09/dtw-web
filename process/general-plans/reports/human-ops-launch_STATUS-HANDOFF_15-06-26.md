# DTW Human-Ops Launch — Status & Handoff Report

**Date:** 2026-06-15
**Author:** multi-agent project review (workflow `dtw-next-task-review`, 6 parallel auditors + synthesis)
**Purpose:** Hand off to another machine/agent. Self-contained — everything needed to pick up the next task is here. Verified against **actual code on `main`**, not the (stale) plan progress-log.
**Plan this serves:** `process/general-plans/active/human-ops-launch_PLAN_30-05-26.md`

---

## TL;DR

The project is **further along than the plan's progress-log says** (the log stops at P0-D / 2026-06-01; ~20 commits shipped since with no log entries). The editorial core is launch-capable. **The single biggest remaining launch-blocker is P0-C (SEO / discoverability), which is entirely unstarted** — and the UI already ships dead links pointing at the missing SEO backends.

**Recommended next task: build the P0-C SEO foundation as one cluster** (details in §4).

---

## 1. Current state (verified against code on `main`)

### Done / launch-capable
| Area | Status | Evidence |
|---|---|---|
| **P0-A** publish core | ✅ DONE | write→preview→publish→live loop closed; Lexical body render, `_status` published filter, R2 hero images, draft preview (`/preview`, `/exit-preview`) |
| **P0-B** CMS taxonomy + tail | ✅ DONE | header nav + homepage Pillar Showcase read from CMS `Pillars` ordered by `order` field (PR #11). `layout.tsx:21 getNavPillars()`, `header.tsx`, `home/pillar-showcase.tsx`. Cache-busting on `pillars:all` wired in `payload/hooks/revalidate.ts:122-138` |
| **P0-D** integrity surfaces | ✅ DONE | `/trust/corrections` reads Corrections collection; fake wire-drop `setInterval` removed; DB-backed search (Postgres LIKE) live for both `/search` page and ⌘K overlay (`payload-server.ts:174-192 searchArticles`) |
| **Engine intake (Phase 5)** | ✅ MERGED | `apps/web/src/app/api/engine/intake/route.ts` (POST, shared-bearer, idempotent, `origin:'engine'`). Merged via **PR #7 + PR #8**. ⚠️ Memory note claiming "never pushed/no PR" is **STALE/WRONG** |
| Design refresh + rebrand | ✅ MERGED | PR #9: navy banners, muted earthy 6-pillar palette, Schibsted Grotesk, `asia`→`latest` rename, APCG rebrand, AI-disclosure inline removal, "Dailytechwire" wordmark |
| PWA manifest + icons | ✅ MERGED | PR #10/#12. `apps/web/src/app/manifest.ts` only — **no service worker / offline** (correctly stays inside P2 boundary) |
| Secondary pages | ✅ SHIPPED | `/contact`, `/legal/[slug]` (privacy/terms/cookies/gdpr), `/advertise`, `/press`, `/about/newsroom`, studio rebuild (commit 74ddf17) |
| Invariant #7 (colors) | ✅ COMPLIANT | `globals.css`: `--accent #D4623C`, `--brand-navy #1B2A52`, 6 re-toned pillars all match |
| Invariant #11 (logo) | ✅ COMPLIANT | `components/wordmark.tsx` renders navy DTW monogram + lowercase "dailytechwire" + terracotta pulse-dot |
| Git hygiene | ✅ CLEAN | working tree clean, all 12 PRs merged, `main` = source of truth |

### Not done — the real gaps
See §3 for the ranked list with file-level evidence.

---

## 2. Plan-log drift — reconcile these (housekeeping, low effort)

The plan progress-log (`human-ops-launch_PLAN_30-05-26.md`) last entry is 2026-06-01. Reconcile:

1. **Mark P0-B tail DONE** — the 2026-05-31 note still calls the homepage/nav-from-CMS work "deferred"; it shipped in PR #11.
2. **Record P0-E baseline pages already shipped** inside the design-refresh commits → P0-E now narrows to **error boundaries + 3 dead CTAs** only.
3. **Note new UI affordances pointing at unbuilt backends**: footer `/rss.xml`, hrefless pillar RSS button, `/latest`, `/pro`.
4. **Correct the project memory** (`project_dtw_status.md`): engine-intake **was** merged (PR #7+#8), not "never pushed".
5. **Branch cleanup**: 5 merged local branches can be pruned; 2 dangling remote branches (`feat/brand-guideline-palette`, `feat/header-logo-favicon`) are a **rejected blue palette + superseded logo work** — most likely delete (resuming `brand-guideline-palette` would REVERT invariant-#7 terracotta colors).

---

## 3. Remaining gaps, ranked (with file evidence)

### P0 — blocks launch
1. **P0-C SEO foundation — ENTIRELY UNSTARTED** (verified: 0 hits for `metadataBase`, `sitemap`, `robots`, `ld+json`, `llms.txt` across `apps/web/src`):
   - No `metadataBase` / `NEXT_PUBLIC_SITE_URL` → OG/canonical URLs would resolve relative & break.
   - No per-article `generateMetadata` — `article/[slug]/page.tsx` exports only `revalidate = 60`; every article inherits static title "Dailytechwire".
   - No per-pillar `generateMetadata` — `[pillar]/page.tsx` same.
   - No JSON-LD (NewsArticle / Author / Organization).
   - No `sitemap.ts` (+ news-sitemap variant) — invariant #8 mandates auto-regenerating sitemap.
   - No `robots.ts`.
   - No RSS routes (global + per-pillar).
   - No `llms.txt` (context requires it for AI-search readiness).
2. **Dead links shipped by recent UI** (P0-C/P0-E overlap):
   - `footer.tsx:58` hard-links `/rss.xml` → **live 404**.
   - `pillar-content.tsx:113` RSS feed `<Button>` has **no href** (dead button).
   - `home/asia-spotlight.tsx:90` CTA → `/latest` → hits `[pillar]` `notFound()` → **404**.
   - `article/paywall.tsx:73` upgrade CTA → `/pro` → **404** (high-visibility paywall conversion link).
3. **P0-E error boundaries — MISSING**: no `error.tsx`, no `global-error.tsx` anywhere in `apps/web`. Uncaught errors fall to Next's bare default screen.

### P1 — quality / credibility (6 of 7 still stub/no-op)
- Newsletter subscribe is a **client-side fake** (`home/newsletter-cta.tsx:80` `alert('...demo')`; `newsletters/page.tsx:163` just toggles label). Copy claims "Double opt-in" — nothing backs it. No Resend dep.
- Cookie-banner **"Decline" is a no-op** identical to "Accept" (`cookie-banner.tsx:114` both call `dismiss()`). No consent state stored.
- **PostHog analytics not wired** — zero code/deps.
- **No Postgres backup/restore runbook**.
- **Dashboards = hardcoded sample arrays** labeled "Preview · coming soon" (`data.ts:486 FUNDING_ROWS`); no manual-entry backend.
- **Auth is a demo stub with surfaces fully exposed** (`auth-modal.tsx:19 demoLogin()`); Better-Auth not wired. Posture is "cosmetic-deferred", not "surface-hidden".
- **Invariant #5 gap**: `/trust/ai` (`trust-content.tsx:213-218`) still publicly promises the "AI-assisted label at top/middle/bottom" that was **removed inline 2026-06-05**. A code comment acknowledges it's left unsynced. → needs a **product copy decision** (rewrite policy OR re-add label).

### P2 — defer / hygiene
- "DailyTechWire" camel-case appears in 4 user-facing strings (`header.tsx:603-605`, `briefing/page.tsx:35`) vs canonical "Dailytechwire".
- Static `PILLARS` const in `data.ts:34-41` still load-bearing on **search filters, account Following tab, not-found, newsletters, i18n labels** → a CMS-added 7th pillar would be missing from those surfaces (invariant #8 only partially met site-wide; the named P0-B tail itself is fully done).
- Branch pruning (see §2.5).

---

## 4. RECOMMENDED NEXT TASK — P0-C SEO / Discoverability foundation

**Why this first:** It's the only fully-unstarted P0 cluster, it gates discoverability for a *publication*, and the recently-shipped UI already links to these missing backends (footer rss.xml, hrefless RSS button) — so launching now ships dead links + every article sharing one generic title. The plan log names P0-C as the explicit next step; invariant #8 depends on it.

**Effort:** L (cluster). Route: `vc-research-agent` → PLAN → EXECUTE (not a trivial fix).

**Scope:**
- **NEW files:**
  - `apps/web/src/app/sitemap.ts` (+ news-sitemap variant; pull published articles from `payload-server.ts`)
  - `apps/web/src/app/robots.ts` (with sitemap pointer)
  - RSS route handlers: `apps/web/src/app/rss.xml/route.ts` (global) + a per-pillar variant under the pillar route
  - `apps/web/public/llms.txt`
  - JSON-LD helper, e.g. `apps/web/src/components/seo/json-ld.tsx`
- **EDIT:**
  - `apps/web/src/app/layout.tsx` → add `metadataBase` + default `openGraph`
  - `apps/web/src/app/(reader)/article/[slug]/page.tsx` → `generateMetadata` (title/description/canonical/OG) + JSON-LD (NewsArticle + Author + Organization)
  - `apps/web/src/app/(reader)/[pillar]/page.tsx` → `generateMetadata`
  - `apps/web/src/components/pillar/pillar-content.tsx:113` → wire the RSS `href`
- **ENV:** add `NEXT_PUBLIC_SITE_URL` (local `.env.local` + Vercel Production/Preview)
- **Reuse:** existing cached reads in `apps/web/src/lib/payload-server.ts`.
- **Defer within this cluster:** `generateMetadata` on the 7 `use client` marketing/legal pages (needs a server-shell refactor) → do as a follow-up.

**Invariants to respect:** #8 (sitemap/RSS regenerate on CMS pillar add within ~5 min — reuse the `pillars:all` / `articles:all` cache tags); #1 (don't bypass Payload). Keep canonical brand name "Dailytechwire".

---

## 5. Sequence after P0-C
1. **P0-E**: add `error.tsx` + `global-error.tsx`; resolve `/latest` and `/pro` 404 CTAs (rss.xml gets fixed by P0-C). *(S/M, quick win — could even be done first if you want fast 404 reduction.)*
2. **P0-C tail**: `generateMetadata` on the 7 marketing/legal pages via server-shell refactor.
3. **Invariant #5**: get product copy decision on `/trust/ai`, rewrite; fix "DailyTechWire" casing.
4. **P1**: real newsletter subscribe + double opt-in (Resend).
5. **P1**: make cookie "Decline" gate + wire PostHog analytics (together).
6. **P1**: Postgres backup/restore runbook.
7. **P1**: real Better-Auth (or explicitly hide auth surfaces).
8. **P1**: dashboards manual-entry backend (L).
9. **Hygiene**: prune branches, reconcile plan log + memory.

---

## 6. For the picking-up agent — orientation

- **Stack:** Turborepo + pnpm 10.x; Next.js 15.4.11 App Router (`apps/web`), React 19, Payload CMS 3.85 embedded at `/admin`, Drizzle (`packages/db`, auth/account tables only — Payload owns editorial schema), Postgres = Neon Singapore.
- **Reader routes:** `apps/web/src/app/(reader)/`. Payload: `apps/web/src/app/(payload)/`. Root `layout.tsx` is minimal (fonts only).
- **CMS reads:** `apps/web/src/lib/payload-server.ts` (cached `unstable_cache`, tags `articles:all` / `wire-drops` / `pillars:all`). View adapter: `apps/web/src/lib/article-view.ts`.
- **Read first:** `CLAUDE.md`, `process/context/all-context.md` (esp. Project Invariants + the SEO/routing convention notes), `process/context/infra/all-infra.md` (ISR/revalidateTag), and the active plan.
- **Migrations:** Drizzle `packages/db/migrations/`; Payload `apps/web/src/payload/migrations/`. Never `db:push` — use `db:generate`+`db:migrate` / `payload:migrate:create`+`payload:migrate`. Prod auto-migrates on Vercel build (`apps/web/scripts/migrate-prod.mjs`, gated to `VERCEL_ENV=production`).
- **Verify it runs** (after `pnpm --filter web dev`):
  ```
  curl localhost:3000/                                   # 200, "Singapore quietly built"
  curl localhost:3000/ai                                 # 200
  curl localhost:3000/article/sea-ai-cluster-singapore   # 200
  curl localhost:3000/api/articles                       # JSON, 9 docs
  ```
- **Workflow:** RIPER-5 / orchestrator-delegates pattern (see `CLAUDE.md`). For P0-C: route to `vc-research-agent` → `vc-plan-agent` (write plan to `process/general-plans/active/`) → `vc-execute-agent` after explicit approval. Surface `vc-docs-seeker` for Next.js 15 metadata/sitemap API specifics.

---

*Generated from a read-only multi-agent audit. All file:line citations were valid on `main` as of 2026-06-15 — re-verify before asserting, code may have moved.*
