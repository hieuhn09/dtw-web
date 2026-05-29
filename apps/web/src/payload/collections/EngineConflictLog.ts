import type { CollectionConfig } from "payload";

/**
 * Engine conflict log — every skipped Engine write lands here for audit.
 *
 * Read-only in the admin UI: the Engine writes via API; the conflict-detector
 * hook (Phase E4) populates rows automatically. Editorial leadership reads the
 * log to see how often Engine + editors collide on the same article.
 *
 * See process/features/engine-integration/_GUIDE.md.
 */
export const EngineConflictLog: CollectionConfig = {
  slug: "engineConflictLog",
  admin: {
    useAsTitle: "field",
    defaultColumns: ["article", "field", "reason", "occurredAt"],
    description:
      "Read-only audit. Populated automatically by the conflict detector (Phase E4).",
  },
  fields: [
    { name: "article", type: "relationship", relationTo: "articles", required: true },
    { name: "field", type: "text", required: true, admin: { description: "Field name the Engine tried to write." } },
    { name: "engineValue", type: "json", admin: { description: "What the Engine tried to write." } },
    { name: "currentValue", type: "json", admin: { description: "What was in the DB at the time." } },
    {
      name: "reason",
      type: "select",
      required: true,
      options: [
        { label: "Locked field", value: "locked" },
        { label: "Edited by human", value: "human_edited" },
        { label: "Version mismatch", value: "version_mismatch" },
      ],
    },
    {
      name: "occurredAt",
      type: "date",
      required: true,
      defaultValue: () => new Date(),
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
  ],
  access: {
    read: ({ req }) => req.user?.role === "editor" || req.user?.role === "admin",
    create: () => false, // populated by hooks only
    update: () => false,
    delete: ({ req }) => req.user?.role === "admin",
  },
};
