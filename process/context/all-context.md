# dtw-web - All Context

Last updated: 2026-06-12

This file is the root context entrypoint for the repo.

Use it for two things:

1. quick routing to the right context pack or root file
2. broad architecture and repository understanding

Start here before loading deeper context files.

---

## Project Description

**DailyTechWire (DTW)** — a digital-native technology publication with an Asia-tech focus: regional funding and tech-stock coverage, AI benchmarks and rankings, and deep-dive editorial. The web app (`dtw-web`) is the **reading and presentation layer** of a three-service system:

- `dtw-web` (this repo) — Next.js reader site + Payload CMS for editorial review
- `dtw-engine` — the Content Engine that drafts and pre-approves articles (independent service, separate repo)
- `dtw-workers` — background workers (future)

The three share `packages/db`. Engine writes go through the **Payload API only** (never directly to Postgres) so editorial hooks (ISR revalidation, search indexing, OG image generation) always fire.

**Editorial integrity is the product.** Clear separation between newsroom reporting, sponsored content (`Paid Partner`, mustard `#FEF3C7` background), and affiliate links (icon + disclosure tooltip). No popups. No in-article advertising. Disclosure boxes on sponsored / AI-assisted articles cannot be dismissed.

### Audience (priority order)

1. **Public readers** (primary) — Asia tech operators, investors, builders, on mobile + desktop. Drives every decision about performance, SEO, PWA/offline, and i18n.
2. **Editorial team** (secondary) — Author / Editor / Admin using the embedded Payload CMS to review, edit, flag sponsored / AI content, manage taxonomy. RBAC has 5 roles total.
3. **Dev team** — build, deploy, maintain the Engine ↔ Payload contract.

The web is NOT where articles are written — the Engine handles drafting. Editors review, edit, and configure display.

### Parent organisation

DailyTechWire is published by **Asia Press Corporation** (independent newsroom, Singapore, founded **2023**). Asia Press operates several publications across Asian beats; do **not** invent or list other publication names in code or copy. Editor-in-Chief is Cheryl Tan Hwee-Min (no specific career claims — earlier drafts were rejected for invented Reuters / Pulitzer history; do not reintroduce them). See `process/features/about-trust/_GUIDE.md`.

---

## Source-of-Truth Documents

When durable project facts conflict, this is the order of authority:

1. **`DTW_WEBSITE_REQUEST.xlsx`** (at repo root) — the canonical feature spec sheet. 86 rows covering every page, button, link, backend integration, and CMS surface. Read with `python3 -c "import openpyxl; ..."` (openpyxl is installed user-local).
2. **`DTW-Brand-Guideline-v1.0.pdf`** (at repo root, May 2026, 30 pages) — the official brand identity system: logo lockups, color palette (navy `#1E3A8A` / blue `#2563EB` / amber `#F59E0B`), pulse-signature anatomy, typography, misuse rules. **Authoritative for all visual identity and color decisions** — supersedes the prototype's cream/coral palette (applied to code 2026-06-12). Companion doc: `DTW_Implementation_Prompt_v1 - Copy (1).docx` (same palette in §2.3 + design principles).
3. **`design/`** — the Claude Design handoff bundle (layout/UX reference, NOT code to port, and **no longer a color reference** — colors follow the Brand Guideline). See `design/README.md`. Contains `chats/chat1.md` which records every design iteration and the rationale behind it. The prototype uses React 18 + Babel standalone in-browser — not the production stack.
4. **This repository** — code is authoritative once written; conflicts between spec and code should trigger a context update, not silent drift.

---

## How This File Works (the `all-*.md` Convention)

Every `process/context/` directory has one `all-*.md` entrypoint that acts as an attachable quick router for that domain. This root file (`all-context.md`) is the top-level router. Context groups each have their own `all-{group}.md` entrypoint.

```
process/context/
  all-context.md                      <-- THIS FILE: root router
  planning/all-planning.md
  tests/all-tests.md
  database/all-database.md
  auth/all-auth.md
  uxui/all-uxui.md
  infra/all-infra.md
  integrations/all-integrations.md
```

**How agents use it:**

1. Agent reads `all-context.md` first (this file)
2. Finds the relevant context group from the routing tables below
3. Reads that group's `all-{group}.md` entrypoint
4. Only then loads the specific deep doc or feature folder

Never load the whole `process/context/` tree.

---

## Current Root Entry Points

| File | Read when |
|---|---|
| `process/context/all-context.md` | any substantial planning, research, review, or implementation task |
| `process/context/tests/all-tests.md` | testing, verification, debugging test failures, execution planning |
| `process/context/planning/all-planning.md` | plan-shape calibration, planning examples, SIMPLE vs COMPLEX reference docs |
| `process/context/database/all-database.md` | Drizzle / Payload schema, migrations, the `lockedFields` / `origin` model |
| `process/context/auth/all-auth.md` | Better-Auth, RBAC 5 roles, magic link / OAuth / 2FA |
| `process/context/uxui/all-uxui.md` | design tokens, pillar colors, dark mode, i18n chrome, cover-art system, Claude Design references |
| `process/context/infra/all-infra.md` | deployment, ISR / `revalidateTag`, PostHog, Resend, perf targets |
| `process/context/integrations/all-integrations.md` | Content Engine API contract, Meilisearch sync, Soketi/Pusher, Stripe/VNPay/Momo (Phase 2) |

## Current Context Groups

| Group | Entry point | Scope |
|---|---|---|
| `planning/` | `process/context/planning/all-planning.md` | plan-shape calibration, SIMPLE vs COMPLEX, PRD examples |
| `tests/` | `process/context/tests/all-tests.md` | test runners, commands, debugging, gaps (greenfield — minimal so far) |
| `database/` | `process/context/database/all-database.md` | Postgres 16 + Drizzle + Payload schema, `origin`/`lockedFields` invariants, optimistic lock |
| `auth/` | `process/context/auth/all-auth.md` | Better-Auth on Drizzle, magic-link + OAuth + 2FA, RBAC 5 roles |
| `uxui/` | `process/context/uxui/all-uxui.md` | design tokens (CSS vars), pillar colors, Tailwind v4, shadcn/ui, cover-art system, dark mode, i18n chrome translations, paywall sign-in nudge behavior |
| `infra/` | `process/context/infra/all-infra.md` | Vercel + Railway/Fly + Cloudflare CDN/WAF, R2 + Mux, ISR + `revalidateTag`, PostHog, Resend, Lighthouse / LCP / CLS / INP targets |
| `integrations/` | `process/context/integrations/all-integrations.md` | Content Engine ↔ Payload API contract, Meilisearch index, Soketi/Pusher WebSockets, Stripe + VNPay + Momo (Phase 2), tracker for affiliate redirects |

## Task Routing Table

| Task type | Load first | Then load |
|---|---|---|
| general repo research | `all-context.md` | the domain group's `all-{group}.md` |
| implementation planning | `all-context.md`, `planning/all-planning.md` | the relevant feature folder `_GUIDE.md` + active plan |
| test planning or verification | `all-context.md`, `tests/all-tests.md` | the feature folder's reports or active plan |
| debugging | `all-context.md`, `tests/all-tests.md` if runtime is involved | the smallest domain doc |
| UI/UX work | `all-context.md`, `uxui/all-uxui.md` | `design/` source files for the component being touched |
| database / schema work | `all-context.md`, `database/all-database.md` | `process/features/engine-integration/_GUIDE.md` if it touches `lockedFields` / `origin` |
| auth / RBAC work | `all-context.md`, `auth/all-auth.md` | `process/features/account/_GUIDE.md` |
| infra / deployment | `all-context.md`, `infra/all-infra.md` | per-service runbook (added as docs grow) |
| Content Engine integration | `all-context.md`, `integrations/all-integrations.md`, `process/features/engine-integration/_GUIDE.md` | the conflict-resolution invariants in `database/all-database.md` |
| context maintenance | `all-context.md` | run `audit-context` after edits |

---

## Project Invariants (agents MUST preserve these)

Numbered, terse, load-bearing. Each one ties to a feature folder or context group for the why.

1. **Engine writes only via Payload API.** Never insert/update articles directly into Postgres from the Engine. `afterChange` hooks (ISR `revalidateTag`, Meilisearch index, OG image gen) must always fire. See `integrations/`.
2. **Conflict resolution = `lockedFields` + `editedByHuman` + optimistic lock** (compare `version` or `updatedAt`). Engine never overwrites a field that has been locked or that a human has edited. Human always wins on the same field. See `database/`.
3. **`origin: 'engine' | 'manual'`** is a required column on every article. Marks provenance.
4. **Paywall = soft block.** Meter (cookie for guests, DB for users) — never block mid-article. Phase 1 has no payment, only a sign-in nudge after ≥ 3 reads. The "3" must be configurable in CMS, never hardcoded. See `process/features/articles/_GUIDE.md`.
5. **Disclosure boxes (sponsored, AI-assisted)** appear at top + middle + bottom of article and cannot be dismissed.
6. **No popups. No mid-article ads.** Period.
7. **Brand colors fixed (DTW-Brand-Guideline-v1.0 §4, applied 2026-06-12):** brand navy `#1E3A8A` (primary-900), blue `#2563EB` (primary-600 — links/CTA/eyebrows), amber `#F59E0B` (accent-500 — badges/pulse-dot/awards ONLY; never a large background, never text on white), asia-accent `#DC2626` (Asia pillar ONLY), sponsored bg `#FEF3C7` (dark `#3B2E0A`), up `#10B981` / down `#EF4444` (market data + breaking flag only), dark bg `#0F172A` / text `#E2E8F0` (never pure black, never pure-white text). The pre-guideline coral `#E04E1F` is retired. See `uxui/`.
8. **Pillar/Sub-section/Tag are CMS entities** — adding a new pillar is a CMS write, not a code deploy. Routes (`/[pillar]/[subsection]/[slug]`), sitemap, and RSS regenerate automatically within 5 minutes.
9. **i18n year 1 = `en` / `id` / `vi`** with subpath routing `/en /id /vi`, `hreflang`, CSS logical properties (RTL-ready). Indonesian must work from day one — SEA tech market matters. CN/JP/KO planned for Year 3. Don't hardcode locale lists.
10. **Body of articles stays in the source language** — only the chrome (nav, byline, paywall meter, section headers) is translated. Editorial copy belongs to the writer.
11. **Tech stack veto list:** no Lucia (deprecated), no Bun runtime (Payload 3 ↔ Bun is unstable). Header identity: as of 2026-06-12 the header carries the inline `DtwLogo` / `DtwLogoCompact` components (`apps/web/src/components/dtw-logo.tsx`) — navy monogram block + "dailytechwire" wordmark + 7-dot pulse line with the gold dot fixed at position 2, theme-adaptive via `--logo-*` CSS vars (inverted variant on dark per guideline §2.2). Wordmark/monogram use logo-only Inter Bold / JetBrains Mono fonts, never the body Plex families (guideline §11). This supersedes the earlier text-only-wordmark design decision recorded in `design/chats/chat1.md`.
12. **Reader-data residency / compliance:** GDPR + PDPA (Singapore). PostHog is **self-hosted** specifically for first-party analytics. Nghị định 13 (Vietnam) was removed from Y1 data-residency compliance scope on 2026-06-12 per user decision. Vietnam REMAINS in i18n scope (invariant #9, locale `vi`) and as a target market (VNPay / Momo, Phase 2 payments) — this change narrows *data-residency compliance* only.
13. **Awards page (year-one state):** no medallion, no "see previous winners", no specific categories. Just "Coming this year" with the shimmer hero. Year 1 = inaugural.

If a change appears to violate one of these, surface it explicitly and ask before proceeding.

---

## Open Decisions

These are not invariants — they are unresolved choices recorded so future agents don't relitigate them silently.

- **Search engine:** spec lists Typesense OR Meilisearch for Y1. Current default in this doc is Meilisearch (matches design's `afterChange` reindex hook). Switch is reversible until index code lands.
- **CMS slot for `dtw-engine`:** the Engine repo lives outside this monorepo (deployed to Railway / Fly). The integration contract is "Payload REST/GraphQL API + shared `packages/db` schema." If the bulk-insert volume from Engine ever pressures the API, the fallback is direct DB insert + replicated revalidate/index logic — but stay on API path by default.
- **Stripe entity:** spec says Singapore (PDPA-aligned). Phase 2 work, no code yet.

---

## Context Group Lifecycle

Context groups are durable knowledge domains, not feature folders.

Create a group when:

- a topic has 3+ durable docs
- a single doc exceeds ~800 lines with separable subtopics
- multiple agents repeatedly need only one slice of a large context file
- the topic maps to a stable operational domain (tests, infra, database, auth, UI, workflows)

Do not create a group when:

- the content is a temporary report
- the content is a plan or execution artifact
- the topic is feature-specific and belongs in `process/features/...`

Move or split one group at a time. Use `all-{group}.md` entrypoints. Run the `audit-context` skill after every reorganisation.

## Naming Convention

There are no `README.md` files inside `process/context/`.

Canonical entrypoints use `all-*.md`:

- root: `process/context/all-context.md`
- group: `process/context/{group}/all-{group}.md`

## Context Update Protocol

When durable project knowledge changes:

1. update the smallest relevant context file
2. update this file if routing, ownership, naming, groups, or invariants changed
3. update the owning `all-{group}.md` entrypoint when a group exists
4. run `audit-context`

---

## Repository Structure

```
DTW/  (working directory — to become the dtw-web monorepo)
  DTW_WEBSITE_REQUEST.xlsx           # canonical spec sheet (86 rows)
  design/                            # Claude Design handoff (visual reference, not code)
    README.md                        # instructions for coding agents
    chats/chat1.md                   # iterative design history with rationale
    project/
      index.html                     # entry, design tokens (CSS vars) — read this first
      src/                           # 19 JSX modules: header, footer, homepage, article,
                                     # pillar, dashboards, search, newsletters, account,
                                     # auth, trust, about, data, i18n, icons, art,
                                     # effects, ui, app
      uploads/                       # source xlsx + screenshot
  CLAUDE.md / AGENTS.md              # vibecode kit managed protocol files
  .claude/ .codex/ .agents/          # kit agents, skills, hooks (do not hand-edit)
  process/
    context/                         # durable knowledge (this routing system)
    development-protocols/           # RIPER-5 methodology docs
    features/                        # 9 feature folders (see Feature Folder Index below)
    general-plans/                   # cross-feature plans, reports, references
    _seeds/                          # read-only templates
  (apps/, packages/, etc. — to be scaffolded in implementation phase)
```

When the Next.js scaffold lands, the expected layout is:

```
dtw-web/
  apps/
    web/                             # Next.js 15 App Router (this is the reader site + embedded /admin)
  packages/
    db/                              # Drizzle schema (shared with dtw-engine, dtw-workers)
    ui/                              # shared shadcn/ui + cover-art primitives
    config/                          # ESLint, TS, Tailwind preset
  turbo.json
  pnpm-workspace.yaml
```

## Technology Stack

- **Framework:** Next.js 15 (App Router) with React 19, TypeScript 5 (strict). SSG / ISR / RSC + streaming.
- **Runtime:** Node 22 LTS (pin via `.nvmrc` and `engines`). NOT Bun (Payload 3 incompatibility — see invariant #11).
- **Monorepo:** Turborepo + pnpm 9.
- **UI:** Tailwind CSS v4 (theming via CSS variables), shadcn/ui + Radix primitives. Source Serif 4 (editorial) + IBM Plex Sans (UI) + IBM Plex Mono (numbers, kbd).
- **CMS:** Payload CMS 3, embedded at `/admin` inside the Next.js app. Postgres adapter via Drizzle.
- **Database:** PostgreSQL 16, Drizzle ORM.
- **Auth:** Better-Auth (self-host on Drizzle / Postgres). Magic link + OAuth (Google / Apple / GitHub) + 2FA for admin / editor. RBAC roles: `Reader` / `Pro` / `Author` / `Editor` / `Admin`.
- **Search:** Meilisearch Y1 (Typesense is the alternate). Elasticsearch is the Y3 plan.
- **Cache / Queue:** Redis (Upstash) + BullMQ.
- **Realtime:** Soketi or Pusher for Wire Drops on the homepage.
- **Storage / media:** Cloudflare R2 + Cloudflare Images (AVIF + WebP, srcset 320 / 640 / 1024 / 1920). Video via Mux or Cloudflare Stream (HLS).
- **Email:** Resend + React Email (newsletters, double opt-in).
- **Analytics:** PostHog (self-host) — first-party analytics, session replay, feature flags. Search queries (especially zero-result) are tracked.
- **Payments (Phase 2):** Stripe Billing (Singapore entity) + VNPay / Momo for Vietnam + local Indonesian gateway.
- **TTS (Phase 2):** ElevenLabs or OpenAI for article audio.
- **Hosting:** Vercel (web), Railway / Fly (Engine, workers). Cloudflare CDN + WAF.

## Key Patterns and Conventions

**Error handling.** Throw inside route handlers and server actions; let Next.js surface the framework error. Result-pattern (`{ ok, data } | { ok, error }`) is reserved for utilities where the caller meaningfully branches.

**Import aliases (planned, set in `tsconfig.json` once scaffolded):** `@/` → `apps/web/src/`, `@dtw/db` → `packages/db/src`, `@dtw/ui` → `packages/ui/src`, `@dtw/config` → `packages/config/src`.

**Component layout.** Route-specific components live in the route's `_components/` directory. Shared primitives go in `@dtw/ui`. The design's `ui.jsx` (PillarTag, ByLine, DisclosureBox, Button, Spark, ArrowUpDown, Placeholder, Skeleton) is the canonical reference for primitive shape, not the implementation.

**Naming.** kebab-case files, PascalCase components, camelCase functions / variables.

**Theming.** Tailwind v4 reads from CSS variables defined in `index.html` of the design (see `uxui/all-uxui.md` for the full token list). Dark mode is `html[data-theme="dark"]`. Theme is persisted in localStorage. Components must never hardcode rgba — always use `var(--...)` or `color-mix(in oklab, var(--paper) X%, transparent)` so dark mode adapts correctly (this was a real bug the designer hit and fixed).

**i18n strategy.** Localised via subpath routing (`/en /id /vi`). Chrome strings (nav, byline, paywall, footer, section headers) use an inline `t(en, vi, id)` helper pattern (mirrored from `design/project/src/i18n.jsx`). Article body stays in source language. `hreflang` mandatory. CSS logical properties (margin-inline, padding-inline) so RTL is a config change.

**Routing.** Dynamic pillar tree: `/[pillar]/[subsection]/[slug]`. Adding a pillar in the CMS regenerates routes + sitemap + RSS without redeploy (≤ 5 min). News sitemap refresh: 15 min. JSON-LD `NewsArticle` + `Author` + `Organization`. `llms.txt` is required for AI-search readiness.

**Performance & a11y targets.** LCP < 1.5s, TTFB < 200ms, CLS < 0.05, INP < 200ms, Lighthouse mobile ≥ 95, search p95 < 300ms. WCAG 2.1 AA, contrast ≥ 4.5:1, axe-core 0 critical. Skeleton (not spinners) for loading. LQIP for hero images. ResizeObserver for fluid header heights (do not hardcode `--header-h`).

**PWA.** Workbox + `manifest.json`. Cache 50 most-recent articles + 20 most-recent per followed pillar in IndexedDB. Service Worker handles offline read + offline queue ("read later").

## Feature Folder Index

| Folder | Scope |
|---|---|
| `homepage/` | Hero (LQIP, ≤ 440px), Brief band, Wire Drops realtime, Pillar showcase (6 × 4), Asia Spotlight, Dashboards teaser, Deep Dive of the Week, Awards banner, Sponsored Strip, Best of Reviews (affiliate), Podcast, Newsletter CTA |
| `articles/` | Article page (serif body, ByLine, hero LQIP/HLS), disclosure boxes, TTS bar (Phase 2), related row, save / share, paywall meter + sign-in nudge (Phase 1); also covers pillar listing pages `/[pillar]/[subsection]/[slug]` |
| `cms/` | Payload 3 setup, `/admin` embedded mount, RBAC 5 roles, taxonomy entities (Pillar / Sub-section / Tag), sponsor slot configuration, disclosure flag enforcement |
| `dashboards/` | Asia Funding Tracker + AI Leaderboard (sortable, filterable, sparkline, count-up, CSV export, methodology, sponsor slot) |
| `search/` | Meilisearch index (articles + awards + people), faceted search with pillar/date/type filters, ⌘K overlay from header, PostHog query analytics for zero-result discovery |
| `newsletters/` | 6 newsletters (AM Brief, PM Brief, AI Weekly, Asia Funding Weekly, Dev Digest, Products Deals), Resend, double opt-in, segment-by-pillar |
| `account/` | Saved / Reading queue / History / Following pillars / Settings, IndexedDB ↔ DB sync, PWA offline cache rules. Auth flows live here (modal, magic link, OAuth callback) |
| `engine-integration/` | Content Engine ↔ Payload API contract, `lockedFields` / `editedByHuman` / `origin` model, optimistic lock, `afterChange` hook (revalidate + Meilisearch index + OG generation) |
| `about-trust/` | About page (Asia Press Corporation, Cheryl Tan EIC, no fake history), Editorial Standards, AI Disclosure, Corrections (public log), Transparency Report (auto-generated, Phase 2), Sponsored / Affiliate Policy |

---

## Scan Metadata

- Generated: 2026-05-28
- HEAD: (no git repo yet — greenfield)
- Mode: fresh
- Package manager: pnpm (planned, not yet initialised)
