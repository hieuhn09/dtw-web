# account

<!-- Part of dtw-web -->

## Scope

`/account` and the auth flows that lead into it. Owns: the login/signup modal, post-login state, saved articles, reading queue ("read later"), reading history, followed pillars, and user settings (dark mode, language, newsletter subscriptions).

Also covers PWA offline cache rules — these are user-data scoped so they live with the account surface, not in infra.

Does NOT cover: Better-Auth provider setup (`auth/all-auth.md`), Pro subscription billing (Phase 2 — `integrations/`).

## Surfaces

### Login / Signup modal

- Triggered from the header "Log in" button, the sign-in nudge banner (after 3 reads), and 401 redirects from protected routes
- Inputs: email (magic link) + OAuth buttons (Google, Apple, GitHub)
- Email submit → "Check your inbox" screen with a "Resend in 30s" countdown
- Magic link clicked → `/auth/callback` route handler → session set → redirect back to the original page
- Signup form is the same — first magic link establishes the account with `role: 'Reader'`

### `/account` page

Tabs (from `design/project/src/account.jsx`):

1. **Saved** — bookmarked articles, deterministic cover-art preview, click to read
2. **Read later** — queue (FIFO), can reorder, can remove. **No length limit** (per spec)
3. **Following** — pillars the user follows; toggles affect homepage personalisation + offline cache
4. **History** — chronological list of articles read
5. **Newsletters** — segment subscriptions (mirrors `/newsletters` page but with current state)
6. **Settings** — dark mode toggle, language picker, "delete my account" (GDPR / PDPA right-to-erase)

### Logged-in header dropdown

User name + chevron → dropdown with: Saved, Account, Log out

## Multi-device sync

- IndexedDB local cache mirrors the user's `bookmarks`, `read_later_queue`, `following`, `history` tables
- On login or visibility change: pull latest from server, merge with local
- Conflict resolution: server wins on `bookmarks` / `following` / `history`; client-side ordering wins on `read_later_queue` (user reordered locally)
- Anonymous users still get IndexedDB-backed saves — on first login, these merge into the server-side records

## PWA offline rules

- **Cache 50 most recent articles** (any pillar) — read-anywhere baseline
- **Cache 20 most recent per followed pillar** — readers who follow AI get AI deep-dives offline
- Workbox strategies:
  - `CacheFirst` for static assets + CSS + fonts + favicons
  - `StaleWhileRevalidate` for article HTML (always show the cache, refresh in background)
  - `NetworkFirst` for API calls except the offline cache pre-warmed list
- `manifest.json` — name, short_name, theme color `var(--accent)`, background `var(--paper)`, icon set (192, 256, 384, 512)

## i18n

Account settings page is fully translated (chrome + labels). The "delete my account" confirmation copy must be unambiguous in EN / VI / ID per compliance.

## Key Source Files (to come)

- `apps/web/src/app/(reader)/account/{layout,page,saved,read-later,following,history,newsletters,settings}.tsx`
- `apps/web/src/components/auth/{login-modal,oauth-buttons,magic-link-form}.tsx`
- `apps/web/src/app/auth/callback/route.ts`
- `apps/web/src/lib/account/{bookmarks,queue,follows,history}.ts`
- `apps/web/src/lib/pwa/{service-worker,offline-rules}.ts`
- `apps/web/public/manifest.json`
- `packages/db/src/schema/account.ts`

## Related Context

- `process/context/auth/all-auth.md` — Better-Auth, RBAC, magic link
- `process/context/uxui/all-uxui.md` — dark mode + i18n discipline
- `process/context/infra/all-infra.md` — PWA service worker, Workbox
- `process/features/newsletters/_GUIDE.md` — segment model

## Current Status

Status: not-started

## Folder Contents

```
process/features/account/
  active/       -- in-progress plans (login modal, saved tab, PWA shell)
  completed/    -- archived
  backlog/      -- highlights / annotations, share-to-newsletter, account export (GDPR)
  reports/      -- multi-device-sync conflict logs
  references/   -- Workbox strategy notes, IndexedDB schema versions
```
