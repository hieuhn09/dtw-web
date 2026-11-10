# DTW Web — Functional Requirements Specification (FRS)

| Field | Value |
|---|---|
| **Document** | Functional Requirements Specification (FRS) |
| **Product** | Dailytechwire (DTW) Web Application — `dtw-web` |
| **Version** | 1.0 |
| **Date** | 2026-07-28 |
| **Status** | Draft |
| **Author** | Business Analysis |
| **Publisher** | Asia Press Centre Group (APCG), Singapore |

**Relationship to the SRS.** This FRS is the detailed companion to the DTW **System Requirements Specification (SRS)**. The SRS states *what the system must be* at the level of stakeholders, scope, high-level capabilities, and non-functional quality attributes. This FRS states *what the system must do* at the level of individually testable functional requirements (FRs), the business rules (BRs) that govern them, the end-to-end use cases (UCs) that chain them, the data entities they read and write, and a full traceability matrix back to the canonical spec sheet (`DTW_WEBSITE_REQUEST.xlsx`) and the implementing code. Where the SRS says "the reader site shall meter free reads," this FRS specifies the exact meter, threshold source, reset boundary, and acceptance criteria. The two documents share the same actor model, the same module decomposition, and the same requirement-ID scheme.

---

## 1. Introduction

### 1.1 Purpose & Scope

**Purpose.** This document specifies the complete functional behavior of the DTW reader-and-presentation web application (`dtw-web`): the public reading site, the embedded Payload CMS editorial console at `/admin`, the reader account surface, and the Content Engine intake integration. It is the authoritative reference for engineering, QA, editorial operations, and downstream integration (the external `dtw-engine` Content Engine service).

**In scope.**

- Global navigation & chrome (header, footer, search overlay, theme, i18n, PWA manifest).
- Homepage editorial bands (hero, pillar showcase, Most Read, awards, and feature-flagged bands).
- Article & pillar/subsection reading pages, disclosures, related content, RSS.
- The soft paywall meter and sign-in nudge.
- Data-desk dashboards (Asia Funding Tracker, AI Leaderboard).
- Search (instant overlay + full page) and search analytics posture.
- Newsletters (six pillar-segmented products, subscription capture, double opt-in target).
- Authentication (email+password, verification, reset, OAuth) and the reader account.
- CMS, RBAC (5 roles), and taxonomy (Pillars, Tags, Authors, Media, Sponsor Slots, Wire Drops, Corrections, Newsletters).
- Content Engine integration (intake API, provenance, conflict-resolution model, revalidation hooks).
- About & Trust pages (APCG, Newsroom, Editorial Standards, AI Disclosure, Corrections, Transparency, Sponsored/Affiliate Policy, marketing & legal pages).
- Platform / system-wide concerns (SEO & AI-search, feeds, PWA, i18n, accessibility, analytics, security & compliance, tech stack, data dictionary).

**Out of scope (Phase 2 / deferred).** Payments (Stripe/VNPay/Momo), text-to-speech audio, auto-generated Transparency Report, Awards back-end, the full Tiptap/rich editorial editor beyond Payload's Lexical, live realtime WebSocket push (Soketi/Pusher), Meilisearch/Typesense search backend, and PostHog analytics wiring. These are documented where they intersect a Phase-1 requirement so traceability is complete, and are enumerated in Section 8.

**Product principle.** *Editorial integrity is the product.* Every requirement that touches sponsored content, affiliate links, AI provenance, or the newsroom/commercial firewall is load-bearing and is called out with its governing business rule.

### 1.2 Relationship to the SRS

| Aspect | SRS | FRS (this document) |
|---|---|---|
| Altitude | System capabilities & quality attributes | Individually testable functional requirements |
| Requirement granularity | Capability-level ("shall meter reads") | Behavior-level (steps, preconditions, acceptance criteria) |
| Actors & roles | Defined once | Reused verbatim (Section 2) |
| Non-functional requirements | Owned & elaborated | Referenced and tied to specific FRs (NFR-* IDs) |
| Traceability | Spec → capability | Spec row → FR ID → code reference → status (Section 7) |

When a conflict arises between durable project facts, the order of authority is: (1) `DTW_WEBSITE_REQUEST.xlsx` (canonical 85+-row spec sheet), (2) the `design/` handoff bundle (visual reference only), (3) this repository's code (authoritative once written). Conflicts between spec and code are recorded as **Gaps** in Section 7 and Section 8, not silently resolved.

### 1.3 Conventions

**Identifier scheme.**

| Prefix | Meaning | Example |
|---|---|---|
| `FR-<MODULE>-NN` | Functional requirement | `FR-PAY-05` |
| `BR-<MODULE>-NN` (or `BR-NN`) | Business rule | `BR-NAV-11`, `BR-03` |
| `UC-<MODULE>-NN` (or `UC-NN`) | Use case | `UC-ENG-01` |
| `NFR-<MODULE>-NN` | Non-functional requirement | `NFR-SYS-01` |

Module codes: **NAV** (Global Navigation & Chrome), **HOME** (Homepage), **ART** (Article), **PIL** (Pillar/Subsection), **PAY** (Paywall & Metering), **DASH** (Dashboards), **SRCH** (Search), **NL** (Newsletters), **AUTH** (Authentication), **ACCT** (Account), **CMS** (CMS/RBAC/Taxonomy), **ENG** (Content Engine Integration), **TRUST** (About & Trust), **SYS** (Platform / System-wide). Where the source findings used bare IDs (e.g. `FR-ART-01`, `BR-01`, `UC-01` in the Article/Paywall module), those IDs are preserved verbatim to keep the code-grounded traceability intact.

**Priority scale (MoSCoW).**

- **Must** — required for Phase-1 launch; the product is incomplete without it.
- **Should** — important but a launch could proceed with a documented workaround.
- **Could** — desirable; often present in code behind a feature flag or as a stub.

**Status / Phase.**

- **Phase 1** — in the Phase-1 delivery scope. May be *implemented*, *partial*, or *feature-flagged off* (noted per FR).
- **Phase 2** — deliberately deferred; documented for traceability only.

**How to read an FR entry.** Each functional requirement is rendered as a labelled block with: **ID | Title | Priority | Phase | Actor | Trigger | Preconditions | Functional Behavior** (numbered steps) **| Business Rules** (references) **| Acceptance Criteria** (bulleted, testable) **| Source** (spec reference) **| Implementation** (code references). "KNOWN GAP" markers inside a block flag a documented spec-vs-code divergence that is also tracked in Sections 7–8.

### 1.4 References

1. `DTW_WEBSITE_REQUEST.xlsx` — canonical feature spec sheet (85+ rows; page-groups MENU/HEADER, FOOTER, HOMEPAGE, ARTICLE PAGE, PILLAR PAGE, DASHBOARDS, SEARCH, NEWSLETTERS, AUTH, ACCOUNT, TRUST PAGES, HỆ THỐNG (system-wide), CÔNG NGHỆ (technology), LUỒNG CHÍNH (end-to-end flows)).
2. `process/context/all-context.md` — repository context, architecture, and the numbered **Project Invariants** (#1–#14) referenced throughout this FRS.
3. `design/` — Claude Design handoff bundle (visual reference, not code to port).
4. Feature guides — `process/features/{homepage,articles,cms,dashboards,search,newsletters,account,engine-integration,about-trust}/_GUIDE.md`.
5. Implementation — the `apps/web/` Next.js 15 app, `apps/web/src/payload/` Payload CMS 3 configuration, and `packages/db/` Drizzle schema referenced per FR.

---

## 2. Actors & Roles

DTW distinguishes **reader identity** (Better-Auth accounts: `reader`, `pro`) from **editorial identity** (Payload CMS accounts: `author`, `editor`, `admin`). These are two separate account stores that reconcile in a later phase; this separation is itself an architectural fact (see `FR-CMS-04`).

| Actor | Description |
|---|---|
| **Guest** | Unauthenticated public reader. Reads published content, is metered by a cookie, may search, subscribe to newsletters by email, and follow the sign-in nudge. Drives all decisions about performance, SEO, PWA, and i18n. Primary audience. |
| **Reader** | Authenticated reader account (default role on signup). Can save/bookmark, follow pillars, keep reading history, manage newsletter subscriptions, and manage account settings. Metered by DB reading-history but never gated in Phase 1. No `/admin` access. |
| **Pro** | Reader with elevated `pro` role (product tier). Same reader capabilities; Pro-gated destinations are marked with a PRO badge in nav but Pro features are largely Phase 2. No `/admin` access. |
| **Author** | Editorial CMS user. Creates articles and edits only drafts linked to their own Author record; creates taxonomy/media; cannot publish others' work or delete. 2FA optional. |
| **Editor** | Editorial CMS user. Edits/publishes any article, manages taxonomy, assigns sponsors, logs corrections, edits the paywall threshold. 2FA mandatory (enforced at auth layer). |
| **Admin** | Full editorial authority. Manages editorial users and roles, deletes content, configures sponsor slots. 2FA mandatory. |
| **Content Engine (service)** | The external `dtw-engine` service account. Submits pre-approved, AI-assisted articles **only via the Payload API** (today: the bespoke `/api/engine/intake` endpoint authenticated by a shared bearer token). Never writes Postgres directly. Never crawls or authors on its own; returns reading behavior to analytics. |
| **Dev / Ops** | Build, deploy, and maintain the site and the Engine↔Payload contract. Flips compile-time feature flags, runs migrations/seeds, configures infra (CDN/WAF, R2, Resend). |

### 2.1 RBAC Permission Matrix

Cells: **Yes** = permitted; **No** = denied; **Own** = permitted only for the actor's own records/state; **—** = not applicable. Guest/Reader/Pro are Better-Auth roles; Author/Editor/Admin are Payload editorial roles.

| Capability | Guest | Reader | Pro | Author | Editor | Admin | Content Engine |
|---|---|---|---|---|---|---|---|
| Read published content | Yes | Yes | Yes | Yes | Yes | Yes | Yes (read taxonomy) |
| Bypass paywall / never metered-gated | No (metered) | Yes | Yes | Yes | Yes | Yes | — |
| Save / bookmark / follow pillar | No | Yes (Own) | Yes (Own) | Yes (Own) | Yes (Own) | Yes (Own) | — |
| Subscribe to newsletter | Yes (by email) | Yes (Own) | Yes (Own) | Yes (Own) | Yes (Own) | Yes (Own) | — |
| Submit / draft article | No | No | No | Yes | Yes | Yes | Yes (via API) |
| Edit article | No | No | No | Own drafts | Yes (any) | Yes (any) | Via API (create-only today) |
| Publish article | No | No | No | No | Yes | Yes | Yes via intake (bypasses RBAC by design) |
| Manage taxonomy (Pillars/Tags) | No | No | No | Create only | Create/Update | Full (incl. delete) | Resolve-only (never creates pillars) |
| Assign / configure sponsor slot | No | No | No | No | No | Yes | No |
| Manage users / roles | No | No | No | No | No | Yes | No |
| Access `/admin` (Payload console) | No | No | No | Yes | Yes | Yes | No (API only) |
| Require 2FA | — | No | No | Optional | Mandatory | Mandatory | — (bearer token) |
| Edit paywall threshold | No | No | No | No | Yes | Yes | No |
| Log a correction | No | No | No | No | Yes (create/update) | Yes (incl. delete) | No |
| Read Engine conflict audit log | No | No | No | No | Yes | Yes | No |

**Role notes.** Role strings are stored lowercase server-side (`reader|pro|author|editor|admin`); the header capitalizes for display only (`BR-NAV-06`). Role rank for comparisons is `reader < pro < author < editor < admin` via `roleAtLeast()` (`FR-AUTH-07`). An author cannot self-escalate their role — the `role` field is admin-write-locked (`BR-CMS-05`).

---

## 3. Functional Requirements (by Module)

Each requirement follows the block format defined in §1.3. Modules are ordered: 3.1 NAV → 3.2 HOME → 3.3 ART/PIL → 3.4 PAY → 3.5 DASH → 3.6 SRCH → 3.7 NL → 3.8 AUTH → 3.9 ACCT → 3.10 CMS → 3.11 ENG → 3.12 TRUST → 3.13 SYS.

### 3.1 Global Navigation & Chrome (NAV)

The persistent shell wrapping every reader-site (non-`/admin`) page: sticky two-tier header, CMS-driven pillar nav, global ⌘K search overlay, soft sign-in nudge, mobile drawer, multi-column footer, theme provider, i18n provider, reader layout composition, and PWA manifest. Several surfaces are feature-flagged OFF as of 2026-07-17 (language switcher, newsletter CTAs, Wire Drops ticker, Dashboards/Newsletters/Pro nav) because their pipelines are not yet shippable.

#### FR-NAV-01 — Sticky two-tier header shell
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** User loads or scrolls any reader-site page. · **Preconditions:** ReaderLayout resolved nav pillars and paywall threshold from Payload.
**Behavior:** 1. Header renders `position:sticky; top:0; z-index:40; background var(--paper)`. 2. On `scrollY > 8`, set `scrolled=true` and show a 1px `var(--hair)` bottom border with a .2s transition. 3. A ResizeObserver + resize listener recompute header height and set `documentElement --header-h = ceil(height)+px`. 4. The pillar-nav row carries a 3px `var(--brand-navy)` bottom border.
**Business Rules:** BR-NAV-01, BR-NAV-08
**Acceptance Criteria:**
- Any reader page shows a sticky header at `top:0`.
- Scrolling >8px shows a hairline bottom border.
- When header height changes (e.g. nudge appears), `--header-h` on `<html>` equals the new pixel height.
**Source:** MENU/HEADER row 3 (sticky; "Header tối giản, không cao quá"). · **Implementation:** `header.tsx:125-136,78-121`; `(reader)/layout.tsx:27-40`.

#### FR-NAV-02 — Brand wordmark + tagline linking home
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** User clicks the logo/wordmark. · **Preconditions:** None.
**Behavior:** 1. Render `<Wordmark size={32}/>` (theme-adaptive SVG: navy DTW monogram + lowercase `dailytechwire` + terracotta pulse-dot). 2. Render tagline via `t('Tech Intelligence, Wired Daily', …)` in mono muted text. 3. Wrap both in a `Link href='/'`. 4. Click navigates to homepage.
**Business Rules:** BR-NAV-02
**Acceptance Criteria:**
- The DTW wordmark + tagline render in the header.
- Clicking the wordmark navigates to `/`.
- In dark mode the monogram/wordmark use lightened `--brand-navy` (#E2E8F0).
**Source:** MENU/HEADER row 1 (Logo + tagline → /). · **Implementation:** `header.tsx:221-239`; `wordmark.tsx:8-56`.

#### FR-NAV-03 — Desktop search launcher (⌘K affordance)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** User clicks the search launcher or mobile search icon. · **Preconditions:** ShellProvider mounted.
**Behavior:** 1. Desktop: render a button (max-width 520) with a search icon, localized placeholder ("Search stories, awards…"), and a ⌘K `<kbd>`. 2. `onClick` calls `openSearch()`. 3. Mobile: render a 38×38 icon-only button (aria-label "Search") that also opens the overlay.
**Acceptance Criteria:**
- Clicking the desktop launcher opens the search overlay.
- Tapping the mobile search icon opens the overlay.
- A ⌘K hint is visible on the launcher.
**Source:** MENU/HEADER row 2 (Ô tìm kiếm → /search). · **Implementation:** `header.tsx:241-282,307-325`.

#### FR-NAV-04 — Global ⌘K/Ctrl+K search overlay with instant DB-backed suggestions
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** User presses ⌘K/Ctrl+K or clicks a search launcher. · **Preconditions:** ShellProvider mounted; SearchOverlay rendered in ReaderLayout.
**Behavior:** 1. Global keydown: `metaKey||ctrlKey` + `k` → `preventDefault` and `setSearchOpen(true)`. 2. Overlay renders when `searchOpen`; autofocuses input; clears query on reopen. 3. Each keystroke, after 200ms debounce, calls `runSearch(q)` and sets hits to the first 8 results. 4. Empty query shows suggested pills (sovereign AI, VNG, TSMC, datacenter, open weights). 5. Enter → `/search?q={encoded}` and close. 6. Click hit → `/article/{slug}` and close. 7. Escape or backdrop click closes.
**Business Rules:** BR-NAV-03
**Acceptance Criteria:**
- ⌘K opens the overlay with the input focused.
- After 200ms, up to 8 matching published articles list.
- Enter navigates to `/search?q={query}`; clicking a hit navigates to `/article/{slug}`.
- Escape or backdrop click closes the overlay.
**Source:** MENU/HEADER row 2; SEARCH row 1 (<300ms). · **Implementation:** `search-overlay.tsx:14-183`; `shell.tsx:132-142`; `search/search-action.ts:10-14`.

#### FR-NAV-05 — CMS-driven pillar navigation row
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** User views the header / clicks a pillar. · **Preconditions:** `getNavPillars()` returned pillars from Payload.
**Behavior:** 1. ReaderLayout calls `getNavPillars()` (unstable_cache, tag `pillars:all`, revalidate 300) and passes pillars to `<Header/>`. 2. Render one `Link` per pillar to `/{slug}` with pillar icon (color `p.color`) and `p.title[lang]` (English fallback). 3. If pathname starts with `/{slug}`, apply active styling (3px bottom border, text in `p.color`). 4. Nav regenerates ~5 min via ISR tag revalidation on pillar CMS writes.
**Business Rules:** BR-NAV-04
**Acceptance Criteria:**
- One nav link per pillar renders in pillar order.
- The current pillar's link is styled active in its color.
- A pillar added in the CMS appears within ~5 minutes with no deploy.
**Source:** MENU/HEADER row 3 ("Danh sách pillar lấy từ CMS"). · **Implementation:** `header.tsx:512-557`; `payload-server.ts:74-99`; `(reader)/layout.tsx:23-31`.

#### FR-NAV-06 — Secondary extras nav (Awards, Studio) with active state and PRO badge support
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** User views the header / clicks an extras item. · **Preconditions:** None.
**Behavior:** 1. Map `NAV_EXTRA` to `Link` items to `n.slug` with `localizedNavLabel(n.id, lang)`. 2. Active when pathname startsWith `n.slug`: accent text + 3px accent bottom border. 3. Render a `PRO` badge when `n.badge` is true. 4. Awards→`/awards` and Studio→`/studio` active; Dashboards/Newsletters/Pro commented out (2026-07-17).
**Business Rules:** BR-NAV-05, BR-NAV-09
**Acceptance Criteria:**
- Awards and Studio appear in the extras nav.
- On `/awards`, Awards is styled active.
- A `NAV_EXTRA` item with `badge=true` shows a PRO badge.
**Source:** MENU/HEADER rows 3–4. · **Implementation:** `header.tsx:558-603`; `data.ts:78-88`; `i18n.tsx:99-112`.

#### FR-NAV-07 — Login button and authenticated user dropdown menu
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Reader/Pro
**Trigger:** User clicks "Log in" or the user avatar button. · **Preconditions:** ShellProvider derives user from Better-Auth `useSession`.
**Behavior:** 1. `toShellUser` maps the Better-Auth session (lowercase role) to the capitalized User shape; null when no email. 2. No user → render "Log in" button calling `openAuth()`. 3. User present → avatar (`user.name[0]`) + first name + caret; toggle dropdown on click. 4. Dropdown header shows name, email, role badge. 5. Links: Saved→`/account/saved`, Reading history→`/account/history`, Following→`/account/following`, Account→`/account`. 6. Log out calls `authClient.signOut()`.
**Business Rules:** BR-NAV-06, BR-NAV-07
**Acceptance Criteria:**
- No session → "Log in" button opens the auth modal.
- Session → user's first name and avatar shown.
- "Account" navigates to `/account`; "Log out" invokes `authClient.signOut()`.
**Source:** MENU/HEADER row 5 (RBAC 5 roles; 2FA admin/editor). · **Implementation:** `header.tsx:346-487`; `shell.tsx:51-73`; `auth-client.ts`.

#### FR-NAV-08 — Dark/light theme toggle with persistence and system-preference default
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** User clicks the theme toggle (moon/sun). · **Preconditions:** ThemeProvider mounted.
**Behavior:** 1. On mount, `readInitialTheme()`: stored `dtw-theme` if light/dark else `prefers-color-scheme`. 2. Apply `document.documentElement.dataset.theme`. 3. Toggle shows moon in light, sun in dark; `onClick setTheme(opposite)`. 4. `setTheme` updates state, sets `data-theme`, writes localStorage `dtw-theme` (fails silently if unavailable). Dark uses bg #0F172A / text #E2E8F0.
**Business Rules:** BR-NAV-10
**Acceptance Criteria:**
- First visit with OS dark preference applies dark theme.
- Toggle flips the theme and updates `data-theme` on `<html>`.
- The stored theme is restored on reload.
**Source:** MENU/HEADER row 6 (Dark mode; localStorage + cookie; #0F172A/#E2E8F0). · **Implementation:** `theme-provider.tsx:18-51`; `header.tsx:327-344`.

#### FR-NAV-09 — Mobile hamburger navigation drawer
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** User taps the hamburger icon on mobile. · **Preconditions:** Mobile viewport.
**Behavior:** 1. Hamburger (aria-expanded) sets `menuOpen=true`. 2. While open: lock body overflow; Escape closes. 3. Drawer (`min(86vw,340px)`, inset-inline-end) shows Wordmark + close button, pillar links, divider, extras links. 4. Footer block: user → Account link + Log out; else → Log in button. 5. Any nav link click, route change, or backdrop click closes.
**Business Rules:** BR-NAV-08
**Acceptance Criteria:**
- Tapping the hamburger slides in a right-side drawer and locks body scroll.
- Escape/backdrop tap closes and unlocks scroll.
- Tapping a nav link closes the drawer and navigates.
**Source:** MENU/HEADER row 3 ("thu gọn ☰ trên mobile"). · **Implementation:** `header.tsx:489-508,682-896,85-103`.

#### FR-NAV-10 — Soft sign-in nudge driven by CMS-configurable read meter
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Guest's `articlesRead` reaches `paywallThreshold`. · **Preconditions:** Threshold from Payload global `paywallSettings` (default 3); user null; nudge not dismissed.
**Behavior:** 1. ShellProvider seeds `articlesRead` from the guest cookie meter (guest) or DB reading-history count (signed-in). 2. `showNudge = articlesRead >= paywallThreshold && !user && !nudgeDismissed`. 3. Render a banner with sign-in copy + "Sign in — it's free" (openAuth) + close. 4. Dismiss sets `nudgeDismissed` and writes localStorage `dtw-nudge-dismissed='1'`. 5. Nudge never blocks reading.
**Business Rules:** BR-NAV-11, BR-NAV-12
**Acceptance Criteria:**
- A guest who read ≥ threshold articles sees the sign-in nudge.
- "Sign in" opens the auth modal.
- Dismissal persists across reloads (localStorage).
- Changing the threshold in CMS re-triggers the nudge at the new count within ~5 min.
**Source:** MENU/HEADER row 5; invariant #4. · **Implementation:** `header.tsx:67-76,607-680`; `shell.tsx:97-130`; `payload-server.ts:576-593`.

#### FR-NAV-11 — Top utility strip: current date + trust links + optional language switcher
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** User views the header. · **Preconditions:** None.
**Behavior:** 1. Compute `dateLabel = fmtFullDate(new Date(), lang)` in a client effect (suppressHydrationWarning), pinned to Asia/Singapore. 2. Render trust links Editorial Standards (`/trust/editorial`) and AI Disclosure (`/trust/ai`). 3. If `SHOW_LANG_SWITCHER` (currently false): render EN/VI/ID select. 4. If `SHOW_WIRE_DROPS_TICKER` (currently false): render a live-dot "N wire drops in the last hour".
**Business Rules:** BR-NAV-13, BR-NAV-14
**Acceptance Criteria:**
- The current Singapore-time date shows in the top strip.
- Editorial Standards and AI Disclosure links are present.
- With `SHOW_LANG_SWITCHER=false`, no language selector renders.
**Source:** MENU/HEADER row 6 top strip; FOOTER row 4. · **Implementation:** `header.tsx:137-208,21-36`; `i18n.tsx:139-147`.

#### FR-NAV-12 — i18n provider with inline t(en,vi,id) chrome translation (English-only flag)
**Priority:** Should · **Phase:** Phase 1 · **Actor:** System (RSC/ISR)
**Trigger:** App bootstrap / user changes language (when enabled). · **Preconditions:** I18nProvider mounted at top of ReaderLayout.
**Behavior:** 1. Default lang `en`; hydrate from localStorage `dtw-lang` if valid. 2. On change, persist and set `documentElement lang`. 3. `useT()` returns `t(en, vi?, id?)` resolving by lang with English fallback. 4. `localizedPillarLabel`/`localizedNavLabel` resolve via `PILLAR_I18N`/`NAV_I18N`. 5. Dates/numbers per locale (Asia/Singapore). 6. Article body never translated.
**Business Rules:** BR-NAV-14, BR-NAV-15
**Acceptance Criteria:**
- Chrome strings use `t()` and default to English.
- A stored `dtw-lang` is applied to `<html lang>` on mount.
- Article body content is NOT translated.
**Source:** FOOTER row 4; invariants #9, #10. · **Implementation:** `i18n.tsx:33-112,118-147`.

#### FR-NAV-13 — Footer information columns (About / Editorial / Business / Legal)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** User views the footer. · **Preconditions:** None.
**Behavior:** 1. Render Wordmark + tagline + localized independent-newsroom blurb. 2. Render four columns of localized `[label, href]` tuples — DTW (About, Newsroom, Contact, Press), Editorial (Standards, AI Disclosure, Corrections, Sponsored & Affiliate Policy), Business (Advertise, Studio, Awards), Legal (Privacy, Terms, Cookies, GDPR/PDPA). 3. Business column omits Newsletters (commented out 2026-07-17). 4. Trust/editorial links → `/trust/*`.
**Business Rules:** BR-NAV-16
**Acceptance Criteria:**
- The four info columns and their links render.
- The Editorial column shows Standards, AI Disclosure, Corrections, Sponsored & Affiliate Policy.
- Newsletters is not shown in Business (pipeline unshipped).
**Source:** FOOTER row 1. · **Implementation:** `footer.tsx:19-57,123-212`.

#### FR-NAV-14 — Footer social / contact icons with hidden-when-no-URL rule
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** User views the footer brand column. · **Preconditions:** None.
**Behavior:** 1. Define socials list with an optional href. 2. Filter to entries with a truthy href before rendering. 3. Render each surviving entry as an icon anchor. 4. Email (`mailto:info@dailytechwire.com`) and RSS (`/rss.xml`) currently render; X/LinkedIn/Instagram hidden (no href).
**Business Rules:** BR-NAV-17
**Acceptance Criteria:**
- A social entry without an href is not shown.
- Email and RSS icons link to their configured targets.
**Source:** FOOTER row 2. · **Implementation:** `footer.tsx:60-66,150-171`.

#### FR-NAV-15 — Footer trust band and copyright
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** User views the footer. · **Preconditions:** None.
**Behavior:** 1. Render "© 2026 Dailytechwire · Singapore · Member, Trust Project". 2. Render a compliance note "Compliant with GDPR · PDPA (SG)".
**Business Rules:** BR-NAV-18
**Acceptance Criteria:**
- The copyright/attribution line renders.
- The GDPR · PDPA (SG) compliance note renders.
**Source:** FOOTER row 5. · **Implementation:** `footer.tsx:214-234`.

#### FR-NAV-16 — Provider composition and chrome mount in reader layout
**Priority:** Must · **Phase:** Phase 1 · **Actor:** System (RSC/ISR)
**Trigger:** Any reader (non-admin) route render. · **Preconditions:** Payload available for `getNavPillars`/`getPaywallThreshold`.
**Behavior:** 1. `await Promise.all([getNavPillars(), getPaywallThreshold()])`. 2. Wrap tree in `<I18nProvider><ThemeProvider><ShellProvider paywallThreshold=…>`. 3. Render `<Header pillars=…>`, `<main>{children}</main>`, `<Footer/>`, `<AuthModal/>`, `<SearchOverlay/>`. 4. Root layout owns `<html>/<body>`, fonts, and global metadata only.
**Business Rules:** BR-NAV-01
**Acceptance Criteria:**
- Reader routes render header/footer/modals wrapped by providers.
- `/admin` routes do not instantiate reader chrome/providers.
- Nav pillars and paywall threshold are fetched in parallel in the RSC.
**Source:** MENU/HEADER + FOOTER composition. · **Implementation:** `(reader)/layout.tsx:18-41`; `app/layout.tsx:65-79`.

#### FR-NAV-17 — PWA web manifest for installability
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest / install agent
**Trigger:** Device evaluates Add-to-Home-Screen. · **Preconditions:** None.
**Behavior:** 1. Return a `MetadataRoute.Manifest` with name/short_name "DailyTechWire", start_url "/". 2. `display 'standalone'`, `background_color #FDFCF8`, `theme_color #1B2A52`. 3. Provide 192, 512 (any), and 512 maskable icons.
**Acceptance Criteria:**
- The manifest exposes name, start_url, display, and icons.
- Install uses the 192/512 icons and standalone display.
**Source:** Cross-cutting PWA. · **Implementation:** `app/manifest.ts:11-31`.

#### FR-NAV-18 — Header newsletter Subscribe CTA (feature-flagged, deferred)
**Priority:** Could · **Phase:** Phase 2 · **Actor:** Guest
**Trigger:** User clicks Subscribe (when enabled). · **Preconditions:** `SHOW_NEWSLETTER=true` (currently false).
**Behavior:** 1. When enabled: render an accent "Subscribe" link → `/newsletters` in the header main bar. 2. Mirror in the mobile drawer footer and the footer newsletter strip. 3. Currently hidden; double opt-in via Resend belongs to the newsletters module.
**Business Rules:** BR-NAV-19
**Acceptance Criteria:**
- With `SHOW_NEWSLETTER=false`, no Subscribe CTA renders.
- With `SHOW_NEWSLETTER=true`, a Subscribe link to `/newsletters` appears.
**Source:** MENU/HEADER row 4; FOOTER row 3. · **Implementation:** `header.tsx:27-30,286-305`; `footer.tsx:11-14,76-121`.

### 3.2 Homepage (HOME)

The reader entry surface at `/` (and locale variants), an ISR RSC (`revalidate = 60`) that batch-fetches all band data server-side and composes up to 12 editorial bands. Seven bands are hidden behind compile-time `SHOW_*` flags (all `false` since 2026-07-17). Currently rendering: Hero, Pillar Showcase, Most Read, Awards Banner. Sponsored content is counted but never editorially ranked.

#### FR-HOME-01 — Compose and server-render the homepage with ISR
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader requests `/` (or `/en /id /vi`). · **Preconditions:** Payload reachable; pillars/articles seeded.
**Behavior:** 1. Fetch CMS nav pillars first. 2. In one `Promise.all`, fetch `getRecentArticles(40)`, `getPinnedLatest()`, `getDeepDive()`, `getWireDrops(12)`, `getMostReadArticles(4)`, and per non-`latest` pillar `getArticlesByPillar(slug,4)`. 3. Map Payload docs to `ArticleView` via `toArticleView`. 4. Compose bands top→bottom, each wrapped in `<Reveal>` except hero. 5. Serve statically; revalidate every 60s and on afterChange cache-tag busts. 6. Omit a page `title` so the tab inherits the root brand default.
**Business Rules:** BR-HOME-01, BR-HOME-08
**Acceptance Criteria:**
- All band data is fetched server-side (no client waterfall); HTML is cacheable.
- 60s or an `articles:all` bust triggers a fresh re-render.
- The tab title is the root brand default (no doubled brand name).
**Source:** HOMEPAGE row 15. · **Implementation:** `(reader)/page.tsx:41,48,55,61`; `payload-server.ts:99`.

#### FR-HOME-02 — Hero band — lead story + "Also leading today" rail
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Homepage renders. · **Preconditions:** ≥1 published article exists.
**Behavior:** 1. `heroPool` = recent articles filtered to non-sponsored. 2. `lead = pinnedToLatest ?? heroPool[0] ?? articles[0]`. 3. `aside` = heroPool excluding lead, sliced to 4. 4. Render lead cover with `heroImageUrl` (LQIP) or CoverArt fallback at height 410, plus PillarTag, section, TimeAgo, title, dek, BylineWired. 5. Render each aside item linking to `/article/[slug]` with 86px cover.
**Business Rules:** BR-HOME-02, BR-HOME-03
**Acceptance Criteria:**
- A pinned published article becomes the lead; otherwise the newest non-sponsored article.
- The aside rail shows up to 4 non-sponsored stories, none the lead.
- A lead with `heroImageUrl` is sized to avoid CLS (<0.05) and uses LQIP.
**Source:** HOMEPAGE row 2. · **Implementation:** `home/home-hero.tsx`; `(reader)/page.tsx:82`; `payload-server.ts:509`.

#### FR-HOME-03 — Pillar Showcase — newest 4 per CMS pillar
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Homepage renders. · **Preconditions:** Pillars exist in CMS.
**Behavior:** 1. For each non-`latest` pillar, fetch `getArticlesByPillar(slug, 4)` directly so low-volume pillars are not starved. 2. Build `byPillar`; set `byPillar.latest` = pinned-first newest slice of shared articles. 3. Render pillars in CMS order; skip any pillar with an empty item list. 4. First item gets a 120px cover; remaining render as text rows with 48px thumb. 5. Header uses pillar color, icon, localized title, and "See all →" link to `/[pillar]`.
**Business Rules:** BR-HOME-04
**Acceptance Criteria:**
- Columns appear in CMS `order`, each with ≤4 newest published articles.
- A pillar with zero published articles is omitted.
- A new CMS pillar appears as a new column after revalidation, no deploy.
**Source:** HOMEPAGE row 5. · **Implementation:** `home/pillar-showcase.tsx`; `(reader)/page.tsx:73`; `payload-server.ts:245,74`.

#### FR-HOME-04 — Most Read band — view-ranked with newest top-up
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Homepage renders. · **Preconditions:** `article_views` may be empty (fresh deploy) — band must still fill.
**Behavior:** 1. `getMostReadArticles(4)` aggregates `sum(views)` per articleId over trailing 14 days, orders desc, over-fetches `limit*4`, hydrates published-only via `getArticlesByIds`, filters out sponsored, re-imposes rank, slices to 4. 2. On DB/table error, fail open to empty list. 3. `page.tsx` builds `mostReadItems = ranked ++ (heroPool minus lead/aside/ranked ids)`, sliced to 4. 4. Render four cards; order alone conveys ranking (no numerals — removed 2026-07-27); "See all →" → `/latest`.
**Business Rules:** BR-HOME-05, BR-HOME-06
**Acceptance Criteria:**
- ≥4 ranked non-sponsored stories in the window render in descending view order, no rank numerals.
- An empty `article_views` table fills with newest non-sponsored stories.
- A high-view sponsored story is excluded from the ranked list.
- Top-up never re-adds hero/aside stories.
**Source:** HOMEPAGE row 6 (Asia Tech Spotlight → Most Read). · **Implementation:** `home/most-read.tsx`; `most-read.ts:46`; `(reader)/page.tsx:102`; `view-actions.ts:37`.

#### FR-HOME-05 — Awards banner — inaugural "coming soon" state
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Homepage renders. · **Preconditions:** None (hardcoded copy).
**Behavior:** 1. Render kicker "Awards · Coming soon", localized title, description, and a single accent Button to `/awards`. 2. Do not render any winners list or nomination form (invariant #13).
**Business Rules:** BR-HOME-07
**Acceptance Criteria:**
- Exactly one CTA ("Learn more →" to `/awards`); no "previous winners" link.
- All banner strings are localized for en/id/vi.
**Source:** HOMEPAGE row 9. · **Implementation:** `home/awards-banner.tsx`; `(reader)/page.tsx:154`.

#### FR-HOME-06 — The Brief band — AM/PM newsletter preview (currently hidden)
**Priority:** Could · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Homepage renders with `SHOW_BRIEF=true`. · **Preconditions:** `SHOW_BRIEF` enabled.
**Behavior:** 1. Render label column ("The Brief", 07:00/18:00), two brief preview columns (tag, 2-line title, 2-line excerpt), and a "Read →" CTA to `/briefing`. 2. Render partial-height dividers (22%–78%).
**Business Rules:** BR-HOME-09
**Acceptance Criteria:**
- With `SHOW_BRIEF=true`, the Brief band appears between hero and pillar showcase with a working `/briefing` CTA.
- With `SHOW_BRIEF=false` (current), the band is absent.
**Source:** HOMEPAGE row 3. · **Implementation:** `home/brief-band.tsx`; `(reader)/page.tsx:30,132`.

#### FR-HOME-07 — Wire Drops band — newsroom dispatches (currently hidden)
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Homepage renders with `SHOW_WIRE_DROPS=true` and ≥1 drop. · **Preconditions:** Flag enabled; `wireDrops` collection has entries.
**Behavior:** 1. Server fetches `getWireDrops(12)` sorted `-publishedAt` (tag `wire-drops`, revalidate 30). 2. Map each to `{id,time,city,text}`; render rows with time / CityChip / serif text. 3. Empty list → render nothing. 4. Realtime WebSocket push is NOT implemented in Phase 1 (drops refresh via ISR only).
**Business Rules:** BR-HOME-10, BR-HOME-11
**Acceptance Criteria:**
- With drops present, each shows time, city chip, and ≤200-char text.
- No drops → renders null.
- A new drop posted in `/admin` appears within ~30s via ISR (not via live WebSocket in Phase 1).
**Source:** HOMEPAGE row 4. · **Implementation:** `home/wire-drops.tsx`; `payload-server.ts:540`; `(reader)/page.tsx:122`; `payload-types.ts:427`.

#### FR-HOME-08 — Live Dashboards teaser (currently hidden)
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Homepage renders with `SHOW_DASHBOARDS=true`. · **Preconditions:** Flag enabled.
**Behavior:** 1. Render funding card with AnimatedSpark, CountUp stats, ArrowUpDown delta, and a "not investment advice" disclaimer. 2. Render AI leaderboard card with top-4 rows from `AI_LEADERBOARD`. 3. Cards link to `/dashboards/funding` and `/dashboards/ai`; header CTA → `/dashboards`. Teaser data is hardcoded/mock.
**Business Rules:** BR-HOME-12
**Acceptance Criteria:**
- With the flag on, both teaser cards render with animated sparkline/count-up and correct links.
- The funding card shows a "not investment advice" disclaimer.
**Source:** HOMEPAGE row 7. · **Implementation:** `home/dashboards-teaser.tsx`; `(reader)/page.tsx:144`.

#### FR-HOME-09 — Deep Dive of the Week (currently hidden)
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Homepage renders with `SHOW_DEEP_DIVE=true` and a `deepDive` article exists. · **Preconditions:** Flag enabled; an article `deepDive=true` & published.
**Behavior:** 1. Server fetches `getDeepDive()` (deepDive=true, published, newest). 2. If present, render a full-width feature card → `/article/[slug]`; else render nothing.
**Business Rules:** BR-HOME-13
**Acceptance Criteria:**
- A published `deepDive=true` article is featured when the flag is on.
- No `deepDive` article → renders null.
**Source:** HOMEPAGE row 8. · **Implementation:** `home/deep-dive.tsx`; `payload-server.ts:467`; `(reader)/page.tsx:149`.

#### FR-HOME-10 — Sponsored Content Strip — "DTW Studio Presents"
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Homepage renders and a sponsored article is assigned. · **Preconditions:** An article `sponsored=true` & published; strip mounted in `page.tsx` (**KNOWN GAP:** component exists but is NOT currently imported/rendered).
**Behavior:** 1. Server fetches `getSponsoredArticle()`. 2. Render on mustard `--sponsored` (#FEF3C7) with "Paid Partner Content · DTW Studio Presents" label, a "newsroom was not involved" firewall disclaimer, a "What is this?" affordance, sponsor BrandMark, title, read-time, and "Read →". 3. Never blend with editorial styling; label non-dismissible. 4. No sponsored article → render null.
**Business Rules:** BR-HOME-14
**Acceptance Criteria:**
- The strip uses #FEF3C7 background and a visible "Paid Partner" label.
- The sponsored article never appears inside Most Read editorial ranking.
- No sponsored article → renders null.
**Source:** HOMEPAGE row 10. · **Implementation:** `home/sponsored-strip.tsx`; `payload-server.ts:485`.

#### FR-HOME-11 — Best of Reviews — affiliate strip with disclosure (currently hidden)
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Homepage renders with `SHOW_BEST_OF_REVIEWS=true`. · **Preconditions:** Flag enabled.
**Behavior:** 1. Render section header with an affiliate-disclosure tooltip ("About affiliate links"). 2. Render product cards with icon + "Affiliate link" marker and disclosure copy. 3. Cards with a slug link internally; the `/r/[token]` redirect tracker is a later integration.
**Business Rules:** BR-HOME-15
**Acceptance Criteria:**
- With the flag on, each review card shows a visible affiliate disclosure (icon + tooltip).
- Hovering the header shows an "About affiliate links" explanation.
**Source:** HOMEPAGE row 11. · **Implementation:** `home/best-of-reviews.tsx`; `(reader)/page.tsx:157`.

#### FR-HOME-12 — Podcast / Voice strip (currently hidden)
**Priority:** Could · **Phase:** Phase 2 · **Actor:** Guest
**Trigger:** Homepage renders with `SHOW_LISTEN=true`. · **Preconditions:** Flag enabled.
**Behavior:** 1. Render "Listen" header and cards from `PODCASTS` (title/host/length/date). 2. Audio playback, R2 audio file, and podcast RSS are deferred (Phase 2).
**Acceptance Criteria:**
- With the flag on, podcast cards render with title, host, length, and date.
- No functional audio player required in Phase 1.
**Source:** HOMEPAGE row 12. · **Implementation:** `home/podcast-strip.tsx`; `(reader)/page.tsx:162`.

#### FR-HOME-13 — Newsletter CTA — flagship AM Brief capture (currently hidden)
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest / Reader
**Trigger:** Homepage renders with `SHOW_NEWSLETTER_CTA=true`. · **Preconditions:** Flag enabled; shell provides user context.
**Behavior:** 1. Signed-in: load `isSubscribed('am')`; render toggle firing `setNewsletter('am', next)` in a transition. 2. Guest: render email form; on submit call `subscribeGuest(email, ['am'])`; on ok show confirmation. 3. Render "Choose more" → `/newsletters`.
**Business Rules:** BR-HOME-16
**Acceptance Criteria:**
- A signed-in reader's AM Brief subscription flips and persists via `setNewsletter`.
- A guest with a valid email calls `subscribeGuest` and sees a confirmation.
- "Choose more" navigates to `/newsletters`.
**Source:** HOMEPAGE row 13. · **Implementation:** `home/newsletter-cta.tsx`; `(reader)/page.tsx:167`; `account-actions.ts`.

#### FR-HOME-14 — Temp-hidden band feature flags
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Dev/Ops
**Trigger:** A developer flips a `SHOW_*` flag. · **Preconditions:** Code edit + redeploy (compile-time constants).
**Behavior:** 1. Seven flags (`SHOW_BRIEF`, `SHOW_WIRE_DROPS`, `SHOW_DASHBOARDS`, `SHOW_DEEP_DIVE`, `SHOW_BEST_OF_REVIEWS`, `SHOW_LISTEN`, `SHOW_NEWSLETTER_CTA`) — all `false` since 2026-07-17 — gate each band via `{SHOW_X && <Band/>}`. 2. Imports and data fetches retained so restoring is a one-line flip.
**Business Rules:** BR-HOME-17
**Acceptance Criteria:**
- With all flags false, only Hero, Pillar Showcase, Most Read, and Awards render.
- Flipping one flag to true restores exactly that band.
**Source:** HOMEPAGE rows 3,4,7,8,11,12,13. · **Implementation:** `(reader)/page.tsx:27,30,129`.

#### FR-HOME-15 — Localized chrome across all homepage bands
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader visits a locale subpath. · **Preconditions:** i18n provider supplies lang.
**Behavior:** 1. Each band renders chrome via `useT`. 2. Pillar tags/headers render `localizedPillarLabel(pillar, lang)`. 3. Article titles/deks remain in source language (invariant #10).
**Business Rules:** BR-HOME-18
**Acceptance Criteria:**
- In `id`, chrome strings are localized (e.g. "Most Read" → "Paling Banyak Dibaca").
- Article card titles/deks stay in the source language.
**Source:** HOMEPAGE cross-cutting; invariants #9/#10. · **Implementation:** `i18n.tsx`; `home/most-read.tsx:79`; `home/pillar-showcase.tsx:73`.

#### FR-HOME-16 — Anonymous article-view counter (Most Read data source)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** System (ISR)
**Trigger:** A reader opens an article page (not the homepage). · **Preconditions:** `article_views` migrated (production).
**Behavior:** 1. Validate `articleId` matches `/^\d{1,19}$/` else no-op. 2. Upsert `(articleId, currentDayKeySGT)` with `views+1` on conflict. 3. Store no reader identity; fail open on error. 4. `getMostReadArticles` later reads `sum(views)` over a 14-day SGT window.
**Business Rules:** BR-HOME-06, BR-HOME-19
**Acceptance Criteria:**
- Any reader (guest or signed-in) opening an article increments the `(article, day)` counter by 1 with no PII.
- A malformed `articleId` no-ops.
- A failed write still renders the article (fail open).
**Source:** HOMEPAGE row 6 (Most Read ranking source). · **Implementation:** `view-actions.ts:37`; `most-read.ts:46`; `article-views.ts`.

### 3.3 Article & Pillar/Subsection Pages (ART, PIL)

The article detail page (serif Lexical body, non-dismissible sponsored disclosures top/middle/bottom, save/share, related row, JSON-LD, OG/canonical) and the CMS-driven pillar/subsection listing pages with crawlable pagination and per-pillar Atom feeds. Bare IDs from the code-grounded findings (`BR-01`..`BR-23`, `UC-01`..) are preserved.

#### FR-ART-01 — Render published article detail page by slug
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest / Reader
**Trigger:** `GET /article/{slug}`. · **Preconditions:** An article with the slug exists and `_status=published` (unless draft mode).
**Behavior:** 1. Await params; check `draftMode()`. 2. Draft mode → `getArticleBySlugDraft(slug)`; else `getArticleBySlug(slug)` (published-only, cached, revalidate=60). 3. No article → `notFound()` (404). 4. Map via `toArticleView(article)`. 5. Fetch up to 3 related articles through the same pillar. 6. Render `ArticleContent` with view, Lexical body, related list.
**Business Rules:** BR-01, BR-02, BR-13
**Acceptance Criteria:**
- A published slug renders title, dek, byline, and body.
- A slug with no published article returns 404.
- Without draft mode, only published content is served.
**Source:** ARTICLE PAGE rows 1, 3. · **Implementation:** `article/[slug]/page.tsx:111`; `payload-server.ts:371`; `article-view.ts:79`.

#### FR-ART-02 — Article header — pillar tag, breadcrumb, title, dek, byline
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest / Reader
**Trigger:** Article page render. · **Preconditions:** Article view model resolved.
**Behavior:** 1. Breadcrumb (DTW › pillar › section) colored by `article.pillarColor`. 2. `PillarTag` with `localizedPillarLabel` + section kicker. 3. `article.deepDive` → DEEP DIVE badge; `article.sponsored` → PAID PARTNER · {sponsor} badge. 4. Fluid serif h1 (clamp 28–54px, textWrap balance) + dek. 5. Byline: Avatar, author name, `authorRole · authorCity`, `fmtDateL(published, lang)`, `readMin` min read.
**Business Rules:** BR-08, BR-10
**Acceptance Criteria:**
- Byline shows author, role·city, localized date, read minutes.
- In `vi`, chrome labels are Vietnamese while the body stays source-language.
- `deepDive=true` shows a DEEP DIVE badge.
**Source:** ARTICLE PAGE row 1. · **Implementation:** `article/article-content.tsx:74,99`.

#### FR-ART-03 — Hero image (LQIP) or generated cover art with credit/caption
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest / Reader
**Trigger:** Article page render. · **Preconditions:** Article view has `heroImageUrl` or falls back to cover art.
**Behavior:** 1. `heroImageUrl` present → `<img>` with `alt = heroImageAlt ?? title` at fixed clamp height (220–520px, objectFit cover). 2. Else `<CoverArt pillar seed=id variant=0 height=520 label=HERO>`. 3. `heroImageAlt`/`heroImageCredit` present → localized caption/credit line.
**Acceptance Criteria:**
- A hero image displays at a reserved height (no layout jump).
- No hero image → a deterministic CoverArt placeholder renders.
- `heroImageCredit` set → localized credit line renders.
**Source:** ARTICLE PAGE row 2; HỆ THỐNG row 2. · **Implementation:** `article/article-content.tsx:180`; `article/[slug]/page.tsx:53`.

#### FR-ART-04 — Serif article body with mid-body split for disclosure injection
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest / Reader
**Trigger:** Article page render. · **Preconditions:** Lexical body passed to `ArticleBody`.
**Behavior:** 1. Compute `hasBody` from `body.root.children`. 2. Empty → render top SponsoredBox, an italic "no body content yet" note, bottom SponsoredBox. 3. Else split root children at `ceil(length/2)` into two valid editor states. 4. Render top SponsoredBox, RichText(first half), middle SponsoredBox, RichText(second half), bottom SponsoredBox. Prose: Source Serif 17px, line-height 1.65, max-width 680px.
**Business Rules:** BR-03, BR-04
**Acceptance Criteria:**
- A non-empty body is split; a middle disclosure sits between halves (for sponsored articles).
- An empty body shows a placeholder; top/bottom disclosure logic still runs.
- Prose is serif 17px, line-height 1.65, max-width 680px.
**Source:** ARTICLE PAGE rows 3, 4. · **Implementation:** `article/article-body.tsx:65,17`.

#### FR-ART-05 — Non-dismissible sponsored disclosure boxes (top/middle/bottom)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest / Reader
**Trigger:** Article body render. · **Preconditions:** `article.sponsored=true`.
**Behavior:** 1. `SponsoredBox` returns null when `article.sponsored` false. 2. When sponsored, render `DisclosureBox kind=sponsored` with localized title "Paid Partner · {sponsor}" and localized firewall body. 3. Position drives "· reminder (middle)"/"· reminder (bottom)" subtitle. 4. The `@dtw/ui DisclosureBox` has no close control by design.
**Business Rules:** BR-03
**Acceptance Criteria:**
- A sponsored article shows three disclosure boxes (top/middle/bottom) with no dismiss button.
- A non-sponsored article shows no sponsored box.
- In `id`, the disclosure title/body are Indonesian.
**Source:** ARTICLE PAGE row 4. · **Implementation:** `article/article-body.tsx:40`; `packages/ui/src/disclosure-box.tsx`.

#### FR-ART-06 — AI-assisted inline disclosure suppressed (field retained, not surfaced)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Article render for an `aiAssisted` article. · **Preconditions:** `article.aiAssisted=true`.
**Behavior:** 1. `toArticleView` maps `aiAssisted` onto the view model (boolean retained). 2. `ArticleBody` renders only `SponsoredBox` instances; no `kind='ai'` DisclosureBox is created. 3. No AI-ASSISTED header badge. (Removed by product decision 2026-06-05, invariant #5.) **KNOWN GAP:** `/trust/ai` copy still describes AI disclosure — reconcile when policy finalized.
**Business Rules:** BR-05
**Acceptance Criteria:**
- An `aiAssisted` article shows no inline AI disclosure box or badge.
- The view model still carries `aiAssisted` as a boolean.
**Source:** ARTICLE PAGE row 4. · **Implementation:** `article/article-body.tsx:11`; `article-view.ts:119`.

#### FR-ART-07 — Affiliate disclosure block
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Article render for an affiliate article. · **Preconditions:** `article.affiliate=true`.
**Behavior:** 1. Render an affiliate disclosure block with a `$` mono badge and localized text: some links earn DTW a commission; manufacturers do not approve reviews; DTW does not accept review units for coverage.
**Business Rules:** BR-06
**Acceptance Criteria:**
- An affiliate article shows the commission-statement block.
- A non-affiliate article shows no affiliate block.
**Source:** HỆ THỐNG row 12. · **Implementation:** `article/article-content.tsx:239`.

#### FR-ART-08 — Save / Share bar
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest / Reader
**Trigger:** Reader clicks Save/Share/Copy/Email. · **Preconditions:** Paywall card not shown for this render.
**Behavior:** 1. Signed-in mount → resolve saved state via `isBookmarked(article.id)`. 2. Save: no user → `openAuth()`; else optimistically flip saved and call `toggleBookmark(article.id)`. 3. Share: `navigator.share` when available, else copy URL. 4. Copy link: write URL, show "Copied!" 2s. 5. Email: `mailto` with title + URL.
**Business Rules:** BR-11, BR-13
**Acceptance Criteria:**
- A guest clicking Save opens the auth modal and bookmarks nothing.
- A signed-in reader clicking Save flips to Saved and calls `toggleBookmark`.
- Share uses the native sheet when supported, else copies the URL.
**Source:** ARTICLE PAGE row 7. · **Implementation:** `article/share-bar.tsx:46`; `article/article-content.tsx:63,231`.

#### FR-ART-09 — Related articles ("Read next") chained backward through the pillar
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest / crawler
**Trigger:** Article page render. · **Preconditions:** Article resolved with a pillar.
**Behavior:** 1. `getRelatedArticles(pillarSlug, publishedAt ?? DRAFT_CURSOR, article.id, 3)`. 2. Query older published same-pillar articles by `-publishedAt,-id`; wrap to newest (excluding current) if short. 3. Map to view models; render `RelatedRow` (≤3). 4. None → render nothing.
**Business Rules:** BR-13
**Acceptance Criteria:**
- Up to 3 older same-pillar articles show as Read next.
- The current article is never included.
- Fewer than 3 older stories → newest stories wrap in to fill up to 3.
**Source:** ARTICLE PAGE row 6. · **Implementation:** `article/[slug]/page.tsx:134`; `payload-server.ts:297`; `article/related-row.tsx:21`.

#### FR-ART-10 — Article metadata: OG, canonical, JSON-LD NewsArticle
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Crawler / social scraper
**Trigger:** Metadata generation / page render. · **Preconditions:** Article resolved.
**Behavior:** 1. Resolve hero via three-tier fallback (hero derivative → original upload → branded default). 2. `buildMetadata` with canonical `/article/{slug}`, image, article type, published/modified times, authors, section. 3. Draft → `robots {index:false, follow:false}`, no JSON-LD. 4. Not draft → inject JSON-LD `NewsArticle` via `buildArticleJsonLd`/`toJsonLdScript`.
**Business Rules:** BR-02, BR-07
**Acceptance Criteria:**
- A published article: canonical `/article/{slug}`, `og:type=article` with a resolved image.
- A published article renders a JSON-LD NewsArticle script.
- Draft mode: robots noindex/nofollow, no JSON-LD.
**Source:** ARTICLE PAGE rows 1, 7; HỆ THỐNG row 5. · **Implementation:** `article/[slug]/page.tsx:77,143`.

#### FR-ART-11 — Corrections notice on every article
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Article page render. · **Preconditions:** None.
**Behavior:** 1. Always render a localized "Spot something wrong?" box after the related row, pointing to `corrections@dailytechwire.com` and stating every correction is logged publicly.
**Acceptance Criteria:**
- Every article shows the corrections notice with `corrections@dailytechwire.com`.
**Source:** TRUST PAGES row 3; ARTICLE PAGE editorial trust. · **Implementation:** `article/article-content.tsx:283`.

#### FR-ART-12 — Draft/preview article rendering via draftMode
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Editor (preview)
**Trigger:** `GET /article/{slug}` with the draft cookie enabled. · **Preconditions:** draftMode enabled via authenticated preview route.
**Behavior:** 1. Check `draftMode().isEnabled`. 2. Enabled → `getArticleBySlugDraft(slug)`. 3. Use `article.publishedAt ?? DRAFT_CURSOR` (9999-12-31…) as the related cursor. 4. No JSON-LD; robots noindex.
**Business Rules:** BR-07
**Acceptance Criteria:**
- Draft mode renders the unpublished draft.
- A draft with no `publishedAt` resolves the pillar's newest neighbors via the sentinel cursor without error.
**Source:** LUỒNG CHÍNH row 1. · **Implementation:** `article/[slug]/page.tsx:119,22`.

#### FR-ART-13 — TTS audio player bar (built, not wired) — Phase 2
**Priority:** Could · **Phase:** Phase 2 · **Actor:** Guest
**Trigger:** N/A (not wired in Phase 1). · **Preconditions:** Phase 2 TTS pipeline.
**Behavior:** 1. `AudioPlayerBar` renders a Listen button, progress bar, duration/AI-voice label, MP3 link. 2. No article page mounts it today. 3. Phase 2: generate voice (ElevenLabs/OpenAI), store file, wire real audio + download.
**Acceptance Criteria:**
- In Phase 1, no audio bar shows (component unused).
- In Phase 2, the Listen control plays and MP3 is downloadable.
**Source:** ARTICLE PAGE row 5 (Audio TTS — GĐ sau). · **Implementation:** `article/audio-player.tsx:7`.

#### FR-PIL-01 — CMS-driven pillar listing page (page 1)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest / crawler
**Trigger:** `GET /{pillar}`. · **Preconditions:** A Payload pillar with matching slug exists (or slug=`latest`).
**Behavior:** 1. Fetch `getPillars()`, `getArticlesPage(slug, 1, 25)`, and (latest+page1 only) `getPinnedLatest()`. 2. No matching pillar doc → `notFound()`. 3. Prepend the pinned story as the lead (latest page 1 only). 4. Render `PillarContent` with theming, initial articles, totalDocs, currentPage=1, hasNextPage.
**Business Rules:** BR-08, BR-09
**Acceptance Criteria:**
- A pillar created in `/admin` renders at `/{slug}` with no redeploy.
- An unknown slug returns 404.
- `latest` page 1 with a pinned story shows it as the featured lead.
**Source:** PILLAR PAGE rows 1, 2. · **Implementation:** `[pillar]/page.tsx:24`; `[pillar]/pillar-view.tsx:50`.

#### FR-PIL-02 — Pillar featured lead + article grid
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Pillar page render. · **Preconditions:** Pillar articles resolved.
**Behavior:** 1. Header (icon, DTW·label kicker, heading, description, Follow button, RSS link, total-stories badge) in CMS pillar color. 2. Featured lead card from `initialArticles[0]` (CoverArt, kicker, title, dek, BylineWired). 3. Responsive grid of remaining articles (auto-fill) each → `/article/{slug}`. 4. Empty state when no articles.
**Business Rules:** BR-08
**Acceptance Criteria:**
- The newest is the featured lead; the rest form the grid.
- An empty pillar shows a localized "Nothing in this pillar yet" message.
- The header border/icon/kicker use the CMS pillar color.
**Source:** PILLAR PAGE rows 1, 2. · **Implementation:** `pillar/pillar-content.tsx:38,173`.

#### FR-PIL-03 — Progressive-enhancement "Load more" with crawlable pagination
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest / crawler
**Trigger:** Reader clicks "Load more" / crawler follows the link. · **Preconditions:** `hasMore` true and a cursor article exists.
**Behavior:** 1. Render the control as `<a href='/{pillar}/page/{n}' rel=next>`. 2. Plain left click → `preventDefault`, call `loadArticlesAfter(pillarId, cursor.published, cursor.id)` for a 24-item batch. 3. Append de-duplicated results; update `hasMore` and count. 4. `history.replaceState` the URL to `/{pillar}/page/{landedOn}`. 5. Modified/middle click or JS-off → normal navigation.
**Business Rules:** BR-12
**Acceptance Criteria:**
- With JS, Load more appends 24 more cards without full navigation; the URL updates via replaceState.
- With JS disabled or a crawler, `/{pillar}/page/{n}` loads as a full server render.
- A cmd/ctrl/middle click opens the link normally (no append).
**Source:** PILLAR PAGE row 2. · **Implementation:** `pillar/pillar-content.tsx:88`; `[pillar]/load-more-action.ts:26`.

#### FR-PIL-04 — Numbered pillar pagination route /{pillar}/page/{n}
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest / crawler
**Trigger:** `GET /{pillar}/page/{n}`. · **Preconditions:** Valid pillar; `n` parseable.
**Behavior:** 1. `parsePage` rejects anything not `/^[1-9][0-9]*$/` (404). 2. `page==1` → redirect to `/{slug}`. 3. Render `PillarView(slug, page)`. 4. `page>1` and empty feed page → `notFound()`.
**Business Rules:** BR-12
**Acceptance Criteria:**
- `/{pillar}/page/02` or `/page/-1` returns 404.
- `/{pillar}/page/1` redirects to `/{pillar}`.
- A page past the feed end returns 404.
**Source:** PILLAR PAGE rows 2, 5. · **Implementation:** `[pillar]/page/[n]/page.tsx`; `[pillar]/pillar-view.tsx:71`.

#### FR-PIL-05 — Per-pillar Atom RSS feed
**Priority:** Must · **Phase:** Phase 1 · **Actor:** RSS aggregator / crawler
**Trigger:** `GET /{pillar}/rss.xml`. · **Preconditions:** Pillar slug exists.
**Behavior:** 1. Look up pillar doc by slug; 404 if unknown. 2. `getFeedArticles(slug==='latest' ? null : pillarDoc.id)`. 3. `buildAtomFeed` with title "DailyTechWire — {heading}", subtitle from description, site/feed paths. 4. Return `atomResponse(xml)`; cached revalidate=300.
**Business Rules:** BR-08
**Acceptance Criteria:**
- A valid pillar slug returns a valid Atom feed with recent articles.
- An unknown slug returns 404 (not an empty feed).
- `latest` returns a cross-beat feed.
**Source:** PILLAR PAGE row 4. · **Implementation:** `[pillar]/rss.xml/route.ts`.

#### FR-PIL-06 — Pillar metadata: title, description, canonical, feed alt-link
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Crawler
**Trigger:** Metadata generation for a pillar page. · **Preconditions:** Pillar doc exists.
**Behavior:** 1. Find pillar doc; `notFound` if missing. 2. `heading = pillarDoc.heading || title.en`; `description = pillarDoc.description ?? site default`. 3. Page 1: `title=heading`; page n: `"{heading} — Page {n}"`. 4. `canonicalPath = pillarPath(slug, page)`; declare feed alternate to `/{slug}/rss.xml`.
**Business Rules:** BR-08
**Acceptance Criteria:**
- Page 1: canonical `/{slug}` and a feed link to `/{slug}/rss.xml`.
- Page n>1: title carries "Page {n}" and canonical is `/{slug}/page/{n}` (self-canonical, indexable).
**Source:** PILLAR PAGE row 4; HỆ THỐNG row 5. · **Implementation:** `[pillar]/pillar-view.tsx:21`.

#### FR-PIL-07 — Dynamic pillar routes without redeploy (ISR)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Editor / Content Engine
**Trigger:** New pillar created/edited in `/admin`. · **Preconditions:** Payload pillars collection with afterChange revalidation.
**Behavior:** 1. `generateStaticParams` returns `[]` (dynamicParams on). 2. First request to a new `/{pillar}` builds and caches for the revalidate window (60s pages, 300s feeds). 3. Pillars afterChange hook revalidates the tag on write.
**Business Rules:** BR-08
**Acceptance Criteria:**
- A new pillar in `/admin` renders on first request with no code deploy.
- A pillar edit reflects in route/feed within the revalidate window (~5 min).
**Source:** PILLAR PAGE row 5; HỆ THỐNG row 10. · **Implementation:** `[pillar]/page.tsx:11`; `[pillar]/rss.xml/route.ts`.

**KNOWN GAP (subsections).** Spec PILLAR PAGE row 3 calls for a `/[pillar]/[subsection]` and `/[pillar]/[subsection]/[slug]` taxonomy route with a sub-section tab strip. Implemented reader routes are flat (`/[pillar]`, `/[pillar]/page/[n]`, `/article/[slug]`). `Article.section` is displayed but not navigable, and article canonical URLs are `/article/{slug}` rather than the taxonomy path invariant #8 implies. Hero VIDEO (HLS/Mux) from ARTICLE PAGE row 2 is likewise not implemented. See §7.

### 3.4 Paywall & Metering (PAY)

The soft, non-blocking sign-in meter. A CMS-configurable threshold (default 3, never hardcoded) counts distinct articles read per Asia/Singapore calendar month — cookie for guests, `reading_history` DB for signed-in readers. Once tripped for a guest, a header nudge and an end-of-article sign-in card appear; the article body is always served in full. Sponsored articles never count and never gate.

#### FR-PAY-01 — CMS-configurable soft paywall threshold (default 3, never hardcoded)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Editor/Admin / all readers
**Trigger:** Editor sets threshold; reader app reads it at render. · **Preconditions:** `paywallSettings` global exists (falls back to 3 if not migrated).
**Behavior:** 1. `PaywallSettings` global exposes `paywallThreshold` (min 1, default 3), Editor/Admin update access. 2. afterChange hook (`revalidatePaywallSettings`) busts the `settings:paywall` tag. 3. `getPaywallThreshold` returns the value or 3 on error; ShellProvider receives it. 4. Nudge/paywall gating compares `articlesRead >= paywallThreshold`.
**Business Rules:** BR-14, BR-15
**Acceptance Criteria:**
- An Editor changing the threshold to 5 trips the nudge at 5 reads within the revalidate window.
- A missing/unmigrated global falls back to 3 without error.
- A non-editor Reader is denied updating the setting.
**Source:** ARTICLE PAGE row 8; LUỒNG CHÍNH row 2. · **Implementation:** `payload/globals/PaywallSettings.ts`; `payload-server.ts:576`.

#### FR-PAY-02 — Guest read metering by cookie, per Asia/Singapore calendar month
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Guest opens an article. · **Preconditions:** No signed-in session.
**Behavior:** 1. On mount, if not sponsored, `incrementRead(id)` → `recordGuestRead(id)`. 2. `recordGuestRead` parses the cookie `dtw-read-count`, adds the id if new (capped 20), rewrites cookie, returns distinct count. 3. Period key = `currentPeriodKeySGT()` (UTC+8, resets on the 1st). 4. Stale period or malformed cookie resets to empty state. Sponsored articles excluded.
**Business Rules:** BR-15, BR-16, BR-17
**Acceptance Criteria:**
- A guest reading 3 distinct non-sponsored articles holds 3 distinct ids for the current SGT month.
- Re-reading the same article does not increase the count.
- SGT month rollover resets the meter.
**Source:** LUỒNG CHÍNH row 2; ARTICLE PAGE row 8. · **Implementation:** `paywall.ts:89`; `shell.tsx:112`; `article/article-content.tsx:32`.

#### FR-PAY-03 — Signed-in read metering from reading_history (DB)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Reader
**Trigger:** Session established / signed-in reader opens an article. · **Preconditions:** Authenticated session.
**Behavior:** 1. On identity change, `clearGuestMeter()` and seed `articlesRead` via `getMyReadCount()`. 2. `getMyReadCount` fails closed to 0 (soft signal, never a hard gate). 3. `incrementRead` bumps the in-memory counter for a new read this session (deduped via `sessionReadIds`). 4. `recordView(article.id)` persists to `reading_history` client-side after hydration. Signed-in readers never gated in Phase 1.
**Business Rules:** BR-15, BR-18
**Acceptance Criteria:**
- A signed-in reader's `articlesRead` is seeded from `reading_history` for the current period.
- A read is persisted to `reading_history` and does not gate the reader.
- `getMyReadCount` failure falls open to 0.
**Source:** LUỒNG CHÍNH row 2; ARTICLE PAGE row 8. · **Implementation:** `paywall-actions.ts:12`; `shell.tsx:97`; `article/article-content.tsx:51`.

#### FR-PAY-04 — Header sign-in nudge banner on threshold trip (guest only)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Meter reaches threshold for a guest. · **Preconditions:** Guest, threshold reached, nudge not dismissed.
**Behavior:** 1. `showNudge = articlesRead >= paywallThreshold && !user && !nudgeDismissed`. 2. Render an in-flow banner (pushes content down, no overlay) with localized copy and a "Sign in — it's free →" CTA (openAuth). 3. Dismiss (subtle ×) sets `nudgeDismissed` and `localStorage dtw-nudge-dismissed='1'`. 4. Recompute `--header-h` via ResizeObserver so the page reflows.
**Business Rules:** BR-15, BR-19
**Acceptance Criteria:**
- A guest hitting the threshold sees the in-flow sign-in nudge in the header.
- Dismissal persists across return visits.
- A signed-in reader at/over threshold sees no nudge.
**Source:** ARTICLE PAGE row 8; LUỒNG CHÍNH row 2. · **Implementation:** `header.tsx:67,607`.

#### FR-PAY-05 — End-of-article soft paywall card (non-blocking)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Guest opens an article at/over threshold. · **Preconditions:** Guest, threshold reached, article not sponsored.
**Behavior:** 1. `hitPaywall = articlesRead >= paywallThreshold && !user && !article.sponsored`. 2. Always render the full `ArticleBody` first. 3. If `hitPaywall`, render the Paywall card in place of ShareBar ("Free limit reached" kicker, headline, "{threshold} free articles this month" copy, "Sign in — it's free →" opening auth, monthly-reset note); else render ShareBar. The body is never truncated/blocked mid-article.
**Business Rules:** BR-15, BR-20
**Acceptance Criteria:**
- A guest over threshold on a non-sponsored article still sees the full body plus a sign-in card after it.
- The article is never blocked or cut off mid-scroll.
- A sponsored article does NOT show the paywall card for an over-threshold guest.
**Source:** ARTICLE PAGE row 8 ("KHÔNG chặn giữa bài"); LUỒNG CHÍNH row 2. · **Implementation:** `article/article-content.tsx:30`; `article/paywall.tsx:18`; `article/article-content.tsx:231`.

#### FR-PAY-06 — Anonymous per-day article view counter for Most Read
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Any reader
**Trigger:** Article mount. · **Preconditions:** None.
**Behavior:** 1. On mount, if `claimViewCount(article.id)` returns true, call `recordArticleView(article.id)`. 2. `claimViewCount` dedupes per browser per SGT day (in-memory Set + localStorage `dtw-viewed`, cap 120, fails open). 3. `recordArticleView` validates the numeric id, upserts +1 into `article_views` keyed `(articleId, day)`, fails open/silently. Fires for guests and signed-in readers; counts sponsored views.
**Business Rules:** BR-21, BR-22
**Acceptance Criteria:**
- Opening an article records at most one +1 per browser per SGT day.
- Refreshing the same day records no additional count.
- With storage unavailable, in-memory dedupe still applies and the count fails open.
**Source:** HOMEPAGE row 6 / Most Read; HỆ THỐNG row 11. · **Implementation:** `article-views.ts:91`; `view-actions.ts:37`; `article/article-content.tsx:39`.

#### FR-PAY-07 — Most Read ranking (trailing 14-day window, sponsored excluded)
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Homepage consumer / reader
**Trigger:** Homepage Most Read band render. · **Preconditions:** `article_views` table populated.
**Behavior:** 1. Aggregate views by articleId where `day >= windowStart(14)`, order desc, `limit*4`. 2. Hydrate ids via `getArticlesByIds` (published-only). 3. Filter out sponsored, re-sort by original rank, slice to limit. 4. On query error (unmigrated table), return `[]`. Cached revalidate 300, tag `articles:all`.
**Business Rules:** BR-22, BR-23
**Acceptance Criteria:**
- Views over the last 14 days return most-read first, published-only.
- A high-view sponsored article is excluded from Most Read.
- An unmigrated `article_views` table returns an empty list (no build failure).
**Source:** HỆ THỐNG row 11; HOMEPAGE Most Read band. · **Implementation:** `most-read.ts:46`.

**Paywall scope note.** The spec's "Subscribe → /pro" billing CTA (ARTICLE PAGE row 8) is intentionally NOT implemented in Phase 1 — the card CTA is "Sign in — it's free" opening the auth modal; there is no `/pro` link or payment. Payment is Phase 2 (§8).

### 3.5 Dashboards (DASH)

DTW's data-desk at `/dashboards`, a catch-all route resolving to a "funding" (Asia Funding Tracker) or "ai" (AI Leaderboard) tab, defaulting to funding. Both are PREVIEW/"coming soon" surfaces driven by hardcoded sample data (`FUNDING_ROWS`, `AI_LEADERBOARD`) — no backend pipeline, refresh, or history exists yet. All chrome is trilingual. CountUp animations rest at the target value so SSR/no-JS/crawlers see the real number.

#### FR-DASH-01 — Dashboards route with funding/ai tab resolution
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader navigates to `/dashboards`, `/dashboards/funding`, or `/dashboards/ai`. · **Preconditions:** None (public; soft paywall does not gate dashboards).
**Behavior:** 1. Resolve `params.sub` via `use()`; take `sub[0]`. 2. `isTab()` narrows to `funding|ai`; any other value (incl. undefined/deeper) falls back to `funding`. 3. Render header (kicker "Data Desk · Preview", title "Dashboards", preview subtitle) via `t(en,vi,id)`. 4. Two-item tab bar → `/dashboards/{k}`; active tab gets a 3px `--accent` underline. 5. Render `<FundingTracker/>` or `<AILeaderboard/>` + shared methodology/sponsor footer.
**Business Rules:** BR-DASH-01, BR-DASH-07
**Acceptance Criteria:**
- `/dashboards` shows the Asia Funding Tracker (default).
- `/dashboards/ai` activates the AI Leaderboard tab.
- `/dashboards/unknown` or `/dashboards/funding/extra` falls back to funding.
**Source:** DASHBOARDS rows 1, 2. · **Implementation:** `dashboards/[[...sub]]/page.tsx:10-22,86-111`.

#### FR-DASH-02 — Asia Funding Tracker sortable table
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader views the funding tab or clicks a column header. · **Preconditions:** Funding tab active.
**Behavior:** 1. Init `sortKey='chg', sortDir='desc'`. 2. Filtered/sorted rows via `useMemo` from `FUNDING_ROWS`. 3. Header click: same key flips direction; new key sets desc. 4. Numbers arithmetic, strings `localeCompare`, null price/chg sort to end. 5. Render mono ticker, name, country, sector, right-aligned price (2dp en-US or "–" when null), ArrowUpDown for chg, mcap, colored recent-round. 6. Show ▲/▼ on the active header.
**Business Rules:** BR-DASH-02, BR-DASH-03
**Acceptance Criteria:**
- Clicking "Price" re-sorts by price with a direction arrow.
- A `px=null` row shows "–" and sorts to the end.
- Default load sorts by Day Δ descending; repeat click toggles direction.
**Source:** DASHBOARDS row 1. · **Implementation:** `dashboards/funding-tracker.tsx:55-85,190-271`; `data.ts:506-530`.

#### FR-DASH-03 — Funding Tracker country filter
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader clicks a country chip. · **Preconditions:** Funding tab active.
**Behavior:** 1. `countries = ['All', ...unique FUNDING_ROWS.country]`. 2. Track `country` (default 'All'). 3. When `country !== 'All'`, keep only matching rows, then sort. 4. Highlight the selected chip.
**Business Rules:** BR-DASH-02
**Acceptance Criteria:**
- Selecting "ID" shows only Indonesian rows.
- "All" shows every row; a country filter composes with a column sort.
- The chip list is built from data, not hardcoded.
**Source:** DASHBOARDS row 1. · **Implementation:** `dashboards/funding-tracker.tsx:59-87,141-173`.

#### FR-DASH-04 — Funding Tracker CSV export of current view
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader clicks the "↓ CSV" button. · **Preconditions:** Funding tab active.
**Behavior:** 1. Build a header row of 8 field keys. 2. Map each currently filtered+sorted row to a comma-joined line, coercing null → ''. 3. Create a `text/csv` Blob + object URL + temporary `<a download='dtw-funding-tracker.csv'>`; click; revoke.
**Business Rules:** BR-DASH-04
**Acceptance Criteria:**
- A country filter applied → only filtered rows appear in the file.
- A null px/chg → empty cell in the CSV.
- The download filename is `dtw-funding-tracker.csv`, generated fully client-side.
**Source:** DASHBOARDS row 1 (Export CSV). · **Implementation:** `dashboards/funding-tracker.tsx:89-107,174-176`.

#### FR-DASH-05 — Up/down delta indicator (ArrowUpDown)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Table/movers render. · **Preconditions:** None.
**Behavior:** 1. `chg` null → muted "–". 2. Else `up = chg >= 0`; green `var(--up)` #10B981 (upright ▲) for ≥0, red `var(--down)` #EF4444 (rotated 180°) for <0. 3. Prefix "+" when up; append `value.toFixed(2)+'%'` in mono tabular-nums.
**Business Rules:** BR-DASH-05
**Acceptance Criteria:**
- chg=+3.10 → green upright "+3.10%".
- chg=-2.05 → red rotated "-2.05%".
- chg=null → muted em-dash; up=#10B981, down=#EF4444.
**Source:** DASHBOARDS row 1. · **Implementation:** `packages/ui/src/arrow-up-down.tsx:7-34`; `dashboards/funding-tracker.tsx:248-250`.

#### FR-DASH-06 — Funding time-series chart + top movers
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Funding tab render. · **Preconditions:** Funding tab active.
**Behavior:** 1. `BigChart` maps a static 30-point series to SVG (720×220, PAD=12), building line + closed area paths (deterministic integer/pad math, no `Math.sin/random`). 2. Render 4 gridlines, gradient area, line stroke `var(--up)`, endpoint circle. 3. Render "Top movers · today" list (4 companies) with per-item ArrowUpDown.
**Business Rules:** BR-DASH-06
**Acceptance Criteria:**
- A 30-day ASEAN tech index chart renders as inline SVG.
- Chart math is deterministic so SSR and client output match (no hydration mismatch).
- A Top movers list of 4 companies with colored deltas renders; no external charting library.
**Source:** DASHBOARDS row 1. · **Implementation:** `dashboards/big-chart.tsx:1-63`; `dashboards/funding-tracker.tsx:275-343`.

#### FR-DASH-07 — AI Leaderboard sortable multi-criteria table
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader views the AI tab or clicks a column header. · **Preconditions:** AI tab active.
**Behavior:** 1. Init `sortKey='reasoning', sortDir='desc'`. 2. Sort `AI_LEADERBOARD` via `useMemo` (numbers arithmetic, strings localeCompare); header click toggles/new key desc. 3. Bar meters for reasoning (`--ai`), coding (`--dev`), speed (`--startups`), clamp 0–100%. 4. Price: 'free' green when 0, else '$'+price. 5. `#` column shows positional rank (i+1).
**Business Rules:** BR-DASH-02, BR-DASH-08
**Acceptance Criteria:**
- Default sort is Reasoning descending.
- Clicking "Coding" re-sorts by coding score with ▲/▼.
- price===0 renders "free" in green; reasoning/coding/speed render as bar meters with labels.
**Source:** DASHBOARDS row 2. · **Implementation:** `dashboards/ai-leaderboard.tsx:84-116,188-274`; `data.ts:532-552`.

#### FR-DASH-08 — AI Leaderboard "Optimize for" pills (no composite score)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader clicks an Optimize-for pill. · **Preconditions:** AI tab active.
**Behavior:** 1. Render 4 pills (Reasoning/Coding/Speed/Price). 2. Pill click: `setSortKey(k)`; `setSortDir('asc')` when `price` else `'desc'`. 3. Highlight active pill. 4. Localize labels. 5. Never compute or display any aggregate/composite score.
**Business Rules:** BR-DASH-08
**Acceptance Criteria:**
- "Price (low)" sorts by price ascending (cheapest first).
- "Speed" sorts by speed descending and highlights the pill.
- No single composite/overall AI score anywhere; header reads "Sort by what you actually use the model for".
**Source:** DASHBOARDS row 2 ("không chỉ 1 con số"). · **Implementation:** `dashboards/ai-leaderboard.tsx:77-95,150-175`.

#### FR-DASH-09 — Methodology note + informational disclaimer
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Any dashboard tab render. · **Preconditions:** None.
**Behavior:** 1. Render a Methodology kicker + tab-conditional paragraph (funding: index tickers + announced private rounds, exclusions; AI: three normalised benchmark sources, monthly update). 2. Render the fixed "For informational purposes only · not investment or procurement advice" line. 3. Localize all copy.
**Business Rules:** BR-DASH-09, BR-DASH-10
**Acceptance Criteria:**
- Funding tab describes ticker + private-round sourcing and SPAC/secondary/<$1M exclusions.
- AI tab cites three normalised benchmark sources updated monthly.
- Either tab shows the "For informational purposes only" disclaimer in en/vi/id.
**Source:** DASHBOARDS rows 1, 2. · **Implementation:** `dashboards/[[...sub]]/page.tsx:113-160`.

#### FR-DASH-10 — Dashboard sponsor slot (labelled, non-influencing)
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest (configured by Admin — planned)
**Trigger:** Any dashboard tab render. · **Preconditions:** None.
**Behavior:** 1. Render a mustard `var(--sponsored)` panel with an uppercase "Sponsor slot · this dashboard" label. 2. Render a partner placeholder + "Sponsorship does not influence the data or methodology." 3. Localize. **KNOWN GAP:** hardcoded placeholder ("[Partner Logo]"), not sourced from a Payload SponsorSlots collection; no empty-state suppression yet.
**Business Rules:** BR-DASH-07, BR-DASH-11
**Acceptance Criteria:**
- Any dashboard tab shows a sponsor slot with mustard background and a clear "Sponsor" label.
- The slot states sponsorship does not influence data/methodology.
**Source:** DASHBOARDS row 3. · **Implementation:** `dashboards/[[...sub]]/page.tsx:161-206`.

#### FR-DASH-11 — Count-up stat animation with resting-target and triple fallback
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Stat tile scrolls into view / mounts. · **Preconditions:** Component mounted (homepage teaser tiles).
**Behavior:** 1. Init displayed value `v = to` (the target, not 0). 2. `prefers-reduced-motion` → return early leaving the target. 3. IntersectionObserver (threshold 0.3) → `start()`. 4. Also a `rAF` viewport check → `start()`. 5. Also an 800ms `setTimeout` → `start()`. 6. `start()` guards double-run, eases 0→target (cubic ease-out). 7. Format with `toLocaleString('en-US', decimals)` in tabular-nums.
**Business Rules:** BR-DASH-12
**Acceptance Criteria:**
- With JS disabled or a crawler, the stat shows the real target number, never 0.
- `prefers-reduced-motion` shows the target without animation.
- If the observer never fires, the 800ms safety timer still starts the animation.
- SSR + hydration use identical en-US formatting (no mismatch).
**Source:** DASHBOARDS teaser; HOMEPAGE row 7. · **Implementation:** `effects/count-up.tsx:24-96`.

#### FR-DASH-12 — Homepage Live Dashboards teaser
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Homepage render. · **Preconditions:** None.
**Behavior:** 1. SectionHeader with "Open full dashboards →" → `/dashboards`. 2. Funding card: `AnimatedSpark(fundSeries)` draw-in, `ArrowUpDown(fundChange)`, three CountUp tiles (Deals/Avg round/Top sector), disclaimer, → `/dashboards/funding`. 3. AI card: mini-table `AI_LEADERBOARD.slice(0,4)` → `/dashboards/ai`. 4. Localize.
**Business Rules:** BR-DASH-10, BR-DASH-12
**Acceptance Criteria:**
- A funding card and an AI card render.
- The funding card shows an animated sparkline, count-up stats, and the informational disclaimer.
- Each card links to its full dashboard tab; the AI card previews the top 4 models.
**Source:** HOMEPAGE row 7; DASHBOARDS teaser. · **Implementation:** `home/dashboards-teaser.tsx:13-315`; `effects/animated-spark.tsx:13-83`.

#### FR-DASH-13 — Trilingual dashboard chrome (en/vi/id)
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Locale-scoped route render. · **Preconditions:** Active locale from i18n context.
**Behavior:** 1. Wrap every UI label in `t(en, vi, id)`. 2. Leave data-cell content (company names, model names, numeric values) untranslated.
**Business Rules:** BR-DASH-13
**Acceptance Criteria:**
- `/vi` tab labels read "Theo dõi gọi vốn châu Á" / "Bảng xếp hạng AI".
- `/id` disclaimer reads its Indonesian variant.
- Numeric data and tickers are identical across locales.
**Source:** HỆ THỐNG row 4; DASHBOARDS rows 1–3. · **Implementation:** `dashboards/[[...sub]]/page.tsx:8`; `dashboards/ai-leaderboard.tsx:88-95`.

#### FR-DASH-14 — Backend data pipeline, refresh, and history (NOT IMPLEMENTED)
**Priority:** Should · **Phase:** Phase 2 · **Actor:** Content Engine / data pipeline (planned)
**Trigger:** Scheduled refresh (planned). · **Preconditions:** Data-source adapters + Payload DashboardSources (not built).
**Behavior (planned):** 1. Collect funding/stock/AI-score data from configured sources. 2. Cache stock feed ~5 min at edge during market hours. 3. Persist history for trend charts. 4. Expose via API/cache. **Current:** read static sample arrays from `lib/data.ts`; header labels figures "sample data".
**Business Rules:** BR-DASH-14
**Acceptance Criteria:**
- **KNOWN GAP:** no backend pipeline, API, refresh cadence, or history storage exists; data is static sample.
- The current build labels figures as sample/preview data.
- (Target) a configured source refreshes on cadence with prior values retained.
**Source:** DASHBOARDS rows 1, 2 (pipeline/API/refresh/history). · **Implementation:** `data.ts:517-552`.

### 3.6 Search (SRCH)

Two reader surfaces plus a planned analytics loop: the ⌘K header overlay (instant debounced suggestions) and the `/search` full page (URL-persisted query, client-side Pillar facet, no-results state). Both call one server action `runSearch` → `searchArticles()`. **Brownfield reality:** the current backend is a Postgres substring LIKE over published title+dek only — no Meilisearch, no typo tolerance, no entity types, no PostHog. Date/author/type facets and the zero-result loop are Phase-2 gaps.

#### FR-SRCH-01 — Cmd/Ctrl+K search overlay open/close
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader presses ⌘/Ctrl+K, clicks the header search icon, or presses ESC/clicks backdrop. · **Preconditions:** Shell provides `searchOpen/closeSearch` (useShell).
**Behavior:** 1. Header control sets `searchOpen=true`. 2. Overlay renders fixed, full-viewport, backdrop `color-mix(in oklab, var(--ink) 60%, transparent)`. 3. Input autofocuses; query resets to empty whenever `searchOpen` → false. 4. Window keydown closes on Escape. 5. Backdrop click → `closeSearch`; panel click stops propagation. 6. An "esc" kbd hint shows.
**Business Rules:** BR-SRCH-01, BR-SRCH-05
**Acceptance Criteria:**
- ⌘/Ctrl+K or the header search icon opens the overlay with the input focused.
- ESC or a dimmed-backdrop click closes it.
- Reopening after a typed query shows an empty input.
**Source:** MENU/HEADER row 2; SEARCH row 1. · **Implementation:** `search-overlay.tsx:14,21,25,47`.

#### FR-SRCH-02 — Overlay instant debounced suggestions
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader types into the overlay input. · **Preconditions:** Overlay open.
**Behavior:** 1. Empty input → clear hits and show the "Try searching" chip list (SUGGESTED = sovereign AI, VNG, TSMC, datacenter, open weights). 2. Non-empty → a 200ms debounce fires `runSearch(query)`. 3. Results sliced to first 8. 4. Each hit renders a bold title + `dek.slice(0,130)+…`. 5. Non-empty with zero hits → localized "No results yet…". 6. Errors → empty hit list.
**Business Rules:** BR-SRCH-02, BR-SRCH-03
**Acceptance Criteria:**
- Empty input shows suggested-query chips.
- After 200ms, at most 8 matching article rows render with title + truncated dek.
- A no-match query shows "No results yet…".
**Source:** SEARCH row 1. · **Implementation:** `search-overlay.tsx:11,33,126,152`.

#### FR-SRCH-03 — Overlay navigation (Enter to full page, click to article)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader presses Enter in the input, or clicks a result row. · **Preconditions:** Overlay open.
**Behavior:** 1. Enter → `router.push('/search?q='+encodeURIComponent(q))` then `closeSearch()`. 2. Result click → `router.push('/article/'+a.slug)` then `closeSearch()`. 3. Suggested-chip click sets the query (no navigation).
**Business Rules:** BR-SRCH-06
**Acceptance Criteria:**
- Enter navigates to `/search?q=<encoded>` and closes the overlay.
- Clicking a result navigates to `/article/<slug>` and closes the overlay.
**Source:** MENU/HEADER row 2; SEARCH row 2. · **Implementation:** `search-overlay.tsx:89,155`.

#### FR-SRCH-04 — /search full page query input with URL persistence
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader visits `/search?q=…` or edits the page input. · **Preconditions:** Page mounted inside a Suspense boundary (required by `useSearchParams`).
**Behavior:** 1. Initial `q = params.get('q') ?? ''`. 2. Empty trimmed query → clear results, `loading=false`. 3. Non-empty → `loading=true` and a 220ms debounce fires `runSearch(query)`. 4. Results set from `ArticleView[]`; errors → `[]`; loading cleared in finally. 5. Status shows "Searching…" while loading else `${results.length} matches`.
**Business Rules:** BR-SRCH-02, BR-SRCH-03
**Acceptance Criteria:**
- `/search?q=TSMC` pre-fills the input with "TSMC" and renders results.
- Editing the input updates results and the match count after 220ms.
- Clearing the input empties results and shows suggested chips.
**Source:** SEARCH row 2. · **Implementation:** `search/page.tsx:45,56,303`.

#### FR-SRCH-05 — /search Pillar facet filter (client-side)
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader clicks a pillar button in the sidebar. · **Preconditions:** A query returned an `allResults` set.
**Behavior:** 1. Sidebar lists `['All', ...PILLARS.map(p=>p.id)]`. 2. Each button shows a pillar color swatch, localized label, and a live count. 3. On click, `setPillar(p)`; displayed results = `pillar==='All' ? allResults : allResults.filter(a=>a.pillar===pillar)`. 4. Selected button highlighted `var(--surface-2)`. Narrowing is purely client-side (no re-query). **KNOWN GAP:** Date/author/content-type facets from the spec are NOT implemented.
**Business Rules:** BR-SRCH-04
**Acceptance Criteria:**
- Selecting a pillar shows only that pillar's results and highlights the button.
- A pillar with zero matches shows a count badge of 0.
- "All pillars" shows every result.
**Source:** SEARCH row 2. · **Implementation:** `search/page.tsx:73,114,50`.

#### FR-SRCH-06 — /search result cards and suggested-query chips
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Query returns results, or query is empty. · **Preconditions:** Page mounted.
**Behavior:** 1. Each result is a `Link` to `/article/${a.slug}` wrapping a card: CoverArt (pillar, seed=a.id, `variant a.id.charCodeAt(0)%6`), PillarTag (localized), `a.section`, `fmtDateL(a.published, lang)`, title, dek, "By {author} · {readMin} min · <TimeAgo>". 2. Empty query → SUGGESTED chip row; clicking a chip calls `setQ(chip)`.
**Acceptance Criteria:**
- Each result card links to `/article/<slug>` with pillar tag, title, dek, byline.
- An empty input shows suggested chips and clicking one seeds the query.
**Source:** SEARCH row 2. · **Implementation:** `search/page.tsx:222,180,14`.

#### FR-SRCH-07 — No-results state on /search
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** A non-empty query resolves to zero results. · **Preconditions:** `loading=false`, `results.length===0`, `q.trim()` non-empty.
**Behavior:** 1. Render a dashed-border panel. 2. Serif heading: localized "No results for" + the raw query in smart quotes. 3. Muted hint: localized "Try a different keyword." 4. **KNOWN GAP:** no `search_zero_result` PostHog event is fired (not implemented).
**Acceptance Criteria:**
- A no-match query shows the "No results for '<q>'" panel and "Try a different keyword." hint.
- Note the missing `search_zero_result` event (gap).
**Source:** SEARCH row 3. · **Implementation:** `search/page.tsx:200`.

#### FR-SRCH-08 — Shared runSearch server action
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest (via client surfaces)
**Trigger:** Debounced keystroke on either surface. · **Preconditions:** —.
**Behavior:** 1. `runSearch` trims q; returns `[]` for empty. 2. Calls `searchArticles(q)` — Payload find where `_status=published AND (title LIKE q OR dek LIKE q)`, sort `-publishedAt`, limit 40, depth 1 (substring match, NOT typo-tolerant, published-only). 3. Maps each doc with `toArticleView()`.
**Business Rules:** BR-SRCH-03, BR-SRCH-07
**Acceptance Criteria:**
- Only published articles whose title or dek contains the substring return, newest first, capped at 40.
- An empty/whitespace query returns `[]` without hitting the DB search branch.
**Source:** SEARCH rows 1 & 2 backend. · **Implementation:** `search/search-action.ts:11`; `payload-server.ts:447`.

#### FR-SRCH-09 — Multi-language chrome for search surfaces
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader uses the site in en/id/vi locale. · **Preconditions:** Locale context.
**Behavior:** 1. All chrome (placeholders, status, facet labels, no-results copy, suggested heading) via `t(en, vi, id)`. 2. Pillar names via `localizedPillarLabel`. 3. Dates via `fmtDateL`. Article titles/bodies stay source-language.
**Business Rules:** BR-SRCH-08
**Acceptance Criteria:**
- In `vi`, chrome strings are Vietnamese while article titles stay source-language.
- Pillar facet labels are localized in any locale.
**Source:** SEARCH row 1 backend; invariants #9/#10. · **Implementation:** `search/page.tsx:11,114`; `search-overlay.tsx:6`.

#### FR-SRCH-10 — Meilisearch/Typesense typo-tolerant multi-index search (deferred)
**Priority:** Should · **Phase:** Phase 2 · **Actor:** Guest
**Trigger:** Reader searches (future). · **Preconditions:** Meilisearch index populated by the Payload afterChange hook.
**Behavior (planned):** 1. Query the locale-matched index by default; cross-locale fallback when results < 3. 2. Typo tolerance on. 3. Index title, subtitle, body_text, author_name, pillar, tags, published_at, _lang. 4. Y2+: index authors/companies/awards. 5. Public read-only key scoped to `articles_*`.
**Business Rules:** BR-SRCH-07, BR-SRCH-09
**Acceptance Criteria:**
- A mistyped query returns typo-tolerant matches.
- Fewer than 3 locale-matched results trigger cross-locale fallback.
- An article publish upserts it (module does not own the indexer).
**Source:** SEARCH row 1 backend; TECH row 5. · **Implementation:** `integrations/all-integrations.md:87`; `search/_GUIDE.md:41`; `payload-server.ts:442`.

#### FR-SRCH-11 — Date / author / content-type / language facets (deferred)
**Priority:** Should · **Phase:** Phase 2 · **Actor:** Guest
**Trigger:** Reader refines search with facets (future). · **Preconditions:** Faceted Meilisearch backend.
**Behavior (planned):** 1. Expose Date range, Type (article/author/award), Language filters alongside Pillar. 2. Persist facet state in the URL. 3. Filter server-side via a faceted query.
**Acceptance Criteria:**
- The faceted page filters by date range and type and reflects state in the URL.
- Only Pillar exists today; date/author/type/language are recorded as gaps.
**Source:** SEARCH row 2. · **Implementation:** `search/_GUIDE.md:34`.

#### FR-SRCH-12 — PostHog search-analytics loop and zero-result event (deferred)
**Priority:** Should · **Phase:** Phase 2 · **Actor:** System / Editor (report consumer)
**Trigger:** A reader submits a query; especially zero-result. · **Preconditions:** PostHog configured.
**Behavior (planned):** 1. On each search, fire `search_query` `{q, lang, result_count, filters}`. 2. On zero results, additionally fire `search_zero_result`. 3. Surface aggregates in an editorial analytics view. **Current:** no PostHog instrumentation exists.
**Business Rules:** BR-SRCH-10
**Acceptance Criteria:**
- With analytics wired, a resolved search emits `search_query`; a zero-result search additionally emits `search_zero_result`.
- Confirm no PostHog event fires today (gap).
**Source:** SEARCH row 3. · **Implementation:** `search/_GUIDE.md:52`; `integrations/all-integrations.md:140`.

### 3.7 Newsletters (NL)

The reader subscription surface for six pillar-segmented products (AM Brief, PM Brief, AI Weekly, Asia Funding Weekly, Dev Digest, Products & Deals). Products are CMS-driven; subscriptions live in Drizzle `newsletter_subscriptions` keyed on `(email, newsletter_id)`, linked to Payload by the `slug` string only. **MAJOR DIVERGENCE:** spec/guide mandate DOUBLE OPT-IN, but shipped code does SINGLE opt-in immediate capture (`subscribeGuest` writes `confirmedAt=now()`, no confirmation email). This FRS documents both the spec-mandated target and the shipped behavior, and flags the divergence.

#### FR-NL-01 — Render the six pillar-segmented newsletter products at /newsletters
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader navigates to `/newsletters`. · **Preconditions:** Payload `newsletters` seeded; ≥1 product `active:true`.
**Behavior:** 1. `NewslettersPage` awaits `getNewsletters()` (Payload where active=true, sort order, limit 12, depth 1 so `vertical` resolves). 2. Pass to `NewslettersContent`. 3. Render header + auto-fit card grid (min 320px). 4. `pillarColor(n)` from `n.vertical.color` else `var(--ink-2)`. 5. Each card shows `n.name[0]` badge, name, cadence (mono), description, and a checkbox bound to whether `n.slug` is in picks.
**Business Rules:** BR-NL-01, BR-NL-02, BR-NL-07
**Acceptance Criteria:**
- Six active products render sorted by `order` with name, cadence, description.
- A resolved `vertical` colors the badge/checked-border by pillar; no vertical → `var(--ink-2)`.
- `active=false` products are excluded.
**Source:** NEWSLETTERS row 1. · **Implementation:** `newsletters/page.tsx:10-13`; `newsletters/newsletters-content.tsx:22-186`; `payload-server.ts:600-614`; `payload/collections/Newsletters.ts:14-49`.

#### FR-NL-02 — Multi-select newsletter picker with default picks
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader clicks a newsletter card checkbox/label. · **Preconditions:** Page rendered with ≥1 active newsletter.
**Behavior:** 1. On mount, `picks` = returned slugs ∩ `DEFAULT_PICKS = {'am','ai'}`. 2. Clicking a label/checkbox calls `toggle(slug)` (add/remove). 3. Submit banner kicker shows `picks.size` + pluralized "newsletter(s) selected". 4. Subscribe button disabled when `picks.size === 0` (also while pending/submitted).
**Business Rules:** BR-NL-03
**Acceptance Criteria:**
- With products including 'am' and 'ai', AM Brief and AI Weekly are pre-checked.
- Unchecking every card disables the Subscribe button.
- Toggling a card updates the selected-count kicker.
**Source:** NEWSLETTERS row 2. · **Implementation:** `newsletters/newsletters-content.tsx:10,24-36,98-185,201-247`.

#### FR-NL-03 — Guest subscribe (single email, multiple segments) — AS IMPLEMENTED (single opt-in)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Guest submits the email form with ≥1 newsletter selected. · **Preconditions:** `picks.size ≥ 1`; a valid email.
**Behavior:** 1. `submit()` calls `subscribeGuest(email, Array.from(picks))` in a transition. 2. `subscribeGuest` lowercases/trims, validates against `EMAIL_RE`; returns `{ok:false}` if invalid or empty. 3. For each newsletterId: existing `(email, newsletter_id)` row → reactivate (`unsubscribedAt=null, confirmedAt=now()`); else insert with `id=randomUUID()`, `confirmedAt=now()`, `userId` null. 4. 23505 unique-violation swallowed. 5. On `{ok:true}`, `submitted=true`, disable input, relabel "Subscribed →".
**Business Rules:** BR-NL-04, BR-NL-05, BR-NL-08
**Acceptance Criteria:**
- A valid email + AM/AI selection creates two rows (`am`,`ai`) with `confirmedAt` set and `userId` null.
- A re-subscribe reactivates the existing row (no duplicate).
- Invalid email or empty selection returns `{ok:false}` and writes nothing.
- Concurrent identical submits do not duplicate (unique index).
**Source:** NEWSLETTERS row 2; LUỒNG CHÍNH row 3. · **Implementation:** `newsletters/newsletters-content.tsx:38-44`; `account-actions.ts:266-311`; `packages/db/src/schema/account.ts:85-101`.

#### FR-NL-04 — Double opt-in confirmation flow (SPEC-MANDATED, NOT YET IMPLEMENTED)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Guest submits a subscribe form (target behavior). · **Preconditions:** Valid email; ≥1 newsletter; Resend configured.
**Behavior (target):** 1. Server writes a `pending_newsletter_confirmations` row (token, email, newsletterIds[], createdAt, expiresAt). 2. A Resend confirmation email sends a single-action confirm link with the token. 3. Confirm route validates the token (unexpired), activates `newsletter_subscriptions` rows (`confirmedAt=now()`), consumes the pending row. 4. Segments assigned by pillar. 5. Manage/unsubscribe links to `/account` (signed-in) or a segment-scoped link (guests). **KNOWN GAP:** current code activates immediately with no confirmation email.
**Business Rules:** BR-NL-04, BR-NL-06, BR-NL-08
**Acceptance Criteria:**
- (Target) a submit creates a pending row and sends a confirmation email; the subscription is NOT yet active.
- (Target) clicking the confirm link before expiry activates and consumes the pending row.
- (Target) an expired/used token activates nothing.
- **KNOWN GAP:** current code activates immediately (single opt-in).
**Source:** NEWSLETTERS row 2; LUỒNG CHÍNH row 3. · **Implementation:** `packages/db/src/schema/account.ts:103-115`; `lib/email.ts:24-86`; `newsletters/_GUIDE.md:24-31`.

#### FR-NL-05 — Signed-in newsletter toggle (per-user, claim-or-insert)
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Reader
**Trigger:** Signed-in reader toggles a newsletter. · **Preconditions:** Valid session (`requireUser`).
**Behavior:** 1. `setNewsletter` looks up `(user_id, newsletter_id)`; found → set `unsubscribedAt = subscribe ? null : now()`. 2. Else look up an unclaimed legacy row (userId null, same email, newsletter_id); found → claim (set userId, toggle). 3. Else, subscribe false → no-op; true → insert a claimed row (`confirmedAt=now()`). 4. 23505 → recover by claiming the racing row. 5. `isSubscribed(newsletterId)` true only when a `(user_id, newsletter_id)` row has `unsubscribedAt IS NULL`; false (never throws) with no session.
**Business Rules:** BR-NL-05, BR-NL-08
**Acceptance Criteria:**
- Toggling on with no prior row inserts a row with userId, email, confirmedAt, null unsubscribedAt.
- A prior guest sub with the reader's email is claimed (not duplicated).
- Toggling off sets `unsubscribedAt`; `isSubscribed` returns false.
- No session → `isSubscribed` returns false without throwing.
**Source:** NEWSLETTERS row 2; ACCOUNT row 3. · **Implementation:** `account-actions.ts:148-235,242-257`; `home/newsletter-cta.tsx:42-46`.

#### FR-NL-06 — Homepage full-width Newsletter CTA (flagship AM Brief)
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest / Reader
**Trigger:** Reader views/interacts with the NewsletterCta band. · **Preconditions:** Homepage rendered.
**Behavior:** 1. `FLAGSHIP='am'`. 2. Guests: `submitGuest` calls `subscribeGuest(email, ['am'])`; on ok show "You're subscribed. Look out for the next AM Brief." 3. Signed-in: `isSubscribed('am')` seeds a toggle firing `setNewsletter('am', next)`. 4. "Choose more" → `/newsletters`. Copy asserts one-click unsubscribe and "We will never sell or share your email."
**Business Rules:** BR-NL-04, BR-NL-09
**Acceptance Criteria:**
- A guest submitting a valid email sees the guest-subscribed confirmation.
- A signed-in reader already subscribed sees "Subscribed to AM Brief".
- "Choose more" navigates to `/newsletters`.
**Source:** HOMEPAGE row 13; HEADER row 4; FOOTER row 3. · **Implementation:** `home/newsletter-cta.tsx:17-226`; `(reader)/page.tsx`.

#### FR-NL-07 — Editor/Admin authoring of newsletter products in Payload
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Editor / Admin
**Trigger:** Editor/Admin creates or edits a product. · **Preconditions:** Authenticated Payload user role editor/admin (admin for delete).
**Behavior:** 1. `newsletters` collection: name (unique), slug (unique; one of am/pm/ai/fund/dev/prod), cadence, description, vertical (→ pillars), active (default true), order (required). 2. read public; create/update editor|admin; delete admin. 3. afterChange/afterDelete revalidate `newsletters:all`. 4. slug must match the reader app's newsletterId contract. 5. `active=false` hides from `getNewsletters()`.
**Business Rules:** BR-NL-01, BR-NL-07, BR-NL-10
**Acceptance Criteria:**
- An Editor creating a unique name/slug product saves and (if active) appears at `/newsletters` after revalidation.
- A Reader/Author is denied create/update.
- A non-admin is denied delete.
- `active=false` excludes the product from the picker.
**Source:** NEWSLETTERS row 1. · **Implementation:** `payload/collections/Newsletters.ts:14-49`.

#### FR-NL-08 — Transactional email delivery via Resend with dev-console fallback
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Resend
**Trigger:** A server caller invokes `sendEmail(msg)`. · **Preconditions:** None to send (dev fallback); real delivery needs `RESEND_API_KEY`.
**Behavior:** 1. No key → print a dev-console block (To/Subject/text incl. any link) and return. 2. With a key → `resend.emails.send({from:'DailyTechWire <no-reply@RESEND_FROM_DOMAIN>', to, subject, html, text})`; on error log server-side and throw. 3. `actionEmail(opts)` returns `{html, text}`; html uses inline hex literals (sanctioned exception for email clients). Today exercised by auth flows, not the newsletter path.
**Business Rules:** BR-NL-11
**Acceptance Criteria:**
- Unset key → message (with any confirm link) prints to console; no throw.
- Set key + Resend error → logs server-side and throws.
- `actionEmail` returns both html and text with the DTW wordmark and CTA url.
**Source:** NEWSLETTERS row 2; LUỒNG CHÍNH row 3. · **Implementation:** `lib/email.ts:11-55,67-86`.

#### FR-NL-09 — Segment-scoped unsubscribe (per-newsletter, one-click)
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Reader
**Trigger:** Reader toggles a newsletter off, or clicks an emailed unsubscribe link. · **Preconditions:** An active subscription row exists.
**Behavior:** 1. `setNewsletter(id, false)` sets `unsubscribedAt=now()` on the single matching row (own or claimed legacy), leaving other newsletters untouched. 2. `isSubscribed` reflects the change. 3. **TARGET (Phase 2 pipeline):** every issue carries a segment-scoped unsubscribe link and an RFC 8058 List-Unsubscribe header; a Resend bounce webhook marks the email `dtw-bounced` and suppresses.
**Business Rules:** BR-NL-09
**Acceptance Criteria:**
- Unsubscribing from AI Weekly sets only the `ai` row's `unsubscribedAt`; AM Brief stays active.
- A row with `unsubscribedAt` set makes `isSubscribed` false.
- **GAP:** the RFC 8058 header, in-email links, and bounce suppression are not implemented (Phase 2).
**Source:** NEWSLETTERS row 2; feature _GUIDE. · **Implementation:** `account-actions.ts:164-172,194-202`; `packages/db/src/schema/account.ts:95`.

#### FR-NL-10 — Newsletter issue sending pipeline (Phase 2, not implemented)
**Priority:** Could · **Phase:** Phase 2 · **Actor:** BullMQ send worker (Phase 2)
**Trigger:** Editor schedules/publishes a newsletter issue (Phase 2). · **Preconditions:** Phase 2 infra (BullMQ, Resend Batch, PostHog).
**Behavior (planned):** 1. Editor schedules/publishes an issue in Payload. 2. BullMQ worker consumes the send job. 3. Resend Batch send in chunks of 100 to active, non-bounced subscribers of the target segment. 4. Delivery/open/click webhooks emit PostHog events; bounce marks `dtw-bounced` and suppresses.
**Business Rules:** BR-NL-09
**Acceptance Criteria:**
- **GAP/Phase 2:** no issue-authoring, BullMQ job, Resend Batch send, or webhook ingestion exists today.
- (Target) an issue reaches only confirmed, non-unsubscribed, non-bounced subscribers in batches ≤100.
**Source:** feature _GUIDE sending pipeline. · **Implementation:** `newsletters/_GUIDE.md:44-55`.

### 3.8 Authentication (AUTH)

Reader authentication on Better-Auth (self-hosted, Drizzle/Postgres), mounted at `/api/auth/[...all]`. **SPEC-VS-CODE DIVERGENCE:** spec/context describe magic-link as primary (no password column); the ACTUAL implementation is email + password with mandatory verification, forgot/reset, plus conditional Google/GitHub OAuth. No magic-link, no Apple OAuth. New accounts default to role `reader`. 2FA columns exist but 2FA is NOT wired into the Better-Auth config.

#### FR-AUTH-01 — Reader sign-up with email, name and password
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** User submits the signup form. · **Preconditions:** No session; email not registered.
**Behavior:** 1. AuthModal `mode=signup` collects name, email, password (minLength 8). 2. `authClient.signUp.email({email,password,name})` posts to `/api/auth`. 3. Better-Auth inserts `auth_users` with role default 'reader', `emailVerified=false`. 4. `emailVerification.sendOnSignUp=true` fires exactly one verification email. 5. Modal shows "Account created. Check your email…" 6. On error, show `error.message` or "Could not create account."
**Business Rules:** BR-AUTH-01, BR-AUTH-02, BR-AUTH-07
**Acceptance Criteria:**
- A fresh email creates an `auth_users` row with role='reader', `emailVerified=false`.
- Exactly one verification email is sent (no double-send).
- A password < 8 chars is blocked by input validation.
- The modal shows the check-your-email notice and does not auto-close.
**Source:** AUTH row 2. · **Implementation:** `auth-modal.tsx:79-102`; `lib/auth.ts:70-112,131-134`; `packages/db/src/schema/auth.ts:28-47`.

#### FR-AUTH-02 — Reader sign-in with email and password
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Reader
**Trigger:** User submits the sign-in form. · **Preconditions:** Account exists and email verified.
**Behavior:** 1. `mode=signin` collects email, password, remember (default true). 2. `authClient.signIn.email({email,password,rememberMe})`. 3. Better-Auth validates credentials + verification, creates `auth_sessions`, sets an httpOnly cookie via `nextCookies()`. 4. On success `closeAuth()`; `useSession` re-renders. 5. On failure show "Wrong email or password."
**Business Rules:** BR-AUTH-02, BR-AUTH-03, BR-AUTH-08
**Acceptance Criteria:**
- Correct credentials set a session cookie and close the modal.
- An unverified account is refused sign-in (`requireEmailVerification`).
- Wrong credentials show a generic error.
- "Remember me" passes `rememberMe`.
**Source:** AUTH row 1; LUỒNG CHÍNH row 4. · **Implementation:** `auth-modal.tsx:63-77`; `lib/auth.ts:58-153`; `api/auth/[...all]/route.ts:1-5`.

#### FR-AUTH-03 — Email verification on sign-up
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Reader / Better-Auth server
**Trigger:** Sign-up completes; verification link clicked. · **Preconditions:** `sendOnSignUp=true`; Resend or dev console.
**Behavior:** 1. `sendVerificationEmail` builds "Confirm your email" with a verify URL, sent via `sendAuthEmailSafe`. 2. `sendAuthEmailSafe` wraps `sendEmail` in try/catch — a mail outage logs but does not throw. 3. Clicking the link marks `emailVerified=true`. 4. `autoSignInAfterVerification=true` establishes a session immediately.
**Business Rules:** BR-AUTH-03, BR-AUTH-09
**Acceptance Criteria:**
- A single verification email is dispatched on sign-up.
- A mail provider error still completes account creation (logged).
- A valid verification link sets `emailVerified=true` and auto-signs-in.
**Source:** AUTH row 2. · **Implementation:** `lib/auth.ts:90-112,17-30`.

#### FR-AUTH-04 — Forgot password request (anti-enumeration)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Reader
**Trigger:** User submits the forgot-password form. · **Preconditions:** None.
**Behavior:** 1. `mode=forgot` collects email only. 2. `authClient.requestPasswordReset({email, redirectTo:'/reset-password'})`. 3. `sendResetPassword` sends "Reset your password" via `sendAuthEmailSafe` if the account exists. 4. `resetPasswordTokenExpiresIn=3600` (1 hour). 5. Modal always shows "If an account exists for that email, a reset link is on its way."
**Business Rules:** BR-AUTH-04, BR-AUTH-09
**Acceptance Criteria:**
- Any email submitted shows the identical "if an account exists" message.
- A registered email receives a reset email with a 1-hour token.
- An unregistered email sends nothing, indistinguishable in the UI.
**Source:** AUTH row 3. · **Implementation:** `auth-modal.tsx:104-121`; `lib/auth.ts:70-89`.

#### FR-AUTH-05 — Reset password from emailed link
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Reader
**Trigger:** User clicks the reset link and submits a new password. · **Preconditions:** A valid, unexpired token in the URL.
**Behavior:** 1. Read token via `useSearchParams().get('token')`. 2. No token → "This page needs a valid reset link…" 3. New password + confirmation (both minLength 8). 4. Client validates `password === confirm`, else "Passwords don't match." 5. `resetPassword({newPassword, token})`. 6. Error → `error.message` or "This reset link is invalid or has expired." 7. Success → "Your password has been reset…" with a link home.
**Business Rules:** BR-AUTH-04, BR-AUTH-10
**Acceptance Criteria:**
- A valid token + matching 8+ char passwords resets the password with a success message.
- Mismatched passwords show an error and make no request.
- A missing token hides the form; an expired/invalid token shows the invalid-or-expired error.
**Source:** AUTH row 3. · **Implementation:** `reset-password/page.tsx:21-131`.

#### FR-AUTH-06 — OAuth sign-in with Google / GitHub (conditional)
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Reader
**Trigger:** User clicks a social provider button. · **Preconditions:** Provider env vars set server + client; not forgot mode.
**Behavior:** 1. Server registers google/github only when `CLIENT_ID`+`CLIENT_SECRET` present. 2. Client renders each button only when `NEXT_PUBLIC_<provider>_ENABLED==='true'`. 3. Click → `signIn.social({provider, callbackURL})`. 4. On return, Better-Auth creates/links `auth_accounts` and a session. 5. GitHub ships hidden by default; Google is the intended provider. Apple is NOT implemented.
**Business Rules:** BR-AUTH-05
**Acceptance Criteria:**
- With Google env set + client gate true, the Google button starts OAuth on click.
- Client gate true but server not registered is an explicit configuration error the code warns against.
- No provider enabled → the divider and buttons hide; no Apple button/provider exists.
**Source:** AUTH row 1; LUỒNG CHÍNH row 4. · **Implementation:** `auth-modal.tsx:21-22,123-134,291-348`; `lib/auth.ts:51-56,113-130`; `packages/db/src/schema/auth.ts:74-100`.

#### FR-AUTH-07 — Session establishment, expiry and role resolution
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Better-Auth server / server code
**Trigger:** Any request that needs the current user. · **Preconditions:** A valid session cookie may or may not exist.
**Behavior:** 1. `session.expiresIn = 7 days`; `updateAge = 1 day`. 2. `getSessionUser()` calls `auth.api.getSession` and returns `SessionUser` or null; role defaults to 'reader'. 3. `requireUser()` throws "Not authenticated" when unauthenticated. 4. `roleAtLeast(role,min)` ranks `reader<pro<author<editor<admin` (lowercase DB values).
**Business Rules:** BR-AUTH-06, BR-AUTH-08, BR-AUTH-11
**Acceptance Criteria:**
- A valid session yields `{id,name,email,role}` with role lowercased.
- No session → `requireUser()` throws.
- `roleAtLeast('editor','author')` is true; `roleAtLeast('reader','editor')` is false.
- A session older than 7 days is expired.
**Source:** AUTH row 1; LUỒNG CHÍNH row 4. · **Implementation:** `lib/auth.ts:147-150`; `lib/session.ts:10-45`; `packages/db/src/schema/auth.ts:49-67`.

#### FR-AUTH-08 — Auth API mount
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Better-Auth server handler
**Trigger:** Any `/api/auth/*` request. · **Preconditions:** None.
**Behavior:** 1. `route.ts` exports `{GET,POST}` from `toNextJsHandler(auth)`. 2. `dynamic='force-dynamic'` (never cached). 3. `authClient` (createAuthClient) defaults to same-origin → `/api/auth/*`.
**Business Rules:** BR-AUTH-06
**Acceptance Criteria:**
- An auth client call reaches `/api/auth/*` and is handled by Better-Auth.
- The route is force-dynamic and not statically cached.
**Source:** AUTH row 1. · **Implementation:** `api/auth/[...all]/route.ts:1-5`; `lib/auth-client.ts:1-11`.

#### FR-AUTH-09 — Sign-out and post-auth redirect handling
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Reader
**Trigger:** User logs out, or an auth flow needs a callback URL. · **Preconditions:** For sign-out, an active session.
**Behavior:** 1. `signOut` (from authClient) clears the session. 2. `authCallbackUrl(path?)` returns path if given, else `window.location.pathname+search` on the client, else '/'. 3. OAuth/change-email flows pass `authCallbackUrl(...)`; no locale segment hardcoded so a future `/en /id /vi` migration is one line.
**Business Rules:** BR-AUTH-12
**Acceptance Criteria:**
- `authCallbackUrl()` with no arg returns the current pathname+search.
- `authCallbackUrl('/reset-password')` returns exactly that with no locale prefix.
- A logged-in `signOut` clears the session.
**Source:** LUỒNG CHÍNH row 4. · **Implementation:** `lib/auth-client.ts:11-25`; `auth-modal.tsx:126`.

### 3.9 Account (ACCT)

The per-user surface at `/account` (force-dynamic RSC gated on a verified session): tabs for Saved, Reading history, Following pillars, Newsletters, and Settings (change password / email / delete account). Per-user data lives in Drizzle `bookmarks`, `reading_queue`, `reading_history`, `follows`, `newsletter_subscriptions`. The `reading_queue` ("read later") table exists but has NO server actions and NO UI tab; IndexedDB↔DB offline sync and PWA offline caching are NOT implemented.

#### FR-ACCT-01 — Account page session gate (force-dynamic RSC)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Reader / Guest
**Trigger:** Navigation to `/account` or `/account/{tab}`. · **Preconditions:** None.
**Behavior:** 1. `dynamic='force-dynamic'` (no caching). 2. Active tab = first segment if `isAccountTab()`, else 'saved'. 3. `getSessionUser()`; if null render `AccountSignInPrompt` (inline "Log in to view your account.", HTTP 200, no redirect). 4. If a user, `Promise.all` fetch bookmarks, history, follows, nav pillars, newsletters, subs. 5. Hydrate article ids via `getArticlesByIds`; drop ids that no longer resolve. 6. Render `AccountShell`.
**Business Rules:** BR-ACCT-01, BR-ACCT-08
**Acceptance Criteria:**
- A guest at `/account` sees the inline sign-in prompt (HTTP 200, no redirect).
- A signed-in reader sees their saved/history/follows/newsletter data.
- `/account/history` activates the History tab; an unknown segment → 'saved'.
- A later-unpublished saved article is silently omitted.
**Source:** ACCOUNT rows 1-4; LUỒNG CHÍNH row 4. · **Implementation:** `account/[[...tab]]/page.tsx:21-78`; `account/[[...tab]]/tabs.ts:11-23`; `account/[[...tab]]/account-tabs.tsx:43-62`.

#### FR-ACCT-02 — Saved articles (bookmarks) tab
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Reader
**Trigger:** Open Saved tab; click Remove; toggle Save. · **Preconditions:** Authenticated session.
**Behavior:** 1. `listBookmarks(userId)` selects by `savedAt desc`. 2. Each row → `/article/{slug}` with cover art and "Saved <time> · N min". 3. Remove: optimistic filter, then `removeBookmark(articleId)` + `router.refresh()`. 4. `toggleBookmark(articleId)`: existing row → delete, return false; else insert, return true. 5. `isBookmarked` guest-safe (false with no session).
**Business Rules:** BR-ACCT-02, BR-ACCT-03, BR-ACCT-09
**Acceptance Criteria:**
- Saved articles render newest-saved first.
- Remove makes the row disappear immediately and deletes the bookmark.
- `toggleBookmark` on an unbookmarked article inserts a row and returns true.
- No session → `isBookmarked` returns false without throwing.
**Source:** ACCOUNT row 1. · **Implementation:** `lib/session.ts:52-58`; `account-actions.ts:28-68`; `account/[[...tab]]/account-tabs.tsx:200-300`; `packages/db/src/schema/account.ts:22-35`.

#### FR-ACCT-03 — Reading history tab
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Reader
**Trigger:** Reading an article (`recordView`); opening History; Clear history. · **Preconditions:** Authenticated for clear/list; guest-safe no-op for `recordView`.
**Behavior:** 1. `recordView(articleId)`: no-op if no session; else insert `reading_history` and onConflict `(userId,articleId)` update `readAt=now()`. 2. Fires for sponsored articles too. 3. `listHistory(userId)` by `readAt desc`, limit 50. 4. Clear history: optimistic empty, then `clearHistory()` deletes all + refresh. 5. `getReadCountThisPeriod(userId)` counts rows with `readAt >= start of current SGT period`.
**Business Rules:** BR-ACCT-04, BR-ACCT-05, BR-ACCT-09
**Acceptance Criteria:**
- Reading the same article twice yields exactly one row with an updated `readAt`.
- >50 rows → only the 50 most recent render.
- Clear history deletes all the reader's rows.
- No session → `recordView` no-ops; a sponsored read still records a row.
**Source:** ACCOUNT row 4; LUỒNG CHÍNH row 2. · **Implementation:** `account-actions.ts:80-95`; `lib/session.ts:60-67,97-104`; `account/[[...tab]]/account-tabs.tsx:302-388`; `packages/db/src/schema/account.ts:54-69`.

#### FR-ACCT-04 — Following pillars tab
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Reader
**Trigger:** Open Following tab; click Follow/Following toggle. · **Preconditions:** Authenticated session.
**Behavior:** 1. `listFollows(userId)` selects the user's follows. 2. `navPillars` from `getNavPillars()`. 3. `toggleFollow(targetSlug)`: existing `(userId,pillarId)` row → delete, return false; else insert, return true. 4. `targetSlug` is a CMS `NavPillar.slug` (no hardcoded enum). 5. UI flips a local Set immediately, fires `toggleFollow`, then refresh.
**Business Rules:** BR-ACCT-06, BR-ACCT-09
**Acceptance Criteria:**
- Following a not-followed pillar inserts a row and shows "Following".
- Toggling off deletes the follows row.
- A brand-new CMS pillar slug is accepted without a code change.
- The toggle updates optimistically before the server confirms.
**Source:** ACCOUNT row 2. · **Implementation:** `account-actions.ts:105-122`; `lib/session.ts:69-71`; `account/[[...tab]]/account-tabs.tsx:390-482`; `packages/db/src/schema/account.ts:71-83`.

#### FR-ACCT-05 — Newsletter subscriptions tab (signed-in, user-keyed)
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Reader
**Trigger:** Open Newsletters tab; toggle a newsletter. · **Preconditions:** Authenticated session.
**Behavior:** 1. `listNewsletterSubs(userId)` selects active (`unsubscribedAt IS NULL`) subs by user_id. 2. `setNewsletter` claim-or-insert (see FR-NL-05): update owned row → claim legacy email row → no-op/insert; 23505 → claim. 3. `isSubscribed` guest-safe (false with no session).
**Business Rules:** BR-ACCT-07, BR-ACCT-09
**Acceptance Criteria:**
- A verified reader subscribing stores a row with `confirmedAt` and no email confirmation step.
- A prior guest sub with the same email is claimed (user_id set), not duplicated.
- A concurrent double-click still succeeds by claiming the row.
- No session → `isSubscribed` returns false.
**Source:** ACCOUNT row 3. · **Implementation:** `account-actions.ts:124-257`; `lib/session.ts:79-86`; `account/[[...tab]]/account-tabs.tsx:484-570`; `packages/db/src/schema/account.ts:85-101`.

#### FR-ACCT-06 — Guest newsletter subscribe (email-keyed, later claimed)
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Guest submits an email + newsletter selection. · **Preconditions:** None.
**Behavior:** 1. Clean/lowercase email; validate `EMAIL_RE`; require ≥1 newsletterId else `{ok:false}`. 2. For each: existing `(email,newsletter_id)` → reactivate; else insert `confirmedAt=now()`; swallow benign 23505. 3. Return `{ok:true}`. Later sign-in claims the row via `setNewsletter`.
**Business Rules:** BR-ACCT-07
**Acceptance Criteria:**
- A valid email + ≥1 newsletter inserts/reactivates rows with `confirmedAt` and returns `{ok:true}`.
- An invalid email or empty list returns `{ok:false}` and writes nothing.
- A later sign-in claims the guest row (no duplicate).
**Source:** ACCOUNT row 3; LUỒNG CHÍNH row 3 (double opt-in — see gap). · **Implementation:** `account-actions.ts:259-311`.

#### FR-ACCT-07 — Settings — change password
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Reader
**Trigger:** Submit the Change password form. · **Preconditions:** Authenticated; account has an email+password credential.
**Behavior:** 1. `authClient.changePassword({currentPassword,newPassword,revokeOtherSessions:true})`. 2. Success → "Password updated. Your other sessions were signed out." + clear fields. 3. `CREDENTIAL_ACCOUNT_NOT_FOUND` → graceful no-password message. 4. Else show `error.message`.
**Business Rules:** BR-ACCT-10, BR-ACCT-11
**Acceptance Criteria:**
- Correct current + 8+ char new password changes the password and revokes other sessions.
- An OAuth-only account shows a graceful no-password message, not a crash.
- A wrong current password shows an error.
**Source:** ACCOUNT row 3. · **Implementation:** `account/[[...tab]]/settings-tab.tsx:122-153`; `lib/auth.ts:70-89`.

#### FR-ACCT-08 — Settings — change email
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Reader
**Trigger:** Submit the Change email form. · **Preconditions:** Authenticated.
**Behavior:** 1. `authClient.changeEmail({newEmail, callbackURL:'/account/settings'})`. 2. Success → "Check <newEmail> to confirm the change. Your account keeps using the current email until you click the link." 3. Email not switched until the new address confirms. `changeEmail` enabled in the auth config.
**Business Rules:** BR-ACCT-12
**Acceptance Criteria:**
- A new email sends a confirmation link to the new address.
- An unconfirmed change still authenticates with the current email.
- A confirmed change updates the account email.
**Source:** ACCOUNT row 3. · **Implementation:** `account/[[...tab]]/settings-tab.tsx:92-120`; `lib/auth.ts:135-144`.

#### FR-ACCT-09 — Settings — delete account (GDPR/PDPA right to erase)
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Reader
**Trigger:** Submit the Delete account form after typing DELETE. · **Preconditions:** Authenticated; confirm word equals DELETE.
**Behavior:** 1. `canDelete` requires `confirmWord==='DELETE'` and not busy. 2. `authClient.deleteUser(password ? {password} : {})`. 3. With a password, immediate; without, Better-Auth enforces session freshness. 4. Handle `CREDENTIAL_ACCOUNT_NOT_FOUND`/`INVALID_PASSWORD`/`SESSION_EXPIRED` with localized messages. 5. Success → `window.location.href='/'`. 6. FK cascades delete bookmarks/reading_queue/reading_history/follows; `newsletter_subscriptions.user_id` set NULL.
**Business Rules:** BR-ACCT-13, BR-ACCT-14, BR-ACCT-15
**Acceptance Criteria:**
- `confirmWord != 'DELETE'` disables the delete button.
- A correct password deletes immediately and reloads to '/'.
- An old session with no password shows SESSION_EXPIRED guidance.
- Deletion cascade-removes bookmarks/history/follows/queue; the newsletter email row is retained with user_id NULL.
**Source:** ACCOUNT row 3; invariant #12. · **Implementation:** `account/[[...tab]]/settings-tab.tsx:155-200`; `lib/auth.ts:145`; `packages/db/src/schema/account.ts:22-101`.

#### FR-ACCT-10 — Account tab navigation and header identity
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Reader
**Trigger:** Open `/account` and click tabs. · **Preconditions:** Authenticated.
**Behavior:** 1. `ACCOUNT_TABS` defines the ordered set (Saved, Reading history, Following, Newsletters, Settings). 2. Active tab gets inverted styling + a → marker. 3. Header avatar uses `user.name[0]`; role badge is `capitalize(user.role)`. 4. 'Saved' → `/account`; others → `/account/{tab}`.
**Business Rules:** BR-ACCT-01
**Acceptance Criteria:**
- Exactly the five tabs render in order.
- The active Following tab link is highlighted with a → marker.
- A reader named "Cheryl" shows avatar "C" and role badge e.g. "Reader".
**Source:** ACCOUNT rows 1-4. · **Implementation:** `account/[[...tab]]/account-tabs.tsx:87-198`; `account/[[...tab]]/tabs.ts:13-19`.

**Account scope gaps.** The `reading_queue` ("Read later") table exists but has no actions or UI tab (spec ACCOUNT row 1). IndexedDB↔DB multi-device sync and PWA offline caching (guide) are unimplemented — the "synced across N devices" copy is static. `reading_history.scrollDepth` is stored but always the default (0). Dark-mode/language pickers live in the app shell, not the account Settings tab. See §7–8.

### 3.10 CMS, RBAC & Taxonomy (CMS)

Payload CMS 3 embedded at `/admin`, sharing Postgres via Drizzle. Owns the editorial UI, RBAC in collection access controls, taxonomy (Pillars, Tags; per-article free-text section), Authors, Media (R2), SponsorSlots, WireDrops, Corrections, Newsletters, Articles (with Engine provenance fields), EngineConflictLog, and the PaywallSettings global. All writes flow through afterChange/afterDelete hooks that bust Next.js cache tags. Editorial identity (Users: author/editor/admin) is separate from Better-Auth reader users. Phase-E4 version-bump/lock enforcement and EngineConflictLog population are NOT yet coded.

#### FR-CMS-01 — Embedded Payload admin panel at /admin
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Author/Editor/Admin
**Trigger:** An editorial user navigates to `/admin`. · **Preconditions:** Authenticated against Payload Users with role author/editor/admin.
**Behavior:** 1. Request hits `app/(payload)/admin/[[...segments]]/page.tsx` → Payload RootPage with shared config and importMap. 2. Payload renders the admin shell; unauthenticated users see the Payload login. 3. `admin.user = Users.slug`. 4. Panel exposes every collection + PaywallSettings global subject to access controls. Tab title suffix "— DailyTechWire".
**Business Rules:** BR-CMS-01, BR-CMS-02
**Acceptance Criteria:**
- An author/editor/admin logging in sees the dashboard for their readable collections.
- No session at `/admin` shows the Payload login, not the dashboard.
- The browser tab title ends with "— DailyTechWire".
**Source:** CÔNG NGHỆ row 3; MENU/HEADER row 5. · **Implementation:** `payload.config.ts:46-63`; `(payload)/admin/[[...segments]]/page.tsx`; `(payload)/layout.tsx`.

#### FR-CMS-02 — Payload REST and GraphQL API surface
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Content Engine / editorial UI
**Trigger:** Any CRUD against a Payload collection. · **Preconditions:** Valid Payload session or Engine bearer token with adequate role.
**Behavior:** 1. REST verbs wired at `app/(payload)/api/[...slug]/route.ts`. 2. GraphQL POST at `app/(payload)/api/graphql/route.ts`. 3. Every mutating request passes access functions before persisting. 4. On success, afterChange/afterDelete hooks run the revalidation helper.
**Business Rules:** BR-CMS-03
**Acceptance Criteria:**
- An Engine POST to `/api/articles` creates a draft and runs the afterChange hook logic.
- A direct Postgres insert bypassing the API fires no revalidation/index/OG side-effects (the failure mode the API path prevents).
- A GraphQL query resolves subject to the same access controls.
**Source:** HỆ THỐNG row 11; CÔNG NGHỆ row 3. · **Implementation:** `(payload)/api/[...slug]/route.ts`; `(payload)/api/graphql/route.ts`; `(payload)/api/graphql-playground/route.ts`.

#### FR-CMS-03 — Editorial user accounts and 5-role RBAC
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Admin / all editorial users
**Trigger:** Admin creates/edits a user, or a user logs in. · **Preconditions:** For user management: acting user is admin.
**Behavior:** 1. `Users.auth` configures 7-day token, Lax cookies. 2. `role` select defaults 'author', options author/editor/admin. 3. Field-level access restricts role updates to admin only. 4. Collection access: read any logged-in user; create admin; update admin all-or-self (id equals `req.user.id`); delete admin. 5. `admin.user = Users.slug`.
**Business Rules:** BR-CMS-04, BR-CMS-05, BR-CMS-06, BR-CMS-16
**Acceptance Criteria:**
- A new user without a role defaults to 'author'.
- An author PATCHing their own record to role=admin is denied by field-level access.
- A non-admin creating a user is denied.
- A logged-in user updating a record not their own is denied unless admin.
**Source:** MENU/HEADER row 5; AUTH row 2. · **Implementation:** `payload/collections/Users.ts:16-92`; `process/context/auth/all-auth.md`.

#### FR-CMS-04 — Reader-account provenance separation (Payload Users vs Better-Auth)
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest (signup) / Admin
**Trigger:** A reader signs up (Better-Auth) or an admin views editorial users. · **Preconditions:** None for reader signup.
**Behavior:** 1. Reader signup flows entirely through Better-Auth; never inserts into Payload Users. 2. Payload Users read requires a logged-in editorial user, so `/admin` shows editorial accounts only. 3. Reconciliation to a single identity source is deferred.
**Business Rules:** BR-CMS-04, BR-CMS-06
**Acceptance Criteria:**
- A reader signup lands in Better-Auth with role Reader and cannot access `/admin`.
- An admin's Users list shows only editorial accounts.
**Source:** AUTH row 2. · **Implementation:** `payload/collections/Users.ts:3-14`; `process/context/auth/all-auth.md`.

#### FR-CMS-05 — Pillars taxonomy collection (dynamic beats, no deploy)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Editor/Admin
**Trigger:** Editor/Admin creates, edits, reorders, or deletes a pillar. · **Preconditions:** Editor or admin (delete admin).
**Behavior:** 1. Fields: slug (required, unique), title.{en required,vi,id}, heading, color (required), icon (required), order (required, default 0, min 0), description. 2. afterChange `revalidatePillar` busts `pillars:all` and `articles:all`; `revalidatePillarDelete` busts the same. 3. order controls nav + showcase ordering. 4. read public; create/update editor|admin; delete admin.
**Business Rules:** BR-CMS-07, BR-CMS-08
**Acceptance Criteria:**
- A new pillar reflects in nav/routes within ~5 minutes with no redeploy.
- Editing a pillar color invalidates both `pillars:all` and `articles:all`.
- A non-admin editor deleting a pillar is denied.
- Saving without `title.en` fails validation.
**Source:** HỆ THỐNG row 10; MENU/HEADER row 3; HOMEPAGE row 5; PILLAR rows 1, 5. · **Implementation:** `payload/collections/Pillars.ts`; `payload/hooks/revalidate.ts:123-139`.

#### FR-CMS-06 — Tags taxonomy collection (flat secondary taxonomy)
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Author/Editor/Admin
**Trigger:** Editorial user creates/edits/deletes a tag, or attaches tags. · **Preconditions:** Logged-in editorial user (create); editor/admin (update); admin (delete).
**Behavior:** 1. Fields: slug (required, unique, lowercase-dashed), title.{en required,vi,id}. 2. Articles carry one pillar but many tags. 3. `access.create` any role; update editor|admin; delete admin. 4. No afterChange cache tag on Tags.
**Business Rules:** BR-CMS-08
**Acceptance Criteria:**
- An author creating a unique-slug tag succeeds.
- A duplicate slug is rejected.
- A non-admin deleting a tag is denied.
**Source:** HỆ THỐNG row 10. · **Implementation:** `payload/collections/Tags.ts`.

#### FR-CMS-07 — Authors byline directory
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Editor/Admin (manage); Author (create)
**Trigger:** Editorial user creates/edits an author, or assigns one. · **Preconditions:** Logged-in editorial user (create); editor/admin (update); admin (delete).
**Behavior:** 1. Fields: name (required), role (required), city (required), bio, user (optional relationship→users for byline auto-fill). 2. city feeds Wire Drops CityChip + article header. 3. access.create any role; update editor|admin; delete admin.
**Business Rules:** BR-CMS-08
**Acceptance Criteria:**
- An author without a city fails validation.
- An author linked to a CMS user can auto-fill the byline on publish.
- A non-admin deleting an author is denied.
**Source:** ARTICLE row 1; SEARCH row 1. · **Implementation:** `payload/collections/Authors.ts`.

#### FR-CMS-08 — Media collection with R2 storage and responsive derivatives
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Author/Editor/Admin
**Trigger:** Editorial user uploads an image. · **Preconditions:** Logged-in editorial user (create/update); editor/admin (delete).
**Behavior:** 1. `upload.mimeTypes` image/* only. 2. `imageSizes` produce thumbnail (400w), card (800w), hero (1600w) via sharp. 3. Fields: alt (required), credit. 4. `s3Storage` enabled only when all R2_* env set (clientUploads=true, forcePathStyle=true, region 'auto') to bypass Vercel's ~4.5MB body limit; else local disk. 5. read public; create/update any role; delete editor|admin.
**Business Rules:** BR-CMS-09
**Acceptance Criteria:**
- An upload without alt text fails validation.
- A non-image file is rejected by mimeTypes.
- With all R2_* set, files store in R2 via presigned client upload; unset → local disk.
- An uploaded image has thumbnail/card/hero derivatives.
**Source:** ARTICLE row 2; HỆ THỐNG row 2. · **Implementation:** `payload/collections/Media.ts`; `payload.config.ts:35-88`.

#### FR-CMS-09 — Articles collection — editorial system of record
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Author/Editor/Admin/Content Engine
**Trigger:** Create or edit an article draft; publish/unpublish. · **Preconditions:** Author can create/update only drafts whose Author.user equals their id; editor/admin any; admin deletes.
**Behavior:** 1. Tabs: Content, Taxonomy, Disclosure, Engine-contract, Media; drafts/versions enabled. 2. Fields: title, unique indexed slug (auto from title, overridable), dek, richText body (source language — invariant #10), section, readMin (default 5, min 1), publishedAt (dayAndTime, defaults now), pillar (one), tags (many), author + coAuthors. 3. afterChange `revalidateArticle`: if published/was-published bust `articles:all` + log Meilisearch/OG TODO; afterDelete busts. 4. access.read public; create author|editor|admin; update editor/admin any, author only own, else false; delete admin. 5. Preview → `/preview?slug=`.
**Business Rules:** BR-CMS-10, BR-CMS-11, BR-CMS-17
**Acceptance Criteria:**
- An author updating an article not linked to their user is denied.
- An editor publishing invalidates `articles:all` and logs Meilisearch/OG TODO.
- Saving without a pillar or author fails validation.
- Default publishedAt stamps the creation instant (not future).
- A non-admin deleting an article is denied.
**Source:** ARTICLE rows 1, 3; HỆ THỐNG row 11; LUỒNG CHÍNH row 1. · **Implementation:** `payload/collections/Articles.ts`; `payload/hooks/revalidate.ts:56-91`.

#### FR-CMS-10 — Disclosure flags: sponsored, AI-assisted, affiliate, deep-dive, pin
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Editor/Admin (Author own drafts); Content Engine (aiAssisted)
**Trigger:** Editor toggles a disclosure flag. · **Preconditions:** Update rights on the article.
**Behavior:** 1. `aiAssisted` (default false) — field retained; inline disclosure removed per invariant #5. 2. `sponsored` (default false); `sponsor` text conditionally shown only when sponsored and validated required when sponsored. 3. `affiliate` (default false). 4. `deepDive` (default false) — feeds Deep Dive. 5. `pinnedToLatest` (default false) — pins to top of Latest + homepage Latest band; newest wins if several pinned.
**Business Rules:** BR-CMS-12, BR-CMS-13
**Acceptance Criteria:**
- sponsored checked with empty sponsor → validation "Sponsor name is required when sponsored is checked".
- sponsored unchecked → sponsor field hidden.
- aiAssisted true → no inline AI disclosure box renders (removed 2026-06-05).
- Multiple `pinnedToLatest` → newest published wins the top slot.
**Source:** ARTICLE row 4; HỆ THỐNG row 12. · **Implementation:** `payload/collections/Articles.ts:104-181`; `process/context/all-context.md` (invariant #5).

#### FR-CMS-11 — Article Engine-contract provenance fields
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Editor/Admin (lockedFields); Content Engine (origin/provenance)
**Trigger:** An article is created or edited by Engine or editor. · **Preconditions:** Editor/admin to edit lockedFields; provenance set by intake.
**Behavior:** 1. `origin` ('engine'|'manual', required, default manual). 2. `editedByHuman` (checkbox default true, read-only). Per Phase-E4 design a CMS write should set it true and Engine writes false — **NOT yet implemented**. 3. `lockedFields` (editable array of field names). 4. `version` (number default 1, read-only) intended to bump on every write — **Phase-E4, not implemented**. 5. `engineSourceUrl`/`engineSourceName` read-only provenance.
**Business Rules:** BR-CMS-14, BR-CMS-15, BR-CMS-18
**Acceptance Criteria:**
- An article with no origin defaults to 'manual'.
- version/editedByHuman/engineSourceUrl/engineSourceName are read-only in admin.
- Adding 'body' to lockedFields persists on save.
- **KNOWN GAP:** version is NOT auto-incremented and editedByHuman NOT auto-set (beforeChange pending Phase E4).
**Source:** HỆ THỐNG row 11. · **Implementation:** `payload/collections/Articles.ts:183-256`; `process/context/database/all-database.md`.

#### FR-CMS-12 — WireDrops realtime band source
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Author+ (create); Editor/Admin (edit/delete); Content Engine
**Trigger:** An editorial user or the Engine posts a wire drop. · **Preconditions:** Logged-in editorial user or Engine token.
**Behavior:** 1. Fields: time (required display string), city (required), text (required textarea, maxLength 200), publishedAt (required, default now). 2. No drafts — published on insert. 3. `revalidateWireDrop` afterChange busts `wire-drops` + logs realtime broadcast TODO; delete busts. 4. read public; create any role; update/delete editor|admin.
**Business Rules:** BR-CMS-19
**Acceptance Criteria:**
- A wire drop is immediately published and busts `wire-drops`.
- Text over 200 chars is rejected.
- A Soketi/Pusher broadcast is logged as TODO (Phase F not wired).
- An author-role user creating a wire drop succeeds.
**Source:** HOMEPAGE row 4. · **Implementation:** `payload/collections/WireDrops.ts`; `payload/hooks/revalidate.ts:93-118`.

#### FR-CMS-13 — SponsorSlots configuration (sponsored strip + dashboard slots)
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Admin
**Trigger:** Admin assigns/edits a sponsor slot. · **Preconditions:** Admin role.
**Behavior:** 1. slot select: homepage_strip | dashboard_funding | dashboard_ai. 2. article relationship→articles; empty = slot renders nothing (never "your ad here"). 3. startsAt/endsAt dayAndTime. 4. read public; create/update/delete admin only.
**Business Rules:** BR-CMS-20, BR-CMS-13
**Acceptance Criteria:**
- A non-admin editing a sponsor slot is denied.
- A slot with no article renders nothing.
- An assigned slot renders the placement with Paid Partner labeling.
**Source:** HOMEPAGE row 10; DASHBOARDS rows 1/2/3; HỆ THỐNG row 12. · **Implementation:** `payload/collections/SponsorSlots.ts`.

#### FR-CMS-14 — Corrections public log
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Editor/Admin
**Trigger:** An editor logs a correction. · **Preconditions:** Editor/admin role.
**Behavior:** 1. Fields: article (required rel), correctionDate (required, default today), summary (required), wasText (required), nowText (required), editor (rel→users). 2. read public; create/update editor|admin; delete admin. 3. Entries render on `/trust/corrections`.
**Business Rules:** BR-CMS-21
**Acceptance Criteria:**
- A correction without wasText or nowText fails validation.
- A published correction appears on `/trust/corrections`.
- A non-admin editor deleting a correction is denied.
**Source:** TRUST row 3; FOOTER row 5. · **Implementation:** `payload/collections/Corrections.ts`.

#### FR-CMS-15 — Newsletters product definitions with reader-app slug contract
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Editor/Admin
**Trigger:** Editor creates or edits a newsletter definition. · **Preconditions:** Editor/admin (create/update); admin (delete).
**Behavior:** 1. Fields: name (unique), slug (unique — the ONLY linkage to Drizzle `newsletter_id`, must be am/pm/ai/fund/dev/prod), cadence, description, vertical (pillar rel), active (default true), order (required, default 0). 2. afterChange/delete bust `newsletters:all`. 3. No FK between Payload and Drizzle — slug is the manual contract.
**Business Rules:** BR-CMS-22
**Acceptance Criteria:**
- A slug not in am/pm/ai/fund/dev/prod breaks the reader subscribe linkage (documented risk; no runtime FK).
- Saving busts `newsletters:all`.
- A duplicate name or slug is rejected.
**Source:** NEWSLETTERS row 1; HOMEPAGE row 13; FOOTER row 3. · **Implementation:** `payload/collections/Newsletters.ts`; `payload/hooks/revalidate.ts:157-183`.

#### FR-CMS-16 — PaywallSettings global (configurable soft-nudge threshold)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Editor/Admin
**Trigger:** Editor/Admin updates the paywall threshold. · **Preconditions:** Editor or admin role.
**Behavior:** 1. `paywallThreshold` number: required, default 3, min 1 (invariant #4). 2. read public; update editor|admin. 3. `revalidatePaywallSettings` afterChange busts `settings:paywall`. 4. Change effective immediately (or within ~5 min via cache). Signed-in readers never gated in Phase 1.
**Business Rules:** BR-CMS-23
**Acceptance Criteria:**
- Setting threshold to 5 makes the nudge appear after the 5th guest read and busts `settings:paywall`.
- A value below 1 is rejected (min 1).
- A non-editor/admin updating the global is denied.
- A signed-in reader is never gated in Phase 1.
**Source:** ARTICLE row 8; LUỒNG CHÍNH row 2. · **Implementation:** `payload/globals/PaywallSettings.ts`; `payload/hooks/revalidate.ts:141-152`.

#### FR-CMS-17 — EngineConflictLog read-only audit
**Priority:** Could · **Phase:** Phase 1 · **Actor:** Editor/Admin (read); conflict-detector hook (write — not implemented)
**Trigger:** An Engine write is skipped due to a lock/human-edit/version conflict. · **Preconditions:** Editor/admin to read; admin to delete.
**Behavior:** 1. Fields: article (required rel), field (required), engineValue (json), currentValue (json), reason (required select locked|human_edited|version_mismatch), occurredAt (required, default now). 2. read editor|admin; create=false; update=false; delete admin. 3. Intended to be written by the Phase-E4 detector — **currently no code populates it**.
**Business Rules:** BR-CMS-24, BR-CMS-14
**Acceptance Criteria:**
- Any API create to engineConflictLog is denied (create=false).
- An editor can read the log; an author cannot.
- **KNOWN GAP:** no conflict-log row is created yet (Phase E4 detector unimplemented).
**Source:** HỆ THỐNG row 11. · **Implementation:** `payload/collections/EngineConflictLog.ts`.

#### FR-CMS-18 — Single revalidation / side-effect path via afterChange hooks
**Priority:** Must · **Phase:** Phase 1 · **Actor:** System (hook) on behalf of any writer
**Trigger:** Any create/update/delete on a hooked collection or PaywallSettings. · **Preconditions:** Write occurs inside a request scope for `revalidateTag`.
**Behavior:** 1. Articles → bust `articles:all` on publish/was-published; log Meilisearch + OG TODO. 2. Pillars → bust `pillars:all` + `articles:all`. 3. WireDrops → bust `wire-drops` + log realtime TODO. 4. Newsletters → bust `newsletters:all`. 5. PaywallSettings → bust `settings:paywall`. 6. `context.disableRevalidate` (seed) → return early; else a try/catch downgrades out-of-request failures to a warning.
**Business Rules:** BR-CMS-03
**Acceptance Criteria:**
- A seed script with `disableRevalidate` writes without `revalidateTag` error.
- An `/admin` publish busts the corresponding cache tag(s).
- Meilisearch/OG/Soketi calls are logged TODO stubs, not executed.
**Source:** HỆ THỐNG rows 10, 11; database conflict model. · **Implementation:** `payload/hooks/revalidate.ts`.

### 3.11 Content Engine Integration (ENG)

The web-side half of the DTW Content Engine contract — the most failure-sensitive integration. It receives approved, AI-assisted articles from `dtw-engine`, publishes them as Payload Articles, marks provenance (`origin`, `editedByHuman`, `engineSourceUrl/Name`), and runs a single afterChange revalidation path. **Code-vs-spec reality:** the Engine reaches the web via `POST /api/engine/intake` (shared bearer token, Payload Local API, published-on-create), NOT the documented Payload REST/GraphQL Author-role PATCH-with-If-Match flow. Version/lock enforcement and EngineConflictLog population are "Phase E4" and NOT yet wired.

#### FR-ENG-01 — Authenticate Engine intake requests with a shared bearer token
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Content Engine
**Trigger:** The Engine POSTs to `/api/engine/intake`. · **Preconditions:** `DTW_INTAKE_TOKEN` env set on the web service.
**Behavior:** 1. Read `DTW_INTAKE_TOKEN`; unset → log error, return 500 `{error:'intake not configured'}`. 2. Read the Authorization header; require "Bearer " prefix. 3. Constant-time compare (`timingSafeEqual`) presented vs expected; false on length/shape mismatch. 4. Mismatch/missing → 401 `{error:'unauthorized'}`. 5. Match → proceed.
**Business Rules:** BR-ENG-01, BR-ENG-02
**Acceptance Criteria:**
- Unset `DTW_INTAKE_TOKEN` → 500, no article created.
- No/invalid bearer → 401.
- Wrong-length token → `bearerMatches` false without throwing.
- Valid token + well-formed request → processing continues.
**Source:** HỆ THỐNG row 11; LUỒNG CHÍNH row 1. · **Implementation:** `api/engine/intake/route.ts:71-82,102-112`.

#### FR-ENG-02 — Validate the intake payload and reject incomplete submissions
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Content Engine
**Trigger:** Authenticated POST body received. · **Preconditions:** Bearer auth passed.
**Behavior:** 1. Parse JSON; failure → 400 `{error:'invalid JSON body'}`. 2. Require non-empty title, pillarSlug, body_markdown; missing → 400 listing them. 3. Derive slug from `body.slug` else from title; empty → 400 `{error:'could not derive a slug'}`. 4. Coerce optional fields (dek fallback title[:200], byline, tags[], heroImageUrl|null, imageCredit|null, sourceProvenance, publishedAt fallback now()).
**Business Rules:** BR-ENG-03
**Acceptance Criteria:**
- Missing title → 400 lists 'title'.
- Non-JSON body → 400.
- Unsluggable title with no slug → 400.
- Only title+pillarSlug+body_markdown → defaults derived, processing continues.
**Source:** HỆ THỐNG row 11; LUỒNG CHÍNH row 1. · **Implementation:** `api/engine/intake/route.ts:114-169,60-93`.

#### FR-ENG-03 — Idempotent intake keyed on engineSourceUrl
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Content Engine
**Trigger:** Validated intake with a `sourceProvenance.url`. · **Preconditions:** Payload initialized; provenance.url present.
**Behavior:** 1. If sourceUrl present, `payload.find` articles where `engineSourceUrl` equals it (limit 1). 2. Match → log idempotent hit, return 200 `{id: existingId}`. 3. No sourceUrl or no match → continue to creation.
**Business Rules:** BR-ENG-04
**Acceptance Criteria:**
- Re-POSTing the same URL returns 200 with the existing id and creates nothing.
- A new source URL creates a new article (201).
- No provenance.url → dedup skipped, creation proceeds.
**Source:** HỆ THỐNG row 11; LUỒNG CHÍNH row 1. · **Implementation:** `api/engine/intake/route.ts:178-193`.

#### FR-ENG-04 — Resolve pillar by slug; reject unknown pillars
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Content Engine
**Trigger:** Validated intake during creation. · **Preconditions:** Pillars collection populated.
**Behavior:** 1. `payload.find` pillars where slug equals `pillarSlug`. 2. Zero docs → 422 `{error:'unknown pillar: <slug>'}`. 3. Else capture pillarId. The Engine never creates pillars.
**Business Rules:** BR-ENG-05
**Acceptance Criteria:**
- An unknown pillarSlug → 422, no article created.
- A valid pillarSlug attaches the resolved pillar id.
**Source:** HỆ THỐNG rows 10, 11. · **Implementation:** `api/engine/intake/route.ts:195-205`.

#### FR-ENG-05 — Find-or-create tags and author from the payload
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Content Engine
**Trigger:** Validated intake during creation. · **Preconditions:** Pillar resolved.
**Behavior:** 1. For each raw tag, slugify; skip empties; find by slug or create `{slug, title:{en:rawTag}}`. 2. byline present → find author by name; else create `{name, role:'Staff Writer', city:'Singapore'}`. 3. No author resolved (blank byline) → 400 `{error:'missing byline — cannot resolve required author'}`.
**Business Rules:** BR-ENG-06
**Acceptance Criteria:**
- A new tag slug is created and linked.
- A byline matching an existing author reuses it (no duplicate).
- A new byline creates an author with role 'Staff Writer', city 'Singapore'.
- An empty byline → 400.
**Source:** HỆ THỐNG rows 10, 11. · **Implementation:** `api/engine/intake/route.ts:207-255`.

#### FR-ENG-06 — Best-effort hero image ingestion (non-blocking)
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Content Engine
**Trigger:** Validated intake with `heroImageUrl` present. · **Preconditions:** Author resolved.
**Behavior:** 1. `fetch(heroImageUrl)`; `!res.ok` → throw. 2. Read arrayBuffer → Buffer; derive mimetype from content-type (default image/jpeg). 3. `payload.create` media `{alt:title, credit: imageCredit ?? sourceName}`. 4. Capture media id. 5. On any error → log "hero image upload failed — publishing without hero" and continue with null.
**Business Rules:** BR-ENG-07
**Acceptance Criteria:**
- A reachable image URL creates and links a media row.
- A hero fetch 500/network error still publishes (201) with no hero image.
- No heroImageUrl → ingestion skipped.
**Source:** ARTICLE PAGE row 2; HỆ THỐNG row 2. · **Implementation:** `api/engine/intake/route.ts:257-288`.

#### FR-ENG-07 — Convert markdown to Lexical and create a PUBLISHED article with engine provenance
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Content Engine
**Trigger:** All resolution steps succeeded. · **Preconditions:** Pillar/tags/author resolved; hero attempted.
**Behavior:** 1. Build `editorConfig` via `editorConfigFactory.default`. 2. `convertMarkdownToLexical`. 3. `estimateReadMin = max(1, round(words/220))` (default 5 if zero words). 4. `payload.create` articles with `_status:'published', origin:'engine', editedByHuman:false, aiAssisted:true, version:1`, plus title/slug/dek/body/pillar/tags/author/heroImage?/publishedAt/readMin/engineSourceUrl?/engineSourceName?. 5. Return 201 `{id}`; any thrown error → 500 `{error}`.
**Business Rules:** BR-ENG-08, BR-ENG-09, BR-ENG-10, BR-ENG-13
**Acceptance Criteria:**
- A valid payload creates a published article with origin='engine', editedByHuman=false, aiAssisted=true, version=1.
- body_markdown is stored as Lexical; readMin ≈ words/220 (floor 1).
- Provenance url/name persist (read-only in admin).
- An unexpected error returns 500, not a false 200/201.
**Source:** HỆ THỐNG row 11; LUỒNG CHÍNH row 1; ARTICLE PAGE row 3. · **Implementation:** `api/engine/intake/route.ts:290-330`; `payload/collections/Articles.ts:182-241`.

#### FR-ENG-08 — Single afterChange revalidation path for article writes
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Next.js ISR cache
**Trigger:** Payload afterChange on articles (CMS save or intake via Local API). · **Preconditions:** Not `context.disableRevalidate`.
**Behavior:** 1. `disableRevalidate` set → return doc unchanged. 2. `isPublished = doc._status==='published'`, `wasPublished = previousDoc._status==='published'`. 3. If published || was-published → `revalidateTag('articles:all')` in try/catch. 4. If published → log Meilisearch index + OG generate TODO; else log Meilisearch remove. 5. afterDelete → bust `articles:all` + log remove TODO.
**Business Rules:** BR-ENG-11, BR-ENG-12
**Acceptance Criteria:**
- An intake creating a published article revalidates `articles:all`.
- A seed with `disableRevalidate` skips `revalidateTag` without throwing.
- `revalidateTag` outside a request scope is caught and warned (no crash).
- Unpublishing (was published, now not) still busts `articles:all`.
**Source:** HỆ THỐNG row 11; LUỒNG CHÍNH row 1; HOMEPAGE row 15. · **Implementation:** `payload/hooks/revalidate.ts:55-89`; `payload/collections/Articles.ts:39-42`.

#### FR-ENG-09 — Article provenance & conflict-resolution schema
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Editor
**Trigger:** Editor opens an article's 'Engine contract' tab. · **Preconditions:** Article exists.
**Behavior:** 1. `origin` select (Engine auto | Manual editor), required, default manual. 2. `editedByHuman` checkbox default true, read-only. 3. `lockedFields` array of `{field:text}`. 4. `version` number default 1, read-only. 5. `engineSourceUrl`/`engineSourceName` read-only provenance set by intake.
**Business Rules:** BR-ENG-08, BR-ENG-09, BR-ENG-10, BR-ENG-14
**Acceptance Criteria:**
- A manual article defaults origin='manual', editedByHuman=true.
- Adding 'title' to lockedFields stores the field name for the (planned) enforcement layer.
- An Engine-ingested article shows engineSourceUrl/Name read-only and origin='engine'.
**Source:** HỆ THỐNG row 11. · **Implementation:** `payload/collections/Articles.ts:177-242`.

#### FR-ENG-10 — RBAC on the Articles collection
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Author / Editor / Admin
**Trigger:** A CMS user performs a CRUD action on articles. · **Preconditions:** User authenticated with a role.
**Behavior:** 1. read always true. 2. create true iff role ∈ {author,editor,admin}. 3. update: editor/admin true; author only where `author.user equals req.user.id`; else false. 4. delete iff role admin. The intake endpoint uses the Local API and bypasses this by design (bearer token is the boundary).
**Business Rules:** BR-ENG-15, BR-ENG-16
**Acceptance Criteria:**
- A Reader/Pro attempting create/update via the CMS API is denied.
- An author updating their own-linked article is allowed; otherwise denied.
- A non-admin deleting is denied.
- The intake endpoint via the Local API bypasses Payload access control.
**Source:** MENU/HEADER row 5; HỆ THỐNG row 11. · **Implementation:** `payload/collections/Articles.ts:271-282`; `api/engine/intake/route.ts:22-28`.

#### FR-ENG-11 — EngineConflictLog audit collection
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Editor / Admin (read); conflict-detector hook (write — planned)
**Trigger:** A skipped Engine write is detected (planned Phase-E4 detector). · **Preconditions:** Enforcement layer active (currently NOT implemented).
**Behavior:** 1. Store article (rel, required), field (text, required), engineValue (json), currentValue (json), reason (select locked|human_edited|version_mismatch, required), occurredAt (date, default now). 2. read editor|admin; create=false; update=false; delete admin.
**Business Rules:** BR-ENG-17, BR-ENG-18
**Acceptance Criteria:**
- Any UI/API create/update is refused.
- A non-editor/admin read is denied.
- A skipped write (planned) inserts a row with reason ∈ {locked, human_edited, version_mismatch}.
- **KNOWN GAP:** no rows are produced yet (detector not wired).
**Source:** HỆ THỐNG row 11. · **Implementation:** `payload/collections/EngineConflictLog.ts:12-48`.

#### FR-ENG-12 — lockedFields + editedByHuman + optimistic-lock enforcement (PLANNED — Phase E4, not implemented)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Content Engine
**Trigger:** Engine attempts to update a previously-ingested article. · **Preconditions:** Enforcement layer built (currently absent).
**Behavior (planned):** 1. beforeChange: bump version, set editedByHuman=true when req.user is a CMS user. 2. Engine PATCH validates `If-Match:<version>`; 409 → refetch+retry (≤3, exponential backoff). 3. Strip any field in lockedFields from the patch. 4. Skip any human-edited field; human value persists. 5. Insert an EngineConflictLog row per skipped field. **Current:** intake only CREATES published rows; never updates; sets version:1.
**Business Rules:** BR-ENG-19, BR-ENG-20, BR-ENG-21, BR-ENG-22
**Acceptance Criteria:**
- A field in lockedFields is skipped and logged reason='locked' (planned).
- A version mismatch returns 409 and the Engine retries ≤3 (planned).
- On a human-edited field, the human value persists and reason='human_edited' is logged (planned).
- **KNOWN GAP:** no beforeChange version-bump hook and no If-Match endpoint exist today.
**Source:** HỆ THỐNG row 11; LUỒNG CHÍNH row 1. · **Implementation:** `payload/collections/Articles.ts:16-24`; `payload/collections/EngineConflictLog.ts:5-11`.

#### FR-ENG-13 — Meilisearch index + OG generation + Wire-Drop broadcast side effects (PLANNED — stubbed)
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Meilisearch / OG generator / Soketi-Pusher
**Trigger:** Article/WireDrop afterChange. · **Preconditions:** Downstream services configured (Phase-later).
**Behavior (planned):** 1. On publish → Meilisearch `addDocuments`. 2. On unpublish/delete → `deleteDocument`. 3. Queue OG generation keyed by slug via BullMQ. 4. On WireDrop afterChange → broadcast to Soketi/Pusher `wire-drops`. **Current:** TODO log statements only; the cache-tag bust is the sole live side effect.
**Business Rules:** BR-ENG-12
**Acceptance Criteria:**
- Today an article publish only revalidates `articles:all` and logs search/OG as TODO.
- A WireDrop write busts `wire-drops` and logs broadcast as TODO.
- (Planned) a publish upserts Meilisearch and queues an OG job.
**Source:** HỆ THỐNG row 11; HOMEPAGE row 4; HỆ THỐNG row 5; SEARCH row 1. · **Implementation:** `payload/hooks/revalidate.ts:69-75,95-105`.

### 3.12 About & Trust (TRUST)

The trust-and-transparency surface plus adjacent marketing/legal pages: the dynamic Trust hub (`/trust/[slug]` — editorial, ai, corrections, transparency, sponsored), the Corrections collection, `/about` (APCG parent org, Cheryl Tan EIC), `/newsroom`, and marketing/legal pages (`/press`, `/contact`, `/advertise`, `/studio`, `/awards`, `/briefing`, `/legal/[slug]`). All chrome is trilingual. Corrections is the only genuinely dynamic page (cached server fetch, revalidate=300). Trust/legal bodies are currently hardcoded trilingual in code (spec expects CMS-editable).

#### FR-TRUST-01 — Trust hub routing and static generation for the five trust pages
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader navigates to `/trust/{slug}`. · **Preconditions:** Corrections data available for the corrections slug.
**Behavior:** 1. Route awaits `params.slug`; `isTrustSlug()` validates against SLUGS = [editorial, ai, corrections, transparency, sponsored]. 2. Invalid → default 'editorial' (no 404). 3. `corrections` slug → `getCorrections()` mapped to CorrectionView; else empty array. 4. Render `<TrustContent slug corrections/>`. 5. `generateStaticParams()` returns all five; revalidate=300.
**Business Rules:** BR-TRUST-04, BR-TRUST-05
**Acceptance Criteria:**
- `/trust/{editorial|ai|corrections|transparency|sponsored}` renders its page (prerendered at build).
- `/trust/unknown-slug` renders the editorial page (no 404).
- The corrections slug passes `getCorrections()` output; others pass an empty array.
**Source:** TRUST PAGES rows 1-5. · **Implementation:** `trust/[slug]/page.tsx:4,22,37,39`.

#### FR-TRUST-02 — Trust page shell with sticky section navigation
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Any `/trust/{slug}` page renders. · **Preconditions:** Valid trust slug resolved.
**Behavior:** 1. ORDER = editorial, ai, corrections, transparency, sponsored. 2. Each nav item a `Link` to `/trust/{k}` showing `PAGES[k].title`. 3. Active item: background `var(--surface-2)`, 2px accent left-border, `aria-current='page'`. 4. Main column renders kicker + serif H1. 5. `corrections` → `<CorrectionsLog>`; else the body sections list.
**Business Rules:** BR-TRUST-06
**Acceptance Criteria:**
- All 5 trust links render; the current page's link has `aria-current='page'`.
- In vi/id, nav labels and heading render translated.
**Source:** TRUST PAGES rows 1-5. · **Implementation:** `trust/[slug]/trust-content.tsx:31,326,339,364`.

#### FR-TRUST-03 — Editorial Standards page content
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader opens `/trust/editorial`. · **Preconditions:** None.
**Behavior:** 1. Render title "Editorial Standards" + "Last updated" kicker. 2. Render five [heading, paragraph] sections (How we report, Independence, Anonymous sources, Corrections, Conflicts) in the active locale. 3. Corrections section links to `/trust/corrections`. Content hardcoded trilingual.
**Business Rules:** BR-TRUST-02, BR-TRUST-11
**Acceptance Criteria:**
- The five standards sections appear with the last-updated kicker.
- In a non-en locale, headings/body appear translated.
**Source:** TRUST PAGES row 1. · **Implementation:** `trust/[slug]/trust-content.tsx:134`.

#### FR-TRUST-04 — AI Disclosure page content
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader opens `/trust/ai`. · **Preconditions:** None.
**Behavior:** 1. Render title "AI Disclosure" + kicker. 2. Render five sections (Use cases we allow, Use cases we don't, Labels, Models, Human accountability). 3. **KNOWN GAP:** the 'Labels' section still describes an inline 'AI-assisted' top/middle/bottom label removed 2026-06-05 (invariant #5); left unsynced pending policy finalisation — do not re-add AI badge UI.
**Business Rules:** BR-TRUST-09
**Acceptance Criteria:**
- The five AI-policy sections appear.
- The 'Labels' section text is flagged as describing a removed inline disclosure (known gap).
**Source:** TRUST PAGES row 2. · **Implementation:** `trust/[slug]/trust-content.tsx:184,213`.

#### FR-TRUST-05 — Corrections public log rendering
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader opens `/trust/corrections`. · **Preconditions:** Corrections fetched via `getCorrections()`.
**Behavior:** 1. Server maps Correction docs to CorrectionView (resolving article.title, editor.name at depth 1). 2. `CorrectionsLog` renders each: `fmtDateL(iso, lang)` date, serif article title, optional summary, 'was:' line (line-through, down color), 'now:' line (up color). 3. editor present → "Signed off by {editor}". 4. Empty → trilingual empty-state box.
**Business Rules:** BR-TRUST-03
**Acceptance Criteria:**
- Corrections render newest-first with date, article title, was, now.
- An entry with a signing editor shows "Signed off by {name}".
- No corrections → the empty-state box.
- In vi/id, date and was/now/signed-off labels are localized.
**Source:** TRUST PAGES row 3. · **Implementation:** `trust/[slug]/trust-content.tsx:39`; `trust/[slug]/page.tsx:39`; `payload-server.ts:555`.

#### FR-TRUST-06 — Transparency Report placeholder (Year 1)
**Priority:** Should · **Phase:** Phase 2 · **Actor:** Guest
**Trigger:** Reader opens `/trust/transparency`. · **Preconditions:** None.
**Behavior:** 1. Render title "Transparency Report" + kicker "Year one · inaugural". 2. Render one 'Coming soon' section ending "First report drops Q1 2027". 3. No data aggregation (Phase 2).
**Business Rules:** BR-TRUST-10
**Acceptance Criteria:**
- A single placeholder section with "First report drops Q1 2027" appears.
- No quarterly figures are computed or shown in Year 1.
**Source:** TRUST PAGES row 4. · **Implementation:** `trust/[slug]/trust-content.tsx:247`.

#### FR-TRUST-07 — Sponsored & Affiliate Policy page content
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader opens `/trust/sponsored`. · **Preconditions:** None.
**Behavior:** 1. Render title "Sponsored & Affiliate Policy" + kicker. 2. Sections: DTW Studio (yellow bg, 'Paid Partner' label, top/middle/end disclosure that cannot be turned off), What sponsors can do, What sponsors cannot do, Affiliate links ($ icon + tooltip, commission disclosed), Refusals.
**Business Rules:** BR-TRUST-01, BR-TRUST-02
**Acceptance Criteria:**
- All five policy sections appear.
- The DTW Studio section states the disclosure cannot be turned off.
**Source:** TRUST PAGES row 5. · **Implementation:** `trust/[slug]/trust-content.tsx:261`.

#### FR-TRUST-08 — Corrections Payload collection (data + access control)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Editor
**Trigger:** Editor creates/edits a correction in `/admin`. · **Preconditions:** Editor/admin authenticated in Payload.
**Behavior:** 1. Fields: article (required rel), correctionDate (required, default now, day-only), summary (required), wasText (required), nowText (required), editor (users rel, optional). 2. read public; create/update editor|admin; delete admin.
**Business Rules:** BR-TRUST-03
**Acceptance Criteria:**
- A Reader/Pro/Author creating a correction is denied.
- An editor creating a complete correction saves and appears on `/trust/corrections` after revalidation.
- A non-admin deleting a correction is denied.
- A correction with no article fails validation.
**Source:** TRUST PAGES row 3. · **Implementation:** `payload/collections/Corrections.ts:9,17,55`.

#### FR-TRUST-09 — About page (APCG parent org, mission, values, trust links, business info)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader opens `/about`. · **Preconditions:** None.
**Behavior:** 1. Dark navy hero (kicker "About · Asia Press Centre Group (APCG)", serif title, trilingual intro naming APCG, three hero pillars). 2. 'Who we are' (APCG description, editorial independence, links to Editorial Standards + AI Disclosure). 3. Mission & 4 Values (Accuracy first, Independence, Transparency, Service to readers). 4. 'Read the rules' trust-link card grid. 5. Business-info footer (registered office, press/partnership emails auto-mailto, `/contact` link). No fabricated awards/career-history/tip-line (invariant, keep removed).
**Business Rules:** BR-TRUST-07, BR-TRUST-08, BR-TRUST-12
**Acceptance Criteria:**
- Hero, who-we-are, mission+4 values, trust cards, and business info sections appear.
- No fabricated awards/career-history/tip-line content appears.
- An email line becomes a mailto link.
- Locale switching re-renders hero and chrome translated.
**Source:** FOOTER row 1; About _GUIDE. · **Implementation:** `about/page.tsx:68,27,34,45,120`.

#### FR-TRUST-10 — Newsroom detail page (inside-the-newsroom)
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader opens `/newsroom` (or `/about/newsroom` → 301). · **Preconditions:** None.
**Behavior:** 1. Navy hero with trilingual sub naming APCG + three hero pillars. 2. 'What we cover' beats grid (8 beats, 'YOU ARE HERE' on tech). 3. EIC section (Cheryl Tan). 4. Full masthead grid (8 named editors + cities). 5. Bureaus & desks grid (6 cities). 6. Business-info footer + back-link. 7. `next.config.ts` redirects `/about/newsroom` → `/newsroom` (permanent). **KNOWN GAP:** beats grid, EIC career history, named masthead, and named bureaus are fabricated content pending cleanup (not launch-ready).
**Business Rules:** BR-TRUST-07, BR-TRUST-08
**Acceptance Criteria:**
- `/about/newsroom` → permanent 301 to `/newsroom`.
- `/newsroom` renders beats, EIC, masthead, and bureaus sections.
- Fabricated content is flagged for pre-launch cleanup.
**Source:** FOOTER row 1; _GUIDE /newsroom. · **Implementation:** `newsroom/page.tsx:26,93,104,448`; `next.config.ts:22`.

#### FR-TRUST-11 — Contact page (channels + publisher info)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader opens `/contact`. · **Preconditions:** None.
**Behavior:** 1. Centered header (localized). 2. Three mailto channel cards (General & editorial → info@, Press & media → media@, Partnerships & business → partnership@), each with icon/label/description/email. 3. Publisher block (APCG, Bugis Cube Singapore 188735) + response-time note. Fully trilingual.
**Business Rules:** BR-TRUST-12
**Acceptance Criteria:**
- Three mailto channel cards + publisher + response-time blocks appear.
- A channel card click opens the mail client to the channel email.
- In a non-en locale, labels/descriptions are translated.
**Source:** FOOTER row 1. · **Implementation:** `contact/page.tsx:18,84,180`.

#### FR-TRUST-12 — Press inquiries page
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Press contact
**Trigger:** Reader opens `/press`. · **Preconditions:** None.
**Behavior:** 1. Navy hero with a `mailto:media@` CTA. 2. Three topic cards (Interviews & expert comment, Story tips & documents, Media credentials & reuse), each mailto-linked. 3. Guidance list + response-time block.
**Business Rules:** BR-TRUST-12
**Acceptance Criteria:**
- Hero CTA + three topic cards + guidance block appear, pointing to media@dailytechwire.com.
- Locale switching re-renders copy translated.
**Source:** FOOTER row 1. · **Implementation:** `press/page.tsx:12,15,137`.

#### FR-TRUST-13 — Advertise page
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Advertiser
**Trigger:** Reader opens `/advertise`. · **Preconditions:** None.
**Behavior:** 1. Navy hero + audience stats strip. 2. Three 'why DTW' cards, six format cards (branded-content card → `/studio`). 3. Audience-composition chart + markets tags. 4. Brand-safety/editorial-separation note → `/trust/sponsored`. 5. Navy CTA band → advertising@dailytechwire.com.
**Business Rules:** BR-TRUST-02, BR-TRUST-08
**Acceptance Criteria:**
- Hero+stats, why, six formats, audience chart, standards note, and CTA appear.
- The branded-content card navigates to `/studio`.
- The standards note navigates to `/trust/sponsored`.
**Source:** FOOTER row 1. · **Implementation:** `advertise/page.tsx:25,29,92,582`.

#### FR-TRUST-14 — DTW Studio page
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Partner
**Trigger:** Reader opens `/studio`. · **Preconditions:** None.
**Behavior:** 1. Navy hero with a 'Start a project' `mailto:partnership@` CTA. 2. Three service cards (Branded features, Research & data, Audio/video & events). 3. 'How we work' firewall principles (Always labelled, Separate from the newsroom, Clear on the line) → `/trust/sponsored`. 4. CTA band.
**Business Rules:** BR-TRUST-01, BR-TRUST-02
**Acceptance Criteria:**
- Hero, services, principles, and CTA appear.
- The principles block states sponsored work is separate from the newsroom and always labelled.
- The policy link navigates to `/trust/sponsored`.
**Source:** FOOTER row 1. · **Implementation:** `studio/page.tsx:13,46,280`.

#### FR-TRUST-15 — Awards page (Year-1 inaugural placeholder)
**Priority:** Could · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader opens `/awards`. · **Preconditions:** None.
**Behavior:** 1. Navy hero with 'Awards · Inaugural' pill + 'Launching next year' headline + short description. 2. Two CTAs (Notify me → `/newsletters`, Back to homepage → `/`). No medallion, no previous-winners, no categories (invariant #13).
**Business Rules:** BR-TRUST-13
**Acceptance Criteria:**
- Only the inaugural 'launching next year' hero appears (no medallion/winners/categories).
- 'Notify me' navigates to `/newsletters`.
**Source:** FOOTER row 1. · **Implementation:** `awards/page.tsx:10,97`.

#### FR-TRUST-16 — Briefing page (AM/PM Brief placeholder)
**Priority:** Could · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader opens `/briefing`. · **Preconditions:** None.
**Behavior:** 1. Render kicker "The Brief", heading "AM Brief · PM Brief", description of the two daily emails, and a note that subscriptions open soon via Newsletters. (English only in current code.)
**Acceptance Criteria:**
- The AM/PM Brief description and "subscriptions open soon" note appear.
**Source:** FOOTER row 1; NEWSLETTERS context. · **Implementation:** `briefing/page.tsx:1`.

#### FR-TRUST-17 — Legal pages (/legal/[slug]: privacy, terms, cookies, gdpr)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader opens `/legal/{slug}`. · **Preconditions:** None.
**Behavior:** 1. `layout.tsx generateStaticParams` prerenders privacy/terms/cookies/gdpr. 2. `isLegalSlug()` validates; invalid → 'privacy'. 3. Render a sticky legal nav (Privacy, Terms, Cookies, GDPR/PDPA) + active marker + data-questions box (info@). 4. Render kicker, intro, body sections in active locale; footer "Asia Press Centre Group (APCG) · Singapore". Content hardcoded trilingual, encoding GDPR/PDPA/Nghị định 13 rights, first-party self-hosted analytics, Singapore residency, named DPO (info@).
**Business Rules:** BR-TRUST-05, BR-TRUST-08
**Acceptance Criteria:**
- `/legal/{privacy|terms|cookies|gdpr}` renders and was prerendered.
- `/legal/unknown` renders the privacy policy.
- The GDPR page describes GDPR, PDPA, and Nghị định 13 rights and a DPO contact.
- Locale switching re-renders legal copy translated.
**Source:** FOOTER row 1. · **Implementation:** `legal/[slug]/page.tsx:23,35`; `legal/[slug]/layout.tsx:12`.

#### FR-TRUST-18 — Footer trust links and section navigation
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Any reader page renders (footer present). · **Preconditions:** None.
**Behavior:** 1. Trust column (Editorial Standards, AI Disclosure, Corrections, Sponsored & Affiliate Policy). 2. Section links (About, Contact, Press, Advertise, DTW Studio, Awards). 3. Legal links (Privacy, Terms, Cookies, GDPR/PDPA). All trilingual. **KNOWN GAP:** the spec footer trust row lists Transparency; the Transparency link is absent from the footer.
**Acceptance Criteria:**
- Trust links (editorial, ai, corrections, sponsored) and section/legal links render and navigate.
- The Transparency link is absent from the footer (gap).
**Source:** FOOTER rows 1, 5. · **Implementation:** `footer.tsx:23,32,41,51`.

#### FR-TRUST-19 — Trilingual chrome across trust/marketing/legal pages
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader toggles locale on any module page. · **Preconditions:** i18n provider active.
**Behavior:** 1. `useT()` returns `t(en,vi,id)` selecting by lang. 2. `fmtDateL` formats correction dates per locale. 3. Pages re-render chrome and hardcoded body in the selected language. Per guide, real editorial translation must be editor-approved, never automatic LLM.
**Business Rules:** BR-TRUST-11
**Acceptance Criteria:**
- In vi/id, chrome and body strings appear in that language.
- Correction dates reformat per locale.
- Body edits require editor-approved translation (not auto-LLM).
**Source:** FOOTER row 4; HỆ THỐNG i18n. · **Implementation:** `trust/[slug]/trust-content.tsx:4`; `lib/i18n`.

### 3.13 Platform / System-wide (SYS)

Cross-cutting concerns: SEO & AI-search (metadata/OpenGraph, JSON-LD, sitemap, robots, Atom feeds, llms.txt), PWA manifest, i18n, dark mode, accessibility, PostHog posture, security & compliance (cookie consent, RBAC schema, CSP/rate-limit/WAF), tech stack, and the consolidated data dictionary. Several spec items are infra/config-level and not yet in code (PostHog wiring, CSP/rate-limit/WAF, i18n subpath routing + hreflang, Service Worker/PWA offline cache) — captured as gaps.

#### FR-SYS-01 — Dynamic XML sitemap generation with 15-minute news cadence
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Crawler
**Trigger:** Crawler requests `/sitemap.xml` (revalidate 900s). · **Preconditions:** Published articles + pillar taxonomy; `siteOrigin()` resolves to www.
**Behavior:** 1. Resolve origin. 2. Fetch pillars + sitemap articles in parallel. 3. Emit home (priority 1.0, hourly). 4. Emit each pillar `/{slug}` (0.8, hourly). 5. Emit `/{slug}/page/{n>=2}` (0.4, daily) from totalDocs/page size. 6. Emit `/article/{slug}` (0.6, daily, lastModified=updatedAt). 7. Emit fixed STATIC_ROUTES (0.3, monthly). 8. Omit disallowed routes (/search, /account*, /admin*, /api/*, /preview, /exit-preview, /reset-password) and the /dashboards/funding duplicate.
**Business Rules:** BR-SYS-01, BR-SYS-08
**Acceptance Criteria:**
- A newly published article appears within ~15 min with lastModified=updatedAt.
- A new CMS pillar appears without a deploy.
- No disallowed paths appear in the sitemap.
**Source:** HỆ THỐNG rows 5, 10. · **Implementation:** `app/sitemap.ts:8`; `lib/metadata.ts:siteOrigin`.

#### FR-SYS-02 — robots.txt with crawl-allow/deny rules and sitemap pointer
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Crawler
**Trigger:** Crawler requests `/robots.txt`. · **Preconditions:** `siteOrigin()` resolves.
**Behavior:** 1. `userAgent '*'` allow '/'. 2. Disallow /admin, /account, /search, /reset-password, /preview, /exit-preview, /api. 3. Advertise `{origin}/sitemap.xml`. 4. Do NOT disallow /asia (301→/latest) or /r/[token].
**Business Rules:** BR-SYS-08
**Acceptance Criteria:**
- The disallow list contains the private/interactive routes and the sitemap line points at `{origin}/sitemap.xml`.
- /asia is not disallowed so its 301 stays crawlable.
**Source:** HỆ THỐNG row 5. · **Implementation:** `app/robots.ts`.

#### FR-SYS-03 — PWA web app manifest for install / Add-to-Home-Screen
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Install agent
**Trigger:** Browser evaluates installability / user chooses Install. · **Preconditions:** Icon PNGs present.
**Behavior:** 1. name/short_name "DailyTechWire", description "Tech Intelligence, Wired Daily." 2. start_url '/', display 'standalone'. 3. background_color #FDFCF8, theme_color #1B2A52. 4. icons 192 (any), 512 (any), 512 maskable.
**Business Rules:** BR-SYS-09
**Acceptance Criteria:**
- The manifest presents name, standalone display, and a 192/512/maskable icon set.
- Splash background_color #FDFCF8, theme_color #1B2A52.
**Source:** HỆ THỐNG row 3. · **Implementation:** `app/manifest.ts`.

#### FR-SYS-04 — Per-page SEO / social metadata, canonical, and feed autodiscovery helper
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Crawler
**Trigger:** A route module calls `buildMetadata()`. · **Preconditions:** `metadataBase` set in root layout.
**Behavior:** 1. Default image to DEFAULT_OG_IMAGE (/og-default.png, 1200×630). 2. `alternates.canonical = canonicalPath` (metadataBase-resolved). 3. Always include `/rss.xml` in `alternates.types` atom; append page feed when provided. 4. type 'article' → OpenGraph article with publishedTime, modifiedTime, authors, section. 5. Leave `alternates.languages` (hreflang) unpopulated until i18n subpath routing ships.
**Business Rules:** BR-SYS-02, BR-SYS-11
**Acceptance Criteria:**
- An article page canonical resolves against the www origin; og:type='article' with published/modified time and section.
- The `<head>` always advertises the sitewide `/rss.xml` link even after overriding alternates.
- No image argument → OG/Twitter use /og-default.png at 1200×630.
**Source:** HỆ THỐNG row 5. · **Implementation:** `lib/metadata.ts:buildMetadata`; `app/layout.tsx:34`.

#### FR-SYS-05 — NewsArticle JSON-LD structured data with safe script serialization
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Crawler
**Trigger:** Article page renders its JSON-LD script. · **Preconditions:** Article has title, dek, canonical URL, image, dates, author.
**Behavior:** 1. Build primary author Person (optional jobTitle) + co-author nodes. 2. image `[{url,width,height}]` when dims known else `[url]`. 3. publisher = shared APCG ORGANIZATION node (no invented foundingDate/sameAs). 4. `mainEntityOfPage @id = canonicalUrl`. 5. Serialize via `toJsonLdScript()` escaping every '<' → `<` before `dangerouslySetInnerHTML`.
**Business Rules:** BR-SYS-03, BR-SYS-10
**Acceptance Criteria:**
- JSON-LD `@type` is NewsArticle with publisher Organization "Asia Press Centre Group (APCG)".
- A title containing `</script>` is escaped so the tag cannot be broken out of.
- One author → single Person; co-authors → array of Person nodes.
**Source:** HỆ THỐNG row 5. · **Implementation:** `lib/metadata.ts:buildArticleJsonLd,toJsonLdScript,ORGANIZATION`.

#### FR-SYS-06 — Atom 1.0 feeds — sitewide and per-pillar — auto-generated from CMS
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Feed aggregator
**Trigger:** Aggregator polls `/rss.xml` or `/{pillar}/rss.xml` (revalidate 300). · **Preconditions:** Published articles; pillar slug valid.
**Behavior:** 1. Sitewide: `getFeedArticles()` → `buildAtomFeed` title "DailyTechWire". 2. Per-pillar: resolve slug; 404 if not found; 'latest' uses null filter. 3. Each entry: title, immutable `tag:` URI id (`tag:{host},2026:article/{numericId}`), alternate link, published, updated, summary=dek, author, pillar category. 4. sponsored → title prefix "Paid Partner · " + `<category term=sponsored label="Paid Partner">`. 5. XML-escape + strip control chars via `xmlEscape()`. 6. `atomResponse()` sets `application/atom+xml`. 7. `generateStaticParams` returns [].
**Business Rules:** BR-SYS-04, BR-SYS-05, BR-SYS-08
**Acceptance Criteria:**
- A slug edit keeps the atom:id (tag: URI on numeric id) unchanged (no duplicate "new" item).
- A sponsored article's feed title starts "Paid Partner · " with a sponsored category.
- An unknown pillar slug returns 404 (not an empty feed).
- A CMS title with a C0 control char is stripped so the feed stays valid XML.
**Source:** HỆ THỐNG rows 5, 10. · **Implementation:** `app/rss.xml/route.ts`; `[pillar]/rss.xml/route.ts`; `lib/feed.ts:buildAtomFeed,xmlEscape`.

#### FR-SYS-07 — llms.txt AI-search discovery document
**Priority:** Should · **Phase:** Phase 1 · **Actor:** AI-search crawler
**Trigger:** Crawler requests `/llms.txt` (revalidate 3600). · **Preconditions:** Pillars exist.
**Behavior:** 1. `getPillars()`, sort by order, render "- {title.en||slug}: {origin}/{slug}{ — description}". 2. Emit publication blurb naming APCG (Singapore, founded 2023, global with Asian vantage point). 3. List feeds `{origin}/rss.xml` and per-section. 4. List About + Editorial Standards. 5. `text/plain; charset=utf-8`.
**Business Rules:** BR-SYS-06, BR-SYS-08
**Acceptance Criteria:**
- A new pillar with a description appears with its description + URL within the hour.
- The blurb describes DTW as global with an Asian vantage point and names APCG (invariant #14).
**Source:** HỆ THỐNG row 5. · **Implementation:** `app/llms.txt/route.ts`.

#### FR-SYS-08 — Cookie consent banner (dismiss-only, no dark pattern)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Page load when `dtw-cookies !== '1'`. · **Preconditions:** No non-essential tracking active.
**Behavior:** 1. On mount, `dtw-cookies==='1'` → nothing; else `setTimeout 1200ms` then show. 2. Render icon+COOKIES label / message / Decline + Accept in a single ≤920px bar. 3. Localize EN/VI/ID. 4. Both buttons invoke `dismiss()`: hide and set `dtw-cookies='1'`.
**Business Rules:** BR-SYS-07, BR-SYS-12, BR-SYS-17
**Acceptance Criteria:**
- A first-time visitor sees the banner after 1.2s with Decline visually equal to Accept.
- Either button stores `dtw-cookies='1'` and suppresses the banner on future visits.
- Dismiss-only is valid only while no non-essential tracking ships (binding constraint on adding PostHog).
**Source:** HỆ THỐNG row 9. · **Implementation:** `cookie-banner.tsx`; `process/context/infra/all-infra.md`.

#### FR-SYS-09 — Authentication schema & 5-role RBAC (Better-Auth on Drizzle)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Better-Auth
**Trigger:** User signs up / signs in; Engine authenticates as Author. · **Preconditions:** Migration 0000 applied.
**Behavior:** 1. `auth_users`: id, name, email (unique), emailVerified, image, role enum default reader, 2FA columns, timestamps. 2. `auth_sessions`: token (unique), userId FK cascade, expiresAt, ip/userAgent. 3. `auth_accounts`: `(providerId, accountId)` unique for OAuth; optional password. 4. `auth_verifications`: single-use short-lived tokens. 5. New users default 'reader'; 2FA required (auth layer) for editor/admin.
**Business Rules:** BR-SYS-13, BR-SYS-14
**Acceptance Criteria:**
- A new signup defaults role 'reader'.
- Exactly reader/pro/author/editor/admin are valid role values.
- A session insert has a unique token; userId FK cascades on user delete.
**Source:** HỆ THỐNG row 9; CÔNG NGHỆ row 8. · **Implementation:** `packages/db/src/schema/auth.ts`; `packages/db/migrations/0000_third_ender_wiggin.sql`.

#### FR-SYS-10 — Per-user reader-data tables (bookmarks, queue, history, follows)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Reader
**Trigger:** Reader saves/queues/reads/follows. · **Preconditions:** User authenticated.
**Behavior:** 1. `bookmarks`: unique (userId, articleId), savedAt. 2. `reading_queue`: unique (userId, articleId), position, addedAt. 3. `reading_history`: unique (userId, articleId), readAt, scrollDepth default 0. 4. `follows`: unique (userId, pillarId), followedAt. 5. All userId FKs ON DELETE cascade. article_id/pillar_id reference Payload-owned tables by value.
**Business Rules:** BR-SYS-15, BR-SYS-16
**Acceptance Criteria:**
- A user deletion cascade-removes their bookmarks, queue, history, and follows.
- `reading_history.scrollDepth` is per (user, article), app-constrained 0–100.
- A second bookmark insert for the same (user, article) is rejected by the unique index.
**Source:** HỆ THỐNG rows 3, 9. · **Implementation:** `packages/db/src/schema/account.ts`.

#### FR-SYS-11 — Anonymous aggregate article view counter (Most Read data, consent-free)
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** A reader views an article (deduped client-side). · **Preconditions:** None (no identity required).
**Behavior:** 1. Upsert increment keyed on unique (article_id, Asia/Singapore day), storing NO visitor identifier. 2. day matches PUBLICATION_TZ. 3. Read path: range scan on day index + GROUP BY over trailing window. 4. Store no user id, cookie id, or IP.
**Business Rules:** BR-SYS-18
**Acceptance Criteria:**
- Repeated views from one browser same day increment at most once (client dedupe).
- No column identifies a visitor → no consent gate required.
- The day bucket rolls over uniformly at midnight Asia/Singapore.
**Source:** HỆ THỐNG row 8. · **Implementation:** `packages/db/src/schema/analytics.ts`; `packages/db/migrations/0001_stormy_gabe_jones.sql`.

#### FR-SYS-12 — Newsletter subscription storage with double opt-in confirmation
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader submits email + newsletters; confirms via emailed token. · **Preconditions:** Resend configured.
**Behavior:** 1. Insert `pending_newsletter_confirmations` (token, email, newsletterIds[], expiresAt). 2. On confirm-link click, create `newsletter_subscriptions` rows (confirmedAt) and clear the pending token. 3. Link userId on later sign-in (ON DELETE set null keeps guest subs). 4. Unique (email, newsletter_id) prevents duplicates. (Shipped path currently single opt-in — see FR-NL-03/04.)
**Business Rules:** BR-SYS-19
**Acceptance Criteria:**
- An unconfirmed signup has no `newsletter_subscriptions` row until the token is confirmed (target).
- A confirmed subscription + later sign-in can link userId without duplicating.
- The same (email, newsletter_id) twice is prevented by the unique index.
**Source:** LUỒNG CHÍNH row 3. · **Implementation:** `packages/db/src/schema/account.ts:newsletterSubscriptions,pendingNewsletterConfirmations`.

#### FR-SYS-13 — Content Engine provenance fields on Articles
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Content Engine
**Trigger:** Engine creates/updates an article via Payload API. · **Preconditions:** Migration applied; both `articles` and `_articles_v` have the columns.
**Behavior:** 1. Add `engine_source_url`, `engine_source_name` to `articles`. 2. Mirror into `_articles_v` (version_ prefix) because drafts are enabled. 3. Provenance surfaces alongside `origin='engine'|'manual'`.
**Business Rules:** BR-SYS-20, BR-SYS-21
**Acceptance Criteria:**
- Both `articles` and `_articles_v` carry the engine source columns.
- An Engine-authored article records `engine_source_url/name` and origin marks it 'engine'.
**Source:** HỆ THỐNG row 11. · **Implementation:** `payload/migrations/20260605_000000_engine_provenance.ts`.

#### FR-SYS-14 — CMS-configurable paywall threshold (paywall_settings global)
**Priority:** Must · **Phase:** Phase 1 · **Actor:** Admin
**Trigger:** Admin edits the paywall threshold; readers cross the meter. · **Preconditions:** Migration applied.
**Behavior:** 1. Store `paywall_threshold` (numeric, default 3) in the `paywall_settings` global (invariant #4). 2. Read at request time; fall back to 3 if unavailable. 3. Enforce a soft block (meter) with a sign-in nudge after ≥ threshold reads.
**Business Rules:** BR-SYS-22
**Acceptance Criteria:**
- Changing the threshold from 3 to 5 applies immediately with no deploy.
- The paywall never blocks mid-article — only a sign-in nudge after the threshold.
**Source:** LUỒNG CHÍNH row 2; HỆ THỐNG row 10. · **Implementation:** `payload/migrations/20260706_022942_add_paywall_settings_global.ts`.

#### FR-SYS-15 — Locale-aware chrome i18n and relative-time formatting
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader switches language / views a timestamp. · **Preconditions:** I18nProvider mounted.
**Behavior:** 1. Lang ∈ en|vi|id; hydrate from `dtw-lang` after mount. 2. `t(en, vi, id)` returns the active-language chrome string. 3. `fmtTimeAgo` clamps future/invalid diffs to "just now"; else Ns/Nm/Nh/Nd ago. 4. Article body text is not translated.
**Business Rules:** BR-SYS-23, BR-SYS-24
**Acceptance Criteria:**
- A slightly-future publishedAt (noon-UTC pick) renders "just now", not negative.
- Switching to VI localizes chrome while the article body stays source-language.
- A reload restores the chosen language via `dtw-lang`.
**Source:** HỆ THỐNG row 4. · **Implementation:** `lib/format.ts`; `lib/i18n.tsx`.

#### FR-SYS-16 — Site-wide dark mode toggle with persisted preference
**Priority:** Should · **Phase:** Phase 1 · **Actor:** Guest
**Trigger:** Reader clicks the dark-mode toggle. · **Preconditions:** Theme tokens in globals.css.
**Behavior:** 1. Toggle sets `html[data-theme='dark'|'light']` and persists to localStorage. 2. Apply dark bg #0F172A, text #E2E8F0 (invariant #7). 3. Components reference `var(--…)`/color-mix, never hardcoded rgba.
**Business Rules:** BR-SYS-25
**Acceptance Criteria:**
- A reload after enabling dark mode persists the preference.
- Dark mode uses #0F172A background and #E2E8F0 text (not pure black/white).
**Source:** HỆ THỐNG row 6. · **Implementation:** `lib/i18n.tsx` (provider pattern); `process/context/uxui/all-uxui.md`.

---

## 4. Business Rules Catalog

All business rules from the code-grounded findings, most-severe first within each module group. Related FRs link back to Section 3.

### 4.1 Navigation & Chrome (BR-NAV)

| ID | Rule statement | Rationale | Related FRs | Source |
|---|---|---|---|---|
| BR-NAV-01 | Reader chrome (header/footer/providers/modals) wraps only non-admin routes; Payload's `/admin` tree never instantiates I18n/Theme/Shell providers. | Isolates CMS admin from reader state; avoids double-instantiation. | FR-NAV-01, FR-NAV-16 | layout composition |
| BR-NAV-02 | The brand mark is the 2026-06-14 lockup (navy DTW monogram + `dailytechwire` wordmark + terracotta pulse-dot); tagline "Tech Intelligence, Wired Daily". | Invariant #11 amended — logo mark reintroduced. | FR-NAV-02 | MENU/HEADER 1 |
| BR-NAV-03 | Search returns only published articles, at most 8 overlay suggestions, debounced 200ms. | Prevents leaking drafts; keeps instant-search responsive. | FR-NAV-04 | MENU/HEADER 2; SEARCH 1 |
| BR-NAV-04 | Pillars are CMS entities (never hardcoded); nav/routes/sitemap regenerate within ~5 min of a CMS write without deploy. | Invariant #8. | FR-NAV-05 | MENU/HEADER 3 |
| BR-NAV-05 | Only shippable nav destinations are exposed; Dashboards/Newsletters/Pro withheld until pipelines complete (2026-07-17). | Avoid advertising undeliverable features. | FR-NAV-06 | MENU/HEADER 3 |
| BR-NAV-06 | Displayed role is one of Reader/Pro/Author/Editor/Admin; header capitalizes the lowercase auth enum for display only; server comparisons use lowercase. | Single bridge point prevents role-casing drift. | FR-NAV-07 | MENU/HEADER 5 |
| BR-NAV-07 | Sign-out is performed via `authClient.signOut()`; no ad-hoc session mutation in the header. | Centralizes session lifecycle. | FR-NAV-07 | MENU/HEADER 5 |
| BR-NAV-08 | Header height is measured at runtime (ResizeObserver → `--header-h`); never hardcoded. | Fluid header; avoids CLS and one-screen-fit bugs. | FR-NAV-01, FR-NAV-09 | MENU/HEADER 3 |
| BR-NAV-09 | A NAV_EXTRA item renders a PRO badge only when its `badge` flag is true. | Distinguishes gated Pro destinations. | FR-NAV-06 | MENU/HEADER 3 |
| BR-NAV-10 | Theme is persisted (localStorage `dtw-theme`), defaults to OS preference; dark uses #0F172A/#E2E8F0 via CSS variables; never hardcode rgba. | Invariant #7 + dark-mode color discipline. | FR-NAV-08 | MENU/HEADER 6 |
| BR-NAV-11 | The free-read threshold that triggers the nudge is CMS-configurable (`paywallSettings`, default 3); never hardcoded. | Invariant #4. | FR-NAV-10 | MENU/HEADER 5; inv #4 |
| BR-NAV-12 | The paywall is a soft block: the nudge never blocks mid-article; meter-fetch failures fail open. | Invariant #4. | FR-NAV-10 | inv #4 |
| BR-NAV-13 | Displayed dates are pinned to Asia/Singapore and formatted client-side to avoid SSR/CSR hydration mismatch. | Publication home timezone; prevents hydration errors. | FR-NAV-11 | MENU/HEADER top strip |
| BR-NAV-14 | Year-1 chrome languages are en/vi/id with English fallback; the visible switcher is disabled (English-only, 2026-07-17) but i18n plumbing stays. | Invariant #9. | FR-NAV-11, FR-NAV-12 | FOOTER 4; inv #9 |
| BR-NAV-15 | Only chrome strings are translated; article body stays in source language. | Invariant #10. | FR-NAV-12 | inv #10 |
| BR-NAV-16 | Footer links use CSS logical properties and localized labels; trust/editorial links resolve to `/trust/*`. | RTL readiness + consistent trust routing. | FR-NAV-13 | FOOTER 1,5 |
| BR-NAV-17 | A social/contact icon renders only when a real href is configured; entries without a URL are hidden. | Avoids dead/placeholder social links. | FR-NAV-14 | FOOTER 2 |
| BR-NAV-18 | Footer attribution is fixed: "© 2026 Dailytechwire · Singapore · Member, Trust Project" with GDPR · PDPA (SG). | Invariant #12. | FR-NAV-15 | FOOTER 5; inv #12 |
| BR-NAV-19 | Newsletter Subscribe CTAs stay hidden until a real sending pipeline exists; subscriptions may be captured but nothing is mailed in Phase 1. | Prevents promising an undeliverable newsletter. | FR-NAV-18 | MENU/HEADER 4; FOOTER 3 |

### 4.2 Homepage (BR-HOME)

| ID | Rule statement | Rationale | Related FRs | Source |
|---|---|---|---|---|
| BR-HOME-01 | Homepage is static ISR (`revalidate=60`) plus afterChange cache-tag invalidation; only Wire Drops carries a shorter 30s contract. | Instant load with fresh content within a minute of publish. | FR-HOME-01 | HOMEPAGE 15 |
| BR-HOME-02 | The hero lead is the editor-pinned article if one exists, else the newest published non-sponsored article. | Editor control with a self-maintaining default. | FR-HOME-02 | HOMEPAGE 2 |
| BR-HOME-03 | Sponsored articles are excluded from the hero pool (lead and aside). | Editorial firewall — paid placement never occupies the primary slot. | FR-HOME-02 | inv #5/#6; HOMEPAGE 10 |
| BR-HOME-04 | Pillars, colors, icons, labels, and order are CMS entities; adding/reordering changes the homepage without deploy. | Invariant #8. | FR-HOME-03 | HOMEPAGE 5 |
| BR-HOME-05 | Most Read conveys ranking by card order alone; rank numerals are prohibited (removed 2026-07-27). | Product decision — numerals added noise. | FR-HOME-04 | HOMEPAGE 6 |
| BR-HOME-06 | Sponsored stories are counted in the view counter but never appear in Most Read editorial ranking. | Refusal to launder paid placement into an editorial list. | FR-HOME-04, FR-HOME-16 | HOMEPAGE 6/10 |
| BR-HOME-07 | The Year-1 Awards banner shows only the inaugural "coming soon" state — no winners, no categories, single CTA. | Invariant #13. | FR-HOME-05 | HOMEPAGE 9 |
| BR-HOME-08 | The homepage route omits its own page title so the tab inherits the root brand default. | Avoids "DailyTechWire – DailyTechWire". | FR-HOME-01 | HOMEPAGE 1/2 |
| BR-HOME-09 | The Brief band's vertical dividers span only 22%–78% of column height. | Deliberate design decision. | FR-HOME-06 | HOMEPAGE 3 |
| BR-HOME-10 | Wire Drops displays only real editor-posted dispatches; no fabricated/auto-generated news may be injected. | A newsroom must never display news no human wrote. | FR-HOME-07 | HOMEPAGE 4 |
| BR-HOME-11 | Wire drop text is ≤150 chars per spec, capped at 200 server-side. | Short-form dispatch constraint. | FR-HOME-07 | HOMEPAGE 4 |
| BR-HOME-12 | The funding dashboard teaser must display a "not investment advice" disclaimer. | Compliance for financial-data presentation. | FR-HOME-08 | HOMEPAGE 7 |
| BR-HOME-13 | Deep Dive features the single published article `deepDive=true` (newest wins); renders null when none. | Single editor-controlled slot. | FR-HOME-09 | HOMEPAGE 8 |
| BR-HOME-14 | Sponsored content is labelled ("Paid Partner Content · DTW Studio Presents") on mustard #FEF3C7, with a non-dismissible newsroom-not-involved disclaimer; never styled to blend. | Invariants #5/#6/#7. | FR-HOME-10 | HOMEPAGE 10 |
| BR-HOME-15 | Affiliate review links carry a visible disclosure (icon + tooltip) and route through the `/r/[token]` redirect tracker. | Transparent affiliate disclosure; commission attribution. | FR-HOME-11 | HOMEPAGE 11 |
| BR-HOME-16 | The homepage newsletter CTA subscribes to the flagship `am` newsletter; full opt-in/double-opt-in owned by the newsletters module. | Single-tap flagship capture. | FR-HOME-13 | HOMEPAGE 13 |
| BR-HOME-17 | Homepage band visibility is controlled by compile-time `SHOW_*` flags (not CMS toggles); restoring a band keeps its data-fetch code. | 2026-07-17 product request; reversible with minimal edits. | FR-HOME-14 | HOMEPAGE 3,4,7,8,11,12,13 |
| BR-HOME-18 | Only homepage chrome is localized (en/vi/id); article titles/deks/bodies stay source-language. | Invariant #10. | FR-HOME-15 | inv #9/#10 |
| BR-HOME-19 | The anonymous view counter stores no reader identity — only +1 against (article, day) — and fires for signed-out readers too. | First-party, privacy-preserving aggregate (inv #12). | FR-HOME-16 | HOMEPAGE 6 |

### 4.3 Article & Paywall (BR-01 … BR-23)

| ID | Rule statement | Rationale | Related FRs | Source |
|---|---|---|---|---|
| BR-01 | Article and related reads are filtered to `_status=published`; unpublished content is never served except via authenticated draft mode. | Only Engine-approved published editorial appears. | FR-ART-01, FR-ART-09 | LUỒNG CHÍNH 1 |
| BR-02 | Article routes use empty `generateStaticParams` with revalidate=60; per-user/per-visit state is never read/written in the cached RSC — done client-side after hydration. | A cached RSC would leak/duplicate per-user state. | FR-ART-01, FR-ART-10 | HỆ THỐNG 1 |
| BR-03 | Sponsored disclosure boxes appear top+middle+bottom and can never be dismissed (the `DisclosureBox` primitive has no close control). | Invariant #5. | FR-ART-04, FR-ART-05 | ARTICLE 4 |
| BR-04 | The body is split at `ceil(children/2)` so the middle disclosure sits between two independently valid Lexical states. | Guarantees a mid-article disclosure without corrupting rendering. | FR-ART-04 | ARTICLE 4 |
| BR-05 | `aiAssisted` is retained and set by the Engine, but the inline AI disclosure box and AI-ASSISTED badge are NOT rendered (removed 2026-06-05). | Invariant #5 — inline disclosure withdrawn while the field remains. | FR-ART-06 | ARTICLE 4 |
| BR-06 | Affiliate articles must display a disclosure block stating DTW earns commission, does not let manufacturers approve reviews, and does not accept review units for coverage. | Editorial affiliate separation. | FR-ART-07 | HỆ THỐNG 12 |
| BR-07 | Draft/preview renders are non-indexable (noindex/nofollow) and emit no JSON-LD; JSON-LD NewsArticle only for published renders. | Drafts must not be treated as published NewsArticles. | FR-ART-10, FR-ART-12 | ARTICLE 1; HỆ THỐNG 5 |
| BR-08 | Pillars, pages and RSS feeds are validated against CMS pillar docs (not a hardcoded list); an unknown slug 404s; new/edited pillars take effect within the revalidate window with no redeploy. | Invariant #8. | FR-PIL-01..07 | PILLAR 1/5; HỆ THỐNG 10 |
| BR-09 | The `latest` slug is the all-beats firehose (no pillar filter) and is the only feed that honors a pinned lead, and only on page 1. | A pinned story deeper in the feed would be a duplicate. | FR-PIL-01 | PILLAR 2; HOMEPAGE |
| BR-10 | Article body stays in source language; only chrome (byline labels, badges, breadcrumb, disclosure copy, save/share, related header, paywall) is localized via `t(en,vi,id)` and dates via `fmtDateL`. | Invariant #10. | FR-ART-02 | HỆ THỐNG 4 |
| BR-11 | Saving a bookmark requires authentication: guests get the auth modal; only signed-in readers persist bookmarks. Saved state is resolved client-side, never in the cached RSC. | Bookmarks are per-user state; must not be cached. | FR-ART-08 | ARTICLE 7 |
| BR-12 | Pagination exposes real crawlable URLs: "Load more" is an `<a href>` to `/{pillar}/page/{n}`; `n` must be a plain integer ≥2; `/page/1` redirects to `/{pillar}`; a page past the feed end 404s. | Single canonical URL per page; finite crawlable archive. | FR-PIL-03, FR-PIL-04 | PILLAR 2/5 |
| BR-13 | Related "Read next" links chain backward through the same pillar (older, then wrap to newest), never re-showing the front page, always excluding the current article. | Builds a crawlable descent into the archive. | FR-ART-09 | ARTICLE 6 |
| BR-14 | The paywall threshold is stored only in the CMS `paywallSettings` global (min 1, default 3); the literal 3 is never hardcoded; only Editor/Admin may change it. | Invariant #4. | FR-PAY-01 | ARTICLE 8 |
| BR-15 | The paywall is a SOFT block: it never truncates or blocks the body; it surfaces a header nudge and an end-of-article sign-in card, only for unauthenticated readers. | Invariant #4 — Phase 1 nudge only. | FR-PAY-02..05 | ARTICLE 8; LUỒNG CHÍNH 2 |
| BR-16 | Guest and signed-in meters key their period to the Asia/Singapore calendar month (UTC+8, resets on the 1st), not the visitor's local timezone. | Every reader resets at the same instant. | FR-PAY-02, FR-PAY-03 | ARTICLE 8 |
| BR-17 | Sponsored articles are excluded from the paywall meter and never trigger the end-of-article paywall card. | Paid placement should not consume a reader's free quota. | FR-PAY-02, FR-PAY-05 | ARTICLE 8; HỆ THỐNG 12 |
| BR-18 | Signed-in readers are never gated by the meter in Phase 1; their count is a soft signal seeded from `reading_history`, failing open to 0. | Phase 1 is nudge-only; DB meter is future groundwork. | FR-PAY-03 | ARTICLE 8 |
| BR-19 | The nudge banner renders in-flow (pushes content down, no overlay/popup), is dismissible, and dismissal persists in `dtw-nudge-dismissed`. | Invariant #6 — no popups; respect dismissal. | FR-PAY-04 | ARTICLE 8 |
| BR-20 | When the paywall card is shown, the ShareBar is replaced by it; the full body is still rendered above the card. | Soft block — reading is never prevented. | FR-PAY-05 | ARTICLE 8 |
| BR-21 | The anonymous `article_views` counter stores no visitor identity — only +1 against (articleId, day) — and dedupes to at most one count per article per browser per SGT day. | First-party, privacy-preserving popularity signal. | FR-PAY-06 | HỆ THỐNG 8/11 |
| BR-22 | Sponsored views are counted in `article_views` but sponsored articles are excluded from the Most Read ranking. | Prevents laundering paid placement into a popularity list. | FR-PAY-06, FR-PAY-07 | HỆ THỐNG 11/12 |
| BR-23 | Most Read is a trailing 14-day window (not all-time) and fails open to an empty list on a young/unmigrated deploy. | An all-time list on a young archive freezes; caller fills remainder. | FR-PAY-07 | HOMEPAGE Most Read |

### 4.4 Dashboards (BR-DASH)

| ID | Rule statement | Rationale | Related FRs | Source |
|---|---|---|---|---|
| BR-DASH-01 | `/dashboards` resolves an unknown/missing/over-deep segment to the `funding` tab; only `funding` and `ai` are valid. | Deterministic default keeps the catch-all robust. | FR-DASH-01 | DASHBOARDS 1-2 |
| BR-DASH-02 | Tables sort numeric columns arithmetically and strings via `localeCompare`; the active column toggles direction, a new column resets to descending (price pill excepted). | Predictable reader-controlled ranking. | FR-DASH-02, FR-DASH-03, FR-DASH-07 | DASHBOARDS 1,2 |
| BR-DASH-03 | Null price/change values sort to the end and render as an em-dash, never 0. | Private companies have no ticker price; 0 would misrepresent. | FR-DASH-02 | DASHBOARDS 1 |
| BR-DASH-04 | CSV export contains exactly the currently filtered-and-sorted rows, generated fully client-side; null cells → empty strings. | Export must match what the reader sees. | FR-DASH-04 | DASHBOARDS 1 |
| BR-DASH-05 | Positive/zero change → green #10B981 upright ▲ with "+"; negative → red #EF4444 rotated ▲; both 2-decimal tabular. | Pinned brand colors (inv #7) + consistent formatting. | FR-DASH-05 | DASHBOARDS 1 |
| BR-DASH-06 | Dashboard charts use deterministic integer/pad math (no `Math.sin/cos`/random) so SSR and client hydration produce identical SVG. | Prevents React hydration mismatch. | FR-DASH-06 | DASHBOARDS 1 |
| BR-DASH-07 | Every sponsor slot is clearly labelled "Sponsor" on mustard `--sponsored`, and states sponsorship does not influence the data/methodology. | Editorial-integrity (inv #5–#7). | FR-DASH-01, FR-DASH-10 | DASHBOARDS 3 |
| BR-DASH-08 | The AI Leaderboard must NOT present a single composite/overall AI score; readers rank by individual dimensions. | A marketing "one number" is misleading. | FR-DASH-07, FR-DASH-08 | DASHBOARDS 2 |
| BR-DASH-09 | Each dashboard shows a methodology note describing sources and scoring, editor-editable via Payload DashboardSources (currently hardcoded). | Sourcing transparency underpins credibility. | FR-DASH-09 | DASHBOARDS 2 |
| BR-DASH-10 | Dashboards and the teaser carry a "For informational purposes only · not investment or procurement advice" disclaimer. | Legal/compliance guard. | FR-DASH-09, FR-DASH-12 | DASHBOARDS 1 |
| BR-DASH-11 | An empty sponsor slot renders nothing (no "your ad here") once wired to Payload SponsorSlots. | Avoids clutter when unsold. | FR-DASH-10 | DASHBOARDS 3 |
| BR-DASH-12 | Count-up stat tiles rest at their target value (not 0) so SSR/crawlers/no-JS/reduced-motion always see the correct number. | Correctness beats animation (trust bug). | FR-DASH-11, FR-DASH-12 | DASHBOARDS teaser |
| BR-DASH-13 | All dashboard chrome is localized via `t(en,vi,id)`; data values stay language-neutral. | Invariant #9/#10. | FR-DASH-13 | HỆ THỐNG 4 |
| BR-DASH-14 | When live feeds are wired, dashboard data flows through configured DashboardSources adapters (encrypted keys) — not scraped ad hoc. | Auditable provenance/refresh cadence (Engine-writes-via-API discipline). | FR-DASH-14 | DASHBOARDS 1/2 |

### 4.5 Search (BR-SRCH)

| ID | Rule statement | Rationale | Related FRs | Source |
|---|---|---|---|---|
| BR-SRCH-01 | The overlay is opened/closed exclusively through shared shell state; its query resets to empty on close. | Single source of truth; no stale queries on reopen. | FR-SRCH-01 | SEARCH 1; MENU/HEADER 2 |
| BR-SRCH-02 | Search input is debounced before hitting the server action (200ms overlay / 220ms page); empty/whitespace queries never search. | Protects p95 <300ms; avoids wasteful DB hits. | FR-SRCH-02, FR-SRCH-04 | SEARCH 1 |
| BR-SRCH-03 | Search returns only published articles; drafts/non-published are never surfaced. | Editorial integrity — no embargoed leaks. | FR-SRCH-02, FR-SRCH-04, FR-SRCH-08 | SEARCH 1/2 |
| BR-SRCH-04 | Pillar narrowing on the full page is client-side over the already-fetched capped result set (no re-query). | Instant facet interaction; result set is small (≤40). | FR-SRCH-05 | SEARCH 2 |
| BR-SRCH-05 | The overlay backdrop uses `color-mix(in oklab, var(--ink) 60%, transparent)` and CSS variables so dark mode adapts (no hardcoded rgba). | Theming invariant; prevents dark-mode contrast bug. | FR-SRCH-01 | uxui; inv #7 |
| BR-SRCH-06 | Enter in the overlay navigates to `/search` with the URL-encoded query; the full page reads its initial query from `?q=`. | Shareable/deep-linkable search URLs; overlay↔page continuity. | FR-SRCH-03, FR-SRCH-04 | MENU/HEADER 2 |
| BR-SRCH-07 | Both surfaces funnel through the single `runSearch` → `searchArticles()`; there is no second search code path. | Consistent results; eases the future Meilisearch swap. | FR-SRCH-08, FR-SRCH-10 | SEARCH 1/2 |
| BR-SRCH-08 | Only UI chrome is translated (en/vi/id); article titles/deks/bodies stay source-language. | Invariants #9/#10. | FR-SRCH-09 | SEARCH 1 |
| BR-SRCH-09 | When Meilisearch is adopted, the index is written ONLY by the Payload afterChange hook; the search module reads a read-only public key scoped to `articles_*`. | Invariant #1; browser keys must not grant write. | FR-SRCH-10 | integrations Meilisearch |
| BR-SRCH-10 | Zero-result queries must be captured (PostHog `search_zero_result`) so editors learn unmet demand; analytics is self-hosted first-party PostHog. | Editorial-discovery loop + inv #12. | FR-SRCH-12 | SEARCH 3 |

### 4.6 Newsletters (BR-NL)

| ID | Rule statement | Rationale | Related FRs | Source |
|---|---|---|---|---|
| BR-NL-01 | The newsletter catalog is CMS-driven: the six Y1 newsletters are Payload docs, never hardcoded. | Adding/editing a newsletter is a CMS write, not a deploy. | FR-NL-01, FR-NL-07 | NEWSLETTERS 1 |
| BR-NL-02 | Newsletters are segmented by pillar — six distinct products, not one lumped list. | Avoids the undifferentiated-newsletter mistake. | FR-NL-01 | NEWSLETTERS 1 |
| BR-NL-03 | The `/newsletters` picker defaults AM Brief + AI Weekly pre-selected, and the confirm action is disabled when zero are selected. | Sensible defaults; prevents an empty submit. | FR-NL-02 | NEWSLETTERS 2 |
| BR-NL-04 | SPEC MANDATE: newsletter signup must use double opt-in — a Resend confirmation email + click-to-confirm before activation. (Current code violates this — single opt-in.) | Deliverability + GDPR/PDPA/Nghị định 13 consent. | FR-NL-03, FR-NL-04, FR-NL-06 | NEWSLETTERS 2; LUỒNG CHÍNH 3 |
| BR-NL-05 | Subscription rows are uniquely keyed on (email, newsletter_id); a re-subscribe reactivates the existing row; concurrent duplicate inserts are benign successes. | The only unique index is (email, newsletter_id); claim-or-insert avoids duplicates/23505. | FR-NL-03, FR-NL-05 | NEWSLETTERS 2 |
| BR-NL-06 | On confirmation, segments are assigned by pillar; the newsletterId (am/pm/ai/fund/dev/prod) is the segment key. | Enables segment-by-pillar sending/analytics. | FR-NL-04 | LUỒNG CHÍNH 3 |
| BR-NL-07 | A Payload newsletter's `slug` is the sole (FK-less) linkage to Drizzle's `newsletter_id` and must be one of am/pm/ai/fund/dev/prod. | Payload and Drizzle share no FK; the slug is a hand-maintained contract. | FR-NL-01, FR-NL-07 | Newsletters.ts |
| BR-NL-08 | A signed-in subscribe needs no confirmation (verified session email); guest subscribes are the ones requiring double opt-in. | Verified emails are already consented. | FR-NL-03, FR-NL-05 | account-actions comment |
| BR-NL-09 | Unsubscribe is segment-scoped: unsubscribing from one newsletter must not unsubscribe from others. | Per-segment control (RFC 8058) + retention. | FR-NL-09, FR-NL-10 | feature _GUIDE |
| BR-NL-10 | Payload access: reading newsletters is public; create/update require editor/admin; delete requires admin. | Protects the catalog while rendering publicly. | FR-NL-07 | AUTH RBAC; Newsletters.ts |
| BR-NL-11 | Newsletter/transactional emails may hardcode hex color literals (the single sanctioned exception) because email clients cannot read CSS custom properties. | Email-client rendering constraint. | FR-NL-08 | email.ts |

### 4.7 Authentication & Account (BR-AUTH / BR-ACCT)

| ID | Rule statement | Rationale | Related FRs | Source |
|---|---|---|---|---|
| BR-AUTH-01 | Every new reader account is created with role 'reader'; role is an immutable additionalField at sign-up (input:false), stored as a Postgres enum. | Spec default role Reader; enforced at auth + DB. | FR-AUTH-01 | AUTH 2 |
| BR-AUTH-02 | Passwords must be at least 8 characters. | Enforced on every password input. | FR-AUTH-01,02,05 | AUTH 1-3 |
| BR-AUTH-03 | Email verification is mandatory before sign-in (`requireEmailVerification`); the verification email is sent exactly once on sign-up. | Prevents unverified sign-in and double-send. | FR-AUTH-02, FR-AUTH-03 | AUTH 2 |
| BR-AUTH-04 | Password-reset tokens are single-use and expire in 1 hour. | Limits reset-link replay. | FR-AUTH-04, FR-AUTH-05 | AUTH 3 |
| BR-AUTH-05 | A social-provider button is shown only when the same provider is registered server-side (client gate mirrors server env). | A visible button for an unregistered provider would 500. | FR-AUTH-06 | AUTH 1 |
| BR-AUTH-06 | Session cookies are httpOnly/secure/SameSite=Lax via the nextCookies plugin (last in the chain); `/api/auth` is force-dynamic. | Correct cookie handling; no caching of auth responses. | FR-AUTH-07, FR-AUTH-08 | AUTH 1 |
| BR-AUTH-07 | Email-send failures never roll back the surrounding auth flow; failures are caught, logged, and a resend is available. | A mail outage must not block sign-up. | FR-AUTH-01, FR-AUTH-03 | AUTH 2-3 |
| BR-AUTH-08 | Role comparisons use lowercase DB role strings ranked reader<pro<author<editor<admin via `roleAtLeast()`. | Prevents role-mismatch bugs. | FR-AUTH-07 | auth context |
| BR-AUTH-09 | Forgot-password responses are anti-enumeration: identical "if an account exists" message either way. | Prevents account enumeration. | FR-AUTH-04 | AUTH 3 |
| BR-AUTH-10 | The reset page requires a valid token and requires the new password and confirmation to match before any request. | Guards against tokenless access and mistyped passwords. | FR-AUTH-05 | AUTH 3 |
| BR-AUTH-11 | Sessions last 7 days and refresh at most once per day (updateAge 24h). | Balances security and re-auth friction. | FR-AUTH-07 | AUTH 1 |
| BR-AUTH-12 | Callback/redirect URLs are constructed only via `authCallbackUrl()`; no locale segment hardcoded. | Invariant #9 — locale lists must not be hardcoded. | FR-AUTH-09 | inv #9 |
| BR-ACCT-01 | `/account` is force-dynamic and does all per-user reads server-side after a session gate; never cached, to avoid leaking one reader's data to another. | Per-user private data must not enter a shared cache. | FR-ACCT-01, FR-ACCT-10 | ACCOUNT 1-4 |
| BR-ACCT-02 | A bookmark is unique per (user_id, article_id); toggling inserts or deletes that single row. | Enforced by the bookmarks unique index. | FR-ACCT-02 | ACCOUNT 1 |
| BR-ACCT-03 | Client-effect account reads (`isBookmarked`, `isSubscribed`) and `recordView` are guest-safe: they return/no-op without a session and never throw. | Called from client effects that may run before a session resolves. | FR-ACCT-02, FR-ACCT-03, FR-ACCT-05 | ACCOUNT 1-4 |
| BR-ACCT-04 | Reading history stores exactly one row per (user_id, article_id); each read upserts `readAt`, never a second row. | Fixes per-pageload counting; keeps the meter accurate. | FR-ACCT-03 | ACCOUNT 4; LUỒNG CHÍNH 2 |
| BR-ACCT-05 | Reading history is recorded for sponsored articles too (unlike the guest paywall meter). | History is a personalisation record, not an ad-count. | FR-ACCT-03 | ACCOUNT 4 |
| BR-ACCT-06 | Follows are pillar-only, keyed by CMS pillar slug; any CMS slug is accepted with no hardcoded enum. | Invariant #8. | FR-ACCT-04 | ACCOUNT 2; inv #8 |
| BR-ACCT-07 | Newsletter subs are unique per (email, newsletter_id); a signed-in toggle is keyed on user_id first, then claims a matching guest email row rather than inserting a duplicate. | Prevents orphaned email-keyed subs; respects the single unique index. | FR-ACCT-05, FR-ACCT-06 | ACCOUNT 3 |
| BR-ACCT-08 | When a saved/history article id no longer resolves to a published article, it is silently dropped from the UI while the row is retained. | Unpublished articles vanish from the UI without deleting user data. | FR-ACCT-01 | ACCOUNT 1,4 |
| BR-ACCT-09 | All account mutations are optimistic in the UI, then reconciled with `router.refresh()`. | Snappy UX with the server as source of truth. | FR-ACCT-02..05 | ACCOUNT 1-4 |
| BR-ACCT-10 | Changing password revokes all other sessions. | A password change should invalidate other devices. | FR-ACCT-07 | ACCOUNT 3 |
| BR-ACCT-11 | OAuth-only accounts (no password credential) handle `CREDENTIAL_ACCOUNT_NOT_FOUND` gracefully, not a crash. | Documented limitation for Google/GitHub-only accounts. | FR-ACCT-07 | ACCOUNT 3 |
| BR-ACCT-12 | Email changes are not applied until the new address confirms via link; the account keeps the current email until then. | Prevents lockout/hijack via unverified email change. | FR-ACCT-08 | ACCOUNT 3 |
| BR-ACCT-13 | Account deletion requires an explicit type-to-confirm ("DELETE"); an optional current password bypasses the 24h session-freshness requirement. | Deliberate destructive-action friction + GDPR/PDPA erasure. | FR-ACCT-09 | ACCOUNT 3; inv #12 |
| BR-ACCT-14 | Deleting a user cascades to bookmarks/reading_queue/reading_history/follows; `newsletter_subscriptions.user_id` is set NULL (email retained). | Right-to-erase of account-linked data; newsletter lifecycle separate. | FR-ACCT-09 | ACCOUNT 3; inv #12 |
| BR-ACCT-15 | Delete-account confirmation copy must be unambiguous in EN/VI/ID. | Compliance requirement (GDPR/PDPA right-to-erase). | FR-ACCT-09 | account guide |

### 4.8 CMS, RBAC & Taxonomy (BR-CMS)

| ID | Rule statement | Rationale | Related FRs | Source |
|---|---|---|---|---|
| BR-CMS-01 | The Payload admin is embedded at `/admin` and uses the Users collection as its auth collection; only author/editor/admin can log in. | Single-deploy editorial console sharing one DB and revalidation path. | FR-CMS-01 | CÔNG NGHỆ 3 |
| BR-CMS-02 | 2FA (TOTP) is mandatory for Editor and Admin, optional for Author; Reader/Pro are never offered it (enforced at the auth/middleware layer). | Privileged actions must be protected. | FR-CMS-01, FR-CMS-03 | MENU/HEADER 5 |
| BR-CMS-03 | Every content write MUST go through the Payload API so afterChange/afterDelete hooks fire (revalidation, indexing, OG, broadcast); direct SQL writes are forbidden. | Invariant #1 — the single revalidation path is the integrity guarantee. | FR-CMS-02, FR-CMS-18 | HỆ THỐNG 11 |
| BR-CMS-04 | Editorial identity (Payload Users) is stored separately from reader identity (Better-Auth); reader signup never inserts into Payload Users. | Payload owns editorial accounts without gating on unfinished auth. | FR-CMS-03, FR-CMS-04 | AUTH 2 |
| BR-CMS-05 | A user's role can only be changed by an admin (field-level write lock), even though users may update their own record. | Prevents author self-escalation via direct API write. | FR-CMS-03 | MENU/HEADER 5 |
| BR-CMS-06 | New editorial accounts default to 'author'; new reader accounts default to 'Reader'; Reader/Pro have no `/admin` access. | Least privilege by default. | FR-CMS-03, FR-CMS-04 | AUTH 2 |
| BR-CMS-07 | Pillars/Subsections/Tags are CMS entities; adding/editing a pillar regenerates routes/sitemap/RSS within ≤5 min with no redeploy. | Invariant #8. | FR-CMS-05 | HỆ THỐNG 10; PILLAR 5 |
| BR-CMS-08 | Taxonomy/directory create is allowed to any logged-in editorial user, update to editor/admin, delete to admin only. | Lets authors tag/attribute while protecting destructive changes. | FR-CMS-05, FR-CMS-06, FR-CMS-07 | HỆ THỐNG 10 |
| BR-CMS-09 | Every uploaded media asset must have alt text; media is image/* only, public, stored in R2 in deployed environments. | WCAG 2.1 AA + ephemeral-filesystem constraint. | FR-CMS-08 | ARTICLE 2; HỆ THỐNG 7 |
| BR-CMS-10 | An author may create articles and update only drafts whose linked Author.user equals their user; editors/admins any; only admins delete. | Scoped authorship without exposing others' work. | FR-CMS-09 | ARTICLE 1; MENU/HEADER 5 |
| BR-CMS-11 | Article body stays in the source language (not localised); only chrome and taxonomy titles are localised. | Invariant #10. | FR-CMS-09 | ARTICLE 3 |
| BR-CMS-12 | A sponsored article cannot be saved without a sponsor name; sponsored/aiAssisted flags drive non-dismissible disclosure boxes. | Invariant #5 — never publish "PAID PARTNER · undefined". | FR-CMS-10 | ARTICLE 4 |
| BR-CMS-13 | No popups and no mid-article ads; sponsored content uses a distinct label/background and empty sponsor slots render nothing. | Invariant #6. | FR-CMS-10, FR-CMS-13 | HỆ THỐNG 12; HOMEPAGE 10 |
| BR-CMS-14 | The Engine must never overwrite a field in lockedFields or a human-edited field; human always wins; skipped writes are logged. | Conflict-resolution invariant #2. | FR-CMS-11, FR-CMS-17 | HỆ THỐNG 11 |
| BR-CMS-15 | Every article carries origin ('engine'|'manual'), editedByHuman, lockedFields, and a monotonic version optimistic-lock counter; origin defaults 'manual', version 1. | Invariant #3 + optimistic-lock model. | FR-CMS-11 | HỆ THỐNG 11 |
| BR-CMS-16 | Reading Users requires a logged-in editorial user, but public read is allowed for content collections (the reader site consumes them). | Public reader site + private editorial identity. | FR-CMS-03 | MENU/HEADER 5 |
| BR-CMS-17 | publishedAt defaults to the exact creation instant (dayAndTime) so a story is never accidentally future-stamped. | Avoids the noon-UTC "time ago" negative bug. | FR-CMS-09 | ARTICLE 1 |
| BR-CMS-18 | version, editedByHuman, engineSourceUrl and engineSourceName are read-only in admin; version/editedByHuman are meant to be maintained by a beforeChange hook (Phase E4, not yet implemented). | Provenance integrity. | FR-CMS-11 | HỆ THỐNG 11 |
| BR-CMS-19 | Wire Drops auto-publish on insert (no drafts), are capped at 200 chars server-side (spec ≤150), and refresh the homepage via cache bust plus a future Soketi/Pusher broadcast. | Realtime band semantics. | FR-CMS-12 | HOMEPAGE 4 |
| BR-CMS-20 | Sponsor-slot config (SponsorSlots, AffiliateLinks, DashboardSources) is admin-only. | Commercial placements are Admin-controlled. | FR-CMS-13 | HỆ THỐNG 12; DASHBOARDS 3 |
| BR-CMS-21 | The corrections log is public and append-oriented; updates are permitted (correcting a correction) but deletes are admin-only. | Editorial transparency. | FR-CMS-14 | TRUST 3 |
| BR-CMS-22 | A Newsletter's `slug` is the sole linkage to Drizzle's `newsletter_id` and must match am/pm/ai/fund/dev/prod; there is no runtime FK, so changing it silently breaks subscribe/toggle. | Cross-system contract with no DB-enforced FK. | FR-CMS-15 | NEWSLETTERS 1 |
| BR-CMS-23 | The guest paywall threshold is a CMS-configurable number (default 3, min 1), never hardcoded; signed-in readers are never gated in Phase 1. | Invariant #4. | FR-CMS-16 | ARTICLE 8; LUỒNG CHÍNH 2 |
| BR-CMS-24 | EngineConflictLog is read-only via the API (create/update disabled); rows are hook-populated; only editors/admins read it. | Trustworthy audit trail. | FR-CMS-17 | HỆ THỐNG 11 |

### 4.9 Content Engine Integration (BR-ENG)

| ID | Rule statement | Rationale | Related FRs | Source |
|---|---|---|---|---|
| BR-ENG-01 | The intake endpoint is authenticated by a single shared bearer token compared in constant time; a missing token config returns 500, never a silent 200. | Service-to-service trust boundary; fail loud on misconfig. | FR-ENG-01 | HỆ THỐNG 11 |
| BR-ENG-02 | The intake endpoint uses the Payload Local API and intentionally bypasses Payload access control; the bearer token is the only trust boundary. | Local API runs server-side with no CMS user. | FR-ENG-01, FR-ENG-10 | HỆ THỐNG 11 |
| BR-ENG-03 | title, pillarSlug, and body_markdown are mandatory; every other field is derived or defaulted. | An article cannot render without title, pillar route, and body. | FR-ENG-02 | ARTICLE 1; HỆ THỐNG 11 |
| BR-ENG-04 | Intake is idempotent on engineSourceUrl: a re-POST of an ingested URL returns the existing id (200), not a duplicate. | The Engine may retry; duplicates corrupt the reader surface/index. | FR-ENG-03 | HỆ THỐNG 11 |
| BR-ENG-05 | pillarSlug must resolve to an existing CMS pillar; unknown pillars are rejected 422. The Engine never creates pillars. | Pillars are CMS-owned (inv #8). | FR-ENG-04 | HỆ THỐNG 10/11 |
| BR-ENG-06 | Every article requires an author; a blank byline is rejected 400. Missing tags/authors are auto-created (author default role 'Staff Writer', city 'Singapore'). | Author is required for byline + JSON-LD; find-or-create keeps ingestion unblocked. | FR-ENG-05 | ARTICLE 1; HỆ THỐNG 11 |
| BR-ENG-07 | Hero image ingestion is best-effort and never blocks publishing; on failure the article publishes without a hero (generative cover art). | Source images are unreliable; content must ship. | FR-ENG-06 | ARTICLE 2 |
| BR-ENG-08 | Every article carries origin ∈ {engine, manual} (required, default manual); Engine intake sets origin='engine'. | Provenance invariant #3. | FR-ENG-07, FR-ENG-09 | HỆ THỐNG 11 |
| BR-ENG-09 | editedByHuman defaults true for manual writes but is set false by Engine intake; read-only in admin, flips only via CMS edits (or a future explicit release). | Distinguishes machine from human writes (inv #2/#3). | FR-ENG-07, FR-ENG-09 | HỆ THỐNG 11 |
| BR-ENG-10 | lockedFields is the sacrosanct list of fields the Engine must never overwrite; editors control it; locks persist until explicitly released. | Prevents lost-update where a re-sync erases an editor's rewrite. | FR-ENG-07, FR-ENG-09, FR-ENG-12 | HỆ THỐNG 11 |
| BR-ENG-11 | All article side effects (ISR revalidation, search index, OG gen) flow through the single afterChange hook; bypassing it (raw SQL) is a P0 bug. | Guarantees Engine and editor writes produce identical downstream effects (inv #1). | FR-ENG-08 | HỆ THỐNG 11 |
| BR-ENG-12 | Revalidation is skipped (without error) when `context.disableRevalidate` is set or when called outside a request scope; the per-query revalidate window is the fallback. | Seed scripts/migrations run outside Next.js request scope. | FR-ENG-08, FR-ENG-13 | HỆ THỐNG 11 |
| BR-ENG-13 | Engine-ingested articles are created already PUBLISHED via the intake endpoint. | The Engine delivers approved, publish-ready articles. | FR-ENG-07 | HỆ THỐNG 11 |
| BR-ENG-14 | version is a monotonic optimistic-lock counter, default 1, read-only in admin, intended to bump on every write. | Optimistic locking against lost-updates (inv #2). | FR-ENG-09, FR-ENG-12 | HỆ THỐNG 11 |
| BR-ENG-15 | Article create is limited to author/editor/admin; delete is admin-only; read is public. | Editorial RBAC; readers never write. | FR-ENG-10 | MENU/HEADER 5; HỆ THỐNG 11 |
| BR-ENG-16 | Authors may update only articles whose linked Author.user equals the requesting user; editors/admins unrestricted. | Least-privilege: authors edit their own bylined drafts only. | FR-ENG-10 | MENU/HEADER 5 |
| BR-ENG-17 | EngineConflictLog is append-only from hooks: create/update disabled; editor/admin read; admin delete. | Audit integrity — reflects actual decisions. | FR-ENG-11 | HỆ THỐNG 11 |
| BR-ENG-18 | Each conflict-log row records reason ∈ {locked, human_edited, version_mismatch} with attempted engineValue and current currentValue. | Editorial leadership sees the nature/frequency of collisions. | FR-ENG-11 | HỆ THỐNG 11 |
| BR-ENG-19 | Human always wins on the same field: when Engine and a human touched the same field, the human value persists and the skip is logged. | Non-negotiable conflict-resolution invariant. | FR-ENG-12 | HỆ THỐNG 11; LUỒNG CHÍNH 1 |
| BR-ENG-20 | Engine updates are conditional on optimistic lock (If-Match:<version>); a 409 triggers refetch + retry, max 3, exponential backoff. | Prevents overwriting concurrent edits; avoids storming the API. | FR-ENG-12 | HỆ THỐNG 11 |
| BR-ENG-21 | The Engine never crawls or writes articles itself and never writes directly to Postgres; it only submits pre-approved articles via the API and returns reading behavior to analytics. | Inv #1; spec HỆ THỐNG 11. | FR-ENG-01, FR-ENG-07 | HỆ THỐNG 11 |
| BR-ENG-22 | The Engine cannot publish (only Editor/Admin flip published) except Wire Drops which auto-publish — but the intake endpoint publishes directly because it bypasses RBAC via the Local API (a divergence from the documented Author-role contract). | Documented permission model vs implemented intake path differ; recorded so not relitigated. | FR-ENG-07, FR-ENG-10 | HỆ THỐNG 11; LUỒNG CHÍNH 1 |

### 4.10 About & Trust (BR-TRUST)

| ID | Rule statement | Rationale | Related FRs | Source |
|---|---|---|---|---|
| BR-TRUST-01 | Sponsored (DTW Studio / "Paid Partner") articles carry a yellow (`--sponsored`) background and a disclosure at top, middle, and end that cannot be dismissed or turned off. | Editorial integrity (inv #5, #6). | FR-TRUST-07, FR-TRUST-14 | TRUST 5 |
| BR-TRUST-02 | Firm editorial firewall: DTW Studio is a separate team/budget; newsroom staff are never assigned to sponsored work; sponsors may pick a topic and check their own facts but not approve/edit copy, choose pull-quotes, mandate CTAs, or run beside newsroom stories. Buying ads never buys coverage. | Protects reader trust and independence. | FR-TRUST-07, FR-TRUST-13, FR-TRUST-14 | TRUST 5; Advertise/Studio |
| BR-TRUST-03 | The corrections log is public-read; create/update require editor/admin; delete requires admin. Corrections are append-only in practice and shown newest-first. | Public accountability with controlled write access. | FR-TRUST-05, FR-TRUST-08 | TRUST 3 |
| BR-TRUST-04 | The `/trust/[slug]` route is finite and code-defined; any unrecognised slug renders the editorial page rather than a 404. | Keeps the trust surface resilient; no dead-ends. | FR-TRUST-01 | TRUST 1-5 |
| BR-TRUST-05 | Dynamic trust/legal pages must supply `generateStaticParams` so they prerender and the revalidate window (300s trust) takes effect. | Static prerender + ISR is required for performance and revalidate. | FR-TRUST-01, FR-TRUST-17 | HỆ THỐNG |
| BR-TRUST-06 | On the navy `--banner` surface, all text/border colors must be fixed light values (never `var(--ink)`/`var(--paper)`, which would invert to invisible in dark mode). | Prevents the recurring dark-mode contrast bug. | FR-TRUST-02 | uxui |
| BR-TRUST-07 | About/EIC copy must not reintroduce fabricated/unverifiable claims (invented awards, Reuters/Pulitzer/Nieman history, named publications, tip-line/SecureDrop banners); they must stay removed on every surface. | No fake track record and no unkeepable promises (no shield law). | FR-TRUST-09, FR-TRUST-10 | _GUIDE |
| BR-TRUST-08 | DTW is a global publication; "Asia" appears only as the APCG proper noun, Asia-angle content, bureau/beat roles, or "…Asia and the world". The About/Newsroom hero and mission describe APCG (the Asian parent), not DTW's scope. | Global positioning invariant #14. | FR-TRUST-09, FR-TRUST-10, FR-TRUST-13, FR-TRUST-17 | inv #14 |
| BR-TRUST-09 | The AI-assisted INLINE disclosure was removed 2026-06-05; the `aiAssisted` field still exists and the Engine still sets it, but it is not surfaced inline. The `/trust/ai` copy still describes the removed label and is intentionally left unsynced — do not re-add AI badge UI. | Invariant #5 — the policy/UI mismatch is a tracked known gap. | FR-TRUST-04 | inv #5; TRUST 2 |
| BR-TRUST-10 | The Transparency Report is Phase 2, auto-generated quarterly; Year 1 is a static placeholder stating "First report drops Q1 2027". | Do not present computed figures before a full period exists. | FR-TRUST-06 | TRUST 4 |
| BR-TRUST-11 | Trust/legal chrome is translated (en/vi/id); editorial body translation is editor-approved only, never automatic LLM. Pending translations stay source-language with a notice. | Editorial copy belongs to the writer/editor. | FR-TRUST-19 | _GUIDE; inv #10 |
| BR-TRUST-12 | No tip-line, secure-contact banner, masked Signal number, or SecureDrop reference on any contact/trust surface — no infrastructure backs those claims and Singapore has no shield law. Contact routes to plain mailto only. | Same fabricated-track-record/unkeepable-promise category; removed 2026-07-16. | FR-TRUST-09, FR-TRUST-11, FR-TRUST-12 | _GUIDE |
| BR-TRUST-13 | The Awards Year-1 state shows only a "Launching next year / inaugural" placeholder — no medallion, no previous winners, no categories. | Year 1 is the inaugural year (inv #13). | FR-TRUST-15 | FOOTER 1; inv #13 |

### 4.11 Platform / System-wide (BR-SYS)

| ID | Rule statement | Rationale | Related FRs | Source |
|---|---|---|---|---|
| BR-SYS-01 | The XML sitemap is generated from live CMS taxonomy and published articles and refreshes on a ≤15-minute window without a code deploy. | News-sitemap cadence + CMS-driven routes (inv #8). | FR-SYS-01 | HỆ THỐNG 5 & 10 |
| BR-SYS-02 | Every canonical/OG/sitemap/feed URL resolves to the www host; the bare apex 301s to www. | Prevents duplicate-host indexing. | FR-SYS-04 | HỆ THỐNG 5 |
| BR-SYS-03 | Article structured data uses schema.org NewsArticle with Author (Person) and publisher Organization, optimized for Google and AI answer engines. | SEO + AI-search readiness. | FR-SYS-05 | HỆ THỐNG 5 |
| BR-SYS-04 | Feeds are Atom 1.0 and an entry's atom:id is an immutable `tag:` URI over the numeric article id, never the slug. | A slug edit must not resurface a story as a duplicate "new" item. | FR-SYS-06 | HỆ THỐNG 5 |
| BR-SYS-05 | Sponsored feed entries carry a visible "Paid Partner ·" title prefix plus a machine-readable sponsored category. | Newsroom/sponsored separation must survive off-site (inv #5). | FR-SYS-06 | HỆ THỐNG 12 |
| BR-SYS-06 | llms.txt is regenerated from live pillar taxonomy and describes DTW as global with an Asian vantage point, published by APCG. | AI-search discovery + global positioning (inv #14). | FR-SYS-07 | HỆ THỐNG 5 |
| BR-SYS-07 | The cookie consent layer contains no dark patterns: Decline is visually equal in weight to Accept. | GDPR/PDPA/Nghị định 13 compliance. | FR-SYS-08 | HỆ THỐNG 9 |
| BR-SYS-08 | Route/sitemap/RSS/llms.txt regeneration happens automatically on taxonomy change with no deploy (≤5 min RSS, ≤15 min sitemap). | Pillar/Sub-section/Tag are CMS entities (inv #8). | FR-SYS-01, FR-SYS-02, FR-SYS-06, FR-SYS-07 | HỆ THỐNG 10 |
| BR-SYS-09 | The PWA manifest theme/background colors use pinned brand tokens (#1B2A52 navy / #FDFCF8 paper). | Brand consistency on install splash/chrome. | FR-SYS-03 | HỆ THỐNG 3 |
| BR-SYS-10 | JSON-LD is serialized with every '<' escaped to `<` before injection into a script tag. | Editor-controlled title/dek could contain `</script>`; prevents breakout. | FR-SYS-05 | HỆ THỐNG 9 |
| BR-SYS-11 | hreflang / `alternates.languages` stays unpopulated until i18n subpath routing actually ships. | No locale routing exists yet; advertising hreflang for non-existent routes is wrong. | FR-SYS-04 | HỆ THỐNG 4 & 5 |
| BR-SYS-12 | Only essential cookies (auth, theme, locale) may be set; if any non-essential tracking ships, Decline must store a distinct value that gates non-essential cookies. | Binding compliance constraint (inv #12); current dismiss-only banner is valid only because no tracking ships. | FR-SYS-08 | HỆ THỐNG 9 |
| BR-SYS-13 | New users default to role 'reader'; the role enum is exactly reader/pro/author/editor/admin. | 5-role RBAC baseline; least privilege. | FR-SYS-09 | HỆ THỐNG 9; CÔNG NGHỆ 8 |
| BR-SYS-14 | 2FA (TOTP) is required for Editor and Admin, enforced at the Better-Auth layer. | Protect privileged editorial/admin access. | FR-SYS-09 | HỆ THỐNG 9 |
| BR-SYS-15 | All per-user reader-data rows cascade-delete with the user (right-to-erase). | GDPR/PDPA right-to-erasure. | FR-SYS-10 | HỆ THỐNG 9 |
| BR-SYS-16 | Reader-data tables reference Payload-owned articles/pillars by value (text columns), not Drizzle `.references()`, with app/DB-constraint-level integrity. | Drizzle does not own the Payload schema. | FR-SYS-10 | HỆ THỐNG 10 & 11 |
| BR-SYS-17 | No popups anywhere except the single cookie banner; no mid-article ads. | Editorial integrity (inv #6). | FR-SYS-08 | HỆ THỐNG 12 |
| BR-SYS-18 | `article_views` stores no visitor identifier of any kind (no user id, cookie, or IP); one row per (article, Asia/Singapore day). | Keeps it non-personal so no consent gate is needed; bounds growth. | FR-SYS-11 | HỆ THỐNG 8 |
| BR-SYS-19 | Newsletter subscriptions require double opt-in — a subscription row is created only after the emailed confirmation token is used. | Anti-spam and consent compliance. | FR-SYS-12 | LUỒNG CHÍNH 3 |
| BR-SYS-20 | The Content Engine writes articles only via the Payload API (never direct SQL) so afterChange hooks always fire. | Invariant #1. | FR-SYS-13 | HỆ THỐNG 11 |
| BR-SYS-21 | Provenance is required: every article carries origin ('engine'|'manual'); Engine writes obey lockedFields/editedByHuman + optimistic version lock, and a human edit always wins. | Prevents lost-update overwrites (inv #2/#3). | FR-SYS-13 | HỆ THỐNG 11 |
| BR-SYS-22 | The paywall free-read threshold must be CMS-configurable (default 3), never hardcoded, and the paywall is a soft block that never interrupts mid-article. | Invariant #4. | FR-SYS-14 | LUỒNG CHÍNH 2 |
| BR-SYS-23 | Only site chrome is translated (en/vi/id); article body stays source-language. | Invariant #10. | FR-SYS-15 | HỆ THỐNG 4 |
| BR-SYS-24 | Relative-time formatting must clamp future/invalid timestamps to "just now". | Payload date-only picks stamp noon-UTC (future local time). | FR-SYS-15 | HỆ THỐNG 4 |
| BR-SYS-25 | Dark mode uses #0F172A background / #E2E8F0 text (not pure black/white) and components read CSS variables, never hardcoded rgba. | Invariant #7 brand tokens; a real dark-mode adaptation bug. | FR-SYS-16 | HỆ THỐNG 6 |

---

## 5. Use Cases

Each use case: ID, Name, Primary Actor, Stakeholders, Preconditions, Main Success Scenario, Alternate Flows, Exception Flows, Postconditions. Bare-ID use cases (`UC-01`..) are preserved from the code-grounded Article/Paywall findings.

### UC-01 — Guest reads an article and hits the soft paywall
- **Primary Actor:** Guest
- **Stakeholders:** Reader (unobstructed reading), Editorial (conversion to sign-in), Compliance (no PII, soft block).
- **Preconditions:** No session; guest meter below threshold.
- **Main Success Scenario:**
  1. Guest opens `/article/{slug}`; the full article renders (header, hero, serif body, disclosures, related).
  2. On mount, `incrementRead` records a distinct read in the `dtw-read-count` cookie for the current SGT month (sponsored skipped).
  3. `claimViewCount` gates a one-per-day `recordArticleView` into `article_views`.
  4. Guest reads more articles until `articlesRead` reaches the CMS threshold.
  5. On the threshold-reaching article, the header shows the in-flow sign-in nudge and the end-of-article paywall card replaces the ShareBar.
  6. Guest clicks "Sign in — it's free →", opening the auth modal.
- **Alternate Flows:** Guest dismisses the nudge (×) → hidden and stays hidden (localStorage). · Threshold-reaching article is sponsored → no paywall card; ShareBar shows; read not metered.
- **Exception Flows:** Cookie malformed or month rolled over → meter resets to a fresh period. · `paywallSettings` missing → threshold falls back to 3.
- **Postconditions:** Guest meter reflects distinct monthly reads; the body was fully readable throughout; nudge/card state persisted.

### UC-02 — Signed-in reader reads and saves an article
- **Primary Actor:** Reader
- **Stakeholders:** Reader (bookmarks), Product (retention).
- **Preconditions:** Authenticated session.
- **Main Success Scenario:**
  1. On session establish, the guest cookie meter is cleared and `articlesRead` is seeded from `reading_history` (`getMyReadCount`).
  2. Reader opens an article; after hydration `recordView` persists the read and `isBookmarked` resolves saved state.
  3. Reader clicks Save; the button optimistically flips to Saved and `toggleBookmark` persists it.
  4. The reader is never gated by the meter (Phase 1).
- **Alternate Flows:** Reader clicks Share → native share sheet (or copy-link fallback).
- **Exception Flows:** `getMyReadCount` fails → count falls open to 0; `recordView` failure is swallowed.
- **Postconditions:** Read is in `reading_history`; bookmark persisted; no paywall surfaces.

### UC-03 — Reader browses a pillar and loads more
- **Primary Actor:** Guest / crawler
- **Stakeholders:** Reader (browsing), SEO (crawlable pagination).
- **Preconditions:** Pillar slug resolves to a CMS pillar doc (or `latest`).
- **Main Success Scenario:**
  1. `GET /{pillar}` renders the CMS-themed header, featured lead card, and a 24-card grid with a total-stories badge.
  2. Reader clicks "Load more"; JS intercepts and appends the next 24-item cursor batch, dedupes, and `replaceState`s the URL to `/{pillar}/page/{n}`.
  3. Reader continues appending until `hasMore` is false, then sees the "End of feed" note.
- **Alternate Flows:** JS disabled / crawler follows `<a href>` to `/{pillar}/page/{n}` as a full server render. · Reader opens the RSS link → `/{pillar}/rss.xml`.
- **Exception Flows:** Unknown pillar slug → 404. · Page number past the feed end → 404. · `loadArticlesAfter` throws → existing cards kept; link re-enables.
- **Postconditions:** Reader walked the pillar feed; crawlers have discrete indexable page URLs.

### UC-04 — Editor changes the free-read threshold
- **Primary Actor:** Editor/Admin
- **Stakeholders:** Product (conversion tuning), Readers (meter behavior).
- **Preconditions:** Editor/Admin logged into `/admin`.
- **Main Success Scenario:**
  1. Editor edits `paywallSettings.paywallThreshold` (e.g. 3→5) and saves.
  2. afterChange hook busts the `settings:paywall` tag.
  3. `getPaywallThreshold` returns the new value; the reader app gates nudge/card at the new threshold within the revalidate window.
- **Alternate Flows:** —
- **Exception Flows:** A non-Editor/Admin update is denied by the global's access rule.
- **Postconditions:** The new threshold governs the soft paywall without a code deploy.

### UC-NAV-01 — Guest performs an instant search from the header
- **Primary Actor:** Guest · **Stakeholders:** Reader (discovery), SEO/analytics.
- **Preconditions:** Reader page loaded; ShellProvider + SearchOverlay mounted.
- **Main Success Scenario:** 1. Guest presses ⌘K (or clicks the header search launcher). 2. Overlay opens and autofocuses the input. 3. Guest types a query. 4. After 200ms, `runSearch` returns published-article matches. 5. Up to 8 cards render. 6. Guest clicks a result → `/article/{slug}`; overlay closes.
- **Alternate Flows:** Enter instead of click → `/search?q={query}`. · Suggested pill click → query fills and results load.
- **Exception Flows:** `runSearch` throws → hits cleared, "No results yet…". · Escape/backdrop → overlay closes, no navigation.
- **Postconditions:** User is on the chosen article or the search results page.

### UC-NL-01 — Guest subscribes to newsletters with double opt-in (target) / immediate capture (current)
- **Primary Actor:** Guest · **Stakeholders:** Editorial (list growth), Compliance (consent), Deliverability.
- **Preconditions:** Payload `newsletters` seeded; guest not signed in.
- **Main Success Scenario (target, double opt-in):** 1. Guest opens `/newsletters`; the picker renders with AM Brief + AI Weekly pre-checked. 2. Guest toggles the newsletters they want; the count updates. 3. Guest enters an email and clicks Subscribe. 4. `subscribeGuest(email, selectedSlugs)` runs. 5. Server writes a `pending_newsletter_confirmations` row and sends a Resend confirmation email. 6. Guest clicks the confirm link; the confirm route activates the subscriptions and consumes the pending row.
- **Alternate Flows (current shipped behavior):** Instead of steps 5–6, the server inserts/reactivates `newsletter_subscriptions` rows with `confirmedAt=now()` immediately (single opt-in); the UI shows "Subscribed →" — a documented divergence from the double-opt-in mandate. · A signed-in reader instead sees a per-newsletter toggle. · Guest deselects all → Subscribe disabled.
- **Exception Flows:** Invalid email → `{ok:false}`, no rows. · DB unique violation on concurrent submit → swallowed as success.
- **Postconditions:** One `newsletter_subscriptions` row per selected newsletter exists for the email (active in the current single-opt-in path; pending until confirmed in the target path).

### UC-AUTH-01 — Guest signs up and verifies email
- **Primary Actor:** Guest · **Stakeholders:** Reader (account), Security (verified email).
- **Preconditions:** No session; email not registered.
- **Main Success Scenario:** 1. Guest opens the auth modal, switches to signup. 2. Enters name, email, password (≥8). 3. Submits; Better-Auth creates a reader account (`emailVerified=false`). 4. One verification email is sent; the modal shows the check-your-email notice. 5. Guest clicks the verification link → `emailVerified=true`, auto-signed-in.
- **Alternate Flows:** Email provider outage → account still created, error logged, guest can request resend.
- **Exception Flows:** Email already registered → "Could not create account."
- **Postconditions:** A verified reader account exists with a session.

### UC-AUTH-02 — Reader signs in with password or OAuth
- **Primary Actor:** Reader · **Stakeholders:** Reader (access), Security.
- **Preconditions:** Verified account (for password); provider configured (for OAuth). *(Note: magic-link is the spec's primary path but is NOT implemented — email+password is shipped.)*
- **Main Success Scenario:** 1. Open the modal (signin), enter email + password, optionally Remember me. 2. Submit → Better-Auth validates and sets a session cookie. 3. Modal closes; the header shows the user's name.
- **Alternate Flows:** OAuth instead: click Continue with Google/GitHub → provider flow → session (Google is the real provider; GitHub hidden by default; no Apple).
- **Exception Flows:** Wrong credentials → "Wrong email or password." · Unverified email → sign-in refused.
- **Postconditions:** An active 7-day session.

### UC-AUTH-03 — Reader resets a forgotten password
- **Primary Actor:** Reader · **Stakeholders:** Reader, Security (anti-enumeration).
- **Preconditions:** None (anti-enumeration).
- **Main Success Scenario:** 1. Open the modal (forgot), enter email, submit. 2. UI shows the identical "if an account exists" message. 3. If registered, a reset email with a 1h token sends. 4. Reader opens `/reset-password?token=…`, enters the new password twice. 5. `resetPassword` succeeds; success message + link home.
- **Alternate Flows:** No token in URL → instructional message, no form.
- **Exception Flows:** Passwords mismatch → local error, no request. · Expired/invalid token → invalid-or-expired error.
- **Postconditions:** Password updated.

### UC-ACCT-01 — Reader deletes their account (right-to-erase)
- **Primary Actor:** Reader · **Stakeholders:** Reader, Compliance (GDPR/PDPA/Nghị định 13).
- **Preconditions:** Authenticated.
- **Main Success Scenario:** 1. Open Settings, read the erase warning. 2. Enter the current password (optional) and type DELETE. 3. Submit → `deleteUser` removes the account; the browser hard-reloads to `/`.
- **Alternate Flows:** A just-signed-in reader may omit the password (session fresh).
- **Exception Flows:** OAuth-only account → `CREDENTIAL_ACCOUNT_NOT_FOUND` guidance. · Wrong password → `INVALID_PASSWORD`. · Old session, no password → `SESSION_EXPIRED` guidance.
- **Postconditions:** User row deleted; bookmarks/queue/history/follows cascade-deleted; the newsletter email is retained with `user_id` NULL.

### UC-ENG-01 — Engine publishes a new AI-assisted article to the web
- **Primary Actor:** Content Engine · **Stakeholders:** Editorial (review), Readers (fresh content), SEO/search.
- **Preconditions:** `DTW_INTAKE_TOKEN` configured; target pillar exists; Engine holds a valid bearer token.
- **Main Success Scenario:**
  1. Engine POSTs `/api/engine/intake` with the bearer token and the payload.
  2. The endpoint verifies the bearer token in constant time.
  3. It validates required fields (title, pillarSlug, body_markdown).
  4. It checks idempotency on `engineSourceUrl` — no existing match.
  5. It resolves the pillar by slug.
  6. It find-or-creates tags and the author from the byline.
  7. It fetches and uploads the hero image (best-effort).
  8. It converts markdown → Lexical and computes `readMin`.
  9. It creates the article `_status='published'`, `origin='engine'`, `editedByHuman=false`, `aiAssisted=true`, `version=1`.
  10. afterChange `revalidateArticle` busts `articles:all` (and logs Meilisearch/OG TODO).
  11. Returns 201 `{id}`.
- **Alternate Flows:** `engineSourceUrl` already ingested → return 200 `{existing id}`, skip creation. · Hero fetch/upload fails → publish without a hero.
- **Exception Flows:** Missing/invalid bearer → 401. · `DTW_INTAKE_TOKEN` unset → 500. · Invalid JSON → 400. · Missing required field / unsluggable title → 400. · Unknown pillar → 422. · Blank byline → 400. · Unexpected error during create → 500.
- **Postconditions:** A published Article exists with engine provenance; reader surfaces are revalidated.

### UC-ENG-02 — Engine retries a delivery it already made
- **Primary Actor:** Content Engine · **Stakeholders:** Editorial (no duplicates), Search index integrity.
- **Preconditions:** An article for source URL X was previously ingested and published.
- **Main Success Scenario:** 1. Engine re-POSTs the same payload (same `sourceProvenance.url`). 2. The endpoint authenticates and validates. 3. It finds the existing doc where `engineSourceUrl` equals X. 4. It returns 200 `{id: existing}` and creates nothing.
- **Alternate Flows:** —
- **Exception Flows:** A payload with no provenance.url skips dedup and could create a duplicate (see gaps).
- **Postconditions:** No duplicate article; the Engine receives the stable id.

### UC-ENG-03 — Editor edits an Engine article and conflict resolution locks the field
- **Primary Actor:** Editor · **Stakeholders:** Editorial (protected work), Content Engine (safe re-sync).
- **Preconditions:** An Engine draft exists (`origin='engine'`); editor logged in with 2FA.
- **Main Success Scenario:**
  1. Editor opens the article in `/admin` and reviews Content/Taxonomy/Disclosure tabs.
  2. Editor edits copy and adds fields (e.g. `title`, `body`) to `lockedFields` to protect them from the Engine.
  3. Editor sets disclosure flags if sponsored/affiliate (sponsor name required if sponsored).
  4. Editor changes status to published and saves; per Phase-E4 design `version` should bump and `editedByHuman` set true.
  5. afterChange busts `articles:all`.
  6. When the Engine later attempts to overwrite `title` or `body`, the (planned) enforcement skips those fields and writes an `EngineConflictLog` row (`reason='locked'` or `'human_edited'`); the human value persists.
- **Alternate Flows:** Editor edits the body directly, which should set `editedByHuman=true` (planned enforcement).
- **Exception Flows:** Sponsored checked with empty sponsor → save blocked. · An author (not editor) attempting to publish someone else's article → update denied. · **KNOWN GAP:** the beforeChange version-bump, the If-Match optimistic lock, the lockedFields/human-edit skip, and the EngineConflictLog population are Phase E4 and NOT yet implemented — today the intake path only creates (never updates), so this conflict scenario cannot yet occur in code.
- **Postconditions:** `lockedFields` records the protected fields for the (planned) enforcement layer; the article is published and cache-invalidated.

### UC-CMS-01 — Editor adds a new pillar without a deploy
- **Primary Actor:** Editor · **Stakeholders:** Editorial (taxonomy control), SEO (routes/sitemap/RSS).
- **Preconditions:** Editor logged in.
- **Main Success Scenario:** 1. Editor creates a Pillar with slug, `title.en` (+vi/id), heading, color, icon, order. 2. On save, `revalidatePillar` busts `pillars:all` and `articles:all`. 3. `generateStaticParams` re-runs lazily; routes/sitemap/RSS regenerate on schedule. 4. Within ≤5 minutes the new pillar's nav entry and routes are live.
- **Alternate Flows:** Editor reorders pillars by changing `order` values.
- **Exception Flows:** Duplicate slug → unique constraint rejects. · Non-admin attempts delete → denied.
- **Postconditions:** A new beat is live sitewide without a redeploy (invariant #8).

### UC-CMS-02 — Admin configures a sponsor slot
- **Primary Actor:** Admin · **Stakeholders:** Commercial (placement), Editorial (firewall).
- **Preconditions:** A sponsored article exists; admin logged in.
- **Main Success Scenario:** 1. Admin opens SponsorSlots and selects the slot location (homepage_strip / dashboard_funding / dashboard_ai). 2. Admin links the sponsored article and sets startsAt/endsAt. 3. Admin saves.
- **Alternate Flows:** Admin clears the article link → the slot renders nothing.
- **Exception Flows:** A non-admin attempting to edit the slot → denied.
- **Postconditions:** The sponsored placement renders with Paid Partner labeling during the configured window.

### UC-TRUST-01 — Reader reads the public corrections log
- **Primary Actor:** Guest · **Stakeholders:** Readers (accountability), Editorial (transparency).
- **Preconditions:** At least one correction exists in Payload.
- **Main Success Scenario:** 1. Reader clicks "Corrections" in the footer/trust nav. 2. The server resolves slug='corrections' and calls `getCorrections()` (cached, `-correctionDate`, depth 1). 3. It maps docs to CorrectionView and passes them to TrustContent. 4. The log renders each entry newest-first with locale-formatted date, article title, summary, was/now text, and signing editor.
- **Alternate Flows:** No corrections exist → a trilingual empty-state box renders.
- **Exception Flows:** Payload fetch fails → the framework error surfaces.
- **Postconditions:** Reader has seen every published correction; no data mutated.

### UC-TRUST-02 — Editor publishes a correction
- **Primary Actor:** Editor · **Stakeholders:** Readers, Editorial leadership.
- **Preconditions:** Editor authenticated with role editor/admin.
- **Main Success Scenario:** 1. Editor opens the Corrections collection and creates a new entry. 2. Editor selects the corrected article, sets correctionDate (defaults today), summary, wasText, nowText, optionally themselves as editor. 3. On save, the access rule permits create for editor/admin. 4. After ISR revalidation (≤300s) the entry appears on `/trust/corrections`.
- **Alternate Flows:** Editor edits an existing correction (permitted for editor/admin).
- **Exception Flows:** A Reader/Pro/Author attempts create/update → denied. · A non-admin attempts delete → denied.
- **Postconditions:** A new/updated correction is stored and publicly visible after revalidation.

### UC-DASH-01 — Reader ranks AI models by their own priority
- **Primary Actor:** Guest · **Stakeholders:** Readers (decision support).
- **Preconditions:** Reader is on `/dashboards/ai`.
- **Main Success Scenario:** 1. Reader lands on the AI Leaderboard, sorted by Reasoning descending. 2. Reader clicks the "Price (low)" pill. 3. The table re-sorts by price ascending; free models surface first ("free" in green). 4. Reader clicks the "Speed" header. 5. The table re-sorts by speed descending with a ▼ indicator. 6. Reader reads the methodology note citing three benchmark sources.
- **Alternate Flows:** Reader clicks the same header again to flip to ascending. · Reader switches to the funding tab.
- **Exception Flows:** None — all client-side over static sample data.
- **Postconditions:** Reader has ranked models by the dimension they care about; no composite score was shown.

### UC-SYS-01 — Crawler discovers and indexes fresh content
- **Primary Actor:** Search-engine / AI-search crawler · **Stakeholders:** SEO, Editorial reach.
- **Preconditions:** Site deployed on the canonical www host; articles/pillars published.
- **Main Success Scenario:** 1. Crawler fetches `/robots.txt`, reads allow '/', the disallow list, and the sitemap pointer. 2. Crawler fetches `/sitemap.xml` and enumerates home, pillar, pillar-page, article, and static entries. 3. Crawler fetches an article page and parses NewsArticle JSON-LD + OG/canonical metadata. 4. Crawler fetches `/llms.txt` for the section map and feed URLs.
- **Alternate Flows:** Crawler subscribes to `/rss.xml` or `/{pillar}/rss.xml` for incremental updates.
- **Exception Flows:** Unknown pillar feed slug → 404 so aggregators stop polling. · Disallowed path → not in the sitemap and excluded by robots.
- **Postconditions:** Fresh articles/pillars indexed within the 15-min (sitemap) / 5-min (feeds) windows without a deploy.

---

## 6. Data Requirements

Consolidated data dictionary across modules. "System" indicates the owning store: **Payload** (CMS collections/globals on Postgres), **Drizzle** (application tables on the same Postgres), **Better-Auth** (auth tables via Drizzle), or **Client** (cookie/localStorage/IndexedDB).

| Entity (System) | Key fields | Relationships | Provenance / notes | Source |
|---|---|---|---|---|
| **articles** (Payload) | id, slug (unique, indexed), title, dek, body (Lexical), section, readMin, publishedAt, updatedAt, `_status` (draft/published), pillar, tags[], author, coAuthors[], heroImage, sponsored, sponsor, aiAssisted, affiliate, deepDive, pinnedToLatest, **origin ('engine'\|'manual')**, **editedByHuman**, **lockedFields[]**, **version**, engineSourceUrl, engineSourceName | belongsTo pillar; hasMany tags; belongsTo author + coAuthors; has heroImage(media); referenced by sponsorSlots, corrections, engineConflictLog | System of record. Written only via Payload API (inv #1). Engine writes set origin='engine', editedByHuman=false, aiAssisted=true, version=1. Body stays source-language. Drafts/versions enabled → mirrored `_articles_v`. | `payload/collections/Articles.ts` |
| **pillars** (Payload) | id, slug (unique), title.{en,vi,id}, heading, description, color, icon, order, parentId | hasMany articles; referenced by newsletters.vertical, follows | CMS-driven taxonomy (inv #8). afterChange busts `pillars:all`+`articles:all`. Adding a pillar is a CMS write, not a deploy. | `payload/collections/Pillars.ts` |
| **tags** (Payload) | id, slug (unique), title.{en,vi,id} | referenced by articles.tags (many-to-many) | Flat secondary taxonomy; no dedicated afterChange cache tag. | `payload/collections/Tags.ts` |
| **authors** (Payload) | id, name, role, city, bio, user (optional → users) | referenced by articles.author/coAuthors | Byline directory decoupled from editorial Users so bylines outlive user records; city feeds Wire Drops CityChip. | `payload/collections/Authors.ts` |
| **media** (Payload upload) | id, filename, alt (required), credit, sizes.{thumbnail,card,hero} | referenced by articles.heroImage | image/* only; sharp derivatives; R2 storage in prod via s3Storage (gated on R2_* env), local disk in dev. | `payload/collections/Media.ts` |
| **users** (Payload editorial) | id, email, name, role (author/editor/admin, default author) | referenced by authors.user, corrections.editor | Editorial auth collection; role change locked to admin. Separate from Better-Auth reader accounts. | `payload/collections/Users.ts` |
| **sponsorSlots** (Payload) | id, slot (homepage_strip/dashboard_funding/dashboard_ai), article, startsAt, endsAt | article → articles | Admin-only; empty article = renders nothing. | `payload/collections/SponsorSlots.ts` |
| **wireDrops** (Payload) | id, time, city, text (maxLength 200), publishedAt | standalone | Auto-publish on insert; afterChange busts `wire-drops` + TODO Soketi broadcast; spec ≤150 chars. | `payload/collections/WireDrops.ts` |
| **corrections** (Payload) | id, article (required), correctionDate (default today), summary, wasText, nowText, editor | article → articles; editor → users | Public log on `/trust/corrections`; append-oriented; wasText/nowText required. Cached tag `corrections:all`, revalidate 300. | `payload/collections/Corrections.ts` |
| **newsletters** (Payload) | id, name (unique), slug (unique; am/pm/ai/fund/dev/prod), cadence, description, vertical, active, order | vertical → pillars; slug maps to Drizzle `newsletter_id` (no FK) | Six Y1 products; afterChange busts `newsletters:all`. slug is the sole cross-system contract. | `payload/collections/Newsletters.ts` |
| **engineConflictLog** (Payload) | id, article, field, engineValue (json), currentValue (json), reason (locked/human_edited/version_mismatch), occurredAt | article → articles | Read-only audit; create/update disabled (hook-populated). **Populating hook is Phase E4 — not yet implemented (empty today).** | `payload/collections/EngineConflictLog.ts` |
| **paywallSettings** (Payload global) | paywallThreshold (min 1, default 3) | consumed by reader app `getPaywallThreshold()` | Single operational setting; no versions/drafts. Editor/Admin update, public read. afterChange busts `settings:paywall`. Never hardcode the 3 (inv #4). | `payload/globals/PaywallSettings.ts` |
| **auth_users** (Better-Auth) | id, name, email (unique), emailVerified, image, role enum (reader/pro/author/editor/admin, default reader), twoFactorSecret, twoFactorEnabled, timestamps | 1:N sessions/accounts; referenced by bookmarks/queue/history/follows (cascade), newsletter_subscriptions (set null) | Reader identity. 2FA columns exist but 2FA not wired into the auth config. | `packages/db/src/schema/auth.ts` |
| **auth_sessions** (Better-Auth) | id, token (unique), userId (FK cascade), expiresAt, ipAddress, userAgent | N:1 auth_users | 7-day sessions, refreshed at most daily; httpOnly secure SameSite=Lax cookie. | `packages/db/src/schema/auth.ts` |
| **auth_accounts** (Better-Auth) | id, userId (FK cascade), providerId, accountId, (providerId, accountId) unique, password, accessToken, refreshToken, idToken, scope | N:1 auth_users | OAuth linkage (Google/GitHub) + optional email/password credential. | `packages/db/src/schema/auth.ts` |
| **auth_verifications** (Better-Auth) | id, identifier, value, expiresAt | standalone (keyed by identifier) | Email-verification, password-reset, change-email tokens; single-use, short-lived (reset 1h). | `packages/db/src/schema/auth.ts` |
| **bookmarks** (Drizzle) | (userId, articleId) unique pk, savedAt | N:1 auth_users; articleId → Payload articles by value | Saved articles; ordered by savedAt desc; cascade with user. | `packages/db/src/schema/account.ts` |
| **reading_queue** (Drizzle) | (userId, articleId) unique pk, position, addedAt | N:1 auth_users | "Read later" queue with client-owned ordering. **EXISTS but has NO server actions and NO UI tab (gap).** | `packages/db/src/schema/account.ts` |
| **reading_history** (Drizzle) | (userId, articleId) unique pk, readAt, scrollDepth (0–100) | N:1 auth_users | One row per user+article, readAt bumped on re-read. Feeds the History tab (limit 50) and the signed-in meter (`getReadCountThisPeriod`). scrollDepth stored but always default 0 (gap). | `packages/db/src/schema/account.ts` |
| **follows** (Drizzle) | (userId, pillarId) unique pk, followedAt | N:1 auth_users; pillarId → Payload pillars by slug | Pillar follows only; any CMS slug accepted (inv #8). | `packages/db/src/schema/account.ts` |
| **newsletter_subscriptions** (Drizzle) | id (pk), email, newsletter_id, (email, newsletter_id) unique, userId (FK set null), confirmedAt, unsubscribedAt | optional N:1 auth_users (null = guest) | The only unique index is (email, newsletter_id) → drives claim-or-insert. On user delete, userId set NULL (email row retained). Segment key = newsletter_id. | `packages/db/src/schema/account.ts` |
| **pending_newsletter_confirmations** (Drizzle) | token (pk), email, newsletterIds[], createdAt, expiresAt | resolves to newsletter_subscriptions on confirm | Double-opt-in staging table. **EXISTS but referenced by NO route/action — double opt-in not wired (gap).** | `packages/db/src/schema/account.ts` |
| **article_views** (Drizzle) | (article_id, day) unique, views (int) | article_id → Payload articles by value | Anonymous per-(article, SGT day) counter; **stores no visitor identity → no consent gate**. Backs homepage Most Read (14-day window). | `packages/db/src/schema/analytics.ts` |
| **Guest meter cookie** (Client) | `dtw-read-count`: period (YYYY-MM SGT), ids[] (≤20 distinct) | n/a | Idempotent per-article per-month guest read counter; SameSite=Lax, 90-day max-age, period-key reset. | `lib/paywall.ts` |
| **View dedupe store** (Client) | `dtw-viewed`: day (YYYY-MM-DD SGT), ids[] (≤120) | n/a | Client-side one-per-day dedupe gate for `article_views`; plus in-memory Set; fails open. | `lib/article-views.ts` |
| **Chrome preference keys** (Client) | `dtw-theme`, `dtw-lang`, `dtw-nudge-dismissed`, `dtw-cookies` | n/a | Theme, language, nudge-dismissal, and cookie-consent persistence; all fail silently when storage unavailable. | `theme-provider.tsx`, `i18n.tsx`, `header.tsx`, `cookie-banner.tsx` |

**Article provenance columns (note).** The four load-bearing conflict-resolution columns on **articles** are: `origin` ('engine'\|'manual', required, default 'manual' — invariant #3, marks provenance), `editedByHuman` (boolean, default true for manual writes, false for Engine writes; read-only in admin), `lockedFields` (array of field names the Engine must never overwrite — a human always wins the same field), and `version` (monotonic optimistic-lock counter, default 1, read-only, intended to bump on every write). Together they implement invariant #2 (conflict resolution = lockedFields + editedByHuman + optimistic lock). **As of this document the beforeChange version-bump and the lockedFields/version enforcement are Phase E4 and NOT implemented** — the columns exist and the intake path sets them on create, but no runtime code yet enforces them on Engine update, and `engineConflictLog` is never populated.

---

## 7. Requirements Traceability Matrix

Every canonical spec row (85 rows across 14 page-groups: MENU/HEADER 6, FOOTER 5, HOMEPAGE 15, ARTICLE PAGE 8, PILLAR PAGE 5, DASHBOARDS 3, SEARCH 3, NEWSLETTERS 2, AUTH 3, ACCOUNT 4, TRUST PAGES 5, HỆ THỐNG 12, CÔNG NGHỆ 10, LUỒNG CHÍNH 4). **Status:** Implemented / Partial / Phase 2 / Gap.

### 7.1 MENU / HEADER (6 rows)

| Spec row | FR ID(s) | Code reference | Status |
|---|---|---|---|
| 1 Logo + tagline (→ /) | FR-NAV-02 | header.tsx:221-239; wordmark.tsx | Implemented |
| 2 Search box (instant, <300ms, → /search) | FR-NAV-03, FR-NAV-04, FR-SRCH-01..03 | header.tsx:241-282; search-overlay.tsx | Partial (DB LIKE, not Meilisearch) |
| 3 Main nav (CMS pillars, reorder, ☰ mobile) | FR-NAV-01, FR-NAV-05, FR-NAV-06, FR-NAV-09 | header.tsx:512-605; payload-server.ts:74-99 | Partial (Dashboards/Newsletters/Pro extras hidden) |
| 4 Newsletter CTA (Subscribe → /newsletters) | FR-NAV-18 | header.tsx:286-305 | Gap (SHOW_NEWSLETTER=false) |
| 5 Login / User (modal, RBAC 5 roles, 2FA) | FR-NAV-07, FR-NAV-10, FR-AUTH-01..09 | header.tsx:346-487; shell.tsx:51-130 | Partial (no 2FA; magic-link→password) |
| 6 Dark mode (localStorage+cookie; #0F172A/#E2E8F0) + top strip date/lang | FR-NAV-08, FR-NAV-11, FR-NAV-12, FR-SYS-16 | theme-provider.tsx; header.tsx:137-208 | Partial (localStorage only, no cookie; lang switcher hidden) |

### 7.2 FOOTER (5 rows)

| Spec row | FR ID(s) | Code reference | Status |
|---|---|---|---|
| 1 Info columns (About/Editorial/Advertise/Awards/Studio/Careers/Legal) | FR-NAV-13, FR-TRUST-09..18 | footer.tsx:19-57,123-212 | Partial (Careers route absent) |
| 2 Social (FB/IG/LinkedIn/X) | FR-NAV-14 | footer.tsx:60-66,150-171 | Partial (only Email/RSS have hrefs) |
| 3 Newsletter mini-subscribe | FR-NAV-18, FR-NL-06 | footer.tsx:76-121 | Gap (SHOW_NEWSLETTER=false) |
| 4 Language (en/id/vi; hreflang) | FR-NAV-11, FR-NAV-12, FR-SYS-15 | header.tsx:184-205; i18n.tsx | Partial (client-only; no subpath routes/hreflang; switcher hidden) |
| 5 Trust links + Copyright | FR-NAV-15, FR-TRUST-18 | footer.tsx:214-234,32-37 | Partial (Transparency link absent) |

### 7.3 HOMEPAGE (15 rows)

| Spec row | FR ID(s) | Code reference | Status |
|---|---|---|---|
| 1 Header + Nav | FR-HOME-15, FR-NAV-* | (reader)/layout.tsx | Implemented |
| 2 Hero (LQIP, ≤440px) | FR-HOME-02 | home/home-hero.tsx; page.tsx:82 | Implemented |
| 3 The Brief (AM/PM) | FR-HOME-06 | home/brief-band.tsx | Gap (SHOW_BRIEF=false; hardcoded copy) |
| 4 Wire Drops (realtime) | FR-HOME-07, FR-CMS-12 | home/wire-drops.tsx; payload-server.ts:540 | Partial (hidden; ISR only, no WebSocket) |
| 5 Pillar showcase (6×4) | FR-HOME-03 | home/pillar-showcase.tsx; payload-server.ts:245 | Implemented |
| 6 Asia Spotlight → Most Read (view-ranked) | FR-HOME-04, FR-HOME-16, FR-PAY-06, FR-PAY-07 | home/most-read.tsx; most-read.ts:46; view-actions.ts:37 | Implemented |
| 7 Live Dashboards teaser | FR-HOME-08, FR-DASH-11, FR-DASH-12 | home/dashboards-teaser.tsx | Partial (hidden; mock data) |
| 8 Deep Dive of the Week | FR-HOME-09 | home/deep-dive.tsx; payload-server.ts:467 | Partial (SHOW_DEEP_DIVE=false) |
| 9 Awards banner | FR-HOME-05, FR-TRUST-15 | home/awards-banner.tsx | Implemented (inaugural placeholder) |
| 10 Sponsored Content Strip | FR-HOME-10, FR-CMS-13 | home/sponsored-strip.tsx; payload-server.ts:485 | Gap (component built but NOT mounted in page.tsx) |
| 11 Best of Reviews (affiliate) | FR-HOME-11 | home/best-of-reviews.tsx | Partial (hidden; no /r/[token] tracker) |
| 12 Podcast / Voice | FR-HOME-12 | home/podcast-strip.tsx | Phase 2 (hidden; no audio) |
| 13 Newsletter CTA (full-width) | FR-HOME-13, FR-NL-06 | home/newsletter-cta.tsx | Partial (SHOW_NEWSLETTER_CTA=false) |
| 14 Footer | FR-NAV-13..15 | (reader)/layout.tsx | Implemented |
| 15 Homepage performance (ISR) | FR-HOME-01, NFR-HOME-01..04 | page.tsx:41 | Implemented |

### 7.4 ARTICLE PAGE (8 rows)

| Spec row | FR ID(s) | Code reference | Status |
|---|---|---|---|
| 1 Title + meta (JSON-LD NewsArticle) | FR-ART-01, FR-ART-02, FR-ART-10, FR-SYS-05 | article/[slug]/page.tsx:77,143 | Implemented |
| 2 Image/Video hero (LQIP; HLS video) | FR-ART-03, FR-CMS-08 | article/article-content.tsx:180 | Partial (img+CoverArt; no HLS video) |
| 3 Serif body | FR-ART-01, FR-ART-04, FR-CMS-09 | article/article-body.tsx | Implemented |
| 4 Disclosure boxes (sponsored top/mid/bottom; AI-assisted) | FR-ART-05, FR-ART-06, FR-CMS-10 | article/article-body.tsx; ui/disclosure-box.tsx | Partial (AI inline disclosure removed 2026-06-05; /trust/ai copy gap) |
| 5 Audio TTS (later phase) | FR-ART-13 | article/audio-player.tsx | Phase 2 (built, unwired) |
| 6 Related articles | FR-ART-09 | article/related-row.tsx; payload-server.ts:297 | Implemented |
| 7 Save/Share (OG 1200×630 auto) | FR-ART-08, FR-ART-10, FR-SYS-04 | article/share-bar.tsx; lib/metadata.ts | Partial (metadata OG; no per-slug OG generator) |
| 8 Paywall (set free count; soft block; no mid-article block) | FR-PAY-01..05, FR-CMS-16, FR-SYS-14 | article/paywall.tsx; paywall.ts; PaywallSettings.ts | Implemented (nudge only; no /pro billing) |

### 7.5 PILLAR PAGE (5 rows)

| Spec row | FR ID(s) | Code reference | Status |
|---|---|---|---|
| 1 Header (mảng) | FR-PIL-01, FR-PIL-02 | [pillar]/pillar-view.tsx; pillar/pillar-content.tsx | Implemented |
| 2 Featured + list; Load more | FR-PIL-02, FR-PIL-03, FR-PIL-04 | pillar/pillar-content.tsx; load-more-action.ts | Implemented |
| 3 Sub-section (mục con) | — | (no Subsections collection; Article.section free-text only) | Gap |
| 4 RSS (Atom 1.0) | FR-PIL-05, FR-PIL-06, FR-SYS-06 | [pillar]/rss.xml/route.ts | Implemented |
| 5 Dynamic routes (no redeploy <5 min) | FR-PIL-04, FR-PIL-07, FR-CMS-05 | [pillar]/page.tsx; revalidate.ts:123-139 | Implemented |

### 7.6 DASHBOARDS (3 rows)

| Spec row | FR ID(s) | Code reference | Status |
|---|---|---|---|
| 1 Asia Funding Tracker (table/sort/filter/chart/CSV/disclaimer; pipeline+API+refresh+history) | FR-DASH-01..06, FR-DASH-09, FR-DASH-14 | dashboards/funding-tracker.tsx; big-chart.tsx | Partial (UI done; backend pipeline = Gap/Phase 2) |
| 2 AI Leaderboard (multi-criteria; sources/scoring; no single number) | FR-DASH-01, FR-DASH-07, FR-DASH-08, FR-DASH-09, FR-DASH-14 | dashboards/ai-leaderboard.tsx | Partial (UI done; static sample data) |
| 3 Sponsor slot | FR-DASH-10, FR-CMS-13 | dashboards/[[...sub]]/page.tsx:161-206 | Gap (hardcoded placeholder; no SponsorSlots wiring) |

### 7.7 SEARCH (3 rows)

| Spec row | FR ID(s) | Code reference | Status |
|---|---|---|---|
| 1 Instant search (header; Meilisearch; typo tolerance; multi-lang; articles+awards+people; p95<300ms) | FR-SRCH-02, FR-SRCH-08, FR-SRCH-09, FR-SRCH-10 | search-overlay.tsx; search-action.ts:11; payload-server.ts:447 | Partial (DB LIKE; no Meilisearch/typo/entities) |
| 2 Full search page (facets: pillar·date·author·type) | FR-SRCH-04, FR-SRCH-05, FR-SRCH-06, FR-SRCH-11 | search/page.tsx | Partial (Pillar facet only; date/author/type = Gap) |
| 3 Search analytics (PostHog; zero-result; admin report) | FR-SRCH-07, FR-SRCH-12 | search/page.tsx:200 | Gap (no PostHog events/report) |

### 7.8 NEWSLETTERS (2 rows)

| Spec row | FR ID(s) | Code reference | Status |
|---|---|---|---|
| 1 Newsletter list (6, segment by pillar; Admin create/edit) | FR-NL-01, FR-NL-07, FR-CMS-15 | newsletters/page.tsx; Newsletters.ts:14-49 | Implemented |
| 2 Signup form (email, select; Resend; double opt-in; confirm email) | FR-NL-02, FR-NL-03, FR-NL-04, FR-NL-08, FR-SYS-12 | newsletters-content.tsx; account-actions.ts:266-311 | Partial (single opt-in shipped; double opt-in = Gap) |

### 7.9 AUTH (3 rows)

| Spec row | FR ID(s) | Code reference | Status |
|---|---|---|---|
| 1 Login (magic link/OAuth Google/Apple/GitHub; create session; 2FA) | FR-AUTH-02, FR-AUTH-06, FR-AUTH-07, FR-AUTH-08, FR-SYS-09 | auth-modal.tsx; lib/auth.ts | Partial (email+password not magic-link; Google/GitHub only, no Apple; no 2FA) |
| 2 Signup (default role Reader; view user list) | FR-AUTH-01, FR-AUTH-03, FR-CMS-03, FR-CMS-04 | auth-modal.tsx:79-102; lib/auth.ts:70-134 | Implemented |
| 3 Forgot password | FR-AUTH-04, FR-AUTH-05 | auth-modal.tsx:104-121; reset-password/page.tsx | Implemented |

### 7.10 ACCOUNT (4 rows)

| Spec row | FR ID(s) | Code reference | Status |
|---|---|---|---|
| 1 Saved / Read later | FR-ACCT-02 | account-actions.ts:28-68; account-tabs.tsx:200-300 | Partial (Saved done; Read-later queue = Gap) |
| 2 Following pillars | FR-ACCT-04 | account-actions.ts:105-122; account-tabs.tsx:390-482 | Implemented |
| 3 Settings (dark/lang/newsletter; password/email/delete) | FR-ACCT-05..09, FR-NL-05 | settings-tab.tsx; account-actions.ts:124-311 | Partial (newsletter/password/email/delete done; dark/lang in shell not Settings) |
| 4 Reading history | FR-ACCT-03 | account-actions.ts:80-95; account-tabs.tsx:302-388 | Implemented |

### 7.11 TRUST PAGES (5 rows)

| Spec row | FR ID(s) | Code reference | Status |
|---|---|---|---|
| 1 Editorial Standards | FR-TRUST-01, FR-TRUST-02, FR-TRUST-03 | trust/[slug]/trust-content.tsx:134 | Partial (hardcoded, not CMS-editable) |
| 2 AI Disclosure | FR-TRUST-04 | trust/[slug]/trust-content.tsx:184 | Partial (copy stale vs inv #5 — Gap) |
| 3 Corrections (public log) | FR-TRUST-05, FR-TRUST-08, FR-CMS-14 | trust-content.tsx:39; Corrections.ts; payload-server.ts:555 | Implemented |
| 4 Transparency Report | FR-TRUST-06 | trust/[slug]/trust-content.tsx:247 | Phase 2 (placeholder) |
| 5 Sponsored / Affiliate Policy | FR-TRUST-07, FR-TRUST-14 | trust-content.tsx:261; studio/page.tsx:46 | Partial (hardcoded, not CMS-editable) |

### 7.12 HỆ THỐNG — System-wide (12 rows)

| Spec row | FR ID(s) | Code reference | Status |
|---|---|---|---|
| 1 Performance (LCP/CLS/INP/Lighthouse) | NFR-SYS-01, FR-HOME-01, FR-ART-01 | sitemap.ts (ISR); infra/all-infra.md | Partial (ISR done; no CI perf gate) |
| 2 Images & Video (AVIF/WebP srcset; HLS) | FR-CMS-08, FR-ART-03, NFR-SYS-04 | Media.ts; next.config.ts | Partial (images done; no HLS video) |
| 3 PWA / Offline | FR-SYS-03 | app/manifest.ts | Partial (manifest only; no Service Worker/offline cache) |
| 4 i18n (en/id/vi; manage translations) | FR-SYS-15, FR-NAV-12 | lib/i18n.tsx; lib/format.ts | Partial (client chrome only; no subpath routes) |
| 5 SEO & AI Search (metadata/JSON-LD/sitemap/robots/RSS/llms.txt/OG) | FR-SYS-01, FR-SYS-02, FR-SYS-04, FR-SYS-05, FR-SYS-06, FR-SYS-07 | sitemap.ts; robots.ts; metadata.ts; feed.ts; llms.txt/route.ts | Implemented (per-slug OG generator = Gap) |
| 6 Dark mode | FR-SYS-16, FR-NAV-08 | lib/i18n.tsx; uxui/all-uxui.md | Implemented |
| 7 Accessibility (WCAG 2.1 AA; axe-core) | NFR-SYS-02, FR-CMS-08 | infra/all-infra.md | Partial (no CI a11y gate; reduced-motion TODO) |
| 8 Analytics & measurement | FR-SYS-11, FR-PAY-06 | analytics.ts; view-actions.ts | Partial (anonymous view counter only; no PostHog) |
| 9 Security & compliance (cookie consent; RBAC; CSP/rate-limit/WAF) | FR-SYS-08, FR-SYS-09, NFR-SYS-05, BR-SYS-10 | cookie-banner.tsx; schema/auth.ts; metadata.ts:toJsonLdScript | Partial (consent+RBAC+escaping done; CSP/rate-limit/WAF = Gap/infra) |
| 10 CMS & Taxonomy (Pillar/Sub-section/Tag; no deploy) | FR-CMS-05, FR-CMS-06, FR-CMS-18, FR-SYS-01 | Pillars.ts; Tags.ts; revalidate.ts | Partial (Pillars/Tags done; Subsections = Gap) |
| 11 Content Engine integration | FR-ENG-01..13, FR-CMS-11, FR-CMS-17, FR-SYS-13 | api/engine/intake/route.ts; Articles.ts; EngineConflictLog.ts; revalidate.ts | Partial (intake works; lock enforcement/conflict-log = Phase E4 Gap) |
| 12 Ad / sponsor infrastructure (sponsor slot; affiliate tracker; auto disclosure; no popups/mid-article ads) | FR-CMS-10, FR-CMS-13, FR-ART-07, FR-SYS-06 | SponsorSlots.ts; Articles.ts:104-181; feed.ts | Partial (disclosure/labelling done; AffiliateLinks/tracker = Gap) |

### 7.13 CÔNG NGHỆ — Technology (10 rows)

| Spec row | FR ID(s) | Code reference | Status |
|---|---|---|---|
| 1 Frontend (Next.js 15 App Router + TS) | FR-SYS-04, FR-HOME-01 | next.config.ts; app/layout.tsx | Implemented |
| 2 UI (Tailwind v4 + shadcn/Radix) | FR-SYS-16, FR-NAV-* | packages/ui; cookie-banner.tsx | Implemented |
| 3 CMS (Payload 3 self-host, RBAC, custom fields) | FR-CMS-01, FR-CMS-02 | payload.config.ts; (payload)/admin | Implemented |
| 4 Database (Postgres 16 + Drizzle) | FR-SYS-09, FR-SYS-10, FR-SYS-11 | packages/db/src/schema/*; migrations/* | Implemented |
| 5 Search (Meilisearch Y1; Elasticsearch Y3) | FR-SRCH-10 | integrations/all-integrations.md:87 | Gap (DB LIKE today) |
| 6 Cache & Queue (Redis + BullMQ) | FR-NL-10, FR-ENG-13 | infra/all-infra.md (OG/send queue) | Phase 2 (not wired) |
| 7 Media (R2 + Images; Mux/CF Stream) | NFR-SYS-04, FR-CMS-08 | payload.config.ts:35-88; infra/all-infra.md | Partial (R2 images; no Mux/Stream video) |
| 8 Auth/Email (Better-Auth + Resend) | FR-AUTH-*, FR-NL-08, FR-SYS-09, FR-SYS-12 | schema/auth.ts; lib/email.ts | Partial (email+password; magic-link/Apple/2FA absent) |
| 9 Analytics (PostHog self-host) | FR-SYS-11, FR-SRCH-12 | analytics.ts; infra/all-infra.md | Gap (not wired) |
| 10 Hosting/CDN (Vercel + Cloudflare) | NFR-SYS-05, FR-SYS-02 | next.config.ts; infra/all-infra.md | Partial (host canonicalization; WAF/CSP = infra Gap) |

### 7.14 LUỒNG CHÍNH — End-to-end flows (4 rows)

| Spec row | FR ID(s) | Code reference | Status |
|---|---|---|---|
| 1 Article (Engine → Web, approved article appears) | FR-ENG-01..13, FR-ART-01, FR-ART-12, FR-CMS-09 | api/engine/intake/route.ts; article/[slug]/page.tsx; revalidate.ts | Partial (intake + publish + revalidate; conflict enforcement = Phase E4 Gap) |
| 2 Paywall (count by cookie/user; soft block; set free count) | FR-PAY-01..05, FR-CMS-16, FR-SYS-14 | shell.tsx; article-content.tsx:30; PaywallSettings.ts | Implemented |
| 3 Newsletter signup (email → select → confirm → segment by pillar; Resend double opt-in) | FR-NL-03, FR-NL-04, FR-NL-06, FR-SYS-12 | account-actions.ts:266-311; newsletter-cta.tsx | Partial (single opt-in; double opt-in + segmenting = Gap) |
| 4 Login (→ /account; RBAC; header shows user name) | FR-AUTH-02, FR-AUTH-07, FR-AUTH-09, FR-ACCT-01, FR-NAV-07 | lib/session.ts; account/[[...tab]]/page.tsx; header.tsx:346-487 | Implemented |

---

## 8. Assumptions, Constraints & Phase-2 Deferrals

### 8.1 Assumptions

1. **Two identity stores coexist.** Reader accounts live in Better-Auth (Drizzle); editorial accounts live in Payload Users. Reconciliation to a single source is a future phase; until then, `/admin` is gated on Payload Users and 2FA enforcement for Editor/Admin lives outside collection code.
2. **Publication timezone is Asia/Singapore (UTC+8).** All meters, view-day buckets, and displayed dates key to it; the publisher (APCG) is Singapore-headquartered.
3. **The Engine delivers pre-approved, publish-ready articles.** Its approval queue is upstream in `dtw-engine`; the intake endpoint publishes on create.
4. **Feature flags are compile-time.** The seven homepage `SHOW_*` flags and the header/chrome flags (`SHOW_NEWSLETTER`, `SHOW_LANG_SWITCHER`, `SHOW_WIRE_DROPS_TICKER`) require a redeploy to flip — they are not CMS toggles.
5. **Dashboard data is sample/preview.** All funding and AI-leaderboard figures are hardcoded sample arrays labelled "sample data" until the backend pipeline is built.

### 8.2 Constraints

1. **Invariant #1 — Engine writes only via the Payload API** so afterChange hooks (ISR `revalidateTag`, Meilisearch index, OG gen) always fire. Direct SQL writes are a P0 bug.
2. **Invariant #2/#3 — Conflict resolution = `lockedFields` + `editedByHuman` + optimistic lock (`version`)**, with `origin: 'engine'|'manual'` required on every article; a human always wins the same field. (Enforcement is Phase E4 — see 8.4.)
3. **Invariant #4 — Paywall is a soft block**: a CMS-configurable meter (default 3, never hardcoded), cookie for guests / DB for signed-in, never blocking mid-article; Phase 1 is a sign-in nudge only, no payment.
4. **Invariant #5/#6 — Sponsored disclosure boxes** appear top+middle+bottom and cannot be dismissed; the AI-assisted inline disclosure was removed 2026-06-05 (`aiAssisted` field retained, Engine still sets it). No popups (except the single cookie banner), no mid-article ads.
5. **Invariant #7 — Brand colors are pinned**: sponsored bg #FEF3C7 (dark #3B2E0A), up #10B981, down #EF4444, dark bg #0F172A / text #E2E8F0; components use CSS variables, never hardcoded rgba (email templates are the sanctioned exception).
6. **Invariant #8 — Pillar/Sub-section/Tag are CMS entities**: adding a pillar is a CMS write; routes/sitemap/RSS regenerate within ≤5 min with no deploy.
7. **Invariant #9/#10 — i18n Year 1 = en/id/vi** with subpath routing, hreflang, and CSS logical properties; only chrome is translated, article body stays source-language; do not hardcode locale lists. (Subpath routing/hreflang not yet shipped — see 8.4.)
8. **Invariant #11 — Tech veto**: no Lucia, no Bun.
9. **Invariant #12 — Compliance**: GDPR + PDPA (Singapore) + Nghị định 13 (Vietnam); PostHog is self-hosted; the cookie banner is dismiss-only ONLY while no non-essential tracking ships (adding PostHog requires Decline to store a distinct gating value first).
10. **Invariant #13 — Awards Year-1 inaugural state**: the Awards page shows only a "coming soon / inaugural" placeholder — no medallion, no previous winners, no categories, no nomination flow (FR-HOME-05, FR-TRUST-15).
11. **Invariant #14 — DTW is a GLOBAL publication**: "Asia" is a vantage/beat, not the scope; the About hero/mission describe APCG (the Asian parent), which stays. Publisher = Asia Press Centre Group (APCG), Singapore, founded 2023; EIC Cheryl Tan with no invented career history; no fabricated awards or tip-line banners.

### 8.3 Phase-2 Deferrals

| Item | Note |
|---|---|
| **Payments** | Stripe Billing (Singapore entity) + VNPay/Momo (Vietnam) + Indonesian gateway. Paywall "Subscribe → /pro" is intentionally not built; Phase 1 is sign-in nudge only. No subscription schema exists yet. |
| **Text-to-Speech (TTS) audio** | `AudioPlayerBar` exists but is unwired; ElevenLabs/OpenAI voice generation + R2 storage deferred (FR-ART-13). |
| **Auto-generated Transparency Report** | `/trust/transparency` is a Year-1 placeholder ("First report drops Q1 2027"); quarterly auto-generation from Corrections + RevenueBreakdown + ReadershipStats is Phase 2 (FR-TRUST-06). |
| **Awards back-end** | Year-1 "coming soon" only — no medallion, previous winners, categories, or nomination flow (FR-HOME-05, FR-TRUST-15). |
| **Full Tiptap / rich editorial editor** | Payload's Lexical editor is used; the fuller editorial editor is deferred. |
| **Newsletter sending pipeline** | BullMQ send worker, Resend Batch (chunks of 100), open/click/bounce webhooks → PostHog, RFC 8058 one-click unsubscribe (FR-NL-10). |
| **Realtime Wire Drops** | Soketi/Pusher WebSocket broadcast; Phase 1 refreshes drops via ISR only (FR-HOME-07, FR-ENG-13). |
| **Meilisearch/Typesense search** | Typo-tolerant, per-locale, faceted (articles+awards+people); Phase 1 is Postgres LIKE over title+dek (FR-SRCH-10, FR-SRCH-11). |
| **PostHog analytics wiring** | Scroll %, dwell, return visits, paywall events, `search_zero_result`, session replay, feature flags; only the anonymous `article_views` aggregate exists today (FR-SRCH-12, HỆ THỐNG row 8). |
| **PWA offline** | Service Worker/Workbox, IndexedDB caching (50 recent + 20 per followed pillar), offline read/queue; only the manifest exists (FR-SYS-03). |
| **Dashboard data pipeline** | DashboardSources adapters, encrypted API keys, ~5-min stock cache, history storage, methodology-from-CMS, SponsorSlots wiring (FR-DASH-14). |
| **Dashboard filters** | Stage / Date-range / Sector filters (only Country implemented). |
| **CSP / rate-limit / WAF** | Infra-level; not in app code yet (NFR-SYS-05). |
| **Subsections taxonomy** | No Subsections collection or `/[pillar]/[subsection]/[slug]` route; `Article.section` is free-text (PILLAR row 3). |
| **AffiliateLinks / `/r/[token]` tracker** | Redirect tracker + commission attribution not built (HỆ THỐNG row 12). |
| **HLS hero video** | Mux/CF Stream autoplay-muted hero video not implemented (ARTICLE row 2). |

### 8.4 Phase E4 — Content Engine enforcement (documented but NOT implemented)

The conflict-resolution machinery is defined in schema and comments but not yet enforced in runtime code, and is the single most important integrity gap:

- **No beforeChange hook** bumps `version` or sets `editedByHuman=true` on CMS writes.
- **No If-Match / optimistic-lock endpoint** exists; the intake path only CREATES published articles (never updates), so the Engine re-sync/conflict scenario cannot yet occur.
- **`lockedFields` and `editedByHuman` are never enforced** against Engine writes.
- **`EngineConflictLog` is never populated** (create/update disabled; the populating detector is Phase E4).
- **Contract divergence:** the documented Author-role Payload REST/GraphQL PATCH flow is not the shipped path; the Engine uses the bespoke `/api/engine/intake` endpoint (bearer token, Local API, publishes directly, bypasses RBAC by design).

### 8.5 Open Decisions

- **Search engine** — Meilisearch vs Typesense for Year 1 (Meilisearch is the current default in context; reversible until index code lands).
- **CMS slot for `dtw-engine`** — Engine stays on the Payload API path by default; direct DB insert + replicated revalidate/index is the fallback only under bulk-volume pressure.
- **Stripe entity** — Singapore (PDPA-aligned); Phase 2, no code yet.
- **Standing content gap** — `/trust/ai` copy still describes the removed inline AI-assisted disclosure (invariant #5); reconcile when the AI policy is finalised. `/newsroom` fabricated content (beats grid, EIC career history, named masthead/bureaus) is backlogged for pre-launch cleanup.

---

*End of document. DTW Web — Functional Requirements Specification v1.0 (Draft), 2026-07-28.*
