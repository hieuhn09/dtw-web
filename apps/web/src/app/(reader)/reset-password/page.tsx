"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@dtw/ui";
import { resetPassword } from "@/lib/auth-client";
import { useT } from "@/lib/i18n";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid var(--hair-2)",
  borderRadius: 5,
  fontSize: 14,
  background: "var(--paper)",
  color: "var(--ink)",
  fontFamily: "var(--font-sans)",
};

function ResetInner() {
  const t = useT();
  const token = useSearchParams().get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError(t("Passwords don't match.", "Mật khẩu không khớp.", "Kata sandi tidak cocok."));
      return;
    }
    setBusy(true);
    const { error } = await resetPassword({ newPassword: password, token });
    setBusy(false);
    if (error) {
      setError(
        error.message ||
          t(
            "This reset link is invalid or has expired.",
            "Liên kết đặt lại không hợp lệ hoặc đã hết hạn.",
            "Tautan reset tidak valid atau kedaluwarsa."
          )
      );
      return;
    }
    setDone(true);
  }

  return (
    <main className="container" style={{ maxWidth: 460, padding: "64px 24px 100px" }}>
      <div className="kicker" style={{ marginBottom: 8 }}>
        {t("Account", "Tài khoản", "Akun")}
      </div>
      <h1
        className="serif"
        style={{ fontSize: 30, fontWeight: 700, margin: "0 0 18px", letterSpacing: "-0.01em" }}
      >
        {t("Set a new password", "Đặt mật khẩu mới", "Atur kata sandi baru")}
      </h1>

      {!token ? (
        <p className="text-mute" style={{ fontSize: 14, lineHeight: 1.6 }}>
          {t(
            "This page needs a valid reset link from your email.",
            "Trang này cần liên kết đặt lại hợp lệ từ email của bạn.",
            "Halaman ini perlu tautan reset yang valid dari email Anda."
          )}
        </p>
      ) : done ? (
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>
          <p style={{ marginBottom: 18 }}>
            {t(
              "Your password has been reset. You can sign in now.",
              "Mật khẩu đã được đặt lại. Bạn có thể đăng nhập ngay.",
              "Kata sandi telah diatur ulang. Anda bisa masuk sekarang."
            )}
          </p>
          <Link href="/" style={{ color: "var(--accent)", fontWeight: 600 }}>
            {t("Back to DailyTechWire →", "Về DailyTechWire →", "Kembali ke DailyTechWire →")}
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          {error && (
            <div
              style={{
                background: "color-mix(in oklab, var(--accent) 12%, transparent)",
                border: "1px solid color-mix(in oklab, var(--accent) 40%, transparent)",
                borderRadius: 6,
                padding: "10px 12px",
                fontSize: 13,
                color: "var(--accent)",
              }}
            >
              {error}
            </div>
          )}
          <input
            type="password"
            required
            minLength={8}
            placeholder={t("New password", "Mật khẩu mới", "Kata sandi baru")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder={t("Confirm new password", "Xác nhận mật khẩu", "Konfirmasi kata sandi")}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={inputStyle}
          />
          <Button variant="accent" size="lg" type="submit" disabled={busy} style={{ width: "100%" }}>
            {busy
              ? t("Please wait…", "Vui lòng đợi…", "Mohon tunggu…")
              : t("Reset password", "Đặt lại mật khẩu", "Atur ulang")}
          </Button>
        </form>
      )}
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetInner />
    </Suspense>
  );
}
