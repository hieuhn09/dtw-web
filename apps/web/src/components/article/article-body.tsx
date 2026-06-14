"use client";

import { RichText } from "@payloadcms/richtext-lexical/react";
import { DisclosureBox } from "@dtw/ui";
import type { ArticleBodyState, ArticleView } from "@/lib/article-view";

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

function TopBoxes({ article }: { article: ArticleView }) {
  if (!article.sponsored) return null;
  return <DisclosureBox kind="sponsored" sponsor={article.sponsor} position="top" />;
}

function BottomBoxes({ article }: { article: ArticleView }) {
  if (!article.sponsored) return null;
  return <DisclosureBox kind="sponsored" sponsor={article.sponsor} position="bottom" />;
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
        <TopBoxes article={article} />
        <p className="text-mute" style={{ fontStyle: "italic" }}>
          This article has no body content yet.
        </p>
        <BottomBoxes article={article} />
      </div>
    );
  }

  const [first, second] = splitBody(body);

  return (
    <div style={proseStyle} className="article-prose">
      <TopBoxes article={article} />

      <RichText data={first} />

      {article.sponsored && (
        <DisclosureBox kind="sponsored" sponsor={article.sponsor} position="middle" />
      )}

      <RichText data={second} />

      <BottomBoxes article={article} />
    </div>
  );
}
