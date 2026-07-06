"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useSession } from "@/lib/auth-client";
import { getMyReadCount } from "@/lib/paywall-actions";
import { clearGuestMeter, readGuestMeter, recordGuestRead } from "@/lib/paywall";

export interface User {
  name: string;
  email: string;
  role: "Reader" | "Pro" | "Author" | "Editor" | "Admin";
}

export interface ShellContextValue {
  user: User | null;

  authOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;

  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;

  articlesRead: number;
  incrementRead: (id: string) => void;

  /** CMS-configurable free-read limit (invariant #4 — never hardcode). */
  paywallThreshold: number;
}

const ShellContext = createContext<ShellContextValue | null>(null);

/**
 * Maps a Better-Auth session user onto the shell's `User` shape. Role comes
 * from the lowercase `auth_users` enum (reader|pro|author|editor|admin) and
 * is capitalized for the existing UI — this is the ONE place that bridge
 * happens; every role comparison elsewhere should go through
 * `roleAtLeast()` in `@/lib/session` (server) using the lowercase value, not
 * this capitalized union.
 */
function toShellUser(
  u: { name?: string | null; email?: string | null; role?: string | null } | null | undefined
): User | null {
  if (!u || !u.email) return null;
  const r = String(u.role ?? "reader").toLowerCase();
  const role = (r.charAt(0).toUpperCase() + r.slice(1)) as User["role"];
  return { name: u.name || u.email.split("@")[0] || "Reader", email: u.email, role };
}

export interface ShellProviderProps {
  children: ReactNode;
  /** CMS-configurable free-read limit, fetched once in (reader)/layout.tsx's
   *  RSC via getPaywallThreshold() — never re-fetched client-side. */
  paywallThreshold: number;
}

export function ShellProvider({ children, paywallThreshold }: ShellProviderProps) {
  const { data: authData } = useSession();
  const user = toShellUser(
    authData?.user as
      | { name?: string | null; email?: string | null; role?: string | null }
      | undefined
  );
  const [authOpen, setAuthOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [articlesRead, setArticlesRead] = useState(0);
  // In-session dedupe for signed-in optimistic increments only — the DB
  // (reading_history) is the real source of truth and is re-synced on every
  // identity change below.
  const sessionReadIds = useRef<Set<string>>(new Set());

  const openAuth = useCallback(() => setAuthOpen(true), []);
  const closeAuth = useCallback(() => setAuthOpen(false), []);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  // Seed the meter whenever the auth identity changes (mount, sign-in,
  // sign-out). Guest: read the cookie-backed count (survives reload — the
  // bug this stage fixes). Signed-in: sign-in is the guest meter's success
  // state (clear it, D5) and seed from the DB-backed reading_history count.
  //
  // Keyed on `user?.email` (stable across renders), not the `user` object
  // itself — `toShellUser` returns a brand-new object literal on every
  // render, so depending on the object directly would re-run this effect
  // (and re-call the server action) on every render for a signed-in reader.
  // Same fix Stage B applied in article-content.tsx.
  useEffect(() => {
    if (user) {
      clearGuestMeter();
      sessionReadIds.current = new Set();
      getMyReadCount()
        .then(setArticlesRead)
        .catch(() => {
          // Fail open: this meter is a soft UX signal, never a hard gate.
        });
    } else {
      setArticlesRead(readGuestMeter().ids.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const incrementRead = useCallback(
    (id: string) => {
      if (user) {
        // Bump the in-memory counter immediately so THIS session's own new
        // read is reflected without waiting for a refetch; dedupe against
        // reads already counted this session only. A repeat read of an
        // article from earlier this month (before this session) may
        // under-count until the next full page load re-syncs from the DB —
        // acceptable for a soft, non-gating UI signal.
        if (sessionReadIds.current.has(id)) return;
        sessionReadIds.current.add(id);
        setArticlesRead((n) => n + 1);
        return;
      }
      setArticlesRead(recordGuestRead(id));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.email]
  );

  // ⌘K / Ctrl+K to open search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo<ShellContextValue>(
    () => ({
      user,
      authOpen,
      openAuth,
      closeAuth,
      searchOpen,
      openSearch,
      closeSearch,
      articlesRead,
      incrementRead,
      paywallThreshold,
    }),
    [
      user,
      authOpen,
      searchOpen,
      articlesRead,
      openAuth,
      closeAuth,
      openSearch,
      closeSearch,
      incrementRead,
      paywallThreshold,
    ]
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell(): ShellContextValue {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used within <ShellProvider>");
  return ctx;
}
