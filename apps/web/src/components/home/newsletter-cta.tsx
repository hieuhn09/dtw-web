"use client";

import { Button } from "@dtw/ui";
import { GridBackdrop } from "@/components/effects";
import { useT } from "@/lib/i18n";

export function NewsletterCta() {
  const t = useT();
  return (
    <section style={{ marginBottom: 32 }}>
      <div
        style={{
          background: "var(--banner)",
          color: "#FFFFFF",
          borderRadius: 8,
          padding: "48px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: 48,
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <GridBackdrop color="rgba(255,255,255,.05)" size={40} fadeRadius="80%" />
        <div
          style={{
            position: "absolute",
            left: -60,
            bottom: -60,
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: "var(--accent)",
            opacity: 0.16,
            filter: "blur(70px)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative" }}>
          <div className="kicker" style={{ color: "var(--accent)", marginBottom: 8 }}>
            {t(
              "Eight newsletters · pick what you read",
              "Tám bản tin · chọn theo sở thích",
              "Delapan newsletter · pilih yang Anda baca"
            )}
          </div>
          <h2
            className="serif"
            style={{
              margin: "0 0 10px",
              fontSize: 34,
              fontWeight: 650,
              letterSpacing: "-0.02em",
              color: "#FFFFFF",
            }}
          >
            {t(
              "Don't doom-scroll. Get the day in 5 minutes.",
              "Đừng trôi vô tận. Đọc xâu tóm cả ngày trong 5 phút.",
              "Jangan doom-scroll. Dapatkan hari ini dalam 5 menit."
            )}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.55,
              color: "rgba(232,237,247,0.70)",
              maxWidth: 540,
            }}
          >
            {t(
              "AM Brief, PM Brief, AI Weekly, Asia Funding, Dev Digest, Products & Deals, Deep Dive, DTW Awards.",
              "AM Brief, PM Brief, AI Weekly, Asia Funding, Dev Digest, Products & Deals, Deep Dive, DTW Awards.",
              "AM Brief, PM Brief, AI Weekly, Asia Funding, Dev Digest, Products & Deals, Deep Dive, DTW Awards."
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, position: "relative" }}>
          <Button href="/newsletters" variant="accent" size="lg">
            {t("Browse newsletters", "Xem các bản tin", "Jelajahi newsletter")}
          </Button>
        </div>
      </div>
    </section>
  );
}
