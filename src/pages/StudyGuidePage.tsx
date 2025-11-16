'use client';

import { useMemo, useState } from 'react';
import { civicsQuestions } from '@/constants/civicsQuestions';
import AppNavigation from '@/components/AppNavigation';

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
  const [category, setCategory] = useState<string>('all');
  const categories = useMemo(
    () => ['all', ...new Set(civicsQuestions.map(question => question.category))],
    []
  );

  const filteredQuestions = useMemo(() => {
    return category === 'all'
      ? civicsQuestions
      : civicsQuestions.filter(question => question.category === category);
  }, [category]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-slate-50">
      <AppNavigation />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/95 p-6 shadow-2xl shadow-primary/10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Study guide · လေ့လာမှုအညွှန်း</p>
            <h1 className="text-3xl font-bold text-slate-900">
              Interactive bilingual flip-cards
              <span className="mt-1 block text-lg font-normal text-slate-500 font-myanmar">အင်္ဂလိပ်/မြန်မာ နှစ်ဘက်လှည့်ကတ်များ</span>
            </h1>
            <p className="text-slate-600">Hover, tap, or swipe to reveal Burmese answers with extra spacing for easier reading.</p>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Sort by category · <span className="font-myanmar text-slate-400">အပိုင်းရွေးချယ်ရန်</span>
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
              value={category}
              onChange={event => setCategory(event.target.value)}
            >
              {categories.map(option => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All categories · အားလုံး' : option}
                </option>
              ))}
            </select>
          </div>
        </header>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredQuestions.map(question => (
            <div key={question.id} className="group h-64 [perspective:1200px]">
              <div className="relative h-full w-full rounded-3xl border border-slate-100 bg-white/90 text-slate-900 transition [transform-style:preserve-3d] duration-500 group-hover:[transform:rotateY(180deg)]">
                <div className="absolute inset-0 flex flex-col rounded-3xl p-5 [backface-visibility:hidden]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{question.category}</p>
                  <p className="mt-4 text-lg font-semibold text-slate-900">{question.question_en}</p>
                  <p className="mt-2 text-base text-slate-500 font-myanmar leading-relaxed">{question.question_my}</p>
                </div>
                <div
                  className={`absolute inset-0 flex flex-col rounded-3xl p-5 text-white [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br ${
                    categoryColors[question.category] ?? 'from-primary to-primary'
                  }`}
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">မြန်မာလို အဖြေ</p>
                  <ul className="mt-4 space-y-2">
                    {question.studyAnswers.map(answer => (
                      <li key={answer.text_en} className="rounded-2xl bg-white/20 px-3 py-2">
                        <p className="text-sm font-semibold">{answer.text_en}</p>
                        <p className="text-sm text-white/90 font-myanmar leading-relaxed">{answer.text_my}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyGuidePage;
