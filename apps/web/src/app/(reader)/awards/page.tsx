"use client";

import { Button } from "@dtw/ui";
import { GridBackdrop } from "@/components/effects";
import { Icon } from "@/components/icons";
import { useT } from "@/lib/i18n";

export default function AwardsPage() {
  const t = useT();
  return (
    <div
      className="container"
      style={{ paddingTop: 35, paddingBottom: 80 }}
    >
      {/* Hero is PINNED to a fixed dark stage (#0F172A) in both themes —
          amber text/shimmer is only allowed on dark/navy surfaces (Brand
          Guideline §4.4: accent-500 on white FAILS; amber on #0F172A = 8.3:1).
          All inner tints use fixed #E2E8F0/#2563EB, not theme vars. */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#0F172A",
          color: "#E2E8F0",
          borderRadius: 16,
          textAlign: "center",
          border: "1px solid color-mix(in oklab, #E2E8F0 8%, transparent)",
          padding: "85px 56px",
        }}
      >
        <GridBackdrop color="rgba(255,255,255,.05)" size={48} fadeRadius="85%" />
        <div
          style={{
            position: "absolute",
            left: "20%",
            top: -120,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: "#2563EB",
            opacity: 0.22,
            filter: "blur(100px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "10%",
            top: 80,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "#FCD34D",
            opacity: 0.1,
            filter: "blur(90px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: -140,
            width: 520,
            height: 320,
            borderRadius: "50%",
            background: "#2563EB",
            opacity: 0.15,
            filter: "blur(110px)",
            transform: "translateX(-50%)",
            pointerEvents: "none",
          }}
        />

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            fontFamily: "var(--font-serif)",
            fontWeight: 700,
            fontSize: "clamp(110px, 40vw, 440px)",
            lineHeight: 1,
            letterSpacing: "-0.05em",
            color: "color-mix(in oklab, #E2E8F0 4%, transparent)",
            pointerEvents: "none",
            userSelect: "none",
            whiteSpace: "nowrap",
          }}
        >
          2026
        </div>

        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginBottom: 36,
            }}
          >
            <div
              style={{
                height: 1,
                background:
                  "linear-gradient(to right, transparent, color-mix(in oklab, #E2E8F0 35%, transparent))",
                flex: 1,
                maxWidth: 200,
              }}
            />
            <span style={{ color: "var(--amber)", fontSize: 10 }}>◆</span>
            <span
              className="mono upper"
              style={{
                fontSize: 11,
                letterSpacing: ".28em",
                fontWeight: 600,
                color: "var(--amber)",
                textTransform: "uppercase",
              }}
            >
              Est · MMXXVI
            </span>
            <span style={{ color: "var(--amber)", fontSize: 10 }}>◆</span>
            <div
              style={{
                height: 1,
                background:
                  "linear-gradient(to left, transparent, color-mix(in oklab, #E2E8F0 35%, transparent))",
                flex: 1,
                maxWidth: 200,
              }}
            />
          </div>

          <h1
            className="serif"
            style={{
              margin: "0 auto 14px",
              fontSize: "clamp(48px, 14vw, 96px)",
              fontWeight: 500,
              letterSpacing: "-0.03em",
              lineHeight: 0.95,
              maxWidth: 900,
            }}
          >
            <span
              style={{
                background:
                  "linear-gradient(120deg, #FCD34D 0%, #F59E0B 40%, #FCD34D 60%, #F59E0B 100%)",
                backgroundSize: "300% 100%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "awardsShimmer 4.5s ease-in-out infinite",
              }}
            >
              {t("Coming this year", "Sắp ra mắt trong năm nay", "Hadir tahun ini")}
            </span>
          </h1>

          <div
            className="serif"
            style={{
              fontSize: 18,
              fontStyle: "italic",
              color: "color-mix(in oklab, #E2E8F0 65%, transparent)",
              marginBottom: 32,
              letterSpacing: ".01em",
            }}
          >
            {t(
              "An awards moment for Asia's technology decade",
              "Một dấu mốc cho thập kỷ công nghệ châu Á",
              "Sebuah momen penghargaan untuk dekade teknologi Asia"
            )}
          </div>

          <p
            className="serif"
            style={{
              margin: "0 auto 36px",
              fontSize: 18,
              lineHeight: 1.55,
              color: "color-mix(in oklab, #E2E8F0 75%, transparent)",
              maxWidth: 580,
            }}
          >
            {t(
              "We're building an awards programme that recognises the companies and people quietly shaping Asia's technology decade. Categories, panel, and nominations – all unveiled later this year.",
              "Chúng tôi đang xây dựng một giải thưởng tôn vinh những công ty và con người đang lặng lẽ định hình thập kỷ công nghệ của châu Á. Hạng mục, ban giám khảo và đề cử sẽ được công bố vào cuối năm nay.",
              "Kami sedang menyiapkan program penghargaan untuk mengenali perusahaan dan tokoh yang diam-diam membentuk dekade teknologi Asia. Kategori, juri, dan nominasi akan diumumkan akhir tahun ini."
            )}
          </p>

          <div
            style={{
              width: 64,
              height: 2,
              margin: "0 auto 32px",
              background:
                "linear-gradient(to right, transparent, var(--amber), transparent)",
            }}
          />

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 18px",
              background: "color-mix(in oklab, #E2E8F0 6%, transparent)",
              border: "1px solid color-mix(in oklab, #E2E8F0 15%, transparent)",
              borderRadius: 99,
              fontSize: 13,
              color: "color-mix(in oklab, #E2E8F0 85%, transparent)",
              marginBottom: 28,
            }}
          >
            <Icon name="mail" size={14} color="var(--amber)" stroke={2.2} />
            <span>
              {t(
                "Be the first to know when nominations open — straight to your inbox",
                "Là người đầu tiên biết khi đề cử mở — gửi thẳng đến hộp thư",
                "Jadi yang pertama tahu saat nominasi dibuka — langsung ke kotak masuk"
              )}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button href="/newsletters" variant="accent" size="lg">
              {t(
                "Subscribe for updates",
                "Đăng ký nhận thông báo",
                "Berlangganan untuk update"
              )}
            </Button>
            <Button
              href="/"
              variant="ghost"
              size="lg"
              style={{
                color: "#E2E8F0",
                border:
                  "1px solid color-mix(in oklab, #E2E8F0 20%, transparent)",
              }}
            >
              {t("Back to homepage", "Về trang chủ", "Kembali ke beranda")}
            </Button>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes awardsShimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
