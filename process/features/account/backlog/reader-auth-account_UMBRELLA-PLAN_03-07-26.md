# Reader Auth, Account & Paywall — Umbrella Orchestration Plan

**Date**: 03-07-26
**Complexity**: Complex — **Phase Program** (5 dependent phases, each with its own research → execute → validate loop, per `process/development-protocols/phase-programs.md`)
**Feature**: `account` (cross-cutting into `auth`, `articles`, `newsletters` context/feature surfaces)
**Status**: ⏳ PLANNED (program not started — this umbrella plan plus all 5 phase plans now exist in `active/`; no code has been touched yet)

## Quick Links

- [Program Overview](#program-overview)
- [Grounding & Verification Method](#grounding--verification-method)
- [Phase Completion Rules](#phase-completion-rules)
- [Acceptance Criteria](#acceptance-criteria)
- [Phased Delivery Plan](#phased-delivery-plan)
- [Architecture Decisions (Final)](#architecture-decisions-final)
- [Global Conventions Every Phase Must Follow](#global-conventions-every-phase-must-follow)
- [Global Public Contracts](#global-public-contracts)
- [Global Blast Radius](#global-blast-radius)
- [Foundation vs. Expansion Boundary](#foundation-vs-expansion-boundary-deferred-work)
- [Phase Status Table](#phase-status-table)
- [The Mandatory Per-Phase Loop](#the-mandatory-per-phase-loop-reminder)
- [Phase 1 — Auth Foundation](#phase-1--auth-foundation)
- [Phase 2 — Account Data Layer](#phase-2--account-data-layer)
- [Phase 3 — Paywall Meter + Sign-In Nudge Compliance](#phase-3--paywall-meter--sign-in-nudge-compliance)
- [Phase 4 — Settings, Account Deletion, Read-Later Queue](#phase-4--settings-account-deletion-read-later-queue)
- [Phase 5 — Newsletters (CMS Collection + Double Opt-In)](#phase-5--newsletters-cms-collection--double-opt-in)
- [Known Bugs to NOT Port (Cross-Phase Checklist)](#known-bugs-to-not-port-cross-phase-checklist)
- [Program-Wide Risks](#program-wide-risks)
- [Context Doc Reconciliation Needed](#context-doc-reconciliation-needed)
- [Program Closeout Criteria](#program-closeout-criteria)
- [Resume and Execution Handoff](#resume-and-execution-handoff-program-wide)
- [Rules for This Project (Cheat Sheet)](#rules-for-this-project-cheat-sheet)
- [Next Step](#next-step)

---

## Program Overview

Port a working, previously-shipped auth/account/reading stack from the sibling repo `/home/hieunc/Code/brief-asia-web` into `/home/hieunc/Code/dtw-web`, replacing dtw-web's current client-side **stubs** (fake in-memory login, mock account tabs, hardcoded paywall threshold) with real, server-verified functionality — while fixing the spec deviations dtw requires that brief-asia does not have (magic-link-primary auth, CMS-configurable paywall threshold, double opt-in newsletters) and deliberately **not** porting brief-asia's known bugs.

dtw-web's database layer is already fully prepared for this: `packages/db/src/schema/auth.ts` and `packages/db/src/schema/account.ts` already define Better-Auth-shaped tables and reader-data tables, migrated (`packages/db/migrations/0000_third_ender_wiggin.sql`), but **zero runtime code reads or writes them today** (`@dtw/db` is imported by nothing in `apps/web/src`). `better-auth` is not installed. The auth-modal, account page, and paywall UI are polished but entirely fake (`demoLogin()`, in-memory `ShellProvider` state, mock fixtures from `apps/web/src/lib/data.ts`). This program wires the real thing behind the existing UI shells wherever possible, and rebuilds the UI where the current stub materially conflicts with an invariant (the paywall card in particular).

Editorial `/admin` auth (Payload's own `users` collection) is explicitly **not** touched by this program except one narrow RBAC hardening item noted in Phase 1. The two user stores (`auth_users` for readers, Payload `users` for editorial) stay fully disjoint for the life of this program — this is a deliberate, documented design in both sibling repos, not a gap to close here.

**Program goal:** a reader can sign up/in via magic link, email+password, or Google/GitHub OAuth; see a real session everywhere `useShell().user` is read; save/read-later/follow/view-history articles that persist across devices; hit a CMS-configurable soft paywall nudge instead of the current hardcoded-3 stub; manage settings and delete their account (GDPR/PDPA); and opt into newsletters with double opt-in as a guest or one click as a signed-in reader. Editorial `/admin`, Pro billing, PostHog, and PWA/IndexedDB sync beyond the login-time merge are explicitly out of scope (see [Foundation vs. Expansion](#foundation-vs-expansion-boundary-deferred-work)).

---

## Acceptance Criteria

Program-wide, testable criteria for this 5-phase effort. Each phase's own **Validation Gates**
(in its section below) are the granular, phase-level acceptance criteria; these are the roll-up:

- [ ] A reader can sign up and sign in via magic link, email+password, and Google/GitHub OAuth, and sign out — with a real, server-verified session (Phase 1).
- [ ] `useShell().user` reflects a real Better-Auth session everywhere it is read; no code path still calls the old fake `setUser()` demo login (Phase 1).
- [ ] Saved articles, reading history, and pillar follows persist server-side and survive a page reload / different device (Phase 2).
- [ ] The paywall nudge and paywall card trip at a single, CMS-configurable threshold (no hardcoded `3`, no `>=`/`>` inconsistency), editable in `/admin` without a deploy (Phase 3, closes invariant #4).
- [ ] A reader can change their email, change their password (if they have one), and delete their account with correct cascade behavior; the read-later queue works with no length limit (Phase 4).
- [ ] Guests double-opt-in to newsletters via a confirmation email; signed-in readers toggle instantly; changing account email does not orphan a subscription (Phase 5).
- [ ] None of the five known brief-asia bugs listed in [Known Bugs to NOT Port](#known-bugs-to-not-port-cross-phase-checklist) are present in the shipped code.
- [ ] All 5 phase reports exist in `process/features/account/reports/` with real DB-query evidence, not just "build succeeded."
- [ ] The two stale context docs identified in [Context Doc Reconciliation Needed](#context-doc-reconciliation-needed) have been corrected.

## Grounding & Verification Method

This umbrella plan was written after reading `process/context/all-context.md` (root router) and `process/context/tests/all-tests.md` (confirms no test runner is installed yet — see below), per the repo's context-routing discipline. It is grounded in a completed RESEARCH pass captured at `/tmp/claude-1000/-home-hieunc-Code-dtw-web/df9bb8b7-b07b-40a7-9091-a7506dd1880f/scratchpad/research-port-map.json` (`synthesis` + `research.briefAuth` + `research.briefUsers` + `research.briefReading` + `research.dtwState`). Every file path, table name, and behavior cited below was spot-verified against the real filesystem during this PLAN pass (not merely copied from the research JSON):

- All 22 `brief-asia-web` source files cited by the research (`src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/app/api/auth/[...all]/route.ts`, `src/db/schema/{auth,account}.ts`, `src/lib/{account,account-actions,email,shell}.ts(x)`, `src/components/auth-modal.tsx`, `src/components/account/account-tabs.tsx`, `src/app/(reader)/[locale]/{account/[[...tab]],reset-password}/page.tsx`, `src/payload/collections/{Users,Newsletters}.ts`, `src/middleware.ts`, `src/components/article/{paywall,article-content}.tsx`, `src/lib/payload-server.ts`, `src/app/preview/route.ts`, `.env.example`, `src/db/migrations/0000_third_ender_wiggin.sql`) — confirmed present via `test -f`.
- All 13 cited `dtw-web` target files/dirs — confirmed present via `test -e`. Confirmed `better-auth` is **absent** from `apps/web/package.json` (grep returned nothing). Confirmed `apps/web/.env.example` does not exist but the repo-root `.env.example` does, and it already reserves `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID/SECRET`, `APPLE_CLIENT_ID/TEAM_ID/KEY_ID/PRIVATE_KEY`, `GITHUB_CLIENT_ID/SECRET`, `RESEND_API_KEY`, `RESEND_FROM_DOMAIN="dailytechwire.com"`, `PAYLOAD_SECRET`.
- Read `packages/db/src/schema/auth.ts` in full (120 lines) and `packages/db/src/schema/account.ts` in full — confirmed the exact column shapes cited below, including that `auth_accounts.password` already exists (comment: *"for the email/password fallback flow if we ever enable it"*) — **zero schema migration is needed to enable email+password in Phase 1.**
- Read `apps/web/src/lib/shell.tsx`, `apps/web/src/components/auth-modal.tsx`, `apps/web/src/components/article/paywall.tsx`, `apps/web/src/app/(reader)/layout.tsx`, `apps/web/src/payload/collections/Users.ts`, `apps/web/src/payload/hooks/revalidate.ts`, `apps/web/payload.config.ts` in full to confirm exact current behavior (hardcoded thresholds, provider order, hook conventions).
- Confirmed via `grep`: `articlesRead >= 3` in `header.tsx` line 49 vs. `articlesRead > 3` in `article-content.tsx` line 27 (the `>=`/`>` inconsistency cited by the research is real).
- Confirmed no `globals` key exists yet in `payload.config.ts`, `push: false`, `migrationDir: src/payload/migrations`, and the exact migration file naming convention (`YYYYMMDD_HHMMSS_description.{ts,json}`) from the 5 migrations already present.
- Confirmed `scripts/migrate-prod.mjs` runs `drizzle-kit migrate` then `payload:migrate`, gated to `VERCEL_ENV=production` only — preview builds do **not** get new columns/globals, so every new query must fail open (mirrors `getPinnedLatest`'s try/catch pattern, per invariant risk below).
- Confirmed via `process/context/tests/all-tests.md` and `grep` that **no test runner is installed yet** (`vitest` absent from every `package.json`, zero `*.test.ts*` files exist anywhere in the repo). Validation gates below are therefore typecheck/lint/build + manual/DB verification, not automated test suites, until a test scaffold lands (tracked as a known gap, not blocking this program).
- The reference doc `process/features/account/references/brief-asia-port-map_REFERENCE_03-07-26.md` named in the routing brief for this program **now exists on disk** and captures the same `synthesis`/`research` content this umbrella cites from the scratchpad JSON directly. All 5 phase plans in `active/` cite it as their primary durable research reference (scratchpad path retained as a secondary/original-source note) — see the [Phase Status Table](#phase-status-table).

---

## Phase Completion Rules

A phase is NOT complete until:

1. **Integration Test** — Works with other system pieces end-to-end.
2. **Manual Test** — A human (or an equivalent scripted flow) can actually perform the action.
3. **Data Verification** — Database/state changes confirmed by an actual query, not by code inspection.
4. **Error Handling** — Failure cases (missing env var, mail outage, unverified email, duplicate token) are handled gracefully, not just the happy path.
5. **User Confirmation** — The plan owner (user) explicitly confirms the phase works, not just that the agent believes it does.

Status meanings used throughout this plan set:

| Marker | Meaning |
|---|---|
| ⏳ PLANNED | Not started |
| 🔨 CODE DONE | Written but not end-to-end tested |
| 🧪 TESTING | Currently being tested |
| ✅ VERIFIED | Tested AND confirmed working (phase gates **and** regression checks both pass) |
| 🚧 BLOCKED | Has issues preventing completion |

After each phase, its report (`process/features/account/reports/`) must document:

- [ ] What was tested manually (exact steps)
- [ ] Data verified in DB (show the query + result)
- [ ] Errors encountered and fixed
- [ ] Regression checks against prior phases (per `phase-programs.md` Regression Checkpoint Standard)
- [ ] User confirmation received

---

## Architecture Decisions (Final)

These are the user-confirmed decisions this program is built on. They are **not open for relitigation** by any phase plan or execute pass — deviating from them requires stopping and returning to this umbrella plan, not silently reinterpreting it.

### AD-1 — Auth methods: magic link + email/password + OAuth (Google/GitHub live, Apple gated off)

- **Decision:** Support three auth methods simultaneously: (a) magic link (primary CTA, matches dtw's existing auth-modal design and `process/context/auth/all-auth.md`), (b) email + password (ported from brief-asia, including forgot/reset-password via Resend), (c) OAuth — Google and GitHub live in Phase 1, Apple registered but **env-gated OFF** via the same conditional-provider pattern brief-asia uses for Google (`Boolean(CLIENT_ID && CLIENT_SECRET)` → only register the provider when both are set).
- **Rationale:** dtw's spec and existing `auth-modal.tsx` UI are magic-link-primary; brief-asia's only proven, working method is email+password. Combining both gives the fastest path to a real, tested auth system without discarding either repo's proven code. Apple requires JWT client-secret generation from `APPLE_TEAM_ID`/`APPLE_KEY_ID`/`APPLE_PRIVATE_KEY` and a `form_post` redirect — materially harder than Google/GitHub (flagged as its own risk in `research-port-map.json`); shipping it OFF-by-default with the credentials wired in `.env.example` already (`APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`) means the env vars are ready ahead of time, but enabling Apple is **not** a zero-code flip: Phase 1 deliberately leaves the `apple` provider unregistered in `socialProviders` (see Phase 1's Micro-Decision 5), so enabling Apple later requires a small code change — registering the `apple` provider block in `auth.ts` with its JWT client-secret shape verified against the installed `better-auth` types — in addition to setting the env vars; that code change is out of scope for this program.
- **Implication:** `apps/web/src/lib/auth.ts` registers `emailAndPassword` (ported from brief-asia's `src/lib/auth.ts`, `requireEmailVerification: true`) **and** the `magicLink` plugin (net-new — brief-asia has zero magic-link code despite dormant schema comments) **and** `socialProviders` with `googleConfigured`/`githubConfigured`/`appleConfigured` boolean gates. `auth-modal.tsx` needs a real mode state machine (signin / signup / forgot / magic-link), not just wiring — the current stub is magic-link-shaped only, with no password fields.

### AD-2 — Paywall threshold source: Payload Global, never PostHog, never hardcoded

- **Decision:** The paywall meter threshold (currently hardcoded `3` in two places, with a `>=`/`>` inconsistency) is read from a **Payload Global** (e.g. `paywallThreshold` on a new `PaywallSettings` global), cache-busted via `revalidateTag` following the exact pattern in `apps/web/src/payload/hooks/revalidate.ts`.
- **Rationale:** This resolves a real, verified spec conflict: `process/context/auth/all-auth.md` says paywall logic lives in `articles/_GUIDE.md`; `process/features/articles/_GUIDE.md` says the threshold comes from a **PostHog feature flag** `paywall_meter_threshold`. PostHog is not deployed anywhere in this repo (self-hosted, Phase-2-ish infra per `process/context/infra/all-infra.md`), so building Phase 3 against it would add undeployed infra as a hard dependency for a Phase-1-required invariant fix. A Payload Global needs zero new infrastructure, fits the exact `unstable_cache` + `revalidateTag` discipline already proven for Pillars/Articles, and is trivially editable by an Editor/Admin in `/admin` without a deploy.
- **Implication:** Both `process/context/auth/all-auth.md` (silent on this) and `process/features/articles/_GUIDE.md` (explicitly says PostHog) are now stale on this point and must be corrected once Phase 3 lands — see [Context Doc Reconciliation Needed](#context-doc-reconciliation-needed). PostHog can still become an *override* layer later; it is not required for Phase 3 to close invariant #4.

### AD-3 — Plans only for now; each phase requires its own EXECUTE approval

- **Decision:** This umbrella session produced **only** this umbrella plan; at that time no phase plan file existed. Per this decision, no phase plan may be created without its own dedicated PLAN pass (with fresh RESEARCH first, per `phase-programs.md`'s Re-Research Rule — code drift between this umbrella's grounding and each phase's actual kickoff is expected and must be re-verified, not assumed from this document). **Update:** all 5 phase plans have since been produced via their own dedicated PLAN passes (see the [Phase Status Table](#phase-status-table)) — this satisfies AD-3, it does not relax it; each phase plan still requires its own explicit `ENTER EXECUTE MODE` approval before implementation begins.
- **Rationale:** User-explicit; also matches the phase-program discipline in `process/development-protocols/phase-programs.md` (large programs must re-research at phase entry; do not hand EXECUTE a whole program at once).
- **Implication:** The per-phase sections below (touchpoints, gates, blast radius) were written at execute-ready depth to ground each phase's dedicated PLAN pass. Each phase's own plan file in `active/` (see the [Phase Status Table](#phase-status-table)) is now the authoritative execute-ready spec for that phase and takes precedence over this umbrella section on any point of detail — neither this umbrella section nor any phase plan file is a pre-approved EXECUTE spec on its own; each phase still requires its own `ENTER EXECUTE MODE` approval. Every phase plan file must still pass `node .claude/skills/vc-generate-plan/scripts/validate-plan-artifact.mjs <path>` before EXECUTE.

### AD-4 — Auth/transactional emails are English-only at launch

- **Decision:** Resend email bodies (verification, password reset, change-email confirmation, magic-link, newsletter double opt-in confirmation) are sent in English only. All surrounding UI chrome (the "Check your inbox" screen, the modal, the confirm-page copy, error toasts) still goes through the existing `t(en, vi, id)` triple pattern (`useT()` from `apps/web/src/lib/i18n.tsx`).
- **Rationale:** User-explicit; brief-asia also ships English-only email bodies (its `actionEmail()` template has no locale parameter). Building an i18n mechanism for transactional email bodies is real, separable scope.
- **Implication:** Tracked as an explicit follow-up in [Foundation vs. Expansion](#foundation-vs-expansion-boundary-deferred-work). `apps/web/src/lib/email.ts`'s `actionEmail()` template (ported from brief-asia) takes no locale argument by design in this program.

### AD-5 — Better-Auth reader identities stay fully disjoint from Payload editorial `users`

- **Decision:** No reconciliation between `auth_users` (readers) and Payload `users` (editorial) in any of these 5 phases. `/admin` reconciliation and mandatory 2FA for Editor/Admin are explicitly deferred, matching both repos' own documented intent.
- **Rationale:** User-explicit; both `apps/web/src/payload/collections/Users.ts`'s header comment and `brief-asia-web`'s equivalent file independently document this as the deliberate, current-state design, with reconciliation as explicit future work neither repo has implemented.
- **Implication:** The `two_factor_secret`/`two_factor_enabled` columns on `auth_users` stay dormant (no code path touches them in this program — they would protect the wrong accounts, since editors authenticate via Payload, which has no 2FA). Do not add a `twoFactor` Better-Auth plugin in this program.

### AD-6 — No `middleware.ts` in Phase 1: per-page + per-action enforcement

- **Decision:** Enforcement is per-page (`getSessionUser()` in the relevant RSC, inline sign-in prompt — no redirect) and per-action (`requireUser()` throwing inside every server action that mutates reader data) — the exact brief-asia pattern. No `apps/web/src/middleware.ts` is created in this program.
- **Rationale:** User-explicit; matches brief-asia's proven, deployed pattern. `process/context/auth/all-auth.md` currently documents a *planned* middleware (`/account` needs session, `/admin` needs author+, paywall never 401s) — that plan is explicitly **not** executed by this program. dtw's i18n is still client-side `localStorage`, not subpath routing, so there is no i18n middleware to piggyback session checks onto, and a session-checking middleware adds edge-runtime + CDN-cacheability complexity for zero Phase-1 benefit (see the ISR/caching risk below).
- **Implication:** `all-auth.md`'s middleware section is stale after Phase 1 lands and must be corrected — see [Context Doc Reconciliation Needed](#context-doc-reconciliation-needed). `/admin` continues to be protected purely by Payload's own auth (unchanged, untouched by this program).

### AD-7 — `packages/db` is shared with `dtw-engine`: additive-only schema changes

- **Decision:** Any new Drizzle table or column goes through `pnpm db:generate` with the generated SQL committed to `packages/db/migrations/`, and is additive-only (no renames, no drops, no changing existing enum values). Better-Auth **runtime config** (the `betterAuth({...})` call, plugin list, provider registration) lives in `apps/web/src/lib/auth.ts` (app-owned); **only Drizzle table definitions** live in `@dtw/db` (`packages/db/src/schema/auth.ts`, `packages/db/src/schema/account.ts`).
- **Rationale:** User-explicit; `dtw-engine` is a separate repo that shares this same `packages/db` schema view — an unexpected rename or removed column silently breaks a repo this program cannot see or test against.
- **Implication:** As verified during grounding, **Phases 1, 2, and 4 require zero Drizzle schema changes** — every table they need (`auth_users`, `auth_sessions`, `auth_accounts`, `auth_verifications`, `bookmarks`, `reading_queue`, `reading_history`, `follows`) already exists and already matches the Better-Auth adapter shape and brief-asia's table shapes closely enough to reuse as-is. **Phase 5 also requires zero Drizzle schema changes** (`newsletter_subscriptions` already has a nullable `user_id` FK — exactly what AD-8 below needs — and `pending_newsletter_confirmations` already has the `newsletter_ids` text-array column brief-asia left dead). **Only Phase 3** touches schema-adjacent state, and it does so via a **Payload Global** (Payload's own migration system, `apps/web/src/payload/migrations/`), not Drizzle — keep these two migration systems strictly separate per the risk noted below.

### AD-8 — Do not port brief-asia's five known bugs

Each is mapped to the phase where the equivalent surface is touched, with the explicit fix:

| # | Bug in brief-asia-web | Where it would resurface here | Fix mandated by this plan |
|---|---|---|---|
| 1 | `googleEnabled = true` hardcoded in `auth-modal.tsx`; the `NEXT_PUBLIC_GOOGLE_ENABLED` env check is commented out — button renders even with no server-side provider configured | Phase 1 auth-modal | Gate every OAuth provider button on a `NEXT_PUBLIC_*_ENABLED` env var that mirrors the server-side `*Configured` boolean; never hardcode `true` |
| 2 | Signup sends two verification emails: `emailVerification.sendOnSignUp: true` fires server-side, AND the modal explicitly calls `authClient.sendVerificationEmail()` again | Phase 1 signup flow | Rely on `sendOnSignUp` only; do not add a redundant explicit `sendVerificationEmail()` call after `signUp.email()` |
| 3 | `newsletter_subscriptions` keyed on email only — `changeEmail` silently orphans subscriptions tied to the old address | Phase 5 newsletter toggles | Key on `user_id` when a session exists (the column already exists and is nullable-FK'd for exactly this); only fall back to email-keying for guest (pre-confirmation) rows |
| 4 | Payload `Users` collection: `read = any logged-in user`, `update = admin-or-self` with **no field-level access on `role`** — an author can self-escalate to admin via their own update | dtw's `apps/web/src/payload/collections/Users.ts` already has this exact latent weakness today (not something brief-asia introduces — dtw's own pre-existing code shares the bug) | Phase 1 adds field-level `access` on the `role` field (admin-only write) as a small, low-blast-radius hardening item, since Phase 1 is already the phase touching adjacent session/RBAC surface |
| 5 | `article_views` counted per page-load with no dedupe, inflating "Most Read" on refresh | Would resurface if Phase 2 ported brief-asia's `recordArticleView`/`article_views` table | Phase 2 explicitly does **not** port `article_views` or `recordArticleView` — dtw's own `reading_history` upsert (keyed on `userId`+`articleId`, unique index `reading_history_pk`) is the only view-tracking surface in this program, and it is a real per-user dedupe by construction. Broader "Most Read" analytics is explicitly deferred to the PostHog era. |

---

## Global Conventions Every Phase Must Follow

These are repo-wide conventions already proven in `dtw-web`'s existing code, verified during grounding. Every phase's touchpoints must conform:

1. **`unstable_cache` + `revalidateTag` discipline** (`apps/web/src/lib/payload-server.ts` + `apps/web/src/payload/hooks/revalidate.ts`): any new *shared, non-per-user* Payload-backed read (e.g. the Phase 3 paywall threshold, the Phase 5 newsletters list) must be wrapped in `unstable_cache` with an explicit tag, busted by that collection/global's `afterChange` hook using the existing `bust()` helper pattern. Per-user reads (bookmarks, session, reading history) must **never** be wrapped in `unstable_cache` and must stay in client components (`useShell()`) or explicitly `force-dynamic` server components/actions.
2. **`server-only` import guard**: `payload-server.ts` and (per AD-7) `packages/db/src/client.ts` both throw at import time without their required env var. Every new module that imports `@dtw/db/client` or reads session server-side (`apps/web/src/lib/session.ts`, `apps/web/src/lib/account-actions.ts`) must start with `import "server-only"` so a stray client-bundle import fails at build time, not at runtime.
3. **i18n triple pattern**: every new user-facing string uses `useT()`'s `t(en, vi, id)` triple (`apps/web/src/lib/i18n.tsx`), exactly as `auth-modal.tsx` and `header.tsx` already do. Auth/transactional **email bodies** are the one explicit exception (AD-4).
4. **Styling**: inline style objects reading CSS custom properties (`var(--ink)`, `var(--paper)`, `var(--surface)`, `var(--accent)`, etc., defined in `apps/web/src/app/globals.css`) — never hardcoded `rgba(...)`. This is a real dark-mode bug class the design system already hit once.
5. **Role-case handling**: Drizzle's `role` enum is lowercase (`reader`/`pro`/`author`/`editor`/`admin`); `ShellProvider`'s `User.role` union is Capitalized (`"Reader"|"Pro"|"Author"|"Editor"|"Admin"`); Payload's `users.role` select is a separate lowercase 3-value enum (`author`/`editor`/`admin`). Phase 1's `toShellUser` bridge is the **only** place that should perform this capitalization. Any later phase that needs to compare roles must import a single shared helper (recommend adding `roleAtLeast(role, min)` to `apps/web/src/lib/session.ts` in Phase 1) rather than re-deriving string comparisons — this directly prevents the silent-failure class of bug the research flags.
6. **Fail-open column/global guard**: because `scripts/migrate-prod.mjs` only runs on `VERCEL_ENV=production`, preview builds render against a schema that may be missing a just-added column or Payload Global. Any new query on newly-migrated state must follow the exact try/catch/`console.warn`/return-safe-default pattern already used by `getPinnedLatest` and `getBreakingArticles` in `payload-server.ts`.
7. **Locale-safe callback URLs**: dtw has no subpath locale routing yet, so plain paths (`/`, `/account`) are correct today — but do not hardcode `/en` anywhere (brief-asia's documented gotcha). If a callback/redirect helper is introduced, centralize it in one function (e.g. `authCallbackUrl(path)`) so future `/en /id /vi` migration is a one-line change, not a grep-and-replace.
8. **Never call session/cookie reads inside a cached RSC.** Article pages (`apps/web/src/app/(reader)/article/[slug]/page.tsx`) currently have `revalidate = 60`. Reading `cookies()` or `getSessionUser()` inside that RSC would silently force it fully dynamic or bake one user's state into the shared ISR cache. Per-user state must be read client-side (`useShell()`) or in an explicitly `force-dynamic` route (`/account`).

---

## Global Public Contracts

Consolidated so every phase plan can be checked against the same source of truth. A phase plan MUST NOT introduce a contract that conflicts with this table without updating it here first.

### Environment variables (already reserved in root `.env.example`; no new var names needed for Phases 1, 2, 4, 5)

| Var | Used by | Phase |
|---|---|---|
| `DATABASE_URL`, `DATABASE_DIRECT_URL` | `@dtw/db/client`, all phases | all |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` | `apps/web/src/lib/auth.ts` | 1 |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth (live) | 1 |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | GitHub OAuth (live) | 1 |
| `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` | Apple OAuth (registered, gated OFF) | 1 |
| `RESEND_API_KEY`, `RESEND_FROM_DOMAIN` (already `"dailytechwire.com"`) | `apps/web/src/lib/email.ts` | 1, 5 |
| `PAYLOAD_SECRET` | Payload (unchanged) | — |
| *(new, Phase 1)* `NEXT_PUBLIC_GOOGLE_ENABLED`, `NEXT_PUBLIC_GITHUB_ENABLED`, `NEXT_PUBLIC_APPLE_ENABLED` | client-side button gating, mirrors server `*Configured` booleans | 1 |

No env var is renamed or removed by this program.

### Database tables read/written (all already exist — see AD-7)

| Table | Owner | Phase(s) that read/write it |
|---|---|---|
| `auth_users`, `auth_sessions`, `auth_accounts`, `auth_verifications` | Drizzle (`packages/db/src/schema/auth.ts`) | 1 (write via Better-Auth adapter), all (session read) |
| `bookmarks` | Drizzle (`account.ts`) | 2 |
| `reading_history` | Drizzle (`account.ts`) | 2 |
| `follows` | Drizzle (`account.ts`) | 2 |
| `reading_queue` | Drizzle (`account.ts`) | 4 |
| `newsletter_subscriptions` | Drizzle (`account.ts`) | 5 |
| `pending_newsletter_confirmations` | Drizzle (`account.ts`) | 5 |
| `users` (Payload editorial) | Payload | untouched except the AD-8 #4 field-access hardening in Phase 1 |
| *(new, Phase 3)* Payload Global `paywallThreshold` | Payload (own migration system, `apps/web/src/payload/migrations/`) | 3 |
| *(new, Phase 5)* Payload collection `newsletters` | Payload | 5 |

### Cookies

| Cookie | Set by | Phase | Notes |
|---|---|---|---|
| Better-Auth session cookie (`nextCookies()` plugin, name is Better-Auth's default) | `apps/web/src/lib/auth.ts` | 1 | `nextCookies()` must be **last** in the plugin chain — verified in brief-asia's source comment; magic-link plugin insertion is the likely regression point to watch |
| `dtw-nudge-dismissed` (existing) | `header.tsx` | unchanged | localStorage, not a cookie — naming is legacy, do not "fix" casually mid-program |
| `dtw-read-count` (new, Phase 3) | client-side only (ShellProvider) | 3 | Guest meter; exact mechanics (dedup by id vs. count, monthly reset semantics) are **not locked** — flagged for Phase 3 kickoff research, see Phase 3 section |

### Routes

| Route | Phase | Notes |
|---|---|---|
| `apps/web/src/app/api/auth/[...all]/route.ts` | 1 (new) | `toNextJsHandler(auth)`, `export const dynamic = "force-dynamic"` |
| `/account/[[...tab]]` (existing page, converted RSC) | 2 | tabs: saved, history, following, newsletters, settings, + **read-later** (new, Phase 4) |
| `/reset-password` (new, Phase 1) | 1 | reads `?token=`, calls `resetPassword({newPassword, token})` |
| *(new, Phase 5)* `/api/newsletter/confirm` | 5 | `GET ?token=` double opt-in confirmation |

---

## Global Blast Radius

- **`packages/db` is a dependency of `dtw-engine`** (separate repo, cannot be tested from here). Additive-only changes; see AD-7. The only phase touching Drizzle schema at all is none of them in the strict sense — all tables needed already exist. If a phase's kickoff research finds a genuine need for a new column (e.g. a meter-counter table), that is a **scope change** requiring a stop-and-confirm, not a silent addition.
- **Two independent migration systems share one Postgres DB**: Drizzle (`packages/db/migrations/`, `drizzle-kit migrate`) and Payload (`apps/web/src/payload/migrations/`, `payload migrate`), run in that order by `scripts/migrate-prod.mjs`, production-only. Phase 3's Payload Global goes through Payload's system exclusively. Never generate one system's tables from the other's CLI.
- **ISR/caching correctness**: reader pages are `unstable_cache`'d RSCs with 30–300s `revalidate`. Any phase that reads per-user state (session, cookies) inside one of those cached routes silently makes the route dynamic or — worse — bakes one user's state into a cache shared by every visitor. This blast radius touches every existing cached article/pillar/homepage route if violated. Mitigation is convention #8 above, enforced by code review in each phase, not by tooling.
- **`(reader)/layout.tsx` provider boundary**: `ShellProvider`/`AuthModal`/`I18nProvider`/`ThemeProvider` are deliberately scoped to the reader layout, not the root layout, so `/admin` never mounts them (confirmed by reading the file). Phase 1's session bridge and Phase 3's threshold-prop plumbing both modify this file — regression risk is accidentally widening the provider boundary to include `/admin`, or double-mounting `AuthModal`.
- **`apps/web/src/components/header.tsx` is 869 lines** and is touched by Phase 1 (login/logout wiring), and Phase 3 (nudge threshold). Multiple phases touching one large file raises merge/regression risk — each phase's regression checkpoint must re-verify the other phase's still-working behavior in this file (see phase sections below).
- **Preview-build schema skew**: `scripts/migrate-prod.mjs` only runs on `VERCEL_ENV=production`. Any phase introducing a new column or Global must fail open on preview builds per convention #6, or preview deploys will 500 on that surface until the next production deploy.

---

## Foundation vs. Expansion Boundary (Deferred Work)

Explicitly **out of scope** for all 5 phases in this program. Do not silently pull any of these in mid-phase — if a phase's kickoff research finds one of these is a hard blocker, stop and escalate rather than expanding scope.

| Deferred item | Why | Where it will live later |
|---|---|---|
| `/admin` ↔ Better-Auth reconciliation | AD-5, both repos document this as deliberately future work | a dedicated future feature/phase, not this program |
| Editor/Admin 2FA (TOTP) | Depends on the reconciliation above; the `twoFactorSecret`/`twoFactorEnabled` columns exist but stay dormant | same as above |
| PostHog analytics tables / feature flags | Self-hosted PostHog isn't deployed; AD-2 replaces the one hard Phase-1-required dependency on it (paywall threshold) with a Payload Global | `process/context/infra/all-infra.md` roadmap |
| Payments / Pro tier / Stripe billing | Phase 2 of the product roadmap, not this program; `paywall.tsx`'s `$12/mo` card and `/pro` link are **removed**, not implemented, in Phase 3 | `process/context/integrations/all-integrations.md` |
| PWA / IndexedDB sync beyond the login-time guest-state merge | The `account/_GUIDE.md` multi-device sync + offline cache rules are a distinct, large surface; this program's "anonymous → logged-in merge" (Phase 3) is a one-shot server action at sign-in, not the full IndexedDB sync layer | a dedicated future PWA phase |
| Email i18n (transactional bodies in vi/id) | AD-4 | tracked as an explicit follow-up once i18n subpath routing lands |
| Newsletter **sending** infrastructure (broadcast, scheduling, segment campaigns) | Phase 5 builds the **subscription** funnel (collection, toggles, double opt-in) only — no Resend broadcast/campaign code, matching brief-asia's own scope boundary | `process/features/newsletters/_GUIDE.md` |
| `article_views` / "Most Read" analytics table | AD-8 #5 — deliberately not ported; superseded by the future PostHog era | infra roadmap |
| Full IndexedDB local cache mirror (`bookmarks`/`follows`/`history` client-side) described in `account/_GUIDE.md` | Server-side lists (Phase 2/4) are the source of truth for this program; offline-first sync is separable, larger scope | future PWA phase |

---

## Phased Delivery Plan

This program's delivery plan is the 5 phases below, executed strictly in dependency order
(`1 -> 2 -> {3, 4}`, `1 -> 5`), each with its own research -> execute -> validate -> report loop.
There is no single flat "Implementation Checklist" for the whole program by design (per AD-3 and
`phase-programs.md`) — the checklist for *what to build next* is always "the next unblocked phase's
own dedicated plan," never the whole program at once. The five phases, in delivery order, are:

1. **Phase 1 — Auth foundation** — real sessions replace the fake demo login.
2. **Phase 2 — Account data layer** — bookmarks / history / follows persist server-side.
3. **Phase 3 — Paywall meter + sign-in nudge compliance** — closes invariant #4.
4. **Phase 4 — Settings, account deletion, read-later queue** — full account management.
5. **Phase 5 — Newsletters** — CMS collection + double opt-in.

Full detail for each (objective, touchpoints, blast radius, gates, blockers, resume notes) is in the
dedicated section for that phase further below.

## Phase Status Table

| Phase | Title | Depends on | Status | Phase plan file |
|---|---|---|---|---|
| 1 | Auth foundation | none | ⏳ PLANNED | `process/features/account/active/phase-01-auth-foundation_PLAN_03-07-26.md` |
| 2 | Account data layer | Phase 1 | ⏳ PLANNED | `process/features/account/active/phase-02-account-data-layer_PLAN_03-07-26.md` |
| 3 | Paywall meter + sign-in nudge | Phase 2 | ⏳ PLANNED | `process/features/account/active/phase-03-paywall-nudge_PLAN_03-07-26.md` |
| 4 | Settings + read-later queue | Phase 2 | ⏳ PLANNED | `process/features/account/active/phase-04-settings-read-later_PLAN_03-07-26.md` |
| 5 | Newsletters (double opt-in) | Phase 1 (email lib); UI parts on Phase 2 (account tab) | ⏳ PLANNED | `process/features/account/active/phase-05-newsletters-double-optin_PLAN_03-07-26.md` |

Dependency shape: `1 → 2 → {3, 4}`, and `1 → 5` (with 5's account-tab UI additionally depending on 2). Phases 3 and 4 do not depend on each other and could in principle run in either order once Phase 2 is `✅ VERIFIED`, but only one phase should be the "current phase" in flight at a time per `phase-programs.md`.

---

## The Mandatory Per-Phase Loop (Reminder)

Every phase — 1 through 5 — must run the full 10-step loop from `process/development-protocols/phase-programs.md` before being called `✅ VERIFIED`:

1. **Research subagent** — reread the selected phase plan (once it exists), the latest relevant reports, this umbrella plan, and inspect codebase drift since this umbrella was written.
2. **Execution approval checkpoint** — summarize what changed since planning, get explicit user approval.
3. **Execute subagent** — implement only the selected phase's scope; stop if work no longer matches the plan.
4. **Validate subagent** — run the exact phase gates; inspect DB state, curl output, or browser flow as required.
5. **Regression checkpoint** — run the narrowest representative check against previously-verified overlapping surfaces (e.g. Phase 3 must re-verify Phase 1's login still works after touching `header.tsx` and `(reader)/layout.tsx`).
6. **Regression-found workflow** (conditional) — classify, fix-in-place / revalidate-only / route-as-blocked, per the decision tree in `phase-programs.md`.
7. **Durable capture** — write the phase report to `process/features/account/reports/`, update this umbrella plan's status table, update `process/context/` docs if durable knowledge changed (see [Context Doc Reconciliation Needed](#context-doc-reconciliation-needed)).
8. **Commit checkpoint** — recommend `vc-git-manager` for a logical execution commit before moving on; keep plan/report commits separate from code commits.
9. **Inter-phase UPDATE PROCESS** — mandatory, not optional. Archive the completed phase plan, capture learnings.
10. **Move-on recommendation** — name the exact next phase plan path.

A phase is never `✅ VERIFIED` on code existing alone ("code compiles" / "build succeeds" is `🔨 CODE DONE`, not `✅ VERIFIED`).

---

## Phase 1 — Auth Foundation

**Status:** ⏳ PLANNED
**Objective:** Real Better-Auth sessions replace `ShellProvider`'s fake in-memory user everywhere `useShell().user` is read. A reader can sign up/in via magic link, email+password, or Google/GitHub OAuth (Apple registered but off), sign out, and every other phase in this program builds on a real session from here on.
**Dependencies:** none (first phase). Phase plan file: `process/features/account/active/phase-01-auth-foundation_PLAN_03-07-26.md`.

### Scope / Touchpoints

| File | Change |
|---|---|
| `apps/web/package.json` | add `better-auth` (`^1.6.20`, matching brief-asia's proven version) and `resend` (`^6.14.0`) as dependencies |
| `apps/web/src/lib/auth.ts` (**new**) | Better-Auth server config. Port from `/home/hieunc/Code/brief-asia-web/src/lib/auth.ts`: `drizzleAdapter(db, {provider:"pg", schema:{user:users, session:sessions, account:accounts, verification:verifications}})` mapped onto `@dtw/db`'s existing tables; `role` `additionalFields` (`default:"reader"`, `input:false`); `changeEmail`/`deleteUser` enabled; session `expiresIn` 7d / `updateAge` 1d; `sendAuthEmailSafe` wrapper (fail-open on mail errors). **Deviate from the port**: replace brief-asia's `emailVerification.sendOnSignUp` + explicit modal resend (AD-8 #2) with `sendOnSignUp: true` only. **Add**: `magicLink` plugin (net-new, no brief-asia equivalent — 15-min single-use token per `account/_GUIDE.md`, Resend subject "Sign in to DailyTechWire" per `all-auth.md`). **Add**: `emailAndPassword` (ported, `requireEmailVerification: true`, `resetPasswordTokenExpiresIn: 3600`). `socialProviders`: `google`/`github` registered when their env pair is set (`googleConfigured`/`githubConfigured` booleans, ported pattern); `apple` registered only when all four Apple env vars are set (same pattern, extended). `plugins: [magicLink(...), nextCookies()]` — **`nextCookies()` last**, per the verified source comment in brief-asia. `import "server-only"` at the top. |
| `apps/web/src/lib/email.ts` (**new**) | Port Resend-or-console-fallback wrapper + `actionEmail()` branded template from `brief-asia-web/src/lib/email.ts` near-verbatim. Rebrand `FROM` to `` `DailyTechWire <no-reply@${process.env.RESEND_FROM_DOMAIN ?? "dailytechwire.com"}>` `` and restyle the inline HTML with dtw tokens (terracotta `#D4623C` accent, navy `#1B2A52`, per invariant #7). Keep `sendAuthEmailSafe` fail-open semantics verbatim (mail outage never rolls back account flows). Body is English-only (AD-4) — no locale parameter. |
| `apps/web/src/lib/auth-client.ts` (**new**) | Port from `brief-asia-web/src/lib/auth-client.ts`: `createAuthClient()` from `better-auth/react`, add `magicLinkClient()` plugin. Export `authClient`, `signIn`, `signUp`, `signOut`, `useSession`, `resetPassword`. |
| `apps/web/src/lib/session.ts` (**new**) | Port `getSessionUser()` + `requireUser()` from `brief-asia-web/src/lib/account.ts` verbatim (server-only, `auth.api.getSession({headers: await headers()})`, normalized `{id,name,email,role}`, `requireUser()` throws `"Not authenticated"`). **Add** a shared `roleAtLeast(role, min)` helper here (global convention #5) — new work, no brief-asia equivalent, needed because this program introduces the first real role comparisons. |
| `apps/web/src/app/api/auth/[...all]/route.ts` (**new**) | Mount verbatim from brief-asia: `export const { GET, POST } = toNextJsHandler(auth)`, `export const dynamic = "force-dynamic"`. |
| `apps/web/src/app/(reader)/reset-password/page.tsx` (**new**) | Port from `brief-asia-web/src/app/(reader)/[locale]/reset-password/page.tsx`, dropping the `[locale]` segment (dtw has no subpath i18n yet — convention #7, no hardcoded `/en`). Reads `?token=`, calls `resetPassword({newPassword, token})`. |
| `apps/web/src/components/auth-modal.tsx` (**rewrite**, currently 154 lines, fully fake) | Replace `demoLogin()` with real calls. Magic-link submit → `authClient.signIn.magicLink({email, callbackURL})` → "Check your inbox" state with a 30s resend countdown (new UI state — brief-asia has no equivalent; `account/_GUIDE.md` specifies this exactly). Add a mode state machine (signin / signup / forgot-password) for the email+password path, modeled on `brief-asia-web/src/components/auth-modal.tsx`'s `mode` state (`signIn.email`, `signUp.email`, `requestPasswordReset`, with brief-asia's anti-enumeration copy for forgot-password ported verbatim). OAuth buttons: `signIn.social({provider})` ported from brief-asia's `handleGoogle`, extended to `github`; each button's *visibility* gated on `NEXT_PUBLIC_{PROVIDER}_ENABLED` (fixes AD-8 #1 — do not hardcode `true`). Keep dtw's existing markup/tokens/`useT()` i18n triples; only replace the fake-login internals. |
| `apps/web/src/lib/shell.tsx` (**modify**, 91 lines today) | Replace `const [user, setUser] = useState<User|null>(null)` + manual `setUser` with `useSession()` from `auth-client.ts` bridged through a `toShellUser(session)` function (ported pattern from `brief-asia-web/src/lib/shell.tsx`) that capitalizes the lowercase DB role enum into the existing `User.role` union. Keep `setUser` in the exposed context shape only if a later phase's guest-merge action needs it (see Phase 3) — otherwise derive `user` read-only from the session. Sign-out path: replace any `setUser(null)` call site with `authClient.signOut()`. `articlesRead`/`incrementRead` are untouched by Phase 1 (Phase 3 owns the meter redesign). |
| `apps/web/src/components/header.tsx` (**modify**, 869 lines) | Desktop dropdown "Log out" and mobile menu "Log out" (both currently call `setUser(null)`) now call `authClient.signOut()`. No other changes in Phase 1 (Phase 3 touches the nudge threshold in this same file later — regression risk noted in Global Blast Radius). |
| `apps/web/src/payload/collections/Users.ts` (**modify**, small hardening item, AD-8 #4) | Add field-level `access` on the `role` field (e.g. `access: { update: ({req}) => req.user?.role === "admin" }`) so a self-update cannot escalate role. Does not touch the collection's top-level `access` block; purely additive field config. |
| `.env.example` (repo root) | **no changes needed** — all required vars already reserved (confirmed during grounding); add the three new `NEXT_PUBLIC_*_ENABLED` vars only. |

### Out of Scope (Phase 1)

- Any account data (bookmarks/history/follows/queue) — Phase 2.
- Paywall meter changes — Phase 3 (Phase 1 does not touch `articlesRead`/`incrementRead`/thresholds).
- Newsletter subscriptions — Phase 5.
- `middleware.ts` — never, per AD-6.
- Payload `Users` collection auth mechanism itself (email+password login, 7-day token) — untouched except the field-access hardening line above.

### Blast Radius

- `apps/web/src/lib/shell.tsx` is consumed by `header.tsx`, `auth-modal.tsx`, `apps/web/src/components/article/article-content.tsx`, and the `/account` page — changing its `user` derivation touches every one of those call sites' typing even though only login/logout logic changes.
- First-ever runtime use of `@dtw/db` in `apps/web/src` (via the `drizzleAdapter` inside `auth.ts`) — validates convention #2 (`server-only` guard) in practice for the first time.
- `(reader)/layout.tsx` — `AuthModal` and `ShellProvider` wiring order must not change (regression risk: `/admin` must never see these providers — confirmed today it doesn't).

### Validation Gates

- `pnpm typecheck` and `pnpm lint` (turbo, repo root) — must pass clean.
- `pnpm build` — must succeed (validates `better-auth`/`resend` are correctly wired into the Next.js build, and that `apps/web/src/lib/auth.ts`'s `server-only` import doesn't leak into a client bundle).
- **Manual, magic link**: submit an email in the modal → confirm a row appears in `auth_verifications` (`SELECT * FROM auth_verifications ORDER BY created_at DESC LIMIT 1;`) → without `RESEND_API_KEY` set, confirm the link is printed to the server console (dev fallback) → click it → confirm a session cookie is set and `auth_sessions` has a matching row → confirm `auth_users` gained a row with `role = 'reader'`.
- **Manual, email+password signup**: sign up → confirm exactly **one** verification email is sent/logged (not two — AD-8 #2) → confirm sign-in is blocked until the link is clicked (`requireEmailVerification: true`) → click it → confirm auto sign-in.
- **Manual, forgot/reset password**: request reset for a non-existent email and a real one → confirm identical UI copy both times (anti-enumeration) → for the real one, click the reset link → set a new password → confirm sign-in with the new password works.
- **Manual, OAuth**: with `GOOGLE_CLIENT_ID`/`SECRET` set locally, click "Continue with Google" → confirm the button is visible only because `NEXT_PUBLIC_GOOGLE_ENABLED=true` is also set (not hardcoded) → complete the flow → confirm `auth_accounts` gains a `provider_id = 'google'` row linked to the same `auth_users.id`. Repeat for GitHub. Confirm the Apple button does **not** render with all four Apple env vars unset (default state).
- **Manual, sign-out**: from both desktop dropdown and mobile menu, confirm `authClient.signOut()` clears the session cookie and the header flips back to "Log in".
- **RBAC hardening check (AD-8 #4)**: as a Payload `author` user in `/admin`, attempt to `PATCH` your own user record's `role` field to `admin` via the REST/GraphQL API directly (not the UI) — confirm it is rejected.
- **Data verification**: `SELECT id, email, role, email_verified FROM auth_users;` after each flow above to confirm expected rows.

### Durable Report Target

`process/features/account/reports/phase-01-auth-foundation_REPORT_<execution-date>.md`

### Blockers That Would Justify 🚧 BLOCKED

- `better-auth@^1.6.20` has a breaking change against the Drizzle schema shape already committed in `packages/db/src/schema/auth.ts` (would require a schema change — stop, this violates AD-7's additive-only rule and needs explicit re-confirmation, not a silent fix).
- Resend sandbox/API behaves differently than brief-asia's proven usage in a way that blocks verification email delivery in dev.
- Magic-link plugin insertion breaks `nextCookies()` ordering (the one regression risk explicitly flagged in research) and session cookies stop being set.

### Resume Handoff Notes

If resumed after compaction: reread this Phase 1 section, `packages/db/src/schema/auth.ts` (confirm no drift), and `apps/web/src/lib/shell.tsx`/`auth-modal.tsx` current state (confirm they're still the fake stubs described here — if someone has since touched them, treat this section as stale and re-research before executing).

---

## Phase 2 — Account Data Layer

**Status:** ⏳ PLANNED
**Objective:** Bookmarks, reading history, and pillar follows persist server-side and drive a real `/account` page. First-ever production use of `@dtw/db` for reader-data reads/writes.
**Dependencies:** Phase 1 `✅ VERIFIED` (needs a real session to gate on). Phase plan file: `process/features/account/active/phase-02-account-data-layer_PLAN_03-07-26.md`.

### Scope / Touchpoints

| File | Change |
|---|---|
| `apps/web/src/lib/account-actions.ts` (**new**, `"use server"`) | Port near-verbatim from `brief-asia-web/src/lib/account-actions.ts`: `toggleBookmark`/`removeBookmark`/`isBookmarked`, `recordView` (upsert `reading_history` on `userId`+`articleId` conflict, per AD-8 #5 this is the **only** view-tracking write in this program), `clearHistory`, `toggleFollow('pillar', slug)` (dtw has no "country" follow type — brief-asia's `'pillar'|'country'` union narrows to `'pillar'` only here, since dtw's taxonomy is pillar-based per invariant #8, not country-based like brief-asia's Asia-country model). Every mutation gated by `requireUser()` from `apps/web/src/lib/session.ts`. `import "server-only"`. Article ids stored as `text` via `String(articleId)` (Payload numeric ids — matches the existing `toArticleView` coercion convention in `article-view.ts`). |
| `apps/web/src/lib/session.ts` (**extend**, from Phase 1) | Add read helpers: `listBookmarks`, `listHistory` (limit 50, ported from brief-asia), `listFollows`. |
| `apps/web/src/lib/payload-server.ts` (**extend**, existing file) | Add `getArticlesByIds(ids: string[])` following the file's existing `unstable_cache` + tag (`articles:all`) convention, ported from `brief-asia-web/src/lib/payload-server.ts`'s equivalent. Published-only filter (unpublishing silently removes an article from a user's saved list — documented brief-asia behavior this program keeps, since it matches invariant expectations). |
| `apps/web/src/app/(reader)/account/[[...tab]]/page.tsx` (**rewrite**, currently 466 lines, client component + mock fixtures) | Convert to a **server component**, `export const dynamic = "force-dynamic"` (convention #8 — per-user data must not be cached), following `brief-asia-web/src/app/(reader)/[locale]/account/[[...tab]]/page.tsx`'s shape: `getSessionUser()` → render the existing sign-in-prompt UI if null (no redirect, matches AD-6's inline-prompt pattern) → else `Promise.all(listBookmarks, listHistory, listFollows)` → hydrate via `getArticlesByIds` → pass real data into the existing tab components. Keep dtw's existing tab UI/i18n; replace `apps/web/src/lib/data.ts` `ARTICLES`/`NEWSLETTERS` fixture reads in the Saved/History/Following tabs only (Newsletters tab is Phase 5's concern; Settings tab is Phase 4's). Client-side optimistic mutation islands (remove-bookmark, clear-history, toggle-follow) call the Phase 2 server actions + `router.refresh()`, mirroring `brief-asia-web/src/components/account/account-tabs.tsx`'s pattern. |
| `apps/web/src/components/article/article-content.tsx` (**modify**, 259 lines) | Wire the existing Save button to `toggleBookmark` (guest click → `openAuth()`, exactly the existing branch structure already present for the paywall CTA). Add a mount-effect calling `recordView(article.id)` for signed-in users only (guests keep using the existing client-side `incrementRead` meter — untouched here, Phase 3's concern). |
| Following-tab pillar source | Drive the Following tab's pillar list from the existing `getNavPillars()` helper (already used in `(reader)/layout.tsx`), **not** a hardcoded array — fixes brief-asia's hardcoded-12-country-list pattern by using dtw's real CMS-driven pillar list instead. |

### Out of Scope (Phase 2)

- `article_views` / any per-page-load analytics table (AD-8 #5 — deliberately omitted).
- Read-later queue tab (`reading_queue` table) — Phase 4.
- Settings tab mutations (changeEmail/deleteUser) — Phase 4.
- Newsletters tab — Phase 5.
- Paywall meter changes — Phase 3.

### Blast Radius

- First production `@dtw/db/client` usage for reader-data (Phase 1 only used it via the Better-Auth adapter, one layer removed). Confirms convention #2's `server-only` guard end-to-end for a second, independent module.
- `/account` page's rendering model changes from client+mock to server+force-dynamic — anything currently assuming client-side `useShell().user` gating on this route (there is none confirmed beyond the page itself) must be re-checked.
- `article-content.tsx` gains a new mount-effect; must not double-fire or fire for sponsored articles (mirror the existing `!article.sponsored` guard already present for `incrementRead`).

### Validation Gates

- `pnpm typecheck`, `pnpm lint`, `pnpm build` clean.
- **Manual, save/unsave**: as a signed-in reader, save an article from the article page → confirm a row in `bookmarks` (`SELECT * FROM bookmarks WHERE user_id = '<id>';`) → visit `/account` Saved tab → confirm the article renders with real title/cover art (not a mock fixture) → remove it → confirm the row is deleted and the tab updates via `router.refresh()`.
- **Manual, history**: read 2–3 articles as a signed-in reader → confirm `reading_history` rows (one per article, not one per page-load — verifies AD-8 #5's dedupe) → visit History tab → confirm they render, most recent first → "Clear history" → confirm all rows for that user are deleted.
- **Manual, follow**: follow a pillar from the Following tab → confirm a `follows` row → confirm the tab's pillar list matches the CMS's actual pillar set (add/rename a pillar in `/admin`, confirm the Following tab reflects it without a deploy, per invariant #8).
- **Manual, guest gating**: as a guest, visit `/account` directly → confirm the inline sign-in prompt renders (no redirect, no 401) → click Save on an article as a guest → confirm `openAuth()` opens the modal instead of erroring.
- **Manual, unpublished article**: save an article, then unpublish it in `/admin` → confirm it silently drops from the Saved tab (documented, accepted behavior) rather than erroring.
- **Regression**: re-verify Phase 1's login/logout/signup still work after this phase's changes to `shell.tsx`-adjacent consumers and `header.tsx`-adjacent files (none directly touched, but `article-content.tsx` and the account page both consume `useShell()`).

### Durable Report Target

`process/features/account/reports/phase-02-account-data-layer_REPORT_<execution-date>.md`

### Blockers That Would Justify 🚧 BLOCKED

- Payload article `id` type mismatch causes silent join failures between `bookmarks.article_id` (text) and Payload's numeric ids in a way `String()` coercion doesn't cleanly resolve (would need to inspect actual Payload output shape at execution time — flagged as a re-research item for Phase 2 kickoff, not assumed resolved by this plan).
- `getArticlesByIds`'s `unstable_cache` tag choice causes stale saved-article data after a CMS edit (must bust correctly via the existing `articles:all` tag — if it doesn't, that's a real bug, not a scope change).

### Resume Handoff Notes

Reread this Phase 2 section plus the Phase 1 report (confirm session/`requireUser()` actually landed as described) before executing. Re-check `apps/web/src/lib/data.ts` for the exact current shape of `ARTICLES`/`NEWSLETTERS` fixtures being replaced, since UI copy/shape may have drifted.

---

## Phase 3 — Paywall Meter + Sign-In Nudge Compliance

**Status:** ⏳ PLANNED
**Objective:** Close the verified invariant #4 violation: replace the hardcoded, inconsistent (`>=3` vs `>3`), in-memory-only paywall threshold with a cookie-based guest meter + DB-based logged-in meter, both compared against a CMS-configurable Payload Global threshold (AD-2) — and rewrite `paywall.tsx` to Phase-1-correct sign-in-nudge copy (removing the `$12/mo` card and the 404ing `/pro` link).
**Dependencies:** Phase 2 `✅ VERIFIED` (needs `reading_history` wired for the logged-in meter). Phase plan file: `process/features/account/active/phase-03-paywall-nudge_PLAN_03-07-26.md`.

### Scope / Touchpoints

| File | Change |
|---|---|
| Payload Global config, e.g. `apps/web/src/payload/globals/PaywallSettings.ts` (**new**) | A Payload `GlobalConfig` with a `paywallThreshold` number field (default `3`), `access: { read: () => true, update: ({req}) => req.user?.role === "editor" || req.user?.role === "admin" }`. Register in `apps/web/payload.config.ts`'s `globals: []` array (currently absent — first Global in this repo). |
| `apps/web/src/payload/hooks/revalidate.ts` (**extend**, existing file) | Add a `revalidatePaywallSettings` `GlobalAfterChangeHook` following the exact `bust()` pattern already used for pillars/articles — new tag, e.g. `"settings:paywall"`. |
| `apps/web/src/lib/payload-server.ts` (**extend**) | Add `getPaywallThreshold()`: `unstable_cache`'d read of the new Global, tag `"settings:paywall"`, with the fail-open try/catch pattern (convention #6) since preview builds won't have the migration yet — return the existing hardcoded `3` as the safe fallback. |
| **Payload migration** (`apps/web/src/payload/migrations/`, new file via `pnpm --filter web payload:migrate:create`) | Generates and commits the SQL for the new Global's backing table — required because `push: false` (confirmed in `payload.config.ts`). Follows the existing naming convention (`YYYYMMDD_HHMMSS_description.{ts,json}`). |
| `apps/web/src/app/(reader)/layout.tsx` (**modify**, small, already `async`) | Fetch `getPaywallThreshold()` alongside the existing `getNavPillars()` call, pass as a prop into `ShellProvider`. |
| `apps/web/src/lib/shell.tsx` (**modify**, from Phase 1's state) | Accept `paywallThreshold` as a provider prop; replace the in-memory `articlesRead`/`incrementRead` ref-Set (resets on reload) with a **client-side cookie**-backed guest meter, `dtw-read-count` — mechanics (dedup-by-id vs. plain count; `document.cookie` vs. a small helper vs. adding `js-cookie` as a new dependency; calendar-month vs. rolling-30-day reset) are **not locked by this umbrella plan** — recommend at Phase 3 kickoff research: keep the meter **entirely client-side** (never read via `cookies()` in a cached RSC — this is the one hard constraint, per Global Blast Radius's ISR risk) and reuse the existing dedup-by-id semantics already proven in the current ref-Set implementation, just persisted to a cookie instead of memory. For signed-in users, `articlesRead` is instead the count of that user's `reading_history` rows within the reset window (server-computed, passed down once per page load — not polled). |
| `apps/web/src/components/header.tsx` (**modify**, the same 869-line file Phase 1 touched) | `showNudge` condition changes from hardcoded `articlesRead >= 3` to `articlesRead >= paywallThreshold` (sourced from the new provider prop). |
| `apps/web/src/components/article/article-content.tsx` (**modify**, the same file Phase 2 touched) | `hitPaywall` condition changes from `articlesRead > 3` to `articlesRead > paywallThreshold`, unifying the `>=`/`>` inconsistency the research explicitly flagged (pick one comparison operator and apply it in both places — recommend `>=` to match the nudge banner's existing semantics, confirm at kickoff). |
| `apps/web/src/components/article/paywall.tsx` (**rewrite**, currently 115 lines, self-declared demo) | Remove the `$12/mo` Pro card, the `Become a member` button (`href="/pro"`, a 404 today), and the three feature bullets (Unlimited reading / Full Dashboards / Pro newsletters — all Phase-2-product-roadmap claims). Replace with Phase-1-correct copy: a sign-in nudge only, "I already have an account" / equivalent primary CTA → `onLogin` (unchanged prop, still opens the auth modal). All copy through `t(en, vi, id)`. |
| **New work, no brief-asia equivalent**: anonymous → logged-in state merge | A one-shot server action, triggered from `ShellProvider` when `useSession()` transitions `null → user` (first session establishment): reset the guest meter (a fresh signup is the nudge's success state, per the research's explicit recommendation) and clear the `dtw-read-count` cookie. Anonymous **bookmark** merging beyond the meter is explicitly out of scope here (no anonymous bookmark storage exists yet in this program — Phase 2 only wired signed-in bookmarks) — full IndexedDB merge is deferred per [Foundation vs. Expansion](#foundation-vs-expansion-boundary-deferred-work). |

### Out of Scope (Phase 3)

- Any hard paywall / content gating — body always renders in full, unchanged (soft block only, per invariant #4).
- Stripe/Pro billing — deferred, see boundary table.
- PostHog as the threshold source — explicitly rejected by AD-2; a future override layer, not this phase.
- Full anonymous-saves ↔ server bookmark merge (IndexedDB) — deferred.

### Blast Radius

- First Payload **Global** in this repo — validates the `globals: []` config path and the `payload:migrate:create` → commit-the-SQL flow for the first time; any surprise here (e.g. Globals needing a different hook signature than Collections) is a real Phase 3 kickoff research item, not assumed away by this plan.
- `header.tsx` and `article-content.tsx` are touched a second time each (Phase 1/Phase 2 respectively touched them first) — regression checkpoint must re-verify login/logout (Phase 1) and save/history (Phase 2) still work after this phase's edits.
- `(reader)/layout.tsx` gains a second async data fetch (alongside `getNavPillars()`) — must not regress the existing pillar-nav fetch or introduce a request waterfall (use `Promise.all`).
- Removing content from `paywall.tsx` (the Pro card) is itself a small blast radius but a real, user-visible regression risk if any other surface still links to `/pro` (confirmed today: `apps/web/src/lib/data.ts` has the Pro nav item "commented out ... until paid tier launches" — leave that commented, do not resurrect it).

### Validation Gates

- `pnpm typecheck`, `pnpm lint`, `pnpm build` clean.
- **Manual, threshold config**: in `/admin`, set `paywallThreshold` to `2` → confirm (within the cache's revalidate window / immediately via `revalidateTag`) that the nudge banner and paywall card now trip after 2 reads, not 3, **without a deploy** (invariant #8-style CMS-configurability proof). Set it back to `3` (or whatever default is agreed) and confirm reversion.
- **Manual, guest meter persistence**: as a guest, read articles up to the threshold, **reload the page**, confirm the meter did *not* reset to 0 (this is the core bug fix — today's in-memory `ref-Set` resets on reload; the cookie must survive it).
- **Manual, dedupe**: re-read the *same* article multiple times as a guest, confirm the meter does not increment past 1 for that article (matches existing dedup semantics).
- **Manual, `>=`/`>` consistency**: confirm the header nudge and the article-page paywall card now trip at the exact same read count (today they diverge by one article — explicit bug fix proof).
- **Manual, sign-in resets the meter**: trip the guest meter, sign in, confirm the meter resets and the `dtw-read-count` cookie is cleared.
- **Manual, logged-in meter**: as a signed-in reader who has read N articles (verified via `reading_history` row count from Phase 2), confirm the paywall/nudge logic uses that count, not a separate cookie.
- **Manual, paywall copy**: confirm the article page no longer shows a `$12/mo` card or a link to `/pro` anywhere in the paywall flow.
- **Data verification**: query the new Global's backing table directly to confirm the threshold value persists and matches what `/admin` shows.
- **Regression**: re-run Phase 1's login/logout manual check and Phase 2's save/history manual check after this phase's edits to the shared files.

### Durable Report Target

`process/features/account/reports/phase-03-paywall-nudge_REPORT_<execution-date>.md`

### Blockers That Would Justify 🚧 BLOCKED

- Payload Globals in this Payload version require a materially different revalidation hook signature than the Collection `afterChange` hooks this plan assumes (real risk — Globals and Collections have different hook type signatures in Payload 3; verify `GlobalConfig`'s hook types at Phase 3 kickoff before assuming the `CollectionAfterChangeHook` pattern transfers directly).
- Cookie-based guest meter cannot avoid forcing the article page RSC dynamic without a redesign more invasive than "client-side only" (would need to escalate and possibly revisit AD-6's no-middleware stance, or accept a dynamic article page — either is a real architecture decision, not something to resolve silently mid-execute).

### Resume Handoff Notes

Reread this Phase 3 section, the Phase 2 report (confirm `reading_history` is genuinely wired), and re-verify `header.tsx`/`article-content.tsx`'s exact current threshold logic (line numbers may have shifted) before executing. The cookie-mechanics decision flagged as "not locked" above must be resolved as part of Phase 3's own PLAN pass, not assumed from this umbrella.

---

## Phase 4 — Settings, Account Deletion, Read-Later Queue

**Status:** ⏳ PLANNED
**Objective:** Full account management per `process/features/account/_GUIDE.md`'s tab list: change email, delete account (GDPR/PDPA), and the previously-missing "Read later" queue tab over the existing `reading_queue` table.
**Dependencies:** Phase 2 `✅ VERIFIED` (needs the real `/account` RSC shape and session plumbing). Independent of Phase 3 — can run before or after it once Phase 2 is verified. Phase plan file: `process/features/account/active/phase-04-settings-read-later_PLAN_03-07-26.md`.

### Scope / Touchpoints

| File | Change |
|---|---|
| Settings tab (inside the Phase-2-converted `/account/[[...tab]]/page.tsx` and its tab components) | Port `changeEmail` from `brief-asia-web/src/components/account/account-tabs.tsx`'s `SettingsTab`: `authClient.changeEmail({newEmail, callbackURL})` → Better-Auth's `sendChangeEmailVerification` emails the confirmation to the **new** address (already configured in Phase 1's `auth.ts`). Port `deleteUser`: confirm dialog → `authClient.deleteUser({})` → redirect home. **No `changePassword` omission** — since AD-1 includes email+password (unlike brief-asia's magic-link-only assumption in the original research), also port `authClient.changePassword({currentPassword, newPassword, revokeOtherSessions: true})` for users who have a password set (magic-link-only/OAuth-only users won't have `auth_accounts.password` set — the UI must handle that case, e.g. hide or relabel the control, not error). |
| `apps/web/src/lib/account-actions.ts` (**extend**, from Phase 2) | No new server actions needed for changeEmail/deleteUser/changePassword — these are direct `authClient` calls (Better-Auth's own API), not custom server actions, matching brief-asia's pattern. |
| Read-later tab (**new**, no brief-asia UI equivalent — brief-asia never built this despite having the table) | New server actions in `apps/web/src/lib/account-actions.ts`: `addToQueue`, `removeFromQueue`, `reorderQueue` (updates the `reading_queue.position` column) over the existing `readingQueue` Drizzle table. New read helper in `apps/web/src/lib/session.ts`: `listQueue` (ordered by `position`). New tab UI added to the account page's tab list, following the existing tab component conventions from Phase 2's Saved/History tabs — FIFO by default, drag-or-button reorder, **no length limit** (per `account/_GUIDE.md`), client-ordering-wins on reorder conflicts (per the same guide's stated conflict-resolution rule, only relevant here as a same-tab optimistic-update concern since full IndexedDB sync is deferred). |
| `apps/web/src/app/(reader)/account/[[...tab]]/page.tsx` (**extend**, from Phase 2's rewrite) | Add `"read-later"` (or `"queue"`) to the tab list/route segment, add `listQueue` to the `Promise.all` alongside the Phase 2 lists, hydrate via the existing `getArticlesByIds`. |

### Out of Scope (Phase 4)

- Newsletters tab — Phase 5.
- Paywall/meter — Phase 3.
- Full PWA/IndexedDB queue sync — deferred (see boundary table); this phase is server-side CRUD + optimistic client UI only, same pattern as Phase 2's Saved tab.

### Blast Radius

- `deleteUser` relies on the FK cascade already present in `packages/db/migrations/0000_third_ender_wiggin.sql` (`bookmarks`/`follows`/`reading_history`/`reading_queue` all `onDelete: cascade` on `user_id`; `newsletter_subscriptions.user_id` is `onDelete: set null`, confirmed by reading the schema). No new migration needed, but this phase is the first to actually **exercise** that cascade end-to-end — worth a direct DB check, not just trusting the schema comment.
- Account page's tab list/routing gains a new segment — must not break the existing tab-switch behavior for saved/history/following (regression check against Phase 2).

### Validation Gates

- `pnpm typecheck`, `pnpm lint`, `pnpm build` clean.
- **Manual, change email**: request a change → confirm the confirmation email targets the **new** address (not the old one) → click it → confirm `auth_users.email` updates only after confirmation, not before.
- **Manual, change password**: for a user who signed up via email+password, change it → confirm old password no longer works, new one does, and other sessions are revoked (`revokeOtherSessions: true`) if that was the chosen config. For a magic-link-only or OAuth-only user, confirm the UI does not present a broken/erroring "change password" control.
- **Manual, delete account**: create a disposable test account with at least one bookmark, one history row, one queue item, and one newsletter subscription → delete the account → **data verification**: confirm `auth_users`, `auth_sessions`, `auth_accounts`, `bookmarks`, `follows`, `reading_history`, `reading_queue` rows for that user are gone (cascade), and confirm the `newsletter_subscriptions` row survives with `user_id` set to `NULL` (matches the `set null` FK behavior, intentionally — email-only subs are allowed to outlive the account per the existing schema design).
- **Manual, read-later**: add 3 articles to the queue, reorder them, remove one, confirm the remaining order persists across a page reload (server-side `position` is the source of truth) and confirm no length limit is enforced (add more than a small arbitrary number, e.g. 25, and confirm none are silently dropped).
- **Regression**: re-verify Phase 2's Saved/History/Following tabs still render correctly after the account page's tab-list change.

### Durable Report Target

`process/features/account/reports/phase-04-settings-read-later_REPORT_<execution-date>.md`

### Blockers That Would Justify 🚧 BLOCKED

- `authClient.deleteUser({})` requires a "fresh session" (Better-Auth's own security requirement) in a way that conflicts with the magic-link/OAuth-only session model in a manner brief-asia's password-based flow didn't need to handle — would need a re-auth step this plan doesn't currently specify. Flag and resolve at Phase 4 kickoff, don't guess.

### Resume Handoff Notes

Reread this Phase 4 section and the Phase 2 report before executing; confirm the exact current shape of the Phase-2-converted account page (tab routing convention) since Phase 3 may have also touched adjacent files in the meantime.

---

## Phase 5 — Newsletters (CMS Collection + Double Opt-In)

**Status:** ⏳ PLANNED
**Objective:** Real newsletter subscription funnel: a Payload `Newsletters` collection (currently only a fixture in `apps/web/src/lib/data.ts`), account-tab toggles for signed-in readers, and true double opt-in for guests (brief-asia left this as dead schema — `pending_newsletter_confirmations` exists with zero code paths).
**Dependencies:** Phase 1 (needs `apps/web/src/lib/email.ts` for the confirmation email). Account-tab UI parts additionally depend on Phase 2's `/account` RSC conversion. Independent of Phase 3/Phase 4. Phase plan file: `process/features/account/active/phase-05-newsletters-double-optin_PLAN_03-07-26.md`.

### Scope / Touchpoints

| File | Change |
|---|---|
| `apps/web/src/payload/collections/Newsletters.ts` (**new**) | Port shape from `brief-asia-web/src/payload/collections/Newsletters.ts` (`name`, `slug`, `cadence`, `description`, `vertical` rel-to-pillars, `active`, `order`; `read: () => true`), adapted to dtw's 6-newsletter set (AM Brief, PM Brief, AI Weekly, Asia Funding Weekly, Dev Digest, Products Deals — per `process/features/newsletters/_GUIDE.md` if present, else per the fixture data already in `apps/web/src/lib/data.ts`'s `NEWSLETTERS`). Register in `apps/web/payload.config.ts`'s `collections: []` array. |
| `apps/web/src/payload/hooks/revalidate.ts` (**extend**) | Add a `revalidateNewsletter` hook, tag `"newsletters:all"`, following the existing `bust()` pattern. |
| `apps/web/src/lib/payload-server.ts` (**extend**) | Add `getNewsletters()`, `unstable_cache`'d, tag `"newsletters:all"`. |
| `apps/web/src/lib/account-actions.ts` (**extend**, from Phase 2) | Port `setNewsletter`/`isSubscribed` from `brief-asia-web/src/lib/account-actions.ts`, but **fix AD-8 #3**: key the upsert on `userId` when a session exists (the `newsletter_subscriptions.userId` column already exists, nullable-FK'd, exactly for this), falling back to email-keying only for the guest/pre-confirmation path. Signed-in toggle is immediate (session email is already verified — no confirmation step needed for logged-in users, matches brief-asia's reasoning). |
| **New work, no brief-asia equivalent** (double opt-in): `apps/web/src/lib/account-actions.ts` | `subscribeGuest(email, newsletterIds)`: writes a `pending_newsletter_confirmations` row (token, email, `newsletterIds` array, expiry — table already has exactly this shape) instead of brief-asia's immediate single-opt-in subscribe. |
| `apps/web/src/lib/email.ts` (**extend**, from Phase 1) | Add a confirmation `actionEmail()` invocation for the double opt-in flow (reuses the Phase 1 template, English-only per AD-4). |
| `apps/web/src/app/api/newsletter/confirm/route.ts` (**new**) | `GET ?token=` → look up the `pending_newsletter_confirmations` row, check not expired, create real `newsletter_subscriptions` row(s) for each newsletter id in the token's array, delete the pending row, redirect to a confirmation page/state. |
| Account page Newsletters tab (inside the Phase-2/Phase-4-extended account page) | Replace `apps/web/src/lib/data.ts`'s `NEWSLETTERS` fixture with `getNewsletters()`; toggles call `setNewsletter`. |
| Header `SubscribeButton` / homepage newsletter CTA (existing components, exact file names to be confirmed at Phase 5 kickoff research — not verified during this umbrella PLAN pass) | Wire to the same guest double opt-in funnel (`subscribeGuest`) instead of any current fixture/no-op behavior. |

### Out of Scope (Phase 5)

- Actual newsletter **sending** (Resend broadcast/campaign infrastructure, scheduling, segment targeting at send time) — explicitly deferred, matches brief-asia's own scope boundary (it never built sending either).
- Any i18n for the confirmation email body — AD-4.
- Homepage/header component file paths beyond what's confirmed above are **not verified in this PLAN pass** — Phase 5 kickoff research must confirm exact current file names/behavior before executing (flagged explicitly so this isn't silently assumed).

### Blast Radius

- First new Payload **collection** added mid-program (Articles/Pillars/etc. all pre-exist) — validates the full collection-add path (config file → register in `payload.config.ts` → `payload:migrate:create` → commit SQL) for the first time in this program, same category of first-time risk as Phase 3's first Global.
- Zero Drizzle schema changes needed (AD-7) — `newsletter_subscriptions` and `pending_newsletter_confirmations` already match exactly what this phase needs, verified during grounding. If Phase 5 kickoff research finds this assumption wrong, that is a real blocker, not a silent schema addition.
- Header/homepage components not yet identified precisely — treat as an open item for Phase 5's own research step, not a blast-radius gap in this umbrella.

### Validation Gates

- `pnpm typecheck`, `pnpm lint`, `pnpm build` clean.
- **Manual, signed-in toggle**: as a signed-in reader, toggle a newsletter on/off from the account tab → confirm the `newsletter_subscriptions` row is keyed by `user_id` (not email) → change the account's email (Phase 4) → confirm the subscription survives and is **not** orphaned (direct proof of the AD-8 #3 fix).
- **Manual, guest double opt-in**: as a guest, submit an email via the header subscribe button → confirm **no** `newsletter_subscriptions` row is created yet, only a `pending_newsletter_confirmations` row → confirm a confirmation email is sent/logged → click the confirm link → confirm the `newsletter_subscriptions` row(s) now exist and the pending row is gone.
- **Manual, expired token**: manually expire a pending confirmation row (or wait past its `expires_at`) → confirm the confirm route rejects it gracefully (no crash, clear message).
- **Manual, CMS-driven list**: add/edit/deactivate a newsletter in `/admin` → confirm the account tab and public newsletter list reflect it within the cache's revalidate window / immediately via `revalidateTag`, without a deploy (invariant #8-style proof, same pattern as Phase 3's threshold).
- **Data verification**: `SELECT * FROM newsletter_subscriptions WHERE user_id IS NOT NULL;` and `SELECT * FROM pending_newsletter_confirmations;` at each step above.
- **Regression**: re-verify Phase 1's email sending (`sendAuthEmailSafe`/console fallback) still works correctly after this phase's additional `email.ts` usage, and re-verify Phase 2/4's account tabs still render after the tab-list extension.

### Durable Report Target

`process/features/account/reports/phase-05-newsletters-double-optin_REPORT_<execution-date>.md`

### Blockers That Would Justify 🚧 BLOCKED

- The header `SubscribeButton`/homepage CTA components turn out, at Phase 5 kickoff research, to have materially different current behavior than assumed here (this section explicitly does not claim to have verified their exact file paths) — re-research and possibly re-scope before executing, don't guess.
- dtw's actual 6-newsletter naming/slug set (per `process/features/newsletters/_GUIDE.md`, if it exists and has been fleshed out by then) conflicts with the fixture assumed here.

### Resume Handoff Notes

Reread this Phase 5 section, the Phase 1 report (confirm `email.ts`'s exact final shape), and `process/features/newsletters/_GUIDE.md` (if it exists by then) before executing. Confirm the header/homepage subscribe component file paths via fresh `Grep`/`Glob`, since this umbrella explicitly did not verify them.

---

## Known Bugs to NOT Port (Cross-Phase Checklist)

Restated from AD-8 as a single scannable checklist for every phase's validation gate:

- [ ] (Phase 1) OAuth provider buttons are env-gated, never hardcoded `true`.
- [ ] (Phase 1) Exactly one verification email is sent on email+password signup, not two.
- [ ] (Phase 1) `apps/web/src/payload/collections/Users.ts`'s `role` field has admin-only field-level write access.
- [ ] (Phase 2) No `article_views` table or per-page-load view counting without dedupe is introduced.
- [ ] (Phase 5) `newsletter_subscriptions` writes are keyed on `user_id` when a session exists, not email-only.

---

## Program-Wide Risks

Carried forward from the research (`synthesis.risks`), re-scoped to this program's decisions:

1. **Migration-system collision** (Drizzle vs. Payload) — mitigated by AD-7 and the explicit "Phase 3/5 go through Payload's own migration system" notes above. Never cross-generate.
2. **`packages/db` is shared with `dtw-engine`** — additive-only, per AD-7. No phase in this program renames or drops anything.
3. **ISR/caching of personalized content** — the single most repeated risk across all 5 phases (convention #8, restated per-phase). Every phase touching a cached RSC must re-verify this explicitly in its own validation gates, not just trust this umbrella's wording.
4. **Session cookie / `BETTER_AUTH_URL` domain on preview deployments** — OAuth redirect URIs and magic links are host-scoped; `*.vercel.app` preview URLs will not round-trip OAuth correctly. Phase 1's manual OAuth verification should be run against `localhost` and (if available) the canonical production-like origin, not an arbitrary preview URL, and this should be noted in the Phase 1 report as a known limitation rather than treated as a bug.
5. **Magic link is net-new code**, not a port — the single highest-defect-risk item in Phase 1 despite looking small (per the research). Budget Phase 1's manual testing time accordingly.
6. **Apple OAuth complexity** — mitigated by shipping it gated OFF in Phase 1 (AD-1). Do not attempt to wire actual Apple credentials as part of this program; that is explicitly future work once Apple Developer credentials exist.
7. **`@dtw/db/client` throws at import time without `DATABASE_URL`** — every new module importing it needs the `server-only` guard (convention #2). A single accidental client-bundle import breaks the build; catch this at `pnpm build` time in every phase's validation gates, not just typecheck.
8. **Role-case mismatch is load-bearing** — mitigated by the single `roleAtLeast()` helper introduced in Phase 1 (convention #5). Any phase introducing a new role comparison must use it, not re-derive string comparisons.
9. **Account page RSC conversion touches the provider-layering boundary** (`(reader)/layout.tsx`) — Phase 2's rewrite and Phase 3's threshold-prop addition both touch this file; each must re-verify `/admin` still never mounts `ShellProvider`/`AuthModal`.
10. **RIPER-5 process risk** — this is exactly why this program is structured as an umbrella + 5 phase plans rather than one mega-plan; AD-3 makes this explicit.

---

## Context Doc Reconciliation Needed

Two existing `process/context/` docs are stale relative to this program's confirmed decisions. This umbrella plan does **not** edit them (PLAN mode may only write the plan artifact), but the phase that resolves each conflict must update the doc as part of its "durable capture" step (loop step 7), and this is flagged here so it survives compaction:

| Doc | Current text | Conflict | Resolve during |
|---|---|---|---|
| `process/context/auth/all-auth.md` | "Planned: `apps/web/src/middleware.ts` checks role for..." | AD-6 — no middleware is built in this program | Phase 1's durable capture step (update the doc to reflect the per-page/per-action pattern actually shipped) |
| `process/features/articles/_GUIDE.md` | "Threshold: read from PostHog feature flag `paywall_meter_threshold`" | AD-2 — threshold comes from a Payload Global instead | Phase 3's durable capture step |

Also worth noting: the reference doc `process/features/account/references/brief-asia-port-map_REFERENCE_03-07-26.md` named as this program's intended research artifact **now exists on disk** and captures the scratchpad JSON's `synthesis`/`research` content. All 5 phase plans in `active/` cite it as their primary durable research reference (scratchpad path retained as a secondary/original-source note), so later phases' kickoff re-research no longer depends solely on the scratchpad file surviving.

---

## Program Closeout Criteria

This program is complete when:

- All 5 phases are `✅ VERIFIED` (own gates **and** regression checks both passed, per `phase-programs.md`'s Phase Status Rules).
- The two context-doc conflicts above are reconciled.
- The Known Bugs checklist is fully checked off.
- Every phase report exists in `process/features/account/reports/`.
- This umbrella plan's Phase Status Table reflects final `✅ VERIFIED` status for all 5 rows.
- The umbrella plan (and any phase plans still in `active/`) are moved to `process/features/account/completed/` per an explicit UPDATE PROCESS pass — not silently.

The program can be considered complete even though the items in [Foundation vs. Expansion](#foundation-vs-expansion-boundary-deferred-work) remain unbuilt — that boundary is intentional and documented, not a gap in this program's own scope.

---

## Resume and Execution Handoff (Program-Wide)

If this program is resumed after a long gap or context compaction:

1. Read this umbrella plan in full first.
2. Check the Phase Status Table above for the current phase.
3. Check `process/features/account/active/` for whether that phase's dedicated plan file has been created yet — if not, the next step is a PLAN pass for that phase (with fresh RESEARCH first per the Re-Research Rule), not EXECUTE.
4. Check `process/features/account/reports/` for the most recent phase report to understand what was actually verified vs. assumed.
5. Re-verify codebase drift against this umbrella's [Grounding & Verification Method](#grounding--verification-method) section before trusting any specific file path or line number cited above — this plan was grounded on 03-07-26 and code may have moved since.
6. Never execute more than one phase's scope in a single EXECUTE pass, even if multiple phases appear unblocked (Phase 3 and Phase 4 are parallel-eligible in principle, but only one should be "in flight" at a time per `phase-programs.md`'s orchestrator responsibilities).

---

## Rules for This Project (Cheat Sheet)

- Tech stack: Next.js 15 App Router, React 19, TypeScript strict, Payload CMS 3 (`push:false`, own migration dir), Drizzle ORM on Postgres 16, Better-Auth (self-hosted on Drizzle), Resend + React-Email-style HTML templates, Tailwind v4 via CSS vars (no hardcoded rgba).
- Naming: kebab-case files, PascalCase components, camelCase functions/vars — matches every file cited above.
- Every new server-side DB/session module starts with `import "server-only"`.
- Every new user-facing string uses `t(en, vi, id)` via `useT()`, except transactional email bodies (AD-4).
- Every new cache-relevant Payload read is `unstable_cache`'d with an explicit tag, busted by an `afterChange`/`GlobalAfterChangeHook` using the existing `bust()` helper convention in `apps/web/src/payload/hooks/revalidate.ts`.
- Every new Drizzle table/column: `pnpm db:generate`, commit the SQL, additive-only (AD-7). (No phase in this program is currently expected to need one — see AD-7's per-phase notes.)
- Every new Payload collection/Global: config file → register in `apps/web/payload.config.ts` → `pnpm --filter web payload:migrate:create` → commit the generated migration.
- No `middleware.ts` (AD-6). No PostHog dependency for anything required by this program (AD-2). No password i18n for transactional emails (AD-4). No `/admin` ↔ Better-Auth reconciliation, no editor 2FA (AD-5).

---

## Next Step

This umbrella plan was the only artifact the initial PLAN pass produced. Per AD-3, each phase plan required its own dedicated PLAN pass (with fresh RESEARCH first) — all 5 have since been produced and now exist in `process/features/account/active/` (see the [Phase Status Table](#phase-status-table)).

**Recommended immediate next action:** run the Mandatory Per-Phase Loop's step 1 (Research subagent — re-verify codebase drift against `phase-01-auth-foundation_PLAN_03-07-26.md`'s grounding) for Phase 1, then request explicit `ENTER EXECUTE MODE` approval for that phase plan alone. Do not skip the re-research step just because the plan file already exists — code may have moved since it was grounded.

**Resolved item:** the durable reference doc at `process/features/account/references/brief-asia-port-map_REFERENCE_03-07-26.md` now exists on disk and is cited by all 5 phase plans as their primary research reference.
