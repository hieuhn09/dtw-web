"use client";

import { Button } from "@dtw/ui";
import { useT } from "@/lib/i18n";

export interface PaywallProps {
  onLogin: () => void;
  /** CMS-configurable free-read limit (invariant #4 — never hardcode). */
  threshold: number;
}

/**
 * Soft sign-in nudge card shown after a guest's free-read limit trips.
 * Never a hard gate — the article body above this card always renders in
 * full. No billing surface exists in Phase 1; Pro/Stripe is out of scope for
 * this program (see process/features/account/active/reader-auth-account-simple_PLAN_03-07-26.md).
 */
export function Paywall({ onLogin, threshold }: PaywallProps) {
  const t = useT();

  return (
    <div
      style={{
        position: "relative",
        maxWidth: 680,
        margin: "0 auto",
        padding: "40px 36px 48px",
        background: "var(--surface)",
        border: "1px solid var(--hair)",
        borderRadius: 8,
        textAlign: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -80,
          left: 0,
          right: 0,
          height: 80,
          background: "linear-gradient(to bottom, transparent, var(--paper))",
          pointerEvents: "none",
        }}
      />
      <div className="kicker" style={{ marginBottom: 10 }}>
        {t("Free limit reached", "Đã hết lượt đọc miễn phí", "Batas gratis tercapai")}
      </div>
      <h3
        className="serif"
        style={{
          margin: "0 0 10px",
          fontSize: 30,
          fontWeight: 650,
          letterSpacing: "-0.02em",
        }}
      >
        {t(
          "Keep reading the reporting that matters in tech, across Asia and the world",
          "Tiếp tục đọc những tin tức công nghệ quan trọng, từ châu Á đến toàn cầu",
          "Terus baca laporan teknologi penting, dari Asia hingga dunia"
        )}
      </h3>
      <p
        className="text-mute"
        style={{
          margin: "0 auto 24px",
          fontSize: 14,
          lineHeight: 1.55,
          maxWidth: 480,
        }}
      >
        {t(
          `You've read your ${threshold} free articles this month. Sign in to keep reading — it's free.`,
          `Bạn đã đọc hết ${threshold} bài miễn phí trong tháng này. Đăng nhập để tiếp tục đọc — hoàn toàn miễn phí.`,
          `Anda telah membaca ${threshold} artikel gratis bulan ini. Masuk untuk terus membaca — gratis.`
        )}
      </p>
      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Button variant="primary" size="lg" onClick={onLogin}>
          {t("Sign in — it's free →", "Đăng nhập — miễn phí →", "Masuk — gratis →")}
        </Button>
      </div>
      <div className="mono text-mute-2" style={{ fontSize: 11 }}>
        {t(
          "Free meter resets on the 1st of each month",
          "Bộ đếm miễn phí sẽ làm mới vào ngày 1 hàng tháng",
          "Meteran gratis akan direset pada tanggal 1 setiap bulan"
        )}
      </div>
    </div>
  );
}
