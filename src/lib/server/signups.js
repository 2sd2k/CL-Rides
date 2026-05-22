import { and, asc, desc, eq, isNull, or, sql } from 'drizzle-orm';
import { db } from '@/db';
import { events, eventDrivers, rideSignups, users } from '@/db/schema';

function ownerFilter(session) {
  if (session.userId) return eq(rideSignups.userId, session.userId);
  if (session.guestKey) return eq(rideSignups.guestKey, session.guestKey);
  return null;
}

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

export async function createSignup(eventId, input, session) {
  const riderName = input?.riderName?.trim();
  const riderCount = Math.max(1, Math.min(8, Number(input?.riderCount) || 1));
  if (!riderName) throw badRequest('Rider name is required.');

  const [event] = await db.select().from(events).where(eq(events.id, eventId));
  if (!event) {
    const err = new Error('Event not found.');
    err.status = 404;
    throw err;
  }

  if (input?.driverId) {
    const rows = await db.execute(sql`
      INSERT INTO ride_signups (event_id, driver_id, user_id, guest_key, rider_name, phone, pickup, rider_count)
      SELECT ${eventId}, ${input.driverId},
             ${session.userId ?? null}, ${session.guestKey ?? null},
             ${riderName}, ${input.phone ?? null}, ${input.pickup ?? null}, ${riderCount}
      WHERE EXISTS (
        SELECT 1 FROM event_drivers d
        WHERE d.id = ${input.driverId} AND d.event_id = ${eventId}
      )
      AND (
        SELECT COALESCE(SUM(rider_count), 0) FROM ride_signups
        WHERE driver_id = ${input.driverId}
      ) + ${riderCount} <= (
        SELECT seats_total FROM event_drivers WHERE id = ${input.driverId}
      )
      RETURNING *;
    `);
    if (rows.rows.length === 0) {
      const err = new Error('Not enough seats with that driver.');
      err.status = 409;
      throw err;
    }
    return rows.rows[0];
  }

  const [inserted] = await db
    .insert(rideSignups)
    .values({
      eventId,
      driverId: null,
      userId: session.userId ?? null,
      guestKey: session.guestKey ?? null,
      riderName,
      phone: input.phone ?? null,
      pickup: input.pickup ?? null,
      riderCount,
    })
    .returning();
  return inserted;
}

export async function listMyRides(session) {
  const filter = ownerFilter(session);
  if (!filter) return [];

  const rows = await db
    .select({
      id: rideSignups.id,
      eventId: rideSignups.eventId,
      eventName: events.name,
      dateISO: events.dateISO,
      time: events.time,
      location: events.location,
      color: events.color,
      riderName: rideSignups.riderName,
      phone: rideSignups.phone,
      pickup: rideSignups.pickup,
      riderCount: rideSignups.riderCount,
      driverId: rideSignups.driverId,
      driverName: users.name,
      createdAt: rideSignups.createdAt,
    })
    .from(rideSignups)
    .innerJoin(events, eq(rideSignups.eventId, events.id))
    .leftJoin(eventDrivers, eq(rideSignups.driverId, eventDrivers.id))
    .leftJoin(users, eq(eventDrivers.userId, users.id))
    .where(filter)
    .orderBy(asc(events.dateISO), asc(events.time), desc(rideSignups.createdAt));

  return rows.map((row) => ({
    ...row,
    date: new Date(`${row.dateISO}T12:00:00Z`).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }),
  }));
}

export async function deleteSignup(signupId, session) {
  const isAdmin = session.role === 'admin';
  const baseWhere = isAdmin
    ? eq(rideSignups.id, signupId)
    : and(eq(rideSignups.id, signupId), ownerFilter(session) ?? sql`FALSE`);

  const deleted = await db.delete(rideSignups).where(baseWhere).returning();
  if (deleted.length === 0) {
    const err = new Error('Signup not found or not yours to remove.');
    err.status = 404;
    throw err;
  }
  return deleted[0];
}
