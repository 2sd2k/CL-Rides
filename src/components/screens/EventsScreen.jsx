'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useStore } from '../store';
import { Topbar, IconBtn, Pill, btnPrimary, btnGhost, Field, inputStyle } from '../ui';
import { ModalShell } from '../modals';

const INITIAL_MONTH = new Date(2026, 4, 1);
const INITIAL_SELECTED_DATE = '2026-05-11';

const COLORS = ['#7F77DD', '#1D9E75', '#D85A30', '#4B8DD8'];

function toISODate(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatMonth(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatShortDate(isoDate) {
  if (!isoDate) return null;
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getEventISO(event) {
  return event.dateISO || toISODate(new Date(event.date));
}

export function EventsScreen() {
  const { session, setModal, showToast } = useStore();
  const [viewDate, setViewDate] = useState(INITIAL_MONTH);
  const [selectedDate, setSelectedDate] = useState(INITIAL_SELECTED_DATE);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [calendarView, setCalendarView] = useState('month');

  const monthKey = `${viewDate.getFullYear()}-${`${viewDate.getMonth() + 1}`.padStart(2, '0')}`;
  const canDrive = session.role === 'driver' || session.role === 'admin';

  const fetchEvents = useCallback(async () => {
    const res = await fetch(`/api/events?month=${monthKey}`);
    if (!res.ok) throw new Error('Failed to load events');
    const data = await res.json();
    return data.events || [];
  }, [monthKey]);

  useEffect(() => {
    let cancelled = false;
    fetchEvents()
      .then((nextEvents) => {
        if (!cancelled) setEvents(nextEvents);
      })
      .catch(() => {
        if (!cancelled) showToast('Could not load calendar events', 'error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchEvents, showToast]);

  const visibleEvents = useMemo(() => {
    if (!selectedDate) return events;
    return events.filter((event) => getEventISO(event) === selectedDate);
  }, [events, selectedDate]);

  const event = visibleEvents.find((e) => e.id === selectedEventId) || visibleEvents[0] || null;

  async function createEvent(form) {
    if (session.role !== 'admin') {
      showToast('Only admins can add events', 'error');
      return;
    }

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-cl-rides-role': session.role },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      showToast('Could not add event', 'error');
      return;
    }

    const data = await res.json();
    const nextDate = new Date(`${data.event.dateISO}T12:00:00`);
    setViewDate(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
    setSelectedDate(data.event.dateISO);
    setSelectedEventId(data.event.id);
    setEvents((current) => {
      const nextMonthKey = data.event.dateISO.slice(0, 7);
      if (nextMonthKey !== monthKey) return current;
      return [...current.filter((event) => event.id !== data.event.id), data.event];
    });
    setAddEventOpen(false);
    showToast('Event added');
  }

  return (
    <>
      <Topbar crumbs={['Events', 'Calendar']} />
      <div style={{ flex: 1, display: 'flex', minHeight: 0, background: 'var(--surface)' }}>
        <div style={{ flex: 1, padding: '28px 36px 34px', overflow: 'auto', background: 'var(--surface)', borderRight: '0.5px solid var(--border-1)' }}>
          <CalHeader
            monthLabel={formatMonth(viewDate)}
            view={calendarView}
            onViewChange={setCalendarView}
            onToday={() => {
              setLoading(true);
              setViewDate(INITIAL_MONTH);
              setSelectedDate(INITIAL_SELECTED_DATE);
              setSelectedEventId(null);
            }}
            onPrev={() => {
              setLoading(true);
              setViewDate((d) => addMonths(d, -1));
              setSelectedDate(null);
            }}
            onNext={() => {
              setLoading(true);
              setViewDate((d) => addMonths(d, 1));
              setSelectedDate(null);
            }}
          />
          {calendarView === 'month' && (
            <CalGrid
              viewDate={viewDate}
              events={events}
              selectedDate={selectedDate}
              onSelectDate={(isoDate) => {
                setSelectedDate((current) => current === isoDate ? null : isoDate);
                setSelectedEventId(null);
              }}
            />
          )}
          {calendarView === 'week' && (
            <WeekGrid
              viewDate={viewDate}
              events={events}
              selectedDate={selectedDate}
              onSelectDate={(isoDate) => {
                setSelectedDate((current) => current === isoDate ? null : isoDate);
                setSelectedEventId(null);
              }}
              onSelectEvent={setSelectedEventId}
            />
          )}
          {calendarView === 'agenda' && (
            <AgendaView
              events={events}
              selectedId={event?.id}
              onSelect={setSelectedEventId}
              onSelectDate={setSelectedDate}
            />
          )}
          {calendarView === 'month' && (
            <>
              <CalendarLegend />
              <EventList
                events={visibleEvents}
                selectedId={event?.id}
                selectedDate={selectedDate}
                loading={loading}
                onSelect={setSelectedEventId}
                onSeeAll={() => setSelectedDate(null)}
              />
            </>
          )}
        </div>
        <div style={{ width: 370, padding: '28px 24px 34px', overflow: 'auto', background: 'var(--bg)' }}>
          {event ? (
            <EventDetail
              event={event}
              canDrive={canDrive}
              onOpenRider={() => setModal({ type: 'rider', event })}
              onOpenDriver={() => setModal({ type: 'driver', event })}
            />
          ) : (
            <EmptyEventDetail selectedDate={selectedDate} />
          )}
        </div>
      </div>
      {session.role === 'admin' && addEventOpen && (
        <AddEventModal
          defaultDate={selectedDate || toISODate(new Date(viewDate.getFullYear(), viewDate.getMonth(), 1))}
          onClose={() => setAddEventOpen(false)}
          onSubmit={createEvent}
        />
      )}
    </>
  );
}

function CalHeader({ monthLabel, view, onViewChange, onToday, onPrev, onNext }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 }}>
      <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: '-.7px', color: 'var(--text-1)' }}>{monthLabel}</div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <select
          value={view}
          onChange={(e) => onViewChange(e.target.value)}
          style={{
            height: 38,
            padding: '0 34px 0 14px',
            borderRadius: 'var(--r-md)',
            border: '0.5px solid var(--border-1)',
            background: 'var(--surface)',
            boxShadow: 'var(--shadow-sm)',
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--text-1)',
            outline: 'none',
          }}
        >
          <option value="month">Month</option>
          <option value="week">Week</option>
          <option value="agenda">List</option>
        </select>
        <button onClick={onToday} style={{
          height: 38,
          padding: '0 17px',
          borderRadius: 'var(--r-md)',
          border: '0.5px solid var(--border-1)',
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-sm)',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-1)',
        }}>Today</button>
        <IconBtn icon="ti-chevron-left" onClick={onPrev} />
        <IconBtn icon="ti-chevron-right" onClick={onNext} />
      </div>
    </div>
  );
}

function CalGrid({ viewDate, events, selectedDate, onSelectDate }) {
  const labels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const today = toISODate(new Date());
  const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const totalDays = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const previousMonthDays = new Date(viewDate.getFullYear(), viewDate.getMonth(), 0).getDate();
  const leading = first.getDay();
  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = i - leading + 1;
    if (day < 1) {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, previousMonthDays + day);
      return { date, day: date.getDate(), inMonth: false };
    }
    if (day > totalDays) {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, day - totalDays);
      return { date, day: date.getDate(), inMonth: false };
    }
    return { date: new Date(viewDate.getFullYear(), viewDate.getMonth(), day), day, inMonth: true };
  });

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
      border: '0.5px solid var(--border-1)',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
      background: 'var(--surface)',
    }}>
      {labels.map((l) => (
        <div key={l} style={{
          textAlign: 'center',
          fontSize: 11,
          color: 'var(--text-1)',
          padding: '13px 8px',
          fontWeight: 800,
          letterSpacing: '.4px',
          textTransform: 'uppercase',
          borderBottom: '0.5px solid var(--border-1)',
          borderRight: l === 'Sa' ? 'none' : '0.5px solid var(--border-1)',
        }}>{l}</div>
      ))}
      {cells.map((cell, index) => {
        const isoDate = toISODate(cell.date);
        const isToday = isoDate === today;
        const isSel = isoDate === selectedDate;
        const dayEvents = events.filter((event) => getEventISO(event) === isoDate);
        const col = index % 7;
        const row = Math.floor(index / 7);
        return (
          <button
            key={isoDate}
            type="button"
            aria-pressed={isSel}
            onClick={() => onSelectDate(isoDate)}
            disabled={!cell.inMonth}
            style={{
              minHeight: 108,
              padding: '6px 8px 6px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: 5,
              cursor: cell.inMonth ? 'pointer' : 'default',
              background: isSel ? 'rgba(127,119,221,.06)' : 'transparent',
              color: cell.inMonth ? '#1A1726' : '#A5A1BE',
              transition: 'background .1s, box-shadow .1s',
              borderRight: col === 6 ? 'none' : '0.5px solid var(--border-1)',
              borderBottom: row === 5 ? 'none' : '0.5px solid var(--border-1)',
              textAlign: 'left',
            }}
          >
            <span style={{
              alignSelf: 'center',
              width: isToday || isSel ? 24 : 'auto',
              height: isToday || isSel ? 24 : 'auto',
              borderRadius: '50%',
              background: isSel ? 'var(--purple-600)' : isToday ? 'var(--purple-100)' : 'transparent',
              color: isSel ? 'white' : isToday ? 'var(--purple-700)' : cell.inMonth ? '#1A1726' : '#A5A1BE',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: isToday || isSel ? 800 : 600,
              marginBottom: 0,
            }}>{cell.day}</span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              {dayEvents.slice(0, 3).map((event) => (
                <MonthEventChip key={event.id} event={event} />
              ))}
              {dayEvents.length > 3 && (
                <span style={{ fontSize: 10, color: '#57517E', fontWeight: 800, paddingLeft: 2 }}>{dayEvents.length - 3} more</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function MonthEventChip({ event }) {
  return (
    <span style={{
      minHeight: 18,
      borderRadius: 5,
      padding: '3px 6px',
      background: `${event.color}12`,
      border: `0.5px solid ${event.color}22`,
      color: 'var(--text-1)',
      fontSize: 10.25,
      lineHeight: 1.2,
      fontWeight: 800,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      minWidth: 0,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: event.color, flexShrink: 0 }} />
      <span style={{ flexShrink: 0, color: '#57517E', fontWeight: 800 }}>{event.time}</span>
      <span style={{ display: 'block', minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.name}</span>
    </span>
  );
}

function CalendarLegend() {
  const items = [
    { label: 'Worship', color: '#7F77DD' },
    { label: 'Small Groups', color: '#1D9E75' },
    { label: 'Youth', color: '#D85A30' },
    { label: 'Outreach', color: '#E8B21A' },
    { label: 'Fellowship', color: '#4B8DD8' },
    { label: 'Events', color: '#E85D86' },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 14, marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        {items.map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#57517E', fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function WeekGrid({ viewDate, events, selectedDate, onSelectDate, onSelectEvent }) {
  const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 11);
  const days = Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  const hours = ['all-day', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM'];

  return (
    <div style={{ border: '0.5px solid var(--border-1)', borderRadius: 12, overflow: 'hidden', marginBottom: 28, background: 'var(--surface)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '64px repeat(7, 1fr)', borderBottom: '0.5px solid var(--border-1)' }}>
        <div />
        {days.map((day) => {
          const iso = toISODate(day);
          const active = iso === selectedDate;
          return (
            <button key={iso} onClick={() => onSelectDate(iso)} style={{
              padding: '10px 6px',
              textAlign: 'center',
              borderLeft: '0.5px solid var(--border-1)',
              background: active ? 'var(--purple-100)' : 'var(--surface)',
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#57517E', textTransform: 'uppercase' }}>
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: active ? 'var(--purple-700)' : 'var(--text-1)', marginTop: 3 }}>
                {day.getDate()}
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '64px repeat(7, 1fr)' }}>
        {hours.map((hour, row) => (
          <React.Fragment key={hour}>
            <div style={{
              minHeight: row === 0 ? 34 : 44,
              padding: '8px 8px',
              fontSize: 10,
              color: 'var(--text-3)',
              borderBottom: row === hours.length - 1 ? 'none' : '0.5px solid var(--border-1)',
              textAlign: 'right',
            }}>{hour}</div>
            {days.map((day) => {
              const iso = toISODate(day);
              const dayEvents = events.filter((event) => getEventISO(event) === iso);
              const matchingEvents = row === 0 ? [] : dayEvents.filter((event) => event.time.includes(hour.replace(' ', ':00 ')));
              return (
                <div key={`${iso}-${hour}`} style={{
                  minHeight: row === 0 ? 34 : 44,
                  borderLeft: '0.5px solid var(--border-1)',
                  borderBottom: row === hours.length - 1 ? 'none' : '0.5px solid var(--border-1)',
                  padding: 4,
                }}>
                  {matchingEvents.map((event) => (
                    <button key={event.id} onClick={() => { onSelectEvent(event.id); onSelectDate(iso); }} style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: 6,
                      background: `${event.color}18`,
                      color: 'var(--text-1)',
                      fontSize: 10.5,
                      fontWeight: 800,
                      textAlign: 'left',
                      border: `0.5px solid ${event.color}35`,
                    }}>
                      <span style={{ color: event.color }}>{event.time}</span>
                      <br />
                      {event.name}
                    </button>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function AgendaView({ events, selectedId, onSelect, onSelectDate }) {
  const grouped = events.reduce((acc, event) => {
    const key = getEventISO(event);
    acc[key] = [...(acc[key] || []), event];
    return acc;
  }, {});

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '285px minmax(0, 1fr)', gap: 24, marginBottom: 28, alignItems: 'start' }}>
      <div style={{ border: '0.5px solid var(--border-1)', borderRadius: 12, padding: 18, background: 'var(--surface)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>May 2026</div>
        <MiniMonthGrid viewDate={INITIAL_MONTH} events={events} onSelectDate={onSelectDate} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {Object.entries(grouped).map(([dateISO, dayEvents]) => (
          <div key={dateISO}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#57517E', marginBottom: 8 }}>
              {new Date(`${dateISO}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dayEvents.map((event) => (
                <button key={event.id} onClick={() => { onSelect(event.id); onSelectDate(dateISO); }} style={{
                  display: 'grid',
                  gridTemplateColumns: '84px 1fr auto',
                  alignItems: 'center',
                  gap: 14,
                  padding: '13px 16px',
                  borderRadius: 10,
                  border: selectedId === event.id ? '1px solid rgba(83,74,183,.28)' : '0.5px solid var(--border-1)',
                  background: 'var(--surface)',
                  boxShadow: 'var(--shadow-sm)',
                  textAlign: 'left',
                }}>
                  <div style={{ fontSize: 12, color: '#57517E', fontWeight: 700 }}>{event.time}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{event.name}</div>
                    <div style={{ fontSize: 12, color: '#57517E' }}><i className="ti ti-map-pin" style={{ fontSize: 12, marginRight: 4 }} />{event.location}</div>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: event.color }} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniMonthGrid({ viewDate, events, onSelectDate }) {
  const labels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const eventDays = new Set(events.map(getEventISO));
  const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const totalDays = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const previousMonthDays = new Date(viewDate.getFullYear(), viewDate.getMonth(), 0).getDate();
  const leading = first.getDay();
  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = i - leading + 1;
    if (day < 1) {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, previousMonthDays + day);
      return { date, day: date.getDate(), inMonth: false };
    }
    if (day > totalDays) {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, day - totalDays);
      return { date, day: date.getDate(), inMonth: false };
    }
    return { date: new Date(viewDate.getFullYear(), viewDate.getMonth(), day), day, inMonth: true };
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 7 }}>
      {labels.map((label) => (
        <div key={label} style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, color: '#57517E' }}>{label}</div>
      ))}
      {cells.map((cell) => {
        const isoDate = toISODate(cell.date);
        const hasEvents = eventDays.has(isoDate);
        const selected = isoDate === INITIAL_SELECTED_DATE;
        return (
          <button key={isoDate} onClick={() => onSelectDate(isoDate)} disabled={!cell.inMonth} style={{
            height: 28,
            borderRadius: 7,
            color: selected ? 'white' : cell.inMonth ? '#57517E' : '#A5A1BE',
            background: selected ? 'var(--purple-600)' : 'transparent',
            fontSize: 12,
            fontWeight: selected ? 800 : 600,
            position: 'relative',
          }}>
            {cell.day}
            {hasEvents && (
              <span style={{
                position: 'absolute',
                left: '50%',
                bottom: 2,
                width: 4,
                height: 4,
                borderRadius: '50%',
                transform: 'translateX(-50%)',
                background: selected ? 'white' : 'var(--purple-600)',
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

function EventList({ events, selectedId, selectedDate, loading, onSelect, onSeeAll }) {
  const heading = selectedDate ? `Upcoming - ${formatShortDate(selectedDate)}` : 'Upcoming - all month';

  return (
    <div>
      <div style={{
        fontSize: 15, color: '#57517E', marginBottom: 12,
        display: 'flex', justifyContent: 'space-between',
        letterSpacing: '-.1px', fontWeight: 700,
      }}>
        <span>{heading}</span>
        {selectedDate && (
          <button type="button" onClick={onSeeAll} style={{ color: 'var(--purple-600)', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
            See all
          </button>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading && <div style={{ fontSize: 12, color: 'var(--text-3)', padding: '14px 2px' }}>Loading events...</div>}
        {!loading && events.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-3)', padding: '14px 2px' }}>No events scheduled for this date.</div>}
        {events.map((ev) => {
          const isSel = ev.id === selectedId;
          const openSeats = ev.drivers.reduce((sum, driver) => sum + driver.seatsTotal - driver.seatsTaken, 0);
          return (
            <button key={ev.id} onClick={() => onSelect(ev.id)} style={{
              display: 'grid',
              gridTemplateColumns: '5px 54px 1fr auto 16px',
              alignItems: 'center',
              gap: 16,
              padding: '16px 18px 16px 0',
              minHeight: 88,
              border: isSel ? '1px solid rgba(83,74,183,.22)' : '0.5px solid var(--border-1)',
              background: isSel ? 'linear-gradient(0deg, rgba(127,119,221,.05), rgba(127,119,221,.05)), var(--surface)' : 'var(--surface)',
              borderRadius: 12,
              width: '100%', textAlign: 'left',
              transition: 'all .12s',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden',
            }}>
              <div style={{ width: 5, height: 58, borderRadius: 5, background: ev.color, justifySelf: 'start' }} />
              <div style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: `${ev.color}18`,
                color: ev.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                justifySelf: 'center',
              }}>
                <i className="ti ti-calendar-event" style={{ fontSize: 20 }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-.2px', color: 'var(--text-1)', marginBottom: 4 }}>{ev.name}</div>
                <div style={{ fontSize: 13, color: '#57517E', marginBottom: 4 }}>{ev.date.replace(', 2026', '')} - {ev.time}</div>
                <div style={{ fontSize: 12.5, color: '#57517E', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <i className="ti ti-map-pin" style={{ fontSize: 13 }} />
                  {ev.location}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <AvatarCluster count={Math.min(3, Math.max(1, ev.drivers.length))} />
                <div style={{ fontSize: 12.5, color: '#57517E', whiteSpace: 'nowrap' }}>{ev.attending} attending</div>
                {openSeats > 0 && <Pill kind="open">{openSeats} open</Pill>}
              </div>
              <i className="ti ti-chevron-right" style={{ fontSize: 18, color: '#57517E', flexShrink: 0 }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AvatarCluster({ count }) {
  const colors = ['#F4E9DD', '#DCEAF9', '#E8E1FA'];
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: colors[i % colors.length],
          border: '2px solid white',
          marginLeft: i === 0 ? 0 : -8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#26215C',
          fontSize: 10,
          fontWeight: 800,
        }}>
          {String.fromCharCode(65 + i)}
        </div>
      ))}
    </div>
  );
}

function EmptyEventDetail({ selectedDate }) {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: 'var(--r-lg)',
      border: '0.5px solid var(--border-1)',
      padding: '18px', boxShadow: 'var(--shadow-sm)',
      color: 'var(--text-2)', fontSize: 12.5,
    }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>No event selected</div>
      {selectedDate ? `There are no rides scheduled on ${formatShortDate(selectedDate)}.` : 'Choose a date or add an event to start coordinating rides.'}
    </div>
  );
}

function AddEventModal({ defaultDate, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [dateISO, setDateISO] = useState(defaultDate);
  const [time, setTime] = useState('10:00 AM');
  const [duration, setDuration] = useState('1 hour');
  const [location, setLocation] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const valid = name.trim() && dateISO;

  return (
    <ModalShell
      title="Add event"
      subtitle="Create a calendar event so riders and drivers can coordinate."
      onClose={onClose}
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btnGhost({})}>Cancel</button>
          <button
            onClick={() => valid && onSubmit({ name, dateISO, time, duration, location, color })}
            disabled={!valid}
            style={btnPrimary({ disabled: !valid })}
          >
            Add event
          </button>
        </div>
      }
    >
      <Field label="Event name">
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Prayer night" style={inputStyle()} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Date">
          <input type="date" value={dateISO} onChange={(e) => setDateISO(e.target.value)} style={inputStyle()} />
        </Field>
        <Field label="Time">
          <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="10:00 AM" style={inputStyle()} />
        </Field>
      </div>
      <Field label="Location">
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="TBD" style={inputStyle()} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Duration">
          <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="1 hour" style={inputStyle()} />
        </Field>
        <Field label="Color">
          <select value={color} onChange={(e) => setColor(e.target.value)} style={inputStyle()}>
            {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>
    </ModalShell>
  );
}

function EventDetail({ event, canDrive, onOpenRider, onOpenDriver }) {
  const totalSeats = event.drivers.reduce((s, d) => s + d.seatsTotal, 0);
  const takenSeats = event.drivers.reduce((s, d) => s + d.seatsTaken, 0);
  const openSeats = totalSeats - takenSeats;

  return (
    <div>
      <div style={{
        background: 'var(--surface)', borderRadius: 'var(--r-lg)',
        border: '0.5px solid var(--border-1)',
        overflow: 'hidden', marginBottom: 14,
        boxShadow: '0 10px 28px rgba(20,18,38,.06)',
      }}>
        <div style={{ height: 5, background: 'var(--purple-600)' }} />
        <div style={{ padding: '22px 22px 24px' }}>
          <div style={{ fontSize: 12, letterSpacing: '.8px', color: '#57517E', textTransform: 'uppercase', fontWeight: 800, marginBottom: 12 }}>Event details</div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.6px', marginBottom: 12, lineHeight: 1.15 }}>{event.name}</div>
          <div style={{ fontSize: 14, color: '#57517E', display: 'flex', alignItems: 'center', gap: 9 }}>
            <i className="ti ti-calendar" style={{ fontSize: 17, color: 'var(--purple-600)' }} />
            {event.date.replace(', 2026', '')}, 2026 - {event.time}
          </div>

          <div style={{ height: '0.5px', background: 'var(--border-1)', margin: '22px 0 18px' }} />

          <div style={{ fontSize: 12, letterSpacing: '.8px', color: '#57517E', textTransform: 'uppercase', fontWeight: 800, marginBottom: 14 }}>Location & info</div>
          <InfoRow icon="ti-map-pin" text={event.location} />
          <InfoRow icon="ti-clock" text={`Approx. ${event.duration}`} />
          <InfoRow icon="ti-users" text={`${event.attending} members attending`} />

          <button style={{
            width: '100%',
            height: 48,
            marginTop: 18,
            borderRadius: 'var(--r-md)',
            border: '0.5px solid rgba(83,74,183,.18)',
            background: 'linear-gradient(0deg, rgba(127,119,221,.06), rgba(127,119,221,.06)), var(--surface)',
            color: 'var(--purple-700)',
            fontSize: 14,
            fontWeight: 800,
          }}>View event details</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={onOpenRider} style={{ ...btnPrimary({ block: true }), height: 52, fontSize: 15, borderRadius: 11 }} disabled={totalSeats > 0 && openSeats === 0}>
          <i className="ti ti-user-plus" style={{ fontSize: 14, verticalAlign: -2, marginRight: 6 }} />
          {totalSeats > 0 && openSeats === 0 ? 'All seats taken' : 'Sign up as rider'}
        </button>

        {canDrive ? (
          <button onClick={onOpenDriver} style={{ ...btnGhost({ block: true }), height: 48 }}>
            <i className="ti ti-steering-wheel" style={{ fontSize: 14, verticalAlign: -2, marginRight: 6 }} />
            Offer to drive
          </button>
        ) : null}
      </div>
    </div>
  );
}

function InfoRow({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: '#57517E', marginBottom: 15 }}>
      <i className={`ti ${icon}`} style={{ fontSize: 17, color: 'var(--purple-600)', flexShrink: 0 }} />
      <span>{text}</span>
    </div>
  );
}
