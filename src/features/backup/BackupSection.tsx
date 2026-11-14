import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { useDataStore } from '@/stores/useData';
import { useSessionStore } from '@/stores/useSession';
import { space } from '@/design/tokens';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { SectionHeading } from '@/ui/ScreenHeader';
import { confirmAction, notify } from '@/ui/confirm';
import { exportBackup, importBackup } from './backup';

export function BackupSection() {
  const refresh = useDataStore((state) => state.refresh);
  const refreshToday = useSessionStore((state) => state.refreshToday);
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const runExport = async () => {
    setBusy('export');
    setNote(null);
    try {
      const summary = await exportBackup();
      setNote(
        `Exported ${summary.habits} habits and ${summary.checkIns} check-ins. Keep the file somewhere safe.`,
      );
    } catch (error) {
      notify(
        'Backup could not be created',
        error instanceof Error ? error.message : 'Something interrupted the export.',
      );
    } finally {
      setBusy(null);
    }
  };

  const runImport = async () => {
    setBusy('import');
    setNote(null);
    try {
      const result = await importBackup();
      if ('canceled' in result) return;
      refreshToday();
      refresh();
      setNote(
        `Restored ${result.habits} habits and ${result.checkIns} check-ins from your backup.`,
      );
    } catch (error) {
      notify(
        'Restore could not finish',
        error instanceof Error ? error.message : 'That file could not be read.',
      );
    } finally {
      setBusy(null);
    }
  };

  const confirmImport = () => {
    confirmAction(
      'Replace everything with a backup?',
      'Your current habits and check-ins will be replaced by the file you choose. This cannot be undone.',
      [
        { text: 'Keep my data', style: 'cancel' },
        { text: 'Choose file', style: 'destructive', onPress: () => void runImport() },
      ],
    );
  };

  return (
    <View>
      <SectionHeading title="Backup" />
      <Card style={styles.card}>
        <AppText variant="caption" tone="muted">
          Everything lives on this device. A backup file is the only copy that survives a lost
          phone.
        </AppText>
        {Platform.OS === 'web' ? (
          <AppText variant="caption" tone="muted">
            Backups belong to the mobile app. In this browser preview your notebook is stored in
            the local storage of this browser.
          </AppText>
        ) : (
          <>
            <View style={styles.actions}>
              <Button
                label="Export backup"
                variant="secondary"
                loading={busy === 'export'}
                onPress={() => void runExport()}
              />
              <Button
                label="Restore from file"
                variant="secondary"
                loading={busy === 'import'}
                onPress={confirmImport}
              />
            </View>
            {note ? (
              <AppText variant="caption" tone="primary">
                {note}
              </AppText>
            ) : null}
          </>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.md },
  actions: { gap: space.sm },
});
