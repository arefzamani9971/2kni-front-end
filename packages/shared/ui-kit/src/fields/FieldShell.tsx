import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';

import { hintId, messageId } from './field-ids';
import type { FieldShellProps } from './FieldShell.types';
import { BOX_STATUS, MESSAGE_ICON, MESSAGE_STATUS } from './FieldShell.constants';

/**
 * Anatomy (ui-guidelines §19, Figma Production/Text Field 494:18 / Numeric Field 494:226): persistent label (12/Medium),
 * 52px box (radius 12, 1px border; focus 2px), value 14/Regular, message 11px under the field.
 * Error/warning/success change border and message color and always add an icon + text.
 */
export function FieldShell({ boxRef, ...props }: FieldShellProps) {
  const status = props.status ?? 'default';
  const showMessage = props.message !== undefined && props.message !== null && props.message !== '';
  const custom = props.statusClassNames?.[status];
  return (
    <div
      className={cn(
        'flex w-full flex-col gap-2',
        props.disabled && 'opacity-45',
        props.classNames?.root,
        props.className,
      )}
    >
      {props.label ? (
        <label
          htmlFor={props.id}
          className={cn(
            'text-label-s text-fg-primary',
            props.hideLabel && 'sr-only',
            props.classNames?.label,
          )}
        >
          {props.label}
          {props.required ? (
            <span aria-hidden className="text-danger">
              {' '}
              *
            </span>
          ) : null}
          {props.optional ? <span className="text-fg-secondary"> (اختیاری)</span> : null}
        </label>
      ) : null}
      <div
        ref={boxRef}
        className={cn(
          'bg-surface flex w-full items-center gap-2 overflow-hidden rounded-md border px-4 transition-[border-color,box-shadow] duration-150',
          props.multiline ? 'min-h-26 items-start py-3' : 'h-field',
          BOX_STATUS[status],
          props.readOnly && 'bg-muted',
          props.classNames?.box,
          custom?.box,
        )}
      >
        {props.prefix ? (
          <span className={cn('text-fg-secondary flex shrink-0 items-center', props.classNames?.prefix)}>
            {props.prefix}
          </span>
        ) : null}
        {props.children}
        {props.suffix ? (
          <span className={cn('text-fg-secondary flex shrink-0 items-center', props.classNames?.suffix)}>
            {props.suffix}
          </span>
        ) : null}
      </div>
      {showMessage ? (
        <p
          id={messageId(props.id)}
          aria-live="polite"
          className={cn(
            'text-caption flex items-start gap-1',
            MESSAGE_STATUS[status],
            props.classNames?.message,
            custom?.message,
          )}
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
