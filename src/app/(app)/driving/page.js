'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/components/store';
import { EmptyScreen } from '@/components/screens/EmptyScreen';

export default function DrivingPage() {
  const router = useRouter();
  const { session, hydrated } = useStore();
  const canDrive = session?.role === 'driver' || session?.role === 'admin';

  useEffect(() => {
    if (hydrated && session && !canDrive) router.replace('/events');
  }, [hydrated, session, canDrive, router]);

  if (!hydrated || !session || !canDrive) return null;
  return (
    <EmptyScreen
      icon="ti-steering-wheel"
      title="Driving"
      body="Trips you've offered to drive. Manage seats and riders."
    />
  );
}
