"use client";

// Static 30-day ASEAN tech index line. Pure integer arithmetic with /pad math —
// no Math.sin/cos so it's deterministic across SSR + hydration.
const DATA: ReadonlyArray<number> = [
  100, 102, 98, 103, 108, 105, 110, 108, 112, 115, 109, 114, 118, 116, 120, 118,
  122, 124, 121, 125, 127, 124, 128, 131, 129, 132, 135, 133, 138, 140,
];

const W = 720;
const H = 220;
const PAD = 12;

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function BigChart() {
  const min = Math.min(...DATA);
  const max = Math.max(...DATA);
  const span = max - min || 1;
  const pts = DATA.map<[number, number]>((v, i) => {
    const x = round2(PAD + (i / (DATA.length - 1)) * (W - PAD * 2));
    const y = round2(H - PAD - ((v - min) / span) * (H - PAD * 2));
    return [x, y];
  });
  const path = "M " + pts.map(([x, y]) => `${x},${y}`).join(" L ");
  const first = pts[0]!;
  const last = pts[pts.length - 1]!;
  const area = `${path} L ${last[0]},${H - PAD} L ${first[0]},${H - PAD} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="gFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--up)" stopOpacity=".25" />
          <stop offset="100%" stopColor="var(--up)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((p, i) => (
        <line
          key={i}
          x1={PAD}
          x2={W - PAD}
          y1={round2(PAD + p * (H - PAD * 2))}
          y2={round2(PAD + p * (H - PAD * 2))}
          stroke="var(--hair)"
          strokeWidth={1}
        />
      ))}
      <path d={area} fill="url(#gFill)" />
      <path d={path} fill="none" stroke="var(--up)" strokeWidth={2} />
      <circle
        cx={last[0]}
        cy={last[1]}
        r={4}
        fill="var(--up)"
        stroke="var(--surface)"
        strokeWidth={2}
      />
    </svg>
  );
}
