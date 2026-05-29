export interface ArrowUpDownProps {
  /** Signed percentage change. `null` renders an em-dash. */
  chg: number | null;
}

/** Triangle marker + percentage with sign and tabular numbers. */
export function ArrowUpDown({ chg }: ArrowUpDownProps) {
  if (chg == null) {
    return (
      <span className="mono" style={{ color: "var(--muted-2)" }}>
        –
      </span>
    );
  }
  const up = chg >= 0;
  return (
    <span
      className="mono tnum"
      style={{
        color: up ? "var(--up)" : "var(--down)",
        fontWeight: 500,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      <span style={{ display: "inline-block", transform: up ? "rotate(0deg)" : "rotate(180deg)" }}>
        ▲
      </span>
      {up ? "+" : ""}
      {chg.toFixed(2)}%
    </span>
  );
}
