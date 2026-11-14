import { asc, eq, isNotNull, isNull, sql } from 'drizzle-orm';

import { db } from '../client';
import { habits, type Habit } from '../schema';
import type { DateKey } from '@/domain/dates';

export type HabitDraft = {
  name: string;
  fullVersion: string;
  minVersion: string;
  cue: string;
  identity: string;
  reminderTime: string | null;
  repeatMask: number;
  /** Defaults to the day the habit is created. */
  startDate?: DateKey;
};

export function listActiveHabits(): Habit[] {
  return db
    .select()
    .from(habits)
    .where(isNull(habits.archivedAt))
    .orderBy(asc(habits.sortOrder), asc(habits.id))
    .all();
}

export function listArchivedHabits(): Habit[] {
  return db
    .select()
    .from(habits)
    .where(isNotNull(habits.archivedAt))
    .orderBy(asc(habits.sortOrder), asc(habits.id))
    .all();
}

export function getHabit(id: number): Habit | null {
  return db.select().from(habits).where(eq(habits.id, id)).get() ?? null;
}

export function createHabit(draft: HabitDraft, today: string): Habit {
  const currentMax = db
    .select({ value: sql<number>`coalesce(max(${habits.sortOrder}), 0)` })
    .from(habits)
    .get();

  const { startDate, ...rest } = draft;

  const row = db
    .insert(habits)
    .values({
      ...rest,
      startDate: startDate ?? today,
      createdAt: new Date().toISOString(),
      sortOrder: (currentMax?.value ?? 0) + 1,
    })
    .returning()
    .get();

  if (!row) throw new Error('The habit could not be saved.');
  return row;
}

export function updateHabit(id: number, draft: HabitDraft): void {
  db.update(habits).set(draft).where(eq(habits.id, id)).run();
}

export function archiveHabit(id: number, today: string): void {
  db.update(habits)
    .set({ archivedAt: new Date().toISOString(), archivedOn: today })
    .where(eq(habits.id, id))
    .run();
}

export function restoreHabit(id: number): void {
  db.update(habits)
    .set({ archivedAt: null, archivedOn: null })
    .where(eq(habits.id, id))
    .run();
}
