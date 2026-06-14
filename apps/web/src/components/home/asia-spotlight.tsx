"use client";

import Link from "next/link";
import { Button } from "@dtw/ui";
import { CoverArt } from "@/components/cover-art";
import { SpotlightCard, GridBackdrop } from "@/components/effects";
import type { ArticleView } from "@/lib/article-view";
import { useT } from "@/lib/i18n";

export interface AsiaSpotlightProps {
  articles: ReadonlyArray<ArticleView>;
}

export function AsiaSpotlight({ articles }: AsiaSpotlightProps) {
  const items = articles.slice(0, 4);
  const t = useT();

  return (
    <SpotlightCard
      color="rgba(224,78,31,.22)"
      style={{
        background: "var(--banner)",
        color: "#FFFFFF",
        padding: "40px 32px",
        borderRadius: 8,
        marginBottom: 48,
      }}
    >
      <GridBackdrop color="rgba(255,255,255,.05)" size={48} fadeRadius="70%" />
      <div
        style={{
          position: "absolute",
          right: -40,
          top: -40,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: "var(--accent)",
          opacity: 0.18,
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 22,
          position: "relative",
        }}
      >
        <div>
          <div className="kicker" style={{ color: "var(--accent)", marginBottom: 6 }}>
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                background: "var(--accent)",
                marginRight: 8,
                verticalAlign: "middle",
              }}
            />
            {t(
              "Asia Tech Spotlight",
              "Điểm sáng công nghệ châu Á",
              "Sorotan Teknologi Asia"
            )}
          </div>
          <h2
            className="serif"
            style={{
              margin: 0,
              fontSize: 30,
              fontWeight: 650,
              letterSpacing: "-0.02em",
              color: "#FFFFFF",
            }}
          >
            {t(
              "What's moving from Singapore to Seoul this week.",
              "Điều gì đang chuyển động từ Singapore đến Seoul tuần này.",
              "Apa yang bergerak dari Singapura ke Seoul minggu ini."
            )}
          </h2>
        </div>
        <Button href="/latest" variant="accent">
          {t(
            "See all latest →",
            "Xem tất cả mới nhất →",
            "Lihat semua terbaru →"
          )}
        </Button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
          gap: 24,
          position: "relative",
        }}
      >
        {items.map((a, i) => (
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
                variant={(i + 1) % 6}
                height={150}
                style={{ marginBottom: 12 }}
              />
              <div
                className="upper"
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: ".14em",
                  color: "var(--accent)",
                  marginBottom: 6,
                  textTransform: "uppercase",
                }}
              >
                {a.pillarLabel}
              </div>
              <h4
                className="serif"
                style={{
                  margin: "0 0 6px",
                  fontSize: 16,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  color: "#FFFFFF",
                }}
              >
                {a.title}
              </h4>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(232,237,247,0.60)",
                }}
              >
                {a.authorCity} · {a.readMin} min
              </div>
            </article>
          </Link>
        ))}
      </div>
    </SpotlightCard>
  );
}
