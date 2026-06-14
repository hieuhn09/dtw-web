"use client";

import Link from "next/link";
import { PillarTag } from "@dtw/ui";
import { CoverArt } from "@/components/cover-art";
import type { ArticleView } from "@/lib/article-view";
import { localizedPillarLabel, useLang, useT } from "@/lib/i18n";

export interface RelatedRowProps {
  articles: ReadonlyArray<ArticleView>;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h * 31) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function RelatedRow({ articles }: RelatedRowProps) {
  const { lang } = useLang();
  const t = useT();
  const related = articles.slice(0, 3);
  if (related.length === 0) return null;
  return (
    <section
      style={{
        marginTop: 64,
        paddingTop: 32,
        borderTop: "3px solid var(--brand-navy)",
      }}
    >
      <div className="kicker" style={{ marginBottom: 18 }}>
        {t("Read next", "Đọc tiếp", "Baca selanjutnya")}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
          gap: 24,
        }}
      >
        {related.map((a) => (
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
                variant={hashStr(a.id) % 6}
                height={160}
                style={{ marginBottom: 12 }}
              />
              <PillarTag id={a.pillar} label={localizedPillarLabel(a.pillar, lang)} />
              <h4
                className="serif"
                style={{
                  margin: "8px 0 6px",
                  fontSize: 18,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  letterSpacing: "-0.01em",
                  textWrap: "balance",
                }}
              >
                {a.title}
              </h4>
              <div className="text-mute" style={{ fontSize: 12 }}>
                {a.author} · {a.readMin} min
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
