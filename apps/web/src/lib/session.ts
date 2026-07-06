import "server-only";
import { headers } from "next/headers";
import { and, count, desc, eq, gte, isNull } from "drizzle-orm";
import { db } from "@dtw/db/client";
import { bookmarks, follows, newsletterSubscriptions, readingHistory } from "@dtw/db";
import type { Bookmark, Follow, NewsletterSubscription, ReadingHistory } from "@dtw/db";
import { auth } from "@/lib/auth";
import { startOfCurrentPeriodSGT } from "@/lib/paywall";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string; // lowercase DB value: reader | pro | author | editor | admin
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  const u = session?.user;
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: (u as { role?: string }).role ?? "reader",
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

const ROLE_RANK: Record<string, number> = { reader: 0, pro: 1, author: 2, editor: 3, admin: 4 };

/**
 * Single source of truth for role comparisons. Takes LOWERCASE role strings
 * (the DB/session value) — do NOT pass shell.tsx's capitalized User.role
 * union here; that mismatch is exactly the silent-bug class this helper
 * exists to prevent.
 */
export function roleAtLeast(role: string | undefined, min: string): boolean {
  return (ROLE_RANK[role ?? "reader"] ?? 0) >= (ROLE_RANK[min] ?? 0);
}

/**
 * Plain server-only reads (not `"use server"`) — called only from the
 * `force-dynamic` `/account` RSC, which has already gated on a verified
 * session via `getSessionUser()`, so these don't re-check auth themselves.
 */
export async function listBookmarks(userId: string): Promise<Bookmark[]> {
  return db
    .select()
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId))
    .orderBy(desc(bookmarks.savedAt));
}

export async function listHistory(userId: string): Promise<ReadingHistory[]> {
  return db
    .select()
    .from(readingHistory)
    .where(eq(readingHistory.userId, userId))
    .orderBy(desc(readingHistory.readAt))
    .limit(50);
}

export async function listFollows(userId: string): Promise<Follow[]> {
  return db.select().from(follows).where(eq(follows.userId, userId));
}

/**
 * Active (non-unsubscribed) newsletter subscriptions for a signed-in reader —
 * keyed on `user_id` (Stage D fixes brief-asia's email-keyed bug; see
 * `account-actions.ts`'s `setNewsletter`). Mirrors `listBookmarks`/
 * `listHistory`/`listFollows`'s exact convention.
 */
export async function listNewsletterSubs(userId: string): Promise<NewsletterSubscription[]> {
  return db
    .select()
    .from(newsletterSubscriptions)
    .where(
      and(eq(newsletterSubscriptions.userId, userId), isNull(newsletterSubscriptions.unsubscribedAt))
    );
}

/**
 * Distinct articles a signed-in reader has read in the current calendar
 * month (Asia/Singapore) — the authenticated-side mirror of the guest
 * cookie meter in lib/paywall.ts. reading_history is upserted per
 * (userId, articleId) by Stage B's recordView(), so a straight
 * `readAt >= periodStart` count is already deduped by article id (re-reading
 * an old article bumps its readAt into the new period exactly once — it does
 * not create a second row). See Stage C's Design Decision D2.
 */
export async function getReadCountThisPeriod(userId: string): Promise<number> {
  const since = startOfCurrentPeriodSGT();
  const rows = await db
    .select({ value: count() })
    .from(readingHistory)
    .where(and(eq(readingHistory.userId, userId), gte(readingHistory.readAt, since)));
  return rows[0]?.value ?? 0;
}
