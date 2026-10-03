'use client';
import { checkInputFilter } from '@dukani/domain';
import { useId, useState } from 'react';
import { cn } from '../lib/cn';
import type { Status } from '../lib/types';
import { useControllableState } from '../lib/use-controllable';
import { FieldShell } from './FieldShell';
import { hintId, messageId } from './field-ids';
import type { TextAreaProps } from './TextArea.types';

export function TextArea({ ref, ...props }: TextAreaProps) {
  const autoId = useId();
  const id = props.id ?? autoId;
  const [value, setValue] = useControllableState({
    value: props.value,
    defaultValue: props.defaultValue ?? '',
    onChange: props.onChange,
  });
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
        className={cn(
          'text-body-m placeholder:text-fg-secondary min-w-0 flex-1 resize-none bg-transparent outline-none',
          props.classNames?.input,
        )}
      />
    </FieldShell>
  );
}
