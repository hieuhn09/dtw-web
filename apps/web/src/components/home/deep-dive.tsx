"use client";

import Link from "next/link";
import { PillarTag } from "@dtw/ui";
import { CoverArt } from "@/components/cover-art";
import { BylineWired } from "@/components/byline-wired";
import { SectionHeader } from "./section-header";
import type { ArticleView } from "@/lib/article-view";
import { localizedPillarLabel, useLang, useT } from "@/lib/i18n";

export interface DeepDiveProps {
  article: ArticleView | null;
}

export function DeepDive({ article }: DeepDiveProps) {
  const t = useT();
  const { lang } = useLang();
  if (!article) return null;

  return (
    <section style={{ marginBottom: 48 }}>
      <SectionHeader
        title={t("Deep Dive of the Week", "Bài phân tích tuần", "Deep Dive Minggu Ini")}
        kicker={t("Long-form · data-driven", "Dài hai · dựa trên dữ liệu", "Panjang · berbasis data")}
      />
      <Link href={`/article/${article.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
        <article
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: 40,
            alignItems: "center",
            cursor: "pointer",
            padding: "32px 0",
          }}
        >
          <CoverArt
            pillar={article.pillar}
            seed={article.id}
            src={article.heroImageUrl}
            variant={4}
            height={380}
            label="DATA · ASEAN CAPEX MAP"
          />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <PillarTag id={article.pillar} label={localizedPillarLabel(article.pillar, lang)} />
              <span className="mono text-mute" style={{ fontSize: 11 }}>{article.section}</span>
              <span className="text-mute" style={{ fontSize: 11 }}>·</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--accent)" }}>
                {article.readMin} {t("min read", "phút đọc", "menit baca")}
              </span>
            </div>
            <h3
              className="serif"
              style={{
                margin: "0 0 14px",
                fontSize: 36,
                fontWeight: 650,
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
              }}
            >
              {article.title}
            </h3>
            <p className="serif text-mute" style={{ margin: "0 0 18px", fontSize: 17, lineHeight: 1.5 }}>
              {article.dek}
            </p>
            <BylineWired article={article} size="lg" />
          </div>
        </article>
      </Link>
    </section>
  );
}
