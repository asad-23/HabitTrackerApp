import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

import { useDataStore } from '@/stores/useData';
import { useSettingsStore } from '@/stores/useSettings';
import { notificationUrl, syncNotifications } from '@/notifications/scheduler';

const RESYNC_INTERVAL_MS = 30 * 60 * 1000;

/** Keeps the seven-day plan in step with the notebook, and routes taps. */
export function useNotificationSync() {
  useEffect(() => {
    const isWeb = Platform.OS === 'web';
    let timer: ReturnType<typeof setTimeout> | null = null;

    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        syncNotifications().catch(() => {
          // Reminders are best effort; the app works fully without them.
        });
      }, 500);
    };

    schedule();

    const unsubscribeData = useDataStore.subscribe(schedule);
    const unsubscribeSettings = useSettingsStore.subscribe(schedule);

    if (isWeb) {
      // Timers only live while the tab is open, so rebuild the plan whenever
      // the user comes back and once every half hour for long sessions.
      const onVisibilityChange = () => {
        if (document.visibilityState === 'visible') schedule();
      };

      document.addEventListener('visibilitychange', onVisibilityChange);
      const interval = setInterval(schedule, RESYNC_INTERVAL_MS);

      return () => {
        if (timer) clearTimeout(timer);
        clearInterval(interval);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        unsubscribeData();
        unsubscribeSettings();
      };
    }

    const openUrl = (url: string | null) => {
      if (url) router.push(url as never);
    };

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      openUrl(notificationUrl(response));
    });

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response) {
          openUrl(notificationUrl(response));
          return Notifications.clearLastNotificationResponseAsync();
        }
        return undefined;
      })
      .catch(() => {});

    return () => {
      if (timer) clearTimeout(timer);
      unsubscribeData();
      unsubscribeSettings();
      responseSubscription.remove();
    };
  }, []);
}
