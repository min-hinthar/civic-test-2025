# Phase 5: Spaced Repetition - Research

**Researched:** 2026-02-07
**Domain:** FSRS spaced repetition algorithm, IndexedDB caching, Supabase sync, review UI
**Confidence:** HIGH

## Summary

Phase 5 integrates the FSRS (Free Spaced Repetition Scheduler) algorithm via the `ts-fsrs` library to provide personalized review scheduling. The user manually adds civics questions to a review deck, studies due cards in a flashcard-style session with binary Easy/Hard grading, and sees intervals adapt based on recall performance. The system must work offline via IndexedDB and sync to Supabase for cross-device access.

The standard approach is: (1) `ts-fsrs` v5.x for scheduling math, (2) a new `srs_cards` Supabase table with RLS for persistent storage, (3) a dedicated IndexedDB store via `idb-keyval` for offline cache, (4) an `SRSProvider` React context following existing patterns (OfflineContext, AuthProvider), and (5) review session UI reusing the existing `Flashcard3D` component with added swipe-to-rate gestures.

**Primary recommendation:** Use `ts-fsrs` v5.2.x with binary rating mapped to `Rating.Good` (Easy) and `Rating.Again` (Hard). Store FSRS `Card` state per question in both Supabase and IndexedDB. Follow existing project patterns (idb-keyval stores, context providers, motion/react animations) exactly.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Review session: one card at a time, flashcard style, reuse 3D flip card from study guide
- User chooses session size before starting (e.g., 10, 20, all due)
- Progress bar + card count during session ("Card 7 of 15")
- Optional timer toggle
- WhyButton (tap-to-expand) for explanations -- not auto-shown
- After rating, briefly show next review interval ("Next review: 3 days")
- Exit mid-session saves progress
- End-of-session: summary stats + nudge to practice weak categories
- Swipe gestures: right = Easy, left = Hard (with tap buttons as fallback)
- Users manually add cards from study guide and test review screen (two touchpoints)
- Users can remove cards from their deck at any time
- Deck management page lives under Study Guide tab
- Deck page shows cards with labels (New/Due/Done) + color-coded interval strength (red to green)
- Review mode accessible from Study Guide (not top-level nav)
- Dashboard widget taps navigate to study guide review tab
- Binary rating: 2 buttons -- Easy and Hard
- FSRS mapping: Easy -> Good, Hard -> Again
- Bilingual labels with icons on both buttons
- Swipe indicators: color gradient (green right / orange left) AND text labels at edges
- Green flash for Easy, orange flash for Hard, plus next-review interval text
- Brief bilingual encouragement message when user rates Hard
- No FSRS parameter customization -- use sensible defaults
- Test/practice mode answers do NOT feed into SRS scheduling -- review-only updates
- Dashboard SRS widget: compact by default, expandable
- Compact: due count + streak
- Expanded: due count, separate review streak, category breakdown, review heatmap
- Review heatmap: GitHub-style activity grid
- Streak is separate from existing study streak
- Bilingual streak messages
- Badge count on Study Guide nav for due cards
- Context-aware empty state
- Push notifications when cards are due -- user-configurable preferred reminder time in settings
- Reuses Phase 2 push notification infrastructure

### Claude's Discretion
- Whether forgotten (Hard) cards re-queue within the same session or just get shorter FSRS interval
- Rating button placement relative to flipped card
- Bulk-add option (e.g., "Add all weak questions") vs individual-only
- Deck page statistics detail level
- Compact widget summary content
- Heatmap day range
- Whether initial card difficulty is seeded from Phase 4 mastery data
- Full deck sync vs history-only sync across devices
- Conflict resolution strategy (last-write-wins vs event replay)
- Sync conflict notification (silent vs toast)
- Whether SRS works without login (local IndexedDB only) or requires auth

### Deferred Ideas (OUT OF SCOPE)
- Myanmar font rendering fixes -- UI/bug fix, not Phase 5 scope
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| ts-fsrs | ^5.2.3 | FSRS scheduling algorithm | Official TS implementation of FSRS; supports ESM/CJS; 0 dependencies; MIT license |
| idb-keyval | ^6.2.2 | IndexedDB storage for SRS cards | Already in project; lightweight; used by mastery and offline stores |
| @supabase/supabase-js | ^2.81.1 | Supabase client for SRS table | Already in project; used for auth and mock_tests |
| motion | ^12.33.0 | Swipe gesture animations | Already in project; used for FlashcardStack drag gestures; PanInfo for swipe detection |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | ^0.475.0 | Icons for Easy/Hard buttons, deck status | Already in project; consistent icon system |
| clsx | ^2.1.1 | Conditional class names | Already in project; used everywhere |
| @radix-ui/react-progress | ^1.1.8 | Progress bar in review session | Already in project; accessible by default |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ts-fsrs | femto-fsrs | Simpler (100 lines) but no review logs, no rollback, no reschedule |
| ts-fsrs | @squeakyrobot/fsrs | Newer but less battle-tested; v6 support is optional add-on |
| react-swipeable | motion/react drag | react-swipeable is installed but unused; FlashcardStack already uses motion/react PanInfo for swipe -- stick with existing pattern |
| Custom heatmap | @uiw/react-heat-map | External dependency adds bundle weight; heatmap is simple enough to build with CSS grid + Tailwind for a mobile-first 30-60 day range |

**Installation:**
```bash
pnpm add ts-fsrs
```

All other dependencies are already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   └── srs/
│       ├── index.ts              # Barrel re-exports
│       ├── fsrsEngine.ts         # ts-fsrs wrapper: createCard, gradeCard, getDueCards
│       ├── srsStore.ts           # IndexedDB CRUD for SRS card state (idb-keyval)
│       ├── srsSync.ts            # Supabase sync: push local changes, pull remote state
│       └── srsTypes.ts           # SRS-specific TypeScript types
├── contexts/
│   └── SRSContext.tsx            # SRSProvider: deck state, due count, review actions
├── hooks/
│   ├── useSRSDeck.ts             # Hook for deck management (add/remove cards)
│   ├── useSRSReview.ts           # Hook for review session state machine
│   └── useSRSWidget.ts           # Hook for dashboard widget data
├── components/
│   └── srs/
│       ├── ReviewSession.tsx     # Full review session orchestrator
│       ├── ReviewCard.tsx        # Single review card with flip + swipe-to-rate
│       ├── RatingButtons.tsx     # Easy/Hard buttons with bilingual labels
│       ├── SessionSetup.tsx      # Pre-session: pick size, optional timer
│       ├── SessionSummary.tsx    # End-of-session stats
│       ├── DeckManager.tsx       # Deck page: list cards, status labels, remove
│       ├── AddToDeckButton.tsx   # "Add to Review Deck" button for study guide / test review
│       ├── SRSWidget.tsx         # Dashboard compact/expanded widget
│       └── ReviewHeatmap.tsx     # GitHub-style activity grid
└── pages/
    └── StudyGuidePage.tsx        # (existing) - add review tab/route
```

### Pattern 1: FSRS Engine Wrapper
**What:** Thin abstraction over ts-fsrs that handles card creation, grading, and due-date queries
**When to use:** All SRS scheduling operations
**Example:**
```typescript
// Source: ts-fsrs v5.2.3 official API + project conventions
import { createEmptyCard, fsrs, Rating, type Card, type RecordLogItem } from 'ts-fsrs';

// Singleton FSRS instance with sensible defaults
const f = fsrs({
  enable_fuzz: true,        // Slight randomness to prevent review clustering
  enable_short_term: true,  // Allow same-day re-review for learning cards
  maximum_interval: 365,    // Cap at 1 year for civics test prep context
});

export function createNewSRSCard(): Card {
  return createEmptyCard(new Date());
}

export function gradeCard(card: Card, isEasy: boolean): RecordLogItem {
  const rating = isEasy ? Rating.Good : Rating.Again;
  return f.next(card, new Date(), rating);
}

export function isDue(card: Card): boolean {
  return card.due <= new Date();
}

export function getNextReviewText(card: Card): string {
  const diffMs = card.due.getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Now';
  if (diffDays === 1) return '1 day';
  if (diffDays < 30) return `${diffDays} days`;
  const months = Math.round(diffDays / 30);
  return `${months} month${months > 1 ? 's' : ''}`;
}
```

### Pattern 2: SRS IndexedDB Store (idb-keyval)
**What:** Dedicated IndexedDB store for SRS card state, following masteryStore.ts pattern
**When to use:** All local SRS data persistence
**Example:**
```typescript
// Source: project convention from src/lib/mastery/masteryStore.ts + offlineDb.ts
import { createStore, get, set, del, keys } from 'idb-keyval';
import type { Card } from 'ts-fsrs';

// SRS card with question association
export interface SRSCardRecord {
  questionId: string;         // e.g., 'GOV-P01'
  card: Card;                 // ts-fsrs Card state
  addedAt: string;            // ISO timestamp
  lastReviewedAt?: string;    // ISO timestamp
}

// Dedicated IDB store for SRS data
const srsDb = createStore('civic-prep-srs', 'cards');

export async function getSRSCard(questionId: string): Promise<SRSCardRecord | undefined> {
  return get<SRSCardRecord>(questionId, srsDb);
}

export async function setSRSCard(record: SRSCardRecord): Promise<void> {
  await set(record.questionId, record, srsDb);
}

export async function removeSRSCard(questionId: string): Promise<void> {
  await del(questionId, srsDb);
}

export async function getAllSRSCards(): Promise<SRSCardRecord[]> {
  const allKeys = await keys(srsDb);
  const cards: SRSCardRecord[] = [];
  for (const key of allKeys) {
    const record = await get<SRSCardRecord>(key, srsDb);
    if (record) cards.push(record);
  }
  return cards;
}
```

### Pattern 3: Supabase Table with RLS
**What:** `srs_cards` table storing per-user FSRS state with row-level security
**When to use:** Cross-device sync, persistent cloud storage
**Example:**
```sql
-- Source: project convention from supabase/schema.sql
create table if not exists public.srs_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  question_id text not null,
  -- FSRS Card state fields
  due timestamptz not null default now(),
  stability float8 not null default 0,
  difficulty float8 not null default 0,
  scheduled_days integer not null default 0,
  learning_steps integer not null default 0,
  reps integer not null default 0,
  lapses integer not null default 0,
  state smallint not null default 0,  -- 0=New, 1=Learning, 2=Review, 3=Relearning
  last_review timestamptz,
  -- Metadata
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Prevent duplicate cards per user
  unique (user_id, question_id)
);

alter table public.srs_cards enable row level security;

create policy "Users can read their own SRS cards"
  on public.srs_cards for select using (auth.uid() = user_id);
create policy "Users can insert their own SRS cards"
  on public.srs_cards for insert with check (auth.uid() = user_id);
create policy "Users can update their own SRS cards"
  on public.srs_cards for update using (auth.uid() = user_id);
create policy "Users can delete their own SRS cards"
  on public.srs_cards for delete using (auth.uid() = user_id);

-- Index for due-card queries
create index if not exists srs_cards_due_idx
  on public.srs_cards (user_id, due);
create index if not exists srs_cards_question_idx
  on public.srs_cards (user_id, question_id);
```

### Pattern 4: SRS Context Provider
**What:** React context providing deck state, due counts, and review actions
**When to use:** Any component needing SRS data (dashboard widget, study guide badge, review session)
**Example:**
```typescript
// Source: project convention from src/contexts/OfflineContext.tsx
interface SRSContextValue {
  deck: SRSCardRecord[];
  dueCount: number;
  isLoading: boolean;
  addCard: (questionId: string) => Promise<void>;
  removeCard: (questionId: string) => Promise<void>;
  gradeCard: (questionId: string, isEasy: boolean) => Promise<Card>;
  getDueCards: () => SRSCardRecord[];
  refreshDeck: () => Promise<void>;
  isInDeck: (questionId: string) => boolean;
}
```

### Pattern 5: Review Session State Machine
**What:** Hook managing the review session lifecycle: setup -> reviewing -> summary
**When to use:** The ReviewSession component
**Example:**
```typescript
type SessionPhase = 'setup' | 'reviewing' | 'summary';

interface ReviewSessionState {
  phase: SessionPhase;
  cards: SRSCardRecord[];
  currentIndex: number;
  sessionSize: number;
  results: ReviewResult[];
  timerEnabled: boolean;
}

interface ReviewResult {
  questionId: string;
  rating: 'easy' | 'hard';
  newInterval: string; // "3 days", "1 month"
}
```

### Pattern 6: Swipe-to-Rate with motion/react
**What:** Reuse existing FlashcardStack drag pattern for Easy/Hard rating
**When to use:** ReviewCard component
**Example:**
```typescript
// Source: existing src/components/study/FlashcardStack.tsx drag pattern
import { motion, PanInfo } from 'motion/react';

const SWIPE_THRESHOLD = 80;  // Higher than navigation swipe (50) for intentional rating
const SWIPE_VELOCITY = 400;

function handleDragEnd(_: unknown, info: PanInfo) {
  const { offset, velocity } = info;
  if (offset.x > SWIPE_THRESHOLD || velocity.x > SWIPE_VELOCITY) {
    // Swiped RIGHT = Easy
    onRate('easy');
  } else if (offset.x < -SWIPE_THRESHOLD || velocity.x < -SWIPE_VELOCITY) {
    // Swiped LEFT = Hard
    onRate('hard');
  }
  // Otherwise snap back (no rating)
}
```

### Anti-Patterns to Avoid
- **Storing full Card objects as JSON blobs in Supabase:** Deserialize/serialize Date fields properly. FSRS `Card.due` and `Card.last_review` are Date objects -- store as `timestamptz` in Postgres, not JSON strings.
- **Using `useMemo<T>()` generic syntax:** React Compiler ESLint rejects this. Use `const x: T = useMemo(() => ...)` instead.
- **Calling `setState()` directly in effect bodies:** Use derived state with `useMemo` or move state updates to event handlers per React Compiler rules.
- **Reading `ref.current` during render:** Move to effects or handlers only.
- **Putting FSRS instance creation inside components:** The FSRS scheduler is stateless and expensive to create. Define as module-level singleton.
- **Using `f.repeat()` when you already know the grade:** Use `f.next(card, now, rating)` which returns a single `RecordLogItem` instead of computing all 4 possibilities.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Spaced repetition scheduling | Custom SM-2 or interval calculator | ts-fsrs | FSRS is evidence-based, optimized over millions of Anki reviews, handles edge cases (fuzz, short-term memory, learning steps) |
| IndexedDB storage | Raw IndexedDB API | idb-keyval with createStore | Already established in project; handles transactions, error recovery |
| Date serialization for FSRS Cards | Manual Date parsing | ts-fsrs built-in `DateInput` type accepts Date, number, string | Library handles all parsing; avoids timezone bugs |
| Swipe gesture detection | touch event listeners | motion/react drag + PanInfo | Already used in FlashcardStack; handles velocity, elastic drag, reduced motion |
| Progress bar | Custom div width animation | @radix-ui/react-progress | Already in project (ProgressWithLabel component); accessible by default |
| Toast notifications | Custom toast system | Existing toast from use-toast | @radix-ui/react-toast already integrated with bilingual support |
| Review heatmap | Third-party heatmap library | CSS grid + Tailwind | 30-60 days on mobile is ~7 columns x ~9 rows -- simple enough with CSS grid; avoids bundle bloat |

**Key insight:** The project already has 90% of the infrastructure needed. The only new dependency is `ts-fsrs`. Everything else (IndexedDB, Supabase, swipe gestures, animations, bilingual text, push notifications) reuses existing patterns.

## Common Pitfalls

### Pitfall 1: FSRS Date Serialization
**What goes wrong:** FSRS `Card` objects use JavaScript `Date` for `due` and `last_review`. When stored in IndexedDB or Supabase and retrieved, these become strings. Passing string dates back to `f.next()` without proper conversion causes scheduling errors.
**Why it happens:** IndexedDB stores structured clones (Date objects survive), but Supabase returns ISO strings. JSON.parse loses Date types entirely.
**How to avoid:** When reading from Supabase, reconstruct Card with `new Date()` for date fields. ts-fsrs `DateInput` type accepts `Date | number | string`, so `f.next()` itself is tolerant, but `isDue` comparisons require actual Date objects.
**Warning signs:** Cards never becoming due, or all cards showing as due simultaneously.

### Pitfall 2: React Compiler ESLint Rules
**What goes wrong:** `useMemo<SRSCardRecord[]>(() => ...)` generic syntax breaks React Compiler. `setState` inside effects triggers lint errors.
**Why it happens:** This project uses `eslint-plugin-react-hooks` v7.x with strict React Compiler rules.
**How to avoid:** Use `const cards: SRSCardRecord[] = useMemo(() => ...)`. For loading states that need to be set after async operations, use the pattern from OfflineContext: call async function inside effect, set state in the `.then()` callback (with `// eslint-disable-next-line react-hooks/set-state-in-effect -- intentional` comment when unavoidable).
**Warning signs:** ESLint errors during `next build` pre-commit hook.

### Pitfall 3: Offline-First Sync Conflicts
**What goes wrong:** User reviews cards on Device A offline, then reviews the same cards on Device B. When both come online, card states conflict.
**Why it happens:** Both devices modified the same card's FSRS state independently.
**How to avoid:** Use **last-write-wins** based on `updated_at` timestamp. This is simple and appropriate for this use case because FSRS states are self-correcting -- even if a stale state overwrites a newer one, the next review will recalculate. For this app's scale (100 questions, single user), conflicts are rare and low-impact.
**Warning signs:** Card intervals jumping unexpectedly after sync.

### Pitfall 4: Binary Rating FSRS Mapping
**What goes wrong:** Mapping Hard to `Rating.Hard` instead of `Rating.Again`. In FSRS, `Hard` is a *successful* recall with difficulty -- it still increases the interval. `Again` is the only rating that indicates failure and shortens the interval.
**Why it happens:** Intuitive name mapping -- "Hard" button seems like it should map to `Rating.Hard`.
**How to avoid:** The user decision is explicit: Easy -> `Rating.Good`, Hard -> `Rating.Again`. This creates a true binary pass/fail system.
**Warning signs:** "Hard" cards not appearing sooner; intervals increasing for cards the user struggles with.

### Pitfall 5: Large Deck Performance
**What goes wrong:** Loading all 100 SRS cards from IndexedDB on every render.
**Why it happens:** Naive implementation that reads all cards in context provider effect.
**How to avoid:** Load once on mount, keep in-memory. Update in-memory state optimistically on grade/add/remove. Only write-through to IndexedDB (fire and forget). Batch Supabase syncs.
**Warning signs:** Visible loading delays when navigating to study guide.

### Pitfall 6: Due Count Stale After Midnight
**What goes wrong:** Dashboard shows 0 due cards, but cards became due overnight without page refresh.
**Why it happens:** Due count computed once and cached; no timer to recompute.
**How to avoid:** Recompute due count on page visibility change (`visibilitychange` event) or use a short interval (every 60s). Lightweight: just filter in-memory deck by `card.due <= new Date()`.
**Warning signs:** User sees "0 due" in morning but cards appear after page refresh.

## Code Examples

### Creating and Grading an SRS Card
```typescript
// Source: ts-fsrs v5.2.3 API
import { createEmptyCard, fsrs, Rating } from 'ts-fsrs';

const f = fsrs({
  enable_fuzz: true,
  enable_short_term: true,
  maximum_interval: 365,
});

// Create a new card when user adds question to deck
const card = createEmptyCard(new Date());
// card.state === State.New, card.due === now

// User rates "Easy" (maps to Rating.Good)
const result = f.next(card, new Date(), Rating.Good);
// result.card = updated Card with new due date, stability, difficulty
// result.log = ReviewLog for audit trail

console.log(result.card.due);           // e.g., 2026-02-08T... (1 day later for new card)
console.log(result.card.scheduled_days); // e.g., 1
console.log(result.card.state);          // State.Learning or State.Review

// User rates "Hard" (maps to Rating.Again)
const hardResult = f.next(card, new Date(), Rating.Again);
console.log(hardResult.card.due);        // Minutes from now (re-learn)
console.log(hardResult.card.state);      // State.Learning (reset to learning)
```

### Card State to UI Label Mapping
```typescript
// Source: ts-fsrs State enum
import { State } from 'ts-fsrs';

function getCardLabel(card: Card): { label: string; color: string } {
  if (card.state === State.New && card.reps === 0) {
    return { label: 'New', color: 'text-blue-500' };
  }
  if (card.due <= new Date()) {
    return { label: 'Due', color: 'text-warning-500' };
  }
  return { label: 'Done', color: 'text-success-500' };
}

// Interval strength color: red -> yellow -> green based on stability
function getIntervalColor(card: Card): string {
  const { scheduled_days } = card;
  if (scheduled_days <= 1) return 'bg-red-500';      // Learning
  if (scheduled_days <= 7) return 'bg-orange-500';    // Short interval
  if (scheduled_days <= 30) return 'bg-yellow-500';   // Medium
  return 'bg-green-500';                               // Strong retention
}
```

### Supabase Card Serialization/Deserialization
```typescript
// Card -> Supabase row
function cardToRow(userId: string, questionId: string, card: Card): SupabaseSRSRow {
  return {
    user_id: userId,
    question_id: questionId,
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,  // number: 0-3
    last_review: card.last_review?.toISOString() ?? null,
    updated_at: new Date().toISOString(),
  };
}

// Supabase row -> Card
function rowToCard(row: SupabaseSRSRow): Card {
  return {
    due: new Date(row.due),
    stability: row.stability,
    difficulty: row.difficulty,
    elapsed_days: 0,  // deprecated field, compute from last_review
    scheduled_days: row.scheduled_days,
    learning_steps: row.learning_steps,
    reps: row.reps,
    lapses: row.lapses,
    state: row.state,
    last_review: row.last_review ? new Date(row.last_review) : undefined,
  };
}
```

### SRS Sync Queue Pattern (Following Existing Convention)
```typescript
// Source: project convention from src/lib/pwa/syncQueue.ts
// SRS review events queue for offline sync
const srsSyncDb = createStore('civic-prep-srs-sync', 'pending-reviews');

interface PendingSRSReview {
  questionId: string;
  card: Card;         // Updated card state after grading
  reviewedAt: string; // ISO timestamp
}

export async function queueSRSReview(review: PendingSRSReview): Promise<void> {
  const key = `srs-${review.questionId}-${Date.now()}`;
  await set(key, review, srsSyncDb);
}

export async function syncPendingSRSReviews(userId: string): Promise<void> {
  const allKeys = await keys(srsSyncDb);
  for (const key of allKeys) {
    const review = await get<PendingSRSReview>(key, srsSyncDb);
    if (!review) continue;

    const row = cardToRow(userId, review.questionId, review.card);
    const { error } = await supabase
      .from('srs_cards')
      .upsert(row, { onConflict: 'user_id,question_id' });

    if (!error) {
      await del(key, srsSyncDb);
    }
  }
}
```

### Review Session Swipe-to-Rate
```typescript
// Source: existing FlashcardStack.tsx drag pattern + user decisions
import { motion, PanInfo, useMotionValue, useTransform } from 'motion/react';

function ReviewCard({ card, onRate }: Props) {
  const x = useMotionValue(0);

  // Color gradient based on swipe direction
  const bgColor = useTransform(
    x,
    [-200, -50, 0, 50, 200],
    [
      'rgba(251, 146, 60, 0.3)',  // orange-400 (Hard)
      'rgba(251, 146, 60, 0.1)',
      'rgba(0, 0, 0, 0)',         // neutral
      'rgba(74, 222, 128, 0.1)',
      'rgba(74, 222, 128, 0.3)',  // green-400 (Easy)
    ]
  );

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 80 || info.velocity.x > 400) {
      onRate('easy');
    } else if (info.offset.x < -80 || info.velocity.x < -400) {
      onRate('hard');
    }
  };

  return (
    <motion.div style={{ x, backgroundColor: bgColor }}>
      {/* Edge labels visible during swipe */}
      <div className="absolute left-4 top-1/2 text-orange-500 font-bold">Hard</div>
      <div className="absolute right-4 top-1/2 text-green-500 font-bold">Easy</div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        style={{ x }}
      >
        <Flashcard3D {...cardProps} />
      </motion.div>
    </motion.div>
  );
}
```

## Claude's Discretion Recommendations

Based on research, here are recommendations for areas left to Claude's discretion:

### Hard cards re-queue within session
**Recommendation:** Do NOT re-queue within the session. Let FSRS handle the short interval. Re-queuing creates a confusing UX where the same card appears again unexpectedly. FSRS `Rating.Again` with `enable_short_term: true` will set the next review to minutes from now, so the card will be due again soon naturally.
**Confidence:** HIGH -- this aligns with how Anki handles "Again" in FSRS mode.

### Bulk-add option
**Recommendation:** Support BOTH individual add AND bulk "Add all weak questions" (from Phase 4 mastery data). Weak questions (< 60% mastery) are already detected by `detectWeakAreas()`. A "Add weak area questions to review deck" button on the deck management page is low effort and high value.
**Confidence:** HIGH -- infrastructure exists.

### Initial card difficulty seeding from Phase 4 mastery data
**Recommendation:** Do NOT seed initial difficulty. Let FSRS start all cards fresh (default difficulty ~0.3). Rationale: Phase 4 mastery data uses recency-weighted accuracy which doesn't map cleanly to FSRS difficulty. Seeding could cause incorrect scheduling. FSRS adapts quickly (2-3 reviews) anyway.
**Confidence:** MEDIUM -- FSRS documentation doesn't recommend external seeding.

### Full deck sync vs history-only sync
**Recommendation:** Full deck sync (all card FSRS states). The `srs_cards` table stores complete Card state per question. This is simpler and more reliable than event replay.
**Confidence:** HIGH -- event replay adds complexity with minimal benefit for 100 cards.

### Conflict resolution strategy
**Recommendation:** Last-write-wins based on `updated_at`. Use Supabase `upsert` with `onConflict: 'user_id,question_id'`. FSRS states are self-correcting, so even stale overwrites don't cause permanent damage.
**Confidence:** HIGH -- appropriate for single-user, small dataset.

### Sync conflict notification
**Recommendation:** Silent. No toast for sync conflicts. Show toast only for sync failures (network errors). Rationale: last-write-wins means conflicts are resolved automatically; notifying would only confuse users.
**Confidence:** HIGH.

### SRS works without login
**Recommendation:** YES -- SRS should work without login using local IndexedDB only. When user logs in, sync local deck to Supabase. This matches the app's offline-first philosophy and existing pattern (mastery data works without login via IndexedDB).
**Confidence:** HIGH -- consistent with project architecture.

### Heatmap day range
**Recommendation:** 60 days on desktop, 30 days on mobile (responsive). Each cell is a day, weeks as rows. At 30 days this is ~5 columns x 7 rows -- fits comfortably on mobile.
**Confidence:** MEDIUM -- depends on actual visual testing.

### Rating button placement
**Recommendation:** Below the flipped card, centered, with Easy on the right (green) and Hard on the left (orange). This matches the swipe direction semantics (right = Easy, left = Hard). Buttons should be full-width on mobile with minimum 44px touch targets.
**Confidence:** HIGH -- follows established mobile UX patterns.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SM-2 algorithm | FSRS v5/v6 | 2023-2024 | 30% fewer reviews for same retention; evidence-based optimization |
| 4-button grading (Again/Hard/Good/Easy) | Binary grading (pass/fail) | FSRS-6 | Research shows 2-button grading has minimal accuracy loss vs 4-button |
| framer-motion | motion/react | 2024 | Package renamed; import from 'motion/react' not 'framer-motion' |

**Deprecated/outdated:**
- `elapsed_days` field on Card: Deprecated in ts-fsrs v5.x. Still present for backward compatibility but should not be relied upon.
- SM-2 algorithm: Superseded by FSRS with significantly better scheduling accuracy.

## Open Questions

1. **Review log storage in Supabase**
   - What we know: ts-fsrs produces a `ReviewLog` for each grading event. This could be stored for analytics.
   - What's unclear: Whether we need a separate `srs_review_logs` table or if the current card state is sufficient.
   - Recommendation: Start without review log storage. The card state captures everything needed for scheduling. Add review log table later if analytics are needed.

2. **Push notification trigger mechanism**
   - What we know: Phase 2 has push notification infrastructure with VAPID keys and service worker.
   - What's unclear: How to trigger "cards are due" notification at the user's preferred time. Needs a server-side cron or edge function to check due cards and send pushes.
   - Recommendation: Use Supabase Edge Function or a cron-triggered API route. Check `srs_cards` where `due <= now()` for each user with push subscription.

3. **Service worker cache for SRS data**
   - What we know: Serwist service worker is configured for PWA.
   - What's unclear: Whether SRS IndexedDB data needs additional service worker integration.
   - Recommendation: IndexedDB is already accessible offline without service worker caching. No additional SW config needed.

## Sources

### Primary (HIGH confidence)
- ts-fsrs v5.2.3 CDN type definitions (jsdelivr) -- full TypeScript API verified
- ts-fsrs GitHub README -- API examples, Card/Rating/State types
- Project codebase -- existing patterns for IndexedDB (offlineDb.ts, masteryStore.ts), Supabase (schema.sql, SupabaseAuthContext.tsx), swipe gestures (FlashcardStack.tsx), context providers (OfflineContext.tsx)

### Secondary (MEDIUM confidence)
- [ts-fsrs npm](https://www.npmjs.com/package/ts-fsrs) -- version 5.2.3, MIT license
- [ts-fsrs GitHub](https://github.com/open-spaced-repetition/ts-fsrs) -- official repository
- [Expertium FSRS Algorithm](https://expertium.github.io/Algorithm.html) -- FSRS binary grading research
- [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security) -- policy patterns
- [react-swipeable docs](https://nearform.com/open-source/react-swipeable/docs/api/) -- not recommended (use motion/react instead)

### Tertiary (LOW confidence)
- [Hacker News FSRS discussion](https://news.ycombinator.com/item?id=39002138) -- community validation
- [RemNote FSRS docs](https://help.remnote.com/en/articles/9124137-the-fsrs-spaced-repetition-algorithm) -- cross-validation of FSRS behavior

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - ts-fsrs is the established TS implementation of FSRS; all other deps already in project
- Architecture: HIGH - follows existing project patterns exactly (contexts, idb-keyval stores, Supabase tables)
- FSRS API: HIGH - type definitions verified from CDN; API examples from official README
- Pitfalls: HIGH - based on codebase analysis (React Compiler rules documented in MEMORY.md) and FSRS documentation
- Sync strategy: MEDIUM - last-write-wins is standard but untested in this specific app
- Heatmap: MEDIUM - CSS grid approach is straightforward but visual sizing needs testing

**Research date:** 2026-02-07
**Valid until:** 2026-03-07 (30 days -- ts-fsrs is stable, project patterns are established)
