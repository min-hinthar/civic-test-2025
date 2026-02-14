---
phase: 19-tts-core-extraction
plan: 04
subsystem: tts
tags: [speech-synthesis, animation, motion-react, aria, accessibility, svg, reduced-motion]

# Dependency graph
requires:
  - "19-03: TTSContext provider with shared engine, useTTS hook with speak/cancel/isSpeaking"
provides:
  - "SpeechButton.tsx: Migrated to useTTS with toggle, ARIA, animated SVG sound waves, expanding rings, TTS color"
affects: [19-06]

# Tech tracking
tech-stack:
  added: []
  patterns: [tts-color-token, animated-svg-equalizer, expanding-ring-broadcast, reduced-motion-fallback]

key-files:
  created: []
  modified:
    - src/components/ui/SpeechButton.tsx
    - src/styles/tokens.css
    - tailwind.config.js

key-decisions:
  - "voiceName prop kept for backward compat but unused -- ttsCore findVoice handles voice selection internally"
  - "TTS color defined as CSS custom property in tokens.css (hsl 250 70% 55% light / 250 80% 70% dark)"
  - "pulse-subtle animation defined in tailwind.config.js keyframes (not globals.css) for consistency"

patterns-established:
  - "TTS speaking color: dedicated --color-tts token distinct from accent-purple, used via Tailwind tts color"
  - "Reduced motion: animation components accept animate boolean prop, rings not rendered at all"
  - "Private sub-components: SoundWaveIcon and ExpandingRings defined in same file, not exported"

# Metrics
duration: 7min
completed: 2026-02-14
---

# Phase 19 Plan 04: SpeechButton Migration Summary

**SpeechButton migrated to useTTS with click-to-toggle, full ARIA (aria-pressed, dynamic label, live region), animated SVG equalizer bars, expanding broadcast rings, and dedicated TTS indigo-purple color**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-14T15:43:18Z
- **Completed:** 2026-02-14T15:50:38Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- SpeechButton migrated from useSpeechSynthesis to useTTS() hook with click-to-toggle (click while speaking cancels)
- Full ARIA: aria-pressed toggle, dynamic aria-label (Listen/Stop speaking), aria-live region announcing Speaking/Stopped
- Rich animated speaking state: SVG equalizer bars (3 rects with staggered bounce via motion/react), expanding concentric rings (3 rings with staggered fade-out), pulsing TTS-colored border
- Dedicated TTS color token in design system (indigo-purple, adaptive light/dark) with Tailwind integration
- Reduced motion: static SVG bars, no rings, no pulse animation when prefers-reduced-motion is set
- All 6 consumer files require zero changes (backward-compatible default export, same props interface)

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate SpeechButton to useTTS with speaking toggle and ARIA** - `e2bde1f` (feat)
2. **Task 2: Add rich speaking animation (SVG sound waves + expanding rings)** - `9933d09` (feat)

## Files Created/Modified
- `src/components/ui/SpeechButton.tsx` - Fully migrated: useTTS hook, click-to-toggle, ARIA attributes, SoundWaveIcon (animated SVG equalizer), ExpandingRings (concentric broadcast effect), reduced motion fallbacks
- `src/styles/tokens.css` - Added --color-tts semantic token for light mode (250 70% 55%) and dark mode (250 80% 70%)
- `tailwind.config.js` - Added tts color mapping + pulse-subtle keyframe animation

## Decisions Made
- voiceName prop kept in interface for backward compatibility but prefixed with underscore (_voiceName) since ttsCore's findVoice algorithm handles voice selection internally -- consumers pass it but it's a no-op
- TTS color chosen as indigo-purple (hsl 250) to be distinct from both the blue primary and the purple accent-purple tokens already in the design system
- pulse-subtle animation defined in Tailwind config keyframes (not globals.css) for consistency with existing accordion animations
- Focus management via useEffect watching isSpeaking, using ref.current only in effect body (React Compiler safe)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Prefixed unused voiceName with underscore**
- **Found during:** Task 1 (ESLint verification)
- **Issue:** voiceName is destructured from props for backward compatibility but not used in the new useTTS speak call (SpeakOptions takes voice object, not string name)
- **Fix:** Renamed to `_voiceName` to satisfy no-unused-vars ESLint rule while keeping prop in interface
- **Files modified:** src/components/ui/SpeechButton.tsx
- **Verification:** `npx eslint src/components/ui/SpeechButton.tsx` passes
- **Committed in:** e2bde1f (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Minor naming adjustment for ESLint compliance. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- SpeechButton fully migrated to new TTS system, ready for AppShell wiring in Plan 19-06
- All 6 consumer components (TestPage, StudyGuidePage, PracticeSession, PracticeResults, HistoryTab, Flashcard3D) unchanged
- InterviewSession migration (Plan 19-05) can proceed independently
- Old useSpeechSynthesis hook still intact, will be deleted in Plan 19-06 cleanup

## Self-Check: PASSED

- [x] src/components/ui/SpeechButton.tsx exists and has default export
- [x] src/styles/tokens.css has --color-tts in :root and .dark
- [x] tailwind.config.js has tts color and pulse-subtle animation
- [x] Commit e2bde1f exists (Task 1)
- [x] Commit 9933d09 exists (Task 2)
- [x] `npx tsc --noEmit` passes
- [x] `npm run lint` passes on SpeechButton
- [x] `npm run build` succeeds

---
*Phase: 19-tts-core-extraction*
*Completed: 2026-02-14*
