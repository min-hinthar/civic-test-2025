'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppNavigation from '@/components/AppNavigation';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/animations/StaggeredList';

const PasswordUpdatePage = () => {
  const { user, isLoading, updatePassword, authError } = useAuth();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({ password: '', confirm: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) return;
    const timer = setTimeout(() => {
      toast({
        title: 'Open from the secure email link',
        description:
          'We need the recovery session to update your password. လျှို့ဝှက်စာပြောင်းရန် အီးမေးလ်လင့်ခ်မှဖွင့်ပါ။',
        variant: 'destructive',
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (passwords.password !== passwords.confirm) {
      toast({
        title: 'Passwords must match',
        description: 'Please confirm the same password. လျှို့ဝှက်စာနံပါတ်များ တူညီရပါမည်။',
        variant: 'warning',
      });
      return;
    }
    if (passwords.password.length < 12) {
      toast({
        title: 'Password too short',
        description: 'Use at least 12 characters. အနည်းဆုံး ၁၂ လုံး ထည့်ပါ။',
        variant: 'warning',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await updatePassword(passwords.password);
      toast({
        title: 'Password updated!',
        description: 'Your new password is active. လျှို့ဝှက်စာနံပါတ်အသစ် အသုံးပြုနိုင်ပါပြီ။',
      });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <AppNavigation translucent />
      <div className="mx-auto max-w-md px-4 pb-16 pt-12">
        <FadeIn>
          <div className="text-center">
            <div
              className="mb-3 flex items-center justify-center gap-2 text-3xl"
              aria-hidden="true"
            >
              <span>🔐</span>
              <span>🗽</span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">Update Your Password</h1>
            <p className="mt-1 font-myanmar text-sm text-muted-foreground">
              သင့်လျှို့ဝှက်စာနံပါတ်ကို အသစ်ပြောင်းပါ
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="mt-6 rounded-2xl border border-border/60 bg-card p-6 shadow-lg">
            <p className="mb-4 text-sm text-muted-foreground">
              Choose a strong new password (12+ characters).{' '}
              <span className="font-myanmar">
                ခိုင်မာသော လျှို့ဝှက်စာနံပါတ်အသစ်ရွေးပါ (၁၂ လုံးအထက်)။
              </span>
            </p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-semibold text-foreground">
                  New password{' '}
                  <span className="font-myanmar text-xs text-muted-foreground">
                    လျှို့ဝှက်စာအသစ်
                  </span>
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 min-h-[44px] text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  type="password"
                  value={passwords.password}
                  onChange={event =>
                    setPasswords(prev => ({ ...prev, password: event.target.value }))
                  }
                  required
                  minLength={12}
                  placeholder="12+ characters"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">
                  Confirm password{' '}
                  <span className="font-myanmar text-xs text-muted-foreground">အတည်ပြုပါ</span>
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 min-h-[44px] text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  type="password"
                  value={passwords.confirm}
                  onChange={event =>
                    setPasswords(prev => ({ ...prev, confirm: event.target.value }))
                  }
                  required
                  minLength={12}
                  placeholder="Repeat password"
                />
              </div>
              {authError && <p className="text-sm font-medium text-destructive">{authError}</p>}
              <Button
                type="submit"
                fullWidth
                size="lg"
                disabled={isSubmitting || isLoading || !user}
                loading={isSubmitting}
              >
                Save New Password
              </Button>
            </form>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              No recovery session?{' '}
              <Link className="font-semibold text-primary" to="/auth/forgot">
                Request a new reset email
              </Link>
              <span className="font-myanmar text-xs"> · ပြန်လည်ရယူရေးလင့်ခ် တောင်းပါ</span>
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

export default PasswordUpdatePage;
