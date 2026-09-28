'use client';
import { RadioGroup as RRadioGroup } from 'radix-ui';
import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export type RadioOption<V extends string> = { value: V; label: ReactNode; description?: ReactNode; disabled?: boolean };

/** Radio list rendered as selectable cards (Figma Payment Method Row pattern). */
export function RadioGroup<V extends string>({
  value,
  onChange,
  options,
  label,
  className,
  variant = 'card',
  indicator = true,
}: {
  value?: V;
  onChange?: (value: V) => void;
  options: readonly RadioOption<V>[];
  label?: string;
  className?: string;
  variant?: 'card' | 'plain';
  /** false: selection shown by the card frame only (Figma ST02 store-type cards). */
  indicator?: boolean;
}) {
  return (
    <RRadioGroup.Root
      value={value}
      onValueChange={(v) => onChange?.(v as V)}
      aria-label={label}
      className={cn('flex flex-col', variant === 'card' ? 'gap-3' : 'gap-1', className)}
      dir="rtl"
    >
      {options.map((o) => (
        <RRadioGroup.Item
          key={o.value}
          value={o.value}
          disabled={o.disabled}
          className={cn(
            'group flex w-full items-center gap-3 text-start disabled:opacity-45',
            variant === 'card' &&
              'min-h-13 rounded-md border border-line bg-surface px-4 py-3 data-[state=checked]:border-focus data-[state=checked]:bg-brand-subtle data-[state=checked]:shadow-[inset_0_0_0_1px_var(--dukani-color-border-focus)]',
            variant === 'plain' && 'min-h-11 py-2',
          )}
        >
          {indicator ? (
            <span className="flex size-5.5 shrink-0 items-center justify-center rounded-full border-2 border-line-strong bg-surface group-data-[state=checked]:border-action">
              <RRadioGroup.Indicator className="size-2.5 rounded-full bg-action" />
            </span>
          ) : null}
          <span className="flex flex-1 flex-col gap-0.5">
            <span className={cn('text-label-m text-fg-primary', !indicator && 'text-heading-s group-data-[state=checked]:text-fg-brand')}>{o.label}</span>
            {o.description ? <span className="text-body-s text-fg-secondary">{o.description}</span> : null}
          </span>
        </RRadioGroup.Item>
      ))}
    </RRadioGroup.Root>
  );
}
