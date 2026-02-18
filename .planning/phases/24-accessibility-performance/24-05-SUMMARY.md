---
phase: 24-accessibility-performance
plan: 05
subsystem: ui
tags: [timer, accessibility, wcag, svg, animation, haptics, sound]

# Dependency graph
requires:
  - phase: 24-02
    provides: Screen reader announcement patterns (aria-live regions)
provides:
  - usePerQuestionTimer hook with countdown, pause, extend, warning, and expiry
  - PerQuestionTimer circular SVG component (40x40, green/yellow/red)
  - TimerExtensionToast WCAG 2.2.1 extension banner with E keyboard shortcut
  - playTimerWarningTick sound effect
  - Bilingual timer strings (timerWarning, extend, secondsRemaining)
affects: [24-06, quiz-integration, practice-session]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - SVG stroke-dasharray circular timer with CSS transition
    - Callback ref sync via useEffect for React Compiler safety
    - One-shot flags via refs accessed only in interval callbacks
    - Exact-value announcement pattern for aria-live (timeLeft === 5)

key-files:
  created:
    - src/hooks/usePerQuestionTimer.ts
    - src/components/quiz/PerQuestionTimer.tsx
    - src/components/quiz/TimerExtensionToast.tsx
  modified:
    - src/lib/audio/soundEffects.ts
    - src/lib/i18n/strings.ts

key-decisions:
  - "Timer color uses CSS custom properties (--color-success, --color-warning, --color-destructive) for theme awareness"
  - "sr-only announcement fires at exactly timeLeft === 5 (not range) to avoid repeated announcements"
  - "Callback refs synced via useEffect (not render-time assignment) for React Compiler safety"
  - "One-shot warning/expiry flags use refs accessed only inside setInterval callback (handler context)"
  - "Timer extension toast uses E keyboard shortcut with input/textarea guard"

patterns-established:
  - "useEffect ref sync pattern: const ref = useRef(cb); useEffect(() => { ref.current = cb; }, [cb])"
  - "Exact-value aria-live trigger: content set only when value === threshold, not range check"

# Metrics
duration: 13min
completed: 2026-02-18
---

# Phase 24 Plan 05: Per-Question Timer Components Summary

**30-second per-question timer hook with SVG circular display, color urgency thresholds, WCAG 2.2.1 extension toast, and timer warning sound**

## Performance

- **Duration:** 13 min
- **Started:** 2026-02-18T02:09:12Z
- **Completed:** 2026-02-18T02:21:44Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- usePerQuestionTimer hook manages 30s countdown with pause/resume, extend (50% bonus), one-shot warning at 5s, and expiry callback
- PerQuestionTimer SVG component (40x40) with green/yellow/red color at 50%/20% thresholds, pulse animation, role="timer", sr-only announcement
- TimerExtensionToast WCAG 2.2.1 banner with +15s button, E keyboard shortcut, AnimatePresence animation, 44px touch target
- playTimerWarningTick sound effect (800Hz, 80ms, vol 0.15) following existing soundEffects pattern
- Bilingual strings added for timer warning, extend, seconds remaining

## Task Commits

Each task was committed atomically:

1. **Task 1: usePerQuestionTimer hook + timer warning sound** - `0d6abdd` (feat)
2. **Task 2: PerQuestionTimer + TimerExtensionToast + bilingual strings** - `7889fae` (feat, merged into parallel 24-06 commit)

**Note:** Task 2 files were written to disk and corrected for React Compiler compliance, then absorbed by a parallel 24-06 agent's lint-staged commit. The final committed versions include all corrections.

## Files Created/Modified
- `src/hooks/usePerQuestionTimer.ts` - Timer hook with countdown, pause, extend, warning, expiry
- `src/components/quiz/PerQuestionTimer.tsx` - 40x40 SVG circular timer with color thresholds
- `src/components/quiz/TimerExtensionToast.tsx` - WCAG 2.2.1 extension banner with keyboard shortcut
- `src/lib/audio/soundEffects.ts` - Added playTimerWarningTick function
- `src/lib/i18n/strings.ts` - Added timerWarning, extend, secondsRemaining, perQuestionTimer strings

## Decisions Made
- Timer color uses CSS custom properties (--color-success/warning/destructive) for theme-aware rendering
- sr-only announcement fires at exactly timeLeft === 5 to avoid repeated announcements without needing one-shot state
- Callback refs synced via useEffect (not render-time assignment) for React Compiler compliance
- One-shot warning/expiry flags use refs accessed only inside setInterval callback (handler context, not render)
- Timer extension toast uses E keyboard shortcut with input/textarea guard to prevent conflicts

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed React Compiler ref violations in prior PerQuestionTimer/TimerExtensionToast**
- **Found during:** Task 2 (component creation)
- **Issue:** Pre-existing files had `ref.current` access during render and `ref.current = value` during render, violating react-hooks/refs
- **Fix:** Replaced render-time ref access with useState for announced tracking, then simplified to exact-value derived announcement (timeLeft === 5). Moved callback ref sync into useEffect.
- **Files modified:** src/components/quiz/PerQuestionTimer.tsx, src/components/quiz/TimerExtensionToast.tsx
- **Verification:** ESLint passes with zero errors
- **Committed in:** 7889fae (absorbed into parallel 24-06 commit)

**2. [Rule 1 - Bug] Fixed React Compiler setState-in-effect violation**
- **Found during:** Task 2 (PerQuestionTimer)
- **Issue:** First fix attempt used useState + useEffect for announcement tracking, violating react-hooks/set-state-in-effect
- **Fix:** Eliminated effect-based tracking entirely; used pure derivation `timeLeft === 5` for sr-only announcement
- **Files modified:** src/components/quiz/PerQuestionTimer.tsx
- **Verification:** ESLint passes, announcement triggers correctly at threshold crossing

**3. [Rule 3 - Blocking] Sound file path differs from plan**
- **Found during:** Task 1
- **Issue:** Plan references `src/lib/sounds.ts` but actual file is `src/lib/audio/soundEffects.ts`
- **Fix:** Added playTimerWarningTick to the correct file following existing pattern
- **Files modified:** src/lib/audio/soundEffects.ts
- **Verification:** Import path matches project convention (@/lib/audio/soundEffects)

---

**Total deviations:** 3 auto-fixed (2 bugs, 1 blocking)
**Impact on plan:** All fixes necessary for React Compiler compliance and correct file targeting. No scope creep.

## Issues Encountered
- Parallel 24-06 agent committed Task 2 files via lint-staged stash restoration. Files ended up in correct state with all React Compiler fixes applied. No data loss.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Timer components are standalone building blocks ready for quiz integration (24-06)
- Hook API (timeLeft, isWarning, showExtensionPrompt, extend, reset) is designed for PracticeSession integration
- TimerExtensionToast designed to sit above FeedbackPanel in quiz layout

---
*Phase: 24-accessibility-performance*
*Completed: 2026-02-18*
