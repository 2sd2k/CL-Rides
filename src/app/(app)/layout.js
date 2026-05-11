'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/components/store';
import { Sidebar } from '@/components/Sidebar';

export default function AppLayout({ children }) {
  const router = useRouter();
  const { session, hydrated } = useStore();

  useEffect(() => {
    if (hydrated && !session) router.replace('/signin');
  }, [hydrated, session, router]);

  if (!hydrated || !session) return null;

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}
