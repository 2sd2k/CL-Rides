import { NextResponse } from 'next/server';
import { getSession } from '@/lib/server/session';
import { listMyRides } from '@/lib/server/signups';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ rides: [] });
  }
  const rides = await listMyRides(session);
  return NextResponse.json({ rides });
}
