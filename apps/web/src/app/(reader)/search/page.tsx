"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PillarTag } from "@dtw/ui";
import { CoverArt } from "@/components/cover-art";
import { TimeAgo } from "@/components/time-ago";
import { PILLARS, pillarOf, type PillarId } from "@/lib/data";
import type { ArticleView } from "@/lib/article-view";
import { fmtDateL, localizedPillarLabel, useLang, useT } from "@/lib/i18n";
import { runSearch } from "./search-action";

const SUGGESTED = [
  "sovereign AI",
  "VNG",
  "TSMC",
  "datacenter",
  "open weights",
  "server actions",
];

function FacetBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        className="upper"
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: ".14em",
          color: "var(--muted)",
          marginBottom: 10,
          padding: "0 8px",
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>{children}</div>
    </div>
  );
}

function SearchInner() {
  const params = useSearchParams();
  const t = useT();
  const { lang } = useLang();
  const [q, setQ] = useState<string>(params.get("q") ?? "");
  const [pillar, setPillar] = useState<"All" | PillarId>("All");
  const [allResults, setAllResults] = useState<ReadonlyArray<ArticleView>>([]);
  const [loading, setLoading] = useState(false);

  // Debounced DB search via the server action. Pillar narrowing happens
  // client-side on the returned set (small, capped) so the facet stays instant.
  useEffect(() => {
    const query = q.trim();
    if (!query) {
      setAllResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const id = setTimeout(() => {
      runSearch(query)
        .then((r) => setAllResults(r))
        .catch(() => setAllResults([]))
        .finally(() => setLoading(false));
    }, 220);
    return () => clearTimeout(id);
  }, [q]);

  const results =
    pillar === "All" ? allResults : allResults.filter((a) => a.pillar === pillar);

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div style={{ marginBottom: 32 }}>
        <div className="kicker" style={{ marginBottom: 6 }}>
          {t("Search", "Tìm kiếm", "Cari")}
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
            placeholder={t(
              "Search published stories…",
              "Tìm bài đã đăng…",
              "Cari artikel terbit…"
            )}
            style={{
              flex: 1,
              padding: "16px 18px",
              border: "1px solid var(--hair-2)",
              borderRadius: 6,
              fontSize: 20,
              background: "var(--surface)",
              color: "var(--ink)",
              fontFamily: "var(--font-serif)",
              fontWeight: 500,
            }}
          />
          <span className="text-mute mono" style={{ fontSize: 11 }}>
            {loading
              ? t("Searching…", "Đang tìm…", "Mencari…")
              : `${results.length} ${t("matches", "kết quả", "hasil")}`}
          </span>
        </div>
      </div>

      <div className="r-sidebar" style={{ display: "grid", gap: 36 }}>
        <aside style={{ position: "sticky", top: 160, alignSelf: "flex-start" }}>
          <FacetBlock title={t("Pillar", "Chuyên mục", "Pilar")}>
            {(["All", ...PILLARS.map((p) => p.id)] as Array<"All" | PillarId>).map((p) => (
              <button
                key={p}
                onClick={() => setPillar(p)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  textAlign: "left",
                  padding: "6px 8px",
                  background: pillar === p ? "var(--surface-2)" : "transparent",
                  border: "none",
                  borderRadius: 4,
                  fontSize: 13,
                  cursor: "pointer",
                  color: "var(--ink)",
                }}
              >
                {p !== "All" && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      background: pillarOf(p).color,
                      display: "inline-block",
                    }}
                  />
                )}
                {p === "All"
                  ? t("All pillars", "Tất cả chuyên mục", "Semua pilar")
                  : localizedPillarLabel(p, lang)}
                <span
                  className="text-mute-2 mono"
                  style={{ fontSize: 10, marginLeft: "auto" }}
                >
                  {p === "All"
                    ? allResults.length
                    : allResults.filter((a) => a.pillar === p).length}
                </span>
              </button>
            ))}
          </FacetBlock>

          <div
            style={{
              padding: 14,
              background: "var(--surface)",
              border: "1px solid var(--hair)",
              borderRadius: 6,
              marginTop: 18,
              fontSize: 12,
              color: "var(--muted)",
              lineHeight: 1.45,
            }}
          >
            {t(
              "Searches published article titles and standfirsts. Typo-tolerant search and more filters are coming.",
              "Tìm trong tiêu đề và sapo của bài đã đăng. Tìm kiếm chịu lỗi gõ và bộ lọc thêm sẽ có sau.",
              "Mencari judul dan standfirst artikel terbit. Pencarian toleran typo dan filter lain menyusul."
            )}
          </div>
        </aside>

        <div>
          {!q.trim() && (
            <div style={{ padding: "32px 0" }}>
              <div className="kicker text-mute" style={{ marginBottom: 14 }}>
                {t("Try searching", "Thử tìm", "Coba cari")}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SUGGESTED.map((tt) => (
                  <button
                    key={tt}
                    onClick={() => setQ(tt)}
                    className="pill"
                    style={{ cursor: "pointer", border: "1px solid var(--hair-2)" }}
                  >
                    {tt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {q.trim() && !loading && results.length === 0 && (
            <div
              style={{
                padding: "40px 24px",
                border: "1px dashed var(--hair-2)",
                borderRadius: 6,
                textAlign: "center",
              }}
            >
              <div className="serif" style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>
                {t("No results for", "Không có kết quả cho", "Tidak ada hasil untuk")} &ldquo;{q}&rdquo;
              </div>
              <div className="text-mute" style={{ fontSize: 13 }}>
                {t(
                  "Try a different keyword.",
                  "Thử từ khóa khác.",
                  "Coba kata kunci lain."
                )}
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {results.map((a) => (
              <Link
                key={a.id}
                href={`/article/${a.slug}`}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                <article
                  style={{
                    display: "grid",
                    gridTemplateColumns: "160px 1fr",
                    gap: 20,
                    padding: "22px 0",
                    borderBottom: "1px solid var(--hair)",
                    cursor: "pointer",
                  }}
                >
                  <CoverArt
                    pillar={a.pillar}
                    seed={a.id}
                    src={a.heroImageUrl}
                    variant={a.id.charCodeAt(0) % 6}
                    height={110}
                  />
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 6,
                      }}
                    >
                      <PillarTag id={a.pillar} label={localizedPillarLabel(a.pillar, lang)} />
                      <span className="mono text-mute-2" style={{ fontSize: 11 }}>
                        {a.section}
                      </span>
                      <span className="text-mute-2" style={{ fontSize: 11 }}>
                        ·
                      </span>
                      <span className="mono text-mute-2" style={{ fontSize: 11 }}>
                        {fmtDateL(a.published, lang)}
                      </span>
                    </div>
                    <h3
                      className="serif"
                      style={{
                        margin: "0 0 6px",
                        fontSize: 21,
                        fontWeight: 600,
                        lineHeight: 1.3,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {a.title}
                    </h3>
                    <p
                      className="serif text-mute"
                      style={{ margin: "0 0 8px", fontSize: 14, lineHeight: 1.5 }}
                    >
                      {a.dek}
                    </p>
                    <div className="text-mute" style={{ fontSize: 12 }}>
                      {t("By", "Bởi", "Oleh")} {a.author} · {a.readMin} min · <TimeAgo iso={a.published} />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * `useSearchParams()` forces this subtree to render client-side, so Next 15
 * requires a Suspense boundary around it or the whole route bails out of static
 * generation and the production build errors.
 */
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }} />
      }
    >
      <SearchInner />
    </Suspense>
  );
}
