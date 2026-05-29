# dtw-web - All Integrations

Last updated: 2026-05-28

Attach this file when the task touches any boundary with an external system: the Content Engine, Meilisearch, the realtime broker, Stripe / VNPay / Momo, affiliate redirect tracker, or PostHog ingestion.

---

## What This Covers

- The **Content Engine ↔ Payload API contract** — the single most important integration in this system
- Meilisearch index lifecycle
- Soketi / Pusher realtime channel(s)
- Payments (Phase 2): Stripe Billing + VNPay + Momo
- Affiliate redirect tracker
- PostHog ingestion endpoints
- Resend (covered in `infra/all-infra.md` — pointer only)

Does NOT cover the Engine's internal pipeline (separate repo) or auth provider OAuth setup (`auth/all-auth.md`).

## Read This When

- Designing or reviewing any cross-service contract
- Adding a new event that Engine publishes
- Modifying the article schema (Engine reads it!) — also see `database/all-database.md`
- Wiring up Stripe webhooks (Phase 2)
- Hitting a Meilisearch reindex bug

---

## 1. Content Engine ↔ Payload (load-bearing)

**Contract:** Engine talks to web exclusively via the **Payload REST / GraphQL API**. Engine has its own service account with role `Author`. This is invariant #1 in `all-context.md`.

### Why the constraint

If Engine writes directly to Postgres, it bypasses:

- the `afterChange` hook → no ISR revalidation → readers see stale articles
- Meilisearch upsert → search misses new content
- OG image generation → social shares break
- Conflict resolution (`lockedFields` / `editedByHuman`) → editor work silently overwritten

The only acceptable "exception" is bulk backfill (e.g. re-importing 5000 historical articles), and even then the preferred path is throttled API calls.

### Engine's permissions

`Author` role gives:

- create draft article (`_status: 'draft'`)
- update an article it previously created, subject to `lockedFields` and `editedByHuman` rules
- create / update `wire_drops` entries
- read taxonomy (Pillar / Sub-section / Tag)

Engine **cannot**:

- publish (only Editor / Admin can flip `_status: 'published'`) — except for `wire_drops` which auto-publish
- delete articles
- modify users, RBAC, sponsor slots, dashboard data sources

Auth: bearer token in `Authorization` header, token rotates quarterly. Stored as `ENGINE_TO_PAYLOAD_API_TOKEN`.

### Update flow (Engine side)

1. Engine fetches article: `GET /api/articles/:id`
2. Engine reads `version`, `lockedFields`, `editedByHuman`, current field values
3. Engine builds the patch, **excluding** any field in `lockedFields` and (heuristically) any field where the current value differs from Engine's last-known
4. Engine writes: `PATCH /api/articles/:id` with `If-Match: <version>` semantics (Payload custom endpoint)
5. If 409: Engine refetches and retries (max 3 times, exponential backoff)
6. If 200: success — the `afterChange` hook on Payload's side fires revalidate + reindex + OG gen

### Auto-publish exception: Wire Drops

`Wire Drops` (homepage realtime band, ≤ 150 chars + city + timestamp) are auto-published. Editor can still gate them retroactively (delete). On insert, the hook also broadcasts to Soketi/Pusher channel.

### What lives in `dtw-engine` repo (NOT here)

- Source crawlers, RSS pollers
- LLM summarisation pipeline
- Editorial approval queue inside the Engine (pre-Payload)
- Translation pipeline (if any source-language translation happens upstream)

This repo's job is to **receive published-ready articles** and present them.

---

## 2. Meilisearch (search index)

- **Single-source upsert path:** Payload `afterChange` hook calls `meilisearch.index('articles').addDocuments([article])` on publish, `deleteDocument(id)` on unpublish.
- **Indexed fields:** `id`, `title`, `subtitle`, `body_text` (stripped), `author_name`, `pillar`, `tags`, `published_at`, `_lang`.
- **Multi-tenant by language:** one index per locale (`articles_en`, `articles_id`, `articles_vi`) — keeps tokenisation locale-correct.
- **Also indexed:** `awards` (Y2+), `authors`, `companies` (mentioned-in articles, for entity pages — Y2+).
- **Typo tolerance:** Meilisearch default. Faceted filters: pillar, date range, type (article / award / author), language.
- **Public API key:** scoped to read-only on `articles_*` indexes — embedded in the client for the ⌘K overlay.
- **Backfill:** `pnpm --filter web reindex` (planned) — reads all published articles from Payload and pushes to Meilisearch. Idempotent.

---

## 3. Soketi / Pusher (realtime)

- **Channel:** `wire-drops` (single, public).
- **Producer:** Payload `afterChange` on `WireDrop` collection.
- **Consumer:** Homepage React client, subscribes via WebSocket. New drops prepended with slide-in.
- **Reconnect strategy:** library default + heartbeat.
- **Fallback:** if WebSocket fails, the homepage still ISR-refreshes Wire Drops every 60s, so the worst case is delayed updates, not missing updates.

---

## 4. Payments (Phase 2)

**Not implemented yet.** Tracked here so design choices don't pre-judge it.

- **Stripe Billing** — primary, Singapore entity (PDPA-aligned). Subscription product = "Pro". One monthly + one annual price. Webhook → `users.role = 'pro'` flip.
- **VNPay + Momo** — Vietnam. Wrapper service routes Pro upgrades from VN reads.
- **Indonesian gateway** — TBD. SEA candidates: GoPay / Xendit / Midtrans.
- **No popup paywall.** Soft block per invariant #4. The upgrade prompt is on the `/pro` page and (after the sign-in nudge tier) in a header banner.

**Schema sketch:**

```ts
// packages/db/src/schema/subscription.ts (planned)
subscriptions: {
  id, user_id, provider, provider_subscription_id,
  status: 'active' | 'past_due' | 'canceled',
  current_period_end, created_at, updated_at
}
```

---

## 5. Affiliate Redirect Tracker

- Best of Reviews on the homepage and inline product mentions link out via `/r/[token]` — the redirect handler logs the click (PostHog event) and 302s to the upstream URL.
- Each affiliate link gets an icon + disclosure tooltip on the source surface (invariant: no hidden affiliate links).
- Tokens stored in Payload `AffiliateLinks` collection (Admin only writes).
- Disclosure copy: "DTW may earn a commission on purchases made via this link." Localised.

---

## 6. PostHog Ingestion

- Self-hosted PostHog. Browser SDK reports to `POSTHOG_HOST/i/v0/e/`.
- Server-side events (paywall meter increment, search query) reported from Next.js route handlers / server actions using the Node SDK.
- `posthog.identify(user.id)` on login; `posthog.alias(anon_id, user.id)` to stitch pre-login behavior.
- Feature flag `paywall_meter_threshold` (default: 3) — read at request time, falls back to 3 if PostHog is unreachable.

---

## Quick Routing

| If you need... | Read next |
|---|---|
| Engine permission boundaries + RBAC | `process/context/auth/all-auth.md` |
| Article schema + lockedFields invariants | `process/context/database/all-database.md` |
| Search UI surface | `process/features/search/_GUIDE.md` |
| Wire Drops on homepage | `process/features/homepage/_GUIDE.md` |
| Paywall meter behavior | `process/features/articles/_GUIDE.md` |
| Hosting + env vars | `process/context/infra/all-infra.md` |

## Known Gaps

- Stripe webhook handler not built (Phase 2)
- Affiliate link Payload collection not modeled
- Meilisearch index strategy for `awards` + `authors` Y2 work not detailed
- No retry-policy doc for Engine ↔ Payload API beyond "exponential backoff, max 3"
