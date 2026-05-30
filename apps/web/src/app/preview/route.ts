import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "../../../payload.config";

/**
 * Draft preview entry point. The Payload admin "Preview" button links here with
 * the editor's session cookie. We authenticate that cookie with Payload — only
 * a logged-in CMS user may enable draft mode — then turn on Next.js draft mode
 * and redirect to the article, which will fetch the unpublished draft.
 *
 * Security: draft mode is the ONLY thing that surfaces unpublished content
 * (getArticleBySlugDraft), and it can only be enabled here, behind auth. An
 * anonymous request gets 401 and never sees a draft.
 */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return new Response("Missing ?slug", { status: 400 });
  }

  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return new Response("Unauthorized — sign in at /admin to preview drafts.", {
      status: 401,
    });
  }

  (await draftMode()).enable();
  redirect(`/article/${slug}`);
}
