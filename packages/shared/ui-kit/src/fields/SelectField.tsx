'use client';
import { normalizeTitle } from '@dukani/domain';
import { useId, useMemo, useRef, useState, type ReactNode, type Ref } from 'react';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import type { Status } from '../lib/types';
import { assignRef } from '../lib/assign-ref';
import { PickerPanel } from '../overlays/PickerPanel';
import { FieldShell, type FieldClassNames, type FieldStatusClassNames } from './FieldShell';
import { messageId } from './field-ids';
import { OptionList } from './OptionList';
import { SearchField } from './SearchField';

export type SelectOption<V extends string = string> = {
  value: V;
  label: string;
  description?: string;
  disabled?: boolean;
};

export type SelectFieldProps<V extends string> = {
  label: ReactNode;
  value?: V | '';
  onChange?: (value: V) => void;
  onBlur?: () => void;
  options: readonly SelectOption<V>[];
  placeholder?: string;
  required?: boolean;
  optional?: boolean;
  status?: Status;
  message?: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
  /** Show a search box in the sheet (default when there are more than 8 options). */
  searchable?: boolean;
  /** Action at the end of the list, e.g. «ساخت نوع جدید». */
  createAction?: { label: string; onSelect: (query: string) => void };
  sheetTitle?: ReactNode;
  id?: string;
  name?: string;
  ref?: Ref<HTMLButtonElement>;
  className?: string;
  classNames?: FieldClassNames;
  statusClassNames?: FieldStatusClassNames;
};

/**
 * Figma `Dukani/Select` (649:666): field-looking trigger with a persistent label; choices open in a bottom sheet
 * on mobile and in a listbox attached to the field on desktop (`PickerPanel`). Same contract and the same
 * `OptionList` on both viewports — the consumer never chooses the presentation. The chosen option is marked with
 * a check, not by color only; hover never selects.
 */
export function SelectField<V extends string>({ ref, ...props }: SelectFieldProps<V>) {
  const autoId = useId();
  const id = props.id ?? autoId;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const boxRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const selected = props.options.find((o) => o.value === props.value);
  const searchable = props.searchable ?? props.options.length > 8;
  const filtered = useMemo(() => {
    const q = normalizeTitle(query);
    return q ? props.options.filter((o) => normalizeTitle(`${o.label} ${o.description ?? ''}`).includes(q)) : props.options;
  }, [props.options, query]);

  const close = () => {
    setOpen(false);
    setQuery('');
    props.onBlur?.();
  };
  const label = typeof props.label === 'string' ? props.label : undefined;

  return (
    <>
      <FieldShell
        id={id}
        label={props.label}
        required={props.required}
        optional={props.optional}
        status={props.status}
        message={props.message}
        hint={props.hint}
        disabled={props.disabled}
        boxRef={boxRef}
        suffix={<Icon name="chevron-down" size={20} className="text-icon" />}
        className={props.className}
        classNames={{
          ...props.classNames,
          box: cn('cursor-pointer', open && 'border-focus shadow-[inset_0_0_0_1px_var(--dukani-color-border-focus)]', props.classNames?.box),
        }}
        statusClassNames={props.statusClassNames}
      >
        <button
          ref={(el) => {
            triggerRef.current = el;
            assignRef(ref, el);
          }}
          id={id}
          name={props.name}
          type="button"
          disabled={props.disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-invalid={props.status === 'error' || undefined}
          aria-describedby={props.message ? messageId(id) : undefined}
          onClick={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault();
              setOpen(true);
            }
          }}
          className={cn(
            'h-full min-w-0 flex-1 truncate bg-transparent text-start text-body-m outline-none',
            selected ? 'text-fg-primary' : 'text-fg-secondary',
            props.classNames?.input,
          )}
        >
          {selected?.label ?? props.placeholder ?? 'انتخاب کنید'}
        </button>
      </FieldShell>
      <PickerPanel
        open={open}
        onOpenChange={(o) => (o ? setOpen(true) : close())}
        title={props.sheetTitle ?? props.label}
        anchorRef={boxRef}
        triggerRef={triggerRef}
        full={props.options.length > 8}
        footer={
          props.createAction ? (
            <button
              type="button"
              onClick={() => {
                const q = query;
                close();
                props.createAction!.onSelect(q);
              }}
              className="flex min-h-control-adaptive w-full items-center gap-2 rounded-sm px-3 text-label-m text-fg-brand hover:bg-brand-subtle"
            >
              <Icon name="plus" size={20} />
              {props.createAction.label}
            </button>
          ) : undefined
        }
      >
        <div className="flex flex-col gap-3">
          {searchable ? <SearchField label="جست‌وجو" hideLabel value={query} onChange={setQuery} autoFocus /> : null}
          <OptionList
            options={filtered}
            value={props.value}
            label={label}
            onSelect={(v) => {
              props.onChange?.(v);
              close();
            }}
          />
        </div>
      </PickerPanel>
    </>
  );
}
