import { Skeleton } from "@dtw/ui";

/**
 * `/dashboards` route-segment loading state (Next.js `loading.tsx`
 * convention — this is the first one in the app). Mirrors the AI Leaderboard
 * page's own layout: a header block, then ~8 table-row placeholders, so the
 * skeleton doesn't visibly "pop" once the real content streams in.
 */
export default function DashboardsLoading() {
  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <header style={{ borderBottom: "3px solid var(--brand-navy)", paddingBottom: 20, marginBottom: 24 }}>
        <Skeleton w={140} h={11} style={{ marginBottom: 10 }} />
        <Skeleton w={280} h={38} />
      </header>

      <Skeleton w={360} h={12} style={{ marginBottom: 18 }} />

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} w={84} h={28} style={{ borderRadius: 99 }} />
        ))}
      </div>

      <div style={{ border: "1px solid var(--hair)", borderRadius: 8, overflow: "hidden", background: "var(--surface)" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "14px 16px",
              borderBottom: i === 7 ? "none" : "1px solid var(--hair)",
            }}
          >
            <Skeleton w={20} h={12} />
            <Skeleton w={160} h={14} />
            <Skeleton w={80} h={10} />
            <Skeleton w={80} h={10} />
            <Skeleton w={80} h={10} />
            <Skeleton w={60} h={10} />
            <Skeleton w={60} h={10} />
          </div>
        ))}
      </div>
    </div>
  );
}
