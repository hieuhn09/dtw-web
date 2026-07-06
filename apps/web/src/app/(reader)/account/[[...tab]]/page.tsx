import {
  getSessionUser,
  listBookmarks,
  listFollows,
  listHistory,
  listNewsletterSubs,
} from "@/lib/session";
import { getArticlesByIds, getNavPillars, getNewsletters } from "@/lib/payload-server";
import { toArticleView, type ArticleView } from "@/lib/article-view";
import { AccountShell, AccountSignInPrompt } from "./account-tabs";
import { isAccountTab, type AccountTab } from "./tabs";

/**
 * Real, server-verified `/account` — converted from a client component gated
 * on a fake in-memory user (Phase pre-Stage-B) to a `force-dynamic` RSC gated
 * on a real Better-Auth session. This is the one place per-user reads happen
 * server-side — it opts out of caching entirely, so it never risks leaking
 * one reader's saved/history/follows state into another visitor's view (see
 * the article page's `revalidate=60` RSC, which must never do this).
 */
export const dynamic = "force-dynamic";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ tab?: string[] }>;
}) {
  const { tab: tabSeg } = await params;
  const tabParam = tabSeg?.[0];
  const active: AccountTab = tabParam && isAccountTab(tabParam) ? tabParam : "saved";

  const user = await getSessionUser();
  if (!user) {
    // Inline prompt, no redirect — guest visiting /account still gets HTTP 200.
    return <AccountSignInPrompt />;
  }

  const [bookmarkRows, historyRows, followRows, navPillars, newsletters, newsletterSubRows] =
    await Promise.all([
      listBookmarks(user.id),
      listHistory(user.id),
      listFollows(user.id),
      getNavPillars(),
      getNewsletters(),
      listNewsletterSubs(user.id),
    ]);

  const ids = Array.from(
    new Set([...bookmarkRows, ...historyRows].map((r) => r.articleId))
  );
  const articles = await getArticlesByIds(ids);
  const articlesById = new Map(articles.map((a) => [String(a.id), toArticleView(a)]));

  // Preserve each list's own DB order (savedAt desc / readAt desc); silently
  // drop any id that hydrated to nothing (e.g. the article was unpublished
  // after being saved/read — the underlying row stays, only the join drops).
  const saved = bookmarkRows
    .map((r) => articlesById.get(r.articleId))
    .filter((a): a is ArticleView => Boolean(a));
  const history = historyRows
    .map((r) => articlesById.get(r.articleId))
    .filter((a): a is ArticleView => Boolean(a));
  const followedSlugs = followRows.map((r) => r.pillarId);
  const subscribedNewsletterIds = newsletterSubRows.map((r) => r.newsletterId);

  return (
    <AccountShell
      user={user}
      active={active}
      saved={saved}
      history={history}
      navPillars={navPillars}
      followedSlugs={followedSlugs}
      newsletters={newsletters}
      subscribedNewsletterIds={subscribedNewsletterIds}
    />
  );
}
