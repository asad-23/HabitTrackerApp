import { StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { space } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { AppText } from './AppText';
import { Button } from './Button';

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon: Icon, title, body, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      {Icon ? <Icon size={28} strokeWidth={1.5} color={colors.faint} /> : null}
      <AppText variant="title" align="center" style={styles.title}>
        {title}
      </AppText>
      <AppText tone="muted" align="center" style={styles.body}>
        {body}
      </AppText>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: space.xxxl,
    paddingHorizontal: space.lg,
    gap: space.md,
  },
  title: { marginTop: space.sm },
  body: { maxWidth: 320 },
  action: { marginTop: space.md },
});
