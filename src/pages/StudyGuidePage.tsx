'use client';

import { useCallback, useEffect, useMemo, useState, KeyboardEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import clsx from 'clsx';
import { civicsQuestions } from '@/constants/civicsQuestions';
import AppNavigation from '@/components/AppNavigation';
import SpeechButton from '@/components/ui/SpeechButton';
import { PageTitle } from '@/components/bilingual/BilingualHeading';
import { BilingualButton } from '@/components/bilingual/BilingualButton';
import { Card } from '@/components/ui/Card';
import { StaggeredList, StaggeredItem } from '@/components/animations/StaggeredList';
import { FlashcardStack } from '@/components/study/FlashcardStack';
import { ExplanationCard } from '@/components/explanations/ExplanationCard';
import { strings } from '@/lib/i18n/strings';

const categoryColors: Record<string, string> = {
  'Principles of American Democracy': 'from-rose-500 to-pink-500',
  'System of Government': 'from-blue-500 to-cyan-500',
  'Rights and Responsibilities': 'from-emerald-500 to-lime-500',
  'American History: Colonial Period and Independence': 'from-amber-500 to-orange-500',
  'American History: 1800s': 'from-fuchsia-500 to-purple-500',
  'Recent American History and Other Important Historical Information':
    'from-sky-500 to-indigo-500',
  'Civics: Symbols and Holidays': 'from-slate-500 to-stone-500',
};

const StudyGuidePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const questionCategories = useMemo<string[]>(
    () => Array.from(new Set(civicsQuestions.map(question => question.category))),
    []
  );

  // Compute question count per category
  const questionsPerCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of questionCategories) {
      counts[cat] = civicsQuestions.filter(q => q.category === cat).length;
    }
    return counts;
  }, [questionCategories]);

  // Parse hash for view state: #cards, #cards-{category}, #category-{name}
  const hash = location.hash;
  const isCardsView = hash === '#cards' || hash.startsWith('#cards-');
  const selectedCategory = hash.startsWith('#category-')
    ? decodeURIComponent(hash.replace('#category-', ''))
    : null;

  // For cards view, extract category if present
  const cardsCategory = hash.startsWith('#cards-')
    ? decodeURIComponent(hash.replace('#cards-', ''))
    : null;

  // Filter questions based on selected category or cards category
  const filteredQuestions = useMemo(() => {
    const activeCat = isCardsView ? cardsCategory : selectedCategory;
    if (!activeCat) return civicsQuestions;
    return civicsQuestions.filter(q => q.category === activeCat);
  }, [isCardsView, cardsCategory, selectedCategory]);

  // Legacy support: category from search params for the flip-card grid view
  const getValidCategory = useCallback(
    (params: URLSearchParams) => {
      const param = params.get('category');
      if (param && questionCategories.includes(param)) {
        return param;
      }
      return 'all';
    },
    [questionCategories]
  );

  const [category, setCategory] = useState<string>(() => getValidCategory(searchParams));
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const nextCategory = getValidCategory(searchParams);
    if (nextCategory !== category) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: sync category with URL search params
      setCategory(nextCategory);
    }
  }, [category, getValidCategory, searchParams]);

  const toggleCard = useCallback((id: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  // Handle category selection via hash
  const handleCategorySelect = (cat: string) => {
    navigate(`/study#category-${encodeURIComponent(cat)}`);
  };

  // Handle switching to cards view
  const handleShowCards = (cat?: string) => {
    const categoryParam = cat ? `-${encodeURIComponent(cat)}` : '';
    navigate(`/study#cards${categoryParam}`);
  };

  // Handle back to categories overview
  const handleBackToCategories = () => {
    navigate('/study');
  };

  // Legacy category filter change (for select dropdown in flip-card grid)
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    const nextParams = new URLSearchParams(searchParams);
    if (value === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', value);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const legacyFilteredQuestions = useMemo(() => {
    return category === 'all'
      ? civicsQuestions
      : civicsQuestions.filter(question => question.category === category);
  }, [category]);

  const categories = useMemo(() => ['all', ...questionCategories], [questionCategories]);

  // Cards view with FlashcardStack
  if (isCardsView) {
    return (
      <div className="page-shell" data-tour="study-guide">
        <AppNavigation />
        <div className="mx-auto max-w-6xl px-4 py-10">
          <PageTitle text={strings.study.studyGuide} />

          <div className="mb-4">
            <button
              onClick={handleBackToCategories}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 min-h-[44px]"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Categories</span>
              <span className="font-myanmar ml-1">/ အမျိုးအစားများသို့</span>
            </button>
          </div>

          <FlashcardStack questions={filteredQuestions} />
        </div>
      </div>
    );
  }

  // Category selection view with hash routing
  if (selectedCategory && questionCategories.includes(selectedCategory)) {
    const categoryQuestions = civicsQuestions.filter(q => q.category === selectedCategory);

    return (
      <div className="page-shell" data-tour="study-guide">
        <AppNavigation />
        <div className="mx-auto max-w-6xl px-4 py-10">
          <PageTitle text={strings.study.studyGuide} />

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              onClick={handleBackToCategories}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 min-h-[44px]"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>All Categories</span>
              <span className="font-myanmar ml-1">/ အမျိုးအစားအားလုံး</span>
            </button>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-2">{selectedCategory}</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {categoryQuestions.length} questions in this category
          </p>

          <div className="mb-6">
            <BilingualButton
              label={{ en: 'Study as Flashcards', my: 'ကတ်များဖြင့်လေ့လာပါ' }}
              variant="primary"
              onClick={() => handleShowCards(selectedCategory)}
            />
          </div>

          {/* Category question list using flip cards */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {categoryQuestions.map(question => {
              const isLocked = Boolean(flippedCards[question.id]);
              const isFlipped = isLocked;
              const englishAnswersText = question.studyAnswers
                .map(answer => answer.text_en)
                .join('. ');

              const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  toggleCard(question.id);
                }
              };

              return (
                <div key={question.id} className="flip-card" data-flipped={isFlipped}>
                  <div
                    role="button"
                    tabIndex={0}
                    className="flip-card-button interactive-tile"
                    onClick={() => toggleCard(question.id)}
                    onKeyDown={handleCardKeyDown}
                    aria-pressed={isLocked}
                    aria-label={`Reveal answer for ${question.question_en}`}
                  >
                    <div
                      className={clsx(
                        'flip-card-inner rounded-3xl border border-border/70 bg-card/95 text-foreground shadow-xl shadow-primary/10',
                        'min-h-[30rem]'
                      )}
                    >
                      <div className="flip-card-face flip-card-front flex h-full flex-col justify-between rounded-3xl p-6">
                        <p
                          className={clsx(
                            'text-xs font-semibold uppercase tracking-[0.2em] rounded-2xl bg-gradient-to-l px-4 py-3 shadow-inner opacity-80',
                            categoryColors[question.category] ?? 'from-primary to-primary'
                          )}
                        >
                          {question.category}
                        </p>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            <SpeechButton
                              text={question.question_en}
                              label="Play Question"
                              ariaLabel={`Play English question audio for ${question.question_en}`}
                              stopPropagation
                            />
                          </div>
                          <p className="mt-4 text-xl font-semibold text-foreground">
                            {question.question_en}
                          </p>
                          <p className="text-base text-muted-foreground font-myanmar leading-relaxed">
                            {question.question_my}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-primary">
                          Tap to flip · <span className="font-myanmar">နှိပ်ပါ</span>
                        </p>
                      </div>
                      <div
                        className={clsx(
                          'flip-card-face flip-card-back flex h-full flex-col rounded-3xl p-6 text-white',
                          'bg-gradient-to-br',
                          categoryColors[question.category] ?? 'from-primary to-primary'
                        )}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-white/90">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em]">
                            Answer - အဖြေ
                          </p>
                          <SpeechButton
                            text={englishAnswersText}
                            label="Play Answers"
                            ariaLabel={`Play English answers for ${question.question_en}`}
                            stopPropagation
                          />
                        </div>
                        <ul className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1 content-center">
                          {question.studyAnswers.map(answer => (
                            <li
                              key={answer.text_en}
                              className="rounded-2xl bg-black/20 px-4 py-3 shadow-inner"
                            >
                              <p className="text-base font-semibold tracking-wide">
                                {answer.text_en}
                              </p>
                              <p className="pt-1 text-base font-myanmar leading-relaxed">
                                {answer.text_my}
                              </p>
                            </li>
                          ))}
                        </ul>
                        {question.explanation && (
                          <div
                            className="mt-3"
                            onClick={e => e.stopPropagation()}
                            onKeyDown={e => e.stopPropagation()}
                          >
                            <ExplanationCard
                              explanation={question.explanation}
                              allQuestions={civicsQuestions}
                              className="border-white/20 bg-black/20 [&_*]:text-white [&_.text-muted-foreground]:text-white/70 [&_.text-foreground]:text-white [&_.text-primary-500]:text-white [&_.text-primary-400]:text-white/80 [&_.text-success-500]:text-white [&_.text-warning-500]:text-white [&_button]:hover:bg-white/10 [&_.border-border\\/40]:border-white/20 [&_.border-border\\/60]:border-white/20 [&_.bg-muted\\/30]:bg-white/10 [&_.bg-warning-50]:bg-white/10 [&_.dark\\:bg-warning-500\\/10]:bg-white/10 [&_.bg-primary-50]:bg-white/10 [&_.dark\\:bg-primary-500\\/10]:bg-white/10 [&_.border-warning-500\\/30]:border-white/20 [&_.border-primary-500\\/30]:border-white/20"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Default: Category overview with hash routing
  return (
    <div className="page-shell" data-tour="study-guide">
      <AppNavigation />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <PageTitle text={strings.study.studyGuide} />

        {/* Bilingual encouraging intro */}
        <p className="text-muted-foreground mb-6">
          Tap a category to start studying. Every card you review builds your confidence!
          <span className="block font-myanmar mt-1">
            လေ့လာရန် အမျိုးအစားတစ်ခုကို ရွေးပါ။ သင်ကြည့်တဲ့ကတ်တိုင်းက သင့်ကိုယုံကြည်မှုပိုပေးပါတယ်!
          </span>
        </p>

        {/* Category grid with staggered animation */}
        <StaggeredList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {questionCategories.map(cat => (
            <StaggeredItem key={cat}>
              <Card
                interactive
                onClick={() => handleCategorySelect(cat)}
                className="min-h-[44px] p-4"
              >
                <h3 className="font-semibold">{cat}</h3>
                <p className="text-sm text-muted-foreground">
                  {questionsPerCategory[cat]} questions / မေးခွန်း
                </p>
              </Card>
            </StaggeredItem>
          ))}
        </StaggeredList>

        {/* View all flashcards button */}
        <div className="mt-6 text-center">
          <BilingualButton
            label={{ en: 'View All Flashcards', my: 'ကတ်များအားလုံးကြည့်ပါ' }}
            variant="secondary"
            onClick={() => handleShowCards()}
          />
        </div>

        {/* Divider */}
        <hr className="my-10 border-border/50" />

        {/* Legacy flip-card grid with category filter */}
        <header className="glass-panel flex flex-col gap-4 p-6 shadow-primary/20 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary">
              Flip Cards · လှည့်ကတ်များ
            </p>
            <h2 className="text-2xl font-bold text-foreground">
              Interactive Bilingual Flip-Cards
              <span className="mt-1 block text-lg font-normal text-muted-foreground font-myanmar">
                အင်္ဂလိပ်/မြန်မာ နှစ်ဘက်လှည့်ကတ်များ
              </span>
            </h2>
            <p className="text-muted-foreground">
              Tap a card to reveal Burmese answers with extra spacing for easier reading.
            </p>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Sort by category ·{' '}
              <span className="font-myanmar text-muted-foreground">ကဏ္ဍရွေးချယ်ရန်</span>
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-border bg-card/80 px-4 py-3 text-sm"
              value={category}
              onChange={event => handleCategoryChange(event.target.value)}
            >
              {categories.map(option => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All Categories · အားလုံး' : option}
                </option>
              ))}
            </select>
          </div>
        </header>
        <div id="cards" className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {legacyFilteredQuestions.map(question => {
            const isLocked = Boolean(flippedCards[question.id]);
            const isFlipped = isLocked;
            const englishAnswersText = question.studyAnswers
              .map(answer => answer.text_en)
              .join('. ');

            const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleCard(question.id);
              }
            };

            return (
              <div key={question.id} className="flip-card" data-flipped={isFlipped}>
                <div
                  role="button"
                  tabIndex={0}
                  className="flip-card-button interactive-tile"
                  onClick={() => toggleCard(question.id)}
                  onKeyDown={handleCardKeyDown}
                  aria-pressed={isLocked}
                  aria-label={`Reveal answer for ${question.question_en}`}
                >
                  <div
                    className={clsx(
                      'flip-card-inner rounded-3xl border border-border/70 bg-card/95 text-foreground shadow-xl shadow-primary/10',
                      'min-h-[30rem]'
                    )}
                  >
                    <div className="flip-card-face flip-card-front flex h-full flex-col justify-between rounded-3xl p-6">
                      <p
                        className={clsx(
                          'text-xs font-semibold uppercase tracking-[0.2em] rounded-2xl bg-gradient-to-l px-4 py-3 shadow-inner opacity-80',
                          categoryColors[question.category] ?? 'from-primary to-primary'
                        )}
                      >
                        {question.category}
                      </p>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <SpeechButton
                            text={question.question_en}
                            label="Play Question"
                            ariaLabel={`Play English question audio for ${question.question_en}`}
                            stopPropagation
                          />
                        </div>
                        <p className="mt-4 text-xl font-semibold text-foreground">
                          {question.question_en}
                        </p>
                        <p className="text-base text-muted-foreground font-myanmar leading-relaxed">
                          {question.question_my}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-primary">
                        Tap to flip · <span className="font-myanmar">နှိပ်ပါ</span>
                      </p>
                    </div>
                    <div
                      className={clsx(
                        'flip-card-face flip-card-back flex h-full flex-col rounded-3xl p-6 text-white',
                        'bg-gradient-to-br',
                        categoryColors[question.category] ?? 'from-primary to-primary'
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-white/90">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em]">
                          Answer - အဖြေ
                        </p>
                        <SpeechButton
                          text={englishAnswersText}
                          label="Play Answers"
                          ariaLabel={`Play English answers for ${question.question_en}`}
                          stopPropagation
                        />
                      </div>
                      <ul className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1 content-center">
                        {question.studyAnswers.map(answer => (
                          <li
                            key={answer.text_en}
                            className="rounded-2xl bg-black/20 px-4 py-3 shadow-inner"
                          >
                            <p className="text-base font-semibold tracking-wide">
                              {answer.text_en}
                            </p>
                            <p className="pt-1 text-base font-myanmar leading-relaxed">
                              {answer.text_my}
                            </p>
                          </li>
                        ))}
                      </ul>
                      {question.explanation && (
                        <div
                          className="mt-3"
                          onClick={e => e.stopPropagation()}
                          onKeyDown={e => e.stopPropagation()}
                        >
                          <ExplanationCard
                            explanation={question.explanation}
                            allQuestions={civicsQuestions}
                            className="border-white/20 bg-black/20 [&_*]:text-white [&_.text-muted-foreground]:text-white/70 [&_.text-foreground]:text-white [&_.text-primary-500]:text-white [&_.text-primary-400]:text-white/80 [&_.text-success-500]:text-white [&_.text-warning-500]:text-white [&_button]:hover:bg-white/10 [&_.border-border\\/40]:border-white/20 [&_.border-border\\/60]:border-white/20 [&_.bg-muted\\/30]:bg-white/10 [&_.bg-warning-50]:bg-white/10 [&_.dark\\:bg-warning-500\\/10]:bg-white/10 [&_.bg-primary-50]:bg-white/10 [&_.dark\\:bg-primary-500\\/10]:bg-white/10 [&_.border-warning-500\\/30]:border-white/20 [&_.border-primary-500\\/30]:border-white/20"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudyGuidePage;
