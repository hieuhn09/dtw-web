import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

/** Turn off draft mode and return to the public site. */
export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const to = searchParams.get("to") ?? "/";
  (await draftMode()).disable();
  redirect(to);
}
