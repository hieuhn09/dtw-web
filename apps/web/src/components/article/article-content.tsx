"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PillarTag } from "@dtw/ui";
import { Avatar, CoverArt } from "@/components/cover-art";
import { ArticleBody } from "@/components/article/article-body";
import { AudioPlayerBar } from "@/components/article/audio-player";
import { ShareBar } from "@/components/article/share-bar";
import { Paywall } from "@/components/article/paywall";
import { RelatedRow } from "@/components/article/related-row";
import type { ArticleView } from "@/lib/article-view";
import { fmtDateL, localizedPillarLabel, useLang, useT } from "@/lib/i18n";
import { useShell } from "@/lib/shell";

export interface ArticleContentProps {
  article: ArticleView;
  related: ReadonlyArray<ArticleView>;
}

export function ArticleContent({ article, related }: ArticleContentProps) {
  const t = useT();
  const { lang } = useLang();
  const { articlesRead, incrementRead, user, openAuth } = useShell();

  const hitPaywall = articlesRead > 3 && !user && !article.sponsored;

  useEffect(() => {
    if (!article.sponsored) incrementRead(article.id);
    window.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article.id]);

  const pillarSlug = `/${article.pillar}`;

  return (
    <article className="container" style={{ paddingTop: 24, paddingBottom: 32 }}>
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          marginBottom: 18,
          color: "var(--muted)",
        }}
      >
        <Link href="/" className="linkish" style={{ color: "inherit" }}>DTW</Link>
        <span>›</span>
        <Link
          href={pillarSlug}
          className="linkish"
          style={{ color: article.pillarColor, fontWeight: 500, textDecoration: "none" }}
        >
          {localizedPillarLabel(article.pillar, lang)}
        </Link>
        <span>›</span>
        <span>{article.section}</span>
      </nav>

      <header style={{ maxWidth: 780, margin: "0 auto 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <PillarTag id={article.pillar} label={localizedPillarLabel(article.pillar, lang)} />
          <span className="mono text-mute" style={{ fontSize: 11 }}>{article.section}</span>
          {article.deepDive && (
            <span
              className="mono"
              style={{
                fontSize: 10,
                padding: "2px 8px",
                background: "var(--ink)",
                color: "var(--paper)",
                borderRadius: 3,
                fontWeight: 600,
                letterSpacing: ".08em",
              }}
            >
              DEEP DIVE
            </span>
          )}
          {article.aiAssisted && (
            <span
              className="mono"
              style={{
                fontSize: 10,
                padding: "2px 8px",
                border: "1px solid var(--hair-2)",
                borderRadius: 3,
                fontWeight: 600,
                letterSpacing: ".08em",
                color: "var(--muted)",
              }}
            >
              AI-ASSISTED
            </span>
          )}
          {article.sponsored && (
            <span
              className="mono"
              style={{
                fontSize: 10,
                padding: "2px 8px",
                background: "#FEF3C7",
                color: "#7A5800",
                borderRadius: 3,
                fontWeight: 600,
                letterSpacing: ".08em",
                border: "1px solid #E0B900",
              }}
            >
              PAID PARTNER · {article.sponsor}
            </span>
          )}
        </div>
        <h1
          className="serif"
          style={{
            margin: "0 0 18px",
            fontSize: 54,
            fontWeight: 700,
            letterSpacing: "-0.028em",
            lineHeight: 1.05,
          }}
        >
          {article.title}
        </h1>
        <p className="serif text-mute" style={{ margin: "0 0 24px", fontSize: 21, lineHeight: 1.4 }}>
          {article.dek}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            paddingTop: 18,
            borderTop: "1px solid var(--hair)",
            paddingBottom: 18,
            borderBottom: "1px solid var(--hair)",
          }}
        >
          <Avatar name={article.author} size={44} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{article.author}</div>
            <div className="text-mute" style={{ fontSize: 11 }}>
              {article.authorRole} · {article.authorCity}
            </div>
          </div>
          <div className="text-mute mono" style={{ fontSize: 11, textAlign: "right" }}>
            <div>{fmtDateL(article.published, lang)}</div>
            <div>
              {article.readMin} {t("min read", "phút đọc", "menit baca")}
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto 8px" }}>
        <CoverArt
          pillar={article.pillar}
          seed={article.id}
          variant={0}
          height={520}
          label={article.image?.label ?? "HERO"}
        />
        <div
          className="text-mute"
          style={{ fontSize: 11, marginTop: 8, fontStyle: "italic", padding: "0 4px" }}
        >
          Cover: editorial composition · srcset 320 / 640 / 1024 / 1920 · AVIF + WebP · LQIP blur
        </div>
      </div>

      <AudioPlayerBar />

      <div style={{ marginTop: 32 }}>
        <ArticleBody article={article} />
      </div>

      {!hitPaywall && <ShareBar />}

      {hitPaywall && (
        <div style={{ marginTop: 32 }}>
          <Paywall onLogin={openAuth} />
        </div>
      )}

      {article.affiliate && (
        <div
          style={{
            maxWidth: 680,
            margin: "24px auto",
            padding: "12px 14px",
            background: "var(--surface-2)",
            borderRadius: 6,
            fontSize: 12,
            color: "var(--muted)",
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
          }}
        >
          <span
            className="mono"
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 6px",
              background: "var(--ink)",
              color: "var(--paper)",
              borderRadius: 3,
              flexShrink: 0,
            }}
          >
            $
          </span>
          <span>
            <strong style={{ color: "var(--ink)" }}>Affiliate disclosure:</strong> Some links in this
            review earn DTW a commission. Manufacturers do not approve our reviews, and we do not
            accept review units in exchange for coverage.
          </span>
        </div>
      )}

      <RelatedRow articles={related} />

      <div
        style={{
          maxWidth: 680,
          margin: "40px auto 0",
          padding: 14,
          background: "var(--surface)",
          border: "1px solid var(--hair)",
          borderRadius: 6,
          fontSize: 12,
          color: "var(--muted)",
        }}
      >
        <strong style={{ color: "var(--ink)" }}>Spot something wrong?</strong> Email{" "}
        <span className="mono">corrections@dailytechwire.asia</span>. We log every correction publicly.
      </div>
    </article>
  );
}
