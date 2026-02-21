---
phase: 02-pwa-offline
plan: 05
subsystem: pwa
tags: [pwa, ios, safari, data-persistence, tip, bilingual, onboarding]

# Dependency graph
requires:
  - phase: 02-04
    provides: Install prompt, welcome modal, PWAOnboardingFlow in AppShell

provides:
  - iOS Safari data persistence tip (one-time, dismissable)
  - shouldShowIOSTip() detection utility
  - Extended PWAOnboardingFlow with iOS tip lifecycle

affects:
  - 02-06: App update prompt (may share banner positioning at bottom)
  - 02-08: Final PWA testing (iOS tip is part of iOS-specific verification)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Lazy state initializer pattern for browser-API-dependent UI state
    - One-time dismissal via localStorage flag
    - Warm amber color scheme for friendly non-blocking tips

# File tracking
key-files:
  created:
    - src/components/pwa/IOSTip.tsx
  modified:
    - src/AppShell.tsx

# Decisions
decisions:
  - id: ios-tip-lazy-init
    decision: "Use lazy useState initializer instead of useEffect for initial iOS tip visibility"
    reason: "ESLint react-hooks/set-state-in-effect rule prevents synchronous setState in effects; lazy initializer avoids the anti-pattern entirely"
  - id: ios-tip-post-welcome-delay
    decision: "2-second delay for iOS tip after welcome modal closes"
    reason: "Prevents overwhelming users with back-to-back UI elements after onboarding"

# Metrics
metrics:
  duration: 6 min
  completed: 2026-02-06
---

# Phase 02 Plan 05: iOS Safari Data Persistence Tip Summary

Warm amber iOS Safari tip with lightbulb icon, bilingual text, one-time dismissal via localStorage, integrated into PWAOnboardingFlow with lazy state initializer

## What Was Done

### Task 1: Create IOSTip Component (40872bc)
Created `src/components/pwa/IOSTip.tsx` with:
- **IOSTip component**: Warm amber styling with lightbulb icon, bilingual English + Burmese text
- **shouldShowIOSTip() utility**: Detects iOS via user agent, checks standalone mode, checks localStorage dismissal flag
- Friendly tone: "Quick tip for the best experience" (not alarming)
- Suggests both weekly visits and home screen installation
- Dismissal tracked via `ios-tip-shown` key in localStorage

### Task 2: Integrate iOS Tip into AppShell (df8ae42)
Updated `src/AppShell.tsx` PWAOnboardingFlow:
- **Lazy state initializer** for `showIOSTip` -- returning iOS users see the tip immediately without needing useEffect
- **Post-welcome delay**: After welcome modal closes, 2-second setTimeout before showing tip
- **Bottom banner positioning**: `fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md` -- non-blocking, below modals (z-50)
- No useEffect needed -- resolved ESLint set-state-in-effect lint error by using lazy initializer pattern

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Avoided synchronous setState in useEffect**
- **Found during:** Task 2
- **Issue:** Initial implementation used useEffect with synchronous `setShowIOSTip(true)` for returning iOS users, which triggered ESLint `react-hooks/set-state-in-effect` error
- **Fix:** Replaced effect-based approach with lazy `useState` initializer that computes initial visibility synchronously during render, consistent with existing patterns in the codebase (e.g., `showWelcome` initializer)
- **Files modified:** src/AppShell.tsx
- **Commit:** df8ae42

## Verification

- [x] TypeScript typecheck passes (`npx tsc --noEmit`)
- [x] ESLint passes for both IOSTip.tsx and AppShell.tsx
- [x] Production build succeeds (`pnpm run build`)
- [x] IOSTip only targets iOS (userAgent regex: iPad|iPhone|iPod)
- [x] Standalone/PWA mode excluded from tip display
- [x] localStorage dismissal prevents re-appearance
- [x] Warm amber styling with lightbulb icon (friendly, not alarming)
- [x] Bilingual: English + Burmese with font-myanmar class
- [x] Non-blocking bottom banner positioning

## Task Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Create IOSTip component | 40872bc | src/components/pwa/IOSTip.tsx |
| 2 | Integrate iOS tip into AppShell | df8ae42 | src/AppShell.tsx |

## Next Phase Readiness

No blockers. iOS tip is self-contained and integrates cleanly into the existing PWAOnboardingFlow. The `shouldShowIOSTip()` utility can be reused by future plans if needed.

## Self-Check: PASSED
