import type { CollectionConfig } from "payload";

/**
 * Tags — flat secondary taxonomy. Articles belong to one pillar but can carry
 * many tags. Examples: 'sovereign-AI', 'IPO', 'datacenters'.
 *
 * Title is localised the same way as Pillars (group field, not native loc).
 */
export const Tags: CollectionConfig = {
  slug: "tags",
  admin: {
    useAsTitle: "slug",
    defaultColumns: ["slug", "title.en"],
    listSearchableFields: ["slug"],
  },
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { description: "URL slug, lowercase-dashed." },
    },
    {
      name: "title",
      type: "group",
      fields: [
        { name: "en", type: "text", required: true },
        { name: "vi", type: "text" },
        { name: "id", type: "text" },
      ],
    },
  ],
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user?.role),
    update: ({ req }) => req.user?.role === "editor" || req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
};
