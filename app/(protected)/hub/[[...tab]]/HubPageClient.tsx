'use client';

import HubPage from '@/pages/HubPage';

export default function HubPageClient({ initialTab }: { initialTab: string }) {
  return <HubPage initialTab={initialTab} />;
}
