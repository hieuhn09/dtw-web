import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { CENTRAL_PREVIEW_TOKEN_COOKIE, fetchPreview } from "@/lib/central-api";

/**
 * Draft preview entry point.
 *
 * Central CMS's Articles "Preview" button links an editor here via
 * `/api/preview/mint`, which authenticates them, checks they may see this
 * tenant, and signs a short-lived token carrying `{ tenant, slug, exp }`. We
 * verify that token by spending it against Central's `/api/public/preview`,
 * store it in an HTTP-only cookie for the render, and turn on Next draft mode.
 *
 * The embedded-Payload branch this route used to carry (authenticate the local
 * `/admin` session, then enable draft mode on the slug alone) was removed on
 * 04-09-2026 along with local Payload. It is no loss: the signed token is
 * strictly stronger — a leaked slug is not enough, and the token expires.
 *
 * Security: draft mode is the ONLY thing that surfaces unpublished content
 * (`getArticleBySlugDraft`), and it can only be enabled here, behind a valid
 * token. An anonymous request gets 400/401 and never sees a draft.
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const token = searchParams.get("token");

  if (!token) {
    return new Response("Missing ?token", { status: 400 });
  }

  const doc = await fetchPreview<{ slug?: string | null }>(token, "en");
  const tokenSlug = doc?.slug?.trim();
  if (!tokenSlug) {
    return new Response("Invalid or expired Central CMS preview token.", { status: 401 });
  }
  // `?slug` is advisory — the token is authoritative — but a mismatch means the
  // link was tampered with or rebuilt by hand, so refuse rather than guess.
  if (slug && slug !== tokenSlug) {
    return new Response("Preview token does not match ?slug.", { status: 400 });
  }

  (await cookies()).set(CENTRAL_PREVIEW_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });
  (await draftMode()).enable();
  redirect(`/article/${encodeURIComponent(tokenSlug)}`);
}
