'use client';

import React from 'react';
import { Topbar } from '../ui';

export function EmptyScreen({ icon, title, body }) {
  return (
    <>
      <Topbar crumbs={[title]} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'var(--purple-100)', color: 'var(--purple-700)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14,
          }}>
            <i className={`ti ${icon}`} style={{ fontSize: 24 }} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{title}</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{body}</div>
        </div>
      </div>
    </>
  );
}
