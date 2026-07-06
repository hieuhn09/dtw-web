import { timingSafeEqual } from "node:crypto";
import { getPayload } from "payload";
import {
  convertMarkdownToLexical,
  editorConfigFactory,
} from "@payloadcms/richtext-lexical";
import config from "../../../../../payload.config";

/**
 * Engine intake — content-engine PayloadAdapter (Phase 5A) POSTs a normalized,
 * AI-assisted article here; this route creates a PUBLISHED Articles row.
 *
 * Contract (engine → dtw-web), mirrors src/publishers/payload-adapter.ts:
 *   POST /api/engine/intake
 *   Authorization: Bearer {DTW_INTAKE_TOKEN}
 *   Body: { title, dek, pillarSlug, body_markdown, tags[], heroImageUrl|null,
 *           imageCredit?, byline, slug?, aiAssisted:true,
 *           sourceProvenance:{ url, name, author?, accessedAt }, publishedAt }
 *   Response: { id }
 *
 * Security: this is a service-to-service endpoint guarded by a shared bearer
 * token (constant-time compared). Local API `payload.create` runs server-side
 * and bypasses Payload access control by default, so no CMS user/API key is
 * needed — the bearer check is the trust boundary. The Articles afterChange
 * revalidate hook still fires (intended — published content must revalidate).
 *
 * Engine writes are marked origin:'engine', editedByHuman:false (so the Phase E4
 * version/lock enforcement, once live, treats them as machine writes).
 */

/** Source-provenance block from the engine. */
interface SourceProvenance {
  url?: unknown;
  name?: unknown;
  author?: unknown;
  accessedAt?: unknown;
}

/** Intake request body — defensively typed (everything `unknown` until validated). */
interface IntakeBody {
  title?: unknown;
  dek?: unknown;
  pillarSlug?: unknown;
  body_markdown?: unknown;
  tags?: unknown;
  heroImageUrl?: unknown;
  imageCredit?: unknown;
  byline?: unknown;
  slug?: unknown;
  aiAssisted?: unknown;
  sourceProvenance?: SourceProvenance;
  publishedAt?: unknown;
}

const WORDS_PER_MINUTE = 220;
const DEFAULT_READ_MIN = 5;
const DEFAULT_AUTHOR_ROLE = "Staff Writer";
const DEFAULT_AUTHOR_CITY = "Singapore";

/** kebab-case slugify — ASCII fold, strip non-alphanumerics, collapse dashes. */
function slugify(input: string): string {
  return input
    .normalize("NFKD") // decompose accents so the alphanumeric filter drops them
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // also strips combining diacritic marks left by NFKD
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** Constant-time bearer check. Returns false on any shape/length mismatch. */
function bearerMatches(header: string | null, expected: string): boolean {
  if (!header) return false;
  const prefix = "Bearer ";
  if (!header.startsWith(prefix)) return false;
  const presented = header.slice(prefix.length).trim();
  const a = Buffer.from(presented, "utf8");
  const b = Buffer.from(expected, "utf8");
  // timingSafeEqual throws on length mismatch — guard first (length is not secret).
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/** Estimate read time (minutes) from a markdown word count, floored at 1. */
function estimateReadMin(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return DEFAULT_READ_MIN;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: Request): Promise<Response> {
  // 1. Auth — shared bearer secret, constant-time compared.
  const expectedToken = process.env.DTW_INTAKE_TOKEN;
  if (!expectedToken) {
    // Misconfiguration is a server fault, not a client one. Never silently 200.
    console.error("[engine-intake] DTW_INTAKE_TOKEN is not set");
    return json({ error: "intake not configured" }, 500);
  }
  if (!bearerMatches(request.headers.get("authorization"), expectedToken)) {
    return json({ error: "unauthorized" }, 401);
  }

  // 2. Parse + validate body.
  let body: IntakeBody;
  try {
    body = (await request.json()) as IntakeBody;
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }

  const title = body.title;
  const pillarSlug = body.pillarSlug;
  const bodyMarkdown = body.body_markdown;
  const missing: string[] = [];
  if (!isNonEmptyString(title)) missing.push("title");
  if (!isNonEmptyString(pillarSlug)) missing.push("pillarSlug");
  if (!isNonEmptyString(bodyMarkdown)) missing.push("body_markdown");
  if (missing.length > 0) {
    return json({ error: `missing required fields: ${missing.join(", ")}` }, 400);
  }
  // Narrowed by the guards above.
  const titleStr = title as string;
  const pillarSlugStr = pillarSlug as string;
  const bodyMarkdownStr = bodyMarkdown as string;

  // Derived, always-present fields.
  const slug = isNonEmptyString(body.slug) ? slugify(body.slug) : slugify(titleStr);
  if (!slug) return json({ error: "could not derive a slug" }, 400);

  const dek = isNonEmptyString(body.dek)
    ? (body.dek as string).trim()
    : titleStr.slice(0, 200);

  const byline = isNonEmptyString(body.byline) ? (body.byline as string).trim() : "";

  const tags: string[] = Array.isArray(body.tags)
    ? body.tags.filter(isNonEmptyString).map((t) => t.trim())
    : [];

  const heroImageUrl = isNonEmptyString(body.heroImageUrl)
    ? (body.heroImageUrl as string)
    : null;

  // Photographer / source credit for the hero image (engine-provided). Falls
  // back to the article's source publisher name when absent.
  const imageCredit = isNonEmptyString(body.imageCredit)
    ? (body.imageCredit as string).trim()
    : null;

  const provenance = body.sourceProvenance ?? {};
  const sourceUrl = isNonEmptyString(provenance.url) ? (provenance.url as string) : null;
  const sourceName = isNonEmptyString(provenance.name)
    ? (provenance.name as string)
    : null;

  const publishedAt = isNonEmptyString(body.publishedAt)
    ? (body.publishedAt as string)
    : new Date().toISOString();

  try {
    const payload = await getPayload({ config });
    const log = (msg: string, extra?: Record<string, unknown>) =>
      console.log(`[engine-intake] ${msg}`, extra ?? "");

    // 3. Idempotency — if a published article already exists for this source
    //    URL, return it instead of creating a duplicate (engine may retry).
    if (sourceUrl) {
      const existing = await payload.find({
        collection: "articles",
        where: { engineSourceUrl: { equals: sourceUrl } },
        limit: 1,
        depth: 0,
      });
      if (existing.docs.length > 0) {
        const doc = existing.docs[0] as { id: number | string };
        log("idempotent hit — returning existing article", {
          id: doc.id,
          sourceUrl,
        });
        return json({ id: doc.id }, 200);
      }
    }

    // 4. Resolve pillar by slug → id. Unknown pillar is a contract error (422).
    const pillarRes = await payload.find({
      collection: "pillars",
      where: { slug: { equals: pillarSlugStr } },
      limit: 1,
      depth: 0,
    });
    if (pillarRes.docs.length === 0) {
      return json({ error: `unknown pillar: ${pillarSlugStr}` }, 422);
    }
    const pillarId = (pillarRes.docs[0] as { id: number }).id;

    // 5. Resolve/create tags (find-or-create by slug).
    const tagIds: number[] = [];
    for (const rawTag of tags) {
      const tagSlug = slugify(rawTag);
      if (!tagSlug) continue;
      const found = await payload.find({
        collection: "tags",
        where: { slug: { equals: tagSlug } },
        limit: 1,
        depth: 0,
      });
      if (found.docs.length > 0) {
        tagIds.push((found.docs[0] as { id: number }).id);
        continue;
      }
      const created = await payload.create({
        collection: "tags",
        data: { slug: tagSlug, title: { en: rawTag } },
      });
      tagIds.push((created as { id: number }).id);
    }

    // 6. Resolve author by byline name; create with defaults if missing.
    let authorId: number | null = null;
    if (byline) {
      const foundAuthor = await payload.find({
        collection: "authors",
        where: { name: { equals: byline } },
        limit: 1,
        depth: 0,
      });
      if (foundAuthor.docs.length > 0) {
        authorId = (foundAuthor.docs[0] as { id: number }).id;
      } else {
        const createdAuthor = await payload.create({
          collection: "authors",
          data: {
            name: byline,
            role: DEFAULT_AUTHOR_ROLE,
            city: DEFAULT_AUTHOR_CITY,
          },
        });
        authorId = (createdAuthor as { id: number }).id;
        log("created missing author from byline", { byline, id: authorId });
      }
    }
    if (authorId == null) {
      return json({ error: "missing byline — cannot resolve required author" }, 400);
    }

    // 7. Hero image — best-effort. Fetch remote → Buffer → media upload.
    //    Failure does NOT block publishing (reader falls back to cover art).
    let heroImageId: number | null = null;
    if (heroImageUrl) {
      try {
        const res = await fetch(heroImageUrl);
        if (!res.ok) {
          throw new Error(`hero fetch ${res.status}`);
        }
        const arrayBuf = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        const mimetype = res.headers.get("content-type")?.split(";")[0]?.trim() ||
          "image/jpeg";
        const ext = mimetype.split("/")[1] || "jpg";
        const media = await payload.create({
          collection: "media",
          data: { alt: titleStr, credit: imageCredit ?? sourceName ?? undefined },
          file: {
            data: buffer,
            mimetype,
            name: `${slug}.${ext}`,
            size: buffer.length,
          },
        });
        heroImageId = (media as { id: number }).id;
      } catch (err) {
        log("hero image upload failed — publishing without hero", {
          heroImageUrl,
          err: (err as Error).message,
        });
      }
    }

    // 8. Markdown → Lexical. Use the already-resolved sanitized config off the
    //    payload instance (the imported `config` is still a Promise).
    const editorConfig = await editorConfigFactory.default({
      config: payload.config,
    });
    const lexicalBody = convertMarkdownToLexical({
      editorConfig,
      markdown: bodyMarkdownStr,
    });

    // 9. Create the published article.
    const doc = await payload.create({
      collection: "articles",
      data: {
        _status: "published",
        origin: "engine",
        editedByHuman: false,
        aiAssisted: true,
        title: titleStr,
        slug,
        dek,
        body: lexicalBody,
        pillar: pillarId,
        tags: tagIds,
        author: authorId,
        heroImage: heroImageId ?? undefined,
        publishedAt,
        readMin: estimateReadMin(bodyMarkdownStr),
        version: 1,
        engineSourceUrl: sourceUrl ?? undefined,
        engineSourceName: sourceName ?? undefined,
      },
    });

    const id = (doc as { id: number | string }).id;
    log("article published", { id, slug, pillar: pillarSlugStr });
    return json({ id }, 201);
  } catch (err) {
    console.error("[engine-intake] failed", err);
    return json({ error: (err as Error).message ?? "internal error" }, 500);
  }
}
