'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import AppNavigation from '@/components/AppNavigation';
import GoogleOneTapSignIn from '@/components/GoogleOneTapSignIn';
import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/animations/StaggeredList';

const AuthPage = () => {
  const { login, register, authError, user, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast({
          title: 'Welcome back!',
          description: 'ကြိုဆိုပါတယ်! သင့်အကောင့်သို့ ဝင်ရောက်ပြီးပါပြီ',
        });
      } else if (mode === 'register') {
        await register(form.name, form.email, form.password);
        toast({
          title: 'Account created!',
          description: 'Check your email to confirm. အီးမေးလ်ဖြင့် အတည်ပြုပါ။',
        });
      } else {
        await sendPasswordReset(form.email, `${window.location.origin}/auth/update-password`);
        toast({
          title: 'Check your inbox',
          description: 'We sent a password reset link. လျှို့ဝှက်စာလင့်ခ်ကို အီးမေးလ်တွင်စစ်ပါ။',
        });
        setMode('login');
        return;
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
      <div className="mx-auto flex max-w-md flex-col gap-6 px-4 pb-16 pt-10">
        <FadeIn>
          {/* Patriotic header */}
          <div className="text-center">
            <div
              className="mb-3 flex items-center justify-center gap-2 text-3xl"
              aria-hidden="true"
            >
              <span>🦅</span>
              <span>🗽</span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'register' && 'Join Us'}
              {mode === 'forgot' && 'Reset Password'}
            </h1>
            <p className="mt-1 font-myanmar text-sm text-muted-foreground">
              {mode === 'login' && 'ပြန်လာတာကို ကြိုဆိုပါတယ်'}
              {mode === 'register' && 'ကျွန်ုပ်တို့နှင့်ပူးပေါင်းပါ'}
              {mode === 'forgot' && 'လျှို့ဝှက်စာနံပါတ်ပြန်လည်သတ်မှတ်ပါ'}
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-lg">
            {/* Mode tabs */}
            <div className="mb-6 grid grid-cols-3 gap-1 rounded-xl bg-muted/50 p-1 text-sm font-bold">
              <button
                className={`min-h-[44px] rounded-xl px-2 transition-colors ${mode === 'login' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
                onClick={() => setMode('login')}
              >
                Sign in
              </button>
              <button
                className={`min-h-[44px] rounded-xl px-2 transition-colors ${mode === 'register' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
                onClick={() => setMode('register')}
              >
                Register
              </button>
              <button
                className={`min-h-[44px] rounded-xl px-2 transition-colors ${mode === 'forgot' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
                onClick={() => setMode('forgot')}
              >
                Forgot?
              </button>
            </div>

            {/* Google sign-in */}
            {mode !== 'forgot' && (
              <div className="mb-5">
                <GoogleOneTapSignIn />
                <div className="my-4 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  <span>
                    or use email
                    <span className="font-myanmar"> · သို့မဟုတ် အီးမေးလ်</span>
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>
              </div>
            )}

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === 'register' && (
                <div>
                  <label className="text-sm font-semibold text-foreground">
                    Full name{' '}
                    <span className="font-myanmar text-xs text-muted-foreground">
                      အမည်အပြည့်အစုံ
                    </span>
                  </label>
                  <input
                    className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 min-h-[44px] text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={form.name}
                    onChange={event => setForm({ ...form, name: event.target.value })}
                    required={mode === 'register'}
                    placeholder="Your full name"
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-foreground">
                  Email <span className="font-myanmar text-xs text-muted-foreground">အီးမေးလ်</span>
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 min-h-[44px] text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  type="email"
                  value={form.email}
                  onChange={event => setForm({ ...form, email: event.target.value })}
                  required
                  placeholder="you@example.com"
                />
              </div>
              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground">
                      Password{' '}
                      <span className="font-myanmar text-xs text-muted-foreground">
                        လျှို့ဝှက်စာနံပါတ်
                      </span>
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        className="text-xs font-semibold text-primary"
                        onClick={() => setMode('forgot')}
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <input
                    className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 min-h-[44px] text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    type="password"
                    value={form.password}
                    onChange={event => setForm({ ...form, password: event.target.value })}
                    required
                    minLength={mode === 'register' ? 12 : 6}
                    placeholder={mode === 'register' ? '12+ characters' : 'Your password'}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {mode === 'register'
                      ? 'Use 12+ characters for a strong password.'
                      : 'Minimum 6 characters.'}
                  </p>
                </div>
              )}

              {authError && <p className="text-sm font-medium text-destructive">{authError}</p>}

              <Button
                type="submit"
                fullWidth
                size="lg"
                disabled={
                  (mode === 'register' && form.password.length < 12) ||
                  (mode === 'login' && form.password.length < 6)
                }
              >
                {mode === 'login' && 'Sign In'}
                {mode === 'register' && 'Create Free Account'}
                {mode === 'forgot' && 'Send Reset Email'}
              </Button>

              {mode === 'register' && (
                <p className="text-center text-xs text-muted-foreground">
                  You will receive a confirmation email.{' '}
                  <span className="font-myanmar">အီးမေးလ်ဖြင့် အတည်ပြုပါ။</span>
                </p>
              )}
              {mode === 'forgot' && (
                <p className="text-center text-xs text-muted-foreground">
                  We will send a secure reset link.{' '}
                  <span className="font-myanmar">
                    လျှို့ဝှက်လင့်ခ်ကို အီးမေးလ်ဖြင့်ပို့ပေးပါမည်။
                  </span>
                </p>
              )}
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              <Link className="font-semibold text-primary" to="/">
                Back to home
              </Link>
              <span className="font-myanmar text-xs"> · ပင်မသို့ပြန်ပါ</span>
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

export default AuthPage;
