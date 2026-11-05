"use client";

import { RichText, type JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";
import type { ArticleBodyState } from "@/lib/article-view";
import { creditLabel } from "@/lib/credit";
import { useT } from "@/lib/i18n";

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

const proseStyle: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontSize: 17,
  lineHeight: 1.65,
  color: "var(--ink)",
  maxWidth: 680,
  margin: "0 auto",
};

export function ArticleBody({ body }: { body: ArticleBodyState }) {
  const hasBody = Boolean(body && (body.root.children?.length ?? 0) > 0);

  if (!hasBody || !body) {
    return (
      <div style={proseStyle} className="article-prose">
        <p className="text-mute" style={{ fontStyle: "italic" }}>
          This article has no body content yet.
        </p>
      </div>
    );
  }

  return (
    <div style={proseStyle} className="article-prose">
      <RichText converters={bodyConverters} data={body} />
    </div>
  );
}
