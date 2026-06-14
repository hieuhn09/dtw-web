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
