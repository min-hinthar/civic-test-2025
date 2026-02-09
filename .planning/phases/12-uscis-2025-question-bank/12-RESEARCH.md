# Phase 12: USCIS 2025 Question Bank - Research

**Researched:** 2026-02-09
**Domain:** USCIS civics question data, dynamic answer handling, state personalization, mastery recalibration
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Missing Questions Source & Verification
- Claude researches the best public USCIS source to identify the 8 missing questions and cross-references against the existing 120
- New questions ship with full bilingual (English + Burmese) translations from day one
- Keep current 7 sub-category names -- only add/remap if a question doesn't fit any existing category
- New questions continue the existing ID sequence in their sub-category (GOV-P17, HIST-C17, etc.)
- Distractors (wrong answers) should be plausible but clearly wrong -- same style as existing questions
- Keep the `studyAnswers` array pattern for multi-answer questions
- Full audit scope: Claude decides during research whether to re-verify all 120 existing questions or only add the 8 missing ones

#### Dynamic Answer Handling
- Questions with changing answers (president, senators, governor, etc.) get a `dynamic: true` metadata flag AND code comments explaining what to update and when -- Claude decides the exact marking approach
- **User-facing note:** Show a bilingual "Answer may change with elections" note on dynamic questions -- visible in both study mode and mock test mode
- **Last-updated date:** Show when dynamic answers were last verified -- Claude decides per-question vs global granularity
- Claude identifies all dynamic questions during research phase

#### State Personalization (NEW -- scoped for Phase 12)
- **State picker:** Add a simple state/territory selector (50 states + DC + territories: PR, GU, VI, AS, MP)
- **Picker location:** Available during onboarding flow AND in Settings to change later
- **Pre-populated answers:** When user selects a state, dynamic questions show actual representative names (governor, senators) for that state
- **Data source:** Hybrid approach -- static JSON fallback data shipped with app + periodic API refresh when online (offline-first PWA compatibility)
- **API research:** Claude researches the best free civic data API during research phase

#### Mastery Migration Strategy
- **Let mastery dip naturally** -- 8 new unscored questions (~6% of total) cause a minimal dip that self-corrects as users study
- **No migration notice** -- the dip is small enough to not warrant user communication
- **Immediate recalculation** -- readiness score reflects 128-question bank from the update, no gradual phase-in
- **Counter update:** "Questions practiced" counter updates to X / 128 immediately
- **Weak area detection:** Auto-recalibrates using current question counts per category
- **Interview simulation:** Draws from the full 128-question pool
- **SRS handling:** Claude follows the existing SRS flow for unseen questions (decides auto-add vs first-encounter)

#### 2025 Update Indicator
- **Placement:** Dashboard, study page, mock test intro, and interview sim intro -- everywhere relevant
- **Visual style:** Thin banner/ribbon: "Updated for USCIS 2025 Civics Test" -- bilingual (English + Burmese)
- **What's New splash:** One-time dismissible modal/bottom sheet for existing users highlighting: 8 new questions added, USCIS 2025 update, state personalization feature
- Show "128 questions" in the banner or nearby context

### Claude's Discretion
- Badge threshold adjustments (keep current vs scale proportionally) -- analyze current definitions and recommend
- Mock test question count and pass threshold -- research actual USCIS test format and match it
- Automated test for question bank validation (128 count, unique IDs, Burmese present, valid categories) -- Claude determines appropriate validation level
- Dynamic answer marking approach details (metadata flag vs comments vs both)
- Last-updated date granularity (per-question vs global)
- Whether to do a full audit of existing 120 questions or only find the 8 missing
- SRS entry strategy for new questions

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

## Summary

This phase expands the civics question bank from 120 to 128 questions to match the official USCIS 2025 civics test, adds dynamic answer metadata and state personalization, and updates all dependent metrics. The existing codebase is well-architected for this expansion: the `totalQuestions` constant derives from `allQuestions.length`, and all consumers reference these exports rather than hardcoded counts. The main work involves: (1) identifying and adding the 8 missing questions, (2) extending the `Question` type with dynamic answer metadata, (3) creating a state picker with representative data, (4) adding the "Updated for 2025" indicator UI, and (5) updating mock test format to match the actual USCIS 2025 test (20 questions, 12 to pass).

The research confirms the official 2025 USCIS test format: 20 questions asked from a pool of 128, 12 correct to pass, 9 incorrect to fail. The app's current mock test already uses exactly this format (20 questions, 12 to pass, 9 incorrect limit). No changes needed to test logic.

**Primary recommendation:** Add the 8 missing questions to `uscis-2025-additions.ts`, extend the `Question` interface with a `dynamic` flag, create a `StateContext` provider with bundled JSON fallback data, and let the existing architecture propagate the 128-question total automatically through `allQuestions.length`.

## Cross-Reference: Existing 120 vs Official 128

### Current Question Distribution (120 questions)

| File | Category | IDs | Count |
|------|----------|-----|-------|
| `american-government.ts` | Principles of American Democracy | GOV-P01 to GOV-P12 | 12 |
| `american-government.ts` | System of Government | GOV-S01 to GOV-S35 | 35 |
| `rights-responsibilities.ts` | Rights and Responsibilities | RR-01 to RR-10 | 10 |
| `american-history-colonial.ts` | Colonial Period and Independence | HIST-C01 to HIST-C13 | 13 |
| `american-history-1800s.ts` | 1800s | HIST-101 to HIST-107 | 7 |
| `american-history-recent.ts` | Recent American History | HIST-R01 to HIST-R10 | 10 |
| `symbols-holidays.ts` | Symbols and Holidays | SYM-01 to SYM-13 | 13 |
| `uscis-2025-additions.ts` | Mixed (20 additions) | GOV-P13-P16, GOV-S36-S39, RR-11-13, HIST-C14-C16, HIST-108-109, HIST-R11-R12, SYM-14-15 | 20 |
| **Total** | | | **120** |

### Mapping to Official 2025 USCIS Numbering (128 questions)

The official USCIS 2025 test numbers questions 1-128 across sections: American Government (1-62), Rights and Responsibilities (63-72), American History (73-118), and Symbols and Holidays (119-128).

**Cross-reference result: 8 questions missing from the bank.**

After systematic comparison of all 120 existing question texts against the official 128 list, the following USCIS questions are NOT present in the current bank:

| USCIS # | Question | Category | Proposed ID |
|---------|----------|----------|-------------|
| 14 | "Many documents influenced the United States Constitution. Name one." | Principles of American Democracy | GOV-P17 |
| 26 | "Why do U.S. representatives have shorter terms than senators?" | System of Government | GOV-S40 |
| 27 | "How many senators does each state have?" | System of Government | GOV-S41 |
| 28 | "Why does each state have two senators?" | System of Government | GOV-S42 |
| 37 | "The President of the United States can only serve two terms. Why?" | System of Government | GOV-S43 |
| 49 | "Why is the Electoral College important?" | System of Government | GOV-S44 |
| 55 | "How long do Supreme Court justices serve?" | System of Government | GOV-S45 |
| 56 | "Why do Supreme Court justices serve for life?" | System of Government | GOV-S46 |

**Confidence:** MEDIUM -- I verified these against the citizennow.com transcription of the official USCIS 128Q PDF. The PDF itself could not be directly parsed, so the cross-reference uses a secondary source verified against the official USCIS page structure. The planner should validate these 8 questions against the official PDF during implementation.

### Category Distribution After Addition (128 questions)

| Category | Before | After | Change |
|----------|--------|-------|--------|
| Principles of American Democracy | 16 | 17 | +1 |
| System of Government | 39 | 46 | +7 |
| Rights and Responsibilities | 13 | 13 | 0 |
| Colonial Period and Independence | 16 | 16 | 0 |
| 1800s | 9 | 9 | 0 |
| Recent American History | 12 | 12 | 0 |
| Symbols and Holidays | 15 | 15 | 0 |
| **Total** | **120** | **128** | **+8** |

All 8 missing questions fit existing sub-categories (no new categories needed).

### Audit Recommendation: Existing 120 Questions

**Recommendation: Spot-check, not full re-verification.** The existing 120 questions appear well-aligned with the official list based on topic matching. The USCIS 2025 test uses "most of the same 128 questions as the 2020 version" (per USCIS website). The wording of some questions may differ slightly between the 2008 and 2025 versions (e.g., USCIS #26 "Why do U.S. representatives have shorter terms?" is a new framing). The planner should include a verification task to spot-check 10-15 existing questions against the official PDF for wording alignment, but a full re-verification of all 120 is unnecessary.

## Dynamic Questions Analysis

### Questions with Changing Answers (Confirmed)

Based on the official USCIS test updates page and cross-referencing with the existing question bank, these questions have answers that change with elections or appointments:

| Existing ID | USCIS # | Question Topic | What Changes |
|-------------|---------|----------------|-------------|
| GOV-S08 | 23 | "Who is one of your state's U.S. Senators now?" | State senators change with elections |
| GOV-S11 | 29 | "Name your U.S. Representative" | Changes with redistricting/elections |
| GOV-S16 | 38 | "Name of the President now?" | Changes every 4-8 years |
| GOV-S17 | 39 | "Name of the Vice President now?" | Changes every 4-8 years |
| GOV-S28 | 57 | "Who is the Chief Justice now?" | Changes on appointment |
| GOV-S31 | 61 | "Who is the Governor of your state now?" | Changes with state elections |
| GOV-S32 | 62 | "What is the capital of your state?" | State-specific (static per state) |
| GOV-S34 | -- | "Political party of the President now?" | Changes with President |
| GOV-S35 | 30 | "Name of the Speaker of the House now?" | Changes with elections |

**State-specific questions** (vary by location, not time):
- GOV-S08: State senators
- GOV-S11: U.S. Representative (by district)
- GOV-S31: State governor
- GOV-S32: State capital

**Time-dynamic questions** (change with elections/appointments):
- GOV-S16: President
- GOV-S17: Vice President
- GOV-S28: Chief Justice
- GOV-S34: President's party
- GOV-S35: Speaker of the House

### Recommended Dynamic Marking Approach

**Use both metadata flag AND code comments:**

```typescript
interface Question {
  // ... existing fields
  dynamic?: {
    type: 'time' | 'state';  // time = changes with elections; state = varies by user location
    field: string;            // e.g., 'president', 'senators', 'governor', 'capital'
    lastVerified: string;     // ISO date: '2026-02-09'
    updateTrigger: string;    // e.g., 'presidential election', 'state election cycle'
  };
}
```

**Rationale for per-question `lastVerified`:** State-specific answers change on different cycles (governor races are off-cycle from presidential). A single global date would be misleading. Per-question dates are more accurate and only apply to ~9 questions, so the overhead is minimal.

**User-facing note text (bilingual):**
- EN: "This answer may change with elections. Last verified: [date]"
- MY: "ဤအဖြေသည် ရွေးကောက်ပွဲများနှင့်အတူ ပြောင်းလဲနိုင်ပါသည်။ နောက်ဆုံးအတည်ပြုချိန်: [date]"

## State Personalization Architecture

### Data Requirements

For state personalization, we need per-state:
- **Governor name** (50 states + DC)
- **Two U.S. Senators** (50 states only; DC/territories have no senators)
- **U.S. Representative** (requires congressional district, too granular for a state picker -- recommend "look up your representative" prompt instead)
- **State capital** (static, never changes)
- **President's party** (global, not state-specific)

### API Research Results

| API | Status | Coverage | Cost | Recommendation |
|-----|--------|----------|------|----------------|
| Google Civic Information API | **DEPRECATED** (Representatives API shut down April 2025) | Was comprehensive | Free | Do NOT use |
| ProPublica Congress API | Active | Federal Congress only (senators, reps) | Free | Good for senators |
| Open States API | Active | State legislators, governors | Free (API key required) | Good for governors |
| 5 Calls API | Active | Federal + state reps by address | Free | Alternative to Google Civic |
| Ballotpedia "Who Represents Me?" | Active | Comprehensive | Free tier exists | Backup option |
| Static JSON bundled in app | Always works | Whatever we compile | Free | Mandatory offline fallback |

### Recommended Hybrid Architecture

**Static JSON fallback (bundled in app):**
```
src/data/
  state-representatives.json   # Governor, senators, capital per state/territory
```

**Structure:**
```typescript
interface StateData {
  code: string;        // e.g., 'CA', 'DC', 'PR'
  name: string;        // e.g., 'California'
  capital: string;     // e.g., 'Sacramento'
  governor?: string;   // null for territories without governors
  senators?: [string, string]; // null for DC/territories
  lastUpdated: string; // ISO date for this state's data
}
```

**API refresh strategy:**
- On app load (if online), check a simple JSON endpoint for updates
- Use `fetch` with timeout, fall back silently to bundled data on failure
- Store fetched data in localStorage for offline persistence
- A single hosted JSON file (e.g., on the app's own domain or a CDN) that the maintainer updates after elections -- this is simpler and more reliable than depending on third-party APIs
- ProPublica Congress API is the backup option for automated senator data

**Why a self-hosted JSON file is better than third-party APIs:**
1. No API keys to manage or rotate
2. No rate limits or deprecation risk (Google Civic already deprecated)
3. Offline-first PWA compatibility
4. Trivial to update (edit a JSON file, deploy)
5. No CORS issues
6. The data changes infrequently (max 2-3 times per year after elections)

### State Picker UI

**Location 1 -- Onboarding flow:**
- Add as a step in `OnboardingTour.tsx` (currently 4 steps: Dashboard, Study Guide, Mock Test, Interview)
- New step: "Select Your State" with a dropdown/search
- Skip option for users who prefer not to set it

**Location 2 -- Settings page:**
- Add a new section in `SettingsPage.tsx` under "Appearance" or new "Location" section
- Same dropdown component, pre-populated with current selection

**Storage:**
- New `StateContext` provider wrapping the app (similar to `LanguageContext`)
- Persists to `localStorage` key `civic-prep-user-state`
- Provides `selectedState` and `setSelectedState` to consumers
- Provides `stateData` (governor, senators, capital) derived from selection

### Territory Handling

| Territory | Code | Has Governor | Has Senators | Has U.S. Rep |
|-----------|------|-------------|-------------|-------------|
| Washington, D.C. | DC | Mayor (not Governor) | No | Non-voting delegate |
| Puerto Rico | PR | Yes | No | Resident Commissioner |
| Guam | GU | Yes | No | Non-voting delegate |
| U.S. Virgin Islands | VI | Yes | No | Non-voting delegate |
| American Samoa | AS | Yes | No | Non-voting delegate |
| Northern Mariana Islands | MP | Yes | No | Non-voting delegate |

For territories: show governor (or mayor for DC) but note "no U.S. Senators" for the senator question. Capital is still applicable.

## Mock Test Format Alignment

### Official USCIS 2025 Test Format
- **Question pool:** 128 questions
- **Questions asked:** Up to 20
- **Pass threshold:** 12 correct answers
- **Fail threshold:** 9 incorrect answers
- **Early stop:** Stops after 12 correct OR 9 incorrect

### Current App Mock Test Format
- **Question pool:** 120 questions (will become 128)
- **Questions asked:** 20 (hardcoded `slice(0, 20)`)
- **Pass threshold:** 12 (`PASS_THRESHOLD = 12`)
- **Fail threshold:** 9 (`INCORRECT_LIMIT = 9`)
- **Early stop:** Stops after 12 correct OR 9 incorrect

**Result: The mock test format already matches USCIS 2025 exactly.** No changes needed to `TestPage.tsx` test logic -- just ensure the question pool grows from 120 to 128 (automatic via `allQuestions`).

### Interview Simulation Format
- **Current:** 20 questions (`QUESTIONS_PER_SESSION = 20`), pass at 12
- **USCIS format:** Same as mock test (20 questions, 12 to pass)
- **Result:** Already correct. No changes needed.

## Badge Threshold Analysis

### Current Badge Definitions (from `badgeDefinitions.ts`)

| Badge ID | Category | Threshold | Uses `totalQuestions`? |
|----------|----------|-----------|----------------------|
| streak-7 | streak | 7 day streak | No |
| streak-14 | streak | 14 day streak | No |
| streak-30 | streak | 30 day streak | No |
| accuracy-90 | accuracy | 90% on a test | No |
| accuracy-100 | accuracy | 100% on a test | No |
| coverage-all | coverage | `uniqueQuestionsAnswered >= totalQuestions` | **YES** |
| coverage-mastered | coverage | All categories mastered | Indirectly |

**Analysis:**
- `coverage-all` badge: Already uses `totalQuestions` (imported from `@/constants/questions`). When the bank grows to 128, the threshold automatically updates. A user who had answered all 120 will need to answer 8 more to earn/maintain this badge. This is the intended behavior per the "let mastery dip naturally" decision.
- `accuracy-90` and `accuracy-100`: These are percentage-based on individual test sessions (20 questions), not on the full bank. No change needed.
- `coverage-mastered`: Uses `categoriesMastered >= totalCategories`. The 7 categories remain unchanged. No threshold adjustment needed.

**Recommendation: Keep all badge thresholds as-is.** The architecture already handles the expansion correctly because:
1. Coverage badge uses `totalQuestions` dynamically
2. Accuracy badges are per-session percentages
3. Streak badges are time-based
4. Category mastery is computed from answer history against actual question counts per category

## Architecture Patterns

### Question Data Pipeline

```
src/constants/questions/
  ├── american-government.ts          # GOV-P01-12, GOV-S01-35
  ├── rights-responsibilities.ts      # RR-01-10
  ├── american-history-colonial.ts    # HIST-C01-13
  ├── american-history-1800s.ts       # HIST-101-107
  ├── american-history-recent.ts      # HIST-R01-10
  ├── symbols-holidays.ts            # SYM-01-13
  ├── uscis-2025-additions.ts         # Mixed 20 additions (GOV-P13-16, GOV-S36-39, etc.)
  └── index.ts                        # Barrel: aggregates all, exports allQuestions + totalQuestions
```

**Key insight:** The barrel file (`index.ts`) computes `totalQuestions = allQuestions.length`. Every consumer imports from here. Adding questions to `uscis-2025-additions.ts` automatically propagates to all consumers.

### Consumer Dependency Map

These files import `totalQuestions` or `allQuestions` and will be affected by the 120->128 change:

**Auto-update (no code changes needed):**
- `src/lib/social/badgeDefinitions.ts` -- uses `totalQuestions` for coverage badge
- `src/pages/LandingPage.tsx` -- displays `totalQuestions` in UI text
- `src/pages/ProgressPage.tsx` -- shows "X of {totalQuestions} questions practiced"
- `src/pages/Dashboard.tsx` -- passes `totalQuestions` to `ReadinessIndicator`
- `src/components/dashboard/ReadinessIndicator.tsx` -- computes coverage %
- `src/components/onboarding/OnboardingTour.tsx` -- mentions question count in text

**May need text updates:**
- `src/constants/questions/index.ts` -- comment says "Total: 120 questions" (update comment)
- `src/constants/questions/uscis-2025-additions.ts` -- comment says "extend to 120" (update comment)

### New Files Needed

```
src/data/
  state-representatives.json         # Static fallback: governor, senators, capital per state

src/contexts/
  StateContext.tsx                    # State picker context provider

src/components/
  state/
    StatePicker.tsx                   # Dropdown/search component for state selection
  update/
    WhatsNewModal.tsx                 # One-time dismissible What's New splash
    UpdateBanner.tsx                  # "Updated for USCIS 2025" thin banner
```

### Pattern: Question Type Extension

```typescript
// src/types/index.ts - extend Question interface
export interface DynamicAnswerMeta {
  type: 'time' | 'state';
  field: string;
  lastVerified: string;
  updateTrigger: string;
}

export interface Question {
  id: string;
  question_en: string;
  question_my: string;
  category: Category;
  studyAnswers: StudyAnswer[];
  answers: Answer[];
  explanation?: Explanation;
  dynamic?: DynamicAnswerMeta;  // NEW: marks questions with changing answers
}
```

### Pattern: State Context Provider

```typescript
// src/contexts/StateContext.tsx
interface StateContextValue {
  selectedState: string | null;  // state code or null
  setSelectedState: (code: string | null) => void;
  stateData: StateData | null;   // governor, senators, capital
}
```

Follow the `LanguageContext` pattern: `localStorage` persistence, lazy initialization from storage on mount.

### Pattern: Dynamic Answer Display

For questions with `dynamic?.type === 'state'`:
- Look up current state from `StateContext`
- If state is set, show the state-specific answer (e.g., "Your governor is [Name]")
- If state is not set, show the generic prompt (e.g., "Check your state's governor before the test")

For questions with `dynamic?.type === 'time'`:
- Show the currently-coded answer
- Add the bilingual "Answer may change with elections" note
- Show `lastVerified` date

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State/territory list | Custom state array | Bundled JSON with official FIPS codes | Ensures completeness, territories included |
| Dropdown search | Custom search input | Simple `<select>` with Radix UI Select | 56 items is small enough for a select, no search needed |
| API polling | Custom interval timer | Simple `fetch` on mount with fallback | Data changes rarely, no WebSocket needed |
| Per-question timer tracking | Custom date tracking system | Simple ISO date string in question metadata | Minimal overhead, human-readable |

**Key insight:** The state representative data changes at most 2-3 times per year. A static JSON file with manual updates after elections is simpler and more reliable than any API integration. API integration adds complexity (keys, rate limits, error handling, CORS) for data that changes infrequently.

## Common Pitfalls

### Pitfall 1: Hardcoded 120 in Comments/Strings
**What goes wrong:** UI displays "120 questions" somewhere that uses a hardcoded string instead of `totalQuestions`
**Why it happens:** Most places use the dynamic import, but comments and some text may be hardcoded
**How to avoid:** Global search for "120" in src/ -- update comments in `index.ts` and `uscis-2025-additions.ts`
**Warning signs:** Any string literal containing "120" in question-related context

### Pitfall 2: React Compiler Violations in New Context
**What goes wrong:** New `StateContext` provider causes lint errors with React Compiler rules
**Why it happens:** Project uses strict React Compiler ESLint rules (no setState in effects, no ref.current in render)
**How to avoid:** Follow `LanguageContext` pattern exactly -- use `useState` with lazy initializer for localStorage, `useEffect` for hydration
**Warning signs:** `react-hooks/set-state-in-effect` and `react-hooks/refs` lint errors

### Pitfall 3: Breaking Existing SRS Cards
**What goes wrong:** SRS cards reference question IDs (e.g., 'GOV-P01'). New questions have no SRS cards yet.
**Why it happens:** SRS uses question IDs as keys. New questions simply don't exist in the SRS store.
**How to avoid:** This is actually fine -- new questions appear as "not in deck" and users add them manually via the existing "Add to Deck" button. The SRS system handles absent cards gracefully.
**SRS strategy for new questions:** First-encounter approach (user sees them in study/practice, adds manually). No auto-add.

### Pitfall 4: Mock Test Still Selects from Old Pool
**What goes wrong:** Mock test doesn't include new questions
**Why it happens:** `TestPage.tsx` does `fisherYatesShuffle(allQuestions).slice(0, 20)` -- this already draws from the full pool. Adding to `allQuestions` automatically includes new questions.
**How to avoid:** No action needed -- the architecture handles this automatically.

### Pitfall 5: Territory Data Gaps
**What goes wrong:** State picker shows territories but tries to display senators for DC/PR (they have none)
**Why it happens:** DC and territories don't have U.S. Senators
**How to avoid:** `senators` field in `StateData` should be nullable. UI shows "N/A" or territory-specific note.

### Pitfall 6: Category Mapping Drift
**What goes wrong:** New questions use category strings that don't match the `Category` type union
**Why it happens:** TypeScript will catch this, but only if the `category` field type is enforced
**How to avoid:** All 8 new questions use existing categories ("Principles of American Democracy" and "System of Government"). TypeScript enforcement is already in place via `Question.category: Category`.

### Pitfall 7: What's New Modal Blocks Navigation
**What goes wrong:** Dialog/modal with `asChild` + animation causes pointer event issues (known project pitfall)
**Why it happens:** `backfaceVisibility: hidden` doesn't block pointer events; `pointer-events-none` wrapper needed
**How to avoid:** Use `pointer-events-none` wrapper + `pointer-events-auto` content, per MEMORY.md pattern

### Pitfall 8: Onboarding State Picker Hydration Mismatch
**What goes wrong:** SSR renders different content than client when state is stored in localStorage
**Why it happens:** localStorage is client-only; server renders without state selection
**How to avoid:** Follow `useOnboarding.ts` pattern -- initialize to null/default to match SSR, then sync from localStorage in useEffect

## Code Examples

### Adding Missing Questions to uscis-2025-additions.ts

```typescript
// Source: Official USCIS 2025 128Q PDF, verified via citizennow.com
// These 8 questions complete the 128-question bank

// PRINCIPLES OF AMERICAN DEMOCRACY (GOV-P17)
{
  id: 'GOV-P17',
  question_en: 'Many documents influenced the United States Constitution. Name one.',
  question_my: 'စာရွက်စာတမ်းများစွာက အမေရိကန်ဖွဲ့စည်းပုံအခြေခံဥပဒေကို လွှမ်းမိုးခဲ့သည်။ တစ်ခုကို အမည်ပေးပါ။',
  category: 'Principles of American Democracy',
  studyAnswers: [
    { text_en: 'Magna Carta', text_my: 'မဂ္ဂနာကာတာ' },
    { text_en: 'Articles of Confederation', text_my: 'ကွန်ဖက်ဒရေးရှင်းစာချုပ်' },
    { text_en: 'Federalist Papers', text_my: 'ဖက်ဒရယ်လစ်စာတမ်းများ' },
  ],
  answers: [
    { text_en: 'Magna Carta', text_my: 'မဂ္ဂနာကာတာ', correct: true },
    { text_en: 'Treaty of Paris', text_my: 'ပါရီစာချုပ်', correct: false },
    { text_en: 'Monroe Doctrine', text_my: 'မွန်ရိုးဒေါ့ကတရင်း', correct: false },
    { text_en: 'Gettysburg Address', text_my: 'ဂက်တီးစဘတ်မိန့်ခွန်း', correct: false },
  ],
}
```

### Dynamic Answer Metadata Pattern

```typescript
// Source: Codebase pattern from existing Question interface
{
  id: 'GOV-S16',
  question_en: 'What is the name of the President of the United States now?',
  // ... existing fields ...
  dynamic: {
    type: 'time',
    field: 'president',
    lastVerified: '2026-02-09',
    updateTrigger: 'presidential election (every 4 years)',
  },
}
```

### State Context Provider Pattern

```typescript
// Source: Following LanguageContext.tsx pattern in codebase
'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import stateData from '@/data/state-representatives.json';

const STATE_KEY = 'civic-prep-user-state';

interface StateContextValue {
  selectedState: string | null;
  setSelectedState: (code: string | null) => void;
  stateInfo: StateInfo | null;
}

const StateContext = createContext<StateContextValue>({
  selectedState: null,
  setSelectedState: () => {},
  stateInfo: null,
});

export function StateProvider({ children }: { children: ReactNode }) {
  // Initialize to null for SSR compatibility
  const [selectedState, setSelectedStateInternal] = useState<string | null>(null);

  // Sync from localStorage after mount (hydration-safe)
  useEffect(() => {
    const stored = localStorage.getItem(STATE_KEY);
    if (stored) {
      setSelectedStateInternal(stored);
    }
  }, []);

  const setSelectedState = useCallback((code: string | null) => {
    setSelectedStateInternal(code);
    if (code) {
      localStorage.setItem(STATE_KEY, code);
    } else {
      localStorage.removeItem(STATE_KEY);
    }
  }, []);

  const stateInfo = selectedState
    ? (stateData as Record<string, StateInfo>)[selectedState] ?? null
    : null;

  return (
    <StateContext.Provider value={{ selectedState, setSelectedState, stateInfo }}>
      {children}
    </StateContext.Provider>
  );
}

export const useUserState = () => useContext(StateContext);
```

### What's New Modal Pattern

```typescript
// Source: Following WelcomeModal.tsx pattern in codebase
const WHATS_NEW_KEY = 'civic-prep-whats-new-v2025-seen';

// Show once for existing users (check localStorage)
// Dismiss permanently on close
// Content: 8 new questions, USCIS 2025 update, state personalization
```

### Update Banner Pattern

```typescript
// Thin bilingual banner, placed at top of relevant pages
<div className="bg-primary-subtle border-b border-primary/20 px-4 py-2 text-center">
  <p className="text-xs font-semibold text-primary">
    Updated for USCIS 2025 Civics Test -- 128 Questions
  </p>
  <p className="font-myanmar text-xs text-primary/80">
    USCIS 2025 နိုင်ငံသားရေးရာစာမေးပွဲအတွက် မွမ်းမံပြီး -- မေးခွန်း ၁၂၈ ခု
  </p>
</div>
```

## Validation Test Strategy

### Recommended: Question Bank Validation Test

Create `src/constants/questions/questions.test.ts`:

```typescript
import { allQuestions, totalQuestions } from './index';

describe('Question Bank Validation', () => {
  it('has exactly 128 questions', () => {
    expect(totalQuestions).toBe(128);
    expect(allQuestions).toHaveLength(128);
  });

  it('all IDs are unique', () => {
    const ids = allQuestions.map(q => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all questions have Burmese translations', () => {
    for (const q of allQuestions) {
      expect(q.question_my).toBeTruthy();
      expect(q.studyAnswers.every(a => a.text_my)).toBe(true);
      expect(q.answers.every(a => a.text_my)).toBe(true);
    }
  });

  it('all questions belong to valid categories', () => {
    const validCategories = [
      'Principles of American Democracy',
      'System of Government',
      'Rights and Responsibilities',
      'American History: Colonial Period and Independence',
      'American History: 1800s',
      'Recent American History and Other Important Historical Information',
      'Civics: Symbols and Holidays',
    ];
    for (const q of allQuestions) {
      expect(validCategories).toContain(q.category);
    }
  });

  it('each question has exactly one correct answer', () => {
    for (const q of allQuestions) {
      const correctCount = q.answers.filter(a => a.correct).length;
      expect(correctCount).toBe(1);
    }
  });

  it('dynamic questions have valid metadata', () => {
    const dynamicQs = allQuestions.filter(q => q.dynamic);
    expect(dynamicQs.length).toBeGreaterThan(0);
    for (const q of dynamicQs) {
      expect(['time', 'state']).toContain(q.dynamic!.type);
      expect(q.dynamic!.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 100 USCIS questions (2008 test) | 128 USCIS questions (2025 test) | Oct 20, 2025 | App must match 128Q before users file N-400 after this date |
| 10 questions asked, 6 to pass | 20 questions asked, 12 to pass | Oct 20, 2025 | Mock test format already matches |
| Google Civic API for rep data | Google Civic API deprecated | April 2025 | Must use alternatives (ProPublica, 5 Calls, or self-hosted JSON) |

**Important timing note:** The 2025 USCIS civics test takes effect for N-400 applications filed on or after October 20, 2025. Users filing before that date take the 2008 test (100 questions, 10 asked, 6 to pass). The app should display 128 questions regardless, as users preparing now need the full set.

## Open Questions

1. **Exact wording verification for 8 missing questions**
   - What we know: Questions identified via citizennow.com transcription of official PDF
   - What's unclear: Exact USCIS wording may differ slightly from transcription
   - Recommendation: Planner includes a task to verify against the official PDF during implementation (download and manually check)

2. **Burmese translations for 8 new questions**
   - What we know: Must be natural Burmese, not word-for-word translation (per existing pattern)
   - What's unclear: Translation quality -- the implementer will write them, but they should be reviewed
   - Recommendation: Follow existing Burmese translation style in the codebase; flag for native speaker review if available

3. **Self-hosted JSON endpoint for state data updates**
   - What we know: Static JSON fallback ships with app; optional API refresh is desired
   - What's unclear: Where to host the update endpoint (same Vercel deployment? separate CDN?)
   - Recommendation: Start with static JSON only. API refresh can be a follow-up task if needed. Data changes at most 2-3x/year.

## Sources

### Primary (HIGH confidence)
- [USCIS 2025 Civics Test Official Page](https://www.uscis.gov/citizenship-resource-center/naturalization-test-and-study-resources/2025-civics-test) -- test format, 20 questions, 12 to pass
- [USCIS 128 Questions PDF](https://www.uscis.gov/sites/default/files/document/questions-and-answers/2025-Civics-Test-128-Questions-and-Answers.pdf) -- official question list (PDF, not directly parseable)
- Existing codebase: `src/constants/questions/`, `src/types/index.ts`, `src/lib/mastery/`, `src/lib/social/badgeDefinitions.ts` -- current architecture

### Secondary (MEDIUM confidence)
- [citizennow.com 128 Questions Guide](https://citizennow.com/blog/128-civics-questions-and-answers-2025-test-guide/) -- transcription of official 128Q list, used for cross-reference
- [Federal Register Notice](https://www.federalregister.gov/documents/2025/09/18/2025-18050/notice-of-implementation-of-2025-naturalization-civics-test) -- implementation date October 20, 2025
- [ProLiteracy Update Guide](https://www.proliteracy.org/news/what-to-know-about-the-2025-updates-to-the-us-citizenship-civics-test/) -- test content changes overview

### Tertiary (LOW confidence)
- [Google Civic API Deprecation Notice](https://groups.google.com/g/google-civicinfo-api/c/9fwFn-dhktA) -- Representatives API turned down April 2025
- [5 Calls Representatives API](https://5calls.org/representatives-api/) -- alternative civic data provider, needs validation
- [Open States API](https://docs.openstates.org/api-v3/) -- state governor data, needs validation

## Metadata

**Confidence breakdown:**
- Question bank expansion: HIGH -- Official USCIS source confirms 128 questions; cross-reference identifies 8 missing
- Architecture patterns: HIGH -- Existing codebase patterns are well-documented and consistent
- Dynamic answer handling: HIGH -- Questions with changing answers identified from official USCIS test updates page
- State personalization: MEDIUM -- API landscape is shifting (Google deprecated); recommend static JSON first
- Badge thresholds: HIGH -- Analysis shows current thresholds auto-adapt; no changes needed
- Mock test format: HIGH -- Already matches USCIS 2025 format exactly

**Research date:** 2026-02-09
**Valid until:** 2026-05-09 (3 months -- question content is stable; API landscape may shift)
