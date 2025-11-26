'use client';

import { useCallback, useEffect, useMemo, useState, KeyboardEvent } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { civicsQuestions } from '@/constants/civicsQuestions';
import AppNavigation from '@/components/AppNavigation';
import SpeechButton from '@/components/ui/SpeechButton';

const categoryColors: Record<string, string> = {
  'Principles of American Democracy': 'from-rose-500 to-pink-500',
  'System of Government': 'from-blue-500 to-cyan-500',
  'Rights and Responsibilities': 'from-emerald-500 to-lime-500',
  'American History: Colonial Period and Independence': 'from-amber-500 to-orange-500',
  'American History: 1800s': 'from-fuchsia-500 to-purple-500',
  'Recent American History and Other Important Historical Information': 'from-sky-500 to-indigo-500',
  'Civics: Symbols and Holidays': 'from-slate-500 to-stone-500',
};

const StudyGuidePage = () => {
  const questionCategories = useMemo<string[]>(
    () => Array.from(new Set(civicsQuestions.map(question => question.category))),
    []
  );
  const categories = useMemo(() => ['all', ...questionCategories], [questionCategories]);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

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
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const nextCategory = getValidCategory(searchParams);
    if (nextCategory !== category) {
      setCategory(nextCategory);
    }
  }, [category, getValidCategory, searchParams]);

  useEffect(() => {
    if (location.hash) {
      const target = document.getElementById(location.hash.replace('#', ''));
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  const toggleCard = useCallback((id: number) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

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

  const filteredQuestions = useMemo(() => {
    return category === 'all'
      ? civicsQuestions
      : civicsQuestions.filter(question => question.category === category);
  }, [category]);

  return (
    <div className="page-shell">
      <AppNavigation />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="glass-panel flex flex-col gap-4 p-6 shadow-primary/20 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Study Guide · လေ့လာမှုအညွှန်း</p>
            <h1 className="text-3xl font-bold text-foreground">
              Interactive Bilingual Flip-Cards
              <span className="mt-1 block text-lg font-normal text-muted-foreground font-myanmar">အင်္ဂလိပ်/မြန်မာ နှစ်ဘက်လှည့်ကတ်များ</span>
            </h1>
            <p className="text-muted-foreground">Tap a card to reveal Burmese answers with extra spacing for easier reading.</p>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Sort by category · <span className="font-myanmar text-muted-foreground">ကဏ္ဍရွေးချယ်ရန်</span>
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
          {filteredQuestions.map(question => {
            const isLocked = Boolean(flippedCards[question.id]);
            const isFlipped = isLocked;
            const englishAnswersText = question.studyAnswers.map(answer => answer.text_en).join('. ');

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
                      <p className={clsx(
                        'text-xs font-semibold uppercase tracking-[0.2em] rounded-2xl bg-gradient-to-l px-4 py-3 shadow-inner opacity-80',
                        categoryColors[question.category] ?? 'from-primary to-primary'
                      )}>{question.category}</p>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <SpeechButton
                            text={question.question_en}
                            label="Play Question"
                            ariaLabel={`Play English question audio for ${question.question_en}`}
                            stopPropagation
                          />
                        </div>
                        <p className="mt-4 text-xl font-semibold text-foreground">{question.question_en}</p>
                        <p className="text-base text-muted-foreground font-myanmar leading-relaxed">{question.question_my}</p>
                      </div>
                      <p className="text-sm font-semibold text-primary">Tap to flip · <span className="font-myanmar">နှိပ်ပါ</span></p>
                    </div>
                    <div
                      className={clsx(
                        'flip-card-face flip-card-back flex h-full flex-col rounded-3xl p-6 text-white',
                        'bg-gradient-to-br',
                        categoryColors[question.category] ?? 'from-primary to-primary'
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-white/90">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em]">Answer - အဖြေ</p>
                        <SpeechButton
                          text={englishAnswersText}
                          label="Play Answers"
                          ariaLabel={`Play English answers for ${question.question_en}`}
                          stopPropagation
                        />
                      </div>
                      <ul className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1 content-center">
                        {question.studyAnswers.map(answer => (
                          <li key={answer.text_en} className="rounded-2xl bg-black/20 px-4 py-3 shadow-inner">
                            <p className="text-base font-semibold tracking-wide">{answer.text_en}</p>
                            <p className="pt-1 text-base font-myanmar leading-relaxed">{answer.text_my}</p>
                          </li>
                        ))}
                      </ul>
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
