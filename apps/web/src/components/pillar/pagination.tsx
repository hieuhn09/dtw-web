"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";

export interface PaginationProps {
  /** Pillar slug — page 1 lives at `/{slug}`, the rest at `/{slug}/page/{n}`. */
  pillarSlug: string;
  /** CMS pillar color, used to mark the current page. */
  pillarColor: string;
  currentPage: number;
  totalPages: number;
}

/**
 * Numbered pagination for a pillar feed.
 *
 * This exists for crawlers as much as for readers. A "Load more" button is a
 * server action — a <button>, not a link — so Googlebot could never advance
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

export function Pagination({
  pillarSlug,
  pillarColor,
  currentPage,
  totalPages,
}: PaginationProps) {
  const t = useT();
  if (totalPages <= 1) return null;
  const pages = pageWindow(currentPage, totalPages);

  return (
    <nav className="pager" aria-label={t("Pagination", "Phân trang", "Penomoran halaman")}>
      {/* Edge links keep their grid slot when absent so the number strip stays
          optically centred on page 1 and on the last page. */}
      {currentPage > 1 ? (
        <Link
          href={hrefFor(pillarSlug, currentPage - 1)}
          rel="prev"
          className="pager-edge pager-prev"
        >
          <span aria-hidden="true">←</span>
          {t("Newer", "Mới hơn", "Terbaru")}
        </Link>
      ) : (
        <span className="pager-edge-empty pager-prev" />
      )}

      <div className="pager-numbers pager-nums">
        {pages.map((p, i) => {
          const prev = i > 0 ? pages[i - 1] : undefined;
          const gap = prev !== undefined && p - prev > 1;
          const cell =
            p === currentPage ? (
              <span
                key={p}
                aria-current="page"
                className="mono pager-current"
                style={{ color: pillarColor, borderBottomColor: pillarColor }}
              >
                {p}
              </span>
            ) : (
              <Link
                key={p}
                href={hrefFor(pillarSlug, p)}
                className="mono pager-link"
              >
                {p}
              </Link>
            );
          // A gap in the window renders as an inert ellipsis, never as a link
          // to a page that isn't in the set.
          return gap ? (
            <span key={`g-${p}`} style={{ display: "contents" }}>
              <span className="text-mute-2 mono pager-gap" aria-hidden="true">
                ···
              </span>
              {cell}
            </span>
          ) : (
            cell
          );
        })}
      </div>

      {currentPage < totalPages ? (
        <Link
          href={hrefFor(pillarSlug, currentPage + 1)}
          rel="next"
          className="pager-edge pager-next"
        >
          {t("Older", "Cũ hơn", "Terlama")}
          <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <span className="pager-edge-empty pager-next" />
      )}
    </nav>
  );
}
