"use client";

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

/**
 * Wire Drops — short newsroom dispatches from the wireDrops collection.
 *
 * Renders ONLY real drops an editor posted in /admin (passed as `initial` from
 * the server). An earlier version injected fabricated headlines via setInterval
 * every 9s — removed: a newsroom must never display "news" no human wrote.
 * True realtime push (without a refresh) is a Phase F job (Soketi/Pusher); for
 * now drops refresh on page load / ISR, so the header makes no realtime claim.
 */
export function WireDrops({ initial }: WireDropsProps) {
  const t = useT();
  if (initial.length === 0) return null;

  return (
    <section style={{ marginBottom: 48 }}>
      <SectionHeader
        title={t("Wire Drops", "Tin nhanh", "Kawat")}
        kicker={t("Newsroom dispatches", "Bản tin nhanh tòa soạn", "Buletin redaksi")}
      />
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--hair)",
          borderRadius: 8,
          padding: "4px 0",
          overflow: "hidden",
        }}
      >
        {initial.map((d, i) => (
          <div
            key={d.id}
            style={{
              display: "grid",
              gridTemplateColumns: "68px 120px 1fr",
              gap: 18,
              alignItems: "baseline",
              padding: "12px 20px",
              borderBottom: i < initial.length - 1 ? "1px solid var(--hair)" : "none",
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
          </div>
        ))}
      </div>
    </section>
  );
}
