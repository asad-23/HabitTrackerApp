import type { WidgetTaskHandler } from 'react-native-android-widget';

import { clearCheckIn, listCheckInsForDate, setCheckIn } from '@/db/repositories/checkins';
import { listActiveHabits } from '@/db/repositories/habits';
import type { CheckIn, Habit } from '@/db/schema';
import { todayKey } from '@/domain/dates';
import { TodayWidget } from './TodayWidget';

/**
 * Runs in a headless JS context when Android asks for a widget update or the
 * user taps a row. It talks to SQLite directly, so a check-in from the home
 * screen is already saved before the app is ever opened.
 */
export const widgetTaskHandler: WidgetTaskHandler = async ({
  widgetInfo,
  widgetAction,
  clickAction,
  clickActionData,
  renderWidget,
}) => {
  const today = todayKey();

  if (widgetAction === 'WIDGET_DELETED') return;

  try {
    if (widgetAction === 'WIDGET_CLICK' && clickAction === 'TOGGLE') {
      const habitId = Number(clickActionData?.habitId);
      if (Number.isInteger(habitId) && habitId > 0) {
        const existing = listCheckInsForDate(today).find((row) => row.habitId === habitId);
        if (existing) {
          clearCheckIn(habitId, today);
        } else {
          setCheckIn(habitId, today, 'full');
        }
      }
    }
  } catch {
    // Leave the widget as it was; the app will repair it on next open.
    return;
  }

  if (widgetInfo.widgetName !== 'Today') return;

  let habits: Habit[] = [];
  let rows: CheckIn[] = [];
  try {
    habits = listActiveHabits();
    rows = listCheckInsForDate(today);
  } catch {
    return;
  }

  const checkInsByHabit: Record<number, CheckIn> = {};
  for (const row of rows) checkInsByHabit[row.habitId] = row;

  const dateLabel = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date());

  renderWidget(
    <TodayWidget
      habits={habits}
      checkInsByHabit={checkInsByHabit}
      today={today}
      dateLabel={dateLabel}
    />,
  );
};
