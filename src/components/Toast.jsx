'use client';

import React from 'react';
import { useStore } from './store';

export function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--text-1)', color: 'white',
      padding: '10px 16px', borderRadius: 'var(--r-md)',
      fontSize: 13, fontWeight: 500,
      boxShadow: 'var(--shadow-lg)',
      zIndex: 300,
      display: 'flex', alignItems: 'center', gap: 8,
      animation: 'slideUp .2s ease',
    }}>
      <i className="ti ti-check" style={{ fontSize: 15, color: 'var(--purple-500)' }} />
      {toast.msg}
    </div>
  );
}
