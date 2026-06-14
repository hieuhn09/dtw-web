"use client";

import { RichText } from "@payloadcms/richtext-lexical/react";
import { DisclosureBox } from "@dtw/ui";
import type { ArticleBodyState, ArticleView } from "@/lib/article-view";
import { useT } from "@/lib/i18n";

type EditorState = NonNullable<ArticleBodyState>;

/**
 * Split the Lexical root children in half so a middle disclosure box can be
 * injected between the two halves (invariant #5: sponsored boxes appear at
 * top + middle + bottom). Each half is itself a valid editor state that
 * RichText can render independently. (AI-assisted inline disclosure was removed
 * by product decision 2026-06-05 — see all-context.md invariant #5.)
 */
function splitBody(body: EditorState): [EditorState, EditorState] {
  const children = body.root.children ?? [];
  const mid = Math.ceil(children.length / 2);
  const mk = (slice: typeof children): EditorState => ({
    ...body,
    root: { ...body.root, children: slice },
  });
  return [mk(children.slice(0, mid)), mk(children.slice(mid))];
}

const proseStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 17,
  lineHeight: 1.65,
  color: "var(--ink)",
  maxWidth: 680,
  margin: "0 auto",
};

/**
 * Localized sponsored disclosure (invariant #10: chrome is translated). Passes
 * title/body overrides to the @dtw/ui DisclosureBox primitive (which is i18n-free).
 */
function SponsoredBox({
  article,
  position,
}: {
  article: ArticleView;
  position: "top" | "middle" | "bottom";
}) {
  const t = useT();
  if (!article.sponsored) return null;
  const label = t("Paid Partner", "Đối tác trả phí", "Mitra Berbayar");
  return (
    <DisclosureBox
      kind="sponsored"
      sponsor={article.sponsor}
      position={position}
      title={`${label}${article.sponsor ? ` · ${article.sponsor}` : ""}`}
      body={t(
        "This is a sponsored feature produced by DTW Studio for the partner above. The DTW newsroom was not involved in writing or editing.",
        "Đây là nội dung tài trợ do DTW Studio sản xuất cho đối tác nêu trên. Toà soạn DTW không tham gia viết hay biên tập.",
        "Ini adalah konten bersponsor yang diproduksi oleh DTW Studio untuk mitra di atas. Ruang redaksi DTW tidak terlibat dalam penulisan atau penyuntingan."
      )}
    />
  );
}

export function ArticleBody({
  body,
  article,
}: {
  body: ArticleBodyState;
  article: ArticleView;
}) {
  const hasBody = Boolean(body && (body.root.children?.length ?? 0) > 0);

  if (!hasBody || !body) {
    return (
      <div style={proseStyle} className="article-prose">
        <SponsoredBox article={article} position="top" />
        <p className="text-mute" style={{ fontStyle: "italic" }}>
          This article has no body content yet.
        </p>
        <SponsoredBox article={article} position="bottom" />
      </div>
    );
  }

  const [first, second] = splitBody(body);

  return (
    <div style={proseStyle} className="article-prose">
      <SponsoredBox article={article} position="top" />

      <RichText data={first} />

      <SponsoredBox article={article} position="middle" />

      <RichText data={second} />

      <SponsoredBox article={article} position="bottom" />
    </div>
  );
}
