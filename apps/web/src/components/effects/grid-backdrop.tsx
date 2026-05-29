import type { CSSProperties } from "react";

export interface GridBackdropProps {
  color?: string;
  size?: number;
  fadeRadius?: string | null;
}

/**
 * Faint grid backdrop used behind dark sections + dashboards.
 * Optional radial fade keeps the grid from competing with content edges.
 */
export function GridBackdrop({
  color = "rgba(255,255,255,.05)",
  size = 40,
  fadeRadius = null,
}: GridBackdropProps) {
  const style: CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
    backgroundSize: `${size}px ${size}px`,
  };
  if (fadeRadius) {
    const mask = `radial-gradient(circle at center, black, transparent ${fadeRadius})`;
    style.maskImage = mask;
    style.WebkitMaskImage = mask;
  }
  return <div aria-hidden="true" style={style} />;
}
