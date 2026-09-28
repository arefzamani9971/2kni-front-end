'use client';
import { Checkbox as RCheckbox } from 'radix-ui';
import { useId, type ReactNode } from 'react';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';

export type CheckboxProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
};

export function Checkbox({ label, description, onChange, className, id, ...props }: CheckboxProps) {
  const autoId = useId();
  const cid = id ?? autoId;
  return (
    <div className={cn('flex min-h-11 items-start gap-3 py-2', props.disabled && 'opacity-45', className)}>
      <RCheckbox.Root
        id={cid}
        {...props}
        onCheckedChange={(v) => onChange?.(v === true)}
        className="flex size-5.5 shrink-0 items-center justify-center rounded-[5px] border-[1.5px] border-line-strong bg-surface data-[state=checked]:border-action data-[state=checked]:bg-action"
      >
        <RCheckbox.Indicator className="text-fg-inverse">
          <Icon name="check" size={14} strokeWidth={3} />
        </RCheckbox.Indicator>
      </RCheckbox.Root>
      <label htmlFor={cid} className="flex flex-col gap-0.5">
        <span className="text-body-m text-fg-primary">{label}</span>
        {description ? <span className="text-body-s text-fg-secondary">{description}</span> : null}
      </label>
    </div>
  );
}
