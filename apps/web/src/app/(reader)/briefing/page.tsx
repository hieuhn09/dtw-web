import type { Metadata } from "next";
import { BriefingView, briefingMetadata } from "./briefing-view";

export const revalidate = 60;

export const metadata: Metadata = briefingMetadata(1);

export default async function BriefingPage() {
  return <BriefingView page={1} />;
}
