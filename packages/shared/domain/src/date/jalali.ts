// Jalali calendar helpers over date-fns-jalali (adapter). Values stored/sent are Gregorian
// `DateOnly` strings (YYYY-MM-DD) or UTC instants; the Jalali form is display/input only.
import {
  addDays,
  addMonths,
  format,
  getDate,
  getDaysInMonth,
  getMonth,
  getYear,
  isValid,
  newDate,
  startOfMonth,
} from 'date-fns-jalali';

import { err, ok } from '../result';
import type { Result } from '../result.types';
import { normalizeDigits, toPersianDigits } from '../text/digits';
import type {
  CalendarCell,
  DateOnly,
  DateRange,
  JalaliInputError,
  JalaliParts,
  PeriodPreset,
} from './jalali.types';

const pad = (n: number) => String(n).padStart(2, '0');

export const toDateOnly = (d: Date): DateOnly =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` as DateOnly;

export const fromDateOnly = (s: DateOnly | string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y!, m! - 1, d!);
};

export const todayDateOnly = (): DateOnly => toDateOnly(new Date());

export const toJalali = (d: Date): JalaliParts => ({
  year: getYear(d),
  month: getMonth(d) + 1,
  day: getDate(d),
});

export const fromJalali = (p: JalaliParts): Date => newDate(p.year, p.month - 1, p.day);

export const daysInJalaliMonth = (year: number, month: number): number =>
  getDaysInMonth(newDate(year, month - 1, 1));

export const addJalaliMonths = (d: Date, n: number): Date => addMonths(d, n);

/** «۱۴۰۵/۰۷/۰۵» by default; any date-fns pattern (e.g. `d MMMM yyyy`). */
export const formatJalali = (d: Date | DateOnly, pattern = 'yyyy/MM/dd'): string =>
  toPersianDigits(format(typeof d === 'string' ? fromDateOnly(d) : d, pattern));

export const isSameDate = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Index 0 = Saturday … 6 = Friday. */
export const weekdayIndex = (d: Date): number => (d.getDay() + 1) % 7;

/** 6×7 grid of a Jalali month for the date picker, weeks starting on Saturday. */
export const jalaliMonthGrid = (year: number, month: number): CalendarCell[][] => {
  const first = startOfMonth(newDate(year, month - 1, 1));
  const start = addDays(first, -weekdayIndex(first));
  const weeks: CalendarCell[][] = [];
  for (let w = 0; w < 6; w++) {
    const row: CalendarCell[] = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(start, w * 7 + i);
      row.push({ date, inMonth: getMonth(date) === month - 1 });
    }
    weeks.push(row);
  }
  return weeks;
};

/** Parses typed Jalali dates like «۱۴۰۵/۷/۵» or «1405-07-05». */
export const parseJalaliInput = (raw: string): Result<DateOnly, JalaliInputError> => {
  const s = normalizeDigits(raw).trim();
  if (s === '') return err('empty');
  const m = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/.exec(s);
  if (!m) return err('format');
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (month < 1 || month > 12 || day < 1 || day > daysInJalaliMonth(year, month)) return err('invalid');
  const date = fromJalali({ year, month, day });
  return isValid(date) ? ok(toDateOnly(date)) : err('invalid');
};

export const resolvePeriod = (preset: PeriodPreset, today: Date = new Date()): DateRange => {
  const range = (a: Date, b: Date): DateRange => ({ from: toDateOnly(a), to: toDateOnly(b) });
  const weekStart = addDays(today, -weekdayIndex(today));
  const monthStart = startOfMonth(today);
  switch (preset) {
    case 'Today':
      return range(today, today);
    case 'Yesterday':
      return range(addDays(today, -1), addDays(today, -1));
    case 'ThisWeek':
      return range(weekStart, today);
    case 'LastWeek':
      return range(addDays(weekStart, -7), addDays(weekStart, -1));
    case 'ThisMonth':
      return range(monthStart, today);
    case 'LastMonth':
      return range(addMonths(monthStart, -1), addDays(monthStart, -1));
    case 'Last7Days':
      return range(addDays(today, -6), today);
    case 'Last30Days':
      return range(addDays(today, -29), today);
    case 'Last90Days':
      return range(addDays(today, -89), today);
  }
};
