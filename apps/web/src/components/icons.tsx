import type { SVGProps } from "react";

export type IconName =
  | "search"
  | "moon"
  | "sun"
  | "bookmark"
  | "share"
  | "play"
  | "pause"
  | "user"
  | "menu"
  | "close"
  | "arrow-r"
  | "external"
  | "rss"
  | "globe"
  | "lock"
  | "download"
  | "trend-up"
  | "trend-dn"
  | "check"
  | "info"
  | "dollar"
  | "star"
  | "headphone"
  | "mail"
  | "feather"
  | "spark"
  | "data"
  | "code"
  | "asia"
  | "policy"
  | "product"
  | "wire"
  | "clock";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name" | "stroke" | "color"> {
  name: IconName | string;
  size?: number;
  color?: string;
  stroke?: number;
}

/**
 * Stroke icon set ported from design/project/src/icons.jsx.
 * All icons share viewBox 0 0 24 24, currentColor stroke by default.
 */
export function Icon({
  name,
  size = 18,
  color = "currentColor",
  stroke = 1.75,
  ...rest
}: IconProps) {
  // Icons are decorative by default (paired with a text label, or inside an
  // already-labelled button). Hide them from AT unless the caller gives the
  // icon its own accessible name.
  const labelled =
    "aria-label" in rest || "aria-labelledby" in rest || rest.role === "img";
  const common: SVGProps<SVGSVGElement> = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": labelled ? undefined : true,
    ...rest,
  };

  switch (name) {
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      );
    case "moon":
      return (
        <svg {...common}>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      );
    case "sun":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      );
    case "bookmark":
      return (
        <svg {...common}>
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "share":
      return (
        <svg {...common}>
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      );
    case "play":
      return (
        <svg {...common} fill={color} stroke="none">
          <polygon points="6 4 20 12 6 20 6 4" />
        </svg>
      );
    case "pause":
      return (
        <svg {...common} fill={color} stroke="none">
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "menu":
      return (
        <svg {...common}>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    case "arrow-r":
      return (
        <svg {...common}>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      );
    case "external":
      return (
        <svg {...common}>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      );
    case "rss":
      return (
        <svg {...common}>
          <path d="M4 11a9 9 0 0 1 9 9" />
          <path d="M4 4a16 16 0 0 1 16 16" />
          <circle cx="5" cy="19" r="1.5" fill={color} />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <path d="M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18" />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      );
    case "download":
      return (
        <svg {...common}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      );
    case "trend-up":
      return (
        <svg {...common}>
          <polyline points="3 17 9 11 13 15 21 7" />
          <polyline points="14 7 21 7 21 14" />
        </svg>
      );
    case "trend-dn":
      return (
        <svg {...common}>
          <polyline points="3 7 9 13 13 9 21 17" />
          <polyline points="14 17 21 17 21 10" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case "info":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="11" x2="12" y2="16" />
          <circle cx="12" cy="8" r="0.5" fill={color} />
        </svg>
      );
    case "dollar":
      return (
        <svg {...common}>
          <line x1="12" y1="2" x2="12" y2="22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9 12 2" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 14" />
        </svg>
      );
    case "headphone":
      return (
        <svg {...common}>
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1v-7h3z" />
          <path d="M3 19a2 2 0 0 0 2 2h1v-7H3z" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <polyline points="3 7 12 13 21 7" />
        </svg>
      );
    case "feather":
      return (
        <svg {...common}>
          <path d="M21 8a4 4 0 0 0-4-4H9L3 17v4h4l14-14z" />
          <line x1="16" y1="8" x2="2" y2="22" />
          <line x1="17" y1="13" x2="9" y2="13" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
        </svg>
      );
    case "data":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <line x1="15" y1="3" x2="15" y2="21" />
          <line x1="3" y1="9" x2="21" y2="9" />
        </svg>
      );
    case "code":
      return (
        <svg {...common}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case "asia":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12a18 18 0 0 1 9-3 18 18 0 0 1 9 3" />
          <path d="M3 12a18 18 0 0 0 9 3 18 18 0 0 0 9-3" />
        </svg>
      );
    case "policy":
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-12V5l-8-3-8 3v5c0 8 8 12 8 12z" />
        </svg>
      );
    case "product":
      return (
        <svg {...common}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
    case "wire":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2" fill={color} />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}
