"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { useT } from "@/lib/i18n";
import { useShell } from "@/lib/shell";
import { runSearch } from "@/app/(reader)/search/search-action";
import type { ArticleView } from "@/lib/article-view";

const SUGGESTED = ["sovereign AI", "VNG", "TSMC", "datacenter", "open weights"];

/** Cmd/Ctrl+K overlay — DB-backed search via the runSearch server action. */
export function SearchOverlay() {
  const t = useT();
  const router = useRouter();
  const { searchOpen, closeSearch } = useShell();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<ReadonlyArray<ArticleView>>([]);

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

  useEffect(() => {
    const ql = q.trim();
    if (!ql) {
      setHits([]);
      return;
    }
    const id = setTimeout(() => {
      runSearch(ql)
        .then((r) => setHits(r.slice(0, 8)))
        .catch(() => setHits([]));
    }, 200);
    return () => clearTimeout(id);
  }, [q]);

  if (!searchOpen) return null;

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
              "Search published stories…",
              "Tìm bài đã đăng…",
              "Cari artikel terbit…"
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
          {q.trim() === "" ? (
            <div style={{ padding: 20 }}>
              <div
                className="mono upper text-mute"
                style={{ fontSize: 10, marginBottom: 10, letterSpacing: ".14em" }}
              >
                {t("Try searching", "Thử tìm", "Coba cari")}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQ(s)}
                    className="pill"
                    style={{ cursor: "pointer", border: "1px solid var(--hair-2)" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : hits.length === 0 ? (
            <div className="text-mute" style={{ padding: 20, fontSize: 13 }}>
              {t("No results yet…", "Chưa có kết quả…", "Belum ada hasil…")}
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
