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
    case "asia":
    case "dev":
    case "products":
    case "policy":
      return slug;
    default:
      return "asia";
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

  return {
    id: String(a.id),
    slug: a.slug,
    pillar: asPillarId(pillar?.slug),
    pillarColor: pillar?.color ?? "var(--asia)",
    pillarLabel: pillar?.title?.en ?? pillar?.slug ?? "Asia",
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
  };
}
