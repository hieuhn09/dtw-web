# engine-integration

<!-- Part of dtw-web -->

## Scope

The web ↔ Content Engine contract. This feature folder owns:

- The Payload `Articles` collection's API surface as Engine sees it
- The `lockedFields` / `editedByHuman` / `origin` model and its enforcement
- The optimistic-lock retry semantics
- The single `afterChange` revalidation path (ISR + Meilisearch + OG + Wire-Drop broadcast)
- The editorial UX for handling Engine drafts in CMS

This is **the most failure-sensitive integration in the system.** It's where editor work is most at risk of being silently overwritten by automated re-sync.

Does NOT cover: the Engine's own pipeline (separate repo `dtw-engine`), Stripe / billing webhooks (Phase 2).

## The contract (one sentence)

Engine writes articles via Payload REST/GraphQL API with `Author` role, never directly to Postgres, and Engine **never overwrites** a field that is locked or has been edited by a human.

## Invariants (must not regress)

These come from `process/context/all-context.md` (#1–#3, #11) — repeated here because this folder is where they're enforced:

1. **Engine writes via API only.** Database writes from outside Payload skip the `afterChange` hook and break ISR / search / OG / locking. There is no acceptable shortcut.
2. **`lockedFields` is sacrosanct.** Any field in this array on an article is invisible to Engine writes. Editors choose what to lock in CMS.
3. **`editedByHuman: true`** is set whenever an Editor / Admin / Author writes the article from CMS. It only resets via explicit CMS action ("release back to Engine").
4. **Optimistic lock by `version`.** Engine reads `version`, builds patch, submits with `If-Match: <version>`. 409 → refetch + retry, max 3 with exponential backoff.
5. **Human always wins on the same field.** When both touched the same field, the human value persists; Engine logs the skip.

## Editorial UX (CMS-side)

Editors need to feel safe. The CMS:

- Shows a clear "From Engine" badge on Engine-originated drafts (`origin: 'engine'`)
- Shows a "Locked fields" panel where editors can toggle locks on any field (title / dek / body / hero / pillar / tags)
- Shows a "Last Engine attempt" log on each article — what Engine tried to update, what was skipped, when
- Optional "Release back to Engine" button on a per-field basis, which removes that field from `lockedFields` AND nulls `editedByHuman` for that field

## Conflict log

Every skipped Engine write is logged to a `EngineConflictLog` table (planned):

- `article_id`, `field`, `engine_value`, `current_value`, `reason: 'locked' | 'human_edited'`, `timestamp`

This log feeds an admin dashboard so editorial leadership can see how often Engine and editors collide.

## The `afterChange` hook (single revalidation path)

Implemented on Payload `Articles` collection. Runs on both Engine writes AND editor writes. Fires:

1. `revalidateTag('article:' + id)` and all tag-sets the article participates in
2. Meilisearch upsert (delete on unpublish)
3. OG image generation queued via BullMQ
4. If `wire_drop` collection: broadcast to Soketi/Pusher

**Bypassing the hook is a P0 bug.** That's why direct DB writes from Engine are forbidden.

## Performance considerations

- Article API write p95 < 500ms (a chunky LLM-summarised article needs OG gen async)
- If Engine bulk-backfills (e.g. 5k historical articles), throttle to 5 concurrent / 50 per minute to avoid storming the Search / OG queues
- Fallback escape hatch: if bulk volume ever pressures the API path beyond throttling, the documented exception is direct DB insert + manually queuing the revalidate/index/og work. **Default is API path.** Pull that lever only when measured volume requires it.

## Key Source Files (to come)

- `apps/web/src/collections/Articles.ts` — Payload collection, RBAC, `lockedFields` validation, optimistic lock
- `apps/web/src/lib/payload-hooks/after-change-article.ts` — the single revalidation helper
- `apps/web/src/lib/payload-hooks/engine-conflict-detector.ts` — checks lockedFields + editedByHuman, builds the patch Engine is allowed to apply
- `apps/web/src/app/api/cms/[...slug]/route.ts` — Payload API mount; Engine hits this
- `apps/web/src/admin/components/EngineDraftBadge.tsx` — CMS UI
- `apps/web/src/admin/components/LockedFieldsPanel.tsx`
- `packages/db/src/schema/engine-conflict-log.ts`

## Related Context

- `process/context/database/all-database.md` — schema (the spine of these invariants)
- `process/context/integrations/all-integrations.md` — protocol-level contract (auth token, endpoints, retry)
- `process/context/auth/all-auth.md` — `Author` role permissions, 2FA on editor
- `process/features/cms/_GUIDE.md` — collection RBAC, `afterChange` ownership
- `process/features/articles/_GUIDE.md` — reader-facing surface that depends on revalidation firing

## Current Status

Status: not-started

## Folder Contents

```
process/features/engine-integration/
  active/       -- in-progress plans (Articles collection + locking, conflict log)
  completed/    -- archived
  backlog/      -- per-field history view, automatic lock heuristics
  reports/      -- conflict-log audits, "Engine overwrite" near-miss reports
  references/   -- Engine API contract changelog, retry-policy notes
```
