'use client';

import { Suspense } from 'react';
import PracticePage from '@/views/PracticePage';

export default function Practice() {
  return (
    <Suspense>
      <PracticePage />
    </Suspense>
  );
}
