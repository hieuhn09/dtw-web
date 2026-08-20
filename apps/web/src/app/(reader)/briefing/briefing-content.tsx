"use client";

import Link from "next/link";
import { Button } from "@dtw/ui";
import { briefDate, briefEdition, type BriefEdition } from "@/lib/brief";
import type { ArticleView } from "@/lib/article-view";
import { fmtDateL, useLang, useT } from "@/lib/i18n";

export interface BriefingContentProps {
  editions: ReadonlyArray<ArticleView>;
  page: number;
  hasNextPage: boolean;
  totalDocs: number;
}

/** One day's pair of editions. `am`/`pm` stay null when an edition was skipped. */
interface BriefDay {
  date: string;
  am: ArticleView | null;
  pm: ArticleView | null;
}

/**
 * Group editions by their publication date, newest day first.
 *
 * A day can legitimately hold one edition: the engine skips a run rather than
 * padding a thin one, and the archive shows that gap honestly instead of
 * pretending a morning brief that never ran.
 */
function groupByDay(editions: ReadonlyArray<ArticleView>): BriefDay[] {
  const days = new Map<string, BriefDay>();
  for (const a of editions) {
    const date = briefDate(a.slug);
    const edition = briefEdition(a.slug);
    // Defensive: an article marked daily-brief whose slug doesn't parse has no
    // day to sit under. Skipping beats inventing one.
    if (!date || !edition) continue;
    const day = days.get(date) ?? { date, am: null, pm: null };
    day[edition] = a;
    days.set(date, day);
  }
  return [...days.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
}

function EditionChip({ edition }: { edition: BriefEdition }) {
  const t = useT();
  return (
    <span
      className="mono"
      style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: ".1em",
        color: "var(--accent)",
        textTransform: "uppercase",
      }}
    >
      {edition === "am" ? t("AM", "Sáng", "Pagi") : t("PM", "Tối", "Malam")}
    </span>
  );
}

/** One edition in the archive grid, or the honest gap where one didn't run. */
function EditionCell({ edition, article }: { edition: BriefEdition; article: ArticleView | null }) {
  const t = useT();

  if (!article) {
    return (
      <div style={{ padding: "16px 0", opacity: 0.45 }}>
        <EditionChip edition={edition} />
        <div className="text-mute" style={{ fontSize: 13, marginTop: 6 }}>
          {t("No edition", "Không có bản tin", "Tidak ada edisi")}
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/article/${article.slug}`}
      style={{ display: "block", padding: "16px 0", color: "inherit", textDecoration: "none" }}
    >
      <EditionChip edition={edition} />
      <div
        className="serif"
        style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.35, margin: "6px 0 4px" }}
      >
        {article.title}
      </div>
      <div
        className="text-mute"
        style={{
          fontSize: 13,
          lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {article.dek}
      </div>
    </Link>
  );
}

export function BriefingContent({ editions, page, hasNextPage, totalDocs }: BriefingContentProps) {
  const t = useT();
  const { lang } = useLang();
  const days = groupByDay(editions);
  // Page 1 pulls the most recent DAY out as the lead block — both editions when
  // both ran — and the archive picks up from the day before. Splitting by day
  // rather than by edition is what keeps a story from appearing twice on the
  // page while still letting a half-day show its real gap in the archive.
  const latest = page === 1 ? days[0] : undefined;
  const archive = latest ? days.slice(1) : days;

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 64, maxWidth: 860 }}>
      <div className="kicker" style={{ marginBottom: 8 }}>
        {t("The Brief", "Bản tin", "Brief")}
      </div>
      <h1
        className="serif"
        style={{
          margin: "0 0 14px",
          fontSize: "clamp(30px, 8vw, 48px)",
          fontWeight: 700,
          letterSpacing: "-0.025em",
          lineHeight: 1.05,
        }}
      >
        {page === 1
          ? t("AM Brief · PM Brief", "Bản tin Sáng · Bản tin Tối", "AM Brief · PM Brief")
          : t(`The Brief — Page ${page}`, `Bản tin — Trang ${page}`, `Brief — Halaman ${page}`)}
      </h1>
      <p
        className="serif text-mute"
        style={{ margin: "0 0 32px", fontSize: 19, lineHeight: 1.45 }}
      >
        {t(
          "Twice daily, morning and evening SGT. The tech day in a handful of stories, each one linking through to the full report.",
          "Hai lần mỗi ngày, sáng và tối giờ SGT. Một ngày công nghệ gói trong vài tin, mỗi tin dẫn tới bài đầy đủ.",
          "Dua kali sehari, pagi dan malam WIB+1 (SGT). Sehari teknologi dalam beberapa berita, masing-masing menautkan ke laporan lengkap."
        )}
      </p>

      {editions.length === 0 && (
        <div
          style={{
            padding: 24,
            background: "var(--surface-2)",
            borderRadius: 8,
            fontSize: 14,
            color: "var(--muted)",
          }}
        >
          {t(
            "No editions published yet. The first one lands soon.",
            "Chưa có bản tin nào. Số đầu tiên sẽ sớm lên.",
            "Belum ada edisi. Yang pertama segera terbit."
          )}
        </div>
      )}

      {latest && (
        <section style={{ marginBottom: 40 }}>
          <div className="kicker" style={{ marginBottom: 10 }}>
            {t("Latest", "Mới nhất", "Terbaru")} · {fmtDateL(`${latest.date}T00:00:00Z`, lang)}
          </div>
          <div className="r-brief-latest" style={{ display: "grid", gap: 16 }}>
            {(["am", "pm"] as const).map((edition) => {
              const article = latest[edition];
              if (!article) {
                return (
                  <div
                    key={edition}
                    style={{
                      padding: 24,
                      background: "var(--surface-2)",
                      border: "1px solid var(--hair)",
                      borderRadius: 10,
                      opacity: 0.6,
                    }}
                  >
                    <EditionChip edition={edition} />
                    <div className="text-mute" style={{ fontSize: 14, marginTop: 8 }}>
                      {t(
                        "This edition did not run.",
                        "Bản tin này không phát hành.",
                        "Edisi ini tidak terbit."
                      )}
                    </div>
                  </div>
                );
              }
              return (
                <Link
                  key={edition}
                  href={`/article/${article.slug}`}
                  style={{
                    display: "block",
                    padding: 24,
                    background: "var(--surface)",
                    border: "1px solid var(--hair)",
                    borderRadius: 10,
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 8 }}>
                    <EditionChip edition={edition} />
                    <span className="mono text-mute" style={{ fontSize: 11 }}>
                      {fmtDateL(article.published, lang)}
                    </span>
                  </div>
                  <div
                    className="serif"
                    style={{ fontSize: 22, fontWeight: 650, lineHeight: 1.22, marginBottom: 8 }}
                  >
                    {article.title}
                  </div>
                  <div className="text-mute" style={{ fontSize: 14.5, lineHeight: 1.55 }}>
                    {article.dek}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {archive.length > 0 && (
        <div>
          <div className="kicker" style={{ marginBottom: 4 }}>
            {t("Archive", "Lưu trữ", "Arsip")}
          </div>
          {archive.map((day) => (
            <div
              key={day.date}
              style={{ borderTop: "1px solid var(--hair)", padding: "10px 0" }}
            >
              <div
                className="mono text-mute"
                style={{ fontSize: 11, letterSpacing: ".06em", paddingTop: 6 }}
              >
                {fmtDateL(`${day.date}T00:00:00Z`, lang)}
              </div>
              <div className="r-brief-archive" style={{ display: "grid", gap: 24 }}>
                <EditionCell edition="am" article={day.am} />
                <EditionCell edition="pm" article={day.pm} />
              </div>
            </div>
          ))}
        </div>
      )}

      {(page > 1 || hasNextPage) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            marginTop: 32,
            borderTop: "1px solid var(--hair)",
            paddingTop: 24,
          }}
        >
          {page > 1 ? (
            <Button href={page === 2 ? "/briefing" : `/briefing/page/${page - 1}`} variant="outline" size="md">
              {t("← Newer", "← Mới hơn", "← Lebih baru")}
            </Button>
          ) : (
            <span />
          )}
          {hasNextPage && (
            <Button href={`/briefing/page/${page + 1}`} variant="outline" size="md">
              {t("Older →", "Cũ hơn →", "Lebih lama →")}
            </Button>
          )}
        </div>
      )}

      {totalDocs > 0 && (
        <div className="mono text-mute" style={{ fontSize: 11, marginTop: 16 }}>
          {t(`${totalDocs} editions`, `${totalDocs} bản tin`, `${totalDocs} edisi`)}
        </div>
      )}
    </div>
  );
}
