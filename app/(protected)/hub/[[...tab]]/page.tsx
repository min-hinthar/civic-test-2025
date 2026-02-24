import { redirect } from 'next/navigation';
import HubPageClient from './HubPageClient';

export default async function HubPage({ params }: { params: Promise<{ tab?: string[] }> }) {
  const { tab } = await params;

  if (!tab || tab.length === 0) {
    redirect('/hub/overview');
  }

  return <HubPageClient initialTab={tab[0]} />;
}
