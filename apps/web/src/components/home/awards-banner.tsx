"use client";

import Image from "next/image";
import { useT } from "@/lib/i18n";
import { ATA_URL } from "@/lib/asia-tech-awards";

// Homepage teaser for the Asia Tech Awards: a compact version of the /awards
// banner. The surface is ATA's own dark artwork in BOTH themes, so every
// text/border value here is a FIXED light value, never var(--ink)/var(--paper).
// The whole banner is one link out to ATA (same target as /awards).
export function AwardsBanner() {
  const t = useT();
  return (
    <section style={{ marginBottom: 48 }}>
      <a
        href={ATA_URL}
        target="_blank"
        rel="noopener"
        className="r-awards"
        aria-label={t(
          "Visit the Asia Tech Awards website",
          "Truy cập website Asia Tech Awards",
          "Kunjungi situs Asia Tech Awards"
        )}
        style={{
          display: "grid",
          gap: 28,
          alignItems: "center",
          overflow: "hidden",
          borderRadius: 10,
          border: "1px solid rgba(255, 255, 255, 0.10)",
          color: "#FFFFFF",
          textDecoration: "none",
          backgroundColor: "#2A0A08",
          backgroundImage:
            "linear-gradient(100deg, rgba(26, 6, 5, 0.94) 0%, rgba(26, 6, 5, 0.82) 55%, rgba(26, 6, 5, 0.45) 100%), url(/awards/ata-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "28px 32px",
        }}
      >
        <Image
          src="/awards/ata-logo.svg"
          alt="Asia Tech Awards"
          width={552}
          height={332}
          unoptimized
          style={{ width: 120, height: "auto" }}
        />

        <div>
          <div
            className="mono upper"
            style={{
              fontSize: 11,
              letterSpacing: ".18em",
              fontWeight: 600,
              marginBottom: 8,
              color: "#FCD34D",
            }}
          >
            {t(
              "Asia Tech Awards · Inaugural season 2027",
              "Asia Tech Awards · Mùa đầu tiên 2027",
              "Asia Tech Awards · Musim perdana 2027"
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
              "Built in Asia. Judged by the people who build.",
              "Xây dựng tại châu Á. Chấm giải bởi chính người làm sản phẩm.",
              "Dibangun di Asia. Dinilai oleh para pembangun."
            )}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.55,
              maxWidth: 620,
              color: "rgba(255, 255, 255, 0.82)",
            }}
          >
            {t(
              "Honouring technology products built in Asia that create measurable change. A joint partnership between APCG and the Asia Awards Organization.",
              "Tôn vinh các sản phẩm công nghệ được xây dựng tại châu Á tạo ra thay đổi đo lường được. Hợp tác giữa APCG và Asia Awards Organization.",
              "Menghormati produk teknologi buatan Asia yang menciptakan perubahan terukur. Kemitraan antara APCG dan Asia Awards Organization."
            )}
          </p>
        </div>

        {/* The anchor is the link; this is its visible affordance. */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: 6,
            background: "var(--accent)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {t(
            "Visit Asia Tech Awards →",
            "Truy cập Asia Tech Awards →",
            "Kunjungi Asia Tech Awards →"
          )}
        </span>
      </a>
    </section>
  );
}
