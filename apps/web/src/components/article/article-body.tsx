"use client";

import { RichText, type JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import { DisclosureBox } from "@dtw/ui";
import type { ArticleBodyState, ArticleView } from "@/lib/article-view";
import { creditLabel } from "@/lib/credit";
import { useT } from "@/lib/i18n";

type EditorState = NonNullable<ArticleBodyState>;

/** The populated media doc inside a body upload node (Central depth-2 shape). */
type UploadDoc = {
  alt?: string | null;
  caption?: string | null;
  credit?: string | null;
  height?: number | null;
  mimeType?: string | null;
  sizes?: Record<
    string,
    { height?: number | null; mimeType?: string | null; url?: string | null; width?: number | null } | null
  > | null;
  url?: string | null;
  width?: number | null;
};

/**
 * Figcaption for inline body images, mirroring the hero credit chrome in
 * article-content.tsx (text-mute 11px). Exactly one label: any generic label
 * the editor typed ("Photo: ezCloud") is stripped and the localized "Credit"
 * label added; a meaningful one ("Render: Hyatt") is kept instead of ours.
 * See lib/credit.
 */
function BodyFigcaption({ caption, credit }: { caption?: string; credit?: string }) {
  const t = useT();
  const label = credit ? creditLabel(credit, t("Credit", "Nguồn ảnh", "Kredit foto")) : "";
  return (
    <figcaption
      className="text-mute"
      style={{ display: "flex", flexWrap: "wrap", fontSize: 11, gap: 8, marginTop: 8, padding: "0 4px" }}
    >
      {caption && <span style={{ fontStyle: "italic" }}>{caption}</span>}
      {label && <span>{label}</span>}
    </figcaption>
  );
}

/**
 * Inline body images. The default upload converter emits a bare <picture> and
 * silently drops the media doc's caption + credit — editors fill both at
 * upload and nothing showed in the article.
 */
const bodyConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  upload: ({ node }) => {
    if (typeof node.value !== "object" || node.value == null) return null;
    const media = node.value as UploadDoc;
    if (!media.url) return null;
    if (!(media.mimeType ?? "").startsWith("image")) {
      return (
        <a href={media.url} rel="noopener noreferrer">
          {media.alt || media.url}
        </a>
      );
    }
    const alt = ((node as { fields?: { alt?: string } }).fields?.alt || media.alt) ?? "";
    const caption = media.caption?.trim();
    const credit = media.credit?.trim();
    const sources = Object.entries(media.sizes ?? {}).filter(
      (e): e is [string, { url: string; width: number; mimeType: string }] =>
        Boolean(e[1]?.url && e[1]?.width && e[1]?.mimeType)
    );
    return (
      <figure style={{ margin: "28px 0" }}>
        <picture>
          {sources.map(([name, size]) => (
            <source key={name} media={`(max-width: ${size.width}px)`} srcSet={size.url} type={size.mimeType} />
          ))}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={alt}
            src={media.url}
            width={media.width ?? undefined}
            height={media.height ?? undefined}
            style={{ borderRadius: 6, display: "block", height: "auto", width: "100%" }}
          />
        </picture>
        {(caption || credit) && <BodyFigcaption caption={caption} credit={credit} />}
      </figure>
    );
  },
});

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
        "This is a sponsored feature produced by OTW Studio for the partner above. The Opentechwire newsroom was not involved in writing or editing.",
        "Đây là nội dung tài trợ do OTW Studio sản xuất cho đối tác nêu trên. Toà soạn Opentechwire không tham gia viết hay biên tập.",
        "Ini adalah konten bersponsor yang diproduksi oleh OTW Studio untuk mitra di atas. Ruang redaksi Opentechwire tidak terlibat dalam penulisan atau penyuntingan."
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

      <RichText converters={bodyConverters} data={first} />

      <SponsoredBox article={article} position="middle" />

      <RichText converters={bodyConverters} data={second} />

      <SponsoredBox article={article} position="bottom" />
    </div>
  );
}
