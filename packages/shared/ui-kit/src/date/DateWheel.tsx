'use client';
import { useEffect, useId, useRef } from 'react';
import {
  DATE_WHEEL_ROW_HEIGHT,
  DATE_WHEEL_VISIBLE_ROWS,
  DATE_WHEEL_SETTLE_DELAY,
} from './date-picker.constants';
import type { CSSProperties } from 'react';
import { cn } from '../lib/cn';
import type { DateWheelProps } from './DateWheel.types';

/** Five 48px rows, with the selected row snapped to the centre (Figma 633:495). */
export function DateWheel({
  label,
  part,
  describedBy,
  value,
  values,
  format,
  onChange,
  invalid,
  onSettlingChange,
}: DateWheelProps) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const index = values.indexOf(value);
  useEffect(() => {
    // A sibling column can clamp this value while the user is still scrolling it.
    // Preserve that pending gesture; its part update is merged into the latest draft.
    if (ref.current && timer.current === undefined) ref.current.scrollTop = index * DATE_WHEEL_ROW_HEIGHT;
  }, [index, value]);
  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
      onSettlingChange(part, false);
    };
  }, [part, onSettlingChange]);
  const chooseIndex = (next: number) => {
    const candidate = values[Math.max(0, Math.min(values.length - 1, next))];
    if (candidate !== undefined) {
      if (ref.current) ref.current.scrollTop = values.indexOf(candidate) * DATE_WHEEL_ROW_HEIGHT;
      onChange(part, candidate);
    }
  };
  return (
    <div className="min-w-0">
      <div id={id} className="text-body-m text-fg-secondary mb-2 text-center leading-7">
        {label}
      </div>
      <div
        ref={ref}
        role="spinbutton"
        tabIndex={0}
        aria-labelledby={id}
        aria-valuemin={values[0]}
        aria-valuemax={values[values.length - 1]}
        aria-valuenow={value}
        aria-valuetext={format(value)}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        style={
          {
            '--date-wheel-row': `${DATE_WHEEL_ROW_HEIGHT}px`,
            '--date-wheel-height': `${DATE_WHEEL_ROW_HEIGHT * DATE_WHEEL_VISIBLE_ROWS}px`,
            '--date-wheel-padding': `${(DATE_WHEEL_ROW_HEIGHT * (DATE_WHEEL_VISIBLE_ROWS - 1)) / 2}px`,
          } as CSSProperties
        }
        data-vaul-no-drag
        className="focus-visible:outline-focus h-[var(--date-wheel-height)] snap-y snap-mandatory [scrollbar-width:none] overflow-y-auto overscroll-contain rounded-sm py-[var(--date-wheel-padding)] focus-visible:outline-2 [&::-webkit-scrollbar]:hidden"
        onScroll={() => {
          clearTimeout(timer.current);
          onSettlingChange(part, true);
          timer.current = setTimeout(() => {
            timer.current = undefined;
            const next = Math.max(
              0,
              Math.min(values.length - 1, Math.round((ref.current?.scrollTop ?? 0) / DATE_WHEEL_ROW_HEIGHT)),
            );
            const candidate = values[next];
            if (candidate !== undefined && candidate !== value) onChange(part, candidate);
            onSettlingChange(part, false);
          }, DATE_WHEEL_SETTLE_DELAY);
        }}
        onKeyDown={(event) => {
          const next = {
            ArrowDown: index + 1,
            ArrowUp: index - 1,
            PageDown: index + DATE_WHEEL_VISIBLE_ROWS,
            PageUp: index - DATE_WHEEL_VISIBLE_ROWS,
            Home: 0,
            End: values.length - 1,
          }[event.key];
          if (next === undefined) return;
          event.preventDefault();
          clearTimeout(timer.current);
          timer.current = undefined;
          onSettlingChange(part, false);
          chooseIndex(next);
        }}
      >
        {values.map((item, itemIndex) => (
          <div
            key={item}
            aria-hidden="true"
            onClick={() => {
              clearTimeout(timer.current);
              timer.current = undefined;
              onSettlingChange(part, false);
              chooseIndex(itemIndex);
            }}
            className={cn(
              'tabular text-fg-secondary flex h-[var(--date-wheel-row)] shrink-0 cursor-pointer snap-center items-center justify-center rounded-sm text-[18px] leading-7',
              item === value
                ? 'bg-brand-subtle text-fg-primary text-[20px] font-semibold'
                : Math.abs(itemIndex - index) === 1
                  ? 'opacity-80'
                  : 'opacity-45',
            )}
          >
            {format(item)}
          </div>
        ))}
      </div>
    </div>
  );
}
