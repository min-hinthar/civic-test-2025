'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NotFound() {
  const { showBurmese } = useLanguage();

  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <p className="text-display font-semibold text-primary mb-4">404</p>
        <h1 className="mb-2 text-xl font-semibold text-foreground">Page Not Found</h1>
        {showBurmese && (
          <p className="mb-4 text-lg text-foreground font-myanmar">
            {
              '\u1005\u102C\u1019\u103B\u1000\u103A\u1014\u103E\u102C \u101B\u103E\u102C\u1019\u1010\u103D\u1031\u1037\u1015\u102B'
            }
          </p>
        )}
        <p className="mb-2 text-base text-secondary">
          The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back on track.
        </p>
        {showBurmese && (
          <p className="mb-8 text-base text-secondary font-myanmar">
            {
              '\u101B\u103E\u102C\u1014\u1031\u101E\u1031\u102C \u1005\u102C\u1019\u103B\u1000\u103A\u1014\u103E\u102C \u1019\u101B\u103E\u102D\u1015\u102B\u104B \u1015\u1004\u103A\u1019\u1005\u102C\u1019\u103B\u1000\u103A\u1014\u103E\u102C\u101E\u102D\u102F\u1037 \u1015\u103C\u1014\u103A\u101E\u103D\u102C\u1038\u1000\u103C\u1015\u102B\u1005\u102D\u102F\u1037\u104B'
            }
          </p>
        )}
        <Link
          href="/"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <Home className="h-5 w-5" />
          <span>Go home</span>
        </Link>
      </div>
    </div>
  );
}
