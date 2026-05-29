"use client";

import { Button } from "@dtw/ui";
import { useT } from "@/lib/i18n";

const briefs = [
  {
    tag: "AM · 07:00",
    title:
      "MAS clears DBS for digital-asset custody. ERNIE-X is live in three VN banks.",
    txt:
      "Plus: VNG's listing math, TSMC's allocation reshuffle, and a UPI-Vietnam timeline.",
  },
  {
    tag: "PM · 18:00 (yesterday)",
    title: "What we got wrong about Tokopedia–Grab – one year in.",
    txt:
      "The synergy thesis is finally producing real numbers. Some of them are layoffs.",
  },
];

export function BriefBand() {
  const t = useT();

  return (
    <section style={{ margin: "0 0 40px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr 1fr 150px",
          background: "var(--surface)",
          border: "1px solid var(--hair)",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "22px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div className="kicker" style={{ color: "var(--ink)" }}>
            {t("The Brief", "Bản tin", "Brief")}
          </div>
          <div className="mono text-mute" style={{ fontSize: 11, marginTop: 6, lineHeight: 1.4 }}>
            {t(
              "Twice daily · 07:00 / 18:00 SGT",
              "Hai lần mỗi ngày · 07:00 / 18:00 SGT",
              "Dua kali sehari · 07:00 / 18:00 WIB"
            )}
          </div>
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "22%",
              bottom: "22%",
              width: 1,
              background: "var(--hair)",
            }}
          />
        </div>

        {briefs.map((b, i) => (
          <div
            key={i}
            style={{
              padding: "22px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minWidth: 0,
            }}
          >
            <div
              className="mono"
              style={{
                fontSize: 10,
                color: "var(--accent)",
                fontWeight: 600,
                letterSpacing: ".1em",
                marginBottom: 6,
              }}
            >
              {b.tag}
            </div>
            <div
              className="serif"
              style={{
                fontSize: 14.5,
                fontWeight: 600,
                lineHeight: 1.35,
                marginBottom: 6,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {b.title}
            </div>
            <div
              className="text-mute"
              style={{
                fontSize: 12,
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {b.txt}
            </div>
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "22%",
                bottom: "22%",
                width: 1,
                background: "var(--hair)",
              }}
            />
          </div>
        ))}

        <div
          style={{
            padding: "22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button href="/briefing" variant="outline" size="md">
            {t("Read →", "Đọc →", "Baca →")}
          </Button>
        </div>
      </div>
    </section>
  );
}
