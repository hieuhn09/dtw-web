import type { ReactNode } from "react";

export interface SectionHeaderProps {
  title: string;
  kicker?: ReactNode;
  right?: ReactNode;
  liveDot?: boolean;
}

/**
 * Section header used across homepage bands. 28px serif title + optional kicker
 * with optional live indicator + optional right slot. 2px ink rule beneath.
 */
export function SectionHeader({ title, kicker, right, liveDot }: SectionHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 18,
        paddingBottom: 10,
        borderBottom: "2px solid var(--brand-navy)",
      }}
    >
      <div>
        {kicker && (
          <div
            className="kicker"
            style={{
              marginBottom: 4,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {liveDot && <span className="live-dot" />}
            {kicker}
          </div>
        )}
        <h2
          className="serif"
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 650,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h2>
      </div>
      {right}
    </div>
  );
}
