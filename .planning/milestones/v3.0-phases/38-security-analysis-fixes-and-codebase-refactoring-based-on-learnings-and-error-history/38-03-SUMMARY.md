---
phase: 38-security-analysis-fixes-and-codebase-refactoring-based-on-learnings-and-error-history
plan: 03
subsystem: ui, refactoring
tags: [tailwind, dark-mode, dead-code, cleanup]

# Dependency graph
requires: []
provides:
  - "Dark mode variants for 5 components (NBAHeroCard, CompactStatRow, TTSFallbackBadge, LeaderboardTable, Flashcard3D)"
  - "Cleaned dead code: removed unused OscillatorWaveType export, deleted orphaned nativeBridge.ts"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "dark: variant convention: 500->400 for text, 700->400 for dark, /10->/15 for gradient opacity"

key-files:
  created: []
  modified:
    - src/components/dashboard/NBAHeroCard.tsx
    - src/components/dashboard/CompactStatRow.tsx
    - src/components/interview/TTSFallbackBadge.tsx
    - src/components/social/LeaderboardTable.tsx
    - src/components/study/Flashcard3D.tsx
    - src/lib/audio/soundEffects.ts
    - src/lib/nativeBridge.ts (deleted)

key-decisions:
  - "AudioPlayerState export kept -- used by SpeechButton.tsx and burmeseAudio.ts"
  - "OscillatorWaveType export removed -- only used internally in soundEffects.ts"
  - "nativeBridge.ts deleted -- zero imports found across entire src/ directory"
  - "Flashcard3D gradients: /10 -> dark:/15 for category overlays (subtle increase for dark cards)"

patterns-established:
  - "Dark mode text colors: one shade lighter (500->400, 700->400) for readability"
  - "Dark mode opacity: increase semi-transparent backgrounds by 5% for visibility"

requirements-completed: [CONTEXT-dead-code-audit, CONTEXT-css-dark-mode-audit, CONTEXT-refactoring-learnings]

# Metrics
duration: 19min
completed: 2026-02-22
---

# Phase 38 Plan 03: Dark Mode Fixes + Dead Code Removal Summary

**Added dark: variants to 5 components with poor dark mode contrast, removed unused OscillatorWaveType export and orphaned nativeBridge.ts**

## Performance

- **Duration:** 19 min
- **Started:** 2026-02-22T07:55:59Z
- **Completed:** 2026-02-22T08:15:23Z
- **Tasks:** 2
- **Files modified:** 7 (5 modified, 1 edited export, 1 deleted)

## Accomplishments
- 5 components now render with proper contrast in dark mode (no washed-out text on dark backgrounds)
- Removed unused `export` keyword from `OscillatorWaveType` (internal-only type in soundEffects.ts)
- Deleted orphaned `nativeBridge.ts` (WKWebView bridge with zero imports across entire codebase)
- Confirmed `AudioPlayerState` is actively used externally (SpeechButton.tsx, burmeseAudio.ts) -- kept

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix missing dark mode variants in 5 components** - `5e569c7` (fix)
2. **Task 2: Remove dead code -- unused exports and orphaned files** - `ca72ac3` (refactor)

## Files Created/Modified
- `src/components/dashboard/NBAHeroCard.tsx` - Added dark: variants to ICON_COLOR_MAP (7 entries)
- `src/components/dashboard/CompactStatRow.tsx` - Added dark:text-orange-400 for streak icon
- `src/components/interview/TTSFallbackBadge.tsx` - Added dark:bg-amber-500/30 dark:text-amber-300
- `src/components/social/LeaderboardTable.tsx` - Added dark:text-amber-400 for bronze medal
- `src/components/study/Flashcard3D.tsx` - Added dark:from-*/15 dark:to-*/15 gradient overlays (7 categories)
- `src/lib/audio/soundEffects.ts` - Removed export from OscillatorWaveType
- `src/lib/nativeBridge.ts` - Deleted (orphaned file)

## Decisions Made
- AudioPlayerState export kept after confirming 2 external consumers (SpeechButton.tsx, burmeseAudio.ts)
- nativeBridge.ts type augmentations in global.d.ts kept (harmless, could serve future WKWebView use)
- Flashcard3D gradient opacity increase is subtle (10% -> 15%) to avoid over-saturation in dark mode
- TTSFallbackBadge uses amber-300 in dark mode (vs amber-400 in light) for better pop against dark backgrounds

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] TTSFallbackBadge was at src/components/interview/ not src/components/ui/**
- **Found during:** Task 1 (Dark mode variant fixes)
- **Issue:** Plan referenced `src/components/ui/TTSFallbackBadge.tsx` but file is at `src/components/interview/TTSFallbackBadge.tsx`
- **Fix:** Located correct path via glob search, applied fix to correct file
- **Verification:** ESLint passes, file renders correctly
- **Committed in:** 5e569c7 (Task 1 commit)

**2. [Rule 3 - Blocking] Flashcard3D was at src/components/study/ not src/components/flashcards/**
- **Found during:** Task 1 (Dark mode variant fixes)
- **Issue:** Plan referenced `src/components/flashcards/Flashcard3D.tsx` but file is at `src/components/study/Flashcard3D.tsx`
- **Fix:** Located correct path via glob search, applied fix to correct file
- **Verification:** ESLint passes, build succeeds
- **Committed in:** 5e569c7 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking path mismatches)
**Impact on plan:** Minor path discrepancies in plan. All work completed as intended.

## Issues Encountered
None -- plan executed cleanly after path resolution.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Dark mode audit items resolved
- Dead code audit items resolved
- Codebase cleaner with one fewer orphaned file and one fewer unnecessary export

## Self-Check: PASSED

- All 5 modified component files exist
- nativeBridge.ts confirmed deleted
- SUMMARY.md exists
- Commit 5e569c7 (Task 1) found in git log
- Commit ca72ac3 (Task 2) found in git log

---
*Phase: 38-security-analysis-fixes-and-codebase-refactoring-based-on-learnings-and-error-history*
*Completed: 2026-02-22*
