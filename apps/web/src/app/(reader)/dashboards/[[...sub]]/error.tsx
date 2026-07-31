"use client";

import { useEffect } from "react";
import { useT } from "@/lib/i18n";

/**
 * `/dashboards` route-segment error boundary (Next.js `error.tsx`
 * convention — this is the first one in the app). Catches render/data-fetch
 * failures thrown by `page.tsx` or anything it renders (e.g. a helper in
 * `lib/payload-server.ts` throwing past its own try/catch fallback).
 */
export default function DashboardsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 80, textAlign: "center" }}>
      <div className="kicker" style={{ marginBottom: 8 }}>
        {t("Data Desk · Preview", "Ban Dữ liệu · Bản xem trước", "Meja Data · Pratinjau")}
      </div>
      <h1
        className="serif"
        style={{ margin: "0 0 14px", fontSize: "clamp(28px, 8vw, 40px)", fontWeight: 650, letterSpacing: "-0.02em" }}
      >
        {t(
          "The AI Leaderboard couldn't load.",
          "Không thể tải Bảng xếp hạng AI.",
          "Papan Peringkat AI tidak dapat dimuat."
        )}
      </h1>
      <p className="serif text-mute" style={{ margin: "0 auto 24px", fontSize: 16, lineHeight: 1.45, maxWidth: 480 }}>
        {t(
          "Something went wrong fetching the latest data. Please try again.",
          "Đã xảy ra lỗi khi tải dữ liệu mới nhất. Vui lòng thử lại.",
          "Terjadi kesalahan saat memuat data terbaru. Silakan coba lagi."
        )}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="pill"
        style={{
          cursor: "pointer",
          borderColor: "currentColor",
          background: "none",
          fontFamily: "var(--font-sans)",
          fontSize: 14,
        }}
      >
        {t("Try again", "Thử lại", "Coba lagi")}
      </button>
    </div>
  );
}
