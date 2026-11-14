import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import { createMMKV } from 'react-native-mmkv';

import type { ColorMode } from '@/design/tokens';

const storage = createMMKV({ id: 'twice.settings' });

const mmkvStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => {
    storage.set(name, value);
  },
  removeItem: (name) => {
    storage.remove(name);
  },
};

export type ThemePreference = 'system' | ColorMode;

type SettingsState = {
  theme: ThemePreference;
  onboardingComplete: boolean;
  reflectionTime: string;
  defaultReminderTime: string;
  /** Dev-only. A local date key used instead of the real today. */
  devDateOverride: string | null;
  setTheme: (theme: ThemePreference) => void;
  completeOnboarding: () => void;
  setReflectionTime: (time: string) => void;
  setDefaultReminderTime: (time: string) => void;
  setDevDateOverride: (key: string | null) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      onboardingComplete: false,
      reflectionTime: '19:30',
      defaultReminderTime: '08:00',
      devDateOverride: null,
      setTheme: (theme) => set({ theme }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      setReflectionTime: (reflectionTime) => set({ reflectionTime }),
      setDefaultReminderTime: (defaultReminderTime) => set({ defaultReminderTime }),
      setDevDateOverride: (devDateOverride) => set({ devDateOverride }),
    }),
    {
      name: 'twice-settings',
      storage: createJSONStorage(() => mmkvStorage),
      version: 1,
    },
  ),
);
