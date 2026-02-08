---
phase: 09-ui-polish-onboarding
plan: 01
subsystem: ui
tags: [design-tokens, tailwind, css-variables, 3d-button, duolingo, box-shadow]

# Dependency graph
requires:
  - phase: 03-ui-ux-bilingual-polish
    provides: "Original design tokens, Button/Card components, CSS variables"
provides:
  - "Accent purple color tokens (hue 270) for achievement UI"
  - "3D chunky button pattern with box-shadow depth and press-down"
  - "Updated border-radius: 20px cards, 12px buttons"
  - "Destructive hue shifted from 25 to 10 (warm coral-red)"
  - "Shadow tokens and typography weights in design-tokens.ts"
  - "accent-purple Tailwind color mapping"
  - "Enhanced page-shell gradient texture (more visible)"
affects: [09-02 through 09-12 all depend on these foundation tokens]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "3D chunky button via box-shadow + active:translateY(3px) CSS transition"
    - "Motion whileTap scale coexists with CSS active:translate-y for 3D effect"
    - "pill prop on Button for backward-compatible rounded-full shape"

key-files:
  created: []
  modified:
    - src/lib/design-tokens.ts
    - src/styles/globals.css
    - tailwind.config.js
    - src/components/ui/Button.tsx
    - src/components/ui/Card.tsx

key-decisions:
  - "Button default shape changed from rounded-full to rounded-xl (12px Duolingo chunky)"
  - "pill prop added to Button for backward-compatible rounded-full when needed"
  - "Motion hover variant removed boxShadow animation (conflicts with CSS 3D shadow)"
  - "Destructive hue 10 50% 45% (light) / 10 45% 50% (dark) for warm coral-red"
  - "Accent purple hue 270 70% 60% (light) / 270 65% 65% (dark)"
  - "Page-shell blur reduced to 45px, opacity increased to 0.95/1.0 for more visible texture"
  - "CardHeader gets font-bold by default for bolder typography"

patterns-established:
  - "chunky3D pattern: shadow-[0_4px_0] + active:shadow-[0_1px_0] + active:translate-y-[3px]"
  - "CSS-only chunky-shadow-* utility classes in @layer components for non-Button elements"
  - "shadow-chunky Tailwind utility for quick 3D shadow application"

# Metrics
duration: 9min
completed: 2026-02-08
---

# Phase 9 Plan 01: Design System Foundation Summary

**Duolingo-inspired design tokens with accent purple, 3D chunky button shadows, warm coral-red destructive, and 20px card radius**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-08T09:27:40Z
- **Completed:** 2026-02-08T09:36:29Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Established 3D chunky button pattern with box-shadow depth and press-down effect across primary, destructive, and success variants
- Added accent purple color system (hue 270) for achievements/badges/milestones
- Shifted destructive token from warm orange (hue 25) to warm coral-red (hue 10) per user decision
- Updated Card to 20px border-radius with overflow-hidden and intense gradient shadows
- Enhanced page-shell background gradients for more visible paper texture

## Task Commits

Each task was committed atomically:

1. **Task 1: Update Design Tokens, CSS Variables, and Tailwind Config** - `c2a3475` (feat)
2. **Task 2: Convert Button and Card to 3D Duolingo Aesthetic** - `a75dfad` (feat)

## Files Created/Modified
- `src/lib/design-tokens.ts` - Added accent purple colors, shadow tokens, typography weights, updated radius values
- `src/styles/globals.css` - Destructive hue shift to 10, accent-purple CSS vars, 3D chunky shadow utilities, enhanced page-shell gradients
- `tailwind.config.js` - accent-purple color mapping, shadow-chunky/shadow-chunky-active utilities
- `src/components/ui/Button.tsx` - 3D depth on primary/destructive/success, chunky variants, rounded-xl default, pill prop, font-bold
- `src/components/ui/Card.tsx` - rounded-2xl (20px), overflow-hidden, intense shadow-xl, bolder CardHeader

## Decisions Made
- Button default shape changed from `rounded-full` to `rounded-xl` (12px) for Duolingo chunky look; added `pill` prop for backward compatibility
- Removed `boxShadow` from motion hover variant to avoid conflict with CSS 3D shadow transition
- Accent purple uses hue 270 with slightly less saturation in dark mode (65% vs 70%) for readability
- Dark mode page-shell opacity set to 1.0 (from 0.95) for equally vibrant gradients
- 3D shadow uses CSS transition-[box-shadow,transform] duration-100 (not motion/react spring) per plan instruction

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All design tokens are established and ready for subsequent plans to consume
- Button 3D pattern can be applied across all pages in plans 07-12
- Card 20px radius and overflow-hidden prevent child content clipping
- accent-purple color available for achievement UI in upcoming plans

## Self-Check: PASSED

---
*Phase: 09-ui-polish-onboarding*
*Completed: 2026-02-08*
