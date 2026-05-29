# cms

<!-- Part of dtw-web -->

## Scope

The Payload CMS 3 instance, embedded at `/admin` inside the Next.js app. Owns the editorial UI, RBAC enforcement, taxonomy entities (Pillar / Sub-section / Tag), sponsor slot management, disclosure-flag config, dashboards data-source config, and the Engine ↔ Payload API surface.

Does NOT cover: Better-Auth (`account/`), the public reader UI (`articles/`, `homepage/`), the Engine's own pipeline.

## Why embedded Payload

- Single deploy (Vercel) — Engine has a single API origin to hit
- Shared Drizzle adapter on the same Postgres — no schema duplication
- Single `afterChange` revalidation path — guarantees ISR + Meilisearch + OG fire on every write
- Editor session reuses Better-Auth (Payload's `auth.useAPIKey` is OFF; we proxy through Next.js middleware so Editor login is the same magic-link flow)

## Collections (planned)

| Collection | Owner | Purpose | RBAC notes |
|---|---|---|---|
| `Articles` | shared | system of record for all content | Engine (`Author`) drafts; Editor / Admin publish; locked fields protect editor work |
| `Pillars` | Editor / Admin | taxonomy root — 6 fixed Y1 but model supports more | `slug`, `title` (i18n), `color`, `icon`, `order` |
| `Subsections` | Editor / Admin | nested under Pillar | `parentId`, `slug`, `title` (i18n) |
| `Tags` | Editor / Admin | flat taxonomy | `slug`, `title` (i18n) |
| `Authors` | Editor / Admin | byline directory | `name`, `role`, `bio`, `avatar` |
| `SponsorSlots` | Admin | configures sponsor placements (sponsored strip, dashboard slot) | content + start/end dates |
| `AffiliateLinks` | Admin | redirect tracker tokens | `token`, `upstream_url`, `disclosure_copy` |
| `WireDrops` | Author + | ≤ 150-char realtime band entries | auto-publish on insert; broadcast to Soketi/Pusher |
| `Corrections` | Editor + | public log of corrections per article | renders on `/trust/corrections` |
| `Newsletters` | Editor + | the 6 newsletter definitions + segment membership | |
| `DashboardSources` | Admin | data-source config for Funding Tracker + AI Leaderboard | API key (encrypted), refresh cadence, methodology copy |

(Final list ratified during scaffold — this is the planning snapshot.)

## RBAC inside Payload

Five roles from `auth/all-auth.md` map to Payload `access` controls:

- `Reader`, `Pro` — no `/admin` access at all
- `Author` — read everything; create / update own `Articles` drafts; `WireDrops` create
- `Editor` — Author perms + publish / unpublish; set `lockedFields`; manage `Pillars`, `Subsections`, `Tags`, `Authors`, `Corrections`, `Newsletters`. **2FA enforced.**
- `Admin` — full access including `SponsorSlots`, `AffiliateLinks`, `DashboardSources`, RBAC management. **2FA enforced.**

## Engine API surface

Engine hits Payload REST endpoints with the `ENGINE_TO_PAYLOAD_API_TOKEN` bearer token (granted `Author` permissions). See `process/context/integrations/all-integrations.md` for the full contract — TL;DR:

- `POST /api/articles` (create draft)
- `PATCH /api/articles/:id` (with `If-Match: <version>` for optimistic lock)
- `POST /api/wire-drops` (auto-publish)
- `GET /api/pillars`, `GET /api/tags` (read taxonomy)

## `afterChange` hook (single revalidation path)

Lives in Payload collection config. One source of truth for:

1. `revalidateTag(article:{id})` + parent tags (pillar, subsection, home-hero if pinned)
2. Meilisearch upsert / delete
3. OG image generation (queued via BullMQ)
4. Soketi/Pusher broadcast (for `WireDrops` only)

If you add a new collection that influences a cached surface, wire its `afterChange` to the same helper — don't replicate the side-effect logic.

## Localised fields

Use Payload's built-in localisation for: pillar / subsection / tag titles, newsletter names, sponsor copy, disclosure templates if customised. Article body is NOT localised (one body per article, source language only — see invariant #10).

## Dynamic taxonomy → dynamic routes

When a new Pillar or Subsection is created:

1. Payload `afterChange` triggers `revalidateTag('routes')` (or similar global tag)
2. Next.js `generateStaticParams` on `/[pillar]/[[...slug]]/page.tsx` re-runs lazily
3. RSS + sitemap regenerate on schedule (15-min news sitemap floor)
4. Total time from CMS save to live route: ≤ 5 minutes (invariant #8)

## Key Source Files (to come)

- `apps/web/payload.config.ts` — root config + RBAC + collection registry
- `apps/web/src/collections/Articles.ts` — collection + `afterChange` hook
- `apps/web/src/collections/Pillars.ts`, `Subsections.ts`, `Tags.ts`
- `apps/web/src/collections/{SponsorSlots,AffiliateLinks,WireDrops,Corrections,Newsletters,DashboardSources}.ts`
- `apps/web/src/lib/payload-hooks/after-change-article.ts` — the shared side-effect helper
- `apps/web/src/app/admin/[[...payload]]/page.tsx` — embedded Payload admin mount

## Related Context

- `process/context/database/all-database.md` — schema, `lockedFields`, conflict resolution
- `process/context/auth/all-auth.md` — RBAC source of truth, 2FA enforcement
- `process/context/integrations/all-integrations.md` — Engine API contract
- `process/features/engine-integration/_GUIDE.md` — the editor-facing UX for handling Engine drafts

## Current Status

Status: not-started

## Folder Contents

```
process/features/cms/
  active/       -- in-progress plans (e.g. embed Payload, set up Articles collection)
  completed/    -- archived completed plans
  backlog/      -- workflow editor (Tiptap, Phase 2), revision history UI
  reports/      -- editor UX research, time-on-task notes
  references/   -- Payload upgrade notes, RBAC matrices
```
