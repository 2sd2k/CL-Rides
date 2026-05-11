'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from './store';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { session, signOut } = useStore();

  if (!session) return null;

  const canDrive = session.role === 'driver' || session.role === 'admin';
  const isAdmin  = session.role === 'admin';
  const initials = (session.name || 'G').split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase();
  const roleLabel = session.isGuest
    ? 'Guest'
    : session.role === 'admin'  ? 'Admin'
    : session.role === 'driver' ? 'Approved driver'
    : 'Member';

  return (
    <div style={{
      width: 240, flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      borderRight: '0.5px solid var(--border-1)',
      background: 'var(--surface)',
    }}>
      <div style={{ background: '#26215C', padding: '22px 18px 18px', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 6 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'rgba(255,255,255,.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '0.5px solid rgba(255,255,255,.18)',
          }}>
            <i className="ti ti-steering-wheel" style={{ fontSize: 16 }} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-.2px' }}>CL Rides</div>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)' }}>Grace Community Church</div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 9,
          marginTop: 16, paddingTop: 14,
          borderTop: '0.5px solid rgba(255,255,255,.12)',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: session.isGuest ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.16)',
            color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 600,
            border: session.isGuest ? '0.5px dashed rgba(255,255,255,.3)' : 'none',
          }}>
            {session.isGuest ? <i className="ti ti-user" style={{ fontSize: 14 }} /> : initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.9)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {session.name}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', display: 'flex', alignItems: 'center', gap: 4 }}>
              {session.role === 'admin'  && <i className="ti ti-crown" style={{ fontSize: 11 }} />}
              {session.role === 'driver' && <i className="ti ti-steering-wheel" style={{ fontSize: 11 }} />}
              {roleLabel}
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column' }}>
        <NavSection label="Main" />
        <NavItem icon="ti-calendar-event" label="Events"    badge="3" active={pathname === '/events'}  onClick={() => router.push('/events')} />
        <NavItem icon="ti-car"            label="My rides"             active={pathname === '/myrides'} onClick={() => router.push('/myrides')} disabled={session.isGuest} />
        {canDrive && (
          <NavItem icon="ti-steering-wheel" label="Driving" active={pathname === '/driving'} onClick={() => router.push('/driving')} />
        )}

        {isAdmin && (
          <>
            <NavSection label="Admin" />
            <NavItem icon="ti-user-shield" label="Driver access" active={pathname === '/admin'} onClick={() => router.push('/admin')} accent />
          </>
        )}

        <NavSection label="Community" />
        <NavItem icon="ti-users" label="Members" disabled={session.isGuest} />
        <NavItem icon="ti-bell"  label="Notifications" badge="2" badgeColor="var(--red-500)" disabled={session.isGuest} />
      </div>

      <div style={{ padding: '10px', borderTop: '0.5px solid var(--border-1)' }}>
        {session.isGuest && (
          <div style={{
            padding: '10px 11px',
            background: 'var(--purple-100)',
            borderRadius: 'var(--r-md)',
            marginBottom: 8,
            fontSize: 11, color: 'var(--purple-700)', lineHeight: 1.45,
          }}>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>You&apos;re browsing as guest</div>
            Sign in with email to save your profile and history.
          </div>
        )}
        <NavItem icon="ti-settings" label="Settings" />
        <NavItem icon="ti-logout" label={session.isGuest ? 'Exit guest mode' : 'Sign out'} onClick={signOut} />
      </div>
    </div>
  );
}

function NavSection({ label }) {
  return (
    <div style={{
      fontSize: 10, color: 'var(--text-3)',
      padding: '12px 10px 5px',
      letterSpacing: '.8px',
      textTransform: 'uppercase',
      fontWeight: 500,
    }}>{label}</div>
  );
}

function NavItem({ icon, label, badge, badgeColor, active, accent, disabled, onClick }) {
  const base = {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 11px', borderRadius: 'var(--r-md)',
    fontSize: 13, color: 'var(--text-2)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    marginBottom: 1, width: '100%', textAlign: 'left',
    opacity: disabled ? .45 : 1,
  };
  const activeStyle = active ? {
    background: 'var(--purple-100)', color: 'var(--purple-700)', fontWeight: 500,
  } : {};
  return (
    <button style={{ ...base, ...activeStyle }} onClick={disabled ? undefined : onClick}>
      <i className={`ti ${icon}`} style={{ fontSize: 16 }} />
      <span>{label}</span>
      {accent && !active && <span style={{
        marginLeft: 'auto', fontSize: 9, fontWeight: 600,
        background: 'var(--purple-100)', color: 'var(--purple-700)',
        padding: '2px 7px', borderRadius: 20, letterSpacing: '.4px',
      }}>ADMIN</span>}
      {badge && (
        <span style={{
          marginLeft: 'auto',
          background: badgeColor || 'var(--purple-600)',
          color: 'white', fontSize: 9, fontWeight: 600,
          padding: '2px 7px', borderRadius: 20,
        }}>{badge}</span>
      )}
    </button>
  );
}
