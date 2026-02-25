'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Script from 'next/script';
import { useToast } from '@/components/BilingualToast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabaseClient';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

interface GoogleOneTapSignInProps {
  nonce?: string;
}

const GoogleOneTapSignIn = ({ nonce }: GoogleOneTapSignInProps) => {
  const { user, loginWithGoogleIdToken } = useAuth();
  const { showError } = useToast();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [gsiReady, setGsiReady] = useState(false);
  const [buttonRendered, setButtonRendered] = useState(false);
  const buttonRef = useRef<HTMLDivElement | null>(null);

  const handleCredential = useCallback(
    async ({ credential }: google.accounts.id.CredentialResponse) => {
      if (!credential) return;
      try {
        await loginWithGoogleIdToken(credential);
      } catch (error) {
        console.error('Google One Tap failed', error);
        showError({
          en: 'Google sign-in blocked — please try again or use email',
          my: 'Google ဝင်ရောက်မှု ပိတ်ဆို့ခံရပါသည်',
        });
      }
    },
    [loginWithGoogleIdToken, showError]
  );

  const shouldAutoPrompt = useMemo(
    () => gsiReady && scriptLoaded && !user && !dismissed,
    [dismissed, gsiReady, scriptLoaded, user]
  );

  const ensureGoogleInitialized = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || !window.google?.accounts?.id || user) return false;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      cancel_on_tap_outside: true,
      context: 'signin',
      ux_mode: 'popup',
      callback: handleCredential,
    });
    setGsiReady(true);

    if (buttonRef.current && buttonRef.current.childElementCount === 0) {
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        shape: 'pill',
        text: 'continue_with',
        theme: 'outline',
        size: 'large',
        logo_alignment: 'left',
        width: 360,
      });
      setButtonRendered(true);
    }
    return true;
  }, [handleCredential, user]);

  const fallbackOAuthRedirect = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/home`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Supabase Google OAuth fallback failed', error);
      showError({
        en: 'Google sign-in unavailable — please try email login instead',
        my: 'Google ဝင်ရောက်မှု မရရှိနိုင်ပါ',
      });
    }
  }, [showError]);

  const attemptPrompt = useCallback(
    (forceManual = false) => {
      const initialized = ensureGoogleInitialized();
      if (!initialized) {
        if (forceManual) {
          void fallbackOAuthRedirect();
        }
        return;
      }
      if (!forceManual && !shouldAutoPrompt) return;
      if (user) return;
      window.google.accounts.id.prompt(
        (notification: google.accounts.id.PromptMomentNotification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setDismissed(true);
          }
        }
      );
    },
    [ensureGoogleInitialized, fallbackOAuthRedirect, shouldAutoPrompt, user]
  );

  useEffect(() => {
    if (!scriptLoaded || user) return;
    ensureGoogleInitialized();
  }, [ensureGoogleInitialized, scriptLoaded, user]);

  useEffect(() => {
    if (!shouldAutoPrompt) return;
    attemptPrompt();
  }, [attemptPrompt, shouldAutoPrompt]);

  return (
    <div className="space-y-2">
      <Script
        src="https://accounts.google.com/gsi/client"
        async
        defer
        nonce={nonce}
        onLoad={() => setScriptLoaded(true)}
      />
      <div className="relative isolate">
        <div
          ref={buttonRef}
          className={`flex w-full justify-center ${
            buttonRendered ? 'relative z-10' : 'pointer-events-none absolute inset-0 opacity-0'
          }`}
        />
        {!buttonRendered && (
          <button
            type="button"
            onClick={() => attemptPrompt(true)}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card/80 px-4 py-3 font-semibold text-foreground shadow-sm transition hover:border-primary/60 hover:text-primary"
          >
            <svg aria-hidden viewBox="0 0 18 18" className="h-5 w-5">
              <path
                fill="#EA4335"
                d="M17.64 9.2045c0-.6395-.0573-1.2527-.1636-1.8409H9v3.4818h4.8445c-.2087 1.125-.8427 2.0795-1.7973 2.7173v2.2582h2.9082C16.7273 14.4205 17.64 11.9959 17.64 9.2045Z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.4673-.8064 5.9564-2.1782l-2.9082-2.2582c-.8063.54-1.8373.8573-3.0482.8573-2.3441 0-4.3296-1.5832-5.0368-3.7105H.9573v2.3313C2.4382 15.9837 5.4818 18 9 18Z"
              />
              <path
                fill="#4A90E2"
                d="M3.9632 10.7104C3.7814 10.1704 3.6818 9.5932 3.6818 9c0-.5932.0996-1.1704.2814-1.7104V4.9587H.9573C.3477 6.1737 0 7.5437 0 9c0 1.4563.3477 2.8263.9573 4.0413l3.0059-2.3309Z"
              />
              <path
                fill="#FBBC05"
                d="M9 3.5795c1.3214 0 2.5063.4545 3.4391 1.3455l2.5795-2.5795C13.4645.8918 11.4273 0 9 0 5.4818 0 2.4382 2.0163.9573 4.9586l3.0059 2.3309C4.6704 5.1627 6.6559 3.5795 9 3.5795Z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Google One Tap keeps your session secure with Supabase—no passwords to type.
      </p>
    </div>
  );
};

export default GoogleOneTapSignIn;
