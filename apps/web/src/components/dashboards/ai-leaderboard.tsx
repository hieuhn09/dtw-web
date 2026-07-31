"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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

/** Rank column always pins flush to the scroll edge. The Model column pins
 *  right after it — but table auto-layout doesn't reliably honor a fixed
 *  pixel `width` hint on the rank cells (verified: a `width: 40` hint
 *  rendered at ~31px in practice), so a hardcoded offset here would leave a
 *  gap that scrolled columns bleed through. The Model column's offset is
 *  measured live off the rank header cell instead — see `rankThRef` below. */
const STICKY_RANK_LEFT = 0;

/** Solid (non-translucent) equivalent of the row zebra tint, for the two
 *  sticky columns — a translucent background would let horizontally-
 *  scrolling columns show through underneath the pinned cells. */
function stickyRowBg(i: number): string {
  return i % 2 === 0 ? "var(--surface)" : "color-mix(in oklab, var(--ink) 2%, var(--surface))";
}

interface ThProps {
  k: SortKey;
  num?: boolean;
  children: ReactNode;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
  stickyLeft?: number;
  stickyBorder?: boolean;
  cellRef?: React.Ref<HTMLTableCellElement>;
  /** Translated one-line tooltip shown via a small ⓘ after the label. Renders
   *  as a plain `<span>` sibling of the sort `<button>` (not nested inside
   *  it), so hovering/clicking it never triggers a sort. */
  info?: string;
}

/**
 * AD-11 — a real `<button type="button">` inside the `<th>`, not a manual
 * `tabIndex`/`onKeyDown` shim on the `<th>` itself. `aria-sort` stays on the
 * `<th>`, matching the WAI-ARIA sortable-table pattern.
 */
function Th({
  k,
  num,
  children,
  sortKey,
  sortDir,
  onSort,
  stickyLeft,
  stickyBorder,
  cellRef,
  info,
}: ThProps) {
  const active = sortKey === k;
  const sticky = stickyLeft != null;
  return (
    <th
      ref={cellRef}
      scope="col"
      aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
      style={{
        padding: 0,
        borderBottom: "1px solid var(--hair-2)",
        background: "var(--surface)",
        position: sticky ? ("sticky" as const) : ("relative" as const),
        ...(sticky
          ? {
              left: stickyLeft,
              zIndex: 2,
              borderInlineEnd: stickyBorder ? "1px solid var(--hair)" : undefined,
            }
          : {}),
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
          padding: info && num ? "10px 24px 10px 12px" : "10px 12px",
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
      {info && (
        <span
          title={info}
          aria-label={info}
          style={{
            position: "absolute",
            top: "50%",
            insetInlineEnd: 10,
            transform: "translateY(-50%)",
            cursor: "help",
            color: "var(--muted-2)",
            fontSize: 11,
            lineHeight: 1,
          }}
        >
          ⓘ
        </span>
      )}
    </th>
  );
}

/**
 * Score-column gauge (owner UX round-2, 2026-07-31). `v == null` renders a
 * plain "–" (no track/fill — the model fell outside that category's top-50).
 * Otherwise a centered stack: the raw 1-decimal value (mono, tabular) sits
 * ABOVE a full-width bar — never inside the fill, so contrast never breaks
 * across filled/unfilled regions or themes — and the whole stack centers
 * within its column so values line up vertically down the column.
 *
 * Width scale: `floor = columnMin - 10`, `width% = (v - floor) / (columnMax -
 * floor) × 100` (100% when the column has no spread) — a shallower floor than
 * the column's own minimum so even the lowest-scoring row in a tight column
 * still reads as a substantial bar, not a nub.
 *
 * Fill color is a value-band signal, not just decoration: `delta = columnMax
 * - v`; within 2 points of the column leader → `var(--up)`; within 6 → the
 * neutral `var(--bar)`; further behind → `var(--amber)`. The number stays
 * visible next to the bar regardless, so color is never the only signal.
 *
 * `role="img"` + `aria-label` carry the raw value only (no dimension-name
 * prefix, matching the visual reference).
 */
function Bar({ v, range }: { v: number | null; range: { min: number; max: number } }) {
  if (v == null) {
    return (
      <span className="mono" style={{ color: "var(--muted-2)" }}>
        –
      </span>
    );
  }
  const floor = range.min - 10;
  const pct =
    range.max === range.min
      ? 100
      : Math.max(0, Math.min(100, ((v - floor) / (range.max - floor)) * 100));
  const delta = range.max - v;
  const fillColor = delta <= 2 ? "var(--up)" : delta <= 6 ? "var(--bar)" : "var(--amber)";
  return (
    <div
      role="img"
      aria-label={v.toFixed(1)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        width: 64,
        margin: "0 auto",
      }}
    >
      <span className="mono tnum" style={{ fontSize: 12, lineHeight: 1 }}>
        {v.toFixed(1)}
      </span>
      <span
        style={{
          display: "block",
          width: "100%",
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
            background: fillColor,
          }}
        />
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showRightFade, setShowRightFade] = useState(false);
  const rankThRef = useRef<HTMLTableCellElement>(null);
  const [modelLeft, setModelLeft] = useState(32);

  const onSort = (k: SortKey) => {
    if (sortKey === k) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      setSortDir(defaultDirFor(k));
    }
  };

  // Per-column min/max, computed once over the `rows` prop (not the locally
  // re-sorted view — values don't change under sorting, so this is
  // equivalent either way). Feeds the padded min-max bar scaling in `Bar`.
  const colRange = useMemo(() => {
    const m = {} as Record<ScoreKey, { min: number; max: number }>;
    for (const k of SCORE_KEYS) {
      const values = rows.map((r) => r[k]).filter((v): v is number => v != null);
      m[k] = values.length ? { min: Math.min(...values), max: Math.max(...values) } : { min: 0, max: 1 };
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

  // Mobile scroll affordance: show a right-edge fade hint whenever the table
  // overflows its scroll container and hasn't been scrolled all the way to
  // the end. Re-measured on scroll, on mount, and on container resize.
  const updateFade = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth + 1;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
    setShowRightFade(hasOverflow && !atEnd);
  }, []);

  useEffect(() => {
    updateFade();
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(updateFade);
    ro.observe(el);
    window.addEventListener("resize", updateFade);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateFade);
    };
  }, [updateFade, sorted]);

  // The Model column's sticky offset must match the rank column's ACTUAL
  // rendered width, not a guessed constant — table auto-layout doesn't
  // reliably honor a fixed pixel `width` hint on table cells (verified: a
  // `width: 40` hint rendered at ~31px in practice, leaving scrolled
  // columns visibly bleeding through the gap). Measured live instead.
  useEffect(() => {
    const el = rankThRef.current;
    if (!el) return;
    const measure = () => setModelLeft(el.getBoundingClientRect().width);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
            {t("Data Desk · Updated weekly", "Bàn dữ liệu · Cập nhật hằng tuần", "Meja data · Diperbarui mingguan")}
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

      <p
        className="mono text-mute"
        style={{
          fontSize: 11.5,
          margin: "0 0 14px",
          display: "flex",
          flexWrap: "wrap",
          columnGap: 6,
          rowGap: 2,
        }}
      >
        <span style={{ whiteSpace: "normal" }}>
          {t(
            "Sort by what you actually use the model for",
            "Sắp xếp theo nhu cầu sử dụng thực tế",
            "Urutkan sesuai kebutuhan penggunaan Anda"
          )}
        </span>
        <span style={{ whiteSpace: "normal" }}>
          ·{" "}
          {t(
            `Scores via LLM Stats, as of ${asOfLabel}`,
            `Điểm số từ LLM Stats, cập nhật ${asOfLabel}`,
            `Skor via LLM Stats, per ${asOfLabel}`
          )}
        </span>
      </p>

      <div
        style={{
          border: "1px solid var(--hair)",
          borderRadius: 8,
          overflow: "hidden",
          background: "var(--surface)",
        }}
      >
        <div style={{ position: "relative" }}>
          <div className="r-table-scroll" ref={scrollRef} onScroll={updateFade}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <Th
                    k="rank"
                    num
                    stickyLeft={STICKY_RANK_LEFT}
                    cellRef={rankThRef}
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={onSort}
                  >
                    #
                  </Th>
                  <Th
                    k="model"
                    stickyLeft={modelLeft}
                    stickyBorder
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={onSort}
                  >
                    {t("Model", "Mô hình", "Model")}
                  </Th>
                  <Th
                    k="general"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={onSort}
                    info={t(
                      "Overall TrueSkill rating across all benchmark categories",
                      "Xếp hạng TrueSkill tổng thể trên tất cả các hạng mục benchmark",
                      "Peringkat TrueSkill keseluruhan di semua kategori benchmark"
                    )}
                  >
                    {t("General", "Tổng quát", "Umum")}
                  </Th>
                  <Th
                    k="reasoning"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={onSort}
                    info={t(
                      "TrueSkill rating from reasoning benchmarks",
                      "Xếp hạng TrueSkill từ các benchmark suy luận",
                      "Peringkat TrueSkill dari benchmark penalaran"
                    )}
                  >
                    {t("Reasoning", "Suy luận", "Penalaran")}
                  </Th>
                  <Th
                    k="coding"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={onSort}
                    info={t(
                      "TrueSkill rating from coding benchmarks",
                      "Xếp hạng TrueSkill từ các benchmark lập trình",
                      "Peringkat TrueSkill dari benchmark pemrograman"
                    )}
                  >
                    {t("Coding", "Lập trình", "Pemrograman")}
                  </Th>
                  <Th
                    k="math"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={onSort}
                    info={t(
                      "TrueSkill rating from math benchmarks",
                      "Xếp hạng TrueSkill từ các benchmark toán học",
                      "Peringkat TrueSkill dari benchmark matematika"
                    )}
                  >
                    {t("Math", "Toán", "Matematika")}
                  </Th>
                  <Th
                    k="search"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={onSort}
                    info={t(
                      "TrueSkill rating from search benchmarks",
                      "Xếp hạng TrueSkill từ các benchmark tìm kiếm",
                      "Peringkat TrueSkill dari benchmark pencarian"
                    )}
                  >
                    {t("Search", "Tìm kiếm", "Pencarian")}
                  </Th>
                  <Th
                    k="vision"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={onSort}
                    info={t(
                      "TrueSkill rating from vision benchmarks",
                      "Xếp hạng TrueSkill từ các benchmark thị giác",
                      "Peringkat TrueSkill dari benchmark visi"
                    )}
                  >
                    {t("Vision", "Thị giác", "Visi")}
                  </Th>
                  <Th
                    k="inputPrice"
                    num
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={onSort}
                    info={t(
                      "Cheapest listed provider price per 1M tokens",
                      "Giá thấp nhất trong số các nhà cung cấp niêm yết, tính trên 1 triệu token",
                      "Harga penyedia terdaftar termurah per 1 juta token"
                    )}
                  >
                    {t("Input $/M", "Input $/Tr", "Input $/Jt")}
                  </Th>
                  <Th
                    k="outputPrice"
                    num
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={onSort}
                    info={t(
                      "Cheapest listed provider price per 1M tokens",
                      "Giá thấp nhất trong số các nhà cung cấp niêm yết, tính trên 1 triệu token",
                      "Harga penyedia terdaftar termurah per 1 juta token"
                    )}
                  >
                    {t("Output $/M", "Output $/Tr", "Output $/Jt")}
                  </Th>
                  <Th
                    k="released"
                    num
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={onSort}
                    info={t(
                      "First public release date",
                      "Ngày phát hành công khai đầu tiên",
                      "Tanggal rilis publik pertama"
                    )}
                  >
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
                      background:
                        i % 2 === 0 ? "transparent" : "color-mix(in oklab, var(--ink) 2%, transparent)",
                    }}
                  >
                    <td
                      className="mono"
                      style={{
                        padding: "12px 10px",
                        fontSize: 12,
                        color: "var(--muted)",
                        textAlign: "right",
                        position: "sticky",
                        left: STICKY_RANK_LEFT,
                        zIndex: 1,
                        background: stickyRowBg(i),
                      }}
                    >
                      {i + 1}
                    </td>
                    <td
                      style={{
                        padding: "12px 10px",
                        whiteSpace: "nowrap",
                        position: "sticky",
                        left: modelLeft,
                        zIndex: 1,
                        background: stickyRowBg(i),
                        borderInlineEnd: "1px solid var(--hair)",
                      }}
                    >
                      <div className="serif" style={{ fontWeight: 600, fontSize: 14 }}>
                        {m.model}
                      </div>
                      <div className="text-mute-2" style={{ fontSize: 11.5, marginTop: 1 }}>
                        {m.maker}
                      </div>
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      <Bar v={m.general} range={colRange.general} />
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      <Bar v={m.reasoning} range={colRange.reasoning} />
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      <Bar v={m.coding} range={colRange.coding} />
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      <Bar v={m.math} range={colRange.math} />
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      <Bar v={m.search} range={colRange.search} />
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      <Bar v={m.vision} range={colRange.vision} />
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
          {showRightFade && <div className="r-table-fade" aria-hidden="true" />}
        </div>
      </div>

      <p className="mono" style={{ fontSize: 11, color: "var(--muted)", margin: "10px 2px 0" }}>
        {t(
          "TrueSkill conservative rating · higher is better",
          "Điểm TrueSkill thận trọng · cao hơn là tốt hơn",
          "Rating konservatif TrueSkill · lebih tinggi lebih baik"
        )}
        {" · "}
        {t("Data:", "Dữ liệu:", "Data:")}{" "}
        <a href="https://llm-stats.com" target="_blank" rel="noopener noreferrer" className="r-meta-link">
          LLM Stats
        </a>
      </p>

      <div
        className={sponsor ? "r-split-21" : undefined}
        style={{ marginTop: 48, display: "grid", gap: 24 }}
      >
        <div style={{ padding: 24, background: "var(--surface)", border: "1px solid var(--hair)", borderRadius: 8 }}>
          <div className="kicker" style={{ marginBottom: 8 }}>
            {t("Methodology", "Phương pháp", "Metodologi")}
          </div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--ink-2)" }}>
            {t(methodology.en, methodology.vi, methodology.id)}
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
