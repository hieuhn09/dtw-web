import { NextResponse } from "next/server";
import { USING_CENTRAL_CMS, getRecentArticles } from "@/lib/cms-client";
import { CMS_URL } from "@/lib/central-api";

/**
 * Cutover probe. `GET /api/health/cms` answers the one question nothing else can:
 * is the CODE CURRENTLY RUNNING reading from the Central CMS, or from this repo's
 * embedded Payload?
 *
 * Why not read the Vercel dashboard: `CMS_SOURCE` is captured at module load, so a
 * deployment built before the variable was set keeps serving the old source while
 * the dashboard shows the new value. The dashboard describes intent; this route
 * describes reality. It reports the constant the router itself resolved, not a
 * fresh `process.env` read — on brief-asia's cutover that distinction was what
 * revealed a flip that had silently done nothing, because the env was set but the
 * code had never been pushed.
 *
 * `mediaHost` catches the other silent one: Central returns RELATIVE media URLs,
 * which a browser resolves against dailytechwire.com and quietly keeps serving from
 * the old storage. After the flip this must be Central's host; this site's own host
 * means the absolutize step at the fetch boundary is not running.
 *
 * `dashboardsStayLocal` is a reminder, not a fault: the AI Leaderboard reads
 * `aiModels` / `dashboardMethodology` / `sponsorSlots`, none of which exist in
 * Central's schema, so those three stay bound to the local Payload in both modes.
 * DTW therefore still needs its local Payload after cutover.
 *
 * Exposes no secrets: the read token is never echoed and CMS_URL is reduced to a host.
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
    const hero = (article as { heroImage?: unknown } | undefined)?.heroImage;
    const heroUrl = hero && typeof hero === "object" ? (hero as { url?: string }).url : undefined;

    probe = article
      ? {
          ok: true,
          articleId: article.id,
          slug: article.slug,
          publishedAt: article.publishedAt ?? null,
          mediaHost: hostOf(heroUrl) ?? (heroUrl ? "RELATIVE — not absolutized" : null),
        }
      : { ok: false, reason: "no articles returned" };
  } catch (err) {
    probe = { ok: false, reason: (err as Error)?.message ?? "unknown error" };
  }

  return NextResponse.json(
    {
      cmsSource: USING_CENTRAL_CMS ? "central" : "local",
      // These disagreeing is the signature of "env set, never redeployed".
      envSaysCentral: process.env.CMS_SOURCE === "central",
      centralHost: USING_CENTRAL_CMS ? hostOf(CMS_URL) : null,
      hasReadToken: Boolean(process.env.CMS_READ_TOKEN),
      hasRevalidateSecret: Boolean(process.env.REVALIDATE_SECRET),
      dashboardsStayLocal: true,
      probe,
      ms: Date.now() - started,
    },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
