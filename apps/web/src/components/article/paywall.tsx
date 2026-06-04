"use client";

import { Button } from "@dtw/ui";

export interface PaywallProps {
  onLogin: () => void;
}

/**
 * Soft paywall card shown after the meter threshold trips.
 * Phase 1 has no actual gate — copy and CTAs are demo. Real paywall + Stripe
 * lands in Phase 2 per process/features/articles/_GUIDE.md.
 */
export function Paywall({ onLogin }: PaywallProps) {
  return (
    <div
      style={{
        position: "relative",
        maxWidth: 680,
        margin: "0 auto",
        padding: "40px 36px 48px",
        background: "var(--surface)",
        border: "1px solid var(--hair)",
        borderRadius: 8,
        textAlign: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -80,
          left: 0,
          right: 0,
          height: 80,
          background: "linear-gradient(to bottom, transparent, var(--paper))",
          pointerEvents: "none",
        }}
      />
      <div className="kicker" style={{ marginBottom: 10 }}>
        Free limit reached
      </div>
      <h3
        className="serif"
        style={{
          margin: "0 0 10px",
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        Keep reading the reporting that matters in Asia tech.
      </h3>
      <p
        className="text-mute"
        style={{
          margin: "0 auto 24px",
          fontSize: 14,
          lineHeight: 1.55,
          maxWidth: 480,
        }}
      >
        You&apos;ve read your 3 free articles this month. DTW Pro is $12/month – unlimited reading,
        full Dashboards, member-only Q&amp;As, and zero ads.
      </p>
      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Button href="/pro" variant="accent" size="lg">
          Become a member – $12/mo
        </Button>
        <Button variant="outline" size="lg" onClick={onLogin}>
          I already have an account
        </Button>
      </div>
      <div className="mono text-mute-2" style={{ fontSize: 11 }}>
        Free meter resets monthly · cancel anytime · invoice billing for teams
      </div>

      <div
        style={{
          marginTop: 32,
          paddingTop: 24,
          borderTop: "1px solid var(--hair)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))",
          gap: 18,
          textAlign: "left",
        }}
      >
        {(
          [
            ["Unlimited reading", "Across all six pillars and the archive."],
            [
              "Full Dashboards",
              "Funding tracker + AI leaderboard with CSV export.",
            ],
            ["Pro newsletters", "Member-only deep dives every Friday."],
          ] as const
        ).map(([k, v]) => (
          <div key={k}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{k}</div>
            <div className="text-mute" style={{ fontSize: 12 }}>
              {v}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
