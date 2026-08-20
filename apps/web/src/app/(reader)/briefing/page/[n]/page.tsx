import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BriefingView, briefingMetadata } from "../../briefing-view";

export const revalidate = 60;

export function generateStaticParams(): Array<{ n: string }> {
  return [];
}

/**
 * Page 2+ of the brief archive. Exists so a crawler has a real `<a href>` path
 * through it rather than only the newest page.
 *
 * Rejects anything that isn't a plain integer ≥ 2, mirroring the pillar feed:
 * `/briefing/page/1` is not a second address for page 1 (it redirects), and
 * padded ("02"), signed, or non-numeric segments 404 rather than resolving —
 * which keeps an unbounded set of junk URLs out of the index.
 */
function parsePage(raw: string): number | null {
  if (!/^[1-9][0-9]*$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isSafeInteger(n) ? n : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ n: string }>;
}): Promise<Metadata> {
  const { n } = await params;
  const page = parsePage(n);
  if (page == null || page < 2) notFound();
  return briefingMetadata(page);
}

export default async function BriefingPaginatedPage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const { n } = await params;
  const page = parsePage(n);
  if (page == null) notFound();
  if (page === 1) redirect("/briefing");
  return <BriefingView page={page} />;
}
