"use server";

import { getReadCountThisPeriod, requireUser } from "@/lib/session";

/**
 * Server action ShellProvider calls once when a signed-in session is
 * established (not polled) to seed the meter's real, DB-backed count for
 * this reader. Fails closed to 0 rather than throwing to the client — this
 * meter is a soft UX signal, never a hard gate (paywall never blocks
 * mid-article).
 */
export async function getMyReadCount(): Promise<number> {
  try {
    const user = await requireUser();
    return await getReadCountThisPeriod(user.id);
  } catch {
    return 0;
  }
}
