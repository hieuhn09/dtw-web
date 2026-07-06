import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@dtw/db/client";
import { users, sessions, accounts, verifications } from "@dtw/db";
import { sendEmail, actionEmail } from "@/lib/email";

/**
 * Send an auth email without ever hard-failing the surrounding flow. A mail
 * outage (missing/invalid RESEND_API_KEY, unverified RESEND_FROM_DOMAIN, a
 * transient Resend error) must NOT roll back account creation, password reset,
 * or email-change. We catch + log so Better-Auth still completes user
 * creation; verification is still ENFORCED at sign-in and the user can
 * request a resend.
 */
async function sendAuthEmailSafe(
  context: string,
  msg: { to: string; subject: string; html: string; text: string }
): Promise<void> {
  try {
    await sendEmail(msg);
  } catch (err) {
    console.error(
      `[auth] ${context} email send failed for ${msg.to} — account flow continues. ` +
        `User can request a resend. Cause:`,
      err
    );
  }
}

/**
 * Reader authentication. Better-Auth on the existing Drizzle tables —
 * packages/db/src/schema/auth.ts was purpose-shaped for the BA adapter, so
 * the `schema` map below just points BA's logical models at our actual
 * tables (auth_users, auth_sessions, auth_accounts, auth_verifications) with
 * no rename.
 *
 * Separate from Payload's editorial /admin auth (that's the `users`
 * collection — see apps/web/src/payload/collections/Users.ts). Email is sent
 * through src/lib/email.ts (Resend in prod, console in dev).
 *
 * Scope for this pass (process/features/account/active/
 * reader-auth-account-simple_PLAN_03-07-26.md, Stage A): email + password
 * (incl. forgot/reset) + Google OAuth (conditionally registered). No magic
 * link, no Apple. GitHub is registered using the exact same conditional
 * pattern as Google purely because it costs nothing extra — the client-side
 * button stays hidden by default (NEXT_PUBLIC_GITHUB_ENABLED unset).
 */

const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);
const githubConfigured = Boolean(
  process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 3600, // 1 hour
    sendResetPassword: async ({ user, url }) => {
      const { html, text } = actionEmail({
        heading: "Reset your password",
        intro:
          "We received a request to reset your DailyTechWire password. This link expires in 1 hour.",
        buttonLabel: "Reset password",
        url,
      });
      await sendAuthEmailSafe("reset-password", {
        to: user.email,
        subject: "Reset your DailyTechWire password",
        html,
        text,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const { html, text } = actionEmail({
        heading: "Confirm your email",
        intro:
          "Welcome to DailyTechWire. Confirm your email to activate your account.",
        buttonLabel: "Verify email",
        url,
      });
      await sendAuthEmailSafe("verify-email", {
        to: user.email,
        subject: "Confirm your DailyTechWire account",
        html,
        text,
      });
    },
    // NOTE: do NOT add anything in auth-modal.tsx that calls
    // authClient.sendVerificationEmail() again after signUp.email() succeeds.
    // sendOnSignUp:true above is the ONLY trigger — this is a deliberate fix
    // for brief-asia's double-send bug (see the port-map reference doc).
  },
  socialProviders: {
    ...(googleConfigured
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          },
        }
      : {}),
    ...(githubConfigured
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
          },
        }
      : {}),
  },
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "reader", input: false },
    },
    // The installed better-auth version (1.6.23) sends the change-email
    // verification link through the same emailVerification.sendVerificationEmail
    // callback above (addressed to the new email) — there is no separate
    // `sendChangeEmailVerification` option on this version's `changeEmail`
    // config (only an opt-in `sendChangeEmailConfirmation`, sent to the OLD
    // address, which this pass does not need). Enabling `changeEmail` here is
    // sufficient; Settings (Stage D) wires the UI.
    changeEmail: {
      enabled: true,
    },
    deleteUser: { enabled: true }, // Settings stage wires the UI; safe to enable now.
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh at most once a day
  },
  plugins: [
    nextCookies(), // MUST be last in the plugin chain.
  ],
});
