# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-09)

**Core value:** Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.
**Current focus:** v2.0 Unified Learning Hub -- Phase 13 (Security Hardening)

## Current Position

Phase: 13 of 17 (Security Hardening)
Plan: 4 of 5 in current phase (13-01 + 13-02 + 13-03 + 13-04 complete)
Status: In progress
Last activity: 2026-02-10 -- Completed 13-02-PLAN.md (CSP Headers)

Progress: [██░░░░░░░░] 2/7 phases (v2.0)
Phase 13: [████████░░] 4/5 plans

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
| 12 (USCIS 2025) | 6/6 | ~48min | ~8min |

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
- [12-02]: RawStateEntry intermediate type for JSON string[] to tuple conversion; allStatesData pre-computed at module level
- [12-02]: DC governor field uses mayor name (Muriel Bowser); territories have senators: null
- [12-04]: DynamicAnswerNote exported from Flashcard3D.tsx for cross-page reuse in test and interview
- [12-04]: Onboarding state step targets body with center placement (no dashboard anchor element yet)
- [12-04]: UpdateBanner in StudyGuidePage embedded in pageHeader constant for all view modes
- [12-05]: 16-case validation test suite as regression guard; exact category distribution counts as snapshot
- [13-03]: display_name validated at DB level with CHECK constraints (no-HTML + length) rather than runtime sanitization
- [13-03]: No DOMPurify needed: zero dangerouslySetInnerHTML with user content, React JSX auto-escapes all text rendering
- [13-03]: Redundant INSERT policies on streak_data and earned_badges documented for future cleanup (not harmful)
- [13-01]: Per-request Supabase client with user Bearer token for JWT verification (not service role key)
- [13-01]: In-memory Map rate limiting appropriate for single-instance Vercel deployment
- [13-01]: getAccessToken() helper extracted outside hook to avoid React Compiler async issues
- [13-04]: Next.js upgraded 15.1.11->15.5.12 (not 16.x) to fix 7 CVEs without breaking changes
- [13-04]: Conservative dep pruning: only removed packages with zero source imports; kept PostCSS/lint-staged/stylelint/coverage deps
- [13-04]: Dependabot ignores major version bumps; groups PRs by dependency type (prod/dev)
- [13-02]: CSP nonce passed via x-nonce request header from middleware to _document getInitialProps
- [13-02]: CSP set in middleware.ts only (not next.config.mjs) to support per-request nonces
- [13-02]: style-src 'unsafe-inline' required for Tailwind + motion/react inline styles

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

Last session: 2026-02-10
Stopped at: Phase 13, Plans 01 + 02 + 03 + 04 complete; Plan 05 remaining
Resume file: .planning/phases/13-security-hardening/13-02-SUMMARY.md

---

*State initialized: 2026-02-05*
*Last updated: 2026-02-10 (Phase 13, Plan 02 complete)*
