'use client';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { useLocale } from '@dukani/i18n';
// Fields that show digits in groups while typing (card 4-4-4-4, sheba IR + 6×4) and keep the raw
// digits as their value. The caret is kept after the same number of digits when regrouping.
// Internal to ui-kit: used by CardNumberField and ShebaField, not exported from the package.
import { checkInputFilter, normalizeDigits, toPersianDigits } from '@dukani/domain';
import { type ReactNode, useId, useLayoutEffect, useRef, useState } from 'react';
import { assignRef } from '../lib/assign-ref';
import { cn } from '../lib/cn';
import type { Status } from '../lib/types';
import { useControllableState } from '../lib/use-controllable';
import { FieldShell } from './FieldShell';
import { messageId } from './field-ids';
import type { GroupedProps } from './GroupedDigitsField.types';

const group = (digits: string, size: number) =>
  digits.replace(new RegExp(`(\\d{${size}})(?=\\d)`, 'g'), '$1 ');

export function GroupedDigitsField({
  ref,
  maxDigits,
  groupSize,
  prefix,
  autoComplete,
  ...props
}: GroupedProps & { maxDigits: number; groupSize: number; prefix?: ReactNode; autoComplete?: string }) {
  const t = useUiTranslations();
  const locale = useLocale();
  const autoId = useId();
  const id = props.id ?? autoId;
  const [value, setValue] = useControllableState({
    value: props.value,
    defaultValue: props.defaultValue ?? '',
    onChange: props.onChange,
  });
  const [rejected, setRejected] = useState<'number' | 'maxDigits' | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const caretDigits = useRef<number | null>(null);

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el || caretDigits.current === null) return;
    let seen = 0;
    let pos = 0;
    while (pos < el.value.length && seen < caretDigits.current) {
      if (/[0-9۰-۹]/.test(el.value[pos]!)) seen++;
      pos++;
    }
    el.setSelectionRange(pos, pos);
    caretDigits.current = null;
  }, [value]);

  const status: Status = rejected ? 'error' : (props.status ?? 'default');
  const message = rejected
    ? rejected === 'maxDigits'
      ? t('controls.maxDigits', { count: maxDigits })
      : t('filters.digits')
    : props.message;
  return (
    <FieldShell
      id={id}
      label={props.label}
      required={props.required}
      optional={props.optional}
      status={status}
      message={message}
      hint={props.hint}
      prefix={prefix}
      disabled={props.disabled}
      readOnly={props.readOnly}
      className={props.className}
      classNames={props.classNames}
      statusClassNames={props.statusClassNames}
    >
      <input
        ref={(el) => {
          inputRef.current = el;
          assignRef(ref, el);
        }}
        id={id}
        name={props.name}
        dir="ltr"
        inputMode="numeric"
        autoComplete={autoComplete ?? 'off'}
        placeholder={props.placeholder}
        disabled={props.disabled}
        readOnly={props.readOnly}
        aria-invalid={status === 'error' || undefined}
        aria-describedby={message ? messageId(id) : undefined}
        value={locale === 'fa' ? toPersianDigits(group(value, groupSize)) : group(value, groupSize)}
        onBlur={props.onBlur}
        onChange={(e) => {
          const raw = normalizeDigits(e.target.value).replace(/[\s-]/g, '');
          const check = checkInputFilter('digits', raw);
          if (!check.accepted) return setRejected('number');
          if (raw.length > maxDigits) return setRejected('maxDigits');
          setRejected(null);
          const before = normalizeDigits(
            e.target.value.slice(0, e.target.selectionStart ?? e.target.value.length),
          ).replace(/\D/g, '');
          caretDigits.current = before.length;
          setValue(raw);
        }}
        className={cn(
          'text-body-m placeholder:text-fg-secondary h-full min-w-0 flex-1 bg-transparent text-left tracking-wide outline-none',
          props.classNames?.input,
        )}
      />
    </FieldShell>
  );
}
