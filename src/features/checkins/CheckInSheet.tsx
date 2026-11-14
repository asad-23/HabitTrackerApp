import { StyleSheet, View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check, CircleSlash, Minus, RotateCcw } from 'lucide-react-native';

import { useTheme } from '@/design/theme';
import { icons, opacity, radius, space } from '@/design/tokens';
import type { CheckInStatus, Habit } from '@/db/schema';
import { AppText } from '@/ui/AppText';
import { Sheet } from '@/ui/Sheet';

type CheckInSheetProps = {
  habit: Habit | null;
  currentStatus: CheckInStatus | null;
  onSelect: (status: CheckInStatus) => void;
  onClear: () => void;
  onClose: () => void;
};

export function CheckInSheet({
  habit,
  currentStatus,
  onSelect,
  onClear,
  onClose,
}: CheckInSheetProps) {
  const { colors } = useTheme();
  const visible = habit !== null;

  return (
    <Sheet visible={visible} onClose={onClose} title={habit?.name}>
      {habit ? (
        <View style={styles.body}>
          <Option
            icon={Check}
            title="Full version"
            detail={habit.fullVersion}
            selected={currentStatus === 'full'}
            onPress={() => onSelect('full')}
          />
          <Option
            icon={Minus}
            title="Minimum version"
            detail={habit.minVersion}
            selected={currentStatus === 'minimum'}
            onPress={() => onSelect('minimum')}
          />
          <Option
            icon={CircleSlash}
            title="Skipped today"
            detail="A planned rest. It stays neutral in your consistency."
            selected={currentStatus === 'skipped'}
            onPress={() => onSelect('skipped')}
          />

          {currentStatus ? (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                onClear();
              }}
              accessibilityRole="button"
              accessibilityLabel="Clear today's entry"
              style={({ pressed }) => [
                styles.clear,
                { opacity: pressed ? opacity.pressed : 1 },
              ]}
            >
              <RotateCcw size={icons.sm - 4} strokeWidth={icons.stroke} color={colors.muted} />
              <AppText variant="label" tone="muted">
                Clear today&apos;s entry
              </AppText>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </Sheet>
  );
}

function Option({
  icon: Icon,
  title,
  detail,
  selected,
  onPress,
}: {
  icon: typeof Check;
  title: string;
  detail: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${title}. ${detail}`}
      style={({ pressed }) => [
        styles.option,
        {
          backgroundColor: selected ? colors.primarySoft : colors.bg,
          borderColor: selected ? colors.primary : colors.border,
          opacity: pressed ? opacity.pressed : 1,
        },
      ]}
    >
      <View
        style={[
          styles.optionIcon,
          { backgroundColor: selected ? colors.primary : colors.sunken },
        ]}
      >
        <Icon
          size={icons.sm - 4}
          strokeWidth={icons.stroke}
          color={selected ? colors.onPrimary : colors.muted}
        />
      </View>
      <View style={styles.optionText}>
        <AppText variant="label" weight="semibold" tone={selected ? 'primary' : 'text'}>
          {title}
        </AppText>
        <AppText variant="caption" tone="muted">
          {detail}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: { gap: space.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: 64,
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: { flex: 1, gap: 2 },
  clear: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    minHeight: 48,
    marginTop: space.sm,
  },
});
