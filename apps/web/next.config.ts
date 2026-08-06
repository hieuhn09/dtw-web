import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@dtw/ui", "@dtw/db"],
  // Lint is a CI concern, not a deploy gate — a lint hiccup must never block a
  // production build. Run `pnpm lint` separately. (The flat config also needs
  // `@eslint/eslintrc` as a direct devDep to resolve under pnpm; add it when
  // wiring CI lint.)
  eslint: { ignoreDuringBuilds: true },
  // The "asia" pillar was renamed to "latest" (2026-06-14). Preserve old links.
  async redirects() {
    return [
      { source: "/asia", destination: "/latest", permanent: true },
      { source: "/asia/:path*", destination: "/latest/:path*", permanent: true },
      // /about/newsroom moved to /newsroom (2026-07-16). Preserve old links.
      { source: "/about/newsroom", destination: "/newsroom", permanent: true },
      // /feed and /rss are the only genuine 1:1 equivalents from the
      // pre-relaunch WordPress URL space: the new site has a real Atom feed
      // at /rss.xml, so redirecting is warranted here (unlike /computing
      // below).
      { source: "/feed", destination: "/rss.xml", permanent: true },
      { source: "/rss", destination: "/rss.xml", permanent: true },
      // NOTE: the pre-relaunch `/computing/...` tree (WordPress, ~225 distinct
      // URLs per the GSC export) used to redirect here to /products. That was
      // removed 2026-08-06: mass-redirecting a whole unrelated tree to one
      // page reads to Google as a soft 404 — it passes no link equity and
      // burns crawl budget the domain can't spare (throttled since mid-June).
      // `middleware.ts` now returns a deliberate 410 Gone for /computing and
      // the rest of the dead WordPress URL space instead, which Google drops
      // from its index in one crawl pass rather than several 404 confirmations.
      // Canonical host is www (matches NEXT_PUBLIC_SITE_URL, which the sitemap,
      // robots, canonical tags and OG urls are all built from). Send the bare
      // apex to www so the two hosts don't compete in the index.
      {
        source: "/:path*",
        has: [{ type: "host", value: "dailytechwire.com" }],
        destination: "https://www.dailytechwire.com/:path*",
        permanent: true,
      },
    ];
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.alias = {
      ...(webpackConfig.resolve.alias ?? {}),
      "@payload-config": path.resolve(dirname, "./payload.config.ts"),
    };
    return webpackConfig;
  },
};

export default withPayload(config);
