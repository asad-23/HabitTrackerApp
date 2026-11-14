import { create } from 'zustand';

import { todayKey as realTodayKey, type DateKey } from '@/domain/dates';
import { useSettingsStore } from './useSettings';

type SessionState = {
  todayKey: DateKey;
  refreshToday: () => void;
  setTodayKey: (key: DateKey) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  todayKey: realTodayKey(),
  refreshToday: () => {
    const override = useSettingsStore.getState().devDateOverride;
    set({ todayKey: override ?? realTodayKey() });
  },
  setTodayKey: (todayKey) => set({ todayKey }),
}));
