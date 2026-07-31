import type { Metadata } from "next";
import { AILeaderboard } from "@/components/dashboards/ai-leaderboard";
import { toArticleView, type ArticleView } from "@/lib/article-view";
import {
  getAiModels,
  getDashboardMethodology,
  getDashboardSponsorSlot,
} from "@/lib/payload-server";

export const revalidate = 60;

// Without this, a page under a dynamic (catch-all) segment is fully dynamic
// in Next 15 and the `revalidate` above is silently ignored — same reasoning
// as `(reader)/[pillar]/page.tsx`. Empty is enough: the page builds on first
// request and caches for the 60s window; the `dashboards:ai` /
// `dashboards:methodology` / `sponsor-slots:all` afterChange hooks still bust
// by tag instantly on an editor save or the ai-weekly cron.
export function generateStaticParams(): Array<{ sub?: string[] }> {
  return [];
}

// Fixed, English-only metadata (matches the root layout's English-only
// metadata convention — see buildMetadata's other callers) — there's only
// one page state now, no per-tab branching needed.
export function generateMetadata(): Metadata {
  return {
    title: "AI Leaderboard | Dashboards | Dailytechwire",
    description:
      "Weekly-refreshed AI model leaderboard — general, reasoning, coding, math, search, and vision scores plus pricing, sourced from LLM Stats.",
  };
}

/**
 * Sub-path validation (`sub` empty vs `["ai"]` vs anything else) happens in
 * this segment's `layout.tsx`, not here — see that file's header comment for
 * why. By the time this page component runs, `sub` is guaranteed
 * empty/undefined.
 */
export default async function DashboardsPage() {
  const [aiModels, methodology, sponsorSlot] = await Promise.all([
    getAiModels(),
    getDashboardMethodology(),
    getDashboardSponsorSlot("dashboard_ai"),
  ]);

  const sponsorArticle =
    sponsorSlot && typeof sponsorSlot.article === "object" && sponsorSlot.article
      ? sponsorSlot.article
      : null;
  const sponsor: ArticleView | null = sponsorArticle ? toArticleView(sponsorArticle) : null;

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <AILeaderboard
        rows={aiModels.rows}
        asOfScores={aiModels.asOfScores}
        methodology={methodology.aiMethodology}
        sponsor={sponsor}
      />
    </div>
  );
}
