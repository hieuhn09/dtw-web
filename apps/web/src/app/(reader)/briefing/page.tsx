export default function BriefingPage() {
  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 64, maxWidth: 800 }}>
      <div className="kicker" style={{ marginBottom: 8 }}>
        The Brief
      </div>
      <h1
        className="serif"
        style={{
          margin: "0 0 18px",
          fontSize: 48,
          fontWeight: 700,
          letterSpacing: "-0.025em",
          lineHeight: 1.05,
        }}
      >
        AM Brief · PM Brief
      </h1>
      <p
        className="serif text-mute"
        style={{ margin: "0 0 24px", fontSize: 19, lineHeight: 1.45 }}
      >
        Two daily emails. The morning is what broke overnight in Asia tech, in 5 minutes. The
        evening is the day in three stories, plus what to read tonight.
      </p>
      <div
        style={{
          padding: 24,
          background: "var(--surface-2)",
          borderRadius: 8,
          fontSize: 13,
          color: "var(--muted)",
        }}
      >
        This page is wired through the CMS – editors update content without a deploy.
      </div>
    </div>
  );
}
