import { err, ok } from '../result';
import type { Result } from '../result.types';
import type { DateOnly } from './jalali.types';

/** Validate a Gregorian calendar date without time-zone conversion or Date rollover. */
export function parseDateOnly(raw: string): Result<DateOnly, 'invalid'> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return err('invalid');
  const year = Number(raw.slice(0, 4));
  const month = Number(raw.slice(5, 7));
  const day = Number(raw.slice(8, 10));
  if (year < 1 || month < 1 || month > 12 || day < 1) return err('invalid');
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= days[month - 1]! ? ok(raw as DateOnly) : err('invalid');
}
