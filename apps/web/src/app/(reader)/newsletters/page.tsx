import { getNewsletters } from "@/lib/cms-client";
import { NewslettersContent } from "./newsletters-content";

/**
 * Server-fetched (Stage D) — was a fully client component reading the static
 * `NEWSLETTERS` fixture from `@/lib/data`. `getNewsletters()` is
 * `"server-only"`, so the interactive picker/submit UI lives in the sibling
 * client component below.
 */
export default async function NewslettersPage() {
  const newsletters = await getNewsletters();
  return <NewslettersContent newsletters={newsletters} />;
}
