# brief-asia-web → dtw-web Auth/Account/Reading Port Map (Reference)

- **Date:** 2026-07-03
- **Feature:** account (also touches articles paywall + newsletters)
- **Purpose:** Durable research reference so future planning/execute sessions can build the dtw-web reader auth, account, paywall, and newsletter stack by porting from `brief-asia-web` WITHOUT re-running the research. Contains: condensed findings from brief-asia-web (auth, user management, reading features), dtw-web current state, the full feature port map, user-confirmed architecture decisions, risks, and brief-asia bugs that must NOT be ported.
- **How it was produced:** Parallel research subagents over `/home/hieunc/Code/brief-asia-web` (auth system; user management; reading features) and `/home/hieunc/Code/dtw-web` (current state), synthesized into a port map, then decision points resolved explicitly by the user. The two repos are siblings — brief-asia was adapted from the dtw design — so conventions align closely.

**Path convention in this doc:** brief-asia paths are relative to `/home/hieunc/Code/brief-asia-web/`; dtw paths are relative to `/home/hieunc/Code/dtw-web/`.

---

## 1. brief-asia-web findings

### 1.1 Auth system

brief-asia runs **TWO fully separate auth systems in one Postgres DB**: (A) Better-Auth 1.6.20 for READER accounts on Drizzle tables `auth_users` / `auth_sessions` / `auth_accounts` / `auth_verifications` (pg enum `auth_user_role` = `reader|pro|author|editor|admin`), and (B) Payload CMS 3.85.1 built-in auth for EDITORIAL users (`users` + `users_sessions` tables) at `/admin`. They never share tables or sessions; reconciliation is documented as deferred in `src/payload/collections/Users.ts` and NOT implemented.

Reader auth methods actually enabled: **email+password** (`requireEmailVerification: true`, reset token 3600s) + **Google OAuth** (conditionally registered only when `GOOGLE_CLIENT_ID`+`GOOGLE_CLIENT_SECRET` set). **NO magic-link plugin, NO 2FA plugin** — `plugins: [nextCookies()]` only (the `two_factor_secret`/`two_factor_enabled` columns and "magic link" comments are dormant scaffolding). `emailVerification: { sendOnSignUp: true, autoSignInAfterVerification: true }`. `user.additionalFields.role` = `{ type: "string", defaultValue: "reader", input: false }` (client can never set role). `changeEmail` + `deleteUser` enabled. Session: `expiresIn` 7 days / `updateAge` 1 day. All auth emails wrapped in `sendAuthEmailSafe()` (catch+log — a Resend outage never rolls back account flows).

#### Key files (auth)

| Path | Purpose |
|---|---|
| `src/lib/auth.ts` | Better-Auth server init: `drizzleAdapter(db, { provider: "pg", schema: { user: users, session: sessions, account: accounts, verification: verifications } })` mapping onto `auth_*` tables; emailAndPassword + conditional Google; role additionalField `input:false`; changeEmail/deleteUser; 7d sessions; `plugins:[nextCookies()]` (must be LAST); `sendAuthEmailSafe` wrapper; imports `server-only` |
| `src/lib/auth-client.ts` | `createAuthClient()` from `better-auth/react`, zero plugins, same-origin `/api/auth/*`; exports `signIn, signUp, signOut, useSession, resetPassword` |
| `src/app/api/auth/[...all]/route.ts` | Catch-all mount: `export const { GET, POST } = toNextJsHandler(auth)`; `dynamic='force-dynamic'`; never locale-prefixed (middleware skips `/api`) |
| `src/db/schema/auth.ts` | Drizzle tables `auth_users` (id text PK, email unique idx `auth_users_email_unique`, role enum default `'reader'`, `two_factor_secret`/`two_factor_enabled`), `auth_sessions` (token unique, user_id FK cascade, ip_address, user_agent), `auth_accounts` (provider_id+account_id unique, password column), `auth_verifications` |
| `src/components/auth-modal.tsx` | Modes signin/signup/forgot; `signIn.email`, `signUp.email` then explicit `authClient.sendVerificationEmail({email, callbackURL:'/en'})`, `authClient.requestPasswordReset({email, redirectTo:'/en/reset-password'})` with anti-enumeration copy, `signIn.social({provider:'google'})`; **`googleEnabled` hardcoded `true`** (env gate commented out — BUG) |
| `src/lib/shell.tsx` | ShellProvider: `useSession()` → `toShellUser` (capitalizes role `'reader'`→`'Reader'`), `authOpen/openAuth/closeAuth`, guest meter localStorage `'briefasia-read-ids'`, ⌘K search |
| `src/lib/account.ts` | Server-only: `getSessionUser()` = `auth.api.getSession({ headers: await headers() })` → `{id,name,email,role}` (role fallback `'reader'`); `listBookmarks`, `listHistory` (limit 50), `listFollows`, `listNewsletterSubs` (by email, `unsubscribed_at IS NULL`) |
| `src/lib/account-actions.ts` | `"use server"` mutations behind `requireUser()` (throws `'Not authenticated'`) |
| `src/lib/email.ts` | Resend when `RESEND_API_KEY` set, else prints full message (with clickable link) to server console; FROM `` BriefAsia <no-reply@${RESEND_FROM_DOMAIN || "briefasia.com"}> ``; `actionEmail({heading,intro,buttonLabel,url,footer?})` branded HTML+text used by all auth emails |
| `src/app/(reader)/[locale]/reset-password/page.tsx` | Reads `?token=`, calls `resetPassword({newPassword, token})`, Suspense-wrapped |
| `src/app/(reader)/[locale]/account/[[...tab]]/page.tsx` | Force-dynamic RSC: `getSessionUser()` → `AccountSignInPrompt` if null (no redirect), else `Promise.all` list loads + `getArticlesByIds` hydration → `AccountTabs` |
| `src/components/account/account-tabs.tsx` | SettingsTab: `authClient.changePassword({currentPassword,newPassword,revokeOtherSessions:true})`, `authClient.changeEmail({newEmail,callbackURL:'/en/account'})`, `authClient.deleteUser({})` after `window.confirm` then `window.location.href='/en'` |
| `src/components/header.tsx` | openAuth entry points + `signOut()` in desktop dropdown (~line 400) and mobile menu (~line 1009); nudge at `articlesRead >= 3 && !user` |
| `src/middleware.ts` | **i18n-only, deliberately NO auth**; skips `/api`, `/admin`, `/_next`, static; sets no cookies (CDN cacheability) |
| `src/payload/collections/Users.ts` | Payload editorial users (slug `users`): `auth: { tokenExpiration: 604800, cookies: { sameSite: "Lax" }, verify: false }`, roles author/editor/admin; documents the deliberate split from Better-Auth readers |
| `payload.config.ts` | `admin.user = Users.slug`; postgresAdapter same `DATABASE_URL`, `push:false`, `migrationDir src/payload/migrations`; `PAYLOAD_SECRET` required |
| `drizzle.config.ts` | schema `./src/db/schema/index.ts`, out `./src/db/migrations`, postgresql, strict+verbose; hand-parses `.env.local` for `DATABASE_URL` (no dotenv dep) |
| `src/db/migrations/0000_third_ender_wiggin.sql` | Initial Drizzle migration: `auth_user_role` enum, all `auth_*` tables, indexes, FKs from bookmarks/follows/reading_* to `auth_users` |
| `src/db/client.ts` | drizzle(postgres-js), `DATABASE_URL`, pool max 5 prod / 1 dev, `globalThis.__briefAsiaPgClient` HMR reuse |
| `src/db/schema/index.ts` | Barrel documenting Drizzle-owns (`auth_*` + reader data) vs Payload-owns (editorial) table split |
| `.env.example` | All auth env vars (see list below) |
| `src/app/(reader)/[locale]/layout.tsx` | Mounts ShellProvider + `<AuthModal />` globally |
| `scripts/seed-payload.ts` | Idempotent first Payload admin from `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` |
| `src/app/preview/route.ts` | `payload.auth({headers})` cookie gate — only logged-in Payload user can enable Next draftMode |

#### Flows (auth)

- **Signup (email+password):** openAuth → AuthModal 'signup' → `signUp.email` → `auth_users` row (role `'reader'`, unverified) + `auth_accounts` (credential, hashed password) → server `sendOnSignUp` verification email AND modal's explicit `sendVerificationEmail` (**two emails — bug**) → click link `/api/auth/verify-email?token=` → `autoSignInAfterVerification` sets session cookie.
- **Login:** `signIn.email({email,password,rememberMe})`; unverified users rejected (`requireEmailVerification`); success writes `auth_sessions` + cookie; no redirect — `useSession()` re-renders header.
- **Google OAuth:** `signIn.social({provider:'google', callbackURL:'/en'})` → callback `/api/auth/callback/google` (must be the authorized redirect URI on `<BETTER_AUTH_URL>`) → upsert user/account → cookie.
- **Forgot/reset:** `requestPasswordReset({email, redirectTo:'/en/reset-password'})` → `sendResetPassword` → `actionEmail` (1h expiry) → `/en/reset-password?token=` → `resetPassword({newPassword, token})`. Anti-enumeration notice always shown.
- **Sign out:** `signOut()` → session row deleted, cookie cleared, no redirect.
- **Session→UI:** ShellProvider `useSession()` → `toShellUser` capitalizes role; server side uses `getSessionUser()`. No middleware auth — protection is per-page (inline `AccountSignInPrompt`, no redirect) and per-server-action (`requireUser()`).
- **Settings:** changePassword / changeEmail (verification mailed to NEW address) / deleteUser (FK cascades clean reader tables; `newsletter_subscriptions.user_id` SET NULL so email rows survive).
- **Editorial login (separate):** `/admin` → Payload cookie auth against `users` collection; zero interaction with Better-Auth.

#### Gotchas (auth)

- Two disjoint user stores (see above); reconciliation deferred by design.
- `nextCookies()` must be LAST in the Better-Auth plugin chain (explicit comment) — it makes Set-Cookie work in server actions/routes.
- `googleEnabled` hardcoded `true` in `auth-modal.tsx`; if server creds unset, the visible button errors at runtime.
- Signup sends two verification emails (server `sendOnSignUp` + modal's explicit resend).
- `sendAuthEmailSafe` swallows ALL email errors by design; without `RESEND_API_KEY` emails print to server console (dev-testable).
- Hardcoded `'/en'` callback/redirect URLs everywhere (verification, reset, OAuth, changeEmail) — locale not propagated.
- Two independent migration systems on one DB: drizzle-kit (`src/db/migrations`) + Payload (`src/payload/migrations`, `push:false`). Never generate one system's tables from the other.
- `deleteUser` guarded only by `window.confirm` (relies on BA fresh-session requirement).
- **Env vars (reader auth + system):** `DATABASE_URL` (+`DATABASE_DIRECT_URL` for drizzle-kit), `BETTER_AUTH_SECRET` (openssl rand -hex 32), `BETTER_AUTH_URL` (canonical origin; Google redirect URI `<BETTER_AUTH_URL>/api/auth/callback/google`), `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_GOOGLE_ENABLED` (read but overridden — bug), `RESEND_API_KEY`, `RESEND_FROM_DOMAIN` (default briefasia.com), `PAYLOAD_SECRET`, `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`, `NEXT_PUBLIC_PAYWALL_ENABLED`, `BRIEFASIA_ENGINE_INTAKE_TOKEN`, `GEMINI_API_KEY`/`GEMINI_MODEL`, `CRON_SECRET`, `R2_BUCKET`/`R2_ENDPOINT`/`R2_ACCESS_KEY_ID`/`R2_SECRET_ACCESS_KEY`, `VERCEL_ENV`.

#### Reusable patterns (auth)

1. Drizzle-adapter schema mapping to custom-named tables: `drizzleAdapter(db, { provider: 'pg', schema: { user: users, session: sessions, account: accounts, verification: verifications } })` — BA runs on prefixed `auth_*` tables with no renames.
2. Fail-open auth email wrapper `sendAuthEmailSafe(context, msg)` — mail outage never rolls back user creation; verification still gates sign-in.
3. Zero-config dev email fallback: `const resend = apiKey ? new Resend(apiKey) : null` + console.log of plain-text body with clickable link.
4. Conditional OAuth provider registration: `const googleConfigured = Boolean(ID && SECRET); socialProviders: googleConfigured ? { google: {...} } : {}` — missing provider never 500s the auth server.
5. Server-session helper: `getSessionUser()` normalized to `{id,name,email,role}` + one-line `requireUser()` guard in every server action.
6. Reactive session UI without redirects: ShellProvider wraps `useSession()`; sign-in just closes the modal, consumers re-render.
7. Locked-down custom user field: `additionalFields: { role: { type:'string', defaultValue:'reader', input:false } }`.
8. Anti-enumeration forgot-password UX (same notice regardless of lookup result).
9. Single branded transactional-email template `actionEmail({heading,intro,buttonLabel,url})` → `{html,text}` reused for verify/reset/change-email.
10. `drizzle.config.ts` `.env.local` self-loader (readFileSync + regex, quote-stripping, no dotenv dependency).

### 1.2 User management

Dual user system detail: Payload `users` collection = editorial identity for `/admin` (`src/app/(payload)/admin/[[...segments]]`), fields `name` + `role` select (author|editor|admin, default author). Better-Auth `auth_users` = readers; nothing ever assigns any role other than `'reader'` (`'pro'` entirely unused; Payload roles are a separate 3-value select). RBAC in Payload is inline per-collection closures — no shared helper; `src/payload/collections/Articles.ts` (access at lines 408-419): read public; create author+; update editor/admin full or author restricted via query constraint `{"author.user": {equals: req.user.id}}`; delete admin only. SponsorSlots admin-only writes; EngineConflictLog read editor/admin, create false. **Users collection weaknesses (do not port):** read = any logged-in Payload user; update = admin-or-self with no field-level access on `role` → an author could self-escalate.

Preferences are client-only: theme localStorage `'briefasia-theme'` (`src/components/theme-provider.tsx`, sets `document.documentElement.dataset.theme`); language = URL `[locale]` segment + localStorage `'briefasia-lang'` (`src/lib/i18n.tsx`); guest read meter localStorage `'briefasia-read-ids'` (`src/lib/shell.tsx`). Per-user server-side state = Drizzle tables in `src/db/schema/account.ts`: `bookmarks` (user_id+article_id unique `bookmarks_pk`), `reading_queue` (position int — **schema exists, zero UI/actions**), `reading_history` (read_at, scroll_depth 0-100 — scroll_depth never written non-zero), `follows` (follow_type `'pillar'|'country'`, target slug stored in legacy-named `pillar_id` column), `newsletter_subscriptions` (email+newsletter_id unique, user_id nullable SET NULL FK), `pending_newsletter_confirmations` (**dead code**), `search_queries`, `article_views`, `captured_emails` (+ deprecated `ui_translations` in `translations.ts`). `article_id`/`pillar_id` are plain text — no Drizzle FK to Payload tables (app-level integrity).

Additional key files: `src/app/api/engine/intake/route.ts` (Bearer `BRIEFASIA_ENGINE_INTAKE_TOKEN`, `timingSafeEqual` length-guarded, `payload.create` bypasses access control, sets `origin:'engine'`).

Gotchas: hardcoded COUNTRIES list (12 slugs) in `account-tabs.tsx` FollowingTab, not fetched from CMS; `listNewsletterSubs`/`setNewsletter` key on EMAIL not userId → changeEmail orphans subs; follows recorded but never consumed by any feed; Payload Users `verify:false` and 2FA is only a description string.

#### Reusable patterns (user management, deduped vs 1.1)

1. `toShellUser` bridge: map `useSession()` payload to the app-level User type once at provider level; all client components consume one context.
2. Payload owner-scoped update access returning a query constraint instead of boolean (Articles.ts pattern above).
3. Idempotent first-admin seed (`scripts/seed-payload.ts` step 0): find by `SEED_ADMIN_EMAIL`, create with role admin + overrideAccess, else update password — safe on every deploy.
4. Payload-cookie gate for Next route handlers (`src/app/preview/route.ts`): `const { user } = await payload.auth({ headers: request.headers })`.

### 1.3 Reading features

Articles live in Payload `articles` (localized title/slug/dek/body/imageLabel; drafts; taxonomy pillar→subSection + secondarySections + country/countries + tags + sectors + author/coAuthors; flags sponsored/aiAssisted/affiliate/deepDive/pinnedToLatest/breaking; engine-contract origin/editedByHuman/lockedFields/version). **Paywall is soft, client-only, disabled by default:** requires `NEXT_PUBLIC_PAYWALL_ENABLED==='true'`; `hitPaywall = articlesRead > 3 && !user && !sponsored` with the 3 **hardcoded** in `src/components/article/article-content.tsx`; meter is localStorage `'briefasia-read-ids'` (never expires despite "resets monthly" copy); card appended AFTER full body; CTA links `/pro` which 404s. Newsletters: single opt-in only (`confirmed_at` defaults to `now()`); Resend used ONLY for auth emails — no newsletter sending code. Search is Postgres `like` on title+dek (no Meilisearch; Meilisearch/OG hooks are logged TODO stubs in `src/payload/hooks/revalidate.ts`).

#### Key files (reading)

| Path | Purpose |
|---|---|
| `src/payload/collections/Articles.ts` | Full article collection incl. engine-contract fields; afterChange `revalidateArticle`; preview → `/preview?slug=` |
| `src/db/schema/account.ts` | Reader-state tables (full list in 1.2) |
| `src/lib/account-actions.ts` | `toggleBookmark`/`removeBookmark`/`isBookmarked`, `recordView` (upsert reading_history on userId+articleId), `clearHistory`, `recordArticleView` (article_views analytics, best-effort, **no dedupe**), `captureEmail(email, source)`, `toggleFollow('pillar'\|'country', slug)`, `setNewsletter`/`isSubscribed` (email-keyed), `subscribeGuest` (single opt-in) |
| `src/app/(reader)/[locale]/account/[[...tab]]/page.tsx` | Tabs saved\|history\|following\|newsletters\|settings (default saved); published-only `getArticlesByIds` hydration |
| `src/components/account/account-tabs.tsx` | Optimistic remove/clear + `router.refresh()`; NewslettersTab toggles |
| `src/components/article/article-content.tsx` | Mount: `incrementRead` + `recordArticleView` (skips sponsored) + `recordView`/`isBookmarked` when logged in; Save button (guest → openAuth); ShareRail; non-functional ListenControl; MostReadRail mislabeled (renders related titles) |
| `src/components/article/paywall.tsx` | Soft card, demo copy "read your 3 free articles this month", CTA `/pro` (missing route) |
| `src/app/(reader)/[locale]/article/[slug]/page.tsx` | RSC revalidate=60; draftMode → `getArticleBySlugDraft`; `ensureArticleTranslation` (Gemini write-through **during GET**) then `getArticleBySlug`; `getRelatedArticles(article,4,locale)` |
| `src/lib/payload-server.ts` | server-only Payload singleton + unstable_cache layer; tags `articles:all`, `pillars:all`, `subsections:all`, `wire-drops`, `market-snapshots`, `corrections:all`, `newsletters:all`; `getArticlesByIds`, `getPinnedLatest`/`getBreakingArticles` (fail-open), `searchArticles` (Postgres like) |
| `src/lib/article-view.ts` | `toArticleView` adapter; defensive `localizedText`/`parsePillarTitle` JSON-blob parsers; `kickerFor` |
| `src/lib/most-read.ts` | `getMostRead(windowHours, limit, locale)`: article_views group-by over rolling window, sponsored filtered; tags `['article-views','articles:all']` |
| `src/lib/trending.ts` | `getTrending`: 7d search_queries minus TrendingBlocks blocklist, padded with recent tags |
| `src/app/(reader)/[locale]/search/search-action.ts` | `runSearch`: fire-and-forget insert search_queries (≥3 chars, sliced 200) then `searchArticles` |
| `src/components/subscribe-button.tsx` | FLAGSHIP='morning-brief'; logged-in → `setNewsletter`; guest → `subscribeGuest` (captured_emails source 'subscribe-button') |
| `src/components/home/newsletter-cta.tsx` | ONLY `captureEmail(email,'newsletter-cta')` — does NOT subscribe |
| `src/payload/collections/Newsletters.ts` | name, slug, cadence, description, vertical (rel pillars), active, order; public read |
| `src/lib/ai-translate.ts` | Gemini client (`GEMINI_API_KEY`, `GEMINI_MODEL` default gemini-2.5-flash): translateText/Batch/Lexical, retry backoff |
| `src/lib/article-i18n.ts` | `translateRecentArticles`: eager title+dek translation, carries English slug per-locale |
| `src/app/api/cron/translate-articles/route.ts` | Bearer `CRON_SECRET`, vercel.json `*/30 * * * *`, region sin1 |
| `src/lib/locales.ts` | 8 active locales vs 20-locale superset in middleware/payload.config |
| `src/lib/messages.ts` | Static chrome dicts `src/messages/{vi,id,th,ja,ko,zh-hant,zh-hans}.json` |
| `src/components/ui/language-switcher.tsx` | js-cookie `NEXT_LOCALE` (365d) — informational only, middleware ignores it |
| `src/components/ui/language-banner.tsx` | cookie `'briefasia-suggested-locale'` / navigator.languages; dismissal sessionStorage `'lang-banner-dismissed'` |
| `src/components/article/article-body.tsx` | Lexical renderer; splitBody injects middle sponsored DisclosureBox (top/middle/bottom) |
| `src/components/pillar/pillar-content.tsx` | Sub-tabs from CMS subsections; Load more via server action; `ARTICLES_PAGE_SIZE=21` |
| `src/app/(reader)/[locale]/[pillar]/load-more-action.ts` | `loadArticlesPage` → `getArticlesPage(pillarSlug, page, 21, locale)` |
| `src/payload/hooks/revalidate.ts` | afterChange/afterDelete → `revalidateTag('articles:all')` etc.; `context.disableRevalidate` opt-out; Meilisearch/OG TODO stubs |
| `src/app/(reader)/[locale]/page.tsx` | Homepage: getRecentArticles(40) + getPinnedLatest + getMostRead(24,6) + getTrending(6) |

#### Flows (reading) — condensed

- **Save:** Save button → guest: `openAuth()`; logged-in: optimistic setSaved + `toggleBookmark(articleId)` → `/account` saved tab via `listBookmarks` → `getArticlesByIds` (published only).
- **History:** ArticleContent mount → `recordView(article.id)` upsert (`onConflictDoUpdate readAt=now`) → history tab (last 50); `clearHistory()` deletes all.
- **Guest meter:** mount → `incrementRead(id)` → localStorage `'briefasia-read-ids'` Set → paywall card after full body when over threshold.
- **Most Read:** `recordArticleView(id)` per load (no dedupe) → homepage `getMostRead(24,6,locale)`.
- **Follows:** `toggleFollow` writes rows; **nothing consumes follows** for any feed.
- **Newsletter:** header SubscribeButton guest → `subscribeGuest` (immediate subscribe, single opt-in); account tab → `setNewsletter`; homepage CTA only captures email.
- **Cache bust:** CMS save / engine intake → afterChange → `revalidateTag('articles:all')` busts every cached article surface.

#### Gotchas (reading)

- `reading_queue` and `pending_newsletter_confirmations` tables have ZERO code paths.
- `ensureArticleTranslation` performs DB writes during GET renders; in-process `translationLocks` Map only (multi-instance can double-translate).
- `articles.slug` is localized AND required+unique — every per-locale write must re-send the English slug.
- Guest localStorage meter and logged-in Postgres history are **never merged on sign-in**.
- Fail-open `getPinnedLatest`/`getBreakingArticles` exist because migrations are gated to `VERCEL_ENV=production` (`scripts/migrate-prod.mjs`); preview builds prerender before columns exist.
- Legacy localized JSON blobs (`'{"en":…,"vi":…}'`) require the defensive parsers in `article-view.ts`.
- Account lists filter through published-only `getArticlesByIds` — unpublishing silently removes items from saved lists (orphan rows remain).
- `share-bar.tsx` / `audio-player.tsx` are dead code; ListenControl is a fake demo.

#### Reusable patterns (reading)

1. unstable_cache + revalidateTag contract: every query helper declares a tag set; each collection's afterChange busts exactly those tags; `context.disableRevalidate` + try/catch for out-of-request callers.
2. `toArticleView` adapter: normalize Payload depth-0/1 relationship unions into flat client-serializable view models; body excluded from list views.
3. Taxonomy-overlap related ranking: 24-doc OR-pool, score in JS (+5 country / +2 tag / sector +2 cap 4 / +3 primary pillar / section +1 cap 3), recent-in-pillar top-up; cache keyed on primitive args.
4. Optimistic server-action toggles: setState immediately, `void serverAction()`, reconcile with `router.refresh()`.
5. `translateLexical` AST walk: structuredClone, collect text nodes, ONE batched JSON-array Gemini call, write back in place.
6. Inline-and-race background work (`ensureArticleTranslation`): title/dek inline, body raced vs 9s timeout, overrun finishes in background served by next revalidate.
7. Fail-open column guard: try/catch + warn + return empty for queries on newly-migrated columns.
8. Chrome-vs-content i18n split: static JSON dicts + three-tier `t()` (dict → inline curated → English) for chrome; Payload localization + AI translation for content.
9. Stable pagination tiebreaker: sort `['-publishedAt','-id']` + client dedupe-by-id on append.
10. Guest email capture funnel: single `captureEmail(email, source)` into one `captured_emails` table with source tags.

---

## 2. dtw-web current state (as of 2026-07-03)

Turborepo monorepo (pnpm@10.14.0, Node>=22): `apps/web` = Next.js 15.4.11 + React 19 + embedded Payload 3.85; `packages/db` = Drizzle 0.39; `packages/ui`; `packages/config`.

### What EXISTS

- **DB layer fully prepared, completely unwired.** `packages/db/src/schema/auth.ts` defines Better-Auth-shaped tables (`auth_users` with pgEnum `auth_user_role ['reader','pro','author','editor','admin']`, `two_factor_secret`/`two_factor_enabled`; `auth_sessions`; `auth_accounts` (password nullable); `auth_verifications`). `packages/db/src/schema/account.ts` defines `bookmarks` (unique `bookmarks_pk`), `reading_queue` (position int), `reading_history` (scroll_depth), `follows`, `newsletter_subscriptions`, `pending_newsletter_confirmations`. All in applied migration `packages/db/migrations/0000_third_ender_wiggin.sql`; auto-applied on prod deploys via `apps/web/scripts/migrate-prod.mjs` (`VERCEL_ENV=production` gate, `DATABASE_DIRECT_URL`, drizzle-kit migrate then payload migrate). `article_id`/`pillar_id` are plain text (no FK to Payload tables by design; Payload ids are numeric — store as `String(a.id)`).
- **Polished UI stubs:** `apps/web/src/lib/shell.tsx` (in-memory user + in-memory meter, ref-Set dedupe, resets on reload); `apps/web/src/components/auth-modal.tsx` (magic-link form + Google/Apple/GitHub buttons, `demoLogin()` fabricates a user, full `useT()` i18n triples); `apps/web/src/app/(reader)/account/[[...tab]]/page.tsx` (client page, 5 mock tabs saved/history/following/newsletters/settings — **'Read later' tab missing vs spec**); `apps/web/src/components/header.tsx` (nudge banner `NUDGE_KEY='dtw-nudge-dismissed'`, `showNudge = articlesRead >= 3 && !user`, spec-exact copy); `apps/web/src/components/article/article-content.tsx` (`hitPaywall = articlesRead > 3 && !user && !article.sponsored` — hardcoded 3, invariant #4 violation; note `>=` vs `>` inconsistency with header); `apps/web/src/components/article/paywall.tsx` (demo $12/mo card, `/pro` 404).
- **Working editorial auth:** `apps/web/src/payload/collections/Users.ts` (Payload email+password, roles author/editor/admin only, `verify:false`); header comment documents the deferred Better-Auth reconciliation. `apps/web/payload.config.ts` = 10 collections.
- **Data conventions:** `apps/web/src/lib/payload-server.ts` (server-only singleton, unstable_cache tags `articles:all`/`pillars:all`/`wire-drops`/`corrections:all`, `getPinnedLatest` fail-open pattern); `apps/web/src/payload/hooks/revalidate.ts`; `apps/web/src/lib/article-view.ts` (`toArticleView`, `String(a.id)` coercion, asia→latest legacy fallback); server actions `(reader)/[pillar]/load-more-action.ts`, `(reader)/search/search-action.ts`.
- **i18n:** client-side only — `apps/web/src/lib/i18n.tsx`, localStorage `'dtw-lang'`, `useT()(en, vi, id)` inline-triple in EVERY user-facing string, dates pinned Asia/Singapore. NOT subpath routing yet.
- **Layout boundary:** providers (I18n/Theme/Shell + AuthModal + SearchOverlay) live in `apps/web/src/app/(reader)/layout.tsx` ONLY — `/admin` must never mount them.
- **Env contract** (`/.env.example`, marked "Phase E2"): `DATABASE_URL`+`DATABASE_DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`/`SECRET`, `APPLE_CLIENT_ID`/`TEAM_ID`/`KEY_ID`/`PRIVATE_KEY`, `GITHUB_CLIENT_ID`/`SECRET`, `RESEND_API_KEY`, `RESEND_FROM_DOMAIN='dailytechwire.com'`, `PAYLOAD_SECRET`, `SEED_ADMIN_EMAIL`/`PASSWORD`, `DTW_INTAKE_TOKEN`, `R2_*`.
- **Service-auth pattern worth copying:** `apps/web/src/app/api/engine/intake/route.ts` (Bearer `DTW_INTAKE_TOKEN`, `timingSafeEqual` length-guarded).
- **Specs:** `process/context/auth/all-auth.md` (magic-link primary, Resend subject 'Sign in to DailyTechWire' 15-min single-use, modal-first no /login page, session cookie httpOnly/secure/SameSite=Lax rotating on privilege change); `process/features/account/_GUIDE.md` ('Check your inbox' + 30s resend countdown, `/auth/callback`, first magic link creates account role Reader, Read-later FIFO reorderable, GDPR/PDPA delete, IndexedDB↔DB merge rules); `process/features/articles/_GUIDE.md` (cookie `'dtw-read-count'` for guests, `reading_history` for users, threshold NEVER hardcoded); `process/context/database/all-database.md` (Better-Auth owns users+sessions; Payload does NOT own auth).

### What is MISSING

- `better-auth` NOT installed (absent from every package.json AND pnpm-lock.yaml).
- `@dtw/db` imported by ZERO files in `apps/web/src` (tables are dead schema; `packages/db/src/client.ts` throws at import if `DATABASE_URL` unset).
- No `apps/web/src/lib/auth.ts`, no `src/app/api/auth/[...all]/route.ts`, no `/auth/callback`, no `middleware.ts` at all, no server-side session, no real server actions for bookmarks/history/follows/queue, no Newsletters Payload collection (only a fixture in `apps/web/src/lib/data.ts`), no cookie meter, no Read-later tab, no email lib.
- Role-case mismatch pending reconciliation: Drizzle enum lowercase vs `shell.tsx` Capitalized union (`'Reader'|'Pro'|'Author'|'Editor'|'Admin'`) vs Payload lowercase 3-value select.
- One active general plan exists (`process/general-plans/active/human-ops-launch_PLAN_30-05-26.md`) — editorial publishing, not auth.

---

## 3. Port map

### 3.1 Feature map

| # | Feature | brief-asia source | dtw adaptation | Effort |
|---|---|---|---|---|
| 1 | Better-Auth server foundation | `src/lib/auth.ts` (drizzleAdapter schema map, role additionalField input:false, session 7d/1d, nextCookies() last, sendAuthEmailSafe, conditional socialProviders); `src/app/api/auth/[...all]/route.ts` | Install better-auth in apps/web. Create `apps/web/src/lib/auth.ts` importing tables from `@dtw/db`. Port verbatim: adapter map, role field, sendAuthEmailSafe, conditional providers, nextCookies() last. KEEP emailAndPassword AND add magicLink plugin (per decision 1); add GitHub alongside Google; Apple env-gated OFF. Mount `apps/web/src/app/api/auth/[...all]/route.ts` verbatim. | M |
| 2 | Auth client + email infra | `src/lib/auth-client.ts`; `src/lib/email.ts` | `apps/web/src/lib/auth-client.ts` near-verbatim + magicLinkClient plugin. `apps/web/src/lib/email.ts`: port Resend-or-console fallback + actionEmail verbatim; rebrand FROM `DailyTechWire <no-reply@${RESEND_FROM_DOMAIN \|\| 'dailytechwire.com'}>`, dtw tokens (terracotta #D4623C, navy #1B2A52). Keep fail-open semantics. | S |
| 3 | Signup/login UI (modal) | `src/components/auth-modal.tsx` (mode state machine, signIn.social, anti-enumeration copy) | dtw already has the target UI (`apps/web/src/components/auth-modal.tsx`): keep markup/copy/tokens, replace `demoLogin()` with `authClient.signIn.magicLink({email, callbackURL})` → 'Check your inbox' + 30s resend countdown (new-build), password mode ported from brief-asia, `signIn.social` per provider. Gate buttons on `NEXT_PUBLIC_*_ENABLED` mirrors of server conditionals (fix hardcoded-true bug). No /login page. All new strings via `t(en, vi, id)`. | M |
| 4 | Session handling | `src/lib/account.ts` getSessionUser(); `src/lib/shell.tsx` toShellUser bridge | Port getSessionUser + requireUser verbatim into `apps/web/src/lib/session.ts` (server-only). In `apps/web/src/lib/shell.tsx` replace in-memory user with `useSession()` + toShellUser (fixes role-case mismatch); Log out → `signOut()`. Highest-leverage single change. | S |
| 5 | Route protection | `src/middleware.ts` (i18n-only, NO auth); per-page gating; `src/app/preview/route.ts` payload.auth gate | Per decision 6: NO middleware.ts in Phase 1. Per-page (getSessionUser in RSC → inline sign-in prompt, no redirect) + per-action (requireUser in every server action). Port payload.auth preview gate if/when draft preview lands. | S |
| 6 | RBAC / Payload bridge | `src/payload/collections/Users.ts`; `src/payload/collections/Articles.ts` access closures | NO PORT for Phase 1 — per decision 5 the stores stay disjoint; /admin reconciliation + editor 2FA deferred (columns stay dormant). Do NOT port Users read=any-logged-in / role self-update weaknesses; add field-level access on `role` if touching dtw Payload access. | S |
| 7 | Account page + settings | `src/app/(reader)/[locale]/account/[[...tab]]/page.tsx` (force-dynamic RSC, Promise.all, getArticlesByIds); `src/components/account/account-tabs.tsx` | Convert `apps/web/src/app/(reader)/account/[[...tab]]/page.tsx` to force-dynamic RSC (brief-asia shape); add `getArticlesByIds` to `apps/web/src/lib/payload-server.ts` (article hydration cached per tag discipline; per-user lists uncached). Keep dtw tab UI/i18n; ADD Read-later tab over `reading_queue` (new work, client-ordering-wins). SettingsTab: changeEmail + deleteUser (GDPR/PDPA; cascades in migration 0000); changePassword stays for password accounts. | L |
| 8 | Bookmarks + history | `src/lib/account-actions.ts` (requireUser-gated toggles, recordView upsert, clearHistory); reads in `src/lib/account.ts`; article-content Save button | Port near-verbatim into `apps/web/src/lib/account-actions.ts` ('use server') importing `@dtw/db/client` (first runtime usage — server-only discipline). Article ids as `String(a.id)`. Wire dtw Save button → toggleBookmark (guest → openAuth). recordView doubles as DB-side paywall meter. Skip `article_views`/`search_queries` analytics tables Phase 1 (PostHog planned; don't add schema dtw-engine doesn't expect). | M |
| 9 | Paywall meter + nudge | `src/lib/shell.tsx` meter mechanics + `src/components/article/paywall.tsx` — pattern reference ONLY | REDESIGN, don't port (brief-asia violates invariant #4 three ways). Guest meter in cookie `'dtw-read-count'` (monthly expiry, deduped by article id); logged-in meter from `reading_history`; threshold from Payload Global `paywallThreshold` busted via revalidateTag (decision 2), passed as prop from RSC into ShellProvider; unify `>=` vs `>`; rewrite paywall.tsx to sign-in-nudge copy, delete $12/mo card + /pro link. Keep dtw nudge banner as-is. | M |
| 10 | Newsletter opt-in | `src/lib/account-actions.ts` setNewsletter/subscribeGuest/captureEmail; `src/components/subscribe-button.tsx`; NewslettersTab | Port setNewsletter/isSubscribed for logged-in toggles (verified session email → immediate ok). Guests: NOT single opt-in — implement double opt-in via `pending_newsletter_confirmations` (guest email → pending row + token → actionEmail → `GET /api/newsletter/confirm?token` → subscription row). Key on user_id when session exists (fix email-key gotcha). Needs a Payload Newsletters collection (port brief-asia shape, seed dtw's 6). | M |
| 11 | Anonymous → logged-in merge | NONE — brief-asia never merges guest state (documented gotcha) | New work per `process/features/account/_GUIDE.md`: on first session, merge anonymous saves into bookmarks (server wins), fold `'dtw-read-count'` cookie into logged-in meter, clear guest state. One-shot server action triggered from ShellProvider on null→user transition. IndexedDB/PWA sync deferred. | M |

### 3.2 Architecture decisions — RESOLVED by the user (verbatim)

USER-CONFIRMED DECISIONS (bake these into every plan, do not relitigate):
1. Auth methods = magic link (primary CTA, per dtw spec) AND email+password (ported from brief-asia, incl. forgot/reset-password flow via Resend) AND OAuth. OAuth: Google + GitHub live in Phase 1; Apple ships env-gated OFF via the conditional-provider pattern (enable later when Apple Developer credentials exist).
2. Paywall threshold source = Payload Global (e.g. 'paywallThreshold' on a settings global), cache-busted via revalidateTag. NOT PostHog (not deployed), NEVER hardcoded. This resolves the spec conflict between invariant #4 and articles/_GUIDE.md.
3. Plans only for now — no implementation. Each phase later requires its own explicit EXECUTE approval per RIPER-5.
4. Auth/transactional emails are English-only at launch (note as follow-up; UI chrome strings all go through t(en, vi, id)).
5. Better-Auth reader identities stay fully disjoint from Payload editorial 'users' (both repos document this deliberate split). /admin reconciliation and editor 2FA are explicitly deferred — out of scope for all 5 phases.
6. No middleware.ts in Phase 1: enforcement is per-page (getSessionUser in RSC, inline sign-in prompt) and per-action (requireUser in every server action), the brief-asia pattern.
7. packages/db is shared with dtw-engine: schema changes must be additive only, via pnpm db:generate with committed SQL; Better-Auth CONFIG lives in apps/web/src/lib/auth.ts, only table definitions live in @dtw/db.
8. DO NOT port brief-asia's known bugs: hardcoded googleEnabled=true, double verification email on signup, email-keyed newsletter subs (key on user_id when session exists), Payload Users role self-escalation, per-pageload view counting without dedupe.

**Smaller details still open (decide at plan time, not blockers):** cookie stores a count vs deduped id-list; "resets monthly" = calendar month vs rolling 30 days; whether the merged guest read-count resets on signup (recommended: reset — signing up is the nudge's success state); build auth callbacks through a single `authCallbackUrl(path)` helper so the future `/en /id /vi` subpath migration is one-line (brief-asia hardcodes `'/en'` everywhere — do not repeat).

### 3.3 Phase outline (plans only; each phase needs its own EXECUTE approval)

1. **Phase 1** — Auth foundation: better-auth install, `lib/auth.ts` + `lib/email.ts` + `lib/auth-client.ts` + `api/auth/[...all]` mount, real auth-modal (magic link + password + OAuth), shell.tsx useSession bridge, `lib/session.ts`. No schema changes.
2. **Phase 2** — Account data layer: account-actions + reads, `getArticlesByIds`, /account RSC conversion, Save button + recordView wiring. (depends on 1)
3. **Phase 3** — Paywall meter + nudge compliance (invariant #4): cookie meter, Payload Global threshold, unify comparisons, rewrite paywall copy, guest-state merge. (depends on 2)
4. **Phase 4** — Settings, account deletion (GDPR/PDPA), Read-later queue tab. (depends on 2)
5. **Phase 5** — Newsletters: Payload collection + double opt-in confirm flow + header/homepage funnels. (depends on 1; UI parts on 2)

### 3.4 Risks

1. **Migration-system collision:** Drizzle (`packages/db/migrations`) and Payload (`apps/web/src/payload/migrations`) share one Postgres DB with disjoint tables. New Drizzle tables keep the `auth_*`/reader prefix convention, never touch Payload-managed names; a Payload Global goes through Payload migrations, a Drizzle column change through drizzle-kit — mixing corrupts a journal. `migrate-prod.mjs` runs ONLY on `VERCEL_ENV=production` over `DATABASE_DIRECT_URL`: preview builds prerender against the old schema — every new-column query needs the `getPinnedLatest` fail-open try/catch pattern.
2. **packages/db is shared with dtw-engine:** additive changes only; `auth_user_role` enum values are effectively frozen (BA role strings, shell.tsx capitalization bridge, Payload's separate 3-value select all encode them).
3. **ISR/caching of personalized content:** never call getSessionUser inside an unstable_cache'd helper; per-user reads stay in client components (useSession via ShellProvider) or explicitly force-dynamic routes (/account); cookies in middleware would break CDN cacheability.
4. **Session cookie / BETTER_AUTH_URL domain:** preview deployments (*.vercel.app) have different origins — OAuth redirect URIs (`<BETTER_AUTH_URL>/api/auth/callback/{provider}`) and magic links won't round-trip on previews; plan auth-only-on-prod-and-localhost or per-env BETTER_AUTH_URL. `nextCookies()` must remain LAST in the plugin chain (magicLink plugin insertion is the likely regression point).
5. **Magic link is new-build, not a port:** brief-asia has ZERO magic-link code. Token expiry (15 min), single-use enforcement, resend throttling, account-created-on-first-link (role 'reader') are untested — highest-defect-risk item despite looking smallest.
6. **Apple OAuth is materially harder:** JWT client-secret from `APPLE_TEAM_ID`/`KEY_ID`/`PRIVATE_KEY`, name only on first authorization, form_post redirect — hence env-gated OFF in Phase 1 (decision 1).
7. **Import-time env throws:** `@dtw/db/client` and payload.config.ts throw without `DATABASE_URL` — enforce `server-only` imports on every new db-touching module.
8. **Do not port brief-asia's known bugs** (see section 4) — cheap to avoid now, expensive to unwind.
9. **Role-case mismatch is load-bearing:** Drizzle lowercase enum vs shell.tsx Capitalized union vs Payload 3-value select — centralize role checks in one helper from day one; wrong-casing comparisons fail silently.
10. **Account RSC conversion touches provider layering:** ShellProvider/AuthModal live in `(reader)/layout.tsx` only (never under /admin); the server-gated /account still needs a client island for `useShell().openAuth` — easy to break the boundary or double-mount the modal.
11. **i18n gaps:** every new string in confirm pages/queue tab goes through `t(en,vi,id)`; auth EMAILS are English-only at launch per decision 4 (tracked follow-up).
12. **RIPER-5 process:** 5-phase program touching schema-adjacent code — must run as a phase program (umbrella plan + per-phase plans in `process/features/account/active/`), not one mega-execute.

---

## 4. Known brief-asia bugs that must NOT be ported

Per user decision 8 (verbatim list above), with file anchors:

1. **Hardcoded `googleEnabled = true`** in `src/components/auth-modal.tsx` (env gate `NEXT_PUBLIC_GOOGLE_ENABLED` commented out) — button renders even when the server built `socialProviders: {}` → runtime error on click. Fix: gate each provider button on a `NEXT_PUBLIC_*_ENABLED` var mirroring the server conditional.
2. **Double verification email on signup** — `emailVerification.sendOnSignUp: true` (server) AND the modal's explicit `authClient.sendVerificationEmail()` both fire. Pick one path.
3. **Email-keyed newsletter subscriptions** — `listNewsletterSubs`/`setNewsletter` key on email, so `changeEmail` silently orphans subs (`newsletter_subscriptions.user_id` is only SET NULL on delete). Fix: key on `user_id` when a session exists.
4. **Payload Users role self-escalation** — Users collection update = admin-or-self with no field-level access on `role`; an author could self-escalate. Fix: field-level access on `role` (and don't port read = any-logged-in).
5. **Per-pageload view counting without dedupe** — `recordArticleView` inserts an `article_views` row on every non-sponsored client mount; refreshes inflate Most Read. (dtw skips these analytics tables in Phase 1 anyway — PostHog planned.)

Also do not replicate (covered by the redesigns above, listed for completeness): localStorage guest meter that never expires despite "resets monthly" copy + hardcoded `> 3` threshold + `NEXT_PUBLIC_PAYWALL_ENABLED` gate (violates dtw invariant #4); single opt-in guest newsletter subscribe (`subscribeGuest` with `confirmed_at` defaulting to now — dtw requires double opt-in); hardcoded `'/en'` locale in every auth callback/redirect; `/pro` CTA linking to a nonexistent route; dead `reading_queue`/`pending_newsletter_confirmations` schema left unwired (dtw builds real UI/flows over both).
