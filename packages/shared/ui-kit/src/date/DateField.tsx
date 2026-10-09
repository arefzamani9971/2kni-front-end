'use client';
import { formatJalali } from '@dukani/domain';
import { useId, useRef } from 'react';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';

import { DatePickerPanel } from './DatePickerPanel';
import { assignRef } from '../lib/assign-ref';
import { FieldShell } from '../fields/FieldShell';
import { hintId, messageId } from '../fields/field-ids';
import type { DateFieldProps } from './DateField.types';
import { useDatePicker } from './use-date-picker';

/** Persian (Jalali) date picker; the user can also type «۱۴۰۵/۰۷/۰۵». */
export function DateField({ ref, ...props }: DateFieldProps) {
  const autoId = useId();
  const id = props.id ?? autoId;
  const picker = useDatePicker(props);
  const boxRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const value = props.value || null;

  return (
    <>
      <FieldShell
        boxRef={boxRef}
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
          ref={(element) => {
            triggerRef.current = element;
            assignRef(ref, element);
          }}
          id={id}
          name={props.name}
          type="button"
          disabled={props.disabled}
          aria-haspopup="dialog"
          aria-expanded={picker.open}
          aria-invalid={props.status === 'error' || undefined}
          aria-describedby={props.message ? messageId(id) : props.hint ? hintId(id) : undefined}
          onClick={() => picker.onOpenChange(true)}
          className={cn(
            'tabular text-body-m h-full flex-1 text-start outline-none',
            value ? 'text-fg-primary' : 'text-fg-secondary',
          )}
        >
          {value ? formatJalali(value, 'EEEE d MMMM yyyy') : (props.placeholder ?? 'انتخاب تاریخ')}
        </button>
      </FieldShell>
      <DatePickerPanel
        {...picker}
        anchorRef={boxRef}
        triggerRef={triggerRef}
        min={props.min}
        max={props.max}
      />
    </>
  );
}
