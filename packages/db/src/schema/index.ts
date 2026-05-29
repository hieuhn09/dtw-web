// Drizzle schema barrel.
//
// Split of responsibilities (as of E3):
//
//   Drizzle owns (this barrel):
//     - auth tables: users, sessions, accounts, verifications  (Better-Auth, Phase E2)
//     - reader-data tables: bookmarks, reading_queue, reading_history, follows,
//       newsletter_subscriptions, pending_newsletter_confirmations
//
//   Payload owns (apps/web/payload.config.ts):
//     - editorial entities: articles, pillars, subsections, tags, authors,
//       wire_drops, corrections, sponsor_slots, engine_conflict_log
//     - + Payload built-ins: payload_users, payload_preferences, payload_migrations
//
// Both run in the same Postgres DB but in non-overlapping tables. account.ts
// FKs reference Payload-owned tables by name (text columns), not via Drizzle
// `references()`, because Drizzle doesn't see Payload's schema. The relations
// stay correct because the IDs match the values Payload generates.

export * from "./auth";
export * from "./account";
