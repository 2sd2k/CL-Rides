import { NextResponse } from 'next/server';
import { clearSession, getSession, setSession } from '@/lib/server/session';
import { findOrCreateUserByEmail } from '@/lib/server/users';

export async function GET() {
  const session = await getSession();
  return NextResponse.json({ session });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (body?.guest) {
    const session = {
      role: 'guest',
      isGuest: true,
      guestKey: crypto.randomUUID(),
      name: 'Guest',
    };
    await setSession(session);
    return NextResponse.json({ session });
  }

  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
  }

  const user = await findOrCreateUserByEmail(email, body?.name);
  const session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isGuest: false,
  };
  await setSession(session);
  return NextResponse.json({ session });
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
