import type { CSSProperties } from "react";

export type DisclosureKind = "sponsored" | "ai";
export type DisclosurePosition = "top" | "middle" | "bottom";

export interface DisclosureBoxProps {
  kind: DisclosureKind;
  sponsor?: string;
  position?: DisclosurePosition;
  /**
   * Title override. Defaults to "Paid Partner · {sponsor}" for sponsored
   * and "AI-assisted reporting" for AI.
   */
  title?: string;
  /** Body copy override. Defaults match the editorial firewall language. */
  body?: string;
}

const DEFAULT_SPONSORED_BODY =
  "This is a sponsored feature produced by DTW Studio for the partner above. The DTW newsroom was not involved in writing or editing.";

const DEFAULT_AI_BODY =
  "This article uses AI tools for translation or transcription. All facts were verified, and all writing was done by a human reporter.";

const containerBase: CSSProperties = {
  padding: "12px 14px",
  borderRadius: 6,
  display: "flex",
  gap: 12,
  alignItems: "flex-start",
  margin: "20px 0",
};

const iconBase: CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: 4,
  background: "var(--ink)",
  color: "var(--paper)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 11,
  fontWeight: 600,
  flexShrink: 0,
  fontFamily: "var(--font-mono)",
};

const titleStyle: CSSProperties = {
  textTransform: "uppercase",
  fontSize: 10,
  letterSpacing: ".14em",
  fontWeight: 600,
  marginBottom: 4,
  color: "var(--ink)",
};

const reminderTagStyle: CSSProperties = {
  fontWeight: 400,
  letterSpacing: ".06em",
  textTransform: "none",
  marginLeft: 6,
  color: "var(--muted)",
};

const bodyStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: 1.5,
  color: "var(--ink-2)",
};

/**
 * Disclosure box — sponsored or AI-assisted.
 *
 * INVARIANT (#5 in process/context/all-context.md): These boxes appear at
 * top + middle + bottom of an article and CANNOT be dismissed. Do not add
 * a close button to this component. Ever.
 *
 * Visual spec mirrors design/project/src/ui.jsx::DisclosureBox.
 */
export function DisclosureBox({
  kind,
  sponsor,
  position = "top",
  title,
  body,
}: DisclosureBoxProps) {
  const isAI = kind === "ai";

  const containerStyle: CSSProperties = {
    ...containerBase,
    background: isAI ? "var(--surface-2)" : "var(--sponsored)",
    border: `1px solid ${isAI ? "var(--hair-2)" : "var(--amber)"}`,
  };

  const iconLabel = isAI ? "AI" : "$";
  const resolvedTitle =
    title ?? (isAI ? "AI-assisted reporting" : `Paid Partner${sponsor ? ` · ${sponsor}` : ""}`);
  const resolvedBody = body ?? (isAI ? DEFAULT_AI_BODY : DEFAULT_SPONSORED_BODY);

  return (
    <div style={containerStyle}>
      <div style={iconBase}>{iconLabel}</div>
      <div style={{ flex: 1 }}>
        <div style={titleStyle}>
          {resolvedTitle}
          {position !== "top" && <span style={reminderTagStyle}>· reminder ({position})</span>}
        </div>
        <div style={bodyStyle}>{resolvedBody}</div>
      </div>
    </div>
  );
}
