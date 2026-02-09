# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-09)

**Core value:** Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.
**Current focus:** v2.0 Unified Learning Hub -- Phase 12 (USCIS 2025 Question Bank)

## Current Position

Phase: 12 of 17 (USCIS 2025 Question Bank)
Plan: 1 of 6 in current phase (2 completed: 12-01, 12-03)
Status: In progress
Last activity: 2026-02-09 -- Completed 12-01-PLAN.md (Question Bank Expansion)

Progress: [█░░░░░░░░░] 1/7 phases (v2.0)

## Completed Milestones

| Version | Date | Phases | Plans | Requirements |
|---------|------|--------|-------|-------------|
| v1.0 | 2026-02-08 | 10 | 72 | 55/55 |

See `.planning/milestones/v1.0/` for full archive.

## Performance Metrics

**Velocity (v1.0 baseline):**
- Total plans completed: 72
- Average duration: ~11 min
- Total execution time: ~14 hours

**By Phase (v2.0):**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 11 (tokens) | 7/7 | ~90min | ~13min |
| 12 (USCIS 2025) | 2/6 | ~16min | ~8min |

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v2.0 roadmap]: UISYS-01 (tokens) separated into own phase; remaining UISYS (glass, touch, micro-interactions) deferred to Phase 17 after all layout changes stabilize
- [v2.0 roadmap]: Phases 11-13 are independent foundations (tokens, USCIS data, security) before structural UI changes begin in Phase 14
- [v2.0 roadmap]: BRMSE (Burmese translation trust) deferred to v2.1+ per requirements scoping
- [11-01]: Backward compat aliases added in tokens.css for all old CSS variable names
- [11-02]: FOUC prevention via blocking script in _document.tsx; theme-transitioning class for smooth toggle
- [11-03]: getToken/getTokenColor utility kept minimal; design-tokens.ts deleted
- [11-04]: Timer stage colors kept as hardcoded HSL; data-viz heatmap cells kept as palette classes
- [11-05]: 63 files bulk-migrated; 19 structural dark: overrides retained
- [11-06]: Decorative gradients use approximate semantic tokens; 3 new active tokens added
- [11-07]: Migration quality fixes: primitive→semantic (141 instances), subtle0 bug (8 instances), accent→accent-purple for Interview button, nav highlight boosted to /20
- [12-01]: 8 new questions added to uscis-2025-additions.ts to keep additions grouped; per-question lastVerified dates for accurate election cycle tracking
- [12-01]: DynamicAnswerMeta.type discriminates 'time' vs 'state' for distinct UI handling
- [12-03]: Used warning-subtle token for MapPin icon bg (accent-subtle not defined in Tailwind config)
- [12-03]: Returning user detection via civic-prep-* localStorage key prefix; useWhatsNew with lazy initializer

### Key Learnings (from v2.0 Phase 11)

- Migration script ordering matters: broader patterns (bg-success-50) match substrings of narrower ones (bg-success-500)
- Primitive tokens (success-50, warning-500) look fine in light mode but blend in dark mode -- always use semantic equivalents
- Accent color semantic token becomes surface tint in dark mode -- not suitable for solid action buttons
- Stale .next cache after many HMR recompilations causes server errors -- delete .next and restart

### Blockers/Concerns

- USCIS 128Q: RESOLVED (12-01) -- 8 missing questions identified and added (GOV-P17, GOV-S40-S46), bank now at 128
- Navigation restructure will break onboarding tour targets (data-tour attributes) -- must audit before changes
- Progress Hub consolidation must preserve all hash-based deep links used by push notifications and SRS

## Session Continuity

Last session: 2026-02-09
Stopped at: Phase 12 in progress; completed 12-01 (Question Bank Expansion) and 12-03 (Update Indicator UI)
Resume file: .planning/phases/12-uscis-2025-question-bank/12-01-SUMMARY.md

---

*State initialized: 2026-02-05*
*Last updated: 2026-02-09 (12-01 complete)*
