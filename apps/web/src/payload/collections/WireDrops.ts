import type { CollectionConfig } from "payload";
import { revalidateWireDrop, revalidateWireDropDelete } from "../hooks/revalidate";

/**
 * Wire Drops — the realtime homepage band. ≤ 150 chars + city + timestamp.
 *
 * Auto-publish on insert. The E3c afterChange hook busts the `wire-drops` cache
 * tag so the homepage band refreshes on next read; Phase F adds a Soketi/Pusher
 * broadcast on the same hook for true realtime. Editors can delete; nobody
 * edits the text once it's wired.
 */
export const WireDrops: CollectionConfig = {
  slug: "wireDrops",
  admin: {
    useAsTitle: "text",
    defaultColumns: ["city", "time", "text", "publishedAt"],
    description:
      "Realtime band on the homepage. Auto-published on insert. Keep each drop under 150 chars.",
  },
  hooks: {
    afterChange: [revalidateWireDrop],
    afterDelete: [revalidateWireDropDelete],
  },
  fields: [
    {
      name: "time",
      type: "text",
      required: true,
      admin: { description: "Display time string e.g. '08:42'. Local time, no timezone." },
    },
    { name: "city", type: "text", required: true },
    {
      name: "text",
      type: "textarea",
      required: true,
      maxLength: 200,
      admin: { description: "≤ 150 chars (the spec); we cap at 200 server-side as a safety net." },
    },
    {
      name: "publishedAt",
      type: "date",
      required: true,
      defaultValue: () => new Date(),
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
  ],
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user?.role),
    update: ({ req }) => req.user?.role === "editor" || req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "editor" || req.user?.role === "admin",
  },
};
