import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';

import { useTheme } from '@/design/theme';
import { icons, opacity, radius, space } from '@/design/tokens';
import { AppText } from './AppText';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: LucideIcon;
  disabled?: boolean;
};

export function Chip({ label, selected = false, onPress, icon: Icon, disabled = false }: ChipProps) {
  const { colors } = useTheme();
  const interactive = typeof onPress === 'function';

  return (
    <Pressable
      onPress={
        interactive
          ? () => {
              if (disabled) return;
              Haptics.selectionAsync().catch(() => {});
              onPress?.();
            }
          : undefined
      }
      disabled={disabled || !interactive}
      accessibilityRole={interactive ? 'checkbox' : 'text'}
      accessibilityState={interactive ? { checked: selected, disabled } : undefined}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: selected ? colors.primarySoft : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          opacity: disabled ? opacity.disabled : pressed ? opacity.pressed : 1,
        },
      ]}
    >
      {Icon ? (
        <Icon
          size={icons.sm - 4}
          strokeWidth={icons.stroke}
          color={selected ? colors.primarySoftText : colors.muted}
        />
      ) : null}
      <AppText variant="label" tone={selected ? 'primary' : 'muted'} maxScale={1.3}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function ChipRow({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    minHeight: 40,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
});
