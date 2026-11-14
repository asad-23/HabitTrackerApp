import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/design/theme';
import { radius, space } from '@/design/tokens';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import type { Rescue } from './rescue';
import { rememberRescue } from './rescue';

type RescueCardProps = {
  rescue: Rescue;
  today: string;
  onDoMinimum: () => void;
  onDismiss: () => void;
};

export function RescueCard({ rescue, today, onDoMinimum, onDismiss }: RescueCardProps) {
  const { colors } = useTheme();

  useEffect(() => {
    rememberRescue(today, rescue.habit.id);
  }, [today, rescue.habit.id]);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.accentSoft, borderColor: colors.accent },
      ]}
    >
      <AppText variant="caption" weight="semibold" tone="accent">
        {rescue.wasYesterday ? 'YESTERDAY SLIPPED BY' : 'A SMALL RETURN'}
      </AppText>
      <AppText variant="title" style={styles.title}>
        {rescue.wasYesterday ? 'Today only needs the small one.' : 'Pick it back up, gently.'}
      </AppText>
      <AppText tone="muted">
        {rescue.wasYesterday
          ? `One minimum version of “${rescue.habit.name}” keeps the thread.`
          : `“${rescue.habit.name}” is still yours. The minimum version counts.`}
      </AppText>
      <AppText variant="label" tone="accent" style={styles.minimum}>
        {rescue.habit.minVersion}
      </AppText>

      <View style={styles.actions}>
        <Button label="Do the minimum" onPress={onDoMinimum} />
        <Button label="Not today" variant="ghost" onPress={onDismiss} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: space.lg,
    gap: space.xs,
    marginBottom: space.xxl,
  },
  title: { marginTop: space.xs },
  minimum: { marginTop: space.sm },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    marginTop: space.md,
  },
});
