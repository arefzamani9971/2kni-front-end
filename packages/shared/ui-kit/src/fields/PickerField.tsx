'use client';
import { useId, type ReactNode, type Ref } from 'react';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import type { Status } from '../lib/types';
import { FieldShell, type FieldClassNames, type FieldStatusClassNames } from './FieldShell';
import { messageId } from './field-ids';

export type PickerFieldProps = {
  label: ReactNode;
  /** Text of the current choice; `placeholder` when empty. */
  display?: ReactNode;
  placeholder?: string;
  /** Opens the picker (a full screen step such as ST02, or a sheet owned by the caller). */
  onOpen: () => void;
  onBlur?: () => void;
  required?: boolean;
  optional?: boolean;
  status?: Status;
  message?: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
  id?: string;
  name?: string;
  ref?: Ref<HTMLButtonElement>;
  className?: string;
  classNames?: FieldClassNames;
  statusClassNames?: FieldStatusClassNames;
};

/**
 * Field-looking trigger for pickers that are not a simple list (store type ST02, product type,
 * supplier, catalog item). Same anatomy and error styling as the Text Field.
 */
export function PickerField({ ref, ...props }: PickerFieldProps) {
  const autoId = useId();
  const id = props.id ?? autoId;
  const empty = props.display === undefined || props.display === null || props.display === '';
  return (
    <FieldShell
      id={id}
      label={props.label}
      required={props.required}
      optional={props.optional}
      status={props.status}
      message={props.message}
      hint={props.hint}
      disabled={props.disabled}
      suffix={<Icon name="chevron-end" size={20} className="text-icon" />}
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
        aria-invalid={props.status === 'error' || undefined}
        aria-describedby={props.message ? messageId(id) : undefined}
        onClick={props.onOpen}
        onBlur={props.onBlur}
        className={cn(
          'h-full min-w-0 flex-1 truncate bg-transparent text-start text-body-m outline-none',
          empty ? 'text-fg-secondary' : 'text-fg-primary',
          props.classNames?.input,
        )}
      >
        {empty ? (props.placeholder ?? 'انتخاب کنید') : props.display}
      </button>
    </FieldShell>
  );
}
