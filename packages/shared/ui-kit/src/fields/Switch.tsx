'use client';
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
  const id = useId();
  return (
    <div className={cn('flex min-h-11 items-center justify-between gap-3 py-2', disabled && 'opacity-45', className)}>
      <label htmlFor={id} className="flex flex-col gap-0.5">
        <span className="text-body-m text-fg-primary">{label}</span>
        {description ? <span className="text-body-s text-fg-secondary">{description}</span> : null}
      </label>
      <RSwitch.Root
        id={id}
        dir="rtl"
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
        className="relative h-6 w-11 shrink-0 rounded-full bg-fg-tertiary transition-colors data-[state=checked]:bg-brand"
      >
        <RSwitch.Thumb className="block size-5 translate-x-[-2px] rounded-full bg-surface shadow-subtle transition-transform data-[state=checked]:translate-x-[-22px]" />
      </RSwitch.Root>
    </div>
  );
}
