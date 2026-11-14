import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

import { createHabit } from '@/db/repositories/habits';
import { useDataStore } from '@/stores/useData';
import { useSessionStore } from '@/stores/useSession';
import { useSettingsStore } from '@/stores/useSettings';
import { isDateKey } from '@/domain/dates';
import { space } from '@/design/tokens';
import { HabitForm } from '@/features/habits/HabitForm';
import { AppText } from '@/ui/AppText';
import { goBack } from '@/ui/navigation';
import { Screen, ContentColumn } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';

export default function NewHabitScreen() {
  const { onboarding, start } = useLocalSearchParams<{ onboarding?: string; start?: string }>();
  const today = useSessionStore((state) => state.todayKey);
  const refresh = useDataStore((state) => state.refresh);
  const completeOnboarding = useSettingsStore((state) => state.completeOnboarding);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialStartDate = start && isDateKey(start) ? start : undefined;

  return (
    <Screen bottomInset={32}>
      <ContentColumn>
        <ScreenHeader
          title="New habit"
          subtitle="Small enough to keep on a hard day."
          onBack={goBack}
        />

        <HabitForm
          submitLabel="Save habit"
          busy={busy}
          initialStartDate={initialStartDate}
          onCancel={goBack}
          onSubmit={(draft) => {
            setBusy(true);
            setError(null);
            try {
              createHabit(draft, today);
              refresh();
              if (onboarding === '1') {
                completeOnboarding();
                router.replace('/(tabs)');
              } else {
                goBack();
              }
            } catch (caught) {
              setBusy(false);
              setError(caught instanceof Error ? caught.message : 'The habit could not be saved.');
            }
          }}
        />

        {error ? (
          <AppText variant="caption" tone="danger" style={{ marginTop: space.lg }}>
            {error}
          </AppText>
        ) : null}

        <AppText variant="caption" tone="faint" style={{ marginTop: space.xxl }}>
          You can change all of this later. Nothing is locked in.
        </AppText>
      </ContentColumn>
    </Screen>
  );
}
