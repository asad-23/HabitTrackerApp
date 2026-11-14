import type { CheckIn, Habit } from '@/db/schema';
import { addDays, isHabitScheduledOn, rangeDays, type DateKey } from './dates';

export const CONSISTENCY_WINDOW_DAYS = 30;

export type Consistency = {
  /** Days the habit was scheduled in the window, excluding skips. */
  denominator: number;
  completed: number;
  /** 0–100, or null when there is nothing to measure yet. */
  score: number | null;
};

type HabitLike = Pick<Habit, 'id' | 'startDate' | 'archivedOn' | 'repeatMask'>;

/** Only one entry per habit and date exists, enforced by a unique index. */
export function checkInsToMap(checkIns: CheckIn[]): Map<string, CheckIn> {
  const map = new Map<string, CheckIn>();
  for (const checkIn of checkIns) map.set(`${checkIn.habitId}:${checkIn.date}`, checkIn);
  return map;
}

export function statusFor(
  map: Map<string, CheckIn>,
  habitId: number,
  date: DateKey,
): CheckIn['status'] | null {
  return map.get(`${habitId}:${date}`)?.status ?? null;
}

/**
 * A skipped day is a planned rest, so it leaves the denominator. Today is
 * neutral until it is logged: an unfinished day should never look like a miss.
 */
export function computeConsistency(
  habit: HabitLike,
  checkIns: Map<string, CheckIn>,
  today: DateKey,
  windowDays = CONSISTENCY_WINDOW_DAYS,
): Consistency {
  const start = addDays(today, -(windowDays - 1));
  let denominator = 0;
  let completed = 0;

  for (const date of rangeDays(start, today)) {
    if (!isHabitScheduledOn(habit, date)) continue;
    const status = statusFor(checkIns, habit.id, date);

    if (status === 'skipped') continue;
    if (status === null && date === today) continue;

    denominator += 1;
    if (status === 'full' || status === 'minimum') completed += 1;
  }

  return {
    denominator,
    completed,
    score: denominator === 0 ? null : Math.round((completed / denominator) * 100),
  };
}

/** Plant growth, 0–5, mapped from the consistency score. */
export function growthStage(score: number | null): number {
  if (score === null) return 0;
  if (score >= 90) return 5;
  if (score >= 70) return 4;
  if (score >= 50) return 3;
  if (score >= 30) return 2;
  if (score > 0) return 1;
  return 0;
}

export type MissedDay = {
  date: DateKey;
  /** True when it was the most recent scheduled day and nothing scheduled sat between. */
  wasYesterday: boolean;
};

/** The most recent scheduled day before today that was left unlogged. */
export function findRescueMiss(
  habit: HabitLike,
  checkIns: Map<string, CheckIn>,
  today: DateKey,
): MissedDay | null {
  const yesterday = addDays(today, -1);

  for (let offset = 1; offset <= CONSISTENCY_WINDOW_DAYS; offset += 1) {
    const date = addDays(today, -offset);
    if (!isHabitScheduledOn(habit, date)) continue;
    const status = statusFor(checkIns, habit.id, date);
    if (status === 'skipped' || status === 'full' || status === 'minimum') return null;
    return { date, wasYesterday: date === yesterday };
  }

  return null;
}

/** Habit-days completed in a week, used by the Sunday reflection. */
export function weekSummary(
  habits: HabitLike[],
  checkIns: Map<string, CheckIn>,
  weekStart: DateKey,
  until: DateKey = addDays(weekStart, 6),
  /** Today stays neutral until it is logged. Omit for a finished week. */
  today?: DateKey,
): { scheduled: number; completed: number; missed: { habitId: number; date: DateKey }[] } {
  const weekEnd = addDays(weekStart, 6);
  const last = until < weekEnd ? until : weekEnd;
  const dates = rangeDays(weekStart, last);
  let scheduled = 0;
  let completed = 0;
  const missed: { habitId: number; date: DateKey }[] = [];

  for (const habit of habits) {
    for (const date of dates) {
      if (!isHabitScheduledOn(habit, date)) continue;
      const status = statusFor(checkIns, habit.id, date);
      if (status === 'skipped') continue;
      scheduled += 1;
      if (status === 'full' || status === 'minimum') {
        completed += 1;
      } else if (status === null && date !== today) {
        missed.push({ habitId: habit.id, date });
      }
    }
  }

  return { scheduled, completed, missed };
}
