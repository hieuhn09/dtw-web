import { getFeedArticles } from "@/lib/payload-server";
import { atomResponse, buildAtomFeed } from "@/lib/feed";
import { siteOrigin } from "@/lib/metadata";

// Aggregators poll on their own schedule; a 5-minute window matches the spec's
// "route + sitemap + RSS regenerate ≤ 5 min" line. Note: the E3c hook's
// revalidateTag only busts the inner getFeedArticles data cache — Next's
// default cache handler never tag-checks cached route-handler (APP_ROUTE)
// responses, so the serialized XML refreshes on this window, not on publish.
// Keep this ≤ 300s or feeds go stale past the spec line.
export const revalidate = 300;

export async function GET() {
  const articles = await getFeedArticles();
  const xml = buildAtomFeed(
    {
      title: "DailyTechWire",
      subtitle: "Tech Intelligence, Wired Daily.",
      origin: siteOrigin(),
      sitePath: "/",
      feedPath: "/rss.xml",
    },
    articles
  );
  return atomResponse(xml);
}
