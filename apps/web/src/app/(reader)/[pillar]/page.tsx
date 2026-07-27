import type { Metadata } from "next";
import { PillarView, pillarMetadata } from "./pillar-view";

export const revalidate = 60;

// Without this, a page under a dynamic segment is fully dynamic in Next 15
// and the `revalidate` above is silently ignored (SSR per request, no-store
// headers). Empty is enough: dynamicParams stays on, so a pillar created in
// /admin builds on first request and caches for the 60s window — and the
// pillars afterChange hook still busts by tag instantly.
export function generateStaticParams(): Array<{ pillar: string }> {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pillar: string }>;
}): Promise<Metadata> {
  const { pillar: slug } = await params;
  return pillarMetadata(slug, 1);
}

export default async function PillarPage({
  params,
}: {
  params: Promise<{ pillar: string }>;
}) {
  const { pillar: slug } = await params;
  return <PillarView slug={slug} page={1} />;
}
