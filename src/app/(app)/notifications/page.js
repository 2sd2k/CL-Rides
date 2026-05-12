'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/components/store';
import { Topbar, Pill } from '@/components/ui';

function getVisibleNotifications(notifications, rides) {
  const signedEventIds = new Set(rides.map((ride) => ride.eventId));
  return notifications
    .filter((notification) => notification.scope === 'all' || signedEventIds.has(notification.eventId))
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
}

function formatSentAt(sentAt) {
  return new Date(sentAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function NotificationsPage() {
  const { session, hydrated, rides, notifications, getSessionRideKey, markNotificationsRead } = useStore();
  const [filter, setFilter] = useState('all');
  const ownerKey = getSessionRideKey();

  const myRides = useMemo(() => {
    if (!ownerKey) return [];
    return rides.filter((ride) => ride.ownerKey === ownerKey);
  }, [ownerKey, rides]);

  const visibleNotifications = useMemo(
    () => getVisibleNotifications(notifications, myRides),
    [notifications, myRides],
  );

  const filteredNotifications = useMemo(() => {
    if (filter === 'events') return visibleNotifications.filter((n) => n.scope === 'event');
    if (filter === 'general') return visibleNotifications.filter((n) => n.scope === 'all');
    return visibleNotifications;
  }, [filter, visibleNotifications]);

  const unreadIds = useMemo(() => {
    if (!ownerKey) return [];
    return visibleNotifications
      .filter((notification) => !notification.readBy?.includes(ownerKey))
      .map((notification) => notification.id);
  }, [ownerKey, visibleNotifications]);

  if (!hydrated || !session) return null;

  return (
    <>
      <Topbar
        crumbs={['Community', 'Notifications']}
        right={
          <button
            onClick={() => markNotificationsRead(unreadIds)}
            disabled={unreadIds.length === 0}
            style={{
              padding: '8px 13px',
              border: '0.5px solid var(--border-1)',
              borderRadius: 'var(--r-md)',
              background: 'var(--surface)',
              color: unreadIds.length === 0 ? 'var(--text-3)' : 'var(--text-2)',
              fontSize: 12,
              fontWeight: 600,
              boxShadow: 'var(--shadow-sm)',
              cursor: unreadIds.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Mark all read
          </button>
        }
      />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.4px', marginBottom: 4 }}>Notifications</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
              General announcements and updates for events you are signed up for.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', border: '0.5px solid var(--border-1)', borderRadius: 'var(--r-md)', padding: 3, marginBottom: 14, width: 'fit-content' }}>
            {[
              { k: 'all', label: `All (${visibleNotifications.length})` },
              { k: 'events', label: `Event updates (${visibleNotifications.filter((n) => n.scope === 'event').length})` },
              { k: 'general', label: `General (${visibleNotifications.filter((n) => n.scope === 'all').length})` },
            ].map((tab) => (
              <button key={tab.k} onClick={() => setFilter(tab.k)} style={{
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 7,
                background: filter === tab.k ? 'var(--purple-100)' : 'transparent',
                color: filter === tab.k ? 'var(--purple-700)' : 'var(--text-2)',
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredNotifications.length === 0 && (
              <div style={{
                background: 'var(--surface)',
                border: '0.5px solid var(--border-1)',
                borderRadius: 'var(--r-lg)',
                padding: 28,
                textAlign: 'center',
                color: 'var(--text-3)',
                fontSize: 13,
              }}>
                No notifications in this view.
              </div>
            )}
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                read={notification.readBy?.includes(ownerKey)}
                onRead={() => markNotificationsRead([notification.id])}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function NotificationCard({ notification, read, onRead }) {
  const isEvent = notification.scope === 'event';

  return (
    <button
      onClick={onRead}
      style={{
        textAlign: 'left',
        background: read ? 'var(--surface)' : 'linear-gradient(0deg, rgba(127,119,221,.08), rgba(127,119,221,.08)), var(--surface)',
        border: read ? '0.5px solid var(--border-1)' : '1px solid rgba(127,119,221,.32)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: '15px 17px',
        display: 'grid',
        gridTemplateColumns: '34px 1fr auto',
        gap: 12,
        alignItems: 'start',
      }}
    >
      <div style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        background: isEvent ? 'var(--purple-100)' : 'var(--surface-2)',
        color: isEvent ? 'var(--purple-700)' : 'var(--text-2)',
        border: '0.5px solid var(--border-1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <i className={`ti ${isEvent ? 'ti-calendar-event' : 'ti-bell'}`} style={{ fontSize: 17 }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{notification.title}</div>
          <Pill kind={isEvent ? 'purple' : 'neutral'}>{isEvent ? 'Event' : 'General'}</Pill>
          {!read && <Pill kind="amber">Unread</Pill>}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.5 }}>{notification.body}</div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap', paddingTop: 2 }}>{formatSentAt(notification.sentAt)}</div>
    </button>
  );
}
