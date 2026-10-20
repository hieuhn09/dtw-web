---
name: plan:otw-exclusive
description: "Opentechwire Exclusive section: flag plumbing, /exclusive page + pagination, homepage band, chips on all card surfaces, nav, RSS, sitemap, Editorial Standards definition; plus a copy-only CMS checkbox description change in apcg-cms"
date: 20-10-26
feature: homepage
---

# Opentechwire "Exclusive" section - PLAN

Date: 20-10-26
Status: PLANNED (not validated, not executed)
Complexity: COMPLEX (multi-file, two repos, many UI surfaces; one plan, no phase program)
**SPEC:** `/home/user/dtw-web/process/general-plans/active/otw-exclusive_20-10-26/otw-exclusive_SPEC_20-10-26.md` (locked)
**Branch (both repos):** `claude/modest-hamilton-wbspcg`. dtw-web has draft PR hieuhn09/dtw-web#60 on it; apcg-cms needs its own draft PR. The two repos can merge in any order (no runtime dependency: the CMS flag and the `flag=exclusive` filter already exist; the CMS change is copy only).

## Overview

Readers get an "Exclusive" label for stories built on Opentechwire's own reporting. An editor ticks the existing CMS checkbox `exclusive` (tenant `dtw`); the article stays in its pillar. dtw-web then shows: a `/exclusive` page (12 per page), a homepage band (3 cards), an "Exclusive" chip on every card/row that can show a flagged article, an article-page chip linking to the definition, a nav link, an Atom feed at `/exclusive/rss.xml`, a sitemap entry, and an "Exclusive" section on Editorial Standards. apcg-cms gets a copy-only change of the checkbox help text.

**INNOVATE skipped by the orchestrator:** the approach is fixed (port the BriefAsia pattern, adapted to dtw-web's own structure: no locale-prefixed routes, no Vietnam filter, language comes from the client i18n context `useT`/`useLang`). No Decision Summary exists; owner decisions below are the binding constraints.

## Locked owner decisions (from the orchestrator, all final)

1. Model: topical pillar + editor-set `exclusive` flag. No CMS schema change, no migration.
2. Scope: all of the surfaces in Overview. Page size 12; page 1 canonical at bare URL; past-the-end 404; empty state "No exclusives published yet. Check back soon."
3. Exclusive may be the homepage hero (no reservation). Exclusive + Deep Dive shows in both bands. Sponsored + Exclusive renders both labels; no code block; editorial rule says do not do it.
4. Chip color: existing `--accent` / `--accent-ink`, outlined, light + dark. No new token family.
5. Labels: en "Exclusive", vi "Độc quyền", id "Eksklusif".
6. apcg-cms: copy-only description change; NO file in `apcg-cms/src/migrations/` touched.
7. RSS URL is `/exclusive/rss.xml` (this overrides the SPEC's open-question-6 default `/feed/exclusive.xml`).

## Design reference and owner design decisions (20-10-26, owner: "oke làm đi")

**Visual source of truth:** `design/` in this task folder (static `.dc.html` mockups, see `design/README.md`). Execute-agent must read the relevant `.dc.html` before building each surface: `Main` (homepage band, nav), `Exclusive-page` (/exclusive), `Article` (article chip, Read next), `Editorial` (Editorial Standards section), `Chip-states` (chip spec incl. on-dark), `Mobile-home`, `Mobile-menu`. Mockup is markup/layout reference only; real components (nav icons, cover art, Brief band) are kept.

| ID | Decision | Applied in |
|---|---|---|
| D1 | Homepage band must NOT repeat the hero LEAD story: fetch `EXCLUSIVE_BAND_SIZE + 1`, drop the one whose id equals the hero lead id, take 3. Only the hero lead is excluded (aside items may appear in the band). Pure `pickBandArticles(exclusives, heroLeadId, size)` in `exclusive.ts` | N1, N2, steps 4, 7, 26, 27 |
| D2 | Chip on dark navy surfaces (Most Read band, bg `--banner`) uses an on-dark variant: text #FFFFFF, border `--accent` (default chip is about 3.7:1 there, below 4.5:1). Variant prop `tone="onDark"` on the chip primitive; no new token (white already used on that band) | N3, N4, steps 10-12, 14; probe P10 |
| D3 | Pillar showcase cards have no label row: chip goes on its own line directly above the title, for the first (image) item and the compact list items | step 14 |
| D4 | `/exclusive` header: 22px flag icon (stroke, `--accent`) + kicker "OTW · EXCLUSIVE" (12px/650/.18em, `--accent`), h1 "Exclusive", tagline, "RSS feed" outline button to `/exclusive/rss.xml`, "What this label means →" text link to `/trust/editorial#exclusive`; header bottom border 4px `--accent` | N5, steps 17a, 18 |

Already decided and confirmed: no chip on cards inside `/exclusive`; page 1 pager shows only "Older stories →"; the article-page chip is a link to `/trust/editorial#exclusive`.

## SPEC corrections noted by this plan

- SPEC flow diagram says the chip links to `/editorial-standards#exclusive`. The real route is `/trust/editorial` (`apps/web/src/app/(reader)/trust/[slug]/page.tsx`). Target: `/trust/editorial#exclusive`.
- SPEC criterion 5 lists "newsletters content". `newsletters-content.tsx` renders newsletter products, not article cards; verified by grep during execution (step 17). Recorded as N/A with evidence, not silently dropped.
- SPEC says "no breadcrumb component exists"; in fact `components/article/article-content.tsx` has an inline breadcrumb (OTW > pillar > section). It is unchanged; the Exclusive chip goes in the header kicker row, not the breadcrumb.
- `payload-types.ts` is Payload-generated ("DO NOT MODIFY") and lacks `exclusive` (the local Payload was deleted; Central is the source). Decision: do NOT hand-edit it; widen the type locally (`Article & { exclusive?: boolean | null }`) in `article-view.ts`.

## Context loaded

`process/context/all-context.md` (invariants #5, #6, #7, #9, #10, #14, #15), `process/context/tests/all-tests.md`, uxui and integrations groups by routing, plus code reads of `central-api.ts`, `cms-client.central.ts`, `article-view.ts`, `data.ts`, `i18n.tsx`, `header.tsx`, pillar/briefing views, `feed.ts`, `sitemap.ts`, trust page, and the BriefAsia reference files (`exclusive-copy.ts`, `exclusive-page-view.tsx`, `exclusive-band.tsx`, `exclusive-chip.tsx`, `getExclusiveArticlesPage`).

**Real test commands (the `all-tests.md` doc is aspirational/stale: it names vitest/playwright that do not exist):**

| Purpose | Command (repo root `/home/user/dtw-web`) |
|---|---|
| Typecheck | `pnpm --filter web typecheck` (= `tsc --noEmit`); whole repo: `pnpm typecheck` (turbo; this is what CI runs) |
| Lint | `pnpm --filter web lint` (= `next lint`; NOT in CI; capture a baseline first, fix only new findings) |
| Existing node tests | `pnpm --filter web test:bot-detect`, `pnpm --filter web test:signup-guard` (`tsx --test`, Node `node:test`) |
| New node test (added by this plan) | `pnpm --filter web test:exclusive` = `tsx --test src/lib/exclusive.test.ts` |
| Build | `pnpm --filter web exec next build` (needs env; attempt with placeholder `CMS_URL`; if it cannot run offline, record as Known Gap and rely on typecheck + dev-server probe) |
| apcg-cms (cwd `/home/user/apcg-cms`) | `npm run typecheck`, `npm run lint` (no test framework there) |

## Goals / Scope

In scope: everything in Overview. Out of scope (from SPEC): separate pillar, engine/hub setting the flag, paywall changes, BriefAsia Vietnam filter, other tenants' sites, CMS permission/schema/API/migration changes, body translation, locales beyond en/id/vi, dashboards/newsletter sending.

## Touchpoints

### dtw-web (`/home/user/dtw-web`), 10 new files

| # | Path | Purpose |
|---|---|---|
| N1 | `apps/web/src/lib/exclusive.ts` | Pure logic, no `server-only`, no `@/` alias imports: `pickBandArticles(exclusives, heroLeadId, size)` (D1), `EXCLUSIVE_PAGE_SIZE=12`, `EXCLUSIVE_BAND_SIZE=3`, `EXCLUSIVE_PATH="/exclusive"`, `EXCLUSIVE_FEED_PATH="/exclusive/rss.xml"`, `EXCLUSIVE_DEFINITION_HREF="/trust/editorial#exclusive"`, `exclusivePagePath(page)`, `parseExclusivePage(raw)`, `exclusivePageCount(totalDocs,size)`, `classifyExclusivePage({page,totalDocs,docCount})`, `shouldShowExclusiveChip(article,{onExclusivePage})`, `exclusiveFeedChannel(origin)` |
| N2 | `apps/web/src/lib/exclusive.test.ts` | `node:test` unit tests for N1 and the feed builder |
| N3 | `packages/ui/src/exclusive-chip.tsx` | Presentational outlined chip primitive (label via prop, optional `href`, `tone?: "default" | "onDark"` per D2); exported from `packages/ui/src/index.ts` |
| N4 | `apps/web/src/components/exclusive-chip.tsx` | `"use client"` wrapper: applies `shouldShowExclusiveChip`, translates label with `useT()`, passes `href` and `tone` on request |
| N5 | `apps/web/src/components/exclusive/exclusive-content.tsx` | `"use client"` page body: heading + tagline, 3-col responsive grid of cards (no chip), empty state, prev/next pager |
| N6 | `apps/web/src/app/(reader)/exclusive/exclusive-view.tsx` | Server shared view + `exclusiveMetadata(page)` (like `pillar-view.tsx`) |
| N7 | `apps/web/src/app/(reader)/exclusive/page.tsx` | Page 1 (`revalidate = 60`) |
| N8 | `apps/web/src/app/(reader)/exclusive/page/[n]/page.tsx` | Page 2+: `generateStaticParams` returns `[]`; page 1 redirects to `/exclusive`; junk 404 |
| N9 | `apps/web/src/app/(reader)/exclusive/rss.xml/route.ts` | Atom feed, `revalidate = 300` |
| N10 | `apps/web/src/components/home/exclusive-band.tsx` | `"use client"` homepage band (3 cards, "See all", returns null when empty) |

### dtw-web, 24 modified files

Data/plumbing (13): `apps/web/src/lib/central-api.ts` (flag union + `"exclusive"`), `apps/web/src/lib/cms-client.central.ts` (3 reads, below), `apps/web/src/lib/cms-client.ts` (re-exports), `apps/web/src/lib/article-view.ts` (`exclusive: boolean`; `toArticleView(a: Article & { exclusive?: boolean | null })`), `apps/web/src/lib/data.ts` (`NAV_EXTRA` entry), `apps/web/src/lib/i18n.tsx` (`NAV_I18N.exclusive`), `apps/web/src/app/(reader)/page.tsx` (fetch + band placement), `apps/web/src/app/sitemap.ts`, `apps/web/src/app/(reader)/trust/[slug]/trust-content.tsx` (Exclusive section + anchor), `apps/web/src/app/globals.css` (`.exclusive-chip` + `.exclusive-chip--on-dark` classes only), `apps/web/src/components/icons.tsx` (new `flag` stroke icon, D4), `packages/ui/src/index.ts` (export), `apps/web/package.json` (`test:exclusive` script).

Chip surfaces (11): `components/home/home-hero.tsx` (lead + aside rows, 2 sites), `components/home/pillar-showcase.tsx`, `components/home/most-read.tsx`, `components/home/sponsored-strip.tsx`, `components/home/deep-dive.tsx`, `components/pillar/pillar-content.tsx` (lead card + grid cards; the file has the grid at ~257, read the lead block too), `components/article/related-row.tsx`, `components/article/article-content.tsx` (linking chip), `app/(reader)/search/page.tsx`, `components/search-overlay.tsx` (title-only rows; add chip beside title), `app/(reader)/account/[[...tab]]/account-tabs.tsx` (2 sites: saved/history/queue lists).

N/A surfaces, confirmed by grep at execution (step 17) and recorded in the report: `home/brief-band.tsx` and `briefing/briefing-content.tsx` (daily briefs are `contentType: "daily-brief"` and never flagged), `newsletters/newsletters-content.tsx` (no article cards), `dashboards/ai-leaderboard.tsx` (sponsor link only), `byline-wired.tsx` (no card), `home/best-of-reviews.tsx` (static demo data), `legal/[slug]/page.tsx` and `trust/[slug]/trust-content.tsx` (`<article>` is a static page wrapper).

Unchanged by design: `header.tsx` (both desktop and mobile iterate `NAV_EXTRA`; the new entry appears in both), `apps/web/src/payload/payload-types.ts` (generated, do not hand-edit), `middleware.ts` (410 matcher does not touch `/exclusive`), `robots.ts`.

### apcg-cms (`/home/user/apcg-cms`), 1 modified file

`src/collections/Articles.ts`: (a) admin description at lines 389-390 replaced with exactly: "Mark only when the story rests on reporting this publication did itself (a story we broke, a document we obtained, an interview we conducted). Not for aggregation, translation, wire copy or press releases."; (b) comment at lines 380-381 (BOTH lines) replaced by ONE neutral comment line, e.g. `// Editor-set flag for the cross-pillar "Exclusive" section on any tenant's site. Never inferred from tag/author/pillar; hand-toggled only.` Net change: lines 380-381 (both) replaced by one comment line; lines 389-390 description replaced; no other line changes. NO file under `src/migrations/` added or touched (the production build runs every migration file in that folder).

## Public Contracts

- Reader URLs (new): `GET /exclusive`, `GET /exclusive/page/{n}` (n>=2), `GET /exclusive/rss.xml` (Atom 1.0, `application/atom+xml`). `/exclusive/page/1` -> redirect to `/exclusive` (307 from `redirect()`; 308 also acceptable). Non-integer, padded, signed, or past-the-end `n` -> 404.
- Central public API (consumed, unchanged): `GET /api/public/articles?flag=exclusive&content_type=article&sort=-publishedAt&page=&limit=`; response article JSON carries boolean `exclusive`. One flag per request.
- `ArticleView` gains `exclusive: boolean` (internal view-model, additive).
- Editorial Standards page gains an anchor `#exclusive` (stable link target for the chip).
- CMS: admin help text only; no API, permission, or schema change (`canFlagExclusive` unchanged).

## Security note (auth/billing/secrets: not touched)

No auth, billing, or secrets surface. All new routes are public read-only and use the existing read-token fetch layer. The chip `href` is a constant internal path. RSS output goes through the existing `xmlEscape`. No STRIDE-class concern identified; `vc-security` scan not required.

## Data flow

Editor ticks `exclusive` in Central (tenant dtw) -> Central revalidation webhook busts the cache tag `articles:all` (`apps/web/src/app/api/revalidate/route.ts`) -> `getExclusiveArticlesPage` (new, tag `articles:all`, `revalidate: 60`) refetches `flag=exclusive` -> `toArticleView` maps `a.exclusive` -> surfaces render. Every article read already shares `articles:all`, so chips on cards update within the same window as the cards themselves. The RSS route response is cached by Next on its `revalidate = 300` window (route handlers are not tag-busted; same as existing feeds). Untick -> next refetch drops the article from all exclusive surfaces; it stays in its pillar.

Data-layer functions (all in `cms-client.central.ts`, all pass `content_type: "article"` via `ARTICLE_ONLY`, `sort: "-publishedAt"`, `flag: "exclusive"`):

- `getExclusiveArticlesPage(page = 1, pageSize = EXCLUSIVE_PAGE_SIZE): Promise<ArticlesPage>` key `["articles:exclusive-page"]`, tags `["articles:all"]`, `revalidate: 60`. Used by the page, the band (page 1, size 3) and the sitemap.
- `getExclusiveFeedArticles(): Promise<Article[]>` limit 50, key `["articles:exclusive-feed"]`, `revalidate: 300`.
- (No third function; the band reuses the page function with size 3.)

Edge: on Central failure `fetchArticles` returns an empty envelope (existing behavior) so the band hides and `/exclusive` shows the empty state; page>1 with empty docs 404s (existing pillar behavior mirrored).

## Ordered implementation checklist

Each step is atomic. Run the stated gate at the end of each group before moving on (per-section test-gate loop).

**Group A: baseline and pure logic (TDD red first)**

0. Install dependencies (neither repo has `node_modules` at validate time): `cd /home/user/dtw-web && pnpm install --frozen-lockfile`, then `cd /home/user/apcg-cms && npm ci`. If an install is blocked (network/registry/proxy), STOP and report `NEEDS_CONTEXT`; do not fake or skip any gate.
1. In `/home/user/dtw-web`: record baselines. `pnpm --filter web typecheck` and `pnpm --filter web lint` (save pre-existing lint findings to the scratchpad; only new findings are in scope). Run `pnpm --filter web test:bot-detect` and `test:signup-guard`.
2. Add script `"test:exclusive": "tsx --test src/lib/exclusive.test.ts"` to `apps/web/package.json` (next to the two existing `test:*` scripts).
3. Create `apps/web/src/lib/exclusive.test.ts` FIRST with the failing stubs listed in "Test matrix" (each stub `throw new Error("NOT IMPLEMENTED ...")` until N1 exists), confirm red.
4. Create `apps/web/src/lib/exclusive.ts` (N1) with exact semantics:
   - `parseExclusivePage(raw)`: returns integer only for `/^[1-9][0-9]*$/` and `Number.isSafeInteger`; else `null` (mirrors `parsePage` in `[pillar]/page/[n]`).
   - `exclusivePagePath(page)`: `page <= 1 ? "/exclusive" : "/exclusive/page/" + page`.
   - `exclusivePageCount(totalDocs, size)`: `Math.max(1, Math.ceil(totalDocs / size))` (page 1 always exists, empty state).
   - `classifyExclusivePage({ page, totalDocs, docCount })`: returns `"not-found"` when `page > 1 && (docCount === 0 || page > exclusivePageCount(totalDocs, EXCLUSIVE_PAGE_SIZE))`; otherwise `"ok"`. Page 1 with zero docs is `"ok"` (empty state). The `/page/1` redirect is handled by the route in step 21, not here.
   - `shouldShowExclusiveChip(a: { exclusive?: boolean | null }, o?: { onExclusivePage?: boolean })`: `Boolean(a.exclusive) && !o?.onExclusivePage`. The ONE shared eligibility rule used by every surface (criterion 5).
   - `pickBandArticles(exclusives, heroLeadId, size)` (D1): drops the item whose `id === heroLeadId` (when `heroLeadId` is non-null), then returns the first `size` of the remainder; pure, no mutation; callers fetch `size + 1`.
   - `exclusiveFeedChannel(origin)`: `{ title: "Opentechwire – Exclusive", subtitle: "Original reporting by Opentechwire.", origin, sitePath: "/exclusive", feedPath: "/exclusive/rss.xml" }`.
5. Gate: `pnpm --filter web test:exclusive` green; `pnpm --filter web typecheck` still at baseline.

**Group B: CMS client and view model**

6. `central-api.ts`: change the `flag` union at line 123 to `"deepDive" | "sponsored" | "pinnedToLatest" | "breaking" | "exclusive"`.
7. `cms-client.central.ts`: add `getExclusiveArticlesPage` and `getExclusiveFeedArticles` after `getDeepDive` (pattern: `getArticlesPage` at lines 181-196 and `getFeedArticles` at 466-484). Import `EXCLUSIVE_PAGE_SIZE` from `./exclusive` (relative import, not alias). `cms-client.ts`: add two re-exports next to `getDeepDive`.
8. `article-view.ts`: add `exclusive: boolean;` to `ArticleView` (next to `deepDive`); change `toArticleView` signature to `a: Article & { exclusive?: boolean | null }`; add `exclusive: Boolean(a.exclusive),` next to `deepDive`. Do not edit `payload-types.ts`.
9. Gate: `pnpm --filter web typecheck`. If any code constructs an `ArticleView` object literal the compiler will flag the missing field; fix each (grep `ArticleView = {` first).

**Group C: chip primitive and styles**

10. `packages/ui/src/exclusive-chip.tsx`: props `{ label: string; href?: string; className?: string }`. Accepts `tone?: "default" | "onDark"` (D2; `onDark` adds class `exclusive-chip--on-dark`). Renders `<span className="exclusive-chip ...">` (or `<a>` when `href`; use `<a>` not `<Link>`: the ui package has no next dependency, same as `PillarTag`). Real text in the DOM, uppercase, letter-spaced like `PillarTag` (font-size 10, weight 600, `.12em`), 1px border, transparent background, no radius, `padding: "1px 6px"`, `whiteSpace: nowrap`. Colors come from the class, NOT inline hex. Export from `packages/ui/src/index.ts`.
11. `globals.css`: add `.exclusive-chip { color: var(--accent-ink); border: 1px solid var(--accent); }`, `html[data-theme="dark"] .exclusive-chip { color: var(--accent); }` and the on-dark variant `.exclusive-chip.exclusive-chip--on-dark, html[data-theme="dark"] .exclusive-chip.exclusive-chip--on-dark { color: #FFFFFF; border-color: var(--accent); }` (D2). Use the literal `#FFFFFF` (uppercase, 6 digits) in that one rule: the Most Read band already hard-codes the same literal inline (`components/home/most-read.tsx` lines 34, 76, 132) and no theme-stable white token exists (`--surface` turns dark in dark mode), so reuse of a token is not possible. This is the ONLY colour literal this plan adds; G-HEX allowlists exactly it (see Verification Evidence). Rationale (measured by reasoning, verify in probe): `--accent #D4623C` is below 4.5:1 on white and `--accent-ink #B14A28` is below 4.5:1 on `#0F172A`, so ink is used on light and accent on dark. Every other colour comes from existing tokens; the single allowlisted `#FFFFFF` above is the only new hex (criterion 10).
12. `apps/web/src/components/exclusive-chip.tsx` (N4): props `{ article: { exclusive?: boolean | null }; href?: string; onExclusivePage?: boolean; tone?: "default" | "onDark" }` (forwards `tone`); returns null unless `shouldShowExclusiveChip`; label `t("Exclusive", "Độc quyền", "Eksklusif")`.
13. Gate: typecheck.

**Group D: chip on every surface (criterion 5)**

14. Add `<ExclusiveChip article={a} />` (wrapper N4) in the kicker row, immediately AFTER the `PillarTag` (and before section/mono text), in: `home-hero.tsx` (lead at ~52 and aside rows at ~116), `pillar-showcase.tsx` (D3: no label row exists, so render the chip on its own line directly above the title, for BOTH the first image item and the compact list items), `most-read.tsx` (beside the pillar label at ~123; this band sits on `--banner` navy, so pass `tone="onDark"`, D2), `deep-dive.tsx` (~47), `sponsored-strip.tsx` (beside the sponsor label; both labels render when a sponsored article is also exclusive; the `DisclosureBox` logic is untouched), `pillar-content.tsx` (lead card and grid card at ~257), `related-row.tsx` (~59), `search/page.tsx` (~255), `search-overlay.tsx` (inline after the title div), `account-tabs.tsx` (~269 and ~376). Placement rules: (i) `pillar-content.tsx` featured card has NO `PillarTag` (its kicker is "Featured · section"): put the chip in that kicker row, inside a flex row (`display:flex; align-items:center; gap:10; flex-wrap:wrap`); (ii) `related-row.tsx` and the `pillar-content.tsx` grid cards render `PillarTag` with no flex row: wrap `PillarTag` + chip in a flex row (gap 10, wrap); (iii) every chip inside a card `<Link>`/`<a>` renders as a `<span>` (no `href`), never a nested `<a>`; only the article-page chip (step 15) and the `/exclusive` header links are anchors. Each uses the existing `ArticleView` already flowing through `toArticleView`, so no prop plumbing is needed except where a surface builds its own item shape (check `pillar-content` initialArticles type and `account-tabs` `a` type; both are `ArticleView`).
15. `article-content.tsx` header kicker row (line ~116, after `PillarTag`, before the deepDive/sponsored badges): `<ExclusiveChip article={article} href="/trust/editorial#exclusive" />`. Use the `href` form so the chip is a real link (keyboard-focusable, `aria-label` equals the visible text).
16. Gate: typecheck + lint.
17. Surface-completeness check (guards risk R1): run `grep -rn "PillarTag\|<article\b" apps/web/src --include=*.tsx` and confirm every card/row that renders an `ArticleView` either has the chip or is on the N/A list; record the grep result and the N/A evidence (brief-band, briefing-content, newsletters-content, ai-leaderboard, byline-wired) in the phase report. The `<article\b` grep also hits three files that are N/A and must be listed with their reason: `components/home/best-of-reviews.tsx` (mounted by `(reader)/page.tsx` but renders static demo review data, not `ArticleView`s from Central), `app/(reader)/legal/[slug]/page.tsx` and `app/(reader)/trust/[slug]/trust-content.tsx` (`<article>` wraps a static policy page, not an article card). Verify each reason by reading the file before recording it.

**Group E: /exclusive page, pagination, feed**

17a. `icons.tsx`: add `"flag"` to `IconName` and a stroke flag path in the existing style (viewBox 24, currentColor, same stroke conventions as neighbors; read the switch/map pattern of the file first). Used by the `/exclusive` header (D4).

18. `exclusive-content.tsx` (N5, client): props `{ articles: ArticleView[]; page: number; hasNextPage: boolean }`. Header (D4, see `design/Exclusive-page.dc.html`): `Icon name="flag"` 22px stroke in `var(--accent)` + kicker `OTW · EXCLUSIVE` (12px, weight 650, letter-spacing .18em, `var(--accent)`); `h1` serif `t("Exclusive","Độc quyền","Eksklusif")` (match trust/pillar heading styles); tagline; an "RSS feed" outline button (`<a href="/exclusive/rss.xml">`, label `t("RSS feed","Nguồn RSS","Umpan RSS")`) and a text link `<Link href={EXCLUSIVE_DEFINITION_HREF}>` with `t("What this label means →","Nhãn này nghĩa là gì →","Arti label ini →")`; header `borderBottom: "4px solid var(--accent)"` (mirrors the pillar page header, in accent color). Tagline `t("Original reporting by Opentechwire.", "Bài viết gốc do Opentechwire thực hiện.", "Liputan orisinal dari Opentechwire.")`. Grid: `repeat(auto-fill, minmax(min(100%, 260px), 1fr))`, gap 32, same card markup as the `pillar-content` grid (CoverArt 210px, `PillarTag`, title, dek, byline), NO chip (the page passes `onExclusivePage`, so the shared rule hides it). Empty state paragraph exactly: `t("No exclusives published yet. Check back soon.", "Chưa có bài độc quyền nào. Hãy quay lại sau.", "Belum ada berita eksklusif. Silakan cek lagi nanti.")`. Pager (shown when `page > 1 || hasNextPage`; on page 1 only "Older stories →" shows) as `<Link>` pair: `t("← Newer stories","← Bài mới hơn","← Berita lebih baru")` to `exclusivePagePath(page-1)`, `t("Older stories →","Bài cũ hơn →","Berita lebih lama →")` to `exclusivePagePath(page+1)`; wrap in `<nav aria-label="Pagination">`.
19. `exclusive-view.tsx` (N6): `exclusiveMetadata(page)` calls `getExclusiveArticlesPage(page, EXCLUSIVE_PAGE_SIZE)`, `classifyExclusivePage` -> `notFound()` on `"not-found"` (so the status is a real 404, not a soft 404; mirrors the pillar approach), and returns `buildMetadata({ title: page===1 ? "Exclusive" : "Exclusive – Page N", description: "Original reporting by Opentechwire: stories we broke, documents we obtained, interviews we conducted.", canonicalPath: exclusivePagePath(page), image: DEFAULT_OG_IMAGE, type: "website", feed: { url: "/exclusive/rss.xml", title: "Opentechwire – Exclusive" } })`. `ExclusiveView({ page })` fetches, calls `classifyExclusivePage` (notFound when needed), maps `toArticleView`, renders `<ExclusiveContent key={page} .../>`.
20. `page.tsx` (N7): `export const revalidate = 60; export const generateMetadata = () => exclusiveMetadata(1); default -> <ExclusiveView page={1}/>`.
21. `page/[n]/page.tsx` (N8): copy the structure of `[pillar]/page/[n]/page.tsx`: `generateStaticParams` returns `[]`; `parseExclusivePage` -> `notFound()` on null; `page === 1` -> `redirect("/exclusive")` (Next `redirect()` in a page answers HTTP 307; keep it, mirroring the pillar precedent; verification expects "307 or 308 with `Location: /exclusive`"); metadata calls `notFound()` for `page < 2`.
22. `rss.xml/route.ts` (N9): `export const revalidate = 300;` GET -> `getExclusiveFeedArticles()` -> `buildAtomFeed(exclusiveFeedChannel(siteOrigin()), articles)` -> `atomResponse(xml)`. An empty list still returns a valid feed (`buildAtomFeed` already handles empty via the generation-time `<updated>` fallback). No pillar lookup, so a `/exclusive/rss.xml` request never reaches `[pillar]/rss.xml` (static segment wins in the App Router; probe it).
23. `sitemap.ts`: add an explicit `/exclusive` entry (priority 0.8, `changeFrequency: "hourly"`) and page 2+ entries (priority 0.4, `"daily"`) derived from `getExclusiveArticlesPage(1, EXCLUSIVE_PAGE_SIZE).totalDocs`, mirroring the pillar block. Do NOT add it to `STATIC_ROUTES` (that list is priority 0.3 monthly, wrong for a live listing).
24. Gate: typecheck, lint, `test:exclusive`.

**Group F: nav, band, Editorial Standards**

25. `data.ts` `NAV_EXTRA`: insert `{ id: "exclusive", label: "Exclusive", slug: "/exclusive" }` as the FIRST entry (before `briefing`, which is the first extra today, so it sits right after the pillar links). `i18n.tsx` `NAV_I18N`: add `exclusive: { vi: "Độc quyền", id: "Eksklusif" }`. `header.tsx` unchanged (desktop `NAV_EXTRA.map` at ~561 and mobile drawer at ~773 both iterate the list). Probe for header overflow at 1024-1280px widths now that there is one more link.
26. `exclusive-band.tsx` (N10, client; layout per `design/Main.dc.html`): props `{ articles: ReadonlyArray<ArticleView> }` (already de-duplicated by the page, D1); returns `null` when empty; `SectionHeader` title `t("Exclusive","Độc quyền","Eksklusif")`, kicker `t("Original reporting by Opentechwire","Bài gốc của Opentechwire","Liputan orisinal Opentechwire")`, `right` slot = `<Link href="/exclusive">` with `t("See all","Xem tất cả","Lihat semua")`; 3 cards in a responsive grid (`repeat(auto-fit, minmax(min(100%, 280px), 1fr))`), each with CoverArt, the shared chip (shown: this surface is not `/exclusive`), `PillarTag`, title, byline. Style on existing tokens only.
27. Home `page.tsx`: add `getExclusiveArticlesPage(1, EXCLUSIVE_BAND_SIZE + 1)` to the existing `Promise.all` (D1: one extra to survive the hero de-dup); `const exclusiveView = pickBandArticles(exclusive.docs.map(toArticleView), heroLeadId, EXCLUSIVE_BAND_SIZE)` where `heroLeadId` is the id of the story the home hero renders as its lead (read how `page.tsx` picks it; use the same value, do not recompute differently); `const deepDiveRendered = SHOW_DEEP_DIVE && deepDiveView !== null`. Render `<Reveal><ExclusiveBand .../></Reveal>` in exactly one place: directly after the Deep Dive block when `deepDiveRendered`, otherwise directly after the Brief block (`SHOW_BRIEF`). Today `SHOW_DEEP_DIVE = false`, so in production the band renders right after the Brief band, before the pillar showcase. The hero is NOT changed: it already draws from the recent pool, so a flagged newest article can be the hero and also stays in its pillar (criterion 8); the band drops ONLY the hero lead (D1); hero aside items and Deep Dive may still also appear in the band (decision 3).
28. `trust-content.tsx` Editorial Standards: widen the body tuple type to `ReadonlyArray<readonly [heading: string, text: string, anchorId?: string]>`; render `<section key={h} id={anchorId} style={{ marginBottom: 32, scrollMarginTop: "calc(var(--header-h, 96px) + 16px)" }}>`. Insert a new entry after "How we report" with heading `t("Exclusive","Độc quyền","Eksklusif")`, anchor `"exclusive"`, and text:
    - en: "Apply this label only when the story rests on reporting Opentechwire did itself: a story we broke, a document we obtained, or an interview we conducted. Aggregation, translation, wire copy and press releases do not qualify. Sponsored (Paid Partner) content is never labeled Exclusive."
    - vi: "Chỉ gắn nhãn này khi bài viết dựa trên việc đưa tin do chính Opentechwire thực hiện: một tin chúng tôi phát hiện trước, một tài liệu chúng tôi có được, hoặc một cuộc phỏng vấn chúng tôi thực hiện. Tin tổng hợp, bản dịch, tin hãng thông tấn và thông cáo báo chí không đủ điều kiện. Nội dung tài trợ (Paid Partner) không bao giờ được gắn nhãn Độc quyền."
    - id: "Gunakan label ini hanya bila artikel bertumpu pada liputan yang dikerjakan sendiri oleh Opentechwire: berita yang kami ungkap lebih dulu, dokumen yang kami peroleh, atau wawancara yang kami lakukan. Agregasi, terjemahan, naskah kantor berita, dan siaran pers tidak memenuhi syarat. Konten bersponsor (Paid Partner) tidak pernah diberi label Eksklusif."
    Update the kicker date to "Last updated · 20 October 2026" / "Cập nhật lần cuối · 20/10/2026" / "Diperbarui · 20 Oktober 2026". Casing must read "Opentechwire" (invariant #15).
29. Gate: typecheck, lint, `test:exclusive`, existing node tests.

**Group G: apcg-cms (separate repo, separate commit and PR)**

30. In `/home/user/apcg-cms` on branch `claude/modest-hamilton-wbspcg`: edit `src/collections/Articles.ts` per Touchpoints (description at 389-390, comment at 380). Run `git diff --stat` and confirm exactly one file and only those lines; confirm `git status --porcelain -- src/migrations | wc -l` is 0 (this also sees untracked files; plain `git diff --name-only` is blind to a newly created migration file).
31. Gates there: `npm run typecheck`, `npm run lint` (read `/home/user/apcg-cms/process/context/tests/all-tests.md` for the known typecheck trap: a missing generated `payload-types.ts` yields unrelated errors; compare against baseline captured BEFORE the edit).

**Group H: whole-repo verification and handoff**

32. dtw-web full gates (see Verification Evidence), then the Agent-Probe pass against a local dev server with a throwaway mock Central API in the scratchpad (not committed): serves `/api/public/articles`, `/api/public/site`, `/api/public/menus`, and the other modules the home page calls with seeded JSON (flagged and unflagged articles, one sponsored+exclusive, one deepDive+exclusive, 0 / 5 / 30 flagged variants), with placeholder-only env (no real secrets): `CMS_URL=http://localhost:<mock-port> CMS_READ_TOKEN=probe DATABASE_URL=postgresql://u:p@127.0.0.1:1/x BETTER_AUTH_SECRET=probe-secret BETTER_AUTH_URL=http://localhost:3000 NEXT_PUBLIC_SITE_URL=http://localhost:3000`. `DATABASE_URL` is required: without it the home page 500s at import of `@dtw/db/client` (the most-read query then fails open on the refused connection). The mock must serve every public-API path `cms-client.central.ts` / `central-api.ts` call (verified list): `GET /api/public/site` (pillars), `GET /api/public/articles` honoring `flag`, `content_type`, `page`, `limit`, `sort`, `q`, `pillar`-style filters used by the callers and returning `{docs,totalDocs,page,totalPages,hasNextPage...}` as `ArticlesPage` expects, `GET /api/public/articles/{slug}`, `GET /api/public/preview`, and the modules `wire`, `corrections`, `newsletters`, `dashboards`, `sponsors?slot=` (via `fetchModule`: `GET /api/public/{module}`). Daily briefs are ordinary `articles` with `content_type=daily-brief`. There is NO central menus or paywall call (`fetchMenus` has no caller; paywall threshold is a local default). Unknown paths return an empty `{docs:[]}`/`{data:{}}` JSON body, not a 500. Re-read `cms-client.central.ts` at EXECUTE to confirm nothing was added since. Hidden/unmounted surfaces: in P3/P5 only, `SHOW_DEEP_DIVE` in `(reader)/page.tsx` may be flipped to `true` LOCALLY and UNCOMMITTED to observe the Deep Dive chip and the after-Deep-Dive band position; revert it before any commit and prove it with `git diff -- 'apps/web/src/app/(reader)/page.tsx' | grep -c SHOW_DEEP_DIVE` showing only the intended step-27 edits and no `SHOW_DEEP_DIVE = true` line.
33. Draft PR hygiene: dtw-web already has draft PR #60; push to `claude/modest-hamilton-wbspcg`. For apcg-cms open a separate draft PR from the same branch name. Do not merge either; do not tick any real article in production.
34. Update context docs at UPDATE PROCESS (not in EXECUTE): `process/context/all-context.md` (feature/surface list, new route table), `process/context/tests/all-tests.md` (real commands: `test:bot-detect`, `test:signup-guard`, `test:exclusive`; remove stale vitest claims), and apcg-cms `process/context/all-context.md` one-line note on the copy change.

## Acceptance criteria mapping (SPEC criteria -> proof)

| SPEC # | Criterion (short) | proven by | strategy |
|---|---|---|---|
| 1 | Flagged appears on `/exclusive`, unflagged does not, newest first | unit test T-QUERY (request params) + probe P1 with seeded mock | Hybrid |
| 2 | Pagination, `/page/1` redirect, past-end 404 | unit tests T-PAGE-* + probe P2 (HTTP status of 3 URLs) | Hybrid |
| 3 | Homepage band with See all; absent when none | probe P3 (with and without flagged data) | Agent-Probe |
| 4 | Nav link desktop + mobile, en/id/vi | probe P4 | Agent-Probe |
| 5 | Chip on every listed surface for flagged only, absent on `/exclusive` | unit tests T-CHIP-* on the one shared rule + surface-by-surface probe P5 + grep completeness (step 17) | Hybrid |
| 6 | Article chip links to definition; section exists; correct casing | probe P6 (link target resolves to the anchor) + grep for `OpenTechWire` in the diff | Hybrid |
| 7 | RSS valid, exclusives only, newest first, advertised from `/exclusive` | unit tests T-FEED-* + probe P7 (XML well-formed, `<link rel=alternate type=application/atom+xml>` in `/exclusive` head) | Hybrid |
| 8 | Flagged article can be the hero and stays in pillar | probe P8 (flagged newest article) | Agent-Probe |
| 9 | Sponsored + Exclusive shows both labels, disclosure boxes intact | probe P9 (dual-flag article) | Agent-Probe |
| 10 | Existing tokens only, dark mode OK | grep gate G-HEX (no new hex in the diff) + dark-mode probe P10 (contrast >= 4.5:1) | Hybrid |
| 11 | CMS description neutral, no schema/migration, typecheck passes | `git diff` review + `npm run typecheck` in apcg-cms | Fully-Automated |
| 12 | No other tenant/CMS behavior change | diff-scope check (1 file, copy only, 0 migration files) | Fully-Automated |
| 13 | dtw-web typecheck + lint pass, new unit tests pass | `pnpm typecheck`, `pnpm --filter web lint` (vs baseline), `pnpm --filter web test:exclusive` | Fully-Automated |

## Test matrix (TDD stubs, written red first in step 3)

`apps/web/src/lib/exclusive.test.ts` (Fully-Automated tier; node:test). Each is a red stub first:

- T-PAGE-PARSE: `parseExclusivePage` accepts "1","2","10"; rejects "0","02","-1","1.5","abc","","9007199254740993".
- T-PAGE-PATH: `exclusivePagePath(1)==="/exclusive"`, `(2)==="/exclusive/page/2"`, `(0)==="/exclusive"`.
- T-PAGE-COUNT: `exclusivePageCount(0,12)===1`, `(12,12)===1`, `(13,12)===2`, `(25,12)===3`.
- T-PAGE-CLASSIFY: page 1 + 0 docs -> "ok"; page 2 + 0 docs -> "not-found"; page 3 with totalDocs 25 and docs present -> "ok"; page 4 with totalDocs 25 -> "not-found".
- T-CHIP-ELIGIBLE: flagged -> true; unflagged / null / undefined -> false; flagged + `onExclusivePage` -> false.
- T-CHIP-SPONSORED: a `{exclusive:true, sponsored:true}` article is eligible (both labels render; no block).
- T-BAND-PICK (D1, `pickBandArticles`): hero lead is exclusive -> skipped and next 3 returned; hero not exclusive -> first 3 (given 4 fetched, 4th dropped); fewer than 3 available -> returns what exists; empty -> `[]` (band renders nothing); `heroLeadId` null -> first 3; input array not mutated.
- T-CONSTANTS: page size 12, band size 3, definition href `/trust/editorial#exclusive`, feed path `/exclusive/rss.xml`.
- T-FEED-CHANNEL: `exclusiveFeedChannel("https://www.opentechwire.com")` has self path `/exclusive/rss.xml`.
- T-FEED-BUILD: `buildAtomFeed(channel, [])` is well-formed with a `<link rel="self" ... href="https://www.opentechwire.com/exclusive/rss.xml"/>`; with 2 fixture entries output preserves given order and contains no `OpenTechWire`.
- T-QUERY (only if the request-params logic is extracted as a pure `exclusiveQuery(page, size)` in N1 returning `{flag:"exclusive",content_type:"article",sort:"-publishedAt",page,limit}`; do extract it so the data-layer call is unit-testable and `cms-client.central.ts` calls it).

Import caveat: `feed.ts` imports `@/lib/article-view` as a value. `tsx` resolves `@/*` from `apps/web/tsconfig.json` paths when run from `apps/web` (which `pnpm --filter web` does). If it fails, fall back to relative imports inside `feed.ts` only for that one import (smallest change) and note it; do not skip T-FEED-BUILD.

Hybrid and Agent-Probe tiers: no failing stubs (a literal red browser test is out of proportion).

## Verification Evidence

| Gate / Scenario | Strategy | Proves SPEC criterion |
|---|---|---|
| `pnpm --filter web test:exclusive` (T-PAGE-*, T-QUERY) | Fully-Automated | 1, 2 |
| `pnpm --filter web test:exclusive` (T-CHIP-*) + step-17 grep completeness | Hybrid | 5 |
| `pnpm --filter web test:exclusive` (T-FEED-*) + XML-well-formed probe P7 | Hybrid | 7 |
| P1 `/exclusive` lists seeded flagged articles newest first (mock Central) | Hybrid | 1 |
| P2 HTTP: `/exclusive` 200, `/exclusive/page/1` 307 or 308 with `Location: /exclusive` (`redirect()` gives 307), `/exclusive/page/2` 200 with 30 seeded, `/exclusive/page/99` 404, `/exclusive/page/02` 404, `/exclusive/page/abc` 404; also `/ai` and `/ai/rss.xml` still resolve to the pillar routes (collision check) | Hybrid | 2 |
| P3 homepage with 0 and with 5 flagged: band absent / present with 3 cards and working "See all"; when the hero lead is itself exclusive, it does NOT appear in the band (D1); band position per rule (after Brief today; after Deep Dive when it renders) | Agent-Probe | 3 |
| P4 nav: desktop (>=1280px and 1024px) and mobile drawer show "Exclusive"/"Độc quyền"/"Eksklusif" and link to `/exclusive`; no header overflow | Agent-Probe | 4 |
| P5 chip present on: home hero lead + aside, pillar showcase (own line above the title on first and compact items, D3), most read, deep dive, sponsored strip, band, pillar lead + grid, related row, search page, search overlay, account saved/history/queue (needs signed-in session or direct render of `account-tabs`; if no session is available record as a named gap), article page; absent for an unflagged article on each, absent on `/exclusive` | Agent-Probe (surface-by-surface) | 5 |
| P6 article chip href is `/trust/editorial#exclusive`; page scrolls to the section (not hidden under the sticky header); wording matches; `grep -rn "OpenTechWire" <changed files>` is empty | Hybrid | 6 |
| P4b `/exclusive` header per D4: flag icon, kicker `OTW · EXCLUSIVE`, RSS button href `/exclusive/rss.xml`, definition link href `/trust/editorial#exclusive` (en/vi/id text), 4px accent bottom border; page 1 pager shows only "Older stories →"; no chip on cards | Agent-Probe | 2, 5 |
| P8 flagged newest article appears as hero and in its pillar page | Agent-Probe | 8 |
| P9 sponsored+exclusive article: both labels, three non-dismissible disclosure boxes still present | Agent-Probe | 9 |
| G-HEX: run `cd /home/user/dtw-web && git add -N apps packages` first (intent-to-add, so the ~10 new files appear), then `git diff -U0 -- apps packages | grep -E '^\+[^+].*#[0-9A-Fa-f]{3,8}\b'`; the ONLY allowed hit is the single `#FFFFFF` inside `.exclusive-chip--on-dark` in `globals.css` (same literal `most-read.tsx` already uses); any other hit fails the gate. Plain `git diff` alone is blind to new files and must not be used | Fully-Automated | 10 |
| P10 contrast: toggle `html[data-theme="dark"]`, default chip contrast >= 4.5:1 in light and dark; the Most Read band (navy `--banner`) uses the `onDark` chip (white text, accent border) with contrast >= 4.5:1 in light and dark theme | Agent-Probe | 10 |
| apcg-cms `git diff` = 1 file, description/comment lines only; `git status --porcelain -- src/migrations | wc -l` = 0 (sees untracked files); `npm run typecheck`; `npm run lint` | Fully-Automated | 11, 12 |
| dtw-web `pnpm typecheck` + `pnpm --filter web lint` (no new findings vs baseline) + existing node tests unchanged | Fully-Automated | 13 |
| `pnpm --filter web exec next build` (if it runs offline) | Hybrid | 13 (supporting) |

Named residuals (none is a proving strategy): no DOM/component test runner exists in dtw-web (only node:test), so rendering is covered by agent probe only; a backlog stub is written for "add a component test runner" (see Test Infra Improvement Notes). Account-list chip (P5) depends on a signed-in session; if unavailable it stays CONDITIONAL, not PASS.

Named residuals (CONDITIONAL, each with a backlog stub to be written at UPDATE PROCESS into `process/general-plans/backlog/otw-exclusive-residuals_NOTE_20-10-26.md`, one section per item): (R-a) account saved/history/queue chips: need a signed-in Better-Auth session which needs Postgres; (R-b) Sponsored strip chip: `SponsoredStrip` is imported nowhere, so only the shared-rule test + typecheck + grep prove it; (R-c) Deep Dive chip and the "band after Deep Dive" position: `SHOW_DEEP_DIVE=false` in production, observable only through the local, uncommitted flag flip in step 32 (verify the flag is unchanged with the `git diff` check there); (R-d) no DOM/component test runner. Each stays CONDITIONAL until a real test exists; none is a proving strategy.

## Blast Radius

- dtw-web: 34 source files (10 new, 24 modified, incl. `icons.tsx`) in `apps/web` and `packages/ui`. Risk class: medium (touches many shared card components, but each edit is additive and gated by one rule).
- Shared package `@dtw/ui` gains one export (additive).
- apcg-cms: 1 file, copy-only; ships to all tenants' editors (BriefAsia, GCV, WAD, WTB, GTP, VowAsia see the same help text), so it must stay neutral.
- No DB, no migration, no env var, no dependency change, no CMS API change.

## Risks and mitigations

| ID | Risk | Mitigation |
|---|---|---|
| R1 | A chip surface is missed (SPEC lists ~12) | single shared eligibility rule + wrapper component; explicit file list; step-17 grep completeness; probe P5 surface-by-surface |
| R2 | `/exclusive` collides with dynamic `[pillar]` (`/exclusive`, `/exclusive/page/n`, `/exclusive/rss.xml`) | App Router prefers static segments; probe P2 also confirms `/ai`, `/ai/page/2`, `/ai/rss.xml` still resolve; add a note that `exclusive` must never be a CMS pillar slug (none exists for dtw) |
| R3 | CMS copy reaches all tenants' editors | wording is tenant-neutral ("this publication"); reviewed word-by-word against owner text; 1-file diff check |
| R4 | Section is empty until editors flag a story | band hides, page shows empty state; owner action after deploy: flag one real story (NOT part of this plan) |
| R5 | No UI test coverage | unit tests for pure logic + scripted probe against a mock Central; component test runner recorded as a backlog stub |
| R6 | Chip contrast fails AA in one theme with the single coral accent | class-level theme split (`--accent-ink` light / `--accent` dark), verified in P10 |
| R7 | Header overflow on narrow desktop with one more link | probe P4 at 1024px; if it wraps, escalate to the owner (do not restyle the header inside this plan) |
| R8 | Cache lag: chips/band update within ~60 s (tag bust), RSS within 300 s | documented, same as existing feeds; not a defect |
| R9 | `Article` generated type lacks `exclusive` | local intersection type; no hand edit of generated file |
| R10 | id/vi strings beyond the owner-confirmed chip labels (band kicker, tagline, empty state, pager, Editorial Standards text) are agent-drafted | listed verbatim above; owner/translator may amend; flagged in the phase report |
| R11 | `next build` may not run offline | typecheck + dev-server probe are the gates; build recorded as a Known Gap if blocked |
| R12 | `tsx` alias resolution in the feed test | caveat and fallback in the test matrix |

Risk predictions (inline substitute for the 5-persona debate, since the plan session has no sub-agent call): the most likely failure is surface drift (R1), second is the sticky-header anchor offset (step 28), third is the dark-mode contrast (R6). Edge cases folded into steps: hero lead exclusive and also in the band (D1); chip on navy (D2); page 1 with zero docs is OK, page 2 with zero docs is 404; sponsored+exclusive; exclusive+deepDive in both bands; `totalDocs` not a multiple of 12; pager shown when `page>1` even if `hasNextPage` is false; `/exclusive/page/1` redirects; junk page segment 404.

## Backwards compatibility and rollback

Fully additive. Rollback = revert the dtw-web commit(s) (nav link, routes, chips vanish; flag data stays in Central harmlessly) and, independently, revert the one apcg-cms commit. No data migration, no env change. The merge order of the two repos is free.

## Phase Completion Rules

Single-plan, no phase program. Each Group A-H ends with its gate (typecheck, lint vs baseline, `test:exclusive`). A group is `CODE DONE` when its gate is green; it is not `VERIFIED` until the probe tier covering it (P1-P10) has run and the evidence is recorded. The plan is `COMPLETE` only when: all Fully-Automated gates green, every Hybrid gate green, every Agent-Probe scenario recorded with an observation, and residuals named. Known-gap is a named residual and never a proving strategy; any developed behavior covered only by a Known Gap stays CONDITIONAL and gets a backlog stub.

## Test Infra Improvement Notes

- `process/context/tests/all-tests.md` describes vitest, Playwright and PGlite that do not exist; the real runner is `tsx --test` (scripts `test:bot-detect`, `test:signup-guard`, new `test:exclusive`). Reconcile at UPDATE PROCESS.
- CI (`.github/workflows/ci.yml`) runs typecheck only; lint and node tests are not wired. Backlog stub: add `pnpm --filter web lint` (after baseline cleanup) and the three `test:*` scripts to CI.
- No component/DOM test runner (React Testing Library or similar) exists; chip-on-surface checks rely on agent probe. Backlog stub: add a component test runner and a mock-Central fixture server as a committed dev tool (this plan's probe mock is throwaway).
- A reusable mock Central API (seeded flagged/unflagged/sponsored articles) would let future UI features be probed deterministically; none exists today.

## Resume and Execution Handoff

1. Selected plan file: `/home/user/dtw-web/process/general-plans/active/otw-exclusive_20-10-26/otw-exclusive_PLAN_20-10-26.md` (single anchor; no supporting phase files).
2. Last completed step: PLAN written; nothing executed.
3. Validate-contract status: pending (a placeholder section is below; `vc-validate-agent` must write it before EXECUTE).
4. Supporting context files: SPEC (same folder), `process/context/all-context.md`, `process/context/tests/all-tests.md`, BriefAsia reference files under `/home/user/brief-asia-web/src` (read-only), `/home/user/apcg-cms/process/context/tests/all-tests.md` (for Group G).
5. Next step for a fresh agent: ENTER VALIDATE MODE on this plan; after PASS, EXECUTE Groups A-H in order (dtw-web Groups A-F, H first; Group G in apcg-cms is independent and can run in parallel or after). Execute-agent model: opus (real code edits). No agent may tick a real production article, merge a PR, or add anything under `apcg-cms/src/migrations/`.
6. Strategy (validated): EXECUTE = one opus `vc-execute-agent` for dtw-web (Groups A-F, H) and one separate opus `vc-execute-agent` for apcg-cms (Group G); the repos are disjoint so the two may run in parallel; testers and probes run on sonnet. Earlier note, superseded by the line above where they differ: dtw-web chip edits (step 14) touch 11 independent files with identical shape, so a parallel-subagent fan-out is possible, but the files share the wrapper import and the typecheck gate; recommended is sequential in one execute-agent (low coordination cost), with Group G as a second, independent, small execute spawn.
7. Validators for the plan itself: `node .claude/skills/vc-generate-plan/scripts/validate-plan-artifact.mjs <plan-path>` (run from `/home/user/apcg-cms` where the harness scripts live, or the dtw-web copy if present).

## Validate Contract

Status: CONDITIONAL
Date: 20-10-26
date: 2026-10-20
generated-by: outer-pvl

Scope validated: single plan (not a phase program). V1 structural check `validate-plan-artifact.mjs` = 0 failures, 0 warnings. Plan claims were checked against the real code in `/home/user/dtw-web` and `/home/user/apcg-cms` (file paths, line refs, component shapes, route precedence, i18n mechanism, test wiring). Layer 1 and Layer 2 checks were run by the validate-agent itself (the subagent session had no sub-agent spawn tool); no live-provider or production-data probe was run.

Parallel strategy: sequential
Rationale: signal score 2/7 (S1 three code areas: `apps/web`, `packages/ui`, `apcg-cms`; S7 about 35 files; dominant signal S7). The 11 chip-surface edits have the same shape and share one wrapper import plus one typecheck gate, so a fan-out buys little. Recommended: ONE opus `vc-execute-agent` for dtw-web Groups A-F and H (1 agent), plus ONE small independent opus `vc-execute-agent` for Group G in apcg-cms (may run in parallel, disjoint repo): 2 agents total. Alternatives: parallel subagents for step 14 = about 4 + 11 + 3 = 18 agents (not recommended); workflow and agent team not needed (no mid-run coordination). Cost guard not triggered (under 30). Tester and probe legs run on sonnet; only the two execute spawns are opus.

Test gates (C3 5-column table; strategies are only Fully-Automated / Hybrid / Agent-Probe; Known-Gap is never a strategy):

| criterion id | behavior | strategy | proving test | gap-resolution |
|---|---|---|---|---|
| SPEC-1 | Exclusive list request is `flag=exclusive`, `content_type=article`, `sort=-publishedAt`, paged | Fully-Automated | `cd /home/user/dtw-web && pnpm --filter web test:exclusive` (T-QUERY) | B |
| SPEC-1 | `/exclusive` lists only seeded flagged articles, newest first | Hybrid | P1 curl/browser on local dev server + throwaway mock Central (precondition: placeholder `DATABASE_URL`, see E4) | B |
| SPEC-2 | page parse / path / count / classify (page 1 empty = ok; past end = not-found) | Fully-Automated | `pnpm --filter web test:exclusive` (T-PAGE-PARSE, T-PAGE-PATH, T-PAGE-COUNT, T-PAGE-CLASSIFY) | B |
| SPEC-2 | HTTP: `/exclusive` 200; `/exclusive/page/1` 307 or 308 to `/exclusive`; `/page/2` 200 with 30 seeded; `/page/99`, `/page/02`, `/page/abc` 404; `/ai`, `/ai/page/2`, `/ai/rss.xml` still pillar routes | Hybrid | P2 `curl -sI` per URL (see E5 on status code) | B |
| SPEC-3 | band picks first 3 after dropping the hero lead; empty input = no band | Fully-Automated | `pnpm --filter web test:exclusive` (T-BAND-PICK) | B |
| SPEC-3 | home band present with flagged data (3 cards, See all), absent with none, hero lead not repeated | Agent-Probe | P3 (0 and 5 flagged; hero-lead-is-exclusive case) | B |
| SPEC-4 | nav link desktop (1280 and 1024 px) and mobile drawer, en/vi/id | Agent-Probe | P4 | B |
| SPEC-5 | one shared chip rule: flagged yes; unflagged/null/undefined no; on `/exclusive` no; sponsored+exclusive yes | Fully-Automated | `pnpm --filter web test:exclusive` (T-CHIP-ELIGIBLE, T-CHIP-SPONSORED) | B |
| SPEC-5 | chip rendered on every mounted card/row surface, absent for unflagged | Agent-Probe | P5 surface-by-surface (hero lead+aside, pillar showcase, most read on-dark, band, pillar featured+grid, related row, search page, search overlay, article page) plus step-17 grep completeness (Hybrid) | B |
| SPEC-6 | article chip href `/trust/editorial#exclusive`, section exists, anchor not hidden by sticky header, no `OpenTechWire` | Hybrid | P6 + `grep -rn "OpenTechWire" <changed files>` empty | B |
| SPEC-7 | feed channel/self path, empty feed well-formed, order preserved, no `OpenTechWire` | Fully-Automated | `pnpm --filter web test:exclusive` (T-FEED-CHANNEL, T-FEED-BUILD, T-CONSTANTS) | B |
| SPEC-7 | `/exclusive/rss.xml` is well-formed XML, newest first; `/exclusive` head advertises it | Hybrid | P7 (`xmllint --noout` or node parse, plus head `<link rel=alternate type=application/atom+xml>`) | B |
| SPEC-8 | flagged newest article can be the hero and still appears in its pillar | Agent-Probe | P8 | B |
| SPEC-9 | sponsored+exclusive article page shows both labels; three non-dismissible disclosure boxes intact | Agent-Probe | P9 | B |
| SPEC-10 | no new colour literal in changed code (one allowlisted `#FFFFFF`, see E2) | Fully-Automated | G-HEX corrected command in E2 | B |
| SPEC-10 | chip contrast at least 4.5:1 light and dark; Most Read band uses on-dark chip | Agent-Probe | P10 (validate-agent hand-computed light accent-ink on paper 5.27, dark accent on #0F172A 4.77, white on banner 14.0 / 15.8, default accent on banner 3.74 so the on-dark variant is needed) | B |
| SPEC-11/12 | apcg-cms diff = `src/collections/Articles.ts` only, copy lines only, no migration file added or changed | Fully-Automated | `cd /home/user/apcg-cms && git diff --stat` and `git status --porcelain -- src/migrations \| wc -l` = 0 (E3; plain `git diff --name-only` is blind to new files) | B |
| SPEC-11 | apcg-cms typecheck and lint not worse than pre-edit baseline | Fully-Automated | `cd /home/user/apcg-cms && npm ci && npm run typecheck && npm run lint` (baseline captured BEFORE the edit; `src/payload-types.ts` is absent, see tests/all-tests.md lines 104-121) | B |
| SPEC-13 | dtw-web typecheck, lint vs baseline, existing node tests | Fully-Automated | `cd /home/user/dtw-web && pnpm install --frozen-lockfile && pnpm typecheck && pnpm --filter web lint && pnpm --filter web test:bot-detect && pnpm --filter web test:signup-guard` | B |
| SPEC-13 | production build compiles (supporting) | Hybrid | `pnpm --filter web exec next build` with placeholder env (E4); if it cannot run offline: named residual | D |

Failing stubs (Fully-Automated test rows only; copy these as the red-first starting point in step 3; command-only gates have no stub):

```
Failing stub (T-QUERY):
test("should build exclusive query {flag:exclusive, content_type:article, sort:-publishedAt, page, limit}", () => { throw new Error("NOT IMPLEMENTED - TDD stub: exclusiveQuery") })
Failing stub (T-PAGE-PARSE):
test("should accept 1,2,10 and reject 0,02,-1,1.5,abc,empty,9007199254740993", () => { throw new Error("NOT IMPLEMENTED - TDD stub: parseExclusivePage") })
Failing stub (T-PAGE-PATH):
test("should map page<=1 to /exclusive and page n to /exclusive/page/n", () => { throw new Error("NOT IMPLEMENTED - TDD stub: exclusivePagePath") })
Failing stub (T-PAGE-COUNT):
test("should return at least 1 page and ceil(totalDocs/size) otherwise", () => { throw new Error("NOT IMPLEMENTED - TDD stub: exclusivePageCount") })
Failing stub (T-PAGE-CLASSIFY):
test("should classify page 1 empty as ok and page 2 empty or past-the-end as not-found", () => { throw new Error("NOT IMPLEMENTED - TDD stub: classifyExclusivePage") })
Failing stub (T-BAND-PICK):
test("should drop the hero lead, return the first 3, tolerate short or empty input, not mutate input", () => { throw new Error("NOT IMPLEMENTED - TDD stub: pickBandArticles") })
Failing stub (T-CHIP-ELIGIBLE / T-CHIP-SPONSORED):
test("should show the chip for flagged articles only, never on /exclusive, and also when sponsored", () => { throw new Error("NOT IMPLEMENTED - TDD stub: shouldShowExclusiveChip") })
Failing stub (T-CONSTANTS / T-FEED-CHANNEL):
test("should expose page size 12, band size 3, definition href /trust/editorial#exclusive, feed path /exclusive/rss.xml", () => { throw new Error("NOT IMPLEMENTED - TDD stub: constants and exclusiveFeedChannel") })
Failing stub (T-FEED-BUILD):
test("should build a well-formed Atom feed (empty and 2 entries, order kept, no OpenTechWire)", () => { throw new Error("NOT IMPLEMENTED - TDD stub: buildAtomFeed with exclusive channel") })
```

Legacy line form (retained so existing validate-contract consumers still parse):
- dtw-web pure logic (`apps/web/src/lib/exclusive.ts`): [Fully-automated: `cd /home/user/dtw-web && pnpm --filter web test:exclusive`]
- dtw-web type safety: [Fully-automated: `pnpm typecheck` ; `pnpm --filter web lint` vs baseline]
- dtw-web existing tests unchanged: [Fully-automated: `pnpm --filter web test:bot-detect` ; `pnpm --filter web test:signup-guard`]
- dtw-web routes, band, nav, chips, feed, Editorial Standards: [hybrid: P1, P2, P6, P7 on local dev server + mock Central + placeholder DATABASE_URL] | [agent-probe: P3, P4, P5, P8, P9, P10]
- dtw-web colour tokens: [Fully-automated: corrected G-HEX in E2]
- dtw-web production build: [hybrid: `pnpm --filter web exec next build` with placeholder env] | [known-gap: documented if it cannot run offline]
- apcg-cms copy-only change: [Fully-automated: diff-scope checks in E3 ; `npm run typecheck` ; `npm run lint`]
- chip on account saved/history/queue lists: [known-gap: documented; needs a signed-in Better-Auth session which needs Postgres; backlog stub]
- chip on Deep Dive band and Sponsored strip, and band placement after Deep Dive: [known-gap: documented; `SHOW_DEEP_DIVE=false` and `SponsoredStrip` is imported nowhere; proven only by the shared rule test + compile + grep, unless the probe flips the flag locally and does not commit it]
- component rendering without a DOM test runner: [known-gap: documented; backlog stub "add a component test runner and a committed mock-Central fixture"]

Dimension findings:
- Infra fit: CONCERN - `node_modules` is absent in both repos at validate time (EXECUTE must install first); probes need a placeholder `DATABASE_URL` because `@dtw/db/client` throws at import without one and the home page imports it via `most-read.ts` (the query itself fails open); mock Central must cover every module the layout and home call.
- Test coverage: CONCERN - rendering has only Agent-Probe coverage (no DOM runner); account-list chips, Deep Dive and Sponsored-strip chips, and the after-Deep-Dive band position have no executable proof (named residuals); G-HEX and the migration guard as written are blind to new (untracked) files.
- Breaking changes: PASS - everything is additive: `ArticleView.exclusive` is a new required field but no code builds an `ArticleView` literal (`ArticleView = {` has 0 hits; `tsc` would flag any), `toArticleView` only widens its parameter, `@dtw/ui` gains one export, flag union gains one member; static `/exclusive`, `/exclusive/page/[n]`, `/exclusive/rss.xml` win over `[pillar]` routes; `middleware.ts` matcher and `next.config.ts` redirects do not touch `/exclusive`; Central's public route already accepts `flag=exclusive` (`apcg-cms/src/app/api/public/articles/route.ts:185`) and its list select is exclusion-mode so `exclusive` is returned.
- Security surface: PASS - no auth, billing or secret surface; public read-only routes through the existing read-token layer; chip href is a constant; RSS goes through `xmlEscape`; page param is regex plus `isSafeInteger` validated (a very large safe integer still triggers one Central read and one cache entry, identical to the existing pillar pagination precedent; accepted, not new risk).
- Section A (baseline and pure logic) feasibility: PASS - `exclusive.ts` has no `server-only`; `feed.ts` imports `@/lib/article-view` as a value, so `tsx` must resolve the `@/*` path alias (supported by tsx; unproven here because deps are not installed; the plan's fallback applies); highest-risk edit: T-FEED-BUILD alias resolution.
- Section B (CMS client and view model) feasibility: PASS - `central-api.ts:123` flag union, `getArticlesPage` at 181-196 and `getFeedArticles` at 466-484 match the plan; `cms-client.ts` is a plain re-export barrel; `payload-types.ts` has 0 `exclusive` hits so the local intersection type is required; highest-risk edit: `unstable_cache` key per argument set (default behavior, fine).
- Section C (chip primitive and styles) feasibility: CONCERN - D2 needs a literal white that does not exist as a theme-stable token (`--surface` turns dark in dark mode), so one `#FFFFFF` literal enters `globals.css`, which contradicts the plan's "zero new hex" gate wording; contrast arithmetic otherwise verified.
- Section D (chip on every surface) feasibility: CONCERN - PillarTag sites match the plan (home-hero 52/116, deep-dive 47, pillar-content 257, related-row 59, article-content 116, search page 255, account-tabs 269/376); but the pillar-content featured card has NO PillarTag (kicker "Featured - section" only), related-row and pillar grid place PillarTag with no flex row (need a wrapper), `SponsoredStrip` is imported nowhere and `DeepDive` is hidden by `SHOW_DEEP_DIVE=false`; the N/A list misses `home/best-of-reviews.tsx` (static demo data).
- Section E (page, pagination, feed) feasibility: CONCERN - plan step 21 uses `redirect()` (HTTP 307) like the pillar precedent but probe P2 and the verification table expect 308.
- Section F (nav, band, Editorial Standards) feasibility: PASS - `NAV_EXTRA` is iterated by header desktop (561) and mobile (773) only; `NAV_I18N` pattern fits; `trust-content.tsx` tuple type (line 130) and `<section key={h}>` (line 386) match; `--header-h` is published by `header.tsx:107-113`; home hero lead id is `lead.id` and `lead` can be null (band must tolerate); highest-risk edit: sticky-header anchor offset (verified mechanism exists).
- Section G (apcg-cms copy change) feasibility: CONCERN - `Articles.ts` description at 389-390 and branch `claude/modest-hamilton-wbspcg` clean as planned; the comment to reword spans lines 380-381 (two lines), not one; `git diff --name-only | grep -c src/migrations` cannot see a newly created migration file.
- Section H (whole-repo verification) feasibility: CONCERN - see Infra fit; account-list probe cannot run without Postgres + Better-Auth session; mock Central is a throwaway and must be broad.

Open gaps:
- Gap 1: no install of dependencies in either repo yet; EXECUTE must run `pnpm install --frozen-lockfile` (dtw-web) and `npm ci` (apcg-cms) first (E1).
- Gap 2: G-HEX and apcg-cms migration guard blind to new files; one `#FFFFFF` allowlist needed (E2, E3).
- Gap 3: P2 expects 308 but `redirect()` gives 307 (E5).
- Gap 4: chip on Deep Dive band and Sponsored strip (unmounted / hidden), after-Deep-Dive band placement, account lists: no executable proof (known-gap: documented; backlog stub).
- Gap 5: pillar-content featured card and related-row/pillar-grid chip placement unspecified (E6).
- Gap 6: probe environment (placeholder DATABASE_URL, mock Central breadth) unspecified (E4).
- Gap 7: step-17 N/A list incomplete (E7).
- Gap 8: apcg-cms comment spans two lines (E8).
- Gap 9 (named residual, not a proving strategy): no DOM/component test runner in dtw-web; CI runs typecheck only; `all-tests.md` is stale. Backlog stub to be written by EXECUTE/UPDATE PROCESS as already planned.
- Known gaps resolved via backlog: none pre-existing in the plan (`## Known Gaps (Resolved via Backlog)` section absent).

What This Coverage Does NOT Prove
(What this coverage does NOT prove, per gate:)
- `test:exclusive` (pure logic and feed builder): does not prove any React rendering, that a surface actually calls the shared rule, route precedence, the real Central response shape, or `tsx` alias behavior in CI.
- `pnpm typecheck` / lint: prove types and lint baselines only; lint is not in CI and `next lint` is not a deploy gate.
- P1-P10 probes (against a throwaway mock Central, not real Central): do not prove behavior with real CMS data, real cover images, production caching/ISR windows, the Central revalidation webhook, or the 60 s / 300 s cache lag.
- P5 chips: does not prove account saved/history/queue lists (no signed-in session), Deep Dive band and Sponsored strip (hidden / unmounted), or any surface added later.
- P10 contrast: hand-computed ratios plus an observed probe; not an automated accessibility audit (no axe run is planned).
- G-HEX: proves no new colour literal other than the allowlisted one; does not prove tokens are used where intended.
- apcg-cms checks: prove the diff is one file of copy only; do not prove editors see the text in /admin or that other tenants' wording reads well (needs a human look; the text is tenant-neutral by construction).
- `next build` (if it runs): proves compile and static generation with placeholder env, not that production env, ISR, or the redirect shim behave.

Plan updates applied: none in this pass. The validate-agent made no edit to plan text outside this section; all concerns are routed as a SUPPLEMENT REQUEST (below) for the orchestrator-driven PVL supplement cycle. Interim instructions for the execute-agent follow so the contract is usable as-is once the plan is supplemented.

Execute-agent instructions:
- E1 (install first): before step 1 run `cd /home/user/dtw-web && pnpm install --frozen-lockfile` and `cd /home/user/apcg-cms && npm ci`. If install is blocked by network/proxy, stop and report NEEDS_CONTEXT; do not fake gates. Capture the typecheck and lint baselines BEFORE any edit in each repo.
- E2 (G-HEX corrected): run `cd /home/user/dtw-web && git add -N apps packages` first so new files appear in the diff, then `git diff -U0 -- apps packages | grep -E '^\+[^+].*#[0-9A-Fa-f]{3,8}\b'`. Allowed hits: exactly the one `#FFFFFF` in the `.exclusive-chip--on-dark` rule in `globals.css`. Any other hit is a gate failure. Use the literal `#FFFFFF` (not `#fff`) in that rule so the allowlist is exact. Do not rely on `git diff` alone for untracked files.
- E3 (migration guard corrected): in apcg-cms use `git status --porcelain -- src/migrations | wc -l` (must be 0; covers untracked) in addition to `git diff --stat` (must show only `src/collections/Articles.ts`). Never create, edit or delete anything under `/home/user/apcg-cms/src/migrations/`.
- E4 (probe environment): start the dev server (webpack or turbopack, own process group) with placeholder env: `CMS_URL=http://localhost:<mock-port> CMS_READ_TOKEN=probe DATABASE_URL=postgresql://u:p@127.0.0.1:1/x BETTER_AUTH_SECRET=probe-secret BETTER_AUTH_URL=http://localhost:3000 NEXT_PUBLIC_SITE_URL=http://localhost:3000`. Without a `DATABASE_URL` the home page 500s because `@dtw/db/client` throws at import (`most-read.ts` then fails open on the refused connection). The mock must answer every `/api/public` call the layout and home make (site, menus, paywall/settings, articles list incl. `flag` and `content_type` params, ai-models/dashboards, wire, briefs); read `cms-client.central.ts` to enumerate them. Mock lives in the scratchpad, never committed.
- E5 (redirect status): `redirect()` in a page returns 307. Accept 307 or 308 with `Location: /exclusive` in P2; keep `redirect()` (mirrors the pillar precedent) unless the orchestrator says otherwise.
- E6 (chip placement): pillar-content featured card: add the chip in the kicker row beside "Featured - section" (wrap in a flex row; the card is inside a `<Link>` so use the span form, never an `<a>`). related-row and pillar grid: wrap `PillarTag` + chip in a small flex row. Chips inside card links must be non-link spans; only the article-page chip and the `/exclusive` header links are anchors.
- E7 (step-17 N/A additions): also record `components/home/best-of-reviews.tsx` (static demo data, hidden), `legal/[slug]/page.tsx` and `trust/[slug]/trust-content.tsx` `<article>` hits (not article cards) as N/A with evidence.
- E8 (apcg-cms comment): replace both comment lines 380-381 with the one neutral comment; no other line may change.
- E9 (hidden/unmounted surfaces): still add the chip to `deep-dive.tsx` and `sponsored-strip.tsx` as planned; prove them by rule test + typecheck + grep. In P3/P5 you may flip `SHOW_DEEP_DIVE` locally to observe, but revert before commit (`git diff` must not contain that flag change). Record the rest as named residual with a backlog stub.
- E10 (account-list probe): attempt only if a session can be obtained without production data; otherwise record the named gap and keep the plan CONDITIONAL for that surface.
- E11: do not edit `apps/web/src/payload/payload-types.ts`; do not tick any real article; do not merge PRs; do not run any billed or live-provider probe.

SUPPLEMENT REQUEST:
- Gap 1: Section ordered-implementation-checklist | Concern: node_modules absent in both repos; step 1 baselines and every gate assume installed deps | Severity: CONCERN | Suggested addition: add step 0 "run `pnpm install --frozen-lockfile` in dtw-web and `npm ci` in apcg-cms; if blocked, report NEEDS_CONTEXT".
- Gap 2: Section verification-evidence | Concern: G-HEX uses plain `git diff` which cannot see the 10 new files, and D2 adds a literal `#FFFFFF` that contradicts "no new hex" | Severity: CONCERN | Suggested addition: change G-HEX to run `git add -N apps packages` first, and allowlist exactly one `#FFFFFF` in `.exclusive-chip--on-dark` (state `#FFFFFF` literally in step 11 instead of hedging).
- Gap 3: Section verification-evidence | Concern: apcg-cms migration guard `git diff --name-only | grep -c src/migrations` cannot see a newly created file | Severity: CONCERN | Suggested addition: use `git status --porcelain -- src/migrations | wc -l` = 0 in step 30 and in the apcg-cms evidence row.
- Gap 4: Section verification-evidence | Concern: P2 expects `/exclusive/page/1` to answer 308 but step 21 uses `redirect()` which is 307 | Severity: CONCERN | Suggested addition: change P2 expectation to "307 or 308 with Location: /exclusive".
- Gap 5: Section ordered-implementation-checklist | Concern: step 14 chip placement is undefined for the pillar-content featured card (no PillarTag, kicker is "Featured - section") and for related-row and pillar grid cards (PillarTag with no flex row) | Severity: CONCERN | Suggested addition: specify "featured card: chip inside the kicker row; related-row and grid cards: wrap PillarTag and chip in a flex row; chips in card links are spans".
- Gap 6: Section verification-evidence | Concern: SponsoredStrip is imported nowhere, DeepDive is hidden by `SHOW_DEEP_DIVE=false`, and account lists need a signed-in session (Postgres + Better-Auth); P5 and the after-Deep-Dive band placement cannot be observed on live pages | Severity: CONCERN | Suggested addition: name these as residuals in "Named residuals" with a backlog stub, allow a local uncommitted flag flip for the probe, and keep the plan CONDITIONAL for those surfaces.
- Gap 7: Section ordered-implementation-checklist | Concern: step 32 probe environment omits a placeholder `DATABASE_URL` (the home page 500s at import of `@dtw/db/client` without it) and the breadth of modules the mock Central must serve | Severity: CONCERN | Suggested addition: list the env vars in E4 above and "mock must cover site, menus, paywall settings, articles (flag/content_type), ai-models/dashboards, wire, briefs".
- Gap 8: Section ordered-implementation-checklist | Concern: step 17 N/A list omits `home/best-of-reviews.tsx`, `legal/[slug]/page.tsx`, `trust-content.tsx` which the grep `<article\b` will hit | Severity: CONCERN | Suggested addition: add them to the N/A list with the reason.
- Gap 9: Section touchpoints | Concern: apcg-cms comment to reword is lines 380-381 (two lines) but the plan says line 380 and "NO other line changes" | Severity: CONCERN | Suggested addition: say "lines 380-381 (both) replaced by one neutral comment line".

Gate: CONDITIONAL
Accepted by: none yet - first-pass CONDITIONAL (0 FAIL, 9 CONCERN); no user acceptance and no EXECUTE routing recorded. The nine concerns above (install prerequisite, G-HEX blind to new files and #FFFFFF allowlist, migration guard blind to new files, 307 vs 308, chip placement on featured/related/grid, unobservable hidden/unmounted/account surfaces, probe env, step-17 N/A list, apcg-cms comment lines) go to the orchestrator's PVL supplement cycle; re-validate from V1 afterwards.

## Autonomous Goal Block

SESSION GOAL: Opentechwire "Exclusive" section (dtw-web) plus one copy-only checkbox description change (apcg-cms), branch claude/modest-hamilton-wbspcg in both repos, draft PRs only.
Charter + umbrella plan: N/A - single plan: /home/user/dtw-web/process/general-plans/active/otw-exclusive_20-10-26/otw-exclusive_PLAN_20-10-26.md (SPEC and design/ in the same folder).
Autonomy: autonomous phase execution per feedback_autonomous_phase_execution.md; autonomy removes approval pauses only; subagent delegation stays mandatory (opus execute-agent for dtw-web Groups A-F,H; separate opus execute-agent for apcg-cms Group G; sonnet tester for the EVL gate re-run).
Hard stop conditions / safety constraints:
- Do not create, edit or delete anything under /home/user/apcg-cms/src/migrations/ (production build runs every file there).
- Do not tick any real article as Exclusive, do not merge any PR, do not touch production data or other tenants.
- Do not hand-edit apps/web/src/payload/payload-types.ts; no new design tokens or colour literals beyond the single allowlisted #FFFFFF.
- No billed or live-provider probe; mock Central stays in the scratchpad and is never committed.
- Casing "Opentechwire" only; never "OpenTechWire"; frozen identifiers dtw, dtw_auth, dtw-media unchanged.
Next phase: PVL supplement cycle (plan-agent adds the 9 gaps), then re-validate from V1; EXECUTE only after a PASS verdict or an accepted CONDITIONAL with at least 1 recorded supplement cycle.
Validate contract: inline in the plan (## Validate Contract).
Execute start: pnpm install --frozen-lockfile; pnpm --filter web test:exclusive (red stubs first) | pnpm typecheck | pnpm --filter web lint vs baseline | P1-P10 agent probes on local dev server + mock Central | apcg-cms: npm ci; npm run typecheck; npm run lint; git status --porcelain -- src/migrations | wc -l = 0 | high-risk pack: no

Next Step: orchestrator runs a PVL supplement cycle (vc-plan-agent, PVL-supplement mode, with the SUPPLEMENT REQUEST above), then re-spawns vc-validate-agent from V1. Do NOT route to EXECUTE on this first-pass CONDITIONAL.
