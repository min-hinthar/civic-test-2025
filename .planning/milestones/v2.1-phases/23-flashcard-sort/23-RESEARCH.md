# Phase 23: Flashcard Sort Mode - Research

**Researched:** 2026-02-16
**Domain:** Gesture-based card sorting UI with drill loop, session persistence, SRS integration
**Confidence:** HIGH

## Summary

Phase 23 adds a "Sort mode" toggle to the existing flashcard/study page (`StudyGuidePage.tsx`). Sort mode presents cards in a Tinder-style swipeable stack where users classify each card as "Know" (swipe right) or "Don't Know" (swipe left). Missed cards are drilled in subsequent rounds until mastery, with sort results feeding into the SRS deck.

The project already has all the required libraries installed: `motion` v12.33.0 for drag gestures and spring physics, `react-canvas-confetti` v2.0.7 for celebrations, `react-countup` v6.5.3 for animated counters, `idb-keyval` v6.2.2 for session persistence. No new dependencies are needed.

The core technical challenge is the swipe-to-sort interaction: a card that follows the finger with rotation, shows color overlays/zone labels during drag, and flings off-screen with momentum on commit. motion/react's `useMotionValue` + `useTransform` + `useAnimate` provide everything needed. The existing `FlashcardStack.tsx` already uses `drag`, `PanInfo`, and velocity-based thresholds, giving a verified pattern to extend.

**Primary recommendation:** Build the sort mode state machine as a `useReducer` (following the `quizReducer.ts` pattern) with phases: `sorting`, `animating`, `round-summary`, `drilling`, `mastery-complete`. Extend `SessionSnapshot` union type to add a `sort` session type. Reuse `PillTabBar`, `SegmentedProgressBar`, `ResumePromptModal`, `ExitConfirmDialog`, `Confetti`, haptics, and sound effects from existing components.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Swipe & Sort Interaction
- Tinder-style fling gesture: card follows finger, rotates ~15 degrees in swipe direction, flings off-screen with momentum
- User controls flip: card starts on question side, user can optionally flip to see answer before swiping
- Both color overlay on card (green tint right / amber tint left) AND background zone labels ("Know" / "Don't Know") appear during drag
- Two buttons below card as alternative to swiping: Don't Know (left) and Know (right) -- always visible
- Velocity-based commit threshold: fast flick commits regardless of distance; slow drag needs ~40% of card width
- Stacked deck: 2-3 cards visible in slightly offset stack behind the current card
- Undo button appears after each swipe -- tapping it brings the last card back
- Both sound effects (whoosh on fling, ding for Know, thud for Don't Know) AND haptic feedback on commit
- TTS speech buttons (English + Burmese) available on cards during sort mode -- same as Browse mode
- Respects current language mode: English-only shows English text only, Myanmar mode shows bilingual
- PillTabBar at top for Browse/Sort mode toggle -- consistent with test/interview mode selectors
- Smart card source defaults: SRS due cards if any, otherwise all cards. Category filter available but not required.

#### Round Flow & Drill Loop
- After sorting all cards: summary screen with 5-second auto-start countdown for next round (tap to skip or cancel)
- Summary stays visible with countdown overlaid on CTA button area (not full-screen takeover)
- Cards shuffled every round (including first round) -- prevents pattern memorization
- Drill round cards show subtle category hint tag (e.g., "American Government") -- mild context cue
- Session persistence via IndexedDB (reuse Phase 20 infrastructure) -- prompt to resume on return
- Full resume prompt using ResumePromptModal from Phase 20 (shows round #, cards remaining)
- Undo history resets on resume -- fresh undo stack for current session segment
- Exit button in header -- tapping shows confirmation dialog
- 100% mastery celebration: confetti animation + triumphant chime sound
- Always shuffled initial round -- every session feels fresh

#### Progress & Scoring Display
- Live progress during sorting: dual counters (green Know count, red Don't Know count) + progress bar
- Segmented progress bar (one segment per card, color-coded) -- adaptive: switches to continuous bar if card count > 40
- Counter animations: pop (spring scale) + color flash + sound on each increment -- maximum juice
- Comprehensive end-of-round summary: Know %, Don't Know count, time taken, round number, improvement delta from last round
- Expandable list of missed cards on summary -- user can review questions before drilling
- Per-category breakdown on summary (e.g., "American Government: 15/20 known")
- Improvement delta shown for round 2+: "+5 more known vs last round" with encouraging message
- Personal best record tracked: highest Know % on first round -- shown on sort mode landing/summary
- Counter position: Claude's discretion

#### SRS Integration Behavior
- SRS prompt appears at end of each round (not just end of session) -- on the summary screen
- SRS add distinguishes new cards vs already-in-deck: "3 new cards to add, 5 already in your deck"
- Toast confirmation after adding: "Added 3 cards to your review deck"
- Sort results feed into dashboard readiness -- weak categories from sorting inform study recommendations
- Personal best storage: Claude's discretion (localStorage vs Supabase based on existing sync infra)

### Claude's Discretion
- Round cap (unlimited vs capped at reasonable limit)
- Mastery credit policy for drill rounds (single Know vs consecutive Knows)
- SRS granularity (batch all vs checkboxes per card)
- SRS schedule effect of "Don't Know" on existing deck cards (reset vs lapse vs no effect)
- Whether "Know" swipes count as SRS reviews
- Smart default: whether to mix in non-due cards with due cards
- Counter positioning during sort
- Personal best storage mechanism

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

## Discretion Recommendations

### Round Cap
**Recommendation: Cap at 10 rounds.** After 10 rounds, if cards remain unknown, show a "Take a break" message suggesting the user add remaining cards to the SRS deck. This prevents frustration loops while keeping the experience encouraging. 10 rounds is generous -- if a user hasn't mastered 5-10 remaining cards in 10 rounds, diminishing returns set in.

### Mastery Credit Policy
**Recommendation: Single "Know" swipe = mastered for that session.** Requiring consecutive Knows would add significant state complexity (tracking per-card Know counts across rounds) and frustrate users who make occasional finger-slip errors. The drill loop itself provides repetition -- if a card keeps appearing, the user is already getting the benefit of spaced review.

### SRS Granularity
**Recommendation: Batch add all "Don't Know" cards with a single button, plus "View cards" expandable to deselect individual cards.** Default to "Add all N cards" with an expandable section showing checkboxes. Most users want the quick path; power users can deselect.

### SRS Schedule Effect on Existing Deck Cards
**Recommendation: No effect on existing cards.** If a card is already in the SRS deck and the user marks it "Don't Know" in sort mode, do NOT lapse or reset the SRS card. Sort mode is a self-assessment tool, not a formal review. Messing with SRS schedules from sort mode would undermine the FSRS algorithm's carefully calibrated intervals. Only the dedicated Review Session should grade SRS cards.

### "Know" Swipes as SRS Reviews
**Recommendation: No.** For the same reason above -- sort mode is informal self-assessment. SRS review is a separate, formal process. Conflating them would cause interval inflation (user quickly swipes "Know" on many cards, FSRS pushes them far out).

### Smart Default Card Source
**Recommendation: SRS due cards first, then pad with weak-area cards, then all cards.** If SRS has due cards, start with those. If not, pull from weak areas (via `detectWeakAreas`). If no weak areas detected, use all 128 cards. Category filter is separate -- if user selects a category, only that category's cards are used regardless of due/weak status.

### Counter Positioning
**Recommendation: Counters flanking the card horizontally -- Know count on right, Don't Know on left.** This mirrors the swipe direction (left = Don't Know, right = Know) for spatial consistency. Place the progress bar below the card, above the Know/Don't Know buttons.

### Personal Best Storage
**Recommendation: localStorage.** Personal best is a simple key-value (best first-round Know %). No need for IndexedDB or Supabase sync -- it's a local motivational stat, not critical data. Use key `civic-prep-sort-personal-best` with JSON `{ percentage: number, date: string, cardCount: number }`.

## Standard Stack

### Core (Already Installed -- No New Dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `motion` (motion/react) | 12.33.0 | Drag gestures, spring physics, `useMotionValue`, `useTransform`, `useAnimate`, `AnimatePresence` | Already powers all animations in the app; drag is built-in |
| `react-canvas-confetti` | 2.0.7 | 100% mastery celebration confetti | Already used in `Confetti.tsx` component |
| `react-countup` | 6.5.3 | Animated counter numbers on summary screen | Already installed, used for animated number reveals |
| `idb-keyval` | 6.2.2 | Session persistence in IndexedDB | Already used by `sessionStore.ts` for session snapshots |
| `clsx` | 2.1.1 | Conditional class composition | Used throughout the app |
| `lucide-react` | 0.475.0 | Icons (Undo, Check, X, ChevronLeft, etc.) | Already the icon library for the project |

### Supporting (Existing App Infrastructure)
| Library | Purpose | When to Use |
|---------|---------|-------------|
| `ts-fsrs` (via SRSContext) | SRS card scheduling | When adding "Don't Know" cards to deck |
| `@radix-ui/react-dialog` | Exit confirmation dialog | Already used by `ExitConfirmDialog.tsx` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| motion/react drag | react-tinder-card / react-spring | motion/react already installed, well-tested in this codebase, handles drag+spring natively. Third-party Tinder libs add dependencies and fight with existing animation system. |
| Custom swipe detection | Hammer.js / use-gesture | motion/react's built-in `drag`, `onDrag`, `onDragEnd` with `PanInfo` (offset, velocity) already handles velocity-based commit threshold -- no need for separate gesture library |
| useReducer state machine | XState | Overkill for 5 phases. useReducer pattern is already established in `quizReducer.ts` |

**Installation:**
```bash
# No new packages needed
```

## Architecture Patterns

### Recommended File Structure
```
src/
├── lib/
│   └── sort/
│       ├── sortTypes.ts          # SortPhase, SortState, SortAction types
│       ├── sortReducer.ts        # State machine reducer
│       └── sortReducer.test.ts   # Reducer unit tests
├── components/
│   └── sort/
│       ├── SortModeContainer.tsx  # Top-level sort mode orchestrator
│       ├── SwipeableCard.tsx      # Single draggable card with rotation/overlay
│       ├── SwipeableStack.tsx     # Stacked deck managing card queue + undo
│       ├── SortProgress.tsx       # Dual counters + segmented/continuous progress bar
│       ├── RoundSummary.tsx       # End-of-round stats, category breakdown, SRS prompt
│       ├── SortCountdown.tsx      # 5-second auto-start countdown on summary CTA
│       ├── MissedCardsList.tsx    # Expandable list of missed cards
│       └── SRSBatchAdd.tsx        # Batch add "Don't Know" cards to SRS deck
├── hooks/
│   └── useSortSession.ts         # Session persistence hook wrapping sortReducer
├── lib/sessions/
│   └── sessionTypes.ts           # Extended with SortSnapshot type
└── pages/
    └── StudyGuidePage.tsx         # Modified: PillTabBar gains "Sort" tab
```

### Pattern 1: Swipe-to-Sort with useMotionValue + useTransform
**What:** Card position drives rotation and overlay opacity via motion value transforms
**When to use:** During the active sorting phase
**Example:**
```typescript
// Source: motion.dev/docs/react/-motion-value (verified via Context7)
import { useMotionValue, useTransform, useAnimate, motion } from 'motion/react';

function SwipeableCard({ onSwipe, onUndo }) {
  const x = useMotionValue(0);
  // Rotation: -15deg at left edge, 0 at center, +15deg at right edge
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  // Green overlay opacity increases as card moves right
  const knowOpacity = useTransform(x, [0, 100, 200], [0, 0.3, 0.6]);
  // Amber overlay opacity increases as card moves left
  const dontKnowOpacity = useTransform(x, [-200, -100, 0], [0.6, 0.3, 0]);

  const [scope, animate] = useAnimate();

  const handleDragEnd = (_, info: PanInfo) => {
    const { offset, velocity } = info;
    const cardWidth = scope.current?.offsetWidth ?? 300;
    const threshold = cardWidth * 0.4;

    // Velocity-based commit: fast flick always commits
    const isCommitted = Math.abs(velocity.x) > 800 || Math.abs(offset.x) > threshold;
    const direction = offset.x > 0 ? 'right' : 'left';

    if (isCommitted) {
      // Fling off-screen with momentum
      const exitX = direction === 'right' ? window.innerWidth : -window.innerWidth;
      animate(scope.current, { x: exitX, rotate: direction === 'right' ? 30 : -30 }, {
        type: 'spring',
        velocity: velocity.x,
        stiffness: 200,
        damping: 30,
      }).then(() => {
        onSwipe(direction === 'right' ? 'know' : 'dont-know');
      });
    } else {
      // Snap back to center
      animate(scope.current, { x: 0, rotate: 0 }, {
        type: 'spring',
        stiffness: 500,
        damping: 30,
      });
    }
  };

  return (
    <motion.div
      ref={scope}
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
    >
      {/* Green overlay */}
      <motion.div style={{ opacity: knowOpacity }} className="absolute inset-0 bg-success/20 rounded-2xl" />
      {/* Amber overlay */}
      <motion.div style={{ opacity: dontKnowOpacity }} className="absolute inset-0 bg-warning/20 rounded-2xl" />
      {/* Card content (reuse Flashcard3D) */}
    </motion.div>
  );
}
```

### Pattern 2: Sort State Machine (useReducer)
**What:** Finite state machine managing sort phases, card queue, results, and round progression
**When to use:** Orchestrating the entire sort mode lifecycle
**Example:**
```typescript
// Follows quizReducer.ts pattern (verified in codebase)
type SortPhase =
  | 'idle'           // Before first round (landing/setup)
  | 'sorting'        // Active card sorting
  | 'animating'      // Card fling animation in progress
  | 'round-summary'  // End-of-round stats
  | 'countdown'      // Auto-start countdown for next round
  | 'mastery'        // 100% known -- celebration screen

interface SortState {
  phase: SortPhase;
  round: number;
  cards: Question[];           // Current round's cards (shuffled)
  currentIndex: number;
  knownIds: Set<string>;       // Question IDs sorted as "Know" this round
  unknownIds: Set<string>;     // Question IDs sorted as "Don't Know" this round
  allUnknownIds: Set<string>;  // Cumulative "Don't Know" across all rounds
  undoStack: UndoEntry[];      // For undo functionality
  roundHistory: RoundResult[]; // Stats per round for improvement delta
  startTime: number;           // Round start timestamp
  sourceCards: Question[];     // Original card set (before filtering)
}
```

### Pattern 3: Session Persistence Extension
**What:** Extend the `SessionSnapshot` discriminated union with a `sort` type
**When to use:** For save/resume functionality
**Example:**
```typescript
// Extends src/lib/sessions/sessionTypes.ts
export interface SortSnapshot extends BaseSessionSnapshot {
  type: 'sort';
  /** Full card set for the session */
  sourceCards: Question[];
  /** Current round number */
  round: number;
  /** Question IDs sorted as Know this round */
  knownIds: string[];
  /** Question IDs sorted as Don't Know this round */
  unknownIds: string[];
  /** Cumulative Don't Know IDs across all rounds */
  allUnknownIds: string[];
  /** Cards remaining in current round (shuffled order) */
  remainingCards: Question[];
  /** Current card index in the round */
  currentIndex: number;
  /** Previous round results for improvement delta */
  roundHistory: RoundResult[];
  /** Category filter if applied */
  categoryFilter?: string;
}
```

### Pattern 4: Stacked Deck Visual
**What:** 2-3 cards visible behind the current card with offset/scale transforms
**When to use:** Rendering the card stack during sorting
**Example:**
```typescript
// Cards behind active card, z-indexed and offset
function SwipeableStack({ cards, currentIndex }) {
  const visibleCards = cards.slice(currentIndex, currentIndex + 3);

  return (
    <div className="relative">
      {visibleCards.map((card, i) => {
        const isActive = i === 0;
        return (
          <div
            key={card.id}
            style={{
              position: i === 0 ? 'relative' : 'absolute',
              top: 0, left: 0, right: 0,
              transform: `scale(${1 - i * 0.04}) translateY(${i * 8}px)`,
              zIndex: 3 - i,
              opacity: 1 - i * 0.15,
              pointerEvents: isActive ? 'auto' : 'none',
            }}
          >
            {isActive ? <SwipeableCard ... /> : <StaticCardPreview ... />}
          </div>
        );
      })}
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Don't use `drag` constraints for the sort interaction:** `dragConstraints={{ left: 0, right: 0 }}` snaps back to origin during drag -- use `dragElastic={1}` with no constraints and handle snap-back manually in `onDragEnd`
- **Don't animate exit within AnimatePresence for swipe cards:** The swipe-off animation must happen BEFORE removing the card from state. Use `useAnimate` imperatively, await the animation, THEN update state.
- **Don't use `useState` for derived values:** Counter animations (Know count, Don't Know count) should derive from `state.knownIds.size` and `state.unknownIds.size` -- compute in render, don't sync with `useEffect`
- **Don't store `Set` objects in IndexedDB:** IndexedDB can't serialize Sets. Convert to arrays for snapshot persistence, convert back on resume.
- **Don't use `useMemo<Type>()` generic syntax:** React Compiler breaks on this. Use `const x: Type = useMemo(() => ...)` instead (per CLAUDE.md)
- **Don't put setState directly in effect bodies:** Use `useMemo` for derived state per React Compiler rules
- **Don't use `useRef(value)` for render-time tracking:** Use `useState(() => value)` lazy init for React Compiler purity

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drag gesture handling | Custom pointer event tracking | `motion/react` `drag` + `onDragEnd` with `PanInfo` | Handles touch/mouse unification, momentum, elastic snap-back |
| Card fling animation | CSS transitions / `requestAnimationFrame` | `useAnimate` from `motion/react` | Spring physics with velocity inheritance, awaitable promises |
| Rotation during drag | Manual transform calculation | `useMotionValue` + `useTransform` | Reactive, no re-renders, synced with gesture |
| Confetti celebration | Canvas particle system | `Confetti` component (`react-canvas-confetti`) | Already built and tested in the codebase |
| Session persistence | Custom IndexedDB wrapper | `sessionStore.ts` + `useSessionPersistence.ts` | Handles expiry, versioning, 1-per-type enforcement |
| Sound effects | `<audio>` elements | `soundEffects.ts` AudioContext functions | Module-level singleton, mute-aware, failure-safe |
| Haptic feedback | Direct `navigator.vibrate` calls | `haptics.ts` utility functions | Cross-browser safe, SSR-safe, failure-safe |
| Shuffle algorithm | `Array.sort(() => Math.random())` | `fisherYatesShuffle` from `src/lib/shuffle.ts` | Uniformly distributed, doesn't mutate original |
| Progress bar | Custom SVG/div bar | `SegmentedProgressBar` from Phase 21 | Already handles color-coding, completion sparkle, bilingual labels |
| Resume prompt | Custom modal | `ResumePromptModal` from Phase 20 | Non-dismissible, handles multiple sessions, bilingual |
| Exit confirmation | Custom dialog | `ExitConfirmDialog` from Phase 21 | Radix Dialog with focus trap, bilingual, session-save messaging |
| Mode toggle tabs | Custom tab switcher | `PillTabBar` from Phase 15 | Spring-animated pill indicator, badge support, bilingual labels |

**Key insight:** This phase is primarily a NEW interaction pattern (swipe-to-sort) built on top of extensively REUSABLE infrastructure. The reducer, session persistence, summary UI, and SRS integration are the bulk of the work -- the gesture layer itself is ~100 lines of motion/react code.

## Common Pitfalls

### Pitfall 1: Drag vs Click/Tap Conflict on Flashcard3D
**What goes wrong:** The existing `Flashcard3D` uses `onClick` for flip. When wrapped in a draggable container, any drag start triggers the click handler, causing the card to flip unintentionally during swipe.
**Why it happens:** `onClick` fires on `pointerup` even after a drag gesture. motion/react's `drag` attempts to prevent this, but nested click handlers can still trigger.
**How to avoid:** Track `isDragging` state. Set `true` on `onDragStart`, `false` after animation completes. Gate the flip `onClick` with `if (isDragging) return`. Alternatively, use a `dragStartThreshold` of ~5px so micro-movements don't initiate drag.
**Warning signs:** Card flips randomly during swipe attempts.

### Pitfall 2: Pointer Events on Back-Stack Cards
**What goes wrong:** Cards behind the active card receive pointer events, causing drag gestures to register on the wrong card.
**Why it happens:** `backfaceVisibility: hidden` does NOT block pointer events (documented in CLAUDE.md memory).
**How to avoid:** Set `pointerEvents: 'none'` on all cards except the top (active) card. Only the `i === 0` card in the stack should have `pointerEvents: 'auto'`.
**Warning signs:** Swiping moves cards underneath instead of the top card.

### Pitfall 3: Undo After Fling Animation Race
**What goes wrong:** User taps "Undo" while the fling-off animation is still playing, causing the card to appear in a half-animated state.
**Why it happens:** The undo restores the card to the stack before the exit animation completes.
**How to avoid:** Disable the undo button during the `animating` phase. Only enable it once the card has fully exited and state has updated. Use the `animating` phase in the reducer to gate undo availability.
**Warning signs:** Ghost card appears mid-animation, visual glitch.

### Pitfall 4: Set Serialization for IndexedDB
**What goes wrong:** Session snapshot save fails silently because `Set` objects are not serializable by IndexedDB's structured clone algorithm.
**Why it happens:** `idb-keyval`'s `set()` uses the structured clone algorithm, which cannot handle `Set` or `Map`.
**How to avoid:** Convert `knownIds` and `unknownIds` from `Set<string>` to `string[]` before saving. Reconstruct `Set` from array on load/resume.
**Warning signs:** Session save appears to work but resume shows empty state.

### Pitfall 5: WAAPI 2-Keyframe Limitation
**What goes wrong:** Counter pop animation with `scale: [0.85, 1.08, 1]` (3 keyframes) throws in some browsers.
**Why it happens:** Web Animations API only supports 2-keyframe arrays (documented in CLAUDE.md memory).
**How to avoid:** Use motion/react's `animate` prop with spring physics instead of WAAPI keyframes. `animate={{ scale: [1.15, 1] }}` with spring transition gives the pop effect with only 2 keyframes, or use `repeatType: 'mirror'` for oscillation.
**Warning signs:** Animation throws runtime error, counter doesn't animate.

### Pitfall 6: Focus Management After Card Exit
**What goes wrong:** Screen readers lose focus position after a card is swiped away, or focus jumps to top of page.
**Why it happens:** The focused element (the card) is removed from DOM, and no focus management is in place.
**How to avoid:** After each swipe, focus the next card or the undo button. Use `{ preventScroll: true }` per CLAUDE.md memory. Announce sort result via aria-live region.
**Warning signs:** Tab focus jumps unexpectedly, screen reader users lose context.

### Pitfall 7: Stale Closure in Drag Handler
**What goes wrong:** `onDragEnd` callback captures stale state values, causing incorrect card classification.
**Why it happens:** React closures capture state at render time. If state updates between drag start and drag end, the handler uses old values.
**How to avoid:** Use `useCallback` with correct dependency array. Reference `currentIndex` from the reducer state, not from a local variable. The card's identity should be captured at drag start, not drag end.
**Warning signs:** Wrong card gets classified, undo restores wrong card.

### Pitfall 8: Timer Overflow in Sort Progress
**What goes wrong:** Timer display shows negative time or NaN after long sessions.
**Why it happens:** `Date.now()` subtraction can overflow or produce unexpected values if the device sleeps mid-session.
**How to avoid:** Use `Math.max(0, elapsed)` guard. Store `startTime` in state and recalculate on resume. Don't rely on continuous timer -- calculate elapsed from snapshots.
**Warning signs:** Timer shows "-0:23" or "NaN:NaN".

## Code Examples

### Sound Effects for Sort Mode (new functions needed)
```typescript
// Extend src/lib/audio/soundEffects.ts
// Source: existing pattern from soundEffects.ts (verified in codebase)

/**
 * Whoosh sound for card fling (frequency sweep down).
 * 800 Hz -> 300 Hz over 0.2s. Physical, satisfying.
 */
export function playFling(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch { /* silently ignore */ }
}

/**
 * Ding for "Know" sort (ascending two-note, similar to playCorrect).
 */
export function playKnow(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    playNote(ctx, 523, 0, 0.12, 0.2);  // C5
    playNote(ctx, 659, 0.1, 0.12, 0.2); // E5
  } catch { /* silently ignore */ }
}

/**
 * Thud for "Don't Know" sort (low single note).
 * 200 Hz triangle wave, 0.15s. Soft, not punishing.
 */
export function playDontKnow(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    playNote(ctx, 200, 0, 0.15, 0.15, 'triangle');
  } catch { /* silently ignore */ }
}

/**
 * Triumphant chime for 100% mastery (reuse playMilestone pattern).
 */
export function playMasteryComplete(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    playNote(ctx, 523, 0, 0.4, 0.3);    // C5
    playNote(ctx, 659, 0, 0.4, 0.3);    // E5
    playNote(ctx, 784, 0, 0.4, 0.3);    // G5
    playNote(ctx, 1047, 0.3, 0.5, 0.3); // C6
    playNote(ctx, 1319, 0.5, 0.5, 0.25); // E6
  } catch { /* silently ignore */ }
}
```

### Adaptive Progress Bar (Segmented vs Continuous)
```typescript
// Decision logic for progress bar type (per user decision: > 40 cards = continuous)
function SortProgress({ totalCards, knowCount, dontKnowCount, segments }) {
  const useContinuous = totalCards > 40;

  if (useContinuous) {
    // Use Radix Progress with percentage
    const percentage = ((knowCount + dontKnowCount) / totalCards) * 100;
    return <Progress value={percentage} />;
  }

  // Use SegmentedProgressBar with color-coded segments
  return (
    <SegmentedProgressBar
      segments={segments}
      currentIndex={knowCount + dontKnowCount}
      totalCount={totalCards}
    />
  );
}
```

### Session Type Extension
```typescript
// Add to SessionSnapshot union in sessionTypes.ts
export type SessionSnapshot =
  | MockTestSnapshot
  | PracticeSnapshot
  | InterviewSnapshot
  | SortSnapshot;  // New

// Update SESSION_VERSION when shape changes:
// export const SESSION_VERSION = 2;
// (But only if existing snapshot types change -- adding a new union member is backwards-compatible)
```

### Undo Stack Pattern
```typescript
interface UndoEntry {
  questionId: string;
  direction: 'know' | 'dont-know';
  cardIndex: number; // Position in the round's card array
}

// In reducer:
case 'UNDO': {
  if (state.phase !== 'sorting' || state.undoStack.length === 0) return state;
  const lastEntry = state.undoStack[state.undoStack.length - 1];
  const newKnown = new Set(state.knownIds);
  const newUnknown = new Set(state.unknownIds);

  if (lastEntry.direction === 'know') {
    newKnown.delete(lastEntry.questionId);
  } else {
    newUnknown.delete(lastEntry.questionId);
  }

  return {
    ...state,
    currentIndex: state.currentIndex - 1,
    knownIds: newKnown,
    unknownIds: newUnknown,
    undoStack: state.undoStack.slice(0, -1),
  };
}
```

## Existing Component Reuse Map

| Existing Component | Location | Reuse in Phase 23 |
|---|---|---|
| `PillTabBar` | `src/components/ui/PillTabBar.tsx` | Add "Sort" tab alongside existing "Browse", "Deck", "Review" tabs on StudyGuidePage |
| `Flashcard3D` | `src/components/study/Flashcard3D.tsx` | Render card content inside `SwipeableCard` wrapper -- reuse question/answer display, TTS buttons, category styling |
| `SegmentedProgressBar` | `src/components/quiz/SegmentedProgressBar.tsx` | Use for cards <= 40, extend segment statuses to include 'know' and 'dont-know' |
| `ResumePromptModal` | `src/components/sessions/ResumePromptModal.tsx` | Resume sort sessions -- extend `ResumeSessionCard` with sort-specific display |
| `ExitConfirmDialog` | `src/components/quiz/ExitConfirmDialog.tsx` | Exit confirmation during active sort -- extend `mode` type to include `'sort'` |
| `Confetti` | `src/components/celebrations/Confetti.tsx` | 100% mastery celebration, `intensity="celebration"` |
| `SessionCountdown` | `src/components/sessions/SessionCountdown.tsx` | Reference for auto-start countdown pattern (but sort uses inline countdown, not full-screen) |
| `SessionSummary` | `src/components/srs/SessionSummary.tsx` | Pattern reference for stats grid and weak category nudge |
| `AddToDeckButton` | `src/components/srs/AddToDeckButton.tsx` | Individual card add-to-deck in expanded missed cards list |
| `soundEffects.ts` | `src/lib/audio/soundEffects.ts` | Extend with `playFling`, `playKnow`, `playDontKnow`, `playMasteryComplete` |
| `haptics.ts` | `src/lib/haptics.ts` | `hapticMedium()` on Know commit, `hapticDouble()` on Don't Know commit |
| `fisherYatesShuffle` | `src/lib/shuffle.ts` | Shuffle cards each round |
| `sessionStore.ts` | `src/lib/sessions/sessionStore.ts` | Save/load sort session snapshots |
| `useSessionPersistence` | `src/lib/sessions/useSessionPersistence.ts` | React hook for session loading (extend type filter to include 'sort') |
| `SRSContext` (useSRS) | `src/contexts/SRSContext.tsx` | `addCard`, `isInDeck`, `getDueCards` for SRS integration |
| `weakAreaDetection.ts` | `src/lib/mastery/weakAreaDetection.ts` | Smart card defaults: pull weak categories for initial card set |
| `allQuestions` | `src/constants/questions/index.ts` | Full question bank (128 questions) as default card source |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Framer Motion (separate package) | `motion/react` (unified package) | 2024 | Import from `motion/react`, not `framer-motion` |
| `useAnimation` hook | `useAnimate` hook | motion v10+ | `useAnimate` returns `[scope, animate]`, more flexible for imperative animations |
| CSS transform for drag | `useMotionValue` + `drag` prop | motion v4+ | Reactive transforms without re-renders, built-in gesture handling |

**Deprecated/outdated:**
- `framer-motion` package name: now `motion` (v11+). This project already uses `motion` v12.33.0.
- `useAnimation()`: replaced by `useAnimate()` which is more powerful and simpler.

## Open Questions

1. **SegmentedProgressBar segment status types**
   - What we know: Current `SegmentStatus` type is `'correct' | 'incorrect' | 'skipped' | 'current' | 'unanswered'`. Sort mode needs `'know'` and `'dont-know'` semantics.
   - What's unclear: Whether to extend the existing type or create a sort-specific progress component.
   - Recommendation: Map sort statuses to existing ones: `'know' -> 'correct'` (green), `'dont-know' -> 'incorrect'` (red/amber), `'current' -> 'current'`, remaining -> `'unanswered'`. The colors already match the desired semantics. No type changes needed.

2. **SESSION_VERSION bumping**
   - What we know: Adding a new type to the `SessionSnapshot` union is backward-compatible -- existing sessions of other types won't break.
   - What's unclear: Whether `SESSION_VERSION` should be bumped from 1 to 2.
   - Recommendation: Do NOT bump version. Adding a new union member doesn't change existing snapshot shapes. Bumping would unnecessarily discard valid mock-test/practice/interview snapshots. Only bump if existing types change.

3. **Dashboard readiness integration specifics**
   - What we know: `weakAreaDetection.ts` detects weak categories from `StoredAnswer[]`. Sort results could feed into this.
   - What's unclear: Whether sort "Don't Know" results should be recorded as `StoredAnswer` entries (which would affect mastery calculations) or tracked separately.
   - Recommendation: Record sort "Don't Know" as `StoredAnswer` with `sessionType: 'sort'` (requires extending the union type from `'test' | 'practice'`). This allows existing mastery/weak-area detection to naturally incorporate sort data without custom integration. "Know" results should NOT be recorded (they aren't verified correct answers -- just user self-assessment).

## Sources

### Primary (HIGH confidence)
- `/websites/motion_dev_react` (Context7) - drag gestures, useMotionValue, useTransform, useAnimate, AnimatePresence
- `/websites/motion_dev` (Context7) - PanInfo, spring velocity, inertia transitions
- Codebase inspection: `FlashcardStack.tsx`, `Flashcard3D.tsx`, `quizReducer.ts`, `sessionStore.ts`, `soundEffects.ts`, `haptics.ts`, `PillTabBar.tsx`, `SegmentedProgressBar.tsx`, `ResumePromptModal.tsx`, `ExitConfirmDialog.tsx`, `Confetti.tsx`, `SRSContext.tsx`

### Secondary (MEDIUM confidence)
- React useReducer pattern for state machines -- well-established in this codebase via `quizReducer.ts`
- Session persistence via `idb-keyval` -- proven pattern in `sessionStore.ts`

### Tertiary (LOW confidence)
- None -- all findings verified against codebase or Context7

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed and verified in codebase
- Architecture: HIGH - extends proven patterns (reducer, session store, reusable components)
- Pitfalls: HIGH - most documented in CLAUDE.md memory or verified via codebase inspection
- Gesture implementation: HIGH - motion/react drag + useMotionValue verified via Context7

**Research date:** 2026-02-16
**Valid until:** 2026-03-16 (stable -- no fast-moving dependencies)
