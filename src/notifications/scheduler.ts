import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AndroidImportance, AndroidNotificationVisibility } from 'expo-notifications';

import { listCheckInsForRange } from '@/db/repositories/checkins';
import { listActiveHabits } from '@/db/repositories/habits';
import { checkInsToMap } from '@/domain/consistency';
import { addDays } from '@/domain/dates';
import { useSessionStore } from '@/stores/useSession';
import { useSettingsStore } from '@/stores/useSettings';
import { buildPlan, PLAN_DAYS, type PlannedNotification } from './plan';
import {
  clearWebNotifications,
  getWebPermissionStatus,
  requestWebPermission,
  scheduleWebNotifications,
  sendWebTestReminder,
} from './web';

const CHANNEL_ID = 'reminders';
const isWeb = Platform.OS === 'web';

if (!isWeb) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      // Android hides the banner when this is false, even with a silent channel.
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function getPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  if (isWeb) return getWebPermissionStatus();

  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return 'granted';
  // iOS can authorize provisionally (quiet delivery) without `granted`.
  // eslint-disable-next-line import/namespace -- the enum is exported at runtime
  if (settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) return 'granted';
  return settings.canAskAgain ? 'undetermined' : 'denied';
}

/**
 * Android 13 only shows the permission prompt after at least one channel
 * exists, so this must run before `requestPermissionsAsync`.
 */
export async function ensureChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Reminders',
    importance: AndroidImportance.DEFAULT,
    sound: null,
    vibrationPattern: null,
    lockscreenVisibility: AndroidNotificationVisibility.PRIVATE,
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (isWeb) return requestWebPermission();

  await ensureChannel();

  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  if (!existing.canAskAgain) return false;

  const requested = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: false },
  });
  return requested.granted;
}

function currentPlan(): PlannedNotification[] {
  const today = useSessionStore.getState().todayKey;
  const settings = useSettingsStore.getState();
  const habits = listActiveHabits();
  const checkIns = checkInsToMap(
    listCheckInsForRange(addDays(today, -(PLAN_DAYS + 30)), today),
  );

  return buildPlan({
    habits,
    checkIns,
    today,
    now: new Date(),
    reflectionTime: settings.reflectionTime,
    defaultReminderTime: settings.defaultReminderTime,
  });
}

/**
 * Replaces the whole pending schedule with a fresh seven-day plan. Called after
 * anything that could change it: opening the app, a check-in, an edit.
 */
export async function syncNotifications(): Promise<number> {
  const permission = await getPermissionStatus();
  if (permission !== 'granted') {
    if (isWeb) clearWebNotifications();
    return 0;
  }

  const plan = currentPlan();

  if (isWeb) return scheduleWebNotifications(plan);

  await ensureChannel();
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Promise.all(
    plan.map((item) =>
      Notifications.scheduleNotificationAsync({
        identifier: item.id,
        content: {
          title: item.title,
          body: item.body,
          data: { url: item.url, kind: item.kind },
          sound: false,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: item.date,
          channelId: CHANNEL_ID,
        },
      }),
    ),
  );

  return plan.length;
}

/**
 * Sends one reminder through the same path as a real one, so the user can
 * confirm that permission, channels, and the browser's popups all work.
 */
export async function sendTestReminder(): Promise<boolean> {
  if (isWeb) return sendWebTestReminder();

  const permission = await getPermissionStatus();
  if (permission !== 'granted') return false;

  await ensureChannel();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'A quiet nudge',
      body: 'This is how a reminder will look. Nothing to do yet.',
      data: { url: 'twice://today', kind: 'test' },
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3,
      channelId: CHANNEL_ID,
    },
  });

  return true;
}

/** Reads the URL carried by a tapped notification. */
export function notificationUrl(response: Notifications.NotificationResponse): string | null {
  const url = response.notification.request.content.data?.url;
  return typeof url === 'string' ? url : null;
}
