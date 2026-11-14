/**
 * Pure conversions for the in-app clock.
 *
 * The clock always speaks in 12-hour terms because the dial shows twelve
 * numbers and a pair of AM/PM chips. Stored values stay `HH:mm` in 24-hour
 * form, so the rest of the app never needs to know which meridiem is showing.
 */

import { isValidTime, minutesToTime, pad2, timeToMinutes } from './dates';

export type Meridiem = 'AM' | 'PM';

export type ClockTime = {
  /** 1–12, never 0. */
  hour12: number;
  /** 0–59. */
  minute: number;
  meridiem: Meridiem;
};

export const DEFAULT_CLOCK_TIME = '08:00';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function safeTime(value: string | null): string {
  return value && isValidTime(value) ? value : DEFAULT_CLOCK_TIME;
}

/** Split a stored `HH:mm` value into the pieces the clock draws. */
export function readClock(value: string | null): ClockTime {
  const total = timeToMinutes(safeTime(value));
  const hour24 = Math.floor(total / 60);
  return {
    hour12: hour24 % 12 === 0 ? 12 : hour24 % 12,
    minute: total % 60,
    meridiem: hour24 < 12 ? 'AM' : 'PM',
  };
}

/** Join clock pieces back into a stored `HH:mm` value. */
export function writeClock(clock: ClockTime): string {
  const hour12 = clamp(Math.round(clock.hour12), 1, 12);
  const minute = clamp(Math.round(clock.minute), 0, 59);
  const hour24 = (hour12 % 12) + (clock.meridiem === 'PM' ? 12 : 0);
  return minutesToTime(hour24 * 60 + minute);
}

/** The large `9:05` text inside the picker, without a meridiem. */
export function clockText(clock: ClockTime): string {
  return `${clock.hour12}:${pad2(clock.minute)}`;
}

/** Move forward or backward by whole minutes, wrapping around midnight. */
export function shiftClockMinutes(value: string | null, delta: number): string {
  return minutesToTime(timeToMinutes(safeTime(value)) + delta);
}

export function setClockHour(value: string | null, hour12: number): string {
  return writeClock({ ...readClock(value), hour12 });
}

export function setClockMinute(value: string | null, minute: number): string {
  return writeClock({ ...readClock(value), minute });
}

export function setClockMeridiem(value: string | null, meridiem: Meridiem): string {
  return writeClock({ ...readClock(value), meridiem });
}
