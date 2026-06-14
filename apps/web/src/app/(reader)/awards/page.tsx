"use client";

import { Button } from "@dtw/ui";
import { GridBackdrop } from "@/components/effects";
import { useT } from "@/lib/i18n";

// TODO: metadata — add generateMetadata once these client marketing pages
// move to a server-component shell.

export default function AwardsPage() {
  const t = useT();
  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 64 }}>
      {/* Calm "launching next year" hero on the navy --banner surface.
          --banner is navy in BOTH themes, so every text/border value here is a
          FIXED light value (cream / rgba) — never var(--ink)/var(--paper). */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background: "var(--banner)",
          color: "#E8EDF7",
          borderRadius: 16,
          border: "1px solid rgba(232, 237, 247, 0.08)",
          padding: "80px 64px",
          textAlign: "center",
        }}
      >
        <GridBackdrop color="rgba(232, 237, 247, .05)" size={44} fadeRadius="90%" />

        {/* one soft accent wash, bottom-right */}
        <div
          style={{
            position: "absolute",
            right: -120,
            bottom: -120,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "var(--accent)",
            opacity: 0.14,
            filter: "blur(120px)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", maxWidth: 640, margin: "0 auto" }}>
          {/* inaugural pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 24,
              padding: "5px 12px",
              borderRadius: 99,
              border: "1px solid rgba(232, 237, 247, 0.18)",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 99,
                background: "var(--accent)",
              }}
            />
            <span
              className="mono upper"
              style={{
                fontSize: 10,
                letterSpacing: ".18em",
                fontWeight: 600,
                color: "#E8EDF7",
              }}
            >
              {t(
                "Awards · Inaugural",
                "Giải thưởng · Lần đầu tiên",
                "Penghargaan · Perdana"
              )}
            </span>
          </div>

          <h1
            className="serif"
            style={{
              margin: "0 0 18px",
              fontSize: "clamp(40px, 9vw, 64px)",
              fontWeight: 650,
              letterSpacing: "-0.03em",
              lineHeight: 1.0,
              color: "#FFFFFF",
              textWrap: "balance",
            }}
          >
            {t("Launching next year", "Ra mắt năm sau", "Diluncurkan tahun depan")}
          </h1>

          <p
            style={{
              fontSize: 18,
              lineHeight: 1.6,
              color: "rgba(232, 237, 247, 0.72)",
              maxWidth: 520,
              margin: "0 auto 32px",
            }}
          >
            {t(
              "A new programme recognising the companies and people quietly shaping Asia's technology decade. Categories, panel, and nominations will be revealed closer to launch.",
              "Một giải thưởng mới tôn vinh những công ty và con người đang lặng lẽ định hình thập kỷ công nghệ của châu Á. Hạng mục, ban giám khảo và đề cử sẽ được công bố gần ngày ra mắt.",
              "Program baru yang mengenali perusahaan dan tokoh yang diam-diam membentuk dekade teknologi Asia. Kategori, juri, dan nominasi akan diumumkan menjelang peluncuran."
            )}
          </p>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Button href="/newsletters" variant="accent" size="lg">
              {t("Notify me", "Thông báo cho tôi", "Beri tahu saya")}
            </Button>
            <Button
              href="/"
              variant="ghost"
              size="lg"
              style={{
                color: "#E8EDF7",
                border: "1px solid rgba(232, 237, 247, 0.20)",
              }}
            >
              {t("Back to homepage", "Về trang chủ", "Kembali ke beranda")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
