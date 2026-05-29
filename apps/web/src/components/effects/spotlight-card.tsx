"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

export interface SpotlightCardProps {
  children: ReactNode;
  style?: CSSProperties;
  /** Spotlight color (CSS color or var(...)). Defaults to coral with .18 alpha. */
  color?: string;
}

/** Cursor-following ambient spotlight. */
export function SpotlightCard({
  children,
  style = {},
  color = "rgba(224,78,31,.18)",
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      el.style.setProperty("--mx", x + "px");
      el.style.setProperty("--my", y + "px");
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      className="spotlight"
      style={{
        position: "relative",
        overflow: "hidden",
        ...({ "--mx": "50%", "--my": "50%" } as CSSProperties),
        ...style,
      }}
    >
      <div
        className="spotlight-glow"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(360px circle at var(--mx) var(--my), ${color}, transparent 60%)`,
          opacity: 0,
          transition: "opacity .25s ease",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      <style>{`.spotlight:hover .spotlight-glow{ opacity:1; }`}</style>
    </div>
  );
}
