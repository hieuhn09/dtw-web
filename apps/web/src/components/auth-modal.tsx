"use client";

import { Button } from "@dtw/ui";
import { Icon } from "@/components/icons";
import { useT } from "@/lib/i18n";
import { useShell } from "@/lib/shell";

/**
 * Phase 1 stub: a real modal scaffold with magic link + OAuth buttons that
 * fakes a successful login for design exploration. Full Better-Auth integration
 * lands in Phase 2 — see process/context/auth/all-auth.md.
 */
export function AuthModal() {
  const t = useT();
  const { authOpen, closeAuth, setUser } = useShell();

  if (!authOpen) return null;

  const demoLogin = (email: string) => {
    const name = email.split("@")[0]!.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    setUser({ name: name || "Reader", email, role: "Reader" });
    closeAuth();
  };

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
          {t("Sign in", "Đăng nhập", "Masuk")}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            demoLogin(String(fd.get("email") || "reader@example.com"));
          }}
          style={{ display: "grid", gap: 10, marginBottom: 14 }}
        >
          <input
            name="email"
            type="email"
            required
            placeholder="you@company.com"
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1px solid var(--hair-2)",
              borderRadius: 5,
              fontSize: 13,
              background: "var(--paper)",
              color: "var(--ink)",
              fontFamily: "var(--font-sans)",
            }}
          />
          <Button variant="accent" size="lg" type="submit" style={{ width: "100%" }}>
            {t("Send magic link", "Gửi liên kết đăng nhập", "Kirim tautan ajaib")}
          </Button>
        </form>

        <div
          className="text-mute"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 11,
            margin: "16px 0 12px",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "var(--hair)" }} />
          {t("or continue with", "hoặc tiếp tục với", "atau lanjut dengan")}
          <div style={{ flex: 1, height: 1, background: "var(--hair)" }} />
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {(["Google", "Apple", "GitHub"] as const).map((p) => (
            <button
              key={p}
              onClick={() => demoLogin(`${p.toLowerCase()}-user@example.com`)}
              style={{
                padding: "10px 14px",
                border: "1px solid var(--hair-2)",
                background: "transparent",
                borderRadius: 5,
                fontSize: 13,
                color: "var(--ink)",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {t(`Continue with ${p}`, `Tiếp tục với ${p}`, `Lanjut dengan ${p}`)}
            </button>
          ))}
        </div>

        <p className="text-mute" style={{ fontSize: 11, lineHeight: 1.5, marginTop: 16 }}>
          {t(
            "Demo only. No data leaves your browser. Real authentication lands when Better-Auth is wired in.",
            "Demo. Không dữ liệu rời trình duyệt. Đăng nhập thật khi Better-Auth được kết nối.",
            "Demo. Tidak ada data yang dikirim. Autentikasi nyata akan aktif saat Better-Auth diintegrasikan."
          )}
        </p>
      </div>
    </div>
  );
}
