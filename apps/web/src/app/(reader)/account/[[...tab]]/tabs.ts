/**
 * Server-safe tab definitions shared between the `/account` RSC (`page.tsx`)
 * and its client half (`account-tabs.tsx`). This module has NO "use client"
 * directive and no client-only imports — it exists specifically so the
 * server component can call `isAccountTab()` without importing a function
 * from a "use client" module (that's a hard runtime error in Next.js: "on
 * the client" functions can't be invoked from the server, only rendered as
 * JSX or passed as props).
 */

export type AccountTab = "saved" | "history" | "following" | "newsletters" | "settings";

export const ACCOUNT_TABS: ReadonlyArray<readonly [AccountTab, string]> = [
  ["saved", "Saved"],
  ["history", "Reading history"],
  ["following", "Following"],
  ["newsletters", "Newsletters"],
  ["settings", "Settings"],
];

export function isAccountTab(s: string): s is AccountTab {
  return ACCOUNT_TABS.some(([k]) => k === s);
}
