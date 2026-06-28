"use client";

import { SectionHeader } from "./section-header";
import { PODCASTS } from "@/lib/data";
import { useT } from "@/lib/i18n";

export function PodcastStrip() {
  const t = useT();

  return (
    <section style={{ marginBottom: 48 }}>
      <SectionHeader
        title={t("Listen", "Nghe", "Dengar")}
        kicker={t("Podcasts & voice", "Podcast & giọng đọc", "Podcast & suara")}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: 20,
        }}
      >
        {PODCASTS.map((p) => (
          <div
            key={p.id}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--hair)",
              borderRadius: 8,
              padding: 18,
              display: "flex",
              gap: 14,
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                className="serif"
                style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.25 }}
              >
                {p.title}
              </div>
              <div className="text-mute" style={{ fontSize: 12, marginTop: 2 }}>
                {p.host} · <span className="mono">{p.len}</span> · {p.date}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
