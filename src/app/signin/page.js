'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/components/store';
import { SignInScreen } from '@/components/screens/SignInScreen';

export default function SignInPage() {
  const router = useRouter();
  const { session, hydrated } = useStore();

  useEffect(() => {
    if (hydrated && session) router.replace('/events');
  }, [hydrated, session, router]);

  return <SignInScreen />;
}
