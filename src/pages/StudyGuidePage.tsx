'use client';

import { useCallback, useEffect, useMemo, useState, KeyboardEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Search, BookOpen, Layers, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';
import clsx from 'clsx';
import { allQuestions } from '@/constants/questions';

import SpeechButton from '@/components/ui/SpeechButton';
import { BurmeseSpeechButton } from '@/components/ui/BurmeseSpeechButton';
import { PillTabBar } from '@/components/ui/PillTabBar';
import { useTTSSettings } from '@/hooks/useTTSSettings';
import { BilingualButton } from '@/components/bilingual/BilingualButton';
import { Card } from '@/components/ui/Card';
import { StaggeredList, StaggeredItem } from '@/components/animations/StaggeredList';
import { FlashcardStack } from '@/components/study/FlashcardStack';
import { ExplanationCard } from '@/components/explanations/ExplanationCard';
import { CategoryHeaderBadge, QuestionAccuracyDot } from '@/components/nudges/StudyGuideHighlight';
import { AddToDeckButton } from '@/components/srs/AddToDeckButton';
import { DeckManager } from '@/components/srs/DeckManager';
import { ReviewSession } from '@/components/srs/ReviewSession';
import { useSRS } from '@/contexts/SRSContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { UpdateBanner } from '@/components/update/UpdateBanner';
import { recordStudyActivity } from '@/lib/social';
import { getSubCategoryColors } from '@/lib/mastery';
import type { Category } from '@/types';

/** USCIS main category color for sub-category flip card back gradients */
const CATEGORY_COLORS_MAP: Record<string, string> = {
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
  const [searchQuery, setSearchQuery] = useState('');

  const questionCategories = useMemo<string[]>(
    () => Array.from(new Set(allQuestions.map(question => question.category))),
    []
  );

  // Compute question count per category
  const questionsPerCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of questionCategories) {
      counts[cat] = allQuestions.filter(q => q.category === cat).length;
    }
    return counts;
  }, [questionCategories]);

  const { showBurmese } = useLanguage();
  const { settings: tts } = useTTSSettings();
  const speedLabel = { slow: '0.75x', normal: '1x', fast: '1.25x' }[tts.rate];
  // SRS deck state for due count badge
  const { dueCount } = useSRS();

  // Fire-and-forget: record study guide visit for streak tracking
  useEffect(() => {
    recordStudyActivity('study_guide').catch(() => {
      // Streak recording is non-critical
    });
  }, []);

  // Parse hash for view state: #cards, #cards-{category}, #category-{name}, #deck, #review
  const hash = location.hash;
  const isDeckView = hash === '#deck';
  const isReviewView = hash === '#review';
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
    if (!activeCat) return allQuestions;
    return allQuestions.filter(q => q.category === activeCat);
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
    const base =
      category === 'all'
        ? allQuestions
        : allQuestions.filter(question => question.category === category);
    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase();
    return base.filter(
      question => question.question_en.toLowerCase().includes(q) || question.question_my.includes(q)
    );
  }, [category, searchQuery]);

  const categories = useMemo(() => ['all', ...questionCategories], [questionCategories]);

  // Determine active tab from hash
  const activeTab = useMemo(() => {
    if (isDeckView) return '#deck';
    if (isReviewView) return '#review';
    return '';
  }, [isDeckView, isReviewView]);

  // Page header with bold title and patriotic emoji
  const pageHeader = (
    <div className="mb-8">
      <UpdateBanner
        showBurmese={showBurmese}
        className="mb-4 -mx-4 sm:-mx-0 rounded-none sm:rounded-xl"
      />
      <motion.h1
        className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Study Guide
      </motion.h1>
      {showBurmese && (
        <p className="mt-1 text-base text-muted-foreground font-myanmar">လေ့လာမှုလမ်းညွှန်</p>
      )}
    </div>
  );

  // Tab navigation bar - PillTabBar with spring-animated sliding pill
  const tabBar = (
    <div className="mb-6">
      <PillTabBar
        tabs={[
          {
            id: '',
            label: 'Browse',
            labelMy: '\u1000\u103C\u100A\u103A\u1037\u101B\u103E\u102F\u101B\u1014\u103A',
            icon: BookOpen,
          },
          {
            id: '#deck',
            label: 'Deck',
            labelMy: '\u1000\u1010\u103A\u1005\u102F\u1015\u102F\u1036',
            icon: Layers,
            badge: dueCount > 0 ? dueCount : undefined,
          },
          {
            id: '#review',
            label: 'Review',
            labelMy:
              '\u1015\u103C\u1014\u103A\u101C\u100A\u103A\u101E\u102F\u1036\u1038\u101E\u1015\u103A',
            icon: GraduationCap,
          },
        ]}
        activeTab={activeTab}
        onTabChange={tabId => navigate(tabId ? `/study${tabId}` : '/study')}
        ariaLabel="Study guide tabs"
        showBurmese={showBurmese}
      />
    </div>
  );

  // Review session view
  if (isReviewView) {
    return (
      <div className="page-shell" data-tour="study-guide">
        <div className="mx-auto max-w-6xl px-4 py-8">
          {pageHeader}
          {tabBar}
          <ReviewSession onExit={() => navigate('/study#deck')} />
        </div>
      </div>
    );
  }

  // Deck management view
  if (isDeckView) {
    return (
      <div className="page-shell" data-tour="study-guide">
        <div className="mx-auto max-w-6xl px-4 py-8">
          {pageHeader}
          {tabBar}
          <DeckManager
            onStartReview={() => navigate('/study#review')}
            onBack={handleBackToCategories}
          />
        </div>
      </div>
    );
  }

  // Cards view with FlashcardStack
  if (isCardsView) {
    return (
      <div className="page-shell" data-tour="study-guide">
        <div className="mx-auto max-w-6xl px-4 py-8">
          {pageHeader}
          {tabBar}

          <div className="mb-4">
            <button
              onClick={handleBackToCategories}
              className={clsx(
                'text-sm font-bold text-muted-foreground hover:text-foreground',
                'flex items-center gap-1 min-h-[44px] px-3 py-2 rounded-xl',
                'hover:bg-muted/50 transition-colors'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Categories</span>
              {showBurmese && <span className="font-myanmar ml-1">/ အမျိုးအစားများသို့</span>}
            </button>
          </div>

          <FlashcardStack questions={filteredQuestions} />
        </div>
      </div>
    );
  }

  // Category selection view with hash routing
  if (selectedCategory && questionCategories.includes(selectedCategory)) {
    const categoryQuestions = allQuestions.filter(q => q.category === selectedCategory);
    const subColors = getSubCategoryColors(selectedCategory as Category);

    return (
      <div className="page-shell" data-tour="study-guide">
        <div className="mx-auto max-w-6xl px-4 py-8">
          {pageHeader}
          {tabBar}

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              onClick={handleBackToCategories}
              className={clsx(
                'text-sm font-bold text-muted-foreground hover:text-foreground',
                'flex items-center gap-1 min-h-[44px] px-3 py-2 rounded-xl',
                'hover:bg-muted/50 transition-colors'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>All Categories</span>
              {showBurmese && <span className="font-myanmar ml-1">/ အမျိုးအစားအားလုံး</span>}
            </button>
          </div>

          {/* Category header with color strip */}
          <div
            className={clsx(
              'rounded-2xl border border-border/60 bg-card overflow-hidden mb-6',
              'shadow-[0_4px_0_0_rgba(0,0,0,0.06)] dark:shadow-[0_4px_0_0_rgba(0,0,0,0.2)]'
            )}
          >
            <div className={clsx('h-[5px]', subColors.stripBg)} />
            <div className="p-5">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-extrabold text-foreground">{selectedCategory}</h2>
                <CategoryHeaderBadge category={selectedCategory} />
              </div>
              <p className="text-sm text-muted-foreground">
                {categoryQuestions.length} questions in this category
                {showBurmese && (
                  <span className="font-myanmar ml-1">
                    / ဤအမျိုးအစားတွင် မေးခွန်း {categoryQuestions.length} ခု
                  </span>
                )}
              </p>
            </div>
          </div>

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
                        'flip-card-inner rounded-2xl border border-border/60 bg-card text-foreground overflow-hidden',
                        'shadow-[0_6px_0_0_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.12)]',
                        'dark:shadow-[0_6px_0_0_rgba(0,0,0,0.25),0_8px_24px_rgba(0,0,0,0.3)]',
                        'min-h-[30rem]'
                      )}
                    >
                      <div className="flip-card-face flip-card-front flex h-full flex-col rounded-2xl">
                        {/* Category color strip */}
                        <div className={clsx('h-[5px] w-full shrink-0', subColors.stripBg)} />
                        <div className="flex-1 flex flex-col justify-between p-6">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={clsx(
                                'text-xs font-semibold uppercase tracking-[0.2em] rounded-2xl bg-gradient-to-l px-4 py-3 shadow-inner opacity-80 flex-1',
                                CATEGORY_COLORS_MAP[question.category] ?? 'from-primary to-primary'
                              )}
                            >
                              {question.category}
                            </p>
                            <AddToDeckButton questionId={question.id} compact stopPropagation />
                            <QuestionAccuracyDot questionId={question.id} />
                          </div>
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              <SpeechButton
                                text={question.question_en}
                                label="Question"
                                ariaLabel={`Play English question audio for ${question.question_en}`}
                                stopPropagation
                                showSpeedLabel
                                speedLabel={speedLabel}
                              />
                              {showBurmese && (
                                <BurmeseSpeechButton
                                  questionId={question.id}
                                  audioType="q"
                                  label="မေးခွန်း"
                                  stopPropagation
                                  showSpeedLabel
                                  speedLabel={speedLabel}
                                />
                              )}
                            </div>
                            <p className="mt-4 text-xl font-semibold text-foreground">
                              {question.question_en}
                            </p>
                            {showBurmese && (
                              <p className="text-base text-muted-foreground font-myanmar leading-relaxed">
                                {question.question_my}
                              </p>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-primary">
                            {showBurmese ? 'Tap to flip · ' : 'Tap to flip'}
                            {showBurmese && <span className="font-myanmar">နှိပ်ပါ</span>}
                          </p>
                        </div>
                      </div>
                      <div
                        className={clsx(
                          'flip-card-face flip-card-back flex h-full flex-col rounded-2xl text-white',
                          'bg-gradient-to-br',
                          CATEGORY_COLORS_MAP[question.category] ?? 'from-primary to-primary'
                        )}
                      >
                        {/* Category color strip on back */}
                        <div
                          className={clsx('h-[5px] w-full shrink-0 opacity-50', subColors.stripBg)}
                        />
                        <div className="flex-1 flex flex-col p-6 overflow-hidden">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-white/90 shrink-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em]">
                              {showBurmese ? 'Answer - အဖြေ' : 'Answer'}
                            </p>
                            <div className="flex gap-2">
                              <SpeechButton
                                text={englishAnswersText}
                                label="Answers"
                                ariaLabel={`Play English answers for ${question.question_en}`}
                                stopPropagation
                                showSpeedLabel
                                speedLabel={speedLabel}
                              />
                              {showBurmese && (
                                <BurmeseSpeechButton
                                  questionId={question.id}
                                  audioType="a"
                                  label="အဖြေ"
                                  stopPropagation
                                  showSpeedLabel
                                  speedLabel={speedLabel}
                                />
                              )}
                            </div>
                          </div>
                          {/* Scrollable area for answers + explanation */}
                          <div className="mt-4 flex-1 overflow-y-auto overscroll-contain pr-1 min-h-0">
                            <ul className="space-y-3">
                              {question.studyAnswers.map(answer => (
                                <li
                                  key={answer.text_en}
                                  className="rounded-2xl bg-black/20 px-4 py-3 shadow-inner"
                                >
                                  <p className="text-base font-semibold tracking-wide">
                                    {answer.text_en}
                                  </p>
                                  {showBurmese && (
                                    <p className="pt-1 text-base font-myanmar leading-relaxed">
                                      {answer.text_my}
                                    </p>
                                  )}
                                </li>
                              ))}
                            </ul>
                            {question.explanation && (
                              <div
                                className="mt-3"
                                role="region"
                                aria-label="Explanation"
                                onClick={e => e.stopPropagation()}
                                onKeyDown={e => e.stopPropagation()}
                                onPointerDown={e => e.stopPropagation()}
                              >
                                <ExplanationCard
                                  explanation={question.explanation}
                                  allQuestions={allQuestions}
                                  className="border-white/20 bg-black/20 [&_*]:text-white [&_.text-muted-foreground]:text-white/70 [&_.text-foreground]:text-white [&_.text-primary]:text-white [&_.text-primary]:text-white/80 [&_.text-success]:text-white [&_.text-warning]:text-white [&_button]:hover:bg-white/10 [&_.border-border\\/40]:border-white/20 [&_.border-border\\/60]:border-white/20 [&_.bg-muted\\/30]:bg-white/10 [&_.bg-warning-subtle]:bg-white/10 [&_.dark\\:bg-warning\\/10]:bg-white/10 [&_.bg-primary-subtle]:bg-white/10 [&_.dark\\:bg-primary\\/10]:bg-white/10 [&_.border-warning\\/30]:border-white/20 [&_.border-primary\\/30]:border-white/20"
                                />
                              </div>
                            )}
                          </div>
                        </div>
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
      <div className="mx-auto max-w-6xl px-4 py-8">
        {pageHeader}
        {tabBar}

        {/* Bilingual encouraging intro */}
        <p className="text-base text-muted-foreground mb-6">
          Tap a category to start studying. Every card you review builds your confidence!
          {showBurmese && (
            <span className="block font-myanmar mt-1">
              လေ့လာရန် အမျိုးအစားတစ်ခုကို ရွေးပါ။ သင်ကြည့်တဲ့ကတ်တိုင်းက
              သင့်ကိုယုံကြည်မှုပိုပေးပါတယ်!
            </span>
          )}
        </p>

        {/* Category grid with staggered animation and color accents */}
        <StaggeredList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {questionCategories.map(cat => {
            const catColors = getSubCategoryColors(cat as Category);
            return (
              <StaggeredItem key={cat}>
                <Card
                  interactive
                  onClick={() => handleCategorySelect(cat)}
                  className={clsx(
                    'min-h-[56px] p-0 overflow-hidden border-l-4 glass-light',
                    catColors.borderAccent
                  )}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-foreground">{cat}</h3>
                      <CategoryHeaderBadge category={cat} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {questionsPerCategory[cat]} questions
                      {showBurmese && <span className="font-myanmar ml-1">/ မေးခွန်း</span>}
                    </p>
                  </div>
                </Card>
              </StaggeredItem>
            );
          })}
        </StaggeredList>

        {/* Action buttons: flashcards + review deck */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <BilingualButton
            label={{ en: 'View All Flashcards', my: 'ကတ်များအားလုံးကြည့်ပါ' }}
            variant="secondary"
            onClick={() => handleShowCards()}
          />
          <span className="relative inline-flex">
            <BilingualButton
              label={{ en: 'Review Deck', my: 'ပြန်လည်သုံးသပ်ကတ်များ' }}
              variant="outline"
              onClick={() => navigate('/study#deck')}
            />
            {dueCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-warning text-white text-xs font-bold shadow-sm">
                {dueCount}
              </span>
            )}
          </span>
        </div>

        {/* Divider */}
        <hr className="border-border/50 mb-8" />

        {/* Flip-card grid section with search and category filter */}
        <div className="rounded-2xl border border-border/60 bg-card/50 p-6 shadow-[0_4px_0_0_rgba(0,0,0,0.04)] dark:shadow-[0_4px_0_0_rgba(0,0,0,0.15)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-foreground">Flip Cards</h2>
              {showBurmese && (
                <p className="text-sm text-muted-foreground font-myanmar mt-0.5">
                  အင်္ဂလိပ်/မြန်မာ နှစ်ဘက်လှည့်ကတ်များ
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Rounded search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search questions..."
                  className={clsx(
                    'w-full sm:w-56 pl-9 pr-4 py-2.5 rounded-xl',
                    'border border-border/60 bg-background text-sm text-foreground',
                    'placeholder:text-muted-foreground/60',
                    'focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary',
                    'transition-colors min-h-[48px]'
                  )}
                />
              </div>
              {/* Category select */}
              <select
                className={clsx(
                  'rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm font-medium',
                  'focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary',
                  'transition-colors min-h-[48px]'
                )}
                value={category}
                onChange={event => handleCategoryChange(event.target.value)}
              >
                {categories.map(option => (
                  <option key={option} value={option}>
                    {option === 'all' ? 'All Categories' : option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Empty state */}
          {legacyFilteredQuestions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg font-bold text-muted-foreground">No questions found</p>
              {showBurmese && (
                <p className="text-sm text-muted-foreground font-myanmar mt-1">
                  မေးခွန်းမတွေ့ပါ - ရှာဖွေမှုကိုပြောင်းကြည့်ပါ
                </p>
              )}
            </div>
          )}

          <div id="cards" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {legacyFilteredQuestions.map(question => {
              const isLocked = Boolean(flippedCards[question.id]);
              const isFlipped = isLocked;
              const englishAnswersText = question.studyAnswers
                .map(answer => answer.text_en)
                .join('. ');
              const qColors = getSubCategoryColors(question.category);

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
                        'flip-card-inner rounded-2xl border border-border/60 bg-card text-foreground overflow-hidden',
                        'shadow-[0_6px_0_0_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.12)]',
                        'dark:shadow-[0_6px_0_0_rgba(0,0,0,0.25),0_8px_24px_rgba(0,0,0,0.3)]',
                        'min-h-[30rem]'
                      )}
                    >
                      <div className="flip-card-face flip-card-front flex h-full flex-col rounded-2xl">
                        {/* Category color header strip */}
                        <div className={clsx('h-[5px] w-full shrink-0', qColors.stripBg)} />
                        <div className="flex-1 flex flex-col justify-between p-6">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={clsx(
                                'text-xs font-semibold uppercase tracking-[0.2em] rounded-2xl bg-gradient-to-l px-4 py-3 shadow-inner opacity-80 flex-1',
                                CATEGORY_COLORS_MAP[question.category] ?? 'from-primary to-primary'
                              )}
                            >
                              {question.category}
                            </p>
                            <AddToDeckButton questionId={question.id} compact stopPropagation />
                            <QuestionAccuracyDot questionId={question.id} />
                          </div>
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              <SpeechButton
                                text={question.question_en}
                                label="Question"
                                ariaLabel={`Play English question audio for ${question.question_en}`}
                                stopPropagation
                                showSpeedLabel
                                speedLabel={speedLabel}
                              />
                              {showBurmese && (
                                <BurmeseSpeechButton
                                  questionId={question.id}
                                  audioType="q"
                                  label="မေးခွန်း"
                                  stopPropagation
                                  showSpeedLabel
                                  speedLabel={speedLabel}
                                />
                              )}
                            </div>
                            <p className="mt-4 text-xl font-semibold text-foreground">
                              {question.question_en}
                            </p>
                            {showBurmese && (
                              <p className="text-base text-muted-foreground font-myanmar leading-relaxed">
                                {question.question_my}
                              </p>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-primary">
                            {showBurmese ? 'Tap to flip · ' : 'Tap to flip'}
                            {showBurmese && <span className="font-myanmar">နှိပ်ပါ</span>}
                          </p>
                        </div>
                      </div>
                      <div
                        className={clsx(
                          'flip-card-face flip-card-back flex h-full flex-col rounded-2xl text-white',
                          'bg-gradient-to-br',
                          CATEGORY_COLORS_MAP[question.category] ?? 'from-primary to-primary'
                        )}
                      >
                        {/* Category color strip on back */}
                        <div
                          className={clsx('h-[5px] w-full shrink-0 opacity-50', qColors.stripBg)}
                        />
                        <div className="flex-1 flex flex-col p-6 overflow-hidden">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-white/90 shrink-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em]">
                              {showBurmese ? 'Answer - အဖြေ' : 'Answer'}
                            </p>
                            <div className="flex gap-2">
                              <SpeechButton
                                text={englishAnswersText}
                                label="Answers"
                                ariaLabel={`Play English answers for ${question.question_en}`}
                                stopPropagation
                                showSpeedLabel
                                speedLabel={speedLabel}
                              />
                              {showBurmese && (
                                <BurmeseSpeechButton
                                  questionId={question.id}
                                  audioType="a"
                                  label="အဖြေ"
                                  stopPropagation
                                  showSpeedLabel
                                  speedLabel={speedLabel}
                                />
                              )}
                            </div>
                          </div>
                          {/* Scrollable area for answers + explanation */}
                          <div className="mt-4 flex-1 overflow-y-auto overscroll-contain pr-1 min-h-0">
                            <ul className="space-y-3">
                              {question.studyAnswers.map(answer => (
                                <li
                                  key={answer.text_en}
                                  className="rounded-2xl bg-black/20 px-4 py-3 shadow-inner"
                                >
                                  <p className="text-base font-semibold tracking-wide">
                                    {answer.text_en}
                                  </p>
                                  {showBurmese && (
                                    <p className="pt-1 text-base font-myanmar leading-relaxed">
                                      {answer.text_my}
                                    </p>
                                  )}
                                </li>
                              ))}
                            </ul>
                            {question.explanation && (
                              <div
                                className="mt-3"
                                role="region"
                                aria-label="Explanation"
                                onClick={e => e.stopPropagation()}
                                onKeyDown={e => e.stopPropagation()}
                                onPointerDown={e => e.stopPropagation()}
                              >
                                <ExplanationCard
                                  explanation={question.explanation}
                                  allQuestions={allQuestions}
                                  className="border-white/20 bg-black/20 [&_*]:text-white [&_.text-muted-foreground]:text-white/70 [&_.text-foreground]:text-white [&_.text-primary]:text-white [&_.text-primary]:text-white/80 [&_.text-success]:text-white [&_.text-warning]:text-white [&_button]:hover:bg-white/10 [&_.border-border\\/40]:border-white/20 [&_.border-border\\/60]:border-white/20 [&_.bg-muted\\/30]:bg-white/10 [&_.bg-warning-subtle]:bg-white/10 [&_.dark\\:bg-warning\\/10]:bg-white/10 [&_.bg-primary-subtle]:bg-white/10 [&_.dark\\:bg-primary\\/10]:bg-white/10 [&_.border-warning\\/30]:border-white/20 [&_.border-primary\\/30]:border-white/20"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyGuidePage;
