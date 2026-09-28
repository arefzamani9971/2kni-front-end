'use client';
// Decimal inputs: money (grouped while typing), decimal quantity and percent. Values are canonical
// decimal strings ("12500", "1.5"); floats are never used (BIZ-MNY-01, D17).
import { toPersianDigits } from '@dukani/domain';
import { useId, useLayoutEffect, useRef, useState, type ReactNode, type Ref } from 'react';
import { assignRef } from '../lib/assign-ref';
import { cn } from '../lib/cn';
import type { Status } from '../lib/types';
import { useControllableState } from '../lib/use-controllable';
import { FieldShell, type FieldClassNames, type FieldStatusClassNames } from './FieldShell';
import { hintId, messageId } from './field-ids';
import { toCanonicalDecimal } from './to-canonical-decimal';

export type DecimalInputProps = {
  label?: ReactNode;
  required?: boolean;
  optional?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  status?: Status;
  message?: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  name?: string;
  id?: string;
  ref?: Ref<HTMLInputElement>;
  className?: string;
  classNames?: FieldClassNames;
  statusClassNames?: FieldStatusClassNames;
  /** Maximum digits after the decimal point (0 = whole numbers only). */
  maxDecimals?: number;
  /** Group thousands with «٬» while typing. */
  grouping?: boolean;
  allowNegative?: boolean;
  /** Unit shown at the end of the field (e.g. «تومان», «کیلوگرم»). */
  unit?: ReactNode;
};

const groupThousands = (v: string): string => {
  const negative = v.startsWith('-');
  const [intPart = '', frac] = (negative ? v.slice(1) : v).split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '٬');
  return `${negative ? '-' : ''}${grouped}${frac !== undefined ? `.${frac}` : ''}`;
};

export function DecimalField({ ref, maxDecimals = 0, grouping = false, allowNegative = false, unit, ...props }: DecimalInputProps) {
  const autoId = useId();
  const id = props.id ?? autoId;
  const [value, setValue] = useControllableState({ value: props.value, defaultValue: props.defaultValue ?? '', onChange: props.onChange });
  const [rejected, setRejected] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const caret = useRef<number | null>(null);

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el || caret.current === null) return;
    let seen = 0;
    let pos = 0;
    while (pos < el.value.length && seen < caret.current) {
      if (/[0-9۰-۹.٫-]/.test(el.value[pos]!)) seen++;
      pos++;
    }
    el.setSelectionRange(pos, pos);
    caret.current = null;
  }, [value]);

  const pattern = new RegExp(`^${allowNegative ? '-?' : ''}\\d*${maxDecimals > 0 ? `(\\.\\d{0,${maxDecimals}})?` : ''}$`);

  const onInput = (raw: string, selectionStart: number | null) => {
    const canonical = toCanonicalDecimal(raw);
    if (!pattern.test(canonical)) {
      const hasDot = canonical.includes('.');
      setRejected(
        maxDecimals === 0 && hasDot
          ? 'عدد اعشاری مجاز نیست.'
          : hasDot && /^-?\d*\.\d+$/.test(canonical)
            ? `حداکثر ${maxDecimals} رقم اعشار.`
            : 'فقط عدد وارد کنید.',
      );
      return;
    }
    setRejected(null);
    caret.current = toCanonicalDecimal(raw.slice(0, selectionStart ?? raw.length)).length;
    setValue(canonical);
  };

  const status: Status = rejected ? 'error' : (props.status ?? 'default');
  const message = rejected ?? props.message;
  return (
    <FieldShell
      id={id}
      label={props.label}
      required={props.required}
      optional={props.optional}
      status={status}
      message={message}
      hint={props.hint}
      suffix={unit ? <span className="text-body-m text-fg-secondary">{unit}</span> : undefined}
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
        inputMode={maxDecimals > 0 ? 'decimal' : 'numeric'}
        autoComplete="off"
        placeholder={props.placeholder}
        disabled={props.disabled}
        readOnly={props.readOnly}
        aria-invalid={status === 'error' || undefined}
        aria-describedby={message ? messageId(id) : props.hint ? hintId(id) : undefined}
        value={toPersianDigits(grouping ? groupThousands(value) : value).replace('.', '٫')}
        onBlur={() => {
          if (value.endsWith('.')) setValue(value.slice(0, -1));
          props.onBlur?.();
        }}
        onChange={(e) => onInput(e.target.value, e.target.selectionStart)}
        className={cn('tabular h-full min-w-0 flex-1 bg-transparent text-left text-body-m outline-none placeholder:text-fg-secondary', props.classNames?.input)}
      />
    </FieldShell>
  );
}
