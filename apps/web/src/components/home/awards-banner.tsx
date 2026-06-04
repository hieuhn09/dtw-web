"use client";

import { Button } from "@dtw/ui";
import { useT } from "@/lib/i18n";

export function AwardsBanner() {
  const t = useT();
  return (
    <section style={{ marginBottom: 48 }}>
      <div
        className="r-awards"
        style={{
          background: "var(--paper)",
          border: "1px solid var(--ink)",
          borderRadius: 10,
          padding: "28px 32px",
          display: "grid",
          gap: 28,
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background: "linear-gradient(to bottom, var(--accent), #FCD34D)",
          }}
        />

        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: "50%",
            background: "var(--ink)",
            color: "var(--paper)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            fontFamily: "var(--font-serif)",
            fontWeight: 700,
            marginLeft: 8,
            border: "1px solid rgba(224,78,31,.4)",
          }}
        >
          <span style={{ fontSize: 10, letterSpacing: ".18em", color: "var(--accent)" }}>
            EST
          </span>
          <span style={{ fontSize: 22, lineHeight: 1, marginTop: 2 }}>2026</span>
        </div>

        <div>
          <div className="kicker" style={{ marginBottom: 6, color: "var(--accent)" }}>
            {t(
              "Awards · Coming soon",
              "Giải thưởng · Sắp ra mắt",
              "Penghargaan · Segera hadir"
            )}
          </div>
          <h3
            className="serif"
            style={{
              margin: "0 0 6px",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "-0.015em",
            }}
          >
            {t(
              "The inaugural awards arrive in 2026",
              "Giải thưởng đầu tiên ra mắt năm 2026",
              "Penghargaan perdana hadir di 2026"
            )}
          </h3>
          <p
            className="text-mute"
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.55,
              maxWidth: 620,
            }}
          >
            {t(
              "Recognising the founders, operators, and engineers quietly shaping Asia's technology decade. Categories, panel, and nominations all revealed later this year.",
              "Tôn vinh những nhà sáng lập, lãnh đạo và kỹ sư đang lặng lẽ định hình thập kỷ công nghệ của châu Á. Hạng mục, ban giám khảo và đề cử sẽ được công bố trong năm nay.",
              "Mengenali para founder, operator, dan engineer yang diam-diam membentuk dekade teknologi Asia. Kategori, juri, dan nominasi akan diumumkan tahun ini."
            )}
          </p>
        </div>

        <Button href="/awards" variant="primary">
          {t("Learn more →", "Tìm hiểu thêm →", "Pelajari →")}
        </Button>
      </div>
    </section>
  );
}
