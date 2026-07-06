# Phase 2 — Account Data Layer

**Date**: 03-07-26
**Complexity**: Complex — Phase 2 of 5 in the Reader Auth, Account & Paywall phase program (see umbrella plan). This file alone is a self-contained, execute-ready spec for Phase 2's scope only.
**Status**: ⏳ PLANNED

**Execute anchor:** This file is the primary execute anchor for Phase 2 — the one plan file a
future `vc-execute-agent` pass should be handed for this phase's implementation work. There are
no supporting phase files for Phase 2; everything needed to execute this phase lives in this
single document plus the umbrella plan and the cited research artifact below.

**Program:** Reader Auth, Account & Paywall (5-phase program) — see the umbrella plan for
program-wide acceptance criteria, architecture decisions (AD-1..AD-8), global conventions, and
program-wide risks. This file is the execute-ready spec for Phase 2 only. It does **not**
relitigate anything the umbrella locked; where this plan adds detail the umbrella left open
(e.g. `session.ts`'s exact `requireUser()` shape), that is flagged explicitly as a Phase 2
grounding finding, not a deviation from AD-1..AD-8.

**Umbrella plan:** `process/features/account/active/reader-auth-account_UMBRELLA-PLAN_03-07-26.md`
**Reference research (primary, durable):** `process/features/account/references/brief-asia-port-map_REFERENCE_03-07-26.md` (contains the same `synthesis` + `research.briefUsers` + `research.briefReading` + `research.dtwState` content). **Original source (secondary):** `/tmp/claude-1000/-home-hieunc-Code-dtw-web/df9bb8b7-b07b-40a7-9091-a7506dd1880f/scratchpad/research-port-map.json` — this scratchpad file is **not guaranteed to survive**; if both it and the durable reference doc are unavailable at Phase 2 kickoff, re-run the RESEARCH step before executing rather than trusting only this plan's citations.

---

## Overview

This phase wires dtw-web's polished-but-fake `/account` page and article Save button to real,
server-persisted data for the first time: saved articles (bookmarks), reading history, and pillar
follows all move from client-side mock fixtures (`apps/web/src/lib/data.ts`'s `ARTICLES`) and
in-memory state to Postgres rows behind `@dtw/db`. It is the first production (non-Better-Auth-
adapter) runtime use of `@dtw/db` in `apps/web/src`, and it converts `/account` from a client
component gated on a fake in-memory user to a real `force-dynamic` server component gated on a
real Better-Auth session (built in Phase 1). It does not touch the paywall meter, settings, the
read-later queue, or newsletters — those are Phases 3, 4, and 5 respectively.

---

## Objective

Bookmarks, reading history, and pillar follows persist server-side and drive a real `/account`
page. Concretely, after this phase:

- A signed-in reader can save/unsave an article from the article page and see it in `/account`'s Saved tab, persisted in Postgres.
- A signed-in reader's reading history is recorded (deduped per article, upsert semantics) and visible/clearable in the History tab.
- A signed-in reader can follow/unfollow a CMS pillar (not a hardcoded list) and see it in the Following tab.
- A guest visiting `/account` sees an inline sign-in prompt (no redirect, no 401) and a guest clicking Save sees the auth modal open instead of an error.
- None of this data leaks into the article page's shared 60-second ISR cache (verified finding below — see [Architecture Finding: ISR Safety](#architecture-finding-isr-safety-verified-against-real-code)).

---

## Dependencies

- **Phase 1 — Auth Foundation** must be `✅ VERIFIED` before this plan is executed. Phase 1's plan file: `process/features/account/active/phase-01-auth-foundation_PLAN_03-07-26.md` (this file now exists in `active/` alongside all other phase plans, but Phase 1 itself has not been executed/verified as of this writing — re-confirm its status via the Phase Status Table in the umbrella plan before proceeding). Phase 2 specifically needs, from Phase 1:
  - `apps/web/src/lib/session.ts` exporting `getSessionUser()` (returns `{id, name, email, role} | null`) and a `requireUser()` guard usable from server actions.
  - A real Better-Auth session (`useSession()`/`useShell().user`) so `useShell().user` is truthy for a signed-in reader and `openAuth()` opens a real auth modal for guests.
  - `auth_users.id` rows to reference as `bookmarks.userId` / `reading_history.userId` / `follows.userId` FK targets.
- **Do not execute this plan** if Phase 1 is not `✅ VERIFIED` per the Phase Status Rules in `process/development-protocols/phase-programs.md`. If Phase 1 is only `🔨 CODE DONE`, stop and flag it — Phase 2's manual gates below assume a real, tested session exists.
- No other phase blocks Phase 2. Phases 3, 4, and 5 all depend on Phase 2 in turn (see umbrella's Phase Status Table) — do not start any of those before this phase reaches `✅ VERIFIED`.

---

## Grounding & Verification Method (Phase 2-specific)

This plan was written after reading `process/context/all-context.md` (root router) per the
repo's context-routing discipline, then `process/context/planning/all-planning.md` for plan-shape
calibration, then rereading the umbrella plan's Phase 2 section (lines 382–436) in full, and
independently re-verifying every cited file against the real filesystem during this PLAN pass
(not copied from the umbrella without re-checking). `process/context/tests/all-tests.md` was also
consulted (per the umbrella's own Grounding section, which confirmed no test runner is installed
yet — `vitest` absent from every `package.json`, zero `*.test.ts*` files anywhere in the repo, a
fact re-confirmed as still true by this PLAN pass finding no new test infra). Validation Gates
below are therefore typecheck/lint/build plus manual/DB verification, not automated test suites,
same as every other phase in this program — a known, tracked gap, not something this phase is
expected to close.

- Read `packages/db/src/schema/account.ts` in full (122 lines) — confirmed exact column names/types for `bookmarks`, `readingHistory`, `follows` (all FK'd `onDelete: cascade` to `auth_users.id` via `packages/db/src/schema/auth.ts`'s `users` export).
- Read `packages/db/src/client.ts` in full — confirmed it throws at import time without `DATABASE_URL` (no `server-only` import inside the file itself; the guard convention is "importing modules add `import "server-only"`", not the client file itself).
- Read `/home/hieunc/Code/brief-asia-web/src/lib/account-actions.ts` in full (195 lines) and `/home/hieunc/Code/brief-asia-web/src/lib/account.ts` in full (61 lines) — the exact source this phase ports from.
- Read `/home/hieunc/Code/brief-asia-web/src/lib/payload-server.ts`'s `getArticlesByIds` (lines 1001–1014) — the exact source this phase ports for article hydration.
- Read the **current** (as of this PLAN pass) `apps/web/src/app/(reader)/account/[[...tab]]/page.tsx` in full (466 lines) — confirmed it is `"use client"`, gated on `useShell().user`, and every tab (`AccountSaved`, `AccountHistory`, `AccountFollowing`, `AccountNewsletters`, `AccountSettings`) renders from `apps/web/src/lib/data.ts` fixtures (`ARTICLES`, `NEWSLETTERS`, `PILLARS`) or local `useState`. This is the exact shape Phase 2 must convert.
- Read `apps/web/src/components/article/article-content.tsx` in full (259 lines) and `apps/web/src/components/article/share-bar.tsx` in full (61 lines) — **verified finding, corrects the umbrella's touchpoint table**: the Save button is **not** inline in `article-content.tsx`. It lives in a separate `<ShareBar />` component (`apps/web/src/components/article/share-bar.tsx`), rendered by `article-content.tsx` only when `!hitPaywall` (line 182: `{!hitPaywall && <ShareBar />}`). `ShareBar` currently takes no props and holds a local, non-persisted `useState<boolean>("saved")`. See the exact touchpoint table below — this plan wires `ShareBar`, not a nonexistent Save button inside `article-content.tsx` directly.
- Read `apps/web/src/app/(reader)/article/[slug]/page.tsx` in full — **verified finding, load-bearing**: `export const revalidate = 60;` is set on this RSC. It calls `getArticleBySlug` (an `unstable_cache`'d Payload read) and passes the result to `<ArticleContent>`. It contains **no** session/cookie read today. See [Architecture Finding: ISR Safety](#architecture-finding-isr-safety-verified-against-real-code) below for how this phase must keep it that way.
- Read `apps/web/src/lib/payload-server.ts`'s header comment, cache-tag convention block, and `getPinnedLatest` (lines 311–338) — confirmed the exact fail-open try/catch/`console.warn`/return-safe-default pattern this phase's `getArticlesByIds` should be prepared to use if needed (see [Blockers](#blockers-that-would-justify--blocked)), and confirmed `articles:all` is the correct cache tag to share (`getArticleBySlug` already uses it).
- Read `apps/web/src/lib/article-view.ts` in full — confirmed `ArticleView.id` is `String(a.id)` (Payload's `Article.id` is `number`, confirmed in `apps/web/src/payload/payload-types.ts` line 314: `id: number;`). This is the exact `String(articleId)` coercion convention this phase's `bookmarks.articleId`/`reading_history.articleId`/text columns must follow, consistent with the umbrella's AD-7 grounding note.
- Read `apps/web/src/app/(reader)/layout.tsx` in full — confirmed provider order (`I18nProvider > ThemeProvider > ShellProvider > Header/main/Footer/AuthModal/SearchOverlay/CookieBanner`) and that `getNavPillars()` is already fetched here and passed to `<Header pillars={pillars}>`. This phase's Following tab must reuse `getNavPillars()` from `apps/web/src/lib/payload-server.ts`, not re-fetch pillars a second way.
- Read `apps/web/src/lib/data.ts`'s type/const declarations (`PillarId` 6-value union, `NavPillar` interface with `slug: string` — deliberately a plain string so a new CMS pillar needs no code change per invariant #8) — confirmed the current `AccountFollowing` tab's `Set<PillarId>` local state is exactly the hardcoded pattern this phase must replace with `NavPillar.slug`-keyed state sourced from `getNavPillars()`.
- Read `apps/web/src/lib/shell.tsx` in full (91 lines) — confirmed the **current** (pre-Phase-1) shape (`user`/`setUser` in-memory, `articlesRead`/`incrementRead` in-memory ref-Set). Phase 2 does not touch this file; Phase 1 is expected to have already replaced `user`/`setUser` with a real session bridge by the time Phase 2 executes — **Resume and Execution Handoff below requires re-reading this file's actual post-Phase-1 shape before executing**, since this plan cannot see Phase 1's real diff yet.
- Confirmed root `package.json` scripts: `pnpm typecheck` → `turbo typecheck` (→ `tsc --noEmit` per app), `pnpm lint` → `turbo lint`, `pnpm build` → `turbo build`. These are the exact commands for this plan's Validation Gates.
- Confirmed `Article.id: number` in `apps/web/src/payload/payload-types.ts` (line 314) — grounds the `String(articleId)` coercion requirement precisely, not just by analogy to brief-asia.

---

## Architecture Finding: ISR Safety (verified against real code)

The umbrella plan's Global Convention #8 states per-user state must never be read inside a
cached RSC. This plan verified the exact mechanism by which Phase 2 satisfies that constraint,
because it is easy to get wrong here specifically (Save button + recordView both live on the
article page, which **is** ISR-cached):

- `apps/web/src/app/(reader)/article/[slug]/page.tsx` has `export const revalidate = 60` and calls only `unstable_cache`'d, non-per-user Payload reads (`getArticleBySlug`, `getArticlesByPillar`). It renders `<ArticleContent article={view} body={...} related={...} />` — a **client** component (`"use client"` at the top of `article-content.tsx`).
- Because `ArticleContent`/`ShareBar` are client components, calling `'use server'` actions (`toggleBookmark`, `isBookmarked`, `recordView`) from a `useEffect` **inside them, after hydration**, does **not** touch the cached RSC render at all. The RSC output stays identical for every visitor (guest or signed-in) and stays on its 60s `revalidate` window. The server-action calls are per-request RPCs invoked client-side, exactly the brief-asia pattern (`article-content.tsx`'s `useEffect` calling `recordView`/`isBookmarked` client-side, confirmed in `research.briefReading.flows`).
- **Therefore**: this phase must NOT add any `getSessionUser()`, `cookies()`, or `@dtw/db` read to `apps/web/src/app/(reader)/article/[slug]/page.tsx` itself. The initial "is this article saved?" state and the `recordView` call are both determined **client-side**, via a `useEffect` in `article-content.tsx` that calls the new server actions — mirroring brief-asia's `useEffect (keyed on article.id + user?.email)` pattern exactly. This is the single most important invariant of this phase's `article-content.tsx`/`share-bar.tsx` touchpoint below; violating it (e.g. "just fetch `isBookmarked` in the RSC for convenience") would leak one user's saved-state into every other visitor's cached page.
- The `/account` page is a **separate, `force-dynamic` route** (this phase converts it to that explicitly) — it is the one place per-user reads are allowed to happen server-side, because it opts out of caching entirely.

---

## Phase Completion Rules

Restated from the umbrella plan's Phase Completion Rules (program-wide, applies to every phase
including this one) — a phase is NOT complete until:

1. **Integration Test** — works end-to-end with Phase 1's real session (not just in isolation).
2. **Manual Test** — a human (or an equivalent scripted flow) actually performs each Validation Gate below.
3. **Data Verification** — every DB claim below is confirmed by an actual query against real rows, not by code inspection or "the UI looked right."
4. **Error Handling** — the guest-gating, unpublished-article, and ISR-non-leakage cases below are handled gracefully, not just the happy save/history/follow path.
5. **User Confirmation** — the plan owner (user) explicitly confirms the phase works, not just that the executing agent believes it does.

This phase is `🔨 CODE DONE` once the touchpoints below compile and typecheck; it is only
`✅ VERIFIED` once all five items above are satisfied and recorded in the Durable Report Target.

---

## Acceptance Criteria

Testable, checkable criteria for this phase (the phase-level breakdown of the umbrella's
program-wide roll-up: "Saved articles, reading history, and pillar follows persist server-side
and survive a page reload / different device"):

- [ ] A signed-in reader can toggle Save on an article from the article page; the state persists across a page reload and across a different browser session for the same account (proves server persistence, not client-only state).
- [ ] A signed-in reader's `/account` Saved tab renders real, CMS-sourced article data (title, cover art, pillar) for their actual saved articles — not `apps/web/src/lib/data.ts` fixture data.
- [ ] Reading an article as a signed-in reader creates exactly one `reading_history` row per article, regardless of how many times that article is reloaded (dedupe proof, ties to AD-8 #5).
- [ ] The History tab lists real read articles, most-recent-first, and "Clear history" actually deletes the rows (not just hides them client-side).
- [ ] The Following tab's pillar list is sourced from the CMS (`getNavPillars()`), not a hardcoded array — adding/renaming a pillar in `/admin` changes the tab without a deploy.
- [ ] A guest visiting `/account` sees an inline sign-in prompt (HTTP 200, no redirect) with a working `openAuth()` CTA, not a broken/static message.
- [ ] A guest clicking Save on an article opens the auth modal instead of throwing or silently failing.
- [ ] No per-user save/read state leaks into another visitor's view of the same cached article page within the same 60-second ISR window.
- [ ] `pnpm typecheck`, `pnpm lint`, and `pnpm build` all pass clean with these changes in place.

---

## Implementation Checklist

Atomic, ordered steps for EXECUTE mode. Each step corresponds to a Touchpoint below with more
detail — this checklist is the flat, sequential view; the Touchpoints section is the full spec.

1. Read `packages/db/package.json`'s `exports` field to confirm the exact import specifiers for `@dtw/db` (schema) and `@dtw/db/client` (db instance) before writing any import (closes the flagged gap in Touchpoint 8).
2. Read the **current**, post-Phase-1 state of `apps/web/src/lib/session.ts` and `apps/web/src/lib/shell.tsx` to confirm what Phase 1 actually shipped (`getSessionUser`, `requireUser`, `roleAtLeast`, and the real `useShell().user`/`openAuth` shape) before writing code against assumed exports.
3. Create `apps/web/src/lib/account-actions.ts` (`"use server"`) with `toggleBookmark`, `removeBookmark`, `isBookmarked`, `recordView`, `clearHistory`, `toggleFollow` — per Touchpoint 1.
4. Extend `apps/web/src/lib/session.ts` with `listBookmarks`, `listHistory`, `listFollows` read helpers — per Touchpoint 2.
5. Extend `apps/web/src/lib/payload-server.ts` with `getArticlesByIds` — per Touchpoint 3.
6. Modify `apps/web/src/components/article/share-bar.tsx` to accept `articleId`, `saved`/`initialSaved`, `disabled`, and guest/`openAuth` props, replacing its local-only `useState` — per Touchpoint 6.
7. Modify `apps/web/src/components/article/article-content.tsx` to resolve `isBookmarked`/call `recordView` in a client `useEffect` and thread the new props into `<ShareBar />` — per Touchpoint 7.
8. Rewrite `apps/web/src/app/(reader)/account/[[...tab]]/page.tsx` as a `force-dynamic` server component: session gate, `Promise.all` list loads, `getArticlesByIds` hydration — per Touchpoint 4.
9. Add (or extract into) a small `"use client"` sign-in-prompt component wired to `useShell().openAuth` for the guest-gate branch of the account page — per Touchpoint 4.
10. Convert `AccountSaved`, `AccountHistory`, `AccountFollowing` into presentational components accepting real data as props, each with a small client-side mutation island (Remove / Clear history / Follow toggle) calling the new server actions plus `router.refresh()` — per Touchpoints 4 and 5.
11. Add a "Clear history" button to `AccountHistory` (does not exist in the current mock version) wired to `clearHistory()` — per Touchpoint 4.
12. Wire the Following tab's pillar source to `getNavPillars()` and `followedSlugs` from `listFollows`, replacing the hardcoded `Set<PillarId>` seed — per Touchpoint 5.
13. Leave `AccountNewsletters` and `AccountSettings` untouched internally (still fixture/static-fed) — verify only that the file-level `"use client"` removal doesn't break either (promote either to a small client sub-component only if strictly required to compile).
14. Run `pnpm typecheck`, `pnpm lint`, `pnpm build` at the repo root; fix any errors surfaced by the conversion.
15. Execute every manual Validation Gate below against a real local/staging DB, recording exact commands and query results.
16. Run the two Regression Checkpoints against Phase 1's login/logout and provider-boundary behavior.
17. Write the Durable Report Target with full evidence (see Verification Evidence below), update the umbrella plan's Phase Status Table row for Phase 2, and flag Phase 3/4/5 as now unblocked (Phase 2 dependency satisfied).

---

## Touchpoints

Scope for Phase 2 — exact files to create or modify, with what changes.

### 1. `apps/web/src/lib/account-actions.ts` (new, `"use server"`)

Port near-verbatim from `/home/hieunc/Code/brief-asia-web/src/lib/account-actions.ts`, narrowed
to the Phase 2 subset (no newsletter/captureEmail/article_views functions — those are Phase 5 and
explicitly-not-ported respectively, per AD-8 #5).

- File starts with `"use server";` then `import "server-only";` is **not** needed on a `"use server"` file (Next.js server actions are already server-only by construction — do not add a redundant `import "server-only"` here; reserve that convention for plain server-side library modules like `session.ts`/`payload-server.ts`, matching the existing codebase's actual pattern in `payload-server.ts`).
- Import `db` from `@dtw/db/client`, tables from `@dtw/db` (confirm the package's actual export surface at execution time — brief-asia imports `from "@/db/client"` and `from "@/db/schema/account"` because it has no package boundary; dtw-web's `@dtw/db` package needs its `client.ts` and `schema/account.ts` exports to be reachable via the package's `exports` map — verify `packages/db/package.json`'s `exports` field resolves both `@dtw/db` (schema) and `@dtw/db/client` before assuming the import paths below compile as written).
- Import `getSessionUser` from `@/lib/session` (Phase 1's module, per the umbrella's Phase 1 touchpoint table). **Grounding finding**: brief-asia's real `account-actions.ts` does **not** import a shared `requireUser()` — it defines a **local, private** `async function requireUser() { const user = await getSessionUser(); if (!user) throw new Error("Not authenticated"); return user; }` (verified in the file read above, lines 20–24). The umbrella's Phase 1 touchpoint table says `session.ts` should export `requireUser()` as a shared guard. **Resolution for Phase 2**: attempt to import `requireUser` from `@/lib/session` first (per the umbrella's intent); if Phase 1 kickoff research/execution did not actually add that export (re-verify at Phase 2 kickoff — do not assume), fall back to defining the same private local `requireUser()` wrapper shown above directly in `account-actions.ts`, matching brief-asia's actual proven shape. Either way the throw message must be `"Not authenticated"` (exact string, in case any UI ever matches on it) and every mutation below must call it as the first line.
- Functions to port, each gated by `requireUser()` except where noted:
  - `toggleBookmark(articleId: string): Promise<boolean>` — select-then-insert-or-delete on `bookmarks` keyed `(userId, articleId)`, matching brief-asia's exact select-check-then-mutate shape (not a single `onConflict` toggle — ported verbatim).
  - `removeBookmark(articleId: string): Promise<void>` — delete by `(userId, articleId)`.
  - `isBookmarked(articleId: string): Promise<boolean>` — **not** gated by `requireUser()` (brief-asia's version calls `getSessionUser()` directly and returns `false` for guests rather than throwing — port this exact guest-safe behavior, since `share-bar.tsx` will call this from a client effect that may run before a session exists).
  - `recordView(articleId: string): Promise<void>` — **not** gated by `requireUser()` either (brief-asia: `const user = await getSessionUser(); if (!user) return;` — silent no-op for guests, matching AD-8 #5's "guests are metered via cookie, not stored" note, and Phase 3's future cookie meter). Upsert into `reading_history` via `.onConflictDoUpdate({ target: [readingHistory.userId, readingHistory.articleId], set: { readAt: new Date() } })` — this is the exact dedupe mechanism that satisfies AD-8 #5 (one row per user+article, not one row per page-load).
  - `clearHistory(): Promise<void>` — `requireUser()`-gated, deletes all `reading_history` rows for `user.id`.
  - `toggleFollow(targetSlug: string): Promise<boolean>` — **deviates from brief-asia's signature**: brief-asia's version takes `(followType: "pillar" | "country", targetId: string)` because it has a country-follow concept. dtw's taxonomy has no country-follow (confirmed: `packages/db/src/schema/account.ts`'s `follows` table has a `pillarId` column with no `followType` discriminator column at all — dtw's schema is simpler than brief-asia's, already narrowed to pillar-only by the schema itself, not just by convention). Port the pillar-only logic: select-check-then-insert/delete on `(userId, pillarId)` where `pillarId` stores the CMS pillar's `slug` string (from `NavPillar.slug`, not the legacy 6-value `PillarId` union — any CMS pillar slug must be acceptable here, per invariant #8 and the Following-tab touchpoint below).
- Every article id argument is typed `string` and the call sites (below) are responsible for `String(article.id)` coercion before calling in — do **not** accept `number` and coerce inside `account-actions.ts` (matches `ArticleView.id`'s existing `string` typing throughout the codebase, avoids a second coercion point).
- Do **not** port `recordArticleView`/`article_views`, `captureEmail`, `subscribeGuest`, `setNewsletter`, `isSubscribed` in this phase — those are AD-8 #5 (deliberately omitted) and Phase 5 scope respectively. If a later Phase 5 execution extends this same file, that is expected (the umbrella's Phase 5 touchpoint table says so) — Phase 2 must not add stub/placeholder versions of them "for later," per the phase-locking discipline (only build what this phase's scope covers).

### 2. `apps/web/src/lib/session.ts` (extend, from Phase 1)

- Add three read helpers, ported from `/home/hieunc/Code/brief-asia-web/src/lib/account.ts` (lines 33–61):
  - `listBookmarks(userId: string)` — `db.select().from(bookmarks).where(eq(bookmarks.userId, userId)).orderBy(desc(bookmarks.savedAt))`.
  - `listHistory(userId: string)` — same shape, `orderBy(desc(readingHistory.readAt))`, `.limit(50)`.
  - `listFollows(userId: string)` — `db.select().from(follows).where(eq(follows.userId, userId))`.
- These are plain (non-`"use server"`) exported functions returning Drizzle query builders/promises — called only from the `force-dynamic` `/account` RSC (touchpoint 4 below), never from a client component, so they do not need their own `requireUser()` gate (the RSC already gates on `getSessionUser()` before calling them).
- **Resume handoff note for this touchpoint**: if Phase 1's actual `session.ts` diverges materially from the umbrella's description (e.g. different file name, or these read helpers were placed elsewhere), re-verify by reading the real file before adding to it — do not assume the umbrella's Phase 1 touchpoint table is still accurate by the time Phase 2 executes (per `phase-programs.md`'s Re-Research Rule).

### 3. `apps/web/src/lib/payload-server.ts` (extend, existing file)

Add one new export, following the file's exact existing `unstable_cache` convention (verified
above via `getArticleBySlug`/`getPinnedLatest`):

```
export const getArticlesByIds = unstable_cache(
  async (ids: ReadonlyArray<string>): Promise<Article[]> => {
    const unique = Array.from(new Set(ids)).filter(Boolean);
    if (!unique.length) return [];
    const p = await payload();
    const r = await p.find({
      collection: "articles",
      where: { and: [{ id: { in: unique } }, { _status: { equals: "published" } }] },
      depth: 1,
      limit: unique.length,
    });
    return r.docs;
  },
  ["articles:by-ids"],
  { tags: ["articles:all"], revalidate: 60 }
);
```

(This is illustrative of the exact shape to add — not literal code to paste verbatim without
adapting to the file's real current line numbers and import list at execution time; EXECUTE mode
must re-read the file's current state first, per the phase-locking discipline that PLAN mode does
not write implementation code.)

- **Cache-key note, verified against `unstable_cache` semantics**: because `ids` is a function argument, `unstable_cache`'s automatic argument-based cache key means different users' distinct saved-article-id sets naturally produce distinct cache entries under the same `["articles:by-ids"]` key namespace — this is safe (no cross-user leakage) precisely because it's article *content* being cached (public, published-only), not the *list of which user saved what*. The `userId → articleId[]` list itself (from `listBookmarks`/`listHistory`/`listFollows`) is never cached — only fetched fresh per `force-dynamic` request. This is the correct division of "cache the public article, never cache the private list," matching the umbrella's Global Convention #1 exactly.
- Published-only filter (`_status: { equals: "published" }`) is intentional and must be kept: if a saved/read article gets unpublished in `/admin`, it silently disappears from the user's Saved/History tab (accepted, documented behavior carried over from brief-asia — the drizzle row is not deleted, just doesn't hydrate; do not add a cleanup job for this in Phase 2, it's out of scope).
- Shares the `articles:all` tag with every other article read in this file — no new revalidate hook is needed (`apps/web/src/payload/hooks/revalidate.ts` already busts `articles:all` on every article `afterChange`/`afterDelete`).
- Locale parameter: brief-asia's version takes a `locale` param (`getArticlesByIds(ids, locale)`) because it has per-locale Payload localization. dtw-web's `getArticleBySlug`/other existing helpers in `payload-server.ts` do **not** take a `locale` parameter anywhere in the current file (confirmed by reading the file — dtw is not on subpath i18n yet, per invariant #9/#10's "article body stays in source language" and the umbrella's AD-4-adjacent note that dtw has no per-locale article fetch mechanism today). **Do not port the `locale` parameter** — omit it, matching every other function in this file.

### 4. `apps/web/src/app/(reader)/account/[[...tab]]/page.tsx` (rewrite, currently 466 lines, client component)

Convert from `"use client"` + mock fixtures to a **server component**:

- Remove `"use client"`. Add `export const dynamic = "force-dynamic";` at the top (per convention #8 — this route is the one place per-user reads are allowed server-side, and it must never be prerendered/ISR'd).
- Keep the existing `TABS` list, tab-routing logic (`isTab`, the optional catch-all `params: Promise<{ tab?: string[] }>` — this part does not need `use()` from React anymore since it's now an `async function` server component: `const { tab: tabSeg } = await params;`), and the outer page shell (avatar circle, `user.name`/`user.email`/`user.role` header block) — these do not need to change shape, only their data source.
- Replace the guest-gate: instead of `const { user } = useShell(); if (!user) return <...>`, call `const user = await getSessionUser();` (from `@/lib/session`) and render the **existing** "Log in to view your account." block (same JSX, same `t()` triple) when `user` is `null` — no redirect, matches AD-6's inline-prompt pattern exactly. This block currently reads `useT()` (a client hook) — since the page is now a server component, either (a) keep this specific block as a small inline server-renderable JSX with hardcoded/`t()`-equivalent server-safe strings (the `useT()` hook itself is client-only, backed by `I18nProvider`'s context, which the RSC cannot call), or (b) extract just the "Log in to view your account" prompt into a tiny separate client component (e.g. `<AccountSignInPrompt />` in a new file, or inline in the same file as a `"use client"` sub-component) that the server component renders when `user` is null, calling `useT()` and `useShell().openAuth` internally so the "Log in" text can also become a real button that opens the auth modal (brief-asia's `AccountSignInPrompt` does exactly this — `useShell().openAuth` — confirmed in `research.briefAuth.key_files`). **Recommend option (b)**: add a small `"use client"` component (e.g. exported from the same file, or a new `apps/web/src/app/(reader)/account/[[...tab]]/sign-in-prompt.tsx`) so the prompt can be an actual `openAuth()`-wired CTA, not static text — this closes a real UX gap in the current stub (today's "Log in to view your account" has no button at all) while staying inside Phase 2's scope (wiring account-page auth gating).
- When `user` is truthy: `const [bookmarkRows, historyRows, followRows, navPillars] = await Promise.all([listBookmarks(user.id), listHistory(user.id), listFollows(user.id), getNavPillars()]);` then hydrate article rows: `const ids = Array.from(new Set([...bookmarkRows, ...historyRows].map(r => r.articleId)));` `const articles = await getArticlesByIds(ids);` `const articlesById = new Map(articles.map(a => [String(a.id), toArticleView(a)]));` — then map `bookmarkRows`/`historyRows` (in their existing DB order — `savedAt desc` / `readAt desc`) through `articlesById`, filtering out any id that hydrated to nothing (silently-unpublished case, see touchpoint 3's note).
- `AccountSaved`, `AccountHistory`, `AccountFollowing` become **presentational** components that accept real data as props (`articles: ArticleView[]` for Saved/History; `navPillars: NavPillar[]` + `followedSlugs: string[]` for Following) instead of reading `ARTICLES`/`PILLARS` fixtures internally. Keep every other visual/JSX detail (grid layout, `PillarTag`, `CoverArt`, `TimeAgo`, `t()` triples, "X saved · synced across N devices" copy) unchanged — this is a data-source swap, not a redesign.
- `AccountNewsletters` and `AccountSettings` are **out of scope** for this phase (Phase 5 and Phase 4 respectively) — leave them reading `NEWSLETTERS`/static rows from `apps/web/src/lib/data.ts` exactly as they are today. Do not touch these two tab components' internals in this phase; only the file-level conversion (removing `"use client"` from the page, keeping these two tabs as small client islands if they need interactivity — `AccountSettings`'s buttons are currently inert display-only, so it can likely stay a plain server-rendered fragment; `AccountNewsletters` similarly has no live interactivity yet, verify at execution time whether either needs to become an explicit small `"use client"` sub-component to avoid breaking on any remaining client-only hook usage).
- Client-side mutation islands: `AccountSaved`'s "Remove" button and `AccountHistory`'s (currently-absent, must be added per the umbrella's touchpoint) "Clear history" action, and `AccountFollowing`'s Follow/Following toggle button, become small `"use client"` components (or the whole `AccountSaved`/`AccountHistory`/`AccountFollowing` functions become `"use client"` components receiving server-fetched data as props from the parent RSC — the standard Next.js "server component fetches, client component renders + mutates" split). Each mutation calls the matching `account-actions.ts` server action, then `router.refresh()` (from `next/navigation`) to re-fetch the RSC's `Promise.all` data — mirrors brief-asia's `account-tabs.tsx` optimistic-update + `router.refresh()` pattern exactly (confirmed in `research.briefUsers.reusable_patterns`: "Optimistic server-action toggles ... setState immediately, fire void serverAction(), reconcile with router.refresh() on completion").
- The current `AccountHistory` component has **no** "Clear history" button in today's code (only re-verified: the mock version just lists articles). Add one, calling `clearHistory()` + `router.refresh()`, per the umbrella's stated scope ("Clear history" is explicitly named in the umbrella's Validation Gates for this phase) and per the copy already present in `AccountHistory`'s existing subtitle text ("We use this to recommend, and to reset your free-article meter. Clear any time.") — the UI already promises this action exists; today it is dead copy with no button.

### 5. Following-tab pillar source

- `AccountFollowing`'s pillar list comes from `getNavPillars()` (already fetched once for the page's `Promise.all` in touchpoint 4 — do not fetch it a second time inside the tab component), matching `(reader)/layout.tsx`'s existing `getNavPillars()` usage pattern.
- Replace the current `Set<PillarId>` local `useState` (hardcoded to `["ai", "latest"]` as a fake "already following" seed) with `followedSlugs: string[]` computed server-side from `listFollows(user.id)`'s rows, passed down as a prop, with client-side optimistic toggling on top calling `toggleFollow(slug)`.
- This directly fixes the "Following data shapes no feed yet (copy claims it does)" and "hardcoded list" gotchas flagged in the research for brief-asia's equivalent — dtw's version must render whatever pillars actually exist in the CMS today, proven by the umbrella's own validation gate ("add/rename a pillar in `/admin`, confirm the Following tab reflects it without a deploy").

### 6. `apps/web/src/components/article/share-bar.tsx` (modify, currently 61 lines) — corrects the umbrella's stated touchpoint

- Add props: `articleId: string`, `initialSaved: boolean`, `disabled?: boolean` (for the guest/loading case before the client effect resolves).
- Replace the local `const [saved, setSaved] = useState(false)` with `const [saved, setSaved] = useState(initialSaved)`.
- The Save `<Btn>`'s `onClick` becomes: if no `user` (passed down from `article-content.tsx`, which already has `useShell().user`), call `openAuth()` (also passed down) instead of mutating; if signed in, optimistically flip `saved` locally, then `void toggleBookmark(articleId)` (fire-and-forget, matching the codebase's existing optimistic-update convention — no `router.refresh()` needed here since the share bar has no list to resync, only its own toggle state; if the server call fails, this phase does not need rollback-on-error handling beyond what brief-asia does, which is none — flag as a known minor gap, not a blocker).
- `ShareBar`'s other three buttons (Share/Copy link/Email) are unchanged — out of scope.

### 7. `apps/web/src/components/article/article-content.tsx` (modify, currently 259 lines)

- Pass the new props down to `<ShareBar />` (both call sites — note it's only rendered when `!hitPaywall`, unchanged): `articleId={article.id}` (already `string` per `ArticleView.id`), `initialSaved` and `user`/`openAuth`.
- `initialSaved` is **not** known at RSC-render time (per the ISR-safety finding above) — it must be resolved client-side. Add a `useState<boolean>(false)` (default: not saved) plus a `useEffect` (keyed on `[article.id, user?.email]`, mirroring brief-asia's exact effect-dependency shape) that:
  1. Calls `incrementRead(article.id)` for non-sponsored articles — **unchanged, existing line 30, do not modify** (this is the guest client-side meter, Phase 3's concern, not Phase 2's).
  2. **New**: if `user` is truthy, calls `void recordView(article.id)` (fire-and-forget; per touchpoint 1, `recordView` already no-ops for guests, so this call is technically safe even without the `if (user)` guard, but keep the guard for clarity and to avoid an unnecessary network round-trip for the common guest case — matches brief-asia's own `user?.email` dependency-array gating intent).
  3. **New**: calls `isBookmarked(article.id).then(setSavedState)` to resolve the real initial Save-button state after mount (guests always resolve `false`, per touchpoint 1's guest-safe `isBookmarked`).
  4. Passes the resolved `savedState` down as `ShareBar`'s `initialSaved`/`saved` prop (or lift the `saved` state itself up into `article-content.tsx` and pass a controlled `saved`/`onToggleSave` pair into `ShareBar` instead of `ShareBar` owning its own state — either shape is acceptable; prefer lifting state up into `article-content.tsx` since it already owns the `useEffect` and avoids a double-source-of-truth between the two components).
- **Dedupe requirement (explicit, ties to AD-8 #5)**: `recordView`'s dedupe is enforced at the DB layer (`reading_history`'s `onConflictDoUpdate` on the `(userId, articleId)` unique index, confirmed in `packages/db/migrations` via the schema's `uniqueIndex("reading_history_pk")`), **not** at the client effect layer — so it is safe (idempotent, not "doubling up" a DB row) for this `useEffect` to fire again on a client-side re-render/re-mount, but it must still be keyed on `[article.id, user?.email]` (not fire on every render) to avoid unnecessary network calls, matching brief-asia's exact dependency array. This is the DB-side half of "doubles as the DB paywall meter later" (Phase 3's concern to actually *read* this count; Phase 2 only needs to correctly *write* it once per user-per-article-per-effect-mount).
- Sponsored articles: `recordView` should still fire for sponsored articles (unlike `incrementRead`, which explicitly skips sponsored articles at line 30 `if (!article.sponsored) incrementRead(...)` — that guard is about the **guest paywall meter**, which sponsored articles are exempt from; reading history is a different concern — a signed-in reader's reading history should include sponsored articles they read, matching brief-asia's `recordView` which has no sponsored-exclusion check at all, confirmed by reading the file). Do not copy the `!article.sponsored` guard onto the new `recordView` call.

### 8. Out-of-file note: `packages/db` package exports

Before wiring `account-actions.ts`'s and `session.ts`'s imports, verify `packages/db/package.json`'s
`exports` map actually resolves `@dtw/db` (schema barrel: `bookmarks`, `readingHistory`, `follows`,
etc.) and `@dtw/db/client` (the `db` instance) as two importable subpaths — this plan assumes both
resolve cleanly based on `packages/db/src/schema/index.ts` existing as a barrel and `client.ts`
existing as a sibling module, but the package's actual `exports`/`main`/`types` fields were **not**
directly read during this PLAN pass (a real gap — flagged here rather than assumed). **Execute-time
first step**: read `packages/db/package.json` before writing the first import line in either new/
extended file, to confirm the exact import specifiers.

---

## Public Contracts

New exported symbols this phase introduces or changes — the surface other phases and any future
consumer must treat as stable once this phase is `✅ VERIFIED`:

| Symbol | File | Signature | Notes |
|---|---|---|---|
| `toggleBookmark` | `apps/web/src/lib/account-actions.ts` (new) | `(articleId: string) => Promise<boolean>` | `"use server"`, `requireUser()`-gated, throws `"Not authenticated"` for guests |
| `removeBookmark` | `apps/web/src/lib/account-actions.ts` (new) | `(articleId: string) => Promise<void>` | `"use server"`, `requireUser()`-gated |
| `isBookmarked` | `apps/web/src/lib/account-actions.ts` (new) | `(articleId: string) => Promise<boolean>` | `"use server"`, guest-safe (returns `false`, never throws) |
| `recordView` | `apps/web/src/lib/account-actions.ts` (new) | `(articleId: string) => Promise<void>` | `"use server"`, guest-safe no-op; upserts `reading_history` |
| `clearHistory` | `apps/web/src/lib/account-actions.ts` (new) | `() => Promise<void>` | `"use server"`, `requireUser()`-gated |
| `toggleFollow` | `apps/web/src/lib/account-actions.ts` (new) | `(targetSlug: string) => Promise<boolean>` | `"use server"`, `requireUser()`-gated; **narrower signature than brief-asia's** (no `followType` arg — pillar-only) |
| `listBookmarks` | `apps/web/src/lib/session.ts` (extended) | `(userId: string) => Promise<Bookmark[]>` | server-only, not gated (caller must already hold a verified `userId`) |
| `listHistory` | `apps/web/src/lib/session.ts` (extended) | `(userId: string) => Promise<ReadingHistory[]>` | server-only, `.limit(50)` |
| `listFollows` | `apps/web/src/lib/session.ts` (extended) | `(userId: string) => Promise<Follow[]>` | server-only |
| `getArticlesByIds` | `apps/web/src/lib/payload-server.ts` (extended) | `(ids: ReadonlyArray<string>) => Promise<Article[]>` | `unstable_cache`'d, tag `articles:all`, published-only, no `locale` param (dtw has none yet) |
| `<ShareBar>` props | `apps/web/src/components/article/share-bar.tsx` (extended) | `{ articleId: string; initialSaved: boolean; disabled?: boolean; user: User \| null; onLogin: () => void }` (exact prop names to be finalized at execute time, but `articleId` and a saved-state input are required) | breaking change to `ShareBar`'s current no-props signature — its only call site (`article-content.tsx`) is updated in the same phase, so this is not a cross-phase breaking change |

No environment variables, cookies, routes, or Drizzle schema changes are introduced by this phase
(all tables read/written already exist — see the umbrella's AD-7 grounding). No changes to Phase 1's
public contracts (`getSessionUser`, `requireUser`, `useShell().user`/`openAuth`) are made by this
phase — it only **consumes** them.

---

## Out of Scope (Phase 2)

- `article_views` / any per-page-load analytics table — deliberately not ported (AD-8 #5).
- Read-later queue tab (`reading_queue` table, `addToQueue`/`removeFromQueue`/`reorderQueue`) — Phase 4.
- Settings tab mutations (`changeEmail`/`changePassword`/`deleteUser`) — Phase 4. `AccountSettings` stays static in this phase.
- Newsletters tab (`setNewsletter`/`isSubscribed`/CMS `Newsletters` collection) — Phase 5. `AccountNewsletters` stays fixture-fed in this phase.
- Paywall meter/threshold changes (`hitPaywall`, `header.tsx`'s nudge banner, `paywall.tsx`'s copy) — Phase 3. This phase's `recordView` write is a prerequisite for Phase 3's logged-in meter read, but Phase 2 does not itself change any paywall-trip condition.
- `header.tsx` — not touched by this phase at all (Phase 1 touched login/logout wiring there; Phase 3 touches the nudge threshold there). No changes in Phase 2.
- `(reader)/layout.tsx` — not modified (still just `getNavPillars()` → `<Header>`; Phase 2's `getNavPillars()` calls happen inside the `/account` RSC and `AccountFollowing`, not here).
- Any change to `apps/web/src/lib/i18n.tsx`, `apps/web/src/lib/data.ts`'s `ARTICLES`/`NEWSLETTERS` fixture *contents* (only their *consumption* in the Saved/History/Following tabs is removed — the fixtures themselves stay, since `AccountNewsletters`, the pillar/dashboard fixtures, and other still-fixture-fed surfaces continue to use `data.ts`).
- Anonymous-guest bookmark storage/merge-on-login — explicitly deferred to the umbrella's Foundation vs. Expansion boundary (Phase 3 handles only the guest *meter* reset on login, not a bookmark merge; no anonymous bookmark storage exists to merge from in this program at all).

---

## Blast Radius

- First production `@dtw/db/client` usage for reader-data (Phase 1 only used it one layer removed, via the Better-Auth `drizzleAdapter`). This is the first place a hand-written Drizzle query runs in `apps/web/src` — confirms the `server-only`/env-throw discipline end-to-end for a second, independent code path. If `packages/db`'s `exports` map (touchpoint 8) doesn't resolve as expected, this blast radius is wider than assumed — treat as a blocker, not a silent workaround.
- `/account`'s rendering model changes from client+mock to server+`force-dynamic` — this is a real architectural change to the route, not additive. Anything else that might assume `/account` is client-rendered (none confirmed during this PLAN pass beyond the page itself — re-verify at execution time via a repo-wide grep for `/account` route references) must be re-checked.
- `article-content.tsx` and `share-bar.tsx` both gain new client-side effects/props — must not double-fire `recordView` inappropriately, must not break the paywall-card branch (`hitPaywall && <Paywall .../>` — `ShareBar` is already conditionally unrendered when `hitPaywall` is true, so no new interaction there, but confirm this stays true after the prop-threading change).
- `apps/web/src/lib/payload-server.ts` gains a new cache-tagged export — verify at execution time that `getArticlesByIds`'s cache key (`["articles:by-ids"]`) does not collide with any existing key in the file (confirmed absent during this PLAN pass via `grep -n "articles:by-ids"` returning nothing, but re-check post-Phase-1 in case Phase 1 or drift added something with the same name).
- `packages/db` is shared with `dtw-engine` (separate repo) — this phase adds **zero** new Drizzle tables/columns (every table it reads/writes — `bookmarks`, `reading_history`, `follows` — already exists per AD-7's grounding), so there is no cross-repo schema blast radius from this phase specifically. If execution discovers a genuine need for a new column, that is a scope change requiring stop-and-confirm, not a silent addition (per the umbrella's Global Blast Radius section).

---

## Validation Gates

- `pnpm typecheck`, `pnpm lint`, `pnpm build` (repo root, `turbo`-driven) — must pass clean.
- **Manual, save/unsave**: as a signed-in reader (real Phase 1 session), open an article, click Save in the share bar → confirm the button flips to "Saved" state → query `SELECT * FROM bookmarks WHERE user_id = '<id>';` and confirm a row exists with `article_id` matching the article's numeric id as text → visit `/account` (default Saved tab) → confirm the article renders with real title/cover art (not a `data.ts` fixture — cross-check the title against what's actually in `/admin` for that article) → click Remove on the Saved tab → confirm the row is deleted from `bookmarks` and the tab updates after `router.refresh()` (no full page reload required).
- **Manual, history + dedupe**: as the same signed-in reader, open 2–3 different articles (each once) → query `SELECT article_id, read_at FROM reading_history WHERE user_id = '<id>' ORDER BY read_at DESC;` and confirm exactly one row per article → **re-open the same article a second time** → confirm the row count for that article stays at 1 and only `read_at` updates (proves the `onConflictDoUpdate` dedupe, not a duplicate insert — direct proof of AD-8 #5) → visit the History tab → confirm articles render, most recent first → click "Clear history" → confirm all `reading_history` rows for that user are deleted and the tab reflects zero.
- **Manual, follow**: as a signed-in reader, follow a pillar from the Following tab → query `SELECT * FROM follows WHERE user_id = '<id>';` and confirm a row with `pillar_id` matching the pillar's `slug` → in `/admin`, add or rename a pillar → without a deploy, confirm the Following tab's pillar list (not the followed state, the *list itself*) reflects the CMS change within the `pillars:all` cache's revalidate window (proves the CMS-driven-not-hardcoded requirement, invariant #8).
- **Manual, guest gating**: as a guest (no session), visit `/account` directly → confirm the inline sign-in prompt renders (no redirect, no 401, page returns 200) → click its CTA → confirm it opens the real auth modal (`openAuth()`), not a dead link → as a guest, open an article and click Save in the share bar → confirm `openAuth()` opens the modal instead of throwing/erroring (check the browser console for an uncaught "Not authenticated" error — there should be none, since the guest branch must intercept the click before calling `toggleBookmark` at all).
- **Manual, unpublished article**: as a signed-in reader, save an article → in `/admin`, unpublish that article → revisit the Saved tab → confirm it silently drops from the list (no error, no crash) rather than showing a broken card — the underlying `bookmarks` row is untouched (still present in the DB; only the hydration join drops it) — confirm this directly by querying `bookmarks` and observing the row still exists even though the tab no longer shows it.
- **Manual, ISR non-leakage** (direct proof of the [Architecture Finding](#architecture-finding-isr-safety-verified-against-real-code) above): as User A, save an article. As a **different, signed-out browser/incognito session** (or User B), load the same article page within the same 60-second revalidate window → confirm the Save button shows the guest/unsaved default state, not User A's "Saved" state — proves no per-user state leaked into the shared ISR cache.
- **Data verification**: run `SELECT id, user_id, article_id, saved_at FROM bookmarks ORDER BY saved_at DESC LIMIT 5;`, `SELECT user_id, article_id, read_at FROM reading_history ORDER BY read_at DESC LIMIT 5;`, and `SELECT user_id, pillar_id, followed_at FROM follows ORDER BY followed_at DESC LIMIT 5;` after the flows above, confirming real rows exist (not just "the UI looked right").
- **Regression** (per `phase-programs.md`'s Regression Checkpoint Standard — narrowest representative check per overlapping surface, not the full Phase 1 suite):
  - Regression surface: Phase 1 login/logout. Check: sign in via the method exercised in the Phase 1 report (or magic link if unspecified), confirm the header still shows the real user's name/avatar, sign out, confirm it reverts to "Log in" — this exercises `useShell().user`/`authClient.signOut()`, which Phase 2 does not touch directly but which `article-content.tsx`'s new `useEffect` depends on (`user?.email` in the dependency array).
  - Regression surface: Phase 1's `(reader)/layout.tsx` provider boundary. Check: confirm `/admin` still loads without `ShellProvider`/`AuthModal` mounted (e.g. no auth-modal DOM node present on an `/admin` page load) — Phase 2 does not touch this file, but it's the shared boundary both phases rely on.

No automated test suite exists yet in this repo (`process/context/tests/all-tests.md` confirms
zero `*.test.ts*` files and no `vitest` dependency as of this PLAN pass) — these manual + DB +
build gates are the full verification surface for this phase, matching every other phase in this
program. This is a tracked, known gap (see the umbrella's Grounding & Verification Method), not
something Phase 2 is expected to close.

---

## Verification Evidence

The Durable Report Target below must capture evidence in the exact format required by
`process/development-protocols/phase-programs.md`'s Regression Checkpoint Standard for the two
regression checks, and equivalent concrete evidence for every other Validation Gate above:

- For each **manual** gate: the exact steps performed and the exact observed result (not "worked as expected" — state what was clicked, what rendered, what didn't).
- For each **data verification** query: the exact SQL run and the exact row(s) returned (copy/paste the output, or a representative excerpt if the result set is large).
- For each **regression** check: `Regression: [surface] — [PASS | FIXED | BLOCKED]` / `Command: [exact command or manual step]` / `Result: [1-line outcome]`, per the standard's evidence format.
- For `pnpm typecheck`/`pnpm lint`/`pnpm build`: paste the final pass/fail summary line, not just "passed."

A phase report that only states "build succeeded, manual testing looked fine" does not satisfy
this phase's Phase Completion Rules and must not be marked `✅ VERIFIED`.

---

## Durable Report Target

`process/features/account/reports/phase-02-account-data-layer_REPORT_<execution-date>.md`

Per this plan's Phase Completion Rules and Verification Evidence sections above, this report must
document: what was tested manually (exact steps from Validation Gates above), data verified in DB
(the actual query + actual result rows, not paraphrased), errors encountered and fixed, the two
regression checks above with PASS/FIXED/BLOCKED evidence in the `phase-programs.md` format, and
explicit user confirmation received — not just "build succeeded."

---

## Blockers That Would Justify 🚧 BLOCKED

- **Phase 1 not actually `✅ VERIFIED`** at Phase 2 kickoff (e.g. still `🔨 CODE DONE`, or `session.ts` doesn't export what this plan assumes) — re-verify Phase 1's actual state and its report before proceeding; do not silently build Phase 2 against an assumed Phase 1 shape.
- `packages/db`'s `exports` map (touchpoint 8) does not cleanly expose both `@dtw/db` (schema) and `@dtw/db/client` as the umbrella and this plan assume — would require either a `packages/db` config fix (itself a scope question: is a build-config fix "additive" under AD-7, or does it need separate sign-off?) or a different import strategy. Stop and resolve explicitly rather than guessing at import paths.
- Payload article `id` (`number`) vs. `bookmarks.articleId`/`reading_history.articleId`/`follows.pillarId` (`text`) type coercion causes a silent join failure in `getArticlesByIds`'s `where: { id: { in: unique } }` clause (e.g. Payload's `in` operator expecting numbers, not the `String()`-coerced ids stored in Drizzle) — this is explicitly flagged as unresolved by the umbrella and must be checked with a real query against real data before assuming `String()` round-trips cleanly through Payload's `find({ where: { id: { in: [...] } } })`.
- `getArticlesByIds`'s `articles:all` cache tag choice causes stale saved-article data after a CMS edit within the 60s window in a way that doesn't self-heal on the next request — a real bug requiring investigation, not a scope change.
- The ISR-safety finding above turns out to be wrong in practice (e.g. Next.js 15's actual caching behavior for a `"use client"` component nested in a `revalidate=60` RSC differs from what this plan assumes, and per-request client-side server-action calls are somehow still getting baked into the page's static shell) — this would be a serious, repo-wide-relevant finding; stop immediately, do not ship a real leak.

---

## Resume and Execution Handoff

If resumed after a gap or context compaction, before executing:

1. Reread this Phase 2 plan in full, and the umbrella plan's Phase 2 section (for context on why the touchpoints were originally proposed) — note where this plan's grounding **corrects** the umbrella (the `ShareBar`-not-`article-content.tsx` Save button location; the `session.ts` `requireUser()` export uncertainty; the `packages/db` exports-map gap) and trust this plan's corrections over the umbrella's original table where they conflict, since this plan re-verified against real code and the umbrella explicitly says its per-phase tables are "high-confidence input to the next PLAN pass," not pre-verified fact.
2. Confirm Phase 1 is `✅ VERIFIED` — read `process/features/account/reports/phase-01-auth-foundation_REPORT_*.md` (whatever date-stamp it actually has) if it exists; if it doesn't exist or Phase 1's status table entry isn't `✅ VERIFIED`, stop and route back to Phase 1 first.
3. Re-read the **current** state of `apps/web/src/lib/session.ts`, `apps/web/src/lib/shell.tsx`, `apps/web/src/components/article/article-content.tsx`, and `apps/web/src/components/article/share-bar.tsx` — confirm they match what this plan assumes (Phase 1 having landed a real session bridge; `share-bar.tsx` still being the un-wired stub described above). If any of these have materially drifted (e.g. someone already partially wired the Save button, or Phase 1 shaped `session.ts` differently than assumed), treat this plan's specific line-level claims as stale and re-verify before writing code, but the overall architecture (touchpoints 1–8, the ISR-safety finding) should still hold.
4. Re-check `apps/web/src/lib/data.ts` for the exact current shape of `ARTICLES`/`NEWSLETTERS`/`PILLARS` fixtures being partially replaced, since UI copy/shape may have drifted since this plan was written (03-07-26).
5. Confirm `packages/db/package.json`'s `exports` field before writing any import (touchpoint 8's flagged gap) — this is a real unresolved verification item, not a formality.
6. Do not begin Phase 3, 4, or 5 planning/execution until this phase's report shows `✅ VERIFIED` in the umbrella's Phase Status Table, and the umbrella's status table row for Phase 2 has actually been updated (not just this plan file's own header) — updating the umbrella table is part of this phase's "durable capture" step per `phase-programs.md`'s per-phase loop, step 7.

---

## Next Step

This plan is not authorized to implement anything (PLAN mode is spec-only). The immediate next
step is user review of this plan, followed by an explicit **"ENTER EXECUTE MODE"** instruction
scoped to this exact file (`process/features/account/active/phase-02-account-data-layer_PLAN_03-07-26.md`)
— never a whole-program execute pass. Per RIPER-5, EXECUTE must not begin without that explicit
approval, and per this program's AD-3, no phase beyond this one should be planned or executed
until this phase's own report shows `✅ VERIFIED`.
