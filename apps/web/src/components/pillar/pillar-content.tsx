"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button, PillarTag } from "@dtw/ui";
import { CoverArt } from "@/components/cover-art";
import { Icon } from "@/components/icons";
import { BylineWired } from "@/components/byline-wired";
import { TimeAgo } from "@/components/time-ago";
import type { ArticleView } from "@/lib/article-view";
import { type PillarId } from "@/lib/data";
import { localizedPillarLabel, useLang, useT } from "@/lib/i18n";

const PAGE_SIZE = 21;

export interface PillarContentProps {
  /** Pillar slug from the CMS (not constrained to the 6 known ids). */
  pillarId: string;
  pillarColor: string;
  /** Icon name from the CMS pillar doc. */
  pillarIcon: string;
  pillarHeading: string;
  pillarDescription: string;
  articles: ReadonlyArray<ArticleView>;
  /** Total stories badge — fed by the server to avoid Date.now()-based mismatches. */
  totalCount: number;
}

export function PillarContent({
  pillarId,
  pillarColor,
  pillarIcon,
  pillarHeading,
  pillarDescription,
  articles,
  totalCount,
}: PillarContentProps) {
  const t = useT();
  const { lang } = useLang();
  // i18n label for the 6 known pillars; falls back to the CMS heading for any
  // pillar added later that isn't in the static label map.
  const pillarLabel = localizedPillarLabel(pillarId as PillarId, lang) || pillarHeading;

  const featured = articles[0] ?? null;
  const rest = articles.slice(1);

  const subsections = useMemo(() => {
    const s = new Set<string>();
    articles.forEach((a) => a.section && s.add(a.section));
    return ["All", ...Array.from(s)];
  }, [articles]);

  const [activeSub, setActiveSub] = useState<string>("All");
  const [shown, setShown] = useState<number>(PAGE_SIZE);

  useEffect(() => {
    setShown(PAGE_SIZE);
  }, [activeSub, pillarId]);

  const visible = activeSub === "All" ? rest : rest.filter((a) => a.section === activeSub);
  const paged = visible.slice(0, shown);
  const hasMore = visible.length > shown;

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
              fontWeight: 700,
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
            fontWeight: 700,
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
            {totalCount} stories
          </span>
        </div>
      </header>

      {/* Subsection tabs */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 32,
          borderBottom: "1px solid var(--hair)",
          overflowX: "auto",
        }}
      >
        {subsections.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSub(s)}
            style={{
              padding: "12px 18px",
              background: "transparent",
              border: "none",
              borderBottom:
                activeSub === s
                  ? `2px solid ${pillarColor}`
                  : "2px solid transparent",
              marginBottom: -1,
              fontSize: 13,
              fontWeight: activeSub === s ? 600 : 400,
              color: activeSub === s ? "var(--ink)" : "var(--muted)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {s}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 8 }}>
          <span className="text-mute-2 mono" style={{ fontSize: 11 }}>
            {t("Sort:", "Sắp xếp:", "Urut:")}
          </span>
          <select
            style={{
              background: "transparent",
              border: "1px solid var(--hair-2)",
              padding: "4px 8px",
              borderRadius: 4,
              fontSize: 12,
              color: "var(--ink)",
              fontFamily: "var(--font-sans)",
            }}
          >
            <option>{t("Latest", "Mới nhất", "Terbaru")}</option>
            <option>{t("Most read", "Đọc nhiều", "Paling dibaca")}</option>
            <option>{t("Editor's picks", "Lựa chọn biên tập", "Pilihan editor")}</option>
          </select>
        </div>
      </div>

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
                  fontWeight: 700,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.05,
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
        {paged.map((a, i) => (
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
          <Button variant="outline" size="lg" onClick={() => setShown((s) => s + PAGE_SIZE)}>
            {t("Load more", "Tải thêm", "Muat lagi")}
          </Button>
        </div>
      )}

      {!hasMore && visible.length > PAGE_SIZE && (
        <div
          style={{
            textAlign: "center",
            marginTop: 48,
            color: "var(--muted)",
            fontSize: 13,
          }}
        >
          {t("End of feed.", "Hết bài.", "Akhir feed.")}
        </div>
      )}

      {visible.length === 0 && !featured && (
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
