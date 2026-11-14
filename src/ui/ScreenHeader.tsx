import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

import { space } from '@/design/tokens';
import { AppText } from './AppText';
import { IconButton } from './IconButton';
import { goBack } from './navigation';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  /** Defaults to a back button that pops the stack. Pass null to hide it. */
  onBack?: (() => void) | null;
  right?: ReactNode;
  /** Renders the title in the display size, for top-level screens. */
  display?: boolean;
};

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
  display = false,
}: ScreenHeaderProps) {
  const showBack = onBack !== null;

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        {showBack ? (
          <IconButton
            icon={ChevronLeft}
            label="Go back"
            onPress={onBack ?? goBack}
            style={styles.back}
          />
        ) : null}
        <View style={styles.spacer} />
        {right}
      </View>
      <AppText variant={display ? 'display' : 'title'} style={styles.title}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText tone="muted" style={styles.subtitle}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

export function SectionHeading({
  title,
  action,
  style,
}: {
  title: string;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.sectionRow, style]}>
      <AppText variant="label" weight="semibold" tone="muted">
        {title.toUpperCase()}
      </AppText>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: space.xxl },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    marginBottom: space.sm,
  },
  back: { marginLeft: -12 },
  spacer: { flex: 1 },
  title: { marginTop: space.xs },
  subtitle: { marginTop: space.sm },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.md,
    gap: space.md,
  },
});
