import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';

import { updateHabit } from '@/db/repositories/habits';
import { useDataStore } from '@/stores/useData';
import { space } from '@/design/tokens';
import { HabitForm } from '@/features/habits/HabitForm';
import { AppText } from '@/ui/AppText';
import { goBack } from '@/ui/navigation';
import { Screen, ContentColumn } from '@/ui/Screen';
import { ScreenHeader } from '@/ui/ScreenHeader';

export default function EditHabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const habitId = Number(id);
  const habits = useDataStore((state) => state.habits);
  const refresh = useDataStore((state) => state.refresh);
  const habit = habits.find((item) => item.id === habitId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Screen bottomInset={32}>
      <ContentColumn>
        <ScreenHeader title="Edit habit" onBack={goBack} />

        <HabitForm
          initial={habit}
          submitLabel="Save changes"
          busy={busy}
          onCancel={goBack}
          onSubmit={(draft) => {
            setBusy(true);
            setError(null);
            try {
              updateHabit(habit.id, draft);
              refresh();
              goBack();
            } catch (caught) {
              setBusy(false);
              setError(caught instanceof Error ? caught.message : 'The changes could not be saved.');
            }
          }}
        />

        {error ? (
          <AppText variant="caption" tone="danger" style={{ marginTop: space.lg }}>
            {error}
          </AppText>
        ) : null}
      </ContentColumn>
    </Screen>
  );
}
