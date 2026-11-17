/**
 * Daily Brief — shared vocabulary for the AM/PM digest the content-engine
 * composes twice a day and posts through the ordinary article intake.
 *
 * Client-safe on purpose (no "server-only"): the band, the hub page and the
 * article template all need to read an edition off a slug.
 */

// [temp-hidden 2026-11-17] Daily Brief paused by product request (the engine
// has stopped composing editions). While `true`, `/briefing` and
// `/briefing/page/[n]` 404 and the sitemap drops `/briefing` plus brief
// articles. Flip to `false` to restore (also restore SHOW_BRIEF on the
// homepage and the "Briefing" entry in NAV_EXTRA, lib/data.ts).
// Individual `/article/<brief-slug>` pages are deliberately left live.
export const BRIEFING_HIDDEN = true;

/**
 * Any brief slug, including the single daily edition the engine has minted
 * since 2026-11-09 (`daily-brief-YYYY-MM-DD`), which `isBriefSlug` predates.
 * Used to keep every brief out of the sitemap while BRIEFING_HIDDEN.
 */
const ANY_BRIEF_SLUG = /^(morning|evening|daily)-brief-\d{4}-\d{2}-\d{2}$/;

export function isAnyBriefSlug(slug: string): boolean {
  return ANY_BRIEF_SLUG.test(slug);
}

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
