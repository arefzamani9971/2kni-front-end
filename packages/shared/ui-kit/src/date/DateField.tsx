'use client';
import { formatJalali, parseJalaliInput, JALALI_INPUT_MESSAGES, toDateOnly, type DateOnly } from '@dukani/domain';
import { useId, useState, type ReactNode, type Ref } from 'react';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import type { Status } from '../lib/types';
import { BottomSheet } from '../overlays/BottomSheet';
import { Button } from '../primitives/Button';
import { FieldShell, messageId, type FieldClassNames, type FieldStatusClassNames } from '../fields/FieldShell';
import { TextField } from '../fields/TextField';
import { JalaliCalendar } from './JalaliCalendar';

export type DateFieldProps = {
  label: ReactNode;
  /** Gregorian DateOnly (`2026-09-27`); shown and picked as Jalali. */
  value?: DateOnly | '';
  onChange?: (value: DateOnly | '') => void;
  onBlur?: () => void;
  min?: DateOnly;
  max?: DateOnly;
  required?: boolean;
  optional?: boolean;
  status?: Status;
  message?: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
  clearable?: boolean;
  placeholder?: string;
  id?: string;
  name?: string;
  ref?: Ref<HTMLButtonElement>;
  className?: string;
  classNames?: FieldClassNames;
  statusClassNames?: FieldStatusClassNames;
};

/** Persian (Jalali) date picker; the user can also type «۱۴۰۵/۰۷/۰۵». */
export function DateField({ ref, ...props }: DateFieldProps) {
  const autoId = useId();
  const id = props.id ?? autoId;
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [typedError, setTypedError] = useState<string | null>(null);
  const value = props.value || null;

  const commit = (d: DateOnly | '') => {
    props.onChange?.(d);
    setOpen(false);
    props.onBlur?.();
  };

  return (
    <>
      <FieldShell
        id={id}
        label={props.label}
        required={props.required}
        optional={props.optional}
        status={props.status}
        message={props.message}
        hint={props.hint}
        disabled={props.disabled}
        suffix={<Icon name="calendar" size={20} className="text-icon" />}
        className={props.className}
        classNames={{ ...props.classNames, box: cn('cursor-pointer', props.classNames?.box) }}
        statusClassNames={props.statusClassNames}
      >
        <button
          ref={ref}
          id={id}
          name={props.name}
          type="button"
          disabled={props.disabled}
          aria-haspopup="dialog"
          aria-invalid={props.status === 'error' || undefined}
          aria-describedby={props.message ? messageId(id) : undefined}
          onClick={() => {
            setTyped(value ? formatJalali(value) : '');
            setTypedError(null);
            setOpen(true);
          }}
          className={cn('tabular h-full flex-1 text-start text-body-m outline-none', value ? 'text-fg-primary' : 'text-fg-secondary')}
        >
          {value ? formatJalali(value, 'EEEE d MMMM yyyy') : (props.placeholder ?? 'انتخاب تاریخ')}
        </button>
      </FieldShell>
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title={props.label}
        footer={
          <div className="flex gap-2">
            <Button block variant="secondary" onClick={() => commit(toDateOnly(new Date()))}>
              امروز
            </Button>
            {props.clearable || !props.required ? (
              <Button block variant="text" onClick={() => commit('')}>
                پاک کردن
              </Button>
            ) : null}
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <TextField
            label="تاریخ (سال/ماه/روز)"
            value={typed}
            dir="ltr"
            placeholder="۱۴۰۵/۰۷/۰۵"
            filter={{ pattern: /^[0-9۰-۹/-]*$/, message: JALALI_INPUT_MESSAGES.format }}
            status={typedError ? 'error' : 'default'}
            message={typedError ?? undefined}
            onChange={(v) => {
              setTyped(v);
              const r = parseJalaliInput(v);
              if (r.ok) {
                setTypedError(null);
                commit(r.value);
              } else if (v.length >= 8) setTypedError(JALALI_INPUT_MESSAGES[r.error]);
            }}
          />
          <JalaliCalendar mode="single" value={value} onChange={commit} min={props.min} max={props.max} />
        </div>
      </BottomSheet>
    </>
  );
}
