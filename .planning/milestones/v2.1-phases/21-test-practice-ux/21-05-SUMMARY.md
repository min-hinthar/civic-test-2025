---
phase: 21-test-practice-ux
plan: 05
subsystem: interview
tags: [speech-recognition, web-speech-api, svg-animation, chat-ui, silence-detection]

# Dependency graph
requires:
  - phase: 21-02
    provides: "Answer grader for interview response matching"
provides:
  - "ExaminerCharacter SVG with 4 CSS animation states (idle/speaking/nodding/listening)"
  - "ChatBubble with sender-based alignment, confidence badges, and result icons"
  - "TypingIndicator three-dot bounce animation"
  - "useInterviewSpeech hook wrapping native Web Speech API"
  - "useSilenceDetection hook for microphone silence detection via AnalyserNode"
  - "Web Speech API TypeScript type declarations"
affects: [21-test-practice-ux]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Native Web Speech API instead of react-speech-recognition wrapper"
    - "CSS keyframe animations for SVG character states (no Lottie)"
    - "AudioContext + AnalyserNode RMS monitoring for silence detection"
    - "Cancelled-flag pattern for async effect cleanup (React Compiler safe)"

key-files:
  created:
    - "src/components/interview/ExaminerCharacter.tsx"
    - "src/components/interview/ChatBubble.tsx"
    - "src/components/interview/TypingIndicator.tsx"
    - "src/hooks/useSpeechRecognition.ts"
    - "src/hooks/useSilenceDetection.ts"
    - "src/types/speech-recognition.d.ts"
  modified: []

key-decisions:
  - "Native Web Speech API used directly instead of react-speech-recognition package (per user instruction)"
  - "CSS keyframe animations for examiner character (saves 133KB vs Lottie)"
  - "Web Speech API type declarations added as ambient .d.ts (TypeScript DOM lib missing full SpeechRecognition)"
  - "Silence detection uses cancelled-flag pattern for React Compiler safety"
  - "ExaminerCharacter uses inline <style> for CSS keyframes to keep animations co-located"

patterns-established:
  - "SpeechRecognitionConstructor type pattern for accessing window.SpeechRecognition/webkitSpeechRecognition"
  - "Inline SVG with CSS class-based animation state switching (examiner-head-{state})"
  - "ChatBubble sender-based alignment with motion entrance animation"

# Metrics
duration: 15min
completed: 2026-02-15
---

# Phase 21 Plan 05: Interview Components & Speech Hooks Summary

**Professional SVG examiner character with CSS animations, chat bubble layout, and native Web Speech API hooks for voice-driven interview mode**

## Performance

- **Duration:** 15 min
- **Started:** 2026-02-15T05:12:10Z
- **Completed:** 2026-02-15T05:27:36Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Professional SVG examiner character with idle breathing, speaking mouth, nodding head, and listening tilt animations
- Chat bubble component with examiner/user alignment, confidence badges, result correctness icons, and motion entrance
- Speech recognition hook wrapping native Web Speech API with browser support detection, HTTPS check, and Safari Siri messaging
- Silence detection hook monitoring microphone RMS via AnalyserNode with configurable threshold and duration

## Task Commits

Each task was committed atomically:

1. **Task 1: Examiner character, chat bubbles, and typing indicator** - `2ae4f79` (feat)
2. **Task 2: Speech recognition and silence detection hooks** - `b6b18c7` (feat)

## Files Created/Modified
- `src/components/interview/ExaminerCharacter.tsx` - Professional SVG examiner with 4 CSS animation states
- `src/components/interview/ChatBubble.tsx` - Chat message bubble with sender alignment and confidence badges
- `src/components/interview/TypingIndicator.tsx` - Three-dot bounce animation matching examiner bubble styling
- `src/hooks/useSpeechRecognition.ts` - React hook wrapping native Web Speech API with clean interface
- `src/hooks/useSilenceDetection.ts` - Silence detection via AudioContext AnalyserNode RMS monitoring
- `src/types/speech-recognition.d.ts` - Web Speech API type declarations for TypeScript

## Decisions Made
- Used native Web Speech API directly instead of react-speech-recognition package (per explicit user instruction, avoids dependency)
- CSS keyframe animations inline in ExaminerCharacter component (no Lottie, saves 133KB)
- Web Speech API types added as ambient .d.ts since TypeScript DOM lib only includes partial types (SpeechRecognitionResult but not SpeechRecognition interface)
- ExaminerCharacter uses `fill-patriotic` Tailwind class (not `fill-patriotic-red`) matching the tailwind.config.js color mapping
- Silence detection stops monitoring after silence detected (one-shot) to avoid repeated callbacks

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Used native Web Speech API instead of react-speech-recognition**
- **Found during:** Task 2 (Speech recognition hook)
- **Issue:** Plan specified react-speech-recognition package but user explicitly instructed to use native Web Speech API directly
- **Fix:** Implemented useInterviewSpeech wrapping window.SpeechRecognition/webkitSpeechRecognition natively
- **Files modified:** src/hooks/useSpeechRecognition.ts
- **Verification:** TypeScript compiles, lint passes, hook exports match plan interface
- **Committed in:** b6b18c7

**2. [Rule 3 - Blocking] Added Web Speech API TypeScript type declarations**
- **Found during:** Task 2 (Speech recognition hook)
- **Issue:** TypeScript DOM lib missing SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent interfaces
- **Fix:** Created src/types/speech-recognition.d.ts with full interface declarations and Window augmentation
- **Files modified:** src/types/speech-recognition.d.ts
- **Verification:** npx tsc --noEmit passes, no type errors
- **Committed in:** b6b18c7

**3. [Rule 1 - Bug] Fixed fill-patriotic-red Tailwind class to fill-patriotic**
- **Found during:** Task 1 (ExaminerCharacter)
- **Issue:** Used `fill-patriotic-red` which doesn't exist in tailwind.config.js; correct class is `fill-patriotic`
- **Fix:** Updated className on tie elements to use `fill-patriotic`
- **Files modified:** src/components/interview/ExaminerCharacter.tsx
- **Verification:** Tailwind config confirms patriotic.DEFAULT maps to hsl(var(--color-patriotic-red))
- **Committed in:** b6b18c7

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking)
**Impact on plan:** All fixes necessary for correctness. Native Web Speech API was explicitly requested by user. No scope creep.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- ExaminerCharacter, ChatBubble, and TypingIndicator ready for interview chat layout integration
- useInterviewSpeech and useSilenceDetection ready for interview orchestrator (plan 08) to sequence TTS -> recording
- Web Speech API types available globally for any future speech recognition usage
- No blockers for dependent plans

## Self-Check: PASSED

All 6 created files exist. Both task commits (2ae4f79, b6b18c7) verified in git log.

---
*Phase: 21-test-practice-ux*
*Completed: 2026-02-15*
