import { addJalaliMonths, fromDateOnly, toDateOnly, weekdayIndex, type DateOnly } from '@dukani/domain';

/** RTL calendar navigation. Dates use local calendar arithmetic, never UTC millisecond offsets. */
export function calendarKeyTarget(value: DateOnly, key: string, shift: boolean): DateOnly | null {
  const date = fromDateOnly(value);
  if (key === 'PageUp' || key === 'PageDown') {
    return toDateOnly(addJalaliMonths(date, (key === 'PageUp' ? -1 : 1) * (shift ? 12 : 1)));
  }
  const offset = {
    ArrowLeft: 1,
    ArrowRight: -1,
    ArrowDown: 7,
    ArrowUp: -7,
    Home: -weekdayIndex(date),
    End: 6 - weekdayIndex(date),
  }[key];
  if (offset === undefined) return null;
  date.setDate(date.getDate() + offset);
  return toDateOnly(date);
}
