# Feature Landscape: v4.0 Intelligent Study & Content Enrichment

**Domain:** Bilingual civics test prep PWA -- adding intelligent study guidance, content depth, and test readiness awareness
**Researched:** 2026-02-23
**Focus:** Test readiness scoring, test date countdown with daily targets, smart weak-area drill, mnemonics/memory aids, study tips per category, deeper explanations

## Context: What Already Exists (v1.0-v3.0 Delivered)

These features are BUILT and SHIPPED, and the new features depend on them:

**Study intelligence infrastructure (already built):**
- `calculateCategoryMastery()` -- recency-weighted mastery per category (exponential decay, 14-day half-life, test 1.0x / practice 0.7x weights)
- `calculateOverallMastery()` -- question-count-weighted average across 7 USCIS categories
- `detectWeakAreas()` -- categories below configurable threshold (default 60%), sorted weakest-first
- `detectStaleCategories()` -- categories with no recent activity (default 7 days)
- `getNextMilestone()` -- bronze (50%) / silver (75%) / gold (100%) progression
- `selectPracticeQuestions()` -- 70/30 weak/strong mix using per-question accuracy
- `getWeakQuestions()` -- all questions below accuracy threshold, shuffled
- `computeReadiness()` in NBA engine: `accuracy * 0.4 + coverage * 0.5 + streakBonus (max 10)`
- `determineNextBestAction()` -- 9-state priority chain recommending next study action
- FSRS spaced repetition engine (ts-fsrs) with IndexedDB persistence and Supabase sync
- Answer history stored per question with timestamps and session type

**Content infrastructure (already built):**
- 128 USCIS 2025 questions across 7 categories with stable IDs
- `Explanation` type with fields: `brief_en`, `brief_my`, `mnemonic_en?`, `mnemonic_my?`, `citation?`, `funFact_en?`, `funFact_my?`, `relatedQuestionIds?`, `commonMistake_en?`, `commonMistake_my?`
- Current content coverage: 17/128 have mnemonics, 25/128 have fun facts, 28/128 have common mistakes, 48/128 have citations, 128/128 have related question IDs
- Bilingual rendering throughout (BilingualText, BilingualHeading)

**UI infrastructure (already built):**
- Dashboard with NBA single-CTA, CompactStatRow (streak, mastery%, SRS due)
- Progress Hub with 4 tabs (Overview/Categories/History/Achievements)
- Glass-morphism 3-tier card system, spring animations, celebration choreography

---

## Table Stakes

Features users expect from a test prep app once it has tracking and practice modes. Missing = the app gives data but no actionable guidance.

### Test Readiness Score (Visible, Prominent)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Readiness score as a first-class UI element** | Users need a single number answering "Am I ready?" Every serious test prep app (Achievable, NCLEX Archer, 300Hours CFA, TEVO) shows a readiness percentage prominently. The app already computes this in the NBA engine (`computeReadiness`) but it is NOT shown to the user as a visible score -- only used internally for NBA state transitions. | Med | The formula exists: `accuracy * 0.4 + coverage * 0.5 + streakBonus (max 10)`. Promote it from internal NBA helper to a first-class UI component. Show on Dashboard (replacing or augmenting the CompactStatRow mastery%) and in Progress Hub Overview tab. Use a radial progress ring or arc gauge for visual impact. Color-code: red (0-39), amber (40-59), green (60-79), gold (80-100). |
| **Readiness score breakdown** | A single number without explanation is anxiety-inducing. Users need to see WHAT drives the score to know HOW to improve. Achievable shows "practice exams carry most weight." CFA 300Hours shows per-topic breakdown. | Low | Show sub-scores below the main readiness ring: (1) Recent Accuracy (last 5 tests) -- "How well you're scoring", (2) Question Coverage (unique questions practiced / 128) -- "How much you've covered", (3) Consistency Bonus (streak-based) -- "Your study consistency". Each with its own mini bar or percentage. Users can see which factor to improve. |
| **Readiness formula tuning** | The current formula weights coverage at 50%, accuracy at 40%, streak at 10%. For a pass/fail civics test (12/20 = 60% threshold), accuracy should be dominant. A user who aced 5 mock tests but only covered 50 questions IS ready. A user who touched all 128 questions at 40% accuracy is NOT. | Low | Recommended rebalance: `accuracy * 0.5 + coverage * 0.35 + streakBonus (max 15)`. Also consider: (a) minimum mock test count threshold (no readiness above 70% without at least 2 mock tests), (b) weight recent tests exponentially more than older ones, (c) penalize zero-coverage categories (any category with 0 questions attempted caps readiness at 60%). Pure logic change, no UI work. |

### Test Date Countdown with Daily Targets

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Set test date** | Every serious test prep app (CFA 300Hours, UWorld, Blueprint, Citizen Now, Canadian Citizenship Test app) lets users set their exam date. Without it, study feels aimless. Users preparing for USCIS interviews have a known N-400 interview date. | Low | Settings page: date picker to set test date. Store in localStorage (or IndexedDB with other user prefs). Optional -- app works fine without it. Display "X days remaining" prominently when set. |
| **Countdown display** | Once a date is set, show it everywhere relevant: Dashboard, Progress Hub, study sessions. Creates urgency without anxiety. | Low | Dashboard: small countdown badge near readiness score ("23 days left"). Progress Hub: countdown in Overview tab header. Study session: subtle reminder in header ("Day 23 of 45"). Use warm, encouraging tone -- NOT scary red countdown. |
| **Daily study targets** | Given a test date and current progress, calculate what the user should do each day. CFA study planners and UWorld generate daily task lists. For 128 civics questions this is simpler: backward-plan from test date to ensure all questions are reviewed. | Med | Algorithm: (1) Calculate days remaining, (2) Calculate uncovered questions, (3) Divide into daily chunks: `dailyNewQuestions = ceil(uncoveredQuestions / daysRemaining)`, (4) Factor in SRS review load (cards due today), (5) Output: "Today: Review X SRS cards + Study Y new questions + Take practice quiz if you haven't in 3+ days". Show as a card on Dashboard. Adjust dynamically as user completes tasks. |
| **Adaptive pacing** | If the user misses a day, redistribute. If they study ahead, reduce. UWorld's Dynamic Study Planner adjusts automatically. FSRS Helper's "Load Balance" redistributes cards across days. | Low | Recalculate daily targets on each Dashboard visit. No need for complex rescheduling -- just divide remaining work by remaining days. If days remaining < 7, switch to "intensive mode" message: "Focus on weak areas and take a mock test every other day." |

### Smart Weak-Area Drill Mode

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Dedicated weak-area drill entry point** | The app already has `selectPracticeQuestions()` with 70/30 weak/strong mix and `getWeakQuestions()`. But there is no dedicated UI entry point that says "Drill your weak areas." Users must infer this from category practice. Brainscape, Quizlet Learn, and AdeptLR all have explicit "focus on what you don't know" modes. | Low | Add a "Weak Area Drill" button/card on Dashboard (when weak areas exist) and in Study Guide. Routes to practice mode but pre-selects only weak questions (accuracy < 60%). Uses existing `getWeakQuestions()`. Show which categories will be drilled before starting. |
| **Category-level drill recommendation** | When a category is weak, tell the user explicitly: "American History: Colonial Period is your weakest area at 32%. Drill it." The NBA engine already detects weak categories (`findWeakestCategory`) but only shows one at a time. | Low | In Progress Hub Categories tab, add a "Drill" button on categories below threshold. Color-code category cards: green (>75%), amber (50-75%), red (<50%). Show specific question count: "8 of 16 questions need review." |
| **Drill session feedback** | After a weak-area drill session, show improvement. "You improved Colonial History from 32% to 48%!" Brainscape shows confidence rating changes. Quizlet shows "Not Studied -> Still Learning -> Mastered" transitions. | Low | On practice results screen, compare pre-session mastery to post-session mastery for each drilled category. Show delta with arrow icon. This is a display-only change using existing `calculateCategoryMastery()` before and after. |

---

## Differentiators

Features that set the app apart from generic civics test apps. Not expected, but create the "this app actually helps me learn" feeling.

### Mnemonics & Memory Aids (Content Enrichment)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Expand mnemonic coverage from 17 to 128 questions** | Currently only 17/128 questions have `mnemonic_en`/`mnemonic_my` populated. Mnemonics are the single most effective memorization tool for factual recall (Brainscape, Memrise, Picmonic all center on this). For civics questions with arbitrary facts ("How many amendments?" "27" -- WHY 27?), mnemonics are critical. | High | Content authoring task, not code. Types of mnemonics to use: (a) Acronyms -- "RAPPS" for First Amendment rights (already exists), (b) Number associations -- "Senator = Six years, both start with S" (already exists), (c) Rhymes -- "In 1492, Columbus sailed the ocean blue", (d) Visual associations -- "The Constitution has 7 articles like 7 days of the week", (e) Story hooks -- linking facts to memorable narratives. Must be bilingual. The Burmese mnemonics may need different devices than English ones since letter/sound associations differ. |
| **Expand fun fact coverage from 25 to 128 questions** | Fun facts create emotional connections to dry material. "The Liberty Bell cracked the first time it was rung" makes the Symbols category memorable. Cultural connections help Burmese immigrants relate American concepts to familiar ones. | High | Content authoring task. Focus on: (a) surprising facts that stick, (b) cultural bridges to Myanmar/Burmese context where possible (e.g., comparing the US federal system to Myanmar's states), (c) human interest stories behind constitutional amendments. |
| **Expand common mistake coverage from 28 to 128** | Knowing WHY wrong answers are wrong is as valuable as knowing the right answer. "Many people confuse the Declaration of Independence with the Constitution." The USCIS 2025 test explicitly targets common confusions (e.g., Federalist Papers question). | Med | Content authoring task. Focus on the questions with lowest accuracy rates (from real user data if available, or from published "hardest questions" lists). The 10 hardest citizenship test questions are well-documented and should be priority targets. |
| **Mnemonic display in study/review contexts** | Mnemonics should appear: (a) in flashcard backs (already rendered if present via Explanation component), (b) in post-answer feedback panel, (c) in SRS review cards, (d) in a dedicated "Memory Aids" view per question. Currently, mnemonics render when present but there is no emphasis or special visual treatment. | Low | Add a lightbulb icon + distinct styling for mnemonic lines in FeedbackPanel and flashcard explanations. Make mnemonics visually distinct from explanations (e.g., indented block with accent border, slightly different background). This helps users recognize "this is a memory trick" vs "this is an explanation." |
| **"Tricky Questions" collection** | Surface the questions that users statistically get wrong most often. USCIS publishes info about harder questions (Federalist Papers, amendments, etc.). Mark these in the UI so users know to pay extra attention. | Low | Add a `difficulty` field to Question type or derive it from global accuracy data. Show a "Tricky" badge on hard questions in Study Guide and flashcard views. Allow filtering by difficulty. The 2025 test expansion specifically added harder questions -- these should be flagged. |

### Study Tips per Category

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Category introduction with study strategy** | Before drilling a category, show a brief intro card: "American Government has 47 questions covering the Constitution, branches of government, and your representatives. TIP: Focus on numbers first (how many senators, representatives, amendments) -- they are the most testable facts." | Med | Author 7 category introduction objects (one per USCIS category) with: (a) what the category covers, (b) how many questions, (c) study strategy tip, (d) common pitfalls for this category, (e) estimated study time. Bilingual. Display as a dismissible card at the top of category practice. Store dismissal in localStorage so it only shows once per category. |
| **Post-session study tips** | After finishing a practice session, show a contextual tip based on performance. Did poorly on history dates? "Try creating a timeline -- ordering events helps you remember years." Did well? "Great job! Review these again in 3 days to lock them in." | Low | Map performance patterns to tip strings. 5-10 tips per category, selected based on: (a) accuracy in session, (b) types of questions missed (dates vs names vs concepts), (c) first attempt vs repeat. Bilingual. Show as a card on the results screen below the score. |
| **"How to Study" tips in Settings/Help** | General study strategies page: (a) Use spaced repetition (explain what it is), (b) Study in short sessions (15-20 min), (c) Test yourself rather than re-reading, (d) Study the hardest questions first, (e) Take mock tests weekly. Localized for civics test context. | Low | Static content page accessible from Settings. 5-7 tips with bilingual explanations. Simple glass cards with icons. No dynamic data. One-time authoring effort. |

### Deeper Explanations with Historical Context

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Expand citation coverage from 48 to 128** | Citations ground answers in authoritative sources. "Article I, Section 3 of the Constitution" or "The 19th Amendment (1920)". Only 48 questions currently have citations. For a civics test, constitutional/legal citations are expected. | Med | Content authoring task. Many questions have obvious citations (amendments, articles, laws). Some questions (geography, holidays) may not have formal citations -- use descriptive references instead ("Established by Congress in 1870" for Memorial Day). |
| **"See Also" enhancement** | All 128 questions have `relatedQuestionIds` populated (128/128). Currently these are just IDs. Add a "Related Questions" section in the question detail view that shows clickable links to related questions. This creates a knowledge web -- studying one question naturally leads to related ones. | Low | UI-only work. When showing a question's explanation (in flashcard back, FeedbackPanel, or study guide), render related questions as tappable chips or a small list. Navigate to that question's detail on tap. This already has data; it just needs rendering. |

---

## Anti-Features

Features to explicitly NOT build. Each sounds valuable but adds complexity disproportionate to value for a 128-question civics test.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **AI-generated personalized study plans** | Requires API calls (cost, latency, offline incompatibility), risk of hallucinated advice for a test with life-changing consequences. The question bank is finite (128) and the test format is known. Simple arithmetic (remaining questions / remaining days) is sufficient and deterministic. | Calculate daily targets with simple division. The existing FSRS algorithm already handles optimal review scheduling. |
| **Adaptive difficulty engine** | Machine learning-based difficulty adjustment (like AdeptLR's 50-question calibration) is overkill for 128 fixed questions. The existing 70/30 weak/strong selection in `selectPracticeQuestions()` plus FSRS review scheduling already adapts to the user's level. Adding another layer of "intelligence" creates complexity without clear benefit. | Use existing weak-area detection + FSRS. These are battle-tested algorithms. Enhance their visibility in the UI rather than replacing them. |
| **Gamified study streaks with penalties** | Duolingo's streak freeze and heart system creates anxiety. This app serves immigrants preparing for a consequential test -- anxiety reduction is a core design principle. Study consistency matters, but punishing breaks is counterproductive. | Keep the existing streak system (reward-only, no penalties). Add daily targets as gentle suggestions, not requirements. |
| **User-generated mnemonics/content** | Memrise allows user-created "mems." For a bilingual app serving a specific community, user-generated content creates moderation burden, quality control issues, and potential for inappropriate/incorrect content. | Author all mnemonics editorially. Quality > quantity. A wrong mnemonic is worse than no mnemonic. |
| **Video explanations** | Video content for 128 questions requires production, storage (CDN costs), bandwidth, and offline caching (massive). The USCIS already provides video resources. The app's value is in practice and tracking, not content delivery. | Link to official USCIS study videos from the "How to Study" page. Don't host video content. |
| **Complex scheduling UI (calendar view, drag-to-reschedule)** | Calendar-based study planners (like UWorld, Blueprint) serve multi-month, multi-subject exam prep. Civics test prep is simpler: 128 questions, one subject, typically 1-3 months of study. A full calendar UI is over-engineering. | Show "Today's Plan" as a simple card with 2-3 tasks. No calendar. No drag-and-drop. |
| **Predictive pass probability** | "You have a 78% chance of passing" sounds impressive but is misleading without validated psychometric models. The civics test format (10 questions from 128, answer 6 correctly in the 2008 version; 20 from 128, answer 12 in the 2025 version) makes prediction unreliable -- question selection is random. | Show readiness score as a percentage without claiming it predicts pass probability. Frame it as "study completeness" not "pass chance." |

---

## Feature Dependencies

```
[Test Readiness Score]
  Readiness formula tuning (pure logic, no UI)
      |
      v
  Readiness score UI component (radial ring + breakdown)
      |
      v
  Dashboard integration (replace/augment CompactStatRow mastery%)
      |
      v
  Progress Hub integration (Overview tab)

[Test Date & Daily Targets]
  Set test date (Settings page, localStorage)
      |
      v
  Countdown display (Dashboard + Progress Hub)
      |
      v
  Daily study target calculation
      |
      v
  "Today's Plan" card on Dashboard
      |
  (depends on Readiness Score for "take a mock test" recommendation)

[Smart Weak-Area Drill]
  Weak area drill entry point (Dashboard + Study Guide)
      |  (uses existing getWeakQuestions() + detectWeakAreas())
      v
  Category-level drill buttons (Progress Hub Categories tab)
      |
      v
  Drill session improvement feedback (results screen delta display)

[Mnemonics & Memory Aids]
  Author mnemonics for all 128 questions (content task, no code)
      |  (populate existing mnemonic_en/mnemonic_my fields)
      v
  Mnemonic visual treatment in UI (lightbulb styling)
      |
      v
  "Tricky Questions" collection (derived from accuracy data or hardcoded)

[Study Tips]
  Category introduction cards (7 authored objects)
      |
      v
  Post-session contextual tips (performance-mapped strings)
      |
      v
  "How to Study" static page (Settings-accessible)

[Content Enrichment]
  Expand fun facts (25 -> 128, content task)
  Expand common mistakes (28 -> 128, content task)
  Expand citations (48 -> 128, content task)
      |  (all independent content tasks, no code deps)
      v
  "See Also" related questions UI (renders existing relatedQuestionIds)

[Cross-cutting dependencies]
  Readiness Score <-- needed by --> Daily Targets (mock test recommendations)
  Weak-Area Drill <-- enhanced by --> Mnemonics (drill shows mnemonics in feedback)
  Study Tips <-- contextual from --> Weak-Area Drill (post-drill tips)
  Content Enrichment <-- consumed by --> all study/review/feedback UIs
```

---

## MVP Recommendation

### Priority 1: Test Readiness Score (Table Stakes, High Impact)
1. **Readiness formula tuning** -- rebalance accuracy vs coverage weights
2. **Readiness score UI component** -- radial ring with color-coded status
3. **Readiness breakdown sub-scores** -- show what drives the score
4. **Dashboard + Progress Hub integration** -- make score visible everywhere

*Rationale: The readiness score already exists as internal logic. Promoting it to a visible UI element is the highest-impact change with lowest effort. Users immediately get an answer to "Am I ready?" This is the foundational feature that all other intelligent study features build on.*

### Priority 2: Smart Weak-Area Drill (Table Stakes, Medium Impact)
1. **Dedicated weak-area drill entry point** -- explicit "Drill Weak Areas" button
2. **Category-level drill buttons** -- per-category drill in Progress Hub
3. **Drill session improvement feedback** -- pre/post mastery delta display

*Rationale: The algorithms exist. The practice mode exists. This is purely a UI/UX improvement that surfaces existing intelligence. Users who want to improve weak areas currently have to manually navigate to category practice and hope the 70/30 selection picks the right questions. Make it explicit.*

### Priority 3: Test Date & Daily Targets (Table Stakes, Medium Impact)
1. **Set test date** in Settings
2. **Countdown display** on Dashboard and Progress Hub
3. **Daily study target calculation** and "Today's Plan" card

*Rationale: Depends on readiness score being visible (Priority 1) for "take mock test" recommendations. Simple arithmetic, not complex scheduling. Creates urgency and structure.*

### Priority 4: Content Enrichment -- Mnemonics (Differentiator, High Effort)
1. **Author mnemonics for remaining 111 questions** (17 already have them)
2. **Mnemonic visual treatment** -- lightbulb icon, distinct styling
3. **"Tricky Questions" collection** -- flag hard questions

*Rationale: Highest content authoring effort but highest learning impact. Mnemonics are THE differentiator for memorization-heavy tests. Every competitor app is just flashcards -- adding curated mnemonics in two languages is genuinely unique.*

### Priority 5: Study Tips (Differentiator, Low Effort)
1. **Category introduction cards** (7 objects to author)
2. **Post-session contextual tips** (performance-mapped)
3. **"How to Study" static page**

*Rationale: Low effort, nice polish. Can be done alongside content enrichment as authoring tasks.*

### Priority 6: Content Enrichment -- Depth (Differentiator, Medium Effort)
1. **Expand fun facts** (25 -> 128)
2. **Expand common mistakes** (28 -> 128)
3. **Expand citations** (48 -> 128)
4. **"See Also" related questions UI** (render existing data)

*Rationale: Content depth that makes the app feel comprehensive. "See Also" links are a quick UI win since all 128 questions already have `relatedQuestionIds` populated.*

### Defer to Later Milestone
- **AI-generated study plans** (cost, complexity, offline incompatibility)
- **Calendar-based scheduling UI** (over-engineering for 128-question test)
- **Predictive pass probability** (misleading without psychometric validation)
- **User-generated mnemonics** (moderation burden, quality risk)
- **Video content** (storage, bandwidth, production cost)

---

## Complexity Assessment Summary

| Feature Area | Code Complexity | Content Complexity | Dependencies on Existing |
|--------------|----------------|-------------------|-------------------------|
| Test Readiness Score | Low (formula exists, build UI) | None | `computeReadiness()` in NBA, `calculateOverallMastery()`, test history, SRS state |
| Test Date Countdown | Low (date picker + arithmetic) | None | Readiness score for recommendations |
| Daily Targets | Med (backward planning logic) | None | Test date, SRS due count, coverage data |
| Weak-Area Drill UI | Low (route + button + existing functions) | None | `getWeakQuestions()`, `detectWeakAreas()`, `selectPracticeQuestions()` |
| Drill Feedback | Low (before/after mastery comparison) | None | `calculateCategoryMastery()` |
| Mnemonics (authoring) | None (populate existing fields) | High (111 bilingual mnemonics) | `Explanation.mnemonic_en/my` type fields |
| Mnemonic UI treatment | Low (styling + icon) | None | Explanation rendering in FeedbackPanel, flashcards, SRS |
| Tricky Questions | Low (badge + filter) | Low (curate list) | Question accuracy data or hardcoded list |
| Study Tips (category) | Low (7 static objects + dismissible card) | Med (7 bilingual introductions) | Category mapping, localStorage for dismissal |
| Study Tips (post-session) | Low (string mapping) | Med (35-70 bilingual tip strings) | Practice session results |
| Study Tips (static page) | Low (static content page) | Low (5-7 bilingual tips) | Settings navigation |
| Fun Facts (authoring) | None (populate existing fields) | High (103 bilingual fun facts) | `Explanation.funFact_en/my` type fields |
| Common Mistakes (authoring) | None (populate existing fields) | Med (100 bilingual entries) | `Explanation.commonMistake_en/my` type fields |
| Citations (authoring) | None (populate existing fields) | Med (80 citation strings) | `Explanation.citation` field |
| Related Questions UI | Low (render clickable chips) | None | `relatedQuestionIds` (128/128 populated) |

---

## Sources

### Test Readiness Scoring
- [Achievable Test Readiness Score Discussion](https://talk.achievable.me/t/how-does-test-readiness-score-work/2522) - MEDIUM confidence (community forum, staff responses)
- [CFA Level 2 Readiness: Mock Score Targets](https://www.swiftintellect.com/post/how-to-predict-cfa-level-2-readiness-mock-score-targets-error-patterns) - MEDIUM confidence
- [NCLEX Readiness Assessment (Archer Review)](https://nurses.archerreview.com/features/archer-readiness-assessment) - MEDIUM confidence
- [Duolingo Score (Duocon 2025)](https://duolingo.fandom.com/wiki/Score) - MEDIUM confidence

### Spaced Repetition & Study Planning
- [FSRS Algorithm Wiki](https://github.com/open-spaced-repetition/fsrs4anki/wiki/spaced-repetition-algorithm:-a-three%E2%80%90day-journey-from-novice-to-expert) - HIGH confidence (official)
- [FSRS Helper (Anki add-on)](https://ankiweb.net/shared/info/759844606) - HIGH confidence (official)
- [Anki Forums: FSRS for Exam Deadline](https://forums.ankiweb.net/t/how-do-i-use-fsrs-for-exam/43631) - MEDIUM confidence
- [Anki Forums: Deadline Feature Request](https://forums.ankiweb.net/t/deadline-exam-date-feature/56675) - MEDIUM confidence
- [300Hours CFA Study Planner](https://300hours.com/cfa-study-planner/) - MEDIUM confidence
- [UWorld CPA Study Planner](https://accounting.uworld.com/cpa-review/cpa-courses/features/study-planner/) - MEDIUM confidence

### Weak Area & Adaptive Practice
- [Brainscape Confidence-Based Repetition](https://brainscape.zendesk.com/hc/en-us/articles/13103043051149-How-does-Brainscape-s-spaced-repetition-algorithm-work-i-e-Confidence-Based-Repetition) - HIGH confidence (official)
- [Brainscape CBR Whitepaper](https://edcuration.com/resource/product/3/Brainscape%20whitepaper.pdf) - HIGH confidence (official)
- [AdeptLR Adaptive Drilling](https://www.adeptlr.com/platform/adaptive-drilling) - MEDIUM confidence
- [Quizlet Learning Mode](https://help.quizlet.com/hc/en-us/articles/360030986971-Studying-with-Learn) - MEDIUM confidence (official)
- [Drill and Practice in 2025 Education (Brainscape Academy)](https://www.brainscape.com/academy/drill-and-practice-in-education/) - MEDIUM confidence

### Mnemonics & Memory Aids
- [Picmonic: Visual Mnemonics](https://www.picmonic.com/pages/why-do-mnemonics-work-its-science/) - MEDIUM confidence
- [Brainscape: Do Mnemonics Work?](https://www.brainscape.com/academy/mnemonics-memorization-techniques/) - MEDIUM confidence
- [Mnemonic Devices Types (Psych Central)](https://psychcentral.com/lib/memory-and-mnemonic-devices) - MEDIUM confidence
- [Effective Flashcard Techniques (BrainApps)](https://brainapps.io/blog/2025/04/effective-flashcard-techniques-for-better/) - LOW confidence

### Civics Test Specifics
- [USCIS 2025 Civics Test Changes (NPR)](https://www.npr.org/2025/10/16/nx-s1-5566732/the-trump-administration-is-rolling-out-changes-to-the-u-s-citizenship-test) - HIGH confidence
- [Hardest Citizenship Test Questions](https://www.citizenshipstudyguide.com/articles/The-10-Hardest-US-Citizenship-Test-Questions) - MEDIUM confidence
- [USCIS Naturalization Test Performance Data](https://www.uscis.gov/citizenship-resource-center/naturalization-related-data-and-statistics/naturalization-test-performance) - HIGH confidence (official)
- [USCIS Official Study Materials](https://www.uscis.gov/citizenship/find-study-materials-and-resources/study-for-the-test) - HIGH confidence (official)
- [Citizen Now App](https://citizennow.com/) - MEDIUM confidence (competitor reference)

### Study Tips & Contextual Help UX
- [Contextual Help UX Patterns (Chameleon)](https://www.chameleon.io/blog/contextual-help-ux) - MEDIUM confidence
- [Contextual Help UX Patterns (UserPilot)](https://userpilot.com/blog/contextual-help/) - MEDIUM confidence
- [EZ Prep: How to Prepare for Citizenship Exam](https://eztestprep.com/post/the-best-way-to-study-for-the-u-s-citizenship-certification-exam-a-comprehensive-guide/) - MEDIUM confidence
- [One Percent for America: Pass Civics Exam](https://www.onepercentforamerica.org/ask-the-expert/how-pass-civics-exam-your-first-attempt) - MEDIUM confidence

---

*Feature research for: Civic Test Prep v4.0 Intelligent Study & Content Enrichment*
*Researched: 2026-02-23*
*Supersedes: v3.0 feature research (retained in git history)*
