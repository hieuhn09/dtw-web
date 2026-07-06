# dtw-web - All Infrastructure

Last updated: 2026-05-28

Attach this file when the task touches deployment, hosting, CDN, ISR, image / video pipelines, analytics, email delivery, or compliance.

---

## What This Covers

- Hosting topology (Vercel + Railway/Fly + Cloudflare)
- ISR + `revalidateTag` strategy (the single revalidation path)
- Image / video pipelines (R2 + CF Images + Mux / CF Stream)
- Email (Resend + React Email + double opt-in)
- Analytics (PostHog self-host)
- Performance targets + how we measure them
- Compliance (GDPR + PDPA Singapore + Vietnam Nghị định 13)
- Environment variable layout

Does NOT cover the Content Engine's own infra (separate repo) or Stripe billing infra (Phase 2 — see `integrations/`).

## Read This When

- Deciding where a new service should live
- Adding a revalidation tag or an `afterChange` side-effect
- Touching `next.config.ts` image domains
- Wiring email send / cron
- Setting up a new env var
- Hitting a Lighthouse regression

---

## Hosting Topology

| Service | Host | Why |
|---|---|---|
| `dtw-web` (Next.js reader + embedded Payload `/admin`) | **Vercel** | App Router, ISR, edge runtime, image optimization first-party. |
| `dtw-engine` (Content Engine) | **Railway** or **Fly** | runs long, polls sources, calls LLMs, writes via Payload API |
| `dtw-workers` (BullMQ workers — OG gen, email queue, search reindex backfill) | **Railway** or **Fly** | persistent Node processes |
| **Postgres 16** | (TBD — Neon / Supabase / Railway / self-host) | decision deferred to scaffold phase |
| **Redis** | **Upstash** | serverless-friendly, pairs with BullMQ |
| **Meilisearch** | self-host on Fly or Meili Cloud | decision deferred until index code lands |
| CDN + WAF | **Cloudflare** | sits in front of everything |
| R2 (object storage) | **Cloudflare** | original images / video files |
| Image CDN | **Cloudflare Images** | AVIF + WebP transforms, srcset variants 320 / 640 / 1024 / 1920 |
| Video | **Mux** or **Cloudflare Stream** | HLS adaptive |
| Email | **Resend** | newsletters + magic links + transactional |
| Analytics | **PostHog** (self-host) | first-party, GDPR-friendly. Session replay + feature flags included. |

Payload `/admin` is embedded in the same Next.js app on Vercel — not a separate deploy. That keeps the Engine ↔ Payload API contract internal to one host.

---

## ISR + Revalidation (single source of truth)

There is ONE revalidation path: the Payload `afterChange` hook (documented in `database/all-database.md`).

The hook calls `revalidateTag(...)` for:

- `article:{id}` (every article gets its own tag)
- `pillar:{slug}` (article participates in its pillar listing)
- `subsection:{slug}` (if subsection set)
- `home-hero` (only if pinned as hero)
- `wire-drops` (for the homepage realtime band — Wire Drops use ISR + WebSocket layered)

Pages must call `unstable_cache` / `fetch` with the matching `next.tags` array to participate. Homepage uses both ISR (`revalidate: 60`) AND the tag set, so we have a "self-healing within 60s" floor even if a tag misses.

**News sitemap regenerates every 15 minutes.** Set via cron route handler or Vercel cron. RSS is per-pillar / per-author / per-tag and regenerates on `revalidateTag`.

---

## Media Pipeline

### Images

1. Editor uploads to Payload media upload
2. Original lands in R2
3. Cloudflare Images is fronted by `next/image` loader — variants generated lazily
4. AVIF + WebP, srcset breakpoints: 320 / 640 / 1024 / 1920
5. Hero images use LQIP (low-quality image placeholder) — design's `Placeholder` shows the diagonal stripe pattern while the real image loads
6. `next/image` `sizes` attribute mandatory (CLS < 0.05 target)

### Video

- Mux or Cloudflare Stream (decide during first video upload)
- HLS adaptive, autoplay muted **only when user opts in**
- Source MP4 lives in R2; the streaming host produces the HLS variants

### OG images

- Auto-generated on every article publish
- 1200 × 630 OG card per article — title + pillar tag + cover-art composition
- Queued via BullMQ from the `afterChange` hook
- Cached on Cloudflare

---

## Email Pipeline

- **Provider:** Resend. React Email templates in `apps/web/src/emails/`.
- **Double opt-in** mandatory on all newsletter signups.
- **6 newsletters Y1:** AM Brief, PM Brief, AI Weekly, Asia Funding Weekly, Dev Digest, Products Deals. Segments stored on the user record.
- **Magic link emails:** see `auth/all-auth.md`. Sent through the same Resend domain.
- **Transactional:** correction notifications (Phase 2), purchase receipts (Phase 2).

DKIM + SPF + DMARC on `dailytechwire.com` before any send.

---

## Realtime (Wire Drops)

- **Soketi** (self-host) or **Pusher** (managed) — decide during Wire Drops implementation.
- Single channel: `wire-drops`. Payload broadcasts on `WireDrop` collection `afterChange`.
- Homepage subscribes via WebSocket and prepends new drops with a slide-in animation.
- Each drop ≤ 150 chars + timestamp + city chip.

---

## Analytics & Measurement

**PostHog (self-host).** First-party JS snippet, no third-party trackers. What we track:

- Page views, scroll depth, time on page
- Pillar engagement, save / share / follow events
- Search queries (especially **zero-result** — feeds editorial planning)
- Paywall meter events (visit count, nudge shown, nudge dismissed, sign-in clicked)
- Feature flags — used for paywall meter threshold (the `3` is a flag, not a constant)

Session replay enabled for `Editor` / `Admin` only by default, with explicit consent.

---

## Performance Targets

These ship in CI as a regression gate:

| Metric | Target | Where |
|---|---|---|
| LCP | < 1.5s | mobile, p75 field |
| TTFB | < 200ms | edge response |
| CLS | < 0.05 | every page |
| INP | < 200ms | p75 |
| Lighthouse mobile | ≥ 95 | per release |
| Search p95 | < 300ms | from header search overlay to first result render |
| Wire Drop append | < 50ms | from WebSocket message to DOM commit |

**How we meet them:**

- ISR + edge cache for everything public
- LQIP + `next/image` `sizes` everywhere
- Skeleton (not spinners) for loading
- Streaming RSC for article body
- Deferred load for Related Articles row (lazy)
- Strict CSP — no inline `<script>` outside Next.js bootstrap

---

## Accessibility

- WCAG 2.1 AA
- Contrast ≥ 4.5:1 on all text (the design's `var(--muted)` rules already pass)
- `axe-core` 0 critical errors gate
- Full keyboard navigation (Tab everywhere, visible focus ring is in `index.html`: `outline: 2px solid var(--accent)`)
- ARIA labels on every interactive element without visible text (search ⌘K, dark-mode toggle, etc.)
- `prefers-reduced-motion` honored by the effects layer (TODO — currently always-on)

---

## Compliance

| Regulation | Where it bites |
|---|---|
| **GDPR** | EU readers. Cookie banner. Right-to-erase from `users` + `bookmarks` + `reading_history`. |
| **PDPA Singapore** | Default jurisdiction (Asia Press Centre Group (APCG) is registered in Singapore). |
| **Nghị định 13 (Vietnam)** | Vietnamese readers. Data minimisation + consent. |

**Cookie banner** wording (current, from design): "We use cookies to remember your login and improve the site. No ads, no tracking, no data sale." Horizontal layout (920px), single line, three sections separated by hairlines: icon + COOKIES label / message / Decline + Accept buttons. EN / VI / ID. **No dark patterns** — Decline must be visually equal in weight to Accept.

**No popups** anywhere except this cookie banner (invariant #6).

PostHog is self-hosted specifically because first-party analytics avoids GDPR cross-border transfer issues.

---

## Environment Variables (planned)

Names only — never commit values. Grouped logically.

### Auth
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`

### Database
- `DATABASE_URL` (Postgres)
- `DATABASE_DIRECT_URL` (migrations, bypassing pooler)
- `REDIS_URL` (Upstash)

### Search
- `MEILISEARCH_URL`
- `MEILISEARCH_API_KEY`
- `MEILISEARCH_PUBLIC_KEY` (browser-side, scoped)

### Media
- `CLOUDFLARE_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`
- `CF_IMAGES_ACCOUNT_HASH`, `CF_IMAGES_TOKEN`
- `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET` (or `CF_STREAM_TOKEN`)

### Email
- `RESEND_API_KEY`
- `RESEND_FROM_DOMAIN` (`dailytechwire.com`)

### Realtime
- `SOKETI_HOST`, `SOKETI_PORT`, `SOKETI_KEY`, `SOKETI_SECRET` (or `PUSHER_APP_ID` / `PUSHER_KEY` / `PUSHER_SECRET` / `PUSHER_CLUSTER`)

### Analytics
- `POSTHOG_HOST` (self-host URL)
- `POSTHOG_PUBLIC_KEY` (browser)
- `POSTHOG_PRIVATE_KEY` (server)

### Engine ↔ web
- `ENGINE_TO_PAYLOAD_API_TOKEN` (Engine authenticates to Payload API with this token, restricted to `Author` role — Engine can submit drafts but cannot publish)

### Phase 2 (not active yet)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_ID`
- `VNPAY_...`, `MOMO_...`
- `ELEVENLABS_API_KEY` or `OPENAI_TTS_API_KEY`

---

## Quick Routing

| If you need... | Read next |
|---|---|
| Engine API contract | `process/context/integrations/all-integrations.md`, `process/features/engine-integration/_GUIDE.md` |
| Auth env / OAuth setup | `process/context/auth/all-auth.md` |
| Payload `afterChange` hook | `process/context/database/all-database.md` |
| Image / cover-art behavior | `process/context/uxui/all-uxui.md` |

## Known Gaps

- Postgres host not chosen
- Meilisearch self-host vs Meili Cloud not chosen
- Soketi vs Pusher not chosen
- CI pipeline not set up (no `.github/workflows/` yet)
- `prefers-reduced-motion` integration with effects layer pending

## Cookie Consent Constraint

The cookie banner (`components/cookie-banner.tsx`) is intentionally a dismiss-only banner:
both "Decline" and "Accept" call the same `dismiss()` function and store the same
localStorage key (`dtw-cookies = "1"`). This is acceptable **only** because the site
ships NO non-essential tracking. Banner copy: "No ads, no tracking, no data sale."
Only essential cookies are set (login/auth, theme, locale).

**BINDING CONSTRAINT:** If PostHog or ANY non-essential tracking is ever added, consent
must be made real before that code ships:
- "Decline" must store a distinct value (e.g. `"0"`) that gates non-essential cookies.
- "Accept" stores `"1"` and enables non-essential cookies.
- This is required to satisfy Invariant #12 (GDPR + PDPA Singapore + Nghị định 13 Vietnam).

Do not ship analytics or third-party pixels without this change.
