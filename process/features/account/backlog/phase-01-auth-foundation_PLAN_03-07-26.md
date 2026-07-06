# Phase 1 — Auth Foundation (Real Better-Auth Sessions)

**Date**: 03-07-26
**Complexity**: Complex — Phase 1 of 5 in the `account` phase program
**Feature**: `account`
**Status**: ⏳ PLANNED
**Parent plan:** `process/features/account/active/reader-auth-account_UMBRELLA-PLAN_03-07-26.md` (read that file's Phase 1 section, Architecture Decisions AD-1 through AD-8, Global Conventions, and Global Blast Radius before executing — this plan expands that section to execute-ready depth and must stay consistent with it. Where this plan adds detail the umbrella did not lock down, that detail is called out explicitly as a "Phase 1 decision" below, not silently assumed.)
**Durable reference:** `process/features/account/references/brief-asia-port-map_REFERENCE_03-07-26.md` (condensed research; this plan additionally re-verified the specific file contents cited below directly against both repos during this PLAN pass — see Grounding & Verification Method)

**Execute anchor:** This file is the primary execute anchor for Phase 1 — EXECUTE must be pointed at this exact path (`process/features/account/active/phase-01-auth-foundation_PLAN_03-07-26.md`). Supporting phase files (context only, not execute targets for this phase's scope): the umbrella plan (`reader-auth-account_UMBRELLA-PLAN_03-07-26.md`) and the sibling phase plans (`phase-02` through `phase-05`), each of which now exists in `active/` and each of which still requires its own fresh RESEARCH re-verification at its own kickoff, per `phase-programs.md`'s Re-Research Rule, before that phase's EXECUTE begins.

---

## Quick Links

- [Objective](#objective)
- [Phase Completion Rules](#phase-completion-rules)
- [Acceptance Criteria](#acceptance-criteria)
- [Dependencies](#dependencies)
- [Grounding & Verification Method](#grounding--verification-method)
- [Architecture Decisions Inherited From the Umbrella](#architecture-decisions-inherited-from-the-umbrella)
- [Execution Brief](#execution-brief)
- [Touchpoints](#touchpoints)
- [Detailed Flows](#detailed-flows)
- [Micro-Decisions Locked by This Plan](#micro-decisions-locked-by-this-plan-not-open-for-silent-reinterpretation)
- [Public Contracts](#public-contracts)
- [Out of Scope](#out-of-scope)
- [Blast Radius](#blast-radius)
- [Known Bugs This Phase Must NOT Port](#known-bugs-this-phase-must-not-port)
- [Context Doc Reconciliation (Phase 1's Durable-Capture Responsibility)](#context-doc-reconciliation-phase-1s-durable-capture-responsibility)
- [Validation Gates](#validation-gates)
- [Verification Evidence](#verification-evidence)
- [Durable Report Target](#durable-report-target)
- [Blockers That Would Justify 🚧 BLOCKED](#blockers-that-would-justify--blocked)
- [Resume and Execution Handoff](#resume-and-execution-handoff)
- [Implementation Checklist](#implementation-checklist)
- [Rules for This Phase (Cheat Sheet)](#rules-for-this-phase-cheat-sheet)
- [Next Step](#next-step)

---

## Objective

Replace `ShellProvider`'s fake, in-memory `user`/`setUser` with a real, server-verified Better-Auth session. A reader can sign up and sign in via **magic link** (primary CTA), **email + password** (with forgot/reset-password), or **Google / GitHub OAuth** (Apple registered but env-gated off), and sign out — from both the desktop header dropdown and the mobile menu. Every later phase in the `account` program builds on this real session. This phase also closes one small, pre-existing RBAC weakness in Payload's `Users` collection (AD-8 #4) while the phase is already touching adjacent auth/session surface.

**What "done" looks like at the end of this phase:** everything else in the app still renders exactly as it does today (mock account tabs, hardcoded paywall threshold, mock dashboards) — only login/logout/session state becomes real. Phases 2–5 are what turn the rest of the app real.

---

## Phase Completion Rules

A phase is NOT complete until:

1. **Integration Test** — Works with other system pieces end-to-end.
2. **Manual Test** — A human (or an equivalent scripted flow) can actually perform the action.
3. **Data Verification** — Database/state changes confirmed by an actual query, not by code inspection.
4. **Error Handling** — Failure cases (missing env var, mail outage, unverified email, duplicate/expired token) are handled gracefully, not just the happy path.
5. **User Confirmation** — The plan owner (user) explicitly confirms the phase works, not just that the agent believes it does.

Status meanings:

| Marker | Meaning |
|---|---|
| ⏳ PLANNED | Not started |
| 🔨 CODE DONE | Written but not end-to-end tested |
| 🧪 TESTING | Currently being tested |
| ✅ VERIFIED | Tested AND confirmed working (this phase's own gates **and** there is nothing yet to regress against — Phase 1 is first) |
| 🚧 BLOCKED | Has issues preventing completion |

This phase report (`process/features/account/reports/phase-01-auth-foundation_REPORT_<execution-date>.md`) must document: what was tested manually (exact steps), data verified in DB (query + result), errors encountered and fixed, and user confirmation received. "Build succeeds" / "no TypeScript errors" alone is `🔨 CODE DONE`, never `✅ VERIFIED`.

---

## Acceptance Criteria

Testable, phase-scoped roll-up of the manual flows in [Validation Gates](#validation-gates):

- [ ] A reader can create an account and sign in via magic link (a real, single-use, 15-minute-expiry token verified end-to-end), with the dev console fallback observable when `RESEND_API_KEY` is unset.
- [ ] A reader can sign up via email + password, receives exactly one verification email (not two — AD-8 #2), and cannot sign in until the link is clicked.
- [ ] A reader can request and complete a password reset; anti-enumeration copy is identical for existing and non-existent emails; the reset token is single-use.
- [ ] A reader can sign in via Google and GitHub OAuth when credentials are configured, with the server-side provider registration and the client-side button visibility independently and correctly gated on their respective env vars (never hardcoded `true` — AD-8 #1).
- [ ] The Apple OAuth button does not render and the Apple provider is not registered when the four Apple env vars are unset (the default state).
- [ ] A reader can sign out from both the desktop dropdown and the mobile menu, clearing the session cookie in both cases.
- [ ] `useShell().user` reflects a real Better-Auth session everywhere it is read; no code path still calls the removed `setUser()` demo login.
- [ ] A Payload `author`-role user cannot escalate their own `role` to `admin` via a direct API write (AD-8 #4).
- [ ] None of the three brief-asia bugs listed in [Known Bugs This Phase Must NOT Port](#known-bugs-this-phase-must-not-port) are present in the shipped code.
- [ ] `pnpm typecheck`, `pnpm lint`, and `pnpm build` all pass clean at the repo root.
- [ ] The phase report exists at the Durable Report Target with real DB-query evidence, not just "build succeeded."
- [ ] The four Context Doc Reconciliation edits are applied.

---

## Dependencies

None — this is the first phase in the program (`process/features/account/active/reader-auth-account_UMBRELLA-PLAN_03-07-26.md` Phase Status Table: Phase 1 depends on nothing). Phases 2, 3, 4, and 5 all depend on this phase reaching `✅ VERIFIED`.

---

## Grounding & Verification Method

This plan was written after reading `process/context/all-context.md`, `process/context/planning/all-planning.md`, `process/development-protocols/plan-lifecycle.md`, and the umbrella plan in full. It is grounded in `research-port-map.json`'s `synthesis` + `research.briefAuth` + `research.briefUsers` + `research.dtwState` sections and in `process/features/account/references/brief-asia-port-map_REFERENCE_03-07-26.md` (both consistent with each other).

During this PLAN pass, the following were freshly re-verified against the live filesystem (not merely copied from research):

- `test -e` confirmed presence of all 11 `brief-asia-web` source files cited below (`src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/lib/email.ts`, `src/lib/account.ts`, `src/app/api/auth/[...all]/route.ts`, `src/components/auth-modal.tsx`, `src/lib/shell.tsx`, `src/app/(reader)/[locale]/reset-password/page.tsx`, `src/payload/collections/Users.ts`, `src/db/schema/auth.ts`, `.env.example`) and all 14 `dtw-web` touchpoint files/dirs (`apps/web/package.json`, `apps/web/src/lib/shell.tsx`, `apps/web/src/components/auth-modal.tsx`, `apps/web/src/components/header.tsx`, `apps/web/src/payload/collections/Users.ts`, `packages/db/src/schema/{auth,account}.ts`, `packages/db/src/client.ts`, `.env.example`, `apps/web/src/app/(reader)/layout.tsx`, `apps/web/src/lib/{i18n,payload-server}.ts`, `apps/web/src/payload/hooks/revalidate.ts`).
- **Read in full**: brief-asia's `src/lib/auth.ts` (120 lines), `src/lib/auth-client.ts`, `src/lib/email.ts`, `src/lib/account.ts`, `src/components/auth-modal.tsx` (311 lines), `src/app/(reader)/[locale]/reset-password/page.tsx` — exact code cited in [Touchpoints](#touchpoints) and [Detailed Flows](#detailed-flows) below is copied from these reads, not paraphrased from research.
- **Read in full**: dtw's `apps/web/src/lib/shell.tsx` (91 lines, confirmed still the fake in-memory stub described by research — no drift), `apps/web/src/components/auth-modal.tsx` (154 lines, confirmed still the self-declared "Phase 1 stub" with `demoLogin()` — no drift), `apps/web/src/payload/collections/Users.ts` (confirmed no field-level `access` on `role` today), `packages/db/src/schema/auth.ts` and `account.ts` in full (confirmed exact column names/types cited below), `apps/web/src/app/(reader)/layout.tsx` (confirmed provider order: `I18nProvider > ThemeProvider > ShellProvider`, confirmed `/admin` is never wrapped in these providers), `.env.example` (confirmed `GOOGLE_CLIENT_ID/SECRET`, `APPLE_CLIENT_ID/TEAM_ID/KEY_ID/PRIVATE_KEY`, `GITHUB_CLIENT_ID/SECRET`, `RESEND_API_KEY`, `RESEND_FROM_DOMAIN="dailytechwire.com"`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` are already present — **no env var renames or removals needed, only 3 additions**), `apps/web/src/payload/hooks/revalidate.ts` (confirmed the `bust()`/`revalidationDisabled()` hook conventions Phase 1 does *not* need to touch, since no new Payload collection/global is added in this phase).
- **Grep-confirmed** exact current call sites in `apps/web/src/components/header.tsx`: `setUser(null)` appears at **line 420** (desktop dropdown "Log out" button) and **line 828** (mobile menu "Log out" button); `openAuth` is called at lines 443, 609, 847; `articlesRead >= 3` hardcoded threshold is at **line 49** (`showNudge`, `NUDGE_KEY = "dtw-nudge-dismissed"`) — **Phase 1 does not touch line 49 or the nudge logic at all** (Phase 3's scope).
- **Confirmed via `pnpm`/`package.json` inspection**: `better-auth` and `resend` are absent from `apps/web/package.json` today; brief-asia pins `"better-auth": "^1.6.20"` and `"resend": "^6.14.0"` in its own `package.json` (grep-confirmed) — this plan uses the same version pins.
- **Confirmed** `@dtw/db` package exports: `"."` → `./src/index.ts` (schema barrel, re-exports `./schema/auth` + `./schema/account`, so `users`, `sessions`, `accounts`, `verifications` are importable as `import { users, sessions, accounts, verifications } from "@dtw/db"`), `"./client"` → `./src/client.ts` (exports `db`, throws at import time if `DATABASE_URL` unset — pre-existing repo-wide constraint, not new to this phase).
- **Confirmed** `@dtw/ui` exports `Button` (already used successfully in the current `auth-modal.tsx` stub with `variant`/`size`/`type`/`style` props) — no new UI primitives are needed for this phase.
- **Confirmed** root `turbo.json`'s `build.env` allowlist currently lists `DATABASE_URL`, `PAYLOAD_SECRET`, `R2_BUCKET`, `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` — it does **not** yet list any Better-Auth/OAuth/Resend var. `envMode`/`globalEnv` strict mode is not enabled in `turbo.json`, so this is **not a build blocker** (turbo defaults to passing all env vars through), but it is a real cache-correctness gap this plan closes as a small additive touchpoint (see [Touchpoints](#touchpoints)).
- **Confirmed** `apps/web/src/lib/i18n.tsx` exports `useT()` returning a `t(en, vi, id)` triple resolver (`Lang = "en" | "vi" | "id"`) — the exact pattern every new string in this phase must use.
- **Confirmed** literal hex values for the transactional-email template (email clients cannot reliably read CSS custom properties, so the ported `actionEmail()` HTML template must hardcode literals — this is the one place in the repo where hardcoding hex instead of `var(--...)` is correct, not a violation of the "never hardcode rgba" convention, which governs the app's own CSS, not third-party-rendered email HTML): from `apps/web/src/app/globals.css`, light theme (email is always rendered light-themed, matching brief-asia's own approach) — `--paper: #FDFCF8`, `--ink: #111111`, `--muted: #5B5B58`, `--accent: #D4623C` (DTW terracotta, softened in the 2026-06-14 refresh), `--accent-ink: #B14A28`, `--brand-navy: #1B2A52`.
- **No drift found** anywhere between what the umbrella plan (dated the same day, 03-07-26) asserts and what this pass independently re-verified. No re-scoping was required.

---

## Architecture Decisions Inherited From the Umbrella

These are locked by the umbrella plan and restated here only as a quick reference — the umbrella is the source of truth; do not relitigate:

- **AD-1** — magic link (primary) + email/password (ported, incl. forgot/reset) + OAuth (Google/GitHub live, Apple registered but env-gated off) — all three auth methods ship in this phase.
- **AD-4** — auth/transactional emails are English-only at launch; all surrounding UI chrome still uses `t(en, vi, id)`.
- **AD-5** — Better-Auth `auth_users` stays fully disjoint from Payload's editorial `users` collection. No reconciliation, no editor 2FA, in this phase or program.
- **AD-6** — no `apps/web/src/middleware.ts` is created. Enforcement is per-page (`getSessionUser()` + inline sign-in prompt) and per-action (`requireUser()`). Phase 1 introduces `session.ts` with these two functions but does not yet have a page/action to gate (that starts in Phase 2) — Phase 1's own job is just to make the functions correct and importable.
- **AD-7** — `packages/db` is shared with `dtw-engine`; additive-only schema changes. **This phase requires zero Drizzle schema changes** — `packages/db/src/schema/auth.ts` already matches the Better-Auth Drizzle adapter's expected shape exactly (confirmed by direct read, see Grounding).
- **AD-8** — do not port brief-asia's known bugs. Three of the five are Phase 1's direct responsibility: #1 (hardcoded `googleEnabled = true`), #2 (double verification email on signup), #4 (Payload `Users.role` self-escalation). See [Known Bugs This Phase Must NOT Port](#known-bugs-this-phase-must-not-port).

---

## Execution Brief

Grouped into five logical sub-stages. Each should be implemented and smoke-tested (via `pnpm typecheck`) roughly in this order, though they can be committed together at the end of the phase — this phase does not require its own internal PAUSE checkpoints the way the 5-phase *program* does.

### Group A — Server auth foundation (email + Better-Auth config)

- **What happens:** `apps/web/src/lib/email.ts` and `apps/web/src/lib/auth.ts` are created. This is the first time `@dtw/db/client` is imported anywhere in `apps/web/src`.
- **Test:** `pnpm typecheck` passes; `pnpm build` succeeds (validates the `server-only` guard doesn't leak into a client bundle, and that `drizzleAdapter`'s schema map compiles against `@dtw/db`'s actual exported table shapes).
- **Verify:** No DB state yet — this group produces no runtime side effects until Group B's route is hit.
- **Done when:** `apps/web/src/lib/auth.ts` exports a valid `auth` object with no TypeScript errors, and `pnpm build` is green.

### Group B — Client auth infra (auth-client, session, route mount)

- **What happens:** `apps/web/src/lib/auth-client.ts`, `apps/web/src/lib/session.ts`, and `apps/web/src/app/api/auth/[...all]/route.ts` are created.
- **Test:** With the dev server running (`pnpm dev`), `curl -i http://localhost:3000/api/auth/session` (no cookie) returns `200` with a JSON body indicating no session (Better-Auth's session endpoint responds even for anonymous callers — this is the first live proof the handler is mounted).
- **Verify:** No DB writes yet from an anonymous session check.
- **Done when:** The curl above returns a 200 (not a 404/500), proving the catch-all route is correctly wired to `auth.ts`.

### Group C — Reset-password page

- **What happens:** `apps/web/src/app/(reader)/reset-password/page.tsx` is created.
- **Test:** Visit `http://localhost:3000/reset-password` with no `?token=` — the "needs a valid reset link" message renders (no crash).
- **Verify:** N/A (no DB interaction without a real token).
- **Done when:** The page renders without a token and without crashing.

### Group D — Auth modal rewrite (the largest single item in this phase)

- **What happens:** `apps/web/src/components/auth-modal.tsx` is rewritten per [Detailed Flows](#detailed-flows) below: magic-link primary CTA with "Check your inbox" + 30s resend, email+password mode switch (signin/signup/forgot), OAuth buttons gated on `NEXT_PUBLIC_*_ENABLED`.
- **Test:** Manual, per [Validation Gates](#validation-gates) — magic-link roundtrip, password signup/login roundtrip, forgot/reset roundtrip, OAuth smoke.
- **Verify:** `auth_users` / `auth_sessions` / `auth_accounts` / `auth_verifications` rows, per [Validation Gates](#validation-gates).
- **Done when:** All four manual flows in Validation Gates pass and are confirmed by the user.

### Group E — Shell/header wiring + RBAC hardening + env/config additions

- **What happens:** `apps/web/src/lib/shell.tsx` is modified to derive `user` from `useSession()`; `apps/web/src/components/header.tsx`'s two `setUser(null)` call sites become `authClient.signOut()`; `apps/web/src/payload/collections/Users.ts` gets field-level `access` on `role`; `.env.example` and `turbo.json` get the small additive changes.
- **Test:** Sign in via any method → header shows the user menu → sign out from desktop dropdown → header reverts to "Log in" → repeat via mobile menu. Then the RBAC hardening manual check.
- **Verify:** Session cookie is cleared after sign-out (dev tools → Application → Cookies). RBAC check per [Validation Gates](#validation-gates).
- **Done when:** Sign-out works from both entry points and the RBAC hardening check passes.

**Expected outcome at the end of this phase:**

- A reader can create an account and sign in via magic link, email+password, or Google/GitHub OAuth, and sign out, with a real server-verified session.
- `useShell().user` reflects the real session everywhere it is read today (header only, in this phase — `article-content.tsx` and the `/account` page still read `useShell().user` but their *other* behavior, e.g. the account tabs' mock data, is untouched until Phase 2).
- Nothing else in the app changes. The paywall threshold is still hardcoded (Phase 3). The account page still shows mock data (Phase 2). This is intentional and expected — see [Out of Scope](#out-of-scope).

---

## Touchpoints

_(Exact files to create or modify in this phase — the Scope of Phase 1.)_

| # | File | Action | Change |
|---|---|---|---|
| 1 | `apps/web/package.json` | modify | Add `"better-auth": "^1.6.20"` and `"resend": "^6.14.0"` to `dependencies`. Run `pnpm install` at the repo root afterward (updates the workspace lockfile). |
| 2 | `apps/web/src/lib/email.ts` | **create** | Port brief-asia's `src/lib/email.ts` near-verbatim. See exact shape below. |
| 3 | `apps/web/src/lib/auth.ts` | **create** | Better-Auth server config. Port brief-asia's `src/lib/auth.ts` structurally; deviate per AD-1/AD-8. See exact shape below. |
| 4 | `apps/web/src/lib/auth-client.ts` | **create** | Port brief-asia's `src/lib/auth-client.ts`, add `magicLinkClient()`, add `authCallbackUrl()`. See exact shape below. |
| 5 | `apps/web/src/lib/session.ts` | **create** | Port `getSessionUser()`/`requireUser()` from brief-asia's `src/lib/account.ts` (the session-read portion only — the bookmark/history/follow list reads in that same brief-asia file are **Phase 2's** concern, not ported here). Add `roleAtLeast()`. See exact shape below. |
| 6 | `apps/web/src/app/api/auth/[...all]/route.ts` | **create** | Mount verbatim from brief-asia. See exact shape below. |
| 7 | `apps/web/src/app/(reader)/reset-password/page.tsx` | **create** | Port brief-asia's `src/app/(reader)/[locale]/reset-password/page.tsx`, dropping the `[locale]` segment and the `LocaleLink` import (dtw uses plain `next/link`, confirmed via `header.tsx`'s own import). See exact shape below. |
| 8 | `apps/web/src/lib/shell.tsx` | modify | Replace in-memory `user`/`setUser` with a `useSession()` + `toShellUser()` bridge. Remove `setUser` from the exposed context (see [Micro-Decisions](#micro-decisions-locked-by-this-plan-not-open-for-silent-reinterpretation)). `articlesRead`/`incrementRead` are **untouched** — do not modify them in this phase. |
| 9 | `apps/web/src/components/auth-modal.tsx` | **rewrite** | Full mode state machine. See [Detailed Flows](#detailed-flows). This is the largest single file change in the phase. |
| 10 | `apps/web/src/components/header.tsx` | modify | Line ~420 (desktop dropdown "Log out") and line ~828 (mobile menu "Log out"): replace `setUser(null)` with `authClient.signOut()`. Import `authClient` from `@/lib/auth-client`. **No other change to this file** — do not touch line 49's hardcoded threshold (Phase 3's scope). |
| 11 | `apps/web/src/payload/collections/Users.ts` | modify | Add field-level `access.update` on the `role` field (AD-8 #4). See exact shape below. |
| 12 | `.env.example` (repo root) | modify | Add `NEXT_PUBLIC_GOOGLE_ENABLED`, `NEXT_PUBLIC_GITHUB_ENABLED`, `NEXT_PUBLIC_APPLE_ENABLED` with an explanatory comment. No existing lines change. |
| 13 | `turbo.json` (repo root) | modify | Add `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_DOMAIN` to the `build` task's `env` array, alongside the existing `DATABASE_URL`/`PAYLOAD_SECRET`/`R2_*` entries. Minor, additive, discovered during this plan's grounding — not a build blocker today (turbo is not in strict env mode) but closes a real Vercel remote-cache correctness gap: without this, changing a secret in production would not correctly invalidate turbo's remote build cache. |
| 14 | `process/context/auth/all-auth.md` | modify (durable capture, do at the end of EXECUTE) | Three corrections — see [Context Doc Reconciliation](#context-doc-reconciliation-phase-1s-durable-capture-responsibility). |
| 15 | `process/features/account/_GUIDE.md` | modify (durable capture, do at the end of EXECUTE) | One correction (the `/auth/callback` route claim) — see [Context Doc Reconciliation](#context-doc-reconciliation-phase-1s-durable-capture-responsibility). |

### Exact shape — `apps/web/src/lib/email.ts`

Port brief-asia's `src/lib/email.ts` (56 lines, read in full during grounding) with these substitutions only:

- `fromDomain` fallback: `"briefasia.com"` → `"dailytechwire.com"` (matches `.env.example`'s `RESEND_FROM_DOMAIN` default already).
- `FROM` template: `` `BriefAsia <no-reply@${fromDomain}>` `` → `` `DailyTechWire <no-reply@${fromDomain}>` ``.
- `actionEmail()`'s inline HTML template — replace the hardcoded literals (brief-asia used `#FCFBF8`/`#241a33`/`#A60F2D`/`#4a4150`/`#9a958c`) with dtw's literal light-theme hex confirmed in Grounding: background `#FDFCF8`, body/heading ink `#111111`, intro/paragraph `#5B5B58`, button + accent `#D4623C`, footer muted a shade lighter than `#5B5B58` (e.g. `#8A8A86`, matching the visual weight brief-asia's `#9a958c` had relative to its own ink/muted pair). Replace the wordmark `BRIEF<span style="font-style:italic">Asia</span>` (color `#A60F2D`) with a text wordmark reflecting invariant #11's navy-monogram-plus-lowercase-wordmark brand (no SVG in email — most email clients don't render inline SVG reliably): `<span style="color:#1B2A52">DTW</span> <span style="font-style:italic;font-weight:700;color:#D4623C">dailytechwire</span>`.
- Everything else — the `apiKey ? new Resend(apiKey) : null` construction, the dev-console fallback block (`"[email · dev console]"` banner, printing `msg.text` with the raw link), the `sendEmail()` throw-on-Resend-error behavior, `actionEmail()`'s `{heading, intro, buttonLabel, url, footer?}` signature and its `{html, text}` return shape — ports **verbatim**, including the `import "server-only";` guard on line 1.

### Exact shape — `apps/web/src/lib/auth.ts`

Port brief-asia's `src/lib/auth.ts` (120 lines, read in full) structurally, with these deviations:

```ts
import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { db } from "@dtw/db/client";
import { users, sessions, accounts, verifications } from "@dtw/db";
import { sendEmail, actionEmail } from "@/lib/email";

// sendAuthEmailSafe(context, msg) — port verbatim from brief-asia (catch+log,
// never throws; a mail outage must not roll back account creation / reset /
// email-change / magic-link send).

const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const githubConfigured = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
const appleConfigured = Boolean(
  process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID &&
  process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY
);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user: users, session: sessions, account: accounts, verification: verifications },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 3600, // 1 hour — ported unchanged from brief-asia
    sendResetPassword: async ({ user, url }) => {
      const { html, text } = actionEmail({
        heading: "Reset your password",
        intro: "We received a request to reset your DailyTechWire password. This link expires in 1 hour.",
        buttonLabel: "Reset password",
        url,
      });
      await sendAuthEmailSafe("reset-password", {
        to: user.email, subject: "Reset your DailyTechWire password", html, text,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const { html, text } = actionEmail({
        heading: "Confirm your email",
        intro: "Welcome to DailyTechWire. Confirm your email to activate your account.",
        buttonLabel: "Verify email",
        url,
      });
      await sendAuthEmailSafe("verify-email", {
        to: user.email, subject: "Confirm your DailyTechWire account", html, text,
      });
    },
    // NOTE (AD-8 #2 fix): do NOT add anything in auth-modal.tsx that calls
    // authClient.sendVerificationEmail() again after signUp.email() succeeds.
    // sendOnSignUp:true above is the ONLY trigger. This is a deliberate
    // deviation from brief-asia's auth-modal.tsx, which double-sends.
  },
  socialProviders: {
    ...(googleConfigured
      ? { google: { clientId: process.env.GOOGLE_CLIENT_ID as string, clientSecret: process.env.GOOGLE_CLIENT_SECRET as string } }
      : {}),
    ...(githubConfigured
      ? { github: { clientId: process.env.GITHUB_CLIENT_ID as string, clientSecret: process.env.GITHUB_CLIENT_SECRET as string } }
      : {}),
    // Apple — see Micro-Decisions below. Do NOT force-register `apple` with a
    // guessed field shape; leave it unregistered unless `appleConfigured` is
    // true AND the installed better-auth Apple provider's exact field names
    // have been confirmed against its shipped types.
  },
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "reader", input: false },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ newEmail, url }) => {
        const { html, text } = actionEmail({
          heading: "Confirm your new email",
          intro: "Confirm this address to finish changing the email on your DailyTechWire account.",
          buttonLabel: "Confirm new email",
          url,
        });
        await sendAuthEmailSafe("change-email", {
          to: newEmail, subject: "Confirm your new DailyTechWire email", html, text,
        });
      },
    },
    deleteUser: { enabled: true }, // Phase 4 wires the UI; enabling the option here now costs nothing.
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // refresh at most once a day
  },
  plugins: [
    magicLink({
      expiresIn: 60 * 15, // 15 minutes, per process/context/auth/all-auth.md
      disableSignUp: false, // first magic-link click for a new email creates the account (role defaults 'reader')
      sendMagicLink: async ({ email, url }) => {
        const { html, text } = actionEmail({
          heading: "Sign in to DailyTechWire",
          intro: "Click below to sign in. This link expires in 15 minutes and can only be used once.",
          buttonLabel: "Sign in",
          url,
        });
        await sendAuthEmailSafe("magic-link", {
          to: email, subject: "Sign in to DailyTechWire", html, text,
        });
      },
    }),
    nextCookies(), // MUST be last in the plugin chain (verified brief-asia source comment).
  ],
});
```

This is a **reference shape**, not a drop-in file — the execute-agent must cross-check `magicLink()`'s exact option names (`expiresIn`, `disableSignUp`, `sendMagicLink`'s callback argument shape — likely `{ email, token, url }`) against the actual TypeScript types shipped in the installed `better-auth@^1.6.20` package once `pnpm install` has run (this plan was authored without the package installed locally, since it is not yet a dependency — see Grounding). A mismatch in option *names* is a normal implementation detail to resolve inline, not a plan deviation requiring a return to PLAN — but a mismatch that changes token expiry, single-use, or auto-account-creation *semantics* described in [Detailed Flows](#detailed-flows) is a real deviation and must be flagged in the phase report.

### Exact shape — `apps/web/src/lib/auth-client.ts`

```ts
"use client";
import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [magicLinkClient()],
});

export const { signIn, signUp, signOut, useSession, resetPassword } = authClient;

/**
 * Centralizes callback/redirect URL construction (Global Convention #7 in the
 * umbrella plan) so the future /en /id /vi subpath migration is a one-line
 * change here, not a grep-and-replace across auth-modal.tsx. dtw has no
 * locale subpaths yet, so this returns a plain path today — never hardcode
 * "/en" the way brief-asia does.
 */
export function authCallbackUrl(path?: string): string {
  if (path) return path;
  if (typeof window !== "undefined") {
    return window.location.pathname + window.location.search;
  }
  return "/";
}
```

Port brief-asia's `createAuthClient()`/re-export lines verbatim; `magicLinkClient()` and `authCallbackUrl()` are net-new (brief-asia has neither).

### Exact shape — `apps/web/src/lib/session.ts`

```ts
import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string; // lowercase DB value: reader | pro | author | editor | admin
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  const u = session?.user;
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: (u as { role?: string }).role ?? "reader",
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

const ROLE_RANK: Record<string, number> = { reader: 0, pro: 1, author: 2, editor: 3, admin: 4 };

/**
 * Single source of truth for role comparisons (Global Convention #5). Takes
 * LOWERCASE role strings (the DB/session value) — do NOT pass shell.tsx's
 * capitalized User.role union here; that mismatch is exactly the silent-bug
 * class this helper exists to prevent.
 */
export function roleAtLeast(role: string | undefined, min: string): boolean {
  return (ROLE_RANK[role ?? "reader"] ?? 0) >= (ROLE_RANK[min] ?? 0);
}
```

`getSessionUser`/`requireUser` port brief-asia's `src/lib/account.ts` session-read logic verbatim (the `role` cast-with-fallback pattern is copied exactly, including the comment-worthy detail that Better-Auth's session typing doesn't know about the `additionalFields.role` field without extra client-side type wiring — see [Micro-Decisions](#micro-decisions-locked-by-this-plan-not-open-for-silent-reinterpretation)). `roleAtLeast` is net-new. **Do not** port brief-asia's `listBookmarks`/`listHistory`/`listFollows`/`listNewsletterSubs` into this file — those are Phase 2/5 scope and their source table imports (`bookmarks`, `readingHistory`, `follows`, `newsletterSubscriptions`) are out of scope here.

### Exact shape — `apps/web/src/app/api/auth/[...all]/route.ts`

```ts
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const { GET, POST } = toNextJsHandler(auth);
export const dynamic = "force-dynamic";
```

Ports brief-asia's route verbatim (2 substantive lines plus the `dynamic` export).

### Exact shape — `apps/web/src/app/(reader)/reset-password/page.tsx`

Port brief-asia's `src/app/(reader)/[locale]/reset-password/page.tsx` (135 lines, read in full) with these substitutions:

- Drop the `[locale]` route segment entirely — the file lives at `apps/web/src/app/(reader)/reset-password/page.tsx`, not under any locale-segment directory.
- `import { LocaleLink as Link } from "@/components/locale-link";` → `import Link from "next/link";` (dtw's own convention, confirmed via `header.tsx`'s import list).
- `import { Button } from "@briefasia/ui";` → `import { Button } from "@dtw/ui";`.
- `import { resetPassword } from "@/lib/auth-client";` stays the same import path shape (dtw's `auth-client.ts` also exports `resetPassword`).
- `Link href="/"` stays `href="/"` (brief-asia's own reset-success link already points to `"/"` unprefixed in this specific spot — verified in the read; only the `redirectTo` passed into `requestPasswordReset` from the *modal* used `/en/reset-password`, which is [Detailed Flows](#detailed-flows)'s concern, not this page's).
- The `t(...)` triples, the `ResetInner`/`Suspense` wrapper structure, the `token`/`confirm`/`error`/`done` state machine, the 8-char `minLength`, and the "Passwords don't match." validation all port **verbatim** — no product-behavior change on this page.

### Exact shape — `apps/web/src/payload/collections/Users.ts`

Add only the `access` block on the `role` field; nothing else in the file changes:

```ts
{
  name: "role",
  type: "select",
  required: true,
  defaultValue: "author",
  options: [
    { label: "Author", value: "author" },
    { label: "Editor", value: "editor" },
    { label: "Admin", value: "admin" },
  ],
  access: {
    update: ({ req }) => req.user?.role === "admin",
  },
  admin: {
    description:
      "Author: draft/submit. Editor: publish + manage taxonomy. Admin: full access. 2FA enforced on Editor + Admin in production.",
  },
},
```

Collection-level `access` (`read`/`create`/`update`/`delete` at the top of the file) is **unchanged** — this is purely additive field-level config, per AD-8 #4.

---

## Detailed Flows

This is the section the task brief specifically asked to be exhaustive about — magic link is net-new code (zero brief-asia equivalent) and is explicitly the program's highest-defect-risk item.

### Magic link — request → email → verify → session

1. Reader submits their email in the modal's default ("magic") mode → client calls `authClient.signIn.magicLink({ email, callbackURL: authCallbackUrl() })`.
2. Better-Auth's `magicLink` plugin writes a row to `auth_verifications` (`identifier` = the email, `value` = a generated token, `expiresAt` = now + **15 minutes**, per `expiresIn: 60 * 15` in `auth.ts`). No `auth_users` row is created at this step.
3. The plugin invokes `sendMagicLink({ email, url })` (this plan's `auth.ts` wraps it in `sendAuthEmailSafe`, so a Resend outage here does **not** throw back to the client — the UI still shows the "Check your inbox" state even if delivery silently failed; the failure is only visible in server logs). `url` is the fully-formed link (`BETTER_AUTH_URL` + the plugin's verify path + the token + the original `callbackURL`).
4. **Dev fallback (no `RESEND_API_KEY`):** `email.ts`'s `sendEmail()` prints the full message — including the clickable `url` — to the server console. This is how the manual gate below is performed without a real Resend account.
5. Reader clicks the link → Better-Auth's catch-all route (`/api/auth/[...all]/route.ts`, i.e. the plugin's internal verify endpoint, **not** a separate `/auth/callback` page — see [Context Doc Reconciliation](#context-doc-reconciliation-phase-1s-durable-capture-responsibility)) validates the token against `auth_verifications`.
6. **Single-use:** on successful verification, Better-Auth's adapter deletes/invalidates the consumed `auth_verifications` row (standard adapter behavior for every Better-Auth token type) — verify this at execute time by attempting to reuse a just-consumed link and confirming it is rejected (a manual gate item below; do not assume without checking, since this plan was authored without the package installed).
7. If no `auth_users` row exists for that email yet (first-ever magic link for this address), Better-Auth creates one: `role` defaults to `'reader'` (via `additionalFields.role.defaultValue`), `email_verified` should be set `true` (clicking the emailed link *is* the verification — confirm this exact behavior as part of the manual gate, since it directly satisfies `process/features/account/_GUIDE.md`'s "first magic link establishes the account with `role: 'Reader'`" requirement).
8. A `auth_sessions` row is created, the session cookie is set (via `nextCookies()`, last in the plugin chain), and the browser is redirected to the original `callbackURL` (captured by `authCallbackUrl()` at request time, so the reader lands back on the page they were reading, not always `/`).
9. **Resend throttle:** enforced client-side only in this phase — the "Check your inbox" screen's "Resend link" button is disabled for 30 seconds after each send (countdown shown as "Resend in Ns"), re-enabling to call `signIn.magicLink` again for the same email. There is **no server-side rate limit added in this phase** beyond whatever Better-Auth's own default internal rate-limiter applies (not configured/tuned here) — this is an accepted, documented Phase 1 gap, not a blocker (note it explicitly in the phase report).

### Email + password — signup

1. Reader switches to "password-signup" mode, submits name/email/password (client-side `minLength={8}`) → `signUp.email({ email, password, name })`.
2. Better-Auth creates the `auth_users` row (`role: 'reader'`, `email_verified: false`) and an `auth_accounts` row (`provider_id` = the credential provider, `password` = the hash).
3. `emailVerification.sendOnSignUp: true` fires **once**, server-side, calling `sendVerificationEmail` → `actionEmail(...)` → `sendAuthEmailSafe(...)`. **The modal does NOT call `authClient.sendVerificationEmail()` again afterward** — this is the explicit AD-8 #2 fix; brief-asia's modal does call it a second time, which is the bug being avoided.
4. Modal shows the in-place notice "Account created. Check your email to confirm and activate it." (ported verbatim from brief-asia; still accurate since it refers to the one automatic email, not a second explicit send).
5. `requireEmailVerification: true` blocks sign-in until the link is clicked. Verification token lives in `auth_verifications` (same table as magic link, different `identifier` semantics — Better-Auth's own internal disambiguation, not something this plan's code needs to handle specially).
6. Reader clicks the verify link → `autoSignInAfterVerification: true` sets `email_verified = true` and immediately establishes a session (no separate manual sign-in step needed).

### Email + password — sign in / sign out

- Sign in: `signIn.email({ email, password, rememberMe })` → on error, show the ported message ("Wrong email or password." / vi / id) — brief-asia's exact copy, DTW-branded where the copy references a brand (it doesn't, in this message). On success, `closeAuth()`; `useSession()` reactively updates the header (no explicit redirect).
- Sign out: `authClient.signOut()` from both `header.tsx` call sites (line ~420, line ~828). No redirect performed (matches brief-asia).

### Forgot / reset password

1. Modal "forgot" mode: submit email → `authClient.requestPasswordReset({ email, redirectTo: authCallbackUrl("/reset-password") })`.
2. **Anti-enumeration:** the UI shows the exact same notice ("If an account exists for that email, a reset link is on its way." / vi / id, ported verbatim) regardless of whether the email exists — this is enforced entirely client-side by always showing the notice after the call resolves, not by inspecting the response.
3. Server-side `sendResetPassword` fires only if the account exists (Better-Auth's own internal behavior) → `actionEmail(...)` → `sendAuthEmailSafe(...)`. Token stored in `auth_verifications`, **expiry 3600 seconds (1 hour)** — ported unchanged from brief-asia, no new spec requirement overrides this.
4. **Single-use:** same expectation as magic link — verify by attempting to reuse a consumed reset token and confirming rejection.
5. **Resend throttle:** none added in this phase (matches brief-asia — the anti-enumeration design makes throttling less security-critical here, since the response is identical either way; the form can be resubmitted immediately). Note this explicitly as an intentional, not overlooked, gap.
6. Reader clicks the link → lands on `/reset-password?token=...` → submits new password (8-char min, must match confirm field) → `resetPassword({ newPassword, token })` → on success, done-state UI with a link back to `/`.

### OAuth (Google / GitHub live; Apple gated off)

1. `handleGoogle`/`handleGithub` → `signIn.social({ provider: "google" | "github", callbackURL: authCallbackUrl() })`.
2. Redirect to the provider, callback lands on `/api/auth/callback/{provider}` (part of the same catch-all route — no separate file needed), Better-Auth upserts `auth_users` + an `auth_accounts` row keyed `(provider_id, account_id)`.
3. **Button visibility** is gated on `NEXT_PUBLIC_GOOGLE_ENABLED === "true"` / `NEXT_PUBLIC_GITHUB_ENABLED === "true"` respectively — never hardcoded `true` (this is the direct AD-8 #1 fix; brief-asia's `const googleEnabled = true;` with the real env check commented out is exactly the bug this phase must not reproduce).
4. Apple: `appleConfigured` (server) gates whether `socialProviders.apple` is registered at all; `NEXT_PUBLIC_APPLE_ENABLED` gates the button's visibility client-side. In this phase's default `.env.example` state (all four Apple vars empty), **the Apple button does not render** and the server does not register the provider — this is the expected, verified default, not a partial/broken feature.

---

## Micro-Decisions Locked by This Plan (Not Open for Silent Reinterpretation)

Small implementation-shape choices the umbrella plan left open, resolved here so EXECUTE does not have to improvise them:

1. **`setUser` is removed from `ShellContextValue`.** `user` becomes derived, read-only state: `toShellUser(useSession().data?.user)`. No consumer in this phase's scope needs a settable `user` (header.tsx's only two uses of `setUser` are both replaced with `authClient.signOut()`). If a later phase (Phase 3's anonymous-state-merge trigger) needs to react to a session transition, it should key off `useSession()`'s reactive data changing, or introduce a new, explicitly-named function — not resurrect `setUser`, which would be misleading (calling it would not actually change the session).
2. **`toShellUser` bridge shape:**
   ```ts
   function toShellUser(u: { name: string; email: string; role?: string } | undefined | null): User | null {
     if (!u) return null;
     const role = u.role ?? "reader";
     return { name: u.name, email: u.email, role: (role.charAt(0).toUpperCase() + role.slice(1)) as User["role"] };
   }
   ```
   Matches brief-asia's capitalization approach exactly.
3. **Client-side role typing on `useSession()`:** Better-Auth's client `useSession()` return type will not automatically know about the server's `additionalFields.role` field unless the `inferAdditionalFields` client plugin is added (`import { inferAdditionalFields } from "better-auth/client/plugins"`, added to `authClient`'s `plugins` array alongside `magicLinkClient()`). Either add that plugin for proper typing, or follow brief-asia's own pattern and use a runtime type assertion (`(u as { role?: string }).role`) at the one call site in `toShellUser`. Either is acceptable — pick whichever produces cleaner types once the package is actually installed and its exports are inspectable; this is a routine typing decision, not a behavior decision, and does not need to come back to PLAN.
4. **Session-loading flash:** `useSession()` exposes an `isPending` flag. Recommended (not mandatory) to thread this through `ShellContextValue` as `isSessionPending` and have `header.tsx` avoid rendering a confident "Log in" button while the session is still resolving on first paint, to avoid a login→logout flash on every page load. If the flash isn't visually noticeable in practice, this can be skipped — note the decision either way in the phase report.
5. **Apple provider registration:** because generating Apple's JWT `client_secret` from `APPLE_TEAM_ID`/`APPLE_KEY_ID`/`APPLE_PRIVATE_KEY` is materially more involved than Google/GitHub's plain `clientId`/`clientSecret` pair (Program-Wide Risk #6 in the umbrella), and Apple ships **off by default** in this phase regardless, do not spend implementation time reverse-engineering the installed `better-auth` Apple provider's exact field names. `auth.ts` leaves `apple` unregistered in `socialProviders` in this phase, even if `appleConfigured` is true in a real environment (not expected during this phase's own testing) — call this out explicitly in the phase report as a known, intentional Phase 1 limitation. **This means enabling Apple later is not a zero-code flip**: it requires (a) adding the `apple` provider block to `auth.ts` with its JWT client-secret shape verified against the installed `better-auth` types, and (b) setting the four Apple env vars — both steps together, not env vars alone. That code change (Apple going fully live) is out of scope for this program per the umbrella's Foundation vs. Expansion boundary and per the umbrella's AD-1.

---

## Public Contracts

Consolidated for quick reference. Do not introduce a contract that conflicts with this table without stopping and reconciling it against the umbrella plan's own Global Public Contracts section first.

### Environment variables

| Var | New or existing | Notes |
|---|---|---|
| `DATABASE_URL`, `DATABASE_DIRECT_URL` | existing | required for `@dtw/db/client` and Payload to even import (pre-existing repo constraint) |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` | existing (unused until now) | first real consumer is `apps/web/src/lib/auth.ts` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | existing (unused until now) | Google OAuth, live |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | existing (unused until now) | GitHub OAuth, live |
| `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` | existing (unused until now) | Apple OAuth, registered but gated off |
| `RESEND_API_KEY`, `RESEND_FROM_DOMAIN` | existing (unused until now) | `apps/web/src/lib/email.ts` |
| `NEXT_PUBLIC_GOOGLE_ENABLED` | **new** | client-side button gate; must be manually kept in sync with `GOOGLE_CLIENT_ID`/`SECRET` being set server-side |
| `NEXT_PUBLIC_GITHUB_ENABLED` | **new** | same, for GitHub |
| `NEXT_PUBLIC_APPLE_ENABLED` | **new** | same, for Apple |

### Routes

| Route | Method(s) | Notes |
|---|---|---|
| `/api/auth/[...all]` | `GET`, `POST` | `force-dynamic`; internally handles `/api/auth/sign-in/*`, `/api/auth/sign-up/*`, `/api/auth/callback/{provider}`, `/api/auth/session`, `/api/auth/magic-link/*`, `/api/auth/reset-password`, `/api/auth/verify-email` — all via Better-Auth's own internal routing, none of these sub-paths are separate files in this repo |
| `/reset-password` | page (GET) | reads `?token=` |

### Cookies

| Cookie | Set by | Notes |
|---|---|---|
| Better-Auth session cookie (Better-Auth's own default name) | `nextCookies()` plugin | httpOnly, 7-day `expiresIn` / 1-day `updateAge`; must remain last in the plugin chain |

### Exported functions/types (new)

| Symbol | File | Shape |
|---|---|---|
| `auth` | `apps/web/src/lib/auth.ts` | `ReturnType<typeof betterAuth>` |
| `sendEmail`, `actionEmail` | `apps/web/src/lib/email.ts` | `(msg: EmailMessage) => Promise<void>`, `(opts) => {html, text}` |
| `authClient`, `signIn`, `signUp`, `signOut`, `useSession`, `resetPassword` | `apps/web/src/lib/auth-client.ts` | re-exports of Better-Auth's own client shapes |
| `authCallbackUrl` | `apps/web/src/lib/auth-client.ts` | `(path?: string) => string` |
| `getSessionUser`, `requireUser`, `roleAtLeast` | `apps/web/src/lib/session.ts` | see exact shapes above |
| `ShellContextValue` (modified) | `apps/web/src/lib/shell.tsx` | `setUser` removed; `user` now derived; `articlesRead`/`incrementRead` unchanged |

No existing exported symbol from any of these files' current consumers (`header.tsx`, `auth-modal.tsx`, `article-content.tsx`, `/account`) is renamed in a way that breaks those files beyond the two call sites and imports listed in [Touchpoints](#touchpoints).

---

## Out of Scope

- Any account data (bookmarks/history/follows/queue) — Phase 2.
- Paywall meter/threshold changes — Phase 3 (`header.tsx` line ~49, `article-content.tsx`'s hardcoded `3`, `paywall.tsx`'s copy — none of these are touched in this phase).
- Newsletter subscriptions — Phase 5.
- `apps/web/src/middleware.ts` — never, per AD-6.
- A custom `apps/web/src/app/auth/callback/route.ts` — **not created**. `process/features/account/_GUIDE.md` currently describes this as the magic-link landing point; with Better-Auth's `magicLink` plugin, verification happens internally inside the existing catch-all route, and `callbackURL` is simply the final redirect target. See [Context Doc Reconciliation](#context-doc-reconciliation-phase-1s-durable-capture-responsibility).
- Payload `Users` collection's own auth mechanism (Payload's built-in email+password login, 7-day token) — untouched except the one field-access hardening line.
- 2FA (TOTP) for any role — deferred per AD-5; `two_factor_secret`/`two_factor_enabled` columns stay dormant.
- Server-side rate limiting beyond Better-Auth's own untuned defaults — noted as an accepted gap in [Detailed Flows](#detailed-flows), not built in this phase.
- Apple OAuth actually working end-to-end — registered-but-gated-off only, per AD-1 and Micro-Decision 5.
- Any change to `apps/web/src/components/article/article-content.tsx` or `apps/web/src/app/(reader)/account/[[...tab]]/page.tsx` — both still read `useShell().user` after this phase and will get a real (rather than fake) value automatically once `shell.tsx` changes, but neither file is otherwise touched.

---

## Blast Radius

- **`apps/web/src/lib/shell.tsx`** is consumed by `header.tsx`, `auth-modal.tsx`, `apps/web/src/components/article/article-content.tsx`, and the `/account` page (`apps/web/src/app/(reader)/account/[[...tab]]/page.tsx`). Removing `setUser` from `ShellContextValue` is a type-level breaking change to that interface — **grep every consumer for `setUser` before finishing this phase** to confirm only `header.tsx`'s two call sites use it (confirmed during grounding; if execute-time grep finds a third call site this plan didn't account for, that's a real deviation to flag, not silently patch around).
- **First-ever runtime use of `@dtw/db` in `apps/web/src`** (via `drizzleAdapter` inside `auth.ts`). This is the first practical proof that `packages/db/src/client.ts`'s `server-only`-adjacent throw-on-missing-`DATABASE_URL` guard behaves correctly end-to-end for a non-Payload consumer.
- **`apps/web/src/app/(reader)/layout.tsx`** is not modified in this phase, but its provider order (`I18nProvider > ThemeProvider > ShellProvider`) is load-bearing for `shell.tsx`'s new `useSession()` call — `useSession()` is a client hook and works the same regardless of provider nesting, so this is a low, but real, regression-watch item: confirm `/admin` still never mounts `ShellProvider`/`AuthModal` after this phase (it shouldn't, since `layout.tsx` itself isn't touched, but the manual gate should still eyeball `/admin` loads cleanly with no console errors from Better-Auth client code leaking in).
- **`turbo.json`** and **`.env.example`** changes are additive-only and affect build caching / documentation, not runtime behavior — lowest-risk items in this phase.
- **`apps/web/src/payload/collections/Users.ts`**'s new field-level `access` only restricts *writes* to `role` by non-admins; it does not change who can read/create/delete `users` records, and does not affect the Better-Auth `auth_users` table at all (fully disjoint per AD-5).

---

## Known Bugs This Phase Must NOT Port

Restated from the umbrella's AD-8 cross-phase checklist, scoped to what this phase actually touches:

- [ ] OAuth provider buttons are gated on `NEXT_PUBLIC_{PROVIDER}_ENABLED`, never hardcoded `true` (brief-asia bug #1).
- [ ] Exactly **one** verification email is sent on email+password signup — `sendOnSignUp: true` only, no explicit `authClient.sendVerificationEmail()` call anywhere in `auth-modal.tsx` (brief-asia bug #2).
- [ ] `apps/web/src/payload/collections/Users.ts`'s `role` field has admin-only field-level write access (brief-asia bug #4 — this is actually a pre-existing dtw weakness independent of the port, closed here because Phase 1 is already touching adjacent surface).

(Bugs #3 and #5 belong to Phases 5 and 2 respectively — not this phase's responsibility, listed here only for completeness of cross-reference.)

---

## Context Doc Reconciliation (Phase 1's Durable-Capture Responsibility)

Per the umbrella's Context Doc Reconciliation Needed table, Phase 1 owns correcting `process/context/auth/all-auth.md`. This plan pass identified **one additional** correction beyond the umbrella's original two (found while re-reading the doc during grounding), all four listed here for a single, complete durable-capture step at the end of EXECUTE:

| # | Doc | Current text | Correction needed |
|---|---|---|---|
| 1 | `process/context/auth/all-auth.md` (Middleware section) | "Planned: `apps/web/src/middleware.ts` checks role for..." | Replace with: no middleware is built; enforcement is per-page (`getSessionUser()` + inline prompt) and per-action (`requireUser()`), per AD-6. |
| 2 | `process/context/auth/all-auth.md` (Stack decisions) | "Magic link is the primary path — no password column. Passwords are intentionally never stored." | Replace with: magic link is the primary CTA, but email+password is also supported (ported from brief-asia, incl. forgot/reset); `auth_accounts.password` is populated for password-based accounts, per AD-1. |
| 3 | `process/context/auth/all-auth.md` (Source paths) | Lists `apps/web/src/middleware.ts` as a to-come source path | Remove that line; add `apps/web/src/lib/{email,auth-client,session}.ts` and `apps/web/src/app/(reader)/reset-password/page.tsx` to the list instead. |
| 4 | `process/features/account/_GUIDE.md` (Login/Signup modal surface) | "Magic link clicked → `/auth/callback` route handler → session set → redirect back to the original page" | Replace with: magic link clicked → verified internally by Better-Auth's `/api/auth/[...all]` catch-all route (no separate `/auth/callback` file) → session set → redirect to the captured `callbackURL`. Also update the "Key Source Files (to come)" list in that same doc to remove `apps/web/src/app/auth/callback/route.ts` and reflect the files actually created in this phase. |

The umbrella's original two items are **superseded/merged** into this table — do not track them separately; this table is now the complete list for Phase 1's durable capture.

---

## Validation Gates

**Precondition for all gates:** `.env.local` must have at minimum `DATABASE_URL`, `DATABASE_DIRECT_URL`, `PAYLOAD_SECRET`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` set (dev-appropriate values are fine — `openssl rand -hex 32` for the two secrets, `http://localhost:3000` for `BETTER_AUTH_URL`). This is a pre-existing repo-wide constraint (Payload already requires the first three to even import `payload.config.ts`), not new to this phase.

### Automated

- `pnpm typecheck` (repo root, turbo) — must pass clean across all workspace packages.
- `pnpm lint` (repo root, turbo) — must pass clean.
- `pnpm build` (repo root, turbo) — must succeed. This is the first build to exercise `drizzleAdapter`'s schema map against `@dtw/db`'s real exported tables and to confirm `auth.ts`'s `server-only` guard doesn't leak into any client bundle (a leak would surface as a build-time error, not a silent runtime issue, per Next.js's `server-only` package behavior).

### Manual — magic link

1. Open the app, click "Log in" → default modal mode is "magic". Submit an email.
2. Without `RESEND_API_KEY` set, confirm the link is printed to the **server console** (dev fallback banner from `email.ts`).
3. Confirm the modal transitions to the "Check your inbox" state, showing the submitted email, with "Resend" disabled and a visible countdown.
4. `SELECT * FROM auth_verifications ORDER BY created_at DESC LIMIT 1;` — confirm a row exists with `expires_at` ≈ now + 15 minutes.
5. Wait for the countdown to finish, click "Resend" → confirm a second console-printed link appears and a new/updated verification row exists.
6. Click the (first or most recent) printed link → confirm you land back on the page you started from (not always `/`), the session cookie is set (DevTools → Application → Cookies), and the header now shows the signed-in state.
7. `SELECT id, email, role, email_verified FROM auth_users ORDER BY created_at DESC LIMIT 1;` — confirm a new row with `role = 'reader'`. Confirm `email_verified` reflects the expected value (verify actual behavior, do not assume — see [Detailed Flows](#detailed-flows) step 7).
8. `SELECT * FROM auth_sessions ORDER BY created_at DESC LIMIT 1;` — confirm a matching session row.
9. Attempt to revisit the **same** consumed magic-link URL again → confirm it is rejected (single-use proof).

### Manual — email + password signup

1. Switch the modal to password mode → "Create an account" → submit name/email/password (8+ chars).
2. Confirm **exactly one** verification email/console-print appears — watch the server console output for a single `[email · dev console]` block for this signup, not two (AD-8 #2 proof).
3. Confirm the in-place notice appears ("Account created. Check your email to confirm and activate it.") and the modal does not close.
4. Attempt to sign in with the new credentials **before** clicking the verify link → confirm it is rejected (`requireEmailVerification: true` proof).
5. Click the verify link → confirm `autoSignInAfterVerification` establishes a session immediately (no separate sign-in step required).
6. `SELECT email, email_verified FROM auth_users WHERE email = '<test-email>';` → confirm `email_verified = true` post-click.

### Manual — forgot / reset password

1. Submit "forgot password" for a **non-existent** email → confirm the anti-enumeration notice appears.
2. Submit "forgot password" for the **real** test account from the signup flow above → confirm the **identical** notice text/copy appears (proof of anti-enumeration, not just "some message shown").
3. Click the printed reset link → set a new password (8+ chars, confirm-match validated client-side) → confirm the done-state renders.
4. Sign in with the **new** password → confirm success. Attempt sign-in with the **old** password → confirm rejection.
5. Attempt to reuse the same reset link a second time → confirm it is rejected (single-use proof).

### Manual — OAuth (Google / GitHub)

If local `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` (or GitHub equivalents) are available:

1. Set `NEXT_PUBLIC_GOOGLE_ENABLED=true` locally, confirm the "Continue with Google" button renders (and does **not** render when this flag is unset, even if the server-side creds happen to be set — proves the client gate is independent and correct).
2. Complete the OAuth flow against `localhost` (per the umbrella's Program-Wide Risk #4 — do not test against an arbitrary Vercel preview URL, whose origin won't match the provider's authorized redirect URI).
3. `SELECT * FROM auth_accounts WHERE provider_id = 'google' ORDER BY created_at DESC LIMIT 1;` → confirm a row linked to the correct `auth_users.id`.
4. Repeat for GitHub.
5. Confirm the Apple button does **not** render with the default (empty) `.env.example` Apple vars.

**If no OAuth credentials are available locally:** this is an acceptable, documented skip — note it explicitly in the phase report as "OAuth flow not exercised end-to-end; code-reviewed against brief-asia's proven pattern and the conditional-registration gate was confirmed via the button-visibility check (step 1) and a server log line confirming `socialProviders` is empty when creds are absent." Do not silently mark this gate as passed without one of these two outcomes recorded.

### Manual — sign-out

1. Sign in (any method) → open the desktop user dropdown → "Log out" → confirm the header reverts to "Log in" and the session cookie is cleared.
2. Sign in again → open the mobile menu (narrow viewport) → "Log out" → confirm the same result.

### Manual — RBAC hardening (AD-8 #4)

1. Create or use a Payload `author`-role user, log into `/admin`.
2. From the browser's DevTools, capture the Payload auth cookie for this session.
3. Replay a direct `PATCH` against the Payload REST API for that user's own record (`/api/users/<own-id>`) setting `{"role":"admin"}`, using the captured cookie — **not** through the `/admin` UI.
4. Follow up with a `GET` on the same record → confirm `role` is still `author` (Payload's field-level access denial typically strips the disallowed field from the write rather than erroring the whole request — verify via the follow-up read, not just the `PATCH` response status).

### Data verification (consolidated)

```sql
SELECT id, email, role, email_verified, created_at FROM auth_users ORDER BY created_at DESC LIMIT 10;
SELECT id, user_id, expires_at, created_at FROM auth_sessions ORDER BY created_at DESC LIMIT 10;
SELECT id, user_id, provider_id, account_id FROM auth_accounts ORDER BY created_at DESC LIMIT 10;
SELECT id, identifier, expires_at, created_at FROM auth_verifications ORDER BY created_at DESC LIMIT 10;
```

Run via `pnpm --filter @dtw/db db:studio` (Drizzle Studio) or `psql "$DATABASE_URL"` directly — either is acceptable evidence.

---

## Verification Evidence

The phase report must include, verbatim or as pasted output (not paraphrased):

- Console output (or screenshot) of at least one dev-fallback magic-link email print, showing the clickable URL.
- The actual SQL query results (not just "confirmed") for every query listed under Data Verification above, run at the specific points called out in the manual gates (e.g., "after step 7 of the magic-link flow").
- The exact copy shown for both anti-enumeration forgot-password attempts (real vs. non-existent email), to prove they are byte-identical.
- A note on which OAuth path was exercised: fully tested against `localhost`, or explicitly skipped per the documented fallback above.
- The `PATCH`/`GET` request/response pair (or equivalent screenshot) for the RBAC hardening check.
- `pnpm typecheck`, `pnpm lint`, `pnpm build` output tails (or a clean confirmation with exit codes) for the automated gates.
- Explicit confirmation of whether Micro-Decision 3 (client role typing) and Micro-Decision 4 (session-loading flash) were implemented or skipped, and why.
- Confirmation that the four Context Doc Reconciliation edits were made (link the diffs or paste the corrected sections).

A report that only states "all gates passed" without this evidence does not satisfy Phase Completion Rule #3 (Data Verification) or #5 (User Confirmation) and should not be treated as sufficient to mark this phase `✅ VERIFIED`.

---

## Durable Report Target

`process/features/account/reports/phase-01-auth-foundation_REPORT_<execution-date>.md`

---

## Blockers That Would Justify 🚧 BLOCKED

- `better-auth@^1.6.20`'s `drizzleAdapter` requires a schema shape that materially conflicts with the already-committed `packages/db/src/schema/auth.ts` (would require a schema change — **stop**; this would violate AD-7's additive-only rule and needs explicit re-confirmation from the user, not a silent workaround).
- The installed `better-auth` version's `magicLink` plugin does not support single-use tokens, or does not support a configurable `expiresIn`, or its `sendMagicLink` callback shape is materially different from what [Detailed Flows](#detailed-flows) describes in a way that changes the 15-minute/single-use guarantee — flag and escalate, do not silently ship a weaker guarantee.
- `nextCookies()` ordering breaks when the `magicLink` plugin is added ahead of it in the `plugins` array (the single regression risk the umbrella explicitly flagged) and session cookies stop being set for any auth method, not just magic link.
- Resend/dev-console email delivery behaves differently than brief-asia's proven pattern in a way that blocks verification emails from being observable in dev (i.e., the manual gates cannot be performed at all, not just "differently").

---

## Resume and Execution Handoff

If this phase is resumed after a gap or context compaction:

1. Reread this plan in full, then the umbrella's Phase 1 section, before touching any file.
2. Reread `packages/db/src/schema/auth.ts` and `packages/db/src/schema/account.ts` — confirm no drift from what's cited above (a diff would mean this plan's exact `drizzleAdapter` schema map needs re-verification).
3. Reread `apps/web/src/lib/shell.tsx` and `apps/web/src/components/auth-modal.tsx` current state — confirm they are still the fake stubs described in [Grounding & Verification Method](#grounding--verification-method). If someone has since touched them, treat the relevant part of this plan as stale and re-research that specific file before proceeding (the rest of the plan likely still holds).
4. Confirm `better-auth`/`resend` are still absent from `apps/web/package.json` (if already added by a partial prior attempt, inspect what shape was used before assuming this plan's shape from scratch — reconcile, don't duplicate).
5. Check `process/features/account/reports/` for any partial `phase-01-auth-foundation_REPORT_*.md` — a partial report means this phase was already started; read it before re-starting from step 1 of the Implementation Checklist.
6. Never proceed to Phase 2's own PLAN pass until this phase's report exists and the user has explicitly confirmed the phase works (Phase Completion Rule #5) — Phase 2 depends on a real session existing, not just code that compiles.

---

## Implementation Checklist

1. Add `"better-auth": "^1.6.20"` and `"resend": "^6.14.0"` to `apps/web/package.json` dependencies; run `pnpm install` at the repo root.
2. Create `apps/web/src/lib/email.ts` per [Exact shape — `email.ts`](#exact-shape--appswebsrclibemailts).
3. Create `apps/web/src/lib/auth.ts` per [Exact shape — `auth.ts`](#exact-shape--appswebsrclibauthts), verifying the `magicLink` plugin's real option names against the installed package's types.
4. Create `apps/web/src/lib/auth-client.ts` per [Exact shape — `auth-client.ts`](#exact-shape--appswebsrclibauth-clientts).
5. Create `apps/web/src/lib/session.ts` per [Exact shape — `session.ts`](#exact-shape--appswebsrclibsessionts).
6. Create `apps/web/src/app/api/auth/[...all]/route.ts` per [Exact shape](#exact-shape--appswebsrcappapiauthallroutets).
7. Run `pnpm typecheck` — confirm Groups A/B compile before proceeding to the UI work.
8. Create `apps/web/src/app/(reader)/reset-password/page.tsx` per [Exact shape](#exact-shape--appswebsrcappreaderreset-passwordpagetsx).
9. Rewrite `apps/web/src/components/auth-modal.tsx` implementing the full mode state machine (`magic` / `magic-sent` / `password-signin` / `password-signup` / `forgot`) per [Detailed Flows](#detailed-flows), including the 30s resend countdown, anti-enumeration notice, `NEXT_PUBLIC_*_ENABLED` provider gating, and all new i18n triples.
10. Modify `apps/web/src/lib/shell.tsx`: remove `setUser` from `ShellContextValue`, derive `user` via `toShellUser(useSession())` per [Micro-Decision 2](#micro-decisions-locked-by-this-plan-not-open-for-silent-reinterpretation); leave `articlesRead`/`incrementRead` untouched.
11. Modify `apps/web/src/components/header.tsx`: replace both `setUser(null)` call sites (desktop dropdown, mobile menu) with `authClient.signOut()`; import `authClient` from `@/lib/auth-client`.
12. Modify `apps/web/src/payload/collections/Users.ts`: add the field-level `access.update` block on `role`.
13. Modify `.env.example`: add `NEXT_PUBLIC_GOOGLE_ENABLED`, `NEXT_PUBLIC_GITHUB_ENABLED`, `NEXT_PUBLIC_APPLE_ENABLED`.
14. Modify `turbo.json`: add the 12 new Better-Auth/OAuth/Resend env vars to `build.env`.
15. Run `pnpm typecheck && pnpm lint && pnpm build` at the repo root — must pass clean.
16. Perform the magic-link manual flow (9 steps) per [Validation Gates](#validation-gates); capture evidence per [Verification Evidence](#verification-evidence).
17. Perform the email+password signup manual flow (6 steps); capture evidence.
18. Perform the forgot/reset password manual flow (5 steps); capture evidence.
19. Perform the OAuth manual flow, or record the documented skip; capture evidence.
20. Perform the sign-out manual flow (both entry points).
21. Perform the RBAC hardening manual check; capture the request/response evidence.
22. Run all four consolidated data-verification queries; paste actual results into the report.
23. Apply the four Context Doc Reconciliation edits (`process/context/auth/all-auth.md` ×3, `process/features/account/_GUIDE.md` ×1).
24. Write `process/features/account/reports/phase-01-auth-foundation_REPORT_<execution-date>.md` per [Verification Evidence](#verification-evidence) and the umbrella's Phase Completion Rules.
25. Update the umbrella plan's Phase Status Table row for Phase 1 (do this as part of the same durable-capture step, or explicitly hand it to UPDATE PROCESS — do not leave it silently stale).
26. Stop and request explicit user confirmation before recommending Phase 2's own PLAN pass (Phase Completion Rule #5; Phase 2 requires fresh RESEARCH per the umbrella's Re-Research Rule, not a direct continuation).

---

## Rules for This Phase (Cheat Sheet)

- Every new server-side session/DB module starts with `import "server-only"`.
- Every new user-facing string uses `t(en, vi, id)` via `useT()` — except transactional email bodies (AD-4).
- `roleAtLeast()` (lowercase input) is the only sanctioned way to compare roles going forward — never re-derive a string comparison inline.
- `nextCookies()` stays last in the Better-Auth `plugins` array, always.
- No `middleware.ts`. No new Drizzle schema. No PostHog dependency. No editor 2FA.
- Do not touch `header.tsx` line ~49 (nudge threshold) or `article-content.tsx`'s hardcoded `3` — Phase 3's scope, not this phase's, even though both files import `useShell()`.
- `pnpm typecheck`, `pnpm lint`, `pnpm build` at the repo root are the automated gates; there is no automated test runner in this repo yet (confirmed via `process/context/tests/all-tests.md` during the umbrella's own grounding) — all functional proof is manual + DB query evidence.

---

## Next Step

This plan is ready for review. Once approved, the next explicit instruction should be **`ENTER EXECUTE MODE`** targeting this exact file: `process/features/account/active/phase-01-auth-foundation_PLAN_03-07-26.md`.

Do not hand EXECUTE the umbrella plan or any other phase's section — this file alone is Phase 1's complete, execute-ready spec. After this phase reaches `✅ VERIFIED` and its report exists, the next action is a fresh RESEARCH → PLAN pass for Phase 2 (`process/features/account/active/phase-02-account-data-layer_PLAN_<date-at-that-time>.md`), per the umbrella's Re-Research Rule — not a direct continuation from this plan.
