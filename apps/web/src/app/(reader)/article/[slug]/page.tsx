import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { ArticleContent } from "@/components/article/article-content";
import { toArticleView, pillarLabel } from "@/lib/article-view";
import {
  getArticleBySlug,
  getArticleBySlugDraft,
  getRelatedArticles,
} from "@/lib/cms-client";
import {
  absoluteUrl,
  buildArticleJsonLd,
  buildMetadata,
  DEFAULT_OG_IMAGE,
  toJsonLdScript,
} from "@/lib/metadata";
import type { Article, Author, Media, Pillar } from "@/payload/payload-types";

export const revalidate = 60;

/** Stand-in publishedAt for an unpublished draft — see its use below. */
const DRAFT_CURSOR = "9999-12-31T23:59:59.999Z";

// Without this, a page under a dynamic segment is fully dynamic in Next 15
// and the `revalidate` above is silently ignored (SSR per request, no-store
// headers). Empty is enough: articles build on first request, cache for 60s,
// and the articles:all afterChange hook still busts by tag on publish/edit.
// draftMode() stays compatible — an enabled draft cookie bypasses the cache.
export function generateStaticParams(): Array<{ slug: string }> {
  return [];
}

/** Narrow a Payload relationship field (id | expanded doc) to the expanded
 *  doc. The depth:2 queries this page uses always return the expanded shape
 *  for these fields — this only guards the type. */
function expand<T extends { id: number }>(v: (number | T) | null | undefined): T | null {
  return v != null && typeof v === "object" ? v : null;
}

interface ResolvedImage {
  url: string;
  width?: number;
  height?: number;
  alt: string;
}

/**
 * Three-tier hero image fallback (RFC-004): the 1600w `hero` derivative,
 * else the original upload (present whenever a hero was smaller than the
 * derivative threshold), else the static branded default.
 */
function resolveHeroImage(article: Article): ResolvedImage {
  const hero = expand<Media>(article.heroImage);
  if (!hero) return { ...DEFAULT_OG_IMAGE };

  const heroSize = hero.sizes?.hero;
  if (heroSize?.url) {
    return {
      url: heroSize.url,
      width: heroSize.width ?? undefined,
      height: heroSize.height ?? undefined,
      alt: hero.alt || DEFAULT_OG_IMAGE.alt,
    };
  }
  if (hero.url) {
    return {
      url: hero.url,
      width: hero.width ?? undefined,
      height: hero.height ?? undefined,
      alt: hero.alt || DEFAULT_OG_IMAGE.alt,
    };
  }
  return { ...DEFAULT_OG_IMAGE };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { isEnabled: isDraft } = await draftMode();
  const article = isDraft
    ? await getArticleBySlugDraft(slug)
    : await getArticleBySlug(slug);
  if (!article) notFound();

  const pillar = expand<Pillar>(article.pillar);
  const author = expand<Author>(article.author);
  const coAuthors = Array.isArray(article.coAuthors)
    ? article.coAuthors.map((a) => expand<Author>(a)).filter((a): a is Author => a !== null)
    : [];

  const image = resolveHeroImage(article);

  return buildMetadata({
    title: article.title,
    description: article.dek,
    canonicalPath: `/article/${article.slug}`,
    image,
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    authors: author ? [author.name, ...coAuthors.map((a) => a.name)] : coAuthors.map((a) => a.name),
    // `heading` first (the editor's explicit override), then the pillar title in
    // whichever shape the CMS served it — Central sends a plain string, local
    // Payload an {en,vi,id} group.
    section: pillar?.heading || (pillar ? pillarLabel(pillar, "") : "") || undefined,
    robots: isDraft ? { index: false, follow: false } : undefined,
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Draft mode (enabled only via the authenticated /preview route) shows the
  // unpublished draft; everyone else gets the cached, published-only fetch.
  const { isEnabled: isDraft } = await draftMode();
  const article = isDraft
    ? await getArticleBySlugDraft(slug)
    : await getArticleBySlug(slug);
  if (!article) notFound();

  const view = toArticleView(article);
  // Chains backwards through the pillar rather than re-showing its newest
  // stories, so the "Read next" links form a crawlable path into the archive
  // instead of pointing everything back at the front page.
  //
  // An unpublished draft has no publishedAt to anchor the cursor to. The
  // sentinel sorts after every real timestamp, so the cursor degrades to "the
  // beat's newest" — and being a constant, it keeps the unstable_cache key
  // stable (a `new Date()` here would mint a fresh cache entry per render).
  const related = (
    await getRelatedArticles(
      view.pillar,
      article.publishedAt ?? DRAFT_CURSOR,
      article.id,
      3
    )
  ).map(toArticleView);

  // Draft/preview renders are never indexable and never emit JSON-LD — the
  // content isn't final and shouldn't be treated as a published NewsArticle.
  let jsonLdScript: string | null = null;
  if (!isDraft) {
    const author = expand<Author>(article.author);
    const coAuthors = Array.isArray(article.coAuthors)
      ? article.coAuthors.map((a) => expand<Author>(a)).filter((a): a is Author => a !== null)
      : [];
    const image = resolveHeroImage(article);
    const canonicalPath = `/article/${article.slug}`;

    const jsonLd = buildArticleJsonLd({
      title: article.title,
      description: article.dek,
      canonicalUrl: absoluteUrl(canonicalPath),
      imageUrl: absoluteUrl(image.url),
      imageWidth: image.width,
      imageHeight: image.height,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt,
      authorName: author?.name ?? "Staff",
      authorRole: author?.role,
      coAuthorNames: coAuthors.map((a) => a.name),
    });
    jsonLdScript = toJsonLdScript(jsonLd);
  }

  return (
    <>
      {jsonLdScript ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript }}
        />
      ) : null}
      <ArticleContent article={view} body={article.body ?? null} related={related} />
    </>
  );
}
