import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/design/theme';
import { layout, radius, space } from '@/design/tokens';
import { AppText } from './AppText';

type FieldShellProps = {
  label: string;
  hint?: string;
  error?: string | null;
  labelAccessory?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  focused?: boolean;
  multiline?: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Shared frame for text, time, and select fields so they line up exactly. */
export function FieldShell({
  label,
  hint,
  error,
  labelAccessory,
  leading,
  trailing,
  focused = false,
  multiline = false,
  children,
  style,
}: FieldShellProps) {
  const { colors } = useTheme();
  const message = error ?? hint;

  return (
    <View style={style}>
      <View style={styles.labelRow}>
        <AppText variant="label" weight="medium" tone="muted">
          {label}
        </AppText>
        {labelAccessory}
      </View>

      <View
        style={[
          styles.shell,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : focused ? colors.primary : colors.border,
            minHeight: multiline ? 112 : layout.minTarget,
            alignItems: multiline ? 'flex-start' : 'center',
          },
        ]}
      >
        {leading ? <View style={styles.leading}>{leading}</View> : null}
        {children}
        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      </View>

      {message ? (
        <AppText variant="caption" tone={error ? 'danger' : 'faint'} style={styles.message}>
          {message}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.sm,
  },
  shell: {
    flexDirection: 'row',
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: space.lg,
  },
  leading: {
    justifyContent: 'center',
    paddingRight: space.sm,
  },
  trailing: {
    justifyContent: 'center',
    paddingLeft: space.sm,
  },
  message: {
    marginTop: space.sm,
  },
});
