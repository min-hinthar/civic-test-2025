'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppNavigation from '@/components/AppNavigation';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

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
        description: 'To update your password we need the recovery session from Supabase.',
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
        description: 'Please confirm the same 12+ character password.',
        variant: 'destructive',
      });
      return;
    }
    if (passwords.password.length < 12) {
      toast({
        title: 'Password too short',
        description: 'Use at least 12 characters for a strong password.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await updatePassword(passwords.password);
      toast({ title: 'Password updated', description: 'Your session stays active with the new password.' });
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
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-12">
        <div className="rounded-3xl border border-border/60 bg-card/80 p-8 shadow-xl shadow-primary/10 backdrop-blur">
          <h1 className="text-2xl font-semibold text-foreground">Update your password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We use your Supabase recovery session to update credentials without exposing them to third-parties.
          </p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium text-muted-foreground">New password (12+ characters)</label>
              <input
                className="mt-1 w-full rounded-2xl border border-border bg-card/70 px-4 py-3"
                type="password"
                value={passwords.password}
                onChange={event => setPasswords(prev => ({ ...prev, password: event.target.value }))}
                required
                minLength={12}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Confirm new password</label>
              <input
                className="mt-1 w-full rounded-2xl border border-border bg-card/70 px-4 py-3"
                type="password"
                value={passwords.confirm}
                onChange={event => setPasswords(prev => ({ ...prev, confirm: event.target.value }))}
                required
                minLength={12}
              />
            </div>
            {authError && <p className="text-sm text-red-600">{authError}</p>}
            <button
              type="submit"
              disabled={isSubmitting || isLoading || !user}
              className="w-full rounded-2xl bg-gradient-to-r from-primary to-rose-500 px-4 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Save new password
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            No recovery session?{' '}
            <Link className="font-semibold text-primary" to="/auth/forgot">
              Request a fresh reset email
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordUpdatePage;
