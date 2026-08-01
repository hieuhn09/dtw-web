import type { FeedArticle } from "@/lib/cms-client";

/**
 * Atom 1.0 feed builder for `/rss.xml` and `/[pillar]/rss.xml`.
 *
 * Atom 1.0 (not RSS 2.0) per the spec sheet's feed row ("Atom 1.0 chuẩn");
 * the URL keeps the `/rss.xml` name because the footer, the pillar-page
 * button, and readers' muscle memory all treat "rss.xml" as *the* feed URL —
 * every aggregator parses Atom regardless of the file name.
 *
 * Pure string assembly — no DB or Next.js dependency (the FeedArticle import
 * is type-only, so `"server-only"` in payload-server never enters a bundle
 * through here) — so it stays unit-testable without a Payload instance.
 */

export interface AtomChannel {
  /** Feed display title, e.g. "DailyTechWire" or "DailyTechWire — AI". */
  title: string;
  subtitle: string;
  /** Absolute site origin, no trailing slash — `siteOrigin()`. */
  origin: string;
  /** Path of the HTML page this feed mirrors, e.g. "/" or "/ai". */
  sitePath: string;
  /** Path of the feed itself, e.g. "/rss.xml" or "/ai/rss.xml". */
  feedPath: string;
}

/**
 * Escapes text for XML element/attribute content. Also strips the code
 * points XML 1.0 forbids outright (C0 controls + the U+FFFE/U+FFFF
 * noncharacters) — one such character in one CMS title would otherwise
 * invalidate the whole feed for every subscriber. Lone surrogates need no
 * handling here: `new Response()`'s UTF-8 encoder replaces them with the
 * XML-valid U+FFFD, and stripping the surrogate range wholesale would
 * destroy valid emoji pairs.
 */
export function xmlEscape(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Payload dates are already ISO, but a malformed one must degrade to a
 *  skipped element, not a feed-wide RangeError from `toISOString()`. */
function rfc3339(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function buildAtomFeed(channel: AtomChannel, articles: FeedArticle[]): string {
  const feedUrl = `${channel.origin}${channel.feedPath}`;
  const siteUrl = `${channel.origin}${channel.sitePath}`;
  const tagHost = new URL(channel.origin).hostname;

  const entries = articles.map((article) => {
    const url = `${channel.origin}/article/${article.slug}`;
    // atom:id must never change for the life of the entry (RFC 4287 §4.2.6),
    // but slugs are editor-overridable — a slug fix must not resurface the
    // story as a duplicate "new" item in readers. A tag: URI (RFC 4151) on
    // the immutable numeric id survives slug edits and domain moves.
    const entryId = `tag:${tagHost},2026:article/${article.id}`;
    const published = rfc3339(article.publishedAt);
    // Readers diff <updated> to detect edits, so it tracks the CMS edit
    // timestamp, not the publish instant.
    const updated = rfc3339(article.updatedAt) ?? published ?? new Date().toISOString();
    const author =
      typeof article.author === "object" && article.author !== null ? article.author.name : null;
    const pillarLabel =
      typeof article.pillar === "object" && article.pillar !== null
        ? (article.pillar.title?.en ?? article.pillar.slug)
        : null;
    // Most aggregators never render <category>, so the Paid Partner
    // disclosure must live on a visible surface — the title — to keep the
    // newsroom/sponsored separation intact off-site (invariant #5's intent).
    const title = article.sponsored ? `Paid Partner · ${article.title}` : article.title;
    return [
      "  <entry>",
      `    <title>${xmlEscape(title)}</title>`,
      `    <id>${xmlEscape(entryId)}</id>`,
      `    <link rel="alternate" type="text/html" href="${xmlEscape(url)}"/>`,
      published ? `    <published>${published}</published>` : null,
      `    <updated>${updated}</updated>`,
      `    <summary>${xmlEscape(article.dek)}</summary>`,
      author ? `    <author><name>${xmlEscape(author)}</name></author>` : null,
      pillarLabel ? `    <category term="${xmlEscape(pillarLabel)}"/>` : null,
      // Machine-readable complement to the visible title prefix above.
      article.sponsored ? `    <category term="sponsored" label="Paid Partner"/>` : null,
      "  </entry>",
    ]
      .filter(Boolean)
      .join("\n");
  });

  // Atom requires feed-level <updated> even when empty; the newest entry
  // modification is the honest value, generation time the empty-feed fallback.
  const newest =
    articles
      .map((article) => rfc3339(article.updatedAt) ?? rfc3339(article.publishedAt))
      .filter((value): value is string => value !== null)
      .sort()
      .at(-1) ?? new Date().toISOString();

  return [
    `<?xml version="1.0" encoding="utf-8"?>`,
    `<feed xmlns="http://www.w3.org/2005/Atom">`,
    `  <title>${xmlEscape(channel.title)}</title>`,
    `  <subtitle>${xmlEscape(channel.subtitle)}</subtitle>`,
    `  <id>${xmlEscape(feedUrl)}</id>`,
    `  <link rel="self" type="application/atom+xml" href="${xmlEscape(feedUrl)}"/>`,
    `  <link rel="alternate" type="text/html" href="${xmlEscape(siteUrl)}"/>`,
    `  <updated>${newest}</updated>`,
    // Feed-level author doubles as the Atom-required fallback for any entry
    // whose author relation didn't populate.
    `  <author><name>DailyTechWire</name></author>`,
    `  <rights>© Asia Press Centre Group (APCG)</rights>`,
    ...entries,
    `</feed>`,
    "",
  ].join("\n");
}

export function atomResponse(xml: string): Response {
  return new Response(xml, {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}
