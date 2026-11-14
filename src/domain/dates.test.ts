import {
  addDays,
  daysBetween,
  formatRepeatDays,
  fromDateKey,
  isHabitScheduledOn,
  maskToIndexes,
  startOfWeek,
  toDateKey,
  todayKey,
  toggleDay,
  weekdayIndex,
  WEEKDAYS,
  WEEKENDS,
} from './dates';

describe('date keys', () => {
  it('round-trips a local date without shifting the day', () => {
    const date = new Date(2026, 10, 14, 23, 30);
    expect(toDateKey(date)).toBe('2026-11-14');
    expect(toDateKey(fromDateKey('2026-11-14'))).toBe('2026-11-14');
  });

  it('uses the local calendar day near midnight', () => {
    const lateNight = new Date(2026, 0, 1, 0, 5);
    expect(todayKey(lateNight)).toBe('2026-01-01');
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('counts whole days between dates', () => {
    expect(daysBetween('2026-11-01', '2026-11-14')).toBe(13);
    expect(daysBetween('2026-11-14', '2026-11-14')).toBe(0);
  });

  it('treats Sunday as the start of the week', () => {
    // 2026-11-14 is a Saturday.
    expect(weekdayIndex('2026-11-14')).toBe(5);
    expect(startOfWeek('2026-11-14')).toBe('2026-11-08');
    expect(startOfWeek('2026-11-08')).toBe('2026-11-08');
    expect(startOfWeek('2026-11-15')).toBe('2026-11-15');
  });
});

describe('repeat masks', () => {
  it('maps masks to weekday indexes', () => {
    expect(maskToIndexes(WEEKDAYS)).toEqual([0, 1, 2, 3, 6]);
    expect(maskToIndexes(WEEKENDS)).toEqual([4, 5]);
  });

  it('toggles days on and off', () => {
    expect(toggleDay(0, 2)).toBe(4);
    expect(toggleDay(4, 2)).toBe(0);
  });

  it('formats common schedules', () => {
    expect(formatRepeatDays(127)).toBe('Every day');
    expect(formatRepeatDays(WEEKDAYS)).toBe('Weekdays');
    expect(formatRepeatDays(WEEKENDS)).toBe('Weekends');
    expect(formatRepeatDays(0b0000101)).toBe('Mon, Wed');
  });
});

describe('scheduling', () => {
  const habit = { startDate: '2026-11-09', archivedOn: null, repeatMask: WEEKDAYS };

  it('does not schedule before the start date', () => {
    expect(isHabitScheduledOn(habit, '2026-11-08')).toBe(false);
    expect(isHabitScheduledOn(habit, '2026-11-09')).toBe(true);
  });

  it('does not schedule after archiving', () => {
    expect(isHabitScheduledOn({ ...habit, archivedOn: '2026-11-11' }, '2026-11-12')).toBe(false);
    expect(isHabitScheduledOn({ ...habit, archivedOn: '2026-11-11' }, '2026-11-11')).toBe(true);
  });

  it('respects the weekday mask', () => {
    expect(isHabitScheduledOn(habit, '2026-11-13')).toBe(false); // Friday
    expect(isHabitScheduledOn(habit, '2026-11-14')).toBe(false); // Saturday
    expect(isHabitScheduledOn(habit, '2026-11-15')).toBe(true); // Sunday
  });
});
