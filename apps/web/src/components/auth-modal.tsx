"use client";

import { useState } from "react";
import { Button } from "@dtw/ui";
import { Icon } from "@/components/icons";
import { useT } from "@/lib/i18n";
import { useShell } from "@/lib/shell";
import { authClient, signIn, signUp, authCallbackUrl } from "@/lib/auth-client";

type Mode = "signin" | "signup" | "forgot";

/**
 * Provider buttons are gated on NEXT_PUBLIC_*_ENABLED, mirroring the
 * server-side conditional registration in `@/lib/auth.ts`
 * (`GOOGLE_CLIENT_ID`/`SECRET`, `GITHUB_CLIENT_ID`/`SECRET`). Never hardcode
 * these to `true` — a mismatch between the client gate and the server's
 * actual provider registration would render a button that 500s on click.
 * GitHub ships hidden by default (no requirement to enable it), Google is the
 * one real provider in this pass's approved scope.
 */
const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "true";
const githubEnabled = process.env.NEXT_PUBLIC_GITHUB_ENABLED === "true";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid var(--hair-2)",
  borderRadius: 5,
  fontSize: 13,
  background: "var(--paper)",
  color: "var(--ink)",
  fontFamily: "var(--font-sans)",
};

/**
 * Reader auth modal. Real Better-Auth flows: email+password sign in / sign
 * up (with email verification) / forgot-password, plus an optional Google
 * button. The session updates reactively (shell reads useSession), so a
 * successful sign-in just closes the modal.
 */
export function AuthModal() {
  const t = useT();
  const { authOpen, closeAuth } = useShell();

  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!authOpen) return null;

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setNotice(null);
    setPassword("");
  };

  async function handleSignin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await signIn.email({ email, password, rememberMe: remember });
    setBusy(false);
    if (error) {
      setError(
        error.message ||
          t("Wrong email or password.", "Sai email hoặc mật khẩu.", "Email atau kata sandi salah.")
      );
      return;
    }
    closeAuth();
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await signUp.email({ email, password, name });
    setBusy(false);
    if (error) {
      setError(
        error.message ||
          t("Could not create account.", "Không tạo được tài khoản.", "Gagal membuat akun.")
      );
      return;
    }
    // The server's emailVerification.sendOnSignUp:true is the ONLY verification
    // email trigger — do not also call authClient.sendVerificationEmail() here,
    // or the reader gets two emails for one signup.
    setNotice(
      t(
        "Account created. Check your email to confirm and activate it.",
        "Đã tạo tài khoản. Kiểm tra email để xác nhận và kích hoạt.",
        "Akun dibuat. Cek email untuk konfirmasi."
      )
    );
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    await authClient.requestPasswordReset({
      email,
      redirectTo: authCallbackUrl("/reset-password"),
    });
    setBusy(false);
    // Anti-enumeration: identical message whether or not the email exists.
    setNotice(
      t(
        "If an account exists for that email, a reset link is on its way.",
        "Nếu email có tài khoản, liên kết đặt lại sẽ được gửi tới.",
        "Jika akun ada, tautan reset akan dikirim."
      )
    );
  }

  async function handleSocial(provider: "google" | "github") {
    setBusy(true);
    setError(null);
    const { error } = await signIn.social({ provider, callbackURL: authCallbackUrl() });
    if (error) {
      setBusy(false);
      setError(
        error.message ||
          t("Sign-in is unavailable.", "Đăng nhập không khả dụng.", "Masuk tidak tersedia.")
      );
    }
  }

  const title =
    mode === "signup"
      ? t("Create your account", "Tạo tài khoản", "Buat akun")
      : mode === "forgot"
        ? t("Reset password", "Đặt lại mật khẩu", "Atur ulang kata sandi")
        : t("Sign in", "Đăng nhập", "Masuk");

  const showProviders = mode !== "forgot" && (googleEnabled || githubEnabled);

  return (
    <div
      onClick={closeAuth}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "color-mix(in oklab, var(--ink) 50%, transparent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--hair)",
          borderRadius: 10,
          padding: 28,
          maxWidth: 420,
          width: "100%",
          boxShadow: "var(--shadow)",
          position: "relative",
        }}
        className="fade-up"
      >
        <button
          onClick={closeAuth}
          aria-label="Close"
          style={{
            position: "absolute",
            right: 14,
            top: 14,
            background: "transparent",
            border: "none",
            color: "var(--muted)",
            cursor: "pointer",
          }}
        >
          <Icon name="close" size={16} />
        </button>

        <div className="kicker" style={{ marginBottom: 8 }}>
          {t("Welcome to DTW", "Chào mừng đến DTW", "Selamat datang di DTW")}
        </div>
        <h2
          className="serif"
          style={{ margin: "0 0 16px", fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em" }}
        >
          {title}
        </h2>

        {notice ? (
          <div
            style={{
              background: "color-mix(in oklab, var(--up) 14%, transparent)",
              border: "1px solid color-mix(in oklab, var(--up) 40%, transparent)",
              borderRadius: 6,
              padding: "12px 14px",
              fontSize: 13,
              lineHeight: 1.5,
              color: "var(--ink)",
              marginBottom: 14,
            }}
          >
            {notice}
          </div>
        ) : (
          <>
            {error && (
              <div
                style={{
                  background: "color-mix(in oklab, var(--accent) 12%, transparent)",
                  border: "1px solid color-mix(in oklab, var(--accent) 40%, transparent)",
                  borderRadius: 6,
                  padding: "10px 12px",
                  fontSize: 12.5,
                  color: "var(--accent)",
                  marginBottom: 12,
                }}
              >
                {error}
              </div>
            )}

            <form
              onSubmit={mode === "signin" ? handleSignin : mode === "signup" ? handleSignup : handleForgot}
              style={{ display: "grid", gap: 10, marginBottom: 12 }}
            >
              {mode === "signup" && (
                <input
                  name="name"
                  type="text"
                  required
                  placeholder={t("Full name", "Họ và tên", "Nama lengkap")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                />
              )}
              <input
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
              {mode !== "forgot" && (
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder={t("Password", "Mật khẩu", "Kata sandi")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                />
              )}
              {mode === "signin" && (
                <label
                  style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--muted)" }}
                >
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  {t("Remember me", "Ghi nhớ đăng nhập", "Ingat saya")}
                </label>
              )}
              <Button variant="accent" size="lg" type="submit" disabled={busy} style={{ width: "100%" }}>
                {busy
                  ? t("Please wait…", "Vui lòng đợi…", "Mohon tunggu…")
                  : mode === "signup"
                    ? t("Create account", "Tạo tài khoản", "Buat akun")
                    : mode === "forgot"
                      ? t("Send reset link", "Gửi liên kết đặt lại", "Kirim tautan reset")
                      : t("Sign in", "Đăng nhập", "Masuk")}
              </Button>
            </form>

            {showProviders && (
              <>
                <div
                  className="text-mute"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 11,
                    margin: "14px 0 12px",
                  }}
                >
                  <div style={{ flex: 1, height: 1, background: "var(--hair)" }} />
                  {t("or continue with", "hoặc tiếp tục với", "atau lanjut dengan")}
                  <div style={{ flex: 1, height: 1, background: "var(--hair)" }} />
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {googleEnabled && (
                    <button
                      onClick={() => handleSocial("google")}
                      disabled={busy}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "1px solid var(--hair-2)",
                        background: "transparent",
                        borderRadius: 5,
                        fontSize: 13,
                        color: "var(--ink)",
                        cursor: busy ? "default" : "pointer",
                        textAlign: "center",
                      }}
                    >
                      {t("Continue with Google", "Tiếp tục với Google", "Lanjut dengan Google")}
                    </button>
                  )}
                  {githubEnabled && (
                    <button
                      onClick={() => handleSocial("github")}
                      disabled={busy}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "1px solid var(--hair-2)",
                        background: "transparent",
                        borderRadius: 5,
                        fontSize: 13,
                        color: "var(--ink)",
                        cursor: busy ? "default" : "pointer",
                        textAlign: "center",
                      }}
                    >
                      {t("Continue with GitHub", "Tiếp tục với GitHub", "Lanjut dengan GitHub")}
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* Mode switches */}
        <div className="text-mute" style={{ fontSize: 12, lineHeight: 1.9, marginTop: 16 }}>
          {mode === "signin" && (
            <>
              <button onClick={() => switchMode("forgot")} style={linkBtn}>
                {t("Forgot password?", "Quên mật khẩu?", "Lupa kata sandi?")}
              </button>
              <br />
              {t("New to DailyTechWire?", "Mới biết DailyTechWire?", "Baru di DailyTechWire?")}{" "}
              <button onClick={() => switchMode("signup")} style={linkBtn}>
                {t("Create an account", "Tạo tài khoản", "Buat akun")}
              </button>
            </>
          )}
          {mode === "signup" && (
            <>
              {t("Already have an account?", "Đã có tài khoản?", "Sudah punya akun?")}{" "}
              <button onClick={() => switchMode("signin")} style={linkBtn}>
                {t("Sign in", "Đăng nhập", "Masuk")}
              </button>
            </>
          )}
          {mode === "forgot" && (
            <button onClick={() => switchMode("signin")} style={linkBtn}>
              {t("Back to sign in", "Quay lại đăng nhập", "Kembali ke masuk")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const linkBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "var(--accent)",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 12,
  padding: 0,
};
