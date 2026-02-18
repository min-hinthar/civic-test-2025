'use client';

import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';

import { useToast } from '@/components/BilingualToast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { FadeIn } from '@/components/animations/StaggeredList';

const PasswordResetPage = () => {
  const { sendPasswordReset, authError } = useAuth();
  const { showSuccess } = useToast();
  const { showBurmese } = useLanguage();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await sendPasswordReset(email, `${window.location.origin}/auth/update-password`);
      showSuccess({
        en: 'Reset email sent — check your inbox for the recovery link',
        my: 'လျှို့ဝှက်စာ ပြန်သတ်မှတ်ရန် လင့်ခ်ကို အီးမေးလ်မှာ စစ်ပါ',
      });
      setEmail('');
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
              <span>🔑</span>
              <span>🗽</span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">Forgot Password</h1>
            {showBurmese && (
              <p className="mt-1 font-myanmar text-2xl text-muted-foreground">
                လျှို့ဝှက်စာ မေ့နေပါသလား?
              </p>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="mt-6 rounded-2xl border border-border/60 bg-card p-6 shadow-lg">
            <p className="mb-4 text-sm text-muted-foreground">
              We will email you a recovery link that redirects back to this app.{' '}
              {showBurmese && (
                <span className="font-myanmar">
                  ပြန်လည်ရယူရန် လင့်ခ်ကို အီးမေးလ်နဲ့ ပို့ပေးပါမယ်။
                </span>
              )}
            </p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-semibold text-foreground">
                  Email{' '}
                  {showBurmese && (
                    <span className="font-myanmar text-sm text-muted-foreground">အီးမေးလ်</span>
                  )}
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 min-h-[44px] text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>
              {authError && <p className="text-sm font-medium text-destructive">{authError}</p>}
              <Button
                type="submit"
                fullWidth
                size="lg"
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                Send Recovery Email
              </Button>
            </form>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link className="font-semibold text-primary" to="/auth">
                Sign in
              </Link>
              {showBurmese && (
                <span className="font-myanmar text-sm"> · လျှို့ဝှက်စာ မှတ်မိပါသလား?</span>
              )}
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
};

export default PasswordResetPage;
