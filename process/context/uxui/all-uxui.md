# dtw-web - All UX/UI

Last updated: 2026-05-28

Attach this file when the task touches design tokens, theme behavior, component primitives, dark mode, i18n chrome, or any decision that affects visible surface area.

The `design/` directory at the repo root is the **canonical visual reference**. Read it. Don't redesign things that were already iterated on — every design decision in the chat transcript came from a real user-iteration loop.

---

## What This Covers

- Design tokens (CSS variables) — single source of truth
- Pillar colors and the 6-pillar identity system
- Dark mode rules + the `color-mix` discipline that prevents broken dark-mode contrast
- Typography (Schibsted Grotesk / IBM Plex Sans / IBM Plex Mono — editorial face swapped from Source Serif 4 on 2026-06-14)
- Cover-art system (editorial geometry per pillar — no fake photography)
- The brand evolution (Dailytechwire wordmark + reintroduced navy DTW monogram logo 2026-06-14, "Tech Intelligence, Wired Daily" sentence-case tagline)
- i18n chrome translation strategy (`useT()` and pillar/nav translation tables)
- Component primitives from the design prototype (canonical shape, not canonical code)

Does NOT cover specific page layouts (those are in each feature folder's `_GUIDE.md`).

## Read This When

- Adding a new UI surface
- Changing a token / theme behavior
- Writing a component that should adapt across light + dark mode
- Translating chrome strings
- Wondering "is there a primitive for this?" — answer: probably, check `design/project/src/ui.jsx`

---

## Canonical Design Source

```
design/
  README.md                # read this — it tells coding agents how to use the bundle
  chats/chat1.md           # iterative design history — read this to understand WHY decisions were made
  project/
    index.html             # contains all CSS variables (the design tokens)
    src/
      ui.jsx               # PillarTag, ByLine, DisclosureBox, Button, Spark, ArrowUpDown, Placeholder, Skeleton
      i18n.jsx             # useT, useLang, pillar + nav translation tables
      art.jsx              # cover-art generator (6 geometric compositions per pillar)
      effects.jsx          # ticker tape, cursor spotlight, count-up, sparkline draw-in, scroll-reveal
      icons.jsx            # stroke icon set (search, moon/sun, play/pause, bookmark, share, mail, rss, dollar, star, headphone, trend up/down, pillar icons)
      data.jsx             # PILLARS, AUTHORS, ARTICLES, WIRE_DROPS, NEWSLETTERS, NAV_EXTRA — sample data shape reference
      header.jsx, footer.jsx, homepage.jsx, article.jsx, pillar.jsx, dashboards.jsx,
      search.jsx, newsletters.jsx, account.jsx, auth.jsx, trust.jsx, about.jsx
      app.jsx              # hash routing entry
```

The prototype uses React 18 + Babel standalone in-browser. **Do not port that stack** — the production app is Next.js 15 + Tailwind v4. Use the prototype as a visual + structural reference, then implement properly.

---

## Design Tokens (CSS variables)

These live in the design's `index.html`. The production Tailwind v4 config should expose them via `@theme` so utilities like `bg-paper`, `text-ink`, `border-hair` work.

### Light theme (default)

```css
--paper:        #FDFCF8;   /* page background (refreshed 2026-06-14, was #FAF8F2) */
--surface:      #FFFFFF;   /* card / panel */
--surface-2:    #F2EFE5;   /* nested surface */
--ink:          #111111;   /* primary text */
--ink-2:        #2A2A28;   /* secondary text */
--muted:        #5B5B58;   /* tertiary text, byline, dates */
--muted-2:      #8C8B85;   /* faintest text */
--hair:         #E5E2D8;   /* 1px dividers */
--hair-2:       #D8D4C6;   /* 1px dividers (slightly stronger) */
--accent:       #D4623C;   /* DTW coral, softened 2026-06-14 (was #E04E1F) */
--accent-ink:   #B14A28;   /* coral on hover/active (was #B83D14) */
--amber:        #F59E0B;   /* warm highlight */
--brand-navy:   #1B2A52;   /* logo monogram / structural rules (dark: #E2E8F0) */
--brand-amber:  #D4623C;   /* logo pulse dot, matches accent */
--banner:       #1B2A52;   /* large navy banners — DARK IN BOTH THEMES (dark: #16223C) */
--sponsored:    #FEF3C7;   /* sponsored content bg (spec invariant) */
--up:           #10B981;   /* up / positive (spec invariant) */
--down:         #EF4444;   /* down / negative (spec invariant) */
```

> **Banner text rule:** `--banner` is navy in BOTH themes, so text on banner surfaces must use FIXED cream values (`#FFFFFF` / `rgba(232,237,247,…)`), never `--paper`/`--ink`-derived `color-mix`, or it inverts to invisible dark text in dark mode.

### Dark theme (`html[data-theme="dark"]`)

```css
--paper:        #0F172A;   /* spec invariant */
--surface:      #111C30;
--surface-2:    #15223A;
--ink:          #E2E8F0;   /* spec invariant */
--ink-2:        #CBD5E1;
--muted:        #94A3B8;
--muted-2:      #64748B;
--hair:         #1E2B45;
--hair-2:       #243453;
--sponsored:    #3B2E0A;   /* deep amber for dark-mode sponsored bg */
--brand-navy:   #E2E8F0;   /* lightened for dark mode */
--banner:       #16223C;   /* softer banner for dark mode */
```

### Pillar colors

Re-toned to a muted earthy set in the 2026-06-14 refresh (was a brighter rainbow).

```css
--ai:           #3A4E8C;   /* was #7C3AED */
--startups:     #3E6E80;   /* was #0EA5E9 */
--latest:       #B0512E;   /* renamed from --asia (asia pillar → latest); was #E04E1F */
--dev:          #46735C;   /* was #16A34A */
--products:     #8F7238;   /* was #D97706 */
--policy:       #5A6577;   /* was #475569 */
```

### Type scale

- `--font-serif: "Schibsted Grotesk", "IBM Plex Sans", system-ui, …, sans-serif;` (headlines, byline, article body — **changed 2026-06-14 from Source Serif 4**; the token name is kept though the face is now a variable sans). Loaded via `next/font/google` (`Schibsted_Grotesk`, variable axis, no explicit weight).
- `--font-sans: "IBM Plex Sans", system-ui, ...;` (UI, nav, buttons)
- `--font-mono: "IBM Plex Mono", ui-monospace, ...;` (numbers, dates, kbd, tickers)

Body: 15px / line-height 1.5. Article body: 17px / 1.6 (16px on mobile). `.serif` now uses `font-feature-settings: normal` (the old `"ss01","ss02"` Source-Serif features were dropped with the typeface swap).

### Other

- `--maxw: 1280px;` — container max width
- `--shadow: 0 1px 0 rgba(17,17,17,.04), 0 12px 32px -16px rgba(17,17,17,.12);` — only on `.card-hover:hover`

---

## Dark Mode Discipline (load-bearing)

**Never** hardcode rgba in component styles. The design iteration hit this bug repeatedly: components looked right in light mode and unreadable in dark.

**Pattern:**

- Solid colors: use `var(--paper)`, `var(--ink)`, etc.
- Semi-transparent over the page background: `color-mix(in oklab, var(--paper) X%, transparent)` (white-ish in light, dark-blue-ish in dark).
- Semi-transparent over content (the inverted case): `color-mix(in oklab, var(--ink) X%, transparent)`.

This was fixed across `about.jsx`, `app.jsx` (Awards page), the cookie banner, the paid-partner box, the newsletter doom-scroll banner, and the search overlay — all in a single iteration. Don't reintroduce the bug.

Theme persisted in `localStorage["dtw-theme"]` (key shape from prototype). Toggle lives in header — sun / moon icon.

---

## Brand Identity (current state — do not regress)

| Element | State | Notes |
|---|---|---|
| Site name | **DailyTechWire** | "DTW" is the short form (breadcrumbs, Studio, Pro). Earlier iterations used "Daily Tech Wire" with spaces or "Down To the Wire" — both rejected. |
| Wordmark + logo | Navy `DTW` monogram + lowercase "dailytechwire" + terracotta pulse-dot (2026-06-14) | Logo badge **reintroduced** in the 2026-06-14 refresh (asset `design/project/uploads/dtw-logo-primary.svg`), superseding the earlier wordmark-only rule. Monogram `--brand-navy` (dark `#E2E8F0`), dot `--brand-amber #D4623C`. |
| Tagline | "Tech Intelligence, Wired Daily" | Sentence case (NOT all-caps). Earlier all-caps version rejected. |
| Coral accent | `#D4623C` (softened 2026-06-14, was `#E04E1F`) | All accent buttons, emphasis links, logo pulse-dot, pillar nav active states. |
| Pillar nav (header) | 6 items: AI, Startups, Asia, Dev, Products, Policy | Font 14px, icon 15px (settled after several iterations). |

---

## Typography Patterns

- **Section headers** (homepage, account): 32px serif, semibold. Iterated from 28 → 32 to balance the larger wordmark.
- **Article title:** 38–46px serif (responsive with `clamp(28px, 3.2vw, 46px)` when fitting hero in viewport).
- **Article body:** 17px serif, line-height 1.6, 60–75 characters per line. 16px on mobile.
- **Byline:** uses `var(--muted)` so author names adapt to dark mode (this was fixed after a Mei-Lin-specific bug).
- **Mono tabular nums** (`.tnum` / `font-variant-numeric: tabular-nums`) on every number — dashboards, dates, percentages, tickers. Numbers must line-align.
- **Em-dash policy:** use the **shorter `–` (en dash) or hyphen `-`**, NOT the long `—` (em dash). User-specified rule.

---

## Component Primitives (canonical shapes from `design/project/src/ui.jsx`)

When implementing in Next.js + shadcn/ui, match the API + visual behavior of these primitives:

### `PillarTag`
- Inline-flex chip with 6×6 colored square + uppercase letter-spaced label (10–11px)
- Color is `pillarOf(id).color` — pulled from PILLARS
- Label is localised via `localizedPillarLabel(id, lang)`
- Sizes: `sm` (10px) | default (11px)

### `ByLine`
- Format: `By {Author} [and {CoAuthor}] · {date} · {readMin} min read`
- All separators are `·` in `var(--hair-2)` color
- Author name in `var(--muted)` (NOT hardcoded grey)
- Date uses `fmtDateL(iso, lang)` — localised

### `DisclosureBox`
- `kind: 'sponsored' | 'ai'`, `sponsor?: string`, `position: 'top' | 'middle' | 'bottom'`
- Sponsored: `var(--sponsored)` bg + `#E0B900` border + "Paid Partner · {sponsor}" title
- AI: `var(--surface-2)` bg + `var(--hair-2)` border + "AI-assisted reporting" title
- Top, middle, and bottom positions on sponsored articles — non-dismissible (invariant #5)
- 12×14 padding, 6px border radius, 20px vertical margin

### `Button`
- Variants: `primary` (ink bg) | `accent` (coral) | `outline` | `ghost`
- Sizes: `sm` (12px) | `md` (13px) | `lg` (14px)
- Accent variant adds an `:hover` glow via `data-glow="1"` and the CSS rule in `index.html`

### `Spark`
- SVG polyline mini-sparkline, default 60×18, 1.5px stroke
- Color defaults to `var(--up)`; pass `var(--down)` for declining series

### `ArrowUpDown`
- Triangle marker + percentage with sign, color `var(--up)` / `var(--down)`, mono font
- Renders `–` when value is null

### `Placeholder`
- Striped diagonal pattern via `.ph` class
- Used for hero / cover images during loading (LQIP-style)
- Has light + `dark` variant

### `Skeleton`
- Plain rounded block in `var(--surface-2)` — used during async loads
- Spec says "skeleton instead of spinners" — comply.

---

## Cover-Art System

No fake photography. Every article and cover slot uses a **deterministic geometric composition** keyed off the article ID.

Six visual templates, one per pillar (see `design/project/src/art.jsx`):

1. AI — tilted bars over a halftone dot grid (purple)
2. Startups — concentric circles, off-center (sky)
3. Asia — asymmetric grid blocks (coral)
4. Dev — data-viz line composition (green)
5. Products — big typographic letter mark (amber)
6. Policy — concentric squares + slab (slate)

Deterministic: same article ID → same composition forever. This prevents UI thrash on rerender and means readers form a visual memory for each piece.

Used wherever the design has a "hero image slot": Home Hero, Pillar Showcase, Asia Spotlight, Deep Dive, Best of Reviews, Sponsored Strip, Article Hero, Search results, Account Saved list.

Author monogram avatars use the same deterministic accent-color rule.

---

## i18n Chrome Strategy

Year 1 languages: `en` / `id` / `vi`. CN / JP / KO are Year 3.

**Pattern (from `design/project/src/i18n.jsx`):**

```jsx
const t = useT();
<button>{t("Sign in", "Đăng nhập", "Masuk")}</button>
```

`useT()` returns a curried function that picks based on `lang`. Falls back to English if the localised string is missing.

**Translation tables to maintain:**

- `PILLAR_I18N` — pillar labels (AI / Startups / Asia / Dev / Products / Policy)
- `NAV_I18N` — header extras (Awards / Studio / Newsletters / Pro)
- Footer columns, search placeholder, paywall meter, section headers — all use `t(en, vi, id)` inline

**Article body is NOT translated.** Editorial copy stays in source language. Only the chrome is multilingual.

**Date formatting:** `fmtDateL(iso, lang)` uses `vi-VN` / `id-ID` / `en-US` locales via `toLocaleDateString`. Same for numbers and currency.

**RTL readiness:** use CSS logical properties (`margin-inline`, `padding-inline`, `inset-inline`, `border-inline-start`) so adding Arabic in Year 3 is a config flip, not a rewrite.

**Persistence:** `localStorage["dtw-lang"]` + `document.documentElement.lang`.

---

## Effects & Micro-interactions

From `design/project/src/effects.jsx`. These are part of the brand — keep them in production but make them **opt-out friendly** (`prefers-reduced-motion`):

- **Live ticker tape** at the very top — TSMC, GoTo, FX, BTC tickers, scrolling with `▲▼` deltas. Pauses on hover.
- **Cursor spotlight** on the Asia Spotlight dark band — coral glow follows the mouse.
- **Dot-grid backdrops** on dark sections — faint white grid that fades to edges.
- **Sparkline draw-in animation** on the Funding dashboard teaser.
- **Count-up** on dashboard stats (deals, average round size).
- **Scroll-reveal fade** on each homepage section — with a triple-fallback (already-visible check, scroll listener, hard 1.2–1.5s timer) because IntersectionObserver doesn't fire reliably in sandboxes.
- **Pulsing ring** on the "live" indicator.
- **Accent button hover glow** — soft halo on `data-glow="1"` buttons.

The triple-fallback pattern matters: the designer hit a real bug where IntersectionObserver never fired in the sandbox and content stayed invisible. The fix uses a closure-cancelled flag + empty deps array on `useEffect` so the safety timer can't be cleared. Don't refactor that away.

---

## Quick Routing

| If you need... | Read next |
|---|---|
| how a specific page is composed | the matching `process/features/{...}/_GUIDE.md` |
| the full design conversation (decisions + why) | `design/chats/chat1.md` |
| translation strings to copy | `design/project/src/i18n.jsx` |
| component primitive API | `design/project/src/ui.jsx` |
| accessibility targets | `process/context/all-context.md` → "Performance & a11y targets" |

## Known Gaps

- Tailwind v4 `@theme` mapping for the CSS vars not yet written
- shadcn/ui component overrides not yet generated
- Mobile breakpoints — the design intentionally targeted desktop first. Mobile pass is a follow-up.
- `prefers-reduced-motion` hooks for the effects layer not yet implemented
