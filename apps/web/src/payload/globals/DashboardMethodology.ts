import type { GlobalConfig } from "payload";
import { revalidateDashboardMethodology } from "../hooks/revalidate";

/**
 * Dashboard methodology — AI-only shape (Lean Deviation #4 in
 * `ai-leaderboard-llmstats_PLAN_30-07-26.md`). The big plan's
 * `fundingMethodology` group is not created this pass — no funding UI reads
 * it yet; adding it back later is an additive field + migration, not a
 * breaking change.
 *
 * Editor/Admin can change this copy in /admin without a deploy; the reader
 * app re-reads it via `lib/payload-server.ts::getDashboardMethodology()`,
 * cache-busted by the afterChange hook below. No versions/drafts — same
 * operational-setting shape as `PaywallSettings`.
 *
 * EXECUTE-time deviation (30-07-26): the plan specifies `{ en, vi, id }`
 * group sub-fields (matching the `Pillars.title` / `Tags.title` convention).
 * Payload's Postgres/Drizzle adapter silently DROPS any field literally
 * named "id" at any nesting depth — see
 * `@payloadcms/drizzle/dist/schema/traverseFields.js`:
 * `if ('name' in field && field.name === 'id') { return; }`. No error is
 * raised and the generated TS type still lists the field, but no DB column
 * is ever created for it — confirmed by inspecting the generated migration
 * SQL, and confirmed as a PRE-EXISTING, silent bug in `Pillars.title.id` /
 * `Tags.title.id` (their initial migration never created a `title_id`
 * column either). Rather than replicate that landmine in a brand-new field,
 * the Indonesian locale key is named `ind` here (ISO 639-2 code) and mapped
 * back to the app-facing `id` key in `getDashboardMethodology()`. The
 * pre-existing Pillars/Tags instances of this bug are OUT OF SCOPE for this
 * plan and are left untouched — see the EXECUTE session report for the full
 * note; fixing those needs its own migration + backfill decision.
 */
export const DashboardMethodology: GlobalConfig = {
  slug: "dashboardMethodology",
  admin: {
    description:
      "AI Leaderboard methodology + disclaimer copy shown under the table. Changes apply within ~5 minutes, or immediately after a save via cache revalidation.",
  },
  hooks: {
    afterChange: [revalidateDashboardMethodology],
  },
  fields: [
    {
      name: "aiMethodology",
      type: "group",
      fields: [
        { name: "en", type: "textarea", required: true },
        { name: "vi", type: "textarea" },
        {
          name: "ind",
          type: "textarea",
          label: "Indonesian (id)",
          admin: {
            description:
              "Indonesian translation. Named \"ind\" not \"id\" — Payload silently drops any field named \"id\" at any nesting depth (see file header comment).",
          },
        },
      ],
      admin: {
        description:
          "Methodology copy shown under the AI Leaderboard table (source + scoring method).",
      },
    },
    {
      name: "disclaimer",
      type: "group",
      fields: [
        { name: "en", type: "text", required: true },
        { name: "vi", type: "text" },
        {
          name: "ind",
          type: "text",
          label: "Indonesian (id)",
          admin: {
            description:
              "Indonesian translation. Named \"ind\" not \"id\" — Payload silently drops any field named \"id\" at any nesting depth (see file header comment).",
          },
        },
      ],
      admin: {
        description:
          "Short disclaimer line (e.g. \"For informational purposes only · not investment or procurement advice\").",
      },
    },
  ],
  access: {
    read: () => true,
    update: ({ req }) => req.user?.role === "editor" || req.user?.role === "admin",
  },
};
