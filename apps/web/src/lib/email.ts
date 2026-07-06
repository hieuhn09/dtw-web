import "server-only";
import { Resend } from "resend";

/**
 * Transactional email. With RESEND_API_KEY set we send via Resend; without it
 * (the current dev state) we log the message to the server console so the auth
 * flows — verification, password reset — are fully testable before the key is
 * wired. Swap-in is zero-code: set RESEND_API_KEY and restart.
 */

const apiKey = process.env.RESEND_API_KEY;
const fromDomain = process.env.RESEND_FROM_DOMAIN || "dailytechwire.com";
const FROM = `DailyTechWire <no-reply@${fromDomain}>`;

const resend = apiKey ? new Resend(apiKey) : null;

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(msg: EmailMessage): Promise<void> {
  if (!resend) {
    // Dev fallback — make the link copy/pasteable from the terminal.
    console.log(
      [
        "",
        "──────────── [email · dev console] ────────────",
        `To:      ${msg.to}`,
        `Subject: ${msg.subject}`,
        "",
        msg.text,
        "───────────────────────────────────────────────",
        "",
      ].join("\n")
    );
    return;
  }
  const { error } = await resend.emails.send({
    from: FROM,
    to: msg.to,
    subject: msg.subject,
    html: msg.html,
    text: msg.text,
  });
  if (error) {
    // Log here so the failure is observable server-side even when an auth caller
    // catches + swallows the throw (account creation must not roll back). Still
    // throw so non-auth callers can react to the failure.
    console.error(`[email] Resend send failed (to=${msg.to}, subject="${msg.subject}"):`, error);
    throw new Error(`Resend send failed: ${error.message}`);
  }
}

/**
 * Branded single-action email (verify / reset / email-change). Returns both an
 * HTML body and a plain-text fallback (the text is what the dev console prints).
 *
 * Email clients cannot reliably read CSS custom properties, so this is the one
 * place in the repo where hardcoding hex literals (rather than `var(--...)`) is
 * correct, not a violation of the app's "never hardcode rgba" convention — see
 * process/features/account/backlog/phase-01-auth-foundation_PLAN_03-07-26.md's
 * Grounding section for the exact light-theme hex values this mirrors.
 */
export function actionEmail(opts: {
  heading: string;
  intro: string;
  buttonLabel: string;
  url: string;
  footer?: string;
}): { html: string; text: string } {
  const footer =
    opts.footer ?? "If you didn't request this, you can safely ignore this email.";
  const text = `${opts.heading}\n\n${opts.intro}\n\n${opts.buttonLabel}: ${opts.url}\n\n${footer}`;
  const html = `<!doctype html><html><body style="margin:0;background:#FDFCF8;font-family:-apple-system,'Segoe UI',sans-serif;color:#111111">
  <div style="max-width:480px;margin:0 auto;padding:32px 24px">
    <div style="font-weight:800;font-size:22px;margin-bottom:24px;letter-spacing:-0.5px"><span style="color:#1B2A52">DTW</span> <span style="font-style:italic;font-weight:700;color:#D4623C">dailytechwire</span></div>
    <h1 style="font-size:20px;margin:0 0 12px;color:#111111">${opts.heading}</h1>
    <p style="font-size:14px;line-height:1.6;color:#5B5B58;margin:0 0 24px">${opts.intro}</p>
    <a href="${opts.url}" style="display:inline-block;background:#D4623C;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:6px">${opts.buttonLabel}</a>
    <p style="font-size:12px;line-height:1.6;color:#8A8A86;margin:28px 0 0">${footer}</p>
  </div></body></html>`;
  return { html, text };
}
