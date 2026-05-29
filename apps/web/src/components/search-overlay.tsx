"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { useT } from "@/lib/i18n";
import { useShell } from "@/lib/shell";
import { ARTICLES } from "@/lib/data";

/** Cmd/Ctrl+K overlay. Phase 1 stub — full Meilisearch wiring later. */
export function SearchOverlay() {
  const t = useT();
  const router = useRouter();
  const { searchOpen, closeSearch } = useShell();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!searchOpen) setQ("");
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeSearch]);

  if (!searchOpen) return null;

  const ql = q.trim().toLowerCase();
  const hits = ql
    ? ARTICLES.filter(
        (a) => a.title.toLowerCase().includes(ql) || a.dek.toLowerCase().includes(ql)
      ).slice(0, 8)
    : [];

  return (
    <div
      onClick={closeSearch}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 70,
        background: "color-mix(in oklab, var(--ink) 60%, transparent)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "12vh",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--hair)",
          borderRadius: 10,
          width: "min(640px, 92vw)",
          boxShadow: "var(--shadow)",
          overflow: "hidden",
        }}
        className="fade-up"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            borderBottom: "1px solid var(--hair)",
          }}
        >
          <Icon name="search" size={16} color="var(--muted)" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                router.push(`/search?q=${encodeURIComponent(q)}`);
                closeSearch();
              }
            }}
            placeholder={t(
              "Search stories, dashboards, awards…",
              "Tìm bài, bảng, giải thưởng…",
              "Cari artikel, dasbor, penghargaan…"
            )}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 16,
              color: "var(--ink)",
              fontFamily: "var(--font-sans)",
            }}
          />
          <kbd
            className="mono"
            style={{
              fontSize: 10,
              color: "var(--muted-2)",
              border: "1px solid var(--hair)",
              borderRadius: 3,
              padding: "2px 6px",
              background: "var(--paper)",
            }}
          >
            esc
          </kbd>
        </div>

        <div style={{ maxHeight: "50vh", overflow: "auto" }}>
          {hits.length === 0 ? (
            <div style={{ padding: 20 }}>
              <div
                className="mono upper text-mute"
                style={{ fontSize: 10, marginBottom: 10, letterSpacing: ".14em" }}
              >
                {t("Trending", "Đang hot", "Sedang tren")}
              </div>
              {ARTICLES.slice(0, 5).map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    router.push(`/article/${a.slug}`);
                    closeSearch();
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 10px",
                    background: "transparent",
                    border: "none",
                    fontSize: 13,
                    color: "var(--ink)",
                    cursor: "pointer",
                    borderRadius: 4,
                  }}
                >
                  {a.title}
                </button>
              ))}
            </div>
          ) : (
            hits.map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  router.push(`/article/${a.slug}`);
                  closeSearch();
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 16px",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--hair)",
                  fontSize: 13,
                  color: "var(--ink)",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{a.title}</div>
                <div className="text-mute" style={{ fontSize: 12, lineHeight: 1.4 }}>
                  {a.dek.slice(0, 130)}…
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
