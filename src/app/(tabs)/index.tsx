import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Leaf } from 'lucide-react-native';

import { useDataStore } from '@/stores/useData';
import { useSessionStore } from '@/stores/useSession';
import { formatLongDate, isHabitScheduledOn } from '@/domain/dates';
import { space } from '@/design/tokens';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { EmptyState } from '@/ui/EmptyState';
import { Screen, ContentColumn } from '@/ui/Screen';
import { SectionHeading } from '@/ui/ScreenHeader';
import { HabitRow } from '@/features/habits/HabitRow';
import { CheckInSheet } from '@/features/checkins/CheckInSheet';
import { RescueCard } from '@/features/rescue/RescueCard';
import { dismissRescue, selectRescue } from '@/features/rescue/rescue';
import type { Habit } from '@/db/schema';

export default function TodayScreen() {
  const today = useSessionStore((state) => state.todayKey);
  const habits = useDataStore((state) => state.habits);
  const checkInsByHabit = useDataStore((state) => state.checkInsByHabit);
  const recentMap = useDataStore((state) => state.recentMap);
  const refresh = useDataStore((state) => state.refresh);
  const logCheckIn = useDataStore((state) => state.logCheckIn);
  const clearHabitCheckIn = useDataStore((state) => state.clearHabitCheckIn);

  const [sheetHabit, setSheetHabit] = useState<Habit | null>(null);
  const [rescueHidden, setRescueHidden] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refresh();
      setRescueHidden(false);
    }, [refresh]),
  );

  const scheduled = habits.filter((habit) => isHabitScheduledOn(habit, today));
  const doneCount = scheduled.filter((habit) => {
    const status = checkInsByHabit[habit.id]?.status;
    return status === 'full' || status === 'minimum';
  }).length;
  const allDone = scheduled.length > 0 && doneCount === scheduled.length;
  const rescue = rescueHidden ? null : selectRescue(habits, recentMap, today);

  const sheetStatus = sheetHabit ? (checkInsByHabit[sheetHabit.id]?.status ?? null) : null;

  return (
    <>
      <Screen>
        <ContentColumn>
          <View style={styles.header}>
            <AppText variant="caption" tone="muted">
              {formatLongDate(today)}
            </AppText>
            <AppText variant="display">Today</AppText>
            <AppText tone="muted" style={styles.summary}>
              {scheduled.length === 0
                ? 'A quiet day on the calendar.'
                : allDone
                  ? `${doneCount} of ${scheduled.length} done. That is everything for today.`
                  : `${doneCount} of ${scheduled.length} done so far.`}
            </AppText>
          </View>

          {rescue ? (
            <RescueCard
              rescue={rescue}
              today={today}
              onDoMinimum={() => {
                logCheckIn(rescue.habit.id, 'minimum');
                setRescueHidden(true);
              }}
              onDismiss={() => {
                dismissRescue(today);
                setRescueHidden(true);
              }}
            />
          ) : null}

          {scheduled.length === 0 ? (
            habits.length === 0 ? (
              <EmptyState
                icon={Leaf}
                title="Start with one small habit"
                body="Pick something you can do on your best day and your hardest day. We will ask for both."
                actionLabel="Add a habit"
                onAction={() => router.push('/habit/new')}
              />
            ) : (
              <EmptyState
                icon={Leaf}
                title="Nothing scheduled today"
                body="Rest is part of the plan. Your habits will be here on their next day."
              />
            )
          ) : (
            <View style={styles.list}>
              <SectionHeading title="Your habits" />
              {scheduled.map((habit) => {
                const status = checkInsByHabit[habit.id]?.status ?? null;
                return (
                  <HabitRow
                    key={habit.id}
                    habit={habit}
                    status={status}
                    onPressCircle={() => {
                      if (status === null) {
                        logCheckIn(habit.id, 'full');
                      } else {
                        setSheetHabit(habit);
                      }
                    }}
                    onPressRow={() => router.push(`/habit/${habit.id}`)}
                    onPressMore={() => setSheetHabit(habit)}
                  />
                );
              })}
            </View>
          )}

          {habits.length > 0 ? (
            <Button
              label="Add another habit"
              onPress={() => router.push('/habit/new')}
              variant="ghost"
              style={styles.add}
            />
          ) : null}
        </ContentColumn>
      </Screen>

      <CheckInSheet
        habit={sheetHabit}
        currentStatus={sheetStatus}
        onSelect={(status) => {
          if (!sheetHabit) return;
          logCheckIn(sheetHabit.id, status);
          setSheetHabit(null);
        }}
        onClear={() => {
          if (!sheetHabit) return;
          clearHabitCheckIn(sheetHabit.id);
          setSheetHabit(null);
        }}
        onClose={() => setSheetHabit(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: space.xxl, gap: space.xs },
  summary: { marginTop: space.sm },
  list: { gap: space.sm },
  add: { marginTop: space.xl },
});
