import { NextResponse } from 'next/server';
import { createEvent, listEvents } from '@/lib/server/events';
import { requireRole } from '@/lib/server/session';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const events = await listEvents({
    month: searchParams.get('month') ?? undefined,
    day: searchParams.get('day') ?? undefined,
  });
  return NextResponse.json({ events });
}

export async function POST(request) {
  try {
    await requireRole('admin');
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: err.status ?? 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  try {
    const event = await createEvent(body);
    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err?.message ?? 'Server error' },
      { status: err?.status ?? 500 },
    );
  }
}
