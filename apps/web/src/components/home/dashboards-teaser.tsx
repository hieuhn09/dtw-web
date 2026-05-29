"use client";

import Link from "next/link";
import { Button, ArrowUpDown } from "@dtw/ui";
import { AnimatedSpark, CountUp } from "@/components/effects";
import { SectionHeader } from "./section-header";
import { AI_LEADERBOARD } from "@/lib/data";
import { useT } from "@/lib/i18n";

const fundSeries: ReadonlyArray<number> = [12, 18, 14, 22, 19, 26, 24, 31, 28, 34];
const fundChange = 14.2;

export function DashboardsTeaser() {
  const aiTop = AI_LEADERBOARD.slice(0, 4);
  const t = useT();

  return (
    <section style={{ marginBottom: 48 }}>
      <SectionHeader
        title={t("Live Dashboards", "Bảng điều khiển trực tiếp", "Dasbor Langsung")}
        kicker={t(
          "Data desk · updated every 15 min",
          "Bàn dữ liệu · cập nhật mỗi 15 phút",
          "Meja data · diperbarui tiap 15 menit"
        )}
        right={
          <Button href="/dashboards" size="sm" variant="outline">
            {t(
              "Open full dashboards →",
              "Mở bảng đầy đủ →",
              "Buka dasbor penuh →"
            )}
          </Button>
        }
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Asia Funding teaser */}
        <Link
          href="/dashboards/funding"
          style={{ color: "inherit", textDecoration: "none" }}
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
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: ".14em",
                    marginBottom: 6,
                    textTransform: "uppercase",
                  }}
                >
                  Asia Funding Tracker
                </div>
                <div
                  className="serif"
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                  }}
                >
                  $8.4B raised, 14 days
                </div>
              </div>
              <ArrowUpDown chg={fundChange} />
            </div>
            <AnimatedSpark
              values={fundSeries}
              color="var(--up)"
              width={420}
              height={56}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 12,
                marginTop: 18,
                paddingTop: 14,
                borderTop: "1px solid var(--hair)",
              }}
            >
              <div>
                <div
                  className="text-mute-2"
                  style={{
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: ".1em",
                  }}
                >
                  Deals
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 20, fontWeight: 600, marginTop: 2 }}
                >
                  <CountUp to={127} />
                </div>
              </div>
              <div>
                <div
                  className="text-mute-2"
                  style={{
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: ".1em",
                  }}
                >
                  Avg. round
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 20, fontWeight: 600, marginTop: 2 }}
                >
                  <CountUp to={66} prefix="$" suffix="M" />
                </div>
              </div>
              <div>
                <div
                  className="text-mute-2"
                  style={{
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: ".1em",
                  }}
                >
                  Top sector
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}
                >
                  AI infra
                </div>
              </div>
            </div>
            <div
              className="text-mute-2"
              style={{ fontSize: 11, marginTop: 14, fontStyle: "italic" }}
            >
              For informational purposes only · not investment advice
            </div>
          </div>
        </Link>

        {/* AI Leaderboard teaser */}
        <Link
          href="/dashboards/ai"
          style={{ color: "inherit", textDecoration: "none" }}
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
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: ".14em",
                    marginBottom: 6,
                    textTransform: "uppercase",
                  }}
                >
                  AI Leaderboard
                </div>
                <div
                  className="serif"
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                  }}
                >
                  This week&apos;s top models
                </div>
              </div>
              <span className="mono text-mute-2" style={{ fontSize: 11 }}>
                filter by use case →
              </span>
            </div>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid var(--hair)" }}>
                  {(["#", "Model", "Reason", "Code", "$/M"] as const).map((h, i) => (
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
                        textTransform: "uppercase",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {aiTop.map((m) => (
                  <tr key={m.rank} style={{ borderBottom: "1px solid var(--hair)" }}>
                    <td
                      className="mono"
                      style={{
                        padding: "10px 0",
                        fontSize: 12,
                        color: "var(--muted)",
                      }}
                    >
                      {m.rank}
                    </td>
                    <td style={{ padding: "10px 0" }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {m.model}
                      </div>
                      <div className="text-mute-2" style={{ fontSize: 11 }}>
                        {m.maker}
                      </div>
                    </td>
                    <td
                      className="mono tnum"
                      style={{
                        padding: "10px 0",
                        textAlign: "right",
                        fontSize: 13,
                      }}
                    >
                      {m.reasoning}
                    </td>
                    <td
                      className="mono tnum"
                      style={{
                        padding: "10px 0",
                        textAlign: "right",
                        fontSize: 13,
                      }}
                    >
                      {m.coding}
                    </td>
                    <td
                      className="mono tnum"
                      style={{
                        padding: "10px 0",
                        textAlign: "right",
                        fontSize: 13,
                      }}
                    >
                      {m.price.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Link>
      </div>
    </section>
  );
}
