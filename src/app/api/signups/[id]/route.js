import { NextResponse } from 'next/server';
import { getSession } from '@/lib/server/session';
import { deleteSignup } from '@/lib/server/signups';

export async function DELETE(_request, ctx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    const signup = await deleteSignup(id, session);
    return NextResponse.json({ signup });
  } catch (err) {
    return NextResponse.json(
      { error: err?.message ?? 'Server error' },
      { status: err?.status ?? 500 },
    );
  }
}
