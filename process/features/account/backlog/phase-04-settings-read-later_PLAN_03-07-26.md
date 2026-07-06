# Phase 4 — Settings, Account Deletion & Read-Later Queue

**Date**: 03-07-26
**Complexity**: Complex — Phase 4 of 5 in the `reader-auth-account` phase program (see the umbrella plan below). Standalone, this phase plan follows the repo's direct-plan artifact contract (`vc-generate-plan`).
**Feature**: `account`
**Status**: ⏳ PLANNED (no code for this phase exists yet. Phase 1 and Phase 2 — this phase's dependencies — have also not been executed as of this PLAN pass; see the Grounding section for what that means for this document's reliability.)

**Umbrella plan**: `process/features/account/active/reader-auth-account_UMBRELLA-PLAN_03-07-26.md` — this phase plan is subordinate to it. Architecture Decisions AD-1 through AD-8, Global Conventions, Global Public Contracts, and Global Blast Radius in that document apply here and are **not relitigated** by this file.

**Execute anchor**: this file (`phase-04-settings-read-later_PLAN_03-07-26.md`) is the primary execute anchor for Phase 4 — pass this exact path to EXECUTE, not the umbrella. **Supporting phase files** (context only, not execute targets for this phase): the umbrella `reader-auth-account_UMBRELLA-PLAN_03-07-26.md`, and the sibling phase plans `phase-01-auth-foundation_PLAN_03-07-26.md` and `phase-02-account-data-layer_PLAN_03-07-26.md` (this phase's dependencies, read for grounding, not modified by this phase).

## Quick Links

- [Overview](#overview)
- [Grounding & Verification Method](#grounding--verification-method)
- [Dependencies](#dependencies)
- [Phase Completion Rules](#phase-completion-rules)
- [Acceptance Criteria](#acceptance-criteria)
- [Touchpoints](#touchpoints)
- [Public Contracts](#public-contracts)
- [Blast Radius](#blast-radius)
- [Out of Scope](#out-of-scope-phase-4)
- [Implementation Checklist](#implementation-checklist)
- [Verification Evidence](#verification-evidence)
- [Durable Report Target](#durable-report-target)
- [Blockers That Would Justify 🚧 BLOCKED](#blockers-that-would-justify--blocked)
- [Resume and Execution Handoff](#resume-and-execution-handoff)
- [Next Step](#next-step)

---

## Overview

Phase 4 completes full account management per `process/features/account/_GUIDE.md`'s tab list, closing the two remaining gaps in `/account` that Phases 1–2 do not touch: **Settings** (change email, change password, delete account — GDPR/PDPA right-to-erase) and a brand-new **Read later** queue tab.

The Settings work is a near-verbatim port of `brief-asia-web/src/components/account/account-tabs.tsx`'s `SettingsTab` (verified present, lines 400–514), adjusted for AD-1's three-auth-method reality (brief-asia is email+password-only; dtw also has magic-link and 3 OAuth providers, so "change password" cannot assume every user has one). The read-later queue is **net-new work in both repos**: brief-asia's `reading_queue` Drizzle table (`src/db/schema/account.ts`) has zero code paths anywhere in that codebase — no server action, no UI. dtw's `packages/db/src/schema/account.ts` already has the identical table, migrated and unused. This phase builds the first UI/action layer either repo has ever had for it.

## Grounding & Verification Method

This plan was authored after reading `process/context/all-context.md` (root router, for architecture/stack + invariants #4/#8/#9/#10/#12/#13) and following its routing table to `process/context/planning/all-planning.md` and `process/development-protocols/plan-lifecycle.md` for the plan-artifact contract, plus `process/features/account/_GUIDE.md` for the read-later/settings spec (tab list, "no length limit", GDPR/PDPA delete-copy requirement, IndexedDB conflict-resolution rule for `read_later_queue` — "client ordering wins"). It is grounded in the durable reference doc `process/features/account/references/brief-asia-port-map_REFERENCE_03-07-26.md` (primary — captures the completed RESEARCH; original source retained at `/tmp/claude-1000/-home-hieunc-Code-dtw-web/df9bb8b7-b07b-40a7-9091-a7506dd1880f/scratchpad/research-port-map.json` as a secondary note) and in the umbrella plan's own Phase 4 section, both of which this document extends to execute-ready depth.

Every file/line cited below was spot-verified against the real filesystem during this PLAN pass, not merely copied from the research JSON:

- `brief-asia-web/src/components/account/account-tabs.tsx` — read in full (539 lines). `SettingsTab` (lines 400–514) confirmed to call `authClient.changePassword({currentPassword, newPassword, revokeOtherSessions: true})`, `authClient.changeEmail({newEmail, callbackURL: "/en/account"})`, and `authClient.deleteUser({})` behind a bare `window.confirm(...)`, then `window.location.href = "/en"`.
- `brief-asia-web/src/lib/auth.ts` — the `changeEmail`/`deleteUser` config block (lines 99–111) confirmed: `changeEmail: { enabled: true, sendChangeEmailVerification: ... }` (emails the confirmation to the NEW address, matching the flow), `deleteUser: { enabled: true }` with **no** `sendDeleteAccountVerification` or freshness config set — meaning brief-asia's own `deleteUser({})` call deletes immediately once invoked with a valid session; the only user-facing gate is the client-side `window.confirm()`. This is real, verified brief-asia behavior, not an assumption — but it says nothing about whether the pinned `better-auth@^1.6.20` version dtw will install in Phase 1 enforces its own session-freshness requirement independent of app config; see [Blockers](#blockers-that-would-justify--blocked).
- `packages/db/src/schema/account.ts` (dtw) — read in full. `readingQueue` table confirmed: `userId` (FK `users.id`, `onDelete: "cascade"`), `articleId` (plain text, no FK — Payload-owned), `position` (integer, default `0`, comment "Lower = read sooner. Client owns ordering; server stores it."), `addedAt`. Unique index `reading_queue_pk` on `(userId, articleId)` — one row per user+article, confirmed via `packages/db/migrations/0000_third_ender_wiggin.sql` line 116. Index `reading_queue_user_pos_idx` on `(userId, position)` — line 117. No schema change needed for this phase (AD-7 holds).
- `packages/db/migrations/0000_third_ender_wiggin.sql` — grepped for every FK this phase's delete-account test depends on. Confirmed: `bookmarks`, `follows`, `reading_history`, `reading_queue` → `ON DELETE cascade` on `user_id` (lines 96, 97, 99, 100). `newsletter_subscriptions` → `ON DELETE set null` on `user_id` (line 98). This is the exact evidence the umbrella's Phase 4 Blast Radius section says must be "exercised end-to-end," not just trusted from the schema comment.
- `apps/web/src/app/(reader)/account/[[...tab]]/page.tsx` (dtw, **current, pre-Phase-2 state**) — read in full (466 lines). Confirmed: line 1 is `"use client";`, i.e. a Client Component today, using `use(params)`/`useShell()`, gated on `useShell().user` (in-memory fake), `TabKey` union is `"saved" | "history" | "following" | "newsletters" | "settings"` — **no `"read-later"` value exists today**, and `AccountSettings()` (lines 287–337) is a fully static mock (6 rows: Appearance/Language/Region/Email/Two-factor/Data-export, none wired to any backend). **This file will be materially rewritten by Phase 2 before this phase ever executes** — see the callout below.
- `apps/web/src/components/header.tsx` (dtw) — grepped for account-dropdown links (`/account/saved`, `/account/history`, `/account/following`, `/account`, lines ~389–392, 811). No read-later link exists; this phase's touchpoints deliberately do **not** add one (see [Blast Radius](#blast-radius)).
- Confirmed via `test -f`/`test -e` that `apps/web/src/lib/account-actions.ts` and `apps/web/src/lib/session.ts` **do not exist yet** in dtw-web. `better-auth` is not installed. This is expected — Phase 1 and Phase 2 have not been executed as of this PLAN pass (03-07-26) — but it is the single most important caveat in this document:

  **This plan describes touchpoints inside files that do not exist yet.** Every reference below to "extend Phase 2's `account-actions.ts`" or "Phase 2's `SavedTab` pattern" is a prediction grounded in the umbrella plan's own Phase 1/Phase 2 sections (themselves not yet executed, hence not yet verified against real code), not a description of code this PLAN pass actually read. Before EXECUTE begins on this phase, a fresh kickoff research pass **must** re-read the real, then-current shape of `session.ts`, `account-actions.ts`, and `/account/[[...tab]]/page.tsx` and reconcile any drift against this plan — per `process/development-protocols/phase-programs.md`'s Re-Research Rule. Do not treat this plan's touchpoint table as verified code-level fact; treat it as a strong, execute-ready starting hypothesis.

- Consulted `process/context/tests/all-tests.md` (via the umbrella's prior grounding pass, re-confirmed by the continued absence of any `*.test.ts*` file or `vitest` dependency in this repo as of 03-07-26) — no automated test runner exists yet. Verification Evidence below is manual + DB-query based, not automated-suite based, matching every other phase in this program.

## Dependencies

- **Phase 2 must be `✅ VERIFIED`**: `process/features/account/active/phase-02-account-data-layer_PLAN_03-07-26.md`. Phase 4 needs Phase 2's RSC-converted `/account/[[...tab]]/page.tsx` (server-gated, `force-dynamic`), `getSessionUser()`/`requireUser()`, `listBookmarks`/`listHistory`/`listFollows` read-helper pattern (to mirror for `listQueue`), `getArticlesByIds()` (to hydrate queued article ids), and the established `account-actions.ts` `"use server"` file (to extend with 3–4 new exports).
- **Phase 1 must be `✅ VERIFIED`** (transitively, since Phase 2 depends on it): `process/features/account/active/phase-01-auth-foundation_PLAN_03-07-26.md`. This phase's `changeEmail`/`changePassword`/`deleteUser` UI calls Phase 1's `apps/web/src/lib/auth-client.ts` (`authClient`) directly and relies on Phase 1's `apps/web/src/lib/auth.ts` server config already enabling `changeEmail.enabled`, `deleteUser.enabled`, and `emailAndPassword` (for `changePassword` to be a meaningful action at all — a magic-link/OAuth-only user has no password to change, see [Touchpoints](#touchpoints) item 4).
- **Independent of Phase 3** (`process/features/account/active/phase-03-paywall-nudge_PLAN_03-07-26.md`) — both depend only on Phase 2 and may run in either order, but per the umbrella's explicit rule, only one of Phase 3 / Phase 4 should be "in flight" at a time.
- **Not blocked by Phase 5** (`process/features/account/active/phase-05-newsletters-double-optin_PLAN_03-07-26.md`), but Phase 5 also extends the same account-page tab list — see [Resume and Execution Handoff](#resume-and-execution-handoff) item 5 for the merge-order note.

## Phase Completion Rules

A phase is NOT complete until:

1. **Integration Test** — Works with other system pieces end-to-end (Settings changes actually update `auth_users`/`auth_accounts`; the queue actually persists to `reading_queue`).
2. **Manual Test** — A human can actually perform each action (change email, change password, delete account, add/reorder/remove a queue item).
3. **Data Verification** — Database changes confirmed by an actual query, not by code inspection (see the exact queries in [Verification Evidence](#verification-evidence)).
4. **Error Handling** — Failure cases (no-password user attempting change-password, deleting an already-deleted account, reordering with a stale/foreign article id) are handled gracefully, not just the happy path.
5. **User Confirmation** — The plan owner (user) explicitly confirms the phase works, not just that the agent believes it does.

Status meanings used throughout this plan:

| Marker | Meaning |
|---|---|
| ⏳ PLANNED | Not started |
| 🔨 CODE DONE | Written but not end-to-end tested |
| 🧪 TESTING | Currently being tested |
| ✅ VERIFIED | Tested AND confirmed working (phase gates **and** regression checks both pass) |
| 🚧 BLOCKED | Has issues preventing completion |

After this phase, its report (`process/features/account/reports/phase-04-settings-read-later_REPORT_<execution-date>.md`) must document: what was tested manually (exact steps), data verified in DB (query + result, pasted verbatim), errors encountered and fixed, regression checks against Phase 2 (per `phase-programs.md`'s Regression Checkpoint Standard), and user confirmation received.

## Acceptance Criteria

- [ ] A signed-in reader can change their email; the confirmation email targets the **new** address; `auth_users.email` updates only after the link is clicked, not before (proof: the two-query before/after check in Verification Evidence).
- [ ] A signed-in reader who has a password set (email+password signup, per AD-1) can change it; the old password stops working; the new one works; other sessions are revoked if `revokeOtherSessions: true` is kept.
- [ ] A signed-in reader with no password (magic-link-only or OAuth-only) sees a change-password UI that neither errors nor dead-ends — it either hides the control with an explanation or surfaces a graceful message.
- [ ] A reader can permanently delete their account; `auth_users`/`auth_sessions`/`auth_accounts`/`bookmarks`/`follows`/`reading_history`/`reading_queue` rows for that user are gone (cascade, verified by direct query); the reader's `newsletter_subscriptions` row (if any) survives with `user_id` set to `NULL`, not deleted.
- [ ] A reader can add articles to a "Read later" queue from the article page, reorder them, remove one, and the order survives a page reload — with no length limit enforced (add ≥ 25, confirm none silently dropped).
- [ ] Adding an already-queued article is a no-op, not a duplicate row or an error.
- [ ] A guest clicking the "Read later" toggle sees the auth modal open (`openAuth()`), not an error or silent no-op.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm build` all pass clean after this phase's changes.
- [ ] Phase 2's Saved/History/Following tabs still render and function correctly after this phase's tab-list extension (regression check).
- [ ] The phase report exists at `process/features/account/reports/phase-04-settings-read-later_REPORT_<execution-date>.md` with real DB-query evidence pasted verbatim, not summarized.

## Touchpoints

Exact files to create/modify. "Modify — extends Phase 2" means the file is expected to already exist by the time this phase executes; if it doesn't (see the Grounding callout above), that is a real blocker, not something to silently work around.

| # | File | Change |
|---|---|---|
| 1 | `apps/web/src/lib/account-actions.ts` (**modify — extends Phase 2's file**) | Add 4 new `"use server"` exports, all `requireUser()`-gated (imported from `apps/web/src/lib/session.ts`), additive only — do not touch Phase 2's existing `toggleBookmark`/`removeBookmark`/`isBookmarked`/`recordView`/`clearHistory`/`toggleFollow` exports: <br>• `addToQueue(articleId: string): Promise<void>` — insert into `readingQueue` with `position` computed as `(SELECT COALESCE(MAX(position), -1) + 1 FROM reading_queue WHERE user_id = $userId)` (single query in the action body; no explicit multi-statement transaction required for this single-row append), using `.onConflictDoNothing({ target: [readingQueue.userId, readingQueue.articleId] })` against the existing `reading_queue_pk` unique index so re-adding an already-queued article is a no-op. <br>• `removeFromQueue(articleId: string): Promise<void>` — `DELETE FROM reading_queue WHERE user_id = $userId AND article_id = $articleId`. <br>• `reorderQueue(orderedArticleIds: string[]): Promise<void>` — client sends the **full** ordered list of article ids currently in that user's queue; server validates every id belongs to an existing `reading_queue` row for that user (reject/ignore unknown ids — `reorderQueue` must never be usable to insert new rows, that is `addToQueue`'s job only), then rewrites `position` to the array index for every row inside a single `db.transaction()` (one `UPDATE` per id). This is "client ordering wins" per `_GUIDE.md`'s conflict-resolution rule for `read_later_queue` — there is no concurrent-editor scenario in this phase since full IndexedDB/multi-device sync is deferred. <br>• `isQueued(articleId: string): Promise<boolean>` — existence check against `reading_queue_pk`, mirroring whatever pattern Phase 2 used for `isBookmarked` against `bookmarks_pk` (confirm Phase 2's exact `isBookmarked` shape at kickoff and mirror it, don't reinvent). |
| 2 | `apps/web/src/lib/session.ts` (**modify — extends Phase 1/Phase 2's file**) | Add `listQueue(userId: string): Promise<ReadingQueueItem[]>` — `SELECT * FROM reading_queue WHERE user_id = $id ORDER BY position ASC`, matching Phase 2's locked `listBookmarks(userId: string)`/`listHistory(userId: string)`/`listFollows(userId: string)` convention exactly. |
| 3 | `apps/web/src/app/(reader)/account/[[...tab]]/page.tsx` (**modify — extends Phase 2's RSC conversion**) | Add `"read-later"` as a valid tab/route segment value (alongside Phase 2's `saved \| history \| following`, `settings`, and Phase 5's eventual `newsletters`). Add `listQueue()` to the page's parallel data-fetch (`Promise.all([...])`, matching Phase 2's convention). Hydrate the queue's article ids via Phase 2's `getArticlesByIds` (published-only filter — same accepted "silently drops if unpublished" behavior as the Saved tab). **Critical ordering step**: `getArticlesByIds` is not guaranteed to preserve input order — after hydration, re-sort the resulting array to match the queue's `position` values (build a `Map<articleId, position>` from `listQueue()`'s result and `.sort()` the hydrated articles by it), do not assume the hydration call returns them pre-sorted. |
| 4 | Settings tab logic (**modify — inside whichever file Phase 2 ends up rendering tabs from**; today (pre-Phase-2) that logic lives in `AccountSettings()`, lines 287–337 of `page.tsx` itself, as a fully static mock) | Port `SettingsTab` from `brief-asia-web/src/components/account/account-tabs.tsx` lines 400–514, with these exact deviations from the brief-asia source (do not port verbatim — see the callout list below the table). |
| 5 | Read-later tab UI (**new**, no brief-asia equivalent) | New tab component (e.g. `ReadLaterTab`), colocated the same way Phase 2 colocated its Saved/History/Following tab components. Renders the hydrated, position-sorted queue as rows (reuse whatever `ArticleRow`-equivalent pattern Phase 2 introduced — cover art, pillar tag, title, `TimeAgo`). Each row gets: a **Remove** button (optimistic client-side removal via `useTransition` + `router.refresh()`, matching Phase 2's `SavedTab` pattern, calling `removeFromQueue`); **Move up / Move down** buttons (see the design-choice callout below the table) that compute a new full-order array client-side, optimistically re-render, then call `reorderQueue(newOrderedIds)`. Empty-state copy via `t(en, vi, id)`. No length limit anywhere in this component — do not add a client-side `.slice()` cap "for safety." |
| 6 | `apps/web/src/components/article/article-content.tsx` (**modify — small addition alongside Phase 2's Save-button wiring**) | Add a second toolbar control, "Read later" toggle, next to the existing Save button. Calls `addToQueue(article.id)` / shows queued-state via `isQueued(article.id)` (mirror whatever pattern Phase 2 used for the Save button's `isBookmarked` check). Guest click → `openAuth()`, exactly the existing branch structure Phase 2 already established for Save. Default assumption (confirm at kickoff): sponsored articles CAN be queued — the `!article.sponsored` guard on dtw's existing meter (`incrementRead`) is a paywall-adjacent exclusion, not a general "sponsored content is second-class" rule, and read-later is not paywall-adjacent. |

**Touchpoint 4 deviations from the brief-asia source** (apply all of these when porting `SettingsTab`):

- `changeEmail`: `authClient.changeEmail({ newEmail, callbackURL: "/account" })` — drop brief-asia's hardcoded `/en/account` locale prefix (dtw has no subpath i18n routing yet; per Global Convention #7, do not hardcode a locale segment anywhere in a callback URL — if Phase 1 introduced a shared `authCallbackUrl(path)` helper per that same convention, use it here instead of a raw string literal).
- `changePassword`: **in scope** (AD-1 confirms email+password is a first-class auth method, superseding the original research's magic-link-only assumption), so port `authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true })` verbatim — BUT gate its visibility/behavior on whether the signed-in user actually has a password set. dtw's AD-1 adds magic-link and 3 OAuth providers as equally first-class sign-in methods (unlike brief-asia, where every user has a password by construction); a magic-link-only or OAuth-only dtw user will have no `auth_accounts` row with a `password` column populated. Implement ONE of these two options (confirm which at Phase 4 kickoff, per [Blockers](#blockers-that-would-justify--blocked)):
  - **(a) preferred**: extend `getSessionUser()`/`requireUser()` in `session.ts` to also return `hasPassword: boolean` (a lookup into `auth_accounts` for a row with the credential provider's `provider_id` and a non-null `password`), and hide/relabel the change-password control when `false`.
  - **(b) fallback**: attempt `authClient.changePassword(...)` unconditionally and catch/display the resulting Better-Auth error gracefully when the user has no password. Lower engineering cost, weaker UX — acceptable if kickoff research runs out of time to confirm the exact `provider_id` string for option (a).
- `deleteUser`: port `authClient.deleteUser({})` verbatim, behind a confirm gate. No confirm-dialog primitive exists in `@dtw/ui`'s current export list (`Button`, `PillarTag`, `Byline`, `DisclosureBox`, `Spark`, `ArrowUpDown`, `Placeholder`, `Skeleton`) — building a new dialog component is out of scope for this phase (see [Out of Scope](#out-of-scope-phase-4)); port brief-asia's bare `window.confirm(...)` as-is, but its copy text MUST go through `t(en, vi, id)` (the account `_GUIDE.md` explicitly requires the delete-account confirmation copy to be "unambiguous in EN / VI / ID" — this is a compliance requirement, not a nice-to-have).
- Remove every hardcoded `/en/...` path from every `authClient` call and the post-delete redirect (`window.location.href`).
- Every display string (form labels, success/error toast text) uses `useT()`'s `t(en, vi, id)` triple — re-derive dtw's own copy rather than porting brief-asia's Vietnamese/Indonesian strings verbatim without checking them against dtw's existing tone in `auth-modal.tsx`/`header.tsx`.

**Touchpoint 5 design choice**: reordering is **button-based (Move up / Move down)**, not drag-and-drop. No drag/reorder library is approved anywhere in this program's architecture decisions, and adding one is a real dependency decision this plan does not make. Button-based reorder is the low-blast-radius default; drag-and-drop is a documented future enhancement, not implied scope creep.

## Public Contracts

New surfaces this phase exposes or consumes. No entry here may be introduced by EXECUTE without updating this section first.

- **Environment variables**: none new.
- **Routes**: none new. `"read-later"` is a new *value* for the existing `/account/[[...tab]]` catch-all segment — not a new route file.
- **Database schema**: no new tables/columns. `reading_queue` already exists exactly as needed (re-verified during this plan's grounding pass — see [Grounding](#grounding--verification-method)). AD-7 (additive-only schema changes) is not exercised by this phase at all.
- **New server action contracts** (all `"use server"`, all `requireUser()`-gated, all added to `apps/web/src/lib/account-actions.ts`):
  - `addToQueue(articleId: string): Promise<void>`
  - `removeFromQueue(articleId: string): Promise<void>`
  - `reorderQueue(orderedArticleIds: string[]): Promise<void>`
  - `isQueued(articleId: string): Promise<boolean>`
- **New read helper** in `apps/web/src/lib/session.ts`: `listQueue(userId: string): Promise<ReadingQueueItem[]>` (matches Phase 2's locked `listBookmarks(userId: string)`/`listHistory(userId: string)`/`listFollows(userId: string)` convention).
- **Consumed, not redefined**: Phase 1's `authClient.changeEmail`/`authClient.changePassword`/`authClient.deleteUser` client API and their Phase-1-owned server config in `apps/web/src/lib/auth.ts` — this phase calls them, it does not reconfigure `changeEmail.enabled`/`deleteUser.enabled`/`emailAndPassword` server-side. Phase 2's `getArticlesByIds(ids: string[])` — this phase adds a new caller, not a new contract.
- **Cookies**: none new.

## Blast Radius

- `apps/web/src/lib/account-actions.ts` and `apps/web/src/lib/session.ts` are extended a **second** time (first by Phase 2) — the 4 new queue functions must be strictly additive; do not refactor Phase 2's existing exports as a side effect of this phase's work, or Phase 2's already-`✅ VERIFIED` bookmark/history/follow behavior becomes an untested regression surface.
- `/account/[[...tab]]/page.tsx`'s tab list/routing is extended a **second** time (Phase 2 first converted it to an RSC). Adding `"read-later"` must not break the existing `saved | history | following | settings` tab switch (regression check against Phase 2), and must be structured so it does not fight Phase 5's later addition of a `"newsletters"` segment to the same array (see [Resume and Execution Handoff](#resume-and-execution-handoff) item 5).
- `deleteUser` is the highest-consequence action in this entire program: irreversible, and it cascades across `auth_sessions` / `auth_accounts` / `bookmarks` / `follows` / `reading_history` / `reading_queue` (verified `ON DELETE cascade`, see Grounding) and sets `newsletter_subscriptions.user_id` to `NULL` (verified `ON DELETE set null`). A bug here has real, unrecoverable user-data-loss consequences beyond this phase's own surface. The delete-account manual test in [Verification Evidence](#verification-evidence) is the single most important gate in this phase — run it last, on a disposable account only, never against a real reader's data.
- `article-content.tsx` gains a second new toolbar control (Phase 2 added the Save button wiring first) — must not visually collide with or duplicate Phase 2's Save button, and must follow whatever guard pattern Phase 2 established for `!article.sponsored` if kickoff research determines sponsored articles should be excluded from queueing (current default assumption: they should NOT be excluded — see Touchpoint 6).
- No Payload/CMS surface is touched by this phase — no collection, no Global, no migration. This phase's only DB surface is the already-migrated Drizzle `reading_queue` table, so there is no `payload:migrate:create` step and no ISR/`revalidateTag` concern. Per Global Convention #1, this per-user data must never be `unstable_cache`'d — `listQueue()` stays an uncached, per-request read exactly like Phase 2's `listBookmarks`/`listHistory`/`listFollows`.
- `reading_queue_pk`'s unique index on `(userId, articleId)` is load-bearing for `addToQueue`'s idempotency (`onConflictDoNothing`) — if a future phase or migration ever changes that index, `addToQueue`'s no-op-on-duplicate behavior silently breaks. Not expected to happen in this program (AD-7), but noted since this phase is the first to actually depend on that index's exact shape at the application layer.

## Out of Scope (Phase 4)

- Newsletters tab — Phase 5.
- Paywall/meter threshold — Phase 3.
- Drag-and-drop reordering UI — button-based Move up/down only (see Touchpoint 5's design-choice callout); a future enhancement.
- A dedicated confirm-dialog UI primitive for account deletion — ported `window.confirm()` is acceptable for this phase (see Touchpoint 4).
- Full PWA/IndexedDB queue sync (`_GUIDE.md`'s multi-device conflict resolution beyond same-tab optimistic UI) — deferred per the umbrella's Foundation vs. Expansion boundary.
- Any change to Phase 1's `auth.ts` server config for `changeEmail`/`deleteUser`/`emailAndPassword` — this phase only calls the existing client API surface, it does not reconfigure the server.
- 2FA / editor-reconciliation — AD-5, out of scope for the whole program, not just this phase.
- Header (`header.tsx`) changes — deliberately not touched by this phase, to avoid a third phase (after Phase 1 and Phase 3) modifying that 869-line file and compounding regression risk. Tab discovery for Read Later happens inside the account page's own tab nav, which Phase 2 already renders.

## Implementation Checklist

Numbered, atomic, ordered for execution. Assumes Phase 1 and Phase 2 are `✅ VERIFIED` and their actual current file shapes have been re-confirmed per [Resume and Execution Handoff](#resume-and-execution-handoff) before step 1 begins.

1. Re-read the Phase 1 report, Phase 2 report, and the actual current state of `apps/web/src/lib/session.ts`, `apps/web/src/lib/account-actions.ts`, and `apps/web/src/app/(reader)/account/[[...tab]]/page.tsx` — confirm this plan's Touchpoints assumptions still hold; note and resolve any drift before writing code.
2. Confirm the installed `better-auth@^1.6.20`'s exact `provider_id` string for the credential/password provider in `auth_accounts` (needed for the `hasPassword` signal in Touchpoint 4, option (a)) — read Better-Auth's source/docs directly, do not assume a string.
3. Add `listQueue()` to `apps/web/src/lib/session.ts`.
4. Add `addToQueue`, `removeFromQueue`, `reorderQueue`, and `isQueued` to `apps/web/src/lib/account-actions.ts`, each `requireUser()`-gated, additive only.
5. Extend `/account/[[...tab]]/page.tsx`'s tab union/route handling to accept `"read-later"`; add `listQueue()` to the page's parallel data-fetch; hydrate via `getArticlesByIds`; sort the hydrated results by the queue's `position` map (not by hydration-call order).
6. Build the `ReadLaterTab` component: rows with cover art/pillar tag/title/`TimeAgo` (mirroring Phase 2's row pattern), Remove + Move-up/Move-down controls, empty state — all copy via `t(en, vi, id)`, no length limit.
7. Wire `ReadLaterTab` into the account page's tab-render switch and tab nav list.
8. Add the "Read later" toggle control to `article-content.tsx`'s toolbar next to the existing Save button, calling `addToQueue`/`isQueued` (guest → `openAuth()`).
9. Replace the mock `AccountSettings()` (or whichever component Phase 2 actually produced for the Settings tab, per step 1's re-confirmation) with the ported `changeEmail`/`changePassword`/`deleteUser` logic from `brief-asia-web/src/components/account/account-tabs.tsx` lines 400–514, applying every deviation listed under Touchpoint 4.
10. Run `pnpm typecheck && pnpm lint && pnpm build` at the repo root — must pass clean.
11. Run the full manual test matrix in [Verification Evidence](#verification-evidence), in the stated order — settings first, queue second, the destructive delete-account test **last**, on a disposable test account only.
12. Write the phase report to `process/features/account/reports/phase-04-settings-read-later_REPORT_<execution-date>.md` with every query result pasted verbatim, per Phase Completion Rules.
13. Run the Phase 2 regression checkpoint (Saved/History/Following tabs) before declaring this phase `✅ VERIFIED`.

## Verification Evidence

**Automated:**

- `pnpm typecheck` (turbo, repo root) — must pass clean. Proves no type errors were introduced across `session.ts`, `account-actions.ts`, `page.tsx`, `article-content.tsx`, and the new `ReadLaterTab` component.
- `pnpm lint` — must pass clean.
- `pnpm build` — must succeed. Proves the `server-only` guard on the two extended lib files still holds (no client-bundle leak of `@dtw/db/client`), and no new import cycle was introduced between `article-content.tsx` and the new server actions.
- No automated test suite exists in this repo yet (confirmed via `process/context/tests/all-tests.md`, re-confirmed during this plan's grounding pass) — the manual/DB verification below is the real gate for this phase, not a placeholder pending a future suite.

**Manual, change email:**
1. As a signed-in test reader, submit a new email via the Settings form.
2. Confirm the confirmation email (console-logged in dev if `RESEND_API_KEY` is unset, per Phase 1's fail-open email pattern) targets the **new** address, not the old one.
3. `SELECT email FROM auth_users WHERE id = '<id>';` before clicking the link — confirm it still shows the OLD email.
4. Click the confirmation link.
5. `SELECT email FROM auth_users WHERE id = '<id>';` again — confirm it now shows the NEW email.

**Manual, change password (has-password user):**
1. As a test reader who signed up via email+password (Phase 1), change their password via the Settings form.
2. Confirm sign-out then sign-in with the OLD password fails.
3. Confirm sign-in with the NEW password succeeds.
4. If `revokeOtherSessions: true` was kept: confirm a second, previously-open session (a second browser/incognito) is now signed out.

**Manual, change password (no-password user):**
1. As a test reader who signed up via magic link only or OAuth only (no `auth_accounts.password` row), open Settings.
2. Confirm the change-password control does not render a broken/erroring form — either hidden with an explanatory message, or a graceful Better-Auth error is surfaced on submit, per whichever Touchpoint-4 option was implemented.

**Manual, delete account (run LAST, disposable test account only — never a real reader):**
1. Create a disposable test reader account.
2. Add at least: 1 bookmark, 1 reading-history row, 1 read-later queue item, and (if Phase 5 has landed by then) 1 newsletter subscription — otherwise skip that row and note it explicitly in the report.
3. Trigger delete from Settings; confirm the `window.confirm()` copy renders correctly in all 3 languages (switch language, re-trigger, re-confirm copy each time).
4. Confirm the deletion.
5. **Data verification** — run all of the following and paste every result into the report verbatim:
   - `SELECT * FROM auth_users WHERE id = '<id>';` → 0 rows.
   - `SELECT * FROM auth_sessions WHERE user_id = '<id>';` → 0 rows.
   - `SELECT * FROM auth_accounts WHERE user_id = '<id>';` → 0 rows.
   - `SELECT * FROM bookmarks WHERE user_id = '<id>';` → 0 rows.
   - `SELECT * FROM follows WHERE user_id = '<id>';` → 0 rows.
   - `SELECT * FROM reading_history WHERE user_id = '<id>';` → 0 rows.
   - `SELECT * FROM reading_queue WHERE user_id = '<id>';` → 0 rows.
   - `SELECT * FROM newsletter_subscriptions WHERE email = '<test-email>';` → row(s) **still present**, with `user_id IS NULL` — this table must NOT be empty; that is the correct, intentional `SET NULL` behavior, not a bug.
6. Confirm the browser redirects home and the header reflects a signed-out state.

**Manual, read-later queue:**
1. As a signed-in reader, add 3 distinct articles to the queue from the article page toolbar.
2. `SELECT article_id, position FROM reading_queue WHERE user_id = '<id>' ORDER BY position;` → 3 rows; document the actual position values assigned (e.g. 0/1/2) in the report.
3. Reorder (move the 3rd item to first) via the tab's Move-up controls.
4. Re-run the same query → confirm the new order persists in `position`.
5. Hard-reload the page → confirm the Read Later tab shows the same order (server-side `position` is the source of truth, not client memory).
6. Remove one item → confirm its row is deleted and the tab updates.
7. **No-limit check**: add ≥ 25 articles → confirm all 25 rows exist (`SELECT count(*) FROM reading_queue WHERE user_id = '<id>';`) and all render in the tab — no silent truncation.
8. **Idempotent-add check**: attempt to add the same article twice → confirm exactly 1 row exists for that `(user_id, article_id)` pair (proves `onConflictDoNothing` against `reading_queue_pk` works as intended).
9. **Guest gating**: as a guest, click the "Read later" toggle on an article → confirm `openAuth()` opens the modal, with no error and no silent no-op.

**Regression (Phase 2):**
- Re-verify Save/unsave, reading history, and Following still work after this phase's `account-actions.ts`/`session.ts` extensions.
- Re-verify the account page's existing tab-switch behavior (saved / history / following / settings) is unaffected by the new `"read-later"` segment.

## Durable Report Target

`process/features/account/reports/phase-04-settings-read-later_REPORT_<execution-date>.md` — must include every query result from [Verification Evidence](#verification-evidence) pasted verbatim, plus errors encountered/fixed, plus the regression checkpoint result, per Phase Completion Rules.

## Blockers That Would Justify 🚧 BLOCKED

- `authClient.deleteUser({})` and/or `authClient.changeEmail(...)` turn out to require a Better-Auth "fresh session" re-authentication step that this plan's bare confirm-dialog UI does not satisfy. Brief-asia's own `auth.ts` shows no explicit freshness/re-auth config, but that has not been independently confirmed against the actual runtime behavior of the pinned `better-auth@^1.6.20` version once Phase 1 installs it. If a fresh-session error surfaces during manual testing, STOP and escalate — do not silently bolt on an unspecified re-auth step.
- The `hasPassword` signal (Touchpoint 4, option (a)) cannot be reliably determined because Better-Auth 1.6.20's credential-provider `provider_id` string differs from what Implementation Checklist step 2 assumed, or the `auth_accounts` shape doesn't support the lookup as designed — re-research the real value, do not guess a string and ship it.
- Phase 2's actual `/account/[[...tab]]/page.tsx`, `account-actions.ts`, or tab-component shapes differ materially from what this plan assumes (e.g. different component names, a different tab-rendering architecture than brief-asia's single-file `AccountTabs` pattern) — re-scope Touchpoints 3–6 against the real Phase 2 output before writing code; do not force-fit this plan's assumed file layout onto different real code.
- `reorderQueue`'s ownership-validation step (reject ids not belonging to the calling user) surfaces a legitimate multi-tab optimistic-update race that simple last-write-wins does not handle gracefully — flag as a real design question for this phase's own kickoff research rather than shipping a race-prone fix silently.

## Resume and Execution Handoff

If this phase is resumed after compaction or a long gap:

1. Read this Phase 4 plan in full, plus the umbrella plan's Phase 4 section (`reader-auth-account_UMBRELLA-PLAN_03-07-26.md`) — this plan must stay consistent with AD-1 through AD-8 there; do not relitigate those decisions here.
2. Confirm Phase 1 and Phase 2 are both `✅ VERIFIED` in the umbrella's Phase Status Table. If not, this phase cannot start — do not execute against unverified foundations.
3. Re-read the **actual, current** shape of `apps/web/src/lib/session.ts`, `apps/web/src/lib/account-actions.ts`, `apps/web/src/app/(reader)/account/[[...tab]]/page.tsx`, and `apps/web/src/components/article/article-content.tsx`. This plan was authored on 03-07-26 **before Phase 1 or Phase 2 had been executed**, so every touchpoint above that describes "Phase 2's file" is a prediction, not verified code (see [Grounding](#grounding--verification-method)). Treat any material mismatch as a signal to re-scope this plan's Touchpoints section, not to force the mismatch to fit this document.
4. Re-check `packages/db/src/schema/account.ts` and the FK constraints in `packages/db/migrations/` for drift. Unlikely (AD-7 makes schema changes additive-only, and no phase before this one is expected to touch `reading_queue`'s shape) but confirm, don't assume.
5. Confirm whether Phase 3 (`paywall-nudge`) or Phase 5 (`newsletters`) has landed in the meantime. If Phase 5 has already added its own `"newsletters"` tab segment to the same page/array, this phase's tab-list edit (Implementation Checklist step 5) must merge with that change, not silently overwrite it.
6. Never execute this phase and Phase 3 in the same session/pass even though both only depend on Phase 2 — per the umbrella's explicit rule, only one phase is "in flight" at a time.
7. On completion: update this file's Status to `✅ VERIFIED` only after every item in [Phase Completion Rules](#phase-completion-rules) is satisfied and the user has explicitly confirmed the phase works; write the durable report; update the umbrella's Phase Status Table row for Phase 4; recommend `vc-git-manager` for a logical execution commit (keeping plan/report commits separate from code commits, per the repo's commit-checkpoint convention); then recommend the next unblocked phase (Phase 3 or Phase 5, whichever the umbrella's Phase Status Table shows is not yet in flight) per the umbrella's dependency graph `1 → 2 → {3, 4}`, `1 → 5`.

## Next Step

This plan is execute-ready in structure but explicitly **not** execute-ready in verified-against-reality terms, because Phase 1 and Phase 2 have not yet run (see Grounding). The correct next action is:

1. Execute and fully verify Phase 1 (`process/features/account/active/phase-01-auth-foundation_PLAN_03-07-26.md`), then Phase 2 (`process/features/account/active/phase-02-account-data-layer_PLAN_03-07-26.md`).
2. Return to this file and run a dedicated kickoff **re-research** pass (per `process/development-protocols/phase-programs.md`'s Re-Research Rule) to reconcile this plan's Touchpoints against the real, then-current shape of Phase 1/Phase 2's output.
3. Only then request explicit **`ENTER EXECUTE MODE`** approval for this phase specifically. RIPER-5 requires this explicit confirmation — do not jump directly from this PLAN artifact to EXECUTE.
