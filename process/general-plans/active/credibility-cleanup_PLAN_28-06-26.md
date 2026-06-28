# Credibility Cleanup — Đợt 1

**Date:** 28-06-26
**Complexity:** SIMPLE (one-session)
**Status:** PLANNED
**Plan path:** `process/general-plans/active/credibility-cleanup_PLAN_28-06-26.md`
**Source audit:** `process/general-plans/reports/dtw-project-review_DETAILED_28-06-26.md` §4

---

## Overview

Mechanical, low-risk credibility pass to remove or honestly surface all
"dead affordances" and false-promise copy identified in the 2026-06-28 audit.
No new dependencies, no schema migrations, no new routes. Every item is
verified against current code on `main` @ `e045ac7`.

This batch does NOT introduce Better-Auth, real newsletter, or real paywall —
those are Đợt 2 and later. "Save" bookmark, real payment, PostHog, dashboards
data backend, related recommender, SEO cluster, and error boundaries are all
explicitly out of scope.

---

## Goals

1. Every visible interactive control either works or is hidden.
2. No copy makes a promise (double opt-in, paywall) the backend cannot keep.
3. No `#` href social anchors shipped to readers.
4. No fake audio player or in-memory paywall meter rendered in production.
5. `pnpm typecheck` stays clean after every individual task.
6. Cookie consent behaviour is documented in context (no code change).

---

## Scope

**In scope:**
- Share bar: wire Copy link, Share (Web Share API), Email; leave Save as-is
- CSV export button: wire client-side blob download from `filtered` rows
- Footer social icons: hide entries with no real `href`
- Paywall meter + nudge: hide both render paths; clean up now-dead wiring
- Audio/TTS bar: hide render
- Podcast play button: hide non-functional play control
- Newsletter CTA (`home/` + `newsletters/page.tsx`): remove fake form + false promise copy
- Footer newsletter strip: remove fake form + false promise copy
- Cookie consent: context note only (zero code change)
- Brand casing: fix "DailyTechWire" → "Dailytechwire" in two locations

**Out of scope (Đợt 2+):**
- Better-Auth and real account/save features
- Real Resend newsletter + double opt-in
- Real soft paywall (cookie-persisted counter + CMS threshold)
- Real podcast/TTS audio (ElevenLabs / OpenAI)
- PostHog analytics
- Dashboards data backend
- SEO cluster (sitemap / robots / JSON-LD / generateMetadata)
- Error boundaries
- Related-article recommender

---

## Touchpoints

All line numbers verified on `main` @ `e045ac7` before plan was written.

| File | Line(s) | Current state | Planned change |
|---|---|---|---|
| `apps/web/src/components/article/share-bar.tsx` | 56–58 | Share, Copy link, Email buttons have no `onClick` | Wire onClick handlers; keep Save (`:50–55`) as-is |
| `apps/web/src/components/dashboards/funding-tracker.tsx` | 154–156 | `<Button>↓ CSV</Button>` no onClick | Add `onClick` CSV blob download from `filtered` |
| `apps/web/src/components/footer.tsx` | 53–59 (socials array), 165–184 (render) | X/LinkedIn/Instagram have no `href`; render falls back to `href="#"` | Filter array to only render entries that have a non-empty `href` |
| `apps/web/src/components/footer.tsx` | 108–133 (footer newsletter strip form) | `onSubmit` → `alert("Confirmation email sent (demo)")`; copy promises "Double opt-in…no data sale" | Remove `<form>` + `<input>` + Subscribe button; replace with Link to `/newsletters`; remove false-promise sentence from all 3 lang strings |
| `apps/web/src/components/article/article-content.tsx` | 25–27 | `hitPaywall` computed; drives `:182–188` ShareBar/Paywall gate | Remove `hitPaywall` logic; always render `<ShareBar />`; never render `<Paywall />` |
| `apps/web/src/components/article/article-content.tsx` | 30 | `incrementRead(article.id)` in useEffect | Remove call (and destructure from `useShell`) once `articlesRead`/`incrementRead` wiring is removed from shell |
| `apps/web/src/lib/shell.tsx` | 32–33, 42–54, 78–81 | `articlesRead` + `incrementRead` in context | Remove both from ShellContextValue interface, ShellProvider state, and value object |
| `apps/web/src/components/header.tsx` | 24, 49, 103, 580–645 | `articlesRead` destructured; `showNudge` computed; nudge rendered at `:580` | Remove `articlesRead` from destructure; remove `showNudge` and its ResizeObserver dep; remove nudge JSX block |
| `apps/web/src/components/header.tsx` | 603–605 | `"DailyTechWire"` (wrong casing) in all 3 lang strings | Fix to `"Dailytechwire"` — but since the nudge block is being removed, this fix is superseded; verify after nudge removal |
| `apps/web/src/app/(reader)/briefing/page.tsx` | 35 | `"DailyTechWire"` (wrong casing) | Fix to `"Dailytechwire"` |
| `apps/web/src/components/article/article-content.tsx` | 176 | `<AudioPlayerBar />` rendered | Remove the render; keep `audio-player.tsx` file on disk |
| `apps/web/src/components/home/podcast-strip.tsx` | 39–61 | Play `<button>` with fake `setPlaying` toggle | Hide play button; keep card/title/host/meta text; remove `playing` state and `useState` import if no longer needed |
| `apps/web/src/components/home/newsletter-cta.tsx` | 74–77 (false-promise copy), 80–126 (form) | `alert("Confirmation email sent (demo)")` form; copy line promises "Double opt-in…We will never sell…" | Remove `<form>`, `<input>`, Subscribe button; replace with `<Button href="/newsletters">` CTA only; strip false-promise sentence from all 3 lang strings |
| `apps/web/src/app/(reader)/newsletters/page.tsx` | 57–63 (header copy), 163–224 (form) | header claims "Double opt-in. No tracking pixels. One-click unsubscribe."; form `setSubmitted(true)` with no backend | Soften header copy (remove double opt-in / pixel / unsubscribe promise); replace form with "Coming soon" state or disable submit with honest placeholder text; remove `email` state if no longer needed |
| `process/context/infra/all-infra.md` | (new section at end) | No cookie-consent constraint documented | Add "Cookie Consent Constraint" note (no code change) |

---

## Public Contracts

- `ShellContextValue` interface loses `articlesRead: number` and `incrementRead: (id: string) => void`. Any consumer must be updated simultaneously.
- `useShell()` callers: `article-content.tsx` and `header.tsx` — both are updated in this batch.
- `Paywall` component (`paywall.tsx`) stays on disk with its existing export signature — not rendered, not deleted.
- `AudioPlayerBar` component (`audio-player.tsx`) stays on disk — not rendered, not deleted.

---

## Blast Radius

| Risk | Mitigation |
|---|---|
| Removing `articlesRead`/`incrementRead` from ShellContext breaks other callers | Grep verified: only `article-content.tsx` and `header.tsx` consume these. Both updated in this batch. |
| Removing `showNudge` changes `ResizeObserver` dep array at `header.tsx:103` — `articlesRead` was in the dep | Removing the dep along with the field; ResizeObserver still fires on `showNudge` which is gone, so the whole `[articlesRead, showNudge]` dep array shrinks. Verify the useEffect still has correct remaining deps. |
| Footer social icon render change could silently hide the Email and RSS entries (which have real hrefs) | Filter must only suppress entries where `href` is `undefined` or empty, not all entries. `Email` has `mailto:info@dailytechwire.com` and `RSS` has `/rss.xml` — both must still render. |
| Newsletter page `email` state + `setEmail` become dead if `<input>` is removed | Remove `email` state and `setEmail`; also remove `submitted`/`setSubmitted` if the form is removed. Check `picks`/`setPicks` — keep them if the checkbox grid stays (it should, it's real UI). |
| Podcast strip removing `playing` state: `useState` import becomes unused | Remove `playing` state and `useState` import from `podcast-strip.tsx`. |
| `briefing/page.tsx` has `"DailyTechWire"` in plain static text (not in nudge block) | Fix independently; nudge removal in header does not fix this one. |
| TypeScript: removing fields from ShellContextValue requires updating the `useMemo` value object and the `ShellProvider` value | Both in the same file — handle atomically in Step 4. |

---

## Verification Evidence

After all steps, the following must be true:

**Automated:**
- `pnpm typecheck` exits 0 across all three packages (`web`, `@dtw/db`, `@dtw/ui`).

**Manual browser checks (localhost):**
1. Copy link button: click → URL is in clipboard, button label briefly shows "Copied".
2. Share button: on mobile/supported browser → Web Share sheet opens; on desktop → falls back to clipboard copy (same "Copied" feedback).
3. Email button: click → `mailto:` opens email client with article title/URL pre-filled.
4. CSV export: click on `/dashboards` → browser downloads a `.csv` file with the filtered row data.
5. Footer social area: X, LinkedIn, Instagram icons are not rendered. Email icon links to `mailto:info@dailytechwire.com`. RSS icon links to `/rss.xml`.
6. Article page: no paywall card, no sign-in nudge band in header, no Audio player bar visible. Full article body + ShareBar always visible.
7. Home newsletter CTA: no email input or Subscribe button. "Choose more" / "View newsletters" link navigates to `/newsletters`.
8. Home newsletter CTA: no false promise sentence ("Double opt-in…never sell or share").
9. Footer newsletter strip: no email input or Subscribe button. Link to `/newsletters` present. No "Double opt-in…no tracking pixels" sentence.
10. Newsletters page (`/newsletters`): no "Double opt-in" / "No tracking pixels" / "One-click unsubscribe" promise in header text. Subscribe form either absent or clearly labelled "coming soon".
11. Podcast strip: play buttons not visible (hidden). Cards/titles/hosts still present.
12. `briefing/page.tsx`: rendered text reads "Dailytechwire" (not "DailyTechWire").

---

## Implementation Checklist

Steps are ordered by dependency: shell context changes first (Step 4) because article-content and header both depend on the new interface.

### Step 1 — Wire Share bar buttons (`share-bar.tsx`)
- **File:** `apps/web/src/components/article/share-bar.tsx`
- Add `useState` import for `copied` state (already has `useState` for `saved`).
- Wire "Copy link" `Btn` (`label` on `:57`): `onClick` = set `copied` true for 2 s, then reset; call `navigator.clipboard.writeText(window.location.href)`. Pass `active={copied}` to show state. Update label: `copied ? t("Copied!", "Đã sao chép!", "Tersalin!") : t("Copy link", ...)`.
- Wire "Share" `Btn` (`label` on `:56`): `onClick` = if `navigator.share` exists, call `navigator.share({ url: window.location.href, title: document.title }).catch(() => {})`, else fall through to clipboard copy (same handler as above). No new state needed.
- Wire "Email" `Btn` (`label` on `:58`): `onClick` = `window.location.href = \`mailto:?subject=\${encodeURIComponent(document.title)}&body=\${encodeURIComponent(window.location.href)}\``.
- Leave "Save" `Btn` (`:50–55`) completely untouched.
- No new imports, no new deps.
- Verify: `pnpm typecheck` passes.

### Step 2 — Wire CSV export (`funding-tracker.tsx`)
- **File:** `apps/web/src/components/dashboards/funding-tracker.tsx`
- The `Button` at `:154` needs an `onClick`. Add a local function `downloadCsv` that:
  1. Builds a CSV header row from the keys of `FundingRow` (ticker, name, country, sector, px, chg, mcap, funding).
  2. Maps `filtered` rows into CSV lines, handling `null` with `""`.
  3. Creates `new Blob([headerRow + "\n" + lines.join("\n")], { type: "text/csv" })`.
  4. Creates `URL.createObjectURL(blob)`, appends a temporary `<a download="dtw-funding-tracker.csv">`, triggers `.click()`, then `URL.revokeObjectURL`.
- Add `onClick={downloadCsv}` to the `Button`.
- No new imports (Blob/URL/document are browser globals — already a `"use client"` component).
- Verify: click downloads a valid CSV; `pnpm typecheck` passes.

### Step 3 — Hide footer social icons (`footer.tsx` — socials array)
- **File:** `apps/web/src/components/footer.tsx`
- In the render block at `:165`, filter the `socials` array before mapping: render only entries where the third tuple element is a non-empty string (has a real `href`).
  - Current entries with real href: `["Email", "mail", "mailto:info@dailytechwire.com"]`, `["RSS", "rss", "/rss.xml"]`.
  - Entries to suppress: `["X", "external"]`, `["LinkedIn", "external"]`, `["Instagram", "external"]` (no third tuple element → `href` is `undefined`).
- Change: `{socials.map(...)}` → `{socials.filter(([, , href]) => !!href).map(...)}`.
- Do NOT modify the `socials` array definition itself — leave the entries with no href in place so re-enabling is just adding a URL string.
- Add a code comment above the socials array: `// Re-enable by adding real URLs as the third tuple element. Missing href = hidden.`
- Verify: only Email and RSS icons render in footer. `pnpm typecheck` passes.

### Step 4 — Remove footer newsletter fake form (`footer.tsx` — newsletter strip)
- **File:** `apps/web/src/components/footer.tsx`
- The newsletter strip form is at `:108–133` (the `<form onSubmit=...>` block inside the `r-footer-news` grid).
- Replace the entire `<form>` block with a single `<Button href="/newsletters" variant="accent" size="lg">` CTA (e.g. `t("View all newsletters", "Xem tất cả bản tin", "Lihat semua newsletter")`).
- In the `<p>` at `:100–105`, the text includes "Double opt-in. No tracking pixels. Unsubscribe with one click." — this is the false promise. Remove that sentence from all three language strings. Keep the preceding descriptive sentence about founders/operators reading it.
  - EN: keep `"Founders, operators, and policy people across Asia read it before the day starts."` — remove ` Double opt-in. No tracking pixels. Unsubscribe with one click.`
  - VI: keep `"Các nhà sáng lập, quản lý và người làm chính sách khắp châu Á đọc trước khi ngày mới bắt đầu."` — remove ` Xác nhận kép. Không pixel theo dõi. Hủy đăng ký chỉ một cú nhấp.`
  - ID: keep `"Para founder, operator, dan pembuat kebijakan di Asia membacanya sebelum hari dimulai."` — remove ` Konfirmasi ganda. Tanpa piksel pelacak. Berhenti berlangganan dengan satu klik.`
- `footer.tsx` is a `"use client"` component; adding a `href` Button prop is already supported by `@dtw/ui`.
- Verify: no email input in footer; no "Double opt-in" text; `/newsletters` link works. `pnpm typecheck` passes.

### Step 5 — Remove shell paywall wiring (`shell.tsx`, `article-content.tsx`, `header.tsx`)

This is the highest-impact step — touches 3 files atomically. Do all three before running typecheck.

**5a. `apps/web/src/lib/shell.tsx`**
- Remove `articlesRead: number` and `incrementRead: (id: string) => void` from `ShellContextValue` interface (`:32–33`).
- Remove `const [articlesRead, setArticlesRead] = useState(0)` (`:42`).
- Remove `const readIds = useRef<Set<string>>(new Set())` (`:43`).
- Remove the `incrementRead` `useCallback` block (`:50–54`).
- Remove `articlesRead` and `incrementRead` from the `value` `useMemo` object (`:78–79`) and dependency array (`:81`).

**5b. `apps/web/src/components/article/article-content.tsx`**
- Update the `useShell()` destructure at `:25`: remove `articlesRead`, `incrementRead`. Keep `user` and `openAuth`.
- Remove `const hitPaywall = articlesRead > 3 && !user && !article.sponsored;` (`:27`).
- In the `useEffect` at `:29–33`: remove the `if (!article.sponsored) incrementRead(article.id);` line (`:30`). Keep `window.scrollTo({ top: 0 })` and the `article.id` dep comment.
- At `:182`: change `{!hitPaywall && <ShareBar />}` → `<ShareBar />` (always render).
- At `:184–188`: remove the `{hitPaywall && (<div ...><Paywall .../></div>)}` block entirely.
- Remove the `Paywall` import at `:10` (`import { Paywall } from "@/components/article/paywall"`).
- Keep the `useShell` import (still needed for `user` and `openAuth`).

**5c. `apps/web/src/components/header.tsx`**
- Update the `useShell()` destructure at `:24`: remove `articlesRead`. Keep `user`, `openAuth`, `openSearch`, `setUser`.
- Remove `const showNudge = articlesRead >= 3 && !user && !nudgeDismissed;` (`:49`).
- Remove `dismissNudge` function (`:51–58`) — it is only used by the nudge JSX.
- Remove `nudgeDismissed` state (`const [nudgeDismissed, setNudgeDismissed] = useState(false)` on `:31`) and its `useEffect` at `:36–42` that reads from localStorage.
- In the ResizeObserver `useEffect` dep array at `:103`: remove `articlesRead` and `showNudge` from the dep array. If the array becomes `[]`, confirm the ResizeObserver still makes sense as a mount-only effect — it does (it observes the header element for height changes).
- Remove the entire nudge JSX block at `:580–645` (the `{showNudge && <div ...>...</div>}` section).
- Also fix the brand casing inside the (now-removed) nudge block: since the whole block is deleted, the three `"DailyTechWire"` instances at `:603–605` are gone. No separate fix needed for those lines.
- Remove `NUDGE_KEY` constant at `:18` (only used by `dismissNudge`).

After all three files are edited, run `pnpm typecheck` to verify zero errors.

### Step 6 — Hide Audio player bar (`article-content.tsx`)
- **File:** `apps/web/src/components/article/article-content.tsx`
- Remove the `<AudioPlayerBar />` render at `:176`.
- Remove the `import { AudioPlayerBar }` at `:8`.
- Keep `apps/web/src/components/article/audio-player.tsx` on disk (Phase-2 reuse).
- Verify: article page no longer shows the audio player bar. `pnpm typecheck` passes.

### Step 7 — Hide Podcast play button (`podcast-strip.tsx`)
- **File:** `apps/web/src/components/home/podcast-strip.tsx`
- Remove `const [playing, setPlaying] = useState<string | null>(null)` (`:11`).
- Remove the `useState` import from the import line at `:3` (will be the only usage once `playing` is gone).
- Remove the entire `<button onClick={...} aria-label={...} style={...}>` block (`:39–61`) that contains the play/pause icon. Do NOT remove the containing `<div>` for the card or the title/host/meta block.
- Remove the `{playing === p.id && <div>...</div>}` progress bar block (`:72–89`).
- Keep `Icon` import (it may still be used elsewhere in the component — check; if not, remove it too).

> Grep check before coding: `grep -n "Icon" apps/web/src/components/home/podcast-strip.tsx` — `Icon` is only used inside the play button block being removed. Remove the `Icon` import.

- Verify: podcast cards render with title/host/duration but no play button. `pnpm typecheck` passes.

### Step 8 — Remove home newsletter CTA fake form + false promise (`newsletter-cta.tsx`)
- **File:** `apps/web/src/components/home/newsletter-cta.tsx`
- Remove the `<form onSubmit=...>` block at `:80–126` entirely.
- Replace it with a two-button group (matching the original visual layout):
  - `<Button href="/newsletters" variant="accent" size="lg">` — `t("Browse newsletters", "Xem các bản tin", "Jelajahi newsletter")`
  - (Optional: keep the "Choose more" / "View all" button already present, or simplify to one button)
- In the `<p>` at `:73–77`, the string ends with `"Double opt-in. Unsubscribe with one click. We will never sell or share your email."` — remove that sentence from all 3 language strings. Keep the list of newsletter names (`"AM Brief, PM Brief, AI Weekly…"`).
  - EN: end string after `"DTW Awards."` — remove ` Double opt-in. Unsubscribe with one click. We will never sell or share your email.`
  - VI: end after `"DTW Awards."` — remove ` Xác nhận kép. Hủy chỉ bằng một cú nhấp. Không bán hay chia sẻ email của bạn.`
  - ID: end after `"DTW Awards."` — remove ` Konfirmasi ganda. Berhenti dengan satu klik. Kami tak akan menjual atau membagikan email Anda.`
- `Button` already imports from `@dtw/ui`; no new imports needed.
- Verify: home page shows the newsletter CTA section with title and buttons but no email input. No false promise sentence. `pnpm typecheck` passes.

### Step 9 — Soften newsletters page (`newsletters/page.tsx`)
- **File:** `apps/web/src/app/(reader)/newsletters/page.tsx`
- In the `<p>` header at `:57–63`: remove `"Double opt-in. No tracking pixels. One-click unsubscribe."` from all 3 lang strings. Keep `"Daily briefs, weekly digests, one bi-weekly."`.
  - EN: `"Daily briefs, weekly digests, one bi-weekly."` only.
  - VI: `"Bản tin ngày, tổng hợp tuần, một bi-weekly."` only.
  - ID: `"Brief harian, digest mingguan, satu dwi-mingguan."` only.
- In the form block at `:163–224`: replace the `<form onSubmit=...>` and `<input type="email">` with a "Coming soon" banner.
  - Remove `email` state + `setEmail` (`:11–12`).
  - Remove `submitted` state + `setSubmitted` (`:12`).
  - Replace the `<form>` JSX with a simple `<div>` that says e.g. `t("Newsletter subscriptions opening soon — check back shortly.", "Đăng ký bản tin sẽ sớm mở — hãy quay lại sau.", "Langganan newsletter akan segera dibuka — cek kembali sebentar lagi.")`.
  - Keep `picks`/`setPicks` and the checkbox grid (the selection UI is real and stays).
  - Remove the `Button` import if it's only used in the removed form — check first.

> Grep check: `grep -n "Button" apps/web/src/app/(reader)/newsletters/page.tsx` — Button is only in the form. Remove the import.

- Verify: `/newsletters` page shows newsletter cards with checkboxes but no subscribe form. No "Double opt-in" copy. `pnpm typecheck` passes.

### Step 10 — Fix brand casing in briefing page (`briefing/page.tsx`)
- **File:** `apps/web/src/app/(reader)/briefing/page.tsx`
- Line `:35`: `"DailyTechWire"` → `"Dailytechwire"` (the page is a server component, plain string literal).
- Verify: rendered text shows correct casing. `pnpm typecheck` passes.

### Step 11 — Add cookie consent constraint note to context
- **File:** `process/context/infra/all-infra.md`
- Append a new section at the end of the file titled `## Cookie Consent Constraint`.
- Content (exact text to add):

  ```
  ## Cookie Consent Constraint

  The cookie banner (`components/cookie-banner.tsx`) is intentionally a dismiss-only banner:
  both "Decline" and "Accept" call the same `dismiss()` function and store the same
  localStorage key (`dtw-cookies = "1"`). This is acceptable **only** because the site
  ships NO non-essential tracking. Banner copy: "No ads, no tracking, no data sale."
  Only essential cookies are set (login/auth, theme, locale).

  **BINDING CONSTRAINT:** If PostHog or ANY non-essential tracking is ever added, consent
  must be made real before that code ships:
  - "Decline" must store a distinct value (e.g. `"0"`) that gates non-essential cookies.
  - "Accept" stores `"1"` and enables non-essential cookies.
  - This is required to satisfy Invariant #12 (GDPR + PDPA Singapore + Nghị định 13 Vietnam).

  Do not ship analytics or third-party pixels without this change.
  ```

- This is documentation only — zero code change. Verify file is well-formed after edit.

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Shell context field removal misses a consumer | Low (grep confirmed only 2 consumers) | TypeScript error | Run `pnpm typecheck` after Step 5 before proceeding |
| Footer `filter` accidentally hides Email/RSS | Low | Missing real links | Unit-test logic: `!!undefined === false`; `!!"mailto:..." === true` |
| ResizeObserver dep array in header becomes wrong after removing `articlesRead`/`showNudge` | Low | Header height flicker | Confirm remaining deps are correct; header height should still update on resize and mount |
| `podcast-strip.tsx` `Icon` removal breaks other component | None (verified: `Icon` only in play button block) | Build error | Grep before removing import |
| Newsletters page `Button` import removal | None (verified: Button only in removed form) | TypeScript error | Grep before removing import |
| `paywall.tsx` file left on disk with dead `href="/pro"` | Moot | N/A | The Paywall is never rendered after Step 5; `/pro` 404 is irrelevant. Note in code comment. |

---

## Integration Notes

- `pnpm typecheck` must be run after each step (or at minimum after Steps 5 and 9).
- No new `pnpm add` commands — zero new runtime dependencies.
- No migration files touched.
- No Payload collection files touched.
- No `globals.css` or token files touched.
- `paywall.tsx` and `audio-player.tsx` stay on disk intentionally — they are reused in Đợt 2.
- The `NEWSLETTERS` data array in `lib/data.ts` is untouched — the checkbox grid stays.
- The footer `socials` array stays in code with its three `undefined`-href entries — they are just filtered at render time for easy future re-enable.

---

## Out-of-Scope Notes (Đợt 2+)

These items were explicitly deferred. Do not plan or implement them here:

- **Save bookmark** (article `<ShareBar>` Save button) → depends on Better-Auth session. Implement in auth batch.
- **Better-Auth** (magic link, OAuth, RBAC 5 roles) → separate plan, separate batch.
- **Real newsletter** (Resend + double opt-in + subscriber collection) → separate plan.
- **Real soft paywall** (cookie-persisted meter + CMS-configurable threshold + Stripe) → separate plan.
- **PostHog analytics** → must implement real cookie consent gate first (see Step 11 constraint note).
- **Dashboards data backend** → separate plan (current "sample data" label is honest, stays).
- **TTS audio** (ElevenLabs / OpenAI) → Phase-2 dependency.
- **SEO cluster** (sitemap, robots, JSON-LD, generateMetadata, RSS, OG images, llms.txt) → separate plan (P0-C from audit).
- **Error boundaries** (`global-error.tsx`, `(reader)/error.tsx`) → separate plan (P0 from audit).
- **`/pro` page** → moot while Paywall is not rendered; implement when real paywall lands.
- **Cookie Decline storing a distinct value** → required before PostHog ships (noted in Step 11).

---

## Acceptance Criteria

1. `pnpm typecheck` exits 0 (all three packages).
2. No `#` href social icons render in the footer.
3. Copy link button copies URL to clipboard and shows "Copied" feedback.
4. Share button invokes Web Share or falls back to clipboard.
5. Email button opens `mailto:` with article title and URL.
6. CSV download produces a file when clicked on `/dashboards`.
7. No paywall card, no sign-in nudge band, no audio player bar appear on any article page.
8. Podcast cards render without a play button.
9. Newsletter CTA on homepage: no email input, no "Double opt-in" copy, has `/newsletters` link.
10. Footer newsletter strip: no email input, no "Double opt-in" / "tracking pixels" copy, has `/newsletters` link.
11. `/newsletters` page: no "Double opt-in" / "No tracking pixels" / "One-click unsubscribe" in header copy; subscribe form replaced by "coming soon" state.
12. `/briefing` page text reads "Dailytechwire" (not "DailyTechWire").
13. `process/context/infra/all-infra.md` contains the Cookie Consent Constraint section.

---

## Resume and Execution Handoff

**Selected plan file:** `process/general-plans/active/credibility-cleanup_PLAN_28-06-26.md`

**Safe to begin immediately.** No product decisions are required — all decisions are documented above.

**Recommended execution order for EXECUTE agent:**
1 → 2 → 3 → 4 → 5 (5a, 5b, 5c atomically) → 6 → 7 → 8 → 9 → 10 → 11

Run `pnpm typecheck` after Step 5 (shell/article/header changes) and again after Step 9 (newsletters page). A final typecheck after Step 11 is the completion gate.

**EXECUTE mode note:** Step 11 modifies a context file (`process/context/infra/all-infra.md`) — this is permitted because it is a documentation-only change (no source code change) made as part of the approved plan.

**No further planning gates.** Proceed directly to EXECUTE.
