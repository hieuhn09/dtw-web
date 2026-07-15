import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/metadata";

// Deliberately does NOT disallow /r/[token] (affiliate redirect) — that
// route does not exist in the codebase yet (confirmed by direct search).
// Add it to this disallow list only when that route ships. Deliberately
// does NOT disallow /asia or /asia/* — those are permanent 301 redirects to
// /latest (next.config.ts) and should stay crawlable so link equity
// consolidates onto /latest.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/account",
        "/search",
        "/reset-password",
        "/preview",
        "/exit-preview",
        "/api",
      ],
    },
    sitemap: `${siteOrigin()}/sitemap.xml`,
  };
}
