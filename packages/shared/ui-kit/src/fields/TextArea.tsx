'use client';
import { checkInputFilter, type InputFilter } from '@dukani/domain';
import { useId, useState, type FocusEventHandler, type ReactNode, type Ref } from 'react';
import { cn } from '../lib/cn';
import type { Status } from '../lib/types';
import { useControllableState } from '../lib/use-controllable';
import { FieldShell, hintId, messageId, type FieldClassNames, type FieldStatusClassNames } from './FieldShell';

export type TextAreaProps = {
  label?: ReactNode;
  required?: boolean;
  optional?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: FocusEventHandler<HTMLTextAreaElement>;
  status?: Status;
  message?: ReactNode;
  hint?: ReactNode;
  filter?: InputFilter;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  name?: string;
  id?: string;
  ref?: Ref<HTMLTextAreaElement>;
  className?: string;
  classNames?: FieldClassNames;
  statusClassNames?: FieldStatusClassNames;
  /** Shows «۱۲/۲۰۰» under the field when maxLength is set. */
  showCount?: boolean;
};

export function TextArea({ ref, ...props }: TextAreaProps) {
  const autoId = useId();
  const id = props.id ?? autoId;
  const [value, setValue] = useControllableState({ value: props.value, defaultValue: props.defaultValue ?? '', onChange: props.onChange });
  const [rejected, setRejected] = useState<string | null>(null);
  const status: Status = rejected ? 'error' : (props.status ?? 'default');
  const message = rejected ?? props.message;
  const hint = props.showCount && props.maxLength ? `${value.length}/${props.maxLength}` : props.hint;
  return (
    <FieldShell
      id={id}
      label={props.label}
      required={props.required}
      optional={props.optional}
      status={status}
      message={message}
      hint={hint}
      disabled={props.disabled}
      readOnly={props.readOnly}
      multiline
      className={props.className}
      classNames={props.classNames}
      statusClassNames={props.statusClassNames}
    >
      <textarea
        ref={ref}
        id={id}
        name={props.name}
        rows={props.rows ?? 3}
        maxLength={props.maxLength}
        placeholder={props.placeholder}
        disabled={props.disabled}
        readOnly={props.readOnly}
        aria-invalid={status === 'error' || undefined}
        aria-describedby={message ? messageId(id) : hint ? hintId(id) : undefined}
        value={value}
        onBlur={props.onBlur}
        onChange={(e) => {
          const check = checkInputFilter(props.filter, e.target.value);
          if (!check.accepted) return setRejected(check.message);
          setRejected(null);
          setValue(e.target.value);
        }}
        className={cn('min-w-0 flex-1 resize-none bg-transparent text-body-m outline-none placeholder:text-fg-secondary', props.classNames?.input)}
      />
    </FieldShell>
  );
}
