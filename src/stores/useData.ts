import { create } from 'zustand';

import type { CheckIn, CheckInStatus, Habit } from '@/db/schema';
import {
  clearCheckIn,
  listCheckInsForDate,
  listCheckInsForRange,
  setCheckIn,
} from '@/db/repositories/checkins';
import { listActiveHabits } from '@/db/repositories/habits';
import { CONSISTENCY_WINDOW_DAYS, checkInsToMap } from '@/domain/consistency';
import { addDays } from '@/domain/dates';
import { refreshTodayWidget } from '@/widget/update';
import { useSessionStore } from './useSession';

type DataState = {
  habits: Habit[];
  /** Today's entry per habit, for the Today list. */
  checkInsByHabit: Record<number, CheckIn>;
  /** Last 30 days, for consistency and the garden. */
  recentCheckIns: CheckIn[];
  recentMap: Map<string, CheckIn>;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  logCheckIn: (habitId: number, status: CheckInStatus) => void;
  clearHabitCheckIn: (habitId: number) => void;
};

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'The notebook could not be read.';
}

export const useDataStore = create<DataState>((set, get) => ({
  habits: [],
  checkInsByHabit: {},
  recentCheckIns: [],
  recentMap: new Map(),
  loading: true,
  error: null,
  refresh: () => {
    try {
      const today = useSessionStore.getState().todayKey;
      const habits = listActiveHabits();
      const todayRows = listCheckInsForDate(today);
      const checkInsByHabit: Record<number, CheckIn> = {};
      for (const row of todayRows) checkInsByHabit[row.habitId] = row;

      const recentCheckIns = listCheckInsForRange(
        addDays(today, -(CONSISTENCY_WINDOW_DAYS - 1)),
        today,
      );

      set({
        habits,
        checkInsByHabit,
        recentCheckIns,
        recentMap: checkInsToMap(recentCheckIns),
        loading: false,
        error: null,
      });

      void refreshTodayWidget();
    } catch (error) {
      set({ loading: false, error: messageOf(error) });
    }
  },
  logCheckIn: (habitId, status) => {
    try {
      const today = useSessionStore.getState().todayKey;
      setCheckIn(habitId, today, status);
      get().refresh();
    } catch (error) {
      set({ error: messageOf(error) });
    }
  },
  clearHabitCheckIn: (habitId) => {
    try {
      const today = useSessionStore.getState().todayKey;
      clearCheckIn(habitId, today);
      get().refresh();
    } catch (error) {
      set({ error: messageOf(error) });
    }
  },
}));
