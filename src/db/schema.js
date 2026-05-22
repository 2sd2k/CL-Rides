import {
  pgTable,
  uuid,
  text,
  integer,
  date,
  timestamp,
  primaryKey,
  uniqueIndex,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('user_role', ['admin', 'driver', 'member']);
export const notificationScopeEnum = pgEnum('notification_scope', ['all', 'event']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: roleEnum('role').notNull().default('member'),
  phone: text('phone'),
  lastSeen: timestamp('last_seen', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  dateISO: date('date_iso').notNull(),
  time: text('time').notNull(),
  duration: text('duration').notNull().default('1 hour'),
  location: text('location').notNull().default('TBD'),
  attending: integer('attending').notNull().default(0),
  color: text('color').notNull().default('#7F77DD'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const eventDrivers = pgTable(
  'event_drivers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    seatsTotal: integer('seats_total').notNull().default(4),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    eventDriverUnique: uniqueIndex('event_drivers_event_user_unique').on(t.eventId, t.userId),
  }),
);

export const rideSignups = pgTable('ride_signups', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  driverId: uuid('driver_id').references(() => eventDrivers.id, { onDelete: 'set null' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  guestKey: text('guest_key'),
  riderName: text('rider_name').notNull(),
  phone: text('phone'),
  pickup: text('pickup'),
  riderCount: integer('rider_count').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  scope: notificationScopeEnum('scope').notNull(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  body: text('body').notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow().notNull(),
});

export const notificationReads = pgTable(
  'notification_reads',
  {
    notificationId: uuid('notification_id')
      .notNull()
      .references(() => notifications.id, { onDelete: 'cascade' }),
    ownerKey: text('owner_key').notNull(),
    readAt: timestamp('read_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.notificationId, t.ownerKey] }),
  }),
);
