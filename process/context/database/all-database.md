# dtw-web - All Database

Last updated: 2026-05-28

Attach this file when the task touches schema, migrations, query patterns, or — most importantly — the **article conflict-resolution model** that protects editor work from being overwritten by Engine re-syncs.

---

## What This Covers

- Postgres 16 + Drizzle ORM setup (read by both Next.js and Payload)
- Payload 3 as schema owner for articles, taxonomy, users, sponsor slots
- The `lockedFields` / `editedByHuman` / `origin` invariants for Engine ↔ CMS conflict resolution
- Optimistic locking on writes
- Connection / migration workflow once scaffolded

Does NOT cover the Engine's own ingestion pipeline (lives in `dtw-engine` repo) or Stripe / billing schema (Phase 2 — see `integrations/all-integrations.md`).

## Read This When

- Adding or modifying any Payload collection
- Touching the `articles` table, especially provenance, version, or locked-field columns
- Writing or reviewing the `afterChange` hook
- Debugging "Engine overwrote my edit" reports (this should never happen if invariants hold — verify the invariants first)
- Planning a Drizzle migration

---

## Stack

- **Postgres 16** (hosted decision deferred — Neon / Supabase / Railway / self-host all viable; pick during infra setup)
- **Drizzle ORM** — shared schema in `packages/db`. Used by `dtw-web`, `dtw-engine`, and `dtw-workers` (forthcoming).
- **Payload CMS 3** — uses the Drizzle Postgres adapter. Payload is the source of truth for articles, users, and taxonomy. Drizzle gives us type-safe direct reads for high-traffic public pages where Payload's local API overhead matters.

## System of Record

| Domain | Owner | Notes |
|---|---|---|
| Articles | Payload | both Engine and editors write via Payload API, never direct SQL |
| Taxonomy (Pillar / Sub-section / Tag) | Payload | adding a pillar is a CMS write; routes/sitemap/RSS regenerate |
| Users + sessions | Better-Auth (Drizzle tables) | Payload reads user records for RBAC; Payload does NOT own auth |
| Subscriptions (Phase 2) | Stripe webhook → Drizzle | Pro status synced from Stripe |
| Bookmarks, reading history, follows | Drizzle, directly from Next.js | not editorial content, no Payload involvement |
| Wire Drops | Payload (small CRUD) + Soketi/Pusher broadcast on insert | |

## Article Provenance Model (load-bearing)

Every article carries:

```ts
// packages/db/src/schema/article.ts  (planned)
{
  origin: 'engine' | 'manual',          // who initiated this article
  editedByHuman: boolean,               // did an editor touch this in CMS?
  lockedFields: string[],               // explicit "do not overwrite" list
  version: number,                      // monotonic, bumped on every write
  updatedAt: timestamp,                 // optimistic-lock alternative
  // ... title, body, pillar, tags, etc.
}
```

### Conflict resolution invariants

These are non-negotiable. They protect editor work.

1. **Engine writes are always conditional.** Engine attempts an update only when `version` matches the value it last read (optimistic lock). If it doesn't match, the Engine refetches and re-runs its diff.
2. **Engine never touches a field listed in `lockedFields`.** Period.
3. **Engine never touches a field that has been edited by a human** (the diff between Engine's last-known and current value indicates a human change), unless the field is explicitly not in `lockedFields` AND the human edit is older than the new Engine value — and even then, prefer to log + skip rather than overwrite.
4. **`editedByHuman = true`** is set on any CMS write originating from a User with role `Author / Editor / Admin`. It only resets if an editor explicitly clicks "release to Engine" in CMS (Phase 2 control).
5. **Human always wins on the same field.** When in doubt, the editor's value is kept.

If you find yourself writing code that violates any of these, stop and flag it.

### Why this matters

The real risk is the **lost-update**: Engine and an editor sit on the same article at the same time. Engine re-syncs (e.g. updated stock price in the article body), the editor has rewritten the lede. Without `lockedFields` + optimistic lock, the editor's rewrite is silently erased on the next sync. That's the failure mode the system must prevent.

## `afterChange` Hook (single revalidation path)

One Payload hook handles all post-write side effects so the same logic fires for Engine and editor writes:

1. `revalidateTag(article.id)` and any tag-set the article participates in (pillar, sub-section, home-hero if pinned)
2. Push to Meilisearch index (upsert by id; delete if `_status === 'unpublished'`)
3. Trigger OG image generation (queued via BullMQ, key by article slug)
4. If `wire_drop`: broadcast to Soketi/Pusher channel

The Engine has **no separate webhook** — going through Payload API guarantees this hook fires. Skipping the API breaks the system.

## Migrations

(pending — will use Drizzle Kit when schema lands. Payload manages its own collection migrations; Drizzle handles `packages/db` schema migrations for shared user / bookmark / subscription tables.)

## Source paths (to come)

- `packages/db/src/schema/` — Drizzle table definitions
- `apps/web/payload.config.ts` — Payload collections (Articles, Pillars, Users, SponsorSlots, WireDrops, Corrections)
- `apps/web/src/lib/db.ts` — Drizzle client setup
- `packages/db/migrations/` — Drizzle migration history

## Quick Routing

| If you need... | Read next |
|---|---|
| the engine integration contract | `process/context/integrations/all-integrations.md` and `process/features/engine-integration/_GUIDE.md` |
| RBAC and user table shape | `process/context/auth/all-auth.md` |
| CMS collection editor | `process/features/cms/_GUIDE.md` |

## Known Gaps

- No schema files yet (greenfield)
- No migration tooling decided beyond "Drizzle Kit" — pick during scaffold
- Postgres host not chosen
