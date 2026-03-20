'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          margin: 0,
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: 'hsl(210, 60%, 99%)',
          color: 'hsl(222, 47%, 12%)',
        }}
      >
        <div style={{ maxWidth: '28rem', margin: '0 auto', marginTop: '20vh' }}>
          <div
            style={{
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              backgroundColor: 'hsl(39, 96%, 89%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '1.5rem',
            }}
          >
            &#x26A0;
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: '1.125rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            {
              '\u1010\u1005\u103A\u1001\u102F\u1001\u102F \u1019\u103E\u102C\u1038\u101A\u103D\u1004\u103A\u1038\u101E\u103D\u102C\u1038\u101E\u100A\u103A'
            }
          </p>
          <p
            style={{
              fontSize: '1rem',
              color: 'hsl(215, 18%, 35%)',
              marginBottom: '2rem',
            }}
          >
            Please try again. Your progress has been saved.
          </p>
          <p
            style={{
              fontSize: '1rem',
              lineHeight: 1.6,
              color: 'hsl(215, 18%, 35%)',
              marginBottom: '2rem',
            }}
          >
            {
              '\u1011\u1015\u103A\u1005\u1019\u103A\u1038\u1000\u103C\u102D\u102F\u1038\u1005\u102C\u1038\u1015\u102B\u104B \u101E\u1004\u103A\u1037\u1010\u102D\u102F\u1038\u1010\u1000\u103A\u1019\u103E\u102F\u1000\u102D\u102F \u101E\u102D\u1019\u103A\u1038\u1006\u100A\u103A\u1038\u1011\u102C\u1038\u1015\u102B\u101E\u100A\u103A\u104B'
            }
          </p>
          <button
            onClick={reset}
            type="button"
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: 'hsl(217, 91%, 60%)',
              color: 'white',
              minHeight: '44px',
              minWidth: '44px',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
