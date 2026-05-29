"use client";

import { useState, type MouseEventHandler } from "react";
import { Icon, type IconName } from "@/components/icons";

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
        label={saved ? "Saved" : "Save"}
        icon="bookmark"
        onClick={() => setSaved(!saved)}
        active={saved}
      />
      <Btn label="Share" icon="share" />
      <Btn label="Copy link" icon="external" />
      <Btn label="Email" icon="mail" />
    </div>
  );
}
