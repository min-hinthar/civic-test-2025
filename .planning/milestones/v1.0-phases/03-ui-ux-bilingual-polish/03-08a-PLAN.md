---
phase: 03-ui-ux-bilingual-polish
plan: 08a
type: execute
wave: 4
depends_on: ["03-01", "03-02", "03-03", "03-05", "03-06", "03-07"]
files_modified:
  - src/pages/StudyGuidePage.tsx
  - src/pages/TestPage.tsx
  - src/pages/HistoryPage.tsx
autonomous: true

must_haves:
  truths:
    - "StudyGuidePage uses FlashcardStack for cards view"
    - "StudyGuidePage has hash-based routing for category/cards views"
    - "TestPage shows PreTestScreen before test starts"
    - "TestPage uses CircularTimer with hide/show toggle"
    - "Test answer buttons are mobile-responsive with 44px+ touch targets"
    - "HistoryPage uses staggered list animations"
  artifacts:
    - path: "src/pages/StudyGuidePage.tsx"
      provides: "Mobile-optimized study guide with flashcard stack"
      contains: "FlashcardStack"
    - path: "src/pages/TestPage.tsx"
      provides: "Mobile-friendly test UI with circular timer"
      contains: "CircularTimer"
    - path: "src/pages/HistoryPage.tsx"
      provides: "Test history with staggered animations"
      contains: "StaggeredList"
  key_links:
    - from: "src/pages/StudyGuidePage.tsx"
      to: "src/components/study/FlashcardStack.tsx"
      via: "Flashcard display"
      pattern: "FlashcardStack"
    - from: "src/pages/TestPage.tsx"
      to: "src/components/test/CircularTimer.tsx"
      via: "Timer display"
      pattern: "CircularTimer"
    - from: "src/pages/TestPage.tsx"
      to: "src/components/test/PreTestScreen.tsx"
      via: "Pre-test screen"
      pattern: "PreTestScreen"
---

<objective>
Apply Phase 3 UI components to StudyGuidePage, TestPage, and HistoryPage - the core learning/testing pages.

Purpose: These pages are where users spend most of their time studying and testing. They need the full Phase 3 treatment: FlashcardStack, CircularTimer, PreTestScreen, AnswerFeedback, and celebration effects.

Output: StudyGuidePage, TestPage, and HistoryPage updated with all Phase 3 components.
</objective>

<execution_context>
@C:\Users\minkk\.claude/get-shit-done/workflows/execute-plan.md
@C:\Users\minkk\.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/phases/03-ui-ux-bilingual-polish/03-CONTEXT.md
@.planning/phases/03-ui-ux-bilingual-polish/03-05-SUMMARY.md
@.planning/phases/03-ui-ux-bilingual-polish/03-06-SUMMARY.md
@.planning/phases/03-ui-ux-bilingual-polish/03-07-SUMMARY.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update StudyGuidePage with FlashcardStack and hash routing</name>
  <files>
    src/pages/StudyGuidePage.tsx
  </files>
  <action>
Update `src/pages/StudyGuidePage.tsx` to use Phase 3 components with explicit hash routing implementation:

Key changes:

1. Import new components:
```typescript
import { useLocation, useNavigate } from 'react-router-dom';
import { BilingualHeading, PageTitle } from '@/components/bilingual/BilingualHeading';
import { Card } from '@/components/ui/Card';
import { StaggeredList, StaggeredItem } from '@/components/animations/StaggeredList';
import { Flashcard3D } from '@/components/study/Flashcard3D';
import { FlashcardStack } from '@/components/study/FlashcardStack';
import { strings } from '@/lib/i18n/strings';
```

2. Implement hash-based routing for category/cards views:
```typescript
// Inside component
const location = useLocation();
const navigate = useNavigate();

// Parse hash for view state: #cards or #category-{name}
const hash = location.hash;
const isCardsView = hash === '#cards' || hash.startsWith('#cards-');
const selectedCategory = hash.startsWith('#category-')
  ? decodeURIComponent(hash.replace('#category-', ''))
  : null;

// Filter questions based on selected category
const filteredQuestions = useMemo(() => {
  if (!selectedCategory) return questions;
  return questions.filter(q => q.category === selectedCategory);
}, [questions, selectedCategory]);

// Handle category selection
const handleCategoryChange = (category: string) => {
  navigate(`/study#category-${encodeURIComponent(category)}`);
};

// Handle switching to cards view
const handleShowCards = () => {
  const categoryParam = selectedCategory
    ? `-${encodeURIComponent(selectedCategory)}`
    : '';
  navigate(`/study#cards${categoryParam}`);
};

// Handle back to categories
const handleBackToCategories = () => {
  navigate('/study');
};
```

3. Update page header:
```tsx
<PageTitle text={strings.study.studyGuide} />
```

4. Add `data-tour="study-guide"` for onboarding.

5. Render based on hash state:
```tsx
{isCardsView ? (
  <div className="mb-4">
    <button
      onClick={handleBackToCategories}
      className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 min-h-[44px]"
    >
      <ChevronLeft className="h-4 w-4" />
      Back to Categories / အမျိုးအစားများသို့
    </button>
    <FlashcardStack
      questions={filteredQuestions}
      onIndexChange={(index) => console.log('Card index:', index)}
    />
  </div>
) : (
  <>
    {/* Bilingual encouraging intro */}
    <p className="text-muted-foreground mb-6">
      Tap a category to start studying. Every card you review builds your confidence!
      <span className="block font-myanmar mt-1">
        လေ့လာရန် အမျိုးအစားတစ်ခုကို ရွေးပါ။ သင်ကြည့်တဲ့ကတ်တိုင်းက သင့်ကိုယုံကြည်မှုပိုပေးပါတယ်!
      </span>
    </p>

    {/* Category list with staggered animation */}
    <StaggeredList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((cat) => (
        <StaggeredItem key={cat}>
          <Card
            interactive
            onClick={() => handleCategoryChange(cat)}
            className="min-h-[44px] p-4"
          >
            <h3 className="font-semibold">{cat}</h3>
            <p className="text-sm text-muted-foreground">
              {questionsPerCategory[cat]} questions
            </p>
          </Card>
        </StaggeredItem>
      ))}
    </StaggeredList>

    {/* View all cards button */}
    <div className="mt-6 text-center">
      <BilingualButton
        label={{ en: 'View All Flashcards', my: 'ကတ်များအားလုံးကြည့်ပါ' }}
        variant="secondary"
        onClick={handleShowCards}
      />
    </div>
  </>
)}
```

6. Mobile-first grid layout:
- 1 column on mobile (grid-cols-1)
- 2 columns on sm (sm:grid-cols-2)
- 3 columns on lg (lg:grid-cols-3)
  </action>
  <verify>
Navigate to Study Guide page.
Verify category cards animate in with stagger.
Click a category - URL should update to #category-{name}.
Click "View All Flashcards" - URL should update to #cards.
Swipe through flashcards on mobile.
Click back button - should return to category view.
  </verify>
  <done>
StudyGuidePage uses FlashcardStack with hash-based routing for categories/cards views.
  </done>
</task>

<task type="auto">
  <name>Task 2: Update TestPage with PreTestScreen, CircularTimer, and celebrations</name>
  <files>
    src/pages/TestPage.tsx
  </files>
  <action>
Update `src/pages/TestPage.tsx` to use Phase 3 components:

Key changes:

1. Import new components:
```typescript
import { BilingualHeading } from '@/components/bilingual/BilingualHeading';
import { BilingualButton } from '@/components/bilingual/BilingualButton';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { CircularTimer } from '@/components/test/CircularTimer';
import { PreTestScreen } from '@/components/test/PreTestScreen';
import { AnswerFeedback, getAnswerOptionClasses } from '@/components/test/AnswerFeedback';
import { Confetti } from '@/components/celebrations/Confetti';
import { CountUpScore } from '@/components/celebrations/CountUpScore';
import { strings } from '@/lib/i18n/strings';
```

2. Add `data-tour="mock-test"` for onboarding.

3. Add state for pre-test screen:
```typescript
const [showPreTest, setShowPreTest] = useState(true);
const [showConfetti, setShowConfetti] = useState(false);
const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
const [showFeedback, setShowFeedback] = useState(false);
```

4. Show PreTestScreen before test starts:
```tsx
if (showPreTest) {
  return (
    <div className="page-shell">
      <AppNavigation />
      <PreTestScreen
        questionCount={20}
        durationMinutes={20}
        onReady={() => setShowPreTest(false)}
      />
    </div>
  );
}
```

5. Replace the text-based timer with CircularTimer:
```tsx
<CircularTimer
  duration={TEST_DURATION_SECONDS}
  remainingTime={timeLeft}
  onComplete={() => {
    setIsFinished(true);
    setEndReason('time');
  }}
  allowHide
/>
```

6. Update answer options with mobile-responsive styling and explicit className:
```tsx
{currentQuestion.answers.map((answer) => (
  <button
    key={answer.text_en}
    onClick={() => handleAnswerSelect(answer)}
    disabled={showFeedback}
    className={clsx(
      getAnswerOptionClasses(
        selectedAnswer === answer,
        showFeedback ? answer.correct : null,
        showFeedback
      ),
      // EXPLICIT mobile-responsive styling for 44px+ touch targets
      'w-full min-h-[44px] py-3 px-4 text-left space-y-1'
    )}
  >
    <span className="font-semibold block">{answer.text_en}</span>
    <span className="font-myanmar text-muted-foreground block text-sm">
      {answer.text_my}
    </span>
  </button>
))}
```

7. Show AnswerFeedback after selection:
```tsx
<AnswerFeedback
  isCorrect={selectedAnswer?.correct ?? false}
  show={showFeedback}
  correctAnswer={currentQuestion.answers.find(a => a.correct)?.text_en}
  correctAnswerMy={currentQuestion.answers.find(a => a.correct)?.text_my}
/>
```

8. Update test completion screen with CountUpScore and Confetti:
```tsx
{isFinished && (
  <div className="text-center py-8">
    <Confetti
      fire={showConfetti}
      intensity={correctCount >= PASS_THRESHOLD ? 'celebration' : 'burst'}
    />
    <BilingualHeading
      text={strings.test.testComplete}
      level={1}
      size="2xl"
      centered
      className="mb-6"
    />
    <CountUpScore
      score={correctCount}
      total={results.length}
      onComplete={() => setShowConfetti(true)}
    />
    {/* Result message and action buttons */}
  </div>
)}
```

9. Ensure all answer buttons have mobile-responsive sizing:
- Full width on mobile (w-full)
- Minimum height 44px (min-h-[44px])
- Adequate padding (py-3 px-4)
- Stack text vertically (space-y-1)
  </action>
  <verify>
Navigate to Test page.
Verify PreTestScreen appears first with breathing animation.
Click "I'm Ready" - test starts.
Timer shows circular arc with hide/show toggle.
Select an answer - verify answer button has min-h-[44px].
Answer wrong - verify orange feedback (not red).
Complete test - verify confetti and count-up score.
  </verify>
  <done>
TestPage uses CircularTimer, PreTestScreen, AnswerFeedback, and celebration components with mobile-responsive answer cards.
  </done>
</task>

<task type="auto">
  <name>Task 3: Update HistoryPage with staggered animations</name>
  <files>
    src/pages/HistoryPage.tsx
  </files>
  <action>
Update `src/pages/HistoryPage.tsx` to use Phase 3 components:

Key changes:

1. Import new components:
```typescript
import { BilingualHeading, PageTitle } from '@/components/bilingual/BilingualHeading';
import { Card } from '@/components/ui/Card';
import { StaggeredList, StaggeredItem, FadeIn } from '@/components/animations/StaggeredList';
import { Progress } from '@/components/ui/Progress';
import { strings } from '@/lib/i18n/strings';
```

2. Update page header:
```tsx
<PageTitle text={strings.nav.testHistory} />
```

3. Add `data-tour="test-history"` for onboarding.

4. Use StaggeredList for test history entries:
```tsx
<StaggeredList className="space-y-4">
  {testHistory.map((test, index) => (
    <StaggeredItem key={test.id}>
      <Card
        interactive
        onClick={() => handleViewTest(test.id)}
        className="min-h-[44px]"
      >
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-semibold">
                {formatDate(test.date)}
              </p>
              <p className="text-sm text-muted-foreground">
                {test.questionCount} questions / မေးခွန်း
              </p>
            </div>
            <div className="text-right">
              <span className={clsx(
                'text-2xl font-bold',
                test.passed ? 'text-success-500' : 'text-warning-500'
              )}>
                {test.score}%
              </span>
              <span className="block text-sm text-muted-foreground">
                {test.passed ? 'Passed / အောင်' : 'Keep trying / ဆက်ကြိုးစားပါ'}
              </span>
            </div>
          </div>
          <Progress
            value={test.score}
            variant={test.passed ? 'success' : 'warning'}
            size="sm"
          />
        </div>
      </Card>
    </StaggeredItem>
  ))}
</StaggeredList>
```

5. Handle empty state with encouraging bilingual message:
```tsx
{testHistory.length === 0 && (
  <FadeIn>
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📝</div>
      <BilingualHeading
        text={{
          en: "You haven't taken any tests yet",
          my: 'သင်မည်သည့်စာမေးပွဲမှမဖြေဆိုရသေးပါ',
        }}
        level={2}
        size="lg"
        centered
        className="mb-2"
      />
      <p className="text-muted-foreground mb-6">
        Take your first practice test to start tracking progress!
        <span className="block font-myanmar mt-1">
          တိုးတက်မှုခြေရာခံဖို့ ပထမဆုံးစာမေးပွဲဖြေပါ!
        </span>
      </p>
      <BilingualButton
        label={strings.actions.startTest}
        variant="primary"
        onClick={() => navigate('/test')}
      />
    </div>
  </FadeIn>
)}
```

6. Mobile-responsive layout:
- Cards stack vertically on all sizes (space-y-4)
- Touch targets at least 44px (min-h-[44px])
  </action>
  <verify>
Navigate to History page.
Verify test entries animate in with stagger effect.
Verify empty state shows encouraging message if no history.
Click a test entry - verify it's interactive.
Test on mobile - verify 44px touch targets.
  </verify>
  <done>
HistoryPage uses staggered list animations and bilingual components.
  </done>
</task>

</tasks>

<verification>
1. `pnpm run build` completes without errors
2. Study Guide has hash-based routing (#cards, #category-{name})
3. Study Guide flashcards use 3D flip animation
4. Test page has pre-test calming screen
5. Test timer is circular with color thresholds
6. Test answer buttons have min-h-[44px] for mobile
7. Wrong answers show orange (not red)
8. Test completion shows confetti and count-up
9. History page entries animate with stagger
10. All pages have bilingual headings
</verification>

<success_criteria>
- StudyGuidePage has explicit hash routing (location.hash, handleCategoryChange)
- StudyGuidePage uses FlashcardStack for cards view
- TestPage uses CircularTimer, PreTestScreen, AnswerFeedback
- TestPage answer buttons have explicit className='w-full min-h-[44px] py-3 px-4 space-y-1'
- TestPage has Confetti and CountUpScore for completion
- HistoryPage uses StaggeredList for entries
- Mobile layouts work on 375px viewport
- Touch targets are at least 44px
- data-tour attributes added for onboarding
- All pages compile without TypeScript errors
</success_criteria>

<output>
After completion, create `.planning/phases/03-ui-ux-bilingual-polish/03-08a-SUMMARY.md`
</output>
