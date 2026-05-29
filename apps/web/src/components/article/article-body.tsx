import { DisclosureBox } from "@dtw/ui";
import { CoverArt } from "@/components/cover-art";
import type { ArticleView } from "@/lib/article-view";

const PARAS = [
  "On the edge of Tuas, behind two security fences and a row of palm trees nobody planted, sits a building most Singaporeans will never enter. Inside: 220 megawatts of compute, a private fibre ring to Changi, and the quiet ambition of a city-state to host the largest sovereign AI cluster in Southeast Asia.",
  "The official story is procurement. The unofficial story, told over three months of conversations with engineers, ministry officials, and one very tired procurement lawyer, is more interesting.",
  "Tuas-3, as it is internally called, was conceived in late 2024 as a hedge. Singapore's compute exports to the rest of ASEAN had quietly become an instrument of soft power – first for Indonesia, then for Vietnam – and the Economic Development Board wanted to keep the option open as workloads grew.",
  "Construction began in February 2025. By the time the second of three halls came online this March, the wait-list for capacity included two ministerial-grade tenants from Jakarta, a Hanoi-based foundation model lab, and three Bangkok unicorns.",
  "What makes Tuas-3 different is not the silicon – most of which is, predictably, NVIDIA – but the policy stack underneath it. Every workload runs inside a sovereign perimeter that the operator cannot inspect. Audit logs are escrowed with a third party. Power is contracted, not utility-supplied.",
  "That last point matters more than the others. Singapore's grid is famously constrained; the country has a moratorium on new datacenter capacity that was supposed to last through 2030. Tuas-3 sidesteps it by operating as a regulated industrial customer of a specific power purchase agreement – one that nobody else, including the operator's competitors, can replicate.",
];

const PULL =
  "Tuas-3 sidesteps the moratorium by operating as a regulated industrial customer of a power purchase agreement that nobody else can replicate.";

export function ArticleBody({ article }: { article: ArticleView }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-serif)",
        fontSize: 17,
        lineHeight: 1.65,
        color: "var(--ink)",
        maxWidth: 680,
        margin: "0 auto",
      }}
    >
      {PARAS.slice(0, 2).map((p, i) => (
        <p key={i} style={{ margin: "0 0 22px" }}>
          {p}
        </p>
      ))}

      {article.aiAssisted && <DisclosureBox kind="ai" position="top" />}
      {article.sponsored && (
        <DisclosureBox kind="sponsored" sponsor={article.sponsor} position="top" />
      )}

      {PARAS.slice(2, 4).map((p, i) => (
        <p key={i + 10} style={{ margin: "0 0 22px" }}>
          {p}
        </p>
      ))}

      <blockquote
        style={{
          margin: "40px -40px",
          padding: "24px 32px",
          borderLeft: "3px solid var(--accent)",
          background: "var(--surface)",
          fontSize: 22,
          lineHeight: 1.35,
          fontWeight: 500,
          letterSpacing: "-0.005em",
          color: "var(--ink-2)",
        }}
      >
        &ldquo;{PULL}&rdquo;
      </blockquote>

      <h3
        className="serif"
        style={{
          margin: "32px 0 14px",
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: "-0.015em",
        }}
      >
        The wait-list, in order
      </h3>

      <p style={{ margin: "0 0 22px" }}>{PARAS[4]}</p>

      <figure style={{ margin: "32px -40px" }}>
        <CoverArt
          pillar={article.pillar}
          seed={article.id + "-fig"}
          variant={4}
          height={300}
          label="DTW DATA DESK"
        />
        <figcaption
          className="text-mute"
          style={{ fontSize: 12, marginTop: 8, padding: "0 40px" }}
        >
          DTW Data Desk · Reconstructed from EMA filings and three operator interviews.
        </figcaption>
      </figure>

      <p style={{ margin: "0 0 22px" }}>{PARAS[5]}</p>

      {article.sponsored && (
        <DisclosureBox
          kind="sponsored"
          sponsor={article.sponsor}
          position="middle"
        />
      )}

      <h3
        className="serif"
        style={{
          margin: "32px 0 14px",
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: "-0.015em",
        }}
      >
        What Jakarta wants
      </h3>
      <p style={{ margin: "0 0 22px" }}>
        The Indonesian delegation that visited Tuas-3 in April left with a memorandum and an
        unspoken request: replicate the policy stack, not the steel. Jakarta is currently
        negotiating its own version of the PPA structure, with a target of 80 MW online by Q3 2027.
      </p>
      <p style={{ margin: "0 0 22px" }}>
        Whether the model travels is the open question. Singapore&apos;s regulatory consistency is
        part of what makes the financing work; Indonesia&apos;s is part of what makes its capex
        40% cheaper.
      </p>
      <p style={{ margin: "0 0 22px" }}>
        The next reveal – a third hall, a fourth tenant, and a question of whether Bangkok joins
        the wait-list – is expected in Q3.
      </p>

      {article.aiAssisted && <DisclosureBox kind="ai" position="bottom" />}
      {article.sponsored && (
        <DisclosureBox
          kind="sponsored"
          sponsor={article.sponsor}
          position="bottom"
        />
      )}
    </div>
  );
}
