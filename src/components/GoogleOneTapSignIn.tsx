'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Script from 'next/script';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID =
  '717300076212-40vlhmfqjgap04gsbo9hmdat188k57ve.apps.googleusercontent.com';

const GoogleOneTapSignIn = () => {
  const { user, loginWithGoogleIdToken } = useAuth();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const canPrompt = useMemo(() => scriptLoaded && !user && !dismissed, [dismissed, scriptLoaded, user]);

  const attemptPrompt = useCallback(() => {
    if (!window.google?.accounts?.id || !canPrompt) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      cancel_on_tap_outside: true,
      context: 'signin',
      ux_mode: 'popup',
      callback: async ({ credential }: { credential: string }) => {
        if (!credential) return;
        try {
          await loginWithGoogleIdToken(credential);
          toast({
            title: 'Signed in with Google',
            description: 'One Tap sign-in succeeded. Welcome back! 🎉',
          });
        } catch (error) {
          console.error('Google One Tap failed', error);
          toast({
            title: 'Google sign-in blocked',
            description: 'We could not complete Google One Tap. Please try again or use email.',
            variant: 'destructive',
          });
        }
      },
    });
    window.google.accounts.id.prompt(notification => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setDismissed(true);
      }
    });
  }, [canPrompt, loginWithGoogleIdToken]);

  useEffect(() => {
    if (!canPrompt) return;
    attemptPrompt();
  }, [attemptPrompt, canPrompt]);

  return (
    <div className="space-y-2">
      <Script src="https://accounts.google.com/gsi/client" async defer onLoad={() => setScriptLoaded(true)} />
      <button
        type="button"
        onClick={attemptPrompt}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card/70 px-4 py-3 font-semibold shadow-sm transition hover:border-primary/60 hover:text-primary"
      >
        <span>Continue with Google</span>
      </button>
      <p className="text-xs text-muted-foreground">
        Google One Tap keeps your session secure with Supabase—no passwords to type.
      </p>
    </div>
  );
};

export default GoogleOneTapSignIn;
