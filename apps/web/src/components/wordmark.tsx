/**
 * Brand lockup (rebrand 2026-09, ledger D1/D2/D8): a navy `OTW`
 * monogram block + lowercase "opentechwire" wordmark + a terracotta-dotted pulse
 * signature. Theme-adaptive via --brand-navy (cream in dark) and --brand-amber.
 * Mirrors apps/web/public/otw-logo-primary.svg. Shared by the header,
 * footer, and auth modal.
 */
export function Wordmark({ size = 32 }: { size?: number }) {
  return (
    <svg
      height={size * 1.7}
      viewBox="0 18 224 64"
      aria-label="opentechwire"
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
        OTW
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
        opentechwire
      </text>
      <g transform="translate(76, 67)">
        <circle cx="2" cy="0" r="2.5" fill="var(--brand-navy)" />
        <line x1="7" y1="0" x2="24" y2="0" stroke="var(--brand-navy)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="29" cy="0" r="2.5" fill="var(--brand-amber)" />
        <line x1="34" y1="0" x2="51" y2="0" stroke="var(--brand-navy)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="56" cy="0" r="2.5" fill="var(--brand-navy)" />
        <line x1="61" y1="0" x2="78" y2="0" stroke="var(--brand-navy)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="83" cy="0" r="2.5" fill="var(--brand-navy)" />
        <line x1="88" y1="0" x2="105" y2="0" stroke="var(--brand-navy)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="110" cy="0" r="2.5" fill="var(--brand-navy)" />
        <line x1="115" y1="0" x2="132" y2="0" stroke="var(--brand-navy)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="137" cy="0" r="2.5" fill="var(--brand-navy)" />
      </g>
    </svg>
  );
}
