import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Better-Auth core tables. Schema mirrors the Better-Auth Drizzle adapter's
 * expected shape so we can plug Better-Auth in (Phase E2) without migrating.
 *
 * Reader / Pro / Author / Editor / Admin — see process/context/auth/all-auth.md.
 * 2FA enforced on Editor + Admin at the Better-Auth layer; the schema doesn't
 * gate it.
 */

export const roleEnum = pgEnum("auth_user_role", [
  "reader",
  "pro",
  "author",
  "editor",
  "admin",
]);

export const users = pgTable(
  "auth_users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    role: roleEnum("role").notNull().default("reader"),
    /** TOTP seed once the user enables 2FA. Required when role is editor/admin. */
    twoFactorSecret: text("two_factor_secret"),
    twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailUnique: uniqueIndex("auth_users_email_unique").on(t.email),
    roleIdx: index("auth_users_role_idx").on(t.role),
  })
);

export const sessions = pgTable(
  "auth_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    tokenUnique: uniqueIndex("auth_sessions_token_unique").on(t.token),
    userIdx: index("auth_sessions_user_idx").on(t.userId),
  })
);

/**
 * OAuth provider linkage. One row per (provider, providerAccountId).
 * `password` is for the email/password fallback flow if we ever enable it;
 * the magic-link flow leaves it null.
 */
export const accounts = pgTable(
  "auth_accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerId: text("provider_id").notNull(),
    accountId: text("account_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    idToken: text("id_token"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    providerAccountUnique: uniqueIndex("auth_accounts_provider_account_unique").on(
      t.providerId,
      t.accountId
    ),
    userIdx: index("auth_accounts_user_idx").on(t.userId),
  })
);

/** Magic-link tokens, password-reset tokens, etc. Single-use, short-lived. */
export const verifications = pgTable(
  "auth_verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    identifierIdx: index("auth_verifications_identifier_idx").on(t.identifier),
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
