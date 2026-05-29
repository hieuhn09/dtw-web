"use client";

import { useEffect, useState } from "react";
import { CityChip } from "@/components/cover-art";
import { SectionHeader } from "./section-header";
import { useT } from "@/lib/i18n";

interface WireDropView {
  id: string;
  time: string;
  city: string;
  text: string;
}

export interface WireDropsProps {
  initial: ReadonlyArray<WireDropView>;
}

const SAMPLES: ReadonlyArray<{ city: string; text: string }> = [
  {
    city: "Hanoi",
    text:
      "SBV confirms UPI-VND corridor go-live at 09:00 local; first $50K test transfer cleared.",
  },
  {
    city: "Shenzhen",
    text:
      "BYD says LFP cell prices fall to $48/kWh – undercuts CATL's bulk quote.",
  },
  {
    city: "Bengaluru",
    text:
      "Zoho launches small-language-model API tier; pricing 80% under OpenAI equivalents.",
  },
  {
    city: "Tokyo",
    text:
      "Rakuten Mobile breaks even on operating basis for first time since 2020 launch.",
  },
  {
    city: "Manila",
    text: "BSP suspends two e-money licenses pending KYC audit.",
  },
];

export function WireDrops({ initial }: WireDropsProps) {
  const t = useT();
  const [drops, setDrops] = useState<ReadonlyArray<WireDropView>>(initial);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      const s = SAMPLES[i % SAMPLES.length]!;
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;
      const newDrop: WireDropView = {
        id: "sim" + Date.now(),
        time,
        city: s.city,
        text: s.text,
      };
      setDrops((prev) => [newDrop, ...prev].slice(0, 12));
      setFlash(newDrop.id);
      const t2 = setTimeout(() => setFlash(null), 2400);
      i++;
      return () => clearTimeout(t2);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section style={{ marginBottom: 48 }}>
      <SectionHeader
        title={t("Wire Drops", "Tin nhanh", "Kawat")}
        kicker={t("Realtime · WebSocket", "Realtime · WebSocket", "Realtime · WebSocket")}
        right={
          <span
            className="linkish text-mute"
            style={{ fontSize: 12, cursor: "pointer" }}
          >
            RSS · API
          </span>
        }
        liveDot
      />
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--hair)",
          borderRadius: 8,
          padding: "4px 0",
          maxHeight: 380,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {drops.map((d, i) => (
          <div
            key={d.id}
            style={{
              display: "grid",
              gridTemplateColumns: "68px 120px 1fr auto",
              gap: 18,
              alignItems: "baseline",
              padding: "12px 20px",
              borderBottom: i < drops.length - 1 ? "1px solid var(--hair)" : "none",
              background:
                flash === d.id
                  ? "color-mix(in oklab, var(--accent) 8%, transparent)"
                  : "transparent",
              transition: "background 1.5s ease",
            }}
          >
            <span
              className="mono"
              style={{ fontSize: 12, color: "var(--ink)", fontWeight: 500 }}
            >
              {d.time}
            </span>
            <CityChip city={d.city} />
            <span
              className="serif"
              style={{ fontSize: 14.5, lineHeight: 1.45, color: "var(--ink)" }}
            >
              {d.text}
            </span>
            <span
              className="text-mute-2 linkish"
              style={{ fontSize: 12, cursor: "pointer" }}
            >
              more →
            </span>
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: "linear-gradient(to bottom, transparent, var(--surface))",
            pointerEvents: "none",
          }}
        />
      </div>
    </section>
  );
}
