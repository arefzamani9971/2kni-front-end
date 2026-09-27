'use client';
import { normalizeTitle } from '@dukani/domain';
import { useId, useMemo, useState, type ReactNode, type Ref } from 'react';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import type { Status } from '../lib/types';
import { BottomSheet } from '../overlays/BottomSheet';
import { FieldShell, messageId, type FieldClassNames, type FieldStatusClassNames } from './FieldShell';
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
 * Select that looks like the Figma Text Field («انتخاب کنید») and opens a bottom sheet list on mobile
 * (ui-guidelines §22). The chosen option is marked with a check, not by color only.
 */
export function SelectField<V extends string>({ ref, ...props }: SelectFieldProps<V>) {
  const autoId = useId();
  const id = props.id ?? autoId;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = props.options.find((o) => o.value === props.value);
  const searchable = props.searchable ?? props.options.length > 8;
  const filtered = useMemo(() => {
    const q = normalizeTitle(query);
    return q ? props.options.filter((o) => normalizeTitle(`${o.label} ${o.description ?? ''}`).includes(q)) : props.options;
  }, [props.options, query]);

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
        suffix={<Icon name="chevron-down" size={20} className="text-icon" />}
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
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-invalid={props.status === 'error' || undefined}
          aria-describedby={props.message ? messageId(id) : undefined}
          onClick={() => setOpen(true)}
          className={cn(
            'h-full min-w-0 flex-1 truncate bg-transparent text-start text-body-m outline-none',
            selected ? 'text-fg-primary' : 'text-fg-secondary',
            props.classNames?.input,
          )}
        >
          {selected?.label ?? props.placeholder ?? 'انتخاب کنید'}
        </button>
      </FieldShell>
      <BottomSheet
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) {
            setQuery('');
            props.onBlur?.();
          }
        }}
        title={props.sheetTitle ?? props.label}
        full={props.options.length > 8}
      >
        <div className="flex flex-col gap-3">
          {searchable ? <SearchField label="جست‌وجو" hideLabel value={query} onChange={setQuery} autoFocus /> : null}
          <ul role="listbox" aria-label={typeof props.label === 'string' ? props.label : undefined} className="flex flex-col">
            {filtered.map((o) => {
              const isSelected = o.value === props.value;
              return (
                <li key={o.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    disabled={o.disabled}
                    onClick={() => {
                      props.onChange?.(o.value);
                      setOpen(false);
                      setQuery('');
                    }}
                    className={cn(
                      'flex min-h-13 w-full items-center gap-3 border-b border-line px-1 py-3 text-start disabled:opacity-38',
                      isSelected && 'text-fg-brand',
                    )}
                  >
                    <span className="flex flex-1 flex-col">
                      <span className="text-body-m">{o.label}</span>
                      {o.description ? <span className="text-body-s text-fg-secondary">{o.description}</span> : null}
                    </span>
                    {isSelected ? <Icon name="check" size={20} /> : null}
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 ? <li className="py-6 text-center text-body-m text-fg-secondary">موردی پیدا نشد.</li> : null}
          </ul>
          {props.createAction ? (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                props.createAction!.onSelect(query);
              }}
              className="flex min-h-12 items-center gap-2 rounded-md border border-dashed border-line-strong px-4 text-label-m text-fg-brand"
            >
              <Icon name="plus" size={20} />
              {props.createAction.label}
            </button>
          ) : null}
        </div>
      </BottomSheet>
    </>
  );
}
