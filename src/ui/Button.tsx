import { useCallback, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/design/theme';
import { layout, opacity, radius, space } from '@/design/tokens';
import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'lg';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  /** Stretches to the container width. */
  fullWidth?: boolean;
  haptics?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  haptics = true,
  style,
  accessibilityHint,
}: ButtonProps) {
  const { colors } = useTheme();
  const inactive = disabled || loading;

  const palette = {
    primary: {
      background: colors.primary,
      border: colors.primary,
      text: colors.onPrimary,
    },
    secondary: {
      background: colors.surface,
      border: colors.borderStrong,
      text: colors.text,
    },
    ghost: {
      background: 'transparent',
      border: 'transparent',
      text: colors.primaryText,
    },
    danger: {
      background: colors.dangerSoft,
      border: colors.dangerSoft,
      text: colors.dangerSoftText,
    },
  }[variant];

  const handlePress = useCallback(() => {
    if (inactive) return;
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  }, [haptics, inactive, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' ? styles.large : styles.medium,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
          opacity: inactive ? opacity.disabled : pressed ? opacity.pressed : 1,
        },
        fullWidth ? styles.fullWidth : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} size="small" />
      ) : (
        <View style={styles.content}>
          {icon}
          <AppText
            variant="label"
            weight="semibold"
            maxScale={1.4}
            style={{ color: palette.text }}
            numberOfLines={1}
          >
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.minTarget,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xxl,
  },
  medium: {
    minHeight: layout.minTarget,
    paddingVertical: space.md,
  },
  large: {
    minHeight: 56,
    paddingVertical: space.lg,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
});
