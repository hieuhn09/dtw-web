import type {
  AnchorHTMLAttributes,
  CSSProperties,
  MouseEventHandler,
  ReactNode,
} from "react";

export type ButtonVariant = "primary" | "accent" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
  /** When provided, renders as `<a href>` instead of `<button>`. */
  href?: string;
  /** Anchor target. Only honored when `href` is set. */
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  rel?: AnchorHTMLAttributes<HTMLAnchorElement>["rel"];
  /** Button-only. */
  type?: "button" | "submit" | "reset";
  /** Button-only. */
  disabled?: boolean;
  /** Triggered for both anchor + button variants. */
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  "aria-label"?: string;
  title?: string;
}

const baseStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  fontFamily: "var(--font-sans)",
  fontWeight: 500,
  border: "1px solid transparent",
  cursor: "pointer",
  textDecoration: "none",
  transition:
    "background .15s, color .15s, border-color .15s, box-shadow .25s ease, transform .15s ease",
};

const sizes: Record<ButtonSize, CSSProperties> = {
  sm: { fontSize: 12, padding: "6px 10px", borderRadius: 4 },
  md: { fontSize: 13, padding: "9px 14px", borderRadius: 5 },
  lg: { fontSize: 14, padding: "12px 18px", borderRadius: 6 },
};

const variants: Record<ButtonVariant, CSSProperties> = {
  primary: { background: "var(--brand-navy)", color: "var(--paper)", borderColor: "var(--brand-navy)" },
  accent: { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" },
  outline: { background: "transparent", color: "var(--ink)", borderColor: "var(--hair-2)" },
  ghost: { background: "transparent", color: "var(--ink)" },
};

/**
 * Visual spec mirrors design/project/src/ui.jsx::Button.
 *
 * Renders as `<button>` by default. Pass `href` to render as `<a>` instead —
 * use this whenever you'd otherwise wrap the button in a Link, to avoid
 * invalid `<a><button>` nesting.
 *
 * The accent variant carries data-glow so global CSS can paint the hover halo.
 */
export function Button({
  variant = "primary",
  size = "md",
  children,
  style,
  className,
  href,
  target,
  rel,
  type = "button",
  disabled,
  onClick,
  ...aria
}: ButtonProps) {
  const composedStyle = { ...baseStyle, ...sizes[size], ...variants[variant], ...style };
  const dataGlow = variant === "accent" ? "1" : "0";

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        onClick={onClick as MouseEventHandler<HTMLAnchorElement>}
        data-glow={dataGlow}
        style={composedStyle}
        className={className}
        {...aria}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick as MouseEventHandler<HTMLButtonElement>}
      data-glow={dataGlow}
      style={composedStyle}
      className={className}
      {...aria}
    >
      {children}
    </button>
  );
}
