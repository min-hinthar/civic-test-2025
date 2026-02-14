# Phase 20: Session Persistence - Research

**Researched:** 2026-02-14
**Domain:** IndexedDB session state persistence, resume UX, countdown animations, dashboard indicators
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Resume Prompt UX:**
- Modal dialog -- centered overlay, non-dismissible (no backdrop close). Must choose Resume, Start Fresh, or Not Now
- Detailed info -- session type + progress (Q8/20) + score so far (6/8) + time remaining (if timed) + relative timestamp ("2 hours ago")
- Three actions: Resume, Start Fresh, Not Now
  - Resume: brief loading animation (~0.5-1s) before session restores
  - Start Fresh: requires confirmation before discarding ("Are you sure? Your progress will be lost.")
  - Not Now: dismisses modal, keeps session saved. Modal re-appears every visit to the relevant page
- Trigger: modal shows when user navigates to the test/practice/interview page that has saved sessions (not on any app launch)
- Multiple sessions: if multiple saved sessions exist, show all as stacked cards inside the same modal (dashboard-style card layout)
- Bilingual: modal text follows language mode (Myanmar mode shows Burmese)
- Keyboard support: full keyboard nav with focus trap inside modal. Auto-focus the Resume button so Enter resumes immediately
- Animation: animated entrance (slide-up or scale-in)
- Friendly tone: title like "Welcome back!" or "Pick up where you left off"
- Visual distinction: different icon and accent color per session type (mock test vs practice vs interview)
- Card style: match existing dashboard card design (rounded corners, subtle shadow, icon left)

**Session Capture Scope:**
- All three session types: Mock Test, Practice, and Interview sessions are all persisted
- 24-hour expiry: all session types expire after 24 hours (uniform rule)
- Auto-clean on complete: once a session is submitted/scored, saved state is immediately deleted from IndexedDB
- IndexedDB only: local device storage, no Supabase cloud sync
- Save frequency: Claude's discretion (on every answer recommended for safety)

**Countdown & Timer Behavior:**
- Fresh timer on resume: timer resets to full duration when resuming a timed session (generous -- user gets full time back)
- All timed sessions: countdown appears for every timed mock test start, not just resumed ones
- Fixed at 5 seconds: always 5-4-3-2-1-Go!
- Full-screen overlay: large centered number with circular progress ring + scale/fade animation on each number
- Extra large + bold number styling -- oversized, impactful (sports countdown feel)
- Circular ring: accent/contrast color (not primary blue). Ring depletes as each second passes
- Tick sound on every number: subtle tick audio on 5, 4, 3, 2, 1. Different "start" chime on "Go!"
- "Go!" message: brief (~0.5s) "Go!" text after "1", bilingual (follows language mode)
- Context subtitle: show session info underneath number ("Mock Test -- Q8/20" for resumed, "Mock Test -- 10 Questions" for new)
- Skip button: "Tap to start" appears after 1-2 second delay. Allows users to bypass the countdown
- Reduced motion: respects `prefers-reduced-motion` -- simplified animations (just numbers, no scale/ring)

**Dashboard Indicator:**
- Banner card at top of dashboard: amber/orange accent color + clock/pause icon. Shows "Unfinished Mock Test -- 2 hours ago"
- Minimal teaser: just session type + relative timestamp. Full details in the resume modal
- Show all sessions: if multiple unfinished sessions exist, show one banner card per session (stacked)
- Dismissible: small X button to hide. Banner returns on next dashboard visit (not permanently dismissed)
- Tapping navigates: banner tap navigates to the relevant test/practice page where the resume modal shows (not direct resume)
- Bilingual: banner text follows language mode
- Entrance animation: slide-in when dashboard loads
- Dismiss animation: slide-out or fade when X is tapped
- Nav badge: number badge on relevant nav items showing count of saved sessions
- Light haptic feedback: subtle vibration on mobile when tapping the banner Resume area

### Claude's Discretion

**Resume UX:**
- Card preview content (question snippet vs metadata only)
- Start Fresh confirmation style (inline swap vs sub-dialog)

**Capture Scope:**
- Exact state captured per session type (question index, answers, timer, shuffle order, filters)
- Interview state capture depth (question progress vs full transcript)
- Maximum concurrent session limit
- Practice session filter preservation on resume

**Countdown:**
- Overlay background style (blurred backdrop vs solid)
- Number and ring color
- Keyboard skip interaction (Space/Enter vs any key)
- Performance fallback for low-end devices

**Dashboard:**
- Banner card position relative to NBA card and other dashboard content
- NBA card integration (whether "Resume session" becomes a suggested next best action)
- Nav badge placement (per-item or combined)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

## Summary

Phase 20 adds session persistence so users never lose progress when they close the browser mid-session. The implementation spans four distinct areas: (1) a new IndexedDB store for session snapshots, (2) resume prompt modals on test/practice/interview pages, (3) a full-screen countdown overlay for timed sessions, and (4) dashboard banner cards plus nav badges showing unfinished sessions.

The existing codebase provides strong foundations: `idb-keyval` (v6.2.2) with `createStore` is already used for offline data in `src/lib/pwa/offlineDb.ts`, `@radix-ui/react-dialog` (v1.1.15) powers all modals, `motion` (v12.33.0) handles all animations, and the Web Audio API pattern in `soundEffects.ts` covers countdown tick sounds. No new dependencies are needed.

The primary challenge is capturing and restoring the right session state for three different session types, each with distinct state shapes (mock test has timer+shuffled questions+results; practice has config+category+questions+results; interview has mode+shuffled questions+results+correctCount+questionPhase). The existing components manage state locally via `useState`, so the persistence layer must save/restore these states without introducing a new context provider -- a hook-based approach that reads from IndexedDB on mount is the cleanest pattern.

**Primary recommendation:** Use a single new `idb-keyval` store (`civic-prep-sessions`) with typed session snapshot objects, a shared `useSessionPersistence` hook for save/load/expiry logic, and page-level integration that checks for saved sessions on mount and shows the resume modal.

## Standard Stack

### Core (Already Installed -- No New Dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `idb-keyval` | 6.2.2 | IndexedDB key-value storage for session snapshots | Already used for offline storage; `createStore` pattern is project-standard |
| `@radix-ui/react-dialog` | 1.1.15 | Accessible modal for resume prompt | Already used for all modals; supports `onInteractOutside`/`onEscapeKeyDown` for non-dismissible behavior |
| `motion` (motion/react) | 12.33.0 | Countdown animation, modal entrance, banner slide-in/out | Already used for all animations project-wide |
| Web Audio API (AudioContext) | Browser native | Countdown tick sounds | Pattern established in `soundEffects.ts` and `audioChime.ts` |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | installed | Icons (Clock, Pause, Play, AlertTriangle) | Dashboard banner icons, resume modal session type icons |
| `clsx` | installed | Conditional class composition | All component styling |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `idb-keyval` store | `localStorage` | localStorage is synchronous and has 5MB limit; session data could be large with question arrays. IndexedDB is the established pattern |
| New context provider | Hook + IndexedDB | A context would re-render the whole provider tree on save; hooks keep scope tight to the pages that need it |
| `date-fns` for relative time | Hand-rolled `timeAgo()` | No date libraries installed; a simple relative-time function (< 1 min ago, X min ago, X hours ago, yesterday) is ~20 lines |

**Installation:**
```bash
# No new packages needed -- all dependencies already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   └── sessions/
│       ├── sessionStore.ts         # IndexedDB CRUD for session snapshots
│       ├── sessionTypes.ts         # TypeScript types for all session shapes
│       └── useSessionPersistence.ts # Hook: save/load/expire/delete
├── components/
│   └── sessions/
│       ├── ResumePromptModal.tsx    # Non-dismissible modal with session cards
│       ├── ResumeSessionCard.tsx    # Individual session card inside modal
│       ├── StartFreshConfirm.tsx    # Confirmation sub-dialog/inline for discard
│       ├── SessionCountdown.tsx     # Full-screen 5-4-3-2-1-Go overlay
│       └── UnfinishedBanner.tsx     # Dashboard amber banner card
```

### Pattern 1: Session Snapshot Types
**What:** Strongly-typed session snapshot interfaces for each session type, plus a discriminated union.
**When to use:** All session persistence operations.
**Example:**
```typescript
// src/lib/sessions/sessionTypes.ts

interface BaseSessionSnapshot {
  id: string;                     // Unique ID (e.g. 'session-{timestamp}-{random}')
  type: 'mock-test' | 'practice' | 'interview';
  savedAt: string;                // ISO timestamp
  version: number;                // Schema version for migration safety
}

interface MockTestSnapshot extends BaseSessionSnapshot {
  type: 'mock-test';
  questions: Question[];          // The shuffled 20 questions (with shuffled answers)
  results: QuestionResult[];      // Answers so far
  currentIndex: number;           // Question user was on
  timeLeft: number;               // Seconds remaining
}

interface PracticeSnapshot extends BaseSessionSnapshot {
  type: 'practice';
  questions: Question[];          // Selected + shuffled practice questions
  results: QuestionResult[];
  currentIndex: number;
  timerEnabled: boolean;
  timeLeft: number;
  config: {                       // Preserve config for display
    category: string;
    categoryName: { en: string; my: string };
    count: number;
  };
}

interface InterviewSnapshot extends BaseSessionSnapshot {
  type: 'interview';
  questions: Question[];          // The shuffled 20 questions
  results: InterviewResult[];
  currentIndex: number;
  correctCount: number;
  incorrectCount: number;
  mode: InterviewMode;
  startTime: number;              // Date.now() when session started
}

type SessionSnapshot = MockTestSnapshot | PracticeSnapshot | InterviewSnapshot;
```

### Pattern 2: IndexedDB Session Store
**What:** New idb-keyval store with typed CRUD operations and 24-hour expiry.
**When to use:** All read/write operations for session snapshots.
**Example:**
```typescript
// src/lib/sessions/sessionStore.ts
import { createStore, get, set, del, keys } from 'idb-keyval';

export const sessionStore = createStore('civic-prep-sessions', 'active-sessions');

const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_VERSION = 1;

export async function saveSession(snapshot: SessionSnapshot): Promise<void> {
  await set(snapshot.id, { ...snapshot, version: SESSION_VERSION }, sessionStore);
}

export async function getSessionsByType(
  type: SessionSnapshot['type']
): Promise<SessionSnapshot[]> {
  const allKeys = await keys(sessionStore);
  const sessions: SessionSnapshot[] = [];
  const now = Date.now();

  for (const key of allKeys) {
    const snap = await get<SessionSnapshot>(key, sessionStore);
    if (!snap) continue;

    // Version mismatch -- discard
    if (snap.version !== SESSION_VERSION) {
      await del(key, sessionStore);
      continue;
    }

    // Expired -- discard
    if (now - new Date(snap.savedAt).getTime() > SESSION_EXPIRY_MS) {
      await del(key, sessionStore);
      continue;
    }

    if (snap.type === type) sessions.push(snap);
  }
  return sessions;
}

export async function getAllSessions(): Promise<SessionSnapshot[]> {
  // Same pattern as getSessionsByType but without type filter
  // Used by dashboard banner and nav badges
}

export async function deleteSession(id: string): Promise<void> {
  await del(id, sessionStore);
}

export async function cleanExpiredSessions(): Promise<void> {
  // Run on app startup -- iterate all keys, delete expired
}
```

### Pattern 3: Non-Dismissible Modal via Radix Dialog
**What:** Prevent backdrop click and Escape key from closing the resume modal.
**When to use:** The resume prompt must force user to choose Resume, Start Fresh, or Not Now.
**Example:**
```typescript
// In ResumePromptModal.tsx
<DialogPrimitive.Content
  onInteractOutside={(e) => e.preventDefault()}
  onEscapeKeyDown={(e) => e.preventDefault()}
>
  {/* No DialogClose X button */}
  {/* Three explicit action buttons only */}
</DialogPrimitive.Content>
```
**Note:** The existing `Dialog.tsx` wrapper passes `...props` to `DialogPrimitive.Content`, so `onInteractOutside` and `onEscapeKeyDown` can be passed through. However, the wrapper also conditionally renders a close button via `showCloseButton` (already supports `showCloseButton={false}`). The wrapper needs the `onInteractOutside` and `onEscapeKeyDown` props forwarded -- verify the existing `DialogContent` forwardRef passes these through its spread `{...props}`.

### Pattern 4: Session Save on Every Answer
**What:** Save session snapshot to IndexedDB after each answer to minimize data loss.
**When to use:** Inside `handleAnswerSelect` / `processResult` callbacks in test/practice/interview.
**Example:**
```typescript
// Fire-and-forget save after each answer (async, non-blocking)
const saveCurrentSession = useCallback(async () => {
  const snapshot: MockTestSnapshot = {
    id: sessionId,
    type: 'mock-test',
    savedAt: new Date().toISOString(),
    version: 1,
    questions,
    results: [...results, pendingResult],
    currentIndex: currentIndex + 1,
    timeLeft,
  };
  await saveSession(snapshot);
}, [sessionId, questions, results, currentIndex, timeLeft]);
```

### Pattern 5: Countdown with Circular Progress Ring
**What:** Full-screen overlay with large number, circular SVG ring, tick sounds, and skip button.
**When to use:** Before every timed mock test start (new or resumed) and before resumed practice sessions with timer.
**Example:**
```typescript
// SessionCountdown.tsx -- key state
const [step, setStep] = useState(5);       // 5, 4, 3, 2, 1, 0 (Go!)
const [showSkip, setShowSkip] = useState(false);

// Show skip after 1.5s delay
useEffect(() => {
  const timer = setTimeout(() => setShowSkip(true), 1500);
  return () => clearTimeout(timer);
}, []);

// Circular ring: SVG circle with strokeDasharray animation
// Ring circumference depletes as fraction of 1-second per step
// Tick sound: playNote(ctx, 800, 0, 0.08, 0.15) for numbers
// Start chime: playNote(ctx, 523, 0, 0.15, 0.25) + playNote(ctx, 784, 0.1, 0.2, 0.25) for "Go!"
```

### Pattern 6: Dashboard Banner Card
**What:** Amber-tinted card at top of dashboard showing unfinished session count.
**When to use:** When `getAllSessions()` returns non-empty results.
**Example:**
```typescript
// UnfinishedBanner.tsx -- matches NBAHeroCard card pattern
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, x: -100 }}
>
  <GlassCard tier="light" className="border-amber-500/30 bg-warning-subtle/20">
    <Clock className="text-warning" />
    <span>Unfinished Mock Test -- 2 hours ago</span>
    <button onClick={dismiss}><X /></button>
  </GlassCard>
</motion.div>
```

### Pattern 7: Relative Time Formatting (No Dependencies)
**What:** Simple utility function for "X minutes ago", "X hours ago" relative timestamps.
**When to use:** Session cards in resume modal and dashboard banner.
**Example:**
```typescript
// src/lib/sessions/timeAgo.ts
export function timeAgo(isoDate: string): { en: string; my: string } {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return { en: 'just now', my: 'ယခုလေးတင်' };
  if (mins < 60) return { en: `${mins} min ago`, my: `${mins} မိနစ်အကြာ` };
  const hours = Math.floor(mins / 60);
  if (hours < 24) return { en: `${hours} hour${hours > 1 ? 's' : ''} ago`, my: `${hours} နာရီအကြာ` };
  return { en: 'yesterday', my: 'မနေ့က' };
}
```

### Anti-Patterns to Avoid
- **New context provider for sessions:** Adding a 9th context provider to the tree would cause unnecessary re-renders. Session persistence is page-specific -- use hooks that read from IndexedDB on mount.
- **Saving full Question objects to localStorage:** Question arrays with explanations can be large (100KB+). Use IndexedDB (already the established pattern via idb-keyval).
- **setState in effect for session load:** The React Compiler ESLint rules forbid `setState` directly in effect bodies. Use the lazy `useState(() => ...)` pattern for initial session check, or `useMemo` for derived state.
- **Timer synchronization across tabs:** The decision specifies local-only, no cross-device. Don't add BroadcastChannel or SharedWorker complexity.
- **Storing timer elapsed time:** The decision says "fresh timer on resume" -- so only store whether timer was enabled, not the elapsed time. On resume, reset timer to full duration.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IndexedDB access | Raw IndexedDB API | `idb-keyval` `createStore` + `get/set/del/keys` | Already in project, handles promise wrapping, store isolation, and upgrade events |
| Modal accessibility | Custom overlay + focus trap | `@radix-ui/react-dialog` with `onInteractOutside` | Built-in focus trapping, keyboard nav, aria attributes, portal rendering |
| Animation springs | Manual CSS transitions | `motion/react` spring configs from `motion-config.ts` | Existing SPRING_BOUNCY/SNAPPY/GENTLE presets match project visual language |
| Audio synthesis | `<audio>` element with MP3 files | Web Audio API `AudioContext` + `OscillatorNode` | Existing pattern in `soundEffects.ts` and `audioChime.ts`; zero asset overhead |
| Reduced motion | Manual media query | `useReducedMotion()` hook from `hooks/useReducedMotion.ts` | Already wraps Motion's hook, used consistently across all animated components |
| Haptic feedback | Custom vibration logic | `navigator.vibrate(10)` with try/catch | Pattern already exists in `FlagToggle.tsx`; progressive enhancement with silent failure |

**Key insight:** Every technology needed for this phase is already installed and patterned in the codebase. The implementation is pure feature work -- no infrastructure setup, no new dependencies.

## Common Pitfalls

### Pitfall 1: Stale Question References After Codebase Updates
**What goes wrong:** Session snapshot stores Question objects with IDs. If questions are added/removed/reordered between versions, a restored session could reference stale data.
**Why it happens:** The shuffled question array is captured at session start time. If the app updates between save and restore, the questions set may have changed.
**How to avoid:** Store the `version` field in snapshots. On restore, compare snapshot version against current app version. If mismatched, silently discard the session rather than showing corrupted data. The 24-hour expiry also limits exposure.
**Warning signs:** Restored session shows blank questions or wrong answer mappings.

### Pitfall 2: React Compiler ESLint Violations
**What goes wrong:** `setState()` called directly in effect body, or ref `.current` accessed during render.
**Why it happens:** Loading session data from IndexedDB and setting state in a `useEffect` triggers `react-hooks/set-state-in-effect`.
**How to avoid:** Use the pattern from existing components: `useState(() => initialValue)` for synchronous initial state, and for async IndexedDB loads, use a loading state pattern where the effect sets a derived value through a callback that the compiler accepts. Alternatively, use the "flag + re-render" pattern where the effect sets a single loading boolean.
**Warning signs:** ESLint errors on `setState` in effect bodies.

### Pitfall 3: Multiple Concurrent Saves Racing
**What goes wrong:** Rapid answer selections trigger multiple `saveSession()` calls that race, potentially overwriting newer state with older state.
**Why it happens:** `saveSession` is async (IndexedDB). If two saves are in flight, the second one's `get` might return data from before the first `set` completes.
**How to avoid:** Use a single session ID per session lifecycle. Each `saveSession` writes the full snapshot (not a patch), so the last write wins. Since saves happen sequentially (one answer at a time), this is safe as long as the save includes all accumulated results up to that point.
**Warning signs:** Restored session is missing the last 1-2 answers.

### Pitfall 4: Session Store Never Cleaned
**What goes wrong:** Abandoned sessions accumulate in IndexedDB, consuming storage. Over months, hundreds of stale snapshots pile up.
**Why it happens:** User navigates away, never returns to the page that would trigger the resume modal.
**How to avoid:** Run `cleanExpiredSessions()` on app startup (in AppShell or a lazy effect). The 24-hour expiry ensures sessions are cleaned within a day. Also clean on successful session completion.
**Warning signs:** IndexedDB storage growing over time in DevTools.

### Pitfall 5: Countdown Audio Not Playing on First Visit
**What goes wrong:** AudioContext requires user gesture to start. If the countdown auto-plays without prior user interaction, tick sounds are silent.
**Why it happens:** Browser autoplay policy blocks `AudioContext.resume()` without a user gesture.
**How to avoid:** The countdown is always preceded by a user action (clicking "I'm Ready" or "Resume" button), which counts as a user gesture. Ensure the AudioContext is created/resumed in the click handler, not in a passive effect. The existing `soundEffects.ts` pattern already handles this correctly.
**Warning signs:** Sounds work on subsequent visits but not on first page load.

### Pitfall 6: Non-Serializable State in Snapshots
**What goes wrong:** Saving React refs, DOM elements, functions, or circular objects to IndexedDB fails silently or corrupts data.
**Why it happens:** The session snapshot must only contain plain serializable data (JSON-compatible).
**How to avoid:** Define explicit TypeScript interfaces for snapshots. Only store primitives, arrays, and plain objects. Never store `ref.current`, component instances, or callback functions. The Question/QuestionResult types are already plain objects, so they serialize cleanly.
**Warning signs:** `set()` call throws or snapshot comes back as `undefined`.

### Pitfall 7: Flashcard Sort Session (SESS-03) Complexity
**What goes wrong:** The requirements list "flashcard sort session" (SESS-03) but the StudyGuidePage's FlashcardStack is a lightweight browse-mode UI (swipe through cards), not a scored session with progress to lose. The SRS ReviewSession is closer but uses the SRSContext which already persists deck state to IndexedDB.
**Why it happens:** SESS-03 may refer to the SRS ReviewSession (study#review tab), which has a setup phase, active card review, and rating flow. However, SRS card state is already persisted via `SRSContext` -- only the in-flight review session (which cards are being reviewed, current position) could be lost.
**How to avoid:** For SESS-03, persist the SRS ReviewSession's in-progress state: the cards selected for review, current card index, and ratings given so far. On resume, skip the SessionSetup phase and jump directly into the review with the saved card set.
**Warning signs:** User closes browser mid-SRS-review and loses position in their review queue.

## Code Examples

### Creating a New idb-keyval Store (Verified Pattern from offlineDb.ts)
```typescript
// Source: src/lib/pwa/offlineDb.ts (existing project pattern)
import { createStore, get, set, del, keys } from 'idb-keyval';

// Each store gets its own IndexedDB database + object store
export const sessionStore = createStore('civic-prep-sessions', 'active-sessions');

// CRUD operations pass the store as the last argument
await set('session-123', snapshotData, sessionStore);
const snap = await get<SessionSnapshot>('session-123', sessionStore);
await del('session-123', sessionStore);
const allKeys = await keys(sessionStore);
```

### Non-Dismissible Modal with Radix Dialog (Verified from Dialog.tsx)
```typescript
// Source: src/components/ui/Dialog.tsx (existing project pattern, extended)
// The existing DialogContent forwardRef spreads {...props} onto DialogPrimitive.Content
// which means onInteractOutside and onEscapeKeyDown can be passed through

<Dialog open={hasUnfinishedSession} onOpenChange={() => { /* no-op: force action */ }}>
  <DialogContent
    showCloseButton={false}
    onInteractOutside={(e) => e.preventDefault()}
    onEscapeKeyDown={(e) => e.preventDefault()}
  >
    <DialogTitle>Welcome back!</DialogTitle>
    {/* Session cards */}
    {/* Action buttons: Resume | Start Fresh | Not Now */}
  </DialogContent>
</Dialog>
```

### Sound Effect for Countdown Tick (Verified from soundEffects.ts)
```typescript
// Source: src/lib/audio/soundEffects.ts (existing pattern)
export function playCountdownTick(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    // Short click/tick at 800 Hz, 80ms duration
    playNote(ctx, 800, 0, 0.08, 0.15, 'sine');
  } catch {
    // Silently ignore
  }
}

export function playCountdownGo(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    // Ascending two-note "go" chime
    playNote(ctx, 523, 0, 0.15, 0.25);    // C5
    playNote(ctx, 784, 0.1, 0.2, 0.25);   // G5
  } catch {
    // Silently ignore
  }
}
```

### Haptic Feedback (Verified from FlagToggle.tsx)
```typescript
// Source: src/components/ui/FlagToggle.tsx (existing pattern)
try {
  navigator.vibrate?.(10); // 10ms subtle pulse
} catch {
  // Vibration API not supported -- progressive enhancement
}
```

### Circular Progress Ring SVG (New but follows existing patterns)
```typescript
// SVG circle for countdown ring animation
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

<svg viewBox="0 0 120 120" className="h-40 w-40">
  {/* Background ring */}
  <circle cx="60" cy="60" r={RADIUS} fill="none"
    stroke="hsl(var(--border))" strokeWidth="6" />
  {/* Progress ring -- depletes per second */}
  <motion.circle cx="60" cy="60" r={RADIUS} fill="none"
    stroke="hsl(var(--accent))" strokeWidth="6"
    strokeLinecap="round"
    strokeDasharray={CIRCUMFERENCE}
    strokeDashoffset={CIRCUMFERENCE * progress}
    transform="rotate(-90 60 60)"
  />
</svg>
```

## Discretion Recommendations

### Card Preview Content
**Recommendation: Metadata only, no question snippet.**
Rationale: Showing a question snippet in the resume card reveals the answer context, which could bias the user. Metadata (session type + progress Q8/20 + score 6/8 + time remaining + relative timestamp) provides enough context to decide whether to resume. This also keeps the card compact when multiple sessions are stacked.

### Start Fresh Confirmation Style
**Recommendation: Inline swap within the same modal.**
Rationale: A sub-dialog (modal-on-modal) is visually jarring and breaks the flow. Instead, replace the three action buttons with a confirmation message and two buttons (Discard / Cancel) inline. Use `AnimatePresence` with a crossfade transition. The cancel returns to the original three-button state.

### Exact State Captured Per Session Type

**Mock Test:**
- `questions: Question[]` -- the shuffled 20-question set with shuffled answers
- `results: QuestionResult[]` -- answers given so far
- `currentIndex: number` -- which question user was on
- `timeLeft: number` -- seconds remaining (for display only; timer resets on resume)

**Practice:**
- `questions: Question[]` -- selected + shuffled questions
- `results: QuestionResult[]` -- answers given so far
- `currentIndex: number`
- `timerEnabled: boolean`
- `timeLeft: number` -- for display only
- `config: { category, categoryName, count }` -- to show what they were practicing

**Interview:**
- `questions: Question[]` -- shuffled question set
- `results: InterviewResult[]` -- graded results so far
- `currentIndex: number`
- `correctCount: number`
- `incorrectCount: number`
- `mode: InterviewMode` -- 'realistic' or 'practice'
- `startTime: number` -- original session start (for duration calculation)

### Interview State Capture Depth
**Recommendation: Question progress only, not full transcript.**
Rationale: Audio recordings (from `useAudioRecorder`) are large blobs that shouldn't go into IndexedDB. The interview session only needs the question index, self-grade results, and mode. The `questionPhase` state machine should reset to 'chime' for the next ungraded question on resume (don't try to restore mid-question states like 'reading' or 'grading').

### Maximum Concurrent Session Limit
**Recommendation: 1 per session type (3 total max).**
Rationale: A user can only have one active mock test, one active practice session, and one active interview at a time. When starting a new session of the same type, the old snapshot is overwritten. This prevents stale session accumulation and simplifies the resume UI.

### Practice Session Filter Preservation on Resume
**Recommendation: Preserve the category and count config.**
Rationale: Store the `PracticeConfigType` in the snapshot. On resume, skip the PracticeConfig screen and jump directly into PracticeSession with the saved questions. Display the category name in the resume card ("Practice: System of Government -- Q5/10").

### Countdown Overlay Background
**Recommendation: Blurred backdrop (matches existing InterviewCountdown pattern).**
The existing `InterviewCountdown.tsx` uses `bg-background/90 backdrop-blur-sm`. Use the same approach but with a slightly darker overlay for dramatic effect: `bg-background/95 backdrop-blur-md`.

### Number and Ring Color
**Recommendation: Use accent/orange color (`--color-accent: var(--orange-400)`) for the ring and number.**
Rationale: The decision says "not primary blue" for the ring. Orange/accent provides energy and contrast in both light and dark modes. The number text can use `text-foreground` for maximum readability with the accent-colored ring.

### Keyboard Skip Interaction
**Recommendation: Space or Enter to skip countdown.**
Rationale: Both are standard "activate" keys for buttons. The skip button text says "Tap to start" but keyboard users should be able to press Space/Enter. Focus auto-lands on the skip button when it appears (after 1.5s delay).

### Banner Card Position
**Recommendation: Above NBA card, as the very first element in the StaggeredList.**
Rationale: Unfinished sessions are more urgent than the NBA recommendation. The amber color visually distinguishes it from the NBA card. If multiple banners exist, they stack above the NBA card.

### NBA Card Integration
**Recommendation: Do NOT integrate with NBA. Keep them separate.**
Rationale: The NBA system (`determineNBA.ts`) has a complex priority-based state machine. Adding session resumption as an NBA action type would require modifying the existing state types and logic, which is out of scope. The banner card serves the same purpose with simpler implementation.

### Nav Badge Placement
**Recommendation: Per-item badge on the relevant nav tab (test, interview).**
Rationale: The existing `navConfig.ts` `NavBadges` interface and `useNavBadges()` hook already support per-tab badges via `badgeKey`. Add new badge keys for test/interview session counts. Practice sessions don't have their own nav tab (practice is accessed from within study/test), so a practice badge could go on the test tab or be omitted.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| localStorage for session state | IndexedDB via idb-keyval | Project pattern since v1.0 | Larger data capacity, async API, separate stores |
| Nonce-based CSP | Hash-based CSP | Phase 13 | No impact on IndexedDB -- same-origin storage |
| useRef for render values | useState with lazy init | React Compiler migration | Must use `useState(() => ...)` for session ID generation |

**Deprecated/outdated:**
- None relevant to this phase. All dependencies are current.

## Open Questions

1. **SESS-03 "Flashcard Sort Session" Definition**
   - What we know: The requirements list SESS-03 as "User can resume interrupted flashcard sort session." The StudyGuidePage has three tabs: Browse (flashcard stack), Deck (SRS management), and Review (SRS session). The "flashcard sort" likely refers to the SRS ReviewSession.
   - What's unclear: Is there a "sort" mechanism in the flashcard UI beyond the SRS review flow? The FlashcardStack is a passive browse UI with no grading or scoring -- it just shows cards sequentially.
   - Recommendation: Implement SESS-03 as SRS ReviewSession persistence. If the user closes mid-SRS-review, save the remaining card queue and current position. This is the only study-tab flow that has meaningful "progress to lose." The passive FlashcardStack browse does not need persistence (no state to lose beyond the current card index, which resets to 0 anyway).

2. **Nav Badge Infrastructure for Test/Interview**
   - What we know: The `NavBadges` interface currently has 3 keys: `studyDueCount`, `hubHasUpdate`, `settingsHasUpdate`. Adding session count badges requires extending this interface.
   - What's unclear: Should the badge show a number (count of sessions) or just a dot (boolean)? The existing `studyDueCount` is a number; the others are booleans.
   - Recommendation: Use a number badge (consistent with `studyDueCount`). Show the count of unfinished sessions per tab. This requires extending `NavBadges` and `useNavBadges()`.

## Sources

### Primary (HIGH confidence)
- `src/lib/pwa/offlineDb.ts` -- Existing idb-keyval usage pattern (createStore, get/set/del/keys)
- `src/components/ui/Dialog.tsx` -- Existing Radix Dialog wrapper (forwardRef, spread props, showCloseButton)
- `src/lib/audio/soundEffects.ts` -- Web Audio API pattern (playNote, getContext, isSoundMuted)
- `src/components/interview/InterviewCountdown.tsx` -- Existing countdown pattern (3-2-1-Begin)
- `src/pages/TestPage.tsx` -- Mock test state shape (questions, results, currentIndex, timeLeft)
- `src/pages/PracticePage.tsx` -- Practice session state machine (config -> session -> results)
- `src/pages/InterviewPage.tsx` -- Interview session state machine (setup -> countdown -> session -> results)
- `src/components/practice/PracticeSession.tsx` -- Practice session state shape (questions, results, timer)
- `src/components/interview/InterviewSession.tsx` -- Interview session state shape (questions, results, counts, phase)
- `src/components/navigation/navConfig.ts` -- Nav badge system (NavBadges interface, badgeKey)
- `src/components/navigation/useNavBadges.ts` -- Badge aggregation hook pattern
- `src/components/dashboard/NBAHeroCard.tsx` -- Dashboard card style reference
- `src/components/progress/MasteryMilestone.tsx` -- Celebration modal pattern (Dialog + Confetti)
- `/jakearchibald/idb-keyval` via Context7 -- Confirmed `createStore` API, custom store usage
- `/websites/radix-ui_primitives` via Context7 -- Confirmed Dialog accessibility, keyboard interactions

### Secondary (MEDIUM confidence)
- Radix Dialog `onInteractOutside` / `onEscapeKeyDown` -- Standard Radix primitive props (not found explicitly in Context7 but documented in Radix API reference). The existing `DialogContent` `forwardRef` spreads `{...props}` to `DialogPrimitive.Content`, so these props should pass through. Verified no current usage in the project (grep returned 0 results), but Radix's type definitions include them.

### Tertiary (LOW confidence)
- None. All findings verified against existing codebase patterns.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All libraries already installed and patterned in the codebase. Zero new dependencies.
- Architecture: HIGH -- Session store follows existing offlineDb.ts pattern. Modal follows existing Dialog.tsx pattern. Countdown extends existing InterviewCountdown.tsx pattern. Dashboard cards follow existing NBAHeroCard.tsx pattern.
- Pitfalls: HIGH -- All pitfalls identified from direct codebase analysis and existing project memory (React Compiler constraints, WAAPI limitations, ref access during render).

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (stable -- no dependency changes expected)
