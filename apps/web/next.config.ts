import type { NextConfig } from "next";
// Relative, not `@/lib/...`: the tsconfig path alias does not resolve inside
// next.config.ts. Source of truth for the host list is that module — CoverArt
// imports the same one, so the component and the optimizer can never disagree
// about which URLs are optimizable.
import { OPTIMIZABLE_IMAGE_HOSTS } from "./src/lib/image-hosts";

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@dtw/ui", "@dtw/db"],
  // Hero images live on the Central CMS, so they must be allow-listed before
  // `next/image` will touch them (LCP work, 2026-09: PageSpeed measured 55-66%
  // of LCP spent in "resource load delay" because nothing preloaded the hero).
  // `pathname` is deliberately wide: `canOptimizeImage` matches on hostname
  // only, and a narrower pattern here would let a component hand the optimizer
  // a URL it then rejects with a 400.
  images: {
    remotePatterns: OPTIMIZABLE_IMAGE_HOSTS.map((hostname) => ({
      protocol: "https" as const,
      hostname,
      pathname: "/**",
    })),
  },
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
      // Same apex->www canonicalization, for the new domain ahead of the
      // rebrand cutover (process/features/rebrand/). Dormant until
      // opentechwire.com is attached to this Vercel project in Phase 6 — no
      // request can arrive with this Host header before then. The
      // dailytechwire.com rule above is intentionally left in place until
      // Phase 6 decommissions that domain (see D4 in the rebrand umbrella
      // plan — this is NOT a redirect from the old domain to the new one).
      {
        source: "/:path*",
        has: [{ type: "host", value: "opentechwire.com" }],
        destination: "https://www.opentechwire.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default config;
