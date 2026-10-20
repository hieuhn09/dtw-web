"use client";

import { ExclusiveChip as ExclusiveChipPrimitive } from "@dtw/ui";
import { useT } from "@/lib/i18n";
import { shouldShowExclusiveChip } from "@/lib/exclusive";

/**
 * App-level "Exclusive" chip: applies the ONE shared eligibility rule
 * (`shouldShowExclusiveChip`), localises the label, and renders the ui
 * primitive. Every card/row surface uses this, so they cannot drift.
 */
export function ExclusiveChip({
  article,
  href,
  onExclusivePage,
  tone,
}: {
  article: { exclusive?: boolean | null };
  href?: string;
  onExclusivePage?: boolean;
  tone?: "default" | "onDark";
}) {
  const t = useT();
  if (!shouldShowExclusiveChip(article, { onExclusivePage })) return null;
  return <ExclusiveChipPrimitive label={t("Exclusive", "Độc quyền", "Eksklusif")} href={href} tone={tone} />;
}
