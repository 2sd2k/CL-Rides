'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/components/store';
import { AdminScreen } from '@/components/screens/AdminScreen';

export default function AdminPage() {
  const router = useRouter();
  const { session, hydrated } = useStore();

  useEffect(() => {
    if (hydrated && session && session.role !== 'admin') router.replace('/events');
  }, [hydrated, session, router]);

  if (!hydrated || !session || session.role !== 'admin') return null;
  return <AdminScreen />;
}
