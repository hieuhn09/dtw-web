"use client";

import Link from "next/link";
import { PillarTag } from "@dtw/ui";
import { CoverArt } from "@/components/cover-art";
import { ExclusiveChip } from "@/components/exclusive-chip";
import { Icon } from "@/components/icons";
import { TimeAgo } from "@/components/time-ago";
import type { ArticleView } from "@/lib/article-view";
import { EXCLUSIVE_DEFINITION_HREF, EXCLUSIVE_FEED_PATH, exclusivePagePath } from "@/lib/exclusive";
import { localizedPillarLabel, useLang, useT } from "@/lib/i18n";

export interface ExclusiveContentProps {
  articles: ReadonlyArray<ArticleView>;
  page: number;
  hasNextPage: boolean;
}

const pagerLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: 44,
  padding: "0 18px",
  border: "1px solid var(--hair-2)",
  borderRadius: 5,
  fontSize: 13,
  fontWeight: 500,
  color: "inherit",
  textDecoration: "none",
} as const;

/**
 * `/exclusive` body: header (flag kicker, title, tagline, RSS + definition
 * links), a grid of flagged stories, and a prev/next pager. Cards carry no
 * Exclusive chip here: every story on this page is one.
 */
export function ExclusiveContent({ articles, page, hasNextPage }: ExclusiveContentProps) {
  const t = useT();
  const { lang } = useLang();
  const showPager = page > 1 || hasNextPage;

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 56 }}>
      <header style={{ borderBottom: "4px solid var(--accent)", paddingBottom: 24, marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Icon name="flag" size={22} color="var(--accent)" stroke={2} />
          <span
            className="upper"
            style={{
              fontSize: 12,
              fontWeight: 650,
              letterSpacing: ".18em",
              color: "var(--accent)",
              textTransform: "uppercase",
            }}
          >
            OTW · {t("Exclusive", "Độc quyền", "Eksklusif")}
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
          {t("Exclusive", "Độc quyền", "Eksklusif")}
        </h1>
        <p className="serif text-mute" style={{ margin: 0, fontSize: 19, lineHeight: 1.45, maxWidth: 760 }}>
          {t(
            "Original reporting by Opentechwire.",
            "Bài viết gốc do Opentechwire thực hiện.",
            "Liputan orisinal dari Opentechwire."
          )}
        </p>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 20 }}>
          <a
            href={EXCLUSIVE_FEED_PATH}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 12px",
              border: "1px solid var(--hair-2)",
              borderRadius: 5,
              fontSize: 12,
              fontWeight: 500,
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <Icon name="rss" size={13} />
            {t("RSS feed", "Nguồn RSS", "Umpan RSS")}
          </a>
          <Link
            href={EXCLUSIVE_DEFINITION_HREF}
            className="text-mute"
            style={{ padding: "7px 12px", fontSize: 12, fontWeight: 500, textDecoration: "none" }}
          >
            {t("What this label means →", "Nhãn này nghĩa là gì →", "Arti label ini →")}
          </Link>
        </div>
      </header>

      {articles.length === 0 ? (
        <p className="serif text-mute" style={{ fontSize: 17, margin: "24px 0" }}>
          {t(
            "No exclusives published yet. Check back soon.",
            "Chưa có bài độc quyền nào. Hãy quay lại sau.",
            "Belum ada berita eksklusif. Silakan cek lagi nanti."
          )}
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
            gap: 32,
          }}
        >
          {articles.map((a, i) => (
            <Link key={a.id} href={`/article/${a.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
              <article style={{ cursor: "pointer" }}>
                <CoverArt
                  pillar={a.pillar}
                  seed={a.id}
                  src={a.heroImageUrl}
                  variant={(i + 2) % 6}
                  height={210}
                  style={{ marginBottom: 14 }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <PillarTag id={a.pillar} label={localizedPillarLabel(a.pillar, lang)} />
                  {/* Hidden by the shared rule on this page; kept for one code path. */}
                  <ExclusiveChip article={a} onExclusivePage />
                </div>
                <h3
                  className="serif"
                  style={{ margin: "8px 0", fontSize: 21, fontWeight: 600, lineHeight: 1.25, letterSpacing: "-0.01em" }}
                >
                  {a.title}
                </h3>
                <p className="text-mute serif" style={{ margin: "0 0 10px", fontSize: 14, lineHeight: 1.45 }}>
                  {a.dek.length > 140 ? `${a.dek.slice(0, 140)}…` : a.dek}
                </p>
                <div className="text-mute" style={{ fontSize: 12 }}>
                  {a.author} · <TimeAgo iso={a.published} /> · {a.readMin}m
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}

      {showPager && (
        <nav
          aria-label="Pagination"
          style={{
            marginTop: 48,
            paddingTop: 20,
            borderTop: "1px solid var(--hair)",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 12,
          }}
        >
          {page > 1 && (
            <Link href={exclusivePagePath(page - 1)} style={pagerLinkStyle}>
              {t("← Newer stories", "← Bài mới hơn", "← Berita lebih baru")}
            </Link>
          )}
          {hasNextPage && (
            <Link href={exclusivePagePath(page + 1)} style={pagerLinkStyle}>
              {t("Older stories →", "Bài cũ hơn →", "Berita lebih lama →")}
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
