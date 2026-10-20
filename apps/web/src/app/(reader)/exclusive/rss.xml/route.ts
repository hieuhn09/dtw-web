import { getExclusiveFeedArticles } from "@/lib/cms-client";
import { exclusiveFeedChannel } from "@/lib/exclusive";
import { atomResponse, buildAtomFeed } from "@/lib/feed";
import { siteOrigin } from "@/lib/metadata";

// Atom feed of flagged Exclusive stories, newest 50. A static segment, so it
// wins over `/[pillar]/rss.xml`. An empty list is still a valid feed.
export const revalidate = 300;

export async function GET() {
  const articles = await getExclusiveFeedArticles();
  return atomResponse(buildAtomFeed(exclusiveFeedChannel(siteOrigin()), articles));
}
