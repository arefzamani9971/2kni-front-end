'use client';
import { Checkbox as RCheckbox, RadioGroup as RRadioGroup, Switch as RSwitch, Tabs as RTabs } from 'radix-ui';
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

export type SegmentOption<V extends string> = { value: V; label: ReactNode };

/** Two to four exclusive choices in one row (e.g. «کالا | خدمت», «یک‌رو | دورو»). */
export function SegmentedControl<V extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: V;
  onChange: (v: V) => void;
  options: readonly SegmentOption<V>[];
  label?: string;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('flex h-11 w-full rounded-md bg-muted p-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 rounded-sm text-label-m transition-colors',
            value === o.value ? 'bg-surface text-fg-brand shadow-subtle' : 'text-fg-secondary hover:text-fg-primary',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Tabs<V extends string>({
  value,
  onChange,
  tabs,
  className,
}: {
  value: V;
  onChange: (v: V) => void;
  tabs: readonly { value: V; label: ReactNode; content: ReactNode }[];
  className?: string;
}) {
  return (
    <RTabs.Root value={value} onValueChange={(v) => onChange(v as V)} dir="rtl" className={className}>
      <RTabs.List className="flex border-b border-line">
        {tabs.map((t) => (
          <RTabs.Trigger
            key={t.value}
            value={t.value}
            className="-mb-px h-11 flex-1 border-b-2 border-transparent text-label-m text-fg-secondary data-[state=active]:border-brand data-[state=active]:text-fg-brand"
          >
            {t.label}
          </RTabs.Trigger>
        ))}
      </RTabs.List>
      {tabs.map((t) => (
        <RTabs.Content key={t.value} value={t.value} className="pt-4 outline-none">
          {t.content}
        </RTabs.Content>
      ))}
    </RTabs.Root>
  );
}
