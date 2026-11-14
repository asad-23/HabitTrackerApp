import { useEffect } from 'react';
import { AppState } from 'react-native';

import { nextMidnightDelay } from '@/domain/dates';
import { useDataStore } from '@/stores/useData';
import { useSessionStore } from '@/stores/useSession';

/**
 * Keeps "today" honest while the app stays open overnight, and when it comes
 * back from the background. Everything derived from the date refreshes here.
 */
export function useDayRollover() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const refresh = () => {
      const before = useSessionStore.getState().todayKey;
      useSessionStore.getState().refreshToday();
      if (useSessionStore.getState().todayKey !== before) {
        useDataStore.getState().refresh();
      }
    };

    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        refresh();
        schedule();
      }, nextMidnightDelay());
    };

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refresh();
        schedule();
      }
    });

    schedule();

    return () => {
      if (timer) clearTimeout(timer);
      subscription.remove();
    };
  }, []);
}
