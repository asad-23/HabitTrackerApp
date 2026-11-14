import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';

import { listCheckInsForDate } from '@/db/repositories/checkins';
import { listActiveHabits } from '@/db/repositories/habits';
import type { CheckIn, Habit } from '@/db/schema';
import { todayKey } from '@/domain/dates';
import { TodayWidget } from './TodayWidget';

/** Pushes the home-screen widget in step with a check-in, without opening the app. */
export async function refreshTodayWidget(): Promise<void> {
  if (Platform.OS !== 'android') return;

  const today = todayKey();
  let habits: Habit[] = [];
  let rows: CheckIn[] = [];

  try {
    habits = listActiveHabits();
    rows = listCheckInsForDate(today);
  } catch {
    // The database has not been opened yet; the next refresh will catch up.
  }

  const checkInsByHabit: Record<number, CheckIn> = {};
  for (const row of rows) checkInsByHabit[row.habitId] = row;

  const dateLabel = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date());

  await requestWidgetUpdate({
    widgetName: 'Today',
    renderWidget: () => (
      <TodayWidget
        habits={habits}
        checkInsByHabit={checkInsByHabit}
        today={today}
        dateLabel={dateLabel}
      />
    ),
  }).catch(() => {
    // No widget on the home screen yet; nothing to refresh.
  });
}
