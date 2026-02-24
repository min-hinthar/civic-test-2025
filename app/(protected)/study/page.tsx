'use client';

import { Suspense } from 'react';
import StudyGuidePage from '@/views/StudyGuidePage';

export default function Study() {
  return (
    <Suspense>
      <StudyGuidePage />
    </Suspense>
  );
}
