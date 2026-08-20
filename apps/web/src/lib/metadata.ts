import type { Metadata } from "next";

/**
 * Shared per-page SEO / social metadata helper.
 *
 * Zero DB/secret dependency — only reads the `NEXT_PUBLIC_*`-safe env var
 * chain — so this file is safe to import from any server file. No
 * `"server-only"` guard is needed, and it is never imported from a
 * `"use client"` file.
 *
 * See process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md
 * (RFC-001) for the full spec this implements.
 */

// ──────────────────────────────────────────────────────────────────────────
// Origin resolution
// ──────────────────────────────────────────────────────────────────────────

/**
 * The single source of truth for the site's public origin. `layout.tsx`
 * (for `metadataBase`) and this file's own `absoluteUrl()` both call this —
 * never duplicate the fallback chain elsewhere.
 *
 * Fallback order: explicit `NEXT_PUBLIC_SITE_URL` → `https://${VERCEL_URL}`
 * (automatic on Vercel preview deploys) → `http://localhost:3000` (dev
 * default). Production sets `NEXT_PUBLIC_SITE_URL=https://www.dailytechwire.com`
 * explicitly (a Vercel dashboard env var, not code — see Ops Runbook).
 *
 * MUST stay on the www host: next.config.ts 301s the bare apex
 * (dailytechwire.com) to www. Pointing this at the apex would make every
 * canonical/OG/sitemap URL resolve through a redirect.
 */
export function siteOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/**
 * Resolves `path` to an absolute URL against `siteOrigin()`. Used only for
 * the hand-rolled JSON-LD fields, which bypass the Next.js Metadata API
 * entirely — Metadata API fields (`openGraph.images`, `twitter.images`,
 * `alternates.canonical`) stay relative and let `metadataBase` resolve them
 * (the idiomatic Next.js pattern). Safe to call on already-absolute inputs
 * too: the WHATWG `URL` constructor ignores the base when the first
 * argument is already absolute.
 */
export function absoluteUrl(path: string): string {
  return new URL(path, siteOrigin()).toString();
}

// ──────────────────────────────────────────────────────────────────────────
// Shared constants
// ──────────────────────────────────────────────────────────────────────────

export interface OgImage {
  url: string;
  width?: number;
  height?: number;
  alt: string;
}

/** Static branded fallback (RFC-003). Covers the homepage, pillar pages, and
 *  hero-less articles. */
export const DEFAULT_OG_IMAGE: OgImage = {
  url: "/og-default.png",
  width: 1200,
  height: 630,
  alt: "DailyTechWire – Tech Intelligence, Wired Daily",
};

/**
 * The schema.org Organization node shared by every JSON-LD `publisher`
 * field (and, sitewide, the root Organization node itself — see
 * `(reader)/layout.tsx`). `foundingDate` is confirmed in
 * `process/context/all-context.md` ("independent newsroom, Singapore,
 * founded 2023"), so it's safe to state. `sameAs` lists only the official
 * profiles confirmed by the owner (2026-08-20: LinkedIn + Facebook, the same
 * two surfaced in the footer). Never invent additional social URLs — add one
 * here only when the owner confirms it (supersedes Decisions Log #1).
 * `logo` reuses `og-default.png` as a pragmatic stand-in for a dedicated
 * square logo raster (see plan's Out of Scope / Future Work).
 */
export const ORGANIZATION = {
  name: "Asia Press Centre Group (APCG)",
  url: siteOrigin(),
  logo: { url: absoluteUrl(DEFAULT_OG_IMAGE.url) },
  foundingDate: "2023",
  sameAs: [
    "https://www.linkedin.com/company/dailytechwire/",
    "https://www.facebook.com/apcgdailytechwire/",
  ],
};

// ──────────────────────────────────────────────────────────────────────────
// buildMetadata
// ──────────────────────────────────────────────────────────────────────────

export interface BuildMetadataInput {
  /** Omit to inherit the root layout's `title.default` verbatim (not run
   *  through the `%s – DailyTechWire` template) — this is the mechanism the
   *  homepage (RFC-006) uses. */
  title?: string;
  description: string;
  /** e.g. "/", "/article/foo", "/ai" — relative, resolved via metadataBase. */
  canonicalPath: string;
  /** Relative path preferred; resolved via metadataBase. Defaults to
   *  DEFAULT_OG_IMAGE. */
  image?: OgImage;
  type?: "website" | "article";
  /** Article only. */
  publishedTime?: string;
  /** Article only. */
  modifiedTime?: string;
  /** Article only. */
  authors?: string[];
  /** Article only — pillar label. */
  section?: string;
  robots?: { index: boolean; follow?: boolean };
  /** Extra Atom feed advertised for this page (e.g. the pillar's own feed).
   *  The sitewide /rss.xml is always included. */
  feed?: { url: string; title: string };
}

export function buildMetadata(input: BuildMetadataInput): Metadata {
  const {
    title,
    description,
    canonicalPath,
    image,
    type = "website",
    publishedTime,
    modifiedTime,
    authors,
    section,
    robots,
    feed,
  } = input;

  const ogImage = image ?? DEFAULT_OG_IMAGE;
  const ogImageDescriptor = {
    url: ogImage.url,
    width: ogImage.width,
    height: ogImage.height,
    alt: ogImage.alt,
  };

  const openGraph: Metadata["openGraph"] =
    type === "article"
      ? {
          type: "article",
          url: canonicalPath,
          siteName: "DailyTechWire",
          images: [ogImageDescriptor],
          publishedTime,
          modifiedTime,
          authors,
          section,
        }
      : {
          type: "website",
          url: canonicalPath,
          siteName: "DailyTechWire",
          images: [ogImageDescriptor],
        };

  return {
    ...(title !== undefined ? { title } : {}),
    description,
    alternates: {
      canonical: canonicalPath,
      // Feed autodiscovery must live HERE, not only in layout.tsx: Next.js
      // replaces (not deep-merges) a parent's `alternates` when a page sets
      // its own, so every buildMetadata page would otherwise drop the layout's
      // feed <link>.
      types: {
        "application/atom+xml": [
          { url: "/rss.xml", title: "DailyTechWire" },
          ...(feed ? [feed] : []),
        ],
      },
      // languages: reserved for hreflang once i18n subpath routing
      // (`/en /id /vi`, invariant #9) actually ships (Architecture Decision
      // 8). Do NOT populate — no locale routing exists yet.
    },
    openGraph,
    twitter: {
      card: "summary_large_image",
      images: [ogImage.url],
    },
    ...(robots ? { robots } : {}),
  };
}

// ──────────────────────────────────────────────────────────────────────────
// buildArticleJsonLd
// ──────────────────────────────────────────────────────────────────────────

interface JsonLdPerson {
  "@type": "Person";
  name: string;
  jobTitle?: string;
}

export interface BuildArticleJsonLdInput {
  title: string;
  /** Dek / standfirst. */
  description: string;
  /** Absolute — pass `absoluteUrl(canonicalPath)`. */
  canonicalUrl: string;
  /** Absolute. */
  imageUrl: string;
  imageWidth?: number;
  imageHeight?: number;
  datePublished: string;
  dateModified: string;
  authorName: string;
  /** Maps to schema.org `Person.jobTitle`. */
  authorRole?: string;
  coAuthorNames?: string[];
}

export function buildArticleJsonLd(input: BuildArticleJsonLdInput) {
  const {
    title,
    description,
    canonicalUrl,
    imageUrl,
    imageWidth,
    imageHeight,
    datePublished,
    dateModified,
    authorName,
    authorRole,
    coAuthorNames,
  } = input;

  const primaryAuthor: JsonLdPerson = {
    "@type": "Person",
    name: authorName,
    ...(authorRole ? { jobTitle: authorRole } : {}),
  };

  const author: JsonLdPerson | JsonLdPerson[] =
    coAuthorNames && coAuthorNames.length > 0
      ? [primaryAuthor, ...coAuthorNames.map((name) => ({ "@type": "Person" as const, name }))]
      : primaryAuthor;

  // A bare URL string is schema.org-valid for `image` too — only add
  // width/height as sibling properties on the image entry when both are
  // known.
  const image = imageWidth && imageHeight ? [{ url: imageUrl, width: imageWidth, height: imageHeight }] : [imageUrl];

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description,
    image,
    datePublished,
    dateModified,
    author,
    publisher: { "@type": "Organization", ...ORGANIZATION },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
  };
}

// ──────────────────────────────────────────────────────────────────────────
// toJsonLdScript
// ──────────────────────────────────────────────────────────────────────────

/**
 * Serializes `data` for a `<script type="application/ld+json">` body,
 * escaping every literal `<` to its unicode escape (`<`).
 *
 * This is a required security detail, not optional polish: `JSON.stringify`
 * does not escape `</script>` sequences, and since editorial `title`/`dek`
 * values are set by Author/Editor/Admin CMS users (not fully
 * trusted-by-construction), an unescaped `</script>` inside a title could
 * break out of the script tag. Callers must render the script tag's
 * `dangerouslySetInnerHTML` from this function's return value, never from
 * raw `JSON.stringify`.
 */
export function toJsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
