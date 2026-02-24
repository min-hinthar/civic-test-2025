'use client';

import HubPage from '@/pages/HubPage';

// initialTab will be forwarded to HubPage once it accepts the prop (Plan 03/04)
export default function HubPageClient({ initialTab: _initialTab }: { initialTab: string }) {
  return <HubPage />;
}
