import type { ReactNode } from "react";

// Kept in sync with LegalSlug in page.tsx (which is "use client" and so
// cannot export route segment config itself — that's why the static story
// for this segment lives in this pass-through layout).
const SLUGS = ["privacy", "terms", "cookies", "gdpr"] as const;

// The slug list is finite and code-defined, so all four policy pages
// prerender at build. Without generateStaticParams somewhere in the segment,
// Next 15 renders these fully dynamically per request (no-store headers) —
// wasteful for pages whose trilingual copy is hardcoded client-side.
export function generateStaticParams(): Array<{ slug: string }> {
  return SLUGS.map((slug) => ({ slug }));
}

export default function LegalLayout({ children }: { children: ReactNode }) {
  return children;
}
