import { createMMKV } from 'react-native-mmkv';

import type { CheckIn, Habit } from '@/db/schema';
import { findRescueMiss } from '@/domain/consistency';
import { daysBetween, type DateKey } from '@/domain/dates';

const storage = createMMKV({ id: 'twice.rescue' });
const HISTORY_KEY = 'rescue-history';
const DISMISSED_KEY = 'rescue-dismissed-on';
const NO_REPEAT_DAYS = 3;

type HistoryEntry = { date: DateKey; habitId: number };

function readHistory(): HistoryEntry[] {
  const raw = storage.getString(HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is HistoryEntry =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as HistoryEntry).date === 'string' &&
        typeof (entry as HistoryEntry).habitId === 'number',
    );
  } catch {
    return [];
  }
}

export type Rescue = {
  habit: Habit;
  wasYesterday: boolean;
  /** The local day that was missed. */
  missedOn: DateKey;
};

export function isRescueDismissed(today: DateKey): boolean {
  return storage.getString(DISMISSED_KEY) === today;
}

export function dismissRescue(today: DateKey): void {
  storage.set(DISMISSED_KEY, today);
}

export function rememberRescue(today: DateKey, habitId: number): void {
  const history = readHistory().filter((entry) => entry.date !== today);
  history.push({ date: today, habitId });
  storage.set(HISTORY_KEY, JSON.stringify(history.slice(-12)));
}

/**
 * Picks one habit to rescue, preferring one that has not been chosen in the
 * last three days so the same plant never nags twice in a row.
 */
export function selectRescue(
  habits: Habit[],
  checkIns: Map<string, CheckIn>,
  today: DateKey,
): Rescue | null {
  if (isRescueDismissed(today)) return null;

  const candidates = habits.flatMap((habit) => {
    // Once today is logged, the thread is already kept. No need to nag again.
    if (checkIns.has(`${habit.id}:${today}`)) return [];
    const miss = findRescueMiss(habit, checkIns, today);
    return miss ? [{ habit, miss }] : [];
  });
  if (candidates.length === 0) return null;

  const recent = new Set(
    readHistory()
      .filter((entry) => daysBetween(entry.date, today) <= NO_REPEAT_DAYS)
      .map((entry) => entry.habitId),
  );
  const fresh = candidates.filter((candidate) => !recent.has(candidate.habit.id));
  const pool = fresh.length > 0 ? fresh : candidates;
  const seed = Number(today.replace(/-/g, ''));
  const chosen = pool[seed % pool.length];
  if (!chosen) return null;

  return {
    habit: chosen.habit,
    wasYesterday: chosen.miss.wasYesterday,
    missedOn: chosen.miss.date,
  };
}
