"use client";

import Link from "next/link";
import { CoverArt } from "@/components/cover-art";
import { Icon } from "@/components/icons";
import { SectionHeader } from "./section-header";

interface ReviewItem {
  id: string;
  cat: string;
  product: string;
  verdict: string;
  price: string;
  score: string;
  slug?: string;
}

const ITEMS: ReadonlyArray<ReviewItem> = [
  {
    id: "r1",
    cat: "Phone",
    product: "Oppo Find X9 Pro",
    verdict: "Camera-first flagship",
    price: "$1,099",
    score: "4.5/5",
    slug: "oppo-find-x9-review",
  },
  {
    id: "r2",
    cat: "Laptop",
    product: "Lenovo ThinkPad X1 G14",
    verdict: "Best business laptop, 2026",
    price: "$2,189",
    score: "4.5/5",
  },
  {
    id: "r3",
    cat: "Wear",
    product: "Garmin Forerunner 975",
    verdict: "For runners who don't tap",
    price: "$649",
    score: "4.0/5",
  },
  {
    id: "r4",
    cat: "Audio",
    product: "Sony WF-1000XM6",
    verdict: "ANC champ, finally fits all",
    price: "$329",
    score: "4.5/5",
  },
];

export function BestOfReviews() {
  return (
    <section style={{ marginBottom: 48 }}>
      <SectionHeader
        title="Best of Reviews"
        kicker="Independent · affiliate-disclosed"
        right={
          <span
            className="text-mute"
            style={{
              fontSize: 11,
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "help",
            }}
            title="Some links earn DTW a commission. Reviews are independent and never paid for by manufacturers."
          >
            <span
              className="mono"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "var(--ink)",
                color: "var(--paper)",
                fontSize: 9,
                fontWeight: 600,
              }}
            >
              i
            </span>
            About affiliate links
          </span>
        }
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 20,
        }}
      >
        {ITEMS.map((r) => {
          const body = (
            <article
              className="card-hover"
              style={{
                border: "1px solid var(--hair)",
                borderRadius: 6,
                overflow: "hidden",
                background: "var(--surface)",
                cursor: "pointer",
              }}
            >
              <CoverArt
                pillar="products"
                seed={r.id}
                variant={(r.id.charCodeAt(1) % 4) + 2}
                height={150}
              />
              <div style={{ padding: 14 }}>
                <div
                  className="upper text-mute"
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: ".12em",
                    marginBottom: 4,
                    textTransform: "uppercase",
                  }}
                >
                  {r.cat}
                </div>
                <div
                  className="serif"
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    marginBottom: 4,
                    lineHeight: 1.25,
                  }}
                >
                  {r.product}
                </div>
                <div className="text-mute" style={{ fontSize: 12, marginBottom: 10 }}>
                  {r.verdict}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 10,
                    borderTop: "1px solid var(--hair)",
                  }}
                >
                  <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>
                    {r.price}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--accent)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Icon name="star" size={11} color="var(--accent)" /> {r.score}
                  </span>
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: 10,
                    color: "var(--muted-2)",
                    marginTop: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Icon name="dollar" size={10} /> Affiliate link
                </div>
              </div>
            </article>
          );
          return r.slug ? (
            <Link
              key={r.id}
              href={`/article/${r.slug}`}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {body}
            </Link>
          ) : (
            <div key={r.id}>{body}</div>
          );
        })}
      </div>
    </section>
  );
}
