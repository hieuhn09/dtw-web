"use client";

import Link from "next/link";
import { Button } from "@dtw/ui";
import { briefEdition, type BriefEdition } from "@/lib/brief";
import type { ArticleView } from "@/lib/article-view";
import { fmtDateL, useLang, useT } from "@/lib/i18n";

export interface BriefBandProps {
  /** Newest published AM edition, or null when none has run yet. */
  am: ArticleView | null;
  /** Newest published PM edition, or null when none has run yet. */
  pm: ArticleView | null;
}

/** "AM" / "PM" chip text; falls back to the generic label for an unparsed slug. */
function editionLabel(edition: BriefEdition | null, t: (en: string, vi?: string, id?: string) => string): string {
  if (edition === "am") return t("AM", "SÁNG", "PAGI");
  if (edition === "pm") return t("PM", "TỐI", "MALAM");
  return t("BRIEF", "BẢN TIN", "BRIEF");
}

export function BriefBand({ am, pm }: BriefBandProps) {
  const t = useT();
  const { lang } = useLang();

  // Nothing published yet — render nothing rather than an empty frame. The
  // homepage flag gates the band's launch; this gates the days before the first
  // edition, and the days an engine run was skipped entirely.
  const editions = [am, pm].filter((a): a is ArticleView => a !== null);
  if (editions.length === 0) return null;

  return (
    <section style={{ margin: "0 0 40px" }}>
      <div
        className="r-brief"
        style={{
          display: "grid",
          background: "var(--surface)",
          border: "1px solid var(--hair)",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "22px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div className="kicker" style={{ color: "var(--ink)" }}>
            {t("The Brief", "Bản tin", "Brief")}
          </div>
          <div className="mono text-mute" style={{ fontSize: 11, marginTop: 6, lineHeight: 1.4 }}>
            {t(
              "Twice daily · morning & evening SGT",
              "Hai lần mỗi ngày · sáng & tối SGT",
              "Dua kali sehari · pagi & malam SGT"
            )}
          </div>
          <div
            className="r-brief-divider"
            style={{
              position: "absolute",
              right: 0,
              top: "22%",
              bottom: "22%",
              width: 1,
              background: "var(--hair)",
            }}
          />
        </div>

        {editions.map((a) => {
          const edition = briefEdition(a.slug);
          return (
            <Link
              key={a.id}
              href={`/article/${a.slug}`}
              style={{
                padding: "22px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                minWidth: 0,
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  color: "var(--accent)",
                  fontWeight: 600,
                  letterSpacing: ".1em",
                  marginBottom: 6,
                }}
              >
                {editionLabel(edition, t)} · {fmtDateL(a.published, lang)}
              </div>
              <div
                className="serif"
                style={{
                  fontSize: 14.5,
                  fontWeight: 600,
                  lineHeight: 1.35,
                  marginBottom: 6,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {a.title}
              </div>
              <div
                className="text-mute"
                style={{
                  fontSize: 12,
                  lineHeight: 1.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {a.dek}
              </div>
              <div
                className="r-brief-divider"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "22%",
                  bottom: "22%",
                  width: 1,
                  background: "var(--hair)",
                }}
              />
            </Link>
          );
        })}

        <div
          style={{
            padding: "22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button href="/briefing" variant="outline" size="md">
            {t("Read →", "Đọc →", "Baca →")}
          </Button>
        </div>
      </div>
    </section>
  );
}
