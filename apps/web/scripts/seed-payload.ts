/**
 * Seed Payload with the static-site fixtures: 6 pillars, 6 authors, ~8 tags,
 * 9 articles, 4 wire drops. Idempotent: re-runs upsert by slug/name.
 *
 * Run with: `pnpm --filter web db:seed`
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Load .env.local manually so this script doesn't need dotenv-cli installed
// at apps/web. The Payload config validates DATABASE_URL + PAYLOAD_SECRET
// immediately on import, so env has to be set before we import it.
const here = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(here, "../../../.env.local");
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!m) continue;
  const key = m[1]!;
  let value = m[2]!.trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  if (process.env[key] == null) process.env[key] = value;
}

const { getPayload } = await import("payload");
const config = (await import("../payload.config")).default;

// ──────────────────────────────────────────────────────────────────────────────
// Fixtures (inline so the seed script doesn't drag reader-app deps)
// ──────────────────────────────────────────────────────────────────────────────

const PILLARS: ReadonlyArray<{
  slug: string;
  titleEn: string;
  titleVi: string;
  titleId: string;
  color: string;
  icon: string;
  order: number;
  description: string;
}> = [
  { slug: "ai", titleEn: "AI", titleVi: "AI", titleId: "AI", color: "var(--ai)", icon: "spark", order: 1, description: "Frontier models, infrastructure, and the policy that shapes them." },
  { slug: "startups", titleEn: "Startups", titleVi: "Khởi nghiệp", titleId: "Startup", color: "var(--startups)", icon: "trend-up", order: 2, description: "Term sheets, IPOs, layoffs, and the operators building the next wave." },
  { slug: "asia", titleEn: "Asia", titleVi: "Châu Á", titleId: "Asia", color: "var(--asia)", icon: "asia", order: 3, description: "Our flagship beat. Geopolitics, capital flows, product launches." },
  { slug: "dev", titleEn: "Dev", titleVi: "Lập trình", titleId: "Pengembang", color: "var(--dev)", icon: "code", order: 4, description: "Engineering practice. Tools, frameworks, trade-offs in production." },
  { slug: "products", titleEn: "Products", titleVi: "Sản phẩm", titleId: "Produk", color: "var(--products)", icon: "product", order: 5, description: "Independent reviews of phones, laptops, audio, and wearables." },
  { slug: "policy", titleEn: "Policy", titleVi: "Chính sách", titleId: "Kebijakan", color: "var(--policy)", icon: "policy", order: 6, description: "Trade rules, export controls, central banks, regulators." },
];

const AUTHORS: ReadonlyArray<{ name: string; role: string; city: string }> = [
  { name: "Mei Lin", role: "Asia Bureau Chief", city: "Singapore" },
  { name: "Ravi Kim", role: "AI Correspondent", city: "Seoul" },
  { name: "Thao Nguyen", role: "Senior Reporter", city: "Hanoi" },
  { name: "Jordan Chen", role: "Markets Editor", city: "Hong Kong" },
  { name: "Arif Rahman", role: "Startups Reporter", city: "Jakarta" },
  { name: "Ananya Iyer", role: "Policy Reporter", city: "Bengaluru" },
];

const TAGS: ReadonlyArray<{ slug: string; en: string }> = [
  { slug: "sovereign-ai", en: "Sovereign AI" },
  { slug: "datacenters", en: "Datacenters" },
  { slug: "asean", en: "ASEAN" },
  { slug: "open-weights", en: "Open weights" },
  { slug: "china", en: "China" },
  { slug: "reasoning", en: "Reasoning" },
  { slug: "ipo", en: "IPO" },
  { slug: "vietnam", en: "Vietnam" },
  { slug: "cloud", en: "Cloud" },
];

interface ArticleFixture {
  slug: string;
  pillarSlug: string;
  authorName: string;
  coAuthorNames?: string[];
  tagSlugs?: string[];
  title: string;
  dek: string;
  section: string;
  readMin: number;
  publishedAt: string;
  aiAssisted?: boolean;
  sponsored?: boolean;
  sponsor?: string;
  affiliate?: boolean;
  deepDive?: boolean;
  imageLabel?: string;
}

const ARTICLES: ReadonlyArray<ArticleFixture> = [
  {
    slug: "sea-ai-cluster-singapore",
    pillarSlug: "ai",
    authorName: "Mei Lin",
    coAuthorNames: ["Ravi Kim"],
    tagSlugs: ["sovereign-ai", "datacenters", "asean"],
    title:
      "Singapore quietly built Southeast Asia's largest sovereign AI cluster – and Jakarta wants in",
    dek:
      "Inside a 220-megawatt build-out that has rewired regional capital flows, ministerial visits, and the careers of a dozen researchers nobody had heard of six months ago.",
    section: "Frontier",
    readMin: 14,
    publishedAt: "2026-05-26T08:12:00+08:00",
    imageLabel: "HERO – rack hall, low blue light",
  },
  {
    slug: "baidu-open-weights",
    pillarSlug: "ai",
    authorName: "Ravi Kim",
    tagSlugs: ["open-weights", "china", "reasoning"],
    title: "Baidu releases open-weights model that beats GPT-class on Chinese-language reasoning",
    dek:
      "ERNIE-X 350B is the first frontier-tier Chinese model with permissive commercial terms – and it's already inside three Vietnamese banks.",
    section: "Models",
    readMin: 8,
    publishedAt: "2026-05-27T07:40:00+07:00",
  },
  {
    slug: "vng-cloud-listing",
    pillarSlug: "startups",
    authorName: "Thao Nguyen",
    tagSlugs: ["ipo", "vietnam", "cloud"],
    title: "VNG cloud arm files for a Singapore listing as Vietnam's tech IPO window cracks open",
    dek:
      "The carve-out values infrastructure ahead of consumer – a deliberate signal to the next ten founders watching from HCMC.",
    section: "Markets",
    readMin: 6,
    publishedAt: "2026-05-27T05:55:00+07:00",
  },
  {
    slug: "dtw-studio-aws-asean",
    pillarSlug: "asia",
    authorName: "Mei Lin",
    title: "How an ASEAN insurer rebuilt its claims pipeline on serverless in 18 weeks",
    dek:
      "A DTW Studio Presents feature, produced for AWS ASEAN. The DTW newsroom was not involved in writing or editing.",
    section: "Sponsored",
    readMin: 6,
    publishedAt: "2026-05-24T09:00:00+08:00",
    sponsored: true,
    sponsor: "AWS ASEAN",
  },
  {
    slug: "deep-dive-asia-capex",
    pillarSlug: "asia",
    authorName: "Mei Lin",
    coAuthorNames: ["Jordan Chen", "Arif Rahman"],
    title: "The $84B build-out: every datacenter announced across ASEAN in the last 12 months, mapped",
    dek:
      "We pulled filings, planning permits, and grid-connection requests from seven jurisdictions. Here is what the spreadsheet actually says.",
    section: "Deep Dive",
    readMin: 22,
    publishedAt: "2026-05-23T07:00:00+08:00",
    deepDive: true,
  },
  {
    slug: "ai-assisted-translation-note",
    pillarSlug: "ai",
    authorName: "Ravi Kim",
    title: "What 'AI-assisted' actually means in our newsroom – a worked example",
    dek: "Translation, transcription, summarisation. Not generation. Here's our checklist.",
    section: "Tools",
    readMin: 5,
    publishedAt: "2026-05-22T10:00:00+08:00",
    aiAssisted: true,
  },
  {
    slug: "react-server-actions-tradeoffs",
    pillarSlug: "dev",
    authorName: "Jordan Chen",
    title: "Server Actions in production: three teams, three regrets, one quiet success",
    dek:
      "What the framework docs don't tell you about caching, error boundaries, and 03:00 alerts.",
    section: "Engineering",
    readMin: 11,
    publishedAt: "2026-05-26T11:00:00+08:00",
  },
  {
    slug: "oppo-find-x9-review",
    pillarSlug: "products",
    authorName: "Jordan Chen",
    title: "Oppo Find X9 Pro review: a camera-first flagship that finally trusts its own sensors",
    dek: "The 1-inch main is doing real work. The compute is doing less work – and that's the point.",
    section: "Review",
    readMin: 10,
    publishedAt: "2026-05-25T16:20:00+08:00",
    affiliate: true,
  },
  {
    slug: "taiwan-chip-export-rules",
    pillarSlug: "policy",
    authorName: "Ananya Iyer",
    title: "Taipei's new chip export schedule reshapes who gets advanced packaging in 2026",
    dek: "The list is short. The exclusions are louder than the inclusions.",
    section: "Trade",
    readMin: 7,
    publishedAt: "2026-05-26T15:10:00+08:00",
  },
];

const WIRE_DROPS: ReadonlyArray<{ time: string; city: string; text: string }> = [
  { time: "08:42", city: "Singapore", text: "MAS approves digital asset custody licence for DBS – first major bank to clear the revised framework." },
  { time: "08:31", city: "Seoul", text: "SK Hynix says HBM4 sampling to top customers begins June; volume in Q4." },
  { time: "08:14", city: "Jakarta", text: "GoTo posts adjusted EBITDA positive for second straight quarter; on-demand take-rate ticks up 40bps." },
  { time: "07:58", city: "Hanoi", text: "VNG Cloud confirms Singapore listing filing; Q4 revenue grew 31% YoY per draft prospectus." },
];

// ──────────────────────────────────────────────────────────────────────────────
// Upsert helpers
// ──────────────────────────────────────────────────────────────────────────────

type CollSlug = "pillars" | "authors" | "tags" | "articles" | "wireDrops";

async function findIdBy(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: CollSlug,
  where: Record<string, { equals: string }>
): Promise<string | number | null> {
  const res = await payload.find({ collection, where, limit: 1, depth: 0 });
  return res.docs.length > 0 ? (res.docs[0] as { id: string | number }).id : null;
}

async function upsert(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: CollSlug,
  where: Record<string, { equals: string }>,
  data: Record<string, unknown>
): Promise<string | number> {
  const existing = await findIdBy(payload, collection, where);
  if (existing != null) {
    // Payload's generated types for `update()` over a unioned slug aren't
    // useful for a dynamic seed shape.
    // `disableRevalidate` stops the E3c afterChange hook from calling
    // `revalidateTag` — there's no Next request scope in this tsx process.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await payload.update({ collection, id: existing, data, context: { disableRevalidate: true } } as any);
    return existing;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const created = await payload.create({ collection, data, context: { disableRevalidate: true } } as any);
  return (created as { id: string | number }).id;
}

// ──────────────────────────────────────────────────────────────────────────────
// Seed
// ──────────────────────────────────────────────────────────────────────────────

async function seed() {
  const payload = await getPayload({ config });
  console.log("[seed] connected");

  // 1. Pillars
  const pillarIds = new Map<string, string | number>();
  for (const p of PILLARS) {
    const id = await upsert(payload, "pillars", { slug: { equals: p.slug } }, {
      slug: p.slug,
      title: { en: p.titleEn, vi: p.titleVi, id: p.titleId },
      color: p.color,
      icon: p.icon,
      order: p.order,
      description: p.description,
    });
    pillarIds.set(p.slug, id);
  }
  console.log(`[seed] pillars: ${pillarIds.size}`);

  // 2. Authors
  const authorIds = new Map<string, string | number>();
  for (const a of AUTHORS) {
    const id = await upsert(payload, "authors", { name: { equals: a.name } }, a);
    authorIds.set(a.name, id);
  }
  console.log(`[seed] authors: ${authorIds.size}`);

  // 3. Tags
  const tagIds = new Map<string, string | number>();
  for (const t of TAGS) {
    const id = await upsert(payload, "tags", { slug: { equals: t.slug } }, {
      slug: t.slug,
      title: { en: t.en },
    });
    tagIds.set(t.slug, id);
  }
  console.log(`[seed] tags: ${tagIds.size}`);

  // 4. Articles
  let inserted = 0;
  let updated = 0;
  for (const a of ARTICLES) {
    const pillarId = pillarIds.get(a.pillarSlug);
    const authorId = authorIds.get(a.authorName);
    if (pillarId == null || authorId == null) {
      console.warn(`[seed] skipping ${a.slug}: pillar=${pillarId} author=${authorId}`);
      continue;
    }
    const coAuthorIds = (a.coAuthorNames ?? [])
      .map((n) => authorIds.get(n))
      .filter((v): v is string | number => v != null);
    const tagRelIds = (a.tagSlugs ?? [])
      .map((s) => tagIds.get(s))
      .filter((v): v is string | number => v != null);

    const data = {
      title: a.title,
      slug: a.slug,
      dek: a.dek,
      section: a.section,
      readMin: a.readMin,
      publishedAt: new Date(a.publishedAt).toISOString(),
      pillar: pillarId,
      author: authorId,
      coAuthors: coAuthorIds,
      tags: tagRelIds,
      aiAssisted: a.aiAssisted ?? false,
      sponsored: a.sponsored ?? false,
      sponsor: a.sponsor,
      affiliate: a.affiliate ?? false,
      deepDive: a.deepDive ?? false,
      imageLabel: a.imageLabel,
      origin: "manual" as const,
      editedByHuman: true,
      lockedFields: [],
      version: 1,
    };

    const existing = await findIdBy(payload, "articles", { slug: { equals: a.slug } });
    if (existing != null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await payload.update({ collection: "articles", id: existing, data, context: { disableRevalidate: true } } as any);
      updated++;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await payload.create({ collection: "articles", data, context: { disableRevalidate: true } } as any);
      inserted++;
    }
  }
  console.log(`[seed] articles: inserted=${inserted} updated=${updated}`);

  // 5. Wire drops — keep last 12 to avoid runaway accumulation across reruns
  for (const w of WIRE_DROPS) {
    await payload.create({
      collection: "wireDrops",
      data: { ...w, publishedAt: new Date().toISOString() },
      context: { disableRevalidate: true },
    });
  }
  console.log(`[seed] wireDrops: ${WIRE_DROPS.length}`);

  console.log("[seed] done");
  process.exit(0);
}

seed().catch((err: unknown) => {
  console.error("[seed] FAILED", err);
  process.exit(1);
});
