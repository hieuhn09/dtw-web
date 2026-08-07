/**
 * Adapter from Payload's Article shape to the view-model the reader UI was
 * originally written against. Lets bands keep their existing prop types
 * (pillar/author as strings) without each one knowing about relationship
 * expansion.
 *
 * Server pages call `toArticleView()` after fetching from Payload; client
 * components receive the flat shape and stay unchanged.
 */

import type { PillarId } from "./data";
import type { Article } from "../payload/payload-types";

/** Lexical editor state for an article body. Passed only to the article detail
 *  page — deliberately NOT part of ArticleView so list/related views stay lean
 *  and don't serialise every body into the page payload. */
export type ArticleBodyState = Article["body"];

/**
 * A pillar's display label, tolerating both shapes it arrives in.
 *
 * The local Payload models `title` as a group of {en,vi,id}; the Central CMS
 * declares it as a plain localized text field and serves it already resolved to a
 * string. Both reach the reader, and which one you get depends on WHERE the pillar
 * came from rather than on CMS_SOURCE: `getPillars`/`getNavPillars` run it through
 * the client's own parser and always hand back the object, but a pillar populated
 * inside an article (depth 1 on /api/public/articles) arrives raw — a string.
 *
 * Reading `.title.en` on the string form yields undefined and silently degrades the
 * label to the slug: "ai" where the page used to say "AI". No error, no empty page,
 * just quietly worse copy on every card, RSS category and JSON-LD section.
 */
export function pillarLabel(
  pillar: { title?: unknown; slug?: string | null; heading?: string | null } | null | undefined,
  fallback = "Latest",
): string {
  if (!pillar) return fallback;
  const t = pillar.title;
  if (typeof t === "string" && t) return t;
  const en = (t as { en?: string } | null | undefined)?.en;
  return en || pillar.slug || fallback;
}

export interface ArticleView {
  id: string;
  slug: string;
  pillar: PillarId;
  pillarColor: string;
  pillarLabel: string;
  author: string;
  authorCity: string;
  authorRole: string;
  coAuthors: ReadonlyArray<string>;
  title: string;
  dek: string;
  section: string;
  readMin: number;
  published: string; // ISO
  sponsored: boolean;
  sponsor?: string;
  aiAssisted: boolean;
  deepDive: boolean;
  affiliate: boolean;
  image?: { label: string };
  /** Uploaded hero image URL (R2-backed), or null to fall back to cover art. */
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  /** Photographer / source credit for the hero image, shown beneath it. */
  heroImageCredit: string | null;
}

function pickRelationship<T extends { id: string | number }>(
  v: (string | number | T) | null | undefined
): T | null {
  if (v == null) return null;
  if (typeof v === "object") return v;
  return null;
}

function pickRelationshipArray<T extends { id: string | number }>(
  v: ReadonlyArray<string | number | T> | null | undefined
): ReadonlyArray<T> {
  if (!v) return [];
  return v.filter((x): x is T => typeof x === "object");
}

function asPillarId(slug: string | undefined): PillarId {
  switch (slug) {
    case "ai":
    case "startups":
    case "latest":
    case "dev":
    case "products":
    case "policy":
      return slug;
    // Backward-compat: the "asia" pillar was renamed to "latest" (2026-06-14).
    // Resolve legacy data/slugs until the CMS pillar doc is renamed.
    case "asia":
    default:
      return "latest";
  }
}

export function toArticleView(a: Article): ArticleView {
  const pillar = pickRelationship<{
    id: string | number;
    slug: string;
    color: string;
    title?: { en: string; vi?: string | null; id?: string | null } | null;
  }>(a.pillar);
  const author = pickRelationship<{
    id: string | number;
    name: string;
    role: string;
    city: string;
  }>(a.author);
  const coAuthors = pickRelationshipArray<{ id: string | number; name: string }>(
    a.coAuthors
  );
  const hero = pickRelationship<{
    id: string | number;
    url?: string | null;
    alt?: string | null;
    credit?: string | null;
  }>(a.heroImage);

  return {
    id: String(a.id),
    slug: a.slug,
    pillar: asPillarId(pillar?.slug),
    pillarColor: pillar?.color ?? "var(--latest)",
    pillarLabel: pillarLabel(pillar),
    author: author?.name ?? "Staff",
    authorCity: author?.city ?? "",
    authorRole: author?.role ?? "",
    coAuthors: coAuthors.map((c) => c.name),
    title: a.title,
    dek: a.dek,
    section: a.section ?? "",
    readMin: a.readMin,
    published: a.publishedAt,
    sponsored: Boolean(a.sponsored),
    sponsor: a.sponsor ?? undefined,
    aiAssisted: Boolean(a.aiAssisted),
    deepDive: Boolean(a.deepDive),
    affiliate: Boolean(a.affiliate),
    image: a.imageLabel ? { label: a.imageLabel } : undefined,
    heroImageUrl: hero?.url ?? null,
    heroImageAlt: hero?.alt ?? null,
    heroImageCredit: hero?.credit ?? null,
  };
}
