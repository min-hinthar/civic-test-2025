# Phase 43: Test Readiness Score and Drill Mode - Research

**Researched:** 2026-02-25
**Domain:** Readiness scoring, SVG ring visualization, drill session flow, FSRS retrievability
**Confidence:** HIGH

## Summary

Phase 43 adds a readiness score engine, radial ring visualization on the Dashboard, per-dimension breakdown, and a drill mode for weak areas. The codebase already has extensive infrastructure to support this: `ReadinessRing` SVG component (hub), `CategoryRing` SVG component (progress), `useCategoryMastery` hook, `calculateCategoryMastery` with decay weighting, `detectWeakAreas`, `selectPracticeQuestions` with weak/strong mixing, full `PracticeSession` component with quiz reducer, and `celebrate()` + `CountUpScore` for post-session results.

The FSRS retrievability API (`f.get_retrievability(card, now, false)`) is confirmed available in ts-fsrs 5.2.3 (already installed). The SRS deck in `SRSContext` provides all card records needed to project per-question retrievability for the consistency dimension.

The main new work is: (1) a readiness calculation engine combining accuracy, coverage, and FSRS-projected consistency with a 60% cap rule, (2) an expandable Dashboard card with the main ring and dimension breakdown, (3) per-category drill buttons, (4) a drill session page that wraps existing `PracticeSession` with drill-specific configuration, and (5) a drill results page with mastery delta animation.

**Primary recommendation:** Build the readiness engine as a pure function module (`src/lib/readiness/`), compose the Dashboard card from existing `ReadinessRing`, create the drill page by parameterizing the existing practice flow (config -> session -> results), and reuse `CountUpScore` + `celebrate()` for the results page.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Radial progress ring (circular arc, percentage centered inside), hero position on Dashboard
- Large ring (~120-140px), thick stroke (12-16px), smooth gradient red->amber->green
- Visible faint track (Apple Activity style), bold large font (700+, ~32-36px)
- 4-tier status labels: 0-25% "Getting Started", 26-50% "Building Up", 51-75% "Almost Ready", 76-100% "Test Ready"
- Animate ring fill from 0 on every Dashboard load
- Subtle micro-interactions: pulse on score change, soft glow on hover/tap
- Brighter/neon tones in dark mode
- Gradient card background shifting with score tier
- 60% cap warning badge with link to uncovered category
- 0% empty state with encouraging text
- All text localized (Burmese)
- 3 mini radial rings for accuracy, coverage, consistency (distinct colors per dimension)
- FSRS retrievability integrated into consistency dimension (no separate display)
- Tap-to-expand inline: ring shrinks ~80px, slides left/up, breakdown fills space
- Spring physics expand animation, chevron toggle
- Tooltips on tap for each dimension
- Always starts collapsed on load (not persisted)
- Per-category list below dimension rings: 7 USCIS categories sorted by ascending mastery
- "Drill" button on categories below 70% mastery threshold
- Zero-coverage categories: red/warning accent with alert icon
- Drill length: 5, 10, or 20 questions
- Pre-drill screen: focus areas, question count selector, estimated time, "Start Drill" button
- Same question format as existing practice mode
- Drill mode distinct accent color (orange) or header badge
- "Drill Weak Areas": weakest questions across all categories
- Category-specific drill: only that category's questions
- Randomized order, fill with medium-mastery if fewer weak than count
- Progress bar "3 of 10", real-time mastery/FSRS updates per answer
- Early exit preserves progress, shows partial results
- Reuse existing answer feedback
- Post-drill: only "New Drill" (no replay of same set)
- Multiple entry points: Dashboard + Progress Hub + end-of-practice
- Full-screen results page after drill
- Headline metrics: drill score + mastery delta
- Animated counter from pre to post mastery value
- Animated mini readiness ring on results (old -> new value)
- Tiered celebration: 80%+ confetti, 50-79% encouraging, <50% motivational nudge
- No-improvement: encouraging specific tone
- Partial completion: note "Completed X of Y"
- Three post-drill actions: "New Drill", "Practice [Category]", "Back to Dashboard"
- Updated readiness score shown
- No drill history tracking
- Reuse existing confetti/animation patterns
- All text fully localized

### Claude's Discretion
- Drill CTA button placement (inside ring card vs separate card below)
- Exact spacing, padding, and typography details
- Exact dimension ring colors (blue/purple/teal are suggestions)
- Progress bar styling details
- Animation timing and easing curves
- Confetti/celebration animation implementation approach
- Error state handling throughout

### Deferred Ideas (OUT OF SCOPE)
None
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RDNS-01 | User can see a test readiness score (0-100%) on Dashboard | Readiness engine module + ReadinessRing component already exists (hub/ReadinessRing.tsx), needs adaptation for Dashboard hero card |
| RDNS-02 | Readiness score shows per-dimension breakdown (accuracy, coverage, consistency) | 3 mini CategoryRing instances in expandable section; accuracy from calculateCategoryMastery, coverage from answer history unique IDs, consistency from FSRS get_retrievability |
| RDNS-03 | Readiness formula penalizes zero-coverage categories and projects FSRS retrievability | Pure function engine with cap logic; ts-fsrs 5.2.3 get_retrievability API confirmed available |
| RDNS-04 | User can start a dedicated weak-area drill from Dashboard | Drill page wrapping existing PracticeSession with drill-specific question selection via getWeakQuestions/selectPracticeQuestions |
| RDNS-05 | Category-level drill buttons appear on categories below mastery threshold | Per-category list in expanded readiness card; buttons navigate to /drill?category=X |
| RDNS-06 | Drill session shows pre/post mastery improvement delta | CountUpScore for animated counter + mini ReadinessRing animating from old to new value on results page |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion/react | ^12.34.3 | Ring fill animation, expand/collapse, spring physics | Already used in 30+ components; SPRING_GENTLE for ring, SPRING_BOUNCY for interactions |
| ts-fsrs | ^5.2.3 | Retrievability projection via `f.get_retrievability(card, now, false)` | Already the SRS engine; provides per-card recall probability (0-1) |
| react-countup | ^6.5.3 | Animated counter for mastery delta on results page | Already used in CountUpScore; stable formattingFn pattern documented |
| lucide-react | ^0.575.0 | Icons (ChevronDown, AlertTriangle, Target, Zap, etc.) | Project standard icon library |
| clsx | ^2.1.1 | Conditional class composition | Project standard |
| idb-keyval | ^6.2.2 | IndexedDB persistence for answer history | Already used via mastery module |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @radix-ui/react-dialog | ^1.1.15 | Tooltip/popover for dimension explanations | For tap-to-explain on mini rings |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom SVG ring | @radix-ui/react-progress | Radix progress is linear only; SVG circle needed for radial ring |
| react-countup | Custom requestAnimationFrame | react-countup already integrated with dramaticEasing; no need to rebuild |

**No new installations needed.** All required libraries are already in the project.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   └── readiness/
│       ├── index.ts              # Barrel exports
│       ├── readinessEngine.ts    # Pure function: calculate readiness score
│       ├── readinessEngine.test.ts  # Unit tests for formula
│       └── types.ts              # ReadinessScore, DimensionBreakdown types
├── hooks/
│   └── useReadinessScore.ts      # Hook: calls engine with data from IndexedDB + SRS context
├── components/
│   └── readiness/
│       ├── ReadinessHeroCard.tsx  # Dashboard hero card with main ring
│       ├── DimensionBreakdown.tsx # Expandable: 3 mini rings + category list
│       ├── DimensionRing.tsx      # Mini ring for a single dimension
│       ├── CategoryDrillList.tsx  # Category list with drill buttons
│       └── DrillCTA.tsx           # "Drill Weak Areas" button
├── views/
│   └── DrillPage.tsx             # Drill page: config -> session -> results
├── components/
│   └── drill/
│       ├── DrillConfig.tsx       # Pre-drill: focus areas, count selector
│       ├── DrillResults.tsx      # Post-drill: mastery delta, celebration
│       └── DrillBadge.tsx        # Visual indicator "Drill Mode"
└── app/
    └── (protected)/
        └── drill/
            └── page.tsx          # Route wrapper for DrillPage
```

### Pattern 1: Readiness Engine as Pure Functions
**What:** All readiness calculation logic lives in `src/lib/readiness/readinessEngine.ts` as pure functions with no React dependency. A React hook (`useReadinessScore`) composes these with data from `useCategoryMastery`, `getAnswerHistory`, and `useSRS`.
**When to use:** Always. Pure functions are testable, composable, and reusable.
**Example:**
```typescript
// src/lib/readiness/readinessEngine.ts
import type { Card } from 'ts-fsrs';

export interface ReadinessInput {
  /** Per-subcategory mastery percentages (0-100) */
  categoryMasteries: Record<string, number>;
  /** Total questions in the bank */
  totalQuestions: number;
  /** Unique question IDs the user has attempted */
  attemptedQuestionIds: Set<string>;
  /** FSRS cards with their current state */
  srsCards: Array<{ questionId: string; card: Card }>;
}

export interface DimensionScore {
  accuracy: number;    // 0-100, weighted category mastery
  coverage: number;    // 0-100, % of questions attempted
  consistency: number; // 0-100, average FSRS retrievability
}

export interface ReadinessResult {
  score: number;           // 0-100, final composite
  uncapped: number;        // 0-100, before cap applied
  isCapped: boolean;       // true if any category has zero coverage
  cappedCategories: string[]; // categories causing the cap
  dimensions: DimensionScore;
  tierLabel: { en: string; my: string };
}

export function calculateReadiness(input: ReadinessInput): ReadinessResult {
  const accuracy = calculateAccuracyDimension(input);
  const coverage = calculateCoverageDimension(input);
  const consistency = calculateConsistencyDimension(input);

  const uncapped = Math.round(
    accuracy * 0.4 + coverage * 0.3 + consistency * 0.3
  );

  const zeroCoverageCategories = findZeroCoverageCategories(input);
  const isCapped = zeroCoverageCategories.length > 0;
  const score = isCapped ? Math.min(uncapped, 60) : uncapped;

  return {
    score,
    uncapped,
    isCapped,
    cappedCategories: zeroCoverageCategories,
    dimensions: { accuracy, coverage, consistency },
    tierLabel: getTierLabel(score),
  };
}
```

### Pattern 2: FSRS Retrievability for Consistency Dimension
**What:** Use the FSRS singleton's `get_retrievability(card, new Date(), false)` to project current recall probability for each SRS card, then average across reviewed cards.
**When to use:** For the consistency dimension of the readiness score.
**Example:**
```typescript
// Inside readinessEngine.ts
import { fsrs, type Card } from 'ts-fsrs';

const f = fsrs({ enable_fuzz: true, enable_short_term: true, maximum_interval: 365 });

function calculateConsistencyDimension(input: ReadinessInput): number {
  const { srsCards } = input;
  if (srsCards.length === 0) return 0;

  const now = new Date();
  let totalRetrievability = 0;
  let reviewedCount = 0;

  for (const { card } of srsCards) {
    if (card.reps > 0) { // Only reviewed cards have meaningful retrievability
      const r = f.get_retrievability(card, now, false); // returns 0-1
      totalRetrievability += r;
      reviewedCount++;
    }
  }

  if (reviewedCount === 0) return 0;
  return Math.round((totalRetrievability / reviewedCount) * 100);
}
```

**IMPORTANT:** The FSRS singleton `f` must be the SAME instance used by `fsrsEngine.ts` (same parameters). Either export it from `fsrsEngine.ts` or create it identically. The `get_retrievability` method uses internal `decay` parameter which is set at construction time.

### Pattern 3: Expandable Card with Spring Animation
**What:** The readiness hero card expands inline when tapped. Use `motion.div` with `animate={{ height: 'auto' }}` for the expandable content, and spring physics for the ring resize.
**When to use:** For the dimension breakdown toggle.
**Example:**
```typescript
// Expand/collapse pattern (existing pattern in codebase)
const [isExpanded, setIsExpanded] = useState(false);

<motion.div
  animate={{ height: isExpanded ? 'auto' : 0 }}
  initial={false}
  transition={SPRING_GENTLE}
  style={{ overflow: 'hidden' }}
>
  {/* Breakdown content */}
</motion.div>
```

### Pattern 4: Drill Page Wrapping PracticeSession
**What:** Create a `/drill` route that reuses `PracticeSession` with drill-specific question selection, accent color override, and custom results page.
**When to use:** For the drill mode feature.
**Example flow:**
```
DrillPage (config -> session -> results)
  ├── DrillConfig: select drill length, show focus areas
  ├── PracticeSession: reuse with drill questions + session params
  └── DrillResults: custom results with mastery delta + readiness ring animation
```

### Pattern 5: Drill Question Selection
**What:** Reuse existing `getWeakQuestions` for "Drill Weak Areas" and `selectPracticeQuestions` for category-specific drills. If fewer weak questions than requested count, fill with medium-mastery questions.
**When to use:** Always for drill sessions.
**Example:**
```typescript
async function selectDrillQuestions(
  pool: Question[],
  count: number,
  mode: 'weak-all' | 'category',
): Promise<Question[]> {
  const history = await getAnswerHistory();

  // Score each question by accuracy (0-100)
  const scored = pool.map(q => ({
    question: q,
    accuracy: calculateQuestionAccuracy(history, q.id).accuracy,
  }));

  // Sort weakest first
  scored.sort((a, b) => a.accuracy - b.accuracy);

  // Take up to count, filling with medium-mastery if needed
  const selected = scored.slice(0, count).map(s => s.question);

  return fisherYatesShuffle(selected);
}
```

### Anti-Patterns to Avoid
- **Custom SVG gradient without unique IDs:** Multiple rings on one page will share gradientId. Use unique IDs per ring instance (ReadinessRing already does this).
- **Creating a new FSRS instance:** The FSRS engine must use the same parameters as the singleton in `fsrsEngine.ts`. Export the singleton or use identical config.
- **setState inside effects for score updates:** Use `useMemo` for derived readiness score from mastery data, not effects that set state.
- **Persisting expanded state:** Context says "always starts collapsed on load" -- do not persist to localStorage.
- **Using `useMemo<Type>(() => ...)`:** React Compiler ESLint breaks with generic annotation syntax. Use `const x: Type = useMemo(() => ...)` instead.
- **useRef for render-time values:** React Compiler disallows ref.current access during render. Use useState instead.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG circular progress ring | Custom SVG from scratch | Adapt existing `ReadinessRing` and `CategoryRing` | Already handles animation, reduced motion, gradient, glow |
| Score count-up animation | requestAnimationFrame loop | `CountUpScore` component with react-countup | Already has dramatic easing, spring overshoot, color shift |
| Confetti celebration | Canvas particle system | `celebrate()` from `useCelebration` | Already dispatches to CelebrationOverlay with tier levels |
| Celebration sounds | Web Audio from scratch | `playCelebrationSequence()` from celebrationSounds | Already has count-up ticks, confetti burst, pass/fail reveals |
| Weak question selection | Manual filtering | `getWeakQuestions()` and `selectPracticeQuestions()` | Already handles accuracy calculation, shuffling, weak/strong mix |
| Quiz session state machine | Custom useState juggling | `quizReducer` from `src/lib/quiz/quizReducer.ts` | Already handles answer grading, skip, review, XP, streak |
| Session persistence | Custom IndexedDB writes | `saveSession`/`getSessionsByType` from sessionStore | Already handles save/load/delete with typed snapshots |
| Navigation lock during drill | Custom beforeunload | `useNavigation().setLock()` from NavigationProvider | Already prevents nav during active sessions |
| Haptic feedback | navigator.vibrate | `hapticLight`/`hapticMedium`/`hapticHeavy` from haptics | Already handles device capability detection |

**Key insight:** This phase is primarily a composition task. Every low-level building block already exists -- the readiness engine is the only truly new algorithmic work. Everything else composes existing components and patterns.

## Common Pitfalls

### Pitfall 1: FSRS Card Dates Deserialized as Strings
**What goes wrong:** When loading SRS cards from IndexedDB, `card.due` and `card.last_review` may be strings instead of Date objects. `get_retrievability` expects Date objects.
**Why it happens:** IndexedDB serializes Dates to ISO strings. The `rowToCard` function in srsTypes.ts converts them, but `getAllSRSCards` in srsStore uses a different path.
**How to avoid:** Always ensure `card.due` is a Date object before passing to `get_retrievability`. Add `new Date(card.due)` coercion if needed.
**Warning signs:** NaN retrievability values, "Invalid Date" errors.

### Pitfall 2: Division by Zero in Coverage Calculation
**What goes wrong:** `coverage = attemptedCount / totalQuestions` crashes or returns NaN when totalQuestions is 0.
**Why it happens:** Edge case during initialization or empty question bank.
**How to avoid:** Guard with `if (totalQuestions === 0) return 0` in every division.
**Warning signs:** NaN scores, ring showing "NaN%".

### Pitfall 3: Per-Category Coverage Uses Wrong Category Mapping
**What goes wrong:** The readiness formula needs per-USCIS-category coverage (7 sub-categories), but the 60% cap check requires per-USCIS-main-category coverage (3 categories: American Government, American History, Integrated Civics). Mixing these up causes incorrect cap behavior.
**Why it happens:** The codebase uses both 3-category (USCIS main) and 7-category (sub) groupings.
**How to avoid:** Use `USCIS_CATEGORIES` (3 main categories) for the 60% cap check. Use sub-categories for the drill list display.
**Warning signs:** Cap triggering when only a sub-category (not main category) has zero coverage.

### Pitfall 4: Motion.div height:'auto' Doesn't Animate
**What goes wrong:** Animating from `height: 0` to `height: 'auto'` doesn't create a smooth transition in some motion/react versions.
**Why it happens:** CSS cannot transition to 'auto'. Motion library uses JavaScript measurement internally but may need specific configuration.
**How to avoid:** Use `AnimatePresence` with exit animations, or measure content height with a ref and animate to a fixed pixel value. Alternatively, use `motion.div` with `initial={false}` and `layout` prop for height changes.
**Warning signs:** Content appearing instantly or with a jump instead of smooth expand.

### Pitfall 5: Ring Gradient ID Collision
**What goes wrong:** Multiple SVG rings on the same page share a `<linearGradient id="...">` and one gradient definition overrides the others.
**Why it happens:** SVG gradient IDs are page-global. Multiple `ReadinessRing` instances (main + results page mini ring) would conflict.
**How to avoid:** Pass a unique `gradientId` prop or use `useId()` (React 18+) for each ring. The existing `ReadinessRing` already uses `readiness-gradient-${size}` but this breaks if two rings have the same size.
**Warning signs:** One ring showing the wrong colors, or both rings sharing the same gradient.

### Pitfall 6: Drill Page Missing Suspense Boundary
**What goes wrong:** If the drill page uses `useSearchParams()` (e.g., for `?category=X`), Next.js App Router requires a Suspense boundary or the build fails with "Missing Suspense boundary" error.
**Why it happens:** App Router static generation bails out on useSearchParams without Suspense.
**How to avoid:** Wrap the page component in `<Suspense>` or use `'use client'` with dynamic import. The existing practice page pattern handles this with `'use client'` on the view component.
**Warning signs:** Build error mentioning Suspense and useSearchParams.

### Pitfall 7: Stale Mastery After Drill Completion
**What goes wrong:** The dashboard readiness score doesn't update after completing a drill because `useCategoryMastery` loaded its data before the drill answers were recorded.
**Why it happens:** IndexedDB writes from the drill session aren't visible to the dashboard's cached answer history.
**How to avoid:** Call `refresh()` from `useCategoryMastery` when navigating back to Dashboard, or use the existing visibility change listener pattern.
**Warning signs:** Dashboard showing pre-drill readiness score until manual refresh.

## Code Examples

### Existing ReadinessRing (already in codebase)
```typescript
// Source: src/components/hub/ReadinessRing.tsx
// Already provides: gradient stroke, inner glow, motivational tier, spring animation
// Needs adaptation: size override (120-140px for dashboard), dark mode neon boost,
// 4-tier labels per CONTEXT.md (different from existing 5 tiers)
<ReadinessRing percentage={readinessScore} size={140} strokeWidth={14} />
```

### Existing CategoryRing (for dimension mini-rings)
```typescript
// Source: src/components/progress/CategoryRing.tsx
// Use for 3 mini dimension rings with distinct colors
<CategoryRing percentage={accuracy} color="text-blue-500" size={64} strokeWidth={6}>
  <span className="text-sm font-bold">{accuracy}%</span>
</CategoryRing>
```

### FSRS Retrievability API
```typescript
// Source: ts-fsrs 5.2.3 type definitions
// f.get_retrievability(card, now?, format?)
// format=true returns string like "90.00%", format=false returns number 0-1
import { fsrs } from 'ts-fsrs';
const f = fsrs({ enable_fuzz: true, enable_short_term: true, maximum_interval: 365 });
const retrievability: number = f.get_retrievability(card, new Date(), false);
// Returns 0.0 - 1.0 (probability of recall)
```

### Existing celebrate() dispatch
```typescript
// Source: src/hooks/useCelebration.ts
celebrate({ level: 'celebration', source: 'drill-complete', isDarkMode });
celebrate({ level: 'sparkle', source: 'drill-partial', isDarkMode });
```

### Existing question selection for drills
```typescript
// Source: src/lib/practice/questionSelection.ts
const weakQuestions = await getWeakQuestions(allQuestions, 60); // accuracy < 60%
const selected = await selectPracticeQuestions({
  questions: categoryQuestions,
  count: 10,
  weakRatio: 0.7, // 70% weak, 30% medium/strong
});
```

### Existing navigation lock pattern
```typescript
// Source: PracticePage.tsx pattern
const { setLock } = useNavigation();
useEffect(() => {
  setLock(phase === 'session', 'Complete or exit the drill first');
}, [phase, setLock]);
useEffect(() => () => setLock(false), [setLock]);
```

### Existing mastery recording
```typescript
// Source: src/lib/mastery/masteryStore.ts
import { recordAnswer } from '@/lib/mastery';
await recordAnswer({
  questionId: question.id,
  isCorrect: true,
  sessionType: 'practice', // drill answers use 'practice' type
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Simple overall mastery % | Multi-dimension readiness score | Phase 43 (new) | More actionable: users see why their score is what it is |
| Practice weak areas manually | Automated drill with pre/post tracking | Phase 43 (new) | Targeted improvement with visible progress |
| ReadinessRing in Hub only | ReadinessRing as Dashboard hero | Phase 43 (new) | Readiness is the first thing users see |

**Existing assets to leverage:**
- `ReadinessRing` (hub) -- already has gradient, glow, animation, bilingual tiers
- `CategoryRing` (progress) -- reusable for mini dimension rings
- `CountUpScore` -- animated number counter with dramatic easing
- `celebrate()` -- confetti/celebration dispatch system
- `PracticeSession` -- complete quiz session component
- `selectPracticeQuestions` / `getWeakQuestions` -- smart question selection
- `quizReducer` -- session state machine
- `recordAnswer` -- answer persistence with streak tracking

## Open Questions

1. **FSRS Singleton Sharing**
   - What we know: `fsrsEngine.ts` creates a module-level singleton `f` but doesn't export it. The readiness engine needs `f.get_retrievability()`.
   - What's unclear: Whether to export the existing singleton or create a new one with identical params.
   - Recommendation: Export the existing singleton from `fsrsEngine.ts` (add `export { f as fsrsInstance }`). This guarantees parameter consistency.

2. **Coverage Dimension -- Per Question or Per Category?**
   - What we know: CONTEXT.md says "Coverage: % of all 128 questions you've attempted" in tooltip.
   - What's unclear: Whether the 60% cap check uses per-main-category coverage (any of 3 main USCIS categories has 0%) or per-sub-category (any of 7 has 0%).
   - Recommendation: Use the 3 main USCIS categories for the cap check (matches "USCIS category" wording in success criteria). Show all 7 sub-categories in the drill list.

3. **Drill Session Type for recordAnswer**
   - What we know: `StoredAnswer.sessionType` is `'test' | 'practice'`.
   - What's unclear: Whether drill answers should be recorded as 'practice' or a new 'drill' type.
   - Recommendation: Use 'practice' (existing type). Adding a new enum value would require changes to mastery calculation weights and downstream code. Drills are functionally practice sessions.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.x with jsdom |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test:run -- --reporter=verbose` |
| Full suite command | `pnpm test:run` |
| Estimated runtime | ~8 seconds |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RDNS-01 | Readiness score 0-100% calculated correctly | unit | `pnpm test:run src/lib/readiness/readinessEngine.test.ts` | No -- Wave 0 gap |
| RDNS-02 | Per-dimension breakdown (accuracy, coverage, consistency) | unit | `pnpm test:run src/lib/readiness/readinessEngine.test.ts` | No -- Wave 0 gap |
| RDNS-03 | 60% cap when zero-coverage category + FSRS projection | unit | `pnpm test:run src/lib/readiness/readinessEngine.test.ts` | No -- Wave 0 gap |
| RDNS-04 | Drill question selection from weak areas | unit | `pnpm test:run src/lib/readiness/drillSelection.test.ts` | No -- Wave 0 gap (but existing `questionSelection.ts` covers base logic) |
| RDNS-05 | Categories below threshold get drill buttons | unit | `pnpm test:run src/lib/readiness/readinessEngine.test.ts` | No -- Wave 0 gap |
| RDNS-06 | Mastery delta calculation (pre - post) | unit | `pnpm test:run src/lib/readiness/readinessEngine.test.ts` | No -- Wave 0 gap |

### Nyquist Sampling Rate
- **Minimum sample interval:** After every committed task -> run: `pnpm test:run -- --reporter=verbose`
- **Full suite trigger:** Before merging final task of any plan wave
- **Phase-complete gate:** Full suite green + `pnpm build` clean before `/gsd:verify-work`
- **Estimated feedback latency per task:** ~8 seconds

### Wave 0 Gaps (must be created before implementation)
- [ ] `src/lib/readiness/readinessEngine.test.ts` -- covers RDNS-01, RDNS-02, RDNS-03, RDNS-05, RDNS-06
- [ ] `src/lib/readiness/drillSelection.test.ts` -- covers RDNS-04 (drill-specific selection logic beyond existing questionSelection tests)

## Sources

### Primary (HIGH confidence)
- Codebase inspection: `src/lib/mastery/` (calculateMastery, categoryMapping, weakAreaDetection, masteryStore)
- Codebase inspection: `src/lib/srs/fsrsEngine.ts` (FSRS singleton, grading, due checks)
- Codebase inspection: `src/hooks/useCategoryMastery.ts` (hook pattern for mastery data)
- Codebase inspection: `src/components/hub/ReadinessRing.tsx` (existing SVG gradient ring)
- Codebase inspection: `src/components/progress/CategoryRing.tsx` (existing SVG progress ring)
- Codebase inspection: `src/components/celebrations/CountUpScore.tsx` (animated counter)
- Codebase inspection: `src/hooks/useCelebration.ts` (celebration dispatch system)
- Codebase inspection: `src/lib/practice/questionSelection.ts` (weak question selection)
- Codebase inspection: `src/views/PracticePage.tsx` (practice session flow pattern)
- ts-fsrs 5.2.3 type definitions: `node_modules/ts-fsrs/dist/index.d.ts` (get_retrievability API confirmed)

### Secondary (MEDIUM confidence)
- ts-fsrs get_retrievability returns 0-1 recall probability (verified from type definition; `format: false` returns `number`)

### Tertiary (LOW confidence)
- None -- all findings verified from codebase or type definitions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and used extensively
- Architecture: HIGH -- composing existing patterns (ring, session, celebration)
- Pitfalls: HIGH -- identified from direct codebase inspection of similar components
- FSRS API: HIGH -- verified from installed package type definitions

**Research date:** 2026-02-25
**Valid until:** 2026-03-25 (stable domain, all internal)
