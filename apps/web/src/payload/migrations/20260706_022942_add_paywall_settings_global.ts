import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// New Payload Global for Stage C's CMS-configurable paywall threshold
// (invariant #4 — never hardcode the free-read limit). No versions/drafts —
// this is an operational setting, a save takes effect immediately.
//
// NOTE: this file was generated offline (`payload migrate:create` with
// `disableDBConnect: true` — no live Postgres was available in this sandbox;
// see apps/web/src/payload/migrations/20260605_000000_engine_provenance.ts and
// 20260622_000000_pin_to_latest.ts for the same precedent). The CLI diffed
// against the last COMMITTED snapshot (20260531_094311_pillar_heading.json),
// which predates those two hand-written migrations (neither committed a
// matching .json snapshot), so the raw generated output redundantly
// re-added `pinned_to_latest`/`engine_source_url`/`engine_source_name` — those
// three columns are already applied by the migrations above and are stripped
// out here. Only the genuinely new `paywall_settings` table remains.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "paywall_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"paywall_threshold" numeric DEFAULT 3 NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "paywall_settings" CASCADE;`)
}
