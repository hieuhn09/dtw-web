---
name: spec:otw-exclusive
description: "Exclusive section for Opentechwire: editor-set flag, /exclusive page, homepage band, chips, nav link, RSS, Editorial Standards definition"
date: 20-10-26
feature: homepage
---

# Opentechwire "Exclusive" section - SPEC

## Summary

Opentechwire (OTW) gets an "Exclusive" label for stories built on reporting we did ourselves (a story we broke, a document we obtained, an interview we conducted). Editors tick an existing "Exclusive" checkbox in the CMS; the article stays in its normal topic pillar. Readers can then find exclusives in one place: a `/exclusive` page, a homepage band, a nav link, an "Exclusive" chip on article cards, and a dedicated RSS feed. The Editorial Standards page explains what qualifies. One small copy change in the CMS (apcg-cms) makes the checkbox description neutral for every publication.

## User Stories

- As a reader, I want one page listing all Opentechwire exclusives, so I can see the original reporting without hunting through pillars.
- As a reader, I want a visible "Exclusive" chip wherever an exclusive story appears, so I can recognise original reporting at a glance.
- As a reader, I want to know what "Exclusive" means, so I can trust the label.
- As a reader who uses a feed reader, I want an Exclusive-only RSS feed, so I can subscribe to original reporting alone.
- As an editor, I want to flag an article Exclusive with the existing checkbox and have the site update itself, so no developer is needed.
- As an editor on any APCG publication, I want the checkbox help text to make sense for my title, not just BriefAsia.

## What The User Wants (Behavioral Outcomes)

1. An article flagged Exclusive stays in its pillar (ai, startups, latest, dev, products, policy) and also appears in the Exclusive surfaces.
2. `/exclusive` lists exclusive articles newest first, paginated; page 1 lives at the bare URL; a page past the end shows "not found".
3. Homepage shows an Exclusive band with the latest few exclusives and a "See all" link to `/exclusive`; with no exclusives the band is absent (no empty box).
4. Desktop and mobile navigation include an "Exclusive" link.
5. Every card/row showing an exclusive article carries an "Exclusive" chip: homepage bands, pillar pages, related row, search results, account lists (saved/history/queue), newsletters content, and the article page. The chip is hidden on `/exclusive` itself (redundant). On the article page it links to the Editorial Standards definition.
6. An Exclusive RSS feed exists.
7. Editorial Standards contains an "Exclusive" section with the qualifying definition.
8. An exclusive article may be the homepage hero.
9. CMS checkbox description is tenant-neutral. No behavior change.
10. Chrome strings (nav label, chip, band title, page title, empty state) are translated for en/id/vi; article bodies are not (invariants #9, #10).

## Flow / State Diagram

```
Editor ticks "Exclusive" in CMS (Central CMS, tenant dtw)
        |
        v
CMS saves -> revalidation webhook -> OTW caches refresh
        |
        +--> Article page: chip (links to /editorial-standards#exclusive)
        +--> Cards/rows anywhere: chip
        +--> Homepage: Exclusive band (latest N, "See all")
        +--> /exclusive (page 1 = bare URL) -> /exclusive/page/2 ...
        +--> Exclusive RSS feed
        +--> Nav link (desktop + mobile) -> /exclusive

Branches:
  no exclusives yet    -> band hidden; /exclusive shows empty-state copy
  page past the end    -> 404
  /exclusive/page/1    -> redirect to /exclusive
  untick the checkbox  -> article disappears from all Exclusive surfaces (stays in its pillar)
```

## Acceptance Criteria (Testable Outcomes)

Test grounding: research found no automated tests for these surfaces (only bot-detect and signup-guard tests exist). Strategy is therefore Hybrid: new scoped node:test unit tests for pure logic (pagination, chip eligibility, label/feed building) plus agent-probe against a local build with a seeded flagged article. Where a fully-automated gate is not possible the residual is named.

1. A flagged article appears on `/exclusive` and an unflagged one does not; ordering is newest first.
   proven by: unit test on list/filter logic + probe with seeded articles; strategy: Hybrid
2. `/exclusive` paginates; `/exclusive/page/1` redirects to `/exclusive`; a page past the end returns 404.
   proven by: unit test on page math + HTTP probe of the three URLs; strategy: Hybrid
3. Homepage shows an Exclusive band with the latest exclusives and a working "See all" link; with zero exclusives the band does not render.
   proven by: probe with and without flagged data; strategy: Agent-Probe
4. Nav shows "Exclusive" on desktop and in the mobile drawer, linking to `/exclusive`, in en/id/vi.
   proven by: probe (render check per locale); strategy: Agent-Probe
5. The "Exclusive" chip shows on every listed surface (homepage bands, pillar pages, related row, search, account lists, newsletters content, article page) for flagged articles only; absent on unflagged and on `/exclusive`.
   proven by: unit test on one shared eligibility rule + surface-by-surface probe; strategy: Hybrid
6. Article-page chip links to the Exclusive definition in Editorial Standards, and that section exists with agreed wording using "Opentechwire" casing.
   proven by: probe of link target + text grep for forbidden casing "OpenTechWire"; strategy: Hybrid
7. Exclusive RSS feed is valid, lists only exclusives newest first, and is advertised from `/exclusive`.
   proven by: feed-builder unit test + XML validity probe; strategy: Hybrid
8. A flagged article can be the homepage hero, and still appears in its pillar.
   proven by: probe with a flagged newest article; strategy: Agent-Probe
9. A Sponsored (Paid Partner) article that is also Exclusive shows both labels without breaking the sponsored disclosure boxes (still non-dismissible, invariant #5).
   proven by: probe of a dual-flag article; strategy: Agent-Probe
10. Chip uses only existing OTW design tokens; dark mode works; no hardcoded colors (invariant #7).
    proven by: lint/grep of new styles for hex values + dark-mode probe; strategy: Hybrid
11. CMS: the `exclusive` checkbox description no longer mentions BriefAsia and reads sensibly for any tenant; no schema/migration change; apcg-cms typecheck passes.
    proven by: diff review + `npm run typecheck` in apcg-cms; strategy: Fully-Automated
12. No other tenant's site and no CMS behavior (permissions, API) changes.
    proven by: diff scope check (copy-only in apcg-cms); strategy: Fully-Automated
13. dtw-web typecheck and lint pass; new unit tests pass.
    proven by: repo typecheck/lint + scoped test script; strategy: Fully-Automated

## Out Of Scope

- A separate "exclusive" pillar (GCV model) - rejected.
- The content engine or APCGHub hub authoring setting the flag (they cannot today; exclusives stay hand-flagged).
- Paywalling or metering exclusives differently.
- BriefAsia's Vietnam-specific filter.
- Any change to other tenants' sites (BriefAsia, GCV, etc.).
- CMS permission, schema or API changes; migration.
- Translating article bodies; localizing beyond en/id/vi.
- Dashboards/newsletter-sending changes.

## Constraints

- Brand: "Opentechwire" in prose and metadata; never "OpenTechWire"; tenant slug `dtw` unchanged (invariant #15).
- Reuse existing design tokens, no new color system; dark mode must work (invariant #7).
- No popups, no in-article ads (invariant #6); sponsored disclosure rules unchanged (#5).
- Global positioning copy; do not scope the label to Asia (invariant #14).
- Reader reads only from Central CMS over HTTP; the public API already supports `flag=exclusive` (one flag per request) and returns `exclusive` in article JSON.
- Only systemAdmin or websiteAdmin/editor of the tenant can tick the flag.
- Two repos: dtw-web (nearly all work), apcg-cms (one copy change, ships to all tenants' editors).
- Pages use flat `/article/{slug}` URLs; no breadcrumb component exists.

## Open Questions (each with recommended default; owner: user)

1. Homepage band position and card count. Default: 3 cards, directly after the Deep Dive band (or after the Brief band if Deep Dive is absent).
2. Nav link position. Default: first item after the pillar links, before Briefing in `NAV_EXTRA`.
3. Chip color token. Default: reuse the brand coral accent (`--accent` / `--accent-ink`) as outlined chip, not the sponsored amber.
4. id/vi chip and chrome translations. Default: "Exclusive" kept in English for id; vi "Độc quyền" - owner/translator to confirm.
5. Editorial Standards wording. Default: "Apply this label only when the story rests on reporting Opentechwire did itself: a story we broke, a document we obtained, or an interview we conducted. Aggregation, translation, wire copy and press releases do not qualify."
6. RSS URL. Default: `/feed/exclusive.xml` (follow the existing feed URL pattern if one differs).
7. CMS checkbox neutral wording. Default: "Mark only when the story rests on reporting this publication did itself (a story we broke, a document we obtained, an interview we conducted). Not for aggregation, translation, wire copy or press releases."
8. Sponsored + Exclusive together. Default: forbid by editorial rule (document in Editorial Standards) but render both labels if it happens, no code block.
9. Empty-state copy for `/exclusive`. Default: "No exclusives published yet. Check back soon."
10. Page size. Default: 12 per page.
11. Should an article flagged both Exclusive and Deep Dive appear in both bands? Default: yes, no de-duplication (chip still shown).

### Resolved 20-10-26 (owner: ok)

1. Band: 3 cards, directly after the Deep Dive band (after the Brief band if Deep Dive is absent).
2. Nav: first item after the pillar links, before Briefing in `NAV_EXTRA` (desktop + mobile).
3. Chip color: existing `--accent` / `--accent-ink`, outlined, light + dark; no new token family.
4. Labels: en "Exclusive", vi "Độc quyền", id "Eksklusif" (id is no longer left in English).
5. Editorial Standards wording: as proposed, plus the rule that Sponsored (Paid Partner) articles must not be flagged Exclusive.
6. RSS URL: `/exclusive/rss.xml` (replaces the `/feed/exclusive.xml` default).
7. CMS checkbox wording: as proposed (neutral, "this publication").
8. Sponsored + Exclusive: forbidden by editorial rule; if it happens, render both labels, no code block.
9. Empty state: "No exclusives published yet. Check back soon."
10. Page size: 12.
11. Exclusive + Deep Dive: appears in both bands, no de-duplication. Exclusive articles may also be the homepage hero.

## Risks / Known Gaps

- No existing automated test coverage on these surfaces; verification partly manual probe (see criteria).
- The CMS copy change reaches every tenant's editors; wording must stay neutral.
- Hand-flagging only: the section stays empty until editors use the checkbox; consider seeding one real exclusive before launch.
- Chip on many surfaces means many touch points; risk of one surface being missed (criterion 5 enumerates them).
- Translated chrome (id/vi) needs owner confirmation.

## Background / Research Findings

- Owner locked: BriefAsia model (flag on topical-pillar article), all four scope items, exclusives may be homepage hero, CMS checkbox description made tenant-neutral.
- CMS: `Articles.exclusive` checkbox exists for all tenants (`apcg-cms src/collections/Articles.ts:379-392`, description at 389-390; permission `canFlagExclusive` 37-57); public API `flag=exclusive` at `src/app/api/public/articles/route.ts:185`.
- dtw-web: `central-api.ts:123` flag type lacks exclusive; `ArticleView` has no exclusive field; nearest pattern is the `deepDive` flag + `components/home/deep-dive.tsx`; extra nav links in `NAV_EXTRA` (`lib/data.ts`); shared chip primitive `packages/ui/src/pillar-tag.tsx`.
- Reference: BriefAsia has `/exclusive` page + paging, `ExclusiveBand`, `ExclusiveChip`, Editorial Standards anchor, RSS feed, nav link, sitemap entry.
- Design tokens (uxui): `--accent #D4623C`, `--accent-ink #B14A28`, `--sponsored #FEF3C7` (dark `#3B2E0A`).
