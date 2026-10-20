import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { parseExclusivePage } from "@/lib/exclusive";
import { ExclusiveView, exclusiveMetadata } from "../../exclusive-view";

export const revalidate = 60;

export function generateStaticParams(): Array<{ n: string }> {
  return [];
}

/**
 * Page 2+ of `/exclusive`. Same rules as `/[pillar]/page/[n]`: only a plain
 * integer resolves; `/exclusive/page/1` redirects to `/exclusive` so page 1
 * has one URL; padded, signed or non-numeric segments 404.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ n: string }>;
}): Promise<Metadata> {
  const { n } = await params;
  const page = parseExclusivePage(n);
  if (page == null || page < 2) notFound();
  return exclusiveMetadata(page);
}

export default async function ExclusivePaginatedPage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const { n } = await params;
  const page = parseExclusivePage(n);
  if (page == null) notFound();
  if (page === 1) redirect("/exclusive");
  return <ExclusiveView page={page} />;
}
