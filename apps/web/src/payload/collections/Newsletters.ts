import type { CollectionConfig } from "payload";
import { revalidateNewsletter, revalidateNewsletterDelete } from "../hooks/revalidate";

/**
 * Newsletters — reader subscription products (AM Brief, PM Brief, AI Weekly,
 * Asia Funding Weekly, Dev Digest, Products & Deals). `slug` is the ONLY
 * linkage to Drizzle's `newsletter_subscriptions.newsletter_id` column — there
 * is no FK between the two systems (Payload doesn't see Drizzle's schema and
 * vice versa), so `slug` here must exactly match the `newsletterId` values
 * documented on `packages/db/src/schema/account.ts`
 * ('am' | 'pm' | 'ai' | 'fund' | 'dev' | 'prod'). Seeded via
 * `apps/web/scripts/seed-payload.ts`.
 */
export const Newsletters: CollectionConfig = {
  slug: "newsletters",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "cadence", "vertical", "active", "order"],
    description:
      "Reader newsletter products. `slug` must exactly match the reader app's newsletterId contract (am/pm/ai/fund/dev/prod) — changing it here without updating the app breaks the subscribe/toggle linkage.",
  },
  fields: [
    { name: "name", type: "text", required: true, unique: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "Linkage key to Drizzle's newsletter_subscriptions.newsletter_id — do not change casually.",
      },
    },
    { name: "cadence", type: "text", required: true },
    { name: "description", type: "textarea", required: true },
    { name: "vertical", type: "relationship", relationTo: "pillars" },
    { name: "active", type: "checkbox", defaultValue: true },
    { name: "order", type: "number", defaultValue: 0, required: true },
  ],
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === "editor" || req.user?.role === "admin",
    update: ({ req }) => req.user?.role === "editor" || req.user?.role === "admin",
    delete: ({ req }) => req.user?.role === "admin",
  },
  hooks: {
    afterChange: [revalidateNewsletter],
    afterDelete: [revalidateNewsletterDelete],
  },
};
