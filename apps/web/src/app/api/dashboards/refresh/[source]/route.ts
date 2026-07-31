import { getPayload } from "payload";
import config from "../../../../../../payload.config";
import { bearerMatches } from "@/lib/bearer-auth";
import { fetchAiLlmstatsUpdates, LlmStatsFetchError } from "@/lib/dashboards/ai-llmstats";

/**
 * Dashboard data-refresh cron. Vercel triggers this via `GET` on the schedule
 * in `apps/web/vercel.json`, sending `Authorization: Bearer $CRON_SECRET`
 * (Vercel's automatic cron header); ops can also `POST` it manually for
 * testing. Both verbs share the one handler below (AD-8).
 *
 * Lean Deviation #7 (ai-leaderboard-llmstats_PLAN_30-07-26.md): the dynamic
 * `[source]` segment stays future-compatible for the deferred funding pass
 * (`stocks-yahoo`/`stocks-vietnam`/`stocks-daily`), but today only the
 * literal `"ai-weekly"` is wired — anything else 404s.
 *
 * Never creates `aiModels` rows. Matches existing rows by
 * `sourceSlugLlmstats`; unmatched upstream ids are logged and skipped.
 * Respects `editorLocked` — a field named there is never overwritten
 * (AD-4/AD-5, human always wins). On any adapter failure, writes nothing —
 * last-good `aiModels` data keeps rendering (see `ai-llmstats.ts`).
 */
export const maxDuration = 60;

const CRON_FIELDS = [
  "maker",
  "general",
  "reasoning",
  "coding",
  "math",
  "search",
  "vision",
  "inputPrice",
  "outputPrice",
  "released",
] as const;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function handleRefresh(request: Request, source: string): Promise<Response> {
  if (source !== "ai-weekly") {
    return json({ error: `unknown refresh source: ${source}` }, 404);
  }

  const expectedToken = process.env.DTW_DASHBOARD_REFRESH_TOKEN;
  if (!expectedToken) {
    console.error("[dashboards-refresh] DTW_DASHBOARD_REFRESH_TOKEN is not set");
    return json({ error: "refresh not configured" }, 500);
  }
  if (!bearerMatches(request.headers.get("authorization"), expectedToken)) {
    return json({ error: "unauthorized" }, 401);
  }

  const apiKey = process.env.LLMSTATS_API_KEY;
  if (!apiKey) {
    console.error("[dashboards-refresh] LLMSTATS_API_KEY is not set — failing closed, no write");
    return json({ ok: false, error: "LLM Stats not configured", written: 0, skipped: 0 }, 200);
  }

  let updates;
  try {
    updates = await fetchAiLlmstatsUpdates(apiKey);
  } catch (err) {
    const message = err instanceof LlmStatsFetchError ? err.message : (err as Error)?.message;
    console.error("[dashboards-refresh] ai-llmstats fetch failed — writing nothing", message);
    return json({ ok: false, error: "upstream fetch failed", written: 0, skipped: 0 }, 200);
  }

  const payload = await getPayload({ config });
  const existing = await payload.find({
    collection: "aiModels",
    limit: 0,
    depth: 0,
  });
  const bySlug = new Map(
    existing.docs
      .filter((d) => d.sourceSlugLlmstats)
      .map((d) => [d.sourceSlugLlmstats as string, d])
  );

  let written = 0;
  let skipped = 0;
  for (const update of updates) {
    const doc = bySlug.get(update.sourceSlugLlmstats);
    if (!doc) {
      skipped++;
      continue;
    }

    const locked = new Set((doc.editorLocked ?? []).map((l) => l.field).filter(Boolean));
    const data: Record<string, unknown> = {};
    for (const field of CRON_FIELDS) {
      if (locked.has(field)) continue;
      const value = (update as unknown as Record<string, unknown>)[field];
      if (value !== undefined) data[field] = value;
    }
    if (Object.keys(data).length === 0) continue; // nothing owned+unlocked to write for this row
    if (!locked.has("asOfScores")) data.asOfScores = new Date().toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic partial update, same pattern as scripts/seed-payload.ts's payload.update calls
    await payload.update({ collection: "aiModels", id: doc.id, data } as any);
    written++;
  }

  console.log(
    `[dashboards-refresh] ai-weekly: ${written} row(s) updated, ${skipped} upstream id(s) unmatched (logged, skipped)`
  );
  return json({ ok: true, written, skipped }, 200);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ source: string }> }
): Promise<Response> {
  const { source } = await params;
  return handleRefresh(request, source);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ source: string }> }
): Promise<Response> {
  const { source } = await params;
  return handleRefresh(request, source);
}
