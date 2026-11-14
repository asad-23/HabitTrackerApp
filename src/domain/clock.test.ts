import {
  clockText,
  readClock,
  setClockHour,
  setClockMeridiem,
  setClockMinute,
  shiftClockMinutes,
  writeClock,
} from './clock';

describe('readClock', () => {
  it('reads midnight as 12:00 AM', () => {
    expect(readClock('00:00')).toEqual({ hour12: 12, minute: 0, meridiem: 'AM' });
  });

  it('reads noon as 12:00 PM', () => {
    expect(readClock('12:00')).toEqual({ hour12: 12, minute: 0, meridiem: 'PM' });
  });

  it('reads the afternoon in 12-hour form', () => {
    expect(readClock('13:05')).toEqual({ hour12: 1, minute: 5, meridiem: 'PM' });
  });

  it('falls back to the morning default for empty or invalid values', () => {
    expect(readClock(null)).toEqual({ hour12: 8, minute: 0, meridiem: 'AM' });
    expect(readClock('25:99')).toEqual({ hour12: 8, minute: 0, meridiem: 'AM' });
  });
});

describe('writeClock', () => {
  it('round-trips every hour of the day', () => {
    for (let hour = 0; hour < 24; hour += 1) {
      const value = `${String(hour).padStart(2, '0')}:${String(hour % 60).padStart(2, '0')}`;
      expect(writeClock(readClock(value))).toBe(value);
    }
  });

  it('maps 12 AM back to midnight and 12 PM back to noon', () => {
    expect(writeClock({ hour12: 12, minute: 0, meridiem: 'AM' })).toBe('00:00');
    expect(writeClock({ hour12: 12, minute: 0, meridiem: 'PM' })).toBe('12:00');
  });

  it('keeps odd minutes instead of snapping to the nearest five', () => {
    expect(writeClock({ hour12: 9, minute: 47, meridiem: 'AM' })).toBe('09:47');
  });

  it('clamps out-of-range pieces', () => {
    expect(writeClock({ hour12: 0, minute: -4, meridiem: 'AM' })).toBe('01:00');
    expect(writeClock({ hour12: 15, minute: 70, meridiem: 'PM' })).toBe('12:59');
  });
});

describe('clock editing helpers', () => {
  it('changes only the hour or minute that was tapped', () => {
    expect(setClockHour('21:35', 7)).toBe('19:35');
    expect(setClockMinute('21:35', 10)).toBe('21:10');
    expect(setClockMeridiem('21:35', 'AM')).toBe('09:35');
  });

  it('wraps a one-minute step around midnight in both directions', () => {
    expect(shiftClockMinutes('23:59', 1)).toBe('00:00');
    expect(shiftClockMinutes('00:00', -1)).toBe('23:59');
    expect(shiftClockMinutes('09:47', 1)).toBe('09:48');
  });

  it('shows a compact twelve-hour label', () => {
    expect(clockText({ hour12: 9, minute: 5, meridiem: 'PM' })).toBe('9:05');
    expect(clockText({ hour12: 12, minute: 0, meridiem: 'AM' })).toBe('12:00');
  });
});
