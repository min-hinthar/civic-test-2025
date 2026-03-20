'use client';

import { useEffect } from 'react';
import { sanitizeError } from '@/lib/errorSanitizer';
import { captureError } from '@/lib/sentry';
import { SharedErrorFallback } from '@/components/ui/SharedErrorFallback';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Language from context (error.tsx IS inside provider tree per layout.tsx).
  // useLanguage() called unconditionally (Rules of Hooks). Try-catch handles
  // runtime failures if provider crashed before this renders.
  let showBurmese = true;
  try {
    const lang = useLanguage();
    showBurmese = lang.showBurmese;
  } catch {
    // Provider unavailable -- fall back to localStorage
    try {
      showBurmese = localStorage.getItem('civic-test-language-mode') !== 'english-only';
    } catch {
      // localStorage blocked (private browsing) -- default true
    }
  }

  useEffect(() => {
    captureError(error, { source: 'error.tsx', digest: error.digest });
  }, [error]);

  const message = sanitizeError(error);

  return (
    <SharedErrorFallback
      message={message}
      showBurmese={showBurmese}
      onRetry={reset}
      onGoHome={() => {
        window.location.href = '/';
      }}
    />
  );
}
