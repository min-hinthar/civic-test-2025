---
phase: 11-design-token-foundation
plan: 01
subsystem: ui
tags: [css-custom-properties, tailwind, design-tokens, dark-mode, theming]

# Dependency graph
requires: []
provides:
  - "Complete two-tier design token system (primitives + semantic) in src/styles/tokens.css"
  - "Tailwind config consuming CSS variables for all colors, shadows, radii, durations"
  - "Backward-compatible CSS variable aliases for all existing component references"
  - "Dark mode semantic token overrides (soft navy palette)"
affects: [11-02, 11-03, 11-04, 11-05, 11-06, 11-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Two-tier token architecture: primitives (--blue-500) + semantic (--color-primary)"
    - "HSL channels only in CSS vars, hsl() wrapper at consumption point"
    - "Backward compat aliases: old names (--background, --card) mapped to new semantic tokens"
    - "Tailwind config references CSS vars via hsl(var(--token-name))"

key-files:
  created:
    - "src/styles/tokens.css"
  modified:
    - "tailwind.config.js"
    - "src/styles/globals.css"

key-decisions:
  - "Backward compatibility aliases added in tokens.css to avoid breaking existing component references to old variable names (--background, --card, --primary-700, etc.)"
  - "Primitive shades in dark mode are inverted (--primary-50 becomes dark, --primary-900 becomes light) for dark mode readability"
  - "Border radius --radius backward compat alias points to --radius-xl (1.25rem) instead of old 0.85rem"
  - "chunky-shadow utilities now reference token variables instead of hardcoded HSL values"
  - "Dark mode override blocks (.dark .bg-primary-500, .dark .shadow-lg, etc.) removed - token system handles these automatically"

patterns-established:
  - "Token file location: src/styles/tokens.css, imported by globals.css"
  - "Color token format: HSL channels only (217 91% 60%), no hsl() wrapper"
  - "Semantic tokens reference primitives via var(): --color-primary: var(--blue-500)"
  - "Tailwind colors: hsl(var(--color-semantic-name)) for semantic, hsl(var(--blue-NNN)) for primitive"
  - "Dark theme: only semantic tokens overridden in .dark block, primitives unchanged"
  - "Non-color tokens: --radius-*, --shadow-*, --duration-*, --ease-*, --font-*"

# Metrics
duration: 8min
completed: 2026-02-09
---

# Phase 11 Plan 01: Design Token Foundation Summary

**Two-tier CSS custom property token system (primitives + semantics) with Tailwind integration, dark mode overrides, and full backward compatibility with existing 103 components**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-09T11:01:26Z
- **Completed:** 2026-02-09T11:09:50Z
- **Tasks:** 2
- **Files modified:** 3 (1 created, 2 modified)

## Accomplishments
- Created comprehensive tokens.css with 12 primitive palettes (~60 color values), ~30 semantic color tokens, and non-color tokens (spacing, radius, shadows, motion, typography)
- Restructured Tailwind config to consume CSS variables for all colors (48 semantic references), plus borderRadius, boxShadow, and transitionDuration
- Slimmed globals.css by ~130 lines (removed all :root and .dark variable blocks plus 14 manual dark override blocks)
- Added backward compatibility aliases so all 103 existing components work unchanged (no visual regression)
- Build passes cleanly after restructure

## Task Commits

Each task was committed atomically:

1. **Task 1: Create tokens.css with two-tier token architecture** - `7769817` (feat)
2. **Task 2: Restructure Tailwind config and slim down globals.css** - `6d4a443` (feat)

## Files Created/Modified
- `src/styles/tokens.css` - Complete two-tier design token system: primitives, semantics, dark mode, non-color tokens, backward compat aliases (359 lines)
- `tailwind.config.js` - Restructured to reference CSS variables for all colors, shadows, radii, durations (172 lines)
- `src/styles/globals.css` - Slimmed to layout variables, base styles, and component utilities; imports tokens.css (318 lines, down from 471)

## Decisions Made
- Added backward compatibility aliases in tokens.css (:root block mapping old names like --background, --card, --primary-700 to new semantic/primitive tokens) to avoid a big-bang component migration in this plan
- Dark mode primitive shade inversion kept from original globals.css (--primary-50 becomes 224 71% 15% in dark mode) for readability
- Border radius --radius alias now points to --radius-xl (1.25rem) instead of the old 0.85rem -- slight visual change but aligns with the token scale
- chunky-shadow-destructive and chunky-shadow-accent-purple utilities updated to reference token variables (--red-700, --purple-700) instead of hardcoded HSL
- focus-ring updated to use --color-ring instead of --primary-500

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Backward compatibility aliases for old CSS variable names**
- **Found during:** Task 1 (creating tokens.css)
- **Issue:** Codebase has ~30 direct references to old variable names (--primary-700, --card, --border, etc.) in component inline Tailwind arbitrary values and CSS files. Without aliases, these would break.
- **Fix:** Added a "Backward Compatibility Aliases" section in tokens.css mapping all old names to new semantic/primitive tokens. Also added dark mode overrides for inverted primary shades.
- **Files modified:** src/styles/tokens.css
- **Verification:** npx next build passes
- **Committed in:** 7769817 (Task 1 commit)

**2. [Rule 1 - Bug] Updated chunky-shadow utilities to use token variables**
- **Found during:** Task 2 (slimming globals.css)
- **Issue:** chunky-shadow-destructive used hardcoded `hsl(10 45% 35%)` and chunky-shadow-accent-purple used hardcoded `hsl(270 60% 44%)`, which wouldn't adapt to the token system
- **Fix:** Updated to use `hsl(var(--red-700))` and `hsl(var(--purple-700))` respectively
- **Files modified:** src/styles/globals.css
- **Verification:** Build passes, values are equivalent
- **Committed in:** 6d4a443 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 missing critical, 1 bug)
**Impact on plan:** Both auto-fixes essential for backward compatibility and token system consistency. No scope creep.

## Issues Encountered
None - plan executed smoothly with clean build.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Token system is the single source of truth, ready for component migration sweeps (plans 02-05)
- All existing Tailwind class names (bg-primary, text-foreground, bg-card, border-border, bg-muted, etc.) continue to work through backward compat aliases
- Components can now start migrating from `dark:` prefixes to semantic token classes
- The `design-tokens.ts` file is still present (dead code) -- plan 06 or 07 should delete it

## Self-Check: PASSED

- [x] src/styles/tokens.css exists (359 lines)
- [x] tailwind.config.js exists (172 lines)
- [x] src/styles/globals.css exists (318 lines)
- [x] Commit 7769817 exists (Task 1)
- [x] Commit 6d4a443 exists (Task 2)
- [x] Build passes (npx next build)

---
*Phase: 11-design-token-foundation*
*Completed: 2026-02-09*
