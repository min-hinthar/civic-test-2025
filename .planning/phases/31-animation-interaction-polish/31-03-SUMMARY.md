---
phase: 31-animation-interaction-polish
plan: 03
subsystem: ui
tags: [css, glass-morphism, noise-texture, dark-mode, accessibility]

# Dependency graph
requires:
  - phase: 27-glass-morphism
    provides: Three-tier glass-morphism system (light/medium/heavy)
provides:
  - Glass noise texture overlay for realistic frosted appearance
  - Text-shadow for WCAG readability on glass surfaces
  - Light refraction edge highlight via outline
  - Smoky dark mode glass treatment with increased opacity
  - prefers-reduced-motion support for noise texture
  - Tier assignment guide comment documenting all glass usage
  - Heavy tier --glass-tint CSS custom property support
affects: [glass-morphism, dark-mode, accessibility, animation-interaction-polish]

# Tech tracking
tech-stack:
  added: []
  patterns: [svg-noise-texture-overlay, outline-edge-highlight, css-custom-property-tint]

key-files:
  created: []
  modified:
    - src/styles/globals.css
    - src/styles/tokens.css
    - src/components/hub/HistoryTab.tsx

key-decisions:
  - "Used outline with negative offset for edge highlight to avoid border/box-shadow conflicts"
  - "Dark mode glass opacity bumped (0.55/0.45/0.35) for smokier car-window feel"
  - "Purple tint gradient increased from 0.05 to 0.08 in dark mode for richer glass personality"
  - "All tier assignments verified correct in Phase 31 audit -- no mismatches found"

patterns-established:
  - "Glass noise texture: ::before pseudo-element with SVG feTurbulence, pointer-events: none, z-index: 0"
  - "Edge highlight: outline with negative offset avoids CSS property conflicts"
  - "Tier guide: light=cards/sections, medium=hero/nav-headers, heavy=modals/overlays/nav-chrome"

requirements-completed: [ANIM-05]

# Metrics
duration: 26min
completed: 2026-02-20
---

# Phase 31 Plan 03: Glass-morphism Polish Summary

**Realistic frosted glass with SVG noise texture, text-shadow readability, edge highlight, and smoky dark mode treatment across all three glass tiers**

## Performance

- **Duration:** 26 min
- **Started:** 2026-02-20T12:10:13Z
- **Completed:** 2026-02-20T12:36:13Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- SVG noise/grain texture overlay on all glass tiers via ::before pseudo-element (0.03 light, 0.06 dark opacity)
- Text-shadow for WCAG readability on glass surfaces (light: background-tinted, dark: black shadow)
- Light refraction edge highlight using outline with negative offset (avoids border/box-shadow conflicts)
- Dark mode smoky glass treatment with increased opacity values and stronger purple tint gradient
- prefers-reduced-motion removes noise texture for performance on constrained devices
- Legacy glass-card usage in HistoryTab.tsx migrated to canonical glass-light tier
- Complete tier assignment audit across all components documented in CSS guide comment

## Task Commits

Each task was committed atomically:

1. **Task 1: Add noise texture, text-shadow, border, and shadow to glass tiers** - `c17a85e` (feat)
2. **Task 2: Migrate HistoryTab glass-card usage and audit glass tier assignments** - `7fb0a87` (fix)

## Files Created/Modified
- `src/styles/globals.css` - Glass noise texture, text-shadow, outline highlight, reduced-motion, tier guide comment
- `src/styles/tokens.css` - Dark mode glass opacity values bumped for smokier feel
- `src/components/hub/HistoryTab.tsx` - Migrated glass-card to glass-light in both skeleton sections

## Decisions Made
- Used `outline` with `outline-offset: -1px` for the light refraction edge highlight instead of `border` (avoids conflicts with existing Tailwind border classes and box-shadow declarations)
- Bumped dark mode glass opacity values from 0.5/0.4/0.3 to 0.55/0.45/0.35 for smokier, denser feel
- Increased dark mode purple tint gradient from 0.05 to 0.08 for richer smoky glass personality
- Set `z-index: 0` on noise ::before pseudo-element (content naturally stacks above via DOM order)
- All tier assignments across the codebase verified correct in audit -- no mismatches found

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- OneDrive webpack cache corruption during build (known issue) -- resolved by renaming .next directory
- 8 pre-existing stylelint errors for -webkit-backdrop-filter in multi-line declarations (out of scope)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Glass-morphism visual polish complete with noise texture, readability, and dark mode treatment
- All glass tier assignments verified correct across the codebase
- Ready for remaining animation/interaction polish plans

## Self-Check: PASSED

All files exist, all commits verified.

---
*Phase: 31-animation-interaction-polish*
*Completed: 2026-02-20*
