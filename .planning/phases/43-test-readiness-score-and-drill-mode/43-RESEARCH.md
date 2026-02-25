# Phase 43: Test Readiness Score and Drill Mode - Research

**Researched:** 2026-02-25
**Domain:** Readiness scoring engine, radial ring visualization, drill session flow
**Confidence:** HIGH

## Summary

Phase 43 adds a test readiness score (0-100%) to the Dashboard with an animated radial ring, a per-dimension breakdown (accuracy, coverage, consistency), and a dedicated drill mode for weak areas. The codebase already has all foundational building blocks: `calculateCategoryMastery` for accuracy, `getAnswerHistory`/`getCategoryQuestionIds` for coverage metrics, `ts-fsrs` v5.2.3 with `f.get_retrievability(card, now, false)` for FSRS retrievability projection, `ReadinessRing` (hub component) with gradient stroke + inner glow + bilingual tiers, `CategoryRing` for mini dimension rings, `PracticeSession` for the quiz engine, `CountUpScore` for animated number counters, `celebrate()` for confetti dispatch, and existing `getWeakQuestions`/`selectPracticeQuestions` for drill question selection.

The readiness engine is a pure computation module (no UI) that takes answer history + SRS card data and produces a 0-100 score with per-dimension and per-category breakdowns. The 60% cap for zero-coverage categories is a business rule in this engine. The drill flow reuses `PracticeSession` with a distinct visual mode (orange accent) and a custom results screen showing pre/post mastery delta.

**Primary recommendation:** Build the readiness engine as a standalone pure-function module (`src/lib/readiness/`), adapt the existing `ReadinessRing` for Dashboard hero position (size/tier label adjustments), create a drill page (`/drill`) by parameterizing the existing practice flow, and compose `CountUpScore` + `celebrate()` for the results page.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Radial progress ring style (circular arc, percentage centered inside)
- Hero position -- largest card at top of Dashboard, the centerpiece
- Large ring (~120-140px diameter), thick stroke (12-16px)
- Smooth gradient color: red through amber to green as fill increases
- Visible faint track behind the colored fill (Apple Activity style)
- Bold, large font (700+ weight, ~32-36px) for the percentage number inside ring
- 4-tier status labels below percentage:
  - 0-25%: "Getting Started"
  - 26-50%: "Building Up"
  - 51-75%: "Almost Ready"
  - 76-100%: "Test Ready"
- Title + subtitle header on the card (e.g., "Test Readiness" / "Based on your study history")
- Animate ring fill from 0 to current value on every Dashboard load (satisfying sweep)
- Subtle micro-interactions: gentle pulse on score change, soft glow on hover/tap
- Brighter/neon tones in dark mode so the ring pops against dark backgrounds
- Subtle gradient card background that shifts with score tier (warm red tones when low, cool green when high)
- 60% cap warning: small warning badge explaining "Score capped -- you haven't studied [category]" with link to that category
- 0% empty state: show empty ring at 0% with encouraging text "Start studying to see your readiness"
- All status labels and text localized (Burmese translation when language is Burmese)
- 3 mini radial rings side-by-side for accuracy, coverage, consistency
- Distinct colors per dimension (e.g., blue for accuracy, purple for coverage, teal for consistency)
- FSRS retrievability projection integrated into the consistency dimension score (no separate display)
- Tap-to-expand inline: tapping the ring card expands it -- ring shrinks to ~80px, slides left/up, breakdown fills remaining space
- Smooth expand animation: card height transitions, ring shrinks with spring physics, breakdown elements fade/slide in
- Chevron toggle icon on card header (rotates when expanded) + tap to collapse
- Tooltip on tap for each dimension: brief explanation (e.g., "Coverage: % of all 128 questions you've attempted")
- Always starts collapsed on load (not persisted)
- Per-category list below dimension rings showing all 7 USCIS categories:
  - Sorted by ascending mastery (weakest first)
  - Each row: category name + mastery percentage + small "Drill" button for categories below 70% mastery threshold
  - Zero-coverage categories: red/warning accent with alert icon
  - Category names localized (Burmese when active)
- User chooses drill length: 5, 10, or 20 questions
- Pre-drill screen shows: focus areas, question count selector, estimated time, "Start Drill" button
- Question format: same as existing practice mode (flashcard or quiz style)
- Drill mode has distinct accent color (e.g., orange) or header badge
- Question selection (main "Drill Weak Areas"): weakest questions across all categories
- Question selection (category-specific drill): only questions from that USCIS category
- Question order: randomized within the drill session
- If fewer weak questions than selected count: fill remaining with medium-mastery questions
- Progress bar at top showing "3 of 10" filling across
- Real-time mastery/FSRS updates per answer (early exit preserves all answered progress)
- User can exit early -- shows partial results with "Completed 6 of 10 questions" note
- Reuse existing answer feedback (same sounds/visuals as current practice mode)
- Post-drill: only "New Drill" offered (re-selects weakest, no replay of same set)
- Multiple entry points: Dashboard + Progress Hub + end-of-practice suggestion when weak areas detected
- Full-screen dedicated results page after drill completion
- Headline metrics: overall drill score (e.g., 7/10) + mastery delta
- Mastery delta shown as animated counter: number counts up from pre to post value
- Animated mini readiness ring on results that animates from old to new value
- Consistent red-to-green gradient colors matching main readiness ring
- Tiered celebration based on drill score (questions correct):
  - 80%+ correct: confetti/celebration animation
  - 50-79% correct: encouraging message
  - Below 50%: motivational nudge
- No-improvement/decline: encouraging + specific tone
- Partial completion: same celebration logic, just note "Completed 6 of 10 questions"
- Three post-drill actions:
  1. "New Drill" -- start another weak-area session
  2. "Practice [Category Name]" -- links to weakest category from that drill
  3. "Back to Dashboard" -- return to main view
- Updated readiness score shown (e.g., "Your readiness: 63% -> 65%")
- No drill history tracking (each drill is standalone)
- Reuse existing animation patterns/libraries for confetti
- All text fully localized (Burmese translation)

### Claude's Discretion
- Drill CTA button placement (inside ring card vs separate card below)
- Exact spacing, padding, and typography details
- Exact dimension ring colors (blue/purple/teal are suggestions)
- Progress bar styling details
- Animation timing and easing curves
- Confetti/celebration animation implementation approach
- Error state handling throughout

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RDNS-01 | User can see a test readiness score (0-100%) on Dashboard | Readiness engine computes score from existing mastery data + FSRS cards; existing `ReadinessRing` component adapted for Dashboard hero card |
| RDNS-02 | Readiness score shows per-dimension breakdown (accuracy, coverage, consistency) | Three sub-scores computed independently in engine; mini `CategoryRing` instances in expandable card section |
| RDNS-03 | Readiness formula penalizes zero-coverage categories and projects FSRS retrievability | 60% cap logic in engine; `f.get_retrievability(card, now, false)` from ts-fsrs provides retrievability for consistency dimension |
| RDNS-04 | User can start a dedicated weak-area drill from Dashboard | DrillPage wrapping `PracticeSession` with drill-specific question selection via existing `getWeakQuestions` |
| RDNS-05 | Category-level drill buttons appear on categories below mastery threshold | Per-category list in expanded ReadinessCard shows "Drill" button for categories below 70% mastery |
| RDNS-06 | Drill session shows pre/post mastery improvement delta | `CountUpScore` for animated counter + mini `ReadinessRing` animating from old to new value on results page |
</phase_requirements>

## Standard Stack

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion/react | (in project) | Ring animations, expand/collapse, spring physics | Already used by 30+ components; springs defined in motion-config.ts |
| ts-fsrs | ^5.2.3 | `f.get_retrievability(card, now, false)` for recall probability | Already the SRS engine; returns 0-1 number |
| react-countup | ^6.5.3 | Animated counter for mastery delta and drill score | Already used in `CountUpScore` component |
| react-canvas-confetti | ^2.0.7 | Celebration confetti burst | Already used in `Confetti.tsx` with civics-themed shapes |
| lucide-react | (in project) | Icons (ChevronDown, AlertTriangle, Target, Zap) | Project standard icon library |
| clsx | (in project) | Conditional className composition | Project standard |
| idb-keyval | (in project) | IndexedDB for answer history and SRS cards | Already used by mastery + SRS stores |

### No New Dependencies Needed
All required functionality exists in the current dependency tree. No installations needed.

## Architecture Patterns

### Recommended Project Structure
```
src/
  lib/
    readiness/
      readinessEngine.ts          # Pure function: computeReadiness()
      readinessEngine.test.ts     # Unit tests for scoring logic
      index.ts                    # Barrel export
  hooks/
    useReadinessScore.ts          # Hook: loads data, calls engine, returns score
  components/
    readiness/
      ReadinessHeroCard.tsx       # Dashboard hero card: ring + expand/collapse
      DimensionBreakdown.tsx      # 3 mini rings + category mastery list
      CategoryDrillList.tsx       # Per-category list with drill buttons
    drill/
      DrillConfig.tsx             # Pre-drill screen: focus areas, count selector
      DrillResultsScreen.tsx      # Post-drill results with delta animation
  views/
    DrillPage.tsx                 # Drill mode page: config -> session -> results
  app/(protected)/
    drill/
      page.tsx                    # App Router route wrapper for /drill
```

### Pattern 1: Readiness Engine as Pure Functions
**What:** All readiness calculation logic lives in `src/lib/readiness/readinessEngine.ts` as pure functions. A React hook (`useReadinessScore`) composes these with data from existing hooks and stores.
**When to use:** Always -- pure functions are testable in isolation.
**Example:**
```typescript
// src/lib/readiness/readinessEngine.ts
import type { StoredAnswer } from '@/lib/mastery/masteryStore';
import type { Card } from 'ts-fsrs';

export interface ReadinessInput {
  categoryMasteries: Record<string, number>;  // from useCategoryMastery
  totalQuestions: number;                       // 128
  attemptedQuestionIds: Set<string>;           // from getAnswerHistory
  srsCards: Array<{ questionId: string; card: Card }>;
  categoryQuestionMap: Record<string, string[]>;
}

export interface ReadinessResult {
  score: number;              // 0-100, after 60% cap if applicable
  uncapped: number;           // 0-100, before cap
  isCapped: boolean;
  cappedCategories: string[];
  dimensions: { accuracy: number; coverage: number; consistency: number };
  tier: 'getting-started' | 'building-up' | 'almost-ready' | 'test-ready';
  perCategory: CategoryReadiness[];
}

export function computeReadiness(input: ReadinessInput): ReadinessResult { ... }
```

### Pattern 2: FSRS Retrievability via get_retrievability
**What:** Use the FSRS instance's `get_retrievability(card, now, false)` method to project current recall probability.
**When to use:** For the consistency dimension of the readiness score.
**Key insight:** The FSRS singleton in `fsrsEngine.ts` (`const f = fsrs(...)`) is module-scoped but not exported. Export it (or create an identical instance in readinessEngine) and call `f.get_retrievability(card, new Date(), false)` which returns a 0-1 number. For questions without SRS cards, use the mastery decay weight as a proxy.
**Example:**
```typescript
// Consistency dimension calculation
import { fsrs, type Card } from 'ts-fsrs';

// Use same params as fsrsEngine.ts
const f = fsrs({
  enable_fuzz: true,
  enable_short_term: true,
  maximum_interval: 365,
});

function calculateConsistency(srsCards: Array<{ card: Card }>): number {
  const reviewed = srsCards.filter(c => c.card.reps > 0);
  if (reviewed.length === 0) return 0;

  const now = new Date();
  const totalR = reviewed.reduce((sum, { card }) => {
    return sum + (f.get_retrievability(card, now, false) as number);
  }, 0);
  return Math.round((totalR / reviewed.length) * 100);
}
```

### Pattern 3: Adapt ReadinessRing for Dashboard Hero
**What:** The existing `ReadinessRing` (src/components/hub/ReadinessRing.tsx) already has SVG gradient stroke (red->amber->green), inner glow, spring animation, bilingual motivational tiers, and reduced motion support. Adapt it for Dashboard use.
**Differences from existing:**
- Size: 120-140px (existing defaults to 180px) -- pass `size={140}`
- Stroke: 12-16px (existing is 14px) -- already in range
- Tier labels: CONTEXT.md specifies 4 tiers (0-25/26-50/51-75/76-100) vs existing 5 tiers (0-20/21-40/41-60/61-80/81-100). Must update `MOTIVATIONAL_TIERS` array.
- Font: 700+ weight, 32-36px -- existing uses `text-4xl font-extrabold` (already matches)
- Gradient ID: existing uses `readiness-gradient-${size}` which may collide if two rings have same size. Use `useId()` instead.
**When to use:** For both the hero ring on Dashboard and the mini ring on drill results.

### Pattern 4: Expand/Collapse Card with AnimatePresence
**What:** The ReadinessHeroCard starts collapsed (ring + score + label + chevron). Tapping expands it, shrinking the ring and revealing dimension breakdown.
**When to use:** For the expandable readiness card on Dashboard.
**Example:**
```typescript
const [isExpanded, setIsExpanded] = useState(false);

// Ring size animates between 140px (collapsed) and 80px (expanded)
// Use AnimatePresence + motion.div with initial/exit for breakdown content
<AnimatePresence initial={false}>
  {isExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={SPRING_GENTLE}
      style={{ overflow: 'hidden' }}
    >
      <DimensionBreakdown ... />
      <CategoryDrillList ... />
    </motion.div>
  )}
</AnimatePresence>
```

### Pattern 5: Drill Page Reusing PracticeSession
**What:** Create `/drill` route with `DrillPage` following the same state machine as `PracticePage`: config -> session -> results. Reuse `PracticeSession` for the actual quiz.
**When to use:** For all drill sessions.
**Example flow:**
```
DrillPage (config -> session -> results)
  DrillConfig: count selector (5/10/20), focus area display, "Start Drill"
  PracticeSession: reused with drill questions, sessionId, no timer
  DrillResultsScreen: mastery delta + mini readiness ring + celebration
```
**Entry points:**
- Dashboard ReadinessHeroCard "Drill Weak Areas" CTA -> `/drill`
- Category drill button -> `/drill?category=American%20Government`
- Progress Hub -> `/drill`
- Post-practice suggestion -> `/drill`

### Anti-Patterns to Avoid
- **Don't create a new quiz engine for drill mode:** Reuse PracticeSession. Only question selection and results screen differ.
- **Don't persist expanded state:** "Always starts collapsed on load" -- useState(false), no localStorage.
- **Don't use `useMemo<Type>(() => ...)`:** React Compiler breaks. Use `const x: Type = useMemo(...)`.
- **Don't access `.current` on refs during render:** React Compiler ESLint flags it. Only in effects/handlers.
- **Don't store readiness score:** It's derived. Recalculate on every Dashboard load.
- **Don't build a second FSRS instance with different params:** Must match `fsrsEngine.ts` configuration exactly.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Gradient SVG ring | Custom SVG from scratch | Adapt `ReadinessRing` (hub component) | Already has gradient, glow, animation, bilingual tiers |
| Mini progress rings | Custom circles | `CategoryRing` component | Already handles animation, track, spring, reduced motion |
| Score count-up | requestAnimationFrame loop | `CountUpScore` component | Dramatic easing, spring overshoot, color shift built-in |
| Confetti celebration | Canvas particle system | `celebrate()` + `Confetti` | Civics-themed shapes, intensity tiers, reduced motion support |
| Celebration sounds | Web Audio API | `playCelebrationSequence()` | Count-up ticks, confetti burst already implemented |
| Weak question selection | Manual filtering/sorting | `getWeakQuestions()` from questionSelection.ts | Accuracy calculation, shuffling, threshold built-in |
| Quiz state machine | Custom useState | `quizReducer` via PracticeSession | Answer grading, skip, review, XP, streak tracking |
| Session persistence | Custom IDB writes | `saveSession`/`getSessionsByType` | Typed snapshots, save/load/delete |
| Navigation lock | Custom beforeunload | `useNavigation().setLock()` | Already prevents nav during active sessions |
| Answer recording | Custom IDB writes | `recordAnswer()` from masteryStore | Streak tracking, fire-and-forget |
| FSRS retrievability | Custom decay formula | `f.get_retrievability(card, now, false)` | Exact FSRS formula, maintained by ts-fsrs |

**Key insight:** This phase is primarily a composition task. Every low-level building block exists. The only new algorithmic work is the readiness scoring formula itself.

## Common Pitfalls

### Pitfall 1: FSRS Card Dates May Be Strings After IndexedDB Roundtrip
**What goes wrong:** `card.due` and `card.last_review` are Date objects in memory but may serialize to ISO strings when stored/loaded from IndexedDB. `get_retrievability` expects Date objects.
**Why it happens:** IndexedDB serializes via structured clone algorithm. Some FSRS Card fields are Date objects.
**How to avoid:** Coerce dates when loading from `getAllSRSCards()`: `card.due = new Date(card.due)`. Check if `srsStore.ts` already handles this -- it stores typed records but IDB may lose Date proto.
**Warning signs:** NaN retrievability values, "Invalid Date" errors.

### Pitfall 2: ReadinessRing Gradient ID Collision
**What goes wrong:** Multiple rings on the same page share `<linearGradient id="readiness-gradient-140">` and only one renders correctly.
**Why it happens:** Existing `ReadinessRing` uses `readiness-gradient-${size}` as ID. Two rings with the same size (hero card collapsed at 140px + results page at 140px) would collide.
**How to avoid:** Replace size-based ID with React `useId()` hook: `const gradientId = useId()`.
**Warning signs:** One ring shows no gradient fill, or both share the same gradient incorrectly.

### Pitfall 3: ReadinessRing Tier Labels Mismatch
**What goes wrong:** Existing `ReadinessRing` has 5 tiers at 20/40/60/80/100% boundaries. CONTEXT.md specifies 4 tiers at 25/50/75/100% boundaries with different labels.
**Why it happens:** The component was built before the CONTEXT.md decisions.
**How to avoid:** Update the `MOTIVATIONAL_TIERS` array in `ReadinessRing.tsx` to match CONTEXT.md: "Getting Started" (0-25), "Building Up" (26-50), "Almost Ready" (51-75), "Test Ready" (76-100).
**Warning signs:** Wrong tier label displayed for the score.

### Pitfall 4: 60% Cap Logic Must Be Applied After Computing Raw Score
**What goes wrong:** Cap applied before raw score computation, making breakdown percentages confusing (80% accuracy + 90% coverage but overall 60%).
**Why it happens:** Unclear ordering of computation steps.
**How to avoid:** Compute raw score first (weighted average of dimensions), then `Math.min(rawScore, 60)` if any main USCIS category has zero coverage. Store both `score` and `uncapped` so UI can explain the cap.
**Warning signs:** Users confused why breakdown looks good but overall is low.

### Pitfall 5: 60% Cap Uses Wrong Category Grouping
**What goes wrong:** Cap check uses 7 sub-categories instead of 3 main USCIS categories. This means a user who studied all sub-categories except "Civics: Symbols and Holidays" gets capped even though they've covered 2 of 3 main categories.
**Why it happens:** Codebase uses both 3-category and 7-sub-category groupings.
**How to avoid:** Use the 3 main USCIS categories (`USCIS_CATEGORIES` keys: "American Government", "American History", "Integrated Civics") for the cap check. If ALL sub-categories within a main category have zero coverage, that main category has zero coverage.
**Warning signs:** Cap triggering too aggressively.

### Pitfall 6: Drill Page Missing Suspense Boundary
**What goes wrong:** If `/drill` page uses `useSearchParams()` for `?category=X`, Next.js App Router requires a Suspense boundary or build fails.
**Why it happens:** App Router static generation bails on useSearchParams without Suspense.
**How to avoid:** Use `'use client'` on the view component (like PracticePage pattern), or wrap in Suspense. Alternatively, pass category via state/navigation rather than search params.
**Warning signs:** Build error mentioning Suspense and useSearchParams.

### Pitfall 7: Stale Dashboard Mastery After Drill
**What goes wrong:** Dashboard readiness score doesn't update after drill because `useCategoryMastery` cached its data.
**Why it happens:** IndexedDB writes from drill aren't visible to the dashboard's cached answer history.
**How to avoid:** Call `refresh()` from `useCategoryMastery` when Dashboard re-mounts after drill. The existing hook already has a `refresh()` callback. App Router page transitions will re-mount components.
**Warning signs:** Dashboard showing pre-drill readiness score until manual refresh.

### Pitfall 8: motion.div height:'auto' Animation Gotcha
**What goes wrong:** Animating from `height: 0` to `height: 'auto'` may not smoothly transition in all cases.
**Why it happens:** CSS cannot interpolate to 'auto'. motion/react uses internal measurement but needs correct setup.
**How to avoid:** Use `AnimatePresence` with explicit `initial={{ height: 0 }}` / `animate={{ height: 'auto' }}` / `exit={{ height: 0 }}` with `style={{ overflow: 'hidden' }}` on the motion.div. This pattern works with motion/react v11+.
**Warning signs:** Content snapping instead of smoothly expanding.

## Code Examples

### Existing ReadinessRing (adapt for hero card)
```typescript
// Source: src/components/hub/ReadinessRing.tsx
// Already provides: SVG linearGradient stroke (red->amber->green), inner glow,
// spring animation (SPRING_GENTLE), bilingual tier labels, reduced motion support
// Needs adaptation:
// 1. Update MOTIVATIONAL_TIERS to 4-tier system per CONTEXT.md
// 2. Replace gradient ID with useId() to avoid collisions
// 3. Size prop: 140 for hero, 80 for expanded, 64 for results mini
<ReadinessRing percentage={readinessScore} size={140} strokeWidth={14} />
```

### Existing CategoryRing (for dimension mini-rings)
```typescript
// Source: src/components/progress/CategoryRing.tsx
// Solid-color ring with spring animation. Use for accuracy/coverage/consistency.
<CategoryRing percentage={accuracy} color="text-blue-500" size={64} strokeWidth={6}>
  <span className="text-sm font-bold">{accuracy}%</span>
</CategoryRing>
```

### FSRS Retrievability API (verified)
```typescript
// Source: ts-fsrs v5.2.3, confirmed via node_modules/ts-fsrs/dist/index.d.ts
// get_retrievability(card, now?, format?) -- format=false returns number 0-1
import { fsrs } from 'ts-fsrs';

const f = fsrs({
  enable_fuzz: true,
  enable_short_term: true,
  maximum_interval: 365,
});

// Returns probability of recall (0.0 - 1.0)
const retrievability: number = f.get_retrievability(card, new Date(), false);
```

### Existing celebrate() dispatch
```typescript
// Source: src/hooks/useCelebration.ts
// Dispatches to CelebrationOverlay which renders Confetti component
celebrate({ level: 'celebration', source: 'drill-80-plus', isDarkMode });
celebrate({ level: 'sparkle', source: 'drill-50-plus', isDarkMode });
// 'ultimate' level for special occasions, 'burst' for medium
```

### Existing question selection
```typescript
// Source: src/lib/practice/questionSelection.ts
const weakQuestions = await getWeakQuestions(allQuestions, 60); // accuracy < 60%
const selected = await selectPracticeQuestions({
  questions: categoryQuestions,
  count: 10,
  weakRatio: 0.7,
});
```

### Existing CountUpScore pattern
```typescript
// Source: src/components/celebrations/CountUpScore.tsx
// Dramatic easing, spring overshoot, color shift during count
<CountUpScore
  score={correctCount}
  total={totalQuestions}
  onComplete={() => celebrate({ level: 'celebration', source: 'drill' })}
  onUpdate={(currentValue) => { /* tick sounds */ }}
/>
```

### Existing navigation lock pattern
```typescript
// Source: PracticePage.tsx
const { setLock } = useNavigation();
useEffect(() => {
  setLock(phase === 'session', 'Complete or exit the drill first');
}, [phase, setLock]);
useEffect(() => () => setLock(false), [setLock]);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single overall mastery % | Multi-dimension readiness (accuracy + coverage + consistency) | Phase 43 (new) | Users see WHERE they need improvement |
| Practice mode for weak areas | Dedicated drill mode with pre/post tracking | Phase 43 (new) | Focused, gamified remediation |
| Manual category selection | Auto-detected weak categories with drill buttons | Phase 43 (new) | Reduced friction |

**Already current:**
- ts-fsrs v5.2.3 is latest stable
- motion/react is current
- react-countup v6.5.3 is latest
- react-canvas-confetti v2.0.7 is latest
- ReadinessRing (hub) already has gradient, glow, animation

## Open Questions

1. **FSRS Singleton Sharing**
   - What we know: `fsrsEngine.ts` creates `const f = fsrs(...)` but doesn't export it. The readiness engine needs `f.get_retrievability()`.
   - What's unclear: Whether to export the existing singleton or create one with identical params.
   - Recommendation: Export the existing singleton from `fsrsEngine.ts` (`export { f as fsrsInstance }`). This guarantees parameter consistency.

2. **Consistency Dimension When No SRS Cards Exist**
   - What we know: Only questions added to SRS deck have Card state. Many users may have only answer history.
   - What's unclear: How to compute consistency when zero SRS cards exist.
   - Recommendation: If no reviewed SRS cards exist, fall back to a recency metric: average decay-weighted correctness from answer history (same formula as `calculateCategoryMastery` but global). This approximates "how consistently would you recall these answers."

3. **Dimension Weighting**
   - What we know: Three dimensions, no explicit weights in CONTEXT.md.
   - What's unclear: Equal vs. differentiated weighting.
   - Recommendation: Equal weighting (33/33/33). The 60% cap already gives coverage outsized impact. Document in tooltips.

4. **Drill Session Type for recordAnswer**
   - What we know: `StoredAnswer.sessionType` is `'test' | 'practice'`.
   - What's unclear: Should drill answers use 'practice' or a new type?
   - Recommendation: Use 'practice'. Adding a new enum would require changes to mastery calculation weights. Drills are functionally practice sessions.

5. **Per-Category Coverage: Main vs Sub-Categories**
   - What we know: CONTEXT.md says "all 7 USCIS categories" in drill list, but "USCIS category" for 60% cap.
   - Recommendation: Use 3 main USCIS categories for the 60% cap check. Show all 7 sub-categories in the drill list with mastery percentages.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest with jsdom |
| Config file | vitest.config.ts |
| Quick run command | `pnpm test -- --run src/lib/readiness/` |
| Full suite command | `pnpm test:run` |
| Estimated runtime | ~5 seconds (pure computation tests, no DOM) |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RDNS-01 | Readiness score 0-100% calculated correctly | unit | `pnpm test -- --run src/lib/readiness/readinessEngine.test.ts` | No -- Wave 0 gap |
| RDNS-02 | Per-dimension breakdown (accuracy, coverage, consistency) | unit | `pnpm test -- --run src/lib/readiness/readinessEngine.test.ts` | No -- Wave 0 gap |
| RDNS-03 | 60% cap + FSRS retrievability projection | unit | `pnpm test -- --run src/lib/readiness/readinessEngine.test.ts` | No -- Wave 0 gap |
| RDNS-04 | Drill question selection from weak areas | unit | Existing `src/lib/practice/questionSelection.ts` tests cover base logic. Drill-specific extension tested in `readinessEngine.test.ts` | Partially -- Wave 0 gap for drill extension |
| RDNS-05 | Categories below threshold flagged | unit | `pnpm test -- --run src/lib/readiness/readinessEngine.test.ts` | No -- Wave 0 gap |
| RDNS-06 | Mastery delta calculation | unit | `pnpm test -- --run src/lib/readiness/readinessEngine.test.ts` | No -- Wave 0 gap |

### Nyquist Sampling Rate
- **Minimum sample interval:** After every committed task -> run: `pnpm test -- --run src/lib/readiness/`
- **Full suite trigger:** Before merging final task of any plan wave
- **Phase-complete gate:** Full suite green (`pnpm test:run`) + `pnpm build` clean
- **Estimated feedback latency per task:** ~5 seconds

### Wave 0 Gaps (must be created before implementation)
- [ ] `src/lib/readiness/readinessEngine.test.ts` -- covers RDNS-01, RDNS-02, RDNS-03, RDNS-05, RDNS-06
- [ ] `src/lib/readiness/index.ts` -- barrel export

*(Existing test infrastructure is sufficient. Vitest config, jsdom, setup.ts, path aliases all configured.)*

## Sources

### Primary (HIGH confidence)
- **Codebase**: `src/lib/mastery/` (calculateMastery.ts, categoryMapping.ts, weakAreaDetection.ts, masteryStore.ts, index.ts)
- **Codebase**: `src/lib/srs/` (fsrsEngine.ts, srsStore.ts, srsTypes.ts, index.ts)
- **Codebase**: `src/hooks/useCategoryMastery.ts`
- **Codebase**: `src/components/hub/ReadinessRing.tsx` -- gradient ring with glow, tiers, animation
- **Codebase**: `src/components/progress/CategoryRing.tsx` -- solid-color ring with spring animation
- **Codebase**: `src/components/celebrations/CountUpScore.tsx` -- dramatic easing counter
- **Codebase**: `src/hooks/useCelebration.ts` -- celebrate() dispatch + Confetti
- **Codebase**: `src/lib/practice/questionSelection.ts` -- getWeakQuestions, selectPracticeQuestions
- **Codebase**: `src/views/PracticePage.tsx` -- practice session flow (config -> session -> results)
- **Codebase**: `src/components/practice/PracticeSession.tsx` -- quiz session component
- **Codebase**: `src/views/Dashboard.tsx` -- current dashboard layout and data loading
- **ts-fsrs v5.2.3**: `node_modules/ts-fsrs/dist/index.d.ts` -- `get_retrievability(card, now?, format?)` confirmed, `forgetting_curve` confirmed

### Secondary (MEDIUM confidence)
- ts-fsrs `get_retrievability(card, now, false)` returns 0-1 recall probability (verified from type definitions)

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and verified
- Architecture: HIGH -- composing verified existing patterns (ring, session, celebration, mastery)
- Pitfalls: HIGH -- identified from direct codebase inspection and component API analysis
- FSRS API: HIGH -- `get_retrievability` verified from installed package type definitions
- Readiness formula: MEDIUM -- dimension weighting is a design decision, not technical constraint

**Research date:** 2026-02-25
**Valid until:** 2026-03-25 (stable domain, all internal dependencies)
