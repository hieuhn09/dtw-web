import { NextResponse } from "next/server";
import { getPillars } from "@/lib/payload-server";
import { siteOrigin } from "@/lib/metadata";

// Pillar taxonomy changes far less often than articles publish; still
// regenerates without a deploy per invariant #8's spirit (Architecture
// Decision 5).
export const revalidate = 3600;

// Deviation from the plan's literal `getNavPillars()` citation (flagged in
// the EXECUTE report): `NavPillar` (lib/data.ts) does not carry the
// `description` field this route needs to surface "when set" per RFC-009's
// spec. `getPillars()` shares the exact same `pillars:all` cache tag and
// 300s revalidate window and returns the full CMS document (title,
// description included), so this substitutes one already-existing cached
// helper for another with no new query, no schema change, and no change to
// invalidation semantics.
export async function GET() {
  const origin = siteOrigin();
  const pillars = await getPillars();

  const sections = pillars
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((pillar) => {
      const label = pillar.title?.en ?? pillar.slug;
      const url = `${origin}/${pillar.slug}`;
      const description = pillar.description ? ` — ${pillar.description}` : "";
      return `- ${label}: ${url}${description}`;
    })
    .join("\n");

  const body = `# DailyTechWire

DailyTechWire is a digital-native technology publication with an Asia-tech focus — regional funding and tech-stock coverage, AI benchmarks and rankings, and deep-dive editorial. Published by Asia Press Centre Group (APCG), an independent newsroom based in Singapore, founded 2023.

## Sections

${sections}

## Feeds

- All stories (Atom): ${origin}/rss.xml
- Per section (Atom): ${origin}/{section-slug}/rss.xml

## About

- About: ${origin}/about
- Editorial Standards: ${origin}/trust/editorial
`;

  return new NextResponse(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
