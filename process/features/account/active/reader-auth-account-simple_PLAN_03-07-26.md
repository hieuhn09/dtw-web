# Reader Auth, Account & Paywall — Simple Port (Consolidated Execute Plan)

**Date**: 03-07-26
**Feature**: `account`
**Complexity**: Complex, but intentionally kept in one file per explicit user request (brevity over phase-program ceremony).
**Status**: ✅ APPROVED FOR EXECUTE — user confirmed the scope below on 03-07-26.

**Execute anchor**: this file. Do not point EXECUTE at any other file for this work.

**Supersedes**: the 6-file phase-program set in `process/features/account/backlog/` (`reader-auth-account_UMBRELLA-PLAN_03-07-26.md` + `phase-01` through `phase-05`). Those files remain as **deep reference only** — every touchpoint below was extracted from them (each already spot-verified against the live filesystem during that PLAN pass; re-verified again during this consolidation, see [Grounding](#grounding)). Where this plan's scope differs from the backlog set (narrower in every case — see [Deferred](#deferred-not-this-pass)), this file wins.

**Primary reference for full depth**: `process/features/account/references/brief-asia-port-map_REFERENCE_03-07-26.md` (durable research). Per-stage "for full depth" links point at the matching backlog phase file for exact code shapes, deep-dive algorithms, and exhaustive validation gates that this file only summarizes.

---

## Grounding

Written after (re-)reading `process/context/all-context.md` (root router), `process/context/auth/all-auth.md`, `process/context/database/all-database.md`, and `process/context/tests/all-tests.md`, plus the backlog phase plans and durable reference doc above. Confirmed at consolidation time (03-07-26): no code exists yet for any stage. `better-auth` absent from `apps/web/package.json`; `apps/web/src/lib/{auth,session,account-actions,paywall}.ts` all absent; `apps/web/src/payload/globals/` doesn't exist; `apps/web/src/lib/shell.tsx` is still the pre-Phase-1 in-memory `user`/`setUser` stub (confirmed by direct read). Nothing has drifted since the backlog plans were written earlier the same day.

---

## Objective

Replace every fake/mock reader-auth and account surface in dtw-web with real, server-verified state: email+password auth with an optional Google button, real bookmarks/history/follows, an invariant-#4-compliant paywall meter, and real settings + single-opt-in newsletters. Port from `/home/hieunc/Code/brief-asia-web` where proven; redesign only where brief-asia's approach violates a dtw invariant (paywall threshold) or ships a known bug (see [Fix-on-Port](#fix-on-port-do-not-replicate)).

---

## Approved Scope

- **Auth**: email + password (signup, login, forgot/reset password) + Google OAuth (conditional env-gated provider). No magic link. No Apple. GitHub may be registered server-side and shipped as a hidden-by-default button using the exact same conditional-provider pattern as Google, purely because it costs nothing extra — it is not a requirement.
- **Account**: saved articles (bookmarks), reading history, follow pillars, `/account` backed by real data.
- **Settings**: change email, change password, delete account (with confirmation).
- **Paywall**: brief-asia-style soft mechanics, but threshold read from a Payload Global (default/seed `3`, never hardcoded — invariant #4) and guest meter in cookie `dtw-read-count` (not localStorage). Logged-in readers metered via `reading_history` count. Nudge only, never a hard block.
- **Newsletter**: single opt-in — signed-in toggle keyed on `user_id`, guest subscribe captured immediately (email-keyed). Double opt-in is deferred.

## Deferred (Not This Pass)

Magic link · Apple OAuth · double opt-in (`pending_newsletter_confirmations`, confirm-token email/route/page) · Read-later queue tab (`reading_queue`) · guest-state merge on login (beyond clearing the guest cookie) · 2FA · `/admin` reconciliation with Better-Auth · payments/Stripe.

## Fix-on-Port (Do Not Replicate)

| brief-asia bug | Fix in this plan |
|---|---|
| `googleEnabled = true` hardcoded | Button visibility gated on `NEXT_PUBLIC_GOOGLE_ENABLED`/`NEXT_PUBLIC_GITHUB_ENABLED`, independent of server creds |
| Double verification email on signup | `emailVerification.sendOnSignUp: true` only — auth-modal never calls `sendVerificationEmail()` again |
| Newsletter subs keyed on email | Signed-in toggle keyed on `user_id` (claim-on-signup algorithm below); only the guest-capture path stays email-keyed |
| Payload `Users.role` self-escalation | Field-level `access.update` on `role`, admin-only |
| Per-pageload view counting, no dedupe | `recordView` upserts `reading_history` on `(userId, articleId)` — one row per pair |

## Conventions (apply to every stage)

1. `unstable_cache` + tag + `revalidateTag` for shared/non-per-user Payload reads only. Per-user reads (session, bookmarks, history, follows, newsletter subs) are never cached; they live in client components (`useShell()`) or `force-dynamic` routes/actions — **never inside the article page's `revalidate=60` RSC**.
2. Every module importing `@dtw/db/client` or reading session server-side starts with `import "server-only"`. `"use server"` action files do not additionally need it (matches the existing `load-more-action.ts`/`search-action.ts` convention).
3. Every new user-facing string uses `useT()`'s `t(en, vi, id)`. Transactional email bodies are English-only (the one exception).
4. Styling: `var(--...)` CSS custom properties only, never hardcoded `rgba(...)` — except the literal hex values inside `email.ts`'s HTML template (email clients can't read CSS vars).
5. Role comparisons go through one shared `roleAtLeast(role, min)` helper (lowercase input) — never re-derive a string comparison inline. Drizzle role enum is lowercase; `shell.tsx`'s `User.role` is Capitalized (bridge only in `toShellUser`); Payload's `users.role` is a separate 3-value lowercase enum.
6. Any query on a just-migrated column/Global follows the existing fail-open try/catch/`console.warn`/safe-default pattern (`getPinnedLatest` in `payload-server.ts`).
7. Never hardcode `/en` or any locale segment in a callback/redirect URL — centralize in `authCallbackUrl(path)`.
8. `packages/db` is shared with `dtw-engine`: schema changes are additive-only. This entire plan needs **zero new Drizzle tables/columns** — every Drizzle table used already exists and is migrated (`bookmarks`, `reading_history`, `follows`, `newsletter_subscriptions`). Only two **Payload** migrations are new (Stage C's Global, Stage D's `newsletters` collection) — Payload's migration system is separate from Drizzle's; never generate one from the other's CLI.

---

## Phase Completion Rules

No stage is complete until:

1. **Integration Test** — works end-to-end with the prior stage's real output, not in isolation.
2. **Manual Test** — a human actually performs each stage's manual smoke steps below.
3. **Data Verification** — every DB claim is confirmed by an actual query, not code inspection.
4. **Error Handling** — the guest/error/edge branches called out per stage are exercised, not just the happy path.
5. **User Confirmation** — the plan owner explicitly confirms the stage works before it's treated as done.

`pnpm typecheck && pnpm lint && pnpm build` passing is `🔨 CODE DONE`, never `✅ VERIFIED`, on its own.

## Acceptance Criteria

- [ ] Signup/login/forgot-reset all work end-to-end; exactly one verification email is sent per signup.
- [ ] Google button renders only when `NEXT_PUBLIC_GOOGLE_ENABLED=true`; GitHub stays hidden by default.
- [ ] A non-admin Payload user cannot self-escalate `role` via a direct API write.
- [ ] Save/unsave persists server-side across reload and device; reading history dedupes one row per article; Following reflects live CMS pillars, not a hardcoded list.
- [ ] A guest visiting `/account` gets an inline sign-in prompt (HTTP 200), never a redirect or crash.
- [ ] No file contains a hardcoded paywall-threshold literal; editing the Payload Global changes the trip point without a deploy.
- [ ] The guest meter survives a page reload (cookie-backed) and clears on sign-in.
- [ ] Change email/change password work for a password-holding account; a Google-only account gets a graceful message, not a crash, on change-password.
- [ ] Delete account cascades `bookmarks`/`follows`/`reading_history` to zero rows and leaves `newsletter_subscriptions` intact with `user_id = NULL`.
- [ ] Signed-in newsletter toggle is `user_id`-keyed; guest subscribe is immediate (single opt-in, no token); a later signup with the same email claims the guest row instead of duplicating it.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm build` pass clean after every stage.
- [ ] All new user-facing strings render correctly in `en`, `vi`, `id`.

---

## Touchpoints

Touchpoints are grouped by stage. Execute stages in order A → B, then C and D (both depend only on B and may run in either order, but only one "in flight" at a time — see [Resume and Execution Handoff](#resume-and-execution-handoff)).

### Stage A — Auth Foundation

*Full depth: `process/features/account/backlog/phase-01-auth-foundation_PLAN_03-07-26.md` (drop every magic-link and Apple reference; the rest ports directly).*

| # | File | Action | Change |
|---|---|---|---|
| 1 | `apps/web/package.json` | modify | add `"better-auth": "^1.6.20"`, `"resend": "^6.14.0"`; `pnpm install` at repo root |
| 2 | `apps/web/src/lib/email.ts` | create | port brief-asia's Resend-or-console-fallback + `actionEmail()` template verbatim; rebrand FROM `DailyTechWire <no-reply@${RESEND_FROM_DOMAIN \|\| "dailytechwire.com"}>`; literal light-theme hex (`#FDFCF8`/`#111111`/`#5B5B58`/`#D4623C`/`#1B2A52`) — this is the one place hardcoded hex is correct, not a violation of Convention 4 |
| 3 | `apps/web/src/lib/auth.ts` | create | `betterAuth({...})`: `drizzleAdapter(db,{schema:{user:users,session:sessions,account:accounts,verification:verifications}})`; `emailAndPassword{enabled:true, requireEmailVerification:true, resetPasswordTokenExpiresIn:3600, sendResetPassword}`; `emailVerification{sendOnSignUp:true, autoSignInAfterVerification:true, sendVerificationEmail}` — **exactly one** send path, no modal-side second call; `socialProviders` conditional on `googleConfigured`/`githubConfigured` (`Boolean(CLIENT_ID && CLIENT_SECRET)`) — no Apple block at all; `user.additionalFields.role{defaultValue:"reader", input:false}`; `changeEmail.enabled`, `deleteUser.enabled`; `session{expiresIn: 7d, updateAge: 1d}`; `plugins:[nextCookies()]` only — **no `magicLink()` plugin** |
| 4 | `apps/web/src/lib/auth-client.ts` | create | `createAuthClient()` (zero plugins), re-export `signIn/signUp/signOut/useSession/resetPassword`; `authCallbackUrl(path?)` helper (Convention 7) |
| 5 | `apps/web/src/lib/session.ts` | create | `getSessionUser()` → `{id,name,email,role}\|null`; `requireUser()` (throws `"Not authenticated"`); `roleAtLeast(role, min)` |
| 6 | `apps/web/src/app/api/auth/[...all]/route.ts` | create | `export const {GET,POST}=toNextJsHandler(auth); export const dynamic="force-dynamic";` |
| 7 | `apps/web/src/app/(reader)/reset-password/page.tsx` | create | port brief-asia's reset page, drop `[locale]` segment and `LocaleLink`, use `next/link` + `@dtw/ui`'s `Button` |
| 8 | `apps/web/src/lib/shell.tsx` | modify | replace in-memory `user`/`setUser` with `toShellUser(useSession().data?.user)`; drop `setUser` from context (header's two call sites are its only consumers); `articlesRead`/`incrementRead` untouched (Stage C's job) |
| 9 | `apps/web/src/components/auth-modal.tsx` | rewrite | mode state machine `signin \| signup \| forgot` (default `signin`, **no magic mode**); Google button gated `NEXT_PUBLIC_GOOGLE_ENABLED==='true'`; GitHub button gated `NEXT_PUBLIC_GITHUB_ENABLED==='true'` (both default unset → hidden); anti-enumeration forgot-password copy (identical text regardless of lookup result) |
| 10 | `apps/web/src/components/header.tsx` | modify | both `setUser(null)` call sites (desktop dropdown, mobile menu) → `authClient.signOut()`. No other change. |
| 11 | `apps/web/src/payload/collections/Users.ts` | modify | add field-level `access: { update: ({req}) => req.user?.role === "admin" }` on the `role` field only — RBAC hardening (Fix-on-Port) |
| 12 | `.env.example` | modify | add `NEXT_PUBLIC_GOOGLE_ENABLED`, `NEXT_PUBLIC_GITHUB_ENABLED` |
| 13 | `turbo.json` | modify | add `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_DOMAIN` to `build.env` |

**Manual smoke**: signup → exactly one verification email (console-logged if `RESEND_API_KEY` unset) → sign-in blocked until clicked → click → session established. Forgot/reset roundtrip with identical anti-enumeration copy for real vs. non-existent email; old password stops working after reset. Google button visible only with `NEXT_PUBLIC_GOOGLE_ENABLED=true`; GitHub button hidden by default. Sign out from both header entry points clears the cookie. Direct Payload REST `PATCH` attempting `role:"admin"` as an `author` is rejected (RBAC check).

### Stage B — Account Data Layer

*Full depth: `process/features/account/backlog/phase-02-account-data-layer_PLAN_03-07-26.md` (ports as-is — this stage was not narrowed by the simple-scope decision).*

**Architecture note (load-bearing)**: the article page has `revalidate=60`. `article-content.tsx`/`share-bar.tsx` are client components — resolving "is this saved?" and calling `recordView` happens in a `useEffect` **after hydration**, never inside the RSC. Do not add `getSessionUser()`/`cookies()`/`@dtw/db` to `article/[slug]/page.tsx` itself (Convention 1).

| # | File | Action | Change |
|---|---|---|---|
| 1 | `apps/web/src/lib/account-actions.ts` | create, `"use server"` | `toggleBookmark(articleId)`, `removeBookmark(articleId)` — `requireUser()`-gated; `isBookmarked(articleId)`, `recordView(articleId)` — guest-safe (no throw, silent no-op/`false`); `recordView` upserts `reading_history` on `(userId, articleId)` unique index (`onConflictDoUpdate` → dedupe, fixes the per-pageload-count bug) and fires even for sponsored articles (only `incrementRead`, Stage C's guest meter, skips sponsored); `clearHistory()`; `toggleFollow(targetSlug)` — pillar-only (dtw's `follows` schema has no country-follow discriminator) |
| 2 | `apps/web/src/lib/session.ts` | extend | `listBookmarks(userId)`, `listHistory(userId)` (`.limit(50)`), `listFollows(userId)` — plain server-only reads, not `"use server"`, called only from the `force-dynamic` `/account` RSC |
| 3 | `apps/web/src/lib/payload-server.ts` | extend | `getArticlesByIds(ids)` — `unstable_cache`, tag `articles:all`, published-only filter (unpublished saved articles silently drop from lists, row stays in Postgres) |
| 4 | `apps/web/src/app/(reader)/account/[[...tab]]/page.tsx` | rewrite | remove `"use client"`, add `export const dynamic="force-dynamic"`; gate on `await getSessionUser()` → inline sign-in prompt (small `"use client"` sub-component wired to `useShell().openAuth`) when null; `Promise.all([listBookmarks, listHistory, listFollows, getNavPillars])` → hydrate via `getArticlesByIds`; Saved/History/Following become presentational + a small client mutation island per row (optimistic + `router.refresh()`); add a "Clear history" button (copy already promises it, no button exists today); Following tab sourced from `getNavPillars()`/`listFollows` — **not** a hardcoded pillar list (invariant #8); Settings/Newsletters tabs stay stubbed until Stage D |
| 5 | `apps/web/src/components/article/share-bar.tsx` | modify | add `articleId`, `initialSaved`, `disabled?`, `user`, `onLogin` props; Save click → guest: `openAuth()`; signed-in: optimistic flip + `void toggleBookmark(articleId)` |
| 6 | `apps/web/src/components/article/article-content.tsx` | modify | client `useEffect` keyed `[article.id, user?.email]`: if `user`, `void recordView(article.id)`; always `isBookmarked(article.id).then(setSaved)`; thread state down into `<ShareBar>` |

**Manual smoke**: Save persists across reload and a second browser session for the same account; `/account` Saved tab shows real CMS data. Reading 2–3 articles once each produces exactly one `reading_history` row apiece; re-reading doesn't duplicate; "Clear history" deletes rows. Following a pillar writes `follows`; adding/renaming a pillar in `/admin` changes the Following list without a deploy. Guest visiting `/account` sees an inline prompt (HTTP 200, no redirect); guest Save opens the auth modal. A second, signed-out browser loading the same article within the 60s window never sees the first user's saved state (ISR non-leakage proof).

### Stage C — Paywall Meter + Sign-In Nudge

*Full depth: `process/features/account/backlog/phase-03-paywall-nudge_PLAN_03-07-26.md` (ports as-is).*

**Design decisions (locked, condensed from the backlog's D1–D7 — see that file for full rationale)**:
- **D1** Reset period = calendar month, Asia/Singapore time (`+08:00`, no DST, no timezone library needed).
- **D2** Signed-in meter = `count(*) FROM reading_history WHERE userId=? AND readAt >= periodStart` — already deduped by Stage B's unique index, zero new schema.
- **D3** Guest meter = hand-rolled `document.cookie` (no `js-cookie` dependency); not `httpOnly` (must be client-readable/writable), not security-sensitive.
- **D4** Comparison operator unified to `>=` in both `header.tsx` and `article-content.tsx` (today's header already uses `>=`; article-content's `>` is the bug).
- **D5** Sign-in clears the guest cookie (`clearGuestMeter()`); no server-side merge — a brand-new account's DB meter is naturally `0`.
- **D6** The signed-in `reading_history`-window count is computed and wired into `articlesRead`, but does **not** gate anything in this pass — `!user` continues to fully exempt signed-in readers (invariant #4's "Phase 1 has no payment").
- **D7** Global slug `paywallSettings`, field `paywallThreshold` (number, default `3`).

| # | File | Action | Change |
|---|---|---|---|
| 1 | `apps/web/src/payload/globals/PaywallSettings.ts` | new | `GlobalConfig`, `paywallThreshold: number` (default 3, min 1); `access.update` editor/admin; `hooks.afterChange:[revalidatePaywallSettings]` |
| 2 | `apps/web/src/payload/hooks/revalidate.ts` | extend | `revalidatePaywallSettings` (`GlobalAfterChangeHook`), tag `settings:paywall` |
| 3 | `apps/web/payload.config.ts` | modify | add `globals: [PaywallSettings]` (new key — none exists yet) |
| 4 | Payload migration | new, CLI-generated | `pnpm --filter web payload:migrate:create`; commit generated pair + updated `migrations/index.ts` |
| 5 | `apps/web/src/lib/payload-server.ts` | extend | `getPaywallThreshold()` — `unstable_cache`, tag `settings:paywall`, revalidate 300, fail-open to `3` |
| 6 | `apps/web/src/lib/paywall.ts` | new (client-safe, no `server-only`/`use server`) | `GUEST_METER_COOKIE="dtw-read-count"`; `currentPeriodKeySGT`/`startOfCurrentPeriodSGT`; `readGuestMeter`/`recordGuestRead`/`clearGuestMeter`; cap 20 tracked ids, 90-day cookie `max-age`, `SameSite=Lax` |
| 7 | `apps/web/src/lib/session.ts` | extend | `getReadCountThisPeriod(userId)` per D2 |
| 8 | `apps/web/src/lib/paywall-actions.ts` | new, `"use server"` | `getMyReadCount()` — `requireUser()` + `getReadCountThisPeriod()`, fails closed to `0` |
| 9 | `apps/web/src/app/(reader)/layout.tsx` | modify | `Promise.all([getNavPillars(), getPaywallThreshold()])` → `<ShellProvider paywallThreshold={paywallThreshold}>` |
| 10 | `apps/web/src/lib/shell.tsx` | modify | add `paywallThreshold`; guest branch reads/writes the cookie via `lib/paywall.ts`; signed-in branch seeds from `getMyReadCount()` on identity change + `clearGuestMeter()` on sign-in (D5) |
| 11 | `apps/web/src/components/header.tsx` | modify | `articlesRead >= 3` → `articlesRead >= paywallThreshold` |
| 12 | `apps/web/src/components/article/article-content.tsx` | modify | `articlesRead > 3` → `articlesRead >= paywallThreshold` (D4); pass `threshold` prop to `<Paywall>` |
| 13 | `apps/web/src/components/article/paywall.tsx` | rewrite | remove the `$12/mo` card, `Become a member` button, `href="/pro"`, three-bullet feature grid; single sign-in-nudge card, `threshold` prop in the copy, full `t(en, vi, id)` |

**Manual smoke**: a guest tripping the threshold sees the header nudge AND the article's paywall card at the same read count; reload does not reset the count (cookie, not in-memory); re-reading the same article doesn't double-count. Changing `paywallThreshold` in `/admin` changes the trip point without a deploy. No file contains a hardcoded `3` comparison or prose number (grep-confirmed). Signing in clears the cookie; signed-in readers never see the nudge/card in this pass.

### Stage D — Settings & Newsletter

*Full depth for settings: `process/features/account/backlog/phase-04-settings-read-later_PLAN_03-07-26.md` (ignore every Read-Later reference). Full depth for newsletters (including the double-opt-in mechanics this plan deliberately drops): `process/features/account/backlog/phase-05-newsletters-double-optin_PLAN_03-07-26.md`.*

**Settings**

| # | File | Action | Change |
|---|---|---|---|
| 1 | Settings tab (inside `/account/[[...tab]]/page.tsx` or a small extracted client component) | new/modify | port brief-asia's `SettingsTab` logic: `authClient.changeEmail({newEmail, callbackURL: authCallbackUrl("/account")})` (confirmation mails to the **new** address); `authClient.changePassword({currentPassword, newPassword, revokeOtherSessions:true})` attempted unconditionally — catch and gracefully display Better-Auth's error for a password-less (Google-only) account rather than building a separate `hasPassword` detection path (simplicity over the backlog's preferred option); `authClient.deleteUser({})` behind `window.confirm(...)` with the confirmation copy through `t(en, vi, id)` (GDPR/PDPA requirement — not just nice-to-have); redirect to `/` on success. Drop every hardcoded `/en/...` path. |

**Newsletter (single opt-in)**

| # | File | Action | Change |
|---|---|---|---|
| 2 | `apps/web/src/payload/collections/Newsletters.ts` | new | `name`/`slug`/`cadence`/`description`/`vertical`(rel → pillars)/`active`/`order`; `access.read:true`, `create`/`update`: editor/admin, `delete`: admin; `hooks.afterChange/afterDelete` |
| 3 | `apps/web/payload.config.ts` | modify | register `Newsletters` collection |
| 4 | `apps/web/src/payload/hooks/revalidate.ts` | extend | `revalidateNewsletter`/`revalidateNewsletterDelete`, tag `newsletters:all` |
| 5 | Payload migration + `payload:generate-types` | new | commit generated pair; regenerate `payload-types.ts` |
| 6 | `apps/web/src/lib/payload-server.ts` | extend | `getNewsletters()` — `unstable_cache`, tag `newsletters:all`, revalidate 300, `depth:1`, `where:{active:true}`, `sort:"order"` |
| 7 | `apps/web/src/lib/account-actions.ts` | extend | `setNewsletter(newsletterId, subscribe)` — **signed-in, `user_id`-keyed** (see algorithm below, fixes AD-8 #3); `subscribeGuest(email, newsletterIds)` — **immediate single opt-in**: select-then-insert/update by `(email, newsletterId)` with `confirmed_at = now()`, no token, no pending row; `isSubscribed(newsletterId)` |
| 8 | `apps/web/src/lib/session.ts` | extend | `listNewsletterSubs(userId)` — `WHERE user_id=? AND unsubscribed_at IS NULL` |
| 9 | `apps/web/src/components/home/newsletter-cta.tsx` | modify | drop the `alert("...demo")` handler; guest → `subscribeGuest` + immediate "You're subscribed" message; signed-in → `setNewsletter` toggle; update copy from "Eight newsletters" to the 6 canonical names (drop Deep Dive / DTW Awards mentions) |
| 10 | `apps/web/src/app/(reader)/newsletters/page.tsx` | split | async server component `await getNewsletters()` + new `newsletters-content.tsx` client component (multi-select + submit → `subscribeGuest`, immediate confirmation, no round-trip email); same copy fix (8→6) |
| 11 | Newsletters tab (account page) | modify | real list from `getNewsletters()` joined with `listNewsletterSubs(user.id)`; toggle → `setNewsletter` + `router.refresh()` |
| 12 | `apps/web/scripts/seed-payload.ts` | modify | seed exactly 6 canonical newsletters (`am`/`pm`/`ai`/`fund`/`dev`/`prod`) via the existing `upsert()` helper — table and copy sourced from `apps/web/src/lib/data.ts`'s fixture, dropping `deep`/`awards` |

**Signed-in upsert algorithm** (no schema change — `newsletter_subscriptions`'s only unique index is `(email, newsletter_id)`, not `(user_id, newsletter_id)`):
```
setNewsletter(newsletterId, subscribe):
  user = requireUser()
  row = SELECT ... WHERE user_id = user.id AND newsletter_id = newsletterId
  if row exists: UPDATE unsubscribed_at = subscribe ? NULL : now() WHERE user_id=...; return
  legacyRow = SELECT ... WHERE user_id IS NULL AND email = user.email AND newsletter_id = newsletterId
  if legacyRow exists: UPDATE SET user_id = user.id, unsubscribed_at = ... WHERE email = user.email AND newsletter_id=...; return  // claims a guest-era row instead of violating the unique index
  if subscribe === false: return  // no-op
  try: INSERT (id: randomUUID(), email: user.email, newsletter_id, user_id: user.id, confirmed_at: now())
  catch (unique violation, benign double-click race): UPDATE SET user_id = user.id, unsubscribed_at = ... WHERE email = user.email AND newsletter_id = newsletterId
```
Unsubscribe never deletes the row (`unsubscribed_at = now()`, preserves history). `subscribeGuest` runs the same select-then-write shape keyed on `email` only (guests have no `user_id`), immediately setting `confirmed_at = now()` — single opt-in, per approved scope. `header.tsx`'s existing `<Link href="/newsletters">Subscribe</Link>` and `footer.tsx`'s newsletter strip are **not touched** in this pass (footer keeps its demo bug — explicitly out of scope, same call the backlog made).

**Manual smoke — Settings**: change email mails the new address, `auth_users.email` flips only after the link is clicked. Change password: old password stops working, new one works. A Google-only account sees a graceful message on change-password, not a crash. Delete account cascades `bookmarks`/`follows`/`reading_history` to zero rows for that user (run last, disposable test account only) while `newsletter_subscriptions` survives with `user_id` set to `NULL`.

**Manual smoke — Newsletter**: signed-in toggle produces exactly one `newsletter_subscriptions` row keyed by `user_id`; toggling off sets `unsubscribed_at`, never deletes; toggling on again reverts it (no duplicate). Guest subscribe on the homepage CTA and `/newsletters` immediately creates a `confirmed_at`-set row, no token/email round trip. A guest who later signs up with the same email and toggles a newsletter claims the legacy row (still exactly one row, now `user_id`-linked) — direct proof of the AD-8 #3 fix. Deactivating a newsletter in `/admin` removes it from all 3 reader surfaces without a deploy.

---

## Public Contracts

| Kind | New surface | Notes |
|---|---|---|
| Env vars | `NEXT_PUBLIC_GOOGLE_ENABLED`, `NEXT_PUBLIC_GITHUB_ENABLED` | client button gates; existing `BETTER_AUTH_*`, `GOOGLE_*`, `GITHUB_*`, `RESEND_*` vars are consumed, not renamed |
| Routes | `/api/auth/[...all]`, `/reset-password` | Stage A |
| Cookies | Better-Auth session cookie (`nextCookies()`, 7d/1d); `dtw-read-count` (guest paywall meter, Stage C) | non-httpOnly, client-managed |
| DB tables (all pre-existing, zero new columns) | `auth_users`/`sessions`/`accounts`/`verifications`, `bookmarks`, `reading_history`, `follows`, `newsletter_subscriptions` | AD-7 holds throughout |
| Payload globals/collections (new) | `paywallSettings` (Global, Stage C), `newsletters` (Collection, Stage D) | each needs its own Payload migration — separate from Drizzle |
| Cache tags (new) | `settings:paywall`, `newsletters:all` | busted by the new `afterChange` hooks |

## Blast Radius

- `apps/web/src/lib/shell.tsx` is rewritten twice (Stage A's session bridge, Stage C's meter) — re-read its actual current shape before each stage, don't diff blind against this document.
- `apps/web/src/components/header.tsx` is touched by Stages A (sign-out) and C (threshold) — re-verify the other stage's change still works after each edit.
- `apps/web/src/lib/account-actions.ts` and `apps/web/src/lib/session.ts` are extended twice (Stage B, then Stage D) — additive only; do not refactor an earlier stage's exports as a side effect.
- First production `@dtw/db/client` use in `apps/web/src` is Stage A (via `drizzleAdapter`), then Stage B's first hand-written Drizzle query — confirm `packages/db/package.json`'s `exports` map resolves `@dtw/db` and `@dtw/db/client` before writing the first import.
- `deleteUser` (Stage D) is the single highest-consequence action in this plan — irreversible, cascades across 4 tables. Test last, disposable account only.
- Two independent migration systems share one Postgres DB (Drizzle vs. Payload) — Stage C and Stage D's migrations go through Payload's system only; never generate one system's tables from the other's CLI.

---

## Verification Evidence

Every stage's report must include, not paraphrase:
- The actual SQL query results for every DB claim in that stage's manual smoke (not "confirmed").
- `pnpm typecheck`, `pnpm lint`, `pnpm build` pass/fail summary (repo root, after each stage and again at the end).
- Explicit note of what was tested manually vs. explicitly skipped (e.g. OAuth without local Google credentials) and why.
- No automated test runner exists in this repo yet (`process/context/tests/all-tests.md` confirms zero `*.test.ts*` files) — this plan's entire verification surface is typecheck/lint/build + manual + DB query evidence, matching the rest of the codebase.

A report that only says "build succeeded" does not satisfy this plan's completion bar.

## Durable Report Target

`process/features/account/reports/reader-auth-account-simple_REPORT_<execution-date>.md` — one report covering all 4 stages, with a clearly labeled section per stage (evidence as above), errors encountered/fixed, and explicit user confirmation.

## Context Doc Reconciliation (do at the end of EXECUTE)

- `process/context/auth/all-auth.md` — remove the magic-link-is-primary framing and the planned-middleware section; replace with: email+password + Google (GitHub optional-hidden) is the reality, enforcement is per-page/per-action.
- `process/features/account/_GUIDE.md` — remove the `/auth/callback` route claim and the Read-later tab as current scope (still backlog); reflect the files actually created above.
- `process/features/articles/_GUIDE.md` — replace the stale "PostHog feature flag `paywall_meter_threshold`" line with the Payload Global actually shipped.
- `process/features/newsletters/_GUIDE.md` — note that double opt-in is deferred; single opt-in is the current shipped behavior.

---

## Implementation Checklist

**Stage A (Auth Foundation)**
1. Add `better-auth`/`resend` deps to `apps/web/package.json`; `pnpm install`.
2. Create `apps/web/src/lib/email.ts` (DTW-rebranded).
3. Create `apps/web/src/lib/auth.ts` (no magic link, no Apple).
4. Create `apps/web/src/lib/auth-client.ts`.
5. Create `apps/web/src/lib/session.ts`.
6. Create `apps/web/src/app/api/auth/[...all]/route.ts`.
7. Create `apps/web/src/app/(reader)/reset-password/page.tsx`.
8. Modify `apps/web/src/lib/shell.tsx` for the real session bridge.
9. Rewrite `apps/web/src/components/auth-modal.tsx`.
10. Modify `apps/web/src/components/header.tsx` for real sign-out.
11. Modify `apps/web/src/payload/collections/Users.ts` for RBAC hardening.
12. Modify `.env.example` and `turbo.json`.
13. Run `pnpm typecheck && pnpm lint && pnpm build`; perform Stage A's manual smoke; capture evidence.

**Stage B (Account Data Layer)**
14. Create `apps/web/src/lib/account-actions.ts`.
15. Extend `apps/web/src/lib/session.ts` with `listBookmarks`/`listHistory`/`listFollows`.
16. Extend `apps/web/src/lib/payload-server.ts` with `getArticlesByIds`.
17. Rewrite `/account/[[...tab]]/page.tsx` as a `force-dynamic` RSC.
18. Modify `share-bar.tsx` and `article-content.tsx`.
19. Run typecheck/lint/build; perform Stage B's manual smoke; capture evidence.

**Stage C (Paywall)**
20. Create the `PaywallSettings` Global + revalidate hook; register in `payload.config.ts`.
21. Generate and commit the Payload migration.
22. Extend `payload-server.ts` (`getPaywallThreshold`), create `lib/paywall.ts`, extend `session.ts` (`getReadCountThisPeriod`), create `paywall-actions.ts`.
23. Modify `(reader)/layout.tsx`, `shell.tsx`, `header.tsx`, `article-content.tsx`.
24. Rewrite `paywall.tsx`.
25. Run typecheck/lint/build; perform Stage C's manual smoke; capture evidence.

**Stage D (Settings + Newsletter)**
26. Port the Settings tab logic (`changeEmail`/`changePassword`/`deleteUser`).
27. Create the `Newsletters` collection + revalidate hooks; register; generate migration + types.
28. Extend `payload-server.ts` (`getNewsletters`), `account-actions.ts` (`setNewsletter`/`subscribeGuest`/`isSubscribed`), `session.ts` (`listNewsletterSubs`).
29. Modify `newsletter-cta.tsx`, split `/newsletters/page.tsx`, wire the account Newsletters tab.
30. Seed the 6 canonical newsletters in `seed-payload.ts`.
31. Run typecheck/lint/build; perform Stage D's manual smoke (settings first, delete-account test last); capture evidence.

**Closeout**
32. Write the durable report to `process/features/account/reports/reader-auth-account-simple_REPORT_<execution-date>.md`.
33. Apply the Context Doc Reconciliation edits.
34. Recommend `vc-git-manager` for commit splitting; request UPDATE PROCESS.

---

## Resume and Execution Handoff

If resumed after a gap or context compaction:

1. Re-read this file in full before touching any file — it is the sole execute anchor.
2. Confirm which stage(s) already have code by checking for the stage's first-listed touchpoint file (e.g. Stage A: does `apps/web/src/lib/auth.ts` exist? Stage C: does `apps/web/src/payload/globals/PaywallSettings.ts` exist?). Do not assume a stage is untouched without checking.
3. Stages are ordered A → B → C ⟂ D (C and D both depend only on B and may run in either order, but keep only one "in flight" at a time; do not interleave their file edits in the same working session).
4. Re-read `apps/web/src/lib/shell.tsx`, `apps/web/src/components/header.tsx`, `apps/web/src/lib/session.ts`, and `apps/web/src/lib/account-actions.ts` at the start of every stage after Stage A — each later stage extends files an earlier stage created, and this plan cannot see mid-execution drift.
5. Do not resurrect anything in [Deferred](#deferred-not-this-pass) without a new, explicit user approval — that is a scope change, not an implementation detail.
6. On full completion: write the durable report, apply the Context Doc Reconciliation edits, and recommend `vc-git-manager` for logical commit splitting before UPDATE PROCESS.

## Next Step

This plan is ready for review. Once approved, the next explicit instruction should be **`ENTER EXECUTE MODE`** targeting this exact file: `process/features/account/active/reader-auth-account-simple_PLAN_03-07-26.md`.
