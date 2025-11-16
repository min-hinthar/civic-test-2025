'use client';

import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Languages, Map, Smartphone } from 'lucide-react';
import AppNavigation from '@/components/AppNavigation';

const features = [
  {
    title: 'Bilingual Mastery • 双ဘာသာ',
    description: 'Every civic question is available in English and Burmese with culturally aware explanations.',
    descriptionMy:
      'အမေရိကန်နိုင်ငံသားမေးခွန်းတစ်ခုချင်းစီကို အင်္ဂလိပ်/မြန်မာနောက်ခံနှစ်မျိုးဖြင့် ဖတ်ရှုလေ့လာနိုင်ပါသည်။',
    icon: Languages,
  },
  {
    title: 'Smart Practice Tests • စမ်းသပ်မေးခွန်း',
    description: 'Timed, randomized 20-question mock tests with real-time scoring feedback.',
    descriptionMy:
      'နေရာမရွေး ဖုန်းထဲကနေ အသုံးပြုနိုင်သော အချိန်တိုင်းတာမေးခွန်း ၂၀ မျိုးဖြင့် လေ့ကျင့်နိုင်ပါသည်။',
    icon: CheckCircle2,
  },
  {
    title: 'Category Insights • အပိုင်းလိုက် မျက်နှာမီ',
    description: 'Analytics that reveal strengths and blind spots across all USCIS knowledge areas.',
    descriptionMy:
      'Supabase အချက်အလက်ဖြင့် သင်၏ အားသာချက်၊ အားနည်းချက်များကို အပိုင်းလိုက် လိုက်ကြည့်လေ့လာနိုင်ပါသည်။',
    icon: ArrowRight,
  },
];

const LandingPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-rose-50 via-white to-sky-50">
      <div className="pointer-events-none absolute inset-x-0 top-[-200px] mx-auto h-[420px] w-[640px] rounded-full bg-gradient-to-r from-primary/40 via-rose-300/40 to-amber-200/40 blur-[120px]" />
      <AppNavigation translucent />
      <header className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-20 pt-16 text-center lg:flex-row lg:items-center lg:text-left">
        <div className="flex-1 space-y-6">
          <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Burmese friendly · Mobile ready
          </span>
          <h1 className="text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
            Prepare confidently for the U.S. civics interview — bilingual, modern, and always with you.
            <span className="mt-3 block text-2xl font-semibold text-slate-600 font-myanmar">
              အမေရိကန်နိုင်ငံသား စစ်ဆေးမေးမြန်းမှုကို အင်္ဂလိပ်/မြန်မာနှစ်ဘာသာဖြင့် ခိုင်ခိုင်မာမာ ပြင်ဆင်ကြရအောင်။
            </span>
          </h1>
          <p className="text-lg text-slate-600">
            Civic Test Prep blends immersive flip cards, adaptive timed quizzes, and Supabase-powered analytics so every Burmese learner can master the 100+ USCIS questions in English and မြန်မာ.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/30 transition hover:-translate-y-0.5 hover:bg-primary/90"
            >
              Create free account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/study"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/70 px-8 py-3 text-base font-semibold text-slate-700 transition hover:bg-white"
            >
              Explore the study guide
            </Link>
          </div>
        </div>
        <div className="flex-1 rounded-3xl border border-white/60 bg-white/80 p-8 shadow-2xl shadow-slate-200/70 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Live Progress Snapshot</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
              <p className="text-sm text-white/70">Mock Test Score</p>
              <p className="mt-2 text-4xl font-bold">17 / 20</p>
              <p className="text-sm text-white/70">Top 5% of Burmese-language learners</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-rose-100/70">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Streak</p>
                <p className="text-2xl font-bold text-slate-900">12 days</p>
                <p className="text-sm text-slate-500">Daily reminders for iOS & Android</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-sky-100/70">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Categories mastered</p>
                <p className="text-2xl font-bold text-slate-900">5 / 7</p>
                <p className="text-sm text-slate-500">Real-time category heat map</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-primary">Everything you need</p>
          <h2 className="mt-4 text-center text-3xl font-bold text-slate-900">
            Your bilingual toolkit
            <span className="mt-1 block text-lg font-medium text-slate-500 font-myanmar">အင်္ဂလိပ်·မြန်မာ သင့်အတွက် တစ်ခုတည်း</span>
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {features.map(feature => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-primary/20"
              >
                <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-slate-600">{feature.description}</p>
                {feature.descriptionMy && (
                  <p className="mt-1 text-sm text-slate-500 font-myanmar leading-relaxed">{feature.descriptionMy}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 p-8 shadow-lg animate-soft-bounce">
            <Smartphone className="h-8 w-8 text-primary" />
            <h3 className="mt-4 text-2xl font-semibold text-slate-900">Designed for mobile study</h3>
            <p className="mt-2 text-slate-600">
              Gesture-friendly flip cards, larger tap targets, and breathable Burmese spacing keep the experience smooth on every iOS and Android screen size.
            </p>
            <p className="mt-2 text-slate-600 font-myanmar">iOS · Android တွင် လက်နှစ်ဖက်မလွတ်ဘဲ အလွယ်တကူ နည်းလမ်းလေးများနှင့် လေ့လာနိုင်စေသည်။</p>
          </div>
          <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-rose-500/10 to-amber-400/10 p-8 shadow-lg">
            <Map className="h-8 w-8 text-rose-500" />
            <h3 className="mt-4 text-2xl font-semibold text-slate-900">Know exactly what to review</h3>
            <p className="mt-2 text-slate-600">
              Color-coded categories, animated transitions, and Supabase-backed history let you navigate between study, tests, and analytics in a single tap.
            </p>
            <p className="mt-2 text-slate-600 font-myanmar">အရောင်အလိုက် အပိုင်းများနှင့် Supabase မှ မှတ်တမ်းများကြောင့် တစ်ချက်တည်းနှိပ်ရုံဖြင့် လိုအပ်ရာစာအုပ်သို့ ပြန်သွားနိုင်ပါသည်။</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
