---
phase: 22-tts-quality
plan: 07
subsystem: ui
tags: [tts, auto-read, burmese-audio, speech-button, speed-label, flashcard, test, practice]

requires:
  - phase: 22-04
    provides: BurmeseSpeechButton component with MP3 playback
  - phase: 22-05
    provides: useAutoRead hook, SpeechOverrides type, per-session overrides on pre-screens
provides:
  - Auto-read on card navigate in FlashcardStack
  - Auto-read on question change in TestPage and PracticeSession
  - BurmeseSpeechButton alongside English SpeechButton in all content screens
  - Speed labels on all speech buttons during sessions
  - Per-session speech overrides forwarded from pre-screens to session components
affects: [22-08, flashcard, study-guide, mock-test, practice]

tech-stack:
  added: []
  patterns:
    - "useAutoRead gated on quiz phase (answering only, not feedback) for practice"
    - "Per-session overrides flow: PreTestScreen -> TestPage state, PracticeConfig -> PracticePage state -> PracticeSession props"
    - "Speed label computed from effective speed (per-session override > global setting)"
    - "Burmese buttons conditionally rendered when showBurmese is true"

key-files:
  created: []
  modified:
    - src/components/study/FlashcardStack.tsx
    - src/components/study/Flashcard3D.tsx
    - src/pages/StudyGuidePage.tsx
    - src/pages/TestPage.tsx
    - src/components/practice/PracticeSession.tsx
    - src/pages/PracticePage.tsx

key-decisions:
  - "Auto-read only handles English via SpeechSynthesis; Burmese buttons are manual (no browser Myanmar TTS)"
  - "Auto-read in PracticeSession gated on answering phase to prevent firing during feedback"
  - "Flashcard3D back face replaces Burmese SpeechButton with BurmeseSpeechButton (MP3 playback instead of browser TTS)"
  - "Speed label and rate applied to results view SpeechButtons too for consistency"
  - "PracticePage stores speedOverride/autoReadOverride from PracticeConfigType and passes to PracticeSession"

patterns-established:
  - "questionId prop on Flashcard3D enables Burmese audio URL lookup"
  - "effectiveSpeed/effectiveAutoRead pattern: override ?? global default"
  - "numericRate map { slow: 0.7, normal: 0.98, fast: 1.3 } for SpeechButton rate prop"

duration: 16min
completed: 2026-02-15
---

# Phase 22 Plan 07: Auto-Read & Burmese Buttons Integration Summary

**useAutoRead wired into FlashcardStack/TestPage/PracticeSession with BurmeseSpeechButton and speed labels on all content screens**

## Performance

- **Duration:** 16 min
- **Started:** 2026-02-15T09:56:25Z
- **Completed:** 2026-02-15T10:12:31Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- FlashcardStack auto-reads question text on card navigate; Flashcard3D shows BurmeseSpeechButton + speed labels
- StudyGuidePage flip cards (both category view and legacy grid) show BurmeseSpeechButton + speed labels on front and back
- TestPage auto-reads question on question change, accepts per-session SpeechOverrides from PreTestScreen, shows Burmese buttons + speed labels
- PracticeSession auto-reads during answering phase only (not feedback), accepts per-session overrides, shows Burmese buttons + speed labels
- PracticePage captures speedOverride/autoReadOverride from PracticeConfig and forwards to PracticeSession

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire auto-read and Burmese buttons into study screens** - `55315a0` (feat)
2. **Task 2: Wire auto-read and Burmese buttons into test and practice screens** - `4679f0c` (feat)

## Files Created/Modified

- `src/components/study/FlashcardStack.tsx` - Added useAutoRead on card navigate, speed label, passed questionId/showSpeedLabel/speedLabel to Flashcard3D
- `src/components/study/Flashcard3D.tsx` - Added questionId/showSpeedLabel/speedLabel props, BurmeseSpeechButton on front and back, replaced Burmese SpeechButton with BurmeseSpeechButton on back
- `src/pages/StudyGuidePage.tsx` - Added useTTSSettings, speed labels and BurmeseSpeechButton to all 4 SpeechButton instances in flip cards
- `src/pages/TestPage.tsx` - Added useAutoRead, SpeechOverrides state, BurmeseSpeechButton, speed labels, rate to all speech buttons
- `src/components/practice/PracticeSession.tsx` - Added useAutoRead (gated on answering phase), speedOverride/autoReadOverride props, BurmeseSpeechButton, speed labels
- `src/pages/PracticePage.tsx` - Added speedOverride/autoReadOverride state, forwards from PracticeConfigType to PracticeSession

## Decisions Made

- Auto-read handles English only via SpeechSynthesis; Burmese uses pre-generated MP3 via manual BurmeseSpeechButton (no browser Myanmar voices)
- PracticeSession auto-read gated on `quizState.phase === 'answering'` to prevent firing during feedback/checked/transition phases
- Flashcard3D back face Burmese SpeechButton (which used browser TTS with lang="my") replaced with BurmeseSpeechButton (which uses pre-generated MP3)
- Results view speech buttons also get speed labels and Burmese buttons for consistent experience
- Per-session override flow: PracticeConfig -> PracticePage state -> PracticeSession props (not direct context)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Replaced Burmese SpeechButton with BurmeseSpeechButton on Flashcard3D back face**
- **Found during:** Task 1 (Flashcard3D modification)
- **Issue:** Flashcard3D back face had `<SpeechButton text={answerMy} label="MY" lang="my">` which uses browser SpeechSynthesis for Burmese -- but browsers have no Myanmar voices, so this button would always fail silently
- **Fix:** Replaced with `<BurmeseSpeechButton questionId={questionId} audioType="a">` which uses pre-generated MP3 files
- **Files modified:** src/components/study/Flashcard3D.tsx
- **Verification:** TypeScript + ESLint pass, build succeeds
- **Committed in:** 55315a0 (Task 1 commit)

**2. [Rule 2 - Missing Critical] Added PracticePage override forwarding**
- **Found during:** Task 2 (PracticeSession integration)
- **Issue:** Plan specified PracticeSession should accept overrides from PracticeConfig but PracticePage (the intermediary) was not storing or forwarding speedOverride/autoReadOverride from PracticeConfigType
- **Fix:** Added speedOverride/autoReadOverride state to PracticePage, captured from handleStart config, passed to PracticeSession props
- **Files modified:** src/pages/PracticePage.tsx
- **Verification:** TypeScript + ESLint pass, build succeeds
- **Committed in:** 4679f0c (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 missing critical)
**Impact on plan:** Both fixes essential for correct Burmese audio behavior and override data flow. No scope creep.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All content screens (flashcards, study guide, test, practice) now have auto-read, Burmese buttons, and speed labels
- Per-session overrides flow correctly from pre-screens through to session components
- Ready for plan 22-08 (interview session integration) and plan 22-09 (final polish)

## Self-Check: PASSED

All 7 files exist on disk. Both commit hashes (55315a0, 4679f0c) found in git log.

---
*Phase: 22-tts-quality*
*Completed: 2026-02-15*
