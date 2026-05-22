import { config } from 'dotenv';
config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import * as schema from './schema.js';
import { SEED_APPROVED, EVENTS, SEED_NOTIFICATIONS } from '../lib/data.js';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set. Run `vercel env pull` first.');
  process.exit(1);
}

const db = drizzle(neon(url), { schema });

async function main() {
  console.log('Truncating tables...');
  await db.execute(sql`TRUNCATE TABLE
    notification_reads,
    notifications,
    ride_signups,
    event_drivers,
    events,
    users
    RESTART IDENTITY CASCADE`);

  console.log('Seeding users...');
  const userRows = Object.entries(SEED_APPROVED).map(([email, info]) => ({
    email,
    name: info.name,
    role: info.role,
  }));
  const insertedUsers = await db.insert(schema.users).values(userRows).returning();
  const userByName = new Map(insertedUsers.map((u) => [u.name, u]));

  console.log('Seeding events + drivers...');
  for (const event of EVENTS) {
    const [insertedEvent] = await db
      .insert(schema.events)
      .values({
        name: event.name,
        dateISO: event.dateISO,
        time: event.time,
        duration: event.duration,
        location: event.location,
        attending: event.attending,
        color: event.color,
      })
      .returning();

    for (const driver of event.drivers) {
      const user = userByName.get(driver.name);
      if (!user) {
        console.warn(`  skipping driver ${driver.name} — no matching user`);
        continue;
      }
      await db.insert(schema.eventDrivers).values({
        eventId: insertedEvent.id,
        userId: user.id,
        seatsTotal: driver.seatsTotal,
      });
    }
  }

  console.log('Seeding notifications...');
  const eventRows = await db.select().from(schema.events);
  const eventByName = new Map(eventRows.map((e) => [e.name, e]));
  const sourceEventById = new Map(EVENTS.map((e) => [e.id, e]));

  for (const n of SEED_NOTIFICATIONS) {
    let eventId = null;
    if (n.scope === 'event' && n.eventId) {
      const sourceEvent = sourceEventById.get(n.eventId);
      eventId = sourceEvent ? eventByName.get(sourceEvent.name)?.id ?? null : null;
    }
    await db.insert(schema.notifications).values({
      scope: n.scope,
      eventId,
      title: n.title,
      body: n.body,
      sentAt: new Date(n.sentAt),
    });
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
