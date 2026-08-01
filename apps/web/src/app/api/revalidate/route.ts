import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Revalidate webhook receiver. When editorial content changes in the Central CMS,
 * it POSTs `{ token }` here — an HMAC-signed, expiring token whose claims carry
 * the cache `tags` to bust. We verify the signature with REVALIDATE_SECRET (which
 * MUST equal Central's CENTRAL_SIGNING_SECRET), check `exp`, then call
 * `revalidateTag()` for each tag. A leaked URL alone is not enough — the signed
 * token is required.
 *
 * The token scheme mirrors central's `signPayload/verifySigned` (src/lib/crypto.ts):
 * compact `<base64url(json)>.<base64url(hmac-sha256)>`.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RevalidateClaims {
  tags?: string[];
  tenant?: string;
  collection?: string;
  slug?: string;
  exp: number;
  [key: string]: unknown;
}

function fromB64url(input: string): Buffer {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function constantTimeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Verify + decode a signed token (returns null if tampered, malformed, or expired). */
function verifySigned(token: string, secret: string, nowSeconds: number): RevalidateClaims | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts as [string, string];
  const expected = b64url(createHmac("sha256", secret).update(body).digest());
  if (!constantTimeEqual(sig, expected)) return null;
  try {
    const claims = JSON.parse(fromB64url(body).toString("utf8")) as RevalidateClaims;
    if (typeof claims.exp !== "number" || claims.exp < nowSeconds) return null;
    return claims;
  } catch {
    return null;
  }
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    console.warn("[revalidate] REVALIDATE_SECRET unset — ignoring webhook");
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503 });
  }

  let token: string | undefined;
  try {
    ({ token } = (await request.json()) as { token?: string });
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }
  if (!token) return NextResponse.json({ ok: false, reason: "missing_token" }, { status: 400 });

  const claims = verifySigned(token, secret, Math.floor(Date.now() / 1000));
  if (!claims) return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });

  const tags = Array.isArray(claims.tags) ? claims.tags.filter((t): t is string => typeof t === "string") : [];
  for (const tag of tags) revalidateTag(tag);

  return NextResponse.json({ ok: true, revalidated: tags });
}
