"use client";

import Link from "next/link";
import { BrandMark, CoverArt } from "@/components/cover-art";
import type { ArticleView } from "@/lib/article-view";

export interface SponsoredStripProps {
  article: ArticleView | null;
}

export function SponsoredStrip({ article: s }: SponsoredStripProps) {
  if (!s) return null;

  return (
    <section style={{ marginBottom: 48 }}>
      <div
        style={{
          background: "var(--sponsored)",
          border: "1px solid #E0B900",
          borderRadius: 8,
          padding: "24px 28px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 18,
          }}
        >
          <div>
            <div
              className="mono upper"
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: ".14em",
                color: "var(--ink)",
                marginBottom: 4,
                textTransform: "uppercase",
              }}
            >
              ⬢ Paid Partner Content · DTW Studio Presents
            </div>
            <div
              className="serif"
              style={{
                fontSize: 14,
                color: "color-mix(in oklab, var(--ink) 80%, transparent)",
              }}
            >
              Produced by DTW Studio for the partner below. The DTW newsroom was not involved.
            </div>
          </div>
          <span
            className="mono"
            style={{
              fontSize: 11,
              color: "var(--ink)",
              border: "1px solid color-mix(in oklab, var(--ink) 35%, transparent)",
              padding: "4px 8px",
              borderRadius: 3,
            }}
          >
            What is this?
          </span>
        </div>
        <Link
          href={`/article/${s.slug}`}
          style={{ color: "inherit", textDecoration: "none" }}
        >
          <article
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr auto",
              gap: 24,
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <CoverArt
              pillar="products"
              seed={s.id}
              src={s.heroImageUrl}
              variant={5}
              height={140}
              label={s.sponsor?.toUpperCase()}
            />
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <BrandMark name={s.sponsor ?? "AWS ASEAN"} bg="var(--ink)" fg="var(--paper)" />
                <span
                  className="mono upper"
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: ".12em",
                    color: "color-mix(in oklab, var(--ink) 75%, transparent)",
                    textTransform: "uppercase",
                  }}
                >
                  Sponsor
                </span>
              </div>
              <h4
                className="serif"
                style={{
                  margin: "0 0 8px",
                  fontSize: 22,
                  fontWeight: 600,
                  color: "var(--ink)",
                  lineHeight: 1.25,
                  letterSpacing: "-0.01em",
                }}
              >
                {s.title}
              </h4>
              <div
                style={{
                  fontSize: 12,
                  color: "color-mix(in oklab, var(--ink) 70%, transparent)",
                }}
              >
                {s.readMin} min · sponsored feature
              </div>
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-sans)",
                fontWeight: 500,
                fontSize: 13,
                padding: "9px 14px",
                borderRadius: 5,
                background: "var(--ink)",
                color: "var(--paper)",
                border: "1px solid var(--ink)",
              }}
            >
              Read →
            </span>
          </article>
        </Link>
      </div>
    </section>
  );
}
