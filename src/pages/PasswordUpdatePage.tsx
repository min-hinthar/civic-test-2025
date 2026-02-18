'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useToast } from '@/components/BilingualToast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/animations/StaggeredList';

const PasswordUpdatePage = () => {
  const { user, isLoading, updatePassword, authError } = useAuth();
  const { showSuccess, showWarning, showError } = useToast();
  const { showBurmese } = useLanguage();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({ password: '', confirm: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) return;
    const timer = setTimeout(() => {
      showError({
        en: 'Open from the secure email link to update your password',
        my: 'လျှို့ဝှက်စာ ပြောင်းရန် အီးမေးလ်ထဲက လင့်ခ်ကိုဖွင့်ပါ',
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [showError, user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (passwords.password !== passwords.confirm) {
      showWarning({
        en: 'Passwords must match — please confirm the same password',
        my: 'လျှို့ဝှက်စာ နှစ်ခု တူညီရပါမယ်',
      });
      return;
    }
    if (passwords.password.length < 12) {
      showWarning({
        en: 'Password too short — use at least 12 characters',
        my: 'လျှို့ဝှက်စာ တိုလွန်းပါတယ် — အနည်းဆုံး ၁၂ လုံး ထည့်ပါ',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await updatePassword(passwords.password);
      showSuccess({
        en: 'Password updated! Your new password is active.',
        my: 'လျှို့ဝှက်စာအသစ် သုံးလို့ရပါပြီ!',
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
            {showBurmese && (
              <p className="mt-1 font-myanmar text-sm text-muted-foreground">
                သင့်လျှို့ဝှက်စာကို အသစ်ပြောင်းပါ
              </p>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="mt-6 rounded-2xl border border-border/60 bg-card p-6 shadow-lg">
            <p className="mb-4 text-sm text-muted-foreground">
              Choose a strong new password (12+ characters).{' '}
              {showBurmese && (
                <span className="font-myanmar">
                  ခိုင်မာတဲ့ လျှို့ဝှက်စာအသစ် ရွေးပါ (၁၂ လုံးအထက်)။
                </span>
              )}
            </p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-semibold text-foreground">
                  New password{' '}
                  {showBurmese && (
                    <span className="font-myanmar text-xs text-muted-foreground">
                      လျှို့ဝှက်စာအသစ်
                    </span>
                  )}
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
                  {showBurmese && (
                    <span className="font-myanmar text-xs text-muted-foreground">အတည်ပြုပါ</span>
                  )}
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
              {showBurmese && <span className="font-myanmar text-xs"> · လင့်ခ်အသစ် တောင်းပါ</span>}
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

export default PasswordUpdatePage;
