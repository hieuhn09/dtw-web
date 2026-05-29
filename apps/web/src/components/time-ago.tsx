"use client";

import { useEffect, useState } from "react";
import { fmtTimeAgo } from "@/lib/format";

export interface TimeAgoProps {
  iso: string;
  /** Rendered before mount; defaults to an empty space so layout doesn't shift. */
  fallback?: string;
}

/**
 * Relative time ("5m ago", "2h ago") rendered on the client only.
 *
 * `fmtTimeAgo` uses `Date.now()` which is non-deterministic, so calling it
 * directly during render causes a hydration mismatch between server and client.
 * This component renders the fallback on the server, then computes the real
 * value in a useEffect after hydration.
 */
export function TimeAgo({ iso, fallback = " " }: TimeAgoProps) {
  const [label, setLabel] = useState<string>(fallback);

  useEffect(() => {
    setLabel(fmtTimeAgo(iso));
    // Refresh once a minute so the label stays current
    const id = setInterval(() => setLabel(fmtTimeAgo(iso)), 60_000);
    return () => clearInterval(id);
  }, [iso]);

  return <span suppressHydrationWarning>{label}</span>;
}
