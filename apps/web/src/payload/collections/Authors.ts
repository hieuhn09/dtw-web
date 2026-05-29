import type { CollectionConfig } from "payload";

/**
 * Authors — byline directory. Separate from Users (which is editorial CMS
 * accounts) so that a published byline can outlive the user record and so we
 * can credit external contributors who never log in.
 *
 * When an Editor or Author publishes from /admin, the system optionally
 * suggests linking their User record to an Author row but doesn't require it.
 */
export const Authors: CollectionConfig = {
  slug: "authors",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "role", "city"],
    listSearchableFields: ["name", "role", "city"],
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "role",
      type: "text",
      required: true,
      admin: {
        description: "Byline role: 'Asia Bureau Chief', 'AI Correspondent', etc.",
      },
    },
    {
      name: "city",
      type: "text",
      required: true,
      admin: {
        description:
          "Reporter base. Used by the CityChip on the homepage Wire Drops and by the article header.",
      },
    },
    {
      name: "bio",
      type: "textarea",
      admin: { description: "Short author bio. Shown on the author page (future)." },
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      admin: {
        description:
          "Optional link to a CMS user. Lets us auto-fill the byline when the user publishes.",
      },
    },
  ],
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user?.role),
    update: ({ req }) => req.user?.role === "editor" || req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
};
