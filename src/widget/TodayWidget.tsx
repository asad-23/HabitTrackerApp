import { FlexWidget, SvgWidget, TextWidget } from 'react-native-android-widget';

import { colors } from '@/design/tokens';
import type { CheckIn, Habit } from '@/db/schema';
import { isHabitScheduledOn, type DateKey } from '@/domain/dates';

const palette = colors.light;

type TodayWidgetProps = {
  habits: Habit[];
  checkInsByHabit: Record<number, CheckIn>;
  /** Today's local calendar day, used to keep unscheduled habits out. */
  today: DateKey;
  /** Real local date, formatted for the widget header. */
  dateLabel: string;
};

const MAX_ROWS = 4;

/** Inline SVG keeps the widget free of a Metro SVG transformer. */
function checkboxSvg(done: boolean): string {
  const stroke = done ? palette.primary : palette.borderStrong;
  const fill = done ? palette.primary : 'none';
  const check = done
    ? `<path d="M6.5 11.4 9.4 14.2 15.5 7.9" stroke="${palette.onPrimary}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" width="22" height="22"><circle cx="11" cy="11" r="9.25" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>${check}</svg>`;
}

export function TodayWidget({ habits, checkInsByHabit, today, dateLabel }: TodayWidgetProps) {
  const scheduled = habits.filter(
    (habit) => habit.archivedAt === null && isHabitScheduledOn(habit, today),
  );
  const visible = scheduled.slice(0, MAX_ROWS);
  const done = scheduled.filter((habit) => {
    const checkIn = checkInsByHabit[habit.id];
    return checkIn?.status === 'full' || checkIn?.status === 'minimum';
  }).length;
  const remaining = scheduled.length - visible.length;

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      accessibilityLabel={`Twice, ${done} of ${scheduled.length} done today. Open the app.`}
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        padding: 16,
        backgroundColor: palette.bg,
        borderRadius: 20,
      }}
    >
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: 'match_parent',
          marginBottom: 10,
        }}
      >
        <TextWidget
          text="Today"
          style={{
            fontSize: 18,
            fontFamily: 'Fraunces-SemiBold',
            color: palette.text,
          }}
        />
        <TextWidget
          text={scheduled.length > 0 ? `${done} of ${scheduled.length}` : dateLabel}
          style={{
            fontSize: 12,
            fontFamily: 'DMSans-Medium',
            color: palette.muted,
          }}
        />
      </FlexWidget>

      {visible.length === 0 ? (
        <TextWidget
          text="No habits yet. Tap to add your first."
          style={{ fontSize: 13, fontFamily: 'DMSans-Regular', color: palette.muted }}
        />
      ) : null}

      {visible.map((habit) => {
        const checkIn = checkInsByHabit[habit.id];
        const doneNow = checkIn?.status === 'full' || checkIn?.status === 'minimum';
        return (
          <FlexWidget
            key={habit.id}
            clickAction="TOGGLE"
            clickActionData={{ habitId: habit.id }}
            accessibilityLabel={`${habit.name}${doneNow ? ', done' : ', not done'}`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: 'match_parent',
              paddingVertical: 6,
            }}
          >
            <SvgWidget svg={checkboxSvg(doneNow)} style={{ width: 22, height: 22, marginRight: 10 }} />
            <TextWidget
              text={habit.name}
              maxLines={1}
              style={{
                fontSize: 14,
                fontFamily: 'DMSans-Medium',
                color: doneNow ? palette.muted : palette.text,
              }}
            />
          </FlexWidget>
        );
      })}

      {remaining > 0 ? (
        <TextWidget
          text={`+${remaining} more`}
          style={{
            fontSize: 11,
            fontFamily: 'DMSans-Regular',
            color: palette.faint,
            marginTop: 4,
          }}
        />
      ) : null}
    </FlexWidget>
  );
}
