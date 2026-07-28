# DTW Web — Business Analysis Documentation

Business-analysis deliverables for **Dailytechwire (`dtw-web`)** — the reading &
presentation layer (Next.js 15 + embedded Payload CMS 3 + Drizzle/Postgres) of the
three-service DTW platform (`dtw-web` · `dtw-engine` · `dtw-workers`, sharing
`packages/db`).

| Document | Purpose |
|---|---|
| [**SRS.md**](./SRS.md) | **Software Requirements Specification** — ISO/IEC/IEEE 29148 (IEEE-830-style): scope, actors, product perspective, external interfaces, a feature-level overview, and the full non-functional / compliance requirement set. Read this first for the *what and why*. |
| [**FRS.md**](./FRS.md) | **Functional Requirements Specification** — every functional requirement in detail (behavior steps, acceptance criteria, business rules), the RBAC permission matrix, business-rules catalog, use cases, data dictionary, and the full requirements-traceability matrix. Read this for the *exact behavior*. |

## Sources of truth

These documents are derived from, and stay subordinate to, the repository's own
authorities (per `process/context/all-context.md`):

1. `DTW_WEBSITE_REQUEST.xlsx` (repo root) — canonical feature spec, **85 feature
   rows** across 14 page-groups (86 sheet rows including the header).
2. The implemented `dtw-web` codebase — authoritative once written. Every requirement
   cites its implementing file(s).
3. `process/context/` — architecture, invariants, stack, and conventions.

## Conventions

- **Requirement IDs:** `FR-<MODULE>-NN` (functional), `BR-<MODULE>-NN` (business rule),
  `UC-<MODULE>-NN` (use case), `NFR-<CATEGORY>-NN` (non-functional). Module codes:
  NAV, HOME, ART, PIL, PAY, DASH, SRCH, NL, AUTH, ACCT, CMS, ENG, TRUST, SYS.
- **Priority:** Must / Should / Could (MoSCoW).
- **Phase:** *Phase 1* = in scope / implemented for launch; *Phase 2* = deferred
  (payments, TTS, auto Transparency Report, Awards back-end, realtime WebSocket push,
  Meilisearch/Typesense backend, PostHog wiring).
- **Traceability:** every canonical spec row maps to FR ID(s) → code reference(s) →
  status (Implemented / Partial / Phase 2 / Gap) in **FRS §7**.

## Coverage at a glance

- 11 functional modules · **182 functional requirements** · **207 business rules** ·
  **19 use cases** · **85 / 85 spec rows traced** (100%).
- All 14 project invariants encoded (SRS §2.5, §5.2, Appendix C; FRS §8.2).

## Known code-vs-spec gaps

The docs describe the system as specified **and** honestly flag where the current code
diverges (rather than silently papering over it). The consolidated list lives in
**SRS Appendix D** and **FRS §8.4–§8.5** — e.g. single vs mandated double opt-in on
newsletters, email+password vs magic-link/OAuth/2FA auth, i18n client-toggle vs
subpath routing + `hreflang`, the not-yet-enforced `lockedFields`/optimistic-lock
conflict layer (Phase E4), dashboards on sample data, and the stale `/trust/ai` copy
(Invariant #5 known gap).

---

*Version 1.0 · 2026-07-28 · Status: Draft for review.*
