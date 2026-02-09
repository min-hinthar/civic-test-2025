# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-09)

**Core value:** Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.
**Current focus:** v2.0 Unified Learning Hub -- Phase 11 (Design Token Foundation)

## Current Position

Phase: 11 of 17 (Design Token Foundation)
Plan: 6 of 7 completed (01, 02, 03, 04, 05, 06 done; 07 remaining)
Status: In progress
Last activity: 2026-02-09 -- Completed 11-04-PLAN.md (High/Medium Complexity Token Migration)

Progress: [██████░░░░] 6/7 plans (Phase 11)

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
| 11 (tokens) | 6/7 | 82min | 14min |

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v2.0 roadmap]: UISYS-01 (tokens) separated into own phase; remaining UISYS (glass, touch, micro-interactions) deferred to Phase 17 after all layout changes stabilize
- [v2.0 roadmap]: Phases 11-13 are independent foundations (tokens, USCIS data, security) before structural UI changes begin in Phase 14
- [v2.0 roadmap]: BRMSE (Burmese translation trust) deferred to v2.1+ per requirements scoping
- [11-01]: Backward compat aliases added in tokens.css for all old CSS variable names (--background, --card, --primary-700, etc.) to avoid big-bang component migration
- [11-01]: Border radius --radius alias now points to --radius-xl (1.25rem) instead of old 0.85rem
- [11-01]: Dark mode override blocks removed from globals.css -- token system handles dark mode automatically via .dark semantic overrides
- [11-02]: Theme transition uses temporary CSS class (theme-transitioning) on html/body/page-shell only, removed after 500ms -- avoids global * transition jank
- [11-02]: System preference listener defers to manual override (localStorage key exists = ignore OS changes)
- [11-03]: getToken/getTokenColor utility kept minimal (2 functions, no deps) -- canvas/chart components import directly from @/lib/tokens
- [11-03]: Dead code design-tokens.ts deleted (113 lines, zero imports confirmed)
- [11-06]: Decorative gradients use approximate semantic tokens (patriotic-red, primary, secondary, accent-purple, etc.) rather than pixel-perfect rgba matching
- [11-06]: New --green-700 primitive (142 76% 30%) and semantic active tokens (success-active, destructive-active, accent-purple-active) added to tokens.css
- [11-05]: bg-white -> bg-surface universally; contrast for buttons on dark backgrounds handled at token level, not component level
- [11-05]: 19 structural dark: overrides retained in non-SKIP files (7 dark:shadow-[rgba(...)], 12 text-success-600 dark:text-success pairs)
- [11-05]: Data viz files (CategoryGrid, StreakHeatmap, Flashcard3D, CategoryRing) exempt from amber/emerald -> warning/success migration
- [11-04]: Timer stage colors (blue->yellow->orange->red) kept as hardcoded HSL constants -- semantic timer stages, not theme colors
- [11-04]: Data-viz heatmap intensity cells kept as Tailwind palette classes (orange-200/400/500, blue-200 freeze) per data-viz exemption
- [11-04]: Snap-to-token simplification: multiple gray shades consolidated to single semantic equivalent (intentional, not regression)

### Key Learnings (from v1.0)

- React Compiler ESLint rules require specific patterns (no setState in effects, no ref.current in render)
- motion/react inline transforms override CSS centering -- use flexbox wrappers
- Lazy useState initializers instead of useRef for React Compiler purity

### Blockers/Concerns

- USCIS 128Q: 8 questions missing from current 120-question bank; need to cross-reference official PDF to identify which ones
- Navigation restructure will break onboarding tour targets (data-tour attributes) -- must audit before changes
- Progress Hub consolidation must preserve all hash-based deep links used by push notifications and SRS

## Session Continuity

Last session: 2026-02-09
Stopped at: Phase 11 plan 04 complete; only 07 (final audit) remaining
Resume file: .planning/phases/11-design-token-foundation/11-07-PLAN.md

---

*State initialized: 2026-02-05*
*Last updated: 2026-02-09 (11-04 high/medium complexity token migration complete)*
