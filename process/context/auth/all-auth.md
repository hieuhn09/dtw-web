# dtw-web - All Auth

Last updated: 2026-05-28

Attach this file when the task touches login, RBAC, session handling, or anything that gates content by role.

---

## What This Covers

- Better-Auth on Drizzle / Postgres (self-host)
- Magic link + OAuth (Google / Apple / GitHub) + 2FA for admin / editor roles
- RBAC: 5 roles — Reader / Pro / Author / Editor / Admin
- Auth UI (modal-first; no dedicated `/login` page)
- Session shape and middleware

Does NOT cover paywall meter logic (that's `process/features/articles/_GUIDE.md`) or subscription billing (Phase 2, `integrations/`).

## Read This When

- Adding a protected route or admin-only handler
- Modifying the auth modal or the post-login redirect
- Wiring 2FA into the Payload `/admin` panel
- Reviewing RBAC checks in Payload collections or Next.js middleware

---

## Stack decisions

- **Better-Auth** (NOT Lucia — Lucia development was halted; this is recorded as project invariant #11 in `all-context.md`). NOT Auth.js for Y1; Auth.js v5 is the fallback if Better-Auth becomes unmaintained.
- **Drizzle / Postgres** — Better-Auth's first-party Drizzle adapter. User / session / verification tables live in `packages/db`, shared with everything else.
- **Magic link is the primary path** — no password column. Passwords are intentionally never stored.
- **OAuth providers (Y1):** Google, Apple, GitHub. Tracked in env: `GOOGLE_CLIENT_ID/SECRET`, `APPLE_CLIENT_ID/...`, `GITHUB_CLIENT_ID/SECRET`.
- **2FA via TOTP** — required for `Editor` and `Admin` roles. Optional for `Author`. Not offered to `Reader` / `Pro`.

## Roles

| Role | What they can do |
|---|---|
| `Reader` | Default for every new account. Save bookmarks, follow pillars, change locale / theme, manage reading queue. |
| `Pro` (Phase 2) | Same as Reader + paywall bypass + subscriber-only newsletters. Granted by Stripe webhook. |
| `Author` | Reader perms + draft / submit articles in Payload `/admin`. Cannot publish. |
| `Editor` | Author perms + publish / unpublish / correct, set `lockedFields` on articles, edit taxonomy. **2FA mandatory.** |
| `Admin` | Editor perms + manage users + RBAC + Payload settings + sponsor slots + dashboard data sources. **2FA mandatory.** |

Roles are stored as a string column on `users` (not many-to-many — keep it simple unless we need per-pillar editorship later).

## Auth surface

- **Reader login:** modal triggered from header "Log in". Inputs: email (magic link), OR Google / Apple / GitHub OAuth button. After login, header swaps "Log in" → user name + dropdown (Saved / Account / Log out).
- **Editor / Admin login:** same magic-link flow, but the post-login redirect goes through a `/admin` gate that checks role and triggers 2FA setup if missing.
- **Magic link emails:** sent via Resend with React Email templates. Subject: `Sign in to DailyTechWire`. Link expiry: 15 minutes. Single-use.
- **Session cookie:** httpOnly, secure, SameSite=Lax. Rotates on privilege change.

## Middleware (Next.js)

Planned: `apps/web/src/middleware.ts` checks role for:

- `/admin/*` — must be `Author` | `Editor` | `Admin`
- `/account` — must be logged in
- `/api/cms/*` — RBAC via Payload's `access` controls (Payload owns the API surface)

Pillar / article reads are public; the paywall meter is enforced separately and does NOT 401.

## Auth ↔ paywall interaction

The Phase 1 paywall is a **sign-in nudge**, not a hard gate. After ≥ 3 article reads from an unauthenticated visitor, the homepage / article header shows a banner inviting sign-in. The banner has a dismiss (×) that persists in `localStorage` (`dtw-nudge-dismissed`). Once authenticated (any role, including Reader), the banner never appears.

Phase 2 will add real subscriber gating on `Pro` content — that's tracked in `process/features/articles/_GUIDE.md`.

## Source paths (to come)

- `packages/db/src/schema/auth.ts` — Better-Auth Drizzle tables
- `apps/web/src/lib/auth.ts` — Better-Auth instance + Next.js handler
- `apps/web/src/app/api/auth/[...all]/route.ts` — auth API mount
- `apps/web/src/middleware.ts` — route protection
- `apps/web/src/components/auth-modal.tsx` — login UI

## Quick Routing

| If you need... | Read next |
|---|---|
| paywall meter behavior | `process/features/articles/_GUIDE.md` |
| RBAC inside CMS collections | `process/features/cms/_GUIDE.md` |
| user table shape and bookmark / follow relations | `process/context/database/all-database.md` |
| account settings UI | `process/features/account/_GUIDE.md` |

## Known Gaps

- No code yet (greenfield)
- Need to confirm Apple OAuth team-id / private-key setup before launch
- 2FA recovery codes flow not yet designed
