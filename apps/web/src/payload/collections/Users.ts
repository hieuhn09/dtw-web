import type { CollectionConfig } from "payload";

/**
 * Payload-managed editorial users (Author / Editor / Admin).
 *
 * NOTE: This collection is separate from the Better-Auth `users` table that
 * holds reader accounts (managed by Drizzle in packages/db/src/schema/auth.ts).
 *
 * Reader sign-in (magic link, OAuth) flows through Better-Auth in Phase E2 and
 * never touches this collection. Editorial sign-in flows through Payload's
 * built-in /admin login and uses the rows here.
 *
 * The split reconciles once Better-Auth lands: editorial users will be granted
 * /admin access via Better-Auth's role check, and this Payload collection will
 * be removed or stub-mirrored. For E3 we keep both — Payload owns editorial
 * identity end-to-end so we don't gate on auth work that hasn't happened yet.
 */
export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    tokenExpiration: 60 * 60 * 24 * 7, // 7 days
    cookies: { sameSite: "Lax" },
    verify: false, // dev: no email verification step yet (Resend wires up later)
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "name", "role"],
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "author",
      options: [
        { label: "Author", value: "author" },
        { label: "Editor", value: "editor" },
        { label: "Admin", value: "admin" },
      ],
      admin: {
        description:
          "Author: draft/submit. Editor: publish + manage taxonomy. Admin: full access. 2FA enforced on Editor + Admin in production.",
      },
    },
  ],
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => req.user?.role === "admin",
    update: ({ req }) =>
      req.user?.role === "admin"
        ? true
        : req.user
          ? { id: { equals: req.user.id } }
          : false,
    delete: ({ req }) => req.user?.role === "admin",
  },
};
