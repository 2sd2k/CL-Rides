import { NextResponse } from 'next/server';
import { EVENTS } from '@/lib/data';

let events = EVENTS.map((event) => ({ ...event }));

function getEventDate(event) {
  return event.dateISO || new Date(event.date).toISOString().slice(0, 10);
}

function eventMatchesMonth(event, month) {
  if (!month) return true;
  return getEventDate(event).startsWith(month);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  const day = searchParams.get('day');

  const filtered = events
    .filter((event) => eventMatchesMonth(event, month))
    .filter((event) => !day || getEventDate(event) === day)
    .sort((a, b) => `${getEventDate(a)} ${a.time}`.localeCompare(`${getEventDate(b)} ${b.time}`));

  return NextResponse.json({ events: filtered });
}

export async function POST(request) {
  if (request.headers.get('x-cl-rides-role') !== 'admin') {
    return NextResponse.json({ error: 'Only admins can add events.' }, { status: 403 });
  }

  const body = await request.json();
  const date = body.dateISO ? new Date(`${body.dateISO}T12:00:00`) : null;

  if (!body.name?.trim() || !body.dateISO || Number.isNaN(date?.getTime())) {
    return NextResponse.json({ error: 'Name and date are required.' }, { status: 400 });
  }

  const event = {
    id: `${body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now()}`,
    name: body.name.trim(),
    date: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    dateISO: body.dateISO,
    time: body.time || '10:00 AM',
    duration: body.duration || '1 hour',
    location: body.location || 'TBD',
    attending: Number(body.attending) || 0,
    color: body.color || '#7F77DD',
    drivers: [],
  };

  events = [...events, event];

  return NextResponse.json({ event }, { status: 201 });
}
