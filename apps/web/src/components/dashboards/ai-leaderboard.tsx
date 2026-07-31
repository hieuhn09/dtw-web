"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { GridBackdrop } from "@/components/effects";
import type { AiLeaderboardRow } from "@/lib/data";
import { fmtDateUTC, useLang, useT } from "@/lib/i18n";
import type { ArticleView } from "@/lib/article-view";

type SortKey = keyof AiLeaderboardRow;
type SortDir = "asc" | "desc";
type TFn = (en: string, vi?: string, id?: string) => string;

const SCORE_KEYS = ["general", "reasoning", "coding", "math", "search", "vision"] as const;
type ScoreKey = (typeof SCORE_KEYS)[number];

/** Header-click default sort direction per column — mirrors the owner-approved
 *  visual reference (`demos/ai-leaderboard-table-preview.html`): rank/model/
 *  price columns default ascending, everything else (score columns +
 *  released) defaults descending. */
const ASC_DEFAULT_KEYS: ReadonlySet<SortKey> = new Set<SortKey>([
  "rank",
  "model",
  "inputPrice",
  "outputPrice",
]);

function defaultDirFor(k: SortKey): SortDir {
  return ASC_DEFAULT_KEYS.has(k) ? "asc" : "desc";
}

interface ThProps {
  k: SortKey;
  num?: boolean;
  children: ReactNode;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
}

/**
 * AD-11 — a real `<button type="button">` inside the `<th>`, not a manual
 * `tabIndex`/`onKeyDown` shim on the `<th>` itself. `aria-sort` stays on the
 * `<th>`, matching the WAI-ARIA sortable-table pattern.
 */
function Th({ k, num, children, sortKey, sortDir, onSort }: ThProps) {
  const active = sortKey === k;
  return (
    <th
      scope="col"
      aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
      style={{
        padding: 0,
        borderBottom: "1px solid var(--hair-2)",
        background: "var(--surface)",
      }}
    >
      <button
        type="button"
        onClick={() => onSort(k)}
        className="upper"
        style={{
          display: "block",
          width: "100%",
          boxSizing: "border-box",
          cursor: "pointer",
          background: "none",
          border: "none",
          margin: 0,
          font: "inherit",
          fontFamily: "var(--font-sans)",
          fontSize: 10,
          fontWeight: 600,
          color: active ? "var(--ink)" : "var(--muted)",
          padding: "10px 12px",
          textAlign: num ? "right" : "left",
          whiteSpace: "nowrap",
        }}
      >
        {children}
        {active && (
          <span style={{ color: "var(--accent)", marginInlineStart: 4 }}>
            {sortDir === "asc" ? "▲" : "▼"}
          </span>
        )}
      </button>
    </th>
  );
}

/**
 * Score-column gauge. `v == null` renders a plain "–" (no track/fill — the
 * model fell outside that category's top-50). Otherwise a single-hue
 * `var(--bar)` fill, normalized against `max` (the leading value in that
 * column across all rows), plus the raw 1-decimal value. `role="img"` +
 * `aria-label` carry the raw value only (amended 2026-07-30, 2nd — no
 * dimension-name prefix, matching the visual reference).
 */
function Bar({ v, max }: { v: number | null; max: number }) {
  if (v == null) {
    return (
      <span className="mono" style={{ color: "var(--muted-2)" }}>
        –
      </span>
    );
  }
  const pct = Math.max(0, Math.min(100, (v / max) * 100));
  return (
    <div
      role="img"
      aria-label={v.toFixed(1)}
      style={{ display: "flex", alignItems: "center", gap: 7 }}
    >
      <span
        style={{
          display: "inline-block",
          flex: "none",
          width: 56,
          height: 6,
          borderRadius: 99,
          background: "var(--surface-2)",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            display: "block",
            height: "100%",
            borderRadius: 99,
            width: `${pct}%`,
            background: "var(--bar)",
          }}
        />
      </span>
      <span className="mono tnum" style={{ fontSize: 12, width: 34, textAlign: "right" }}>
        {v.toFixed(1)}
      </span>
    </div>
  );
}

/** `null` → "–"; `0` → translated "free"; otherwise "$X.XX" (2 decimals). */
function priceCell(v: number | null, t: TFn): ReactNode {
  if (v == null) {
    return (
      <span className="mono" style={{ color: "var(--muted-2)" }}>
        –
      </span>
    );
  }
  if (v === 0) return t("free", "miễn phí", "gratis");
  return "$" + v.toFixed(2);
}

function optimizeLabel(k: ScoreKey | "inputPrice", t: TFn): string {
  switch (k) {
    case "general":
      return t("General", "Tổng quát", "Umum");
    case "reasoning":
      return t("Reasoning", "Suy luận", "Penalaran");
    case "coding":
      return t("Coding", "Lập trình", "Pemrograman");
    case "math":
      return t("Math", "Toán", "Matematika");
    case "search":
      return t("Search", "Tìm kiếm", "Pencarian");
    case "vision":
      return t("Vision", "Thị giác", "Visi");
    case "inputPrice":
      return t("Price (low)", "Giá (thấp)", "Harga (rendah)");
  }
}

const OPTIMIZE: ReadonlyArray<readonly [ScoreKey | "inputPrice", SortDir]> = [
  ["general", "desc"],
  ["reasoning", "desc"],
  ["coding", "desc"],
  ["math", "desc"],
  ["search", "desc"],
  ["vision", "desc"],
  ["inputPrice", "asc"],
];

export interface AILeaderboardProps {
  rows: AiLeaderboardRow[];
  asOfScores: string | null;
  methodology: { en: string; vi?: string; id?: string };
  sponsor: ArticleView | null;
}

export function AILeaderboard({ rows, asOfScores, methodology, sponsor }: AILeaderboardProps) {
  const t = useT();
  const { lang } = useLang();
  const [sortKey, setSortKey] = useState<SortKey>("general");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const onSort = (k: SortKey) => {
    if (sortKey === k) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      setSortDir(defaultDirFor(k));
    }
  };

  // Per-column leader value for the score-column bar gauges, computed once
  // over the `rows` prop (not the locally re-sorted view — values don't
  // change under sorting, so this is equivalent either way).
  const colMax = useMemo(() => {
    const m = {} as Record<ScoreKey, number>;
    for (const k of SCORE_KEYS) {
      const values = rows.map((r) => r[k]).filter((v): v is number => v != null);
      m[k] = values.length ? Math.max(...values, 1) : 1;
    }
    return m;
  }, [rows]);

  const sorted = useMemo(() => {
    const get = (r: AiLeaderboardRow): string | number | null => {
      if (sortKey === "model") return r.model;
      if (sortKey === "released") return r.released ?? "";
      return r[sortKey];
    };
    return [...rows].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      if (typeof va === "string" || typeof vb === "string") {
        return String(va).localeCompare(String(vb)) * (sortDir === "asc" ? 1 : -1);
      }
      if (va == null) return 1;
      if (vb == null) return -1;
      return (va - vb) * (sortDir === "asc" ? 1 : -1);
    });
  }, [rows, sortKey, sortDir]);

  const asOfLabel = asOfScores ? fmtDateUTC(asOfScores, lang) : "—";

  return (
    <section>
      <header
        style={{
          borderBottom: "3px solid var(--brand-navy)",
          paddingBottom: 20,
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <GridBackdrop
          color="color-mix(in oklab, var(--ink) 6%, transparent)"
          size={32}
          fadeRadius="60%"
        />
        <div style={{ position: "relative" }}>
          <div className="kicker" style={{ marginBottom: 6 }}>
            {t("Data Desk · Preview", "Ban Dữ liệu · Bản xem trước", "Meja Data · Pratinjau")}
          </div>
          <h1
            className="serif"
            style={{
              margin: 0,
              fontSize: "clamp(30px, 8vw, 48px)",
              fontWeight: 650,
              letterSpacing: "-0.025em",
              lineHeight: 1,
            }}
          >
            {t("AI Leaderboard", "Bảng xếp hạng AI", "Papan Peringkat AI")}
          </h1>
        </div>
      </header>

      <p className="mono text-mute" style={{ fontSize: 11.5, margin: "0 0 12px" }}>
        {t(
          `Sort by what you actually use the model for · Scores via LLM Stats, as of ${asOfLabel}`,
          `Sắp xếp theo nhu cầu sử dụng thực tế · Điểm số từ LLM Stats, cập nhật ${asOfLabel}`,
          `Urutkan sesuai kebutuhan penggunaan Anda · Skor via LLM Stats, per ${asOfLabel}`
        )}
      </p>

      <div
        role="group"
        aria-label={t("Optimize for", "Tối ưu cho", "Optimalkan untuk")}
        style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 14 }}
      >
        <span className="text-mute" style={{ fontSize: 12 }}>
          {t("Optimize for:", "Tối ưu cho:", "Optimalkan untuk:")}
        </span>
        {OPTIMIZE.map(([k, dir]) => {
          const pressed = sortKey === k && sortDir === dir;
          return (
            <button
              key={k}
              type="button"
              aria-pressed={pressed}
              onClick={() => {
                setSortKey(k);
                setSortDir(dir);
              }}
              style={{
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "var(--font-sans)",
                background: pressed ? "var(--ink)" : "transparent",
                color: pressed ? "var(--paper)" : "var(--ink-2)",
                border: "1px solid var(--hair-2)",
                borderRadius: 99,
                cursor: "pointer",
              }}
            >
              {optimizeLabel(k, t)}
            </button>
          );
        })}
      </div>

      <div
        style={{
          border: "1px solid var(--hair)",
          borderRadius: 8,
          overflow: "hidden",
          background: "var(--surface)",
        }}
      >
        <div className="r-table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <Th k="rank" num sortKey={sortKey} sortDir={sortDir} onSort={onSort}>
                  #
                </Th>
                <Th k="model" sortKey={sortKey} sortDir={sortDir} onSort={onSort}>
                  {t("Model", "Mô hình", "Model")}
                </Th>
                <Th k="general" sortKey={sortKey} sortDir={sortDir} onSort={onSort}>
                  {t("General", "Tổng quát", "Umum")}
                </Th>
                <Th k="reasoning" sortKey={sortKey} sortDir={sortDir} onSort={onSort}>
                  {t("Reasoning", "Suy luận", "Penalaran")}
                </Th>
                <Th k="coding" sortKey={sortKey} sortDir={sortDir} onSort={onSort}>
                  {t("Coding", "Lập trình", "Pemrograman")}
                </Th>
                <Th k="math" sortKey={sortKey} sortDir={sortDir} onSort={onSort}>
                  {t("Math", "Toán", "Matematika")}
                </Th>
                <Th k="search" sortKey={sortKey} sortDir={sortDir} onSort={onSort}>
                  {t("Search", "Tìm kiếm", "Pencarian")}
                </Th>
                <Th k="vision" sortKey={sortKey} sortDir={sortDir} onSort={onSort}>
                  {t("Vision", "Thị giác", "Visi")}
                </Th>
                <Th k="inputPrice" num sortKey={sortKey} sortDir={sortDir} onSort={onSort}>
                  {t("Input $/M", "Input $/Tr", "Input $/Jt")}
                </Th>
                <Th k="outputPrice" num sortKey={sortKey} sortDir={sortDir} onSort={onSort}>
                  {t("Output $/M", "Output $/Tr", "Output $/Jt")}
                </Th>
                <Th k="released" num sortKey={sortKey} sortDir={sortDir} onSort={onSort}>
                  {t("Released", "Phát hành", "Rilis")}
                </Th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((m, i) => (
                <tr
                  key={m.model}
                  style={{
                    borderBottom: "1px solid var(--hair)",
                    background: i % 2 === 0 ? "transparent" : "color-mix(in oklab, var(--ink) 2%, transparent)",
                  }}
                >
                  <td
                    className="mono"
                    style={{ padding: "12px 10px", fontSize: 12, color: "var(--muted)", textAlign: "right", width: 40 }}
                  >
                    {i + 1}
                  </td>
                  <td style={{ padding: "12px 10px", whiteSpace: "nowrap" }}>
                    <div className="serif" style={{ fontWeight: 600, fontSize: 14 }}>
                      {m.model}
                    </div>
                    <div className="text-mute-2" style={{ fontSize: 11.5, marginTop: 1 }}>
                      {m.maker}
                    </div>
                  </td>
                  <td style={{ padding: "12px 10px" }}>
                    <Bar v={m.general} max={colMax.general} />
                  </td>
                  <td style={{ padding: "12px 10px" }}>
                    <Bar v={m.reasoning} max={colMax.reasoning} />
                  </td>
                  <td style={{ padding: "12px 10px" }}>
                    <Bar v={m.coding} max={colMax.coding} />
                  </td>
                  <td style={{ padding: "12px 10px" }}>
                    <Bar v={m.math} max={colMax.math} />
                  </td>
                  <td style={{ padding: "12px 10px" }}>
                    <Bar v={m.search} max={colMax.search} />
                  </td>
                  <td style={{ padding: "12px 10px" }}>
                    <Bar v={m.vision} max={colMax.vision} />
                  </td>
                  <td
                    className="mono tnum"
                    style={{ padding: "12px 10px", textAlign: "right", fontSize: 12.5 }}
                  >
                    {priceCell(m.inputPrice, t)}
                  </td>
                  <td
                    className="mono tnum"
                    style={{ padding: "12px 10px", textAlign: "right", fontSize: 12.5 }}
                  >
                    {priceCell(m.outputPrice, t)}
                  </td>
                  <td
                    className="mono tnum"
                    style={{ padding: "12px 10px", textAlign: "right", fontSize: 12.5 }}
                  >
                    {m.released ? (
                      fmtDateUTC(m.released, lang)
                    ) : (
                      <span style={{ color: "var(--muted-2)" }}>–</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ fontSize: 12, color: "var(--muted)", margin: "12px 2px 0" }}>
        <a
          href="https://llm-stats.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--accent-ink)", fontWeight: 600, textDecoration: "none" }}
        >
          {t(
            "Model scores & pricing: LLM Stats",
            "Điểm mô hình & giá: LLM Stats",
            "Skor model & harga: LLM Stats"
          )}
        </a>
      </p>

      <div className="r-split-21" style={{ marginTop: 48, display: "grid", gap: 24 }}>
        <div style={{ padding: 24, background: "var(--surface)", border: "1px solid var(--hair)", borderRadius: 8 }}>
          <div className="kicker" style={{ marginBottom: 8 }}>
            {t("Methodology", "Phương pháp", "Metodologi")}
          </div>
          <p style={{ margin: "0 0 8px", fontSize: 13, lineHeight: 1.55, color: "var(--ink-2)" }}>
            {t(methodology.en, methodology.vi, methodology.id)}
          </p>
          <p className="mono text-mute-2" style={{ margin: 0, fontSize: 11 }}>
            {t(
              "For informational purposes only · not investment or procurement advice",
              "Chỉ nhằm mục đích thông tin · không phải tư vấn đầu tư hay mua sắm",
              "Hanya untuk tujuan informasi · bukan saran investasi atau pengadaan"
            )}
          </p>
        </div>

        {sponsor && (
          <div
            style={{
              padding: 24,
              background: "var(--sponsored)",
              border: "1px solid var(--sponsored-border)",
              borderRadius: 8,
            }}
          >
            <div
              className="mono upper"
              style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".14em", color: "var(--ink)", marginBottom: 8 }}
            >
              {t("Sponsor slot · this dashboard", "Vị trí tài trợ · bảng này", "Slot sponsor · dasbor ini")}
            </div>
            <Link
              href={`/article/${sponsor.slug}`}
              className="serif"
              style={{ display: "block", fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}
            >
              {t("Brought to you by", "Được tài trợ bởi", "Dipersembahkan oleh")} {sponsor.sponsor ?? sponsor.title}
            </Link>
            <p style={{ fontSize: 12, color: "color-mix(in oklab, var(--ink) 75%, transparent)", margin: 0 }}>
              {t(
                "Sponsorship does not influence the data or methodology.",
                "Việc tài trợ không ảnh hưởng đến dữ liệu hay phương pháp.",
                "Sponsor tidak memengaruhi data atau metodologi."
              )}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
