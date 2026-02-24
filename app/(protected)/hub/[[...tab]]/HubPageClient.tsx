'use client';

import { Suspense } from 'react';
import HubPage from '@/views/HubPage';

export default function HubPageClient({ initialTab }: { initialTab: string }) {
  return (
    <Suspense>
      <HubPage initialTab={initialTab} />
    </Suspense>
  );
}
