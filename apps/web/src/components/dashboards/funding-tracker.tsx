"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowUpDown, Button } from "@dtw/ui";
import { FUNDING_ROWS, type FundingRow } from "@/lib/data";
import { useT } from "@/lib/i18n";
import { BigChart } from "./big-chart";

type SortKey = keyof FundingRow;
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
        borderBottom: "1px solid var(--hair-2)",
        userSelect: "none",
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

const TOP_MOVERS: ReadonlyArray<{ name: string; chg: number }> = [
  { name: "GoTo Group", chg: 3.1 },
  { name: "Alibaba", chg: 2.41 },
  { name: "Sea Limited", chg: -2.05 },
  { name: "Meituan", chg: -1.2 },
];

export function FundingTracker() {
  const t = useT();
  const [sortKey, setSortKey] = useState<SortKey>("chg");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [country, setCountry] = useState<string>("All");

  const filtered = useMemo(() => {
    let rows = [...FUNDING_ROWS];
    if (country !== "All") rows = rows.filter((r) => r.country === country);
    rows.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return rows;
  }, [sortKey, sortDir, country]);

  const onSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir("desc");
    }
  };

  const countries = ["All", ...Array.from(new Set(FUNDING_ROWS.map((r) => r.country)))];

  const downloadCsv = () => {
    const header = ["ticker", "name", "country", "sector", "px", "chg", "mcap", "funding"];
    const lines = filtered.map((r) =>
      header.map((k) => {
        const v = r[k as keyof FundingRow];
        return v == null ? "" : String(v);
      }).join(",")
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dtw-funding-tracker.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            {t("Asia Funding Tracker", "Theo dõi gọi vốn châu Á", "Pelacak Pendanaan Asia")}
          </h2>
          <div className="text-mute mono" style={{ fontSize: 11 }}>
            {t(
              "Sample data — live market feed coming soon",
              "Dữ liệu mẫu — nguồn thị trường trực tiếp sắp có",
              "Data sampel — feed pasar langsung segera hadir"
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="text-mute" style={{ fontSize: 12 }}>
            {t("Country:", "Quốc gia:", "Negara:")}
          </span>
          <div
            style={{
              display: "flex",
              gap: 0,
              border: "1px solid var(--hair-2)",
              borderRadius: 5,
              overflow: "hidden",
            }}
          >
            {countries.map((c) => (
              <button
                key={c}
                onClick={() => setCountry(c)}
                style={{
                  padding: "7px 12px",
                  fontSize: 11,
                  fontWeight: 500,
                  fontFamily: "var(--font-mono)",
                  background: country === c ? "var(--ink)" : "var(--surface)",
                  color: country === c ? "var(--paper)" : "var(--ink)",
                  border: "none",
                  borderRight: "1px solid var(--hair-2)",
                  cursor: "pointer",
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={downloadCsv}>
            ↓ CSV
          </Button>
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
              <Th k="ticker" sortKey={sortKey} sortDir={sortDir} onSort={onSort}>
                {t("Ticker", "Mã", "Ticker")}
              </Th>
              <Th k="name" sortKey={sortKey} sortDir={sortDir} onSort={onSort}>
                {t("Company", "Công ty", "Perusahaan")}
              </Th>
              <Th k="country" sortKey={sortKey} sortDir={sortDir} onSort={onSort}>
                {t("Country", "Quốc gia", "Negara")}
              </Th>
              <Th k="sector" sortKey={sortKey} sortDir={sortDir} onSort={onSort}>
                {t("Sector", "Lĩnh vực", "Sektor")}
              </Th>
              <Th k="px" num sortKey={sortKey} sortDir={sortDir} onSort={onSort}>
                {t("Price", "Giá", "Harga")}
              </Th>
              <Th k="chg" num sortKey={sortKey} sortDir={sortDir} onSort={onSort}>
                {t("Day Δ", "Δ ngày", "Δ Hari")}
              </Th>
              <Th k="mcap" num sortKey={sortKey} sortDir={sortDir} onSort={onSort}>
                {t("Mkt Cap", "Vốn hoá", "Kap. Pasar")}
              </Th>
              <Th k="funding" num sortKey={sortKey} sortDir={sortDir} onSort={onSort}>
                {t("Recent Round", "Vòng gần đây", "Putaran Terbaru")}
              </Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr
                key={r.ticker}
                style={{
                  borderBottom: "1px solid var(--hair)",
                  background: i % 2 === 0 ? "transparent" : "var(--paper)",
                }}
              >
                <td className="mono" style={{ padding: 12, fontSize: 12, fontWeight: 600 }}>
                  {r.ticker}
                </td>
                <td style={{ padding: 12, fontSize: 13 }}>{r.name}</td>
                <td className="mono" style={{ padding: 12, fontSize: 11, color: "var(--muted)" }}>
                  {r.country}
                </td>
                <td style={{ padding: 12, fontSize: 12, color: "var(--muted)" }}>{r.sector}</td>
                <td
                  className="mono tnum"
                  style={{ padding: 12, fontSize: 13, textAlign: "right" }}
                >
                  {r.px == null ? (
                    <span className="text-mute-2">–</span>
                  ) : (
                    r.px.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  )}
                </td>
                <td style={{ padding: 12, textAlign: "right" }}>
                  <ArrowUpDown chg={r.chg} />
                </td>
                <td
                  className="mono tnum"
                  style={{ padding: 12, fontSize: 12, textAlign: "right" }}
                >
                  {r.mcap}
                </td>
                <td
                  className="mono"
                  style={{
                    padding: 12,
                    fontSize: 11,
                    textAlign: "right",
                    color: r.funding === "–" ? "var(--muted-2)" : "var(--accent)",
                  }}
                >
                  {r.funding}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Charts */}
      <div
        className="r-split-21"
        style={{
          display: "grid",
          gap: 24,
          marginTop: 28,
        }}
      >
        <div
          style={{
            padding: 24,
            background: "var(--surface)",
            border: "1px solid var(--hair)",
            borderRadius: 8,
          }}
        >
          <div
            className="upper"
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: ".12em",
              color: "var(--muted)",
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            {t("ASEAN tech index – 30 days", "Chỉ số công nghệ ASEAN – 30 ngày", "Indeks teknologi ASEAN – 30 hari")}
          </div>
          <BigChart />
        </div>
        <div
          style={{
            padding: 24,
            background: "var(--surface)",
            border: "1px solid var(--hair)",
            borderRadius: 8,
          }}
        >
          <div
            className="upper"
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: ".12em",
              color: "var(--muted)",
              marginBottom: 12,
              textTransform: "uppercase",
            }}
          >
            {t("Top movers · today", "Biến động mạnh · hôm nay", "Penggerak utama · hari ini")}
          </div>
          {TOP_MOVERS.map((m) => (
            <div
              key={m.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid var(--hair)",
                fontSize: 13,
              }}
            >
              <span>{m.name}</span>
              <ArrowUpDown chg={m.chg} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
