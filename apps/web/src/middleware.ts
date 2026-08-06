import { NextResponse } from "next/server";

/**
 * 410 Gone for the pre-relaunch WordPress URL space.
 *
 * This domain hosted an unrelated WordPress site before it became this
 * Next.js app. The two projects share no content, so none of the old
 * WordPress URLs (confirmed via Wayback CDX + a GSC export — see the SEO
 * audit this implements) have an equivalent page here. They get a
 * deliberate 410, not a redirect and not a bare 404: Google drops a 410 from
 * its index after a single crawl pass, where a 404 needs several repeated
 * confirmations before Google trusts the URL is really gone. Crawl budget on
 * this domain has been throttled since mid-June, so cutting confirmation
 * passes down matters.
 *
 * `config.matcher` below is a checked allowlist of the dead WordPress path
 * shapes, not a catch-all — every entry was verified against the live route
 * tree in `apps/web/src/app` (and against path-to-regexp's actual matching
 * behavior, not just assumed syntax) so this can never intercept a real
 * page. See next.config.ts's `redirects()` comment for the routing-order
 * note: those redirects (including the apex->www host rule) run before
 * middleware, so the 410 below always lands on the canonical www hop.
 */
export function middleware() {
  return new NextResponse(null, { status: 410 });
}

export const config = {
  matcher: [
    // /tag/foo, /tag/foo/feed/ — WordPress tag archives. The new site's
    // taxonomy (Pillar / Sub-section / Tag) has no route at "/tag".
    "/tag/:path*",
    // /category/foo — WordPress category archives.
    "/category/:path*",
    // /author/foo — WordPress author archive pages. Bylines render inline on
    // articles here; there is no standalone "/author" route to collide with.
    "/author/:path*",
    // /YYYY/, /YYYY/MM/, /YYYY/MM/DD/slug/ — WordPress date-based archives.
    // No route under apps/web/src/app starts with a numeric segment (every
    // real top-level route is a lowercase word), so a broad "20xx" year
    // regex on the first path segment can't collide with anything real.
    // ":path*" is zero-or-more, so this one pattern also catches the
    // bare-year (/YYYY/) and year+month (/YYYY/MM/) shapes without a
    // separate entry — verified against path-to-regexp directly, not
    // assumed.
    "/:year(20\\d{2})/:path*",
    // /page/N — WordPress's own blog-root pagination. Distinct from the real
    // /[pillar]/page/[n] pillar pagination, which is nested under a pillar
    // slug (e.g. /ai/page/2) and never starts with a bare "/page/" prefix.
    "/page/:num(\\d+)",
    // /dl/*, /download/* — WordPress download shortlinks.
    "/dl/:path*",
    "/download/:path*",
    // /computing/* — previously redirected to /products (see next.config.ts
    // history); a mass redirect of ~225 unrelated old URLs to one page reads
    // to Google as a soft 404 and burns crawl budget for no link equity, so
    // it moved here instead.
    "/computing/:path*",
    // /mobile-tech/*, /technology/*, /it-management/*, /featured-article/* —
    // other WordPress category trees with no new-site equivalent.
    "/mobile-tech/:path*",
    "/technology/:path*",
    "/it-management/:path*",
    "/featured-article/:path*",
    // /comments/feed — WordPress's sitewide comment feed. Not a redirect
    // candidate: the new site has no comments feature, so there's no
    // equivalent destination to point it at.
    "/comments/feed",
  ],
};
