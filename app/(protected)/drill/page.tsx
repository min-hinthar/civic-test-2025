'use client';

import { Suspense } from 'react';
import DrillPage from '@/views/DrillPage';

export default function Drill() {
  return (
    <Suspense>
      <DrillPage />
    </Suspense>
  );
}
