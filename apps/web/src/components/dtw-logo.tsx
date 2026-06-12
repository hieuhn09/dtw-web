// Inline, theme-adaptive DailyTechWire logo.
//
// Why inline JSX SVG instead of <img src="/dtw-logo-primary.svg">:
// the static SVG bakes in fixed text colors, which would be invisible on the
// dark (#0F172A) header. By inlining, the adaptive parts (wordmark, pulse line)
// reference CSS variables (var(--ink), var(--muted)) and flip with the theme,
// while the brand-fixed parts (coral monogram block, single accent dot) stay
// locked to the coral accent (#E04E1F, invariant #7).
//
// viewBox is 380×100 (matches public/dtw-logo-primary.svg). Size via `height`;
// width scales to preserve aspect ratio.

const ACCENT = "#E04E1F"; // brand coral, invariant #7 — fixed regardless of theme

type DtwLogoProps = {
  /** Rendered height in px. Width scales from the 380×100 viewBox. */
  height?: number;
  /** Marks the SVG decorative; pair with a visible/aria label on the parent. */
  "aria-hidden"?: boolean;
};

/**
 * Full horizontal lock-up: coral monogram block + "dailytechwire" wordmark
 * + pulse signature line. Used in the desktop header.
 */
export function DtwLogo({ height = 36, "aria-hidden": ariaHidden = true }: DtwLogoProps) {
  // Preserve the 380:100 aspect ratio.
  const width = (height * 380) / 100;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 380 100"
      role="img"
      aria-hidden={ariaHidden}
      focusable="false"
      style={{ display: "block" }}
    >
      {/* Monogram block — brand-fixed coral, white initials */}
      <rect x="0" y="20" width="60" height="60" rx="8" fill={ACCENT} />
      <text
        x="30"
        y="59"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontWeight={600}
        fontSize={22}
        letterSpacing="0.02em"
        fill="#fff"
      >
        DTW
      </text>

      {/* Wordmark — adapts to light/dark via var(--ink) */}
      <text
        x="76"
        y="51"
        fontFamily="var(--font-sans)"
        fontWeight={700}
        fontSize={26}
        letterSpacing="-0.02em"
        fill="var(--ink)"
      >
        dailytechwire
      </text>

      {/* Pulse signature — adaptive dots/dashes, single fixed-coral accent dot */}
      <g transform="translate(76, 67)">
        <circle cx="2" cy="0" r="2.5" fill="var(--muted)" />
        <line x1="7" y1="0" x2="26" y2="0" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="31" cy="0" r="2.5" fill={ACCENT} />
        <line x1="36" y1="0" x2="55" y2="0" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="60" cy="0" r="2.5" fill="var(--muted)" />
        <line x1="65" y1="0" x2="84" y2="0" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="89" cy="0" r="2.5" fill="var(--muted)" />
        <line x1="94" y1="0" x2="113" y2="0" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="118" cy="0" r="2.5" fill="var(--muted)" />
        <line x1="123" y1="0" x2="142" y2="0" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="147" cy="0" r="2.5" fill="var(--muted)" />
      </g>
    </svg>
  );
}

/**
 * Compact mark: coral monogram + "dailytechwire" wordmark, no pulse line.
 * Used in the mobile drawer header where vertical space is tight.
 */
export function DtwLogoCompact({ height = 28, "aria-hidden": ariaHidden = true }: DtwLogoProps) {
  // Trim the viewBox to just the monogram + wordmark band (no pulse line).
  // Original monogram occupies y=20..80; we crop to a 60-tall band and
  // re-baseline the wordmark for vertical centering.
  const width = (height * 300) / 60;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 300 60"
      role="img"
      aria-hidden={ariaHidden}
      focusable="false"
      style={{ display: "block" }}
    >
      <rect x="0" y="0" width="60" height="60" rx="8" fill={ACCENT} />
      <text
        x="30"
        y="39"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontWeight={600}
        fontSize={22}
        letterSpacing="0.02em"
        fill="#fff"
      >
        DTW
      </text>
      <text
        x="76"
        y="39"
        fontFamily="var(--font-sans)"
        fontWeight={700}
        fontSize={24}
        letterSpacing="-0.02em"
        fill="var(--ink)"
      >
        dailytechwire
      </text>
    </svg>
  );
}
