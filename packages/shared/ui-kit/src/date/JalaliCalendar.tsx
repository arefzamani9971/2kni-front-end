'use client';
import {
  JALALI_MONTHS,
  WEEKDAYS,
  WEEKDAYS_SHORT,
  formatJalali,
  fromDateOnly,
  fromJalali,
  isSameDate,
  jalaliMonthGrid,
  toDateOnly,
  toJalali,
  toPersianDigits,
  type DateOnly,
} from '@dukani/domain';
import { useMemo, useState } from 'react';
import { IconButton } from '../primitives/IconButton';
import { cn } from '../lib/cn';

export type CalendarSelection =
  | { mode: 'single'; value: DateOnly | null; onChange: (d: DateOnly) => void }
  | { mode: 'range'; value: { from: DateOnly | null; to: DateOnly | null }; onChange: (r: { from: DateOnly; to: DateOnly | null }) => void };

export type JalaliCalendarProps = CalendarSelection & {
  min?: DateOnly;
  max?: DateOnly;
  isDisabled?: (d: DateOnly) => boolean;
  className?: string;
};

/** Jalali month view, weeks start on Saturday; keyboard: arrows move, Enter selects. */
export function JalaliCalendar(props: JalaliCalendarProps) {
  const initial = props.mode === 'single' ? props.value : props.value.from;
  const start = toJalali(initial ? fromDateOnly(initial) : new Date());
  const [view, setView] = useState({ year: start.year, month: start.month });
  const [pickMonth, setPickMonth] = useState(false);
  const grid = useMemo(() => jalaliMonthGrid(view.year, view.month), [view]);
  const today = new Date();

  const shift = (delta: number) =>
    setView((v) => {
      const m = v.month + delta;
      return m < 1 ? { year: v.year - 1, month: 12 } : m > 12 ? { year: v.year + 1, month: 1 } : { year: v.year, month: m };
    });

  const disabled = (d: DateOnly) =>
    (props.min !== undefined && d < props.min) || (props.max !== undefined && d > props.max) || !!props.isDisabled?.(d);

  const inRange = (d: DateOnly) =>
    props.mode === 'range' && props.value.from && props.value.to ? d >= props.value.from && d <= props.value.to : false;
  const isEdge = (d: DateOnly) =>
    props.mode === 'single' ? props.value === d : props.value.from === d || props.value.to === d;

  const select = (d: DateOnly) => {
    if (props.mode === 'single') return props.onChange(d);
    const { from, to } = props.value;
    if (!from || to) return props.onChange({ from: d, to: null });
    return props.onChange(d < from ? { from: d, to: from } : { from, to: d });
  };

  return (
    <div className={cn('flex w-full flex-col gap-3', props.className)} dir="rtl">
      <div className="flex items-center justify-between">
        <IconButton icon="chevron-start" label="ماه قبل" onClick={() => shift(-1)} />
        <button
          type="button"
          onClick={() => setPickMonth((p) => !p)}
          className="h-11 rounded-md px-3 text-label-l text-fg-primary hover:bg-muted"
          aria-live="polite"
        >
          {JALALI_MONTHS[view.month - 1]} {toPersianDigits(view.year)}
        </button>
        <IconButton icon="chevron-end" label="ماه بعد" onClick={() => shift(1)} />
      </div>

      {pickMonth ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-center gap-4">
            <IconButton icon="chevron-start" label="سال قبل" onClick={() => setView((v) => ({ ...v, year: v.year - 1 }))} />
            <span className="text-label-l">{toPersianDigits(view.year)}</span>
            <IconButton icon="chevron-end" label="سال بعد" onClick={() => setView((v) => ({ ...v, year: v.year + 1 }))} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {JALALI_MONTHS.map((name, i) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setView((v) => ({ ...v, month: i + 1 }));
                  setPickMonth(false);
                }}
                className={cn(
                  'h-11 rounded-md text-body-m',
                  view.month === i + 1 ? 'bg-brand text-fg-inverse' : 'bg-muted text-fg-primary hover:bg-brand-subtle',
                )}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <table role="grid" className="w-full table-fixed border-collapse">
          <thead>
            <tr>
              {WEEKDAYS_SHORT.map((w, i) => (
                <th key={w} scope="col" abbr={WEEKDAYS[i]} className="h-8 text-label-s font-medium text-fg-secondary">
                  {w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((week, wi) => (
              <tr key={wi}>
                {week.map(({ date, inMonth }) => {
                  const d = toDateOnly(date);
                  const off = disabled(d);
                  const edge = isEdge(d);
                  const within = inRange(d);
                  return (
                    <td key={d} className={cn('p-0.5', within && !edge && 'bg-brand-subtle')}>
                      <button
                        type="button"
                        disabled={off}
                        aria-pressed={edge}
                        aria-label={formatJalali(date, 'EEEE d MMMM yyyy')}
                        onClick={() => select(d)}
                        className={cn(
                          'tabular mx-auto flex size-10 items-center justify-center rounded-full text-body-m transition-colors disabled:opacity-30',
                          !inMonth && 'text-fg-disabled',
                          inMonth && !edge && 'text-fg-primary hover:bg-muted',
                          edge && 'bg-brand text-fg-inverse',
                          isSameDate(date, today) && !edge && 'ring-1 ring-brand',
                        )}
                      >
                        {toPersianDigits(toJalali(date).day)}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export const jalaliToday = (): DateOnly => toDateOnly(fromJalali(toJalali(new Date())));
