// Pillar registry. Matches the 6 Y1 pillars used by the design and the spec.
// Adding a pillar in production is a CMS write (invariant #8) — this list is
// the static fallback used during scaffold + tests + when CMS is unreachable.

export type PillarId = "ai" | "startups" | "latest" | "dev" | "products" | "policy";

export interface Pillar {
  id: PillarId;
  label: string;
  /** CSS variable name in --pillar style. The actual color is set in globals.css. */
  cssVar: string;
}

export const PILLARS: ReadonlyArray<Pillar> = [
  { id: "ai", label: "AI", cssVar: "--ai" },
  { id: "startups", label: "Startups", cssVar: "--startups" },
  { id: "latest", label: "Latest", cssVar: "--latest" },
  { id: "dev", label: "Dev", cssVar: "--dev" },
  { id: "products", label: "Products", cssVar: "--products" },
  { id: "policy", label: "Policy", cssVar: "--policy" },
];

export function pillarOf(id: string): Pillar {
  return PILLARS.find((p) => p.id === id) ?? PILLARS[0]!;
}
