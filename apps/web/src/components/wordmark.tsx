/**
 * Brand lockup (design refresh 2026-06-14, invariant #11 amended): a navy `DTW`
 * monogram block + lowercase "dailytechwire" wordmark + a terracotta-dotted pulse
 * signature. Theme-adaptive via --brand-navy (cream in dark) and --brand-amber.
 * Mirrors design/project/uploads/dtw-logo-primary.svg. Shared by the header,
 * footer, and auth modal.
 */
export function Wordmark({ size = 32 }: { size?: number }) {
  return (
    <svg
      height={size * 1.7}
      viewBox="0 18 234 64"
      aria-label="dailytechwire"
      role="img"
      style={{ display: "block", overflow: "visible" }}
    >
      <rect x="0" y="20" width="60" height="60" rx="8" fill="var(--brand-navy)" />
      <text
        x="30"
        y="59"
        textAnchor="middle"
        fontFamily="'IBM Plex Mono', 'SF Mono', Menlo, monospace"
        fontWeight="600"
        fontSize="22"
        letterSpacing="0.02em"
        fill="var(--paper)"
      >
        DTW
      </text>
      <text
        x="76"
        y="51"
        fontFamily="'IBM Plex Sans', 'Helvetica Neue', sans-serif"
        fontWeight="700"
        fontSize="26"
        letterSpacing="-0.02em"
        fill="var(--brand-navy)"
      >
        dailytechwire
      </text>
      <g transform="translate(76, 67)">
        <circle cx="2" cy="0" r="2.5" fill="var(--brand-navy)" />
        <line x1="7" y1="0" x2="26" y2="0" stroke="var(--brand-navy)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="31" cy="0" r="2.5" fill="var(--brand-amber)" />
        <line x1="36" y1="0" x2="55" y2="0" stroke="var(--brand-navy)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="60" cy="0" r="2.5" fill="var(--brand-navy)" />
        <line x1="65" y1="0" x2="84" y2="0" stroke="var(--brand-navy)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="89" cy="0" r="2.5" fill="var(--brand-navy)" />
        <line x1="94" y1="0" x2="113" y2="0" stroke="var(--brand-navy)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="118" cy="0" r="2.5" fill="var(--brand-navy)" />
        <line x1="123" y1="0" x2="142" y2="0" stroke="var(--brand-navy)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="147" cy="0" r="2.5" fill="var(--brand-navy)" />
      </g>
    </svg>
  );
}
