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

  articlesRead: number;
  incrementRead: (id: string) => void;
}

const ShellContext = createContext<ShellContextValue | null>(null);

export function ShellProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [articlesRead, setArticlesRead] = useState(0);
  const readIds = useRef<Set<string>>(new Set());

  const openAuth = useCallback(() => setAuthOpen(true), []);
  const closeAuth = useCallback(() => setAuthOpen(false), []);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const incrementRead = useCallback((id: string) => {
    if (readIds.current.has(id)) return;
    readIds.current.add(id);
    setArticlesRead((n) => n + 1);
  }, []);

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
      articlesRead,
      incrementRead,
    }),
    [user, authOpen, searchOpen, articlesRead, openAuth, closeAuth, openSearch, closeSearch, incrementRead]
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell(): ShellContextValue {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used within <ShellProvider>");
  return ctx;
}
