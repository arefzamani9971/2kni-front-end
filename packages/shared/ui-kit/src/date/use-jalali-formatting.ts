import { useFormatter, useLocale } from '@dukani/i18n';
import {
  formatJalali,
  fromDateOnly,
  fromJalali,
  normalizeDigits,
  JALALI_MONTHS,
  WEEKDAYS,
  WEEKDAYS_SHORT,
  type DateOnly,
} from '@dukani/domain';
/** Language changes presentation, never the Jalali calendar or DateOnly contract. */
export function useJalaliFormatting() {
  const locale = useLocale();
  const formatter = useFormatter();
  const calendarDate = (date: Date) =>
    new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12));
  const monthName = (month: number) =>
    locale === 'fa'
      ? (JALALI_MONTHS[month - 1] ?? '')
      : formatter.dateTime(calendarDate(fromJalali({ year: 1405, month, day: 1 })), {
          timeZone: 'UTC',
          calendar: 'persian',
          month: 'long',
        });
  const date = (value: Date | DateOnly, pattern = 'yyyy/MM/dd') => {
    if (locale === 'fa') return formatJalali(value, pattern);
    if (!pattern.includes('MMMM')) return normalizeDigits(formatJalali(value, pattern));
    return formatter.dateTime(calendarDate(typeof value === 'string' ? fromDateOnly(value) : value), {
      timeZone: 'UTC',
      calendar: 'persian',
      day: 'numeric',
      month: 'long',
      ...(pattern.includes('yyyy') ? { year: 'numeric' as const } : {}),
      ...(pattern.includes('EEEE') ? { weekday: 'long' as const } : {}),
    });
  };
  const weekday = (index: number, short = false) =>
    locale === 'fa'
      ? ((short ? WEEKDAYS_SHORT[index] : WEEKDAYS[index]) ?? '')
      : formatter.dateTime(new Date(Date.UTC(2026, 8, 19 + index, 12)), {
          timeZone: 'UTC',
          weekday: short ? 'short' : 'long',
        });
  return {
    date,
    monthName,
    weekday,
    number: (value: number) => formatter.number(value, { useGrouping: false }),
  };
}
