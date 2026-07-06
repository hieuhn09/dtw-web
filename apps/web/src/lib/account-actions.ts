"use server";

/**
 * Server actions for reader account data — bookmarks, reading history, pillar
 * follows, newsletter subscriptions. Ported near-verbatim from brief-asia-web's
 * `src/lib/account-actions.ts` (see
 * process/features/account/references/brief-asia-port-map_REFERENCE_03-07-26.md),
 * narrowed to this pass's scope: no `article_views`/analytics table at all —
 * deliberately not ported (see the reference doc's Fix-on-Port table:
 * "per-pageload view counting without dedupe").
 *
 * Every article id argument is the Payload numeric `id` coerced to
 * `String(id)` by the caller (see `ArticleView.id` / `toArticleView`) — these
 * functions accept `string` only and never coerce internally, matching
 * `ArticleView.id`'s existing typing throughout the codebase.
 *
 * This file is `"use server"`, which already makes every export server-only
 * by construction — no additional `import "server-only"` needed here, same
 * convention as the existing `load-more-action.ts` / `search-action.ts`.
 */

import { randomUUID } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@dtw/db/client";
import { bookmarks, follows, newsletterSubscriptions, readingHistory } from "@dtw/db";
import { getSessionUser, requireUser } from "@/lib/session";

export async function toggleBookmark(articleId: string): Promise<boolean> {
  const user = await requireUser();
  const existing = await db
    .select({ articleId: bookmarks.articleId })
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, user.id), eq(bookmarks.articleId, articleId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .delete(bookmarks)
      .where(and(eq(bookmarks.userId, user.id), eq(bookmarks.articleId, articleId)));
    return false;
  }

  await db.insert(bookmarks).values({ userId: user.id, articleId });
  return true;
}

export async function removeBookmark(articleId: string): Promise<void> {
  const user = await requireUser();
  await db
    .delete(bookmarks)
    .where(and(eq(bookmarks.userId, user.id), eq(bookmarks.articleId, articleId)));
}

/**
 * Guest-safe: returns `false` (never throws) when there is no session, since
 * `article-content.tsx` calls this from a client effect that may run before a
 * session exists.
 */
export async function isBookmarked(articleId: string): Promise<boolean> {
  const user = await getSessionUser();
  if (!user) return false;
  const existing = await db
    .select({ articleId: bookmarks.articleId })
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, user.id), eq(bookmarks.articleId, articleId)))
    .limit(1);
  return existing.length > 0;
}

/**
 * Guest-safe no-op (mirrors the guest paywall meter's own client-side
 * cookie/localStorage tracking — Stage C's concern, not this one). Upserts
 * `reading_history` on the `(userId, articleId)` unique index — this is the
 * exact dedupe mechanism: one row per user+article, `readAt` bumped on every
 * re-read, never a second row per page-load (fixes the brief-asia
 * "per-pageload view counting without dedupe" bug). Fires for sponsored
 * articles too — unlike the guest paywall meter (`incrementRead`), reading
 * history has no sponsored exemption.
 */
export async function recordView(articleId: string): Promise<void> {
  const user = await getSessionUser();
  if (!user) return;
  await db
    .insert(readingHistory)
    .values({ userId: user.id, articleId })
    .onConflictDoUpdate({
      target: [readingHistory.userId, readingHistory.articleId],
      set: { readAt: new Date() },
    });
}

export async function clearHistory(): Promise<void> {
  const user = await requireUser();
  await db.delete(readingHistory).where(eq(readingHistory.userId, user.id));
}

/**
 * Pillar-only — dtw's `follows` schema has no country-follow discriminator
 * (narrower than brief-asia's `(followType, targetId)` signature by design;
 * the schema itself, not just convention, only models pillar follows).
 * `targetSlug` is a CMS pillar slug (`NavPillar.slug`), not the legacy
 * 6-value `PillarId` union — any CMS pillar slug is accepted, per invariant
 * #8 (adding a pillar in the CMS must not require a code change).
 */
export async function toggleFollow(targetSlug: string): Promise<boolean> {
  const user = await requireUser();
  const existing = await db
    .select({ pillarId: follows.pillarId })
    .from(follows)
    .where(and(eq(follows.userId, user.id), eq(follows.pillarId, targetSlug)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .delete(follows)
      .where(and(eq(follows.userId, user.id), eq(follows.pillarId, targetSlug)));
    return false;
  }

  await db.insert(follows).values({ userId: user.id, pillarId: targetSlug });
  return true;
}

// ──────────────────────────────────────────────────────────────────────────────
// Newsletters (Stage D).
//
// `newsletter_subscriptions`'s only unique index is `(email, newsletter_id)`
// — there is no `(user_id, newsletter_id)` constraint (see
// packages/db/src/schema/account.ts) — so `setNewsletter` cannot be a single
// `ON CONFLICT` upsert. It is an explicit application-level claim-or-insert
// so a signed-in toggle is keyed on `user_id` first (fixes brief-asia's bug:
// email-keyed subs silently orphan when a reader changes their email via
// Settings' changeEmail).
// ──────────────────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** True if a driver-level error is a Postgres unique-violation (23505). */
function isUniqueViolation(err: unknown): boolean {
  return (err as { code?: string } | null)?.code === "23505";
}

/**
 * Signed-in newsletter toggle, keyed on `user_id`. `newsletterId` is a
 * Payload `Newsletter.slug` value (am/pm/ai/fund/dev/prod — string-value
 * convention only, no FK; see `Newsletters.ts`).
 */
export async function setNewsletter(newsletterId: string, subscribe: boolean): Promise<void> {
  const user = await requireUser();

  // 1. A row this user has already claimed (by user_id).
  const own = await db
    .select({ newsletterId: newsletterSubscriptions.newsletterId })
    .from(newsletterSubscriptions)
    .where(
      and(
        eq(newsletterSubscriptions.userId, user.id),
        eq(newsletterSubscriptions.newsletterId, newsletterId)
      )
    )
    .limit(1);

  if (own.length > 0) {
    await db
      .update(newsletterSubscriptions)
      .set({ unsubscribedAt: subscribe ? null : new Date() })
      .where(
        and(
          eq(newsletterSubscriptions.userId, user.id),
          eq(newsletterSubscriptions.newsletterId, newsletterId)
        )
      );
    return;
  }

  // 2. An unclaimed legacy row with the same email (e.g. a guest subscribed
  // before this account existed, or before signing in with this email).
  // Claim it rather than inserting a second row — a second INSERT with the
  // same (email, newsletter_id) would violate the existing unique index.
  const legacy = await db
    .select({ newsletterId: newsletterSubscriptions.newsletterId })
    .from(newsletterSubscriptions)
    .where(
      and(
        isNull(newsletterSubscriptions.userId),
        eq(newsletterSubscriptions.email, user.email),
        eq(newsletterSubscriptions.newsletterId, newsletterId)
      )
    )
    .limit(1);

  if (legacy.length > 0) {
    await db
      .update(newsletterSubscriptions)
      .set({ userId: user.id, unsubscribedAt: subscribe ? null : new Date() })
      .where(
        and(
          isNull(newsletterSubscriptions.userId),
          eq(newsletterSubscriptions.email, user.email),
          eq(newsletterSubscriptions.newsletterId, newsletterId)
        )
      );
    return;
  }

  // 3. Nothing exists yet.
  if (!subscribe) return; // no-op: nothing to unsubscribe from

  // 4. Insert. The session email is already verified — a signed-in subscribe
  // needs no confirmation step.
  try {
    await db.insert(newsletterSubscriptions).values({
      id: randomUUID(),
      email: user.email,
      newsletterId,
      userId: user.id,
      confirmedAt: new Date(),
      unsubscribedAt: null,
    });
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;
    // Benign race: a concurrent request (e.g. a double-click) inserted the
    // same (email, newsletter_id) row between steps 1–3 and this INSERT.
    // Treat as success — claim it instead of surfacing an error.
    await db
      .update(newsletterSubscriptions)
      .set({ userId: user.id, unsubscribedAt: subscribe ? null : new Date() })
      .where(
        and(
          eq(newsletterSubscriptions.email, user.email),
          eq(newsletterSubscriptions.newsletterId, newsletterId)
        )
      );
  }
}

/**
 * Guest-safe: `false` (never throws) when there is no session — mirrors
 * `isBookmarked`'s contract for the same reason (client effects that may run
 * before a session resolves).
 */
export async function isSubscribed(newsletterId: string): Promise<boolean> {
  const user = await getSessionUser();
  if (!user) return false;
  const rows = await db
    .select({ newsletterId: newsletterSubscriptions.newsletterId })
    .from(newsletterSubscriptions)
    .where(
      and(
        eq(newsletterSubscriptions.userId, user.id),
        eq(newsletterSubscriptions.newsletterId, newsletterId),
        isNull(newsletterSubscriptions.unsubscribedAt)
      )
    )
    .limit(1);
  return rows.length > 0;
}

/**
 * Guest subscribe. Writes `confirmed_at = now()` immediately, no session
 * required, keyed on `email` only (guests have no `user_id` yet). The first
 * time this email signs in and toggles a newsletter, `setNewsletter`'s own
 * legacy-row lookup (step 2 above) claims this row onto the new account — no
 * duplicate.
 */
export async function subscribeGuest(
  email: string,
  newsletterIds: ReadonlyArray<string>
): Promise<{ ok: boolean }> {
  const clean = email.trim().toLowerCase();
  if (!EMAIL_RE.test(clean) || newsletterIds.length === 0) return { ok: false };

  for (const newsletterId of newsletterIds) {
    const existing = await db
      .select({ newsletterId: newsletterSubscriptions.newsletterId })
      .from(newsletterSubscriptions)
      .where(
        and(
          eq(newsletterSubscriptions.email, clean),
          eq(newsletterSubscriptions.newsletterId, newsletterId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(newsletterSubscriptions)
        .set({ unsubscribedAt: null, confirmedAt: new Date() })
        .where(
          and(
            eq(newsletterSubscriptions.email, clean),
            eq(newsletterSubscriptions.newsletterId, newsletterId)
          )
        );
      continue;
    }

    try {
      await db.insert(newsletterSubscriptions).values({
        id: randomUUID(),
        email: clean,
        newsletterId,
        confirmedAt: new Date(),
      });
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
      // Benign race — another concurrent request already inserted it.
    }
  }
  return { ok: true };
}
