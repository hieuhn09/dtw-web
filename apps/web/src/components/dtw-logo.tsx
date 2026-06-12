// Inline, theme-adaptive DailyTechWire logo.
//
// Why inline JSX SVG instead of <img src="/dtw-logo-primary.svg">:
// the static SVG bakes in fixed colors, which would be invisible on the
// dark (#0F172A) header. By inlining, every part references the logo CSS
// variables defined in globals.css (--logo-block / --logo-text /
// --logo-pulse) so the lock-up flips between the primary (navy #1E3A8A on
// light) and inverted (#2563EB monogram, white pulse on dark) variants per
// DTW-Brand-Guideline-v1.0 §2.1–2.2. The amber pulse dot (#F59E0B) is
// brand-fixed at position 2 in both themes (guideline §6.2).
//
// viewBox is 380×100 (matches public/dtw-logo-primary.svg). Size via `height`;
// width scales to preserve aspect ratio.
//
// Typefaces are the dedicated logo faces loaded in app/layout.tsx
// (--font-logo-sans = Inter Bold, --font-logo-mono = JetBrains Mono), per
// guideline §2.1 / §11 — never the body Plex families. Fallback stacks match
// the static SVG assets.

const AMBER = "#F59E0B"; // accent-500 — fixed gold dot, position 2, both themes
const LOGO_SANS = "var(--font-logo-sans, Inter), 'Helvetica Neue', sans-serif";
const LOGO_MONO = "var(--font-logo-mono, 'JetBrains Mono'), 'SF Mono', Menlo, monospace";

type DtwLogoProps = {
  /** Rendered height in px. Width scales from the 380×100 viewBox. */
  height?: number;
  /** Marks the SVG decorative; pair with a visible/aria label on the parent. */
  "aria-hidden"?: boolean;
};

/**
 * Full horizontal lock-up: navy monogram block + "dailytechwire" wordmark
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
      {/* Monogram block — solid brand navy (inverted: primary-600), white initials */}
      <rect x="0" y="20" width="60" height="60" rx="8" fill="var(--logo-block)" />
      <text
        x="30"
        y="59"
        textAnchor="middle"
        fontFamily={LOGO_MONO}
        fontWeight={600}
        fontSize={22}
        letterSpacing="0.02em"
        fill="#fff"
      >
        DTW
      </text>

      {/* Wordmark — navy on light, neutral-100 on dark */}
      <text
        x="76"
        y="51"
        fontFamily={LOGO_SANS}
        fontWeight={700}
        fontSize={26}
        letterSpacing="-0.02em"
        fill="var(--logo-text)"
      >
        dailytechwire
      </text>

      {/* Pulse signature — 7 dots + 6 line segments alternating (guideline
          §6.2 mandatory anatomy), navy dots/lines (white on dark), amber dot
          fixed at position 2 (never move, never drop). */}
      <g transform="translate(76, 67)">
        <circle cx="2" cy="0" r="2.5" fill="var(--logo-pulse)" />
        <line x1="7" y1="0" x2="26" y2="0" stroke="var(--logo-pulse)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="31" cy="0" r="2.5" fill={AMBER} />
        <line x1="36" y1="0" x2="55" y2="0" stroke="var(--logo-pulse)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="60" cy="0" r="2.5" fill="var(--logo-pulse)" />
        <line x1="65" y1="0" x2="84" y2="0" stroke="var(--logo-pulse)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="89" cy="0" r="2.5" fill="var(--logo-pulse)" />
        <line x1="94" y1="0" x2="113" y2="0" stroke="var(--logo-pulse)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="118" cy="0" r="2.5" fill="var(--logo-pulse)" />
        <line x1="123" y1="0" x2="142" y2="0" stroke="var(--logo-pulse)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="147" cy="0" r="2.5" fill="var(--logo-pulse)" />
        <line x1="152" y1="0" x2="171" y2="0" stroke="var(--logo-pulse)" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="176" cy="0" r="2.5" fill="var(--logo-pulse)" />
      </g>
    </svg>
  );
}

/**
 * Compact mark: navy monogram + "dailytechwire" wordmark, no pulse line.
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
      <rect x="0" y="0" width="60" height="60" rx="8" fill="var(--logo-block)" />
      <text
        x="30"
        y="39"
        textAnchor="middle"
        fontFamily={LOGO_MONO}
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
        fontFamily={LOGO_SANS}
        fontWeight={700}
        fontSize={24}
        letterSpacing="-0.02em"
        fill="var(--logo-text)"
      >
        dailytechwire
      </text>
    </svg>
  );
}
