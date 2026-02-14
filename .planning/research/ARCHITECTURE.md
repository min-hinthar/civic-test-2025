# Architecture Research: v2.1 Quality & Polish Integration

**Domain:** Bilingual Civics Test Prep PWA -- v2.1 feature integration (language mode, session persistence, TTS improvements, UX overhaul)
**Researched:** 2026-02-13
**Confidence:** HIGH (based on direct codebase analysis of all 59 files consuming useLanguage, all 7 IndexedDB stores, all 3 session page state machines, and the TTS pipeline)

---

## Executive Summary

The v2.1 milestone touches four architectural crosscutting concerns: language visibility semantics, session lifecycle persistence, TTS quality/abstraction, and test/practice/interview UX restructuring. Unlike v2.0 (primarily UI reshuffling), v2.1 changes the **behavioral contract** of LanguageContext -- the most widely consumed context in the app (59 files). This makes the LanguageContext refactor the highest-risk, highest-priority change that must be completed first, since every subsequent feature depends on consistent language visibility semantics.

The session persistence change adds a new IndexedDB store (the 8th) following the well-established `idb-keyval` + `createStore` pattern. The TTS improvements centralize duplicated voice-finding logic into a shared service. The UX overhaul extracts session state machines from monolithic page components into reusable hooks.

**Key principle:** All changes extend existing patterns. No new providers, no new dependencies, no Supabase schema changes, no build config changes.

---

## Current Architecture (As-Built v2.0)

### Provider Hierarchy (AppShell.tsx, line 186-315)

```
ErrorBoundary
  LanguageProvider           <-- mode: bilingual | english-only, showBurmese boolean
    ThemeProvider             <-- dark/light mode
      ToastProvider           <-- bilingual toast notifications
        OfflineProvider       <-- online/offline detection, questions cache, sync queue
          AuthProvider        <-- Supabase auth, test session save, Google SSO
            SocialProvider    <-- social profile, leaderboard, streak sync
              SRSProvider     <-- FSRS deck, due count, add/remove/grade
                StateProvider <-- user's US state, governor/senators/capital
                  Router (BrowserRouter)
                    NavigationProvider  <-- nav lock, tab state
                      NavigationShell   <-- header/sidebar/bottom-tab
                        PageTransition  <-- route transitions
                          Routes        <-- 14 routes
                      PWAOnboardingFlow
                      OnboardingTour
                      GreetingFlow
                      SyncStatusIndicator
```

### IndexedDB Stores (7 total, all via `idb-keyval createStore`)

| Store Name | Object Store | Key Strategy | Data Shape | Used By |
|---|---|---|---|---|
| `civic-prep-questions` | `questions` | Single key `all-questions` | `Question[]` | OfflineContext |
| `civic-prep-sync` | `pending-results` | `pending-{timestamp}-{rand}` | `PendingTestResult` | syncQueue.ts |
| `civic-prep-mastery` | `answer-history` | Single key `answers` | `StoredAnswer[]` | masteryStore.ts |
| `civic-prep-interview` | `sessions` | Single key `interview-sessions` | `InterviewSession[]` | interviewStore.ts |
| `civic-prep-srs` | `cards` | Per-question key `{questionId}` | `SRSCardRecord` | srsStore.ts |
| `civic-prep-srs-sync` | `pending-reviews` | Per-operation key | Sync metadata | srsSync.ts |
| `civic-prep-streaks` | `streak-data` | Single key `streak` | `StreakData` | streakStore.ts |
| `civic-prep-badges` | `badge-data` | `earned-badges` + `shown-badges` | `EarnedBadge[]` | badgeStore.ts |

### Session Page State Machines

**TestPage** (src/pages/TestPage.tsx, 819 lines): Inline state machine with `showPreTest` / `isFinished` booleans. State: `{showPreTest, timeLeft, currentIndex, isFinished, endReason, results, selectedAnswer, showFeedback, explanationExpanded, showAllResults}`. No extractable hook pattern -- all logic is in the page component.

**PracticePage** (src/pages/PracticePage.tsx, 157 lines): Clean 3-phase state machine: `config -> session -> results`. Each phase is a separate child component. State lifted to page level: `{phase, practiceQuestions, practiceResults, timerEnabled, categoryName, categoryColor, previousMastery}`.

**InterviewPage** (src/pages/InterviewPage.tsx, 124 lines): Clean 4-phase state machine: `setup -> countdown -> session -> results`. Each phase is a separate child component. State lifted to page level: `{phase, mode, micPermission, sessionResults, sessionDuration, endReason}`.

### TTS Pipeline (duplicated)

**useSpeechSynthesis** (src/lib/useSpeechSynthesis.ts): General-purpose hook. Voice loading retry loop, voice preference matching (Apple/Android/Enhanced), `speak(text, options)` API, `cancel()`. Returns `{speak, cancel, isSupported}`.

**useInterviewTTS** (src/hooks/useInterviewTTS.ts): Interview-specific hook. Duplicates 100% of voice-loading and voice-finding logic from useSpeechSynthesis. Adds: `onEnd` callbacks, timeout fallback for Chrome/Android `onend` unreliability, speech rate preference from localStorage, `isSpeaking` state. Returns `{speakWithCallback, cancel, isSpeaking, isSupported}`.

**SpeechButton** (src/components/ui/SpeechButton.tsx): Thin wrapper consuming useSpeechSynthesis. Hardcoded to `Samantha` voice preference, `en-US` default.

### Bilingual Component Pattern

All 4 bilingual components consume `useLanguage().showBurmese`:

- **BilingualText**: Conditionally renders `{text.my}` when `showBurmese` is true
- **BilingualHeading**: Same pattern for heading elements
- **BilingualButton**: Same pattern inside motion.button
- **BilingualToast**: Always shows both languages (does NOT check showBurmese -- hardcoded bilingual)

Additionally, **35+ other components** directly call `useLanguage()` and conditionally render Burmese text inline (not via bilingual components). These are the components that will need manual review when language semantics change.

---

## Integration Architecture for v2.1 Features

### 1. LanguageContext Refactor: Mode-Controlled Visibility

#### Current Contract

```typescript
type LanguageMode = 'bilingual' | 'english-only';
interface LanguageContextValue {
  mode: LanguageMode;
  showBurmese: boolean;  // derived: mode === 'bilingual'
  toggleMode: () => void;
  setMode: (mode: LanguageMode) => void;
}
```

#### Proposed New Contract

The context type stays the same -- `showBurmese` already encapsulates visibility. The change is **semantic**: currently `mode` is a global persistent preference. For v2.1, certain pages/contexts should override the mode temporarily:

```typescript
// LanguageContext.tsx -- ADD session-scoped override
type LanguageMode = 'bilingual' | 'english-only';

interface LanguageContextValue {
  mode: LanguageMode;
  showBurmese: boolean;
  toggleMode: () => void;
  setMode: (mode: LanguageMode) => void;
  /** Temporarily override mode for a session (e.g., interview forces english-only) */
  pushOverride: (mode: LanguageMode) => void;
  /** Remove the session override, restore user preference */
  popOverride: () => void;
}
```

#### Why Override Instead of Direct setMode

Interview simulation needs English-only mode during the session but should restore the user's preference when they exit. If we just call `setMode('english-only')` on entering interview and `setMode('bilingual')` on exit, we corrupt the user's actual preference (what if they were already in english-only mode by choice?). The override stack pattern:

```typescript
// Inside LanguageProvider
const [userMode, setUserMode] = useState<LanguageMode>(() => { ... from localStorage });
const [override, setOverride] = useState<LanguageMode | null>(null);

const mode = override ?? userMode;
const showBurmese = mode === 'bilingual';

const pushOverride = useCallback((m: LanguageMode) => setOverride(m), []);
const popOverride = useCallback(() => setOverride(null), []);
```

#### Ripple Effect Analysis

**Zero-change components (35 files):** Any component that only reads `showBurmese` to conditionally render Burmese text will work correctly with no changes. The override transparently changes what `showBurmese` returns.

**Behavioral change components (4 files):**
- `InterviewSession.tsx` -- should call `pushOverride('english-only')` on mount, `popOverride()` on unmount
- `InterviewPage.tsx` -- may want to push override at countdown phase
- `LanguageToggle.tsx` -- should be disabled or hidden during an active override (show visual indicator)
- `LanguageToggleCompact.tsx` -- same

**BilingualToast** (1 file): Currently hardcoded to always show both languages regardless of `showBurmese`. This is correct behavior -- error messages should always be bilingual for comprehension. No change needed.

**Risk:** LOW. The `showBurmese` API surface is unchanged. Only the provider internals change. The override mechanism is additive.

### 2. Session Persistence: New IndexedDB Store

#### Problem

All three session types (test, practice, interview) lose in-progress state on page refresh, navigation, or accidental tab close. The app already has `beforeunload` handlers but these only show browser warnings -- they don't preserve state.

#### Proposed Schema: `civic-prep-sessions` Store

```typescript
// src/lib/session/sessionStore.ts

import { createStore, get, set, del } from 'idb-keyval';

const sessionDb = createStore('civic-prep-sessions', 'active-sessions');

type SessionType = 'test' | 'practice' | 'interview';

interface PersistedSession<T = unknown> {
  /** Discriminator for which page owns this session */
  type: SessionType;
  /** Timestamp when session was started */
  startedAt: string;
  /** Timestamp of last state update */
  updatedAt: string;
  /** The full session state snapshot */
  state: T;
  /** Session-specific config (e.g., practice category, interview mode) */
  config: Record<string, unknown>;
}

// Single active session per type (only one test/practice/interview at a time)
const SESSION_KEY_PREFIX = 'active-';

export async function saveSessionState<T>(
  type: SessionType,
  state: T,
  config: Record<string, unknown>
): Promise<void> {
  const session: PersistedSession<T> = {
    type,
    startedAt: (await getActiveSession(type))?.startedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    state,
    config,
  };
  await set(`${SESSION_KEY_PREFIX}${type}`, session, sessionDb);
}

export async function getActiveSession<T>(
  type: SessionType
): Promise<PersistedSession<T> | undefined> {
  return get<PersistedSession<T>>(`${SESSION_KEY_PREFIX}${type}`, sessionDb);
}

export async function clearSession(type: SessionType): Promise<void> {
  await del(`${SESSION_KEY_PREFIX}${type}`, sessionDb);
}
```

#### What Gets Persisted Per Session Type

**Test Session:**
```typescript
interface PersistedTestState {
  questions: Question[];       // The shuffled question set (stable for resume)
  currentIndex: number;
  results: QuestionResult[];
  timeLeft: number;            // Remaining seconds
  endReason: TestEndReason | null;
  isFinished: boolean;
}
```

**Practice Session:**
```typescript
interface PersistedPracticeState {
  questions: Question[];
  currentIndex: number;
  results: QuestionResult[];
  timeLeft: number;
  timerEnabled: boolean;
}
// Config: { category, count, categoryName, categoryColor }
```

**Interview Session:**
```typescript
interface PersistedInterviewState {
  questions: Question[];
  currentIndex: number;
  results: InterviewResult[];
  correctCount: number;
  incorrectCount: number;
  questionPhase: QuestionPhase;
  startTime: number;
}
// Config: { mode: InterviewMode, micPermission: boolean }
```

#### Write Throttling

Session state changes frequently (every answer, every timer tick for tests). Writing to IndexedDB on every state change is wasteful. Use a debounced write pattern:

```typescript
// useSessionPersistence.ts hook
function useSessionPersistence<T>(
  type: SessionType,
  state: T,
  config: Record<string, unknown>,
  { enabled = true, debounceMs = 2000 }: Options = {}
) {
  // Debounced write: 2s after last state change
  // Immediate write: on beforeunload and visibilitychange='hidden'
  // Clear: when session completes normally
}
```

#### Resume Flow

When a session page mounts, check for an active persisted session:

```
Mount -> getActiveSession(type)
  -> null: Normal fresh start (show config/pre-test)
  -> found:
    -> Check staleness (>24h? discard)
    -> Show "Resume Session?" prompt
    -> User confirms: Hydrate state from snapshot
    -> User declines: clearSession(type), fresh start
```

#### Integration Pattern with Existing Pages

The persistence hook wraps the existing state machine without changing it. Example for PracticePage:

```typescript
// PracticePage.tsx changes (conceptual, not literal code)
const [phase, setPhase] = useState<PracticePhase>(() => {
  const saved = savedSession; // from useSessionPersistence restore
  return saved ? 'session' : 'config';
});

// The persistence hook observes state and auto-saves:
useSessionPersistence('practice', {
  questions: practiceQuestions,
  currentIndex,
  results,
  timeLeft,
  timerEnabled,
}, { category, count }, { enabled: phase === 'session' });
```

### 3. TTS Service Abstraction

#### Problem

`useSpeechSynthesis` and `useInterviewTTS` duplicate 60+ lines of identical voice-loading and voice-finding logic. Any quality improvement (better voice selection, rate control) must be applied in two places.

#### Proposed Architecture: Shared Core + Specialized Hooks

```
src/lib/tts/
  ttsCore.ts          -- Voice loading, voice finding, utterance creation (pure functions)
  ttsVoicePrefs.ts    -- Voice preference storage (localStorage)
  useTTS.ts           -- General-purpose hook (replaces useSpeechSynthesis)
  useInterviewTTS.ts  -- Interview-specific hook (onEnd, timeout, isSpeaking)
```

**ttsCore.ts** (new, extracts shared logic):

```typescript
// Shared constants
export const APPLE_US_VOICES = ['samantha', 'siri', 'ava', 'allison', 'alex', 'victoria', 'karen'];
export const ANDROID_US_VOICES = ['google us english', 'google en-us', 'english united states'];
export const ENHANCED_HINTS = ['enhanced', 'premium'];

// Shared voice-finding (currently duplicated between two hooks)
export function findBestVoice(
  voices: SpeechSynthesisVoice[],
  lang: string,
  preferredVoiceName?: string
): SpeechSynthesisVoice | undefined { ... }

// Voice loading with retry (currently duplicated)
export function createVoiceLoader(
  synth: SpeechSynthesis,
  onVoicesReady: (voices: SpeechSynthesisVoice[]) => void
): { cleanup: () => void } { ... }

// Utterance factory with quality defaults
export function createUtterance(
  text: string,
  voice: SpeechSynthesisVoice | undefined,
  options: { lang?: string; rate?: number; pitch?: number }
): SpeechSynthesisUtterance { ... }

// Duration estimation for timeout fallback
export function estimateSpeechDuration(text: string, rate: number): number { ... }
```

**Impact on existing code:**

- `useSpeechSynthesis.ts` -> `useTTS.ts`: Simplified to ~40 lines (delegates to ttsCore)
- `useInterviewTTS.ts`: Simplified to ~80 lines (callback/timeout logic only, delegates voice management to ttsCore)
- `SpeechButton.tsx`: Import path changes from `@/lib/useSpeechSynthesis` to `@/lib/tts/useTTS`

#### Quality Improvements Enabled by Abstraction

Once voice management is centralized:

1. **Voice quality ranking**: Score voices by naturalness (Neural > Enhanced > Standard) rather than name matching
2. **Rate persistence**: `ttsVoicePrefs.ts` stores user's preferred rate globally (currently only interview has rate control)
3. **Voice caching**: Remember the best voice per language instead of re-searching on every speak call
4. **Burmese TTS readiness**: `findBestVoice('my')` will select Burmese voices when adding Burmese audio support later

### 4. Test/Practice/Interview UX Restructuring

#### Current Problem

TestPage is a single 819-line component with 15+ useState calls, 10+ useEffect calls, and both the active quiz and results view inline. This makes it hard to add features (pause, resume, explanation panel) without the file becoming unmanageable.

#### Proposed Component Architecture

```
src/hooks/
  useTestSession.ts           -- Test state machine hook (extracted from TestPage)
  usePracticeSession.ts       -- Practice state machine hook (extracted from PracticeSession)
  useInterviewSession.ts      -- Interview state machine hook (extracted from InterviewSession)
  useSessionPersistence.ts    -- IndexedDB persistence hook (shared by all three)

src/components/session/       -- NEW shared session UI components
  SessionProgress.tsx         -- Progress bar + question counter + timer
  AnswerGrid.tsx              -- Answer options with 3D chunky buttons
  SessionFeedback.tsx         -- Correct/incorrect feedback + explanation
  SessionHeader.tsx           -- Mode label + navigation lock indicator
  ResumePrompt.tsx            -- "Resume previous session?" dialog

src/pages/
  TestPage.tsx                -- Thinner: delegates to useTestSession + session components
  PracticePage.tsx            -- Already clean, minor extraction
  InterviewPage.tsx           -- Already clean, minor extraction

src/components/test/          -- EXISTING, keep specialized components
  CircularTimer.tsx
  PreTestScreen.tsx
  AnswerFeedback.tsx

src/components/practice/      -- EXISTING, refactor internals
  PracticeConfig.tsx
  PracticeSession.tsx         -- Delegates to usePracticeSession
  PracticeResults.tsx

src/components/interview/     -- EXISTING, refactor internals
  InterviewSetup.tsx
  InterviewSession.tsx        -- Delegates to useInterviewSession
  InterviewResults.tsx
```

#### State Machine Hook Pattern

```typescript
// useTestSession.ts
interface TestSessionState {
  phase: 'pretest' | 'active' | 'finished';
  questions: Question[];
  currentIndex: number;
  results: QuestionResult[];
  timeLeft: number;
  selectedAnswer: Answer | null;
  showFeedback: boolean;
  endReason: TestEndReason | null;
  explanationExpanded: boolean;
}

interface TestSessionActions {
  start: () => void;
  selectAnswer: (answer: Answer) => void;
  advanceToNext: () => void;
  expandExplanation: (expanded: boolean) => void;
}

function useTestSession(): [TestSessionState, TestSessionActions] {
  // All state + effects extracted from TestPage
  // Persistence via useSessionPersistence('test', state, config)
  // Timer countdown effect
  // Navigation lock effect
  // Answer processing + threshold logic
}
```

#### Shared Session Components

The test and practice pages share significant UI:
- Both have `Progress` bar with question counter
- Both have `CircularTimer` (optional in practice)
- Both have 3D chunky answer buttons with identical styling
- Both have `AnswerFeedback` + `WhyButton` inline explanation
- Both have `SpeechButton` pairs for question + answer audio
- Both show correct/incorrect count summary

Extract into shared `SessionProgress`, `AnswerGrid`, and `SessionFeedback` components that accept configuration props:

```typescript
// AnswerGrid.tsx
interface AnswerGridProps {
  answers: Answer[];
  selectedAnswer: Answer | null;
  showFeedback: boolean;
  onSelect: (answer: Answer) => void;
  showBurmese: boolean;
}
```

### 5. Study Guide Flashcard Overhaul

#### Current Architecture

`StudyGuidePage` (huge page) renders flashcards via `FlashcardStack` -> `Flashcard3D`. The flashcard shows question on front, answer on back, with a 3D flip animation. It's embedded in a "Browse" tab alongside a category list.

#### Integration Points for Overhaul

The flashcard system needs:
1. **SRS integration**: "Add to deck" button on each card (already exists via `AddToDeckButton`)
2. **Mastery indicator**: Show per-question accuracy dot (already exists via `QuestionAccuracyDot`)
3. **Audio playback**: SpeechButton on both sides (already exists, needs wiring)

The structure is already componentized. The overhaul is primarily about:
- Making flashcards full-screen swipeable (vs. embedded in category section)
- Adding keyboard shortcuts for flip/next/prev
- Connecting to session persistence for "pick up where you left off"

No new architectural patterns needed -- these are prop/feature additions to existing components.

---

## Data Flow Diagrams

### Language Mode Data Flow (After Refactor)

```
LanguageProvider
  |-- userMode (from localStorage)
  |-- override (from pushOverride/popOverride)
  |-- mode = override ?? userMode
  |-- showBurmese = mode === 'bilingual'
  |
  +-> BilingualText       reads showBurmese -> conditionally renders .my
  +-> BilingualHeading    reads showBurmese -> conditionally renders .my
  +-> BilingualButton     reads showBurmese -> conditionally renders .my
  +-> 35+ inline uses     reads showBurmese -> conditional JSX
  +-> BilingualToast      IGNORES showBurmese (always shows both)
  +-> InterviewSession    calls pushOverride('english-only') on mount
  +-> LanguageToggle      reads mode, disabled when override active
```

### Session Persistence Data Flow

```
TestPage mount
  |-> useSessionPersistence('test')
  |     |-> getActiveSession('test') from IndexedDB
  |     |-> found? -> set resumeData state
  |     +-> auto-save: debounced write on state change
  |
  +-> ResumePrompt (if resumeData exists)
  |     |-> "Resume" -> hydrate state from resumeData
  |     +-> "New Test" -> clearSession('test')
  |
  +-> During session: every state change -> debounced IndexedDB write
  +-> On finish: clearSession('test') + save results normally
  +-> On beforeunload: immediate flush
  +-> On visibilitychange='hidden': immediate flush
```

### TTS Data Flow (After Refactor)

```
ttsCore.ts (shared)
  |-- createVoiceLoader()  -> called by both hooks on mount
  |-- findBestVoice()      -> called on every speak()
  |-- createUtterance()    -> constructs SpeechSynthesisUtterance
  |-- estimateSpeechDuration() -> timeout fallback calculation
  |
  +-> useTTS (general)
  |     |-- speak(text, options)
  |     |-- cancel()
  |     +-- isSupported
  |     +-> consumed by SpeechButton
  |
  +-> useInterviewTTS (specialized)
        |-- speakWithCallback(text, {onEnd, rate})
        |-- cancel()
        |-- isSpeaking
        +-- isSupported
        +-> consumed by InterviewSession
```

---

## Component Inventory: New vs Modified

### New Components/Modules

| Component | Purpose | Complexity |
|---|---|---|
| `src/lib/tts/ttsCore.ts` | Shared TTS voice loading + finding | Low |
| `src/lib/tts/ttsVoicePrefs.ts` | TTS preference storage (rate, voice) | Low |
| `src/lib/session/sessionStore.ts` | IndexedDB store for active sessions | Low |
| `src/hooks/useSessionPersistence.ts` | Debounced session persistence hook | Medium |
| `src/hooks/useTestSession.ts` | Test state machine extraction | High |
| `src/components/session/ResumePrompt.tsx` | Resume dialog UI | Low |
| `src/components/session/AnswerGrid.tsx` | Shared answer button grid | Medium |
| `src/components/session/SessionProgress.tsx` | Shared progress bar + timer | Low |

### Modified Components

| Component | Change | Risk |
|---|---|---|
| `LanguageContext.tsx` | Add override stack (pushOverride/popOverride) | LOW -- additive API |
| `LanguageToggle.tsx` | Disable during override | LOW |
| `InterviewSession.tsx` | Call pushOverride/popOverride | LOW |
| `InterviewPage.tsx` | Minor -- override at countdown phase | LOW |
| `useSpeechSynthesis.ts` -> `useTTS.ts` | Delegate to ttsCore, rename | MEDIUM -- 1 import consumer |
| `useInterviewTTS.ts` | Delegate to ttsCore | MEDIUM -- 1 import consumer |
| `SpeechButton.tsx` | Update import path | LOW |
| `TestPage.tsx` | Extract to useTestSession, use shared components | HIGH -- 819 lines |
| `PracticeSession.tsx` | Add persistence, extract to usePracticeSession | MEDIUM |
| `PracticePage.tsx` | Add resume flow | LOW |
| `InterviewSession.tsx` | Add persistence | MEDIUM |
| `InterviewPage.tsx` | Add resume flow | LOW |

### Untouched Components (Verification)

These 59 files consume `useLanguage()` but only read `showBurmese` for conditional rendering. They require **zero changes** because the override mechanism is transparent:

- All `BilingualText`, `BilingualHeading`, `BilingualButton` uses
- Dashboard, HubPage, SettingsPage, and all hub tab components
- All SRS components (ReviewCard, DeckManager, etc.)
- All social components (BadgeCelebration, Leaderboard, etc.)
- All nudge and progress components

---

## Recommended Build Order

The dependency graph dictates a strict ordering:

```
Phase 1: LanguageContext Override (foundation -- everything depends on this)
  |
  v
Phase 2: TTS Core Extraction (no external dependencies, enables quality work)
  |
  v
Phase 3: Session Persistence Store + Hook (new IndexedDB store, reusable hook)
  |
  v
Phase 4: Test/Practice/Interview State Machine Extraction
  |  (depends on: session persistence hook from Phase 3)
  |
  v
Phase 5: Shared Session UI Components (AnswerGrid, SessionProgress)
  |  (depends on: extracted state machines from Phase 4)
  |
  v
Phase 6: UX Integration + Flashcard Overhaul
  |  (depends on: all above)
  |
  v
Phase 7: Accessibility + Performance Polish
```

**Why this order:**
1. **LanguageContext first**: The override is consumed by interview (Phase 4+). Must be in place before session work begins.
2. **TTS before sessions**: TTS quality improvements affect all sessions. Better to have the clean API before integrating persistence.
3. **Persistence before extraction**: The hook is consumed by the extracted state machines. Must exist first.
4. **Extraction before shared UI**: Shared components need to know the state interface they're consuming.
5. **Integration last**: Wiring everything together is the final step.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Prop-Drilling Language Override
**What:** Passing `forceEnglishOnly` prop through component trees instead of using context override.
**Why bad:** 35+ components already consume `useLanguage()` -- adding a prop bypasses the context and creates inconsistency.
**Instead:** Use the pushOverride/popOverride pattern in LanguageContext. Components continue to read `showBurmese` as before.

### Anti-Pattern 2: localStorage for Session Persistence
**What:** Using localStorage instead of IndexedDB for active session state.
**Why bad:** Session state includes full Question arrays (100+ objects with bilingual strings). localStorage has a 5-10MB limit and is synchronous (blocks main thread for large writes). IndexedDB is async and handles structured data natively.
**Instead:** Use idb-keyval with a dedicated store, matching the existing 7-store pattern.

### Anti-Pattern 3: Persisting Derived State
**What:** Storing `correctCount`, `incorrectCount`, `progressPercent` in IndexedDB alongside `results`.
**Why bad:** These are derivable from `results` array. Storing them creates potential inconsistency and larger payloads.
**Instead:** Only persist source-of-truth state. Recompute derived values on restore.

### Anti-Pattern 4: Inline TTS Improvements
**What:** Improving voice quality by modifying useInterviewTTS directly without extracting shared logic first.
**Why bad:** Improvements won't apply to SpeechButton usage. Future changes must be applied in two places.
**Instead:** Extract ttsCore.ts first, then improve once.

### Anti-Pattern 5: Big-Bang TestPage Rewrite
**What:** Rewriting TestPage from scratch with new architecture in a single commit.
**Why bad:** TestPage is 819 lines with subtle timing logic (feedback delays, auto-advance pausing, explanation expansion). A big-bang rewrite risks regressions in USCIS threshold logic (12 correct / 9 incorrect).
**Instead:** Extract incrementally: (1) state machine hook, (2) answer grid component, (3) results view component, (4) wire persistence. Each step is independently testable.

---

## Scalability Considerations

| Concern | Current (v2.0) | After v2.1 |
|---|---|---|
| IndexedDB stores | 7 (8 with badges) | 8 (9 with sessions) -- well within browser limits |
| Context providers | 8 | 8 (no new providers) |
| LanguageContext rerenders | Mode changes rerender 59 consumers | Same -- override changes are rare (session boundaries only) |
| Session persistence writes | N/A | Debounced to 2s intervals + flush on visibility change |
| TTS voice loading | 2 parallel retry loops (duplicated) | 1 shared voice loader (deduped) |
| TestPage component size | 819 lines (1 file) | ~200 lines page + ~300 lines hook + ~100 lines each shared component |

---

## Sources

- Direct codebase analysis of all source files referenced above
- Existing v2.0 architecture research at `.planning/research/ARCHITECTURE.md` (2026-02-09)
- React documentation: Context override patterns (verified via training data, standard React pattern)
- idb-keyval documentation: createStore API (verified via existing codebase usage in 7 stores)
- Web Speech API: SpeechSynthesisUtterance events (verified via existing useInterviewTTS implementation)
