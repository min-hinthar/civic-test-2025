'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';

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
        toast({ title: 'သင့်အကောင့်သို့ ဝင်ရောက်ပြီးပါပြီ', description: 'Welcome back! 🎉' });
      } else {
        await register(form.name, form.email, form.password);
        toast({ title: 'အကောင့်အသစ် ဖန်တီးပြီးပါပြီ', description: 'Check your inbox to verify your email.' });
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6 flex justify-between rounded-full bg-slate-100 p-1 text-sm font-semibold">
          <button
            className={`flex-1 rounded-full px-3 py-2 ${mode === 'login' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}
            onClick={() => setMode('login')}
          >
            Sign in
          </button>
          <button
            className={`flex-1 rounded-full px-3 py-2 ${mode === 'register' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}
            onClick={() => setMode('register')}
          >
            Create account
          </button>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div>
              <label className="text-sm font-medium text-slate-600">Full name</label>
              <input
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3"
                value={form.name}
                onChange={event => setForm({ ...form, name: event.target.value })}
                required
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-slate-600">Email</label>
            <input
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3"
              type="email"
              value={form.email}
              onChange={event => setForm({ ...form, email: event.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Password</label>
            <input
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3"
              type="password"
              value={form.password}
              onChange={event => setForm({ ...form, password: event.target.value })}
              required
            />
          </div>
          {authError && <p className="text-sm text-red-600">{authError}</p>}
          <button
            type="submit"
            className="w-full rounded-2xl bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/40"
          >
            {mode === 'login' ? 'Sign in' : 'Create free account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Back to{' '}
          <Link className="font-semibold text-primary" to="/">
            landing page
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
