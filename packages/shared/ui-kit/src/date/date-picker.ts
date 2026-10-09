import {
  daysInJalaliMonth,
  formatJalali,
  fromDateOnly,
  fromJalali,
  toDateOnly,
  toJalali,
  type DateOnly,
} from '@dukani/domain';
import type { DatePart, DatePickerDraft } from './date-picker.types';

export function createDatePickerDraft(date: DateOnly): DatePickerDraft {
  return { draft: date, cursorDate: date, typed: formatJalali(date), inputError: null, correctedDay: null };
}

/** Apply a part to the latest draft, so concurrently settling columns cannot overwrite each other. */
export function changeDatePart(state: DatePickerDraft, part: DatePart, value: number): DatePickerDraft {
  const parts = { ...toJalali(fromDateOnly(state.cursorDate)), [part]: value };
  const day = Math.min(parts.day, daysInJalaliMonth(parts.year, parts.month));
  return {
    ...createDatePickerDraft(toDateOnly(fromJalali({ ...parts, day }))),
    correctedDay: day !== parts.day ? day : null,
  };
}
