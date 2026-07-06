# Phase 3 — Paywall Meter + Sign-In Nudge Compliance

**Date**: 03-07-26
**Complexity**: Complex — Phase 3 of 5 in the `account` feature's phase program (see umbrella plan). This file is the dedicated, execute-ready PLAN pass for Phase 3 only.
**Feature**: `account`
**Status**: ⏳ PLANNED
**Umbrella plan**: `process/features/account/active/reader-auth-account_UMBRELLA-PLAN_03-07-26.md`
**This phase's file**: `process/features/account/active/phase-03-paywall-nudge_PLAN_03-07-26.md`
**Depends on**: Phase 1 (`process/features/account/active/phase-01-auth-foundation_PLAN_03-07-26.md`) and Phase 2 (`process/features/account/active/phase-02-account-data-layer_PLAN_03-07-26.md`), both `✅ VERIFIED`, with reports in `process/features/account/reports/`.

> **As of this PLAN pass (03-07-26), Phase 1 and Phase 2 have NOT been implemented yet.** Verified by filesystem check: `apps/web/src/lib/session.ts`, `apps/web/src/lib/account-actions.ts`, and `apps/web/src/lib/auth.ts` do not exist; `better-auth` is not in `apps/web/package.json`. This Phase 3 plan is authored ahead of that work, at execute-ready depth, per the umbrella's phase-program structure (AD-3). **Do not enter EXECUTE MODE on this plan until Phase 1 and Phase 2 are independently `✅ VERIFIED`** with reports on disk — see [Resume and Execution Handoff](#resume-and-execution-handoff).

## Quick Links

- [Overview](#overview)
- [Grounding & Verification Method](#grounding--verification-method)
- [Dependencies](#dependencies)
- [Phase Completion Rules](#phase-completion-rules)
- [Acceptance Criteria](#acceptance-criteria)
- [Design Decisions Locked for This Phase](#design-decisions-locked-for-this-phase)
- [Implementation Checklist](#implementation-checklist)
- [Touchpoints](#touchpoints)
- [Out of Scope](#out-of-scope)
- [Public Contracts](#public-contracts)
- [Blast Radius](#blast-radius)
- [Verification Evidence](#verification-evidence)
- [Durable Report Target](#durable-report-target)
- [Blockers That Would Justify BLOCKED](#blockers-that-would-justify--blocked)
- [Execute Anchor and Supporting Files](#execute-anchor-and-supporting-files)
- [Resume and Execution Handoff](#resume-and-execution-handoff)
- [Next Step](#next-step)

---

## Overview

Close the verified violation of invariant #4 ("Paywall = soft block ... The '3' must be configurable in CMS, never hardcoded"). Today, three separate places hardcode the free-read limit:

1. `apps/web/src/components/header.tsx` line 49 — `const showNudge = articlesRead >= 3 && !user && !nudgeDismissed;`
2. `apps/web/src/components/article/article-content.tsx` line 27 — `const hitPaywall = articlesRead > 3 && !user && !article.sponsored;` (note the `>` vs `>=` inconsistency with #1 — today a guest sees the header nudge one article *before* the paywall card appears)
3. `apps/web/src/components/article/paywall.tsx` line 62 — the literal prose "You've read your **3** free articles this month." (a third hardcoded occurrence the umbrella's touchpoint table did not name explicitly, found during this PLAN pass's verification read of the file — see [Grounding](#grounding--verification-method))

This phase **redesigns, not ports**, the meter (brief-asia's `localStorage` + hardcoded `>3` + env-flag-gated meter is explicitly not usable as-is — see umbrella `synthesis.feature_map` "Paywall meter + sign-in nudge" entry). The redesign:

- A guest meter backed by a **cookie** (`dtw-read-count`), deduped by article id, resetting on the calendar month boundary (Asia/Singapore time) — replacing today's in-memory `ref-Set` in `ShellProvider` that silently resets on every page reload (the literal bug this phase closes).
- A signed-in meter backed by **`reading_history`** row count in the same calendar-month window (Phase 2's `recordView` upsert already dedupes by article id, so a plain `readAt >= periodStart` count is correct with zero extra schema).
- A single **CMS-configurable threshold**, read from a new Payload **Global** (`paywallSettings.paywallThreshold`, default `3`), fetched once in `(reader)/layout.tsx` (an RSC) and passed as a prop into `ShellProvider` — never fetched inside a per-request/cached path that would poison the ISR cache.
- One unified comparison operator (`>=`) applied in both `header.tsx` and `article-content.tsx`, closing the `>=`/`>` inconsistency.
- A rewritten `apps/web/src/components/article/paywall.tsx`: the `$12/mo` Pro card, the `Become a member` button (`href="/pro"`, a 404 today), and the three feature bullets are **removed**. What remains is a single sign-in-nudge card, matching Phase 1 scope (soft, informational, never a hard gate — body always renders in full above it).
- On sign-in, the guest cookie is cleared (a fresh signup/login is the nudge's success state — the DB-side meter for a brand-new account is naturally `0` since it has no `reading_history` rows yet, so no explicit "reset" write is needed there).

Authenticated readers are **not** gated by either UI surface in this phase — `!user` continues to fully exempt them, matching invariant #4's own framing ("Phase 1 has no payment, only a sign-in nudge") and the Foundation vs. Expansion boundary (Pro billing is out of scope for all 5 phases). The signed-in `reading_history`-window count is still implemented per this phase's explicit scope (forward-looking infra + fidelity to `process/features/articles/_GUIDE.md`'s "authenticated count from reading_history table" line), but it does not currently drive any gate — see [Design Decisions](#design-decisions-locked-for-this-phase) decision D6 for the full rationale.

---

## Grounding & Verification Method

Read before writing this plan, in order: `process/context/all-context.md` (root router), `process/context/planning/all-planning.md` (routes to the complex-PRD reference, consulted for depth calibration), `process/development-protocols/plan-lifecycle.md`, and the umbrella plan in full (both halves — lines 1–415 and 416–697). `process/context/tests/all-tests.md` is referenced via the umbrella's own grounding note: no automated test runner is installed in this repo yet (`vitest` absent from every `package.json`, zero `*.test.ts*` files) — this phase's Verification Evidence is therefore typecheck/lint/build + manual/DB verification, matching every other phase in this program.

This plan is grounded primarily in the durable reference doc `process/features/account/references/brief-asia-port-map_REFERENCE_03-07-26.md` (`synthesis.feature_map` "Paywall meter + sign-in nudge" entry, `synthesis.architecture_decisions` items 2–4, `research.dtwState`, `research.briefReading`), with the original scratchpad source `/tmp/claude-1000/-home-hieunc-Code-dtw-web/df9bb8b7-b07b-40a7-9091-a7506dd1880f/scratchpad/research-port-map.json` retained as a secondary/original-source note. Every file path and line cited below was independently re-verified against the real filesystem during this PLAN pass (not copied from the research JSON or the umbrella without a fresh read):

- Read `apps/web/src/components/header.tsx` (lines 1–90 + the nudge banner render block, lines 579–635) — confirmed `showNudge = articlesRead >= 3 && !user && !nudgeDismissed` at line 49, and confirmed the nudge banner's rendered copy (lines 601–622) contains **no** hardcoded number — only the comparison at line 49 needs fixing here.
- Read `apps/web/src/components/article/article-content.tsx` in full (259 lines) — confirmed `hitPaywall = articlesRead > 3 && !user && !article.sponsored` at line 27, confirmed the `<Paywall onLogin={openAuth} />` call site (line 186) takes no other props today.
- Read `apps/web/src/components/article/paywall.tsx` in full (115 lines) — confirmed the `$12/mo` card, the `href="/pro"` button, the three-bullet feature grid, and the literal "You've read your 3 free articles this month" prose (line 62) — **zero** `useT()`/i18n usage in this file today (a fourth compliance gap this phase closes, per Global Convention #3).
- Read `apps/web/src/lib/shell.tsx` in full (92 lines) — confirmed today's `articlesRead`/`incrementRead` is an in-memory `useState` + `useRef<Set<string>>`, reset on every mount (the literal "resets on reload" bug), and confirmed `ShellProvider` takes no props today (`{ children }` only).
- Read `apps/web/src/lib/payload-server.ts` in full (373 lines) and `apps/web/src/payload/hooks/revalidate.ts` in full (139 lines) — confirmed the exact `unstable_cache` + tag + `bust()` convention this phase's `getPaywallThreshold`/`revalidatePaywallSettings` must follow, and confirmed the fail-open try/catch pattern (`getPinnedLatest`, lines 311–340 of `payload-server.ts`) this phase's threshold read must mirror.
- Read `apps/web/payload.config.ts` in full (95 lines) — confirmed **no `globals` key exists yet** in `buildConfig({...})` (this phase adds the first one), confirmed `postgresAdapter({ push: false, migrationDir: ".../src/payload/migrations" })`.
- Read `apps/web/src/app/(reader)/layout.tsx` in full (36 lines) — confirmed it awaits only `getNavPillars()` today and wraps `Header`/`Footer`/`AuthModal`/`SearchOverlay`/`CookieBanner` inside `ShellProvider`; confirmed the providers are scoped here (not root layout), so `/admin` never mounts them.
- Read `packages/db/src/schema/account.ts` in full — confirmed `readingHistory` (`reading_history` table) has a **unique composite index** `reading_history_pk` on `(userId, articleId)`, meaning Phase 2's upsert-on-conflict `recordView` produces **one row per (user, article)** with `readAt` updated to the latest visit — confirmed this makes `SELECT count(*) WHERE userId = ? AND readAt >= periodStart` already correctly deduped by article id with zero new schema (see Design Decision D2).
- Read `packages/db/package.json` — confirmed the exact subpath exports (`@dtw/db` → `src/index.ts`, `@dtw/db/schema` → `src/schema/index.ts`, `@dtw/db/client` → `src/client.ts`) and confirmed `readingHistory` is re-exported from the schema barrel (`packages/db/src/schema/index.ts` → `export * from "./account"`).
- Read `apps/web/src/payload/collections/SponsorSlots.ts` and `apps/web/src/payload/collections/Users.ts` in full — confirmed the exact `access: { read: () => true, update/create/delete: ({req}) => req.user?.role === "..." }` closure shape this phase's Global config must match, and confirmed Payload editorial roles are the 3-value lowercase set `"author" | "editor" | "admin"` (not `"reader"` — that value only exists on the disjoint Better-Auth side).
- Read `apps/web/src/app/(reader)/[pillar]/load-more-action.ts` and `apps/web/src/app/(reader)/search/search-action.ts` in full — confirmed the repo's `"use server"` action file convention (directive-only, no `import "server-only"` alongside it) that this phase's new server action must match.
- **Verified the Payload Global hook signature directly against the installed package's type declarations**, not assumed from the umbrella's flagged risk: `node_modules/payload/dist/globals/config/types.d.ts` (`AfterChangeHook` for globals: `{context, data, doc, global, overrideAccess, previousDoc, req}`) vs. `node_modules/payload/dist/collections/config/types.d.ts` (`AfterChangeHook` for collections: `{collection, context, data, doc, operation, overrideAccess, previousDoc, req}`). Both expose `context` as a request-scoped sibling of `req` (not nested), and `req: PayloadRequest` is the same type in both — meaning the existing `revalidate.ts` destructuring convention `req: { payload, context }` (which relies on `PayloadRequest` carrying `.payload`/`.context` — confirmed via `PayloadRequest extends CustomPayloadRequestProperties, ...`) works **identically** for a `GlobalAfterChangeHook`. **This downgrades the umbrella's flagged Global-hook-signature risk from "verify at kickoff, possible blocker" to "confirmed non-issue at the type level"** — the only remaining unknown is runtime behavior once actually exercised through `/admin`, which Verification Evidence covers.
- Read `apps/web/src/payload/migrations/index.ts` and `apps/web/src/payload/migrations/20260622_000000_pin_to_latest.ts` (the most recent migration) — confirmed the `payload migrate:create` CLI generates a `<timestamp>_<description>.{ts,json}` pair **and** appends an entry to `migrations/index.ts` automatically; confirmed the `up`/`down` shape (`{db}: MigrateUpArgs` → `db.execute(sql\`...\`)`).
- Read `apps/web/src/payload/migrations/20260528_174955_initial.ts` for existing camelCase-slug → snake_case-table-name evidence: confirmed collection slug `"wireDrops"` → table `wire_drops`, `"sponsorSlots"` → `sponsor_slots`; combined with the `"pinnedToLatest"` → `pinned_to_latest` column-naming evidence in the pin-to-latest migration, this phase's Global slug `"paywallSettings"` is expected to generate table `paywall_settings` and its field `paywallThreshold` is expected to generate column `paywall_threshold` — **treat as expected, confirm against the actual CLI-generated migration file at execute time** rather than hand-writing the SQL.
- Read `apps/web/src/lib/i18n.tsx` (relevant excerpt) — confirmed `PUBLICATION_TZ = "Asia/Singapore"` (line 128, unexported) is the existing convention for pinning dates to the publication's home timezone; this phase's period-key logic deliberately duplicates the literal `"Asia/Singapore"` string (see Design Decision D1) rather than importing the unexported constant, to avoid widening `i18n.tsx`'s export surface for a one-line reuse.
- Read `apps/web/src/lib/data.ts` (grep) — confirmed the `Pro` nav item is commented out (line 65: `// { id: "pro", label: "Pro", slug: "/pro", badge: true },`) and confirmed no `/pro` route exists anywhere under `apps/web/src/app` — this phase must **not** resurrect either.
- Read `apps/web/src/components/cookie-banner.tsx` — confirmed it is a `localStorage`-only "cookie consent" UI (no real cookie read/write), so there is no existing cookie-consent gate this phase's guest meter needs to respect or register with.
- Read `packages/ui/src/button.tsx` in full — confirmed available `variant`s (`primary` | `accent` | `outline` | `ghost`) and the `href`-vs-`onClick` API this phase's rewritten `paywall.tsx` CTA uses.
- Read `process/features/articles/_GUIDE.md` (relevant excerpt, lines 36–48, 60–72) — confirmed the exact stale text this phase's durable-capture step must correct (line 40: `"Threshold: read from PostHog feature flag paywall_meter_threshold"` — superseded by AD-2's Payload Global decision) and confirmed the doc's own "Key Source Files (to come)" list already anticipated `apps/web/src/lib/paywall.ts` (line 71) — this phase's new `lib/paywall.ts` file (see Touchpoints) fulfills that anticipated path.
- Read `apps/web/package.json` and root `package.json`/`turbo.json` — confirmed exact validation commands (`pnpm typecheck`, `pnpm lint`, `pnpm build` at repo root via Turborepo; `pnpm --filter web payload:migrate:create` for the new migration).

---

## Dependencies

- **Phase 1 — Auth Foundation** (`process/features/account/active/phase-01-auth-foundation_PLAN_03-07-26.md`) must be `✅ VERIFIED`. This phase needs, at minimum: a real `user` in `ShellProvider` (not the current fake `demoLogin()`), and `apps/web/src/lib/session.ts` with `getSessionUser()`/`requireUser()`.
- **Phase 2 — Account Data Layer** (`process/features/account/active/phase-02-account-data-layer_PLAN_03-07-26.md`) must be `✅ VERIFIED`. This phase needs `recordView(articleId)` genuinely upserting `reading_history` rows on article mount for signed-in readers (Phase 2's own scope) — Phase 3's signed-in meter reads that table and is meaningless without Phase 2's writes actually landing.
- No new external dependency, no new env var, no new npm package (this phase deliberately avoids adding `js-cookie` — see Design Decision D3).
- Downstream: none of Phase 4 or Phase 5 depend on Phase 3 (per the umbrella's dependency shape `1 → 2 → {3, 4}`, `1 → 5`) — Phase 3 can be sequenced before or after Phase 4 once Phase 2 is verified, but only one phase should be "in flight" at a time per `phase-programs.md`.

---

## Phase Completion Rules

Restated from the umbrella (`process/development-protocols/phase-programs.md`-derived), applied to this phase specifically. This phase is **not** complete until:

1. **Integration Test** — the threshold flows end-to-end from a `/admin` edit through `revalidateTag` to the reader-facing nudge/paywall trip point, for both a guest and a signed-in reader.
2. **Manual Test** — a human (or scripted equivalent) actually performs each flow in [Verification Evidence](#verification-evidence), not just reads the code.
3. **Data Verification** — the new Global's backing table is queried directly (`SELECT * FROM paywall_settings;`), not inferred from `/admin`'s UI alone.
4. **Error Handling** — the fail-open path (Global not yet migrated on a preview build) is exercised, not just written.
5. **User Confirmation** — the plan owner (user) explicitly confirms the phase works. Status only becomes `✅ VERIFIED` after this; `🔨 CODE DONE` covers "typecheck/lint/build pass" alone.

---

## Acceptance Criteria

- [ ] A guest who reads `paywallThreshold` distinct articles sees the header nudge banner AND, on that same article's page, the paywall card below the (fully rendered) body — both triggered at the **exact same** read count.
- [ ] Reloading the page after tripping the guest meter does **not** reset it to 0 (the core bug this phase fixes — today's `ref-Set` is in-memory only).
- [ ] Re-reading the same article as a guest does not increment the meter past 1 for that article.
- [ ] Changing `paywallThreshold` in `/admin` (e.g. `3` → `2`) changes the trip point on the reader site without a deploy, within the cache's revalidate window or immediately via `revalidateTag`.
- [ ] No file in `apps/web/src` contains a hardcoded paywall-threshold literal `3` (or any other number) used as a comparison or displayed in prose — grep confirms this (see Verification Evidence).
- [ ] `apps/web/src/components/article/paywall.tsx` no longer renders a `$12/mo` card, a `Become a member` button, an `href="/pro"` link, or the three-bullet feature grid.
- [ ] All new/changed user-facing strings in `paywall.tsx` render correctly in `en`, `vi`, and `id` via the existing `useT()` triple pattern.
- [ ] Signing in clears the guest `dtw-read-count` cookie.
- [ ] Signed-in readers are never shown the nudge banner or the paywall card in this phase (still gated by `!user`, unchanged from today).
- [ ] `getReadCountThisPeriod(userId)` returns a correct, DB-verified count of distinct articles read by that user in the current Asia/Singapore calendar month.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm build` all pass clean at the repo root.
- [ ] Phase 1's login/logout and Phase 2's save/history flows still work after this phase's edits to the shared files (`header.tsx`, `article-content.tsx`, `shell.tsx`, `(reader)/layout.tsx`) — regression checkpoint.

---

## Design Decisions Locked for This Phase

The umbrella explicitly left several mechanics "not locked" for Phase 3's own kickoff PLAN pass to resolve (see umbrella Phase 3 section, "Resume Handoff Notes": *"The cookie-mechanics decision flagged as 'not locked' above must be resolved as part of Phase 3's own PLAN pass"*). This section is that resolution. These are locked decisions for this phase — do not relitigate silently during EXECUTE; if execution reveals one is wrong, stop and return to PLAN.

**D1 — Reset period: calendar month, Asia/Singapore time (not rolling 30 days, not visitor-local time).**
Matches the paywall copy's own wording ("resets monthly") and the publication's existing `PUBLICATION_TZ = "Asia/Singapore"` convention in `lib/i18n.tsx`. Singapore Standard Time is a fixed `UTC+8` offset with no DST, so both the guest cookie's period key and the signed-in DB query's window boundary can use a literal `+08:00` offset — no timezone library needed. A guest in Jakarta, Hanoi, and Singapore all reset at the same real-world instant, matching how an editor configuring the threshold in `/admin` would reason about "this month."

**D2 — Signed-in meter = `reading_history` row count where `readAt >= startOfCurrentPeriodSGT()`, zero new schema.**
`reading_history` has a unique composite index on `(userId, articleId)` (`reading_history_pk`); Phase 2's `recordView` upserts on that key, so there is exactly one row per (user, article) with `readAt` reflecting the *latest* visit. A plain `count(*) WHERE userId = ? AND readAt >= periodStart` is therefore already deduped by article id and already period-scoped — no new table, no new column, no separate "meter" concept needed for authenticated readers.

**D3 — Guest meter cookie: hand-rolled `document.cookie`, no `js-cookie` dependency.**
`js-cookie` is not installed anywhere in this repo (confirmed via grep). Brief-asia's own `language-switcher.tsx` uses it, but only for a simple non-sensitive string cookie — the same can be done here with ~10 lines of plain `document.cookie` read/write, avoiding a new dependency for something this small. Cookie is **not** `httpOnly` (must be JS-readable/writable from `ShellProvider`, a client component) and is **not security-sensitive** (a guest inflating their own read count client-side gains nothing — the "attack" just makes the nudge appear sooner, which is harmless).

Cookie value shape: `encodeURIComponent(JSON.stringify({ period: "YYYY-MM", ids: string[] }))`. `ids` is capped at 20 entries (`MAX_TRACKED_IDS`) — bounded cookie size; once `articlesRead >= paywallThreshold` the nudge/paywall has already tripped, so further reads beyond the cap don't need exact tracking. Cookie `max-age` is a generous 90 days (`SameSite=Lax`, `path=/`, no `Secure` flag so it still works over `http://localhost` in dev) — the *effective* reset is driven by comparing the stored `period` key against `currentPeriodKeySGT()` on every read, not by cookie expiry.

**D4 — Comparison operator: `>=` in both `header.tsx` and `article-content.tsx` (not `>`).**
This matches today's header.tsx semantics (already `>=`) and — verified during this PLAN pass by re-tracing the actual render order in `article-content.tsx` — produces the *correct* UX for the paywall card's own copy ("You've read your N free articles this month"): `incrementRead` fires inside a `useEffect` (post-mount), so on the Nth article's **initial** render `articlesRead` is still `N-1` (the full body renders normally); only after the effect commits does `articlesRead` become `N` and the paywall card appear below the now-fully-rendered body. By the time a guest actually sees the card, they genuinely have finished reading N articles — the copy is accurate. Using `>` would require an `N+1`th read to trip, which is one more free read than "N free articles this month" promises.

**D5 — Anonymous → logged-in "merge": clear the guest cookie; no server action, no bookmark merge.**
The umbrella's Phase 3 touchpoint table described this as "a one-shot server action" — verified during this PLAN pass that no server round-trip is actually needed: (a) a brand-new signup has zero `reading_history` rows by construction, so the DB-side meter is naturally `0` with no explicit reset write; (b) clearing a non-httpOnly cookie is a pure client operation (`document.cookie = "...; max-age=0"`), needing no server action. **This phase does not implement an anonymous-bookmarks-merge action** — the umbrella's own Phase 3 scope table already narrows this ("Full anonymous-saves ↔ server bookmark merge (IndexedDB) is explicitly out of scope here — no anonymous bookmark storage exists yet in this program, since Phase 2 only wires *signed-in* bookmarks"). There is no guest-side bookmark data to merge from in this 5-phase program; treat any request to build one during EXECUTE as a scope-change requiring a stop-and-confirm, not a silent addition.

**D6 — Signed-in `reading_history`-window count is computed but does not gate anything in this phase.**
Both `showNudge` (`header.tsx`) and `hitPaywall` (`article-content.tsx`) keep their existing `!user` condition unchanged — a signed-in reader is fully exempt regardless of how many articles they've read, matching invariant #4's "Phase 1 has no payment, only a sign-in nudge" framing and the umbrella's Foundation/Expansion boundary (Pro billing, and any Pro-tier gating on top of sign-in, is out of scope for all 5 phases). This phase still implements `getReadCountThisPeriod()` and wires it into `ShellProvider`'s `articlesRead` for signed-in users (per this phase's explicit task scope and `process/features/articles/_GUIDE.md`'s "authenticated count from reading_history table" line) so that (a) the value is accurate and available for a future Pro-gating condition to consume without redesigning the meter, and (b) `articlesRead` stays a single, auth-state-aware value rather than two disconnected concepts. **This is forward-looking infrastructure, not a live gate in Phase 3** — document this explicitly in the phase report so a future reader doesn't assume signed-in gating exists today.

**D7 — Global slug `paywallSettings`, field `paywallThreshold`, no versions/drafts.**
Matches the existing camelCase-slug convention (`wireDrops`, `sponsorSlots`, `engineConflictLog`) — expected to generate table `paywall_settings` / column `paywall_threshold` (confirm against the actual CLI-generated migration, don't assume). `versions` is omitted (defaults to no draft/publish workflow) — this is an operational number, not editorial content; a save takes effect immediately (subject to the cache's `revalidateTag` bust). `defaultValue: 3` on the field, combined with `getPaywallThreshold()`'s own fail-open fallback of `3`, means the threshold is `3` everywhere by construction with no separate seed-script step required — adding one is explicitly out of scope for this phase.

---

## Implementation Checklist

Atomic, ordered. Each item is independently verifiable; commands/paths are exact.

1. Create `apps/web/src/payload/globals/PaywallSettings.ts` — new Payload `GlobalConfig` (see [Touchpoints](#touchpoints) for exact field/access/hook contents).
2. Extend `apps/web/src/payload/hooks/revalidate.ts` — add `revalidatePaywallSettings: GlobalAfterChangeHook`, tag `"settings:paywall"`, using the existing `bust()` helper; add the `GlobalAfterChangeHook` type to the existing `payload` import.
3. Modify `apps/web/payload.config.ts` — import `PaywallSettings`; add `globals: [PaywallSettings]` (new config key).
4. Run `pnpm --filter web payload:migrate:create` (interactively, or with a name argument such as `add_paywall_settings_global`) against a local dev database with `DATABASE_URL` set — commit the generated `<timestamp>_<description>.ts` + `.json` pair under `apps/web/src/payload/migrations/` **and** the CLI-updated `apps/web/src/payload/migrations/index.ts`. Open the generated `.ts` file and confirm the actual table/column names (`paywall_settings` / `paywall_threshold` expected — see D7) before proceeding.
5. Create `apps/web/src/lib/paywall.ts` — client-safe guest-meter + Asia/Singapore period-key helpers (see [Touchpoints](#touchpoints) for the exact contents to write).
6. Extend `apps/web/src/lib/payload-server.ts` — add `getPaywallThreshold()` (`unstable_cache`, tag `"settings:paywall"`, revalidate 300, fail-open to `3`); update the cache-tag-conventions comment block near the top of the file to list `settings:paywall`.
7. Extend `apps/web/src/lib/session.ts` (Phase 1/2 file — re-read its actual current contents first, per [Resume and Execution Handoff](#resume-and-execution-handoff)) — add `getReadCountThisPeriod(userId: string): Promise<number>`, importing `startOfCurrentPeriodSGT` from the new `lib/paywall.ts`.
8. Create `apps/web/src/lib/paywall-actions.ts` — `"use server"` file exporting `getMyReadCount(): Promise<number>`, calling `requireUser()` + `getReadCountThisPeriod()`, failing closed to `0` internally (never throws to the caller).
9. Modify `apps/web/src/app/(reader)/layout.tsx` — change the single `await getNavPillars()` to `const [pillars, paywallThreshold] = await Promise.all([getNavPillars(), getPaywallThreshold()]);` and pass `paywallThreshold` into `<ShellProvider paywallThreshold={paywallThreshold}>`.
10. Modify `apps/web/src/lib/shell.tsx` — re-read its actual current (post-Phase-1/2) contents first. Add `paywallThreshold: number` to both the `ShellProviderProps` and `ShellContextValue` shapes; replace the in-memory guest meter with the design in [Touchpoints](#touchpoints) (guest: cookie via `lib/paywall.ts`; signed-in: seeded from `getMyReadCount()` once per identity change, then locally incremented per D6); add the sign-in cookie-clear effect (D5).
11. Modify `apps/web/src/components/header.tsx` — change line 49's `articlesRead >= 3` to `articlesRead >= paywallThreshold`, destructuring `paywallThreshold` from `useShell()`.
12. Modify `apps/web/src/components/article/article-content.tsx` — change line 27's `articlesRead > 3` to `articlesRead >= paywallThreshold`, destructuring `paywallThreshold` from `useShell()`, and pass `threshold={paywallThreshold}` into the `<Paywall onLogin={openAuth} .../>` call site (line 186).
13. Rewrite `apps/web/src/components/article/paywall.tsx` — remove the Pro card/button/feature-grid; add `threshold: number` to `PaywallProps`; add full `useT()` i18n coverage (see [Touchpoints](#touchpoints) for exact copy).
14. Run `pnpm typecheck && pnpm lint && pnpm build` at the repo root; fix any errors before proceeding.
15. Run the full manual verification flow in [Verification Evidence](#verification-evidence), including the DB queries.
16. Write the phase report to `process/features/account/reports/phase-03-paywall-nudge_REPORT_<execution-date>.md` per [Durable Report Target](#durable-report-target).
17. Update `process/features/articles/_GUIDE.md` (lines ~36–48) to correct the stale "PostHog feature flag `paywall_meter_threshold`" text to describe the Payload Global actually shipped (part of this phase's durable-capture step, per the umbrella's Context Doc Reconciliation table).

---

## Touchpoints

### `apps/web/src/payload/globals/PaywallSettings.ts` (new)

```ts
import type { GlobalConfig } from "payload";
import { revalidatePaywallSettings } from "../hooks/revalidate";

/**
 * Paywall settings — currently just the guest/soft-nudge read threshold
 * (invariant #4: never hardcode the "3"). Editor/Admin can change this in
 * /admin without a deploy; the reader app re-reads it via
 * lib/payload-server.ts::getPaywallThreshold(), cache-busted by the
 * afterChange hook below.
 *
 * No versions/drafts — this is an operational setting, not editorial
 * content; a save takes effect immediately (subject to the cache window /
 * revalidateTag).
 */
export const PaywallSettings: GlobalConfig = {
  slug: "paywallSettings",
  admin: {
    description:
      "Controls the guest sign-in nudge / soft paywall trigger. Changes apply within ~5 minutes, or immediately after a save via cache revalidation.",
  },
  hooks: {
    afterChange: [revalidatePaywallSettings],
  },
  fields: [
    {
      name: "paywallThreshold",
      type: "number",
      required: true,
      defaultValue: 3,
      min: 1,
      admin: {
        description:
          "Number of distinct articles a guest can read before the sign-in nudge / paywall card appears. Signed-in readers are never gated by this in Phase 1.",
      },
    },
  ],
  access: {
    read: () => true,
    update: ({ req }) => req.user?.role === "editor" || req.user?.role === "admin",
  },
};
```

### `apps/web/src/payload/hooks/revalidate.ts` (extend)

Add `GlobalAfterChangeHook` to the existing `import type {...} from "payload"` block, and add a new exported hook following the file's existing section-comment + `bust()` convention:

```ts
// ──────────────────────────────────────────────────────────────────────────────
// Paywall settings (Global) — single operational number, no delete/versions.
// ──────────────────────────────────────────────────────────────────────────────

export const revalidatePaywallSettings: GlobalAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (revalidationDisabled(context)) return doc;
  bust(payload, ["settings:paywall"], "paywall settings updated");
  return doc;
};
```

### `apps/web/payload.config.ts` (modify)

Add the import alongside the existing collection imports:
```ts
import { PaywallSettings } from "./src/payload/globals/PaywallSettings";
```
Add a new `globals` array to `buildConfig({...})` (this key does not exist yet — confirmed during grounding):
```ts
  globals: [PaywallSettings],
```

### Payload migration (new, CLI-generated + committed)

Run `pnpm --filter web payload:migrate:create` (a `DATABASE_URL` pointing at a real Postgres instance is required — use the local dev DB). Commit the resulting `apps/web/src/payload/migrations/<timestamp>_<description>.ts` + matching `.json`, plus the CLI-updated `apps/web/src/payload/migrations/index.ts`. Expected shape (confirm against the actual generated file, per D7): `CREATE TABLE "paywall_settings" ("id" ...serial pk..., "paywall_threshold" integer NOT NULL, ...timestamps...);` with a corresponding `DROP TABLE` in `down()`.

### `apps/web/src/lib/payload-server.ts` (extend)

Add to the cache-tag-conventions comment block near the top of the file (after `wire-drops`):
```
//   settings:paywall      → CMS-configurable paywall/nudge threshold
```
Add near `getCorrections` at the bottom of the file, before the final `export type {...}`:
```ts
/**
 * CMS-configurable guest/soft-paywall read threshold (invariant #4 — never
 * hardcode "3"). Falls back to 3 (today's hardcoded value) if the Global's
 * migration hasn't run yet on this deploy (preview builds — see
 * getPinnedLatest above for the same pattern).
 */
export const getPaywallThreshold = unstable_cache(
  async (): Promise<number> => {
    const p = await payload();
    try {
      const g = await p.findGlobal({ slug: "paywallSettings" });
      return typeof g?.paywallThreshold === "number" ? g.paywallThreshold : 3;
    } catch (err) {
      console.warn(
        "[getPaywallThreshold] query failed — global not migrated yet?",
        (err as Error)?.message
      );
      return 3;
    }
  },
  ["settings:paywall"],
  { tags: ["settings:paywall"], revalidate: 300 }
);
```

### `apps/web/src/lib/paywall.ts` (new, client-safe — no `"server-only"`/`"use server"` directive)

```ts
/**
 * Client-safe paywall meter helpers — guest cookie mechanics + the shared
 * calendar-month period key used by both the guest cookie (here) and the
 * signed-in DB count (lib/session.ts::getReadCountThisPeriod). This module
 * runs in the browser (imported by lib/shell.tsx, a client component) and
 * must stay side-effect-free at import time — no "server-only", no
 * "use server".
 *
 * "Calendar month" resets on the 1st of the month, Asia/Singapore time
 * (mirrors PUBLICATION_TZ in lib/i18n.tsx) — not the visitor's local
 * timezone, so every guest resets at the same real-world instant. Singapore
 * has a fixed UTC+8 offset (no DST), so a literal "+08:00" suffix is
 * sufficient — no timezone library needed.
 */

const PAYWALL_TZ = "Asia/Singapore"; // mirrors PUBLICATION_TZ in lib/i18n.tsx

export const GUEST_METER_COOKIE = "dtw-read-count";

/** Hard cap on tracked ids per period — bounds cookie size. Well above any
 *  realistic threshold value; once articlesRead >= threshold the nudge/
 *  paywall has already tripped, so further reads don't need exact tracking. */
const MAX_TRACKED_IDS = 20;

/** Cookie lives 90 days; the *effective* reset is period-key comparison
 *  inside the value, not cookie expiry — this just needs to outlive one
 *  full period comfortably. */
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

interface GuestMeterState {
  period: string; // "YYYY-MM", Asia/Singapore
  ids: string[]; // distinct article ids read this period
}

export function currentPeriodKeySGT(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PAYWALL_TZ,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = parts.find((p) => p.type === "year")?.value ?? "0000";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  return `${year}-${month}`;
}

/** UTC instant for the start of the current Asia/Singapore calendar month. */
export function startOfCurrentPeriodSGT(now: Date = new Date()): Date {
  return new Date(`${currentPeriodKeySGT(now)}-01T00:00:00+08:00`);
}

function emptyState(): GuestMeterState {
  return { period: currentPeriodKeySGT(), ids: [] };
}

function parseCookie(): GuestMeterState {
  if (typeof document === "undefined") return emptyState();
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${GUEST_METER_COOKIE}=`));
  if (!match) return emptyState();
  try {
    const raw = decodeURIComponent(match.slice(GUEST_METER_COOKIE.length + 1));
    const parsed = JSON.parse(raw) as Partial<GuestMeterState>;
    if (parsed.period !== currentPeriodKeySGT() || !Array.isArray(parsed.ids)) {
      return emptyState(); // stale period (new month) or malformed -> fresh start
    }
    return { period: parsed.period, ids: parsed.ids.filter((id) => typeof id === "string") };
  } catch {
    return emptyState();
  }
}

function writeCookie(state: GuestMeterState): void {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify(state));
  document.cookie = `${GUEST_METER_COOKIE}=${value}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

/** Current guest meter state (read-only). */
export function readGuestMeter(): GuestMeterState {
  return parseCookie();
}

/**
 * Record a guest read of `articleId` (idempotent for repeat reads of the
 * same article within the same period). Returns the new distinct-article
 * count.
 */
export function recordGuestRead(articleId: string): number {
  const state = parseCookie();
  if (!state.ids.includes(articleId)) {
    state.ids = [...state.ids, articleId].slice(-MAX_TRACKED_IDS);
    writeCookie(state);
  }
  return state.ids.length;
}

/** Clear the guest meter — called once a session is established. Sign-in is
 *  the nudge's success state; the DB-backed meter starts naturally at 0 for
 *  a brand-new account since reading_history has no rows yet (see D5). */
export function clearGuestMeter(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${GUEST_METER_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
```

### `apps/web/src/lib/session.ts` (extend — Phase 1/2 file; re-read its actual contents first)

Add, importing `startOfCurrentPeriodSGT` from the new `lib/paywall.ts` and drizzle's `and`/`count`/`eq`/`gte` operators:

```ts
import { db } from "@dtw/db/client";
import { readingHistory } from "@dtw/db/schema";
import { and, count, eq, gte } from "drizzle-orm";
import { startOfCurrentPeriodSGT } from "@/lib/paywall";

/**
 * Distinct articles a signed-in reader has read in the current calendar
 * month (Asia/Singapore) — the authenticated-side mirror of the guest
 * cookie meter in lib/paywall.ts. reading_history is upserted per
 * (userId, articleId) by Phase 2's recordView(), so a straight
 * `readAt >= periodStart` count is already deduped by article id (re-reading
 * an old article bumps its readAt into the new period exactly once — it does
 * not create a second row). See Design Decision D2.
 */
export async function getReadCountThisPeriod(userId: string): Promise<number> {
  const since = startOfCurrentPeriodSGT();
  const rows = await db
    .select({ value: count() })
    .from(readingHistory)
    .where(and(eq(readingHistory.userId, userId), gte(readingHistory.readAt, since)));
  return rows[0]?.value ?? 0;
}
```

If Phase 1's `session.ts` already imports `db`/drizzle operators for other reads (likely, given Phase 2's `listBookmarks`/`listHistory`), reuse those imports rather than duplicating them.

### `apps/web/src/lib/paywall-actions.ts` (new, `"use server"`)

```ts
"use server";

import { requireUser } from "@/lib/session";
import { getReadCountThisPeriod } from "@/lib/session";

/**
 * Server action ShellProvider calls once when a signed-in session is
 * established (not polled) to seed the meter's real, DB-backed count for
 * this reader. Fails closed to 0 rather than throwing to the client — this
 * meter is a soft UX signal, never a hard gate (paywall never blocks
 * mid-article).
 */
export async function getMyReadCount(): Promise<number> {
  try {
    const user = await requireUser();
    return await getReadCountThisPeriod(user.id);
  } catch {
    return 0;
  }
}
```

(Matches the repo's existing `"use server"`-directive-only convention — see `load-more-action.ts`/`search-action.ts`; no `import "server-only"` alongside it.)

### `apps/web/src/app/(reader)/layout.tsx` (modify)

Change:
```ts
const pillars = await getNavPillars();
```
to:
```ts
const [pillars, paywallThreshold] = await Promise.all([
  getNavPillars(),
  getPaywallThreshold(),
]);
```
and add the import `getPaywallThreshold` to the existing `import { getNavPillars } from "@/lib/payload-server";` line. Pass the new prop:
```tsx
<ShellProvider paywallThreshold={paywallThreshold}>
```
This layout must **not** gain any `cookies()`/session read (per Global Convention #8 / this phase's own architecture) — `getPaywallThreshold()` is `unstable_cache`'d and non-personalized, so this stays safe.

### `apps/web/src/lib/shell.tsx` (modify — re-read actual current contents first; illustrative sketch below)

By Phase 3's execution time, Phase 1 will have already replaced the fake `user`/`setUser` with a `useSession()` + `toShellUser` bridge, and Phase 2 will not have touched this file. **Re-verify the actual post-Phase-1 shape before applying these changes** — the exact variable names may differ from this sketch (which is based on today's pre-Phase-1 stub plus the umbrella's Phase 1 description). Implement this *behavior*, not a blind diff:

- Add `paywallThreshold: number` to both the provider's props type and `ShellContextValue` (exposed read-only, sourced from the prop — no local state needed since it's re-fetched fresh on every full navigation via the layout).
- Replace the in-memory `articlesRead`/`incrementRead` implementation with:

```ts
import { clearGuestMeter, readGuestMeter, recordGuestRead } from "@/lib/paywall";
import { getMyReadCount } from "@/lib/paywall-actions";
// ...
const [articlesRead, setArticlesRead] = useState(0);
const sessionReadIds = useRef<Set<string>>(new Set()); // in-session dedupe for signed-in optimistic increments only

// Seed the meter whenever the auth identity changes (mount, sign-in, sign-out).
useEffect(() => {
  if (user) {
    clearGuestMeter(); // D5 — sign-in is the nudge's success state
    sessionReadIds.current = new Set();
    getMyReadCount()
      .then(setArticlesRead)
      .catch(() => {
        // Fail open: this meter is a soft UX signal, never a hard gate.
      });
  } else {
    setArticlesRead(readGuestMeter().ids.length);
  }
}, [user]);

const incrementRead = useCallback(
  (id: string) => {
    if (user) {
      // DB (reading_history, upserted by Phase 2's recordView) is the
      // source of truth and is re-synced on every identity change above.
      // Bump the in-memory counter immediately so THIS session's own new
      // read is reflected without waiting for a refetch; dedupe against
      // reads already counted this session only. A repeat read of an
      // article from earlier this month (before this session) may
      // under-count until the next full page load re-syncs from the DB —
      // acceptable for a soft, non-gating UI signal (see D6).
      if (sessionReadIds.current.has(id)) return;
      sessionReadIds.current.add(id);
      setArticlesRead((n) => n + 1);
      return;
    }
    setArticlesRead(recordGuestRead(id));
  },
  [user]
);
```

- Keep `incrementRead`'s call sites in `article-content.tsx` **unchanged** — same signature, same call site, only the internals change.
- If Phase 1 removed `setUser` from the exposed context (per its own plan's note that it may do so), Phase 3 does not need it back — nothing in this phase calls `setUser` imperatively.

### `apps/web/src/components/header.tsx` (modify)

Line 24: add `paywallThreshold` to the `useShell()` destructure:
```ts
const { user, openAuth, openSearch, articlesRead, paywallThreshold, setUser } = useShell();
```
(Drop `setUser` from this destructure too if Phase 1 already removed it from context — re-verify.)

Line 49: change
```ts
const showNudge = articlesRead >= 3 && !user && !nudgeDismissed;
```
to
```ts
const showNudge = articlesRead >= paywallThreshold && !user && !nudgeDismissed;
```
No other change to this file in this phase — the nudge banner's rendered copy (lines 601–622) is unchanged (it contains no hardcoded number).

### `apps/web/src/components/article/article-content.tsx` (modify)

Line 25: add `paywallThreshold` to the `useShell()` destructure:
```ts
const { articlesRead, incrementRead, user, openAuth, paywallThreshold } = useShell();
```

Line 27: change
```ts
const hitPaywall = articlesRead > 3 && !user && !article.sponsored;
```
to
```ts
const hitPaywall = articlesRead >= paywallThreshold && !user && !article.sponsored;
```

Line 186: change
```tsx
<Paywall onLogin={openAuth} />
```
to
```tsx
<Paywall onLogin={openAuth} threshold={paywallThreshold} />
```

No other change to this file — the mount-effect `incrementRead(article.id)` call (line 30) is unchanged; the `!hitPaywall && <ShareBar />` / `hitPaywall && <Paywall .../>` branching (lines 182–188) is unchanged in structure.

### `apps/web/src/components/article/paywall.tsx` (rewrite)

Full replacement content:

```tsx
"use client";

import { Button } from "@dtw/ui";
import { useT } from "@/lib/i18n";

export interface PaywallProps {
  onLogin: () => void;
  /** CMS-configurable free-read limit (invariant #4 — never hardcode). */
  threshold: number;
}

/**
 * Soft sign-in nudge card shown after a guest's free-read limit trips.
 * Never a hard gate — the article body above this card always renders in
 * full. No billing surface exists in Phase 1; Pro/Stripe is out of scope for
 * this program (see the account feature's umbrella plan).
 */
export function Paywall({ onLogin, threshold }: PaywallProps) {
  const t = useT();

  return (
    <div
      style={{
        position: "relative",
        maxWidth: 680,
        margin: "0 auto",
        padding: "40px 36px 48px",
        background: "var(--surface)",
        border: "1px solid var(--hair)",
        borderRadius: 8,
        textAlign: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -80,
          left: 0,
          right: 0,
          height: 80,
          background: "linear-gradient(to bottom, transparent, var(--paper))",
          pointerEvents: "none",
        }}
      />
      <div className="kicker" style={{ marginBottom: 10 }}>
        {t("Free limit reached", "Đã hết lượt đọc miễn phí", "Batas gratis tercapai")}
      </div>
      <h3
        className="serif"
        style={{
          margin: "0 0 10px",
          fontSize: 30,
          fontWeight: 650,
          letterSpacing: "-0.02em",
        }}
      >
        {t(
          "Keep reading the reporting that matters in tech, across Asia and the world",
          "Tiếp tục đọc những tin tức công nghệ quan trọng, từ châu Á đến toàn cầu",
          "Terus baca laporan teknologi penting, dari Asia hingga dunia"
        )}
      </h3>
      <p
        className="text-mute"
        style={{
          margin: "0 auto 24px",
          fontSize: 14,
          lineHeight: 1.55,
          maxWidth: 480,
        }}
      >
        {t(
          `You've read your ${threshold} free articles this month. Sign in to keep reading — it's free.`,
          `Bạn đã đọc hết ${threshold} bài miễn phí trong tháng này. Đăng nhập để tiếp tục đọc — hoàn toàn miễn phí.`,
          `Anda telah membaca ${threshold} artikel gratis bulan ini. Masuk untuk terus membaca — gratis.`
        )}
      </p>
      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Button variant="primary" size="lg" onClick={onLogin}>
          {t("Sign in — it's free →", "Đăng nhập — miễn phí →", "Masuk — gratis →")}
        </Button>
      </div>
      <div className="mono text-mute-2" style={{ fontSize: 11 }}>
        {t(
          "Free meter resets on the 1st of each month",
          "Bộ đếm miễn phí sẽ làm mới vào ngày 1 hàng tháng",
          "Meteran gratis akan direset pada tanggal 1 setiap bulan"
        )}
      </div>
    </div>
  );
}
```

Notes on this rewrite: removed the `$12/mo` card, the `href="/pro"` `Button`, and the three-bullet feature grid (`Unlimited reading` / `Full Dashboards` / `Pro newsletters`) entirely. Removed the "I already have an account" vs. "Become a member" two-CTA layout — Phase 1's unified auth modal (magic link + email/password + OAuth, with its own sign-in/sign-up mode switch) makes a single "Sign in" CTA sufficient; the modal itself offers the sign-up path. Reused the `"Sign in — it's free →"` triple verbatim from `header.tsx`'s existing nudge banner CTA for cross-surface voice consistency. Sign-in CTA copy `"Sign in — it's free →"` reused exactly as `t()`'s first-arg triple already exists elsewhere in the codebase (`header.tsx` line 622) — same three strings, same translations, deliberately not reinvented.

### `process/features/articles/_GUIDE.md` (durable-capture step — part of Implementation Checklist step 17, not a code touchpoint)

Lines 36–48 currently read (in part): `"Threshold: read from PostHog feature flag paywall_meter_threshold (default 3) — never hardcode 3"`. Update this line to describe the Payload Global actually shipped by this phase (`paywallSettings.paywallThreshold`, `/admin`-editable, `revalidateTag`-busted), matching AD-2's umbrella-mandated reconciliation. This is a documentation-only change, done as part of EXECUTE's durable-capture step (loop step 7 in the umbrella's Mandatory Per-Phase Loop), not a code change requiring its own validation gate.

---

## Out of Scope

- Any hard paywall / content gating — the article body always renders in full above the (optional) nudge card; this remains a soft, dismissible/skippable signal only.
- Stripe/Pro billing, or any Pro-tier gating condition layered on top of `!user` — deferred per the umbrella's Foundation vs. Expansion boundary.
- PostHog as the threshold source — explicitly rejected by AD-2 (Payload Global is the source of truth; PostHog is not deployed in this repo).
- Any anonymous-bookmarks-merge action — no anonymous bookmark storage exists in this program to merge from (see D5).
- Gating signed-in readers by their `reading_history`-window count — computed (D6) but not wired into any gate in this phase.
- Adding `js-cookie` or any other new npm dependency (see D3).
- Seeding the Global's value via `scripts/seed-payload.ts` — the field's `defaultValue: 3` plus `getPaywallThreshold()`'s fail-open fallback of `3` already guarantee the correct default everywhere; adding an explicit seed step is unnecessary for this phase.
- Any change to `apps/web/src/lib/data.ts`'s commented-out `Pro` nav item or to any `/pro` route — leave both exactly as-is (confirmed absent/commented during grounding).
- Cross-tab meter synchronization for guests — a guest reading in two open tabs will not see live updates in the second tab until it independently increments or remounts; this matches brief-asia's own (also non-synced) `localStorage` design and is not a regression.
- Reconciling `process/context/auth/all-auth.md`'s stale middleware section — that reconciliation belongs to Phase 1's durable-capture step (per the umbrella's Context Doc Reconciliation table), not Phase 3.
- Any Payload seed-script or migration change beyond the one new Global migration described above.

---

## Public Contracts

New surfaces this phase introduces or changes. A later phase plan must not silently conflict with this table.

### Cookies

| Cookie | Set by | Shape | Notes |
|---|---|---|---|
| `dtw-read-count` | `apps/web/src/lib/paywall.ts` (client-side `document.cookie`) | `encodeURIComponent(JSON.stringify({ period: "YYYY-MM", ids: string[] }))`, `ids` capped at 20 | Guest-only meter; cleared on sign-in (D5); not `httpOnly`, not security-sensitive; `SameSite=Lax`, `path=/`, `max-age=7776000` (90 days) |

### Payload Global

| Slug | Field | Type | Default | Access | Cache tag |
|---|---|---|---|---|---|
| `paywallSettings` (expected table `paywall_settings`) | `paywallThreshold` (expected column `paywall_threshold`) | number, min 1, required | `3` | read: public; update: `editor`/`admin` | `settings:paywall` |

### New exported functions

| Function | File | Signature | Server/client |
|---|---|---|---|
| `getPaywallThreshold` | `apps/web/src/lib/payload-server.ts` | `(): Promise<number>` (`unstable_cache`d) | server, cached, non-personalized — safe in a cached RSC |
| `currentPeriodKeySGT` | `apps/web/src/lib/paywall.ts` | `(now?: Date): string` | universal (pure) |
| `startOfCurrentPeriodSGT` | `apps/web/src/lib/paywall.ts` | `(now?: Date): Date` | universal (pure) |
| `readGuestMeter` | `apps/web/src/lib/paywall.ts` | `(): { period: string; ids: string[] }` | client only (reads `document.cookie`) |
| `recordGuestRead` | `apps/web/src/lib/paywall.ts` | `(articleId: string): number` | client only |
| `clearGuestMeter` | `apps/web/src/lib/paywall.ts` | `(): void` | client only |
| `getReadCountThisPeriod` | `apps/web/src/lib/session.ts` | `(userId: string): Promise<number>` | server only (DB read) — **never** call from a cached RSC (personalized) |
| `getMyReadCount` | `apps/web/src/lib/paywall-actions.ts` | `(): Promise<number>` | server action (`"use server"`), fails closed to `0` |

### `ShellContextValue` additions

| Field | Type | Notes |
|---|---|---|
| `paywallThreshold` | `number` | Read-only, sourced from `(reader)/layout.tsx`'s `getPaywallThreshold()` prop; not personalized, safe to fetch in a cached RSC |

### `PaywallProps` (component) additions

| Field | Type | Notes |
|---|---|---|
| `threshold` | `number` | New required prop on `<Paywall>`; used in the card's dynamic copy |

No new environment variables. No changes to any Drizzle table, column, or migration (Phase 3 touches Payload's migration system exclusively — see Blast Radius).

---

## Blast Radius

- **First Payload Global in this repo.** Validates the `globals: []` config key, the `payload:migrate:create` → commit-the-SQL flow, and the `GlobalAfterChangeHook` type for the first time in this codebase. Type-level verification against `node_modules/payload/dist/globals/config/types.d.ts` was done during this PLAN pass (see Grounding) and shows the hook signature is compatible with the existing `revalidate.ts` destructuring convention — the residual risk is runtime-only (an actual `/admin` save exercising the hook), covered by Verification Evidence.
- **`header.tsx` and `article-content.tsx` are touched a second time each** (Phase 1 and Phase 2 respectively touch them first, per the umbrella). Regression checkpoint must re-verify Phase 1's login/logout and Phase 2's save/history/recordView still work after this phase's edits — this phase's changes to both files are narrow (one destructure line + one comparison line each; `article-content.tsx` also gains one prop-forwarding line), minimizing merge risk, but the checkpoint is not optional.
- **`shell.tsx`'s exported context shape changes** (`paywallThreshold` added, `articlesRead`/`incrementRead` internals rewritten). Every consumer of `useShell()` (`header.tsx`, `article-content.tsx`, `auth-modal.tsx`, the `/account` page) is affected by the type change even though only two of them (`header.tsx`, `article-content.tsx`) need behavioral edits in this phase — a TypeScript build (`pnpm typecheck`) will surface any consumer this plan didn't anticipate.
- **`(reader)/layout.tsx` gains a second async data fetch** alongside `getNavPillars()`. Must use `Promise.all` (specified in Touchpoints) to avoid a request waterfall; must **not** introduce any `cookies()`/session read into this file (it stays a cacheable, non-personalized RSC — `getPaywallThreshold()` is itself `unstable_cache`'d and safe here, unlike a per-user session read would be).
- **Removing content from `paywall.tsx`** (the Pro card) is a small blast radius on its own, but a real user-visible regression risk if any other surface still links to `/pro` — confirmed during grounding that `apps/web/src/lib/data.ts`'s Pro nav item is already commented out and no `/pro` route exists; this phase must not resurrect either.
- **`packages/db` is unaffected** — Phase 3 introduces zero Drizzle schema changes (confirmed: `readingHistory` already has everything needed). The only schema-adjacent change in this phase goes through **Payload's own migration system** (`apps/web/src/payload/migrations/`), never Drizzle's (`packages/db/migrations/`) — per AD-7, these two migration systems must never cross-generate. `packages/db` (shared with `dtw-engine`, a separate repo) is not touched at all by this phase.
- **`scripts/migrate-prod.mjs` gate**: the new Global's migration only auto-runs on `VERCEL_ENV=production` deploys. Preview/branch builds will query a Global whose backing table doesn't exist yet until the next production deploy — `getPaywallThreshold()`'s try/catch fail-open to `3` (matching today's hardcoded default) is the required mitigation, already specified in Touchpoints. Verification Evidence includes exercising this path.

---

## Verification Evidence

- `pnpm typecheck`, `pnpm lint`, `pnpm build` (repo root, Turborepo) — must pass clean. `pnpm build` specifically validates that no client bundle accidentally pulls in `apps/web/src/lib/session.ts` (which imports `@dtw/db/client`, throwing at import time without `DATABASE_URL`) via the new `paywall-actions.ts` → `session.ts` import chain.
- **Static grep proof (no hardcoded 3 remains)**: `grep -rn "articlesRead.*[<>]=\?\s*3\b" apps/web/src` and `grep -rn "3 free articles" apps/web/src` both return zero matches after this phase's edits.
- **Manual, threshold config**: in `/admin`, navigate to the new Paywall Settings global, change `paywallThreshold` from `3` to `2`, save. Confirm the reader site's nudge banner and paywall card now trip after 2 reads, not 3, without a deploy (either within the 300s cache window, or immediately if `revalidateTag("settings:paywall")` fired — confirm the server log line `[revalidate] paywall settings updated → settings:paywall`). Set it back to `3` and confirm reversion.
- **Manual, guest meter persistence**: as a guest (incognito/no session), read articles up to the threshold, **reload the page** (hard refresh), confirm the meter did **not** reset to 0 — inspect `document.cookie` in devtools to confirm `dtw-read-count` is present and its `ids` array matches the articles read.
- **Manual, dedupe**: re-read the *same* article multiple times as a guest; confirm the meter does not increment past 1 for that article (inspect the cookie's `ids` array length).
- **Manual, `>=` consistency**: as a guest, confirm the header nudge banner and the article-page paywall card both first appear on the *same* article (the Nth), not one article apart.
- **Manual, sign-in resets the meter**: trip the guest meter, sign in (via any Phase 1 method), confirm `dtw-read-count` is cleared from `document.cookie` immediately after the session is established.
- **Manual, logged-in meter (data verification)**: as a signed-in reader who has read N distinct articles this calendar month (per Phase 2's `reading_history`), run:
  ```sql
  SELECT count(*) FROM reading_history
  WHERE user_id = '<id>' AND read_at >= date_trunc('month', now() AT TIME ZONE 'Asia/Singapore') AT TIME ZONE 'Asia/Singapore';
  ```
  and confirm it matches N, and confirm `getReadCountThisPeriod(userId)`'s TypeScript result matches this query.
- **Manual, paywall copy**: confirm the article page's paywall card no longer shows a `$12/mo` price, a `Become a member` button, an `href="/pro"` link, or the three-bullet feature grid; confirm the card's body copy states the *actual* configured threshold (change the Global to `2` and confirm the card's text updates to "2 free articles", not a stale "3").
- **Manual, i18n**: switch the site language to `vi` and `id` (existing `useT()`/`useLang()` mechanism) and confirm the rewritten `paywall.tsx` renders the Vietnamese/Indonesian copy correctly, including the interpolated threshold number.
- **Data verification (Global table)**:
  ```sql
  SELECT * FROM paywall_settings;
  ```
  confirm exactly one row, `paywall_threshold` matching what `/admin` shows.
- **Manual, fail-open path**: simulate a not-yet-migrated preview build by temporarily renaming the `paywall_settings` table (`ALTER TABLE paywall_settings RENAME TO paywall_settings_bak;`) in a scratch/dev DB, reload the reader site, confirm it does **not** 500 and the threshold falls back to `3` (check server logs for the `[getPaywallThreshold] query failed` warning), then rename the table back.
- **Regression, Phase 1**: re-run Phase 1's manual login/logout check (magic link, email+password, and at least one OAuth provider) after this phase's edits to `header.tsx`/`shell.tsx`/`(reader)/layout.tsx`.
- **Regression, Phase 2**: re-run Phase 2's manual save/unsave and reading-history checks after this phase's edits to `article-content.tsx`/`shell.tsx`.

---

## Durable Report Target

`process/features/account/reports/phase-03-paywall-nudge_REPORT_<execution-date>.md`

Per Phase Completion Rules and the umbrella's "durable capture" loop step, the report must document: what was tested manually (exact steps, referencing the list above), the DB query + result for both the Global table and the `reading_history` window count, errors encountered and fixed, the Phase 1/Phase 2 regression checkpoint results, explicit user confirmation, and confirmation that `process/features/articles/_GUIDE.md` was updated (Implementation Checklist step 17).

---

## Blockers That Would Justify 🚧 BLOCKED

- Phase 1 and/or Phase 2, when re-verified at this phase's own kickoff (fresh research, per `phase-programs.md`'s Re-Research Rule), turn out not to actually be `✅ VERIFIED`, or their landed shape materially diverges from what this plan assumes (e.g. `session.ts` doesn't exist, `recordView` doesn't upsert `reading_history` as described, `shell.tsx`'s `user` isn't a real session). **Stop and route back to Phase 1/2**, do not attempt to backfill their scope inside a Phase 3 EXECUTE pass.
- The Payload Global's `afterChange` hook, once actually exercised through a real `/admin` save (not just type-checked), does not fire `revalidateTag` as expected — e.g. Globals require passing `overrideAccess` or a different invocation path than Collections at runtime. This PLAN pass downgraded this from the umbrella's original "possible blocker" framing based on type-level verification, but the *runtime* behavior is still unconfirmed until Verification Evidence's threshold-config manual test is actually run.
- `payload:migrate:create` generates a materially different table/column-name shape than expected (D7) in a way that breaks the `p.findGlobal({slug: "paywallSettings"})` local-API read (e.g. the field name doesn't round-trip as `paywallThreshold` on the returned doc). Re-research the generated migration file before proceeding, don't guess.
- The guest cookie approach is found, once tested against a real deployed environment (not just localhost), to be silently stripped or blocked by an intermediate layer (Cloudflare WAF/CDN rule, browser tracking-prevention heuristics flagging a non-consent-banner-registered cookie) in a way that makes the guest meter unreliable in production. If this surfaces, escalate — do not silently fall back to a different mechanism (e.g. resurrecting `localStorage`) without updating this plan first, since that would reintroduce the exact bug this phase exists to fix.

---

## Execute Anchor and Supporting Files

This file (`phase-03-paywall-nudge_PLAN_03-07-26.md`) is the **primary execute anchor** for Phase 3 — pass this exact path to the execute agent, not the umbrella plan. Supporting files for this execution:

- `process/features/account/active/reader-auth-account_UMBRELLA-PLAN_03-07-26.md` — umbrella/context only, not itself an execute target; defines the locked architecture decisions (AD-1 through AD-8) this phase must not contradict.
- `process/features/account/active/phase-01-auth-foundation_PLAN_03-07-26.md` and `process/features/account/active/phase-02-account-data-layer_PLAN_03-07-26.md` — dependency prerequisites (must be `✅ VERIFIED` first, per Dependencies above), not supporting phase files for Phase 3's own execution scope.
- `process/features/account/reports/phase-01-auth-foundation_REPORT_*.md` and `process/features/account/reports/phase-02-account-data-layer_REPORT_*.md` — evidence that the two dependency phases actually landed as their plans described; re-read before trusting this plan's assumptions about `shell.tsx`/`session.ts`/`account-actions.ts`'s current shape (see Resume and Execution Handoff).

---

## Resume and Execution Handoff

If this plan is resumed after a gap or context compaction:

1. Read this Phase 3 plan in full first, then the umbrella plan's Phase 3 section (for cross-check), then this plan's [Design Decisions](#design-decisions-locked-for-this-phase) section specifically — those decisions are locked and should not be silently re-derived differently.
2. Confirm Phase 1 and Phase 2 are actually `✅ VERIFIED`: check `process/features/account/active/` for their plan files' `Status` field, and check `process/features/account/reports/` for `phase-01-auth-foundation_REPORT_*.md` and `phase-02-account-data-layer_REPORT_*.md`. If either is missing or not `✅ VERIFIED`, **stop** — this plan's Dependencies are not met.
3. Re-read the *actual current* contents of `apps/web/src/lib/shell.tsx`, `apps/web/src/lib/session.ts`, `apps/web/src/lib/account-actions.ts`, `apps/web/src/components/header.tsx`, and `apps/web/src/components/article/article-content.tsx` before touching any of them — this plan's illustrative sketches for `shell.tsx` and its diff-anchors for `header.tsx`/`article-content.tsx` were written against this repo's state as of 03-07-26 (pre-Phase-1/2) plus the umbrella's *description* of Phase 1/2's intended output; by the time Phase 3 executes, Phase 1 and Phase 2 will have actually landed and may differ in exact variable names or line numbers from what's described here. Apply the *behavior* specified in [Touchpoints](#touchpoints), not a blind line-number diff.
4. Confirm `packages/db/src/schema/account.ts`'s `readingHistory` table shape is unchanged from what's cited in [Grounding](#grounding--verification-method) (unique index on `(userId, articleId)`) — if Phase 2 altered this shape, re-verify Design Decision D2 still holds before implementing `getReadCountThisPeriod`.
5. Confirm `apps/web/payload.config.ts` still has no `globals` key and no existing `PaywallSettings`-shaped Global before creating one (avoid a duplicate).
6. Execute strictly within this phase's scope (per [Out of Scope](#out-of-scope)); if kickoff research reveals a genuine need to expand scope (e.g. a new Drizzle column, a middleware file, an anonymous-bookmarks merge), stop and route back to PLAN rather than silently expanding.

---

## Next Step

This plan is ready for its own execution-approval checkpoint. Per the umbrella's Mandatory Per-Phase Loop, before EXECUTE begins: (1) confirm Phase 1 and Phase 2 are `✅ VERIFIED` with reports on disk (see Resume and Execution Handoff, step 2) — if not, route to those phases' plans first; (2) run a fresh RESEARCH pass re-verifying this plan's Touchpoints against the actual current repo state; (3) get explicit user approval summarizing what changed since this PLAN pass, if anything.

Once Phase 1 and Phase 2 are verified and this plan's Touchpoints have been re-confirmed against current code, say **`ENTER EXECUTE MODE`** to begin implementation, passing this exact file path (`process/features/account/active/phase-03-paywall-nudge_PLAN_03-07-26.md`) to the execute agent.
