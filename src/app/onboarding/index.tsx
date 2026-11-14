import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';

import { createHabit } from '@/db/repositories/habits';
import { useDataStore } from '@/stores/useData';
import { useSessionStore } from '@/stores/useSession';
import { useSettingsStore } from '@/stores/useSettings';
import { ALL_DAYS } from '@/domain/dates';
import { icons, opacity, radius, space } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { DateField } from '@/ui/DateField';
import { PlantMark } from '@/ui/PlantMark';
import { Screen, ContentColumn } from '@/ui/Screen';

const SUGGESTIONS = [
  {
    name: 'Read 10 pages',
    fullVersion: 'Read ten pages before bed',
    minVersion: 'Read one page',
    cue: 'After I get into bed',
    identity: 'Someone who reads every day',
  },
  {
    name: 'Walk outside',
    fullVersion: 'Walk for twenty minutes',
    minVersion: 'Step outside for two minutes',
    cue: 'After lunch',
    identity: 'Someone who moves every day',
  },
  {
    name: 'Tidy the kitchen',
    fullVersion: 'Clear the counters and wash up',
    minVersion: 'Put three things away',
    cue: 'Before I start work',
    identity: 'Someone who starts from calm',
  },
] as const;

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [startDate, setStartDate] = useState<string | null>(null);
  const { colors } = useTheme();
  const today = useSessionStore((state) => state.todayKey);
  const refresh = useDataStore((state) => state.refresh);
  const completeOnboarding = useSettingsStore((state) => state.completeOnboarding);
  const chosenStart = startDate ?? today;

  const finish = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  const startWith = (suggestion: (typeof SUGGESTIONS)[number]) => {
    createHabit(
      {
        name: suggestion.name,
        fullVersion: suggestion.fullVersion,
        minVersion: suggestion.minVersion,
        cue: suggestion.cue,
        identity: suggestion.identity,
        reminderTime: null,
        repeatMask: ALL_DAYS,
        startDate: chosenStart,
      },
      chosenStart,
    );
    refresh();
    finish();
  };

  return (
    <Screen bottomInset={32}>
      <ContentColumn>
        {step === 0 ? (
          <View style={styles.welcome}>
            <PlantMark stage={2} size={120} />
            <View style={styles.copy}>
              <AppText variant="caption" tone="muted">
                Twice
              </AppText>
              <AppText variant="display">Never miss twice.</AppText>
              <AppText tone="muted">
                One missed day is life. The second is how a habit quietly slips away.
              </AppText>
              <AppText tone="muted">
                Twice helps you notice that second day and make it small enough to keep. No streaks,
                no scolding. Just the next right thing.
              </AppText>
            </View>
            <Button label="Begin" size="lg" fullWidth onPress={() => setStep(1)} />
          </View>
        ) : (
          <View style={styles.choose}>
            <View style={styles.copy}>
              <AppText variant="caption" tone="muted">
                Step one
              </AppText>
              <AppText variant="display">Choose a first habit</AppText>
              <AppText tone="muted">
                Start with something ordinary. You will give it a full version and a minimum that
                still counts.
              </AppText>
            </View>

            <DateField
              label="Start date"
              value={chosenStart}
              onChange={setStartDate}
              hint="Today is fine. Choose another day if you want Twice to count from it."
            />

            <View style={styles.list}>
              {SUGGESTIONS.map((suggestion) => (
                <Pressable
                  key={suggestion.name}
                  onPress={() => startWith(suggestion)}
                  accessibilityRole="button"
                  accessibilityLabel={`Start with ${suggestion.name}. Minimum version: ${suggestion.minVersion}`}
                  style={({ pressed }) => ({ opacity: pressed ? opacity.pressed : 1 })}
                >
                  <Card style={styles.suggestion}>
                    <View style={styles.suggestionText}>
                      <AppText variant="body" weight="medium">
                        {suggestion.name}
                      </AppText>
                      <AppText variant="caption" tone="muted">
                        Minimum: {suggestion.minVersion}
                      </AppText>
                    </View>
                    <ArrowRight size={icons.sm} strokeWidth={icons.stroke} color={colors.primaryText} />
                  </Card>
                </Pressable>
              ))}
            </View>

            <Button
              label="Write my own"
              variant="secondary"
              fullWidth
              onPress={() => router.push(`/habit/new?onboarding=1&start=${chosenStart}`)}
            />
            <Button label="Back" variant="ghost" fullWidth onPress={() => setStep(0)} />
          </View>
        )}
      </ContentColumn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  welcome: {
    flex: 1,
    gap: space.xxxl,
    paddingTop: space.xxl,
  },
  choose: {
    flex: 1,
    gap: space.xxl,
    paddingTop: space.xxl,
  },
  copy: { gap: space.md },
  list: { gap: space.md },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    borderRadius: radius.lg,
  },
  suggestionText: { flex: 1, gap: space.xs },
});
