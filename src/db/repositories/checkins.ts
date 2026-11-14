import { and, asc, eq, gte, lte } from 'drizzle-orm';

import { db } from '../client';
import { checkIns, type CheckIn, type CheckInStatus } from '../schema';

export function listCheckInsForDate(date: string): CheckIn[] {
  return db.select().from(checkIns).where(eq(checkIns.date, date)).all();
}

export function listCheckInsForRange(start: string, end: string): CheckIn[] {
  return db
    .select()
    .from(checkIns)
    .where(and(gte(checkIns.date, start), lte(checkIns.date, end)))
    .orderBy(asc(checkIns.date))
    .all();
}

export function getCheckIn(habitId: number, date: string): CheckIn | null {
  return (
    db
      .select()
      .from(checkIns)
      .where(and(eq(checkIns.habitId, habitId), eq(checkIns.date, date)))
      .get() ?? null
  );
}

export function setCheckIn(
  habitId: number,
  date: string,
  status: CheckInStatus,
  note: string | null = null,
): void {
  const createdAt = new Date().toISOString();
  db.insert(checkIns)
    .values({ habitId, date, status, note, createdAt })
    .onConflictDoUpdate({
      target: [checkIns.habitId, checkIns.date],
      set: { status, note, createdAt },
    })
    .run();
}

export function clearCheckIn(habitId: number, date: string): void {
  db.delete(checkIns)
    .where(and(eq(checkIns.habitId, habitId), eq(checkIns.date, date)))
    .run();
}
