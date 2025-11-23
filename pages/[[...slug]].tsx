"use client";

import dynamic from 'next/dynamic';

const AppShell = dynamic(() => import('../src/AppShell'), { ssr: false, loading: () => null });
export default function AppPage() {
  return <AppShell />;
}
