'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/components/store';
import { EmptyScreen } from '@/components/screens/EmptyScreen';

export default function MyRidesPage() {
  const router = useRouter();
  const { session, hydrated } = useStore();

  useEffect(() => {
    if (hydrated && session?.isGuest) router.replace('/events');
  }, [hydrated, session, router]);

  if (!hydrated || !session || session.isGuest) return null;
  return (
    <EmptyScreen
      icon="ti-car"
      title="My rides"
      body="Rides you've signed up for or offered will appear here."
    />
  );
}
