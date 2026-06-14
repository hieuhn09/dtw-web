"use client";

import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";
import { CoverArt } from "@/components/cover-art";
import { SectionHeader } from "./section-header";
import { TimeAgo } from "@/components/time-ago";
import { type NavPillar, type PillarId } from "@/lib/data";
import type { ArticleView } from "@/lib/article-view";
import { useLang, useT } from "@/lib/i18n";

export interface PillarShowcaseProps {
  /** CMS pillars, ordered by `order`. Drives which bands show and their order. */
  pillars: NavPillar[];
  /** Articles grouped by pillar slug, sorted newest first. Up to 4 per pillar. */
  byPillar: Partial<Record<PillarId, ReadonlyArray<ArticleView>>>;
}

export function PillarShowcase({ pillars, byPillar }: PillarShowcaseProps) {
  const t = useT();
  const { lang } = useLang();

  return (
    <section style={{ marginBottom: 56 }}>
      <SectionHeader
        title={t("Across the pillars", "Theo các chuyên mục", "Lintas pilar")}
        kicker={t("Fresh in each section", "Mới nhất ở mỗi mục", "Terbaru di tiap rubrik")}
      />
      <div
        className="r-grid-3"
        style={{
          display: "grid",
          gap: 32,
        }}
      >
        {pillars.map((p) => {
          const items = (byPillar[p.slug as PillarId] ?? []).slice(0, 4);
          if (items.length === 0) return null;
          return (
            <div key={p.slug}>
              <Link
                href={`/${p.slug}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: 8,
                  marginBottom: 14,
                  borderBottom: `2px solid ${p.color}`,
                  cursor: "pointer",
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                <div
                  className="upper"
                  style={{
                    fontSize: 12,
                    fontWeight: 650,
                    letterSpacing: ".14em",
                    color: p.color,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    textTransform: "uppercase",
                  }}
                >
                  <Icon name={p.icon as IconName} size={14} color={p.color} />
                  {p.title[lang] ?? p.title.en}
                </div>
                <span className="text-mute-2" style={{ fontSize: 11 }}>
                  {t("See all →", "Xem tất cả →", "Lihat semua →")}
                </span>
              </Link>
              {items.map((a, i) => (
                <Link
                  key={a.id}
                  href={`/article/${a.slug}`}
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  <article
                    style={{
                      cursor: "pointer",
                      padding: "12px 0",
                      borderBottom: i < items.length - 1 ? "1px solid var(--hair)" : "none",
                    }}
                  >
                    {i === 0 && (
                      <CoverArt
                        pillar={a.pillar}
                        seed={a.id}
                        src={a.heroImageUrl}
                        variant={(i + 2) % 6}
                        height={120}
                        style={{ marginBottom: 10 }}
                      />
                    )}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: i === 0 ? "1fr" : "1fr 60px",
                        gap: 12,
                        alignItems: "start",
                      }}
                    >
                      <div>
                        <h4
                          className="serif"
                          style={{
                            margin: "0 0 4px",
                            fontSize: i === 0 ? 17 : 15,
                            fontWeight: 600,
                            lineHeight: 1.3,
                            letterSpacing: "-0.005em",
                          }}
                        >
                          {a.title}
                        </h4>
                        <div className="text-mute" style={{ fontSize: 11 }}>
                          {a.author} · <TimeAgo iso={a.published} /> · {a.readMin}m
                        </div>
                      </div>
                      {i !== 0 && (
                        <CoverArt pillar={a.pillar} seed={a.id} src={a.heroImageUrl} variant={(i + 3) % 6} height={48} />
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
