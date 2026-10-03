import type { Brand } from '../brand';

/** Calendar date without time, as the backend `DateOnly` (`2026-09-27`). */
export type DateOnly = Brand<string, 'DateOnly'>;

export type JalaliParts = { readonly year: number; readonly month: number; readonly day: number };

export type CalendarCell = { readonly date: Date; readonly inMonth: boolean };

export type JalaliInputError = 'empty' | 'format' | 'invalid';

export type DateRange = { readonly from: DateOnly; readonly to: DateOnly };

/** Same presets as the backend `PeriodPreset`; ranges are inclusive business days. */
export type PeriodPreset =
  | 'Today'
  | 'Yesterday'
  | 'ThisWeek'
  | 'LastWeek'
  | 'ThisMonth'
  | 'LastMonth'
  | 'Last7Days'
  | 'Last30Days'
  | 'Last90Days';
