import { router } from 'expo-router';

import { notify } from '@/ui/confirm';
import type { PlannedNotification } from './plan';

/**
 * Browser reminders. The Notification API can only reach the user while a tab
 * is open, so the preview keeps a timer for each item in the seven-day plan.
 * When Twice is in the foreground the nudge is drawn as an in-app popup, which
 * matches the app's own calm voice instead of the browser's chrome.
 */

/** Browsers clamp very long timeouts; a week is comfortably inside the limit. */
const MAX_DELAY_MS = 7 * 24 * 60 * 60 * 1000;

const timers = new Map<string, ReturnType<typeof setTimeout>>();

function supported(): boolean {
  return typeof window !== 'undefined' && typeof window.Notification === 'function';
}

function pathForUrl(url: string): string {
  return url === 'twice://reflect' ? '/reflect' : '/';
}

export function getWebPermissionStatus(): 'granted' | 'denied' | 'undetermined' {
  if (!supported()) return 'denied';
  switch (window.Notification.permission) {
    case 'granted':
      return 'granted';
    case 'denied':
      return 'denied';
    default:
      return 'undetermined';
  }
}

export async function requestWebPermission(): Promise<boolean> {
  if (!supported()) return false;
  if (window.Notification.permission === 'granted') return true;
  if (window.Notification.permission === 'denied') return false;

  try {
    const result = await window.Notification.requestPermission();
    return result === 'granted';
  } catch {
    return false;
  }
}

/** Shows one nudge now: a popup in the foreground, a system toast otherwise. */
export function showWebNotification(title: string, body: string, url: string): void {
  if (typeof window === 'undefined') return;

  const foreground =
    typeof document !== 'undefined' && document.visibilityState === 'visible';

  if (foreground || getWebPermissionStatus() !== 'granted') {
    notify(title, body);
    return;
  }

  try {
    const notification = new window.Notification(title, { body, tag: url, silent: true });
    notification.onclick = () => {
      window.focus();
      router.push(pathForUrl(url) as never);
      notification.close();
    };
  } catch {
    // Some browsers refuse constructor notifications; the popup still lands.
    notify(title, body);
  }
}

export function clearWebNotifications(): void {
  for (const timer of timers.values()) clearTimeout(timer);
  timers.clear();
}

export function scheduleWebNotifications(plan: PlannedNotification[]): number {
  clearWebNotifications();

  const now = Date.now();
  let scheduled = 0;

  for (const item of plan) {
    const delay = item.date.getTime() - now;
    if (delay <= 0 || delay > MAX_DELAY_MS) continue;

    const timer = setTimeout(() => {
      timers.delete(item.id);
      showWebNotification(item.title, item.body, item.url);
    }, delay);

    timers.set(item.id, timer);
    scheduled += 1;
  }

  return scheduled;
}

/** Returns false when the browser has not granted notification permission. */
export function sendWebTestReminder(): boolean {
  if (getWebPermissionStatus() !== 'granted') return false;
  showWebNotification(
    'A quiet nudge',
    'This is how a reminder will look. Nothing to do yet.',
    'twice://today',
  );
  return true;
}
