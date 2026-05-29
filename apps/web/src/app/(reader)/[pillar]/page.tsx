import { notFound } from "next/navigation";
import { PillarContent } from "@/components/pillar/pillar-content";
import { toArticleView } from "@/lib/article-view";
import { getArticlesByPillar, getPillars } from "@/lib/payload-server";
import { PILLARS, type PillarId } from "@/lib/data";

const PILLAR_HEADING: Record<PillarId, string> = {
  ai: "Artificial Intelligence",
  startups: "Startups & Capital",
  asia: "Asia",
  dev: "Developers",
  products: "Products & Reviews",
  policy: "Policy & Regulation",
};

const PILLAR_DESCRIPTION: Record<PillarId, string> = {
  ai: "Frontier models, infrastructure, and the policy that shapes them. Reported across Seoul, Singapore, Bengaluru, and Hangzhou.",
  startups:
    "Term sheets, IPOs, layoffs, and the operators building the next wave across ASEAN, India, and Greater China.",
  asia: "Our flagship beat. Geopolitics, capital flows, and product launches across the most consequential tech region of the decade.",
  dev: "Engineering practice. Tools, frameworks, and the trade-offs teams are actually making in production.",
  products:
    "Independent reviews of phones, laptops, audio, and wearables. Affiliate-disclosed. Manufacturers do not approve our copy.",
  policy:
    "Trade rules, export controls, central-bank decisions, and the regulators who write them – covered as the technology beat they have become.",
};

function isPillarId(s: string): s is PillarId {
  return PILLARS.some((p) => p.id === s);
}

export const revalidate = 60;

export default async function PillarPage({
  params,
}: {
  params: Promise<{ pillar: string }>;
}) {
  const { pillar: pillarParam } = await params;
  if (!isPillarId(pillarParam)) notFound();
  const pillarId = pillarParam;

  const [articlesRaw, pillarsRaw] = await Promise.all([
    getArticlesByPillar(pillarId, 80),
    getPillars(),
  ]);

  const pillarDoc = pillarsRaw.find((p) => p.slug === pillarId);
  const pillarColor = pillarDoc?.color ?? "var(--asia)";
  const articles = articlesRaw.map(toArticleView);

  return (
    <PillarContent
      pillarId={pillarId}
      pillarColor={pillarColor}
      pillarHeading={PILLAR_HEADING[pillarId]}
      pillarDescription={PILLAR_DESCRIPTION[pillarId]}
      articles={articles}
      totalCount={articles.length}
    />
  );
}
