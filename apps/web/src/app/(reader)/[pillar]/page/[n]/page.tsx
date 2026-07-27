import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PillarView, pillarMetadata } from "../../pillar-view";

export const revalidate = 60;

export function generateStaticParams(): Array<{ pillar: string; n: string }> {
  return [];
}

/**
 * Page 2+ of a pillar feed. Exists so crawlers have a real `<a href>` path
 * through the archive — the feed's "Load more" button is a server action and
 * a crawler can never advance past page 1 through it.
 *
 * Rejects anything that isn't a plain integer ≥ 2. `/{pillar}/page/1` is not a
 * second address for page 1 — it redirects, so the feed's first page has
 * exactly one URL. Padded ("02"), signed, or non-numeric segments 404 rather
 * than resolving, which keeps an unbounded set of junk URLs out of the index.
 */
function parsePage(raw: string): number | null {
  if (!/^[1-9][0-9]*$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isSafeInteger(n) ? n : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pillar: string; n: string }>;
}): Promise<Metadata> {
  const { pillar: slug, n } = await params;
  const page = parsePage(n);
  if (page == null || page < 2) notFound();
  return pillarMetadata(slug, page);
}

export default async function PillarPaginatedPage({
  params,
}: {
  params: Promise<{ pillar: string; n: string }>;
}) {
  const { pillar: slug, n } = await params;
  const page = parsePage(n);
  if (page == null) notFound();
  if (page === 1) redirect(`/${slug}`);
  return <PillarView slug={slug} page={page} />;
}
