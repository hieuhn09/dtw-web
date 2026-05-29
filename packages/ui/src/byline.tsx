import type { CSSProperties } from "react";

export interface BylineLabels {
  /** "By" / "Bởi" / "Oleh" — passed in by caller for locale flexibility. */
  by: string;
  /** "and" / "và" / "dan" — between co-authors. */
  and: string;
  /** "min read" / "phút đọc" / "menit baca" — read-time suffix. */
  minRead: string;
}

export interface BylineProps {
  authorName: string;
  coAuthorNames?: ReadonlyArray<string>;
  /** Pre-formatted date string in the caller's locale. */
  dateLabel: string;
  readMinutes: number;
  size?: "sm" | "lg";
  labels: BylineLabels;
}

const containerStyle: CSSProperties = {
  color: "var(--muted)",
};

const separatorStyle: CSSProperties = {
  margin: "0 8px",
  color: "var(--hair-2)",
};

/**
 * Format: "By {author} [and {coAuthors}] · {date} · {minutes} min read"
 * Visual spec mirrors design/project/src/ui.jsx::ByLine.
 *
 * Author name uses var(--muted) so dark mode adapts — this is load-bearing
 * (see process/context/uxui/all-uxui.md → dark-mode discipline).
 */
export function Byline({
  authorName,
  coAuthorNames = [],
  dateLabel,
  readMinutes,
  size = "sm",
  labels,
}: BylineProps) {
  const fontSize = size === "lg" ? 13 : 12;
  return (
    <div style={{ ...containerStyle, fontSize }}>
      {labels.by} <span style={{ fontWeight: 400, color: "var(--muted)" }}>{authorName}</span>
      {coAuthorNames.length > 0 && (
        <>
          {" "}
          {labels.and} {coAuthorNames.join(" & ")}
        </>
      )}
      <span style={separatorStyle}>·</span>
      <span style={{ fontFamily: "var(--font-mono)" }}>{dateLabel}</span>
      <span style={separatorStyle}>·</span>
      <span>
        {readMinutes} {labels.minRead}
      </span>
    </div>
  );
}
