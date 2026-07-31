import type { CollectionConfig } from "payload";
import { revalidateAiModel, revalidateAiModelDelete } from "../hooks/revalidate";

/**
 * AI Leaderboard rows — CMS-backed, weekly-cron-refreshed. See
 * `ai-leaderboard-llmstats_PLAN_30-07-26.md` (Schema Reference) and
 * `apps/web/src/lib/dashboards/ai-llmstats.ts` (Group G, not yet built) for
 * the LLM Stats adapter that writes to this collection.
 *
 * `rank` / `model` / `sourceSlugLlmstats` are editor-only and never
 * cron-written (AD-5, amended 2026-07-30 2nd). Every other data field is
 * cron-writable UNLESS its name appears in `editorLocked` — same
 * skip-list shape/spirit as `Articles.lockedFields`
 * (process/context/database/all-database.md, AD-4). The cron never creates
 * rows, only refreshes existing ones matched by `sourceSlugLlmstats`; an
 * upstream id with no matching row is logged and skipped.
 */
export const AiModels: CollectionConfig = {
  slug: "aiModels",
  admin: {
    useAsTitle: "model",
    defaultColumns: ["model", "maker", "general", "inputPrice", "asOfScores"],
    description:
      "AI Leaderboard rows. rank/model/sourceSlugLlmstats are editor-owned; every other data field is refreshed weekly by the ai-weekly cron unless its name is listed in editorLocked below.",
  },
  fields: [
    {
      name: "rank",
      type: "number",
      admin: { description: "Editorial override sort key. Never cron-written." },
    },
    {
      name: "model",
      type: "text",
      required: true,
      admin: { description: "Editor-owned display name. Never cron-written." },
    },
    {
      name: "maker",
      type: "text",
      required: true,
      admin: { description: "Cron-writable — LLM Stats /v1/models organization.name." },
    },
    {
      name: "general",
      type: "number",
      admin: {
        description:
          "Cron-writable — /v1/rankings?category=general conservative_rating (raw ~0-60 TrueSkill scale, not 0-100). Null if the model falls outside the top-50.",
      },
    },
    {
      name: "reasoning",
      type: "number",
      admin: { description: "Cron-writable — /v1/rankings?category=reasoning conservative_rating." },
    },
    {
      name: "coding",
      type: "number",
      admin: {
        description:
          "Cron-writable — /v1/rankings?category=code conservative_rating (LLM Stats category id is \"code\"; \"coding\" is an accepted alias for the same data).",
      },
    },
    {
      name: "math",
      type: "number",
      admin: { description: "Cron-writable — /v1/rankings?category=math conservative_rating." },
    },
    {
      name: "search",
      type: "number",
      admin: { description: "Cron-writable — /v1/rankings?category=search conservative_rating." },
    },
    {
      name: "vision",
      type: "number",
      admin: { description: "Cron-writable — /v1/rankings?category=vision conservative_rating." },
    },
    {
      name: "inputPrice",
      type: "number",
      admin: {
        description:
          "Cron-writable — min non-null providers[].input_price_per_m from /v1/models (USD per million tokens). 0 = free.",
      },
    },
    {
      name: "outputPrice",
      type: "number",
      admin: {
        description:
          "Cron-writable — min non-null providers[].output_price_per_m from /v1/models (USD per million tokens). 0 = free.",
      },
    },
    {
      name: "released",
      type: "date",
      admin: {
        description: "Cron-writable — /v1/models release_date.",
        date: { pickerAppearance: "dayOnly" },
      },
    },
    {
      name: "sourceSlugLlmstats",
      type: "text",
      admin: {
        description:
          "Editor-owned exact join key — the LLM Stats /v1/models id (e.g. \"gpt-5.6-sol\"). Never cron-written; the cron matches rows by this field.",
      },
    },
    {
      name: "asOfScores",
      type: "date",
      admin: {
        description: "Cron-writable — fetch timestamp of the last successful ai-weekly refresh.",
        date: { pickerAppearance: "dayAndTime" },
      },
    },
    {
      name: "editorLocked",
      type: "array",
      fields: [{ name: "field", type: "text" }],
      admin: {
        description:
          "Field names the ai-weekly cron must NEVER overwrite on this row (e.g. \"maker\", \"general\"). Locked fields persist until explicitly released.",
      },
    },
  ],
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === "editor" || req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "editor" || req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  hooks: {
    afterChange: [revalidateAiModel],
    afterDelete: [revalidateAiModelDelete],
  },
};
