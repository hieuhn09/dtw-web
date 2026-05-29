// DTW sample data — ported from design/project/src/data.jsx
// This is reference / fixture data for the static site. It will be replaced by
// Payload CMS reads in Phase 2.

export type PillarId = "ai" | "startups" | "asia" | "dev" | "products" | "policy";

export interface Pillar {
  id: PillarId;
  label: string;
  /** CSS var() reference for the pillar color. */
  color: string;
  slug: string;
}

export const PILLARS: ReadonlyArray<Pillar> = [
  { id: "ai", label: "AI", color: "var(--ai)", slug: "/ai" },
  { id: "startups", label: "Startups", color: "var(--startups)", slug: "/startups" },
  { id: "asia", label: "Asia", color: "var(--asia)", slug: "/asia" },
  { id: "dev", label: "Dev", color: "var(--dev)", slug: "/dev" },
  { id: "products", label: "Products", color: "var(--products)", slug: "/products" },
  { id: "policy", label: "Policy", color: "var(--policy)", slug: "/policy" },
];

export interface NavItem {
  id: string;
  label: string;
  slug: string;
  badge?: boolean;
}

export const NAV_EXTRA: ReadonlyArray<NavItem> = [
  { id: "awards", label: "Awards", slug: "/awards" },
  { id: "studio", label: "Studio", slug: "/studio" },
  { id: "dashboards", label: "Dashboards", slug: "/dashboards" },
  { id: "newsletters", label: "Newsletters", slug: "/newsletters" },
  // Pro membership hidden until paid tier launches.
  // { id: "pro", label: "Pro", slug: "/pro", badge: true },
];

/**
 * Maps pillar id to its icon name in the icon set.
 * Mirrors design/project/src/icons.jsx::PILLAR_ICONS.
 */
export const PILLAR_ICONS: Record<PillarId, string> = {
  ai: "spark",
  startups: "trend-up",
  asia: "asia",
  dev: "code",
  products: "product",
  policy: "policy",
};

export interface Author {
  id: string;
  name: string;
  role: string;
  city: string;
}

export const AUTHORS: Record<string, Author> = {
  mlin: { id: "mlin", name: "Mei Lin", role: "Asia Bureau Chief", city: "Singapore" },
  rkim: { id: "rkim", name: "Ravi Kim", role: "AI Correspondent", city: "Seoul" },
  pthao: { id: "pthao", name: "Thao Nguyen", role: "Senior Reporter", city: "Hanoi" },
  jchen: { id: "jchen", name: "Jordan Chen", role: "Markets Editor", city: "Hong Kong" },
  arif: { id: "arif", name: "Arif Rahman", role: "Startups Reporter", city: "Jakarta" },
  ananya: { id: "ananya", name: "Ananya Iyer", role: "Policy Reporter", city: "Bengaluru" },
};

export function authorOf(id: string): Author {
  return AUTHORS[id] ?? { id, name: "Staff", role: "DTW", city: "" };
}

export interface ArticleImage {
  label: string;
}

export interface Article {
  id: string;
  slug: string;
  pillar: PillarId;
  section: string;
  title: string;
  dek: string;
  author: string;
  coAuthors?: ReadonlyArray<string>;
  published: string;
  readMin: number;
  tags?: ReadonlyArray<string>;
  aiAssisted?: boolean;
  sponsored?: boolean;
  sponsor?: string;
  affiliate?: boolean;
  deepDive?: boolean;
  image?: ArticleImage;
}

export const ARTICLES: ReadonlyArray<Article> = [
  {
    id: "a1",
    slug: "sea-ai-cluster-singapore",
    pillar: "ai",
    section: "Frontier",
    title:
      "Singapore quietly built Southeast Asia's largest sovereign AI cluster – and Jakarta wants in",
    dek:
      "Inside a 220-megawatt build-out that has rewired regional capital flows, ministerial visits, and the careers of a dozen researchers nobody had heard of six months ago.",
    author: "mlin",
    coAuthors: ["rkim"],
    published: "2026-05-26T08:12:00+08:00",
    readMin: 14,
    tags: ["sovereign-AI", "datacenters", "ASEAN"],
    aiAssisted: false,
    sponsored: false,
    image: { label: "HERO – rack hall, low blue light" },
  },
  {
    id: "a2",
    slug: "baidu-open-weights",
    pillar: "ai",
    section: "Models",
    title:
      "Baidu releases open-weights model that beats GPT-class on Chinese-language reasoning",
    dek:
      "ERNIE-X 350B is the first frontier-tier Chinese model with permissive commercial terms – and it's already inside three Vietnamese banks.",
    author: "rkim",
    published: "2026-05-27T07:40:00+07:00",
    readMin: 8,
    tags: ["open-weights", "china", "reasoning"],
  },
  {
    id: "a3",
    slug: "vng-cloud-listing",
    pillar: "startups",
    section: "Markets",
    title:
      "VNG cloud arm files for a Singapore listing as Vietnam's tech IPO window cracks open",
    dek:
      "The carve-out values infrastructure ahead of consumer – a deliberate signal to the next ten founders watching from HCMC.",
    author: "pthao",
    published: "2026-05-27T05:55:00+07:00",
    readMin: 6,
    tags: ["IPO", "vietnam", "cloud"],
  },
  {
    id: "a4",
    slug: "tokopedia-grab-merger-fallout",
    pillar: "startups",
    section: "Deals",
    title:
      "One year on, the Tokopedia–Grab merger is finally producing the layoffs nobody promised",
    dek: "Internal memos show a clean-up of overlapping logistics teams across three countries.",
    author: "arif",
    published: "2026-05-26T19:20:00+07:00",
    readMin: 9,
  },
  {
    id: "a5",
    slug: "taiwan-chip-export-rules",
    pillar: "policy",
    section: "Trade",
    title: "Taipei's new chip export schedule reshapes who gets advanced packaging in 2026",
    dek: "The list is short. The exclusions are louder than the inclusions.",
    author: "ananya",
    published: "2026-05-26T15:10:00+08:00",
    readMin: 7,
  },
  {
    id: "a6",
    slug: "react-server-actions-tradeoffs",
    pillar: "dev",
    section: "Engineering",
    title: "Server Actions in production: three teams, three regrets, one quiet success",
    dek: "What the framework docs don't tell you about caching, error boundaries, and 03:00 alerts.",
    author: "jchen",
    published: "2026-05-26T11:00:00+08:00",
    readMin: 11,
  },
  {
    id: "a7",
    slug: "oppo-find-x9-review",
    pillar: "products",
    section: "Review",
    title: "Oppo Find X9 Pro review: a camera-first flagship that finally trusts its own sensors",
    dek: "The 1-inch main is doing real work. The compute is doing less work – and that's the point.",
    author: "jchen",
    published: "2026-05-25T16:20:00+08:00",
    readMin: 10,
    affiliate: true,
  },
  {
    id: "a8",
    slug: "dtw-studio-aws-asean",
    pillar: "asia",
    section: "Sponsored",
    title: "How an ASEAN insurer rebuilt its claims pipeline on serverless in 18 weeks",
    dek:
      "A DTW Studio Presents feature, produced for AWS ASEAN. The DTW newsroom was not involved in writing or editing.",
    author: "mlin",
    published: "2026-05-24T09:00:00+08:00",
    readMin: 6,
    sponsored: true,
    sponsor: "AWS ASEAN",
  },
  {
    id: "a9",
    slug: "india-upi-cross-border",
    pillar: "policy",
    section: "Fintech",
    title:
      "UPI's cross-border push lands in Vietnam – and the central bank is watching the FX flow, not the apps",
    dek:
      "Bilateral rails are now live with four ASEAN countries. The economics underneath are weirder than they look.",
    author: "ananya",
    published: "2026-05-25T20:00:00+05:30",
    readMin: 8,
  },
  {
    id: "a10",
    slug: "deep-dive-asia-capex",
    pillar: "asia",
    section: "Deep Dive",
    title:
      "The $84B build-out: every datacenter announced across ASEAN in the last 12 months, mapped",
    dek:
      "We pulled filings, planning permits, and grid-connection requests from seven jurisdictions. Here is what the spreadsheet actually says.",
    author: "mlin",
    coAuthors: ["jchen", "arif"],
    published: "2026-05-23T07:00:00+08:00",
    readMin: 22,
    deepDive: true,
  },
  {
    id: "a11",
    slug: "ai-assisted-translation-note",
    pillar: "ai",
    section: "Tools",
    title: "What 'AI-assisted' actually means in our newsroom – a worked example",
    dek: "Translation, transcription, summarisation. Not generation. Here's our checklist.",
    author: "rkim",
    published: "2026-05-22T10:00:00+08:00",
    readMin: 5,
    aiAssisted: true,
  },
  {
    id: "a12",
    slug: "sea-fintech-quiet-quarter",
    pillar: "startups",
    section: "Funding",
    title:
      "Southeast Asia fintech had its quietest funding quarter since 2019 – but the deals that closed are revealing",
    dek: "Late-stage is dead. Seed is loud. Series A is doing something interesting.",
    author: "arif",
    published: "2026-05-21T14:00:00+07:00",
    readMin: 7,
  },
  // === fill so every pillar has ≥4 ===
  {
    id: "a13",
    slug: "alibaba-cloud-inference-tier",
    pillar: "ai",
    section: "Infra",
    title: "Alibaba Cloud opens a new inference tier and undercuts the hyperscalers by 30%",
    dek: "The pricing is the headline. The geography is the story.",
    author: "rkim",
    published: "2026-05-21T09:30:00+08:00",
    readMin: 6,
  },
  {
    id: "a14",
    slug: "korea-ai-chip-startups",
    pillar: "startups",
    section: "Hardware",
    title:
      "Three Seoul AI-chip startups just closed inside a week — and the same fund led two of them",
    dek: "The pattern is harder to read than the dollar amounts suggest.",
    author: "rkim",
    published: "2026-05-20T18:40:00+09:00",
    readMin: 8,
  },
  {
    id: "a15",
    slug: "jakarta-data-residency",
    pillar: "asia",
    section: "Policy",
    title:
      "Jakarta's new data-residency rules begin biting — and the cloud bills are starting to show it",
    dek: "Procurement teams quietly rerouting workloads. Hyperscalers quietly rerouting capacity.",
    author: "arif",
    published: "2026-05-21T11:15:00+07:00",
    readMin: 9,
  },
  {
    id: "a16",
    slug: "asean-cross-border-payments",
    pillar: "asia",
    section: "Fintech",
    title: "What the five-country ASEAN payments corridor actually feels like, six months in",
    dek: "The technology works. The economics do not yet. The regulators are watching the gap.",
    author: "mlin",
    published: "2026-05-20T08:00:00+08:00",
    readMin: 11,
  },
  {
    id: "a17",
    slug: "go-1-24-async-iterators",
    pillar: "dev",
    section: "Languages",
    title: "Go 1.24's range-over-func is finally landing — here's what changes in production",
    dek: "The iterator protocol is short, but the migration paths are not.",
    author: "jchen",
    published: "2026-05-20T14:30:00+08:00",
    readMin: 10,
  },
  {
    id: "a18",
    slug: "vercel-asia-edge",
    pillar: "dev",
    section: "Infra",
    title: "Asia got new edge regions this month — we ran them through a real workload to see what changed",
    dek: "Cold starts halved. Cross-region writes did not. Mileage varies.",
    author: "jchen",
    published: "2026-05-19T10:00:00+08:00",
    readMin: 8,
  },
  {
    id: "a19",
    slug: "kubernetes-1-32-pod-resize",
    pillar: "dev",
    section: "Engineering",
    title: "In-place pod resize is GA — what three platform teams learned migrating to it",
    dek: "It is not a free lunch. But it is a real one.",
    author: "jchen",
    published: "2026-05-18T11:00:00+08:00",
    readMin: 9,
  },
  {
    id: "a20",
    slug: "samsung-galaxy-s26-review",
    pillar: "products",
    section: "Review",
    title: "Samsung Galaxy S26 Ultra review: the year the camera stopped being the headline",
    dek: "Compute, battery, and a quietly better display do most of the work.",
    author: "jchen",
    published: "2026-05-19T15:00:00+09:00",
    readMin: 11,
    affiliate: true,
  },
  {
    id: "a21",
    slug: "meta-quest-pro-2-review",
    pillar: "products",
    section: "Review",
    title: "Meta Quest Pro 2 review: still searching for a use case the rest of us can name",
    dek: "The hardware is better. The pitch is the same.",
    author: "jchen",
    published: "2026-05-18T16:00:00+08:00",
    readMin: 9,
    affiliate: true,
  },
  {
    id: "a22",
    slug: "asus-rog-flow-z14",
    pillar: "products",
    section: "Review",
    title: "ASUS ROG Flow Z14 (2026) review: a tablet that is a gaming laptop that is a tablet",
    dek: "Genre confusion as a feature, not a bug.",
    author: "jchen",
    published: "2026-05-17T12:00:00+08:00",
    readMin: 8,
    affiliate: true,
  },
  {
    id: "a23",
    slug: "japan-cyber-law-2026",
    pillar: "policy",
    section: "Cyber",
    title:
      "Tokyo's new active-cyber-defence law just passed — and three CISOs we talked to are nervous",
    dek: "The law sets a precedent regional regulators are already studying.",
    author: "ananya",
    published: "2026-05-19T09:00:00+09:00",
    readMin: 9,
  },
  {
    id: "a24",
    slug: "india-dpdp-enforcement",
    pillar: "policy",
    section: "Privacy",
    title:
      "India's DPDP enforcement kicks in next month — and most ASEAN-headquartered apps are not ready",
    dek: "Five law firms we surveyed agree on the timeline. They do not agree on what to do.",
    author: "ananya",
    published: "2026-05-18T07:30:00+05:30",
    readMin: 10,
  },
];

export interface WireDrop {
  id: string;
  time: string;
  city: string;
  text: string;
}

export const WIRE_DROPS: ReadonlyArray<WireDrop> = [
  {
    id: "w1",
    time: "08:42",
    city: "Singapore",
    text: "MAS approves digital asset custody licence for DBS – first major bank to clear the revised framework.",
  },
  {
    id: "w2",
    time: "08:31",
    city: "Seoul",
    text: "SK Hynix says HBM4 sampling to top customers begins June; volume in Q4.",
  },
  {
    id: "w3",
    time: "08:14",
    city: "Jakarta",
    text: "GoTo posts adjusted EBITDA positive for second straight quarter; on-demand take-rate ticks up 40bps.",
  },
  {
    id: "w4",
    time: "07:58",
    city: "Hanoi",
    text: "VNG Cloud confirms Singapore listing filing; Q4 revenue grew 31% YoY per draft prospectus.",
  },
  {
    id: "w5",
    time: "07:31",
    city: "Taipei",
    text: "TSMC reshuffles advanced-packaging allocation; three named customers, two unnamed.",
  },
  {
    id: "w6",
    time: "07:06",
    city: "Bengaluru",
    text: "RBI clears UPI bilateral go-live with Vietnam; SBV joint statement at 09:00 local.",
  },
  {
    id: "w7",
    time: "06:48",
    city: "Tokyo",
    text: "Sony confirms PS6 dev kits in partner studios; no consumer timeline.",
  },
  {
    id: "w8",
    time: "06:22",
    city: "Manila",
    text: "GCash parent files for separate listing; ride-hailing arm stays private.",
  },
];

export interface FundingRow {
  ticker: string;
  name: string;
  country: string;
  sector: string;
  px: number | null;
  chg: number | null;
  mcap: string;
  funding: string;
}

export const FUNDING_ROWS: ReadonlyArray<FundingRow> = [
  { ticker: "9988.HK", name: "Alibaba", country: "CN", sector: "Cloud/AI", px: 81.2, chg: 2.41, mcap: "$201B", funding: "–" },
  { ticker: "005930.KS", name: "Samsung Elec.", country: "KR", sector: "Semis", px: 78900, chg: -0.82, mcap: "$420B", funding: "–" },
  { ticker: "2330.TW", name: "TSMC", country: "TW", sector: "Foundry", px: 932.0, chg: 1.55, mcap: "$780B", funding: "–" },
  { ticker: "3690.HK", name: "Meituan", country: "CN", sector: "Consumer", px: 114.6, chg: -1.2, mcap: "$74B", funding: "–" },
  { ticker: "GOTO.JK", name: "GoTo Group", country: "ID", sector: "Super-app", px: 73, chg: 3.1, mcap: "$5.4B", funding: "–" },
  { ticker: "GRAB", name: "Grab Holdings", country: "SG", sector: "Super-app", px: 4.18, chg: 0.61, mcap: "$16.1B", funding: "–" },
  { ticker: "SE", name: "Sea Limited", country: "SG", sector: "E-commerce", px: 88.4, chg: -2.05, mcap: "$48B", funding: "–" },
  { ticker: "VNG", name: "VNG (private)", country: "VN", sector: "Internet", px: null, chg: null, mcap: "$2.2B*", funding: "$150M (D)" },
  { ticker: "KKDY", name: "Kakao Pay", country: "KR", sector: "Fintech", px: 34250, chg: 0.41, mcap: "$3.2B", funding: "–" },
  { ticker: "BKKM", name: "Bukalapak", country: "ID", sector: "E-commerce", px: 118, chg: -0.84, mcap: "$1.1B", funding: "–" },
  { ticker: "PYTM.NS", name: "Paytm", country: "IN", sector: "Fintech", px: 412, chg: 1.81, mcap: "$3.0B", funding: "–" },
  { ticker: "OFLA", name: "Ola Krutrim", country: "IN", sector: "AI", px: null, chg: null, mcap: "$1.0B*", funding: "$50M (C)" },
];

export interface AiLeaderboardRow {
  rank: number;
  model: string;
  maker: string;
  reasoning: number;
  coding: number;
  speed: number;
  price: number;
  ctx: string;
}

export const AI_LEADERBOARD: ReadonlyArray<AiLeaderboardRow> = [
  { rank: 1, model: "GPT-5.1", maker: "OpenAI", reasoning: 92, coding: 88, speed: 84, price: 9.0, ctx: "512k" },
  { rank: 2, model: "Claude Sonnet 4.5", maker: "Anthropic", reasoning: 91, coding: 90, speed: 79, price: 8.4, ctx: "1M" },
  { rank: 3, model: "Gemini 2.5 Pro", maker: "Google", reasoning: 88, coding: 84, speed: 88, price: 6.5, ctx: "2M" },
  { rank: 4, model: "ERNIE-X 350B", maker: "Baidu", reasoning: 84, coding: 80, speed: 82, price: 2.1, ctx: "256k" },
  { rank: 5, model: "Qwen3-Max", maker: "Alibaba", reasoning: 83, coding: 85, speed: 80, price: 1.8, ctx: "256k" },
  { rank: 6, model: "Llama 4 405B", maker: "Meta", reasoning: 80, coding: 78, speed: 74, price: 0.0, ctx: "128k" },
  { rank: 7, model: "Mistral Large 3", maker: "Mistral", reasoning: 78, coding: 77, speed: 86, price: 3.0, ctx: "128k" },
  { rank: 8, model: "DeepSeek-V4", maker: "DeepSeek", reasoning: 82, coding: 83, speed: 81, price: 0.6, ctx: "128k" },
];

export interface Newsletter {
  id: string;
  name: string;
  cadence: string;
  desc: string;
  subs: string;
  pillar: PillarId;
}

export const NEWSLETTERS: ReadonlyArray<Newsletter> = [
  { id: "am", name: "AM Brief", cadence: "Daily · 07:00", desc: "What broke overnight across Asia tech, in 5 minutes.", subs: "48,200", pillar: "asia" },
  { id: "pm", name: "PM Brief", cadence: "Daily · 18:00", desc: "The day in three stories, plus what to read tonight.", subs: "41,700", pillar: "asia" },
  { id: "ai", name: "AI Weekly", cadence: "Weekly · Tue", desc: "Models, papers, and the geopolitics underneath them.", subs: "36,400", pillar: "ai" },
  { id: "fund", name: "Asia Funding Weekly", cadence: "Weekly · Thu", desc: "Every term sheet that closed in ASEAN this week.", subs: "22,900", pillar: "startups" },
  { id: "dev", name: "Dev Digest", cadence: "Weekly · Fri", desc: "What practitioners are actually shipping.", subs: "19,300", pillar: "dev" },
  { id: "prod", name: "Products & Deals", cadence: "Bi-weekly", desc: "Reviews and buy-or-skip calls. Affiliate-disclosed.", subs: "14,100", pillar: "products" },
];

export interface Podcast {
  id: string;
  title: string;
  len: string;
  date: string;
  host: string;
}

export const PODCASTS: ReadonlyArray<Podcast> = [
  { id: "daily", title: "DTW Daily Brief", len: "6:42", date: "Today", host: "Mei Lin" },
  { id: "asia", title: "Asia, Decoded", len: "38:11", date: "Yesterday", host: "Mei Lin & Ravi Kim" },
  { id: "build", title: "Building in Public, EM", len: "44:50", date: "2 days ago", host: "Arif Rahman" },
];

export function pillarOf(id: string): Pillar {
  return PILLARS.find((p) => p.id === id) ?? PILLARS[0]!;
}

export function articleOf(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function articlesByPillar(id: PillarId): ReadonlyArray<Article> {
  return ARTICLES.filter((a) => a.pillar === id);
}
