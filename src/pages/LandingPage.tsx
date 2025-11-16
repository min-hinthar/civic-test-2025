'use client';

import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Languages } from 'lucide-react';

const features = [
  {
    title: 'Bilingual Mastery',
    description: 'Every civic question is available in English and Burmese with culturally aware explanations.',
    icon: Languages,
  },
  {
    title: 'Smart Practice Tests',
    description: 'Timed, randomized 20-question mock tests with real-time scoring feedback.',
    icon: CheckCircle2,
  },
  {
    title: 'Category Insights',
    description: 'Analytics that reveal strengths and blind spots across all USCIS knowledge areas.',
    icon: ArrowRight,
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <header className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-20 pt-16 text-center lg:flex-row lg:text-left">
        <div className="flex-1 space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">For Burmese-speaking future citizens</p>
          <h1 className="text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
            Prepare confidently for the U.S. Citizenship civics interview — anytime, anywhere.
          </h1>
          <p className="text-lg text-slate-600">
            Civic Test Prep blends immersive study cards, adaptive quizzes, and Supabase-powered progress tracking to help you
            memorize every required answer in both languages.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:bg-primary/90"
            >
              Create free account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/study"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-8 py-3 text-base font-semibold text-slate-700 transition hover:bg-white"
            >
              Explore the study guide
            </Link>
          </div>
        </div>
        <div className="flex-1 rounded-3xl border border-white/60 bg-white/70 p-8 shadow-xl backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Live Progress Snapshot</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-900/90 p-6 text-white">
              <p className="text-sm text-white/70">Mock Test Score</p>
              <p className="mt-2 text-4xl font-bold">17 / 20</p>
              <p className="text-sm text-white/60">Top 5% of Burmese-language learners</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Streak</p>
                <p className="text-2xl font-bold text-slate-900">12 days</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Categories mastered</p>
                <p className="text-2xl font-bold text-slate-900">5 / 7</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-primary">Everything you need</p>
          <h2 className="mt-4 text-center text-3xl font-bold text-slate-900">Your bilingual toolkit</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {features.map(feature => (
              <div key={feature.title} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-6">
                <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
