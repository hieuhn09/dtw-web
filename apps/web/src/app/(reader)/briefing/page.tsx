import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BRIEFING_HIDDEN } from "@/lib/brief";
import { BriefingView, briefingMetadata } from "./briefing-view";

export const revalidate = 60;

export const metadata: Metadata = briefingMetadata(1);

export default async function BriefingPage() {
  // [temp-hidden 2026-11-17] Daily Brief paused by product request; flip
  // BRIEFING_HIDDEN in lib/brief.ts to restore.
  if (BRIEFING_HIDDEN) notFound();
  return <BriefingView page={1} />;
}
