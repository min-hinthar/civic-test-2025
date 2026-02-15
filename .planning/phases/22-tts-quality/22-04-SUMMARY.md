---
phase: 22-tts-quality
plan: 04
subsystem: audio
tags: [htmlaudioelement, service-worker, cachefirst, burmese, myanmar, mp3, pwa]

# Dependency graph
requires:
  - phase: 22-01
    provides: TTSSettings with burmeseVoice field, BurmeseVoice type
  - phase: 22-02
    provides: SpeechButton with SoundWaveIcon/ExpandingRings/PauseIcon (extracted here)
provides:
  - Burmese audio playback adapter (createBurmesePlayer)
  - URL helper for pre-generated MP3 paths (getBurmeseAudioUrl)
  - BurmeseSpeechButton component with Myanmar flag icon
  - Shared SpeechAnimations module (SoundWaveIcon, ExpandingRings, PauseIcon)
  - SW CacheFirst route for /audio/ paths (800 entries, 90-day expiry)
affects: [22-05, 22-06, 22-07, 22-08]

# Tech tracking
tech-stack:
  added: []
  patterns: [HTMLAudioElement adapter with state subscription, module-level singleton player, CacheFirst SW caching for static audio]

key-files:
  created:
    - src/lib/audio/burmeseAudio.ts
    - src/components/ui/BurmeseSpeechButton.tsx
    - src/components/ui/SpeechAnimations.tsx
  modified:
    - src/components/ui/SpeechButton.tsx
    - src/lib/pwa/sw.ts

key-decisions:
  - "Module-level singleton player shared across BurmeseSpeechButton instances"
  - "Myanmar flag as simple 3-stripe SVG (yellow/green/red) with white star at 16x16"
  - "RATE_MAP duplicated inline in BurmeseSpeechButton (avoids importing from TTSContext)"
  - "SpeechAnimations.tsx extracted as shared module for both SpeechButton and BurmeseSpeechButton"
  - "BurmeseSpeechButton tracks per-instance isSpeaking via URL comparison (currentFile === myUrl)"

patterns-established:
  - "Shared SpeechAnimations: import { SoundWaveIcon, ExpandingRings, PauseIcon } from SpeechAnimations"
  - "Burmese audio URL convention: /audio/my-MM/{female|male}/{questionId}-{q|a|e}.mp3"
  - "Module-level audio singleton with state subscription for React integration"

# Metrics
duration: 15min
completed: 2026-02-15
---

# Phase 22 Plan 04: Burmese Audio Infrastructure Summary

**HTMLAudioElement-based Burmese audio adapter with createBurmesePlayer factory, BurmeseSpeechButton with Myanmar flag, and CacheFirst SW route for /audio/ paths**

## Performance

- **Duration:** 15 min
- **Started:** 2026-02-15T09:37:40Z
- **Completed:** 2026-02-15T09:52:15Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Created burmeseAudio.ts adapter with play/pause/resume/cancel and retry-once error handling
- Built BurmeseSpeechButton component with Myanmar flag icon, speaking/paused/error states matching SpeechButton
- Added CacheFirst SW route for /audio/ paths with 800 entries and 90-day expiry
- Extracted SoundWaveIcon/ExpandingRings/PauseIcon to shared SpeechAnimations.tsx

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Burmese audio adapter and URL helper** - `19200f6` (feat)
2. **Task 2: Create BurmeseSpeechButton and add SW caching route** - `3f68a4c` (feat)

## Files Created/Modified
- `src/lib/audio/burmeseAudio.ts` - Burmese audio adapter with getBurmeseAudioUrl and createBurmesePlayer
- `src/components/ui/BurmeseSpeechButton.tsx` - Myanmar flag speech button for pre-generated MP3 playback
- `src/components/ui/SpeechAnimations.tsx` - Shared animation components (SoundWaveIcon, ExpandingRings, PauseIcon)
- `src/components/ui/SpeechButton.tsx` - Updated imports to use shared SpeechAnimations
- `src/lib/pwa/sw.ts` - Added CacheFirst route for /audio/ paths

## Decisions Made
- Module-level singleton player shared across all BurmeseSpeechButton instances (avoids creating multiple Audio elements)
- Myanmar flag rendered as simple 3-stripe inline SVG (16x16) for zero dependency
- RATE_MAP duplicated in BurmeseSpeechButton as inline const (simpler than importing from TTSContext)
- Per-instance speaking detection via URL comparison (playerState.currentFile === myUrl)
- SpeechAnimations.tsx created as shared module rather than keeping animations private in each button

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Burmese audio playback infrastructure complete, ready for audio file generation (22-06)
- BurmeseSpeechButton ready for integration into card/question views (22-05, 22-07)
- SW caching route ready -- will cache MP3s on first fetch with 90-day retention

## Self-Check: PASSED

All 5 files verified present. Both commits (19200f6, 3f68a4c) verified in git log. TypeScript compiles clean. ESLint passes. Production build succeeds.

---
*Phase: 22-tts-quality*
*Completed: 2026-02-15*
