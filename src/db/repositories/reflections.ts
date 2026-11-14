import { and, eq } from 'drizzle-orm';

import { db } from '../client';
import { reflections, type ReasonTag, type Reflection } from '../schema';

export function listReflectionsForWeek(weekStart: string): Reflection[] {
  return db.select().from(reflections).where(eq(reflections.weekStart, weekStart)).all();
}

export function setReflection(weekStart: string, habitId: number, reasonTag: ReasonTag): void {
  db.insert(reflections)
    .values({ weekStart, habitId, reasonTag, createdAt: new Date().toISOString() })
    .onConflictDoUpdate({
      target: [reflections.weekStart, reflections.habitId],
      set: { reasonTag, createdAt: new Date().toISOString() },
    })
    .run();
}

export function clearReflection(weekStart: string, habitId: number): void {
  db.delete(reflections)
    .where(and(eq(reflections.weekStart, weekStart), eq(reflections.habitId, habitId)))
    .run();
}
