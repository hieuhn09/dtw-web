# Phase 5 — Newsletters (CMS Collection + Double Opt-In) — Phase Plan

**Date**: 03-07-26
**Complexity**: Complex — Phase 5 of 5 in the `reader-auth-account` phase program (see umbrella)
**Feature**: `account`
**Status**: ⏳ PLANNED (no code written yet)
**Umbrella plan**: `process/features/account/active/reader-auth-account_UMBRELLA-PLAN_03-07-26.md`
**Report target**: `process/features/account/reports/phase-05-newsletters-double-optin_REPORT_<execution-date>.md`

## Quick Links

- [Overview](#overview)
- [Objective](#objective)
- [Dependencies](#dependencies)
- [Grounding & Re-Verification (Read Before Executing)](#grounding--re-verification-read-before-executing)
- [Phase Completion Rules](#phase-completion-rules)
- [Acceptance Criteria](#acceptance-criteria)
- [Implementation Checklist](#implementation-checklist)
- [Touchpoints](#touchpoints)
- [Deep-Dive: The Signed-In Upsert Algorithm (No Schema Change)](#deep-dive-the-signed-in-upsert-algorithm-no-schema-change)
- [Deep-Dive: Guest Double Opt-In (Token Expiry + Reuse Semantics)](#deep-dive-guest-double-opt-in-token-expiry--reuse-semantics)
- [Deep-Dive: The 6 Canonical Newsletters (Seed Data)](#deep-dive-the-6-canonical-newsletters-seed-data)
- [Public Contracts](#public-contracts)
- [Out of Scope](#out-of-scope)
- [Blast Radius](#blast-radius)
- [Validation Gates](#validation-gates)
- [Verification Evidence](#verification-evidence)
- [Durable Report Target](#durable-report-target)
- [Blockers That Would Justify 🚧 BLOCKED](#blockers-that-would-justify--blocked)
- [Cross-Phase Follow-Up Notes (Not This Phase's Job)](#cross-phase-follow-up-notes-not-this-phases-job)
- [Resume and Execution Handoff](#resume-and-execution-handoff)

---

## Overview

This is the fifth and final phase plan of the `reader-auth-account` phase program (see the umbrella plan). It replaces dtw-web's static `NEWSLETTERS` fixture and demo (`alert(...)`-only) subscribe forms with a real Payload `Newsletters` collection and a real, mandatory-double-opt-in subscription funnel: guests confirm via an emailed token before a subscription row is created, and signed-in readers toggle instantly, keyed on `user_id` so a later email change never orphans their subscription (fixing brief-asia's own documented bug). Newsletter **sending** infrastructure (Resend broadcasts, scheduling, segments) is explicitly out of scope — this phase builds the subscription funnel only.

## Objective

Build a real newsletter subscription funnel for dtw-web:

1. A Payload `Newsletters` CMS collection (currently only a static fixture in `apps/web/src/lib/data.ts`), seeded with dtw's 6 canonical newsletters.
2. Signed-in readers toggle subscriptions instantly from the Account → Newsletters tab, keyed on `user_id` (not email), so changing account email never orphans a subscription (fixes brief-asia bug AD-8 #3).
3. Guests go through mandatory **double opt-in**: submit email + newsletter picks → pending confirmation row + emailed token → `GET /api/newsletter/confirm?token=` → real subscription row(s).
4. The header's existing "Subscribe" entry point and the homepage newsletter CTA are wired into this same funnel instead of their current demo/no-op behavior.

**Explicitly out of scope**: actual newsletter *sending* (Resend broadcast/campaign/scheduling infrastructure). This phase builds the **subscription** funnel only — see [Out of Scope](#out-of-scope).

## Dependencies

- **Phase 1 — Auth Foundation** (`process/features/account/active/phase-01-auth-foundation_PLAN_03-07-26.md`, now exists in `active/` but not yet executed/verified) must be `✅ VERIFIED` before this phase executes. This phase needs, from Phase 1:
  - `apps/web/src/lib/email.ts` (Resend-or-console-fallback wrapper + `actionEmail()` template) — extended here with a confirmation-email helper.
  - `apps/web/src/lib/session.ts` (`requireUser()`, `getSessionUser()`) — used to gate the signed-in toggle and read the session email for the claim algorithm below.
  - A real `useShell().user` (Phase 1 replaces the fake in-memory user with a Better-Auth session) — the homepage `NewsletterCta` needs this to branch guest-vs-signed-in.
- **Phase 2 — Account Data Layer** (`process/features/account/active/phase-02-account-data-layer_PLAN_03-07-26.md`, now exists in `active/` but not yet executed/verified) must be `✅ VERIFIED` for the **Account page Newsletters tab** touchpoint only. Phase 2 converts `apps/web/src/app/(reader)/account/[[...tab]]/page.tsx` from a client+mock page into a server component; this phase's tab rewrite must be built against whatever shape Phase 2 (and possibly Phase 4) actually leaves behind, not the pre-Phase-2 shape read during this PLAN pass (see the explicit caveat in [Touchpoints](#touchpoints)).
- **Independent of Phase 3 and Phase 4.** Does not depend on the paywall meter or the read-later queue.
- Per `process/development-protocols/phase-programs.md`'s Re-Research Rule: this phase's own kickoff (its execute pass) must re-run RESEARCH against the live repo before writing code, even though this PLAN pass already did substantial verification below — code will have moved between now and Phase 5's actual execution turn (at minimum, Phases 1–4 will have landed).

## Grounding & Re-Verification (Read Before Executing)

This plan was written after reading `process/context/all-context.md` (root router), the umbrella plan in full, `process/context/planning/all-planning.md`, `process/development-protocols/plan-lifecycle.md`, and the `vc-generate-plan` skill contract. It is grounded in the same research the umbrella used, now captured durably at `process/features/account/references/brief-asia-port-map_REFERENCE_03-07-26.md` (primary — `synthesis` + `research.briefAuth`/`briefUsers`/`briefReading`/`dtwState`; original scratchpad source `research-port-map.json` retained as a secondary note), but **every claim below was independently re-verified against the live filesystem during this PLAN pass** (not just copied from the umbrella or the research JSON), because the umbrella explicitly flagged Phase 5's touchpoints as unverified ("exact file names to be confirmed at Phase 5 kickoff research — not verified during this umbrella PLAN pass").

Findings that **refine or correct** the umbrella's Phase 5 assumptions (read these before writing any code):

1. **`newsletter_subscriptions` has NO unique index on `(user_id, newsletter_id)`.** Read in full: `packages/db/src/schema/account.ts` lines 85–101. The only unique index is `newsletter_subscriptions_pk` on `(email, newsletter_id)`. The umbrella's phrasing ("the `newsletter_subscriptions.userId` column already exists, nullable-FK'd, exactly for this") is true for the *column*, but a naive `ON CONFLICT (userId, newsletterId)` upsert is **not possible** — there is no constraint to target. This does **not** require a schema change (AD-7's "zero Drizzle schema changes for Phase 5" claim still holds); it means the signed-in upsert must be **application-level select-then-write**, specified precisely in [Deep-Dive: The Signed-In Upsert Algorithm](#deep-dive-the-signed-in-upsert-algorithm-no-schema-change) below. This is a refinement, not a blocker.
2. **`newsletter_subscriptions.id` has no `.default()`.** (`packages/db/src/schema/account.ts` line 88: `id: text("id").primaryKey()`.) Application code must generate it. This plan specifies `crypto.randomUUID()` (Node built-in, `import { randomUUID } from "node:crypto"`, zero new dependency) as the id-generation convention, since no other code in the repo has ever written to this table yet (confirmed: `grep -rn "randomUUID\|cuid2\|nanoid\|createId(" apps/web/src packages/db/src` returns zero hits — this phase establishes the convention).
3. **dtw's header has no interactive "SubscribeButton" component**, unlike brief-asia's `src/components/subscribe-button.tsx`. Confirmed via grep of `apps/web/src/components/header.tsx`: the header's "Subscribe" affordance (desktop, ~line 261–276; mobile menu, ~line 793–806) is a **plain `<Link href="/newsletters">`**, not an interactive widget. `process/features/newsletters/_GUIDE.md`'s own design intent (read in full) does not call for a header popover either — it specifies a full `/newsletters` picker page and a separate "mini subscribe (footer + post-article)" surface. **Decision**: this phase does **not** invent a new header popover component. "Wire header SubscribeButton...to the same funnel" is satisfied by making `/newsletters` (the page the header link already points to) real — see touchpoint table. `header.tsx` itself needs **zero code changes** in this phase; verify-only.
4. **The homepage newsletter CTA is `apps/web/src/components/home/newsletter-cta.tsx`** (`NewsletterCta`, confirmed rendered on the homepage), currently a `"use client"` demo form for the single flagship newsletter "AM Brief" that calls `alert("Confirmation email sent (demo)")` on submit. This is the concrete "homepage newsletter CTA" referenced by the umbrella and this phase's brief. It gets wired to the real funnel (guest: `subscribeGuest`; signed-in: `setNewsletter`), following brief-asia's `subscribe-button.tsx` pattern (`FLAGSHIP` constant, `useShell().user`-branching) adapted to dtw's newsletter id `"am"`.
5. **A near-identical demo form also exists in `apps/web/src/components/footer.tsx`** ("Newsletter strip", ~lines 68–131, same `alert("Confirmation email sent (demo)")` bug, same flagship "AM Brief" copy). This was **not** named in the umbrella's Phase 5 touchpoints or in this phase's brief. **Decision**: leave `footer.tsx` untouched in this phase — do not silently expand scope beyond what was specified. Flagged explicitly in [Cross-Phase Follow-Up Notes](#cross-phase-follow-up-notes-not-this-phases-job) as a same-shape, low-effort follow-up (it would reuse the exact same `subscribeGuest("am", …)` call this phase builds).
6. **dtw's `NEWSLETTERS` fixture in `apps/web/src/lib/data.ts` (lines 541–550) has 8 entries**, not 6 — it additionally lists `"deep"` (Deep Dive) and `"awards"` (DTW Awards), neither of which is part of the canonical newsletter-id set. Cross-checked against `packages/db/src/schema/account.ts`'s own doc comment on `newsletterId` (`'am' | 'pm' | 'ai' | 'fund' | 'dev' | 'prod'` — exactly 6). **Decision**: seed exactly these 6 canonical ids in the Payload collection (matching this phase's brief and the schema's own documented contract). This means `/newsletters/page.tsx`'s hardcoded copy ("Newsletters · 8 picks · all free" and other static "8" mentions) and `newsletter-cta.tsx`'s "Eight newsletters · pick what you read" / "AM Brief, PM Brief, AI Weekly, Asia Funding, Dev Digest, Products & Deals, Deep Dive, DTW Awards" body copy must be updated to say **6** and drop the Deep Dive / DTW Awards mentions — otherwise the copy will contradict what the page actually renders once it's driven by the real (6-item) CMS list. This is a required part of this phase's touchpoints, not optional polish.
7. **`payload.config.ts` currently registers 10 collections, zero `globals`.** Confirmed by reading the file in full. `Newsletters` will be the 11th collection, following the exact same collection-file → `payload.config.ts` `collections: []` array → `payload:migrate:create` → commit pattern already used for all 10.
8. **The Payload `Newsletters.ts` collection shape to port** (from `/home/hieunc/Code/brief-asia-web/src/payload/collections/Newsletters.ts`, read in full) is: `name` (text, required, unique), `slug` (text, required, unique), `cadence` (text, required), `description` (textarea, required), `vertical` (relationship → `pillars`), `active` (checkbox, default `true`), `order` (number, default `0`, required); `access: { read: () => true, create/update: editor|admin, delete: admin }` — this exactly matches dtw's own `Tags.ts`/`Pillars.ts` collection conventions (read in full for comparison), so it is a clean, idiomatic port, not an adaptation.
9. **dtw's `apps/web/scripts/seed-payload.ts` already has a reusable idempotent `upsert(payload, collection, where, data)` helper** (lines 319–338, find-by-`where` then `update`-or-`create`, both wrapped in `context: { disableRevalidate: true }`) used identically for pillars/authors/tags/articles. This phase's newsletter seed step reuses this exact helper — it does not need a new pattern.
10. **`apps/web/src/app/(reader)/account/[[...tab]]/page.tsx` is pre-Phase-2 today** (client component, mock `ARTICLES`/`NEWSLETTERS` fixtures, `TABS` = saved/history/following/newsletters/settings, `AccountNewsletters()` renders `NEWSLETTERS.slice(0,3)` with non-functional Pause/Unsubscribe buttons — read in full). By the time this phase executes, **Phase 2 will have rewritten this file into a server component** (and Phase 4 may have added a read-later tab). This plan specifies the **functional requirement** for the Newsletters tab (real 6-newsletter list, real per-newsletter subscribed-state, real toggle wired to `setNewsletter`) rather than a line-by-line diff against the file read during this PLAN pass, because diffing against pre-Phase-2 line numbers would be unsafe. Re-read the actual file shape at Phase 5 kickoff before editing it.
11. **`packages/db/src/index.ts` re-exports `packages/db/src/schema/index.ts`**, so `newsletterSubscriptions` / `pendingNewsletterConfirmations` import from `@dtw/db` (barrel), and the query client imports from `@dtw/db/client` — confirmed via `packages/db/package.json`'s `exports` map (`"."` → `./src/index.ts`, `"./client"` → `./src/client.ts`).
12. **No test runner is installed anywhere in this repo** (confirmed via `process/context/tests/all-tests.md` and a repo-wide grep during the umbrella's own grounding — re-confirmed still true, no `vitest`/`*.test.ts*` files exist). Validation gates below are typecheck/lint/build + manual/DB verification, matching every other phase in this program.

## Phase Completion Rules

A phase is NOT complete until:

1. **Integration Test** — Works with other system pieces end-to-end.
2. **Manual Test** — A human (or an equivalent scripted flow) can actually perform the action.
3. **Data Verification** — Database/state changes confirmed by an actual query, not by code inspection.
4. **Error Handling** — Failure cases (missing env var, mail outage, expired/reused token, race on double-click) are handled gracefully, not just the happy path.
5. **User Confirmation** — The plan owner (user) explicitly confirms the phase works, not just that the agent believes it does.

| Marker | Meaning |
|---|---|
| ⏳ PLANNED | Not started |
| 🔨 CODE DONE | Written but not end-to-end tested |
| 🧪 TESTING | Currently being tested |
| ✅ VERIFIED | Tested AND confirmed working (phase gates **and** regression checks both pass, **and** the plan owner has explicitly confirmed it) |
| 🚧 BLOCKED | Has issues preventing completion |

The phase report (see [Durable Report Target](#durable-report-target)) must document: what was tested manually (exact steps), data verified in DB (query + result), errors encountered and fixed, regression checks against Phases 1/2/4, and user confirmation received.

## Acceptance Criteria

Testable, phase-level criteria (roll up into the umbrella's own Phase 5 bullet: "Guests double-opt-in to newsletters via a confirmation email; signed-in readers toggle instantly; changing account email does not orphan a subscription"):

- [ ] A signed-in reader can toggle any of the 6 canonical newsletters (`am`/`pm`/`ai`/`fund`/`dev`/`prod`) on/off from the Account → Newsletters tab, with state persisted in `newsletter_subscriptions` keyed by `user_id`, not just `email`.
- [ ] Changing the account's email (via Phase 4's `changeEmail`, if landed) does not orphan an existing `user_id`-keyed subscription (AD-8 #3 closed) — the row remains findable and toggleable afterward.
- [ ] A guest cannot create a `newsletter_subscriptions` row directly — submitting email + picks on `/newsletters` or the homepage CTA only ever creates a `pending_newsletter_confirmations` row until the emailed token is clicked (double opt-in enforced, not single opt-in like brief-asia).
- [ ] An expired confirmation token and a reused/already-consumed confirmation token both fail gracefully (no unhandled error, no duplicate rows, a clear status page) rather than crashing or silently succeeding twice.
- [ ] The Payload `newsletters` collection is CMS-editable (add/deactivate/reorder) without a redeploy, and every reader-facing surface (`/newsletters`, homepage CTA, Account tab) reflects a CMS change within the cache's revalidate window or immediately via `revalidateTag("newsletters:all")`.
- [ ] The header's existing "Subscribe" link and the homepage newsletter CTA both lead into this real funnel; neither shows the old `alert("...demo")` behavior anymore.
- [ ] `pnpm typecheck`, `pnpm lint`, and `pnpm build` all pass clean after this phase's changes.
- [ ] The phase report exists at the [Durable Report Target](#durable-report-target) with real DB-query evidence for every validation-gate scenario, not just "build succeeded."

## Implementation Checklist

Atomic, ordered steps for EXECUTE. Each step should be independently verifiable before moving to the next; re-verify the [Grounding](#grounding--re-verification-read-before-executing) findings against the live repo first if any meaningful time has passed since this plan was written.

1. Confirm Phase 1 and Phase 2 are `✅ VERIFIED` in the umbrella plan's Phase Status Table; re-run the specific greps listed in [Resume and Execution Handoff](#resume-and-execution-handoff) item 4 to re-check grounding findings #3–#6 for drift.
2. Create `apps/web/src/payload/collections/Newsletters.ts` with the fields, access rules, and hooks specified in [Touchpoints](#touchpoints) and grounding finding #8.
3. Register `Newsletters` in `apps/web/payload.config.ts` (import + insert into the `collections: []` array after `Corrections`, before `SponsorSlots`).
4. Add `revalidateNewsletter` (`CollectionAfterChangeHook`) and `revalidateNewsletterDelete` (`CollectionAfterDeleteHook`) to `apps/web/src/payload/hooks/revalidate.ts`, tag `"newsletters:all"`, mirroring the existing `revalidatePillar`/`revalidatePillarDelete` pattern exactly.
5. Run `pnpm --filter web payload:migrate:create` to generate the new Payload migration for the `newsletters` table; commit the generated `{ts,json}` pair in `apps/web/src/payload/migrations/`. Do **not** run `pnpm db:generate` (no Drizzle schema change in this phase — AD-7).
6. Run `pnpm --filter web payload:generate-types` so `apps/web/src/payload/payload-types.ts` exports a `Newsletter` type.
7. Add `getNewsletters()` to `apps/web/src/lib/payload-server.ts` (`unstable_cache`, tag `"newsletters:all"`, `revalidate: 300`, `depth: 1`, `where: { active: { equals: true } }`, `sort: "order"`), mirroring `getPillars`/`getNavPillars`'s exact signature shape in the same file.
8. Extend `apps/web/scripts/seed-payload.ts`: add `"newsletters"` to the `CollSlug` union, add the 6-entry newsletter fixture array from [Deep-Dive: The 6 Canonical Newsletters](#deep-dive-the-6-canonical-newsletters-seed-data), add a seed step reusing the existing `upsert()`/`findIdBy()` helpers to resolve each `vertical` pillar slug and idempotently create/update each newsletter row keyed by `slug`.
9. Run `pnpm --filter web db:seed`; verify exactly 6 `newsletters` docs exist in `/admin` with the correct slugs/verticals/order; re-run the seed script once more and confirm it stays idempotent (still exactly 6 rows).
10. Add `sendNewsletterConfirmationEmail(to, token, confirmUrl)` to `apps/web/src/lib/email.ts` — first re-verify Phase 1's actual exported fail-open wrapper name/shape, then build the confirmation email on top of it (English-only body, AD-4).
11. Add `setNewsletter(newsletterId, subscribe)`, `subscribeGuest(email, newsletterIds)`, `confirmNewsletterToken(token)`, and `isSubscribed(newsletterId)` to `apps/web/src/lib/account-actions.ts`, implementing the exact algorithms in [Deep-Dive: The Signed-In Upsert Algorithm](#deep-dive-the-signed-in-upsert-algorithm-no-schema-change) and [Deep-Dive: Guest Double Opt-In](#deep-dive-guest-double-opt-in-token-expiry--reuse-semantics).
12. Add `listNewsletterSubs(userId)` to `apps/web/src/lib/session.ts`, mirroring Phase 2's `listBookmarks`/`listHistory`/`listFollows` pattern.
13. Create `apps/web/src/app/api/newsletter/confirm/route.ts` (`GET`, `force-dynamic`) calling `confirmNewsletterToken` and redirecting to `/newsletter/confirmed?status=success|expired|invalid`.
14. Create `apps/web/src/app/(reader)/newsletter/confirmed/page.tsx` (server component, reads `searchParams.status`, renders one of three `t(en, vi, id)` messages).
15. Split `apps/web/src/app/(reader)/newsletters/page.tsx` into an async server component (`await getNewsletters()`) plus a new `apps/web/src/app/(reader)/newsletters/newsletters-content.tsx` client component (receives `newsletters` as a prop, keeps the existing multi-select UI, wires the submit handler to `subscribeGuest`); update the "8"/"Deep Dive"/"DTW Awards" copy per grounding finding #6.
16. Modify `apps/web/src/components/home/newsletter-cta.tsx`: add `useShell()`/`isSubscribed("am")` session-awareness, replace the demo `alert(...)` submit handler with real `subscribeGuest`/`setNewsletter` calls, update the "Eight newsletters"/Deep-Dive/Awards copy per grounding finding #6.
17. Verify (no code change expected) that `apps/web/src/components/header.tsx`'s desktop and mobile "Subscribe" links still correctly point to `/newsletters` per grounding finding #3.
18. Rewrite the Account page's Newsletters tab — wherever Phase 2 (and possibly Phase 4) actually leave `apps/web/src/app/(reader)/account/[[...tab]]/page.tsx` — to render all 6 real newsletters from `getNewsletters()` joined with `listNewsletterSubs(user.id)`, with toggles calling `setNewsletter` as an optimistic-update + `router.refresh()` island, mirroring Phase 2's Saved/History tab pattern.
19. Run `pnpm typecheck`, `pnpm lint`, `pnpm build` at the repo root; all must pass clean.
20. Execute every scenario in [Validation Gates](#validation-gates) (manual + data verification + regression); capture evidence per [Verification Evidence](#verification-evidence).
21. Write the phase report to the [Durable Report Target](#durable-report-target); update the umbrella plan's Phase Status Table row for Phase 5 to `✅ VERIFIED` (only after explicit user confirmation, per Phase Completion Rules).

---

## Touchpoints

| File | Change |
|---|---|
| `apps/web/src/payload/collections/Newsletters.ts` (**new**) | Payload `CollectionConfig`, slug `"newsletters"`. Fields: `name` (text, required, unique), `slug` (text, required, unique — **must exactly equal** the Drizzle `newsletterId` semantic ids `am`/`pm`/`ai`/`fund`/`dev`/`prod`; no FK exists between the two systems, linkage is by string-value convention only, matching the doc comment already on `packages/db/src/schema/account.ts`'s `newsletterSubscriptions` table), `cadence` (text, required), `description` (textarea, required), `vertical` (relationship → `pillars`, single), `active` (checkbox, default `true`), `order` (number, default `0`, required). `admin: { useAsTitle: "name", defaultColumns: ["name","cadence","vertical","active","order"] }`. `access: { read: () => true, create: ({req}) => req.user?.role === "editor" || req.user?.role === "admin", update: same, delete: ({req}) => req.user?.role === "admin" }` (mirrors `Tags.ts`/`Pillars.ts` exactly). `hooks: { afterChange: [revalidateNewsletter], afterDelete: [revalidateNewsletterDelete] }`. Include a header doc-comment (matching `Tags.ts`/`Pillars.ts` style) noting the slug/newsletterId convention-only linkage. No `versions`/drafts (matches `Tags.ts`/`Pillars.ts`/`SponsorSlots.ts`, none of which use drafts). |
| `apps/web/payload.config.ts` (**modify**) | Add `import { Newsletters } from "./src/payload/collections/Newsletters";` alongside the existing 10 imports. Insert `Newsletters` into the `collections: []` array — position: after `Corrections,`, before `SponsorSlots,` (cosmetic ordering only, does not affect behavior, but must not be omitted). |
| `apps/web/src/payload/hooks/revalidate.ts` (**modify**, existing file) | Add `revalidateNewsletter: CollectionAfterChangeHook` and `revalidateNewsletterDelete: CollectionAfterDeleteHook`, following the exact `revalidatePillar`/`revalidatePillarDelete` pattern already in the file (same `revalidationDisabled(context)` guard, same `bust(payload, tags, reason)` helper). Tag: `"newsletters:all"`. |
| `apps/web/src/lib/payload-server.ts` (**modify**, existing file) | Add `import type { Newsletter } from "../payload/payload-types";` to the existing type-import line. Add `getNewsletters()`: `unstable_cache(async () => { const p = await payload(); const r = await p.find({ collection: "newsletters", where: { active: { equals: true } }, sort: "order", limit: 12, depth: 1 }); return r.docs; }, ["newsletters:all"], { tags: ["newsletters:all"], revalidate: 300 })` — `depth: 1` so `doc.vertical` resolves to the full `Pillar` object (needed for the pillar color already used in `/newsletters/page.tsx`'s card styling), matching `getPillars`/`getNavPillars`'s exact `unstable_cache` signature shape in the same file. |
| `apps/web/src/lib/email.ts` (**modify**, created by Phase 1) | Add one new exported function, e.g. `sendNewsletterConfirmationEmail(to: string, token: string, confirmUrl: string): Promise<void>` that builds an `actionEmail({ heading: "Confirm your newsletter subscription", intro: "...", buttonLabel: "Confirm subscription", url: confirmUrl })` payload and sends it through the same fail-open send path Phase 1 builds for auth emails (Resend when `RESEND_API_KEY` is set, console fallback otherwise — verify Phase 1's exact exported wrapper name/shape at kickoff; do not assume it's still called `sendAuthEmailSafe` if Phase 1 renamed it). English-only body (AD-4 — no locale parameter). |
| `apps/web/src/lib/account-actions.ts` (**modify**, `"use server"`, created by Phase 2) | Add four exports, detailed in [Deep-Dive: The Signed-In Upsert Algorithm](#deep-dive-the-signed-in-upsert-algorithm-no-schema-change) and [Deep-Dive: Guest Double Opt-In](#deep-dive-guest-double-opt-in-token-expiry--reuse-semantics) below: `setNewsletter(newsletterId: string, subscribe: boolean)` (requires session), `subscribeGuest(email: string, newsletterIds: string[])` (no session required), `confirmNewsletterToken(token: string): Promise<{ ok: true } \| { ok: false; reason: "invalid" \| "expired" }>` (no session required — called by the route handler below), `isSubscribed(newsletterId: string): Promise<boolean>` (requires session, used by the Account tab and `NewsletterCta`). |
| `apps/web/src/lib/session.ts` (**modify**, created by Phase 1, extended by Phase 2) | Add `listNewsletterSubs(userId: string): Promise<NewsletterSubscription[]>` — read helper following the exact `listBookmarks`/`listHistory`/`listFollows` pattern Phase 2 establishes in this file, `WHERE user_id = ? AND unsubscribed_at IS NULL`. Used by the Account Newsletters tab to render all-6-with-state in one query instead of 6 separate `isSubscribed` calls. |
| `apps/web/src/app/api/newsletter/confirm/route.ts` (**new**) | `GET` route handler, `export const dynamic = "force-dynamic"`. Reads `?token=` from `request.nextUrl.searchParams`. Missing token → redirect to `/newsletter/confirmed?status=invalid`. Otherwise calls `confirmNewsletterToken(token)` and redirects to `/newsletter/confirmed?status=success\|expired\|invalid` based on the result. See [Deep-Dive: Guest Double Opt-In](#deep-dive-guest-double-opt-in-token-expiry--reuse-semantics). |
| `apps/web/src/app/(reader)/newsletter/confirmed/page.tsx` (**new**) | Server component reading `searchParams.status` (`"success" \| "expired" \| "invalid"`, default to `"invalid"` if missing/unrecognized). Renders one of three short i18n (`t(en, vi, id)`) messages matching the existing "Check your inbox" visual style used in the auth-modal flow (per Phase 1), with a link back to `/` and (informational only, no session check needed) a link to `/account/newsletters`. Lives inside the `(reader)` route group so it inherits Header/Footer/ShellProvider/I18nProvider chrome automatically — no new layout needed. |
| `apps/web/src/components/home/newsletter-cta.tsx` (**modify**, existing file, currently `"use client"` demo) | Add `useShell()` (for `user`) and `useEffect` to load `isSubscribed("am")` when signed in (mirrors brief-asia's `subscribe-button.tsx` load-effect). Replace the `onSubmit={(e) => { e.preventDefault(); alert(...); }}` handler: if `user` is set, the form is replaced by a single "Subscribed"/"Subscribe to AM Brief" toggle button calling `setNewsletter("am", !subscribed)` directly (no email input needed — session email already verified); if guest, keep the email input, `onSubmit` calls `subscribeGuest(email, ["am"])`, then replaces the form with a "Check your inbox" success message (no more `alert`). Update the hardcoded copy per finding #6 above: `"Eight newsletters · pick what you read"` → six-newsletter phrasing; the body paragraph listing `"...Deep Dive, DTW Awards..."` → drop those two, list only the 6 canonical names. |
| `apps/web/src/app/(reader)/newsletters/page.tsx` (**split into two files**) | Currently a single `"use client"` file using the `NEWSLETTERS`/`pillarOf` fixture. Payload's `getNewsletters()` is server-only (`payload-server.ts` starts with `import "server-only"`), so it cannot be called from this client component directly. Convert `page.tsx` into an **async server component** that calls `const newsletters = await getNewsletters();` and renders a new client component `apps/web/src/app/(reader)/newsletters/newsletters-content.tsx` (`"use client"`, receives `newsletters: Newsletter[]` — Payload's generated type, imported from `@/payload/payload-types` or the correct relative path — as a prop; **not** the same-named fixture interface in `@/lib/data.ts`, to avoid a type-name collision). Move the existing interactive body (multi-select checkboxes, email input, submit handling) into `newsletters-content.tsx` nearly verbatim, but: replace `NEWSLETTERS.map(...)` with `newsletters.map(...)`, replace `pillarOf(n.pillar)` (fixture lookup by `PillarId` string) with reading `n.vertical` directly (an expanded `Pillar` object at `depth: 1`, falling back to a default color if `vertical` is null), replace the final `onSubmit`'s `setSubmitted(true)`-only stub with a real `subscribeGuest(email, Array.from(picks))` call before showing the "Check your inbox →" state. Update the "Newsletters · 8 picks · all free" kicker and default `picks` seed (`new Set(["am","ai"])` — already valid canonical ids, no change needed there) per finding #6. |
| `apps/web/src/lib/data.ts` (**no code deletion in this phase**) | `NEWSLETTERS` fixture and the `Newsletter` interface become unused by the migrated surfaces above but are **not deleted** in this phase (see [Cross-Phase Follow-Up Notes](#cross-phase-follow-up-notes-not-this-phases-job) — safe cleanup only after a full-repo grep confirms zero remaining references, which is out of this phase's verification budget). |
| Account page Newsletters tab (inside whatever Phase 2/4 leave `apps/web/src/app/(reader)/account/[[...tab]]/page.tsx` as — **re-verify actual shape at kickoff**, see grounding finding #10) | Functional requirement: replace the mock `NEWSLETTERS.slice(0,3)` render with a real list built from `getNewsletters()` (server-fetched, all 6, not sliced to 3) joined against `listNewsletterSubs(user.id)` (subscribed boolean per newsletter). Each row's "Subscribe"/"Pause"/"Unsubscribe" control(s) call `setNewsletter(newsletterId, nextState)` as a client-side optimistic-update + `router.refresh()` island, mirroring Phase 2's Saved/History tab optimistic-mutation pattern (per the umbrella's Phase 2 section). |
| `apps/web/scripts/seed-payload.ts` (**modify**, existing file) | Add `"newsletters"` to the `CollSlug` union type (line 308). Add a `NEWSLETTERS` fixture array (6 entries: `{ slug, name, cadence, description, verticalSlug, order }` for `am`/`pm`/`ai`/`fund`/`dev`/`prod` — see [Deep-Dive: The 6 Canonical Newsletters](#deep-dive-the-6-canonical-newsletters-seed-data) for exact values). Add a seed step (numbered after the existing tags/articles/wire-drops steps) that resolves each entry's `verticalSlug` to a pillar id via the existing `findIdBy(payload, "pillars", { slug: { equals: verticalSlug } })` helper, then calls the existing `upsert(payload, "newsletters", { slug: { equals: entry.slug } }, { name, slug, cadence, description, vertical: pillarId, active: true, order })` — identical idiom to the existing pillars/tags upsert steps, zero new pattern introduced. |
| `apps/web/src/components/header.tsx` | **No code change.** Verify-only (grounding finding #3): the existing `<Link href="/newsletters">Subscribe</Link>` (desktop ~line 261–276, mobile menu ~line 793–806) already routes correctly to the now-real `/newsletters` page. Confirm this at kickoff and again in the phase's manual gates; do not add a new component here. |

### Migration step (Payload, not Drizzle — AD-7)

Run `pnpm --filter web payload:migrate:create` to generate the SQL for the new `newsletters` table (required because `payload.config.ts` sets `push: false`, confirmed). The exact CLI invocation (positional description arg vs. an interactive prompt vs. a `--name` flag) was not verified during this PLAN pass — confirm at execution time (e.g. `pnpm --filter web payload:migrate:create --help`, or simply run it and follow the prompt). The generated pair of files must land in `apps/web/src/payload/migrations/` following the existing `YYYYMMDD_HHMMSS_<description>.{ts,json}` naming convention (5 existing migrations already follow this, confirmed) and be committed in the same execution pass as the collection code. **Zero Drizzle migration is needed** — `pnpm db:generate` must **not** be run for this phase (AD-7, and re-confirmed by grounding findings #1–#2 above: the app-level upsert algorithm needs no new column or index).

Also run `pnpm --filter web payload:generate-types` after adding the collection (before `pnpm typecheck`/`pnpm build`) so the `Newsletter` type actually exists in `apps/web/src/payload/payload-types.ts` for `payload-server.ts` and the client components above to import.

---

## Deep-Dive: The Signed-In Upsert Algorithm (No Schema Change)

Because `newsletter_subscriptions`'s only unique constraint is `(email, newsletter_id)` (grounding finding #1), `setNewsletter(newsletterId, subscribe)` must be implemented as an explicit application-level select-then-write, not a DB-level `ON CONFLICT`. This is the **exact, complete algorithm** — implement it precisely, do not improvise a different shape:

```
setNewsletter(newsletterId, subscribe):
  user = requireUser()   // throws "Not authenticated" if no session — from session.ts (Phase 1)

  // 1. Look for a row already claimed by this user.
  row = SELECT * FROM newsletter_subscriptions
        WHERE user_id = user.id AND newsletter_id = newsletterId LIMIT 1

  if row exists:
    UPDATE newsletter_subscriptions
    SET unsubscribed_at = (subscribe ? NULL : now())
    WHERE user_id = user.id AND newsletter_id = newsletterId
    return

  // 2. No row claimed by this user yet — check for an "unclaimed" legacy row
  //    with the SAME email (guest double-opted-in before this account existed,
  //    or before they signed in with this email). Claiming it (not inserting a
  //    second row) is required: a second INSERT with the same (email,
  //    newsletter_id) would violate the existing unique index.
  legacyRow = SELECT * FROM newsletter_subscriptions
              WHERE user_id IS NULL AND email = user.email AND newsletter_id = newsletterId LIMIT 1

  if legacyRow exists:
    UPDATE newsletter_subscriptions
    SET user_id = user.id, unsubscribed_at = (subscribe ? NULL : now())
    WHERE email = user.email AND newsletter_id = newsletterId AND user_id IS NULL
    return

  // 3. Nothing exists yet.
  if subscribe === false:
    return   // no-op: nothing to unsubscribe from

  // 4. Insert new row (session email is already verified — no double opt-in
  //    needed for a signed-in subscribe, matches brief-asia's own reasoning).
  try:
    INSERT INTO newsletter_subscriptions (id, email, newsletter_id, user_id, confirmed_at, unsubscribed_at)
    VALUES (randomUUID(), user.email, newsletterId, user.id, now(), NULL)
  catch (Postgres unique-violation, error code 23505 on newsletter_subscriptions_pk):
    // Benign race: another concurrent request (e.g. a double-click) inserted
    // the same (email, newsletter_id) row between steps 1–3 and this INSERT.
    // Treat as success — re-run the claim UPDATE instead of surfacing an error.
    UPDATE newsletter_subscriptions
    SET user_id = user.id, unsubscribed_at = (subscribe ? NULL : now())
    WHERE email = user.email AND newsletter_id = newsletterId
```

Notes:

- **Unsubscribe never deletes the row** — it sets `unsubscribed_at = now()` (matches brief-asia's own soft-unsubscribe pattern, and preserves subscription history for the `confirmed_at`/`unsubscribed_at` columns' evident purpose).
- **The existing `(email, newsletter_id)` unique index still fully protects against duplicate rows** even for signed-in users, because step 4's `INSERT` always uses the session's real (deterministic) email — this is what makes the try/catch fallback in step 4 correct and necessary, not optional defensive code.
- **`isSubscribed(newsletterId)`** (read helper) is the same lookup as step 1+2 combined, returning `Boolean(row && !row.unsubscribed_at)`.
- **Verify Drizzle + `postgres-js`'s actual thrown-error shape for a unique violation** at execution time (does it expose a `.code === "23505"` property, or a different shape?) before relying on the catch above — flagged explicitly in [Blockers](#blockers-that-would-justify--blocked) if it differs materially from this assumption.

## Deep-Dive: Guest Double Opt-In (Token Expiry + Reuse Semantics)

**`subscribeGuest(email, newsletterIds)`** (no session; called from the homepage CTA and the `/newsletters` page):

1. Validate `email` (basic format check) and `newsletterIds` (non-empty; every id must match an `active: true` newsletter returned by `getNewsletters()` — defensive against subscribing to an unknown/deactivated id).
2. **Reuse semantics**: `DELETE FROM pending_newsletter_confirmations WHERE email = ?` — unconditionally clear any prior unconfirmed request for this email before issuing a new one. A resubmission always **supersedes** the previous pending token; the old token's link stops working (its row no longer exists, so `confirmNewsletterToken` on the old token returns `"invalid"`). No separate "already pending" error is shown to the user — the new submission just wins.
3. Generate `token = randomBytes(32).toString("hex")` (Node built-in `node:crypto`, 256-bit token, 64 hex chars — no new dependency).
4. `INSERT INTO pending_newsletter_confirmations (token, email, newsletter_ids, created_at, expires_at) VALUES (token, email, newsletterIds, now(), now() + interval '24 hours')`.
   - **Token expiry = 24 hours.** Rationale: longer than the 15-minute magic-link window (a session-granting credential) because this is a lower-stakes confirmation, not an auth token; matches common double-opt-in industry practice; explicit and fixed (not "TBD") per this plan's no-ambiguity requirement.
5. Call `sendNewsletterConfirmationEmail(email, token, confirmUrl)` where `confirmUrl = ${origin}/api/newsletter/confirm?token=${token}` — fail-open (a Resend outage must not roll back the pending row; matches Phase 1's fail-open email convention exactly).
6. Return `{ ok: true }` regardless of email delivery outcome (the pending row exists either way; if the email genuinely failed to send, the user's only recourse today is to resubmit — no explicit "resend" UI is in this phase's scope, matching the umbrella's stated boundary of not building the full newsletters sending pipeline).

**`confirmNewsletterToken(token)`** (no session; called only by the route handler):

1. `SELECT * FROM pending_newsletter_confirmations WHERE token = ?`. Not found → return `{ ok: false, reason: "invalid" }`.
2. If `expires_at < now()` → `DELETE FROM pending_newsletter_confirmations WHERE token = ?` (cleanup even on expiry, not just on success), return `{ ok: false, reason: "expired" }`.
3. Otherwise, for each `newsletterId` in `row.newsletterIds`: run the **same claim-or-insert logic as `setNewsletter` steps 1–4 above, but keyed by `email` instead of `user_id`** (guests have no `user_id`) — i.e. look up `(email, newsletterId)` directly (this table's actual unique index, so this path can safely use it), `UPDATE unsubscribed_at = NULL, confirmed_at = now()` if found, else `INSERT` with `user_id = NULL`.
4. `DELETE FROM pending_newsletter_confirmations WHERE token = ?` — **single-use**: the token is consumed on first successful (or expired) resolution.
5. Return `{ ok: true }`.

**Double-click / already-used token**: because the pending row is deleted in step 4, a second `GET` to the same confirm URL finds no row in step 1 and returns `{ ok: false, reason: "invalid" }` — same response as a token that never existed. This is intentional (no way to distinguish "never existed" from "already used" once the row is gone, and there's no sensitive data to leak either way) and must **not** throw an unhandled error or 500 — the route handler always redirects to `/newsletter/confirmed?status=...`, never crashes.

**Known accepted risk (not a blocker, matches an existing pattern elsewhere in this program)**: email-client link-prescanning (some corporate mail security scanners GET-prefetch links found in emails) can silently consume a single-use confirmation token before the human clicks it. Better-Auth's own magic-link and Phase 1's email-verification links share this exact risk class and are accepted as-is elsewhere in this program; this phase does not attempt to solve it (would require a confirm-via-POST-with-a-button pattern, out of scope).

## Deep-Dive: The 6 Canonical Newsletters (Seed Data)

Seed exactly these 6 (slug = the Drizzle `newsletterId` semantic value; name/cadence/description sourced from the existing `apps/web/src/lib/data.ts` `NEWSLETTERS` fixture entries for the matching id, dropping `subs`/count copy which was always fake demo data):

| slug | name | cadence | description (from fixture `desc`) | vertical (pillar slug) |
|---|---|---|---|---|
| `am` | AM Brief | Daily · 07:00 | What broke overnight across Asia tech, in 5 minutes. | `latest` |
| `pm` | PM Brief | Daily · 18:00 | The day in three stories, plus what to read tonight. | `latest` |
| `ai` | AI Weekly | Weekly · Tue | Models, papers, and the geopolitics underneath them. | `ai` |
| `fund` | Asia Funding Weekly | Weekly · Thu | Every term sheet that closed in ASEAN this week. | `startups` |
| `dev` | Dev Digest | Weekly · Fri | What practitioners are actually shipping. | `dev` |
| `prod` | Products & Deals | Bi-weekly | Reviews and buy-or-skip calls. Affiliate-disclosed. | `products` |

`order`: `1` through `6` in the table row order above (matches `am`/`pm`/`ai`/`fund`/`dev`/`prod` — the same order the schema comment lists them in). All seeded with `active: true`.

**Explicitly not seeded as `newsletters` collection docs**: `"deep"` (Deep Dive) and `"awards"` (DTW Awards) from the 8-entry fixture — these are not part of the canonical newsletter-id contract documented in `packages/db/src/schema/account.ts`, and this phase's brief explicitly says "seed dtw's 6." If a future phase wants a 7th/8th newsletter product, that is a new CMS row (invariant #8-style — no code deploy needed) and a `newsletterId` contract update, not something to guess into this phase.

---

## Public Contracts

**Environment variables**: none new. Reuses `RESEND_API_KEY`, `RESEND_FROM_DOMAIN` (already reserved in root `.env.example`, confirmed) via Phase 1's `email.ts`.

**Database tables**:
- Reads/writes `newsletter_subscriptions` and `pending_newsletter_confirmations` (both already exist in `packages/db/src/schema/account.ts`, migration `0000_third_ender_wiggin.sql` — confirmed applied). **Zero new columns, zero new indexes, zero Drizzle migration** for this phase (see grounding findings #1–#2 and the Deep-Dive above for how the missing `(user_id, newsletter_id)` unique constraint is worked around at the application layer instead).
- New Payload collection `newsletters` (11th collection in `payload.config.ts`) — requires one new Payload migration (not Drizzle).

**Routes**:
- New: `GET /api/newsletter/confirm?token=` (`apps/web/src/app/api/newsletter/confirm/route.ts`, `force-dynamic`).
- New page: `/newsletter/confirmed?status=success|expired|invalid` (`apps/web/src/app/(reader)/newsletter/confirmed/page.tsx`).
- Existing `/newsletters` page becomes server-fetched (was fully client + fixture-only before).

**Cookies/session**: none new. `setNewsletter`/`isSubscribed` reuse Phase 1's session cookie via `requireUser()`/`getSessionUser()` — no new cookie is introduced by this phase.

**Cache tags**: new tag `"newsletters:all"` (Payload `newsletters` collection reads), busted by the new `revalidateNewsletter`/`revalidateNewsletterDelete` hooks, following the exact existing `bust()` convention in `apps/web/src/payload/hooks/revalidate.ts`. Per-user reads (`isSubscribed`, `listNewsletterSubs`) are **never** wrapped in `unstable_cache` (global convention #1 from the umbrella).

---

## Out of Scope

- **Newsletter sending infrastructure** (Resend broadcast/campaign API, scheduling, segment-targeted sends, the BullMQ send pipeline described in `process/features/newsletters/_GUIDE.md`'s "Sending pipeline" section, Resend webhook → PostHog event ingestion, bounce suppression, RFC 8058 one-click-unsubscribe headers). This phase builds the **subscription** funnel only — matches brief-asia's own scope boundary (it never built sending either) and this phase's explicit brief.
- **`apps/web/src/components/footer.tsx`'s newsletter strip** — verified to have the identical demo-`alert()` bug as the homepage CTA, but not named in this phase's brief. Left untouched; flagged as a follow-up (see [Cross-Phase Follow-Up Notes](#cross-phase-follow-up-notes-not-this-phases-job)).
- **Any i18n for the confirmation email body** — AD-4 (English-only transactional emails at launch), matches Phase 1's `email.ts` convention exactly.
- **A new interactive header "SubscribeButton" component** — grounding finding #3; the header's existing plain link to `/newsletters` is treated as sufficient.
- **Per-newsletter unsubscribe links inside actual sent newsletter issues** — no issues are ever sent by this program (see first bullet); nothing to link from yet.
- **Deleting `apps/web/src/lib/data.ts`'s `NEWSLETTERS` fixture / `Newsletter` interface** — becomes dead code after this phase but is not removed (see touchpoint table note).
- **Updating `newsletter_subscriptions.email` when Phase 4's `changeEmail` succeeds** — the AD-8 #3 orphaning bug is fixed by this phase's `user_id`-first lookup (email drift does not break the toggle), but the row's own stale `email` column is not kept in sync by this phase. See [Cross-Phase Follow-Up Notes](#cross-phase-follow-up-notes-not-this-phases-job).
- **Paywall/meter changes** (Phase 3) and **read-later queue** (Phase 4) — unrelated surfaces.

---

## Blast Radius

- **First new Payload *collection* added mid-program** (Phases 1–4 touch zero new Payload collections/globals except Phase 3's one new Global). Validates the full collection-add path (config file → register in `payload.config.ts` → `payload:migrate:create` → commit → `payload:generate-types`) for the first time in this program's collection surface — any Payload-version surprise here is a real Phase 5 execution finding, not assumed away.
- **`apps/web/src/lib/account-actions.ts` and `apps/web/src/lib/session.ts`** are shared files, already extended by Phase 2 (bookmarks/history/follows) and possibly Phase 4 (read-later) by the time this phase executes — this phase's additions must not collide with or accidentally regress those exports. Regression checkpoint below re-verifies Phase 2's Saved/History/Following tabs and (if landed) Phase 4's Settings/read-later tabs still work.
- **`apps/web/src/lib/email.ts`** (Phase 1) gains a second real consumer (the first being Phase 1's own auth flows) — first proof that the fail-open wrapper generalizes beyond auth emails.
- **The account page tab list** gains no new tab in this phase (Newsletters already exists as a tab slot) but its *content* changes from fully mock to fully real — regression risk is narrower than Phase 4's tab-list-structural-change risk, but still touches a file Phase 2/4 also modify.
- **`data.ts`'s `NEWSLETTERS` fixture becoming partially orphaned** (still exported, some consumers migrated off it, some not until a future cleanup) is a minor, accepted, explicitly-flagged blast radius — not a functional risk, but worth noting so a future grep-based cleanup isn't surprised to find it "half migrated."
- **Zero risk to `packages/db`'s consumers outside this repo** (`dtw-engine`) — no schema change at all in this phase (AD-7 fully holds, re-confirmed by the Deep-Dive above).

---

## Validation Gates

### Automated

- `pnpm --filter web payload:generate-types` — regenerate `payload-types.ts` so the `Newsletter` type exists (must run before typecheck/build).
- `pnpm typecheck` (turbo, repo root) — must pass clean.
- `pnpm lint` — must pass clean.
- `pnpm build` — must succeed (validates the new route handler, the new server component split in `/newsletters`, and that `payload-server.ts`'s `"server-only"` guard isn't violated by any new client-component import).

### Manual

1. **CMS seed correctness**: run `pnpm --filter web db:seed`, then in `/admin` confirm exactly 6 `newsletters` docs exist with slugs `am`/`pm`/`ai`/`fund`/`dev`/`prod`, correct `vertical` pillar links, `active: true`, `order` 1–6. Re-run the seed script a second time and confirm it's idempotent (still exactly 6 rows, no duplicates — matches the existing `upsert` helper's proven behavior for pillars/tags).
2. **CMS-driven list, invariant #8 proof**: in `/admin`, set one newsletter's `active` to `false` → confirm it disappears from `/newsletters` and from the homepage CTA's implicit list within the cache's revalidate window (300s) or immediately after the `afterChange` hook fires (`revalidateTag("newsletters:all")`) — no deploy required.
3. **Guest double opt-in, full page**: on `/newsletters`, pick 2 newsletters (e.g. `am` + `ai`), submit a test email → **data verification**: confirm zero `newsletter_subscriptions` rows for that email yet, and exactly one `pending_newsletter_confirmations` row with `newsletter_ids = {am,ai}` and `expires_at` ≈ 24h from now → confirm a confirmation email is sent/logged (dev console fallback acceptable if `RESEND_API_KEY` unset) → click the confirm link → **data verification**: confirm exactly 2 `newsletter_subscriptions` rows now exist (`am` and `ai`), both `user_id IS NULL`, `unsubscribed_at IS NULL` → confirm the `pending_newsletter_confirmations` row is gone → confirm the browser lands on `/newsletter/confirmed?status=success` with a friendly message.
4. **Guest double opt-in, homepage CTA**: on the homepage `NewsletterCta`, submit a (different) test email → confirm a pending row with `newsletter_ids = {am}` only → confirm/click → confirm exactly 1 new `newsletter_subscriptions` row for `am`.
5. **Reuse semantics**: submit the same guest email twice (different newsletter picks each time) before confirming either → **data verification**: confirm exactly 1 `pending_newsletter_confirmations` row exists for that email, matching the *second* submission's `newsletter_ids` → visit the *first* email's confirm link (the one now stale) → confirm it resolves to `status=invalid`, not a crash.
6. **Expired token**: `UPDATE pending_newsletter_confirmations SET expires_at = now() - interval '1 hour' WHERE token = '<token>';` → visit the confirm link → confirm `status=expired`, confirm the pending row is deleted, confirm zero `newsletter_subscriptions` rows were created from it.
7. **Already-used / double-click token**: click a valid confirm link twice in a row → confirm the second visit does not throw an unhandled error (no 500) and resolves to `status=invalid`, with no duplicate `newsletter_subscriptions` rows.
8. **Signed-in toggle, AD-8 #3 keying proof**: as a signed-in reader (Phase 1 session), open Account → Newsletters, toggle "PM Brief" on → **data verification**: exactly 1 `newsletter_subscriptions` row, `user_id` set to the session's user id (not just `email`), `unsubscribed_at IS NULL` → toggle off → confirm `unsubscribed_at` is set and the row is **not deleted** → toggle on again → confirm `unsubscribed_at` reverts to `NULL` and still exactly 1 row (no duplicate).
9. **AD-8 #3 direct orphan-fix proof**: with the reader from step 8 still subscribed to "PM Brief", change the account email via Phase 4's `changeEmail` flow (if Phase 4 has landed; otherwise note as deferred verification in the report and re-run once Phase 4 ships) → confirm the Account → Newsletters tab still shows "PM Brief" as subscribed and toggleable afterward (lookup is by `user_id`, unaffected by the email change) → note in the report whether the row's own `email` column is now stale (expected: yes, tracked as the Phase 4 follow-up, not a failure of this gate).
10. **Guest-then-signup claim path**: as a guest, confirm a subscription to "Dev Digest" using email `X` (via steps 3–4's flow) → separately create/sign in to a reader account using that same email `X` → from the Account tab, toggle "Dev Digest" off then on → **data verification**: `SELECT count(*) FROM newsletter_subscriptions WHERE email = 'X' AND newsletter_id = 'dev';` returns exactly `1`, and that row's `user_id` is now the new account's id (claimed, not duplicated).
11. **Race handling**: rapidly double-click the "Subscribe" toggle for a never-before-subscribed newsletter as a signed-in reader (simulating the concurrent-insert race) → confirm no unhandled server error, and exactly 1 resulting row (not 2, not a crash) — proves the unique-violation catch-and-retry path in the Deep-Dive above actually works, not just that it was written.
12. **Header/homepage wiring confirmation**: confirm the header's "Subscribe" link (desktop + mobile) still correctly opens `/newsletters` (no regression, zero code change expected here) and confirm the homepage `NewsletterCta`'s `alert("...demo")` no longer fires anywhere in the flow.
13. **Copy accuracy**: confirm `/newsletters`'s kicker and `newsletter-cta.tsx`'s copy no longer say "8"/"Eight" newsletters or mention "Deep Dive"/"DTW Awards" as subscribable products (grounding finding #6).

### Regression

- Re-run Phase 1's magic-link / email+password / OAuth sign-in and sign-out manual checks — confirm unaffected by this phase's additional `email.ts` usage.
- Re-verify Phase 2's Saved/History/Following tabs (and Phase 4's Settings/read-later tabs, if landed) still render and function correctly after this phase's edits to the shared account page and `account-actions.ts`/`session.ts` files.

---

## Verification Evidence

The phase report must include, at minimum:

- Exact `SELECT` query + result output for each data-verification step above (steps 3, 5, 6, 8, 9, 10, 11 in particular).
- A copy of the confirmation email body (from the dev console fallback or a real Resend send) showing the `actionEmail()` template rendered with dtw branding, not brief-asia's.
- Screenshot or terminal output confirming `pnpm typecheck`, `pnpm lint`, `pnpm build` all pass clean after this phase's changes.
- Explicit confirmation (not just "I assume") that `pnpm --filter web payload:migrate:create` produced exactly one new migration file pair, committed, and that `pnpm --filter web payload:generate-types` was re-run.
- A one-paragraph note on whether Phase 4 had landed by the time step 9 (AD-8 #3 orphan-fix proof) ran — if not, this is an explicitly deferred verification, not a skipped one; the report must say when/how it will be re-run once Phase 4 ships.
- Explicit user confirmation (the plan owner's own words, not the agent's inference) that the phase works, per [Phase Completion Rules](#phase-completion-rules).

---

## Durable Report Target

`process/features/account/reports/phase-05-newsletters-double-optin_REPORT_<execution-date>.md`

---

## Blockers That Would Justify 🚧 BLOCKED

- Phase 1's `email.ts` lands with a materially different exported shape than assumed here (e.g. no reusable fail-open wrapper, or `actionEmail()` signature differs) — re-verify Phase 1's actual final shape before assuming this plan's `sendNewsletterConfirmationEmail` sketch fits cleanly.
- Phase 2's (and, if landed, Phase 4's) actual resulting shape of `apps/web/src/app/(reader)/account/[[...tab]]/page.tsx` is materially different from a simple server-component-with-tabs shape (e.g. tabs get split into fully separate route segments/files rather than one page) — re-research the actual structure before editing; do not force-fit this plan's Newsletters-tab description onto stale assumptions.
- Drizzle + `postgres-js`'s actual thrown-error shape for a unique-constraint violation does not expose a reliably-checkable `23505` code (or equivalent) — the race-handling catch in the Deep-Dive above depends on being able to distinguish "unique violation" from any other database error; if this can't be done reliably, escalate rather than silently swallowing all `INSERT` errors.
- Payload's `payload:migrate:create` CLI behaves in a way that doesn't cleanly produce the expected `{ts,json}` pair for a plain new-collection addition (e.g. requires interactive-only input incompatible with the execution environment) — flag and resolve, don't guess at a workaround that skips committing the migration.
- The header/homepage CTA components have been altered by some other change between this PLAN pass and Phase 5's actual execution turn in a way that materially conflicts with grounding findings #3–#5 above — re-verify with a fresh grep before editing, per standard re-research discipline.

---

## Cross-Phase Follow-Up Notes (Not This Phase's Job)

These are real, verified findings from this PLAN pass that belong to *other* phases or future work — recorded here so they aren't lost, but explicitly **not** actioned by this phase's own execution:

1. **`apps/web/src/components/footer.tsx`'s newsletter strip** has the identical demo-`alert()` bug as the homepage CTA (grounding finding #5) and would be a one-line reuse of this phase's `subscribeGuest("am", …)` call once this phase ships. Recommend a small follow-up (trivial fix, no plan needed) once this phase is `✅ VERIFIED`.
2. **Phase 4's `changeEmail` handler should also update `newsletter_subscriptions.email`** for any row where `user_id` matches the changing account, to keep the display-only `email` column from going stale after an email change (the orphaning *bug* itself is already fixed by this phase's `user_id`-first lookup — this is a cosmetic-data-accuracy follow-up, not a functional gap). Surface this to Phase 4's own kickoff research, do not silently add it here (out of this phase's file scope).
3. **`apps/web/src/lib/data.ts`'s `NEWSLETTERS` fixture and `Newsletter` interface** become dead code once every consumer listed in this phase's touchpoints is migrated — safe removal requires a full-repo grep to confirm zero remaining references (e.g. dashboards or other pages might still import it), which is out of this phase's verification budget. Recommend as a small `vc-code-simplifier` cleanup pass after this phase (and any other consumers) ship.

---

## Resume and Execution Handoff

**Execute anchor**: this file is the primary execute anchor for Phase 5 of the `reader-auth-account` program — EXECUTE must be handed this exact path, not the `active/` directory. **Supporting phase files**: the sibling `phase-01-auth-foundation_PLAN_03-07-26.md` through `phase-04-settings-read-later_PLAN_03-07-26.md` files (all now exist in `active/`, though none has been executed/verified as of this writing — re-confirm each phase's actual status in the umbrella's Phase Status Table before relying on it) plus the umbrella plan itself (`reader-auth-account_UMBRELLA-PLAN_03-07-26.md`) are supporting phase files for context, not substitutes for this plan when Phase 5 is the selected phase.

If this phase plan is resumed after a gap or context compaction:

1. Reread this plan in full, especially the [Grounding & Re-Verification](#grounding--re-verification-read-before-executing) section — every numbered finding there must be re-checked against the live repo before writing code, since Phases 1–4 will have landed changes in between (per `process/development-protocols/phase-programs.md`'s Re-Research Rule).
2. Confirm Phase 1 and Phase 2 are both `✅ VERIFIED` in the umbrella plan's Phase Status Table before starting — this phase cannot execute cleanly otherwise (see [Dependencies](#dependencies)).
3. Re-read the Phase 1 report (`process/features/account/reports/phase-01-auth-foundation_REPORT_*.md`) for `email.ts`'s and `session.ts`'s actual final export shapes, and the Phase 2 report for `account-actions.ts`'s and the account page's actual final shape — do not assume this plan's illustrative code sketches are exact.
4. Re-run the specific greps this PLAN pass used to ground findings #3–#6 (header.tsx Subscribe link, `home/newsletter-cta.tsx`, `footer.tsx` newsletter strip, `data.ts` `NEWSLETTERS` fixture, `/newsletters/page.tsx`) since any of these could have drifted independently of Phases 1–4.
5. Re-read `packages/db/src/schema/account.ts` in full to reconfirm the `newsletter_subscriptions`/`pending_newsletter_confirmations` shapes and the unique-index finding (#1) still hold — this is the single most load-bearing verified fact in this plan.
6. Validate this artifact before execution: `node .claude/skills/vc-generate-plan/scripts/validate-plan-artifact.mjs process/features/account/active/phase-05-newsletters-double-optin_PLAN_03-07-26.md`.
7. Do not begin EXECUTE without an explicit "ENTER EXECUTE MODE" approval scoped to this exact plan file, per the umbrella's Phase Completion Rules and `phase-programs.md`'s per-phase execution-approval checkpoint.

**Next step**: this plan is ready for review. Say "ENTER EXECUTE MODE" (after Phase 1 and Phase 2 are `✅ VERIFIED`) to begin implementation of this exact plan file — RIPER-5 requires this explicit approval; Cursor Plan mode users should import the [Implementation Checklist](#implementation-checklist) directly.
