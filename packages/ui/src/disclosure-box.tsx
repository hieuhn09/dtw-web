import type { CSSProperties } from "react";

export type DisclosureNoteKind = "sponsored" | "affiliate";

export interface DisclosureNoteProps {
  kind: DisclosureNoteKind;
  /** Label line, already localized (e.g. "Paid Partner · NVIDIA", "Affiliate links"). */
  label: string;
  /** Body paragraph, already localized. */
  body: string;
}

const baseStyle: CSSProperties = {
  display: "block",
  margin: "22px 0",
  fontFamily: "var(--font-sans)",
};

const sponsoredStyle: CSSProperties = {
  ...baseStyle,
  borderLeft: "2px solid var(--accent)",
  background: "var(--sponsored)",
  padding: "10px 14px",
  borderRadius: "0 4px 4px 0",
};

const affiliateStyle: CSSProperties = {
  ...baseStyle,
  borderLeft: "2px solid var(--hair-2)",
  background: "transparent",
  padding: "6px 0 6px 14px",
  borderRadius: 0,
};

const labelBase: CSSProperties = {
  fontFamily: "var(--font-mono)",
  textTransform: "uppercase",
  fontSize: 10,
  letterSpacing: ".1em",
  fontWeight: 600,
  marginBottom: 4,
};

const bodyStyle: CSSProperties = {
  margin: 0,
  fontSize: 13,
  lineHeight: 1.55,
  color: "var(--muted)",
};

/**
 * End-of-article disclosure note — sponsored or affiliate.
 *
 * INVARIANT (#5 in process/context/all-context.md, owner decision 05-11-26):
 * the sponsored disclosure appears EXACTLY ONCE, as this note after the
 * article body (background `var(--sponsored)`), plus a plain-text
 * "Paid Partner" kicker in the header. It CANNOT be dismissed — do not add a
 * close button to this component. Ever.
 *
 * The label mixes accent with ink so it stays ≥4.5:1 on `--sponsored` in
 * light and dark mode. Tokens only; no hardcoded colors. Copy is i18n-free
 * here — callers pass translated `label` and `body`.
 */
export function DisclosureNote({ kind, label, body }: DisclosureNoteProps) {
  const isSponsored = kind === "sponsored";
  return (
    <aside
      data-disclosure={kind}
      style={isSponsored ? sponsoredStyle : affiliateStyle}
    >
      <div
        style={{
          ...labelBase,
          color: isSponsored
            ? "color-mix(in oklab, var(--accent) 65%, var(--ink))"
            : "var(--muted)",
        }}
      >
        {label}
      </div>
      <p style={bodyStyle}>{body}</p>
    </aside>
  );
}
