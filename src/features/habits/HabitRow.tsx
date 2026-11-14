import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check, Ellipsis, Minus, Slash } from 'lucide-react-native';

import { useTheme } from '@/design/theme';
import { icons, layout, opacity, radius, space } from '@/design/tokens';
import type { CheckInStatus, Habit } from '@/db/schema';
import { AppText } from '@/ui/AppText';

type HabitRowProps = {
  habit: Habit;
  status: CheckInStatus | null;
  onPressCircle: () => void;
  onPressRow: () => void;
  onPressMore: () => void;
};

export function HabitRow({
  habit,
  status,
  onPressCircle,
  onPressRow,
  onPressMore,
}: HabitRowProps) {
  const { colors } = useTheme();
  const done = status === 'full' || status === 'minimum';

  const subtitle =
    status === 'minimum'
      ? `Minimum: ${habit.minVersion}`
      : status === 'skipped'
        ? 'Skipped today — a planned rest'
        : habit.cue || habit.fullVersion;

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          onPressCircle();
        }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={
          done ? `${habit.name}, done today. Change how you logged it.` : `Complete ${habit.name}`
        }
        hitSlop={6}
        style={({ pressed }) => [
          styles.circle,
          {
            backgroundColor: done ? colors.primary : 'transparent',
            borderColor: done ? colors.primary : colors.borderStrong,
            opacity: pressed ? opacity.pressed : 1,
          },
        ]}
      >
        {status === 'full' ? (
          <Check size={icons.md - 4} strokeWidth={2.2} color={colors.onPrimary} />
        ) : status === 'minimum' ? (
          <Minus size={icons.md - 4} strokeWidth={2.4} color={colors.onPrimary} />
        ) : status === 'skipped' ? (
          <Slash size={icons.md - 6} strokeWidth={2} color={colors.faint} />
        ) : null}
      </Pressable>

      <Pressable
        onPress={onPressRow}
        accessibilityRole="button"
        accessibilityLabel={`${habit.name}. ${subtitle}`}
        accessibilityHint="Opens this habit's details"
        style={({ pressed }) => [styles.body, { opacity: pressed ? opacity.pressed : 1 }]}
      >
        <AppText variant="body" weight="medium" numberOfLines={1}>
          {habit.name}
        </AppText>
        <AppText
          variant="caption"
          tone={status === 'minimum' ? 'primary' : 'muted'}
          numberOfLines={1}
        >
          {subtitle}
        </AppText>
      </Pressable>

      <Pressable
        onPress={() => {
          Haptics.selectionAsync().catch(() => {});
          onPressMore();
        }}
        accessibilityRole="button"
        accessibilityLabel={`More options for ${habit.name}`}
        hitSlop={4}
        style={({ pressed }) => [styles.more, { opacity: pressed ? opacity.pressed : 1 }]}
      >
        <Ellipsis size={icons.md} strokeWidth={icons.stroke} color={colors.muted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingLeft: space.lg,
    paddingRight: space.sm,
    paddingVertical: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    minHeight: 68,
  },
  circle: {
    width: layout.minTarget,
    height: layout.minTarget,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
    paddingVertical: space.xs,
    justifyContent: 'center',
  },
  more: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
