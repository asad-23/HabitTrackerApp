import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/design/theme';
import { space } from '@/design/tokens';
import type { CheckIn, Habit } from '@/db/schema';
import { addDays, isHabitScheduledOn, rangeDays, type DateKey } from '@/domain/dates';
import { statusFor } from '@/domain/consistency';
import { AppText } from '@/ui/AppText';

type ConsistencyStripProps = {
  habit: Habit;
  checkIns: Map<string, CheckIn>;
  today: DateKey;
  days?: number;
};

/** One square per day. Colour is the whole story; no numbers needed. */
export function ConsistencyStrip({ habit, checkIns, today, days = 30 }: ConsistencyStripProps) {
  const { colors } = useTheme();
  const dates = rangeDays(addDays(today, -(days - 1)), today);

  return (
    <View>
      <View style={styles.strip}>
        {dates.map((date) => {
          const status = statusFor(checkIns, habit.id, date);
          const scheduled = isHabitScheduledOn(habit, date);

          let backgroundColor = 'transparent';
          let borderColor = colors.heatEmptyBorder;

          if (status === 'full') {
            backgroundColor = colors.heatFull;
            borderColor = colors.heatFull;
          } else if (status === 'minimum') {
            backgroundColor = colors.heatMin;
            borderColor = colors.heatMin;
          } else if (status === 'skipped') {
            backgroundColor = colors.heatSkipped;
            borderColor = colors.heatSkipped;
          } else if (!scheduled) {
            backgroundColor = 'transparent';
            borderColor = 'transparent';
          }

          return (
            <View
              key={date}
              style={[styles.cell, { backgroundColor, borderColor }]}
            />
          );
        })}
      </View>

      <View style={styles.legend}>
        <Legend color={colors.heatFull} label="Full" />
        <Legend color={colors.heatMin} label="Minimum" />
        <Legend color={colors.heatEmpty} border={colors.heatEmptyBorder} label="Missed" />
        <Legend color={colors.heatSkipped} label="Skipped" />
      </View>
    </View>
  );
}

function Legend({ color, border, label }: { color: string; border?: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendSwatch,
          { backgroundColor: color, borderColor: border ?? color },
        ]}
      />
      <AppText variant="caption" tone="faint">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  cell: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 1,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md,
    marginTop: space.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 3,
    borderWidth: 1,
  },
});
