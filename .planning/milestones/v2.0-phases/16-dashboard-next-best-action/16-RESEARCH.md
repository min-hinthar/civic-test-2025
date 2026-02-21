# Phase 16: Dashboard Next Best Action - Research

**Researched:** 2026-02-11
**Domain:** Dashboard UX transformation, contextual recommendation engine, glassmorphism UI
**Confidence:** HIGH

## Summary

Phase 16 transforms the dashboard from an overwhelming 16-section wall into a focused landing page centered on a single "Next Best Action" (NBA) recommendation card. The implementation is entirely within existing technology -- no new libraries needed. The project already has `motion/react` v12.33+ (with `AnimatePresence`, spring animations), `react-countup` for number animations, `GlassCard` component for glassmorphism, and comprehensive data hooks (`useStreak`, `useSRSWidget`, `useCategoryMastery`, `useAuth` with `testHistory`).

The core challenge is building a pure priority-logic engine that consumes existing data sources (streak, SRS due count, category mastery, test history, interview history) and outputs a typed recommendation state. This engine must be a pure function (no side effects, no hooks) for testability. The UI layer then maps each state to contextual visuals (gradient, icon, CTA text, bilingual copy).

**Primary recommendation:** Build a `determineNextBestAction()` pure function in `src/lib/nba/` that takes all user state as input and returns a typed `NBAState` discriminated union. Create a `useNextBestAction()` hook that calls existing hooks and feeds data into this function. The Dashboard page becomes a simple composition of: UpdateBanner + NBA Hero Card + Stat Row + Preview Cards + Milestone/Badge Modals.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### NBA Card Presentation
- **Hero card**: Full-width, tall card at the very top -- dominates the viewport like an Apple-style feature card
- **Glass card with gradient accents**: Glass-morphism base with contextual gradient overlays that change per recommendation type
- **Contextual gradients**: Warm gradient for streak risk, cool blue for SRS, green for test readiness -- visual urgency cues
- **Themed icon**: Contextual icon that changes per recommendation type (flame for streak, brain for SRS, target for test readiness)
- **Subtle pulse for urgent states**: Icon gently pulses/glows for time-sensitive recommendations (streak, SRS due), static for others
- **English primary, Burmese below**: English recommendation in larger text, Burmese translation underneath in smaller text
- **Bilingual hint text**: Brief one-liner reasoning hint below the recommendation in both languages (not a full explanation)
- **Specific CTA button text**: Button text changes per action ("Review 5 cards", "Take a test", "Practice weak topics")
- **Primary + subtle skip**: Primary CTA plus a small text link suggesting the second-best contextual alternative
- **Contextual skip link**: The secondary link suggests the next-best action, not a fixed destination
- **Spring entrance animation**: Energetic spring animation with scale on mount -- feels alive and urgent
- **Animate transitions**: When recommendation changes (e.g., user completes SRS), card crossfades/slides to new recommendation in real-time
- **No dismiss/snooze**: NBA card always shows -- the dashboard IS the recommendation
- **Label with icon**: Small badge/label at top-left (e.g., "Recommended for you") -- adds personalized context
- **New user welcome**: Brand-new users see a warm welcome message with CTA to begin their first study session
- **Time estimate**: Claude's Discretion -- include estimated time if reliable estimates are available per action type

#### Priority Logic & States
- **8 NBA states** (expanded from roadmap's 6):
  1. Brand new user (no data) -- welcome + start studying
  2. Returning after 7+ day absence -- warm welcome-back card with easy re-entry action
  3. Streak at risk -- threshold determined by Claude
  4. SRS reviews due -- spaced repetition cards waiting
  5. Weak category -- name the specific category and mastery % (e.g., "Practice American Government -- you're at 35%")
  6. No recent test (7+ days since last mock test) -- nudge to test
  7. High mastery / test ready -- threshold determined by Claude based on existing readiness score logic
  8. Celebration state -- when doing great (long streak, high mastery, SRS caught up), congratulatory card
- **Interview recommendation**: At very high mastery AND after passing at least one mock test, recommend interview simulation
- **Celebration CTA**: When all is well (high mastery + recent test + SRS caught up), suggest interview practice as graduation step
- **No recent test threshold**: 7+ days since last mock test

#### Compact Stat Row
- **4 stats**: Streak, overall mastery %, SRS due count, questions practiced (X/128)
- **Icon + number + label**: Each stat as a small card with icon above, bold number, label below
- **Glass cards**: Each stat in its own small glass card -- consistent with design system
- **Bilingual labels**: Both English and Burmese on each stat label
- **Tappable navigation**: Tapping mastery goes to Hub Overview, SRS goes to /study#review, etc.
- **Count-up animation**: Numbers animate from 0 to current value on dashboard load
- **SRS urgency coloring**: Color-coded SRS due count (green 0-2, amber 3-5, red 6+)

#### Dashboard Section Cleanup
- **Final dashboard layout** (top to bottom):
  1. Update Banner (kept at very top)
  2. Welcome Header -- Claude's Discretion on keep vs merge into NBA
  3. NBA Hero Card
  4. Compact Stat Row (4 glass cards)
  5. Preview Cards: Category mini preview + Recent Activity (side by side on desktop, stacked mobile)
  6. Milestone Celebration Modal (kept)
  7. Badge Celebration Modal (kept)
- **Removed entirely**: Quick Action Buttons (replaced by NBA CTA), Readiness Indicator (replaced by NBA card), Overall Accuracy, Category Accuracy Breakdown, Suggested Focus, Empty State section (replaced by new-user NBA state)
- **Preview cards**: Category mini preview shows top 3 weak categories; Recent Activity shows last 2-3 study sessions
- **Preview card style**: Slightly different from stat cards (taller/wider but still glass) -- visual distinction between stats and previews
- **Preview card interaction**: Whole card tappable to navigate to relevant Hub tab

### Claude's Discretion
- **Priority order**: Determine optimal priority order based on learning science
- **Hint text layout**: Pick what works best with card dimensions and text length
- **Weak category threshold**: Determine if absolute or relative threshold works better
- **Streak risk threshold**: Determine when to trigger streak-at-risk state
- **Test readiness threshold**: Pick based on existing readiness score logic and pass thresholds
- **Welcome-back priority**: Determine where 7+ day absence slots in the priority chain
- **Time/pattern awareness**: Determine if considering time of day adds value
- **New user stats**: Decide whether to show zeros or hide until first session
- **Grid layout**: Pick 2x2 grid vs single row based on viewport responsiveness
- **Welcome Header**: Keep vs merge into NBA
- **SRS Widget, Streak Widget, Interview Widget, Badge Highlights, Leaderboard Widget, Category Progress**: Determine which are redundant given stat row and Hub
- **Time estimate**: Include estimated time if reliable estimates are available per action type

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion/react | ^12.33.0 | Spring animations, AnimatePresence crossfade, scale entrance | Already used throughout app, supports spring physics, AnimatePresence mode="wait" for crossfade |
| react-countup | ^6.5.3 | Count-up animation for stat row numbers | Already used in CountUpScore component, proven pattern |
| lucide-react | ^0.475.0 | Contextual icons (Flame, Brain, Target, etc.) | Already the app's icon library |
| clsx | ^2.1.1 | Conditional CSS class composition | Already used everywhere |
| tailwindcss | ^3.4.17 | Gradient utilities, glass card styling | Already the styling system |

### Supporting (Already Available)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| GlassCard (component) | local | Glass-morphism base for all cards | Base wrapper for NBA card, stat cards, preview cards |
| idb-keyval | existing | IndexedDB access for streak/SRS/mastery data | Already used by all data hooks |
| ts-fsrs | existing | SRS scheduling engine | Already integrated via SRSContext |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-countup for stat row | motion/react AnimateNumber | AnimateNumber is newer (motion v12+), but react-countup is already proven in the codebase with reduced-motion support; stick with react-countup for consistency |
| Custom gradient CSS | Tailwind gradient utilities | Tailwind `bg-gradient-to-br from-X to-Y` is already used extensively in the codebase; no need for custom CSS |

**Installation:** No new packages needed. Everything is already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/nba/
│   ├── index.ts                     # Barrel exports
│   ├── determineNBA.ts              # Pure priority logic function
│   ├── determineNBA.test.ts         # Unit tests for all 8 states + edge cases
│   ├── nbaTypes.ts                  # NBAState discriminated union + NBAInput type
│   └── nbaStrings.ts                # Bilingual copy for all 8 states (titles, hints, CTAs)
├── hooks/
│   └── useNextBestAction.ts         # Hook composing existing hooks -> NBAState
├── components/dashboard/
│   ├── NBAHeroCard.tsx              # The hero card UI component
│   ├── CompactStatRow.tsx           # 4 stat glass cards with count-up
│   ├── CategoryPreviewCard.tsx      # Top 3 weak categories mini card
│   ├── RecentActivityCard.tsx       # Last 2-3 study sessions card
│   └── ReadinessIndicator.tsx       # REMOVED (or kept as dead code for reference)
├── pages/
│   └── Dashboard.tsx                # Drastically simplified composition
```

### Pattern 1: Discriminated Union for NBA States
**What:** A TypeScript discriminated union where each NBA state carries its own contextual data.
**When to use:** This is the core data structure that drives the entire NBA system.
**Example:**
```typescript
// src/lib/nba/nbaTypes.ts

export type NBAStateType =
  | 'new-user'
  | 'returning-user'
  | 'streak-at-risk'
  | 'srs-due'
  | 'weak-category'
  | 'no-recent-test'
  | 'test-ready'
  | 'celebration';

interface NBABase {
  type: NBAStateType;
  /** Primary bilingual title */
  title: { en: string; my: string };
  /** Bilingual reasoning hint */
  hint: { en: string; my: string };
  /** Primary CTA button */
  cta: { label: { en: string; my: string }; to: string };
  /** Secondary "skip" link -- contextual next-best action */
  skip: { label: { en: string; my: string }; to: string };
  /** Gradient class for the card background overlay */
  gradient: string;
  /** Lucide icon name */
  icon: 'sparkles' | 'flame' | 'brain' | 'target' | 'book-open' | 'trophy' | 'party-popper' | 'heart';
  /** Whether icon should have pulse animation (urgent states) */
  urgent: boolean;
  /** Optional estimated time in minutes */
  estimatedMinutes?: number;
}

// Each state can carry extra typed data
interface NewUserNBA extends NBABase { type: 'new-user'; }
interface ReturningUserNBA extends NBABase { type: 'returning-user'; daysSinceActivity: number; }
interface StreakAtRiskNBA extends NBABase { type: 'streak-at-risk'; currentStreak: number; }
interface SRSDueNBA extends NBABase { type: 'srs-due'; dueCount: number; }
interface WeakCategoryNBA extends NBABase { type: 'weak-category'; categoryName: { en: string; my: string }; mastery: number; }
interface NoRecentTestNBA extends NBABase { type: 'no-recent-test'; daysSinceTest: number; }
interface TestReadyNBA extends NBABase { type: 'test-ready'; readinessScore: number; suggestInterview: boolean; }
interface CelebrationNBA extends NBABase { type: 'celebration'; streak: number; mastery: number; suggestInterview: boolean; }

export type NBAState =
  | NewUserNBA | ReturningUserNBA | StreakAtRiskNBA | SRSDueNBA
  | WeakCategoryNBA | NoRecentTestNBA | TestReadyNBA | CelebrationNBA;
```

### Pattern 2: Pure Determination Function (Testable)
**What:** A pure function that takes all user state as input and returns the NBA state. No hooks, no side effects.
**When to use:** Core logic -- unit tested independently from React rendering.
**Example:**
```typescript
// src/lib/nba/determineNBA.ts

export interface NBAInput {
  currentStreak: number;
  activityDates: string[];        // from useStreak
  srsDueCount: number;            // from useSRSWidget
  overallMastery: number;         // from useCategoryMastery
  categoryMasteries: Record<string, number>;
  testHistory: TestSession[];     // from useAuth
  interviewHistory: InterviewSession[];
  uniqueQuestionsPracticed: number;
  totalQuestions: number;
}

export function determineNextBestAction(input: NBAInput): NBAState {
  // Priority chain (see Priority Logic section below)
  // 1. Brand new user
  // 2. Returning after 7+ days
  // 3. Streak at risk
  // 4. SRS reviews due
  // 5. Weak category
  // 6. No recent test
  // 7. Test ready / interview ready
  // 8. Celebration
}
```

### Pattern 3: Composition Hook
**What:** A hook that calls all existing data hooks and feeds into the pure function.
**When to use:** Bridge between React data sources and the pure logic.
**Example:**
```typescript
// src/hooks/useNextBestAction.ts

export function useNextBestAction() {
  const { currentStreak, activityDates, isLoading: streakLoading } = useStreak();
  const { dueCount: srsDueCount, isLoading: srsLoading } = useSRSWidget();
  const { categoryMasteries, overallMastery, isLoading: masteryLoading } = useCategoryMastery();
  const { user, isLoading: authLoading } = useAuth();
  // ... interview history from IndexedDB

  const isLoading = streakLoading || srsLoading || masteryLoading || authLoading;

  const nbaState = useMemo(() => {
    if (isLoading) return null;
    return determineNextBestAction({ ... });
  }, [isLoading, currentStreak, ...]);

  return { nbaState, isLoading };
}
```

### Pattern 4: AnimatePresence Crossfade for NBA Transitions
**What:** When the NBA state changes (e.g., user completes SRS review and returns to dashboard), the card crossfades to the new recommendation.
**When to use:** NBA card state transitions.
**Example:**
```typescript
// In NBAHeroCard.tsx
<AnimatePresence mode="wait">
  <motion.div
    key={nbaState.type}  // Key changes trigger exit/enter
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
  >
    {/* Card content based on nbaState */}
  </motion.div>
</AnimatePresence>
```

### Pattern 5: Contextual Gradient Mapping
**What:** Map each NBA state type to a Tailwind gradient class.
**When to use:** Visual differentiation of card states.
**Example:**
```typescript
const NBA_GRADIENTS: Record<NBAStateType, string> = {
  'new-user':        'from-primary/20 via-primary/5 to-transparent',
  'returning-user':  'from-amber-500/20 via-amber-500/5 to-transparent',
  'streak-at-risk':  'from-orange-500/25 via-orange-500/5 to-transparent',
  'srs-due':         'from-blue-500/20 via-blue-500/5 to-transparent',
  'weak-category':   'from-amber-400/20 via-amber-400/5 to-transparent',
  'no-recent-test':  'from-emerald-500/15 via-emerald-500/5 to-transparent',
  'test-ready':      'from-success/20 via-success/5 to-transparent',
  'celebration':     'from-amber-400/20 via-primary/10 to-success/10',
};
```

### Anti-Patterns to Avoid
- **setState in effect for NBA computation:** Use `useMemo` to derive NBA state from hook data, not `useEffect` + `useState`. React Compiler ESLint rules prohibit `setState` in effects.
- **Ref access during render:** Do not use `useRef` to track "previous NBA state" -- use the "adjust state when props change" pattern if needed, or simply key the AnimatePresence.
- **Inline `transform` with motion:** motion/react inline `transform` overrides CSS `translateX(-50%)` centering -- use flexbox wrapper instead (project memory pitfall).
- **`useMemo<Type>()` generic syntax:** Incompatible with React Compiler. Use `const x: Type = useMemo(...)` instead.
- **Giant monolithic Dashboard component:** The current Dashboard.tsx is 655 lines. Extract NBA card, stat row, and preview cards as separate components.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Number count-up animation | Custom animation with requestAnimationFrame | `react-countup` (CountUp component) | Already used in CountUpScore.tsx, handles reduced-motion, easing |
| Glass-morphism card styling | Custom backdrop-filter CSS per component | `GlassCard` component + `.glass-card` CSS class | Already defined in globals.css with dark mode, fallbacks |
| Spring entrance animation | Custom CSS keyframes | `motion/react` spring transition | Project-wide pattern, respects `useReducedMotion()` |
| Streak calculation | Manual date math | `useStreak()` hook + `calculateStreak()` | Already handles freezes, activity dates, longest streak |
| SRS due count | Manual deck iteration | `useSRSWidget()` hook | Already computes dueCount, categoryBreakdown, isEmpty |
| Category mastery | Manual answer history processing | `useCategoryMastery()` hook | Already handles exponential decay, sub-categories |
| Weak area detection | Manual threshold checking | `detectWeakAreas()` from `@/lib/mastery` | Already sorts weakest-first, configurable threshold |

**Key insight:** Every data source needed for the NBA engine already exists as a hook or utility function. The NBA system is a composition layer on top of existing data, not a new data pipeline.

## Common Pitfalls

### Pitfall 1: React Compiler ESLint Violations
**What goes wrong:** Using `setState()` inside `useEffect` to compute NBA state, or accessing ref `.current` during render.
**Why it happens:** Habit from non-compiler React patterns.
**How to avoid:** Use `useMemo` for all derived state. Use `useState` only for user-interactive state. See project MEMORY.md for full pattern reference.
**Warning signs:** ESLint errors about `react-hooks/set-state-in-effect` or `react-hooks/refs`.

### Pitfall 2: Stale Data on Dashboard Return
**What goes wrong:** User completes SRS review on /study page, navigates back to dashboard, but NBA still shows "SRS due" because hooks haven't refreshed.
**Why it happens:** IndexedDB data loaded on mount may be stale if the component stayed mounted.
**How to avoid:** The `useSRS()` context already uses a visibility change listener to re-check due count. The `useCategoryMastery()` hook has a `refresh()` function. Consider calling refresh on route focus/visibility change for the composition hook.
**Warning signs:** NBA card shows stale recommendation after navigating away and back.

### Pitfall 3: Loading State Race Conditions
**What goes wrong:** Multiple async data sources (streak from IndexedDB, SRS from IndexedDB, mastery from IndexedDB, testHistory from Supabase auth) load at different speeds. NBA logic runs with partial data and shows wrong recommendation.
**Why it happens:** Each hook loads independently.
**How to avoid:** The `useNextBestAction` hook should wait for ALL data sources to finish loading (`isLoading = streakLoading || srsLoading || masteryLoading || authLoading`). Show a skeleton/loading state until all data is ready.
**Warning signs:** Brief flash of wrong NBA state before correct one appears.

### Pitfall 4: Interview History Requires Async Load
**What goes wrong:** Interview history is in IndexedDB (not in auth context like testHistory), so it requires an async `getInterviewHistory()` call.
**Why it happens:** Interview history was added in a separate phase and uses its own IndexedDB store.
**How to avoid:** Load interview history in the `useNextBestAction` hook with the same cancellation pattern used everywhere else (`let cancelled = false; ... return () => { cancelled = true; }`).
**Warning signs:** Interview-related NBA states never trigger because data is undefined.

### Pitfall 5: Gradient Overlay on Glass Card
**What goes wrong:** Gradient overlays on top of glass-morphism create a muddy visual effect, especially in dark mode.
**Why it happens:** Multiple semi-transparent layers compound opacity.
**How to avoid:** Use very low opacity gradients (10-25%) as overlays, and test both light/dark themes. The glass card already has `background: hsl(var(--color-surface) / 0.7)` in light mode and `/ 0.5` in dark. The gradient should be an absolute-positioned pseudo-element or a separate div behind the content.
**Warning signs:** Card looks washed out or muddy in dark mode.

### Pitfall 6: Count-Up Animation on Every Render
**What goes wrong:** Stat row numbers re-animate from 0 every time dashboard re-renders (e.g., tab switching, background return).
**Why it happens:** CountUp component re-runs when remounted.
**How to avoid:** Use a `key` prop on the stat row that only changes on real data changes, or use CountUp's `preserveValue` prop. Consider only animating on initial dashboard load, not on return visits within the same session.
**Warning signs:** Numbers flash from 0 every time user switches tabs.

### Pitfall 7: Bilingual String Management
**What goes wrong:** Hardcoded English/Burmese strings scattered across component files.
**Why it happens:** Quick implementation without centralized string management.
**How to avoid:** Create a dedicated `nbaStrings.ts` file in `src/lib/nba/` with all bilingual copy organized by state type. Follow the existing `strings.ts` pattern in `src/lib/i18n/`.
**Warning signs:** Burmese translations inconsistent or missing in some states.

## Code Examples

### NBA Hero Card Structure (Verified pattern from existing codebase)
```typescript
// Based on existing GlassCard + motion patterns in the codebase
import { GlassCard } from '@/components/hub/GlassCard';
import { motion, AnimatePresence } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

function NBAHeroCard({ nbaState }: { nbaState: NBAState }) {
  const shouldReduceMotion = useReducedMotion();
  const { showBurmese } = useLanguage();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={nbaState.type}
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <GlassCard className="relative overflow-hidden rounded-2xl p-6">
          {/* Gradient overlay */}
          <div
            className={clsx(
              'absolute inset-0 bg-gradient-to-br opacity-100 pointer-events-none',
              NBA_GRADIENTS[nbaState.type]
            )}
          />

          {/* Content */}
          <div className="relative z-10">
            {/* "Recommended for you" label */}
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Recommended for you
              </span>
            </div>

            {/* Icon + Title */}
            <div className="flex items-start gap-4">
              <NBAIcon type={nbaState.type} urgent={nbaState.urgent} />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-foreground">{nbaState.title.en}</h2>
                {showBurmese && (
                  <p className="font-myanmar text-sm text-foreground/80 mt-0.5">
                    {nbaState.title.my}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">{nbaState.hint.en}</p>
                {showBurmese && (
                  <p className="font-myanmar text-xs text-muted-foreground mt-0.5">
                    {nbaState.hint.my}
                  </p>
                )}
              </div>
            </div>

            {/* CTA + Skip */}
            <div className="mt-4 flex items-center gap-3">
              <Link to={nbaState.cta.to} className="... primary button styles ...">
                {nbaState.cta.label.en}
                {showBurmese && <span className="font-myanmar text-xs ml-1.5">{nbaState.cta.label.my}</span>}
              </Link>
              <Link to={nbaState.skip.to} className="text-sm text-muted-foreground hover:text-foreground">
                {nbaState.skip.label.en}
              </Link>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}
```

### Compact Stat Row with Count-Up (Verified pattern from StatCard + CountUpScore)
```typescript
// Based on existing StatCard from Progress Hub and CountUpScore pattern
import CountUp from 'react-countup';

function CompactStatRow({ streak, mastery, srsDue, practiced, total }: StatRowProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatGlassCard
        icon={Flame}
        value={shouldReduceMotion ? streak : <CountUp end={streak} duration={1.5} />}
        label={{ en: 'Streak', my: 'ဆက်တိုက်ရက်' }}
        onClick={() => navigate('/hub/achievements')}
      />
      <StatGlassCard
        icon={TrendingUp}
        value={shouldReduceMotion ? `${mastery}%` : <CountUp end={mastery} suffix="%" duration={1.5} />}
        label={{ en: 'Mastery', my: 'ကျွမ်းကျင်မှု' }}
        onClick={() => navigate('/hub/overview')}
      />
      <StatGlassCard
        icon={BookOpen}
        value={shouldReduceMotion ? srsDue : <CountUp end={srsDue} duration={1.5} />}
        label={{ en: 'SRS Due', my: 'SRS ပြန်လည်ရန်' }}
        urgencyColor={srsDue <= 2 ? 'success' : srsDue <= 5 ? 'warning' : 'destructive'}
        onClick={() => navigate('/study#review')}
      />
      <StatGlassCard
        icon={CheckCircle}
        value={shouldReduceMotion ? `${practiced}/${total}` : <><CountUp end={practiced} duration={1.5} />/{total}</>}
        label={{ en: 'Practiced', my: 'လေ့ကျင့်ပြီး' }}
        onClick={() => navigate('/study')}
      />
    </div>
  );
}
```

### Pulse Animation for Urgent Icons
```typescript
// Based on existing animation pattern in ReadinessIndicator (scale [1, 1.1, 1])
function NBAIcon({ type, urgent }: { type: NBAStateType; urgent: boolean }) {
  const shouldReduceMotion = useReducedMotion();
  const Icon = ICON_MAP[type];

  return (
    <motion.div
      className={clsx(
        'flex h-12 w-12 items-center justify-center rounded-2xl',
        ICON_BG_MAP[type]
      )}
      animate={
        !shouldReduceMotion && urgent
          ? { scale: [1, 1.05, 1], opacity: [1, 0.85, 1] }
          : {}
      }
      transition={
        urgent
          ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
          : undefined
      }
    >
      <Icon className={clsx('h-6 w-6', ICON_COLOR_MAP[type])} />
    </motion.div>
  );
}
```

## Priority Logic Recommendations (Claude's Discretion)

### Recommended Priority Order
Based on learning science principles (urgency/loss-aversion > maintenance > growth):

1. **Brand new user** (no data at all) -- warmest welcome, lowest barrier to entry
2. **Returning after 7+ day absence** -- re-engagement is highest priority for lapsed users; loss of momentum is the #1 dropout cause
3. **Streak at risk** -- loss aversion is a powerful motivator; protect existing investment
4. **SRS reviews due** -- spaced repetition is time-sensitive; delayed reviews reduce retention
5. **Weak category** -- targeted practice for lowest-mastery areas
6. **No recent test (7+ days)** -- periodic testing reinforces learning and measures progress
7. **Test ready / interview ready** -- positive milestone, graduation step
8. **Celebration** -- when everything is great, acknowledge and suggest interview

### Threshold Recommendations

- **Streak at risk**: Trigger when `currentStreak > 0` AND user has NOT studied today (today not in activityDates). The streak will break tomorrow if they don't act now. This is urgent because it's a binary outcome -- study today or lose streak.

- **Weak category threshold**: Use **absolute threshold of 50%** mastery. Below 50% means the user has not reached even the "bronze" milestone for that category. This aligns with the existing `getNextMilestone()` function which uses 50/75/100. Report the weakest category specifically (not all weak ones -- that's what Hub is for).

- **Test readiness threshold**: Use the existing readiness score formula from `ReadinessIndicator.tsx` (accuracy * 0.4 + coverage * 0.5 + streak bonus up to 10). Threshold of **70%** for "test ready" state. The existing code uses 80% for "ready" messaging, but 70% is the point where suggesting a test becomes appropriate (the test itself is good practice even if not fully ready).

- **Welcome-back**: Slots at position #2, right after new user. A 7+ day absence is a critical re-engagement moment. The 7-day threshold aligns with the existing `detectStaleCategories(staleDays: 7)` default.

- **Interview recommendation**: At readiness >= 80% AND at least 1 passed mock test in history. This ensures the user has demonstrated competence before being nudged to the harder interview format.

- **Celebration**: When ALL of these are true: streak > 0, srsDueCount === 0, overallMastery >= 60, last test within 7 days. The CTA suggests interview practice as the "graduation step."

### Time Estimate Recommendation
Include estimated time for these states where it's reliably computable:
- SRS due: `Math.ceil(dueCount * 0.5)` minutes (roughly 30 seconds per card review)
- Weak category practice: "5-10 min" static estimate
- Mock test: "10-15 min" static estimate
- Interview: "5-10 min" static estimate

Skip time estimates for streak-at-risk (any action counts) and new/returning user (variable).

### Welcome Header Recommendation
**Merge into NBA card.** The current welcome header ("Welcome back, Name!") becomes redundant when the NBA card itself has contextual, personalized content. The user's name can be incorporated into the NBA title for returning/celebration states. This removes one section and tightens the layout.

### Redundant Widgets Assessment
Remove from dashboard (available in Hub):
- **SRS Widget** -- replaced by SRS due count in stat row + NBA "SRS due" state
- **Streak Widget** -- replaced by streak in stat row + NBA "streak at risk" state
- **Interview Widget** -- replaced by NBA "interview ready" state
- **Badge Highlights** -- available in Hub Achievements tab
- **Leaderboard Widget** -- available in Hub (community aspect)
- **Category Progress (full)** -- replaced by Category Preview card + Hub Overview

### New User Stats
**Show zeros.** Showing zeros with the stat row visible creates a "progress from 0" motivation. Users immediately see the 4 metrics they're working toward. The count-up animation from 0 to 0 should be skipped (just show "0" static).

### Grid Layout
**2x2 grid on mobile, single row (4 across) on sm+ breakpoint.** This matches the existing OverviewTab stat card grid: `grid grid-cols-2 gap-3 sm:grid-cols-4`. Proven responsive pattern in the codebase.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Many dashboard widgets | Single NBA + compact stats | This phase | Reduces cognitive load from 16 sections to ~5 |
| Generic "Ready for test?" readiness indicator | Context-aware recommendation with reasoning | This phase | Personalized, actionable guidance |
| Fixed CTA buttons (Study/Test/Interview) | Contextual CTA changing per state | This phase | User always sees the most relevant next step |
| Full-size category grid on dashboard | Compact preview card linking to Hub | Phase 15-16 | Hub is the detail view, dashboard is the summary |

## Open Questions

1. **AnimatePresence crossfade timing on real state changes**
   - What we know: AnimatePresence `mode="wait"` with key changes works for crossfade. Tested in HubPage tab transitions.
   - What's unclear: When user returns from /study to /home after completing SRS, how quickly will hooks re-compute and trigger a key change? There may be a brief flash of the old state before new data loads.
   - Recommendation: Accept a brief loading skeleton on dashboard return if data is re-loading. The crossfade animation will mask the transition naturally. Can also use `startTransition` if needed.

2. **Activity date detection for "returning after 7+ days"**
   - What we know: `useStreak()` provides `activityDates: string[]` with all recorded activity dates. Can compute days since last activity.
   - What's unclear: If a user has been completely absent, `activityDates` might be empty OR just have old dates. Both cases work for the calculation.
   - Recommendation: Compute `daysSinceLastActivity = today - max(activityDates)`. If `activityDates.length === 0`, treat as new user (state 1), not returning user (state 2).

3. **Preview card data: "last 2-3 study sessions"**
   - What we know: `testHistory` from auth context has mock test sessions. Interview history is in IndexedDB. SRS review sessions are not discretely tracked as "sessions" -- individual card reviews are tracked.
   - What's unclear: What constitutes a "study session" for the Recent Activity card? Just tests? Tests + interviews?
   - Recommendation: Show last 2-3 mock test sessions (from `testHistory`) as they have clear date/score data. Optionally show last interview if available. Don't try to show SRS review sessions as they're not discrete events.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/pages/Dashboard.tsx` (655 lines, current dashboard structure)
- Codebase analysis: `src/hooks/useStreak.ts`, `useSRSWidget.ts`, `useCategoryMastery.ts` (all data hooks)
- Codebase analysis: `src/components/hub/GlassCard.tsx`, `StatCard.tsx`, `OverviewTab.tsx` (UI patterns)
- Codebase analysis: `src/lib/mastery/weakAreaDetection.ts` (weak area detection logic)
- Codebase analysis: `src/lib/social/streakStore.ts` (streak data structure)
- Codebase analysis: `src/components/animations/StaggeredList.tsx` (animation patterns)
- Codebase analysis: `src/components/celebrations/CountUpScore.tsx` (count-up pattern)
- Context7: `/websites/motion_dev_react` -- AnimatePresence modes, spring transitions, AnimateNumber

### Secondary (MEDIUM confidence)
- Context7: motion/react spring animation documentation -- stiffness/damping values used across codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and used extensively
- Architecture: HIGH - Patterns directly derived from existing codebase patterns (Hub, StatCard, GlassCard)
- Priority logic: HIGH - Based on existing readiness score formula, weak area detection, and streak tracking already in codebase
- Pitfalls: HIGH - Documented from known project pitfalls (React Compiler, motion/react transform, IndexedDB async patterns)

**Research date:** 2026-02-11
**Valid until:** 2026-03-11 (30 days - stable codebase, no external dependency changes expected)
