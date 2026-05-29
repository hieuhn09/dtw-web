import type { CollectionConfig } from "payload";

/**
 * Corrections — public log of every editorial correction.
 *
 * Renders on `/trust/corrections`. The log is append-only in editorial practice;
 * the DB allows updates because correcting a correction is sometimes needed.
 */
export const Corrections: CollectionConfig = {
  slug: "corrections",
  admin: {
    useAsTitle: "summary",
    defaultColumns: ["article", "correctionDate", "summary"],
    description: "Public corrections log. Every entry shows on /trust/corrections.",
  },
  fields: [
    {
      name: "article",
      type: "relationship",
      relationTo: "articles",
      required: true,
    },
    {
      name: "correctionDate",
      type: "date",
      required: true,
      defaultValue: () => new Date(),
      admin: { date: { pickerAppearance: "dayOnly" } },
    },
    {
      name: "summary",
      type: "text",
      required: true,
      admin: { description: "One-line summary that appears next to the article title." },
    },
    {
      name: "wasText",
      type: "textarea",
      required: true,
      admin: { description: "The incorrect text, struck through in the log." },
    },
    {
      name: "nowText",
      type: "textarea",
      required: true,
      admin: { description: "The corrected text." },
    },
    {
      name: "editor",
      type: "relationship",
      relationTo: "users",
      admin: { description: "User who signed off the correction." },
    },
  ],
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === "editor" || req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "editor" || req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
};
