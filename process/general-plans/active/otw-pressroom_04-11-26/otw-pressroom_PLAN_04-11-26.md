# Opentechwire Pressroom parity with BriefAsia: PLAN (COMPLEX, 3 streams, 2 repos + 1 optional)

Date: 04-11-26

Complexity: COMPLEX
Status: VALIDATED 04-11-26 (outer-pvl; see `## Validate Contract`, Gate PASS with accepted known gaps). Owner approved executing straight after validate (D5). Plan corrections applied by VALIDATE are marked `[V-FIX]` below.

## Overview / TL;DR
Owner request (04-11-26): "làm trang pressroom cho dtw tương tự BA và các web khác nhé, sửa trong cms nữa".
- Stream A (apcg-cms, `/home/user/apcg-cms`): add `dtw: ["pressroom"]` to `ENGINE_BLOCKED_PILLARS` and `SINGLE_HOME_PILLARS`; migrate the one test that uses `dtw` pressroom as a not-blocked control to `world-travel-brief`; docs + context. No migration.
- Stream B (dtw-web, `/home/user/dtw-web`): `pressroom` is a CMS pillar that already renders via the dynamic `[pillar]` route. Make it (1) a nav link between Briefing and Awards shown only when the CMS row exists, (2) not mislabelled "latest", (3) hidden from home/latest/RSS/most-read/account-follow, (4) "Distributed by Opentechwire" byline. Display only.
- Stream C (content-engine): n/a (record follow-up).
- Owner creates the dtw `pressroom` Pillars row by hand in /admin AFTER both deploys. Agents never write to any non-local DB.

## Locked SPEC (owner decisions 04-11-26, NOT re-opened)
- D1 Slug `pressroom`; CMS tenant slug `dtw` (frozen identifier, never rename; invariant #15).
- D2 Nav: link between "Briefing" and "Awards" in nav extras (desktop row + mobile drawer); NOT a pillar tab (filtered out of `pillars.map`); shown only when the CMS `pressroom` pillar row exists for dtw. Labels en "Pressroom", vi "Phòng báo chí", id "Ruang Pers".
- D3 Hidden (FE-side, public CMS API untouched): home hero/aside/pool, home per-pillar showcase (no Pressroom band), pinned Latest (fetch several, take first non-single-home), `/latest` firehose and its load-more, root `/rss.xml`, most-read (incl. homepage top-up), account follow list. STAY: search, sitemap, llms.txt, tag pages, Pressroom's own pillar page + its own `/pressroom/rss.xml`. `/latest` paged pages may show fewer cards (documented, accepted).
- D4 Byline: "Distributed by Opentechwire" on Pressroom articles: no "By", no avatar/role/city/co-authors, no author link; JSON-LD author = Organization "Opentechwire"; OG `authors` omitted; cards/result rows show only time + reading time via `cardByline(a)`. Casing `Opentechwire` only (never OpenTechWire). Credit may be en-only; use inline `t()` for "Distributed by" if trivial.
- D5 Execute straight after validate; no production DB writes; owner creates the row.
- OUT OF SCOPE: new colors (invariant #7), PILLARS (6 entries) change, `/press` route, engine client changes, translating more than nav labels (+ optional credit), sitemap/llms.txt/search/tag changes, any DB write, commits/pushes by execute agents.

## Decision Summary
### Chosen Approach
CMS constants flip (tenant-keyed, zero new logic, same as WAD/GCV/BA). dtw-web: one import-free `lib/single-home-pillars.ts` (+ `node:test`, mirrors BA and `lib/exclusive.ts`) is the single FE source of truth; `PillarId` widened with `"pressroom"` so `asPillarId` stops mislabelling; filters applied at each FE aggregate call site, keyed on slug.

### Why This Over Alternatives
| Alternative | Why rejected |
|---|---|
| Make Pressroom a normal pillar tab | Violates D2; BA/GCV treat it as a tail link |
| Filter in CMS public API | Owner D3: FE-side like BA; API contract untouched |
| Add `pressroom` to `PILLARS` (6) | Would leak into follow lists/facets/footer; BA widened `PillarId` only |
| Hardcode nav link unconditionally | 404 risk before the row exists; D2 requires data gate |
| Keep `dtw` as not-blocked control in CMS test | Contradicts SPEC; swap to fixture-only `world-travel-brief` |
| Create dtw pressroom row in CMS probe | Probe MOVE checks move pillars INTO dtw and need dtw to have no pressroom ROW (`single-home-probe.ts:281,301,308`); constants do not create a row, so stays valid; do NOT add a row |
| Change CMS API to exclude on `/latest` paging | Out of scope; accept short pages |

### Risk Predictions
- Data: existing dtw Pressroom-like articles (if the owner has any under another pillar) unaffected; if a `pressroom` row already holds articles with secondary sections/sub-sections/exclusive, they are grandfathered until next taxonomy save. Owner runs violator SQL first (non-optional, tenant `dtw`).
- Mislabel trap: any unknown slug renders as "latest" in breadcrumb/tag/cover art/related until `PillarId` is widened (B2); regression test target.
- Nav overflow: desktop row height 46 + `overflow:hidden`; one extra link may clip at 901-1180px (unmeasured known gap; optional padding rule like BA `globals.css:809-818`).
- Pagination: `/latest` load-more may return short pages when Pressroom items fall in the page; accepted.
- Engine: dtw engine gets 422 for `pressroom` (already never targeted; see Stream C).
- Hub authoring into dtw pressroom becomes `blocked_pillar` (generic via `hub-author-refs.ts`); consistent with other tenants, accepted.
- FE constant duplicates CMS constant; keep in sync.

### Key Constraints Accepted
English-only credit acceptable; no feed/sitemap/search changes; nav-clip unmeasured.

## Acceptance Criteria
| ID | Criterion | proven by | strategy |
|---|---|---|---|
| AC1 | CMS rejects every single-home violation (V1-V6, rename, move, in-use delete) for `(dtw, pressroom)`; control `(world-travel-brief, pressroom)` unaffected | `single-home-pillars.test.ts` + `single-home-pillar.test.ts` flipped cases; gate G-A3 | Fully-Automated |
| AC2 | Authorless dtw pressroom article saves; authorless dtw non-pressroom rejected | hook test author cases (fixtures dtw pressroom + dtw ordinary pillar) | Fully-Automated |
| AC3 | Engine intake 422 `pillar not writable by engine: pressroom` for dtw create and refresh, incl. ` PRESSROOM ` | `isEngineBlockedPillar` + intake pre-check unit tests; probe | Fully-Automated + Hybrid |
| AC4 | Real Payload hooks enforce the rule for dtw on a disposable PG16 | `probe:single-home` and `-- --http` with new `[DTW]` block; dtw has no pressroom row in seed | Hybrid |
| AC5 | `isSingleHomePillar`/`isDistributedPillar`/`filterOutSingleHome`/`cardByline` correct (exact slug, null-safe) | `single-home-pillars.test.ts` (dtw-web) | Fully-Automated |
| AC6 | A Pressroom article is labelled Pressroom (not "latest") in breadcrumb/tag/cover/related | `asPillarId("pressroom")==="pressroom"` unit test + owner post-deploy check | Fully-Automated + Agent-Probe |
| AC7 | Byline/OG/JSON-LD/cards per D4 on Pressroom only; other articles unchanged | typecheck + build + owner post-deploy page-source check | Hybrid + Agent-Probe |
| AC8 | Pressroom absent from home hero/aside/pool/bands, pinned Latest, `/latest`, root RSS, most-read, account follow; present in search/sitemap/llms/tag pages and own pillar page/RSS | helper unit tests (filter fns) + owner post-deploy probe | Fully-Automated + Agent-Probe |
| AC9 | Nav link between Briefing and Awards only when CMS row exists; not in pillar tabs; 3 labels | typecheck/build + owner probe before/after row creation | Hybrid + Agent-Probe |
| AC10 | All gates green, no regression vs execute-recorded baselines | Verification Evidence table | Fully-Automated |

Known-Gap (named residual, keeps its gate CONDITIONAL, backlog stub at UPDATE PROCESS): no component-render/DOM tests in dtw-web (JSX byline/nav verified by typecheck + build + owner probe); nav clip at 901-1180px unmeasured; engine 4xx handling of the new dtw 422 unverified.

## Phase Completion Rules
A stream is CODE DONE when its gates pass; VERIFIED only after the owner's post-deploy checks. Do not mark VERIFIED from code-only evidence.

## Touchpoints
Line numbers are from research on 04-11-26; execute agents MUST re-grep before editing and justify drift.

### Stream A: apcg-cms (`/home/user/apcg-cms`), mirror of `process/general-plans/active/wad-pressroom_20-10-26/` Stream A
| File | Change |
|---|---|
| `src/lib/constants.ts` ~L84-90 `ENGINE_BLOCKED_PILLARS`; ~L137-143 `SINGLE_HOME_PILLARS` | add `dtw: ["pressroom"]` to both (keep alphabetical-ish style of the file). Update comments (~L117-119, header block above `ENGINE_BLOCKED_PILLARS`): dtw `pressroom` single-home + editor-only since 04-11-26 owner decision; remove any "dtw/wad negative control" wording |
| `src/lib/single-home-pillars.test.ts` | `[V-FIX]` NO dtw expectations exist today in this file (grep `dtw` = 0 hits; the negative control is ALREADY `world-travel-brief`, L91-94/112/220/236/442/453/562): so ADD dtw cases, nothing is "flipped". Edit the deepEqual of both maps at L47 (`SINGLE_HOME_PILLARS`) and L48-58 (`ENGINE_BLOCKED_PILLARS`) to add `dtw: ["pressroom"]`, retitle L46 and L91; add a `describe`/`it` block mirroring the WAD ones (L91-96, 108-112, 207-223, 442-446, 562-566); `isEngineBlockedPillar("dtw","pressroom")` true + `" PRESSROOM "` true + `("dtw","technology")`-style non-pressroom false; `("world-travel-brief","pressroom")` false; `isSingleHomePillar("dtw","pressroom")` true, `"Pressroom"` false, `("dtw","press-room")` false; intake pre-check for dtw returns V1/V2/V3 (mirror wad block); `world-travel-brief` stays null; rename/move tests: dtw rename -> "rename", wtb rename -> null (wtb fixture `{id:19, tenant:6}` already present at L528-534: reuse); `resolveSingleHome` fixtures (L520-535): ADD tenant `{ id: 7, slug: "dtw" }` and pillar `{ id: 21, slug: "pressroom", tenant: 7 }` and assert `m.get("21") === "pressroom"`. Re-grep `dtw` after editing and justify any remaining hit. `singleHomeSlugUnion()` (L59) stays `["pressroom","press-room"]` |
| `src/hooks/single-home-pillar.test.ts` | `[V-FIX]` NO dtw fixture or dtw expectation exists today (grep `dtw` = 0; controls are `world-travel-brief` id 19 tenant 6, L35/55/148/153/342/365/412/496/546), so ADD, do not flip: extend `PILLARS` (L36-47) with `{id:21, slug:"pressroom", tenant:7}` (dtw pressroom) and `{id:22, slug:"ai", tenant:7}` (dtw ordinary, author-required leg) and `TENANTS` (L49-56) with `{id:7, slug:"dtw"}` (update the id legend comment L24-35); add dtw cases for V1/V2/V3/V6; secondary-row validate and SubSections validators for dtw pressroom reject, wtb fixture ok; author: dtw pressroom authorless ok, dtw ordinary REQ, wtb pressroom REQ; referenced delete of dtw pressroom -> APIError 400, wtb allowed; rename dtw pressroom rejects |
| `src/lib/hub-taxonomy-blocks.test.ts:33` | `[V-FIX confirmed]` this is the ONLY existing dtw-not-blocked control in the CMS tests. `markBlockedPillars([pillar(1,"pressroom")], "dtw")` currently `[false]` -> switch tenant arg to `"world-travel-brief"` (still `[false]`, update the `it` title L32 wording if it implies dtw) and add a dtw positive `[true]` (L19-24 loops `ENGINE_BLOCKED_PILLARS` dynamically so dtw is covered automatically) |
| other `src/**/*.test.ts` | grep for `dtw` showed only non-pillar uses (media prefix, hub-direct-upload, hub-author-live HUB_LIVE_EDIT_TENANTS `dtw` string, media-redirect PREFIXES): NO change. Re-grep `pressroom` + `dtw` together to confirm no other control |
| `scripts/single-home-probe.ts` | header comment (dtw single-home; control = wtb); tenant lookup `dtw` exists (L131) and `wtb` exists (L132-133 area); add `[DTW]` block mirroring `[WAD]`/`[GCV]`: V3, V1, V6, V4, authorless publish ok, authorless dtw ordinary pillar (seeded dtw `ai`) rejected, rename and in-use delete rejected. MOVE checks at L281/L301/L308 move pillars INTO dtw and rely on dtw having NO `pressroom` ROW: create the dtw pressroom row INSIDE the DTW block, placed AFTER L308 (and before `[G87]` L365); no later check moves anything into dtw (grep-verified: only L281/301/308). `[V-FIX]` the DTW MOVE check cannot target an arbitrary tenant: the seed has only 5 tenants (brief-asia, dtw, world-travel-brief, gcv, wad) and wad/gcv/wtb all hold a `pressroom` row during the probe, so slug uniqueness would pre-empt the guard. Place `move dtw pressroom into brief-asia (PATCH {tenant})` inside the existing `if (ownPressroom)` branch next to L359-360 (brief-asia pressroom row already removed there), and keep the existing SKIP line semantics when the BA row pre-existed (note the skipped check in the final report). Do NOT seed a dtw pressroom row in `scripts/seed.ts` (NO change) |
| `docs/08-content-engine-integration.md` L67-68 | add dtw `pressroom` to the ENGINE_BLOCKED and SINGLE_HOME lists (text pattern: "WAD `pressroom` (since 20-10-26)" -> add "Opentechwire (`dtw`) `pressroom` (since 04-11-26)") |
| `docs/11-operations.md` L73-130 area | add "Enabling DTW Pressroom (owner decision 04-11-26)" bullet (below the WAD bullet): row does NOT exist yet, owner creates it by hand in /admin AFTER CMS deploy + dtw-web deploy; violator SQL for tenant `dtw` (copy WAD query from this repo's `docs/11-operations.md` / WAD plan, swap `'wad'` -> `'dtw'`); rollback = remove dtw entries + redeploy |
| context: `process/context/all-context.md` (lead + Single-home paragraph ~L? "today brief-asia, gcv, wad ..."), `integrations/all-integrations.md` §Single-home pillar rule, `tests/all-tests.md` (test:single-home counts), `database/all-database.md` only if it mentions the control | document dtw pressroom; fill exact new test counts from gate runs |
NO change: `scripts/seed.ts`, `scripts/hub-probe.ts`, `src/lib/hub-author-refs.ts` (generic), taxonomy modules, migrations (none).

### Stream B: dtw-web (`/home/user/dtw-web`, paths under `apps/web/src`)
| # | File | Change |
|---|---|---|
| B1 | NEW `lib/single-home-pillars.ts` (import-free) | `SINGLE_HOME_PILLAR_SLUGS = ["pressroom"] as const`; `isSingleHomePillar(slug?: string\|null): boolean` (exact slug); `isDistributedPillar` (alias, same rule); `DISTRIBUTED_BY_LABEL = "Distributed by"`; `filterOutSingleHome<T extends { pillar?: ... }>(items, getSlug)`-style generic helper (pure) and `firstNonSingleHome` for pinned Latest; `cardByline(a)` stays in `article-view.ts` (needs ArticleView) |
| B1t | NEW `lib/single-home-pillars.test.ts` (node:test, pattern of `lib/exclusive.test.ts`) | pressroom true; `Pressroom`/` pressroom `/`press`/undefined/null false; filter + firstNonSingleHome cases |
| B1p | `apps/web/package.json` scripts | add `"test:single-home": "tsx --test src/lib/single-home-pillars.test.ts"` |
| B2 | `lib/data.ts:5` `PillarId`; `:102-109` PILLAR_ICONS; `:68-75` PILLARS (UNCHANGED); `:79-90` NAV_EXTRA | widen `PillarId` with `"pressroom"`; add icon entry; add NAV_EXTRA item `pressroom` between `briefing` and `awards` with a marker (e.g. `gated: "pressroom"`) so header renders it only when the CMS pillar exists; keep id/href `/pressroom` |
| B2b | `lib/article-view.ts:144-158` `asPillarId`, `:192` use, `:195-198` author, interface `:43-100` | `asPillarId` returns `"pressroom"` for slug `pressroom` (stop mapping to "latest"); add `distributed: boolean` to `ArticleView` (set via `isDistributedPillar(pillar slug)`); when distributed: `coAuthors: []`, author label = "Opentechwire" (use `SITE_NAME`/brand constant if one exists, else literal `Opentechwire`); export `cardByline(a)` returning time + reading-time string only when distributed, else existing "By X · ..." text. `[V-FIX]` `toArticleView` (`article-view.ts:~185`) is the ONLY place an `ArticleView` object is built (grep-verified; `lib/data.ts` mock `Article` is a different type), so there are no other literals to update; just add `distributed` there. Note `asPillarId`'s `PillarId` widening also changes `ART_PALETTES: Record<PillarId|"policy", ...>` (cover-art.tsx:22), `PILLAR_ICONS: Record<PillarId,string>` (data.ts:102) and `PILLAR_I18N: Record<PillarId,...>` (i18n.tsx:83): ALL THREE will fail typecheck until a `pressroom` key is added (these are the only `Record<PillarId,...>` maps; `byPillar` maps are `Partial`) |
| B3 | `lib/i18n.tsx:83-90` PILLAR_I18N, `:92-97` localizedPillarLabel, `:100-113` NAV_I18N/localizedNavLabel | add `pressroom` pillar label (en Pressroom / vi Phòng báo chí / id Ruang Pers) and nav label. `[V-FIX]` MANDATORY (not optional): `localizedPillarLabel` (i18n.tsx:92-97) does `PILLARS.find(...)` and returns `""` when the id is not in `PILLARS`, and `PILLARS` must NOT gain `pressroom`; after `PillarId` is widened the breadcrumb (article-content.tsx:134), every `PillarTag` (12 call sites: article-content:142, related-row:61, search:256, pillar-content:258, home-hero:53/118, deep-dive:48, exclusive-*) would render an EMPTY label. Special-case `pressroom` inside `localizedPillarLabel` (static en/vi/id table, no PILLARS lookup) and cover it with a unit test if extracted import-free; optional `distributedBy` t() triple (en "Distributed by", vi "Phân phối bởi", id "Didistribusikan oleh") |
| B4 | `components/cover-art.tsx:22-52`; `app/globals.css:33-38` and `:97-102` | cover palette entry for `pressroom` using existing tokens only; add `--pressroom: var(--accent)` in `:root` after L38 (`packages/ui/src/pillar-tag.tsx:24` builds `var(--${id})`) and optionally `--color-pressroom: var(--pressroom)` in the `@theme inline` block (L97-102). `[V-FIX]` the six pillar vars are defined ONLY in `:root` (L33-38); the `html[data-theme="dark"]` block (L53-68) has NO pillar overrides, so no dark entry is needed (`--accent` has its own light value at L20; `var(--accent)` resolves per element so it needs no dark override). No new color values |
| B5 | `components/header.tsx` desktop `pillars.map` ~L531-557, `NAV_EXTRA.map` ~L561; drawer `pillars.map` ~L745, `NAV_EXTRA.map` ~L773; layout `(reader)/layout.tsx:60-72` | filter slug `pressroom` out of `pillars.map` (both); render the gated NAV_EXTRA `pressroom` item only if CMS `pillars` contains slug `pressroom` (computed from the `pillars` prop, e.g. `pillarSlugs.has("pressroom")`); plain `/pressroom` path (no `[locale]` segment in dtw-web); optional padding rule against clip (BA `globals.css:809-818` reference), record as unmeasured otherwise |
| B6 | Article rendering: `components/article/article-content.tsx:~132-135` (breadcrumb), `:205-212` header author block (Avatar + name + `authorRole · authorCity`); `components/byline-wired.tsx:22-41` and `packages/ui/src/byline.tsx:48-50`. `[V-FIX]` `BylineWired` IS used outside the article page: `pillar-content.tsx:229` (the lead card of Pressroom's OWN pillar page, an in-scope surface), `home-hero.tsx:77` (lead; filtered but keep correct) and `deep-dive.tsx:71`, so `BylineWired` MUST learn `distributed` (extend its `article` prop type with `distributed?: boolean`; pass `labels.by = "Distributed by"` (t() triple) and author name "Opentechwire", coAuthors `[]`; `Byline` then renders "Distributed by Opentechwire · date · N min read" with no UI-package change needed; verify no stray double space) | when `article.distributed`: render "Distributed by" + bold "Opentechwire" (no Link/avatar/role/city/co-authors/"By"), then existing date/readMin line; else markup unchanged |
| B7 | `(reader)/article/[slug]/page.tsx` ~L86-88 (OG authors), ~L137-143 (getRelatedArticles(view.pillar)), ~L164-165 JSON-LD; `lib/metadata.ts:199-263` | OG `authors` only when not distributed; JSON-LD author = `{ "@type": "Organization", name: "Opentechwire" }` when distributed (add an `authorOrganization`/similar option to the metadata builder; Person path unchanged) |
| B8 | Card/row author strings (`[V-FIX]` re-grep `\.author\b|authorCity` confirms exactly these 8 sites; the `~180` and `~249` refs in the original text do NOT exist in dtw-web, they came from BA): `pillar/pillar-content.tsx:277`, `article/related-row.tsx:78`, `exclusive/exclusive-content.tsx:154`, `home/pillar-showcase.tsx:132`, `home/home-hero.tsx:137`, `home/exclusive-band.tsx:71`, `(reader)/search/page.tsx:287`, `home/most-read.tsx:147` (this one prints `authorCity`, not `author`) | replace inline "By X · time · read" with `cardByline(a)` so distributed articles show time + reading time only |
| B9 | Aggregates (D3): `(reader)/page.tsx:79` `getRecentArticles(40)`, `:80` `getPinnedLatest`, `:99-108` heroPool/lead/aside, `~84-96` per-pillar bands over `getNavPillars`, `~125-130` Latest band, `~150-160` most-read top-up; `lib/cms-client.central.ts:156-163`, `~439-449` getPinnedLatest, `~420-435` getArticlesAfter, `~490-507` getFeedArticles; `[V-FIX]` there is NO `(reader)/latest` route: `/latest` and `/latest/page/[n]` are the dynamic `[pillar]` route, so filter in `(reader)/[pillar]/pillar-view.tsx` (`feedPage.docs`, only when `slug === "latest"`, L51-76; the pinned lookup at L58 only ever runs for `latest`) and `[pillar]/load-more-action.ts:31` (only when `pillarSlug === "latest"`); the `/latest/rss.xml` firehose (`[pillar]/rss.xml/route.ts:31`, `getFeedArticles(null)`) is covered by filtering `getFeedArticles` when `pillarId == null` (Pressroom's own `/pressroom/rss.xml` passes a pillar id and stays unfiltered); `app/rss.xml/route.ts:14`; `lib/most-read.ts:40-95` (filters at `:88-90`); `account/[[...tab]]/page.tsx:43` | apply `filterOutSingleHome` to home pool/hero/aside/Latest band; skip the `pressroom` pillar in per-pillar bands; `getPinnedLatest`: fetch several (e.g. limit 5) and return first non-single-home (also used by `pillar-view.tsx:58`: for Pressroom's OWN pillar page keep behavior sensible, do not hide Pressroom articles on their own page); `/latest` + load-more + `getArticlesAfter`: filter after fetch (document short pages); `getFeedArticles` (root RSS) filtered; `most-read.ts` filter + homepage top-up filter; account follow list filters pillar `pressroom`. NOT touched: search, sitemap, llms.txt, tag pages, `pillar-view.tsx` main list, `/[pillar]/rss.xml` |
| B10 | `process/context/all-context.md` (dtw-web), `uxui/all-uxui.md` if it lists pillar rules | add invariant note: Pressroom single-home FE rules, constant duplicated with CMS; brand casing |

### Stream C: content-engine (`/home/user/content-engine`), OPTIONAL: n/a
- `admin/src/lib/hub-composer-draft.ts` ~L110-125 `HUB_COMPOSER_BLOCKED_PILLARS` lists only `gcv` and `brief-asia` (NOT wad); its comment says it mirrors CMS `ENGINE_BLOCKED_PILLARS` but the mirror is already incomplete. Per rule, do NOT add `dtw` (wad is not listed). Record as follow-up in the UPDATE PROCESS backlog note.
- `src/lib/publications/dtw/` has no `pressroom` (grep over `src/lib/publications/` matches only abb): engine cannot target it; CMS 422 is the backstop. No change, no test command.

## Public Contracts
- CMS engine intake: new 422 for `dtw` `pressroom` (gate 3b + single-home pre-check), create and refresh. Hub authoring: `blocked_pillar` for dtw pressroom. Admin/Console: rule errors for dtw pressroom. Public read API unchanged (author may be `null` for dtw pressroom).
- dtw-web: new route-visible nav link `/pressroom` (existing dynamic route); rendered byline/OG/JSON-LD for Pressroom articles; aggregates (home, `/latest`, root RSS, most-read, account follow) exclude Pressroom; `ArticleView` gains `distributed` (internal); `PillarId` widened.

## Blast Radius
- apcg-cms: 1 constants file, 3 test files, 1 probe, 2 docs, 3-4 context docs. Risk class: public API contract (engine 422) + editorial write rules. No schema/migration.
- dtw-web: ~2 new files, `package.json`, ~20 edited display/query files. Risk class: public rendering; no auth/billing/schema/migration.
- content-engine: none.
- Streams A and B are disjoint repos (parallel-safe); no shared files.

## Owner Runbook (read-only SQL; agents NEVER run it against production)
Run BEFORE the CMS deploy, tenant `dtw` (columns verified in the WAD plan against `src/migrations/20260702_231336_initial_schema.ts`; re-grep before publishing):
```sql
WITH t AS (SELECT id FROM tenants WHERE slug='dtw'),
p AS (SELECT id FROM pillars WHERE slug='pressroom' AND tenant_id=(SELECT id FROM t))
SELECT 'secondary_on_pressroom_article' k, count(*) FROM articles_secondary_sections s JOIN articles a ON a.id=s._parent_id WHERE a.pillar_id IN (SELECT id FROM p)
UNION ALL SELECT 'subsection_on_pressroom_article', count(*) FROM articles WHERE pillar_id IN (SELECT id FROM p) AND sub_section_id IS NOT NULL
UNION ALL SELECT 'exclusive_pressroom_article', count(*) FROM articles WHERE pillar_id IN (SELECT id FROM p) AND exclusive
UNION ALL SELECT 'pressroom_as_secondary_elsewhere (V3)', count(*) FROM articles_secondary_sections WHERE pillar_id IN (SELECT id FROM p)
UNION ALL SELECT 'subsections_under_pressroom', count(*) FROM subsections WHERE pillar_id IN (SELECT id FROM p);
```
(If the dtw `pressroom` row does not exist yet, all counts are 0; that is the expected state.)

Rollout order:
1. Deploy apcg-cms PR (rule active; harmless with no row). 2. Deploy dtw-web PR (nav link stays hidden until the row exists). 3. Owner creates the dtw `pressroom` pillar in /admin (slug exactly `pressroom`, tenant dtw). 4. Post-deploy checks (Agent-Probe, owner): nav link appears between Briefing and Awards (desktop + drawer) in en/vi/id; `/pressroom` renders; a Pressroom article shows "Distributed by Opentechwire" (page source: no OG `authors`, JSON-LD Organization); breadcrumb/tag say Pressroom (not Latest); Pressroom articles absent from home, `/latest`, `/rss.xml`, most-read, account follow list; present in search and `/pressroom/rss.xml`; ordinary articles unchanged; engine 422 for dtw pressroom (optional). Rollback: remove `dtw` entries in CMS + redeploy; revert dtw-web PR; hide by deleting/unpublishing the row (nav link auto-hides).

## Implementation Checklist
### Stream A (apcg-cms), execute agent records baselines FIRST (typecheck, lint warning count, test:single-home, test:media-redirect, test:hub-media, test:hub-live, test:hub-p56, test:hub-direct-upload, test:migrate-gtp, test:booths, test:migrate-network) before editing
- [ ] A0 Record baselines (do not assume numbers).
- [ ] A1 `constants.ts` both maps + comments.
- [ ] A2 `single-home-pillars.test.ts` flips + wtb control (reuse existing wtb fixture if present).
- [ ] A3 `single-home-pillar.test.ts` flips + fixtures.
- [ ] A4 `hub-taxonomy-blocks.test.ts:33` control -> `world-travel-brief`.
- [ ] A5 `single-home-probe.ts` `[DTW]` block placed so dtw has no pressroom ROW during MOVE checks.
- [ ] A6 `docs/08`, `docs/11` bullet + dtw violator SQL.
- [ ] A7 context docs with exact counts.
- [ ] A8 gates (Verification Evidence), then probe on throwaway native PG16 (`/usr/lib/postgresql/16/bin/initdb`, random localhost port, `db:seed` first, recipe in `process/context/tests/all-tests.md`; cluster in `/tmp`, `postgres` user cannot enter scratchpad); stop and delete cluster after. If PG16 is unavailable record probe as Known Gap (hook unit tests still cover AC1-3).
### Stream B (dtw-web), record baselines FIRST (`pnpm --filter web typecheck`, `lint` warning count, `test:exclusive`, `test:bot-detect`, `test:signup-guard`, build)
- [ ] B0 Record baselines.
- [ ] B1 `single-home-pillars.ts` + test + `test:single-home` script.
- [ ] B2 `PillarId`/icons/NAV_EXTRA; `asPillarId` + `distributed` + `cardByline`; fix all `ArticleView` literals.
- [ ] B3 i18n labels.
- [ ] B4 cover-art + `--pressroom` CSS vars (light + dark).
- [ ] B5 header: filter pillars + gated nav link (desktop + drawer).
- [ ] B6 article header byline; B7 OG + JSON-LD (+ metadata builder option).
- [ ] B8 card/row byline sites via `cardByline`.
- [ ] B9 aggregates: home, pinned Latest, per-pillar bands, `/latest` + load-more, root RSS, most-read, account follow.
- [ ] B10 context doc note.
- [ ] B11 gates; grep that every call site listed in B8/B9 was handled (`grep -rn "getRecentArticles\|getPinnedLatest\|getFeedArticles\|getArticlesAfter\|getArticlesPage" apps/web/src`).
### Stream C
- [ ] C1 n/a; record follow-up in UPDATE PROCESS backlog note.

## Verification Evidence
| Gate / Scenario | Strategy | Proves SPEC criterion |
|---|---|---|
| CMS `npm run typecheck` 0 errors | Fully-Automated | AC10 |
| CMS `npm run lint` warnings <= recorded baseline, 0 errors | Fully-Automated | AC10 |
| CMS `npm run test:single-home` 0 fail, count > baseline (covers `single-home-pillars.test.ts`, `single-home-pillar.test.ts`, local-db guard, gtp/vowasia/aer/agr/amb/abb taxonomy, central-db-name guard) | Fully-Automated | AC1, AC2, AC3 |
| CMS `npm run test:hub-direct-upload` (includes `hub-taxonomy-blocks.test.ts`) 0 fail | Fully-Automated | AC1 (control switch), AC10 |
| CMS `npm run test:media-redirect`, `test:hub-media`, `test:hub-live`, `test:hub-p56`, `test:booths`, `test:migrate-gtp`, `test:migrate-network` equal baselines, 0 fail | Fully-Automated | AC10 (shared constants, no collateral) |
| CMS `npm run probe:single-home` and `npm run probe:single-home -- --http` on disposable native PG16, all PASS, `[DTW]` block present | Hybrid (precondition: throwaway PG16 + local dev server) | AC1, AC2, AC4 |
| dtw-web `pnpm --filter web typecheck` 0 errors | Fully-Automated | AC6, AC7, AC9, AC10 |
| dtw-web `pnpm --filter web lint` warnings <= baseline, 0 errors | Fully-Automated | AC10 |
| dtw-web `pnpm --filter web test:single-home` 0 fail (incl. `asPillarId`-level logic if extracted import-free, filters, `isDistributedPillar`) | Fully-Automated | AC5, AC6, AC8 |
| dtw-web `pnpm --filter web test:exclusive`, `test:bot-detect`, `test:signup-guard` equal baselines | Fully-Automated | AC10 |
| dtw-web `rm -rf apps/web/.next && <placeholder env> pnpm --filter web build` exit 0 (env names from `apps/web/.env.example`: at least `NEXT_PUBLIC_SITE_URL`, `CMS_URL=http://127.0.0.1:1`, `CMS_READ_TOKEN=dummy`, plus any the build reports missing; if it cannot run offline, record Known Gap, rely on typecheck) | Hybrid | AC7, AC9, AC10 |
| Root `pnpm typecheck` and `pnpm lint` (turbo) | Fully-Automated | AC10 |
| Post-deploy owner probes: nav link gate (before/after row), Pressroom article byline/OG/JSON-LD, label not "Latest", absence from home/`/latest`/`/rss.xml`/most-read/follow list, presence in search + `/pressroom/rss.xml` | Agent-Probe (owner) | AC6, AC7, AC8, AC9 |
| Component render of byline/nav (no DOM test infra) | Known-Gap (backlog stub; gates AC7/AC9 stay CONDITIONAL until owner probe) | AC7, AC9 |

## Test Infra Improvement Notes
- dtw-web gains a fourth scoped `node:test` script (`test:single-home`); still no DOM/component test runner or Playwright, so JSX byline/nav rely on build + owner probe. Candidate backlog: add a render-test harness.
- Extract the `asPillarId` mapping and nav-gate predicate into import-free helpers where cheap so they are unit-testable.
- CMS probe order sensitivity (dtw must have no pressroom row during MOVE checks) deserves a comment in the probe.

## Resume and Execution Handoff
1. Plan: `/home/user/dtw-web/process/general-plans/active/otw-pressroom_04-11-26/otw-pressroom_PLAN_04-11-26.md`.
2. Last completed: PLAN (04-11-26). Next: VALIDATE (vc-validate-agent writes the contract below the Autonomous block), then EXECUTE (owner pre-approved skipping a separate plan review, D5).
3. Execution shape: Stream A and Stream B as two parallel opus execute agents (disjoint repos). Each records baselines before editing, runs its gates, writes exact new counts into context docs and an EVL section here. No commits/pushes by execute agents; the orchestrator commits on branch `claude/lucid-wright-df7sdd` (already checked out in both repos).
4. Hard stops (execute-agent instructions): never connect to a non-local DB or network service; never run the violator SQL; never create a dtw `pressroom` row anywhere except a disposable local cluster, and never in `scripts/seed.ts`; never open/quote `login.json` in apcg-cms; do not run `next build` in apcg-cms (if `src/app/(payload)/importMap.js` changes, `git checkout --` it); brand casing `Opentechwire` only; never rename `dtw`, `dtw_auth`, `dtw-media`; no new colors; do not touch `PILLARS` (6).
5. Context to read: dtw-web `process/context/all-context.md` (invariants 1-15), `uxui/all-uxui.md`, `tests/all-tests.md`; apcg-cms `process/context/integrations/all-integrations.md` §Single-home pillar rule, `tests/all-tests.md`; precedent plans `/home/user/apcg-cms/process/general-plans/active/wad-pressroom_20-10-26/` and `/home/user/dtw-web/process/general-plans/completed/otw-exclusive_20-10-26/`; BA reference `/home/user/brief-asia-web/process/general-plans/completed/pressroom-pillar_05-10-26/` + `src/lib/single-home-pillars.ts`, `src/lib/article-view.ts`.
6. Validator for this artifact: `node .claude/skills/vc-generate-plan/scripts/validate-plan-artifact.mjs /home/user/dtw-web/process/general-plans/active/otw-pressroom_04-11-26/otw-pressroom_PLAN_04-11-26.md` (from a repo that carries the skill).
7. UPDATE PROCESS backlog note (to write later): `process/general-plans/backlog/otw-pressroom-followups_NOTE_04-11-26.md` with: engine translation route ungated, engine 4xx of new dtw 422 unverified, `/latest` short pages, nav clip unmeasured, no render tests, `hub-composer-draft.ts` mirror incomplete (lists only gcv, brief-asia), credit English-only if so.

## Autonomous Goal Block
SESSION GOAL: Opentechwire Pressroom parity with BriefAsia/GCV/WAD (apcg-cms: dtw `pressroom` single-home + engine-blocked; dtw-web: Pressroom nav link gated on CMS row, `Distributed by Opentechwire` byline, hidden from home/latest/root RSS/most-read/follow, not mislabelled "latest")
Charter + umbrella plan: N/A - single plan (this file)
Autonomy: owner pre-approved validate -> execute (D5). Execute agents run Stream A (apcg-cms) and Stream B (dtw-web) in parallel (disjoint repos), opus; no commits/pushes.
Hard stops: never connect to a non-local DB or network service; never run the violator SQL; never create a dtw `pressroom` row except on a disposable local PG16 (never in scripts/seed.ts); never open/quote `login.json` in apcg-cms; no `next build` in apcg-cms (git checkout -- importMap.js if touched); brand casing `Opentechwire` only; never rename `dtw`, `dtw_auth`, `dtw-media`; no new colors; do not add `pressroom` to `PILLARS` (stays 6); no migration; Stream C is n/a.
Next phase: EXECUTE: /home/user/dtw-web/process/general-plans/active/otw-pressroom_04-11-26/otw-pressroom_PLAN_04-11-26.md
Validate contract: inline in this plan (Gate: PASS with named known gaps)
Execute start: Stream A gates (typecheck, lint, test:single-home, scoped suites, probe on throwaway PG16) | Stream B gates (typecheck, lint, test:single-home, build with dummy env, optional mock-Central probe) | high-risk pack: no (public contract change is one engine 422, owner-accepted)

## Validate Contract

Status: PASS
Date: 04-11-26
date: 2026-11-04
generated-by: outer-pvl

Parallel strategy: parallel-subagents (2 opus execute agents, Stream A in apcg-cms and Stream B in dtw-web)
Rationale: signals S1 (2 repos), S6 (public engine contract 422), S7 (5+ files each) = 3/7 MEDIUM; the two streams are disjoint repos with no shared file and need no mid-run communication, so an agent team adds cost with no benefit; sequential is also valid (about 2x wall time) if the orchestrator prefers one at a time. Model: opus for both execute agents, sonnet for the EVL vc-tester spawns.
Estimated agents: execute 2 + EVL tester 2 (one per repo) + up to 2 fix cycles x 2 = 4-8 total; cost guard not triggered.

### Baselines recorded by VALIDATE on 04-11-26 (read-only runs, branch `claude/lucid-wright-df7sdd` in dtw-web, `main` in apcg-cms; execute agents MUST re-record their own at A0/B0)
apcg-cms: `npm run typecheck` 0 errors (17 s); `npm run lint` 20 warnings / 0 errors; `test:single-home` 355 pass / 0 fail (10 files); `test:hub-direct-upload` 84 / 0; `test:media-redirect` 175 / 0; `test:hub-media` 113 / 0; `test:hub-live` 27 / 0; `test:hub-p56` 127 / 0; `test:booths` 9 / 0; `test:migrate-gtp` 84 / 0; `test:migrate-network` 38 / 0.
dtw-web: `pnpm --filter web typecheck` 0 errors (13 s); `pnpm --filter web lint` 1 warning (article-body.tsx:78 unused eslint-disable) / 0 errors; `test:exclusive` 9 / 0; `test:bot-detect` 31 / 0; `test:signup-guard` 6 / 0; offline build exit 0 in 67 s with the env below (route table printed, `/pressroom` served by the dynamic `[pillar]` route).

Test gates (C3 table; strategy column carries only the 3 proving strategies):

| criterion id | behavior | strategy | proving test | gap-resolution |
|---|---|---|---|---|
| AC1 | CMS rejects V1-V6, rename, tenant move, in-use delete for `(dtw, pressroom)`; control `(world-travel-brief, pressroom)` unaffected | Fully-Automated | `npm run test:single-home` (apcg-cms; > 355, 0 fail) | B (new dtw cases added by this plan) |
| AC2 | Authorless dtw pressroom saves; authorless dtw ordinary (`ai`) rejected; wtb pressroom still requires author | Fully-Automated | same suite, `src/hooks/single-home-pillar.test.ts` author cases with new fixtures `{id:21 dtw pressroom}`, `{id:22 dtw ai}`, tenant `{id:7 dtw}` | B |
| AC3 | Engine intake 422 for dtw pressroom (create + refresh, ` PRESSROOM ` too) | Fully-Automated | `isEngineBlockedPillar("dtw","pressroom"|" PRESSROOM ")` + `checkIntakeSingleHome("dtw", ...)` V1/V2/V3 in `src/lib/single-home-pillars.test.ts`; `hub-taxonomy-blocks.test.ts` dtw `[true]` via `npm run test:hub-direct-upload` (> 84) | B |
| AC4 | Real Payload hooks enforce the rule for dtw | Hybrid | `npm run probe:single-home` (> 76 PASS on fresh seed; `[DTW]` section present) and `npm run probe:single-home -- --http` (> 86 PASS) on throwaway native PG16 + `next dev -p 3511` (webpack); precondition: PG16 at `/usr/lib/postgresql/16/bin`, `db:seed` first | A (proven now when run) |
| AC5 | `isSingleHomePillar`/`isDistributedPillar`/filters/`firstNonSingleHome` exact-slug and null-safe | Fully-Automated | `pnpm --filter web test:single-home` (new script, `src/lib/single-home-pillars.test.ts`, 0 fail) | B |
| AC6 | Pressroom article labelled Pressroom, not "latest" or empty | Fully-Automated | extracted import-free helpers unit-tested (`asPillarId`-level mapping `pressroom` -> `pressroom`, `localizedPillarLabel("pressroom", en|vi|id)` non-empty) inside `test:single-home` (if extraction is not cheap, covered by typecheck + mock probe) | B |
| AC6/AC7/AC8/AC9 render | Pressroom page, nav link gate, byline, absence from home/latest/RSS | Hybrid | `pnpm --filter web typecheck` + offline `build` (env below) + RECOMMENDED mock-Central runtime probe per `process/context/tests/all-tests.md` "Runtime Probe Pattern (mock Central)" (curl `/`, `/latest`, `/pressroom`, `/article/<pressroom-slug>`, `/rss.xml`, `/pressroom/rss.xml`; precondition: throwaway mock server in the scratchpad, never committed) | A for typecheck/build; D for owner probes |
| AC7/AC8/AC9 prod | Same behaviors on production data | Agent-Probe | owner post-deploy probes listed in Owner Runbook step 4 | D (post-deploy, owner) |
| AC10 | No regression vs baselines | Fully-Automated | all scoped suites above equal/greater than baseline, 0 fail; lint warnings <= 20 (CMS) and <= 1 (dtw-web), 0 errors; root `pnpm typecheck` | A |

Failing stubs (Fully-Automated rows, red-first; copy scenario text verbatim):
- AC1: `test("should reject V1/V2/V3/V6, rename, move and in-use delete for (dtw, pressroom)", () => { throw new Error("NOT IMPLEMENTED - TDD stub: dtw pressroom single-home") })`
- AC2: `test("should save an authorless dtw pressroom article and reject an authorless dtw ai article", () => { throw new Error("NOT IMPLEMENTED - TDD stub: dtw optional author") })`
- AC3: `test("should block engine writes to dtw pressroom incl. ' PRESSROOM ' and keep world-travel-brief unblocked", () => { throw new Error("NOT IMPLEMENTED - TDD stub: dtw engine block") })`
- AC5: `test("should treat exactly 'pressroom' as single-home and filter it from aggregates", () => { throw new Error("NOT IMPLEMENTED - TDD stub: dtw-web single-home helpers") })`
- AC6: `test("should label a pressroom article Pressroom in en/vi/id and never fall back to latest", () => { throw new Error("NOT IMPLEMENTED - TDD stub: pressroom label") })`

Legacy line form (retained so existing consumers still parse):
- apcg-cms constants + tests: [Fully-automated: `npm run test:single-home` + `npm run test:hub-direct-upload`] | [hybrid: `npm run probe:single-home` and `-- --http` on throwaway PG16] | [known-gap: none]
- dtw-web helpers: [Fully-automated: `pnpm --filter web test:single-home`] | [hybrid: typecheck + offline build + mock-Central probe] | [agent-probe: owner post-deploy]
- dtw-web JSX byline/nav render: [hybrid: build + mock probe] | [agent-probe: owner] | [known-gap: no component/DOM test runner]

Dimension findings:
- Infra fit: PASS - no migration, no new dependency, no new env var; native PG16 present at `/usr/lib/postgresql/16/bin/initdb`; offline dtw-web build runs green (67 s) with the env below.
- Test coverage: CONCERN (accepted, owner pre-accepted) - dtw-web has no DOM/component test runner so byline/nav JSX is proven by typecheck + build + (recommended) mock-Central probe + owner post-deploy probe; nav clip at 901-1180 px unmeasured. Not vacuous: every developed behavior has a Fully-Automated or Hybrid gate; only the pixel/DOM residual is named.
- Breaking changes: CONCERN (accepted) - public engine intake gains a 422 for dtw `pressroom` (create and refresh); `/api/hub/taxonomy` now reports `blocked:true` for dtw `pressroom` and hub authoring returns `blocked_pillar` for it (via `hub-author-refs.ts`, generic); `/api/public` read API does NOT import either map (grep-verified: consumers are engine intake route, hub taxonomy route, hub-author-refs, Pillars collection, row guard, Articles hook, console actions), so public reads are unchanged. Engine 4xx handling of the new dtw 422 is unverified (dtw engine never targets pressroom; `src/lib/publications/dtw` has no pressroom).
- Security surface: PASS - no auth/secret/billing/schema change; only a deny-list entry; `login.json` untouched; no production DB access is part of any gate.
- Stream A feasibility (apcg-cms): PASS after plan fixes - constants L84-90/L137-143 confirmed; `docs/08` L67-68 and `docs/11` WAD bullet at L103 confirmed; no `dtw` pillar expectation exists in any CMS single-home test or the probe, so A2/A3 are ADD-not-flip (fixed in plan, `[V-FIX]`); probe DTW MOVE target constraint resolved (see instructions); highest-risk edit = probe ordering.
- Stream B feasibility (dtw-web): PASS after plan fixes - touchpoints confirmed except those corrected: no `(reader)/latest` route (it is the `[pillar]` dynamic route), `BylineWired` is used on Pressroom's own pillar page and home hero/deep-dive (must be changed), `localizedPillarLabel` returns an empty string for ids absent from `PILLARS` (would blank every Pressroom label), 3 `Record<PillarId,...>` maps (`PILLAR_ICONS`, `PILLAR_I18N`, `ART_PALETTES`) break typecheck until a `pressroom` key is added, `NAV_EXTRA` has only two consumers (header desktop L561, drawer L773) plus `localizedNavLabel`; highest-risk edit = `localizedPillarLabel` + `asPillarId` widening (silent empty/"latest" labels).

Plan updates applied by VALIDATE (all marked `[V-FIX]` in the Touchpoints tables): A2, A3, A4, A5 probe ordering + MOVE target, B2 (single literal; 3 Record maps), B3 (`localizedPillarLabel` mandatory), B4 (no dark pillar block), B6 (`BylineWired` in scope), B8 (exact 8 sites), B9 (`/latest` via `[pillar]`).

Execute-agent instructions:
- E1 (A+B) Hard stops in the Autonomous Goal Block apply. Re-grep every file:line before editing and justify drift in the EVL section; the line numbers above were re-verified on 04-11-26.
- E2 (A) `dtw` pressroom ROW exists only inside the probe's `[DTW]` block, created after the `[E-pillar]` move-into-dtw check at L308 and before `[G87]`; MOVE-out check = `move dtw pressroom into brief-asia (PATCH {tenant})` placed inside the `if (ownPressroom)` branch beside L360 (brief-asia pressroom row already deleted there); if the BA row pre-existed that check is SKIPPED and must be listed as skipped in the report. Do not seed a dtw pressroom row in `scripts/seed.ts`.
- E3 (A) Update the doc/comment wording in `constants.ts` (header block above `ENGINE_BLOCKED_PILLARS` and the SINGLE_HOME paragraph) and in `scripts/single-home-probe.ts` header; after editing grep `dtw` in the three test files and the probe and justify remaining hits (tenant-move targets, fixtures).
- E4 (A) Probe recipe: throwaway cluster via `runuser -u postgres -- /usr/lib/postgresql/16/bin/initdb` in `/tmp` (the `postgres` user cannot enter the scratchpad), random localhost port, `npm run db:seed`, then `npm run probe:single-home`, then `-- --http` with `next dev -p 3511` (webpack, own process group, kill with `kill -- -<PGID>`); stop and delete the cluster after. Do NOT run `next build`; if `src/app/(payload)/importMap.js` changes, `git checkout --` it. If PG16 unusable: record the probe as Known-Gap (hook unit tests still cover AC1-AC3) and say so.
- E5 (A) Record exact new counts (test:single-home, test:hub-direct-upload, probe PASS totals) into `process/context/tests/all-tests.md` and the EVL section; update `all-context.md`, `integrations/all-integrations.md` (Single-home pillar rule, the negative-control sentence at ~L755), and `database/all-database.md` only if it lists the tenants.
- E6 (B) `PillarId` widening: add `pressroom` to ALL THREE `Record<PillarId,...>` maps (`PILLAR_ICONS` data.ts:102, `PILLAR_I18N` i18n.tsx:83, `ART_PALETTES` cover-art.tsx:22); `PILLARS` stays 6 entries. `localizedPillarLabel` must special-case `pressroom` (static en/vi/id) so breadcrumb and all 12 `PillarTag` sites are non-empty.
- E7 (B) `BylineWired`: add optional `distributed` to its `article` prop type and render "Distributed by" + "Opentechwire" for distributed items (callers pass the `ArticleView`; `pillar-content.tsx:229`, `home-hero.tsx:77`, `deep-dive.tsx:71`). `toArticleView` is the single `ArticleView` builder: set `distributed`, `author: "Opentechwire"`, `authorCity/Role: ""`, `coAuthors: []`. Brand casing `Opentechwire` exactly.
- E8 (B) Filtering levels: views (`ArticleView`) by `pillar === "pressroom"` after `asPillarId`; raw CMS docs (`getFeedArticles`, `most-read.ts`, `getPinnedLatest`, `pillar-view`/`load-more-action` for `latest`) by populated `doc.pillar.slug` (a bare-id pillar cannot be classified: keep it). Pressroom's own `/pressroom` page, its `/pressroom/rss.xml`, search, sitemap, llms.txt and tag pages stay unfiltered. Account follow list: drop slug `pressroom` from `navPillars` before `AccountFollowing`. Home per-pillar band: skip `pressroom` (do not fetch it).
- E9 (B) Header: filter `pressroom` out of both `pillars.map` (desktop L531, drawer L745); render the gated NAV_EXTRA item only when the `pillars` prop contains slug `pressroom`; item sits between `briefing` and `awards`; href `/pressroom` (no locale segment in dtw-web); add `pressroom` to `NAV_I18N` / `localizedNavLabel` (en Pressroom, vi Phòng báo chí, id Ruang Pers).
- E10 (B) Build gate env (verified working 04-11-26): `rm -rf apps/web/.next && NEXT_PUBLIC_SITE_URL=http://localhost:3000 CMS_URL=http://127.0.0.1:1 CMS_READ_TOKEN=dummy REVALIDATE_SECRET=dummy DATABASE_URL=postgresql://u:p@127.0.0.1:1/db BETTER_AUTH_SECRET=dummysecretdummysecretdummysecret12 BETTER_AUTH_URL=http://localhost:3000 pnpm --filter web build` (run from the repo root; `DATABASE_URL` is required because `packages/db/src/client.ts:20-23` throws without it; the CMS being unreachable is fine, `central-api` never throws). Delete `apps/web/.next` afterwards (gitignored).
- E11 (B) Recommended Hybrid probe: stand up the mock Central from the scratchpad (see all-tests.md pattern; re-read `cms-client.central.ts` first so the mock answers what it calls) with one `pressroom` pillar row, one Pressroom article and ordinary articles; curl-check that the nav link is present only when the mock serves the `pressroom` pillar, `/pressroom` renders, the Pressroom article page shows "Distributed by Opentechwire" with no OG `authors` and a JSON-LD Organization author, and that `/`, `/latest`, `/rss.xml` exclude it while `/pressroom/rss.xml` and search keep it. Never commit the mock.
- E12 (B) New files: `apps/web/src/lib/single-home-pillars.ts` (import-free) + `.test.ts` (`node:test`, like `exclusive.test.ts`) and the `test:single-home` script in `apps/web/package.json`; add dtw-web context notes (B10) with exact counts.
- E13 (A+B) No commits, no pushes; the orchestrator commits on `claude/lucid-wright-df7sdd`. NOTE: that branch is checked out in dtw-web only; apcg-cms is currently on `main` (the plan said "both repos"), so the orchestrator must create or switch to the branch in apcg-cms before committing. Execute agents do not touch git state.

Test gates (exact, in order):
- Stream A (cwd `/home/user/apcg-cms`): `npm run typecheck` (0 errors); `npm run lint` (<= 20 warnings, 0 errors); `npm run test:single-home` (> 355, 0 fail); `npm run test:hub-direct-upload` (> 84, 0 fail); `npm run test:media-redirect` (175); `npm run test:hub-media` (113); `npm run test:hub-live` (27); `npm run test:hub-p56` (127); `npm run test:booths` (9); `npm run test:migrate-gtp` (84); `npm run test:migrate-network` (38); then `npm run probe:single-home` and `npm run probe:single-home -- --http` on the throwaway PG16 (all PASS, `[DTW]` block present, totals > 76 and > 86).
- Stream B (cwd `/home/user/dtw-web`): `pnpm --filter web typecheck` (0 errors); `pnpm --filter web lint` (<= 1 warning, 0 errors); `pnpm --filter web test:single-home` (new, 0 fail); `pnpm --filter web test:exclusive` (9), `test:bot-detect` (31), `test:signup-guard` (6); build per E10 (exit 0); root `pnpm typecheck`; grep `getRecentArticles\|getPinnedLatest\|getFeedArticles\|getArticlesAfter\|getArticlesPage` in `apps/web/src` and confirm each caller is either filtered or deliberately unfiltered (health route `api/health/cms`, `sitemap.ts`, `[pillar]` own-pillar paths).

Open gaps (accepted known gaps, backlog stub `process/general-plans/backlog/otw-pressroom-followups_NOTE_04-11-26.md` at UPDATE PROCESS; each is `known-gap: documented`, not NEW PLAN REQUIRED):
- dtw-web has no component/DOM test runner: byline/nav JSX proven by typecheck + build (+ mock probe) + owner post-deploy probe (gap-resolution D).
- Nav clip at 901-1180 px (desktop row height 46 + `overflow:hidden`, one more link) unmeasured; optional padding rule like BA `globals.css:809-818`.
- Engine 4xx handling of the new dtw 422 unverified; engine `translation` route left ungated (owner decision, as BA/WAD).
- `/latest` load-more and pages may return fewer than a full page of cards when Pressroom items fall in the window; `totalDocs` badge on `/latest` still counts Pressroom articles (accepted).
- `hub-composer-draft.ts` mirror in content-engine lists only gcv and brief-asia (Stream C n/a); credit label is English-only unless the `t()` triple is added; a deep-dive-flagged Pressroom article could appear in the home Deep Dive band (CMS does not block `deepDive` for Pressroom; not in D3 scope, record as follow-up); a Pressroom article with an author assigned in CMS would show that author in `/pressroom/rss.xml` entries (feed author is the CMS author when present).
- Owner steps not provable by agents: violator SQL (tenant `dtw`, run BEFORE CMS deploy), CMS deploy, dtw-web deploy, creating the dtw `pressroom` row, post-deploy probes.

What this coverage does NOT prove:
- AC1-AC3 unit gates do not prove Payload's real hook wiring (that is the probe), nor existing production violators (owner SQL), nor the engine's handling of the 422.
- The probe proves rules on a disposable seeded DB with synthetic data, not production rows, tenant ids or the live Central deployment.
- AC5/AC6 helper tests do not prove JSX wiring: that every call site actually uses the helper (grep + build + mock probe + owner probe cover it), nor responsive layout, dark mode appearance, or the nav clip.
- Typecheck/build prove types and routes compile, not that Pressroom is absent from `/latest` pages 2+ or that ISR caches (`unstable_cache`, 60-300 s) serve the new filtering after deploy.
- The mock-Central probe proves rendering and routing against a hand-written mock, not real Central data shapes, the revalidation webhook, or production ISR.
- Nothing here proves search/sitemap/llms/tag behavior for Pressroom (deliberately unchanged) or that unknown future single-home slugs are handled.

Gate: PASS (no FAILs; every CONCERN found by VALIDATE was fixed in the plan text; the remaining items are owner-pre-accepted known gaps listed above)
Accepted by: owner (session 04-11-26, D5 "execute straight after validate"; known gaps pre-accepted: no render tests, nav clip unmeasured, owner post-deploy probes) - accepted concerns by name: Test coverage (no DOM runner / nav clip), Breaking changes (new dtw engine 422, hub `blocked_pillar`/`blocked:true`, unverified engine 4xx handling).

Next instruction: `ENTER EXECUTE MODE` for this plan path (Stream A and Stream B as two parallel opus execute agents; EVL = spawned vc-tester per repo re-running the gate commands above).
