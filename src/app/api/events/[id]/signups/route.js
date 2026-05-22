import { NextResponse } from 'next/server';
import { getSession } from '@/lib/server/session';
import { createSignup } from '@/lib/server/signups';

export async function POST(request, ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Sign in to reserve a ride.' }, { status: 401 });
  }

  const { id: eventId } = await ctx.params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  try {
    const signup = await createSignup(eventId, body, session);
    return NextResponse.json({ signup }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err?.message ?? 'Server error' },
      { status: err?.status ?? 500 },
    );
  }
}
