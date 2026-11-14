import { StyleSheet, Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/design/theme';
import { layout, opacity, radius, space } from '@/design/tokens';
import {
  ALL_DAYS,
  WEEKDAYS,
  WEEKENDS,
  WEEK_DISPLAY_ORDER,
  dayName,
  maskToIndexes,
  toggleDay,
} from '@/domain/dates';
import { AppText } from './AppText';
import { Chip } from './Chip';

type RepeatDayPickerProps = {
  label: string;
  mask: number;
  onChange: (mask: number) => void;
};

const PRESETS = [
  { label: 'Every day', mask: ALL_DAYS },
  { label: 'Weekdays', mask: WEEKDAYS },
  { label: 'Weekends', mask: WEEKENDS },
] as const;

export function RepeatDayPicker({ label, mask, onChange }: RepeatDayPickerProps) {
  const { colors } = useTheme();
  const selected = new Set(maskToIndexes(mask));

  const toggle = (index: number) => {
    const next = toggleDay(mask, index);
    // A habit with no days can never be scheduled; keep the last day selected.
    if (next === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }
    Haptics.selectionAsync().catch(() => {});
    onChange(next);
  };

  return (
    <View>
      <AppText variant="label" weight="medium" tone="muted" style={styles.label}>
        {label}
      </AppText>

      <View style={styles.days}>
        {WEEK_DISPLAY_ORDER.map((index) => {
          const active = selected.has(index);
          return (
            <Pressable
              key={index}
              onPress={() => toggle(index)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
              accessibilityLabel={dayName(index)}
              style={({ pressed }) => [
                styles.day,
                {
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                  opacity: pressed ? opacity.pressed : 1,
                },
              ]}
            >
              <AppText
                variant="label"
                weight="semibold"
                maxScale={1.2}
                style={{ color: active ? colors.onPrimary : colors.muted }}
              >
                {dayName(index, true).slice(0, 1)}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.presets}>
        {PRESETS.map((preset) => (
          <Chip
            key={preset.label}
            label={preset.label}
            selected={mask === preset.mask}
            onPress={() => onChange(preset.mask)}
          />
        ))}
      </View>

      <AppText variant="caption" tone="faint" style={styles.hint}>
        Weekdays run Sunday to Thursday. Weekends are Friday and Saturday.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: space.sm },
  days: {
    flexDirection: 'row',
    gap: space.sm,
  },
  day: {
    flex: 1,
    minHeight: layout.minTarget,
    maxWidth: 52,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    marginTop: space.md,
  },
  hint: { marginTop: space.sm },
});
