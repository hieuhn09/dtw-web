"use client";

import type { CSSProperties } from "react";
import type { ArticleView } from "@/lib/article-view";
import { useT } from "@/lib/i18n";

/**
 * Small "Paid Partner · {sponsor}" kicker for article cards and list rows
 * (invariant #5, owner decision 05-11-26). Plain text in `var(--muted)`, no
 * chip, no hardcoded colors. Renders nothing for non-sponsored articles.
 */
export function SponsoredKicker({
  article,
  style,
}: {
  article: Pick<ArticleView, "sponsored" | "sponsor">;
  style?: CSSProperties;
}) {
  const t = useT();
  if (!article.sponsored) return null;
  const label = t("Paid Partner", "Đối tác trả phí", "Mitra Berbayar");
  return (
    <div
      className="mono"
      style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: ".1em",
        textTransform: "uppercase",
        color: "var(--muted)",
        ...style,
      }}
    >
      {label}
      {article.sponsor ? ` · ${article.sponsor}` : ""}
    </div>
  );
}
