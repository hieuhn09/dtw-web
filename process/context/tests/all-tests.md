# dtw-web - All Tests

Last updated: 2026-05-28

Attach this file first when the task involves testing, verification, or test debugging.

**Heads-up (greenfield).** This is day-zero. No tests exist yet. This file captures the testing plan so the runner choices, package boundaries, and known constraints are decided once — not relitigated per feature.

---

## What This Covers

- Planned test runners and where each one runs
- Default verification order
- Commands (placeholders — fill in when the scaffold lands)
- Debugging hints for the stack we'll have
- Known gaps (lots — this is a greenfield project)

## Read This When

- About to write the first tests for a feature
- Choosing between unit vs e2e
- Setting up CI
- Debugging a failing test once we have any

---

## Planned Runner Split

Once the Turborepo + pnpm monorepo is scaffolded, each package gets its own runner appropriate to what it does.

### `apps/web` — **Vitest** (jsdom)

- React components, hooks, paywall meter logic, RSC server fragments where they don't depend on a live database
- Mock Better-Auth via `vi.mock("@dtw/auth")` in test setup
- Mock Payload local API where used

### `packages/db` — **Vitest** (Node) + **PGlite** (in-memory Postgres)

- Drizzle schema, migrations, RLS-like access rules
- PGlite gives isolated test databases per test file — no shared external DB
- Run real Drizzle queries against PGlite to catch schema drift

### `apps/web` (e2e) — **Playwright**

- Full reader journey: read 3 articles, see sign-in nudge, sign in, paywall meter resets
- Pillar navigation, search overlay (⌘K), dashboard sort + CSV export
- Cookie banner Decline / Accept paths
- i18n switch persists, chrome translates, article body stays in source language
- Disclosure box: sponsored article shows top / middle / bottom, no dismiss button rendered
- Dark mode toggle persists across reload

### Integration tests for Engine ↔ Payload

- Stand up Payload + a stub Engine client; verify the invariants from `database/all-database.md`
  - locked field never overwritten
  - optimistic-lock 409 → retry
  - `afterChange` hook fires (assert revalidateTag + Meilisearch upsert called)

### Container / Lighthouse (release gates)

- Lighthouse CI per release: mobile ≥ 95, LCP < 1.5s, CLS < 0.05, INP < 200ms (mirror targets from `infra/all-infra.md`)
- axe-core: 0 critical

---

## Default Verification Order

Unless the task clearly needs a different path:

1. typecheck (`pnpm typecheck` once scaffolded) — catches most mistakes
2. unit tests for the touched package only (`pnpm --filter <pkg> test`)
3. integration tests for cross-package work
4. Playwright for anything user-visible that the previous tiers can't cover

Skip Playwright on small, well-scoped logic changes — it's slow.

---

## Commands

(pending — fill in when `package.json` exists)

| Package | Runner | Command | Notes |
|---|---|---|---|
| `apps/web` | vitest | `pnpm --filter web test` | jsdom env, mock auth + Payload |
| `apps/web` (e2e) | Playwright | `pnpm --filter web test:e2e` | needs dev server on :3000 |
| `packages/db` | vitest + PGlite | `pnpm --filter @dtw/db test` | isolated PGlite per test file |
| root | turbo | `pnpm test` | runs all package tests |
| root | turbo | `pnpm typecheck` | TS strict project-wide |
| root | turbo | `pnpm lint` | ESLint with Next + a11y plugins |

---

## Debugging Quick Reference

- **jsdom quirks:** `apps/web` uses jsdom — Canvas / Image / WebSocket APIs unavailable. Mock them in `vitest.setup.ts`.
- **IntersectionObserver:** the design's scroll-reveal effects rely on it. Tests that touch effects.jsx-style code need either a polyfill or the triple-fallback timer (which the production code already has).
- **PGlite gotcha:** Drizzle uses `pg-native` features that PGlite handles, but `LISTEN/NOTIFY` is a stub — don't write tests against those.
- **Payload tests:** Payload boots slow. Use `globalSetup` to start it once per test run.
- **Engine integration tests:** the Engine client should be a real HTTP client hitting localhost Payload, not a mock — otherwise the contract isn't being tested.
- **Env files:** `.env.test` for integration tests, `.env.local` for dev. Never put secrets in either.

## Quick Routing

(No deeper test docs yet. Add routing entries here as they are created.)

## Known Gaps

- Nothing exists yet (greenfield)
- Test runner versions not pinned (will pin during scaffold)
- No CI pipeline (no `.github/workflows/`)
- No PGlite + Drizzle integration prototype yet — first feature touching DB will set the pattern
- No Lighthouse CI configured
- No axe-core integration
- No way yet to verify `afterChange` side effects fire — needs a test harness around Payload hooks
