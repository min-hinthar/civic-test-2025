# Phase 37: Bug Fixes & UX Polish - Research

**Researched:** 2026-02-21
**Domain:** React UX polish, bug investigation, CSS scroll patterns, TTS auto-play, IndexedDB bookmarks, SRS deck UX
**Confidence:** HIGH

## Summary

Phase 37 is a broad-scope polish and bug-fix phase spanning 7 major feature areas and 9 bug investigation domains. The codebase already has robust infrastructure for all required capabilities -- motion/react for animations, idb-keyval for persistence, ts-fsrs for SRS scheduling, established CSS animation patterns, and a mature TTS pipeline. No new dependencies are needed.

The key technical challenges are: (1) building a horizontal scrollable chip row with proper overflow indicators and accessibility, which is a pure CSS+React pattern using native `scroll-snap-type` and gradient fade masks; (2) implementing auto-play study mode by extending the existing `useAutoRead` hook pattern into a sequential card-advance loop; (3) adding bookmark persistence via a new idb-keyval store following the exact same pattern as `srsStore.ts`; and (4) systematic bug investigation across 9 domains requiring code-reading and Playwright-based testing rather than library research.

**Primary recommendation:** Use existing project patterns exclusively -- no new libraries. Extend idb-keyval for bookmarks, CSS scroll-snap for chips, motion/react springs for animations, and the existing useAutoRead hook pattern for auto-play.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Cards in Review Deck are clickable -- tapping navigates to flashcard view for that question
- TTS speak button available only in flashcard view, not on review deck list cards
- Progress bar + card count at top of review deck: "5/12 reviewed" with fill animation
- Spacious card design with question preview, category badge, and difficulty indicator
- Category dropdown filter to focus on specific topics in review deck
- Empty state: celebration message with confetti + "All caught up! Next review in X hours"
- Due card surfacing: badge on nav item + banner on dashboard
- Spring physics for card transition animations
- Replace "All Categories" dropdown with horizontal scrollable chip/pill row
- Each chip has: icon, accent color per category, and question count badge
- Category chips have subtitle text: "American Government -- Branches, Constitution"
- Card counter at top: "3 of 20" with left/right arrow navigation + progress bar below
- Shuffle button + sort options (difficulty, category order, alphabetical)
- Search box above cards to filter questions by text within selected category
- Bookmark/star toggle on individual flashcards for quick access later
- Card back shows everything: answer, explanation, category, difficulty, mastery level
- Auto-play study mode: hands-free study with TTS and auto-advance
- About link in navbar between language toggle and theme toggle
- About icon: outline to filled transition for active state
- Landing page About card: persistent subtle animation (shimmer/gradient shift/floating)
- Study Guide Browse: category cards not displaying (fix)
- Interview Real mode: should NOT show answers
- Interview Practice mode: should show actual answer (not just self-grade)

### Claude's Discretion
- Review deck: hover/tap feedback style, clickable indicator design, card ordering
- Review deck: post-session summary level, keyboard shortcuts, mobile gestures
- Review deck: bilingual display, accessibility patterns, session flow
- Review deck: SRS rating button design matching ts-fsrs
- Flashcard chips: horizontal scroll vs wrap based on category count and viewport
- Flashcard: active chip styling, category transition, multi-select behavior
- Flashcard: per-category progress display, card size/responsive sizing
- Flashcard: flip animation speed, swipe gesture support, auto-play flow design
- Flashcard: mastery level visual indicator design
- About: micro-interaction for navbar icon, page transition style
- About: back navigation pattern, first-time user hint
- About: landing page card prominence design
- Performance: scope of optimization work appropriate for bug fix phase

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope. Auto-play mode and bookmark/star features confirmed as in-scope UX polish.
</user_constraints>

## Standard Stack

### Core (already installed -- NO new dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion | ^12.33.0 | Spring animations, AnimatePresence, drag gestures | Already used in 30+ components; SPRING_BOUNCY/SNAPPY/GENTLE configs established |
| idb-keyval | ^6.2.2 | IndexedDB key-value storage for bookmarks | Already used for SRS deck and mastery data; 295 bytes brotli'd |
| ts-fsrs | ^5.2.3 | FSRS spaced repetition scheduling | Already integrated via SRSContext; Card type, Rating enum, `repeat()`/`next()` API |
| lucide-react | ^0.475.0 | Icons (Heart/HeartFilled, Star, Bookmark, etc.) | Already used across all components |
| clsx | ^2.1.1 | Conditional class composition | Already used in every component |
| @radix-ui/react-progress | ^1.1.8 | Accessible progress bar | Already used in ReviewSession |
| canvas-confetti | via react-canvas-confetti | Celebration confetti | Already integrated via CelebrationOverlay |

### Supporting (CSS-only, no libraries)
| Technology | Purpose | When to Use |
|------------|---------|-------------|
| CSS `scroll-snap-type: x mandatory` | Horizontal chip row scroll snap | Category chip scrollable row |
| CSS `mask-image: linear-gradient(...)` | Overflow fade indicators | Scroll edges on chip row |
| CSS `@keyframes shimmer` | Landing page About card animation | Already defined in animations.css |
| CSS `@keyframes floaty` | Subtle floating animation | Already defined in globals.css |
| CSS custom properties | All color values | Enforced by stylelint (no hex) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS scroll-snap | embla-carousel, swiper | Massive overkill for a simple chip row; adds bundle weight |
| idb-keyval bookmark store | localStorage | localStorage is sync/blocking, limited to 5MB, no structured data; idb-keyval already proven in project |
| New context for bookmarks | Extend SRSContext | Bookmarks are independent of SRS scheduling; separate store avoids coupling |
| JS-based shimmer | CSS-only shimmer | CSS `@keyframes shimmer` already exists in animations.css; GPU-composited; zero JS |

**Installation:** None required. All dependencies already installed.

## Architecture Patterns

### Recommended Project Structure (new files only)
```
src/
  lib/
    bookmarks/
      bookmarkStore.ts        # idb-keyval CRUD for bookmarks (follows srsStore.ts pattern)
      index.ts                # Re-exports
  hooks/
    useBookmarks.ts           # React hook wrapping bookmarkStore with optimistic state
    useAutoPlay.ts            # Auto-play study mode hook (extends useAutoRead pattern)
  components/
    study/
      CategoryChipRow.tsx     # Horizontal scrollable chip/pill row
      FlashcardToolbar.tsx    # Card counter, shuffle, sort, search, bookmark
      AutoPlayControls.tsx    # Play/pause/stop + speed controls for auto-play mode
    srs/
      ReviewDeckCard.tsx      # Clickable card for review deck list (navigates to flashcard)
      ReviewDeckList.tsx      # List of ReviewDeckCards with progress, filters, empty state
```

### Pattern 1: Bookmark Store (idb-keyval)
**What:** Persist bookmarked question IDs in IndexedDB using idb-keyval with a dedicated store, exactly mirroring the SRS store pattern.
**When to use:** Whenever a user toggles the star/bookmark on a flashcard.
**Example:**
```typescript
// Source: Existing pattern from src/lib/srs/srsStore.ts
import { createStore, get, set, del, keys } from 'idb-keyval';

const bookmarkDb = createStore('civic-prep-bookmarks', 'starred');

export async function isBookmarked(questionId: string): Promise<boolean> {
  const val = await get<boolean>(questionId, bookmarkDb);
  return val === true;
}

export async function setBookmark(questionId: string, starred: boolean): Promise<void> {
  if (starred) {
    await set(questionId, true, bookmarkDb);
  } else {
    await del(questionId, bookmarkDb);
  }
}

export async function getAllBookmarks(): Promise<string[]> {
  const allKeys = await keys(bookmarkDb);
  return allKeys as string[];
}
```

### Pattern 2: Horizontal Scrollable Chip Row
**What:** Replace the `<select>` dropdown with a horizontal scrollable row of category chips using CSS scroll-snap, with overflow fade indicators.
**When to use:** Category filter in FlashcardStack view.
**Example:**
```typescript
// Source: CSS scroll-snap MDN docs + existing useScrollSnapCenter pattern
// Container styles:
const chipContainerClasses = clsx(
  'flex gap-2 overflow-x-auto scrollbar-hide',
  'snap-x snap-mandatory',
  'px-4 py-2',
  // Fade masks for overflow indicators
  '[mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)]'
);

// Individual chip:
const chipClasses = clsx(
  'snap-start shrink-0',
  'flex items-center gap-2 px-4 py-2 rounded-full',
  'min-h-[44px]', // Touch target
  'border transition-colors',
  isActive
    ? 'bg-primary/10 border-primary text-primary'
    : 'bg-card border-border/60 text-muted-foreground hover:bg-muted/50'
);
```

### Pattern 3: Auto-Play Study Mode
**What:** Sequential TTS playback with auto-advance through flashcards. Reads question, pauses, reads answer, pauses, advances to next card.
**When to use:** Hands-free study mode activated by user toggle.
**Example:**
```typescript
// Source: Extending existing useAutoRead pattern
// The auto-play loop:
// 1. Read question text (English MP3 or TTS fallback)
// 2. Wait configurable pause (default 2s)
// 3. Flip card to answer
// 4. Read answer text
// 5. Wait configurable pause (default 3s)
// 6. Advance to next card
// 7. Loop until paused or end of deck
//
// Key: Use closure-local `let cancelled = false` for effect cleanup (per CLAUDE.md)
// Key: Must handle user pause/resume without race conditions
// Key: Must stop when reaching end of filtered question set
```

### Pattern 4: Landing Page Card Animation (CSS-only)
**What:** Persistent subtle animation on the About teaser card using existing CSS keyframes.
**When to use:** About "Built with Heart" card on landing page.
**Example:**
```css
/* Combine existing floaty + shimmer for subtle persistent animation */
/* Source: Already defined in globals.css and animations.css */
.about-card-animated {
  animation: floaty 6s ease-in-out infinite;
  position: relative;
}

.about-card-animated::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    90deg,
    transparent 0%,
    hsl(var(--primary) / 0.05) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 3s infinite;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .about-card-animated {
    animation: none;
  }
  .about-card-animated::after {
    animation: none;
  }
}
```

### Pattern 5: About Link in Navbar
**What:** Add About icon (Heart outline/filled) to both Sidebar and BottomTabBar, positioned between language toggle and theme toggle.
**When to use:** App-wide navbar, visible on all authenticated routes.
**Example:**
```typescript
// Source: Existing BottomTabBar.tsx pattern
// Insert BEFORE theme toggle in the utility controls section:
// - Use Heart (outline) icon from lucide-react
// - When on /about route, switch to filled heart or primary color
// - Navigate to /about on click
// - Remove /about from HIDDEN_ROUTES in navConfig.ts (so nav shows on About page)
//   OR keep About in HIDDEN_ROUTES and add the icon as a utility control (not a tab)
```

### Anti-Patterns to Avoid
- **setState in effects**: React Compiler ESLint rule prohibits this. Use `useMemo` for derived state.
- **ref.current during render**: Only access refs in effects/handlers, never during render body.
- **useMemo<T>() generic**: Breaks React Compiler. Use `const x: T = useMemo(...)` instead.
- **backdrop-filter in preserve-3d**: Breaks 3D transforms on mobile. Already documented in CLAUDE.md.
- **New Audio() per play**: Mobile autoplay requires element reuse from gesture-blessed pool. Use existing `createAudioPlayer()` pattern.
- **Adding context providers for bookmarks**: Overkill. A simple hook wrapping idb-keyval with useState is sufficient. No need to add to the provider tree.
- **Synchronous IndexedDB access**: idb-keyval is always async. Load bookmarks in useEffect, use optimistic state updates for instant UI feedback.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bookmark persistence | Custom IndexedDB wrapper | idb-keyval `createStore` + `get`/`set`/`del`/`keys` | 295 bytes, battle-tested, already used for SRS |
| Horizontal scroll snap | Custom JS scroll handler | CSS `scroll-snap-type: x mandatory` + `snap-start` | Native browser behavior, zero JS, smooth on mobile |
| Overflow indicators | JS IntersectionObserver for edges | CSS `mask-image: linear-gradient(...)` | Pure CSS, GPU-composited, no JS event listeners |
| Spring animations | Custom spring math | motion/react `SPRING_BOUNCY`/`SPRING_SNAPPY`/`SPRING_GENTLE` | Already calibrated for project's "bouncy + playful" personality |
| Card flip animation | CSS transform manually | Existing `Flashcard3D` component | Handles 3D transforms, backface-visibility, reduced motion, mobile quirks |
| Shimmer animation | JS-based gradient animation | CSS `@keyframes shimmer` (already in animations.css) | GPU-accelerated, respects prefers-reduced-motion, zero JS |
| Confetti celebration | Custom particle system | Existing `CelebrationOverlay` + canvas-confetti | Already integrated with haptics, sound, and achievement scaling |
| SRS scheduling | Custom interval algorithm | ts-fsrs `repeat()`/`next()` via SRSContext | FSRS v5 algorithm, proven in production |
| Audio playback | `new Audio()` per play | `createAudioPlayer()` from `audioPlayer.ts` | Handles mobile autoplay restrictions, gesture blessing, persistent element reuse |

**Key insight:** This phase is about combining and polishing existing primitives, not building new infrastructure. Every animation, persistence, and audio pattern already exists in the codebase.

## Common Pitfalls

### Pitfall 1: Scroll Snap Touch Interference with Drag Gestures
**What goes wrong:** Horizontal scroll-snap on the chip row can interfere with the FlashcardStack's horizontal drag-to-swipe gesture.
**Why it happens:** Both compete for horizontal touch events. The chip row is above the card, but on mobile, touch event bubbling can cause conflicts.
**How to avoid:** Ensure the chip row and card stack are in separate touch target areas with adequate vertical separation (at least 16px gap). The chip row should have `touch-action: pan-x` and the card stack already has `drag="x"` which motion/react handles.
**Warning signs:** Cards start swiping when user tries to scroll chips, or vice versa.

### Pitfall 2: Auto-Play Effect Cleanup Race Conditions
**What goes wrong:** Multiple overlapping TTS utterances or skipped cards when user rapidly toggles auto-play on/off.
**Why it happens:** Effects don't clean up fast enough; the previous effect's async chain continues after a new one starts.
**How to avoid:** Use closure-local `let cancelled = false` pattern (documented in CLAUDE.md). Cancel all audio players in cleanup. Reset state synchronously on pause.
**Warning signs:** Audio from previous card plays over current card's audio.

### Pitfall 3: Bookmark State Stale After IndexedDB Load
**What goes wrong:** Bookmark toggle appears unresponsive because UI waits for async IndexedDB read before showing toggled state.
**Why it happens:** idb-keyval operations are async; component re-renders only after promise resolves.
**How to avoid:** Use optimistic state updates. Toggle the in-memory state immediately on click, then persist to IndexedDB in the background. If the write fails, revert the optimistic state.
**Warning signs:** 100-200ms delay between tap and star icon changing.

### Pitfall 4: Interview Feedback Bug -- Incorrect Answer Visibility
**What goes wrong:** Real mode shows answers (should not), Practice mode only shows self-grade (should show answer).
**Why it happens:** The FEEDBACK effect in InterviewSession.tsx (line 883-939) correctly branches on `mode === 'practice'` vs realistic. The bug may be in the InterviewResults transcript view or self-grade flow, not the live feedback. Investigation needed.
**How to avoid:** Trace the full data flow: (1) during-session feedback messages, (2) results page transcript, (3) self-grade fallback path. Check if `getCorrectFeedback()`/`getIncorrectFeedback()` text strings inadvertently include answer text.
**Warning signs:** Answer text appears in chat bubbles during realistic mode interview.

### Pitfall 5: Category Chips Overflow on Small Screens
**What goes wrong:** Category names are long ("American History: Colonial Period and Independence"), making chips very wide. On small phones (<375px), even one chip may not fit.
**Why it happens:** Long category names + subtitle text + icon + badge = wide chips.
**How to avoid:** Use abbreviated category names for chips (e.g., "Colonial Period" instead of full name). Set `max-width` on chips with text truncation. The subtitle should be on a second line, not inline.
**Warning signs:** Chip row doesn't scroll, or individual chips extend beyond viewport.

### Pitfall 6: About Link Navigation Conflicts with HIDDEN_ROUTES
**What goes wrong:** Adding About link to navbar but `/about` is in `HIDDEN_ROUTES`, so navigating there hides the nav, making it hard to get back.
**Why it happens:** `navConfig.ts` line 122-129 lists `/about` in `HIDDEN_ROUTES`, which means Sidebar and BottomTabBar don't render on that route.
**How to avoid:** Either (a) remove `/about` from `HIDDEN_ROUTES` so nav stays visible when viewing About page, or (b) keep About as a utility icon in the nav (like theme toggle) rather than a tab, and ensure About page has its own back button. Option (a) is simpler and matches user expectation ("navbar link").
**Warning signs:** User navigates to About and has no way back except browser back button.

### Pitfall 7: CSS Shimmer Performance on Older Devices
**What goes wrong:** Persistent CSS animation causes jank on low-end Android devices.
**Why it happens:** `background-position` animation is not composited by default; it triggers paint on every frame.
**How to avoid:** Use `will-change: background-position` or prefer `transform`-based animations. The existing shimmer keyframes in animations.css use `background-position` but run at 1.5s duration which is fast enough to avoid visible jank. For the About card, use a 3-4s duration for subtlety. Always include `@media (prefers-reduced-motion: reduce)` fallback.
**Warning signs:** FPS drops visible in Chrome DevTools Performance panel during animation.

### Pitfall 8: Due Card Badge Count Mismatch
**What goes wrong:** Nav badge shows different due count than Review Deck view.
**Why it happens:** SRSContext computes `dueCount` from in-memory deck. If deck is stale (loaded on mount, not refreshed), the count can diverge from actual IndexedDB state.
**How to avoid:** Use SRSContext's `refreshDeck()` on ReviewDeck mount and on visibility change. The existing visibility listener in SRSContext should handle this, but verify it's working.
**Warning signs:** Badge shows "5 due" but Review Deck shows "3 due" or vice versa.

## Code Examples

### Horizontal Scrollable Chip Row with Fade Masks
```typescript
// Source: CSS scroll-snap MDN + project patterns
import { useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import clsx from 'clsx';
import { SPRING_SNAPPY } from '@/lib/motion-config';

interface CategoryChip {
  id: string;
  label: string;
  labelMy?: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  accentColor: string; // Tailwind bg class
}

interface CategoryChipRowProps {
  chips: CategoryChip[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  showBurmese: boolean;
}

export function CategoryChipRow({ chips, activeId, onSelect, showBurmese }: CategoryChipRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback((id: string) => {
    onSelect(activeId === id ? null : id); // Toggle: tap same chip deselects
  }, [activeId, onSelect]);

  return (
    <div
      ref={scrollRef}
      className={clsx(
        'flex gap-2 overflow-x-auto scrollbar-hide py-2 px-1',
        'snap-x snap-mandatory',
        // Fade masks: 16px fade on each edge
        '[mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)]'
      )}
      role="listbox"
      aria-label="Category filter"
    >
      {/* "All" chip */}
      <button
        role="option"
        aria-selected={activeId === null}
        onClick={() => onSelect(null)}
        className={clsx(
          'snap-start shrink-0 flex items-center gap-2 px-4 py-2 rounded-full',
          'min-h-[44px] font-medium text-sm transition-colors',
          'border',
          activeId === null
            ? 'bg-primary/10 border-primary text-primary'
            : 'bg-card border-border/60 text-muted-foreground hover:bg-muted/50'
        )}
      >
        All ({chips.reduce((sum, c) => sum + c.count, 0)})
      </button>

      {chips.map(chip => {
        const isActive = activeId === chip.id;
        const Icon = chip.icon;
        return (
          <motion.button
            key={chip.id}
            role="option"
            aria-selected={isActive}
            onClick={() => handleSelect(chip.id)}
            whileTap={{ scale: 0.97 }}
            transition={SPRING_SNAPPY}
            className={clsx(
              'snap-start shrink-0 flex flex-col items-start gap-0.5 px-4 py-2 rounded-2xl',
              'min-h-[44px] text-sm transition-colors',
              'border',
              isActive
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-card border-border/60 text-muted-foreground hover:bg-muted/50'
            )}
          >
            <span className="flex items-center gap-1.5">
              <Icon className="h-4 w-4" />
              <span className="font-medium whitespace-nowrap">{chip.label}</span>
              <span className={clsx(
                'inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-xs font-bold',
                isActive ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              )}>
                {chip.count}
              </span>
            </span>
            {showBurmese && chip.labelMy && (
              <span className="font-myanmar text-xs text-muted-foreground whitespace-nowrap">
                {chip.labelMy}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
```

### Bookmark Toggle with Optimistic State
```typescript
// Source: idb-keyval pattern from srsStore.ts
import { useState, useEffect, useCallback } from 'react';
import { createStore, get, set, del, keys } from 'idb-keyval';

const bookmarkDb = createStore('civic-prep-bookmarks', 'starred');

export function useBookmarks() {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load all bookmarks on mount
  useEffect(() => {
    let cancelled = false;
    keys(bookmarkDb).then(allKeys => {
      if (!cancelled) {
        setBookmarkedIds(new Set(allKeys as string[]));
        setIsLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const toggleBookmark = useCallback(async (questionId: string) => {
    const isCurrentlyBookmarked = bookmarkedIds.has(questionId);

    // Optimistic update
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (isCurrentlyBookmarked) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });

    // Persist to IndexedDB
    try {
      if (isCurrentlyBookmarked) {
        await del(questionId, bookmarkDb);
      } else {
        await set(questionId, true, bookmarkDb);
      }
    } catch {
      // Revert optimistic update on failure
      setBookmarkedIds(prev => {
        const next = new Set(prev);
        if (isCurrentlyBookmarked) {
          next.add(questionId);
        } else {
          next.delete(questionId);
        }
        return next;
      });
    }
  }, [bookmarkedIds]);

  const isBookmarked = useCallback(
    (questionId: string) => bookmarkedIds.has(questionId),
    [bookmarkedIds]
  );

  return { isBookmarked, toggleBookmark, bookmarkedIds, isLoading };
}
```

### Auto-Play Hook Pattern
```typescript
// Source: Extending useAutoRead pattern from src/hooks/useAutoRead.ts
import { useEffect, useRef, useCallback, useState } from 'react';
import { createAudioPlayer, getEnglishAudioUrl, getBurmeseAudioUrl } from '@/lib/audio/audioPlayer';
import { useTTS } from './useTTS';

interface UseAutoPlayOptions {
  questions: Question[];
  currentIndex: number;
  onAdvance: () => void;
  onFlip: (flipped: boolean) => void;
  enabled: boolean;
  pauseBetweenSides?: number; // ms, default 2000
  pauseBetweenCards?: number; // ms, default 3000
}

export function useAutoPlay(options: UseAutoPlayOptions) {
  const { questions, currentIndex, onAdvance, onFlip, enabled,
    pauseBetweenSides = 2000, pauseBetweenCards = 3000 } = options;
  const { speak, cancel } = useTTS();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!enabled || !isPlaying) return;
    let cancelled = false;

    const q = questions[currentIndex];
    if (!q) { setIsPlaying(false); return; }

    const run = async () => {
      // 1. Show question side
      onFlip(false);
      await new Promise(r => setTimeout(r, 500));
      if (cancelled) return;

      // 2. Read question
      try {
        const player = createAudioPlayer();
        await player.play(getEnglishAudioUrl(q.id, 'q'));
      } catch {
        await speak(q.question_en).catch(() => {});
      }
      if (cancelled) return;

      // 3. Pause, then flip to answer
      await new Promise(r => setTimeout(r, pauseBetweenSides));
      if (cancelled) return;
      onFlip(true);

      // 4. Read answer
      const answerText = q.studyAnswers.map(a => a.text_en).join('. ');
      try {
        const player = createAudioPlayer();
        await player.play(getEnglishAudioUrl(q.id, 'a'));
      } catch {
        await speak(answerText).catch(() => {});
      }
      if (cancelled) return;

      // 5. Pause, then advance
      await new Promise(r => setTimeout(r, pauseBetweenCards));
      if (cancelled) return;

      if (currentIndex < questions.length - 1) {
        onAdvance();
      } else {
        setIsPlaying(false); // End of deck
      }
    };

    run();

    return () => {
      cancelled = true;
      cancel();
    };
  }, [enabled, isPlaying, currentIndex]); // Re-run when card advances

  return {
    isPlaying,
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    toggle: () => setIsPlaying(prev => !prev),
  };
}
```

### Review Deck Clickable Card
```typescript
// Source: Existing Card component + DeckManager pattern
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import clsx from 'clsx';
import { SPRING_BOUNCY } from '@/lib/motion-config';
import { Card } from '@/components/ui/Card';

interface ReviewDeckCardProps {
  questionId: string;
  questionText: string;
  category: string;
  categoryColor: string;
  isDue: boolean;
  difficulty: number;
}

export function ReviewDeckCard({
  questionId, questionText, category, categoryColor, isDue, difficulty
}: ReviewDeckCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      transition={SPRING_BOUNCY}
    >
      <Card
        interactive
        onClick={() => navigate(`/study#cards-${encodeURIComponent(category)}`)}
        className={clsx(
          'p-0 overflow-hidden cursor-pointer',
          isDue && 'ring-2 ring-warning/50'
        )}
      >
        <div className={clsx('h-[4px] w-full', categoryColor)} />
        <div className="p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {category}
            </span>
            {isDue && (
              <span className="text-xs font-bold text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                Due
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-foreground line-clamp-2">{questionText}</p>
        </div>
      </Card>
    </motion.div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `<select>` dropdown for category filter | Horizontal scrollable chip row with scroll-snap | CSS scroll-snap well-supported since 2020 | Better touch UX, visual hierarchy, multi-select possible |
| JS-based scroll indicators | CSS `mask-image` gradient fade | Supported in all modern browsers | Zero JS, GPU-composited, no IntersectionObserver needed |
| Separate bookmark database | idb-keyval with dedicated store | idb-keyval v6 (current) | 295 bytes, structured clone, same pattern as SRS |
| `new Audio()` per play for TTS | Persistent AudioPlayer from gesture-blessed pool | Project convention since Phase 22 | Required for mobile autoplay compliance |
| `framer-motion` | `motion/react` v12 | Renamed in 2024 | Same API, smaller bundle, this project already uses v12 |

**Deprecated/outdated:**
- `framer-motion` import path: Project uses `motion/react` (the renamed package). Never import from `framer-motion`.
- `useRef` for render-time values: React Compiler requires `useState` with lazy init instead.
- Hex color values: Stylelint enforces CSS custom properties only.

## Bug Investigation Strategy

### Known Bugs (from CONTEXT.md)

| Bug | Component File | Investigation Approach |
|-----|---------------|----------------------|
| Study Guide Browse: category cards not displaying | `StudyGuidePage.tsx` | Check hash routing logic (line 82-90), verify `questionCategories` memo computes correctly, check if `getSubCategoryColors` import chain is broken |
| Interview Real mode shows answers | `InterviewSession.tsx` lines 883-939 | Trace the feedback effect. Code shows correct branching (`mode === 'practice'`). Check if bug is in InterviewResults transcript, not live session. Check `getCorrectFeedback()`/`getIncorrectFeedback()` return values |
| Interview Practice mode missing answers | `InterviewSession.tsx` line 884-900 | Verify `primaryAnswer` is not empty. Check if `studyAnswers[0]` is populated. May be a data issue with specific questions |

### Investigation Domains

| Domain | What to Check | Key Files |
|--------|--------------|-----------|
| TTS/audio | Chrome 15s cutoff, Safari cancel errors, Firefox race conditions, Android pause breakage | `ttsCore.ts`, `useTTS.ts`, `useAutoRead.ts` |
| Offline/sync | Sync queue flush timing, conflict resolution, data loss on multi-device | `syncQueue.ts`, `srsSync.ts`, `OfflineContext.tsx` |
| SRS algorithm | FSRS parameters, interval calculation, `isDue()` logic, timezone handling | `fsrsEngine.ts`, `SRSContext.tsx`, `useSRSReview.ts` |
| Leaderboard | Score submission, ranking refresh, anonymous/auth edge cases | `src/lib/social/`, `SocialContext.tsx` |
| PWA | Service worker registration, cache invalidation, install prompt | `sw.ts`, `@serwist/next` config |
| Responsive | <375px viewport, safe area insets, overflow hidden issues | Global layout components |
| Toasts | Position, z-index, swipe-to-dismiss, bilingual content | `BilingualToast.tsx`, `ToastProvider` |
| Error boundaries | Uncaught promise rejections, render errors, recovery | `ErrorBoundary.tsx` |
| Performance | Bundle size, re-render frequency, animation jank | Chrome DevTools profiling |

## Open Questions

1. **Study Guide Browse Bug Root Cause**
   - What we know: Category cards recently broke. The component at `StudyGuidePage.tsx` renders categories in a `StaggeredList` grid. The category data comes from `allQuestions` memo.
   - What's unclear: Whether the bug is a render issue (categories compute but don't display) or a data issue (categories array is empty). Need to run the app and inspect.
   - Recommendation: First reproduce in dev server, then check React DevTools for component state.

2. **Interview Answer Visibility Bug Scope**
   - What we know: InterviewSession.tsx has correct mode-branching in the FEEDBACK effect. Practice mode constructs `feedbackText` with answer. Realistic mode only shows `feedback.text`.
   - What's unclear: Whether the reported bug is during the live session or on the results/transcript page. The `InterviewTranscript` component receives `mode` but uses `_mode` (unused).
   - Recommendation: Test both modes end-to-end. The transcript view may show answers for both modes regardless of mode.

3. **Bookmark Sync to Supabase**
   - What we know: Bookmarks will use idb-keyval for local persistence. SRS data syncs to Supabase via `srsSync.ts`.
   - What's unclear: Whether bookmarks should also sync to Supabase (across devices) or remain local-only.
   - Recommendation: Start local-only (matching the phase scope of "UX polish"). Supabase sync for bookmarks can be a future enhancement.

## Sources

### Primary (HIGH confidence)
- `/websites/motion_dev_react` (Context7) - AnimatePresence, spring configs, drag gestures, scroll animations
- `/open-spaced-repetition/ts-fsrs` (Context7) - FSRS Card type, Rating enum, `repeat()`/`next()` scheduling API, State enum
- `/jakearchibald/idb-keyval` (Context7) - createStore, get/set/del/keys API, custom store pattern
- Existing codebase files: `srsStore.ts`, `useAutoRead.ts`, `motion-config.ts`, `animations.css`, `globals.css`, `navConfig.ts`

### Secondary (MEDIUM confidence)
- [CSS scroll-snap MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll_snap) - scroll-snap-type, scroll-snap-align, basic concepts
- [CSS Scroll Snap by Ahmad Shadeed](https://ishadeed.com/article/css-scroll-snap/) - Horizontal scroll patterns, overflow indicators
- [JetRockets: CSS Scroll Snap for Tabs](https://ventures.jetrockets.com/blog/css-scroll-snap-for-horizontal-tabs-navigation) - Mobile-friendly horizontal tabs with snap
- [GeeksforGeeks: Shimmer Effect CSS](https://www.geeksforgeeks.org/css/shimmer-effect-using-css/) - Background-position shimmer pattern
- [FreeFrontend: CSS Shimmer Effects](https://freefrontend.com/css-shimmer/) - GPU-accelerated shimmer patterns

### Tertiary (LOW confidence)
- Anki-Android Issue #14681 - Auto-advance + TTS timing conflicts (community pattern, not directly applicable to web)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and proven in codebase; no new dependencies needed
- Architecture: HIGH - All patterns extend existing project conventions (idb-keyval stores, motion/react springs, CSS keyframes, useAutoRead hook)
- Pitfalls: HIGH - Most pitfalls documented in CLAUDE.md project memory; interview bug requires runtime investigation
- Bug investigation: MEDIUM - Root causes hypothesized from code reading but need runtime verification

**Research date:** 2026-02-21
**Valid until:** 2026-03-21 (stable -- no fast-moving dependencies)
