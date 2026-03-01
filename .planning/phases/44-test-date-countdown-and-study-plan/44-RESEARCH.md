# Phase 44: Test Date Countdown and Study Plan - Research

**Researched:** 2026-03-01
**Domain:** Date-driven study planning, countdown UX, adaptive daily targets
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Dashboard card is the primary entry point -- a card that says "Set your test date" when no date is set
- Tapping opens a date picker (Claude's discretion on native vs custom calendar)
- "No date" mode supported -- study plan works without a date using general pacing; countdown only appears once a date is set
- Test date is freely editable -- tap the countdown/card to change anytime, study plan recalculates automatically
- Date stored in localStorage (consistent with other user preferences in the app)
- Countdown appears as a Dashboard card when test date is set
- Urgency gradient tone -- neutral when far out, shifts to warm urgency as date approaches (color transitions green -> amber -> red)
- Readiness score shown alongside days remaining ("23 days - 68% ready") for immediate context
- After test date passes -- prompt user with "How did your test go?" offering Pass/Reschedule options; if reschedule, prompt for new date; if pass, show celebration
- Gap-based daily targets -- calculate what's needed to reach readiness goal by test date, factoring in unpracticed questions, weak categories, and SRS due cards, distributed across remaining days
- Study plan feeds into NBA -- adds "daily target" as a new NBA priority factor; NBA still decides the action but becomes test-date-aware; minimal disruption to existing flow
- Detailed activity breakdown -- show specific tasks: "5 SRS reviews, 8 new questions, 1 drill session (History)" with estimated time
- Readiness target is fixed at 90% -- ambitious but appropriate for civics test preparation
- Pace indicator -- simple "On track" / "Behind" / "Ahead" label on the countdown card based on readiness vs expected readiness at this point
- Study plan completion integrates with existing streak system -- completing daily plan counts toward streak maintenance
- Auto-redistribute on missed days -- missed work spreads across remaining days with slightly increased daily targets; no guilt messaging, plan just adapts
- Subtle checkmark on daily completion -- satisfying checkmark animation, save full celebrations for bigger milestones like reaching readiness targets

### Claude's Discretion
- Date picker implementation (native input vs custom calendar widget)
- Exact daily target calculation formula and minimum/maximum bounds
- Study plan card layout and information hierarchy details
- Skeleton/loading states for countdown and study plan
- How "estimated time" for daily plan is computed
- Bilingual strings for countdown and study plan UI (follow existing i18n patterns)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RDNS-07 | User can set test date in Settings | localStorage persistence pattern (matches existing civic-theme, civic-test-language-mode, SRS reminder time keys); date picker in Settings + Dashboard card entry point |
| RDNS-08 | Countdown display shows days remaining on Dashboard and Progress Hub | New TestDateCountdownCard component with urgency gradient (green/amber/red tier system from ReadinessHeroCard); days-remaining math is trivial native Date subtraction |
| RDNS-09 | Daily study targets card on Dashboard (SRS review + new questions + mock test recommendation) | New StudyPlanCard component + pure studyPlanEngine computing gap-based targets from readiness dimensions, SRS due count, and unpracticed question count |
| RDNS-10 | Daily targets adapt dynamically when user misses or studies ahead | Study plan engine recomputes on every render from live data (not stored targets); remaining gap / remaining days = automatic redistribution |
</phase_requirements>

## Summary

This phase adds a test date countdown and adaptive daily study plan to an existing civics test prep app that already has readiness scoring (0-100, three dimensions: accuracy/coverage/consistency), an SRS spaced repetition system, category mastery tracking, and a Next Best Action recommendation engine. The work is primarily UI/UX with a pure-function study plan engine at its core.

The key architectural insight is that daily targets should NOT be stored -- they should be recomputed from live data on every Dashboard render. This means RDNS-10 (adaptive targets) comes "for free" from the same engine that powers RDNS-09. If the user studies ahead, the remaining gap shrinks and tomorrow's targets automatically decrease. If they miss a day, the gap stays the same but remaining days decrease, so daily targets naturally increase. No separate "redistribution" logic is needed.

**Primary recommendation:** Build a pure `studyPlanEngine.ts` that takes readiness score, SRS due count, unpracticed question count, category masteries, test date (or null), and current date as inputs, and returns daily targets. Wire it into Dashboard via a `useStudyPlan` hook. Add countdown card and study plan card as new Dashboard StaggeredItems. Use native `<input type="date">` for the date picker (mobile-optimized, accessible, zero dependencies).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React 19 | ^19.2.4 | Component framework | Already in use |
| Next.js 16 | 16.1.6 | App Router, routing | Already in use |
| motion/react | ^12.34.3 | Animations (checkmark, urgency pulse) | Already in use for all dashboard animations |
| lucide-react | ^0.575.0 | Icons (Calendar, Clock, CheckCircle, Target) | Already in use |
| clsx | ^2.1.1 | Conditional classnames | Already in use |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-countup | ^6.5.3 | CountUp animation for days remaining | Already installed, used in CompactStatRow |
| Native Date API | N/A | Date math (days between, ISO strings) | All date calculations in project use native Date (no date-fns/dayjs) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native `<input type="date">` | Custom calendar widget (react-day-picker) | Native input is free, accessible, works great on mobile; custom adds dependency + maintenance. Native is recommended. |
| Native Date math | date-fns differenceInDays | Project has zero date-fns usage; adding it for one subtraction is unnecessary. Native `Math.round((d2 - d1) / 86400000)` is sufficient. |
| Recompute-on-render study plan | Stored daily targets in localStorage | Stored targets require redistribution logic and stale-data management. Recompute is simpler and automatically adaptive. |

**Installation:**
```bash
# No new dependencies needed -- everything is already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── studyPlan/
│   │   ├── studyPlanEngine.ts     # Pure function: inputs -> daily targets
│   │   ├── studyPlanEngine.test.ts # Unit tests for the engine
│   │   ├── studyPlanTypes.ts      # TypeScript interfaces
│   │   └── index.ts               # Barrel export
│   └── nba/
│       ├── determineNBA.ts        # Modified: add test-date-aware priority
│       └── nbaTypes.ts            # Modified: add testDate to NBAInput
├── hooks/
│   ├── useTestDate.ts             # localStorage read/write for test date
│   └── useStudyPlan.ts            # Composition hook: useTestDate + useReadinessScore + useSRSWidget -> studyPlanEngine
├── components/
│   └── dashboard/
│       ├── TestDateCountdownCard.tsx  # Countdown + urgency gradient + pace indicator
│       ├── StudyPlanCard.tsx          # Today's plan: SRS reviews, new questions, drill, mock test
│       └── PostTestPrompt.tsx         # "How did your test go?" modal after date passes
└── views/
    ├── Dashboard.tsx               # Modified: add countdown + study plan cards
    ├── SettingsPage.tsx            # Modified: add test date setting row
    └── HubPage.tsx                 # Modified: show countdown in Progress Hub header
```

### Pattern 1: Pure Study Plan Engine (Zero React Dependencies)
**What:** A pure function that computes daily targets from current learning state and optional test date. Follows the same pattern as `determineNBA.ts` and `readinessEngine.ts`.
**When to use:** Always -- the engine is the core of this phase.
**Example:**
```typescript
// Source: follows determineNBA.ts pattern in this project
interface StudyPlanInput {
  readinessScore: number;           // 0-100 from calculateReadiness
  readinessTarget: number;          // Fixed at 90
  srsDueCount: number;              // From useSRSWidget
  unpracticedCount: number;         // totalQuestions - uniqueQuestionsPracticed
  weakCategories: { name: string; mastery: number }[];  // Below threshold
  testDate: string | null;          // YYYY-MM-DD or null for "no date" mode
  now?: Date;                       // Injectable for testing
}

interface DailyPlan {
  srsReviewCount: number;           // Cards to review today
  newQuestionTarget: number;        // New questions to practice
  drillRecommendation: { category: string; count: number } | null;
  mockTestRecommended: boolean;     // Suggest a mock test?
  estimatedMinutes: number;         // Total estimated time
  paceStatus: 'ahead' | 'on-track' | 'behind' | null;  // null when no test date
  daysRemaining: number | null;     // null when no test date
}

function computeStudyPlan(input: StudyPlanInput): DailyPlan {
  // ... pure computation
}
```

### Pattern 2: Recompute-on-Render for Automatic Adaptation
**What:** The study plan hook calls the pure engine on every render with live data from existing hooks. No stored targets means RDNS-10 (adaptation) is automatic.
**When to use:** This is how `useNextBestAction` already works -- it recomputes the NBA from live hook data via useMemo.
**Example:**
```typescript
// Source: follows useNextBestAction.ts pattern
export function useStudyPlan(): UseStudyPlanReturn {
  const { readiness, isLoading: readinessLoading } = useReadinessScore();
  const { dueCount: srsDueCount, isLoading: srsLoading } = useSRSWidget();
  const { testDate } = useTestDate();
  // ... other data sources

  const dailyPlan = useMemo(() => {
    if (isLoading) return null;
    return computeStudyPlan({
      readinessScore: readiness?.score ?? 0,
      readinessTarget: 90,
      srsDueCount,
      unpracticedCount: totalQuestions - uniqueQuestionsCount,
      weakCategories,
      testDate,
    });
  }, [/* deps */]);

  return { dailyPlan, isLoading };
}
```

### Pattern 3: localStorage Hook for Test Date
**What:** A simple custom hook wrapping localStorage for the test date, with state synchronization.
**When to use:** Follows established project patterns (theme, language, SRS reminder time all use localStorage).
**Example:**
```typescript
// Source: follows LanguageContext.tsx and ThemeContext.tsx patterns
const TEST_DATE_KEY = 'civic-prep-test-date';

export function useTestDate() {
  const [testDate, setTestDateState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TEST_DATE_KEY);
  });

  const setTestDate = useCallback((date: string | null) => {
    setTestDateState(date);
    if (date) {
      localStorage.setItem(TEST_DATE_KEY, date);
    } else {
      localStorage.removeItem(TEST_DATE_KEY);
    }
  }, []);

  return { testDate, setTestDate };
}
```

### Pattern 4: Urgency Gradient (Tier System)
**What:** Color gradient shifts based on days remaining, matching the tier gradient pattern in ReadinessHeroCard.
**When to use:** For the countdown card background.
**Example:**
```typescript
// Source: follows ReadinessHeroCard getTierGradient pattern
function getUrgencyGradient(daysRemaining: number): { light: string; dark: string } {
  if (daysRemaining <= 7) {
    return {
      light: 'from-red-500/5 to-red-500/10',
      dark: 'dark:from-red-500/15 dark:to-red-500/20',
    };
  }
  if (daysRemaining <= 21) {
    return {
      light: 'from-amber-500/5 to-amber-500/10',
      dark: 'dark:from-amber-500/15 dark:to-amber-500/20',
    };
  }
  return {
    light: 'from-green-500/5 to-green-500/10',
    dark: 'dark:from-green-500/15 dark:to-green-500/20',
  };
}
```

### Pattern 5: NBA Integration (Minimal Priority Factor)
**What:** Add `testDate` as an optional field to NBAInput. When present and days remaining < 14, boost study-related NBA priorities. The NBA engine remains a pure function with injectable `now`.
**When to use:** This makes NBA test-date-aware without changing its core priority chain.
**Example:**
```typescript
// In NBAInput, add:
testDate?: string | null;  // YYYY-MM-DD

// In determineNBA.ts, after existing checks:
// If test date is soon and daily plan exists, adjust urgency of existing priorities
```

### Anti-Patterns to Avoid
- **Storing daily targets:** Never store computed daily targets in localStorage/IndexedDB. They go stale immediately when the user studies. Recompute from live data.
- **Complex redistribution algorithm:** Don't build a separate "missed day redistribution" system. The engine naturally handles this: gap stays the same, remaining days decrease, daily target increases.
- **Custom date picker widget:** Don't build or install a custom calendar. Native `<input type="date">` is accessible, mobile-optimized, and zero-maintenance.
- **Separate "pace tracking" storage:** Don't store "expected readiness at day X" tables. Pace is a simple comparison: current readiness vs. linear interpolation between starting readiness and target.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date picking | Custom calendar component | `<input type="date">` native | Mobile browsers show excellent native date pickers; accessible by default; zero maintenance |
| Days remaining | Custom date math with timezone handling | `Math.round((targetMs - nowMs) / 86400000)` | Project already uses this pattern in `determineNBA.ts` `daysBetween()` function; simple integer is all that's needed |
| Count-up animation for days | Custom animation | `react-countup` (already installed) | Already used in CompactStatRow for the same pattern |
| Gradient tiers | New color system | Copy `getTierGradient()` pattern from ReadinessHeroCard | Consistency with existing UI; 3 breakpoints (green/amber/red) |

**Key insight:** Every building block for this phase already exists in the codebase. The countdown card is a variant of ReadinessHeroCard (gradient tiers + ring). The study plan card follows the NBAHeroCard layout pattern. The engine follows the readinessEngine/determineNBA pure-function pattern. No new architectural concepts are needed.

## Common Pitfalls

### Pitfall 1: Timezone-Caused Off-By-One in Days Remaining
**What goes wrong:** User in UTC-8 sets test date "2026-03-15". At 11pm local time on March 14, the countdown says "1 day" instead of "0 days" or "Tomorrow" because UTC math is a day ahead.
**Why it happens:** Using `new Date(dateString)` parses as UTC midnight, but `new Date()` returns local time.
**How to avoid:** Use the same `toDateString()` + UTC normalization pattern from `determineNBA.ts`: convert both dates to `YYYY-MM-DD` strings, then parse as `T00:00:00Z` for consistent subtraction. The existing `daysBetween()` helper in `determineNBA.ts` does this correctly.
**Warning signs:** Days remaining flickers between two values near midnight.

### Pitfall 2: Division by Zero When Test Date Is Today or Past
**What goes wrong:** `unpracticedCount / daysRemaining` throws or returns Infinity when daysRemaining is 0 or negative.
**Why it happens:** User's test is today or they haven't updated it.
**How to avoid:** Clamp daysRemaining to minimum 1 for target calculations. When daysRemaining <= 0, show the "How did your test go?" post-test prompt instead of the study plan.
**Warning signs:** NaN or Infinity showing in the UI.

### Pitfall 3: Overwhelming Daily Targets
**What goes wrong:** User sets test date 3 days away with 90 unpracticed questions. Engine says "30 new questions per day" which is demoralizing.
**Why it happens:** No upper bound on daily targets.
**How to avoid:** Cap daily targets at reasonable maximums: e.g., max 20 SRS reviews, max 15 new questions, max 2 drill sessions. When capped, show "Focus on your most impactful areas" rather than raw numbers.
**Warning signs:** Daily target numbers that would take hours to complete.

### Pitfall 4: Study Plan Card Showing Stale Data After Practice
**What goes wrong:** User completes 5 SRS reviews, returns to Dashboard, still sees "5 SRS reviews due" in the plan.
**Why it happens:** useSRS context or useSRSWidget hasn't refreshed.
**How to avoid:** The existing `useSRS` context already tracks deck state reactively. Ensure useStudyPlan depends on `useSRSWidget().dueCount` (which derives from the reactive SRS context). The study plan will automatically update when the user returns to Dashboard and hooks re-evaluate.
**Warning signs:** Numbers don't change after studying.

### Pitfall 5: Post-Test Prompt Showing Repeatedly
**What goes wrong:** User dismisses "How did your test go?" prompt but it reappears on every Dashboard visit.
**Why it happens:** Post-test state not persisted.
**How to avoid:** Store post-test interaction in localStorage (e.g., `civic-prep-test-date-passed-action`). Three states: "pending" (show prompt), "passed" (show celebration + clear test date), "rescheduled" (new date set).
**Warning signs:** User gets annoyed by repeated prompt.

## Code Examples

Verified patterns from existing project code:

### Days Remaining Calculation (from determineNBA.ts)
```typescript
// Source: src/lib/nba/determineNBA.ts lines 31-39
function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysBetween(dateStr: string, now: Date): number {
  const date = new Date(dateStr + 'T00:00:00Z');
  const today = new Date(toDateString(now) + 'T00:00:00Z');
  return Math.round((today.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));
}

// For countdown: flip the sign
function daysUntil(targetDateStr: string, now: Date = new Date()): number {
  return -daysBetween(targetDateStr, now);
}
```

### localStorage Setting Pattern (from SettingsPage.tsx)
```typescript
// Source: src/views/SettingsPage.tsx lines 44, 196-208
const SRS_REMINDER_TIME_KEY = 'civic-prep-srs-reminder-time';

// Read with SSR guard
const [reminderTime, setReminderTime] = React.useState(() => {
  if (typeof window === 'undefined') return '09:00';
  return localStorage.getItem(SRS_REMINDER_TIME_KEY) ?? '09:00';
});

// Write immediately
const handleReminderTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setReminderTime(value);
  localStorage.setItem(SRS_REMINDER_TIME_KEY, value);
};
```

### Tier Gradient Pattern (from ReadinessHeroCard.tsx)
```typescript
// Source: src/components/readiness/ReadinessHeroCard.tsx lines 19-47
interface TierGradient { light: string; dark: string; }

function getTierGradient(score: number): TierGradient {
  if (score <= 25) {
    return { light: 'from-red-500/5 to-red-500/10', dark: 'dark:from-red-500/15 dark:to-red-500/20' };
  }
  if (score <= 50) {
    return { light: 'from-amber-500/5 to-amber-500/10', dark: 'dark:from-amber-500/15 dark:to-amber-500/20' };
  }
  // ... etc
}
```

### StaggeredList Dashboard Layout (from Dashboard.tsx)
```typescript
// Source: src/views/Dashboard.tsx lines 260-268
<StaggeredList delay={80} stagger={80}>
  <StaggeredItem className="mb-6">
    <ReadinessHeroCard ... />
  </StaggeredItem>
  {/* New cards slot in here following the same pattern */}
  <StaggeredItem className="mb-6">
    <TestDateCountdownCard ... />
  </StaggeredItem>
  <StaggeredItem className="mb-6">
    <StudyPlanCard ... />
  </StaggeredItem>
</StaggeredList>
```

### Bilingual UI Pattern (from SettingsRow)
```typescript
// Source: src/views/SettingsPage.tsx lines 152-187
<div className="flex-1 mr-3">
  <p className="text-sm font-semibold text-foreground">{label}</p>
  {showBurmese && labelMy && (
    <p className="font-myanmar text-sm text-muted-foreground">{labelMy}</p>
  )}
  {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
</div>
```

## Study Plan Engine: Detailed Algorithm Design

### Gap-Based Target Calculation

The study plan engine computes "what remains to reach 90% readiness" and distributes it across remaining days.

**Readiness dimensions (from readinessEngine.ts):**
- Accuracy (40%): weighted average of sub-category mastery
- Coverage (30%): uniqueQuestionsPracticed / 128
- Consistency (30%): average FSRS retrievability

**Gap computation:**
```
readinessGap = max(0, 90 - currentReadiness)
```

**Daily targets derive from the gap components:**

1. **SRS Reviews:** Always show actual `srsDueCount` -- these are time-sensitive and shouldn't be averaged.
2. **New Questions:** `ceil(unpracticedCount / max(daysRemaining, 1))` capped at [3, 15] range.
3. **Drill Recommendation:** If any category mastery < 50%, recommend drilling weakest. One drill per day of 5-10 questions.
4. **Mock Test:** Recommend if no test in last 3 days AND overall mastery >= 40%.

**"No date" mode:** Same computation but with `daysRemaining = null`. Use a default pacing of ~10 new questions/day, always review SRS due cards, drill weakest category.

**Pace calculation (linear interpolation):**
```
expectedReadiness = startReadiness + (90 - startReadiness) * (elapsedDays / totalDays)
if currentReadiness >= expectedReadiness + 5: "Ahead"
if currentReadiness <= expectedReadiness - 5: "Behind"
else: "On track"
```

Note: `startReadiness` is NOT stored -- it can be approximated as `(currentReadiness * totalDays - readinessTarget * elapsedDays) / daysRemaining`, or simplified to just comparing current readiness to `readinessTarget * (elapsedDays / totalDays)`.

### Estimated Time Calculation

```
estimatedMinutes =
  srsReviewCount * 0.5 +          // 30 sec per SRS card
  newQuestionTarget * 1.0 +        // 1 min per new question
  (drillRecommendation ? drillRecommendation.count * 1.0 : 0) +  // 1 min per drill question
  (mockTestRecommended ? 12 : 0)   // 12 min for a 10-question mock test
```

Round to nearest integer, minimum 1.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Stored daily targets with redistribution | Recompute-on-render from live data | Current best practice | Eliminates stale-data bugs; RDNS-10 comes free |
| Custom date picker libraries | Native `<input type="date">` | HTML5 matured ~2020 | Zero dependency; excellent mobile UX |
| Complex pace tracking databases | Linear interpolation from current state | Standard in adaptive learning apps | Simple, debuggable, honest about limitations |

**Deprecated/outdated:**
- `react-date-picker`, `react-day-picker`: Unnecessary for single-date input. Native input handles this.
- Stored study schedules: Anti-pattern for adaptive systems. Compute from current state.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (via vitest.config.ts) |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `pnpm vitest run src/lib/studyPlan/studyPlanEngine.test.ts` |
| Full suite command | `pnpm test:run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RDNS-07 | Test date persists in localStorage | unit | `pnpm vitest run src/hooks/useTestDate.test.ts -x` | Wave 0 |
| RDNS-08 | Countdown shows correct days remaining | unit | `pnpm vitest run src/lib/studyPlan/studyPlanEngine.test.ts -x` | Wave 0 |
| RDNS-09 | Daily targets compute correctly from readiness gap | unit | `pnpm vitest run src/lib/studyPlan/studyPlanEngine.test.ts -x` | Wave 0 |
| RDNS-10 | Targets adapt when gap or days change | unit | `pnpm vitest run src/lib/studyPlan/studyPlanEngine.test.ts -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm vitest run src/lib/studyPlan/ -x`
- **Per wave merge:** `pnpm test:run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/studyPlan/studyPlanEngine.test.ts` -- covers RDNS-08, RDNS-09, RDNS-10 (pure function unit tests)
- [ ] Framework install: None needed -- Vitest already configured and working

## Open Questions

1. **Pace indicator start point**
   - What we know: Pace = current readiness vs expected readiness at this point in the timeline
   - What's unclear: We don't store "readiness when test date was set" -- so the starting point for linear interpolation is unknown
   - Recommendation: Use simplified pace: compare `currentReadiness / readinessTarget` to `elapsedDays / totalDays`. If readiness fraction > time fraction + 0.05, "Ahead". This avoids needing a stored start point and is more intuitive.

2. **"How did your test go?" trigger timing**
   - What we know: Should prompt after test date passes
   - What's unclear: Exact trigger -- on first Dashboard visit after date? Same day? Day after?
   - Recommendation: Trigger on first Dashboard visit where `daysRemaining <= 0`. Store interaction in localStorage to prevent re-prompting.

3. **NBA integration depth**
   - What we know: Study plan should feed into NBA as a new priority factor
   - What's unclear: Should it be a new NBA state type, or modify urgency of existing types?
   - Recommendation: Add `testDate` and `daysRemaining` to NBAInput. When test date is within 14 days and SRS cards are due, boost SRS priority (already highest non-streak priority). When test date is within 7 days, add a new "test-soon" NBA state that emphasizes review over new learning. Keep changes minimal.

## Sources

### Primary (HIGH confidence)
- Project source code: `src/lib/nba/determineNBA.ts`, `src/lib/readiness/readinessEngine.ts`, `src/hooks/useReadinessScore.ts`, `src/hooks/useNextBestAction.ts` -- architecture patterns verified by reading actual code
- Project source code: `src/views/Dashboard.tsx`, `src/views/SettingsPage.tsx` -- UI integration points verified
- Project source code: `src/components/readiness/ReadinessHeroCard.tsx` -- gradient tier pattern verified
- Project source code: `vitest.config.ts`, existing `.test.ts` files -- test infrastructure verified

### Secondary (MEDIUM confidence)
- Native `<input type="date">` browser support -- well-established, all modern browsers support it; project targets modern PWA browsers

### Tertiary (LOW confidence)
- None -- all findings verified from project source code

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies needed; all patterns exist in codebase
- Architecture: HIGH - Pure function engine + composition hook pattern proven in Phase 43 (readinessEngine, determineNBA)
- Pitfalls: HIGH - Identified from direct code reading and understanding of date math edge cases

**Research date:** 2026-03-01
**Valid until:** 2026-03-31 (stable domain, no external dependency changes expected)
