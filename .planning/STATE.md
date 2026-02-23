# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-23)

**Core value:** Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.
**Current focus:** Phase 39 - Next.js 16 Upgrade and Tooling

## Current Position

Phase: 39 of 47 (Next.js 16 Upgrade and Tooling)
Plan: 1 of 4 in current phase
Status: Executing
Last activity: 2026-02-23 -- Completed 39-01 (non-Next.js dependency upgrades)

Progress: [#.........] 3%

## Performance Metrics

**Velocity:**
- Total plans completed: 248 (across v1.0-v3.0)
- v4.0 plans completed: 1
- Total execution time: 12min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 39 | 1/4 | 12min | 12min |

**Recent Trend:**
- 39-01: 12min (dependency upgrade, 1 task)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- v4.0: Use `--webpack` flag for Next.js 16 build (Turbopack incompatible with Sentry + Serwist plugin chain)
- v4.0: Migrate all routes in one phase (mixed Pages/App Router causes hard navigations destroying state)
- v4.0: Accept enter-only page transitions (App Router does not support AnimatePresence exit animations)
- v4.0: English-only mnemonics initially (Burmese mnemonics need native speaker - BRMSE-01)
- 39-01: Keep tailwindcss at v3 (v4 requires architectural rewrite), eslint at v9, @types/node at v22
- 39-01: Upgrade TypeScript 5.8->5.9, all other non-Next deps to latest

### Pending Todos

None yet.

### Blockers/Concerns

- FSRS retrievability projection API needs verification before Phase 43 (readiness engine)
- Serwist Turbopack stability uncertain -- keep `--webpack` fallback through Phase 47
- Exit animation regression accepted for v4.0 (revisit with ViewTransition API later)

## Session Continuity

Last session: 2026-02-23
Stopped at: Completed 39-01-PLAN.md
Resume file: None
