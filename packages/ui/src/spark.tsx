import type { CSSProperties } from "react";

export interface SparkProps {
  values: ReadonlyArray<number>;
  color?: string;
  width?: number;
  height?: number;
}

/** Mini static sparkline SVG. Use AnimatedSpark (in apps/web/effects) for draw-in motion. */
export function Spark({
  values,
  color = "var(--up)",
  width = 60,
  height = 18,
}: SparkProps) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / span) * height;
      return `${x},${y}`;
    })
    .join(" ");
  const style: CSSProperties = { verticalAlign: "middle" };
  return (
    <svg width={width} height={height} style={style}>
      <polyline fill="none" stroke={color} strokeWidth={1.5} points={pts} />
    </svg>
  );
}
