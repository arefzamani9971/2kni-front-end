'use client';
import { checkInputFilter, inputModeFor, normalizeDigits, toPersianDigits } from '@dukani/domain';
import { useId, useState } from 'react';
import { IconButton } from '../primitives/IconButton';
import { cn } from '../lib/cn';
import type { Status } from '../lib/types';
import { useControllableState } from '../lib/use-controllable';
import { FieldShell } from './FieldShell';
import { hintId, messageId } from './field-ids';
import type { TextFieldProps } from './TextField.types';

/** Text Field (Figma 57:15) with character filters, status styling and full a11y wiring. */
export function TextField({ ref, ...props }: TextFieldProps) {
  const autoId = useId();
  const id = props.id ?? autoId;
  const [value, setValue] = useControllableState({
    value: props.value,
    defaultValue: props.defaultValue ?? '',
    onChange: props.onChange,
  });
  const [rejected, setRejected] = useState<string | null>(null);

  const handleChange = (raw: string) => {
    let candidate = props.transform ? props.transform(raw) : raw;
    if (props.asciiDigits) candidate = normalizeDigits(candidate);
    const check = checkInputFilter(props.filter, candidate);
    if (!check.accepted) {
      setRejected(check.message);
      props.onReject?.(check.message);
      return;
    }
    setRejected(null);
    setValue(candidate);
  };

  const status: Status = rejected ? 'error' : (props.status ?? 'default');
  const message = rejected ?? props.message;
  const hasMessage = message !== undefined && message !== null && message !== '';
  const describedBy = hasMessage ? messageId(id) : props.hint ? hintId(id) : undefined;

  const suffix =
    props.clearable && value && !props.disabled && !props.readOnly ? (
      <>
        <IconButton
          icon="close"
          label="پاک کردن"
          size={18}
          className="-me-3"
          onClick={() => handleChange('')}
        />
        {props.suffix}
      </>
    ) : (
      props.suffix
    );

  return (
    <FieldShell
      id={id}
      label={props.label}
      hideLabel={props.hideLabel}
      required={props.required}
      optional={props.optional}
      status={status}
      message={message}
      hint={props.hint}
      prefix={props.prefix}
      suffix={suffix}
      disabled={props.disabled}
      readOnly={props.readOnly}
      className={props.className}
      classNames={props.classNames}
      statusClassNames={props.statusClassNames}
    >
      <input
        ref={ref}
        id={id}
        name={props.name}
        type={props.type ?? 'text'}
        dir={props.dir}
        inputMode={props.inputMode ?? inputModeFor(props.filter)}
        autoComplete={props.autoComplete ?? 'off'}
        placeholder={props.placeholder}
        maxLength={props.maxLength}
        disabled={props.disabled}
        readOnly={props.readOnly}
        autoFocus={props.autoFocus}
        required={props.required}
        aria-invalid={status === 'error' || undefined}
        aria-describedby={describedBy}
        value={props.asciiDigits ? toPersianDigits(value) : value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
        className={cn(
          'text-body-m text-fg-primary placeholder:text-fg-secondary h-full min-w-0 flex-1 bg-transparent outline-none disabled:cursor-not-allowed',
          // LTR values (digits, email) start at the left; the Persian placeholder of an empty field stays right (Figma)
          props.dir === 'ltr' && 'placeholder-shown:text-right text-left [unicode-bidi:plaintext]',
          props.classNames?.input,
        )}
        {...props.inputProps}
      />
    </FieldShell>
  );
}
