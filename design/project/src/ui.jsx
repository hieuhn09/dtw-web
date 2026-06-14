// Shared UI primitives
const { useState, useEffect, useRef, useMemo, useCallback } = React;

function fmtTimeAgo(iso) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return Math.floor(diff) + "s ago";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}
function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function pillarOf(id) {return PILLARS.find((p) => p.id === id) || PILLARS[0];}
function authorOf(id) {return AUTHORS[id] || { name: "Staff", role: "DTW" };}

function PillarTag({ id, size = "sm", onClick }) {
  const p = pillarOf(id);
  const fs = size === "sm" ? 10 : 11;
  const { lang } = useLang();
  const label = localizedPillarLabel(id, lang);
  return (
    <a onClick={onClick} className="upper" style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: fs, fontWeight: 600, letterSpacing: ".12em",
      color: p.color, cursor: "pointer"
    }}>
      <span style={{ width: 6, height: 6, background: p.color, display: "inline-block" }} />
      {label}
    </a>);

}

function ByLine({ article, size = "sm" }) {
  const a = authorOf(article.author);
  const co = (article.coAuthors || []).map(authorOf);
  const fs = size === "lg" ? 13 : 12;
  const t = useT();
  const { lang } = useLang();
  return (
    <div className="text-mute" style={{ fontSize: fs }}>
      {t("By", "Bởi", "Oleh")} <span style={{ fontWeight: "400", color: "var(--muted)" }}>{a.name}</span>
      {co.length > 0 && <> {t("and", "và", "dan")} {co.map((c) => c.name).join(" & ")}</>}
      <span style={{ margin: "0 8px", color: "var(--hair-2)" }}>·</span>
      <span className="mono">{fmtDateL(article.published, lang)}</span>
      <span style={{ margin: "0 8px", color: "var(--hair-2)" }}>·</span>
      <span>{article.readMin} {t("min read", "phút đọc", "menit baca")}</span>
    </div>);

}

function Placeholder({ label, height = 240, style = {}, dark = false }) {
  return (
    <div className="ph" data-label={label} style={{ height, ...style }} />);

}

// Mini sparkline svg
function Spark({ values, color = "var(--up)", width = 60, height = 18 }) {
  const min = Math.min(...values),max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = i / (values.length - 1) * width;
    const y = height - (v - min) / span * height;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{ verticalAlign: "middle" }}>
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} />
    </svg>);

}

function ArrowUpDown({ chg }) {
  if (chg == null) return <span className="text-mute-2 mono">–</span>;
  const up = chg >= 0;
  const color = up ? "var(--up)" : "var(--down)";
  return (
    <span className="mono" style={{ color, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span style={{ display: "inline-block", transform: up ? "rotate(0deg)" : "rotate(180deg)" }}>▲</span>
      {up ? "+" : ""}{chg.toFixed(2)}%
    </span>);

}

function DisclosureBox({ kind = "sponsored", sponsor, position = "top" }) {
  const isAI = kind === "ai";
  const t = useT();
  const bg = isAI ? "var(--surface-2)" : "var(--sponsored)";
  const border = isAI ? "var(--hair-2)" : "#E0B900";
  const icon = isAI ? "AI" : "$";
  const title = isAI
    ? t("AI-assisted reporting", "Đưa tin có hỗ trợ AI", "Pelaporan dibantu AI")
    : `${t("Paid Partner", "Đối tác trả phí", "Mitra Berbayar")}${sponsor ? ` · ${sponsor}` : ""}`;
  const body = isAI ?
  t("This article uses AI tools for translation or transcription. All facts were verified, and all writing was done by a human reporter.",
    "Bài viết này dùng công cụ AI để dịch hoặc gỡ băng. Mọi dữ kiện đã được kiểm chứng, và toàn bộ phần viết do phóng viên là người thật thực hiện.",
    "Artikel ini menggunakan alat AI untuk terjemahan atau transkripsi. Semua fakta diverifikasi, dan seluruh tulisan dikerjakan oleh reporter manusia.") :
  t("This is a sponsored feature produced by DTW Studio for the partner above. The DTW newsroom was not involved in writing or editing.",
    "Đây là bài tài trợ do DTW Studio sản xuất cho đối tác phía trên. Toà soạn DTW không tham gia viết hay biên tập.",
    "Ini adalah fitur bersponsor yang diproduksi DTW Studio untuk mitra di atas. Ruang redaksi DTW tidak terlibat dalam penulisan atau penyuntingan.");
  return (
    <div style={{
      background: bg, border: `1px solid ${border}`,
      padding: "12px 14px", borderRadius: 6,
      display: "flex", gap: 12, alignItems: "flex-start",
      margin: "20px 0"
    }}>
      <div className="mono" style={{
        width: 24, height: 24, borderRadius: 4,
        background: "var(--ink)", color: "var(--paper)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 600, flexShrink: 0
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div className="upper" style={{ fontSize: 10, letterSpacing: ".14em", fontWeight: 600, marginBottom: 4, color: "var(--ink)" }}>
          {title} {position !== "top" && <span className="text-mute" style={{ fontWeight: 400, letterSpacing: ".06em", textTransform: "none", marginLeft: 6 }}>· reminder ({position})</span>}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ink-2)" }}>{body}</div>
      </div>
    </div>);

}

function Button({ children, variant = "primary", size = "md", onClick, style = {}, type = "button" }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    fontFamily: "var(--font-sans)", fontWeight: 500,
    border: "1px solid transparent", cursor: "pointer",
    transition: "background .15s, color .15s, border-color .15s"
  };
  const sizes = {
    sm: { fontSize: 12, padding: "6px 10px", borderRadius: 4 },
    md: { fontSize: 13, padding: "9px 14px", borderRadius: 5 },
    lg: { fontSize: 14, padding: "12px 18px", borderRadius: 6 }
  };
  const variants = {
    primary: { background: "var(--brand-navy)", color: "var(--paper)", borderColor: "var(--brand-navy)" },
    accent: { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" },
    outline: { background: "transparent", color: "var(--ink)", borderColor: "var(--hair-2)" },
    ghost: { background: "transparent", color: "var(--ink)" }
  };
  return (
    <button type={type} onClick={onClick} data-glow={variant === "accent" ? "1" : "0"}
    style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>
      {children}
    </button>);

}

function Skeleton({ w = "100%", h = 16, style = {} }) {
  return <div style={{ width: w, height: h, background: "var(--surface-2)", borderRadius: 4, ...style }} />;
}

Object.assign(window, {
  fmtTimeAgo, fmtDate, pillarOf, authorOf,
  PillarTag, ByLine, Placeholder, Spark, ArrowUpDown,
  DisclosureBox, Button, Skeleton
});