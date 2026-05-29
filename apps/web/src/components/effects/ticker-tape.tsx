"use client";

interface TickerItem {
  sym: string;
  v: number;
  d: number;
}

const ITEMS: ReadonlyArray<TickerItem> = [
  { sym: "TSMC", v: 932.0, d: 1.55 },
  { sym: "9988.HK", v: 81.2, d: 2.41 },
  { sym: "005930.KS", v: 78900, d: -0.82 },
  { sym: "GOTO.JK", v: 73, d: 3.1 },
  { sym: "SE", v: 88.4, d: -2.05 },
  { sym: "GRAB", v: 4.18, d: 0.61 },
  { sym: "3690.HK", v: 114.6, d: -1.2 },
  { sym: "PYTM.NS", v: 412, d: 1.81 },
  { sym: "BTC/USD", v: 104250, d: 0.74 },
  { sym: "USD/SGD", v: 1.314, d: -0.12 },
  { sym: "USD/VND", v: 25380, d: 0.05 },
  { sym: "USD/IDR", v: 16240, d: 0.22 },
];

/** Bloomberg-style scrolling ticker tape. Pauses on hover. */
export function TickerTape() {
  const loop = [...ITEMS, ...ITEMS];
  return (
    <div
      style={{
        borderBottom: "1px solid var(--hair)",
        background: "var(--ink)",
        color: "var(--paper)",
        overflow: "hidden",
        height: 28,
        position: "relative",
      }}
    >
      <div
        className="ticker-track"
        style={{
          display: "flex",
          gap: 0,
          alignItems: "center",
          height: "100%",
          whiteSpace: "nowrap",
          animation: "ticker 60s linear infinite",
          willChange: "transform",
        }}
      >
        {loop.map((it, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "0 18px",
              borderRight: "1px solid color-mix(in oklab, var(--paper) 12%, transparent)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
            }}
          >
            <span style={{ fontWeight: 600, color: "var(--paper)" }}>{it.sym}</span>
            <span style={{ color: "color-mix(in oklab, var(--paper) 70%, transparent)" }}>
              {it.v.toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </span>
            <span
              style={{
                color: it.d >= 0 ? "var(--up)" : "var(--down)",
                fontWeight: 600,
              }}
            >
              {it.d >= 0 ? "▲" : "▼"} {Math.abs(it.d).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .ticker-track:hover{ animation-play-state:paused; }
      `}</style>
    </div>
  );
}
