'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from './store';
import { EVENTS } from '@/lib/data';

export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6, letterSpacing: '.1px' }}>{label}</div>
      {children}
    </div>
  );
}

export function inputStyle({ padded } = {}) {
  return {
    width: '100%',
    padding: padded ? '10px 12px 10px 36px' : '10px 14px',
    fontSize: 13.5,
    border: '0.5px solid var(--border-2)',
    borderRadius: 'var(--r-md)',
    background: 'var(--surface)',
    outline: 'none',
  };
}

export function btnPrimary({ block, mt, disabled } = {}) {
  return {
    background: disabled
      ? 'var(--border-2)'
      : 'linear-gradient(135deg, #534AB7 0%, #6B5FD0 100%)',
    color: 'white',
    fontWeight: 600,
    fontSize: 13,
    padding: '9px 18px',
    borderRadius: 'var(--r-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    width: block ? '100%' : 'auto',
    marginTop: mt || 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    letterSpacing: '.1px',
    boxShadow: disabled ? 'none' : '0 2px 10px rgba(83, 74, 183, .28)',
    border: 'none',
  };
}

export function btnGhost({ block } = {}) {
  return {
    background: 'var(--surface)',
    color: 'var(--text-2)',
    fontWeight: 500,
    fontSize: 13,
    padding: '9px 18px',
    border: '0.5px solid var(--border-2)',
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
        fontSize: 10.5, color: 'var(--text-3)',
        letterSpacing: '.5px', textTransform: 'uppercase',
        fontWeight: 700, marginBottom: 10,
      }}>{title}</div>
      {children}
    </div>
  );
}

export function MetaRow({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, color: 'var(--text-2)', marginBottom: 8 }}>
      <i className={`ti ${icon}`} style={{ fontSize: 14, color: 'var(--purple-500)', flexShrink: 0 }} />
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
      fontSize: 10, fontWeight: 700,
      padding: '3px 9px', borderRadius: 20, letterSpacing: '.2px',
    }}>{children}</span>
  );
}

export function Divider({ label }) {
  if (!label) return <div style={{ height: '0.5px', background: 'var(--border-1)', margin: '16px 0' }} />;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 16px' }}>
      <div style={{ flex: 1, height: '0.5px', background: 'var(--border-1)' }} />
      <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>{label}</div>
      <div style={{ flex: 1, height: '0.5px', background: 'var(--border-1)' }} />
    </div>
  );
}

export function Bullet({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 26, height: 26, borderRadius: 7,
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
      padding: '9px 12px', borderRadius: 'var(--r-md)',
      fontSize: 12, fontWeight: 500,
      display: 'flex', alignItems: 'center', gap: 8,
      marginTop: -6, marginBottom: 6,
    }}>
      <i className={`ti ${s.icon}`} style={{ fontSize: 14 }} />
      {text}
    </div>
  );
}

export function Stat({ label, value, icon }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '0.5px solid var(--border-1)',
      borderRadius: 'var(--r-lg)', padding: '16px 18px',
      display: 'flex', alignItems: 'center', gap: 14,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: 'linear-gradient(135deg, var(--purple-100) 0%, var(--purple-200) 100%)',
        color: 'var(--purple-700)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <i className={`ti ${icon}`} style={{ fontSize: 19 }} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.6px', lineHeight: 1, color: 'var(--text-1)' }}>{value}</div>
        <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 3, letterSpacing: '.4px', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );
}

export function RoleCard({ active, onClick, icon, title, body }) {
  return (
    <button onClick={onClick} style={{
      textAlign: 'left', padding: '11px 13px', borderRadius: 'var(--r-md)',
      border: active ? '1.5px solid var(--purple-500)' : '0.5px solid var(--border-1)',
      background: active ? 'var(--purple-100)' : 'var(--surface)',
      cursor: 'pointer',
      boxShadow: active ? '0 0 0 3px rgba(127,119,221,.12)' : 'none',
      transition: 'all .12s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <i className={`ti ${icon}`} style={{ fontSize: 15, color: active ? 'var(--purple-600)' : 'var(--text-2)' }} />
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
      boxShadow: 'var(--shadow-sm)',
    }}>
      <i className={`ti ${icon}`} style={{ fontSize: 14, color: 'var(--text-2)' }} />
    </button>
  );
}

export function Topbar({ crumbs, right }) {
  const router = useRouter();
  const { session, approved, members, rides, notifications, getSessionRideKey, markNotificationsRead, signInWithEmail } = useStore();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [guestAuthOpen, setGuestAuthOpen] = React.useState(false);
  const notificationsRef = React.useRef(null);
  const profileRef = React.useRef(null);
  const ownerKey = getSessionRideKey();
  const signedEventIds = new Set(rides.filter((ride) => ride.ownerKey === ownerKey).map((ride) => ride.eventId));
  const visibleNotifications = session ? notifications.filter((notification) => (
    (notification.scope === 'all' || signedEventIds.has(notification.eventId)) &&
    (session.isGuest ? notification.scope === 'all' : true)
  )).sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()) : [];
  const unreadCount = visibleNotifications.filter((notification) => (
    !notification.readBy?.includes(ownerKey)
  )).length;
  const initials = session?.isGuest
    ? 'G'
    : (session?.name || 'U').split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase();

  React.useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target;
      const isTyping = target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      } else if (event.key === 'Escape') {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setProfileOpen(false);
        setGuestAuthOpen(false);
      } else if (!isTyping && event.key === '/') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  React.useEffect(() => {
    if (!notificationsOpen) return undefined;
    const onPointerDown = (event) => {
      if (!notificationsRef.current?.contains(event.target)) setNotificationsOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [notificationsOpen]);

  React.useEffect(() => {
    if (!profileOpen) return undefined;
    const onPointerDown = (event) => {
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [profileOpen]);

  return (
    <>
      <div style={{
        height: 66, padding: '0 40px',
        borderBottom: '0.5px solid var(--border-1)',
        background: 'var(--surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
        boxShadow: '0 1px 0 rgba(20,18,38,.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {crumbs.map((c, i) => (
            <React.Fragment key={i}>
              {i > 0 && <i className="ti ti-chevron-right" style={{ fontSize: 10, color: 'var(--border-2)', marginTop: 0.5 }} />}
              <span style={{
                fontSize: i === crumbs.length - 1 ? 16 : 15,
                color: i === crumbs.length - 1 ? 'var(--text-1)' : '#57517E',
                fontWeight: i === crumbs.length - 1 ? 800 : 500,
                letterSpacing: i === crumbs.length - 1 ? '-.2px' : 0,
              }}>{c}</span>
            </React.Fragment>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {right}
          <TopIconButton icon="ti-search" label="Search" onClick={() => setSearchOpen(true)} />
          {session && (
            <div ref={notificationsRef} style={{ position: 'relative' }}>
              <TopIconButton
                icon="ti-bell"
                label="Notifications"
              badge={unreadCount > 0}
              badgeColor="rgba(216,90,48,.95)"
                onClick={() => setNotificationsOpen((open) => !open)}
              />
              {notificationsOpen && (
                <NotificationsDropdown
                  notifications={visibleNotifications}
                  ownerKey={ownerKey}
                  onClose={() => setNotificationsOpen(false)}
                  onMarkAllRead={() => markNotificationsRead(visibleNotifications.map((notification) => notification.id))}
                  onViewAll={() => {
                    setNotificationsOpen(false);
                    router.push('/notifications');
                  }}
                />
              )}
            </div>
          )}
          {session && !session.isGuest && (
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                type="button"
                aria-label="Open profile menu"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((open) => !open)}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #26215C 0%, #51489F 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15,
                  fontWeight: 800,
                  boxShadow: '0 6px 16px rgba(38,33,92,.22)',
                }}
              >
                {initials}
              </button>
              {profileOpen && (
                <ProfileDropdown
                  session={session}
                  initials={initials}
                  onClose={() => setProfileOpen(false)}
                />
              )}
            </div>
          )}
          {session?.isGuest && (
            <button onClick={() => setGuestAuthOpen(true)} style={{
              height: 44,
              padding: '0 18px',
              borderRadius: 12,
              border: '0.5px solid var(--border-1)',
              background: 'var(--surface)',
              color: 'var(--text-1)',
              fontSize: 13,
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              boxShadow: 'var(--shadow-sm)',
            }}>
              <i className="ti ti-user" style={{ fontSize: 14 }} />
              Log in
            </button>
          )}
        </div>
      </div>
      {session?.isGuest && guestAuthOpen && (
        <GuestAuthModal
          initialStep="signin"
          onClose={() => setGuestAuthOpen(false)}
          onSubmit={(email, name) => signInWithEmail(email, name)}
        />
      )}
      {searchOpen && (
        <CommandPalette
          approved={approved}
          members={members}
          rides={rides}
          session={session}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </>
  );
}

function TopIconButton({ icon, label, badge, badgeColor, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        border: '0.5px solid var(--border-1)',
        background: 'var(--surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
      }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 21, color: 'var(--text-1)' }} />
      {badge && (
        <span style={{
          position: 'absolute',
          top: 7,
          right: 7,
          width: 9,
          height: 9,
          borderRadius: '50%',
          background: badgeColor || 'var(--purple-600)',
          border: '2px solid white',
          boxShadow: `0 0 0 1px ${badgeColor || 'var(--purple-600)'}`,
        }} />
      )}
    </button>
  );
}

function NotificationsDropdown({ notifications, ownerKey, onMarkAllRead, onViewAll }) {
  const latest = notifications.slice(0, 5);
  const unread = notifications.some((notification) => !notification.readBy?.includes(ownerKey));

  return (
    <div style={{
      position: 'absolute',
      top: 54,
      right: 0,
      width: 360,
      zIndex: 320,
      borderRadius: 18,
      background: 'rgba(255,255,255,.94)',
      border: '0.5px solid rgba(255,255,255,.72)',
      boxShadow: '0 22px 64px rgba(20,18,38,.22), 0 0 0 1px rgba(127,119,221,.10)',
      backdropFilter: 'blur(18px) saturate(150%)',
      WebkitBackdropFilter: 'blur(18px) saturate(150%)',
      overflow: 'hidden',
      animation: 'notifyDrop .16s cubic-bezier(.2,.8,.2,1)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px 11px',
        borderBottom: '0.5px solid var(--border-1)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-1)' }}>Notifications</div>
        <button
          onClick={onMarkAllRead}
          disabled={!unread}
          style={{
            fontSize: 11.5,
            fontWeight: 800,
            color: unread ? 'var(--purple-600)' : 'var(--text-3)',
            cursor: unread ? 'pointer' : 'not-allowed',
          }}
        >
          Mark all read
        </button>
      </div>
      <div style={{ padding: 8, maxHeight: 392, overflowY: 'auto' }}>
        {latest.length === 0 ? (
          <div style={{ padding: 26, textAlign: 'center', color: 'var(--text-3)', fontSize: 12.5 }}>
            No notifications yet.
          </div>
        ) : (
          latest.map((notification) => (
            <NotificationPreviewRow key={notification.id} notification={notification} unread={!notification.readBy?.includes(ownerKey)} />
          ))
        )}
      </div>
      <div style={{ padding: 10, borderTop: '0.5px solid var(--border-1)', background: 'rgba(239,237,232,.45)' }}>
        <button
          onClick={onViewAll}
          style={{
            width: '100%',
            height: 36,
            borderRadius: 10,
            color: 'var(--purple-700)',
            background: 'rgba(127,119,221,.08)',
            fontSize: 12.5,
            fontWeight: 800,
            transition: 'background .12s ease',
          }}
        >
          View all notifications
        </button>
      </div>
    </div>
  );
}

function ProfileDropdown({ session, initials, onClose }) {
  const { signOut, showToast } = useStore();
  const roleLabel = session.isGuest
    ? 'Guest'
    : session.role === 'admin'
      ? 'Admin'
      : session.role === 'driver'
        ? 'Approved driver'
        : 'Member';

  function placeholderAction(label) {
    showToast(`${label} is coming soon`);
    onClose();
  }

  return (
    <div
      role="menu"
      style={{
        position: 'absolute',
        top: 54,
        right: 0,
        width: 292,
        zIndex: 330,
        borderRadius: 18,
        background: 'rgba(255,255,255,.96)',
        border: '0.5px solid rgba(255,255,255,.72)',
        boxShadow: '0 22px 64px rgba(20,18,38,.22), 0 0 0 1px rgba(127,119,221,.10)',
        backdropFilter: 'blur(18px) saturate(150%)',
        WebkitBackdropFilter: 'blur(18px) saturate(150%)',
        overflow: 'hidden',
        animation: 'profileDrop .16s cubic-bezier(.2,.8,.2,1)',
      }}
    >
      <div style={{ padding: '18px 18px 15px', display: 'flex', alignItems: 'center', gap: 13 }}>
        <div style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #26215C 0%, #6B5FD0 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 800,
          boxShadow: '0 10px 24px rgba(83,74,183,.24)',
          flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {session.name}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginTop: 2 }}>{roleLabel}</div>
          {session.email && (
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {session.email}
            </div>
          )}
        </div>
      </div>

      <ProfileDivider />

      <div style={{ padding: 8 }}>
        <ProfileMenuItem icon="ti-user-circle" label="View profile" onClick={() => placeholderAction('View profile')} />
        <ProfileMenuItem icon="ti-car-garage" label="Ride preferences" onClick={() => placeholderAction('Ride preferences')} />
      </div>

      <ProfileDivider />

      <div style={{ padding: 8 }}>
        <ProfileMenuItem icon="ti-moon" label="Theme" detail="System" onClick={() => placeholderAction('Theme')} />
        <ProfileMenuItem
          icon="ti-logout"
          label="Sign out"
          danger
          onClick={() => {
            onClose();
            signOut();
          }}
        />
      </div>
    </div>
  );
}

function ProfileDivider() {
  return <div style={{ height: '0.5px', background: 'var(--border-1)' }} />;
}

function ProfileMenuItem({ icon, label, detail, danger, onClick }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '26px 1fr auto',
        alignItems: 'center',
        gap: 9,
        padding: '9px 10px',
        borderRadius: 11,
        color: danger ? 'var(--red-700)' : 'var(--text-1)',
        textAlign: 'left',
        fontSize: 13,
        fontWeight: 700,
        transition: 'background .12s ease, color .12s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger ? 'var(--red-100)' : 'rgba(127,119,221,.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 17, color: danger ? 'var(--red-700)' : 'var(--purple-600)' }} />
      <span>{label}</span>
      {detail && <span style={{ fontSize: 11.5, color: 'var(--text-3)', fontWeight: 700 }}>{detail}</span>}
    </button>
  );
}

function GuestAuthModal({ initialStep, onClose, onSubmit }) {
  const [modalStep, setModalStep] = React.useState(initialStep);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');

  function handleSignIn() {
    const e = email.trim().toLowerCase();
    if (!e || !e.includes('@')) {
      setError('Enter a valid email');
      return;
    }
    setError('');
    onSubmit(e);
  }

  function handleRegister() {
    const e = email.trim().toLowerCase();
    if (!e || !e.includes('@')) {
      setError('Enter a valid email');
      return;
    }
    if (!name.trim()) {
      setError('Enter your name');
      return;
    }
    setError('');
    onSubmit(e, name);
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 520, padding: 24 }}
    >
      <div style={{ background: 'white', borderRadius: 16, padding: 28, width: 340, boxShadow: '0 24px 64px rgba(0,0,0,.3)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#1A1726' }}>
            {modalStep === 'signin' ? 'Welcome back' : 'Create an account'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#aaa', lineHeight: 1, padding: 0 }}>
            <i className="ti ti-x" />
          </button>
        </div>
        <div style={{ fontSize: 12, color: '#52506A', marginBottom: 22, lineHeight: 1.55 }}>
          {modalStep === 'signin'
            ? 'Sign in to keep your rides and contact info saved.'
            : 'Register to save your ride history and contact details.'}
        </div>

        {modalStep === 'register' && (
          <>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#52506A', marginBottom: 5 }}>Full name</div>
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <i className="ti ti-user" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: '#aaa', pointerEvents: 'none' }} />
              <input
                autoFocus
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                style={{ width: '100%', padding: '9px 10px 9px 32px', border: '0.5px solid #D9D7CF', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </>
        )}

        <div style={{ fontSize: 12, fontWeight: 500, color: '#52506A', marginBottom: 5 }}>Email address</div>
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <i className="ti ti-mail" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: '#aaa', pointerEvents: 'none' }} />
          <input
            autoFocus={modalStep === 'signin'}
            type="email"
            placeholder="you@grace.org"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && (modalStep === 'signin' ? handleSignIn() : handleRegister())}
            style={{ width: '100%', padding: '9px 10px 9px 32px', border: '0.5px solid #D9D7CF', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ fontSize: 12, fontWeight: 500, color: '#52506A', marginBottom: 5 }}>Password</div>
        <div style={{ position: 'relative', marginBottom: error ? 8 : 20 }}>
          <i className="ti ti-lock" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: '#aaa', pointerEvents: 'none' }} />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (modalStep === 'signin' ? handleSignIn() : handleRegister())}
            style={{ width: '100%', padding: '9px 10px 9px 32px', border: '0.5px solid #D9D7CF', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {error && <div style={{ fontSize: 12, color: '#D85A30', marginBottom: 10 }}>{error}</div>}

        <button
          onClick={modalStep === 'signin' ? handleSignIn : handleRegister}
          style={{ width: '100%', padding: 10, background: '#534AB7', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', marginBottom: 12 }}
        >
          {modalStep === 'signin' ? 'Sign in' : 'Create account'}
          <i className="ti ti-arrow-right" style={{ fontSize: 12, verticalAlign: -1, marginLeft: 4 }} />
        </button>

        <div style={{ textAlign: 'center' }}>
          {modalStep === 'signin' ? (
            <button
              onClick={() => { setModalStep('register'); setError(''); setPassword(''); }}
              style={{ background: 'none', border: 'none', fontSize: 12, color: '#534AB7', cursor: 'pointer' }}
            >
              Don&apos;t have an account? Register here
            </button>
          ) : (
            <button
              onClick={() => { setModalStep('signin'); setError(''); setName(''); }}
              style={{ background: 'none', border: 'none', fontSize: 12, color: '#534AB7', cursor: 'pointer' }}
            >
              Already have an account? Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationPreviewRow({ notification, unread }) {
  const isEvent = notification.scope === 'event';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '34px 1fr auto',
      gap: 11,
      alignItems: 'start',
      padding: '10px 10px',
      borderRadius: 13,
      background: unread ? 'linear-gradient(0deg, rgba(127,119,221,.09), rgba(127,119,221,.09)), var(--surface)' : 'transparent',
      transition: 'background .12s ease, transform .12s ease',
      marginBottom: 3,
    }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 10,
        background: isEvent ? 'var(--purple-100)' : 'var(--surface-2)',
        color: isEvent ? 'var(--purple-700)' : 'var(--text-2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '0.5px solid var(--border-1)',
      }}>
        <i className={`ti ${isEvent ? 'ti-calendar-event' : 'ti-bell'}`} style={{ fontSize: 16 }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {notification.title}
          </div>
          {unread && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--purple-600)', flexShrink: 0 }} />}
        </div>
        <div style={{
          fontSize: 12,
          color: 'var(--text-2)',
          marginTop: 2,
          lineHeight: 1.35,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {notification.body}
        </div>
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--text-3)', whiteSpace: 'nowrap', paddingTop: 1 }}>
        {formatNotificationTime(notification.sentAt)}
      </div>
    </div>
  );
}

function formatNotificationTime(sentAt) {
  const now = new Date('2026-05-12T12:00:00');
  const date = new Date(sentAt);
  const minutes = Math.max(1, Math.round((now.getTime() - date.getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function CommandPalette({ approved, members, rides, session, onClose }) {
  const router = useRouter();
  const inputRef = React.useRef(null);
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [recent, setRecent] = React.useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('cl_rides_recent_searches') || '[]').slice(0, 4);
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, []);

  const allResults = React.useMemo(() => {
    const memberResults = Object.entries({ ...members, ...approved }).map(([email, rec]) => {
      const approvedRole = approved[email]?.role;
      return {
        id: `member-${email}`,
        type: 'Member',
        icon: approvedRole === 'admin' ? 'ti-crown' : approvedRole === 'driver' ? 'ti-steering-wheel' : 'ti-user',
        title: rec.name || email.split('@')[0],
        subtitle: `${email} - ${approvedRole === 'admin' ? 'Admin' : approvedRole === 'driver' ? 'Driver' : 'Rider'}`,
        keywords: ['members', 'people', approvedRole || 'rider'],
        href: '/members',
      };
    });

    const rideResults = rides
      .filter((ride) => !session || ride.ownerKey === (session.email || 'guest'))
      .map((ride) => ({
        id: `ride-${ride.id}`,
        type: 'Ride',
        icon: 'ti-car',
        title: ride.eventName,
        subtitle: `${ride.date} - ${ride.time}${ride.pickup ? ` - Pickup: ${ride.pickup}` : ''}`,
        keywords: ['rides', 'pickup', ride.location],
        href: '/myrides',
      }));

    const eventResults = EVENTS.map((event) => ({
      id: `event-${event.id}`,
      type: 'Event',
      icon: 'ti-calendar-event',
      title: event.name,
      subtitle: `${event.date} - ${event.time} - ${event.location}`,
      keywords: ['events', event.location, event.duration],
      href: '/events',
    }));

    const locations = [...new Set([...EVENTS.map((event) => event.location), ...rides.map((ride) => ride.location)].filter(Boolean))];
    const locationResults = locations.map((location) => ({
      id: `location-${location}`,
      type: 'Location',
      icon: 'ti-map-pin',
      title: location,
      subtitle: 'Find events and rides at this location',
      keywords: ['locations', 'places', 'where'],
      href: '/events',
    }));

    const ministryResults = [
      { title: 'Worship', subtitle: 'Music and worship gatherings', color: '#7F77DD' },
      { title: 'Small Groups', subtitle: 'Bible studies and group events', color: '#1D9E75' },
      { title: 'Youth', subtitle: 'Youth and retreat events', color: '#D85A30' },
      { title: 'Outreach', subtitle: 'Community service and outreach', color: '#E8B21A' },
      { title: 'Fellowship', subtitle: 'Meals, lunches, and hangouts', color: '#4B8DD8' },
    ].map((ministry) => ({
      id: `ministry-${ministry.title}`,
      type: 'Ministry',
      icon: 'ti-users-group',
      title: ministry.title,
      subtitle: ministry.subtitle,
      keywords: ['ministries', 'groups', ministry.title],
      href: '/events',
      color: ministry.color,
    }));

    const quickActions = [
      { id: 'quick-find-ride', type: 'Quick action', icon: 'ti-route', title: 'Find a ride for an event', subtitle: 'Browse upcoming events with ride signup', keywords: ['find ride signup event'], href: '/events' },
      { id: 'quick-my-requests', type: 'Quick action', icon: 'ti-list-check', title: 'Review my ride requests', subtitle: 'See rider sign-ups and pickup locations', keywords: ['my rides requests pickup'], href: '/myrides' },
      { id: 'quick-event-updates', type: 'Quick action', icon: 'ti-bell-ringing', title: 'Check ride updates', subtitle: 'Open community notifications', keywords: ['notifications updates'], href: '/notifications' },
    ];

    return [...eventResults, ...rideResults, ...memberResults, ...ministryResults, ...locationResults, ...quickActions];
  }, [approved, members, rides, session]);

  const results = React.useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];
    return allResults
      .map((result) => ({ ...result, score: fuzzyScore(trimmed, [result.title, result.subtitle, result.type, ...(result.keywords || [])].join(' ')) }))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [allResults, query]);

  const emptyStateRows = React.useMemo(() => {
    const recentRows = recent.map((item) => ({ ...item, group: 'Recent searches' }));
    const suggestedRows = EVENTS.slice(0, 3).map((event) => ({
      id: `suggested-${event.id}`,
      group: 'Suggested events',
      type: 'Event',
      icon: 'ti-calendar-event',
      title: event.name,
      subtitle: `${event.date} - ${event.time} - ${event.location}`,
      href: '/events',
    }));
    const actionRows = [
      { id: 'empty-find-ride', group: 'Quick actions', type: 'Quick action', icon: 'ti-route', title: 'Find a ride', subtitle: 'Browse upcoming events', href: '/events' },
      { id: 'empty-members', group: 'Quick actions', type: 'Quick action', icon: 'ti-user-search', title: 'Find a member', subtitle: 'Search community members by name or email', href: '/members' },
    ];
    return [...recentRows, ...suggestedRows, ...actionRows];
  }, [recent]);

  const visibleRows = query.trim() ? results : emptyStateRows;

  function openResult(result) {
    if (!result) return;
    const recentItem = {
      id: `recent-${result.id}`,
      type: result.type,
      icon: result.icon,
      title: result.title,
      subtitle: result.subtitle,
      href: result.href,
    };
    setRecent((current) => {
      const next = [recentItem, ...current.filter((item) => item.title !== result.title)].slice(0, 4);
      try {
        localStorage.setItem('cl_rides_recent_searches', JSON.stringify(next));
      } catch {}
      return next;
    });
    onClose();
    router.push(result.href);
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, Math.max(visibleRows.length - 1, 0)));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      openResult(visibleRows[selectedIndex]);
    }
  }

  return (
    <div
      className="cmdk-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '11vh 18px 24px',
        background: 'rgba(12,10,24,.42)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        animation: 'cmdkFade .14s ease-out',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        className="cmdk-panel"
        style={{
          width: 'min(680px, 100%)',
          borderRadius: 20,
          background: 'rgba(255,255,255,.96)',
          border: '0.5px solid rgba(255,255,255,.68)',
          boxShadow: '0 26px 80px rgba(20,18,38,.32), 0 0 0 1px rgba(127,119,221,.12)',
          overflow: 'hidden',
          animation: 'cmdkScale .16s cubic-bezier(.2,.8,.2,1)',
        }}
      >
        <div style={{ height: 4, background: 'linear-gradient(90deg, var(--purple-500), var(--purple-600))' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 20px 14px', borderBottom: '0.5px solid var(--border-1)' }}>
          <i className="ti ti-search" style={{ fontSize: 22, color: 'var(--purple-600)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search events, rides, or members"
            style={{
              flex: 1,
              border: 0,
              outline: 'none',
              background: 'transparent',
              fontSize: 16,
              color: 'var(--text-1)',
            }}
          />
          <kbd style={{
            fontSize: 11,
            color: 'var(--text-3)',
            border: '0.5px solid var(--border-1)',
            borderRadius: 7,
            padding: '3px 7px',
            background: 'var(--surface-2)',
          }}>Esc</kbd>
        </div>
        <div style={{ maxHeight: 'min(54vh, 460px)', overflowY: 'auto', padding: 10 }}>
          {visibleRows.length === 0 ? (
            <div style={{ padding: 28, textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>No results found.</div>
          ) : (
            <GroupedCommandRows rows={visibleRows} selectedIndex={selectedIndex} onHover={setSelectedIndex} onOpen={openResult} showGroups={!query.trim()} />
          )}
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          padding: '10px 18px 14px',
          borderTop: '0.5px solid var(--border-1)',
          color: 'var(--text-3)',
          fontSize: 11,
        }}>
          <span><kbd>↑</kbd> <kbd>↓</kbd> navigate</span>
          <span><kbd>Enter</kbd> open</span>
        </div>
      </div>
    </div>
  );
}

function GroupedCommandRows({ rows, selectedIndex, onHover, onOpen, showGroups }) {
  let lastGroup = null;
  return rows.map((row, index) => {
    const shouldShowGroup = showGroups && row.group && row.group !== lastGroup;
    lastGroup = row.group || lastGroup;
    return (
      <React.Fragment key={row.id}>
        {shouldShowGroup && (
          <div style={{ padding: '12px 10px 6px', fontSize: 10.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.7px', fontWeight: 800 }}>
            {row.group}
          </div>
        )}
        <CommandRow row={row} active={index === selectedIndex} onMouseEnter={() => onHover(index)} onClick={() => onOpen(row)} />
      </React.Fragment>
    );
  });
}

function CommandRow({ row, active, onMouseEnter, onClick }) {
  return (
    <button
      type="button"
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '38px 1fr auto',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 12,
        background: active ? 'linear-gradient(0deg, rgba(127,119,221,.10), rgba(127,119,221,.10)), var(--surface)' : 'transparent',
        color: 'var(--text-1)',
        textAlign: 'left',
        transition: 'background .12s ease, transform .12s ease',
        transform: active ? 'translateY(-1px)' : 'translateY(0)',
      }}
    >
      <span style={{
        width: 36,
        height: 36,
        borderRadius: 11,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: row.color ? `${row.color}18` : 'var(--purple-100)',
        color: row.color || 'var(--purple-700)',
        border: '0.5px solid rgba(127,119,221,.12)',
      }}>
        <i className={`ti ${row.icon || 'ti-search'}`} style={{ fontSize: 18 }} />
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 13.5, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.title}</span>
        <span style={{ display: 'block', fontSize: 12, color: 'var(--text-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>{row.subtitle}</span>
      </span>
      <span style={{ fontSize: 10.5, fontWeight: 800, color: active ? 'var(--purple-700)' : 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.4px' }}>
        {row.type}
      </span>
    </button>
  );
}

function fuzzyScore(query, text) {
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase();
  if (!q) return 1;
  if (t.includes(q)) return 100 + q.length;

  let score = 0;
  let ti = 0;
  let streak = 0;
  for (let qi = 0; qi < q.length; qi += 1) {
    const char = q[qi];
    const found = t.indexOf(char, ti);
    if (found === -1) return 0;
    streak = found === ti ? streak + 1 : 1;
    score += 4 + streak * 2 - Math.min(found - ti, 8) * 0.25;
    ti = found + 1;
  }
  return score;
}
