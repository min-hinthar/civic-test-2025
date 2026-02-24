'use client';

import { Suspense } from 'react';
import AuthPage from '@/views/AuthPage';

export default function Auth() {
  return (
    <Suspense>
      <AuthPage />
    </Suspense>
  );
}
