"use client";

import Link from "next/link";
import { Button } from "@dtw/ui";
import { SectionHeader } from "./section-header";
import type { AiLeaderboardRow } from "@/lib/data";
import { useT } from "@/lib/i18n";

export interface DashboardsTeaserProps {
  aiRows: AiLeaderboardRow[];
}

/**
 * Homepage AI Leaderboard teaser — AI-only single card (the Asia Funding
 * Tracker card is deliberately gone; see
 * ai-leaderboard-llmstats_PLAN_30-07-26.md's Non-Goals — the funding
 * dashboard is hidden entirely from the UI this pass, not just here).
 */
export function DashboardsTeaser({ aiRows }: DashboardsTeaserProps) {
  const t = useT();
  const aiTop = aiRows.slice(0, 4);

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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 14,
            }}
          >
            <div>
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
            <span className="mono text-mute-2" style={{ fontSize: 11 }}>
              {t("filter by use case →", "lọc theo mục đích sử dụng →", "filter berdasarkan kasus penggunaan →")}
            </span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--hair)" }}>
                {(
                  [
                    "#",
                    t("Model", "Mô hình", "Model"),
                    t("General", "Tổng quát", "Umum"),
                    t("Reason", "Luận", "Nalar"),
                    t("Code", "Mã", "Kode"),
                    t("Input $/M", "Input $/Tr", "Input $/Jt"),
                  ] as const
                ).map((h, i) => (
                  <th
                    key={h}
                    className="upper"
                    style={{
                      textAlign: i >= 2 ? "right" : "left",
                      padding: "6px 0",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: ".1em",
                      color: "var(--muted)",
                      width: i >= 2 ? 90 : undefined,
                    }}
                  >
                    {h}
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
                  <td className="mono" style={{ padding: "10px 0", fontSize: 12, color: "var(--muted)" }}>
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
                    style={{ padding: "10px 0", textAlign: "right", fontSize: 13, width: 90 }}
                  >
                    {m.general != null ? m.general.toFixed(1) : "–"}
                  </td>
                  <td
                    className="mono tnum"
                    style={{ padding: "10px 0", textAlign: "right", fontSize: 13, width: 90 }}
                  >
                    {m.reasoning != null ? m.reasoning.toFixed(1) : "–"}
                  </td>
                  <td
                    className="mono tnum"
                    style={{ padding: "10px 0", textAlign: "right", fontSize: 13, width: 90 }}
                  >
                    {m.coding != null ? m.coding.toFixed(1) : "–"}
                  </td>
                  <td
                    className="mono tnum"
                    style={{ padding: "10px 0", textAlign: "right", fontSize: 13, width: 90 }}
                  >
                    {m.inputPrice == null
                      ? "–"
                      : m.inputPrice === 0
                        ? t("free", "miễn phí", "gratis")
                        : "$" + m.inputPrice.toFixed(2)}
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
