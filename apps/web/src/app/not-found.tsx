"use client";

import Link from "next/link";
import { PILLARS } from "@/lib/data";
import { localizedPillarLabel, useLang, useT } from "@/lib/i18n";

export default function NotFound() {
  const t = useT();
  const { lang } = useLang();
  return (
    <div
      className="container"
      style={{ paddingTop: 48, paddingBottom: 80, textAlign: "center" }}
    >
      <div className="kicker" style={{ marginBottom: 8 }}>
        404 · {t("Not in this newsroom", "Không có ở toà soạn này", "Tidak ada di redaksi")}
      </div>
      <h1
        className="serif"
        style={{
          margin: "0 0 14px",
          fontSize: "clamp(40px, 12vw, 60px)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
        }}
      >
        {t(
          "We don't have that page yet.",
          "Chúng tôi chưa có trang đó.",
          "Kami belum punya halaman itu."
        )}
      </h1>
      <p
        className="serif text-mute"
        style={{
          margin: "0 auto 24px",
          fontSize: 18,
          lineHeight: 1.45,
          maxWidth: 560,
        }}
      >
        {t(
          "Try the homepage, search, or one of the six pillars below.",
          "Thử trang chủ, tìm kiếm, hoặc một trong sáu chuyên mục bên dưới.",
          "Coba beranda, pencarian, atau salah satu enam pilar di bawah."
        )}
      </p>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        {PILLARS.map((p) => (
          <Link
            key={p.id}
            href={p.slug}
            className="pill"
            style={{
              cursor: "pointer",
              color: p.color,
              borderColor: "currentColor",
              textDecoration: "none",
            }}
          >
            {localizedPillarLabel(p.id, lang)}
          </Link>
        ))}
      </div>
    </div>
  );
}
