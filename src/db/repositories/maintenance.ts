import { db } from '../client';
import { checkIns, habits, reflections } from '../schema';
import { WEEKDAYS, addDays, type DateKey } from '@/domain/dates';
import { createHabit } from './habits';
import { setCheckIn } from './checkins';

/** Wipes every row. Used by the developer tools and a future "start over". */
export function deleteAllData(): void {
  db.delete(checkIns).run();
  db.delete(reflections).run();
  db.delete(habits).run();
}

const DEMO_HABITS = [
  {
    name: 'Read 10 pages',
    fullVersion: 'Read ten pages before bed',
    minVersion: 'Read one page',
    cue: 'After I pour my evening tea',
    identity: 'Someone who reads every day',
    reminderTime: '21:00',
    repeatMask: 127,
    /** Deterministic pattern: mostly kept, one miss. */
    pattern: [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
  },
  {
    name: 'Walk outside',
    fullVersion: 'Walk for twenty minutes',
    minVersion: 'Step outside for two minutes',
    cue: 'After lunch',
    identity: 'Someone who moves daily',
    reminderTime: '13:00',
    repeatMask: 127,
    pattern: [1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0],
  },
  {
    name: 'Tidy the kitchen',
    fullVersion: 'Clear the counters and wash up',
    minVersion: 'Put three things away',
    cue: 'Before I start work',
    identity: 'Someone who starts from calm',
    reminderTime: null,
    repeatMask: WEEKDAYS,
    pattern: [1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
  },
] as const;

/** Fills the notebook with a believable two weeks, for development only. */
export function seedDemoData(today: DateKey): void {
  DEMO_HABITS.forEach((demo, habitIndex) => {
    const habit = createHabit(
      {
        name: demo.name,
        fullVersion: demo.fullVersion,
        minVersion: demo.minVersion,
        cue: demo.cue,
        identity: demo.identity,
        reminderTime: demo.reminderTime,
        repeatMask: demo.repeatMask,
      },
      addDays(today, -14),
    );

    demo.pattern.forEach((value, dayIndex) => {
      if (value === 0) return;
      const date = addDays(today, -(14 - dayIndex));
      const status = (dayIndex + habitIndex) % 7 === 0 ? 'minimum' : 'full';
      setCheckIn(habit.id, date, status);
    });
  });
}
