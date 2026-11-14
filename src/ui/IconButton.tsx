import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';

import { useTheme } from '@/design/theme';
import { icons, layout, opacity, radius } from '@/design/tokens';

type IconButtonProps = {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  /** `filled` sits on a surface, `plain` is borderless. */
  appearance?: 'plain' | 'filled';
  tint?: string;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  icon: Icon,
  label,
  onPress,
  disabled = false,
  size = 'md',
  appearance = 'plain',
  tint,
  style,
}: IconButtonProps) {
  const { colors } = useTheme();
  const dimension = size === 'sm' ? 40 : layout.minTarget;
  const glyph = size === 'sm' ? icons.sm : icons.md;

  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        {
          width: dimension,
          height: dimension,
          backgroundColor: appearance === 'filled' ? colors.surface : 'transparent',
          borderColor: appearance === 'filled' ? colors.border : 'transparent',
          opacity: disabled ? opacity.disabled : pressed ? opacity.pressed : 1,
        },
        style,
      ]}
    >
      <Icon size={glyph} strokeWidth={icons.stroke} color={tint ?? colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
