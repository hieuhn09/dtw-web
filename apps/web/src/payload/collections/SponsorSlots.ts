import type { CollectionConfig } from "payload";

/**
 * Sponsor slots — configurable sponsored placements (homepage strip, dashboard
 * sponsor card). Empty article = the slot renders nothing (NOT a "your ad
 * here" placeholder).
 */
export const SponsorSlots: CollectionConfig = {
  slug: "sponsorSlots",
  admin: {
    useAsTitle: "slot",
    defaultColumns: ["slot", "article", "startsAt", "endsAt"],
    description: "Sponsored placements config. One row per slot location.",
  },
  fields: [
    {
      name: "slot",
      type: "select",
      required: true,
      options: [
        { label: "Homepage Sponsored Strip", value: "homepage_strip" },
        { label: "Dashboard — Funding Tracker", value: "dashboard_funding" },
        { label: "Dashboard — AI Leaderboard", value: "dashboard_ai" },
      ],
    },
    {
      name: "article",
      type: "relationship",
      relationTo: "articles",
      admin: {
        description: "The sponsored article to feature. Empty = the slot renders nothing.",
      },
    },
    { name: "startsAt", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
    { name: "endsAt", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
  ],
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
};
