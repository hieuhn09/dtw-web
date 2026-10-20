import type { CSSProperties } from "react";

export interface ExclusiveChipProps {
  /** Display label. Pass the localised label from your i18n layer. */
  label: string;
  /** When provided, renders as `<a href>` (standalone positions only). */
  href?: string;
  className?: string;
  /** `onDark` for navy surfaces (e.g. the Most Read band): white text, accent border. */
  tone?: "default" | "onDark";
}

/**
 * "Exclusive" chip — outlined, uppercase, letter-spaced like `PillarTag`.
 * Colours come from the `.exclusive-chip` classes in the app's globals.css
 * (existing `--accent` / `--accent-ink` tokens), never inline hex.
 *
 * Renders as `<span>` by default so it nests safely inside card links; pass
 * `href` for the article-page chip, which links to the label's definition.
 */
export function ExclusiveChip({ label, href, className, tone = "default" }: ExclusiveChipProps) {
  const classes = ["exclusive-chip", tone === "onDark" ? "exclusive-chip--on-dark" : null, className]
    .filter(Boolean)
    .join(" ");
  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "1px 6px",
    background: "transparent",
    borderRadius: 0,
    fontSize: 10,
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: ".12em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    textDecoration: "none",
  };
  if (href) {
    return (
      <a href={href} className={classes} style={style} aria-label={label}>
        {label}
      </a>
    );
  }
  return (
    <span className={classes} style={style}>
      {label}
    </span>
  );
}
