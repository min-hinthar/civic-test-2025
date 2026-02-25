import { Suspense } from 'react';
import { headers } from 'next/headers';
import AuthPage from '@/views/AuthPage';

export default async function Auth() {
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <Suspense>
      <AuthPage nonce={nonce} />
    </Suspense>
  );
}
