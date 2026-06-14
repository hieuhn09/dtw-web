import { getCorrections } from "@/lib/payload-server";
import { TrustContent, type CorrectionView, type TrustSlug } from "./trust-content";

export const revalidate = 300;

const SLUGS: ReadonlyArray<TrustSlug> = [
  "editorial",
  "ai",
  "corrections",
  "transparency",
  "sponsored",
];

function isTrustSlug(v: string): v is TrustSlug {
  return (SLUGS as ReadonlyArray<string>).includes(v);
}

/**
 * Server wrapper: fetches corrections (server-only Payload client) and hands the
 * locale-neutral data to the client presentational component, which renders the
 * trilingual chrome via `useT()`. Keeps `revalidate` + SSR intact.
 */
export default async function TrustPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const key: TrustSlug = isTrustSlug(slug) ? slug : "editorial";

  const corrections: CorrectionView[] =
    key === "corrections"
      ? (await getCorrections()).map((c) => ({
          iso: c.correctionDate,
          art: typeof c.article === "object" && c.article ? c.article.title : "",
          summary: c.summary,
          was: c.wasText,
          now: c.nowText,
          editor: typeof c.editor === "object" && c.editor ? c.editor.name : undefined,
        }))
      : [];

  return <TrustContent slug={key} corrections={corrections} />;
}
