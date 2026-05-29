# Human-Operable Launch — Umbrella Plan

**Created:** 2026-05-30
**Owner phase context:** pre-E4 (before AI Content Engine integration)
**Goal:** A complete, usable DailyTechWire site a **human editorial team** can operate end-to-end — author + publish real articles with images, manage taxonomy, run a public corrections log, be discoverable (SEO/RSS) — **without** the AI Content Engine.
**Source:** multi-agent readiness audit (workflow `dtw-human-ops-readiness`, 2026-05-30). Readiness at audit time: **42%**.

---

## Verdict from audit

CMS scaffolding is solid (9 Payload collections, RBAC write-gates, depth-expanded cached reads, revalidate hooks, `toArticleView` adapter, applied migrations). But the **read/render layer is still wired to design-prototype mocks**, so the two most fundamental editor actions silently fail. Fixes are mechanical (wiring), not architectural.

### The 3 true publish-blockers
1. **Article body never renders CMS content.** `article-body.tsx` hardcodes the "Tuas-3" essay for every article; `article-view.ts` never maps `body`. `@payloadcms/richtext-lexical/react` is installed but unused. Seed also never set `body`.
2. **No image pipeline.** No Payload upload collection / storage adapter; `imageUrl` exists in schema but is never read. Editors cannot attach a hero image.
3. **Drafts leak to public.** No query in `payload-server.ts` filters `_status`; seed articles are draft-status and render live. (Coupled: enabling a published-only filter without first marking seed articles published would empty the site; and editors then need a draft-preview path.)

Plus: SEO layer absent; public Corrections log ignores the CMS; fabricated content (fake wire-drop stream, false "live"/"CMS-wired" claims); search + newsletters mock-only; footer links to 5 routes that 404.

---

## Roadmap (tiered, with critic additions merged)

### P0 — blocks human operation
- **P0-A — Publish-the-article core** (L)
  - Map `body` in `article-view.ts`; render via Lexical `RichText` in `article-body.tsx`; re-derive top/middle/bottom disclosure placement against real body (invariant #5).
  - Add published-only `_status` filter to all 5 reader queries in `payload-server.ts`; set seed articles `_status: 'published'` so they don't vanish.
  - **Draft preview** (critic, mandatory companion): Next `draftMode()` + Payload preview URL so editors can preview unpublished drafts.
  - Hero image pipeline (needs storage decision — see Open Decisions): upload collection + render in `article-content.tsx`.
  - Make `sponsor` server-required when `sponsored=true`.
- **P0-B — Editorial bootstrap + CMS-driven taxonomy** (M): seed/doc first admin user; reconcile Users roles; drive pillar route + heading/description from Pillars collection (invariant #8, currently 404s new pillars); homepage Pillar showcase from CMS.
- **P0-D — Editorial-integrity surfaces** (M): wire `/trust/corrections` to Corrections collection; delete fake wire-drop `setInterval` stream; remove false "live"/"CMS-wired" claims on studio/briefing/dashboards/search.
- **P0-C — Discoverability foundation** (L): `metadataBase` + `NEXT_PUBLIC_SITE_URL`; per-article `generateMetadata` + JSON-LD NewsArticle/Author/Organization; `sitemap.ts` (+ news sitemap); `robots.ts`; RSS (global + per-pillar); fix dead footer RSS link; pillar-page metadata.
- **P0-E — Missing baseline pages (critic)** (S): `/contact` + `/legal/*` (privacy/terms/cookies/gdpr — footer links 404 today, GDPR/PDPA compliance); root `error.tsx` / `global-error.tsx` boundary.

### P1 — should (quality / credibility)
- Search against live DB (no Meilisearch yet); newsletter real subscribe + double opt-in; dashboards data backend (manual editorial entry); hide fake auth surfaces (auth-deferred launch posture); Brief band editable + remove broken affordances + sponsor scheduling.
- Critic adds: Postgres backup/restore runbook; minimal privacy-respecting analytics; make cookie-banner "Decline" actually gate (currently no-op).

### P2 — defer (audit + critic agree: do NOT build now)
Realtime websockets (Soketi/Pusher), PWA offline, full i18n subpath routing, TTS/audio, full Meilisearch, per-article OG image generation, **Engine lock/version enforcement (E4)**, external data feeds, IndexedDB↔DB account sync, paywall persistence/config.

---

## Recommended execution sequence
`P0-A → P0-B → P0-D → P0-C → P0-E → P1-A (search) → P1-* → P2`

Rationale: must publish a real article before SEO/search have anything to index.

---

## Open Decisions
- **Hero image storage** (blocks the P0-A image piece): Vercel Blob (fastest on Vercel) vs Cloudflare R2 / S3 adapter (matches stated architecture, needs R2 account) vs render-only `imageUrl` (no upload UI — least human-operable). To be chosen with the user.

---

## Progress log
- 2026-05-30: Plan created from audit. Starting P0-A (body rendering + draft gate cluster).
