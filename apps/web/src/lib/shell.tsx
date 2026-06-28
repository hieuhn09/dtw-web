"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

export interface User {
  name: string;
  email: string;
  role: "Reader" | "Pro" | "Author" | "Editor" | "Admin";
}

export interface ShellContextValue {
  user: User | null;
  setUser: (u: User | null) => void;

  authOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;

  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

const ShellContext = createContext<ShellContextValue | null>(null);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const openAuth = useCallback(() => setAuthOpen(true), []);
  const closeAuth = useCallback(() => setAuthOpen(false), []);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

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
      setUser,
      authOpen,
      openAuth,
      closeAuth,
      searchOpen,
      openSearch,
      closeSearch,
    }),
    [user, authOpen, searchOpen, openAuth, closeAuth, openSearch, closeSearch]
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell(): ShellContextValue {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used within <ShellProvider>");
  return ctx;
}
