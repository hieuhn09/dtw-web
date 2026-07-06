import type { GlobalConfig } from "payload";
import { revalidatePaywallSettings } from "../hooks/revalidate";

/**
 * Paywall settings — currently just the guest/soft-nudge read threshold
 * (invariant #4: never hardcode the "3"). Editor/Admin can change this in
 * /admin without a deploy; the reader app re-reads it via
 * lib/payload-server.ts::getPaywallThreshold(), cache-busted by the
 * afterChange hook below.
 *
 * No versions/drafts — this is an operational setting, not editorial
 * content; a save takes effect immediately (subject to the cache window /
 * revalidateTag).
 */
export const PaywallSettings: GlobalConfig = {
  slug: "paywallSettings",
  admin: {
    description:
      "Controls the guest sign-in nudge / soft paywall trigger. Changes apply within ~5 minutes, or immediately after a save via cache revalidation.",
  },
  hooks: {
    afterChange: [revalidatePaywallSettings],
  },
  fields: [
    {
      name: "paywallThreshold",
      type: "number",
      required: true,
      defaultValue: 3,
      min: 1,
      admin: {
        description:
          "Number of distinct articles a guest can read before the sign-in nudge / paywall card appears. Signed-in readers are never gated by this in Phase 1.",
      },
    },
  ],
  access: {
    read: () => true,
    update: ({ req }) => req.user?.role === "editor" || req.user?.role === "admin",
  },
};
