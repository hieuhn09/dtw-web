import { revalidateTag } from "next/cache";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  Payload,
} from "payload";

/**
 * E3c — cache invalidation + downstream-effect hooks.
 *
 * Every editorial write (CMS save, or an Engine write via the Payload API in
 * E4) flows through these `afterChange` / `afterDelete` hooks. This is what
 * makes invariant #1 hold ("Engine writes only via Payload API"): the API path
 * is the ONLY path that fires revalidation + search indexing + OG generation,
 * so bypassing it (e.g. a raw Postgres insert) would silently skip all three.
 *
 * `revalidateTag` reaches into Next.js's incremental cache and only works
 * inside a request scope (an /admin save or a route handler). Calling it from a
 * plain `tsx` process — the seed script, a migration — throws. We guard two
 * ways:
 *   1. `context.disableRevalidate` — explicit opt-out the seed script sets.
 *   2. try/catch — defense in depth for any other out-of-request caller.
 *
 * Meilisearch indexing and OG-image generation are stubbed here (logged, not
 * executed). They get wired in a later phase; the call sites live here now so
 * the contract is visible and E4 has one obvious place to extend.
 */

/** Read the opt-out flag off Payload's loosely-typed request context. */
function revalidationDisabled(context: unknown): boolean {
  return Boolean((context as { disableRevalidate?: unknown } | undefined)?.disableRevalidate);
}

/** Fire a set of cache tags, surviving out-of-request callers. */
function bust(payload: Payload, tags: readonly string[], reason: string): void {
  try {
    for (const tag of tags) revalidateTag(tag);
    payload.logger.info(`[revalidate] ${reason} → ${tags.join(", ")}`);
  } catch {
    // No request scope (seed / migration). The `revalidate` window on each
    // cached query is the fallback, so this is safe to skip.
    payload.logger.warn(`[revalidate] skipped "${reason}" — no request scope`);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Articles
//
// All five article query helpers in lib/payload-server.ts share the single tag
// `articles:all` (recent, by-pillar, by-slug, deep-dive, sponsored), so one
// bust covers every article-derived surface.
// ──────────────────────────────────────────────────────────────────────────────

export const revalidateArticle: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (revalidationDisabled(context)) return doc;

  const isPublished = doc._status === "published";
  const wasPublished = previousDoc?._status === "published";

  // Publish, edit-while-published, or unpublish all change what readers see.
  if (isPublished || wasPublished) {
    bust(payload, ["articles:all"], `article "${doc.slug}" (${doc._status})`);

    // E-later: keep the search index in lockstep with publish state.
    if (isPublished) {
      payload.logger.info(`[meilisearch] TODO index article "${doc.slug}"`);
      payload.logger.info(`[og] TODO generate OG image for "${doc.slug}"`);
    } else {
      payload.logger.info(`[meilisearch] TODO remove unpublished article "${doc.slug}"`);
    }
  }

  return doc;
};

export const revalidateArticleDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { payload, context },
}) => {
  if (revalidationDisabled(context)) return doc;
  bust(payload, ["articles:all"], `article deleted "${doc?.slug ?? doc?.id}"`);
  payload.logger.info(`[meilisearch] TODO remove deleted article "${doc?.slug ?? doc?.id}"`);
  return doc;
};

// ──────────────────────────────────────────────────────────────────────────────
// Wire Drops — no drafts; published the moment they exist.
// ──────────────────────────────────────────────────────────────────────────────

export const revalidateWireDrop: CollectionAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (revalidationDisabled(context)) return doc;
  bust(payload, ["wire-drops"], `wire drop ${doc?.city ?? ""}`);
  // E-later (Phase F): broadcast to the Soketi/Pusher `wire-drops` channel for
  // true realtime, instead of relying on the reader's next cache read.
  payload.logger.info(`[realtime] TODO broadcast wire drop to channel "wire-drops"`);
  return doc;
};

export const revalidateWireDropDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { payload, context },
}) => {
  if (revalidationDisabled(context)) return doc;
  bust(payload, ["wire-drops"], `wire drop deleted`);
  return doc;
};

// ──────────────────────────────────────────────────────────────────────────────
// Pillars — taxonomy. A pillar's color/label is joined into article cards via
// `depth`, cached under `articles:all`, so a pillar edit must bust BOTH the
// pillars nav tag and the articles tag (invariant #8: nav regenerates without a
// deploy).
// ──────────────────────────────────────────────────────────────────────────────

export const revalidatePillar: CollectionAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (revalidationDisabled(context)) return doc;
  bust(payload, ["pillars:all", "articles:all"], `pillar "${doc?.slug}"`);
  return doc;
};

export const revalidatePillarDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { payload, context },
}) => {
  if (revalidationDisabled(context)) return doc;
  bust(payload, ["pillars:all", "articles:all"], `pillar deleted "${doc?.slug}"`);
  return doc;
};

// ──────────────────────────────────────────────────────────────────────────────
// Paywall settings (Global) — single operational number, no delete/versions.
// ──────────────────────────────────────────────────────────────────────────────

export const revalidatePaywallSettings: GlobalAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (revalidationDisabled(context)) return doc;
  bust(payload, ["settings:paywall"], "paywall settings updated");
  return doc;
};

// ──────────────────────────────────────────────────────────────────────────────
// Newsletters — reader subscription products (Account tab, /newsletters,
// homepage CTA all read via the single `newsletters:all` tag).
// ──────────────────────────────────────────────────────────────────────────────

export const revalidateNewsletter: CollectionAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (revalidationDisabled(context)) return doc;
  bust(payload, ["newsletters:all"], `newsletter "${doc?.slug}"`);
  return doc;
};

export const revalidateNewsletterDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { payload, context },
}) => {
  if (revalidationDisabled(context)) return doc;
  bust(payload, ["newsletters:all"], `newsletter deleted "${doc?.slug}"`);
  return doc;
};

// ──────────────────────────────────────────────────────────────────────────────
// AI Leaderboard (aiModels) — CMS-backed AI model rows. Both the weekly
// ai-weekly cron write (Group G, `lib/dashboards/ai-llmstats.ts`) and a direct
// editor save in /admin flow through Payload's Local/REST API, so they share
// this single afterChange hook — invariant #1 in
// process/context/all-context.md ("Engine writes only via Payload API").
// ──────────────────────────────────────────────────────────────────────────────

export const revalidateAiModel: CollectionAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (revalidationDisabled(context)) return doc;
  bust(payload, ["dashboards:ai"], `aiModel "${doc?.model}"`);
  return doc;
};

export const revalidateAiModelDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { payload, context },
}) => {
  if (revalidationDisabled(context)) return doc;
  bust(payload, ["dashboards:ai"], `aiModel deleted "${doc?.model ?? doc?.id}"`);
  return doc;
};

// ──────────────────────────────────────────────────────────────────────────────
// Sponsor slots — homepage strip + dashboard sponsor card placements. First
// real hooks on this collection (previously had none wired).
// ──────────────────────────────────────────────────────────────────────────────

export const revalidateSponsorSlot: CollectionAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (revalidationDisabled(context)) return doc;
  bust(payload, ["sponsor-slots:all"], `sponsorSlot "${doc?.slot}"`);
  return doc;
};

export const revalidateSponsorSlotDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { payload, context },
}) => {
  if (revalidationDisabled(context)) return doc;
  bust(payload, ["sponsor-slots:all"], `sponsorSlot deleted "${doc?.slot ?? doc?.id}"`);
  return doc;
};

// ──────────────────────────────────────────────────────────────────────────────
// Dashboard methodology (Global) — AI-only copy (Lean Deviation #4 in
// ai-leaderboard-llmstats_PLAN_30-07-26.md; the big plan's fundingMethodology
// group is not created this pass). Single editorial text block, no
// delete/versions — same operational-setting shape as paywallSettings above.
// ──────────────────────────────────────────────────────────────────────────────

export const revalidateDashboardMethodology: GlobalAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (revalidationDisabled(context)) return doc;
  bust(payload, ["dashboards:methodology"], "dashboard methodology updated");
  return doc;
};
