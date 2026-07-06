"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { Button } from "@dtw/ui";
import { authCallbackUrl, authClient } from "@/lib/auth-client";
import { useT } from "@/lib/i18n";

/**
 * Settings tab — real changeEmail / changePassword / deleteUser, ported from
 * brief-asia-web's `SettingsTab` (`src/components/account/account-tabs.tsx`
 * lines 400–514) with these deviations:
 *   - no hardcoded `/en/...` paths — `authCallbackUrl()` centralizes the
 *     (currently plain) callback path.
 *   - delete-account confirmation is a type-to-confirm text field (not a
 *     bare `window.confirm`) + an optional current-password field, since
 *     Better-Auth's `deleteUser` accepts a password to bypass the session
 *     "freshness" requirement (`sessionConfig.freshAge`, 24h default) — see
 *     the inline comment on `submitDelete` below. Every string is
 *     `t(en, vi, id)`, per the GDPR/PDPA copy requirement.
 *   - Google/GitHub-only accounts have no password to change or confirm
 *     deletion with; both flows catch Better-Auth's
 *     `CREDENTIAL_ACCOUNT_NOT_FOUND` error and show a graceful message
 *     instead of crashing — a documented known limitation, not a blocker
 *     (see the account feature's durable report).
 */

type MsgKind = "ok" | "error";
interface Msg {
  kind: MsgKind;
  text: string;
}

const DELETE_CONFIRM_WORD = "DELETE";

const inputStyle: CSSProperties = {
  padding: "10px 12px",
  border: "1px solid var(--hair-2)",
  borderRadius: 5,
  fontSize: 13,
  background: "var(--paper)",
  color: "var(--ink)",
  fontFamily: "var(--font-sans)",
};

const cardStyle: CSSProperties = {
  border: "1px solid var(--hair)",
  borderRadius: 8,
  padding: 18,
  marginBottom: 16,
  background: "var(--surface)",
};

function MsgBanner({ msg }: { msg: Msg }) {
  const ok = msg.kind === "ok";
  return (
    <div
      style={{
        marginBottom: 16,
        padding: "10px 12px",
        borderRadius: 6,
        fontSize: 13,
        color: ok ? "var(--ink)" : "var(--down)",
        background: ok
          ? "color-mix(in oklab, var(--up) 12%, transparent)"
          : "color-mix(in oklab, var(--down) 12%, transparent)",
        border: `1px solid ${
          ok
            ? "color-mix(in oklab, var(--up) 40%, transparent)"
            : "color-mix(in oklab, var(--down) 40%, transparent)"
        }`,
      }}
    >
      {msg.text}
    </div>
  );
}

export function SettingsTab({ email }: { email: string }) {
  const t = useT();

  const genericError = t(
    "Something went wrong. Please try again.",
    "Đã có lỗi xảy ra. Vui lòng thử lại.",
    "Terjadi kesalahan. Silakan coba lagi."
  );
  const noPasswordAccount = t(
    "This account signed in with Google or GitHub and has no password set — password changes and password-confirmed deletion aren't available for it yet. Contact support if you need to delete this account.",
    "Tài khoản này đăng nhập bằng Google hoặc GitHub và chưa có mật khẩu — chưa hỗ trợ đổi mật khẩu hoặc xoá tài khoản bằng mật khẩu. Liên hệ hỗ trợ nếu bạn cần xoá tài khoản này.",
    "Akun ini masuk lewat Google atau GitHub dan belum punya kata sandi — ubah kata sandi atau hapus akun dengan kata sandi belum tersedia. Hubungi dukungan jika perlu menghapus akun ini."
  );

  // ---- Change email ----
  const [newEmail, setNewEmail] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailMsg, setEmailMsg] = useState<Msg | null>(null);

  async function submitEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailBusy(true);
    setEmailMsg(null);
    const target = newEmail;
    const { error } = await authClient.changeEmail({
      newEmail: target,
      callbackURL: authCallbackUrl("/account/settings"),
    });
    setEmailBusy(false);
    if (error) {
      setEmailMsg({ kind: "error", text: error.message || genericError });
      return;
    }
    setEmailMsg({
      kind: "ok",
      text: t(
        `Check ${target} to confirm the change. Your account keeps using the current email until you click the link.`,
        `Kiểm tra ${target} để xác nhận thay đổi. Tài khoản vẫn dùng email hiện tại cho đến khi bạn bấm vào liên kết.`,
        `Cek ${target} untuk konfirmasi perubahan. Akun tetap memakai email saat ini sampai Anda mengklik tautannya.`
      ),
    });
    setNewEmail("");
  }

  // ---- Change password ----
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<Msg | null>(null);

  async function submitPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordBusy(true);
    setPasswordMsg(null);
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setPasswordBusy(false);
    if (error) {
      const text = error.code === "CREDENTIAL_ACCOUNT_NOT_FOUND" ? noPasswordAccount : error.message || genericError;
      setPasswordMsg({ kind: "error", text });
      return;
    }
    setPasswordMsg({
      kind: "ok",
      text: t(
        "Password updated. Your other sessions were signed out.",
        "Đã đổi mật khẩu. Các phiên đăng nhập khác đã bị đăng xuất.",
        "Kata sandi diperbarui. Sesi lain telah keluar."
      ),
    });
    setCurrentPassword("");
    setNewPassword("");
  }

  // ---- Delete account ----
  const [confirmWord, setConfirmWord] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState<Msg | null>(null);
  const canDelete = confirmWord.trim().toUpperCase() === DELETE_CONFIRM_WORD && !deleteBusy;

  async function submitDelete(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canDelete) return;
    setDeleteBusy(true);
    setDeleteMsg(null);
    // Better-Auth's `deleteUser` accepts an optional `password`. Sending one
    // verifies it against the account's credential (email+password) row and
    // deletes immediately, regardless of session age. Omitting it falls back
    // to Better-Auth's session-freshness check (`sessionConfig.freshAge`,
    // defaults to 24h) — fine for a just-signed-in reader, but throws
    // `SESSION_EXPIRED` for an older session. Since email+password is this
    // app's primary auth method, we ask for the password up front; a
    // Google/GitHub-only account has no password to send and will surface
    // `CREDENTIAL_ACCOUNT_NOT_FOUND` below (documented known limitation).
    const { error } = await authClient.deleteUser(
      deletePassword ? { password: deletePassword } : {}
    );
    if (error) {
      setDeleteBusy(false);
      const text =
        error.code === "CREDENTIAL_ACCOUNT_NOT_FOUND"
          ? noPasswordAccount
          : error.code === "INVALID_PASSWORD"
            ? t("Incorrect password.", "Sai mật khẩu.", "Kata sandi salah.")
            : error.code === "SESSION_EXPIRED"
              ? t(
                  "For your security, please enter your password above, or sign out and back in, then try again.",
                  "Để bảo mật, vui lòng nhập mật khẩu ở trên, hoặc đăng xuất rồi đăng nhập lại và thử lại.",
                  "Demi keamanan, masukkan kata sandi di atas, atau keluar dan masuk lagi, lalu coba lagi."
                )
              : error.message || genericError;
      setDeleteMsg({ kind: "error", text });
      return;
    }
    // Session cookie is already cleared server-side. Full reload so every
    // client component (ShellProvider's session, etc.) re-reads a signed-out
    // state instead of holding stale in-memory data.
    window.location.href = "/";
  }

  return (
    <section style={{ maxWidth: 520 }}>
      <h2
        className="serif"
        style={{ margin: "0 0 18px", fontSize: 24, fontWeight: 650, letterSpacing: "-0.015em" }}
      >
        {t("Settings", "Cài đặt", "Pengaturan")}
      </h2>

      <form onSubmit={submitPassword} style={cardStyle}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
          {t("Change password", "Đổi mật khẩu", "Ubah kata sandi")}
        </div>
        {passwordMsg && <MsgBanner msg={passwordMsg} />}
        <div style={{ display: "grid", gap: 8 }}>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={t("Current password", "Mật khẩu hiện tại", "Kata sandi saat ini")}
            style={inputStyle}
          />
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t("New password", "Mật khẩu mới", "Kata sandi baru")}
            style={inputStyle}
          />
          <Button variant="outline" size="sm" type="submit" disabled={passwordBusy}>
            {passwordBusy ? "…" : t("Update password", "Cập nhật mật khẩu", "Perbarui kata sandi")}
          </Button>
        </div>
      </form>

      <form onSubmit={submitEmail} style={cardStyle}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
          {t("Change email", "Đổi email", "Ubah email")}
        </div>
        {emailMsg && <MsgBanner msg={emailMsg} />}
        <div className="text-mute" style={{ fontSize: 12, marginBottom: 8 }}>
          {t("Current", "Hiện tại", "Saat ini")}: <span className="mono">{email}</span>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          <input
            type="email"
            required
            autoComplete="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder={t("New email", "Email mới", "Email baru")}
            style={inputStyle}
          />
          <Button variant="outline" size="sm" type="submit" disabled={emailBusy}>
            {emailBusy ? "…" : t("Update email", "Cập nhật email", "Perbarui email")}
          </Button>
        </div>
      </form>

      <form
        onSubmit={submitDelete}
        style={{ ...cardStyle, borderColor: "color-mix(in oklab, var(--down) 40%, var(--hair))" }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: "var(--down)" }}>
          {t("Delete account", "Xoá tài khoản", "Hapus akun")}
        </div>
        <div className="text-mute" style={{ fontSize: 12, marginBottom: 12 }}>
          {t(
            "Permanently removes your account, saved articles, reading history, and followed pillars. Your newsletter subscription email is kept (unlinked from your account) unless you unsubscribe separately. This cannot be undone.",
            "Xoá vĩnh viễn tài khoản, bài đã lưu, lịch sử đọc và chuyên mục đang theo dõi. Email đăng ký bản tin vẫn được giữ (gỡ liên kết khỏi tài khoản) trừ khi bạn huỷ đăng ký riêng. Không thể hoàn tác.",
            "Menghapus akun, artikel tersimpan, riwayat baca, dan pilar yang diikuti secara permanen. Email langganan newsletter tetap disimpan (dilepas dari akun) kecuali Anda berhenti berlangganan terpisah. Tindakan ini tidak bisa dibatalkan."
          )}
        </div>
        {deleteMsg && <MsgBanner msg={deleteMsg} />}
        <div style={{ display: "grid", gap: 8 }}>
          <input
            type="password"
            autoComplete="current-password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder={t(
              "Current password (required unless you just signed in)",
              "Mật khẩu hiện tại (bắt buộc trừ khi bạn vừa đăng nhập)",
              "Kata sandi saat ini (wajib kecuali baru saja masuk)"
            )}
            style={inputStyle}
          />
          <input
            type="text"
            value={confirmWord}
            onChange={(e) => setConfirmWord(e.target.value)}
            placeholder={t(
              `Type ${DELETE_CONFIRM_WORD} to confirm`,
              `Gõ ${DELETE_CONFIRM_WORD} để xác nhận`,
              `Ketik ${DELETE_CONFIRM_WORD} untuk konfirmasi`
            )}
            style={inputStyle}
            aria-label={t(
              `Type ${DELETE_CONFIRM_WORD} to confirm account deletion`,
              `Gõ ${DELETE_CONFIRM_WORD} để xác nhận xoá tài khoản`,
              `Ketik ${DELETE_CONFIRM_WORD} untuk konfirmasi penghapusan akun`
            )}
          />
          <Button variant="accent" size="sm" type="submit" disabled={!canDelete}>
            {deleteBusy
              ? "…"
              : t("Permanently delete my account", "Xoá vĩnh viễn tài khoản của tôi", "Hapus akun saya secara permanen")}
          </Button>
        </div>
      </form>
    </section>
  );
}
