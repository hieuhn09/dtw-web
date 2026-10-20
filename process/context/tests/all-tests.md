# dtw-web - All Tests

Last updated: 2026-10-20

Attach this file first when the task involves testing, verification, or test debugging.

**Current state (2026-10-20).** The monorepo exists, but there is no Vitest, Playwright or PGlite. The earlier plan naming them was never built; treat them as aspirations only (see Known Gaps).

---

## What Exists Today

All commands run from the repo root with pnpm. Scoped scripts live in `apps/web/package.json` and use Node's built-in test runner through `tsx --test` (no DB, no network).

| Gate | Command | Covers |
|---|---|---|
| Typecheck | `pnpm typecheck` (turbo, `tsc --noEmit`) | whole workspace; the only gate CI runs |
| Lint | `pnpm --filter web lint` (`next lint`) | compare against the baseline; not a build gate and not run in CI |
| Exclusive rules | `pnpm --filter web test:exclusive` | `src/lib/exclusive.ts` pure rules (9 tests: band selection, paging, chip hiding) |
| GA bot gate | `pnpm --filter web test:bot-detect` | `src/lib/bot-detect.ts` (31 tests) |
| Signup guard | `pnpm --filter web test:signup-guard` | `src/lib/signup-guard.ts` (6 tests) |
| Build | `pnpm --filter web build` | catches server/client boundary and route errors |

CI (`.github/workflows/ci.yml`) runs install plus typecheck only. Vercel's Preview deploy does the real build.

## Verification Order

1. `pnpm typecheck`
2. the scoped `tsx --test` script for the touched `src/lib` module
3. lint, compared to baseline (no new findings)
4. `next build` for anything touching routes, metadata or server components
5. a runtime probe for user-visible work (below)

## Runtime Probe Pattern (mock Central)

There is no way to run the reader site against a real Central CMS from a sandbox. The otw-exclusive work used a throwaway mock Central kept in the session scratchpad (never committed): a small HTTP server answering `/api/public/site`, `/articles` (honouring `flag`, `content_type`, `page`, `limit`, `sort`, `q`, `pillar`, `ids`), `/articles/{slug}`, `/preview` and the wire/corrections/newsletters/dashboards/sponsors modules, with unknown paths returning empty JSON. Start `next dev` with placeholder env (`CMS_URL=http://localhost:<port> CMS_READ_TOKEN=probe`, a dummy `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_SITE_URL`; leave `AUTH_DATABASE_URL` unset) and curl or screenshot the pages. Re-read `cms-client.central.ts` first, since the mock must match whatever it calls. This proves rendering and routing only, not real data, the revalidation webhook or production ISR.

## Debugging Quick Reference

- **`redirect()` status:** Next returns 307 for `redirect()` in pages; probes should accept 307 or 308.
- **Account lists need a session:** saved/history/queue pages need Postgres plus a Better-Auth session, so they cannot be probed with the mock alone.
- **Hidden surfaces:** `SHOW_DEEP_DIVE` and unmounted components (for example `SponsoredStrip`) can only be seen through a local flag flip that must be reverted before commit.
- **Plan validator:** the dtw-web copy of `validate-plan-artifact.mjs` fails plans that have YAML frontmatter (missing `m` flag on the title regex); the apcg-cms copy is correct.
- **Env files:** never put secrets in `.env.local` examples or test files.

## Quick Routing

(No deeper test docs yet. Add routing entries here as they are created.)

## Known Gaps

- No component/DOM test runner (the old plan named Vitest + jsdom; not installed). Only pure `src/lib` modules are unit tested.
- No Playwright e2e, no PGlite or DB integration tests, no Lighthouse CI, no axe-core
- CI runs typecheck only: no lint step, no `tsx --test` scripts, no content-guard step
- No harness to verify `afterChange`/revalidation side effects or real Central data
- Residuals from the Exclusive section: `process/general-plans/backlog/otw-exclusive-residuals_NOTE_20-10-26.md`
