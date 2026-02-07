---
phase: 05-spaced-repetition
plan: 04
subsystem: srs-ui
tags: [srs, add-to-deck, button, study-guide, test-review]
depends_on:
  requires: ["05-03"]
  provides: ["AddToDeckButton component", "SRS deck touchpoints in StudyGuidePage and TestPage"]
  affects: ["05-07", "05-08"]
tech-stack:
  added: []
  patterns: ["optimistic-ui", "stopPropagation-for-nested-interactive", "compact-mode-pattern"]
key-files:
  created:
    - src/components/srs/AddToDeckButton.tsx
  modified:
    - src/pages/StudyGuidePage.tsx
    - src/pages/TestPage.tsx
decisions:
  - "BilingualToast showSuccess for add confirmation (not legacy toast shim)"
  - "Compact mode icon-only (32px) for flip card and review contexts"
  - "stopPropagation on both click and keydown to prevent flip card interference"
  - "Toast on add only, no toast on remove (less disruptive)"
  - "Spring animation stiffness 400, damping 17 matching Phase 3 conventions"
metrics:
  duration: "10 min"
  completed: "2026-02-07"
---

# Phase 5 Plan 04: Add-to-Deck Button & Touchpoints Summary

**One-liner:** Toggle button for SRS deck add/remove with optimistic UI, integrated into study guide flip cards and test review screen.

## What Was Built

### AddToDeckButton Component (`src/components/srs/AddToDeckButton.tsx`)
- Toggle button using `useSRS()` context for `addCard`, `removeCard`, `isInDeck`
- **Compact mode**: 32px icon-only button with tooltip (Plus/Check icons from lucide-react)
- **Full mode**: icon + bilingual text label with 44px touch target
- Visual states: transparent border when not in deck, `bg-primary-500/10` with primary border when in deck
- Bilingual labels: "Add to Review" / "In Review Deck" with Burmese translations
- Spring animation on toggle (stiffness 400, damping 17)
- `stopPropagation` prop for nested interactive contexts (flip cards)
- Bilingual toast via `showSuccess` on add; no toast on remove
- Processing state guard to prevent double-clicks

### Integration Points
- **StudyGuidePage**: AddToDeckButton in category question list flip cards AND legacy flip-card grid (compact + stopPropagation)
- **TestPage**: AddToDeckButton in post-test review result cards (compact, next to speech buttons)

## Task Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Create AddToDeckButton component | `69a5842` | src/components/srs/AddToDeckButton.tsx |
| 2 | Integrate into StudyGuidePage and TestPage | `7f6ad13` | src/pages/StudyGuidePage.tsx, src/pages/TestPage.tsx |

## Decisions Made

1. **BilingualToast over legacy toast**: Used `useToast` from `@/components/BilingualToast` with `showSuccess` for proper bilingual support, not the legacy `toast` shim from `use-toast.ts`
2. **Compact mode everywhere**: Both study guide and test review use compact (icon-only) to avoid visual clutter in dense card layouts
3. **Toast asymmetry**: Show toast on add (positive reinforcement), no toast on remove (less disruptive UX)
4. **Optimistic UI**: Button state changes immediately on click; async IndexedDB persist happens in background

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `pnpm exec tsc --noEmit` passes cleanly
- AddToDeckButton used in StudyGuidePage (2 instances: category list + legacy grid)
- AddToDeckButton used in TestPage (1 instance: review result cards)

## Next Phase Readiness

- AddToDeckButton is ready for use by any future component that displays questions
- The two main user touchpoints for building the SRS deck are now active
- Plans 05-07 (Review Session Page) and 05-08 (SRS Widget) can proceed

## Self-Check: PASSED
