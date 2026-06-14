"use client";

import { useEffect, useRef, useState } from "react";

export interface AnimatedSparkProps {
  values: ReadonlyArray<number>;
  color?: string;
  width?: number;
  height?: number;
}

/** Draw-in animated sparkline with gradient area fill and pulsing endpoint. */
export function AnimatedSpark({
  values,
  color = "var(--up)",
  width = 420,
  height = 56,
}: AnimatedSparkProps) {
  const ref = useRef<SVGPathElement | null>(null);
  const [len, setLen] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const total = ref.current.getTotalLength?.() ?? 0;
    setLen(total);
  }, [values]);

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const pts = values.map<[number, number]>((v, i) => {
    const x = round2((i / (values.length - 1)) * width);
    const y = round2(height - ((v - min) / span) * height);
    return [x, y];
  });
  const path = "M " + pts.map(([x, y]) => `${x},${y}`).join(" L ");
  const last = pts[pts.length - 1]!;
  const first = pts[0]!;
  const area = path + ` L ${last[0]},${height} L ${first[0]},${height} Z`;

  return (
    <svg
      width="100%"
      height={height + 8}
      viewBox={`0 0 ${width} ${height + 8}`}
      preserveAspectRatio="none"
      style={{ display: "block", width: "100%" }}
    >
      <defs>
        <linearGradient id="spk" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spk)" style={{ opacity: 0.6 }} />
      <path
        ref={ref}
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        style={{
          strokeDasharray: len,
          strokeDashoffset: len,
          animation: "dashDraw 1.4s ease forwards",
        }}
      />
      <circle
        cx={last[0]}
        cy={last[1]}
        r={4}
        fill={color}
        style={{ animation: "pulseR 1.6s ease infinite" }}
      />
      <style>{`
        @keyframes dashDraw { to { stroke-dashoffset: 0; } }
        @keyframes pulseR { 0%,100%{opacity:1; r:4} 50%{opacity:.5; r:6} }
      `}</style>
    </svg>
  );
}
