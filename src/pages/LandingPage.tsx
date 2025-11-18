'use client';

import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Languages, Map, Smartphone } from 'lucide-react';
import AppNavigation from '@/components/AppNavigation';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const features = [
  {
    title: 'Bilingual Mastery • အင်္ဂလိပ်/မြန်မာ',
    description: 'Every civic question is available in English and Burmese with culturally aware explanations.',
    descriptionMy:
      'အမေရိကန်နိုင်ငံသားမေးခွန်းတစ်ခုချင်းစီကို အင်္ဂလိပ်/မြန်မာ ဘာသာနှစ်မျိုးဖြင့် ဖတ်ရှုလေ့လာနိုင်ပါသည်။',
    icon: Languages,
  },
  {
    title: 'Smart Practice Tests • စမ်းသပ်မေးခွန်း စာမေးပွဲ',
    description: 'Timed, randomized 20-question mock tests with real-time scoring feedback.',
    descriptionMy:
      'နေရာမရွေး ဖုန်းထဲကနေ အသုံးပြုနိုင်သော မိနစ် ၂၀ အချိန်၊ မေးခွန်း ၂၀ ဖြင့် လေ့ကျင့်နိုင်ပါသည်။',
    icon: CheckCircle2,
  },
  {
    title: 'Category Insights • အမျိုးအစားအလိုက် ထိုးထွင်းသိမြင်မှု',
    description: 'Analytics that reveal strengths and blind spots across all USCIS knowledge areas.',
    descriptionMy:
      'Supabase အချက်အလက်ဖြင့် သင်၏ အားသာချက်၊ အားနည်းချက်များကို အမျိုးအစားအလိုက် လေ့လာနိုင်ပါသည်။',
    icon: ArrowRight,
  },
];

const LandingPage = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="page-shell overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-[-200px] mx-auto h-[420px] w-[640px] rounded-full bg-gradient-to-r from-primary/40 via-rose-300/40 to-amber-200/40 blur-[120px]" />
      <AppNavigation translucent />
      <header className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-20 pt-16 text-center lg:flex-row lg:items-center lg:text-left">
        <div className="flex-1 space-y-6">
          <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Burmese Language · Mobile ready
          </span>
          <h1 className="text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
            Prepare confidently for the U.S. civics interview — bilingual, modern, and always with you.
            <span className="mt-3 block text-2xl font-semibold text-muted-foreground font-myanmar">
              အမေရိကန်နိုင်ငံသားဖြစ်မှုဆိုင်ရာ စမ်းသပ်စစ်ဆေးမေးခွန်းများကို အင်္ဂလိပ်/မြန်မာနှစ်ဘာသာဖြင့် လေ့လာပြင်ဆင်နိုင်ပါပြီ။
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Civic Test Prep blends immersive flip cards, adaptive timed quizzes, and Supabase-powered analytics so every Burmese learner can master the 100+ USCIS questions in English and မြန်မာ.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-accent px-8 py-3 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/30 transition hover:-translate-y-0.5"
            >
              Create free account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/study"
              className="inline-flex items-center justify-center rounded-full border border-border px-8 py-3 text-base font-semibold text-foreground transition hover:bg-muted/40"
            >
              အခမဲ့အကောင့်ဖွင့်ပါ
            </Link>
          </div>
        </div>
        <div className="flex-1 rounded-3xl border border-border/60 bg-card/80 p-8 shadow-2xl shadow-primary/10 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Live Progress Snapshot</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
              <p className="text-sm text-white/70">Mock Test Score</p>
              <p className="mt-2 text-4xl font-bold">17 / 20</p>
              <p className="text-sm text-white/70">Top 5% of Burmese-language learners</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-lg shadow-rose-100/70">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold text-foreground">12 days</p>
                <p className="text-sm text-muted-foreground">Daily reminders for iOS & Android</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-lg shadow-sky-100/70">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Categories mastered</p>
                <p className="text-2xl font-bold text-foreground">5 / 7</p>
                <p className="text-sm text-muted-foreground">Real-time category heat map</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-card py-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-primary">Everything you need</p>
          <h2 className="mt-4 text-center text-3xl font-bold text-foreground">
            Your bilingual toolkit
            <span className="mt-1 block text-lg font-medium text-muted-foreground font-myanmar">အင်္ဂလိပ်·မြန်မာ နှစ်ဘာသာသင်ရိုးညွှန်း</span>
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {features.map(feature => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-lg shadow-primary/10 transition hover:-translate-y-1 hover:shadow-primary/30"
              >
                <div className="mb-4 inline-flex rounded-full bg-primary/10 p-3 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
                {feature.descriptionMy && (
                  <p className="mt-1 text-sm text-muted-foreground font-myanmar leading-relaxed">{feature.descriptionMy}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 p-8 shadow-lg animate-soft-bounce">
            <Smartphone className="h-8 w-8 text-primary" />
            <h3 className="mt-4 text-2xl font-semibold text-foreground">Designed for mobile study</h3>
            <p className="mt-2 text-muted-foreground">
              Gesture-friendly flip cards, larger tap targets, and breathable Burmese spacing keep the experience smooth on every iOS and Android screen size.
            </p>
            <p className="mt-2 text-muted-foreground font-myanmar">iOS · Android တွင် နှစ်ဘက်လှည့်ကတ်များဖြင့် အလွယ်တကူလေ့လာသင်ယူနိုင်ပါသည်။</p>
          </div>
          <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-rose-500/10 to-amber-400/10 p-8 shadow-lg">
            <Map className="h-8 w-8 text-rose-500" />
            <h3 className="mt-4 text-2xl font-semibold text-foreground">Know exactly what to review</h3>
            <p className="mt-2 text-muted-foreground">
              Color-coded categories, animated transitions, and Supabase-backed history let you navigate between study, tests, and analytics in a single tap.
            </p>
            <p className="mt-2 text-muted-foreground font-myanmar">အရောင်အလိုက် ကဏ္ဍများအလိုက်၊ Supabase မှ မှတ်တမ်းများကို တစ်ချက်တည်းနှိပ်ရုံဖြင့် အသုံးပြုနိုင်ပါသည်။</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
