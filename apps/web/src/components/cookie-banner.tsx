"use client";

import { useEffect, useState } from "react";
import { Button } from "@dtw/ui";
import { Icon } from "@/components/icons";
import { useT } from "@/lib/i18n";

const STORAGE_KEY = "dtw-cookies";

export function CookieBanner() {
  const t = useT();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      // ignore
    }
    const id = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(id);
  }, []);

  const dismiss = () => {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  };

  if (!open) return null;

  return (
    /* Banner is PINNED to a fixed dark surface (#0F172A) in both themes —
       using var(--ink) flipped it light in dark mode, stranding the blue
       accents below 3:1 (Brand Guideline §4.4). Inner colors are therefore
       fixed against-dark values (#E2E8F0 text, blue-400 icon at 6.0:1). */
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: 20,
        right: 20,
        zIndex: 50,
        maxWidth: 920,
        margin: "0 auto",
        background: "#0F172A",
        color: "#E2E8F0",
        padding: "14px 18px 14px 22px",
        borderRadius: 10,
        boxShadow: "0 18px 48px -16px rgba(15,23,42,.5)",
        border: "1px solid color-mix(in oklab, #E2E8F0 8%, transparent)",
        display: "flex",
        alignItems: "center",
        gap: 20,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          paddingRight: 16,
          borderRight: "1px solid color-mix(in oklab, #E2E8F0 14%, transparent)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            background: "rgba(96,165,250,.16)",
            color: "#60A5FA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="info" size={16} color="#60A5FA" stroke={2.2} />
        </div>
        <div
          className="upper"
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: ".14em",
            color: "#E2E8F0",
            whiteSpace: "nowrap",
            textTransform: "uppercase",
          }}
        >
          {t("Cookies", "Cookies", "Cookies")}
        </div>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: 13,
          lineHeight: 1.5,
          color: "color-mix(in oklab, #E2E8F0 85%, transparent)",
          flex: 1,
          minWidth: 240,
        }}
      >
        {t(
          "We use cookies to remember your login and improve the site. No ads, no tracking, no data sale.",
          "Chúng tôi dùng cookies để giữ bạn đăng nhập và cải thiện trang. Không quảng cáo, không theo dõi, không bán dữ liệu.",
          "Kami menggunakan cookies untuk mengingat login Anda dan meningkatkan situs. Tanpa iklan, tanpa pelacak, tanpa jual data."
        )}
      </p>

      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button
          onClick={dismiss}
          style={{
            background: "transparent",
            border: "1px solid color-mix(in oklab, #E2E8F0 28%, transparent)",
            color: "#E2E8F0",
            padding: "8px 14px",
            borderRadius: 5,
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {t("Decline", "Từ chối", "Tolak")}
        </button>
        <Button
          variant="accent"
          size="md"
          onClick={dismiss}
          style={{ padding: "8px 18px", whiteSpace: "nowrap" }}
        >
          {t("Accept", "Đồng ý", "Setuju")}
        </Button>
      </div>
    </div>
  );
}
