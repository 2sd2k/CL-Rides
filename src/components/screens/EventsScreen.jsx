'use client';

import React, { useState } from 'react';
import { useStore } from '../store';
import { EVENTS } from '@/lib/data';
import { Topbar, IconBtn, Section, MetaRow, Pill, Divider, btnPrimary, btnGhost } from '../ui';

export function EventsScreen() {
  const { session, setModal } = useStore();
  const [selectedEventId, setSelectedEventId] = useState('sun-svc');
  const canDrive = session.role === 'driver' || session.role === 'admin';
  const isGuest  = session.isGuest;
  const event = EVENTS.find((e) => e.id === selectedEventId) || EVENTS[0];

  return (
    <>
      <Topbar
        crumbs={['Events', 'May 2026']}
        right={
          <button style={btnPrimary({})}>
            <i className="ti ti-plus" style={{ fontSize: 13, verticalAlign: -1, marginRight: 4 }} />
            Add event
          </button>
        }
      />
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div style={{ flex: 1, padding: '22px 26px', overflow: 'auto', background: 'var(--surface)', borderRight: '0.5px solid var(--border-1)' }}>
          <CalHeader />
          <CalGrid />
          <EventList events={EVENTS} selectedId={selectedEventId} onSelect={setSelectedEventId} />
        </div>
        <div style={{ width: 340, padding: '22px 22px 30px', overflow: 'auto', background: 'var(--surface)' }}>
          <EventDetail
            event={event}
            canDrive={canDrive}
            isGuest={isGuest}
            onOpenRider={() => setModal({ type: 'rider', event })}
            onOpenDriver={() => setModal({ type: 'driver', event })}
          />
        </div>
      </div>
    </>
  );
}

function CalHeader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-.2px' }}>May 2026</div>
      <div style={{ display: 'flex', gap: 4 }}>
        <IconBtn icon="ti-chevron-left" />
        <IconBtn icon="ti-chevron-right" />
      </div>
    </div>
  );
}

function CalGrid() {
  const labels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const days = [
    [null, null, null, null, 1, 2, 3],
    [4, 5, 6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15, 16, 17],
    [18, 19, 20, 21, 22, 23, 24],
    [25, 26, 27, 28, 29, 30, 31],
  ].flat();
  const has = new Set([1, 4, 7, 11, 14, 16, 18, 22, 26]);
  const today = 10;
  const sel = 11;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 24 }}>
      {labels.map((l) => <div key={l} style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)', padding: '6px 0' }}>{l}</div>)}
      {days.map((d, i) => {
        if (d === null) return <div key={i} style={{ height: 38 }} />;
        const isToday = d === today;
        const isSel   = d === sel;
        const hasEv   = has.has(d);
        return (
          <div key={i} style={{
            height: 38, borderRadius: 'var(--r-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, position: 'relative', cursor: 'pointer',
            background: isSel ? 'var(--purple-600)' : isToday ? 'var(--purple-100)' : 'transparent',
            color: isSel ? 'white' : isToday ? 'var(--purple-700)' : 'var(--text-2)',
            fontWeight: (isToday || isSel) ? 500 : 400,
          }}>
            {d}
            {hasEv && (
              <div style={{
                width: 4, height: 4, borderRadius: '50%',
                background: isSel ? 'rgba(255,255,255,.7)' : 'var(--purple-500)',
                position: 'absolute', bottom: 5,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function EventList({ events, selectedId, onSelect }) {
  return (
    <div>
      <div style={{
        fontSize: 11, color: 'var(--text-3)', marginBottom: 10,
        display: 'flex', justifyContent: 'space-between',
        letterSpacing: '.4px', textTransform: 'uppercase', fontWeight: 500,
      }}>
        <span>Upcoming · Sunday, May 11</span>
        <span style={{ color: 'var(--purple-600)', cursor: 'pointer' }}>See all</span>
      </div>
      {events.map((ev) => {
        const isSel = ev.id === selectedId;
        return (
          <button key={ev.id} onClick={() => onSelect(ev.id)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px',
            border: isSel ? '0.5px solid var(--purple-200)' : '0.5px solid var(--border-1)',
            background: isSel ? 'var(--purple-100)' : 'var(--surface)',
            borderRadius: 'var(--r-md)',
            marginBottom: 6, width: '100%', textAlign: 'left',
            transition: 'all .12s',
          }}>
            <div style={{ width: 3, height: 38, borderRadius: 4, background: ev.color, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{ev.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{ev.date.replace(', 2026', '')} · {ev.time}</div>
            </div>
            <i className="ti ti-chevron-right" style={{ fontSize: 14, color: 'var(--text-3)' }} />
          </button>
        );
      })}
    </div>
  );
}

function EventDetail({ event, canDrive, isGuest, onOpenRider, onOpenDriver }) {
  const totalSeats = event.drivers.reduce((s, d) => s + d.seatsTotal, 0);
  const takenSeats = event.drivers.reduce((s, d) => s + d.seatsTaken, 0);
  const openSeats  = totalSeats - takenSeats;
  const pct = totalSeats === 0 ? 0 : Math.round((takenSeats / totalSeats) * 100);

  return (
    <div>
      <div style={{
        fontSize: 10, letterSpacing: '.6px', color: 'var(--text-3)',
        textTransform: 'uppercase', fontWeight: 500, marginBottom: 12,
      }}>Event details</div>
      <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-.3px', marginBottom: 4 }}>{event.name}</div>
      <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
        <i className="ti ti-calendar" style={{ fontSize: 14, color: 'var(--purple-500)' }} />
        {event.date} · {event.time}
      </div>

      <Section title="Location & info">
        <MetaRow icon="ti-map-pin" text={event.location} />
        <MetaRow icon="ti-clock"   text={`Approx. ${event.duration}`} />
        <MetaRow icon="ti-users"   text={`${event.attending} members attending`} />
      </Section>

      <Divider />

      <Section title="Drivers">
        {event.drivers.map((d) => {
          const isFull = d.seatsTaken >= d.seatsTotal;
          const open   = d.seatsTotal - d.seatsTaken;
          return (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--purple-100)', color: 'var(--purple-700)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 600,
              }}>{d.name.split(' ').map((s) => s[0]).join('').slice(0, 2)}</div>
              <div style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>{d.name.split(' ')[0]} {d.name.split(' ')[1]?.[0]}.</div>
              <Pill kind={isFull ? 'full' : 'open'}>{isFull ? 'Full' : `${open} open`}</Pill>
            </div>
          );
        })}
      </Section>

      <Divider />

      <Section title="Seat availability">
        <div style={{ height: 6, borderRadius: 6, background: 'var(--surface-2)', marginBottom: 6, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--purple-500)' }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 14 }}>
          {takenSeats} of {totalSeats} seats filled · {openSeats} open
        </div>
      </Section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={onOpenRider} style={btnPrimary({ block: true })} disabled={openSeats === 0}>
          <i className="ti ti-user-plus" style={{ fontSize: 14, verticalAlign: -2, marginRight: 6 }} />
          {openSeats === 0 ? 'All seats taken' : 'Sign up as rider'}
        </button>

        {canDrive ? (
          <button onClick={onOpenDriver} style={btnGhost({ block: true })}>
            <i className="ti ti-steering-wheel" style={{ fontSize: 14, verticalAlign: -2, marginRight: 6 }} />
            Offer to drive
          </button>
        ) : (
          <DriverLockedCard isGuest={isGuest} />
        )}
      </div>
    </div>
  );
}

function DriverLockedCard({ isGuest }) {
  return (
    <div style={{
      border: '0.5px dashed var(--border-2)',
      borderRadius: 'var(--r-md)',
      padding: '11px 13px',
      background: 'var(--surface-2)',
      display: 'flex', gap: 10,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: 'var(--surface)', border: '0.5px solid var(--border-1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <i className="ti ti-lock" style={{ fontSize: 14, color: 'var(--text-3)' }} />
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.5 }}>
        <div style={{ fontWeight: 600, color: 'var(--text-1)', marginBottom: 2, fontSize: 12 }}>Driving is admin-approved</div>
        {isGuest
          ? 'Sign in with email and ask your admin to grant driver access.'
          : 'Ask your admin to add you as an approved driver.'}
        <a href="#" style={{ display: 'block', marginTop: 6, color: 'var(--purple-600)', textDecoration: 'none', fontWeight: 500 }}>
          Request access <i className="ti ti-arrow-right" style={{ fontSize: 11, verticalAlign: -1 }} />
        </a>
      </div>
    </div>
  );
}
