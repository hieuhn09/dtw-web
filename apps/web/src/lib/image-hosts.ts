/**
 * Which image hosts may be served through the Next image optimizer.
 *
 * Imported by BOTH `next.config.ts` (to build `images.remotePatterns`) and
 * `components/cover-art.tsx` (which sits in the client graph, and decides
 * per-URL whether `next/image` is usable at all). That double duty is why this
 * module stays dependency-free: no React, no JSX, no `server-only` import —
 * any of those would break one of the two callers.
 */

/**
 * Production Central CMS host, hardcoded on purpose.
 *
 * `CMS_URL` is a server-only env var, so in the browser bundle it reads as
 * `undefined` — this literal is what the client side actually matches hero
 * URLs against. Production hero URLs look like
 * `https://apcg-cms.vercel.app/api/media/file/<slug>.jpeg`, so server and
 * client agree there. They can diverge when the CMS env var points somewhere
 * else (e.g. a local CMS in dev): the server would optimize a URL the client
 * does not recognise. Harmless in dev — worst case is a hydration warning on
 * that one image — but do not rely on a non-production CMS host here.
 */
const PRODUCTION_CMS_HOST = "apcg-cms.vercel.app";

function hostOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname || null;
  } catch {
    return null;
  }
}

function configuredCmsUrl(): string | undefined {
  // Defensive on both counts: `process` is absent in some browser runtimes, and
  // the client-side shim for it is only guaranteed to expose NEXT_PUBLIC_ keys.
  if (typeof process === "undefined") return undefined;
  return process.env?.CMS_URL;
}

/** Hostnames allowed through the optimizer, de-duplicated. */
export const OPTIMIZABLE_IMAGE_HOSTS: ReadonlyArray<string> = Array.from(
  new Set(
    [hostOf(configuredCmsUrl()), PRODUCTION_CMS_HOST].filter(
      (h): h is string => h !== null
    )
  )
);

/**
 * True only for an absolute http(s) URL on one of the allowed hosts. Returns
 * false — never throws — for relative paths, malformed URLs, other protocols
 * and null-ish input, so call sites can use it as a plain guard before
 * reaching for `next/image`.
 */
export function canOptimizeImage(src: string | null | undefined): boolean {
  if (!src) return false;
  let parsed: URL;
  try {
    parsed = new URL(src);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
  return OPTIMIZABLE_IMAGE_HOSTS.includes(parsed.hostname);
}
