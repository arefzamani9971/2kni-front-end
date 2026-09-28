import type { ReactNode } from 'react';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import type { Status } from '../lib/types';
import { hintId, messageId } from './field-ids';

/** Class overrides per part of a field. */
export type FieldClassNames = Partial<Record<'root' | 'label' | 'box' | 'input' | 'prefix' | 'suffix' | 'message' | 'hint', string>>;

/** Class overrides per status (e.g. a custom warning border): `{ warning: { box: '…', message: '…' } }`. */
export type FieldStatusClassNames = Partial<Record<Status, Partial<Record<'box' | 'message', string>>>>;

export type FieldShellProps = {
  id: string;
  label?: ReactNode;
  hideLabel?: boolean;
  required?: boolean;
  /** Shows «(اختیاری)» after the label. */
  optional?: boolean;
  status?: Status;
  message?: ReactNode;
  hint?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  multiline?: boolean;
  className?: string;
  classNames?: FieldClassNames;
  statusClassNames?: FieldStatusClassNames;
  children: ReactNode;
};

const BOX_STATUS: Record<Status, string> = {
  default: 'border-line focus-within:border-focus focus-within:shadow-[inset_0_0_0_1px_var(--dukani-color-border-focus)]',
  error: 'border-danger focus-within:shadow-[inset_0_0_0_1px_var(--dukani-color-border-danger)]',
  warning: 'border-warning focus-within:shadow-[inset_0_0_0_1px_var(--dukani-color-border-warning)]',
  success: 'border-success focus-within:shadow-[inset_0_0_0_1px_var(--dukani-color-border-success)]',
  info: 'border-info focus-within:shadow-[inset_0_0_0_1px_var(--dukani-color-status-info)]',
};

const MESSAGE_STATUS: Record<Status, string> = {
  default: 'text-fg-secondary',
  error: 'text-danger',
  warning: 'text-warning',
  success: 'text-success',
  info: 'text-info',
};

const MESSAGE_ICON = { error: 'alert-danger', warning: 'alert-warning', success: 'check-circle', info: 'info' } as const;


/**
 * Anatomy (ui-guidelines §19, Figma Production/Text Field 494:18 / Numeric Field 494:226): persistent label (12/Medium),
 * 52px box (radius 12, 1px border; focus 2px), value 14/Regular, message 11px under the field.
 * Error/warning/success change border and message color and always add an icon + text.
 */
export function FieldShell(props: FieldShellProps) {
  const status = props.status ?? 'default';
  const showMessage = props.message !== undefined && props.message !== null && props.message !== '';
  const custom = props.statusClassNames?.[status];
  return (
    <div className={cn('flex w-full flex-col gap-2', props.disabled && 'opacity-45', props.classNames?.root, props.className)}>
      {props.label ? (
        <label
          htmlFor={props.id}
          className={cn('text-label-s text-fg-primary', props.hideLabel && 'sr-only', props.classNames?.label)}
        >
          {props.label}
          {props.required ? <span aria-hidden className="text-danger"> *</span> : null}
          {props.optional ? <span className="text-fg-secondary"> (اختیاری)</span> : null}
        </label>
      ) : null}
      <div
        className={cn(
          'flex w-full items-center gap-2 overflow-hidden rounded-md border bg-surface px-4 transition-[border-color,box-shadow] duration-150',
          props.multiline ? 'min-h-26 items-start py-3' : 'h-field',
          BOX_STATUS[status],
          props.readOnly && 'bg-muted',
          props.classNames?.box,
          custom?.box,
        )}
      >
        {props.prefix ? <span className={cn('flex shrink-0 items-center text-fg-secondary', props.classNames?.prefix)}>{props.prefix}</span> : null}
        {props.children}
        {props.suffix ? <span className={cn('flex shrink-0 items-center text-fg-secondary', props.classNames?.suffix)}>{props.suffix}</span> : null}
      </div>
      {showMessage ? (
        <p
          id={messageId(props.id)}
          aria-live="polite"
          className={cn('flex items-start gap-1 text-caption', MESSAGE_STATUS[status], props.classNames?.message, custom?.message)}
        >
          {status !== 'default' ? <Icon name={MESSAGE_ICON[status]} size={14} className="mt-px" /> : null}
          <span>{props.message}</span>
        </p>
      ) : props.hint ? (
        <p id={hintId(props.id)} className={cn('text-caption text-fg-secondary', props.classNames?.hint)}>
          {props.hint}
        </p>
      ) : null}
    </div>
  );
}
