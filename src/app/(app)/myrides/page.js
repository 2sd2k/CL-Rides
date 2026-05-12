'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/components/store';
import { EmptyScreen } from '@/components/screens/EmptyScreen';
import { Topbar, Pill } from '@/components/ui';

export default function MyRidesPage() {
  const { session, hydrated, rides, getSessionRideKey } = useStore();
  const [futureOpen, setFutureOpen] = useState(false);
  const [pastOpen, setPastOpen] = useState(false);
  const ownerKey = getSessionRideKey();

  const myRides = useMemo(() => {
    if (!ownerKey) return [];
    return rides
      .filter((ride) => ride.ownerKey === ownerKey)
      .sort((a, b) => `${a.dateISO} ${a.time}`.localeCompare(`${b.dateISO} ${b.time}`));
  }, [ownerKey, rides]);

  const groupedRides = useMemo(() => {
    const today = new Date('2026-05-11T00:00:00');
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 6);

    return myRides.reduce((groups, ride) => {
      const rideDate = new Date(`${ride.dateISO}T12:00:00`);
      if (rideDate < today) groups.past.push(ride);
      else if (rideDate <= weekEnd) groups.upcoming.push(ride);
      else groups.future.push(ride);
      return groups;
    }, { upcoming: [], future: [], past: [] });
  }, [myRides]);

  if (!hydrated || !session) return null;

  if (myRides.length === 0) {
    return (
      <EmptyScreen
        icon="ti-car"
        title="My rides"
        body={session.isGuest
          ? 'Guest ride sign-ups from this browser session will appear here.'
          : "Rides you've signed up for or offered will appear here."}
      />
    );
  }

  return (
    <>
      <Topbar crumbs={['My rides']} />
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.4px', marginBottom: 4 }}>My rides</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
              {session.isGuest ? 'Ride sign-ups saved for this guest session.' : 'Your upcoming ride sign-ups.'}
            </div>
          </div>

          <RideSection title="Upcoming rides" rides={groupedRides.upcoming} />
          <RideSection title="Future rides" rides={groupedRides.future} collapsed collapsible open={futureOpen} onToggle={() => setFutureOpen((v) => !v)} />
          <RideSection title="Past rides" rides={groupedRides.past} collapsed collapsible open={pastOpen} onToggle={() => setPastOpen((v) => !v)} />
        </div>
      </div>
    </>
  );
}

function RideSection({ title, rides, collapsed, collapsible, open, onToggle }) {
  const showContent = !collapsible || open;

  return (
    <section style={{ marginBottom: 24 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        paddingBottom: 9,
        marginBottom: 10,
        borderBottom: '0.5px solid var(--border-1)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.1px' }}>
          {title} <span style={{ color: 'var(--text-3)', fontWeight: 700 }}>({rides.length})</span>
        </div>
        {collapsible && (
          <button onClick={onToggle} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 800,
            color: 'var(--purple-600)',
            padding: '5px 8px',
            borderRadius: 8,
            transition: 'background .12s ease',
          }}>
            {open ? `Hide ${title.toLowerCase()}` : `Show ${title.toLowerCase()}`}
            <i className={`ti ${open ? 'ti-chevron-up' : 'ti-chevron-down'}`} style={{ fontSize: 13 }} />
          </button>
        )}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateRows: showContent ? '1fr' : '0fr',
        transition: 'grid-template-rows .22s ease, opacity .18s ease',
        opacity: showContent ? 1 : 0,
      }}>
        <div style={{ overflow: 'hidden' }}>
          {rides.length === 0 && showContent ? (
            <div style={{
              background: 'var(--surface)',
              border: '0.5px dashed var(--border-2)',
              borderRadius: 'var(--r-lg)',
              padding: '18px',
              color: 'var(--text-3)',
              fontSize: 13,
              textAlign: 'center',
            }}>
              No rides in this section.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {rides.map((ride) => (
                <RideCard key={ride.id} ride={ride} muted={collapsed} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function RideCard({ ride, muted }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '0.5px solid var(--border-1)',
      borderRadius: 'var(--r-lg)',
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
      opacity: muted ? .74 : 1,
      transition: 'opacity .14s ease, transform .14s ease, box-shadow .14s ease',
    }}>
      <div style={{ height: 4, background: ride.color || 'var(--purple-500)' }} />
      <div style={{ padding: '15px 18px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 14, alignItems: 'start' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.2px', color: 'var(--text-1)' }}>{ride.eventName}</div>
            <Pill kind="purple">Rider</Pill>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', fontSize: 12.5, color: 'var(--text-2)' }}>
            <span><i className="ti ti-calendar" style={{ fontSize: 13, color: 'var(--purple-500)', verticalAlign: -2, marginRight: 5 }} />{ride.date} - {ride.time}</span>
            <span><i className="ti ti-map-pin" style={{ fontSize: 13, color: 'var(--purple-500)', verticalAlign: -2, marginRight: 5 }} />{ride.location}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-2)', minWidth: 150 }}>
          <div style={{ fontWeight: 700, color: 'var(--text-1)', marginBottom: 2 }}>{ride.riderName}</div>
          <div>{ride.riderCount} {ride.riderCount === 1 ? 'rider' : 'riders'}</div>
          {ride.pickup && <div>Pickup: {ride.pickup}</div>}
          {ride.driverName && <div>Driver: {ride.driverName}</div>}
        </div>
      </div>
    </div>
  );
}
