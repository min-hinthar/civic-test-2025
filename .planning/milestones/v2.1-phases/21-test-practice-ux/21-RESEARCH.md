# Phase 21: Test, Practice & Interview UX Overhaul - Research

**Researched:** 2026-02-14
**Domain:** Quiz UX, Interview Simulation, Audio/Speech, Animation, Accessibility
**Confidence:** MEDIUM-HIGH (12 domains, most verified with official sources)

## Summary

Phase 21 is a large UX overhaul spanning two major feature areas: (1) replacing auto-advance quiz flow with Duolingo-style Check/Continue in Test and Practice modes, and (2) overhauling the Interview simulation with chat-style UI, speech recognition, and animated examiner character.

The existing codebase already has significant infrastructure in place: `react-canvas-confetti` for celebrations, `react-countdown-circle-timer` for circular timers, Web Audio API-based `soundEffects.ts` for programmatic UI sounds, `AudioWaveform.tsx` for microphone visualization, `useAudioRecorder.ts` for recording, Web Share API integration in `shareUtils.ts`, and `motion/react` (Framer Motion) for all animations. The main new capabilities needed are: (1) speech recognition via Web Speech API with a React wrapper, (2) fuzzy answer matching for grading spoken answers, (3) SVG/CSS character animation for the examiner, and (4) haptic feedback with graceful iOS fallback.

**Primary recommendation:** Leverage existing infrastructure heavily. Add `react-speech-recognition` for speech input, hand-roll a keyword-based answer grader (civics answers are short and predictable -- no NLP library needed), use CSS/SVG animation for the examiner character (avoid Lottie's 133KB bundle), and implement the Check/Continue flow as a state machine with `motion/react` transitions.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Slide-up feedback panel from bottom (Duolingo-style), no overlay/dimming
- Full-width color band: green correct, amber/red incorrect
- Bilingual feedback with Myanmar translations
- Advance via Continue button OR tapping panel (no swipe dismiss)
- Sound effects: correct ding + incorrect buzz
- Haptic feedback: light tap correct, double-tap incorrect (Vibration API)
- Animated icons: checkmark bounces, X shakes
- Streak counter "X in a row!" badge
- TTS button on explanation text in Practice mode
- Timer pauses during feedback panel in Mock Test
- Mock test stays multiple choice
- Segmented progress bar: full-width horizontal, color-coded, fraction label, animated pulse current, tappable in Practice only, live score Practice only, completion sparkle
- Skip button next to Check, amber/yellow in progress bar, review skipped in Practice, stays skipped in Mock Test
- Answer selection: highlighted border + background fill, changeable before Check, Check disabled until selected, 200-300ms delay after Check, options colored after Check, options disabled after Check, slide-left transitions
- Circular countdown ring: green->yellow->red, pauses during feedback
- Exit confirmation dialog with session persistence messaging
- Results: big score + pass/fail, color-coded question list, category breakdown, time comparison, retry/review/home, share via native share API, confetti on pass, SRS integration
- Keyboard: Up/Down arrow selects, context-sensitive Enter, visible focus ring, Tab order options->Skip->Check, Escape exit, auto-focus Continue
- Interview: chat-style layout, animated illustrated examiner character (professional, not cartoon), voice-only input, Practice/Real modes, USCIS 2025 rules (20q/pass@12/fail@9), early termination, auto-detect silence, show transcription before grading, re-record up to 3 attempts, ambient sound effects
- Interview visual: character at top, chat bubbles, typing indicator, recording fixed at bottom, repeat/rephrase quick-reply, darker/moody theme, US flag SVG motif
- Interview results: interview-specific design, full transcript, per-answer confidence score, difficulty indicators, early termination point, SRS integration

### Claude's Discretion
- Feedback panel height (fixed vs dynamic)
- Question number display in feedback panel
- Check button position (fixed bottom vs below options)
- Progress bar segment width strategy for many questions
- Mobile layout for fraction label vs progress bar
- Timer ring placement
- Exact design tokens/colors for segment states
- Loading skeleton during question transitions
- Warm-up question inclusion (interview)
- Manual submit button fallback for voice recording
- Mobile character resize behavior
- Progress indicator style per mode
- Performance trend chart on results
- Personalized recommendation on results

### Deferred Ideas (OUT OF SCOPE)
None -- all ideas were absorbed into phase scope.
</user_constraints>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| motion/react | ^12.33.0 | All animations (slide-up panel, transitions, icons, progress bar) | Already in use |
| react-canvas-confetti | ^2.0.7 | Celebration confetti on pass | Already in use with `Confetti` component |
| react-countdown-circle-timer | ^3.2.1 | Circular countdown timer | Already in use with `CircularTimer` component |
| lucide-react | ^0.475.0 | Icons (Check, X, SkipForward, etc.) | Already in use |
| @radix-ui/react-dialog | ^1.1.15 | Exit confirmation dialog | Already in use |
| @radix-ui/react-progress | ^1.1.8 | Progress bar base | Already in use |

### New Dependencies Required
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-speech-recognition | ^3.10.0 | React hook wrapper for Web Speech API (SpeechRecognition) | Most popular React wrapper (1.2M+ weekly downloads), handles browser prefixing, provides clean hooks API |

### No New Dependencies Needed (Hand-Roll)
| Capability | Why Not a Library |
|------------|-------------------|
| Fuzzy answer matching | Civics answers are short keyword lists; Dice coefficient in <30 lines is sufficient. Libraries like `cmpstr` or `string-similarity` are overkill and `string-similarity` is unmaintained |
| Haptic feedback | `navigator.vibrate()` is a 3-line API call with feature detection. No library needed |
| Sound effects | Already have `soundEffects.ts` using Web Audio API. Extend with new sounds. No Howler.js needed (adds 7KB for zero benefit over existing pattern) |
| SVG character animation | CSS keyframes + inline SVG. Lottie adds 133KB gzipped for a simple idle/speaking character. CSS animation is sufficient |
| Chat UI layout | Flexbox + motion/react. No chat UI library needed |
| Circular timer | Already have `CircularTimer.tsx` using `react-countdown-circle-timer` |
| Audio waveform | Already have `AudioWaveform.tsx` using Web Audio API AnalyserNode |
| Share API | Already have `shareUtils.ts` with Web Share API + clipboard + download fallback |
| Confetti | Already have `Confetti.tsx` using `react-canvas-confetti` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-speech-recognition | Raw Web Speech API | react-speech-recognition abstracts browser prefix differences, provides React hooks, handles edge cases. Worth the dependency (~5KB) |
| CSS SVG character animation | Lottie/dotLottie | Lottie gives smoother After Effects-quality animation but adds 50-133KB. For idle breathing + speaking pulse, CSS is sufficient |
| Hand-rolled answer grading | cmpstr or string-comparison | Libraries add unnecessary dependency for comparing 1-3 keyword phrases. Custom grader can be tuned exactly to civics answer patterns |
| Web Speech API | Whisper.js (Transformers.js) | Whisper runs 100% offline with higher accuracy, but downloads a 40-150MB model. Completely impractical for a PWA. Web Speech API is the right choice |

**Installation:**
```bash
pnpm add react-speech-recognition
pnpm add -D @types/react-speech-recognition
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── quiz/                    # NEW: Shared Check/Continue quiz components
│   │   ├── QuizShell.tsx        # State machine orchestrator
│   │   ├── FeedbackPanel.tsx    # Slide-up correct/incorrect panel
│   │   ├── SegmentedProgressBar.tsx  # Color-coded segmented bar
│   │   ├── AnswerOption.tsx     # Selectable answer with keyboard nav
│   │   ├── QuizHeader.tsx       # Exit button, timer, question info
│   │   └── SkipButton.tsx       # Skip button component
│   ├── test/                    # EXISTING: Mock test specific
│   │   ├── CircularTimer.tsx    # Already exists
│   │   ├── AnswerFeedback.tsx   # Refactor: merge into FeedbackPanel
│   │   └── PreTestScreen.tsx    # Already exists
│   ├── interview/               # EXISTING: Expand with new components
│   │   ├── InterviewSession.tsx # Major refactor: add speech recognition, chat UI
│   │   ├── InterviewerAvatar.tsx # Refactor: add SVG character with animations
│   │   ├── ChatBubble.tsx       # NEW: Examiner/user chat message
│   │   ├── TranscriptionReview.tsx # NEW: Show transcript, confirm/re-record
│   │   ├── InterviewResults.tsx # Refactor: interview-specific results
│   │   └── AudioWaveform.tsx    # Already exists
│   └── results/                 # NEW: Shared results components
│       ├── TestResults.tsx      # Redesigned test/practice results
│       └── ScoreDisplay.tsx     # Big score with animations
├── hooks/
│   ├── useSpeechRecognition.ts  # NEW: Wrapper around react-speech-recognition
│   ├── useAudioRecorder.ts      # Already exists
│   └── useQuizState.ts          # NEW: Quiz state machine hook
├── lib/
│   ├── audio/
│   │   └── soundEffects.ts      # EXTEND: Add new sounds (skip, streak, panel)
│   ├── interview/
│   │   ├── answerGrader.ts      # NEW: Keyword-based fuzzy answer matching
│   │   └── interviewStore.ts    # Already exists
│   └── haptics.ts               # NEW: Vibration API wrapper
└── pages/
    └── TestPage.tsx             # Major refactor: integrate Check/Continue flow
```

### Pattern 1: Quiz State Machine
**What:** Manage quiz flow as an explicit state machine with phases: `idle`, `answering`, `checking`, `feedback`, `transitioning`, `skipped-review`, `finished`
**When to use:** All quiz-like flows (Mock Test, Practice, Interview)
**Why:** The current TestPage uses scattered boolean states (`showFeedback`, `isFinished`, etc.). A state machine prevents invalid state combinations and makes the Check/Continue flow explicit.

```typescript
// Source: Pattern derived from existing TestPage refactoring needs
type QuizPhase =
  | 'answering'     // User selecting an answer
  | 'checked'       // Check pressed, showing delay
  | 'feedback'      // Feedback panel visible, waiting for Continue
  | 'transitioning' // Slide-left animation to next question
  | 'skipped-review'// Reviewing skipped questions (Practice only)
  | 'finished';     // All questions answered, show results

interface QuizState {
  phase: QuizPhase;
  currentIndex: number;
  selectedAnswer: Answer | null;
  results: QuestionResult[];
  skippedIndices: number[];
  streakCount: number;
}

type QuizAction =
  | { type: 'SELECT_ANSWER'; answer: Answer }
  | { type: 'CHECK' }
  | { type: 'CONTINUE' }
  | { type: 'SKIP' }
  | { type: 'TRANSITION_COMPLETE' }
  | { type: 'FINISH' };
```

### Pattern 2: Slide-Up Feedback Panel
**What:** Full-width panel slides up from bottom with color-coded background, positioned below the question area (not overlay)
**When to use:** After user taps Check
**Animation:** `motion/react` with `initial={{ y: '100%' }}`, `animate={{ y: 0 }}`, spring transition

```typescript
// Source: motion/react docs + Duolingo UX pattern
<AnimatePresence>
  {phase === 'feedback' && (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={SPRING_SNAPPY}
      className={clsx(
        'w-full rounded-t-2xl p-5',
        isCorrect ? 'bg-success-subtle border-t-4 border-success' : 'bg-warning-subtle border-t-4 border-warning'
      )}
      onClick={handleContinue}
      role="status"
      aria-live="polite"
    >
      {/* Animated icon + message + Continue button */}
    </motion.div>
  )}
</AnimatePresence>
```

### Pattern 3: Keyboard Navigation with Roving Focus
**What:** Arrow keys move selection between answer options, Enter triggers Check/Continue contextually
**When to use:** Quiz answer selection
**ARIA pattern:** `role="radiogroup"` with `role="radio"` options, roving `tabIndex`

```typescript
// Source: W3C WAI-ARIA APG Radio Group pattern
function useRovingFocus(itemCount: number) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % itemCount);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + itemCount) % itemCount);
        break;
    }
  }, [itemCount]);

  return { focusedIndex, setFocusedIndex, handleKeyDown };
}
```

### Pattern 4: Interview Speech Recognition Flow
**What:** Record user's spoken answer, transcribe via Web Speech API, show transcript for confirmation, grade against expected answers
**Flow:** Recording -> Transcription shown -> User confirms or re-records (up to 3x) -> Grade with keyword matching

```typescript
// Source: react-speech-recognition docs
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

function useInterviewSpeech() {
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const startListening = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false, language: 'en-US' });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  return { transcript, startListening, stopListening, isSupported: browserSupportsSpeechRecognition };
}
```

### Pattern 5: Keyword-Based Answer Grading
**What:** Grade spoken answers by extracting keywords and comparing against expected answer keywords
**Why not NLP:** Civics answers are short, predictable phrases with specific required keywords (e.g., "freedom of speech", "George Washington"). Full NLP is overkill.

```typescript
// Custom grading approach for civics answers
interface GradeResult {
  isCorrect: boolean;
  confidence: number;  // 0-1 match quality
  matchedKeywords: string[];
  missingKeywords: string[];
}

function gradeAnswer(
  transcript: string,
  expectedAnswers: Array<{ text_en: string }>,
  threshold = 0.6
): GradeResult {
  const normalizedTranscript = normalize(transcript);

  for (const expected of expectedAnswers) {
    const keywords = extractKeywords(expected.text_en);
    const matched = keywords.filter(kw => normalizedTranscript.includes(kw));
    const confidence = matched.length / keywords.length;

    if (confidence >= threshold) {
      return {
        isCorrect: true,
        confidence,
        matchedKeywords: matched,
        missingKeywords: keywords.filter(kw => !matched.includes(kw)),
      };
    }
  }

  return { isCorrect: false, confidence: 0, matchedKeywords: [], missingKeywords: [] };
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function extractKeywords(answer: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'of', 'to', 'in', 'is', 'was', 'are', 'for', 'and', 'or']);
  return normalize(answer)
    .split(' ')
    .filter(w => !stopWords.has(w) && w.length > 2);
}
```

### Pattern 6: SVG Character Animation (CSS-only)
**What:** Inline SVG examiner character with CSS keyframe animations for idle, speaking, and reaction states
**Why CSS over Lottie:** Saves 133KB+ bundle. CSS keyframes handle breathing, speaking pulse, and nodding adequately for a simple character.

```css
/* Idle breathing animation */
@keyframes breathe {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.02); }
}

/* Speaking animation - mouth/jaw movement */
@keyframes speak {
  0%, 100% { transform: scaleY(1); }
  25% { transform: scaleY(1.1); }
  50% { transform: scaleY(0.9); }
  75% { transform: scaleY(1.05); }
}

/* Nod reaction */
@keyframes nod {
  0%, 100% { transform: rotate(0deg); }
  30% { transform: rotate(-3deg); }
  60% { transform: rotate(2deg); }
}
```

### Anti-Patterns to Avoid
- **Boolean state soup for quiz flow:** Don't use `showFeedback`, `isChecked`, `isTransitioning` as separate booleans. Use a single `phase` state machine value.
- **setState in effects for derived state:** Don't `useEffect(() => setIsCorrect(answer.correct))`. Compute `isCorrect` from `selectedAnswer` directly.
- **Auto-advance timers in effects:** The old pattern uses `setTimeout` in effects for auto-advance. Replace with explicit Continue button -- no timer needed.
- **Ref.current in render:** React Compiler will flag this. Keep refs in effects/handlers only.
- **useMemo<T>() generic syntax:** Use `const x: T = useMemo(() => ...)` instead.
- **Inline handlers that capture stale state:** Use refs for callback values that need fresh state (see `onCompleteRef` pattern in existing `InterviewSession.tsx`).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Confetti celebration | Custom canvas particles | `react-canvas-confetti` (already installed) | Complex physics, particle management, cleanup. Already working in codebase |
| Circular countdown timer | Custom SVG timer | `react-countdown-circle-timer` (already installed) | Smooth arc animation, color transitions, edge cases. Already working |
| Speech recognition | Raw `webkitSpeechRecognition` with prefix handling | `react-speech-recognition` | Browser prefix abstraction, React hooks integration, edge case handling across Chrome/Safari/Firefox |
| Exit confirmation dialog | Custom modal | `@radix-ui/react-dialog` (already installed) | Focus trapping, ARIA, Escape key, portal rendering |
| Web Share API | Custom share logic | Existing `shareUtils.ts` | Already handles Web Share -> Clipboard -> Download fallback chain |
| Sound effects | Howler.js or audio file loading | Existing `soundEffects.ts` pattern (Web Audio API oscillators) | Zero network requests, no audio file loading, already patterns for correct/incorrect/milestone sounds |

**Key insight:** The codebase already has ~80% of the infrastructure needed. The main work is UI refactoring and adding speech recognition. Resist adding new dependencies for solved problems.

## Common Pitfalls

### Pitfall 1: iOS Has No Vibration API
**What goes wrong:** `navigator.vibrate()` is called on iOS, app silently fails or crashes
**Why it happens:** iOS Safari has never implemented the Vibration API (confirmed via CanIUse -- "Not supported" across all iOS versions through 26.4)
**How to avoid:** Feature-detect with `if ('vibrate' in navigator)` before calling. On iOS, provide visual-only feedback (icon flash, subtle screen shake via CSS animation). Never assume vibration works.
**Warning signs:** Testing only on Android/Chrome. No fallback visual feedback.

### Pitfall 2: Web Speech API Browser Fragmentation
**What goes wrong:** Speech recognition works in Chrome but fails silently in Safari or not at all in Firefox
**Why it happens:** Chrome uses Google's cloud service (best accuracy). Safari requires Siri enabled + uses `webkitSpeechRecognition` prefix with significant limitations (no continuous mode, requires waiting 2-3s before speaking, fails in WebView/PWA). Firefox has the API behind a flag but events don't fire correctly. Edge doesn't work despite API appearing to exist.
**How to avoid:**
1. Use `react-speech-recognition` which handles prefixing
2. Show clear "unsupported browser" messaging with feature detection
3. Keep the existing self-grade buttons as fallback when speech recognition unavailable
4. Test on actual devices, not just Chrome DevTools
**Warning signs:** Only testing in Chrome. No fallback for non-Chrome users.

### Pitfall 3: Mobile Autoplay Audio Restrictions
**What goes wrong:** Sound effects don't play on first interaction, or AudioContext stays suspended
**Why it happens:** All mobile browsers block AudioContext creation/playback until a user gesture (click/tap). The existing `soundEffects.ts` already handles this with lazy AudioContext creation and `resume()`, but new code must follow the same pattern.
**How to avoid:** Always call sound functions from event handlers (onClick, not useEffect). Always check `audioContext.state === 'suspended'` and call `resume()`. Never create AudioContext at module load time.
**Warning signs:** Sounds work on desktop but not mobile. AudioContext created in module scope.

### Pitfall 4: Speech Recognition Requires HTTPS
**What goes wrong:** SpeechRecognition fails in development on `http://localhost`
**Why it happens:** Chrome requires secure context (HTTPS) for Web Speech API. `localhost` is usually exempted, but some configurations may not work.
**How to avoid:** Test with `npm run dev` (Next.js localhost should work). For non-localhost testing, use HTTPS tunnel (ngrok) or deploy to Vercel preview.
**Warning signs:** Works in production but not in development, or vice versa.

### Pitfall 5: Quiz State Machine Transition Races
**What goes wrong:** User taps Check and Continue in rapid succession, causing state to jump past feedback
**Why it happens:** Without a state machine, rapid clicks can trigger multiple state transitions. The 200-300ms delay after Check creates a window for race conditions.
**How to avoid:** Use single `phase` enum state. Each handler checks current phase before transitioning. Disable buttons during transitions. Use `motion/react` `onAnimationComplete` callbacks for transition gating.
**Warning signs:** Multiple rapid clicks cause weird state. Phase transitions triggered from setTimeout without checking current phase.

### Pitfall 6: Segmented Progress Bar Performance
**What goes wrong:** Re-rendering 20 segments on every state change causes jank
**Why it happens:** Each segment has color, animation state, and click handler. Naive implementation re-renders all segments on any change.
**How to avoid:** Memoize individual segments with `React.memo`. Use CSS transitions (not motion/react) for segment color changes. Only animate the current/active segment with motion/react.
**Warning signs:** Visible jank when advancing questions. All segments re-rendering on every state change.

### Pitfall 7: Focus Management After Check/Continue
**What goes wrong:** Focus gets lost after Check (user can't immediately Tab to Continue), or focus ring appears on wrong element
**Why it happens:** DOM changes during feedback panel slide-up can cause focus to jump to body
**How to avoid:** After feedback panel animates in, programmatically focus the Continue button with `ref.focus({ preventScroll: true })`. After Continue, focus the first answer option of the next question. Use `aria-live="polite"` on the feedback panel so screen readers announce results.
**Warning signs:** After tapping Check, keyboard navigation requires multiple Tab presses to reach Continue. Screen reader doesn't announce correct/incorrect.

### Pitfall 8: Interview Audio Context Conflicts
**What goes wrong:** TTS (SpeechSynthesis) and speech recognition (SpeechRecognition) conflict, or recording picks up TTS output
**Why it happens:** Both use the audio system. Starting recording while TTS is speaking can capture the TTS output. Also, Chrome's SpeechRecognition uses the same network service as TTS.
**How to avoid:** Sequence strictly: TTS speaks question -> TTS finishes (await promise) -> Start recording. Never overlap TTS output and microphone recording. Cancel TTS before starting recognition.
**Warning signs:** Transcript contains the question text (captured from speaker). TTS and recognition compete for audio resources.

### Pitfall 9: Safari SpeechRecognition Siri Dependency
**What goes wrong:** Speech recognition fails on iOS/macOS Safari even though API exists
**Why it happens:** Safari's SpeechRecognition requires Siri to be enabled in device settings. If Siri is disabled, the API may not return results. If Siri is enabled, users need to wait 2-3 seconds before speaking.
**How to avoid:** Add pre-interview check for browser support. Show clear messaging: "Speech recognition requires Siri to be enabled on Apple devices." Always provide self-grade fallback buttons.
**Warning signs:** Speech recognition silently returns empty results on Safari.

## Code Examples

### Haptic Feedback Utility
```typescript
// src/lib/haptics.ts
// Source: MDN Navigator.vibrate() + CanIUse verification

/** Check if device supports vibration */
const supportsVibration = typeof navigator !== 'undefined' && 'vibrate' in navigator;

/** Light tap - correct answer feedback (Android only, no-op on iOS) */
export function hapticLight(): void {
  if (!supportsVibration) return;
  try { navigator.vibrate(10); } catch { /* silently ignore */ }
}

/** Double tap - incorrect answer feedback (Android only, no-op on iOS) */
export function hapticDouble(): void {
  if (!supportsVibration) return;
  try { navigator.vibrate([10, 50, 10]); } catch { /* silently ignore */ }
}

/** Medium tap - button press feedback */
export function hapticMedium(): void {
  if (!supportsVibration) return;
  try { navigator.vibrate(20); } catch { /* silently ignore */ }
}
```

### Extending Sound Effects
```typescript
// Add to existing src/lib/audio/soundEffects.ts
// Source: Extending established Web Audio API pattern in codebase

/** Short pop for skip action. 500Hz sine, 100ms. */
export function playSkip(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    playNote(ctx, 500, 0, 0.1, 0.15, 'triangle');
  } catch { /* silently ignore */ }
}

/** Streak chime: ascending 3-note with triangle wave. Celebratory. */
export function playStreak(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    playNote(ctx, 659, 0, 0.1, 0.2, 'triangle');    // E5
    playNote(ctx, 784, 0.08, 0.1, 0.2, 'triangle');  // G5
    playNote(ctx, 1047, 0.16, 0.15, 0.2, 'triangle'); // C6
  } catch { /* silently ignore */ }
}

/** Panel slide-up whoosh. Quick frequency sweep. */
export function playPanelReveal(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch { /* silently ignore */ }
}
```

### Segmented Progress Bar
```typescript
// Source: Custom implementation following existing Progress component pattern
interface SegmentState {
  status: 'correct' | 'incorrect' | 'skipped' | 'current' | 'unanswered';
}

function SegmentedProgressBar({ segments, onSegmentTap, allowTap }: {
  segments: SegmentState[];
  onSegmentTap?: (index: number) => void;
  allowTap: boolean;
}) {
  const segmentColors: Record<SegmentState['status'], string> = {
    correct: 'bg-success',
    incorrect: 'bg-warning',
    skipped: 'bg-amber-400',
    current: 'bg-primary',
    unanswered: 'bg-muted/30',
  };

  return (
    <div className="flex w-full gap-0.5" role="progressbar" aria-valuenow={segments.filter(s => s.status !== 'unanswered').length} aria-valuemax={segments.length}>
      {segments.map((seg, i) => (
        <button
          key={i}
          disabled={!allowTap || seg.status === 'unanswered'}
          onClick={() => onSegmentTap?.(i)}
          className={clsx(
            'h-2 flex-1 rounded-full transition-colors duration-300',
            segmentColors[seg.status],
            seg.status === 'current' && 'animate-pulse',
            allowTap && seg.status !== 'unanswered' && 'cursor-pointer hover:opacity-80',
          )}
          aria-label={`Question ${i + 1}: ${seg.status}`}
        />
      ))}
    </div>
  );
}
```

### Chat Bubble Component
```typescript
// Source: Custom, following existing component patterns
interface ChatBubbleProps {
  sender: 'examiner' | 'user';
  children: React.ReactNode;
  isCorrect?: boolean;  // For results transcript
}

function ChatBubble({ sender, children, isCorrect }: ChatBubbleProps) {
  const isExaminer = sender === 'examiner';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={SPRING_GENTLE}
      className={clsx(
        'max-w-[80%] rounded-2xl px-4 py-3',
        isExaminer
          ? 'self-start bg-muted/40 text-foreground rounded-tl-sm'
          : 'self-end bg-primary text-white rounded-tr-sm',
        isCorrect === true && 'border-2 border-success',
        isCorrect === false && 'border-2 border-warning',
      )}
    >
      {children}
    </motion.div>
  );
}
```

### Silence Detection for Interview Recording
```typescript
// Source: Web Audio API AnalyserNode pattern (already used in AudioWaveform.tsx)

/** Detect silence from microphone stream using AnalyserNode RMS */
function useSilenceDetection(
  stream: MediaStream | null,
  { silenceThreshold = 0.01, silenceMs = 2000, onSilence }: {
    silenceThreshold?: number;
    silenceMs?: number;
    onSilence: () => void;
  }
) {
  useEffect(() => {
    if (!stream) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 256;

    const dataArray = new Float32Array(analyser.frequencyBinCount);
    let silenceStart: number | null = null;
    let rafId: number;

    const check = () => {
      analyser.getFloatTimeDomainData(dataArray);
      const rms = Math.sqrt(dataArray.reduce((sum, v) => sum + v * v, 0) / dataArray.length);

      if (rms < silenceThreshold) {
        if (silenceStart === null) silenceStart = Date.now();
        else if (Date.now() - silenceStart > silenceMs) {
          onSilence();
          return; // Stop checking
        }
      } else {
        silenceStart = null;
      }

      rafId = requestAnimationFrame(check);
    };

    check();

    return () => {
      cancelAnimationFrame(rafId);
      source.disconnect();
      void audioContext.close();
    };
  }, [stream, silenceThreshold, silenceMs, onSilence]);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Auto-advance on tap (current TestPage) | Explicit Check/Continue (Duolingo-style) | 2020+ (industry standard) | Better learning outcomes, user control, reduced anxiety |
| Self-grading buttons for interview | Speech recognition + auto-grading | 2023+ (Web Speech API matured) | More realistic interview simulation |
| Lottie for web character animation | CSS keyframes + inline SVG | 2024+ (dotLottie is smaller but CSS is zero-dependency) | 133KB+ savings. CSS is sufficient for simple idle/speaking animation |
| Howler.js for UI sounds | Web Audio API oscillators | 2022+ (existing pattern in codebase) | Zero network requests, 0KB added, programmatic control |
| string-similarity npm (unmaintained) | Custom keyword extraction | 2024+ (string-similarity deprecated) | No dependency on unmaintained library, tuned to civics answers |

**Deprecated/outdated:**
- `string-similarity` npm: No longer maintained. Use `cmpstr` if a library is needed, but hand-rolled keyword matching is better for this use case.
- `react-lottie`: Uses lottie-web (133KB gzipped). If Lottie is needed, use `@lottiefiles/dotlottie-react` (WASM runtime, much smaller). But CSS/SVG animation is recommended instead.
- Raw `webkitSpeechRecognition`: Use `react-speech-recognition` wrapper instead for cross-browser handling.

## Open Questions

1. **Safari Speech Recognition Reliability**
   - What we know: Safari 14.5+ supports `webkitSpeechRecognition` but requires Siri enabled, has no continuous mode, and is unreliable in WebViews/PWAs. iOS Safari behavior is particularly fragile.
   - What's unclear: How reliable is it in practice for short civics answers (5-15 word responses)? Will the 2-3 second wait-before-speaking requirement confuse users?
   - Recommendation: Implement speech recognition with Chrome as primary target. Show clear browser support messaging. Keep self-grade buttons as permanent fallback -- don't block the interview feature on speech recognition working perfectly across all browsers.
   - Confidence: MEDIUM -- Safari support is documented but real-world reliability is uncertain.

2. **SVG Character Design Complexity**
   - What we know: The CONTEXT.md specifies "professional illustration style (not cartoon)" with idle breathing, speaking, and nod/reaction animations.
   - What's unclear: How complex does the SVG need to be? A professional-looking character with multiple animation states is art direction work. The current `InterviewerAvatar.tsx` is a simple silhouette.
   - Recommendation: Design a more detailed SVG character (head, shoulders, simple facial features, suit/tie) that can be animated with CSS. Keep it stylized but professional. Avoid photorealism. Separate SVG elements for head (nod animation), mouth area (speaking), and chest (breathing). This is design work that will need iteration.
   - Confidence: MEDIUM -- technical approach is clear, but visual design quality depends on SVG craftsmanship.

3. **Fuzzy Grading Threshold Calibration**
   - What we know: Civics answers range from single words ("George Washington") to short phrases ("freedom of speech, freedom of religion, freedom of the press"). Multiple correct answers exist for many questions.
   - What's unclear: What confidence threshold (0.6? 0.7?) produces fair grading? How well does keyword matching handle synonyms and paraphrasing?
   - Recommendation: Start with 0.5 threshold (lenient), show confidence score to user, let them override with re-record. Tune threshold based on user testing. Include common synonyms/variations in the answer keyword sets.
   - Confidence: MEDIUM -- approach is sound but calibration needs real testing.

4. **Mobile Performance with Multiple Canvas Elements**
   - What we know: Interview screen will have AudioWaveform (canvas), potentially confetti (canvas), and SVG animations running simultaneously on mobile.
   - What's unclear: Will this cause frame drops on low-end Android devices?
   - Recommendation: Use `requestAnimationFrame` exclusively (already done in AudioWaveform). Reduce canvas resolution on low-end devices. Only run waveform animation when recording is active. Profile on a low-end Android device during development.
   - Confidence: MEDIUM -- likely fine based on existing AudioWaveform performance, but untested with simultaneous animations.

## Sources

### Primary (HIGH confidence)
- MDN Navigator.vibrate() - https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate - Confirmed iOS non-support
- CanIUse Vibration API - https://caniuse.com/vibration - Confirmed: iOS Safari "Not supported" through 26.4
- CanIUse Speech Recognition - https://caniuse.com/speech-recognition - Confirmed browser support matrix: Chrome partial, Safari 14.1+ partial (webkitSpeechRecognition), Firefox disabled by default, Edge non-functional
- MDN Web Audio API Visualizations - https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API - AnalyserNode waveform pattern
- MDN Web Audio API Best Practices - https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices - AudioContext lifecycle
- MDN Navigator.share() - https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share - Share API support
- W3C WAI-ARIA Radio Group Pattern - https://www.w3.org/WAI/ARIA/apg/patterns/radio/examples/radio/ - Roving tabindex keyboard navigation
- motion/react docs (Context7 /websites/motion_dev_react) - AnimatePresence, exit animations, layout animations
- canvas-confetti docs (Context7 /catdad/canvas-confetti) - Custom instance, reset, worker mode

### Secondary (MEDIUM confidence)
- react-speech-recognition npm - https://www.npmjs.com/package/react-speech-recognition - React wrapper for Web Speech API, hooks API
- Safari SpeechRecognition Siri requirement - https://github.com/WICG/speech-api/issues/96 + Apple Developer Forums - Siri dependency confirmed
- CmpStr GitHub - https://github.com/komed3/cmpstr - Modern TypeScript string comparison (2025 rewrite)
- Whisper Web - https://github.com/xenova/whisper-web - Browser-based Whisper via Transformers.js (too heavy for PWA, 40-150MB model)

### Tertiary (LOW confidence)
- Lottie bundle size claims (133KB gzipped) - Multiple sources but exact size depends on which features are tree-shaken
- dotLottie-react "up to 80% smaller" claim - LottieFiles marketing, not independently verified

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified against existing codebase (80% already installed), npm registry, and Context7
- Architecture: MEDIUM-HIGH - Patterns derived from existing codebase patterns and W3C ARIA guidelines
- Pitfalls: HIGH - iOS Vibration API non-support verified via CanIUse, Safari Speech issues verified via multiple sources, audio autoplay restrictions verified via MDN
- Speech Recognition: MEDIUM - Chrome works well, Safari is fragile, Firefox unusable. Real-world testing needed.
- Answer Grading: MEDIUM - Keyword matching approach is well-understood but threshold calibration needs user testing
- Character Animation: MEDIUM - CSS/SVG approach is technically sound but visual design quality is uncertain

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (30 days - Web Speech API support and browser compatibility landscape are stable)
