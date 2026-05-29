"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
}

/**
 * Reveal-on-scroll wrapper. Uses the design's quadruple-fallback pattern:
 *  1) Already-in-view check at mount → reveal immediately
 *  2) IntersectionObserver
 *  3) Scroll listener
 *  4) Hard 1.5s safety timer (never leave content hidden)
 *
 * The effect runs once at mount with a `cancelled` closure flag so the safety
 * timer can't be cleared by a re-render. This pattern is load-bearing — do not
 * refactor without re-reading process/context/uxui/all-uxui.md.
 */
export function Reveal({ children, delay = 0, y = 12 }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const show = () => {
      if (cancelled) return;
      cancelled = true;
      setVisible(true);
    };
    const checkInView = () => {
      if (!ref.current) return false;
      const r = ref.current.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    };

    if (checkInView()) {
      show();
      return;
    }

    let obs: IntersectionObserver | undefined;
    try {
      obs = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) show();
        },
        { threshold: 0.05 }
      );
      if (ref.current) obs.observe(ref.current);
    } catch {
      // ignore
    }

    const onScroll = () => {
      if (checkInView()) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const t = setTimeout(show, 1500);

    return () => {
      obs?.disconnect();
      window.removeEventListener("scroll", onScroll);
      clearTimeout(t);
      cancelled = true;
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : `translateY(${y}px)`,
        transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
