import { cookies } from 'next/headers';

const COOKIE_NAME = 'cl_session';
const ONE_WEEK = 60 * 60 * 24 * 7;

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ONE_WEEK,
  };
}

export async function getSession() {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function setSession(session) {
  const store = await cookies();
  store.set(COOKIE_NAME, JSON.stringify(session), cookieOptions());
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function requireRole(roles) {
  const session = await getSession();
  if (!session) {
    const err = new Error('Not signed in.');
    err.status = 401;
    throw err;
  }
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(session.role)) {
    const err = new Error('Forbidden.');
    err.status = 403;
    throw err;
  }
  return session;
}
