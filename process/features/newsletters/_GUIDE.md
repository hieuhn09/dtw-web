# newsletters

<!-- Part of dtw-web -->

## Scope

The 6 newsletter products at `/newsletters` plus all subscribe surfaces (footer mini-form, full-width homepage CTA, post-article CTA in select Phase 2 surfaces). Uses Resend + React Email for delivery, with mandatory double opt-in.

Does NOT cover: magic-link login emails (those use the same Resend account but are `auth/`), transactional emails like corrections (Phase 2, lives near Payload `Corrections`).

## The 6 newsletters (Y1)

| Newsletter | Cadence | Segment focus |
|---|---|---|
| **AM Brief** | Daily, ~6am SGT | Top 5 stories overnight, Asia-first framing |
| **PM Brief** | Daily, ~6pm SGT | End-of-day wrap, what to watch tomorrow |
| **AI Weekly** | Weekly, Thursday | AI pillar dive — papers, launches, benchmarks |
| **Asia Funding Weekly** | Weekly, Tuesday | Funding rounds, IPOs, exits across Asia |
| **Dev Digest** | Weekly, Wednesday | Frameworks, infra, tooling — Dev pillar |
| **Products Deals** | Weekly, Friday | Product reviews + affiliate deals (with disclosure) |

Segmented by pillar — this is intentional. The Tech in Asia mistake was lumping everything into one newsletter and losing audience clarity.

## Subscribe flow

1. User enters email (any of the subscribe forms)
2. Server-side route handler stores pending subscription + sends confirmation email via Resend
3. User clicks confirm link → subscription activated, segment(s) assigned
4. User can manage segments at `/account` (logged in) or via emailed manage link

Double opt-in is mandatory — single opt-in is a deliverability + compliance risk.

## Mini subscribe (footer + post-article)

- Single email input
- Defaults to "AM Brief" subscription on submit; "Manage your preferences" link in the welcome email points to `/account` (or unsubscribe link for non-users)

## Full subscribe page (`/newsletters`)

- 6 newsletter cards with sample subject line, cadence, "subscribe" toggle each
- Single email input at top — toggles multiple cards then a single confirm send
- Hero: "Read DailyTechWire the way you read." (line under it is 1px `var(--hair)` — earlier iteration used 3px which the user flagged as too heavy)

## Sending pipeline

- Editor schedules / publishes a newsletter issue in Payload
- BullMQ worker picks up the send job
- Resend Batch send API used — chunks of 100 per request
- Resend webhook → PostHog event (`newsletter_opened`, `newsletter_clicked`)

## Bounces + unsubscribes

- Resend webhook `bounce` event → mark email `dtw-bounced`, suppress future sends
- One-click unsubscribe header per RFC 8058 — required for major inbox providers
- Unsubscribe link in every email — segment-scoped (unsubscribing from AI Weekly does NOT unsubscribe from AM Brief)

## Key Source Files (to come)

- `apps/web/src/app/(reader)/newsletters/page.tsx`
- `apps/web/src/components/subscribe/{mini-form,full-card,confirm-screen}.tsx`
- `apps/web/src/app/api/newsletter/subscribe/route.ts`
- `apps/web/src/app/api/newsletter/confirm/[token]/route.ts`
- `apps/web/src/app/api/newsletter/webhook/resend/route.ts`
- `apps/web/src/emails/{confirm,am-brief,pm-brief,ai-weekly,asia-funding,dev-digest,products-deals}.tsx`
- `apps/web/src/lib/resend.ts`
- `packages/db/src/schema/newsletter.ts` — `subscriptions`, `pending_confirmations`, `bounces`

## Related Context

- `process/context/infra/all-infra.md` — Resend setup, DKIM/SPF/DMARC, env vars
- `process/context/auth/all-auth.md` — magic-link emails share the Resend account
- `process/context/integrations/all-integrations.md` — webhook ingestion, segment model
- `process/features/cms/_GUIDE.md` — `Newsletters` collection (Editor authors issues)

## Current Status

Status: not-started

## Folder Contents

```
process/features/newsletters/
  active/       -- in-progress plans (DKIM setup, double opt-in flow, first issue)
  completed/    -- archived
  backlog/      -- per-author follow newsletters, breaking-news SMS (Y2)
  reports/      -- open rate / CTR per newsletter
  references/   -- React Email template archive, deliverability notes
```
