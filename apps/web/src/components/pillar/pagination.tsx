import Link from "next/link";

export interface PaginationProps {
  /** Pillar slug — page 1 lives at `/{slug}`, the rest at `/{slug}/page/{n}`. */
  pillarSlug: string;
  currentPage: number;
  totalPages: number;
  /** Localized label for the surrounding <nav>. */
  label: string;
}

/**
 * Numbered pagination for a pillar feed.
 *
 * This exists for crawlers, not just readers. The feed's "Load more" button is
 * a server action — a <button>, not a link — so Googlebot could never advance
 * past the first 21 stories, leaving the bulk of the archive linked from
 * nowhere but the sitemap. These are real <a href> elements in the server-
 * rendered HTML, which is the only kind of pagination a crawler can follow.
 *
 * `pageWindow` keeps the link count bounded while keeping every page within a
 * couple of hops: the every-5th-page rung means a crawler on page 1 lands
 * within ±2 of any page in one step, and the ±2 window around the current page
 * closes the gap on the next. Rendering all N numbers would flatten depth to 1
 * but grows without limit as the archive does.
 */
export function pageWindow(current: number, total: number): number[] {
  if (total <= 12) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, 2, total - 1, total]);
  for (let i = current - 2; i <= current + 2; i++) {
    if (i >= 1 && i <= total) pages.add(i);
  }
  for (let i = 5; i <= total; i += 5) pages.add(i);
  return [...pages].sort((a, b) => a - b);
}

function hrefFor(pillarSlug: string, page: number): string {
  // Page 1 has no /page/1 twin — that URL permanently redirects here, so the
  // feed's first page is only ever reachable at one address.
  return page === 1 ? `/${pillarSlug}` : `/${pillarSlug}/page/${page}`;
}

const cellStyle: React.CSSProperties = {
  minWidth: 38,
  padding: "8px 10px",
  textAlign: "center",
  border: "1px solid var(--hair-2)",
  borderRadius: 4,
  fontSize: 13,
  textDecoration: "none",
  color: "var(--ink)",
};

export function Pagination({
  pillarSlug,
  currentPage,
  totalPages,
  label,
}: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = pageWindow(currentPage, totalPages);

  return (
    <nav
      aria-label={label}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 40,
      }}
    >
      {currentPage > 1 && (
        <Link
          href={hrefFor(pillarSlug, currentPage - 1)}
          rel="prev"
          style={{ ...cellStyle, minWidth: 0 }}
        >
          ←
        </Link>
      )}

      {pages.map((p, i) => {
        // A gap in the window renders as an inert ellipsis, never as a link to
        // a page that isn't in the set.
        const prev = i > 0 ? pages[i - 1] : undefined;
        const gap = prev !== undefined && p - prev > 1;
        const cell =
          p === currentPage ? (
            <span
              key={p}
              aria-current="page"
              className="mono"
              style={{
                ...cellStyle,
                background: "var(--surface-2)",
                fontWeight: 650,
              }}
            >
              {p}
            </span>
          ) : (
            <Link key={p} href={hrefFor(pillarSlug, p)} className="mono" style={cellStyle}>
              {p}
            </Link>
          );
        return gap ? (
          <span key={`g-${p}`} style={{ display: "contents" }}>
            <span className="text-mute-2" style={{ padding: "0 2px" }}>
              …
            </span>
            {cell}
          </span>
        ) : (
          cell
        );
      })}

      {currentPage < totalPages && (
        <Link
          href={hrefFor(pillarSlug, currentPage + 1)}
          rel="next"
          style={{ ...cellStyle, minWidth: 0 }}
        >
          →
        </Link>
      )}
    </nav>
  );
}
