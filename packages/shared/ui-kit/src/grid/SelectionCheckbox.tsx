'use client';
import { useLayoutEffect, useRef } from 'react';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import type { SelectionCheckboxProps } from './SelectionCheckbox.types';

/**
 * Row/header selection box of the grid: a native checkbox (cheap for 100 rows, native `indeterminate` = mixed for
 * screen readers) styled like `Checkbox` (Figma `Data Grid Row` 651:628 / `Record Card` 651:679). The label
 * wrapper extends the hit area to 44px without changing the layout.
 */
export function SelectionCheckbox({ checked, onChange, label, disabled, className }: SelectionCheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    if (ref.current) ref.current.indeterminate = checked === 'mixed';
  }, [checked]);
  return (
    <label className={cn('relative z-10 -m-[11px] inline-flex shrink-0 cursor-pointer p-[11px]', className)}>
      <input
        ref={ref}
        type="checkbox"
        aria-label={label}
        checked={checked === true}
        disabled={disabled}
        onChange={(event) => onChange(event.currentTarget.checked)}
        className="peer border-line-strong bg-surface checked:border-action checked:bg-action indeterminate:border-action indeterminate:bg-action focus-visible:outline-focus disabled:opacity-disabled size-5.5 cursor-pointer appearance-none rounded-[5px] border-[1.5px] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed"
      />
      <Icon
        name="check"
        size={14}
        strokeWidth={3}
        className="text-fg-inverse pointer-events-none absolute inset-0 m-auto hidden peer-checked:block"
      />
      <Icon
        name="minus"
        size={14}
        strokeWidth={3}
        className="text-fg-inverse pointer-events-none absolute inset-0 m-auto hidden peer-indeterminate:block"
      />
    </label>
  );
}
