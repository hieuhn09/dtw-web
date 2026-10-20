import type { Metadata } from "next";
import { ExclusiveView, exclusiveMetadata } from "./exclusive-view";

export const revalidate = 60;

export function generateMetadata(): Promise<Metadata> {
  return exclusiveMetadata(1);
}

export default function ExclusivePage() {
  return <ExclusiveView page={1} />;
}
