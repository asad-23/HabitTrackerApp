import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { useSettingsStore } from '@/stores/useSettings';
import { useDataStore } from '@/stores/useData';
import { useSessionStore } from '@/stores/useSession';
import { deleteAllData, seedDemoData } from '@/db/repositories/maintenance';
import { addDays, todayKey } from '@/domain/dates';
import { space } from '@/design/tokens';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip, ChipRow } from '@/ui/Chip';
import { SectionHeading } from '@/ui/ScreenHeader';

const OFFSETS = [
  { label: 'Today', offset: 0 },
  { label: 'Yesterday', offset: -1 },
  { label: 'Two days ago', offset: -2 },
  { label: 'Tomorrow', offset: 1 },
] as const;

export function DevTools() {
  const override = useSettingsStore((state) => state.devDateOverride);
  const setOverride = useSettingsStore((state) => state.setDevDateOverride);
  const refresh = useDataStore((state) => state.refresh);
  const refreshToday = useSessionStore((state) => state.refreshToday);
  const [busy, setBusy] = useState(false);

  const realToday = todayKey();
  const activeOffset = override ? OFFSETS.find((item) => addDays(realToday, item.offset) === override) : OFFSETS[0];

  const applyOffset = (offset: number) => {
    setOverride(offset === 0 ? null : addDays(realToday, offset));
    refreshToday();
    refresh();
  };

  return (
    <View style={styles.wrap}>
      <SectionHeading title="Developer" />
      <Card tone="sunken" style={styles.card}>
        <AppText variant="label" weight="medium">
          Simulated date
        </AppText>
        <AppText variant="caption" tone="muted">
          Moves the app&apos;s idea of today. Stored separately from real dates.
        </AppText>
        <ChipRow>
          {OFFSETS.map((item) => (
            <Chip
              key={item.label}
              label={item.label}
              selected={activeOffset?.offset === item.offset}
              onPress={() => applyOffset(item.offset)}
            />
          ))}
        </ChipRow>
        <View style={styles.actions}>
          <Button
            label="Seed demo data"
            variant="secondary"
            loading={busy}
            onPress={() => {
              setBusy(true);
              deleteAllData();
              seedDemoData(useSessionStore.getState().todayKey);
              refresh();
              setBusy(false);
              router.replace('/(tabs)');
            }}
          />
          <Button
            label="Clear all data"
            variant="danger"
            onPress={() => {
              deleteAllData();
              refresh();
            }}
          />
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: space.xs },
  card: { gap: space.md },
  actions: { gap: space.sm, marginTop: space.sm },
});
