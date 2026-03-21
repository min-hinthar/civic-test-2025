'use client';

import { useEffect } from 'react';
import { sanitizeError } from '@/lib/errorSanitizer';
import { captureError } from '@/lib/sentry';
import { SharedErrorFallback } from '@/components/ui/SharedErrorFallback';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  let showBurmese = true;
  try {
    const lang = useLanguage();
    showBurmese = lang.showBurmese;
  } catch {
    try {
      showBurmese = localStorage.getItem('civic-test-language-mode') !== 'english-only';
    } catch {
      // localStorage blocked (private browsing) -- default true
    }
  }

  useEffect(() => {
    captureError(error, { source: '(public)/error.tsx', digest: error.digest });
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
