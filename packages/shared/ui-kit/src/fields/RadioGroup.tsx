'use client';
import { useLocale, getDirection } from '@dukani/i18n';
import { RadioGroup as RRadioGroup } from 'radix-ui';

import { cn } from '../lib/cn';
import type { RadioOption } from './RadioGroup.types';

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
  const direction = getDirection(useLocale());
  return (
    <RRadioGroup.Root
      value={value}
      onValueChange={(v) => onChange?.(v as V)}
      aria-label={label}
      className={cn('flex flex-col', variant === 'card' ? 'gap-3' : 'gap-1', className)}
      dir={direction}
    >
      {options.map((o) => (
        <RRadioGroup.Item
          key={o.value}
          value={o.value}
          disabled={o.disabled}
          className={cn(
            'group disabled:opacity-disabled flex w-full items-center gap-3 text-start',
            variant === 'card' &&
              'border-line bg-surface data-[state=checked]:border-focus data-[state=checked]:bg-brand-subtle min-h-13 rounded-md border px-4 py-3 data-[state=checked]:shadow-[inset_0_0_0_1px_var(--dukani-color-border-focus)]',
            variant === 'plain' && 'min-h-11 py-2',
          )}
        >
          {indicator ? (
            <span className="border-line-strong bg-surface group-data-[state=checked]:border-action flex size-5.5 shrink-0 items-center justify-center rounded-full border-2">
              <RRadioGroup.Indicator className="bg-action size-2.5 rounded-full" />
            </span>
          ) : null}
          <span className="flex flex-1 flex-col gap-0.5">
            <span
              className={cn(
                'text-label-m text-fg-primary',
                !indicator && 'text-heading-s group-data-[state=checked]:text-fg-brand',
              )}
            >
              {o.label}
            </span>
            {o.description ? <span className="text-body-s text-fg-secondary">{o.description}</span> : null}
          </span>
        </RRadioGroup.Item>
      ))}
    </RRadioGroup.Root>
  );
}
