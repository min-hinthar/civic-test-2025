'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import AppNavigation from '@/components/AppNavigation';

const AuthPage = () => {
  const { login, register, authError, user } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast({ title: 'သင့်အကောင့်သို့ ဝင်ရောက်ပြီးပါပြီ', description: 'Welcome back! ကြိုဆိုပါတယ် 🎉' });
      } else {
        await register(form.name, form.email, form.password);
        toast({ title: 'အကောင့်အသစ် ဖန်တီးပြီးပါပြီ', description: 'Please click link in email to confirm your account on Civic Test App! သင့်အကောင့်ကို အတည်ပြုရန် email တွင်လင့်ခ်ကိုနှိပ်ပါ။' });
      }
      const redirectTo = (location.state as { from?: string })?.from ?? '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, user]);

  return (
    <div className="page-shell">
      <AppNavigation translucent />
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-16 pt-10 lg:flex-row">
        <div className="flex-1 rounded-3xl border border-border/60 bg-card/80 p-8 shadow-2xl shadow-primary/10 backdrop-blur">
          <div className="mb-6 flex justify-between rounded-full bg-muted/50 p-1 text-sm font-semibold">
            <button
              className={`flex-1 rounded-full px-3 py-2 ${mode === 'login' ? 'bg-card text-foreground shadow' : 'text-muted-foreground'}`}
              onClick={() => setMode('login')}
            >
              Sign in
            </button>
            <button
              className={`flex-1 rounded-full px-3 py-2 ${mode === 'register' ? 'bg-card text-foreground shadow' : 'text-muted-foreground'}`}
              onClick={() => setMode('register')}
            >
              Create account
            </button>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Full name · <span className="font-myanmar text-muted-foreground">အမည်အပြည့်အစုံ</span>
                </label>
                <input
                  className="mt-1 w-full rounded-2xl border border-border bg-card/70 px-4 py-3"
                  value={form.name}
                  onChange={event => setForm({ ...form, name: event.target.value })}
                  required
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email · <span className="font-myanmar text-muted-foreground">အီးမေးလ်</span>
              </label>
              <input
                className="mt-1 w-full rounded-2xl border border-border bg-card/70 px-4 py-3"
                type="email"
                value={form.email}
                onChange={event => setForm({ ...form, email: event.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Password · <span className="font-myanmar text-muted-foreground">လျှို့ဝှက်စာနံပါတ်</span>
              </label>
              <input
                className="mt-1 w-full rounded-2xl border border-border bg-card/70 px-4 py-3"
                type="password"
                value={form.password}
                onChange={event => setForm({ ...form, password: event.target.value })}
                required
              />
            </div>
            {authError && <p className="text-sm text-red-600">{authError}</p>}
            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-primary to-rose-500 px-4 py-3 font-semibold text-primary-foreground shadow-xl shadow-primary/40"
            >
              {mode === 'login' ? 'Sign in' : 'Create free account'}
            </button>
            {mode === 'register' && (
              <p className="text-xs text-muted-foreground">
                You will receive a Supabase confirmation email. <span className="font-myanmar">အီးမေးလ်ဖြင့် အတည်ပြုပါ။</span>
              </p>
            )}
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Back to{' '}
            <Link className="font-semibold text-primary" to="/">
              landing page
            </Link>
          </p>
        </div>
        <div className="flex-1 rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-rose-300/10 to-amber-200/10 p-8 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">အင်္ဂလိပ်-မြန်မာ နှစ်ဘာသာသင်ရိုးညွှန်း</p>
          <h2 className="mt-3 text-3xl font-semibold text-foreground">
            Study in both English and မြန်မာ
            <span className="block text-lg font-normal text-muted-foreground font-myanmar">လေ့လာသင်ယူ ဖတ်ရလွယ်ကူ</span>
          </h2>
          <p className="mt-3 text-base text-muted-foreground font-myanmar">
            မြန်မာစာ-အင်္ဂလိပ်စာဖြင့် iOS/Android များတွင်လွယ်လွယ်ကူကူအသုံးပြုနိုင်ပါပြီ။
          </p>
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
              <p className="text-sm font-semibold text-foreground">One tap navigation</p>
              <p className="text-sm text-muted-foreground">Dashboard → Test → History without leaving the app shell.</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
              <p className="text-sm font-semibold text-foreground">Progress sync via Supabase</p>
              <p className="text-sm text-muted-foreground">Mock tests, categories, and accuracy update instantly.</p>
              <p className="text-sm text-muted-foreground font-myanmar">Supabase နှင့် ချိတ်ဆက်ထားသောကြောင့် မေးခွန်းမှတ်တမ်းများ အချိန်နှင့်တပြေးညီ ပြန်လည်ပြင်ဆင်ပေးနိုင်ပါသည်။</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
