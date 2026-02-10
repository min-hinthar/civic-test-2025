# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-09)

**Core value:** Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.
**Current focus:** v2.0 Unified Learning Hub -- Phase 14 (Unified Navigation)

## Current Position

Phase: 14 of 17 (Unified Navigation)
Plan: 7 of 7 in current phase
Status: Phase complete (pending human verification sign-off)
Last activity: 2026-02-10 -- Completed 14-07-PLAN.md (Verification)

Progress: [████░░░░░░] 4/7 phases (v2.0)
Phase 14: [██████████] 7/7 plans

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
| 13 (security) | 5/5 | ~113min | ~23min |
| 14 (navigation) | 7/7 | ~38min | ~5min |

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
- [13-05]: Dev mode CSP adds unsafe-eval for webpack HMR; prod remains nonce-only
- [13-05]: blob: in worker-src for Sentry Replay; accounts.google.com in style-src + connect-src for Google Sign-In
- [13-05]: apple-mobile-web-app-capable replaced with standards-compliant mobile-web-app-capable
- [14-01]: Sidebar state persisted to localStorage under key 'sidebar-expanded' (Claude discretion)
- [14-01]: Single-state object pattern for sidebar tier sync avoids React Compiler setState-in-effect violation
- [14-01]: SW update check uses setTimeout(0) to avoid synchronous setState in effect body
- [14-02]: Hooks placed before HIDDEN_ROUTES early return to satisfy React rules-of-hooks
- [14-02]: SidebarUtilityButton extracted as separate function component for utility controls
- [14-02]: CSS tooltips via [data-tooltip]::after in globals.css (no JS tooltip library)
- [14-02]: GlassHeader uses sticky (not fixed) with z-30 to stay below sidebar z-40
- [14-03]: lockMessage not destructured at BottomTabBar level -- NavItem handles lock tap internally
- [14-04]: Removed HistoryPage/SocialHubPage imports from AppShell since those routes now redirect
- [14-04]: RedirectWithLoading shows spinner alongside Navigate for hash-based route redirects
- [14-04]: Existing strings.nav keys preserved for backward compatibility with AppNavigation and page headers
- [14-05]: Lock all interview phases (not just realistic mode) via setLock -- consistent with test/practice lock behavior
- [14-05]: Lock message simplified to English-only string -- NavigationProvider/NavItem handles bilingual toast internally
- [14-05]: Unmount cleanup effect on all lock pages ensures lock is always released even on unexpected navigation
- [14-06]: useState "adjust state when props change" pattern for PageTransition direction tracking (avoids React Compiler ref-in-render)
- [14-06]: Tour reduced from 8 to 7 steps: SRS deck merged into Study tab step, theme customization step removed
- [14-06]: getNavPlacement() uses window.innerWidth >= 768 for responsive tour step placement
- [14-07]: All 8 automated verification checks passed on first run -- zero code fixes needed

### Key Learnings (from v2.0 Phase 11)

- Migration script ordering matters: broader patterns (bg-success-50) match substrings of narrower ones (bg-success-500)
- Primitive tokens (success-50, warning-500) look fine in light mode but blend in dark mode -- always use semantic equivalents
- Accent color semantic token becomes surface tint in dark mode -- not suitable for solid action buttons
- Stale .next cache after many HMR recompilations causes server errors -- delete .next and restart

### Blockers/Concerns

- USCIS 128Q: RESOLVED (12-01) -- 8 missing questions identified and added (GOV-P17, GOV-S40-S46), bank now at 128
- Navigation restructure will break onboarding tour targets (data-tour attributes) -- RESOLVED (14-06): tour now targets nav items
- Progress Hub consolidation must preserve all hash-based deep links used by push notifications and SRS

## Session Continuity

Last session: 2026-02-10
Stopped at: Phase 14 complete (all 7 plans); pending human visual verification sign-off
Resume file: .planning/phases/14-unified-navigation/14-07-SUMMARY.md

---

*State initialized: 2026-02-05*
*Last updated: 2026-02-10 (Phase 14 plan 07 complete)*
