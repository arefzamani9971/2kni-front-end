'use client';
import {
  JALALI_MONTHS,
  WEEKDAYS,
  WEEKDAYS_SHORT,
  formatJalali,
  fromJalali,
  fromDateOnly,
  isSameDate,
  jalaliMonthGrid,
  toDateOnly,
  toJalali,
  toPersianDigits,
  type DateOnly,
} from '@dukani/domain';
import { useEffect, useMemo, useRef, useState } from 'react';
import { IconButton } from '../primitives/IconButton';
import { cn } from '../lib/cn';
import type { JalaliCalendarProps } from './JalaliCalendar.types';
import { calendarKeyTarget } from './calendar-keyboard';

/** Jalali month view, weeks start on Saturday; keyboard: arrows move, Enter selects. */
export function JalaliCalendar(props: JalaliCalendarProps) {
  const initial = props.mode === 'single' ? props.value : props.value.from;
  const start = toJalali(initial ? fromDateOnly(initial) : new Date());
  const [view, setView] = useState({ year: start.year, month: start.month });
  const [lastSelection, setLastSelection] = useState(initial);
  const [pickMonth, setPickMonth] = useState(false);
  const [focused, setFocused] = useState<DateOnly>(initial ?? toDateOnly(new Date()));
  const focusPending = useRef(false);
  const dayButtons = useRef(new Map<DateOnly, HTMLButtonElement>());
  const grid = useMemo(() => jalaliMonthGrid(view.year, view.month), [view]);
  const today = new Date();
  const tabDate = grid.flat().some((cell) => toDateOnly(cell.date) === focused)
    ? focused
    : toDateOnly(grid.flat().find((cell) => cell.inMonth)!.date);

  useEffect(() => {
    if (focusPending.current) {
      dayButtons.current.get(focused)?.focus();
      focusPending.current = false;
    }
  }, [focused, view]);

  // Reconcile an externally typed/selected date before rendering children, without
  // resetting the period whenever the user browses a month without selecting it.
  if (lastSelection !== initial) {
    setLastSelection(initial);
    if (initial) {
      setView({ year: start.year, month: start.month });
      setFocused(initial);
    }
  }

  const shift = (delta: number) =>
    setView((v) => {
      const m = v.month + delta;
      return m < 1
        ? { year: v.year - 1, month: 12 }
        : m > 12
          ? { year: v.year + 1, month: 1 }
          : { year: v.year, month: m };
    });

  const disabled = (d: DateOnly) =>
    (props.min !== undefined && d < props.min) ||
    (props.max !== undefined && d > props.max) ||
    !!props.isDisabled?.(d);

  const inRange = (d: DateOnly) =>
    props.mode === 'range' && props.value.from && props.value.to
      ? d >= props.value.from && d <= props.value.to
      : false;
  const isEdge = (d: DateOnly) =>
    props.mode === 'single' ? props.value === d : props.value.from === d || props.value.to === d;

  const select = (d: DateOnly) => {
    if (disabled(d)) return;
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
          className="text-fg-primary hover:bg-muted h-11 rounded-md px-3 text-[length:var(--dukani-calendar-month-font)] font-semibold"
          aria-expanded={pickMonth}
          aria-live="polite"
        >
          {JALALI_MONTHS[view.month - 1]} {toPersianDigits(view.year)}
        </button>
        <IconButton icon="chevron-end" label="ماه بعد" onClick={() => shift(1)} />
      </div>

      {pickMonth ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-center gap-4">
            <IconButton
              icon="chevron-start"
              label="سال قبل"
              onClick={() => setView((v) => ({ ...v, year: v.year - 1 }))}
            />
            <span className="text-label-l">{toPersianDigits(view.year)}</span>
            <IconButton
              icon="chevron-end"
              label="سال بعد"
              onClick={() => setView((v) => ({ ...v, year: v.year + 1 }))}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {JALALI_MONTHS.map((name, i) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setView((v) => ({ ...v, month: i + 1 }));
                  setFocused(toDateOnly(fromJalali({ year: view.year, month: i + 1, day: 1 })));
                  focusPending.current = true;
                  setPickMonth(false);
                }}
                className={cn(
                  'text-body-m h-11 rounded-md',
                  view.month === i + 1
                    ? 'bg-action text-fg-inverse'
                    : 'bg-muted text-fg-primary hover:bg-brand-subtle',
                )}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <table
          role="grid"
          aria-label={`${JALALI_MONTHS[view.month - 1]} ${toPersianDigits(view.year)}`}
          className="w-full table-fixed border-collapse"
        >
          <thead>
            <tr>
              {WEEKDAYS_SHORT.map((w, i) => (
                <th
                  key={w}
                  scope="col"
                  abbr={WEEKDAYS[i]}
                  className="text-fg-secondary h-8 text-[length:var(--dukani-calendar-weekday-font)] font-medium"
                >
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
                    <td
                      key={d}
                      aria-selected={edge || !!within}
                      className={cn('p-0.5', within && !edge && 'bg-brand-subtle')}
                    >
                      <button
                        ref={(element) => {
                          if (element) dayButtons.current.set(d, element);
                          else dayButtons.current.delete(d);
                        }}
                        type="button"
                        aria-disabled={off || undefined}
                        aria-current={isSameDate(date, today) ? 'date' : undefined}
                        tabIndex={d === tabDate ? 0 : -1}
                        aria-pressed={edge}
                        aria-label={formatJalali(date, 'EEEE d MMMM yyyy')}
                        onClick={() => select(d)}
                        onFocus={() => setFocused(d)}
                        onKeyDown={(event) => {
                          const target = calendarKeyTarget(d, event.key, event.shiftKey);
                          if (!target) return;
                          event.preventDefault();
                          focusPending.current = true;
                          setFocused(target);
                          const next = toJalali(fromDateOnly(target));
                          setView({ year: next.year, month: next.month });
                        }}
                        className={cn(
                          'tabular aria-disabled:text-fg-disabled mx-auto flex size-[var(--dukani-calendar-day-size)] items-center justify-center rounded-full text-[length:var(--dukani-calendar-day-font)] font-medium transition-colors aria-disabled:cursor-not-allowed',
                          !inMonth && 'text-fg-disabled',
                          inMonth && !edge && 'text-fg-primary actionable:hover:bg-brand-subtle',
                          edge && 'bg-action text-fg-inverse',
                          isSameDate(date, today) && !edge && 'ring-focus bg-brand-subtle ring-1',
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
      <span className="sr-only" aria-live="polite">
        {initial ? `تاریخ انتخاب‌شده: ${formatJalali(initial, 'd MMMM yyyy')}` : 'تاریخی انتخاب نشده است'}
      </span>
    </div>
  );
}
