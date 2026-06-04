"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { SectionHeader } from "./section-header";
import { PODCASTS } from "@/lib/data";
import { useT } from "@/lib/i18n";

export function PodcastStrip() {
  const t = useT();
  const [playing, setPlaying] = useState<string | null>(null);

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
            <button
              onClick={() => setPlaying(playing === p.id ? null : p.id)}
              aria-label={playing === p.id ? "Pause" : "Play"}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                border: "none",
                background: "var(--ink)",
                color: "var(--paper)",
                cursor: "pointer",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                name={playing === p.id ? "pause" : "play"}
                size={16}
                color="var(--paper)"
              />
            </button>
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
              {playing === p.id && (
                <div
                  style={{
                    marginTop: 8,
                    height: 3,
                    background: "var(--hair)",
                    borderRadius: 99,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: "34%",
                      height: "100%",
                      background: "var(--accent)",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
