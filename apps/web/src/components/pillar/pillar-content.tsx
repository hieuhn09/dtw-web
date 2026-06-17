"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button, PillarTag } from "@dtw/ui";
import { CoverArt } from "@/components/cover-art";
import { Icon } from "@/components/icons";
import { BylineWired } from "@/components/byline-wired";
import { TimeAgo } from "@/components/time-ago";
import type { ArticleView } from "@/lib/article-view";
import { ARTICLES_PAGE_SIZE, type PillarId } from "@/lib/data";
import { localizedPillarLabel, useLang, useT } from "@/lib/i18n";
import { loadArticlesPage } from "@/app/(reader)/[pillar]/load-more-action";

export interface PillarContentProps {
  /** Pillar slug from the CMS (not constrained to the 6 known ids). Also the
   *  key the load-more server action filters by ("latest" = all beats). */
  pillarId: string;
  pillarColor: string;
  /** Icon name from the CMS pillar doc. */
  pillarIcon: string;
  pillarHeading: string;
  pillarDescription: string;
  /** Page 1 of the feed, server-rendered. `initialArticles[0]` is the featured
   *  story; the rest seed the grid. Further pages are fetched server-side. */
  initialArticles: ReadonlyArray<ArticleView>;
  /** True total stories for this pillar — fed by the server so the badge
   *  reflects everything, not just what's been paged into memory. */
  totalCount: number;
  /** Whether the server has a page 2 for the unfiltered feed. */
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
  hasMoreInitial,
}: PillarContentProps) {
  const t = useT();
  const { lang } = useLang();
  // i18n label for the 6 known pillars; falls back to the CMS heading for any
  // pillar added later that isn't in the static label map.
  const pillarLabel = localizedPillarLabel(pillarId as PillarId, lang) || pillarHeading;

  // The featured story is the newest article in the feed; the rest fill the grid.
  const featured = initialArticles[0] ?? null;
  const featuredId = featured?.id ?? null;

  // Grid = the feed minus the featured card. "Load more" refetches the next page
  // from the server (loadArticlesPage) instead of slicing memory, so the feed
  // scales past any cap.
  const [grid, setGrid] = useState<ArticleView[]>(() =>
    initialArticles.filter((a) => a.id !== featuredId)
  );
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(hasMoreInitial);
  const [total, setTotal] = useState<number>(totalCount);
  const [pending, startTransition] = useTransition();

  // Note: navigating to a different pillar remounts this component (the route
  // keys <PillarContent> by slug), so all state re-initializes from fresh props —
  // no reset effect needed, and a background ISR refresh won't yank a reader's
  // loaded pages out from under them.

  function loadMore() {
    if (pending || !hasMore) return;
    startTransition(async () => {
      try {
        const next = page + 1;
        const r = await loadArticlesPage(pillarId, next);
        setGrid((prev) => {
          const seen = new Set(prev.map((a) => a.id));
          const add = r.articles.filter((a) => a.id !== featuredId && !seen.has(a.id));
          return [...prev, ...add];
        });
        setPage(r.page);
        setHasMore(r.hasMore);
        setTotal(r.totalCount);
      } catch {
        // Keep what's already loaded; the button re-enables so the reader can retry.
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
          <Button variant="ghost" size="sm">
            RSS feed
          </Button>
          <span className="text-mute-2 mono" style={{ fontSize: 11, marginLeft: 8 }}>
            {total} stories
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 32 }}>
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

      {hasMore && (
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Button
            variant="outline"
            size="lg"
            onClick={loadMore}
            disabled={pending}
            style={{ padding: "18px 36px", fontSize: 15, letterSpacing: ".02em", opacity: pending ? 0.6 : 1 }}
          >
            {pending
              ? t("Loading…", "Đang tải…", "Memuat…")
              : t("Load more", "Tải thêm", "Muat lagi")}
          </Button>
        </div>
      )}

      {!hasMore && total > ARTICLES_PAGE_SIZE && (
        <div
          style={{
            textAlign: "center",
            marginTop: 48,
            color: "var(--muted)",
            fontSize: 13,
          }}
        >
          {t(
            `End of feed — ${total} stories.`,
            `Hết bài — ${total} bài.`,
            `Akhir feed — ${total} artikel.`
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
