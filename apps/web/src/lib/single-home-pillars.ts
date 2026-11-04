// Single-home pillars (Pressroom): an article filed under one belongs to that
// pillar only. Central CMS enforces the write rule (apcg-cms
// `SINGLE_HOME_PILLARS`, tenant `dtw`); the reader site only hides these
// articles from the shared news surfaces (home hero/pool/bands, pinned Latest,
// `/latest`, root RSS, most-read, account follow list) and bylines them
// "Distributed by Opentechwire". The public API is unchanged, so filtering
// happens here, at each aggregate call site.
//
// This list DUPLICATES the CMS constant for tenant `dtw`: keep them in sync.
// Kept free of runtime imports so `node:test` can load it directly.
import type { PillarId } from "./data";

export const SINGLE_HOME_PILLAR_SLUGS = ["pressroom"] as const;

/** Byline author shown on distributed (Pressroom) articles. Brand casing is load-bearing. */
export const DISTRIBUTED_AUTHOR = "Opentechwire";

/** Exact-slug match; no trimming or case folding (the CMS slug is canonical). */
export function isSingleHomePillar(slug: string | null | undefined): boolean {
  return typeof slug === "string" && (SINGLE_HOME_PILLAR_SLUGS as ReadonlyArray<string>).includes(slug);
}

/** Articles in a single-home pillar are distributed releases, not staff reporting. */
export const isDistributedPillar = isSingleHomePillar;

type PillarRef = { slug?: string | null } | string | number | null | undefined;

/**
 * True when a raw CMS doc's primary pillar is single-home. List docs arrive with
 * the pillar populated (depth 1); a bare id cannot be classified and is kept.
 */
export function isSingleHomeDoc(doc: { pillar?: PillarRef }): boolean {
  const p = doc.pillar;
  return typeof p === "object" && p !== null && isSingleHomePillar(p.slug);
}

/** Drops single-home raw docs, preserving order. */
export function withoutSingleHome<T extends { pillar?: PillarRef }>(docs: ReadonlyArray<T>): T[] {
  return docs.filter((d) => !isSingleHomeDoc(d));
}

/** Drops single-home view models (`ArticleView.pillar` is the resolved id). */
export function withoutSingleHomeViews<T extends { pillar: string }>(views: ReadonlyArray<T>): T[] {
  return views.filter((v) => !isSingleHomePillar(v.pillar));
}

/** First doc that is not single-home, or null. Used for the pinned Latest slot. */
export function firstNonSingleHome<T extends { pillar?: PillarRef }>(docs: ReadonlyArray<T>): T | null {
  return docs.find((d) => !isSingleHomeDoc(d)) ?? null;
}

/**
 * Author segment for card/row bylines, or null for distributed items (cards
 * then show only time + reading time).
 */
export function cardByline(a: { author: string; distributed?: boolean }): string | null {
  return a.distributed ? null : a.author;
}

const PRESSROOM_LABELS = { en: "Pressroom", vi: "Phòng báo chí", id: "Ruang Pers" } as const;

/** Pressroom label; static because `pressroom` is deliberately absent from `PILLARS`. */
export function pressroomLabel(lang: "en" | "vi" | "id"): string {
  return PRESSROOM_LABELS[lang];
}

/** Maps a CMS pillar slug to the reader's `PillarId`; unknown slugs fall back to "latest". */
export function toPillarId(slug: string | null | undefined): PillarId {
  switch (slug) {
    case "ai":
    case "startups":
    case "latest":
    case "dev":
    case "products":
    case "policy":
    case "pressroom":
      return slug;
    // Backward-compat: the "asia" pillar was renamed to "latest" (2026-06-14).
    case "asia":
    default:
      return "latest";
  }
}
