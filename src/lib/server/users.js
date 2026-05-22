import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';

export async function findOrCreateUserByEmail(email, fallbackName) {
  const normalized = email.trim().toLowerCase();
  const [existing] = await db.select().from(users).where(eq(users.email, normalized));
  if (existing) {
    await db.update(users).set({ lastSeen: new Date() }).where(eq(users.id, existing.id));
    return existing;
  }
  const name = (fallbackName?.trim() || normalized.split('@')[0]).slice(0, 80);
  const [created] = await db
    .insert(users)
    .values({ email: normalized, name, role: 'member', lastSeen: new Date() })
    .returning();
  return created;
}

export async function findUserById(id) {
  if (!id) return null;
  const [row] = await db.select().from(users).where(eq(users.id, id));
  return row ?? null;
}
