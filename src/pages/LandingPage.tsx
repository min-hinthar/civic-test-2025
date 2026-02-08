'use client';

import { Navigate, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Brain,
  Clock,
  GraduationCap,
  Mic,
  Smartphone,
  Star,
  Trophy,
  WifiOff,
} from 'lucide-react';
import AppNavigation from '@/components/AppNavigation';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/Button';
import { FadeIn, StaggeredList, StaggeredItem } from '@/components/animations/StaggeredList';

const features = [
  {
    icon: BookOpen,
    titleEn: '100+ USCIS Questions',
    titleMy: 'USCIS မေးခွန်း ၁၀၀+',
    descEn: 'All official civics questions with detailed bilingual explanations and memory tips.',
    descMy: 'အဖြေရှင်းလင်းချက်နှင့် မှတ်ဉာဏ်အကူများပါသော USCIS မေးခွန်းအားလုံး။',
  },
  {
    icon: Brain,
    titleEn: 'Spaced Repetition',
    titleMy: 'ထပ်ခါထပ်ခါ မှတ်မိအောင်လေ့ကျင့်',
    descEn: 'Smart flashcard system schedules reviews at the perfect time for long-term memory.',
    descMy: 'ရေရှည်မှတ်မိနိုင်ရန် အချိန်မှန်မှန် ပြန်လည်လေ့ကျင့်ပေးသော စနစ်။',
  },
  {
    icon: Clock,
    titleEn: 'Timed Mock Tests',
    titleMy: 'အချိန်သတ်မှတ် စာမေးပွဲ',
    descEn: 'Realistic 20-question tests with instant scoring and detailed review.',
    descMy: 'အမှတ်ချက်ချင်းပေးပြီး ပြန်လည်လေ့လာနိုင်သော မေးခွန်း ၂၀ စာမေးပွဲ။',
  },
  {
    icon: Mic,
    titleEn: 'Interview Practice',
    titleMy: 'အင်တာဗျူးလေ့ကျင့်မှု',
    descEn: 'Practice speaking answers aloud with voice recording and TTS pronunciation.',
    descMy: 'အသံဖမ်းခြင်းနှင့် အသံထွက်လေ့ကျင့်ခြင်းဖြင့် အင်တာဗျူးပြင်ဆင်ပါ။',
  },
];

const stats = [
  { emoji: '📚', labelEn: '100+ Questions', labelMy: 'မေးခွန်း ၁၀၀+' },
  { emoji: '🇺🇸', labelEn: 'EN + MY Bilingual', labelMy: 'နှစ်ဘာသာ' },
  { emoji: '📱', labelEn: 'Offline Ready', labelMy: 'အင်တာနက်မလို' },
  { emoji: '🏆', labelEn: 'Track Progress', labelMy: 'တိုးတက်မှုမှတ်တမ်း' },
];

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="page-shell overflow-hidden">
      <AppNavigation translucent />

      {/* Hero Section */}
      <header className="relative mx-auto max-w-4xl px-4 pb-12 pt-12 text-center sm:px-6 sm:pt-16 md:pb-16">
        {/* Decorative gradient blob */}
        <div className="pointer-events-none absolute inset-x-0 top-[-120px] mx-auto h-[350px] w-[500px] rounded-full bg-gradient-to-r from-primary/30 via-accent-500/20 to-success-400/20 blur-[100px] dark:opacity-60" />

        <FadeIn>
          {/* Patriotic mascot emojis */}
          <div
            className="mb-4 flex items-center justify-center gap-3 text-4xl sm:text-5xl"
            aria-hidden="true"
          >
            <span>🦅</span>
            <span>🗽</span>
            <span>🇺🇸</span>
          </div>

          {/* Main headline */}
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            U.S. Citizenship Test Prep
          </h1>
          <p className="mt-2 font-myanmar text-lg text-muted-foreground sm:text-xl">
            အမေရိကန်နိုင်ငံသားရေးရာစာမေးပွဲသင်ရိုး
          </p>

          {/* Bilingual tagline */}
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Master all 100 USCIS civics questions in English and Burmese. Study smart, pass with
            confidence.
          </p>
          <p className="mx-auto mt-1 max-w-xl font-myanmar text-sm text-muted-foreground sm:text-base">
            အင်္ဂလိပ်နှင့်မြန်မာနှစ်ဘာသာဖြင့် USCIS မေးခွန်း ၁၀၀ ကို ကျွမ်းကျင်စွာလေ့လာပါ။
            ယုံကြည်မှုနဲ့ အောင်မြင်ပါ။
          </p>
        </FadeIn>

        {/* CTA Buttons */}
        <FadeIn delay={200}>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="w-full text-lg sm:w-auto sm:px-10"
            >
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/study')}
              className="w-full sm:w-auto"
            >
              Browse Questions
            </Button>
          </div>
          <p className="mt-3 font-myanmar text-sm text-muted-foreground">
            အခမဲ့စတင်ပါ - အကောင့်ဖွင့်ရန်မလိုပါ
          </p>
        </FadeIn>

        {/* Stats badges */}
        <FadeIn delay={400}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {stats.map(stat => (
              <div
                key={stat.labelEn}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur"
              >
                <span className="text-lg" aria-hidden="true">
                  {stat.emoji}
                </span>
                <span className="text-foreground">{stat.labelEn}</span>
                <span className="font-myanmar text-xs text-muted-foreground">{stat.labelMy}</span>
              </div>
            ))}
          </div>
        </FadeIn>
      </header>

      {/* Feature Cards Section */}
      <section className="bg-card/50 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <FadeIn>
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
                Everything You Need to Pass
              </h2>
              <p className="mt-1 font-myanmar text-base text-muted-foreground">
                အောင်မြင်ရန် လိုအပ်သမျှအားလုံး
              </p>
            </div>
          </FadeIn>

          <StaggeredList className="mt-10 grid gap-4 sm:grid-cols-2" delay={100} stagger={100}>
            {features.map(feature => (
              <StaggeredItem key={feature.titleEn}>
                <div className="flex gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-foreground sm:text-lg">
                      {feature.titleEn}
                    </h3>
                    <p className="mt-0.5 font-myanmar text-sm text-primary/80">{feature.titleMy}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.descEn}
                    </p>
                    <p className="mt-1 font-myanmar text-xs leading-relaxed text-muted-foreground">
                      {feature.descMy}
                    </p>
                  </div>
                </div>
              </StaggeredItem>
            ))}
          </StaggeredList>
        </div>
      </section>

      {/* Why This App Section */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <FadeIn>
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
                Built for Burmese Learners
              </h2>
              <p className="mt-1 font-myanmar text-base text-muted-foreground">
                မြန်မာလေ့လာသူများအတွက် အထူးပြုလုပ်ထားသည်
              </p>
            </div>
          </FadeIn>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <FadeIn delay={100}>
              <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 to-primary/10 p-6 text-center shadow-md">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <GraduationCap className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Study Your Way</h3>
                <p className="mt-1 font-myanmar text-sm text-muted-foreground">
                  သင့်ပုံစံနဲ့ လေ့လာပါ
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Flashcards, tests, interviews, and practice modes for every learning style.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-accent-500/5 to-accent-500/10 p-6 text-center shadow-md">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500/10">
                  <Smartphone className="h-7 w-7 text-accent-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Works on Any Device</h3>
                <p className="mt-1 font-myanmar text-sm text-muted-foreground">
                  မည်သည့်စက်ပစ္စည်းတွင်မဆို
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Mobile-first design with offline support. Study anywhere, anytime.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={300}>
              <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-success-400/5 to-success-400/10 p-6 text-center shadow-md">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-success-400/10">
                  <Trophy className="h-7 w-7 text-success-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Track Your Progress</h3>
                <p className="mt-1 font-myanmar text-sm text-muted-foreground">
                  တိုးတက်မှုကို ခြေရာခံပါ
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Streaks, badges, mastery levels, and leaderboards to keep you motivated.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Offline + Mobile section */}
      <section className="bg-card/50 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FadeIn>
            <div className="flex flex-col items-center gap-6 rounded-2xl border border-border/60 bg-card p-6 text-center shadow-md sm:flex-row sm:text-left">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <WifiOff className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Study Offline, Sync When Ready
                </h3>
                <p className="mt-0.5 font-myanmar text-sm text-muted-foreground">
                  အင်တာနက်မရှိလည်း လေ့လာနိုင်ပြီး ပြန်ချိတ်ဆက်သောအခါ အလိုအလျောက်ချိတ်ဆက်ပေးပါသည်
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  All questions are cached on your device. Your progress syncs automatically when
                  you reconnect.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <FadeIn>
            <div className="flex justify-center text-4xl" aria-hidden="true">
              <span>🇺🇸</span>
            </div>
            <h2 className="mt-4 text-2xl font-extrabold text-foreground sm:text-3xl">
              Ready to Start Your Journey?
            </h2>
            <p className="mt-1 font-myanmar text-base text-muted-foreground">
              သင့်ခရီးစတင်ဖို့ အဆင်သင့်ဖြစ်ပြီလား
            </p>
            <p className="mt-3 text-muted-foreground">
              Join learners preparing for the U.S. citizenship test with confidence.
            </p>
            <div className="mt-6">
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="w-full text-lg sm:w-auto sm:px-10"
              >
                <Star className="mr-2 h-5 w-5" />
                Start Studying Today
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6">
        <div className="mx-auto max-w-4xl px-4 text-center text-sm text-muted-foreground sm:px-6">
          <p>
            Civic Test Prep 2025 &mdash; Free bilingual study tool for the U.S. citizenship test
          </p>
          <p className="mt-1 font-myanmar text-xs">
            အမေရိကန်နိုင်ငံသားရေးရာစာမေးပွဲအတွက် အခမဲ့နှစ်ဘာသာလေ့လာရေးကိရိယာ
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
