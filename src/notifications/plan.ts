import type { CheckIn, Habit } from '@/db/schema';
import {
  addDays,
  isHabitScheduledOn,
  rangeDays,
  timeToDate,
  upcomingSunday,
  type DateKey,
} from '@/domain/dates';
import { findRescueMiss } from '@/domain/consistency';

export const PLAN_DAYS = 7;
/** iOS keeps at most 64 pending notifications; leave room for the app's own. */
export const MAX_SCHEDULED = 60;

export type PlannedNotification = {
  /** Deterministic, so a rebuild replaces the previous plan cleanly. */
  id: string;
  kind: 'habit' | 'rescue' | 'reflect';
  date: Date;
  title: string;
  body: string;
  url: string;
};

type BuildPlanInput = {
  habits: Habit[];
  checkIns: Map<string, CheckIn>;
  today: DateKey;
  now: Date;
  reflectionTime: string;
  defaultReminderTime: string;
};

function isFuture(date: Date, now: Date): boolean {
  return date.getTime() > now.getTime() + 60_000;
}

function habitNotification(habit: Habit, date: Date, day: DateKey): PlannedNotification {
  return {
    id: `habit-${habit.id}-${day}`,
    kind: 'habit',
    date,
    title: habit.name,
    body: habit.cue || 'A small version still counts today.',
    url: 'twice://today',
  };
}

/**
 * A rolling seven-day plan. It is rebuilt whenever the notebook changes, so the
 * schedule always reflects the current habits instead of drifting for weeks.
 */
export function buildPlan({
  habits,
  checkIns,
  today,
  now,
  reflectionTime,
  defaultReminderTime,
}: BuildPlanInput): PlannedNotification[] {
  const planned: PlannedNotification[] = [];
  const rescueDays = new Set<string>();

  for (const habit of habits) {
    // Today is already handled, so a rescue nudge would only repeat itself.
    if (checkIns.has(`${habit.id}:${today}`)) continue;

    const miss = findRescueMiss(habit, checkIns, today);
    if (!miss) continue;

    const time = habit.reminderTime ?? defaultReminderTime;
    const when = timeToDate(time, now);
    if (!isFuture(when, now)) continue;

    rescueDays.add(`${habit.id}:${today}`);
    planned.push({
      id: `rescue-${habit.id}-${today}`,
      kind: 'rescue',
      date: when,
      title: miss.wasYesterday ? 'Yesterday slipped by' : 'Still here',
      body: miss.wasYesterday
        ? `One small version of “${habit.name}” is enough today.`
        : `“${habit.name}” is waiting whenever you are. The minimum counts.`,
      url: 'twice://today',
    });
  }

  for (const day of rangeDays(today, addDays(today, PLAN_DAYS - 1))) {
    for (const habit of habits) {
      if (!isHabitScheduledOn(habit, day)) continue;
      // A day that is already logged needs no nudge.
      if (checkIns.has(`${habit.id}:${day}`)) continue;
      if (rescueDays.has(`${habit.id}:${day}`)) continue;

      // A habit without its own time follows the default reminder time.
      const time = habit.reminderTime ?? defaultReminderTime;
      const when = timeToDate(time, new Date(`${day}T12:00:00`));
      if (!isFuture(when, now)) continue;
      planned.push(habitNotification(habit, when, day));
    }
  }

  const sunday = upcomingSunday(today);
  if (sunday <= addDays(today, PLAN_DAYS - 1)) {
    const when = timeToDate(reflectionTime, new Date(`${sunday}T12:00:00`));
    if (isFuture(when, now)) {
      planned.push({
        id: `reflect-${sunday}`,
        kind: 'reflect',
        date: when,
        title: 'A quiet look back',
        body: 'A few minutes to notice what helped this week.',
        url: 'twice://reflect',
      });
    }
  }

  return planned
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, MAX_SCHEDULED);
}
