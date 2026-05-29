import type { CSSProperties } from "react";

export interface SkeletonProps {
  w?: number | string;
  h?: number | string;
  style?: CSSProperties;
}

/** Plain rounded block for async loading states. Spec says skeleton, not spinners. */
export function Skeleton({ w = "100%", h = 16, style = {} }: SkeletonProps) {
  return (
    <div
      style={{
        width: w,
        height: h,
        background: "var(--surface-2)",
        borderRadius: 4,
        ...style,
      }}
    />
  );
}
