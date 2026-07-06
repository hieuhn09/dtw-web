"use client";

import { useEffect, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { Button } from "@dtw/ui";
import { GridBackdrop } from "@/components/effects";
import { useT } from "@/lib/i18n";
import { useShell } from "@/lib/shell";
import { isSubscribed, setNewsletter, subscribeGuest } from "@/lib/account-actions";

/**
 * Flagship newsletter for the homepage CTA — mirrors brief-asia-web's
 * `subscribe-button.tsx` FLAGSHIP constant. Real wiring (Stage D): signed-in
 * readers get a toggle (`setNewsletter`), guests get immediate capture
 * (`subscribeGuest`). Replaces the previous `alert("...demo")` handler.
 */
const FLAGSHIP = "am";

export function NewsletterCta() {
  const t = useT();
  const { user } = useShell();
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");
  const [guestSubscribed, setGuestSubscribed] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!user) {
      setSubscribed(false);
      return;
    }
    let cancelled = false;
    isSubscribed(FLAGSHIP).then((v) => {
      if (!cancelled) setSubscribed(v);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const toggle = () => {
    const next = !subscribed;
    setSubscribed(next);
    startTransition(() => void setNewsletter(FLAGSHIP, next));
  };

  const submitGuest = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const { ok } = await subscribeGuest(email, [FLAGSHIP]);
      if (ok) setGuestSubscribed(true);
    });
  };

  return (
    <section style={{ marginBottom: 32 }}>
      <div
        style={{
          background: "var(--banner)",
          color: "#FFFFFF",
          borderRadius: 8,
          padding: "48px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
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
              fontWeight: 650,
              letterSpacing: "-0.02em",
              color: "#FFFFFF",
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
              color: "rgba(232,237,247,0.70)",
              maxWidth: 540,
            }}
          >
            {t(
              "AM Brief, PM Brief, AI Weekly, Asia Funding, Dev Digest, Products & Deals. Unsubscribe with one click. We will never sell or share your email.",
              "AM Brief, PM Brief, AI Weekly, Asia Funding, Dev Digest, Products & Deals. Hủy chỉ bằng một cú nhấp. Không bán hay chia sẻ email của bạn.",
              "AM Brief, PM Brief, AI Weekly, Asia Funding, Dev Digest, Products & Deals. Berhenti dengan satu klik. Kami tak akan menjual atau membagikan email Anda."
            )}
          </p>
        </div>

        {user ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                variant={subscribed ? "outline" : "accent"}
                size="lg"
                onClick={toggle}
                disabled={pending}
                style={
                  subscribed
                    ? { flex: 1, color: "#FFFFFF", border: "1px solid rgba(232,237,247,0.20)" }
                    : { flex: 1 }
                }
              >
                {subscribed
                  ? t("Subscribed to AM Brief", "Đã đăng ký AM Brief", "Berlangganan AM Brief")
                  : t("Subscribe to AM Brief", "Đăng ký AM Brief", "Berlangganan AM Brief")}
              </Button>
              <Button
                href="/newsletters"
                variant="ghost"
                size="lg"
                style={{ color: "#FFFFFF", border: "1px solid rgba(232,237,247,0.20)" }}
              >
                {t("Choose more", "Chọn thêm", "Pilih lainnya")}
              </Button>
            </div>
          </div>
        ) : guestSubscribed ? (
          <div
            style={{
              position: "relative",
              fontSize: 14,
              lineHeight: 1.5,
              color: "#FFFFFF",
              padding: "14px 16px",
              borderRadius: 5,
              background: "rgba(232,237,247,0.10)",
              border: "1px solid rgba(232,237,247,0.20)",
            }}
          >
            {t(
              "You're subscribed. Look out for the next AM Brief.",
              "Bạn đã đăng ký. Hãy chú ý AM Brief tiếp theo.",
              "Anda sudah berlangganan. Nantikan AM Brief berikutnya."
            )}
          </div>
        ) : (
          <form
            onSubmit={submitGuest}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              style={{
                padding: "14px 16px",
                border: "1px solid rgba(232,237,247,0.20)",
                borderRadius: 5,
                fontSize: 14,
                background: "rgba(232,237,247,0.06)",
                color: "#FFFFFF",
                fontFamily: "var(--font-sans)",
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="accent" size="lg" type="submit" disabled={pending} style={{ flex: 1 }}>
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
                  color: "#FFFFFF",
                  border: "1px solid rgba(232,237,247,0.20)",
                }}
              >
                {t("Choose more", "Chọn thêm", "Pilih lainnya")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
