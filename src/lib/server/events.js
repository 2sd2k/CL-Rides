import { and, asc, eq, gte, inArray, lt, sql } from 'drizzle-orm';
import { db } from '@/db';
import { events, eventDrivers, rideSignups, users } from '@/db/schema';

function formatDisplayDate(dateISO) {
  return new Date(`${dateISO}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function monthBounds(month) {
  const [y, m] = month.split('-').map(Number);
  const start = `${month}-01`;
  const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
  const end = `${nextMonth}-01`;
  return { start, end };
}

function buildEventFilter({ month, day }) {
  if (day) return eq(events.dateISO, day);
  if (month) {
    const { start, end } = monthBounds(month);
    return and(gte(events.dateISO, start), lt(events.dateISO, end));
  }
  return undefined;
}

async function loadDriversForEvents(eventIds) {
  if (eventIds.length === 0) return new Map();

  const rows = await db
    .select({
      id: eventDrivers.id,
      eventId: eventDrivers.eventId,
      seatsTotal: eventDrivers.seatsTotal,
      name: users.name,
      seatsTaken: sql`COALESCE(SUM(${rideSignups.riderCount}), 0)`.mapWith(Number),
    })
    .from(eventDrivers)
    .innerJoin(users, eq(eventDrivers.userId, users.id))
    .leftJoin(rideSignups, eq(rideSignups.driverId, eventDrivers.id))
    .where(inArray(eventDrivers.eventId, eventIds))
    .groupBy(eventDrivers.id, users.name);

  const byEvent = new Map();
  for (const row of rows) {
    const list = byEvent.get(row.eventId) ?? [];
    list.push({
      id: row.id,
      name: row.name,
      seatsTotal: row.seatsTotal,
      seatsTaken: row.seatsTaken,
    });
    byEvent.set(row.eventId, list);
  }
  return byEvent;
}

function toEventDTO(row, drivers) {
  return {
    id: row.id,
    name: row.name,
    date: formatDisplayDate(row.dateISO),
    dateISO: row.dateISO,
    time: row.time,
    duration: row.duration,
    location: row.location,
    attending: row.attending,
    color: row.color,
    drivers,
  };
}

export async function listEvents({ month, day } = {}) {
  const where = buildEventFilter({ month, day });
  const rows = await db
    .select()
    .from(events)
    .where(where)
    .orderBy(asc(events.dateISO), asc(events.time));

  const driversByEvent = await loadDriversForEvents(rows.map((r) => r.id));
  return rows.map((row) => toEventDTO(row, driversByEvent.get(row.id) ?? []));
}

export async function createEvent(input) {
  const name = input?.name?.trim();
  const dateISO = input?.dateISO;
  if (!name || !dateISO || Number.isNaN(new Date(`${dateISO}T12:00:00Z`).getTime())) {
    const err = new Error('Name and date are required.');
    err.status = 400;
    throw err;
  }

  const [inserted] = await db
    .insert(events)
    .values({
      name,
      dateISO,
      time: input.time || '10:00 AM',
      duration: input.duration || '1 hour',
      location: input.location || 'TBD',
      attending: Number(input.attending) || 0,
      color: input.color || '#7F77DD',
    })
    .returning();

  return toEventDTO(inserted, []);
}
