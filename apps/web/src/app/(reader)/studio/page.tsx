export default function StudioPage() {
  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 64, maxWidth: 800 }}>
      <div className="kicker" style={{ marginBottom: 8 }}>
        DTW Studio
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
        Sponsored storytelling, done with disclosure.
      </h1>
      <p
        className="serif text-mute"
        style={{ margin: "0 0 24px", fontSize: 19, lineHeight: 1.45 }}
      >
        Studio is DTW&apos;s branded content arm. We work with partners to tell their story – and
        we label it, top to bottom, so readers always know what they&apos;re reading.
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
        Partnership enquiries: studio@dailytechwire.asia. Every Studio piece carries a Paid
        Partner disclosure, top to bottom.
      </div>
    </div>
  );
}
