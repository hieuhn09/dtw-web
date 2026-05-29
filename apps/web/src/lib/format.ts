/**
 * Relative time formatter. Returns the design's compact suffix style:
 * `5s ago`, `12m ago`, `4h ago`, `2d ago`.
 *
 * NOTE: locale-aware variants land when full i18n date library is in place.
 * For now the suffix is English-only and the rest of the chrome is via useT.
 */
export function fmtTimeAgo(iso: string): string {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return Math.floor(diff) + "s ago";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}
