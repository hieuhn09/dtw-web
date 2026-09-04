"use client";

import { useState, useTransition, type MouseEvent } from "react";
import Link from "next/link";
import { Button, PillarTag } from "@dtw/ui";
import { CoverArt } from "@/components/cover-art";
import { Icon } from "@/components/icons";
import { BylineWired } from "@/components/byline-wired";
import { TimeAgo } from "@/components/time-ago";
import type { ArticleView } from "@/lib/article-view";
import { ARTICLES_PAGE_SIZE, type PillarId } from "@/lib/data";
import { localizedPillarLabel, useLang, useT } from "@/lib/i18n";
import { loadArticlesAfter } from "@/app/(reader)/[pillar]/load-more-action";

export interface PillarContentProps {
  /** Pillar slug from the CMS (not constrained to the 6 known ids). Also the
   *  key the load-more server action filters by ("latest" = all beats). */
  pillarId: string;
  pillarColor: string;
  /** Icon name from the CMS pillar doc. */
  pillarIcon: string;
  pillarHeading: string;
  pillarDescription: string;
  /** This page of the feed, server-rendered. `initialArticles[0]` becomes the
   *  oversized lead card; the remaining 24 fill the grid. Every route page has
   *  its own lead — appends do not add more of them. */
  initialArticles: ReadonlyArray<ArticleView>;
  /** True total stories for this pillar — fed by the server so the badge
   *  reflects the whole feed, not just this page. */
  totalCount: number;
  /** Which page this is. Sets the "Load more" href so a crawler reading the
   *  server-rendered HTML always sees the correct next page. */
  currentPage: number;
  /** Whether the server has anything after this page. */
  hasMoreInitial: boolean;
}

export function PillarContent({
  pillarId,
  pillarColor,
  pillarIcon,
  pillarHeading,
  pillarDescription,
  initialArticles,
  totalCount,
  currentPage,
  hasMoreInitial,
}: PillarContentProps) {
  const t = useT();
  const { lang } = useLang();
  // i18n label for the 6 known pillars; falls back to the CMS heading for any
  // pillar added later that isn't in the static label map.
  const pillarLabel = localizedPillarLabel(pillarId as PillarId, lang) || pillarHeading;

  // The lead card is this page's newest story; the remaining 24 fill the grid.
  const featured = initialArticles[0] ?? null;
  const featuredId = featured?.id ?? null;

  // Articles pulled in by "Load more", in order. Empty until the reader asks —
  // every route page is a complete server render on its own, so this is
  // enhancement on top, never the source of the first screen.
  const [appended, setAppended] = useState<ArticleView[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(hasMoreInitial);
  const [batches, setBatches] = useState<number>(0);
  const [pending, startTransition] = useTransition();

  // Appends add plain cards only — no second lead card — so the grid grows
  // 24 + 24 + 24. Every one of those totals divides by 4, 3, 2 and 1, which is
  // why the batch size is 24 while a route page carries 25.
  const grid = [...initialArticles, ...appended].filter((a) => a.id !== featuredId);
  const cursor = grid[grid.length - 1] ?? featured;

  // At render time `batches` is 0, so the server-rendered HTML a crawler reads
  // always carries the exact next page. It only drifts after a reader has
  // started appending, which no crawler does.
  const nextHref = `/${pillarId}/page/${currentPage + batches + 1}`;

  /**
   * The control is a real `<a href>` pointing at the next page's own URL, so a
   * crawler follows it and a reader with JS disabled navigates there normally.
   * This handler is the enhancement: it cancels that navigation and appends
   * instead.
   *
   * Modified clicks (⌘/ctrl/shift/alt, middle button) fall through untouched so
   * "open in new tab" keeps working — intercepting those is the classic way
   * this pattern breaks.
   */
  function onLoadMore(e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (pending || !hasMore || !cursor) return;
    const landedOn = currentPage + batches + 1;
    startTransition(async () => {
      try {
        const r = await loadArticlesAfter(pillarId, cursor.published, Number(cursor.id));
        setAppended((prev) => {
          const seen = new Set([...initialArticles, ...prev].map((a) => a.id));
          return [...prev, ...r.articles.filter((a) => !seen.has(a.id))];
        });
        setHasMore(r.hasMore);
        setBatches((b) => b + 1);
        // replaceState, not pushState: each append is a continuation of the
        // same view, not a place to go "back" to. Back returns the reader to
        // wherever they entered the feed from instead of unwinding one append
        // at a time. Next 15 supports calling the History API directly for
        // exactly this. The batch is 24 and a page is 25, so this is the page
        // the reader has read *into*, not an exact boundary.
        window.history.replaceState(null, "", `/${pillarId}/page/${landedOn}`);
      } catch {
        // Keep what's already loaded; the link re-enables so the reader can
        // retry, and it still works as a plain navigation either way.
      }
    });
  }

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 32 }}>
      <header
        style={{
          borderBottom: `4px solid ${pillarColor}`,
          paddingBottom: 24,
          marginBottom: 32,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <Icon name={pillarIcon} size={22} color={pillarColor} stroke={2} />
          <span
            className="upper"
            style={{
              fontSize: 12,
              fontWeight: 650,
              letterSpacing: ".18em",
              color: pillarColor,
              textTransform: "uppercase",
            }}
          >
            DTW · {pillarLabel}
          </span>
        </div>
        <h1
          className="serif"
          style={{
            margin: "0 0 12px",
            fontSize: "clamp(32px, 9vw, 64px)",
            fontWeight: 650,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: "var(--ink)",
          }}
        >
          {pillarHeading}
        </h1>
        <p
          className="serif text-mute"
          style={{ margin: 0, fontSize: 19, lineHeight: 1.45, maxWidth: 760 }}
        >
          {pillarDescription}
        </p>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 20 }}>
          <Button variant="outline" size="sm">
            {t("Follow", "Theo dõi", "Ikuti")} {pillarLabel}
          </Button>
          <Button variant="ghost" size="sm" href={`/${pillarId}/rss.xml`}>
            RSS feed
          </Button>
          <span className="text-mute-2 mono" style={{ fontSize: 11, marginLeft: 8 }}>
            {totalCount} stories
          </span>
        </div>
      </header>

      {/* Featured */}
      {featured && (
        <Link href={`/article/${featured.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
          <article
            className="r-feature"
            style={{
              display: "grid",
              gap: 36,
              cursor: "pointer",
              marginBottom: 48,
              paddingBottom: 32,
              borderBottom: "1px solid var(--hair)",
            }}
          >
            <CoverArt
              pillar={featured.pillar}
              seed={featured.id}
              src={featured.heroImageUrl}
              variant={5}
              height={440}
              label="FEATURED"
            />
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div className="kicker" style={{ color: pillarColor, marginBottom: 10 }}>
                {t("Featured", "Nổi bật", "Unggulan")} · {featured.section}
              </div>
              <h2
                className="serif"
                style={{
                  margin: "0 0 14px",
                  fontSize: "clamp(26px, 6vw, 42px)",
                  fontWeight: 650,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.05,
                  textWrap: "balance",
                }}
              >
                {featured.title}
              </h2>
              <p className="serif text-mute" style={{ margin: "0 0 18px", fontSize: 17, lineHeight: 1.5 }}>
                {featured.dek}
              </p>
              <BylineWired article={featured} size="lg" />
            </div>
          </article>
        </Link>
      )}

      {/* Grid */}
      {/* auto-FILL, not auto-fit. auto-fit collapses the empty tracks in a
          short final row and stretches whatever is left across the full width,
          which is what made the last row read as ragged. auto-fill keeps the
          tracks, so a final row of 1-3 cards holds the same column width as
          every row above it and simply aligns left. */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 32 }}>
        {grid.map((a, i) => (
          <Link
            key={a.id}
            href={`/article/${a.slug}`}
            style={{ color: "inherit", textDecoration: "none" }}
          >
            <article style={{ cursor: "pointer" }}>
              <CoverArt
                pillar={a.pillar}
                seed={a.id}
                src={a.heroImageUrl}
                variant={(i + 2) % 6}
                height={210}
                style={{ marginBottom: 14 }}
              />
              <PillarTag id={a.pillar} label={localizedPillarLabel(a.pillar, lang)} />
              <h3
                className="serif"
                style={{
                  margin: "8px 0",
                  fontSize: 21,
                  fontWeight: 600,
                  lineHeight: 1.25,
                  letterSpacing: "-0.01em",
                }}
              >
                {a.title}
              </h3>
              <p className="text-mute serif" style={{ margin: "0 0 10px", fontSize: 14, lineHeight: 1.45 }}>
                {a.dek.slice(0, 140)}…
              </p>
              <div className="text-mute" style={{ fontSize: 12 }}>
                {a.author} · <TimeAgo iso={a.published} /> · {a.readMin}m
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* Reads as a button, is an <a href> to the next page's real URL. JS
          turns the click into an append; without JS it just navigates. */}
      {hasMore && (
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Button
            href={nextHref}
            variant="outline"
            size="lg"
            onClick={onLoadMore}
            rel="next"
            style={{
              padding: "18px 36px",
              fontSize: 15,
              letterSpacing: ".02em",
              opacity: pending ? 0.6 : 1,
            }}
          >
            {pending
              ? t("Loading…", "Đang tải…", "Memuat…")
              : t("Load more", "Tải thêm", "Muat lagi")}
          </Button>
        </div>
      )}

      {!hasMore && totalCount > ARTICLES_PAGE_SIZE && (
        <div
          style={{
            textAlign: "center",
            marginTop: 48,
            color: "var(--muted)",
            fontSize: 13,
          }}
        >
          {t(
            `End of feed — ${totalCount} stories.`,
            `Hết bài — ${totalCount} bài.`,
            `Akhir feed — ${totalCount} artikel.`
          )}
        </div>
      )}

      {grid.length === 0 && !featured && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--muted)",
            fontSize: 14,
          }}
        >
          {t(
            "Nothing in this pillar yet.",
            "Chưa có bài trong mục này.",
            "Belum ada artikel di pilar ini."
          )}
        </div>
      )}
    </div>
  );
}
