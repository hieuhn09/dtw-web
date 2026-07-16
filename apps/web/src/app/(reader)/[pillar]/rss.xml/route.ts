import { getFeedArticles, getPillars } from "@/lib/payload-server";
import { atomResponse, buildAtomFeed } from "@/lib/feed";
import { siteOrigin } from "@/lib/metadata";

// Per-pillar Atom feed (spec: "Sinh RSS theo pillar"). Same CMS-driven
// validation as the pillar page: a pillar created in /admin gets a feed with
// no deploy (invariant #8); an unknown slug is a plain 404, not an empty feed
// that aggregators would happily keep polling.
export const revalidate = 300;

// Without this, a GET handler under a dynamic segment is fully dynamic in
// Next 15 and the `revalidate` above is silently ignored — every aggregator
// poll would be a full render with uncacheable (no-store) headers. Empty is
// enough: dynamicParams stays on, so paths build on first request and a
// pillar created in /admin gets its feed within the 300s window.
export function generateStaticParams(): Array<{ pillar: string }> {
  return [];
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ pillar: string }> }
) {
  const { pillar: slug } = await params;
  const pillars = await getPillars();
  const pillarDoc = pillars.find((p) => p.slug === slug);
  if (!pillarDoc) return new Response("Not Found", { status: 404 });

  // "latest" is the cross-beat firehose (same convention as getArticlesPage):
  // no pillar filter — identical content to /rss.xml under its own URL.
  const articles = await getFeedArticles(slug === "latest" ? null : pillarDoc.id);
  const heading = pillarDoc.heading || pillarDoc.title?.en || pillarDoc.slug;

  const xml = buildAtomFeed(
    {
      title: `DailyTechWire — ${heading}`,
      subtitle: pillarDoc.description ?? "Tech Intelligence, Wired Daily.",
      origin: siteOrigin(),
      sitePath: `/${pillarDoc.slug}`,
      feedPath: `/${pillarDoc.slug}/rss.xml`,
    },
    articles
  );
  return atomResponse(xml);
}
