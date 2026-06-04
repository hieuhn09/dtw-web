import Link from "next/link";
import { getCorrections } from "@/lib/payload-server";

export const revalidate = 300;

type TrustSlug = "editorial" | "ai" | "corrections" | "transparency" | "sponsored";

interface CorrectionView {
  d: string;
  art: string;
  summary: string;
  was: string;
  now: string;
  editor?: string;
}

function fmtCorrectionDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Singapore",
  });
}

interface TrustPageContent {
  title: string;
  kicker: string;
  body: ReadonlyArray<readonly [heading: string, text: string]> | null;
}

const PAGES: Record<TrustSlug, TrustPageContent> = {
  editorial: {
    title: "Editorial Standards",
    kicker: "Last updated · 12 May 2026",
    body: [
      [
        "How we report",
        "We follow people, money, and policy across Asia tech. Every story names sources where possible, links to primary documents, and discloses how the reporter knows what they know.",
      ],
      [
        "Independence",
        "DTW does not accept review units, free travel, or paid trips. Our editorial budget is separate from DTW Studio (sponsored work) and from Pro membership revenue.",
      ],
      [
        "Anonymous sources",
        "We use them when necessary, never when convenient. Anonymity requires at least one editor's sign-off and a clear public-interest rationale.",
      ],
      [
        "Corrections",
        "We log every correction publicly with date, original text, and corrected text. See /trust/corrections.",
      ],
      [
        "Conflicts",
        "Reporters disclose holdings and prior employers on their bio page. We do not cover companies where a reporter has a direct financial interest without a second byline.",
      ],
    ],
  },
  ai: {
    title: "AI Disclosure",
    kicker: "What 'AI-assisted' means in our newsroom",
    body: [
      [
        "Use cases we allow",
        "Translation, transcription, summarisation of public documents, search-style retrieval, and proof-reading. Always reviewed by a human reporter before publication.",
      ],
      [
        "Use cases we don't",
        "Generative writing of body copy, generative image creation, fabricated quotes, or unsourced claims pulled from a model.",
      ],
      [
        "Labels",
        "Articles that use AI for any allowed task carry an 'AI-assisted' label at the top, middle, and bottom of the article. The label cannot be turned off.",
      ],
      [
        "Models",
        "We use commercial APIs from major providers, plus an internal translation pipeline. No reader data trains any third-party model.",
      ],
      [
        "Human accountability",
        "Every byline is a human. Every fact is human-verified. If something is wrong, a human is responsible.",
      ],
    ],
  },
  corrections: {
    title: "Corrections",
    kicker: "Public log · most recent first",
    body: null,
  },
  transparency: {
    title: "Transparency Report",
    kicker: "Q1 2026",
    body: [
      [
        "Headcount",
        "27 reporters, 6 editors, 4 data desk, 2 product, 1 ombudsperson.",
      ],
      [
        "Revenue mix",
        "62% Pro membership, 22% Newsletters & events, 12% DTW Studio (sponsored), 4% Affiliate.",
      ],
      [
        "Removed posts",
        "0 stories pulled. 14 corrections issued. 1 unpublished sponsored story (failed disclosure check).",
      ],
      [
        "Government requests",
        "Singapore: 0. India: 1 (data request, fulfilled in part). Vietnam: 0.",
      ],
      [
        "Newsletter deliverability",
        "98.7% inbox placement (Gmail), 96.1% (Outlook), measured by third party.",
      ],
    ],
  },
  sponsored: {
    title: "Sponsored & Affiliate Policy",
    kicker: "DTW Studio and review rules",
    body: [
      [
        "DTW Studio",
        "Sponsored content is produced by a separate studio team. Writers, editors, and the EIC of DTW Studio do not work on the newsroom. Articles carry a yellow background, a 'Paid Partner' label, and a top/middle/end disclosure that cannot be turned off.",
      ],
      [
        "What sponsors can do",
        "Choose a topic and review for factual accuracy of their own product. Approve images of their facilities.",
      ],
      [
        "What sponsors cannot do",
        "Approve or edit copy that names competitors. Choose pull-quotes. Mandate calls-to-action. Run beside any newsroom story.",
      ],
      [
        "Affiliate links",
        "Some product reviews carry affiliate links. They are marked with a $ icon and a tooltip on hover. Commission rates and partners are listed in our Q4 transparency report.",
      ],
      [
        "Refusals",
        "We have declined paid placements from 4 partners in the last 12 months over disclosure disagreements.",
      ],
    ],
  },
};

function CorrectionsLog({ items }: { items: ReadonlyArray<CorrectionView> }) {
  if (items.length === 0) {
    return (
      <div
        style={{
          padding: "32px 24px",
          border: "1px dashed var(--hair-2)",
          borderRadius: 6,
          color: "var(--muted)",
          fontSize: 15,
          lineHeight: 1.6,
        }}
      >
        No corrections have been issued yet. When we correct a published article,
        the change is logged here in full — date, original text, and corrected
        text — with the editor who signed it off.
      </div>
    );
  }
  return (
    <div>
      {items.map((c, i) => (
        <div key={i} style={{ padding: "18px 0", borderBottom: "1px solid var(--hair)" }}>
          <div className="mono text-mute" style={{ fontSize: 11, marginBottom: 6 }}>
            {c.d}
          </div>
          <div
            className="serif"
            style={{ fontSize: 17, fontWeight: 600, marginBottom: 8, color: "var(--ink)" }}
          >
            {c.art}
          </div>
          {c.summary && (
            <div className="text-mute" style={{ fontSize: 14, marginBottom: 10 }}>
              {c.summary}
            </div>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr",
              gap: 10,
              marginBottom: 6,
              fontSize: 14,
            }}
          >
            <span className="mono" style={{ color: "var(--down)", fontWeight: 600 }}>
              was:
            </span>
            <span style={{ textDecoration: "line-through", color: "var(--muted)" }}>
              {c.was}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 10, fontSize: 14 }}>
            <span className="mono" style={{ color: "var(--up)", fontWeight: 600 }}>
              now:
            </span>
            <span style={{ color: "var(--ink)" }}>{c.now}</span>
          </div>
          {c.editor && (
            <div className="text-mute-2 mono" style={{ fontSize: 11, marginTop: 8 }}>
              Signed off by {c.editor}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default async function TrustPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const key = (slug as TrustSlug) in PAGES ? (slug as TrustSlug) : "editorial";
  const page = PAGES[key];

  const corrections: CorrectionView[] =
    key === "corrections"
      ? (await getCorrections()).map((c) => ({
          d: fmtCorrectionDate(c.correctionDate),
          art: typeof c.article === "object" && c.article ? c.article.title : "",
          summary: c.summary,
          was: c.wasText,
          now: c.nowText,
          editor: typeof c.editor === "object" && c.editor ? c.editor.name : undefined,
        }))
      : [];

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <div className="r-sidebar" style={{ display: "grid", gap: 48 }}>
        <nav style={{ position: "sticky", top: 160, alignSelf: "flex-start" }}>
          <div
            className="upper text-mute"
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: ".14em",
              marginBottom: 12,
              textTransform: "uppercase",
            }}
          >
            Trust &amp; Transparency
          </div>
          {(Object.keys(PAGES) as TrustSlug[]).map((k) => (
            <Link
              key={k}
              href={`/trust/${k}`}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 10px",
                background: key === k ? "var(--surface-2)" : "transparent",
                borderRadius: 4,
                fontSize: 13,
                color: key === k ? "var(--ink)" : "var(--muted)",
                fontWeight: key === k ? 600 : 400,
                borderLeft:
                  key === k ? "2px solid var(--accent)" : "2px solid transparent",
                textDecoration: "none",
              }}
            >
              {PAGES[k].title}
            </Link>
          ))}
        </nav>

        <article style={{ maxWidth: 720 }}>
          <div className="kicker" style={{ marginBottom: 8 }}>
            {page.kicker}
          </div>
          <h1
            className="serif"
            style={{
              margin: "0 0 28px",
              fontSize: "clamp(30px, 8vw, 48px)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
            }}
          >
            {page.title}
          </h1>

          {key === "corrections" ? (
            <CorrectionsLog items={corrections} />
          ) : (
            <div style={{ fontFamily: "var(--font-serif)" }}>
              {page.body?.map(([h, text]) => (
                <section key={h} style={{ marginBottom: 32 }}>
                  <h2
                    style={{
                      margin: "0 0 8px",
                      fontSize: 22,
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      color: "var(--ink)",
                    }}
                  >
                    {h}
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 17,
                      lineHeight: 1.6,
                      color: "var(--ink-2)",
                    }}
                  >
                    {text}
                  </p>
                </section>
              ))}
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
