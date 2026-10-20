'use client';
import { cn } from '../lib/cn';
import type { AutocompleteOptionsProps } from './AutocompleteOptions.types';
import { AUTOCOMPLETE_ALIGN, gridTracks } from './TableAutocomplete.constants';

/**
 * Desktop suggestions as table rows (Table Autocomplete 1220:1330): a visual header and one `option` per row laid
 * out with CSS grid. The whole row is one target with one accessible name; this is a listbox, not a CRUD grid.
 */
export function AutocompleteTableOptions<T>({
  items,
  columns,
  getItemKey,
  getItemLabel,
  getOptionLabel = getItemLabel,
  isItemDisabled,
  label,
  control,
}: AutocompleteOptionsProps<T>) {
  const style = { gridTemplateColumns: gridTracks(columns.map((column) => column.width)) };
  return (
    <>
      <div
        aria-hidden
        style={style}
        className="border-line text-label-s text-fg-tertiary grid shrink-0 gap-3 border-b px-4 py-2"
      >
        {columns.map((column) => (
          <span key={column.key} className={AUTOCOMPLETE_ALIGN[column.align ?? 'start']}>
            {column.header}
          </span>
        ))}
      </div>
      <ul
        id={control.listId}
        role="listbox"
        aria-label={label}
        className="min-h-0 flex-1 overflow-y-auto p-1"
      >
        {items.map((item, index) => {
          const disabled = isItemDisabled?.(item) ?? false;
          return (
            <li
              key={getItemKey(item)}
              id={control.optionId(index)}
              role="option"
              aria-selected={control.active === index}
              aria-disabled={disabled || undefined}
              aria-label={getOptionLabel(item)}
              style={style}
              onMouseDown={(event) => event.preventDefault()}
              onMouseMove={() => control.setActive(index)}
              onClick={() => control.choose(index)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  control.choose(index);
                }
              }}
              className={cn(
                'text-body-m grid min-h-11 cursor-pointer items-center gap-3 rounded-sm px-3 py-2',
                control.active === index && 'bg-muted',
                disabled && 'text-fg-tertiary cursor-not-allowed',
              )}
            >
              {columns.map((column) => (
                <span
                  key={column.key}
                  className={cn('min-w-0 truncate', AUTOCOMPLETE_ALIGN[column.align ?? 'start'])}
                >
                  {column.render(item)}
                </span>
              ))}
            </li>
          );
        })}
      </ul>
    </>
  );
}
