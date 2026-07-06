"use client";
import { createAuthClient } from "better-auth/react";

/**
 * Browser auth client. Same-origin by default → talks to /api/auth/*.
 * Use `signIn.email` / `signUp.email` / `signIn.social({provider:'google'})`,
 * `requestPasswordReset`, `resetPassword`, `signOut`, and the `useSession` hook.
 */
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession, resetPassword } = authClient;

/**
 * Centralizes callback/redirect URL construction so a future /en /id /vi
 * subpath migration is a one-line change here, not a grep-and-replace across
 * auth-modal.tsx. dtw has no locale subpaths yet, so this returns a plain
 * path today — never hardcode a locale segment like brief-asia does.
 */
export function authCallbackUrl(path?: string): string {
  if (path) return path;
  if (typeof window !== "undefined") {
    return window.location.pathname + window.location.search;
  }
  return "/";
}
