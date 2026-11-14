import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';

import { archiveHabit, restoreHabit } from '@/db/repositories/habits';
import { useDataStore } from '@/stores/useData';
import { useSessionStore } from '@/stores/useSession';
import { computeConsistency } from '@/domain/consistency';
import { formatRepeatDays, formatTime } from '@/domain/dates';
import { space } from '@/design/tokens';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { confirmAction } from '@/ui/confirm';
import { goBack } from '@/ui/navigation';
import { Screen, ContentColumn } from '@/ui/Screen';
import { ScreenHeader, SectionHeading } from '@/ui/ScreenHeader';
import { ConsistencyStrip } from '@/features/habits/ConsistencyStrip';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const habitId = Number(id);
  const today = useSessionStore((state) => state.todayKey);
  const habits = useDataStore((state) => state.habits);
  const recentMap = useDataStore((state) => state.recentMap);
  const refresh = useDataStore((state) => state.refresh);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const habit = habits.find((item) => item.id === habitId);

  if (!habit) {
    return (
      <Screen>
        <ContentColumn>
          <ScreenHeader title="Not found" onBack={goBack} />
          <AppText tone="muted">This habit is no longer in your notebook.</AppText>
        </ContentColumn>
      </Screen>
    );
  }

  const consistency = computeConsistency(habit, recentMap, today);

  const confirmArchive = () => {
    confirmAction(
      'Archive this habit?',
      'It leaves your Today list, but its history stays in the notebook. You can bring it back later.',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: () => {
            archiveHabit(habit.id, today);
            refresh();
            goBack();
          },
        },
      ],
    );
  };

  return (
    <Screen bottomInset={32}>
      <ContentColumn>
        <ScreenHeader title={habit.name} subtitle={habit.identity || undefined} onBack={goBack} />

        <Card style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            <AppText variant="display">
              {consistency.score === null ? '—' : `${consistency.score}%`}
            </AppText>
            <AppText variant="caption" tone="muted" style={styles.scoreCaption}>
              {consistency.denominator === 0
                ? 'Nothing to measure yet'
                : `${consistency.completed} of ${consistency.denominator} scheduled days kept in the last 30 days`}
            </AppText>
          </View>
          <ConsistencyStrip habit={habit} checkIns={recentMap} today={today} />
        </Card>

        <View style={styles.section}>
          <SectionHeading title="Two versions" />
          <Card style={styles.versionCard}>
            <AppText variant="label" weight="semibold" tone="primary">
              Full version
            </AppText>
            <AppText>{habit.fullVersion}</AppText>
          </Card>
          <Card style={styles.versionCard}>
            <AppText variant="label" weight="semibold" tone="primary">
              Minimum version
            </AppText>
            <AppText>{habit.minVersion}</AppText>
            <AppText variant="caption" tone="faint">
              Still counts as a kept day.
            </AppText>
          </Card>
        </View>

        <View style={styles.section}>
          <SectionHeading title="Details" />
          <Card style={styles.details}>
            <Detail label="Cue" value={habit.cue || 'No cue yet'} />
            <Detail
              label="Reminder"
              value={habit.reminderTime ? formatTime(habit.reminderTime) : 'Default time'}
            />
            <Detail label="Repeats" value={formatRepeatDays(habit.repeatMask)} />
          </Card>
        </View>

        <View style={styles.actions}>
          <Button
            label="Edit habit"
            variant="secondary"
            onPress={() => router.push(`/habit/${habit.id}/edit`)}
          />
          {habit.archivedAt ? (
            <Button
              label="Restore habit"
              onPress={() => {
                restoreHabit(habit.id);
                refresh();
              }}
            />
          ) : (
            <Button label="Archive habit" variant="danger" onPress={confirmArchive} />
          )}
        </View>
      </ContentColumn>
    </Screen>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
      <AppText variant="label" style={styles.detailValue}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  scoreCard: { gap: space.lg },
  scoreRow: { gap: space.xs },
  scoreCaption: { maxWidth: 380 },
  section: { marginTop: space.xxxl, gap: space.sm },
  versionCard: { gap: space.xs },
  details: { gap: space.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: space.lg },
  detailValue: { flex: 1, textAlign: 'right' },
  actions: { marginTop: space.xxxl, gap: space.sm },
});
