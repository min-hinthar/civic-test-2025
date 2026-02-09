---
phase: 11-design-token-foundation
plan: 04
subsystem: ui
tags: [recharts, canvas-api, getTokenColor, design-tokens, dark-mode-migration, semantic-tokens, pwa-components]

# Dependency graph
requires:
  - phase: 11-01
    provides: "Two-tier CSS custom property token system in src/styles/tokens.css"
  - phase: 11-03
    provides: "JS utility (getToken, getTokenColor) for runtime CSS variable access"
provides:
  - "Recharts charts dynamically themed via getTokenColor() for stroke/fill/axis colors"
  - "Canvas components (AudioWaveform) reading theme tokens per animation frame"
  - "CircularTimer trail color from semantic token with pragmatic stage color constants"
  - "SkillTreePath inline boxShadow using hsl(var(--color-primary) / alpha) pattern"
  - "6 PWA/social components migrated from palette+dark: classes to semantic tokens (100% dark: reduction)"
affects: [11-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useThemeContext() subscription in Recharts wrappers to trigger re-render on theme toggle"
    - "getTokenColor('--color-chart-blue') for Recharts stroke/fill props"
    - "getTokenColor('--color-border', 0.3) for canvas strokeStyle with alpha"
    - "hsl(var(--color-primary) / 0.15) for inline boxShadow in motion variants"
    - "Data-visualization intensity colors (heatmap cells) kept as Tailwind palette classes, not theme tokens"

key-files:
  created: []
  modified:
    - "src/pages/HistoryPage.tsx"
    - "src/components/interview/InterviewResults.tsx"
    - "src/components/interview/AudioWaveform.tsx"
    - "src/components/test/CircularTimer.tsx"
    - "src/components/progress/SkillTreePath.tsx"
    - "src/components/ui/Card.tsx"
    - "src/components/pwa/WelcomeModal.tsx"
    - "src/components/pwa/NotificationSettings.tsx"
    - "src/components/pwa/InstallPrompt.tsx"
    - "src/components/pwa/IOSTip.tsx"
    - "src/components/social/StreakHeatmap.tsx"
    - "src/components/pwa/NotificationPrePrompt.tsx"

key-decisions:
  - "Timer stage colors (blue->yellow->orange->red) kept as hardcoded HSL constants -- semantic timer stages, not theme colors"
  - "ProgressPage.tsx skipped -- already migrated by plan 11-05 (commit a515e77)"
  - "SettingsPage.tsx skipped -- already had 0 dark: prefixes (migrated by plan 11-05)"
  - "Data-viz heatmap cells (orange intensity, blue freeze) kept as Tailwind palette classes per data-visualization exemption"
  - "Snap-to-token simplification applied: multiple gray shades consolidated to single semantic equivalent"

patterns-established:
  - "Import pattern for Recharts: import { getTokenColor } + import { useThemeContext } + call useThemeContext() in body"
  - "Canvas pattern: getTokenColor() called inside requestAnimationFrame for live theme switching"
  - "Warning component pattern: border-warning-200 bg-warning-50 text-warning-* (replaces amber+dark: pairs)"
  - "Card/modal pattern: bg-card text-foreground border-border (replaces white/gray+dark: pairs)"

# Metrics
duration: 33min
completed: 2026-02-09
---

# Phase 11 Plan 04: High/Medium Complexity Token Migration Summary

**Recharts charts and canvas components using getTokenColor() for dynamic theming, plus 6 PWA/social components fully migrated from 77 dark: overrides to 0**

## Performance

- **Duration:** 33 min
- **Started:** 2026-02-09T11:57:07Z
- **Completed:** 2026-02-09T12:30:26Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Migrated 3 Recharts chart files (HistoryPage, InterviewResults, ProgressPage already done) to use getTokenColor() for all stroke, fill, axis, tooltip, and grid colors -- charts now dynamically adapt to theme toggle
- Migrated 2 canvas/animation components (AudioWaveform, CircularTimer) to read theme tokens at runtime via getTokenColor()
- Migrated SkillTreePath inline boxShadow animations from rgba(59,130,246,...) to hsl(var(--color-primary)/...) and Card.tsx similarly
- Eliminated 77 dark: prefix overrides across 6 PWA/social components (WelcomeModal 20, NotificationSettings 19, InstallPrompt 14, IOSTip 8, StreakHeatmap 8, NotificationPrePrompt 8) achieving 100% reduction (target was >80%)

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate Recharts charts and canvas components** - `25c2f40` (feat)
2. **Task 2: Migrate medium-complexity components (heavy dark: override files)** - `3b3c994` (feat)

## Files Created/Modified
- `src/pages/HistoryPage.tsx` - Recharts chart colors via getTokenColor() with useThemeContext() subscription
- `src/components/interview/InterviewResults.tsx` - Recharts chart + category color classes migrated to semantic tokens
- `src/components/interview/AudioWaveform.tsx` - Canvas strokeStyle reads getTokenColor() for waveform/flatline colors
- `src/components/test/CircularTimer.tsx` - Trail color from semantic token; timer stage colors kept as constants
- `src/components/progress/SkillTreePath.tsx` - Node bg/glow classes to chart-* tokens; inline boxShadow to hsl(var())
- `src/components/ui/Card.tsx` - Motion variant boxShadow from rgba() to hsl(var(--color-primary)/alpha)
- `src/components/pwa/WelcomeModal.tsx` - 20 dark: overrides eliminated; palette classes to semantic tokens
- `src/components/pwa/NotificationSettings.tsx` - 19 dark: overrides eliminated; gray/blue palette to semantic tokens
- `src/components/pwa/InstallPrompt.tsx` - 14 dark: overrides eliminated; install modal fully semantic
- `src/components/pwa/IOSTip.tsx` - 8 dark: overrides eliminated; amber palette to warning-* tokens
- `src/components/social/StreakHeatmap.tsx` - 8 dark: overrides eliminated; data-viz intensity colors kept as palette
- `src/components/pwa/NotificationPrePrompt.tsx` - 8 dark: overrides eliminated; pre-prompt card fully semantic

## Decisions Made
- Timer stage colors (blue->yellow->orange->red gradient) kept as hardcoded HSL constants since they represent temporal urgency stages, not theme colors
- ProgressPage.tsx excluded from Task 1 work (already migrated by plan 11-05, commit a515e77)
- SettingsPage.tsx excluded from Task 2 work (already had 0 dark: prefixes from plan 11-05 migration)
- Heatmap intensity cells (orange-200/400/500, blue-200 freeze) kept as Tailwind palette classes per data-visualization exemption established in plan 11-05
- Snap-to-token simplification applied consistently: e.g., text-gray-400/500/600 all mapping to text-muted-foreground when serving the same semantic purpose

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Linter reverted 5 of 7 Task 1 files after initial write**
- **Found during:** Task 1 verification (git status showed only 2 of 7 files modified)
- **Issue:** VS Code linter/auto-save interference reverted HistoryPage, InterviewResults, AudioWaveform, CircularTimer, and SkillTreePath to their pre-migration state
- **Fix:** Re-read each file to register it, then immediately re-wrote the full migrated content sequentially
- **Files modified:** All 5 reverted files successfully re-written
- **Verification:** git status confirmed all files modified; TypeScript compilation passed
- **Committed in:** 25c2f40 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Linter interference required re-writing 5 files but did not change the migration outcome. No scope creep.

## Issues Encountered
- Plan listed generic file paths (e.g., `src/components/CircularTimer.tsx`) that differed from actual paths (e.g., `src/components/test/CircularTimer.tsx`). Resolved via Glob searches to locate actual file paths.
- ProgressPage.tsx and SettingsPage.tsx were already migrated by plan 11-05, discovered during pre-migration analysis. Both excluded from work scope without affecting plan success criteria.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Only plan 11-07 (final audit) remains in Phase 11
- All high-complexity files (charts, canvas, heavy dark: overrides) are now migrated
- Combined with plan 11-05 (bulk migration) and plan 11-06 (globals.css), the codebase is ready for the final token audit pass

## Self-Check: PASSED

- [x] src/pages/HistoryPage.tsx contains getTokenColor (verified)
- [x] src/components/interview/InterviewResults.tsx contains getTokenColor (verified)
- [x] src/components/interview/AudioWaveform.tsx contains getTokenColor (verified)
- [x] src/components/test/CircularTimer.tsx contains getTokenColor (verified)
- [x] src/components/progress/SkillTreePath.tsx modified (verified)
- [x] src/components/ui/Card.tsx modified (verified)
- [x] 6 Task 2 files have 0 dark: prefixes (verified)
- [x] Commit 25c2f40 exists (Task 1)
- [x] Commit 3b3c994 exists (Task 2)
- [x] TypeScript compilation passes

---
*Phase: 11-design-token-foundation*
*Completed: 2026-02-09*
