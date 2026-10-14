/**
 * Sign-up abuse guards (bot wave Aug–Oct 2026: hundreds of unverified readers
 * on dotted Gmail addresses such as `u.ho.cu.t.o.g7.65@gmail.com`).
 *
 * Pure functions — no I/O — so they can be unit-checked and reused by the
 * clean-up script. The DB-backed duplicate check lives in `auth.ts`.
 */

const GMAIL_DOMAINS = new Set(["gmail.com", "googlemail.com"]);

/** Dots in a Gmail local part at which we treat the address as bot-generated. */
const MAX_GMAIL_DOTS = 3;

/** Fastest plausible human fill-in time for name + email + password (ms). */
export const MIN_FORM_FILL_MS = 2000;

/** Header names the sign-up form sends (see `signup/page.tsx`). */
export const SIGNUP_HEADERS = {
  elapsed: "x-wad-elapsed",
  honeypot: "x-wad-hp",
} as const;

function splitEmail(email: string): { local: string; domain: string } | null {
  const at = email.lastIndexOf("@");
  if (at < 1) return null;
  return { local: email.slice(0, at).toLowerCase(), domain: email.slice(at + 1).toLowerCase() };
}

/**
 * Gmail ignores dots and `+tag` suffixes, so `a.b.c+x@gmail.com` and
 * `abc@gmail.com` are one mailbox. Returns the canonical `local@domain` for
 * Gmail, or the lower-cased address unchanged for every other provider.
 */
export function canonicalEmail(email: string): string {
  const parts = splitEmail(email.trim());
  if (!parts) return email.trim().toLowerCase();
  if (!GMAIL_DOMAINS.has(parts.domain)) return `${parts.local}@${parts.domain}`;
  const local = (parts.local.split("+")[0] ?? "").replace(/\./g, "");
  return `${local}@gmail.com`;
}

/** The canonical Gmail local part, or null when the address is not Gmail. */
export function gmailCanonicalLocal(email: string): string | null {
  const parts = splitEmail(email.trim());
  if (!parts || !GMAIL_DOMAINS.has(parts.domain)) return null;
  return (parts.local.split("+")[0] ?? "").replace(/\./g, "");
}

/** Gmail address with more dots than any real person uses (`e.l.i.qedij4.10`). */
export function looksLikeDottedGmailBot(email: string): boolean {
  const parts = splitEmail(email.trim());
  if (!parts || !GMAIL_DOMAINS.has(parts.domain)) return false;
  const dots = (parts.local.match(/\./g) ?? []).length;
  return dots > MAX_GMAIL_DOTS;
}

export type FormSignalVerdict = { ok: true } | { ok: false; reason: "honeypot" | "too-fast" | "missing" };

/**
 * Checks the two browser-side signals the sign-up form attaches as headers:
 * a hidden honeypot field (must be empty) and the milliseconds between page
 * load and submit. A request carrying neither came straight from a script to
 * `/api/auth/sign-up/email` rather than through the form.
 */
export function checkFormSignals(headers: Headers | null | undefined): FormSignalVerdict {
  const honeypot = headers?.get(SIGNUP_HEADERS.honeypot);
  if (honeypot) return { ok: false, reason: "honeypot" };
  const raw = headers?.get(SIGNUP_HEADERS.elapsed);
  if (raw == null) return { ok: false, reason: "missing" };
  const elapsed = Number(raw);
  if (!Number.isFinite(elapsed)) return { ok: false, reason: "missing" };
  if (elapsed < MIN_FORM_FILL_MS) return { ok: false, reason: "too-fast" };
  return { ok: true };
}
