'use client';

import React from 'react';
import { useStore } from './store';

export function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
      background: '#1A1726',
      color: 'white',
      padding: '11px 18px', borderRadius: 'var(--r-lg)',
      fontSize: 13, fontWeight: 500,
      boxShadow: '0 8px 32px rgba(20,18,38,.35)',
      zIndex: 300,
      display: 'flex', alignItems: 'center', gap: 9,
      animation: 'slideUp .18s ease',
      letterSpacing: '.1px',
      whiteSpace: 'nowrap',
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        background: 'rgba(127,119,221,.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <i className="ti ti-check" style={{ fontSize: 12, color: 'var(--purple-500)' }} />
      </div>
      {toast.msg}
    </div>
  );
}
