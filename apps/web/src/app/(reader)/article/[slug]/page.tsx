import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { ArticleContent } from "@/components/article/article-content";
import { toArticleView } from "@/lib/article-view";
import {
  getArticleBySlug,
  getArticleBySlugDraft,
  getArticlesByPillar,
} from "@/lib/payload-server";
import {
  absoluteUrl,
  buildArticleJsonLd,
  buildMetadata,
  DEFAULT_OG_IMAGE,
  toJsonLdScript,
} from "@/lib/metadata";
import type { Article, Author, Media, Pillar } from "@/payload/payload-types";

export const revalidate = 60;

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
    section: pillar?.heading || pillar?.title?.en,
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
  const relatedRaw = await getArticlesByPillar(view.pillar, 6);
  const related = relatedRaw
    .map(toArticleView)
    .filter((a) => a.slug !== view.slug)
    .slice(0, 3);

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
