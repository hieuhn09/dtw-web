"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AI_LEADERBOARD, type AiLeaderboardRow } from "@/lib/data";
import { useT } from "@/lib/i18n";

type SortKey = keyof AiLeaderboardRow;
type SortDir = "asc" | "desc";

interface ThProps {
  k: SortKey;
  num?: boolean;
  children: ReactNode;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
}

function Th({ k, num, children, sortKey, sortDir, onSort }: ThProps) {
  return (
    <th
      onClick={() => onSort(k)}
      className="upper"
      style={{
        textAlign: num ? "right" : "left",
        padding: "10px 12px",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: ".1em",
        color: "var(--muted)",
        cursor: "pointer",
        userSelect: "none",
        borderBottom: "1px solid var(--hair-2)",
        background: "var(--surface)",
        textTransform: "uppercase",
      }}
    >
      {children}{" "}
      {sortKey === k && (
        <span style={{ color: "var(--accent)" }}>{sortDir === "asc" ? "▲" : "▼"}</span>
      )}
    </th>
  );
}

function Bar({ v, color = "var(--ink)" }: { v: number; color?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        justifyContent: "flex-end",
      }}
    >
      <div
        style={{
          flex: "0 0 90px",
          height: 6,
          background: "var(--surface-2)",
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <div style={{ width: `${Math.min(Math.max(v, 0), 100)}%`, height: "100%", background: color }} />
      </div>
      <span
        className="mono tnum"
        style={{ fontSize: 12, minWidth: 24, textAlign: "right" }}
      >
        {v}
      </span>
    </div>
  );
}

const OPTIMIZE: ReadonlyArray<readonly [SortKey, string]> = [
  ["reasoning", "Reasoning"],
  ["coding", "Coding"],
  ["speed", "Speed"],
  ["price", "Price (low)"],
];

export function AILeaderboard() {
  const t = useT();
  const [sortKey, setSortKey] = useState<SortKey>("reasoning");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const optimizeLabel = (k: SortKey): string =>
    k === "reasoning"
      ? t("Reasoning", "Suy luận", "Penalaran")
      : k === "coding"
        ? t("Coding", "Lập trình", "Pemrograman")
        : k === "speed"
          ? t("Speed", "Tốc độ", "Kecepatan")
          : t("Price (low)", "Giá (thấp)", "Harga (rendah)");

  const rows = useMemo(() => {
    return [...AI_LEADERBOARD].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [sortKey, sortDir]);

  const onSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir("desc");
    }
  };

  return (
    <section>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 18,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2
            className="serif"
            style={{
              margin: "0 0 4px",
              fontSize: 30,
              fontWeight: 650,
              letterSpacing: "-0.02em",
            }}
          >
            {t("AI Leaderboard", "Bảng xếp hạng AI", "Papan Peringkat AI")}
          </h2>
          <div className="text-mute mono" style={{ fontSize: 11 }}>
            {t(
              "Sort by what you actually use the model for · sample data, preview",
              "Sắp xếp theo nhu cầu thực tế của bạn · dữ liệu mẫu, xem trước",
              "Urutkan sesuai kebutuhan Anda · data sampel, pratinjau"
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span className="text-mute" style={{ fontSize: 12, marginRight: 4 }}>
            {t("Optimize for:", "Tối ưu cho:", "Optimalkan untuk:")}
          </span>
          {OPTIMIZE.map(([k]) => (
            <button
              key={k}
              onClick={() => {
                setSortKey(k);
                setSortDir(k === "price" ? "asc" : "desc");
              }}
              style={{
                padding: "6px 12px",
                fontSize: 12,
                fontFamily: "var(--font-sans)",
                background: sortKey === k ? "var(--ink)" : "var(--surface)",
                color: sortKey === k ? "var(--paper)" : "var(--ink)",
                border: "1px solid var(--hair-2)",
                borderRadius: 99,
                cursor: "pointer",
              }}
            >
              {optimizeLabel(k)}
            </button>
          ))}
        </div>
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
              <Th k="maker" sortKey={sortKey} sortDir={sortDir} onSort={onSort}>
                {t("Maker", "Nhà sản xuất", "Pembuat")}
              </Th>
              <Th k="reasoning" num sortKey={sortKey} sortDir={sortDir} onSort={onSort}>
                {t("Reasoning", "Suy luận", "Penalaran")}
              </Th>
              <Th k="coding" num sortKey={sortKey} sortDir={sortDir} onSort={onSort}>
                {t("Coding", "Lập trình", "Pemrograman")}
              </Th>
              <Th k="speed" num sortKey={sortKey} sortDir={sortDir} onSort={onSort}>
                {t("Speed", "Tốc độ", "Kecepatan")}
              </Th>
              <Th k="price" num sortKey={sortKey} sortDir={sortDir} onSort={onSort}>
                {t("$/M tok", "$/triệu token", "$/J token")}
              </Th>
              <Th k="ctx" num sortKey={sortKey} sortDir={sortDir} onSort={onSort}>
                {t("Context", "Ngữ cảnh", "Konteks")}
              </Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m, i) => (
              <tr
                key={m.model}
                style={{
                  borderBottom: "1px solid var(--hair)",
                  background: i % 2 === 0 ? "transparent" : "var(--paper)",
                }}
              >
                <td
                  className="mono"
                  style={{
                    padding: "14px 12px",
                    fontSize: 12,
                    color: "var(--muted)",
                    textAlign: "right",
                    width: 48,
                  }}
                >
                  {i + 1}
                </td>
                <td style={{ padding: "14px 12px" }}>
                  <div className="serif" style={{ fontWeight: 600, fontSize: 14 }}>
                    {m.model}
                  </div>
                </td>
                <td style={{ padding: "14px 12px", fontSize: 12, color: "var(--muted)" }}>
                  {m.maker}
                </td>
                <td style={{ padding: "14px 12px" }}>
                  <Bar v={m.reasoning} color="var(--ai)" />
                </td>
                <td style={{ padding: "14px 12px" }}>
                  <Bar v={m.coding} color="var(--dev)" />
                </td>
                <td style={{ padding: "14px 12px" }}>
                  <Bar v={m.speed} color="var(--startups)" />
                </td>
                <td
                  className="mono tnum"
                  style={{
                    padding: "14px 12px",
                    textAlign: "right",
                    fontSize: 13,
                    color: m.price === 0 ? "var(--up)" : "var(--ink)",
                  }}
                >
                  {m.price === 0 ? "free" : "$" + m.price.toFixed(1)}
                </td>
                <td
                  className="mono tnum"
                  style={{ padding: "14px 12px", textAlign: "right", fontSize: 13 }}
                >
                  {m.ctx}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </section>
  );
}
