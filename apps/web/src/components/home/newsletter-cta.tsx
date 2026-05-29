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
          background: "var(--ink)",
          color: "var(--paper)",
          borderRadius: 8,
          padding: "48px",
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
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
              "Six newsletters · pick what you read",
              "Sáu bản tin · chọn theo sở thích",
              "Enam newsletter · pilih yang Anda baca"
            )}
          </div>
          <h2
            className="serif"
            style={{
              margin: "0 0 10px",
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--paper)",
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
              color: "color-mix(in oklab, var(--paper) 70%, transparent)",
              maxWidth: 540,
            }}
          >
            {t(
              "AM Brief, PM Brief, AI Weekly, Asia Funding, Dev Digest, Products & Deals. Double opt-in. Unsubscribe with one click. We will never sell or share your email.",
              "AM Brief, PM Brief, AI Weekly, Asia Funding, Dev Digest, Products & Deals. Xác nhận kép. Hủy chỉ bằng một cú nhấp. Không bán hay chia sẻ email của bạn.",
              "AM Brief, PM Brief, AI Weekly, Asia Funding, Dev Digest, Products & Deals. Konfirmasi ganda. Berhenti dengan satu klik. Kami tak akan menjual atau membagikan email Anda."
            )}
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("Confirmation email sent (demo)");
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            position: "relative",
          }}
        >
          <input
            type="email"
            required
            placeholder="you@company.com"
            style={{
              padding: "14px 16px",
              border: "1px solid color-mix(in oklab, var(--paper) 20%, transparent)",
              borderRadius: 5,
              fontSize: 14,
              background: "color-mix(in oklab, var(--paper) 6%, transparent)",
              color: "var(--paper)",
              fontFamily: "var(--font-sans)",
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="accent" size="lg" type="submit" style={{ flex: 1 }}>
              {t(
                "Subscribe to AM Brief",
                "Đăng ký AM Brief",
                "Berlangganan AM Brief"
              )}
            </Button>
            <Button
              href="/newsletters"
              variant="ghost"
              size="lg"
              style={{
                color: "var(--paper)",
                border: "1px solid color-mix(in oklab, var(--paper) 20%, transparent)",
              }}
            >
              {t("Choose more", "Chọn thêm", "Pilih lainnya")}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
