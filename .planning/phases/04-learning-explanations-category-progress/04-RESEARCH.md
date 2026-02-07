# Phase 4: Learning - Explanations & Category Progress - Research

**Researched:** 2026-02-06
**Domain:** Educational quiz explanations, mastery tracking, progress visualization
**Confidence:** HIGH (leverages existing codebase patterns extensively)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Explanation Content & Format
- **Detail level:** Brief (2-3 sentences) per explanation
- **Bilingual layout:** Stacked - English on top, Burmese below (consistent with existing BilingualText pattern)
- **Tone:** Friendly & simple - plain language, like a helpful tutor explaining to a friend
- **Source citations:** Only for constitutional questions (cite specific articles/amendments); skip for general knowledge
- **Translation approach:** Natural Burmese rephrasing (meaning-equivalent, not word-for-word)
- **Content generation:** AI-generated then reviewed - cross-reference with USCIS materials, flag uncertain ones for manual review
- **Offline support:** Explanations cached with questions in IndexedDB for offline access
- **Accessibility:** Extra focus on readability - larger text options, adjustable font size, high contrast mode for explanation content

#### Explanation Presentation in Test Mode
- **Timing:** Both - brief hint after each question AND full review screen at end
- **Brief hint style:** Small expandable card - collapsed by default with "Why?" link, expands to show the brief explanation
- **Correct vs wrong answers:** Extra context for wrong answers - "Common mistake" note explaining why the wrong choice is wrong
- **Review screen structure:** Default to showing only incorrect questions, with option to see all
- **Wrong answer display:** Show both - "You answered: X" and "Correct answer: Y" on review screen

#### Explanation Enhancements
- **Memory aids / mnemonics:** Include where natural - only when there's a genuinely helpful mnemonic, skip when forced. Bilingual (EN + MY, with potentially different mnemonics per language)
- **Visual aids:** Claude's discretion - pick appropriate visual treatment per explanation (icons, emoji, simple illustrations)
- **Related questions:** "See also" section at bottom of explanation linking to related questions - links expand inline (stay in current view)
- **Fun facts:** Include where relevant - brief cultural connection or fun fact when it makes content more memorable

#### Study Guide Flashcard Explanations
- **Placement:** Expandable below answer - answer shows first, tap to expand explanation (less visual clutter)

#### Category Progress Visualization
- **Location:** Both - compact summary on dashboard + detailed dedicated progress page
- **Visual style:** Animated, stylized hybrid - Duolingo-style inspiration
  - Main ring (radial) per USCIS category with sub-category horizontal progress bars within
  - Staggered card entrance + animated progress fill on dashboard load
  - Distinct color per category (e.g., blue for Government, amber for History, green for Civics)
- **Categories:** USCIS official 3 main categories (American Government, American History, Integrated Civics) with sub-categories
- **Mastery calculation:** Recent accuracy weighted - recent answers weigh more than old ones
- **Dashboard display:** Collapsible "Category Progress" section with compact grid of all categories
- **Progress page:**
  - Prominent overall readiness score at top
  - Expandable to individual questions within each category
  - Question rows show: question text + historical accuracy percentage (e.g., "3/5 correct (60%)")
  - Line chart showing mastery trend over time
  - Accessible from dashboard link (not bottom nav tab)

#### Mastery Milestones & Celebrations
- **Badge evolution:** Bronze (50%) -> Silver (75%) -> Gold (100%) per category
- **Celebration intensity scales by milestone:**
  - 50%: Subtle sparkle + encouraging bilingual message
  - 75%: Confetti animation + congratulatory message
  - 100%: Big celebration + crown/star badge + gold card treatment
- **100% mastery:** Both badge + gold card - permanent crown/star badge on category + gold card treatment

#### Category Practice Flow
- **Entry points:** Both - from progress page ("Practice this category" button with mastery stats) AND from test start screen (category filter with mini progress indicators per category)
- **Question count:** User chooses via segmented control / pills: Quick (5), Standard (10), Full (all)
- **Timer:** Optional - off by default, can be turned on for test simulation
- **Question order:** Smart mix - 70% weak questions / 30% strong questions
- **Sub-category practice:** Available - can practice sub-categories within the 3 main USCIS categories
- **Multi-category selection:** Claude's discretion
- **"Practice All Weak Areas":** Yes - one-tap option to practice questions across all weak categories mixed together
- **Results tracking:** Practice sessions tracked in separate "Practice Sessions" tab on history page (not mixed with regular tests)
- **Mastery tracking:** Claude's discretion on how practice results feed into mastery calculation
- **Post-session display:** Score + review + animated mastery update (single ring filling from old to new percentage with number counting up)
- **Explanation behavior:** Same as test mode - brief expandable hint after each answer, full review at end
- **No retry option** after finishing a practice session
- **Mastered category handling:** Suggest weaker categories - "This is mastered! Want to practice [weakest category] instead?" with option to proceed anyway
- **CTA context:** "Practice this category" button shows current mastery % + improvement potential

#### Weak Area Detection & Nudges
- **Dashboard placement:** Dedicated "Suggested Focus" section with weak areas + quick-start buttons
  - Each weak category shows: mastery % + "Practice Now" button + "Review in Study Guide" link
  - When all categories above threshold: "Level up" mode - show category closest to next milestone
- **Nudge tone:** Encouraging with emoji - warm, supportive, like a study buddy
- **Message variety:** Rotate through different encouraging phrases and emoji to feel fresh
- **Nudge locations:** Dashboard + post-test results + study guide highlighted sections
- **Smart rotation:** Yes - vary suggestions, prioritize stale categories (not practiced recently) even if not absolute weakest
- **Study guide highlighting:** Both - category headers show mastery badges + individual wrong-answer questions marked (orange dot or similar)
- **Unattempted vs weak:** Distinct treatment - "Not started" for unattempted categories vs mastery % for attempted ones, with different nudge messages
- **All content bilingual:** All nudge messages, encouragement, CTAs in both English and Burmese

#### Push Notification Nudges
- **Enabled:** Yes, if user has push notifications enabled (uses existing Phase 2 push infrastructure)
- **Frequency:** Every 2-3 days, only if user hasn't studied recently
- **Content:** Target weak/stale areas - "You haven't practiced [category] in [X] days"

### Claude's Discretion
- Explanation data structure (same file as questions vs separate files)
- Exact visual aid treatment per explanation
- Multi-category practice selection UX
- How practice results affect mastery calculation
- Post-test weak area nudge placement
- Question mark persistence behavior in study guide
- Weakness threshold value
- Readiness score connection between dashboard and progress page
- Category color assignments

### Deferred Ideas (OUT OF SCOPE)
None - discussion stayed within phase scope
</user_constraints>

---

## Summary

Phase 4 builds the learning intelligence layer: bilingual explanations that help users understand why answers are correct, and per-category mastery tracking that enables focused practice on weak areas. This phase transforms the app from a simple quiz tool into a smart study companion.

The implementation leverages extensive existing infrastructure: the `BilingualText` pattern for stacked EN/MY layout, `motion` for animations, `recharts` for trend visualization, `react-canvas-confetti` for celebrations, and `idb-keyval` for IndexedDB storage. The core technical challenges are:
1. Designing an explanation data structure that supports offline caching and bilingual content
2. Implementing recency-weighted mastery calculation
3. Building animated radial progress components for category visualization
4. Creating the category practice flow with smart question selection

**Primary recommendation:** Extend the existing `Question` type to include optional `explanation` fields, use SVG-based radial progress components (either custom or `react-circular-progressbar`), and compute mastery scores using exponential decay weighting of recent answers.

---

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion | 12.33.0 | Animations | Already used for page transitions, springs, stagger. Use for progress fill animations |
| recharts | 3.4.1 | Charts | Already used in HistoryPage for score trends. Use for mastery trend line charts |
| react-canvas-confetti | 2.0.7 | Celebrations | Already used for test completion. Use for milestone celebrations |
| idb-keyval | 6.2.2 | IndexedDB | Already used for offline questions. Extend for explanations + mastery data |
| lucide-react | 0.475.0 | Icons | Already used throughout. Use for badges, visual aids |
| clsx | 2.1.1 | Class utilities | Already used throughout |

### New Dependencies
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-circular-progressbar | 2.1.0 | Radial progress | Duolingo-style category rings. Alternative: custom SVG |

**Installation:**
```bash
pnpm add react-circular-progressbar
```

**Note:** `react-circular-progressbar` is optional. The existing `motion` library can animate custom SVG circles. Recommendation: try custom SVG first (more control, matches existing patterns), add library only if complexity warrants.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-circular-progressbar | Custom SVG + motion | Custom = more control, matches codebase; library = faster initial dev |
| SVG circles | Canvas | SVG is simpler, works with React patterns, canvas is overkill for this |
| IndexedDB mastery store | localStorage | IndexedDB already in use, handles larger data, structured storage |

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── explanations/           # NEW: Explanation-related components
│   │   ├── ExplanationCard.tsx       # Expandable explanation display
│   │   ├── WhyButton.tsx             # "Why?" trigger button
│   │   └── RelatedQuestions.tsx      # "See also" links
│   ├── progress/               # NEW: Progress visualization
│   │   ├── CategoryRing.tsx          # Single radial progress ring
│   │   ├── CategoryGrid.tsx          # Dashboard compact grid
│   │   ├── MasteryBadge.tsx          # Bronze/Silver/Gold badge
│   │   ├── MasteryMilestone.tsx      # Celebration modal
│   │   └── ProgressPage.tsx          # Dedicated progress page
│   ├── practice/               # NEW: Category practice mode
│   │   ├── PracticeConfig.tsx        # Category/count selection
│   │   ├── PracticeSession.tsx       # Practice test flow
│   │   └── PracticeResults.tsx       # Post-practice review
│   └── nudges/                 # NEW: Weak area suggestions
│       ├── SuggestedFocus.tsx        # Dashboard weak areas section
│       ├── WeakAreaNudge.tsx         # Individual nudge component
│       └── StudyGuideHighlight.tsx   # Question marking in study guide
├── constants/
│   └── explanations/           # NEW: Explanation content files
│       ├── american-government.ts
│       ├── american-history.ts
│       └── integrated-civics.ts
├── lib/
│   ├── mastery/                # NEW: Mastery calculation
│   │   ├── calculateMastery.ts       # Recency-weighted algorithm
│   │   ├── masteryStore.ts           # IndexedDB operations
│   │   └── weakAreaDetection.ts      # Identify weak categories
│   └── practice/               # NEW: Practice session logic
│       └── questionSelection.ts      # 70/30 weak/strong mix algorithm
├── pages/
│   └── ProgressPage.tsx        # NEW: Dedicated progress page
└── types/
    └── index.ts                # Extend with explanation types
```

### Pattern 1: Explanation Data Structure

**What:** Extend Question type with optional explanation fields; keep explanations in same files as questions for colocation and simpler caching.

**Why:**
- Single cache operation loads questions + explanations together
- Easier to maintain question-explanation pairs
- Aligns with existing question module structure (7 category files)

**Example:**
```typescript
// src/types/index.ts - extend existing types
export interface Explanation {
  brief_en: string;           // 2-3 sentence explanation
  brief_my: string;           // Natural Burmese equivalent
  mnemonic_en?: string;       // Optional memory aid (EN)
  mnemonic_my?: string;       // Optional memory aid (MY, may differ)
  citation?: string;          // Constitutional reference if applicable
  funFact_en?: string;        // Optional cultural connection
  funFact_my?: string;        // Fun fact in Burmese
  relatedQuestionIds?: string[];  // IDs for "See also" section
  commonMistake_en?: string;  // Why wrong answers are wrong
  commonMistake_my?: string;
}

export interface Question {
  id: string;
  question_en: string;
  question_my: string;
  category: Category;
  studyAnswers: StudyAnswer[];
  answers: Answer[];
  explanation?: Explanation;  // NEW: Optional for gradual rollout
}
```

### Pattern 2: Recency-Weighted Mastery Calculation

**What:** Calculate mastery using exponential decay weighting - recent answers matter more than old ones.

**Why:**
- Reflects current ability, not historical performance
- Motivates continued practice (old mastery fades)
- Standard pattern in spaced repetition systems

**Example:**
```typescript
// src/lib/mastery/calculateMastery.ts
interface AnswerRecord {
  questionId: string;
  isCorrect: boolean;
  timestamp: number;  // Unix timestamp
}

const DECAY_HALF_LIFE_DAYS = 14;  // Weight halves every 14 days

export function calculateCategoryMastery(
  answers: AnswerRecord[],
  questionIds: string[]
): number {
  const now = Date.now();
  let weightedCorrect = 0;
  let totalWeight = 0;

  for (const answer of answers) {
    if (!questionIds.includes(answer.questionId)) continue;

    const ageMs = now - answer.timestamp;
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    const weight = Math.pow(0.5, ageDays / DECAY_HALF_LIFE_DAYS);

    totalWeight += weight;
    if (answer.isCorrect) {
      weightedCorrect += weight;
    }
  }

  if (totalWeight === 0) return 0;
  return Math.round((weightedCorrect / totalWeight) * 100);
}
```

### Pattern 3: Category Mapping to USCIS Structure

**What:** Map existing 7 categories to USCIS official 3 main categories with sub-categories.

**Current categories in codebase:**
- 'Principles of American Democracy'
- 'System of Government'
- 'Rights and Responsibilities'
- 'American History: Colonial Period and Independence'
- 'American History: 1800s'
- 'Recent American History and Other Important Historical Information'
- 'Civics: Symbols and Holidays'

**USCIS Mapping:**
```typescript
// src/lib/mastery/categoryMapping.ts
export const USCIS_CATEGORIES = {
  'American Government': {
    color: 'blue',
    subCategories: [
      'Principles of American Democracy',
      'System of Government',
      'Rights and Responsibilities',
    ],
  },
  'American History': {
    color: 'amber',
    subCategories: [
      'American History: Colonial Period and Independence',
      'American History: 1800s',
      'Recent American History and Other Important Historical Information',
    ],
  },
  'Integrated Civics': {
    color: 'green',
    subCategories: [
      'Civics: Symbols and Holidays',
    ],
  },
} as const;

export type USCISCategory = keyof typeof USCIS_CATEGORIES;
```

### Pattern 4: Animated Radial Progress Ring

**What:** SVG-based circular progress with motion animation for smooth fill transitions.

**Example:**
```typescript
// src/components/progress/CategoryRing.tsx
'use client';

import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface CategoryRingProps {
  percentage: number;
  color: string;  // Tailwind color like 'primary-500'
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export function CategoryRing({
  percentage,
  color,
  size = 120,
  strokeWidth = 10,
  children,
}: CategoryRingProps) {
  const shouldReduceMotion = useReducedMotion();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={`text-${color}`}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 100, damping: 20 }
          }
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
```

### Pattern 5: Mastery Data Storage (IndexedDB)

**What:** Store per-question answer history in IndexedDB for mastery calculation.

**Example:**
```typescript
// src/lib/mastery/masteryStore.ts
import { createStore, get, set } from 'idb-keyval';

export const masteryStore = createStore('civic-prep-mastery', 'answer-history');

export interface StoredAnswer {
  questionId: string;
  isCorrect: boolean;
  timestamp: number;
  sessionType: 'test' | 'practice';
}

const ANSWERS_KEY = 'answer-history';

export async function recordAnswer(answer: Omit<StoredAnswer, 'timestamp'>): Promise<void> {
  const history = await get<StoredAnswer[]>(ANSWERS_KEY, masteryStore) ?? [];
  history.push({
    ...answer,
    timestamp: Date.now(),
  });
  await set(ANSWERS_KEY, history, masteryStore);
}

export async function getAnswerHistory(): Promise<StoredAnswer[]> {
  return await get<StoredAnswer[]>(ANSWERS_KEY, masteryStore) ?? [];
}

export async function getQuestionHistory(questionId: string): Promise<StoredAnswer[]> {
  const history = await getAnswerHistory();
  return history.filter(a => a.questionId === questionId);
}
```

### Anti-Patterns to Avoid

- **Computing mastery on every render:** Cache mastery scores and recalculate only when new answers are recorded
- **Storing explanations separately from questions:** Creates sync issues, harder to cache together
- **Complex milestone detection logic scattered across components:** Centralize in a single hook `useMasteryMilestones`
- **Hardcoding celebration thresholds:** Use constants file for 50/75/100 thresholds

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Animated numbers | Custom counter | react-countup (already installed) | Already used in CountUpScore, handles edge cases |
| Confetti effects | Canvas confetti | react-canvas-confetti (already installed) | Already integrated, respects reduced motion |
| Toast notifications | Custom toasts | @radix-ui/react-toast (already installed) | Already styled, accessible |
| Dialog modals | Custom modals | @radix-ui/react-dialog (already installed) | Already styled for milestone celebrations |
| Progress bars | Custom bars | @radix-ui/react-progress (already installed) | Already styled, accessible |

**Key insight:** This phase should heavily reuse existing components. The codebase already has well-architected patterns for animations, celebrations, and bilingual content.

---

## Common Pitfalls

### Pitfall 1: Explanation Data Bloat
**What goes wrong:** Adding full explanations to every question balloons the data size, slowing initial load and cache operations.
**Why it happens:** Each explanation adds ~500 bytes of bilingual content.
**How to avoid:**
- Keep explanations brief (2-3 sentences max)
- Lazy-load "See also" related question content
- Cache explanations with questions as single unit (already planned)
**Warning signs:** Initial load > 3 seconds, IndexedDB cache > 1MB

### Pitfall 2: Mastery Calculation Performance
**What goes wrong:** Recalculating mastery on every render creates jank during scrolling or navigation.
**Why it happens:** Exponential decay calculation iterates all historical answers.
**How to avoid:**
- Cache computed mastery in React state
- Recalculate only when `answerHistory` changes
- Use `useMemo` with proper dependencies
**Warning signs:** React DevTools showing repeated recalculations, scroll lag on Progress page

### Pitfall 3: Category Color Conflicts
**What goes wrong:** Category colors clash with success/warning semantic colors, causing confusion.
**Why it happens:** Green category color looks like "correct", amber looks like "incorrect".
**How to avoid:**
- Use distinct hues not used for semantics (e.g., blue, purple, teal instead of green/amber)
- OR use softer shades that don't conflict with success-500/warning-500
- Test color combinations in both light and dark mode
**Warning signs:** User confusion about what colors mean, accessibility contrast issues

### Pitfall 4: Offline Mastery Sync
**What goes wrong:** Mastery calculations differ between offline (IndexedDB only) and online (Supabase synced) states.
**Why it happens:** Dual sources of truth for answer history.
**How to avoid:**
- IndexedDB is always the source of truth for mastery display
- Sync to Supabase happens in background (like existing sync queue)
- Never compute mastery from Supabase data directly
**Warning signs:** Mastery percentage jumps after coming online

### Pitfall 5: Celebration Fatigue
**What goes wrong:** Too many celebrations desensitize users and become annoying.
**Why it happens:** Milestone detection triggers on every threshold crossing.
**How to avoid:**
- Track shown milestones in localStorage to avoid repeats
- Debounce celebrations (max 1 per session)
- User preference to disable celebrations
**Warning signs:** Users complaining about interruptions, clicking through celebrations quickly

---

## Code Examples

### Expandable Explanation Card
```typescript
// src/components/explanations/ExplanationCard.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Lightbulb, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { Explanation } from '@/types';

interface ExplanationCardProps {
  explanation: Explanation;
  defaultExpanded?: boolean;
  className?: string;
}

export function ExplanationCard({
  explanation,
  defaultExpanded = false,
  className,
}: ExplanationCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={clsx('rounded-2xl border border-border bg-card/80', className)}>
      {/* Trigger */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 min-h-[44px] text-left"
        aria-expanded={isExpanded}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-primary">
          <Lightbulb className="h-4 w-4" />
          Why? / ဘာကြောင့်လဲ
        </span>
        <ChevronDown
          className={clsx(
            'h-4 w-4 text-muted-foreground transition-transform',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Brief explanation */}
              <div>
                <p className="text-sm text-foreground">{explanation.brief_en}</p>
                <p className="text-sm text-muted-foreground font-myanmar mt-1">
                  {explanation.brief_my}
                </p>
              </div>

              {/* Mnemonic */}
              {explanation.mnemonic_en && (
                <div className="rounded-xl bg-primary/5 p-3">
                  <p className="text-xs font-medium text-primary mb-1">
                    Memory tip / မှတ်မိစေဖို့
                  </p>
                  <p className="text-sm">{explanation.mnemonic_en}</p>
                  {explanation.mnemonic_my && (
                    <p className="text-sm font-myanmar text-muted-foreground mt-1">
                      {explanation.mnemonic_my}
                    </p>
                  )}
                </div>
              )}

              {/* Citation */}
              {explanation.citation && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {explanation.citation}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### Smart Question Selection for Practice
```typescript
// src/lib/practice/questionSelection.ts
import type { Question } from '@/types';
import { getAnswerHistory } from '@/lib/mastery/masteryStore';
import { calculateCategoryMastery } from '@/lib/mastery/calculateMastery';
import { fisherYatesShuffle } from '@/lib/shuffle';

interface SelectionOptions {
  questions: Question[];
  count: number;
  weakRatio?: number;  // Default 0.7 (70% weak, 30% strong)
}

export async function selectPracticeQuestions({
  questions,
  count,
  weakRatio = 0.7,
}: SelectionOptions): Promise<Question[]> {
  const history = await getAnswerHistory();

  // Calculate per-question accuracy
  const questionAccuracy = new Map<string, number>();
  for (const q of questions) {
    const qHistory = history.filter(h => h.questionId === q.id);
    if (qHistory.length === 0) {
      questionAccuracy.set(q.id, 0);  // Unanswered = treat as weak
    } else {
      const correct = qHistory.filter(h => h.isCorrect).length;
      questionAccuracy.set(q.id, correct / qHistory.length);
    }
  }

  // Sort by accuracy (weakest first)
  const sorted = [...questions].sort((a, b) => {
    return (questionAccuracy.get(a.id) ?? 0) - (questionAccuracy.get(b.id) ?? 0);
  });

  // Select 70% weak, 30% strong
  const weakCount = Math.ceil(count * weakRatio);
  const strongCount = count - weakCount;

  const weak = sorted.slice(0, weakCount);
  const strong = fisherYatesShuffle(sorted.slice(weakCount)).slice(0, strongCount);

  // Shuffle final selection
  return fisherYatesShuffle([...weak, ...strong]);
}
```

### Milestone Detection Hook
```typescript
// src/hooks/useMasteryMilestones.ts
'use client';

import { useEffect, useRef, useState } from 'react';

export type MilestoneLevel = 'bronze' | 'silver' | 'gold';

interface MilestoneEvent {
  category: string;
  level: MilestoneLevel;
  previousPercentage: number;
  newPercentage: number;
}

const THRESHOLDS: Record<MilestoneLevel, number> = {
  bronze: 50,
  silver: 75,
  gold: 100,
};

const SHOWN_KEY = 'civic-prep-shown-milestones';

export function useMasteryMilestones(
  categoryMasteries: Record<string, number>
): MilestoneEvent | null {
  const [pendingMilestone, setPendingMilestone] = useState<MilestoneEvent | null>(null);
  const previousMasteries = useRef<Record<string, number>>({});

  useEffect(() => {
    // Get previously shown milestones from localStorage
    const shown = new Set(JSON.parse(localStorage.getItem(SHOWN_KEY) ?? '[]'));

    for (const [category, newPct] of Object.entries(categoryMasteries)) {
      const prevPct = previousMasteries.current[category] ?? 0;

      // Check each threshold
      for (const [level, threshold] of Object.entries(THRESHOLDS) as [MilestoneLevel, number][]) {
        const key = `${category}-${level}`;

        if (prevPct < threshold && newPct >= threshold && !shown.has(key)) {
          // New milestone!
          shown.add(key);
          localStorage.setItem(SHOWN_KEY, JSON.stringify([...shown]));

          setPendingMilestone({
            category,
            level,
            previousPercentage: prevPct,
            newPercentage: newPct,
          });
          break;  // Only show one milestone at a time
        }
      }
    }

    previousMasteries.current = { ...categoryMasteries };
  }, [categoryMasteries]);

  return pendingMilestone;
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Simple accuracy (correct/total) | Recency-weighted mastery | 2024+ | Better reflects current ability, standard in SRS |
| Static progress bars | Animated SVG/motion fills | Ongoing | More engaging, Duolingo-style feel |
| Global explanations file | Colocated with questions | Best practice | Easier maintenance, single cache unit |
| Red for errors | Orange/amber for feedback | Phase 3 | Less anxiety-inducing, culturally appropriate |

**Deprecated/outdated:**
- Storing mastery in localStorage: Use IndexedDB for structured data and larger capacity
- Computing mastery from Supabase: Always use local IndexedDB as source of truth

---

## Open Questions

### 1. Explanation Content Generation
**What we know:** User decided AI-generated then reviewed, cross-reference with USCIS materials
**What's unclear:** Who reviews? What's the review workflow? How to flag uncertain explanations?
**Recommendation:** For Phase 4 planning, assume explanations are provided. Content generation is a separate task/sprint. Start with a subset of questions (e.g., first 20) to validate the structure.

### 2. Weakness Threshold Value
**What we know:** User marked as Claude's discretion
**What's unclear:** What percentage marks "weak"?
**Recommendation:** Start with 60% - below passing threshold (60%) suggests need for practice. Make it configurable in a constants file for easy tuning.

### 3. Practice vs Test Mastery Weighting
**What we know:** User marked as Claude's discretion
**What's unclear:** Should practice and test answers be weighted differently?
**Recommendation:** Weight test answers at 1.0x, practice at 0.7x - tests are higher stakes and more reliable signal of true knowledge.

---

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis - Question types, IndexedDB patterns, animation patterns, i18n patterns
- [USCIS Civics Questions](https://www.uscis.gov/citizenship/find-study-materials-and-resources/study-for-the-test/100-civics-questions-and-answers-with-mp3-audio-english-version) - Official 3 main categories structure
- [FSRS-6 Algorithm](https://github.com/open-spaced-repetition/fsrs4anki/wiki/spaced-repetition-algorithm:-a-three%E2%80%90day-journey-from-novice-to-expert) - Recency weighting approach

### Secondary (MEDIUM confidence)
- [react-circular-progressbar](https://www.npmjs.com/package/react-circular-progressbar) - Library documentation for radial progress
- [LogRocket SVG Progress Tutorial](https://blog.logrocket.com/build-svg-circular-progress-component-react-hooks/) - Custom SVG approach validation
- [Quiz Feedback UX Patterns](https://medium.com/@maxmaier/finding-the-best-pattern-for-quiz-feedback-9e174b8fd6b8) - Educational quiz best practices

### Tertiary (LOW confidence)
- General React best practices articles - Used for validation only

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All major libraries already installed, patterns proven in codebase
- Architecture: HIGH - Extends existing patterns (types, IndexedDB, animations)
- Pitfalls: HIGH - Based on codebase analysis and standard educational app patterns
- Explanation structure: MEDIUM - Structure is sound but content generation is TBD

**Research date:** 2026-02-06
**Valid until:** 2026-03-06 (30 days - stable domain, no fast-moving dependencies)
