"use client";

import { useEffect, useRef, useState } from "react";

export interface CountUpProps {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  decimals?: number;
}

/**
 * Count-up animation with the triple-fallback pattern from the design.
 * IntersectionObserver → already-on-screen check → 800ms safety timeout.
 *
 * The resting value is the TARGET, not 0, so the real number is present in the
 * SSR HTML and whenever the animation never runs (crawlers, JS disabled,
 * reduced motion, observer never firing). Starting at 0 made the Funding
 * Tracker render "Deals: 0 · Avg. round $0M" directly under "$8.4B raised" —
 * a self-contradiction on a data card, which is the trust bug the audit flagged.
 * The count-up is a progressive enhancement on top of a correct value.
 */
export function CountUp({
  to,
  suffix = "",
  prefix = "",
  duration = 900,
  decimals = 0,
}: CountUpProps) {
  const [v, setV] = useState(to);
  const started = useRef(false);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    // Reduced motion: keep the static target, skip the animation entirely.
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const start = () => {
      if (started.current) return;
      started.current = true;
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setV(to * eased);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    let obs: IntersectionObserver | undefined;
    try {
      obs = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) start();
        },
        { threshold: 0.3 }
      );
      if (ref.current) obs.observe(ref.current);
    } catch {
      // ignore
    }

    requestAnimationFrame(() => {
      if (!ref.current || started.current) return;
      const r = ref.current.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) start();
    });

    const t = setTimeout(start, 800);
    return () => {
      obs?.disconnect();
      clearTimeout(t);
    };
  }, [to, duration]);

  // Locale pinned to en-US so SSR (Node default locale) and client (browser
  // locale) format identically — otherwise "1,000" vs "1.000" → hydration mismatch.
  const fmt = v.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return (
    <span ref={ref} className="tnum">
      {prefix}
      {fmt}
      {suffix}
    </span>
  );
}
