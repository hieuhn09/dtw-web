# Disclosure blocks redesign — shared spec (approved by owner 05-11-26)

Applies to: gcv-web, wad-web, brief-asia-web, dtw-web (OTW), wtb-web.
Mockups: /tmp/claude-0/-home-user/d101e965-8260-5b37-bde2-a906d6d69db7/scratchpad/redesign/{gcv,wad,ba,otw,wtb}.png
Mockup HTML (exact CSS): /tmp/claude-0/-home-user/d101e965-8260-5b37-bde2-a906d6d69db7/scratchpad/redesign/page.html

## Owner decisions (locked)
1. Article page shows the sponsored disclosure EXACTLY ONCE, at the END of the body. No top box, no middle box, no reminder. Not dismissable.
2. Light, quiet design. One shared pattern across all 5 sites, skinned with each site's own tokens (CSS vars) and fonts. No hardcoded hex colors (except OTW keeps its pinned `--sponsored` token as note background).
3. AI-assisted stays NOT displayed (existing product decision). Do not add any AI UI.
4. Design must work in dark mode via existing CSS vars.

## Components

### A. Kicker labels in the article header
In the existing article header kicker/meta row (where pillar/section label lives), append small text items, separated with the site's existing separator (" · " style):
- `Deep Dive` when `article.deepDive` — color `var(--muted)`.
- `Paid Partner` when `article.sponsored` — color `var(--faint)` (or nearest muted-meta token).
Style = the site's existing kicker style (uppercase, same size/weight/letter-spacing as the pillar kicker). Plain text, NO chip background, NO border.
OTW: replace the existing hardcoded "DEEP DIVE" (ink bg chip) and "PAID PARTNER · {sponsor}" (#FEF3C7/#7A5800/#E0B900 chip) with these text labels.

### B. End-of-article disclosure note (sponsored + affiliate), one shared component
Placed after the article body, before tags/topics/"Filed under". Order: sponsored note first, then affiliate note. Only rendered when the flag is true.

Markup shape: `<aside>` with a label line + one paragraph.
- Container: `border-left: 2px solid var(--accent)`; `padding: 6px 0 6px 14px`; `margin: 22px 0` (adjust to site rhythm); background transparent; no radius; no icon.
  - OTW only: background `var(--sponsored)` (pinned token, #FEF3C7 / dark #3B2E0A), padding `10px 14px`, radius `0 4px 4px 0`.
- Label: site kicker style (uppercase, ~10px, site kicker weight/letter-spacing), color `var(--accent-ink)` (readable small accent; WTB: bronze/`--bronze`, gold in dark if site already does that).
- Body: 13px / 1.55, color `var(--muted)` (WTB: `--text-soft`), site sans font.
- Affiliate variant: border-left color `var(--line-strong)` / `--hair-2` (neutral), label color `var(--muted)`.

Copy (EN):
- Sponsored label: `Paid Partner · {sponsor}` (just `Paid Partner` when sponsor empty).
- Sponsored body: `Produced by {Site} Studio for {sponsor}. The {Site} newsroom was not involved.` (no sponsor: `Produced by {Site} Studio. The {Site} newsroom was not involved.`)
- Affiliate label: `Affiliate links`
- Affiliate body: `Some links in this story earn {Site} a commission. Our recommendations are made independently.`
{Site} = Global Chic Voyage / World Archi Design / BriefAsia / Opentechwire (studio name stays "OTW Studio" if that is existing copy — keep existing studio name) / WorldTravelBrief.
i18n: follow each repo's existing chrome i18n pattern (GCV and OTW already translate the sponsored label via `t(en, vi, id)` — keep translating; BriefAsia is English-only by owner decision; WAD EN-only).

### C. Card label (listing)
On the main article card/list components that can show a sponsored article, add a small kicker line above the title: `Paid Partner · {sponsor}` in site kicker style, color `var(--faint)`. Only if the card's data already carries (or can cheaply carry) `sponsored`/`sponsor`. Keep scope minimal: the primary card + list-row components; do not refactor.

## Remove
- Top and middle disclosure boxes, the `splitBody` middle-insertion logic used only for the reminder, the "· reminder (middle|bottom)" suffix.
- `$` icon box, hardcoded `#E0B900` border, old affiliate band styling (replace with component B).
- Dead `DisclosureBox kind="ai"` branch may be removed if the component is rewritten (no behavior change — it is never mounted).

## Copy/policy pages to reconcile
Update policy/trust copy that promises something the new design does not do, so it says: "a 'Paid Partner' label at the top of the article and a disclosure note at the end; it cannot be switched off" and for affiliate "a note at the end of the article". Remove promises of yellow backgrounds (except OTW, which keeps the yellow note), top/middle/bottom boxes, `$` icon + tooltip on each link.

## Out of scope
- Homepage sponsored strips / Deep Dive bands / Best-of bands (currently unmounted dead code) — leave untouched.
- AI-assisted display, /trust/ai copy (separate decision).
- CMS changes.
