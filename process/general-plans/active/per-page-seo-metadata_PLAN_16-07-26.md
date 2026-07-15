# Per-Page SEO / Social Metadata for dtw-web

**Date**: 16-07-26
**Complexity**: COMPLEX (standard complex — one execution stream, sequential RFCs)
**Scope**: Wave 1 (foundation + highest-impact server routes) + crawl surfaces (sitemap/robots/llms.txt)
**Execution Model**: Sequential RFCs (001 → 009), each independently verifiable, no parallel branches

## Overview

Every reader route in `apps/web/src/app/(reader)` currently inherits one static
`<title>` ("Dailytechwire") and one static meta description ("Tech Intelligence,
Wired Daily.") from the root layout — there is zero `metadataBase`, zero
OpenGraph/Twitter configuration, and zero structured data anywhere in the app.
This plan fixes the two user-visible pains — generic search titles and broken
link-preview cards — for the three highest-traffic, already-server-component
routes (article detail, pillar listing, homepage), lays a shared foundation
(env var, `metadataBase`, a reusable metadata/JSON-LD helper, one branded
default OG image) that every future wave reuses, and ships the three crawl
surfaces the project context marks as required (`sitemap.ts`, `robots.ts`,
`llms.txt`). It deliberately excludes hreflang (blocked on unbuilt i18n
routing), the eleven `"use client"` marketing/utility routes (a distinct,
larger follow-up), the dynamic per-article OG-image pipeline (unbuilt BullMQ
stub), and any Payload schema change (no editor-facing SEO override fields
this wave).

**Status**: ⏳ PLANNED

---

## Quick Links

- [Context and Goals](#context-and-goals)
- [Decisions Log](#decisions-log)
- [Out of Scope / Deferred](#out-of-scope--deferred)
- [Phase Completion Rules](#phase-completion-rules)
- [Execution Brief](#execution-brief)
- [Architecture Decisions](#architecture-decisions-final)
- [Data Flow](#data-flow)
- [RFCs](#rfcs)
- [Verification Strategy](#verification-strategy-comprehensive)
- [Touchpoints](#touchpoints)
- [Public Contracts](#public-contracts)
- [Blast Radius](#blast-radius)
- [Verification Evidence](#verification-evidence)
- [Resume and Execution Handoff](#resume-and-execution-handoff)
- [Acceptance Criteria](#acceptance-criteria)
- [Future Work](#future-work)
- [Implementation Checklist](#implementation-checklist-copyable)

---

## Context and Goals

**Ground truth (verified directly against the repo, not just the prior audit)**:

- `apps/web/src/app/layout.tsx:32-35` exports the only `metadata` object in
  the reader tree: `title: "Dailytechwire"`, `description: "Tech Intelligence,
  Wired Daily."` — no `metadataBase`, `openGraph`, `twitter`, or `alternates`.
- Zero `generateMetadata`/`metadata` exports exist anywhere under
  `apps/web/src/app/(reader)`. The only `generateMetadata` in the repo is
  Payload's own `/admin` boilerplate (`DO NOT MODIFY` banner) — not a style
  reference.
- No `NEXT_PUBLIC_SITE_URL` (or any site-origin env var) exists in
  `apps/web/.env.local`, and there is no `apps/web/.env.example` file at all.
- `apps/web/next.config.ts` has no `headers()` function, and there is no
  `middleware.ts` anywhere in the repo. **Correction to the prior audit**: the
  infra doc's "strict CSP" is an aspirational target, not implemented code —
  there is currently zero CSP enforcement, so an inline
  `<script type="application/ld+json">` needs no nonce/hash today. This is
  flagged as a Future Work item for whenever CSP actually ships.
- `apps/web/payload.config.ts:65-86` wires `@payloadcms/storage-s3` for R2
  without `disablePayloadAccessControl`, so `Media.url` (and every
  `Media.sizes.*.url`) stays a **relative** `/api/media/file/...` path
  regardless of whether the file lives on local disk or R2 — confirmed by
  reading `Media.ts` and `payload.config.ts` directly. Absolutizing via
  `metadataBase` is sufficient; no separate R2/CDN public-base config is
  needed.
- `apps/web/src/app/(reader)/article/[slug]/page.tsx` is already a server
  component (`revalidate = 60`) that calls the `unstable_cache`-wrapped
  `getArticleBySlug` (`apps/web/src/lib/payload-server.ts:216-231`, `depth:
  2`). `toArticleView` (`apps/web/src/lib/article-view.ts:79-127`) drops hero
  `width`/`height`/`mimeType` — `generateMetadata` must use the **raw**
  `Article` type, not `ArticleView`.
- **Field-name correction to the prior audit**: the Articles collection's
  provenance field is `engineSourceUrl` (`apps/web/src/payload/collections/
  Articles.ts:222-231`, `apps/web/src/payload/payload-types.ts:400`), not
  `sourceUrl`. This plan never wires `engineSourceUrl` into the page
  `alternates.canonical` — they are unrelated concepts.
- `apps/web/src/app/(reader)/[pillar]/page.tsx` and
  `apps/web/src/app/(reader)/page.tsx` (homepage) are also already server
  components with no refactor cost.
- `apps/web/payload.config.ts:49` already sets `admin.meta.titleSuffix:
  "— DailyTechWire"` and `apps/web/src/lib/email.ts:13` already sends from
  `"DailyTechWire <no-reply@...>"` — both use the `DailyTechWire` casing this
  plan standardizes on, confirming it is not a new invention, just a
  reconciliation of an existing inconsistency (`layout.tsx:33` and
  `manifest.ts:13-15` currently say `"Dailytechwire"`).
- `apps/web/scripts/seed-payload.ts` never sets `heroImage` on any seeded
  article — every seeded article's `heroImage` is `null`. Manual verification
  of the "real hero image" OG path requires uploading a hero image to at
  least one seeded article via `/admin` first; otherwise every local
  verification run only exercises the default-OG-image fallback path.
- Legal slugs are exactly `privacy | terms | cookies | gdpr`
  (`apps/web/src/app/(reader)/legal/[slug]/page.tsx:10,20`). Trust slugs are
  exactly `editorial | ai | corrections | transparency | sponsored`
  (`apps/web/src/app/(reader)/trust/[slug]/page.tsx:6-11`). Dashboards tabs
  are exactly `funding | ai`, with the bare `/dashboards` URL already
  rendering the `funding` tab by default
  (`apps/web/src/app/(reader)/dashboards/[[...sub]]/page.tsx:10-22`).
- `/preview` and `/exit-preview` are real root-level route handlers
  (`apps/web/src/app/preview/route.ts`, `apps/web/src/app/exit-preview/
  route.ts`). `/r/[token]` (affiliate redirect) does **not** exist yet — it is
  only a documented future pattern in `integrations/all-integrations.md:133`
  — so `robots.ts` must not reference it.
- No test runner exists anywhere in the repo (`apps/web/package.json` has no
  `test` script; no `vitest`/`playwright` config files). `process/context/
  tests/all-tests.md` confirms this is still greenfield. Verification in this
  plan is therefore `pnpm typecheck` / `pnpm build` / `pnpm lint` plus manual
  `curl` + browser + visual checks — there is no automated suite to hook
  into.
- Package versions: `next@15.4.11`, `react@^19.0.0`, `payload@^3.85.0`
  (supports the `select` query option used in RFC-007). Root `package.json`
  scripts are turbo-fanned: `pnpm dev` / `pnpm build` / `pnpm typecheck` /
  `pnpm lint`. The web package name is `"web"`.

**In scope** (per user-confirmed decisions):

- `NEXT_PUBLIC_SITE_URL` env + `metadataBase` + root layout upgrade
- A shared `src/lib/metadata.ts` helper (`buildMetadata`, `buildArticleJsonLd`,
  `DEFAULT_OG_IMAGE`, a single reusable Organization node, `siteOrigin`,
  `absoluteUrl`, `toJsonLdScript`)
- `generateMetadata` + NewsArticle JSON-LD for `/article/[slug]`
- `generateMetadata` for `/[pillar]`
- Metadata for the homepage (`/`)
- One static branded default OG image (`public/og-default.png`)
- `sitemap.ts`, `robots.ts`, `llms.txt`

**Out of scope (this plan)** — see [Out of Scope / Deferred](#out-of-scope--deferred)
for the full list and reasoning.

---

## Decisions Log

These are user-approved and are **not** to be relitigated during EXECUTE:

1. **Brand casing = `DailyTechWire`** everywhere this plan touches
   (`layout.tsx`, `manifest.ts`, the new metadata helper). Title template:
   `%s – DailyTechWire` using an **en dash `–`**, never an em dash `—`
   (`process/context/uxui/all-uxui.md:167`). `og:site_name = "DailyTechWire"`.
   JSON-LD `publisher` = **Asia Press Centre Group (APCG)**, Singapore,
   founded 2023 — no invented history, no other publication names.
2. **OG image = real hero + one static branded fallback.** Articles with a
   `heroImage` use `heroImage.sizes.hero` (falling back to the original
   `heroImage.url`/`width`/`height` if the 1600w derivative wasn't generated
   because the source was smaller). Articles without a hero, plus the
   homepage and pillar pages, use the static `public/og-default.png`
   (1200×630, geometric, no fake photography). The BullMQ dynamic OG pipeline
   (`revalidate.ts:72` TODO stub) is **not** built this wave.
3. **Production origin** for `NEXT_PUBLIC_SITE_URL` = `https://dailytechwire.com`
   (matches the existing DKIM/email domain precedent in `lib/email.ts:12`).
   Dev default `http://localhost:3000`. On Vercel previews, fall back to
   `https://${VERCEL_URL}` when the explicit var is unset.
4. **Scope = Wave 1 + crawl surfaces only.** Wave 2 (static metadata + noindex
   for briefing/newsletters/trust/account), Wave 3 (converting the 11
   `"use client"` pages to server shells), hreflang, the dynamic OG pipeline,
   and editor-facing SEO override fields are explicitly deferred — see below.

---

## Out of Scope / Deferred

Do **not** implement any of the following in this plan. Each is a legitimate,
separately-scoped follow-up:

| Item | Why deferred |
|---|---|
| `alternates.languages` (hreflang) | i18n subpath routing (`/en /id /vi`, invariant #9) is structurally unbuilt — no `middleware.ts`, no `[locale]` route segment (confirmed by direct search). Emitting hreflang now would be fabricated. Self-referencing `alternates.canonical` **does** ship now; the helper reserves (but does not populate) a `languages` hook for when locale routing lands. |
| Wave 2 — static metadata + `robots: noindex` for `/briefing`, `/newsletters`, `/trust/[slug]`, `/account/[[...tab]]` | Already-server routes, low structural cost, but a distinct, separately-verifiable batch of work. Sequence immediately after this plan. |
| Wave 3 — converting the 11 `"use client"` routes (`about`, `about/newsroom`, `awards`, `advertise`, `contact`, `press`, `studio`, `legal/[slug]`, `search`, `reset-password`, `dashboards/[[...sub]]`) to the proven server-shell + `*-content.tsx` split (already used by `trust/[slug]` and `newsletters`) | Larger refactor batch, each route needs its own verification pass. |
| Dynamic per-article OG card generation (BullMQ `afterChange` → `next/og` or `@vercel/og`) | `revalidate.ts:72` is a TODO stub; standing up the queue is a separate infra workstream. |
| Editor-facing SEO override fields (`@payloadcms/plugin-seo` or a hand-rolled `metaTitle`/`metaDescription`/`ogImage` group on Articles/Pillars) | Schema/migration change; the derived-metadata approach in this plan ships real per-page titles/previews with zero schema change. |
| RSS feed routes (per-pillar/author/tag) | Documented in `infra/all-infra.md:68` as planned but fully unbuilt; unrelated to the two pains this plan fixes. |
| CSP nonce/hash allowance for the JSON-LD `<script>` | No CSP exists in the repo today (verified). Add this when CSP is actually implemented — flagged in Future Work so it isn't forgotten. |
| A dedicated square logo raster for JSON-LD `publisher.logo` | This plan reuses `og-default.png` (1200×630) as a pragmatic stand-in since it's the only branded raster asset that will exist. A proper square logo is a small follow-up. |

---

## Phase Completion Rules

A phase (RFC) is NOT complete until:

1. **Integration Test** — Works with the rest of the app (build succeeds, no
   new typecheck errors, route renders without throwing).
2. **Manual Test** — A human (or the executing agent, standing in) performs
   the exact `curl`/browser check listed in that RFC's Verification.
3. **Data Verification** — Where the RFC reads CMS data, confirm the emitted
   HTML/XML actually reflects real Payload data (not a hardcoded stub).
4. **Error Handling** — 404/`notFound()` paths and draft-mode paths behave
   correctly (no crash, no leaking of unpublished content into metadata).
5. **User Confirmation** — User (or reviewing agent) confirms the specific
   check(s) listed for that RFC.

Status meanings:

- ⏳ PLANNED — Not started
- 🔨 CODE DONE — Written but not manually verified
- 🧪 TESTING — Currently being verified
- ✅ VERIFIED — Manually verified AND confirmed working
- 🚧 BLOCKED — Has issues

---

## Execution Brief

### RFC-001 — Shared metadata helper (`src/lib/metadata.ts`)

**What happens:** Create the one new file every other RFC imports from:
`siteOrigin()`, `absoluteUrl()`, `DEFAULT_OG_IMAGE`, `buildMetadata()`,
`ORGANIZATION` node, `buildArticleJsonLd()`, `toJsonLdScript()`.

**Test:** `pnpm typecheck` passes; the file has zero external side effects
(no Payload import, no DB call) so it can be imported from any server file.

### RFC-002 — Env var + root layout upgrade

**What happens:** Add `NEXT_PUBLIC_SITE_URL` to `.env.local` (dev) and create
`apps/web/.env.example`; upgrade `layout.tsx`'s `metadata` export with
`metadataBase`, `title.template`, default `openGraph`/`twitter`; rename the
brand string in `layout.tsx` and `manifest.ts`.

**Test:** `pnpm build` output contains **no** "metadataBase" warning. Every
untouched route (e.g. `/about`) still renders `<title>DailyTechWire</title>`
(proves the template doesn't leak onto routes with no metadata of their own).

### RFC-003 — Branded default OG image

**What happens:** Write a small one-off Node script that rasterizes a
hand-specified SVG (navy background, cream wordmark + tagline, terracotta/
amber geometric accent, no photography) to `public/og-default.png` (1200×630)
via `sharp` (already a dependency).

**Test:** Visual check — open the PNG, confirm dimensions and that it matches
the brief; confirm it's legible at thumbnail size.

### RFC-004 — `/article/[slug]` `generateMetadata` + NewsArticle JSON-LD

**What happens:** Highest-impact route. Add `generateMetadata` reading the
raw depth-2 `Article`, mapping title/dek/hero to title/description/OG/Twitter,
`alternates.canonical`, `robots: {index:false}` on draft renders. Render an
inline `<script type="application/ld+json">` NewsArticle block in the page
body (not draft renders).

**Test:** `curl` the article route; confirm distinct title, absolute
`og:image`, canonical link, and a parsable JSON-LD block with `@type:
"NewsArticle"` and the correct publisher.

### RFC-005 — `/[pillar]` `generateMetadata`

**What happens:** Add `generateMetadata` deriving title from
`heading || title.en`, description from `description`, canonical, default OG
image (no per-pillar image field exists).

**Test:** `curl` `/ai` and `/latest`; confirm distinct titles/descriptions per
pillar and a valid canonical.

### RFC-006 — Homepage metadata

**What happens:** Add a static `metadata` export (no dynamic params) setting
canonical `/`, `openGraph.type: "website"`, default OG image; title/
description inherit the site defaults from RFC-002 (deliberately — homepage
IS the brand root, so re-stating the same copy would be redundant, not a
gap).

**Test:** `curl` `/`; confirm canonical `/` and OG image present.

### RFC-007 — `sitemap.ts`

**What happens:** New `getSitemapArticles()` helper in `payload-server.ts`
(Payload `select` + `limit: 0`, tag `articles:all`). New `apps/web/src/app/
sitemap.ts` enumerating `/`, every CMS pillar, every published article
(CMS-driven), plus a hardcoded list of genuinely code-defined static routes
(marketing/legal/trust/dashboards — NOT CMS taxonomy, so hardcoding is
correct here, not a violation of invariant #8).

**Test:** `curl /sitemap.xml`; confirm valid XML, all 6 pillars present, and
every seeded published article slug present.

### RFC-008 — `robots.ts`

**What happens:** New `apps/web/src/app/robots.ts` disallowing `/admin`,
`/account`, `/search`, `/reset-password`, `/preview`, `/exit-preview`,
`/api`; references the sitemap.

**Test:** `curl /robots.txt`; confirm disallow list and `Sitemap:` line with
the correct absolute URL.

### RFC-009 — `llms.txt`

**What happens:** New `apps/web/src/app/llms.txt/route.ts` (Route Handler,
folder name literally `llms.txt`) returning `text/plain`, built from
`getNavPillars()` (already exists, cached) plus a short hand-authored intro
paragraph pulled from the already-approved `all-context.md` facts (no new
claims).

**Test:** `curl /llms.txt`; confirm all 6 pillars listed with correct URLs and
an accurate, non-fabricated description.

### Expected Outcome (after this plan)

- `/`, `/article/{slug}`, and every `/{pillar}` route emit a distinct
  `<title>`, meta description, canonical link, OpenGraph card, and Twitter
  card, with an **absolute** image URL.
- Article pages additionally emit a valid NewsArticle + Author + Organization
  JSON-LD block.
- Draft/preview article renders are marked `noindex` and never emit JSON-LD.
- `/sitemap.xml`, `/robots.txt`, `/llms.txt` exist, are CMS-data-driven where
  the underlying content is CMS taxonomy, and honor a 15/60-minute-class
  regeneration cadence via Next's built-in ISR — no new cron/queue infra.
- Every other route (the 11 `"use client"` + already-server Wave-2 routes)
  is unaffected and continues to show the renamed `DailyTechWire` default —
  correctly, not as a regression.

---

## Architecture Decisions (Final)

1. **Derive metadata from existing editorial fields; no schema change.** No
   collection has SEO override fields today (verified: only
   `admin.meta.titleSuffix` exists, which is CMS-admin-only). Adding a plugin
   or a metaTitle/metaDescription/ogImage group is deferred — see Out of
   Scope.
2. **`generateMetadata` on `/article/[slug]` uses the raw depth-2 `Article`
   type, not `ArticleView`.** `toArticleView` drops `heroImage`
   width/height/mimeType, which `og:image:width`/`og:image:height` need.
3. **Absolutization split by mechanism.** Next.js Metadata API fields
   (`openGraph.images`, `twitter.images`, `alternates.canonical`) receive
   **relative** paths and let Next's built-in `metadataBase` resolution
   handle them — this is the idiomatic Next.js pattern and avoids
   reimplementing URL joining. The hand-rolled JSON-LD `<script>` bypasses
   the Metadata API entirely, so it uses a manual `absoluteUrl()` helper
   (`new URL(path, siteOrigin())` — safe to call on already-absolute inputs
   too, since the WHATWG URL constructor ignores the base when the first
   argument is already absolute).
4. **One static shared default OG image, no dynamic pipeline this wave.**
   Covers homepage, pillar pages, and hero-less articles. The BullMQ
   `afterChange` OG pipeline stays a TODO stub.
5. **Crawl surfaces use Next's built-in ISR window, not new cron/queue
   infra.** `sitemap.ts` sets `revalidate = 900` (15 min, matching the infra
   doc's news-sitemap cadence); `llms.txt`'s route handler sets `revalidate
   = 3600` (pillar taxonomy changes far less often than articles publish).
6. **CMS-data-driven only where the content actually is CMS taxonomy.**
   Pillars and Articles are enumerated from Payload. The marketing/legal/
   trust/dashboards static paths in `sitemap.ts` are hardcoded literals
   because they are genuinely code-defined App Router routes, not CMS
   entities — applying invariant #8's "no hardcoded pillar/route lists" to
   them would be a misapplication of that invariant.
7. **Brand casing reconciled to `DailyTechWire`** in every file this plan
   touches, matching existing precedent (`payload.config.ts:49`,
   `email.ts:13`) rather than the currently-inconsistent `layout.tsx:33` /
   `manifest.ts:13-15` `"Dailytechwire"`.
8. **hreflang intentionally not implemented; canonical is.** i18n subpath
   routing (invariant #9) is structurally absent (no middleware, no
   `[locale]` segment). A self-referencing `alternates.canonical` is safe
   and ships now; `alternates.languages` would be fabricated and is
   deferred until locale routing exists.
9. **JSON-LD injection needs no CSP handling today** — no CSP is
   implemented anywhere in the repo (verified: no `headers()` in
   `next.config.ts`, no `middleware.ts`, no CSP meta tag). This is a
   deliberate finding, not an oversight — flagged in Future Work for
   whenever CSP is actually built.

---

## Data Flow

```
Editor publish/edit in /admin
        │
        ▼
Articles.afterChange (revalidate.ts, UNCHANGED by this plan)
        │  bust cache tag "articles:all"
        ▼
Next request for /article/{slug}
        │
        ├──▶ generateMetadata(params)              ├──▶ ArticlePage(params)
        │     - getArticleBySlug(slug)              │     - getArticleBySlugDraft/getArticleBySlug
        │       (cache-tag "articles:all" read;      │       (same cached function; cache HIT, not a
        │        cache HIT in steady state, not a    │        fresh DB round trip in steady state)
        │        fresh DB round trip)                │     - toArticleView(article)  [UNCHANGED]
        │     - buildMetadata({ ...relative image })│     - buildArticleJsonLd({ ...absolute image })
        │     - Next resolves relative OG/canonical  │     - toJsonLdScript(jsonLd)  [escapes "<"]
        │       URLs against layout.tsx metadataBase │     - <script type="application/ld+json">
        │                                             │       rendered as a sibling of <ArticleContent/>
        ▼                                             ▼
   <head> populated: title, description,        <body>: existing ArticleContent (UNCHANGED)
   canonical, openGraph, twitter                  + new inline JSON-LD script
        │                                             │
        └──────────────────┬──────────────────────────┘
                            ▼
              Full HTML response to crawler / social scraper
```

---

## RFCs

Execute strictly in order. Each RFC states files, exact behavior, and its own
verification gate. RFC-001 blocks every other RFC; RFC-003 blocks RFC-004/005/
006 (they reference `DEFAULT_OG_IMAGE`'s path, which must resolve to a real
file before those routes are considered done, though the code can be written
in parallel).

### RFC-001 — Shared metadata helper

**Dependencies:** none.

**File:** new `apps/web/src/lib/metadata.ts` (no metadata/SEO helper exists
in `src/lib` today — confirmed).

**Exports and exact behavior:**

- `siteOrigin(): string` — returns `process.env.NEXT_PUBLIC_SITE_URL` if set;
  else `https://${process.env.VERCEL_URL}` if `VERCEL_URL` is set; else
  `http://localhost:3000`. This single function is the only place this
  fallback chain is implemented — both `layout.tsx` (for `metadataBase`) and
  this file's own `absoluteUrl()` must call it, never duplicate the chain.
- `absoluteUrl(path: string): string` — `new URL(path, siteOrigin())
  .toString()`. Used only for the hand-rolled JSON-LD fields, never for
  Metadata API fields (those stay relative and let `metadataBase` resolve
  them).
- `DEFAULT_OG_IMAGE` — a constant object: `url: "/og-default.png"`, `width:
  1200`, `height: 630`, `alt: "DailyTechWire – Tech Intelligence, Wired
  Daily"` (en dash, per the Decisions Log). Points at the file RFC-003
  creates.
- `ORGANIZATION` — a constant object for the JSON-LD `publisher`/schema.org
  Organization node: `name: "Asia Press Centre Group (APCG)"`, `url:
  siteOrigin()`, `logo: { url: absoluteUrl(DEFAULT_OG_IMAGE.url) }`. No
  `foundingDate`, `sameAs`, or social URLs — none are confirmed anywhere in
  project context, so none are invented.
- `buildMetadata(input)` — accepts: optional `title` (string; when omitted,
  the route inherits the root layout's `title.default` verbatim, NOT the
  template — this is the mechanism RFC-006 uses for the homepage),
  `description` (required string), `canonicalPath` (required, e.g. `"/"`,
  `"/article/foo"`, `"/ai"`), optional `image` (`{ url, width, height, alt }`
  — relative path preferred, gets resolved via `metadataBase`), optional
  `type` (`"website" | "article"`, default `"website"`), optional
  `publishedTime`/`modifiedTime` (ISO strings, article only), optional
  `authors` (string array, article only), optional `section` (pillar label,
  article only), optional `robots` (`{ index: boolean; follow?: boolean }`).
  Returns a `Metadata` object composing: `title` (string or omitted),
  `description`, `alternates: { canonical: canonicalPath }`, `openGraph`
  (`type`, `url: canonicalPath`, `siteName: "DailyTechWire"`, `images: [image
  ?? DEFAULT_OG_IMAGE]`, plus `publishedTime`/`modifiedTime`/`authors`/
  `section` when `type === "article"`), `twitter` (`card:
  "summary_large_image"`, `images: [(image ?? DEFAULT_OG_IMAGE).url]`), and
  `robots` when provided. Reserve (comment, do not populate) a spot for
  `alternates.languages` per Architecture Decision 8 — do not add hreflang
  data.
- `buildArticleJsonLd(input)` — accepts: `title`, `description` (dek),
  `canonicalUrl` (absolute — caller passes `absoluteUrl(canonicalPath)`),
  `imageUrl` (absolute), `imageWidth`/`imageHeight` (optional numbers),
  `datePublished`/`dateModified` (ISO strings), `authorName` (string),
  `authorRole` (optional string — maps to schema.org `Person.jobTitle`),
  `coAuthorNames` (optional string array). Returns a plain JS object (not a
  string) shaped as schema.org `NewsArticle`: `@context:
  "https://schema.org"`, `@type: "NewsArticle"`, `headline: title`,
  `description`, `image: [imageUrl]` (with `width`/`height` as sibling
  properties on the image entry only when both are known — otherwise a bare
  URL string is schema.org-valid too), `datePublished`, `dateModified`,
  `author`: a single `{ "@type": "Person", name, jobTitle? }` object when
  there are no co-authors, or an array of such objects (primary author first)
  when `coAuthorNames` is non-empty, `publisher: ORGANIZATION` shaped as
  `{ "@type": "Organization", ...ORGANIZATION }`, `mainEntityOfPage: {
  "@type": "WebPage", "@id": canonicalUrl }`.
- `toJsonLdScript(data: unknown): string` — `JSON.stringify(data)` with every
  literal `<` character replaced with `<`. This is a **required security
  detail**, not optional polish: `JSON.stringify` does not escape `</script>`
  sequences, and since editorial `title`/`dek` values are set by
  Author/Editor/Admin CMS users (not fully trusted-by-construction), an
  unescaped `</script>` inside a title could break out of the script tag.
  Callers render the script tag's `dangerouslySetInnerHTML` from this
  function's return value, never from raw `JSON.stringify`.

**No `"server-only"` guard** — this file has zero DB/secret dependency (only
reads the `NEXT_PUBLIC_*`-safe env var chain), so it is safe to import from
any server file. It is never imported from a `"use client"` file in this
plan.

**Verification:** `pnpm typecheck` passes. No other route imports this file
yet (RFC-002 is the first consumer), so there is no runtime check for this
RFC in isolation beyond typecheck.

---

### RFC-002 — Env var + root layout upgrade

**Dependencies:** RFC-001 (imports `siteOrigin`, `DEFAULT_OG_IMAGE` from
`src/lib/metadata.ts`).

**Files:**

- `apps/web/.env.local` (gitignored, developer-local) — append
  `NEXT_PUBLIC_SITE_URL=http://localhost:3000` to the existing file. Do not
  modify any other existing line/value in this file.
- `apps/web/.env.example` (new, tracked in git) — mirror the existing
  documented-template style already present at the top of `.env.local`
  (numbered setup comments), and add `NEXT_PUBLIC_SITE_URL` with a comment
  explaining the fallback chain (`NEXT_PUBLIC_SITE_URL` explicit → `https://
  ${VERCEL_URL}` on Vercel → `http://localhost:3000` dev default) and noting
  the production value is `https://dailytechwire.com`.
- `apps/web/src/app/layout.tsx` — replace the current static `metadata`
  object (lines 32-35) with: `metadataBase: new URL(siteOrigin())`; `title:
  { default: "DailyTechWire", template: "%s – DailyTechWire" }` (en dash);
  `description: "Tech Intelligence, Wired Daily."` (unchanged copy, kept
  verbatim — only the title casing changes); `openGraph: { siteName:
  "DailyTechWire", type: "website", images: [{ url: DEFAULT_OG_IMAGE.url,
  width: DEFAULT_OG_IMAGE.width, height: DEFAULT_OG_IMAGE.height, alt:
  DEFAULT_OG_IMAGE.alt }] }`; `twitter: { card: "summary_large_image",
  images: [DEFAULT_OG_IMAGE.url] }`. Everything else in this file (font
  loading, `<html>`/`<body>` structure) is untouched.
- `apps/web/src/app/manifest.ts` — rename `name`/`short_name` from
  `"Dailytechwire"` to `"DailyTechWire"` (lines 13-14). `description` (line
  15) stays exactly `"Tech Intelligence, Wired Daily."` — unchanged.

**Behavior guarantee to preserve:** routes that export no `metadata`/
`generateMetadata` of their own must continue to show exactly
`<title>DailyTechWire</title>` (inheriting `title.default`, not run through
the template — Next.js only interpolates `%s` for routes that provide their
own `title` string). Confirm this explicitly during verification so the
change is provably non-breaking for the 15 untouched routes.

**Verification:**

- `pnpm build` — the build log must contain **no** warning mentioning
  `metadataBase`.
- `pnpm dev`, then `curl -s http://localhost:3000/about | grep -o
  '<title>[^<]*</title>'` → expect exactly `<title>DailyTechWire</title>`
  (proves untouched routes are safe).
- Same `curl` against `/manifest.webmanifest` → confirm `"name":
  "DailyTechWire"`.

---

### RFC-003 — Branded default OG image

**Dependencies:** RFC-001 (path constant only; no code dependency).

**File:** new `apps/web/scripts/generate-og-default.mjs` (matches the
existing `apps/web/scripts/` convention — `seed-payload.ts`,
`migrate-prod.mjs`), producing `apps/web/public/og-default.png` (new, static
binary asset, committed to the repo — not regenerated at request time).

**Visual brief (exact, no creative decisions left for EXECUTE):**

- Canvas: 1200×630px, PNG, solid background (no transparency).
- Background color: `#1B2A52` (the `--banner` token — navy in both themes,
  the correct theme-invariant choice for a static asset).
- Geometric accent: 3–5 overlapping rounded-rectangle shapes (corner radius
  ≈ 24px, sizes roughly 120–360px), colored `#D4623C` (`--accent`) and
  `#F59E0B` (`--amber`) at varying opacity (60–100%), positioned in the
  right third of the canvas (x ≈ 760–1180px). Purely typographic/geometric —
  no photography, no stock imagery, no faces (per the cover-art "no fake
  photography" rule).
- Wordmark: lowercase `dailytechwire`, bold weight, roughly 56px, left-
  aligned around x=72, vertically centered, color fixed `#FFFFFF` (white —
  per the "Banner text rule" in `uxui/all-uxui.md`, text on `--banner`
  surfaces must use a **fixed** cream/white value, never a `--paper`/`--ink`-
  derived `color-mix`, since `--banner` is navy in both themes). A small
  terracotta pulse-dot (`#D4623C`, ~14px diameter) immediately adjacent to
  the wordmark, echoing the logo's pulse-dot element.
- Tagline directly beneath the wordmark: `Tech Intelligence, Wired Daily`
  (sentence case, per invariant #11 — not all-caps), roughly 24px, color a
  fixed `rgba(232,237,247,0.72)` (muted cream, also fixed per the Banner text
  rule).
- Font: attempt the site's brand faces (Schibsted Grotesk / IBM Plex Sans);
  if the rasterizer's environment doesn't have them reliably available and
  embedding is nontrivial, fall back to a generic bold system sans-serif for
  this **one static asset only** — a one-time visual asset with a
  substituted system font is preferable to blocking on a font-embedding
  pipeline. Note the substitution (or its absence) in the PR/commit
  description.
- Implementation mechanism: build an SVG string in the script matching the
  above brief, then rasterize it to PNG via `sharp` (already a project
  dependency — imported in `payload.config.ts`). No new npm dependency
  required.

**Verification:** Open `apps/web/public/og-default.png` in an image viewer;
confirm exactly 1200×630px; confirm it visually matches the brief (navy
background, white wordmark + pulse-dot, muted-cream tagline, terracotta/
amber geometric accent, no photography); confirm it stays legible at a small
thumbnail size (view at ~20% zoom).

---

### RFC-004 — `/article/[slug]` `generateMetadata` + NewsArticle JSON-LD

**Dependencies:** RFC-001, RFC-002, RFC-003.

**File:** `apps/web/src/app/(reader)/article/[slug]/page.tsx` (modified;
existing body/render logic and imports stay — only additive changes).

**`generateMetadata(params)` behavior:**

- Await `params` for `slug` (mirrors the existing page component's own
  `await params` pattern).
- Check `draftMode()` for `isDraft`, exactly mirroring the page component's
  existing branch, and fetch via `getArticleBySlugDraft(slug)` or
  `getArticleBySlug(slug)` accordingly — both are already `unstable_cache`-
  wrapped (`articles:all` tag), so this second call in the same request is a
  cache read, not a fresh Payload/Postgres query in steady state. No new
  request-level memoization wrapper is needed for this pass (noted as an
  optional future micro-optimization in Future Work, not required now).
- If no article is found, call `notFound()` from within `generateMetadata`
  itself (officially supported by Next.js) — do not emit generic fallback
  metadata for an unresolvable slug.
- Resolve the hero image via a three-tier fallback: prefer
  `article.heroImage.sizes.hero` (`url`/`width`/`height`) when present; else
  fall back to `article.heroImage.url`/`width`/`height` (the original,
  present whenever `heroImage` is set but the source was smaller than the
  1600w derivative threshold); else fall back to `DEFAULT_OG_IMAGE`. `alt`
  text always comes from the top-level `article.heroImage.alt` (required
  field) when a hero exists, else `DEFAULT_OG_IMAGE.alt`.
- Call `buildMetadata({ title: article.title, description: article.dek,
  canonicalPath: "/article/" + article.slug, image: { url: <resolved
  relative path from above>, width, height, alt }, type: "article",
  publishedTime: article.publishedAt, modifiedTime: article.updatedAt,
  authors: [author.name, ...coAuthors.map(a => a.name)], section:
  pillar.heading || pillar.title.en, robots: isDraft ? { index: false,
  follow: false } : undefined })`. Author/pillar are the depth-2-expanded
  relationship objects already returned by `getArticleBySlug` — do not
  re-fetch them separately.

**Page body change:** immediately after (or before) the existing
`<ArticleContent .../>` render, add a sibling `<script
type="application/ld+json" dangerouslySetInnerHTML={{ __html:
toJsonLdScript(jsonLd) }} />`, where `jsonLd` is built via
`buildArticleJsonLd({ title: article.title, description: article.dek,
canonicalUrl: absoluteUrl("/article/" + article.slug), imageUrl:
absoluteUrl(<the same resolved image path used above>), imageWidth,
imageHeight, datePublished: article.publishedAt, dateModified:
article.updatedAt, authorName: author.name, authorRole: author.role,
coAuthorNames: coAuthors.map(a => a.name) })`. **Only render this script
when `!isDraft`** — draft/preview renders must never emit JSON-LD (they are
not indexable, and the content is not final).

**Verification:**

- `curl -s http://localhost:3000/article/{a-seeded-slug} | grep -o
  '<title>[^<]*</title>'` → `<title>{Article Title} – DailyTechWire</title>`.
- Same URL, `grep -o 'property="og:image" content="[^"]*"'` → the content
  value is an **absolute** URL (starts with `http://localhost:3000` in dev).
  Since the seed data has no `heroImage` (confirmed), this will resolve to
  the absolute `og-default.png` URL for every seeded article unless a hero
  is manually uploaded via `/admin` first — upload one hero image to a
  seeded article and re-run this check to also exercise the real-hero path.
- Same URL, `grep -o '<link rel="canonical"[^/]*/>'` → present, matches
  `/article/{slug}`.
- Same URL, extract the `application/ld+json` script content; confirm it
  parses as JSON, `@type` is `"NewsArticle"`, `publisher.name` is `"Asia
  Press Centre Group (APCG)"`, `author` reflects the real byline.
- Visit `/preview?slug={a-seeded-slug}` (or use the `/admin` "Preview"
  button on an unpublished draft); confirm the rendered `<meta
  name="robots">` includes `noindex` and that no `application/ld+json`
  script is present in the response.
- Visit a route NOT touched by this RFC (e.g. `/about`) to confirm no
  regression (already covered in RFC-002's verification; re-check here since
  this RFC is the first to actually exercise the template on a real title).

---

### RFC-005 — `/[pillar]` `generateMetadata`

**Dependencies:** RFC-001, RFC-002, RFC-003.

**File:** `apps/web/src/app/(reader)/[pillar]/page.tsx` (modified; existing
body untouched).

**Behavior:**

- Await `params` for `pillar` (the slug), mirroring the existing pattern.
- Call `getPillars()` (already exists, cached, `depth: 0`) and find the
  matching `pillarDoc` by slug, exactly mirroring the page component's own
  lookup.
- If no match, call `notFound()` from `generateMetadata`.
- Call `buildMetadata({ title: pillarDoc.heading || pillarDoc.title.en,
  description: pillarDoc.description ?? <the site default description as a
  fallback for pillars with no description set>, canonicalPath: "/" +
  pillarDoc.slug, image: DEFAULT_OG_IMAGE (no per-pillar image field
  exists), type: "website" })`.

**Verification:** `curl` `/ai` and `/latest` (or any two seeded pillar
slugs); confirm distinct `<title>` values (`{Pillar Heading} –
DailyTechWire`), distinct descriptions where the CMS `description` field
differs, and a correct canonical (`/ai`, `/latest`).

---

### RFC-006 — Homepage metadata

**Dependencies:** RFC-001, RFC-002, RFC-003.

**File:** `apps/web/src/app/(reader)/page.tsx` (modified; existing body
untouched).

**Behavior:** Add a static `export const metadata: Metadata = buildMetadata({
canonicalPath: "/", description: "Tech Intelligence, Wired Daily.", image:
DEFAULT_OG_IMAGE, type: "website" })` — deliberately **omit** `title` so the
route inherits `title.default` ("DailyTechWire") verbatim rather than
re-stating brand copy through the template (which would otherwise render as
"DailyTechWire – DailyTechWire" if a literal title string were passed). This
is a static object, not `generateMetadata` — the homepage has no dynamic
route params.

**Verification:** `curl -s http://localhost:3000/ | grep -o
'<title>[^<]*</title>'` → exactly `<title>DailyTechWire</title>` (not
duplicated). `grep -o '<link rel="canonical"[^/]*/>'` → `/`. `grep -o
'property="og:image" content="[^"]*"'` → absolute `og-default.png` URL.

---

### RFC-007 — `sitemap.ts`

**Dependencies:** RFC-002 (uses `siteOrigin()` conceptually via
`metadataBase`-independent absolute URL construction — `sitemap.ts` builds
its own absolute URLs directly from `siteOrigin()`, since the sitemap file
convention does not participate in `metadataBase` resolution).

**Files:**

- `apps/web/src/lib/payload-server.ts` (modified — add one new export,
  existing exports untouched): `getSitemapArticles()` — an `unstable_cache`-
  wrapped query (cache key `["articles:sitemap"]`, tag `["articles:all"]`
  — reuses the exact existing invalidation path already fired by
  `revalidateArticle` in `hooks/revalidate.ts`, `revalidate: 900`) that
  queries the `articles` collection, filters `_status: { equals:
  "published" }`, projects only `slug`, `updatedAt`, `publishedAt` via
  Payload's `select` option (supported in the installed `payload@^3.85.0`),
  sets `limit: 0` (Payload's documented "no pagination cap, return every
  matching doc" value) and `depth: 0` (no relationship expansion needed).
  Returns the array of matching docs.
- `apps/web/src/app/sitemap.ts` (new). `export const revalidate = 900;`.
  Default export returns an array of sitemap entries:
  - `/` — `priority: 1.0`, `changeFrequency: "hourly"`.
  - one entry per pillar from `getPillars()` (existing, cached) —
    `url: siteOrigin() + "/" + pillar.slug`, `priority: 0.8`,
    `changeFrequency: "hourly"`.
  - one entry per doc from `getSitemapArticles()` —
    `url: siteOrigin() + "/article/" + doc.slug`, `lastModified:
    doc.updatedAt`, `priority: 0.6`, `changeFrequency: "daily"`.
  - one entry per static route in this exact hardcoded list (these are
    genuinely code-defined App Router routes, not CMS taxonomy — hardcoding
    them here does not violate invariant #8): `/about`, `/about/newsroom`,
    `/awards`, `/advertise`, `/contact`, `/press`, `/studio`,
    `/legal/privacy`, `/legal/terms`, `/legal/cookies`, `/legal/gdpr`,
    `/trust/editorial`, `/trust/ai`, `/trust/corrections`,
    `/trust/transparency`, `/trust/sponsored`, `/briefing`, `/newsletters`,
    `/dashboards`, `/dashboards/ai` — each `priority: 0.3`,
    `changeFrequency: "monthly"`. **Deliberately omit** `/dashboards/funding`
    (duplicate content with `/dashboards`, which already defaults to the
    funding tab) and omit `/search`, `/account*`, `/reset-password`,
    `/admin*`, `/preview`, `/exit-preview`, `/api/*` (all covered by
    `robots.ts` disallow in RFC-008; none belong in a sitemap).

**Verification:** `curl -s http://localhost:3000/sitemap.xml`; confirm valid
XML; confirm exactly 6 `<url>` entries for the 6 seeded pillars (`ai`,
`startups`, `latest`, `dev`, `products`, `policy`); confirm one `<url>` entry
per published seeded article (cross-check the count against the article list
in `/admin`); confirm none of `/search`, `/account`, `/admin`, `/preview` (or
`/dashboards/funding`) appear.

---

### RFC-008 — `robots.ts`

**Dependencies:** RFC-007 (references the sitemap URL).

**File:** `apps/web/src/app/robots.ts` (new). Default export returns rules:
`userAgent: "*"`, `allow: "/"`, `disallow: ["/admin", "/account", "/search",
"/reset-password", "/preview", "/exit-preview", "/api"]`. `sitemap:
siteOrigin() + "/sitemap.xml"`. **Do not** reference `/r/[token]` — that
route does not exist in the codebase yet (confirmed by direct search); add
it to this disallow list only when that route ships. **Do not** disallow
`/asia` or `/asia/*` — those are permanent 301 redirects to `/latest`
(`next.config.ts:17-21`) and should remain crawlable so link equity
consolidates onto `/latest`.

**Verification:** `curl -s http://localhost:3000/robots.txt`; confirm the
exact disallow list above and a `Sitemap:` line pointing to
`http://localhost:3000/sitemap.xml` in dev.

---

### RFC-009 — `llms.txt`

**Dependencies:** RFC-002 (uses `siteOrigin()`), reuses `getNavPillars()`
(existing, cached, tag `pillars:all`).

**File:** `apps/web/src/app/llms.txt/route.ts` (new — a folder literally
named `llms.txt` containing a Route Handler; this is the correct Next.js
mechanism to serve a dynamically-generated file at an exact URL when no
built-in metadata-route convention exists for that file type, since `llms.txt`
is a community convention, not a Next.js file-based metadata convention).
`export const revalidate = 3600;` (pillar taxonomy changes far less often
than articles publish; still regenerates without a deploy per invariant #8's
spirit). `GET` handler returns a `text/plain; charset=utf-8` response body
containing:

- An `# DailyTechWire` heading.
- A one-paragraph summary (adapted, not verbatim-copied, from the approved
  facts already in `process/context/all-context.md`'s Project Description
  and Parent Organisation sections): DailyTechWire is a digital-native
  technology publication with an Asia-tech focus — regional funding and
  tech-stock coverage, AI benchmarks and rankings, and deep-dive editorial.
  Published by Asia Press Centre Group (APCG), an independent newsroom based
  in Singapore, founded 2023.
- A "Sections" list built from `getNavPillars()` (sorted by `order`, as
  already returned) — one line per pillar: the pillar's `title.en`, its
  absolute URL (`siteOrigin() + "/" + slug`), and its `description` field
  when set.
- A short "About" list with two hardcoded links (code-defined routes, not
  CMS taxonomy): `/about` and `/trust/editorial`.

**Fallback note (explicit, to remove ambiguity):** if a literal `llms.txt`
folder segment does not resolve as expected in this exact Next.js 15.4.11
setup, fall back to a static `apps/web/public/llms.txt` file instead
(hand-authored, six hardcoded pillar entries, to be revisited if pillars
change) — verify via `curl` before considering this RFC done either way.

**Verification:** `curl -s http://localhost:3000/llms.txt`; confirm
`Content-Type: text/plain`; confirm all 6 pillars listed with correct
absolute URLs; confirm the summary paragraph matches the approved facts
(APCG, Singapore, 2023) with nothing invented.

---

## Verification Strategy (Comprehensive)

No automated test runner exists anywhere in this repo (confirmed: no `test`
script, no vitest/playwright config). Verification is therefore:

1. **Static checks** — `pnpm typecheck` (zero new errors), `pnpm build`
   (zero new warnings, specifically zero "metadataBase" warning), `pnpm
   lint` (separate manual gate per the existing `next.config.ts` comment
   that lint is intentionally not a build gate in this repo).
2. **Manual dev-server checks** — `pnpm dev`, then the exact `curl`
   commands listed per-RFC above. Every check greps the rendered HTML/XML/
   plain-text response directly; none require a browser.
3. **Visual checks** — the default OG image (RFC-003) and a live browser
   view of one article page's rendered `<head>` (DevTools → Elements,
   confirm the JSON-LD script is present in the initial server HTML, not
   client-injected — view `curl`/`view-source:` output directly, which
   bypasses any client hydration questions entirely since these are all
   server components).
4. **Regression check** — at least one untouched route (`/about` or
   `/search`) must still show the renamed `DailyTechWire` default title
   after RFC-002, proving the template change is additive-only.
5. **Draft-mode check** — RFC-004's draft/preview verification proves the
   `robots: noindex` + JSON-LD-suppression branch works.
6. **Post-deploy-only checks (cannot run in local dev)** — real link-preview
   debuggers (Facebook Sharing Debugger, Twitter Card Validator, LinkedIn
   Post Inspector) require a public HTTPS URL. Once a Vercel preview or
   production URL exists, paste it into each debugger and confirm the OG
   image actually renders as a card. This is the final confirmation of the
   "broken link previews" pain and must be run once real deployment
   happens — it cannot be substituted for in this environment. Until then,
   the manual `curl`-based OG/Twitter tag inspection (per-RFC above) is the
   best available proxy and should be treated as necessary but not fully
   sufficient proof.

---

## Touchpoints

**New files:**

- `apps/web/src/lib/metadata.ts`
- `apps/web/.env.example`
- `apps/web/scripts/generate-og-default.mjs`
- `apps/web/public/og-default.png`
- `apps/web/src/app/sitemap.ts`
- `apps/web/src/app/robots.ts`
- `apps/web/src/app/llms.txt/route.ts`

**Modified files:**

- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/manifest.ts`
- `apps/web/.env.local` (gitignored, developer-local — append one line only)
- `apps/web/src/app/(reader)/article/[slug]/page.tsx`
- `apps/web/src/app/(reader)/[pillar]/page.tsx`
- `apps/web/src/app/(reader)/page.tsx`
- `apps/web/src/lib/payload-server.ts` (one new export appended)

**Explicitly NOT touched:** any Payload collection/global schema file, any
`"use client"` component, `ArticleContent`/`PillarContent` or any component
under `apps/web/src/components/`, auth/session/paywall logic, `next.config.ts`
(no CSP/headers added), any file under `apps/web/src/app/(payload)/admin`.

**Deployment-only touchpoint (outside repo, not a code change):** set
`NEXT_PUBLIC_SITE_URL=https://dailytechwire.com` in the Vercel production
environment variables. Vercel preview deploys need no manual var — the
`VERCEL_URL` fallback in `siteOrigin()` covers them automatically.

---

## Public Contracts

- **New URL surfaces:** `/sitemap.xml`, `/robots.txt`, `/llms.txt`.
- **`<head>` contract change:** article/pillar/home routes now emit distinct,
  accurate `<title>`/description/canonical/OG/Twitter tags instead of the
  single generic pair every route previously inherited. Every other route
  (Wave 2/3, not touched) continues to inherit the site default — now spelled
  `DailyTechWire` instead of `Dailytechwire` (a visible, intentional,
  site-wide brand-casing rename, not a bug).
- **No breaking changes** to component props, API routes, or the Payload
  schema. No new required env var (all have safe defaults) — though
  production deploys should set `NEXT_PUBLIC_SITE_URL` explicitly rather
  than relying on the `VERCEL_URL` fallback, which is a preview-deploy
  convenience, not a production-grade guarantee of the canonical domain.

---

## Blast Radius

- `layout.tsx`'s `metadata` change affects **every** route in the app
  (metadataBase, title template, brand casing) — but is provably additive
  for untouched routes: Next.js only applies `title.template` to routes that
  export their own `title` string; routes with no metadata export inherit
  `title.default` verbatim. This guarantee is explicitly re-verified in
  RFC-002's and RFC-004's checks.
- `manifest.ts` brand-casing change is cosmetic only (PWA install-prompt
  text) — zero functional risk.
- `og-default.png` + its generator script are pure additions — zero risk to
  existing code paths.
- `getSitemapArticles()` is a pure addition to `payload-server.ts` — no
  existing export is modified.
- The three page.tsx modifications (article/pillar/home) are additive:
  existing render logic/imports are untouched; only a new `generateMetadata`
  (or static `metadata`) export and, for article, one new sibling `<script>`
  element are added. `generateMetadata` necessarily duplicates the existing
  fetch + `notFound()` logic already in each page component — this is
  expected, standard Next.js practice (the two functions have no shared
  closure), not an avoidable code smell.
- Calling the already-`unstable_cache`-wrapped query helpers (`
  getArticleBySlug`, `getPillars`) an extra time per request from
  `generateMetadata` has a bounded, understood cost: a Next.js Data Cache
  read on the same tag/key, not a fresh Payload/Postgres round trip in
  steady state (60s/300s revalidate windows already in place, unchanged by
  this plan).
- Zero touch to auth, session, paywall, Payload schema, CSS/design tokens,
  or any client component.

---

## Verification Evidence

Concrete, runnable proof gates (superset of the per-RFC checks above,
grouped for a final end-to-end pass):

1. `pnpm typecheck` — exits 0.
2. `pnpm build` — exits 0; build log contains zero occurrences of
   "metadataBase".
3. `pnpm dev`, then for `/`, one article URL, and two pillar URLs: `curl`
   the route and grep for `<title>`, `<meta name="description"`, `<link
   rel="canonical"`, `property="og:image" content=`, `name="twitter:card"
   content=` — confirm all present, all distinct per route, image content
   value is an absolute URL.
4. For the article URL: grep for `application/ld+json`, extract and
   `python3 -m json.tool` the block to confirm it parses and contains
   `"@type": "NewsArticle"`, the correct publisher name, and the correct
   author name.
5. For the draft/preview render of an unpublished article: confirm `<meta
   name="robots"` contains `noindex` and no `application/ld+json` script is
   present.
6. `curl /sitemap.xml`, `/robots.txt`, `/llms.txt` — each returns 200 with
   the expected content shape per RFC-007/008/009's verification sections.
7. `curl /about` (untouched route) — `<title>DailyTechWire</title>`, proving
   RFC-002's template change is non-breaking.
8. Visual: `apps/web/public/og-default.png` opened and confirmed against the
   RFC-003 brief.
9. **Deferred to post-deploy** (cannot run locally): Facebook/Twitter/
   LinkedIn card debuggers against a real public URL — flagged, not skipped.

---

## Resume and Execution Handoff

If EXECUTE is resumed in a new session or after context compaction:

1. Read this plan file in full first.
2. Re-confirm the grounding facts in [Context and Goals](#context-and-goals)
   still hold by re-reading: `apps/web/src/app/layout.tsx`,
   `apps/web/src/lib/payload-server.ts`,
   `apps/web/src/app/(reader)/article/[slug]/page.tsx`,
   `apps/web/src/payload/collections/Articles.ts`,
   `apps/web/src/payload/collections/Media.ts`,
   `apps/web/src/payload/collections/Pillars.ts`, `apps/web/payload.config.ts`
   — if any of these have materially changed since 16-07-26, stop and
   re-plan the affected RFC rather than assuming this plan's file/line
   citations still hold.
3. Determine which RFCs are already done by checking for their exact
   artifacts: does `apps/web/src/lib/metadata.ts` exist and export
   `buildMetadata`? Does `layout.tsx`'s `metadata` object contain
   `metadataBase`? Does `apps/web/public/og-default.png` exist? Does
   `article/[slug]/page.tsx` export `generateMetadata`? Does `sitemap.ts`/
   `robots.ts`/`llms.txt/route.ts` exist? Resume at the first RFC whose
   artifact is missing or incomplete.
4. Execute strictly in RFC order 001 → 009 — RFC-001 blocks everything;
   RFC-003 must complete before RFC-004/005/006 are considered done (code
   can be written in parallel, but the fallback image must exist before
   verification passes).
5. Do not relitigate anything in the [Decisions Log](#decisions-log) or
   [Architecture Decisions](#architecture-decisions-final) — brand casing,
   en-dash rule, JSON-LD escaping approach, no-CSP-today finding, the
   `engineSourceUrl` field-name correction, and the hreflang deferral are
   all settled.
6. After code changes, run the full [Verification Evidence](#verification-evidence)
   pass before reporting the plan complete.
7. Flag the one deployment-only step (`NEXT_PUBLIC_SITE_URL` in Vercel
   production env vars) to the user explicitly — it cannot be completed
   from within this repo.

---

## Change Management

Not applicable at plan creation (16-07-26) — this is a new plan, not a
mid-flight scope change. If scope changes after EXECUTE begins, pause,
document the change here (Classification / Impact / Strategy / Docs to
revise), update this plan file, then continue.

---

## Ops Runbook

- **One manual deployment step:** set `NEXT_PUBLIC_SITE_URL=https://
  dailytechwire.com` in Vercel's production environment variables before
  (or promptly after) this plan's first production deploy. Preview deploys
  need no manual step — `VERCEL_URL` fallback covers them.
- **Local dev:** `apps/web/.env.local` gets one new line
  (`NEXT_PUBLIC_SITE_URL=http://localhost:3000`) appended by RFC-002 — no
  other action needed for `pnpm dev` to pick it up.
- **No new cron/queue infra** — sitemap and llms.txt regeneration ride on
  Next's existing ISR (`revalidate`) mechanism, already the pattern used
  everywhere else in this codebase.

---

## Acceptance Criteria

- [ ] `pnpm typecheck` and `pnpm build` pass with zero new errors and zero
      "metadataBase" build warning.
- [ ] `/`, every `/[pillar]` route, and every `/article/[slug]` route emit a
      distinct `<title>`, meta description, and self-referencing canonical.
- [ ] Every one of the above routes emits an OpenGraph card and a Twitter
      `summary_large_image` card with an **absolute** image URL.
- [ ] Articles with a `heroImage` use the real hero (verified after manually
      uploading one via `/admin`, since seed data has none); articles
      without one, plus the homepage and pillar pages, use
      `og-default.png`.
- [ ] `/article/[slug]` emits valid NewsArticle + Author + Organization
      JSON-LD with `publisher` = "Asia Press Centre Group (APCG)" and no
      invented facts.
- [ ] Draft/preview article renders are marked `noindex` and never emit
      JSON-LD.
- [ ] `/sitemap.xml` is CMS-data-driven for pillars and articles, and lists
      the correct static routes with none of the excluded utility/auth
      routes present.
- [ ] `/robots.txt` disallows exactly the specified private/utility routes
      and references the sitemap.
- [ ] `/llms.txt` lists all CMS pillars with correct URLs and an accurate,
      non-fabricated site description.
- [ ] At least one untouched route (`/about`) still shows
      `<title>DailyTechWire</title>` — proving the site-wide brand-casing
      rename and title-template change are non-breaking for Wave 2/3 routes.
- [ ] `apps/web/public/og-default.png` visually matches the RFC-003 brief.
- [ ] The one deployment-only step (`NEXT_PUBLIC_SITE_URL` on Vercel
      production) has been explicitly flagged to the user, whether or not
      it has been completed (it is outside this repo's control).

---

## Future Work

- Wave 2 — static metadata + `robots: noindex` for `/briefing`,
  `/newsletters`, `/trust/[slug]`, `/account/[[...tab]]`.
- Wave 3 — convert the 11 `"use client"` routes to the proven server-shell
  split already used by `trust/[slug]` and `newsletters`.
- hreflang / `alternates.languages`, once i18n subpath routing (invariant
  #9) is actually built.
- Dynamic per-article OG card generation (BullMQ `afterChange` → `next/og`
  or `@vercel/og`), replacing today's static-fallback + real-hero approach.
- Editor-facing SEO override fields (`@payloadcms/plugin-seo` or a hand-
  rolled group) if editors need to tune search/social copy independently of
  on-page editorial copy.
- CSP nonce/hash allowance for the JSON-LD `<script>`, once CSP is actually
  implemented (it is not today).
- A dedicated square logo raster asset for JSON-LD `publisher.logo`,
  replacing the `og-default.png` stand-in.
- RSS feed routes (per-pillar/author/tag), per `infra/all-infra.md:68`.
- Optional: wrap `getArticleBySlug`/`getArticleBySlugDraft` in React's
  `cache()` for true request-level de-duplication between `generateMetadata`
  and the page component, if profiling ever shows the double Data Cache read
  is a measurable cost (not expected to be, given 60s revalidate windows).

---

## Implementation Checklist (copyable)

1. Create `apps/web/src/lib/metadata.ts` exporting `siteOrigin`,
   `absoluteUrl`, `DEFAULT_OG_IMAGE`, `ORGANIZATION`, `buildMetadata`,
   `buildArticleJsonLd`, `toJsonLdScript` per RFC-001's exact spec. Run
   `pnpm typecheck`.
2. Append `NEXT_PUBLIC_SITE_URL=http://localhost:3000` to
   `apps/web/.env.local`; create `apps/web/.env.example` with the same var
   documented per RFC-002.
3. Upgrade `apps/web/src/app/layout.tsx`'s `metadata` export
   (`metadataBase`, `title.template`, `openGraph`, `twitter`) per RFC-002.
   Rename `"Dailytechwire"` → `"DailyTechWire"` in `apps/web/src/app/
   manifest.ts`.
4. Verify: `pnpm build` has zero "metadataBase" warning; `curl /about` shows
   `<title>DailyTechWire</title>`.
5. Write `apps/web/scripts/generate-og-default.mjs` per RFC-003's visual
   brief; run it to produce `apps/web/public/og-default.png`. Visually
   confirm the output.
6. Add `generateMetadata` + inline NewsArticle JSON-LD `<script>` to
   `apps/web/src/app/(reader)/article/[slug]/page.tsx` per RFC-004. Verify
   with the `curl` + JSON-LD checks listed there, including the draft-mode
   check.
7. Add `generateMetadata` to `apps/web/src/app/(reader)/[pillar]/page.tsx`
   per RFC-005. Verify with `curl` against two pillar slugs.
8. Add static `metadata` export to `apps/web/src/app/(reader)/page.tsx`
   (homepage) per RFC-006. Verify with `curl /`.
9. Add `getSitemapArticles()` to `apps/web/src/lib/payload-server.ts`;
   create `apps/web/src/app/sitemap.ts` per RFC-007. Verify with `curl
   /sitemap.xml`.
10. Create `apps/web/src/app/robots.ts` per RFC-008. Verify with `curl
    /robots.txt`.
11. Create `apps/web/src/app/llms.txt/route.ts` per RFC-009 (with the
    static-file fallback noted if the route-handler approach doesn't
    resolve as expected). Verify with `curl /llms.txt`.
12. Run the full [Verification Evidence](#verification-evidence) pass.
13. Flag the `NEXT_PUBLIC_SITE_URL` Vercel production env var step to the
    user explicitly.

---

## Cursor + RIPER-5 Guidance

- **Cursor Plan mode:** import the numbered Implementation Checklist above
  directly; execute steps 1-13 in order; stop and verify after each step
  per its stated check before moving to the next.
- **RIPER-5:** this plan was produced in PLAN mode. The next step is an
  explicit user "ENTER EXECUTE MODE" — do not auto-transition. EXECUTE
  should follow the RFCs in [RFCs](#rfcs) with 100% fidelity, re-reading
  [Resume and Execution Handoff](#resume-and-execution-handoff) first if
  resuming a prior session.
