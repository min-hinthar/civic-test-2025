'use client';

import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import AppNavigation from '@/components/AppNavigation';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const PasswordResetPage = () => {
  const { sendPasswordReset, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await sendPasswordReset(email, `${window.location.origin}/auth/update-password`);
      toast({
        title: 'Secure reset email sent',
        description: 'Open the link on this device to safely update your password.',
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
      <AppNavigation translucent />
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-12">
        <div className="rounded-3xl border border-border/60 bg-card/80 p-8 shadow-xl shadow-primary/10 backdrop-blur">
          <h1 className="text-2xl font-semibold text-foreground">Forgot password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We will email you a Supabase recovery link that redirects back to this app. Only use
            links you requested to avoid phishing.
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <input
                className="mt-1 w-full rounded-2xl border border-border bg-card/70 px-4 py-3"
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                required
              />
            </div>
            {authError && <p className="text-sm text-destructive">{authError}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-gradient-to-r from-primary to-rose-500 px-4 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Send recovery email
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remembered your password?{' '}
            <Link className="font-semibold text-primary" to="/auth">
              Go back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;
