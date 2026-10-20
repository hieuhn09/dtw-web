"use client";

import Link from "next/link";
import { PillarTag } from "@dtw/ui";
import { CoverArt } from "@/components/cover-art";
import { ExclusiveChip } from "@/components/exclusive-chip";
import { SectionHeader } from "./section-header";
import type { ArticleView } from "@/lib/article-view";
import { EXCLUSIVE_PATH } from "@/lib/exclusive";
import { localizedPillarLabel, useLang, useT } from "@/lib/i18n";

export interface ExclusiveBandProps {
  /** Up to 3 flagged stories, already de-duplicated against the hero lead. */
  articles: ReadonlyArray<ArticleView>;
}

/** Homepage "Exclusive" band. Renders nothing until a story is flagged. */
export function ExclusiveBand({ articles }: ExclusiveBandProps) {
  const t = useT();
  const { lang } = useLang();
  if (articles.length === 0) return null;

  return (
    <section style={{ margin: "0 0 48px" }}>
      <SectionHeader
        title={t("Exclusive", "Độc quyền", "Eksklusif")}
        kicker={t(
          "Original reporting by Opentechwire",
          "Bài gốc của Opentechwire",
          "Liputan orisinal Opentechwire"
        )}
        right={
          <Link
            href={EXCLUSIVE_PATH}
            className="text-mute"
            style={{ fontSize: 12, fontWeight: 500, textDecoration: "none" }}
          >
            {t("See all", "Xem tất cả", "Lihat semua")} →
          </Link>
        }
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
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
                variant={(i + 1) % 6}
                height={200}
                style={{ marginBottom: 14 }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <PillarTag id={a.pillar} label={localizedPillarLabel(a.pillar, lang)} />
                <ExclusiveChip article={a} />
              </div>
              <h3
                className="serif"
                style={{ margin: "8px 0", fontSize: 21, fontWeight: 600, lineHeight: 1.25, letterSpacing: "-0.01em" }}
              >
                {a.title}
              </h3>
              <div className="text-mute" style={{ fontSize: 12 }}>
                {t("By", "Bởi", "Oleh")} {a.author} · {a.readMin} {t("min", "phút", "menit")}
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
