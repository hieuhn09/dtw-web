"use client";

import Link from "next/link";
import { Button, PillarTag } from "@dtw/ui";
import { CoverArt } from "@/components/cover-art";
import { Icon } from "@/components/icons";
import { BylineWired } from "@/components/byline-wired";
import { TimeAgo } from "@/components/time-ago";
import type { ArticleView } from "@/lib/article-view";
import { type PillarId } from "@/lib/data";
import { localizedPillarLabel, useLang, useT } from "@/lib/i18n";
import { Pagination } from "@/components/pillar/pagination";

export interface PillarContentProps {
  /** Pillar slug from the CMS (not constrained to the 6 known ids). Also the
   *  key the load-more server action filters by ("latest" = all beats). */
  pillarId: string;
  pillarColor: string;
  /** Icon name from the CMS pillar doc. */
  pillarIcon: string;
  pillarHeading: string;
  pillarDescription: string;
  /** This page of the feed, server-rendered. On page 1 `initialArticles[0]` is
   *  the featured story; the rest fill the grid. */
  initialArticles: ReadonlyArray<ArticleView>;
  /** True total stories for this pillar — fed by the server so the badge
   *  reflects the whole feed, not just this page. */
  totalCount: number;
  /** Which page this is. */
  currentPage: number;
  /** Total pages in the feed, for the crawlable numbered pagination. */
  totalPages: number;
  /** The oversized lead card. Only page 1 gets one — on later pages every
   *  story goes in the grid, so the page reads as a continuation. */
  showFeatured: boolean;
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
  totalPages,
  showFeatured,
}: PillarContentProps) {
  const t = useT();
  const { lang } = useLang();
  // i18n label for the 6 known pillars; falls back to the CMS heading for any
  // pillar added later that isn't in the static label map.
  const pillarLabel = localizedPillarLabel(pillarId as PillarId, lang) || pillarHeading;

  // The featured story is the newest article in the feed; the rest fill the grid.
  const featured = showFeatured ? initialArticles[0] ?? null : null;
  const featuredId = featured?.id ?? null;

  // Grid = this page's feed minus the featured card. Purely derived: paging is
  // navigation now (see Pagination), so there is no client-side feed state to
  // keep — every page is a fresh server render at its own URL.
  const grid = initialArticles.filter((a) => a.id !== featuredId);

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

      {/* Replaces the old "Load more" button outright. That was a server
          action behind a <button>, which no crawler could follow — see
          pagination.tsx. */}
      <Pagination
        pillarSlug={pillarId}
        pillarColor={pillarColor}
        currentPage={currentPage}
        totalPages={totalPages}
      />

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
