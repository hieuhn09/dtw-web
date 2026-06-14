"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { useT } from "@/lib/i18n";

export function AudioPlayerBar() {
  const [playing, setPlaying] = useState(false);
  const t = useT();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 16px",
        background: "var(--surface)",
        border: "1px solid var(--hair)",
        borderRadius: 6,
        margin: "24px auto",
        maxWidth: 680,
      }}
    >
      <button
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? "Pause" : "Play"}
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          border: "none",
          background: "var(--ink)",
          color: "var(--paper)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={playing ? "pause" : "play"} size={13} color="var(--paper)" />
      </button>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 4,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Icon name="headphone" size={13} />{" "}
          {t("Listen to this article", "Nghe bài này", "Dengarkan artikel ini")}
        </div>
        <div
          style={{
            height: 3,
            background: "var(--hair)",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: playing ? "24%" : "0%",
              height: "100%",
              background: "var(--accent)",
              transition: "width .5s",
            }}
          />
        </div>
      </div>
      <div className="mono text-mute" style={{ fontSize: 11 }}>
        14:22 · AI voice
      </div>
      <a className="mono text-mute-2" style={{ fontSize: 11, cursor: "pointer" }}>
        ↓ MP3
      </a>
    </div>
  );
}
