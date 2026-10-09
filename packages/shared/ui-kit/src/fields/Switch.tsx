'use client';
import { useLocale, getDirection } from '@dukani/i18n';
import { Switch as RSwitch } from 'radix-ui';
import { useId, type ReactNode } from 'react';
import { cn } from '../lib/cn';

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
}: {
  checked?: boolean;
  onChange?: (v: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const direction = getDirection(useLocale());
  const id = useId();
  return (
    <div
      className={cn(
        'flex min-h-11 items-center justify-between gap-3 py-2',
        disabled && 'opacity-disabled',
        className,
      )}
    >
      <label htmlFor={id} className="flex flex-col gap-0.5">
        <span className="text-body-m text-fg-primary">{label}</span>
        {description ? <span className="text-body-s text-fg-secondary">{description}</span> : null}
      </label>
      <RSwitch.Root
        id={id}
        dir={direction}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
        className="bg-fg-tertiary data-[state=checked]:bg-action relative h-6 w-11 shrink-0 rounded-full transition-colors"
      >
        <RSwitch.Thumb className="bg-surface shadow-subtle block size-5 rounded-full transition-transform ltr:translate-x-[2px] ltr:data-[state=checked]:translate-x-[22px] rtl:translate-x-[-2px] rtl:data-[state=checked]:translate-x-[-22px]" />
      </RSwitch.Root>
    </div>
  );
}
