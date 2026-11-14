import { router } from 'expo-router';

/**
 * Pops the stack, or lands on Today when a screen was opened directly (a deep
 * link, a browser reload, or the first screen in a fresh navigation state).
 * Without the fallback, a back button can do nothing and leave the UI stuck.
 */
export function goBack(): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace('/(tabs)');
}
