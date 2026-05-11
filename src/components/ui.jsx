'use client';

import React from 'react';

export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

export function inputStyle({ padded } = {}) {
  return {
    width: '100%',
    padding: padded ? '10px 12px 10px 36px' : '10px 12px',
    fontSize: 13.5,
    border: '0.5px solid var(--border-2)',
    borderRadius: 'var(--r-md)',
    background: 'var(--surface)',
    outline: 'none',
  };
}

export function btnPrimary({ block, mt, disabled } = {}) {
  return {
    background: disabled ? 'var(--border-2)' : 'var(--purple-600)',
    color: 'white',
    fontWeight: 500,
    fontSize: 13,
    padding: '9px 16px',
    borderRadius: 'var(--r-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    width: block ? '100%' : 'auto',
    marginTop: mt || 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}

export function btnGhost({ block } = {}) {
  return {
    background: 'var(--surface)',
    color: 'var(--text-2)',
    fontWeight: 500,
    fontSize: 13,
    padding: '9px 16px',
    border: '0.5px solid var(--border-1)',
    borderRadius: 'var(--r-md)',
    cursor: 'pointer',
    width: block ? '100%' : 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}

export function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 11, color: 'var(--text-3)',
        letterSpacing: '.4px', textTransform: 'uppercase',
        fontWeight: 500, marginBottom: 9,
      }}>{title}</div>
      {children}
    </div>
  );
}

export function MetaRow({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, color: 'var(--text-2)', marginBottom: 7 }}>
      <i className={`ti ${icon}`} style={{ fontSize: 15, color: 'var(--purple-500)' }} />
      <span>{text}</span>
    </div>
  );
}

export function Pill({ kind, children }) {
  const map = {
    open:    { bg: 'var(--green-100)',  fg: 'var(--green-700)' },
    full:    { bg: 'var(--red-100)',    fg: 'var(--red-700)' },
    amber:   { bg: 'var(--amber-100)',  fg: 'var(--amber-700)' },
    purple:  { bg: 'var(--purple-100)', fg: 'var(--purple-700)' },
    neutral: { bg: 'var(--surface-2)',  fg: 'var(--text-2)' },
  };
  const s = map[kind] || map.neutral;
  return (
    <span style={{
      background: s.bg, color: s.fg,
      fontSize: 10, fontWeight: 600,
      padding: '2px 8px', borderRadius: 20, letterSpacing: '.2px',
    }}>{children}</span>
  );
}

export function Divider({ label }) {
  if (!label) return <div style={{ height: '0.5px', background: 'var(--border-1)', margin: '14px 0' }} />;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 14px' }}>
      <div style={{ flex: 1, height: '0.5px', background: 'var(--border-1)' }} />
      <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</div>
      <div style={{ flex: 1, height: '0.5px', background: 'var(--border-1)' }} />
    </div>
  );
}

export function Bullet({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 24, height: 24, borderRadius: 6,
        background: 'rgba(255,255,255,.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '0.5px solid rgba(255,255,255,.15)',
        flexShrink: 0,
      }}>
        <i className={`ti ${icon}`} style={{ fontSize: 13 }} />
      </div>
      {text}
    </div>
  );
}

export function LookupHint({ kind, text }) {
  const map = {
    admin:  { bg: 'var(--purple-100)', fg: 'var(--purple-700)', icon: 'ti-crown' },
    driver: { bg: 'var(--purple-100)', fg: 'var(--purple-700)', icon: 'ti-steering-wheel' },
    member: { bg: 'var(--green-100)',  fg: 'var(--green-700)',  icon: 'ti-user-check' },
    new:    { bg: 'var(--surface-2)',  fg: 'var(--text-2)',     icon: 'ti-user-plus' },
  };
  const s = map[kind] || map.new;
  return (
    <div style={{
      background: s.bg, color: s.fg,
      padding: '8px 12px', borderRadius: 'var(--r-md)',
      fontSize: 12, fontWeight: 500,
      display: 'flex', alignItems: 'center', gap: 8,
      marginTop: -6, marginBottom: 4,
    }}>
      <i className={`ti ${s.icon}`} style={{ fontSize: 15 }} />
      {text}
    </div>
  );
}

export function Stat({ label, value, icon }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '0.5px solid var(--border-1)',
      borderRadius: 'var(--r-lg)', padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'var(--purple-100)', color: 'var(--purple-700)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <i className={`ti ${icon}`} style={{ fontSize: 18 }} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-.4px', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3, letterSpacing: '.3px', textTransform: 'uppercase' }}>{label}</div>
      </div>
    </div>
  );
}

export function RoleCard({ active, onClick, icon, title, body }) {
  return (
    <button onClick={onClick} style={{
      textAlign: 'left', padding: '11px 13px', borderRadius: 'var(--r-md)',
      border: active ? '1.5px solid var(--purple-600)' : '0.5px solid var(--border-1)',
      background: active ? 'var(--purple-100)' : 'var(--surface)',
      cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <i className={`ti ${icon}`} style={{ fontSize: 15, color: active ? 'var(--purple-700)' : 'var(--text-2)' }} />
        <div style={{ fontSize: 13, fontWeight: 600, color: active ? 'var(--purple-700)' : 'var(--text-1)' }}>{title}</div>
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.45 }}>{body}</div>
    </button>
  );
}

export function IconBtn({ icon, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 32, height: 32, borderRadius: 'var(--r-md)',
      border: '0.5px solid var(--border-1)',
      background: 'var(--surface)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <i className={`ti ${icon}`} style={{ fontSize: 14, color: 'var(--text-2)' }} />
    </button>
  );
}

export function Topbar({ crumbs, right }) {
  return (
    <div style={{
      height: 54, padding: '0 24px',
      borderBottom: '0.5px solid var(--border-1)',
      background: 'var(--surface)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <div style={{ fontSize: 13, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <i className="ti ti-chevron-right" style={{ fontSize: 11, color: 'var(--text-3)' }} />}
            <span style={{ color: i === crumbs.length - 1 ? 'var(--text-1)' : 'var(--text-2)', fontWeight: i === crumbs.length - 1 ? 500 : 400 }}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconBtn icon="ti-search" />
        {right}
      </div>
    </div>
  );
}
