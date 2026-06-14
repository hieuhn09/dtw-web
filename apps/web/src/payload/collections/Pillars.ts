import type { CollectionConfig } from "payload";
import { revalidatePillar, revalidatePillarDelete } from "../hooks/revalidate";

/**
 * Pillars — top-level taxonomy. Year 1 = 6 fixed pillars (AI, Startups, Latest,
 * Dev, Products, Policy) but the schema supports adding more without a deploy
 * (invariant #8 in process/context/all-context.md).
 *
 * Title is localised (en/vi/id) via a group field rather than Payload's native
 * localization plugin so dev doesn't need that wire-up yet. When we add real
 * locale switching in E5+ we can migrate the field type.
 *
 * E3c afterChange busts BOTH `pillars:all` (nav) and `articles:all`, since a
 * pillar's color/label is joined into article cards via query depth.
 */
export const Pillars: CollectionConfig = {
  slug: "pillars",
  admin: {
    useAsTitle: "slug",
    defaultColumns: ["slug", "order", "color"],
    description: "Top-level beats. Order controls nav + homepage band order.",
  },
  hooks: {
    afterChange: [revalidatePillar],
    afterDelete: [revalidatePillarDelete],
  },
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description:
          "URL slug, matches frontend pillar ids (ai|startups|latest|dev|products|policy).",
      },
    },
    {
      name: "title",
      type: "group",
      fields: [
        { name: "en", type: "text", required: true },
        { name: "vi", type: "text" },
        { name: "id", type: "text" },
      ],
      admin: { description: "Short label for nav, chips, and homepage band (e.g. \"AI\")." },
    },
    {
      name: "heading",
      type: "text",
      admin: {
        description:
          "Long heading shown as the H1 on the pillar page (e.g. \"Artificial Intelligence\"). Falls back to the short title if empty.",
      },
    },
    {
      name: "color",
      type: "text",
      required: true,
      admin: {
        description: "CSS color reference (var(--ai) etc.) used in nav + cover art tints.",
      },
    },
    {
      name: "icon",
      type: "text",
      required: true,
      admin: {
        description:
          "Icon name from apps/web/src/components/icons.tsx (spark | trend-up | clock | code | product | policy).",
      },
    },
    {
      name: "order",
      type: "number",
      required: true,
      defaultValue: 0,
      min: 0,
      admin: { description: "Lower = earlier in nav + homepage Pillar Showcase." },
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        description:
          "Short tagline shown on the pillar page header. One sentence.",
      },
    },
  ],
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === "editor" || req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "editor" || req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
};
