'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/components/store';

export default function Home() {
  const router = useRouter();
  const { session, hydrated } = useStore();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(session ? '/events' : '/signin');
  }, [hydrated, session, router]);

  return null;
}
