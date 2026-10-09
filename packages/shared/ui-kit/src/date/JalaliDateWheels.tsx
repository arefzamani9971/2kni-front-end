'use client';
import { useId } from 'react';
import { daysInJalaliMonth, fromDateOnly, JALALI_MONTHS, toJalali, toPersianDigits } from '@dukani/domain';
import { DateWheel } from './DateWheel';
import type { JalaliDateWheelsProps } from './JalaliDateWheels.types';
import { DATE_WHEEL_YEAR_WINDOW } from './date-picker.constants';

/** Dukani/Date Picker Responsive mobile, Figma 633:495. Draft is owned by DateField. */
export function JalaliDateWheels({
  value,
  onChange,
  min,
  max,
  error,
  announcement,
  onSettlingChange,
}: JalaliDateWheelsProps) {
  const parts = toJalali(fromDateOnly(value));
  const errorId = useId();
  // A rolling window limits DOM size, not the available business date range.
  const firstYear = Math.max(min ? toJalali(fromDateOnly(min)).year : 1, parts.year - DATE_WHEEL_YEAR_WINDOW);
  const lastYear = Math.min(
    max ? toJalali(fromDateOnly(max)).year : 9999,
    parts.year + DATE_WHEEL_YEAR_WINDOW,
  );
  const numbers = (first: number, last: number) =>
    Array.from({ length: Math.max(0, last - first + 1) }, (_, i) => first + i);
  return (
    <div>
      <div className="grid grid-cols-[minmax(0,104fr)_minmax(0,134fr)_minmax(0,104fr)] gap-2" dir="rtl">
        <DateWheel
          label="روز"
          part="day"
          onSettlingChange={onSettlingChange}
          value={parts.day}
          values={numbers(1, daysInJalaliMonth(parts.year, parts.month))}
          format={toPersianDigits}
          onChange={onChange}
          invalid={!!error}
          describedBy={error ? errorId : undefined}
        />
        <DateWheel
          label="ماه"
          part="month"
          onSettlingChange={onSettlingChange}
          value={parts.month}
          values={numbers(1, 12)}
          format={(month) => JALALI_MONTHS[month - 1] ?? ''}
          onChange={onChange}
          invalid={!!error}
          describedBy={error ? errorId : undefined}
        />
        <DateWheel
          label="سال"
          part="year"
          onSettlingChange={onSettlingChange}
          value={parts.year}
          values={numbers(Math.min(firstYear, parts.year), Math.max(lastYear, parts.year))}
          format={toPersianDigits}
          onChange={onChange}
          invalid={!!error}
          describedBy={error ? errorId : undefined}
        />
      </div>
      <span role="status" className="sr-only">
        {announcement}
      </span>
      {error ? (
        <p className="text-body-s text-danger mt-2" role="alert" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
