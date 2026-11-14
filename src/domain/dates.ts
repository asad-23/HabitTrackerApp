/**
 * Local-date helpers.
 *
 * A DateKey is always a local calendar day in `YYYY-MM-DD` form. We never use
 * `toISOString()` to derive one: that would shift the day for most of the world.
 */

export type DateKey = string;

const DAY_MS = 86_400_000;
const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const LONG_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export const ALL_DAYS = 0b1111111;
/**
 * Bangladeshi working week: Sunday through Thursday are weekdays, Friday and
 * Saturday are the weekend. Bit 0 is still Monday so existing rows stay valid.
 */
export const WEEKDAYS = 0b1001111; // Sun, Mon, Tue, Wed, Thu
export const WEEKENDS = 0b0110000; // Fri, Sat

/** Display order for the repeat picker: Sunday first. */
export const WEEK_DISPLAY_ORDER = [6, 0, 1, 2, 3, 4, 5] as const;

export function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/** Format a real Date using its local calendar parts. */
export function toDateKey(date: Date): DateKey {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Noon avoids DST boundaries where midnight can not exist. */
export function fromDateKey(key: DateKey): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1, 12, 0, 0, 0);
}

export function todayKey(now: Date = new Date()): DateKey {
  return toDateKey(now);
}

export function isDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = fromDateKey(value);
  return !Number.isNaN(date.getTime()) && toDateKey(date) === value;
}

export function addDays(key: DateKey, amount: number): DateKey {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

/** Monday = 0 … Sunday = 6. */
export function weekdayIndex(key: DateKey): number {
  return (fromDateKey(key).getDay() + 6) % 7;
}

export function dayName(index: number, short = false): string {
  return short ? (SHORT_DAYS[index] ?? '') : (LONG_DAYS[index] ?? '');
}

/** Sunday = 0 … Saturday = 6, matching the Bangladeshi week. */
export function startOfWeek(key: DateKey): DateKey {
  return addDays(key, -((weekdayIndex(key) + 1) % 7));
}

export function endOfWeek(key: DateKey): DateKey {
  return addDays(startOfWeek(key), 6);
}

export function daysBetween(from: DateKey, to: DateKey): number {
  const a = fromDateKey(from);
  const b = fromDateKey(to);
  const aUtc = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const bUtc = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((bUtc - aUtc) / DAY_MS);
}

export function rangeDays(start: DateKey, end: DateKey): DateKey[] {
  const length = daysBetween(start, end);
  if (length < 0) return [];
  return Array.from({ length: length + 1 }, (_, index) => addDays(start, index));
}

/** Today when it is Sunday, otherwise the coming Sunday. */
export function upcomingSunday(key: DateKey): DateKey {
  const index = weekdayIndex(key);
  return index === 6 ? key : addDays(key, 6 - index);
}

export function nextMidnightDelay(now: Date = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1, 0);
  return Math.max(1_000, next.getTime() - now.getTime());
}

export function formatLongDate(key: DateKey): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(fromDateKey(key));
}

export function formatShortDate(key: DateKey): string {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
  }).format(fromDateKey(key));
}

export function formatFullDate(key: DateKey): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(fromDateKey(key));
}

export function formatWeekRange(start: DateKey): string {
  return `${formatShortDate(start)} – ${formatShortDate(addDays(start, 6))}`;
}

export function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

export function minutesToTime(totalMinutes: number): string {
  const normalized = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  return `${pad2(Math.floor(normalized / 60))}:${pad2(normalized % 60)}`;
}

export function timeToDate(value: string, base: Date = new Date()): Date {
  const [hours, minutes] = value.split(':').map(Number);
  return new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    hours ?? 8,
    minutes ?? 0,
    0,
    0,
  );
}

export function formatTime(value: string): string {
  if (!isValidTime(value)) return value;
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(timeToDate(value));
}

export function prefers24HourClock(): boolean {
  const hourCycle = new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions()
    .hourCycle;
  return hourCycle === 'h23' || hourCycle === 'h24';
}

export function isDayEnabled(mask: number, index: number): boolean {
  return (mask & (1 << index)) !== 0;
}

export function toggleDay(mask: number, index: number): number {
  return mask ^ (1 << index);
}

export function maskToIndexes(mask: number): number[] {
  return [0, 1, 2, 3, 4, 5, 6].filter((index) => isDayEnabled(mask, index));
}

export function formatRepeatDays(mask: number): string {
  if (mask === ALL_DAYS) return 'Every day';
  if (mask === WEEKDAYS) return 'Weekdays';
  if (mask === WEEKENDS) return 'Weekends';
  if (mask === 0) return 'No days';
  return WEEK_DISPLAY_ORDER.filter((index) => isDayEnabled(mask, index))
    .map((index) => SHORT_DAYS[index] ?? '')
    .join(', ');
}

export type SchedulableHabit = {
  startDate: DateKey;
  archivedOn: DateKey | null;
  repeatMask: number;
};

export function isHabitActiveOn(habit: SchedulableHabit, key: DateKey): boolean {
  if (key < habit.startDate) return false;
  if (habit.archivedOn && key > habit.archivedOn) return false;
  return true;
}

export function isHabitScheduledOn(habit: SchedulableHabit, key: DateKey): boolean {
  return isHabitActiveOn(habit, key) && isDayEnabled(habit.repeatMask, weekdayIndex(key));
}
