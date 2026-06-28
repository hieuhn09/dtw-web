"use client";

import { useState, type MouseEventHandler } from "react";
import { Icon, type IconName } from "@/components/icons";
import { useT } from "@/lib/i18n";

interface BtnProps {
  label: string;
  icon: IconName;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  active?: boolean;
}

function Btn({ label, icon, onClick, active }: BtnProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 11px",
        border: "1px solid var(--hair-2)",
        background: active ? "var(--ink)" : "var(--surface)",
        color: active ? "var(--paper)" : "var(--ink)",
        borderRadius: 4,
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      <Icon name={icon} size={13} /> {label}
    </button>
  );
}

export function ShareBar() {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const t = useT();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({ url: window.location.href, title: document.title })
        .catch(() => {});
    } else {
      copyToClipboard();
    }
  };

  const handleEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(document.title)}&body=${encodeURIComponent(window.location.href)}`;
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        justifyContent: "center",
        marginTop: 24,
        paddingTop: 24,
        borderTop: "1px solid var(--hair)",
      }}
    >
      <Btn
        label={saved ? t("Saved", "Đã lưu", "Tersimpan") : t("Save", "Lưu", "Simpan")}
        icon="bookmark"
        onClick={() => setSaved(!saved)}
        active={saved}
      />
      <Btn label={t("Share", "Chia sẻ", "Bagikan")} icon="share" onClick={handleShare} />
      <Btn
        label={copied ? t("Copied!", "Đã sao chép!", "Tersalin!") : t("Copy link", "Sao chép liên kết", "Salin tautan")}
        icon="external"
        onClick={copyToClipboard}
        active={copied}
      />
      <Btn label={t("Email", "Email", "Email")} icon="mail" onClick={handleEmail} />
    </div>
  );
}
