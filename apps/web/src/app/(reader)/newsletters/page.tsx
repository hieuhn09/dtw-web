"use client";

import { useState } from "react";
import { NEWSLETTERS, pillarOf } from "@/lib/data";
import { useT } from "@/lib/i18n";

export default function NewslettersPage() {
  const t = useT();
  const [picks, setPicks] = useState<Set<string>>(new Set(["am", "ai"]));

  const toggle = (id: string) => {
    const s = new Set(picks);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setPicks(s);
  };

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <header
        style={{
          borderBottom: "2px solid var(--hair-2)",
          paddingBottom: 20,
          marginBottom: 32,
        }}
      >
        <div className="kicker" style={{ marginBottom: 6 }}>
          {t(
            "Newsletters · 8 picks · all free",
            "Bản tin · 8 lựa chọn · miễn phí",
            "Newsletter · 8 pilihan · gratis"
          )}
        </div>
        <h1
          className="serif"
          style={{
            margin: "0 0 10px",
            fontSize: "clamp(30px, 8vw, 48px)",
            fontWeight: 650,
            letterSpacing: "-0.025em",
            lineHeight: 1,
          }}
        >
          {t(
            "Read Dailytechwire the way you read.",
            "Đọc Dailytechwire theo cách của bạn.",
            "Baca Dailytechwire sesuai keinginan."
          )}
        </h1>
        <p
          className="serif text-mute"
          style={{ margin: 0, fontSize: 18, lineHeight: 1.45, maxWidth: 760 }}
        >
          {t(
            "Daily briefs, weekly digests, one bi-weekly.",
            "Bản tin ngày, tổng hợp tuần, một bi-weekly.",
            "Brief harian, digest mingguan, satu dwi-mingguan."
          )}
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: 18,
          marginBottom: 32,
        }}
      >
        {NEWSLETTERS.map((n) => {
          const p = pillarOf(n.pillar);
          const checked = picks.has(n.id);
          return (
            <label
              key={n.id}
              style={{
                display: "flex",
                gap: 18,
                padding: 20,
                background: "var(--surface)",
                border: checked ? `2px solid ${p.color}` : "2px solid var(--hair)",
                borderRadius: 8,
                cursor: "pointer",
                transition: "border-color .15s",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: p.color,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-serif)",
                  fontSize: 18,
                  fontWeight: 650,
                  flexShrink: 0,
                }}
              >
                {n.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 4,
                  }}
                >
                  <div
                    className="serif"
                    style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.01em" }}
                  >
                    {n.name}
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(n.id)}
                    style={{
                      width: 20,
                      height: 20,
                      accentColor: p.color,
                      cursor: "pointer",
                    }}
                  />
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: p.color,
                    fontWeight: 600,
                    letterSpacing: ".05em",
                    marginBottom: 6,
                  }}
                >
                  {n.cadence}
                </div>
                <p
                  style={{
                    margin: "0",
                    fontSize: 13,
                    lineHeight: 1.45,
                    color: "var(--ink-2)",
                  }}
                >
                  {n.desc}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      <div
        style={{
          padding: "28px 32px",
          background: "var(--banner)",
          color: "#E8EDF7",
          borderRadius: 8,
          display: "flex",
          gap: 20,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="kicker" style={{ color: "var(--accent)", marginBottom: 4 }}>
            {picks.size}{" "}
            {t(
              `newsletter${picks.size === 1 ? "" : "s"} selected`,
              `bản tin được chọn`,
              `newsletter terpilih`
            )}
          </div>
          <div className="serif" style={{ fontSize: 18, fontWeight: 650, color: "#FFFFFF" }}>
            {t(
              "Newsletter subscriptions opening soon — check back shortly.",
              "Đăng ký bản tin sẽ sớm mở — hãy quay lại sau.",
              "Langganan newsletter akan segera dibuka — cek kembali sebentar lagi."
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
