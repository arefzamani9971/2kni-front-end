'use client';
import { checkInputFilter, inputModeFor, normalizeDigits, toPersianDigits, type InputFilter } from '@dukani/domain';
import { useId, useState, type FocusEventHandler, type InputHTMLAttributes, type ReactNode, type Ref } from 'react';
import { IconButton } from '../primitives/IconButton';
import { cn } from '../lib/cn';
import type { Status } from '../lib/types';
import { useControllableState } from '../lib/use-controllable';
import { FieldShell, hintId, messageId, type FieldClassNames, type FieldStatusClassNames } from './FieldShell';

export type TextFieldProps = {
  label?: ReactNode;
  hideLabel?: boolean;
  required?: boolean;
  optional?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  status?: Status;
  message?: ReactNode;
  hint?: ReactNode;
  /**
   * Allowed characters: 'digits' (only numbers), 'letters', 'persian-letters' (only Persian letters),
   * 'persian' (Persian text), 'latin', 'alphanumeric', 'decimal', 'email' or `{ pattern, message }`.
   * A forbidden character is rejected (the previous value stays) and the filter message is shown.
   */
  filter?: InputFilter;
  /** Runs before the filter, e.g. to accept `+98` pastes. */
  transform?: (raw: string) => string;
  /** Emit ASCII digits (payload) while showing Persian digits in the field (ui-guidelines §14). */
  asciiDigits?: boolean;
  /** Called when an edit is rejected by the filter. */
  onReject?: (message: string) => void;
  prefix?: ReactNode;
  suffix?: ReactNode;
  clearable?: boolean;
  /** Numbers, codes and URLs are isolated LTR inside the RTL page. */
  dir?: 'rtl' | 'ltr' | 'auto';
  type?: 'text' | 'tel' | 'email' | 'search' | 'url' | 'password';
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  name?: string;
  id?: string;
  ref?: Ref<HTMLInputElement>;
  className?: string;
  classNames?: FieldClassNames;
  statusClassNames?: FieldStatusClassNames;
  /** Escape hatch for attributes not covered above. */
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange'>;
};

/** Text Field (Figma 57:15) with character filters, status styling and full a11y wiring. */
export function TextField({ ref, ...props }: TextFieldProps) {
  const autoId = useId();
  const id = props.id ?? autoId;
  const [value, setValue] = useControllableState({ value: props.value, defaultValue: props.defaultValue ?? '', onChange: props.onChange });
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
        <IconButton icon="close" label="پاک کردن" size={18} className="-me-3" onClick={() => handleChange('')} />
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
          'h-full min-w-0 flex-1 bg-transparent text-body-m text-fg-primary outline-none placeholder:text-fg-secondary disabled:cursor-not-allowed',
          props.dir === 'ltr' && 'text-left [unicode-bidi:plaintext]',
          props.classNames?.input,
        )}
        {...props.inputProps}
      />
    </FieldShell>
  );
}
