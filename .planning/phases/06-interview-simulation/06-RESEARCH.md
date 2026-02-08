# Phase 6: Interview Simulation - Research

**Researched:** 2026-02-07
**Domain:** Web Speech API (TTS), MediaRecorder API (audio recording), Web Audio API (waveform visualization), interview simulation UX
**Confidence:** HIGH

## Summary

Phase 6 adds a simulated USCIS civics interview experience with two modes (Realistic and Practice). The core technical challenge involves orchestrating Web Speech API for TTS delivery, MediaRecorder API for user audio recording, Web Audio API for waveform visualization, and a state machine to manage the interview flow. The existing codebase already has a `useSpeechSynthesis` hook with voice selection logic, a well-established mastery/history system, and strong animation patterns using motion/react -- all of which should be extended rather than rebuilt.

The architecture follows the existing PracticePage state machine pattern (config -> session -> results), with the interview page managing mode selection, interview session, and results display. A new Supabase table (`interview_sessions`) and IndexedDB store will track interview history separately from mock tests, and correct/incorrect answers will feed into the existing mastery system via `recordAnswer()`.

**Primary recommendation:** Extend the existing `useSpeechSynthesis` hook to support `onEnd` callbacks and queue-based playback for the interview flow. Use the Web Audio API `OscillatorNode` for programmatic chime generation (no audio files needed). Use `MediaRecorder` API with `getUserMedia` for recording, and `AnalyserNode` for live waveform visualization. Follow the existing PracticePage state machine pattern for page structure.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Audio Delivery
- **Engine:** Browser Web Speech API (TTS) -- free, works offline
- **Language:** English only audio (matches real USCIS interview)
- **Replay:** Up to 2 replays per question, with ~1 second pause before replay starts
- **Replay feedback:** Show remaining replay count to user (e.g., "1 of 2 replays used")
- **Speed:** Adjustable speech rate in settings (slow/normal/fast)
- **Text display:** Question text fades in AFTER TTS finishes reading -- audio-first experience
- **Burmese text:** Optional toggle -- user can show/hide Burmese translation alongside English text
- **Question number:** Visible on screen during audio playback (e.g., "Question 3 of 20")
- **Audio cue:** Subtle chime before each question starts reading
- **Offline:** Must work offline -- Web Speech API has device-local voices
- **Fallback:** If browser doesn't support TTS, degrade to text-only mode gracefully
- **Voice selection:** Claude's discretion -- pick practical approach based on Web Speech API capabilities
- **Answer TTS:** Correct answer is also read aloud via TTS after reveal

#### Interview Flow & Pacing
- **Question count:** Always 20 questions (both modes) -- matches updated USCIS format
- **Question selection:** Random 20 from the full 100 question bank
- **Two modes with distinct behaviors:**
  - **Realistic mode:** 15-second auto-advance timer (subtle shrinking progress bar, not number), early stop at pass (12 correct) or fail (9 incorrect), no pause, no quit, no progress bar, no running score, question number only
  - **Practice mode:** Self-paced (tap to advance), all 20 questions always, pause allowed, quit allowed, progress bar + question counter visible, running score visible
- **Interviewer greeting:** TTS reads a USCIS-style interviewer greeting/intro before questions begin (both modes) -- 2-3 randomized greeting variations
- **Closing statement:** TTS reads closing statement after session -- varies by pass/fail outcome
- **3-2-1 countdown:** Visual countdown before first question starts
- **Navigation:** Top-level nav item labeled "Practice Interview"
- **Entry:** Two separate cards/buttons on the Practice Interview page -- "Realistic Interview" and "Practice Interview"
- **Setup screen:** Full setup screen with mode selection cards, expandable "What to expect" tips section, and recent interview scores (last few results)
- **Interviewer persona:** Simple silhouette/icon on screen, pulses when TTS is speaking
- **No ambient audio** -- just TTS voice and chime
- **Realistic mode pass/fail:** Session stops naturally when threshold reached, transitions smoothly to results (not jarring mid-question interruption)
- **No quitting in realistic mode** -- must complete once started
- **Practice mode quit:** Claude's discretion on partial save behavior
- **Question transitions:** Claude's discretion on inter-question transition timing/style

#### Response & Reveal
- **Response method:** Verbal + audio recording -- mic records user's spoken answer for self-review
- **Recording auto-start:** Microphone recording begins automatically after TTS finishes reading the question
- **Recording indicator:** Live audio waveform visualization while recording
- **Mic permission denied:** Degrade gracefully to verbal-only (honor system, no recording/playback)
- **Answer reveal:**
  - Realistic mode: Auto-reveal after 15-second timer expires
  - Practice mode: User taps "Show Answer" button
- **Self-grading:** Two buttons -- "Correct" / "Incorrect" (simple binary)
- **Grade feedback:** Brief colored flash -- success (green) for correct, warning (orange) for incorrect
- **Audio playback:** Play button on reveal screen lets user hear their recording alongside correct answer
- **Recording storage:** Session-only -- recordings deleted when leaving results screen
- **Post-grade flow:** Realistic mode auto-advances to next question after grading; practice mode waits for user
- **Multi-answer questions:** Show primary answer + "also accepted" alternatives listed below
- **Explanation (WhyButton):** Available only in practice mode reveal
- **AddToDeckButton (SRS):** Available only in practice mode reveal
- **Grade buttons timing:** Appear immediately with text (don't wait for answer TTS to finish)

#### Session Results
- **Results content:** Full analysis -- pass/fail status, score (X/20), category breakdown by USCIS categories, comparison to past sessions via mini line chart
- **History storage:** Separate interview history (distinct from regular test history)
- **History sync:** Sync to Supabase (new table)
- **Mastery integration:** Correct/incorrect answers update per-category mastery scores
- **Celebration:** Confetti for pass, gentle encouragement for fail -- consistent with existing app celebrations
- **Retry:** "Try Again" button + option to switch modes (realistic/practice)
- **Trend chart:** Mini line chart showing last 5-10 interview scores, combined single line with mode icon per data point
- **Explanation on results:** Claude's discretion on whether incorrect questions are expandable with WhyButton
- **No recording playback on results** -- recordings are session-only, already discarded
- **Dashboard widget:** Interview-specific card showing last score + contextual suggestion (e.g., "Try realistic mode", "Practice weak categories")
- **History page:** New "Interview" tab on History page for interview-specific results
- **Interview setup:** Shows recent past interview scores for context

### Claude's Discretion
- Voice selection strategy for Web Speech API
- Inter-question transition timing and animation
- Practice mode quit behavior (save partial or discard)
- Whether incorrect questions on results screen include expandable explanations
- Interviewer silhouette/icon design details
- Countdown animation style

### Deferred Ideas (OUT OF SCOPE)
- **USCIS test format correction (20 questions / pass at 12 / fail at 9):** This must be fixed across the ENTIRE app (existing test mode, history, readiness calculations), not just interview simulation. Flagged as a prerequisite or parallel fix needed before/during Phase 6.
</user_constraints>

## Standard Stack

### Core (Already in Project)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Web Speech API (SpeechSynthesis) | Browser native | TTS question delivery | Free, offline-capable, already used via `useSpeechSynthesis` hook |
| MediaRecorder API | Browser native | Audio recording of user responses | Standard browser API, no dependencies needed |
| Web Audio API (AudioContext, AnalyserNode, OscillatorNode) | Browser native | Waveform visualization + programmatic chime generation | Native API, works offline, no audio files needed |
| motion/react | ^12.33.0 | Animations (countdown, transitions, pulse, fade) | Already in project, used extensively |
| recharts | ^3.4.1 | Mini trend line chart for interview scores | Already in project, used in HistoryPage |
| idb-keyval | ^6.2.2 | IndexedDB storage for interview history | Already in project, pattern established |
| react-canvas-confetti | ^2.0.7 | Pass celebration | Already in project, Confetti component exists |
| react-countup | ^6.5.3 | Score animation | Already in project, CountUpScore component exists |
| lucide-react | ^0.475.0 | Icons (mic, volume, play, etc.) | Already in project |
| clsx | ^2.1.1 | Conditional CSS classes | Already in project |

### Supporting (No New Dependencies)

No new npm packages are required. All functionality is achievable with browser-native APIs and existing dependencies.

### Alternatives Considered

| Instead of | Could Use | Why Not |
|------------|-----------|---------|
| Web Audio OscillatorNode for chime | Audio file (.mp3) | No audio files in project currently; programmatic generation avoids asset management and keeps bundle small |
| MediaRecorder for recording | Third-party recording lib | Browser native is sufficient; no need for extra dependency |
| Canvas-based waveform | SVG waveform | Canvas is the standard approach for real-time audio visualization per MDN documentation |

**Installation:** No new packages needed.

## Architecture Patterns

### Recommended Project Structure

```
src/
├── pages/
│   └── InterviewPage.tsx              # Main page (state machine: setup -> session -> results)
├── components/
│   └── interview/
│       ├── InterviewSetup.tsx          # Mode selection cards, tips, recent scores
│       ├── InterviewSession.tsx        # Core interview flow component
│       ├── InterviewResults.tsx        # Results display with chart + category breakdown
│       ├── InterviewerAvatar.tsx       # Silhouette icon with pulse animation
│       ├── InterviewCountdown.tsx      # 3-2-1 visual countdown
│       ├── InterviewTimer.tsx          # Shrinking progress bar (realistic mode)
│       ├── SelfGradeButtons.tsx        # Correct/Incorrect binary buttons
│       ├── AnswerReveal.tsx            # Answer display with primary + alternatives
│       ├── AudioWaveform.tsx           # Canvas-based live waveform visualization
│       └── InterviewDashboardWidget.tsx # Dashboard card for interview stats
├── hooks/
│   ├── useInterviewTTS.ts             # Extended TTS hook with onEnd, queue, chime
│   ├── useAudioRecorder.ts            # MediaRecorder + waveform hook
│   └── useInterviewHistory.ts         # IndexedDB interview history hook
├── lib/
│   ├── interview/
│   │   ├── interviewStore.ts          # IndexedDB store for interview sessions
│   │   ├── interviewSync.ts           # Supabase sync for interview history
│   │   ├── interviewGreetings.ts      # Randomized greeting/closing text
│   │   └── audioChime.ts             # Web Audio API chime generator
│   └── i18n/
│       └── strings.ts                 # Add interview section to existing strings
├── types/
│   └── index.ts                       # Add InterviewSession, InterviewResult types
│   └── supabase.ts                    # Add InterviewSessionRow type
```

### Pattern 1: Page State Machine (following PracticePage)
**What:** Three-phase state machine managing the interview lifecycle
**When to use:** Any multi-step flow with distinct screens
**Example:**
```typescript
type InterviewPhase = 'setup' | 'session' | 'results';

const InterviewPage = () => {
  const [phase, setPhase] = useState<InterviewPhase>('setup');
  const [mode, setMode] = useState<'realistic' | 'practice'>('realistic');
  const [results, setResults] = useState<InterviewResult[]>([]);

  return (
    <div className="page-shell">
      <AppNavigation locked={phase === 'session' && mode === 'realistic'} />
      {phase === 'setup' && <InterviewSetup onStart={(m) => { setMode(m); setPhase('session'); }} />}
      {phase === 'session' && <InterviewSession mode={mode} onComplete={(r) => { setResults(r); setPhase('results'); }} />}
      {phase === 'results' && <InterviewResults results={results} mode={mode} onRetry={() => setPhase('setup')} />}
    </div>
  );
};
```

### Pattern 2: Extended TTS Hook with Callbacks
**What:** Build on existing `useSpeechSynthesis` to support `onEnd` callback for sequencing
**When to use:** When TTS completion triggers the next UI action
**Example:**
```typescript
// Extend existing useSpeechSynthesis to add onEnd support
const useInterviewTTS = () => {
  const { speak: baseSpeakFn, cancel, isSupported } = useSpeechSynthesis();

  const speakWithCallback = useCallback(
    (text: string, options?: SpeakOptions & { onEnd?: () => void }) => {
      if (!text?.trim() || !isSupported) {
        options?.onEnd?.();
        return;
      }
      // Create utterance manually to attach onend handler
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(text);
      // Voice selection logic from existing hook...
      utterance.onend = () => options?.onEnd?.();
      utterance.onerror = () => options?.onEnd?.(); // Fallback on error
      synth.cancel();
      synth.speak(utterance);
    },
    [isSupported]
  );

  return { speak: speakWithCallback, cancel, isSupported };
};
```

### Pattern 3: Audio Recording with Graceful Degradation
**What:** MediaRecorder hook that handles permission denial gracefully
**When to use:** When mic recording is optional (honor system fallback)
**Example:**
```typescript
const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setHasPermission(true);
      return stream;
    } catch {
      setHasPermission(false);
      return null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    const stream = streamRef.current ?? await requestPermission();
    if (!stream) return; // Permission denied - degrade gracefully

    chunksRef.current = [];
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      setAudioURL(URL.createObjectURL(blob));
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
  }, [requestPermission]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  // Cleanup blob URLs on unmount
  // ...

  return { isRecording, hasPermission, audioURL, startRecording, stopRecording, requestPermission };
};
```

### Pattern 4: Programmatic Chime with Web Audio API
**What:** Generate a subtle chime sound without audio files
**When to use:** Before each question TTS begins
**Example:**
```typescript
// Source: MDN Web Audio API / OscillatorNode documentation
let audioContext: AudioContext | null = null;

export function playChime(): void {
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
  osc.type = 'sine';

  gain.gain.setValueAtTime(0.3, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

  osc.start(audioContext.currentTime);
  osc.stop(audioContext.currentTime + 0.5);
}
```

### Pattern 5: Live Waveform Visualization with AnalyserNode
**What:** Canvas-based real-time audio waveform during recording
**When to use:** Recording indicator component
**Example:**
```typescript
// Source: MDN Visualizations with Web Audio API
const AudioWaveform = ({ stream }: { stream: MediaStream | null }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!stream || !canvasRef.current) return;

    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      // Draw waveform on canvas...
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      audioCtx.close();
    };
  }, [stream]);

  return <canvas ref={canvasRef} className="h-12 w-full rounded-lg" />;
};
```

### Anti-Patterns to Avoid
- **Do NOT access `ref.current` during render** -- React Compiler ESLint rule. Use refs only in effects and handlers.
- **Do NOT use `useMemo<Type>()` generic syntax** -- incompatible with React Compiler. Use `const x: Type = useMemo(...)` instead.
- **Do NOT use `setState()` directly in effect bodies** without the eslint-disable comment and "intentional" justification.
- **Do NOT create AudioContext in module scope** -- browsers require user gesture to start AudioContext. Create lazily on first user interaction.
- **Do NOT rely solely on `SpeechSynthesisUtterance.onend`** -- it can be unreliable. Add timeout-based fallback.
- **Do NOT store MediaRecorder blobs in IndexedDB** -- recordings are session-only per user decision.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Voice selection logic | Custom voice picker | Extend existing `useSpeechSynthesis.findVoice()` | Already handles Apple/Android/enhanced voice priority |
| Confetti celebration | Custom particles | Existing `Confetti` component | Already supports sparkle/burst/celebration intensities |
| Score animation | Custom counter | Existing `CountUpScore` component | Already has spring animation + reduced motion support |
| Line chart | Custom chart | Existing recharts `LineChart` pattern from HistoryPage | Already styled for dark/light mode |
| Random question selection | Custom shuffle | Existing `fisherYatesShuffle()` utility | Proven, immutable Fisher-Yates implementation |
| Navigation locking | Custom lock | Existing `AppNavigation locked` prop | Already handles lock message, mobile menu, etc. |
| Bilingual text display | Custom i18n | Existing `BilingualText`, `BilingualHeading`, `SectionHeading` | Consistent with app patterns |
| Bilingual toasts | Custom notifications | Existing `useToast` from `BilingualToast` | Supports `showError`, `showSuccess`, `showInfo` |
| Explanation cards | Custom explanations | Existing `WhyButton` + `ExplanationCard` | Already has expand/collapse, memoize, citation support |
| SRS deck integration | Custom card add | Existing `AddToDeckButton` component | Already has optimistic UI, compact/full modes |
| Mastery recording | Custom mastery | Existing `recordAnswer()` from mastery store | Fire-and-forget with `sessionType: 'test'` or `'practice'` |
| Test pass/fail logic | Custom threshold | Constants `PASS_THRESHOLD = 12`, `INCORRECT_LIMIT = 9` | Already established in TestPage |
| IndexedDB persistence | Raw IndexedDB | idb-keyval `createStore`, `get`, `set` | Established pattern in masteryStore and srsStore |

**Key insight:** Most of the infrastructure for this phase already exists. The primary new work is the interview-specific orchestration (TTS sequencing, recording, grading flow) and the interview-mode-specific UI components.

## Common Pitfalls

### Pitfall 1: SpeechSynthesisUtterance `onend` Unreliability
**What goes wrong:** The `onend` callback on SpeechSynthesisUtterance is known to sometimes not fire, especially on Chrome/Android.
**Why it happens:** Browser TTS implementations have inconsistent event dispatch, particularly when the browser tab loses focus or the system is under load.
**How to avoid:** Implement a timeout-based fallback alongside `onend`. Estimate duration from text length (approx. 100-150ms per word at normal rate), add a safety margin, and use `setTimeout` as backup. Clear the timeout if `onend` fires first.
**Warning signs:** Users report the interview getting "stuck" on a question with no advancement.

### Pitfall 2: AudioContext Requires User Gesture
**What goes wrong:** Creating and resuming `AudioContext` fails silently if done without user interaction.
**Why it happens:** Browser autoplay policies require a user gesture (click/tap) before audio can play.
**How to avoid:** Create AudioContext lazily on the first user-initiated action (e.g., the "Start Interview" button click). Store the context in a module-level variable or ref for reuse. Call `audioContext.resume()` if state is 'suspended'.
**Warning signs:** Chime doesn't play on first question but works on subsequent ones.

### Pitfall 3: MediaRecorder Permission UX
**What goes wrong:** Microphone permission popup appears at an unexpected time, disrupting the interview flow.
**Why it happens:** `getUserMedia` triggers the browser's permission dialog immediately.
**How to avoid:** Request microphone permission during the setup phase (before countdown starts), not during the first question. Show a clear permission request UI. If denied, set a flag and skip all recording features for the session.
**Warning signs:** Interview starts, then freezes waiting for permission dialog.

### Pitfall 4: React Compiler ESLint Rules
**What goes wrong:** Build fails due to strict React Compiler rules: no `setState` in effects, no `ref.current` in render, no `useMemo<T>()` generics.
**Why it happens:** This project uses stricter ESLint rules than standard React.
**How to avoid:** Follow patterns documented in MEMORY.md:
  - Use `useMemo` for derived state, `useState` for user-interactive state
  - Access `ref.current` only in effects and event handlers
  - Type memoized values as `const x: Type = useMemo(...)` not `useMemo<Type>(...)`
  - When `setState` in effect is intentional, add `// eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: [reason]`
**Warning signs:** ESLint errors during pre-commit hook (lint-staged + ESLint + typecheck + next build).

### Pitfall 5: Blob URL Memory Leaks
**What goes wrong:** Audio recording blob URLs accumulate and consume memory.
**Why it happens:** `URL.createObjectURL()` allocates memory that persists until `URL.revokeObjectURL()` is called.
**How to avoid:** Revoke blob URLs when: (a) a new recording replaces an old one, (b) the session transitions to results, (c) the component unmounts. Use a cleanup effect.
**Warning signs:** Memory usage grows steadily during long practice sessions.

### Pitfall 6: Voices Not Immediately Available
**What goes wrong:** `speechSynthesis.getVoices()` returns empty array on initial call.
**Why it happens:** Chrome loads voices asynchronously; they aren't available until `voiceschanged` event fires.
**How to avoid:** The existing `useSpeechSynthesis` hook already handles this with retry polling (8 retries, 250ms intervals) and `voiceschanged` listener. Reuse this pattern.
**Warning signs:** First question plays with default voice instead of selected one.

### Pitfall 7: Timer and TTS Race Conditions
**What goes wrong:** In realistic mode, the 15-second timer and TTS playback can conflict -- timer expires while TTS is still reading.
**Why it happens:** TTS reading time varies by question length and speech rate.
**How to avoid:** Start the 15-second timer AFTER TTS finishes reading the question (not from when the question appears). The timer measures response time, not total question time.
**Warning signs:** Short-text questions have generous time while long questions feel rushed.

### Pitfall 8: Pre-commit Hook Build Failure
**What goes wrong:** Commits fail because `next build` runs during pre-commit and catches type errors or build issues.
**Why it happens:** Pre-commit hook runs: lint-staged + ESLint + typecheck + `next build`.
**How to avoid:** Run `pnpm typecheck` locally before committing. Ensure all new types are properly exported and imported.
**Warning signs:** Commit rejected with type errors after clean local dev.

## Code Examples

### Interview Session Type Definitions
```typescript
// Source: Extending existing types in src/types/index.ts

export type InterviewMode = 'realistic' | 'practice';

export type InterviewEndReason =
  | 'passThreshold'    // 12 correct
  | 'failThreshold'    // 9 incorrect
  | 'complete'         // All 20 answered
  | 'quit';            // Practice mode quit

export interface InterviewResult {
  questionId: string;
  questionText_en: string;
  questionText_my: string;
  correctAnswers: Array<{ text_en: string; text_my: string }>; // studyAnswers
  selfGrade: 'correct' | 'incorrect';
  category: Category;
}

export interface InterviewSession {
  id?: string;
  date: string;
  mode: InterviewMode;
  score: number;
  totalQuestions: number;
  durationSeconds: number;
  passed: boolean;
  endReason: InterviewEndReason;
  results: InterviewResult[];
}
```

### Supabase Table Schema for Interview Sessions
```sql
-- New table: interview_sessions
CREATE TABLE interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  mode TEXT NOT NULL CHECK (mode IN ('realistic', 'practice')),
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL DEFAULT 20,
  duration_seconds INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  end_reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- New table: interview_responses
CREATE TABLE interview_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE NOT NULL,
  question_id TEXT NOT NULL,
  question_en TEXT NOT NULL,
  question_my TEXT NOT NULL,
  category TEXT NOT NULL,
  self_grade TEXT NOT NULL CHECK (self_grade IN ('correct', 'incorrect')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies (follow existing mock_tests pattern)
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interview sessions"
  ON interview_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own interview sessions"
  ON interview_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own interview responses"
  ON interview_responses FOR SELECT
  USING (interview_session_id IN (SELECT id FROM interview_sessions WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own interview responses"
  ON interview_responses FOR INSERT
  WITH CHECK (interview_session_id IN (SELECT id FROM interview_sessions WHERE user_id = auth.uid()));
```

### IndexedDB Store for Interview History (following masteryStore/srsStore pattern)
```typescript
// Source: Following pattern in src/lib/mastery/masteryStore.ts
import { createStore, get, set } from 'idb-keyval';
import type { InterviewSession } from '@/types';

const interviewDb = createStore('civic-prep-interview', 'sessions');
const SESSIONS_KEY = 'interview-sessions';

export async function getInterviewHistory(): Promise<InterviewSession[]> {
  return (await get<InterviewSession[]>(SESSIONS_KEY, interviewDb)) ?? [];
}

export async function saveInterviewSession(session: InterviewSession): Promise<void> {
  const history = await getInterviewHistory();
  history.unshift(session); // Most recent first
  await set(SESSIONS_KEY, history, interviewDb);
}
```

### Navigation Integration
```typescript
// Add to navLinks in AppNavigation.tsx
const navLinks = [
  { href: '/dashboard', label: strings.nav.dashboard },
  { href: '/study', label: strings.nav.studyGuide },
  { href: '/test', label: strings.nav.mockTest },
  { href: '/interview', label: strings.nav.practiceInterview }, // NEW
  { href: '/history', label: strings.nav.testHistory },
];

// Add to AppShell.tsx routes
<Route path="/interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
```

### USCIS Interviewer Greeting Variations
```typescript
export const INTERVIEWER_GREETINGS = [
  "Good morning. I'm going to ask you some questions about U.S. history and government. Please answer to the best of your ability.",
  "Hello. Today I'll be asking you some questions about United States civics. Please listen carefully and answer each question.",
  "Welcome. I'm going to read you some questions about American government and history. Please give your best answer to each one.",
];

export const CLOSING_PASS = [
  "Congratulations. You have successfully completed the civics portion of your interview. Well done.",
  "Great job. You've passed the civics test. You should be very proud of your preparation.",
];

export const CLOSING_FAIL = [
  "Thank you for your effort today. You can retake this test to continue preparing for your interview.",
  "Don't be discouraged. Many people need extra practice. You can try again when you're ready.",
];
```

### Speech Rate Settings (Settings Page Addition)
```typescript
// Add to SettingsPage: speech rate preference
const SPEECH_RATE_KEY = 'civic-prep-speech-rate';

type SpeechRate = 'slow' | 'normal' | 'fast';

const SPEECH_RATE_VALUES: Record<SpeechRate, number> = {
  slow: 0.7,
  normal: 0.98,  // Match existing useSpeechSynthesis default
  fast: 1.3,
};
```

## Claude's Discretion Recommendations

### Voice Selection Strategy
**Recommendation:** Reuse the existing `useSpeechSynthesis.findVoice()` logic which already prioritizes Apple US voices (Samantha, Siri, Ava), Android US voices, and enhanced voices. No custom voice selection UI needed -- the existing logic is well-tested and selects the best available voice automatically. The speech rate setting (slow/normal/fast) is sufficient customization.
**Confidence:** HIGH -- existing implementation already handles this well.

### Inter-Question Transition Timing
**Recommendation:** 1.5 second gap between questions: 0.3s fade-out current question -> 0.5s blank with interviewer silhouette visible -> 0.2s chime -> 0.5s TTS begins. Use motion/react `AnimatePresence` with `mode="wait"` for clean transitions. In realistic mode, this is the gap after self-grading before the next chime. In practice mode, this happens after the user taps "Next Question".
**Confidence:** MEDIUM -- may need tuning during implementation based on feel.

### Practice Mode Quit Behavior
**Recommendation:** Save partial results. When user quits practice mode: (1) show a confirmation dialog (reuse existing `strings.confirm.quitTest` pattern), (2) save answered questions to mastery system via `recordAnswer()`, (3) navigate to a mini-results view showing only answered questions, (4) don't save as a full interview session to Supabase (partial sessions aren't meaningful for trend tracking). This provides value from partial sessions without polluting the trend chart.
**Confidence:** HIGH -- consistent with how practice mode handles partial results elsewhere.

### Incorrect Questions on Results Screen
**Recommendation:** Yes, include expandable explanations for incorrect questions via `WhyButton` on the results screen. The existing `ExplanationCard` component already supports this pattern (used in TestPage results). Only show for questions the user self-graded as incorrect. This provides learning value and is consistent with the existing test results pattern.
**Confidence:** HIGH -- follows existing TestPage results pattern.

### Interviewer Silhouette/Icon Design
**Recommendation:** Use a simple SVG silhouette of a person (head + shoulders) rendered as a 64px circle with a subtle gradient background. Use `motion/react` to pulse the opacity (0.6 -> 1.0 -> 0.6) when TTS is speaking. When idle, show at 0.6 opacity. Use `primary-500` as the accent color for the silhouette outline. This can be a simple inline SVG component, no external assets needed.
**Confidence:** MEDIUM -- visual design is subjective, may need iteration.

### Countdown Animation Style
**Recommendation:** Large centered numbers (3, 2, 1) with scale-in spring animation (scale 2.0 -> 1.0 with bounce). Each number displays for 1 second with a fade transition. After "1", show a brief "Begin" text before the first question. Use the same spring physics from design tokens (`stiffness: 400, damping: 17`). Respect reduced motion preference by showing numbers without animation.
**Confidence:** HIGH -- follows existing animation conventions from design-tokens.ts.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` | `motion/react` | v12.0 | Import from `motion/react`, not `framer-motion`. Project already migrated. |
| `speechSynthesis` blocking | Async voice loading + retry | Ongoing | Existing hook handles this. Must use same pattern. |
| Audio file chimes | Web Audio API OscillatorNode | Current best practice | No audio files needed, fully programmatic |

**Deprecated/outdated:**
- `framer-motion` package name -- now `motion` (project already uses correct import)
- `SpeechRecognition` API -- NOT used here (we use recording, not recognition). Self-grading approach is correct.

## Open Questions

1. **MediaRecorder codec support across browsers**
   - What we know: Chrome supports `audio/webm;codecs=opus`, Safari prefers `audio/mp4`. Firefox supports `audio/ogg;codecs=opus`.
   - What's unclear: Exact codec negotiation when creating MediaRecorder without specifying mimeType.
   - Recommendation: Let MediaRecorder choose default codec (omit mimeType). For playback, use `<audio>` element which handles all formats. Test on Safari since it has the most codec restrictions.

2. **Web Speech API voice availability on low-end Android devices**
   - What we know: Android devices vary widely in available TTS voices. Some have only basic voices.
   - What's unclear: Whether all target devices have at least one local English voice.
   - Recommendation: The existing `useSpeechSynthesis` hook already falls back to any available voice. Add a TTS availability check on the setup screen and show a warning if no voices are found. Degrade to text-only mode if TTS is completely unsupported.

3. **Supabase migration deployment**
   - What we know: New tables (`interview_sessions`, `interview_responses`) need RLS policies.
   - What's unclear: Whether the user manages Supabase migrations manually or through a tool.
   - Recommendation: Provide SQL migration scripts in the plan. Follow the exact RLS pattern used for `mock_tests` and `mock_test_responses`.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/lib/useSpeechSynthesis.ts` -- existing TTS hook with voice selection
- Codebase analysis: `src/pages/TestPage.tsx` -- existing test flow with pass/fail thresholds
- Codebase analysis: `src/pages/PracticePage.tsx` -- state machine pattern (config -> session -> results)
- Codebase analysis: `src/lib/mastery/masteryStore.ts` -- idb-keyval IndexedDB pattern
- Codebase analysis: `src/contexts/SupabaseAuthContext.tsx` -- Supabase save session pattern
- Codebase analysis: `src/components/celebrations/Confetti.tsx` -- celebration patterns
- Codebase analysis: `src/components/srs/AddToDeckButton.tsx` -- compact/full mode component pattern
- Codebase analysis: `src/components/explanations/WhyButton.tsx` -- expandable explanation pattern
- [MDN SpeechSynthesis API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) -- TTS API reference
- [MDN MediaStream Recording API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API) -- Audio recording patterns
- [MDN Visualizations with Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API) -- AnalyserNode waveform patterns
- [MDN SpeechSynthesisUtterance end event](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/end_event) -- onend callback behavior
- Context7: /websites/motion_dev_react -- motion/react animation API (AnimatePresence, variants, springs)

### Secondary (MEDIUM confidence)
- [Cross browser speech synthesis patterns](https://dev.to/jankapunkt/cross-browser-speech-synthesis-the-hard-way-and-the-easy-way-353) -- `onend` reliability issues
- [Audio visualisation with Web Audio API and React](https://www.twilio.com/en-us/blog/audio-visualisation-web-audio-api--react) -- React + canvas waveform pattern

### Tertiary (LOW confidence)
- Web Audio API OscillatorNode chime generation -- pattern based on documented API capabilities, not a specific tutorial. May need tuning of frequency/envelope values for pleasant chime sound.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all native browser APIs, no new dependencies, patterns established in codebase
- Architecture: HIGH -- follows existing PracticePage state machine pattern, extends existing hooks
- Pitfalls: HIGH -- identified from codebase analysis (React Compiler rules), MDN docs (onend unreliability), and browser API documentation (AudioContext gesture requirement)
- Code examples: HIGH -- based on actual codebase patterns and MDN documentation
- Claude's discretion recommendations: MEDIUM -- recommendations based on codebase patterns, may need user validation

**Research date:** 2026-02-07
**Valid until:** 2026-03-07 (30 days -- stable browser APIs, no moving targets)
