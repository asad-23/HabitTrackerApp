import type { CheckIn, Habit } from '@/db/schema';
import { ALL_DAYS } from '@/domain/dates';
import { buildPlan } from './plan';

function habit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 1,
    name: 'Read 10 pages',
    fullVersion: 'Read ten pages',
    minVersion: 'Read one page',
    cue: 'After I pour my coffee',
    identity: 'A reader',
    reminderTime: '08:00',
    repeatMask: ALL_DAYS,
    startDate: '2026-01-01',
    createdAt: '2026-01-01T08:00:00.000Z',
    archivedAt: null,
    archivedOn: null,
    sortOrder: 1,
    ...overrides,
  };
}

function checkIn(date: string, habitId = 1): CheckIn {
  return {
    id: 1,
    habitId,
    date,
    status: 'full',
    note: null,
    createdAt: `${date}T08:00:00.000Z`,
  };
}

describe('buildPlan', () => {
  const today = '2026-11-14';
  const now = new Date(2026, 10, 14, 7, 0, 0);

  it('schedules reminders for the next seven scheduled days', () => {
    const plan = buildPlan({
      habits: [habit()],
      checkIns: new Map(),
      today,
      now,
      reflectionTime: '19:30',
      defaultReminderTime: '08:00',
    });

    const reminders = plan.filter((item) => item.kind === 'habit');
    // Today belongs to the rescue, so the plain reminders start tomorrow.
    expect(reminders).toHaveLength(6);
    expect(reminders[0]?.date.getDate()).toBe(15);
    expect(reminders[0]?.date.getHours()).toBe(8);
    expect(reminders[0]?.url).toBe('twice://today');
  });

  it('replaces a habit reminder with a rescue on the same day', () => {
    const plan = buildPlan({
      habits: [habit()],
      checkIns: new Map(),
      today,
      now,
      reflectionTime: '19:30',
      defaultReminderTime: '08:00',
    });

    const rescues = plan.filter((item) => item.kind === 'rescue');
    expect(rescues).toHaveLength(1);
    expect(rescues[0]?.title).toBe('Yesterday slipped by');
    // The rescue takes today's slot, so the plain reminder is not duplicated.
    expect(plan.filter((item) => item.id === `habit-1-${today}`)).toHaveLength(0);
  });

  it('stays quiet when the previous scheduled day was kept', () => {
    const plan = buildPlan({
      habits: [habit()],
      checkIns: new Map([[`1:2026-11-13`, checkIn('2026-11-13')]]),
      today,
      now,
      reflectionTime: '19:30',
      defaultReminderTime: '08:00',
    });

    expect(plan.filter((item) => item.kind === 'rescue')).toHaveLength(0);
  });

  it('adds the Sunday reflection when it falls in the window', () => {
    const plan = buildPlan({
      habits: [],
      checkIns: new Map(),
      today,
      now,
      reflectionTime: '19:30',
      defaultReminderTime: '08:00',
    });

    expect(plan).toHaveLength(1);
    expect(plan[0]?.kind).toBe('reflect');
    expect(plan[0]?.url).toBe('twice://reflect');
  });

  it('uses the default time when a habit has no reminder of its own', () => {
    const plan = buildPlan({
      habits: [habit({ reminderTime: null })],
      checkIns: new Map([[`1:2026-11-13`, checkIn('2026-11-13')]]),
      today,
      now,
      reflectionTime: '19:30',
      defaultReminderTime: '09:15',
    });

    const reminders = plan.filter((item) => item.kind === 'habit');
    expect(reminders.length).toBeGreaterThan(0);
    expect(reminders[0]?.date.getHours()).toBe(9);
    expect(reminders[0]?.date.getMinutes()).toBe(15);
  });

  it('keeps a habit’s own time ahead of the default', () => {
    const plan = buildPlan({
      habits: [habit({ reminderTime: '06:30' })],
      checkIns: new Map([[`1:2026-11-13`, checkIn('2026-11-13')]]),
      today,
      now,
      reflectionTime: '19:30',
      defaultReminderTime: '09:15',
    });

    const reminders = plan.filter((item) => item.kind === 'habit');
    expect(reminders[0]?.date.getHours()).toBe(6);
    expect(reminders[0]?.date.getMinutes()).toBe(30);
  });

  it('stays quiet once today is already logged', () => {
    const plan = buildPlan({
      habits: [habit()],
      checkIns: new Map([[`1:${today}`, checkIn(today)]]),
      today,
      now,
      reflectionTime: '19:30',
      defaultReminderTime: '08:00',
    });

    expect(plan.filter((item) => item.kind === 'rescue')).toHaveLength(0);
    expect(plan.filter((item) => item.id === `habit-1-${today}`)).toHaveLength(0);
  });

  it('skips a future day that is already logged', () => {
    const plan = buildPlan({
      habits: [habit()],
      checkIns: new Map([
        [`1:2026-11-13`, checkIn('2026-11-13')],
        [`1:2026-11-15`, checkIn('2026-11-15')],
      ]),
      today,
      now,
      reflectionTime: '19:30',
      defaultReminderTime: '08:00',
    });

    expect(plan.filter((item) => item.id === 'habit-1-2026-11-15')).toHaveLength(0);
  });
});
