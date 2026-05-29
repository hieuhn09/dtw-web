import type { CSSProperties, MouseEventHandler } from "react";

export interface PillarTagProps {
  /** Pillar id (`ai` | `startups` | `asia` | `dev` | `products` | `policy`).
   * Used to build the CSS var name `var(--${id})`. */
  id: string;
  /** Display label. Pass the localised label from your i18n layer. */
  label: string;
  size?: "sm" | "md";
  onClick?: MouseEventHandler<HTMLElement>;
  /** When provided, renders as `<a href>` instead of `<span>`. */
  href?: string;
}

/**
 * Pillar chip — uppercase letter-spaced label with a 6×6 colored square.
 * Visual spec mirrors design/project/src/ui.jsx::PillarTag.
 *
 * Renders as `<span>` by default so it can be safely nested inside outer `<a>`
 * card links. Pass `href` to make it an anchor in standalone positions.
 */
export function PillarTag({ id, label, size = "sm", onClick, href }: PillarTagProps) {
  const fontSize = size === "sm" ? 10 : 11;
  const color = `var(--${id})`;
  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize,
    fontWeight: 600,
    letterSpacing: ".12em",
    color,
    cursor: onClick || href ? "pointer" : "default",
    textTransform: "uppercase",
  };
  const squareStyle: CSSProperties = {
    width: 6,
    height: 6,
    background: color,
    display: "inline-block",
  };

  const inner = (
    <>
      <span style={squareStyle} />
      {label}
    </>
  );

  if (href) {
    return (
      <a href={href} onClick={onClick} style={style}>
        {inner}
      </a>
    );
  }
  return (
    <span onClick={onClick} style={style}>
      {inner}
    </span>
  );
}
