import { NextResponse } from "next/server";
import { getRecentArticles } from "@/lib/cms-client";
import { CMS_URL } from "@/lib/central-api";

/**
 * CMS probe. `GET /api/health/cms` answers one question that nothing else can:
 * can the CODE CURRENTLY RUNNING actually read from the Central CMS?
 *
 * It began life as the cutover probe, reporting whether the deployed bundle had
 * resolved `CMS_SOURCE` to central or to this repo's embedded Payload. That
 * question died with local Payload on 04-09-2026 — Central is the only source
 * now — but the probe outlived the flag: it exercises the real read path and
 * reports what came back, so "the site renders empty" gets a one-request answer
 * (bad token? wrong host? Central down?).
 *
 * Why not a view-counter probe: Opentechwire counts views in its OWN database, so a
 * view write proves nothing about the read path — and the one Central write helper
 * swallows every error, so a rejection is indistinguishable from success. The
 * cutover is a READ-path change, so the probe is a read.
 *
 * It also surfaces the media-URL trap that cost the WTB cutover a round: Central
 * returns RELATIVE media paths, which the browser would resolve against
 * opentechwire.com and quietly 404. `mediaHost` below must be the Central
 * host — if it echoes this site's own domain, the absolutize step at the fetch
 * boundary is not running.
 *
 * Deliberately exposes no secrets: the read token is never echoed, and CMS_URL is
 * reduced to its host.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function hostOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

export async function GET(): Promise<Response> {
  const started = Date.now();

  let probe: Record<string, unknown>;
  try {
    // Goes through the SAME router every page uses — that is the point.
    const [article] = await getRecentArticles(1);
    const hero = article?.heroImage;
    const heroUrl = hero && typeof hero === "object" ? (hero as { url?: string }).url : undefined;

    probe = article
      ? {
          ok: true,
          articleId: article.id,
          slug: article.slug,
          publishedAt: article.publishedAt ?? null,
          // Absolute + Central host after the flip; this site's host or a bare
          // relative path means absolutizeMediaUrls is not doing its job.
          mediaHost: hostOf(heroUrl) ?? (heroUrl ? "RELATIVE — not absolutized" : null),
        }
      : { ok: false, reason: "no articles returned" };
  } catch (err) {
    probe = { ok: false, reason: (err as Error)?.message ?? "unknown error" };
  }

  return NextResponse.json(
    {
      // A literal since 04-09-2026: there is no other source any more. Kept in
      // the response so anything scripted against this probe still parses.
      cmsSource: "central",
      centralHost: hostOf(CMS_URL),
      // Was `true` until 04-09-2026, when Central grew `aiLeaderboardRows` with
      // the full `aiModels` column set plus the methodology copy on the tenant.
      // The AI Leaderboard now reads Central like every other surface.
      dashboardsStayLocal: false,
      hasReadToken: Boolean(process.env.CMS_READ_TOKEN),
      hasRevalidateSecret: Boolean(process.env.REVALIDATE_SECRET),
      probe,
      ms: Date.now() - started,
    },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
