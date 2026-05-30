import type { CollectionConfig } from "payload";
import { revalidateArticle, revalidateArticleDelete } from "../hooks/revalidate";

/**
 * Articles — the system of record.
 *
 * Load-bearing fields (see process/context/database/all-database.md and
 * process/features/engine-integration/_GUIDE.md):
 *
 *   origin           who initiated this row ('engine' | 'manual')
 *   editedByHuman    flips true on any CMS write by Author/Editor/Admin
 *   lockedFields     field names the Engine must NEVER overwrite
 *   version          monotonic counter; bumped on every write (optimistic lock)
 *
 * Enforcement (Phase E4):
 *   - `beforeChange` hook bumps `version` and sets `editedByHuman = true` when
 *     `req.user` is a CMS user.
 *   - The Engine REST endpoint validates `If-Match: <version>` and refuses
 *     writes that touch any field in `lockedFields`.
 *   - Skipped writes log to the engine_conflict_log collection.
 *
 * E3a started with the schema + admin UI. E3c adds the afterChange/afterDelete
 * revalidation hooks below. E4 adds the beforeChange version/lock enforcement.
 */
export const Articles: CollectionConfig = {
  slug: "articles",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "pillar", "status", "origin", "version", "publishedAt"],
    description:
      "Every story DTW publishes. Engine drafts flow in via API; editors review here.",
    listSearchableFields: ["title", "dek", "slug"],
    // "Preview" button → authenticated /preview route enables draft mode and
    // renders the unpublished draft exactly as it will look once published.
    preview: (doc) =>
      typeof doc?.slug === "string" ? `/preview?slug=${doc.slug}` : null,
  },
  versions: { drafts: true },
  hooks: {
    afterChange: [revalidateArticle],
    afterDelete: [revalidateArticleDelete],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Content",
          fields: [
            { name: "title", type: "text", required: true },
            {
              name: "slug",
              type: "text",
              required: true,
              unique: true,
              index: true,
              admin: {
                description: "URL slug. Auto-generated from title; editor can override.",
              },
            },
            { name: "dek", type: "textarea", required: true, label: "Standfirst (dek)" },
            {
              name: "body",
              type: "richText",
              admin: {
                description: "Article body. Stays in source language (translation invariant).",
              },
            },
            { name: "section", type: "text" },
            {
              name: "readMin",
              type: "number",
              required: true,
              defaultValue: 5,
              min: 1,
              label: "Read time (minutes)",
            },
            { name: "publishedAt", type: "date", required: true },
          ],
        },
        {
          label: "Taxonomy",
          fields: [
            {
              name: "pillar",
              type: "relationship",
              relationTo: "pillars",
              required: true,
              admin: { description: "One pillar per article." },
            },
            { name: "tags", type: "relationship", relationTo: "tags", hasMany: true },
            {
              name: "author",
              type: "relationship",
              relationTo: "authors",
              required: true,
              admin: { description: "Primary byline." },
            },
            {
              name: "coAuthors",
              type: "relationship",
              relationTo: "authors",
              hasMany: true,
            },
          ],
        },
        {
          label: "Disclosure",
          fields: [
            {
              name: "aiAssisted",
              type: "checkbox",
              defaultValue: false,
              label: "AI-assisted (translation/transcription only)",
              admin: {
                description:
                  "Triggers the AI-assisted disclosure box at top + middle + bottom. Non-dismissible (invariant).",
              },
            },
            {
              name: "sponsored",
              type: "checkbox",
              defaultValue: false,
              admin: {
                description:
                  "Triggers the Paid Partner band + top/middle/bottom disclosures. Sponsor name required.",
              },
            },
            {
              name: "sponsor",
              type: "text",
              admin: {
                condition: (data) => Boolean(data?.sponsored),
                description: "Sponsor brand name (shown on the disclosure box).",
              },
              // Required only when sponsored — a sponsored article must never
              // publish as "PAID PARTNER · undefined".
              validate: (value: string | null | undefined, { data }: { data?: { sponsored?: boolean } }) => {
                if (data?.sponsored && !value) {
                  return "Sponsor name is required when 'sponsored' is checked.";
                }
                return true;
              },
            },
            { name: "affiliate", type: "checkbox", defaultValue: false },
            { name: "deepDive", type: "checkbox", defaultValue: false },
          ],
        },
        {
          label: "Engine contract",
          description:
            "Provenance + conflict-resolution fields. Editor-controlled. See process/features/engine-integration/_GUIDE.md.",
          fields: [
            {
              name: "origin",
              type: "select",
              required: true,
              defaultValue: "manual",
              options: [
                { label: "Engine (auto)", value: "engine" },
                { label: "Manual (editor)", value: "manual" },
              ],
              admin: { description: "How this article entered the system." },
            },
            {
              name: "editedByHuman",
              type: "checkbox",
              defaultValue: true,
              admin: {
                description:
                  "True if any CMS user has touched this article. Engine writes set false; editor writes set true.",
                readOnly: true,
              },
            },
            {
              name: "lockedFields",
              type: "array",
              fields: [{ name: "field", type: "text" }],
              admin: {
                description:
                  "Field names the Engine must NEVER overwrite (e.g. title, dek, body). Locked fields persist until explicitly released.",
              },
            },
            {
              name: "version",
              type: "number",
              defaultValue: 1,
              required: true,
              admin: {
                description: "Optimistic-lock counter. Bumped on every write.",
                readOnly: true,
              },
            },
          ],
        },
        {
          label: "Media",
          fields: [
            {
              name: "heroImage",
              type: "upload",
              relationTo: "media",
              admin: {
                description:
                  "Hero image (uploaded to R2). If empty, the reader falls back to generative cover art.",
              },
            },
            {
              name: "imageLabel",
              type: "text",
              admin: { description: "Label overlaid on the generative cover art when there is no hero image." },
            },
            {
              name: "imageUrl",
              type: "text",
              admin: { description: "Deprecated — use the heroImage upload instead. External URL fallback only." },
            },
          ],
        },
      ],
    },
  ],
  access: {
    read: () => true, // public reader site
    create: ({ req }) =>
      req.user?.role === "author" || req.user?.role === "editor" || req.user?.role === "admin",
    update: ({ req }) =>
      req.user?.role === "editor" || req.user?.role === "admin"
        ? true
        : req.user?.role === "author"
          ? { "author.user": { equals: req.user.id } } // authors edit only drafts where their User row is linked via the Author
          : false,
    delete: ({ req }) => req.user?.role === "admin",
  },
};
