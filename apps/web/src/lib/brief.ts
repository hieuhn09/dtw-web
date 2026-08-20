/**
 * Daily Brief — shared vocabulary for the AM/PM digest the content-engine
 * composes twice a day and posts through the ordinary article intake.
 *
 * Client-safe on purpose (no "server-only"): the band, the hub page and the
 * article template all need to read an edition off a slug.
 */

/** `Article.contentType` value that marks a brief. Everything else is "article". */
export const BRIEF_CONTENT_TYPE = "daily-brief" as const;

export type BriefEdition = "am" | "pm";

/**
 * The engine mints brief slugs as `morning-brief-YYYY-MM-DD` /
 * `evening-brief-YYYY-MM-DD` (contract: content-engine
 * `admin/src/lib/brief-configs.ts` → `buildBriefSlug`).
 *
 * Anchored at both ends so an ordinary article that merely contains the words
 * can never match.
 */
const BRIEF_SLUG = /^(morning|evening)-brief-(\d{4}-\d{2}-\d{2})$/;

export function isBriefSlug(slug: string): boolean {
  return BRIEF_SLUG.test(slug);
}

/** "am" | "pm" from the slug, or null when it isn't a brief slug. */
export function briefEdition(slug: string): BriefEdition | null {
  const m = BRIEF_SLUG.exec(slug);
  if (!m) return null;
  return m[1] === "morning" ? "am" : "pm";
}

/**
 * Publication date ("YYYY-MM-DD", Asia/Singapore) from the slug.
 *
 * Read from the slug rather than `publishedAt` deliberately: the engine anchors
 * the slug to the edition's own calendar slot, while `publishedAt` is whenever
 * an editor happened to approve it — which can be hours later, or the next
 * morning for an evening edition approved late.
 */
export function briefDate(slug: string): string | null {
  const m = BRIEF_SLUG.exec(slug);
  return m ? (m[2] as string) : null;
}
