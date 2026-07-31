"use client";

import Link from "next/link";
import { Button } from "@dtw/ui";
import { SectionHeader } from "./section-header";
import type { AiLeaderboardRow } from "@/lib/data";
import { useT } from "@/lib/i18n";

export interface DashboardsTeaserProps {
  aiRows: AiLeaderboardRow[];
}

/** `null` if either side is missing; a 4:1 in:out blend when both are present;
 *  the lone non-null side when only one is present (owner-specified — see
 *  "UX round 2" note in ai-leaderboard-llmstats_PLAN_30-07-26.md). */
function blendedPrice(input: number | null, output: number | null): number | null {
  if (input == null && output == null) return null;
  if (input == null) return output;
  if (output == null) return input;
  return (4 * input + output) / 5;
}

/**
 * Per-column chip tier (owner "UX round 3", 2026-07-31): the top 3 *distinct*
 * values among the displayed rows earn a chip — the single highest value is
 * tier 1 (strongest amber), the next two distinct values are tier 2 (lighter
 * amber). Ties share a tier (e.g. two rows tied for the top score both get
 * tier 1), so more than 3 rows can be chipped if there are ties. Returns a
 * `value → tier` map; a value absent from the map (or `null`) gets no chip.
 */
function chipTiers(values: ReadonlyArray<number | null>): Map<number, 1 | 2> {
  const distinct = Array.from(new Set(values.filter((v): v is number => v != null))).sort(
    (a, b) => b - a
  );
  const top3 = distinct.slice(0, 3);
  const tiers = new Map<number, 1 | 2>();
  top3.forEach((v, i) => tiers.set(v, i === 0 ? 1 : 2));
  return tiers;
}

/** Renders a score value with a rounded amber chip when it lands in the
 *  column's top-3 tier; a plain mono number otherwise; "–" when null. Chips
 *  center within their cell (the cell itself is text-align: center). */
function ScoreCell({ v, tiers }: { v: number | null; tiers: Map<number, 1 | 2> }) {
  if (v == null) return <>–</>;
  const tier = tiers.get(v);
  const text = v.toFixed(1);
  if (!tier) return <>{text}</>;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 6,
        fontWeight: tier === 1 ? 600 : undefined,
        background:
          tier === 1
            ? "color-mix(in oklab, var(--amber) 26%, transparent)"
            : "color-mix(in oklab, var(--amber) 12%, transparent)",
      }}
    >
      {text}
    </span>
  );
}

/**
 * Homepage AI Leaderboard teaser — AI-only single card (the Asia Funding
 * Tracker card is deliberately gone; see
 * ai-leaderboard-llmstats_PLAN_30-07-26.md's Non-Goals — the funding
 * dashboard is hidden entirely from the UI this pass, not just here).
 */
export function DashboardsTeaser({ aiRows }: DashboardsTeaserProps) {
  const t = useT();
  const aiTop = aiRows.slice(0, 5);

  // Per-column top-3 chip tiers (owner "UX round 3") — computed over the
  // displayed rows only, not the full leaderboard.
  const generalTiers = chipTiers(aiTop.map((m) => m.general));
  const reasoningTiers = chipTiers(aiTop.map((m) => m.reasoning));
  const codingTiers = chipTiers(aiTop.map((m) => m.coding));
  const mathTiers = chipTiers(aiTop.map((m) => m.math));
  const visionTiers = chipTiers(aiTop.map((m) => m.vision));

  const headers: ReadonlyArray<{ label: string; info?: string }> = [
    { label: "#" },
    { label: t("Model", "Mô hình", "Model") },
    {
      label: t("General", "Tổng quát", "Umum"),
      info: t(
        "Overall TrueSkill rating across all benchmark categories",
        "Xếp hạng TrueSkill tổng thể trên tất cả các hạng mục benchmark",
        "Peringkat TrueSkill keseluruhan di semua kategori benchmark"
      ),
    },
    {
      label: t("Reason", "Luận", "Nalar"),
      info: t(
        "TrueSkill rating from reasoning benchmarks",
        "Xếp hạng TrueSkill từ các benchmark suy luận",
        "Peringkat TrueSkill dari benchmark penalaran"
      ),
    },
    {
      label: t("Code", "Mã", "Kode"),
      info: t(
        "TrueSkill rating from coding benchmarks",
        "Xếp hạng TrueSkill từ các benchmark lập trình",
        "Peringkat TrueSkill dari benchmark pemrograman"
      ),
    },
    {
      label: t("Math", "Toán", "Matematika"),
      info: t(
        "TrueSkill rating from math benchmarks",
        "Xếp hạng TrueSkill từ các benchmark toán học",
        "Peringkat TrueSkill dari benchmark matematika"
      ),
    },
    {
      label: t("Vision", "Thị giác", "Visi"),
      info: t(
        "TrueSkill rating from vision benchmarks",
        "Xếp hạng TrueSkill từ các benchmark thị giác",
        "Peringkat TrueSkill dari benchmark visi"
      ),
    },
    {
      label: t("Price", "Giá", "Harga"),
      info: t(
        "Blended price per 1M tokens: (4 × input + output) ÷ 5",
        "Giá gộp trên 1 triệu token: (4 × giá vào + giá ra) ÷ 5",
        "Harga campuran per 1 juta token: (4 × input + output) ÷ 5"
      ),
    },
  ];

  return (
    <section style={{ marginBottom: 48 }}>
      <SectionHeader
        title={t("Dashboards", "Bảng dữ liệu", "Dasbor")}
        kicker={t(
          "Data desk · updated weekly",
          "Bàn dữ liệu · cập nhật hằng tuần",
          "Meja data · diperbarui mingguan"
        )}
        right={
          <Button href="/dashboards" size="sm" variant="outline">
            {t("Open full dashboards →", "Mở bảng đầy đủ →", "Buka dasbor penuh →")}
          </Button>
        }
      />
      <Link
        href="/dashboards"
        style={{ color: "inherit", textDecoration: "none", display: "block" }}
      >
        <div
          className="card-hover"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--hair)",
            borderRadius: 8,
            padding: 24,
            cursor: "pointer",
          }}
        >
          <div style={{ marginBottom: 14 }}>
            <div
              className="upper text-mute"
              style={{ fontSize: 10, fontWeight: 600, letterSpacing: ".14em", marginBottom: 6 }}
            >
              {t("AI Leaderboard", "Bảng xếp hạng AI", "Papan Peringkat AI")}
            </div>
            <div className="serif" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>
              {t("This week's top models", "Mô hình hàng đầu tuần này", "Model teratas minggu ini")}
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--hair)" }}>
                {headers.map((h, i) => (
                  <th
                    key={h.label}
                    className="upper"
                    style={{
                      textAlign: i === 1 ? "left" : "center",
                      padding: "6px 0",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: ".1em",
                      color: "var(--muted)",
                      width: i >= 2 ? 90 : undefined,
                    }}
                  >
                    {h.label}
                    {h.info && (
                      <span
                        className="dtw-tip"
                        data-tip={h.info}
                        aria-label={h.info}
                        tabIndex={0}
                        style={{
                          marginInlineStart: 4,
                          color: "var(--muted-2)",
                          fontSize: 10,
                          fontWeight: 400,
                          textTransform: "none",
                          letterSpacing: "normal",
                        }}
                      >
                        ⓘ
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {aiTop.map((m, i) => (
                <tr
                  key={m.rank}
                  style={{
                    borderBottom: "1px solid var(--hair)",
                    background:
                      i % 2 === 0 ? "transparent" : "color-mix(in oklab, var(--ink) 2%, transparent)",
                  }}
                >
                  <td
                    className={i < 3 ? "mono r-rank-top" : "mono"}
                    style={{
                      padding: "10px 0",
                      fontSize: 12,
                      textAlign: "center",
                      color: i < 3 ? undefined : "var(--muted)",
                    }}
                  >
                    {m.rank}
                  </td>
                  <td style={{ padding: "10px 0" }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{m.model}</div>
                    <div className="text-mute-2" style={{ fontSize: 11 }}>
                      {m.maker}
                    </div>
                  </td>
                  <td
                    className="mono tnum"
                    style={{ padding: "10px 0", textAlign: "center", fontSize: 13, width: 90 }}
                  >
                    <ScoreCell v={m.general} tiers={generalTiers} />
                  </td>
                  <td
                    className="mono tnum"
                    style={{ padding: "10px 0", textAlign: "center", fontSize: 13, width: 90 }}
                  >
                    <ScoreCell v={m.reasoning} tiers={reasoningTiers} />
                  </td>
                  <td
                    className="mono tnum"
                    style={{ padding: "10px 0", textAlign: "center", fontSize: 13, width: 90 }}
                  >
                    <ScoreCell v={m.coding} tiers={codingTiers} />
                  </td>
                  <td
                    className="mono tnum"
                    style={{ padding: "10px 0", textAlign: "center", fontSize: 13, width: 90 }}
                  >
                    <ScoreCell v={m.math} tiers={mathTiers} />
                  </td>
                  <td
                    className="mono tnum"
                    style={{ padding: "10px 0", textAlign: "center", fontSize: 13, width: 90 }}
                  >
                    <ScoreCell v={m.vision} tiers={visionTiers} />
                  </td>
                  <td
                    className="mono tnum"
                    style={{ padding: "10px 0", textAlign: "center", fontSize: 13, width: 90 }}
                  >
                    {(() => {
                      const price = blendedPrice(m.inputPrice, m.outputPrice);
                      return price == null
                        ? "–"
                        : price === 0
                          ? t("free", "miễn phí", "gratis")
                          : "$" + price.toFixed(2);
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Link>
    </section>
  );
}
