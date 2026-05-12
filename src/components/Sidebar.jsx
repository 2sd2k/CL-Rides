'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from './store';

export function Sidebar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { session, signOut, rides, notifications, getSessionRideKey } = useStore();

  if (!session) return null;

  const canDrive  = session.role === 'driver' || session.role === 'admin';
  const isAdmin   = session.role === 'admin';
  const initials  = (session.name || 'G').split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase();
  const roleLabel = session.isGuest ? 'Guest'
    : session.role === 'admin'  ? 'Admin'
    : session.role === 'driver' ? 'Approved driver'
    : 'Member';
  const ownerKey = getSessionRideKey();
  const signedEventIds = new Set(rides.filter((ride) => ride.ownerKey === ownerKey).map((ride) => ride.eventId));
  const unreadNotificationCount = notifications.filter((notification) => (
    (notification.scope === 'all' || signedEventIds.has(notification.eventId)) &&
    !notification.readBy?.includes(ownerKey)
  )).length;

  return (
    <div style={{
      width: 244, flexShrink: 0,
      display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, #1F1A63 0%, #17104B 100%)',
    }}>

      {/* Brand + user */}
      <div style={{ padding: '26px 18px 22px', borderBottom: '0.5px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '0.5px solid rgba(255,255,255,.16)',
            flexShrink: 0,
          }}>
            <i className="ti ti-steering-wheel" style={{ fontSize: 18, color: 'white' }} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-.3px', color: 'white' }}>CL Rides</div>
        </div>
        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.58)', marginLeft: 44, marginBottom: 24, letterSpacing: '-.1px' }}>
          Lighthouse Bible Church
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'rgba(255,255,255,.08)', borderRadius: 13, border: '0.5px solid rgba(255,255,255,.1)' }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: session.isGuest ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.18)',
            color: 'white', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 800,
            border: session.isGuest ? '0.5px dashed rgba(255,255,255,.22)' : '0.5px solid rgba(255,255,255,.14)',
          }}>
            {session.isGuest ? <i className="ti ti-user" style={{ fontSize: 13 }} /> : initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13.25, color: 'rgba(255,255,255,.95)', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-.2px' }}>
              {session.name}
            </div>
            <div style={{ fontSize: 11.25, color: 'rgba(255,255,255,.68)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              {session.role === 'admin'  && <i className="ti ti-crown" style={{ fontSize: 9.5 }} />}
              {session.role === 'driver' && <i className="ti ti-steering-wheel" style={{ fontSize: 9.5 }} />}
              {roleLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <NavSection label="Main" />
        <NavItem icon="ti-calendar-event" label="Events"    badge="3" active={pathname === '/events'}  onClick={() => router.push('/events')} />
        <NavItem icon="ti-car"            label="My rides"            active={pathname === '/myrides'} onClick={() => router.push('/myrides')} />
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
        {!session.isGuest && (
          <NavItem icon="ti-users" label="Members" active={pathname === '/members'} onClick={() => router.push('/members')} />
        )}
        <NavItem
          icon="ti-bell"
          label="Notifications"
          badge={unreadNotificationCount ? String(unreadNotificationCount) : undefined}
          badgeColor="rgba(216,90,48,.85)"
          active={pathname === '/notifications'}
          onClick={() => router.push('/notifications')}
        />
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 16px 22px', borderTop: '0.5px solid rgba(255,255,255,.1)' }}>
        {session.isGuest && (
          <div style={{
            padding: '10px 11px', marginBottom: 6,
            background: 'rgba(255,255,255,.06)',
            borderRadius: 10, border: '0.5px solid rgba(255,255,255,.09)',
            fontSize: 11, color: 'rgba(255,255,255,.5)', lineHeight: 1.5,
          }}>
            <div style={{ fontWeight: 600, marginBottom: 2, color: 'rgba(255,255,255,.8)' }}>Browsing as guest</div>
            Sign in to save your profile and ride history.
          </div>
        )}
        <NavItem icon="ti-settings" label="Settings" />
        <NavItem icon="ti-logout"   label={session.isGuest ? 'Exit guest mode' : 'Sign out'} onClick={signOut} />
      </div>
    </div>
  );
}

function NavSection({ label }) {
  return (
    <div style={{
      fontSize: 10.75, color: 'rgba(255,255,255,.55)',
      padding: '22px 10px 9px',
      letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700,
    }}>{label}</div>
  );
}

function NavItem({ icon, label, badge, badgeColor, active, accent, disabled, onClick }) {
  return (
    <button
      className={`cl-nav-item${active ? ' active' : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 18, flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{label}</span>
      {accent && !active && (
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '.5px',
          background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.5)',
          padding: '2px 6px', borderRadius: 20,
        }}>ADMIN</span>
      )}
      {badge && (
        <span style={{
          background: badgeColor || 'rgba(127,119,221,.75)',
          color: 'white', fontSize: 11, fontWeight: 800,
          minWidth: 24, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 7px', borderRadius: 20, letterSpacing: '.2px',
        }}>{badge}</span>
      )}
    </button>
  );
}
