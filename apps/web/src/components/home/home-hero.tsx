"use client";

import Link from "next/link";
import { PillarTag } from "@dtw/ui";
import { CoverArt } from "@/components/cover-art";
import { BylineWired } from "@/components/byline-wired";
import { TimeAgo } from "@/components/time-ago";
import type { ArticleView } from "@/lib/article-view";
import { localizedPillarLabel, useLang, useT } from "@/lib/i18n";

export interface HomeHeroProps {
  lead: ArticleView;
  aside: ReadonlyArray<ArticleView>;
}

export function HomeHero({ lead, aside }: HomeHeroProps) {
  const t = useT();
  const { lang } = useLang();

  return (
    <section
      className="r-hero"
      style={{
        display: "grid",
        gap: 32,
        padding: "25px 0 32px",
      }}
    >
      <Link
        href={`/article/${lead.slug}`}
        style={{ cursor: "pointer", color: "inherit", textDecoration: "none" }}
      >
        <CoverArt pillar={lead.pillar} seed={lead.id} src={lead.heroImageUrl} variant={0} height={410} label="DTW HERO" />
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
          <PillarTag id={lead.pillar} label={localizedPillarLabel(lead.pillar, lang)} />
          <span className="mono text-mute-2" style={{ fontSize: 11 }}>{lead.section}</span>
          <span className="text-mute-2" style={{ fontSize: 11 }}>·</span>
          <span className="mono text-mute-2" style={{ fontSize: 11 }}>
            <TimeAgo iso={lead.published} />
          </span>
        </div>
        <h2
          className="serif"
          style={{
            fontSize: "clamp(28px, 6vw, 46px)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            margin: "5px 0 10px",
          }}
        >
          {lead.title}
        </h2>
        <p className="serif text-mute" style={{ margin: 0, fontSize: 18, lineHeight: 1.45, maxWidth: 680 }}>
          {lead.dek}
        </p>
        <div style={{ marginTop: 14 }}>
          <BylineWired article={lead} size="lg" />
        </div>
      </Link>

      <div
        className="r-hero-aside"
        style={{
          borderLeft: "1px solid var(--hair)",
          paddingLeft: 24,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div
          className="upper"
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: ".14em",
            color: "var(--muted)",
            textTransform: "uppercase",
          }}
        >
          {t("Also leading today", "Cũng đầu trang hôm nay", "Berita utama lainnya hari ini")}
        </div>
        {aside.map((a, i) => (
          <Link key={a.id} href={`/article/${a.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
            <article
              className="r-hero-item"
              style={{
                cursor: "pointer",
                paddingBottom: 18,
                borderBottom: i < aside.length - 1 ? "1px solid var(--hair)" : "none",
                display: "grid",
                gridTemplateColumns: "1fr 110px",
                gap: 14,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <PillarTag id={a.pillar} label={localizedPillarLabel(a.pillar, lang)} />
                  <span className="mono text-mute-2" style={{ fontSize: 11 }}>
                    <TimeAgo iso={a.published} />
                  </span>
                </div>
                <h3
                  className="serif"
                  style={{
                    margin: "0 0 6px",
                    fontSize: 18,
                    fontWeight: 600,
                    lineHeight: 1.25,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {a.title}
                </h3>
                <div className="text-mute" style={{ fontSize: 12 }}>
                  {t("By", "Bởi", "Oleh")} {a.author} · {a.readMin} {t("min", "phút", "menit")}
                </div>
              </div>
              <CoverArt pillar={a.pillar} seed={a.id} src={a.heroImageUrl} variant={2 + (i % 3)} height={86} />
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
