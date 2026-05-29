import {
  pgTable,
  text,
  timestamp,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

/**
 * Per-user state — bookmarks, queue, history, follows.
 * Synced to IndexedDB on the client (see process/features/account/_GUIDE.md).
 *
 * `article_id` and `pillar_id` reference Payload-owned tables. They aren't
 * declared as Drizzle `.references()` because Payload owns the schema for
 * `articles` and `pillars`; the FK is enforced at the DB level by adding the
 * constraint manually (or by Payload's generated schema if we wire it later).
 * For now we rely on application-level integrity.
 */

export const bookmarks = pgTable(
  "bookmarks",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    articleId: text("article_id").notNull(),
    savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: uniqueIndex("bookmarks_pk").on(t.userId, t.articleId),
    userIdx: index("bookmarks_user_idx").on(t.userId),
  })
);

export const readingQueue = pgTable(
  "reading_queue",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    articleId: text("article_id").notNull(),
    /** Lower = read sooner. Client owns ordering; server stores it. */
    position: integer("position").notNull().default(0),
    addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: uniqueIndex("reading_queue_pk").on(t.userId, t.articleId),
    userPosIdx: index("reading_queue_user_pos_idx").on(t.userId, t.position),
  })
);

export const readingHistory = pgTable(
  "reading_history",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    articleId: text("article_id").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }).notNull().defaultNow(),
    /** 0–100, last known scroll depth at the time of last read. */
    scrollDepth: integer("scroll_depth").notNull().default(0),
  },
  (t) => ({
    pk: uniqueIndex("reading_history_pk").on(t.userId, t.articleId),
    userReadIdx: index("reading_history_user_read_idx").on(t.userId, t.readAt),
  })
);

export const follows = pgTable(
  "follows",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    pillarId: text("pillar_id").notNull(),
    followedAt: timestamp("followed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: uniqueIndex("follows_pk").on(t.userId, t.pillarId),
  })
);

export const newsletterSubscriptions = pgTable(
  "newsletter_subscriptions",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    /** Subscribed newsletter ids: 'am' | 'pm' | 'ai' | 'fund' | 'dev' | 'prod'. */
    newsletterId: text("newsletter_id").notNull(),
    /** Linked user id once they sign in. Null = guest subscriber. */
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }).notNull().defaultNow(),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  },
  (t) => ({
    pk: uniqueIndex("newsletter_subscriptions_pk").on(t.email, t.newsletterId),
    emailIdx: index("newsletter_subscriptions_email_idx").on(t.email),
  })
);

export const pendingNewsletterConfirmations = pgTable(
  "pending_newsletter_confirmations",
  {
    token: text("token").primaryKey(),
    email: text("email").notNull(),
    newsletterIds: text("newsletter_ids").array().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    emailIdx: index("pending_newsletter_confirmations_email_idx").on(t.email),
  })
);

export type Bookmark = typeof bookmarks.$inferSelect;
export type ReadingQueueItem = typeof readingQueue.$inferSelect;
export type ReadingHistory = typeof readingHistory.$inferSelect;
export type Follow = typeof follows.$inferSelect;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
