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
              fontWeight: 650,
              letterSpacing: "-0.015em",
              textWrap: "balance",
            }}
          >
            {t(
              "The inaugural awards launch next year",
              "Giải thưởng đầu tiên ra mắt năm sau",
              "Penghargaan perdana diluncurkan tahun depan"
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
              "Recognising the founders, operators, and engineers quietly shaping Asia's technology decade. Categories, panel, and nominations revealed closer to launch.",
              "Tôn vinh những nhà sáng lập, lãnh đạo và kỹ sư đang lặng lẽ định hình thập kỷ công nghệ của châu Á. Hạng mục, ban giám khảo và đề cử sẽ được công bố gần ngày ra mắt.",
              "Mengenali para founder, operator, dan engineer yang diam-diam membentuk dekade teknologi Asia. Kategori, juri, dan nominasi diumumkan menjelang peluncuran."
            )}
          </p>
        </div>

        <Button href="/awards" variant="accent">
          {t("Learn more →", "Tìm hiểu thêm →", "Pelajari →")}
        </Button>
      </div>
    </section>
  );
}
