import { useCallback, useState } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { useFocusEffect } from 'expo-router';

import { useSettingsStore } from '@/stores/useSettings';
import {
  getPermissionStatus,
  requestNotificationPermission,
  sendTestReminder,
  syncNotifications,
} from '@/notifications/scheduler';
import { space } from '@/design/tokens';
import { notify } from '@/ui/confirm';
import { AppText } from '@/ui/AppText';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip, ChipRow } from '@/ui/Chip';
import { Screen, ContentColumn } from '@/ui/Screen';
import { SectionHeading } from '@/ui/ScreenHeader';
import { TimeField } from '@/ui/TimeField';
import { DevTools } from '@/features/settings/DevTools';
import { BackupSection } from '@/features/backup/BackupSection';

type Permission = 'granted' | 'denied' | 'undetermined';

export default function SettingsScreen() {
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const reflectionTime = useSettingsStore((state) => state.reflectionTime);
  const setReflectionTime = useSettingsStore((state) => state.setReflectionTime);
  const defaultReminderTime = useSettingsStore((state) => state.defaultReminderTime);
  const setDefaultReminderTime = useSettingsStore((state) => state.setDefaultReminderTime);
  const [permission, setPermission] = useState<Permission>('undetermined');
  const [testBusy, setTestBusy] = useState(false);
  const isWeb = Platform.OS === 'web';

  useFocusEffect(
    useCallback(() => {
      getPermissionStatus()
        .then((status) => {
          setPermission(status);
          // Returning from system settings should take effect right away.
          if (status === 'granted') syncNotifications().catch(() => {});
        })
        .catch(() => setPermission('undetermined'));
    }, []),
  );

  const enableReminders = async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? 'granted' : 'denied');
    if (!granted) return;

    await syncNotifications().catch(() => {});
    notify(
      'Reminders are on',
      isWeb
        ? 'A gentle nudge will appear while Twice is open in this tab.'
        : 'Twice will nudge you at the times you choose. It stays quiet when nothing is due.',
      'success',
    );
  };

  const sendTest = async () => {
    setTestBusy(true);
    try {
      const sent = await sendTestReminder();
      if (!sent) {
        notify('Reminders are off', 'Allow notifications first, then try again.', 'warning');
        return;
      }
      // The browser preview draws the test nudge itself, as a popup.
      if (!isWeb) {
        notify('Test on its way', 'It should arrive in a few seconds.', 'success');
      }
    } finally {
      setTestBusy(false);
    }
  };

  const reminderCopy = isWeb
    ? permission === 'granted'
      ? 'Reminders are on in this browser. They arrive while Twice is open in a tab.'
      : permission === 'denied'
        ? 'Notifications are blocked for this site. Allow them in your browser settings, then reload.'
        : 'Twice can nudge you at the times you choose. No streaks, no guilt.'
    : permission === 'granted'
      ? 'Reminders are on. They follow your habits and stay silent when nothing is due.'
      : permission === 'denied'
        ? 'Reminders are turned off for Twice in your system settings.'
        : 'Twice can nudge you at the times you choose. No streaks, no guilt.';

  return (
    <Screen>
      <ContentColumn>
        <View style={styles.header}>
          <AppText variant="caption" tone="muted">
            Twice
          </AppText>
          <AppText variant="display">Settings</AppText>
        </View>

        <View style={styles.section}>
          <SectionHeading title="Appearance" />
          <Card style={styles.card}>
            <AppText variant="label" weight="medium">
              Theme
            </AppText>
            <ChipRow>
              <Chip label="System" selected={theme === 'system'} onPress={() => setTheme('system')} />
              <Chip label="Light" selected={theme === 'light'} onPress={() => setTheme('light')} />
              <Chip label="Dark" selected={theme === 'dark'} onPress={() => setTheme('dark')} />
            </ChipRow>
          </Card>
        </View>

        <View style={styles.section}>
          <SectionHeading title="Reminders" />
          <Card style={styles.card}>
            <AppText variant="label" weight="medium">
              Quiet nudges
            </AppText>
            <AppText variant="caption" tone="muted">
              {reminderCopy}
            </AppText>

            {permission === 'granted' ? (
              <>
                <TimeField
                  label="Default reminder time"
                  hint="Used when a habit has no time of its own."
                  value={defaultReminderTime}
                  onChange={(value) => setDefaultReminderTime(value ?? '08:00')}
                  allowClear={false}
                />
                <TimeField
                  label="Sunday reflection"
                  hint="A weekly prompt to look back, not to score yourself."
                  value={reflectionTime}
                  onChange={(value) => setReflectionTime(value ?? '19:30')}
                  allowClear={false}
                />
                <Button
                  label="Send a test reminder"
                  variant="secondary"
                  loading={testBusy}
                  onPress={() => void sendTest()}
                />
              </>
            ) : permission === 'denied' ? (
              isWeb ? null : (
                <Button
                  label="Open system settings"
                  variant="secondary"
                  onPress={() => Linking.openSettings().catch(() => {})}
                />
              )
            ) : (
              <Button label="Turn on reminders" onPress={() => void enableReminders()} />
            )}
          </Card>
        </View>

        <View style={styles.section}>
          <BackupSection />
        </View>

        <View style={styles.section}>
          <SectionHeading title="About" />
          <Card tone="sunken" style={styles.card}>
            <AppText variant="label" weight="semibold">
              Never miss twice
            </AppText>
            <AppText variant="caption" tone="muted">
              One missed day is life. The second is the habit slipping. Twice exists to make the
              next small version easy.
            </AppText>
            <AppText variant="caption" tone="faint" style={styles.version}>
              Version {Constants.expoConfig?.version ?? '1.0.0'} · Everything stays on this device.
            </AppText>
          </Card>
        </View>

        {__DEV__ ? <DevTools /> : null}
      </ContentColumn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: space.xxl, gap: space.xs },
  section: { marginBottom: space.xxxl },
  card: { gap: space.md },
  version: { marginTop: space.xs },
});
