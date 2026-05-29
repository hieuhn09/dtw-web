import type { CSSProperties } from "react";

export interface PlaceholderProps {
  label?: string;
  height?: number | string;
  style?: CSSProperties;
  dark?: boolean;
}

const stripeLight = `repeating-linear-gradient(135deg, var(--surface-2) 0 14px, var(--paper) 14px 28px)`;
const stripeDark = `repeating-linear-gradient(135deg, #0b1220 0 14px, #0f172a 14px 28px)`;

/**
 * Diagonal stripe placeholder. Use for hero / cover slots during loading.
 * Renders a small label chip via the data-label attribute pattern.
 */
export function Placeholder({
  label,
  height = 240,
  style = {},
  dark = false,
}: PlaceholderProps) {
  return (
    <div
      data-label={label}
      style={{
        position: "relative",
        background: dark ? stripeDark : stripeLight,
        border: "1px solid var(--hair)",
        height,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-start",
        overflow: "hidden",
        ...style,
      }}
    >
      {label && (
        <span
          className="mono"
          style={{
            fontSize: 11,
            color: "var(--muted)",
            background: "var(--surface)",
            padding: "6px 8px",
            border: "1px solid var(--hair)",
            borderRadius: 4,
            margin: 8,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
