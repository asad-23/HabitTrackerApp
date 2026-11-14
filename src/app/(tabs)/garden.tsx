import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Sprout } from 'lucide-react-native';

import { useDataStore } from '@/stores/useData';
import { useSessionStore } from '@/stores/useSession';
import { computeConsistency, growthStage } from '@/domain/consistency';
import {
  PLANT_SPECIES_LABEL,
  plantSpeciesForHabit,
  plantStageLabel,
} from '@/domain/plants';
import { space, radius } from '@/design/tokens';
import { AppText } from '@/ui/AppText';
import { Card } from '@/ui/Card';
import { EmptyState } from '@/ui/EmptyState';
import { PlantMark } from '@/ui/PlantMark';
import { Screen, ContentColumn } from '@/ui/Screen';
import { SectionHeading } from '@/ui/ScreenHeader';

export default function GardenScreen() {
  const today = useSessionStore((state) => state.todayKey);
  const habits = useDataStore((state) => state.habits);
  const recentMap = useDataStore((state) => state.recentMap);
  const refresh = useDataStore((state) => state.refresh);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const grown = habits.map((habit) => ({
    habit,
    consistency: computeConsistency(habit, recentMap, today),
  }));
  // Plants with no history yet are not failures; leave them out of the average.
  const measured = grown.flatMap(({ consistency }) =>
    consistency.score === null ? [] : [consistency.score],
  );
  const average =
    measured.length === 0
      ? null
      : Math.round(measured.reduce((total, score) => total + score, 0) / measured.length);

  return (
    <Screen>
      <ContentColumn>
        <View style={styles.header}>
          <AppText variant="caption" tone="muted">
            Your garden
          </AppText>
          <AppText variant="display">Garden</AppText>
          <AppText tone="muted" style={styles.summary}>
            {habits.length === 0
              ? 'Every plant starts as a seed.'
              : average === null
                ? 'Your plants are still finding their roots.'
                : `Your garden is at ${average}% over the last 30 days.`}
          </AppText>
        </View>

        {habits.length === 0 ? (
          <EmptyState
            icon={Sprout}
            title="Nothing planted yet"
            body="Each habit you add becomes a plant here. It grows with the days you show up, in any size."
            actionLabel="Plant your first habit"
            onAction={() => router.push('/habit/new')}
          />
        ) : (
          <View style={styles.grid}>
            <SectionHeading title="Plants" />
            <View style={styles.cards}>
              {grown.map(({ habit, consistency }) => {
                const stage = growthStage(consistency.score);
                const species = plantSpeciesForHabit(habit.id);
                const speciesLabel = PLANT_SPECIES_LABEL[species];
                const stageLabel = plantStageLabel(stage);

                return (
                  <Pressable
                    key={habit.id}
                    onPress={() => router.push(`/habit/${habit.id}`)}
                    accessibilityRole="button"
                    accessibilityLabel={`${habit.name}. ${speciesLabel}, ${stageLabel.toLowerCase()}. ${
                      consistency.score === null
                        ? 'No days measured yet'
                        : `${consistency.score} percent consistent over 30 days`
                    }`}
                    style={styles.cell}
                  >
                    <Card style={styles.plantCard}>
                      <PlantMark
                        species={species}
                        stage={stage}
                        wilted={(consistency.score ?? 100) < 30}
                        size={88}
                      />
                      <AppText variant="label" weight="medium" numberOfLines={1}>
                        {habit.name}
                      </AppText>
                      <AppText variant="caption" tone="faint">
                        {speciesLabel} · {stageLabel}
                      </AppText>
                      <AppText variant="caption" tone="muted">
                        {consistency.score === null ? 'Not measured yet' : `${consistency.score}%`}
                      </AppText>
                    </Card>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </ContentColumn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: space.xxl, gap: space.xs },
  summary: { marginTop: space.sm },
  grid: { gap: space.sm },
  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md,
  },
  cell: {
    width: '48%',
    minWidth: 140,
    flexGrow: 1,
  },
  plantCard: {
    alignItems: 'center',
    gap: space.xs,
    borderRadius: radius.lg,
  },
});
