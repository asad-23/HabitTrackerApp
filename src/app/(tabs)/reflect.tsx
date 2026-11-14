import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { useDataStore } from '@/stores/useData';
import { useSessionStore } from '@/stores/useSession';
import { clearReflection, listReflectionsForWeek, setReflection } from '@/db/repositories/reflections';
import type { ReasonTag } from '@/db/schema';
import { weekSummary } from '@/domain/consistency';
import { formatWeekRange, startOfWeek } from '@/domain/dates';
import { space } from '@/design/tokens';
import { AppText } from '@/ui/AppText';
import { Card } from '@/ui/Card';
import { Chip, ChipRow } from '@/ui/Chip';
import { Screen, ContentColumn } from '@/ui/Screen';
import { SectionHeading } from '@/ui/ScreenHeader';

const REASONS: { tag: ReasonTag; label: string }[] = [
  { tag: 'tired', label: 'Tired' },
  { tag: 'busy', label: 'Busy' },
  { tag: 'forgot', label: 'Forgot' },
  { tag: 'unmotivated', label: 'Unmotivated' },
  { tag: 'sick', label: 'Unwell' },
  { tag: 'other', label: 'Something else' },
];

export default function ReflectScreen() {
  const today = useSessionStore((state) => state.todayKey);
  const habits = useDataStore((state) => state.habits);
  const recentMap = useDataStore((state) => state.recentMap);
  const refresh = useDataStore((state) => state.refresh);

  const weekStart = startOfWeek(today);
  const [reasons, setReasons] = useState<Record<number, ReasonTag>>({});

  useFocusEffect(
    useCallback(() => {
      refresh();
      const saved = listReflectionsForWeek(weekStart);
      const next: Record<number, ReasonTag> = {};
      for (const row of saved) next[row.habitId] = row.reasonTag;
      setReasons(next);
    }, [refresh, weekStart]),
  );

  const summary = weekSummary(habits, recentMap, weekStart, today, today);
  const missedByHabit = new Map<number, number>();
  for (const miss of summary.missed) {
    missedByHabit.set(miss.habitId, (missedByHabit.get(miss.habitId) ?? 0) + 1);
  }
  const habitsWithMisses = habits.filter((habit) => missedByHabit.has(habit.id));

  const choose = (habitId: number, tag: ReasonTag) => {
    const already = reasons[habitId] === tag;
    if (already) {
      clearReflection(weekStart, habitId);
      setReasons((current) => {
        const next = { ...current };
        delete next[habitId];
        return next;
      });
      return;
    }
    setReflection(weekStart, habitId, tag);
    setReasons((current) => ({ ...current, [habitId]: tag }));
  };

  return (
    <Screen>
      <ContentColumn>
        <View style={styles.header}>
          <AppText variant="caption" tone="muted">
            {formatWeekRange(weekStart)}
          </AppText>
          <AppText variant="display">Reflect</AppText>
          <AppText tone="muted" style={styles.summary}>
            A short look back. Not a scorecard.
          </AppText>
        </View>

        <Card style={styles.weekCard}>
          <AppText variant="title">
            {summary.completed} of {summary.scheduled}
          </AppText>
          <AppText tone="muted">
            {summary.scheduled === 0
              ? 'Nothing was scheduled this week.'
              : 'habit-days kept this week, in whatever size they came.'}
          </AppText>
        </Card>

        <View style={styles.section}>
          <SectionHeading title="Days you missed" />
          {habitsWithMisses.length === 0 ? (
            <Card tone="sunken">
              <AppText tone="muted">
                No missed days to untangle. Notice what made this week work.
              </AppText>
            </Card>
          ) : (
            <View style={styles.list}>
              {habitsWithMisses.map((habit) => {
                const count = missedByHabit.get(habit.id) ?? 0;
                return (
                  <Card key={habit.id} style={styles.habitCard}>
                    <View>
                      <AppText variant="label" weight="semibold">
                        {habit.name}
                      </AppText>
                      <AppText variant="caption" tone="muted">
                        {count === 1 ? '1 missed day' : `${count} missed days`}
                      </AppText>
                    </View>
                    <AppText variant="caption" tone="faint">
                      What got in the way?
                    </AppText>
                    <ChipRow>
                      {REASONS.map((reason) => (
                        <Chip
                          key={reason.tag}
                          label={reason.label}
                          selected={reasons[habit.id] === reason.tag}
                          onPress={() => choose(habit.id, reason.tag)}
                        />
                      ))}
                    </ChipRow>
                  </Card>
                );
              })}
            </View>
          )}
        </View>
      </ContentColumn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: space.xxl, gap: space.xs },
  summary: { marginTop: space.sm },
  weekCard: { gap: space.xs },
  section: { marginTop: space.xxxl },
  list: { gap: space.md },
  habitCard: { gap: space.md },
});
