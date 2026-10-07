"use client";

import Image from "next/image";
import { useT } from "@/lib/i18n";

// TODO: metadata — add generateMetadata once these client marketing pages
// move to a server-component shell.

// The Asia Tech Awards run as a section of BriefAsia.com, not on this site.
const ATA_URL = "https://www.briefasia.com/asia-tech-awards";

export default function AwardsPage() {
  const t = useT();
  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 64 }}>
      {/* ATA banner. The surface is ATA's own dark artwork in BOTH themes, so
          every text/border value here is a FIXED light value — never
          var(--ink)/var(--paper). The whole banner is one link out to ATA. */}
      <a
        href={ATA_URL}
        target="_blank"
        rel="noopener"
        aria-label={t(
          "Visit the Asia Tech Awards website",
          "Truy cập website Asia Tech Awards",
          "Kunjungi situs Asia Tech Awards"
        )}
        style={{
          position: "relative",
          display: "block",
          overflow: "hidden",
          borderRadius: 16,
          border: "1px solid rgba(255, 255, 255, 0.10)",
          color: "#FFFFFF",
          textDecoration: "none",
          backgroundColor: "#2A0A08",
          backgroundImage:
            "linear-gradient(100deg, rgba(26, 6, 5, 0.92) 0%, rgba(26, 6, 5, 0.78) 45%, rgba(26, 6, 5, 0.35) 100%), url(/awards/ata-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "clamp(36px, 7vw, 72px) clamp(24px, 6vw, 64px)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "clamp(28px, 5vw, 56px)",
          }}
        >
          <Image
            src="/awards/ata-logo.png"
            priority
            alt="Asia Tech Awards"
            width={276}
            height={166}
            style={{ width: "clamp(150px, 24vw, 276px)", height: "auto", flexShrink: 0 }}
          />

          <div style={{ flex: "1 1 320px", maxWidth: 560 }}>
            <div
              className="mono upper"
              style={{
                fontSize: 11,
                letterSpacing: ".18em",
                fontWeight: 600,
                marginBottom: 16,
                color: "#FCD34D",
              }}
            >
              {t(
                "Inaugural season · 2027",
                "Mùa đầu tiên · 2027",
                "Musim perdana · 2027"
              )}
            </div>

            <h1
              className="serif"
              style={{
                margin: "0 0 16px",
                fontSize: "clamp(34px, 6vw, 54px)",
                fontWeight: 650,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                textWrap: "balance",
              }}
            >
              Asia Tech Awards
            </h1>

            <p
              style={{
                margin: "0 0 28px",
                fontSize: 17,
                lineHeight: 1.6,
                color: "rgba(255, 255, 255, 0.82)",
              }}
            >
              {t(
                "Honouring technology products built in Asia that create measurable change, judged by the people who build products. A joint partnership between APCG and the Asia Awards Organization.",
                "Tôn vinh các sản phẩm công nghệ được xây dựng tại châu Á tạo ra thay đổi đo lường được, do chính những người làm sản phẩm chấm giải. Hợp tác giữa APCG và Asia Awards Organization.",
                "Menghormati produk teknologi buatan Asia yang menciptakan perubahan terukur, dinilai oleh orang-orang yang membangun produk. Kemitraan antara APCG dan Asia Awards Organization."
              )}
            </p>

            {/* The anchor above is the link; this is its visible affordance. */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 20px",
                borderRadius: 6,
                background: "var(--accent)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {t(
                "Visit Asia Tech Awards →",
                "Truy cập Asia Tech Awards →",
                "Kunjungi Asia Tech Awards →"
              )}
            </span>
          </div>
        </div>
      </a>
    </div>
  );
}
