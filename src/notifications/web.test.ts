import type { PlannedNotification } from './plan';
import { clearWebNotifications, scheduleWebNotifications } from './web';

function planned(id: string, offsetMs: number): PlannedNotification {
  return {
    id,
    kind: 'habit',
    date: new Date(Date.now() + offsetMs),
    title: 'A nudge',
    body: 'A small version still counts.',
    url: 'twice://today',
  };
}

describe('scheduleWebNotifications', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    clearWebNotifications();
    jest.useRealTimers();
  });

  it('keeps future items and drops past or out-of-range ones', () => {
    const count = scheduleWebNotifications([
      planned('past', -60_000),
      planned('soon', 60_000),
      planned('next week', 7 * 24 * 60 * 60 * 1000 + 60_000),
    ]);

    expect(count).toBe(1);
  });

  it('replaces the previous plan instead of stacking timers', () => {
    expect(scheduleWebNotifications([planned('first', 60_000)])).toBe(1);
    expect(scheduleWebNotifications([planned('second', 60_000)])).toBe(1);
  });

  it('fires without throwing when a reminder comes due', () => {
    scheduleWebNotifications([planned('due', 1_000)]);
    expect(() => jest.advanceTimersByTime(1_000)).not.toThrow();
  });
});
