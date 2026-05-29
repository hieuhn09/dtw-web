"use client";

import { use } from "react";
import Link from "next/link";
import { GridBackdrop } from "@/components/effects";
import { FundingTracker } from "@/components/dashboards/funding-tracker";
import { AILeaderboard } from "@/components/dashboards/ai-leaderboard";

type Tab = "funding" | "ai";

function isTab(s: string | undefined): s is Tab {
  return s === "funding" || s === "ai";
}

export default function DashboardsPage({
  params,
}: {
  params: Promise<{ sub?: string[] }>;
}) {
  const { sub } = use(params);
  const tab: Tab = sub && isTab(sub[0]) ? (sub[0] as Tab) : "funding";

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <header
        style={{
          borderBottom: "3px solid var(--ink)",
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
          <div
            className="kicker"
            style={{
              marginBottom: 6,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span className="live-dot" /> Data Desk · Live
          </div>
          <h1
            className="serif"
            style={{
              margin: "0 0 10px",
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              lineHeight: 1,
            }}
          >
            Live Dashboards
          </h1>
          <p
            className="serif text-mute"
            style={{ margin: 0, fontSize: 17, lineHeight: 1.45, maxWidth: 760 }}
          >
            Two trackers that move with the news. Built from filings, scraped tickers, and a
            handful of human checks. Updated every 15 minutes.
          </p>
        </div>
      </header>

      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid var(--hair)",
          marginBottom: 28,
        }}
      >
        {(
          [
            ["funding", "Asia Funding Tracker"],
            ["ai", "AI Leaderboard"],
          ] as const
        ).map(([k, l]) => (
          <Link
            key={k}
            href={`/dashboards/${k}`}
            style={{
              padding: "14px 22px",
              borderBottom: tab === k ? "3px solid var(--accent)" : "3px solid transparent",
              marginBottom: -1,
              fontSize: 14,
              fontWeight: tab === k ? 600 : 500,
              color: tab === k ? "var(--ink)" : "var(--muted)",
              textDecoration: "none",
            }}
          >
            {l}
          </Link>
        ))}
      </div>

      {tab === "funding" ? <FundingTracker /> : <AILeaderboard />}

      {/* Methodology + sponsor slot */}
      <section
        style={{
          marginTop: 48,
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 24,
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
          <div className="kicker" style={{ marginBottom: 8 }}>
            Methodology
          </div>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 13,
              lineHeight: 1.55,
              color: "var(--ink-2)",
            }}
          >
            {tab === "funding"
              ? "Funding data combines exchange tickers (Asian-listed tech) and announced private rounds (Series A and later) across ASEAN, India, Greater China, Korea, and Japan. We exclude SPAC mergers, secondaries, and bridge rounds < $1M."
              : "Scores aggregate three independent benchmark sources, normalised to a 0–100 scale per dimension. We disclose the source mix per model. Updated monthly; outliers flagged manually."}
          </p>
          <p className="mono text-mute-2" style={{ margin: 0, fontSize: 11 }}>
            For informational purposes only · not investment or procurement advice
          </p>
        </div>
        <div
          style={{
            padding: 24,
            background: "var(--sponsored)",
            border: "1px solid #E0B900",
            borderRadius: 8,
          }}
        >
          <div
            className="mono upper"
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".14em",
              color: "var(--ink)",
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            Sponsor slot · this dashboard
          </div>
          <div
            className="serif"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--ink)",
              marginBottom: 6,
            }}
          >
            Brought to you by [Partner Logo]
          </div>
          <p
            style={{
              fontSize: 12,
              color: "color-mix(in oklab, var(--ink) 75%, transparent)",
              margin: 0,
            }}
          >
            Sponsorship does not influence the data or methodology.
          </p>
        </div>
      </section>
    </div>
  );
}
