# Reader Auth / Account / Paywall / Newsletter — Verification Report

Date: 2026-07-03 (verification run 2026-07-06)
Plan: `process/features/account/active/reader-auth-account-simple_PLAN_03-07-26.md`
Detailed specs: `process/features/account/backlog/phase-0{1..5}-*_PLAN_03-07-26.md`
Verifier: vc-tester (QA gate pass over Stage A/B/C/D execute reports)

## What Was Built (from stage reports)

**Stage A — Auth foundation**
- Better-Auth (`apps/web/src/lib/auth.ts`) on existing Drizzle `auth_*` tables via `drizzleAdapter`
- email+password (`requireEmailVerification`) + conditional Google/GitHub OAuth (env-gated both server + `NEXT_PUBLIC_*_ENABLED` client flags), no magic link, no Apple
- `apps/web/src/app/api/auth/[...all]/route.ts` (Better-Auth handler), `reset-password` page, `auth-client.ts`, `session.ts` (`getSessionUser`/`requireUser`/`roleAtLeast`)
- `email.ts` — Resend-or-console-fallback, DTW-rebranded templates
- `auth-modal.tsx` rewritten to a real signin/signup/forgot state machine
- `header.tsx` sign-out now calls `authClient.signOut()`
- RBAC hardening: `Users.ts` field-level `access.update` locks `role` to admin-only (closes a self-escalation hole)

**Stage B — Account data layer**
- `account-actions.ts` (server actions): toggleBookmark/removeBookmark/isBookmarked/recordView (dedup via `onConflictDoUpdate`)/clearHistory/toggleFollow
- `session.ts` extended: listBookmarks/listHistory/listFollows
- `payload-server.ts`: `getArticlesByIds` (cached, published-only)
- `/account` converted to a real `force-dynamic` RSC; `account-tabs.tsx` renders real Saved/History/Following with optimistic mutations
- `article-content.tsx`/`share-bar.tsx` wired for save/unsave + view recording, client-side only (article RSC's `revalidate=60` ISR cache untouched — per-user state never enters it)

**Stage C — Paywall meter + sign-in nudge**
- New Payload Global `paywallSettings.paywallThreshold` (default 3, editor/admin-editable), CLI-generated migration
- `lib/paywall.ts`: guest meter as a deduped, calendar-month (Asia/Singapore) cookie (`dtw-read-count`) — fixes the prior in-memory-only meter that reset on reload
- `getReadCountThisPeriod` (DB-side, signed-in, non-gating per spec) wired but does not block
- `header.tsx`/`article-content.tsx` unified on `articlesRead >= paywallThreshold` (previously inconsistent `>3` vs `>=3`)
- `paywall.tsx` rewritten: removed `$12/mo` "Become a member" card / `/pro` link / feature grid; single sign-in-nudge card, full `t(en, vi, id)`

**Stage D — Settings + Newsletters (single opt-in, simple-scope delta)**
- New Payload `Newsletters` collection (6 canonical products: am/pm/ai/fund/dev/prod), seeded via `seed-payload.ts`
- `settings-tab.tsx`: real changeEmail / changePassword / deleteUser, type-to-confirm + password-reauth UI (per explicit orchestrator override of the plan's bare-`window.confirm` sketch)
- Newsletter subscribe: `user_id`-keyed signed-in toggle with legacy-email-row claim-on-signup; guest `subscribeGuest` is immediate single-opt-in (no token/pending-confirmation flow, confirmed delta)
- Homepage `newsletter-cta.tsx` and `/newsletters` page wired to real data (footer's separate demo deliberately left untouched, out of scope)

## Verification Evidence (this pass)

All commands run at repo root, 2026-07-06, fresh (non-cached where noted):

- `pnpm typecheck --force` → **PASS**, clean across all 4 workspace packages (`@dtw/config`, `@dtw/db`, `@dtw/ui`, `web`), 2.5s
- `pnpm lint --force` → **PASS**. Only pre-existing warning classes: `payload-server.ts` unused-eslint-disable directive; every migration file's unused `payload`/`req` destructure params (including the 2 new migrations, same pattern). Zero new warning categories, zero errors.
- `pnpm build --force` → webpack **compiles successfully**, `Checking validity of types` **succeeds**; full completion **fails** at `Collecting page data` for `/api/auth/[...all]` with `Error: DATABASE_URL is not set`.
  - **Independently verified this is pre-existing, not a regression**: `git stash` back to the pre-stage baseline and re-ran `pnpm build --force` — baseline also fails at `Collecting page data`, same root cause (missing `DATABASE_URL`), just a different first-failing route (`/api/graphql` vs `/api/auth/[...all]`, since `/api/auth/[...all]` didn't exist pre-stage). Confirms all 4 stage reports' repeated claim is accurate. Stash popped cleanly afterward, working tree restored (confirmed via `git status`, 47 lines unchanged).
- No test suites exist in the repo (`vitest`/`playwright` configs: none found via `find`). Matches `process/context/tests/all-tests.md`'s greenfield status — no unit/e2e tests to run yet.
- Runtime smoke test: **not possible**. No `apps/web/.env.local`, no root `.env.local`, no `DATABASE_URL` anywhere, no `docker`/`pg_isready` binary, no listener on 5432. Same sandbox constraint every stage report already flagged.
- Diff-surface review (`git status`, `git diff --stat`, targeted greps):
  - `packages/db/` — **zero changes** (confirmed via `git diff --stat packages/db/`), consistent with all 4 stages' claim of no schema changes needed
  - Payload admin-surface changes limited to: `Users.ts` (legitimate RBAC field lock), new `Newsletters.ts` collection, new `PaywallSettings.ts` global, `revalidate.ts` hook additions, `payload.config.ts` registration, `payload-types.ts` regen, 2 new additive migrations (`add_paywall_settings_global`, `add_newsletters_collection`) — both migrations are additive-only (CREATE TABLE / ALTER ADD COLUMN, cascade-safe `down()`), no destructive changes
  - `grep` for hardcoded `articlesRead > 3` / `articlesRead >= 3` / `"3 free articles"` → **zero matches**; both `header.tsx` and `article-content.tsx` correctly use `paywallThreshold` from `useShell()`
  - `grep` for `$12/mo` / "Become a member" / `/pro` in `paywall.tsx` → **zero matches**, confirmed removed
  - `grep` for hardcoded `rgba(...)` in changed files → only pre-existing occurrences in `newsletter-cta.tsx` / `newsletters-content.tsx`, all inside a section with a fixed `background: var(--banner)` (deep navy in both themes per invariant #7) — not a new dark-mode violation, this pattern predates the stage's diff (confirmed line-by-line: same literals appear on both `-` and `+` sides of the diff, just relocated)
  - Spot-checked `settings-tab.tsx` (new, largest new UI surface) — full `t(en, vi, id)` coverage on every user-facing string; only untranslated text is Better-Auth's own `error.message` fallback (external API string, reasonable known limitation, not a missed `t()` call)
  - `article-content.tsx` diff reviewed line-by-line — minimal, surgical, matches Stage B/C claims exactly, no accidental deletions
  - `header.tsx` diff reviewed line-by-line — both sign-out call sites correctly switched to `authClient.signOut()`, nudge threshold correctly parameterized
  - No leftover mock/fixture imports found in migrated surfaces (`NEWSLETTERS` grep hit in `newsletters/page.tsx` is a doc-comment only, not a live import)
  - `pin_to_latest`/`getPinnedLatest` logic (prior branch work) untouched — only a doc-comment cross-reference added

## Deferred / Explicitly Out of Scope (per approved simple-scope deltas)

- **Magic link** sign-in — not implemented (email+password + OAuth only)
- **Apple OAuth** — not wired (env vars exist in `.env.example` from before, unused)
- **Double opt-in newsletter confirmation** — guest subscribe is immediate single opt-in; no `pending_newsletter_confirmations` table/token flow
- **Read-later tab** — not built as a separate tab (Saved tab covers the equivalent)
- **Guest→signed-in cart/meter merge** beyond the cookie-clear-on-signin behavior already implemented (D5) — no explicit "transfer guest reading history into account" flow
- **2FA** — not implemented for Editor/Admin roles in this pass (invariant #… note in context flags 2FA as required "in production" for CMS roles; this pass did not add it)
- **Session-loading flash fix** (`isSessionPending` threading in shell.tsx) — explicitly optional per backlog, not done; header may flash "Log in" before session resolves on first paint

## Known Limitations

- Google/GitHub-only accounts (no password) get a graceful error message on Settings' changePassword/deleteUser rather than a dedicated alternate flow (documented inline, by design for this pass)
- `getArticlesByIds`'s Payload `id:{in:string[]}` query against a numeric `id` column is ported verbatim from `brief-asia-web`'s identical, already-in-production pattern — not yet verified against **dtw's own** live DB (flagged specifically: if the first real `/account` load with saved articles shows an empty Saved tab despite bookmark rows existing, check this first)
- Every DB-backed and `/admin`-backed manual test across all 4 stages is implemented but **unexecuted and unverified** — no `DATABASE_URL`, no local Postgres, no docker in every sandbox that touched this plan (confirmed again in this verification pass)
- Context Doc Reconciliation (`process/context/auth/all-auth.md`, `process/features/account/_GUIDE.md`, `process/features/articles/_GUIDE.md`, `process/features/newsletters/_GUIDE.md`) — **not yet done**; explicitly deferred to end-of-all-4-stages closeout, which has now arrived. Recommend running this next.
- `apps/web/src/lib/data.ts`'s `NEWSLETTERS` fixture is now dead code (unused by any migrated surface) but was deliberately not deleted this pass — safe cleanup needs a full-repo grep confirming zero remaining references first

## Manual Test Checklist (requires a real Postgres + `.env.local`)

Consolidated from all 4 stage reports' `manual_test_steps`. Run in this rough order after `pnpm --filter web payload:migrate && pnpm db:seed`:

1. **Auth roundtrip**: signup → single verify-email send → reject unverified sign-in → click verify link → session established → confirm `role='reader'`, `email_verified=true` in `auth_users`
2. **Forgot/reset**: anti-enumeration copy identical for existing/non-existing email; reset link works once, rejected on reuse
3. **OAuth** (if `NEXT_PUBLIC_GOOGLE_ENABLED`/`GITHUB` + real creds set): button renders only when enabled; completes roundtrip; `auth_accounts` row created
4. **Sign-out**: desktop dropdown + mobile menu both clear the Better-Auth session cookie
5. **RBAC**: author-role user direct-PATCH `role: "admin"` on own record → rejected, stays `author`
6. **Bookmarks**: save persists across reload (`bookmarks` row exists); Saved tab shows real article; Remove deletes the row without full reload
7. **Reading history**: re-reading same article doesn't duplicate rows (`onConflictDoUpdate` dedup); Clear history empties the tab
8. **Follows**: follow a pillar → row in `follows`; renaming a pillar in `/admin` updates the Following tab's list within the cache window
9. **Guest gating**: `/account` as guest → inline sign-in prompt, HTTP 200 no redirect; guest Save → opens auth modal, no console error
10. **ISR non-leakage**: User A's saved state must not leak to a signed-out session loading the same article within the 60s ISR window
11. **Paywall meter**: guest cookie (`dtw-read-count`) persists across reload, dedups re-reads, trips nudge+paywall at the CMS-configured threshold simultaneously; changing threshold in `/admin` takes effect on next guest visit; sign-in clears the guest cookie; signed-in readers never see the nudge
12. **Fail-open**: rename `paywall_settings` table → site falls back to threshold 3, no 500
13. **Newsletters**: guest subscribe creates an immediate `confirmed_at` row (`user_id NULL`); signed-in toggle claims a matching legacy guest row onto the account (`user_id` populated, still exactly 1 row) — this is the specific regression-fix to verify first
14. **Settings**: change password (old password fails after, other sessions revoked); change email (verification goes to new address only, old address still active until clicked); delete account — confirm cascade deletes bookmarks/follows/reading_history/sessions/accounts but **newsletter_subscriptions row survives with `user_id NULL`**
15. **OAuth-only account**: changePassword/deleteUser without a password on a Google/GitHub-only account → graceful message, no crash
16. **i18n**: spot-check vi/id rendering on Settings, Newsletters tab, `/newsletters`, paywall card, delete-confirmation copy
17. **Regression**: re-run Stage A/B/C flows after Stage D's edits to shared files (`account-tabs.tsx`, `page.tsx`)

## Blockers for Full "Verified" Status

- No `DATABASE_URL`/local Postgres/docker in every sandbox this plan has touched (Stage A through this verification pass) — **all DB-backed behavior is implemented but not yet proven at runtime**. This is a repeated, consistent constraint, not a new one.
- `pnpm build` cannot reach full completion without a real `DATABASE_URL` (pre-existing constraint, confirmed via stash-and-rebuild — not something these stages need to fix)
- Recommend: run the manual checklist above against a real Postgres instance before promoting this plan out of `active/`

## Gate Summary

| Gate | Result |
|---|---|
| `pnpm typecheck` | PASS (fresh, non-cached) |
| `pnpm lint` | PASS (only pre-existing warning classes) |
| `pnpm build` | Compiles + typechecks; fails at page-data collection due to missing `DATABASE_URL` — confirmed pre-existing via baseline stash-test, not a regression |
| Unit/e2e tests | None exist in repo (greenfield, confirmed via `all-tests.md` + `find`) |
| Runtime smoke (`/`, `/account`, `/api/auth/...`) | Not possible — no DB, no docker in this sandbox |
| Diff red-flag scan | Clean — no accidental deletions, no non-additive `packages/db` changes, no leftover hardcoded `3`/`$12/mo`, no new dark-mode rgba violations, no missing `t()` on new strings |

## Unresolved Questions

- Should Context Doc Reconciliation (auth/account/articles/newsletters `_GUIDE.md` + `all-auth.md`) be run now as part of this closeout, or does the user want to review this report first?
- Is a `vc-git-manager` commit-split pass wanted before this plan moves out of `active/`? Worktree currently has 21 modified + 25 new files uncommitted.
- Should `apps/web/src/lib/data.ts`'s now-dead `NEWSLETTERS` fixture be cleaned up in this closeout or deferred further?
