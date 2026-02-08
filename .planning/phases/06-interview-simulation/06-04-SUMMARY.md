---
phase: 06-interview-simulation
plan: 04
subsystem: interview-session
tags: [interview, tts, audio-recording, state-machine, waveform, timer, self-grading]
depends_on:
  requires: ["06-01", "06-02", "06-03"]
  provides: ["InterviewSession orchestrator", "InterviewTimer", "SelfGradeButtons", "AnswerReveal", "AudioWaveform"]
  affects: ["06-05"]
tech-stack:
  added: []
  patterns: ["state-driven phase transitions", "React key-based component reset", "canvas waveform visualization", "lazy useState for impure initializers"]
key-files:
  created:
    - src/components/interview/InterviewSession.tsx
    - src/components/interview/InterviewTimer.tsx
    - src/components/interview/SelfGradeButtons.tsx
    - src/components/interview/AnswerReveal.tsx
    - src/components/interview/AudioWaveform.tsx
  modified:
    - src/pages/InterviewPage.tsx
    - src/lib/i18n/strings.ts
decisions:
  - "Removed 'revealing' phase to avoid setState in effect; merged into 'grading' phase with TTS-only effect"
  - "Used lazy useState(() => Date.now()) instead of useRef(Date.now()) for React Compiler purity"
  - "InterviewTimer resets via React key (parent uses key={currentIndex}) instead of setState in effect"
  - "Grading phase reads answer aloud via TTS effect (no state transition in effect body)"
metrics:
  duration: 9min
  completed: 2026-02-08
---

# Phase 6 Plan 4: Interview Session Flow Summary

State-driven interview session orchestrator with TTS, recording, timers, self-grading, and distinct realistic/practice mode behaviors.

## One-liner

Interview session flow with chime->TTS->recording->grading cycle, 15s timer for realistic mode, and WhyButton/AddToDeck for practice mode.

## What Was Built

### Task 1: Supporting Components

1. **InterviewTimer** (`src/components/interview/InterviewTimer.tsx`)
   - 4px shrinking progress bar, primary-500 to warning-500 color transition in last 3 seconds
   - Resets via React key (avoids setState in effect for React Compiler compliance)
   - Hidden when isActive=false, calls onExpired at 0

2. **SelfGradeButtons** (`src/components/interview/SelfGradeButtons.tsx`)
   - Correct (success-500) and Incorrect (warning-500) side-by-side buttons
   - Press animation (scale 0.95) and brief colored flash overlay on grade
   - Bilingual text via BilingualText component

3. **AnswerReveal** (`src/components/interview/AnswerReveal.tsx`)
   - Primary answer prominently displayed with "Also accepted" alternatives
   - Play recording button with Audio element playback
   - Practice mode: WhyButton (compact) + AddToDeckButton (compact)
   - Fade-in animation via motion/react

4. **AudioWaveform** (`src/components/interview/AudioWaveform.tsx`)
   - Canvas-based real-time waveform via AudioContext + AnalyserNode
   - fftSize=256, primary-500 stroke color
   - Flat line when inactive, MicOff icon fallback when no stream
   - Proper cleanup of AudioContext, animation frame, and source nodes

### Task 2: InterviewSession Orchestrator

**InterviewSession** (`src/components/interview/InterviewSession.tsx`)
- State-driven phase machine: greeting -> chime -> reading -> responding -> grading -> transition
- Greeting: TTS reads random greeting, 1s pause, then first question
- Chime: plays 880Hz chime, 200ms delay before reading
- Reading: TTS reads question, InterviewerAvatar pulses, text hidden until TTS ends
- Responding: question text fades in, AudioWaveform shows, replay button (up to 2x)
- Grading: AnswerReveal + SelfGradeButtons, correct answer read aloud via TTS
- Transition: 1.5s delay, advance to next question

**Mode-specific behaviors:**
- Realistic: 15s InterviewTimer auto-advances to grading, nav locked, threshold stop (12 correct pass / 9 incorrect fail)
- Practice: Show Answer button, progress bar, running score, WhyButton/AddToDeck, quit with Dialog confirmation

**InterviewPage** (`src/pages/InterviewPage.tsx`)
- Integrated InterviewSession into session phase
- Passes mode, micPermission, onComplete handler
- Stores results/duration/endReason for plan 06-05's results page

## Task Commits

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Supporting components | 5da1a5a | InterviewTimer, SelfGradeButtons, AnswerReveal, AudioWaveform, strings.ts |
| 2 | InterviewSession orchestrator | a1a2b8f | InterviewSession.tsx, InterviewPage.tsx |

## Decisions Made

1. **Removed 'revealing' phase** - The original plan had greeting->chime->reading->responding->revealing->grading. The 'revealing' phase needed setState(grading) synchronously in an effect, which violates React Compiler's set-state-in-effect rule. Solution: merged revealing into grading phase. The grading effect reads the answer aloud via TTS (effect body does external work, no state change).

2. **Lazy useState for startTime** - `useRef(Date.now())` is flagged by React Compiler as impure function call in render. Used `useState(() => Date.now())` with lazy initializer (only runs once, on mount).

3. **Timer reset via React key** - InterviewTimer uses `key={currentIndex}` from parent instead of a setState-in-effect reset pattern. React unmounts/remounts on key change, giving a fresh timer.

4. **Added bilingual strings** - endInterview, confirmEndTitle, confirmEndMessage, cancel, confirm, questionOf, replay, recordingUnavailable, listening, correctCount.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] React Compiler setState-in-effect for InterviewTimer reset**
- **Found during:** Task 1
- **Issue:** Timer needed to reset timeRemaining when isActive/duration changed, requiring setState in effect
- **Fix:** Removed the reset effect; parent uses React key to remount timer for each new question
- **Files modified:** InterviewTimer.tsx

**2. [Rule 1 - Bug] React Compiler impure function in render (Date.now)**
- **Found during:** Task 2
- **Issue:** `useRef(Date.now())` flagged as impure function call during render
- **Fix:** Changed to `useState(() => Date.now())` lazy initializer
- **Files modified:** InterviewSession.tsx

**3. [Rule 1 - Bug] React Compiler setState-in-effect for revealing->grading transition**
- **Found during:** Task 2
- **Issue:** Revealing phase effect called `setQuestionPhase('grading')` synchronously
- **Fix:** Removed 'revealing' phase entirely; handlers go directly to 'grading', answer TTS plays via grading-phase effect (no state change in effect body)
- **Files modified:** InterviewSession.tsx

## Next Phase Readiness

Plan 06-05 (Interview Results) can proceed. InterviewSession produces:
- `InterviewResult[]` with questionId, question text (bilingual), correctAnswers, selfGrade, category
- `durationSeconds` for session timing
- `InterviewEndReason` for pass/fail/complete/quit determination
- InterviewPage stores all three in state, transitions to 'results' phase

## Self-Check: PASSED
