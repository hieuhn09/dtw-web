import type { CollectionConfig } from "payload";

/**
 * Media — uploaded images (article hero art, in-body figures).
 *
 * In production, files are stored in Cloudflare R2 via the `@payloadcms/storage-s3`
 * plugin (wired in payload.config.ts, gated on the R2_* env vars). Without those
 * env vars (e.g. a local dev box with no R2), Payload falls back to local disk —
 * fine for dev, NOT viable on Vercel's ephemeral filesystem, which is why R2 is
 * required in the deployed environments.
 *
 * `imageSizes` generate responsive derivatives on upload (sharp) so the reader
 * can ship a sensible srcset. Full Cloudflare Images / AVIF pipeline is a later
 * optimization; these cover launch.
 */
export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    useAsTitle: "alt",
    description: "Uploaded images. Stored in Cloudflare R2 in production.",
  },
  access: {
    read: () => true, // public reader site serves these
    create: ({ req }) => Boolean(req.user?.role),
    update: ({ req }) => Boolean(req.user?.role),
    delete: ({ req }) => req.user?.role === "editor" || req.user?.role === "admin",
  },
  upload: {
    mimeTypes: ["image/*"],
    imageSizes: [
      { name: "thumbnail", width: 400 },
      { name: "card", width: 800 },
      { name: "hero", width: 1600 },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      admin: { description: "Alt text — required for accessibility (WCAG 2.1 AA)." },
    },
    {
      name: "credit",
      type: "text",
      admin: { description: "Photographer / source credit, shown as the caption." },
    },
  ],
};
