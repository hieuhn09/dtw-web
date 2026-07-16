# Tip Line Removal + Newsroom Route Move

Status: A: 🧪 TESTING (agent-verified, pending user confirmation) — B: 🧪 TESTING (agent-verified, pending user confirmation)
Date: 16-07-26
Feature: about-trust
Complexity: SIMPLE-to-MEDIUM (single session, two independently-verifiable workstreams, no schema/DB/auth changes)
Created: 16-07-26

## Execution Log (16-07-26)

Both workstreams (A1-A6, B1-B5) implemented exactly per checklist. `pnpm typecheck` and `pnpm build` pass with zero new errors. All Verification Evidence checks (grep guards, `curl` route/redirect/sitemap checks against a local dev server, compiled-bundle locale checks for A3/A4a/A4b) ran with real output — see EXECUTE handoff report for full transcript. Not yet marked ✅ VERIFIED per this plan's own Phase Completion Rule #5 (requires user/reviewing-agent confirmation).

Open items carried forward, not resolved by this EXECUTE pass:
- **D1-D4 remain open** — not touched, not yet put to the user for a decision. Still need the explicit ask this plan's Resume/Handoff section calls for.
- **Unrelated pre-existing dirty file discovered**: `apps/web/src/app/(reader)/page.tsx` (homepage pillar-band fan-out change) was already modified in the working tree before this EXECUTE session started and was never touched by this plan's edits. Flagging so a future commit-split doesn't conflate it with this plan's diff.

### Deviation (post-review, 16-07-26): A4a reverted, A4b replaced with shorter user-specified copy

After the initial EXECUTE pass above, the user reviewed A4a and A4b and directed two changes, applied in a follow-up EXECUTE step:

- **A4a — reverted entirely.** `git checkout HEAD -- "apps/web/src/app/(reader)/contact/page.tsx"` restored the file to its pre-plan state (verified: this was the file's only modification this session, so a whole-file revert is exact — confirmed empty `git diff HEAD` afterward). The user reviewed the original `/contact` "Press & media" `desc` copy (the pre-A4a text, "Interview requests, press credentials, story tips, and confidential sources. We protect our sources and read every tip carefully.") and judged it acceptable as-is. A4a's replacement copy (the "inbox isn't encrypted... message us first to arrange a safer way to talk" language) is **not shipped**.
- **A4b — replaced with shorter, user-specified copy**, not the text originally drafted in this plan. The plan's drafted A4b text (the "no shield law... can't guarantee a court fight before any compelled disclosure" language) was itself replaced before shipping, per the user's explicit instruction (verbatim, Vietnamese): *"sửa lại thành chúng tôi sẽ bảo vệ bảo mật nguồn tin thôi không cần dài dòng xong nhắc đến toà án"* (~"change it to just 'we will protect source confidentiality,' no need to go on at length or mention courts"). Shipped `press/page.tsx` "Story tips & documents" `desc` text (en/vi/id):
  - EN: "Send us a lead in confidence. We protect the confidentiality of our sources."
  - VI: "Gửi đầu mối một cách bảo mật. Chúng tôi bảo vệ bảo mật nguồn tin." (user's own wording)
  - ID: "Kirim petunjuk secara rahasia. Kami melindungi kerahasiaan sumber kami."

**Rationale:** the user's position is that a general, present-tense commitment to protect sources ("we protect the confidentiality of our sources") is a statement of editorial intent/policy, not the fabricated track record and unkeepable legal guarantee that A1/A2 already removed (the "have never disclosed a source... without a sealed legal challenge" claim, the masked Signal number, and the unresolvable SecureDrop reference — all still gone, reconfirmed by grep below). It does not promise a specific legal outcome (no "guarantee," no "court fight," no shield-law claim) the newsroom cannot back, so it does not reintroduce the original overclaim risk A4a/A4b were meant to fix — it is simply shorter and drops the courts/shield-law digression the drafted A4a/A4b text had added.

**Verification (re-run against the final state, real output):**
- `pnpm typecheck` — passes, zero errors (turbo: 3 successful, 3 total).
- `git diff HEAD -- "apps/web/src/app/(reader)/contact/page.tsx"` — empty (confirmed revert is exact and complete; file no longer appears in `git status`).
- Press strings confirmed present in `apps/web/src/app/(reader)/press/page.tsx` lines 33-35, all 3 locales.
- `grep -rn "8XXX\|SecureDrop\|onion\|tips@" apps/web/src` — zero matches (grep exit 1).

No other files were touched by this deviation. Homepage (`apps/web/src/app/(reader)/page.tsx`), `press/page.tsx:103`/`:253` (D3/D4, still open), `/about`, `/newsroom`, `footer.tsx`, `sitemap.ts`, `next.config.ts`, and `_GUIDE.md` were not read or edited in this follow-up step.

## Quick Links

- [Overview](#overview)
- [Background (verified)](#background-verified)
- [Decisions Already Made](#decisions-already-made)
- [Open Decisions Needed (do NOT auto-apply)](#open-decisions-needed-do-not-auto-apply)
- [Touchpoints](#touchpoints)
- [Public Contracts](#public-contracts)
- [Blast Radius](#blast-radius)
- [Workstream A — Tip Line Package](#workstream-a--tip-line-package)
- [Workstream B — Move /about/newsroom to /newsroom](#workstream-b--move-aboutnewsroom-to-newsroom)
- [Deferred / Explicitly Out of Scope](#deferred--explicitly-out-of-scope)
- [Phase Completion Rules](#phase-completion-rules)
- [Verification Evidence](#verification-evidence)
- [Rollback](#rollback)
- [Acceptance Criteria](#acceptance-criteria)
- [Resume and Execution Handoff](#resume-and-execution-handoff)

---

## Overview

Delete the fabricated "tip line" package (a whistleblower/source-intake banner with a masked Signal number, a `SecureDrop` label with no onion address, and a legally-unbackable source-protection guarantee) from `/about` and `/about/newsroom`. Revive and lightly extend the already-existing Business info block on `/about` so readers still have a real point of contact, without duplicating `/contact`. Fix the two most legally exposed overclaim sentences on `/contact` and `/press` with capability-true copy in all three shipped languages. Update the `about-trust` `_GUIDE.md` so the tip line does not silently regrow. Separately, move the `/about/newsroom` route to a top-level `/newsroom` route with a 301 redirect, following the exact precedent already in `next.config.ts` for the `asia` → `latest` pillar rename.

This plan does **not** clean up the newsroom page's other fabricated content (named bureaus, fabricated EIC career history, 8-person named masthead, "What we cover" beat grid). Those are recorded under [Deferred](#deferred--explicitly-out-of-scope) so they are not lost, but are explicitly out of scope here per user instruction.

Read `process/context/all-context.md` first (root router — invariants #5 editorial integrity, #8 CMS entities, #9 i18n en/id/vi, #12 compliance apply directly to this plan), then `process/context/uxui/all-uxui.md` (dark-mode discipline, i18n chrome `t(en, vi, id)` pattern, em-dash policy), then `process/features/about-trust/_GUIDE.md` (this plan edits that file directly), then `process/context/planning/all-planning.md` for plan-shape calibration. All were read during planning; EXECUTE should re-read `all-context.md` and `uxui/all-uxui.md` before touching any copy or styling.

## Background (verified)

- The "Securely contact the newsroom" navy banner is a tip line. It was invented by the designer under an open-ended "add whatever demonstrates credibility" brief (`design/chats/chat1.md:337`), listed at `chat1.md:381`, the same batch that produced the fake cap table, fake awards, and fake memberships the user has already ordered removed elsewhere.
- **No infrastructure backs it.** Repo-wide grep for `securedrop|onion|pgp|\.asc|gpg` (case-insensitive) returns only the literal display strings inside the two files touched by this plan — confirmed by direct grep during planning. `Signal · +65 8XXX XXXX` contains a literal `XXXX` placeholder mask; `SecureDrop · onion link` is the words "SecureDrop" and "onion link", not a resolvable URL.
- **Legal reality (Singapore).** No shield law (`KLW Holdings v SPH [2002] SGHC 150` — "there is no 'newspaper rule' here"). Criminal Procedure Code s39/s40 permit compelled device access and compelled decryption without judicial approval. The shipped claim "have never disclosed a source to a third party, including law enforcement, without a sealed legal challenge first" is both an unverifiable track record (DTW founded 2023, barely published) and a promise DTW has no legal power to keep. SPJ Ethics: "reporters should not make a pledge of confidentiality they are not empowered to honor and enforce."

## Decisions Already Made

These come from the user and are not open for relitigation in this plan:

1. Delete the tip-line banner entirely from both `/about` and `/about/newsroom` — no replacement banner, no new dedicated contact section.
2. Revive `/about`'s existing Business info block (already lists `media@` and `partnership@`) by making its emails clickable and adding a link to `/contact`, instead of creating a new contact surface. Rationale: the footer already links `/contact` on every page — `/about` should point, not copy.
3. Fix the two most legally exposed overclaim sentences (`contact/page.tsx` media channel, `press/page.tsx` story-tips channel) with capability-true replacement copy in `en`/`vi`/`id`. Do not replace one overclaim with a softer overclaim.
4. Update `process/features/about-trust/_GUIDE.md` so the tip line is removed from the "current settled state" spec section and added to the "keep removed" list with rationale, and note the removal is repo-wide policy, not `/about`-specific.
5. Move `/about/newsroom` → `/newsroom` as a top-level route, with a 301 redirect following the exact pattern already established in `next.config.ts` for the `asia` → `latest` rename.
6. Defer cleanup of the newsroom page's other fabricated content (bureaus, EIC career history, named masthead, beat grid) to a later plan — record it, do not touch it here.

## Open Decisions Needed (do NOT auto-apply)

The user asked that four secondary overclaim-adjacent sentences be evaluated and flagged, but explicitly deferred the decision on whether to touch them. **EXECUTE must not silently modify these** — surface them to the user (or orchestrator) before touching, and only act on explicit go-ahead. They are NOT part of the numbered Implementation Checklist below.

| # | Location | Current text | Why flagged | Recommendation |
|---|---|---|---|---|
| D1 | `apps/web/src/app/(reader)/contact/page.tsx:24` | "A person replies, usually within a business day." | Mild — a responsiveness claim, not a legal/security guarantee. Plausibly true for a small shared inbox. | Leave as-is unless user wants every "human triage" implication removed on principle. |
| D2 | `apps/web/src/app/(reader)/contact/page.tsx:211` | "We aim to reply to every message within one business day. Sensitive tips are read first." | The second sentence implies a staffed triage/priority system that does not exist (a shared mailbox has no read-order priority). | Recommend dropping "Sensitive tips are read first." Keep the response-time sentence. |
| D3 | `apps/web/src/app/(reader)/press/page.tsx:103` | "...write to one address — it reaches an editor, not a queue. We read every message and reply quickly." | "not a queue" overclaims certainty about who reads a shared mailbox first and how fast. | Recommend softening to something like "reaches the newsroom directly" without the "not a queue" contrast. |
| D4 | `apps/web/src/app/(reader)/press/page.tsx:253` | "We aim to reply to press within one business day. Confidential tips are read first, by an editor." | Same triage-priority overclaim as D2, in the press context. | Recommend dropping "Confidential tips are read first, by an editor." Keep the response-time sentence. |

If the user approves any of D1-D4, EXECUTE should apply the same capability-true philosophy as steps A4a/A4b below (see [Workstream A](#workstream-a--tip-line-package)) and update all three locales together.

---

## Touchpoints

Files this plan reads or writes, verified against the current repo state (all line numbers confirmed via direct `grep -n` / `Read` during planning — do not re-derive, but EXECUTE should re-confirm line numbers immediately before editing since Workstream A edits shift Workstream B's file's own line numbers, and vice versa within the same file):

| File | Workstream | Change |
|---|---|---|
| `apps/web/src/app/(reader)/about/page.tsx` | A | Delete `TIP_LINES` const, delete tip-line `<Reveal>` section, trim now-unused `IconName` import, revive Business info block (mailto + `/contact` link) |
| `apps/web/src/app/(reader)/about/newsroom/page.tsx` | A + B | Delete `TIP_LINES` const, delete `BANNER_FILL` const, delete tip-line `<Reveal>` section (A); then move the whole (edited) file to `apps/web/src/app/(reader)/newsroom/page.tsx` and update its internal back-link (B) |
| `apps/web/src/app/(reader)/contact/page.tsx` | A | Replace overclaim sentence in the `media@` channel description (all 3 locales) |
| `apps/web/src/app/(reader)/press/page.tsx` | A | Replace overclaim sentence in the "Story tips & documents" topic description (all 3 locales) |
| `process/features/about-trust/_GUIDE.md` | A | Remove "Tip line (dark)" spec section, add it to "keep removed" list with rationale, add repo-wide-policy note |
| `apps/web/src/components/footer.tsx` | B | Update newsroom nav link `/about/newsroom` → `/newsroom` |
| `apps/web/src/app/sitemap.ts` | B | Update `STATIC_ROUTES` entry `/about/newsroom` → `/newsroom` |
| `apps/web/next.config.ts` | B | Add 301 redirect `/about/newsroom` → `/newsroom` in the existing `redirects()` block |

No database, schema, auth, or API contract changes. No new dependencies. No Payload collection changes.

## Public Contracts

- **Route surface change (breaking without the redirect, non-breaking with it):** `/about/newsroom` stops resolving as a Next.js page and becomes a 301 redirect target to `/newsroom`. Any inbound link (search engines, external backlinks, bookmarks) is preserved via the redirect — this is the same contract shape already established for `/asia` → `/latest` in `next.config.ts:16-22`.
- **Sitemap contract:** `sitemap.ts`'s `STATIC_ROUTES` is consumed by `/sitemap.xml` (RFC-007 of the already-shipped `per-page-seo-metadata` plan, commit `4e1e028`). Search engines will see `/newsroom` instead of `/about/newsroom` on next crawl; no other consumer of this array exists in the repo.
- **Footer nav contract:** `footer.tsx`'s `cols` array is rendered on every page (global chrome). The single "Newsroom" link entry changes its `href`, label text (`t("Newsroom", "Toà soạn", "Redaksi")`) unchanged.
- **No public API/data contract changes.** This plan touches only client-rendered marketing pages and static route config.

## Blast Radius

- **Direct:** 2 route files, 2 marketing-copy files, 1 nav component, 1 sitemap file, 1 Next.js config file, 1 process doc. 8 files total.
- **Indirect:** any external link to `dailytechwire.com/about/newsroom` (none exist yet — site is pre-launch per `process/general-plans/reports/human-ops-launch_STATUS-HANDOFF_15-06-26.md`) will 301 to `/newsroom` going forward, so this is effectively a zero-risk route move at this stage.
- **Confirmed NOT touched by this plan** (verified via repo-wide grep for `about/newsroom` during planning, excluding `design/chats/*.md` and `process/general-plans/{reports,references}/*.md` which are historical/point-in-time records that should NOT be edited): no other `apps/web/src` file, no test file (none exist — greenfield, confirmed via `process/context/tests/all-tests.md`), no middleware (`middleware.ts` does not exist in `apps/web`).
- **`process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md`** references `about, about/newsroom` at lines 180 and 753 as part of its explicitly-deferred "Wave 3" (converting 11 `"use client"` routes to server-shell splits). That work has NOT started (Wave 3 is deferred, not scheduled) and RFC-007 (`sitemap.ts`, the only RFC from that plan touching a file this plan also touches) is already shipped in commit `4e1e028`. **No active conflict** — this plan's edit to `sitemap.ts` is a simple sequential follow-on edit to an already-merged file, not a collision with in-flight work. Flagging only so the executing agent doesn't second-guess touching a "recently SEO-planned" file.
- **No CMS/taxonomy impact** — `/about`, `/newsroom` are code-defined marketing routes, not Pillar/Sub-section/Tag entities (invariant #8 does not apply).

---

## Workstream A — Tip Line Package

Verify each line number below immediately before editing (re-run `grep -n` if any prior step in this workstream already shifted line numbers in the same file).

### A1. Delete tip-line banner + const from `/about`

File: `apps/web/src/app/(reader)/about/page.tsx`

1. Delete the `TIP_LINES` const declaration, lines **34-39** (the `const TIP_LINES: ReadonlyArray<...> = [...]` block, 4 entries: mail/tips@, lock/Signal, globe/SecureDrop, mail/corrections@).
2. Delete the entire tip-line section, lines **477-598** inclusive — starts at the `{/* Tip line */}` comment (line 477), through the matching `<Reveal>...</Reveal>` wrapper (line 478 to line 598). This is the third `<Reveal>` block after `{/* Trust quick links */}` and sits directly before `{/* Business info */}` (line 600, unaffected).
3. After deletion, `IconName` becomes unused in this file (confirmed: its only two usages were the import statement, line 5, and the deleted `TIP_LINES` type annotation, line 34 — no other usage exists in `about/page.tsx`). Change the import at line 5 from `import { Icon, type IconName } from "@/components/icons";` to `import { Icon } from "@/components/icons";`.
4. `GridBackdrop` (imported line 4) remains needed — it is also used in the Hero section at line 113, outside the deleted range. Do not touch that import.

### A2. Delete tip-line banner + const from `/about/newsroom`

File: `apps/web/src/app/(reader)/about/newsroom/page.tsx` (before the Workstream B move — do this edit while the file is still at its current path, then move it as step B1)

1. Delete the `TIP_LINES` const declaration, lines **113-118** (4 entries: mail/media@, lock/Signal, globe/SecureDrop, mail/corrections@ — note this file's first entry is `media@dailytechwire.com`, not `tips@`, unlike `/about`'s version).
2. Delete the entire "Securely contact the newsroom" section, lines **672-778** inclusive — starts at the `{/* Securely contact the newsroom — navy banner */}` comment (line 672), through the matching `<Reveal>...</Reveal>` wrapper (line 673 to line 778). This sits directly before `{/* Footer-style business info */}` (line 780, unaffected — do not touch that section, it is separate from the deleted tip-line banner and is not part of this plan's scope).
3. Of the five `BANNER_*` fixed-color consts (lines 128-132: `BANNER_HEADING`, `BANNER_BODY`, `BANNER_META`, `BANNER_BORDER`, `BANNER_FILL`), only **`BANNER_FILL` becomes unused** after this deletion (its sole usage was line 755, inside the deleted block). Delete only the `BANNER_FILL` const line (132). **Keep** `BANNER_HEADING`, `BANNER_BODY`, `BANNER_META`, and `BANNER_BORDER` — all four are still used by the Hero section outside the deleted range (`BANNER_HEADING` at lines 142/149/156/238/279; `BANNER_BODY` at line 253; `BANNER_META` at line 285; `BANNER_BORDER` at line 267). Verified via grep during planning: `BANNER_BORDER` has a second usage inside the deleted block (line 756) in addition to its kept usage (line 267) — deleting the block does not remove its only usage, so it stays.
4. `IconName` remains needed in this file regardless of the `TIP_LINES` deletion — it is also used in the `Beat` interface (`icon: IconName`, line 20), which backs the out-of-scope `BEATS` array. Do not touch the import at line 9.
5. `GridBackdrop` and `Icon` (imported lines 8-9) remain needed — both are used in the Hero section (lines 199, 353) outside the deleted range. Do not touch those imports.

### A3. Revive Business info block on `/about`

File: `apps/web/src/app/(reader)/about/page.tsx`, Business info section (currently lines 600-637, will shift up by ~122 lines after A1's deletions — re-locate by searching for the `{/* Business info */}` comment rather than trusting the pre-A1 line number).

Current state: a 3-column grid (`BIZ_INFO`, lines 41-48) rendering "Registered office" (multi-line address, not an email), "Press inquiries" (`media@dailytechwire.com`), and "Partnerships" (`partnership@dailytechwire.com\nasiapresscentre.com` — email on line 1, bare domain on line 2). All three values render as plain text via `whiteSpace: "pre-line"`. Zero `mailto:` links exist anywhere on this page today (confirmed via repo grep during planning).

Required changes:

1. **Make embedded email addresses clickable, leave non-email lines as plain text.** Do this by replacing the current `{v}` render (a single string dumped into a `whiteSpace: "pre-line"` div) with per-line rendering: split each `BIZ_INFO` value on `\n`, and for each resulting line, test it against an email pattern. Reuse the exact regex already established in this repo for email validation, `apps/web/src/lib/account-actions.ts:136` (`/^[^@\s]+@[^@\s]+\.[^@\s]+$/`) — define an equivalent local constant in `about/page.tsx` rather than importing across the client/server boundary (that file is a server-action module, this component is `"use client"`). Lines matching the pattern render as `<a href={`mailto:${line}`}>` styled to match the existing accent-link convention already used for the `mailto:` links in `contact/page.tsx:145-151` (`color: var(--accent-ink)`, no underline / `textDecoration: "none"`). Lines that do not match (the multi-line "Registered office" address, and the bare `asiapresscentre.com` domain on the second line of "Partnerships") render as plain text exactly as today. Multiple lines within one value must still stack visually the way `whiteSpace: "pre-line"` currently does — use an explicit line-break element between mapped lines rather than relying on `pre-line` once the value is split into JSX elements.
2. **Result:** "Press inquiries" (`media@dailytechwire.com`) becomes fully clickable. "Partnerships" line 1 (`partnership@dailytechwire.com`) becomes clickable; line 2 (`asiapresscentre.com`) stays plain text (it is a bare domain reference, not confirmed to resolve to a live linkable page in this plan's scope — do not add a `https://` link to it without separate confirmation). "Registered office" is unaffected (no email content).
3. **Add a link to `/contact`.** Add a fourth grid cell to the same `BIZ_INFO` grid section (it already uses `gridTemplateColumns: repeat(auto-fit, minmax(min(100%, 200px), 1fr))`, so a 4th cell fits the existing responsive layout without restructuring). Heading label (matching the `className="upper"` styling already used for the other three headings): `t("General inquiries", "Liên hệ chung", "Pertanyaan umum")`. Content: a `<Link href="/contact">` (the `Link` import already exists at the top of this file, line 3) with text `t("Visit our Contact page", "Xem trang Liên hệ", "Kunjungi halaman Kontak")`, styled to match the existing `/trust/${k}` link convention already in the same file (`className="linkish"`, `style={{ color: "var(--accent)" }}` — see the existing pattern at lines 283-296 for "Editorial Standards"/"AI Disclosure").
4. This is a plain-data change to a `"use client"` component — no server/data-fetch implications, no schema change.

### A4. Fix overclaim copy (mandatory — both en/vi/id must ship together per string)

**A4a. `apps/web/src/app/(reader)/contact/page.tsx`, lines 34-36** (the "Press & media" channel description — `en` at line 34, `vi` at 35, `id` at 36, inside the `t(...)` call that also sets `email: "media@dailytechwire.com"` at line 32).

Current EN: "Interview requests, press credentials, story tips, and confidential sources. We protect our sources and read every tip carefully."

Replace all three locale strings with capability-true copy. Exact replacement text (ship all three together, in this order — en, vi, id — matching the existing `t(en, vi, id)` call signature):

- EN: "Interview requests, press credentials, story tips, and confidential sources. This inbox isn't encrypted, and Singapore law doesn't let us promise blanket source protection – for sensitive material, message us first to arrange a safer way to talk."
- VI: "Yêu cầu phỏng vấn, thẻ báo chí, mật báo và nguồn tin bảo mật. Hộp thư này không được mã hoá, và luật Singapore không cho phép chúng tôi hứa bảo vệ nguồn tin tuyệt đối – với thông tin nhạy cảm, hãy nhắn cho chúng tôi trước để sắp xếp cách trao đổi an toàn hơn."
- ID: "Permintaan wawancara, kredensial pers, tip berita, dan sumber rahasia. Kotak surat ini tidak terenkripsi, dan hukum Singapura tidak memungkinkan kami menjanjikan perlindungan sumber secara mutlak – untuk materi sensitif, hubungi kami dulu untuk mengatur cara berkomunikasi yang lebih aman."

Note: uses the en dash `–`, not the em dash `—`, per the repo's em-dash policy (`process/context/uxui/all-uxui.md:167`). VI/ID phrasing was drafted for this plan and should get a native-editorial spot-check before ship (flag this in the PR/handoff, do not block execution on it — the existing repo already ships agent-drafted VI/ID chrome copy throughout, so this is consistent with current practice, not a new risk).

**A4b. `apps/web/src/app/(reader)/press/page.tsx`, lines 33-35** (the "Story tips & documents" topic description — `en` at line 33, `vi` at 34, `id` at 35, inside the `t(...)` call at line 32, itself inside the `topics` array entry whose icon is `"lock"`, line 30).

Current EN: "Send us a lead in confidence. We guard our sources and never name them without a fight in court."

This is the single most legally exposed sentence on the site — it implies an adversarial court process is guaranteed, but Singapore's Criminal Procedure Code s40 permits compelled decryption with no judicial step. Exact replacement text:

- EN: "Send us a lead in confidence. We keep it as private as we can, but Singapore has no shield law – we can't guarantee a court fight before any compelled disclosure, so avoid emailing anything highly sensitive."
- VI: "Gửi đầu mối một cách kín đáo. Chúng tôi giữ bảo mật hết mức có thể, nhưng Singapore không có luật bảo vệ nguồn tin – chúng tôi không thể cam kết sẽ đấu tranh pháp lý trước khi buộc phải tiết lộ, vì vậy đừng gửi email những thông tin quá nhạy cảm."
- ID: "Kirim petunjuk secara rahasia. Kami menjaganya serahasia mungkin, tetapi Singapura tidak punya undang-undang perlindungan sumber – kami tak bisa menjamin perlawanan hukum sebelum pengungkapan paksa, jadi hindari mengirim materi yang sangat sensitif lewat email."

Same em-dash note as A4a applies.

### A5. Update `process/features/about-trust/_GUIDE.md`

1. Remove the entire "### Tip line (dark)" section, currently lines **65-70** (heading + 4 bullets: `tips@dailytechwire.com`, Signal, SecureDrop, Corrections). This section currently sits inside the "current settled state — do not regress" spec (above the "What's NOT on the page" list at line 72), which makes it *sanctioned* content today — that must change.
2. Add a new bullet to the "### What's NOT on the page (removed during iteration — keep removed)" list (currently starting line 72), worded to capture the reason, e.g.: "Tip line / secure-contact banner (`tips@`/`media@`, masked Signal number, unresolvable SecureDrop reference, unbackable source-protection guarantee) — no infrastructure exists to back any of these claims, and Singapore has no shield law (no newspaper rule; CPC s39/s40 permit compelled decryption without judicial approval), so the guarantee is both fabricated track record and an unkeepable promise. Same category as the removed awards/cap table content. Removed [16-07-26]."
3. Add a short standalone note (near the top of the "What's NOT on the page" section, or as a closing sentence after the new bullet) stating: removal of the tip line applies to **every** contact/trust surface, present and future — not just `/about`. Root cause of the original regrowth: the user's blanket removal instruction (`chat1.md:457`, "toàn bài") predates `/about/newsroom`, which was born later and re-accumulated the same content pattern independently.
4. Do not touch any other section of `_GUIDE.md` (Editor-in-Chief, masthead, ownership/funding, etc. are unrelated to this plan and already correctly documented).

### A6. Verify the `tips@` orphan resolves

`tips@dailytechwire.com` appears exactly once in `apps/web/src` today (`about/page.tsx:35`, inside the deleted `TIP_LINES` const). No other file references it. This resolves automatically once A1 is complete — this is a verification check (see [Verification Evidence](#verification-evidence)), not a separate edit step.

---

## Workstream B — Move `/about/newsroom` to `/newsroom`

Do this workstream after A2 so the file being moved is already free of the deleted tip-line section (avoids doing the same content edit twice, once before and once after the move).

### B1. Move the route file

1. Move `apps/web/src/app/(reader)/about/newsroom/page.tsx` → `apps/web/src/app/(reader)/newsroom/page.tsx`. Use `git mv` (not a delete + recreate) so file history is preserved. Confirmed via directory listing during planning: `about/newsroom/` contains only `page.tsx` (no `layout.tsx`, `loading.tsx`, `error.tsx`, or other route files), and `apps/web/src/app/(reader)/newsroom/` does not exist yet (no collision). After the move, the now-empty `about/newsroom/` directory should no longer exist on disk (git does not track empty directories, so a plain `git mv` of the only file will naturally leave nothing behind to commit — verify no stray empty directory remains locally).
2. Update the back-link inside the moved page, currently `<Link href="/about" ...>` at line 820 (pre-move numbering — re-locate after the move + Workstream A edits shift the line). The link currently reads (all 3 locales): "← The trust & standards view of dailytechwire". Once `/newsroom` is a top-level sibling of `/about` rather than a child of it, the "← Back to About" implication a nested route usually carries no longer applies structurally, but the link's actual copy already frames it as a *content* cross-reference ("the trust & standards view"), not a breadcrumb-style "back" link — **recommendation: keep the link and its existing copy/href unchanged.** It remains a valid, correctly-worded cross-link between two sibling marketing pages. Do not invent new copy for this step; only change it if the user says otherwise during review.

### B2. Update the footer nav link

File: `apps/web/src/components/footer.tsx`, line 19.

Change `[t("Newsroom", "Toà soạn", "Redaksi"), "/about/newsroom"]` to `[t("Newsroom", "Toà soạn", "Redaksi"), "/newsroom"]`. Label text (all 3 locales) is unchanged — only the `href` string changes.

### B3. Update the sitemap static routes list

File: `apps/web/src/app/sitemap.ts`, line 17 (inside `STATIC_ROUTES`, lines 15-36).

Change `"/about/newsroom",` to `"/newsroom",`. Preserve its position in the array (no reordering needed — the array is not order-sensitive, but minimizing the diff is preferred). This file was last touched by the already-shipped `per-page-seo-metadata` plan (RFC-007, commit `4e1e028`) — this is a normal sequential follow-on edit, not a conflict (see [Blast Radius](#blast-radius)).

### B4. Add the 301 redirect

File: `apps/web/next.config.ts`, inside the existing `redirects()` function, lines 17-22.

Add a new redirect entry to the array, following the exact comment + object-shape precedent already established for the `asia` → `latest` pillar rename (lines 16-21):

- Comment (placed directly above the new entry, matching the existing comment style): `// /about/newsroom moved to /newsroom (2026-07-16). Preserve old links.`
- Entry: `{ source: "/about/newsroom", destination: "/newsroom", permanent: true }`

Do not add a wildcard/`:path*` variant — `/about/newsroom` has no sub-routes (confirmed: it is a single `page.tsx` with no dynamic segments), unlike the `/asia` pillar which needed both an exact and a `:path*` redirect because pillar routes have sub-paths (`/asia/[subsection]/[slug]`).

### B5. Confirm no other reference to `/about/newsroom` was missed

Repo-wide grep for `about/newsroom` during planning (excluding `node_modules`, `.next`) found matches only in: `apps/web/src/app/sitemap.ts` (B3), `apps/web/src/components/footer.tsx` (B2), plus historical/point-in-time docs that must **not** be edited (`design/chats/chat2.md`, `design/chats/chat4.md` — design iteration history; `process/general-plans/reports/human-ops-launch_STATUS-HANDOFF_15-06-26.md` and `process/general-plans/references/design-refresh-comparison_14-06-26.md` — dated status snapshots; `process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md` — a separate active plan, already reasoned about in [Blast Radius](#blast-radius), do not edit it as part of this plan). Re-run the same grep immediately before finishing EXECUTE to confirm nothing new was introduced and nothing was missed.

---

## Deferred / Explicitly Out of Scope

Recorded so it is not lost. Do **not** implement any of the following in this plan — they require their own plan and their own user confirmation pass, and they are content-fabrication issues distinct from the tip-line/route-move work above.

The `/newsroom` page (post-move) still contains substantial fabricated content the user has already ordered removed elsewhere:

- **6 named bureaus with named chiefs** (Singapore, Tokyo, Seoul, Jakarta, Bengaluru, Hanoi) — `BUREAUS` const, lines 104-111 of the pre-move file. Contradicts `chat1.md:457`: "bỏ các văn phòng đi vì tạm thời chưa có nhiều văn phòng đến vậy. bỏ cả thông tin về newsrooms ở tất cả toàn bài."
- **Fabricated Cheryl Tan career history** — lines 469-487 of the pre-move file ("bureau-chief roles at international wire services", "postings across Singapore, Tokyo, and Hong Kong", "guest-lectured... at several universities"). Same structural pattern as the earlier rejected Reuters/Pulitzer draft with proper nouns swapped out. `_GUIDE.md:45-46` already records that the name is a placeholder and the career history must stay removed.
- **8-person named masthead with avatars** — `MASTHEAD` const, lines 93-102 of the pre-move file. `_GUIDE.md:51-52` requires an anonymized 5-role masthead instead.
- **"What we cover" BEATS grid** — `BEATS` const (lines 26-84) and its rendered section (heading at line 302) of the pre-move file. `_GUIDE.md:78` and `chat1.md:440` ("bỏ mục what we cover đi") already record this as removed policy.

Also worth recording (lower priority, same pattern of unbacked specificity):

- `apps/web/src/components/header.tsx:238` — "Search 12,400 stories, dashboards, awards…" — a specific count with no corresponding data source in the repo.
- `apps/web/src/app/(reader)/trust/[slug]/trust-content.tsx:312` — "We have declined paid placements from 4 partners in the last 12 months over disclosure disagreements." — a fabricated audit statistic on the trust page itself.
- `apps/web/src/app/(reader)/trust/[slug]/trust-content.tsx:137` — "Last updated · 12 May 2026" — hardcoded, not derived from actual content update dates.

**Tension to flag explicitly:** this plan promotes `/newsroom` to a more prominent, memorable top-level URL while it still contains the fabrications listed above. The deferred cleanup should land before, or together with, any production launch — moving the URL now is still correct (it is purely structural and reversible via the redirect), but do not treat the route move as implying the content is launch-ready.

---

## Phase Completion Rules

This plan is SIMPLE-to-MEDIUM and has two workstreams rather than numbered RFC phases, but the same completion discipline applies to each workstream before it is marked done:

1. **Integration Test** — `pnpm typecheck` and `pnpm build` both succeed with zero new errors after the workstream's edits.
2. **Manual Test** — the exact `curl`/browser checks listed in [Verification Evidence](#verification-evidence) for that workstream are performed by the executing agent (standing in for a human) and their actual output is recorded, not assumed.
3. **Data Verification** — not applicable (no CMS/DB reads in either workstream), but the content-guard greps must be run against the real edited files, not asserted from memory.
4. **Error Handling** — Workstream B specifically: confirm `/about/newsroom` returns a redirect (not a 404) and `/newsroom` returns 200 (not a 404) before considering B done; a half-migrated state (file moved but redirect missing, or redirect added but file not moved) must never be left as a stopping point.
5. **User Confirmation** — the user (or reviewing agent) confirms the specific checks in [Acceptance Criteria](#acceptance-criteria) for each workstream before it is marked ✅ VERIFIED in this file's Status line.

Status meanings for this plan (mirrors the convention used elsewhere in this repo, e.g. `per-page-seo-metadata_PLAN_16-07-26.md`):

- ⏳ PLANNED — not started
- 🔨 CODE DONE — written but not manually verified
- 🧪 TESTING — currently being verified
- ✅ VERIFIED — manually verified and confirmed working

Workstreams A and B track this status independently (see [Resume and Execution Handoff](#resume-and-execution-handoff)).

---

## Verification Evidence

Automated gates available in this repo today (per `process/context/tests/all-tests.md` — this is a greenfield project, no Vitest/Playwright suites exist yet, so verification here is typecheck/build + manual/grep-based content checks):

1. **Typecheck:** `pnpm typecheck` (root, runs `turbo typecheck` → `tsc --noEmit` per package) must pass with zero new errors. Confirms the `IconName`/`BANNER_FILL` import trims in A1/A2 don't leave dangling references, and that the moved file in B1 resolves its relative imports correctly from the new path (it uses only `@/`-aliased imports — `@/components/cover-art`, `@/components/effects`, `@/components/icons`, `@/lib/i18n` — so the move should not require import path changes, but confirm via typecheck).
2. **Build:** `pnpm build` (root) must succeed. Confirms `next.config.ts`'s new redirect entry is valid, `sitemap.ts` compiles, and both edited route files render without a build-time throw.
3. **Content-guard grep (tip line fully gone):**
   ```
   grep -rniE "8XXX|SecureDrop|onion link|tips@dailytechwire" apps/web/src
   ```
   Must return **zero** matches.
4. **Content-guard grep (revived contact surface present):**
   ```
   grep -c "mailto" apps/web/src/app/\(reader\)/about/page.tsx
   ```
   Must return a count **> 0** (was 0 before this plan).
5. **Content-guard grep (overclaim sentences gone):**
   ```
   grep -n "sealed legal challenge\|never name them without a fight in court\|read every tip carefully" apps/web/src
   ```
   Must return zero matches for the two fixed sentences (A4a's "read every tip carefully" and A4b's "fight in court") — note the third phrase ("sealed legal challenge") lived only inside the deleted `<Reveal>` banners from A1/A2, so it should already be gone from that deletion; this grep re-confirms it wasn't duplicated anywhere else.
6. **Route verification:**
   - `curl -sI http://localhost:3000/about/newsroom` (dev server running) returns `HTTP 307` or `308`/`301`-class redirect (Next.js dev serves `permanent: true` redirects as 308 in dev, 301 in production build — confirm whichever the local environment reports is consistent with a permanent redirect, not a 404) with `Location: /newsroom`.
   - `curl -sI http://localhost:3000/newsroom` returns `200`.
   - `curl -s http://localhost:3000/sitemap.xml | grep -c "/about/newsroom"` returns `0`; `grep -c "/newsroom<"` (or equivalent XML-safe match) returns `1`.
7. **Footer link verification:** load any page, open the footer, confirm the "Newsroom" link (and its VI "Toà soạn" / ID "Redaksi" labels under each locale) points to `/newsroom`, not `/about/newsroom`.
8. **All 3 locales render:** manually load `/about`, `/newsroom`, `/contact`, `/press` with `?lang=vi` and `?lang=id` (or via the in-app locale switcher, per `process/context/uxui/all-uxui.md`'s `localStorage["dtw-lang"]` persistence) and confirm no missing-translation fallback-to-English gaps in the newly-added/edited copy (A3's new "General inquiries" cell, A4a/A4b's replacement sentences).
9. **Dark mode spot-check:** since the deleted sections were inside `var(--banner)` dark surfaces using fixed light text values, and the surviving Business info section uses `var(--ink-2)`/`var(--muted)` tokens, toggle dark mode on `/about` and confirm the new mailto links and the "General inquiries" cell remain legible (no hardcoded rgba regression — see `process/context/uxui/all-uxui.md`'s Dark Mode Discipline section).

### Grep-based guard recommendation

No automated test suite exists yet in this repo (confirmed greenfield — `process/context/tests/all-tests.md`). **`vc-tester` is not warranted for this plan** — there is nothing for it to run against; typecheck + build + the manual grep/curl checks above are the only available gates today. **A permanent grep-based content guard IS recommended, but as future work, not as part of this plan's execution**: once CI (`.github/workflows/`) exists, add a lint-style check (e.g. a small script or a `grep -rniE "securedrop|onion link|8XXX|bureau-chief" apps/web/src` step) that fails CI if any of the removed fabrication patterns reappear, covering both this plan's tip-line removal and the deferred newsroom-content cleanup once that lands too. Do not build this CI step now — no CI pipeline exists to attach it to (per `all-tests.md` Known Gaps).

---

## Rollback

- Workstream A and B are independently revertible via `git revert` on their respective commits (recommend committing A and B separately — see [Resume and Execution Handoff](#resume-and-execution-handoff)).
- Workstream B's redirect (B4) means even a partial/unrolled-back state is safe for readers: if B1-B3 ship but B4 is somehow skipped, `/about/newsroom` would 404 rather than redirect — so B4 must ship in the same commit/PR as B1-B3, not deferred.
- Workstream A has no data migration and no external dependency — reverting the diff fully restores prior behavior (the tip line reappearing is undesirable but not unsafe; this is a content-only revert).

## Acceptance Criteria

- [ ] `/about` no longer renders any tip-line content; its Business info block has clickable `mailto:` links for `media@dailytechwire.com` and `partnership@dailytechwire.com`, plus a working link to `/contact`.
- [ ] `/newsroom` (moved from `/about/newsroom`) no longer renders any tip-line content; its own separate "Footer-style business info" section is unchanged.
- [ ] `/about/newsroom` returns a permanent redirect to `/newsroom`, not a 404.
- [ ] Footer "Newsroom" link and `sitemap.xml` both reference `/newsroom`, not `/about/newsroom`.
- [ ] `contact/page.tsx` and `press/page.tsx` no longer contain the two flagged overclaim sentences (A4a, A4b) in any of the 3 locales; replacement copy ships in all 3 locales together, using en-dash not em-dash.
- [ ] `process/features/about-trust/_GUIDE.md` no longer specs the tip line as current state; it is listed under "keep removed" with rationale, and the repo-wide-policy note is present.
- [ ] `pnpm typecheck` and `pnpm build` both pass with zero new errors.
- [ ] All content-guard greps in [Verification Evidence](#verification-evidence) return the expected zero/non-zero results.
- [ ] The four Open Decisions (D1-D4) were surfaced to the user and either explicitly deferred or explicitly resolved — not silently touched.
- [ ] The Deferred section's items (bureaus, EIC career history, masthead, beats grid, header story-count, trust-page audit stat, hardcoded "last updated" date) were **not** touched by this plan's execution.

---

## Resume and Execution Handoff

- **Recommended commit split:** two commits (or two PRs if the user prefers extra review surface) — one for Workstream A (tip-line package: A1-A6), one for Workstream B (route move: B1-B5). They can be executed and verified independently per this plan's structure; B should land after A2 specifically (not all of A) since B1 moves the file A2 already edited.
- **Within Workstream A**, A1/A2 (deletions) should land before A3 (Business info revival) since A3's grid-cell addition assumes the tip-line section above it is already gone (reduces merge/diff noise, not a hard technical dependency).
- **Single exact plan file for EXECUTE:** `process/features/about-trust/active/tip-line-removal-newsroom-route_PLAN_16-07-26.md` (this file). No other active plan in `process/features/about-trust/active/` exists to conflict with (directory was empty prior to this plan).
- **Do not let EXECUTE also touch** `process/general-plans/active/per-page-seo-metadata_PLAN_16-07-26.md` or its scope (Wave 3 `"use client"` → server-shell conversion) — that is a separate active plan with its own deferred scope; this plan's edits to `about/page.tsx`, `about/newsroom/page.tsx` (moved), and `sitemap.ts` are compatible with it (see [Blast Radius](#blast-radius)) but are not part of it.
- **After EXECUTE completes:** update this plan's Status to reflect the two workstreams' completion state (A and B can be marked independently, e.g. "A: ✅ VERIFIED, B: 🔨 CODE DONE" if only one lands first). Re-run the [Verification Evidence](#verification-evidence) grep list one more time as a final pass before archiving.
- **Open Decisions D1-D4** should be explicitly asked to the user at PLAN-review time or immediately after EXECUTE completes A4a/A4b — do not let them sit silently unresolved indefinitely; if declined, note the decision (and date) directly in this plan file before archiving to `completed/`.

## Next Step

Review this plan carefully. When ready, say **"ENTER EXECUTE MODE"** to begin implementation — the orchestrator should pass this exact file path to `vc-execute-agent`: `process/features/about-trust/active/tip-line-removal-newsroom-route_PLAN_16-07-26.md`. No other active plan should be inferred or substituted.
