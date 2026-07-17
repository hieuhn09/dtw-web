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
      // Google still indexes the pre-relaunch `/computing/...` tree, which now
      // hard-404s (audit finding). Send those hits to the nearest live section
      // instead of a dead end, so inbound link equity and readers survive.
      { source: "/computing", destination: "/products", permanent: true },
      { source: "/computing/:path*", destination: "/products", permanent: true },
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
