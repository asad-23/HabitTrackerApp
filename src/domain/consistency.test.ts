import type { CheckIn, CheckInStatus } from '@/db/schema';
import {
  checkInsToMap,
  computeConsistency,
  findRescueMiss,
  growthStage,
  weekSummary,
} from './consistency';
import { ALL_DAYS, WEEKDAYS } from './dates';

const habit = {
  id: 1,
  startDate: '2026-01-01',
  archivedOn: null,
  repeatMask: ALL_DAYS,
};

let nextId = 1;

function entry(date: string, status: CheckInStatus, habitId = 1): CheckIn {
  return {
    id: nextId++,
    habitId,
    date,
    status,
    note: null,
    createdAt: `${date}T12:00:00.000Z`,
  };
}

describe('computeConsistency', () => {
  const today = '2026-11-14';

  it('counts a skipped day out of the denominator', () => {
    const map = checkInsToMap([
      entry('2026-11-10', 'full'),
      entry('2026-11-11', 'minimum'),
      entry('2026-11-12', 'skipped'),
      // 11-13 missed
      // 11-14 today, not logged yet
    ]);

    expect(computeConsistency(habit, map, today, 5)).toEqual({
      denominator: 3,
      completed: 2,
      score: 67,
    });
  });

  it('counts today once it is logged', () => {
    const map = checkInsToMap([
      entry('2026-11-10', 'full'),
      entry('2026-11-11', 'minimum'),
      entry('2026-11-12', 'skipped'),
      entry('2026-11-14', 'full'),
    ]);

    expect(computeConsistency(habit, map, today, 5)).toEqual({
      denominator: 4,
      completed: 3,
      score: 75,
    });
  });

  it('ignores days the habit was not scheduled', () => {
    const weekdaysOnly = { ...habit, repeatMask: WEEKDAYS };
    const map = checkInsToMap([entry('2026-11-12', 'full'), entry('2026-11-13', 'full')]);

    // 11-10..11-14 runs Tuesday to Saturday. With Sunday–Thursday weekdays,
    // only Tuesday, Wednesday, and Thursday are scheduled; Friday is ignored.
    expect(computeConsistency(weekdaysOnly, map, today, 5)).toEqual({
      denominator: 3,
      completed: 1,
      score: 33,
    });
  });

  it('returns null when there is nothing to measure', () => {
    expect(computeConsistency(habit, new Map(), '2026-11-14', 1)).toEqual({
      denominator: 0,
      completed: 0,
      score: null,
    });
  });
});

describe('growthStage', () => {
  it('maps scores to five plant stages', () => {
    expect(growthStage(null)).toBe(0);
    expect(growthStage(0)).toBe(0);
    expect(growthStage(10)).toBe(1);
    expect(growthStage(35)).toBe(2);
    expect(growthStage(55)).toBe(3);
    expect(growthStage(75)).toBe(4);
    expect(growthStage(95)).toBe(5);
  });
});

describe('findRescueMiss', () => {
  it('finds yesterday when it was missed', () => {
    expect(findRescueMiss(habit, new Map(), '2026-11-14')).toEqual({
      date: '2026-11-13',
      wasYesterday: true,
    });
  });

  it('stays quiet when the last scheduled day was kept', () => {
    const map = checkInsToMap([entry('2026-11-13', 'full')]);
    expect(findRescueMiss(habit, map, '2026-11-14')).toBeNull();
  });

  it('treats a skip as a deliberate rest', () => {
    const map = checkInsToMap([entry('2026-11-13', 'skipped')]);
    expect(findRescueMiss(habit, map, '2026-11-14')).toBeNull();
  });

  it('marks an older miss as not yesterday', () => {
    const mondaysOnly = { ...habit, repeatMask: 0b0000001 };
    expect(findRescueMiss(mondaysOnly, new Map(), '2026-11-14')).toEqual({
      date: '2026-11-09',
      wasYesterday: false,
    });
  });
});

describe('weekSummary', () => {
  it('summarises a completed week', () => {
    const map = checkInsToMap([
      entry('2026-11-09', 'full'),
      entry('2026-11-10', 'minimum'),
      entry('2026-11-11', 'skipped'),
    ]);

    const summary = weekSummary([habit], map, '2026-11-09');
    expect(summary.scheduled).toBe(6);
    expect(summary.completed).toBe(2);
    expect(summary.missed).toHaveLength(4);
  });

  it('leaves today neutral until it is logged', () => {
    const map = checkInsToMap([entry('2026-11-09', 'full'), entry('2026-11-10', 'minimum')]);

    const summary = weekSummary([habit], map, '2026-11-09', '2026-11-11', '2026-11-11');
    expect(summary.scheduled).toBe(3);
    expect(summary.completed).toBe(2);
    expect(summary.missed).toHaveLength(0);
  });

  it('does not count days that have not happened yet', () => {
    const map = checkInsToMap([
      entry('2026-11-09', 'full'),
      entry('2026-11-10', 'minimum'),
      entry('2026-11-11', 'skipped'),
    ]);

    const summary = weekSummary([habit], map, '2026-11-09', '2026-11-11');
    expect(summary.scheduled).toBe(2);
    expect(summary.completed).toBe(2);
    expect(summary.missed).toHaveLength(0);
  });
});
